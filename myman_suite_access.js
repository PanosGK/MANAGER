// ==UserScript==
// @name         MyManager Suite Access
// @namespace    http://tampermonkey.net/
// @version      1
// @description  See who runs the suite and remotely enable/disable it (PocketBase suite_access).
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const PB_BASE = 'https://mngerchat.littlejol.mywire.org';
    const COLL = 'suite_access';
    const PRESENCE_COLL = 'presence';
    const ONLINE_MS = 3 * 60 * 1000;
    const POLL_MS = 45 * 1000;
    const MANAGE_PASSCODE = '1337';

    let pollTimer = null;
    let ownRecordId = '';
    let ownUserId = '';
    let collectionMissing = false;
    let manageUnlocked = false;

    function storageKeys() {
        return window.STORAGE_KEYS || {};
    }

    function remoteKey() {
        return storageKeys().SUITE_REMOTE_DISABLED || 'tm_suite_remote_disabled';
    }

    function isRemoteDisabled() {
        try {
            return GM_getValue(remoteKey(), false) === true;
        } catch (_) {
            return false;
        }
    }

    function setRemoteDisabled(disabled) {
        try {
            GM_setValue(remoteKey(), !!disabled);
        } catch (_) { /* ignore */ }
    }

    function canManageAccess() {
        if (manageUnlocked) return true;
        try {
            if (window.config?.debugEnabled) return true;
        } catch (_) { /* ignore */ }
        return false;
    }

    function unlockManageAccess() {
        if (canManageAccess()) return true;
        const pass = prompt('Κωδικός διαχειριστή για ενεργοποίηση / απενεργοποίηση:');
        if (pass === MANAGE_PASSCODE) {
            manageUnlocked = true;
            return true;
        }
        if (pass != null) alert('Λάθος κωδικός.');
        return false;
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function pbRequest({ method, url, headers, data, timeout }) {
        return new Promise((resolve) => {
            const xhr = (typeof GM_xmlhttpRequest === 'function')
                ? GM_xmlhttpRequest
                : (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);
            if (!xhr) {
                resolve({ status: 0, body: null, raw: 'no xhr' });
                return;
            }
            xhr({
                method: method || 'GET',
                url,
                headers: headers || {},
                data: data || undefined,
                timeout: timeout || 15000,
                onload(res) {
                    let body = null;
                    const raw = String(res.responseText || '');
                    try { body = raw ? JSON.parse(raw) : null; } catch (_) { body = null; }
                    resolve({ status: res.status, body, raw });
                },
                onerror() { resolve({ status: 0, body: null, raw: 'network' }); },
                ontimeout() { resolve({ status: 0, body: null, raw: 'timeout' }); },
            });
        });
    }

    async function ensureToken() {
        try {
            if (typeof window.ensureMymanPocketBaseAuth === 'function') {
                const token = await window.ensureMymanPocketBaseAuth(storageKeys());
                if (token) return String(token);
            }
        } catch (_) { /* ignore */ }
        return '';
    }

    function userIdFromToken(token) {
        try {
            const part = String(token || '').split('.')[1] || '';
            const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(json);
            return String(payload.id || payload.sub || '').slice(0, 64);
        } catch (_) {
            return '';
        }
    }

    function displayName() {
        try {
            if (typeof window.tmGetLoggedInDisplayName === 'function') {
                const n = String(window.tmGetLoggedInDisplayName({ fallback: null }) || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        return String(window.tmCurrentUser || window.config?.profileLabel || 'Τεχνικός').slice(0, 64);
    }

    function storeName() {
        try {
            if (typeof window.getOfficeChatStoreName === 'function') {
                const n = String(window.getOfficeChatStoreName(storageKeys()) || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            const stored = String(GM_getValue('tm_connected_store_v1', '') || '').trim();
            if (stored) return stored.slice(0, 64);
        } catch (_) { /* ignore */ }
        return '';
    }

    function profileId() {
        try {
            return String(window.MMS_PROFILES?.getActiveProfileId?.() || window.config?.profileId || '').slice(0, 64);
        } catch (_) {
            return '';
        }
    }

    function bundleLabel() {
        return String(
            window.SCRIPT_META?.displayVersion
            || window.TMMS_REMOTE_DISPLAY_VERSION
            || window.SCRIPT_META?.version
            || ''
        ).slice(0, 32);
    }

    function isCollectionMissing(status, raw) {
        if (status === 404) return true;
        return status >= 400 && /missing collection|collection.*not found|didn't find the collection|unknown collection/i.test(String(raw || ''));
    }

    function isUniqueConflict(status, raw) {
        return status === 400 && /unique|already exists|duplicate/i.test(String(raw || ''));
    }

    function newerIso(a, b) {
        const ta = new Date(a || 0).getTime() || 0;
        const tb = new Date(b || 0).getTime() || 0;
        return ta >= tb ? a : b;
    }

    function formatAgo(iso) {
        const t = new Date(iso || 0).getTime();
        if (!t) return '—';
        const diff = Date.now() - t;
        if (diff < 60 * 1000) return 'τώρα';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} λεπ.`;
        if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} ώρ.`;
        return new Date(t).toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function collectionSetupHtml() {
        return `<p class="tm-setting-description">Στο PocketBase (Chat) → Collections → New collection <code>suite_access</code> (type: Base), πεδία:</p>
                <ul class="tm-setting-description" style="margin:8px 0 0 18px">
                    <li><code>userId</code> text, required, unique</li>
                    <li><code>displayName</code> text</li>
                    <li><code>profileId</code> text</li>
                    <li><code>store</code> text</li>
                    <li><code>lastSeen</code> date</li>
                    <li><code>bundleVersion</code> text</li>
                    <li><code>enabled</code> bool, default true</li>
                </ul>
                <p class="tm-setting-description" style="margin-top:8px">API rules List / Create / Update: <code>@request.auth.id != ""</code>.</p>`;
    }

    function heartbeatPayload(userId) {
        const payload = {
            userId,
            displayName: displayName(),
            lastSeen: new Date().toISOString(),
        };
        const pid = profileId();
        const store = storeName();
        const ver = bundleLabel();
        if (pid) payload.profileId = pid;
        if (store) payload.store = store;
        if (ver) payload.bundleVersion = ver;
        return payload;
    }

    async function findOwnRecord(token, userId) {
        const base = PB_BASE.replace(/\/$/, '');
        const filter = encodeURIComponent(`userId="${userId}"`);
        let res = await pbRequest({
            method: 'GET',
            url: `${base}/api/collections/${COLL}/records?page=1&perPage=1&filter=${filter}`,
            headers: { Authorization: token },
        });
        if (isCollectionMissing(res.status, res.raw + JSON.stringify(res.body || {}))) {
            collectionMissing = true;
            return { missing: true };
        }
        if (res.status >= 200 && res.status < 300 && res.body?.items?.[0]) {
            return { record: res.body.items[0] };
        }
        res = await pbRequest({
            method: 'GET',
            url: `${base}/api/collections/${COLL}/records?page=1&perPage=200&sort=-lastSeen`,
            headers: { Authorization: token },
        });
        if (isCollectionMissing(res.status, res.raw + JSON.stringify(res.body || {}))) {
            collectionMissing = true;
            return { missing: true };
        }
        const mine = (res.body?.items || []).find((row) => String(row.userId || '') === String(userId));
        return { record: mine || null };
    }

    async function heartbeat() {
        if (collectionMissing) return null;
        const token = await ensureToken();
        if (!token) return null;
        const userId = userIdFromToken(token);
        if (!userId) return null;
        ownUserId = userId;

        const found = await findOwnRecord(token, userId);
        if (found.missing) return null;

        const payload = heartbeatPayload(userId);
        const base = PB_BASE.replace(/\/$/, '');
        const existing = found.record;
        let result;
        if (existing?.id) {
            ownRecordId = existing.id;
            result = await pbRequest({
                method: 'PATCH',
                url: `${base}/api/collections/${COLL}/records/${encodeURIComponent(existing.id)}`,
                headers: { Authorization: token, 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
            });
        } else {
            result = await pbRequest({
                method: 'POST',
                url: `${base}/api/collections/${COLL}/records`,
                headers: { Authorization: token, 'Content-Type': 'application/json' },
                data: JSON.stringify({ ...payload, enabled: true }),
            });
            if (isUniqueConflict(result.status, result.raw + JSON.stringify(result.body || {}))) {
                const retry = await findOwnRecord(token, userId);
                if (retry.record?.id) {
                    ownRecordId = retry.record.id;
                    result = await pbRequest({
                        method: 'PATCH',
                        url: `${base}/api/collections/${COLL}/records/${encodeURIComponent(retry.record.id)}`,
                        headers: { Authorization: token, 'Content-Type': 'application/json' },
                        data: JSON.stringify(payload),
                    });
                }
            }
        }

        if (isCollectionMissing(result.status, result.raw + JSON.stringify(result.body || {}))) {
            collectionMissing = true;
            return null;
        }

        const rec = (result.status >= 200 && result.status < 300 && result.body)
            ? result.body
            : existing;
        if (rec?.id) ownRecordId = rec.id;

        const enabled = rec && rec.enabled === false ? false : true;
        applyRemoteEnabled(enabled);
        return rec;
    }

    function applyRemoteEnabled(enabled) {
        const was = isRemoteDisabled();
        if (enabled) {
            if (was) {
                setRemoteDisabled(false);
                location.reload();
            }
            return;
        }
        if (!was) {
            setRemoteDisabled(true);
            location.reload();
        }
    }

    async function listAccessRecords() {
        const token = await ensureToken();
        if (!token) throw new Error('Δεν έγινε σύνδεση στη βάση (Chat). Άνοιξε το Chat μία φορά για λογαριασμό.');
        const base = PB_BASE.replace(/\/$/, '');
        const res = await pbRequest({
            method: 'GET',
            url: `${base}/api/collections/${COLL}/records?page=1&perPage=200&sort=-lastSeen`,
            headers: { Authorization: token },
        });
        if (isCollectionMissing(res.status, res.raw + JSON.stringify(res.body || {}))) {
            collectionMissing = true;
            return [];
        }
        if (res.status < 200 || res.status >= 300) {
            throw new Error(res.body?.message || `HTTP ${res.status}`);
        }
        return res.body?.items || [];
    }

    async function listPresenceRecords() {
        const token = await ensureToken();
        if (!token) return [];
        const base = PB_BASE.replace(/\/$/, '');
        const res = await pbRequest({
            method: 'GET',
            url: `${base}/api/collections/${PRESENCE_COLL}/records?page=1&perPage=200&sort=-lastSeen`,
            headers: { Authorization: token },
        });
        if (res.status < 200 || res.status >= 300) return [];
        return res.body?.items || [];
    }

    function mergeAccessRows(accessItems, presenceItems) {
        const map = new Map();
        for (const p of presenceItems) {
            const uid = String(p.userId || '');
            if (!uid) continue;
            map.set(uid, {
                userId: uid,
                displayName: p.displayName || 'Τεχνικός',
                lastSeen: p.lastSeen || '',
                store: p.store || '',
                bundleVersion: '',
                enabled: true,
                accessId: '',
            });
        }
        for (const a of accessItems) {
            const uid = String(a.userId || '');
            if (!uid) continue;
            const prev = map.get(uid) || {};
            map.set(uid, {
                userId: uid,
                displayName: a.displayName || prev.displayName || 'Τεχνικός',
                lastSeen: newerIso(a.lastSeen, prev.lastSeen),
                store: a.store || prev.store || '',
                bundleVersion: a.bundleVersion || '',
                enabled: a.enabled !== false,
                accessId: a.id || '',
            });
        }
        return [...map.values()].sort((a, b) => (new Date(b.lastSeen || 0).getTime() || 0) - (new Date(a.lastSeen || 0).getTime() || 0));
    }

    async function setUserEnabled(row, enabled) {
        const token = await ensureToken();
        if (!token) throw new Error('Δεν έγινε σύνδεση στη βάση.');
        if (collectionMissing) {
            throw new Error('Λείπει το collection suite_access στο PocketBase.');
        }
        const base = PB_BASE.replace(/\/$/, '');
        const payload = { enabled: !!enabled };
        if (row.accessId) {
            const res = await pbRequest({
                method: 'PATCH',
                url: `${base}/api/collections/${COLL}/records/${encodeURIComponent(row.accessId)}`,
                headers: { Authorization: token, 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
            });
            if (res.status < 200 || res.status >= 300) {
                throw new Error(res.body?.message || `HTTP ${res.status}`);
            }
            if (ownRecordId && row.accessId === ownRecordId) applyRemoteEnabled(!!enabled);
            return res.body;
        }
        const created = await pbRequest({
            method: 'POST',
            url: `${base}/api/collections/${COLL}/records`,
            headers: { Authorization: token, 'Content-Type': 'application/json' },
            data: JSON.stringify({
                userId: row.userId,
                displayName: String(row.displayName || 'Τεχνικός').slice(0, 64),
                lastSeen: row.lastSeen || new Date().toISOString(),
                store: String(row.store || '').slice(0, 64),
                enabled: !!enabled,
            }),
        });
        if (isCollectionMissing(created.status, created.raw + JSON.stringify(created.body || {}))) {
            collectionMissing = true;
            throw new Error('Λείπει το collection suite_access στο PocketBase.');
        }
        if (created.status < 200 || created.status >= 300) {
            throw new Error(created.body?.message || `HTTP ${created.status}`);
        }
        if (ownUserId && String(row.userId) === String(ownUserId)) applyRemoteEnabled(!!enabled);
        return created.body;
    }

    function showRemoteDisabledBanner() {
        if (document.getElementById('tm-mms-remote-disabled')) return;
        const mount = () => {
            if (document.getElementById('tm-mms-remote-disabled')) return;
            const box = document.createElement('div');
            box.id = 'tm-mms-remote-disabled';
            box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:2147483646;max-width:280px;padding:12px 14px;border-radius:12px;border:1px solid #7f1d1d;background:#1c1917;color:#fecaca;font:600 13px/1.35 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4)';
            box.textContent = 'Το MyManager Suite απενεργοποιήθηκε για αυτόν τον λογαριασμό από διαχειριστή.';
            (document.body || document.documentElement).appendChild(box);
        };
        if (document.body) mount();
        else document.addEventListener('DOMContentLoaded', mount);
    }

    function renderAccessList(root, items, error) {
        if (!root) return;
        const manage = canManageAccess();
        if (error) {
            root.innerHTML = `<p class="tm-setting-description" style="color:var(--tm-danger-color,#dc3545)">${escapeHtml(error)}</p>${collectionSetupHtml()}`;
            return;
        }
        if (!items.length) {
            root.innerHTML = collectionMissing
                ? `<p class="tm-setting-description">Δεν υπάρχουν εγγραφές ακόμα (ούτε στο Chat presence).</p>${collectionSetupHtml()}`
                : '<p class="tm-setting-description">Κανένας χρήστης ακόμα — ανοίξτε το MyManager με το suite για να εμφανιστείτε εδώ.</p>';
            return;
        }
        const onlineCount = items.filter((row) => (Date.now() - new Date(row.lastSeen || 0).getTime()) < ONLINE_MS).length;
        const setupNote = collectionMissing
            ? `<div style="margin-bottom:10px;padding:8px 10px;border-radius:8px;border:1px solid var(--tm-shop-item-border,#333);">${collectionSetupHtml()}<p class="tm-setting-description">Η λίστα παρακάτω είναι από το Chat (ποιος είναι online). Το on/off ανά χρήστη χρειάζεται το collection.</p></div>`
            : '';
        const rows = items.map((row) => {
            const online = (Date.now() - new Date(row.lastSeen || 0).getTime()) < ONLINE_MS;
            const on = row.enabled !== false;
            const mine = ownUserId && String(row.userId || '') === String(ownUserId);
            const toggle = manage && !collectionMissing
                ? `<label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;white-space:nowrap">
                    <input type="checkbox" class="tm-suite-access-toggle" ${on ? 'checked' : ''}>
                    ${on ? 'Ενεργό' : 'Off'}
                </label>`
                : `<span style="font-size:12px;font-weight:700;opacity:.8">${on ? 'Ενεργό' : 'Off'}</span>`;
            return `<div class="tm-suite-access-row" data-user-id="${escapeHtml(row.userId)}" data-access-id="${escapeHtml(row.accessId || '')}" data-display="${escapeHtml(row.displayName || '')}" data-store="${escapeHtml(row.store || '')}" data-seen="${escapeHtml(row.lastSeen || '')}" style="display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--tm-shop-item-border,#333);">
                <div style="min-width:0">
                    <div style="font-weight:750">${escapeHtml(row.displayName || 'Τεχνικός')}${row.bundleVersion ? ` <span style="font-weight:650;opacity:.65;font-size:12px">v${escapeHtml(row.bundleVersion)}</span>` : ''}${mine ? ' <span style="opacity:.6">(εσείς)</span>' : ''}</div>
                    <div style="font-size:12px;opacity:.72"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${online ? '#22c55e' : '#64748b'};margin-right:5px;vertical-align:middle"></span>${online ? 'Online' : 'Τελευταία εμφάνιση'} · ${escapeHtml(formatAgo(row.lastSeen))}${row.store ? ` · ${escapeHtml(row.store)}` : ''}</div>
                </div>
                ${toggle}
            </div>`;
        }).join('');
        root.innerHTML = `${setupNote}<p class="tm-setting-description" style="margin-bottom:6px">${items.length} χρήστες · ${onlineCount} online</p>${rows}`;
        if (!manage || collectionMissing) return;
        root.querySelectorAll('.tm-suite-access-row').forEach((el) => {
            const box = el.querySelector('.tm-suite-access-toggle');
            box?.addEventListener('change', async () => {
                const row = {
                    userId: el.getAttribute('data-user-id'),
                    accessId: el.getAttribute('data-access-id') || '',
                    displayName: el.getAttribute('data-display') || '',
                    store: el.getAttribute('data-store') || '',
                    lastSeen: el.getAttribute('data-seen') || '',
                };
                const mine = ownUserId && String(row.userId) === String(ownUserId);
                if (mine && !box.checked && !confirm('Θα απενεργοποιηθεί το suite σε αυτόν τον υπολογιστή. Σίγουρα;')) {
                    box.checked = true;
                    return;
                }
                box.disabled = true;
                try {
                    await setUserEnabled(row, box.checked);
                    refreshAccessPanel(root);
                } catch (err) {
                    box.checked = !box.checked;
                    alert(err.message || 'Αποτυχία ενημέρωσης');
                } finally {
                    box.disabled = false;
                }
            });
        });
    }

    async function refreshAccessPanel(root) {
        if (!root) return;
        collectionMissing = false;
        root.innerHTML = '<p class="tm-setting-description">Φόρτωση…</p>';
        try {
            await heartbeat();
            const [access, presence] = await Promise.all([
                listAccessRecords(),
                listPresenceRecords(),
            ]);
            renderAccessList(root, mergeAccessRows(access, presence));
        } catch (err) {
            renderAccessList(root, [], err.message);
        }
    }

    function mountSuiteAccessSettings(root) {
        if (!root) return;
        const wrap = root.parentElement;
        const btn = wrap?.querySelector('#tm-suite-access-refresh');
        if (btn && !btn.dataset.tmBound) {
            btn.dataset.tmBound = '1';
            btn.addEventListener('click', () => refreshAccessPanel(root));
        }
        refreshAccessPanel(root);
    }

    function getSuiteAccessSettingsHTML() {
        const info = typeof window.tmSettingsInfoBtn === 'function' ? window.tmSettingsInfoBtn('suite_access') : '';
        return `
            <div class="tm-settings-section">
                <header class="tm-settings-section-head">
                    <h3>Χρήστες suite ${info}</h3>
                    <p class="tm-settings-section-desc">Ποιος τρέχει το script · ενεργοποίηση / απενεργοποίηση ανά λογαριασμό.</p>
                </header>
                <div class="tm-setting-row" style="align-items:flex-start">
                    <div class="tm-setting-label" style="flex:1;min-width:0">
                        <div style="display:flex;gap:8px;flex-wrap:wrap">
                            <button type="button" class="tm-settings-input" id="tm-suite-access-refresh" style="width:auto;cursor:pointer">Ανανέωση λίστας</button>
                        </div>
                        <div id="tm-suite-access-root" style="margin-top:10px"></div>
                    </div>
                </div>
            </div>`;
    }

    function startPolling() {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(() => {
            heartbeat().catch(() => { /* ignore */ });
        }, POLL_MS);
        heartbeat().catch(() => { /* ignore */ });
    }

    window.initSuiteAccessFeature = function initSuiteAccessFeature() {
        startPolling();
    };

    window.showSuiteRemoteDisabledUi = showRemoteDisabledBanner;
    window.isSuiteRemoteDisabled = isRemoteDisabled;
    window.mountSuiteAccessSettings = mountSuiteAccessSettings;
    window.getSuiteAccessSettingsHTML = getSuiteAccessSettingsHTML;
})();
