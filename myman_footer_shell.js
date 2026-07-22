// ==UserScript==
// @name         MyMANAGER Footer Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Snapshot #tm-footer-controls-container for FOUC early mount.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsFooterShell() {
    'use strict';

    const LS_FOOTER = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-footer-shell';
    const CACHE_VERSION = 8;
    const MSG_TYPE = 'TM_MMS_FOOTER_CACHE';
    const MAX_HTML = 200000;

    let syncTimer = 0;
    let syncing = false;
    let shellWatchObs = null;
    let lastOkAt = 0;
    let lastError = '';

    function getUnsafe() {
        try {
            if (typeof unsafeWindow !== 'undefined' && unsafeWindow) return unsafeWindow;
        } catch (_) { /* ignore */ }
        return null;
    }

    function pageLocalStorage() {
        const uw = getUnsafe();
        try {
            if (uw && uw.localStorage) return uw.localStorage;
        } catch (_) { /* ignore */ }
        return localStorage;
    }

    function publishToExtension(data) {
        const payload = {
            type: MSG_TYPE,
            v: CACHE_VERSION,
            updatedAt: data.updatedAt,
            html: data.html,
        };
        // 1) Page-context postMessage — Chrome extension content scripts always hear this.
        try {
            const s = document.createElement('script');
            s.textContent = 'try{window.postMessage(' + JSON.stringify(payload) + ',"*");}catch(e){}';
            (document.documentElement || document.head || document).appendChild(s);
            s.remove();
        } catch (_) { /* CSP */ }
        // 2) Direct / unsafeWindow fallbacks
        try {
            window.postMessage(payload, '*');
        } catch (_) { /* ignore */ }
        try {
            const uw = getUnsafe();
            if (uw && typeof uw.postMessage === 'function') uw.postMessage(payload, '*');
        } catch (_) { /* ignore */ }
        try {
            document.documentElement.dispatchEvent(new CustomEvent('tm-mms-footer-cache', {
                detail: payload,
                bubbles: true,
            }));
        } catch (_) { /* ignore */ }
    }

    function writeLocal(data) {
        const json = JSON.stringify({
            v: CACHE_VERSION,
            updatedAt: data.updatedAt,
            html: data.html,
            css: '',
        });
        let ok = false;
        try {
            pageLocalStorage().setItem(LS_FOOTER, json);
            ok = true;
        } catch (err) {
            lastError = 'localStorage: ' + (err && err.message ? err.message : String(err));
        }
        try {
            if (localStorage !== pageLocalStorage()) {
                localStorage.setItem(LS_FOOTER, json);
                ok = true;
            }
        } catch (_) { /* ignore */ }
        return ok;
    }

    function readLocal() {
        try {
            const raw = pageLocalStorage().getItem(LS_FOOTER) || localStorage.getItem(LS_FOOTER);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || typeof data.html !== 'string' || data.html.length < 80) return null;
            if (data.v !== CACHE_VERSION && data.v !== 7 && data.v !== 4) return null;
            return data;
        } catch (_) {
            return null;
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
        // Drop heavy SVG icons — keep structure + text so mount is cheap.
        clone.querySelectorAll('svg').forEach((svg) => {
            const mark = document.createElement('span');
            mark.className = 'tm-footer-shell-icon';
            mark.textContent = svg.getAttribute('aria-label') || '';
            svg.replaceWith(mark);
        });
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
            lastError = 'snapshot too large: ' + html.length;
            console.warn('[MMS Footer Shell]', lastError);
            return null;
        }
        if (html.length < 80) {
            lastError = 'snapshot too small';
            return null;
        }

        return {
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            html,
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
                opacity: 0.92;
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

    function findFooterCenterCell() {
        return document.querySelector('#footer-outterwrap table td[width="60%"]')
            || document.querySelector('#footer-outterwrap table td:nth-child(2)');
    }

    function mountFooterShellFromCache() {
        try {
            const path = window.location.pathname || '';
            if (path.includes('login.php')) return false;
            if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return false;
            if (document.getElementById('tm-footer-controls-container')) return false;

            const data = readLocal();
            if (!data) return false;
            const cell = findFooterCenterCell();
            if (!cell) return false;

            ensureShellLayoutCss();
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

    function syncFooterShellCacheNow(opts) {
        const reason = (opts && opts.reason) || 'sync';
        if (syncing) return false;
        if (isFooterShellMounted()) {
            lastError = 'shell still mounted';
            console.warn('[MMS Footer Shell] skip (' + reason + '): ' + lastError);
            return false;
        }
        if (!document.getElementById('tm-footer-controls-container')) {
            lastError = 'no live footer';
            console.warn('[MMS Footer Shell] skip (' + reason + '): ' + lastError);
            return false;
        }

        syncing = true;
        try {
            const snap = collectSnapshot();
            if (!snap) {
                console.warn('[MMS Footer Shell] skip (' + reason + '): ' + (lastError || 'no snapshot'));
                return false;
            }

            const lsOk = writeLocal(snap);
            publishToExtension(snap);
            lastOkAt = Date.now();
            lastError = '';
            console.log(
                `[MMS Footer Shell] cached (~${Math.round(snap.html.length / 1024)}KB) via ${reason}`
                + (lsOk ? '' : ' [ext-only]')
            );
            return true;
        } catch (err) {
            lastError = String(err && err.message ? err.message : err);
            console.warn('[MMS Footer Shell] sync failed', err);
            return false;
        } finally {
            syncing = false;
        }
    }

    function syncFooterShellCache(forceOrConfig) {
        const force = forceOrConfig === true
            || (forceOrConfig && typeof forceOrConfig === 'object' && forceOrConfig.force === true);

        if (force) {
            if (syncTimer) {
                clearTimeout(syncTimer);
                syncTimer = 0;
            }
            return syncFooterShellCacheNow({
                reason: (forceOrConfig && forceOrConfig.reason) || 'force',
            });
        }

        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            syncTimer = 0;
            syncFooterShellCacheNow({ reason: 'debounced' });
        }, 800);
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
                const live = document.getElementById('tm-footer-controls-container');
                if (live && live.getAttribute(SHELL_ATTR) !== '1') stopFooterShellWatch();
            });
            shellWatchObs.observe(document.documentElement || document, { childList: true, subtree: true });
            setTimeout(() => stopFooterShellWatch(), 12000);
        } catch (_) { /* ignore */ }
    }

    try {
        window.addEventListener('pagehide', () => {
            syncFooterShellCacheNow({ reason: 'pagehide' });
        });
    } catch (_) { /* ignore */ }

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

    function debugFooterShell() {
        const raw = (() => {
            try { return pageLocalStorage().getItem(LS_FOOTER); } catch (_) { return null; }
        })();
        const live = document.getElementById('tm-footer-controls-container');
        return {
            key: LS_FOOTER,
            version: CACHE_VERSION,
            bytes: raw ? raw.length : 0,
            lastOkAt,
            lastError,
            hasLive: !!live,
            isShell: !!(live && live.getAttribute(SHELL_ATTR) === '1'),
            cell: !!findFooterCenterCell(),
            api: typeof window.tmSyncFooterShellCacheNow === 'function',
        };
    }

    function expose(name, fn) {
        try { window[name] = fn; } catch (_) { /* ignore */ }
        try {
            const uw = getUnsafe();
            if (uw) uw[name] = fn;
        } catch (_) { /* ignore */ }
    }

    expose('tmSyncFooterShellCache', syncFooterShellCache);
    expose('tmSyncFooterShellCacheNow', syncFooterShellCacheNow);
    expose('tmMountFooterShellFromCache', mountFooterShellFromCache);
    expose('tmRemoveFooterShellIfPresent', removeFooterShellIfPresent);
    expose('tmWatchAndMountFooterShell', watchAndMountFooterShell);
    expose('tmStopFooterShellWatch', stopFooterShellWatch);
    expose('tmIsFooterShellMounted', isFooterShellMounted);
    expose('tmDebugFooterShell', debugFooterShell);
    expose('TM_FOOTER_SHELL_LS_KEY', LS_FOOTER);

    expose('tmSyncAllUiShells', syncAllUiShells);
    expose('tmWatchAndMountAllUiShells', watchAndMountAllUiShells);
    expose('tmRemoveAllUiShells', removeAllUiShells);
    expose('tmRemoveUiShellById', removeUiShellById);
    expose('tmIsUiShellEl', isUiShellEl);

    console.log('[MMS Footer Shell] module ready (v' + CACHE_VERSION + ')');
})();
