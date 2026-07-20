// ==UserScript==
// @name         MyManager FOUC Guard
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Blanks MyManager before first paint. REQUIRES Tampermonkey Instant / UserScripts API Dynamic. Install alongside the main loader.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_fouc.user.js
// @downloadURL  https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_fouc.user.js
// ==/UserScript==

/**
 * Ultra-early FOUC guard (@grant none = no sandbox delay).
 *
 * REQUIRED Tampermonkey settings (Config mode → Advanced):
 *   1) Content Script API → "UserScripts API Dynamic"  (best document_start on Chrome MV3)
 *   2) Inject Mode → Instant  (if the option exists)
 *
 * Put this script ABOVE the main MyManager loader in the Dashboard.
 * Does NOT reveal — loader/suite adds tm-mms-theme-ready.
 */
(function tmMmsFoucGuard() {
    'use strict';

    var READY = 'tm-mms-theme-ready';
    var LS_THEME = 'tm_mms_fouc_theme';
    var LS_MENU = 'tm_mms_fouc_menu_css';

    // Skip pages — check path only (no localStorage yet).
    try {
        var path = (location.pathname || '');
        if (path.indexOf('login.php') !== -1) return;
        if ((location.search || '').indexOf('tm_quickview=1') !== -1) return;
    } catch (eSkip) { /* ignore */ }

    var bg = '#121212';
    var hideCss = 'html:not(.' + READY + '),html:not(.' + READY + ') body{'
        + 'display:none!important;visibility:hidden!important;opacity:0!important;}'
        + 'html:not(.' + READY + '){background:' + bg + '!important;}';

    // 1) Synchronous parser insert — earliest possible when Instant/Dynamic works.
    try {
        if (document.readyState === 'loading') {
            document.write('<style id="tm-mms-fouc-guard">' + hideCss + '</style>');
        }
    } catch (eWrite) { /* ignore */ }

    function applyInlineHide(root, background) {
        if (!root) return;
        try {
            root.classList.remove(READY);
            root.setAttribute('data-tm-mms-fouc', '1');
            root.style.setProperty('display', 'none', 'important');
            root.style.setProperty('visibility', 'hidden', 'important');
            root.style.setProperty('opacity', '0', 'important');
            root.style.setProperty('background', background, 'important');
        } catch (eInline) { /* ignore */ }
    }

    function ensureStyle(cssText) {
        try {
            var style = document.getElementById('tm-mms-fouc-guard');
            if (!style) {
                style = document.createElement('style');
                style.id = 'tm-mms-fouc-guard';
                style.textContent = cssText;
                var host = document.documentElement || document.head || document;
                host.appendChild(style);
            } else {
                style.textContent = cssText;
            }
        } catch (eStyle) { /* ignore */ }
    }

    // 2) Hide immediately if <html> already exists (before any localStorage).
    applyInlineHide(document.documentElement, bg);
    ensureStyle(hideCss);

    // 3) If <html> is not ready yet, watch and hide the instant it appears.
    if (!document.documentElement) {
        try {
            var obs = new MutationObserver(function () {
                if (document.documentElement) {
                    applyInlineHide(document.documentElement, bg);
                    ensureStyle(hideCss);
                    obs.disconnect();
                }
            });
            obs.observe(document, { childList: true, subtree: true });
        } catch (eObs) { /* ignore */ }
    }

    // 4) Refine background + theme vars + menu CSS from localStorage (after hide).
    try {
        var rawTheme = localStorage.getItem(LS_THEME);
        if (!rawTheme) return;
        var themePayload = JSON.parse(rawTheme);
        if (themePayload && themePayload.bg) bg = String(themePayload.bg);

        hideCss = 'html:not(.' + READY + '),html:not(.' + READY + ') body{'
            + 'display:none!important;visibility:hidden!important;opacity:0!important;}'
            + 'html:not(.' + READY + '){background:' + bg + '!important;}';
        ensureStyle(hideCss);
        applyInlineHide(document.documentElement, bg);

        if (themePayload.colors && typeof themePayload.colors === 'object' && document.documentElement) {
            Object.keys(themePayload.colors).forEach(function (variable) {
                document.documentElement.style.setProperty(variable, themePayload.colors[variable]);
            });
            if (themePayload.bg) {
                document.documentElement.style.backgroundColor = String(themePayload.bg);
            }
        }

        var menuCss = localStorage.getItem(LS_MENU);
        if (menuCss) {
            var menuStyle = document.getElementById('tm-mms-menu-early-guard');
            if (!menuStyle) {
                menuStyle = document.createElement('style');
                menuStyle.id = 'tm-mms-menu-early-guard';
                (document.documentElement || document.head || document).appendChild(menuStyle);
            }
            menuStyle.textContent = menuCss;
        }
    } catch (eLs) { /* ignore */ }
})();
