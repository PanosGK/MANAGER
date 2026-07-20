// ==UserScript==
// @name         MyMANAGER Footer Shell Cache (module)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Cache footer UI shell + last-known coins/XP/badge; mount early, hydrate when suite loads.
// @author       Gkorogias
// @match        *://thesellers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function tmMmsFooterShell() {
    'use strict';

    const LS_FOOTER = 'tm_mms_footer_shell';
    const SHELL_ATTR = 'data-tm-footer-shell';

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function readCache() {
        try {
            const raw = localStorage.getItem(LS_FOOTER);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || data.v !== 1) return null;
            return data;
        } catch (_) {
            return null;
        }
    }

    function writeCache(data) {
        try {
            localStorage.setItem(LS_FOOTER, JSON.stringify(data));
        } catch (_) { /* ignore */ }
    }

    function collectSnapshot(config, STORAGE_KEYS) {
        const coinsEl = document.getElementById('tm-coin-balance');
        const unreadEl = document.getElementById('tm-notification-unread-count');
        const levelEl = document.getElementById('tm-level-text');
        const titleEl = document.getElementById('tm-user-title-text');
        const xpFill = document.getElementById('tm-xp-bar-fill');
        const xpText = document.getElementById('tm-xp-text');
        const dash = document.getElementById('tm-daily-dashboard-widget');

        let coins = 0;
        try {
            if (typeof GM_getValue === 'function' && STORAGE_KEYS?.USER_COINS) {
                coins = Number(GM_getValue(STORAGE_KEYS.USER_COINS, 0)) || 0;
            } else if (coinsEl) {
                const m = String(coinsEl.textContent || '').match(/(\d+)/);
                coins = m ? Number(m[1]) : 0;
            }
        } catch (_) { /* ignore */ }

        let unread = 0;
        if (unreadEl) {
            unread = Number(String(unreadEl.textContent || '').replace(/\D/g, '')) || 0;
        }

        const xpPct = (() => {
            const w = xpFill?.style?.width || '';
            const n = parseFloat(w);
            return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
        })();

        const levelText = levelEl?.textContent || 'Lv.1';
        const level = Number(String(levelText).replace(/\D/g, '')) || 1;

        return {
            v: 1,
            updatedAt: Date.now(),
            coins,
            unread,
            level,
            title: titleEl?.textContent || '',
            titleColor: titleEl?.style?.color || '',
            xpPct,
            xpLeftText: xpText?.textContent || '',
            dashboardHtml: dash ? dash.innerHTML : '',
            showCoins: !!(coinsEl && coinsEl.style.display !== 'none' && config?.shopEnabled !== false),
            showXp: !!document.getElementById('tm-xp-bar-container') && config?.levelUpSystemEnabled !== false,
            showDashboard: !!dash && config?.dashboardWidgetEnabled !== false,
            showBell: !!document.getElementById('tm-notification-bell-wrapper'),
            showSettings: !!document.getElementById('tm-settings-btn'),
        };
    }

    function buildShellHTML(data) {
        const dash = data.showDashboard
            ? `<div id="tm-daily-dashboard-widget" class="tm-footer-widget" style="font-size:11px;display:flex;align-items:center;gap:6px;padding:0 14px;">${data.dashboardHtml || '<span>Σήμερα</span>'}</div>`
            : '';

        const titleStyle = data.titleColor ? ` style="color:${escapeHtml(data.titleColor)}"` : '';
        const xp = data.showXp
            ? `<div id="tm-xp-bar-container" class="tm-footer-widget tm-xp-bar-widget">
                <div class="tm-xp-bar-header">
                    <span id="tm-level-text">Lv.${escapeHtml(data.level)}</span>
                    <span class="tm-xp-bar-sep">·</span>
                    <span id="tm-user-title-text"${titleStyle}>${escapeHtml(data.title)}</span>
                </div>
                <div class="tm-xp-bar-track-row">
                    <div class="tm-xp-bar" title="Loading…">
                        <div id="tm-xp-bar-fill" style="width:${Number(data.xpPct) || 0}%;"></div>
                        <div id="tm-xp-text">${escapeHtml(data.xpLeftText || '')}</div>
                    </div>
                </div>
            </div>`
            : '';

        const bell = data.showBell !== false
            ? `<div id="tm-notification-bell-wrapper">
                <button id="tm-notification-bell-btn" class="tm-footer-widget tm-footer-icon-btn" type="button" title="Κέντρο ειδοποιήσεων" tabindex="-1">🔔</button>
                <span id="tm-notification-unread-count">${data.unread > 0 ? escapeHtml(data.unread) : ''}</span>
            </div>`
            : '';

        const settings = data.showSettings !== false
            ? `<button id="tm-settings-btn" type="button" class="tm-footer-widget tm-footer-icon-btn" title="Ρυθμίσεις" tabindex="-1">⚙️</button>`
            : '';

        const coins = data.showCoins
            ? `<div id="tm-coin-balance" class="tm-footer-widget" title="Fixer-Coins">🪙 ${escapeHtml(data.coins)}</div>`
            : '';

        return `
            <div id="tm-footer-controls-row">
                <div id="tm-footer-controls-left">
                    <div id="tm-buff-timers-container"></div>
                    ${dash}
                    ${xp}
                </div>
                <div id="tm-footer-controls-middle"></div>
                <div id="tm-footer-controls-right">
                    ${bell}
                    ${settings}
                    ${coins}
                </div>
            </div>
        `;
    }

    function ensureShellCss() {
        if (document.getElementById('tm-mms-footer-shell-css')) return;
        const style = document.createElement('style');
        style.id = 'tm-mms-footer-shell-css';
        style.textContent = `
            #tm-footer-controls-container[${SHELL_ATTR}="1"] {
                pointer-events: none;
                opacity: 0.92;
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
            wrapper.innerHTML = buildShellHTML(data);
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

    function syncFooterShellCache(config, STORAGE_KEYS) {
        try {
            if (isFooterShellMounted()) return;
            if (!document.getElementById('tm-footer-controls-container')) return;
            writeCache(collectSnapshot(config || window.config, STORAGE_KEYS || window.STORAGE_KEYS));
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
