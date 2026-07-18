// ==UserScript==
// @name         MyManager All-in-One Suite (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      16
// @description  Local development — async file:// bundle. Enable "Allow access to local file URLs". Run: npm run build.
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

    var LOADER_VERSION = "16";
    var UPDATE_BASE = "https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main";
    var MANIFEST_URL = UPDATE_BASE + '/myman_manifest.json';
    var BUNDLE_FILE = "myman_suite.bundle.js";
    var FALLBACK_BUNDLE_VERSION = "230";
    var LOCAL_BUNDLE_URL = "file://C:/Users/User/Documents/GitHub/MANAGER/myman_suite.bundle.js";

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

    var BOOT_COVER_ID = 'tm-mms-boot-cover';
    var BOOT_COVER_STYLE_ID = 'tm-mms-boot-cover-style';
    var BOOT_COVER_CLASS = 'tm-mms-booting';
    var BOOT_COVER_MAX_MS = 10000;
    var bootCoverTimer = null;

    function revealBootCover() {
        window.__tmBootCoverActive = false;
        try {
            if (bootCoverTimer) {
                clearTimeout(bootCoverTimer);
                bootCoverTimer = null;
            }
        } catch (e) { /* ignore */ }
        try {
            document.documentElement.classList.remove(BOOT_COVER_CLASS);
        } catch (e2) { /* ignore */ }
        try {
            var el = document.getElementById(BOOT_COVER_ID);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        } catch (e3) { /* ignore */ }
        try {
            var st = document.getElementById(BOOT_COVER_STYLE_ID);
            if (st && st.parentNode) st.parentNode.removeChild(st);
        } catch (e4) { /* ignore */ }
    }

    function installBootCover() {
        if (window.__tmBootCoverActive) return;
        window.__tmBootCoverActive = true;
        window.tmRevealBootCover = revealBootCover;

        try {
            document.documentElement.classList.add(BOOT_COVER_CLASS);
        } catch (e) { /* ignore */ }

        try {
            if (!document.getElementById(BOOT_COVER_STYLE_ID)) {
                var style = document.createElement('style');
                style.id = BOOT_COVER_STYLE_ID;
                style.textContent = [
                    'html.' + BOOT_COVER_CLASS + ', html.' + BOOT_COVER_CLASS + ' body {',
                    '  background: #fff !important;',
                    '}',
                    '#' + BOOT_COVER_ID + ' {',
                    '  position: fixed !important;',
                    '  inset: 0 !important;',
                    '  z-index: 2147483647 !important;',
                    '  background: #fff !important;',
                    '  pointer-events: none !important;',
                    '}',
                    'html:not(.' + BOOT_COVER_CLASS + ') #' + BOOT_COVER_ID + ' { display: none !important; }',
                ].join('\n');
                (document.head || document.documentElement).appendChild(style);
            }
        } catch (e2) { /* ignore */ }

        function mountCoverEl() {
            if (document.getElementById(BOOT_COVER_ID)) return;
            try {
                var cover = document.createElement('div');
                cover.id = BOOT_COVER_ID;
                cover.setAttribute('aria-hidden', 'true');
                (document.body || document.documentElement).appendChild(cover);
            } catch (e3) { /* ignore */ }
        }

        if (document.body) {
            mountCoverEl();
        } else {
            document.addEventListener('DOMContentLoaded', mountCoverEl, { once: true });
            try {
                mountCoverEl();
            } catch (e4) { /* ignore */ }
        }

        try {
            bootCoverTimer = setTimeout(function () {
                console.warn('[MMS] Boot cover timeout — revealing page');
                revealBootCover();
                document.documentElement.classList.add('tm-mms-menu-ready');
            }, BOOT_COVER_MAX_MS);
        } catch (e5) { /* ignore */ }
    }

    function onBundleFailure(reason) {
        console.error('[MMS] Bundle load failed:', reason || 'unknown');
        revealBootCover();
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
        // Direct eval keeps execution in the Tampermonkey sandbox (indirect eval uses page scope).
        eval(code);
        revealBootCover();
    }

    function loadBundle(bundleVersion) {
        if (typeof GM_xmlhttpRequest !== 'function') {
            onBundleFailure('GM_xmlhttpRequest unavailable');
            return;
        }

        var versionTag = String(bundleVersion || FALLBACK_BUNDLE_VERSION);
        var bundleUrl = LOCAL_BUNDLE_URL
            ? (LOCAL_BUNDLE_URL + (LOCAL_BUNDLE_URL.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now())
            : (UPDATE_BASE + '/' + BUNDLE_FILE + '?v=' + encodeURIComponent(versionTag) + '&t=' + Date.now());

        GM_xmlhttpRequest({
            method: 'GET',
            url: bundleUrl,
            onload: function (response) {
                if (response.status >= 200 && response.status < 300 && response.responseText) {
                    try {
                        runBundle(response.responseText);
                    } catch (err) {
                        console.error('[MMS] Bundle eval failed:', err);
                        onBundleFailure(err);
                    }
                } else {
                    onBundleFailure('HTTP ' + response.status);
                }
            },
            onerror: function () {
                onBundleFailure('network');
            },
        });
    }

    function fetchManifestThenLoadBundle() {
        if (LOCAL_BUNDLE_URL) {
            loadBundle(FALLBACK_BUNDLE_VERSION);
            return;
        }

        if (typeof GM_xmlhttpRequest !== 'function') {
            loadBundle(FALLBACK_BUNDLE_VERSION);
            return;
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: MANIFEST_URL + '?t=' + Date.now(),
            onload: function (response) {
                var bundleVersion = FALLBACK_BUNDLE_VERSION;
                if (response.status >= 200 && response.status < 300 && response.responseText) {
                    try {
                        var manifest = JSON.parse(response.responseText);
                        if (manifest && manifest.version != null) {
                            bundleVersion = String(manifest.version);
                        }
                        if (manifest && manifest.displayVersion) {
                            window.TMMS_REMOTE_DISPLAY_VERSION = String(manifest.displayVersion);
                        } else if (manifest && manifest.loaderVersion != null && manifest.silentVersion != null) {
                            window.TMMS_REMOTE_DISPLAY_VERSION = String(manifest.loaderVersion) + '.' + String(manifest.silentVersion);
                        }
                    } catch (e) {
                        console.warn('[MMS] Manifest parse failed, using fallback bundle version');
                    }
                } else {
                    console.warn('[MMS] Manifest HTTP', response.status, '— using fallback bundle version');
                }
                loadBundle(bundleVersion);
            },
            onerror: function () {
                console.warn('[MMS] Manifest fetch failed — using fallback bundle version');
                loadBundle(FALLBACK_BUNDLE_VERSION);
            },
        });
    }

    if (shouldSkip()) {
        document.documentElement.classList.add('tm-mms-menu-ready');
        return;
    }

    var loginPath = (window.location && window.location.pathname) || '';
    if (loginPath.indexOf('login.php') !== -1 && isStatus40LoginPending()) {
        document.documentElement.classList.add('tm-mms-menu-ready');
        runStatus40InlineAutoLogin();
        return;
    }

    installBootCover();
    applyCachedThemeColors();
    fetchManifestThenLoadBundle();
})();
