// ==UserScript==
// @name         MyMANAGER Footer Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Snapshot #tm-footer-controls-container (HTML + baked styles + values); mount early; suite replaces when ready.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsFooterShell() {
    'use strict';

    const LS_FOOTER = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-footer-shell';
    const CACHE_VERSION = 4;
    const FOOTER_CSS_RE = /#tm-footer|#tm-xp-bar|#tm-coin-balance|#tm-notification-bell|#tm-weather|#tm-refresh|#tm-daily-dashboard|#tm-settings-btn|#tm-buff-timers|#tm-eod|#tm-recent-repairs|tm-footer-widget|tm-xp-bar|tm-footer-icon|\.tm-refresh-/i;

    const BAKE_PROPS = [
        'box-sizing', 'display', 'position', 'top', 'right', 'bottom', 'left',
        'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'align-self',
        'gap', 'row-gap', 'column-gap',
        'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        'margin', 'padding',
        'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
        'color', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
        'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'border-radius',
        'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing', 'text-align',
        'text-shadow', 'box-shadow', 'opacity', 'overflow', 'overflow-x', 'overflow-y',
        'cursor', 'z-index', 'white-space', 'text-overflow', 'visibility',
        'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'fill',
    ];

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
                // Quota: drop CSS, keep baked HTML (styles are inline)
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

    function bakeStyles(liveRoot, cloneRoot) {
        if (!liveRoot || !cloneRoot) return;

        const bakeOne = (live, clone) => {
            if (!live || !clone || live.nodeType !== 1 || clone.nodeType !== 1) return;
            try {
                const cs = window.getComputedStyle(live);
                const bits = [];
                for (let i = 0; i < BAKE_PROPS.length; i++) {
                    const prop = BAKE_PROPS[i];
                    let val = cs.getPropertyValue(prop);
                    if (!val) continue;
                    val = val.trim();
                    if (!val || val === 'auto' || val === 'normal' || val === 'none') continue;
                    if (val === 'rgba(0, 0, 0, 0)' || val === 'transparent') continue;
                    if (prop === 'background-image' && val.length > 180) continue;
                    bits.push(`${prop}:${val}`);
                }
                const prev = clone.getAttribute('style');
                if (prev) bits.push(prev);
                if (bits.length) clone.setAttribute('style', bits.join(';'));
            } catch (_) { /* ignore */ }
        };

        bakeOne(liveRoot, cloneRoot);
        const liveNodes = liveRoot.querySelectorAll('*');
        const cloneNodes = cloneRoot.querySelectorAll('*');
        const n = Math.min(liveNodes.length, cloneNodes.length);
        for (let i = 0; i < n; i++) {
            bakeOne(liveNodes[i], cloneNodes[i]);
        }
    }

    function slimHeavyMenus(clone) {
        if (!clone) return;
        // Keep the recent-repairs button + label; drop bulky menu body (rebuilt by suite).
        const menu = clone.querySelector('#tm-recent-repairs-menu');
        if (menu) {
            menu.style.display = 'none';
            menu.innerHTML = '';
        }
        clone.querySelectorAll(
            '#tm-notification-panel, #tm-notification-backdrop, .tm-modal-overlay, #tm-coin-history-tooltip'
        ).forEach((el) => el.remove());
    }

    function collectSuiteCssForShell() {
        const parts = [];
        const seen = new Set();
        const preferIds = [
            'tm-performance-styles',
            'tm-extended-theme-styles',
            'tm-page-theme-styles',
            'tm-mms-fouc-page-css',
            'tm-liquid-glass-styles',
        ];

        preferIds.forEach((id) => {
            const el = document.getElementById(id);
            const text = el?.textContent || '';
            if (text && !seen.has(text)) {
                seen.add(text);
                parts.push(text);
            }
        });

        document.querySelectorAll('style').forEach((el) => {
            if (el.id === 'tm-mms-footer-shell-css' || el.id === 'tm-mms-footer-shell-css-cache') return;
            if (preferIds.includes(el.id)) return;
            const text = el.textContent || '';
            if (!text || seen.has(text)) return;
            if (FOOTER_CSS_RE.test(text)) {
                seen.add(text);
                parts.push(text);
            }
        });

        return parts.join('\n');
    }

    function collectSnapshot() {
        const container = document.getElementById('tm-footer-controls-container');
        if (!container || container.getAttribute(SHELL_ATTR) === '1') return null;

        // Need layout to bake accurate computed styles
        const clone = container.cloneNode(true);
        bakeStyles(container, clone);
        slimHeavyMenus(clone);
        clone.setAttribute(SHELL_ATTR, '0');
        clone.classList.add('tm-footer-shell');

        return {
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            html: clone.outerHTML,
            css: collectSuiteCssForShell(),
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

    function syncFooterShellCache() {
        try {
            if (isFooterShellMounted()) return;
            const snap = collectSnapshot();
            if (snap) writeCache(snap);
        } catch (_) { /* ignore */ }
    }

    function watchAndMountFooterShell() {
        if (mountFooterShellFromCache()) return;
        const obs = new MutationObserver(() => {
            if (mountFooterShellFromCache()) {
                obs.disconnect();
            }
        });
        try {
            obs.observe(document.documentElement || document, { childList: true, subtree: true });
            setTimeout(() => obs.disconnect(), 20000);
        } catch (_) { /* ignore */ }
    }

    window.tmSyncFooterShellCache = syncFooterShellCache;
    window.tmMountFooterShellFromCache = mountFooterShellFromCache;
    window.tmRemoveFooterShellIfPresent = removeFooterShellIfPresent;
    window.tmWatchAndMountFooterShell = watchAndMountFooterShell;
    window.tmIsFooterShellMounted = isFooterShellMounted;
    window.TM_FOOTER_SHELL_LS_KEY = LS_FOOTER;
})();
