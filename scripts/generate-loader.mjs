/**
 * Regenerates myman_suite.bundle.js (+ local loader) and syncs SCRIPT_META
 * from myman_manifest.json.
 *
 * Production myman_loader.user.js is ONLY rewritten when you pass --write-loader
 * (or the file is missing). Silent/small builds leave it untouched so Tampermonkey
 * @version does not change.
 *
 * Silent release (bumps bundle + Custom Ver., does NOT rewrite production loader):
 *   node scripts/release.mjs "Short release note"
 *
 * Loader release (bumps Tampermonkey @version and rewrites myman_loader.user.js):
 *   node scripts/release.mjs --loader "Loader change"
 *
 * Regenerate only (no version bump):
 *   node scripts/generate-loader.mjs
 *   node scripts/generate-loader.mjs --write-loader   # rewrite production loader
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'myman_manifest.json'), 'utf8'));
const { version, loaderVersion = '1', silentVersion = '1', updateBase, modules } = manifest;
const displayVersion = manifest.displayVersion || `${loaderVersion}.${silentVersion}`;
const loaderUrl = `${updateBase}/myman_loader.user.js`;
const bundleFileName = 'myman_suite.bundle.js';
const bundleUrl = `${updateBase}/${bundleFileName}?v=${version}`;
const forceWriteLoader = process.argv.includes('--write-loader');

function stripUserScriptHeader(content) {
    return content.replace(/^\/\/ ==UserScript==[\s\S]*?^\/\/ ==\/UserScript==\r?\n?/m, '');
}

function buildInlineBootstrap({ localBundleUrl = null } = {}) {
    return `(function tmMmsLoaderBootstrap() {
    'use strict';

    var THEME_READY_CLASS = 'tm-mms-theme-ready';
    var FOUC_FAILSAFE_MS = 8000;

    // Hide BEFORE any GM_* calls — those delay injection paint and cause a page glimpse.
    // Prefer myman_fouc.user.js (@grant none) for earliest hide; this reinforces if missing.
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
            var css = 'html[data-tm-mms-fouc="1"]:not(.' + THEME_READY_CLASS + '),'
                + 'html[data-tm-mms-fouc="1"]:not(.' + THEME_READY_CLASS + ') body{'
                + 'display:none!important;visibility:hidden!important;opacity:0!important;}'
                + 'html[data-tm-mms-fouc="1"]:not(.' + THEME_READY_CLASS + '){'
                + 'background:' + bg + '!important;}';
            var style = document.getElementById('tm-mms-fouc-guard');
            if (!style) {
                style = document.createElement('style');
                style.id = 'tm-mms-fouc-guard';
                root.appendChild(style);
            }
            style.textContent = css;
        } catch (e) { /* ignore */ }
    })();

    var LOADER_VERSION = ${JSON.stringify(String(loaderVersion))};
    var UPDATE_BASE = ${JSON.stringify(updateBase)};
    var MANIFEST_URL = UPDATE_BASE + '/myman_manifest.json';
    var BUNDLE_FILE = ${JSON.stringify(bundleFileName)};
    var FALLBACK_BUNDLE_VERSION = ${JSON.stringify(String(version))};
    var LOCAL_BUNDLE_URL = ${localBundleUrl ? JSON.stringify(localBundleUrl) : 'null'};

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
        var css = 'html[data-tm-mms-fouc="1"]:not(.' + THEME_READY_CLASS + '),'
            + 'html[data-tm-mms-fouc="1"]:not(.' + THEME_READY_CLASS + ') body{'
            + 'display:none!important;visibility:hidden!important;opacity:0!important;}'
            + 'html[data-tm-mms-fouc="1"]:not(.' + THEME_READY_CLASS + '){'
            + 'background:#121212!important;}';
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
    // Reveal early when GM theme cache exists so blank is not waiting on the full bundle.
    // Cache miss: stay blank until themes.js (or failsafe).
    if (hadThemeCache) {
        tmRevealThemeReady();
    }
    startBundleLoad();
})();`;
}

const bundleFiles = [...modules, 'myman_allinone.js'];
let bundle = `/* MyManager Suite bundle v${version} / Custom Ver. ${displayVersion} — generated, do not edit */\n`;

for (const file of bundleFiles) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) {
        console.error(`Missing bundle module: ${file}`);
        process.exit(1);
    }
    let content = fs.readFileSync(filePath, 'utf8');
    content = stripUserScriptHeader(content);
    bundle += `\n\n// ----- ${file} -----\n${content}`;
}

