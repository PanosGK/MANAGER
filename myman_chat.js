// ==UserScript==
// @name         MyManager Office Chat
// @namespace    http://tampermonkey.net/
// @version      1
// @description  PocketBase office chat panel for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const CHAT_ROOM = 'office';
    const CHAT_MAX_LEN = 500;
    const CHAT_SEND_COOLDOWN_MS = 1500;
    const CHAT_POLL_MS = 5000;
    const CHAT_PAGE_SIZE = 50;
    const CHAT_TOKEN_SKEW_MS = 60 * 1000;
    const OFFICE_CHAT_BASE_URL = 'https://mngerchat.littlejol.mywire.org';

    let chatPollTimer = null;
    let chatRealtimeEs = null;
    let chatRealtimeClientId = null;
    let chatLastSendAt = 0;
    let chatMessages = [];
    let chatUnread = 0;
    let chatMuted = false;
    let chatPanelOpen = false;
    let chatConnecting = false;
    let chatAuthToken = null;
    let chatAuthExpires = 0;
    let chatStatus = 'idle'; // idle | connecting | online | error | disabled
    let chatStatusDetail = '';
    let chatInitDone = false;
    let chatHydrated = false;

    function chatKeys(STORAGE_KEYS) {
        const k = STORAGE_KEYS || window.STORAGE_KEYS || {};
        return {
            enabled: k.CHAT_ENABLED || 'tm_chat_enabled',
            user: k.CHAT_USER || 'tm_chat_user',
            pass: k.CHAT_PASS || 'tm_chat_pass',
            tokenCache: k.CHAT_TOKEN_CACHE || 'tm_chat_token_cache',
            muted: k.CHAT_MUTED || 'tm_chat_muted',
        };
    }

    function formatPbError(body, fallback) {
        if (!body || typeof body !== 'object') return fallback;
        const parts = [];
        if (body.message) parts.push(String(body.message));
        const data = body.data;
        if (data && typeof data === 'object') {
            Object.keys(data).forEach((key) => {
                const item = data[key];
                const msg = item?.message || item?.code || (typeof item === 'string' ? item : '');
                if (msg) parts.push(`${key}: ${msg}`);
            });
        }
        return parts.filter(Boolean).join(' — ') || fallback;
    }

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getChatSettings(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        return {
            enabled: !!GM_getValue(keys.enabled, false),
            baseUrl: OFFICE_CHAT_BASE_URL,
            user: String(GM_getValue(keys.user, '') || '').trim(),
            pass: String(GM_getValue(keys.pass, '') || ''),
            muted: !!GM_getValue(keys.muted, false),
        };
    }

    function getLoginBlockDisplayName() {
        try {
            if (typeof window.MMS_PROFILES?.parseLoginBlockDisplayName === 'function') {
                const fromApi = window.MMS_PROFILES.parseLoginBlockDisplayName();
                if (fromApi) return String(fromApi).trim();
            }
        } catch (_) { /* ignore */ }
        // Inline fallback (same rules as myman_profiles.js)
        const loginBlock = document.getElementById('login_block1');
        if (!loginBlock) return '';
        const bold = loginBlock.querySelector('b');
        if (bold) {
            const name = String(bold.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
            if (name) return name;
        }
        const span = loginBlock.querySelector('span');
        if (span) {
            const text = String(span.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
            const match = text.match(/(?:είσοδος|εισοδος)\s+ως\s+(.+)/i);
            if (match?.[1]) return String(match[1]).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
        }
        return '';
    }

    function getDisplayName() {
        const fromLogin = getLoginBlockDisplayName();
        if (fromLogin) return fromLogin.slice(0, 64);
        const name = window.tmCurrentUser
            || window.config?.currentUser
            || '';
        return String(name || 'Τεχνικός').trim().slice(0, 64) || 'Τεχνικός';
    }

    function getProfileId() {
        try {
            if (typeof window.tmGetActiveProfileId === 'function') {
                return String(window.tmGetActiveProfileId() || '').slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        return '';
    }

    /** Rough Greek → Latin for email local-parts (Γκορόγιας → gkorogias). */
    function greekToLatinSlug(raw) {
        const map = {
            α: 'a', ά: 'a', Α: 'a', Ά: 'a',
            β: 'v', Β: 'v',
            γ: 'g', Γ: 'g',
            δ: 'd', Δ: 'd',
            ε: 'e', έ: 'e', Ε: 'e', Έ: 'e',
            ζ: 'z', Ζ: 'z',
            η: 'i', ή: 'i', Η: 'i', Ή: 'i',
            θ: 'th', Θ: 'th',
            ι: 'i', ί: 'i', ϊ: 'i', ΐ: 'i', Ι: 'i', Ί: 'i',
            κ: 'k', Κ: 'k',
            λ: 'l', Λ: 'l',
            μ: 'm', Μ: 'm',
            ν: 'n', Ν: 'n',
            ξ: 'x', Ξ: 'x',
            ο: 'o', ό: 'o', Ο: 'o', Ό: 'o',
            π: 'p', Π: 'p',
            ρ: 'r', Ρ: 'r',
            σ: 's', ς: 's', Σ: 's',
            τ: 't', Τ: 't',
            υ: 'y', ύ: 'y', ϋ: 'y', ΰ: 'y', Υ: 'y', Ύ: 'y',
            φ: 'f', Φ: 'f',
            χ: 'ch', Χ: 'ch',
            ψ: 'ps', Ψ: 'ps',
            ω: 'o', ώ: 'o', Ω: 'o', Ώ: 'o',
        };
        let s = String(raw || '');
        // digraphs first
        s = s
            .replace(/[Γγ][Κκ]/g, 'gk')
            .replace(/[Γγ][Γγ]/g, 'ng')
            .replace(/[Μμ][Ππ]/g, 'b')
            .replace(/[Νν][Ττ]/g, 'd')
            .replace(/[Ττ][Σσς]/g, 'ts')
            .replace(/[Ττ][Ζζ]/g, 'tz');
        let out = '';
        for (const ch of s) {
            if (map[ch]) out += map[ch];
            else out += ch;
        }
        return out
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 32);
    }

    /** Login name from #login_block1 (e.g. Γκορόγιας) → latin slug for email local-part. */
    function getLoginNameSlug() {
        const display = getDisplayName();
        let local = greekToLatinSlug(display);
        if (local.length < 2) {
            // Already-latin display / profile ids
            local = String(display || getProfileId() || '')
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '')
                .slice(0, 32);
        }
        if (local.length < 2) {
            local = `tech${Date.now().toString(36).slice(-6)}`;
        }
        return local;
    }

    /** Always derived from MyManager login name: Γκορόγιας → gkorogias@myman.chat */
    function suggestOfficeChatEmail() {
        return `${getLoginNameSlug()}@myman.chat`;
    }

    async function registerOfficeChatUser(STORAGE_KEYS, { email, password, passwordConfirm } = {}) {
        try {
            const baseUrl = OFFICE_CHAT_BASE_URL;
            const displayName = getDisplayName();
            const mail = suggestOfficeChatEmail();
            const pass = String(password || '');
            const pass2 = passwordConfirm != null ? String(passwordConfirm) : pass;

            if (!mail || !mail.includes('@')) {
                return { ok: false, message: 'Μη έγκυρο email από το όνομα login.' };
            }
            if (pass.length < 8) {
                return { ok: false, message: 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.' };
            }
            if (pass !== pass2) {
                return { ok: false, message: 'Οι κωδικοί δεν ταιριάζουν.' };
            }

            const url = `${baseUrl}/api/collections/users/records`;
            // Minimal payload — username/emailVisibility often break create on locked schemas
            const payload = {
                email: mail,
                password: pass,
                passwordConfirm: pass2,
            };
            if (displayName && displayName !== 'Τεχνικός') {
                payload.name = displayName;
            }

            let status;
            let body;
            try {
                ({ status, body } = await chatRequestJson({
                    method: 'POST',
                    url,
                    headers: { 'Content-Type': 'application/json' },
                    data: JSON.stringify(payload),
                    timeout: 12000,
                }));
            } catch (err) {
                return {
                    ok: false,
                    email: mail,
                    message: err?.message || 'Αποτυχία δικτύου κατά την εγγραφή',
                };
            }

            // Already registered → try login with this password
            if (status === 400 && /already|unique|exists|taken/i.test(JSON.stringify(body || {}))) {
                const keys = chatKeys(STORAGE_KEYS);
                GM_setValue(keys.user, mail);
                GM_setValue(keys.pass, pass);
                GM_setValue(keys.tokenCache, '');
                try {
                    await ensureAuth(STORAGE_KEYS, { force: true });
                    return { ok: true, email: mail, message: 'Ο λογαριασμός υπάρχει ήδη — σύνδεση OK.', existed: true };
                } catch (_) {
                    return {
                        ok: false,
                        email: mail,
                        message: 'Το email υπάρχει ήδη. Βάλε τον σωστό κωδικό και πάτα Έλεγχος σύνδεσης.',
                    };
                }
            }

            if (status < 200 || status >= 300) {
                let msg = formatPbError(body, `Εγγραφή απέτυχε (${status})`);
                if (/failed to create record/i.test(msg)) {
                    msg += ' — Admin → users → API Rules → Create: ξεκλείδωσε και βάλε @request.auth.id = "" · απενεργοποίησε email verification';
                }
                return { ok: false, email: mail, message: msg };
            }

            const keys = chatKeys(STORAGE_KEYS);
            GM_setValue(keys.user, mail);
            GM_setValue(keys.pass, pass);
            GM_setValue(keys.tokenCache, '');
            try {
                await ensureAuth(STORAGE_KEYS, { force: true });
            } catch (err) {
                return {
                    ok: true,
                    email: mail,
                    message: `Λογαριασμός OK, σύνδεση απέτυχε: ${err?.message || err}. Δοκίμασε Έλεγχος σύνδεσης.`,
                    authFailed: true,
                };
            }
            return { ok: true, email: mail, message: 'Λογαριασμός δημιουργήθηκε και συνδέθηκε.' };
        } catch (err) {
            return { ok: false, message: err?.message || 'Άγνωστο σφάλμα εγγραφής' };
        }
    }

    function getXhr() {
        if (typeof window.getScriptXhr === 'function') {
            const fn = window.getScriptXhr();
            if (fn) return fn;
        }
        if (typeof GM_xmlhttpRequest === 'function') return GM_xmlhttpRequest;
        if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') {
            return GM.xmlHttpRequest.bind(GM);
        }
        return null;
    }

    function chatRequest({ method, url, headers, data, timeout }) {
        const xhr = getXhr();
        if (!xhr) {
            return Promise.reject(new Error('GM_xmlhttpRequest unavailable — ενημέρωσε τον loader / δώσε δικαίωμα δικτύου'));
        }
        const ms = timeout || 15000;
        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (fn, arg) => {
                if (settled) return;
                settled = true;
                clearTimeout(watchdog);
                fn(arg);
            };
            // Hard watchdog: some TM builds never fire ontimeout when @connect blocks
            const watchdog = setTimeout(() => {
                finish(reject, new Error('Timeout — έλεγχος @connect / δικτύου προς mngerchat.littlejol.mywire.org'));
            }, ms + 2000);
            try {
                xhr({
                    method: method || 'GET',
                    url,
                    headers: headers || {},
                    data: data != null ? data : undefined,
                    timeout: ms,
                    anonymous: false,
                    onload(res) {
                        finish(resolve, res);
                    },
                    onerror() {
                        finish(reject, new Error('Network error προς chat server'));
                    },
                    ontimeout() {
                        finish(reject, new Error('Timeout προς chat server'));
                    },
                    onabort() {
                        finish(reject, new Error('Request aborted'));
                    },
                });
            } catch (err) {
                finish(reject, err instanceof Error ? err : new Error(String(err)));
            }
        });
    }

    async function chatRequestJson(opts) {
        const res = await chatRequest(opts);
        let body = null;
        try {
            body = res.responseText ? JSON.parse(res.responseText) : null;
        } catch (_) {
            body = null;
        }
        return { status: res.status, body, raw: res.responseText || '' };
    }

    function loadCachedToken(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        try {
            const raw = GM_getValue(keys.tokenCache, '');
            if (!raw) return null;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!parsed?.token) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    }

    function saveCachedToken(STORAGE_KEYS, token, expires) {
        const keys = chatKeys(STORAGE_KEYS);
        try {
            GM_setValue(keys.tokenCache, JSON.stringify({
                token,
                expires: Number(expires) || 0,
                savedAt: Date.now(),
            }));
        } catch (_) { /* ignore */ }
    }

    function clearCachedToken(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        try {
            GM_setValue(keys.tokenCache, '');
        } catch (_) { /* ignore */ }
        chatAuthToken = null;
        chatAuthExpires = 0;
    }

    function setChatStatus(status, detail) {
        chatStatus = status;
        chatStatusDetail = detail || '';
        updateChatStatusUi();
    }

    function updateChatStatusUi() {
        const el = document.getElementById('tm-chat-status');
        if (!el) return;
        const labels = {
            idle: 'Ανενεργό',
            connecting: 'Σύνδεση…',
            online: 'Online',
            error: 'Σφάλμα',
            disabled: 'Απενεργοποιημένο',
        };
        el.textContent = chatStatusDetail
            ? `${labels[chatStatus] || chatStatus}: ${chatStatusDetail}`
            : (labels[chatStatus] || chatStatus);
        el.dataset.status = chatStatus;
    }

    function updateUnreadBadge() {
        const btn = document.getElementById('tm-chat-toggle-btn');
        if (!btn) return;
        let badge = btn.querySelector('.tm-chat-unread');
        if (chatUnread > 0 && !chatPanelOpen) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tm-chat-unread';
                btn.appendChild(badge);
            }
            badge.textContent = chatUnread > 99 ? '99+' : String(chatUnread);
            badge.hidden = false;
        } else if (badge) {
            badge.hidden = true;
        }
    }

    function formatMsgTime(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return '';
            return d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
        } catch (_) {
            return '';
        }
    }

    function renderMessages() {
        const list = document.getElementById('tm-chat-messages');
        if (!list) return;
        const sorted = chatMessages.slice().sort((a, b) => {
            const ta = new Date(a.created || 0).getTime();
            const tb = new Date(b.created || 0).getTime();
            return ta - tb;
        });
        const me = getDisplayName();
        list.innerHTML = sorted.map((m) => {
            const mine = String(m.displayName || '') === me;
            return `<div class="tm-chat-msg${mine ? ' is-mine' : ''}" data-id="${escapeHtml(m.id)}">
                <div class="tm-chat-msg-meta">
                    <span class="tm-chat-msg-name">${escapeHtml(m.displayName || '?')}</span>
                    <span class="tm-chat-msg-time">${escapeHtml(formatMsgTime(m.created))}</span>
                </div>
                <div class="tm-chat-msg-text">${escapeHtml(m.text || '')}</div>
            </div>`;
        }).join('');
        list.scrollTop = list.scrollHeight;
    }

    function upsertMessages(records, { fromPollOrRealtime } = {}) {
        if (!Array.isArray(records) || !records.length) return;
        const byId = new Map(chatMessages.map((m) => [m.id, m]));
        let added = 0;
        records.forEach((rec) => {
            if (!rec?.id) return;
            if (String(rec.room || CHAT_ROOM) !== CHAT_ROOM) return;
            const prev = byId.get(rec.id);
            if (!prev) added += 1;
            byId.set(rec.id, {
                id: rec.id,
                text: rec.text,
                displayName: rec.displayName,
                profileId: rec.profileId || '',
                room: rec.room || CHAT_ROOM,
                created: rec.created,
            });
        });
        chatMessages = Array.from(byId.values());
        if (chatMessages.length > 200) {
            chatMessages = chatMessages
                .slice()
                .sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0))
                .slice(-200);
        }
        renderMessages();
        if (chatHydrated && fromPollOrRealtime && added > 0 && !chatPanelOpen) {
            chatUnread += added;
            updateUnreadBadge();
        }
    }

    async function ensureAuth(STORAGE_KEYS, { force } = {}) {
        const settings = getChatSettings(STORAGE_KEYS);
        if (!settings.user || !settings.pass) {
            throw new Error('Λείπουν χρήστης / κωδικός');
        }

        const now = Date.now();
        if (!force && chatAuthToken && chatAuthExpires > now + CHAT_TOKEN_SKEW_MS) {
            return chatAuthToken;
        }

        const cached = loadCachedToken(STORAGE_KEYS);
        if (!force && cached?.token && Number(cached.expires) > now + CHAT_TOKEN_SKEW_MS) {
            chatAuthToken = cached.token;
            chatAuthExpires = Number(cached.expires) || 0;
            return chatAuthToken;
        }

        const url = `${settings.baseUrl}/api/collections/users/auth-with-password`;
        const { status, body } = await chatRequestJson({
            method: 'POST',
            url,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                identity: settings.user,
                password: settings.pass,
            }),
        });

        if (status < 200 || status >= 300 || !body?.token) {
            clearCachedToken(STORAGE_KEYS);
            const msg = body?.message || `Auth failed (${status})`;
            throw new Error(msg);
        }

        chatAuthToken = body.token;
        // PocketBase tokens are JWTs; expire ~token.expires or ~14 days. Use record if present.
        const expSec = body.record?.tokenKey
            ? null
            : null;
        // Prefer JWT exp if we can decode; else 12h cache.
        let expires = now + 12 * 60 * 60 * 1000;
        try {
            const payload = JSON.parse(atob(String(body.token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload?.exp) expires = Number(payload.exp) * 1000;
        } catch (_) { /* ignore */ }
        void expSec;
        chatAuthExpires = expires;
        saveCachedToken(STORAGE_KEYS, chatAuthToken, expires);
        return chatAuthToken;
    }

    async function fetchMessages(STORAGE_KEYS) {
        const settings = getChatSettings(STORAGE_KEYS);
        const token = await ensureAuth(STORAGE_KEYS);
        const filter = encodeURIComponent(`room="${CHAT_ROOM}"`);
        const url = `${settings.baseUrl}/api/collections/messages/records?page=1&perPage=${CHAT_PAGE_SIZE}&sort=-created&filter=${filter}`;
        const { status, body } = await chatRequestJson({
            method: 'GET',
            url,
            headers: { Authorization: token },
        });
        if (status === 401) {
            clearCachedToken(STORAGE_KEYS);
            const token2 = await ensureAuth(STORAGE_KEYS, { force: true });
            const retry = await chatRequestJson({
                method: 'GET',
                url,
                headers: { Authorization: token2 },
            });
            if (retry.status < 200 || retry.status >= 300) {
                throw new Error(retry.body?.message || `Fetch failed (${retry.status})`);
            }
            upsertMessages(retry.body?.items || [], { fromPollOrRealtime: chatHydrated });
            chatHydrated = true;
            return;
        }
        if (status < 200 || status >= 300) {
            throw new Error(body?.message || `Fetch failed (${status})`);
        }
        upsertMessages(body?.items || [], { fromPollOrRealtime: chatHydrated });
        chatHydrated = true;
    }

    async function sendChatMessage(STORAGE_KEYS, text) {
        const clean = String(text || '').trim().slice(0, CHAT_MAX_LEN);
        if (!clean) return { ok: false, reason: 'empty' };
        const now = Date.now();
        if (now - chatLastSendAt < CHAT_SEND_COOLDOWN_MS) {
            return { ok: false, reason: 'rate' };
        }
        chatLastSendAt = now;

        const settings = getChatSettings(STORAGE_KEYS);
        const token = await ensureAuth(STORAGE_KEYS);
        const url = `${settings.baseUrl}/api/collections/messages/records`;
        const profileId = getProfileId();
        const payload = {
            text: clean,
            displayName: getDisplayName(),
            room: CHAT_ROOM,
        };
        if (profileId) payload.profileId = profileId;

        const postOnce = async (authHeader) => chatRequestJson({
            method: 'POST',
            url,
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(payload),
        });

        let { status, body } = await postOnce(token);
        // Some proxies/PB builds prefer Bearer
        if ((status === 401 || status === 403) && token && !String(token).startsWith('Bearer ')) {
            ({ status, body } = await postOnce(`Bearer ${token}`));
        }
        if (status === 401) {
            clearCachedToken(STORAGE_KEYS);
            const token2 = await ensureAuth(STORAGE_KEYS, { force: true });
            ({ status, body } = await postOnce(token2));
        }
        if (status < 200 || status >= 300) {
            let msg = formatPbError(body, `Send failed (${status})`);
            if (/failed to create record/i.test(msg) && !/text:|displayName|room|profileId/i.test(msg)) {
                msg += ' — PocketBase Admin → Collections → messages → API Rules: ξεκλείδωσε το Create (όχι Admins only) και βάλε ακριβώς: @request.auth.id != ""';
            }
            throw new Error(msg);
        }
        upsertMessages([body]);
        return { ok: true };
    }

    function stopRealtime() {
        if (chatRealtimeEs) {
            try { chatRealtimeEs.close(); } catch (_) { /* ignore */ }
            chatRealtimeEs = null;
        }
        chatRealtimeClientId = null;
    }

    function stopPolling() {
        if (chatPollTimer) {
            clearInterval(chatPollTimer);
            chatPollTimer = null;
        }
    }

    function startPolling(STORAGE_KEYS) {
        stopPolling();
        chatPollTimer = setInterval(() => {
            if (chatConnecting) return;
            fetchMessages(STORAGE_KEYS).catch(() => { /* keep polling */ });
        }, CHAT_POLL_MS);
    }

    async function tryStartRealtime(STORAGE_KEYS) {
        stopRealtime();
        const settings = getChatSettings(STORAGE_KEYS);
        if (!settings.baseUrl || typeof EventSource === 'undefined') {
            return false;
        }
        try {
            const token = await ensureAuth(STORAGE_KEYS);
            const es = new EventSource(`${settings.baseUrl}/api/realtime`);
            chatRealtimeEs = es;

            await new Promise((resolve, reject) => {
                const t = setTimeout(() => reject(new Error('realtime timeout')), 8000);
                es.addEventListener('PB_CONNECT', async (ev) => {
                    clearTimeout(t);
                    try {
                        const data = JSON.parse(ev.data || '{}');
                        chatRealtimeClientId = data.clientId;
                        const subUrl = `${settings.baseUrl}/api/realtime`;
                        const { status } = await chatRequestJson({
                            method: 'POST',
                            url: subUrl,
                            headers: {
                                Authorization: token,
                                'Content-Type': 'application/json',
                            },
                            data: JSON.stringify({
                                clientId: chatRealtimeClientId,
                                subscriptions: ['messages/*'],
                            }),
                        });
                        if (status < 200 || status >= 300) {
                            reject(new Error(`subscribe ${status}`));
                            return;
                        }
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
                es.onerror = () => {
                    clearTimeout(t);
                    reject(new Error('SSE error'));
                };
            });

            es.addEventListener('messages/*', (ev) => {
                try {
                    const data = JSON.parse(ev.data || '{}');
                    if (data?.record) {
                        upsertMessages([data.record], { fromPollOrRealtime: true });
                    }
                } catch (_) { /* ignore */ }
            });

            // Also listen without wildcard encoding variants
            es.onmessage = (ev) => {
                try {
                    const data = JSON.parse(ev.data || '{}');
                    if (data?.record) {
                        upsertMessages([data.record], { fromPollOrRealtime: true });
                    }
                } catch (_) { /* ignore */ }
            };

            return true;
        } catch (_) {
            stopRealtime();
            return false;
        }
    }

    async function connectChat(STORAGE_KEYS) {
        const settings = getChatSettings(STORAGE_KEYS);
        if (!settings.enabled) {
            setChatStatus('disabled');
            return { ok: false, reason: 'disabled' };
        }
        if (!settings.user || !settings.pass) {
            setChatStatus('error', 'Ρυθμίστε λογαριασμό chat');
            return { ok: false, reason: 'config' };
        }
        if (chatConnecting) return { ok: false, reason: 'busy' };
        chatConnecting = true;
        setChatStatus('connecting');
        try {
            await ensureAuth(STORAGE_KEYS, { force: true });
            await fetchMessages(STORAGE_KEYS);
            const realtimeOk = await tryStartRealtime(STORAGE_KEYS);
            startPolling(STORAGE_KEYS); // always poll as safety net
            setChatStatus('online', realtimeOk ? 'realtime+poll' : 'poll');
            return { ok: true, realtime: realtimeOk };
        } catch (err) {
            setChatStatus('error', err?.message || 'Σύνδεση απέτυχε');
            return { ok: false, reason: 'error', error: err };
        } finally {
            chatConnecting = false;
        }
    }

    async function testChatConnection(STORAGE_KEYS) {
        const settings = getChatSettings(STORAGE_KEYS);
        if (!settings.user || !settings.pass) {
            return { ok: false, message: 'Συμπληρώστε χρήστη και κωδικό.' };
        }
        try {
            clearCachedToken(STORAGE_KEYS);
            await ensureAuth(STORAGE_KEYS, { force: true });
            await fetchMessages(STORAGE_KEYS);
            return { ok: true, message: 'Σύνδεση OK — το chat είναι έτοιμο.' };
        } catch (err) {
            return { ok: false, message: err?.message || 'Αποτυχία σύνδεσης' };
        }
    }

    function injectChatStyles() {
        if (document.getElementById('tm-chat-styles')) return;
        const style = document.createElement('style');
        style.id = 'tm-chat-styles';
        style.textContent = `
            #tm-chat-toggle-btn { position: relative; background-color: var(--tm-info-color, #0d6efd); }
            #tm-chat-toggle-btn:hover { background-color: var(--tm-info-hover, #0b5ed7); }
            #tm-chat-toggle-btn .tm-chat-unread {
                position: absolute; top: -6px; right: -6px;
                min-width: 18px; height: 18px; padding: 0 5px;
                border-radius: 999px; background: #dc3545; color: #fff;
                font-size: 10px; font-weight: 700; line-height: 18px; text-align: center;
            }
            #tm-chat-panel {
                position: fixed; bottom: 60px; right: 20px; z-index: 9997;
                width: 340px; height: 420px; max-height: calc(100vh - 80px);
                display: none; flex-direction: column;
                background: #fff; border: 1px solid #ccc; border-radius: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.18); overflow: hidden;
                font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            }
            #tm-chat-panel.is-open { display: flex; }
            #tm-chat-header {
                display: flex; align-items: center; gap: 8px;
                padding: 8px 10px; background: #e9ecef; border-bottom: 1px solid #ccc;
                user-select: none;
            }
            #tm-chat-title { font-weight: 700; font-size: 13px; color: #333; flex: 1; }
            #tm-chat-header button {
                background: none; border: none; cursor: pointer; color: #555;
                font-size: 14px; padding: 2px 6px; border-radius: 4px;
            }
            #tm-chat-header button:hover { background: #d4d9de; color: #000; }
            #tm-chat-header button.is-muted { color: #dc3545; }
            #tm-chat-status {
                font-size: 11px; padding: 4px 10px; color: #6c757d;
                border-bottom: 1px solid #eee; background: #f8f9fa;
            }
            #tm-chat-status[data-status="online"] { color: #198754; }
            #tm-chat-status[data-status="error"] { color: #dc3545; }
            #tm-chat-status[data-status="connecting"] { color: #0d6efd; }
            #tm-chat-messages {
                flex: 1; overflow-y: auto; padding: 10px; display: flex;
                flex-direction: column; gap: 8px; background: #fafbfc;
            }
            .tm-chat-msg {
                max-width: 92%; align-self: flex-start;
                background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
                padding: 6px 8px;
            }
            .tm-chat-msg.is-mine {
                align-self: flex-end; background: #e7f1ff; border-color: #cfe2ff;
            }
            .tm-chat-msg-meta {
                display: flex; justify-content: space-between; gap: 8px;
                font-size: 10px; color: #6c757d; margin-bottom: 2px;
            }
            .tm-chat-msg-name { font-weight: 700; color: #495057; }
            .tm-chat-msg-text {
                font-size: 13px; color: #212529; white-space: pre-wrap; word-break: break-word;
            }
            #tm-chat-composer {
                display: flex; gap: 6px; padding: 8px; border-top: 1px solid #ccc; background: #fff;
            }
            #tm-chat-input {
                flex: 1; resize: none; min-height: 38px; max-height: 80px;
                border: 1px solid #ccc; border-radius: 8px; padding: 6px 8px;
                font-size: 13px; font-family: inherit;
            }
            #tm-chat-send {
                border: none; border-radius: 8px; padding: 0 14px;
                background: var(--tm-primary-color, #0d6efd); color: #fff;
                font-weight: 700; cursor: pointer;
            }
            #tm-chat-send:hover { filter: brightness(0.95); }
            #tm-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        `;
        document.head.appendChild(style);
    }

    function ensureRightSideContainer() {
        let rightSideContainer = document.getElementById('tm-search-container');
        if (!rightSideContainer) {
            rightSideContainer = document.createElement('div');
            rightSideContainer.id = 'tm-search-container';
            document.body.appendChild(rightSideContainer);
        }
        return rightSideContainer;
    }

    function openChatPanel(STORAGE_KEYS) {
        const panel = document.getElementById('tm-chat-panel');
        if (!panel) return;
        panel.classList.add('is-open');
        chatPanelOpen = true;
        chatUnread = 0;
        updateUnreadBadge();
        renderMessages();
        document.getElementById('tm-chat-input')?.focus();
        if (chatStatus !== 'online' && chatStatus !== 'connecting') {
            connectChat(STORAGE_KEYS);
        }
    }

    function closeChatPanel() {
        const panel = document.getElementById('tm-chat-panel');
        if (!panel) return;
        panel.classList.remove('is-open');
        chatPanelOpen = false;
        updateUnreadBadge();
    }

    function toggleChatPanel(STORAGE_KEYS) {
        if (chatPanelOpen) closeChatPanel();
        else openChatPanel(STORAGE_KEYS);
    }

    function wireComposer(STORAGE_KEYS) {
        const input = document.getElementById('tm-chat-input');
        const sendBtn = document.getElementById('tm-chat-send');
        if (!input || !sendBtn) return;

        const doSend = async () => {
            const text = input.value;
            if (!String(text || '').trim()) return;
            sendBtn.disabled = true;
            try {
                const result = await sendChatMessage(STORAGE_KEYS, text);
                if (result.ok) {
                    input.value = '';
                } else if (result.reason === 'rate') {
                    setChatStatus('online', 'Περίμενε λίγο…');
                    setTimeout(() => setChatStatus('online'), 1200);
                }
            } catch (err) {
                setChatStatus('error', err?.message || 'Αποστολή απέτυχε');
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        };

        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            doSend();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doSend();
            }
        });
    }

    function initOfficeChatFeature(config, STORAGE_KEYS) {
        if (chatInitDone) return;

        const settings = getChatSettings(STORAGE_KEYS);
        const enabled = settings.enabled === true || config?.officeChatEnabled === true;
        if (!enabled) return;

        chatInitDone = true;
        chatMuted = settings.muted;
        injectChatStyles();

        const right = ensureRightSideContainer();
        let toggleButton = document.getElementById('tm-chat-toggle-btn');
        if (toggleButton && (toggleButton.getAttribute('data-tm-ui-shell') === '1'
            || (typeof window.tmIsUiShellEl === 'function' && window.tmIsUiShellEl(toggleButton)))) {
            toggleButton.remove();
            toggleButton = null;
        }
        if (!toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.id = 'tm-chat-toggle-btn';
            toggleButton.className = 'tm-slide-out-btn';
            toggleButton.type = 'button';
            toggleButton.textContent = '💬 Chat';
            right.appendChild(toggleButton);
        }
        toggleButton.addEventListener('click', () => toggleChatPanel(STORAGE_KEYS));

        if (!document.getElementById('tm-chat-panel')) {
            const panel = document.createElement('div');
            panel.id = 'tm-chat-panel';
            panel.innerHTML = `
                <div id="tm-chat-header">
                    <span id="tm-chat-title">Office Chat</span>
                    <button type="button" id="tm-chat-mute-btn" title="Σίγαση">🔔</button>
                    <button type="button" id="tm-chat-refresh-btn" title="Ανανέωση">↻</button>
                    <button type="button" id="tm-chat-close-btn" title="Κλείσιμο">&times;</button>
                </div>
                <div id="tm-chat-status">Ανενεργό</div>
                <div id="tm-chat-messages"></div>
                <div id="tm-chat-composer">
                    <textarea id="tm-chat-input" maxlength="${CHAT_MAX_LEN}" placeholder="Μήνυμα… (Enter αποστολή)" rows="2"></textarea>
                    <button type="button" id="tm-chat-send">Αποστολή</button>
                </div>
            `;
            document.body.appendChild(panel);

            panel.querySelector('#tm-chat-close-btn')?.addEventListener('click', closeChatPanel);
            panel.querySelector('#tm-chat-refresh-btn')?.addEventListener('click', () => {
                connectChat(STORAGE_KEYS);
            });
            const muteBtn = panel.querySelector('#tm-chat-mute-btn');
            if (muteBtn) {
                const syncMute = () => {
                    muteBtn.textContent = chatMuted ? '🔕' : '🔔';
                    muteBtn.classList.toggle('is-muted', chatMuted);
                    muteBtn.title = chatMuted ? 'Άρση σίγασης' : 'Σίγαση';
                };
                syncMute();
                muteBtn.addEventListener('click', () => {
                    chatMuted = !chatMuted;
                    const keys = chatKeys(STORAGE_KEYS);
                    GM_setValue(keys.muted, chatMuted);
                    syncMute();
                });
            }
            wireComposer(STORAGE_KEYS);
        }

        // Background connect so unread works with panel closed
        connectChat(STORAGE_KEYS);
    }

    window.initOfficeChatFeature = initOfficeChatFeature;
    window.testOfficeChatConnection = testChatConnection;
    window.connectOfficeChat = connectChat;
    window.getOfficeChatSettings = getChatSettings;
    window.suggestOfficeChatEmail = suggestOfficeChatEmail;
    window.registerOfficeChatUser = registerOfficeChatUser;
})();
