// ==UserScript==
// @name         MyMANAGER Theme Early Bootstrap (module)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Apply cached theme colors and menu hide CSS before heavier modules load.
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

    if (typeof GM_getValue !== 'function') return;

    try {
        if (GM_getValue('tm_script_enabled', true) === false) {
            root.classList.add('tm-mms-menu-ready');
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
        const rootEl = document.documentElement;
        const expanded = typeof window.tmBuildDerivedThemeTokens === 'function'
            ? window.tmBuildDerivedThemeTokens(colors)
            : colors;
        for (const [variable, color] of Object.entries(expanded)) {
            rootEl.style.setProperty(variable, color);
        }
        const shopBg = expanded['--tm-shop-item-bg'] || colors['--tm-shop-item-bg'];
        const shopRgb = (() => {
            const s = String(shopBg || '').trim();
            const rgba = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3] };
            return hexToRgb(s);
        })();
        const lightShop = shopRgb
            ? (0.299 * shopRgb.r + 0.587 * shopRgb.g + 0.114 * shopRgb.b) / 255 > 0.52
            : true;
        const shopText = expanded['--tm-shop-item-text'] || colors['--tm-shop-item-text']
            || (lightShop
                ? (expanded['--tm-text-on-light'] || colors['--tm-text-on-light'] || '#343a40')
                : (expanded['--tm-text-on-dark'] || colors['--tm-text-on-dark'] || expanded['--tm-primary-color'] || colors['--tm-primary-color'] || '#e8e8e8'));
        rootEl.style.setProperty('--tm-shop-item-text', shopText);
        const bg = expanded['--tm-dark-color'] || colors['--tm-dark-color'] || shopBg;
        if (bg && String(window.__tmEarlyThemeId || readProfileScoped(THEME_KEY, 'default')) !== 'default') {
            rootEl.style.backgroundColor = bg;
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

    if (themeId !== 'default' && cache && cache.colors) {
        applyColors(cache.colors);
    }

    window.__tmEarlyThemeId = themeId;

    const HIDDEN_MENU_KEY = 'tm_hidden_menu_items';
    const menuFeatureEnabled = readProfileScoped('hiddenMenuItemsEnabled', true) !== false;
    let hiddenMenuItems = [];

    try {
        const rawHidden = readProfileScoped(HIDDEN_MENU_KEY, '[]');
        hiddenMenuItems = typeof rawHidden === 'string' ? JSON.parse(rawHidden) : (rawHidden || []);
        if (!Array.isArray(hiddenMenuItems)) hiddenMenuItems = [];
    } catch (_) {
        hiddenMenuItems = [];
    }

    window.__tmMenuGuardActive = menuFeatureEnabled && hiddenMenuItems.length > 0;

    function cssAttrSubstring(value) {
        return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function buildMenuHideCss(items) {
        const rules = [
            'html:not(.tm-mms-menu-ready) .rnr-left { visibility: hidden !important; opacity: 0 !important; }',
            'html.tm-mms-menu-ready .rnr-left { visibility: visible !important; opacity: 1 !important; transition: opacity 0.12s ease-in; }',
        ];

        items.forEach((item) => {
            const href = typeof item === 'object' ? item.href : '';
            const id = typeof item === 'string' ? item : item?.id;
            if (href && href.includes('?')) {
                const escaped = cssAttrSubstring(href);
                rules.push(`.rnr-b-vmenu.simple.main li:has(> div > div > a[href*="${escaped}"]) { display: none !important; }`);
                rules.push(`.rnr-b-vmenu.simple.main li:has(> div a[href*="${escaped}"]) { display: none !important; }`);
            } else if (href) {
                const escaped = cssAttrSubstring(href);
                rules.push(`.rnr-b-vmenu.simple.main li:has(> div > div > a[href="${escaped}"]) { display: none !important; }`);
                rules.push(`.rnr-b-vmenu.simple.main li:has(> div a[href="${escaped}"]) { display: none !important; }`);
            } else if (id) {
                rules.push(`.rnr-b-vmenu.simple.main li[data-menu-id="${cssAttrSubstring(id)}"] { display: none !important; }`);
            }
        });

        return rules.join('\n');
    }

    function injectMenuGuardCss(cssText) {
        let style = document.getElementById('tm-mms-menu-early-guard');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-mms-menu-early-guard';
            (document.head || root).appendChild(style);
        }
        style.textContent = cssText;
    }

    window.tmRefreshMenuEarlyCss = function tmRefreshMenuEarlyCss(items) {
        const list = Array.isArray(items) ? items : [];
        window.__tmMenuGuardActive = menuFeatureEnabled && list.length > 0;
        if (menuFeatureEnabled && list.length > 0) {
            injectMenuGuardCss(buildMenuHideCss(list));
        } else {
            injectMenuGuardCss('');
            document.documentElement.classList.add('tm-mms-menu-ready');
        }
    };

    if (window.__tmMenuGuardActive) {
        injectMenuGuardCss(buildMenuHideCss(hiddenMenuItems));
    } else {
        root.classList.add('tm-mms-menu-ready');
    }
})();

/** Clears menu guard when ready, and removes the loader boot cover if still present. */
window.tmRevealThemedPageIfReady = function tmRevealThemedPageIfReady() {
    if (typeof window.tmRevealBootCover === 'function') {
        window.tmRevealBootCover();
    } else {
        try {
            document.documentElement.classList.remove('tm-mms-booting');
            const cover = document.getElementById('tm-mms-boot-cover');
            if (cover) cover.remove();
            const style = document.getElementById('tm-mms-boot-cover-style');
            if (style) style.remove();
        } catch (_) { /* ignore */ }
        window.__tmBootCoverActive = false;
    }
    if (window.__tmMenuGuardActive && !document.documentElement.classList.contains('tm-mms-menu-ready')) {
        return;
    }
    document.documentElement.classList.add('tm-mms-menu-ready');
};