fs.writeFileSync(path.join(root, bundleFileName), bundle);

const productionLoaderPath = path.join(root, 'myman_loader.user.js');
const productionLoader = `// ==UserScript==
// @name         ${manifest.name}
// @namespace    http://tampermonkey.net/
// @version      ${loaderVersion}
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
// @updateURL    ${loaderUrl}
// @downloadURL  ${loaderUrl}
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

${buildInlineBootstrap()}
`;

function readExistingLoaderVersion(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const match = fs.readFileSync(filePath, 'utf8').match(/\/\/ @version\s+(\S+)/);
        return match ? String(match[1]) : null;
    } catch (_) {
        return null;
    }
}

const existingLoaderVersion = readExistingLoaderVersion(productionLoaderPath);
// Never rewrite production loader on silent/small builds — only with --write-loader
// (or when the file does not exist yet). Manifest loaderVersion alone must not touch it.
const shouldWriteProductionLoader = forceWriteLoader || existingLoaderVersion == null;

if (shouldWriteProductionLoader) {
    fs.writeFileSync(productionLoaderPath, productionLoader);
    console.log(`Wrote ${path.basename(productionLoaderPath)} (@version ${loaderVersion})`);
} else {
    console.log(`Kept ${path.basename(productionLoaderPath)} unchanged (@version ${existingLoaderVersion} — silent-safe; use --write-loader or release --loader to update it)`);
    if (existingLoaderVersion !== String(loaderVersion)) {
        console.warn(`Note: manifest loaderVersion is ${loaderVersion} but ${path.basename(productionLoaderPath)} is still @version ${existingLoaderVersion}. Run release --loader if the loader bootstrap actually changed.`);
    }
}

const localBundlePath = path.join(root, bundleFileName).replace(/\\/g, '/');
const localBundleUrl = `file://${localBundlePath}`;
const localLoader = `// ==UserScript==
// @name         ${manifest.name} (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      ${loaderVersion}
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

${buildInlineBootstrap({ localBundleUrl })}
`;

fs.writeFileSync(path.join(root, 'myman_loader.local.user.js'), localLoader);

const configPath = path.join(root, 'myman_config.js');
let config = fs.readFileSync(configPath, 'utf8');
const metaBlock = `const SCRIPT_META = {
        version: '${version}',
        loaderVersion: '${loaderVersion}',
        silentVersion: '${silentVersion}',
        displayVersion: '${displayVersion}',
        updateBase: '${updateBase}',
        manifestUrl: '${updateBase}/myman_manifest.json',
        loaderUrl: '${loaderUrl}'
    };`;

if (config.includes('const SCRIPT_META = {')) {
    config = config.replace(/const SCRIPT_META = \{[\s\S]*?\};/, metaBlock);
} else {
    config = config.replace(
        /(const STORAGE_KEYS = \{)/,
        `${metaBlock}\n\n    $1`
    );
}

fs.writeFileSync(configPath, config);
console.log(`Generated ${bundleFileName}, local loader — bundle v${version}, Custom Ver. ${displayVersion}, loader v${loaderVersion}${shouldWriteProductionLoader ? ', production loader written' : ''}`);
console.log('Silent updates: node scripts/release.mjs "notes"  |  Loader (Tampermonkey) updates: node scripts/release.mjs --loader "notes"');
