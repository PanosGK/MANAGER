// ==UserScript==
// @name         MyMANAGER Footer Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Cache full footer UI chrome; mount early without live vars; hydrate when suite loads.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsFooterShell() {
    'use strict';

    const LS_FOOTER = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-footer-shell';
    const CACHE_VERSION = 2;

    function readCache() {
        try {
            const raw = localStorage.getItem(LS_FOOTER);
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

    function writeCache(data) {
        try {
            localStorage.setItem(LS_FOOTER, JSON.stringify(data));
        } catch (_) { /* ignore quota */ }
    }

    /** Clear live numbers/text so the shell shows structure/icons only. */
    function stripLiveVars(root) {
        if (!root) return;

        const coin = root.querySelector('#tm-coin-balance');
        if (coin) coin.innerHTML = '🪙 —';

        const unread = root.querySelector('#tm-notification-unread-count');
        if (unread) {
            unread.textContent = '';
            unread.classList.remove('visible');
        }

        const level = root.querySelector('#tm-level-text');
        if (level) level.textContent = 'Lv.—';

        const title = root.querySelector('#tm-user-title-text');
        if (title) title.textContent = '…';

        const xpFill = root.querySelector('#tm-xp-bar-fill');
        if (xpFill) xpFill.style.width = '0%';

        const xpText = root.querySelector('#tm-xp-text');
        if (xpText) xpText.textContent = '—';

        const weatherTemp = root.querySelector('#tm-weather-temp');
        if (weatherTemp) weatherTemp.textContent = '—';

        const refreshText = root.querySelector('#tm-refresh-countdown-text');
        if (refreshText) refreshText.textContent = '--:--';

        const dash = root.querySelector('#tm-daily-dashboard-widget');
        if (dash) {
            dash.innerHTML = `
                <span style="font-weight: bold; font-size: 10px;">Σήμερα:</span>
                <span>📝 —</span>
                <span style="opacity: 0.5;">|</span>
                <span>🛠️ —</span>
                <span style="opacity: 0.5;">|</span>
                <span>🔍 —</span>
            `;
        }

        // Buff timers / dynamic labels inside left column
        root.querySelectorAll('#tm-buff-timers-container').forEach((el) => {
            el.innerHTML = '';
        });

        // Recent-repairs label often includes a count — keep icon/button chrome if present
        root.querySelectorAll('[id^="tm-"][id*="count"], .tm-footer-count, .tm-badge').forEach((el) => {
            if (el.id === 'tm-notification-unread-count') return;
            if (/^\d+$/.test(String(el.textContent || '').trim())) {
                el.textContent = '—';
            }
        });

        // Remove open panels / menus accidentally snapshotted
        root.querySelectorAll(
            '#tm-notification-panel, #tm-notification-backdrop, .tm-modal-overlay, [data-tm-dropdown-open="1"]'
        ).forEach((el) => el.remove());
    }

    function collectSnapshot() {
        const container = document.getElementById('tm-footer-controls-container');
        if (!container || container.getAttribute(SHELL_ATTR) === '1') return null;

        const clone = container.cloneNode(true);
        stripLiveVars(clone);

        return {
            v: CACHE_VERSION,
            updatedAt: Date.now(),
            html: clone.innerHTML,
        };
    }

    function ensureShellCss() {
        if (document.getElementById('tm-mms-footer-shell-css')) return;
        const style = document.createElement('style');
        style.id = 'tm-mms-footer-shell-css';
        style.textContent = `
            #tm-footer-controls-container[${SHELL_ATTR}="1"] {
                pointer-events: none;
                opacity: 0.94;
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
            #tm-footer-controls-container[${SHELL_ATTR}="1"] #tm-notification-unread-count:empty {
                display: none;
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

            const existing = document.getElementById('tm-footer-controls-container');
            if (existing) return false;

            const data = readCache();
            if (!data) return false;

            const cell = findFooterCenterCell();
            if (!cell) return false;

            ensureShellCss();
            while (cell.firstChild) cell.removeChild(cell.firstChild);

            const wrapper = document.createElement('div');
            wrapper.id = 'tm-footer-controls-container';
            wrapper.setAttribute(SHELL_ATTR, '1');
            wrapper.className = 'tm-footer-shell';
            wrapper.innerHTML = data.html;
            stripLiveVars(wrapper);
            cell.appendChild(wrapper);
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
            setTimeout(() => obs.disconnect(), 15000);
        } catch (_) { /* ignore */ }
    }

    window.tmSyncFooterShellCache = syncFooterShellCache;
    window.tmMountFooterShellFromCache = mountFooterShellFromCache;
    window.tmRemoveFooterShellIfPresent = removeFooterShellIfPresent;
    window.tmWatchAndMountFooterShell = watchAndMountFooterShell;
    window.tmIsFooterShellMounted = isFooterShellMounted;
    window.TM_FOOTER_SHELL_LS_KEY = LS_FOOTER;
})();
