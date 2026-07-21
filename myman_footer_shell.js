// ==UserScript==
// @name         MyMANAGER Footer Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      2.2
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

    function readCache() {
        try {
            const raw = localStorage.getItem(LS_FOOTER);
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
        try {
            localStorage.setItem(LS_FOOTER, JSON.stringify(data));
            return true;
        } catch (_) {
            try {
                localStorage.setItem(LS_FOOTER, JSON.stringify({
                    v: CACHE_VERSION,
                    updatedAt: data.updatedAt,
                    html: data.html,
                    css: '',
                }));
                return true;
            } catch (_2) {
                return false;
            }
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
        if (!container || container.getAttribute(SHELL_ATTR) === '1') return null;

        const clone = container.cloneNode(true);
        slimClone(clone);
        // Do NOT bake computed styles — that walks every node and freezes the page.
        // Suite CSS + theme vars already cover look; FOUC injects theme CSS early.
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

    function syncFooterShellCacheNow() {
        if (syncing) return;
        if (isFooterShellMounted()) return;
        syncing = true;
        try {
            // Drop failed multi-shell experiment keys so quota is free.
            try {
                Object.keys(localStorage).forEach((k) => {
                    if (k.indexOf('tm_mms_ui_shell') === 0) localStorage.removeItem(k);
                });
            } catch (_) { /* ignore */ }

            const snap = collectSnapshot();
            if (snap && writeCache(snap)) {
                console.log(`[MMS Footer Shell] cached (~${Math.round(snap.html.length / 1024)}KB)`);
            }
        } catch (err) {
            console.warn('[MMS Footer Shell] sync failed', err);
        } finally {
            syncing = false;
        }
    }

    /** Debounced + idle — never blocks page load / coin updates. */
    function syncFooterShellCache() {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            syncTimer = 0;
            const run = () => syncFooterShellCacheNow();
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(run, { timeout: 2000 });
            } else {
                setTimeout(run, 0);
            }
        }, 400);
    }

    function watchAndMountFooterShell() {
        if (mountFooterShellFromCache()) return;
        const obs = new MutationObserver(() => {
            if (mountFooterShellFromCache()) obs.disconnect();
        });
        try {
            obs.observe(document.documentElement || document, { childList: true, subtree: true });
            setTimeout(() => obs.disconnect(), 12000);
        } catch (_) { /* ignore */ }
    }

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
    window.tmMountFooterShellFromCache = mountFooterShellFromCache;
    window.tmRemoveFooterShellIfPresent = removeFooterShellIfPresent;
    window.tmWatchAndMountFooterShell = watchAndMountFooterShell;
    window.tmIsFooterShellMounted = isFooterShellMounted;
    window.TM_FOOTER_SHELL_LS_KEY = LS_FOOTER;

    window.tmSyncAllUiShells = syncAllUiShells;
    window.tmWatchAndMountAllUiShells = watchAndMountAllUiShells;
    window.tmRemoveAllUiShells = removeAllUiShells;
    window.tmRemoveUiShellById = removeUiShellById;
    window.tmIsUiShellEl = isUiShellEl;
})();
