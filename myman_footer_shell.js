// ==UserScript==
// @name         MyMANAGER Footer Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Fast snapshot of #tm-footer-controls-container; FOUC mounts early; suite replaces + hydrates vars.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsFooterShell() {
    'use strict';

    const LS_FOOTER = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-footer-shell';
    const CACHE_VERSION = 7;
    const MAX_HTML = 250000;
    const MAX_CSS = 80000;

    let syncTimer = 0;
    let syncing = false;
    let shellWatchObs = null;
    let lastOkAt = 0;

    /** Page-origin localStorage (shared with the FOUC Chrome extension). */
    function pageLocalStorage() {
        try {
            if (typeof unsafeWindow !== 'undefined'
                && unsafeWindow
                && unsafeWindow.localStorage) {
                return unsafeWindow.localStorage;
            }
        } catch (_) { /* ignore */ }
        return localStorage;
    }

    /**
     * Write into the real page localStorage.
     * Tampermonkey sandbox localStorage is usually the page's, but we also
     * inject a one-shot page script so the FOUC extension always sees the key.
     */
    function pageLsSet(key, value) {
        const str = String(value);
        let ok = false;
        try {
            pageLocalStorage().setItem(key, str);
            ok = true;
        } catch (_) { /* quota / denied */ }
        try {
            if (localStorage !== pageLocalStorage()) {
                localStorage.setItem(key, str);
                ok = true;
            }
        } catch (_) { /* ignore */ }

        // Page-context write (CSP may block; ignore failures).
        try {
            const s = document.createElement('script');
            s.textContent = 'try{localStorage.setItem('
                + JSON.stringify(key) + ',' + JSON.stringify(str)
                + ');}catch(e){}';
            (document.documentElement || document.head || document).appendChild(s);
            s.remove();
        } catch (_) { /* CSP */ }

        return ok;
    }

    function pageLsGet(key) {
        try {
            const a = pageLocalStorage().getItem(key);
            if (a != null) return a;
        } catch (_) { /* ignore */ }
        try {
            return localStorage.getItem(key);
        } catch (_) {
            return null;
        }
    }

    function pageLsRemove(key) {
        try { pageLocalStorage().removeItem(key); } catch (_) { /* ignore */ }
        try { localStorage.removeItem(key); } catch (_) { /* ignore */ }
    }

    function readCache() {
        try {
            const raw = pageLsGet(LS_FOOTER);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || data.v !== CACHE_VERSION || typeof data.html !== 'string' || data.html.length < 80) {
                return null;
            }
            return data;
        } catch (_) {
            return null;
        }
    }

    function writeCache(data) {
        const payload = JSON.stringify(data);
        if (pageLsSet(LS_FOOTER, payload)) {
            // Verify the FOUC extension can read what we wrote.
            try {
                const check = pageLsGet(LS_FOOTER);
                if (check && check.length > 80) return true;
            } catch (_) { /* ignore */ }
            return true;
        }
        // Quota: retry HTML only.
        try {
            const slim = JSON.stringify({
                v: CACHE_VERSION,
                updatedAt: data.updatedAt,
                html: data.html,
                css: '',
            });
            return pageLsSet(LS_FOOTER, slim);
        } catch (_) {
            return false;
        }
    }

    function slimClone(clone) {
        if (!clone) return;
        const menu = clone.querySelector('#tm-recent-repairs-menu');
        if (menu) {
            menu.style.display = 'none';
            menu.innerHTML = '';
        }
        clone.querySelectorAll(
            '#tm-notification-panel, #tm-notification-backdrop, .tm-modal-overlay, #tm-coin-history-tooltip'
        ).forEach((el) => el.remove());
    }

    /** Cheap CSS: only small theme style tags — never the mega GM_addStyle sheet. */
    function collectLightCss() {
        const parts = [];
        const ids = [
            'tm-performance-styles',
            'tm-extended-theme-styles',
            'tm-page-theme-styles',
            'tm-mms-fouc-page-css',
            'tm-liquid-glass-styles',
        ];
        ids.forEach((id) => {
            const el = document.getElementById(id);
            const text = el?.textContent || '';
            if (text) parts.push(text.length > MAX_CSS ? text.slice(0, MAX_CSS) : text);
        });
        let css = parts.join('\n');
        if (css.length > MAX_CSS) css = css.slice(0, MAX_CSS);
        return css;
    }

    function collectSnapshot() {
        const container = document.getElementById('tm-footer-controls-container');
        if (!container) return null;
        if (container.getAttribute(SHELL_ATTR) === '1') return null;

        const clone = container.cloneNode(true);
        slimClone(clone);
        clone.removeAttribute(SHELL_ATTR);
        clone.classList.add('tm-footer-shell');

        let html = clone.outerHTML;
        if (html.length > MAX_HTML) {
            console.warn('[MMS Footer Shell] snapshot too large, skipped', html.length);
            return null;
        }
        if (html.length < 80) return null;

        return {
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            html,
            css: collectLightCss(),
        };
    }

    function ensureShellLayoutCss() {
        if (document.getElementById('tm-mms-footer-shell-css')) return;
        const style = document.createElement('style');
        style.id = 'tm-mms-footer-shell-css';
        style.textContent = `
            #tm-footer-controls-container[${SHELL_ATTR}="1"] {
                pointer-events: none;
                width: 100%;
            }
            #tm-footer-controls-container[${SHELL_ATTR}="1"] #tm-footer-controls-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                width: 100%;
            }
            #tm-footer-controls-container[${SHELL_ATTR}="1"] #tm-footer-controls-left,
            #tm-footer-controls-container[${SHELL_ATTR}="1"] #tm-footer-controls-middle,
            #tm-footer-controls-container[${SHELL_ATTR}="1"] #tm-footer-controls-right {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
        `;
        (document.documentElement || document.head || document).appendChild(style);
    }

    function injectCachedShellCss(cssText) {
        if (!cssText) return;
        let style = document.getElementById('tm-mms-footer-shell-css-cache');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-mms-footer-shell-css-cache';
            (document.documentElement || document.head || document).appendChild(style);
        }
        style.textContent = cssText;
    }

    function findFooterCenterCell() {
        return document.querySelector('#footer-outterwrap table td[width="60%"]')
            || document.querySelector('#footer-outterwrap table td:nth-child(2)');
    }

    function mountFooterShellFromCache() {
        try {
            const path = window.location.pathname || '';
            if (path.includes('login.php')) return false;
            if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return false;

            const existing = document.getElementById('tm-footer-controls-container');
            if (existing) return false;

            const data = readCache();
            if (!data) return false;

            const cell = findFooterCenterCell();
            if (!cell) return false;

            ensureShellLayoutCss();
            injectCachedShellCss(data.css || '');

            while (cell.firstChild) cell.removeChild(cell.firstChild);
            cell.insertAdjacentHTML('beforeend', data.html);

            const mounted = cell.querySelector('#tm-footer-controls-container');
            if (!mounted) return false;
            mounted.setAttribute(SHELL_ATTR, '1');
            mounted.classList.add('tm-footer-shell');
            return true;
        } catch (_) {
            return false;
        }
    }

    function removeFooterShellIfPresent() {
        const existing = document.getElementById('tm-footer-controls-container');
        if (existing && existing.getAttribute(SHELL_ATTR) === '1') {
            existing.remove();
            return true;
        }
        return false;
    }

    function isFooterShellMounted() {
        const existing = document.getElementById('tm-footer-controls-container');
        return !!(existing && existing.getAttribute(SHELL_ATTR) === '1');
    }

    function purgeLegacyShellKeys() {
        try {
            const ls = pageLocalStorage();
            const keys = [];
            for (let i = 0; i < ls.length; i++) {
                const k = ls.key(i);
                if (k && k.indexOf('tm_mms_ui_shell') === 0) keys.push(k);
            }
            keys.forEach((k) => {
                try { ls.removeItem(k); } catch (_) { /* ignore */ }
            });
        } catch (_) { /* ignore */ }
    }

    /**
     * @param {{ force?: boolean, reason?: string }} [opts]
     */
    function syncFooterShellCacheNow(opts) {
        const reason = (opts && opts.reason) || 'sync';
        if (syncing) return false;
        if (isFooterShellMounted()) {
            console.warn('[MMS Footer Shell] skip (' + reason + '): shell still mounted');
            return false;
        }
        const live = document.getElementById('tm-footer-controls-container');
        if (!live) {
            console.warn('[MMS Footer Shell] skip (' + reason + '): no live footer yet');
            return false;
        }

        syncing = true;
        try {
            purgeLegacyShellKeys();
            const snap = collectSnapshot();
            if (!snap) {
                console.warn('[MMS Footer Shell] skip (' + reason + '): empty snapshot');
                return false;
            }
            if (writeCache(snap)) {
                lastOkAt = Date.now();
                console.log(
                    `[MMS Footer Shell] cached (~${Math.round(snap.html.length / 1024)}KB) via ${reason}`
                );
                return true;
            }
            console.warn('[MMS Footer Shell] write failed (' + reason + ') — localStorage quota?');
            return false;
        } catch (err) {
            console.warn('[MMS Footer Shell] sync failed', err);
            return false;
        } finally {
            syncing = false;
        }
    }

    /** Debounced (for coin/xp tweaks). Pass true to run immediately. */
    function syncFooterShellCache(forceOrConfig, maybeKeys) {
        // Call sites pass (config, STORAGE_KEYS) — treat non-boolean first arg as soft sync.
        const force = forceOrConfig === true
            || (forceOrConfig && typeof forceOrConfig === 'object' && forceOrConfig.force === true);

        if (force) {
            if (syncTimer) {
                clearTimeout(syncTimer);
                syncTimer = 0;
            }
            return syncFooterShellCacheNow({
                force: true,
                reason: (forceOrConfig && forceOrConfig.reason) || 'force',
            });
        }

        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            syncTimer = 0;
            syncFooterShellCacheNow({ reason: 'debounced' });
        }, 600);
    }

    function stopFooterShellWatch() {
        if (shellWatchObs) {
            try { shellWatchObs.disconnect(); } catch (_) { /* ignore */ }
            shellWatchObs = null;
        }
    }

    function watchAndMountFooterShell() {
        if (mountFooterShellFromCache()) return;
        stopFooterShellWatch();
        try {
            shellWatchObs = new MutationObserver(() => {
                if (mountFooterShellFromCache()) stopFooterShellWatch();
                // Live footer appeared — stop trying to mount a shell over it.
                const live = document.getElementById('tm-footer-controls-container');
                if (live && live.getAttribute(SHELL_ATTR) !== '1') stopFooterShellWatch();
            });
            shellWatchObs.observe(document.documentElement || document, { childList: true, subtree: true });
            setTimeout(() => stopFooterShellWatch(), 12000);
        } catch (_) { /* ignore */ }
    }

    // Cache once more right before unload so the next visit has a snapshot.
    try {
        window.addEventListener('pagehide', () => {
            syncFooterShellCacheNow({ reason: 'pagehide' });
        });
    } catch (_) { /* ignore */ }

    // Keep no-op aliases so older call sites don't break.
    function syncAllUiShells() { syncFooterShellCache(); }
    function watchAndMountAllUiShells() { watchAndMountFooterShell(); }
    function removeAllUiShells() { return removeFooterShellIfPresent() ? 1 : 0; }
    function removeUiShellById(id) {
        if (id === 'tm-footer-controls-container') return removeFooterShellIfPresent();
        return false;
    }
    function isUiShellEl(el) {
        return !!(el && el.getAttribute(SHELL_ATTR) === '1');
    }

    window.tmSyncFooterShellCache = syncFooterShellCache;
    window.tmSyncFooterShellCacheNow = syncFooterShellCacheNow;
    window.tmMountFooterShellFromCache = mountFooterShellFromCache;
    window.tmRemoveFooterShellIfPresent = removeFooterShellIfPresent;
    window.tmWatchAndMountFooterShell = watchAndMountFooterShell;
    window.tmStopFooterShellWatch = stopFooterShellWatch;
    window.tmIsFooterShellMounted = isFooterShellMounted;
    window.TM_FOOTER_SHELL_LS_KEY = LS_FOOTER;
    window.tmDebugFooterShell = function tmDebugFooterShell() {
        const raw = pageLsGet(LS_FOOTER);
        const live = document.getElementById('tm-footer-controls-container');
        return {
            key: LS_FOOTER,
            bytes: raw ? raw.length : 0,
            lastOkAt,
            hasLive: !!live,
            isShell: !!(live && live.getAttribute(SHELL_ATTR) === '1'),
            cell: !!findFooterCenterCell(),
            parsed: readCache(),
        };
    };

    window.tmSyncAllUiShells = syncAllUiShells;
    window.tmWatchAndMountAllUiShells = watchAndMountAllUiShells;
    window.tmRemoveAllUiShells = removeAllUiShells;
    window.tmRemoveUiShellById = removeUiShellById;
    window.tmIsUiShellEl = isUiShellEl;
})();
