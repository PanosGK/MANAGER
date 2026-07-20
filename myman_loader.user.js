// ==UserScript==
// @name         MyManager All-in-One Suite
// @namespace    http://tampermonkey.net/
// @version      33
// @description  An all-in-one suite for mymanager.gr. Auto-updates from GitHub — install this file once.
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
// @updateURL    https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_loader.user.js
// @downloadURL  https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_loader.user.js
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function tmMmsLoaderBootstrap() {
    'use strict';

    var THEME_READY_CLASS = 'tm-mms-theme-ready';
    var FOUC_FAILSAFE_MS = 8000;

    // Hide BEFORE any GM_* calls — those delay injection paint and cause a page glimpse.
    // Prefer myman_fouc.user.js for earliest hide; this reinforces if missing.
    // Hide by class alone (no data-attr race). Do NOT reveal until themes.js.
    (function hidePageInstantly() {
        try {
            var path = (window.location && window.location.pathname) || '';
            if (path.indexOf('login.php') !== -1) return;
            if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;
            var root = document.documentElement;
            if (!root) return;
            var bg = '#121212';
            try {
                var rawFouc = localStorage.getItem('tm_mms_fouc_theme');
                if (rawFouc) {
                    var foucTheme = JSON.parse(rawFouc);
                    if (foucTheme && foucTheme.bg) bg = String(foucTheme.bg);
                }
            } catch (eBg) { /* ignore */ }
            root.classList.remove(THEME_READY_CLASS);
            root.setAttribute('data-tm-mms-fouc', '1');
            root.style.setProperty('display', 'none', 'important');
            root.style.setProperty('visibility', 'hidden', 'important');
            root.style.setProperty('opacity', '0', 'important');
            root.style.setProperty('background', bg, 'important');
            var css = 'html:not(.' + THEME_READY_CLASS + '),'
                + 'html:not(.' + THEME_READY_CLASS + ') body{'
                + 'display:none!important;visibility:hidden!important;opacity:0!important;}'
                + 'html:not(.' + THEME_READY_CLASS + '){'
                + 'background:' + bg + '!important;}';
            if (typeof GM_addStyle === 'function') {
                try { GM_addStyle(css); } catch (eGm) { /* ignore */ }
            }
            var style = document.getElementById('tm-mms-fouc-guard');
            if (!style) {
                style = document.createElement('style');
                style.id = 'tm-mms-fouc-guard';
                root.appendChild(style);
            }
            style.textContent = css;
        } catch (e) { /* ignore */ }
    })();

    var LOADER_VERSION = "32";
    var UPDATE_BASE = "https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main";
    var MANIFEST_URL = UPDATE_BASE + '/myman_manifest.json';
    var BUNDLE_FILE = "myman_suite.bundle.js";
    var FALLBACK_BUNDLE_VERSION = "248";
    var LOCAL_BUNDLE_URL = null;

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

    function seedFoucThemeLocalStorage(themeId, colors) {
        try {
            if (!colors || themeId === 'default') {
                localStorage.setItem('tm_mms_fouc_theme', JSON.stringify({
                    themeId: 'default',
                    colors: null,
                    bg: '#ffffff',
                }));
                return;
            }
            var bg = colors['--tm-dark-color'] || colors['--tm-shop-item-bg'] || '#121212';
            localStorage.setItem('tm_mms_fouc_theme', JSON.stringify({
                themeId: themeId || 'custom',
                colors: colors,
                bg: bg,
            }));
        } catch (e) { /* ignore */ }
    }

    function applyCachedPageCssFromLocalStorage() {
        try {
            var pageCss = localStorage.getItem('tm_mms_fouc_page_css');
            if (!pageCss) return false;
            var style = document.getElementById('tm-mms-fouc-page-css');
            if (!style) {
                style = document.createElement('style');
                style.id = 'tm-mms-fouc-page-css';
                (document.documentElement || document.head || document).appendChild(style);
            }
            style.textContent = pageCss;
            return true;
        } catch (e) {
            return false;
        }
    }

    function installFoucBridgeFromColors(colors) {
        try {
            if (!colors) return;
            var dark = colors['--tm-dark-color'] || colors['--tm-shop-item-bg'] || '#121212';
            var surface = colors['--tm-shop-item-bg'] || dark;
            var text = colors['--tm-primary-color'] || '#e8e8e8';
            function luminance(c) {
                var m = String(c).match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                if (!m) return 0;
                var r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
                return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            }
            if (luminance(dark) >= 0.55 && luminance(surface) >= 0.55) return;
            var root = document.documentElement;
            root.classList.add('tm-mms-fouc-bridging');
            var css = 'html.tm-mms-fouc-bridging,html.tm-mms-fouc-bridging body{'
                + 'background:' + dark + '!important;background-color:' + dark + '!important;color:' + text + '!important;}'
                + 'html.tm-mms-fouc-bridging body,html.tm-mms-fouc-bridging .rnr-page,html.tm-mms-fouc-bridging .rnr-pagewrapper,'
                + 'html.tm-mms-fouc-bridging .rnr-middle,html.tm-mms-fouc-bridging .rnr-left,html.tm-mms-fouc-bridging .rnr-center,'
                + 'html.tm-mms-fouc-bridging .rnr-right,html.tm-mms-fouc-bridging .rnr-top,html.tm-mms-fouc-bridging #head-outter,'
                + 'html.tm-mms-fouc-bridging #footer-outter,html.tm-mms-fouc-bridging .rnr-s-grid,html.tm-mms-fouc-bridging .rnr-c-grid,'
                + 'html.tm-mms-fouc-bridging .rnr-s-1,html.tm-mms-fouc-bridging .rnr-s-2,html.tm-mms-fouc-bridging .rnr-s-3,'
                + 'html.tm-mms-fouc-bridging .rnr-c-1,html.tm-mms-fouc-bridging .rnr-c-2,html.tm-mms-fouc-bridging .rnr-c-3,'
                + 'html.tm-mms-fouc-bridging .rnr-s-fields,html.tm-mms-fouc-bridging .rnr-c-fields,html.tm-mms-fouc-bridging .rnr-wrapper,'
                + 'html.tm-mms-fouc-bridging .rnr-brickcontents,html.tm-mms-fouc-bridging .MyMANAGERWhite_label1,'
                + 'html.tm-mms-fouc-bridging .rnr-scrollgrid-inner,html.tm-mms-fouc-bridging .fieldGrid,'
                + 'html.tm-mms-fouc-bridging table,html.tm-mms-fouc-bridging tr,html.tm-mms-fouc-bridging td,html.tm-mms-fouc-bridging th{'
                + 'background-color:' + dark + '!important;background-image:none!important;color:' + text + '!important;}'
                + 'html.tm-mms-fouc-bridging .rnr-top,html.tm-mms-fouc-bridging #head-outter,html.tm-mms-fouc-bridging .rnr-s-menu,'
                + 'html.tm-mms-fouc-bridging .rnr-b-vmenu li > div{background-color:' + surface + '!important;}';
            var style = document.getElementById('tm-mms-fouc-bridge');
            if (!style) {
                style = document.createElement('style');
                style.id = 'tm-mms-fouc-bridge';
                root.appendChild(style);
            }
            style.textContent = css;
        } catch (e) { /* ignore */ }
    }

    function applyCachedThemeColors() {
        try {
            var raw = readProfileScoped('tm_theme_colors_cache', null);
            if (!raw) return false;
            var cache = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!cache || !cache.colors) return false;
            var root = document.documentElement;
            Object.keys(cache.colors).forEach(function (variable) {
                root.style.setProperty(variable, cache.colors[variable]);
            });
            var bg = cache.colors['--tm-dark-color'] || cache.colors['--tm-shop-item-bg'];
            if (bg) {
                root.style.backgroundColor = bg;
            }
            seedFoucThemeLocalStorage(cache.themeId || 'custom', cache.colors);
            applyCachedPageCssFromLocalStorage();
            installFoucBridgeFromColors(cache.colors);
            return true;
        } catch (e) {
            return false;
        }
    }

    function tmRevealThemeReady() {
        var root = document.documentElement;
        if (root.classList.contains(THEME_READY_CLASS)) return;
        root.classList.add(THEME_READY_CLASS);
        try {
            root.removeAttribute('data-tm-mms-fouc');
            root.classList.remove('tm-mms-fouc-ext');
            root.style.removeProperty('display');
            root.style.removeProperty('visibility');
            root.style.removeProperty('opacity');
            root.style.removeProperty('background');
        } catch (e) { /* ignore */ }
        root.classList.add('tm-mms-menu-ready');
    }
    window.tmRevealThemeReady = tmRevealThemeReady;

    function installThemeFoucGuard() {
        // Instant hide already ran at bootstrap start; ensure failsafe + GM style backup.
        var bg = '#121212';
        try {
            var rawFouc = localStorage.getItem('tm_mms_fouc_theme');
            if (rawFouc) {
                var foucTheme = JSON.parse(rawFouc);
                if (foucTheme && foucTheme.bg) bg = String(foucTheme.bg);
            }
        } catch (eBg) { /* ignore */ }
        var css = 'html:not(.' + THEME_READY_CLASS + '),'
            + 'html:not(.' + THEME_READY_CLASS + ') body{'
            + 'display:none!important;visibility:hidden!important;opacity:0!important;}'
            + 'html:not(.' + THEME_READY_CLASS + '){'
            + 'background:' + bg + '!important;}';
        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(css); } catch (e) { /* ignore */ }
        }
        if (!document.getElementById('tm-mms-fouc-guard')) {
            var style = document.createElement('style');
            style.id = 'tm-mms-fouc-guard';
            style.textContent = css;
            (document.documentElement || document.head || document).appendChild(style);
        }
        try {
            var root = document.documentElement;
            if (root && !root.classList.contains(THEME_READY_CLASS)) {
                root.setAttribute('data-tm-mms-fouc', '1');
                root.style.setProperty('display', 'none', 'important');
                root.style.setProperty('visibility', 'hidden', 'important');
                root.style.setProperty('opacity', '0', 'important');
            }
        } catch (e2) { /* ignore */ }
        setTimeout(tmRevealThemeReady, FOUC_FAILSAFE_MS);
    }

    function onBundleFailure(reason) {
        console.error('[MMS] Bundle load failed:', reason || 'unknown');
        tmRevealThemeReady();
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
        // Direct eval keeps execution in the Tampermonkey sandbox (indirect eval uses page scope).
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

    // ---- IndexedDB bundle cache (avoids re-downloading ~3MB on every page) ----
    var BUNDLE_IDB_NAME = 'tm_mms_bundle_cache';
    var BUNDLE_IDB_STORE = 'bundles';
    var BUNDLE_IDB_VERSION = 1;

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

    function readCachedBundle(versionTag, onHit, onMiss) {
        var key = String(versionTag || '');
        if (!key) {
            onMiss();
            return;
        }
        withBundleIdb(function (db) {
            try {
                var tx = db.transaction(BUNDLE_IDB_STORE, 'readonly');
                var req = tx.objectStore(BUNDLE_IDB_STORE).get(key);
                req.onsuccess = function () {
                    var code = req.result;
                    if (typeof code === 'string' && code.length > 10000) {
                        onHit(code);
                    } else {
                        onMiss();
                    }
                };
                req.onerror = function () { onMiss(); };
            } catch (e) {
                onMiss();
            }
        }, onMiss);
    }

    function writeCachedBundle(versionTag, code) {
        var key = String(versionTag || '');
        if (!key || typeof code !== 'string' || code.length < 10000) return;
        withBundleIdb(function (db) {
            try {
                var tx = db.transaction(BUNDLE_IDB_STORE, 'readwrite');
                var store = tx.objectStore(BUNDLE_IDB_STORE);
                // Keep only the active version to limit disk use.
                var clearReq = store.clear();
                clearReq.onsuccess = function () {
                    store.put(code, key);
                };
                clearReq.onerror = function () {
                    try { store.put(code, key); } catch (e2) { /* ignore */ }
                };
            } catch (e) { /* ignore */ }
        }, function () { /* ignore */ });
    }

    function bundleUrlFor(versionTag) {
        // Production: version query only so CDN/browser can help; local always busts.
        if (LOCAL_BUNDLE_URL) {
            return LOCAL_BUNDLE_URL + (LOCAL_BUNDLE_URL.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
        }
        return UPDATE_BASE + '/' + BUNDLE_FILE + '?v=' + encodeURIComponent(String(versionTag));
    }

    function downloadBundle(versionTag, opts) {
        opts = opts || {};
        if (typeof GM_xmlhttpRequest !== 'function') {
            if (!opts.cacheOnly) onBundleFailure('GM_xmlhttpRequest unavailable');
            return;
        }

        var tag = String(versionTag || FALLBACK_BUNDLE_VERSION);
        GM_xmlhttpRequest({
            method: 'GET',
            url: bundleUrlFor(tag),
            onload: function (response) {
                if (response.status >= 200 && response.status < 300 && response.responseText) {
                    var code = response.responseText;
                    rememberBundleVersion(tag);
                    writeCachedBundle(tag, code);
                    if (!opts.cacheOnly) {
                        try {
                            runBundle(code);
                        } catch (err) {
                            console.error('[MMS] Bundle eval failed:', err);
                            onBundleFailure(err);
                        }
                    } else {
                        console.log('[MMS] Prefetched bundle v' + tag + ' into cache');
                    }
                } else if (!opts.cacheOnly) {
                    onBundleFailure('HTTP ' + response.status);
                }
            },
            onerror: function () {
                if (!opts.cacheOnly) onBundleFailure('network');
            },
        });
    }

    function loadBundle(bundleVersion) {
        downloadBundle(bundleVersion, { cacheOnly: false });
    }

    function refreshManifestInBackground(currentVersion) {
        if (LOCAL_BUNDLE_URL || typeof GM_xmlhttpRequest !== 'function') return;
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
                        // Prefetch the newer suite so the next page change is instant.
                        if (remoteVer !== String(currentVersion || '')) {
                            downloadBundle(remoteVer, { cacheOnly: true });
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

    /** Prefer disk cache, then network. Manifest/prefetch runs in the background. */
    function startBundleLoad() {
        if (LOCAL_BUNDLE_URL) {
            loadBundle(FALLBACK_BUNDLE_VERSION);
            return;
        }

        var versionTag = readPreferredBundleVersion();
        readCachedBundle(versionTag, function (code) {
            console.log('[MMS] Bundle cache hit v' + versionTag);
            try {
                runBundle(code);
            } catch (err) {
                console.error('[MMS] Cached bundle eval failed — re-downloading:', err);
                downloadBundle(versionTag, { cacheOnly: false });
                return;
            }
            refreshManifestInBackground(versionTag);
        }, function () {
            console.log('[MMS] Bundle cache miss — downloading v' + versionTag);
            downloadBundle(versionTag, { cacheOnly: false });
            refreshManifestInBackground(versionTag);
        });
    }

    if (shouldSkip()) {
        if (typeof tmRevealThemeReady === 'function') tmRevealThemeReady();
        else {
            document.documentElement.classList.add('tm-mms-menu-ready');
            document.documentElement.classList.add('tm-mms-theme-ready');
        }
        return;
    }

    // Prevent prod + local loaders from both owning the same page (separate TM storage worlds).
    if (window.__TMMS_SUITE_CLAIMED) {
        console.warn('[MMS] Another MyManager loader already claimed this page — skipping duplicate suite');
        return;
    }
    window.__TMMS_SUITE_CLAIMED = true;
    window.__TMMS_SUITE_LOADER = LOCAL_BUNDLE_URL ? 'local' : 'production';

    var loginPath = (window.location && window.location.pathname) || '';
    if (loginPath.indexOf('login.php') !== -1 && isStatus40LoginPending()) {
        if (typeof tmRevealThemeReady === 'function') tmRevealThemeReady();
        else {
            document.documentElement.classList.add('tm-mms-menu-ready');
            document.documentElement.classList.add('tm-mms-theme-ready');
        }
        runStatus40InlineAutoLogin();
        return;
    }

    installThemeFoucGuard();
    var hadThemeCache = applyCachedThemeColors();
    var hadPageCss = applyCachedPageCssFromLocalStorage();
    // Reveal as soon as cached theme/CSS exists — do not wait for the full bundle.
    // First visit (no cache): stay blank until themes.js (or failsafe).
    if (hadThemeCache || hadPageCss) {
        tmRevealThemeReady();
    }
    startBundleLoad();
})();
