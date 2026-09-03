// ==UserScript==
// @name         MyManager Order History Feature
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tracks and displays history of accepted orders
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      thefixers.mymanager.gr
// @connect      mngerchat.littlejol.mywire.org
// ==/UserScript==

(function() {
    'use strict';

    // Respect user setting: disable entire feature if turned off
    const orderHistoryEnabled = GM_getValue('orderHistoryEnabled', true);
    if (!orderHistoryEnabled) {
        // Do not run any logic if disabled
        return;
    }

    // Optional: status checking (remote fetch) toggle to avoid heavy requests
    // Default ON so deleted/removed orders are detected correctly
    const orderHistoryStatusCheckEnabled = GM_getValue('orderHistoryStatusCheckEnabled', true);
    // Optional: background polling of order pages (even when not currently viewing them)
    const orderHistoryBackgroundEnabled = GM_getValue('orderHistoryBackgroundEnabled', true);
    /** Shared PocketBase / server mode — see window.suiteUseDatabase in utils. */
    function ohUseDatabase() {
        if (typeof window.suiteUseDatabase === 'function') return window.suiteUseDatabase();
        try {
            return GM_getValue('orderHistoryUseDatabase', true) !== false;
        } catch (_) {
            return true;
        }
    }
    
    // Detect current path once
    const path = window.location.pathname || '';
    const onOrdersPage = path.includes('srvorders_list.php') || path.includes('sparepartstoorder_list.php');

    // Detect which page we're on and use separate storage for each
    const isServiceOrdersPage = path.includes('srvorders_list.php');
    const isPartsOrdersPage = path.includes('sparepartstoorder_list.php');
    
    // Storage keys for order history (separate for each PAGE, not order type)
    const CURRENT_PAGE_HISTORY_KEY = isServiceOrdersPage 
        ? 'tm_srvorders_page_history' 
        : 'tm_partsorders_page_history';
    
    const MAX_HISTORY_ITEMS = 100; // Legacy local history cap (migration only)
    const OH_PENDING_KEY = 'tm_oh_pending_upserts_v1'; // short write buffer until server ack
    const OH_PB_BASE = 'https://mngerchat.littlejol.mywire.org';
    // Same silent password salt as office chat — shared PB user, independent of chat UI toggle
    const OH_PB_PASS_SECRET = 'myman-office-chat-v1';
    const OH_TOKEN_CACHE_KEY = 'tm_chat_token_cache';
    const OH_USER_KEY = 'tm_chat_user';
    const OH_PASS_KEY = 'tm_chat_pass';
    const OH_SYNC_FP_KEY = 'tm_oh_sync_fp_v1';
    const OH_MIGRATED_KEY = 'tm_oh_migrated_stores_v1';
    const OH_VIEW_CACHE_KEY = 'tm_oh_view_cache_v1'; // last successful server fetch per storeKey|kind
    const OH_SYNC_QUEUE_MAX = 40;
    const OH_SYNC_FLUSH_MS = 2500;
    let ohServerUnsupported = false;
    let ohServerHintShown = false;
    let ohAuthToken = null;
    let ohAuthExpires = 0;
    let ohSyncQueue = [];
    let ohSyncFlushTimer = null;
    let ohSyncBusy = false;
    /** In-memory list for the open Order History panel (server-sourced). */
    let ohViewOrders = [];
    let ohViewCapped = false;

    /** Store for shared history — never depends on chat being enabled. */
    function ohGetStoreName() {
        try {
            if (typeof window.getConnectedStoreCached === 'function') {
                const n = String(window.getConnectedStoreCached() || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            const connected = String(GM_getValue('tm_connected_store_v1', '') || '').trim();
            if (connected) return connected.slice(0, 64);
        } catch (_) { /* ignore */ }
        try {
            if (typeof window.getCurrentStoreName === 'function') {
                const n = String(window.getCurrentStoreName() || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            const login = String(GM_getValue('tm_login_store_v1', '') || '').trim();
            if (login) return login.slice(0, 64);
        } catch (_) { /* ignore */ }
        try {
            const cached = String(GM_getValue('tm_phone_my_store_name_v1', '') || '').trim();
            if (cached) return cached.slice(0, 64);
        } catch (_) { /* ignore */ }
        try {
            if (typeof window.captureConnectedStoreFromPage === 'function') {
                const live = String(window.captureConnectedStoreFromPage(document) || '').trim();
                if (live) return live.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        return '';
    }

    function ohStoreKey(storeName) {
        const raw = String(storeName || ohGetStoreName() || '').trim();
        if (!raw) return '';
        if (typeof window.greekToLatinSlug === 'function') {
            const slug = window.greekToLatinSlug(raw);
            if (slug) return slug.slice(0, 64);
        }
        return raw
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 64) || 'store';
    }

    function ohOrderKind(order, explicitKind) {
        const forced = String(explicitKind || '').toLowerCase().trim();
        if (forced === 'parts' || forced === 'service') return forced;

        const url = String(order?.url || '').toLowerCase();
        if (/sparepartstoorder|partsorders|ανταλλακ/.test(url)) return 'parts';
        if (/srvorders|service_?order/.test(url)) return 'service';

        const stored = String(order?._kind || '').toLowerCase().trim();
        if (stored === 'parts' || stored === 'service') return stored;

        const t = String(order?.type || '').toLowerCase();
        if (t.includes('part') || t.includes('ανταλλακ')) return 'parts';
        if (t.includes('service') || t.includes('υπηρεσ')) return 'service';

        // Last resort: current page (only when extracting live on that page)
        if (isPartsOrdersPage) return 'parts';
        if (isServiceOrdersPage) return 'service';
        return 'service';
    }

    function ohPageKind() {
        return isPartsOrdersPage ? 'parts' : 'service';
    }

    function ohExtractOrderId(order) {
        const url = String(order?.url || '');
        try {
            const u = new URL(url, 'https://thefixers.mymanager.gr');
            const fromUrl = u.searchParams.get('editid1')
                || u.searchParams.get('id')
                || u.searchParams.get('orderid');
            if (fromUrl) return String(fromUrl).trim().slice(0, 64);
        } catch (_) { /* ignore */ }
        const id = String(order?.id || '').trim();
        // Prefer left side of composite id (orderNumber__code)
        if (id.includes('__')) return id.split('__')[0].slice(0, 64);
        return id.slice(0, 64);
    }

    function ohPickStatus(order) {
        if (order?.status) return String(order.status).slice(0, 64);
        const cols = order?.allColumns || {};
        for (const [k, v] of Object.entries(cols)) {
            if (/κατάσταση|status/i.test(String(k))) return String(v || '').slice(0, 64);
        }
        return '';
    }

    function ohOrderFingerprint(order) {
        let cols = '';
        try { cols = JSON.stringify(order?.allColumns || {}); } catch (_) { cols = ''; }
        return [
            ohExtractOrderId(order),
            order?.phone || '',
            order?.customer || '',
            order?.date || '',
            order?.url || '',
            order?.repairNumber || '',
            ohPickStatus(order),
            cols,
        ].join('\u0001');
    }

    /** Collect MyManager table column headers present on these orders (stable first-seen order). */
    function ohCollectTableColumns(orders) {
        const seen = new Set();
        const cols = [];
        (orders || []).forEach((order) => {
            const map = order?.allColumns;
            if (!map || typeof map !== 'object') return;
            Object.keys(map).forEach((key) => {
                const label = String(key || '').trim();
                if (!label || seen.has(label)) return;
                // Skip empty-only noise later; still register header if any row has it
                seen.add(label);
                cols.push(label);
            });
        });
        return cols;
    }

    /**
     * Live list column defs from the page grid (same labels/order/classes as Ζωντανές).
     * Skips the history clone table.
     */
    function ohGetLiveListColumns() {
        const liveGrid = document.querySelector('.rnr-center .rnr-cw-grid:not(#tm-oh-native-grid)');
        const table = liveGrid?.querySelector('table.rnr-gridtable, table.rnr-b-grid, table');
        if (!table) return null;
        const cols = [];
        const ths = table.querySelectorAll('thead tr.rnr-toprow th, thead th');
        ths.forEach((th) => {
            const isBc = th.classList.contains('rnr-bc')
                || !!th.querySelector('input.chooseAll1, input[type="checkbox"]');
            if (isBc) {
                cols.push({
                    kind: 'bc',
                    label: '',
                    thClass: th.className || 'rnr-bc',
                    tdClass: 'rnr-bc',
                });
                return;
            }
            const link = th.querySelector('.rnr-orderlink, [data-order]');
            const label = String(link?.textContent || th.textContent || '')
                .replace(/\s+/g, ' ')
                .trim();
            const thClass = th.className || 'rnr-gridfieldlabel rnr-field-text';
            const isCheck = /checkbox/i.test(thClass);
            if (!label) {
                cols.push({
                    kind: 'empty',
                    label: '',
                    thClass,
                    tdClass: isCheck ? ' rnr-field-checkbox' : 'rnr-field-text',
                });
                return;
            }
            cols.push({
                kind: isCheck ? 'checkbox' : 'field',
                label,
                thClass,
                tdClass: isCheck ? ' rnr-field-checkbox' : 'rnr-field-text',
                dataOrder: link?.getAttribute?.('data-order') || '',
            });
        });
        return cols.length ? cols : null;
    }

    /** Resolve a live header label against an order's allColumns (+ legacy fallbacks). */
    function ohResolveColumnValue(order, label) {
        const want = String(label || '').trim();
        if (!want) return '';
        const map = order?.allColumns;
        if (map && typeof map === 'object') {
            if (Object.prototype.hasOwnProperty.call(map, want)) {
                return String(map[want] ?? '').trim();
            }
            const wantKey = want.toLowerCase().replace(/\s+/g, '');
            for (const [k, v] of Object.entries(map)) {
                if (String(k).toLowerCase().replace(/\s+/g, '') === wantKey) {
                    return String(v ?? '').trim();
                }
            }
            for (const [k, v] of Object.entries(map)) {
                const kk = String(k).toLowerCase().replace(/\s+/g, '');
                if (kk && (kk.includes(wantKey) || wantKey.includes(kk))) {
                    return String(v ?? '').trim();
                }
            }
        }
        return ohColumnCellValue(order, want);
    }

    function ohColumnCellValue(order, columnKey) {
        const cols = order?.allColumns;
        if (cols && Object.prototype.hasOwnProperty.call(cols, columnKey)) {
            return String(cols[columnKey] ?? '').trim();
        }
        // Fallbacks for older rows missing payload
        const lower = String(columnKey || '').toLowerCase();
        if (/τηλέφων|phone/.test(lower)) return String(order?.phone || '').trim();
        if (/πελάτ|customer|όνομα|onoma/.test(lower)) return String(order?.customer || '').trim();
        if (/επισκευ|repair/.test(lower)) return String(order?.repairNumber || '').trim();
        if (/ημερομην|date/.test(lower)) return String(order?.date || '').trim();
        if (/κατάσταση|status/.test(lower)) return String(order?.status || '').trim();
        return '';
    }

    function ohLoadFingerprints() {
        try {
            const raw = GM_getValue(OH_SYNC_FP_KEY, '{}');
            const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (_) {
            return {};
        }
    }

    function ohSaveFingerprints(map) {
        try {
            const keys = Object.keys(map || {});
            if (keys.length > 800) {
                keys.slice(0, keys.length - 600).forEach((k) => { delete map[k]; });
            }
            GM_setValue(OH_SYNC_FP_KEY, JSON.stringify(map));
        } catch (_) { /* ignore */ }
    }

    function ohDisplayName() {
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
        const fallback = String(
            window.tmCurrentUser
            || window.config?.currentUser
            || window.config?.profileLabel
            || window.MMS_PROFILES?.getActiveProfileLabel?.()
            || ''
        ).trim();
        if (fallback && fallback !== '_unknown') return fallback.slice(0, 64);
        return 'Τεχνικός';
    }

    function ohRequestJson({ method, url, headers, data, timeout }) {
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

    function ohAutoPassword(email) {
        const input = `${OH_PB_PASS_SECRET}|${String(email || '').toLowerCase()}`;
        let h = 5381;
        for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
        let h2 = 0;
        for (let i = 0; i < input.length; i++) h2 = (h2 * 33 + input.charCodeAt(i)) >>> 0;
        return `Mm${Math.abs(h).toString(36)}${h2.toString(36)}9x`.slice(0, 28);
    }

    function ohSuggestEmail() {
        if (typeof window.suggestOfficeChatEmail === 'function') {
            const mail = String(window.suggestOfficeChatEmail() || '').trim().toLowerCase();
            if (mail.includes('@')) return mail;
        }
        let local = '';
        if (typeof window.greekToLatinSlug === 'function') {
            local = window.greekToLatinSlug(ohDisplayName());
        }
        if (!local || local.length < 2) {
            local = String(ohDisplayName() || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '')
                .slice(0, 32);
        }
        if (!local || local.length < 2) local = `tech${Date.now().toString(36).slice(-6)}`;
        return `${local}@myman.chat`;
    }

    function ohLoadCachedToken() {
        try {
            const raw = GM_getValue(OH_TOKEN_CACHE_KEY, '');
            const parsed = typeof raw === 'string' ? JSON.parse(raw || 'null') : raw;
            if (parsed?.token && Number(parsed.expires) > Date.now() + 60_000) return parsed;
        } catch (_) { /* ignore */ }
        return null;
    }

    function ohSaveCachedToken(token, expires) {
        try {
            GM_setValue(OH_TOKEN_CACHE_KEY, JSON.stringify({
                token,
                expires: Number(expires) || 0,
                savedAt: Date.now(),
            }));
        } catch (_) { /* ignore */ }
    }

    function ohClearCachedToken() {
        ohAuthToken = null;
        ohAuthExpires = 0;
        try { GM_setValue(OH_TOKEN_CACHE_KEY, ''); } catch (_) { /* ignore */ }
    }

    async function ohAuthWithPassword(email, password) {
        const url = `${OH_PB_BASE.replace(/\/$/, '')}/api/collections/users/auth-with-password`;
        const { status, body } = await ohRequestJson({
            method: 'POST',
            url,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ identity: email, password }),
            timeout: 12000,
        });
        if (status < 200 || status >= 300 || !body?.token) {
            throw new Error(body?.message || `Auth failed (${status})`);
        }
        const now = Date.now();
        let expires = now + 12 * 60 * 60 * 1000;
        try {
            const payload = JSON.parse(atob(String(body.token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload?.exp) expires = Number(payload.exp) * 1000;
        } catch (_) { /* ignore */ }
        ohAuthToken = body.token;
        ohAuthExpires = expires;
        ohSaveCachedToken(body.token, expires);
        try {
            GM_setValue(OH_USER_KEY, email);
            GM_setValue(OH_PASS_KEY, password);
        } catch (_) { /* ignore */ }
        return body.token;
    }

    async function ohRegisterUser(email, password) {
        const url = `${OH_PB_BASE.replace(/\/$/, '')}/api/collections/users/records`;
        const local = String(email || '').split('@')[0] || 'tech';
        const { status, body } = await ohRequestJson({
            method: 'POST',
            url,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                email,
                password,
                passwordConfirm: password,
                username: local,
            }),
            timeout: 15000,
        });
        if (status >= 200 && status < 300) return { ok: true };
        return { ok: false, message: body?.message || `Register failed (${status})` };
    }

    /** Standalone PocketBase auth — works with office chat UI disabled. */
    async function ohEnsureAuthStandalone() {
        const now = Date.now();
        if (ohAuthToken && ohAuthExpires > now + 60_000) return ohAuthToken;
        const cached = ohLoadCachedToken();
        if (cached?.token) {
            ohAuthToken = cached.token;
            ohAuthExpires = Number(cached.expires) || 0;
            return ohAuthToken;
        }

        const mail = ohSuggestEmail();
        const autoPass = ohAutoPassword(mail);
        if (!mail || !autoPass) throw new Error('Δεν βρέθηκε όνομα login MyManager.');

        try {
            return await ohAuthWithPassword(mail, autoPass);
        } catch (_) { /* try legacy / register */ }

        const legacyPass = String(GM_getValue(OH_PASS_KEY, '') || '');
        if (legacyPass && legacyPass !== autoPass && legacyPass.length >= 8) {
            try {
                return await ohAuthWithPassword(mail, legacyPass);
            } catch (_) { /* register */ }
        }

        const created = await ohRegisterUser(mail, autoPass);
        if (!created.ok) {
            try {
                return await ohAuthWithPassword(mail, autoPass);
            } catch (err) {
                throw new Error(created.message || err.message || 'PB auth failed');
            }
        }
        return ohAuthWithPassword(mail, autoPass);
    }

    /**
     * Auth for shared order history. Independent of Settings → Chat enabled.
     * Prefers shared suite helper when present; otherwise self-contained login/register.
     */
    async function ohEnsureAuthToken() {
        try {
            if (typeof window.ensureMymanPocketBaseAuth === 'function') {
                return await window.ensureMymanPocketBaseAuth(window.STORAGE_KEYS);
            }
        } catch (err) {
            console.warn('[MMS Order History] shared PB auth failed, using standalone', err);
        }
        try {
            if (typeof window.ensureOfficeChatAuthToken === 'function') {
                return await window.ensureOfficeChatAuthToken(window.STORAGE_KEYS);
            }
        } catch (err) {
            console.warn('[MMS Order History] chat auth helper failed, using standalone', err);
        }
        return ohEnsureAuthStandalone();
    }

    function ohHint(msg) {
        if (ohServerHintShown) return;
        ohServerHintShown = true;
        console.warn('[MMS Order History]', msg);
        try {
            if (typeof window.showNegativeMessage === 'function') {
                window.showNegativeMessage(msg);
            }
        } catch (_) { /* ignore */ }
    }

    function ohRecordFromLocal(order, store, storeKey, explicitKind) {
        const kind = ohOrderKind(order, explicitKind);
        const orderId = ohExtractOrderId(order);
        if (!orderId || !storeKey) return null;
        const nowIso = new Date().toISOString();
        let captured = nowIso;
        if (order.timestamp) {
            const ts = new Date(order.timestamp);
            if (!Number.isNaN(ts.getTime())) captured = ts.toISOString();
        }
        let payload = '';
        try {
            payload = JSON.stringify(order.allColumns || {}).slice(0, 5000);
        } catch (_) {
            payload = '';
        }
        return {
            store: String(store || '').slice(0, 64),
            storeKey: String(storeKey).slice(0, 64),
            kind,
            orderId: String(orderId).slice(0, 64),
            dedupeKey: `${storeKey}|${kind}|${orderId}`.slice(0, 128),
            repairNumber: String(order.repairNumber || '').slice(0, 64),
            customer: String(order.customer || '').slice(0, 128),
            phone: String(order.phone || '').slice(0, 64),
            url: String(order.url || '').slice(0, 500),
            status: ohPickStatus(order),
            date: String(order.date || '').slice(0, 64),
            capturedAt: captured,
            updatedAt: nowIso,
            updatedBy: ohDisplayName(),
            payload,
        };
    }

    function ohLocalFromRecord(rec) {
        let allColumns = {};
        if (rec?.payload) {
            try {
                const parsed = typeof rec.payload === 'string' ? JSON.parse(rec.payload) : rec.payload;
                if (parsed && typeof parsed === 'object') allColumns = parsed;
            } catch (_) { /* ignore */ }
        }
        const ts = rec?.capturedAt ? new Date(rec.capturedAt).getTime() : Date.now();
        const kind = String(rec.kind || '').toLowerCase() === 'parts' ? 'parts' : 'service';
        return {
            id: rec.orderId,
            phone: rec.phone || '',
            customer: rec.customer || '',
            repairNumber: rec.repairNumber || '',
            type: kind === 'parts' ? 'Parts Order' : 'Service Order',
            url: rec.url || '',
            timestamp: Number.isFinite(ts) ? ts : Date.now(),
            date: rec.date || '',
            status: rec.status || '',
            allColumns,
            _fromServer: true,
            _pbId: rec.id || '',
            _storeKey: rec.storeKey || '',
            _kind: kind,
        };
    }

    async function ohUpsertRecord(token, record) {
        const base = OH_PB_BASE.replace(/\/$/, '');
        const headers = {
            Authorization: token,
            'Content-Type': 'application/json',
        };
        const filter = encodeURIComponent(`dedupeKey="${record.dedupeKey}"`);
        const listed = await ohRequestJson({
            method: 'GET',
            url: `${base}/api/collections/order_history/records?page=1&perPage=1&filter=${filter}`,
            headers: { Authorization: token },
            timeout: 15000,
        });
        const blob = `${JSON.stringify(listed.body || {})}\n${listed.raw || ''}`;
        if (listed.status === 404 || /missing collection|unknown collection|didn't find the collection/i.test(blob)) {
            ohServerUnsupported = true;
            ohHint('Order history: δημιούργησε collection order_history στο PocketBase (SETUP)');
            return { ok: false, unsupported: true };
        }
        if (listed.status === 403 || listed.status === 401) {
            if (listed.status === 401) ohClearCachedToken();
            ohHint('Order history: ξεκλείδωσε List/Create/Update στο order_history (ή ξανασύνδεση auth)');
            return { ok: false, status: listed.status };
        }

        const existingId = listed.body?.items?.[0]?.id;
        if (existingId) {
            const patch = { ...record };
            // Keep original capturedAt if server has one
            if (listed.body.items[0].capturedAt) delete patch.capturedAt;
            const updated = await ohRequestJson({
                method: 'PATCH',
                url: `${base}/api/collections/order_history/records/${encodeURIComponent(existingId)}`,
                headers,
                data: JSON.stringify(patch),
                timeout: 15000,
            });
            if (updated.status >= 200 && updated.status < 300) return { ok: true, id: existingId, body: updated.body };
            // Retry without optional payload if field missing
            if (/payload|unknown field/i.test(JSON.stringify(updated.body || {}))) {
                delete patch.payload;
                const again = await ohRequestJson({
                    method: 'PATCH',
                    url: `${base}/api/collections/order_history/records/${encodeURIComponent(existingId)}`,
                    headers,
                    data: JSON.stringify(patch),
                    timeout: 15000,
                });
                if (again.status >= 200 && again.status < 300) return { ok: true, id: existingId, body: again.body };
            }
            return { ok: false, status: updated.status, body: updated.body };
        }

        let created = await ohRequestJson({
            method: 'POST',
            url: `${base}/api/collections/order_history/records`,
            headers,
            data: JSON.stringify(record),
            timeout: 15000,
        });
        if (created.status >= 200 && created.status < 300) {
            return { ok: true, id: created.body?.id, body: created.body };
        }
        // Unique race → patch
        if (/unique|duplicate/i.test(JSON.stringify(created.body || {}))) {
            const againList = await ohRequestJson({
                method: 'GET',
                url: `${base}/api/collections/order_history/records?page=1&perPage=1&filter=${filter}`,
                headers: { Authorization: token },
                timeout: 15000,
            });
            const id = againList.body?.items?.[0]?.id;
            if (id) {
                const patch = { ...record };
                delete patch.capturedAt;
                created = await ohRequestJson({
                    method: 'PATCH',
                    url: `${base}/api/collections/order_history/records/${encodeURIComponent(id)}`,
                    headers,
                    data: JSON.stringify(patch),
                    timeout: 15000,
                });
                if (created.status >= 200 && created.status < 300) return { ok: true, id, body: created.body };
            }
        }
        if (/payload|unknown field/i.test(JSON.stringify(created.body || {}))) {
            const slim = { ...record };
            delete slim.payload;
            created = await ohRequestJson({
                method: 'POST',
                url: `${base}/api/collections/order_history/records`,
                headers,
                data: JSON.stringify(slim),
                timeout: 15000,
            });
            if (created.status >= 200 && created.status < 300) return { ok: true, id: created.body?.id, body: created.body };
        }
        if (created.status === 403 || created.status === 401) {
            ohHint('Order history: ξεκλείδωσε Create/Update στο order_history');
        }
        return { ok: false, status: created.status, body: created.body };
    }

    async function ohFlushSyncQueue() {
        if (ohSyncBusy || ohServerUnsupported || !ohSyncQueue.length) return;
        ohSyncBusy = true;
        const batch = ohSyncQueue.splice(0, OH_SYNC_QUEUE_MAX);
        const retry = [];
        try {
            const token = await ohEnsureAuthToken();
            const fps = ohLoadFingerprints();
            let okCount = 0;
            let failCount = 0;
            for (const item of batch) {
                if (ohServerUnsupported) {
                    retry.push(item);
                    continue;
                }
                const result = await ohUpsertRecord(token, item.record);
                if (result.unsupported) {
                    retry.push(item);
                    break;
                }
                if (result.ok && item.fpKey) {
                    fps[item.fpKey] = item.fingerprint;
                    okCount += 1;
                    ohRemovePendingByDedupe(item.fpKey);
                    try {
                        const rec = item.record;
                        if (rec?.storeKey && rec?.kind) {
                            const cached = ohLoadViewCache(rec.storeKey, rec.kind) || {
                                store: rec.store,
                                storeKey: rec.storeKey,
                                kind: rec.kind,
                                orders: [],
                                capped: false,
                                totalItems: 0,
                            };
                            const local = ohLocalFromRecord({ ...rec, id: result.id || rec.orderId });
                            const oid = ohExtractOrderId(local);
                            const next = (cached.orders || []).filter((o) => ohExtractOrderId(o) !== oid);
                            next.unshift(local);
                            ohSaveViewCache({
                                store: cached.store || rec.store,
                                storeKey: rec.storeKey,
                                kind: rec.kind,
                                orders: next.slice(0, 200),
                                capped: cached.capped || next.length >= 200,
                                totalItems: Math.max(Number(cached.totalItems) || 0, next.length),
                            });
                        }
                    } catch (_) { /* ignore */ }
                    continue;
                }
                failCount += 1;
                const attempts = Number(item.attempts || 0) + 1;
                const detail = result.body?.message
                    || result.body?.data
                    || result.status
                    || 'unknown';
                console.warn('[MMS Order History] upsert failed', item.record?.dedupeKey, detail, result.body || '');
                if (attempts < 5) {
                    retry.push({ ...item, attempts });
                } else {
                    ohHint(`Order history sync failed: ${typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 120)}`);
                }
            }
            ohSaveFingerprints(fps);
            if (okCount) {
                console.log(`[MMS Order History] synced ${okCount} row(s) to server` + (failCount ? ` (${failCount} failed)` : ''));
                try {
                    GM_setValue('tm_oh_last_sync_ok_v1', JSON.stringify({
                        at: Date.now(),
                        store: ohGetStoreName(),
                        storeKey: ohStoreKey(),
                        okCount,
                    }));
                } catch (_) { /* ignore */ }
            }
        } catch (err) {
            console.warn('[MMS Order History] sync flush failed', err);
            ohHint(`Order history auth/sync: ${err?.message || err}`);
            // re-queue whole batch
            retry.push(...batch.map((item) => ({
                ...item,
                attempts: Number(item.attempts || 0) + 1,
            })).filter((item) => Number(item.attempts || 0) < 8));
        } finally {
            if (retry.length) {
                ohSyncQueue = retry.concat(ohSyncQueue).slice(0, 120);
            }
            ohSyncBusy = false;
            if (ohSyncQueue.length) scheduleOhSyncFlush(1200);
        }
    }

    function scheduleOhSyncFlush(delayMs) {
        window.clearTimeout(ohSyncFlushTimer);
        ohSyncFlushTimer = window.setTimeout(() => {
            ohFlushSyncQueue().catch(() => {});
        }, delayMs == null ? OH_SYNC_FLUSH_MS : delayMs);
    }

    function queueOrdersForServerSync(orders, { force = false, kind = null } = {}) {
        if (!ohUseDatabase()) return 0;
        if (ohServerUnsupported || !orders?.length) return 0;
        // Refresh connected store if possible before deciding
        try { window.captureConnectedStoreFromPage?.(document); } catch (_) { /* ignore */ }
        const store = ohGetStoreName();
        const storeKey = ohStoreKey(store);
        if (!storeKey) {
            console.log('[MMS Order History] skip server sync — no store');
            return 0;
        }
        const fps = ohLoadFingerprints();
        let queued = 0;
        let skippedNoId = 0;
        orders.forEach((order) => {
            const record = ohRecordFromLocal(order, store, storeKey, kind);
            if (!record) {
                skippedNoId += 1;
                return;
            }
            const fingerprint = ohOrderFingerprint(order);
            const fpKey = record.dedupeKey;
            if (!force && fps[fpKey] === fingerprint) return; // unchanged
            if (force) delete fps[fpKey];
            // Replace existing queue item with same key
            ohSyncQueue = ohSyncQueue.filter((q) => q.fpKey !== fpKey);
            ohSyncQueue.push({ record, fingerprint, fpKey, attempts: 0 });
            queued += 1;
        });
        if (force) ohSaveFingerprints(fps);
        if (ohSyncQueue.length > 120) ohSyncQueue = ohSyncQueue.slice(-120);
        if (queued) scheduleOhSyncFlush(force ? 400 : undefined);
        if (skippedNoId) {
            console.warn(`[MMS Order History] ${skippedNoId} local row(s) skipped (no orderId)`);
        }
        if (queued) {
            console.log(`[MMS Order History] queued ${queued} row(s) for store ${storeKey}${kind ? ` kind=${kind}` : ''}`);
        }
        return queued;
    }

    function ohFilterOrdersByPageKind(orders, kind = ohPageKind()) {
        const want = kind === 'parts' ? 'parts' : 'service';
        return (orders || []).filter((o) => ohOrderKind(o) === want);
    }

    function ohViewCacheSlot(storeKey, kind) {
        return `${String(storeKey || '')}|${String(kind || 'service')}`;
    }

    function ohLoadViewCache(storeKey, kind) {
        if (!storeKey) return null;
        try {
            const raw = GM_getValue(OH_VIEW_CACHE_KEY, '{}');
            const map = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {});
            const slot = map[ohViewCacheSlot(storeKey, kind)];
            if (!slot || !Array.isArray(slot.orders)) return null;
            return {
                store: String(slot.store || ''),
                storeKey: String(slot.storeKey || storeKey),
                kind: String(slot.kind || kind),
                orders: slot.orders,
                capped: !!slot.capped,
                totalItems: Number(slot.totalItems) || slot.orders.length,
                savedAt: Number(slot.savedAt) || 0,
            };
        } catch (_) {
            return null;
        }
    }

    function ohSaveViewCache({ store, storeKey, kind, orders, capped, totalItems }) {
        if (!storeKey || !kind) return;
        try {
            const raw = GM_getValue(OH_VIEW_CACHE_KEY, '{}');
            const map = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {});
            const key = ohViewCacheSlot(storeKey, kind);
            map[key] = {
                store: String(store || '').slice(0, 64),
                storeKey: String(storeKey).slice(0, 64),
                kind: String(kind).slice(0, 16),
                orders: (orders || []).slice(0, 200),
                capped: !!capped,
                totalItems: Number(totalItems) || (orders || []).length,
                savedAt: Date.now(),
            };
            // Bound map size (keep newest 12 slots)
            const keys = Object.keys(map);
            if (keys.length > 12) {
                keys
                    .map((k) => ({ k, t: Number(map[k]?.savedAt) || 0 }))
                    .sort((a, b) => a.t - b.t)
                    .slice(0, keys.length - 12)
                    .forEach(({ k }) => { delete map[k]; });
            }
            GM_setValue(OH_VIEW_CACHE_KEY, JSON.stringify(map));
        } catch (_) { /* ignore */ }
    }

    function ohFormatCacheAge(savedAt) {
        const ts = Number(savedAt) || 0;
        if (!ts) return '';
        const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
        if (mins < 1) return 'μόλις τώρα';
        if (mins < 60) return `${mins}λ πριν`;
        const hours = Math.floor(mins / 60);
        if (hours < 48) return `${hours}ω πριν`;
        return `${Math.floor(hours / 24)}η πριν`;
    }

    async function fetchStoreOrderHistoryFromServer(kind) {
        if (ohServerUnsupported) return { ok: false, orders: [], unsupported: true };
        const store = ohGetStoreName();
        const storeKey = ohStoreKey(store);
        if (!storeKey) return { ok: false, orders: [], reason: 'no-store' };
        try {
            const token = await ohEnsureAuthToken();
            const base = OH_PB_BASE.replace(/\/$/, '');
            const filter = encodeURIComponent(`storeKey="${storeKey}" && kind="${kind}"`);
            const result = await ohRequestJson({
                method: 'GET',
                url: `${base}/api/collections/order_history/records?page=1&perPage=200&sort=-capturedAt&filter=${filter}`,
                headers: { Authorization: token },
                timeout: 20000,
            });
            const blob = `${JSON.stringify(result.body || {})}\n${result.raw || ''}`;
            if (result.status === 404 || /missing collection|unknown collection/i.test(blob)) {
                ohServerUnsupported = true;
                ohHint('Order history: δημιούργησε collection order_history στο PocketBase');
                return { ok: false, orders: [], unsupported: true };
            }
            if (result.status < 200 || result.status >= 300) {
                if (result.status === 403 || result.status === 401) {
                    ohHint('Order history: ξεκλείδωσε List στο order_history');
                }
                return { ok: false, orders: [], status: result.status };
            }
            const items = Array.isArray(result.body?.items) ? result.body.items : [];
            const totalItems = Number(result.body?.totalItems) || items.length;
            const orders = items.map(ohLocalFromRecord);
            const capped = totalItems > items.length || items.length >= 200;
            ohSaveViewCache({
                store,
                storeKey,
                kind,
                orders,
                capped,
                totalItems,
            });
            return {
                ok: true,
                store,
                storeKey,
                orders,
                totalItems,
                capped,
                fromCache: false,
            };
        } catch (err) {
            console.warn('[MMS Order History] fetch failed', err);
            return { ok: false, orders: [], error: err };
        }
    }

    function ohLoadPendingBuffer() {
        try {
            const raw = GM_getValue(OH_PENDING_KEY, '[]');
            const arr = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
            return Array.isArray(arr) ? arr : [];
        } catch (_) {
            return [];
        }
    }

    function ohSavePendingBuffer(list) {
        try {
            const trimmed = (list || []).slice(0, 120);
            GM_setValue(OH_PENDING_KEY, JSON.stringify(trimmed));
        } catch (_) { /* ignore */ }
    }

    function ohAddPendingOrders(orders) {
        if (!orders?.length) return;
        const pending = ohLoadPendingBuffer();
        orders.forEach((order) => {
            const id = ohExtractOrderId(order);
            if (!id) return;
            const idx = pending.findIndex((p) => ohExtractOrderId(p) === id
                && String(p.type || '') === String(order.type || ''));
            if (idx >= 0) pending[idx] = order;
            else pending.unshift(order);
        });
        ohSavePendingBuffer(pending);
    }

    function ohRemovePendingByDedupe(dedupeKey) {
        if (!dedupeKey) return;
        const pending = ohLoadPendingBuffer();
        const store = ohGetStoreName();
        const storeKey = ohStoreKey(store);
        const next = pending.filter((order) => {
            const rec = ohRecordFromLocal(order, store, storeKey);
            return !rec || rec.dedupeKey !== dedupeKey;
        });
        if (next.length !== pending.length) ohSavePendingBuffer(next);
    }

    function ohClearLegacyLocalHistory() {
        // Never wipe local GM history while user chose local-only mode
        if (!ohUseDatabase()) return;
        try { GM_setValue('tm_srvorders_page_history', '[]'); } catch (_) { /* ignore */ }
        try { GM_setValue('tm_partsorders_page_history', '[]'); } catch (_) { /* ignore */ }
        try { GM_setValue(CURRENT_PAGE_HISTORY_KEY, '[]'); } catch (_) { /* ignore */ }
    }

    function ohHistoryKeyForKind(kind) {
        return kind === 'parts' ? 'tm_partsorders_page_history' : 'tm_srvorders_page_history';
    }

    function ohLoadLocalHistory(kind = ohPageKind()) {
        try {
            const raw = GM_getValue(ohHistoryKeyForKind(kind), '[]');
            const arr = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
            return Array.isArray(arr) ? arr : [];
        } catch (_) {
            return [];
        }
    }

    function ohSaveLocalHistory(kind, orders) {
        try {
            const list = (orders || []).slice(0, MAX_HISTORY_ITEMS);
            GM_setValue(ohHistoryKeyForKind(kind), JSON.stringify(list));
        } catch (_) { /* ignore */ }
    }

    function ohMergeIntoLocalHistory(newOrders, kind = ohPageKind()) {
        if (!newOrders?.length) return 0;
        const want = kind === 'parts' ? 'parts' : 'service';
        const tagged = newOrders.map((o) => ({ ...o, _kind: o._kind || want }));
        let existing = ohLoadLocalHistory(want);
        let added = 0;
        tagged.forEach((order) => {
            const dup = existing.some((ex) => isDuplicateOrder(ex, order));
            if (dup) {
                // Refresh matching row with newer column data when possible
                const idx = existing.findIndex((ex) => isDuplicateOrder(ex, order));
                if (idx >= 0) {
                    existing[idx] = { ...existing[idx], ...order, timestamp: existing[idx].timestamp || order.timestamp };
                }
                return;
            }
            existing.unshift(order);
            added += 1;
        });
        if (existing.length > MAX_HISTORY_ITEMS) existing = existing.slice(0, MAX_HISTORY_ITEMS);
        ohSaveLocalHistory(want, existing);
        return added;
    }

    /** When switching to local mode, copy last server cache into local history if empty. */
    function seedOrderHistoryLocalFromCache() {
        ['service', 'parts'].forEach((kind) => {
            const local = ohLoadLocalHistory(kind);
            if (local.length) return;
            const storeKey = ohStoreKey(ohGetStoreName());
            const cache = ohLoadViewCache(storeKey, kind);
            if (cache?.orders?.length) {
                ohSaveLocalHistory(kind, ohFilterOrdersByPageKind(cache.orders, kind).slice(0, MAX_HISTORY_ITEMS));
                console.log(`[MMS Order History] seeded local ${kind} from cache (${cache.orders.length})`);
            }
        });
    }

    function mergeServerOrdersIntoLocal() {
        // Server is source of truth — do not merge into legacy GM history.
        return 0;
    }

    async function migrateLocalOrderHistoryOnce({ force = false } = {}) {
        if (!ohUseDatabase()) {
            return { ok: true, skipped: true, reason: 'local-mode' };
        }
        try { window.captureConnectedStoreFromPage?.(document); } catch (_) { /* ignore */ }
        const store = ohGetStoreName();
        const storeKey = ohStoreKey(store);
        if (!storeKey || ohServerUnsupported) {
            console.log('[MMS Order History] migration skip — no store yet');
            return { ok: false, reason: 'no-store' };
        }
        let migrated = {};
        try {
            const raw = GM_getValue(OH_MIGRATED_KEY, '{}');
            migrated = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
        } catch (_) {
            migrated = {};
        }
        if (!force && migrated[storeKey]) {
            // Still drain any leftover legacy GM rows once after server-source switch
            try {
                const service = JSON.parse(GM_getValue('tm_srvorders_page_history', '[]'));
                const parts = JSON.parse(GM_getValue('tm_partsorders_page_history', '[]'));
                let flushed = 0;
                if (Array.isArray(service) && service.length) {
                    flushed += queueOrdersForServerSync(service, { force: true, kind: 'service' });
                }
                if (Array.isArray(parts) && parts.length) {
                    flushed += queueOrdersForServerSync(parts, { force: true, kind: 'parts' });
                }
                if (flushed) scheduleOhSyncFlush(400);
                ohClearLegacyLocalHistory();
                if (flushed) {
                    console.log(`[MMS Order History] flushed leftover local rows for ${storeKey}: ${flushed}`);
                }
            } catch (_) { /* ignore */ }
            // Drain pending write buffer
            try {
                const pending = ohLoadPendingBuffer();
                if (pending.length) {
                    queueOrdersForServerSync(pending, { force: false });
                    scheduleOhSyncFlush(600);
                }
            } catch (_) { /* ignore */ }
            return { ok: true, skipped: true };
        }

        try {
            const service = JSON.parse(GM_getValue('tm_srvorders_page_history', '[]'));
            const parts = JSON.parse(GM_getValue('tm_partsorders_page_history', '[]'));
            const pending = ohLoadPendingBuffer();
            const serviceList = Array.isArray(service) ? service : [];
            const partsList = Array.isArray(parts) ? parts : [];
            const all = [...serviceList, ...partsList, ...pending];
            if (!all.length) {
                migrated[storeKey] = Date.now();
                GM_setValue(OH_MIGRATED_KEY, JSON.stringify(migrated));
                ohClearLegacyLocalHistory();
                console.log(`[MMS Order History] nothing local to migrate for ${storeKey}`);
                return { ok: true, queued: 0 };
            }
            const fps = ohLoadFingerprints();
            serviceList.forEach((order) => {
                const record = ohRecordFromLocal(order, store, storeKey, 'service');
                if (record) delete fps[record.dedupeKey];
            });
            partsList.forEach((order) => {
                const record = ohRecordFromLocal(order, store, storeKey, 'parts');
                if (record) delete fps[record.dedupeKey];
            });
            pending.forEach((order) => {
                const record = ohRecordFromLocal(order, store, storeKey);
                if (record) delete fps[record.dedupeKey];
            });
            ohSaveFingerprints(fps);
            let queued = 0;
            queued += queueOrdersForServerSync(serviceList, { force: true, kind: 'service' });
            queued += queueOrdersForServerSync(partsList, { force: true, kind: 'parts' });
            queued += queueOrdersForServerSync(pending, { force: true });
            scheduleOhSyncFlush(400);
            migrated[storeKey] = Date.now();
            GM_setValue(OH_MIGRATED_KEY, JSON.stringify(migrated));
            // Local GM history is no longer a source — clear after queueing migration
            ohClearLegacyLocalHistory();
            console.log(`[MMS Order History] migrated local → server for ${storeKey} (${queued}/${all.length} rows); local history cleared`);
            return { ok: true, queued, total: all.length, store, storeKey };
        } catch (err) {
            console.warn('[MMS Order History] migration failed', err);
            return { ok: false, error: err };
        }
    }

    // Helper function to extract order URL from a table row
    function extractOrderUrl(row, rowIndex) {
        let orderUrl = window.location.href;
        
        // First, try to get the URL from the row's data-href attribute (parts orders store it on TR)
        let dataHref = row.getAttribute('data-href');
        
        // If not found on row, check cells (service orders store it on TD elements)
        if (!dataHref) {
            const cellWithHref = row.querySelector('td[data-href]');
            if (cellWithHref) {
                dataHref = cellWithHref.getAttribute('data-href');
            }
        }
        
        if (dataHref) {
            // Use window.location.href instead of origin to preserve the /mymanagerservice/ path
            orderUrl = dataHref.startsWith('http') ? dataHref : new URL(dataHref, window.location.href).href;
            console.log(`[Order History] Row ${rowIndex}: Found data-href:`, dataHref, '→', orderUrl);
            return orderUrl;
        }
        
        // Fallback: Try to find a direct link to the order edit or view page (prefer edit)
        const linkEl = row.querySelector('a[href*="_edit"], a[href*="edit.php"], a[href*="srvorders_edit"], a[href*="sparepartstoorder_edit"], a[href*="_view"], a[href*="view.php"], a[href*="srvorders_view"], a[href*="sparepartstoorder_view"]');
        
        if (linkEl) {
            const href = linkEl.getAttribute('href');
            if (href) {
                // Use window.location.href instead of origin to preserve the path
                orderUrl = href.startsWith('http') ? href : new URL(href, window.location.href).href;
                console.log(`[Order History] Row ${rowIndex}: Found link in <a>:`, href, '→', orderUrl);
            } else {
                console.warn(`[Order History] Row ${rowIndex}: Link element found but no href attribute`);
            }
        } else {
            console.warn(`[Order History] Row ${rowIndex}: No data-href or <a> link found`);
        }
        
        return orderUrl;
    }

    // Function to extract Service Order data (srvorders_list.php)
    // Note: Service orders have different structure than parts orders:
    // - data-href is stored on TD cells (not TR)
    // - No "Αρ." (order number) column - extract ID from URL instead
    // - Uses editid1 parameter from srvorders_edit.php?editid1=213842
    function extractServiceOrderData(table) {
        const orders = [];
        const headers = Array.from(table.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        // Find specific column indices for key fields
        const orderNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id') || lower.includes('αριθμός');
        });
        
        const phoneIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
        });
        
        const customerIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα') || lower.includes('ονοματεπώνυμο');
        });
        
        // Additional code column (Κωδικός / Code)
        const codeIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('κωδ') || lower.includes('code');
        });
        
        const repairNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') && (lower.includes('επισκευή') || lower.includes('repair') || lower.includes('εργ') || text.trim() === 'Αρ.');
        });

        const dateIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.startsWith('ημ') || lower.includes('date') || lower === 'ημ.';
        });

        const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        
        rows.forEach((row, index) => {
            if (row.style.display === 'none' || row.offsetParent === null) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            // Extract all columns dynamically
            const allColumns = {};
            headerTexts.forEach((headerText, colIndex) => {
                if (cells[colIndex]) {
                    const cellValue = (cells[colIndex].innerText || cells[colIndex].textContent || '').trim();
                    if (cellValue) {
                        allColumns[headerText] = cellValue;
                    }
                }
            });
            
            // Extract order URL
            const orderUrl = extractOrderUrl(row, index);
            
            // Extract order ID from URL (editid1 parameter) as primary identifier
            let orderNumber = '';
            try {
                const urlObj = new URL(orderUrl);
                orderNumber = urlObj.searchParams.get('editid1') || '';
                if (!orderNumber) {
                    // Try other common parameter names
                    orderNumber = urlObj.searchParams.get('id') || urlObj.searchParams.get('orderid') || '';
                }
            } catch (e) {
                console.warn(`[Order History] Row ${index}: Could not parse URL`, orderUrl);
            }
            
            // Fallback: try to get from order number column if it exists
            if (!orderNumber && orderNumberIndex !== -1 && cells[orderNumberIndex]) {
                orderNumber = (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim();
            }
            
            // Last resort: generate an ID
            if (!orderNumber) {
                orderNumber = `Service-${Date.now()}-${index}`;
            }
            
            const phone = phoneIndex !== -1 && cells[phoneIndex] 
                ? (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim() 
                : '';
            
            const customer = customerIndex !== -1 && cells[customerIndex]
                ? (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim()
                : '';
            
            const repairNumber = repairNumberIndex !== -1 && cells[repairNumberIndex]
                ? (cells[repairNumberIndex].innerText || cells[repairNumberIndex].textContent || '').trim()
                : '';
            
            const codeValue = codeIndex !== -1 && cells[codeIndex]
                ? (cells[codeIndex].innerText || cells[codeIndex].textContent || '').trim()
                : '';
            
            // Build a stronger unique id combining order number and code when present
            const compositeId = orderNumber && codeValue ? `${orderNumber}__${codeValue}` : orderNumber;
            
            if (phone || customer || orderNumber) {
                orders.push({
                    id: compositeId,
                    phone: phone,
                    customer: customer,
                    repairNumber: repairNumber,
                    type: 'Service Order',
                    url: orderUrl,
                    timestamp: Date.now(),
                    date: dateIndex !== -1 && cells[dateIndex] ? (cells[dateIndex].innerText || cells[dateIndex].textContent || '').trim() : '',
                    allColumns: allColumns // Store all columns
                });
            }
        });
        
        return orders;
    }

    // Function to extract Spare Parts Order data (sparepartstoorder_list.php)
    // Note: Parts orders have different structure than service orders:
    // - data-href is stored on TR rows
    // - Has "Αρ." (order number) column
    // - Has "Κωδικός" (code) column
    // - Uses editid1 parameter from sparepartstoorder_edit.php?editid1=1844472
    function extractPartsOrderData(table) {
        const orders = [];
        const headers = Array.from(table.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        // Find specific column indices for key fields
        const orderNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id') || lower.includes('αριθμός');
        });
        
        const phoneIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
        });
        
        const customerIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα') || lower.includes('ονοματεπώνυμο');
        });
        
        // Additional code column (Κωδικός / Code)
        const codeIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('κωδ') || lower.includes('code');
        });

        const dateIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.startsWith('ημ') || lower.includes('date') || lower === 'ημ.';
        });

        const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        
        rows.forEach((row, index) => {
            if (row.style.display === 'none' || row.offsetParent === null) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            // Extract all columns dynamically
            const allColumns = {};
            headerTexts.forEach((headerText, colIndex) => {
                if (cells[colIndex]) {
                    const cellValue = (cells[colIndex].innerText || cells[colIndex].textContent || '').trim();
                    if (cellValue) {
                        allColumns[headerText] = cellValue;
                    }
                }
            });
            
            // Extract order URL
            const orderUrl = extractOrderUrl(row, index);
            
            // Extract order ID from URL (editid1 parameter) as backup identifier
            let urlOrderId = '';
            try {
                const urlObj = new URL(orderUrl);
                urlOrderId = urlObj.searchParams.get('editid1') || '';
                if (!urlOrderId) {
                    urlOrderId = urlObj.searchParams.get('id') || urlObj.searchParams.get('orderid') || '';
                }
            } catch (e) {
                console.warn(`[Order History] Row ${index}: Could not parse URL`, orderUrl);
            }
            
            // Extract key fields for compatibility (parts orders DO have Αρ. column)
            const orderNumber = orderNumberIndex !== -1 && cells[orderNumberIndex]
                ? (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim()
                : (urlOrderId || `Parts-${Date.now()}-${index}`);
            
            const phone = phoneIndex !== -1 && cells[phoneIndex] 
                ? (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim() 
                : '';
            
            const customer = customerIndex !== -1 && cells[customerIndex]
                ? (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim()
                : '';
            
            const codeValue = codeIndex !== -1 && cells[codeIndex]
                ? (cells[codeIndex].innerText || cells[codeIndex].textContent || '').trim()
                : '';
            
            const compositeId = orderNumber && codeValue ? `${orderNumber}__${codeValue}` : orderNumber;
            
            if (phone || customer || orderNumber) {
                orders.push({
                    id: compositeId,
                    phone: phone,
                    customer: customer,
                    type: 'Parts Order',
                    url: orderUrl,
                    code: codeValue,
                    timestamp: Date.now(),
                    date: dateIndex !== -1 && cells[dateIndex] ? (cells[dateIndex].innerText || cells[dateIndex].textContent || '').trim() : '',
                    allColumns: allColumns // Store all columns
                });
            }
        });
        
        return orders;
    }

    // Main function to extract order data from the page
    function extractOrderData() {
        const orders = [];
        
        // Find the main table
        const table = document.querySelector('table.rnr-b-grid, table.rnr-b-table');
        if (!table) {
            console.log('[MMS Order History] No table found on page');
            return orders;
        }

        // Determine which extraction function to use based on URL
        const isServicePage = window.location.pathname.includes('srvorders_list.php');
        const isPartsPage = window.location.pathname.includes('sparepartstoorder_list.php');
        
        if (isServicePage) {
            // srvorders_list.php - use Service Order extraction
            const serviceOrders = extractServiceOrderData(table);
            orders.push(...serviceOrders);
            console.log(`[MMS Order History] Extracted ${serviceOrders.length} orders from srvorders_list.php`);
        } else if (isPartsPage) {
            // sparepartstoorder_list.php - use Parts Order extraction
            const partsOrders = extractPartsOrderData(table);
            orders.push(...partsOrders);
            console.log(`[MMS Order History] Extracted ${partsOrders.length} orders from sparepartstoorder_list.php`);
        } else {
            console.log('[MMS Order History] Unknown page type, using generic extraction');
            // Fallback to generic extraction if page type is unknown
            const headers = Array.from(table.querySelectorAll('thead th'));
            const headerTexts = headers.map(th => th.innerText.trim());
            
            const phoneIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
            });
            
            const customerIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα');
            });
            
            const orderNumberIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id');
            });
            
            const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
            
            rows.forEach((row, index) => {
                if (row.style.display === 'none' || row.offsetParent === null) return;
                const cells = row.querySelectorAll('td');
                if (cells.length === 0) return;
                
                const orderNumber = orderNumberIndex !== -1 && cells[orderNumberIndex]
                    ? (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim()
                    : `Order-${Date.now()}-${index}`;
                
                const phone = phoneIndex !== -1 && cells[phoneIndex] 
                    ? (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim() 
                    : '';
                
                const customer = customerIndex !== -1 && cells[customerIndex]
                    ? (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim()
                    : '';
                
                if (phone || customer || orderNumber) {
                    orders.push({
                        id: orderNumber,
                        phone: phone,
                        customer: customer,
                        date: new Date().toLocaleDateString('el-GR'),
                        description: '',
                        type: 'Order',
                        url: window.location.href,
                        timestamp: Date.now()
                    });
                }
            });
        }
        
        return orders;
    }

    // Helper function to normalize strings for comparison
    function normalizeString(str) {
        if (!str) return '';
        return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    }
    
    // Helper function to normalize phone numbers (extract only digits)
    function normalizePhone(phone) {
        if (!phone) return '';
        return phone.toString().replace(/[^0-9]/g, '');
    }
    
    // Helper function to check if two orders are duplicates
    function isDuplicateOrder(existing, newOrder) {
        // Normalize data for comparison
        const normalize = (str) => normalizeString(str);
        const normalizePhoneNum = (str) => normalizePhone(str);
        
        // 1. Exact order ID match (primary check) - must be exact match
        if (existing.id && newOrder.id) {
            const existingId = normalize(existing.id);
            const newOrderId = normalize(newOrder.id);
            
            // If both have real IDs (not generated), check exact match
            if (existingId && newOrderId && 
                !existingId.startsWith('service-') && !existingId.startsWith('parts-') && 
                !newOrderId.startsWith('service-') && !newOrderId.startsWith('parts-')) {
                if (existingId === newOrderId) {
                    return true;
                }
            }
        }
        
        // If repair numbers exist for both, allow multiple orders under same repair number (do not dedupe)
        if (existing.repairNumber && newOrder.repairNumber) {
            // Only exact ID match (handled above) would be considered duplicate; otherwise keep both
            return false;
        }
        
        // 2. Phone + Customer + Timestamp (broaden window to kill dupes)
        if (existing.phone && newOrder.phone && 
            existing.customer && newOrder.customer) {
            
            const existingPhone = normalizePhoneNum(existing.phone);
            const newOrderPhone = normalizePhoneNum(newOrder.phone);
            const existingCustomer = normalize(existing.customer);
            const newOrderCustomer = normalize(newOrder.customer);
            
            // Phone numbers must match exactly (at least 6 digits)
            const phoneMatch = existingPhone.length >= 6 && newOrderPhone.length >= 6 && 
                             existingPhone === newOrderPhone;
            
            // Customer names must match exactly (no partial matches)
            const customerMatch = existingCustomer === newOrderCustomer;
            
            if (phoneMatch && customerMatch) {
                // If timestamps are close (<= 24h) OR one is missing, treat as duplicate
                const timeDiff = Math.abs((existing.timestamp || 0) - (newOrder.timestamp || 0));
                if (!existing.timestamp || !newOrder.timestamp || timeDiff <= 24 * 60 * 60 * 1000) {
                    return true;
                }
            }
        }
        
        // 3. Phone + Customer + Type + Date (exact date match)
        if (existing.phone && newOrder.phone && 
            existing.customer && newOrder.customer &&
            existing.type === newOrder.type &&
            existing.date && newOrder.date) {
            
            const existingPhone = normalizePhoneNum(existing.phone);
            const newOrderPhone = normalizePhoneNum(newOrder.phone);
            const existingCustomer = normalize(existing.customer);
            const newOrderCustomer = normalize(newOrder.customer);
            const existingDate = normalize(existing.date);
            const newOrderDate = normalize(newOrder.date);
            
            const phoneMatch = existingPhone.length >= 6 && newOrderPhone.length >= 6 && 
                             existingPhone === newOrderPhone;
            const customerMatch = existingCustomer === newOrderCustomer;
            const dateMatch = existingDate === newOrderDate;
            
            if (phoneMatch && customerMatch && dateMatch) {
                return true;
            }
        }
        
        // 4. Check allColumns for key matching fields (if both have allColumns)
        if (existing.allColumns && newOrder.allColumns) {
            // Get all column names that exist in both
            const commonColumns = Object.keys(existing.allColumns).filter(col => 
                newOrder.allColumns.hasOwnProperty(col)
            );
            
            // If we have at least 3 matching columns with same values, it's likely a duplicate
            let matchingColumns = 0;
            const requiredColumns = ['Αρ.', 'Αριθμός', 'Phone', 'Τηλέφωνο', 'Customer', 'Πελάτης'];
            
            for (const col of commonColumns) {
                const existingVal = normalize(String(existing.allColumns[col] || ''));
                const newOrderVal = normalize(String(newOrder.allColumns[col] || ''));
                
                if (existingVal && newOrderVal && existingVal === newOrderVal) {
                    matchingColumns++;
                    // If it's a required column, it must match
                    if (requiredColumns.some(req => col.toLowerCase().includes(req.toLowerCase()))) {
                        if (existingVal !== newOrderVal) {
                            return false; // Required column doesn't match, not a duplicate
                        }
                    }
                }
            }
            
            // If we have phone + customer match in allColumns and at least 2 other columns match
            const hasPhoneMatch = commonColumns.some(col => {
                const lower = col.toLowerCase();
                return (lower.includes('phone') || lower.includes('τηλέφωνο')) &&
                       normalize(String(existing.allColumns[col])) === normalize(String(newOrder.allColumns[col]));
            });
            
            const hasCustomerMatch = commonColumns.some(col => {
                const lower = col.toLowerCase();
                return (lower.includes('customer') || lower.includes('πελάτης') || lower.includes('όνομα')) &&
                       normalize(String(existing.allColumns[col])) === normalize(String(newOrder.allColumns[col]));
            });
            
            if (hasPhoneMatch && hasCustomerMatch && matchingColumns >= 3) {
                return true;
            }
        }
        
        return false;
    }

    // Write-through to PocketBase (server) or local GM storage.
    function saveOrdersToHistory(newOrders) {
        if (!newOrders || newOrders.length === 0) return;
        const kind = ohPageKind();
        const tagged = newOrders.map((o) => ({ ...o, _kind: kind }));
        if (!ohUseDatabase()) {
            const added = ohMergeIntoLocalHistory(tagged, kind);
            console.log(`[MMS Order History] local save ${tagged.length} order(s), added ${added}, kind=${kind}`);
            return;
        }
        ohAddPendingOrders(tagged);
        try {
            const queued = queueOrdersForServerSync(tagged, { force: false, kind });
            console.log(`[MMS Order History] write-through ${tagged.length} order(s), queued ${queued}, kind=${kind}`);
        } catch (err) {
            console.warn('[MMS Order History] queue sync failed', err);
        }
    }

    // Function to monitor page for order acceptance
    function monitorOrderAcceptance() {
        // Check if we're on an order list page
        const isOrderListPage = window.location.pathname.includes('srvorders_list.php') || 
                                window.location.pathname.includes('sparepartstoorder_list.php');
        
        if (!isOrderListPage) return;
        
        let lastSavedOrders = [];
        let saveTimeout = null;
        
        // Function to save current orders
        const saveCurrentOrders = () => {
            const currentOrders = extractOrderData();
            if (currentOrders.length > 0) {
                // Only save if orders changed
                const ordersChanged = JSON.stringify(currentOrders) !== JSON.stringify(lastSavedOrders);
                if (ordersChanged) {
                    saveOrdersToHistory(currentOrders);
                    lastSavedOrders = currentOrders;
                }
            }
        };
        
        // Extract and save current orders on page load
        setTimeout(saveCurrentOrders, 1000);
        
        // Monitor for accept buttons/clicks
        const setupAcceptButtonListeners = () => {
            const acceptButtons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [onclick*="accept"], [onclick*="Accept"]');
            acceptButtons.forEach(btn => {
                const btnText = (btn.innerText || btn.textContent || btn.value || btn.title || '').toLowerCase();
                const btnOnClick = btn.getAttribute('onclick') || '';
                
                if (btnText.includes('accept') || btnText.includes('αποδοχή') || 
                    btnText.includes('ok') || btnText.includes('yes') ||
                    btnOnClick.toLowerCase().includes('accept')) {
                    
                    // Save orders before clicking
                    btn.addEventListener('click', (e) => {
                        // Save immediately before action
                        saveCurrentOrders();
                        
                        // Also save after a delay in case order is removed from DOM
                        setTimeout(saveCurrentOrders, 500);
                        setTimeout(saveCurrentOrders, 1000);
                    }, { capture: true });
                }
            });
        };
        
        setupAcceptButtonListeners();
        
        // Monitor for DOM changes (orders being removed after acceptance)
        const observer = new MutationObserver((mutations) => {
            let shouldSave = false;
            
            mutations.forEach(mutation => {
                if (mutation.removedNodes.length > 0) {
                    // Check if any table rows were removed
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'TR' || node.querySelector && node.querySelector('tr')) {
                                shouldSave = true;
                            }
                        }
                    });
                }
                
                if (mutation.addedNodes.length > 0) {
                    // New buttons might have been added
                    setupAcceptButtonListeners();
                }
            });
            
            if (shouldSave) {
                // Debounce saves
                if (saveTimeout) clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveCurrentOrders();
                }, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also periodically save orders (in case we miss the acceptance)
        const periodicSave = setInterval(() => {
            saveCurrentOrders();
        }, 5000); // Every 5 seconds
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            saveCurrentOrders();
            observer.disconnect();
            clearInterval(periodicSave);
        });
    }

    // Function to remove duplicates from existing history
    function removeDuplicatesFromHistory() {
        if (ohUseDatabase()) return; // Server list is authoritative
        ['service', 'parts'].forEach((kind) => {
            const list = ohLoadLocalHistory(kind);
            if (!list.length) return;
            const cleaned = [];
            list.forEach((order) => {
                if (!cleaned.some((ex) => isDuplicateOrder(ex, order))) cleaned.push(order);
            });
            if (cleaned.length !== list.length) ohSaveLocalHistory(kind, cleaned);
        });
    }

    // Background / write-through (same as saveOrdersToHistory)
    function saveOrdersToSpecificHistory(newOrders, historyKey, pageLabel, pageType) {
        if (!newOrders || newOrders.length === 0) return;
        const kind = pageType === 'parts' ? 'parts' : (pageType === 'service' ? 'service' : null);
        const tagged = newOrders.map((o) => ({ ...o, _kind: kind || o._kind || ohOrderKind(o) }));
        if (!ohUseDatabase()) {
            const want = kind || ohOrderKind(tagged[0]);
            const added = ohMergeIntoLocalHistory(tagged, want);
            console.log(`[MMS Order History] [Background] ${pageLabel}: local save ${tagged.length}, added ${added}, kind=${want}`);
            return;
        }
        ohAddPendingOrders(tagged);
        try {
            const queued = queueOrdersForServerSync(tagged, { force: false, kind });
            console.log(`[MMS Order History] [Background] ${pageLabel}: write-through ${tagged.length}, queued ${queued}, kind=${kind || 'auto'}`);
        } catch (_) { /* ignore */ }
    }

    // Process fetched HTML from an orders list page and merge into history
    function processOrderListHtml(htmlText, pageType) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // Use same selectors as live page extraction
            const table = doc.querySelector('table.rnr-b-grid, table.rnr-b-table');
            if (!table) {
                console.warn('[MMS Order History] [Background] No grid table found for pageType:', pageType);
                return;
            }
            
            let orders = [];
            if (pageType === 'service') {
                orders = extractServiceOrderData(table);
            } else if (pageType === 'parts') {
                orders = extractPartsOrderData(table);
            }
            
            if (!orders || orders.length === 0) return;
            
            const historyKey = (pageType === 'service')
                ? 'tm_srvorders_page_history'
                : 'tm_partsorders_page_history';
            const label = (pageType === 'service') ? 'Service Orders' : 'Parts Orders';
            
            saveOrdersToSpecificHistory(orders, historyKey, label, pageType);
        } catch (e) {
            console.error('[MMS Order History] [Background] Error processing order list HTML for', pageType, e);
        }
    }

    // Perform one background fetch cycle for both order list pages
    function runOrderHistoryBackgroundFetch() {
        if (!orderHistoryBackgroundEnabled) return;
        
        const origin = window.location.origin || '';
        // Use the canonical /mymanagerservice/ path for list pages
        const base = origin + '/mymanagerservice/';
        
        const targets = [
            { url: base + 'srvorders_list.php', pageType: 'service' },
            { url: base + 'sparepartstoorder_list.php', pageType: 'parts' }
        ];
        
        targets.forEach(target => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: target.url,
                onload: (resp) => {
                    if (!resp.responseText) return;
                    processOrderListHtml(resp.responseText, target.pageType);
                },
                onerror: (err) => {
                    console.error('[MMS Order History] [Background] Fetch failed for', target.url, err);
                }
            });
        });
    }

    // Initialize periodic background fetching, once per browser session
    function initOrderHistoryBackgroundFetcher() {
        if (!orderHistoryBackgroundEnabled) return;
        
        // Prevent multiple timers if script is injected multiple times
        if (window._mmsOrderHistoryBackgroundStarted) return;
        window._mmsOrderHistoryBackgroundStarted = true;
        
        const INTERVAL_MINUTES = 15;
        const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;
        
        // Small random delay to avoid hammering server at exact same second
        const jitter = Math.random() * 60000;
        
        setTimeout(() => {
            // Run once immediately after jitter
            runOrderHistoryBackgroundFetch();
            // Then on interval
            setInterval(runOrderHistoryBackgroundFetch, INTERVAL_MS);
        }, jitter);
    }

    // Function to format date for grouping
    function formatDateForGroup(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    // Function to format timestamp to readable date/time
    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('el-GR', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Helper function to check order in a table
    function checkOrderInTable(table, order) {
        if (!table) {
            console.log(`[MMS Order History] ⚠️ No table provided for order ${order.id}`);
            return { exists: false, matchMethod: 'No table found' };
        }
        
        // Get headers to find columns (same logic as extractOrderData)
        const headers = Array.from(table.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        if (headerTexts.length === 0) {
            console.log(`[MMS Order History] ⚠️ No headers found in table for order ${order.id}`);
            return { exists: false, matchMethod: 'No table headers found' };
        }
        
        const orderNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id') || lower.includes('αριθμός');
        });
        
        const phoneIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
        });
        
        const customerIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα') || lower.includes('ονοματεπώνυμο');
        });
        
        console.log(`[MMS Order History] Checking order ${order.id} (${order.type}):`, {
            headerCount: headerTexts.length,
            headers: headerTexts,
            orderNumberIndex,
            phoneIndex,
            customerIndex,
            orderId: order.id,
            phone: order.phone,
            customer: order.customer
        });
        
        // Get all rows
        const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        console.log(`[MMS Order History] Found ${rows.length} rows in table`);
        
        if (rows.length === 0) {
            console.log(`[MMS Order History] ⚠️ No rows found in table for order ${order.id}`);
            return { exists: false, matchMethod: 'No rows found in table' };
        }
        
        let exists = false;
        let matchMethod = '';
        
        // Helper function to normalize strings for comparison
        const normalize = (str) => {
            if (!str) return '';
            return String(str).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
        };
        
        const normalizePhone = (str) => {
            if (!str) return '';
            return String(str).replace(/[^0-9]/g, '').trim();
        };
        
        const normalizeName = (str) => {
            if (!str) return '';
            return String(str).toLowerCase().trim().replace(/\s+/g, ' ');
        };
        
        rows.forEach((row, rowIndex) => {
            if (exists) return; // Already found, skip remaining rows
            
            if (row.style.display === 'none' || row.offsetParent === null) return;
            
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length === 0) return;
            
            // Primary check: Order ID (try exact match first, then normalized)
            if (orderNumberIndex !== -1 && cells[orderNumberIndex]) {
                const cellText = (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim();
                const orderIdClean = String(order.id || '').trim();
                const cellTextClean = cellText.trim();
                
                if (cellTextClean && orderIdClean) {
                    // Exact match
                    if (cellTextClean === orderIdClean) {
                        exists = true;
                        matchMethod = `Order ID exact match in row ${rowIndex}: "${cellTextClean}"`;
                        console.log(`[MMS Order History] ✅ ${matchMethod}`);
                        return;
                    }
                    
                    // Normalized match
                    const normalizedOrderId = normalize(orderIdClean);
                    const normalizedCellText = normalize(cellTextClean);
                    
                    if (normalizedOrderId && normalizedCellText && 
                        (normalizedCellText === normalizedOrderId ||
                         normalizedCellText.includes(normalizedOrderId) ||
                         normalizedOrderId.includes(normalizedCellText))) {
                        exists = true;
                        matchMethod = `Order ID normalized match in row ${rowIndex}: "${cellTextClean}" (normalized: "${normalizedCellText}")`;
                        console.log(`[MMS Order History] ✅ ${matchMethod}`);
                        return;
                    }
                }
            }
            
            // Fallback check: Phone + Customer combination (more reliable)
            if (order.phone && order.customer && !exists) {
                let phoneMatch = false;
                let customerMatch = false;
                
                if (phoneIndex !== -1 && cells[phoneIndex]) {
                    const cellPhone = (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim();
                    const normalizedOrderPhone = normalizePhone(order.phone);
                    const normalizedCellPhone = normalizePhone(cellPhone);
                    
                    if (normalizedOrderPhone && normalizedCellPhone) {
                        if (normalizedCellPhone === normalizedOrderPhone ||
                            normalizedCellPhone.includes(normalizedOrderPhone) ||
                            normalizedOrderPhone.includes(normalizedCellPhone)) {
                            phoneMatch = true;
                        }
                    }
                }
                
                if (customerIndex !== -1 && cells[customerIndex]) {
                    const cellCustomer = (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim();
                    const normalizedOrderCustomer = normalizeName(order.customer);
                    const normalizedCellCustomer = normalizeName(cellCustomer);
                    
                    if (normalizedOrderCustomer && normalizedCellCustomer) {
                        if (normalizedCellCustomer === normalizedOrderCustomer ||
                            normalizedCellCustomer.includes(normalizedOrderCustomer) ||
                            normalizedOrderCustomer.includes(normalizedCellCustomer)) {
                            customerMatch = true;
                        }
                    }
                }
                
                // If both phone and customer match, it's the same order
                if (phoneMatch && customerMatch) {
                    exists = true;
                    matchMethod = `Phone+Customer match in row ${rowIndex}`;
                    console.log(`[MMS Order History] ✅ ${matchMethod}`);
                    return;
                }
            }
            
            // URL-based check: Extract order ID from data-href
            // This is CRITICAL for service orders because:
            // - Service orders have NO "Αρ." column in the table
            // - Some orders have NO phone number (e.g., customer "ΒΡΙΛΗΣΣΙΑ" with blank phone)
            // - The only way to match them is by extracting editid1 from the URL
            if (!exists && order.id) {
                // Check row's data-href attribute (parts orders)
                let rowHref = row.getAttribute('data-href');
                
                // If not on row, check cells (service orders store it on TD elements)
                if (!rowHref) {
                    const cellWithHref = row.querySelector('td[data-href]');
                    if (cellWithHref) {
                        rowHref = cellWithHref.getAttribute('data-href');
                    }
                }
                
                if (rowHref) {
                    try {
                        // Extract editid1 parameter from URL
                        const urlObj = new URL(rowHref, window.location.href);
                        const editId = urlObj.searchParams.get('editid1') || 
                                      urlObj.searchParams.get('id') || 
                                      urlObj.searchParams.get('orderid');
                        
                        if (editId) {
                            const orderIdClean = String(order.id).trim();
                            const editIdClean = String(editId).trim();
                            
                            // Check if order ID matches editid1 or contains it (for composite IDs like "237137__CODE")
                            if (orderIdClean === editIdClean || 
                                orderIdClean.startsWith(editIdClean + '__') ||
                                orderIdClean === editIdClean) {
                                exists = true;
                                matchMethod = `URL editid1 match in row ${rowIndex}: "${editIdClean}" from "${rowHref}"`;
                                console.log(`[MMS Order History] ✅ ${matchMethod}`);
                                return;
                            }
                        }
                    } catch (e) {
                        // Invalid URL, skip
                    }
                }
            }
            
            // Last resort: check all cells for order ID (scan entire row)
            if (!exists && order.id) {
                cells.forEach((cell, cellIndex) => {
                    if (exists) return;
                    
                    const text = (cell.innerText || cell.textContent || '').trim();
                    if (!text) return;
                    
                    const orderIdClean = String(order.id).trim();
                    const normalizedText = normalize(text);
                    const normalizedOrderId = normalize(orderIdClean);
                    
                    if (normalizedOrderId && normalizedText && 
                        (text === orderIdClean ||
                         text.includes(orderIdClean) ||
                         orderIdClean.includes(text) ||
                         normalizedText === normalizedOrderId ||
                         normalizedText.includes(normalizedOrderId) ||
                         normalizedOrderId.includes(normalizedText))) {
                        exists = true;
                        matchMethod = `Found order ID in cell ${cellIndex} of row ${rowIndex}: "${text}"`;
                        console.log(`[MMS Order History] ✅ ${matchMethod}`);
                    }
                });
            }
        });
        
        if (!exists) {
            console.log(`[MMS Order History] ❌ Order ${order.id} not found in table after checking ${rows.length} rows`);
        }
        
        return { exists, matchMethod: matchMethod || 'Not found' };
    }

    // Function to check if order still exists in system
    async function checkOrderStatus(order) {
        const cacheKey = `order_status_${order.id}_${order.type}`;
        const now = Date.now();
        
        // First, ALWAYS check the current page if we're on the order list page
        // This takes priority over cache to ensure accuracy when viewing the page
        const currentPath = window.location.pathname;
        const isServicePage = currentPath.includes('srvorders_list.php');
        const isPartsPage = currentPath.includes('sparepartstoorder_list.php');

        // Determine which list page this order belongs to using its stored URL as primary signal.
        // Falls back to type name to handle entries saved before the type label fix.
        const storedUrl = order.url || '';
        const isOrderFromServicePage = storedUrl.includes('srvorders') || order.type === 'Product Order' ||
            (order.type === 'Service Order' && !storedUrl.includes('sparepartstoorder'));
        const isOrderFromPartsPage = storedUrl.includes('sparepartstoorder') || order.type === 'Parts Order' ||
            (order.type === 'Service Order' && storedUrl.includes('sparepartstoorder'));

        if ((isOrderFromServicePage && isServicePage) || 
            (isOrderFromPartsPage && isPartsPage)) {
            const currentTable = document.querySelector('table.rnr-b-grid, table.rnr-b-table');
            if (currentTable) {
                console.log(`[MMS Order History] Checking order ${order.id} on current page (priority check)`);
                const result = checkOrderInTable(currentTable, order);
                const statusResult = { 
                    exists: result.exists, 
                    checking: false, 
                    matchMethod: result.matchMethod,
                    fromCurrentPage: true // Flag to indicate this came from current page
                };
                // Always update cache with current page result
                GM_setValue(cacheKey, { status: statusResult, timestamp: now });
                
                if (result.exists) {
                    console.log(`[MMS Order History] ✅ Order ${order.id} (${order.type}) found on current page - ${result.matchMethod}`);
                } else {
                    console.log(`[MMS Order History] ❌ Order ${order.id} (${order.type}) not found on current page`);
                }
                
                // If found on current page, return immediately (don't fetch)
                // If not found, continue to fetch (might be on a different page/filter)
                if (result.exists) {
                    return statusResult;
                }
                // If not found on current page, continue to fetch below
            }
        }
        
        // Check cache only if we're NOT on the order page
        const cached = GM_getValue(cacheKey, null);
        const cacheTime = cached ? cached.timestamp : 0;
        
        // Use cached result if less than 5 minutes old AND not from current page
        if (cached && (now - cacheTime < 300000) && !cached.status.fromCurrentPage) {
            return cached.status;
        }
        
        // If status checking is disabled, return without remote fetch
        if (!orderHistoryStatusCheckEnabled) {
            const result = { exists: null, checking: false, skipped: true };
            GM_setValue(cacheKey, { status: result, timestamp: now });
            return result;
        }
        
        // Default to checking (will be updated asynchronously)
        const status = { exists: null, checking: true };
        GM_setValue(cacheKey, { status, timestamp: now });
        
        // Otherwise, fetch the order list page.
        // Use the stored URL as the primary signal; type name is a fallback for old stored entries.
        const fetchStoredUrl = order.url || '';
        const fetchFromServicePage =
            fetchStoredUrl.includes('srvorders') ||
            order.type === 'Product Order' ||  // old label for service orders
            (order.type === 'Service Order' && !fetchStoredUrl.includes('sparepartstoorder'));
        const url = fetchFromServicePage
            ? 'https://thefixers.mymanager.gr/mymanagerservice/srvorders_list.php?pagesize=10000'
            : 'https://thefixers.mymanager.gr/mymanagerservice/sparepartstoorder_list.php?pagesize=10000';
        
        // Store fetch start time to compare with cache later
        const fetchStartTime = Date.now();
        
        return new Promise((resolve) => {
            console.log(`[MMS Order History] Fetching ${url} to check order ${order.id} (${order.type})`);
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    if (!response.responseText) {
                        console.error(`[MMS Order History] ⚠️ Empty response for order ${order.id}`);
                        const result = { exists: false, checking: false, error: true, matchMethod: 'Empty response' };
                        GM_setValue(cacheKey, { status: result, timestamp: now });
                        resolve(result);
                        return;
                    }
                    
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    
                    // Try multiple table selectors
                    const table = doc.querySelector('table.rnr-b-grid, table.rnr-b-table, table.rnr-gridtable, table[class*="grid"]');
                    
                    if (!table) {
                        console.error(`[MMS Order History] ⚠️ No table found in fetched page for order ${order.id}`);
                        console.log(`[MMS Order History] Response length: ${response.responseText.length}`);
                        console.log(`[MMS Order History] Available tables:`, doc.querySelectorAll('table').length);
                        const result = { exists: false, checking: false, error: true, matchMethod: 'No table found in response' };
                        GM_setValue(cacheKey, { status: result, timestamp: now });
                        resolve(result);
                        return;
                    }
                    
                    console.log(`[MMS Order History] Table found, checking order ${order.id}...`);
                    const result = checkOrderInTable(table, order);
                    
                    // Check if we have a more recent "Active" result from current page (within last 10 seconds)
                    const fetchEndTime = Date.now();
                    const latestCache = GM_getValue(cacheKey, null);
                    if (latestCache && latestCache.status && latestCache.status.fromCurrentPage && latestCache.status.exists) {
                        const timeSinceCurrentPageCheck = fetchEndTime - latestCache.timestamp;
                        // If current page check happened after fetch started, trust it more
                        if (latestCache.timestamp > fetchStartTime && timeSinceCurrentPageCheck < 10000) {
                            // Don't overwrite a recent "Active" result from current page
                            console.log(`[MMS Order History] ⚠️ Keeping current page "Active" result for order ${order.id} (checked ${timeSinceCurrentPageCheck}ms ago), not overwriting with fetch result`);
                            resolve(latestCache.status);
                            return;
                        }
                    }
                    
                    const statusResult = { 
                        exists: result.exists, 
                        checking: false, 
                        matchMethod: result.matchMethod,
                        error: false,
                        fromCurrentPage: false
                    };
                    GM_setValue(cacheKey, { status: statusResult, timestamp: now });
                    
                    if (result.exists) {
                        console.log(`[MMS Order History] ✅ Order ${order.id} (${order.type}) FOUND - ${result.matchMethod}`);
                    } else {
                        console.log(`[MMS Order History] ❌ Order ${order.id} (${order.type}) NOT FOUND - ${result.matchMethod}`);
                    }
                    
                    resolve(statusResult);
                },
                onerror: function(error) {
                    console.error(`[MMS Order History] ⚠️ Error fetching order list for ${order.id}:`, error);
                    const result = { exists: false, checking: false, error: true, matchMethod: 'Network error' };
                    GM_setValue(cacheKey, { status: result, timestamp: now });
                    resolve(result);
                }
            });
        });
    }

    // Function to batch check order statuses
    async function checkOrdersStatus(orders) {
        const statusPromises = orders.map(order => checkOrderStatus(order));
        return Promise.all(statusPromises);
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatPhoneDisplay(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed) return '';
        const digits = trimmed.replace(/\D/g, '');
        if (!digits) return trimmed;
        let local = digits;
        if (local.startsWith('0030')) local = local.slice(4);
        else if (local.startsWith('30') && local.length >= 12) local = local.slice(2);
        if (local.length === 10) {
            return `${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;
        }
        if (local.length === 9 && local.startsWith('6')) {
            const padded = `0${local}`;
            return `${padded.slice(0, 3)} ${padded.slice(3, 7)} ${padded.slice(7)}`;
        }
        return trimmed;
    }

    function ensureNativeHistoryStyles() {
        const existing = document.getElementById('tm-order-history-ui-styles');
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.id = 'tm-order-history-ui-styles';
        // Plumbing only — no custom skin so site theme styles the bricks.
        style.textContent = `
            #tm-oh-native-root:not([hidden]) { display: contents; }
            #tm-oh-bar { display: contents; }
            #tm-oh-native-root .rnr-orderlink[data-sort] { cursor: pointer; }
            #tm-oh-native-root .rnr-orderlink.sort-asc::after { content: ' ↑'; }
            #tm-oh-native-root .rnr-orderlink.sort-desc::after { content: ' ↓'; }
            #tm-oh-native-root .tm-copy-phone-btn { margin-left: 4px; cursor: pointer; }
            #tm-oh-native-root a.tm-oh-preset.is-active,
            #tm-oh-native-root a.tm-oh-status.is-on { font-weight: 700; text-decoration: underline; }
        `;
        document.head.appendChild(style);
    }

    function isOrderHistoryListPage() {
        return onOrdersPage;
    }

    function getOrderHistoryListUrl() {
        const base = isPartsOrdersPage ? 'sparepartstoorder_list.php' : 'srvorders_list.php';
        return `${base}?tm_oh=1`;
    }

    let nativeHistoryActive = false;
    let nativeHistoryWired = false;
    let nativeHistorySession = null;
    let nativeHistoryEscHandler = null;

    function getLiveRecordControlsStrip() {
        return document.querySelector('.rnr-center .rnr-c-recordcontrols, .rnr-cw-recordcontrols .rnr-c-recordcontrols, .rnr-c-recordcontrols');
    }

    function ensureNativeToggleButton() {
        if (!isOrderHistoryListPage()) return null;
        let btn = document.getElementById('tm-oh-native-toggle');
        if (btn) return btn;
        const strip = getLiveRecordControlsStrip();
        if (!strip) return null;
        btn = document.createElement('a');
        btn.href = '#';
        btn.id = 'tm-oh-native-toggle';
        btn.className = 'rnr-button';
        btn.setAttribute('cid', 'tm-oh-toggle');
        btn.innerHTML = '<span>Ιστορικό</span>';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (nativeHistoryActive) exitNativeHistoryMode();
            else enterNativeHistoryMode();
        });
        strip.appendChild(btn);
        ensureNativeHistoryControlButtons(strip);
        return btn;
    }

    function ensureNativeHistoryControlButtons(strip) {
        // Sync/CSV live in the history toolbar now — no extra chrome on the live strip.
        return strip || getLiveRecordControlsStrip();
    }

    function setHistoryControlsVisible() {
        // no-op: toolbar visibility follows #tm-oh-native-root
    }

    function ensureNativeHistoryShell() {
        ensureNativeHistoryStyles();
        ensureNativeToggleButton();
        let root = document.getElementById('tm-oh-native-root');
        // Drop previous custom toolbar mounts so we always use native bricks
        if (root && (
            !root.querySelector('#tm-oh-bar .rnr-cw-recordcontrols')
            || root.querySelector('.tm-oh-bar-search, .tm-oh-seg, .tm-oh-chip, .tm-oh-action')
        )) {
            root.remove();
            root = null;
            nativeHistoryWired = false;
            nativeHistorySession = null;
        }
        if (root) return root;

        const center = document.querySelector('.rnr-center') || document.querySelector('#center') || document.body;
        const liveControls = center.querySelector('.rnr-cw-recordcontrols');
        const livePag = center.querySelector('.rnr-cw-pagination');
        const liveGrid = center.querySelector('.rnr-cw-grid');
        const liveTable = liveGrid?.querySelector('table.rnr-gridtable, table.rnr-b-grid, table');
        const cellsCss = liveGrid?.querySelector('style.rnr-cells-css');
        const useDatabase = ohUseDatabase();

        const controlsClass = liveControls?.className || 'rnr-cw-recordcontrols rnr-s-2 asbuttons MyMANAGERWhite_label1';
        const controlsInner = liveControls?.querySelector('.rnr-c-recordcontrols')?.className || 'rnr-c rnr-ch rnr-c-recordcontrols';
        const pagClass = livePag?.className || 'rnr-cw-pagination rnr-s-2 asbuttons MyMANAGERWhite_label1';
        const pagInner = livePag?.querySelector('.rnr-c-pagination')?.className || 'rnr-c rnr-ch rnr-c-pagination';
        const gridClass = liveGrid?.className || 'rnr-cw-grid rnr-s-grid asbuttons MyMANAGERWhite_label1';
        const tableClass = liveTable?.className || 'rnr-c rnr-cont rnr-c-grid rnr-b-grid rnr-gridtable hoverable';

        root = document.createElement('div');
        root.id = 'tm-oh-native-root';
        root.setAttribute('hidden', '');

        const bar = document.createElement('div');
        bar.id = 'tm-oh-bar';
        bar.innerHTML = `
            <div class="${escapeHtml(controlsClass)}">
                <div class="${escapeHtml(controlsInner)}" data-location="recordcontrols">
                    <div class="style1 rnr-bl rnr-b-recordcontrol">
                        <a href="#" class="rnr-button" id="tm-order-sync-btn" ${useDatabase ? '' : 'hidden'}><span>Ανανέωση</span></a>
                    </div>
                    <div class="style1 rnr-bl rnr-b-recordcontrol">
                        <a href="#" class="rnr-button" id="tm-order-export-btn"><span>CSV</span></a>
                    </div>
                    <div class="style1 rnr-bl rnr-b-toplinks">
                        <span class="rnr-buttons-group">
                            <a href="#" class="rnr-button tm-oh-status is-on" data-status="all"><span>Όλες</span></a>
                            <a href="#" class="rnr-button tm-oh-status" data-status="active"><span>Ενεργές</span></a>
                            <a href="#" class="rnr-button tm-oh-status" data-status="removed"><span>Διαγραμμένες</span></a>
                        </span>
                    </div>
                    <div class="style1 rnr-bl rnr-b-toplinks">
                        <span class="rnr-buttons-group">
                            <a href="#" class="rnr-button tm-oh-preset" data-preset="today"><span>Σήμερα</span></a>
                            <a href="#" class="rnr-button tm-oh-preset" data-preset="7d"><span>7η</span></a>
                            <a href="#" class="rnr-button tm-oh-preset" data-preset="30d"><span>30η</span></a>
                            <a href="#" class="rnr-button tm-oh-preset" data-preset="clear"><span>Καθαρισμός</span></a>
                        </span>
                    </div>
                    <div class="rnr-hfiller"></div>
                    <div class="style1 rnr-br">
                        <span id="tm-oh-sync-status">${useDatabase ? 'φόρτωση…' : 'τοπικό'}</span>
                        <span id="tm-oh-store-label" hidden></span>
                    </div>
                    <input type="hidden" id="tm-order-status-filter" value="all" />
                </div>
            </div>
            <div class="${escapeHtml(pagClass)}">
                <div class="${escapeHtml(pagInner)}" data-location="pagination">
                    <div class="style1 rnr-bl rnr-b-details_found">
                        <span>Εγγραφές: <b><span class="rnr-details_found_count" id="tm-oh-count-label">0</span></b></span>
                    </div>
                    <div class="rnr-hfiller"></div>
                    <div class="style1 rnr-br rnr-b-recsperpage">
                        <span>
                            Αναζήτηση:&nbsp;<input type="text" id="tm-order-history-search" size="20" />
                            &nbsp;Από&nbsp;<input type="date" id="tm-oh-date-from" />
                            &nbsp;Έως&nbsp;<input type="date" id="tm-oh-date-to" />
                        </span>
                    </div>
                </div>
            </div>
        `;

        const grid = document.createElement('div');
        grid.className = gridClass;
        grid.id = 'tm-oh-native-grid';
        if (cellsCss) grid.appendChild(cellsCss.cloneNode(true));
        const table = document.createElement('table');
        table.className = tableClass;
        table.cellPadding = '0';
        table.setAttribute('data-location', 'grid');
        table.id = 'tm-oh-native-table';
        table.innerHTML = '<thead></thead><tbody></tbody>';
        grid.appendChild(table);

        root.appendChild(bar);
        root.appendChild(grid);
        center.appendChild(root);
        return root;
    }

    function isLiveRecordControlsStrip(el) {
        if (!el || el.id === 'tm-oh-native-root') return false;
        if (el.classList?.contains('rnr-cw-recordcontrols')) return true;
        if (el.classList?.contains('rnr-c-recordcontrols')) return true;
        return !!el.querySelector?.('.rnr-c-recordcontrols, .rnr-cw-recordcontrols');
    }

    function exitNativeHistoryMode() {
        const root = document.getElementById('tm-oh-native-root');
        const center = root?.parentElement || document.querySelector('.rnr-center');
        if (center) {
            Array.from(center.children).forEach((child) => {
                if (child.id === 'tm-oh-native-root') return;
                if (child.getAttribute('data-tm-oh-hidden') === '1') {
                    child.removeAttribute('data-tm-oh-hidden');
                    child.style.display = '';
                }
            });
        }
        if (root) root.setAttribute('hidden', '');
        nativeHistoryActive = false;
        setHistoryControlsVisible(false);
        const toggle = document.getElementById('tm-oh-native-toggle');
        if (toggle) {
            toggle.classList.remove('is-active');
            const span = toggle.querySelector('span');
            if (span) span.textContent = 'Ιστορικό';
        }
        if (nativeHistoryEscHandler) {
            document.removeEventListener('keydown', nativeHistoryEscHandler);
            nativeHistoryEscHandler = null;
        }
        try {
            const url = new URL(location.href);
            if (url.searchParams.has('tm_oh')) {
                url.searchParams.delete('tm_oh');
                history.replaceState(null, '', url.pathname + url.search + url.hash);
            }
        } catch (_) { /* ignore */ }
    }

    function enterNativeHistoryMode() {
        if (!isOrderHistoryListPage()) {
            location.href = getOrderHistoryListUrl();
            return;
        }

        ensureNativeToggleButton();
        const root = ensureNativeHistoryShell();
        const center = root.parentElement;
        if (center) {
            Array.from(center.children).forEach((child) => {
                if (child === root) return;
                // Keep live recordcontrols so Ιστορικό / Ζωντανές toggle stays clickable
                if (isLiveRecordControlsStrip(child)) return;
                if (child.style.display === 'none' && child.getAttribute('data-tm-oh-hidden') !== '1') return;
                child.setAttribute('data-tm-oh-hidden', '1');
                child.style.display = 'none';
            });
        }
        root.removeAttribute('hidden');
        nativeHistoryActive = true;
        setHistoryControlsVisible(true);

        const toggle = document.getElementById('tm-oh-native-toggle');
        if (toggle) {
            toggle.classList.add('is-active');
            const span = toggle.querySelector('span');
            if (span) span.textContent = 'Ζωντανές';
        }

        if (!nativeHistoryEscHandler) {
            nativeHistoryEscHandler = (e) => {
                if (e.key === 'Escape' && nativeHistoryActive) {
                    e.preventDefault();
                    exitNativeHistoryMode();
                }
            };
            document.addEventListener('keydown', nativeHistoryEscHandler);
        }

        if (!nativeHistoryWired) {
            wireNativeHistorySession(root);
            nativeHistoryWired = true;
        } else if (nativeHistorySession?.paintFromCacheThenRefresh) {
            nativeHistorySession.paintFromCacheThenRefresh();
        }
    }

    function wireNativeHistorySession(root) {
        const useDatabase = ohUseDatabase();
        const histTable = root.querySelector('#tm-oh-native-table') || document.getElementById('tm-oh-native-table');
        const clickRoot = root.querySelector('#tm-oh-native-grid') || histTable || root;
        const searchInput = root.querySelector('#tm-order-history-search');
        const statusFilter = root.querySelector('#tm-order-status-filter');
        const dateFrom = root.querySelector('#tm-oh-date-from');
        const dateTo = root.querySelector('#tm-oh-date-to');
        const syncBtn = document.getElementById('tm-order-sync-btn');
        const exportBtn = document.getElementById('tm-order-export-btn');

        let sortKey = 'timestamp';
        let sortDir = 'desc';
        // Prefer first live data column once DOM is ready (matches Ζωντανές sort feel)
        try {
            const firstLive = (ohGetLiveListColumns() || []).find((c) => c.kind === 'field' || c.kind === 'checkbox');
            if (firstLive?.label) sortKey = `col:${firstLive.label}`;
        } catch (_) { /* ignore */ }
        let statusesChecked = false;
        const statusResultsMap = new Map();
        let activePreset = '';

        const setSyncStatus = (text) => {
            const el = document.getElementById('tm-oh-sync-status');
            if (el) el.textContent = text;
        };

        const setCountLabel = (visible, total) => {
            const cap = ohViewCapped ? ' · νεότερα 200' : '';
            const text = total ? `${visible} / ${total}${cap}` : String(visible || 0);
            const el = root.querySelector('#tm-oh-count-label') || document.getElementById('tm-oh-count-label');
            if (el) el.textContent = text;
        };
        const orderDayStart = (order) => {
            const ts = Number(order.timestamp) || 0;
            if (ts) {
                const d = new Date(ts);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            }
            const raw = String(order.date || '');
            const m = raw.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
            if (m) {
                const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
                return new Date(y, Number(m[2]) - 1, Number(m[1])).getTime();
            }
            return 0;
        };

        const getFilteredOrders = () => {
            const q = String(searchInput.value || '').trim().toLowerCase();
            const statusMode = statusFilter.value || 'all';
            const fromVal = dateFrom.value ? new Date(dateFrom.value) : null;
            const toVal = dateTo.value ? new Date(dateTo.value) : null;
            if (fromVal) fromVal.setHours(0, 0, 0, 0);
            if (toVal) toVal.setHours(23, 59, 59, 999);

            let list = ohFilterOrdersByPageKind(ohViewOrders.slice(), ohPageKind());
            if (q) {
                list = list.filter((o) => {
                    const colBlob = o.allColumns
                        ? Object.values(o.allColumns).join(' ')
                        : '';
                    const blob = [
                        o.customer, o.phone, o.repairNumber, o.date, o.status, colBlob,
                    ].join(' ').toLowerCase();
                    return blob.includes(q);
                });
            }
            if (fromVal || toVal) {
                list = list.filter((o) => {
                    const day = orderDayStart(o);
                    if (!day) return false;
                    if (fromVal && day < fromVal.getTime()) return false;
                    if (toVal && day > toVal.getTime()) return false;
                    return true;
                });
            }
            if (statusMode !== 'all' && statusesChecked) {
                list = list.filter((o) => {
                    const st = statusResultsMap.get(String(o.id || ohExtractOrderId(o)));
                    if (!st || st.checking || st.error) return statusMode === 'all';
                    if (statusMode === 'active') return !!st.exists;
                    if (statusMode === 'removed') return !st.exists;
                    return true;
                });
            }

            const dir = sortDir === 'asc' ? 1 : -1;
            list.sort((a, b) => {
                let av;
                let bv;
                if (sortKey === 'customer') {
                    av = String(a.customer || '');
                    bv = String(b.customer || '');
                    return av.localeCompare(bv, 'el') * dir;
                }
                if (sortKey === 'phone') {
                    av = String(a.phone || '').replace(/\D/g, '');
                    bv = String(b.phone || '').replace(/\D/g, '');
                    return av.localeCompare(bv) * dir;
                }
                if (sortKey === 'timestamp') {
                    av = Number(a.timestamp) || 0;
                    bv = Number(b.timestamp) || 0;
                    return (av - bv) * dir;
                }
                if (sortKey.startsWith('col:')) {
                    const colKey = sortKey.slice(4);
                    av = ohResolveColumnValue(a, colKey);
                    bv = ohResolveColumnValue(b, colKey);
                    return av.localeCompare(bv, 'el', { numeric: true }) * dir;
                }
                av = Number(a.timestamp) || 0;
                bv = Number(b.timestamp) || 0;
                return (av - bv) * dir;
            });
            return list;
        };

        const liveTd = (innerHtml, href, tdClass = 'rnr-field-text') => {
            const hrefBits = href
                ? ` data-href="${escapeHtml(href)}" style="cursor:pointer"`
                : '';
            return `<td class="${escapeHtml(String(tdClass || 'rnr-field-text').trim())}"${hrefBits}>${innerHtml}</td>`;
        };

        const liveThFromCol = (col) => {
            if (col.kind === 'bc') {
                return `<th class="${escapeHtml(col.thClass || 'rnr-bc')}"></th>`;
            }
            if (col.kind === 'empty' || !col.label) {
                return `<th class="${escapeHtml(col.thClass || 'rnr-gridfieldlabel rnr-field-text')}"></th>`;
            }
            const key = `col:${col.label}`;
            const sortCls = sortKey === key ? (sortDir === 'asc' ? 'sort-asc' : 'sort-desc') : '';
            return `<th class="${escapeHtml(col.thClass || 'rnr-gridfieldlabel rnr-field-text')}">
                <span class="rnr-orderlink ${sortCls}" data-sort="${escapeHtml(key)}">${escapeHtml(col.label)}</span>
            </th>`;
        };

        const paintTable = (theadHtml, tbodyHtml) => {
            if (!histTable) return;
            const thead = histTable.querySelector('thead');
            const tbody = histTable.querySelector('tbody');
            if (thead) thead.innerHTML = theadHtml;
            if (tbody) tbody.innerHTML = tbodyHtml;
        };

        const historyColumns = () => {
            const liveCols = ohGetLiveListColumns();
            if (liveCols?.length) return liveCols;
            // Fallback only if live DOM missing: data-driven labels, still no extra OH columns
            const labels = ohCollectTableColumns(ohViewOrders);
            return [
                { kind: 'bc', label: '', thClass: 'rnr-bc', tdClass: 'rnr-bc' },
                ...labels.map((label) => ({
                    kind: 'field',
                    label,
                    thClass: 'rnr-gridfieldlabel rnr-field-text',
                    tdClass: 'rnr-field-text',
                })),
            ];
        };

        const renderOrders = () => {
            const filtered = getFilteredOrders();
            setCountLabel(filtered.length, ohViewOrders.length);

            if (!ohViewOrders.length) {
                paintTable('', `<tr class="rnr-row style1"><td class="rnr-field-text"><span>${useDatabase
                    ? 'Δεν υπάρχουν εγγραφές στο server για αυτό το κατάστημα.'
                    : 'Δεν υπάρχει τοπικό ιστορικό ακόμα.'}</span></td></tr>`);
                return;
            }
            if (!filtered.length) {
                paintTable('', `<tr class="rnr-row style1"><td class="rnr-field-text"><span>Καμία εγγραφή με τα τρέχοντα φίλτρα.</span></td></tr>`);
                return;
            }

            const cols = historyColumns();
            const headRow = `<tr class="rnr-toprow style1">${cols.map(liveThFromCol).join('')}</tr>`;

            const rows = filtered.map((order, idx) => {
                const phone = String(order.phone || '');
                const href = order.url || '';
                const rid = idx + 1;
                const cells = cols.map((col) => {
                    if (col.kind === 'bc') {
                        return href
                            ? `<td class="rnr-bc" data-record-id="${rid}" style="cursor:pointer" data-href="${escapeHtml(href)}"></td>`
                            : `<td class="rnr-bc" data-record-id="${rid}"></td>`;
                    }
                    if (col.kind === 'empty') {
                        return liveTd('<span></span>', href, col.tdClass);
                    }
                    const raw = ohResolveColumnValue(order, col.label);
                    if (col.kind === 'checkbox') {
                        const on = /check_yes/i.test(raw)
                            || /^(1|true|yes|ναί|ναι|✓|✔|x)$/i.test(raw.trim());
                        const inner = on
                            ? '<span><img src="images/check_yes.gif" border="0" alt=" "></span>'
                            : '<span></span>';
                        return liveTd(inner, href, col.tdClass);
                    }
                    const lower = String(col.label || '').toLowerCase();
                    const isPhone = /τηλέφων|phone/.test(lower);
                    let inner;
                    if (isPhone) {
                        const disp = formatPhoneDisplay(raw || phone) || raw || '—';
                        const copyVal = raw || phone;
                        inner = `<span>${escapeHtml(disp)}${copyVal ? ` <a href="#" class="tm-copy-phone-btn" data-phone="${escapeHtml(copyVal)}" title="Αντιγραφή">⧉</a>` : ''}</span>`;
                    } else {
                        inner = `<span>${escapeHtml(raw || '')}</span>`;
                    }
                    return liveTd(inner, href, col.tdClass);
                }).join('');
                return `<tr class="rnr-row style1" id="tmOhRow${rid}" ${href ? `data-href="${escapeHtml(href)}"` : ''}>${cells}</tr>`;
            }).join('');

            paintTable(headRow, rows);
        };

        const runStatusChecks = async () => {
            if (!orderHistoryStatusCheckEnabled || !ohViewOrders.length) {
                statusesChecked = true;
                renderOrders();
                return;
            }
            ohViewOrders.forEach((o) => {
                const key = String(o.id || ohExtractOrderId(o));
                statusResultsMap.set(key, { checking: true });
            });
            renderOrders();
            try {
                const results = await checkOrdersStatus(ohViewOrders);
                results.forEach((st, i) => {
                    const o = ohViewOrders[i];
                    if (!o) return;
                    statusResultsMap.set(String(o.id || ohExtractOrderId(o)), st);
                });
            } catch (_) { /* ignore */ }
            statusesChecked = true;
            renderOrders();
        };

        const refreshFromServer = async ({ silent } = {}) => {
            setSyncStatus('συγχρονισμός…');
            if (syncBtn) { syncBtn.classList.add('disabled'); syncBtn.setAttribute('aria-disabled', 'true'); }
            const kind = ohPageKind();
            const remote = await fetchStoreOrderHistoryFromServer(kind);
            if (syncBtn) { syncBtn.classList.remove('disabled'); syncBtn.removeAttribute('aria-disabled'); }
            if (!remote.ok) {
                const cache = ohLoadViewCache(ohStoreKey(), kind);
                if (cache?.orders?.length) {
                    ohViewOrders = ohFilterOrdersByPageKind(cache.orders, kind)
                        .slice()
                        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    ohViewCapped = !!cache.capped;
                    const storeEl = document.getElementById('tm-oh-store-label');
                    if (storeEl) storeEl.textContent = cache.store || ohGetStoreName() || '—';
                    const age = ohFormatCacheAge(cache.savedAt);
                    setSyncStatus(remote.unsupported
                        ? `cache · server off${age ? ` · ${age}` : ''}`
                        : `cache · offline${age ? ` · ${age}` : ''}`);
                    statusesChecked = false;
                    statusResultsMap.clear();
                    renderOrders();
                    runStatusChecks();
                    if (!silent && window.showNegativeMessage) {
                        window.showNegativeMessage('Server μη διαθέσιμος — εμφανίζεται τοπικό cache');
                    }
                    return false;
                }
                setSyncStatus(remote.unsupported
                    ? 'server μη διαθέσιμος'
                    : (remote.reason === 'no-store' ? 'δεν βρέθηκε κατάστημα' : 'αποτυχία φόρτωσης'));
                if (!silent && window.showNegativeMessage) {
                    window.showNegativeMessage(remote.unsupported
                        ? 'Λείπει collection order_history στο PocketBase'
                        : (remote.reason === 'no-store'
                            ? 'Δεν βρέθηκε κατάστημα — δεν φορτώνει κοινό ιστορικό'
                            : 'Αποτυχία φόρτωσης από server'));
                }
                if (!ohViewOrders.length) {
                    ohViewOrders = [];
                    ohViewCapped = false;
                    renderOrders();
                }
                return false;
            }
            ohViewOrders = ohFilterOrdersByPageKind(remote.orders || [], kind)
                .slice()
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            ohViewCapped = !!remote.capped;
            const storeEl = document.getElementById('tm-oh-store-label');
            if (storeEl) storeEl.textContent = remote.store || ohGetStoreName() || '—';
            setSyncStatus(`server · ${remote.storeKey || 'store'} · ${kind}`);
            statusesChecked = false;
            statusResultsMap.clear();
            renderOrders();
            runStatusChecks();
            if (!silent && window.showPositiveMessage) {
                window.showPositiveMessage(`Φορτώθηκαν ${ohViewOrders.length} εγγραφές από server`);
            }
            return true;
        };

        const paintFromCacheThenRefresh = () => {
            const kind = ohPageKind();
            if (!useDatabase) {
                ohViewOrders = ohLoadLocalHistory(kind)
                    .slice()
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                ohViewCapped = ohViewOrders.length >= MAX_HISTORY_ITEMS;
                setSyncStatus('τοπικό · μόνο αυτός ο υπολογιστής');
                statusesChecked = false;
                statusResultsMap.clear();
                renderOrders();
                runStatusChecks();
                return;
            }
            const cache = ohLoadViewCache(ohStoreKey(), kind);
            if (cache?.orders?.length) {
                ohViewOrders = ohFilterOrdersByPageKind(cache.orders, kind)
                    .slice()
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                ohViewCapped = !!cache.capped;
                const storeEl = document.getElementById('tm-oh-store-label');
                if (storeEl) storeEl.textContent = cache.store || ohGetStoreName() || '—';
                const age = ohFormatCacheAge(cache.savedAt);
                setSyncStatus(`cache${age ? ` · ${age}` : ''} · ενημέρωση…`);
                renderOrders();
            } else {
                paintTable('', '<tr class="rnr-row style1"><td class="rnr-field-text"><span>Φόρτωση από server…</span></td></tr>');
            }
            refreshFromServer({ silent: true }).catch(() => {});
        };

        const applyPreset = (preset) => {
            activePreset = preset;
            root.querySelectorAll('a.tm-oh-preset').forEach((btn) => {
                btn.classList.toggle('is-active', btn.getAttribute('data-preset') === preset && preset !== 'clear');
            });
            const now = new Date();
            const toIso = (d) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };
            if (preset === 'clear') {
                dateFrom.value = '';
                dateTo.value = '';
                if (searchInput) searchInput.value = '';
                if (statusFilter) statusFilter.value = 'all';
                root.querySelectorAll('.tm-oh-status').forEach((btn) => {
                    btn.classList.toggle('is-on', btn.getAttribute('data-status') === 'all');
                });
                activePreset = '';
            } else if (preset === 'today') {
                dateFrom.value = toIso(now);
                dateTo.value = toIso(now);
            } else if (preset === '7d') {
                const from = new Date(now);
                from.setDate(from.getDate() - 6);
                dateFrom.value = toIso(from);
                dateTo.value = toIso(now);
            } else if (preset === '30d') {
                const from = new Date(now);
                from.setDate(from.getDate() - 29);
                dateFrom.value = toIso(from);
                dateTo.value = toIso(now);
            }
            renderOrders();
        };

        searchInput?.addEventListener('input', () => renderOrders());
        root.querySelectorAll('.tm-oh-status').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.getAttribute('data-status') || 'all';
                if (statusFilter) statusFilter.value = mode;
                root.querySelectorAll('.tm-oh-status').forEach((b) => {
                    b.classList.toggle('is-on', b === btn);
                });
                renderOrders();
            });
        });
        dateFrom?.addEventListener('change', () => {
            activePreset = '';
            root.querySelectorAll('a.tm-oh-preset').forEach((b) => b.classList.remove('is-active'));
            renderOrders();
        });
        dateTo?.addEventListener('change', () => {
            activePreset = '';
            root.querySelectorAll('a.tm-oh-preset').forEach((b) => b.classList.remove('is-active'));
            renderOrders();
        });
        root.querySelectorAll('.tm-oh-preset').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                applyPreset(btn.getAttribute('data-preset'));
            });
        });

        clickRoot.addEventListener('click', (e) => {
            const copyBtn = e.target.closest?.('.tm-copy-phone-btn');
            if (copyBtn) {
                e.stopPropagation();
                e.preventDefault();
                const phone = copyBtn.getAttribute('data-phone') || '';
                if (!phone) return;
                navigator.clipboard.writeText(phone).then(() => {
                    const prev = copyBtn.textContent;
                    copyBtn.textContent = '✓';
                    setTimeout(() => { copyBtn.textContent = prev; }, 1200);
                }).catch(() => {});
                return;
            }
            const thEl = e.target.closest?.('.rnr-orderlink[data-sort], th[data-sort]');
            if (thEl) {
                e.preventDefault();
                const key = thEl.getAttribute('data-sort');
                if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                else { sortKey = key; sortDir = key === 'timestamp' || key === 'date' ? 'desc' : 'asc'; }
                renderOrders();
                return;
            }
            const tr = e.target.closest?.('tbody tr[data-href], tbody td[data-href]');
            if (tr) {
                const url = tr.getAttribute('data-href') || tr.closest('tr')?.getAttribute('data-href');
                if (url) window.open(url, '_blank');
            }
        });

        syncBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            refreshFromServer({ silent: false }).catch(() => {});
        });

        exportBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            const rows = getFilteredOrders();
            const cols = historyColumns().filter((c) => c.kind === 'field' || c.kind === 'checkbox');
            const headers = [...cols.map((c) => c.label), 'url'];
            const lines = [headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',')];
            rows.forEach((o) => {
                const vals = [
                    ...cols.map((c) => ohResolveColumnValue(o, c.label)),
                    o.url || '',
                ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
                lines.push(vals.join(','));
            });
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `order-history-${ohPageKind()}-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
        });

        paintTable('', `<tr class="rnr-row style1"><td class="rnr-field-text"><span>${useDatabase ? 'Φόρτωση από server…' : 'Φόρτωση τοπικού ιστορικού…'}</span></td></tr>`);
        paintFromCacheThenRefresh();

        nativeHistorySession = { paintFromCacheThenRefresh, renderOrders };
    }

    /** @deprecated modal retired — opens native inline history on list pages */
    function showOrderHistoryModal() {
        enterNativeHistoryMode();
    }


    // Initialize monitoring when page loads
    function initOrderHistory() {
        // Always start background fetcher (runs on all pages)
        initOrderHistoryBackgroundFetcher();

        // Push local histories into the current store bucket (retry if store not ready yet)
        const tryMigrate = (attempt = 0) => {
            migrateLocalOrderHistoryOnce().then((res) => {
                if (res?.reason === 'no-store' && attempt < 8) {
                    setTimeout(() => tryMigrate(attempt + 1), 1500);
                }
            }).catch(() => {});
        };
        setTimeout(() => tryMigrate(0), 2000);

        // The rest of the logic only applies when we're actually on an orders list page
        if (!onOrdersPage) {
            return;
        }

        // Clean up any existing duplicates first (runs once on page load)
        removeDuplicatesFromHistory();
        
        // Monitor for order acceptance
        monitorOrderAcceptance();
        
        // Also extract orders on page load
        setTimeout(() => {
            const orders = extractOrderData();
            if (orders.length > 0) {
                saveOrdersToHistory(orders);
            }
        }, 1000);

        const mountNativeChrome = () => {
            ensureNativeToggleButton();
            try {
                const params = new URLSearchParams(location.search || '');
                if (params.get('tm_oh') === '1') enterNativeHistoryMode();
            } catch (_) { /* ignore */ }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(mountNativeChrome, 400));
        } else {
            setTimeout(mountNativeChrome, 400);
        }
        setTimeout(mountNativeChrome, 1200);
        setTimeout(mountNativeChrome, 2500);
    }

    /**
     * Orders for Advanced Search: prefer fresh server fetch, fall back to view cache / pending.
     * In local mode, uses only this PC's GM history.
     * @param {'service'|'parts'} kind
     */
    async function getOrderHistoryOrdersForSearch(kind) {
        const want = kind === 'parts' ? 'parts' : 'service';
        try { window.captureConnectedStoreFromPage?.(document); } catch (_) { /* ignore */ }
        const store = ohGetStoreName();
        const storeKey = ohStoreKey(store);

        let orders = [];
        let source = 'none';

        if (!ohUseDatabase()) {
            orders = ohLoadLocalHistory(want);
            if (orders.length) source = 'local';
            return {
                ok: true,
                kind: want,
                store,
                storeKey,
                source,
                orders: (orders || []).slice(),
            };
        }

        if (storeKey && !ohServerUnsupported) {
            try {
                const remote = await fetchStoreOrderHistoryFromServer(want);
                if (remote?.ok && Array.isArray(remote.orders)) {
                    orders = ohFilterOrdersByPageKind(remote.orders, want);
                    source = 'server';
                }
            } catch (err) {
                console.warn('[MMS Order History] search fetch failed', err);
            }
        }

        if (!orders.length && storeKey) {
            const cache = ohLoadViewCache(storeKey, want);
            if (cache?.orders?.length) {
                orders = ohFilterOrdersByPageKind(cache.orders, want);
                source = 'cache';
            }
        }

        if (!orders.length) {
            // Pending write-buffer + any leftover legacy GM rows
            const pending = ohLoadPendingBuffer().filter((o) => ohOrderKind(o) === want);
            let legacy = [];
            try {
                const key = want === 'parts' ? 'tm_partsorders_page_history' : 'tm_srvorders_page_history';
                const raw = JSON.parse(GM_getValue(key, '[]'));
                if (Array.isArray(raw)) legacy = raw.filter((o) => ohOrderKind(o, want) === want);
            } catch (_) { /* ignore */ }
            orders = [...pending, ...legacy];
            if (orders.length) source = 'local';
        }

        return {
            ok: true,
            kind: want,
            store,
            storeKey,
            source,
            orders: (orders || []).slice(),
        };
    }

    // Make functions globally accessible
    window.enterNativeHistoryMode = enterNativeHistoryMode;
    window.exitNativeHistoryMode = exitNativeHistoryMode;
    window.showOrderHistoryModal = showOrderHistoryModal; // compat → native mode
    window.initOrderHistory = initOrderHistory;
    window.getOrderHistoryOrdersForSearch = getOrderHistoryOrdersForSearch;
    window.seedOrderHistoryLocalFromCache = seedOrderHistoryLocalFromCache;
    window.ohUseDatabase = ohUseDatabase;
    window.syncOrderHistoryToServer = ({ force = true } = {}) => {
        if (!ohUseDatabase()) return { ok: false, reason: 'local-mode' };
        try {
            const pending = ohLoadPendingBuffer();
            const queued = queueOrdersForServerSync(pending, { force });
            scheduleOhSyncFlush(300);
            return { ok: true, queued };
        } catch (err) {
            return { ok: false, error: err };
        }
    };
    window.refreshOrderHistoryFromServer = fetchStoreOrderHistoryFromServer;
    window.migrateOrderHistoryToServer = (opts) => migrateLocalOrderHistoryOnce({ force: true, ...(opts || {}) });
    window.debugOrderHistorySync = async function debugOrderHistorySync() {
        try { window.captureConnectedStoreFromPage?.(document); } catch (_) { /* ignore */ }
        const store = ohGetStoreName();
        const storeKey = ohStoreKey(store);
        const pending = ohLoadPendingBuffer();
        let authOk = false;
        let authError = '';
        try {
            authOk = !!(await ohEnsureAuthToken());
        } catch (err) {
            authError = String(err?.message || err);
        }
        let remoteCount = null;
        if (authOk && storeKey) {
            const remote = await fetchStoreOrderHistoryFromServer('service');
            remoteCount = remote.ok ? remote.orders.length : `fail:${remote.reason || remote.status || 'err'}`;
        }
        const report = {
            store,
            storeKey,
            connected: GM_getValue('tm_connected_store_v1', ''),
            login: GM_getValue('tm_login_store_v1', ''),
            pending: pending.length,
            viewOrders: ohViewOrders.length,
            viewCapped: ohViewCapped,
            queue: ohSyncQueue.length,
            unsupported: ohServerUnsupported,
            authOk,
            authError,
            remoteServiceCount: remoteCount,
            lastSyncOk: GM_getValue('tm_oh_last_sync_ok_v1', ''),
            migrated: GM_getValue(OH_MIGRATED_KEY, ''),
            source: 'server',
        };
        console.log('[MMS Order History] debug', report);
        return report;
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOrderHistory);
    } else {
        initOrderHistory();
    }

})();

