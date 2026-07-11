// ==UserScript==
// @name         MyManager All-in-One Suite
// @namespace    http://tampermonkey.net/
// @version      174
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
// @updateURL    https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_loader.user.js
// @downloadURL  https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_loader.user.js
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function tmMmsLoaderBootstrap() {
    'use strict';

    var BUNDLE_URL = "https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_suite.bundle.js?v=174";

    function shouldSkip() {
        var p = (window.location && window.location.pathname) || '';
        if (p.indexOf('login.php') !== -1) return true;
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

    function loadBundle() {
        if (typeof GM_xmlhttpRequest !== 'function') {
            console.error('[MMS] GM_xmlhttpRequest unavailable');
            revealOnFailure();
            return;
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: BUNDLE_URL,
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

    if (shouldSkip()) return;

    hidePageNow();
    applyCachedThemeColors();
    loadBundle();

    setTimeout(function () {
        if (!document.documentElement.classList.contains('tm-mms-theme-ready')) {
            console.warn('[MMS] Bundle load timeout — revealing page');
            revealOnFailure();
        }
    }, 15000);
})();
