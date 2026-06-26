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
        'tm_user_name_mapping',
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

    function resolveProfileId(username, displayName) {
        return sanitizeProfileId(username) || sanitizeProfileId(displayName) || '_unknown';
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

    function getMappingKey() {
        return window.STORAGE_KEYS?.USER_NAME_MAPPING || 'tm_user_name_mapping';
    }

    function detectLoggedInUser() {
        const bold = document.querySelector('#login_block1 span b');
        const displayName = bold ? bold.textContent.trim() : null;
        let loginUsername = null;
        let loginPassword = null;

        try {
            const mapping = JSON.parse(NATIVE.get(getMappingKey(), '[]'));
            const entry = mapping.find((e) => e.display === displayName);
            if (entry) {
                loginUsername = entry.username || null;
                loginPassword = entry.password || null;
            } else if (displayName) {
                mapping.push({ display: displayName, username: '', password: '' });
                NATIVE.set(getMappingKey(), JSON.stringify(mapping));
                console.log('[MMS Profiles] Auto-registered new user in mapping:', displayName);
            }
        } catch (e) {
            console.warn('[MMS Profiles] Failed to read user mapping:', e);
        }

        return { displayName, loginUsername, loginPassword };
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
        window.tmCurrentUsername = user.loginUsername;
        window.tmCurrentPassword = user.loginPassword;

        const profileId = resolveProfileId(user.loginUsername, user.displayName);
        const label = user.displayName || user.loginUsername || profileId;
        setActiveProfile(profileId, label);
        migrateLegacyForProfile(profileId);

        if (window.config) {
            window.config.currentUser = user.displayName;
            window.config.currentUsername = user.loginUsername;
            window.config.currentPassword = user.loginPassword;
            window.config.profileId = profileId;
            window.config.profileLabel = label;
        }

        if (user.displayName) {
            console.log('[MMS Profiles] Active profile:', profileId, user.loginUsername ? `(username: ${user.loginUsername})` : '');
        } else {
            console.warn('[MMS Profiles] Could not detect logged-in user — using profile:', profileId);
        }

        return profileId;
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

    function isValidBackupPayload(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
        if (data._mms_export && typeof data._mms_export === 'object') return true;

        const keys = Object.keys(data).filter((k) => k !== '_mms_export');
        if (!keys.length) return false;

        const knownMarkers = new Set([
            'tm_user_xp', 'tm_user_level', 'tm_user_coins', 'tm_scratchpad_notes_v2',
            'autoRefreshEnabled', 'levelUpSystemEnabled', 'quickSearchButtons',
            'userXp', 'userLevel', 'USER_XP', 'USER_LEVEL'
        ]);

        return keys.some((key) => knownMarkers.has(key) || key.startsWith('tm_'));
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
            userCoins: sk.USER_COINS || 'tm_user_coins'
        };

        Object.entries(aliasToStorage).forEach(([alias, storageKey]) => {
            if (normalized[alias] !== undefined && normalized[storageKey] === undefined) {
                normalized[storageKey] = normalized[alias];
            }
        });

        return normalized;
    }

    function safeBackupStringify(data) {
        return JSON.stringify(data, (_key, value) => (typeof value === 'function' ? undefined : value), 2);
    }

    function exportCurrentProfileData() {
        const data = {
            _mms_export: {
                version: 1,
                profileId: activeProfileId,
                profileLabel: activeProfileLabel,
                displayName: window.tmCurrentUser || null,
                username: window.tmCurrentUsername || null,
                exportedAt: new Date().toISOString()
            }
        };

        listExportKeys().forEach((key) => {
            const value = wrappedGetValue(key, undefined);
            if (value !== undefined) {
                data[key] = value;
            }
        });

        const energizedDuration = wrappedGetValue(`${window.STORAGE_KEYS?.ENERGIZED_BUFF_EXPIRES || 'tm_energized_buff_expires'}_duration`, undefined);
        const doubleCoinsDuration = wrappedGetValue(`${window.STORAGE_KEYS?.DOUBLE_COINS_BUFF_EXPIRES || 'tm_double_coins_buff_expires'}_duration`, undefined);
        if (energizedDuration !== undefined) {
            data[`${window.STORAGE_KEYS?.ENERGIZED_BUFF_EXPIRES || 'tm_energized_buff_expires'}_duration`] = energizedDuration;
        }
        if (doubleCoinsDuration !== undefined) {
            data[`${window.STORAGE_KEYS?.DOUBLE_COINS_BUFF_EXPIRES || 'tm_double_coins_buff_expires'}_duration`] = doubleCoinsDuration;
        }

        return data;
    }

    function importProfileData(importedData) {
        if (!importedData || typeof importedData !== 'object') {
            throw new Error('Μη έγκυρα δεδομένα εισαγωγής');
        }
        if (!isValidBackupPayload(importedData)) {
            throw new Error('Μη έγκυρη μορφή αρχείου backup.');
        }

        const normalized = normalizeImportedBackup(importedData);
        const meta = normalized._mms_export;

        Object.keys(normalized).forEach((key) => {
            if (key === '_mms_export') return;
            if (isGlobalKey(key)) return;
            wrappedSetValue(key, normalized[key]);
        });

        return meta || null;
    }

    window.MMS_PROFILES = {
        getActiveProfileId: () => activeProfileId,
        getActiveProfileLabel: () => activeProfileLabel,
        detectLoggedInUser,
        activateProfileForCurrentUser,
        exportCurrentProfileData,
        importProfileData,
        isValidBackupPayload,
        normalizeImportedBackup,
        safeBackupStringify,
        isGlobalKey,
        listExportKeys
    };

})();
