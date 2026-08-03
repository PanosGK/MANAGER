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
    const CHAT_FILE_MAX_BYTES = 5 * 1024 * 1024;
    const CHAT_FILE_ACCEPT = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const CHAT_FILE_EXT_RE = /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?)$/i;
    const OFFICE_CHAT_BASE_URL = 'https://mngerchat.littlejol.mywire.org';
    /** Salt for silent per-login passwords (office chat only — not high security). */
    const OFFICE_CHAT_PASS_SECRET = 'myman-office-chat-v1';

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
    let chatStorageKeys = null;
    const chatNotifiedIds = new Set();
    /** Once PB rejects unknown `store` field, stop sending it until reload. */
    let chatStoreFieldUnsupported = false;
    /** Once PB rejects unknown `attachment` field, stop uploading until reload. */
    let chatAttachmentFieldUnsupported = false;
    /** Pending File selected in composer (cleared after successful send). */
    let chatPendingFile = null;
    /** Last rendered message snapshot — skip identical redraws (stops poll flicker). */
    let chatMessagesRenderKey = '';

    const CHAT_EMOJI_LIST = [
        '😀','😁','😂','🤣','😊','😍','😘','😎','🤔','😅',
        '😢','😭','😡','👍','👎','👏','🙏','🔥','✨','💯',
        '❤️','💙','💚','💛','🧡','💜','🖤','🤍','💪','👌',
        '✌️','🤝','👋','🙌','🎉','🎊','✅','❌','⚠️','📌',
        '⏰','☕','🍕','🍺','🏠','🚗','💼','📱','💻','📦',
        '🧾','🛠️','🛒','🏪','📞','💬','👀','🫡','😴','🤢'
    ];


    function chatKeys(STORAGE_KEYS) {
        const k = STORAGE_KEYS || window.STORAGE_KEYS || {};
        return {
            enabled: k.CHAT_ENABLED || 'tm_chat_enabled',
            user: k.CHAT_USER || 'tm_chat_user',
            pass: k.CHAT_PASS || 'tm_chat_pass',
            tokenCache: k.CHAT_TOKEN_CACHE || 'tm_chat_token_cache',
            muted: k.CHAT_MUTED || 'tm_chat_muted',
            geometry: k.CHAT_GEOMETRY || 'tm_chat_geometry',
            store: k.CHAT_STORE || 'tm_chat_store',
            storeManual: k.CHAT_STORE_MANUAL || 'tm_chat_store_manual',
        };
    }

    /** Deterministic password from login email — same on every PC, never shown to user. */
    function getOfficeChatAutoPassword(email) {
        const input = `${OFFICE_CHAT_PASS_SECRET}|${String(email || '').toLowerCase()}`;
        let h = 5381;
        for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
        let h2 = 0;
        for (let i = 0; i < input.length; i++) h2 = (h2 * 33 + input.charCodeAt(i)) >>> 0;
        return `Mm${Math.abs(h).toString(36)}${h2.toString(36)}9x`.slice(0, 28);
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

    /** Turn http(s)/www URLs into safe clickable links; everything else stays escaped. */
    function formatChatMessageHtml(text) {
        const raw = String(text || '');
        if (!raw) return '';
        const urlRe = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
        let out = '';
        let last = 0;
        let match;
        while ((match = urlRe.exec(raw)) !== null) {
            out += escapeHtml(raw.slice(last, match.index));
            let url = match[0];
            let trailing = '';
            while (/[).,;:!?\]]$/.test(url)) {
                trailing = url.slice(-1) + trailing;
                url = url.slice(0, -1);
            }
            const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
            out += `<a class="tm-chat-msg-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
            last = match.index + match[0].length;
        }
        out += escapeHtml(raw.slice(last));
        return out;
    }

    function formatChatFileSize(bytes) {
        const n = Number(bytes) || 0;
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    }

    function isChatImageFileName(name) {
        return /\.(jpe?g|png|webp|gif)$/i.test(String(name || ''));
    }

    function isAllowedChatFile(file) {
        if (!file) return { ok: false, reason: 'empty' };
        if (file.size > CHAT_FILE_MAX_BYTES) {
            return { ok: false, reason: 'size', message: `Μέγιστο μέγεθος ${formatChatFileSize(CHAT_FILE_MAX_BYTES)}` };
        }
        const type = String(file.type || '').toLowerCase();
        const name = String(file.name || '');
        const mimeOk = type && CHAT_FILE_ACCEPT.includes(type);
        const extOk = CHAT_FILE_EXT_RE.test(name);
        if (!mimeOk && !extOk) {
            return { ok: false, reason: 'type', message: 'Επιτρέπονται εικόνες, PDF, Word, Excel' };
        }
        return { ok: true };
    }

    /** Ensure File has a real MIME type — PocketBase MIME allow-lists reject empty/octet-stream. */
    function normalizeChatUploadFile(file) {
        if (!file) return null;
        const existing = String(file.type || '').toLowerCase();
        if (existing && existing !== 'application/octet-stream') return file;
        const name = String(file.name || 'file');
        const ext = (name.split('.').pop() || '').toLowerCase();
        const byExt = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        const mime = byExt[ext] || existing || 'application/octet-stream';
        try {
            return new File([file], name, { type: mime, lastModified: file.lastModified || Date.now() });
        } catch (_) {
            return file;
        }
    }

    function normalizeChatAttachmentName(rec) {
        const a = rec?.attachment;
        if (Array.isArray(a)) return String(a[0] || '').trim();
        return String(a || '').trim();
    }

    function chatMessagePreviewText(m) {
        const t = String(m?.text || '').trim();
        if (t && t !== '(αρχείο)') return t.slice(0, 80);
        if (m?.attachment) {
            return isChatImageFileName(m.attachment) ? '📷 εικόνα' : '📎 αρχείο';
        }
        return t.slice(0, 80);
    }

    function getChatFileUrl(recordId, filename, { thumb } = {}) {
        if (!recordId || !filename) return '';
        const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
        let url = `${base}/api/files/messages/${encodeURIComponent(recordId)}/${encodeURIComponent(filename)}`;
        const params = [];
        if (thumb) params.push(`thumb=${encodeURIComponent(thumb)}`);
        const token = chatAuthToken;
        if (token) params.push(`token=${encodeURIComponent(token)}`);
        if (params.length) url += `?${params.join('&')}`;
        return url;
    }

    function formatChatAttachmentHtml(m) {
        const filename = normalizeChatAttachmentName(m) || String(m?.attachment || '').trim();
        if (!filename) {
            const rawText = String(m?.text || '').trim();
            if (rawText === '(αρχείο)' || /^📎\s/.test(rawText)) {
                return `<div class="tm-chat-msg-file is-missing">
                    <span class="tm-chat-msg-file-icon" aria-hidden="true">📎</span>
                    <span class="tm-chat-msg-file-meta">
                        <span class="tm-chat-msg-file-name">${escapeHtml(rawText === '(αρχείο)' ? 'Αρχείο' : rawText.replace(/^📎\s*/, ''))}</span>
                        <span class="tm-chat-msg-file-hint">Δεν αποθηκεύτηκε στο server</span>
                    </span>
                </div>`;
            }
            return '';
        }
        const fullUrl = getChatFileUrl(m.id, filename);
        if (isChatImageFileName(filename)) {
            const thumbUrl = getChatFileUrl(m.id, filename, { thumb: '300x300' }) || fullUrl;
            return `<a class="tm-chat-msg-image-link" href="${escapeHtml(fullUrl)}" target="_blank" rel="noopener noreferrer" data-chat-file="${escapeHtml(filename)}" data-chat-record="${escapeHtml(m.id)}">
                <img class="tm-chat-msg-image" src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(filename)}" loading="lazy">
            </a>`;
        }
        return `<a class="tm-chat-msg-file" href="${escapeHtml(fullUrl)}" target="_blank" rel="noopener noreferrer" data-chat-file="${escapeHtml(filename)}" data-chat-record="${escapeHtml(m.id)}">
            <span class="tm-chat-msg-file-icon" aria-hidden="true">📎</span>
            <span class="tm-chat-msg-file-meta">
                <span class="tm-chat-msg-file-name">${escapeHtml(filename)}</span>
                <span class="tm-chat-msg-file-hint">Άνοιγμα / λήψη</span>
            </span>
        </a>`;
    }

    function getChatSettings(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        const mail = suggestOfficeChatEmail();
        const pass = getOfficeChatAutoPassword(mail);
        // Default ON — techs should not need Settings for chat
        const enabledRaw = GM_getValue(keys.enabled, true);
        return {
            enabled: enabledRaw !== false,
            baseUrl: OFFICE_CHAT_BASE_URL,
            user: mail,
            pass,
            muted: !!GM_getValue(keys.muted, false),
        };
    }

    function extractLoginDisplayName(raw) {
        const text = String(raw || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) return '';
        const match = text.match(/(?:είσοδος|εισοδος)\s+ως\s+(.+)/i);
        if (match?.[1]) return String(match[1]).trim();
        return text;
    }

    function getLoginBlockDisplayName() {
        try {
            if (typeof window.MMS_PROFILES?.parseLoginBlockDisplayName === 'function') {
                const fromApi = window.MMS_PROFILES.parseLoginBlockDisplayName();
                const cleaned = extractLoginDisplayName(fromApi);
                if (cleaned) return cleaned;
            }
        } catch (_) { /* ignore */ }
        const roots = [
            document.getElementById('login_block1'),
            document.querySelector('.rnr-b-loggedas'),
        ].filter(Boolean);
        for (const root of roots) {
            const bold = root.querySelector('b');
            if (bold) {
                const name = extractLoginDisplayName(bold.textContent);
                if (name) return name;
            }
            const span = root.querySelector('span');
            if (span) {
                const name = extractLoginDisplayName(span.textContent);
                if (name) return name;
            }
            const whole = extractLoginDisplayName(root.textContent);
            if (whole && !/^(είσοδος|εισοδος)/i.test(whole)) return whole;
        }
        try {
            const label = window.MMS_PROFILES?.getActiveProfileLabel?.();
            const cleaned = extractLoginDisplayName(label);
            if (cleaned && cleaned !== '_unknown') return cleaned;
        } catch (_) { /* ignore */ }
        return '';
    }

    function getDisplayName() {
        const fromLogin = getLoginBlockDisplayName();
        if (fromLogin) return fromLogin.slice(0, 64);
        const name = window.tmCurrentUser
            || window.config?.currentUser
            || window.config?.profileLabel
            || '';
        const cleaned = extractLoginDisplayName(name);
        if (cleaned) return cleaned.slice(0, 64);
        return 'Τεχνικός';
    }

    /** Store chosen on MyManager login (global tm_login_store_v1) or live #iProfileID. */
    function detectLoginStoreName() {
        // 1) Global key written by loader on login.php (survives profile scoping)
        try {
            const fromLogin = String(GM_getValue('tm_login_store_v1', '') || '').trim();
            if (fromLogin) return fromLogin.slice(0, 64);
        } catch (_) { /* ignore */ }
        try {
            const sel = document.querySelector('#iProfileID, select[name="iProfileID"]');
            if (sel && sel.selectedIndex >= 0) {
                const name = String(sel.options[sel.selectedIndex].text || '')
                    .replace(/\u00a0/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                if (name && !/^(select|επιλέξ|επιλεξ|choose|—|-|κατάστημα)$/i.test(name)) {
                    return name.slice(0, 64);
                }
            }
        } catch (_) { /* ignore */ }
        try {
            if (typeof window.detectAndCacheCurrentStoreName === 'function') {
                const detected = String(window.detectAndCacheCurrentStoreName(document) || '').trim();
                if (detected) return detected.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            const cached = String(GM_getValue('tm_phone_my_store_name_v1', '') || '').trim();
            if (cached) return cached.slice(0, 64);
        } catch (_) { /* ignore */ }
        return '';
    }

    function isChatStoreAutoLocked(STORAGE_KEYS) {
        // Auto from login → lock dropdown. Only editable when login store missing.
        return !!detectLoginStoreName();
    }

    function isChatStoreManual(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        try {
            return !!GM_getValue(keys.storeManual, false);
        } catch (_) {
            return false;
        }
    }

    function getChatStoreName(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        const loginStore = detectLoginStoreName();
        // Login / auto store always wins (and UI is locked)
        if (loginStore) return loginStore;

        let saved = '';
        try {
            saved = String(GM_getValue(keys.store, '') || '').trim();
        } catch (_) { /* ignore */ }
        if (isChatStoreManual(STORAGE_KEYS) && saved) return saved.slice(0, 64);
        if (saved) return saved.slice(0, 64);

        try {
            if (typeof window.getUserStorePick === 'function') {
                const pick = String(window.getUserStorePick() || '').trim();
                if (pick) return pick.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        return '';
    }

    function setChatStoreName(STORAGE_KEYS, name, { manual = true } = {}) {
        const keys = chatKeys(STORAGE_KEYS);
        const clean = String(name || '').trim().slice(0, 64);
        // Never clear/overwrite the global login capture from chat UI
        if (manual && detectLoginStoreName()) {
            return detectLoginStoreName();
        }
        try {
            GM_setValue(keys.store, clean);
            GM_setValue(keys.storeManual, !!(manual && clean));
        } catch (_) { /* ignore */ }
        try {
            if (typeof window.setUserStorePick === 'function') {
                window.setUserStorePick(clean);
            }
        } catch (_) { /* ignore */ }
        return clean;
    }

    function getChatStoreOptions(STORAGE_KEYS) {
        let options = [];
        try {
            if (typeof window.getStorePickerOptions === 'function') {
                options = window.getStorePickerOptions() || [];
            }
        } catch (_) { /* ignore */ }
        if (!Array.isArray(options) || !options.length) {
            options = [
                'ΕΡΥΘΡΑΙΑ (ΕΕ)',
                'ΣΥΝΤΑΓΜΑ SERVICE (ΕΕ)',
                'ΣΥΝΤΑΓΜΑ (ΕΕ)',
                'ΧΟΛΑΡΓΟΣ (ΙΚΕ)',
                'ATHENS MALL (ΙΚΕ)',
                'ΚΕΝΤΡΙΚΗ ΑΠΟΘΗΚΗ (ΙΚΕ)',
                'ΚΟΛΩΝΑΚΙ (ΕΕ)',
                'ΓΛΥΦΑΔΑ (ΙΚΕ)',
                'ΠΕΙΡΑΙΑΣ (ΙΚΕ)',
                'ΒΡΙΛΗΣΣΙΑ (IKE)',
                'ΚΟΡΥΔΑΛΛΟΣ (ΕΕ)',
                'ΚΗΦΙΣΙΑ (ΕΕ)',
                'ΕΛΛΗΝΙΚΟ (ΙΚΕ)',
                'ΑΓ.ΠΑΡΑΣΚΕΥΗ (ΕΕ)',
                'ΧΑΛΑΝΔΡΙ (IKE)',
            ];
        }
        const loginStore = detectLoginStoreName();
        const current = getChatStoreName(STORAGE_KEYS);
        [loginStore, current].forEach((name) => {
            if (name && !options.some((o) => String(o) === name)) {
                options = [name, ...options];
            }
        });
        return options.map((o) => String(o || '').trim()).filter(Boolean);
    }

    function refreshChatStoreSelect(STORAGE_KEYS) {
        const select = document.getElementById('tm-chat-store-select');
        if (!select) return;
        const loginStore = detectLoginStoreName();
        const locked = !!loginStore;
        if (loginStore) {
            setChatStoreName(STORAGE_KEYS, loginStore, { manual: false });
        }
        const current = getChatStoreName(STORAGE_KEYS);
        const options = getChatStoreOptions(STORAGE_KEYS);
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = locked
            ? '— Από login —'
            : '— Επίλεξε κατάστημα —';
        select.appendChild(placeholder);
        options.forEach((name) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            if (name === current) opt.selected = true;
            select.appendChild(opt);
        });
        if (current) select.value = current;
        select.disabled = locked;
        select.classList.toggle('is-locked', locked);
        const row = document.getElementById('tm-chat-store-row');
        if (row) row.classList.toggle('is-locked', locked);
        let lockHint = document.getElementById('tm-chat-store-lock');
        if (locked) {
            if (!lockHint && row) {
                lockHint = document.createElement('span');
                lockHint.id = 'tm-chat-store-lock';
                lockHint.textContent = '🔒';
                lockHint.title = 'Κλειδωμένο από το login';
                row.appendChild(lockHint);
            }
            if (lockHint) lockHint.hidden = false;
        } else if (lockHint) {
            lockHint.hidden = true;
        }
        select.title = locked
            ? 'Κλειδωμένο από το κατάστημα του MyManager login'
            : 'Επίλεξε κατάστημα (δεν βρέθηκε αυτόματα από το login)';
    }

    function wireChatStoreSelect(STORAGE_KEYS) {
        const select = document.getElementById('tm-chat-store-select');
        if (!select || select.dataset.tmChatStoreWired === '1') return;
        select.dataset.tmChatStoreWired = '1';
        select.addEventListener('change', () => {
            if (isChatStoreAutoLocked(STORAGE_KEYS)) {
                refreshChatStoreSelect(STORAGE_KEYS);
                return;
            }
            if (!select.value) {
                setChatStoreName(STORAGE_KEYS, '', { manual: false });
            } else {
                setChatStoreName(STORAGE_KEYS, select.value, { manual: true });
            }
            refreshChatStoreSelect(STORAGE_KEYS);
        });
        select.addEventListener('mousedown', (e) => e.stopPropagation());
        refreshChatStoreSelect(STORAGE_KEYS);
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

    async function authWithPassword(STORAGE_KEYS, email, password) {
        const baseUrl = OFFICE_CHAT_BASE_URL;
        const url = `${baseUrl}/api/collections/users/auth-with-password`;
        const { status, body } = await chatRequestJson({
            method: 'POST',
            url,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ identity: email, password }),
            timeout: 12000,
        });
        if (status < 200 || status >= 300 || !body?.token) {
            const msg = body?.message || `Auth failed (${status})`;
            throw new Error(msg);
        }
        const now = Date.now();
        let expires = now + 12 * 60 * 60 * 1000;
        try {
            const payload = JSON.parse(atob(String(body.token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload?.exp) expires = Number(payload.exp) * 1000;
        } catch (_) { /* ignore */ }
        chatAuthToken = body.token;
        chatAuthExpires = expires;
        saveCachedToken(STORAGE_KEYS, chatAuthToken, expires);
        return body;
    }

    /** Move old manual passwords onto the silent auto password (multi-PC). */
    async function migrateToAutoPassword(STORAGE_KEYS, recordId, oldPassword, newPassword) {
        if (!recordId || !oldPassword || !newPassword || oldPassword === newPassword) return false;
        const token = chatAuthToken;
        if (!token) return false;
        const url = `${OFFICE_CHAT_BASE_URL}/api/collections/users/records/${encodeURIComponent(recordId)}`;
        try {
            const { status } = await chatRequestJson({
                method: 'PATCH',
                url,
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify({
                    oldPassword,
                    password: newPassword,
                    passwordConfirm: newPassword,
                }),
                timeout: 12000,
            });
            return status >= 200 && status < 300;
        } catch (_) {
            return false;
        }
    }

    async function ensureOfficeChatAccount(STORAGE_KEYS) {
        const keys = chatKeys(STORAGE_KEYS);
        const mail = suggestOfficeChatEmail();
        const autoPass = getOfficeChatAutoPassword(mail);
        const legacyPass = String(GM_getValue(keys.pass, '') || '');
        if (!mail || !autoPass) {
            return { ok: false, message: 'Δεν βρέθηκε όνομα login MyManager.' };
        }
        GM_setValue(keys.user, mail);

        const tryLogin = async (pass) => {
            clearCachedToken(STORAGE_KEYS);
            GM_setValue(keys.pass, pass);
            return authWithPassword(STORAGE_KEYS, mail, pass);
        };

        // 1) Silent auto password
        try {
            await tryLogin(autoPass);
            return { ok: true, email: mail, message: 'Συνδεδεμένο' };
        } catch (_) { /* next */ }

        // 2) Legacy manual password from Settings (migrate → auto)
        if (legacyPass && legacyPass !== autoPass && legacyPass.length >= 8) {
            try {
                const body = await tryLogin(legacyPass);
                const recordId = body?.record?.id;
                const migrated = await migrateToAutoPassword(STORAGE_KEYS, recordId, legacyPass, autoPass);
                if (migrated) {
                    clearCachedToken(STORAGE_KEYS);
                    await tryLogin(autoPass);
                    return { ok: true, email: mail, message: 'Συνδεδεμένο (αυτόματος κωδικός)', migrated: true };
                }
                // Keep working with legacy if migrate blocked
                return { ok: true, email: mail, message: 'Συνδεδεμένο', legacy: true };
            } catch (_) { /* register next */ }
        }

        // 3) Silent register
        GM_setValue(keys.pass, autoPass);
        const created = await registerOfficeChatUser(STORAGE_KEYS, {
            email: mail,
            password: autoPass,
            passwordConfirm: autoPass,
        });
        if (created.ok) return created;

        // 4) Race: someone else just created it
        try {
            await tryLogin(autoPass);
            return { ok: true, email: mail, message: 'Συνδεδεμένο', existed: true };
        } catch (_) {
            return created;
        }
    }

    async function registerOfficeChatUser(STORAGE_KEYS, { email, password, passwordConfirm } = {}) {
        try {
            const baseUrl = OFFICE_CHAT_BASE_URL;
            const mail = String(email || suggestOfficeChatEmail()).trim().toLowerCase() || suggestOfficeChatEmail();
            const pass = String(password || getOfficeChatAutoPassword(mail));
            const pass2 = passwordConfirm != null ? String(passwordConfirm) : pass;
            const local = mail.split('@')[0] || 'tech';

            if (!mail || !mail.includes('@')) {
                return { ok: false, message: 'Μη έγκυρο email από το όνομα login.' };
            }
            if (pass.length < 8) {
                return { ok: false, message: 'Αυτόματος κωδικός μη έγκυρος.' };
            }

            const url = `${baseUrl}/api/collections/users/records`;
            // Minimal payload only — do NOT send Greek `name` (custom field patterns often reject it).
            // Chat display name comes from MyManager login on each message, not from PB profile.
            const payload = {
                email: mail,
                password: pass,
                passwordConfirm: pass2,
                username: local,
            };

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

            // Retry without username if that field is locked / unused on this PB schema
            if (status >= 400 && body?.data?.username) {
                const payload2 = {
                    email: mail,
                    password: pass,
                    passwordConfirm: pass2,
                };
                try {
                    ({ status, body } = await chatRequestJson({
                        method: 'POST',
                        url,
                        headers: { 'Content-Type': 'application/json' },
                        data: JSON.stringify(payload2),
                        timeout: 12000,
                    }));
                } catch (err) {
                    return {
                        ok: false,
                        email: mail,
                        message: err?.message || 'Αποτυχία δικτύου κατά την εγγραφή',
                    };
                }
            }

            const bodyJson = JSON.stringify(body || {});
            if (status === 400 && /already|unique|exists|taken|validation_not_unique/i.test(bodyJson)) {
                const keys = chatKeys(STORAGE_KEYS);
                GM_setValue(keys.user, mail);
                GM_setValue(keys.pass, pass);
                GM_setValue(keys.tokenCache, '');
                try {
                    await ensureAuth(STORAGE_KEYS, { force: true });
                    return { ok: true, email: mail, message: 'Συνδεδεμένο', existed: true };
                } catch (_) {
                    return {
                        ok: false,
                        email: mail,
                        message: `Ο λογαριασμός ${mail} υπάρχει με άλλον κωδικό. PocketBase Admin → users → διέγραψέ τον και ξαναδοκίμασε.`,
                    };
                }
            }

            if (status < 200 || status >= 300) {
                let msg = formatPbError(body, `Εγγραφή απέτυχε (${status})`);
                // Always append raw field errors so Admin mismatches are visible
                if (body?.data && typeof body.data === 'object') {
                    const fields = Object.keys(body.data).map((k) => {
                        const d = body.data[k];
                        return `${k}:${d?.code || d?.message || JSON.stringify(d)}`;
                    }).join(' · ');
                    if (fields && !msg.includes(fields)) msg += ` [${fields}]`;
                }
                if (/failed to create record/i.test(msg) && !body?.data) {
                    msg += ` — email δοκιμής: ${mail}. Admin → Logs · ή διέγραψε παλιό user με αυτό το email. Create rule κενό ή @request.auth.id = "" · verification OFF.`;
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
                    message: `Λογαριασμός OK, σύνδεση απέτυχε: ${err?.message || err}`,
                    authFailed: true,
                };
            }
            return { ok: true, email: mail, message: 'Έτοιμο' };
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

    function chatRequest({ method, url, headers, data, timeout, responseType, fetch: useFetch }) {
        const xhr = getXhr();
        if (!xhr) {
            return Promise.reject(new Error('GM_xmlhttpRequest unavailable — ενημέρωσε τον loader / δώσε δικαίωμα δικτύου'));
        }
        const ms = timeout || 15000;
        const hdrs = { ...(headers || {}) };
        const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
        if (isForm) {
            delete hdrs['Content-Type'];
            delete hdrs['content-type'];
        }
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
                const opts = {
                    method: method || 'GET',
                    url,
                    headers: hdrs,
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
                };
                if (responseType) opts.responseType = responseType;
                // Tampermonkey: FormData/multipart is unreliable unless fetch mode is on
                if (useFetch || isForm) opts.fetch = true;
                xhr(opts);
            } catch (err) {
                finish(reject, err instanceof Error ? err : new Error(String(err)));
            }
        });
    }

    async function chatRequestJson(opts) {
        const res = await chatRequest(opts);
        let body = null;
        const rawText = res.responseText != null
            ? String(res.responseText)
            : (typeof res.response === 'string' ? res.response : '');
        try {
            body = rawText ? JSON.parse(rawText) : null;
        } catch (_) {
            body = null;
        }
        return { status: res.status, body, raw: rawText || '' };
    }

    /** Build multipart body manually — fallback when FormData+fetch fails. */
    async function buildChatMultipartBody(fields, file, fileFieldName) {
        const fieldName = fileFieldName || 'attachment';
        const boundary = `----tmChat${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        const encoder = new TextEncoder();
        const parts = [];

        const pushBytes = (bytes) => {
            parts.push(bytes instanceof Uint8Array ? bytes : encoder.encode(String(bytes)));
        };
        const pushLine = (text) => pushBytes(encoder.encode(text));

        Object.keys(fields).forEach((key) => {
            const value = fields[key];
            if (value == null) return;
            pushLine(`--${boundary}\r\n`);
            pushLine(`Content-Disposition: form-data; name="${key}"\r\n\r\n`);
            pushLine(`${String(value)}\r\n`);
        });

        if (file) {
            const filename = String(file.name || 'file').replace(/[\r\n"]/g, '_');
            const mime = String(file.type || 'application/octet-stream');
            pushLine(`--${boundary}\r\n`);
            pushLine(`Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`);
            pushLine(`Content-Type: ${mime}\r\n\r\n`);
            const buf = file instanceof Blob
                ? new Uint8Array(await file.arrayBuffer())
                : encoder.encode('');
            pushBytes(buf);
            pushLine(`\r\n`);
        }

        pushLine(`--${boundary}--\r\n`);

        let total = 0;
        parts.forEach((p) => { total += p.length; });
        const body = new Uint8Array(total);
        let offset = 0;
        parts.forEach((p) => {
            body.set(p, offset);
            offset += p.length;
        });

        return {
            data: new Blob([body], { type: `multipart/form-data; boundary=${boundary}` }),
            contentType: `multipart/form-data; boundary=${boundary}`,
        };
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
        const nextDetail = detail || '';
        if (chatStatus === status && chatStatusDetail === nextDetail) return;
        chatStatus = status;
        chatStatusDetail = nextDetail;
        updateChatStatusUi();
    }

    function updateChatStatusUi() {
        const el = document.getElementById('tm-chat-status');
        const liveDot = document.getElementById('tm-chat-live-dot');
        if (liveDot) liveDot.dataset.status = chatStatus;
        if (!el) return;
        const labels = {
            idle: 'Ανενεργό',
            connecting: 'Σύνδεση…',
            online: 'Online',
            error: 'Σφάλμα',
            disabled: 'Απενεργοποιημένο',
        };
        const label = labels[chatStatus] || chatStatus;
        // Keep message area tall: only show status banner when not healthy
        const showBanner = chatStatus === 'error' || chatStatus === 'connecting' || chatStatus === 'disabled'
            || (chatStatus === 'online' && !!chatStatusDetail && !/^(realtime|poll)/i.test(chatStatusDetail));
        el.classList.toggle('is-visible', showBanner);
        el.innerHTML = `<span class="tm-chat-status-dot" aria-hidden="true"></span>`
            + `<span class="tm-chat-status-text">${escapeHtml(chatStatusDetail ? `${label}: ${chatStatusDetail}` : label)}</span>`;
        el.dataset.status = chatStatus;
    }

    function chatAvatarLetter(name) {
        const s = String(name || '?').trim();
        return (s[0] || '?').toUpperCase();
    }

    function chatMessagesFingerprint(list) {
        return (list || [])
            .slice()
            .sort((a, b) => {
                const ta = new Date(a.created || 0).getTime();
                const tb = new Date(b.created || 0).getTime();
                if (ta !== tb) return ta - tb;
                return String(a.id || '').localeCompare(String(b.id || ''));
            })
            .map((m) => [
                m.id,
                m.text || '',
                m.displayName || '',
                m.store || '',
                m.attachment || '',
                m.created || '',
            ].join('\u0001'))
            .join('\u0002');
    }

    function isChatMessagesNearBottom(list) {
        if (!list) return true;
        const gap = list.scrollHeight - list.scrollTop - list.clientHeight;
        return gap < 80;
    }

    function renderMessages({ force, newIds } = {}) {
        const list = document.getElementById('tm-chat-messages');
        if (!list) return;
        const sorted = chatMessages.slice().sort((a, b) => {
            const ta = new Date(a.created || 0).getTime();
            const tb = new Date(b.created || 0).getTime();
            return ta - tb;
        });
        const nextKey = chatMessagesFingerprint(sorted);
        if (!force && nextKey === chatMessagesRenderKey && list.childElementCount > 0) {
            return;
        }
        const stickToBottom = force || isChatMessagesNearBottom(list) || !chatMessagesRenderKey;
        const newIdSet = new Set((newIds || []).map(String));
        chatMessagesRenderKey = nextKey;

        const me = getDisplayName();
        if (!sorted.length) {
            list.innerHTML = `<div class="tm-chat-empty">
                <div class="tm-chat-empty-icon">💬</div>
                <div class="tm-chat-empty-title">Δεν υπάρχουν μηνύματα ακόμα</div>
                <div class="tm-chat-empty-sub">Γράψε κάτι για να ξεκινήσει η συζήτηση</div>
            </div>`;
            return;
        }
        const prevScrollTop = list.scrollTop;
        list.innerHTML = sorted.map((m) => {
            const mine = String(m.displayName || '') === me;
            const isNew = newIdSet.has(String(m.id));
            const storeHtml = m.store
                ? `<span class="tm-chat-msg-store">${escapeHtml(m.store)}</span>`
                : '';
            const name = m.displayName || '?';
            const rawText = String(m.text || '').trim();
            const hasAttach = !!normalizeChatAttachmentName(m);
            const isFilePlaceholder = rawText === '(αρχείο)' || (!hasAttach && /^📎\s/.test(rawText));
            const showText = rawText && !isFilePlaceholder && !(hasAttach && (rawText === '(αρχείο)' || rawText === normalizeChatAttachmentName(m)));
            const textHtml = showText ? formatChatMessageHtml(rawText) : '';
            const attachHtml = formatChatAttachmentHtml(m);
            const bodyHtml = [attachHtml, textHtml].filter(Boolean).join('')
                || (isFilePlaceholder ? '' : escapeHtml(rawText));
            return `<div class="tm-chat-msg${mine ? ' is-mine' : ''}${isNew ? ' is-new' : ''}" data-id="${escapeHtml(m.id)}">
                <div class="tm-chat-msg-avatar" aria-hidden="true">${escapeHtml(chatAvatarLetter(name))}</div>
                <div class="tm-chat-msg-bubble">
                    <div class="tm-chat-msg-meta">
                        <span class="tm-chat-msg-who">
                            <span class="tm-chat-msg-name">${escapeHtml(name)}</span>
                            ${storeHtml}
                        </span>
                        <span class="tm-chat-msg-time">${escapeHtml(formatMsgTime(m.created))}</span>
                    </div>
                    <div class="tm-chat-msg-text">${bodyHtml}</div>
                </div>
            </div>`;
        }).join('');
        if (stickToBottom) list.scrollTop = list.scrollHeight;
        else list.scrollTop = prevScrollTop;
    }

    function updateUnreadBadge() {
        const btn = document.getElementById('tm-chat-toggle-btn');
        if (!btn) return;
        let badge = btn.querySelector('.tm-chat-unread');
        const show = chatUnread > 0 && !chatPanelOpen;
        if (show) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tm-chat-unread';
                btn.appendChild(badge);
            }
            badge.textContent = chatUnread > 99 ? '99+' : String(chatUnread);
            badge.hidden = false;
            btn.setAttribute('aria-label', `Office Chat, ${chatUnread} νέα μηνύματα`);
            btn.title = `Office Chat — ${chatUnread} νέα`;
        } else if (badge) {
            badge.hidden = true;
            btn.setAttribute('aria-label', 'Office Chat');
            btn.title = 'Office Chat';
        }
        btn.classList.toggle('tm-chat-has-unread', show && !chatMuted);
        if (!show) btn.classList.remove('tm-chat-ping');
    }

    function isOwnChatMessage(msg) {
        const me = getDisplayName();
        const meProfile = getProfileId();
        if (meProfile && msg?.profileId && String(msg.profileId) === String(meProfile)) return true;
        if (me && String(msg?.displayName || '') === me) return true;
        return false;
    }

    /** Footer-button reminder only — never desktop / notification-center alerts. */
    function notifyNewChatMessages(newMessages) {
        if (chatMuted || !Array.isArray(newMessages) || !newMessages.length) return;
        if (chatPanelOpen && !document.hidden) return;

        const incoming = newMessages.filter((m) => {
            if (!m?.id || isOwnChatMessage(m)) return false;
            if (chatNotifiedIds.has(m.id)) return false;
            return true;
        });
        if (!incoming.length) return;

        incoming.forEach((m) => {
            chatNotifiedIds.add(m.id);
            if (chatNotifiedIds.size > 300) {
                const drop = [...chatNotifiedIds].slice(0, chatNotifiedIds.size - 200);
                drop.forEach((id) => chatNotifiedIds.delete(id));
            }
        });

        const btn = document.getElementById('tm-chat-toggle-btn');
        if (!btn) return;
        const latest = incoming[incoming.length - 1];
        const storeBit = latest.store ? ` · ${latest.store}` : '';
        const preview = incoming.length === 1
            ? `${latest.displayName || 'Chat'}${storeBit}: ${chatMessagePreviewText(latest)}`
            : `${incoming.length} νέα μηνύματα`;
        btn.title = `Office Chat — ${preview}`;
        btn.classList.add('tm-chat-has-unread', 'tm-chat-ping');
        window.clearTimeout(notifyNewChatMessages._pingTimer);
        notifyNewChatMessages._pingTimer = window.setTimeout(() => {
            btn.classList.remove('tm-chat-ping');
        }, 2400);
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

    function upsertMessages(records, { fromPollOrRealtime } = {}) {
        if (!Array.isArray(records) || !records.length) return;
        const byId = new Map(chatMessages.map((m) => [m.id, m]));
        let added = 0;
        let changed = false;
        const newlyAdded = [];
        records.forEach((rec) => {
            if (!rec?.id) return;
            if (String(rec.room || CHAT_ROOM) !== CHAT_ROOM) return;
            const prev = byId.get(rec.id);
            const mapped = {
                id: rec.id,
                text: rec.text,
                displayName: rec.displayName,
                store: String(rec.store || '').trim(),
                profileId: rec.profileId || '',
                room: rec.room || CHAT_ROOM,
                created: rec.created,
                attachment: normalizeChatAttachmentName(rec),
            };
            if (!prev) {
                added += 1;
                changed = true;
                newlyAdded.push(mapped);
            } else if (
                String(prev.text || '') !== String(mapped.text || '')
                || String(prev.displayName || '') !== String(mapped.displayName || '')
                || String(prev.store || '') !== String(mapped.store || '')
                || String(prev.attachment || '') !== String(mapped.attachment || '')
                || String(prev.created || '') !== String(mapped.created || '')
            ) {
                changed = true;
            }
            byId.set(rec.id, mapped);
        });
        chatMessages = Array.from(byId.values());
        if (chatMessages.length > 200) {
            chatMessages = chatMessages
                .slice()
                .sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0))
                .slice(-200);
            changed = true;
        }
        if (changed) {
            renderMessages({ newIds: newlyAdded.map((m) => m.id) });
        }
        if (chatHydrated && fromPollOrRealtime && added > 0) {
            if (!chatPanelOpen) {
                chatUnread += added;
                updateUnreadBadge();
            }
            notifyNewChatMessages(newlyAdded);
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

    async function sendChatMessage(STORAGE_KEYS, text, file) {
        const clean = String(text || '').trim().slice(0, CHAT_MAX_LEN);
        let attachFile = file ? normalizeChatUploadFile(file) : null;
        if (!clean && !attachFile) return { ok: false, reason: 'empty' };
        if (attachFile) {
            if (chatAttachmentFieldUnsupported) {
                setChatStatus('error', 'Πρόσθεσε πεδίο attachment στο messages (PocketBase)');
                return { ok: false, reason: 'unsupported' };
            }
            const check = isAllowedChatFile(attachFile);
            if (!check.ok) {
                setChatStatus('error', check.message || 'Μη έγκυρο αρχείο');
                return { ok: false, reason: check.reason || 'file' };
            }
        }
        const now = Date.now();
        if (now - chatLastSendAt < CHAT_SEND_COOLDOWN_MS) {
            return { ok: false, reason: 'rate' };
        }
        chatLastSendAt = now;

        const settings = getChatSettings(STORAGE_KEYS);
        let authHeader = await ensureAuth(STORAGE_KEYS);
        const baseUrl = String(settings.baseUrl || '').replace(/\/$/, '');
        const collectionUrl = `${baseUrl}/api/collections/messages/records`;
        const profileId = getProfileId();
        const storeName = getChatStoreName(STORAGE_KEYS);
        const displayName = getDisplayName();

        const buildFields = (textValue, includeStore) => {
            const fields = {
                text: textValue,
                displayName,
                room: CHAT_ROOM,
            };
            if (profileId) fields.profileId = profileId;
            if (includeStore && storeName && !chatStoreFieldUnsupported) fields.store = storeName;
            return fields;
        };

        const withAuthRetry = async (run) => {
            let result = await run(authHeader);
            if ((result.status === 401 || result.status === 403) && authHeader && !String(authHeader).startsWith('Bearer ')) {
                result = await run(`Bearer ${authHeader}`);
            }
            if (result.status === 401) {
                clearCachedToken(STORAGE_KEYS);
                authHeader = await ensureAuth(STORAGE_KEYS, { force: true });
                result = await run(authHeader);
            }
            return result;
        };

        const postJson = async (fields) => withAuthRetry((header) => chatRequestJson({
            method: 'POST',
            url: collectionUrl,
            headers: {
                Authorization: header,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(fields),
        }));

        const sendMultipart = async (method, targetUrl, fields, filePart) => {
            let formFail = null;
            if (typeof FormData !== 'undefined') {
                const fd = new FormData();
                Object.keys(fields || {}).forEach((key) => {
                    if (fields[key] == null) return;
                    fd.append(key, String(fields[key]));
                });
                if (filePart) fd.append('attachment', filePart, filePart.name || 'file');
                const viaForm = await withAuthRetry((header) => chatRequestJson({
                    method,
                    url: targetUrl,
                    headers: { Authorization: header },
                    data: fd,
                    timeout: 60000,
                    fetch: true,
                }));
                if (viaForm.status >= 200 && viaForm.status < 300) return viaForm;
                formFail = viaForm;
            }

            const built = await buildChatMultipartBody(fields || {}, filePart || null, 'attachment');
            const viaManual = await withAuthRetry((header) => chatRequestJson({
                method,
                url: targetUrl,
                headers: {
                    Authorization: header,
                    'Content-Type': built.contentType,
                },
                data: built.data,
                timeout: 60000,
                fetch: true,
            }));
            if (viaManual.status >= 200 && viaManual.status < 300) return viaManual;
            return formFail || viaManual;
        };

        let textValue = clean;
        if (!textValue && attachFile) {
            textValue = `📎 ${attachFile.name || 'αρχείο'}`.slice(0, CHAT_MAX_LEN);
        }
        let includeStore = true;
        let fields = buildFields(textValue, includeStore);

        let { status, body, raw } = await postJson(fields);
        const errBlob = () => `${JSON.stringify(body || {})}\n${raw || ''}`;

        if (status >= 400 && storeName && !chatStoreFieldUnsupported && /store/i.test(errBlob())) {
            chatStoreFieldUnsupported = true;
            includeStore = false;
            fields = buildFields(textValue, includeStore);
            ({ status, body, raw } = await postJson(fields));
            if (status >= 400 && /store/i.test(errBlob())) {
                setChatStatus('error', 'Πρόσθεσε πεδίο store στο messages (PocketBase)');
            }
        }

        if (status >= 400 && attachFile && !clean && /text/i.test(errBlob())) {
            textValue = '(αρχείο)';
            fields = buildFields(textValue, includeStore);
            ({ status, body, raw } = await postJson(fields));
        }

        if (status < 200 || status >= 300) {
            let msg = formatPbError(body, `Send failed (${status || 0})`);
            if (!body && raw) msg = `${msg} — ${String(raw).slice(0, 160)}`;
            if (/failed to create record/i.test(msg) && !/text:|displayName|room|profileId|store|attachment/i.test(msg)) {
                msg += ' — PocketBase Admin → Collections → messages → API Rules: ξεκλείδωσε το Create';
            }
            throw new Error(msg);
        }

        let saved = body && typeof body === 'object' ? { ...body } : body;
        if (saved && storeName && !saved.store) saved.store = storeName;

        if (attachFile && saved && saved.id) {
            const patchUrl = `${collectionUrl}/${encodeURIComponent(saved.id)}`;
            let patched = await sendMultipart('PATCH', patchUrl, {}, attachFile);
            const patchBlob = () => `${JSON.stringify(patched.body || {})}\n${patched.raw || ''}`;

            if (patched.status >= 200 && patched.status < 300 && patched.body) {
                saved = { ...saved, ...patched.body };
            } else {
                // Update may be locked — try one-shot multipart create
                const created = await sendMultipart('POST', collectionUrl, fields, attachFile);
                if (created.status >= 200 && created.status < 300 && normalizeChatAttachmentName(created.body)) {
                    saved = { ...created.body };
                    if (storeName && !saved.store) saved.store = storeName;
                } else if ((patched.status >= 400 && /attachment/i.test(patchBlob()))
                    || (created.status >= 400 && /attachment/i.test(`${JSON.stringify(created.body || {})}\n${created.raw || ''}`))) {
                    chatAttachmentFieldUnsupported = true;
                    upsertMessages([saved]);
                    setChatStatus('error', 'Πρόσθεσε πεδίο attachment στο messages (PocketBase)');
                    return { ok: false, reason: 'unsupported' };
                } else {
                    upsertMessages([saved]);
                    const hint = /403|superuser|update/i.test(patchBlob())
                        ? 'PocketBase messages → API Rules → Update: βάλε @request.auth.id != ""'
                        : formatPbError(patched.body || created.body, 'Το αρχείο δεν αποθηκεύτηκε');
                    setChatStatus('error', hint);
                    return { ok: false, reason: 'upload' };
                }
            }

            if (!normalizeChatAttachmentName(saved)) {
                upsertMessages([saved]);
                setChatStatus('error', 'Το αρχείο δεν αποθηκεύτηκε — έλεγξε Update rule / πεδίο attachment');
                return { ok: false, reason: 'upload' };
            }
        }

        upsertMessages([saved]);
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
        if (chatConnecting) return { ok: false, reason: 'busy' };
        chatConnecting = true;
        setChatStatus('connecting', 'αυτόματη σύνδεση…');
        try {
            const ensured = await ensureOfficeChatAccount(STORAGE_KEYS);
            if (!ensured.ok) {
                setChatStatus('error', ensured.message || 'Εγγραφή/σύνδεση απέτυχε');
                return { ok: false, reason: 'account', error: ensured };
            }
            await fetchMessages(STORAGE_KEYS);
            const realtimeOk = await tryStartRealtime(STORAGE_KEYS);
            startPolling(STORAGE_KEYS);
            setChatStatus('online');
            return { ok: true, realtime: realtimeOk };
        } catch (err) {
            setChatStatus('error', err?.message || 'Σύνδεση απέτυχε');
            return { ok: false, reason: 'error', error: err };
        } finally {
            chatConnecting = false;
        }
    }

    async function testChatConnection(STORAGE_KEYS) {
        try {
            const ensured = await ensureOfficeChatAccount(STORAGE_KEYS);
            if (!ensured.ok) return ensured;
            await fetchMessages(STORAGE_KEYS);
            return { ok: true, message: `OK — ${ensured.email || suggestOfficeChatEmail()}` };
        } catch (err) {
            return { ok: false, message: err?.message || 'Αποτυχία σύνδεσης' };
        }
    }

    function injectChatStyles() {
        const existing = document.getElementById('tm-chat-styles');
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.id = 'tm-chat-styles';
        style.textContent = `
            #tm-chat-toggle-btn {
                position: relative;
                overflow: visible;
            }
            #tm-chat-toggle-btn .tm-chat-unread {
                position: absolute; top: -6px; right: -6px;
                min-width: 18px; height: 18px; padding: 0 5px;
                border-radius: 999px; background: #ef4444; color: #fff;
                font-size: 10px; font-weight: 700; line-height: 18px; text-align: center;
                box-shadow: 0 0 0 2px #fff;
                pointer-events: none;
            }
            #tm-chat-toggle-btn.tm-chat-has-unread {
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.55);
                animation: tm-chat-unread-glow 1.6s ease-in-out infinite;
            }
            #tm-chat-toggle-btn.tm-chat-ping {
                animation: tm-chat-unread-ping 0.7s ease-out 0s 3;
            }
            @keyframes tm-chat-unread-glow {
                0%, 100% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35); }
                50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.75); }
            }
            @keyframes tm-chat-unread-ping {
                0% { transform: scale(1); }
                40% { transform: scale(1.08); }
                100% { transform: scale(1); }
            }
            #tm-chat-panel {
                --tm-chat-accent: var(--tm-primary-color, #2563eb);
                --tm-chat-surface: #ffffff;
                --tm-chat-bg: #f1f5f9;
                --tm-chat-ink: #0f172a;
                --tm-chat-muted: #64748b;
                --tm-chat-line: #e2e8f0;
                position: fixed; bottom: 52px; right: 12px; z-index: 9997;
                width: min(400px, calc(100vw - 16px));
                height: min(92vh, calc(100vh - 56px));
                display: none; flex-direction: column;
                background: var(--tm-chat-surface);
                border: 1px solid var(--tm-chat-line);
                border-radius: 14px;
                box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.06);
                overflow: hidden;
                font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
                color: var(--tm-chat-ink);
                min-width: 280px;
                min-height: 300px;
                max-width: calc(100vw - 8px);
                max-height: calc(100vh - 8px);
            }
            #tm-chat-panel.is-open { display: flex; }
            #tm-chat-panel.is-dragging,
            #tm-chat-panel.is-resizing {
                opacity: 0.97;
                box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
            }
            #tm-chat-panel.is-resizing { user-select: none; cursor: nwse-resize; }
            #tm-chat-composer-wrap {
                position: relative;
                z-index: 1;
                border-top: 1px solid var(--tm-chat-line);
                background: #fff;
                padding: 6px 22px 10px 8px;
                flex-shrink: 0;
            }
            #tm-chat-resize {
                position: absolute;
                right: 0; bottom: 0;
                width: 28px; height: 28px;
                cursor: nwse-resize;
                z-index: 30;
                touch-action: none;
                background:
                    linear-gradient(135deg, transparent 46%, #94a3b8 46%, #94a3b8 52%, transparent 52%),
                    linear-gradient(135deg, transparent 60%, #94a3b8 60%, #94a3b8 66%, transparent 66%),
                    linear-gradient(135deg, transparent 74%, #94a3b8 74%, #94a3b8 80%, transparent 80%);
                background-repeat: no-repeat;
                background-position: right 5px bottom 5px;
                background-size: 14px 14px;
                border-radius: 0 0 12px 0;
            }
            #tm-chat-resize:hover,
            #tm-chat-panel.is-resizing #tm-chat-resize {
                background-color: color-mix(in srgb, var(--tm-chat-accent, #2563eb) 12%, transparent);
            }
            #tm-chat-resize::before { display: none; }
            #tm-chat-header {
                display: flex; align-items: center; gap: 6px;
                padding: 6px 8px;
                flex-shrink: 0;
                background: #f8fafc;
                border-bottom: 1px solid var(--tm-chat-line);
                user-select: none; cursor: move;
            }
            .tm-chat-header-brand {
                display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; cursor: move;
            }
            .tm-chat-header-icon {
                width: 24px; height: 24px; border-radius: 8px;
                display: grid; place-items: center;
                background: color-mix(in srgb, var(--tm-chat-accent) 14%, #fff);
                color: var(--tm-chat-accent);
                font-size: 13px; flex-shrink: 0;
            }
            #tm-chat-title-wrap {
                min-width: 0; display: flex; align-items: center; gap: 6px;
            }
            #tm-chat-title {
                display: block; font-weight: 700; font-size: 13px;
                color: var(--tm-chat-ink); line-height: 1.2;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            #tm-chat-subtitle { display: none; }
            .tm-chat-header-actions { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
            #tm-chat-header button {
                background: transparent; border: none; cursor: pointer;
                color: var(--tm-chat-muted);
                width: 28px; height: 28px; border-radius: 8px;
                font-size: 14px; line-height: 1;
                display: grid; place-items: center;
                transition: background 0.15s ease, color 0.15s ease;
            }
            #tm-chat-header button:hover {
                background: #e2e8f0; color: var(--tm-chat-ink);
            }
            #tm-chat-header button.is-muted { color: #ef4444; }
            /* Status: hidden when healthy — frees a full row for messages */
            #tm-chat-status {
                display: none; align-items: center; gap: 6px;
                font-size: 11px; padding: 4px 10px;
                color: var(--tm-chat-muted);
                border-bottom: 1px solid var(--tm-chat-line);
                background: #fff7ed;
                flex-shrink: 0;
            }
            #tm-chat-status.is-visible { display: flex; }
            .tm-chat-status-dot {
                width: 7px; height: 7px; border-radius: 50%;
                background: #94a3b8; flex-shrink: 0;
            }
            #tm-chat-header .tm-chat-live-dot {
                width: 7px; height: 7px; border-radius: 50%;
                background: #94a3b8; flex-shrink: 0;
            }
            #tm-chat-header .tm-chat-live-dot[data-status="online"] {
                background: #22c55e; box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
            }
            #tm-chat-header .tm-chat-live-dot[data-status="error"] { background: #ef4444; }
            #tm-chat-header .tm-chat-live-dot[data-status="connecting"] {
                background: #3b82f6;
                animation: tm-chat-pulse-dot 1s ease-in-out infinite;
            }
            #tm-chat-status[data-status="online"] { color: #15803d; background: #f0fdf4; }
            #tm-chat-status[data-status="online"] .tm-chat-status-dot {
                background: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
            }
            #tm-chat-status[data-status="error"] { color: #dc2626; background: #fef2f2; }
            #tm-chat-status[data-status="error"] .tm-chat-status-dot { background: #ef4444; }
            #tm-chat-status[data-status="connecting"] { color: #2563eb; background: #eff6ff; }
            #tm-chat-status[data-status="connecting"] .tm-chat-status-dot {
                background: #3b82f6;
                animation: tm-chat-pulse-dot 1s ease-in-out infinite;
            }
            @keyframes tm-chat-pulse-dot {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.45; transform: scale(0.85); }
            }
            #tm-chat-store-row {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 8px; border-bottom: 1px solid var(--tm-chat-line);
                background: #fff; flex-shrink: 0;
            }
            #tm-chat-store-row.is-locked { background: #f8fafc; }
            #tm-chat-store-row label {
                font-size: 10px; font-weight: 600; color: #64748b; white-space: nowrap;
            }
            #tm-chat-store-select {
                flex: 1; min-width: 0; font-size: 11px;
                border: 1px solid var(--tm-chat-line); border-radius: 8px;
                padding: 3px 6px; background: #fff; color: var(--tm-chat-ink);
                outline: none; height: 26px;
            }
            #tm-chat-store-select:focus {
                border-color: color-mix(in srgb, var(--tm-chat-accent) 55%, #fff);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--tm-chat-accent) 18%, transparent);
            }
            #tm-chat-store-select.is-locked,
            #tm-chat-store-select:disabled {
                opacity: 0.95; cursor: not-allowed; background: #f1f5f9; color: var(--tm-chat-ink);
            }
            #tm-chat-store-lock {
                font-size: 11px; line-height: 1; flex-shrink: 0;
            }
            #tm-chat-messages {
                flex: 1 1 auto; min-height: 0; overflow-y: auto;
                padding: 8px 8px 10px;
                display: flex; flex-direction: column; gap: 6px;
                background:
                    radial-gradient(ellipse at top left, color-mix(in srgb, var(--tm-chat-accent) 8%, transparent), transparent 55%),
                    var(--tm-chat-bg);
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 transparent;
            }
            .tm-chat-empty {
                margin: auto; text-align: center; padding: 16px 12px;
                color: var(--tm-chat-muted); max-width: 220px;
            }
            .tm-chat-empty-icon {
                font-size: 28px; line-height: 1; margin-bottom: 8px;
            }
            .tm-chat-empty-title {
                font-size: 13px; font-weight: 700; color: var(--tm-chat-ink); margin-bottom: 3px;
            }
            .tm-chat-empty-sub { font-size: 11px; line-height: 1.4; }
            .tm-chat-msg {
                display: flex; align-items: flex-end; gap: 6px;
                max-width: 94%; align-self: flex-start;
                background: transparent; border: none; padding: 0;
            }
            .tm-chat-msg.is-new {
                animation: tm-chat-msg-in 0.22s ease-out;
            }
            @keyframes tm-chat-msg-in {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: none; }
            }
            .tm-chat-msg.is-mine {
                align-self: flex-end; flex-direction: row-reverse;
            }
            .tm-chat-msg-avatar {
                width: 24px; height: 24px; border-radius: 8px;
                display: grid; place-items: center; flex-shrink: 0;
                background: #e2e8f0; color: #334155;
                font-size: 10px; font-weight: 700;
            }
            .tm-chat-msg.is-mine .tm-chat-msg-avatar {
                background: color-mix(in srgb, var(--tm-chat-accent) 18%, #fff);
                color: var(--tm-chat-accent);
            }
            .tm-chat-msg-bubble {
                min-width: 0;
                background: #fff;
                border: 1px solid var(--tm-chat-line);
                border-radius: 12px 12px 12px 4px;
                padding: 5px 8px;
                box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
            }
            .tm-chat-msg.is-mine .tm-chat-msg-bubble {
                background: color-mix(in srgb, var(--tm-chat-accent) 12%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 28%, #fff);
                border-radius: 12px 12px 4px 12px;
            }
            .tm-chat-msg-meta {
                display: flex; justify-content: space-between; gap: 6px;
                font-size: 9px; color: var(--tm-chat-muted); margin-bottom: 2px;
            }
            .tm-chat-msg-who {
                display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px 5px;
                min-width: 0;
            }
            .tm-chat-msg-name { font-weight: 700; color: #334155; }
            .tm-chat-msg-store {
                font-weight: 600; color: var(--tm-chat-accent);
                background: color-mix(in srgb, var(--tm-chat-accent) 12%, #fff);
                border-radius: 999px; padding: 0 5px; line-height: 1.4;
                max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .tm-chat-msg-time { flex-shrink: 0; opacity: 0.9; }
            .tm-chat-msg-text {
                font-size: 12.5px; color: var(--tm-chat-ink);
                white-space: pre-wrap; word-break: break-word; line-height: 1.35;
            }
            .tm-chat-msg-link {
                color: var(--tm-chat-accent);
                text-decoration: underline;
                text-underline-offset: 2px;
                word-break: break-all;
            }
            .tm-chat-msg-link:hover { filter: brightness(0.9); }
            .tm-chat-msg.is-mine .tm-chat-msg-link { color: #1d4ed8; }
            .tm-chat-msg-image-link {
                display: block; margin: 2px 0 6px; border-radius: 12px; overflow: hidden;
                max-width: 240px; border: 1px solid var(--tm-chat-line);
            }
            .tm-chat-msg-image {
                display: block; width: 100%; max-height: 160px; object-fit: cover;
                background: #e2e8f0;
            }
            .tm-chat-msg-file {
                display: flex; align-items: center; gap: 8px;
                margin: 2px 0 6px; padding: 8px 10px;
                border-radius: 12px; border: 1px solid var(--tm-chat-line);
                background: #f8fafc; text-decoration: none; color: inherit;
                max-width: 260px;
            }
            .tm-chat-msg-file:hover { background: #eff6ff; border-color: color-mix(in srgb, var(--tm-chat-accent) 35%, #fff); }
            .tm-chat-msg-file.is-missing {
                opacity: 0.85; border-style: dashed; cursor: default;
            }
            .tm-chat-msg-file.is-missing .tm-chat-msg-file-hint { color: #b45309; }
            .tm-chat-msg-file-icon { font-size: 18px; flex-shrink: 0; }
            .tm-chat-msg-file-meta { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
            .tm-chat-msg-file-name {
                font-size: 12px; font-weight: 650; color: var(--tm-chat-ink);
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .tm-chat-msg-file-hint { font-size: 10px; color: var(--tm-chat-muted); }
            #tm-chat-pending-file {
                display: none; align-items: center; gap: 6px;
                margin-bottom: 4px; padding: 4px 6px;
                border-radius: 8px; background: #f1f5f9; border: 1px solid var(--tm-chat-line);
                font-size: 11px; color: var(--tm-chat-ink);
            }
            #tm-chat-pending-file.is-visible { display: flex; }
            #tm-chat-pending-file .tm-chat-pending-icon { flex-shrink: 0; }
            #tm-chat-pending-file .tm-chat-pending-name {
                flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                font-weight: 600;
            }
            #tm-chat-pending-file .tm-chat-pending-size { color: var(--tm-chat-muted); flex-shrink: 0; }
            #tm-chat-pending-clear {
                border: none; background: transparent; cursor: pointer;
                color: var(--tm-chat-muted); font-size: 14px; line-height: 1;
                width: 22px; height: 22px; border-radius: 6px;
            }
            #tm-chat-pending-clear:hover { background: #e2e8f0; color: #0f172a; }
            #tm-chat-attach-btn {
                width: 32px; height: 32px; flex-shrink: 0;
                border: 1px solid var(--tm-chat-line);
                border-radius: 10px;
                background: #f8fafc;
                cursor: pointer; font-size: 14px;
                display: grid; place-items: center;
                color: var(--tm-chat-muted);
                transition: background 0.15s ease, border-color 0.15s ease;
            }
            #tm-chat-attach-btn:hover,
            #tm-chat-attach-btn.has-file {
                background: color-mix(in srgb, var(--tm-chat-accent) 10%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 35%, #fff);
                color: var(--tm-chat-accent);
            }
            /* Native file input must stay fully hidden — only 📎 opens it */
            #tm-chat-file-input {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            #tm-chat-panel.is-drop-target #tm-chat-composer-wrap,
            #tm-chat-panel.is-drop-target #tm-chat-messages {
                outline: 2px dashed color-mix(in srgb, var(--tm-chat-accent) 55%, #fff);
                outline-offset: -4px;
            }
            #tm-chat-emoji-picker {
                display: none;
                position: absolute;
                left: 8px; right: 8px; bottom: calc(100% - 2px);
                max-height: 160px; overflow-y: auto;
                background: #fff;
                border: 1px solid var(--tm-chat-line);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
                padding: 6px;
                z-index: 2;
                scrollbar-width: thin;
            }
            #tm-chat-emoji-picker.is-open { display: block; }
            .tm-chat-emoji-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 2px;
            }
            .tm-chat-emoji-btn {
                border: none; background: transparent; cursor: pointer;
                font-size: 18px; line-height: 1;
                width: 100%; aspect-ratio: 1;
                border-radius: 8px;
                display: grid; place-items: center;
                transition: background 0.12s ease, transform 0.12s ease;
            }
            .tm-chat-emoji-btn:hover {
                background: #f1f5f9; transform: scale(1.08);
            }
            #tm-chat-composer {
                display: flex; align-items: center; gap: 4px;
            }
            #tm-chat-emoji-toggle {
                width: 32px; height: 32px; flex-shrink: 0;
                border: 1px solid var(--tm-chat-line);
                border-radius: 10px;
                background: #f8fafc;
                cursor: pointer; font-size: 15px;
                display: grid; place-items: center;
                color: var(--tm-chat-muted);
                transition: background 0.15s ease, border-color 0.15s ease;
            }
            #tm-chat-emoji-toggle:hover,
            #tm-chat-emoji-toggle.is-open {
                background: color-mix(in srgb, var(--tm-chat-accent) 10%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 35%, #fff);
                color: var(--tm-chat-accent);
            }
            #tm-chat-input {
                flex: 1; resize: none; min-height: 32px; max-height: 72px;
                border: 1px solid var(--tm-chat-line); border-radius: 10px;
                padding: 6px 8px; font-size: 13px; font-family: inherit;
                color: var(--tm-chat-ink); background: #f8fafc;
                outline: none; line-height: 1.3;
            }
            #tm-chat-input:focus {
                background: #fff;
                border-color: color-mix(in srgb, var(--tm-chat-accent) 55%, #fff);
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--tm-chat-accent) 16%, transparent);
            }
            #tm-chat-send {
                border: none; border-radius: 10px;
                min-width: 36px; height: 32px; padding: 0 10px;
                background: var(--tm-chat-accent); color: #fff;
                font-weight: 700; cursor: pointer; font-size: 14px;
                display: grid; place-items: center;
                transition: filter 0.15s ease, transform 0.12s ease;
            }
            #tm-chat-send:hover { filter: brightness(1.05); }
            #tm-chat-send:active { transform: scale(0.97); }
            #tm-chat-send:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
            @media (max-width: 420px) {
                #tm-chat-panel {
                    width: calc(100vw - 8px);
                    right: 4px; left: 4px;
                    height: min(88vh, calc(100vh - 48px));
                    bottom: 44px;
                }
                .tm-chat-emoji-grid { grid-template-columns: repeat(7, 1fr); }
            }
        `;
        document.head.appendChild(style);
    }

    function buildChatPanelHtml() {
        const emojiButtons = CHAT_EMOJI_LIST.map((emoji) => (
            `<button type="button" class="tm-chat-emoji-btn" data-emoji="${emoji}" title="${emoji}" aria-label="Insert ${emoji}">${emoji}</button>`
        )).join('');
        return `
            <div id="tm-chat-header">
                <div class="tm-chat-header-brand">
                    <div class="tm-chat-header-icon" aria-hidden="true">💬</div>
                    <div id="tm-chat-title-wrap">
                        <span class="tm-chat-live-dot" id="tm-chat-live-dot" data-status="idle" title="Κατάσταση" aria-hidden="true"></span>
                        <span id="tm-chat-title">Office Chat</span>
                    </div>
                </div>
                <div class="tm-chat-header-actions">
                    <button type="button" id="tm-chat-mute-btn" title="Σίγαση υπενθύμισης">🔔</button>
                    <button type="button" id="tm-chat-refresh-btn" title="Ανανέωση">↻</button>
                    <button type="button" id="tm-chat-close-btn" title="Κλείσιμο">&times;</button>
                </div>
            </div>
            <div id="tm-chat-status" data-status="idle">
                <span class="tm-chat-status-dot" aria-hidden="true"></span>
                <span class="tm-chat-status-text">Ανενεργό</span>
            </div>
            <div id="tm-chat-store-row">
                <label for="tm-chat-store-select">Κατ.</label>
                <select id="tm-chat-store-select" title="Από το κατάστημα/προφίλ του MyManager login"></select>
            </div>
            <div id="tm-chat-messages"></div>
            <div id="tm-chat-composer-wrap">
                <div id="tm-chat-emoji-picker" role="dialog" aria-label="Emoji picker" hidden>
                    <div class="tm-chat-emoji-grid">${emojiButtons}</div>
                </div>
                <div id="tm-chat-pending-file" aria-live="polite">
                    <span class="tm-chat-pending-icon" aria-hidden="true">📎</span>
                    <span class="tm-chat-pending-name"></span>
                    <span class="tm-chat-pending-size"></span>
                    <button type="button" id="tm-chat-pending-clear" title="Αφαίρεση αρχείου" aria-label="Αφαίρεση αρχείου">&times;</button>
                </div>
                <div id="tm-chat-composer">
                    <button type="button" id="tm-chat-attach-btn" title="Επισύναψη αρχείου" aria-label="Επισύναψη αρχείου">📎</button>
                    <button type="button" id="tm-chat-emoji-toggle" title="Emoji" aria-label="Emoji" aria-expanded="false">😊</button>
                    <textarea id="tm-chat-input" maxlength="${CHAT_MAX_LEN}" placeholder="Μήνυμα… Enter" rows="1"></textarea>
                    <button type="button" id="tm-chat-send" title="Αποστολή" aria-label="Αποστολή">➤</button>
                </div>
                <input type="file" id="tm-chat-file-input" class="tm-chat-file-input" tabindex="-1" aria-hidden="true" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
            </div>
            <div id="tm-chat-resize" title="Αλλαγή μεγέθους" aria-label="Αλλαγή μεγέθους" role="separator"></div>
        `;
    }

    function setChatEmojiPickerOpen(open) {
        const picker = document.getElementById('tm-chat-emoji-picker');
        const toggle = document.getElementById('tm-chat-emoji-toggle');
        if (!picker || !toggle) return;
        picker.classList.toggle('is-open', !!open);
        picker.hidden = !open;
        toggle.classList.toggle('is-open', !!open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function insertChatEmoji(emoji) {
        const input = document.getElementById('tm-chat-input');
        if (!input || !emoji) return;
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        const next = input.value.slice(0, start) + emoji + input.value.slice(end);
        if (next.length > CHAT_MAX_LEN) return;
        input.value = next;
        const caret = start + emoji.length;
        input.focus();
        try { input.setSelectionRange(caret, caret); } catch (_) { /* ignore */ }
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function wireChatEmojiPicker() {
        const wrap = document.getElementById('tm-chat-composer-wrap');
        const toggle = document.getElementById('tm-chat-emoji-toggle');
        const picker = document.getElementById('tm-chat-emoji-picker');
        if (!wrap || !toggle || !picker || wrap.dataset.tmChatEmojiWired === '1') return;
        wrap.dataset.tmChatEmojiWired = '1';

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setChatEmojiPickerOpen(!picker.classList.contains('is-open'));
        });

        picker.addEventListener('click', (e) => {
            const btn = e.target.closest('.tm-chat-emoji-btn');
            if (!btn) return;
            e.preventDefault();
            insertChatEmoji(btn.getAttribute('data-emoji') || btn.textContent || '');
        });

        document.addEventListener('click', (e) => {
            if (!picker.classList.contains('is-open')) return;
            if (e.target.closest('#tm-chat-composer-wrap')) return;
            setChatEmojiPickerOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && picker.classList.contains('is-open')) {
                setChatEmojiPickerOpen(false);
            }
        });
    }

    function updateChatPendingFileUi() {
        const row = document.getElementById('tm-chat-pending-file');
        const nameEl = row?.querySelector('.tm-chat-pending-name');
        const sizeEl = row?.querySelector('.tm-chat-pending-size');
        const attachBtn = document.getElementById('tm-chat-attach-btn');
        const file = chatPendingFile;
        if (!row) return;
        if (!file) {
            row.classList.remove('is-visible');
            if (nameEl) nameEl.textContent = '';
            if (sizeEl) sizeEl.textContent = '';
            attachBtn?.classList.remove('has-file');
            return;
        }
        row.classList.add('is-visible');
        if (nameEl) nameEl.textContent = file.name || 'αρχείο';
        if (sizeEl) sizeEl.textContent = formatChatFileSize(file.size);
        attachBtn?.classList.add('has-file');
    }

    function clearChatPendingFile() {
        chatPendingFile = null;
        const input = document.getElementById('tm-chat-file-input');
        if (input) input.value = '';
        updateChatPendingFileUi();
    }

    function setChatPendingFile(file) {
        if (!file) {
            clearChatPendingFile();
            return false;
        }
        const check = isAllowedChatFile(file);
        if (!check.ok) {
            setChatStatus('error', check.message || 'Μη έγκυρο αρχείο');
            setTimeout(() => {
                if (chatStatus === 'error') setChatStatus('online');
            }, 2500);
            return false;
        }
        chatPendingFile = file;
        updateChatPendingFileUi();
        setChatEmojiPickerOpen(false);
        return true;
    }

    async function openChatAttachmentSafely(recordId, filename) {
        const url = getChatFileUrl(recordId, filename);
        if (!url) return;
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (_) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.click();
        }
    }

    function wireChatFileAttach(STORAGE_KEYS) {
        void STORAGE_KEYS;
        const panel = document.getElementById('tm-chat-panel');
        const attachBtn = document.getElementById('tm-chat-attach-btn');
        const fileInput = document.getElementById('tm-chat-file-input');
        const clearBtn = document.getElementById('tm-chat-pending-clear');
        if (!panel || !attachBtn || !fileInput || panel.dataset.tmChatFileWired === '1') return;
        panel.dataset.tmChatFileWired = '1';

        attachBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (chatAttachmentFieldUnsupported) {
                setChatStatus('error', 'Πρόσθεσε πεδίο attachment στο messages (PocketBase)');
                return;
            }
            fileInput.click();
        });
        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (file) setChatPendingFile(file);
            else clearChatPendingFile();
        });
        clearBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            clearChatPendingFile();
        });

        panel.addEventListener('click', (e) => {
            const link = e.target.closest('.tm-chat-msg-image-link, .tm-chat-msg-file');
            if (!link || !panel.contains(link)) return;
            const recordId = link.getAttribute('data-chat-record');
            const filename = link.getAttribute('data-chat-file');
            if (!recordId || !filename) return;
            e.preventDefault();
            openChatAttachmentSafely(recordId, filename);
        });
    }

    function wireChatPasteDrop(STORAGE_KEYS) {
        void STORAGE_KEYS;
        const panel = document.getElementById('tm-chat-panel');
        const input = document.getElementById('tm-chat-input');
        if (!panel || panel.dataset.tmChatPasteDropWired === '1') return;
        panel.dataset.tmChatPasteDropWired = '1';

        const pickFileFromList = (list) => {
            if (!list || !list.length) return null;
            for (let i = 0; i < list.length; i++) {
                const f = list[i];
                if (f && isAllowedChatFile(f).ok) return f;
            }
            return list[0] || null;
        };

        input?.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file' && /^image\//i.test(item.type || '')) {
                    const file = item.getAsFile();
                    if (file) {
                        e.preventDefault();
                        const named = file.name && file.name !== 'image.png'
                            ? file
                            : new File([file], `screenshot-${Date.now()}.png`, { type: file.type || 'image/png' });
                        setChatPendingFile(named);
                    }
                    return;
                }
            }
        });

        let dragDepth = 0;
        const onDragEnter = (e) => {
            if (!e.dataTransfer?.types?.includes('Files')) return;
            e.preventDefault();
            dragDepth += 1;
            panel.classList.add('is-drop-target');
        };
        const onDragLeave = (e) => {
            if (!e.dataTransfer?.types?.includes('Files')) return;
            e.preventDefault();
            dragDepth = Math.max(0, dragDepth - 1);
            if (dragDepth === 0) panel.classList.remove('is-drop-target');
        };
        const onDragOver = (e) => {
            if (!e.dataTransfer?.types?.includes('Files')) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        };
        const onDrop = (e) => {
            if (!e.dataTransfer?.files?.length) return;
            e.preventDefault();
            dragDepth = 0;
            panel.classList.remove('is-drop-target');
            const file = pickFileFromList(e.dataTransfer.files);
            if (file) setChatPendingFile(file);
        };

        panel.addEventListener('dragenter', onDragEnter);
        panel.addEventListener('dragleave', onDragLeave);
        panel.addEventListener('dragover', onDragOver);
        panel.addEventListener('drop', onDrop);
    }

    function wireChatPanelControls(panel, STORAGE_KEYS) {
        if (!panel || panel.dataset.tmChatControlsWired === '1') return;
        panel.dataset.tmChatControlsWired = '1';
        panel.querySelector('#tm-chat-close-btn')?.addEventListener('click', () => {
            setChatEmojiPickerOpen(false);
            closeChatPanel();
        });
        panel.querySelector('#tm-chat-refresh-btn')?.addEventListener('click', () => {
            connectChat(STORAGE_KEYS);
        });
        const muteBtn = panel.querySelector('#tm-chat-mute-btn');
        if (muteBtn) {
            const syncMute = () => {
                muteBtn.textContent = chatMuted ? '🔕' : '🔔';
                muteBtn.classList.toggle('is-muted', chatMuted);
                muteBtn.title = chatMuted ? 'Άρση σίγασης υπενθύμισης' : 'Σίγαση υπενθύμισης';
                updateUnreadBadge();
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
        wireChatEmojiPicker();
        wireChatFileAttach(STORAGE_KEYS);
        wireChatPasteDrop(STORAGE_KEYS);
        wireChatStoreSelect(STORAGE_KEYS);
        wireChatPanelDrag(panel, STORAGE_KEYS);
        wireChatPanelResize(panel, STORAGE_KEYS);
        applyChatPanelGeometry(panel, STORAGE_KEYS);
        updateChatPendingFileUi();
        updateChatStatusUi();
    }

    function ensureChatPanel(STORAGE_KEYS) {
        let panel = document.getElementById('tm-chat-panel');
        const needsRebuild = !panel || panel.getAttribute('data-tm-chat-ui') !== '7';
        if (needsRebuild) {
            const wasOpen = !!(panel && panel.classList.contains('is-open'));
            if (panel) panel.remove();
            panel = document.createElement('div');
            panel.id = 'tm-chat-panel';
            panel.setAttribute('data-tm-chat-ui', '7');
            panel.innerHTML = buildChatPanelHtml();
            document.body.appendChild(panel);
            wireChatPanelControls(panel, STORAGE_KEYS);
            if (wasOpen) {
                panel.classList.add('is-open');
                chatPanelOpen = true;
                renderMessages();
            }
        } else {
            wireChatPanelControls(panel, STORAGE_KEYS);
        }
        return panel;
    }

    function ensureChatFooterHost() {
        return document.getElementById('tm-footer-controls-right')
            || document.getElementById('tm-footer-controls-left')
            || document.getElementById('tm-footer-controls-middle')
            || null;
    }

    function removeLegacyChatSlideOutButton() {
        const btn = document.getElementById('tm-chat-toggle-btn');
        if (!btn) return;
        const inFooter = !!btn.closest('#tm-footer-controls-container');
        if (!inFooter) btn.remove();
    }

    function ensureChatToggleButton(STORAGE_KEYS) {
        removeLegacyChatSlideOutButton();
        let toggleButton = document.getElementById('tm-chat-toggle-btn');
        if (toggleButton && (toggleButton.getAttribute('data-tm-ui-shell') === '1'
            || (typeof window.tmIsUiShellEl === 'function' && window.tmIsUiShellEl(toggleButton)))) {
            toggleButton.remove();
            toggleButton = null;
        }

        const host = ensureChatFooterHost();
        if (!host) return null;

        if (!toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.id = 'tm-chat-toggle-btn';
            toggleButton.type = 'button';
            toggleButton.className = 'tm-footer-widget tm-footer-icon-btn';
            toggleButton.textContent = '💬';
            toggleButton.title = 'Office Chat';
            toggleButton.setAttribute('aria-label', 'Office Chat');
            const settingsBtn = host.querySelector('#tm-settings-btn, [id*="settings"]');
            if (settingsBtn) host.insertBefore(toggleButton, settingsBtn);
            else host.appendChild(toggleButton);
        } else if (!host.contains(toggleButton)) {
            host.appendChild(toggleButton);
        }

        // Keep label emoji-only (strip leftover "Chat" text from older builds)
        const unread = toggleButton.querySelector('.tm-chat-unread');
        toggleButton.textContent = '💬';
        if (unread) toggleButton.appendChild(unread);

        toggleButton.classList.remove('tm-slide-out-btn');
        toggleButton.classList.add('tm-footer-widget', 'tm-footer-icon-btn');
        if (!toggleButton.dataset.tmChatClickWired) {
            toggleButton.dataset.tmChatClickWired = '1';
            toggleButton.addEventListener('click', () => toggleChatPanel(STORAGE_KEYS));
        }
        return toggleButton;
    }

    function clampChatPanelSize(width, height) {
        const minW = 280;
        const minH = 300;
        const maxW = Math.max(minW, window.innerWidth - 16);
        const maxH = Math.max(minH, window.innerHeight - 16);
        return {
            width: Math.min(Math.max(minW, width), maxW),
            height: Math.min(Math.max(minH, height), maxH),
        };
    }

    function ensureChatPanelTopLeft(panel) {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        panel.style.left = `${rect.left}px`;
        panel.style.top = `${rect.top}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    function clampChatPanelPosition(panel, left, top) {
        const rect = panel.getBoundingClientRect();
        const w = rect.width || 400;
        const h = rect.height || Math.min(window.innerHeight * 0.92, window.innerHeight - 56);
        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - w - margin);
        const maxTop = Math.max(margin, window.innerHeight - h - margin);
        return {
            left: Math.min(Math.max(margin, left), maxLeft),
            top: Math.min(Math.max(margin, top), maxTop),
        };
    }

    function applyChatPanelGeometry(panel, STORAGE_KEYS) {
        if (!panel) return;
        const keys = chatKeys(STORAGE_KEYS);
        let geo = null;
        try {
            const raw = GM_getValue(keys.geometry, '');
            if (raw) geo = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch (_) { /* ignore */ }
        if (!geo) return;

        const width = parseFloat(geo.width);
        const height = parseFloat(geo.height);
        if (Number.isFinite(width) && Number.isFinite(height)) {
            const size = clampChatPanelSize(width, height);
            panel.style.width = `${size.width}px`;
            panel.style.height = `${size.height}px`;
        }

        if (geo.left == null || geo.top == null) return;
        const left = parseFloat(geo.left);
        const top = parseFloat(geo.top);
        if (!Number.isFinite(left) || !Number.isFinite(top)) return;
        const pos = clampChatPanelPosition(panel, left, top);
        panel.style.left = `${pos.left}px`;
        panel.style.top = `${pos.top}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    function saveChatPanelGeometry(panel, STORAGE_KEYS) {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        const keys = chatKeys(STORAGE_KEYS);
        const size = clampChatPanelSize(rect.width, rect.height);
        panel.style.width = `${size.width}px`;
        panel.style.height = `${size.height}px`;
        const pos = clampChatPanelPosition(panel, rect.left, rect.top);
        panel.style.left = `${pos.left}px`;
        panel.style.top = `${pos.top}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        try {
            GM_setValue(keys.geometry, JSON.stringify({
                left: pos.left,
                top: pos.top,
                width: size.width,
                height: size.height,
            }));
        } catch (_) { /* ignore */ }
    }

    function wireChatPanelResize(panel, STORAGE_KEYS) {
        if (!panel || panel.dataset.tmChatResizeWired === '1') return;
        panel.dataset.tmChatResizeWired = '1';
        const handle = panel.querySelector('#tm-chat-resize');
        if (!handle) return;

        let resizing = false;
        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;
        let pointerId = null;

        const onMove = (clientX, clientY) => {
            if (!resizing) return;
            const size = clampChatPanelSize(
                startW + (clientX - startX),
                startH + (clientY - startY)
            );
            panel.style.width = `${size.width}px`;
            panel.style.height = `${size.height}px`;
            const rect = panel.getBoundingClientRect();
            const pos = clampChatPanelPosition(panel, rect.left, rect.top);
            panel.style.left = `${pos.left}px`;
            panel.style.top = `${pos.top}px`;
        };

        const stopResize = () => {
            if (!resizing) return;
            resizing = false;
            pointerId = null;
            panel.classList.remove('is-resizing');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            saveChatPanelGeometry(panel, STORAGE_KEYS);
        };

        const startResize = (clientX, clientY, id) => {
            ensureChatPanelTopLeft(panel);
            // Lock current CSS size into inline px so resize isn't fighting min()/vh values
            const rect = panel.getBoundingClientRect();
            const size = clampChatPanelSize(rect.width, rect.height);
            panel.style.width = `${size.width}px`;
            panel.style.height = `${size.height}px`;
            resizing = true;
            pointerId = id != null ? id : null;
            startX = clientX;
            startY = clientY;
            startW = size.width;
            startH = size.height;
            panel.classList.add('is-resizing');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'nwse-resize';
        };

        handle.addEventListener('pointerdown', (e) => {
            if (e.button != null && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            startResize(e.clientX, e.clientY, e.pointerId);
            try { handle.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        });

        handle.addEventListener('pointermove', (e) => {
            if (!resizing) return;
            if (pointerId != null && e.pointerId !== pointerId) return;
            e.preventDefault();
            onMove(e.clientX, e.clientY);
        });

        const endPointer = (e) => {
            if (!resizing) return;
            if (pointerId != null && e.pointerId !== pointerId) return;
            try { handle.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            stopResize();
        };
        handle.addEventListener('pointerup', endPointer);
        handle.addEventListener('pointercancel', endPointer);

        // Fallback for environments without PointerEvent
        handle.addEventListener('mousedown', (e) => {
            if (window.PointerEvent) return;
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            startResize(e.clientX, e.clientY, null);
        });
        document.addEventListener('mousemove', (e) => {
            if (window.PointerEvent || !resizing) return;
            onMove(e.clientX, e.clientY);
        });
        document.addEventListener('mouseup', () => {
            if (window.PointerEvent || !resizing) return;
            stopResize();
        });
    }

    function wireChatPanelDrag(panel, STORAGE_KEYS) {
        if (!panel || panel.dataset.tmChatDragWired === '1') return;
        panel.dataset.tmChatDragWired = '1';
        const header = panel.querySelector('#tm-chat-header');
        if (!header) return;

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (e.target.closest('button, input, textarea, select, a')) return;
            const rect = panel.getBoundingClientRect();
            dragging = true;
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            panel.classList.add('is-dragging');
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const pos = clampChatPanelPosition(panel, e.clientX - offsetX, e.clientY - offsetY);
            panel.style.left = `${pos.left}px`;
            panel.style.top = `${pos.top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            panel.classList.remove('is-dragging');
            document.body.style.userSelect = '';
            saveChatPanelGeometry(panel, STORAGE_KEYS);
        });

        window.addEventListener('resize', () => {
            if (!panel.classList.contains('is-open')) return;
            if (panel.style.left || panel.style.top) {
                saveChatPanelGeometry(panel, STORAGE_KEYS);
            }
        });
    }

    function openChatPanel(STORAGE_KEYS) {
        const panel = document.getElementById('tm-chat-panel');
        if (!panel) return;
        applyChatPanelGeometry(panel, STORAGE_KEYS);
        refreshChatStoreSelect(STORAGE_KEYS);
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
        setChatEmojiPickerOpen(false);
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
        if (!input || !sendBtn || input.dataset.tmChatComposerWired === '1') return;
        input.dataset.tmChatComposerWired = '1';

        const doSend = async () => {
            const text = input.value;
            const file = chatPendingFile;
            if (!String(text || '').trim() && !file) return;
            sendBtn.disabled = true;
            const prevLabel = sendBtn.textContent;
            sendBtn.textContent = '…';
            setChatStatus('online', file ? 'Αποστολή αρχείου…' : 'Αποστολή…');
            try {
                const result = await sendChatMessage(STORAGE_KEYS, text, file);
                if (result.ok) {
                    setChatEmojiPickerOpen(false);
                    input.value = '';
                    clearChatPendingFile();
                    setChatStatus('online');
                } else if (result.reason === 'rate') {
                    setChatStatus('online', 'Περίμενε λίγο…');
                    setTimeout(() => setChatStatus('online'), 1200);
                } else if (result.reason !== 'unsupported' && result.reason !== 'type' && result.reason !== 'size') {
                    setChatStatus('online');
                }
            } catch (err) {
                setChatStatus('error', err?.message || 'Αποστολή απέτυχε');
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = prevLabel || '➤';
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
        chatStorageKeys = STORAGE_KEYS;
        chatMuted = settings.muted;
        injectChatStyles();

        const mount = () => {
            const btn = ensureChatToggleButton(STORAGE_KEYS);
            if (!btn) return false;
            updateUnreadBadge();
            return true;
        };

        if (!mount()) {
            let tries = 0;
            const timer = setInterval(() => {
                tries += 1;
                if (mount() || tries > 20) clearInterval(timer);
            }, 250);
        }

        ensureChatPanel(STORAGE_KEYS);

        // Background connect so unread works with panel closed
        connectChat(STORAGE_KEYS);
    }

    window.initOfficeChatFeature = initOfficeChatFeature;
    window.testOfficeChatConnection = testChatConnection;
    window.connectOfficeChat = connectChat;
    window.ensureOfficeChatAccount = ensureOfficeChatAccount;
    window.getOfficeChatSettings = getChatSettings;
    window.suggestOfficeChatEmail = suggestOfficeChatEmail;
    window.registerOfficeChatUser = registerOfficeChatUser;
})();
