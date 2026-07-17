// ==UserScript==
// @name         MyManager Theme Blank Guard
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Optional: install ABOVE the main suite. Blanks the page until themes are ready.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// ==/UserScript==

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
        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(style.textContent); } catch (e1) { /* ignore */ }
        }
    } catch (e) { /* ignore */ }
})();
