// ==UserScript==
// @name         MyManager Phone Catalog UI
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modern phone catalog layout, styles, and card rendering.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PHONE_CATALOG_UI_STYLES = `
        @keyframes tm-pc-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tm-pc-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes tm-pc-rise { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes tm-pc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes tm-pc-spin { to { transform: rotate(360deg); } }

        .tm-phone-catalog-overlay {
            animation: tm-pc-fade-in 0.28s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .tm-phone-modal-content.tm-pc-shell {
            animation: tm-pc-rise 0.32s cubic-bezier(0.22, 1, 0.36, 1);
            max-width: min(1280px, 96vw) !important;
            width: min(1280px, 96vw);
            max-height: 92vh !important;
            border-radius: 20px !important;
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 28%, var(--tm-shop-item-border)) !important;
            box-shadow:
                0 28px 80px rgba(0, 0, 0, 0.45),
                0 0 0 1px rgba(255, 255, 255, 0.04) inset !important;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
            overflow: hidden;
        }

        .tm-pc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: linear-gradient(180deg, color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg)) 0%, var(--tm-shop-item-bg) 100%);
        }
        .tm-pc-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
        .tm-pc-header-icon {
            width: 42px; height: 42px; border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; flex-shrink: 0;
            background: color-mix(in srgb, var(--tm-primary-color) 18%, transparent);
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 35%, transparent);
            box-shadow: 0 4px 14px color-mix(in srgb, var(--tm-primary-color) 22%, transparent);
        }
        .tm-pc-title { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -0.02em; color: var(--tm-shop-item-text, var(--tm-primary-color)); }
        .tm-pc-subtitle { margin: 2px 0 0; font-size: 11px; opacity: 0.65; color: var(--tm-shop-item-text, var(--tm-secondary-hover)); }

        .tm-pc-view-switch {
            display: inline-flex; padding: 4px; gap: 4px; border-radius: 14px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 40%, transparent);
            border: 1px solid var(--tm-shop-item-border);
        }
        .tm-pc-view-tab {
            border: none; background: transparent; cursor: pointer;
            padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
            color: var(--tm-secondary-hover, var(--tm-shop-item-text));
            transition: background 0.15s, color 0.15s, box-shadow 0.15s;
            white-space: nowrap;
        }
        .tm-pc-view-tab:hover { color: var(--tm-primary-color); }
        .tm-pc-view-tab.active {
            background: var(--tm-shop-item-bg);
            color: var(--tm-primary-color);
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .tm-pc-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
        .tm-pc-icon-btn, .tm-phone-toolbar-btn {
            width: 36px; height: 36px; border-radius: 11px;
            border: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 88%, transparent);
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            cursor: pointer; font-size: 15px;
            display: inline-flex; align-items: center; justify-content: center;
            transition: transform 0.12s, border-color 0.12s, background 0.12s, color 0.12s;
        }
        .tm-pc-icon-btn:hover, .tm-phone-toolbar-btn:hover, .tm-modal-close:hover {
            border-color: var(--tm-primary-color);
            background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg));
            transform: translateY(-1px);
        }
        .tm-pc-icon-btn.active, #tm-phone-other-store-toggle.active {
            border-color: var(--tm-primary-color) !important;
            color: var(--tm-primary-color) !important;
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg)) !important;
        }
        .tm-modal-close { width: 36px; height: 36px; font-size: 22px; line-height: 1; background: transparent; border: 1px solid transparent; border-radius: 11px; cursor: pointer; color: var(--tm-shop-item-text); }

        .tm-pc-toolbar {
            padding: 14px 18px 12px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 92%, var(--tm-dark-hover, #111));
        }
        .tm-pc-search-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
        .tm-pc-search-wrap {
            flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px;
            padding: 0 12px; border-radius: 12px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tm-pc-search-wrap:focus-within {
            border-color: var(--tm-primary-color);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--tm-primary-color) 18%, transparent);
        }
        .tm-pc-search-wrap span { opacity: 0.55; font-size: 14px; }
        #tm-phone-search-input {
            flex: 1; border: none !important; background: transparent !important;
            padding: 10px 0 !important; font-size: 13px !important; outline: none !important;
            color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            box-shadow: none !important;
        }
        .tm-pc-chip-btn {
            border: 1px solid var(--tm-shop-item-border); background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            padding: 8px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
            cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .tm-pc-chip-btn:hover, .tm-pc-chip-btn.active {
            border-color: var(--tm-primary-color);
            background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--tm-shop-item-bg));
            color: var(--tm-primary-color);
        }
        .tm-pc-regex-label {
            display: inline-flex; align-items: center; gap: 6px; font-size: 11px;
            color: var(--tm-shop-item-text); cursor: pointer; white-space: nowrap; opacity: 0.85;
        }

        .tm-pc-filters-row {
            display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
        }
        .tm-pc-select, #tm-phone-filter-grade, #tm-phone-filter-model, #tm-phone-filter-gb,
        #tm-phone-filter-color, #tm-phone-filter-tag, #tm-phone-sort-by,
        #tm-other-store-filter-grade, #tm-other-store-filter-model, #tm-other-store-filter-gb,
        #tm-other-store-filter-color, #tm-other-store-filter-store, #tm-other-store-sort {
            min-width: 100px; padding: 8px 30px 8px 11px !important;
            border-radius: 10px !important; border: 1px solid var(--tm-shop-item-border) !important;
            background: var(--tm-shop-item-bg) !important;
            color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            font-size: 11px !important; font-weight: 600; cursor: pointer;
            appearance: none !important;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2394a3b8' d='M5 7L2 4h6z'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 9px center !important;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tm-pc-select:hover, #tm-phone-filter-grade:hover, #tm-phone-filter-model:hover,
        #tm-phone-filter-gb:hover, #tm-phone-filter-color:hover, #tm-phone-filter-tag:hover,
        #tm-phone-sort-by:hover, #tm-other-store-filter-grade:hover, #tm-other-store-filter-model:hover,
        #tm-other-store-filter-gb:hover, #tm-other-store-filter-color:hover,
        #tm-other-store-filter-store:hover, #tm-other-store-sort:hover {
            border-color: var(--tm-primary-color) !important;
        }
        .tm-pc-select:focus, #tm-phone-search-input:focus, #tm-phone-filter-grade:focus,
        #tm-phone-filter-model:focus, #tm-phone-filter-gb:focus, #tm-phone-filter-color:focus,
        #tm-phone-filter-tag:focus, #tm-phone-sort-by:focus {
            outline: none !important;
            border-color: var(--tm-primary-color) !important;
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--tm-primary-color) 18%, transparent) !important;
        }
        #tm-phone-filter-model, #tm-other-store-filter-model { flex: 1; min-width: 140px; }

        .tm-pc-tool-btn, #tm-phone-clear-filters, #tm-phone-sort-dir, #tm-phone-export-btn,
        #tm-phone-select-all, #tm-other-store-clear-filters {
            border: 1px solid var(--tm-shop-item-border); background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 700;
            cursor: pointer; transition: all 0.15s; white-space: nowrap;
            display: inline-flex; align-items: center; gap: 5px;
        }
        .tm-pc-tool-btn:hover, #tm-phone-clear-filters:hover, #tm-phone-sort-dir:hover,
        #tm-phone-export-btn:hover, #tm-phone-select-all:hover, #tm-other-store-clear-filters:hover {
            border-color: var(--tm-primary-color);
            background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--tm-shop-item-bg));
            transform: translateY(-1px);
        }

        #tm-phone-list-container, #tm-other-store-container {
            flex: 1; overflow-y: auto; padding: 16px 18px !important;
            background:
                radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--tm-primary-color) 6%, transparent), transparent 70%),
                var(--tm-shop-item-bg) !important;
        }
        #tm-phone-list-container.tm-pc-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 12px;
            align-content: start;
        }
        #tm-phone-list-container.tm-pc-list-mode {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
        }
        #tm-phone-list-container.tm-pc-list-mode .tm-pc-card {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
        }
        #tm-other-store-content.tm-pc-os-list {
            display: flex !important; flex-direction: column; gap: 10px; align-items: stretch;
        }

        .tm-pc-card {
            position: relative;
            display: flex; flex-direction: column; gap: 10px;
            padding: 14px;
            border-radius: 16px;
            border: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 94%, var(--tm-primary-color) 6%);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
            animation: tm-pc-rise 0.22s ease both;
        }
        .tm-pc-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
            border-color: color-mix(in srgb, var(--tm-primary-color) 35%, var(--tm-shop-item-border));
        }
        .tm-pc-card.selected {
            border-color: var(--tm-primary-color) !important;
            box-shadow: 0 0 0 1px color-mix(in srgb, var(--tm-primary-color) 40%, transparent), 0 8px 24px rgba(0,0,0,0.16) !important;
        }
        .tm-pc-card.favorite::before {
            content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
            border-radius: 16px 0 0 16px; background: linear-gradient(180deg, #fbbf24, #f59e0b);
        }
        .tm-pc-card--other { flex-direction: row; align-items: stretch; gap: 14px; flex-wrap: wrap; }
        @media (max-width: 720px) { .tm-pc-card--other { flex-direction: column; } }

        .tm-pc-card-top { display: flex; align-items: flex-start; gap: 12px; }
        .tm-pc-grade {
            width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; font-weight: 900; letter-spacing: -0.03em;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .tm-pc-card-main { flex: 1; min-width: 0; }
        .tm-pc-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .tm-pc-model {
            font-size: 15px; font-weight: 800; line-height: 1.25;
            letter-spacing: -0.02em; word-break: break-word;
        }
        .tm-pc-price {
            flex-shrink: 0; padding: 5px 10px; border-radius: 999px;
            font-size: 13px; font-weight: 800; letter-spacing: -0.02em;
            background: color-mix(in srgb, var(--tm-success-color, #22c55e) 16%, transparent);
            border: 1px solid color-mix(in srgb, var(--tm-success-color, #22c55e) 40%, transparent);
            color: var(--tm-success-color, #4ade80);
        }
        .tm-pc-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; }
        .tm-pc-meta-chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700;
            background: color-mix(in srgb, var(--tm-shop-item-border) 35%, transparent);
            border: 1px solid var(--tm-shop-item-border);
            color: var(--tm-shop-item-text, var(--tm-secondary-hover));
        }
        .tm-pc-meta-chip--grade { font-weight: 800; }
        .tm-pc-meta-chip--buyback {
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 18%, transparent);
            border-color: color-mix(in srgb, var(--tm-warning-color) 40%, transparent);
            color: var(--tm-warning-color, #fbbf24);
        }
        .tm-pc-meta-chip--tag { border-color: currentColor; background: transparent; }
        .tm-pc-color-dot {
            width: 9px; height: 9px; border-radius: 50%; display: inline-block; flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.35);
        }
        .tm-pc-barcode {
            font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
            font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
            padding: 4px 8px; border-radius: 8px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 30%, transparent);
            border: 1px solid var(--tm-shop-item-border);
            color: var(--tm-shop-item-text); opacity: 0.9;
        }

        .tm-pc-stores-block {
            flex: 1; min-width: 180px; max-width: 280px;
            padding: 10px 12px; border-radius: 12px;
            background: color-mix(in srgb, var(--tm-primary-color) 6%, var(--tm-shop-item-bg));
            border: 1px dashed color-mix(in srgb, var(--tm-primary-color) 22%, var(--tm-shop-item-border));
        }
        .tm-pc-stores-label {
            font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
            opacity: 0.55; margin-bottom: 6px; color: var(--tm-shop-item-text);
        }
        .tm-pc-stores-row { display: flex; flex-wrap: wrap; gap: 5px; min-height: 22px; }

        .tm-pc-card-footer {
            display: flex; align-items: center; justify-content: space-between; gap: 8px;
            padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
        }
        .tm-pc-actions { display: flex; gap: 4px; margin-left: auto; }
        .tm-pc-action-btn, .tm-phone-search-btn, .tm-phone-copy-imei-btn, .tm-phone-favorite-btn, .tm-os-action-btn {
            width: 34px; height: 34px; border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 90%, transparent);
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            cursor: pointer; font-size: 14px;
            display: inline-flex; align-items: center; justify-content: center;
            transition: transform 0.12s, border-color 0.12s, background 0.12s;
        }
        .tm-pc-action-btn:hover, .tm-phone-search-btn:hover, .tm-phone-copy-imei-btn:hover,
        .tm-phone-favorite-btn:hover, .tm-os-action-btn:hover {
            border-color: var(--tm-primary-color);
            background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg));
            transform: scale(1.06);
        }
        .tm-pc-action-btn.is-fav, .tm-phone-favorite-btn.is-fav { color: var(--tm-warning-color, #fbbf24) !important; }
        .tm-pc-selected-mark {
            position: absolute; top: 10px; right: 10px; width: 22px; height: 22px;
            border-radius: 50%; background: var(--tm-primary-color); color: #fff;
            font-size: 12px; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        .tm-pc-store-chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700;
            white-space: nowrap; line-height: 1.3;
        }
        .tm-pc-store-chip--ok {
            background: color-mix(in srgb, #22c55e 18%, transparent);
            border: 1px solid color-mix(in srgb, #22c55e 45%, transparent);
            color: #4ade80;
        }
        .tm-pc-store-chip--bad {
            background: color-mix(in srgb, #ef4444 14%, transparent);
            border: 1px solid color-mix(in srgb, #ef4444 38%, transparent);
            color: #fca5a5;
        }
        .tm-pc-store-chip--neutral {
            background: color-mix(in srgb, var(--tm-shop-item-border) 28%, transparent);
            border: 1px solid var(--tm-shop-item-border);
            color: var(--tm-shop-item-text); opacity: 0.82;
        }
        .tm-pc-store-loading {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 10px; opacity: 0.5; font-style: italic;
        }
        .tm-pc-store-loading i {
            width: 10px; height: 10px; border-radius: 50%;
            border: 2px solid currentColor; border-top-color: transparent;
            animation: tm-pc-spin 0.7s linear infinite; display: inline-block;
        }

        .tm-pc-empty {
            grid-column: 1 / -1;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 320px; text-align: center; color: var(--tm-shop-item-text); gap: 8px;
        }
        .tm-pc-empty-icon { font-size: 48px; opacity: 0.85; }
        .tm-pc-empty-title { font-size: 15px; font-weight: 700; }
        .tm-pc-empty-sub { font-size: 12px; opacity: 0.65; max-width: 280px; }

        .tm-pc-footer {
            padding: 12px 18px; border-top: 1px solid var(--tm-shop-item-border);
            display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 88%, var(--tm-dark-hover, #111));
            font-size: 12px; color: var(--tm-shop-item-text);
        }
        #tm-phone-statistics { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; opacity: 0.8; }

        #tm-phone-export-menu {
            position: absolute; top: calc(100% + 6px); right: 0;
            background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.22);
            padding: 8px; min-width: 220px; display: none; z-index: 1000;
        }
        #tm-phone-export-menu button {
            width: 100%; text-align: left; margin-bottom: 4px;
            border: 1px solid var(--tm-shop-item-border); background: var(--tm-shop-item-bg);
            color: var(--tm-primary-color); padding: 9px 12px; border-radius: 8px;
            font-size: 12px; cursor: pointer;
        }
        #tm-phone-export-menu button:hover { border-color: var(--tm-primary-color); background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg)); }

        .tm-phone-load-more {
            width: 100%; padding: 12px; margin-top: 8px; border-radius: 12px;
            border: 1px dashed var(--tm-shop-item-border); background: transparent;
            color: var(--tm-primary-color); font-weight: 700; cursor: pointer;
        }
        .tm-phone-load-more:hover { border-color: var(--tm-primary-color); background: color-mix(in srgb, var(--tm-primary-color) 8%, transparent); }

        .tm-phone-context-menu, .tm-phone-tag-submenu {
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,0.35) !important;
            border: 1px solid var(--tm-shop-item-border) !important;
        }

        /* Other-store standalone overlay */
        .tm-other-store-overlay .tm-pc-os-panel {
            width: min(1200px, 96vw); max-height: 92vh;
            border-radius: 20px; overflow: hidden;
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 28%, var(--tm-shop-item-border));
            box-shadow: 0 28px 80px rgba(0,0,0,0.45);
            background: var(--tm-shop-item-bg);
            display: flex; flex-direction: column;
        }
        .tm-pc-os-header {
            padding: 14px 18px; border-bottom: 1px solid var(--tm-shop-item-border);
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            background: linear-gradient(180deg, color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg)), var(--tm-shop-item-bg));
        }
        #tm-os-filter-bar { padding: 12px 16px !important; border-bottom: 1px solid var(--tm-shop-item-border) !important; }
        #tm-other-store-body { flex: 1; overflow-y: auto; padding: 14px 16px !important; }
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
            const cls = allowed ? 'tm-pc-store-chip--ok' : 'tm-pc-store-chip--bad';
            const icon = allowed ? '✓' : '✕';
            return `<span class="tm-pc-store-chip ${cls}">${icon} ${name}</span>`;
        }
        if (!allowed) {
            return `<span class="tm-pc-store-chip tm-pc-store-chip--bad">✕ ${name}</span>`;
        }
        return `<span class="tm-pc-store-chip tm-pc-store-chip--neutral">${name}</span>`;
    }

    function buildStoreChipsHtml(stores, isBuyback, filterFn, renderChipFn) {
        const filtered = filterFn(stores);
        if (!filtered.length) return '';
        return filtered.map((s) => renderChipFn(s.name, isBuyback)).join('');
    }

    function buildEmptyState(icon, title, subtitle = '') {
        return `
            <div class="tm-pc-empty">
                <div class="tm-pc-empty-icon">${icon}</div>
                <div class="tm-pc-empty-title">${esc(title)}</div>
                ${subtitle ? `<div class="tm-pc-empty-sub">${esc(subtitle)}</div>` : ''}
            </div>`;
    }

    function buildPhoneCard(item, ctx, options = {}) {
        const {
            variant = 'mine',
            isSelected = false,
            isFavorite = false,
            storesHtml = '',
            storesPending = false,
            animationDelay = 0,
            noBuybackStore = false,
        } = options;

        const T = ctx.T;
        const phoneColor = ctx.extractColor(item.name || item.model);
        const colorHex = ctx.getColorHex(phoneColor);
        const displayModel = ctx.extractBaseModel(item.model) || item.model || item.name;
        const storage = ctx.extractGB(item.name || item.model);
        const grade = item.grade || '';
        const gradeColor = ctx.getPhoneGradeColor(grade);
        const outline = ctx.getPhoneCatalogOutlineStyle(phoneColor, colorHex);
        const titleStyle = ctx.getPhoneModelTitleStyle(phoneColor, colorHex);
        const tags = ctx.getPhoneTags(item.barcode);
        const cardClass = [
            'tm-pc-card',
            'tm-phone-item',
            variant === 'other' ? 'tm-pc-card--other' : '',
            isSelected ? 'selected' : '',
            isFavorite ? 'favorite' : '',
        ].filter(Boolean).join(' ');

        const tagHtml = tags.map((tag) => {
            const color = ctx.getTagColor(tag);
            return `<span class="tm-pc-meta-chip tm-pc-meta-chip--tag" style="color:${esc(color)};border-color:${esc(color)}">#${esc(ctx.getTagDisplayName(tag))}</span>`;
        }).join('');

        const colorDot = colorHex
            ? `<span class="tm-pc-color-dot" style="background:${esc(colorHex)};"></span>`
            : '';

        const storesBlock = variant === 'other' ? `
            <div class="tm-pc-stores-block tm-other-store-stores" data-product="${esc(item.barcode)}">
                <div class="tm-pc-stores-label">Διαθέσιμο σε</div>
                <div class="tm-pc-stores-row">
                    ${storesPending
        ? '<span class="tm-pc-store-loading"><i></i> Φόρτωση…</span>'
        : (storesHtml || '<span style="opacity:0.4;font-size:10px;">—</span>')}
                </div>
            </div>` : '';

        const actions = `
            <div class="tm-pc-actions">
                <button type="button" class="tm-pc-action-btn tm-phone-search-btn" data-barcode="${esc(item.barcode)}" title="${esc(T['Search barcode in system'])}">🔍</button>
                ${item.imei ? `<button type="button" class="tm-pc-action-btn tm-phone-copy-imei-btn" data-imei="${esc(item.imei)}" title="${esc(T['Copy IMEI'])}">🔢</button>` : ''}
                <button type="button" class="tm-pc-action-btn tm-phone-favorite-btn ${isFavorite ? 'is-fav' : ''}" data-barcode="${esc(item.barcode)}"
                    title="${esc(isFavorite ? T['Remove from favorites'] : T['Add to favorites'])}">${isFavorite ? '⭐' : '☆'}</button>
            </div>`;

        return `
            <div class="${cardClass}"
                style="animation-delay:${animationDelay}ms;border-color:${esc(gradeColor)}33;"
                data-barcode="${esc(item.barcode)}"
                data-name="${esc(item.name)}"
                data-imei="${esc(item.imei || '')}">
                ${isSelected ? '<span class="tm-pc-selected-mark" aria-hidden="true">✓</span>' : ''}
                <div class="tm-pc-card-top">
                    <div class="tm-pc-grade" style="${ctx.getPhoneGradeCircleStyle(grade)}">${esc(grade || '?')}</div>
                    <div class="tm-pc-card-main">
                        <div class="tm-pc-card-head">
                            <div style="min-width:0;flex:1;">
                                ${noBuybackStore ? `<span title="${esc(ctx.t('No buyback store'))}" style="margin-right:4px;">🚫</span>` : ''}
                                <div class="tm-pc-model" style="${titleStyle}" title="${esc(displayModel)}">${esc(displayModel)}</div>
                            </div>
                            ${item.retailPrice ? `<span class="tm-pc-price">${esc(item.retailPrice)}€</span>` : ''}
                        </div>
                        <div class="tm-pc-meta">
                            ${grade ? `<span class="tm-pc-meta-chip tm-pc-meta-chip--grade" style="${ctx.getPhoneGradeDisplayStyle(grade)}">Grade ${esc(grade)}</span>` : ''}
                            ${storage ? `<span class="tm-pc-meta-chip">${esc(storage)}</span>` : ''}
                            ${phoneColor ? `<span class="tm-pc-meta-chip">${colorDot}${esc(phoneColor)}</span>` : ''}
                            ${item.isBuyback ? '<span class="tm-pc-meta-chip tm-pc-meta-chip--buyback">Buyback</span>' : ''}
                            ${tagHtml}
                        </div>
                        <div style="margin-top:8px;">
                            <span class="tm-pc-barcode" title="${esc(item.barcode)}">${esc(item.barcode)}</span>
                        </div>
                    </div>
                </div>
                ${storesBlock}
                <div class="tm-pc-card-footer">${actions}</div>
            </div>`;
    }

    function buildModalHTML(T) {
        return `
        <style>${PHONE_CATALOG_UI_STYLES}</style>
        <div class="tm-phone-modal-content tm-pc-shell" style="display:flex;flex-direction:column;">
            <header class="tm-pc-header">
                <div class="tm-pc-header-left">
                    <div class="tm-pc-header-icon">📱</div>
                    <div>
                        <h2 class="tm-pc-title">${esc(T['Phone Catalog'])}</h2>
                        <p class="tm-pc-subtitle">Αναζήτηση &amp; διαθεσιμότητα συσκευών</p>
                    </div>
                    <div class="tm-pc-view-switch" role="tablist">
                        <button type="button" class="tm-pc-view-tab active" id="tm-pc-view-mine" data-view="mine">🏠 Το κατάστημά μου</button>
                        <button type="button" class="tm-pc-view-tab" id="tm-pc-view-other" data-view="other">🏬 Άλλα καταστήματα</button>
                    </div>
                </div>
                <div class="tm-pc-header-actions">
                    <button type="button" id="tm-phone-refresh-btn" class="tm-pc-icon-btn tm-phone-toolbar-btn" title="${esc(T['Refresh (Ctrl+R)'])}">🔄</button>
                    <button type="button" id="tm-phone-view-toggle" class="tm-pc-icon-btn tm-phone-toolbar-btn" title="${esc(T['Toggle View'])}">▦</button>
                    <button type="button" id="tm-phone-colors-btn" class="tm-pc-icon-btn tm-phone-toolbar-btn" title="${esc(T['Manage Colors'])}">🎨</button>
                    <button type="button" id="tm-phone-tags-btn" class="tm-pc-icon-btn tm-phone-toolbar-btn" title="${esc(T['Manage Tags'])}">🏷️</button>
                    <button type="button" id="tm-phone-stores-btn" class="tm-pc-icon-btn tm-phone-toolbar-btn" title="${esc(T['Manage Stores'])}">🏪</button>
                    <button type="button" id="tm-phone-other-store-toggle" class="tm-pc-icon-btn" hidden aria-hidden="true"></button>
                    <button type="button" class="tm-modal-close tm-pc-icon-btn" aria-label="Κλείσιμο">&times;</button>
                </div>
            </header>

            <div class="tm-pc-toolbar" data-tm-phone-toolbar>
                <div class="tm-pc-search-row">
                    <label class="tm-pc-search-wrap">
                        <span>🔍</span>
                        <input type="search" id="tm-phone-search-input" placeholder="${esc(T['Search...'])}" autocomplete="off">
                    </label>
                    <label class="tm-pc-regex-label">
                        <input type="checkbox" id="tm-phone-regex-toggle"> ${esc(T['Regex'])}
                    </label>
                    <button type="button" id="tm-phone-favorites-btn" class="tm-pc-chip-btn" title="${esc(T['Show Favorites'])}">⭐ ${esc(T['Fav'])}</button>
                </div>
                <div class="tm-pc-filters-row">
                    <select id="tm-phone-filter-grade" class="tm-pc-select"><option value="">${esc(T['All Grades'])}</option></select>
                    <select id="tm-phone-filter-model" class="tm-pc-select"><option value="">${esc(T['All Models'])}</option></select>
                    <select id="tm-phone-filter-gb" class="tm-pc-select"><option value="">${esc(T['All Storage'])}</option></select>
                    <select id="tm-phone-filter-color" class="tm-pc-select"><option value="">${esc(T['All Colors'])}</option></select>
                    <select id="tm-phone-filter-tag" class="tm-pc-select"><option value="">${esc(T['All Tags'])}</option></select>
                    <select id="tm-phone-sort-by" class="tm-pc-select">
                        <option value="model">${esc(T['Sort by Model'])}</option>
                        <option value="grade">${esc(T['Sort by Grade'])}</option>
                        <option value="gb">${esc(T['Sort by Storage'])}</option>
                        <option value="color">${esc(T['Sort by Color'])}</option>
                        <option value="imei">${esc(T['Sort by IMEI'])}</option>
                    </select>
                    <button type="button" id="tm-phone-sort-dir" class="tm-pc-tool-btn" title="${esc(T['Toggle Sort Direction'])}">↑</button>
                    <button type="button" id="tm-phone-clear-filters" class="tm-pc-tool-btn" title="${esc(T['Clear All Filters'])}">🗑️ ${esc(T['Clear'])}</button>
                    <div style="position:relative;display:inline-block;">
                        <button type="button" id="tm-phone-export-btn" class="tm-pc-tool-btn">📤 ${esc(T['Export'] || 'Export')}</button>
                        <div id="tm-phone-export-menu">
                            <button type="button" id="tm-phone-export-clipboard">📋 ${esc(T['Copy to Clipboard'])}</button>
                            <button type="button" id="tm-phone-export-csv">📊 ${esc(T['Export to CSV'])}</button>
                            <button type="button" id="tm-phone-export-selected" style="display:none;">📋 ${esc(T['Export Selected'])}</button>
                            <div style="border-top:1px solid var(--tm-shop-item-border);padding-top:8px;margin-top:6px;">
                                <label style="display:flex;align-items:center;gap:8px;font-size:11px;padding:4px;cursor:pointer;">
                                    <input type="checkbox" id="tm-phone-export-original-title">
                                    ${esc(T['Include Original Title'])}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button type="button" id="tm-phone-select-all" class="tm-pc-tool-btn" style="display:none;">☑ ${esc(T['Select All'])}</button>
                </div>
            </div>

            <div id="tm-phone-list-container" class="tm-pc-grid">
                ${buildEmptyState('⏳', 'Φόρτωση συσκευών…', 'Παρακαλώ περιμένετε')}
            </div>
            <div id="tm-other-store-container" style="display:none;flex:1;overflow:hidden;flex-direction:column;">
                <div id="tm-other-store-content" class="tm-pc-os-list">
                    ${buildEmptyState('🏬', 'Φόρτωση άλλων καταστημάτων…')}
                </div>
            </div>

            <footer class="tm-pc-footer" id="tm-phone-count">
                <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                    <span id="tm-phone-count-text">0 phones found</span>
                    <div id="tm-phone-statistics"></div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span id="tm-phone-last-updated" style="opacity:0.7;font-size:11px;"></span>
                    <span id="tm-phone-cache-warning" style="display:none;color:var(--tm-warning-color);font-weight:700;font-size:11px;"></span>
                </div>
            </footer>
        </div>
        <div class="tm-phone-context-menu">
            <div class="tm-phone-context-menu-item" data-action="add-tag">🏷️ ${esc(T['Add Tag'])}</div>
            <div class="tm-phone-context-menu-item" data-action="remove-tag">🗑️ ${esc(T['Remove Tag'])}</div>
        </div>`;
    }

    function buildOtherStoresModalHTML(T) {
        return `
        <style>${PHONE_CATALOG_UI_STYLES}</style>
        <div class="tm-pc-os-panel">
            <header class="tm-pc-os-header">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                    <span style="font-size:22px;">🏬</span>
                    <div>
                        <div style="font-weight:800;font-size:15px;color:var(--tm-shop-item-text);letter-spacing:-0.02em;">Άλλα καταστήματα</div>
                        <div style="font-size:11px;opacity:0.6;">Διαθεσιμότητα σε όλο το δίκτυο</div>
                    </div>
                    <button type="button" id="tm-os-back-btn" class="tm-pc-chip-btn" style="display:none;margin-left:8px;">← Μοντέλα</button>
                </div>
                <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
                    <span id="tm-other-store-count" style="font-size:11px;opacity:0.75;"></span>
                    <button type="button" id="tm-other-store-refresh-btn" class="tm-pc-icon-btn" title="Ανανέωση">🔄</button>
                    <button type="button" id="tm-other-store-close" class="tm-modal-close tm-pc-icon-btn" aria-label="Κλείσιμο">&times;</button>
                </div>
            </header>
            <div id="tm-os-filter-bar" style="display:none;">
                <div class="tm-pc-filters-row" style="padding:12px 16px;">
                    <select id="tm-other-store-filter-grade" class="tm-pc-select"><option value="">${esc(T['All Grades'])}</option></select>
                    <select id="tm-other-store-filter-model" class="tm-pc-select"><option value="">${esc(T['All Models'])}</option></select>
                    <select id="tm-other-store-filter-gb" class="tm-pc-select"><option value="">${esc(T['All Storage'])}</option></select>
                    <select id="tm-other-store-filter-color" class="tm-pc-select"><option value="">${esc(T['All Colors'])}</option></select>
                    <select id="tm-other-store-filter-store" class="tm-pc-select"><option value="">Όλα τα καταστήματα</option></select>
                    <select id="tm-other-store-sort" class="tm-pc-select">
                        <option value="model-asc">📱 Μοντέλο (A-Z)</option>
                        <option value="model-desc">📱 Μοντέλο (Z-A)</option>
                        <option value="price-asc">💰 Τιμή (↑)</option>
                        <option value="price-desc">💰 Τιμή (↓)</option>
                        <option value="grade-asc">⭐ Βαθμίδα (A+-A)</option>
                        <option value="grade-desc">⭐ Βαθμίδα (A-A+)</option>
                        <option value="storage-asc">💾 Χωρητικότητα (↑)</option>
                        <option value="storage-desc">💾 Χωρητικότητα (↓)</option>
                    </select>
                    <button type="button" id="tm-other-store-clear-filters" class="tm-pc-tool-btn">🗑️ ${esc(T['Clear'])}</button>
                </div>
            </div>
            <div id="tm-other-store-modal-body">
                ${buildEmptyState('⏳', 'Φόρτωση διαθεσιμότητας…')}
            </div>
        </div>`;
    }

    function buildModelPickerHTML(models, totalPhones) {
        const options = models.map(([model, data]) =>
            `<option value="${esc(model)}">${esc(model)} (${data.count}${data.buybackCount > 0 ? ` · ${data.buybackCount} buyback` : ''})</option>`
        ).join('');
        return `
            <div class="tm-pc-empty" style="min-height:280px;">
                <div class="tm-pc-empty-icon">📱</div>
                <div class="tm-pc-empty-title">Επιλέξτε μοντέλο</div>
                <div class="tm-pc-empty-sub">${totalPhones} συσκευές σε ${models.length} μοντέλα</div>
                <div style="position:relative;width:100%;max-width:360px;margin-top:8px;">
                    <select id="tm-os-model-picker-select" class="tm-pc-select" style="width:100%;padding:12px 36px 12px 14px!important;font-size:13px!important;">
                        <option value="">— Επιλογή μοντέλου —</option>
                        ${options}
                    </select>
                </div>
            </div>`;
    }

    window.PhoneCatalogUI = {
        STYLES: PHONE_CATALOG_UI_STYLES,
        esc,
        buildModalHTML,
        buildPhoneCard,
        buildStoreChipHtml,
        buildStoreChipsHtml,
        buildEmptyState,
        buildOtherStoresModalHTML,
        buildModelPickerHTML,
    };
})();
