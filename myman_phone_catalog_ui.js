// ==UserScript==
// @name         MyManager Phone Catalog UI
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Phone catalog layout, styles, and row rendering.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PHONE_CATALOG_UI_STYLES = `
        @keyframes tm-cat-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tm-cat-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes tm-cat-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes tm-cat-spin { to { transform: rotate(360deg); } }

        .tm-phone-catalog-overlay {
            animation: tm-cat-in 0.22s ease;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
        }

        .tm-phone-modal-content.tm-cat-app {
            animation: tm-cat-up 0.28s cubic-bezier(0.22, 1, 0.36, 1);
            width: min(1360px, 96vw) !important;
            max-width: 96vw !important;
            max-height: 94vh !important;
            border-radius: 12px !important;
            border: 1px solid var(--tm-shop-item-border) !important;
            box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5) !important;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
            overflow: hidden;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }

        /* ── Top bar ── */
        .tm-cat-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 18px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 70%, var(--tm-primary-color) 30%);
        }
        .tm-cat-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .tm-cat-brand-mark {
            width: 36px; height: 36px; border-radius: 8px;
            background: var(--tm-primary-color);
            color: #fff; font-size: 11px; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
            letter-spacing: 0.04em; flex-shrink: 0;
        }
        .tm-cat-brand-title {
            margin: 0; font-size: 15px; font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
        }
        .tm-cat-brand-sub {
            margin: 1px 0 0; font-size: 11px; opacity: 0.6;
            color: var(--tm-shop-item-text);
        }
        .tm-cat-topbar-actions {
            display: flex; align-items: center; gap: 4px; flex-shrink: 0;
        }
        .tm-cat-btn-icon, .tm-phone-toolbar-btn, .tm-modal-close {
            width: 32px; height: 32px; border-radius: 6px;
            border: 1px solid transparent;
            background: transparent;
            color: var(--tm-shop-item-text);
            cursor: pointer; font-size: 14px;
            display: inline-flex; align-items: center; justify-content: center;
            transition: background 0.12s, border-color 0.12s, color 0.12s;
        }
        .tm-cat-btn-icon:hover, .tm-phone-toolbar-btn:hover, .tm-modal-close:hover {
            background: color-mix(in srgb, var(--tm-shop-item-border) 40%, transparent);
            border-color: var(--tm-shop-item-border);
            color: var(--tm-primary-color);
        }
        .tm-modal-close { font-size: 20px; }

        /* ── Tabs ── */
        .tm-cat-tabs {
            display: flex; gap: 0;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            padding: 0 18px;
        }
        .tm-cat-tab {
            border: none; background: transparent; cursor: pointer;
            padding: 11px 16px; margin-bottom: -1px;
            font-size: 12px; font-weight: 600;
            color: var(--tm-shop-item-text); opacity: 0.65;
            border-bottom: 2px solid transparent;
            transition: opacity 0.12s, border-color 0.12s, color 0.12s;
        }
        .tm-cat-tab:hover { opacity: 1; color: var(--tm-primary-color); }
        .tm-cat-tab.active {
            opacity: 1; color: var(--tm-primary-color);
            border-bottom-color: var(--tm-primary-color);
        }

        /* ── Search & filters ── */
        .tm-cat-controls {
            padding: 12px 18px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 96%, var(--tm-shop-item-border));
            display: flex; flex-direction: column; gap: 10px;
        }
        .tm-cat-search-line {
            display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .tm-cat-search {
            flex: 1; min-width: 200px;
            display: flex; align-items: center; gap: 8px;
            padding: 0 12px; height: 36px;
            border-radius: 8px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            transition: border-color 0.12s, box-shadow 0.12s;
        }
        .tm-cat-search:focus-within {
            border-color: var(--tm-primary-color);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--tm-primary-color) 20%, transparent);
        }
        .tm-cat-search-icon { opacity: 0.45; font-size: 13px; }
        #tm-phone-search-input {
            flex: 1; border: none !important; background: transparent !important;
            padding: 0 !important; height: auto !important;
            font-size: 13px !important; outline: none !important;
            color: var(--tm-shop-item-text) !important;
            box-shadow: none !important;
        }
        .tm-cat-regex {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 11px; color: var(--tm-shop-item-text);
            opacity: 0.8; cursor: pointer; white-space: nowrap;
        }
        .tm-cat-pill, #tm-phone-favorites-btn {
            height: 36px; padding: 0 14px; border-radius: 8px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 11px; font-weight: 600;
            cursor: pointer; transition: all 0.12s;
        }
        .tm-cat-pill:hover, #tm-phone-favorites-btn:hover,
        #tm-phone-favorites-btn.active {
            border-color: var(--tm-primary-color);
            color: var(--tm-primary-color);
            background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg));
        }

        .tm-cat-filters {
            display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
        }
        .tm-cat-select, #tm-phone-filter-grade, #tm-phone-filter-model, #tm-phone-filter-gb,
        #tm-phone-filter-color, #tm-phone-filter-tag, #tm-phone-sort-by,
        #tm-other-store-filter-grade, #tm-other-store-filter-model, #tm-other-store-filter-gb,
        #tm-other-store-filter-color, #tm-other-store-filter-store, #tm-other-store-sort {
            height: 32px; min-width: 96px;
            padding: 0 28px 0 10px !important;
            border-radius: 6px !important;
            border: 1px solid var(--tm-shop-item-border) !important;
            background: var(--tm-shop-item-bg) !important;
            color: var(--tm-shop-item-text) !important;
            font-size: 11px !important; font-weight: 500;
            cursor: pointer; appearance: none !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23888' d='M4 6L1 3h6z'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 8px center !important;
        }
        #tm-phone-filter-model, #tm-other-store-filter-model { flex: 1; min-width: 140px; }
        .tm-cat-select:hover, #tm-phone-filter-grade:hover, #tm-phone-filter-model:hover,
        #tm-phone-filter-gb:hover, #tm-phone-filter-color:hover, #tm-phone-filter-tag:hover,
        #tm-phone-sort-by:hover, #tm-other-store-filter-grade:hover, #tm-other-store-filter-model:hover,
        #tm-other-store-filter-gb:hover, #tm-other-store-filter-color:hover,
        #tm-other-store-filter-store:hover, #tm-other-store-sort:hover {
            border-color: var(--tm-primary-color) !important;
        }
        .tm-cat-select:focus, #tm-phone-search-input:focus,
        #tm-phone-filter-grade:focus, #tm-phone-filter-model:focus,
        #tm-phone-filter-gb:focus, #tm-phone-filter-color:focus,
        #tm-phone-filter-tag:focus, #tm-phone-sort-by:focus {
            outline: none !important;
            border-color: var(--tm-primary-color) !important;
        }

        .tm-cat-btn, #tm-phone-clear-filters, #tm-phone-sort-dir, #tm-phone-export-btn,
        #tm-phone-select-all, #tm-other-store-clear-filters {
            height: 32px; padding: 0 12px; border-radius: 6px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 11px; font-weight: 600;
            cursor: pointer; transition: all 0.12s;
            display: inline-flex; align-items: center; gap: 4px;
        }
        .tm-cat-btn:hover, #tm-phone-clear-filters:hover, #tm-phone-sort-dir:hover,
        #tm-phone-export-btn:hover, #tm-phone-select-all:hover, #tm-other-store-clear-filters:hover {
            border-color: var(--tm-primary-color);
            color: var(--tm-primary-color);
        }

        /* ── Table body ── */
        #tm-phone-list-container, #tm-other-store-content, #tm-other-store-modal-body {
            flex: 1; overflow-y: auto; padding: 0 !important;
            background: var(--tm-shop-item-bg) !important;
        }
        .tm-cat-table-body, .tm-pc-list {
            display: flex; flex-direction: column;
        }
        #tm-other-store-container {
            flex: 1; overflow: hidden; display: flex; flex-direction: column;
        }

        .tm-cat-thead {
            display: grid;
            grid-template-columns: 44px 1fr 76px;
            gap: 8px; padding: 7px 16px;
            font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.07em;
            color: var(--tm-shop-item-text); opacity: 0.5;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-border) 12%, var(--tm-shop-item-bg));
            position: sticky; top: 0; z-index: 3;
        }
        .tm-cat-thead--other {
            grid-template-columns: 44px 1fr minmax(140px, 1.2fr) 76px;
        }

        .tm-cat-tr, .tm-pc-row {
            display: grid;
            grid-template-columns: 44px 1fr 76px;
            gap: 8px; align-items: center;
            padding: 8px 16px;
            border-bottom: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 55%, transparent);
            cursor: pointer;
            transition: background 0.1s;
        }
        .tm-cat-tr--other, .tm-pc-row--other {
            grid-template-columns: 44px 1fr minmax(140px, 1.2fr) 76px;
        }
        .tm-cat-tr:nth-child(even), .tm-pc-row:nth-child(even) { background: color-mix(in srgb, var(--tm-shop-item-border) 8%, transparent); }
        .tm-cat-tr:hover, .tm-pc-row:hover { background: color-mix(in srgb, var(--tm-primary-color) 7%, var(--tm-shop-item-bg)); }
        .tm-cat-tr.selected, .tm-pc-row.selected {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg)) !important;
            box-shadow: inset 3px 0 0 var(--tm-primary-color);
        }
        .tm-cat-tr.favorite, .tm-pc-row.favorite { box-shadow: inset 3px 0 0 var(--tm-warning-color, #eab308); }
        .tm-cat-tr.favorite.selected, .tm-pc-row.favorite.selected { box-shadow: inset 3px 0 0 var(--tm-primary-color); }

        .tm-cat-grade {
            width: 36px; height: 28px; border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 800;
        }
        .tm-cat-device { min-width: 0; }
        .tm-cat-line-primary, .tm-pc-row-line1 {
            display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
            margin-bottom: 2px;
        }
        .tm-cat-line-secondary, .tm-pc-row-line2 {
            display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
            font-size: 11px; opacity: 0.75;
        }
        .tm-cat-model {
            font-size: 13px; font-weight: 600;
            letter-spacing: -0.01em;
            word-break: break-word;
        }
        .tm-cat-price {
            margin-left: auto; font-size: 12px; font-weight: 700;
            color: var(--tm-success-color, #22c55e);
            font-variant-numeric: tabular-nums;
        }
        .tm-cat-tag, .tm-pc-meta-chip {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 1px 6px; border-radius: 4px;
            font-size: 10px; font-weight: 600;
            background: color-mix(in srgb, var(--tm-shop-item-border) 30%, transparent);
            border: 1px solid var(--tm-shop-item-border);
            color: var(--tm-shop-item-text);
        }
        .tm-cat-tag--bb, .tm-pc-meta-chip--buyback {
            background: color-mix(in srgb, var(--tm-warning-color, #eab308) 15%, transparent);
            border-color: color-mix(in srgb, var(--tm-warning-color) 35%, transparent);
            color: var(--tm-warning-color, #ca8a04);
        }
        .tm-cat-tag--hash, .tm-pc-meta-chip--tag { background: transparent; }
        .tm-cat-swatch, .tm-pc-color-dot {
            width: 7px; height: 7px; border-radius: 50%;
            display: inline-block; border: 1px solid rgba(128,128,128,0.4);
        }
        .tm-cat-code, .tm-pc-barcode {
            font-family: ui-monospace, Consolas, monospace;
            font-size: 10px; font-weight: 500;
            letter-spacing: 0.03em;
            padding: 1px 5px; border-radius: 3px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 25%, transparent);
            color: var(--tm-shop-item-text);
        }

        .tm-cat-stores, .tm-pc-row-stores {
            display: flex; flex-wrap: wrap; gap: 3px;
            align-items: center; align-self: center;
        }
        .tm-cat-actions, .tm-pc-row-actions {
            display: flex; gap: 2px; justify-content: flex-end;
        }
        .tm-cat-act, .tm-pc-action-btn, .tm-phone-search-btn,
        .tm-phone-copy-imei-btn, .tm-phone-favorite-btn, .tm-os-action-btn {
            width: 26px; height: 26px; border-radius: 4px;
            border: none; background: transparent;
            color: var(--tm-shop-item-text); opacity: 0.55;
            cursor: pointer; font-size: 12px;
            display: inline-flex; align-items: center; justify-content: center;
            transition: opacity 0.1s, background 0.1s, color 0.1s;
        }
        .tm-cat-act:hover, .tm-pc-action-btn:hover, .tm-phone-search-btn:hover,
        .tm-phone-copy-imei-btn:hover, .tm-phone-favorite-btn:hover, .tm-os-action-btn:hover {
            opacity: 1; background: color-mix(in srgb, var(--tm-shop-item-border) 35%, transparent);
            color: var(--tm-primary-color);
        }
        .tm-cat-act.is-fav, .tm-pc-action-btn.is-fav, .tm-phone-favorite-btn.is-fav {
            opacity: 1; color: var(--tm-warning-color, #eab308) !important;
        }

        .tm-cat-store, .tm-pc-store-chip {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 1px 6px; border-radius: 3px;
            font-size: 9px; font-weight: 600; line-height: 1.4;
            white-space: nowrap;
        }
        .tm-cat-store--ok, .tm-pc-store-chip--ok {
            background: color-mix(in srgb, #16a34a 14%, transparent);
            color: #4ade80;
        }
        .tm-cat-store--no, .tm-pc-store-chip--bad {
            background: color-mix(in srgb, #dc2626 12%, transparent);
            color: #f87171;
        }
        .tm-cat-store--mid, .tm-pc-store-chip--neutral {
            background: color-mix(in srgb, var(--tm-shop-item-border) 25%, transparent);
            color: var(--tm-shop-item-text); opacity: 0.85;
        }
        .tm-cat-store-loading, .tm-pc-store-loading {
            display: inline-flex; align-items: center; gap: 5px;
            font-size: 10px; opacity: 0.45; font-style: italic;
        }
        .tm-cat-store-loading i, .tm-pc-store-loading i {
            width: 8px; height: 8px; border-radius: 50%;
            border: 1.5px solid currentColor; border-top-color: transparent;
            animation: tm-cat-spin 0.65s linear infinite; display: inline-block;
        }

        /* ── Empty & footer ── */
        .tm-cat-empty, .tm-pc-empty {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 240px; gap: 6px; padding: 32px;
            color: var(--tm-shop-item-text);
        }
        .tm-cat-empty-icon, .tm-pc-empty-icon { font-size: 40px; opacity: 0.35; }
        .tm-cat-empty-title, .tm-pc-empty-title { font-size: 14px; font-weight: 600; }
        .tm-cat-empty-sub, .tm-pc-empty-sub { font-size: 12px; opacity: 0.55; max-width: 300px; text-align: center; }

        .tm-cat-statusbar, .tm-pc-footer {
            display: flex; justify-content: space-between; align-items: center;
            gap: 12px; flex-wrap: wrap;
            padding: 8px 18px;
            border-top: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-border) 10%, var(--tm-shop-item-bg));
            font-size: 11px; color: var(--tm-shop-item-text);
        }
        #tm-phone-statistics { display: flex; gap: 8px; flex-wrap: wrap; opacity: 0.7; font-size: 10px; }
        #tm-phone-count-text { font-weight: 600; }

        #tm-phone-export-menu {
            position: absolute; top: calc(100% + 4px); right: 0;
            background: var(--tm-shop-item-bg);
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            padding: 6px; min-width: 200px; display: none; z-index: 10;
        }
        #tm-phone-export-menu button {
            width: 100%; text-align: left; margin-bottom: 3px;
            border: none; background: transparent;
            color: var(--tm-shop-item-text);
            padding: 8px 10px; border-radius: 4px;
            font-size: 11px; cursor: pointer;
        }
        #tm-phone-export-menu button:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
            color: var(--tm-primary-color);
        }

        .tm-phone-load-more {
            margin: 8px 16px; padding: 10px;
            border-radius: 6px; border: 1px solid var(--tm-shop-item-border);
            background: transparent; color: var(--tm-primary-color);
            font-size: 12px; font-weight: 600; cursor: pointer; width: calc(100% - 32px);
        }
        .tm-phone-load-more:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 8%, transparent);
        }

        .tm-phone-context-menu, .tm-phone-tag-submenu {
            border-radius: 8px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,0.35) !important;
            border: 1px solid var(--tm-shop-item-border) !important;
            font-size: 12px !important;
        }

        /* ── Standalone other-store modal ── */
        .tm-other-store-overlay .tm-cat-os-panel, .tm-other-store-overlay .tm-pc-os-panel {
            width: min(1280px, 96vw); max-height: 94vh;
            border-radius: 12px; overflow: hidden;
            border: 1px solid var(--tm-shop-item-border);
            box-shadow: 0 32px 80px rgba(0,0,0,0.5);
            background: var(--tm-shop-item-bg);
            display: flex; flex-direction: column;
        }
        .tm-cat-os-top, .tm-pc-os-header {
            padding: 12px 18px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 70%, var(--tm-primary-color) 30%);
        }
        #tm-os-filter-bar { border-bottom: 1px solid var(--tm-shop-item-border) !important; }
    `;

    function esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function buildStoreChipHtml(storeName, isBuyback, allowed) {
        const name = esc(storeName);
        if (isBuyback) {
            const cls = allowed ? 'tm-cat-store--ok tm-pc-store-chip--ok' : 'tm-cat-store--no tm-pc-store-chip--bad';
            const icon = allowed ? '✓' : '✕';
            return `<span class="tm-cat-store tm-pc-store-chip ${cls}">${icon} ${name}</span>`;
        }
        if (!allowed) {
            return `<span class="tm-cat-store tm-pc-store-chip tm-cat-store--no tm-pc-store-chip--bad">✕ ${name}</span>`;
        }
        return `<span class="tm-cat-store tm-pc-store-chip tm-cat-store--mid tm-pc-store-chip--neutral">${name}</span>`;
    }

    function buildStoreChipsHtml(stores, isBuyback, filterFn, renderChipFn) {
        const filtered = filterFn(stores);
        if (!filtered.length) return '';
        return filtered.map((s) => renderChipFn(s.name, isBuyback)).join('');
    }

    function buildEmptyState(icon, title, subtitle = '') {
        return `
            <div class="tm-cat-empty tm-pc-empty">
                <div class="tm-cat-empty-icon tm-pc-empty-icon">${icon}</div>
                <div class="tm-cat-empty-title tm-pc-empty-title">${esc(title)}</div>
                ${subtitle ? `<div class="tm-cat-empty-sub tm-pc-empty-sub">${esc(subtitle)}</div>` : ''}
            </div>`;
    }

    function buildListHeader(variant = 'mine') {
        if (variant === 'other') {
            return `<div class="tm-cat-thead tm-cat-thead--other tm-pc-list-header tm-pc-list-header--other">
                <span>Βαθμ.</span><span>Συσκευή</span><span>Καταστήματα</span><span></span>
            </div>`;
        }
        return `<div class="tm-cat-thead tm-pc-list-header">
            <span>Βαθμ.</span><span>Συσκευή</span><span></span>
        </div>`;
    }

    function buildPhoneRow(item, ctx, options = {}) {
        const {
            variant = 'mine',
            isSelected = false,
            isFavorite = false,
            storesHtml = '',
            storesPending = false,
            noBuybackStore = false,
        } = options;

        const T = ctx.T;
        const phoneColor = ctx.extractColor(item.name || item.model);
        const colorHex = ctx.getColorHex(phoneColor);
        const displayModel = ctx.extractBaseModel(item.model) || item.model || item.name;
        const storage = ctx.extractGB(item.name || item.model);
        const grade = item.grade || '';
        const titleStyle = ctx.getPhoneModelTitleStyle(phoneColor, colorHex);
        const tags = ctx.getPhoneTags(item.barcode);

        const rowClass = [
            'tm-cat-tr', 'tm-pc-row', 'tm-phone-item',
            variant === 'other' ? 'tm-cat-tr--other tm-pc-row--other' : '',
            isSelected ? 'selected' : '',
            isFavorite ? 'favorite' : '',
        ].filter(Boolean).join(' ');

        const tagHtml = tags.map((tag) => {
            const color = ctx.getTagColor(tag);
            return `<span class="tm-cat-tag tm-cat-tag--hash tm-pc-meta-chip tm-pc-meta-chip--tag" style="color:${esc(color)};border-color:${esc(color)}">#${esc(ctx.getTagDisplayName(tag))}</span>`;
        }).join('');

        const swatch = colorHex
            ? `<span class="tm-cat-swatch tm-pc-color-dot" style="background:${esc(colorHex)}"></span>`
            : '';

        const storesCell = variant === 'other' ? `
            <div class="tm-cat-stores tm-pc-row-stores tm-other-store-stores" data-product="${esc(item.barcode)}">
                ${storesPending
        ? '<span class="tm-cat-store-loading tm-pc-store-loading"><i></i>…</span>'
        : (storesHtml || '<span style="opacity:0.3;font-size:10px">—</span>')}
            </div>` : '';

        const actions = `
            <div class="tm-cat-actions tm-pc-row-actions">
                <button type="button" class="tm-cat-act tm-pc-action-btn tm-phone-search-btn" data-barcode="${esc(item.barcode)}" title="${esc(T['Search barcode in system'])}">⌕</button>
                ${item.imei ? `<button type="button" class="tm-cat-act tm-pc-action-btn tm-phone-copy-imei-btn" data-imei="${esc(item.imei)}" title="${esc(T['Copy IMEI'])}">#</button>` : ''}
                <button type="button" class="tm-cat-act tm-pc-action-btn tm-phone-favorite-btn ${isFavorite ? 'is-fav' : ''}" data-barcode="${esc(item.barcode)}"
                    title="${esc(isFavorite ? T['Remove from favorites'] : T['Add to favorites'])}">${isFavorite ? '★' : '☆'}</button>
            </div>`;

        return `
            <div class="${rowClass}"
                data-barcode="${esc(item.barcode)}"
                data-name="${esc(item.name)}"
                data-imei="${esc(item.imei || '')}">
                <div class="tm-cat-grade tm-pc-row-grade" style="${ctx.getPhoneGradeCircleStyle(grade)}">${esc(grade || '—')}</div>
                <div class="tm-cat-device tm-pc-row-main">
                    <div class="tm-cat-line-primary tm-pc-row-line1">
                        ${noBuybackStore ? `<span title="${esc(ctx.t('No buyback store'))}" style="font-size:11px">⊘</span>` : ''}
                        <span class="tm-cat-model tm-pc-row-model" style="${titleStyle}" title="${esc(displayModel)}">${esc(displayModel)}</span>
                        ${storage ? `<span class="tm-cat-tag tm-pc-meta-chip">${esc(storage)}</span>` : ''}
                        ${item.isBuyback ? '<span class="tm-cat-tag tm-cat-tag--bb tm-pc-meta-chip tm-pc-meta-chip--buyback">BB</span>' : ''}
                        ${tagHtml}
                        ${item.retailPrice ? `<span class="tm-cat-price tm-pc-row-price">${esc(item.retailPrice)} €</span>` : ''}
                    </div>
                    <div class="tm-cat-line-secondary tm-pc-row-line2">
                        ${phoneColor ? `<span class="tm-cat-tag tm-pc-meta-chip">${swatch}${esc(phoneColor)}</span>` : ''}
                        <span class="tm-cat-code tm-pc-barcode">${esc(item.barcode)}</span>
                    </div>
                </div>
                ${storesCell}
                ${actions}
            </div>`;
    }

    const buildPhoneCard = buildPhoneRow;

    function buildModalHTML(T) {
        return `
        <style>${PHONE_CATALOG_UI_STYLES}</style>
        <div class="tm-phone-modal-content tm-cat-app" style="display:flex;flex-direction:column;">
            <div class="tm-cat-topbar">
                <div class="tm-cat-brand">
                    <div class="tm-cat-brand-mark">PH</div>
                    <div>
                        <h2 class="tm-cat-brand-title">${esc(T['Phone Catalog'])}</h2>
                        <p class="tm-cat-brand-sub">Αναζήτηση αποθέματος</p>
                    </div>
                </div>
                <div class="tm-cat-topbar-actions">
                    <button type="button" id="tm-phone-refresh-btn" class="tm-cat-btn-icon tm-phone-toolbar-btn" title="${esc(T['Refresh (Ctrl+R)'])}">↻</button>
                    <button type="button" id="tm-phone-view-toggle" hidden aria-hidden="true"></button>
                    <button type="button" id="tm-phone-colors-btn" class="tm-cat-btn-icon tm-phone-toolbar-btn" title="${esc(T['Manage Colors'])}">◐</button>
                    <button type="button" id="tm-phone-tags-btn" class="tm-cat-btn-icon tm-phone-toolbar-btn" title="${esc(T['Manage Tags'])}">◈</button>
                    <button type="button" id="tm-phone-stores-btn" class="tm-cat-btn-icon tm-phone-toolbar-btn" title="${esc(T['Manage Stores'])}">⊞</button>
                    <button type="button" id="tm-phone-other-store-toggle" hidden aria-hidden="true"></button>
                    <button type="button" class="tm-modal-close tm-cat-btn-icon" aria-label="Close">×</button>
                </div>
            </div>

            <nav class="tm-cat-tabs" role="tablist">
                <button type="button" class="tm-cat-tab active" id="tm-pc-view-mine" data-view="mine">Το κατάστημά μου</button>
                <button type="button" class="tm-cat-tab" id="tm-pc-view-other" data-view="other">Άλλα καταστήματα</button>
            </nav>

            <div class="tm-cat-controls" data-tm-phone-toolbar>
                <div class="tm-cat-search-line">
                    <label class="tm-cat-search">
                        <span class="tm-cat-search-icon">⌕</span>
                        <input type="search" id="tm-phone-search-input" placeholder="${esc(T['Search...'])}" autocomplete="off">
                    </label>
                    <label class="tm-cat-regex">
                        <input type="checkbox" id="tm-phone-regex-toggle"> ${esc(T['Regex'])}
                    </label>
                    <button type="button" id="tm-phone-favorites-btn" class="tm-cat-pill" title="${esc(T['Show Favorites'])}">★ ${esc(T['Fav'])}</button>
                </div>
                <div class="tm-cat-filters">
                    <select id="tm-phone-filter-grade" class="tm-cat-select"><option value="">${esc(T['All Grades'])}</option></select>
                    <select id="tm-phone-filter-model" class="tm-cat-select"><option value="">${esc(T['All Models'])}</option></select>
                    <select id="tm-phone-filter-gb" class="tm-cat-select"><option value="">${esc(T['All Storage'])}</option></select>
                    <select id="tm-phone-filter-color" class="tm-cat-select"><option value="">${esc(T['All Colors'])}</option></select>
                    <select id="tm-phone-filter-tag" class="tm-cat-select"><option value="">${esc(T['All Tags'])}</option></select>
                    <select id="tm-phone-sort-by" class="tm-cat-select">
                        <option value="model">${esc(T['Sort by Model'])}</option>
                        <option value="grade">${esc(T['Sort by Grade'])}</option>
                        <option value="gb">${esc(T['Sort by Storage'])}</option>
                        <option value="color">${esc(T['Sort by Color'])}</option>
                        <option value="imei">${esc(T['Sort by IMEI'])}</option>
                    </select>
                    <button type="button" id="tm-phone-sort-dir" class="tm-cat-btn" title="${esc(T['Toggle Sort Direction'])}">↕</button>
                    <button type="button" id="tm-phone-clear-filters" class="tm-cat-btn">${esc(T['Clear'])}</button>
                    <div style="position:relative">
                        <button type="button" id="tm-phone-export-btn" class="tm-cat-btn">${esc(T['Export'] || 'Export')}</button>
                        <div id="tm-phone-export-menu">
                            <button type="button" id="tm-phone-export-clipboard">${esc(T['Copy to Clipboard'])}</button>
                            <button type="button" id="tm-phone-export-csv">${esc(T['Export to CSV'])}</button>
                            <button type="button" id="tm-phone-export-selected" style="display:none">${esc(T['Export Selected'])}</button>
                            <div style="border-top:1px solid var(--tm-shop-item-border);margin-top:4px;padding-top:4px">
                                <label style="display:flex;align-items:center;gap:6px;font-size:10px;padding:4px;cursor:pointer">
                                    <input type="checkbox" id="tm-phone-export-original-title">
                                    ${esc(T['Include Original Title'])}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button type="button" id="tm-phone-select-all" class="tm-cat-btn" style="display:none">${esc(T['Select All'])}</button>
                </div>
            </div>

            <div id="tm-phone-list-container" class="tm-cat-table-body tm-pc-list">
                ${buildEmptyState('…', 'Φόρτωση', 'Παρακαλώ περιμένετε')}
            </div>
            <div id="tm-other-store-container" style="display:none;flex:1;overflow:hidden;flex-direction:column">
                <div id="tm-other-store-content" class="tm-cat-table-body tm-pc-list">
                    ${buildEmptyState('…', 'Φόρτωση', 'Άλλα καταστήματα')}
                </div>
            </div>

            <footer class="tm-cat-statusbar tm-pc-footer" id="tm-phone-count">
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                    <span id="tm-phone-count-text">0 phones</span>
                    <div id="tm-phone-statistics"></div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;opacity:0.7">
                    <span id="tm-phone-last-updated" style="font-size:10px"></span>
                    <span id="tm-phone-cache-warning" style="display:none;color:var(--tm-warning-color);font-weight:600;font-size:10px"></span>
                </div>
            </footer>
        </div>
        <div class="tm-phone-context-menu">
            <div class="tm-phone-context-menu-item" data-action="add-tag">${esc(T['Add Tag'])}</div>
            <div class="tm-phone-context-menu-item" data-action="remove-tag">${esc(T['Remove Tag'])}</div>
        </div>`;
    }

    function buildOtherStoresModalHTML(T) {
        return `
        <style>${PHONE_CATALOG_UI_STYLES}</style>
        <div class="tm-cat-os-panel tm-pc-os-panel">
            <header class="tm-cat-os-top tm-pc-os-header">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                    <div class="tm-cat-brand-mark">NW</div>
                    <div>
                        <div style="font-weight:700;font-size:14px;color:var(--tm-shop-item-text)">Network stock</div>
                        <div style="font-size:10px;opacity:0.55">Cross-store availability</div>
                    </div>
                    <button type="button" id="tm-os-back-btn" class="tm-cat-btn" style="display:none;margin-left:8px">← Models</button>
                </div>
                <div style="display:flex;gap:6px;align-items:center">
                    <span id="tm-other-store-count" style="font-size:10px;opacity:0.65"></span>
                    <button type="button" id="tm-other-store-refresh-btn" class="tm-cat-btn-icon" title="Refresh">↻</button>
                    <button type="button" id="tm-other-store-close" class="tm-modal-close tm-cat-btn-icon">×</button>
                </div>
            </header>
            <div id="tm-os-filter-bar" style="display:none">
                <div class="tm-cat-filters" style="padding:10px 16px">
                    <select id="tm-other-store-filter-grade" class="tm-cat-select"><option value="">${esc(T['All Grades'])}</option></select>
                    <select id="tm-other-store-filter-model" class="tm-cat-select"><option value="">${esc(T['All Models'])}</option></select>
                    <select id="tm-other-store-filter-gb" class="tm-cat-select"><option value="">${esc(T['All Storage'])}</option></select>
                    <select id="tm-other-store-filter-color" class="tm-cat-select"><option value="">${esc(T['All Colors'])}</option></select>
                    <select id="tm-other-store-filter-store" class="tm-cat-select"><option value="">All stores</option></select>
                    <select id="tm-other-store-sort" class="tm-cat-select">
                        <option value="model-asc">Model A→Z</option>
                        <option value="model-desc">Model Z→A</option>
                        <option value="price-asc">Price ↑</option>
                        <option value="price-desc">Price ↓</option>
                        <option value="grade-asc">Grade A+→A</option>
                        <option value="grade-desc">Grade A→A+</option>
                        <option value="storage-asc">Storage ↑</option>
                        <option value="storage-desc">Storage ↓</option>
                    </select>
                    <button type="button" id="tm-other-store-clear-filters" class="tm-cat-btn">${esc(T['Clear'])}</button>
                </div>
            </div>
            <div id="tm-other-store-modal-body" class="tm-cat-table-body">
                ${buildEmptyState('…', 'Loading', 'Fetching network stock')}
            </div>
        </div>`;
    }

    function buildModelPickerHTML(models, totalPhones) {
        const options = models.map(([model, data]) =>
            `<option value="${esc(model)}">${esc(model)} (${data.count}${data.buybackCount > 0 ? ` · ${data.buybackCount} BB` : ''})</option>`
        ).join('');
        return `
            <div class="tm-cat-empty tm-pc-empty" style="min-height:260px">
                <div class="tm-cat-empty-title tm-pc-empty-title">Select model</div>
                <div class="tm-cat-empty-sub tm-pc-empty-sub">${totalPhones} devices · ${models.length} models</div>
                <select id="tm-os-model-picker-select" class="tm-cat-select" style="width:min(360px,100%);margin-top:12px;padding:10px 28px 10px 12px!important;font-size:12px!important">
                    <option value="">— Choose —</option>
                    ${options}
                </select>
            </div>`;
    }

    window.PhoneCatalogUI = {
        STYLES: PHONE_CATALOG_UI_STYLES,
        esc,
        buildModalHTML,
        buildPhoneRow,
        buildPhoneCard,
        buildListHeader,
        buildStoreChipHtml,
        buildStoreChipsHtml,
        buildEmptyState,
        buildOtherStoresModalHTML,
        buildModelPickerHTML,
    };
})();
