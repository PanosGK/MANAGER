// ==UserScript==
// @name         MyMANAGER Theme Early Bootstrap (module)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Hide FOUC and apply cached theme colors before heavier modules load.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function tmMmsThemeEarlyBootstrap() {
    'use strict';

    const pathname = window.location.pathname || '';
    if (pathname.includes('login.php')) return;
    if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

    const root = document.documentElement;
    root.style.setProperty('visibility', 'hidden', 'important');
    root.style.setProperty('opacity', '0', 'important');

    if (typeof GM_addStyle === 'function') {
        GM_addStyle(`
            html:not(.tm-mms-theme-ready) {
                visibility: hidden !important;
                opacity: 0 !important;
            }
            html:not(.tm-mms-theme-ready) body {
                visibility: hidden !important;
                opacity: 0 !important;
            }
            html.tm-mms-theme-ready {
                visibility: visible !important;
                opacity: 1 !important;
                transition: opacity 0.15s ease-in;
            }
            html.tm-mms-theme-ready body {
                visibility: visible !important;
                opacity: 1 !important;
            }
        `);
    } else {
        const style = document.createElement('style');
        style.id = 'tm-mms-theme-early-guard';
        style.textContent = 'html:not(.tm-mms-theme-ready),html:not(.tm-mms-theme-ready) body{visibility:hidden!important;opacity:0!important}';
        (document.head || root).appendChild(style);
    }

    if (typeof GM_getValue !== 'function') return;

    try {
        if (GM_getValue('tm_script_enabled', true) === false) {
            root.style.removeProperty('visibility');
            root.style.removeProperty('opacity');
            root.classList.add('tm-mms-theme-ready');
            return;
        }
    } catch (_) { /* ignore */ }

    const THEME_KEY = 'tm_equipped_theme';
    const CACHE_KEY = 'tm_theme_colors_cache';
    const PROFILE_PREFIX = 'tm:p:';

    function readProfileScoped(key, defaultValue) {
        try {
            const profileId = GM_getValue('tm_mms_last_profile_id', '');
            if (profileId) {
                const scoped = GM_getValue(`${PROFILE_PREFIX}${profileId}:${key}`, undefined);
                if (scoped !== undefined) return scoped;
            }
            const legacy = GM_getValue(key, undefined);
            if (legacy !== undefined) return legacy;
        } catch (_) { /* ignore */ }
        return defaultValue;
    }

    function hexToRgb(hex) {
        const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || ''));
        if (!match) return null;
        return {
            r: parseInt(match[1], 16),
            g: parseInt(match[2], 16),
            b: parseInt(match[3], 16),
        };
    }

    function applyColors(colors) {
        if (!colors || typeof colors !== 'object') return;
        const root = document.documentElement;
        for (const [variable, color] of Object.entries(colors)) {
            root.style.setProperty(variable, color);
            if (variable === '--tm-primary-color') {
                const rgb = hexToRgb(color);
                if (rgb) {
                    root.style.setProperty('--tm-primary-color-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
                }
            }
        }
        const bg = colors['--tm-dark-color'] || colors['--tm-shop-item-bg'];
        if (bg) {
            root.style.backgroundColor = bg;
        }
    }

    const themeId = String(readProfileScoped(THEME_KEY, 'default') || 'default');

    let cache = null;
    try {
        const raw = readProfileScoped(CACHE_KEY, null);
        if (raw) {
            cache = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
    } catch (_) { /* ignore */ }

    if (cache && cache.colors) {
        applyColors(cache.colors);
    }

    window.__tmEarlyThemeId = themeId;
})();

window.tmRevealThemedPageIfReady = function tmRevealThemedPageIfReady() {
    if (window.location.pathname.includes('login.php')) {
        document.documentElement.classList.add('tm-mms-theme-ready');
        document.documentElement.style.removeProperty('visibility');
        document.documentElement.style.removeProperty('opacity');
        if (document.body) {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
        return;
    }
    document.documentElement.classList.add('tm-mms-theme-ready');
    document.documentElement.style.removeProperty('visibility');
    document.documentElement.style.removeProperty('opacity');
    if (document.body) {
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }
};
