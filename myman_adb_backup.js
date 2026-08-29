// ==UserScript==
// @name         MyManager ADB Backup
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Device backup via local ADB helper — suite menu + overlay.
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const MENU_ID = 'tm-adb-backup-menu-item';
    const OVERLAY_ID = 'tm-adb-backup-overlay';
    const DEFAULT_URL = 'http://127.0.0.1:8765';
    const HELPER_HINT = 'adb-backup\\Start-WebBackup.bat';

    const state = {
        devices: [],
        folders: [],
        sizes: {},
        browsePath: 'sdcard',
        browseSelected: new Set(),
        selectedRows: new Set(),
        running: false,
        ready: false,
        paused: false,
        canRetryFailed: false,
        lastResultShown: false,
        pollTimer: null,
        readyTimer: null,
        connected: false,
    };

    function storageKeys() {
        return window.STORAGE_KEYS || {};
    }

    function getServerUrl() {
        const keys = storageKeys();
        const fromConfig = String(window.config?.adbBackupUrl || '').trim();
        let stored = '';
        if (typeof GM_getValue === 'function') {
            stored = String(GM_getValue('adbBackupUrl', '') || '').trim()
                || String(GM_getValue(keys.ADB_BACKUP_URL || 'tm_adb_backup_url', '') || '').trim();
        }
        return (stored || fromConfig || DEFAULT_URL).replace(/\/+$/, '');
    }

    function isFeatureEnabled(config) {
        return (config || window.config)?.adbBackupEnabled !== false;
    }

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function folderName(path) {
        const parts = String(path || '').replace(/\\/g, '/').split('/');
        return parts[parts.length - 1] || path;
    }

    function formatBytes(bytes) {
        if (bytes == null || bytes < 0) return 'Άγνωστο';
        if (bytes < 1024) return `${bytes.toFixed(0)} B`;
        if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
        if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
        return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    }

    function normalizeDevices(list) {
        if (!list) return [];
        return list.flatMap((item) => {
            if (Array.isArray(item)) return item.filter((d) => d && typeof d === 'object');
            if (item && typeof item === 'object') return [item];
            return [];
        });
    }

    function deviceLabel(d) {
        return d.displayName || d.DisplayName
            || `${d.model || d.Model || '?'} · ${d.serialNumber || d.SerialNumber || '?'}`;
    }

    function deviceSerial(d) {
        return d?.serialNumber || d?.SerialNumber || '';
    }

    function deviceModel(d) {
        return d?.model || d?.Model || '';
    }

    function $(id) {
        const overlay = document.getElementById(OVERLAY_ID);
        return overlay ? overlay.querySelector(`#${id}`) : document.getElementById(id);
    }

    function getXhr() {
        if (typeof GM_xmlhttpRequest === 'function') return GM_xmlhttpRequest;
        if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') {
            return GM.xmlHttpRequest.bind(GM);
        }
        return null;
    }

    function api(path, options = {}) {
        const { timeoutMs = 30000, method = 'GET', body } = options;
        const url = `${getServerUrl()}${path.startsWith('/') ? path : `/${path}`}`;
        const xhr = getXhr();
        return new Promise((resolve, reject) => {
            const fail = (message) => {
                const err = new Error(message || 'Ο τοπικός βοηθός ADB δεν απαντά.');
                err.offline = true;
                reject(err);
            };
            if (!xhr) {
                fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: body || undefined,
                    signal: AbortSignal.timeout(timeoutMs),
                }).then(async (res) => {
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                        const err = new Error(data.error || res.statusText);
                        err.status = res.status;
                        err.data = data;
                        throw err;
                    }
                    resolve(data);
                }).catch((e) => fail(e.message));
                return;
            }
            xhr({
                method,
                url,
                headers: { 'Content-Type': 'application/json' },
                data: body || undefined,
                timeout: timeoutMs,
                onload: (resp) => {
                    let data = {};
                    try { data = JSON.parse(resp.responseText || '{}'); } catch (_) { /* ignore */ }
                    if (resp.status < 200 || resp.status >= 300) {
                        const err = new Error(data.error || resp.statusText || `HTTP ${resp.status}`);
                        err.status = resp.status;
                        err.data = data;
                        reject(err);
                        return;
                    }
                    resolve(data);
                },
                onerror: () => fail(),
                ontimeout: () => fail('Το αίτημα έληξε. Ελέγξτε ότι ο βοηθός ADB τρέχει.'),
            });
        });
    }

    function ensureStyles() {
        if (document.getElementById('tm-adb-backup-styles')) return;
        const style = document.createElement('style');
        style.id = 'tm-adb-backup-styles';
        style.textContent = `
            #${OVERLAY_ID} {
                position: fixed; inset: 0; z-index: 100060;
                display: flex; align-items: center; justify-content: center;
                padding: 16px;
                background: var(--tm-overlay-dim, rgba(0,0,0,0.72));
            }
            .tm-adb-shell {
                width: min(920px, 100%);
                max-height: min(92vh, 880px);
                overflow: auto;
                background: var(--tm-modal-bg, var(--tm-panel-bg, var(--tm-shop-item-bg, #1a1a1a)));
                color: var(--tm-primary-color, #eee);
                border: 1px solid var(--tm-shop-item-border, #333);
                border-radius: 12px;
                box-shadow: 0 18px 48px rgba(0,0,0,0.35);
            }
            .tm-adb-header {
                display: flex; align-items: center; justify-content: space-between;
                gap: 12px; padding: 14px 18px;
                border-bottom: 1px solid var(--tm-shop-item-border, #333);
                position: sticky; top: 0; z-index: 1;
                background: inherit;
            }
            .tm-adb-title { margin: 0; font-size: 1.15rem; font-weight: 700; }
            .tm-adb-sub { margin: 2px 0 0; font-size: 0.82rem; opacity: 0.75; }
            .tm-adb-close {
                border: 0; background: transparent; color: inherit;
                font-size: 1.4rem; line-height: 1; cursor: pointer; padding: 4px 8px;
            }
            .tm-adb-body { padding: 16px 18px 20px; display: grid; gap: 14px; }
            .tm-adb-banner {
                padding: 8px 12px; border-radius: 8px; font-size: 0.9rem;
                background: rgba(220,53,69,0.14); border: 1px solid rgba(220,53,69,0.35);
            }
            .tm-adb-banner.ok {
                background: rgba(25,135,84,0.14); border-color: rgba(25,135,84,0.35);
            }
            .tm-adb-banner.warn {
                background: rgba(255,193,7,0.14); border-color: rgba(255,193,7,0.4);
            }
            .tm-adb-banner.hidden { display: none; }
            .tm-adb-offline {
                padding: 14px; border-radius: 10px;
                background: var(--tm-surface-alt-bg, rgba(255,255,255,0.04));
                border: 1px dashed var(--tm-shop-item-border, #444);
            }
            .tm-adb-offline code {
                display: block; margin: 8px 0; padding: 8px 10px; border-radius: 6px;
                background: rgba(0,0,0,0.25); font-size: 0.82rem;
            }
            .tm-adb-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
            .tm-adb-field { display: grid; gap: 4px; }
            .tm-adb-field label { font-size: 0.78rem; opacity: 0.8; font-weight: 600; }
            .tm-adb-field select, .tm-adb-field input[type="text"] {
                min-width: 220px; flex: 1;
                padding: 7px 10px; border-radius: 8px;
                border: 1px solid var(--tm-input-border, var(--tm-shop-item-border, #444));
                background: var(--tm-input-bg, var(--tm-shop-item-bg, #222));
                color: var(--tm-input-text, inherit);
            }
            .tm-adb-btn {
                padding: 7px 12px; border-radius: 8px; cursor: pointer;
                border: 1px solid var(--tm-shop-item-border, #555);
                background: var(--tm-surface-hover-bg, rgba(255,255,255,0.06));
                color: inherit; font-weight: 600;
            }
            .tm-adb-btn:hover { filter: brightness(1.08); }
            .tm-adb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
            .tm-adb-btn-primary {
                background: var(--tm-success-color, #198754); border-color: transparent; color: #fff;
            }
            .tm-adb-btn-danger {
                background: rgba(220,53,69,0.18); border-color: rgba(220,53,69,0.4);
            }
            .tm-adb-hint { font-size: 0.82rem; opacity: 0.8; margin: 0; }
            .tm-adb-hint.error { color: var(--tm-danger-color, #dc3545); opacity: 1; }
            .tm-adb-hint.ok { color: var(--tm-success-color, #198754); opacity: 1; }
            .tm-adb-meter {
                height: 8px; border-radius: 99px; overflow: hidden;
                background: rgba(255,255,255,0.08);
            }
            .tm-adb-meter-fill {
                height: 100%; width: 0%;
                background: var(--tm-success-color, #198754);
                transition: width 0.2s ease;
            }
            .tm-adb-meter.indeterminate .tm-adb-meter-fill {
                width: 40% !important;
                animation: tm-adb-indeterminate 1.1s ease-in-out infinite;
            }
            @keyframes tm-adb-indeterminate {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(280%); }
            }
            .tm-adb-stats { display: flex; justify-content: space-between; font-size: 0.82rem; opacity: 0.85; }
            .tm-adb-table-wrap { overflow: auto; max-height: 220px; border: 1px solid var(--tm-shop-item-border, #333); border-radius: 8px; }
            .tm-adb-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            .tm-adb-table th, .tm-adb-table td { padding: 6px 8px; text-align: left; border-bottom: 1px solid var(--tm-shop-item-border, #333); }
            .tm-adb-table tr.selected-row { background: rgba(var(--tm-success-color-rgb, 25,135,84), 0.12); }
            .tm-adb-log {
                margin: 0; max-height: 140px; overflow: auto; padding: 8px;
                font-size: 0.75rem; white-space: pre-wrap;
                background: rgba(0,0,0,0.22); border-radius: 8px;
            }
            .tm-adb-recovery {
                display: grid; gap: 8px;
            }
            .tm-adb-recovery-item {
                display: flex; justify-content: space-between; gap: 8px; align-items: center;
                padding: 8px 10px; border-radius: 8px;
                background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.35);
            }
            .tm-adb-browse {
                border: 1px solid var(--tm-shop-item-border, #333); border-radius: 8px; padding: 10px;
                background: var(--tm-surface-alt-bg, rgba(255,255,255,0.03));
            }
            .tm-adb-browse-list { display: grid; gap: 4px; max-height: 180px; overflow: auto; margin: 8px 0; }
            .tm-adb-browse-item {
                padding: 6px 8px; border-radius: 6px; cursor: pointer;
                display: flex; align-items: center; gap: 8px;
            }
            .tm-adb-browse-item:hover, .tm-adb-browse-item.selected {
                background: rgba(255,255,255,0.08);
            }
            details.tm-adb-fold > summary { cursor: pointer; font-weight: 600; margin-bottom: 8px; }
        `;
        document.head.appendChild(style);
    }

    function showBanner(message, type = 'error') {
        const el = $('tm-adb-banner');
        if (!el) return;
        el.textContent = message;
        el.className = `tm-adb-banner ${type}`;
        el.classList.remove('hidden');
    }

    function hideBanner() {
        $('tm-adb-banner')?.classList.add('hidden');
    }

    function selectedDevice() {
        const idx = $('tm-adb-device')?.value;
        return state.devices[Number(idx)] || null;
    }

    function getSelectedFolders() {
        return state.folders.filter((_, i) => {
            const row = $('tm-adb-folder-table')?.querySelector(`input[data-index="${i}"]`);
            return row?.checked;
        });
    }

    function renderFolders() {
        const table = $('tm-adb-folder-table');
        if (!table) return;
        const checkedState = {};
        table.querySelectorAll('input[type="checkbox"]').forEach((c) => {
            const idx = Number(c.dataset.index);
            if (!Number.isNaN(idx) && state.folders[idx]) {
                checkedState[state.folders[idx]] = c.checked;
            }
        });
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        state.folders.forEach((path, index) => {
            const tr = document.createElement('tr');
            const size = state.sizes[path];
            const checked = checkedState[path] !== undefined ? checkedState[path] : true;
            if (state.selectedRows.has(index)) tr.classList.add('selected-row');
            tr.innerHTML = `
                <td><input type="checkbox" data-index="${index}" ${checked ? 'checked' : ''} ${state.running ? 'disabled' : ''}></td>
                <td>${esc(folderName(path))}</td>
                <td>${esc(size?.text || '-')}</td>
                <td>${esc(size?.status || 'Έτοιμο')}</td>
                <td>${esc(path)}</td>`;
            tr.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                if (state.selectedRows.has(index)) state.selectedRows.delete(index);
                else state.selectedRows.add(index);
                renderFolders();
            });
            tbody.appendChild(tr);
        });
        updateFolderTotal();
    }

    function updateFolderTotal() {
        const el = $('tm-adb-folder-total');
        if (!el) return;
        const selected = getSelectedFolders();
        if (selected.length === 0) {
            el.textContent = 'Κανένας φάκελος επιλεγμένος';
            return;
        }
        let total = 0;
        let hasUnknown = false;
        for (const path of selected) {
            const s = state.sizes[path];
            if (s?.bytes != null) total += s.bytes;
            else hasUnknown = true;
        }
        el.textContent = hasUnknown
            ? `${formatBytes(total)}+ επιλεγμένα`
            : `${formatBytes(total)} επιλεγμένα`;
    }

    function addFolderPath(path) {
        const normalized = String(path || '').trim().replace(/^\/+/, '');
        if (!normalized) return;
        const full = normalized.startsWith('sdcard/') ? normalized : `sdcard/${normalized}`;
        if (state.folders.includes(full)) return;
        state.folders.push(full);
        renderFolders();
    }

    function setOffline(offline, message) {
        state.connected = !offline;
        const panel = $('tm-adb-offline');
        const live = $('tm-adb-live');
        if (panel) panel.style.display = offline ? '' : 'none';
        if (live) live.style.display = offline ? 'none' : '';
        if (offline && message) {
            const hint = $('tm-adb-offline-msg');
            if (hint) hint.textContent = message;
        }
    }

    function setUiRunning(running) {
        state.running = running;
        const start = $('tm-adb-start');
        if (start) start.disabled = running || !state.ready;
        ['tm-adb-pause', 'tm-adb-cancel'].forEach((id) => {
            const el = $(id);
            if (el) el.disabled = !running;
        });
        const retry = $('tm-adb-retry');
        if (retry) retry.disabled = running || !state.canRetryFailed;
        ['tm-adb-start-selected', 'tm-adb-refresh', 'tm-adb-device', 'tm-adb-path',
            'tm-adb-save', 'tm-adb-browse', 'tm-adb-sizes'].forEach((id) => {
            const el = $(id);
            if (el) el.disabled = running;
        });
        $('tm-adb-folder-table')?.querySelectorAll('input').forEach((el) => {
            el.disabled = running;
        });
        if (start) start.textContent = running ? 'Αντιγραφή…' : 'Αντίγραφο τώρα';
    }

    function applyActivity(status) {
        const title = $('tm-adb-activity-title');
        const detail = $('tm-adb-activity-detail');
        const file = $('tm-adb-current-file');
        const counts = $('tm-adb-counts');
        if (title) title.textContent = status.activityTitle || status.phase || 'Αναμονή';
        if (detail) detail.textContent = status.activityDetail || status.detail || '';
        if (file) file.textContent = status.currentFile || '';
        const bits = [];
        if (status.folderTotal > 0) {
            bits.push(`φάκελος ${status.folderIndex || 0}/${status.folderTotal}${status.currentFolder ? ` · ${status.currentFolder}` : ''}`);
        }
        if (status.fileTotal > 0) {
            bits.push(`αρχείο ${status.fileIndex || 0}/${status.fileTotal}`);
        }
        if (counts) counts.textContent = bits.join('  ');
    }

    function renderRecovery(interrupted) {
        const panel = $('tm-adb-recovery');
        if (!panel) return;
        const items = interrupted || [];
        if (!items.length) {
            panel.innerHTML = '';
            panel.style.display = 'none';
            return;
        }
        panel.style.display = '';
        panel.innerHTML = items.map((item) => `
            <div class="tm-adb-recovery-item">
                <span>Διακόπηκε · ${esc(item.folderName || item.deviceSerial || 'backup')}</span>
                <span class="tm-adb-row">
                    <button type="button" class="tm-adb-btn tm-adb-resume" data-dir="${esc(item.backupDir)}" data-serial="${esc(item.deviceSerial || '')}">Συνέχεια</button>
                    <button type="button" class="tm-adb-btn tm-adb-dismiss" data-dir="${esc(item.backupDir)}">Απόρριψη</button>
                </span>
            </div>`).join('');
    }

    function applyStatus(status) {
        applyActivity(status);
        const detail = $('tm-adb-progress-detail');
        const eta = $('tm-adb-eta');
        if (detail) detail.textContent = status.detail || '0.00 GB';
        if (eta) eta.textContent = status.eta || '';
        const meter = $('tm-adb-meter');
        const fill = $('tm-adb-meter-fill');
        if (meter && fill) {
            if (!status.running) {
                meter.classList.remove('indeterminate');
                fill.style.width = status.percent >= 0
                    ? `${Math.max(0, Math.min(100, status.percent))}%`
                    : '100%';
            } else if (status.percent < 0) {
                meter.classList.add('indeterminate');
                fill.style.width = '';
            } else {
                meter.classList.remove('indeterminate');
                fill.style.width = `${Math.max(0, Math.min(100, status.percent || 0))}%`;
            }
        }
        if (status.folderStatuses) {
            state.folders.forEach((path) => {
                const info = status.folderStatuses[path];
                if (info) {
                    state.sizes[path] = {
                        ...(state.sizes[path] || {}),
                        status: info.Status || info.status,
                    };
                }
            });
            renderFolders();
        }
        const log = $('tm-adb-log');
        if (log && status.logs?.length) {
            log.textContent = status.logs.join('\n');
            log.scrollTop = log.scrollHeight;
        }
        const openBtn = $('tm-adb-open');
        if (openBtn && status.backupDir) {
            openBtn.disabled = false;
            openBtn.dataset.path = status.backupDir;
        }
        if (status.result && !status.running) {
            setUiRunning(false);
            if (!state.lastResultShown) {
                state.lastResultShown = true;
                const r = status.result;
                const ok = r.Success || r.success;
                showBanner(r.Message || r.message || (ok ? 'Το αντίγραφο ολοκληρώθηκε.' : 'Ολοκληρώθηκε με σφάλματα.'), ok ? 'ok' : 'warn');
            }
            refreshReadiness();
        } else if (!status.running) {
            state.lastResultShown = false;
        }
        setUiRunning(!!status.running);
        state.canRetryFailed = !!status.canRetryFailed;
        const retry = $('tm-adb-retry');
        if (retry) retry.disabled = status.running || !state.canRetryFailed;
        renderRecovery(status.interruptedBackups);
        if (typeof status.paused === 'boolean') {
            state.paused = status.paused;
            const pause = $('tm-adb-pause');
            if (pause) pause.textContent = status.paused ? 'Συνέχεια' : 'Παύση';
        }
    }

    async function refreshReadiness() {
        try {
            const device = selectedDevice();
            const path = $('tm-adb-path')?.value.trim() || '';
            const qs = new URLSearchParams();
            if (device) qs.set('device', deviceSerial(device));
            if (path) qs.set('path', path);
            const data = await api(`/api/ready?${qs}`, { timeoutMs: 15000 });
            setOffline(false);
            state.ready = !!data.ready && !data.running;
            const hint = $('tm-adb-hint');
            if (hint) {
                if (data.running) {
                    hint.textContent = 'Μεταφορά σε εξέλιξη';
                    hint.className = 'tm-adb-hint';
                } else if (data.ready) {
                    const name = data.device?.model || data.device?.displayName || 'συσκευή';
                    hint.textContent = `${name} · ${data.folderCount || 0} φάκελοι — έτοιμο`;
                    hint.className = 'tm-adb-hint ok';
                } else {
                    const firstError = (data.checks || []).find((c) => c.level === 'error');
                    hint.textContent = firstError?.message || 'Συνδέστε το τηλέφωνο με USB debugging.';
                    hint.className = 'tm-adb-hint error';
                }
            }
            const start = $('tm-adb-start');
            if (start) start.disabled = !state.ready || state.running;
            renderRecovery(data.interruptedBackups);
        } catch (err) {
            setOffline(true, err.message);
            state.ready = false;
            const start = $('tm-adb-start');
            if (start) start.disabled = true;
        }
    }

    async function loadSettingsFromHelper() {
        const settings = await api('/api/settings');
        const pathEl = $('tm-adb-path');
        if (pathEl) pathEl.value = settings.BackupBaseDir || settings.backupBaseDir || '';
        state.folders = (settings.BackupFolders || settings.backupFolders || []).map(String);
        state.sizes = {};
        renderFolders();
    }

    async function refreshDevices() {
        const statusEl = $('tm-adb-device-status');
        if (statusEl) {
            statusEl.className = 'tm-adb-hint';
            statusEl.textContent = 'Σάρωση συσκευών…';
        }
        try {
            const data = await api('/api/devices');
            setOffline(false);
            state.devices = normalizeDevices(data.devices);
            const select = $('tm-adb-device');
            if (select) {
                select.innerHTML = '';
                if (state.devices.length === 0) {
                    select.innerHTML = '<option value="">Καμία συσκευή</option>';
                    if (statusEl) {
                        statusEl.className = 'tm-adb-hint error';
                        statusEl.textContent = 'Δεν βρέθηκε συσκευή. Ενεργοποιήστε USB debugging.';
                    }
                } else {
                    state.devices.forEach((d, i) => {
                        const opt = document.createElement('option');
                        opt.value = String(i);
                        opt.textContent = deviceLabel(d);
                        select.appendChild(opt);
                    });
                    if (statusEl) {
                        statusEl.className = 'tm-adb-hint ok';
                        statusEl.textContent = state.devices.length > 1
                            ? `${state.devices.length} συσκευές`
                            : 'Συνδεδεμένο';
                    }
                }
            }
        } catch (err) {
            setOffline(true, err.message);
            if (statusEl) {
                statusEl.className = 'tm-adb-hint error';
                statusEl.textContent = err.message;
            }
            return;
        }
        await refreshReadiness();
    }

    async function saveHelperSettings(silent) {
        await api('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({
                backupBaseDir: $('tm-adb-path')?.value.trim() || '',
                backupFolders: state.folders,
            }),
        });
        if (!silent) showBanner('Οι ρυθμίσεις αποθηκεύτηκαν στον βοηθό.', 'ok');
        await refreshReadiness();
    }

    async function previewSizes() {
        const device = selectedDevice();
        if (!device) return showBanner('Συνδέστε συσκευή πρώτα.');
        const selected = getSelectedFolders();
        if (selected.length === 0) return showBanner('Επιλέξτε τουλάχιστον έναν φάκελο.');
        const btn = $('tm-adb-sizes');
        if (btn) btn.disabled = true;
        try {
            const data = await api('/api/folders/sizes', {
                method: 'POST',
                timeoutMs: 120000,
                body: JSON.stringify({ device: deviceSerial(device), folders: selected }),
            });
            const sizes = data.sizes || {};
            Object.keys(sizes).forEach((path) => {
                const item = sizes[path] || {};
                const bytes = item.bytes ?? item.Bytes ?? null;
                state.sizes[path] = {
                    bytes,
                    text: bytes != null ? formatBytes(bytes) : 'Άγνωστο',
                    status: 'Έτοιμο',
                };
            });
            renderFolders();
            hideBanner();
        } catch (err) {
            showBanner(err.message);
        } finally {
            if (btn) btn.disabled = state.running;
        }
    }

    async function loadBrowseList(deviceId) {
        const data = await api(`/api/folders?device=${encodeURIComponent(deviceId)}&path=${encodeURIComponent(state.browsePath)}`);
        state.browsePath = data.currentPath || state.browsePath;
        const pathEl = $('tm-adb-browse-path');
        if (pathEl) pathEl.textContent = `/${state.browsePath}`;
        const list = $('tm-adb-browse-list');
        if (!list) return;
        list.innerHTML = '';
        state.browseSelected.clear();
        const folders = data.folders || [];
        if (!folders.length) {
            list.innerHTML = '<div class="tm-adb-browse-item">(Δεν υπάρχουν υποφάκελοι)</div>';
            return;
        }
        folders.forEach((f) => {
            const path = f.path || f.Path || f;
            const name = f.name || f.Name || folderName(path);
            const div = document.createElement('div');
            div.className = 'tm-adb-browse-item';
            div.innerHTML = `<input type="checkbox"><span>${esc(name)}</span>`;
            div.dataset.path = path;
            div.addEventListener('dblclick', () => {
                state.browsePath = path;
                loadBrowseList(deviceId);
            });
            div.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) state.browseSelected.add(path);
                else state.browseSelected.delete(path);
                div.classList.toggle('selected', e.target.checked);
            });
            list.appendChild(div);
        });
    }

    async function openBrowse() {
        const device = selectedDevice();
        if (!device) return showBanner('Συνδέστε συσκευή πρώτα.');
        const box = $('tm-adb-browse');
        if (box) box.style.display = '';
        state.browsePath = 'sdcard';
        await loadBrowseList(deviceSerial(device));
    }

    async function backupNow() {
        hideBanner();
        state.lastResultShown = false;
        const log = $('tm-adb-log');
        if (log) log.textContent = '';
        const fill = $('tm-adb-meter-fill');
        if (fill) fill.style.width = '0%';
        try {
            const device = selectedDevice();
            const body = {};
            if (device) body.deviceSerial = deviceSerial(device);
            const path = $('tm-adb-path')?.value.trim();
            if (path) body.backupBaseDir = path;
            const data = await api('/api/backup/auto', {
                method: 'POST',
                timeoutMs: 30000,
                body: JSON.stringify(body),
            });
            if (data.ok === false || data.ready === false) {
                showBanner((data.checks || []).find((c) => c.level === 'error')?.message || 'Δεν είναι έτοιμο.');
                return;
            }
            setUiRunning(true);
        } catch (err) {
            if (err.status === 409 && err.data) {
                showBanner((err.data.checks || []).find((c) => c.level === 'error')?.message || 'Δεν είναι έτοιμο.');
            } else {
                showBanner(err.message);
            }
        }
    }

    async function startSelected() {
        const device = selectedDevice();
        if (!device) return showBanner('Συνδέστε συσκευή πρώτα.');
        const selected = getSelectedFolders();
        if (selected.length === 0) return showBanner('Επιλέξτε τουλάχιστον έναν φάκελο.');
        const backupBaseDir = $('tm-adb-path')?.value.trim();
        if (!backupBaseDir) return showBanner('Ορίστε φάκελο προορισμού.');
        hideBanner();
        state.lastResultShown = false;
        try {
            await api('/api/backup/start', {
                method: 'POST',
                timeoutMs: 30000,
                body: JSON.stringify({
                    deviceSerial: deviceSerial(device),
                    deviceModel: deviceModel(device),
                    backupBaseDir,
                    allFolders: state.folders,
                    selectedFolders: selected,
                    skipSizeCalculation: true,
                }),
            });
            setUiRunning(true);
        } catch (err) {
            showBanner(err.message);
        }
    }

    function stopPolling() {
        if (state.pollTimer) clearInterval(state.pollTimer);
        if (state.readyTimer) clearInterval(state.readyTimer);
        state.pollTimer = null;
        state.readyTimer = null;
    }

    function startPolling() {
        stopPolling();
        state.pollTimer = setInterval(async () => {
            if (!document.getElementById(OVERLAY_ID)) {
                stopPolling();
                return;
            }
            try {
                const status = await api('/api/backup/status', { timeoutMs: 10000 });
                applyStatus(status);
            } catch (_) { /* helper busy */ }
        }, 1000);
        state.readyTimer = setInterval(() => {
            if (!state.running) refreshReadiness();
        }, 3000);
    }

    function wireOverlay(overlay) {
        overlay.querySelector('#tm-adb-close')?.addEventListener('click', closeAdbBackupModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAdbBackupModal();
        });
        $('tm-adb-retry-connect')?.addEventListener('click', () => initOverlayData());
        $('tm-adb-open-ui')?.addEventListener('click', () => {
            window.open(getServerUrl(), '_blank', 'noopener');
        });
        $('tm-adb-start')?.addEventListener('click', backupNow);
        $('tm-adb-start-selected')?.addEventListener('click', startSelected);
        $('tm-adb-refresh')?.addEventListener('click', refreshDevices);
        $('tm-adb-device')?.addEventListener('change', refreshReadiness);
        $('tm-adb-path')?.addEventListener('change', refreshReadiness);
        $('tm-adb-save')?.addEventListener('click', () => saveHelperSettings(false).catch((e) => showBanner(e.message)));
        $('tm-adb-select-all')?.addEventListener('click', () => {
            $('tm-adb-folder-table')?.querySelectorAll('input[type="checkbox"]').forEach((c) => { c.checked = true; });
            updateFolderTotal();
        });
        $('tm-adb-clear-all')?.addEventListener('click', () => {
            $('tm-adb-folder-table')?.querySelectorAll('input[type="checkbox"]').forEach((c) => { c.checked = false; });
            updateFolderTotal();
        });
        $('tm-adb-add-folder')?.addEventListener('click', () => {
            const path = window.prompt('Φάκελος στο τηλέφωνο (π.χ. sdcard/Music):', 'sdcard/');
            if (path) addFolderPath(path);
        });
        $('tm-adb-remove-folder')?.addEventListener('click', () => {
            if (state.selectedRows.size === 0) return showBanner('Κάντε κλικ σε μια γραμμή για επιλογή φακέλου.');
            state.folders = state.folders.filter((_, i) => !state.selectedRows.has(i));
            state.selectedRows.clear();
            renderFolders();
        });
        $('tm-adb-folder-table')?.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) updateFolderTotal();
        });
        $('tm-adb-browse-btn')?.addEventListener('click', () => openBrowse().catch((e) => showBanner(e.message)));
        $('tm-adb-sizes')?.addEventListener('click', previewSizes);
        $('tm-adb-browse-up')?.addEventListener('click', async () => {
            if (state.browsePath === 'sdcard') return;
            const parts = state.browsePath.split('/');
            parts.pop();
            state.browsePath = parts.join('/') || 'sdcard';
            const device = selectedDevice();
            if (device) await loadBrowseList(deviceSerial(device));
        });
        $('tm-adb-browse-refresh')?.addEventListener('click', () => {
            const device = selectedDevice();
            if (device) loadBrowseList(deviceSerial(device));
        });
        $('tm-adb-browse-add-here')?.addEventListener('click', () => addFolderPath(state.browsePath));
        $('tm-adb-browse-add-sel')?.addEventListener('click', () => {
            state.browseSelected.forEach((p) => addFolderPath(p));
        });
        $('tm-adb-browse-close')?.addEventListener('click', () => {
            const box = $('tm-adb-browse');
            if (box) box.style.display = 'none';
        });
        $('tm-adb-pause')?.addEventListener('click', async () => {
            const paused = !state.paused;
            await api(paused ? '/api/backup/pause' : '/api/backup/resume', { method: 'POST' });
            state.paused = paused;
            const pause = $('tm-adb-pause');
            if (pause) pause.textContent = paused ? 'Συνέχεια' : 'Παύση';
        });
        $('tm-adb-cancel')?.addEventListener('click', async () => {
            try {
                $('tm-adb-cancel').disabled = true;
                await api('/api/backup/cancel', { method: 'POST', timeoutMs: 30000 });
            } catch (err) {
                showBanner(err.message);
                $('tm-adb-cancel').disabled = !state.running;
            }
        });
        $('tm-adb-retry')?.addEventListener('click', async () => {
            const device = selectedDevice();
            if (!device) return showBanner('Συνδέστε συσκευή πρώτα.');
            try {
                await api('/api/backup/retry-failed', {
                    method: 'POST',
                    timeoutMs: 30000,
                    body: JSON.stringify({
                        deviceSerial: deviceSerial(device),
                        deviceModel: deviceModel(device),
                        backupBaseDir: $('tm-adb-path')?.value.trim(),
                    }),
                });
                setUiRunning(true);
            } catch (err) {
                showBanner(err.message);
            }
        });
        $('tm-adb-open')?.addEventListener('click', async () => {
            const path = $('tm-adb-open')?.dataset.path;
            if (!path) return;
            try {
                await api('/api/open-folder', { method: 'POST', body: JSON.stringify({ path }) });
            } catch (err) {
                showBanner(err.message);
            }
        });
        $('tm-adb-recovery')?.addEventListener('click', async (e) => {
            const resumeBtn = e.target.closest('.tm-adb-resume');
            const dismissBtn = e.target.closest('.tm-adb-dismiss');
            if (resumeBtn) {
                try {
                    await api('/api/backup/resume-interrupted', {
                        method: 'POST',
                        body: JSON.stringify({
                            backupDir: resumeBtn.dataset.dir,
                            deviceSerial: resumeBtn.dataset.serial,
                        }),
                    });
                    setUiRunning(true);
                    hideBanner();
                } catch (err) {
                    showBanner(err.message);
                }
            }
            if (dismissBtn) {
                try {
                    await api('/api/backup/dismiss-interrupted', {
                        method: 'POST',
                        body: JSON.stringify({ backupDir: dismissBtn.dataset.dir }),
                    });
                    refreshReadiness();
                } catch (err) {
                    showBanner(err.message);
                }
            }
        });
    }

    async function initOverlayData() {
        try {
            await loadSettingsFromHelper();
            await refreshDevices();
            const status = await api('/api/backup/status');
            applyStatus(status);
            if (status.running) setUiRunning(true);
            setOffline(false);
            hideBanner();
        } catch (err) {
            setOffline(true, err.message);
        }
        startPolling();
    }

    function overlayHtml() {
        return `
            <div class="tm-adb-shell" role="dialog" aria-modal="true" aria-labelledby="tm-adb-title">
                <header class="tm-adb-header">
                    <div>
                        <h2 class="tm-adb-title" id="tm-adb-title">Αντίγραφο συσκευής</h2>
                        <p class="tm-adb-sub">ADB backup μέσω τοπικού βοηθού</p>
                    </div>
                    <button type="button" class="tm-adb-close" id="tm-adb-close" aria-label="Κλείσιμο">×</button>
                </header>
                <div class="tm-adb-body">
                    <div id="tm-adb-banner" class="tm-adb-banner hidden"></div>
                    <div id="tm-adb-offline" class="tm-adb-offline">
                        <strong>Ο τοπικός βοηθός δεν τρέχει.</strong>
                        <p id="tm-adb-offline-msg" class="tm-adb-hint">Ξεκινήστε τον βοηθό ADB σε αυτόν τον υπολογιστή.</p>
                        <code>${esc(HELPER_HINT)}</code>
                        <p class="tm-adb-hint">Προεπιλογή: ${esc(DEFAULT_URL)}</p>
                        <div class="tm-adb-row">
                            <button type="button" class="tm-adb-btn tm-adb-btn-primary" id="tm-adb-retry-connect">Επανάληψη σύνδεσης</button>
                            <button type="button" class="tm-adb-btn" id="tm-adb-open-ui">Άνοιγμα UI βοηθού</button>
                        </div>
                    </div>
                    <div id="tm-adb-live">
                        <div class="tm-adb-row">
                            <div class="tm-adb-field" style="flex:1">
                                <label for="tm-adb-device">Συσκευή</label>
                                <select id="tm-adb-device"></select>
                            </div>
                            <button type="button" class="tm-adb-btn" id="tm-adb-refresh">Ανανέωση</button>
                        </div>
                        <p id="tm-adb-device-status" class="tm-adb-hint">Σύνδεση USB · ενεργοποιήστε debugging</p>
                        <p id="tm-adb-hint" class="tm-adb-hint">Αρχικοποίηση…</p>
                        <div class="tm-adb-field">
                            <label for="tm-adb-path">Προορισμός αντιγράφου</label>
                            <div class="tm-adb-row">
                                <input id="tm-adb-path" type="text" placeholder="F:\\SMARTPHONES\\ADB_SCRIPT">
                                <button type="button" class="tm-adb-btn" id="tm-adb-save">Αποθήκευση</button>
                            </div>
                        </div>
                        <div id="tm-adb-recovery" class="tm-adb-recovery" style="display:none"></div>
                        <div>
                            <p id="tm-adb-activity-title" class="tm-adb-hint" style="font-weight:700">Αναμονή</p>
                            <p id="tm-adb-activity-detail" class="tm-adb-hint"></p>
                            <p id="tm-adb-current-file" class="tm-adb-hint"></p>
                            <p id="tm-adb-counts" class="tm-adb-hint"></p>
                            <div id="tm-adb-meter" class="tm-adb-meter"><div id="tm-adb-meter-fill" class="tm-adb-meter-fill"></div></div>
                            <div class="tm-adb-stats">
                                <span id="tm-adb-progress-detail">0.00 GB</span>
                                <span id="tm-adb-eta"></span>
                            </div>
                        </div>
                        <div class="tm-adb-row">
                            <button type="button" class="tm-adb-btn tm-adb-btn-primary" id="tm-adb-start" disabled>Αντίγραφο τώρα</button>
                            <button type="button" class="tm-adb-btn" id="tm-adb-start-selected">Επιλεγμένοι φάκελοι</button>
                            <button type="button" class="tm-adb-btn" id="tm-adb-pause" disabled>Παύση</button>
                            <button type="button" class="tm-adb-btn tm-adb-btn-danger" id="tm-adb-cancel" disabled>Ακύρωση</button>
                            <button type="button" class="tm-adb-btn" id="tm-adb-retry" disabled>Επανάληψη αποτυχιών</button>
                            <button type="button" class="tm-adb-btn" id="tm-adb-open" disabled>Άνοιγμα φακέλου</button>
                        </div>
                        <details class="tm-adb-fold" open>
                            <summary>Φάκελοι</summary>
                            <div class="tm-adb-table-wrap">
                                <table class="tm-adb-table" id="tm-adb-folder-table">
                                    <thead><tr><th></th><th>Όνομα</th><th>Μέγεθος</th><th>Κατάσταση</th><th>Διαδρομή</th></tr></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div class="tm-adb-row" style="margin-top:8px">
                                <button type="button" class="tm-adb-btn" id="tm-adb-select-all">Όλα</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-clear-all">Κανένα</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-add-folder">+</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-remove-folder">−</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-browse-btn">Περιήγηση</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-sizes">Μέγεθος</button>
                            </div>
                            <p id="tm-adb-folder-total" class="tm-adb-hint"></p>
                            <div id="tm-adb-browse" class="tm-adb-browse" style="display:none">
                                <div class="tm-adb-row">
                                    <strong>Περιήγηση συσκευής</strong>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-browse-close">Κλείσιμο</button>
                                </div>
                                <p id="tm-adb-browse-path" class="tm-adb-hint">/sdcard</p>
                                <div id="tm-adb-browse-list" class="tm-adb-browse-list"></div>
                                <div class="tm-adb-row">
                                    <button type="button" class="tm-adb-btn" id="tm-adb-browse-up">↑</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-browse-refresh">↻</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-browse-add-here">Προσθήκη εδώ</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-browse-add-sel">Προσθήκη επιλογής</button>
                                </div>
                            </div>
                        </details>
                        <details class="tm-adb-fold">
                            <summary>Καταγραφή</summary>
                            <pre id="tm-adb-log" class="tm-adb-log"></pre>
                        </details>
                    </div>
                </div>
            </div>`;
    }

    function closeAdbBackupModal() {
        stopPolling();
        document.getElementById(OVERLAY_ID)?.remove();
        document.removeEventListener('keydown', onEscape, true);
    }

    function onEscape(e) {
        if (e.key === 'Escape') closeAdbBackupModal();
    }

    function showAdbBackupModal() {
        ensureStyles();
        closeAdbBackupModal();
        const overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.innerHTML = overlayHtml();
        document.body.appendChild(overlay);
        document.addEventListener('keydown', onEscape, true);
        wireOverlay(overlay);
        setOffline(true, 'Σύνδεση με τον τοπικό βοηθό…');
        initOverlayData();
    }

    function findMenuInsertPoint(menu) {
        const laptop = document.getElementById('tm-laptop-catalog-menu-item');
        if (laptop?.parentElement === menu) return laptop.nextElementSibling;
        const phone = document.getElementById('tm-phone-catalog-menu-item');
        if (phone?.parentElement === menu) return phone.nextElementSibling;
        const manageItem = menu.querySelector('[data-tm-manage-hidden="true"]');
        if (manageItem) {
            const separator = manageItem.previousElementSibling;
            if (separator?.getAttribute('data-tm-special') === 'true') return separator;
            return manageItem;
        }
        return null;
    }

    function ensureAdbBackupMenuItem(config) {
        const menu = document.querySelector('.rnr-b-vmenu.simple.main');
        if (!menu) return false;

        let item = document.getElementById(MENU_ID);
        if (!isFeatureEnabled(config)) {
            if (item) item.style.display = 'none';
            return true;
        }

        const label = 'Αντίγραφο συσκευής';
        if (!item) {
            item = typeof window.createSuiteMenuItem === 'function'
                ? window.createSuiteMenuItem(
                    menu.querySelector(':scope > li:not(.menuGroup):not([data-tm-special]):not([data-tm-suite-item])'),
                    label,
                    'adb-backup'
                )
                : (() => {
                    const li = document.createElement('li');
                    li.innerHTML = `<div><div><a href="#">${label}</a></div></div>`;
                    return li;
                })();
            item.id = MENU_ID;
            item.setAttribute('data-tm-suite-item', 'adb-backup');
            item.setAttribute('data-menu-id', 'suite-adb-backup');
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showAdbBackupModal();
            });
            const insertBefore = findMenuInsertPoint(menu);
            if (insertBefore) menu.insertBefore(item, insertBefore);
            else menu.appendChild(item);
        } else {
            const link = item.querySelector('a[href]');
            if (link && typeof window.populateSuiteMenuLink === 'function') {
                window.populateSuiteMenuLink(link, label, 'adb-backup');
            }
            if (!item.parentElement) {
                const insertBefore = findMenuInsertPoint(menu);
                if (insertBefore) menu.insertBefore(item, insertBefore);
                else menu.appendChild(item);
            }
        }
        item.style.display = '';
        return true;
    }

    function initAdbBackupFeature(config) {
        if (!isFeatureEnabled(config)) {
            document.getElementById(MENU_ID)?.remove();
            closeAdbBackupModal();
            return;
        }
        let attempts = 0;
        const maxAttempts = 80;
        let observer = null;
        const tryInject = () => {
            attempts += 1;
            if (ensureAdbBackupMenuItem(config)) {
                observer?.disconnect();
                return;
            }
            if (attempts >= maxAttempts) observer?.disconnect();
        };
        tryInject();
        observer = new MutationObserver(tryInject);
        const leftPanel = document.querySelector('.rnr-left') || document.body;
        observer.observe(leftPanel, { childList: true, subtree: true });
        setTimeout(() => observer?.disconnect(), 10000);
    }

    function updateAdbBackupMenuVisibility(config) {
        if (!isFeatureEnabled(config)) {
            document.getElementById(MENU_ID)?.remove();
            closeAdbBackupModal();
            return;
        }
        ensureAdbBackupMenuItem(config);
    }

    window.initAdbBackupFeature = initAdbBackupFeature;
    window.updateAdbBackupMenuVisibility = updateAdbBackupMenuVisibility;
    window.showAdbBackupModal = showAdbBackupModal;
})();
