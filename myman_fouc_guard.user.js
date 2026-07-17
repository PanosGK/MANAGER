// ==UserScript==
// @name         MyManager FOUC Guard
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Optional extra hide layer (no downloads). Enable if you still see a flash before the main suite loads.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// ==/UserScript==

(function tmMmsHidePageForTheme() {
    try {
        if (window.__tmMmsFoucHideApplied) return;
        var path = (window.location && window.location.pathname) || '';
        if (path.indexOf('login.php') !== -1) return;
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;
        try {
            if (typeof GM_getValue === 'function' && GM_getValue('tm_script_enabled', true) === false) return;
        } catch (eSkip) { /* ignore */ }
        window.__tmMmsFoucHideApplied = true;

        var BG = '#121212';
        try {
            if (typeof GM_getValue === 'function') {
                var profileId = GM_getValue('tm_mms_last_profile_id', '') || '';
                var raw = profileId
                    ? GM_getValue('tm:p:' + profileId + ':tm_theme_colors_cache', null)
                    : null;
                if (raw == null) raw = GM_getValue('tm_theme_colors_cache', null);
                if (raw) {
                    var cache = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    var c = cache && cache.colors;
                    if (c) BG = c['--tm-dark-color'] || c['--tm-body-bg'] || c['--tm-primary-bg'] || BG;
                }
            }
        } catch (e0) { /* ignore */ }

        var root = document.documentElement;
        root.style.setProperty('visibility', 'hidden', 'important');
        root.style.setProperty('opacity', '0', 'important');
        root.style.backgroundColor = BG;

        var css = [
            'html:not(.tm-mms-theme-ready){',
            'visibility:hidden!important;',
            'opacity:0!important;',
            'background:' + BG + '!important;',
            '}',
            'html:not(.tm-mms-theme-ready) body{',
            'visibility:hidden!important;',
            'opacity:0!important;',
            '}',
            'html.tm-mms-theme-ready{',
            'visibility:visible!important;',
            'opacity:1!important;',
            '}',
            'html.tm-mms-theme-ready body{',
            'visibility:visible!important;',
            'opacity:1!important;',
            '}',
        ].join('');

        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(css); } catch (e1) { /* ignore */ }
        }
        var style = document.createElement('style');
        style.id = 'tm-mms-fouc-boot-style';
        style.textContent = css;
        var parent = document.head || document.getElementsByTagName('head')[0] || root;
        parent.appendChild(style);
    } catch (e) { /* ignore */ }
})();
