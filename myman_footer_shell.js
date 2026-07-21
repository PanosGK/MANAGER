// ==UserScript==
// @name         MyMANAGER UI Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Snapshot suite UI chrome (footer, mascot, rail, header QS, brand, scroll); mount early; hydrate live vars when suite loads.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsUiShell() {
    'use strict';

    const LS_UI = 'tm_mms_ui_shells';
    const LS_FOOTER_LEGACY = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-ui-shell';
    const FOOTER_SHELL_ATTR = 'data-tm-footer-shell'; // legacy (footer)
    const CACHE_VERSION = 5;

    const CSS_RE = /#tm-footer|#tm-xp-bar|#tm-coin-balance|#tm-notification-bell|#tm-weather|#tm-refresh|#tm-daily-dashboard|#tm-settings-btn|#tm-buff-timers|#tm-eod|#tm-recent-repairs|tm-footer-widget|tm-xp-bar|tm-footer-icon|\.tm-refresh-|#tm-mascot|#tm-search-container|#tm-scratchpad-toggle|#tm-quests-btn|#tm-slide-out|#tm-header-quick-search|#tm-footer-quick-search|#tm-footer-suite-brand|#tm-scroll-to-top|\.tm-qs-|\.tm-slide-out/i;

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
        'transform', 'transform-origin',
        'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'fill',
    ];

    /** @type {Record<string, {id:string, maxHtml?:number, findParent:()=>(Element|null), mount:(html:string, parent:Element)=>boolean, slim?:(clone:Element)=>void, skipIf?:()=>boolean}>} */
    const SHELL_DEFS = {
        footer: {
            id: 'tm-footer-controls-container',
            maxHtml: 220000,
            findParent() {
                return document.querySelector('#footer-outterwrap table td[width="60%"]')
                    || document.querySelector('#footer-outterwrap table td:nth-child(2)');
            },
            mount(html, parent) {
                while (parent.firstChild) parent.removeChild(parent.firstChild);
                parent.insertAdjacentHTML('beforeend', html);
                const mounted = parent.querySelector('#' + this.id);
                if (!mounted) return false;
                markShell(mounted);
                mounted.setAttribute(FOOTER_SHELL_ATTR, '1');
                mounted.classList.add('tm-footer-shell');
                return true;
            },
            slim(clone) {
                const menu = clone.querySelector('#tm-recent-repairs-menu');
                if (menu) {
                    menu.style.display = 'none';
                    menu.innerHTML = '';
                }
                clone.querySelectorAll(
                    '#tm-notification-panel, #tm-notification-backdrop, .tm-modal-overlay, #tm-coin-history-tooltip'
                ).forEach((el) => el.remove());
            },
        },
        mascot: {
            id: 'tm-mascot-container',
            maxHtml: 350000,
            findParent() {
                return document.body || document.documentElement;
            },
            mount(html, parent) {
                if (document.getElementById(this.id)) return false;
                parent.insertAdjacentHTML('beforeend', html);
                const mounted = document.getElementById(this.id);
                if (!mounted) return false;
                markShell(mounted);
                mounted.style.pointerEvents = 'none';
                return true;
            },
            slim(clone) {
                clone.querySelectorAll(
                    '#tm-mascot-interaction-panel, #tm-mascot-speech-bubble, .tm-modal-overlay,'
                    + ' .tm-aether-myth-particle, .tm-aether-trail-dot, .tm-aether-gaze-beam,'
                    + ' .tm-aether-crack-spark, .tm-aether-domain-circle, .tm-aether-world-dim-local,'
                    + ' .tm-aether-mythic-weather-local, .tm-aether-form-crest, .tm-aether-spectral-blade,'
                    + ' .tm-aether-reality-tear, .tm-aether-astral-clone, .tm-aether-codex-scrap,'
                    + ' .tm-aether-trail-ink, .tm-aether-rarity-ledger, .tm-aether-nameplate'
                ).forEach((el) => el.remove());
                // Drop hidden stage/character SVG groups — keep only what's currently painted.
                clone.querySelectorAll('[style*="display: none"], [style*="display:none"]').forEach((el) => {
                    if (el.id === 'tm-mascot-container') return;
                    el.remove();
                });
            },
            skipIf() {
                try {
                    const cfg = window.config;
                    if (cfg && cfg.interactiveMascotEnabled === false) return true;
                } catch (_) { /* ignore */ }
                return false;
            },
        },
        search: {
            id: 'tm-search-container',
            maxHtml: 80000,
            findParent() {
                return document.body || document.documentElement;
            },
            mount(html, parent) {
                if (document.getElementById(this.id)) return false;
                parent.insertAdjacentHTML('beforeend', html);
                const mounted = document.getElementById(this.id);
                if (!mounted) return false;
                markShell(mounted);
                mounted.style.pointerEvents = 'none';
                return true;
            },
            slim(clone) {
                clone.querySelectorAll('.tm-modal-overlay, #tm-scratchpad-container').forEach((el) => el.remove());
            },
        },
        headerQs: {
            id: 'tm-header-quick-search-host',
            maxHtml: 120000,
            findParent() {
                return document.querySelector('#head-outterwrap .rnr-hfiller')
                    || document.querySelector('#head-outter .rnr-hfiller')
                    || document.querySelector('.rnr-top .rnr-hfiller')
                    || document.querySelector('.rnr-hfiller');
            },
            mount(html, parent) {
                if (document.getElementById(this.id)) return false;
                parent.insertAdjacentHTML('afterbegin', html);
                const mounted = document.getElementById(this.id);
                if (!mounted) return false;
                markShell(mounted);
                mounted.style.pointerEvents = 'none';
                return true;
            },
            slim(clone) {
                clone.querySelectorAll('.tm-modal-overlay').forEach((el) => el.remove());
            },
        },
        suiteBrand: {
            id: 'tm-footer-suite-brand',
            maxHtml: 20000,
            findParent() {
                const table = document.querySelector('#footer-outterwrap table');
                if (!table) return null;
                let cell = table.querySelector('td[width="40%"]');
                if (!cell) {
                    const cells = table.querySelectorAll('td');
                    if (cells.length) cell = cells[cells.length - 1];
                }
                return cell;
            },
            mount(html, parent) {
                if (document.getElementById(this.id)) return false;
                parent.innerHTML = '';
                parent.insertAdjacentHTML('beforeend', html);
                const mounted = document.getElementById(this.id);
                if (!mounted) return false;
                markShell(mounted);
                mounted.style.pointerEvents = 'none';
                return true;
            },
        },
        scrollTop: {
            id: 'tm-scroll-to-top-btn',
            maxHtml: 4000,
            findParent() {
                return document.body || document.documentElement;
            },
            mount(html, parent) {
                if (document.getElementById(this.id)) return false;
                parent.insertAdjacentHTML('beforeend', html);
                const mounted = document.getElementById(this.id);
                if (!mounted) return false;
                markShell(mounted);
                mounted.style.pointerEvents = 'none';
                // Keep hidden until user scrolls — shell shouldn't flash mid-page.
                if (!mounted.style.display) mounted.style.display = 'none';
                return true;
            },
        },
    };

    function markShell(el) {
        if (!el) return;
        el.setAttribute(SHELL_ATTR, '1');
    }

    function isShellEl(el) {
        return !!(el && (el.getAttribute(SHELL_ATTR) === '1' || el.getAttribute(FOOTER_SHELL_ATTR) === '1'));
    }

    function removeShellById(id) {
        const el = document.getElementById(id);
        if (el && isShellEl(el)) {
            el.remove();
            return true;
        }
        return false;
    }

    function readCache() {
        try {
            const raw = localStorage.getItem(LS_UI);
            if (raw) {
                const data = JSON.parse(raw);
                if (data && data.v === CACHE_VERSION && data.shells && typeof data.shells === 'object') {
                    return data;
                }
            }
        } catch (_) { /* ignore */ }

        // Migrate legacy footer-only cache (v4).
        try {
            const legacy = localStorage.getItem(LS_FOOTER_LEGACY);
            if (!legacy) return null;
            const old = JSON.parse(legacy);
            if (!old || old.v !== 4 || typeof old.html !== 'string' || old.html.length < 80) return null;
            return {
                v: CACHE_VERSION,
                updatedAt: old.updatedAt || Date.now(),
                css: old.css || '',
                shells: {
                    footer: { html: old.html },
                },
            };
        } catch (_) {
            return null;
        }
    }

    function writeCache(data) {
        const payload = {
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            css: data.css || '',
            shells: data.shells || {},
        };
        try {
            localStorage.setItem(LS_UI, JSON.stringify(payload));
            try { localStorage.removeItem(LS_FOOTER_LEGACY); } catch (_) { /* ignore */ }
            return true;
        } catch (_) {
            // Quota: drop CSS first, then largest shells.
            try {
                payload.css = '';
                localStorage.setItem(LS_UI, JSON.stringify(payload));
                return true;
            } catch (_2) {
                try {
                    const shells = { ...(payload.shells || {}) };
                    const keys = Object.keys(shells).sort((a, b) =>
                        String(shells[b]?.html || '').length - String(shells[a]?.html || '').length);
                    for (const key of keys) {
                        delete shells[key];
                        try {
                            localStorage.setItem(LS_UI, JSON.stringify({ ...payload, shells }));
                            return true;
                        } catch (_3) { /* keep dropping */ }
                    }
                } catch (_4) { /* ignore */ }
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
                    if (prop === 'transform' && val === 'none') continue;
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

    function collectSuiteCssForShell() {
        const parts = [];
        const seen = new Set();
        const preferIds = [
            'tm-performance-styles',
            'tm-extended-theme-styles',
            'tm-page-theme-styles',
            'tm-mms-fouc-page-css',
            'tm-liquid-glass-styles',
            'tm-mascot-animations',
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
            if (el.id === 'tm-mms-footer-shell-css' || el.id === 'tm-mms-footer-shell-css-cache'
                || el.id === 'tm-mms-ui-shell-css' || el.id === 'tm-mms-ui-shell-css-cache') return;
            if (preferIds.includes(el.id)) return;
            const text = el.textContent || '';
            if (!text || seen.has(text)) return;
            if (CSS_RE.test(text)) {
                seen.add(text);
                parts.push(text);
            }
        });

        return parts.join('\n');
    }

    function ensureShellLayoutCss() {
        if (document.getElementById('tm-mms-ui-shell-css')) return;
        const style = document.createElement('style');
        style.id = 'tm-mms-ui-shell-css';
        style.textContent = `
            #tm-footer-controls-container[${SHELL_ATTR}="1"],
            #tm-footer-controls-container[${FOOTER_SHELL_ATTR}="1"] {
                pointer-events: none;
                width: 100%;
            }
            [${SHELL_ATTR}="1"] {
                pointer-events: none !important;
            }
        `;
        (document.documentElement || document.head || document).appendChild(style);
    }

    function injectCachedShellCss(cssText) {
        if (!cssText) return;
        let style = document.getElementById('tm-mms-ui-shell-css-cache');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-mms-ui-shell-css-cache';
            (document.documentElement || document.head || document).appendChild(style);
        }
        style.textContent = cssText;
    }

    function snapshotOne(key, def) {
        if (def.skipIf && def.skipIf()) return null;
        const live = document.getElementById(def.id);
        if (!live || isShellEl(live)) return null;

        const clone = live.cloneNode(true);
        bakeStyles(live, clone);
        if (typeof def.slim === 'function') def.slim(clone);
        clone.removeAttribute(SHELL_ATTR);
        clone.removeAttribute(FOOTER_SHELL_ATTR);
        if (key === 'footer') clone.classList.add('tm-footer-shell');

        let html = clone.outerHTML;
        const maxHtml = def.maxHtml || 200000;
        if (html.length > maxHtml) {
            // Last-resort shrink: drop nested SVG defs / hidden leftovers.
            clone.querySelectorAll('svg title, svg desc, svg metadata').forEach((el) => el.remove());
            html = clone.outerHTML;
            if (html.length > maxHtml) {
                console.warn(`[MMS UI Shell] ${key} snapshot too large (${html.length}), skipped`);
                return null;
            }
        }
        if (html.length < 40) return null;
        return { html };
    }

    function collectAllSnapshots() {
        const shells = {};
        Object.keys(SHELL_DEFS).forEach((key) => {
            const snap = snapshotOne(key, SHELL_DEFS[key]);
            if (snap) shells[key] = snap;
        });
        return {
            css: collectSuiteCssForShell(),
            shells,
        };
    }

    function mountOne(key, def, cache) {
        try {
            const path = window.location.pathname || '';
            if (path.includes('login.php')) return false;
            if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return false;
            if (def.skipIf && def.skipIf()) return false;
            if (document.getElementById(def.id)) return false;

            const entry = cache?.shells?.[key];
            if (!entry || typeof entry.html !== 'string' || entry.html.length < 40) return false;

            const parent = def.findParent();
            if (!parent) return false;

            ensureShellLayoutCss();
            injectCachedShellCss(cache.css || '');
            return !!def.mount(entry.html, parent);
        } catch (_) {
            return false;
        }
    }

    function mountAllFromCache() {
        const cache = readCache();
        if (!cache) return false;
        let any = false;
        Object.keys(SHELL_DEFS).forEach((key) => {
            if (mountOne(key, SHELL_DEFS[key], cache)) any = true;
        });
        return any;
    }

    function watchAndMountAll() {
        mountAllFromCache();
        const pending = new Set(Object.keys(SHELL_DEFS));
        const obs = new MutationObserver(() => {
            const cache = readCache();
            if (!cache) return;
            pending.forEach((key) => {
                if (document.getElementById(SHELL_DEFS[key].id)) {
                    pending.delete(key);
                    return;
                }
                if (mountOne(key, SHELL_DEFS[key], cache)) pending.delete(key);
            });
            if (!pending.size) obs.disconnect();
        });
        try {
            obs.observe(document.documentElement || document, { childList: true, subtree: true });
            setTimeout(() => obs.disconnect(), 20000);
        } catch (_) { /* ignore */ }
    }

    function syncAllUiShells() {
        try {
            // Don't overwrite cache while shells are still on screen.
            const shellMounted = Object.keys(SHELL_DEFS).some((key) => {
                const el = document.getElementById(SHELL_DEFS[key].id);
                return isShellEl(el);
            });
            if (shellMounted) return;

            const prev = readCache() || { shells: {}, css: '' };
            const next = collectAllSnapshots();
            // Merge: keep previous shells if this page didn't have that widget yet.
            const shells = { ...(prev.shells || {}) };
            Object.keys(next.shells || {}).forEach((key) => {
                shells[key] = next.shells[key];
            });
            writeCache({
                css: next.css || prev.css || '',
                shells,
            });
        } catch (_) { /* ignore */ }
    }

    // ---- Legacy footer API (aliases) ----
    function syncFooterShellCache() {
        syncAllUiShells();
    }

    function mountFooterShellFromCache() {
        const cache = readCache();
        if (!cache) return false;
        return mountOne('footer', SHELL_DEFS.footer, cache);
    }

    function removeFooterShellIfPresent() {
        return removeShellById('tm-footer-controls-container');
    }

    function isFooterShellMounted() {
        const existing = document.getElementById('tm-footer-controls-container');
        return isShellEl(existing);
    }

    function watchAndMountFooterShell() {
        watchAndMountAll();
    }

    window.tmSyncAllUiShells = syncAllUiShells;
    window.tmWatchAndMountAllUiShells = watchAndMountAll;
    window.tmRemoveUiShellById = removeShellById;
    window.tmIsUiShellEl = isShellEl;

    window.tmSyncFooterShellCache = syncFooterShellCache;
    window.tmMountFooterShellFromCache = mountFooterShellFromCache;
    window.tmRemoveFooterShellIfPresent = removeFooterShellIfPresent;
    window.tmWatchAndMountFooterShell = watchAndMountFooterShell;
    window.tmIsFooterShellMounted = isFooterShellMounted;
    window.TM_FOOTER_SHELL_LS_KEY = LS_FOOTER_LEGACY;
    window.TM_UI_SHELL_LS_KEY = LS_UI;
    window.TM_UI_SHELL_ATTR = SHELL_ATTR;
})();
