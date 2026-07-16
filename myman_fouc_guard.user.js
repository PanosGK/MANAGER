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
                    // Prefer page chrome bg — shop-item-bg is often white on light themes.
                    if (c) BG = c['--tm-dark-color'] || c['--tm-body-bg'] || c['--tm-primary-bg'] || BG;
                }
            }
        } catch (e0) { /* ignore */ }

        var root = document.documentElement;
        try {
            root.style.setProperty('background-color', BG, 'important');
        } catch (eBg) {
            root.style.backgroundColor = BG;
        }
        // Do NOT hide <html> with visibility — cover would vanish and flash browser-white.
        root.style.removeProperty('visibility');
        root.style.removeProperty('opacity');

        function hideBody(el) {
            if (!el || el.getAttribute('data-tm-mms-fouc') === '1') return;
            if (root.classList.contains('tm-mms-theme-ready')) return;
            el.setAttribute('data-tm-mms-fouc', '1');
            try {
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
            } catch (eH) {
                el.style.opacity = '0';
                el.style.visibility = 'hidden';
            }
        }

        function mountCover() {
            if (root.classList.contains('tm-mms-theme-ready')) return;
            var cover = document.getElementById('tm-mms-boot-cover');
            if (!cover) {
                cover = document.createElement('div');
                cover.id = 'tm-mms-boot-cover';
                cover.setAttribute('aria-hidden', 'true');
                // Inline styles so the cover paints even if <style> injection is delayed.
                cover.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:' + BG + ';pointer-events:none;display:block;';
                if (root.firstChild) root.insertBefore(cover, root.firstChild);
                else root.appendChild(cover);
            } else {
                cover.style.background = BG;
                cover.style.display = 'block';
            }
        }

        var css = [
            'html{background:' + BG + '!important;}',
            'html:not(.tm-mms-theme-ready) body{opacity:0!important;visibility:hidden!important;}',
            '#tm-mms-boot-cover{',
            'position:fixed!important;inset:0!important;z-index:2147483647!important;',
            'background:' + BG + '!important;pointer-events:none!important;',
            '}',
            'html.tm-mms-theme-ready #tm-mms-boot-cover{display:none!important;}',
            'html.tm-mms-theme-ready body{opacity:1!important;visibility:visible!important;transition:opacity .12s ease-in;}',
        ].join('');

        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(css); } catch (e1) { /* ignore */ }
        }
        var style = document.createElement('style');
        style.id = 'tm-mms-fouc-boot-style';
        style.textContent = css;
        if (document.head) {
            document.head.insertBefore(style, document.head.firstChild);
        } else {
            root.insertBefore(style, root.firstChild);
        }

        mountCover();
        if (document.body) hideBody(document.body);

        try {
            if (window.__tmMmsFoucMo) {
                try { window.__tmMmsFoucMo.disconnect(); } catch (eD) { /* ignore */ }
            }
            var mo = new MutationObserver(function () {
                if (root.classList.contains('tm-mms-theme-ready')) {
                    mo.disconnect();
                    return;
                }
                mountCover();
                if (document.body) hideBody(document.body);
            });
            mo.observe(root, { childList: true, subtree: true });
            window.__tmMmsFoucMo = mo;
        } catch (eMo) { /* ignore */ }

        if (!document.body) {
            document.addEventListener('DOMContentLoaded', function () {
                hideBody(document.body);
                mountCover();
            }, { once: true });
        }
    } catch (e) { /* ignore */ }
})();
