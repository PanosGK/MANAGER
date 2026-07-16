/* MyManager FOUC instant hide — keep tiny; first @require for local loader */
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
                    if (c) BG = c['--tm-dark-color'] || c['--tm-shop-item-bg'] || BG;
                }
            }
        } catch (e0) { /* ignore */ }

        var root = document.documentElement;
        root.style.backgroundColor = BG;
        // Do NOT hide <html> with visibility — cover would vanish and flash white.
        root.style.removeProperty('visibility');
        root.style.removeProperty('opacity');

        var css = [
            'html{background:' + BG + '!important;}',
            'html:not(.tm-mms-theme-ready) body{opacity:0!important;}',
            '#tm-mms-boot-cover{',
            'position:fixed!important;inset:0!important;z-index:2147483647!important;',
            'background:' + BG + '!important;pointer-events:none!important;',
            '}',
            'html.tm-mms-theme-ready #tm-mms-boot-cover{display:none!important;}',
            'html.tm-mms-theme-ready body{opacity:1!important;transition:opacity .12s ease-in;}',
        ].join('');

        if (typeof GM_addStyle === 'function') {
            try { GM_addStyle(css); } catch (e1) { /* ignore */ }
        }
        var style = document.createElement('style');
        style.id = 'tm-mms-fouc-boot-style';
        style.textContent = css;
        (document.head || root).appendChild(style);

        function mountCover() {
            if (document.getElementById('tm-mms-boot-cover')) return;
            var cover = document.createElement('div');
            cover.id = 'tm-mms-boot-cover';
            cover.setAttribute('aria-hidden', 'true');
            (document.documentElement).appendChild(cover);
        }
        mountCover();
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', mountCover, { once: true });
        }
    } catch (e) { /* ignore */ }
})();
