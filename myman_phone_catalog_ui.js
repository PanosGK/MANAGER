// ==UserScript==
// @name         MyManager Phone Catalog UI
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Store locator UI — model picker → store availability board.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ICON = {
        search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
        refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>',
        store: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>',
        chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>',
        pin: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
        settings: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
        palette: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 0 0 10-10c0-2-1-4-2.5-5.5"/></svg>',
        tag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
        phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        export: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    };

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function highlightMatch(text, query) {
        if (!query) return esc(text);
        const lower = String(text).toLowerCase();
        const q = String(query).toLowerCase();
        const idx = lower.indexOf(q);
        if (idx < 0) return esc(text);
        return `${esc(text.slice(0, idx))}<mark class="tm-sl-hl">${esc(text.slice(idx, idx + q.length))}</mark>${esc(text.slice(idx + q.length))}`;
    }

    function colorSwatchHTML(colorName, hexMap) {
        const hex = hexMap?.[String(colorName || '').toUpperCase()] || '#808080';
        return `<span class="tm-sl-color-swatch" style="background:${esc(hex)}" title="${esc(colorName)}" aria-hidden="true"></span>`;
    }

    function gradeChipHTML(grade, count, getGradeStyle) {
        const style = getGradeStyle ? getGradeStyle(grade) : '';
        return `<span class="tm-sl-grade-chip" style="${style}">${esc(grade)}:${count}</span>`;
    }

    function getModelHeatClass(data) {
        const stores = data.storeCount || 0;
        const my = data.myCount || 0;
        if (my > 0 && stores <= 1) return 'tm-sl-heat--local';
        if (stores >= 5) return 'tm-sl-heat--high';
        if (stores === 1) return 'tm-sl-heat--low';
        return 'tm-sl-heat--mid';
    }

    function getStoreSignalClass(qty) {
        const n = parseInt(qty, 10) || 0;
        if (n <= 1) return 'tm-sl-signal--fragile';
        if (n <= 3) return 'tm-sl-signal--moderate';
        return 'tm-sl-signal--strong';
    }

    function guessStoreRegion(name) {
        const n = String(name || '').toUpperCase();
        if (/ΘΕΣΣΑΛΟΝΙΚ|THESS|SALON/i.test(n)) return 'Θεσσαλονίκη';
        if (/ΑΘΗΝ|ΑΤΤΙΚ|ΠΕΙΡΑΙ|ΜΑΡΟΥΣΙ|ΚΑΛΛΙΘΕΑ|ΓΛΥΦΑΔ|ΠΕΡΙΣΤΕΡ|ΧΑΛΑΝΔΡ|ΝΕΑ ΣΜΥΡΝ/i.test(n)) return 'Αττική';
        if (/ΗΡΑΚΛΕΙΟ|ΚΡΗΤ|ΧΑΝΙΑ|ΡΕΘΥΜ/i.test(n)) return 'Κρήτη';
        if (/ΠΑΤΡ|ΑΧΑΙ|ΠΥΡΓ/i.test(n)) return 'Δυτ. Ελλάδα';
        if (/ΛΑΡΙΣ|ΒΟΛΟ|ΘΕΣΣΑΛΙ/i.test(n)) return 'Θεσσαλία';
        if (/ΙΩΑΝΝΙΝ|ΗΠΕΙΡ/i.test(n)) return 'Ήπειρος';
        if (/ΚΑΒΑΛ|ΚΟΜΟΤΗΝ|ΞΑΝΘ|ΑΛΕΞΑΝΔΡΟΥΠΟΛ/i.test(n)) return 'Βόρεια Ελλάδα';
        return 'Άλλες περιοχές';
    }

    function groupStoresByRegion(storeRows) {
        const groups = new Map();
        storeRows.forEach((store) => {
            const region = guessStoreRegion(store.name);
            if (!groups.has(region)) groups.set(region, []);
            groups.get(region).push(store);
        });
        const order = ['Αττική', 'Θεσσαλονίκη', 'Κρήτη', 'Θεσσαλία', 'Δυτ. Ελλάδα', 'Βόρεια Ελλάδα', 'Ήπειρος', 'Άλλες περιοχές'];
        return [...groups.entries()].sort((a, b) => {
            const ia = order.indexOf(a[0]);
            const ib = order.indexOf(b[0]);
            return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        });
    }

    function buildAvailabilityBar(data) {
        const total = Math.max(data.totalUnits || 0, 1);
        const my = data.myCount || 0;
        const network = Math.max(total - my, 0);
        const myPct = Math.round((my / total) * 100);
        const netPct = 100 - myPct;
        return `<div class="tm-sl-avail-bar" title="${my} στο δικό σας · ${network} στο δίκτυο">
            ${my > 0 ? `<span class="tm-sl-avail-seg tm-sl-avail-seg--mine" style="width:${myPct}%"></span>` : ''}
            ${network > 0 ? `<span class="tm-sl-avail-seg tm-sl-avail-seg--net" style="width:${netPct}%"></span>` : ''}
        </div>`;
    }

    const STYLES = `
        @keyframes tm-sl-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tm-sl-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes tm-sl-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes tm-sl-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        .tm-sl-overlay {
            animation: tm-sl-in 0.2s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            background: var(--tm-overlay-dim, rgba(0,0,0,0.75)) !important;
        }
        .tm-sl-shell {
            animation: tm-sl-rise 0.28s cubic-bezier(0.22, 1, 0.36, 1);
            width: min(920px, 96vw) !important;
            max-width: 96vw !important;
            height: min(88vh, 820px) !important;
            max-height: 88vh !important;
            border-radius: 16px !important;
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, var(--tm-primary-color)) !important;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
            backdrop-filter: var(--lg-blur-chrome, blur(16px));
            -webkit-backdrop-filter: var(--lg-blur-chrome, blur(16px));
            box-shadow: 0 24px 64px var(--tm-shadow-color, rgba(0,0,0,0.4)),
                0 0 0 1px color-mix(in srgb, var(--tm-primary-color) 8%, transparent) inset !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
        }

        .tm-sl-breadcrumb {
            display: flex; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 600; margin-bottom: 6px;
            color: var(--tm-muted-text, var(--tm-secondary-color));
        }
        .tm-sl-breadcrumb-sep { opacity: 0.45; }
        .tm-sl-breadcrumb-current { color: var(--tm-primary-color); }

        .tm-sl-view-tabs {
            display: flex;
            gap: 6px;
            margin-top: 12px;
            padding: 4px;
            border-radius: 12px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 35%, transparent);
            border: 1px solid var(--tm-shop-item-border);
        }
        .tm-sl-view-tab {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--tm-shop-item-text);
            font-size: 12px;
            font-weight: 700;
            padding: 9px 12px;
            border-radius: 9px;
            cursor: pointer;
            transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .tm-sl-view-tab:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 8%, transparent);
        }
        .tm-sl-view-tab.is-active {
            background: var(--tm-shop-item-bg);
            color: var(--tm-primary-color);
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .tm-sl-view-tab:focus-visible {
            outline: 2px solid var(--tm-primary-color);
            outline-offset: 2px;
        }

        .tm-sl-header {
            padding: 18px 20px 14px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            flex-shrink: 0;
            background: linear-gradient(135deg, color-mix(in srgb, var(--tm-primary-color) 12%, transparent), transparent 70%);
        }
        .tm-sl-header-row {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .tm-sl-title-block { min-width: 0; flex: 1; }
        .tm-sl-title {
            margin: 0; font-size: 1.25rem; font-weight: 800; line-height: 1.2;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
        }
        .tm-sl-subtitle {
            margin: 4px 0 0; font-size: 12px;
            color: var(--tm-muted-text, var(--tm-secondary-color));
        }
        .tm-sl-header-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }
        .tm-sl-settings-wrap { position: relative; }
        .tm-sl-settings-menu, .tm-sl-export-menu {
            position: absolute; top: calc(100% + 6px); right: 0;
            background: var(--tm-shop-item-bg);
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            padding: 6px; min-width: 210px; z-index: 30;
        }
        .tm-sl-settings-menu button, .tm-sl-export-menu button {
            width: 100%; text-align: left; border: none; background: transparent;
            color: var(--tm-shop-item-text); padding: 9px 12px; border-radius: 8px;
            font-size: 12px; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; gap: 8px;
        }
        .tm-sl-settings-menu button:hover, .tm-sl-export-menu button:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
            color: var(--tm-primary-color);
        }
        .tm-sl-export-menu label {
            display: flex; align-items: center; gap: 8px;
            padding: 8px 12px; font-size: 11px; cursor: pointer;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 12px; border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-input-bg, var(--tm-shop-item-bg));
            color: var(--tm-shop-item-text);
            font-size: 12px; font-weight: 600; cursor: pointer;
            transition: border-color 0.15s, background 0.15s;
        }
        .tm-sl-btn:hover { border-color: var(--tm-primary-color); background: var(--tm-shop-item-hover-bg); }
        .tm-sl-btn:focus-visible { outline: 2px solid var(--tm-primary-color); outline-offset: 2px; }
        .tm-sl-btn--icon { padding: 8px 10px; }
        .tm-sl-btn--back { margin-right: 4px; }

        .tm-sl-toolbar {
            padding: 12px 20px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg));
            flex-shrink: 0;
        }
        .tm-sl-toolbar-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .tm-sl-toolbar-row + .tm-sl-toolbar-row { margin-top: 10px; }
        .tm-sl-search-wrap {
            position: relative; display: flex; align-items: center; flex: 1; min-width: 180px;
        }
        .tm-sl-search-icon {
            position: absolute; left: 12px; opacity: 0.45; pointer-events: none; display: flex;
        }
        .tm-sl-search {
            width: 100%; box-sizing: border-box;
            height: 42px; padding: 0 14px 0 38px;
            border-radius: 10px;
            border: 1px solid var(--tm-input-border, var(--tm-shop-item-border));
            background: var(--tm-input-bg, #fff);
            color: var(--tm-input-text, #212529);
            font-size: 14px; outline: none;
        }
        .tm-sl-search:focus {
            border-color: var(--tm-primary-color);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--tm-primary-color) 15%, transparent);
        }

        .tm-sl-sort-pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .tm-sl-sort-pill {
            padding: 6px 10px; border-radius: 999px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 10px; font-weight: 700; cursor: pointer;
            transition: all 0.12s;
        }
        .tm-sl-sort-pill:hover { border-color: var(--tm-primary-color); }
        .tm-sl-sort-pill.is-active {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg));
            border-color: var(--tm-primary-color);
            color: var(--tm-primary-color);
        }
        .tm-sl-sort-pill:focus-visible { outline: 2px solid var(--tm-primary-color); outline-offset: 2px; }

        .tm-sl-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tm-sl-chip {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 12px; border-radius: 999px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 11px; font-weight: 700; cursor: pointer;
            transition: all 0.12s;
        }
        .tm-sl-chip:hover { border-color: var(--tm-primary-color); }
        .tm-sl-chip.is-active {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg));
            border-color: var(--tm-primary-color);
            color: var(--tm-primary-color);
        }
        .tm-sl-chip:focus-visible { outline: 2px solid var(--tm-primary-color); outline-offset: 2px; }
        .tm-sl-chip-grade {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 18px; height: 18px; padding: 0 4px;
            border-radius: 999px; font-size: 9px; font-weight: 800;
        }
        .tm-sl-chip-count { opacity: 0.65; font-weight: 600; font-size: 10px; }

        .tm-sl-color-swatch {
            width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 60%, #000);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
        }

        .tm-sl-body {
            flex: 1; overflow-y: auto; padding: 16px 20px; min-height: 0;
        }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-body { padding: 10px 14px; }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-model-card { padding: 10px 12px; }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-store-head { padding: 8px 10px; }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-phone-card { padding: 9px 11px; }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-spec-pill { font-size: 10px; padding: 3px 7px; }

        .tm-sl-model-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 12px;
        }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-model-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 8px;
        }

        .tm-sl-model-card {
            position: relative;
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            padding: 14px 16px;
            background: var(--tm-shop-item-bg);
            cursor: pointer;
            transition: border-color 0.15s, transform 0.12s, box-shadow 0.15s;
            animation: tm-sl-rise 0.35s cubic-bezier(0.22, 1, 0.36, 1) backwards;
            animation-delay: calc(var(--i, 0) * 40ms);
        }
        .tm-sl-model-card:hover {
            border-color: var(--tm-primary-color);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px color-mix(in srgb, var(--tm-shadow-color, #000) 25%, transparent);
        }
        .tm-sl-model-card:focus-visible {
            outline: 2px solid var(--tm-primary-color);
            outline-offset: 2px;
        }
        .tm-sl-model-card.tm-sl-heat--high { border-left: 3px solid var(--tm-success-color, #22c55e); }
        .tm-sl-model-card.tm-sl-heat--low { border-left: 3px solid var(--tm-warning-color, #f59e0b); }
        .tm-sl-model-card.tm-sl-heat--local { border-left: 3px solid var(--tm-info-color, #0ea5e9); }
        .tm-sl-model-card.tm-sl-heat--mid { border-left: 3px solid var(--tm-shop-item-border); }

        .tm-sl-mine-badge {
            position: absolute; top: 8px; right: 8px;
            display: inline-flex; align-items: center; gap: 3px;
            padding: 3px 7px; border-radius: 999px;
            font-size: 9px; font-weight: 800;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 18%, var(--tm-shop-item-bg));
            color: var(--tm-info-color, #0ea5e9);
            border: 1px solid color-mix(in srgb, var(--tm-info-color, #0ea5e9) 35%, transparent);
        }

        .tm-sl-model-name {
            font-size: 14px; font-weight: 800; line-height: 1.25;
            margin-bottom: 8px; padding-right: 56px;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-hl {
            background: color-mix(in srgb, var(--tm-primary-color) 30%, transparent);
            color: inherit; border-radius: 2px; padding: 0 1px;
        }
        .tm-sl-model-meta {
            font-size: 12px; font-weight: 600;
            color: var(--tm-info-color, #0ea5e9);
            margin-bottom: 6px;
        }
        .tm-sl-model-stores { font-size: 11px; opacity: 0.75; margin-bottom: 8px; }
        .tm-sl-model-store-list {
            display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;
        }
        .tm-sl-model-store-chip {
            font-size: 9px; font-weight: 700; padding: 3px 7px; border-radius: 999px;
            border: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 10%, var(--tm-shop-item-bg));
            color: var(--tm-shop-item-text);
            max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tm-sl-model-store-chip--mine {
            background: color-mix(in srgb, var(--tm-success-color, #22c55e) 12%, var(--tm-shop-item-bg));
            border-color: color-mix(in srgb, var(--tm-success-color, #22c55e) 35%, transparent);
        }
        .tm-sl-model-store-more { font-size: 9px; opacity: 0.6; align-self: center; }

        .tm-sl-avail-bar {
            display: flex; height: 4px; border-radius: 999px; overflow: hidden;
            margin-bottom: 8px; background: color-mix(in srgb, var(--tm-shop-item-border) 40%, transparent);
        }
        .tm-sl-avail-seg { height: 100%; min-width: 2px; transition: width 0.2s; }
        .tm-sl-avail-seg--mine { background: var(--tm-success-color, #22c55e); }
        .tm-sl-avail-seg--net { background: var(--tm-info-color, #0ea5e9); }

        .tm-sl-grade-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .tm-sl-grade-chip {
            font-size: 10px; font-weight: 700; padding: 2px 6px;
            border-radius: 4px;
        }

        .tm-sl-mine-banner {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 16px; border-radius: 12px; margin-bottom: 16px;
            border: 1px solid var(--tm-shop-item-border);
        }
        .tm-sl-mine-banner--yes {
            background: color-mix(in srgb, var(--tm-success-color, #22c55e) 12%, var(--tm-shop-item-bg));
            border-color: color-mix(in srgb, var(--tm-success-color, #22c55e) 35%, var(--tm-shop-item-border));
        }
        .tm-sl-mine-banner--no {
            background: color-mix(in srgb, var(--tm-shop-item-border) 20%, var(--tm-shop-item-bg));
            opacity: 0.9;
        }
        .tm-sl-mine-icon { font-size: 22px; line-height: 1; flex-shrink: 0; }
        .tm-sl-mine-text { font-size: 13px; font-weight: 700; }
        .tm-sl-mine-detail { font-size: 11px; opacity: 0.8; margin-top: 2px; }

        .tm-sl-region { margin-bottom: 14px; }
        .tm-sl-region-title {
            font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
            opacity: 0.55; margin: 0 0 8px 4px;
        }

        .tm-sl-store-list { display: flex; flex-direction: column; gap: 8px; }
        .tm-sl-store-row {
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            background: var(--tm-shop-item-bg);
            overflow: hidden;
            border-left-width: 3px;
        }
        .tm-sl-store-row.tm-sl-signal--fragile { border-left-color: var(--tm-warning-color, #f59e0b); }
        .tm-sl-store-row.tm-sl-signal--moderate { border-left-color: var(--tm-info-color, #0ea5e9); }
        .tm-sl-store-row.tm-sl-signal--strong { border-left-color: var(--tm-success-color, #22c55e); }
        .tm-sl-store-row.is-mine {
            border-color: color-mix(in srgb, var(--tm-primary-color) 40%, var(--tm-shop-item-border));
        }
        .tm-sl-store-head {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 14px; cursor: pointer;
            transition: background 0.12s;
        }
        .tm-sl-store-head:hover { background: var(--tm-shop-item-hover-bg); }
        .tm-sl-store-head:focus-visible { outline: 2px solid var(--tm-primary-color); outline-offset: -2px; }
        .tm-sl-store-icon { opacity: 0.7; flex-shrink: 0; display: flex; }
        .tm-sl-store-name { flex: 1; font-size: 13px; font-weight: 800; min-width: 0; }
        .tm-sl-store-qty {
            font-size: 11px; font-weight: 700; padding: 4px 8px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 14%, transparent);
            color: var(--tm-info-color, #0ea5e9);
            flex-shrink: 0;
        }
        .tm-sl-store-chevron { opacity: 0.4; flex-shrink: 0; transition: transform 0.15s; }
        .tm-sl-store-row.is-open .tm-sl-store-chevron { transform: rotate(90deg); }
        .tm-sl-store-preview {
            font-size: 11px; opacity: 0.7; padding: 0 14px 10px 40px;
            line-height: 1.4;
        }
        .tm-sl-store-units {
            max-height: 0; overflow: hidden; opacity: 0;
            border-top: 1px dashed transparent;
            padding: 0 10px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 8%, var(--tm-shop-item-bg));
            transition: max-height 0.28s ease, opacity 0.2s ease, padding 0.2s ease, border-color 0.2s;
        }
        .tm-sl-store-row.is-open .tm-sl-store-units {
            max-height: 1200px; opacity: 1;
            border-top-color: var(--tm-shop-item-border);
            padding: 10px 10px 12px;
            display: flex; flex-direction: column; gap: 8px;
        }

        .tm-sl-phone-card {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 10px 12px;
            align-items: stretch;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            box-shadow: 0 1px 0 color-mix(in srgb, var(--tm-shop-item-border) 40%, transparent);
            border-left: 4px solid var(--tm-sl-grade-accent, var(--tm-shop-item-border));
            transition: border-color 0.15s, box-shadow 0.15s, transform 0.12s;
        }
        .tm-sl-phone-card:hover {
            border-color: color-mix(in srgb, var(--tm-primary-color) 35%, var(--tm-shop-item-border));
            box-shadow: 0 4px 14px color-mix(in srgb, var(--tm-primary-color) 8%, transparent);
        }
        .tm-sl-phone-card--bb {
            background: linear-gradient(135deg,
                color-mix(in srgb, var(--tm-warning-color, #f59e0b) 6%, var(--tm-shop-item-bg)),
                var(--tm-shop-item-bg) 55%);
        }
        .tm-sl-phone-card--blocked {
            border-left-color: #dc2626;
            background: linear-gradient(135deg,
                color-mix(in srgb, #dc2626 5%, var(--tm-shop-item-bg)),
                var(--tm-shop-item-bg) 50%);
        }
        .tm-sl-phone-card__body { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
        .tm-sl-phone-card__specs { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .tm-sl-phone-card__meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .tm-sl-phone-card__footer {
            display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
        }
        .tm-sl-phone-card__aside {
            display: flex; flex-direction: column; align-items: flex-end;
            justify-content: space-between; gap: 8px; min-width: 88px;
        }
        .tm-sl-spec-pill {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 4px 9px; border-radius: 999px;
            font-size: 11px; font-weight: 700; line-height: 1.2;
            border: 1px solid transparent;
        }
        .tm-sl-spec-pill--grade {
            min-width: 34px; justify-content: center;
            color: #fff; text-shadow: 0 1px 0 rgba(0,0,0,0.15);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .tm-sl-spec-pill--storage {
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 12%, var(--tm-shop-item-bg));
            color: var(--tm-info-color, #0284c7);
            border-color: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 28%, transparent);
        }
        .tm-sl-spec-pill--color {
            background: color-mix(in srgb, var(--tm-shop-item-border) 18%, var(--tm-shop-item-bg));
            color: var(--tm-shop-item-text);
            border-color: var(--tm-shop-item-border);
        }
        .tm-sl-spec-pill--color .tm-sl-color-swatch {
            width: 12px; height: 12px; border-radius: 50%;
            box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
        }
        .tm-sl-spec-pill--bb {
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 18%, transparent);
            color: var(--tm-warning-color, #d97706);
            border-color: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 35%, transparent);
        }
        .tm-sl-barcode-pill {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 4px 10px; border-radius: 8px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
            background: color-mix(in srgb, var(--tm-shop-item-border) 22%, var(--tm-shop-item-bg));
            color: var(--tm-shop-item-text);
            border: 1px dashed color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
        }
        .tm-sl-barcode-pill__icon { opacity: 0.45; font-size: 10px; }
        .tm-sl-phone-card__price {
            font-size: 15px; font-weight: 800; color: var(--tm-success-color, #16a34a);
            white-space: nowrap; line-height: 1.1;
        }
        .tm-sl-phone-card__price:empty { display: none; }
        .tm-sl-phone-card__actions { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; }
        .tm-sl-unit-btn--primary {
            background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg));
            border-color: color-mix(in srgb, var(--tm-primary-color) 35%, var(--tm-shop-item-border));
            color: var(--tm-primary-color);
        }
        .tm-sl-store-tag {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 8px; border-radius: 999px;
            font-size: 10px; font-weight: 700;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 12%, transparent);
            color: var(--tm-info-color, #0284c7);
            border: 1px solid color-mix(in srgb, var(--tm-info-color, #0ea5e9) 25%, transparent);
        }
        .tm-sl-store-tag--mine {
            background: color-mix(in srgb, var(--tm-success-color, #22c55e) 12%, transparent);
            color: var(--tm-success-color, #16a34a);
            border-color: color-mix(in srgb, var(--tm-success-color, #22c55e) 28%, transparent);
        }
        .tm-sl-store-preview-chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 14px 10px 40px; }
        .tm-sl-preview-pill {
            font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 20%, var(--tm-shop-item-bg));
            opacity: 0.85;
        }

        .tm-sl-unit {
            display: grid;
            grid-template-columns: 36px 1fr auto;
            gap: 8px; align-items: center;
            padding: 8px 10px; border-radius: 8px;
            font-size: 12px;
        }
        .tm-sl-unit:hover { background: var(--tm-shop-item-hover-bg); }
        .tm-sl-unit-grade {
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: 800;
        }
        .tm-sl-unit-spec { font-weight: 600; line-height: 1.35; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
        .tm-sl-unit-barcode {
            font-size: 10px; opacity: 0.65; font-family: ui-monospace, monospace;
        }
        .tm-sl-unit-store {
            display: inline-flex; align-items: center; gap: 4px;
            font-size: 10px; font-weight: 700; margin-top: 3px;
            color: var(--tm-info-color, #0ea5e9);
        }
        .tm-sl-unit-store--mine { color: var(--tm-success-color, #22c55e); }
        .tm-sl-unit-store svg { opacity: 0.85; flex-shrink: 0; }

        .tm-sl-phone-list-section { margin-bottom: 18px; }
        .tm-sl-phone-list-title {
            font-size: 11px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.05em; opacity: 0.6; margin: 0 0 10px 2px;
        }
        .tm-sl-phone-list {
            display: flex; flex-direction: column; gap: 8px;
        }
        .tm-sl-phone-list--mine { padding: 0; border: none; background: transparent; }
        .tm-sl-unit-btn {
            padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg); cursor: pointer;
        }
        .tm-sl-unit-btn:hover { border-color: var(--tm-primary-color); }
        .tm-sl-unit-btn:focus-visible { outline: 2px solid var(--tm-primary-color); outline-offset: 1px; }

        .tm-sl-bb-badge {
            display: inline-block; padding: 1px 5px; border-radius: 4px;
            font-size: 9px; font-weight: 800;
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 20%, transparent);
            color: var(--tm-warning-color, #d97706);
            border: 1px solid color-mix(in srgb, var(--tm-warning-color, #f59e0b) 40%, transparent);
        }

        .tm-sl-store-purchase { display: inline-flex; flex-wrap: wrap; gap: 4px; flex-shrink: 0; }
        .tm-sl-purchase-chip, .tm-sl-purchase-badge {
            display: inline-flex; align-items: center; gap: 3px;
            padding: 3px 7px; border-radius: 6px;
            font-size: 10px; font-weight: 700; line-height: 1.2; white-space: nowrap;
        }
        .tm-sl-purchase-chip--ok, .tm-sl-purchase-badge--ok {
            background: color-mix(in srgb, #16a34a 14%, transparent);
            color: #15803d;
            border: 1px solid color-mix(in srgb, #16a34a 28%, transparent);
        }
        .tm-sl-purchase-chip--no, .tm-sl-purchase-badge--no {
            background: color-mix(in srgb, #dc2626 12%, transparent);
            color: #b91c1c;
            border: 1px solid color-mix(in srgb, #dc2626 26%, transparent);
        }
        .tm-sl-purchase-chip--neutral {
            background: color-mix(in srgb, var(--tm-shop-item-border) 22%, transparent);
            color: var(--tm-shop-item-text);
            border: 1px solid var(--tm-shop-item-border);
        }
        .tm-sl-store-row.tm-sl-store-row--no-purchase {
            border-left-color: var(--tm-warning-color, #f59e0b);
        }

        .tm-sl-skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 12px;
        }
        .tm-sl-skeleton-card, .tm-sl-skeleton-row, .tm-sl-skeleton-line {
            border-radius: 10px;
            background: linear-gradient(90deg,
                color-mix(in srgb, var(--tm-shop-item-border) 25%, var(--tm-shop-item-bg)) 25%,
                color-mix(in srgb, var(--tm-shop-item-border) 45%, var(--tm-shop-item-bg)) 50%,
                color-mix(in srgb, var(--tm-shop-item-border) 25%, var(--tm-shop-item-bg)) 75%);
            background-size: 200% 100%;
            animation: tm-sl-shimmer 1.2s ease-in-out infinite;
        }
        .tm-sl-skeleton-card { height: 110px; }
        .tm-sl-skeleton-stores { display: flex; flex-direction: column; gap: 8px; }
        .tm-sl-skeleton-row { height: 52px; border-radius: 12px; }
        .tm-sl-skeleton-line { height: 14px; margin-bottom: 8px; width: 60%; }

        .tm-sl-empty {
            text-align: center; padding: 48px 24px;
            color: var(--tm-muted-text);
        }
        .tm-sl-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .tm-sl-empty-title { font-size: 16px; font-weight: 800; margin-bottom: 6px; color: var(--tm-shop-item-text); }
        .tm-sl-empty-sub { font-size: 13px; opacity: 0.8; }

        .tm-sl-footer {
            padding: 10px 20px;
            border-top: 1px solid var(--tm-shop-item-border);
            display: flex; justify-content: space-between; align-items: center;
            font-size: 11px; opacity: 0.85; flex-shrink: 0; gap: 12px;
        }
        .tm-sl-footer-right { display: flex; align-items: center; gap: 10px; }
        .tm-sl-density-btn {
            padding: 4px 8px; border-radius: 6px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 10px; font-weight: 700; cursor: pointer;
        }
        .tm-sl-density-btn:hover { border-color: var(--tm-primary-color); }
        .tm-sl-density-btn.is-compact { background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg)); }

        .tm-sl-freshness { display: inline-flex; align-items: center; gap: 6px; }
        .tm-sl-freshness-dot {
            width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .tm-sl-freshness--fresh .tm-sl-freshness-dot { background: var(--tm-success-color, #22c55e); box-shadow: 0 0 6px var(--tm-success-color, #22c55e); }
        .tm-sl-freshness--cached .tm-sl-freshness-dot { background: var(--tm-warning-color, #f59e0b); }
        .tm-sl-freshness--stale .tm-sl-freshness-dot { background: var(--tm-danger-color, #ef4444); }

        .tm-sl-toast {
            position: absolute; bottom: 56px; left: 50%; transform: translateX(-50%);
            padding: 10px 18px; border-radius: 10px;
            background: color-mix(in srgb, var(--tm-dark-hover, #1a1a1a) 92%, transparent);
            color: var(--tm-text-on-dark, #fff);
            font-size: 12px; font-weight: 700;
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
            opacity: 0; pointer-events: none;
            transition: opacity 0.2s;
            z-index: 5;
        }
        .tm-sl-toast.is-visible {
            opacity: 1; pointer-events: auto;
            animation: tm-sl-toast-in 0.2s ease;
        }
    `;

    function buildSkeletonGrid(count = 8) {
        const cards = Array.from({ length: count }, (_, i) =>
            `<div class="tm-sl-skeleton-card" style="--i:${i}"></div>`).join('');
        return `<div class="tm-sl-skeleton-grid">${cards}</div>`;
    }

    function buildSkeletonStores(count = 6) {
        const rows = Array.from({ length: count }, () => '<div class="tm-sl-skeleton-row"></div>').join('');
        return `<div class="tm-sl-skeleton-stores">${rows}</div>`;
    }

    function buildEmptyState(icon, title, sub) {
        return `<div class="tm-sl-empty">
            <div class="tm-sl-empty-icon">${icon}</div>
            <div class="tm-sl-empty-title">${esc(title)}</div>
            ${sub ? `<div class="tm-sl-empty-sub">${esc(sub)}</div>` : ''}
        </div>`;
    }

    function buildBreadcrumb(step, modelName) {
        if (step === 'stores' && modelName) {
            return `<nav class="tm-sl-breadcrumb" aria-label="Διαδρομή">
                <span>Μοντέλα</span>
                <span class="tm-sl-breadcrumb-sep">›</span>
                <span class="tm-sl-breadcrumb-current">${esc(modelName)}</span>
            </nav>`;
        }
        return `<nav class="tm-sl-breadcrumb" aria-label="Διαδρομή">
            <span class="tm-sl-breadcrumb-current">Μοντέλα</span>
        </nav>`;
    }

    function buildShellHTML() {
        return `
        <style>${STYLES}</style>
        <div class="tm-sl-shell" id="tm-sl-shell">
            <header class="tm-sl-header">
                <div id="tm-sl-breadcrumb-wrap">${buildBreadcrumb('models')}</div>
                <div class="tm-sl-header-row">
                    <div class="tm-sl-title-block">
                        <h2 class="tm-sl-title" id="tm-sl-title">Το κατάστημά μου</h2>
                        <p class="tm-sl-subtitle" id="tm-sl-subtitle">Συσκευές που έχετε σε stock</p>
                    </div>
                    <div class="tm-sl-header-actions">
                        <button type="button" id="tm-sl-refresh" class="tm-sl-btn" title="Ανανέωση">${ICON.refresh} Ανανέωση</button>
                        <div class="tm-sl-settings-wrap">
                            <button type="button" id="tm-sl-settings" class="tm-sl-btn tm-sl-btn--icon" title="Ρυθμίσεις" aria-haspopup="true">${ICON.settings}</button>
                            <div id="tm-sl-settings-menu" class="tm-sl-settings-menu" hidden>
                                <button type="button" id="tm-sl-models-btn">${ICON.phone} Διαχείριση Μοντέλων</button>
                                <button type="button" id="tm-sl-colors-btn">${ICON.palette} Διαχείριση Χρωμάτων</button>
                                <button type="button" id="tm-sl-tags-btn">${ICON.tag} Διαχείριση Ετικετών</button>
                                <button type="button" id="tm-sl-stores-btn">${ICON.store} Διαχείριση Καταστημάτων</button>
                                <button type="button" id="tm-sl-export-btn">${ICON.export} Εξαγωγή</button>
                            </div>
                            <div id="tm-sl-export-menu" class="tm-sl-export-menu" hidden>
                                <button type="button" id="tm-sl-export-clipboard">${ICON.export} Αντιγραφή στο Πρόχειρο</button>
                                <button type="button" id="tm-sl-export-csv">${ICON.export} Εξαγωγή σε CSV</button>
                                <label><input type="checkbox" id="tm-sl-export-original-title"> Συμπερίληψη Αρχικού Τίτλου</label>
                            </div>
                        </div>
                        <button type="button" id="tm-sl-close" class="tm-sl-btn tm-sl-btn--icon" aria-label="Κλείσιμο">×</button>
                    </div>
                </div>
                <nav class="tm-sl-view-tabs" role="tablist" aria-label="Προβολή καταλόγου">
                    <button type="button" id="tm-sl-view-mine" class="tm-sl-view-tab is-active" role="tab" aria-selected="true">${ICON.pin} Το κατάστημά μου</button>
                    <button type="button" id="tm-sl-view-network" class="tm-sl-view-tab" role="tab" aria-selected="false">${ICON.store} Άλλα καταστήματα</button>
                </nav>
            </header>
            <div class="tm-sl-toolbar" id="tm-sl-toolbar"></div>
            <div class="tm-sl-body" id="tm-sl-body">${buildSkeletonGrid(6)}</div>
            <footer class="tm-sl-footer">
                <span id="tm-sl-status">—</span>
                <div class="tm-sl-footer-right">
                    <button type="button" id="tm-sl-density" class="tm-sl-density-btn" title="Εναλλαγή πυκνότητας">Άνετο</button>
                    <span id="tm-sl-freshness" class="tm-sl-freshness tm-sl-freshness--cached">
                        <span class="tm-sl-freshness-dot" aria-hidden="true"></span>
                        <span id="tm-sl-updated"></span>
                    </span>
                </div>
            </footer>
            <div class="tm-sl-toast" id="tm-sl-toast" role="status" aria-live="polite"></div>
        </div>`;
    }

    function buildModelSearchToolbar(activeSort) {
        const sorts = [
            ['name', 'Αλφαβητικά'],
            ['stores', 'Περισσότερα κατ.'],
            ['stock', 'Περισσότερο stock'],
        ];
        const pills = sorts.map(([key, label]) =>
            `<button type="button" class="tm-sl-sort-pill${activeSort === key ? ' is-active' : ''}" data-tm-sl-sort="${key}">${esc(label)}</button>`
        ).join('');
        return `
            <div class="tm-sl-toolbar-row">
                <div class="tm-sl-search-wrap">
                    <span class="tm-sl-search-icon">${ICON.search}</span>
                    <input type="search" id="tm-sl-model-search" class="tm-sl-search"
                        placeholder="Αναζήτηση μοντέλου…" autocomplete="off">
                </div>
            </div>
            <div class="tm-sl-toolbar-row tm-sl-sort-pills">${pills}</div>`;
    }

    function buildStoreToolbar(modelName, chipsHtml) {
        return `
            <button type="button" id="tm-sl-back" class="tm-sl-btn tm-sl-btn--back">${ICON.back} Μοντέλα</button>
            <div class="tm-sl-chips" id="tm-sl-chips">${chipsHtml || ''}</div>`;
    }

    function buildModelGrid(models, ctx) {
        if (!models.length) {
            const emptyMsg = ctx?.catalogView === 'mine'
                ? 'Δεν βρέθηκαν συσκευές στο κατάστημά σας'
                : 'Δεν βρέθηκαν μοντέλα σε άλλα καταστήματα';
            return buildEmptyState('📱', 'Δεν βρέθηκαν μοντέλα', emptyMsg);
        }
        const query = ctx?.query || '';
        const catalogView = ctx?.catalogView || 'mine';
        const getGradeStyle = ctx?.getGradeStyle || (() => '');
        const cards = models.map(([model, data], i) => {
            const grades = Object.entries(data.grades || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([g, n]) => gradeChipHTML(g, n, getGradeStyle))
                .join('');
            const heat = getModelHeatClass(data);

            if (catalogView === 'mine') {
                const count = data.myCount || data.totalUnits || 0;
                return `<div class="tm-sl-model-card ${heat}" role="button" tabindex="0"
                    data-tm-sl-model="${esc(model)}" style="--i:${i}">
                    <div class="tm-sl-model-name">${highlightMatch(model, query)}</div>
                    <div class="tm-sl-model-meta">${ICON.pin.replace('width="11"', 'width="12"').replace('height="11"', 'height="12"')} ${count} ${count === 1 ? 'συσκευή' : 'συσκευές'} στο δικό σας</div>
                    ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
                </div>`;
            }

            const storeLabel = data.storeCount === 1
                ? '1 κατάστημα'
                : `${data.storeCount} καταστήματα`;
            const storeNames = data.storeList || [];
            const maxStores = 4;
            const storeChips = storeNames.slice(0, maxStores).map((name) =>
                `<span class="tm-sl-model-store-chip">${esc(name)}</span>`
            ).join('');
            const storeMore = storeNames.length > maxStores
                ? `<span class="tm-sl-model-store-more">+${storeNames.length - maxStores}</span>`
                : '';
            return `<div class="tm-sl-model-card ${heat}" role="button" tabindex="0"
                data-tm-sl-model="${esc(model)}" style="--i:${i}">
                <div class="tm-sl-model-name">${highlightMatch(model, query)}</div>
                <div class="tm-sl-model-meta">${ICON.store.replace('width="16"', 'width="12"').replace('height="16"', 'height="12"')} ${esc(storeLabel)}</div>
                <div class="tm-sl-model-stores">${data.totalUnits} συσκευές στο δίκτυο</div>
                ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
                ${storeChips ? `<div class="tm-sl-model-store-list">${storeChips}${storeMore}</div>` : ''}
            </div>`;
        }).join('');
        return `<div class="tm-sl-model-grid">${cards}</div>`;
    }

    function buildFilterChips(filters, active, ctx) {
        const parts = [];
        const counts = ctx?.counts || {};
        const hexMap = ctx?.colorHexMap || {};
        const getGradeStyle = ctx?.getGradeStyle || (() => '');

        const addGroup = (key, values) => {
            if (!values.length) return;
            values.forEach((val) => {
                const isActive = active[key] === val;
                const count = counts[key]?.[val];
                const countHtml = count != null ? `<span class="tm-sl-chip-count">(${count})</span>` : '';
                let inner = esc(val);
                if (key === 'color') {
                    inner = `${colorSwatchHTML(val, hexMap)} ${esc(val)}`;
                } else if (key === 'grade') {
                    inner = `<span class="tm-sl-chip-grade" style="${getGradeStyle(val)}">${esc(val)}</span>`;
                }
                parts.push(`<button type="button" class="tm-sl-chip${isActive ? ' is-active' : ''}"
                    data-tm-sl-filter="${esc(key)}" data-tm-sl-value="${esc(val)}">${inner}${countHtml}</button>`);
            });
        };
        addGroup('grade', filters.grades);
        addGroup('gb', filters.gbs);
        addGroup('color', filters.colors);
        if (active.grade || active.gb || active.color) {
            parts.push('<button type="button" class="tm-sl-chip" data-tm-sl-filter="clear">Καθαρισμός</button>');
        }
        return parts.join('');
    }

    function isStorePurchaseAllowed(storeName, isBuyback) {
        if (typeof window.isStoreAllowedForPhone === 'function') {
            return window.isStoreAllowedForPhone(storeName, isBuyback);
        }
        return true;
    }

    function buildStoreChipHtml(storeName, isBuyback, allowed) {
        const name = esc(storeName);
        if (isBuyback) {
            const cls = allowed ? 'tm-sl-purchase-chip--ok' : 'tm-sl-purchase-chip--no';
            const icon = allowed ? '●' : '○';
            const label = allowed ? 'BB OK' : 'Όχι BB';
            return `<span class="tm-sl-purchase-chip ${cls}" title="${allowed ? 'Επιτρέπεται αγορά BB' : 'Δεν επιτρέπεται αγορά BB'}">${icon} ${label}</span>`;
        }
        if (!allowed) {
            return `<span class="tm-sl-purchase-chip tm-sl-purchase-chip--no" title="Μη επιτρεπόμενο κατάστημα">○ ${name}</span>`;
        }
        return `<span class="tm-sl-purchase-chip tm-sl-purchase-chip--neutral" title="Επιτρεπόμενο">✓ Αγορά</span>`;
    }

    function buildPurchaseBadgeHtml(isBuyback, allowed) {
        if (isBuyback) {
            return allowed
                ? `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--ok" title="Επιτρέπεται αγορά BB">✓ Αγοράσιμο BB</span>`
                : `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--no" title="Δεν επιτρέπεται αγορά BB από αυτό το κατάστημα">✕ Όχι BB κατ.</span>`;
        }
        return allowed
            ? `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--ok" title="Επιτρεπόμενο κατάστημα">✓ Αγοράσιμο</span>`
            : `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--no" title="Μη επιτρεπόμενο κατάστημα">✕ Μη επιτρεπόμενο</span>`;
    }

    function buildStorePurchaseSummary(store) {
        if (!store?.variants?.length) return { html: '', noPurchase: false };
        const hasBuyback = store.variants.some((v) => v.isBuyback);
        const hasRegular = store.variants.some((v) => !v.isBuyback);
        const badges = [];
        let noPurchase = false;
        if (hasBuyback) {
            const allowed = isStorePurchaseAllowed(store.name, true);
            badges.push(buildStoreChipHtml(store.name, true, allowed));
            if (!allowed) noPurchase = true;
        }
        if (hasRegular) {
            const allowed = isStorePurchaseAllowed(store.name, false);
            if (!allowed) {
                badges.push(buildStoreChipHtml(store.name, false, allowed));
                noPurchase = true;
            }
        }
        return {
            html: badges.length ? `<span class="tm-sl-store-purchase">${badges.join('')}</span>` : '',
            noPurchase,
        };
    }

    function getGradeAccentColor(grade, ctx) {
        if (typeof ctx?.getGradeColor === 'function') return ctx.getGradeColor(grade);
        if (typeof window.getPhoneGradeColor === 'function') return window.getPhoneGradeColor(grade);
        return '#607d8b';
    }

    function buildSpecPillsHTML(v, ctx) {
        const hexMap = ctx?.colorHexMap || {};
        const getGradeStyle = ctx?.getGradeStyle || (() => '');
        const pills = [];
        if (v.grade) {
            pills.push(`<span class="tm-sl-spec-pill tm-sl-spec-pill--grade" style="${getGradeStyle(v.grade)}">${esc(v.grade)}</span>`);
        }
        if (v.gb) {
            pills.push(`<span class="tm-sl-spec-pill tm-sl-spec-pill--storage">${esc(v.gb)}</span>`);
        }
        if (v.color) {
            pills.push(`<span class="tm-sl-spec-pill tm-sl-spec-pill--color">${colorSwatchHTML(v.color, hexMap)} ${esc(v.color)}</span>`);
        }
        if (v.isBuyback) {
            pills.push('<span class="tm-sl-spec-pill tm-sl-spec-pill--bb">BB</span>');
        }
        return pills.join('');
    }

    function buildVariantPreviewHTML(v, ctx) {
        const hexMap = ctx?.colorHexMap || {};
        const parts = [];
        if (v.grade) parts.push(`<span class="tm-sl-preview-pill">${esc(v.grade)}</span>`);
        if (v.gb) parts.push(`<span class="tm-sl-preview-pill">${esc(v.gb)}</span>`);
        if (v.color) parts.push(`<span class="tm-sl-preview-pill">${colorSwatchHTML(v.color, hexMap)} ${esc(v.color)}</span>`);
        if (v.isBuyback) parts.push('<span class="tm-sl-preview-pill">BB</span>');
        return parts.join('');
    }

    function formatVariantLine(v, ctx) {
        const bits = [];
        if (v.grade) bits.push(v.grade);
        if (v.gb) bits.push(v.gb);
        if (v.color) bits.push(v.color);
        if (v.isBuyback) bits.push('BB');
        return bits.join(' · ') || '—';
    }

    function buildUnitStoreHTML(storeName, isMine) {
        const cls = isMine ? 'tm-sl-store-tag tm-sl-store-tag--mine' : 'tm-sl-store-tag';
        return `<span class="${cls}">${ICON.store.replace('width="16"', 'width="11"').replace('height="16"', 'height="11"')} ${esc(storeName)}</span>`;
    }

    function buildUnitRowHTML(v, ctx) {
        const gradeAccent = getGradeAccentColor(v.grade, ctx);
        const storeName = v.storeName || '';
        const storeHtml = ctx?.hideStoreInUnits || !storeName ? '' : buildUnitStoreHTML(storeName, v.isMine);
        const purchaseAllowed = !ctx?.showPurchaseStatus || !storeName
            || isStorePurchaseAllowed(storeName, !!v.isBuyback);
        const purchaseBadge = ctx?.showPurchaseStatus && storeName
            ? buildPurchaseBadgeHtml(!!v.isBuyback, purchaseAllowed)
            : '';
        const cardClasses = [
            'tm-sl-phone-card',
            v.isBuyback ? 'tm-sl-phone-card--bb' : '',
            ctx?.showPurchaseStatus && !purchaseAllowed ? 'tm-sl-phone-card--blocked' : '',
        ].filter(Boolean).join(' ');
        const priceHtml = v.price ? `<div class="tm-sl-phone-card__price">${esc(v.price)}</div>` : '';

        return `<article class="${cardClasses}" data-barcode="${esc(v.barcode)}" style="--tm-sl-grade-accent:${esc(gradeAccent)}">
            <div class="tm-sl-phone-card__body">
                <div class="tm-sl-phone-card__specs">${buildSpecPillsHTML(v, ctx) || '<span class="tm-sl-preview-pill">—</span>'}</div>
                ${storeHtml || purchaseBadge ? `<div class="tm-sl-phone-card__meta">${storeHtml}${purchaseBadge}</div>` : ''}
                <div class="tm-sl-phone-card__footer">
                    <span class="tm-sl-barcode-pill"><span class="tm-sl-barcode-pill__icon">#</span>${esc(v.barcode)}</span>
                </div>
            </div>
            <div class="tm-sl-phone-card__aside">
                ${priceHtml}
                <div class="tm-sl-phone-card__actions">
                    <button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--primary" data-tm-sl-copy="${esc(v.barcode)}" title="Αντιγραφή barcode">Copy</button>
                    <button type="button" class="tm-sl-unit-btn" data-tm-sl-open="${esc(v.barcode)}" title="Άνοιγμα στο σύστημα">Open</button>
                </div>
            </div>
        </article>`;
    }

    function buildPhoneListSection(allRows, ctx) {
        const units = [];
        allRows.forEach((row) => {
            row.variants.forEach((v) => units.push(v));
        });
        if (!units.length) return '';

        units.sort((a, b) => {
            if (a.isMine !== b.isMine) return a.isMine ? -1 : 1;
            const storeCmp = (a.storeName || '').localeCompare(b.storeName || '', 'el');
            if (storeCmp) return storeCmp;
            return (a.grade || '').localeCompare(b.grade || '');
        });

        const items = units.map((v) => buildUnitRowHTML(v, ctx)).join('');

        return `<section class="tm-sl-phone-list-section">
            <h3 class="tm-sl-phone-list-title">Λίστα συσκευών · ${units.length}</h3>
            <div class="tm-sl-phone-list">${items}</div>
        </section>`;
    }

    function buildStoreRowHTML(store, idx, ctx) {
        const signal = getStoreSignalClass(store.variants.length);
        const previewChips = store.variants.slice(0, 4).map((v) => buildVariantPreviewHTML(v, ctx)).join('');
        const previewMore = store.variants.length > 4 ? `<span class="tm-sl-preview-pill">+${store.variants.length - 4}</span>` : '';
        const units = store.variants.map((v) => buildUnitRowHTML(v, ctx)).join('');
        const purchase = ctx?.showPurchaseStatus && !store.isMine
            ? buildStorePurchaseSummary(store)
            : { html: '', noPurchase: false };
        const noPurchaseClass = purchase.noPurchase ? ' tm-sl-store-row--no-purchase' : '';
        return `<div class="tm-sl-store-row ${signal}${store.isMine ? ' is-mine' : ''}${noPurchaseClass}" data-store-idx="${idx}">
            <div class="tm-sl-store-head" data-tm-sl-toggle-store="${idx}" tabindex="0" role="button">
                <span class="tm-sl-store-icon">${ICON.store}</span>
                <span class="tm-sl-store-name">${esc(store.name)}</span>
                ${purchase.html}
                <span class="tm-sl-store-qty">${store.variants.length} τεμ.</span>
                <span class="tm-sl-store-chevron">${ICON.chevron}</span>
            </div>
            ${previewChips ? `<div class="tm-sl-store-preview-chips">${previewChips}${previewMore}</div>` : ''}
            <div class="tm-sl-store-units">${units}</div>
        </div>`;
    }

    function buildMyStoreBoard(modelName, variants, ctx) {
        if (!variants.length) {
            return buildEmptyState('📱', 'Χωρίς διαθέσιμες συσκευές', `Δεν υπάρχει ${esc(modelName)} στο κατάστημά σας`);
        }
        const units = variants.map((v) => buildUnitRowHTML(v, ctx)).join('');
        return `<section class="tm-sl-phone-list-section">
            <h3 class="tm-sl-phone-list-title">${ICON.pin} Το κατάστημά μου · ${variants.length} ${variants.length === 1 ? 'συσκευή' : 'συσκευές'}</h3>
            <div class="tm-sl-phone-list tm-sl-phone-list--mine">${units}</div>
        </section>`;
    }

    function buildNetworkStoreBoard(modelName, storeRows, ctx) {
        if (!storeRows.length) {
            return buildEmptyState('🔍', 'Δεν βρέθηκε σε άλλα καταστήματα', `Κανένα κατάστημα δικτύου δεν έχει ${esc(modelName)}`);
        }
        const rowHtml = storeRows.map((store, idx) => buildStoreRowHTML(store, idx, ctx)).join('');
        return `<div class="tm-sl-store-list">${rowHtml}</div>`;
    }

    function buildStoreBoard(modelName, myStore, allRows, ctx) {
        let html = '';
        const otherRows = (allRows || []).filter((r) => !r.isMine);

        if (myStore && myStore.variants.length) {
            html += `<div class="tm-sl-mine-banner tm-sl-mine-banner--yes">
                <span class="tm-sl-mine-icon">✅</span>
                <div>
                    <div class="tm-sl-mine-text">Υπάρχει στο κατάστημά σας</div>
                    <div class="tm-sl-mine-detail">${myStore.variants.length} ${myStore.variants.length === 1 ? 'συσκευή' : 'συσκευές'} — ${esc(myStore.preview)}</div>
                </div>
            </div>`;
        } else {
            html += `<div class="tm-sl-mine-banner tm-sl-mine-banner--no">
                <span class="tm-sl-mine-icon">—</span>
                <div>
                    <div class="tm-sl-mine-text">Δεν υπάρχει στο κατάστημά σας</div>
                    <div class="tm-sl-mine-detail">Δείτε παρακάτω ποια καταστήματα έχουν ${esc(modelName)}</div>
                </div>
            </div>`;
        }

        if (!allRows?.length) {
            html += buildEmptyState('🔍', 'Δεν βρέθηκε σε κανένα κατάστημα', 'Δοκιμάστε άλλα φίλτρα ή ανανέωση δεδομένων');
            return html;
        }

        html += buildPhoneListSection(allRows, ctx);

        if (!otherRows.length && !(myStore && myStore.variants.length)) {
            return html;
        }

        const grouped = groupStoresByRegion(otherRows);
        let globalIdx = 0;

        if (myStore && myStore.variants.length) {
            html += `<section class="tm-sl-region">
                <h3 class="tm-sl-region-title">Το κατάστημά μου</h3>
                <div class="tm-sl-store-list">${buildStoreRowHTML(myStore, globalIdx, ctx)}</div>
            </section>`;
            globalIdx += 1;
        }

        const regionBlocks = grouped.map(([region, rows]) => {
            const rowHtml = rows.map((store) => {
                const block = buildStoreRowHTML(store, globalIdx, ctx);
                globalIdx += 1;
                return block;
            }).join('');
            return `<section class="tm-sl-region">
                <h3 class="tm-sl-region-title">${esc(region)}</h3>
                <div class="tm-sl-store-list">${rowHtml}</div>
            </section>`;
        }).join('');

        html += regionBlocks;
        return html;
    }

    function showToast(overlay, message) {
        const toast = overlay?.querySelector('#tm-sl-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toast._tmHideTimer);
        toast._tmHideTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    }

    function updateFreshness(overlay, lastUpdated) {
        const wrap = overlay?.querySelector('#tm-sl-freshness');
        const updatedEl = overlay?.querySelector('#tm-sl-updated');
        if (!wrap || !lastUpdated) return;
        const ageMs = Date.now() - lastUpdated.getTime();
        wrap.classList.remove('tm-sl-freshness--fresh', 'tm-sl-freshness--cached', 'tm-sl-freshness--stale');
        if (ageMs < 5 * 60 * 1000) wrap.classList.add('tm-sl-freshness--fresh');
        else if (ageMs < 60 * 60 * 1000) wrap.classList.add('tm-sl-freshness--cached');
        else wrap.classList.add('tm-sl-freshness--stale');
        if (updatedEl) updatedEl.textContent = lastUpdated.toLocaleString('el-GR');
    }

    function updateBreadcrumb(overlay, step, modelName) {
        const wrap = overlay?.querySelector('#tm-sl-breadcrumb-wrap');
        if (wrap) wrap.innerHTML = buildBreadcrumb(step, modelName);
    }

    function updateViewTabs(overlay, view) {
        const mineTab = overlay?.querySelector('#tm-sl-view-mine');
        const networkTab = overlay?.querySelector('#tm-sl-view-network');
        if (!mineTab || !networkTab) return;
        const isMine = view === 'mine';
        mineTab.classList.toggle('is-active', isMine);
        networkTab.classList.toggle('is-active', !isMine);
        mineTab.setAttribute('aria-selected', isMine ? 'true' : 'false');
        networkTab.setAttribute('aria-selected', !isMine ? 'true' : 'false');
    }

    function setDensity(overlay, compact) {
        const shell = overlay?.querySelector('#tm-sl-shell');
        const btn = overlay?.querySelector('#tm-sl-density');
        if (!shell) return;
        shell.classList.toggle('tm-sl-density--compact', compact);
        if (btn) {
            btn.classList.toggle('is-compact', compact);
            btn.textContent = compact ? 'Πυκνό' : 'Άνετο';
        }
    }

    window.PhoneCatalogUI = {
        STYLES,
        esc,
        highlightMatch,
        colorSwatchHTML,
        gradeChipHTML,
        getModelHeatClass,
        getStoreSignalClass,
        guessStoreRegion,
        groupStoresByRegion,
        buildShellHTML,
        buildBreadcrumb,
        buildModelSearchToolbar,
        buildStoreToolbar,
        buildModelGrid,
        buildFilterChips,
        buildStoreBoard,
        buildMyStoreBoard,
        buildNetworkStoreBoard,
        buildEmptyState,
        buildSkeletonGrid,
        buildSkeletonStores,
        buildPhoneListSection,
        buildUnitRowHTML,
        formatVariantLine,
        buildStoreChipHtml,
        buildPurchaseBadgeHtml,
        isStorePurchaseAllowed,
        showToast,
        updateFreshness,
        updateBreadcrumb,
        updateViewTabs,
        setDensity,
    };
})();
