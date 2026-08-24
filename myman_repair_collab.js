// ==UserScript==
// @name         MyMANAGER Repair Collab (Whisper)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shared sticky whisper notes for repairs (PocketBase)
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
    const RC_WHISPER_COLL = 'repair_whispers';

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
            if (typeof window.tmGetLoggedInDisplayName === 'function') {
                const n = String(window.tmGetLoggedInDisplayName({ fallback: null }) || '').trim();
                if (n) return n.slice(0, 64);
            }
            if (typeof window.MMS_PROFILES?.getLoggedInDisplayName === 'function') {
                const n = String(window.MMS_PROFILES.getLoggedInDisplayName({ fallback: null }) || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
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

    function hintMissingCollections() {
        if (rcCollectionHintShown) return;
        rcCollectionHintShown = true;
        if (typeof window.createNotification === 'function') {
            window.createNotification(
                'Whisper: πρόσθεσε collection repair_whispers στο PocketBase',
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
                margin: 0 0 8px;
                padding: 0;
                border: 0;
                background: transparent;
                font-family: "Segoe UI", system-ui, sans-serif;
                max-width: 100%;
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
                opacity: 0.85; max-width: 220px;
            }
            .tm-rw-chevron { font-size: 9px; opacity: 0.7; }
            .tm-rw-modal-backdrop {
                display: none; position: fixed; inset: 0; z-index: 100050;
                background: rgba(15, 23, 42, 0.35); align-items: center; justify-content: center;
                padding: 16px;
            }
            .tm-rw-modal-backdrop.is-open { display: flex; }
            .tm-rw-modal {
                width: min(420px, 100%);
                background: #fff; border-radius: 10px; padding: 12px 14px 14px;
                box-shadow: 0 12px 40px rgba(15, 23, 42, 0.25);
            }
            .tm-rw-modal-header {
                display: flex; align-items: center; justify-content: space-between;
                gap: 8px; margin-bottom: 8px; font-size: 13px; font-weight: 650; color: #334155;
            }
            .tm-rw-modal-close {
                border: 0; background: transparent; cursor: pointer; color: #94a3b8;
                font-size: 18px; line-height: 1; border-radius: 6px; padding: 2px 6px;
            }
            .tm-rw-modal-close:hover {
                background: #f1f5f9;
                color: #64748b;
            }
            #tm-repair-whisper-text {
                width: 100%; box-sizing: border-box; min-height: 120px; max-height: 60vh;
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
        `;
    }

    function findWhisperMount() {
        const assignmentField = document.querySelector('[data-fieldname="ccc_dAssignDate"]');
        const etdField = document.querySelector('[data-fieldname="ccc_iETD"]');
        const etcField = document.querySelector('[data-fieldname="ccc_iETC"]');
        const totalField = document.querySelector('[data-fieldname="iTotalAmount"]');

        const tdHost = assignmentField?.closest('td')
            || etdField?.closest('td')
            || etcField?.closest('td')
            || totalField?.closest('td');
        if (tdHost) return tdHost;

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
        `;

        if (mount.matches?.('td')) {
            mount.insertAdjacentElement('beforeend', box);
        } else if (mount.classList?.contains('rnr-b-editheader') || mount.classList?.contains('rnr-c-editheader')) {
            mount.insertAdjacentElement('afterend', box);
        } else {
            mount.insertAdjacentElement('afterbegin', box);
        }

        const toggleBtn = box.querySelector('#tm-repair-whisper-toggle');
        const previewEl = box.querySelector('#tm-repair-whisper-preview');

        const modal = document.createElement('div');
        modal.id = 'tm-repair-whisper-modal';
        modal.className = 'tm-rw-modal-backdrop';
        modal.innerHTML = `
            <div class="tm-rw-modal" role="dialog" aria-modal="true" aria-labelledby="tm-rw-modal-title">
                <div class="tm-rw-modal-header">
                    <span id="tm-rw-modal-title">💬 Whisper σημείωμα επισκευής</span>
                    <button type="button" class="tm-rw-modal-close" id="tm-rw-modal-close" aria-label="Κλείσιμο">×</button>
                </div>
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
        document.body.appendChild(modal);

        const textEl = modal.querySelector('#tm-repair-whisper-text');
        const metaEl = modal.querySelector('#tm-repair-whisper-meta');
        const statusEl = modal.querySelector('#tm-repair-whisper-status');
        const saveBtn = modal.querySelector('#tm-repair-whisper-save');
        const clearBtn = modal.querySelector('#tm-repair-whisper-clear');
        const closeBtn = modal.querySelector('#tm-rw-modal-close');
        let saveTimer = null;
        let lastSaved = '';

        function setOpen(open) {
            modal.classList.toggle('is-open', !!open);
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
            setOpen(true);
        });
        closeBtn.addEventListener('click', () => setOpen(false));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) setOpen(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                setOpen(false);
            }
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
        setOpen(false);
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
    }

    window.stopRepairCollabFeature = function stopRepairCollabFeature() {
        document.getElementById('tm-repair-whisper')?.remove();
        document.getElementById('tm-repair-whisper-modal')?.remove();
        document.getElementById('tm-repair-watch-wrap')?.remove();
    };

    window.initRepairCollabFeature = function initRepairCollabFeature(config, STORAGE_KEYS) {
        if (!config || config.repairCollabEnabled === false) {
            window.stopRepairCollabFeature();
            return;
        }

        if (!window.location.pathname.includes('service_edit.php')) return;

        const boot = () => setTimeout(() => tryInjectCollabUi(STORAGE_KEYS, 0), 350);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot, { once: true });
        } else {
            boot();
        }
    };
})();
