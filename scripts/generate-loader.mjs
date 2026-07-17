/**
 * Regenerates myman_loader.user.js, myman_suite.bundle.js, and syncs SCRIPT_META
 * from myman_manifest.json.
 *
 * Silent release (bumps bundle + Custom Ver.):
 *   node scripts/release.mjs "Short release note"
 *
 * Regenerate only (no version bump):
 *   node scripts/generate-loader.mjs
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

function stripUserScriptHeader(content) {
    return content.replace(/^\/\/ ==UserScript==[\s\S]*?^\/\/ ==\/UserScript==\r?\n?/m, '');
}

/**
 * Early page blank while themes load (original approach):
 * hide body until .tm-mms-theme-ready. Used at top of production loader
 * and as optional standalone guard. Local uses theme_early as first @require instead.
 */
const FOUC_HIDE_IIFE = `(function tmMmsThemeLoadBlank() {
    try {
        var path = (window.location && window.location.pathname) || '';
        if (path.indexOf('login.php') !== -1) return;
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;
        try {
            if (typeof GM_getValue === 'function' && GM_getValue('tm_script_enabled', true) === false) return;
        } catch (eSkip) { /* ignore */ }
        var css = [
            'html:not(.tm-mms-theme-ready) body{',
            'visibility:hidden!important;',
            'opacity:0!important;',
            '}',
            'html.tm-mms-theme-ready body{',
            'visibility:visible!important;',
            'opacity:1!important;',
            'transition:opacity .2s ease-in;',
            '}',
        ].join('');
        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(css); } catch (e1) { /* ignore */ }
        }
        var style = document.createElement('style');
        style.id = 'tm-mms-theme-load-blank';
        style.textContent = css;
        var parent = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
        parent.appendChild(style);
    } catch (e) { /* ignore */ }
})();`;

/** Also prepended to the production bundle as a safety net after eval. */
const INSTANT_FOUC_GUARD = `\n${FOUC_HIDE_IIFE}\n`;

function buildInlineBootstrap({ localBundleUrl = null } = {}) {
    return `(function tmMmsLoaderBootstrap() {
    'use strict';

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

    function hidePageNow() {
        ${FOUC_HIDE_IIFE}
    }

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

    function revealOnFailure() {
        document.documentElement.classList.add('tm-mms-theme-ready');
        document.documentElement.classList.add('tm-mms-menu-ready');
        document.documentElement.style.removeProperty('visibility');
        document.documentElement.style.removeProperty('opacity');
        if (document.body) {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
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

    function loadBundle(bundleVersion) {
        if (typeof GM_xmlhttpRequest !== 'function') {
            console.error('[MMS] GM_xmlhttpRequest unavailable');
            revealOnFailure();
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
                        revealOnFailure();
                    }
                } else {
                    console.error('[MMS] Bundle HTTP error:', response.status);
                    revealOnFailure();
                }
            },
            onerror: function () {
                console.error('[MMS] Bundle fetch failed');
                revealOnFailure();
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
        // Extension/Stylus FOUC CSS hides body until this class exists.
        document.documentElement.classList.add('tm-mms-theme-ready');
        document.documentElement.classList.add('tm-mms-menu-ready');
        return;
    }

    var loginPath = (window.location && window.location.pathname) || '';
    if (loginPath.indexOf('login.php') !== -1 && isStatus40LoginPending()) {
        document.documentElement.classList.add('tm-mms-theme-ready');
        document.documentElement.classList.add('tm-mms-menu-ready');
        runStatus40InlineAutoLogin();
        return;
    }

    // Hide before any network — first paint must not show unthemed host UI.
    hidePageNow();
    applyCachedThemeColors();
    fetchManifestThenLoadBundle();

    setTimeout(function () {
        if (!document.documentElement.classList.contains('tm-mms-theme-ready')) {
            console.warn('[MMS] Bundle load timeout — revealing page');
            revealOnFailure();
        }
    }, 15000);
})();`;
}

const foucInstantPath = path.join(root, 'myman_fouc_instant.js');
fs.writeFileSync(foucInstantPath, `/* MyManager FOUC instant hide — first lines of local @require bundle */\n${FOUC_HIDE_IIFE}\n`);

// theme_early must run before heavy style modules so the hide sticks.
const orderedModules = (() => {
    const list = [...modules];
    const early = 'myman_theme_early.js';
    const idx = list.indexOf(early);
    if (idx > 0) {
        list.splice(idx, 1);
        list.unshift(early);
    }
    return list;
})();

const bundleFiles = [...orderedModules, 'myman_allinone.js'];
let bundle = `/* MyManager Suite bundle v${version} / Custom Ver. ${displayVersion} — generated, do not edit */\n`;
bundle += INSTANT_FOUC_GUARD.trim() + '\n';

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

// Hide before any network fetch (production).
${FOUC_HIDE_IIFE}

${buildInlineBootstrap()}
`;

fs.writeFileSync(path.join(root, 'myman_loader.user.js'), productionLoader);

// Proven local setup (themes era): MANY small @requires with theme_early FIRST.
// That way the blank/hide runs before Tampermonkey parses huge modules (mascot, etc.).
// A single @require of the giant bundle parses everything before ANY hide — that broke it.
const localModuleFiles = [...orderedModules, 'myman_allinone.js'];
const localRequireLines = localModuleFiles
    .map((file) => `// @require      file://${path.join(root, file).replace(/\\/g, '/')}`)
    .join('\n');

const localLoader = `// ==UserScript==
// @name         ${manifest.name} (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      ${loaderVersion}
// @description  Local development — theme_early first, then modules from disk. Run: npm run build. Enable "Allow access to local file URLs".
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
${localRequireLines}
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Local: theme_early is the first @require (hides body until themes are ready).
`;

fs.writeFileSync(path.join(root, 'myman_loader.local.user.js'), localLoader);

const foucGuard = `// ==UserScript==
// @name         MyManager Theme Early Guard
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Optional: install ABOVE the main suite. Hides body until themes ready (same as theme_early).
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// ==/UserScript==

${FOUC_HIDE_IIFE}
`;

fs.writeFileSync(path.join(root, 'myman_fouc_guard.user.js'), foucGuard);

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
console.log(`Generated ${bundleFileName}, production loader, local @require loader, fouc guard — bundle v${version}, Custom Ver. ${displayVersion}, loader v${loaderVersion}`);
console.log('Note: Custom Ver. only changes when you run: node scripts/release.mjs "what changed"');
