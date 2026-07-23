// ==UserScript==
// @name         MyMANAGER UI Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Snapshot suite UI chrome for FOUC early mount; suite replaces + hydrates vars.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @match        *://thesellers.mymanager.gr/*
// ==/UserScript==

(function tmMmsUiShell() {
    'use strict';

    const LS_KEY = 'tm_mms_ui_shells';
    const LS_FOOTER_LEGACY = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-ui-shell';
    const FOOTER_SHELL_ATTR = 'data-tm-footer-shell';
    const CACHE_VERSION = 12;
    const MSG_TYPE = 'TM_MMS_UI_SHELLS';
    const MAX_HTML = 180000;

    const SHELL_SPECS = [
        { id: 'tm-footer-controls-container', parent: 'footer-center', minLen: 80 },
        { id: 'tm-footer-suite-brand', parent: 'footer-right', minLen: 40 },
        { id: 'tm-header-quick-search-host', parent: 'header-filler', minLen: 40 },
        { id: 'tm-search-container', parent: 'body', minLen: 20 },
        { id: 'tm-mascot-container', parent: 'body', minLen: 20, silhouette: true },
        { id: 'tm-scroll-to-top-btn', parent: 'body', minLen: 10 },
    ];

    let syncTimer = 0;
    let syncing = false;
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

    function isShellEl(el) {
        return !!(el && (el.getAttribute(SHELL_ATTR) === '1' || el.getAttribute(FOOTER_SHELL_ATTR) === '1'));
    }

    function cssPath(el) {
        if (!el || el.nodeType !== 1) return '';
        const esc = (id) => {
            try {
                if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(id);
            } catch (_) { /* ignore */ }
            return String(id).replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
        };
        if (el.id) return `#${esc(el.id)}`;
        const parts = [];
        let node = el;
        let depth = 0;
        while (node && node.nodeType === 1 && depth < 12) {
            if (node.id) {
                parts.unshift(`#${esc(node.id)}`);
                break;
            }
            const tag = (node.tagName || '').toLowerCase();
            const parent = node.parentElement;
            if (!parent) {
                parts.unshift(tag);
                break;
            }
            let idx = 1;
            let total = 0;
            Array.from(parent.children).forEach((sib) => {
                if ((sib.tagName || '').toLowerCase() === tag) {
                    total += 1;
                    if (sib === node) idx = total;
                }
            });
            parts.unshift(total > 1 ? `${tag}:nth-of-type(${idx})` : tag);
            node = parent;
            depth += 1;
        }
        return parts.join(' > ');
    }

    function capturePlacement(el, fallbackKind) {
        const parent = el.parentElement;
        const next = el.nextElementSibling;
        const prev = el.previousElementSibling;
        let childIndex = -1;
        if (parent) {
            childIndex = Array.from(parent.children).indexOf(el);
        }
        return {
            kind: fallbackKind || 'body',
            parentId: parent?.id || '',
            parentPath: parent ? cssPath(parent) : 'body',
            childIndex,
            beforeId: next?.id || '',
            afterId: prev?.id || '',
            inlineStyle: el.getAttribute('style') || '',
            replaceParentChildren: fallbackKind === 'footer-center' || fallbackKind === 'footer-right',
        };
    }

    function slimCloneHtml(el, spec) {
        if (spec.silhouette) {
            let style = el.getAttribute('style') || '';
            if (!style) {
                const rect = el.getBoundingClientRect?.() || null;
                const left = el.style?.left || (rect ? `${Math.round(rect.left)}px` : '24px');
                const top = el.style?.top || (rect ? `${Math.round(rect.top)}px` : '120px');
                const w = (rect && rect.width > 40) ? Math.round(rect.width) : 88;
                const h = (rect && rect.height > 40) ? Math.round(rect.height) : 88;
                style = `position:fixed;left:${left};top:${top};width:${w}px;height:${h}px;`;
            }
            return `<div id="tm-mascot-container" class="tm-ui-shell tm-ui-shell-mascot" style="${style.replace(/"/g, '&quot;')}"></div>`;
        }

        const clone = el.cloneNode(true);
        clone.removeAttribute(SHELL_ATTR);
        clone.removeAttribute(FOOTER_SHELL_ATTR);
        clone.classList.add('tm-ui-shell');

        const menu = clone.querySelector('#tm-recent-repairs-menu');
        if (menu) {
            menu.style.display = 'none';
            menu.innerHTML = '';
        }
        clone.querySelectorAll(
            '#tm-notification-panel, #tm-notification-backdrop, .tm-modal-overlay, #tm-coin-history-tooltip, #tm-mascot-interaction-panel'
        ).forEach((n) => n.remove());

        clone.querySelectorAll('svg').forEach((svg) => {
            const mark = document.createElement('span');
            mark.className = 'tm-ui-shell-icon';
            mark.setAttribute('aria-hidden', 'true');
            svg.replaceWith(mark);
        });

        const html = clone.outerHTML;
        if (!html || html.length < (spec.minLen || 20) || html.length > MAX_HTML) return null;
        return html;
    }

    
    const SKIP_STYLE_IDS = new Set([
        'tm-mms-fouc-guard', 'tm-mms-fouc-bridge', 'tm-mms-fouc-ext-bg',
        'tm-mms-fouc-page-css', 'tm-mms-menu-early-guard', 'tm-mms-ui-shell-css',
        'tm-mms-suite-css-cache', 'tm-mms-footer-shell-css', 'tm-mms-footer-shell-css-cache',
    ]);
    const MAX_CSS = 1500000;

    function collectSuiteCss() {
        const parts = [];
        const seen = new Set();
        document.querySelectorAll('style').forEach((el) => {
            const id = el.id || '';
            if (id && SKIP_STYLE_IDS.has(id)) return;
            if (id.startsWith('tm-mms-fouc')) return;
            const text = el.textContent || '';
            if (text.length < 20) return;
            const isSuite = (id && id.startsWith('tm-'))
                || text.includes('#tm-')
                || text.includes('.tm-')
                || text.includes('--tm-')
                || text.includes('tm-mms-');
            if (!isSuite) return;
            const key = id || `anon:${text.length}:${text.slice(0, 40)}`;
            if (seen.has(key)) return;
            seen.add(key);
            parts.push(text);
        });
        let css = parts.join('\n\n');
        if (css.length > MAX_CSS) css = css.slice(0, MAX_CSS);
        return css;
    }

    function collectAllShells() {
        const shells = {};
        SHELL_SPECS.forEach((spec) => {
            const el = document.getElementById(spec.id);
            if (!el || isShellEl(el)) return;
            const html = slimCloneHtml(el, spec);
            if (!html) return;
            shells[spec.id] = {
                id: spec.id,
                parent: spec.parent,
                placement: capturePlacement(el, spec.parent),
                html,
            };
        });
        return shells;
    }

    function writeLocal(cache) {
        // Keep CSS out of the shells blob — stored separately under tm_mms_suite_css.
        const shellOnly = {
            v: cache.v,
            updatedAt: cache.updatedAt,
            shells: cache.shells || {},
        };
        const json = JSON.stringify(shellOnly);
        let ok = false;
        try {
            pageLocalStorage().setItem(LS_KEY, json);
            ok = true;
        } catch (err) {
            lastError = 'localStorage: ' + (err && err.message ? err.message : String(err));
        }
        try {
            if (localStorage !== pageLocalStorage()) {
                localStorage.setItem(LS_KEY, json);
                ok = true;
            }
        } catch (_) { /* ignore */ }
        // Keep legacy footer key for older extension builds
        try {
            const foot = cache.shells && cache.shells['tm-footer-controls-container'];
            if (foot) {
                pageLocalStorage().setItem(LS_FOOTER_LEGACY, JSON.stringify({
                    v: 9,
                    updatedAt: cache.updatedAt,
                    html: foot.html,
                    css: '',
                }));
            }
        } catch (_) { /* ignore */ }
        return ok;
    }

    function publishToExtension(cache) {
        const payload = { type: MSG_TYPE, cache, v: CACHE_VERSION };
        try {
            const s = document.createElement('script');
            s.textContent = 'try{window.postMessage(' + JSON.stringify(payload) + ',"*");}catch(e){}';
            (document.documentElement || document.head || document).appendChild(s);
            s.remove();
        } catch (_) { /* CSP */ }
        try {
            window.postMessage(payload, '*');
        } catch (_) { /* ignore */ }
        try {
            const uw = getUnsafe();
            if (uw && typeof uw.postMessage === 'function') uw.postMessage(payload, '*');
        } catch (_) { /* ignore */ }
    }

    function syncAllUiShellsNow(opts) {
        const reason = (opts && opts.reason) || 'sync';
        if (syncing) return false;
        syncing = true;
        try {
            const shells = collectAllShells();
            const css = collectSuiteCss();
            const ids = Object.keys(shells);
            if (!ids.length && !css) {
                lastError = 'no live shells/css yet';
                console.warn('[MMS UI Shell] skip (' + reason + '): ' + lastError);
                return false;
            }
            const cache = { v: CACHE_VERSION, updatedAt: Date.now(), shells, css: css || '' };
            const lsOk = writeLocal(cache);
            publishToExtension(cache);
            try {
                if (css) {
                    pageLocalStorage().setItem('tm_mms_suite_css', JSON.stringify({
                        v: CACHE_VERSION,
                        updatedAt: Date.now(),
                        css,
                    }));
                }
            } catch (_) { /* quota */ }
            lastOkAt = Date.now();
            lastError = '';
            console.log(
                `[MMS UI Shell] cached ${ids.length} shell(s)`
                + (css ? ` + CSS ~${Math.round(css.length / 1024)}KB` : '')
                + ` via ${reason}`
                + (lsOk ? '' : ' [ext-msg]')
            );
            return true;
        } catch (err) {
            lastError = String(err && err.message ? err.message : err);
            console.warn('[MMS UI Shell] sync failed', err);
            return false;
        } finally {
            syncing = false;
        }
    }

    function syncAllUiShells(forceOrConfig) {
        const force = forceOrConfig === true
            || (forceOrConfig && typeof forceOrConfig === 'object' && forceOrConfig.force === true);

        if (force) {
            if (syncTimer) {
                clearTimeout(syncTimer);
                syncTimer = 0;
            }
            return syncAllUiShellsNow({
                reason: (forceOrConfig && forceOrConfig.reason) || 'force',
            });
        }

        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            syncTimer = 0;
            syncAllUiShellsNow({ reason: 'debounced' });
        }, 800);
    }

    // Footer-only aliases (compat)
    function syncFooterShellCache(forceOrConfig) {
        return syncAllUiShells(forceOrConfig);
    }
    function syncFooterShellCacheNow(opts) {
        return syncAllUiShellsNow(opts);
    }

    function removeUiShellById(id) {
        const el = document.getElementById(id);
        if (el && isShellEl(el)) {
            el.remove();
            return true;
        }
        return false;
    }

    function removeAllUiShells() {
        let n = 0;
        SHELL_SPECS.forEach((spec) => {
            if (removeUiShellById(spec.id)) n++;
        });
        return n;
    }

    function removeFooterShellIfPresent() {
        return removeUiShellById('tm-footer-controls-container');
    }

    function isFooterShellMounted() {
        const el = document.getElementById('tm-footer-controls-container');
        return isShellEl(el);
    }

    function stopFooterShellWatch() { /* no-op — FOUC extension owns early mount */ }
    function watchAndMountFooterShell() { /* no-op */ }
    function watchAndMountAllUiShells() { /* no-op */ }
    function mountFooterShellFromCache() { return false; }

    try {
        window.addEventListener('pagehide', () => {
            syncAllUiShellsNow({ reason: 'pagehide' });
        });
    } catch (_) { /* ignore */ }

    function debugUiShells() {
        let raw = null;
        try { raw = pageLocalStorage().getItem(LS_KEY); } catch (_) { /* ignore */ }
        const live = {};
        SHELL_SPECS.forEach((spec) => {
            const el = document.getElementById(spec.id);
            live[spec.id] = el ? (isShellEl(el) ? 'shell' : 'live') : 'missing';
        });
        return {
            key: LS_KEY,
            version: CACHE_VERSION,
            bytes: raw ? raw.length : 0,
            lastOkAt,
            lastError,
            live,
        };
    }

    function expose(name, fn) {
        try { window[name] = fn; } catch (_) { /* ignore */ }
        try {
            const uw = getUnsafe();
            if (uw) uw[name] = fn;
        } catch (_) { /* ignore */ }
    }

    expose('tmSyncAllUiShells', syncAllUiShells);
    expose('tmSyncAllUiShellsNow', syncAllUiShellsNow);
    expose('tmSyncFooterShellCache', syncFooterShellCache);
    expose('tmSyncFooterShellCacheNow', syncFooterShellCacheNow);
    expose('tmMountFooterShellFromCache', mountFooterShellFromCache);
    expose('tmRemoveFooterShellIfPresent', removeFooterShellIfPresent);
    expose('tmWatchAndMountFooterShell', watchAndMountFooterShell);
    expose('tmWatchAndMountAllUiShells', watchAndMountAllUiShells);
    expose('tmStopFooterShellWatch', stopFooterShellWatch);
    expose('tmIsFooterShellMounted', isFooterShellMounted);
    expose('tmRemoveAllUiShells', removeAllUiShells);
    expose('tmRemoveUiShellById', removeUiShellById);
    expose('tmIsUiShellEl', isShellEl);
    expose('tmDebugFooterShell', debugUiShells);
    expose('tmDebugUiShells', debugUiShells);
    expose('TM_FOOTER_SHELL_LS_KEY', LS_FOOTER_LEGACY);
    expose('TM_UI_SHELLS_LS_KEY', LS_KEY);

    console.log('[MMS UI Shell] module ready (v' + CACHE_VERSION + ', multi-shell)');
})();
