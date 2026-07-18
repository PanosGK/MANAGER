// ==UserScript==
// @name         MyManager Profiles
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Per–MyManager-login storage profiles for the All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

(function () {
    'use strict';

    const NATIVE = {
        get: GM_getValue,
        set: GM_setValue,
        del: GM_deleteValue,
        list: typeof GM_listValues === 'function' ? GM_listValues : () => []
    };

    const GLOBAL_KEYS = new Set([
        'tm_script_enabled',
        'tm_status40_admin_username',
        'tm_status40_admin_password',
        'tm_mms_last_profile_id'
    ]);

    const PROFILE_PREFIX = 'tm:p:';
    const MIGRATED_SUFFIX = ':__legacy_migrated';
    /** v1 could stick after a failed listValues; v2 re-runs the heal once for everyone. */
    const LEGACY_SYNC_FLAG = 'tm_mms_unscoped_synced_v1';
    const LEGACY_SYNC_FLAG_V2 = 'tm_mms_unscoped_synced_v2';

    let activeProfileId = null;
    let activeProfileLabel = null;

    function isGlobalKey(key) {
        return GLOBAL_KEYS.has(key);
    }

    function sanitizeProfileId(value) {
        if (!value) return null;
        const cleaned = String(value).trim().toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9._\u0370-\u03ff\u1f00-\u1fff-]/gi, '')
            .slice(0, 64);
        return cleaned || null;
    }

    function resolveProfileId(displayName) {
        const fromName = sanitizeProfileId(displayName);
        if (fromName) return fromName;
        // Prefer last real profile over a temporary `_unknown` bucket (avoids dual worlds).
        try {
            const last = sanitizeProfileId(NATIVE.get('tm_mms_last_profile_id', ''));
            if (last && last !== '_unknown') return last;
        } catch (_) { /* ignore */ }
        return '_unknown';
    }

    function scopedStorageKey(key) {
        if (!key || isGlobalKey(key) || !activeProfileId) return key;
        return `${PROFILE_PREFIX}${activeProfileId}:${key}`;
    }

    function wrappedGetValue(key, defaultValue) {
        if (isGlobalKey(key)) {
            return NATIVE.get(key, defaultValue);
        }

        const scopedKey = scopedStorageKey(key);
        if (NATIVE.get(scopedKey, undefined) !== undefined) {
            return NATIVE.get(scopedKey, defaultValue);
        }

        if (activeProfileId && NATIVE.get(key, undefined) !== undefined) {
            const legacy = NATIVE.get(key);
            NATIVE.set(scopedKey, legacy);
            return legacy;
        }

        return defaultValue;
    }

    function wrappedSetValue(key, value) {
        const scopedKey = scopedStorageKey(key);
        NATIVE.set(scopedKey, value);
        // Keep a single canonical copy: drop unscoped leftovers after profile writes.
        if (activeProfileId && !isGlobalKey(key) && scopedKey !== key) {
            try { NATIVE.del(key); } catch (_) { /* ignore */ }
        }
    }

    function wrappedDeleteValue(key) {
        if (isGlobalKey(key)) {
            NATIVE.del(key);
            return;
        }
        NATIVE.del(scopedStorageKey(key));
        // Also clear leftover unscoped value from before profile wrappers worked.
        if (activeProfileId && !String(key).startsWith(PROFILE_PREFIX)) {
            try { NATIVE.del(key); } catch (_) { /* ignore */ }
        }
    }

    function installStorageWrappers() {
        const root = typeof globalThis !== 'undefined' ? globalThis : window;
        root.GM_getValue = wrappedGetValue;
        root.GM_setValue = wrappedSetValue;
        root.GM_deleteValue = wrappedDeleteValue;

        // Bare GM_* in the bundle/eval sandbox does NOT use globalThis — rebind the grant
        // identifiers so profile scoping actually applies to normal GM_getValue/GM_setValue calls.
        try {
            // eslint-disable-next-line no-global-assign, no-undef
            GM_getValue = wrappedGetValue;
            // eslint-disable-next-line no-global-assign, no-undef
            GM_setValue = wrappedSetValue;
            // eslint-disable-next-line no-global-assign, no-undef
            GM_deleteValue = wrappedDeleteValue;
        } catch (err) {
            console.warn('[MMS Profiles] Could not rebind GM_* grants — import/export may miss profile keys:', err);
        }
    }

    installStorageWrappers();

    function normalizeLoginBlockText(text) {
        return String(text).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    }

    /** Name from #login_block1 → span → b (e.g. "Είσοδος ως Γκορόγιας" → "Γκορόγιας") */
    function parseLoginBlockDisplayName() {
        const loginBlock = document.getElementById('login_block1');
        if (!loginBlock) return null;

        const bold = loginBlock.querySelector('b');
        if (bold) {
            const name = normalizeLoginBlockText(bold.textContent);
            if (name) return name;
        }

        const span = loginBlock.querySelector('span');
        if (span) {
            const text = normalizeLoginBlockText(span.textContent);
            const match = text.match(/(?:είσοδος|εισοδος)\s+ως\s+(.+)/i);
            if (match && match[1]) {
                return normalizeLoginBlockText(match[1]);
            }
        }

        return null;
    }

    function detectLoggedInUser() {
        const displayName = parseLoginBlockDisplayName();
        return { displayName };
    }

    function collectLegacyMigrationKeys() {
        const keys = new Set();

        if (window.STORAGE_KEYS) {
            Object.values(window.STORAGE_KEYS).forEach((key) => {
                if (!isGlobalKey(key)) keys.add(key);
            });
        }

        if (window.DEFAULTS) {
            Object.keys(window.DEFAULTS).forEach((key) => keys.add(key));
        }

        [
            // Scratchpad UI / legacy single-note
            'tm_user_scratchpad_text', 'tm_user_scratchpad_geometry', 'tm_user_scratchpad_is_open',
            'tm_user_scratchpad_font_size', 'tm_user_scratchpad_last_edited', 'tm_user_scratchpad_is_maximized',
            // Search + dashboard history
            'tm_search_history', 'tm_favorite_searches', 'tm_daily_stats_history', 'tm_stats_history_7days',
            'tm_daily_stipend_date',
            'tm_search_include_merchandise_history', 'tm_search_include_parts_history',
            'tm_native_search_hidden', 'tm_quick_search_hidden',
            // Status transfer counters (extra statuses beyond STORAGE_KEYS)
            'tm_status_30_transfers', 'tm_status_55_transfers', 'tm_status_70_transfers', 'tm_status_75_transfers',
            'tm_status_90_transfers', 'tm_status_105_transfers', 'TM_FORM_CREATING',
            // Phone catalog (user data + caches)
            'tm_phone_colors_v2', 'tm_phone_color_display_aliases', 'tm_phone_custom_colors',
            'tm_phone_list_cache', 'tm_phone_list_cache_timestamp',
            'tm_phone_other_store_cache_v2', 'tm_phone_other_store_cache_v3',
            'tm_phone_other_store_cache_timestamp', 'tm_phone_store_details_cache_v2',
            'tm_phone_store_rules_v1', 'tm_phone_tags', 'tm_phone_tag_definitions',
            'tm_phone_my_store_name_v1', 'tm_phone_my_store_pick_v1', 'tm_phone_store_addresses_v1',
            'tm_phone_canonical_models_v1',
            'tm_phone_favorites', 'phone_favorites',
            'tm_sl_density_compact', 'tm_sl_model_sort', 'tm_sl_catalog_view',
            // Order history pages + toggles
            'tm_srvorders_page_history', 'tm_partsorders_page_history',
            'orderHistoryStatusCheckEnabled', 'orderHistoryBackgroundEnabled',
            // Misc prefs
            'tm_update_banner_dismissed_loader_version',
            'tm_skipped_loader_version',
            'tm_script_update_notified_loader_version',
            'equippedTheme', // legacy orphan key still read by search.js
        ].forEach((key) => keys.add(key));

        return [...keys];
    }

    function migrateLegacyForProfile(profileId) {
        if (!profileId || profileId === '_unknown') return;

        const migratedFlag = `${PROFILE_PREFIX}${profileId}${MIGRATED_SUFFIX}`;
        if (NATIVE.get(migratedFlag, false)) return;

        let copied = 0;
        collectLegacyMigrationKeys().forEach((key) => {
            const scopedKey = `${PROFILE_PREFIX}${profileId}:${key}`;
            if (NATIVE.get(scopedKey, undefined) !== undefined) return;
            const legacy = NATIVE.get(key, undefined);
            if (legacy !== undefined) {
                NATIVE.set(scopedKey, legacy);
                copied++;
            }
        });

        NATIVE.set(migratedFlag, true);
        if (copied > 0) {
            console.log(`[MMS Profiles] Migrated ${copied} legacy keys into profile "${profileId}"`);
        }
    }

    function setActiveProfile(profileId, label) {
        activeProfileId = profileId;
        activeProfileLabel = label || profileId;
        NATIVE.set('tm_mms_last_profile_id', profileId);
        syncUnscopedIntoActiveProfile(profileId);
    }

    function activateProfileForCurrentUser() {
        const user = detectLoggedInUser();

        window.tmCurrentUser = user.displayName;
        window.tmCurrentUsername = null;
        window.tmCurrentPassword = null;

        const profileId = resolveProfileId(user.displayName);
        const label = user.displayName || profileId;
        const previousProfileId = activeProfileId;
        setActiveProfile(profileId, label);
        migrateLegacyForProfile(profileId);

        if (previousProfileId && previousProfileId !== profileId) {
            window.dispatchEvent(new CustomEvent('mms-profile-changed', {
                detail: { profileId, profileLabel: label, previousProfileId }
            }));
        }

        if (window.config) {
            window.config.currentUser = user.displayName;
            window.config.currentUsername = null;
            window.config.currentPassword = null;
            window.config.profileId = profileId;
            window.config.profileLabel = label;
        }

        if (user.displayName) {
            console.log('[MMS Profiles] Active profile:', profileId, `(${user.displayName})`);
        } else {
            console.warn('[MMS Profiles] Could not detect logged-in user — using profile:', profileId);
        }

        return profileId;
    }

    function listNativeStorageKeys() {
        try {
            return NATIVE.list() || [];
        } catch (_) {
            return [];
        }
    }

    function shouldCopyUnscopedKey(rawKey) {
        if (!rawKey || isGlobalKey(rawKey)) return false;
        if (rawKey.startsWith(PROFILE_PREFIX)) return false;
        if (rawKey.endsWith(MIGRATED_SUFFIX)) return false;
        if (rawKey === LEGACY_SYNC_FLAG || rawKey === LEGACY_SYNC_FLAG_V2) return false;
        return true;
    }

    /**
     * Heal dual storage: for months the suite wrote unscoped keys while a one-shot migrate
     * froze an older copy under tm:p:… . Overwrite scoped with current unscoped once (v2).
     */
    function syncUnscopedIntoActiveProfile(profileId, options = {}) {
        if (!profileId || profileId === '_unknown') return 0;
        const force = !!options.force;
        const flagKey = `${PROFILE_PREFIX}${profileId}:${LEGACY_SYNC_FLAG_V2}`;
        if (!force && NATIVE.get(flagKey, false)) return 0;

        let synced = 0;
        const prefix = `${PROFILE_PREFIX}${profileId}:`;
        const known = new Set(collectLegacyMigrationKeys());
        const candidates = new Set(known);

        listNativeStorageKeys().forEach((rawKey) => {
            if (!shouldCopyUnscopedKey(rawKey)) return;
            if (!known.has(rawKey) && !rawKey.startsWith('order_status_') && !rawKey.startsWith('tm_')) return;
            candidates.add(rawKey);
        });

        candidates.forEach((rawKey) => {
            if (!shouldCopyUnscopedKey(rawKey)) return;
            const legacy = NATIVE.get(rawKey, undefined);
            if (legacy === undefined) return;
            // Unscoped was the live world until wrappers rebound — it wins over the frozen scoped copy.
            NATIVE.set(prefix + rawKey, legacy);
            synced++;
        });

        NATIVE.set(flagKey, true);
        // Mark v1 done too so old code paths don't re-run a weaker sync.
        try { NATIVE.set(`${PROFILE_PREFIX}${profileId}:${LEGACY_SYNC_FLAG}`, true); } catch (_) { /* ignore */ }

        if (synced > 0) {
            console.log(`[MMS Profiles] Healed ${synced} keys into profile "${profileId}" (unscoped → scoped)`);
        } else {
            console.log(`[MMS Profiles] Profile heal complete for "${profileId}" (no unscoped leftovers)`);
        }
        return synced;
    }

    function forceResyncFromUnscoped() {
        const profileId = activeProfileId || activateProfileForCurrentUser();
        if (!profileId || profileId === '_unknown') {
            throw new Error('No real profile active yet — wait until login name is visible, then retry.');
        }
        try {
            NATIVE.del(`${PROFILE_PREFIX}${profileId}:${LEGACY_SYNC_FLAG_V2}`);
        } catch (_) { /* ignore */ }
        return syncUnscopedIntoActiveProfile(profileId, { force: true });
    }

    function isExcludedExportKey(key) {
        if (!key || key === '_mms_export') return true;
        if (isGlobalKey(key)) return true;
        if (key.endsWith(MIGRATED_SUFFIX)) return true;
        if (key === LEGACY_SYNC_FLAG || key === LEGACY_SYNC_FLAG_V2) return true;
        if (key === 'defaultThemeColors') return true;
        return false;
    }

    function collectAllExportKeys(profileId) {
        const keys = new Set(listExportKeys());

        if (profileId) {
            const prefix = `${PROFILE_PREFIX}${profileId}:`;
            listNativeStorageKeys().forEach((rawKey) => {
                if (!rawKey.startsWith(prefix)) return;
                keys.add(rawKey.slice(prefix.length));
            });
        }

        return [...keys].filter((key) => !isExcludedExportKey(key));
    }

    function listExportKeys() {
        const keys = new Set(collectLegacyMigrationKeys());
        if (window.SHOP_ITEMS) {
            Object.values(window.SHOP_ITEMS).forEach((key) => keys.add(key));
        }
        // Legacy global key from the removed user-name mapping feature
        keys.delete('tm_user_name_mapping');
        keys.delete('tm_script_enabled');
        keys.delete('defaultThemeColors');
        return [...keys];
    }

    function coerceValueForGmStorage(key, value) {
        if (value === undefined) {
            return { action: 'skip' };
        }
        if (value === null) {
            return { action: 'delete' };
        }
        const valueType = typeof value;
        if (valueType === 'string' || valueType === 'boolean' || valueType === 'number') {
            return { action: 'set', value };
        }
        if (valueType === 'object') {
            // Order-status caches are stored as real objects; most other keys expect JSON strings.
            if (String(key).startsWith('order_status_')) {
                return { action: 'set', value };
            }
            try {
                return { action: 'set', value: JSON.stringify(value) };
            } catch (_) {
                return { action: 'skip' };
            }
        }
        return { action: 'skip' };
    }

    function isValidBackupPayload(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
        const keys = Object.keys(data).filter((k) => k !== '_mms_export');
        return keys.length > 0;
    }

    function normalizeImportedBackup(importedData) {
        const normalized = { ...importedData };
        const sk = window.STORAGE_KEYS || {};

        const aliasToStorage = {
            USER_XP: sk.USER_XP || 'tm_user_xp',
            USER_LEVEL: sk.USER_LEVEL || 'tm_user_level',
            USER_COINS: sk.USER_COINS || 'tm_user_coins',
            userXp: sk.USER_XP || 'tm_user_xp',
            userLevel: sk.USER_LEVEL || 'tm_user_level',
            userCoins: sk.USER_COINS || 'tm_user_coins',
            DAILY_BOUNTIES: sk.DAILY_QUESTS || sk.DAILY_BOUNTIES || 'tm_daily_quests',
            tm_daily_bounties: sk.DAILY_QUESTS || sk.DAILY_BOUNTIES || 'tm_daily_quests',
            dailyBounties: sk.DAILY_QUESTS || sk.DAILY_BOUNTIES || 'tm_daily_quests',
            equippedTheme: sk.EQUIPPED_THEME || 'tm_equipped_theme',
        };

        Object.entries(aliasToStorage).forEach(([alias, storageKey]) => {
            if (normalized[alias] !== undefined && normalized[storageKey] === undefined) {
                normalized[storageKey] = normalized[alias];
            }
        });

        return normalized;
    }

    function safeBackupStringify(data) {
        return JSON.stringify(data, (_key, value) => {
            if (typeof value === 'function' || typeof value === 'symbol') return undefined;
            if (typeof value === 'bigint') return value.toString();
            return value;
        }, 2);
    }

    function exportStorageValue(value) {
        if (value === undefined) return undefined;
        if (typeof value === 'object' && value !== null) {
            try {
                return JSON.parse(JSON.stringify(value));
            } catch (_) {
                return String(value);
            }
        }
        return value;
    }

    function exportCurrentProfileData() {
        const profileId = activeProfileId || activateProfileForCurrentUser();
        const data = {
            _mms_export: {
                version: 2,
                profileId,
                profileLabel: activeProfileLabel,
                displayName: window.tmCurrentUser || null,
                username: window.tmCurrentUsername || null,
                exportedAt: new Date().toISOString(),
                keyCount: 0
            }
        };

        collectAllExportKeys(profileId).forEach((key) => {
            const value = wrappedGetValue(key, undefined);
            if (value !== undefined) {
                data[key] = exportStorageValue(value);
            }
        });

        // Include any profile-scoped keys listValues found that wrappedGetValue missed,
        // plus unscoped order_status_* caches (dynamic keys, not in the known list).
        const prefix = profileId ? `${PROFILE_PREFIX}${profileId}:` : null;
        listNativeStorageKeys().forEach((rawKey) => {
            let logicalKey = null;
            if (prefix && rawKey.startsWith(prefix)) {
                logicalKey = rawKey.slice(prefix.length);
            } else if (!rawKey.startsWith(PROFILE_PREFIX) && rawKey.startsWith('order_status_')) {
                logicalKey = rawKey;
            } else {
                return;
            }
            if (isExcludedExportKey(logicalKey) || data[logicalKey] !== undefined) return;
            const value = logicalKey === rawKey
                ? wrappedGetValue(logicalKey, undefined)
                : NATIVE.get(rawKey, undefined);
            if (value !== undefined) {
                data[logicalKey] = exportStorageValue(value);
            }
        });

        const buffExpires = window.STORAGE_KEYS?.ENERGIZED_BUFF_EXPIRES || 'tm_energized_buff_expires';
        const doubleExpires = window.STORAGE_KEYS?.DOUBLE_COINS_BUFF_EXPIRES || 'tm_double_coins_buff_expires';
        [`${buffExpires}_duration`, `${doubleExpires}_duration`].forEach((key) => {
            const value = wrappedGetValue(key, undefined);
            if (value !== undefined) {
                data[key] = exportStorageValue(value);
            }
        });

        data._mms_export.keyCount = Object.keys(data).filter((k) => k !== '_mms_export').length;
        return data;
    }

    function normalizeImportedKey(key, profileId) {
        if (!key || typeof key !== 'string') return null;
        if (key === '_mms_export' || isGlobalKey(key) || key.endsWith(MIGRATED_SUFFIX)) return null;
        if (key === LEGACY_SYNC_FLAG || key === LEGACY_SYNC_FLAG_V2) return null;

        // Backups should use logical keys; tolerate accidental profile-prefixed keys.
        if (key.startsWith(PROFILE_PREFIX)) {
            const rest = key.slice(PROFILE_PREFIX.length);
            const colon = rest.indexOf(':');
            if (colon === -1) return null;
            return rest.slice(colon + 1) || null;
        }
        return key;
    }

    function importProfileData(importedData) {
        if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
            throw new Error('Μη έγκυρα δεδομένα εισαγωγής');
        }
        if (!isValidBackupPayload(importedData)) {
            throw new Error('Μη έγκυρη μορφή αρχείου backup.');
        }

        if (!activeProfileId) {
            activateProfileForCurrentUser();
        }
        if (!activeProfileId) {
            throw new Error('Δεν εντοπίστηκε ενεργό προφίλ. Συνδεθείτε στο MyManager και δοκιμάστε ξανά.');
        }

        const normalized = normalizeImportedBackup(importedData);
        const meta = normalized._mms_export;
        const importErrors = [];
        let written = 0;
        let deleted = 0;

        Object.keys(normalized).forEach((rawKey) => {
            const key = normalizeImportedKey(rawKey, activeProfileId);
            if (!key) return;

            const coerced = coerceValueForGmStorage(key, normalized[rawKey]);
            if (coerced.action === 'skip') return;

            try {
                const scopedKey = `${PROFILE_PREFIX}${activeProfileId}:${key}`;
                if (coerced.action === 'delete') {
                    NATIVE.del(scopedKey);
                    try { NATIVE.del(key); } catch (_) { /* ignore */ }
                    deleted++;
                    return;
                }
                // Write scoped (canonical) and unscoped (compat if grant rebind failed).
                NATIVE.set(scopedKey, coerced.value);
                NATIVE.set(key, coerced.value);
                written++;
            } catch (error) {
                importErrors.push(`${key}: ${error.message || error}`);
                console.error('[MMS Profiles] Import key failed:', key, error);
            }
        });

        if (importErrors.length) {
            throw new Error(`Αποτυχία αποθήκευσης ${importErrors.length} τιμών (π.χ. ${importErrors[0]})`);
        }
        if (written === 0 && deleted === 0) {
            throw new Error('Το αρχείο δεν περιείχε δεδομένα προς εισαγωγή.');
        }

        // Verify a representative key landed in storage the UI can read.
        const probeLogical = window.STORAGE_KEYS?.USER_LEVEL || 'tm_user_level';
        if (Object.prototype.hasOwnProperty.call(normalized, probeLogical)
            || Object.prototype.hasOwnProperty.call(normalized, 'userLevel')
            || Object.prototype.hasOwnProperty.call(normalized, 'USER_LEVEL')) {
            const expected = normalized[probeLogical] ?? normalized.userLevel ?? normalized.USER_LEVEL;
            const scopedProbe = NATIVE.get(`${PROFILE_PREFIX}${activeProfileId}:${probeLogical}`, undefined);
            const bareProbe = NATIVE.get(probeLogical, undefined);
            if (scopedProbe === undefined && bareProbe === undefined && expected !== undefined && expected !== null) {
                throw new Error('Η εισαγωγή δεν αποθηκεύτηκε στο Tampermonkey. Ελέγξτε τα δικαιώματα GM_setValue.');
            }
        }

        console.log(`[MMS Profiles] Import complete: ${written} written, ${deleted} deleted → profile "${activeProfileId}"`);
        return {
            ...(meta && typeof meta === 'object' ? meta : {}),
            importedKeys: written,
            deletedKeys: deleted,
            profileId: activeProfileId
        };
    }

    window.MMS_PROFILES = {
        getActiveProfileId: () => activeProfileId,
        getActiveProfileLabel: () => activeProfileLabel,
        detectLoggedInUser,
        parseLoginBlockDisplayName,
        activateProfileForCurrentUser,
        syncUnscopedIntoActiveProfile,
        forceResyncFromUnscoped,
        exportCurrentProfileData,
        importProfileData,
        isValidBackupPayload,
        normalizeImportedBackup,
        safeBackupStringify,
        exportStorageValue,
        coerceValueForGmStorage,
        isGlobalKey,
        listExportKeys,
        collectAllExportKeys,
        listNativeStorageKeys
    };

    let loginBlockWatchStarted = false;

    function watchLoginBlock() {
        if (loginBlockWatchStarted) return;
        loginBlockWatchStarted = true;

        const tryActivate = () => {
            const name = parseLoginBlockDisplayName();
            if (!name) return;
            activateProfileForCurrentUser();
        };

        const attachToBlock = (block) => {
            if (!block || block.dataset.mmsProfileWatch) return;
            block.dataset.mmsProfileWatch = '1';
            tryActivate();
            const observer = new MutationObserver(tryActivate);
            observer.observe(block, { childList: true, subtree: true, characterData: true });
        };

        const scan = () => {
            attachToBlock(document.getElementById('login_block1'));
        };

        if (document.body) {
            scan();
            if (!document.getElementById('login_block1')) {
                const bodyObserver = new MutationObserver(() => {
                    scan();
                    if (document.getElementById('login_block1')) {
                        bodyObserver.disconnect();
                    }
                });
                bodyObserver.observe(document.body, { childList: true, subtree: true });
            }
        } else {
            document.addEventListener('DOMContentLoaded', scan, { once: true });
        }
    }

    watchLoginBlock();

})();
