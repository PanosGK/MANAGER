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

    const CHAT_ROOM_OFFICE = 'office';
    const CHAT_ROOM = CHAT_ROOM_OFFICE;
    /**
     * Store channel tab (Όλοι / Κατάστημα). Off for now — everyone shares `office`.
     * Set to true to show the store room tab again.
     */
    const CHAT_STORE_ROOMS_ENABLED = false;
    /**
     * Message pin / pinned strip. Off for now.
     * Set to true to show pin in the right-click menu again.
     */
    const CHAT_PIN_ENABLED = false;
    let chatActiveRoom = CHAT_ROOM_OFFICE;
    let chatReplyTarget = null;
    let chatSearchQuery = '';
    let chatFilterImages = false;
    let chatFilterRepairs = false;
    let chatFilterFrom = '';
    let chatPresenceList = [];
    let chatPresenceTimer = null;
    let chatPresenceUnsupported = false;
    let chatPresenceHintShown = false;
    let chatReplyFieldsUnsupported = false;
    let chatPinFieldUnsupported = false;
    let chatSoftDeleteUnsupported = false;
    let chatEditFieldUnsupported = false;
    let chatReactionsUnsupported = false;
    let chatPresenceAvatarUnsupported = false;
    let chatTypingUnsupported = false;
    let chatOwnPresenceRecordId = '';
    let chatOwnTypingUntil = 0;
    let chatTypingIdleTimer = null;
    let chatTypingPushTimer = null;
    let chatTypingUiTimer = null;
    let chatMentionsOnly = false;
    let chatUnreadMentionIds = new Set();
    const CHAT_UNREAD_MENTIONS_KEY = 'tm_chat_unread_mentions_v1';
    const chatRepairCardCache = new Map();
    const chatRepairCardInflight = new Map();
    let chatSoundEnabled = true;
    let chatAvatarDirTick = 0;
    /** Local pin ids (fallback when PocketBase `pinned` field is missing). */
    let chatLocalPinIds = new Set();
    const CHAT_LOCAL_PINS_KEY = 'tm_chat_local_pins_v1';
    /** Local reply metadata (fallback when PocketBase reply fields are missing). */
    let chatLocalReplies = Object.create(null);
    const CHAT_LOCAL_REPLIES_KEY = 'tm_chat_local_replies_v1';
    /** Local reactions map: messageId → { "👍": ["Name"], "❤️": ["Name"] }. */
    let chatLocalReactions = Object.create(null);
    const CHAT_LOCAL_REACTIONS_KEY = 'tm_chat_local_reactions_v1';
    const CHAT_REACTION_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '👀', '✅', '❌'];
    const CHAT_PRESENCE_MS = 25000;
    const CHAT_DEFAULT_WORK_START = '09:00';
    const CHAT_DEFAULT_WORK_END = '18:00';
    const CHAT_REPAIR_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=';
    const CHAT_REPAIR_LIST_URL = 'https://thefixers.mymanager.gr/mymanagerservice/service_list.php';
    const CHAT_TYPING_TTL_MS = 4200;
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
    /** Own PocketBase user id + avatar filename (from users.avatar). */
    let chatSelfPbUserId = '';
    let chatSelfAvatarFile = '';
    /** Once PB rejects message avatar/pbUserId fields, stop sending them until reload. */
    let chatMsgAvatarFieldsUnsupported = false;
    /** Map displayName/slug/profileId/userId → { userId, filename } for bubble photos. */
    const chatAvatarDirectory = new Map();
    /** displayName (lower) → PocketBase user id — from presence / auth sync. */
    const chatUserIdByDisplayName = new Map();
    const CHAT_AVATAR_MAX_BYTES = 1 * 1024 * 1024;
    const CHAT_AVATAR_META_KEY = 'tm_chat_avatar_meta';
    const CHAT_AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const CHAT_AVATAR_EXT_RE = /\.(jpe?g|png|webp|gif)$/i;

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
            sound: k.CHAT_SOUND || 'tm_chat_sound',
            geometry: k.CHAT_GEOMETRY || 'tm_chat_geometry',
            store: k.CHAT_STORE || 'tm_chat_store',
            storeManual: k.CHAT_STORE_MANUAL || 'tm_chat_store_manual',
            room: k.CHAT_ROOM || 'tm_chat_room',
            draft: k.CHAT_DRAFT || 'tm_chat_draft_v1',
            quietHours: k.CHAT_QUIET_HOURS || 'tm_chat_quiet_hours',
            workStart: k.CHAT_WORK_START || 'tm_chat_work_start',
            workEnd: k.CHAT_WORK_END || 'tm_chat_work_end',
        };
    }

    function getChatRoom() {
        return chatActiveRoom || CHAT_ROOM_OFFICE;
    }

    function getStoreChatRoom(STORAGE_KEYS) {
        const store = getChatStoreName(STORAGE_KEYS) || detectLoginStoreName() || '';
        const slug = greekToLatinSlug(store) || 'store';
        return `store_${slug}`.slice(0, 32);
    }

    function loadChatRoomPreference(STORAGE_KEYS) {
        if (!CHAT_STORE_ROOMS_ENABLED) {
            chatActiveRoom = CHAT_ROOM_OFFICE;
            return chatActiveRoom;
        }
        const keys = chatKeys(STORAGE_KEYS);
        const saved = String(GM_getValue(keys.room, CHAT_ROOM_OFFICE) || CHAT_ROOM_OFFICE);
        chatActiveRoom = saved === 'store' ? getStoreChatRoom(STORAGE_KEYS) : CHAT_ROOM_OFFICE;
        return chatActiveRoom;
    }

    function setChatRoomMode(STORAGE_KEYS, mode) {
        if (!CHAT_STORE_ROOMS_ENABLED) {
            chatActiveRoom = CHAT_ROOM_OFFICE;
            updateChatRoomTabsUi();
            return;
        }
        const keys = chatKeys(STORAGE_KEYS);
        const next = mode === 'store' ? 'store' : 'office';
        GM_setValue(keys.room, next);
        chatActiveRoom = next === 'store' ? getStoreChatRoom(STORAGE_KEYS) : CHAT_ROOM_OFFICE;
        chatMessages = [];
        chatMessagesRenderKey = '';
        chatHydrated = false;
        updateChatRoomTabsUi();
        if (CHAT_PIN_ENABLED) renderPinnedStrip();
        renderPresenceUi();
        renderMessages({ force: true });
        const sk = STORAGE_KEYS || chatStorageKeys;
        if (sk) fetchMessages(sk).catch(() => {});
    }

    function updateChatRoomTabsUi() {
        const rooms = document.getElementById('tm-chat-rooms');
        const officeBtn = document.getElementById('tm-chat-room-office');
        const storeBtn = document.getElementById('tm-chat-room-store');
        if (rooms) rooms.hidden = !CHAT_STORE_ROOMS_ENABLED;
        if (!CHAT_STORE_ROOMS_ENABLED || !officeBtn || !storeBtn) return;
        const isStore = String(getChatRoom()).startsWith('store_');
        officeBtn.classList.toggle('is-active', !isStore);
        storeBtn.classList.toggle('is-active', isStore);
        const storeName = getChatStoreName(chatStorageKeys) || 'Κατάστημα';
        storeBtn.title = `Κανάλι: ${storeName}`;
        storeBtn.textContent = storeName.length > 14 ? `${storeName.slice(0, 12)}…` : storeName;
    }

    function messageMentionsMe(text) {
        const me = getDisplayName();
        if (!me || !text) return false;
        const escaped = me.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`@${escaped}\\b`, 'i').test(text)) return true;
        const slug = greekToLatinSlug(me);
        if (slug && slug.length >= 2 && new RegExp(`@${slug}\\b`, 'i').test(text)) return true;
        return false;
    }

    function loadUnreadChatMentions() {
        try {
            const raw = GM_getValue(CHAT_UNREAD_MENTIONS_KEY, '[]');
            const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
            chatUnreadMentionIds = new Set(Array.isArray(arr) ? arr.map(String) : []);
        } catch (_) {
            chatUnreadMentionIds = new Set();
        }
    }

    function saveUnreadChatMentions() {
        try {
            GM_setValue(CHAT_UNREAD_MENTIONS_KEY, JSON.stringify([...chatUnreadMentionIds].slice(-80)));
        } catch (_) { /* ignore */ }
    }

    function rememberUnreadMentions(messages) {
        let changed = false;
        (messages || []).forEach((m) => {
            if (!m?.id || m.deleted || isOwnChatMessage(m)) return;
            if (!messageMentionsMe(m.text)) return;
            const id = String(m.id);
            if (!chatUnreadMentionIds.has(id)) {
                chatUnreadMentionIds.add(id);
                changed = true;
            }
        });
        if (changed) {
            saveUnreadChatMentions();
            updateChatMentionsBtnUi();
        }
    }

    function clearUnreadMention(id) {
        const key = String(id || '');
        if (!key || !chatUnreadMentionIds.has(key)) return;
        chatUnreadMentionIds.delete(key);
        saveUnreadChatMentions();
        updateChatMentionsBtnUi();
    }

    function getMentionMessages() {
        const room = getChatRoom();
        return chatMessages
            .filter((m) => String(m.room || room) === room && !isChatMessageDeleted(m) && messageMentionsMe(m.text))
            .slice()
            .sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0));
    }

    function updateChatMentionsBtnUi() {
        const btn = document.getElementById('tm-chat-mentions-btn');
        if (!btn) return;
        const unread = [...chatUnreadMentionIds].filter((id) => findChatMessageById(id)).length;
        const total = getMentionMessages().length;
        btn.classList.toggle('is-active', chatMentionsOnly);
        btn.classList.toggle('has-unread', unread > 0);
        btn.title = chatMentionsOnly
            ? 'Εμφάνιση όλων των μηνυμάτων'
            : (unread > 0
                ? `${unread} μη διαβασμένες αναφορές @ — κλικ για φίλτρο / μετάβαση`
                : (total ? 'Φίλτρο: μηνύματα που σε ανέφεραν' : 'Καμία αναφορά @ ακόμα'));
        let badge = btn.querySelector('.tm-chat-mentions-badge');
        if (unread > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'tm-chat-mentions-badge';
                btn.appendChild(badge);
            }
            badge.textContent = unread > 9 ? '9+' : String(unread);
            badge.hidden = false;
        } else if (badge) {
            badge.hidden = true;
        }
    }

    function jumpToChatMessage(id, { clearMention } = {}) {
        const list = document.getElementById('tm-chat-messages');
        if (!list || !id) return false;
        const el = list.querySelector(`.tm-chat-msg[data-id="${CSS.escape(String(id))}"]`);
        if (!el) return false;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('is-new', 'is-mention-flash');
        window.setTimeout(() => el.classList.remove('is-mention-flash'), 1600);
        if (clearMention !== false) clearUnreadMention(id);
        return true;
    }

    function toggleChatMentionsFilter() {
        const mentions = getMentionMessages();
        if (!mentions.length) {
            chatMentionsOnly = false;
            setChatStatus('online', 'Καμία αναφορά @ στα φορτωμένα μηνύματα');
            setTimeout(() => setChatStatus('online'), 1600);
            updateChatMentionsBtnUi();
            renderMessages({ force: true });
            return;
        }
        chatMentionsOnly = !chatMentionsOnly;
        updateChatMentionsBtnUi();
        renderMessages({ force: true });
        if (chatMentionsOnly) {
            const unread = mentions.filter((m) => chatUnreadMentionIds.has(String(m.id)));
            const target = (unread[0] || mentions[mentions.length - 1]);
            window.setTimeout(() => jumpToChatMessage(target.id), 40);
        }
    }

    function cycleChatMentionJump() {
        const mentions = getMentionMessages();
        if (!mentions.length) {
            setChatStatus('online', 'Καμία αναφορά @');
            setTimeout(() => setChatStatus('online'), 1200);
            return;
        }
        if (!chatMentionsOnly) {
            chatMentionsOnly = true;
            updateChatMentionsBtnUi();
            renderMessages({ force: true });
        }
        const unread = mentions.filter((m) => chatUnreadMentionIds.has(String(m.id)));
        const pool = unread.length ? unread : mentions;
        const list = document.getElementById('tm-chat-messages');
        const visible = list?.querySelector('.tm-chat-msg.is-mention-flash, .tm-chat-msg.is-new');
        let idx = 0;
        if (visible) {
            const cur = visible.getAttribute('data-id');
            const at = pool.findIndex((m) => String(m.id) === String(cur));
            idx = at >= 0 ? (at + 1) % pool.length : 0;
        }
        window.setTimeout(() => jumpToChatMessage(pool[idx].id), 40);
    }

    function playChatNotifySound({ mention } = {}) {
        if (isChatNotifyMuted() || !chatSoundEnabled) return;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            const ctx = playChatNotifySound._ctx || (playChatNotifySound._ctx = new Ctx());
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = mention ? 920 : 640;
            gain.gain.value = 0.035;
            osc.connect(gain);
            gain.connect(ctx.destination);
            const t0 = ctx.currentTime;
            osc.start(t0);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (mention ? 0.22 : 0.12));
            osc.stop(t0 + (mention ? 0.24 : 0.14));
        } catch (_) { /* ignore */ }
    }

    function requestChatDesktopNotifyPermission() {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission !== 'default') return;
        if (requestChatDesktopNotifyPermission._asked) return;
        requestChatDesktopNotifyPermission._asked = true;
        try {
            const req = Notification.requestPermission();
            if (req && typeof req.then === 'function') req.catch(() => {});
        } catch (_) { /* ignore */ }
    }

    /** OS toast only when the MyManager tab is in the background. */
    function showChatMentionDesktopNotification(msg) {
        if (!document.hidden) return;
        if (isChatNotifyMuted()) return;
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        if (!msg?.id || isOwnChatMessage(msg) || !messageMentionsMe(msg.text)) return;
        const who = String(msg.displayName || 'Chat').trim() || 'Chat';
        const body = `${who}: ${chatMessagePreviewText(msg)}`.slice(0, 160);
        try {
            const n = new Notification('Σε ανέφεραν στο Office Chat', {
                body,
                tag: 'tm-chat-mention',
                renotify: true,
                silent: true,
            });
            n.onclick = () => {
                try { window.focus(); } catch (_) { /* ignore */ }
                try {
                    if (chatStorageKeys) openChatPanel(chatStorageKeys);
                    window.setTimeout(() => jumpToChatMessage(msg.id), 60);
                } catch (_) { /* ignore */ }
                try { n.close(); } catch (_) { /* ignore */ }
            };
        } catch (_) { /* ignore */ }
    }

    function collectChatFilterFromNames() {
        const names = new Set();
        const room = getChatRoom();
        chatMessages.forEach((m) => {
            if (String(m.room || room) !== room) return;
            const n = String(m?.displayName || '').trim();
            if (n) names.add(n);
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b, 'el'));
    }

    function messageHasChatImage(m) {
        const att = normalizeChatAttachmentName(m);
        return !!(att && isChatImageFileName(att));
    }

    function messageHasChatRepair(m) {
        return extractChatRepairNumbers(m?.text || '').length > 0;
    }

    function messageMatchesChatFilters(m) {
        if (chatFilterImages && !messageHasChatImage(m)) return false;
        if (chatFilterRepairs && !messageHasChatRepair(m)) return false;
        if (chatFilterFrom) {
            if (String(m?.displayName || '').trim() !== chatFilterFrom) return false;
        }
        return true;
    }

    function chatFiltersActive() {
        return !!(chatFilterImages || chatFilterRepairs || chatFilterFrom);
    }

    function updateChatFilterUi() {
        const row = document.getElementById('tm-chat-filter-row');
        if (!row) return;
        row.querySelectorAll('[data-chat-filter]').forEach((btn) => {
            const key = btn.getAttribute('data-chat-filter');
            const on = key === 'images' ? chatFilterImages
                : (key === 'repairs' ? chatFilterRepairs : false);
            btn.classList.toggle('is-active', !!on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        const select = document.getElementById('tm-chat-filter-from');
        if (select) {
            const names = collectChatFilterFromNames();
            const key = names.join('\u0001');
            if (select.dataset.tmNamesKey !== key) {
                select.dataset.tmNamesKey = key;
                const prev = chatFilterFrom;
                select.innerHTML = [`<option value="">Από: Όλοι</option>`]
                    .concat(names.map((n) => (
                        `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`
                    )))
                    .join('');
                if (prev && !names.includes(prev)) chatFilterFrom = '';
            }
            select.value = chatFilterFrom || '';
            select.classList.toggle('is-active', !!chatFilterFrom);
        }
    }

    function collectChatMentionNames() {
        const names = new Set();
        chatMessages.forEach((m) => {
            const n = String(m?.displayName || '').trim();
            if (n) names.add(n);
        });
        chatPresenceList.forEach((p) => {
            const n = String(p?.displayName || '').trim();
            if (n) names.add(n);
        });
        const me = getDisplayName();
        if (me) names.delete(me);
        return Array.from(names).sort((a, b) => a.localeCompare(b, 'el'));
    }

    function findChatMessageById(id) {
        return chatMessages.find((m) => String(m.id) === String(id)) || null;
    }

    function setChatReplyTarget(msg) {
        if (!msg?.id || msg.deleted) chatReplyTarget = null;
        else {
            chatReplyTarget = {
                id: msg.id,
                displayName: msg.displayName || '',
                preview: chatMessagePreviewText(msg).slice(0, 100),
            };
        }
        updateChatReplyBarUi();
        document.getElementById('tm-chat-input')?.focus();
    }

    function updateChatReplyBarUi() {
        const bar = document.getElementById('tm-chat-reply-bar');
        if (!bar) return;
        if (!chatReplyTarget) {
            bar.hidden = true;
            bar.innerHTML = '';
            return;
        }
        bar.hidden = false;
        bar.innerHTML = `<div class="tm-chat-reply-bar-inner">
            <div class="tm-chat-reply-bar-text">
                <strong>Απάντηση σε ${escapeHtml(chatReplyTarget.displayName || '?')}</strong>
                <span>${escapeHtml(chatReplyTarget.preview || '')}</span>
            </div>
            <button type="button" id="tm-chat-reply-clear" title="Ακύρωση">&times;</button>
        </div>`;
        bar.querySelector('#tm-chat-reply-clear')?.addEventListener('click', () => setChatReplyTarget(null));
    }

    function renderPinnedStrip() {
        const strip = document.getElementById('tm-chat-pinned');
        if (!strip) return;
        if (!CHAT_PIN_ENABLED) {
            strip.hidden = true;
            strip.innerHTML = '';
            return;
        }
        const room = getChatRoom();
        const pinned = chatMessages
            .filter((m) => isMessagePinned(m) && !isChatMessageDeleted(m) && String(m.room || room) === room)
            .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
        if (!pinned.length) {
            strip.hidden = true;
            strip.innerHTML = '';
            return;
        }
        const top = pinned[0];
        strip.hidden = false;
        strip.innerHTML = `<div class="tm-chat-pinned-inner" data-id="${escapeHtml(top.id)}">
            <span class="tm-chat-pinned-icon" aria-hidden="true">📌</span>
            <span class="tm-chat-pinned-body">
                <strong>${escapeHtml(top.displayName || '?')}</strong>
                ${escapeHtml(chatMessagePreviewText(top))}
            </span>
            <button type="button" class="tm-chat-pinned-jump" data-id="${escapeHtml(top.id)}" title="Μετάβαση">↓</button>
        </div>`;
    }

    function loadLocalChatPins() {
        try {
            const raw = GM_getValue(CHAT_LOCAL_PINS_KEY, '[]');
            const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
            chatLocalPinIds = new Set(Array.isArray(arr) ? arr.map(String) : []);
        } catch (_) {
            chatLocalPinIds = new Set();
        }
    }

    function saveLocalChatPins() {
        try {
            GM_setValue(CHAT_LOCAL_PINS_KEY, JSON.stringify([...chatLocalPinIds].slice(-80)));
        } catch (_) { /* ignore */ }
    }

    function loadLocalChatReplies() {
        try {
            const raw = GM_getValue(CHAT_LOCAL_REPLIES_KEY, '{}');
            const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
            chatLocalReplies = (obj && typeof obj === 'object') ? obj : Object.create(null);
        } catch (_) {
            chatLocalReplies = Object.create(null);
        }
    }

    function saveLocalChatReplies() {
        try {
            const ids = Object.keys(chatLocalReplies);
            if (ids.length > 120) {
                ids.slice(0, ids.length - 100).forEach((id) => { delete chatLocalReplies[id]; });
            }
            GM_setValue(CHAT_LOCAL_REPLIES_KEY, JSON.stringify(chatLocalReplies));
        } catch (_) { /* ignore */ }
    }

    function rememberLocalReply(messageId, meta) {
        const id = String(messageId || '');
        if (!id || !meta?.replyTo) return;
        chatLocalReplies[id] = {
            replyTo: String(meta.replyTo),
            replyPreview: String(meta.replyPreview || '').slice(0, 120),
            replyName: String(meta.replyName || '').slice(0, 64),
        };
        saveLocalChatReplies();
    }

    function applyLocalReplyToMapped(mapped) {
        if (!mapped?.id) return mapped;
        if (mapped.replyTo) {
            // Server has it — drop local copy if present
            if (chatLocalReplies[mapped.id]) {
                delete chatLocalReplies[mapped.id];
                saveLocalChatReplies();
            }
            return mapped;
        }
        const local = chatLocalReplies[mapped.id];
        if (!local?.replyTo) return mapped;
        mapped.replyTo = local.replyTo;
        mapped.replyPreview = local.replyPreview || mapped.replyPreview || '';
        mapped.replyName = local.replyName || mapped.replyName || '';
        return mapped;
    }

    function loadLocalChatReactions() {
        try {
            const raw = GM_getValue(CHAT_LOCAL_REACTIONS_KEY, '{}');
            const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
            chatLocalReactions = (obj && typeof obj === 'object') ? obj : Object.create(null);
        } catch (_) {
            chatLocalReactions = Object.create(null);
        }
    }

    function saveLocalChatReactions() {
        try {
            const ids = Object.keys(chatLocalReactions);
            if (ids.length > 150) {
                ids.slice(0, ids.length - 120).forEach((id) => { delete chatLocalReactions[id]; });
            }
            GM_setValue(CHAT_LOCAL_REACTIONS_KEY, JSON.stringify(chatLocalReactions));
        } catch (_) { /* ignore */ }
    }

    function normalizeReactionsMap(raw) {
        const out = Object.create(null);
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
        CHAT_REACTION_EMOJIS.forEach((emoji) => {
            const arr = raw[emoji];
            if (!Array.isArray(arr)) return;
            const names = [...new Set(arr.map((n) => String(n || '').trim()).filter(Boolean))].slice(0, 40);
            if (names.length) out[emoji] = names;
        });
        return out;
    }

    function parseReactionsField(raw) {
        if (!raw) return Object.create(null);
        if (typeof raw === 'object' && !Array.isArray(raw)) return normalizeReactionsMap(raw);
        if (typeof raw === 'string') {
            const s = raw.trim();
            if (!s) return Object.create(null);
            try {
                return normalizeReactionsMap(JSON.parse(s));
            } catch (_) {
                return Object.create(null);
            }
        }
        return Object.create(null);
    }

    function serializeReactionsMap(map) {
        return JSON.stringify(normalizeReactionsMap(map));
    }

    function reactionsEqual(a, b) {
        return serializeReactionsMap(a || {}) === serializeReactionsMap(b || {});
    }

    function getMessageReactions(m) {
        if (!m) return Object.create(null);
        const fromMsg = normalizeReactionsMap(m.reactions || {});
        if (Object.keys(fromMsg).length) return fromMsg;
        const local = chatLocalReactions[String(m.id || '')];
        return normalizeReactionsMap(local || {});
    }

    function rememberLocalReactions(messageId, map) {
        const id = String(messageId || '');
        if (!id) return;
        const normalized = normalizeReactionsMap(map);
        if (!Object.keys(normalized).length) delete chatLocalReactions[id];
        else chatLocalReactions[id] = normalized;
        saveLocalChatReactions();
    }

    function applyLocalReactionsToMapped(mapped) {
        if (!mapped?.id) return mapped;
        const server = normalizeReactionsMap(mapped.reactions || {});
        if (Object.keys(server).length) {
            if (chatLocalReactions[mapped.id]) {
                delete chatLocalReactions[mapped.id];
                saveLocalChatReactions();
            }
            mapped.reactions = server;
            return mapped;
        }
        const local = chatLocalReactions[mapped.id];
        if (local) mapped.reactions = normalizeReactionsMap(local);
        else mapped.reactions = server;
        return mapped;
    }

    function formatChatReactionsHtml(m) {
        const reactions = getMessageReactions(m);
        const me = getDisplayName();
        const chips = CHAT_REACTION_EMOJIS.map((emoji) => {
            const names = reactions[emoji] || [];
            if (!names.length) return '';
            const mine = me && names.some((n) => n === me);
            const title = names.join(', ');
            return `<button type="button" class="tm-chat-react-chip${mine ? ' is-mine' : ''}" data-react="${escapeHtml(emoji)}" title="${escapeHtml(title)}" aria-label="${escapeHtml(`${emoji} ${names.length}`)}">${emoji}<span>${names.length}</span></button>`;
        }).filter(Boolean);
        if (!chips.length) return '';
        return `<div class="tm-chat-msg-reactions">${chips.join('')}</div>`;
    }

    function isMessagePinned(m) {
        if (!m?.id) return false;
        if (m.pinned) return true;
        return chatLocalPinIds.has(String(m.id));
    }

    function setLocalMessagePinned(messageId, pinned) {
        const id = String(messageId || '');
        if (!id) return;
        if (pinned) chatLocalPinIds.add(id);
        else chatLocalPinIds.delete(id);
        saveLocalChatPins();
    }

    function formatChatPresenceTime(value) {
        const d = value instanceof Date ? value : new Date(value || Date.now());
        if (Number.isNaN(d.getTime())) return new Date().toISOString();
        // PocketBase date fields accept RFC3339 / ISO
        return d.toISOString();
    }

    function collectRecentActivePresence() {
        const cutoff = Date.now() - 5 * 60 * 1000;
        const byName = new Map();
        chatMessages.forEach((m) => {
            if (!m?.displayName || isChatMessageDeleted(m)) return;
            const t = new Date(m.created || 0).getTime();
            if (!t || t < cutoff) return;
            const prev = byName.get(m.displayName) || 0;
            if (t > prev) byName.set(m.displayName, t);
        });
        const me = getDisplayName();
        if (me && (chatStatus === 'online' || chatStatus === 'connecting')) {
            byName.set(me, Date.now());
        }
        return Array.from(byName.entries()).map(([displayName, ts]) => ({
            displayName,
            lastSeen: new Date(ts).toISOString(),
            _fromMessages: true,
        }));
    }

    function getOnlinePresenceList() {
        const cutoff = Date.now() - 90 * 1000;
        const byName = new Map();
        (chatPresenceList || []).forEach((p) => {
            const name = String(p?.displayName || '').trim();
            if (!name) return;
            const t = new Date(p.lastSeen || 0).getTime();
            if (!t || t < cutoff) return;
            byName.set(name, p);
        });
        // Fallback/merge: recent message authors (works without presence collection)
        collectRecentActivePresence().forEach((p) => {
            if (!byName.has(p.displayName)) byName.set(p.displayName, p);
        });
        return Array.from(byName.values()).sort((a, b) => (
            new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0)
        ));
    }

    function resolvePresenceAvatar(p) {
        const userId = String(p?.userId || p?.pbUserId || '').trim();
        const fromPresence = normalizePbFileName(p?.avatar);
        if (userId && fromPresence) {
            return { userId, filename: fromPresence };
        }
        if (userId) {
            const byId = chatAvatarDirectory.get(`id:${userId}`);
            if (byId?.filename) return byId;
        }
        const name = String(p?.displayName || '').trim();
        if (name) {
            const hit = resolveChatMessageAvatar({
                displayName: name,
                profileId: p?.profileId,
                pbUserId: userId,
                avatar: fromPresence,
            });
            if (hit) return hit;
        }
        return null;
    }

    function formatPresenceAvatarHtml(p) {
        const name = String(p?.displayName || '?').trim() || '?';
        const letter = chatAvatarLetter(name);
        const resolved = resolvePresenceAvatar(p);
        const store = String(p?.store || '').trim();
        const title = store ? `${name} · ${store}` : name;
        if (resolved?.userId && resolved?.filename) {
            const url = getChatUserAvatarUrl(resolved.userId, resolved.filename);
            return `<span class="tm-chat-presence-avatar is-photo tm-chat-avatar-previewable" title="${escapeHtml(title)} · προεπισκόπηση" role="button" tabindex="0" data-letter="${escapeHtml(letter)}" data-avatar-url="${escapeHtml(url)}" data-avatar-name="${escapeHtml(name)}"><img src="${escapeHtml(url)}" alt="" loading="lazy" onerror="var p=this.parentElement;if(p){p.classList.remove('is-photo','tm-chat-avatar-previewable');p.removeAttribute('role');p.removeAttribute('tabindex');p.textContent=p.getAttribute('data-letter')||'?';}"></span>`;
        }
        return `<span class="tm-chat-presence-avatar" title="${escapeHtml(title)}">${escapeHtml(letter)}</span>`;
    }

    function getTypingPresenceList() {
        const now = Date.now();
        const me = getDisplayName();
        const names = [];
        const seen = new Set();
        (chatPresenceList || []).forEach((p) => {
            const name = String(p?.displayName || '').trim();
            if (!name || (me && name === me)) return;
            const until = new Date(p.typingUntil || 0).getTime();
            if (!until || until < now - 500) return;
            if (seen.has(name)) return;
            seen.add(name);
            names.push(name);
        });
        return names;
    }

    function renderTypingUi() {
        const el = document.getElementById('tm-chat-typing');
        if (!el) return;
        if (chatTypingUnsupported) {
            el.hidden = true;
            el.textContent = '';
            return;
        }
        const names = getTypingPresenceList();
        if (!names.length) {
            el.hidden = true;
            el.textContent = '';
            return;
        }
        el.hidden = false;
        const label = names.length === 1
            ? `${names[0]} πληκτρολογεί…`
            : (names.length === 2
                ? `${names[0]} και ${names[1]} πληκτρολογούν…`
                : `${names.slice(0, 2).join(', ')} +${names.length - 2} πληκτρολογούν…`);
        el.innerHTML = `<span class="tm-chat-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>${escapeHtml(label)}`;
    }

    function renderPresenceUi() {
        const el = document.getElementById('tm-chat-presence');
        if (!el) return;
        const online = getOnlinePresenceList();
        renderTypingUi();

        if (chatPresenceUnsupported && !online.length) {
            el.hidden = false;
            el.innerHTML = `<span class="tm-chat-presence-dot is-warn" aria-hidden="true"></span>Online: — <span class="tm-chat-presence-hint">(πρόσθεσε collection presence)</span>`;
            return;
        }

        if (!online.length) {
            el.hidden = false;
            el.innerHTML = `<span class="tm-chat-presence-dot is-idle" aria-hidden="true"></span>Online: —`;
            return;
        }

        el.hidden = false;
        const faces = online.slice(0, 10).map((p) => formatPresenceAvatarHtml(p)).join('');
        const more = online.length > 10
            ? `<span class="tm-chat-presence-more" title="${escapeHtml(online.slice(10).map((p) => p.displayName).join(', '))}">+${online.length - 10}</span>`
            : '';
        const names = online.slice(0, 4).map((p) => p.displayName).join(', ');
        const namesMore = online.length > 4 ? ` +${online.length - 4}` : '';
        el.innerHTML = `<div class="tm-chat-presence-row">
            <span class="tm-chat-presence-dot" aria-hidden="true"></span>
            <div class="tm-chat-presence-faces">${faces}${more}</div>
            <div class="tm-chat-presence-meta"><strong>${online.length}</strong> online<span class="tm-chat-presence-names"> · ${escapeHtml(names)}${escapeHtml(namesMore)}</span></div>
        </div>`;
    }

    function peersHaveReadMessage(m) {
        if (!m?.created) return false;
        const created = new Date(m.created).getTime();
        if (!created) return false;
        const me = getDisplayName();
        return (chatPresenceList || []).some((p) => {
            if (!p?.lastReadAt) return false;
            if (me && String(p.displayName || '') === me) return false;
            return new Date(p.lastReadAt).getTime() >= created;
        });
    }

    function mapChatRecord(rec) {
        const mapped = {
            id: rec.id,
            text: rec.text,
            displayName: rec.displayName,
            store: String(rec.store || '').trim(),
            profileId: rec.profileId || '',
            room: rec.room || getChatRoom(),
            created: rec.created,
            updated: rec.updated || '',
            attachment: normalizeChatAttachmentName(rec),
            pbUserId: String(rec.pbUserId || '').trim(),
            avatar: normalizePbFileName(rec.avatar),
            replyTo: String(rec.replyTo || '').trim(),
            replyPreview: String(rec.replyPreview || '').trim(),
            replyName: String(rec.replyName || '').trim(),
            pinned: !!rec.pinned,
            deleted: !!rec.deleted || isChatDeletedTombstoneText(rec.text),
            deletedBy: String(rec.deletedBy || '').trim(),
            edited: !!rec.edited,
            reactions: parseReactionsField(rec.reactions),
        };
        return applyLocalReactionsToMapped(applyLocalReplyToMapped(mapped));
    }

    function isChatDeletedTombstoneText(text) {
        return /^message deleted by\s+.+/i.test(String(text || '').trim());
    }

    function parseChatDeletedByFromText(text) {
        const m = String(text || '').trim().match(/^message deleted by\s+(.+)$/i);
        return m?.[1] ? String(m[1]).trim() : '';
    }

    function getChatDeletedByName(m) {
        if (!m) return '?';
        return String(m.deletedBy || '').trim()
            || parseChatDeletedByFromText(m.text)
            || String(m.displayName || '').trim()
            || '?';
    }

    function formatChatDeletedLabel(m) {
        return `message deleted by ${getChatDeletedByName(m)}`;
    }

    function isChatMessageDeleted(m) {
        return !!(m && (m.deleted || isChatDeletedTombstoneText(m.text)));
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

    /** Links, @mentions, and repair numbers → clickable HTML. */
    function formatChatMessageHtml(text) {
        const raw = String(text || '');
        if (!raw) return '';
        const tokenRe = /(?:https?:\/\/|www\.)[^\s<>"']+|@[\p{L}\p{N}_.-]{2,40}|#\d{4,10}\b|\b\d{5,8}\b/giu;
        let out = '';
        let last = 0;
        let match;
        const me = getDisplayName();
        const meSlug = greekToLatinSlug(me);
        while ((match = tokenRe.exec(raw)) !== null) {
            out += escapeHtml(raw.slice(last, match.index));
            const token = match[0];
            if (/^(?:https?:\/\/|www\.)/i.test(token)) {
                let url = token;
                let trailing = '';
                while (/[).,;:!?\]]$/.test(url)) {
                    trailing = url.slice(-1) + trailing;
                    url = url.slice(0, -1);
                }
                const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                out += `<a class="tm-chat-msg-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>${escapeHtml(trailing)}`;
            } else if (token.startsWith('@')) {
                const name = token.slice(1);
                const isMe = (me && name.toLowerCase() === me.toLowerCase())
                    || (meSlug && greekToLatinSlug(name) === meSlug);
                out += `<span class="tm-chat-mention${isMe ? ' is-me' : ''}">${escapeHtml(token)}</span>`;
            } else {
                const num = token.replace(/^#/, '');
                const href = `${CHAT_REPAIR_SEARCH_URL}${encodeURIComponent(num)}`;
                out += `<a class="tm-chat-msg-link tm-chat-repair-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" title="Αναζήτηση επισκευής">${escapeHtml(token)}</a>`;
            }
            last = match.index + match[0].length;
        }
        out += escapeHtml(raw.slice(last));
        return out;
    }

    function extractChatRepairNumbers(text) {
        const nums = [];
        const seen = new Set();
        const re = /#(\d{4,10})\b|\b(\d{5,8})\b/g;
        let m;
        const raw = String(text || '');
        while ((m = re.exec(raw)) !== null) {
            const num = String(m[1] || m[2] || '').trim();
            if (!num || seen.has(num)) continue;
            seen.add(num);
            nums.push(num);
            if (nums.length >= 3) break;
        }
        return nums;
    }

    function formatChatRepairCardsHtml(text) {
        const nums = extractChatRepairNumbers(text);
        if (!nums.length) return '';
        return `<div class="tm-chat-repair-cards">${nums.map((num) => {
            const cached = chatRepairCardCache.get(num);
            if (cached?.ok === false) {
                return `<a class="tm-chat-repair-card is-miss" href="${escapeHtml(CHAT_REPAIR_SEARCH_URL + encodeURIComponent(num))}" target="_blank" rel="noopener noreferrer" data-repair="${escapeHtml(num)}">
                    <span class="tm-chat-repair-card-id">#${escapeHtml(num)}</span>
                    <span class="tm-chat-repair-card-miss">Δεν βρέθηκε</span>
                </a>`;
            }
            if (cached?.ok) {
                return renderChatRepairCardHtml(num, cached);
            }
            return `<div class="tm-chat-repair-card is-loading" data-repair="${escapeHtml(num)}" aria-busy="true">
                <span class="tm-chat-repair-card-id">#${escapeHtml(num)}</span>
                <span class="tm-chat-repair-card-miss">Φόρτωση…</span>
            </div>`;
        }).join('')}</div>`;
    }

    function renderChatRepairCardHtml(num, data) {
        const href = data.link || `${CHAT_REPAIR_SEARCH_URL}${encodeURIComponent(num)}`;
        const status = data.status || '—';
        const tech = data.tech || '—';
        const store = data.store || '—';
        const device = data.device ? `<span class="tm-chat-repair-card-device">${escapeHtml(data.device)}</span>` : '';
        return `<a class="tm-chat-repair-card" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" data-repair="${escapeHtml(num)}" title="Άνοιγμα επισκευής">
            <span class="tm-chat-repair-card-id">#${escapeHtml(data.number || num)}</span>
            ${device}
            <span class="tm-chat-repair-card-grid">
                <span><em>Κατάσταση</em>${escapeHtml(status)}</span>
                <span><em>Τεχνικός</em>${escapeHtml(tech)}</span>
                <span><em>Κατάστημα</em>${escapeHtml(store)}</span>
            </span>
        </a>`;
    }

    function parseChatRepairCardFromDoc(doc, repairId, pageUrl) {
        const target = String(repairId || '').trim();
        const rows = doc.querySelectorAll('tbody tr[id^="gridRow"]');
        const gridTable = doc.querySelector('table.rnr-b-grid, table.rnr-gridtable, table.hoverable');
        const headers = gridTable
            ? Array.from(gridTable.querySelectorAll('thead th')).map((th) => String(th.innerText || '').trim())
            : [];
        const idx = {
            num: headers.findIndex((h) => /^Αρ\.?/i.test(h) || h.includes('Αρ.')),
            status: headers.findIndex((h) => /κατάσταση|status/i.test(h)),
            tech: headers.findIndex((h) => /τεχνικ|technician|\btech\b/i.test(h)),
            store: headers.findIndex((h) => /κατάστημα|store|shop/i.test(h)),
            device: headers.findIndex((h) => /συσκευή|device|model/i.test(h)),
        };
        const cellText = (row, i) => {
            if (i < 0 || !row?.cells?.[i]) return '';
            return String(row.cells[i].innerText || '').replace(/\s+/g, ' ').trim();
        };
        const findLink = (row) => {
            const href = row.dataset.href || row.querySelector('td[data-href]')?.dataset.href;
            if (href) {
                try { return new URL(href, pageUrl).href; } catch (_) { return href; }
            }
            const a = row.querySelector('a[href*="service_edit"]');
            return a ? a.href : '';
        };
        let best = null;
        for (const row of rows) {
            const numText = idx.num >= 0 ? cellText(row, idx.num) : '';
            const blob = `${numText} ${row.innerText || ''}`;
            const matches = blob.includes(target)
                || new RegExp(`(?:^|\\D)${target}(?:\\D|$)`).test(blob.replace(/\s/g, ''));
            if (!matches && rows.length !== 1) continue;
            best = {
                ok: true,
                number: numText || target,
                status: cellText(row, idx.status) || '—',
                tech: cellText(row, idx.tech) || '—',
                store: cellText(row, idx.store) || '—',
                device: cellText(row, idx.device) || '',
                link: findLink(row) || `${CHAT_REPAIR_SEARCH_URL}${encodeURIComponent(target)}`,
            };
            if (matches) break;
        }
        return best;
    }

    function fetchChatRepairCard(repairId) {
        const num = String(repairId || '').trim();
        if (!num) return Promise.resolve(null);
        if (chatRepairCardCache.has(num)) return Promise.resolve(chatRepairCardCache.get(num));
        if (chatRepairCardInflight.has(num)) return chatRepairCardInflight.get(num);

        const searchUrl = `${CHAT_REPAIR_LIST_URL}?qs=${encodeURIComponent(num)}&statusid=all&pagesize=-1&menuItemId=1`;
        const job = new Promise((resolve) => {
            const finish = (data) => {
                chatRepairCardCache.set(num, data);
                chatRepairCardInflight.delete(num);
                resolve(data);
            };
            const handleHtml = (html, finalUrl) => {
                try {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const parsed = parseChatRepairCardFromDoc(doc, num, finalUrl || searchUrl);
                    finish(parsed || { ok: false });
                } catch (_) {
                    finish({ ok: false });
                }
            };
            const xhr = (typeof GM_xmlhttpRequest === 'function')
                ? GM_xmlhttpRequest
                : (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function' ? GM.xmlHttpRequest : null);
            if (xhr) {
                xhr({
                    method: 'GET',
                    url: searchUrl,
                    timeout: 15000,
                    onload(res) { handleHtml(res.responseText, res.finalUrl); },
                    onerror() { finish({ ok: false }); },
                    ontimeout() { finish({ ok: false }); },
                });
            } else {
                fetch(searchUrl)
                    .then((r) => r.text())
                    .then((html) => handleHtml(html, searchUrl))
                    .catch(() => finish({ ok: false }));
            }
        });
        chatRepairCardInflight.set(num, job);
        return job;
    }

    function hydrateChatRepairCards(root) {
        const scope = root || document.getElementById('tm-chat-messages');
        if (!scope) return;
        scope.querySelectorAll('.tm-chat-repair-card[data-repair].is-loading, .tm-chat-repair-card.is-loading').forEach((el) => {
            const num = el.getAttribute('data-repair');
            if (!num || el.dataset.tmHydrating === '1') return;
            el.dataset.tmHydrating = '1';
            fetchChatRepairCard(num).then((data) => {
                const next = (data && data.ok)
                    ? renderChatRepairCardHtml(num, data)
                    : `<a class="tm-chat-repair-card is-miss" href="${escapeHtml(CHAT_REPAIR_SEARCH_URL + encodeURIComponent(num))}" target="_blank" rel="noopener noreferrer" data-repair="${escapeHtml(num)}">
                        <span class="tm-chat-repair-card-id">#${escapeHtml(num)}</span>
                        <span class="tm-chat-repair-card-miss">Άνοιγμα αναζήτησης</span>
                    </a>`;
                const wrap = document.createElement('div');
                wrap.innerHTML = next;
                const node = wrap.firstElementChild;
                if (node && el.parentNode) el.replaceWith(node);
            }).catch(() => {
                el.classList.remove('is-loading');
                el.classList.add('is-miss');
                el.dataset.tmHydrating = '0';
            });
        });
    }

    function startTypingUiTicker() {
        stopTypingUiTicker();
        chatTypingUiTimer = window.setInterval(() => {
            if (chatPanelOpen) renderTypingUi();
        }, 1000);
    }

    function stopTypingUiTicker() {
        if (chatTypingUiTimer) {
            window.clearInterval(chatTypingUiTimer);
            chatTypingUiTimer = null;
        }
    }

    function scheduleOwnTypingPulse(STORAGE_KEYS) {
        if (chatTypingUnsupported || chatPresenceUnsupported) return;
        chatOwnTypingUntil = Date.now() + CHAT_TYPING_TTL_MS;
        window.clearTimeout(chatTypingIdleTimer);
        chatTypingIdleTimer = window.setTimeout(() => {
            chatOwnTypingUntil = 0;
            pushOwnTypingPresence(STORAGE_KEYS).catch(() => {});
        }, CHAT_TYPING_TTL_MS);
        window.clearTimeout(chatTypingPushTimer);
        chatTypingPushTimer = window.setTimeout(() => {
            pushOwnTypingPresence(STORAGE_KEYS).catch(() => {});
        }, 400);
    }

    function clearOwnTypingPulse(STORAGE_KEYS) {
        window.clearTimeout(chatTypingIdleTimer);
        window.clearTimeout(chatTypingPushTimer);
        if (!chatOwnTypingUntil) return;
        chatOwnTypingUntil = 0;
        pushOwnTypingPresence(STORAGE_KEYS).catch(() => {});
    }

    async function pushOwnTypingPresence(STORAGE_KEYS) {
        if (chatTypingUnsupported || chatPresenceUnsupported) return false;
        if (!chatOwnPresenceRecordId) {
            return upsertOwnPresence(STORAGE_KEYS, { markRead: chatPanelOpen });
        }
        try {
            const token = await ensureAuth(STORAGE_KEYS);
            const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
            const payload = {
                lastSeen: formatChatPresenceTime(Date.now()),
            };
            if (chatOwnTypingUntil > Date.now()) {
                payload.typingUntil = formatChatPresenceTime(chatOwnTypingUntil);
            } else {
                // Expire typing for peers (empty string often fails Date validation)
                payload.typingUntil = formatChatPresenceTime(Date.now() - 60 * 1000);
            }
            const result = await chatRequestJson({
                method: 'PATCH',
                url: `${base}/api/collections/presence/records/${encodeURIComponent(chatOwnPresenceRecordId)}`,
                headers: { Authorization: token, 'Content-Type': 'application/json' },
                data: JSON.stringify(payload),
                timeout: 8000,
            });
            if (result.status >= 400 && /typingUntil|unknown field/i.test(presenceErrBlob(result))) {
                chatTypingUnsupported = true;
                renderTypingUi();
                return false;
            }
            if (result.status >= 200 && result.status < 300 && result.body) {
                const others = (chatPresenceList || []).filter((p) => String(p.userId || '') !== chatSelfPbUserId);
                chatPresenceList = [result.body, ...others];
                renderTypingUi();
            }
            return result.status >= 200 && result.status < 300;
        } catch (_) {
            return false;
        }
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

    function normalizePbFileName(value) {
        if (Array.isArray(value)) return String(value[0] || '').trim();
        return String(value || '').trim();
    }

    function isAllowedChatAvatarFile(file) {
        if (!file) return { ok: false, reason: 'empty', message: 'Δεν επιλέχθηκε αρχείο' };
        if (file.size > CHAT_AVATAR_MAX_BYTES) {
            return { ok: false, reason: 'size', message: `Μέγιστο μέγεθος ${formatChatFileSize(CHAT_AVATAR_MAX_BYTES)}` };
        }
        const type = String(file.type || '').toLowerCase();
        const name = String(file.name || '');
        if (!(CHAT_AVATAR_MIME.includes(type) || CHAT_AVATAR_EXT_RE.test(name))) {
            return { ok: false, reason: 'type', message: 'Μόνο εικόνες (jpg/png/webp/gif)' };
        }
        return { ok: true };
    }

    function rememberChatSelfAvatar(record) {
        if (!record || !record.id) return;
        chatSelfPbUserId = String(record.id);
        chatSelfAvatarFile = normalizePbFileName(record.avatar);
        try {
            GM_setValue(CHAT_AVATAR_META_KEY, JSON.stringify({
                userId: chatSelfPbUserId,
                filename: chatSelfAvatarFile,
                savedAt: Date.now(),
            }));
        } catch (_) { /* ignore */ }
        rememberChatAvatarEntry({
            userId: chatSelfPbUserId,
            filename: chatSelfAvatarFile,
            displayName: getDisplayName(),
            profileId: getProfileId(),
            email: suggestOfficeChatEmail(),
            username: getLoginNameSlug(),
        });
    }

    function loadCachedSelfAvatar() {
        try {
            const raw = GM_getValue(CHAT_AVATAR_META_KEY, '');
            if (!raw) return;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (parsed?.userId) chatSelfPbUserId = String(parsed.userId);
            chatSelfAvatarFile = String(parsed?.filename || '').trim();
            if (chatSelfPbUserId && chatSelfAvatarFile) {
                rememberChatAvatarEntry({
                    userId: chatSelfPbUserId,
                    filename: chatSelfAvatarFile,
                    displayName: getDisplayName(),
                    profileId: getProfileId(),
                    email: suggestOfficeChatEmail(),
                    username: getLoginNameSlug(),
                });
            }
        } catch (_) { /* ignore */ }
    }

    function chatAvatarDirKeys({ userId, displayName, profileId, email, username } = {}) {
        const keys = [];
        if (userId) keys.push(`id:${userId}`);
        if (profileId) keys.push(`profile:${String(profileId).trim()}`);
        const name = String(displayName || '').trim();
        if (name) keys.push(`name:${name.toLowerCase()}`);
        const slugFromName = name ? greekToLatinSlug(name) : '';
        const slugFromUser = String(username || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
        const slugFromEmail = String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '');
        [slugFromUser, slugFromEmail, slugFromName].forEach((slug) => {
            if (slug && slug.length >= 2) keys.push(`slug:${slug}`);
        });
        return keys;
    }

    function rememberChatAvatarEntry(entry) {
        const userId = String(entry?.userId || '').trim();
        if (!userId) return;
        const filename = normalizePbFileName(entry?.filename);
        const name = String(entry?.displayName || '').trim();
        if (name) chatUserIdByDisplayName.set(name.toLowerCase(), userId);
        const keys = chatAvatarDirKeys(entry);
        if (!filename) {
            keys.forEach((k) => {
                const cur = chatAvatarDirectory.get(k);
                if (cur && cur.userId === userId) chatAvatarDirectory.delete(k);
            });
            return;
        }
        const value = { userId, filename };
        keys.forEach((k) => chatAvatarDirectory.set(k, value));
    }

    function resolveChatMessageAvatar(m) {
        const fromMsgUser = String(m?.pbUserId || '').trim();
        const fromMsgFile = normalizePbFileName(m?.avatar);
        if (fromMsgUser && fromMsgFile) {
            rememberChatAvatarEntry({
                userId: fromMsgUser,
                filename: fromMsgFile,
                displayName: m?.displayName,
                profileId: m?.profileId,
            });
            return { userId: fromMsgUser, filename: fromMsgFile };
        }

        const me = getDisplayName();
        const mine = me && String(m?.displayName || '') === me;
        if (mine && chatSelfPbUserId && chatSelfAvatarFile) {
            return { userId: chatSelfPbUserId, filename: chatSelfAvatarFile };
        }

        const tries = [];
        if (m?.profileId) tries.push(`profile:${String(m.profileId).trim()}`);
        const name = String(m?.displayName || '').trim();
        if (name) {
            tries.push(`name:${name.toLowerCase()}`);
            const slug = greekToLatinSlug(name);
            if (slug) tries.push(`slug:${slug}`);
        }
        for (let i = 0; i < tries.length; i++) {
            const hit = chatAvatarDirectory.get(tries[i]);
            if (hit?.userId && hit?.filename) return hit;
        }
        if (name) {
            const uid = chatUserIdByDisplayName.get(name.toLowerCase());
            if (uid) {
                const byId = chatAvatarDirectory.get(`id:${uid}`);
                if (byId?.userId && byId?.filename) return byId;
            }
        }
        return null;
    }

    function getChatUserAvatarUrl(userId, filename, thumb) {
        if (!userId || !filename) return '';
        const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
        let url = `${base}/api/files/users/${encodeURIComponent(userId)}/${encodeURIComponent(filename)}`;
        const params = [];
        if (thumb) params.push(`thumb=${encodeURIComponent(thumb)}`);
        if (chatAuthToken) params.push(`token=${encodeURIComponent(chatAuthToken)}`);
        if (params.length) url += `?${params.join('&')}`;
        return url;
    }

    function getOfficeChatAvatarInfo() {
        loadCachedSelfAvatar();
        const filename = chatSelfAvatarFile;
        const userId = chatSelfPbUserId;
        return {
            userId,
            filename,
            url: filename && userId ? getChatUserAvatarUrl(userId, filename) : '',
        };
    }

    function formatChatAvatarHtml(m) {
        const name = m.displayName || '?';
        const letter = chatAvatarLetter(name);
        const resolved = resolveChatMessageAvatar(m);
        if (resolved?.userId && resolved?.filename) {
            const url = getChatUserAvatarUrl(resolved.userId, resolved.filename);
            return `<div class="tm-chat-msg-avatar is-photo tm-chat-avatar-previewable" role="button" tabindex="0" title="Προεπισκόπηση φωτογραφίας" data-letter="${escapeHtml(letter)}" data-avatar-url="${escapeHtml(url)}" data-avatar-name="${escapeHtml(name)}"><img src="${escapeHtml(url)}" alt="" loading="lazy" onerror="var p=this.parentElement;if(p){p.classList.remove('is-photo','tm-chat-avatar-previewable');p.removeAttribute('role');p.removeAttribute('tabindex');p.textContent=p.getAttribute('data-letter')||'?';}"></div>`;
        }
        return `<div class="tm-chat-msg-avatar" aria-hidden="true">${escapeHtml(letter)}</div>`;
    }

    function refreshChatMessagesAvatarUi() {
        if (!document.getElementById('tm-chat-messages')) return;
        chatMessagesRenderKey = '';
        renderMessages({ force: true });
    }

    async function refreshChatAvatarDirectory(STORAGE_KEYS) {
        try {
            const token = await ensureAuth(STORAGE_KEYS);
            const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
            const headers = { Authorization: token };
            let result = await chatRequestJson({
                method: 'GET',
                url: `${base}/api/collections/users/records?perPage=200&fields=id,email,username,avatar,name`,
                headers,
                timeout: 15000,
            });
            if (result.status >= 400) {
                result = await chatRequestJson({
                    method: 'GET',
                    url: `${base}/api/collections/users/records?perPage=200`,
                    headers,
                    timeout: 15000,
                });
            }
            const items = result.body?.items;
            if (result.status < 200 || result.status >= 300 || !Array.isArray(items)) return false;
            items.forEach((rec) => {
                const filename = normalizePbFileName(rec?.avatar);
                if (!rec?.id || !filename) return;
                rememberChatAvatarEntry({
                    userId: rec.id,
                    filename,
                    email: rec.email,
                    username: rec.username,
                    displayName: rec.name || rec.displayName,
                });
            });
            linkPresenceToAvatarDirectory();
            return true;
        } catch (_) {
            return false;
        }
    }

    function chatMessagePreviewText(m) {
        if (isChatMessageDeleted(m)) return formatChatDeletedLabel(m).slice(0, 80);
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
            sound: GM_getValue(keys.sound, true) !== false,
            quietHours: GM_getValue(keys.quietHours, true) !== false,
            workStart: String(GM_getValue(keys.workStart, CHAT_DEFAULT_WORK_START) || CHAT_DEFAULT_WORK_START),
            workEnd: String(GM_getValue(keys.workEnd, CHAT_DEFAULT_WORK_END) || CHAT_DEFAULT_WORK_END),
        };
    }

    function parseChatHm(value, fallbackHm) {
        const m = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
        if (!m) {
            const fb = String(fallbackHm || '09:00').match(/^(\d{1,2}):(\d{2})$/);
            return { h: Number(fb?.[1] || 9), m: Number(fb?.[2] || 0) };
        }
        const h = Math.min(23, Math.max(0, Number(m[1])));
        const min = Math.min(59, Math.max(0, Number(m[2])));
        return { h, m: min };
    }

    function isQuietHoursActive(settings) {
        const s = settings || getChatSettings(chatStorageKeys || window.STORAGE_KEYS);
        if (!s || s.quietHours === false) return false;
        const start = parseChatHm(s.workStart, CHAT_DEFAULT_WORK_START);
        const end = parseChatHm(s.workEnd, CHAT_DEFAULT_WORK_END);
        const now = new Date();
        const mins = now.getHours() * 60 + now.getMinutes();
        const a = start.h * 60 + start.m;
        const b = end.h * 60 + end.m;
        if (a === b) return false;
        if (a < b) return mins < a || mins >= b;
        return mins < a && mins >= b;
    }

    /** Manual mute or quiet hours (outside work window). */
    function isChatNotifyMuted() {
        return !!(chatMuted || isQuietHoursActive());
    }

    function loadChatDraft(STORAGE_KEYS) {
        try {
            const keys = chatKeys(STORAGE_KEYS);
            return String(GM_getValue(keys.draft, '') || '');
        } catch (_) {
            return '';
        }
    }

    function saveChatDraft(STORAGE_KEYS, text) {
        try {
            const keys = chatKeys(STORAGE_KEYS);
            const value = String(text || '').slice(0, CHAT_MAX_LEN);
            GM_setValue(keys.draft, value);
        } catch (_) { /* ignore */ }
    }

    function clearChatDraft(STORAGE_KEYS) {
        saveChatDraft(STORAGE_KEYS, '');
    }

    function restoreChatDraftToInput(STORAGE_KEYS) {
        const input = document.getElementById('tm-chat-input');
        if (!input) return;
        if (String(input.value || '').trim()) return;
        const draft = loadChatDraft(STORAGE_KEYS);
        if (draft) input.value = draft;
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

    /** Connected store button (primary), then login capture / #iProfileID. */
    function detectLoginStoreName() {
        // 1) Connected store from footer button (survives footer wipe via GM)
        try {
            if (typeof window.captureConnectedStoreFromPage === 'function') {
                const live = String(window.captureConnectedStoreFromPage(document) || '').trim();
                if (live) return live.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            const connected = String(GM_getValue('tm_connected_store_v1', '') || '').trim();
            if (connected) return connected.slice(0, 64);
        } catch (_) { /* ignore */ }
        // 2) Global key written by loader on login.php
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
            if (typeof window.getCurrentStoreName === 'function') {
                const n = String(window.getCurrentStoreName() || '').trim();
                if (n) return n.slice(0, 64);
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
        const row = document.getElementById('tm-chat-store-row');
        const chip = document.getElementById('tm-chat-store-chip');
        const loginStore = detectLoginStoreName();
        const locked = !!loginStore;
        if (loginStore) {
            setChatStoreName(STORAGE_KEYS, loginStore, { manual: false });
        }
        const current = getChatStoreName(STORAGE_KEYS);

        if (chip) {
            if (locked && current) {
                chip.hidden = false;
                chip.textContent = current.length > 18 ? `${current.slice(0, 16)}…` : current;
                chip.title = `Κατάστημα (από σελίδα/login): ${current}`;
            } else {
                chip.hidden = true;
                chip.textContent = '';
                chip.removeAttribute('title');
            }
        }

        if (row) {
            row.hidden = locked;
            row.classList.toggle('is-locked', locked);
        }

        if (!select) return;
        if (locked) {
            select.disabled = true;
            select.classList.add('is-locked');
            return;
        }

        const options = getChatStoreOptions(STORAGE_KEYS);
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Επίλεξε κατάστημα —';
        select.appendChild(placeholder);
        options.forEach((name) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            if (name === current) opt.selected = true;
            select.appendChild(opt);
        });
        if (current) select.value = current;
        select.disabled = false;
        select.classList.remove('is-locked');
        select.title = 'Επίλεξε κατάστημα (δεν βρέθηκε αυτόματα από το login)';
        let lockHint = document.getElementById('tm-chat-store-lock');
        if (lockHint) lockHint.hidden = true;
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
        if (body.record) rememberChatSelfAvatar(body.record);
        return body;
    }

    async function fetchOwnChatUserRecord(STORAGE_KEYS) {
        loadCachedSelfAvatar();
        const token = await ensureAuth(STORAGE_KEYS);
        const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
        // Prefer auth-refresh — returns current user record with avatar
        const refreshed = await chatRequestJson({
            method: 'POST',
            url: `${base}/api/collections/users/auth-refresh`,
            headers: { Authorization: token },
            timeout: 12000,
        });
        if (refreshed.status >= 200 && refreshed.status < 300 && refreshed.body?.record) {
            if (refreshed.body.token) {
                chatAuthToken = refreshed.body.token;
                let expires = Date.now() + 12 * 60 * 60 * 1000;
                try {
                    const payload = JSON.parse(atob(String(chatAuthToken).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                    if (payload?.exp) expires = Number(payload.exp) * 1000;
                } catch (_) { /* ignore */ }
                chatAuthExpires = expires;
                saveCachedToken(STORAGE_KEYS, chatAuthToken, expires);
            }
            rememberChatSelfAvatar(refreshed.body.record);
            return refreshed.body.record;
        }
        if (chatSelfPbUserId) {
            const { status, body } = await chatRequestJson({
                method: 'GET',
                url: `${base}/api/collections/users/records/${encodeURIComponent(chatSelfPbUserId)}`,
                headers: { Authorization: token },
            });
            if (status >= 200 && status < 300 && body?.id) {
                rememberChatSelfAvatar(body);
                return body;
            }
        }
        return null;
    }

    async function uploadOfficeChatAvatar(STORAGE_KEYS, file) {
        const check = isAllowedChatAvatarFile(file);
        if (!check.ok) return { ok: false, message: check.message || 'Μη έγκυρη εικόνα' };
        const ensured = await ensureOfficeChatAccount(STORAGE_KEYS);
        if (!ensured.ok) return ensured;
        const record = await fetchOwnChatUserRecord(STORAGE_KEYS);
        if (!record?.id) return { ok: false, message: 'Δεν βρέθηκε λογαριασμός chat' };
        const uploadFile = normalizeChatUploadFile(file);
        const url = `${OFFICE_CHAT_BASE_URL.replace(/\/$/, '')}/api/collections/users/records/${encodeURIComponent(record.id)}`;

        const send = async (authHeader, useForm) => {
            if (useForm && typeof FormData !== 'undefined') {
                const fd = new FormData();
                fd.append('avatar', uploadFile, uploadFile.name || 'avatar.jpg');
                return chatRequestJson({
                    method: 'PATCH',
                    url,
                    headers: { Authorization: authHeader },
                    data: fd,
                    timeout: 60000,
                    fetch: true,
                });
            }
            const built = await buildChatMultipartBody({}, uploadFile, 'avatar');
            return chatRequestJson({
                method: 'PATCH',
                url,
                headers: {
                    Authorization: authHeader,
                    'Content-Type': built.contentType,
                },
                data: built.data,
                timeout: 60000,
                fetch: true,
            });
        };

        let token = chatAuthToken || await ensureAuth(STORAGE_KEYS);
        let result = await send(token, true);
        if (result.status >= 400) result = await send(token, false);
        if ((result.status === 401 || result.status === 403) && token && !String(token).startsWith('Bearer ')) {
            result = await send(`Bearer ${token}`, true);
            if (result.status >= 400) result = await send(`Bearer ${token}`, false);
        }
        if (result.status === 401) {
            clearCachedToken(STORAGE_KEYS);
            token = await ensureAuth(STORAGE_KEYS, { force: true });
            result = await send(token, true);
            if (result.status >= 400) result = await send(token, false);
        }
        if (result.status < 200 || result.status >= 300) {
            let msg = formatPbError(result.body, `Upload failed (${result.status || 0})`);
            if (/avatar/i.test(msg) || /unknown field/i.test(msg)) {
                msg = 'Πρόσθεσε πεδίο avatar (File) στο users και Update rule: @request.auth.id = id';
            }
            return { ok: false, message: msg };
        }
        rememberChatSelfAvatar(result.body || { id: record.id, avatar: result.body?.avatar });
        // Re-fetch to get final filename
        await fetchOwnChatUserRecord(STORAGE_KEYS);
        refreshChatMessagesAvatarUi();
        return { ok: true, ...getOfficeChatAvatarInfo(), message: 'Η φωτογραφία αποθηκεύτηκε' };
    }

    async function clearOfficeChatAvatar(STORAGE_KEYS) {
        const ensured = await ensureOfficeChatAccount(STORAGE_KEYS);
        if (!ensured.ok) return ensured;
        const record = await fetchOwnChatUserRecord(STORAGE_KEYS);
        if (!record?.id) return { ok: false, message: 'Δεν βρέθηκε λογαριασμός chat' };
        const url = `${OFFICE_CHAT_BASE_URL.replace(/\/$/, '')}/api/collections/users/records/${encodeURIComponent(record.id)}`;
        let token = chatAuthToken || await ensureAuth(STORAGE_KEYS);
        const patch = async (authHeader) => chatRequestJson({
            method: 'PATCH',
            url,
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ avatar: null }),
        });
        let result = await patch(token);
        if ((result.status === 401 || result.status === 403) && !String(token).startsWith('Bearer ')) {
            result = await patch(`Bearer ${token}`);
        }
        if (result.status < 200 || result.status >= 300) {
            // Multipart empty clear fallback
            if (typeof FormData !== 'undefined') {
                const fd = new FormData();
                fd.append('avatar', '');
                result = await chatRequestJson({
                    method: 'PATCH',
                    url,
                    headers: { Authorization: token },
                    data: fd,
                    fetch: true,
                });
            }
        }
        if (result.status < 200 || result.status >= 300) {
            return { ok: false, message: formatPbError(result.body, 'Αποτυχία αφαίρεσης') };
        }
        chatSelfAvatarFile = '';
        rememberChatSelfAvatar({ id: record.id, avatar: '' });
        refreshChatMessagesAvatarUi();
        return { ok: true, ...getOfficeChatAvatarInfo(), message: 'Η φωτογραφία αφαιρέθηκε' };
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
            .map((m) => {
                const av = resolveChatMessageAvatar(m);
                return [
                    m.id,
                    m.text || '',
                    m.displayName || '',
                    m.store || '',
                    m.attachment || '',
                    m.pbUserId || '',
                    m.avatar || '',
                    m.replyTo || '',
                    m.replyPreview || '',
                    m.replyName || '',
                    m.pinned ? '1' : '0',
                    chatLocalPinIds.has(String(m.id)) ? 'L1' : 'L0',
                    m.deleted ? '1' : '0',
                    m.edited ? '1' : '0',
                    av ? `${av.userId}:${av.filename}` : '',
                    chatSelfAvatarFile || '',
                    m.created || '',
                ].join('\u0001');
            })
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
        const room = getChatRoom();
        const q = String(chatSearchQuery || '').trim().toLowerCase();
        let sorted = chatMessages
            .filter((m) => String(m.room || room) === room)
            .slice()
            .sort((a, b) => {
                const ta = new Date(a.created || 0).getTime();
                const tb = new Date(b.created || 0).getTime();
                return ta - tb;
            });
        if (q) {
            sorted = sorted.filter((m) => {
                const blob = `${m.displayName || ''} ${m.text || ''} ${m.store || ''} ${m.replyPreview || ''}`.toLowerCase();
                return blob.includes(q);
            });
        }
        if (chatMentionsOnly) {
            sorted = sorted.filter((m) => messageMentionsMe(m.text));
        }
        if (chatFiltersActive()) {
            sorted = sorted.filter((m) => messageMatchesChatFilters(m));
        }
        const filterKey = `${chatFilterImages ? '1' : '0'}${chatFilterRepairs ? '1' : '0'}:${chatFilterFrom}`;
        const nextKey = chatMessagesFingerprint(sorted) + `\u0003${q}\u0003${room}\u0003${chatMentionsOnly ? '1' : '0'}\u0003${filterKey}\u0003${chatPresenceList.map((p) => p.lastReadAt || '').join(',')}`;
        if (!force && nextKey === chatMessagesRenderKey && list.childElementCount > 0) {
            if (CHAT_PIN_ENABLED) renderPinnedStrip();
            hydrateChatRepairCards(list);
            updateChatFilterUi();
            return;
        }
        const stickToBottom = force || isChatMessagesNearBottom(list) || !chatMessagesRenderKey;
        const newIdSet = new Set((newIds || []).map(String));
        chatMessagesRenderKey = nextKey;

        const me = getDisplayName();
        if (CHAT_PIN_ENABLED) renderPinnedStrip();
        else {
            const strip = document.getElementById('tm-chat-pinned');
            if (strip) {
                strip.hidden = true;
                strip.innerHTML = '';
            }
        }
        updateChatFilterUi();
        if (!sorted.length) {
            const filterHint = chatFiltersActive()
                ? 'Δοκίμασε να καθαρίσεις τα φίλτρα αναζήτησης'
                : (q ? 'Δοκίμασε άλλο όρο αναζήτησης' : 'Γράψε κάτι για να ξεκινήσει η συζήτηση');
            const emptyTitle = chatMentionsOnly
                ? 'Καμία αναφορά @'
                : ((q || chatFiltersActive()) ? 'Κανένα αποτέλεσμα' : 'Δεν υπάρχουν μηνύματα ακόμα');
            const emptySub = chatMentionsOnly
                ? 'Όταν σε αναφέρουν με @ θα εμφανιστούν εδώ'
                : filterHint;
            list.innerHTML = `<div class="tm-chat-empty">
                <div class="tm-chat-empty-icon">💬</div>
                <div class="tm-chat-empty-title">${emptyTitle}</div>
                <div class="tm-chat-empty-sub">${emptySub}</div>
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
            if (isChatMessageDeleted(m)) {
                return `<div class="tm-chat-msg is-deleted${mine ? ' is-mine' : ''}" data-id="${escapeHtml(m.id)}">
                    ${formatChatAvatarHtml(m)}
                    <div class="tm-chat-msg-bubble">
                        <div class="tm-chat-msg-meta">
                            <span class="tm-chat-msg-who">
                                <span class="tm-chat-msg-name">${escapeHtml(name)}</span>
                                ${storeHtml}
                            </span>
                            <span class="tm-chat-msg-time">${escapeHtml(formatMsgTime(m.created))}</span>
                        </div>
                        <div class="tm-chat-msg-text tm-chat-msg-deleted">${escapeHtml(formatChatDeletedLabel(m))}</div>
                    </div>
                </div>`;
            }
            const rawText = String(m.text || '').trim();
            const hasAttach = !!normalizeChatAttachmentName(m);
            const isFilePlaceholder = rawText === '(αρχείο)' || (!hasAttach && /^📎\s/.test(rawText));
            const showText = rawText && !isFilePlaceholder && !(hasAttach && (rawText === '(αρχείο)' || rawText === normalizeChatAttachmentName(m)));
            const textHtml = showText ? formatChatMessageHtml(rawText) : '';
            const attachHtml = formatChatAttachmentHtml(m);
            const bodyHtml = [attachHtml, textHtml].filter(Boolean).join('')
                || (isFilePlaceholder ? '' : escapeHtml(rawText));
            const repairCardsHtml = showText ? formatChatRepairCardsHtml(rawText) : '';
            const replyHtml = m.replyTo
                ? `<button type="button" class="tm-chat-msg-reply" data-jump="${escapeHtml(m.replyTo)}">
                    <strong>${escapeHtml(m.replyName || (findChatMessageById(m.replyTo)?.displayName) || 'Μήνυμα')}</strong>
                    <span>${escapeHtml(m.replyPreview || '…')}</span>
                </button>`
                : '';
            const editedHtml = m.edited ? `<span class="tm-chat-msg-edited">επεξεργ.</span>` : '';
            const pinMark = (CHAT_PIN_ENABLED && isMessagePinned(m))
                ? `<span class="tm-chat-msg-pinmark" title="Καρφιτσωμένο">📌</span>`
                : '';
            const seenHtml = mine && peersHaveReadMessage(m)
                ? `<span class="tm-chat-msg-seen" title="Διαβάστηκε">✓✓</span>`
                : (mine ? `<span class="tm-chat-msg-seen is-sent" title="Στάλθηκε">✓</span>` : '');
            const mentionHit = messageMentionsMe(m.text);
            const mentionUnread = mentionHit && chatUnreadMentionIds.has(String(m.id));
            return `<div class="tm-chat-msg${mine ? ' is-mine' : ''}${isNew ? ' is-new' : ''}${mentionHit ? ' is-mention-hit' : ''}${mentionUnread ? ' is-mention-unread' : ''}${(CHAT_PIN_ENABLED && isMessagePinned(m)) ? ' is-pinned' : ''}" data-id="${escapeHtml(m.id)}" title="Δεξί κλικ για επιλογές">
                ${formatChatAvatarHtml(m)}
                <div class="tm-chat-msg-bubble">
                    <div class="tm-chat-msg-meta">
                        <span class="tm-chat-msg-who">
                            <span class="tm-chat-msg-name">${escapeHtml(name)}</span>
                            ${storeHtml}
                            ${pinMark}
                        </span>
                        <span class="tm-chat-msg-time">${escapeHtml(formatMsgTime(m.created))}${editedHtml}${seenHtml}</span>
                    </div>
                    ${replyHtml}
                    <div class="tm-chat-msg-text">${bodyHtml}</div>
                    ${repairCardsHtml}
                    ${formatChatReactionsHtml(m)}
                </div>
            </div>`;
        }).join('');
        if (stickToBottom && !q && !chatMentionsOnly) list.scrollTop = list.scrollHeight;
        else list.scrollTop = prevScrollTop;
        hydrateChatRepairCards(list);
        updateChatMentionsBtnUi();
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
        btn.classList.toggle('tm-chat-has-unread', show && !isChatNotifyMuted());
        if (!show) btn.classList.remove('tm-chat-ping');
    }

    function isOwnChatMessage(msg) {
        const me = getDisplayName();
        const meProfile = getProfileId();
        if (meProfile && msg?.profileId && String(msg.profileId) === String(meProfile)) return true;
        if (me && String(msg?.displayName || '') === me) return true;
        return false;
    }

    /** Footer-button reminder (+ optional sound). Mentions get a stronger ping. */
    function notifyNewChatMessages(newMessages) {
        if (isChatNotifyMuted() || !Array.isArray(newMessages) || !newMessages.length) return;
        if (chatPanelOpen && !document.hidden) return;

        const incoming = newMessages.filter((m) => {
            if (!m?.id || isOwnChatMessage(m) || m.deleted) return false;
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

        const mentioned = incoming.some((m) => messageMentionsMe(m.text));
        rememberUnreadMentions(incoming);
        playChatNotifySound({ mention: mentioned });
        if (mentioned) {
            const mentionMsg = [...incoming].reverse().find((m) => messageMentionsMe(m.text))
                || incoming[incoming.length - 1];
            showChatMentionDesktopNotification(mentionMsg);
        }

        const btn = document.getElementById('tm-chat-toggle-btn');
        if (!btn) return;
        const latest = incoming[incoming.length - 1];
        const storeBit = latest.store ? ` · ${latest.store}` : '';
        const preview = mentioned
            ? `Σε ανέφεραν — ${latest.displayName || 'Chat'}: ${chatMessagePreviewText(latest)}`
            : (incoming.length === 1
                ? `${latest.displayName || 'Chat'}${storeBit}: ${chatMessagePreviewText(latest)}`
                : `${incoming.length} νέα μηνύματα`);
        btn.title = `Office Chat — ${preview}`;
        btn.classList.add('tm-chat-has-unread', 'tm-chat-ping');
        if (mentioned) btn.classList.add('tm-chat-mention-ping');
        window.clearTimeout(notifyNewChatMessages._pingTimer);
        notifyNewChatMessages._pingTimer = window.setTimeout(() => {
            btn.classList.remove('tm-chat-ping', 'tm-chat-mention-ping');
        }, mentioned ? 3600 : 2400);
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
        const activeRoom = getChatRoom();
        records.forEach((rec) => {
            if (!rec?.id) return;
            if (String(rec.room || CHAT_ROOM_OFFICE) !== activeRoom) return;
            const prev = byId.get(rec.id);
            const mapped = mapChatRecord(rec);
            if (mapped.pbUserId && mapped.avatar) {
                rememberChatAvatarEntry({
                    userId: mapped.pbUserId,
                    filename: mapped.avatar,
                    displayName: mapped.displayName,
                    profileId: mapped.profileId,
                });
            }
            if (!prev) {
                added += 1;
                changed = true;
                newlyAdded.push(mapped);
            } else if (
                String(prev.text || '') !== String(mapped.text || '')
                || String(prev.displayName || '') !== String(mapped.displayName || '')
                || String(prev.store || '') !== String(mapped.store || '')
                || String(prev.attachment || '') !== String(mapped.attachment || '')
                || String(prev.pbUserId || '') !== String(mapped.pbUserId || '')
                || String(prev.avatar || '') !== String(mapped.avatar || '')
                || String(prev.created || '') !== String(mapped.created || '')
                || String(prev.replyTo || '') !== String(mapped.replyTo || '')
                || String(prev.replyPreview || '') !== String(mapped.replyPreview || '')
                || !!prev.pinned !== !!mapped.pinned
                || !!prev.deleted !== !!mapped.deleted
                || String(prev.deletedBy || '') !== String(mapped.deletedBy || '')
                || !!prev.edited !== !!mapped.edited
                || !reactionsEqual(prev.reactions, mapped.reactions)
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
            renderPresenceUi();
        }
        if (chatHydrated && fromPollOrRealtime && added > 0) {
            if (!chatPanelOpen) {
                chatUnread += newlyAdded.filter((m) => !m.deleted).length;
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
        if (body.record) rememberChatSelfAvatar(body.record);
        return chatAuthToken;
    }

    async function fetchMessages(STORAGE_KEYS) {
        const settings = getChatSettings(STORAGE_KEYS);
        const token = await ensureAuth(STORAGE_KEYS);
        const room = getChatRoom();
        const filter = encodeURIComponent(`room="${room}"`);
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

        const buildFields = (textValue, includeStore, includeAvatar, includeReply) => {
            const fields = {
                text: textValue,
                displayName,
                room: getChatRoom(),
            };
            if (profileId) fields.profileId = profileId;
            if (includeStore && storeName && !chatStoreFieldUnsupported) fields.store = storeName;
            if (includeAvatar && !chatMsgAvatarFieldsUnsupported && chatSelfPbUserId && chatSelfAvatarFile) {
                fields.pbUserId = chatSelfPbUserId;
                fields.avatar = chatSelfAvatarFile;
            }
            if (includeReply && !chatReplyFieldsUnsupported && chatReplyTarget?.id) {
                fields.replyTo = chatReplyTarget.id;
                fields.replyPreview = String(chatReplyTarget.preview || '').slice(0, 120);
            }
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
        loadCachedSelfAvatar();
        if (!chatSelfPbUserId || (chatSelfAvatarFile === '' && !chatMsgAvatarFieldsUnsupported)) {
            try { await fetchOwnChatUserRecord(STORAGE_KEYS); } catch (_) { /* optional */ }
        }
        const pendingReply = chatReplyTarget
            ? {
                id: chatReplyTarget.id,
                preview: chatReplyTarget.preview,
                displayName: chatReplyTarget.displayName,
            }
            : null;
        let includeStore = true;
        let includeAvatar = !chatMsgAvatarFieldsUnsupported;
        let includeReply = !chatReplyFieldsUnsupported && !!pendingReply?.id;
        let fields = buildFields(textValue, includeStore, includeAvatar, includeReply);

        let { status, body, raw } = await postJson(fields);
        const errBlob = () => `${JSON.stringify(body || {})}\n${raw || ''}`;

        if (status >= 400 && storeName && !chatStoreFieldUnsupported && /store/i.test(errBlob())) {
            chatStoreFieldUnsupported = true;
            includeStore = false;
            fields = buildFields(textValue, includeStore, includeAvatar, includeReply);
            ({ status, body, raw } = await postJson(fields));
            if (status >= 400 && /store/i.test(errBlob())) {
                setChatStatus('error', 'Πρόσθεσε πεδίο store στο messages (PocketBase)');
            }
        }

        if (status >= 400 && includeAvatar && /pbUserId|avatar/i.test(errBlob())) {
            chatMsgAvatarFieldsUnsupported = true;
            includeAvatar = false;
            fields = buildFields(textValue, includeStore, false, includeReply);
            ({ status, body, raw } = await postJson(fields));
        }

        if (status >= 400 && includeReply && /replyTo|replyPreview/i.test(errBlob())) {
            chatReplyFieldsUnsupported = true;
            includeReply = false;
            fields = buildFields(textValue, includeStore, includeAvatar, false);
            ({ status, body, raw } = await postJson(fields));
        }

        if (status >= 400 && attachFile && !clean && /text/i.test(errBlob())) {
            textValue = '(αρχείο)';
            fields = buildFields(textValue, includeStore, includeAvatar, includeReply);
            ({ status, body, raw } = await postJson(fields));
        }

        if (status < 200 || status >= 300) {
            let msg = formatPbError(body, `Send failed (${status || 0})`);
            if (!body && raw) msg = `${msg} — ${String(raw).slice(0, 160)}`;
            if (/failed to create record/i.test(msg) && !/text:|displayName|room|profileId|store|attachment|pbUserId|avatar|replyTo|replyPreview/i.test(msg)) {
                msg += ' — PocketBase Admin → Collections → messages → API Rules: ξεκλείδωσε το Create';
            }
            throw new Error(msg);
        }

        let saved = body && typeof body === 'object' ? { ...body } : body;
        if (!saved?.id) {
            throw new Error('Send failed — κενή απάντηση από server');
        }
        if (saved && storeName && !saved.store) saved.store = storeName;
        if (saved && chatSelfPbUserId && chatSelfAvatarFile) {
            if (!saved.pbUserId) saved.pbUserId = chatSelfPbUserId;
            if (!saved.avatar) saved.avatar = chatSelfAvatarFile;
        }
        // Always keep reply quote locally (server may strip/reject reply fields)
        if (pendingReply?.id) {
            if (!saved.replyTo) {
                chatReplyFieldsUnsupported = true;
                saved.replyTo = pendingReply.id;
            }
            if (!saved.replyPreview) saved.replyPreview = pendingReply.preview || '';
            if (!saved.replyName) saved.replyName = pendingReply.displayName || '';
            rememberLocalReply(saved.id, {
                replyTo: saved.replyTo,
                replyPreview: saved.replyPreview,
                replyName: saved.replyName,
            });
        }

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
        setChatReplyTarget(null);
        return { ok: true };
    }

    async function patchChatMessage(STORAGE_KEYS, messageId, patchFields) {
        if (!messageId || !patchFields) return { ok: false };
        const settings = getChatSettings(STORAGE_KEYS);
        let authHeader = await ensureAuth(STORAGE_KEYS);
        const url = `${String(settings.baseUrl || '').replace(/\/$/, '')}/api/collections/messages/records/${encodeURIComponent(messageId)}`;
        const run = (header) => chatRequestJson({
            method: 'PATCH',
            url,
            headers: {
                Authorization: header,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(patchFields),
        });
        let result = await run(authHeader);
        if ((result.status === 401 || result.status === 403) && !String(authHeader).startsWith('Bearer ')) {
            result = await run(`Bearer ${authHeader}`);
        }
        if (result.status === 401) {
            clearCachedToken(STORAGE_KEYS);
            authHeader = await ensureAuth(STORAGE_KEYS, { force: true });
            result = await run(authHeader);
        }
        if (result.status < 200 || result.status >= 300) {
            return { ok: false, status: result.status, body: result.body, message: formatPbError(result.body, 'Ενημέρωση απέτυχε') };
        }
        upsertMessages([mapChatRecord(result.body || { id: messageId, ...patchFields })]);
        return { ok: true, body: result.body };
    }

    async function togglePinChatMessage(STORAGE_KEYS, messageId) {
        if (!CHAT_PIN_ENABLED) return { ok: false, reason: 'disabled' };
        const msg = findChatMessageById(messageId);
        if (!msg || isChatMessageDeleted(msg)) return { ok: false };
        const next = !isMessagePinned(msg);

        // Optimistic local pin so UI always reacts immediately
        setLocalMessagePinned(messageId, next);
        upsertMessages([{ ...msg, pinned: next || !!msg.pinned }]);
        renderPinnedStrip();
        renderMessages({ force: true });

        if (chatPinFieldUnsupported) {
            setChatStatus('online', next ? 'Καρφιτσώθηκε (τοπικά)' : 'Ξεκαρφιτσώθηκε');
            setTimeout(() => setChatStatus('online'), 1200);
            return { ok: true, local: true };
        }

        const result = await patchChatMessage(STORAGE_KEYS, messageId, { pinned: next });
        const errBlob = `${JSON.stringify(result.body || {})}\n${result.message || ''}`;
        if (result.ok) {
            if (next) chatLocalPinIds.delete(String(messageId)); // server is source of truth when field works
            else setLocalMessagePinned(messageId, false);
            saveLocalChatPins();
            // Ensure server flag sticks in memory
            const saved = findChatMessageById(messageId);
            if (saved) {
                saved.pinned = next;
                upsertMessages([saved]);
            }
            renderPinnedStrip();
            setChatStatus('online', next ? 'Καρφιτσώθηκε' : 'Ξεκαρφιτσώθηκε');
            setTimeout(() => setChatStatus('online'), 1200);
            return result;
        }

        if (/pinned|unknown field|failed to find|validation/i.test(errBlob) || result.status === 400) {
            chatPinFieldUnsupported = true;
            setChatStatus('online', next
                ? 'Καρφιτσώθηκε τοπικά — πρόσθεσε Bool pinned στο messages'
                : 'Ξεκαρφιτσώθηκε τοπικά');
            setTimeout(() => setChatStatus('online'), 2500);
            return { ok: true, local: true };
        }

        // Revert local on unexpected failure
        setLocalMessagePinned(messageId, !next);
        upsertMessages([{ ...msg, pinned: !!msg.pinned }]);
        renderPinnedStrip();
        renderMessages({ force: true });
        setChatStatus('error', result.message || 'Το καρφίτσωμα απέτυχε');
        return result;
    }

    async function softDeleteChatMessage(STORAGE_KEYS, messageId) {
        const msg = findChatMessageById(messageId);
        if (!msg) return { ok: false, reason: 'missing' };
        if (!isOwnChatMessage(msg)) {
            setChatStatus('error', 'Μπορείς να διαγράψεις μόνο τα δικά σου μηνύματα');
            return { ok: false, reason: 'forbidden' };
        }
        if (isChatMessageDeleted(msg)) return { ok: true };

        const who = getDisplayName() || msg.displayName || '?';
        const tombstone = `message deleted by ${who}`.slice(0, CHAT_MAX_LEN);
        const patch = {
            text: tombstone,
            deleted: true,
            deletedBy: who.slice(0, 64),
            pinned: false,
            replyTo: '',
            replyPreview: '',
        };

        let result = await patchChatMessage(STORAGE_KEYS, messageId, patch);
        const errText = `${JSON.stringify(result.body || {})}\n${result.message || ''}`;

        // Drop optional fields PocketBase may not have yet
        if (!result.ok && /deletedBy/i.test(errText)) {
            delete patch.deletedBy;
            result = await patchChatMessage(STORAGE_KEYS, messageId, patch);
        }
        if (!result.ok && /deleted/i.test(`${JSON.stringify(result.body || {})}\n${result.message || ''}`)) {
            chatSoftDeleteUnsupported = true;
            result = await patchChatMessage(STORAGE_KEYS, messageId, {
                text: tombstone,
                pinned: false,
            });
        }
        if (!result.ok && /replyTo|replyPreview|pinned/i.test(`${JSON.stringify(result.body || {})}\n${result.message || ''}`)) {
            result = await patchChatMessage(STORAGE_KEYS, messageId, { text: tombstone, deleted: !chatSoftDeleteUnsupported });
            if (!result.ok && chatSoftDeleteUnsupported === false && /deleted/i.test(`${JSON.stringify(result.body || {})}\n${result.message || ''}`)) {
                chatSoftDeleteUnsupported = true;
                result = await patchChatMessage(STORAGE_KEYS, messageId, { text: tombstone });
            }
        }

        if (result.ok) {
            // Ensure local UI shows tombstone even if server omitted flags
            const local = {
                ...msg,
                text: tombstone,
                deleted: true,
                deletedBy: who,
                pinned: false,
                replyTo: '',
                replyPreview: '',
                attachment: '',
            };
            upsertMessages([local]);
            return { ok: true };
        }

        setChatStatus('error', result.message || 'Η διαγραφή απέτυχε');
        return result;
    }

    async function editChatMessage(STORAGE_KEYS, messageId, newText) {
        const msg = findChatMessageById(messageId);
        if (!msg || !isOwnChatMessage(msg) || isChatMessageDeleted(msg)) return { ok: false };
        const clean = String(newText || '').trim().slice(0, CHAT_MAX_LEN);
        if (!clean) return { ok: false, reason: 'empty' };
        const patch = { text: clean };
        if (!chatEditFieldUnsupported) patch.edited = true;
        const result = await patchChatMessage(STORAGE_KEYS, messageId, patch);
        if (!result.ok && /edited/i.test(JSON.stringify(result.body || {}) + (result.message || ''))) {
            chatEditFieldUnsupported = true;
            return patchChatMessage(STORAGE_KEYS, messageId, { text: clean });
        }
        return result;
    }

    async function toggleChatReaction(STORAGE_KEYS, messageId, emoji) {
        const msg = findChatMessageById(messageId);
        if (!msg || isChatMessageDeleted(msg)) return { ok: false };
        if (!CHAT_REACTION_EMOJIS.includes(emoji)) return { ok: false, reason: 'emoji' };
        const me = getDisplayName();
        if (!me) {
            setChatStatus('error', 'Δεν βρέθηκε όνομα login');
            return { ok: false, reason: 'name' };
        }
        const current = getMessageReactions(msg);
        const next = normalizeReactionsMap(current);
        const list = Array.isArray(next[emoji]) ? next[emoji].slice() : [];
        const idx = list.indexOf(me);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(me);
        if (list.length) next[emoji] = list;
        else delete next[emoji];

        // Optimistic UI
        msg.reactions = next;
        rememberLocalReactions(messageId, next);
        renderMessages({ force: true });

        if (chatReactionsUnsupported) {
            return { ok: true, local: true };
        }

        const result = await patchChatMessage(STORAGE_KEYS, messageId, {
            reactions: serializeReactionsMap(next),
        });
        let finalResult = result;
        const errBlob = `${JSON.stringify(result.body || {})}\n${result.message || ''}`;
        if (!result.ok && /json|type|invalid|expected/i.test(errBlob) && !/unknown field|failed to find/i.test(errBlob)) {
            finalResult = await patchChatMessage(STORAGE_KEYS, messageId, { reactions: next });
        }
        const errBlob2 = `${JSON.stringify(finalResult.body || {})}\n${finalResult.message || ''}`;
        if (finalResult.ok) {
            const saved = findChatMessageById(messageId);
            if (saved) {
                const parsed = parseReactionsField(finalResult.body?.reactions);
                saved.reactions = Object.keys(parsed).length ? parsed : next;
                if (Object.keys(parsed).length) {
                    delete chatLocalReactions[String(messageId)];
                    saveLocalChatReactions();
                }
            }
            renderMessages({ force: true });
            return finalResult;
        }

        if (/reactions|unknown field|failed to find|validation/i.test(errBlob2) || finalResult.status === 400) {
            chatReactionsUnsupported = true;
            setChatStatus('online', 'Reaction τοπικά — πρόσθεσε Text reactions στο messages');
            setTimeout(() => setChatStatus('online'), 2500);
            return { ok: true, local: true };
        }

        // Revert
        msg.reactions = current;
        rememberLocalReactions(messageId, current);
        renderMessages({ force: true });
        setChatStatus('error', finalResult.message || 'Το reaction απέτυχε');
        return finalResult;
    }

    async function copyChatMessageText(messageId) {
        const msg = findChatMessageById(messageId);
        if (!msg || isChatMessageDeleted(msg)) return { ok: false };
        const text = String(msg.text || '').trim();
        if (!text || text === '(αρχείο)') {
            const name = normalizeChatAttachmentName(msg);
            if (!name) {
                setChatStatus('online', 'Δεν υπάρχει κείμενο για αντιγραφή');
                setTimeout(() => setChatStatus('online'), 1200);
                return { ok: false, reason: 'empty' };
            }
        }
        const payload = text && text !== '(αρχείο)'
            ? text
            : (normalizeChatAttachmentName(msg) || '');
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(payload);
            } else {
                const ta = document.createElement('textarea');
                ta.value = payload;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            setChatStatus('online', 'Αντιγράφηκε');
            setTimeout(() => setChatStatus('online'), 1000);
            return { ok: true };
        } catch (_) {
            setChatStatus('error', 'Αποτυχία αντιγραφής');
            return { ok: false };
        }
    }

    function linkPresenceToAvatarDirectory() {
        (chatPresenceList || []).forEach((p) => {
            const userId = String(p?.userId || p?.pbUserId || '').trim();
            const displayName = String(p?.displayName || '').trim();
            if (userId && displayName) {
                chatUserIdByDisplayName.set(displayName.toLowerCase(), userId);
            }
            if (!userId) return;
            const fromPresence = normalizePbFileName(p?.avatar);
            const fromDir = chatAvatarDirectory.get(`id:${userId}`)?.filename || '';
            const filename = fromPresence || fromDir;
            if (!filename) return;
            rememberChatAvatarEntry({
                userId,
                filename,
                displayName,
                profileId: p.profileId,
            });
        });
    }

    function presenceErrBlob(result) {
        return `${JSON.stringify(result?.body || {})}\n${result?.raw || ''}\n${result?.message || ''}`;
    }

    function isPresenceCollectionMissing(status, blob) {
        if (status === 404) return true;
        return status >= 400 && /missing collection|collection.*not found|didn't find the collection|unknown collection/i.test(String(blob || ''));
    }

    function isPresenceRuleDenied(status, blob) {
        if (status !== 403 && status !== 401) return false;
        return /superuser|only super|authorization|forbidden|not allowed|failed to authenticate/i.test(String(blob || ''))
            || status === 403;
    }

    function hintPresenceFailure(status, body, raw) {
        if (chatPresenceHintShown) return;
        chatPresenceHintShown = true;
        const blob = `${JSON.stringify(body || {})}\n${raw || ''}`;
        let msg = formatPbError(body, `Presence αποτυχία (${status || 0})`);
        if (isPresenceCollectionMissing(status, blob)) {
            msg = 'Presence: δημιούργησε collection presence στο PocketBase';
            chatPresenceUnsupported = true;
        } else if (isPresenceRuleDenied(status, blob)) {
            msg = 'Presence: ξεκλείδωσε List/Create/Update — κανόνας @request.auth.id != ""';
        } else if (/unknown field|failed to find|invalid|validation/i.test(blob)) {
            const fields = body?.data && typeof body.data === 'object'
                ? Object.keys(body.data).join(', ')
                : '';
            msg = fields
                ? `Presence πεδία: έλεγξε ${fields} (SETUP §6)`
                : 'Presence: έλεγξε πεδία userId/displayName/lastSeen (SETUP §6)';
        }
        setChatStatus('online', msg);
        setTimeout(() => setChatStatus('online'), 5000);
    }

    async function writePresenceRecord(STORAGE_KEYS, existingId, payload) {
        const token = await ensureAuth(STORAGE_KEYS);
        const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
        const headers = { Authorization: token, 'Content-Type': 'application/json' };
        if (existingId) {
            return chatRequestJson({
                method: 'PATCH',
                url: `${base}/api/collections/presence/records/${encodeURIComponent(existingId)}`,
                headers,
                data: JSON.stringify(payload),
                timeout: 10000,
            });
        }
        return chatRequestJson({
            method: 'POST',
            url: `${base}/api/collections/presence/records`,
            headers,
            data: JSON.stringify(payload),
            timeout: 10000,
        });
    }

    async function upsertOwnPresence(STORAGE_KEYS, { markRead } = {}) {
        if (chatPresenceUnsupported) {
            renderPresenceUi();
            return false;
        }
        try {
            const token = await ensureAuth(STORAGE_KEYS);
            const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
            loadCachedSelfAvatar();
            if (!chatSelfPbUserId) {
                try { await fetchOwnChatUserRecord(STORAGE_KEYS); } catch (_) { /* optional */ }
            }
            if (!chatSelfPbUserId) {
                if (!chatPresenceHintShown) {
                    chatPresenceHintShown = true;
                    setChatStatus('online', 'Presence: δεν βρέθηκε user id — άνοιξε Chat ξανά');
                    setTimeout(() => setChatStatus('online'), 3500);
                }
                renderPresenceUi();
                return false;
            }

            const nowIso = formatChatPresenceTime(Date.now());
            const displayName = (getDisplayName() || 'Τεχνικός').slice(0, 64);
            const basePayload = {
                userId: String(chatSelfPbUserId).slice(0, 64),
                displayName,
                lastSeen: nowIso,
            };
            if (!chatTypingUnsupported && chatOwnTypingUntil > Date.now()) {
                basePayload.typingUntil = formatChatPresenceTime(chatOwnTypingUntil);
            }

            // Find existing row (filter → plain list fallback)
            let existingId = '';
            let listed = await chatRequestJson({
                method: 'GET',
                url: `${base}/api/collections/presence/records?page=1&perPage=1&filter=${encodeURIComponent(`userId="${chatSelfPbUserId}"`)}`,
                headers: { Authorization: token },
                timeout: 10000,
            });
            let listedBlob = presenceErrBlob(listed);
            if (isPresenceCollectionMissing(listed.status, listedBlob)) {
                hintPresenceFailure(listed.status, listed.body, listed.raw);
                renderPresenceUi();
                return false;
            }
            if (listed.status >= 400) {
                // Filter/field mismatch or list rule — try unfiltered list
                listed = await chatRequestJson({
                    method: 'GET',
                    url: `${base}/api/collections/presence/records?page=1&perPage=200&sort=-lastSeen`,
                    headers: { Authorization: token },
                    timeout: 10000,
                });
                listedBlob = presenceErrBlob(listed);
                if (isPresenceCollectionMissing(listed.status, listedBlob)) {
                    hintPresenceFailure(listed.status, listed.body, listed.raw);
                    renderPresenceUi();
                    return false;
                }
                if (listed.status >= 200 && listed.status < 300 && Array.isArray(listed.body?.items)) {
                    const mine = listed.body.items.find((row) => String(row?.userId || '') === String(chatSelfPbUserId));
                    if (mine?.id) existingId = mine.id;
                } else if (isPresenceRuleDenied(listed.status, listedBlob)) {
                    // Still try Create — Create rule may be open while List is locked
                } else {
                    hintPresenceFailure(listed.status, listed.body, listed.raw);
                }
            } else if (listed.body?.items?.[0]?.id) {
                existingId = listed.body.items[0].id;
            }

            const attempts = [];
            const full = { ...basePayload };
            const profileId = getProfileId() || '';
            const storeName = getChatStoreName(STORAGE_KEYS) || '';
            if (profileId) full.profileId = profileId;
            if (storeName) full.store = storeName;
            if (markRead || chatPanelOpen) full.lastReadAt = nowIso;
            if (!chatPresenceAvatarUnsupported && chatSelfAvatarFile) full.avatar = chatSelfAvatarFile;
            attempts.push(full);
            attempts.push({ ...basePayload, ...(profileId ? { profileId } : {}), ...(storeName ? { store: storeName } : {}), ...((markRead || chatPanelOpen) ? { lastReadAt: nowIso } : {}) });
            attempts.push({ ...basePayload, ...(profileId ? { profileId } : {}), ...(storeName ? { store: storeName } : {}) });
            attempts.push({ ...basePayload });
            // Alternate date format some PB Date fields accept better
            attempts.push({
                userId: basePayload.userId,
                displayName: basePayload.displayName,
                lastSeen: nowIso.replace('T', ' ').replace(/\.\d{3}Z$/, 'Z'),
            });

            let result = null;
            for (let i = 0; i < attempts.length; i++) {
                const payload = attempts[i];
                if (chatPresenceAvatarUnsupported && payload.avatar) delete payload.avatar;
                result = await writePresenceRecord(STORAGE_KEYS, existingId, payload);
                if (result.status >= 200 && result.status < 300) break;

                const err = presenceErrBlob(result);
                if (/avatar/i.test(err) && payload.avatar) {
                    chatPresenceAvatarUnsupported = true;
                    continue;
                }
                if (/typingUntil/i.test(err) && ('typingUntil' in payload)) {
                    chatTypingUnsupported = true;
                    attempts.forEach((a) => { if (a && 'typingUntil' in a) delete a.typingUntil; });
                    continue;
                }
                if (/lastReadAt/i.test(err) && payload.lastReadAt) continue;
                if (/profileId|store/i.test(err) && (payload.profileId || payload.store)) continue;
                if (/unknown field|failed to find/i.test(err) && i < attempts.length - 1) continue;
                // Unique / already exists → try to find id and PATCH
                if (!existingId && /unique|already|duplicate/i.test(err)) {
                    const again = await chatRequestJson({
                        method: 'GET',
                        url: `${base}/api/collections/presence/records?page=1&perPage=200`,
                        headers: { Authorization: token },
                        timeout: 10000,
                    });
                    const mine = (again.body?.items || []).find((row) => String(row?.userId || '') === String(chatSelfPbUserId));
                    if (mine?.id) {
                        existingId = mine.id;
                        result = await writePresenceRecord(STORAGE_KEYS, existingId, basePayload);
                        if (result.status >= 200 && result.status < 300) break;
                    }
                }
            }

            if (!result || result.status < 200 || result.status >= 300) {
                hintPresenceFailure(result?.status, result?.body, result?.raw);
                if (result && isPresenceCollectionMissing(result.status, presenceErrBlob(result))) {
                    chatPresenceUnsupported = true;
                }
                renderPresenceUi();
                return false;
            }

            const selfRec = result.body || { ...basePayload, id: existingId || result.body?.id };
            if (selfRec?.id) chatOwnPresenceRecordId = String(selfRec.id);
            else if (existingId) chatOwnPresenceRecordId = String(existingId);
            const others = (chatPresenceList || []).filter((p) => String(p.userId || '') !== chatSelfPbUserId);
            chatPresenceList = [selfRec, ...others];
            linkPresenceToAvatarDirectory();
            renderPresenceUi();
            return true;
        } catch (err) {
            if (!chatPresenceHintShown) {
                chatPresenceHintShown = true;
                setChatStatus('online', `Presence: ${err?.message || 'σφάλμα δικτύου'}`);
                setTimeout(() => setChatStatus('online'), 4000);
            }
            renderPresenceUi();
            return false;
        }
    }

    async function refreshChatPresence(STORAGE_KEYS) {
        if (chatPresenceUnsupported) {
            chatPresenceList = [];
            renderPresenceUi();
            return false;
        }
        try {
            const token = await ensureAuth(STORAGE_KEYS);
            const base = OFFICE_CHAT_BASE_URL.replace(/\/$/, '');
            const since = formatChatPresenceTime(Date.now() - 3 * 60 * 1000);
            let status;
            let body;
            let raw;
            ({ status, body, raw } = await chatRequestJson({
                method: 'GET',
                url: `${base}/api/collections/presence/records?page=1&perPage=100&sort=-lastSeen&filter=${encodeURIComponent(`lastSeen>="${since}"`)}`,
                headers: { Authorization: token },
                timeout: 10000,
            }));
            if (status >= 400) {
                // Fallback: list without date filter (schema / type mismatches)
                ({ status, body, raw } = await chatRequestJson({
                    method: 'GET',
                    url: `${base}/api/collections/presence/records?page=1&perPage=100&sort=-lastSeen`,
                    headers: { Authorization: token },
                    timeout: 10000,
                }));
            }
            const blob = presenceErrBlob({ status, body, raw });
            if (isPresenceCollectionMissing(status, blob)) {
                chatPresenceUnsupported = true;
                hintPresenceFailure(status, body, raw);
                chatPresenceList = [];
                renderPresenceUi();
                return false;
            }
            if (status < 200 || status >= 300) {
                hintPresenceFailure(status, body, raw);
                renderPresenceUi();
                return false;
            }
            chatPresenceList = Array.isArray(body?.items) ? body.items : [];
            linkPresenceToAvatarDirectory();
            renderPresenceUi();
            renderTypingUi();
            return true;
        } catch (_) {
            renderPresenceUi();
            return false;
        }
    }

    function startPresenceHeartbeat(STORAGE_KEYS) {
        stopPresenceHeartbeat();
        const tick = async () => {
            await upsertOwnPresence(STORAGE_KEYS, { markRead: chatPanelOpen }).catch(() => {});
            await refreshChatPresence(STORAGE_KEYS).catch(() => {});
            chatAvatarDirTick += 1;
            if (chatAvatarDirTick === 1 || chatAvatarDirTick % 5 === 0) {
                try {
                    const ok = await refreshChatAvatarDirectory(STORAGE_KEYS);
                    if (ok) {
                        linkPresenceToAvatarDirectory();
                        refreshChatMessagesAvatarUi();
                    }
                } catch (_) { /* optional */ }
            }
        };
        tick();
        chatPresenceTimer = window.setInterval(tick, CHAT_PRESENCE_MS);
    }

    function stopPresenceHeartbeat() {
        if (chatPresenceTimer) {
            window.clearInterval(chatPresenceTimer);
            chatPresenceTimer = null;
        }
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
            loadCachedSelfAvatar();
            loadChatRoomPreference(STORAGE_KEYS);
            chatSoundEnabled = getChatSettings(STORAGE_KEYS).sound !== false;
            try { await fetchOwnChatUserRecord(STORAGE_KEYS); } catch (_) { /* optional */ }
            try { await refreshChatAvatarDirectory(STORAGE_KEYS); } catch (_) { /* optional */ }
            await fetchMessages(STORAGE_KEYS);
            refreshChatMessagesAvatarUi();
            updateChatRoomTabsUi();
            const realtimeOk = await tryStartRealtime(STORAGE_KEYS);
            startPolling(STORAGE_KEYS);
            startPresenceHeartbeat(STORAGE_KEYS);
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
                position: fixed; bottom: 56px; right: 12px;
                /* Above footer shell (z-index ~1000001) so corner/edge grips receive clicks */
                z-index: 1000100;
                width: min(400px, calc(100vw - 16px));
                height: min(70vh, calc(100vh - 72px));
                display: none; flex-direction: column;
                background: var(--tm-chat-surface);
                border: 1px solid var(--tm-chat-line);
                border-radius: 14px;
                box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.06);
                overflow: visible;
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
            #tm-chat-panel.is-resizing { user-select: none; }
            #tm-chat-panel-inner {
                display: flex; flex-direction: column;
                flex: 1 1 auto; min-height: 0; min-width: 0;
                height: 100%; width: 100%;
                overflow: hidden;
                border-radius: 14px;
                background: inherit;
            }
            #tm-chat-composer-wrap {
                position: relative;
                z-index: 1;
                border-top: 1px solid var(--tm-chat-line);
                background: #fff;
                padding: 6px 8px 8px;
                flex-shrink: 0;
            }
            #tm-chat-resize,
            #tm-chat-resize-e,
            #tm-chat-resize-s {
                position: absolute;
                z-index: 40;
                touch-action: none;
                background: transparent;
            }
            #tm-chat-resize {
                right: -4px; bottom: -4px;
                width: 22px; height: 22px;
                cursor: nwse-resize;
                background:
                    linear-gradient(135deg, transparent 40%, #64748b 40%, #64748b 48%, transparent 48%),
                    linear-gradient(135deg, transparent 56%, #64748b 56%, #64748b 64%, transparent 64%),
                    linear-gradient(135deg, transparent 72%, #64748b 72%, #64748b 80%, transparent 80%);
                background-color: #fff;
                background-repeat: no-repeat;
                background-position: center;
                background-size: 12px 12px;
                border: 1px solid var(--tm-chat-line);
                border-radius: 6px;
                box-shadow: 0 1px 4px rgba(15, 23, 42, 0.15);
            }
            #tm-chat-resize-e {
                top: 12px; right: -5px; bottom: 18px;
                width: 10px;
                cursor: ew-resize;
            }
            #tm-chat-resize-s {
                left: 12px; right: 18px; bottom: -5px;
                height: 10px;
                cursor: ns-resize;
            }
            #tm-chat-resize:hover,
            #tm-chat-panel.is-resizing #tm-chat-resize {
                border-color: var(--tm-chat-accent, #2563eb);
                background-color: color-mix(in srgb, var(--tm-chat-accent, #2563eb) 12%, #fff);
            }
            #tm-chat-resize-e:hover,
            #tm-chat-resize-s:hover {
                background: color-mix(in srgb, var(--tm-chat-accent, #2563eb) 25%, transparent);
            }
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
                flex-shrink: 0;
            }
            .tm-chat-store-chip {
                display: inline-flex; align-items: center; gap: 3px;
                max-width: 110px; min-width: 0;
                font-size: 10px; font-weight: 600; line-height: 1.2;
                color: var(--tm-chat-accent);
                background: color-mix(in srgb, var(--tm-chat-accent) 12%, #fff);
                border: 1px solid color-mix(in srgb, var(--tm-chat-accent) 22%, #e2e8f0);
                border-radius: 999px; padding: 2px 7px 2px 6px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .tm-chat-store-chip::before {
                content: '🔒';
                font-size: 9px;
                flex-shrink: 0;
            }
            .tm-chat-store-chip[hidden] { display: none !important; }
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
            #tm-chat-store-row[hidden] { display: none !important; }
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
                position: relative;
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
                overflow: hidden;
            }
            .tm-chat-msg-avatar.is-photo {
                background: #cbd5e1; padding: 0;
            }
            .tm-chat-msg-avatar.is-photo img {
                width: 100%; height: 100%; object-fit: cover; display: block;
            }
            .tm-chat-avatar-previewable {
                cursor: zoom-in;
            }
            .tm-chat-avatar-previewable:focus-visible {
                outline: 2px solid var(--tm-chat-accent);
                outline-offset: 2px;
            }
            #tm-chat-avatar-preview {
                position: fixed; inset: 0; z-index: 1000300;
                display: flex; align-items: center; justify-content: center;
                padding: 24px; opacity: 0; pointer-events: none;
                transition: opacity 0.16s ease;
            }
            #tm-chat-avatar-preview.is-open {
                opacity: 1; pointer-events: auto;
            }
            #tm-chat-avatar-preview[hidden] { display: none !important; }
            .tm-chat-avatar-preview-backdrop {
                position: absolute; inset: 0; border: 0; padding: 0;
                background: rgba(15, 23, 42, 0.62);
                cursor: zoom-out;
            }
            .tm-chat-avatar-preview-card {
                position: relative; z-index: 1;
                display: flex; flex-direction: column; align-items: center; gap: 10px;
                max-width: min(420px, calc(100vw - 32px));
                transform: scale(0.92);
                transition: transform 0.18s ease;
            }
            #tm-chat-avatar-preview.is-open .tm-chat-avatar-preview-card {
                transform: scale(1);
            }
            .tm-chat-avatar-preview-img {
                width: min(320px, calc(100vw - 48px));
                height: min(320px, calc(100vw - 48px));
                max-height: min(70vh, 420px);
                object-fit: cover;
                border-radius: 22px;
                background: #cbd5e1;
                box-shadow: 0 24px 60px rgba(15, 23, 42, 0.45);
                border: 3px solid rgba(255, 255, 255, 0.92);
            }
            .tm-chat-avatar-preview-name {
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                text-shadow: 0 1px 8px rgba(15, 23, 42, 0.55);
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .tm-chat-avatar-preview-close {
                position: absolute; top: -10px; right: -10px;
                width: 32px; height: 32px; border-radius: 999px;
                border: 0; cursor: pointer;
                background: #fff; color: #0f172a;
                font-size: 20px; line-height: 1;
                box-shadow: 0 4px 14px rgba(15, 23, 42, 0.28);
            }
            .tm-chat-avatar-preview-close:hover { background: #f1f5f9; }
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
            #tm-chat-rooms {
                display: flex; gap: 6px; padding: 6px 10px 0;
                background: var(--tm-chat-surface);
            }
            #tm-chat-rooms[hidden] { display: none !important; }
            .tm-chat-room-btn {
                flex: 1; border: 1px solid var(--tm-chat-line); background: #f8fafc;
                border-radius: 8px; padding: 5px 8px; font-size: 11px; font-weight: 600;
                color: var(--tm-chat-muted); cursor: pointer;
            }
            .tm-chat-room-btn.is-active {
                background: color-mix(in srgb, var(--tm-chat-accent) 14%, #fff);
                color: var(--tm-chat-accent); border-color: color-mix(in srgb, var(--tm-chat-accent) 35%, #e2e8f0);
            }
            .tm-chat-presence-dot {
                width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
                box-shadow: 0 0 0 2px rgba(34,197,94,.2);
            }
            .tm-chat-presence-dot.is-idle { background: #94a3b8; box-shadow: none; }
            .tm-chat-presence-dot.is-warn { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245,158,11,.25); }
            .tm-chat-presence-hint { opacity: 0.75; font-size: 10px; }
            #tm-chat-presence {
                padding: 4px 12px; font-size: 11px; color: var(--tm-chat-muted);
                display: block; flex-shrink: 0;
                border-bottom: 1px solid var(--tm-chat-line);
                background: #f8fafc;
            }
            #tm-chat-presence[hidden] { display: none !important; }
            #tm-chat-presence strong { color: #166534; font-weight: 700; }
            .tm-chat-presence-row {
                display: flex; align-items: center; gap: 8px; min-width: 0;
            }
            .tm-chat-presence-faces { display: flex; align-items: center; }
            .tm-chat-presence-avatar {
                width: 22px; height: 22px; border-radius: 999px;
                display: inline-grid; place-items: center;
                font-size: 10px; font-weight: 700; color: #334155;
                background: #e2e8f0; border: 2px solid #f8fafc;
                margin-left: -6px; overflow: hidden; flex-shrink: 0;
            }
            .tm-chat-presence-faces .tm-chat-presence-avatar:first-child { margin-left: 0; }
            .tm-chat-presence-avatar.is-photo { background: #cbd5e1; padding: 0; }
            .tm-chat-presence-avatar.is-photo img {
                width: 100%; height: 100%; object-fit: cover; display: block;
            }
            .tm-chat-presence-more {
                margin-left: 4px; font-size: 10px; font-weight: 700; color: var(--tm-chat-muted);
            }
            .tm-chat-presence-meta {
                min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .tm-chat-presence-names { opacity: 0.85; }
            #tm-chat-typing {
                padding: 2px 12px 6px;
                font-size: 11px; color: var(--tm-chat-muted);
                border-bottom: 1px solid var(--tm-chat-line);
                background: #f8fafc;
                display: flex; align-items: center; gap: 6px; flex-shrink: 0;
            }
            #tm-chat-typing[hidden] { display: none !important; }
            .tm-chat-typing-dots { display: inline-flex; gap: 3px; }
            .tm-chat-typing-dots i {
                width: 4px; height: 4px; border-radius: 50%; background: #94a3b8;
                animation: tm-chat-typing-bounce 1.1s infinite ease-in-out;
            }
            .tm-chat-typing-dots i:nth-child(2) { animation-delay: 0.15s; }
            .tm-chat-typing-dots i:nth-child(3) { animation-delay: 0.3s; }
            @keyframes tm-chat-typing-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
                40% { transform: translateY(-3px); opacity: 1; }
            }
            #tm-chat-search-row {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 10px 6px; background: var(--tm-chat-surface);
            }
            #tm-chat-search {
                flex: 1; min-width: 0;
                border: 1px solid var(--tm-chat-line); border-radius: 8px;
                padding: 6px 10px; font-size: 12px; background: #f8fafc; color: var(--tm-chat-ink);
            }
            #tm-chat-filter-row {
                display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
                padding: 0 10px 6px; background: var(--tm-chat-surface);
                border-bottom: 1px solid var(--tm-chat-line);
            }
            .tm-chat-filter-chip {
                border: 1px solid var(--tm-chat-line);
                background: #f8fafc;
                color: #64748b;
                border-radius: 999px;
                padding: 3px 9px;
                font-size: 11px;
                font-weight: 650;
                cursor: pointer;
                line-height: 1.3;
            }
            .tm-chat-filter-chip:hover { background: #eff6ff; color: var(--tm-chat-accent); }
            .tm-chat-filter-chip.is-active {
                background: color-mix(in srgb, var(--tm-chat-accent) 14%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 40%, #fff);
                color: var(--tm-chat-accent);
            }
            #tm-chat-filter-from {
                max-width: 140px;
                border: 1px solid var(--tm-chat-line);
                background: #f8fafc;
                color: #64748b;
                border-radius: 999px;
                padding: 3px 8px;
                font-size: 11px;
                font-weight: 650;
                cursor: pointer;
            }
            #tm-chat-filter-from.is-active {
                background: color-mix(in srgb, var(--tm-chat-accent) 14%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 40%, #fff);
                color: var(--tm-chat-accent);
            }
            #tm-chat-mentions-btn {
                position: relative;
                width: 30px; height: 30px; flex-shrink: 0;
                border: 1px solid var(--tm-chat-line);
                border-radius: 10px;
                background: #f8fafc;
                cursor: pointer; font-size: 13px; font-weight: 800;
                color: #64748b;
            }
            #tm-chat-mentions-btn:hover { background: #eff6ff; color: var(--tm-chat-accent); }
            #tm-chat-mentions-btn.is-active {
                background: color-mix(in srgb, var(--tm-chat-accent) 16%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 40%, #fff);
                color: var(--tm-chat-accent);
            }
            #tm-chat-mentions-btn.has-unread { color: #b45309; }
            .tm-chat-mentions-badge {
                position: absolute; top: -5px; right: -5px;
                min-width: 16px; height: 16px; padding: 0 4px;
                border-radius: 999px; background: #f59e0b; color: #fff;
                font-size: 9px; font-weight: 800; line-height: 16px; text-align: center;
            }
            .tm-chat-msg.is-mention-unread .tm-chat-msg-bubble {
                box-shadow: inset 3px 0 0 #f59e0b;
            }
            .tm-chat-msg.is-mention-flash .tm-chat-msg-bubble {
                outline: 2px solid #f59e0b;
                outline-offset: 1px;
            }
            .tm-chat-repair-cards {
                display: flex; flex-direction: column; gap: 6px;
                margin-top: 6px;
            }
            .tm-chat-repair-card {
                display: block;
                text-decoration: none; color: inherit;
                border: 1px solid var(--tm-chat-line);
                border-radius: 10px;
                background: #f8fafc;
                padding: 7px 9px;
                max-width: 280px;
            }
            .tm-chat-repair-card:hover {
                background: #eff6ff;
                border-color: color-mix(in srgb, var(--tm-chat-accent) 35%, #fff);
            }
            .tm-chat-repair-card.is-loading,
            .tm-chat-repair-card.is-miss { opacity: 0.85; }
            .tm-chat-repair-card-id {
                display: block; font-weight: 800; font-size: 12px; color: var(--tm-chat-accent);
            }
            .tm-chat-repair-card-device {
                display: block; font-size: 11px; color: var(--tm-chat-ink); margin: 2px 0 4px;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .tm-chat-repair-card-grid {
                display: grid; grid-template-columns: 1fr; gap: 2px;
                font-size: 10.5px; color: var(--tm-chat-ink);
            }
            .tm-chat-repair-card-grid em {
                font-style: normal; color: var(--tm-chat-muted); margin-right: 6px; font-weight: 600;
            }
            .tm-chat-repair-card-miss { font-size: 11px; color: var(--tm-chat-muted); }
            #tm-chat-pinned {
                margin: 0 10px 6px; border: 1px solid #fde68a; background: #fffbeb;
                border-radius: 10px; overflow: hidden;
            }
            .tm-chat-pinned-inner {
                display: flex; align-items: center; gap: 8px; padding: 6px 8px; font-size: 12px;
            }
            .tm-chat-pinned-body { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .tm-chat-pinned-jump {
                border: 0; background: transparent; cursor: pointer; font-size: 14px; color: #92400e;
            }
            .tm-chat-msg-reply {
                display: block; width: 100%; text-align: left; border: 0; border-left: 3px solid var(--tm-chat-accent);
                background: color-mix(in srgb, var(--tm-chat-accent) 8%, #fff); border-radius: 0 8px 8px 0;
                padding: 4px 8px; margin: 0 0 6px; cursor: pointer; font-size: 11px; color: var(--tm-chat-muted);
            }
            .tm-chat-msg-reply strong { display: block; color: var(--tm-chat-ink); font-size: 11px; }
            .tm-chat-msg-ctx {
                position: fixed;
                z-index: 1000200;
                min-width: 220px;
                padding: 4px;
                border-radius: 10px;
                background: #fff;
                border: 1px solid var(--tm-chat-line, #e2e8f0);
                box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
            }
            .tm-chat-msg-ctx[hidden] { display: none !important; }
            .tm-chat-ctx-item {
                display: flex; align-items: center; gap: 8px;
                width: 100%; border: 0; background: transparent;
                text-align: left; padding: 8px 10px; border-radius: 8px;
                font-size: 12.5px; color: #0f172a; cursor: pointer;
            }
            .tm-chat-ctx-item:hover, .tm-chat-ctx-item:focus {
                background: #f1f5f9; outline: none;
            }
            .tm-chat-ctx-item.is-danger { color: #b91c1c; }
            .tm-chat-ctx-item.is-danger:hover { background: #fef2f2; }
            .tm-chat-ctx-ico { width: 18px; text-align: center; flex-shrink: 0; }
            .tm-chat-ctx-sep {
                height: 1px; margin: 4px 6px; background: #e2e8f0;
            }
            .tm-chat-ctx-reacts {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 4px;
                padding: 4px 6px 6px;
            }
            .tm-chat-ctx-react {
                display: grid; place-items: center;
                width: 100%; min-height: 32px;
                border: 1px solid transparent;
                border-radius: 8px;
                background: transparent;
                font-size: 18px; line-height: 1;
                cursor: pointer;
            }
            .tm-chat-ctx-react:hover, .tm-chat-ctx-react:focus {
                background: #f1f5f9; outline: none;
            }
            .tm-chat-ctx-react.is-mine {
                background: color-mix(in srgb, var(--tm-chat-accent, #2563eb) 14%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent, #2563eb) 35%, #fff);
            }
            .tm-chat-msg.is-ctx-target .tm-chat-msg-bubble {
                outline: 2px solid color-mix(in srgb, var(--tm-chat-accent) 45%, transparent);
                outline-offset: 1px;
            }
            .tm-chat-mention {
                color: var(--tm-chat-accent); font-weight: 700; background: color-mix(in srgb, var(--tm-chat-accent) 12%, transparent);
                border-radius: 4px; padding: 0 2px;
            }
            .tm-chat-mention.is-me { background: #fef3c7; color: #92400e; }
            .tm-chat-msg-edited { margin-left: 6px; opacity: .65; font-size: 10px; }
            .tm-chat-msg-seen { margin-left: 6px; color: var(--tm-chat-accent); font-size: 11px; letter-spacing: -1px; }
            .tm-chat-msg-seen.is-sent { color: var(--tm-chat-muted); }
            .tm-chat-msg-pinmark { margin-left: 4px; font-size: 10px; }
            .tm-chat-msg-reactions {
                display: flex; flex-wrap: wrap; gap: 4px;
                margin-top: 5px;
            }
            .tm-chat-react-chip {
                display: inline-flex; align-items: center; gap: 3px;
                border: 1px solid var(--tm-chat-line);
                background: #f8fafc;
                border-radius: 999px;
                padding: 1px 7px 1px 5px;
                font-size: 11px;
                line-height: 1.4;
                color: var(--tm-chat-ink);
                cursor: pointer;
            }
            .tm-chat-react-chip:hover { background: #eff6ff; border-color: color-mix(in srgb, var(--tm-chat-accent) 35%, #fff); }
            .tm-chat-react-chip.is-mine {
                background: color-mix(in srgb, var(--tm-chat-accent) 14%, #fff);
                border-color: color-mix(in srgb, var(--tm-chat-accent) 40%, #fff);
            }
            .tm-chat-react-chip span { font-weight: 650; font-size: 10px; color: var(--tm-chat-muted); }
            .tm-chat-msg.is-mine .tm-chat-react-chip { background: rgba(255,255,255,0.72); }
            .tm-chat-msg.is-deleted .tm-chat-msg-deleted { font-style: italic; color: var(--tm-chat-muted); }
            #tm-chat-reply-bar {
                margin: 0 8px 4px; border: 1px solid var(--tm-chat-line); border-radius: 10px; background: #f8fafc;
            }
            .tm-chat-reply-bar-inner { display: flex; align-items: center; gap: 8px; padding: 6px 8px; }
            .tm-chat-reply-bar-text { flex: 1; min-width: 0; font-size: 11px; color: var(--tm-chat-muted); }
            .tm-chat-reply-bar-text strong { display: block; color: var(--tm-chat-ink); }
            #tm-chat-reply-clear { border: 0; background: transparent; cursor: pointer; font-size: 16px; color: var(--tm-chat-muted); }
            #tm-chat-mention-menu {
                position: absolute; left: 48px; right: 56px; bottom: 52px; z-index: 5;
                background: #fff; border: 1px solid var(--tm-chat-line); border-radius: 10px;
                box-shadow: 0 8px 24px rgba(15,23,42,.12); max-height: 140px; overflow: auto;
            }
            #tm-chat-composer-wrap { position: relative; }
            .tm-chat-mention-item {
                display: block; width: 100%; text-align: left; border: 0; background: transparent;
                padding: 8px 10px; font-size: 12px; cursor: pointer; color: var(--tm-chat-ink);
            }
            .tm-chat-mention-item:hover, .tm-chat-mention-item.is-active { background: #f1f5f9; }
            #tm-chat-toggle-btn.tm-chat-mention-ping {
                box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.75);
            }
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
            <div id="tm-chat-panel-inner">
            <div id="tm-chat-header">
                <div class="tm-chat-header-brand">
                    <div class="tm-chat-header-icon" aria-hidden="true">💬</div>
                    <div id="tm-chat-title-wrap">
                        <span class="tm-chat-live-dot" id="tm-chat-live-dot" data-status="idle" title="Κατάσταση" aria-hidden="true"></span>
                        <span id="tm-chat-title">Office Chat</span>
                        <span id="tm-chat-store-chip" class="tm-chat-store-chip" hidden title="Κατάστημα από login"></span>
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
            <div id="tm-chat-rooms" role="tablist" aria-label="Κανάλια" ${CHAT_STORE_ROOMS_ENABLED ? '' : 'hidden'}>
                <button type="button" id="tm-chat-room-office" class="tm-chat-room-btn is-active" role="tab">Όλοι</button>
                <button type="button" id="tm-chat-room-store" class="tm-chat-room-btn" role="tab">Κατάστημα</button>
            </div>
            <div id="tm-chat-presence" hidden></div>
            <div id="tm-chat-typing" hidden aria-live="polite"></div>
            <div id="tm-chat-store-row">
                <label for="tm-chat-store-select">Κατ.</label>
                <select id="tm-chat-store-select" title="Από το κατάστημα/προφίλ του MyManager login"></select>
            </div>
            <div id="tm-chat-search-row">
                <input type="search" id="tm-chat-search" placeholder="Αναζήτηση… @όνομα · #επισκευή" autocomplete="off" spellcheck="false">
                <button type="button" id="tm-chat-mentions-btn" title="Αναφορές @" aria-label="Αναφορές">@</button>
            </div>
            <div id="tm-chat-filter-row" aria-label="Φίλτρα αναζήτησης">
                <button type="button" class="tm-chat-filter-chip" data-chat-filter="images" aria-pressed="false" title="Μόνο μηνύματα με εικόνες">📷 Εικόνες</button>
                <button type="button" class="tm-chat-filter-chip" data-chat-filter="repairs" aria-pressed="false" title="Μόνο μηνύματα με #επισκευή"># Επισκευές</button>
                <select id="tm-chat-filter-from" title="Μόνο από χρήστη" aria-label="Μόνο από χρήστη">
                    <option value="">Από: Όλοι</option>
                </select>
            </div>
            <div id="tm-chat-pinned" hidden ${CHAT_PIN_ENABLED ? '' : 'data-disabled="1"'}></div>
            <div id="tm-chat-messages"></div>
            <div id="tm-chat-composer-wrap">
                <div id="tm-chat-emoji-picker" role="dialog" aria-label="Emoji picker" hidden>
                    <div class="tm-chat-emoji-grid">${emojiButtons}</div>
                </div>
                <div id="tm-chat-mention-menu" hidden></div>
                <div id="tm-chat-reply-bar" hidden></div>
                <div id="tm-chat-pending-file" aria-live="polite">
                    <span class="tm-chat-pending-icon" aria-hidden="true">📎</span>
                    <span class="tm-chat-pending-name"></span>
                    <span class="tm-chat-pending-size"></span>
                    <button type="button" id="tm-chat-pending-clear" title="Αφαίρεση αρχείου" aria-label="Αφαίρεση αρχείου">&times;</button>
                </div>
                <div id="tm-chat-composer">
                    <button type="button" id="tm-chat-attach-btn" title="Επισύναψη αρχείου" aria-label="Επισύναψη αρχείου">📎</button>
                    <button type="button" id="tm-chat-emoji-toggle" title="Emoji" aria-label="Emoji" aria-expanded="false">😊</button>
                    <textarea id="tm-chat-input" maxlength="${CHAT_MAX_LEN}" placeholder="Μήνυμα… @όνομα · Enter" rows="1"></textarea>
                    <button type="button" id="tm-chat-send" title="Αποστολή" aria-label="Αποστολή">➤</button>
                </div>
                <input type="file" id="tm-chat-file-input" class="tm-chat-file-input" tabindex="-1" aria-hidden="true" accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
            </div>
            </div>
            <div id="tm-chat-msg-ctx" class="tm-chat-msg-ctx" hidden role="menu" aria-label="Επιλογές μηνύματος"></div>
            <div id="tm-chat-resize-e" data-tm-resize="e" title="Αλλαγή πλάτους" aria-label="Αλλαγή πλάτους"></div>
            <div id="tm-chat-resize-s" data-tm-resize="s" title="Αλλαγή ύψους" aria-label="Αλλαγή ύψους"></div>
            <div id="tm-chat-resize" data-tm-resize="se" title="Αλλαγή μεγέθους" aria-label="Αλλαγή μεγέθους"></div>
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

    function hideChatAvatarPreview() {
        const overlay = document.getElementById('tm-chat-avatar-preview');
        if (!overlay) return;
        overlay.classList.remove('is-open');
        overlay.setAttribute('hidden', '');
        overlay.setAttribute('aria-hidden', 'true');
        const img = overlay.querySelector('.tm-chat-avatar-preview-img');
        if (img) {
            img.removeAttribute('src');
            img.alt = '';
        }
        const nameEl = overlay.querySelector('.tm-chat-avatar-preview-name');
        if (nameEl) nameEl.textContent = '';
    }

    function ensureChatAvatarPreviewOverlay() {
        let overlay = document.getElementById('tm-chat-avatar-preview');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'tm-chat-avatar-preview';
        overlay.setAttribute('hidden', '');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Προεπισκόπηση φωτογραφίας');
        overlay.innerHTML = `
            <button type="button" class="tm-chat-avatar-preview-backdrop" aria-label="Κλείσιμο"></button>
            <div class="tm-chat-avatar-preview-card">
                <img class="tm-chat-avatar-preview-img" alt="">
                <div class="tm-chat-avatar-preview-name"></div>
                <button type="button" class="tm-chat-avatar-preview-close" title="Κλείσιμο" aria-label="Κλείσιμο">&times;</button>
            </div>
        `;
        document.body.appendChild(overlay);
        const close = () => hideChatAvatarPreview();
        overlay.querySelector('.tm-chat-avatar-preview-backdrop')?.addEventListener('click', close);
        overlay.querySelector('.tm-chat-avatar-preview-close')?.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        return overlay;
    }

    function showChatAvatarPreview(url, name) {
        const src = String(url || '').trim();
        if (!src) return;
        const overlay = ensureChatAvatarPreviewOverlay();
        const img = overlay.querySelector('.tm-chat-avatar-preview-img');
        const nameEl = overlay.querySelector('.tm-chat-avatar-preview-name');
        if (img) {
            img.src = src;
            img.alt = String(name || 'Φωτογραφία προφίλ');
        }
        if (nameEl) nameEl.textContent = String(name || '').trim();
        overlay.removeAttribute('hidden');
        overlay.setAttribute('aria-hidden', 'false');
        // Force reflow so the open transition runs
        void overlay.offsetWidth;
        overlay.classList.add('is-open');
        try { overlay.querySelector('.tm-chat-avatar-preview-close')?.focus(); } catch (_) { /* ignore */ }
    }

    function wireChatAvatarPreview(panel) {
        if (!panel || panel.dataset.tmChatAvatarPreviewWired === '1') return;
        panel.dataset.tmChatAvatarPreviewWired = '1';

        const openFromEl = (el) => {
            if (!el || !el.classList.contains('is-photo')) return;
            const url = el.getAttribute('data-avatar-url')
                || el.querySelector('img')?.currentSrc
                || el.querySelector('img')?.src
                || '';
            const name = el.getAttribute('data-avatar-name')
                || el.getAttribute('title')
                || '';
            if (!url) return;
            showChatAvatarPreview(url, String(name).replace(/\s*·\s*προεπισκόπηση$/i, '').trim());
        };

        panel.addEventListener('click', (e) => {
            const el = e.target.closest('.tm-chat-avatar-previewable');
            if (!el || !panel.contains(el)) return;
            e.preventDefault();
            e.stopPropagation();
            openFromEl(el);
        });

        panel.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const el = e.target.closest?.('.tm-chat-avatar-previewable');
            if (!el || !panel.contains(el)) return;
            e.preventDefault();
            openFromEl(el);
        });

        if (!wireChatAvatarPreview._escWired) {
            wireChatAvatarPreview._escWired = true;
            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                const overlay = document.getElementById('tm-chat-avatar-preview');
                if (!overlay || !overlay.classList.contains('is-open')) return;
                e.preventDefault();
                hideChatAvatarPreview();
            });
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

    function hideChatMessageContextMenu() {
        const menu = document.getElementById('tm-chat-msg-ctx');
        if (menu) {
            menu.hidden = true;
            menu.innerHTML = '';
            delete menu.dataset.msgId;
        }
        document.querySelectorAll('.tm-chat-msg.is-ctx-target').forEach((el) => {
            el.classList.remove('is-ctx-target');
        });
    }

    function positionChatContextMenu(menu, clientX, clientY) {
        if (!menu) return;
        menu.hidden = false;
        menu.style.left = '0px';
        menu.style.top = '0px';
        const rect = menu.getBoundingClientRect();
        const pad = 8;
        let left = clientX;
        let top = clientY;
        if (left + rect.width > window.innerWidth - pad) left = window.innerWidth - rect.width - pad;
        if (top + rect.height > window.innerHeight - pad) top = window.innerHeight - rect.height - pad;
        if (left < pad) left = pad;
        if (top < pad) top = pad;
        menu.style.left = `${Math.round(left)}px`;
        menu.style.top = `${Math.round(top)}px`;
    }

    async function runChatMessageAction(STORAGE_KEYS, act, messageId, extra = null) {
        const msg = findChatMessageById(messageId);
        if (!msg || isChatMessageDeleted(msg)) return;
        if (act === 'reply') {
            setChatReplyTarget(msg);
            return;
        }
        if (act === 'copy') {
            await copyChatMessageText(messageId);
            return;
        }
        if (act === 'react') {
            const emoji = String(extra?.emoji || '').trim();
            if (emoji) await toggleChatReaction(STORAGE_KEYS, messageId, emoji);
            return;
        }
        if (act === 'pin') {
            if (!CHAT_PIN_ENABLED) return;
            await togglePinChatMessage(STORAGE_KEYS, messageId);
            return;
        }
        if (act === 'delete') {
            if (!isOwnChatMessage(msg)) {
                setChatStatus('error', 'Μπορείς να διαγράψεις μόνο τα δικά σου μηνύματα');
                return;
            }
            if (!window.confirm('Διαγραφή του μηνύματός σου;')) return;
            await softDeleteChatMessage(STORAGE_KEYS, messageId);
            return;
        }
        if (act === 'edit') {
            if (!isOwnChatMessage(msg)) {
                setChatStatus('error', 'Μπορείς να επεξεργαστείς μόνο τα δικά σου μηνύματα');
                return;
            }
            const next = window.prompt('Επεξεργασία μηνύματος', String(msg.text || ''));
            if (next == null) return;
            await editChatMessage(STORAGE_KEYS, messageId, next);
        }
    }

    function showChatMessageContextMenu(STORAGE_KEYS, msgEl, clientX, clientY) {
        const menu = document.getElementById('tm-chat-msg-ctx');
        if (!menu || !msgEl) return;
        const id = msgEl.getAttribute('data-id');
        const msg = findChatMessageById(id);
        if (!msg || isChatMessageDeleted(msg)) return;

        hideChatMessageContextMenu();
        msgEl.classList.add('is-ctx-target');
        if (menu.parentElement !== document.body) {
            document.body.appendChild(menu);
        }
        menu.dataset.msgId = id;
        const canManage = isOwnChatMessage(msg);
        const reactions = getMessageReactions(msg);
        const me = getDisplayName();
        const reactButtons = CHAT_REACTION_EMOJIS.map((emoji) => {
            const mine = me && (reactions[emoji] || []).includes(me);
            return `<button type="button" class="tm-chat-ctx-react${mine ? ' is-mine' : ''}" role="menuitem" data-act="react" data-emoji="${escapeHtml(emoji)}" title="${mine ? `Αφαίρεση ${emoji}` : emoji}" aria-label="${mine ? `Αφαίρεση ${emoji}` : emoji}">${emoji}</button>`;
        }).join('');
        menu.innerHTML = `
            <button type="button" class="tm-chat-ctx-item" role="menuitem" data-act="reply">
                <span class="tm-chat-ctx-ico" aria-hidden="true">↩</span><span>Απάντηση</span>
            </button>
            <button type="button" class="tm-chat-ctx-item" role="menuitem" data-act="copy">
                <span class="tm-chat-ctx-ico" aria-hidden="true">📋</span><span>Αντιγραφή</span>
            </button>
            <div class="tm-chat-ctx-sep" role="separator"></div>
            <div class="tm-chat-ctx-reacts" role="group" aria-label="Reactions">${reactButtons}</div>
            ${CHAT_PIN_ENABLED ? `<div class="tm-chat-ctx-sep" role="separator"></div>
            <button type="button" class="tm-chat-ctx-item" role="menuitem" data-act="pin">
                <span class="tm-chat-ctx-ico" aria-hidden="true">📌</span><span>${escapeHtml(isMessagePinned(msg) ? 'Ξεκαρφίτσωμα' : 'Καρφίτσωμα')}</span>
            </button>` : ''}
            ${canManage ? `
            <div class="tm-chat-ctx-sep" role="separator"></div>
            <button type="button" class="tm-chat-ctx-item" role="menuitem" data-act="edit">
                <span class="tm-chat-ctx-ico" aria-hidden="true">✎</span><span>Επεξεργασία</span>
            </button>
            <button type="button" class="tm-chat-ctx-item is-danger" role="menuitem" data-act="delete">
                <span class="tm-chat-ctx-ico" aria-hidden="true">🗑</span><span>Διαγραφή</span>
            </button>` : ''}
        `;
        positionChatContextMenu(menu, clientX, clientY);
        menu.querySelector('.tm-chat-ctx-item, .tm-chat-ctx-react')?.focus();
    }

    function wireChatMessageActions(STORAGE_KEYS) {
        const list = document.getElementById('tm-chat-messages');
        const pinned = document.getElementById('tm-chat-pinned');
        const menu = document.getElementById('tm-chat-msg-ctx');
        if (list && list.dataset.tmChatActionsWired !== '1') {
            list.dataset.tmChatActionsWired = '1';
            list.addEventListener('click', (e) => {
                const reactBtn = e.target.closest('[data-react]');
                if (reactBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const msgEl = reactBtn.closest('.tm-chat-msg');
                    const id = msgEl?.getAttribute('data-id');
                    const emoji = reactBtn.getAttribute('data-react');
                    if (id && emoji) toggleChatReaction(STORAGE_KEYS, id, emoji);
                    return;
                }
                const jump = e.target.closest('[data-jump]');
                if (!jump) return;
                const id = jump.getAttribute('data-jump');
                const el = list.querySelector(`.tm-chat-msg[data-id="${CSS.escape(id)}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el?.classList.add('is-new');
            });
            list.addEventListener('contextmenu', (e) => {
                const msgEl = e.target.closest('.tm-chat-msg');
                if (!msgEl || !list.contains(msgEl)) return;
                if (e.target.closest('a, button, input, textarea')) return;
                e.preventDefault();
                e.stopPropagation();
                showChatMessageContextMenu(STORAGE_KEYS, msgEl, e.clientX, e.clientY);
            });
        }
        if (menu && menu.dataset.tmChatCtxWired !== '1') {
            menu.dataset.tmChatCtxWired = '1';
            menu.addEventListener('click', async (e) => {
                const item = e.target.closest('.tm-chat-ctx-item, .tm-chat-ctx-react');
                if (!item) return;
                e.preventDefault();
                const act = item.getAttribute('data-act');
                const id = menu.dataset.msgId;
                const emoji = item.getAttribute('data-emoji') || '';
                hideChatMessageContextMenu();
                if (act && id) await runChatMessageAction(STORAGE_KEYS, act, id, { emoji });
            });
            menu.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        if (!wireChatMessageActions._docHideWired) {
            wireChatMessageActions._docHideWired = true;
            document.addEventListener('click', (e) => {
                if (e.target.closest('#tm-chat-msg-ctx')) return;
                hideChatMessageContextMenu();
            }, true);
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') hideChatMessageContextMenu();
            });
            window.addEventListener('resize', hideChatMessageContextMenu);
            document.getElementById('tm-chat-messages')?.addEventListener('scroll', hideChatMessageContextMenu, { passive: true });
        }
        if (CHAT_PIN_ENABLED && pinned && pinned.dataset.tmChatPinnedWired !== '1') {
            pinned.dataset.tmChatPinnedWired = '1';
            pinned.addEventListener('click', (e) => {
                const btn = e.target.closest('.tm-chat-pinned-jump, .tm-chat-pinned-inner');
                const id = btn?.getAttribute('data-id');
                if (!id) return;
                const el = document.querySelector(`#tm-chat-messages .tm-chat-msg[data-id="${CSS.escape(id)}"]`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        } else if (pinned) {
            pinned.hidden = true;
            pinned.innerHTML = '';
        }
    }

    function wireChatRoomsAndSearch(STORAGE_KEYS) {
        const panel = document.getElementById('tm-chat-panel');
        if (!panel || panel.dataset.tmChatRoomsWired === '1') return;
        panel.dataset.tmChatRoomsWired = '1';
        if (CHAT_STORE_ROOMS_ENABLED) {
            panel.querySelector('#tm-chat-room-office')?.addEventListener('click', () => setChatRoomMode(STORAGE_KEYS, 'office'));
            panel.querySelector('#tm-chat-room-store')?.addEventListener('click', () => setChatRoomMode(STORAGE_KEYS, 'store'));
        }
        const search = panel.querySelector('#tm-chat-search');
        search?.addEventListener('input', () => {
            chatSearchQuery = String(search.value || '');
            renderMessages({ force: true });
        });
        panel.querySelectorAll('[data-chat-filter]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = btn.getAttribute('data-chat-filter');
                if (key === 'images') chatFilterImages = !chatFilterImages;
                else if (key === 'repairs') chatFilterRepairs = !chatFilterRepairs;
                renderMessages({ force: true });
            });
        });
        const fromSelect = panel.querySelector('#tm-chat-filter-from');
        fromSelect?.addEventListener('change', () => {
            chatFilterFrom = String(fromSelect.value || '').trim();
            renderMessages({ force: true });
        });
        const mentionsBtn = panel.querySelector('#tm-chat-mentions-btn');
        mentionsBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.shiftKey || e.altKey) {
                cycleChatMentionJump();
                return;
            }
            if (chatMentionsOnly) {
                // Already filtering: jump next unread/mention; second plain click without unread toggles off via toggle
                const unread = getMentionMessages().filter((m) => chatUnreadMentionIds.has(String(m.id)));
                if (unread.length) {
                    cycleChatMentionJump();
                } else {
                    toggleChatMentionsFilter();
                }
                return;
            }
            toggleChatMentionsFilter();
        });
        updateChatRoomTabsUi();
        updateChatMentionsBtnUi();
        updateChatFilterUi();
    }

    function hideChatMentionMenu() {
        const menu = document.getElementById('tm-chat-mention-menu');
        if (!menu) return;
        menu.hidden = true;
        menu.innerHTML = '';
    }

    function updateChatMentionMenu(input) {
        const menu = document.getElementById('tm-chat-mention-menu');
        if (!menu || !input) return;
        const val = input.value || '';
        const caret = input.selectionStart ?? val.length;
        const before = val.slice(0, caret);
        const m = before.match(/@([\p{L}\p{N}_.-]{0,40})$/u);
        if (!m) {
            hideChatMentionMenu();
            return;
        }
        const q = String(m[1] || '').toLowerCase();
        const names = collectChatMentionNames().filter((n) => !q || n.toLowerCase().includes(q) || greekToLatinSlug(n).includes(q));
        if (!names.length) {
            hideChatMentionMenu();
            return;
        }
        menu.hidden = false;
        menu.innerHTML = names.slice(0, 8).map((n, i) => (
            `<button type="button" class="tm-chat-mention-item${i === 0 ? ' is-active' : ''}" data-name="${escapeHtml(n)}">@${escapeHtml(n)}</button>`
        )).join('');
        menu.querySelectorAll('.tm-chat-mention-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name') || '';
                const start = before.lastIndexOf('@');
                const next = `${val.slice(0, start)}@${name} ${val.slice(caret)}`;
                input.value = next.slice(0, CHAT_MAX_LEN);
                const pos = start + name.length + 2;
                input.focus();
                try { input.setSelectionRange(pos, pos); } catch (_) { /* ignore */ }
                hideChatMentionMenu();
            });
        });
    }

    function wireChatPanelControls(panel, STORAGE_KEYS) {
        if (!panel || panel.dataset.tmChatControlsWired === '1') return;
        panel.dataset.tmChatControlsWired = '1';
        panel.querySelector('#tm-chat-close-btn')?.addEventListener('click', () => {
            setChatEmojiPickerOpen(false);
            hideChatMentionMenu();
            closeChatPanel();
        });
        panel.querySelector('#tm-chat-refresh-btn')?.addEventListener('click', () => {
            connectChat(STORAGE_KEYS);
        });
        const muteBtn = panel.querySelector('#tm-chat-mute-btn');
        if (muteBtn) {
            const syncMute = () => {
                const quiet = isQuietHoursActive(getChatSettings(STORAGE_KEYS));
                muteBtn.textContent = chatMuted ? '🔕' : '🔔';
                muteBtn.classList.toggle('is-muted', chatMuted || quiet);
                muteBtn.title = chatMuted
                    ? 'Άρση σίγασης υπενθύμισης'
                    : (quiet
                        ? 'Ήσυχες ώρες (εκτός ωραρίου) — οι υπενθυμίσεις είναι off'
                        : 'Σίγαση υπενθύμισης');
                updateUnreadBadge();
            };
            syncMute();
            muteBtn.addEventListener('click', () => {
                chatMuted = !chatMuted;
                const keys = chatKeys(STORAGE_KEYS);
                GM_setValue(keys.muted, chatMuted);
                syncMute();
            });
            if (!wireChatPanelControls._quietTimer) {
                wireChatPanelControls._quietTimer = window.setInterval(() => {
                    const btn = document.getElementById('tm-chat-mute-btn');
                    if (!btn) return;
                    const quiet = isQuietHoursActive();
                    btn.classList.toggle('is-muted', chatMuted || quiet);
                    if (!chatMuted) {
                        btn.title = quiet
                            ? 'Ήσυχες ώρες (εκτός ωραρίου) — οι υπενθυμίσεις είναι off'
                            : 'Σίγαση υπενθύμισης';
                    }
                }, 60000);
            }
        }
        wireComposer(STORAGE_KEYS);
        wireChatEmojiPicker();
        wireChatFileAttach(STORAGE_KEYS);
        wireChatAvatarPreview(panel);
        wireChatPasteDrop(STORAGE_KEYS);
        wireChatStoreSelect(STORAGE_KEYS);
        wireChatRoomsAndSearch(STORAGE_KEYS);
        wireChatMessageActions(STORAGE_KEYS);
        wireChatPanelDrag(panel, STORAGE_KEYS);
        wireChatPanelResize(panel, STORAGE_KEYS);
        applyChatPanelGeometry(panel, STORAGE_KEYS);
        updateChatPendingFileUi();
        updateChatStatusUi();
        updateChatReplyBarUi();
        updateChatRoomTabsUi();
        renderPresenceUi();
        if (CHAT_PIN_ENABLED) renderPinnedStrip();
    }

    function ensureChatPanel(STORAGE_KEYS) {
        let panel = document.getElementById('tm-chat-panel');
        const needsRebuild = !panel || panel.getAttribute('data-tm-chat-ui') !== '18';
        if (needsRebuild) {
            const wasOpen = !!(panel && panel.classList.contains('is-open'));
            hideChatMessageContextMenu();
            document.querySelectorAll('#tm-chat-msg-ctx').forEach((el) => el.remove());
            if (panel) panel.remove();
            panel = document.createElement('div');
            panel.id = 'tm-chat-panel';
            panel.setAttribute('data-tm-chat-ui', '18');
            panel.innerHTML = buildChatPanelHtml();
            document.body.appendChild(panel);
            wireChatPanelControls(panel, STORAGE_KEYS);
            if (wasOpen) {
                panel.classList.add('is-open');
                chatPanelOpen = true;
                renderMessages();
                renderPresenceUi();
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
        const handles = panel.querySelectorAll('[data-tm-resize]');
        if (!handles.length) return;

        let resizing = false;
        let mode = 'se';
        let startX = 0;
        let startY = 0;
        let startW = 0;
        let startH = 0;
        let activeHandle = null;
        let pointerId = null;

        const onMove = (clientX, clientY) => {
            if (!resizing) return;
            const dx = clientX - startX;
            const dy = clientY - startY;
            let nextW = startW;
            let nextH = startH;
            if (mode === 'e' || mode === 'se') nextW = startW + dx;
            if (mode === 's' || mode === 'se') nextH = startH + dy;
            const size = clampChatPanelSize(nextW, nextH);
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
            activeHandle = null;
            mode = 'se';
            panel.classList.remove('is-resizing');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            saveChatPanelGeometry(panel, STORAGE_KEYS);
        };

        const startResize = (clientX, clientY, id, handle, resizeMode) => {
            ensureChatPanelTopLeft(panel);
            const rect = panel.getBoundingClientRect();
            const size = clampChatPanelSize(rect.width, rect.height);
            panel.style.width = `${size.width}px`;
            panel.style.height = `${size.height}px`;
            resizing = true;
            mode = resizeMode || 'se';
            activeHandle = handle;
            pointerId = id != null ? id : null;
            startX = clientX;
            startY = clientY;
            startW = size.width;
            startH = size.height;
            panel.classList.add('is-resizing');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = mode === 'e' ? 'ew-resize' : (mode === 's' ? 'ns-resize' : 'nwse-resize');
        };

        handles.forEach((handle) => {
            handle.addEventListener('pointerdown', (e) => {
                if (e.button != null && e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                startResize(e.clientX, e.clientY, e.pointerId, handle, handle.getAttribute('data-tm-resize') || 'se');
                try { handle.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
            });

            handle.addEventListener('pointermove', (e) => {
                if (!resizing || activeHandle !== handle) return;
                if (pointerId != null && e.pointerId !== pointerId) return;
                e.preventDefault();
                onMove(e.clientX, e.clientY);
            });

            const endPointer = (e) => {
                if (!resizing || activeHandle !== handle) return;
                if (pointerId != null && e.pointerId !== pointerId) return;
                try { handle.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
                stopResize();
            };
            handle.addEventListener('pointerup', endPointer);
            handle.addEventListener('pointercancel', endPointer);

            handle.addEventListener('mousedown', (e) => {
                if (window.PointerEvent) return;
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                startResize(e.clientX, e.clientY, null, handle, handle.getAttribute('data-tm-resize') || 'se');
            });
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
        updateChatRoomTabsUi();
        panel.classList.add('is-open');
        chatPanelOpen = true;
        chatUnread = 0;
        updateUnreadBadge();
        requestChatDesktopNotifyPermission();
        renderMessages({ force: true });
        restoreChatDraftToInput(STORAGE_KEYS);
        document.getElementById('tm-chat-input')?.focus();
        updateChatMentionsBtnUi();
        startTypingUiTicker();
        upsertOwnPresence(STORAGE_KEYS, { markRead: true }).catch(() => {});
        refreshChatPresence(STORAGE_KEYS).catch(() => {});
        if (chatStatus !== 'online' && chatStatus !== 'connecting') {
            connectChat(STORAGE_KEYS);
        }
    }

    function closeChatPanel() {
        const panel = document.getElementById('tm-chat-panel');
        if (!panel) return;
        const input = document.getElementById('tm-chat-input');
        if (input && chatStorageKeys) saveChatDraft(chatStorageKeys, input.value);
        if (chatStorageKeys) clearOwnTypingPulse(chatStorageKeys);
        stopTypingUiTicker();
        setChatEmojiPickerOpen(false);
        hideChatMentionMenu();
        hideChatMessageContextMenu();
        hideChatAvatarPreview();
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
            hideChatMentionMenu();
            sendBtn.disabled = true;
            const prevLabel = sendBtn.textContent;
            sendBtn.textContent = '…';
            setChatStatus('online', file ? 'Αποστολή αρχείου…' : 'Αποστολή…');
            try {
                const result = await sendChatMessage(STORAGE_KEYS, text, file);
                if (result.ok) {
                    setChatEmojiPickerOpen(false);
                    clearOwnTypingPulse(STORAGE_KEYS);
                    input.value = '';
                    clearChatDraft(STORAGE_KEYS);
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
        input.addEventListener('input', () => {
            updateChatMentionMenu(input);
            saveChatDraft(STORAGE_KEYS, input.value);
            if (String(input.value || '').trim()) scheduleOwnTypingPulse(STORAGE_KEYS);
            else clearOwnTypingPulse(STORAGE_KEYS);
        });
        input.addEventListener('blur', () => {
            window.setTimeout(() => clearOwnTypingPulse(STORAGE_KEYS), 200);
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideChatMentionMenu();
                if (chatReplyTarget) setChatReplyTarget(null);
                return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doSend();
            }
        });
        restoreChatDraftToInput(STORAGE_KEYS);
    }

    function initOfficeChatFeature(config, STORAGE_KEYS) {
        if (chatInitDone) return;

        const settings = getChatSettings(STORAGE_KEYS);
        const enabled = settings.enabled === true || config?.officeChatEnabled === true;
        if (!enabled) return;

        chatInitDone = true;
        chatStorageKeys = STORAGE_KEYS;
        chatMuted = settings.muted;
        chatSoundEnabled = settings.sound !== false;
        loadChatRoomPreference(STORAGE_KEYS);
        loadLocalChatPins();
        loadLocalChatReplies();
        loadLocalChatReactions();
        loadUnreadChatMentions();
        loadCachedSelfAvatar();
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
    /** PocketBase auth for suite features (order history, etc). Works even when Chat UI is disabled. */
    window.ensureMymanPocketBaseAuth = async function ensureMymanPocketBaseAuth(STORAGE_KEYS) {
        const keys = STORAGE_KEYS || window.STORAGE_KEYS || {};
        const ensured = await ensureOfficeChatAccount(keys);
        if (!ensured?.ok) throw new Error(ensured?.message || 'PocketBase auth failed');
        return ensureAuth(keys);
    };
    window.ensureOfficeChatAuthToken = async function ensureOfficeChatAuthToken(STORAGE_KEYS) {
        return window.ensureMymanPocketBaseAuth(STORAGE_KEYS);
    };
    window.getOfficeChatStoreName = function getOfficeChatStoreName(STORAGE_KEYS) {
        return getChatStoreName(STORAGE_KEYS || window.STORAGE_KEYS) || detectLoginStoreName() || '';
    };
    window.greekToLatinSlug = greekToLatinSlug;
    window.suggestOfficeChatEmail = suggestOfficeChatEmail;
    window.registerOfficeChatUser = registerOfficeChatUser;
    window.getOfficeChatAvatarInfo = getOfficeChatAvatarInfo;
    window.uploadOfficeChatAvatar = uploadOfficeChatAvatar;
    window.clearOfficeChatAvatar = clearOfficeChatAvatar;
    window.refreshOfficeChatAvatar = fetchOwnChatUserRecord;
    window.debugOfficeChatPresence = async function debugOfficeChatPresence() {
        const keys = chatStorageKeys || window.STORAGE_KEYS;
        chatPresenceUnsupported = false;
        chatPresenceHintShown = false;
        const ok = await upsertOwnPresence(keys, { markRead: true });
        await refreshChatPresence(keys);
        return {
            ok,
            selfId: chatSelfPbUserId,
            unsupported: chatPresenceUnsupported,
            online: getOnlinePresenceList().map((p) => p.displayName),
            rawCount: (chatPresenceList || []).length,
        };
    };
})();
