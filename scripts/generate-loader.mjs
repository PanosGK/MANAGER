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

/** Runs synchronously the moment the bundle is parsed — before any module body. */
const INSTANT_FOUC_GUARD = `
(function tmMmsInstantFoucGuard() {
    try {
        var path = (window.location && window.location.pathname) || '';
        if (path.indexOf('login.php') !== -1) return;
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;
        var root = document.documentElement;
        root.style.setProperty('visibility', 'hidden', 'important');
        root.style.setProperty('opacity', '0', 'important');
        root.style.backgroundColor = '#121212';
        var style = document.createElement('style');
        style.id = 'tm-mms-instant-guard';
        style.textContent = [
            'html:not(.tm-mms-theme-ready){',
            'visibility:hidden!important;',
            'opacity:0!important;',
            'background:#121212!important;',
            '}',
            'html:not(.tm-mms-theme-ready) body{',
            'visibility:hidden!important;',
            'opacity:0!important;',
            '}',
        ].join('');
        var parent = document.head || document.getElementsByTagName('head')[0] || root;
        parent.appendChild(style);
    } catch (e) { /* ignore */ }
})();
`;

function buildInlineBootstrap(bundleLoadUrl) {
    return `(function tmMmsLoaderBootstrap() {
    'use strict';

    var LOADER_VERSION = ${JSON.stringify(String(loaderVersion))};
    var UPDATE_BASE = ${JSON.stringify(updateBase)};
    var MANIFEST_URL = UPDATE_BASE + '/myman_manifest.json';
    var BUNDLE_FILE = ${JSON.stringify(bundleFileName)};
    var FALLBACK_BUNDLE_VERSION = ${JSON.stringify(String(version))};

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

    function hidePageNow() {
        var root = document.documentElement;
        root.style.setProperty('visibility', 'hidden', 'important');
        root.style.setProperty('opacity', '0', 'important');
        root.style.backgroundColor = '#121212';

        var css = [
            'html:not(.tm-mms-theme-ready){',
            'visibility:hidden!important;',
            'opacity:0!important;',
            'background:#121212!important;',
            '}',
            'html:not(.tm-mms-theme-ready) body{',
            'visibility:hidden!important;',
            'opacity:0!important;',
            '}',
        ].join('');

        try {
            var style = document.createElement('style');
            style.id = 'tm-mms-loader-guard';
            style.textContent = css;
            var parent = document.head || document.getElementsByTagName('head')[0] || root;
            parent.appendChild(style);
        } catch (e) { /* ignore */ }

        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(css); } catch (e2) { /* ignore */ }
        }
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
            if (bg) root.style.backgroundColor = bg;
        } catch (e) { /* ignore */ }
    }

    function revealOnFailure() {
        document.documentElement.classList.add('tm-mms-theme-ready');
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
        var bundleUrl = UPDATE_BASE + '/' + BUNDLE_FILE + '?v=' + encodeURIComponent(versionTag) + '&t=' + Date.now();

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

    if (shouldSkip()) return;

    var loginPath = (window.location && window.location.pathname) || '';
    if (loginPath.indexOf('login.php') !== -1 && isStatus40LoginPending()) {
        runStatus40InlineAutoLogin();
        return;
    }

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

const bundleFiles = [...modules, 'myman_allinone.js'];
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
// @updateURL    ${loaderUrl}
// @downloadURL  ${loaderUrl}
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

${buildInlineBootstrap(bundleUrl)}
`;

fs.writeFileSync(path.join(root, 'myman_loader.user.js'), productionLoader);

const localBundlePath = path.join(root, bundleFileName).replace(/\\/g, '/');
const localLoader = `// ==UserScript==
// @name         ${manifest.name} (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      ${loaderVersion}
// @description  Local development — bundled modules from disk. Run: node scripts/generate-loader.mjs after edits.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @require      file://${localBundlePath}
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Local dev — bundle loads from disk (fast). Regenerate with: node scripts/generate-loader.mjs
`;

fs.writeFileSync(path.join(root, 'myman_loader.local.user.js'), localLoader);

const foucGuard = `// ==UserScript==
// @name         MyManager FOUC Guard
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Optional extra hide layer (no downloads). Enable if you still see a flash before the main suite loads.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var path = (window.location && window.location.pathname) || '';
    if (path.indexOf('login.php') !== -1) return;
    if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

    var root = document.documentElement;
    root.style.setProperty('visibility', 'hidden', 'important');
    root.style.setProperty('opacity', '0', 'important');
    root.style.backgroundColor = '#121212';

    var style = document.createElement('style');
    style.id = 'tm-mms-fouc-guard';
    style.textContent = 'html:not(.tm-mms-theme-ready),html:not(.tm-mms-theme-ready) body{visibility:hidden!important;opacity:0!important;background:#121212!important}';
    (document.head || root).appendChild(style);
})();
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
console.log(`Generated ${bundleFileName}, async loader (no @require), local loader, fouc guard — bundle v${version}, Custom Ver. ${displayVersion}, loader v${loaderVersion}`);
