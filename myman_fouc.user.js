// ==UserScript==
// @name         MyManager FOUC Guard
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blanks MyManager before first paint so themes/suite apply without a flash. Install alongside the main loader. Enable Tampermonkey Instant inject mode.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_fouc.user.js
// @downloadURL  https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_fouc.user.js
// ==/UserScript==

/**
 * Ultra-light FOUC guard (@grant none = fastest Tampermonkey inject).
 * Reads theme/menu cache from localStorage (seeded by the suite).
 * Does NOT reveal — the main loader / suite adds tm-mms-theme-ready.
 *
 * Tampermonkey: Settings → Experimental → Inject Mode → Instant
 */
(function tmMmsFoucGuard() {
    'use strict';

    var THEME_READY_CLASS = 'tm-mms-theme-ready';
    var LS_THEME = 'tm_mms_fouc_theme';
    var LS_MENU = 'tm_mms_fouc_menu_css';

    try {
        var path = (window.location && window.location.pathname) || '';
        if (path.indexOf('login.php') !== -1) return;
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

        var root = document.documentElement;
        if (!root) return;

        var bg = '#121212';
        var themePayload = null;
        try {
            var rawTheme = localStorage.getItem(LS_THEME);
            if (rawTheme) themePayload = JSON.parse(rawTheme);
        } catch (e1) { /* ignore */ }

        if (themePayload && themePayload.bg) bg = String(themePayload.bg);

        root.classList.remove(THEME_READY_CLASS);
        root.setAttribute('data-tm-mms-fouc', '1');
        root.style.setProperty('display', 'none', 'important');
        root.style.setProperty('visibility', 'hidden', 'important');
        root.style.setProperty('opacity', '0', 'important');
        root.style.setProperty('background', bg, 'important');

        if (themePayload && themePayload.colors && typeof themePayload.colors === 'object') {
            Object.keys(themePayload.colors).forEach(function (variable) {
                root.style.setProperty(variable, themePayload.colors[variable]);
            });
            if (themePayload.bg) {
                root.style.backgroundColor = String(themePayload.bg);
            }
        }

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

        try {
            var menuCss = localStorage.getItem(LS_MENU);
            if (menuCss) {
                var menuStyle = document.getElementById('tm-mms-menu-early-guard');
                if (!menuStyle) {
                    menuStyle = document.createElement('style');
                    menuStyle.id = 'tm-mms-menu-early-guard';
                    root.appendChild(menuStyle);
                }
                menuStyle.textContent = menuCss;
            }
        } catch (e2) { /* ignore */ }
    } catch (e) { /* ignore */ }
})();
