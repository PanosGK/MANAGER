// ==UserScript==
// @name         MyMANAGER UI Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Snapshot suite UI chrome into localStorage; FOUC extension mounts early; suite hydrates live vars.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsUiShell() {
    'use strict';

    const LS_INDEX = 'tm_mms_ui_shells';
    const LS_FOOTER_LEGACY = 'tm_mms_footer_shell';
    const LS_PREFIX = 'tm_mms_ui_shell__';
    const SHELL_ATTR = 'data-tm-ui-shell';
    const FOOTER_SHELL_ATTR = 'data-tm-footer-shell';
    const CACHE_VERSION = 6;
    const MAX_CSS_CHARS = 12000;
    const MAX_TOTAL_CHARS = 1800000; // soft budget across all shells

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

    const SHELL_DEFS = {
        footer: {
            id: 'tm-footer-controls-container',
            maxHtml: 180000,
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
            maxHtml: 220000,
            findParent() {
                return document.body || null; // never mount on <html>
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
                    + ' .tm-aether-trail-ink, .tm-aether-rarity-ledger, .tm-aether-nameplate,'
                    + ' .tm-aether-fx'
                ).forEach((el) => el.remove());
                clone.querySelectorAll('[style*="display: none"], [style*="display:none"]').forEach((el) => {
                    if (el === clone) return;
                    el.remove();
                });
            },
            fallback(live) {
                // Tiny stub if full SVG won't fit — keeps position/size until suite hydrates.
                const cs = window.getComputedStyle(live);
                const stub = document.createElement('div');
                stub.id = 'tm-mascot-container';
                stub.className = live.className || 'tm-mascot-container';
                stub.setAttribute('title', '…');
                stub.style.cssText = [
                    `position:${cs.position || 'fixed'}`,
                    `left:${cs.left}`,
                    `top:${cs.top}`,
                    `right:${cs.right}`,
                    `bottom:${cs.bottom}`,
                    `width:${cs.width}`,
                    `height:${cs.height}`,
                    `z-index:${cs.zIndex || '9990'}`,
                    'pointer-events:none',
                    'display:flex',
                    'align-items:center',
                    'justify-content:center',
                    'opacity:0.85',
                ].join(';');
                stub.innerHTML = '<div style="font-size:42px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))">🐾</div>';
                return stub.outerHTML;
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
            maxHtml: 60000,
            findParent() {
                return document.body || null;
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
            maxHtml: 100000,
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
        },
        suiteBrand: {
            id: 'tm-footer-suite-brand',
            maxHtml: 16000,
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
        // scroll-top intentionally omitted — often left as a dormant shell and blocked syncing
    };

    function shellKey(name) {
        return LS_PREFIX + name;
    }

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

    function removeAllUiShells() {
        let n = 0;
        Object.keys(SHELL_DEFS).forEach((key) => {
            if (removeShellById(SHELL_DEFS[key].id)) n++;
        });
        // Also clear any leftover scroll shell from older cache versions
        if (removeShellById('tm-scroll-to-top-btn')) n++;
        document.querySelectorAll(`[${SHELL_ATTR}="1"], [${FOOTER_SHELL_ATTR}="1"]`).forEach((el) => {
            el.remove();
            n++;
        });
        return n;
    }

    function readShellEntry(name) {
        try {
            const raw = localStorage.getItem(shellKey(name));
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || data.v !== CACHE_VERSION || typeof data.html !== 'string' || data.html.length < 40) {
                return null;
            }
            return data;
        } catch (_) {
            return null;
        }
    }

    function writeShellEntry(name, html) {
        const payload = JSON.stringify({
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            html,
        });
        try {
            localStorage.setItem(shellKey(name), payload);
            return true;
        } catch (_) {
            try {
                localStorage.removeItem(shellKey(name));
                localStorage.setItem(shellKey(name), payload);
                return true;
            } catch (_2) {
                return false;
            }
        }
    }

    function readIndex() {
        try {
            const raw = localStorage.getItem(LS_INDEX);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || (data.v !== CACHE_VERSION && data.v !== 5)) return null;
            return data;
        } catch (_) {
            return null;
        }
    }

    function writeIndex(partial) {
        const prev = readIndex() || {};
        const next = {
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            css: partial.css != null ? partial.css : (prev.css || ''),
            keys: partial.keys || prev.keys || Object.keys(SHELL_DEFS),
        };
        try {
            localStorage.setItem(LS_INDEX, JSON.stringify(next));
            return true;
        } catch (_) {
            try {
                next.css = '';
                localStorage.setItem(LS_INDEX, JSON.stringify(next));
                return true;
            } catch (_2) {
                return false;
            }
        }
    }

    /** Unified cache shape used by FOUC extension + suite. */
    function readCache() {
        // v6: split keys
        const shells = {};
        let any = false;
        Object.keys(SHELL_DEFS).forEach((key) => {
            const entry = readShellEntry(key);
            if (entry) {
                shells[key] = { html: entry.html };
                any = true;
            }
        });
        if (any) {
            const idx = readIndex() || {};
            return { v: CACHE_VERSION, css: idx.css || '', shells };
        }

        // v5 monolithic
        try {
            const raw = localStorage.getItem(LS_INDEX);
            if (raw) {
                const data = JSON.parse(raw);
                if (data && data.v === 5 && data.shells && typeof data.shells === 'object') {
                    return data;
                }
            }
        } catch (_) { /* ignore */ }

        // Legacy footer-only v4
        try {
            const legacy = localStorage.getItem(LS_FOOTER_LEGACY);
            if (!legacy) return null;
            const old = JSON.parse(legacy);
            if (!old || old.v !== 4 || typeof old.html !== 'string' || old.html.length < 80) return null;
            return {
                v: CACHE_VERSION,
                css: old.css || '',
                shells: { footer: { html: old.html } },
            };
        } catch (_) {
            return null;
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
        for (let i = 0; i < n; i++) bakeOne(liveNodes[i], cloneNodes[i]);
    }

    function collectCompactCss() {
        // Prefer baked inline styles; only keep a tiny theme bridge if present.
        const parts = [];
        const ids = ['tm-mms-fouc-page-css', 'tm-page-theme-styles'];
        ids.forEach((id) => {
            const el = document.getElementById(id);
            const text = el?.textContent || '';
            if (text) parts.push(text.slice(0, MAX_CSS_CHARS));
        });
        let css = parts.join('\n');
        if (css.length > MAX_CSS_CHARS) css = css.slice(0, MAX_CSS_CHARS);
        return css;
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
            [${SHELL_ATTR}="1"] { pointer-events: none !important; }
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

        try {
            const clone = live.cloneNode(true);
            bakeStyles(live, clone);
            if (typeof def.slim === 'function') def.slim(clone);
            clone.removeAttribute(SHELL_ATTR);
            clone.removeAttribute(FOOTER_SHELL_ATTR);
            if (key === 'footer') clone.classList.add('tm-footer-shell');

            let html = clone.outerHTML;
            const maxHtml = def.maxHtml || 120000;
            if (html.length > maxHtml) {
                clone.querySelectorAll('svg title, svg desc, svg metadata, script').forEach((el) => el.remove());
                html = clone.outerHTML;
            }
            if (html.length > maxHtml && typeof def.fallback === 'function') {
                html = def.fallback(live);
            }
            if (!html || html.length < 40 || html.length > maxHtml) {
                console.warn(`[MMS UI Shell] skip ${key}: len=${html ? html.length : 0}`);
                return null;
            }
            return { html };
        } catch (err) {
            console.warn(`[MMS UI Shell] snapshot ${key} failed`, err);
            return null;
        }
    }

    function syncAllUiShells() {
        try {
            const path = window.location.pathname || '';
            if (path.includes('login.php')) return;
            if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

            const savedKeys = [];
            let total = 0;
            Object.keys(SHELL_DEFS).forEach((key) => {
                const snap = snapshotOne(key, SHELL_DEFS[key]);
                if (!snap) return;
                if (total + snap.html.length > MAX_TOTAL_CHARS) {
                    console.warn(`[MMS UI Shell] budget hit, skip ${key}`);
                    return;
                }
                if (writeShellEntry(key, snap.html)) {
                    savedKeys.push(key);
                    total += snap.html.length;
                } else {
                    console.warn(`[MMS UI Shell] write failed for ${key}`);
                }
            });

            const css = collectCompactCss();
            writeIndex({ css, keys: savedKeys.length ? savedKeys : Object.keys(SHELL_DEFS) });

            // Keep legacy footer key so older FOUC builds still work.
            const footer = readShellEntry('footer');
            if (footer) {
                try {
                    localStorage.setItem(LS_FOOTER_LEGACY, JSON.stringify({
                        v: 4,
                        updatedAt: Date.now(),
                        html: footer.html,
                        css: '',
                    }));
                } catch (_) { /* ignore */ }
            }

            if (savedKeys.length) {
                console.log(`[MMS UI Shell] cached: ${savedKeys.join(', ')} (~${Math.round(total / 1024)}KB)`);
            }
        } catch (err) {
            console.warn('[MMS UI Shell] sync failed', err);
        }
    }

    function mountOne(key, def, cache) {
        try {
            const path = window.location.pathname || '';
            if (path.includes('login.php')) return false;
            if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return false;
            if (def.skipIf && def.skipIf()) return false;
            if (document.getElementById(def.id)) return false;

            const entry = cache?.shells?.[key] || readShellEntry(key);
            const htmlStr = entry && typeof entry.html === 'string' ? entry.html : null;
            if (!htmlStr || htmlStr.length < 40) return false;

            const parent = def.findParent();
            if (!parent) return false;

            ensureShellLayoutCss();
            injectCachedShellCss(cache?.css || (readIndex()?.css || ''));
            return !!def.mount(htmlStr, parent);
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

    // ---- Legacy footer API ----
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
        return isShellEl(document.getElementById('tm-footer-controls-container'));
    }

    function watchAndMountFooterShell() {
        watchAndMountAll();
    }

    window.tmSyncAllUiShells = syncAllUiShells;
    window.tmWatchAndMountAllUiShells = watchAndMountAll;
    window.tmRemoveUiShellById = removeShellById;
    window.tmRemoveAllUiShells = removeAllUiShells;
    window.tmIsUiShellEl = isShellEl;
    window.tmReadUiShellCache = readCache;

    window.tmSyncFooterShellCache = syncFooterShellCache;
    window.tmMountFooterShellFromCache = mountFooterShellFromCache;
    window.tmRemoveFooterShellIfPresent = removeFooterShellIfPresent;
    window.tmWatchAndMountFooterShell = watchAndMountFooterShell;
    window.tmIsFooterShellMounted = isFooterShellMounted;
    window.TM_FOOTER_SHELL_LS_KEY = LS_FOOTER_LEGACY;
    window.TM_UI_SHELL_LS_KEY = LS_INDEX;
    window.TM_UI_SHELL_ATTR = SHELL_ATTR;
})();
