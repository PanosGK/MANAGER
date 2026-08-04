// ==UserScript==
// @name         MyMANAGER Repair Collab (Whisper + Watch)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shared sticky whisper notes + status-watch pings for repairs (PocketBase)
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const RC_PB_BASE = 'https://mngerchat.littlejol.mywire.org';
    const RC_WHISPER_MAX = 500;
    const RC_WATCH_POLL_MS = 45000;
    const RC_LOCAL_WATCHES_KEY = 'tm_repair_watches_local_v1';
    const RC_WHISPER_COLL = 'repair_whispers';
    const RC_WATCH_COLL = 'repair_watches';
    const RC_STATUS_COLL = 'repair_status';

    let rcPollTimer = null;
    let rcAuthFailUntil = 0;
    let rcCollectionHintShown = false;

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getServiceIds() {
        try {
            if (typeof window.getServiceIdsFromPage === 'function') {
                return window.getServiceIdsFromPage();
            }
        } catch (_) { /* ignore */ }
        return null;
    }

    function getDisplayName() {
        try {
            if (typeof window.MMS_PROFILES?.parseLoginBlockDisplayName === 'function') {
                const n = String(window.MMS_PROFILES.parseLoginBlockDisplayName() || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        const el = document.querySelector('#login_block1 b, .rnr-b-loggedas b');
        if (el) {
            const n = String(el.textContent || '').replace(/^.*ως\s+/i, '').trim();
            if (n) return n.slice(0, 64);
        }
        return String(window.tmCurrentUser || window.config?.currentUser || window.config?.profileLabel || 'Τεχνικός').trim().slice(0, 64) || 'Τεχνικός';
    }

    function getUserKey() {
        try {
            const pid = String(window.tmGetActiveProfileId?.() || window.config?.profileId || '').trim();
            if (pid && pid !== '_unknown') return pid.slice(0, 64);
        } catch (_) { /* ignore */ }
        if (typeof window.suggestOfficeChatEmail === 'function') {
            const mail = String(window.suggestOfficeChatEmail() || '').trim().toLowerCase();
            if (mail.includes('@')) return mail.slice(0, 64);
        }
        return getDisplayName().toLowerCase().slice(0, 64);
    }

    function getStoreName() {
        try {
            if (typeof window.captureConnectedStoreFromPage === 'function') {
                const live = String(window.captureConnectedStoreFromPage(document) || '').trim();
                if (live) return live.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            const stored = String(GM_getValue('tm_connected_store_v1', '') || '').trim();
            if (stored) return stored.slice(0, 64);
        } catch (_) { /* ignore */ }
        return '';
    }

    function readStatusFromPage() {
        const selectors = [
            'select[name="iStatusID"]',
            'select[name="value_ccc_iStatusID_1"]',
            'select[id="value_ccc_iStatusID_1"]',
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const statusId = String(el.value || '').trim();
            if (!statusId) continue;
            const opt = el.options?.[el.selectedIndex];
            const statusLabel = String(opt?.text || statusId).replace(/\s+/g, ' ').trim().slice(0, 64);
            return { statusId, statusLabel };
        }
        const badge = document.querySelector('.statusbadge, .rnr-status');
        if (badge) {
            const label = String(badge.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 64);
            const m = label.match(/(\d{1,3})/);
            return { statusId: m ? m[1] : '', statusLabel: label || '' };
        }
        const ids = getServiceIds();
        if (ids?.statusId) {
            return { statusId: String(ids.statusId), statusLabel: String(ids.statusId) };
        }
        return { statusId: '', statusLabel: '' };
    }

    function rcRequestJson({ method, url, headers, data, timeout }) {
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
                timeout: timeout || 20000,
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

    async function rcEnsureAuth(STORAGE_KEYS) {
        if (Date.now() < rcAuthFailUntil) return '';
        try {
            if (typeof window.ensureMymanPocketBaseAuth === 'function') {
                const token = await window.ensureMymanPocketBaseAuth(STORAGE_KEYS || window.STORAGE_KEYS);
                if (token) return String(token);
            }
        } catch (_) { /* ignore */ }
        try {
            if (typeof window.ensureOfficeChatAuthToken === 'function') {
                const token = await window.ensureOfficeChatAuthToken(STORAGE_KEYS || window.STORAGE_KEYS);
                if (token) return String(token);
            }
        } catch (_) { /* ignore */ }
        rcAuthFailUntil = Date.now() + 60 * 1000;
        return '';
    }

    function loadLocalWatchMap() {
        try {
            const raw = GM_getValue(RC_LOCAL_WATCHES_KEY, '{}');
            const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (_) {
            return {};
        }
    }

    function saveLocalWatchMap(map) {
        try {
            GM_setValue(RC_LOCAL_WATCHES_KEY, JSON.stringify(map || {}));
        } catch (_) { /* ignore */ }
    }

    function isLocallyWatching(invoiceLinesId) {
        const map = loadLocalWatchMap();
        return !!map[String(invoiceLinesId || '')];
    }

    function setLocalWatching(invoiceLinesId, meta) {
        const id = String(invoiceLinesId || '');
        if (!id) return;
        const map = loadLocalWatchMap();
        if (meta) map[id] = { ...meta, updatedAt: Date.now() };
        else delete map[id];
        saveLocalWatchMap(map);
    }

    function watchKeyFor(invoiceLinesId) {
        return `${getUserKey()}|${String(invoiceLinesId || '')}`.slice(0, 128);
    }

    async function rcFindByFilter(token, collection, filter) {
        const base = RC_PB_BASE.replace(/\/$/, '');
        const url = `${base}/api/collections/${collection}/records?page=1&perPage=1&filter=${encodeURIComponent(filter)}`;
        return rcRequestJson({
            method: 'GET',
            url,
            headers: { Authorization: token },
            timeout: 15000,
        });
    }

    async function rcUpsertByUnique(token, collection, uniqueField, uniqueValue, payload) {
        const filter = `${uniqueField}="${String(uniqueValue).replace(/"/g, '\\"')}"`;
        const listed = await rcFindByFilter(token, collection, filter);
        const base = RC_PB_BASE.replace(/\/$/, '');
        const existing = listed.body?.items?.[0];
        if (listed.status === 404 || /missing|unknown collection|wasn't found/i.test(String(listed.raw || ''))) {
            return { ok: false, missingCollection: true, status: listed.status, body: listed.body };
        }
        if (existing?.id) {
            const updated = await rcRequestJson({
                method: 'PATCH',
                url: `${base}/api/collections/${collection}/records/${encodeURIComponent(existing.id)}`,
                headers: { Authorization: token, 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
                timeout: 15000,
            });
            return {
                ok: updated.status >= 200 && updated.status < 300,
                status: updated.status,
                body: updated.body || existing,
                raw: updated.raw,
            };
        }
        const created = await rcRequestJson({
            method: 'POST',
            url: `${base}/api/collections/${collection}/records`,
            headers: { Authorization: token, 'Content-Type': 'application/json' },
            data: JSON.stringify({ ...payload, [uniqueField]: uniqueValue }),
            timeout: 15000,
        });
        return {
            ok: created.status >= 200 && created.status < 300,
            status: created.status,
            body: created.body,
            raw: created.raw,
        };
    }

    async function rcDeleteByUnique(token, collection, uniqueField, uniqueValue) {
        const filter = `${uniqueField}="${String(uniqueValue).replace(/"/g, '\\"')}"`;
        const listed = await rcFindByFilter(token, collection, filter);
        const existing = listed.body?.items?.[0];
        if (!existing?.id) return { ok: true, missing: true };
        const base = RC_PB_BASE.replace(/\/$/, '');
        const deleted = await rcRequestJson({
            method: 'DELETE',
            url: `${base}/api/collections/${collection}/records/${encodeURIComponent(existing.id)}`,
            headers: { Authorization: token },
            timeout: 12000,
        });
        return { ok: deleted.status >= 200 && deleted.status < 300, status: deleted.status };
    }

    function hintMissingCollections() {
        if (rcCollectionHintShown) return;
        rcCollectionHintShown = true;
        if (typeof window.createNotification === 'function') {
            window.createNotification(
                'Repair Collab: πρόσθεσε collections repair_whispers / repair_watches / repair_status στο PocketBase (δες SETUP.md §8)',
                '💬',
                { id: 'tm_rc_missing_collections' }
            );
        }
    }

    // ─── Whisper ───────────────────────────────────────────────────────────

    async function fetchWhisper(token, invoiceLinesId) {
        const filter = `invoiceLinesId="${String(invoiceLinesId).replace(/"/g, '\\"')}"`;
        const res = await rcFindByFilter(token, RC_WHISPER_COLL, filter);
        if (res.status === 404 || /missing|unknown collection|wasn't found/i.test(String(res.raw || ''))) {
            return { missingCollection: true };
        }
        return { record: res.body?.items?.[0] || null };
    }

    async function saveWhisper(token, ids, text) {
        const cleaned = String(text || '').trim().slice(0, RC_WHISPER_MAX);
        const payload = {
            invoiceLinesId: String(ids.invoiceLinesId),
            invoiceNumber: String(ids.invoiceNumber || ids.invoiceLinesId).slice(0, 64),
            text: cleaned,
            updatedBy: getDisplayName(),
            updatedAt: new Date().toISOString(),
            store: getStoreName(),
        };
        if (!cleaned) {
            // Empty = clear shared note
            return rcUpsertByUnique(token, RC_WHISPER_COLL, 'invoiceLinesId', ids.invoiceLinesId, payload);
        }
        return rcUpsertByUnique(token, RC_WHISPER_COLL, 'invoiceLinesId', ids.invoiceLinesId, payload);
    }

    function formatWhisperMeta(rec) {
        if (!rec) return '';
        const who = String(rec.updatedBy || '').trim();
        let when = '';
        try {
            const d = new Date(rec.updatedAt || 0);
            if (!Number.isNaN(d.getTime())) {
                when = d.toLocaleString('el-GR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                });
            }
        } catch (_) { /* ignore */ }
        if (who && when) return `${who} · ${when}`;
        if (who) return who;
        return '';
    }

    function whisperPreviewText(text) {
        const t = String(text || '').replace(/\s+/g, ' ').trim();
        if (!t) return 'κενό';
        return t.length > 48 ? `${t.slice(0, 48)}…` : t;
    }

    function injectWhisperStyles() {
        let style = document.getElementById('tm-repair-collab-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-repair-collab-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            #tm-repair-whisper {
                margin: 0 0 4px;
                padding: 0;
                border: 0;
                background: transparent;
                font-family: "Segoe UI", system-ui, sans-serif;
                max-width: 420px;
            }
            .tm-rw-toggle {
                display: inline-flex; align-items: center; gap: 5px;
                max-width: 100%;
                border: 0; background: transparent; padding: 1px 2px;
                color: #94a3b8; font-size: 11px; line-height: 1.3;
                cursor: pointer; border-radius: 4px;
            }
            .tm-rw-toggle:hover { color: #64748b; background: rgba(148, 163, 184, 0.12); }
            #tm-repair-whisper.has-note .tm-rw-toggle { color: #64748b; }
            .tm-rw-ico { font-size: 11px; opacity: 0.75; }
            .tm-rw-label { font-weight: 600; letter-spacing: 0.01em; }
            .tm-rw-preview {
                min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                max-width: 260px; font-weight: 400; opacity: 0.85;
            }
            .tm-rw-chevron { font-size: 9px; opacity: 0.7; margin-left: 2px; }
            #tm-repair-whisper.is-open .tm-rw-chevron { transform: rotate(180deg); }
            .tm-rw-body {
                display: none;
                margin-top: 4px;
                padding: 6px 7px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: #f8fafc;
            }
            #tm-repair-whisper.is-open .tm-rw-body { display: block; }
            #tm-repair-whisper-text {
                width: 100%; box-sizing: border-box; min-height: 44px; max-height: 120px;
                border: 1px solid #e2e8f0; border-radius: 6px;
                padding: 5px 7px; font-size: 12px; line-height: 1.35;
                background: #fff; color: #334155; resize: vertical;
            }
            #tm-repair-whisper-text:focus {
                outline: none; border-color: #cbd5e1;
            }
            .tm-rw-actions {
                display: flex; align-items: center; gap: 6px; margin-top: 5px; flex-wrap: wrap;
            }
            .tm-rw-save, .tm-rw-clear {
                border: 0; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600;
                cursor: pointer; background: transparent;
            }
            .tm-rw-save { color: #475569; border: 1px solid #cbd5e1; background: #fff; }
            .tm-rw-save:hover { background: #f1f5f9; }
            .tm-rw-save:disabled { opacity: 0.55; cursor: wait; }
            .tm-rw-clear { color: #94a3b8; }
            .tm-rw-clear:hover { color: #64748b; }
            .tm-rw-status { font-size: 10px; color: #94a3b8; min-height: 12px; }
            .tm-rw-meta { font-size: 10px; color: #94a3b8; margin-top: 3px; }
            #tm-repair-watch-btn.is-watching {
                background: color-mix(in srgb, #2563eb 16%, #fff) !important;
                outline: 2px solid color-mix(in srgb, #2563eb 45%, transparent);
            }
        `;
    }

    function findWhisperMount() {
        return document.querySelector('.rnr-b-editheader')
            || document.querySelector('.rnr-c-editheader')
            || document.querySelector('form[id*="edit"]')
            || document.querySelector('.rnr-b-editbuttons')
            || document.querySelector('#form1')
            || document.body;
    }

    async function injectWhisperUi(STORAGE_KEYS, ids) {
        if (document.getElementById('tm-repair-whisper')) return;
        injectWhisperStyles();
        const mount = findWhisperMount();
        if (!mount) return;

        const box = document.createElement('div');
        box.id = 'tm-repair-whisper';
        box.className = 'is-empty';
        box.innerHTML = `
            <button type="button" class="tm-rw-toggle" id="tm-repair-whisper-toggle" title="Κοινό σημείωμα επισκευής" aria-expanded="false">
                <span class="tm-rw-ico" aria-hidden="true">💬</span>
                <span class="tm-rw-label">Whisper</span>
                <span class="tm-rw-preview" id="tm-repair-whisper-preview">…</span>
                <span class="tm-rw-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="tm-rw-body">
                <textarea id="tm-repair-whisper-text" maxlength="${RC_WHISPER_MAX}"
                    placeholder="Σύντομο κοινό σημείωμα…"></textarea>
                <div class="tm-rw-actions">
                    <button type="button" class="tm-rw-save" id="tm-repair-whisper-save">Αποθήκευση</button>
                    <button type="button" class="tm-rw-clear" id="tm-repair-whisper-clear">Καθαρισμός</button>
                    <span class="tm-rw-status" id="tm-repair-whisper-status"></span>
                </div>
                <div class="tm-rw-meta" id="tm-repair-whisper-meta"></div>
            </div>
        `;

        if (mount.classList?.contains('rnr-b-editheader') || mount.classList?.contains('rnr-c-editheader')) {
            mount.insertAdjacentElement('afterend', box);
        } else {
            mount.insertAdjacentElement('afterbegin', box);
        }

        const toggleBtn = box.querySelector('#tm-repair-whisper-toggle');
        const previewEl = box.querySelector('#tm-repair-whisper-preview');
        const textEl = box.querySelector('#tm-repair-whisper-text');
        const metaEl = box.querySelector('#tm-repair-whisper-meta');
        const statusEl = box.querySelector('#tm-repair-whisper-status');
        const saveBtn = box.querySelector('#tm-repair-whisper-save');
        const clearBtn = box.querySelector('#tm-repair-whisper-clear');
        let saveTimer = null;
        let lastSaved = '';

        function setOpen(open) {
            box.classList.toggle('is-open', !!open);
            toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                window.setTimeout(() => textEl.focus(), 30);
            }
        }

        function refreshPreview(text, rec) {
            const trimmed = String(text || '').trim();
            box.classList.toggle('is-empty', !trimmed);
            box.classList.toggle('has-note', !!trimmed);
            if (previewEl) previewEl.textContent = whisperPreviewText(trimmed);
            if (metaEl) metaEl.textContent = formatWhisperMeta(rec);
        }

        function setStatus(msg) {
            if (statusEl) statusEl.textContent = msg || '';
        }

        async function persist(forceClear) {
            const token = await rcEnsureAuth(STORAGE_KEYS);
            if (!token) {
                setStatus('Χωρίς σύνδεση');
                return;
            }
            saveBtn.disabled = true;
            setStatus('…');
            const value = forceClear ? '' : String(textEl.value || '');
            const result = await saveWhisper(token, ids, value);
            saveBtn.disabled = false;
            if (result.missingCollection) {
                hintMissingCollections();
                setStatus('Λείπουν collections');
                return;
            }
            if (!result.ok) {
                setStatus('Αποτυχία');
                return;
            }
            lastSaved = String(value || '').trim();
            refreshPreview(lastSaved, result.body);
            setStatus(lastSaved ? 'OK' : 'Καθαρίστηκε');
            window.setTimeout(() => setStatus(''), 1400);
            if (!lastSaved) setOpen(false);
        }

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setOpen(!box.classList.contains('is-open'));
        });
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            persist(false);
        });
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            textEl.value = '';
            persist(true);
        });
        textEl.addEventListener('input', () => {
            if (previewEl) previewEl.textContent = whisperPreviewText(textEl.value);
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(() => {
                if (String(textEl.value || '').trim() === lastSaved) return;
                persist(false);
            }, 1600);
        });

        const token = await rcEnsureAuth(STORAGE_KEYS);
        if (!token) {
            refreshPreview('', null);
            if (previewEl) previewEl.textContent = 'εκτός σύνδεσης';
            return;
        }
        const loaded = await fetchWhisper(token, ids.invoiceLinesId);
        if (loaded.missingCollection) {
            hintMissingCollections();
            if (previewEl) previewEl.textContent = 'setup PB';
            return;
        }
        const rec = loaded.record;
        const text = String(rec?.text || '');
        textEl.value = text;
        lastSaved = text.trim();
        refreshPreview(lastSaved, rec);
        // Stay collapsed — only a one-line preview when a note exists
        setOpen(false);
    }

    // ─── Watch ─────────────────────────────────────────────────────────────

    async function fetchMyWatch(token, invoiceLinesId) {
        const key = watchKeyFor(invoiceLinesId);
        const filter = `watchKey="${key.replace(/"/g, '\\"')}"`;
        const res = await rcFindByFilter(token, RC_WATCH_COLL, filter);
        if (res.status === 404 || /missing|unknown collection|wasn't found/i.test(String(res.raw || ''))) {
            return { missingCollection: true };
        }
        return { record: res.body?.items?.[0] || null };
    }

    async function listMyWatches(token) {
        const userKey = getUserKey().replace(/"/g, '\\"');
        const base = RC_PB_BASE.replace(/\/$/, '');
        const url = `${base}/api/collections/${RC_WATCH_COLL}/records?page=1&perPage=200&filter=${encodeURIComponent(`userKey="${userKey}"`)}`;
        const res = await rcRequestJson({
            method: 'GET',
            url,
            headers: { Authorization: token },
            timeout: 15000,
        });
        if (res.status === 404 || /missing|unknown collection|wasn't found/i.test(String(res.raw || ''))) {
            return { missingCollection: true, items: [] };
        }
        return { items: Array.isArray(res.body?.items) ? res.body.items : [] };
    }

    async function addWatch(token, ids, statusId) {
        const key = watchKeyFor(ids.invoiceLinesId);
        const payload = {
            watchKey: key,
            invoiceLinesId: String(ids.invoiceLinesId),
            invoiceNumber: String(ids.invoiceNumber || ids.invoiceLinesId).slice(0, 64),
            userKey: getUserKey(),
            displayName: getDisplayName(),
            lastSeenStatusId: String(statusId || ''),
            createdAt: new Date().toISOString(),
        };
        return rcUpsertByUnique(token, RC_WATCH_COLL, 'watchKey', key, payload);
    }

    async function removeWatch(token, invoiceLinesId) {
        return rcDeleteByUnique(token, RC_WATCH_COLL, 'watchKey', watchKeyFor(invoiceLinesId));
    }

    async function markWatchSeen(token, invoiceLinesId, statusId) {
        const key = watchKeyFor(invoiceLinesId);
        return rcUpsertByUnique(token, RC_WATCH_COLL, 'watchKey', key, {
            watchKey: key,
            invoiceLinesId: String(invoiceLinesId),
            userKey: getUserKey(),
            displayName: getDisplayName(),
            lastSeenStatusId: String(statusId || ''),
        });
    }

    async function publishRepairStatus(token, ids, statusId, statusLabel) {
        if (!ids?.invoiceLinesId || !statusId) return { ok: false };
        const payload = {
            invoiceLinesId: String(ids.invoiceLinesId),
            invoiceNumber: String(ids.invoiceNumber || ids.invoiceLinesId).slice(0, 64),
            statusId: String(statusId).slice(0, 16),
            statusLabel: String(statusLabel || statusId).slice(0, 64),
            changedBy: getDisplayName(),
            changedAt: new Date().toISOString(),
        };
        return rcUpsertByUnique(token, RC_STATUS_COLL, 'invoiceLinesId', ids.invoiceLinesId, payload);
    }

    async function fetchRepairStatus(token, invoiceLinesId) {
        const filter = `invoiceLinesId="${String(invoiceLinesId).replace(/"/g, '\\"')}"`;
        const res = await rcFindByFilter(token, RC_STATUS_COLL, filter);
        if (res.status === 404 || /missing|unknown collection|wasn't found/i.test(String(res.raw || ''))) {
            return { missingCollection: true };
        }
        return { record: res.body?.items?.[0] || null };
    }

    function notifyWatchStatusChange(watch, statusRec) {
        const num = statusRec.invoiceNumber || watch.invoiceNumber || watch.invoiceLinesId;
        const label = statusRec.statusLabel || statusRec.statusId || '?';
        const by = statusRec.changedBy ? ` · ${statusRec.changedBy}` : '';
        const msg = `Επισκευή #${num}: ${label}${by}`;
        if (typeof window.createNotification === 'function') {
            window.createNotification(msg, '👀', {
                id: `tm_watch_${watch.invoiceLinesId}_${statusRec.statusId}_${statusRec.changedAt || ''}`,
            });
        }
        try {
            if (typeof Notification !== 'undefined'
                && Notification.permission === 'granted'
                && document.hidden) {
                const n = new Notification('Watch · αλλαγή status', {
                    body: msg.slice(0, 160),
                    tag: `tm-watch-${watch.invoiceLinesId}`,
                    renotify: true,
                    silent: false,
                });
                n.onclick = () => {
                    try { window.focus(); } catch (_) { /* ignore */ }
                    try {
                        const url = `https://thefixers.mymanager.gr/mymanagerservice/service_edit.php?editid1=${encodeURIComponent(watch.invoiceLinesId)}`;
                        window.location.href = url;
                    } catch (_) { /* ignore */ }
                    try { n.close(); } catch (_) { /* ignore */ }
                };
            }
        } catch (_) { /* ignore */ }
    }

    async function pollWatchUpdates(STORAGE_KEYS) {
        const token = await rcEnsureAuth(STORAGE_KEYS);
        if (!token) return;
        const listed = await listMyWatches(token);
        if (listed.missingCollection) {
            hintMissingCollections();
            return;
        }
        const localMap = loadLocalWatchMap();
        const serverIds = new Set();
        for (const watch of listed.items) {
            const id = String(watch.invoiceLinesId || '');
            if (!id) continue;
            serverIds.add(id);
            localMap[id] = {
                invoiceNumber: watch.invoiceNumber || id,
                lastSeenStatusId: watch.lastSeenStatusId || '',
                updatedAt: Date.now(),
            };
            const st = await fetchRepairStatus(token, id);
            if (st.missingCollection) {
                hintMissingCollections();
                break;
            }
            const rec = st.record;
            if (!rec?.statusId) continue;
            const seen = String(watch.lastSeenStatusId || '');
            const current = String(rec.statusId || '');
            const changedBy = String(rec.changedBy || '');
            const me = getDisplayName();
            if (current && current !== seen && changedBy && changedBy !== me) {
                notifyWatchStatusChange(watch, rec);
                await markWatchSeen(token, id, current);
                localMap[id].lastSeenStatusId = current;
            }
        }
        // Drop local leftovers not on server
        Object.keys(localMap).forEach((id) => {
            if (!serverIds.has(id)) delete localMap[id];
        });
        saveLocalWatchMap(localMap);
        updateWatchButtonUi();
    }

    function updateWatchButtonUi() {
        const btn = document.getElementById('tm-repair-watch-btn');
        if (!btn) return;
        const id = btn.getAttribute('data-invoice-lines-id') || '';
        const on = isLocallyWatching(id);
        btn.classList.toggle('is-watching', on);
        btn.innerHTML = on ? '👀&nbsp;Παρακολουθείς' : '👀&nbsp;Παρακολούθηση';
        btn.title = on
            ? 'Σταμάτα την παρακολούθηση αυτής της επισκευής'
            : 'Ειδοποίηση όταν αλλάξει το status αυτής της επισκευής';
    }

    function injectWatchButton(STORAGE_KEYS, ids) {
        if (document.getElementById('tm-repair-watch-btn')) {
            updateWatchButtonUi();
            return;
        }
        const anchor =
            document.querySelector('#tm-repair-reminder-wrap')?.parentElement
            || document.querySelector('.rnr-b-editbuttons .rnr-buttons-right')
            || document.querySelector('.rnr-b-editbuttons .rnr-buttons-left')
            || document.querySelector('.rnr-b-editbuttons');
        if (!anchor) return;

        const wrap = document.createElement('div');
        wrap.id = 'tm-repair-watch-wrap';
        wrap.style.cssText = 'display:inline-flex;align-items:stretch;margin-left:4px;vertical-align:middle;';
        wrap.innerHTML = `
            <a href="#" id="tm-repair-watch-btn" class="rnr-button" role="button"
                data-invoice-lines-id="${escapeHtml(ids.invoiceLinesId)}">👀&nbsp;Παρακολούθηση</a>
        `;
        const reminderWrap = document.getElementById('tm-repair-reminder-wrap');
        if (reminderWrap?.parentElement === anchor) {
            reminderWrap.insertAdjacentElement('afterend', wrap);
        } else {
            anchor.appendChild(wrap);
        }

        const btn = wrap.querySelector('#tm-repair-watch-btn');
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const token = await rcEnsureAuth(STORAGE_KEYS);
            if (!token) {
                if (typeof window.createNotification === 'function') {
                    window.createNotification('Χωρίς σύνδεση chat server για παρακολούθηση', '👀');
                }
                return;
            }
            const watching = isLocallyWatching(ids.invoiceLinesId);
            btn.style.opacity = '0.6';
            if (watching) {
                const res = await removeWatch(token, ids.invoiceLinesId);
                if (res.ok || res.missing) setLocalWatching(ids.invoiceLinesId, null);
            } else {
                const st = readStatusFromPage();
                const res = await addWatch(token, ids, st.statusId);
                if (res.missingCollection) {
                    hintMissingCollections();
                } else if (res.ok) {
                    setLocalWatching(ids.invoiceLinesId, {
                        invoiceNumber: ids.invoiceNumber,
                        lastSeenStatusId: st.statusId || '',
                    });
                    // Seed status row so others/we have a baseline
                    if (st.statusId) {
                        await publishRepairStatus(token, ids, st.statusId, st.statusLabel);
                    }
                    try {
                        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
                            Notification.requestPermission().catch(() => {});
                        }
                    } catch (_) { /* ignore */ }
                }
            }
            btn.style.opacity = '';
            updateWatchButtonUi();
        });

        // Sync button from server
        (async () => {
            const token = await rcEnsureAuth(STORAGE_KEYS);
            if (!token) {
                updateWatchButtonUi();
                return;
            }
            const mine = await fetchMyWatch(token, ids.invoiceLinesId);
            if (mine.missingCollection) {
                hintMissingCollections();
                updateWatchButtonUi();
                return;
            }
            if (mine.record) {
                setLocalWatching(ids.invoiceLinesId, {
                    invoiceNumber: mine.record.invoiceNumber || ids.invoiceNumber,
                    lastSeenStatusId: mine.record.lastSeenStatusId || '',
                });
                const st = readStatusFromPage();
                if (st.statusId && String(mine.record.lastSeenStatusId || '') !== String(st.statusId)) {
                    await markWatchSeen(token, ids.invoiceLinesId, st.statusId);
                }
            } else {
                setLocalWatching(ids.invoiceLinesId, null);
            }
            updateWatchButtonUi();
        })();
    }

    function wireStatusPublisher(STORAGE_KEYS, ids) {
        if (wireStatusPublisher._wired) return;
        wireStatusPublisher._wired = true;
        let lastPublished = '';

        const publish = async (source) => {
            const st = readStatusFromPage();
            if (!st.statusId) return;
            const fingerprint = `${ids.invoiceLinesId}:${st.statusId}`;
            if (fingerprint === lastPublished) return;
            // Debounce rapid duplicate events
            if (publish._pending === fingerprint) return;
            publish._pending = fingerprint;
            window.setTimeout(async () => {
                publish._pending = '';
                const again = readStatusFromPage();
                if (!again.statusId || `${ids.invoiceLinesId}:${again.statusId}` !== fingerprint) return;
                const token = await rcEnsureAuth(STORAGE_KEYS);
                if (!token) return;
                const res = await publishRepairStatus(token, ids, again.statusId, again.statusLabel);
                if (res.missingCollection) {
                    hintMissingCollections();
                    return;
                }
                if (res.ok) {
                    lastPublished = fingerprint;
                    if (isLocallyWatching(ids.invoiceLinesId)) {
                        await markWatchSeen(token, ids.invoiceLinesId, again.statusId);
                        setLocalWatching(ids.invoiceLinesId, {
                            invoiceNumber: ids.invoiceNumber,
                            lastSeenStatusId: again.statusId,
                        });
                    }
                }
            }, source === 'dropdown' ? 400 : 200);
        };

        const statusSelect = document.querySelector(
            'select[name="iStatusID"], select[name="value_ccc_iStatusID_1"], select[id="value_ccc_iStatusID_1"]'
        );
        statusSelect?.addEventListener('change', () => publish('dropdown'));

        document.querySelectorAll('form').forEach((form) => {
            form.addEventListener('submit', () => publish('submit'));
        });

        document.addEventListener('click', (e) => {
            const btn = e.target.closest?.('.rnr-b-editbuttons a.rnr-button, .rnr-b-editbuttons button');
            if (!btn) return;
            const text = String(btn.textContent || btn.value || '').toLowerCase();
            if (/back\s*to\s*list|επιστροφή|λιστα|λίστα|print|εκτύπ/.test(text)) return;
            window.setTimeout(() => publish('button'), 300);
        }, true);
    }

    function tryInjectCollabUi(STORAGE_KEYS, attempt) {
        const ids = getServiceIds();
        if (!ids?.invoiceLinesId) {
            if ((attempt || 0) < 25) {
                window.setTimeout(() => tryInjectCollabUi(STORAGE_KEYS, (attempt || 0) + 1), 400);
            }
            return;
        }
        injectWhisperUi(STORAGE_KEYS, ids);
        injectWatchButton(STORAGE_KEYS, ids);
        wireStatusPublisher(STORAGE_KEYS, ids);
    }

    function startWatchPolling(STORAGE_KEYS) {
        if (rcPollTimer) return;
        const tick = () => {
            pollWatchUpdates(STORAGE_KEYS).catch(() => {});
        };
        tick();
        rcPollTimer = window.setInterval(tick, RC_WATCH_POLL_MS);
    }

    window.initRepairCollabFeature = function initRepairCollabFeature(config, STORAGE_KEYS) {
        if (!config) return;
        startWatchPolling(STORAGE_KEYS);

        if (!window.location.pathname.includes('service_edit.php')) return;

        const boot = () => setTimeout(() => tryInjectCollabUi(STORAGE_KEYS, 0), 350);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot, { once: true });
        } else {
            boot();
        }
    };
})();
