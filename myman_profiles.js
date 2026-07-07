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
        del: GM_deleteValue
    };

    const GLOBAL_KEYS = new Set([
        'tm_script_enabled',
        'tm_status40_admin_username',
        'tm_status40_admin_password',
        'tm_mms_last_profile_id'
    ]);

    const PROFILE_PREFIX = 'tm:p:';
    const MIGRATED_SUFFIX = ':__legacy_migrated';

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
        return sanitizeProfileId(displayName) || '_unknown';
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
        NATIVE.set(scopedStorageKey(key), value);
    }

    function wrappedDeleteValue(key) {
        if (isGlobalKey(key)) {
            NATIVE.del(key);
            return;
        }
        NATIVE.del(scopedStorageKey(key));
    }

    function installStorageWrappers() {
        const root = typeof globalThis !== 'undefined' ? globalThis : window;
        root.GM_getValue = wrappedGetValue;
        root.GM_setValue = wrappedSetValue;
        root.GM_deleteValue = wrappedDeleteValue;
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
            'tm_user_scratchpad_text', 'tm_user_scratchpad_geometry', 'tm_user_scratchpad_is_open',
            'tm_user_scratchpad_font_size', 'tm_user_scratchpad_last_edited', 'tm_user_scratchpad_is_maximized',
            'tm_search_history', 'tm_favorite_searches', 'tm_daily_stats_history', 'tm_stats_history_7days',
            'tm_status_30_transfers', 'tm_status_55_transfers', 'tm_status_70_transfers', 'tm_status_75_transfers',
            'tm_status_90_transfers', 'tm_status_105_transfers', 'TM_FORM_CREATING',
            'tm_phone_colors_v2', 'tm_phone_color_display_aliases', 'tm_phone_custom_colors',
            'tm_phone_list_cache', 'tm_phone_list_cache_timestamp', 'tm_phone_other_store_cache_v2',
            'tm_phone_other_store_cache_timestamp', 'tm_phone_store_rules_v1', 'tm_phone_tags',
            'tm_phone_favorites', 'phone_favorites',
            'tm_srvorders_page_history', 'tm_partsorders_page_history',
            'orderHistoryStatusCheckEnabled', 'orderHistoryBackgroundEnabled',
            'tm_quick_search_hidden',
        ].forEach((key) => keys.add(key));

        return [...keys];
    }

    function migrateLegacyForProfile(profileId) {
        if (!profileId) return;

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
        if (typeof GM_listValues === 'function') {
            return GM_listValues();
        }
        return [];
    }

    function isExcludedExportKey(key) {
        if (!key || key === '_mms_export') return true;
        if (isGlobalKey(key)) return true;
        if (key.endsWith(MIGRATED_SUFFIX)) return true;
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
        keys.delete(getMappingKey());
        keys.delete('tm_script_enabled');
        keys.delete('defaultThemeColors');
        return [...keys];
    }

    function coerceValueForGmStorage(value) {
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
            return { action: 'set', value: JSON.stringify(value) };
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

        // Include any profile-scoped keys listValues found that wrappedGetValue missed
        if (profileId) {
            const prefix = `${PROFILE_PREFIX}${profileId}:`;
            listNativeStorageKeys().forEach((rawKey) => {
                if (!rawKey.startsWith(prefix)) return;
                const logicalKey = rawKey.slice(prefix.length);
                if (isExcludedExportKey(logicalKey) || data[logicalKey] !== undefined) return;
                const value = NATIVE.get(rawKey, undefined);
                if (value !== undefined) {
                    data[logicalKey] = exportStorageValue(value);
                }
            });
        }

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

    function importProfileData(importedData) {
        if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
            throw new Error('Μη έγκυρα δεδομένα εισαγωγής');
        }
        if (!isValidBackupPayload(importedData)) {
            throw new Error('Μη έγκυρη μορφή αρχείου backup.');
        }

        if (!activeProfileId && typeof activateProfileForCurrentUser === 'function') {
            activateProfileForCurrentUser();
        }

        const normalized = normalizeImportedBackup(importedData);
        const meta = normalized._mms_export;
        const importErrors = [];

        Object.keys(normalized).forEach((key) => {
            if (key === '_mms_export') return;
            if (isGlobalKey(key)) return;

            const coerced = coerceValueForGmStorage(normalized[key]);
            if (coerced.action === 'skip') return;

            try {
                if (coerced.action === 'delete') {
                    wrappedDeleteValue(key);
                    return;
                }
                wrappedSetValue(key, coerced.value);
            } catch (error) {
                importErrors.push(`${key}: ${error.message || error}`);
                console.error('[MMS Profiles] Import key failed:', key, error);
            }
        });

        if (importErrors.length) {
            throw new Error(`Αποτυχία αποθήκευσης ${importErrors.length} τιμών (π.χ. ${importErrors[0]})`);
        }

        return meta || null;
    }

    window.MMS_PROFILES = {
        getActiveProfileId: () => activeProfileId,
        getActiveProfileLabel: () => activeProfileLabel,
        detectLoggedInUser,
        parseLoginBlockDisplayName,
        activateProfileForCurrentUser,
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
