// ==UserScript==
// @name         MyManager Phone Catalog UI
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Phone catalog layout, styles, and row rendering.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ICON = {
        phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>',
        search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
        refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>',
        star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>',
        starOutline: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>',
        copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        palette: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 0 0 10-10 4 4 0 0 0-4-4H12a4 4 0 0 0-4 4 10 10 0 0 0 4 10z"/></svg>',
        tag: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7" y2="7.01"/></svg>',
        store: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        export: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        sort: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="16" y2="6"/><line x1="4" y1="12" x2="12" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/><polyline points="18 15 21 18 24 15"/><line x1="21" y1="18" x2="21" y2="6"/></svg>',
        network: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>',
    };

    const PHONE_CATALOG_UI_STYLES = `
        @keyframes tm-pc-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tm-pc-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes tm-cat-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes tm-pc-rise { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes tm-pc-spin { to { transform: rotate(360deg); } }

        .tm-phone-catalog-overlay {
            animation: tm-pc-in 0.24s ease;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            background: var(--tm-overlay-dim, rgba(0,0,0,0.72)) !important;
        }

        .tm-phone-modal-content.tm-pc-shell,
        .tm-phone-modal-content.tm-cat-app {
            animation: tm-pc-rise 0.32s cubic-bezier(0.22, 1, 0.36, 1);
            width: min(1480px, 96vw) !important;
            max-width: 96vw !important;
            height: 94vh !important;
            max-height: 94vh !important;
            border-radius: 18px !important;
            border: 1px solid var(--tm-shop-item-border) !important;
            box-shadow: 0 28px 80px var(--tm-shadow-color, rgba(0,0,0,0.45)) !important;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex !important;
            flex-direction: column !important;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
        }

        /* ── Hero ── */
        .tm-pc-hero {
            padding: 20px 24px 14px;
            background: linear-gradient(135deg, color-mix(in srgb, var(--tm-primary-color) 16%, transparent) 0%, transparent 72%);
            border-bottom: 1px solid var(--tm-shop-item-border);
            flex-shrink: 0;
        }
        .tm-pc-hero-top {
            display: flex; align-items: flex-start; justify-content: space-between;
            gap: 16px; margin-bottom: 14px;
        }
        .tm-pc-hero-brand { display: flex; align-items: flex-start; gap: 14px; min-width: 0; }
        .tm-pc-hero-icon {
            width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            background: color-mix(in srgb, var(--tm-primary-color) 18%, var(--tm-shop-item-bg));
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 28%, var(--tm-shop-item-border));
            color: var(--tm-primary-color);
            box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 40%, transparent);
        }
        .tm-pc-hero-title {
            margin: 0; font-size: 1.35rem; font-weight: 800;
            letter-spacing: 0.01em; line-height: 1.2;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .tm-pc-hero-badge {
            display: inline-flex; align-items: center; padding: 4px 10px;
            border-radius: 999px; font-size: 10px; font-weight: 700;
            letter-spacing: 0.06em; text-transform: uppercase;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 14%, transparent);
            color: var(--tm-info-color, #0ea5e9);
            border: 1px solid color-mix(in srgb, var(--tm-info-color, #0ea5e9) 32%, transparent);
        }
        .tm-pc-hero-sub {
            margin: 5px 0 0; font-size: 12px;
            color: var(--tm-muted-text, var(--tm-secondary-color, rgba(128,128,128,0.9)));
        }
        .tm-pc-hero-actions {
            display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap;
        }
        .tm-pc-tool-btn, .tm-phone-toolbar-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 12px; border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-input-bg, var(--tm-shop-item-bg));
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            font-size: 12px; font-weight: 600; cursor: pointer;
            transition: background 0.15s, border-color 0.15s, transform 0.12s;
            white-space: nowrap;
        }
        .tm-pc-tool-btn:hover, .tm-phone-toolbar-btn:hover {
            background: var(--tm-shop-item-hover-bg);
            border-color: var(--tm-primary-color);
            transform: translateY(-1px);
        }
        .tm-pc-tool-btn svg, .tm-phone-toolbar-btn svg { flex-shrink: 0; opacity: 0.85; }
        .tm-pc-close, .tm-modal-close {
            width: 38px; height: 38px; padding: 0 !important;
            border-radius: 10px !important; font-size: 22px !important; line-height: 1;
            display: inline-flex !important; align-items: center; justify-content: center;
        }
        .tm-pc-close:hover, .tm-modal-close:hover {
            background: color-mix(in srgb, var(--tm-danger-color, #ef4444) 14%, transparent) !important;
            border-color: color-mix(in srgb, var(--tm-danger-color, #ef4444) 38%, transparent) !important;
            transform: scale(1.04);
        }

        /* ── Segmented tabs ── */
        .tm-pc-hero-bottom {
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px; flex-wrap: wrap;
        }
        .tm-pc-seg {
            display: inline-flex; padding: 4px; border-radius: 12px;
            background: var(--tm-chip-bg, var(--tm-shop-item-hover-bg));
            border: 1px solid var(--tm-chip-border, var(--tm-shop-item-border));
        }
        .tm-pc-seg-btn, .tm-cat-tab {
            border: none; background: transparent; cursor: pointer;
            padding: 8px 18px; border-radius: 9px;
            font-size: 12px; font-weight: 700;
            color: var(--tm-muted-text, var(--tm-shop-item-text));
            opacity: 0.75; transition: all 0.15s;
        }
        .tm-pc-seg-btn:hover, .tm-cat-tab:hover { opacity: 1; color: var(--tm-primary-color); }
        .tm-pc-seg-btn.active, .tm-cat-tab.active {
            opacity: 1; color: var(--tm-primary-color);
            background: var(--tm-shop-item-bg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 color-mix(in srgb, #fff 50%, transparent);
        }

        /* ── Filters ── */
        .tm-pc-filters, .tm-cat-controls {
            padding: 14px 24px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg));
            flex-shrink: 0;
            display: flex; flex-direction: column; gap: 12px;
        }
        .tm-pc-filters-label {
            font-size: 10px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.08em; color: var(--tm-muted-text, var(--tm-secondary-color));
            margin-bottom: -4px;
        }
        .tm-pc-search-row, .tm-cat-search-line {
            display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .tm-pc-search, .tm-cat-search {
            position: relative; flex: 1 1 260px; min-width: 200px;
            display: flex; align-items: center;
        }
        .tm-pc-search-icon, .tm-cat-search-icon {
            position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
            color: var(--tm-muted-text, var(--tm-shop-item-text)); opacity: 0.5;
            pointer-events: none; display: flex;
        }
        #tm-phone-search-input {
            width: 100% !important; box-sizing: border-box !important;
            height: 40px !important; padding: 0 14px 0 38px !important;
            border-radius: 10px !important;
            border: 1px solid var(--tm-input-border, var(--tm-shop-item-border)) !important;
            background: var(--tm-input-bg, var(--tm-shop-item-bg)) !important;
            color: var(--tm-input-text, var(--tm-shop-item-text)) !important;
            font-size: 13px !important; outline: none !important;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        #tm-phone-search-input:focus {
            border-color: var(--tm-primary-color) !important;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--tm-primary-color) 18%, transparent) !important;
        }
        .tm-pc-regex, .tm-cat-regex {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 12px; border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            font-size: 12px; font-weight: 600; cursor: pointer;
            color: var(--tm-shop-item-text); white-space: nowrap;
        }
        .tm-pc-fav-btn, #tm-phone-favorites-btn, .tm-cat-pill {
            display: inline-flex; align-items: center; gap: 6px;
            height: 40px; padding: 0 14px; border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 12px; font-weight: 600; cursor: pointer;
            transition: all 0.15s;
        }
        .tm-pc-fav-btn:hover, #tm-phone-favorites-btn:hover,
        #tm-phone-favorites-btn.active {
            border-color: var(--tm-warning-color, #eab308);
            color: var(--tm-warning-color, #ca8a04);
            background: color-mix(in srgb, var(--tm-warning-color, #eab308) 10%, var(--tm-shop-item-bg));
        }

        .tm-pc-filter-row, .tm-cat-filters {
            display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
        }
        .tm-pc-select, .tm-cat-select,
        #tm-phone-filter-grade, #tm-phone-filter-model, #tm-phone-filter-gb,
        #tm-phone-filter-color, #tm-phone-filter-tag, #tm-phone-sort-by,
        #tm-other-store-filter-grade, #tm-other-store-filter-model, #tm-other-store-filter-gb,
        #tm-other-store-filter-color, #tm-other-store-filter-store, #tm-other-store-sort {
            height: 36px; min-width: 118px;
            padding: 0 30px 0 12px !important;
            border-radius: 10px !important;
            border: 1px solid var(--tm-input-border, var(--tm-shop-item-border)) !important;
            background: var(--tm-input-bg, var(--tm-shop-item-bg)) !important;
            color: var(--tm-input-text, var(--tm-shop-item-text)) !important;
            font-size: 12px !important; font-weight: 600;
            cursor: pointer; appearance: none !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23999' d='M5 7L1.5 3.5h7z'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 10px center !important;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        #tm-phone-filter-model, #tm-other-store-filter-model { flex: 1; min-width: 160px; }
        .tm-pc-select:hover, #tm-phone-filter-grade:hover, #tm-phone-filter-model:hover,
        #tm-phone-filter-gb:hover, #tm-phone-filter-color:hover, #tm-phone-filter-tag:hover,
        #tm-phone-sort-by:hover, #tm-other-store-filter-grade:hover, #tm-other-store-filter-model:hover,
        #tm-other-store-filter-gb:hover, #tm-other-store-filter-color:hover,
        #tm-other-store-filter-store:hover, #tm-other-store-sort:hover {
            border-color: var(--tm-primary-color) !important;
        }
        .tm-pc-select:focus, #tm-phone-search-input:focus,
        #tm-phone-filter-grade:focus, #tm-phone-filter-model:focus,
        #tm-phone-filter-gb:focus, #tm-phone-filter-color:focus,
        #tm-phone-filter-tag:focus, #tm-phone-sort-by:focus {
            outline: none !important;
            border-color: var(--tm-primary-color) !important;
        }

        .tm-pc-btn, .tm-cat-btn,
        #tm-phone-clear-filters, #tm-phone-sort-dir, #tm-phone-export-btn,
        #tm-phone-select-all, #tm-other-store-clear-filters {
            display: inline-flex; align-items: center; gap: 5px;
            height: 36px; padding: 0 12px; border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 12px; font-weight: 600;
            cursor: pointer; transition: all 0.15s;
        }
        .tm-pc-btn:hover, .tm-cat-btn:hover, #tm-phone-clear-filters:hover,
        #tm-phone-sort-dir:hover, #tm-phone-export-btn:hover,
        #tm-phone-select-all:hover, #tm-other-store-clear-filters:hover {
            border-color: var(--tm-primary-color);
            color: var(--tm-primary-color);
            background: var(--tm-shop-item-hover-bg);
        }

        /* ── Body & table ── */
        .tm-pc-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
        #tm-other-store-container { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
        .tm-pc-table-wrap {
            flex: 1; overflow: hidden; margin: 12px 16px 0;
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 14px;
            background: var(--tm-shop-item-bg);
            box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 30%, transparent);
            display: flex; flex-direction: column; min-height: 0;
        }
        #tm-phone-list-container, #tm-other-store-content, #tm-other-store-modal-body {
            flex: 1; overflow-y: auto; padding: 0 !important;
            background: transparent !important;
        }
        .tm-pc-list, .tm-cat-table-body {
            display: flex; flex-direction: column;
        }

        .tm-pc-thead, .tm-cat-thead {
            display: grid;
            grid-template-columns: var(--tm-pc-grid-mine);
            gap: 10px; padding: 10px 16px;
            font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.07em;
            color: var(--tm-muted-text, var(--tm-secondary-color, var(--tm-shop-item-text)));
            background: color-mix(in srgb, var(--tm-shop-item-border) 14%, var(--tm-shop-item-bg)) !important;
            border-bottom: 1px solid var(--tm-shop-item-border);
            position: sticky; top: 0; z-index: 4;
        }
        .tm-pc-thead--other, .tm-cat-thead--other {
            grid-template-columns: var(--tm-pc-grid-other);
        }
        .tm-pc-thead span:last-child, .tm-cat-thead span:last-child { text-align: right; }

        :root {
            --tm-pc-grid-mine: 56px minmax(200px, 1.6fr) 96px 72px minmax(120px, 1fr) 88px 120px;
            --tm-pc-grid-other: 56px minmax(180px, 1.3fr) minmax(160px, 1.2fr) 96px 72px minmax(110px, 0.9fr) 88px 120px;
        }

        .tm-pc-row, .tm-cat-tr {
            display: grid;
            grid-template-columns: var(--tm-pc-grid-mine);
            gap: 10px; align-items: center;
            padding: 11px 16px;
            border-bottom: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 65%, transparent);
            cursor: pointer;
            transition: background 0.12s, box-shadow 0.12s;
            position: relative;
        }
        .tm-pc-row--other, .tm-cat-tr--other {
            grid-template-columns: var(--tm-pc-grid-other);
        }
        .tm-pc-row::before, .tm-cat-tr::before {
            content: ''; position: absolute; left: 0; top: 0; bottom: 0;
            width: 3px; background: transparent; transition: background 0.12s;
        }
        .tm-pc-row:hover, .tm-cat-tr:hover {
            background: var(--tm-shop-item-hover-bg);
        }
        .tm-pc-row:hover::before, .tm-cat-tr:hover::before {
            background: color-mix(in srgb, var(--tm-primary-color) 50%, transparent);
        }
        .tm-pc-row.selected, .tm-cat-tr.selected {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--tm-shop-item-bg)) !important;
        }
        .tm-pc-row.selected::before, .tm-cat-tr.selected::before {
            background: var(--tm-primary-color);
        }
        .tm-pc-row.favorite::before, .tm-cat-tr.favorite::before {
            background: var(--tm-warning-color, #eab308);
        }
        .tm-pc-row.favorite.selected::before, .tm-cat-tr.favorite.selected::before {
            background: var(--tm-primary-color);
        }

        .tm-pc-col { min-width: 0; }
        .tm-pc-grade-badge, .tm-pc-row-grade, .tm-cat-grade {
            width: 40px; height: 32px; border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800;
            box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 25%, transparent);
        }
        .tm-pc-col-device, .tm-pc-row-main, .tm-cat-device { min-width: 0; }
        .tm-pc-row-line1, .tm-cat-line-primary {
            display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
            margin-bottom: 3px;
        }
        .tm-pc-row-line2, .tm-cat-line-secondary {
            display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
        }
        .tm-pc-row-model, .tm-cat-model {
            font-size: 13px; font-weight: 700;
            letter-spacing: -0.015em; word-break: break-word;
            line-height: 1.3;
        }
        .tm-pc-meta, .tm-cat-tag, .tm-pc-meta-chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 2px 8px; border-radius: 6px;
            font-size: 10px; font-weight: 700;
            background: var(--tm-chip-bg, color-mix(in srgb, var(--tm-shop-item-border) 28%, transparent));
            border: 1px solid var(--tm-chip-border, var(--tm-shop-item-border));
            color: var(--tm-chip-text, var(--tm-shop-item-text));
        }
        .tm-pc-meta--bb, .tm-cat-tag--bb, .tm-pc-meta-chip--buyback {
            background: color-mix(in srgb, var(--tm-warning-color, #eab308) 14%, transparent);
            border-color: color-mix(in srgb, var(--tm-warning-color) 35%, transparent);
            color: var(--tm-warning-color, #a16207);
        }
        .tm-pc-meta--tag, .tm-cat-tag--hash, .tm-pc-meta-chip--tag {
            background: transparent;
        }
        .tm-pc-color-cell {
            display: flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 600;
        }
        .tm-pc-swatch, .tm-cat-swatch, .tm-pc-color-dot {
            width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
            border: 1.5px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, #888);
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.12);
        }
        .tm-pc-storage {
            font-size: 12px; font-weight: 700;
            font-variant-numeric: tabular-nums;
            color: var(--tm-shop-item-text);
        }
        .tm-pc-barcode, .tm-cat-code {
            font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
            font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
            padding: 4px 8px; border-radius: 6px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 22%, transparent);
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
            color: var(--tm-shop-item-text);
            display: inline-block; max-width: 100%;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tm-pc-price, .tm-cat-price {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 72px; padding: 4px 10px; border-radius: 8px;
            font-size: 12px; font-weight: 800;
            font-variant-numeric: tabular-nums;
            background: color-mix(in srgb, var(--tm-success-color, #22c55e) 12%, transparent);
            border: 1px solid color-mix(in srgb, var(--tm-success-color, #22c55e) 28%, transparent);
            color: var(--tm-success-color, #16a34a);
        }
        .tm-pc-price--empty { opacity: 0.35; background: transparent; border-color: transparent; font-weight: 600; }

        .tm-pc-stores, .tm-pc-row-stores, .tm-cat-stores {
            display: flex; flex-wrap: wrap; gap: 4px;
            align-items: center; align-self: center;
        }
        .tm-pc-row-actions, .tm-cat-actions {
            display: flex; gap: 4px; justify-content: flex-end;
        }
        .tm-pc-act, .tm-pc-action-btn, .tm-cat-act,
        .tm-phone-search-btn, .tm-phone-copy-imei-btn, .tm-phone-favorite-btn, .tm-os-action-btn {
            width: 32px; height: 32px; border-radius: 8px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            cursor: pointer; font-size: 0;
            display: inline-flex; align-items: center; justify-content: center;
            transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.1s;
        }
        .tm-pc-act:hover, .tm-pc-action-btn:hover, .tm-cat-act:hover,
        .tm-phone-search-btn:hover, .tm-phone-copy-imei-btn:hover,
        .tm-phone-favorite-btn:hover, .tm-os-action-btn:hover {
            border-color: var(--tm-primary-color);
            color: var(--tm-primary-color);
            background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg));
            transform: translateY(-1px);
        }
        .tm-pc-act.is-fav, .tm-phone-favorite-btn.is-fav {
            border-color: color-mix(in srgb, var(--tm-warning-color, #eab308) 45%, transparent);
            color: var(--tm-warning-color, #ca8a04) !important;
            background: color-mix(in srgb, var(--tm-warning-color, #eab308) 12%, var(--tm-shop-item-bg));
        }

        .tm-pc-store, .tm-cat-store, .tm-pc-store-chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 8px; border-radius: 6px;
            font-size: 10px; font-weight: 700; line-height: 1.35;
            white-space: nowrap;
        }
        .tm-pc-store--ok, .tm-cat-store--ok, .tm-pc-store-chip--ok {
            background: color-mix(in srgb, #16a34a 14%, transparent);
            color: #15803d;
            border: 1px solid color-mix(in srgb, #16a34a 28%, transparent);
        }
        .tm-pc-store--no, .tm-cat-store--no, .tm-pc-store-chip--bad {
            background: color-mix(in srgb, #dc2626 12%, transparent);
            color: #b91c1c;
            border: 1px solid color-mix(in srgb, #dc2626 26%, transparent);
        }
        .tm-pc-store--mid, .tm-cat-store--mid, .tm-pc-store-chip--neutral {
            background: color-mix(in srgb, var(--tm-shop-item-border) 22%, transparent);
            color: var(--tm-shop-item-text);
            border: 1px solid var(--tm-shop-item-border);
        }
        .tm-pc-store-loading, .tm-cat-store-loading, .tm-pc-store-loading {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 11px; opacity: 0.55; font-style: italic;
        }
        .tm-pc-store-loading i, .tm-cat-store-loading i, .tm-pc-store-loading i {
            width: 10px; height: 10px; border-radius: 50%;
            border: 2px solid currentColor; border-top-color: transparent;
            animation: tm-pc-spin 0.7s linear infinite; display: inline-block;
        }

        /* ── Empty & footer ── */
        .tm-pc-empty, .tm-cat-empty {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 280px; gap: 10px; padding: 40px 24px;
            color: var(--tm-shop-item-text);
        }
        .tm-pc-empty-visual {
            width: 64px; height: 64px; border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--tm-shop-item-bg));
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 20%, var(--tm-shop-item-border));
            color: var(--tm-primary-color); opacity: 0.7;
            margin-bottom: 4px;
        }
        .tm-pc-empty-icon, .tm-cat-empty-icon { font-size: 36px; opacity: 0.4; }
        .tm-pc-empty-title, .tm-cat-empty-title { font-size: 15px; font-weight: 700; }
        .tm-pc-empty-sub, .tm-cat-empty-sub {
            font-size: 12px; opacity: 0.6; max-width: 340px; text-align: center; line-height: 1.5;
        }

        .tm-pc-footer, .tm-cat-statusbar, .tm-pc-statusbar {
            display: flex; justify-content: space-between; align-items: center;
            gap: 14px; flex-wrap: wrap;
            padding: 12px 24px;
            border-top: 1px solid var(--tm-shop-item-border);
            background: var(--tm-grid-header-bg, var(--tm-shop-item-hover-bg));
            font-size: 12px; color: var(--tm-shop-item-text);
            flex-shrink: 0;
        }
        #tm-phone-statistics { display: flex; gap: 8px; flex-wrap: wrap; }
        #tm-phone-statistics span, .tm-pc-stat-chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 10px; border-radius: 999px;
            font-size: 10px; font-weight: 700;
            background: var(--tm-chip-bg, color-mix(in srgb, var(--tm-shop-item-border) 25%, transparent));
            border: 1px solid var(--tm-chip-border, var(--tm-shop-item-border));
        }
        #tm-phone-count-text { font-weight: 800; font-size: 13px; }

        #tm-phone-export-menu {
            position: absolute; top: calc(100% + 6px); right: 0;
            background: var(--tm-shop-item-bg);
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            padding: 8px; min-width: 220px; display: none; z-index: 20;
        }
        #tm-phone-export-menu button {
            width: 100%; text-align: left; margin-bottom: 4px;
            border: none; background: transparent;
            color: var(--tm-shop-item-text);
            padding: 9px 12px; border-radius: 8px;
            font-size: 12px; font-weight: 600; cursor: pointer;
        }
        #tm-phone-export-menu button:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
            color: var(--tm-primary-color);
        }

        .tm-phone-load-more {
            margin: 10px 16px 14px; padding: 12px;
            border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-primary-color);
            font-size: 12px; font-weight: 700; cursor: pointer;
        }
        .tm-phone-load-more:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 8%, transparent);
            border-color: var(--tm-primary-color);
        }

        .tm-phone-context-menu, .tm-phone-tag-submenu {
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,0.28) !important;
            border: 1px solid var(--tm-shop-item-border) !important;
            font-size: 12px !important;
            padding: 6px !important;
        }

        /* ── Other-store modal ── */
        .tm-other-store-overlay .tm-pc-os-shell, .tm-other-store-overlay .tm-cat-os-panel {
            width: min(1480px, 96vw); height: 94vh; max-height: 94vh;
            border-radius: 18px; overflow: hidden;
            border: 1px solid var(--tm-shop-item-border);
            box-shadow: 0 28px 80px var(--tm-shadow-color, rgba(0,0,0,0.45));
            background: var(--tm-modal-bg, var(--tm-shop-item-bg));
            display: flex; flex-direction: column;
        }
        .tm-pc-os-hero, .tm-cat-os-top {
            padding: 18px 24px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            background: linear-gradient(135deg, color-mix(in srgb, var(--tm-primary-color) 14%, transparent) 0%, transparent 70%);
            flex-shrink: 0;
        }
        #tm-os-filter-bar { border-bottom: 1px solid var(--tm-shop-item-border) !important; flex-shrink: 0; }
        #tm-other-store-modal-body { flex: 1; min-height: 0; }
        .tm-other-store-overlay #tm-other-store-modal-body .tm-pc-table-wrap {
            margin: 12px 16px; flex: 1;
        }

        @media (max-width: 1100px) {
            :root {
                --tm-pc-grid-mine: 48px minmax(160px, 1.4fr) 80px 64px minmax(100px, 0.9fr) 76px 108px;
                --tm-pc-grid-other: 48px minmax(140px, 1.1fr) minmax(120px, 1fr) 80px 64px minmax(90px, 0.8fr) 76px 108px;
            }
            .tm-pc-hero-actions .tm-pc-tool-label { display: none; }
        }
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
            const cls = allowed ? 'tm-pc-store--ok tm-cat-store--ok tm-pc-store-chip--ok' : 'tm-pc-store--no tm-cat-store--no tm-pc-store-chip--bad';
            const icon = allowed ? '●' : '○';
            return `<span class="tm-pc-store tm-cat-store tm-pc-store-chip ${cls}">${icon} ${name}</span>`;
        }
        if (!allowed) {
            return `<span class="tm-pc-store tm-cat-store tm-pc-store--no tm-pc-store-chip--bad">○ ${name}</span>`;
        }
        return `<span class="tm-pc-store tm-cat-store tm-pc-store--mid tm-pc-store-chip--neutral">${name}</span>`;
    }

    function buildStoreChipsHtml(stores, isBuyback, filterFn, renderChipFn) {
        const filtered = filterFn(stores);
        if (!filtered.length) return '';
        return filtered.map((s) => renderChipFn(s.name, isBuyback)).join('');
    }

    function buildEmptyState(icon, title, subtitle = '') {
        const isEmoji = icon && icon.length <= 4;
        const visual = isEmoji
            ? `<div class="tm-pc-empty-icon tm-cat-empty-icon">${icon}</div>`
            : `<div class="tm-pc-empty-visual">${ICON.phone}</div>`;
        return `
            <div class="tm-pc-empty tm-cat-empty">
                ${visual}
                <div class="tm-pc-empty-title tm-cat-empty-title">${esc(title)}</div>
                ${subtitle ? `<div class="tm-pc-empty-sub tm-cat-empty-sub">${esc(subtitle)}</div>` : ''}
            </div>`;
    }

    function buildListHeader(variant = 'mine') {
        if (variant === 'other') {
            return `<div class="tm-pc-thead tm-pc-thead--other tm-cat-thead tm-cat-thead--other tm-pc-list-header tm-pc-list-header--other">
                <span>Βαθμ.</span><span>Μοντέλο</span><span>Καταστήματα</span>
                <span>Χρώμα</span><span>GB</span><span>Barcode</span><span>Τιμή</span><span>Ενέργειες</span>
            </div>`;
        }
        return `<div class="tm-pc-thead tm-cat-thead tm-pc-list-header">
            <span>Βαθμ.</span><span>Μοντέλο</span><span>Χρώμα</span>
            <span>GB</span><span>Barcode</span><span>Τιμή</span><span>Ενέργειες</span>
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
            'tm-pc-row', 'tm-cat-tr', 'tm-phone-item',
            variant === 'other' ? 'tm-pc-row--other tm-cat-tr--other' : '',
            isSelected ? 'selected' : '',
            isFavorite ? 'favorite' : '',
        ].filter(Boolean).join(' ');

        const tagHtml = tags.map((tag) => {
            const color = ctx.getTagColor(tag);
            return `<span class="tm-pc-meta tm-pc-meta--tag tm-cat-tag tm-cat-tag--hash tm-pc-meta-chip tm-pc-meta-chip--tag" style="color:${esc(color)};border-color:${esc(color)}">#${esc(ctx.getTagDisplayName(tag))}</span>`;
        }).join('');

        const swatch = colorHex
            ? `<span class="tm-pc-swatch tm-cat-swatch tm-pc-color-dot" style="background:${esc(colorHex)}"></span>`
            : '';

        const colorCell = phoneColor
            ? `<div class="tm-pc-color-cell"><span class="tm-pc-swatch tm-cat-swatch" style="background:${esc(colorHex || '#ccc')}"></span><span>${esc(phoneColor)}</span></div>`
            : `<span class="tm-pc-storage" style="opacity:0.35">—</span>`;

        const storageCell = storage
            ? `<span class="tm-pc-storage">${esc(storage)}</span>`
            : `<span class="tm-pc-storage" style="opacity:0.35">—</span>`;

        const priceCell = item.retailPrice
            ? `<span class="tm-pc-price tm-cat-price tm-pc-row-price">${esc(item.retailPrice)} €</span>`
            : `<span class="tm-pc-price tm-pc-price--empty">—</span>`;

        const storesCell = variant === 'other' ? `
            <div class="tm-pc-stores tm-pc-row-stores tm-cat-stores tm-other-store-stores" data-product="${esc(item.barcode)}">
                ${storesPending
        ? '<span class="tm-pc-store-loading tm-cat-store-loading tm-pc-store-loading"><i></i>Φόρτωση…</span>'
        : (storesHtml || '<span style="opacity:0.35;font-size:11px">—</span>')}
            </div>` : '';

        const actions = `
            <div class="tm-pc-row-actions tm-cat-actions tm-pc-col-actions">
                <button type="button" class="tm-pc-act tm-pc-action-btn tm-cat-act tm-phone-search-btn" data-barcode="${esc(item.barcode)}" title="${esc(T['Search barcode in system'])}">${ICON.search}</button>
                ${item.imei ? `<button type="button" class="tm-pc-act tm-pc-action-btn tm-cat-act tm-phone-copy-imei-btn" data-imei="${esc(item.imei)}" title="${esc(T['Copy IMEI'])}">${ICON.copy}</button>` : ''}
                <button type="button" class="tm-pc-act tm-pc-action-btn tm-cat-act tm-phone-favorite-btn ${isFavorite ? 'is-fav' : ''}" data-barcode="${esc(item.barcode)}"
                    title="${esc(isFavorite ? T['Remove from favorites'] : T['Add to favorites'])}">${isFavorite ? ICON.star : ICON.starOutline}</button>
            </div>`;

        return `
            <div class="${rowClass}"
                data-barcode="${esc(item.barcode)}"
                data-name="${esc(item.name)}"
                data-imei="${esc(item.imei || '')}">
                <div class="tm-pc-col tm-pc-col-grade">
                    <div class="tm-pc-grade-badge tm-pc-row-grade tm-cat-grade" style="${ctx.getPhoneGradeCircleStyle(grade)}">${esc(grade || '—')}</div>
                </div>
                <div class="tm-pc-col tm-pc-col-device tm-pc-row-main tm-cat-device">
                    <div class="tm-pc-row-line1 tm-cat-line-primary">
                        ${noBuybackStore ? `<span title="${esc(ctx.t('No buyback store'))}" style="font-size:13px;line-height:1">🚫</span>` : ''}
                        <span class="tm-pc-row-model tm-cat-model" style="${titleStyle}" title="${esc(displayModel)}">${esc(displayModel)}</span>
                        ${item.isBuyback ? '<span class="tm-pc-meta tm-pc-meta--bb tm-cat-tag tm-cat-tag--bb tm-pc-meta-chip tm-pc-meta-chip--buyback">Buyback</span>' : ''}
                    </div>
                    ${tagHtml ? `<div class="tm-pc-row-line2 tm-cat-line-secondary">${tagHtml}</div>` : ''}
                </div>
                ${storesCell}
                <div class="tm-pc-col tm-pc-col-color">${colorCell}</div>
                <div class="tm-pc-col tm-pc-col-storage">${storageCell}</div>
                <div class="tm-pc-col tm-pc-col-barcode">
                    <code class="tm-pc-barcode tm-cat-code">${esc(item.barcode)}</code>
                </div>
                <div class="tm-pc-col tm-pc-col-price">${priceCell}</div>
                ${actions}
            </div>`;
    }

    const buildPhoneCard = buildPhoneRow;

    function buildModalHTML(T) {
        return `
        <style>${PHONE_CATALOG_UI_STYLES}</style>
        <div class="tm-phone-modal-content tm-pc-shell tm-cat-app">
            <header class="tm-pc-hero">
                <div class="tm-pc-hero-top">
                    <div class="tm-pc-hero-brand">
                        <div class="tm-pc-hero-icon">${ICON.phone}</div>
                        <div>
                            <h2 class="tm-pc-hero-title">
                                ${esc(T['Phone Catalog'])}
                                <span class="tm-pc-hero-badge">Inventory</span>
                            </h2>
                            <p class="tm-pc-hero-sub">Διαχείριση και αναζήτηση διαθέσιμων συσκευών στο δίκτυο καταστημάτων</p>
                        </div>
                    </div>
                    <div class="tm-pc-hero-actions">
                        <button type="button" id="tm-phone-refresh-btn" class="tm-pc-tool-btn tm-phone-toolbar-btn" title="${esc(T['Refresh (Ctrl+R)'])}">${ICON.refresh}<span class="tm-pc-tool-label">Ανανέωση</span></button>
                        <button type="button" id="tm-phone-view-toggle" hidden aria-hidden="true"></button>
                        <button type="button" id="tm-phone-colors-btn" class="tm-pc-tool-btn tm-phone-toolbar-btn" title="${esc(T['Manage Colors'])}">${ICON.palette}<span class="tm-pc-tool-label">Χρώματα</span></button>
                        <button type="button" id="tm-phone-tags-btn" class="tm-pc-tool-btn tm-phone-toolbar-btn" title="${esc(T['Manage Tags'])}">${ICON.tag}<span class="tm-pc-tool-label">Ετικέτες</span></button>
                        <button type="button" id="tm-phone-stores-btn" class="tm-pc-tool-btn tm-phone-toolbar-btn" title="${esc(T['Manage Stores'])}">${ICON.store}<span class="tm-pc-tool-label">Καταστήματα</span></button>
                        <button type="button" id="tm-phone-other-store-toggle" hidden aria-hidden="true"></button>
                        <button type="button" class="tm-modal-close tm-pc-close tm-pc-tool-btn" aria-label="Close">×</button>
                    </div>
                </div>
                <div class="tm-pc-hero-bottom">
                    <nav class="tm-pc-seg tm-cat-tabs" role="tablist">
                        <button type="button" class="tm-pc-seg-btn tm-cat-tab active" id="tm-pc-view-mine" data-view="mine">Το κατάστημά μου</button>
                        <button type="button" class="tm-pc-seg-btn tm-cat-tab" id="tm-pc-view-other" data-view="other">Άλλα καταστήματα</button>
                    </nav>
                </div>
            </header>

            <div class="tm-pc-filters tm-cat-controls" data-tm-phone-toolbar>
                <div class="tm-pc-filters-label">Αναζήτηση & φίλτρα</div>
                <div class="tm-pc-search-row tm-cat-search-line">
                    <label class="tm-pc-search tm-cat-search">
                        <span class="tm-pc-search-icon tm-cat-search-icon">${ICON.search}</span>
                        <input type="search" id="tm-phone-search-input" placeholder="${esc(T['Search...'])}" autocomplete="off">
                    </label>
                    <label class="tm-pc-regex tm-cat-regex">
                        <input type="checkbox" id="tm-phone-regex-toggle"> ${esc(T['Regex'])}
                    </label>
                    <button type="button" id="tm-phone-favorites-btn" class="tm-pc-fav-btn tm-cat-pill" title="${esc(T['Show Favorites'])}">${ICON.starOutline}<span>${esc(T['Fav'])}</span></button>
                </div>
                <div class="tm-pc-filter-row tm-cat-filters">
                    <select id="tm-phone-filter-grade" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Grades'])}</option></select>
                    <select id="tm-phone-filter-model" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Models'])}</option></select>
                    <select id="tm-phone-filter-gb" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Storage'])}</option></select>
                    <select id="tm-phone-filter-color" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Colors'])}</option></select>
                    <select id="tm-phone-filter-tag" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Tags'])}</option></select>
                    <select id="tm-phone-sort-by" class="tm-pc-select tm-cat-select">
                        <option value="model">${esc(T['Sort by Model'])}</option>
                        <option value="grade">${esc(T['Sort by Grade'])}</option>
                        <option value="gb">${esc(T['Sort by Storage'])}</option>
                        <option value="color">${esc(T['Sort by Color'])}</option>
                        <option value="imei">${esc(T['Sort by IMEI'])}</option>
                    </select>
                    <button type="button" id="tm-phone-sort-dir" class="tm-pc-btn tm-cat-btn" title="${esc(T['Toggle Sort Direction'])}">${ICON.sort}</button>
                    <button type="button" id="tm-phone-clear-filters" class="tm-pc-btn tm-cat-btn">${esc(T['Clear'])}</button>
                    <div style="position:relative">
                        <button type="button" id="tm-phone-export-btn" class="tm-pc-btn tm-cat-btn">${ICON.export}<span>${esc(T['Export'] || 'Export')}</span></button>
                        <div id="tm-phone-export-menu">
                            <button type="button" id="tm-phone-export-clipboard">${esc(T['Copy to Clipboard'])}</button>
                            <button type="button" id="tm-phone-export-csv">${esc(T['Export to CSV'])}</button>
                            <button type="button" id="tm-phone-export-selected" style="display:none">${esc(T['Export Selected'])}</button>
                            <div style="border-top:1px solid var(--tm-shop-item-border);margin-top:6px;padding-top:6px">
                                <label style="display:flex;align-items:center;gap:8px;font-size:11px;padding:6px 8px;cursor:pointer;font-weight:600">
                                    <input type="checkbox" id="tm-phone-export-original-title">
                                    ${esc(T['Include Original Title'])}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button type="button" id="tm-phone-select-all" class="tm-pc-btn tm-cat-btn" style="display:none">${esc(T['Select All'])}</button>
                </div>
            </div>

            <div class="tm-pc-body">
                <div class="tm-pc-table-wrap">
                    <div id="tm-phone-list-container" class="tm-pc-list tm-cat-table-body">
                        ${buildEmptyState('…', 'Φόρτωση', 'Παρακαλώ περιμένετε')}
                    </div>
                </div>
                <div id="tm-other-store-container" style="display:none;flex:1;overflow:hidden;flex-direction:column">
                    <div class="tm-pc-table-wrap" style="flex:1">
                        <div id="tm-other-store-content" class="tm-pc-list tm-cat-table-body">
                            ${buildEmptyState('…', 'Φόρτωση', 'Άλλα καταστήματα')}
                        </div>
                    </div>
                </div>
            </div>

            <footer class="tm-pc-footer tm-cat-statusbar tm-pc-statusbar" id="tm-phone-count">
                <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
                    <span id="tm-phone-count-text">0 συσκευές</span>
                    <div id="tm-phone-statistics"></div>
                </div>
                <div style="display:flex;gap:10px;align-items:center">
                    <span id="tm-phone-last-updated" style="font-size:11px;opacity:0.65"></span>
                    <span id="tm-phone-cache-warning" style="display:none;color:var(--tm-warning-color);font-weight:700;font-size:11px"></span>
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
        <div class="tm-pc-os-shell tm-cat-os-panel tm-pc-os-panel">
            <header class="tm-pc-os-hero tm-cat-os-top">
                <div style="display:flex;align-items:center;gap:14px;min-width:0">
                    <div class="tm-pc-hero-icon">${ICON.network}</div>
                    <div>
                        <div style="font-weight:800;font-size:1.2rem;color:var(--tm-shop-item-text);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            Δίκτυο καταστημάτων
                            <span class="tm-pc-hero-badge">Network</span>
                        </div>
                        <div style="font-size:12px;opacity:0.6;margin-top:4px">Διαθεσιμότητα συσκευών σε όλα τα καταστήματα</div>
                    </div>
                    <button type="button" id="tm-os-back-btn" class="tm-pc-btn tm-cat-btn" style="display:none;margin-left:8px">← Μοντέλα</button>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <span id="tm-other-store-count" style="font-size:11px;font-weight:600;opacity:0.7"></span>
                    <button type="button" id="tm-other-store-refresh-btn" class="tm-pc-tool-btn" title="Ανανέωση">${ICON.refresh}</button>
                    <button type="button" id="tm-other-store-close" class="tm-modal-close tm-pc-close tm-pc-tool-btn">×</button>
                </div>
            </header>
            <div id="tm-os-filter-bar" style="display:none">
                <div class="tm-pc-filter-row tm-cat-filters" style="padding:12px 24px">
                    <select id="tm-other-store-filter-grade" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Grades'])}</option></select>
                    <select id="tm-other-store-filter-model" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Models'])}</option></select>
                    <select id="tm-other-store-filter-gb" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Storage'])}</option></select>
                    <select id="tm-other-store-filter-color" class="tm-pc-select tm-cat-select"><option value="">${esc(T['All Colors'])}</option></select>
                    <select id="tm-other-store-filter-store" class="tm-pc-select tm-cat-select"><option value="">Όλα τα καταστήματα</option></select>
                    <select id="tm-other-store-sort" class="tm-pc-select tm-cat-select">
                        <option value="model-asc">Μοντέλο Α→Ω</option>
                        <option value="model-desc">Μοντέλο Ω→Α</option>
                        <option value="price-asc">Τιμή ↑</option>
                        <option value="price-desc">Τιμή ↓</option>
                        <option value="grade-asc">Βαθμός A+→A</option>
                        <option value="grade-desc">Βαθμός A→A+</option>
                        <option value="storage-asc">Χωρητικότητα ↑</option>
                        <option value="storage-desc">Χωρητικότητα ↓</option>
                    </select>
                    <button type="button" id="tm-other-store-clear-filters" class="tm-pc-btn tm-cat-btn">${esc(T['Clear'])}</button>
                </div>
            </div>
            <div id="tm-other-store-modal-body" class="tm-pc-list tm-cat-table-body">
                ${buildEmptyState('…', 'Φόρτωση', 'Λήψη δεδομένων δικτύου')}
            </div>
        </div>`;
    }

    function buildModelPickerHTML(models, totalPhones) {
        const options = models.map(([model, data]) =>
            `<option value="${esc(model)}">${esc(model)} (${data.count}${data.buybackCount > 0 ? ` · ${data.buybackCount} BB` : ''})</option>`
        ).join('');
        return `
            <div class="tm-pc-empty tm-cat-empty" style="min-height:300px">
                <div class="tm-pc-empty-visual">${ICON.phone}</div>
                <div class="tm-pc-empty-title tm-cat-empty-title">Επιλογή μοντέλου</div>
                <div class="tm-pc-empty-sub tm-cat-empty-sub">${totalPhones} συσκευές · ${models.length} μοντέλα</div>
                <select id="tm-os-model-picker-select" class="tm-pc-select tm-cat-select" style="width:min(400px,100%);margin-top:16px;height:42px!important;font-size:13px!important">
                    <option value="">— Επιλέξτε μοντέλο —</option>
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
