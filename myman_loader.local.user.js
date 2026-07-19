// ==UserScript==
// @name         MyManager All-in-One Suite (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      24
// @description  Local development — async file:// core+defer bundles. Enable "Allow access to local file URLs". Run: npm run build.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function tmMmsLoaderBootstrap() {
    'use strict';

    var LOADER_VERSION = "24";
    var UPDATE_BASE = "https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main";
    var MANIFEST_URL = UPDATE_BASE + '/myman_manifest.json';
    var CORE_BUNDLE_FILE = "myman_suite.core.bundle.js";
    var DEFER_BUNDLE_FILE = "myman_suite.defer.bundle.js";
    var FALLBACK_BUNDLE_VERSION = "239";
    var LOCAL_CORE_URL = "file://C:/Users/User/Documents/GitHub/MANAGER/myman_suite.core.bundle.js";
    var LOCAL_DEFER_URL = "file://C:/Users/User/Documents/GitHub/MANAGER/myman_suite.defer.bundle.js";

    try {
        if (typeof GM_setValue === 'function') {
            GM_setValue('tm_installed_loader_version', LOADER_VERSION);
        }
    } catch (e) { /* ignore */ }
    window.TMMS_LOADER_VERSION = LOADER_VERSION;

    function isStatus40LoginPending() {
        try {
            return sessionStorage.getItem('tm_status40_active') === 'true'
                && !!sessionStorage.getItem('tm_status40_username')
                && !!sessionStorage.getItem('tm_status40_password')
                && !!sessionStorage.getItem('tm_status40_return_url');
        } catch (e) {
            return false;
        }
    }

    function setLoginFieldValue(input, value) {
        if (!input) return;
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function runStatus40InlineAutoLogin() {
        var username = sessionStorage.getItem('tm_status40_username');
        var password = sessionStorage.getItem('tm_status40_password');
        var returnUrl = sessionStorage.getItem('tm_status40_return_url');
        if (!username || !password || !returnUrl) return;

        console.log('[MMS] Status 40 inline auto-login on login page');

        function findLoginInputs(form) {
            var usernameInput = form.querySelector('input[name="username"]')
                || document.getElementById('minimal-username-input')
                || form.querySelector('#username')
                || form.querySelector('input[type="text"]:not([readonly])');
            var passwordInput = form.querySelector('input[name="password"]')
                || document.getElementById('minimal-password-input')
                || form.querySelector('#password')
                || form.querySelector('input[type="password"]');
            return { usernameInput: usernameInput, passwordInput: passwordInput };
        }

        function submitLoginForm(loginForm) {
            sessionStorage.removeItem('tm_status40_active');

            var returnInput = loginForm.querySelector('input[name="return"], input[name="redirect"], input[name="returnUrl"]');
            if (returnInput) {
                returnInput.value = returnUrl;
            } else {
                var hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'return';
                hiddenInput.value = returnUrl;
                loginForm.appendChild(hiddenInput);
            }

            setTimeout(function () {
                console.log('[MMS] Submitting Status 40 login form');
                var submitBtn = loginForm.querySelector('input[type="submit"], button[type="submit"], a.rnr-button[type="submit"]');
                if (submitBtn) {
                    submitBtn.click();
                    return;
                }
                if (typeof loginForm.requestSubmit === 'function') {
                    loginForm.requestSubmit();
                    return;
                }
                loginForm.submit();
            }, 300);
        }

        function tryFillAndSubmit(attempt) {
            if (attempt > 60) {
                console.warn('[MMS] Status 40 auto-login: login form not ready');
                return;
            }

            var loginForm = document.querySelector('form#form1')
                || document.querySelector('form[name="login"]')
                || document.querySelector('form');
            if (!loginForm) {
                setTimeout(function () { tryFillAndSubmit(attempt + 1); }, 200);
                return;
            }

            var inputs = findLoginInputs(loginForm);
            if (!inputs.usernameInput || !inputs.passwordInput) {
                setTimeout(function () { tryFillAndSubmit(attempt + 1); }, 200);
                return;
            }

            setLoginFieldValue(inputs.usernameInput, username);
            setLoginFieldValue(inputs.passwordInput, password);
            submitLoginForm(loginForm);
        }

        function start() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function () {
                    setTimeout(function () { tryFillAndSubmit(0); }, 300);
                });
            } else {
                setTimeout(function () { tryFillAndSubmit(0); }, 300);
            }
        }

        start();
    }

    function shouldSkip() {
        var p = (window.location && window.location.pathname) || '';
        if (p.indexOf('login.php') !== -1) return !isStatus40LoginPending();
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return true;
        try {
            if (typeof GM_getValue === 'function' && GM_getValue('tm_script_enabled', true) === false) return true;
        } catch (e) { /* ignore */ }
        return false;
    }

    /** Always-on master toggle — lives in the loader because the bundle is skipped when disabled. */
    function enableSuiteAndReload() {
        try {
            if (typeof GM_setValue === 'function') GM_setValue('tm_script_enabled', true);
        } catch (e) { /* ignore */ }
        try { location.reload(); } catch (e2) { /* ignore */ }
    }

    function installMasterToggleRecovery() {
        // Ctrl+Shift+. (period) — avoids Greek AltGr (=Ctrl+Alt) and Shift+E typing conflicts
        document.addEventListener('keydown', function (e) {
            var key = String(e.key || '');
            if (!(e.ctrlKey || e.metaKey) || !e.shiftKey || e.altKey) return;
            if (key !== '.' && e.code !== 'Period') return;
            if (e.isComposing) return;
            e.preventDefault();
            e.stopPropagation();
            var enabled = true;
            try {
                if (typeof GM_getValue === 'function') {
                    enabled = GM_getValue('tm_script_enabled', true) !== false;
                }
            } catch (err) { /* ignore */ }
            try {
                if (typeof GM_setValue === 'function') {
                    GM_setValue('tm_script_enabled', !enabled);
                }
            } catch (err2) { /* ignore */ }
            try { location.reload(); } catch (err3) { /* ignore */ }
        }, true);

        // Visible recovery when suite is off (bundle never loads)
        try {
            if (typeof GM_getValue !== 'function' || GM_getValue('tm_script_enabled', true) !== false) return;
        } catch (e) {
            return;
        }

        function mountEnableButton() {
            if (document.getElementById('tm-mms-reenable-btn')) return;
            var btn = document.createElement('button');
            btn.id = 'tm-mms-reenable-btn';
            btn.type = 'button';
            btn.textContent = 'Enable MyManager (Ctrl+Shift+.)';
            btn.setAttribute('title', 'Ενεργοποίηση MyManager Suite');
            btn.style.cssText = [
                'position:fixed',
                'right:12px',
                'bottom:12px',
                'z-index:2147483646',
                'padding:10px 14px',
                'border-radius:10px',
                'border:1px solid #334155',
                'background:#0f172a',
                'color:#e2e8f0',
                'font:600 13px/1.2 system-ui,sans-serif',
                'cursor:pointer',
                'box-shadow:0 8px 24px rgba(0,0,0,.35)',
            ].join(';');
            btn.addEventListener('click', function (ev) {
                ev.preventDefault();
                enableSuiteAndReload();
            });
            (document.body || document.documentElement).appendChild(btn);
        }

        if (document.body) {
            mountEnableButton();
        } else {
            document.addEventListener('DOMContentLoaded', mountEnableButton);
        }
    }

    installMasterToggleRecovery();

    function readProfileScoped(key, defaultValue) {
        try {
            if (typeof GM_getValue !== 'function') return defaultValue;
            var profileId = GM_getValue('tm_mms_last_profile_id', '');
            if (profileId) {
                var scoped = GM_getValue('tm:p:' + profileId + ':' + key, undefined);
                if (scoped !== undefined) return scoped;
            }
            var legacy = GM_getValue(key, undefined);
            if (legacy !== undefined) return legacy;
        } catch (e) { /* ignore */ }
        return defaultValue;
    }

    function applyCachedThemeColors() {
        try {
            var raw = readProfileScoped('tm_theme_colors_cache', null);
            if (!raw) return;
            var cache = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!cache || !cache.colors) return;
            var root = document.documentElement;
            Object.keys(cache.colors).forEach(function (variable) {
                root.style.setProperty(variable, cache.colors[variable]);
            });
            var bg = cache.colors['--tm-dark-color'] || cache.colors['--tm-shop-item-bg'];
            if (bg) {
                root.style.backgroundColor = bg;
            }
        } catch (e) { /* ignore */ }
    }

    function onBundleFailure(reason) {
        console.error('[MMS] Bundle load failed:', reason || 'unknown');
        document.documentElement.classList.add('tm-mms-menu-ready');
    }

    function exposeTampermonkeyApisForBundle() {
        var g = typeof globalThis !== 'undefined' ? globalThis : window;
        if (typeof GM_getValue === 'function') g.GM_getValue = GM_getValue;
        if (typeof GM_setValue === 'function') g.GM_setValue = GM_setValue;
        if (typeof GM_deleteValue === 'function') g.GM_deleteValue = GM_deleteValue;
        if (typeof GM_listValues === 'function') g.GM_listValues = GM_listValues;
        if (typeof GM_addStyle === 'function') g.GM_addStyle = GM_addStyle;
        if (typeof GM_xmlhttpRequest === 'function') g.GM_xmlhttpRequest = GM_xmlhttpRequest;
    }

    function runBundle(code) {
        exposeTampermonkeyApisForBundle();
        eval(code);
    }

    function rememberBundleVersion(bundleVersion) {
        try {
            if (typeof GM_setValue === 'function' && bundleVersion) {
                GM_setValue('tm_last_bundle_version', String(bundleVersion));
            }
        } catch (e) { /* ignore */ }
    }

    function readPreferredBundleVersion() {
        try {
            if (typeof GM_getValue === 'function') {
                var remembered = GM_getValue('tm_last_bundle_version', '');
                if (remembered) return String(remembered);
            }
        } catch (e) { /* ignore */ }
        return FALLBACK_BUNDLE_VERSION;
    }

    var BUNDLE_IDB_NAME = 'tm_mms_bundle_cache';
    var BUNDLE_IDB_STORE = 'bundles';
    var BUNDLE_IDB_VERSION = 3;
    var BUNDLE_CACHE_SCHEMA = 's3';

    function withBundleIdb(onReady, onError) {
        try {
            if (typeof indexedDB === 'undefined') {
                onError();
                return;
            }
            var openReq = indexedDB.open(BUNDLE_IDB_NAME, BUNDLE_IDB_VERSION);
            openReq.onupgradeneeded = function () {
                var db = openReq.result;
                if (!db.objectStoreNames.contains(BUNDLE_IDB_STORE)) {
                    db.createObjectStore(BUNDLE_IDB_STORE);
                }
            };
            openReq.onsuccess = function () { onReady(openReq.result); };
            openReq.onerror = function () { onError(); };
        } catch (e) {
            onError();
        }
    }

    function cacheKey(part, versionTag) {
        return BUNDLE_CACHE_SCHEMA + ':' + String(part) + ':' + String(versionTag);
    }

    function readCachedBundle(part, versionTag, onHit, onMiss) {
        var key = cacheKey(part, versionTag);
        withBundleIdb(function (db) {
            try {
                var tx = db.transaction(BUNDLE_IDB_STORE, 'readonly');
                var req = tx.objectStore(BUNDLE_IDB_STORE).get(key);
                req.onsuccess = function () {
                    var code = req.result;
                    if (typeof code === 'string' && code.length > 1000) onHit(code);
                    else onMiss();
                };
                req.onerror = function () { onMiss(); };
            } catch (e) {
                onMiss();
            }
        }, onMiss);
    }

    function writeCachedBundle(part, versionTag, code) {
        var key = cacheKey(part, versionTag);
        if (typeof code !== 'string' || code.length < 1000) return;
        withBundleIdb(function (db) {
            try {
                var tx = db.transaction(BUNDLE_IDB_STORE, 'readwrite');
                tx.objectStore(BUNDLE_IDB_STORE).put(code, key);
            } catch (e) { /* ignore */ }
        }, function () { /* ignore */ });
    }

    function bundleUrlFor(part, versionTag) {
        if (part === 'defer') {
            if (LOCAL_DEFER_URL) {
                return LOCAL_DEFER_URL + (LOCAL_DEFER_URL.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
            }
            return UPDATE_BASE + '/' + DEFER_BUNDLE_FILE + '?v=' + encodeURIComponent(String(versionTag));
        }
        if (LOCAL_CORE_URL) {
            return LOCAL_CORE_URL + (LOCAL_CORE_URL.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
        }
        return UPDATE_BASE + '/' + CORE_BUNDLE_FILE + '?v=' + encodeURIComponent(String(versionTag));
    }

    function notifyDeferReady() {
        window.__tmDeferLoaded = true;
        if (typeof window.__tmRunDeferredFeatureInits === 'function') {
            try { window.__tmRunDeferredFeatureInits(); } catch (e) {
                console.error('[MMS] Deferred feature init failed:', e);
            }
        }
    }

    function downloadBundlePart(part, versionTag, opts) {
        opts = opts || {};
        if (typeof GM_xmlhttpRequest !== 'function') {
            if (!opts.cacheOnly && part === 'core') onBundleFailure('GM_xmlhttpRequest unavailable');
            return;
        }
        var tag = String(versionTag || FALLBACK_BUNDLE_VERSION);
        GM_xmlhttpRequest({
            method: 'GET',
            url: bundleUrlFor(part, tag),
            onload: function (response) {
                if (response.status >= 200 && response.status < 300 && response.responseText) {
                    var code = response.responseText;
                    rememberBundleVersion(tag);
                    writeCachedBundle(part, tag, code);
                    if (opts.cacheOnly) {
                        console.log('[MMS] Prefetched ' + part + ' bundle v' + tag);
                        return;
                    }
                    try {
                        runBundle(code);
                        if (part === 'core') {
                            scheduleDeferLoad(tag);
                        } else {
                            notifyDeferReady();
                        }
                    } catch (err) {
                        console.error('[MMS] ' + part + ' bundle eval failed:', err);
                        if (part === 'core') onBundleFailure(err);
                    }
                } else if (!opts.cacheOnly && part === 'core') {
                    onBundleFailure('HTTP ' + response.status);
                }
            },
            onerror: function () {
                if (!opts.cacheOnly && part === 'core') onBundleFailure('network');
            },
        });
    }

    function loadCachedOrDownload(part, versionTag, onAfterCacheHit) {
        readCachedBundle(part, versionTag, function (code) {
            // Reject incomplete cores from older defer splits (missing shop/XP helpers).
            if (part === 'core' && code.indexOf('window.updateCoinBalanceUI = updateCoinBalanceUI') === -1) {
                console.warn('[MMS] Stale core cache (no gamification) — re-downloading v' + versionTag);
                downloadBundlePart(part, versionTag, { cacheOnly: false });
                return;
            }
            console.log('[MMS] ' + part + ' cache hit v' + versionTag);
            try {
                runBundle(code);
                if (typeof onAfterCacheHit === 'function') onAfterCacheHit();
            } catch (err) {
                console.error('[MMS] Cached ' + part + ' eval failed — re-downloading:', err);
                downloadBundlePart(part, versionTag, { cacheOnly: false });
            }
        }, function () {
            console.log('[MMS] ' + part + ' cache miss — downloading v' + versionTag);
            downloadBundlePart(part, versionTag, { cacheOnly: false });
        });
    }

    function scheduleDeferLoad(versionTag) {
        var run = function () {
            loadCachedOrDownload('defer', versionTag, notifyDeferReady);
        };
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(run, { timeout: 900 });
        } else {
            setTimeout(run, 40);
        }
    }

    function refreshManifestInBackground(currentVersion) {
        if (LOCAL_CORE_URL || typeof GM_xmlhttpRequest !== 'function') return;
        GM_xmlhttpRequest({
            method: 'GET',
            url: MANIFEST_URL + '?t=' + Date.now(),
            onload: function (response) {
                if (!(response.status >= 200 && response.status < 300 && response.responseText)) return;
                try {
                    var manifest = JSON.parse(response.responseText);
                    var remoteVer = manifest && manifest.version != null ? String(manifest.version) : '';
                    if (remoteVer) {
                        rememberBundleVersion(remoteVer);
                        if (remoteVer !== String(currentVersion || '')) {
                            downloadBundlePart('core', remoteVer, { cacheOnly: true });
                            downloadBundlePart('defer', remoteVer, { cacheOnly: true });
                        }
                    }
                    if (manifest && manifest.displayVersion) {
                        window.TMMS_REMOTE_DISPLAY_VERSION = String(manifest.displayVersion);
                    } else if (manifest && manifest.loaderVersion != null && manifest.silentVersion != null) {
                        window.TMMS_REMOTE_DISPLAY_VERSION = String(manifest.loaderVersion) + '.' + String(manifest.silentVersion);
                    }
                } catch (e) { /* ignore */ }
            },
        });
    }

    /** Core first (theme/menu/workflow), then defer heavy modules on idle. */
    function startBundleLoad() {
        var versionTag = readPreferredBundleVersion();
        loadCachedOrDownload('core', versionTag, function () {
            scheduleDeferLoad(versionTag);
        });
        refreshManifestInBackground(versionTag);
    }

    if (shouldSkip()) {
        document.documentElement.classList.add('tm-mms-menu-ready');
        return;
    }

    // Prevent prod + local loaders from both owning the same page (separate TM storage worlds).
    if (window.__TMMS_SUITE_CLAIMED) {
        console.warn('[MMS] Another MyManager loader already claimed this page — skipping duplicate suite');
        return;
    }
    window.__TMMS_SUITE_CLAIMED = true;
    window.__TMMS_SUITE_LOADER = LOCAL_CORE_URL ? 'local' : 'production';

    var loginPath = (window.location && window.location.pathname) || '';
    if (loginPath.indexOf('login.php') !== -1 && isStatus40LoginPending()) {
        document.documentElement.classList.add('tm-mms-menu-ready');
        runStatus40InlineAutoLogin();
        return;
    }

    applyCachedThemeColors();
    startBundleLoad();
})();
