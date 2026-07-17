// ==UserScript==
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

(function tmMmsThemeLoadBlank() {
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
})();
