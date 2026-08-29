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
    const ORDER_BTN_ID = 'tm-adb-backup-order-btn';
    const ORDER_WRAP_ID = 'tm-adb-backup-order-wrap';
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

    function friendlyFolderName(path) {
        const leaf = folderName(path).toLowerCase();
        const map = {
            dcim: 'Κάμερα',
            camera: 'Κάμερα',
            pictures: 'Εικόνες',
            movies: 'Βίντεο',
            video: 'Βίντεο',
            videos: 'Βίντεο',
            download: 'Λήψεις',
            downloads: 'Λήψεις',
            documents: 'Έγγραφα',
            whatsapp: 'WhatsApp',
            viber: 'Viber',
            music: 'Μουσική',
            screenshots: 'Στιγμιότυπα',
            screenshot: 'Στιγμιότυπα',
        };
        return map[leaf] || folderName(path);
    }

    function folderIcon(path) {
        const leaf = folderName(path).toLowerCase();
        if (leaf === 'dcim' || leaf === 'camera' || leaf === 'screenshots' || leaf === 'screenshot') return '📷';
        if (leaf === 'pictures') return '🖼️';
        if (leaf === 'movies' || leaf === 'video' || leaf === 'videos') return '🎬';
        if (leaf === 'download' || leaf === 'downloads') return '📥';
        if (leaf === 'documents') return '📄';
        if (leaf === 'whatsapp' || leaf === 'viber') return '💬';
        if (leaf === 'music') return '🎵';
        return '📁';
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
        let style = document.getElementById('tm-adb-backup-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-adb-backup-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            #${OVERLAY_ID} {
                position: fixed; inset: 0; z-index: 100060;
                display: flex; align-items: center; justify-content: center;
                padding: 10px;
                background: var(--tm-overlay-dim, rgba(0,0,0,0.78));
            }
            .tm-adb-shell {
                width: min(720px, 100%);
                max-height: min(96vh, 920px);
                display: flex; flex-direction: column;
                overflow: hidden;
                background: var(--tm-modal-bg, var(--tm-panel-bg, var(--tm-shop-item-bg, #161616)));
                color: var(--tm-primary-color, #eee);
                border: 1px solid var(--tm-shop-item-border, #333);
                border-radius: 18px;
                box-shadow: 0 28px 70px rgba(0,0,0,0.5);
            }
            .tm-adb-header {
                display: flex; align-items: center; justify-content: space-between;
                gap: 12px; padding: 14px 18px;
                border-bottom: 1px solid var(--tm-shop-item-border, #333);
                flex: 0 0 auto;
            }
            .tm-adb-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
            .tm-adb-mark {
                width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
                display: grid; place-items: center;
                background: color-mix(in srgb, var(--tm-success-color, #198754) 22%, transparent);
                color: var(--tm-success-color, #198754);
                font-size: 1.25rem;
            }
            .tm-adb-title { margin: 0; font-size: 1.18rem; font-weight: 800; letter-spacing: -0.03em; }
            .tm-adb-sub { margin: 2px 0 0; font-size: 0.84rem; opacity: 0.7; }
            .tm-adb-close {
                width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
                border: 1px solid var(--tm-shop-item-border, #444);
                background: transparent; color: inherit;
                font-size: 1.5rem; line-height: 1; cursor: pointer;
            }
            .tm-adb-close:hover { background: rgba(255,255,255,0.07); }
            .tm-adb-body {
                padding: 14px 18px 16px; display: grid; gap: 12px;
                overflow: auto; flex: 1 1 auto;
            }
            .tm-adb-banner {
                padding: 11px 14px; border-radius: 12px; font-size: 0.92rem; font-weight: 650;
                background: rgba(220,53,69,0.16); border: 1px solid rgba(220,53,69,0.4);
            }
            .tm-adb-banner.ok { background: rgba(25,135,84,0.16); border-color: rgba(25,135,84,0.4); }
            .tm-adb-banner.warn { background: rgba(255,193,7,0.16); border-color: rgba(255,193,7,0.45); }
            .tm-adb-banner.hidden { display: none; }
            .tm-adb-offline {
                padding: 8px 2px 12px;
            }
            .tm-adb-offline h3 { margin: 0 0 6px; font-size: 1.15rem; }
            .tm-adb-offline code {
                display: inline-block; margin: 0 2px; padding: 2px 7px; border-radius: 6px;
                background: rgba(0,0,0,0.32); font-size: 0.8rem;
            }
            .tm-adb-guide { display: grid; gap: 10px; margin: 14px 0; }
            .tm-adb-guide-item {
                display: grid; grid-template-columns: 36px 1fr; gap: 12px; align-items: center;
                padding: 14px 14px; border-radius: 14px;
                background: var(--tm-surface-alt-bg, rgba(255,255,255,0.04));
                border: 1px solid var(--tm-shop-item-border, #333);
                font-size: 0.95rem; line-height: 1.45;
            }
            .tm-adb-guide-n {
                width: 36px; height: 36px; border-radius: 50%;
                display: grid; place-items: center; font-weight: 800; font-size: 1rem;
                background: var(--tm-success-color, #198754); color: #fff;
            }
            .tm-adb-chips {
                display: flex; flex-wrap: wrap; gap: 8px;
            }
            .tm-adb-chip {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 6px 11px; border-radius: 999px; font-size: 0.8rem; font-weight: 700;
                border: 1px solid var(--tm-shop-item-border, #444);
                background: rgba(255,255,255,0.04);
            }
            .tm-adb-chip::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #888; }
            .tm-adb-chip.ok { border-color: rgba(25,135,84,0.45); color: var(--tm-success-color, #3ddc84); }
            .tm-adb-chip.ok::before { background: var(--tm-success-color, #198754); }
            .tm-adb-chip.bad { border-color: rgba(220,53,69,0.45); color: var(--tm-danger-color, #ff6b7a); }
            .tm-adb-chip.bad::before { background: var(--tm-danger-color, #dc3545); }
            .tm-adb-chip.warn { border-color: rgba(255,193,7,0.45); }
            .tm-adb-chip.warn::before { background: #ffc107; }
            .tm-adb-hero[data-mode="ready"] .tm-adb-chip-state { color: var(--tm-success-color, #3ddc84); }
            .tm-adb-hero[data-mode="issue"] .tm-adb-chip-state { color: var(--tm-danger-color, #ff6b7a); }
            .tm-adb-hero[data-mode="active"] .tm-adb-chip-state { color: var(--tm-info-color, #0dcaf0); }
            .tm-adb-setup { display: grid; gap: 10px; }
            .tm-adb-card {
                border: 1px solid var(--tm-shop-item-border, #333);
                border-radius: 14px; padding: 12px 14px;
                background: var(--tm-shop-item-bg, rgba(255,255,255,0.025));
            }
            .tm-adb-card h3 {
                margin: 0 0 10px; font-size: 0.72rem; letter-spacing: 0.06em;
                text-transform: uppercase; opacity: 0.62; font-weight: 800;
            }
            .tm-adb-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
            .tm-adb-field { display: grid; gap: 5px; flex: 1; min-width: 160px; }
            .tm-adb-field label { font-size: 0.78rem; opacity: 0.8; font-weight: 700; }
            .tm-adb-field select, .tm-adb-field input[type="text"] {
                width: 100%; padding: 10px 12px; border-radius: 11px;
                border: 1px solid var(--tm-input-border, var(--tm-shop-item-border, #444));
                background: var(--tm-input-bg, var(--tm-shop-item-bg, #222));
                color: var(--tm-input-text, inherit); font-size: 0.95rem;
            }
            .tm-adb-btn {
                padding: 9px 13px; border-radius: 11px; cursor: pointer;
                border: 1px solid var(--tm-shop-item-border, #555);
                background: var(--tm-surface-hover-bg, rgba(255,255,255,0.07));
                color: inherit; font-weight: 700; font-size: 0.88rem;
            }
            .tm-adb-btn:hover { filter: brightness(1.1); }
            .tm-adb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .tm-adb-btn-primary { background: var(--tm-success-color, #198754); border-color: transparent; color: #fff; }
            .tm-adb-btn-danger { background: rgba(220,53,69,0.18); border-color: rgba(220,53,69,0.45); }
            .tm-adb-hint { font-size: 0.84rem; opacity: 0.82; margin: 6px 0 0; }
            .tm-adb-hint.error { color: var(--tm-danger-color, #dc3545); opacity: 1; }
            .tm-adb-hint.ok { color: var(--tm-success-color, #198754); opacity: 1; }
            .tm-adb-folder-toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
            .tm-adb-folder-list { display: grid; gap: 8px; }
            .tm-adb-folder-card {
                display: grid; grid-template-columns: auto 32px 1fr auto; align-items: center; gap: 10px;
                padding: 12px 12px; border-radius: 14px; cursor: pointer;
                border: 1px solid var(--tm-shop-item-border, #333);
                background: var(--tm-surface-alt-bg, rgba(255,255,255,0.03));
            }
            .tm-adb-folder-card:hover { border-color: rgba(255,255,255,0.22); }
            .tm-adb-folder-card.is-off { opacity: 0.45; }
            .tm-adb-folder-card input { width: 18px; height: 18px; accent-color: var(--tm-success-color, #198754); }
            .tm-adb-folder-ico { font-size: 1.25rem; line-height: 1; }
            .tm-adb-folder-copy { display: grid; gap: 2px; min-width: 0; }
            .tm-adb-folder-copy strong { font-size: 0.98rem; }
            .tm-adb-folder-copy span { font-size: 0.78rem; opacity: 0.68; }
            .tm-adb-folder-x {
                width: 32px; height: 32px; border-radius: 9px; border: 0; cursor: pointer;
                background: transparent; color: inherit; opacity: 0.45; font-size: 1.2rem;
            }
            .tm-adb-folder-x:hover { opacity: 1; background: rgba(220,53,69,0.2); }
            .tm-adb-folder-empty { opacity: 0.7; padding: 18px; text-align: center; margin: 0; }
            .tm-adb-progress {
                border: 1px solid var(--tm-shop-item-border, #333);
                border-radius: 14px; padding: 12px 14px;
                background: rgba(255,255,255,0.02);
            }
            .tm-adb-live.is-busy .tm-adb-progress {
                border-color: color-mix(in srgb, var(--tm-info-color, #0dcaf0) 45%, #333);
                background: color-mix(in srgb, var(--tm-info-color, #0dcaf0) 8%, transparent);
            }
            .tm-adb-meter {
                height: 12px; border-radius: 99px; overflow: hidden; margin: 10px 0 8px;
                background: rgba(255,255,255,0.1);
            }
            .tm-adb-meter-fill {
                height: 100%; width: 0%;
                background: linear-gradient(90deg, var(--tm-success-color, #198754), #3ddc84);
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
            .tm-adb-stats { display: flex; justify-content: space-between; gap: 8px; font-size: 0.86rem; font-weight: 650; }
            .tm-adb-file { font-size: 0.8rem; opacity: 0.72; min-height: 1.15em; word-break: break-all; margin: 4px 0 0; }
            .tm-adb-hero-pct { font-size: 0.95rem; font-weight: 800; margin: 0 0 4px; min-height: 1.2em; }
            .tm-adb-footer {
                position: sticky; bottom: -16px; margin: 4px -18px -16px;
                padding: 12px 18px 16px;
                background: linear-gradient(180deg, transparent, var(--tm-modal-bg, #161616) 18%);
                display: grid; gap: 10px;
            }
            .tm-adb-controls { display: flex; flex-wrap: wrap; gap: 8px; }
            .tm-adb-start {
                width: 100%; min-height: 52px; border-radius: 14px; border: 0; cursor: pointer;
                font-weight: 800; font-size: 1.08rem; letter-spacing: -0.02em;
                color: #fff; background: var(--tm-success-color, #198754);
            }
            .tm-adb-start:hover:not(:disabled) { filter: brightness(1.08); }
            .tm-adb-start:disabled { opacity: 0.45; cursor: not-allowed; background: #555; }
            .tm-adb-start-caption { font-size: 0.84rem; opacity: 0.78; margin: 0; text-align: center; }
            .tm-adb-log {
                margin: 8px 0 0; max-height: 140px; overflow: auto; padding: 8px;
                font-size: 0.75rem; white-space: pre-wrap;
                background: rgba(0,0,0,0.22); border-radius: 8px;
            }
            .tm-adb-recovery { display: grid; gap: 8px; }
            .tm-adb-recovery-item {
                display: flex; justify-content: space-between; gap: 8px; align-items: center;
                padding: 12px 14px; border-radius: 14px;
                background: rgba(255,193,7,0.12); border: 1px solid rgba(255,193,7,0.4);
            }
            .tm-adb-browse {
                border: 1px solid var(--tm-shop-item-border, #333); border-radius: 12px; padding: 10px;
                background: var(--tm-surface-alt-bg, rgba(255,255,255,0.03)); margin-top: 8px;
            }
            .tm-adb-browse-list { display: grid; gap: 4px; max-height: 180px; overflow: auto; margin: 8px 0; }
            .tm-adb-browse-item {
                padding: 8px 10px; border-radius: 8px; cursor: pointer;
                display: flex; align-items: center; gap: 8px;
            }
            .tm-adb-browse-item:hover, .tm-adb-browse-item.selected { background: rgba(255,255,255,0.08); }
            details.tm-adb-fold { margin-top: 4px; }
            details.tm-adb-fold > summary { cursor: pointer; font-weight: 700; margin-bottom: 8px; opacity: 0.8; }
        `;
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
            const row = $('tm-adb-folder-list')?.querySelector(`input[data-index="${i}"]`);
            return row?.checked;
        });
    }

    function renderFolders() {
        const list = $('tm-adb-folder-list');
        if (!list) return;
        const checkedState = {};
        list.querySelectorAll('input[type="checkbox"]').forEach((c) => {
            const idx = Number(c.dataset.index);
            if (!Number.isNaN(idx) && state.folders[idx]) {
                checkedState[state.folders[idx]] = c.checked;
            }
        });
        list.innerHTML = '';
        if (!state.folders.length) {
            list.innerHTML = '<p class="tm-adb-folder-empty">Δεν έχουν οριστεί φάκελοι. Ανοίξτε «Για προχωρημένους» για να προσθέσετε.</p>';
            updateFolderTotal();
            return;
        }
        state.folders.forEach((path, index) => {
            const size = state.sizes[path];
            const checked = checkedState[path] !== undefined ? checkedState[path] : true;
            const card = document.createElement('div');
            card.className = `tm-adb-folder-card${checked ? '' : ' is-off'}`;
            card.title = path;
            card.innerHTML = `
                <input type="checkbox" data-index="${index}" ${checked ? 'checked' : ''} ${state.running ? 'disabled' : ''}>
                <span class="tm-adb-folder-ico" aria-hidden="true">${folderIcon(path)}</span>
                <span class="tm-adb-folder-copy">
                    <strong>${esc(friendlyFolderName(path))}</strong>
                    <span>${esc(size?.status || 'Έτοιμο')}${size?.text ? ` · ${esc(size.text)}` : ''}</span>
                </span>
                <button type="button" class="tm-adb-folder-x" data-remove="${index}" title="Αφαίρεση από τη λίστα" ${state.running ? 'disabled' : ''}>×</button>`;
            card.addEventListener('click', (e) => {
                if (e.target.closest('input, .tm-adb-folder-x')) return;
                const box = card.querySelector('input[type="checkbox"]');
                if (box && !box.disabled) {
                    box.checked = !box.checked;
                    renderFolders();
                }
            });
            card.querySelector('.tm-adb-folder-x')?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (state.running) return;
                state.folders.splice(index, 1);
                state.selectedRows.clear();
                renderFolders();
            });
            list.appendChild(card);
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
            ? `${selected.length} φάκελοι · ${formatBytes(total)}+`
            : `${selected.length} φάκελοι · ${formatBytes(total)}`;
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
        updateChips();
    }

    function updateChips() {
        const helper = $('tm-adb-chip-helper');
        const phone = $('tm-adb-chip-phone');
        const dest = $('tm-adb-chip-dest');
        if (helper) {
            helper.className = `tm-adb-chip${state.connected ? ' ok' : ' bad'}`;
            helper.textContent = state.connected ? 'Βοηθός OK' : 'Βοηθός off';
        }
        if (phone) {
            const d = selectedDevice();
            phone.className = `tm-adb-chip${d ? ' ok' : ' bad'}`;
            phone.textContent = d ? (deviceModel(d) || 'Τηλέφωνο') : 'Χωρίς τηλέφωνο';
        }
        if (dest) {
            const p = $('tm-adb-path')?.value.trim();
            dest.className = `tm-adb-chip${p ? ' ok' : ' warn'}`;
            dest.textContent = p ? 'Προορισμός OK' : 'Χωρίς φάκελο';
        }
    }

    function setHeroMode(mode) {
        const hero = $('tm-adb-hero');
        if (hero) hero.setAttribute('data-mode', mode);
        const live = $('tm-adb-live');
        if (live) live.classList.toggle('is-busy', mode === 'active');
        updateChips();
        const cap = $('tm-adb-start-caption');
        if (!cap) return;
        const captions = {
            waiting: 'Συνδέστε το τηλέφωνο με USB και πατήστε Ανανέωση.',
            ready: 'Τσεκάρετε τι θα αντιγραφεί και πατήστε Έναρξη αντιγράφου.',
            active: 'Η αντιγραφή τρέχει. Μην αποσυνδέσετε το καλώδιο.',
            done: 'Ολοκληρώθηκε. Πατήστε Άνοιγμα φακέλου για να δείτε τα αρχεία.',
            issue: 'Κάτι λείπει — διορθώστε το κόκκινο μήνυμα και ξαναδοκιμάστε.',
        };
        cap.textContent = captions[mode] || captions.waiting;
    }

    function setUiRunning(running) {
        state.running = running;
        const start = $('tm-adb-start');
        if (start) {
            start.disabled = running || !state.ready;
            if (!running) start.textContent = 'Έναρξη αντιγράφου';
            else if (!/%$/.test(start.textContent)) start.textContent = 'Αντιγραφή…';
        }
        ['tm-adb-pause', 'tm-adb-cancel'].forEach((id) => {
            const el = $(id);
            if (el) el.disabled = !running;
        });
        const retry = $('tm-adb-retry');
        if (retry) retry.disabled = running || !state.canRetryFailed;
        ['tm-adb-start-selected', 'tm-adb-refresh', 'tm-adb-device', 'tm-adb-path',
            'tm-adb-save', 'tm-adb-browse', 'tm-adb-browse-btn', 'tm-adb-sizes'].forEach((id) => {
            const el = $(id);
            if (el) el.disabled = running;
        });
        $('tm-adb-folder-list')?.querySelectorAll('input').forEach((el) => {
            el.disabled = running;
        });
        $('tm-adb-live')?.classList.toggle('is-busy', running);
        if (running) setHeroMode('active');
        else if (!state.lastResultShown) setHeroMode(state.ready ? 'ready' : 'waiting');
        updateChips();
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
        const start = $('tm-adb-start');
        if (start && status.running) {
            start.textContent = status.percent >= 0 ? `${Math.round(status.percent)}%` : 'Αντιγραφή…';
        }
        const heroPct = $('tm-adb-hero-pct');
        if (heroPct) {
            heroPct.textContent = status.running && status.percent >= 0
                ? `${Math.round(status.percent)}% ολοκληρώθηκε`
                : '';
        }
        if (status.result && !status.running) {
            if (!state.lastResultShown) {
                state.lastResultShown = true;
                const r = status.result;
                const ok = r.Success || r.success;
                showBanner(r.Message || r.message || (ok ? 'Το αντίγραφο ολοκληρώθηκε.' : 'Ολοκληρώθηκε με σφάλματα.'), ok ? 'ok' : 'warn');
                setHeroMode(ok ? 'done' : 'issue');
                refreshReadiness();
            }
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
                    hint.textContent = 'Μεταφορά σε εξέλιξη — μην βγάλετε το καλώδιο.';
                    hint.className = 'tm-adb-hint';
                    setHeroMode('active');
                } else if (data.ready) {
                    const name = data.device?.model || data.device?.displayName || 'τηλέφωνο';
                    hint.textContent = `${name} συνδεδεμένο · έτοιμο για αντίγραφο`;
                    hint.className = 'tm-adb-hint ok';
                    if (!state.lastResultShown) setHeroMode('ready');
                } else {
                    const firstError = (data.checks || []).find((c) => c.level === 'error');
                    hint.textContent = firstError?.message || 'Συνδέστε το τηλέφωνο με USB και ενεργοποιήστε debugging.';
                    hint.className = 'tm-adb-hint error';
                    if (!state.lastResultShown) setHeroMode('issue');
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
        updateChips();
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
                        statusEl.textContent = 'Δεν βρέθηκε τηλέφωνο. Συνδέστε USB, ανοίξτε USB debugging και πατήστε Allow.';
                    }
                    setHeroMode('issue');
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
                            ? `${state.devices.length} τηλέφωνα — επιλέξτε ποιο θα αντιγραφεί.`
                            : 'Το τηλέφωνο συνδέθηκε.';
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
        const device = selectedDevice();
        if (!device) return showBanner('Συνδέστε συσκευή πρώτα.');
        const selected = getSelectedFolders();
        if (selected.length === 0) return showBanner('Επιλέξτε τουλάχιστον έναν φάκελο και πατήστε Έναρξη αντιγράφου.');
        const backupBaseDir = $('tm-adb-path')?.value.trim();
        if (!backupBaseDir) return showBanner('Ορίστε φάκελο προορισμού.');
        hideBanner();
        state.lastResultShown = false;
        const log = $('tm-adb-log');
        if (log) log.textContent = '';
        const fill = $('tm-adb-meter-fill');
        if (fill) fill.style.width = '0%';
        setUiRunning(true);
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
        } catch (err) {
            setUiRunning(false);
            showBanner(err.message);
        }
    }

    async function startSelected() {
        return backupNow();
    }

    function stopPolling() {
        if (state.pollTimer) clearInterval(state.pollTimer);
        if (state.readyTimer) clearInterval(state.readyTimer);
        state.pollTimer = null;
        state.readyTimer = null;
    }

    function startPolling() {
        stopPolling();
        let readyInFlight = false;
        state.pollTimer = setInterval(async () => {
            if (!document.getElementById(OVERLAY_ID)) {
                stopPolling();
                return;
            }
            try {
                const status = await api('/api/backup/status', { timeoutMs: 8000 });
                applyStatus(status);
            } catch (_) { /* helper busy */ }
        }, 1000);
        state.readyTimer = setInterval(() => {
            if (state.running || readyInFlight) return;
            readyInFlight = true;
            Promise.resolve(refreshReadiness()).finally(() => { readyInFlight = false; });
        }, 8000);
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
            $('tm-adb-folder-list')?.querySelectorAll('input[type="checkbox"]').forEach((c) => { c.checked = true; });
            renderFolders();
        });
        $('tm-adb-clear-all')?.addEventListener('click', () => {
            $('tm-adb-folder-list')?.querySelectorAll('input[type="checkbox"]').forEach((c) => { c.checked = false; });
            renderFolders();
        });
        $('tm-adb-add-folder')?.addEventListener('click', () => {
            const path = window.prompt('Φάκελος στο τηλέφωνο (π.χ. sdcard/Music):', 'sdcard/');
            if (path) addFolderPath(path);
        });
        $('tm-adb-remove-folder')?.addEventListener('click', () => {
            if (state.selectedRows.size === 0) {
                const keep = getSelectedFolders();
                if (keep.length === state.folders.length) {
                    return showBanner('Αποεπιλέξτε έναν φάκελο ή πατήστε × στην κάρτα για αφαίρεση.');
                }
                state.folders = keep;
            } else {
                state.folders = state.folders.filter((_, i) => !state.selectedRows.has(i));
            }
            state.selectedRows.clear();
            renderFolders();
        });
        $('tm-adb-folder-list')?.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) renderFolders();
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
                    <div class="tm-adb-brand">
                        <span class="tm-adb-mark" aria-hidden="true">⎘</span>
                        <div>
                            <h2 class="tm-adb-title" id="tm-adb-title">Αντίγραφο συσκευής</h2>
                            <p class="tm-adb-sub">Αντιγραφή φωτογραφιών και αρχείων από το τηλέφωνο στον υπολογιστή</p>
                        </div>
                    </div>
                    <button type="button" class="tm-adb-close" id="tm-adb-close" aria-label="Κλείσιμο">×</button>
                </header>
                <div class="tm-adb-body">
                    <div id="tm-adb-banner" class="tm-adb-banner hidden"></div>
                    <div id="tm-adb-offline" class="tm-adb-offline">
                        <h3>Ξεκινήστε εδώ — 3 βήματα</h3>
                        <p id="tm-adb-offline-msg" class="tm-adb-hint">Ο τοπικός βοηθός δεν απαντά ακόμα.</p>
                        <div class="tm-adb-guide">
                            <div class="tm-adb-guide-item">
                                <span class="tm-adb-guide-n">1</span>
                                <span>Συνδέστε το τηλέφωνο με καλώδιο USB στον υπολογιστή.</span>
                            </div>
                            <div class="tm-adb-guide-item">
                                <span class="tm-adb-guide-n">2</span>
                                <span>Στο τηλέφωνο ενεργοποιήστε USB debugging και πατήστε Allow / Να επιτρέπεται.</span>
                            </div>
                            <div class="tm-adb-guide-item">
                                <span class="tm-adb-guide-n">3</span>
                                <span>Στον υπολογιστή ανοίξτε τον βοηθό: <code>${esc(HELPER_HINT)}</code></span>
                            </div>
                        </div>
                        <p class="tm-adb-hint">Ο βοηθός ακούει στο ${esc(DEFAULT_URL)}</p>
                        <div class="tm-adb-row">
                            <button type="button" class="tm-adb-btn tm-adb-btn-primary" id="tm-adb-retry-connect">Έλεγξε ξανά</button>
                            <button type="button" class="tm-adb-btn" id="tm-adb-open-ui">Άνοιγμα βοηθού</button>
                        </div>
                    </div>
                    <div id="tm-adb-live">
                        <div class="tm-adb-hero" id="tm-adb-hero" data-mode="waiting">
                            <div class="tm-adb-chips">
                                <span class="tm-adb-chip bad" id="tm-adb-chip-helper">Βοηθός off</span>
                                <span class="tm-adb-chip bad" id="tm-adb-chip-phone">Χωρίς τηλέφωνο</span>
                                <span class="tm-adb-chip warn" id="tm-adb-chip-dest">Χωρίς φάκελο</span>
                            </div>
                        </div>
                        <div class="tm-adb-setup">
                            <section class="tm-adb-card">
                                <h3>1. Τηλέφωνο</h3>
                                <div class="tm-adb-row">
                                    <div class="tm-adb-field">
                                        <label for="tm-adb-device">Συνδεδεμένη συσκευή</label>
                                        <select id="tm-adb-device"></select>
                                    </div>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-refresh">Ανανέωση</button>
                                </div>
                                <p id="tm-adb-device-status" class="tm-adb-hint">Συνδέστε USB και ενεργοποιήστε debugging</p>
                                <p id="tm-adb-hint" class="tm-adb-hint">Αρχικοποίηση…</p>
                            </section>
                            <section class="tm-adb-card">
                                <h3>2. Πού θα αποθηκευτεί</h3>
                                <div class="tm-adb-field">
                                    <label for="tm-adb-path">Φάκελος στον υπολογιστή</label>
                                    <div class="tm-adb-row">
                                        <input id="tm-adb-path" type="text" placeholder="F:\\SMARTPHONES\\ADB_SCRIPT">
                                        <button type="button" class="tm-adb-btn" id="tm-adb-save">Αποθήκευση</button>
                                    </div>
                                </div>
                            </section>
                            <div id="tm-adb-recovery" class="tm-adb-recovery" style="display:none"></div>
                            <section class="tm-adb-card">
                                <h3>3. Τι θα αντιγραφεί</h3>
                                <div class="tm-adb-folder-toolbar">
                                    <button type="button" class="tm-adb-btn" id="tm-adb-select-all">Όλα</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-clear-all">Κανένα</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-sizes">Εκτίμηση μεγέθους</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-start-selected" hidden>Μόνο επιλεγμένα</button>
                                </div>
                                <div id="tm-adb-folder-list" class="tm-adb-folder-list"></div>
                                <p id="tm-adb-folder-total" class="tm-adb-hint"></p>
                            </section>
                            <section class="tm-adb-progress" id="tm-adb-progress">
                                <p class="tm-adb-hero-pct" id="tm-adb-hero-pct"></p>
                                <p id="tm-adb-activity-title" class="tm-adb-hint" style="font-weight:800;margin:0">Αναμονή</p>
                                <p id="tm-adb-activity-detail" class="tm-adb-hint"></p>
                                <p id="tm-adb-current-file" class="tm-adb-file"></p>
                                <p id="tm-adb-counts" class="tm-adb-hint"></p>
                                <div id="tm-adb-meter" class="tm-adb-meter"><div id="tm-adb-meter-fill" class="tm-adb-meter-fill"></div></div>
                                <div class="tm-adb-stats">
                                    <span id="tm-adb-progress-detail">0.00 GB</span>
                                    <span id="tm-adb-eta"></span>
                                </div>
                            </section>
                            <details class="tm-adb-fold">
                                <summary>Για προχωρημένους</summary>
                                <div class="tm-adb-row" style="margin-bottom:8px">
                                    <button type="button" class="tm-adb-btn" id="tm-adb-add-folder">Προσθήκη φακέλου</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-remove-folder">Αφαίρεση αποεπιλεγμένων</button>
                                    <button type="button" class="tm-adb-btn" id="tm-adb-browse-btn">Περιήγηση στο τηλέφωνο</button>
                                </div>
                                <div id="tm-adb-browse" class="tm-adb-browse" style="display:none">
                                    <div class="tm-adb-row">
                                        <strong>Περιήγηση συσκευής</strong>
                                        <button type="button" class="tm-adb-btn" id="tm-adb-browse-close">Κλείσιμο</button>
                                    </div>
                                    <p id="tm-adb-browse-path" class="tm-adb-hint">/sdcard</p>
                                    <div id="tm-adb-browse-list" class="tm-adb-browse-list"></div>
                                    <div class="tm-adb-row">
                                        <button type="button" class="tm-adb-btn" id="tm-adb-browse-up">Πάνω</button>
                                        <button type="button" class="tm-adb-btn" id="tm-adb-browse-refresh">Ανανέωση</button>
                                        <button type="button" class="tm-adb-btn" id="tm-adb-browse-add-here">Προσθήκη εδώ</button>
                                        <button type="button" class="tm-adb-btn" id="tm-adb-browse-add-sel">Προσθήκη επιλογής</button>
                                    </div>
                                </div>
                                <pre id="tm-adb-log" class="tm-adb-log"></pre>
                            </details>
                        </div>
                        <div class="tm-adb-footer">
                            <div class="tm-adb-controls">
                                <button type="button" class="tm-adb-btn" id="tm-adb-pause" disabled>Παύση</button>
                                <button type="button" class="tm-adb-btn tm-adb-btn-danger" id="tm-adb-cancel" disabled>Ακύρωση</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-retry" disabled>Επανάληψη</button>
                                <button type="button" class="tm-adb-btn" id="tm-adb-open" disabled>Άνοιγμα φακέλου</button>
                            </div>
                            <p class="tm-adb-start-caption" id="tm-adb-start-caption">Η αντιγραφή ξεκινά μόνο όταν πατήσετε το κουμπί.</p>
                            <button type="button" class="tm-adb-start" id="tm-adb-start" disabled>Έναρξη αντιγράφου</button>
                        </div>
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
        setHeroMode('waiting');
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

    function isOrderOrRepairEditPage() {
        const p = String(window.location.pathname || '').toLowerCase();
        return p.includes('service_edit.php')
            || p.includes('sparepartstoorder_edit.php')
            || p.includes('srvorders_edit.php');
    }

    function ensureAdbBackupOrderButton(config) {
        if (!isOrderOrRepairEditPage()) return true;
        if (!isFeatureEnabled(config)) {
            document.getElementById(ORDER_WRAP_ID)?.remove();
            return true;
        }
        if (document.getElementById(ORDER_BTN_ID)) return true;

        const anchor =
            document.querySelector('.rnr-b-editbuttons .rnr-buttons-right') ||
            document.querySelector('.rnr-b-editbuttons .rnr-buttons-left') ||
            document.querySelector('.rnr-brickcontents.rnr-b-editbuttons') ||
            document.querySelector('.rnr-b-editbuttons');
        if (!anchor) return false;

        const wrap = document.createElement('div');
        wrap.id = ORDER_WRAP_ID;
        wrap.style.cssText = 'display:inline-flex;align-items:stretch;margin-left:4px;vertical-align:middle;';
        wrap.innerHTML = `<a href="#" id="${ORDER_BTN_ID}" class="rnr-button" role="button" title="Αντίγραφο συσκευής από USB">⎘&nbsp;Αντίγραφο</a>`;
        wrap.querySelector('a')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showAdbBackupModal();
        });

        const backToListBtn = Array.from(anchor.querySelectorAll('a, button, input[type="button"], input[type="submit"]'))
            .find((el) => {
                const text = String(el.textContent || el.value || el.title || '').toLowerCase();
                const href = String(el.getAttribute?.('href') || '').toLowerCase();
                return /back\s*to\s*list|επιστροφή|λιστα|λίστα/.test(text) || /_list\.php/.test(href);
            });
        if (backToListBtn) anchor.insertBefore(wrap, backToListBtn);
        else anchor.appendChild(wrap);
        return true;
    }

    function initAdbBackupFeature(config) {
        if (!isFeatureEnabled(config)) {
            document.getElementById(MENU_ID)?.remove();
            document.getElementById(ORDER_WRAP_ID)?.remove();
            closeAdbBackupModal();
            return;
        }
        let attempts = 0;
        const maxAttempts = 80;
        let observer = null;
        const tryInject = () => {
            attempts += 1;
            const menuOk = ensureAdbBackupMenuItem(config);
            const btnOk = ensureAdbBackupOrderButton(config);
            if ((menuOk && btnOk) || attempts >= maxAttempts) observer?.disconnect();
        };
        tryInject();
        observer = new MutationObserver(tryInject);
        const watchRoot = document.querySelector('.rnr-pagewrapper') || document.body;
        observer.observe(watchRoot, { childList: true, subtree: true });
        setTimeout(() => observer?.disconnect(), 10000);
    }

    function updateAdbBackupMenuVisibility(config) {
        if (!isFeatureEnabled(config)) {
            document.getElementById(MENU_ID)?.remove();
            document.getElementById(ORDER_WRAP_ID)?.remove();
            closeAdbBackupModal();
            return;
        }
        ensureAdbBackupMenuItem(config);
        ensureAdbBackupOrderButton(config);
    }

    window.initAdbBackupFeature = initAdbBackupFeature;
    window.updateAdbBackupMenuVisibility = updateAdbBackupMenuVisibility;
    window.showAdbBackupModal = showAdbBackupModal;
})();
