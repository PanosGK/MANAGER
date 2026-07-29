// ==UserScript==
// @name         MyManager Phone Catalog UI
// @namespace    http://tampermonkey.net/
// @version      6.2
// @description  Store locator UI — clean mine/network boards, smart search, best-row guidance.
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
        emptyPhone: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        emptySearch: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
        emptyError: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        open: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
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
        if (typeof window.guessStoreRegion === 'function' && window.guessStoreRegion !== guessStoreRegion) {
            return window.guessStoreRegion(name);
        }
        const n = String(name || '').toUpperCase();
        if (/ΘΕΣΣΑΛΟΝΙΚ|THESS|SALON/i.test(n)) return 'Θεσσαλονίκη';
        if (/ΑΘΗΝ|ΑΤΤΙΚ|ΠΕΙΡΑΙ|ΜΑΡΟΥΣΙ|ΚΑΛΛΙΘΕΑ|ΓΛΥΦΑΔ|ΠΕΡΙΣΤΕΡ|ΧΑΛΑΝΔΡ|ΝΕΑ ΣΜΥΡΝ|ΕΛΛΗΝΙΚ|ΧΟΛΑΡΓ|ΒΡΙΛΗΣΣΙ|ΚΗΦΙΣΙ|ΕΡΥΘΡΑΙ|ΚΟΡΥΔΑΛΛ|ΚΟΛΩΝΑΚΙ|ΣΥΝΤΑΓΜ/i.test(n)) return 'Αττική';
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
        @keyframes tm-sl-toast-in {
            from { opacity: 0; transform: translate(-50%, 8px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }

        .tm-sl-overlay {
            background: var(--tm-overlay-dim, rgba(0,0,0,0.75)) !important;
        }
        .tm-sl-shell {
            --tm-sl-scale: 1;
            zoom: var(--tm-sl-scale);
            width: min(980px, calc(96vw / var(--tm-sl-scale))) !important;
            max-width: calc(96vw / var(--tm-sl-scale)) !important;
            height: min(88vh, calc(92vh / var(--tm-sl-scale))) !important;
            max-height: calc(92vh / var(--tm-sl-scale)) !important;
            border-radius: 16px !important;
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, var(--tm-primary-color)) !important;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
            box-shadow: 0 24px 64px var(--tm-shadow-color, rgba(0,0,0,0.4)),
                0 0 0 1px color-mix(in srgb, var(--tm-primary-color) 8%, transparent) inset !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
        }
        @media (prefers-reduced-motion: reduce) {
            .tm-sl-overlay, .tm-sl-shell, .tm-sl-model-card, .tm-sl-toast.is-visible,
            .tm-sl-skeleton-card, .tm-sl-skeleton-row, .tm-sl-skeleton-line {
                animation: none !important;
            }
            .tm-sl-model-card { transition: none !important; }
            .tm-sl-body.is-refreshing { transition: none !important; }
        }

        .tm-sl-shell.tm-sl-view--network {
            width: min(1400px, calc(99vw / var(--tm-sl-scale))) !important;
            max-width: calc(99vw / var(--tm-sl-scale)) !important;
            height: min(980px, calc(96vh / var(--tm-sl-scale))) !important;
            max-height: calc(96vh / var(--tm-sl-scale)) !important;
            border-radius: 12px !important;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-header {
            padding: 8px 12px 6px;
            background: var(--tm-shop-item-bg);
        }
        .tm-sl-shell.tm-sl-view--network:not(.tm-sl-step--stores) .tm-sl-title { font-size: 1rem; margin: 0; }
        .tm-sl-shell.tm-sl-step--stores .tm-sl-header {
            padding: 12px 14px 10px;
            background: var(--tm-shop-item-bg);
        }
        .tm-sl-shell.tm-sl-step--stores .tm-sl-breadcrumb {
            margin-bottom: 8px;
        }
        .tm-sl-shell.tm-sl-step--stores .tm-sl-breadcrumb-current {
            font-size: 12px;
            font-weight: 900;
            padding: 2px 8px;
            border-radius: 6px;
            background: color-mix(in srgb, var(--tm-primary-color) 12%, transparent);
        }
        .tm-sl-title--model {
            font-size: 1.55rem !important;
            font-weight: 900 !important;
            letter-spacing: -0.02em;
            line-height: 1.15;
            margin: 0;
        }
        .tm-sl-shell.tm-sl-view--network.tm-sl-step--stores .tm-sl-title--model {
            font-size: 1.45rem !important;
        }
        .tm-sl-model-title {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            max-width: 100%;
            padding: 6px 12px 6px 10px;
            border-radius: 8px;
            background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg));
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 22%, transparent);
            color: var(--tm-primary-color);
        }
        .tm-sl-model-title__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: color-mix(in srgb, var(--tm-primary-color) 18%, transparent);
            flex-shrink: 0;
        }
        .tm-sl-model-title__icon svg { display: block; }
        .tm-sl-model-title__name {
            word-break: break-word;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
        }
        .tm-sl-shell.tm-sl-step--stores .tm-sl-subtitle {
            font-size: 11px;
            font-weight: 600;
            opacity: 0.85;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-subtitle { font-size: 11px; margin: 2px 0 0; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-breadcrumb { margin-bottom: 4px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-view-tabs { margin-top: 6px; padding: 3px; border-radius: 8px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-view-tab { font-size: 11px; padding: 6px 10px; border-radius: 6px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-toolbar {
            padding: 6px 10px; border-bottom: 1px solid var(--tm-shop-item-border);
        }
        /* Network model grid must scroll; only the stores board locks overflow. */
        .tm-sl-shell.tm-sl-view--network .tm-sl-body {
            padding: 0; overflow-y: auto; display: flex; flex-direction: column; min-height: 0;
        }
        .tm-sl-shell.tm-sl-view--network.tm-sl-step--stores .tm-sl-body {
            overflow: hidden;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-body .tm-sl-network-board {
            flex: 1 1 0;
            min-height: 0;
            overflow: hidden;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-search { height: 34px; font-size: 13px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-chips { gap: 4px; margin-top: 0; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-chip { padding: 4px 9px; font-size: 11px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-model-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 6px; padding: 8px 10px;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-model-card { padding: 12px 12px 10px; border-radius: 10px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-model-name { font-size: 14px; margin-bottom: 0; padding-right: 0; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-model-card-foot { margin-top: 8px; padding-top: 8px; gap: 6px; }
        .tm-sl-shell.tm-sl-view--network .tm-sl-empty { padding: 24px 16px; }

        .tm-sl-network-board {
            display: grid;
            grid-template-columns: minmax(220px, 30%) minmax(0, 1fr);
            grid-template-rows: minmax(0, 1fr);
            height: 100%;
            min-height: 0;
            overflow: hidden;
            background: var(--tm-shop-item-bg);
        }
        .tm-sl-network-stores {
            display: flex; flex-direction: column; min-height: 0; max-height: 100%;
            border-right: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-border) 8%, var(--tm-shop-item-bg));
            overflow-x: hidden;
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
        }
        .tm-sl-network-stores__label {
            padding: 8px 10px 6px;
            font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
            opacity: 0.55; flex-shrink: 0;
            border-bottom: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 50%, transparent);
        }
        .tm-sl-network-store {
            display: flex; flex-direction: column; align-items: stretch; gap: 3px;
            width: 100%; text-align: left;
            padding: 9px 10px;
            border: none; border-bottom: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 45%, transparent);
            border-left: 3px solid transparent;
            background: transparent;
            color: var(--tm-shop-item-text);
            cursor: pointer;
            transition: background 0.12s, border-color 0.12s;
            flex-shrink: 0;
        }
        .tm-sl-network-store:hover {
            background: var(--tm-shop-item-hover-bg);
        }
        .tm-sl-network-store.is-active {
            background: var(--tm-shop-item-bg);
            border-left-color: var(--tm-primary-color);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tm-primary-color) 12%, transparent);
        }
        .tm-sl-network-store.tm-sl-signal--fragile.is-active { border-left-color: var(--tm-warning-color, #f59e0b); }
        .tm-sl-network-store.tm-sl-signal--moderate.is-active { border-left-color: var(--tm-info-color, #0ea5e9); }
        .tm-sl-network-store.tm-sl-signal--strong.is-active { border-left-color: var(--tm-success-color, #22c55e); }
        .tm-sl-network-store:focus-visible {
            outline: 2px solid var(--tm-primary-color); outline-offset: -2px;
        }
        .tm-sl-network-store__name {
            font-size: 13px; font-weight: 700; line-height: 1.25;
            word-break: break-word;
        }
        .tm-sl-network-store__meta {
            display: flex; flex-wrap: wrap; align-items: center; gap: 5px;
            font-size: 11px; opacity: 0.85;
        }
        .tm-sl-network-store__preview {
            display: none;
        }
        .tm-sl-network-detail {
            display: flex; flex-direction: column; min-height: 0; min-width: 0; max-height: 100%;
            overflow: hidden;
        }
        .tm-sl-network-detail-head {
            display: flex; flex-direction: column; align-items: stretch; gap: 6px;
            padding: 8px 12px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-border) 6%, var(--tm-shop-item-bg));
            flex-shrink: 0;
            position: relative;
            z-index: 2;
        }
        .tm-sl-network-detail-head__row {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;
        }
        .tm-sl-network-detail-head h3 {
            margin: 0; font-size: 14px; font-weight: 800; line-height: 1.2;
        }
        .tm-sl-network-detail-head__meta {
            display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 11px;
        }
        .tm-sl-chips--network-detail {
            display: flex; flex-wrap: wrap; gap: 4px; margin: 0;
            padding-top: 4px;
            border-top: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 45%, transparent);
        }
        .tm-sl-chips--network-detail .tm-sl-chip {
            padding: 4px 9px; font-size: 11px;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-toolbar:has(#tm-sl-back:only-child) {
            padding: 6px 10px;
        }
        .tm-sl-network-detail-table-wrap {
            flex: 1; min-height: 0; overflow: auto;
        }
        #tm-sl-network-table-root {
            flex: 1; min-height: 0; overflow: hidden;
            display: flex; flex-direction: column;
        }
        #tm-sl-network-table-root .tm-sl-network-detail-table-wrap {
            flex: 1; min-height: 0; overflow: auto;
        }
        .tm-sl-unit-table {
            width: 100%; border-collapse: collapse;
            font-size: 12px;
        }
        .tm-sl-unit-table thead {
            position: sticky; top: 0; z-index: 3;
            background: color-mix(in srgb, var(--tm-shop-item-border) 14%, var(--tm-shop-item-bg));
        }
        .tm-sl-unit-table th {
            padding: 7px 10px; text-align: left;
            font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
            opacity: 0.7; white-space: nowrap;
            border-bottom: 1px solid var(--tm-shop-item-border);
        }
        .tm-sl-unit-table td {
            padding: 7px 10px; vertical-align: middle;
            border-bottom: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 40%, transparent);
        }
        .tm-sl-unit-table tbody tr:hover td {
            background: var(--tm-shop-item-hover-bg);
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--best td {
            background: color-mix(in srgb, var(--tm-success-color, #16a34a) 8%, var(--tm-shop-item-bg));
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--best:hover td {
            background: color-mix(in srgb, var(--tm-success-color, #16a34a) 12%, var(--tm-shop-item-bg));
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--best td:first-child {
            box-shadow: inset 3px 0 0 var(--tm-success-color, #16a34a);
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--flash td {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg)) !important;
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--blocked td {
            background: color-mix(in srgb, #dc2626 9%, var(--tm-shop-item-bg));
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--blocked td:first-child {
            box-shadow: inset 4px 0 0 #dc2626;
        }
        .tm-sl-table-imei {
            display: block;
            margin-top: 2px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 10px;
            font-weight: 500;
            opacity: 0;
            color: var(--tm-muted-text, var(--tm-shop-item-text));
            transition: opacity 0.12s ease;
        }
        .tm-sl-unit-table tbody tr:hover .tm-sl-table-imei,
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--best .tm-sl-table-imei,
        .tm-sl-unit-table tbody tr:focus-within .tm-sl-table-imei {
            opacity: 0.75;
        }
        .tm-sl-insight {
            display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px;
            margin-bottom: 10px; padding: 9px 12px;
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 10px;
            background: var(--tm-shop-item-bg);
            font-size: 12px; font-weight: 650;
            color: var(--tm-muted-text, var(--tm-shop-item-text));
        }
        .tm-sl-network-detail > .tm-sl-insight {
            margin: 10px 12px 0;
            flex-shrink: 0;
        }
        .tm-sl-mine-board > div > .tm-sl-insight,
        .tm-sl-mine-board .tm-sl-insight {
            margin-bottom: 8px;
        }
        .tm-sl-insight__best {
            color: var(--tm-success-color, #16a34a);
            font-weight: 750;
        }
        .tm-sl-whisper {
            display: inline-block;
            margin-bottom: 8px;
            font-size: 10px; font-weight: 700;
            padding: 3px 7px; border-radius: 999px;
            background: color-mix(in srgb, var(--tm-success-color, #16a34a) 12%, transparent);
            color: var(--tm-success-color, #16a34a);
        }
        .tm-sl-whisper--warn {
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 16%, transparent);
            color: var(--tm-warning-color, #d97706);
        }
        .tm-sl-sort-select {
            height: 42px; padding: 0 12px;
            border-radius: 10px;
            border: 1px solid var(--tm-input-border, var(--tm-shop-item-border));
            background: var(--tm-input-bg, var(--tm-shop-item-bg));
            color: var(--tm-shop-item-text);
            font-size: 12px; font-weight: 700;
            cursor: pointer; flex-shrink: 0;
            max-width: 180px;
        }
        .tm-sl-sort-select:focus-visible {
            outline: 2px solid var(--tm-primary-color); outline-offset: 2px;
        }
        .tm-sl-recent {
            display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
            font-size: 11px; color: var(--tm-muted-text, var(--tm-shop-item-text));
        }
        .tm-sl-recent__label { font-weight: 700; margin-right: 2px; opacity: 0.8; }
        .tm-sl-recent__chip {
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            border-radius: 999px;
            padding: 4px 9px;
            font-size: 11px; font-weight: 650;
            cursor: pointer;
        }
        .tm-sl-recent__chip:hover { border-color: var(--tm-primary-color); }
        .tm-sl-search-kbd {
            position: absolute; right: 10px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 10px; font-weight: 600;
            padding: 2px 6px; border-radius: 5px;
            border: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-border) 18%, var(--tm-shop-item-bg));
            color: var(--tm-muted-text, var(--tm-shop-item-text));
            pointer-events: none;
        }
        .tm-sl-search-wrap:focus-within .tm-sl-search-kbd { display: none; }
        .tm-sl-search { padding-right: 36px !important; }
        #tm-sl-breadcrumb-wrap { display: none !important; }
        .tm-sl-toast {
            display: inline-flex; align-items: center; gap: 10px;
            white-space: nowrap; max-width: calc(100% - 32px);
        }
        .tm-sl-toast__msg { overflow: hidden; text-overflow: ellipsis; }
        .tm-sl-toast__open {
            border: 1px solid color-mix(in srgb, #fff 28%, transparent);
            background: transparent; color: inherit;
            border-radius: 999px; padding: 3px 9px;
            font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0;
        }
        .tm-sl-toast__open:hover { background: color-mix(in srgb, #fff 12%, transparent); }
        .tm-sl-model-card-foot {
            display: flex; flex-direction: column; gap: 8px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
        }
        .tm-sl-model-stats {
            display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px;
        }
        .tm-sl-unit-table .tm-sl-table-blocked {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 8px; border-radius: 6px;
            font-size: 10px; font-weight: 800; letter-spacing: 0.02em;
            background: #dc2626; color: #fff;
            white-space: nowrap;
        }
        .tm-sl-unit-table .tm-sl-table-bb {
            font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 6px;
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 22%, transparent);
            color: var(--tm-warning-color, #d97706);
            border: 1px solid color-mix(in srgb, var(--tm-warning-color, #f59e0b) 40%, transparent);
        }
        .tm-sl-unit-table .tm-sl-table-bb--blocked {
            background: #dc2626; color: #fff; border-color: #b91c1c;
        }
        .tm-sl-unit-table .tm-sl-table-grade {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 30px; padding: 2px 8px; border-radius: 999px;
            font-size: 10px; font-weight: 800; color: #fff;
        }
        .tm-sl-unit-table .tm-sl-table-gb {
            font-weight: 700; white-space: nowrap;
        }
        .tm-sl-unit-table .tm-sl-table-color {
            display: inline-flex; align-items: center; gap: 5px; max-width: 140px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tm-sl-unit-table .tm-sl-table-barcode {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 11px; font-weight: 600; white-space: nowrap;
        }
        .tm-sl-unit-table .tm-sl-table-price {
            font-weight: 800; color: var(--tm-success-color, #16a34a); white-space: nowrap;
        }
        .tm-sl-unit-table .tm-sl-table-actions {
            display: flex; gap: 4px; justify-content: flex-end; white-space: nowrap;
        }
        .tm-sl-unit-table .tm-sl-table-status {
            font-size: 11px; font-weight: 700; white-space: nowrap;
            color: var(--tm-muted-text, var(--tm-shop-item-text));
            opacity: 0.9;
        }
        .tm-sl-unit-table .tm-sl-table-status--ok { color: var(--tm-success-color, #16a34a); opacity: 1; }
        .tm-sl-unit-table .tm-sl-table-status--bb {
            color: var(--tm-warning-color, #d97706); opacity: 1;
        }
        .tm-sl-unit-table .tm-sl-table-status--blocked {
            color: var(--tm-danger-color, #dc2626); opacity: 1;
        }
        .tm-sl-unit-table .tm-sl-table-barcode {
            cursor: pointer;
            color: var(--tm-primary-color);
            border-bottom: 1px dashed color-mix(in srgb, var(--tm-primary-color) 35%, transparent);
        }
        .tm-sl-unit-table .tm-sl-table-barcode:hover {
            text-decoration: none;
            border-bottom-color: var(--tm-primary-color);
        }
        .tm-sl-unit-table tbody tr {
            cursor: default;
        }
        .tm-sl-unit-btn.is-copied {
            border-color: var(--tm-success-color, #22c55e);
            color: var(--tm-success-color, #16a34a);
            background: color-mix(in srgb, var(--tm-success-color, #22c55e) 12%, var(--tm-shop-item-bg));
        }
        .tm-sl-unit-btn--icon {
            min-width: 28px; padding: 4px 6px;
            display: inline-flex; align-items: center; justify-content: center;
        }
        .tm-sl-unit-btn--icon svg { display: block; }
        .tm-sl-unit-btn.is-copied.tm-sl-unit-btn--icon {
            font-size: 10px; font-weight: 800; min-width: 72px;
        }
        .tm-sl-btn.is-busy {
            opacity: 0.7;
            pointer-events: none;
        }
        .tm-sl-btn.is-busy .tm-sl-btn-spin {
            display: inline-block;
            animation: tm-sl-spin 0.8s linear infinite;
        }
        @keyframes tm-sl-spin { to { transform: rotate(360deg); } }
        .tm-sl-body.is-refreshing {
            opacity: 0.55;
            pointer-events: none;
            transition: opacity 0.15s ease;
        }
        .tm-sl-load {
            flex-shrink: 0;
            margin: 8px 16px 0;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            position: relative;
            z-index: 12;
        }
        .tm-sl-load[hidden] { display: none !important; }
        .tm-sl-load__row {
            display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
            margin-bottom: 8px;
        }
        .tm-sl-load__label {
            font-size: 12px; font-weight: 800;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-load__eta {
            font-size: 11px; font-weight: 700;
            color: var(--tm-primary-color);
            white-space: nowrap;
        }
        .tm-sl-load__track {
            height: 8px; border-radius: 999px; overflow: hidden;
            background: color-mix(in srgb, var(--tm-shop-item-border) 55%, transparent);
        }
        .tm-sl-load__bar {
            height: 100%; width: 0%;
            border-radius: 999px;
            background: var(--tm-primary-color);
            transition: width 0.25s ease;
        }
        .tm-sl-load.is-indeterminate .tm-sl-load__bar {
            width: 36% !important;
            animation: tm-sl-load-slide 1.1s ease-in-out infinite;
        }
        @keyframes tm-sl-load-slide {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(320%); }
        }
        @media (prefers-reduced-motion: reduce) {
            .tm-sl-load.is-indeterminate .tm-sl-load__bar {
                animation: none !important;
                width: 55% !important;
                opacity: 0.85;
            }
        }
        .tm-sl-load__meta {
            margin-top: 6px;
            font-size: 11px;
            font-weight: 600;
            color: var(--tm-muted-text, var(--tm-secondary-color));
        }
        .tm-sl-mine-board {
            display: flex; flex-direction: column; min-height: 0; height: 100%;
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 10px;
            overflow: hidden;
            background: var(--tm-shop-item-bg);
        }
        .tm-sl-shell:not(.tm-sl-view--network).tm-sl-step--stores .tm-sl-body {
            display: flex; flex-direction: column; overflow: hidden; padding: 12px 14px;
        }
        .tm-sl-shell:not(.tm-sl-view--network).tm-sl-step--stores .tm-sl-mine-board {
            flex: 1 1 0; min-height: 0;
        }
        .tm-sl-toolbar .tm-sl-chips {
            flex: 1; min-width: 0;
        }
        .tm-sl-mine-detail-head {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;
            padding: 10px 12px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: color-mix(in srgb, var(--tm-shop-item-border) 6%, var(--tm-shop-item-bg));
            flex-shrink: 0;
            position: sticky; top: 0; z-index: 2;
        }
        .tm-sl-mine-detail-head h3 {
            margin: 0; font-size: 13px; font-weight: 800;
            display: inline-flex; align-items: center; gap: 6px;
        }
        .tm-sl-mine-detail-head__meta {
            display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
            font-size: 11px; font-weight: 600; opacity: 0.85;
        }
        .tm-sl-mine-table-wrap {
            flex: 1; min-height: 0; overflow: auto;
        }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-unit-table th,
        .tm-sl-shell.tm-sl-density--compact .tm-sl-unit-table td {
            padding: 5px 8px;
        }
        .tm-sl-shell.tm-sl-density--compact .tm-sl-unit-btn {
            padding: 3px 7px; font-size: 10px;
        }
        .tm-sl-skeleton-mine {
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 10px; overflow: hidden; padding: 12px;
        }
        .tm-sl-skeleton-mine .tm-sl-skeleton-line { width: 100%; }
        .tm-sl-store-dist {
            font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
            background: color-mix(in srgb, var(--tm-primary-color) 12%, transparent);
            color: var(--tm-primary-color);
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 24%, transparent);
            white-space: nowrap;
        }
        .tm-sl-store-bb-status {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 2px 7px; border-radius: 999px;
            font-size: 10px; font-weight: 700;
        }
        .tm-sl-overlay:has(.tm-sl-shell.tm-sl-view--network) {
            padding: 6px !important;
        }
        .tm-sl-skeleton-network {
            display: grid; grid-template-columns: minmax(220px, 30%) minmax(0, 1fr);
            height: 100%; min-height: 280px;
        }
        .tm-sl-skeleton-network__nav {
            border-right: 1px solid var(--tm-shop-item-border); padding: 8px;
            display: flex; flex-direction: column; gap: 6px;
        }
        .tm-sl-skeleton-network__nav .tm-sl-skeleton-row { height: 44px; border-radius: 8px; }
        .tm-sl-skeleton-network__main { padding: 10px 12px; }

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
            min-width: 0;
            border: none;
            background: transparent;
            color: var(--tm-shop-item-text);
            font-size: 12px;
            font-weight: 700;
            padding: 9px 12px;
            border-radius: 9px;
            cursor: pointer;
            transition: background 0.15s, color 0.15s, box-shadow 0.15s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tm-sl-view-tab:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 8%, transparent);
        }
        .tm-sl-view-tab.is-active {
            background: var(--tm-shop-item-bg);
            color: var(--tm-primary-color);
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 22%, var(--tm-shop-item-border));
        }
        .tm-sl-view-tab:focus-visible {
            outline: 2px solid var(--tm-primary-color);
            outline-offset: 2px;
        }

        .tm-sl-header {
            padding: 16px 20px 12px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            flex-shrink: 0;
            background: var(--tm-shop-item-bg);
            position: relative;
            z-index: 30;
            overflow: visible;
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
        .tm-sl-settings-wrap { position: relative; z-index: 40; }
        .tm-sl-settings-menu, .tm-sl-export-menu {
            position: absolute; top: calc(100% + 6px); right: 0;
            background: var(--tm-shop-item-bg);
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            padding: 6px; min-width: 210px; z-index: 50;
        }
        /* Ported to document.body so shell overflow/zoom can't bury or clip menus */
        .tm-sl-settings-menu.tm-sl-menu--fixed,
        .tm-sl-export-menu.tm-sl-menu--fixed {
            position: fixed !important;
            top: var(--tm-sl-menu-top, 0) !important;
            right: var(--tm-sl-menu-right, 8px) !important;
            left: auto !important;
            z-index: 100060 !important;
            max-height: min(70vh, 420px);
            overflow: auto;
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
            padding: 10px 16px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg));
            flex-shrink: 0;
            position: relative;
            z-index: 10;
        }
        .tm-sl-toolbar-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .tm-sl-toolbar-row + .tm-sl-toolbar-row { margin-top: 8px; }
        .tm-sl-context-strip {
            display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px;
            width: 100%;
            padding: 7px 10px;
            border-radius: 8px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            font-size: 12px;
            line-height: 1.3;
        }
        .tm-sl-context-strip__view {
            font-weight: 800;
            color: var(--tm-primary-color);
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .tm-sl-context-strip__sep { opacity: 0.35; }
        .tm-sl-context-strip__model {
            font-weight: 800;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-context-strip__filters {
            font-weight: 600;
            color: var(--tm-muted-text, var(--tm-secondary-color));
            opacity: 0.9;
        }
        .tm-sl-legend {
            display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px;
            width: 100%;
            padding: 2px 2px 0;
            font-size: 11px;
            color: var(--tm-muted-text, var(--tm-secondary-color));
        }
        .tm-sl-legend__label { font-weight: 700; opacity: 0.8; }
        .tm-sl-legend-item {
            display: inline-flex; align-items: center; gap: 5px;
            font-weight: 700;
        }
        .tm-sl-legend-item::before {
            content: '';
            width: 7px; height: 7px; border-radius: 50%;
            background: currentColor;
            flex-shrink: 0;
        }
        .tm-sl-legend-item--ok { color: var(--tm-success-color, #16a34a); }
        .tm-sl-legend-item--bb { color: var(--tm-warning-color, #d97706); }
        .tm-sl-legend-item--no { color: var(--tm-danger-color, #dc2626); }
        .tm-sl-coach {
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            flex-shrink: 0;
            margin: 8px 16px 0;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid color-mix(in srgb, var(--tm-info-color, #0ea5e9) 28%, var(--tm-shop-item-border));
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 8%, var(--tm-shop-item-bg));
            font-size: 12px;
            font-weight: 600;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-coach[hidden] { display: none !important; }
        .tm-sl-coach-dismiss {
            border: none; background: transparent; cursor: pointer;
            color: var(--tm-muted-text); font-size: 16px; line-height: 1; padding: 2px 6px;
        }
        .tm-sl-btn--primary-action {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg));
            border-color: color-mix(in srgb, var(--tm-primary-color) 40%, var(--tm-shop-item-border));
            color: var(--tm-primary-color);
            font-weight: 800;
        }
        .tm-sl-network-store.is-recommended .tm-sl-network-store__name::after {
            content: 'Προτεινόμενο';
            margin-left: 6px;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: var(--tm-success-color, #16a34a);
            vertical-align: middle;
        }
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
            position: relative;
            z-index: 1;
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
            display: flex;
            flex-direction: column;
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 85%, var(--tm-primary-color));
            border-radius: 12px;
            padding: 14px 14px 12px;
            background:
                linear-gradient(180deg,
                    color-mix(in srgb, var(--tm-primary-color) 6%, var(--tm-shop-item-bg)) 0%,
                    var(--tm-shop-item-bg) 42%);
            cursor: pointer;
            transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.15s;
            box-shadow: 0 1px 2px color-mix(in srgb, #000 6%, transparent);
            border-left: 3px solid var(--tm-shop-item-border);
        }
        .tm-sl-model-card:hover {
            border-color: color-mix(in srgb, var(--tm-primary-color) 55%, var(--tm-shop-item-border));
            background:
                linear-gradient(180deg,
                    color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg)) 0%,
                    var(--tm-shop-item-hover-bg, var(--tm-shop-item-bg)) 50%);
            box-shadow: 0 6px 18px color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
            transform: translateY(-1px);
        }
        .tm-sl-model-card:focus-visible {
            outline: 2px solid var(--tm-primary-color);
            outline-offset: 2px;
        }
        .tm-sl-model-card.tm-sl-heat--high {
            border-left-color: var(--tm-success-color, #22c55e);
            background:
                linear-gradient(180deg,
                    color-mix(in srgb, var(--tm-success-color, #22c55e) 10%, var(--tm-shop-item-bg)) 0%,
                    var(--tm-shop-item-bg) 48%);
        }
        .tm-sl-model-card.tm-sl-heat--low {
            border-left-color: var(--tm-warning-color, #f59e0b);
            background:
                linear-gradient(180deg,
                    color-mix(in srgb, var(--tm-warning-color, #f59e0b) 12%, var(--tm-shop-item-bg)) 0%,
                    var(--tm-shop-item-bg) 48%);
        }
        .tm-sl-model-card.tm-sl-heat--local {
            border-left-color: var(--tm-info-color, #0ea5e9);
            background:
                linear-gradient(180deg,
                    color-mix(in srgb, var(--tm-info-color, #0ea5e9) 11%, var(--tm-shop-item-bg)) 0%,
                    var(--tm-shop-item-bg) 48%);
        }
        .tm-sl-model-card.tm-sl-heat--mid {
            border-left-color: color-mix(in srgb, var(--tm-primary-color) 45%, var(--tm-shop-item-border));
        }

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
            font-size: 17px; font-weight: 800; line-height: 1.2;
            letter-spacing: -0.03em;
            margin: 0;
            padding: 0;
            color: var(--tm-shop-item-text);
            word-break: break-word;
        }
        .tm-sl-model-count {
            display: inline-flex; align-items: baseline; gap: 4px;
            font-size: 15px; font-weight: 800; line-height: 1.1;
            letter-spacing: -0.02em;
            font-variant-numeric: tabular-nums;
            color: var(--tm-primary-color);
            margin: 0;
        }
        .tm-sl-model-count span {
            font-size: 11px; font-weight: 650; opacity: 0.85; margin-left: 0;
            color: var(--tm-muted-text, var(--tm-shop-item-text));
        }
        .tm-sl-hl {
            background: color-mix(in srgb, var(--tm-primary-color) 28%, transparent);
            color: inherit; border-radius: 3px; padding: 0 2px;
        }
        .tm-sl-model-meta {
            font-size: 12px; font-weight: 650;
            color: var(--tm-muted-text, var(--tm-secondary-color));
            margin: 0;
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
            display: block;
            padding: 0; cursor: pointer;
            transition: background 0.12s;
        }
        .tm-sl-store-head:hover { background: var(--tm-shop-item-hover-bg); }
        .tm-sl-store-head:focus-visible { outline: 2px solid var(--tm-primary-color); outline-offset: -2px; }
        .tm-sl-store-head__top {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 14px 8px;
        }
        .tm-sl-store-head__meta {
            display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
            padding: 0 14px 10px 42px;
        }
        .tm-sl-store-icon { opacity: 0.7; flex-shrink: 0; display: flex; }
        .tm-sl-store-name {
            flex: 1; font-size: 14px; font-weight: 800; min-width: 0;
            line-height: 1.25; word-break: break-word;
        }
        .tm-sl-store-qty {
            font-size: 11px; font-weight: 700; padding: 5px 10px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 14%, transparent);
            color: var(--tm-info-color, #0ea5e9);
            flex-shrink: 0;
        }
        .tm-sl-store-bb-status {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 5px 10px; border-radius: 999px;
            font-size: 11px; font-weight: 700;
        }
        .tm-sl-store-bb-status--ok {
            background: color-mix(in srgb, #16a34a 14%, transparent);
            color: #15803d;
            border: 1px solid color-mix(in srgb, #16a34a 28%, transparent);
        }
        .tm-sl-store-bb-status--no {
            background: #dc2626;
            color: #fff;
            border: 1px solid #b91c1c;
            box-shadow: 0 1px 3px color-mix(in srgb, #dc2626 35%, transparent);
            font-weight: 800;
        }
        .tm-sl-store-chevron { opacity: 0.4; flex-shrink: 0; transition: transform 0.15s; margin-left: auto; }
        .tm-sl-store-row.is-open .tm-sl-store-chevron { transform: rotate(90deg); }
        .tm-sl-store-summary {
            display: flex; flex-direction: column; gap: 6px;
            padding: 0 12px 12px 12px;
            border-top: 1px dashed color-mix(in srgb, var(--tm-shop-item-border) 55%, transparent);
            margin: 0 10px 0;
            padding-top: 10px;
        }
        .tm-sl-store-row.is-open .tm-sl-store-summary { display: none; }
        .tm-sl-store-summary-line {
            display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
            padding: 7px 10px; border-radius: 10px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 12%, var(--tm-shop-item-bg));
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 45%, transparent);
            font-size: 11px;
        }
        .tm-sl-summary-grade {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 28px; padding: 2px 7px; border-radius: 999px;
            font-size: 10px; font-weight: 800; color: #fff;
        }
        .tm-sl-summary-gb {
            font-weight: 700; padding: 2px 7px; border-radius: 999px;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 12%, transparent);
            color: var(--tm-info-color, #0284c7);
        }
        .tm-sl-summary-color {
            display: inline-flex; align-items: center; gap: 5px;
            font-weight: 600; color: var(--tm-shop-item-text);
        }
        .tm-sl-summary-color .tm-sl-color-swatch {
            width: 11px; height: 11px; border-radius: 50%;
            box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
        }
        .tm-sl-summary-bb {
            padding: 2px 6px; border-radius: 999px; font-size: 9px; font-weight: 800;
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 18%, transparent);
            color: var(--tm-warning-color, #d97706);
            border: 1px solid color-mix(in srgb, var(--tm-warning-color, #f59e0b) 35%, transparent);
        }
        .tm-sl-summary-count {
            margin-left: auto; font-size: 10px; font-weight: 800; opacity: 0.55;
            padding: 2px 6px; border-radius: 999px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 25%, transparent);
        }
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
            max-height: min(60vh, 2400px); opacity: 1;
            overflow-y: auto;
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
            border-left: 6px solid #dc2626;
            border-color: color-mix(in srgb, #dc2626 45%, var(--tm-shop-item-border));
            background: linear-gradient(135deg,
                color-mix(in srgb, #dc2626 14%, var(--tm-shop-item-bg)),
                color-mix(in srgb, #dc2626 4%, var(--tm-shop-item-bg)) 55%);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, #dc2626 18%, transparent);
        }
        .tm-sl-phone-card--blocked .tm-sl-phone-card__price {
            text-decoration: line-through;
            opacity: 0.55;
            color: var(--tm-muted-text, #64748b);
        }
        .tm-sl-blocked-banner {
            display: flex; align-items: center; gap: 6px;
            width: 100%;
            padding: 6px 10px; border-radius: 8px;
            font-size: 11px; font-weight: 800; letter-spacing: 0.01em;
            background: #dc2626; color: #fff;
            box-shadow: 0 1px 4px color-mix(in srgb, #dc2626 40%, transparent);
        }
        .tm-sl-phone-card--compact.tm-sl-phone-card--blocked {
            position: relative;
            padding-top: 28px;
        }
        .tm-sl-phone-card--compact .tm-sl-blocked-banner {
            position: absolute; top: 0; left: 0; right: 0;
            border-radius: 10px 10px 0 0;
            justify-content: center;
            padding: 4px 8px; font-size: 10px;
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
        .tm-sl-spec-pill--bb-blocked {
            background: #dc2626;
            color: #fff;
            border-color: #b91c1c;
            font-weight: 800;
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
        .tm-sl-store-preview-chips { display: none; }

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
            background: #dc2626;
            color: #fff;
            border: 1px solid #b91c1c;
            font-weight: 800;
            box-shadow: 0 1px 3px color-mix(in srgb, #dc2626 35%, transparent);
        }
        .tm-sl-purchase-chip--neutral {
            background: color-mix(in srgb, var(--tm-shop-item-border) 22%, transparent);
            color: var(--tm-shop-item-text);
            border: 1px solid var(--tm-shop-item-border);
        }
        .tm-sl-store-row.tm-sl-store-row--no-purchase {
            border-left: 5px solid #dc2626;
            background: color-mix(in srgb, #dc2626 6%, var(--tm-shop-item-bg));
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
        .tm-sl-empty-icon {
            margin: 0 auto 12px;
            width: 40px; height: 40px;
            opacity: 0.45;
            display: flex; align-items: center; justify-content: center;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-empty-icon svg { display: block; }
        .tm-sl-empty-title { font-size: 16px; font-weight: 800; margin-bottom: 6px; color: var(--tm-shop-item-text); }
        .tm-sl-empty-sub { font-size: 13px; opacity: 0.8; margin-bottom: 14px; }
        .tm-sl-empty-actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }

        .tm-sl-footer {
            padding: 10px 20px;
            border-top: 1px solid var(--tm-shop-item-border);
            display: flex; justify-content: space-between; align-items: center;
            font-size: 11px; opacity: 0.85; flex-shrink: 0; gap: 12px;
            position: relative;
            z-index: 8;
        }
        .tm-sl-footer-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .tm-sl-density-btn {
            padding: 4px 8px; border-radius: 6px;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg);
            color: var(--tm-shop-item-text);
            font-size: 10px; font-weight: 700; cursor: pointer;
        }
        .tm-sl-density-btn:hover { border-color: var(--tm-primary-color); }
        .tm-sl-density-btn.is-compact { background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg)); }

        .tm-sl-scale {
            display: inline-flex; align-items: center;
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 8px;
            overflow: hidden;
            background: var(--tm-shop-item-bg);
        }
        .tm-sl-scale__btn {
            border: 0;
            background: transparent;
            color: var(--tm-shop-item-text);
            font-size: 11px; font-weight: 800;
            padding: 5px 8px;
            cursor: pointer;
            line-height: 1;
            min-width: 28px;
        }
        .tm-sl-scale__btn:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--tm-shop-item-bg));
            color: var(--tm-primary-color);
        }
        .tm-sl-scale__btn:disabled {
            opacity: 0.35; cursor: default;
        }
        .tm-sl-scale__btn:focus-visible {
            outline: 2px solid var(--tm-primary-color); outline-offset: -2px;
        }
        .tm-sl-scale__value {
            border: 0;
            border-left: 1px solid var(--tm-shop-item-border);
            border-right: 1px solid var(--tm-shop-item-border);
            background: transparent;
            color: var(--tm-shop-item-text);
            font-size: 10px; font-weight: 800;
            padding: 5px 8px;
            cursor: pointer;
            min-width: 44px;
            letter-spacing: 0.02em;
        }
        .tm-sl-scale__value:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--tm-shop-item-bg));
            color: var(--tm-primary-color);
        }
        .tm-sl-scale__value.is-enlarged {
            background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg));
            color: var(--tm-primary-color);
        }

        .tm-sl-freshness { display: inline-flex; align-items: center; gap: 6px; }
        .tm-sl-freshness-dot {
            width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .tm-sl-freshness--fresh .tm-sl-freshness-dot { background: var(--tm-success-color, #22c55e); }
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
            z-index: 70; /* above footer/toolbar chrome */
        }
        .tm-sl-toast.is-visible {
            opacity: 1; pointer-events: auto;
            animation: tm-sl-toast-in 0.2s ease;
        }

        /* —— Apple-inspired polish layer —— */
        .tm-sl-shell {
            --tm-sl-r-xl: 20px;
            --tm-sl-r-lg: 14px;
            --tm-sl-r-md: 11px;
            --tm-sl-r-sm: 8px;
            --tm-sl-hairline: color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
            --tm-sl-fill: color-mix(in srgb, var(--tm-shop-item-border) 22%, var(--tm-shop-item-bg));
            --tm-sl-fill-strong: color-mix(in srgb, var(--tm-shop-item-border) 34%, var(--tm-shop-item-bg));
            --tm-sl-label: color-mix(in srgb, var(--tm-shop-item-text) 72%, transparent);
            --tm-sl-ease: cubic-bezier(0.25, 0.1, 0.25, 1);
            border-radius: var(--tm-sl-r-xl) !important;
            border: 1px solid var(--tm-sl-hairline) !important;
            box-shadow:
                0 0 0 0.5px color-mix(in srgb, #000 8%, transparent),
                0 18px 50px color-mix(in srgb, #000 28%, transparent),
                0 2px 8px color-mix(in srgb, #000 10%, transparent) !important;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
                "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            letter-spacing: -0.01em;
        }
        .tm-sl-shell.tm-sl-view--network {
            border-radius: 16px !important;
        }
        .tm-sl-overlay {
            background: color-mix(in srgb, #000 42%, transparent) !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
        .tm-sl-header {
            padding: 16px 18px 12px !important;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 92%, transparent) !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
            backdrop-filter: saturate(180%) blur(16px);
            -webkit-backdrop-filter: saturate(180%) blur(16px);
            position: relative !important;
            z-index: 30 !important;
            overflow: visible !important;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-header,
        .tm-sl-shell.tm-sl-step--stores .tm-sl-header {
            padding: 14px 16px 10px !important;
        }
        .tm-sl-title {
            font-size: 1.35rem !important;
            font-weight: 700 !important;
            letter-spacing: -0.03em !important;
            line-height: 1.15 !important;
            margin: 0 !important;
        }
        .tm-sl-title--model {
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            letter-spacing: -0.03em !important;
        }
        .tm-sl-subtitle {
            margin: 3px 0 0 !important;
            font-size: 12.5px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
        }
        .tm-sl-header-actions { gap: 6px !important; }
        .tm-sl-btn {
            border-radius: 980px !important;
            border: 0 !important;
            background: var(--tm-sl-fill) !important;
            color: var(--tm-shop-item-text) !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            padding: 8px 12px !important;
            transition: background 0.18s var(--tm-sl-ease), transform 0.18s var(--tm-sl-ease) !important;
        }
        .tm-sl-btn:hover {
            background: var(--tm-sl-fill-strong) !important;
            border-color: transparent !important;
        }
        .tm-sl-btn--icon {
            width: 32px !important;
            height: 32px !important;
            padding: 0 !important;
            display: inline-grid !important;
            place-items: center !important;
        }
        .tm-sl-btn--icon svg {
            width: 15px !important;
            height: 15px !important;
            opacity: 0.78;
        }
        #tm-sl-close.tm-sl-btn--icon {
            font-size: 18px !important;
            font-weight: 400 !important;
            line-height: 1 !important;
            color: var(--tm-sl-label) !important;
        }
        #tm-sl-close.tm-sl-btn--icon:hover {
            color: var(--tm-shop-item-text) !important;
        }
        .tm-sl-btn--back {
            background: transparent !important;
            color: var(--tm-primary-color) !important;
            padding: 6px 8px 6px 4px !important;
            font-weight: 600 !important;
        }
        .tm-sl-btn--back:hover { background: var(--tm-sl-fill) !important; }

        .tm-sl-view-tabs {
            margin-top: 12px !important;
            padding: 3px !important;
            border-radius: 10px !important;
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 18%, var(--tm-sl-hairline)) !important;
            background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-sl-fill)) !important;
            gap: 2px !important;
            box-shadow: none !important;
        }
        .tm-sl-view-tab {
            border-radius: 8px !important;
            font-size: 12.5px !important;
            font-weight: 700 !important;
            padding: 8px 12px !important;
            color: color-mix(in srgb, var(--tm-shop-item-text) 72%, transparent) !important;
            background: transparent !important;
            box-shadow: none !important;
            transition: background 0.18s var(--tm-sl-ease), color 0.18s var(--tm-sl-ease),
                box-shadow 0.18s var(--tm-sl-ease) !important;
        }
        .tm-sl-view-tab:hover {
            color: var(--tm-shop-item-text) !important;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 55%, transparent) !important;
        }
        .tm-sl-view-tab.is-active {
            background: var(--tm-shop-item-bg) !important;
            color: var(--tm-primary-color) !important;
            border: 0 !important;
            box-shadow: 0 1px 3px color-mix(in srgb, var(--tm-primary-color) 18%, transparent),
                0 0 0 1px color-mix(in srgb, var(--tm-primary-color) 22%, transparent) !important;
        }
        .tm-sl-view-tab:focus-visible {
            outline: none !important;
            box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--tm-primary-color) 22%, transparent) !important;
        }

        .tm-sl-toolbar {
            padding: 12px 18px !important;
            border-bottom: 1px solid color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-sl-hairline)) !important;
            background: color-mix(in srgb, var(--tm-primary-color) 5%, var(--tm-shop-item-bg)) !important;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-toolbar {
            padding: 10px 14px !important;
        }
        .tm-sl-search {
            height: 36px !important;
            border-radius: 10px !important;
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 16%, var(--tm-shop-item-border)) !important;
            background: var(--tm-shop-item-bg) !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            color: var(--tm-shop-item-text) !important;
            padding: 0 36px 0 36px !important;
            transition: background 0.18s var(--tm-sl-ease), box-shadow 0.18s var(--tm-sl-ease),
                border-color 0.18s var(--tm-sl-ease) !important;
        }
        .tm-sl-search:focus {
            background: var(--tm-shop-item-bg) !important;
            border-color: var(--tm-primary-color) !important;
            box-shadow: 0 0 0 3.5px color-mix(in srgb, var(--tm-primary-color) 22%, transparent) !important;
        }
        .tm-sl-search-icon { left: 11px !important; opacity: 0.4 !important; }
        .tm-sl-search-kbd {
            right: 8px !important;
            border: 0 !important;
            border-radius: 6px !important;
            background: color-mix(in srgb, var(--tm-shop-item-border) 28%, transparent) !important;
            font-size: 10px !important;
            font-weight: 600 !important;
            color: var(--tm-sl-label) !important;
        }
        .tm-sl-sort-select {
            height: 36px !important;
            border: 1px solid color-mix(in srgb, var(--tm-primary-color) 16%, var(--tm-shop-item-border)) !important;
            border-radius: 10px !important;
            background: var(--tm-shop-item-bg) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            color: var(--tm-shop-item-text) !important;
            padding: 0 12px !important;
        }
        .tm-sl-recent { gap: 6px !important; margin-top: 2px !important; }
        .tm-sl-recent__label {
            font-size: 11px !important;
            font-weight: 700 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
            text-transform: none !important;
        }
        .tm-sl-recent__chip {
            border: 1px solid color-mix(in srgb, var(--tm-info-color, #0ea5e9) 28%, var(--tm-shop-item-border)) !important;
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 10%, var(--tm-shop-item-bg)) !important;
            color: var(--tm-shop-item-text) !important;
            border-radius: 980px !important;
            padding: 5px 11px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            transition: background 0.18s var(--tm-sl-ease), color 0.18s var(--tm-sl-ease),
                border-color 0.18s var(--tm-sl-ease) !important;
        }
        .tm-sl-recent__chip:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, var(--tm-shop-item-bg)) !important;
            border-color: color-mix(in srgb, var(--tm-primary-color) 40%, transparent) !important;
            color: var(--tm-primary-color) !important;
        }

        .tm-sl-chips { gap: 6px !important; margin-top: 8px !important; }
        .tm-sl-chip {
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, var(--tm-primary-color)) !important;
            background: color-mix(in srgb, var(--tm-primary-color) 6%, var(--tm-shop-item-bg)) !important;
            color: var(--tm-shop-item-text) !important;
            border-radius: 980px !important;
            padding: 6px 11px !important;
            font-size: 11.5px !important;
            font-weight: 700 !important;
            transition: background 0.18s var(--tm-sl-ease), color 0.18s var(--tm-sl-ease),
                border-color 0.18s var(--tm-sl-ease), transform 0.12s var(--tm-sl-ease) !important;
        }
        .tm-sl-chip:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-shop-item-bg)) !important;
            border-color: color-mix(in srgb, var(--tm-primary-color) 40%, var(--tm-shop-item-border)) !important;
        }
        .tm-sl-chip.is-active {
            background: color-mix(in srgb, var(--tm-primary-color) 20%, var(--tm-shop-item-bg)) !important;
            color: var(--tm-primary-color) !important;
            border-color: color-mix(in srgb, var(--tm-primary-color) 50%, transparent) !important;
            box-shadow: 0 0 0 1px color-mix(in srgb, var(--tm-primary-color) 18%, transparent);
        }
        .tm-sl-chip-count { opacity: 0.7 !important; font-weight: 650 !important; }
        .tm-sl-context-strip {
            font-size: 12.5px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
        }
        .tm-sl-context-strip__filters {
            color: var(--tm-shop-item-text) !important;
            font-weight: 600 !important;
        }

        .tm-sl-body {
            padding: 16px 18px !important;
            background: color-mix(in srgb, var(--tm-primary-color) 4%, var(--tm-sl-fill)) !important;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-body {
            background: color-mix(in srgb, var(--tm-info-color, #0ea5e9) 4%, var(--tm-shop-item-bg)) !important;
        }
        .tm-sl-shell:not(.tm-sl-view--network).tm-sl-step--stores .tm-sl-body {
            padding: 14px 16px !important;
            background: color-mix(in srgb, var(--tm-sl-fill) 45%, var(--tm-shop-item-bg)) !important;
        }

        .tm-sl-model-grid {
            gap: 12px !important;
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)) !important;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-model-grid {
            gap: 10px !important;
            padding: 12px 14px !important;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
        }
        .tm-sl-model-card {
            border-radius: var(--tm-sl-r-lg) !important;
            padding: 14px 14px 12px !important;
            transition: transform 0.18s var(--tm-sl-ease), box-shadow 0.18s var(--tm-sl-ease),
                background 0.18s var(--tm-sl-ease), border-color 0.18s var(--tm-sl-ease) !important;
        }
        .tm-sl-model-card:active { transform: translateY(0) scale(0.995); }
        .tm-sl-model-name {
            font-size: 17px !important;
            font-weight: 800 !important;
            letter-spacing: -0.03em !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            color: var(--tm-shop-item-text) !important;
        }
        .tm-sl-shell.tm-sl-view--network .tm-sl-model-name {
            font-size: 15px !important;
        }
        .tm-sl-model-card-foot {
            margin-top: 10px !important;
            padding-top: 10px !important;
            border-top: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 75%, transparent) !important;
            gap: 8px !important;
        }
        .tm-sl-model-count {
            font-size: 15px !important;
            font-weight: 800 !important;
            letter-spacing: -0.02em !important;
            color: var(--tm-primary-color) !important;
            font-variant-numeric: tabular-nums;
        }
        .tm-sl-model-count span {
            font-size: 11px !important;
            font-weight: 650 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
        }
        .tm-sl-model-meta {
            font-size: 12px !important;
            font-weight: 650 !important;
            color: var(--tm-sl-label) !important;
            margin: 0 !important;
        }
        .tm-sl-grade-chip {
            border-radius: 7px !important;
            font-size: 10.5px !important;
            font-weight: 750 !important;
            padding: 3px 8px !important;
            box-shadow: 0 0 0 1px color-mix(in srgb, #000 8%, transparent);
        }
        .tm-sl-whisper {
            border-radius: 980px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            padding: 4px 9px !important;
            margin: 0 !important;
            align-self: flex-start;
        }
        .tm-sl-hl {
            background: color-mix(in srgb, var(--tm-primary-color) 26%, transparent) !important;
            border-radius: 4px !important;
            padding: 0 2px !important;
        }

        .tm-sl-mine-board {
            border: 0 !important;
            border-radius: var(--tm-sl-r-lg) !important;
            box-shadow: 0 0 0 0.5px color-mix(in srgb, #000 8%, transparent),
                0 1px 2px color-mix(in srgb, #000 4%, transparent) !important;
            background: var(--tm-shop-item-bg) !important;
        }
        .tm-sl-mine-detail-head {
            padding: 12px 14px !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
            background: transparent !important;
        }
        .tm-sl-mine-detail-head h3 {
            font-size: 13px !important;
            font-weight: 650 !important;
            letter-spacing: -0.01em !important;
        }
        .tm-sl-mine-detail-head__meta {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
        }
        .tm-sl-insight {
            border: 0 !important;
            border-radius: 12px !important;
            background: var(--tm-sl-fill) !important;
            padding: 10px 12px !important;
            font-size: 12.5px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
        }
        .tm-sl-insight__best {
            font-weight: 650 !important;
            letter-spacing: -0.01em !important;
        }

        .tm-sl-unit-table {
            font-size: 13px !important;
        }
        .tm-sl-unit-table thead {
            background: color-mix(in srgb, var(--tm-sl-fill) 70%, var(--tm-shop-item-bg)) !important;
        }
        .tm-sl-unit-table th {
            padding: 9px 14px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            letter-spacing: -0.01em !important;
            text-transform: none !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
        }
        .tm-sl-unit-table td {
            padding: 12px 14px !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
        }
        .tm-sl-unit-table tbody tr:last-child td { border-bottom: 0 !important; }
        .tm-sl-unit-table tbody tr:hover td {
            background: color-mix(in srgb, var(--tm-sl-fill) 55%, transparent) !important;
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--best td {
            background: color-mix(in srgb, var(--tm-success-color, #16a34a) 7%, var(--tm-shop-item-bg)) !important;
        }
        .tm-sl-unit-table tbody tr.tm-sl-unit-row--best td:first-child {
            box-shadow: inset 2.5px 0 0 var(--tm-success-color, #16a34a) !important;
        }
        .tm-sl-unit-table .tm-sl-table-grade {
            min-width: 28px !important;
            padding: 3px 8px !important;
            border-radius: 7px !important;
            font-size: 10.5px !important;
            font-weight: 700 !important;
        }
        .tm-sl-unit-table .tm-sl-table-gb { font-weight: 600 !important; }
        .tm-sl-unit-table .tm-sl-table-barcode {
            font-family: "SF Mono", ui-monospace, SFMono-Regular, Menlo, monospace !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            border-bottom: none !important;
            color: var(--tm-primary-color) !important;
            padding: 2px 0 !important;
        }
        .tm-sl-table-barcode-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
            min-width: 0;
        }
        .tm-sl-phone-tags {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;
        }
        .tm-sl-phone-tag {
            appearance: none;
            border: 1px solid color-mix(in srgb, var(--tm-sl-tag-color, #9e9e9e) 45%, transparent);
            background: color-mix(in srgb, var(--tm-sl-tag-color, #9e9e9e) 16%, var(--tm-shop-item-bg));
            color: var(--tm-sl-tag-color, #9e9e9e);
            border-radius: 980px;
            padding: 2px 8px;
            font-size: 10.5px;
            font-weight: 750;
            line-height: 1.3;
            cursor: pointer;
        }
        .tm-sl-phone-tag:hover {
            background: color-mix(in srgb, var(--tm-sl-tag-color, #9e9e9e) 28%, var(--tm-shop-item-bg));
        }
        .tm-sl-phone-tag-add {
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 980px;
            border: 1px dashed color-mix(in srgb, var(--tm-primary-color) 40%, var(--tm-shop-item-border));
            background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg));
            color: var(--tm-primary-color);
            font-size: 14px;
            font-weight: 700;
            line-height: 1;
            cursor: pointer;
            display: inline-grid;
            place-items: center;
            padding: 0;
        }
        .tm-sl-phone-tag-add:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 16%, var(--tm-shop-item-bg));
            border-style: solid;
        }
        .tm-sl-chip-tag-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 4px;
            vertical-align: 0;
            box-shadow: 0 0 0 1px color-mix(in srgb, #000 12%, transparent);
        }
        .tm-sl-tag-picker {
            position: fixed;
            z-index: 100060;
            min-width: 210px;
            max-width: 280px;
            max-height: min(320px, 60vh);
            overflow: auto;
            padding: 6px;
            border-radius: 12px;
            border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, var(--tm-primary-color));
            background: var(--tm-shop-item-bg);
            box-shadow: 0 14px 40px color-mix(in srgb, #000 28%, transparent);
        }
        .tm-sl-tag-picker__empty {
            padding: 12px;
            font-size: 12px;
            font-weight: 600;
            color: var(--tm-muted-text, var(--tm-shop-item-text));
            line-height: 1.4;
        }
        .tm-sl-tag-picker__item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
            background: transparent;
            color: var(--tm-shop-item-text);
            text-align: left;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 650;
            cursor: pointer;
        }
        .tm-sl-tag-picker__item:hover {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
        }
        .tm-sl-tag-picker__item.is-active {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
            color: var(--tm-primary-color);
        }
        .tm-sl-tag-picker__dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
            box-shadow: 0 0 0 1px color-mix(in srgb, #000 15%, transparent);
        }
        .tm-sl-tag-picker__name { flex: 1; min-width: 0; }
        .tm-sl-tag-picker__check {
            font-size: 12px;
            font-weight: 800;
            opacity: 0.85;
            min-width: 12px;
        }
        .tm-sl-unit-table .tm-sl-table-barcode:hover {
            opacity: 0.75;
        }
        .tm-sl-unit-table .tm-sl-table-price {
            font-weight: 650 !important;
            font-variant-numeric: tabular-nums;
            letter-spacing: -0.01em !important;
        }
        .tm-sl-unit-table .tm-sl-table-status {
            font-size: 12px !important;
            font-weight: 600 !important;
        }
        .tm-sl-table-imei {
            font-family: "SF Mono", ui-monospace, Menlo, monospace !important;
            font-size: 10.5px !important;
        }

        .tm-sl-network-board {
            background: var(--tm-shop-item-bg) !important;
        }
        .tm-sl-network-stores {
            background: color-mix(in srgb, var(--tm-sl-fill) 65%, var(--tm-shop-item-bg)) !important;
            border-right: 0.5px solid var(--tm-sl-hairline) !important;
        }
        .tm-sl-network-stores__label {
            padding: 12px 14px 8px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            letter-spacing: -0.01em !important;
            text-transform: none !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
        }
        .tm-sl-network-store {
            padding: 11px 14px !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
            border-left: 0 !important;
            gap: 4px !important;
            transition: background 0.15s var(--tm-sl-ease) !important;
        }
        .tm-sl-network-store:hover {
            background: color-mix(in srgb, var(--tm-shop-item-bg) 70%, transparent) !important;
        }
        .tm-sl-network-store.is-active {
            background: var(--tm-shop-item-bg) !important;
            border-left: 0 !important;
            box-shadow: inset 3px 0 0 var(--tm-primary-color) !important;
        }
        .tm-sl-network-store__name {
            font-size: 13px !important;
            font-weight: 650 !important;
            letter-spacing: -0.015em !important;
        }
        .tm-sl-network-store__meta {
            font-size: 11px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
        }
        .tm-sl-network-store.is-recommended .tm-sl-network-store__name::after {
            content: 'Προτεινόμενο' !important;
            margin-left: 7px !important;
            font-size: 10px !important;
            font-weight: 650 !important;
            letter-spacing: 0 !important;
            text-transform: none !important;
            color: var(--tm-success-color, #16a34a) !important;
            background: color-mix(in srgb, var(--tm-success-color, #16a34a) 12%, transparent);
            padding: 1px 6px;
            border-radius: 980px;
            vertical-align: 1px !important;
        }
        .tm-sl-network-detail-head {
            padding: 12px 16px !important;
            border-bottom: 0.5px solid var(--tm-sl-hairline) !important;
            background: transparent !important;
        }
        .tm-sl-network-detail-head h3 {
            font-size: 15px !important;
            font-weight: 700 !important;
            letter-spacing: -0.02em !important;
        }
        .tm-sl-network-detail-head__meta {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
        }
        .tm-sl-store-dist {
            border: 0 !important;
            background: var(--tm-sl-fill) !important;
            color: var(--tm-shop-item-text) !important;
            font-weight: 600 !important;
            border-radius: 980px !important;
            padding: 2px 8px !important;
        }

        .tm-sl-footer {
            padding: 10px 16px !important;
            border-top: 0.5px solid var(--tm-sl-hairline) !important;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 92%, transparent) !important;
            font-size: 11.5px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
            backdrop-filter: saturate(160%) blur(12px);
            -webkit-backdrop-filter: saturate(160%) blur(12px);
            position: relative !important;
            z-index: 8 !important;
        }
        #tm-sl-status { color: var(--tm-sl-label); font-weight: 500; }
        .tm-sl-density-btn {
            border: 0 !important;
            border-radius: 980px !important;
            background: var(--tm-sl-fill) !important;
            padding: 5px 10px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
        }
        .tm-sl-density-btn:hover,
        .tm-sl-density-btn.is-compact {
            background: var(--tm-sl-fill-strong) !important;
            border-color: transparent !important;
        }
        .tm-sl-scale {
            border: 0 !important;
            border-radius: 980px !important;
            background: var(--tm-sl-fill) !important;
            overflow: hidden;
        }
        .tm-sl-scale__btn,
        .tm-sl-scale__value {
            border: 0 !important;
            border-left: 0 !important;
            border-right: 0 !important;
            font-weight: 650 !important;
            color: var(--tm-shop-item-text) !important;
        }
        .tm-sl-scale__value {
            min-width: 48px !important;
            font-variant-numeric: tabular-nums;
            background: transparent !important;
        }
        .tm-sl-scale__value.is-enlarged {
            color: var(--tm-primary-color) !important;
            background: transparent !important;
        }
        .tm-sl-freshness-dot {
            width: 7px !important;
            height: 7px !important;
        }

        .tm-sl-toast {
            border-radius: 980px !important;
            padding: 11px 16px !important;
            font-size: 12.5px !important;
            font-weight: 600 !important;
            letter-spacing: -0.01em !important;
            background: color-mix(in srgb, #1c1c1e 92%, transparent) !important;
            box-shadow: 0 10px 30px color-mix(in srgb, #000 30%, transparent) !important;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        .tm-sl-toast__open {
            border: 0 !important;
            background: color-mix(in srgb, #fff 16%, transparent) !important;
            border-radius: 980px !important;
            padding: 4px 10px !important;
            font-weight: 650 !important;
        }
        .tm-sl-load {
            margin: 10px 16px 0 !important;
            border: 0 !important;
            border-radius: 12px !important;
            background: var(--tm-sl-fill) !important;
            padding: 12px 14px !important;
        }
        .tm-sl-load__label { font-weight: 650 !important; }
        .tm-sl-load__track {
            height: 4px !important;
            background: color-mix(in srgb, var(--tm-shop-item-border) 40%, transparent) !important;
        }
        .tm-sl-empty-title {
            font-size: 17px !important;
            font-weight: 700 !important;
            letter-spacing: -0.02em !important;
        }
        .tm-sl-empty-sub {
            font-size: 13px !important;
            font-weight: 500 !important;
            color: var(--tm-sl-label) !important;
            opacity: 1 !important;
        }
        .tm-sl-btn--primary-action {
            border: 0 !important;
            border-radius: 980px !important;
            background: var(--tm-primary-color) !important;
            color: #fff !important;
            font-weight: 650 !important;
            padding: 9px 16px !important;
        }
        .tm-sl-settings-wrap { z-index: 40 !important; }
        .tm-sl-settings-menu,
        .tm-sl-export-menu {
            border-radius: 14px !important;
            border: 0.5px solid var(--tm-sl-hairline) !important;
            box-shadow: 0 12px 40px color-mix(in srgb, #000 22%, transparent) !important;
            padding: 6px !important;
            z-index: 50 !important;
        }
        .tm-sl-settings-menu.tm-sl-menu--fixed,
        .tm-sl-export-menu.tm-sl-menu--fixed {
            overflow: auto !important;
            z-index: 100060 !important;
        }
        .tm-sl-toast {
            z-index: 70 !important;
        }
        .tm-sl-footer {
            z-index: 8 !important;
        }
        .tm-sl-settings-menu button,
        .tm-sl-export-menu button {
            border-radius: 8px !important;
            font-weight: 500 !important;
        }

        @media (prefers-reduced-motion: reduce) {
            .tm-sl-model-card,
            .tm-sl-btn,
            .tm-sl-chip,
            .tm-sl-view-tab,
            .tm-sl-recent__chip {
                transition: none !important;
            }
            .tm-sl-model-card:hover { transform: none !important; }
            .tm-sl-overlay {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }
        }
    `;

    function buildSkeletonGrid(count = 8) {
        const cards = Array.from({ length: count }, (_, i) =>
            `<div class="tm-sl-skeleton-card" style="--i:${Math.min(i, 7)}"></div>`).join('');
        return `<div class="tm-sl-skeleton-grid">${cards}</div>`;
    }

    function buildSkeletonNetworkBoard() {
        const navRows = Array.from({ length: 8 }, () => '<div class="tm-sl-skeleton-row"></div>').join('');
        const tableLines = Array.from({ length: 12 }, () => '<div class="tm-sl-skeleton-line"></div>').join('');
        return `<div class="tm-sl-skeleton-network">
            <div class="tm-sl-skeleton-network__nav">${navRows}</div>
            <div class="tm-sl-skeleton-network__main">${tableLines}</div>
        </div>`;
    }

    function buildSkeletonStores(count = 6) {
        const rows = Array.from({ length: count }, () => '<div class="tm-sl-skeleton-row"></div>').join('');
        return `<div class="tm-sl-skeleton-stores">${rows}</div>`;
    }

    function buildSkeletonMineBoard() {
        const lines = Array.from({ length: 8 }, () => '<div class="tm-sl-skeleton-line"></div>').join('');
        return `<div class="tm-sl-skeleton-mine">${lines}</div>`;
    }

    function buildEmptyState(icon, title, sub, opts) {
        const action = opts?.actionLabel
            ? `<div class="tm-sl-empty-actions">
                <button type="button" class="tm-sl-btn tm-sl-btn--primary-action" data-tm-sl-empty-action="${esc(opts.actionId || 'clear-filters')}">${esc(opts.actionLabel)}</button>
            </div>`
            : '';
        return `<div class="tm-sl-empty">
            <div class="tm-sl-empty-icon" aria-hidden="true">${icon || ICON.emptyPhone}</div>
            <div class="tm-sl-empty-title">${esc(title)}</div>
            ${sub ? `<div class="tm-sl-empty-sub">${esc(sub)}</div>` : ''}
            ${action}
        </div>`;
    }

    function buildStatusLegend(opts = {}) {
        const showPurchase = opts.showPurchaseStatus !== false;
        return `<div class="tm-sl-legend" aria-label="Υπόμνημα κατάστασης">
            <span class="tm-sl-legend__label">Κατάσταση</span>
            <span class="tm-sl-legend-item tm-sl-legend-item--ok">Διαθέσιμο</span>
            <span class="tm-sl-legend-item tm-sl-legend-item--bb">BB</span>
            ${showPurchase ? '<span class="tm-sl-legend-item tm-sl-legend-item--no">Δεν αγοράζεται</span>' : ''}
        </div>`;
    }

    function buildContextStrip({ viewLabel, modelName, filtersSummary }) {
        const parts = [
            `<span class="tm-sl-context-strip__view" title="${esc(viewLabel)}">${esc(viewLabel)}</span>`,
            '<span class="tm-sl-context-strip__sep" aria-hidden="true">›</span>',
            `<span class="tm-sl-context-strip__model">${esc(modelName)}</span>`,
        ];
        if (filtersSummary) {
            parts.push('<span class="tm-sl-context-strip__sep" aria-hidden="true">·</span>');
            parts.push(`<span class="tm-sl-context-strip__filters">${esc(filtersSummary)}</span>`);
        }
        return `<div class="tm-sl-context-strip" id="tm-sl-context-strip">${parts.join('')}</div>`;
    }

    function formatActiveFiltersSummary(active) {
        const bits = [];
        if (active?.grade) bits.push(`Βαθμ. ${active.grade}`);
        if (active?.gb) bits.push(active.gb);
        if (active?.color) bits.push(active.color);
        if (active?.tag) {
            const name = typeof window.getTagDisplayName === 'function'
                ? window.getTagDisplayName(active.tag)
                : active.tag;
            bits.push(`#${name}`);
        }
        return bits.length ? bits.join(' · ') : 'Χωρίς φίλτρα';
    }

    function phoneTagChipHTML(tagKey, barcode, opts = {}) {
        const key = typeof window.normalizeTagKey === 'function'
            ? window.normalizeTagKey(tagKey)
            : String(tagKey || '').trim().toLowerCase();
        if (!key) return '';
        const name = typeof window.getTagDisplayName === 'function'
            ? window.getTagDisplayName(key)
            : key;
        const color = typeof window.getTagColor === 'function'
            ? window.getTagColor(key)
            : '#9e9e9e';
        const removable = opts.removable !== false;
        const title = removable ? `Αφαίρεση #${name}` : `#${name}`;
        return `<button type="button" class="tm-sl-phone-tag" data-tm-sl-tag-key="${esc(key)}"
            data-tm-sl-tag-barcode="${esc(barcode || '')}" title="${esc(title)}"
            style="--tm-sl-tag-color:${esc(color)}">#${esc(name)}</button>`;
    }

    function buildPhoneTagsHTML(barcode) {
        const tags = typeof window.getPhoneTags === 'function' ? (window.getPhoneTags(barcode) || []) : [];
        const chips = tags.map((key) => phoneTagChipHTML(key, barcode)).join('');
        return `<div class="tm-sl-phone-tags">
            ${chips}
            <button type="button" class="tm-sl-phone-tag-add" data-tm-sl-tag-edit="${esc(barcode)}"
                title="Διαχείριση ετικετών" aria-label="Ετικέτες">+</button>
        </div>`;
    }

    function showPhoneTagPicker(anchorEl, barcode, onChange) {
        document.querySelectorAll('.tm-sl-tag-picker').forEach((el) => el.remove());
        const code = String(barcode || '').trim();
        if (!code || !anchorEl) return;

        const selectable = typeof window.getSelectableTagKeys === 'function'
            ? window.getSelectableTagKeys()
            : (typeof window.getDefinedTagKeys === 'function' ? window.getDefinedTagKeys() : []);
        const active = new Set(
            typeof window.getPhoneTags === 'function' ? (window.getPhoneTags(code) || []) : []
        );

        const menu = document.createElement('div');
        menu.className = 'tm-sl-tag-picker';
        menu.setAttribute('role', 'menu');

        if (!selectable.length) {
            menu.innerHTML = `<div class="tm-sl-tag-picker__empty">Δημιουργήστε ετικέτες από Ρυθμίσεις → Διαχείριση Ετικετών</div>`;
        } else {
            menu.innerHTML = selectable.map((key) => {
                const name = typeof window.getTagDisplayName === 'function' ? window.getTagDisplayName(key) : key;
                const color = typeof window.getTagColor === 'function' ? window.getTagColor(key) : '#9e9e9e';
                const isOn = active.has(key);
                return `<button type="button" class="tm-sl-tag-picker__item${isOn ? ' is-active' : ''}"
                    data-tm-sl-tag-toggle="${esc(key)}" role="menuitemcheckbox" aria-checked="${isOn ? 'true' : 'false'}">
                    <span class="tm-sl-tag-picker__dot" style="background:${esc(color)}"></span>
                    <span class="tm-sl-tag-picker__name">#${esc(name)}</span>
                    <span class="tm-sl-tag-picker__check" aria-hidden="true">${isOn ? '✓' : ''}</span>
                </button>`;
            }).join('');
        }

        document.body.appendChild(menu);
        const rect = anchorEl.getBoundingClientRect();
        const menuW = Math.min(260, Math.max(200, menu.offsetWidth || 220));
        let left = rect.right - menuW;
        let top = rect.bottom + 6;
        if (left < 8) left = 8;
        if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
        if (top + menu.offsetHeight > window.innerHeight - 8) {
            top = Math.max(8, rect.top - menu.offsetHeight - 6);
        }
        menu.style.left = `${Math.round(left)}px`;
        menu.style.top = `${Math.round(top)}px`;

        const close = () => {
            menu.remove();
            document.removeEventListener('mousedown', onDoc, true);
            document.removeEventListener('keydown', onKey, true);
        };
        const onDoc = (e) => {
            if (menu.contains(e.target) || anchorEl.contains?.(e.target)) return;
            close();
        };
        const onKey = (e) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('mousedown', onDoc, true);
        document.addEventListener('keydown', onKey, true);

        menu.querySelectorAll('[data-tm-sl-tag-toggle]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.getAttribute('data-tm-sl-tag-toggle');
                if (!key || typeof window.togglePhoneTag !== 'function') return;
                window.togglePhoneTag(code, key);
                close();
                if (typeof onChange === 'function') onChange();
            });
        });
    }

    function buildCoachTipHtml() {
        return '';
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

    function getMyStoreLabel() {
        const name = typeof window.getCurrentStoreName === 'function'
            ? String(window.getCurrentStoreName() || '').trim()
            : '';
        return name || 'Το κατάστημά μου';
    }

    function updateMyStoreLabels(overlay) {
        const label = getMyStoreLabel();
        const mineTab = overlay?.querySelector('#tm-sl-view-mine');
        const mystoreBtn = overlay?.querySelector('#tm-sl-mystore-btn');
        const titleEl = overlay?.querySelector('#tm-sl-title');
        const shell = overlay?.querySelector('#tm-sl-shell');
        if (mineTab) {
            mineTab.textContent = label;
            mineTab.title = label;
        }
        if (mystoreBtn) {
            mystoreBtn.innerHTML = `${ICON.pin} ${esc(label)}`;
            mystoreBtn.title = 'Αλλαγή καταστήματος';
        }
        if (titleEl && shell
            && !shell.classList.contains('tm-sl-step--stores')
            && !shell.classList.contains('tm-sl-view--network')) {
            titleEl.textContent = label;
        }
    }

    function ensureStylesInjected() {
        let style = document.getElementById('tm-sl-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-sl-styles';
            document.head.appendChild(style);
        }
        // Always refresh so silent updates / local rebuilds aren't stuck on old CSS.
        style.textContent = STYLES;
    }

    function buildShellHTML() {
        ensureStylesInjected();
        const myStoreLabel = getMyStoreLabel();
        return `
        <div class="tm-sl-shell" id="tm-sl-shell">
            <header class="tm-sl-header">
                <div id="tm-sl-breadcrumb-wrap" hidden>${buildBreadcrumb('models')}</div>
                <div class="tm-sl-header-row">
                    <div class="tm-sl-title-block">
                        <h2 class="tm-sl-title" id="tm-sl-title">${esc(myStoreLabel)}</h2>
                        <p class="tm-sl-subtitle" id="tm-sl-subtitle">Τι έχετε σε stock τώρα</p>
                    </div>
                    <div class="tm-sl-header-actions">
                        <button type="button" id="tm-sl-refresh" class="tm-sl-btn tm-sl-btn--icon" title="Ανανέωση" aria-label="Ανανέωση">${ICON.refresh}</button>
                        <div class="tm-sl-settings-wrap">
                            <button type="button" id="tm-sl-settings" class="tm-sl-btn tm-sl-btn--icon" title="Ρυθμίσεις" aria-haspopup="true">${ICON.settings}</button>
                            <div id="tm-sl-settings-menu" class="tm-sl-settings-menu" hidden>
                                <button type="button" id="tm-sl-mystore-btn" title="Αλλαγή καταστήματος">${ICON.pin} ${esc(myStoreLabel)}</button>
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
                    <button type="button" id="tm-sl-view-mine" class="tm-sl-view-tab is-active" role="tab" aria-selected="true" title="${esc(myStoreLabel)}">${esc(myStoreLabel)}</button>
                    <button type="button" id="tm-sl-view-network" class="tm-sl-view-tab" role="tab" aria-selected="false">Άλλα καταστήματα</button>
                </nav>
            </header>
            <div class="tm-sl-toolbar" id="tm-sl-toolbar"></div>
            <div class="tm-sl-load" id="tm-sl-load" hidden>
                <div class="tm-sl-load__row">
                    <span class="tm-sl-load__label" id="tm-sl-load-label">Φόρτωση…</span>
                    <span class="tm-sl-load__eta" id="tm-sl-load-eta"></span>
                </div>
                <div class="tm-sl-load__track" aria-hidden="true">
                    <div class="tm-sl-load__bar" id="tm-sl-load-bar"></div>
                </div>
                <div class="tm-sl-load__meta" id="tm-sl-load-meta"></div>
            </div>
            <div class="tm-sl-body" id="tm-sl-body">${buildSkeletonGrid(6)}</div>
            <footer class="tm-sl-footer">
                <span id="tm-sl-status">—</span>
                <div class="tm-sl-footer-right">
                    <div class="tm-sl-scale" role="group" aria-label="Μέγεθος πίνακα">
                        <button type="button" class="tm-sl-scale__btn" id="tm-sl-scale-down" title="Μικρότερο κείμενο" aria-label="Μικρότερο">A−</button>
                        <button type="button" class="tm-sl-scale__value" id="tm-sl-scale-value" title="Επαναφορά στο προεπιλεγμένο (115%)">115%</button>
                        <button type="button" class="tm-sl-scale__btn" id="tm-sl-scale-up" title="Μεγαλύτερο κείμενο" aria-label="Μεγαλύτερο">A+</button>
                    </div>
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

    function buildModelSearchToolbar(activeSort, opts = {}) {
        const sorts = [
            ['name', 'Όνομα'],
            ['stores', 'Περισσότερα κατ.'],
            ['stock', 'Περισσότερο stock'],
        ];
        const options = sorts.map(([key, label]) =>
            `<option value="${key}"${activeSort === key ? ' selected' : ''}>${esc(label)}</option>`
        ).join('');
        const recent = Array.isArray(opts.recentModels) ? opts.recentModels.filter(Boolean).slice(0, 5) : [];
        const recentHtml = recent.length
            ? `<div class="tm-sl-recent" id="tm-sl-recent">
                <span class="tm-sl-recent__label">Πρόσφατα</span>
                ${recent.map((m) =>
                    `<button type="button" class="tm-sl-recent__chip" data-tm-sl-recent="${esc(m)}" title="${esc(m)}">${esc(shortRecentLabel(m))}</button>`
                ).join('')}
            </div>`
            : '';
        return `
            <div class="tm-sl-toolbar-row">
                <div class="tm-sl-search-wrap">
                    <span class="tm-sl-search-icon">${ICON.search}</span>
                    <input type="search" id="tm-sl-model-search" class="tm-sl-search"
                        placeholder="Μοντέλο, barcode ή IMEI" autocomplete="off">
                    <span class="tm-sl-search-kbd" aria-hidden="true">/</span>
                </div>
                <select id="tm-sl-model-sort" class="tm-sl-sort-select" aria-label="Ταξινόμηση" data-tm-sl-sort-select>
                    ${options}
                </select>
            </div>
            ${recentHtml}`;
    }

    function shortRecentLabel(model) {
        return String(model || '')
            .replace(/^IPHONE\s+/i, '')
            .replace(/^SAMSUNG\s+/i, '')
            .trim() || String(model || '');
    }

    function buildStoreToolbar(modelName, chipsHtml, opts) {
        const filtersSummary = opts?.filtersSummary || 'Χωρίς φίλτρα';
        const qtyLabel = opts?.qtyLabel || '';
        const chips = chipsHtml
            ? `<div class="tm-sl-chips" id="tm-sl-chips">${chipsHtml}</div>`
            : '';
        const contextBits = [
            `<span class="tm-sl-context-strip__filters">${esc(filtersSummary)}</span>`,
        ];
        if (qtyLabel) {
            contextBits.push('<span class="tm-sl-context-strip__sep" aria-hidden="true">·</span>');
            contextBits.push(`<span class="tm-sl-context-strip__view">${esc(qtyLabel)}</span>`);
        }
        return `
            <div class="tm-sl-toolbar-row">
                <button type="button" id="tm-sl-back" class="tm-sl-btn tm-sl-btn--back">${ICON.back} Μοντέλα</button>
                <div class="tm-sl-context-strip" id="tm-sl-context-strip">${contextBits.join('')}</div>
            </div>
            ${chips ? `<div class="tm-sl-toolbar-row">${chips}</div>` : ''}`;
    }

    function buildModelGrid(models, ctx) {
        const myStoreLabel = getMyStoreLabel();
        if (!models.length) {
            const emptyMsg = ctx?.catalogView === 'mine'
                ? `Δεν βρέθηκαν συσκευές στο ${myStoreLabel}`
                : 'Δεν βρέθηκαν μοντέλα σε άλλα καταστήματα';
            const hasQuery = !!(ctx?.query);
            return buildEmptyState(
                hasQuery ? ICON.emptySearch : ICON.emptyPhone,
                hasQuery ? 'Κανένα αποτέλεσμα' : 'Δεν βρέθηκαν μοντέλα',
                hasQuery
                    ? 'Δοκιμάστε άλλο όρο αναζήτησης ή καθαρίστε την αναζήτηση.'
                    : `${emptyMsg}. Πατήστε Ανανέωση αν περιμένετε νέα stock.`,
                hasQuery
                    ? { actionId: 'clear-search', actionLabel: 'Καθαρισμός αναζήτησης' }
                    : { actionId: 'refresh', actionLabel: 'Ανανέωση δεδομένων' }
            );
        }
        const query = ctx?.query || '';
        const catalogView = ctx?.catalogView || 'mine';
        const getGradeStyle = ctx?.getGradeStyle || (() => '');
        const getNearestHint = ctx?.getNearestStoreHint;
        const cards = models.map(([model, data], i) => {
            const grades = Object.entries(data.grades || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([g, n]) => gradeChipHTML(g, n, getGradeStyle))
                .join('');
            const heat = getModelHeatClass(data);
            const delay = Math.min(i, 7);

            if (catalogView === 'mine') {
                const count = data.myCount || data.totalUnits || 0;
                const whisper = count === 1
                    ? '<span class="tm-sl-whisper tm-sl-whisper--warn">Τελευταίο τεμ.</span>'
                    : '';
                return `<div class="tm-sl-model-card ${heat}" role="button" tabindex="0"
                    data-tm-sl-model="${esc(model)}" style="--i:${delay}">
                    <div class="tm-sl-model-name">${highlightMatch(model, query)}</div>
                    <div class="tm-sl-model-card-foot">
                        <div class="tm-sl-model-stats">
                            <span class="tm-sl-model-count">${count}<span>τεμ.</span></span>
                            <span class="tm-sl-model-meta">στο ${esc(myStoreLabel)}</span>
                        </div>
                        ${whisper}
                        ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
                    </div>
                </div>`;
            }

            const nearest = typeof getNearestHint === 'function' ? getNearestHint(model, data) : '';
            let whisper = '';
            if (nearest) {
                whisper = `<span class="tm-sl-whisper">Κοντύτερο · ${esc(nearest)}</span>`;
            } else if (data.storeCount === 1) {
                whisper = '<span class="tm-sl-whisper tm-sl-whisper--warn">Σπάνιο στο δίκτυο</span>';
            }
            const storeWord = data.storeCount === 1 ? 'κατ.' : 'κατ.';
            return `<div class="tm-sl-model-card ${heat}" role="button" tabindex="0"
                data-tm-sl-model="${esc(model)}" style="--i:${delay}">
                <div class="tm-sl-model-name">${highlightMatch(model, query)}</div>
                <div class="tm-sl-model-card-foot">
                    <div class="tm-sl-model-stats">
                        <span class="tm-sl-model-count">${data.storeCount || 0}<span>${storeWord}</span></span>
                        <span class="tm-sl-model-meta">${data.totalUnits || 0} τεμ. στο δίκτυο</span>
                    </div>
                    ${whisper}
                    ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
                </div>
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
                const countHtml = count != null ? `<span class="tm-sl-chip-count">· ${count}</span>` : '';
                let inner = esc(val);
                if (key === 'color') {
                    inner = `${colorSwatchHTML(val, hexMap)} ${esc(val)}`;
                } else if (key === 'grade') {
                    inner = `<span class="tm-sl-chip-grade" style="${getGradeStyle(val)}">${esc(val)}</span>`;
                } else if (key === 'tag') {
                    const name = typeof window.getTagDisplayName === 'function'
                        ? window.getTagDisplayName(val)
                        : val;
                    const color = typeof window.getTagColor === 'function'
                        ? window.getTagColor(val)
                        : '#9e9e9e';
                    inner = `<span class="tm-sl-chip-tag-dot" style="background:${esc(color)}"></span>#${esc(name)}`;
                }
                parts.push(`<button type="button" class="tm-sl-chip${isActive ? ' is-active' : ''}${key === 'tag' ? ' tm-sl-chip--tag' : ''}"
                    data-tm-sl-filter="${esc(key)}" data-tm-sl-value="${esc(val)}">${inner}${countHtml}</button>`);
            });
        };
        addGroup('grade', filters.grades);
        addGroup('gb', filters.gbs);
        addGroup('color', filters.colors);
        addGroup('tag', filters.tags || []);
        if (active.grade || active.gb || active.color || active.tag) {
            parts.push('<button type="button" class="tm-sl-chip" data-tm-sl-filter="clear">Καθαρισμός φίλτρων</button>');
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
            const label = allowed ? 'BB OK' : 'Δεν αγοράζεται · BB';
            return `<span class="tm-sl-purchase-chip ${cls}" title="${allowed ? 'Επιτρέπεται αγορά BB' : 'Buyback IKE — δεν αγοράζεται από άλλα καταστήματα'}">${icon} ${label}</span>`;
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
                : `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--no" title="Buyback από κατάστημα IKE — δεν αγοράζεται από άλλα καταστήματα">✕ Δεν αγοράζεται · BB IKE</span>`;
        }
        return allowed
            ? `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--ok" title="Επιτρεπόμενο κατάστημα">✓ Αγοράσιμο</span>`
            : `<span class="tm-sl-purchase-badge tm-sl-purchase-badge--no" title="Μη επιτρεπόμενο κατάστημα">✕ Δεν αγοράζεται</span>`;
    }

    function buildBlockedBannerHtml(isBuyback, compact) {
        const label = isBuyback
            ? (compact ? '✕ Δεν αγοράζεται · BB' : '✕ Δεν αγοράζεται — BB από κατάστημα IKE')
            : (compact ? '✕ Δεν αγοράζεται' : '✕ Δεν αγοράζεται από αυτό το κατάστημα');
        const title = isBuyback
            ? 'Buyback από κατάστημα IKE — δεν επιτρέπεται αγορά από άλλα καταστήματα'
            : 'Μη επιτρεπόμενο κατάστημα για αγορά';
        return `<div class="tm-sl-blocked-banner" title="${title}">${label}</div>`;
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

    function buildSpecPillsHTML(v, ctx, purchaseBlocked) {
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
            if (purchaseBlocked) {
                pills.push('<span class="tm-sl-spec-pill tm-sl-spec-pill--bb-blocked" title="Buyback IKE — δεν αγοράζεται">BB ✕</span>');
            } else {
                pills.push('<span class="tm-sl-spec-pill tm-sl-spec-pill--bb">BB</span>');
            }
        }
        return pills.join('');
    }

    function buildStoreHeadPurchaseBadge(store, compact) {
        const hasBuyback = store.variants.some((v) => v.isBuyback);
        if (!hasBuyback) return '';
        const allowed = isStorePurchaseAllowed(store.name, true);
        if (compact) {
            if (allowed) {
                return '<span class="tm-sl-store-bb-status tm-sl-store-bb-status--ok" title="Επιτρέπεται αγορά BB">BB ✓</span>';
            }
            return '<span class="tm-sl-store-bb-status tm-sl-store-bb-status--no" title="Buyback IKE — δεν αγοράζεται από άλλα καταστήματα">✕ Όχι BB</span>';
        }
        if (allowed) {
            return '<span class="tm-sl-store-bb-status tm-sl-store-bb-status--ok" title="Επιτρέπεται αγορά BB από αυτό το κατάστημα">✓ Αγορά BB</span>';
        }
        return '<span class="tm-sl-store-bb-status tm-sl-store-bb-status--no" title="Buyback IKE — δεν αγοράζεται από άλλα καταστήματα">✕ Δεν αγοράζεται · BB</span>';
    }

    function buildStoreInventorySummary(variants, ctx) {
        if (!variants.length) return '';
        const hexMap = ctx?.colorHexMap || {};
        const getGradeStyle = ctx?.getGradeStyle || (() => '');

        const groups = new Map();
        variants.forEach((v) => {
            const key = [v.grade || '', v.gb || '', v.color || '', v.isBuyback ? '1' : '0'].join('|');
            if (!groups.has(key)) {
                groups.set(key, { ...v, count: 0 });
            }
            groups.get(key).count += 1;
        });

        const sorted = [...groups.values()].sort((a, b) => {
            const gradeCmp = (a.grade || '').localeCompare(b.grade || '');
            if (gradeCmp) return gradeCmp;
            return (a.color || '').localeCompare(b.color || '', 'el');
        });

        const lines = sorted.map((g) => {
            const gradePill = g.grade
                ? `<span class="tm-sl-summary-grade" style="${getGradeStyle(g.grade)}">${esc(g.grade)}</span>`
                : '';
            const gb = g.gb ? `<span class="tm-sl-summary-gb">${esc(g.gb)}</span>` : '';
            const color = g.color
                ? `<span class="tm-sl-summary-color">${colorSwatchHTML(g.color, hexMap)}<span>${esc(g.color)}</span></span>`
                : '';
            const bb = g.isBuyback ? '<span class="tm-sl-summary-bb">BB</span>' : '';
            const count = g.count > 1 ? `<span class="tm-sl-summary-count">×${g.count}</span>` : '';
            return `<div class="tm-sl-store-summary-line">${gradePill}${gb}${color}${bb}${count}</div>`;
        }).join('');

        return `<div class="tm-sl-store-summary">${lines}</div>`;
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

    function buildUnitActionButtonsHTML(barcode) {
        return `<div class="tm-sl-table-actions">
            <button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--primary tm-sl-unit-btn--icon" data-tm-sl-copy="${esc(barcode)}" title="Αντιγραφή barcode" aria-label="Αντιγραφή barcode">${ICON.copy}</button>
            <button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--icon" data-tm-sl-open="${esc(barcode)}" title="Άνοιγμα στο σύστημα" aria-label="Άνοιγμα στο σύστημα">${ICON.open}</button>
        </div>`;
    }

    function buildUnitStatusCell(v, purchaseBlocked, ctx) {
        const showPurchaseStatus = !!ctx?.showPurchaseStatus;
        if (showPurchaseStatus && purchaseBlocked) {
            return v.isBuyback
                ? '<span class="tm-sl-table-status tm-sl-table-status--blocked" title="Buyback IKE — δεν αγοράζεται">Δεν αγοράζεται · BB</span>'
                : '<span class="tm-sl-table-status tm-sl-table-status--blocked" title="Δεν αγοράζεται">Δεν αγοράζεται</span>';
        }
        if (v.isBuyback) {
            return '<span class="tm-sl-table-status tm-sl-table-status--bb" title="Buyback">BB</span>';
        }
        return '<span class="tm-sl-table-status tm-sl-table-status--ok">Διαθέσιμο</span>';
    }

    function formatImeiPeek(imei) {
        const raw = String(imei || '').replace(/\D/g, '');
        if (raw.length < 8) return '';
        return `${raw.slice(0, 4)}…${raw.slice(-4)}`;
    }

    function pickBestVariantIndex(variants, ctx) {
        if (!variants?.length) return -1;
        let bestIdx = 0;
        for (let i = 1; i < variants.length; i += 1) {
            const a = variants[bestIdx];
            const b = variants[i];
            const storeName = b.storeName || a.storeName || '';
            if (ctx?.showPurchaseStatus && storeName) {
                const aOk = isStorePurchaseAllowed(storeName, !!a.isBuyback);
                const bOk = isStorePurchaseAllowed(storeName, !!b.isBuyback);
                if (aOk !== bOk) {
                    if (bOk) bestIdx = i;
                    continue;
                }
            }
            if (!!a.isBuyback !== !!b.isBuyback) {
                if (!b.isBuyback) bestIdx = i;
                continue;
            }
            const gradeCmp = (typeof window.comparePhoneGrades === 'function')
                ? window.comparePhoneGrades(a.grade || '', b.grade || '')
                : String(a.grade || '').localeCompare(String(b.grade || ''));
            if (gradeCmp > 0) bestIdx = i;
        }
        return bestIdx;
    }

    function buildInsightHtml(variants, bestIdx) {
        if (!variants?.length || bestIdx < 0) return '';
        const best = variants[bestIdx];
        const prices = variants
            .map((v) => parseFloat(String(v.price || '').replace(/[^\d.,]/g, '').replace(',', '.')))
            .filter((n) => Number.isFinite(n) && n > 0);
        const fromPrice = prices.length ? Math.min(...prices) : null;
        const bits = [best.grade, best.gb, best.color].filter(Boolean).join(' · ');
        const priceBit = best.price ? ` · ${best.price}` : '';
        const left = fromPrice != null ? `Από ${Math.round(fromPrice)}€` : `${variants.length} τεμ.`;
        return `<div class="tm-sl-insight">
            <span>${esc(left)}</span>
            <span class="tm-sl-insight__best">Καλύτερη επιλογή · ${esc(bits)}${esc(priceBit)}</span>
        </div>`;
    }

    function buildUnitTableRow(v, ctx) {
        const hexMap = ctx?.colorHexMap || {};
        const getGradeStyle = ctx?.getGradeStyle || (() => '');
        const storeName = v.storeName || '';
        const showPurchaseStatus = !!ctx?.showPurchaseStatus;
        const purchaseAllowed = !showPurchaseStatus || !storeName
            || isStorePurchaseAllowed(storeName, !!v.isBuyback);
        const purchaseBlocked = showPurchaseStatus && !purchaseAllowed;
        const rowClass = [
            purchaseBlocked ? 'tm-sl-unit-row--blocked' : '',
            v.isBest ? 'tm-sl-unit-row--best' : '',
            v.flash ? 'tm-sl-unit-row--flash' : '',
        ].filter(Boolean).join(' ');

        const gradeCell = v.grade
            ? `<span class="tm-sl-table-grade" style="${getGradeStyle(v.grade)}">${esc(v.grade)}</span>`
            : '—';
        const gbCell = v.gb ? `<span class="tm-sl-table-gb">${esc(v.gb)}</span>` : '—';
        const colorCell = v.color
            ? `<span class="tm-sl-table-color">${colorSwatchHTML(v.color, hexMap)}${esc(v.color)}</span>`
            : '—';
        const statusCell = buildUnitStatusCell(v, purchaseBlocked, ctx);
        const imeiPeek = formatImeiPeek(v.imei || v.phone?.imei);
        const imeiHtml = imeiPeek ? `<span class="tm-sl-table-imei">IMEI · ${esc(imeiPeek)}</span>` : '';
        const tagsHtml = buildPhoneTagsHTML(v.barcode);
        const barcodeCell = `<div class="tm-sl-table-barcode-wrap">
            <span class="tm-sl-table-barcode" data-tm-sl-copy="${esc(v.barcode)}" title="Κλικ για αντιγραφή">${esc(v.barcode)}</span>
            ${imeiHtml}
            ${tagsHtml}
        </div>`;
        const priceCell = v.price ? `<span class="tm-sl-table-price">${esc(v.price)}</span>` : '—';
        const modelName = v.modelName || ctx?.modelName || '';

        return `<tr class="tm-sl-unit-row${rowClass ? ` ${rowClass}` : ''}" data-barcode="${esc(v.barcode)}"
            data-tm-sl-open-row="${esc(v.barcode)}"
            data-tm-sl-grade="${esc(v.grade || '')}"
            data-tm-sl-gb="${esc(v.gb || '')}"
            data-tm-sl-color="${esc(v.color || '')}"
            data-tm-sl-model="${esc(modelName)}"
            data-tm-sl-price="${esc(v.price || '')}"
            title="Κλικ barcode: αντιγραφή · δεξί κλικ / +: ετικέτες · διπλό κλικ: άνοιγμα">
            <td>${gradeCell}</td>
            <td>${gbCell}</td>
            <td>${colorCell}</td>
            <td>${statusCell}</td>
            <td>${barcodeCell}</td>
            <td>${priceCell}</td>
        </tr>`;
    }

    function buildUnitTable(variants, ctx) {
        const list = [...(variants || [])];
        const bestIdx = pickBestVariantIndex(list, ctx);
        if (bestIdx >= 0) list[bestIdx] = { ...list[bestIdx], isBest: true };
        const rows = list.map((v) => buildUnitTableRow(v, ctx)).join('');
        return `<div class="tm-sl-network-detail-table-wrap tm-sl-mine-table-wrap">
            <table class="tm-sl-unit-table">
                <thead>
                    <tr>
                        <th>Βαθμ.</th>
                        <th>GB</th>
                        <th>Χρώμα</th>
                        <th>Κατάσταση</th>
                        <th>Barcode</th>
                        <th>Τιμή</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    function buildUnitRowHTML(v, ctx) {
        const compact = !!ctx?.networkCompact;
        const gradeAccent = getGradeAccentColor(v.grade, ctx);
        const storeName = v.storeName || '';
        const storeHtml = !compact && !ctx?.hideStoreInUnits && storeName ? buildUnitStoreHTML(storeName, v.isMine) : '';
        const purchaseAllowed = !ctx?.showPurchaseStatus || !storeName
            || isStorePurchaseAllowed(storeName, !!v.isBuyback);
        const purchaseBlocked = ctx?.showPurchaseStatus && !purchaseAllowed;
        const purchaseBadge = !compact && ctx?.showPurchaseStatus && storeName
            ? buildPurchaseBadgeHtml(!!v.isBuyback, purchaseAllowed)
            : '';
        const blockedBanner = purchaseBlocked ? buildBlockedBannerHtml(!!v.isBuyback, compact) : '';
        const cardClasses = [
            'tm-sl-phone-card',
            v.isBuyback ? 'tm-sl-phone-card--bb' : '',
            purchaseBlocked ? 'tm-sl-phone-card--blocked' : '',
            compact ? 'tm-sl-phone-card--compact' : '',
        ].filter(Boolean).join(' ');
        const priceHtml = v.price ? `<div class="tm-sl-phone-card__price">${esc(v.price)}</div>` : '';
        const barcodeHtml = `<span class="tm-sl-barcode-pill" data-tm-sl-copy="${esc(v.barcode)}" title="Αντιγραφή barcode"><span class="tm-sl-barcode-pill__icon">#</span>${esc(v.barcode)}</span>`;
        const tagsHtml = buildPhoneTagsHTML(v.barcode);
        const specsHtml = buildSpecPillsHTML(v, ctx, purchaseBlocked) || '<span class="tm-sl-preview-pill">—</span>';
        const actionsHtml = `<div class="tm-sl-phone-card__actions">
            <button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--primary" data-tm-sl-copy="${esc(v.barcode)}" title="Αντιγραφή barcode">${ICON.copy} Αντιγραφή</button>
            <button type="button" class="tm-sl-unit-btn" data-tm-sl-open="${esc(v.barcode)}" title="Άνοιγμα στο σύστημα">${ICON.open} Άνοιγμα</button>
        </div>`;

        if (compact) {
            return `<article class="${cardClasses}" data-barcode="${esc(v.barcode)}" style="--tm-sl-grade-accent:${esc(gradeAccent)}">
                ${blockedBanner}
                <div class="tm-sl-phone-card__specs">${specsHtml}</div>
                ${barcodeHtml}
                ${tagsHtml}
                ${priceHtml}
                ${actionsHtml}
            </article>`;
        }

        return `<article class="${cardClasses}" data-barcode="${esc(v.barcode)}" style="--tm-sl-grade-accent:${esc(gradeAccent)}">
            <div class="tm-sl-phone-card__body">
                ${blockedBanner}
                <div class="tm-sl-phone-card__specs">${specsHtml}</div>
                ${storeHtml || purchaseBadge ? `<div class="tm-sl-phone-card__meta">${storeHtml}${purchaseBadge}</div>` : ''}
                <div class="tm-sl-phone-card__footer">
                    ${barcodeHtml}
                    ${tagsHtml}
                </div>
            </div>
            <div class="tm-sl-phone-card__aside">
                ${priceHtml}
                ${actionsHtml}
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
        const compact = !!ctx?.networkCompact;
        const signal = getStoreSignalClass(store.variants.length);
        const summary = buildStoreInventorySummary(store.variants, ctx);
        const units = store.variants.map((v) => buildUnitRowHTML(v, ctx)).join('');
        const purchase = ctx?.showPurchaseStatus && !store.isMine
            ? buildStorePurchaseSummary(store)
            : { html: '', noPurchase: false };
        const noPurchaseClass = purchase.noPurchase ? ' tm-sl-store-row--no-purchase' : '';
        const bbBadge = ctx?.showPurchaseStatus && !store.isMine
            ? buildStoreHeadPurchaseBadge(store, compact)
            : '';
        const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
        const distLabel = ctx?.showDistance && myStore && !store.isMine
            ? window.getStoreDistanceLabel?.(myStore, store.name)
            : '';
        const distChip = distLabel
            ? `<span class="tm-sl-store-dist" title="Απόσταση από ${esc(getMyStoreLabel())}">${esc(distLabel)}</span>`
            : '';
        const qtyLabel = compact
            ? String(store.variants.length)
            : (store.variants.length === 1 ? '1 τεμάχιο' : `${store.variants.length} τεμ.`);

        const headHtml = compact
            ? `<div class="tm-sl-store-head tm-sl-store-head--inline" data-tm-sl-toggle-store="${idx}" tabindex="0" role="button" aria-expanded="false">
                <span class="tm-sl-store-icon">${ICON.store.replace('width="16"', 'width="15"').replace('height="16"', 'height="15"')}</span>
                <span class="tm-sl-store-name">${esc(store.name)}</span>
                <div class="tm-sl-store-head__meta">${bbBadge}${distChip}<span class="tm-sl-store-qty">${qtyLabel}</span></div>
                <span class="tm-sl-store-chevron">${ICON.chevron.replace('width="16"', 'width="14"').replace('height="16"', 'height="14"')}</span>
            </div>`
            : `<div class="tm-sl-store-head" data-tm-sl-toggle-store="${idx}" tabindex="0" role="button" aria-expanded="false">
                <div class="tm-sl-store-head__top">
                    <span class="tm-sl-store-icon">${ICON.store}</span>
                    <span class="tm-sl-store-name">${esc(store.name)}</span>
                    <span class="tm-sl-store-chevron">${ICON.chevron}</span>
                </div>
                <div class="tm-sl-store-head__meta">
                    ${bbBadge}
                    <span class="tm-sl-store-qty">${qtyLabel}</span>
                </div>
            </div>`;

        return `<div class="tm-sl-store-row ${signal}${store.isMine ? ' is-mine' : ''}${noPurchaseClass}" data-store-idx="${idx}">
            ${headHtml}
            ${summary}
            <div class="tm-sl-store-units">${units}</div>
            </div>`;
    }

    function buildMyStoreBoard(modelName, variants, ctx) {
        const myStoreLabel = getMyStoreLabel();
        const hasFilters = !!(ctx?.hasActiveFilters);
        if (!variants.length) {
            return buildEmptyState(
                ICON.emptyPhone,
                'Χωρίς διαθέσιμες συσκευές',
                hasFilters
                    ? `Κανένα αποτέλεσμα για ${modelName} με τα τρέχοντα φίλτρα. Καθαρίστε τα φίλτρα για να δείτε όλο το stock.`
                    : `Δεν υπάρχει ${modelName} στο ${myStoreLabel}. Δοκιμάστε την προβολή «Άλλα καταστήματα».`,
                hasFilters
                    ? { actionId: 'clear-filters', actionLabel: 'Καθαρισμός φίλτρων' }
                    : { actionId: 'back-models', actionLabel: 'Επιστροφή στα μοντέλα' }
            );
        }
        const qtyLabel = variants.length === 1 ? '1 συσκευή' : `${variants.length} συσκευές`;
        const bestIdx = pickBestVariantIndex(variants, ctx);
        const insight = buildInsightHtml(variants, bestIdx);
        const tableCtx = { ...ctx, modelName };
        return `<section class="tm-sl-mine-board">
            <div class="tm-sl-mine-detail-head">
                <h3>${esc(myStoreLabel)}</h3>
                <div class="tm-sl-mine-detail-head__meta">
                    <span>${esc(qtyLabel)}</span>
                </div>
            </div>
            <div style="padding:10px 12px 0">${insight}</div>
            ${buildUnitTable(variants, tableCtx)}
        </section>`;
    }

    function buildNetworkStoreMetaInner(store, ctx) {
        const bbBadge = ctx?.showPurchaseStatus ? buildStoreHeadPurchaseBadge(store, true) : '';
        const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
        const distLabel = ctx?.showDistance && myStore
            ? window.getStoreDistanceLabel?.(myStore, store.name)
            : '';
        const qtyLabel = store.variants.length === 1 ? '1 τεμ.' : `${store.variants.length} τεμ.`;

        return `<h3 id="tm-sl-network-store-title">${esc(store.name)}</h3>
            <div class="tm-sl-network-detail-head__meta" id="tm-sl-network-store-meta">
                ${distLabel ? `<span class="tm-sl-store-dist">${esc(distLabel)}</span>` : ''}
                ${bbBadge}
                <span>${qtyLabel}</span>
            </div>`;
    }

    function buildNetworkStoreTable(store, ctx) {
        return buildUnitTable(store.variants, ctx);
    }

    function buildNetworkDetailHead(store, ctx) {
        return `<div class="tm-sl-network-detail-head">
            <div class="tm-sl-network-detail-head__row">${buildNetworkStoreMetaInner(store, ctx)}</div>
        </div>`;
    }

    function buildNetworkStoreNavItem(store, idx, ctx, isActive) {
        const signal = getStoreSignalClass(store.variants.length);
        const bbBadge = ctx?.showPurchaseStatus ? buildStoreHeadPurchaseBadge(store, true) : '';
        const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
        const distLabel = ctx?.showDistance && myStore
            ? window.getStoreDistanceLabel?.(myStore, store.name)
            : '';
        const distChip = distLabel ? `<span class="tm-sl-store-dist">${esc(distLabel)}</span>` : '';
        const recommended = idx === 0 ? ' is-recommended' : '';

        return `<button type="button" class="tm-sl-network-store ${signal}${isActive ? ' is-active' : ''}${recommended}"
            data-tm-sl-select-store="${idx}" role="tab"
            aria-selected="${isActive ? 'true' : 'false'}" tabindex="${isActive ? '0' : '-1'}">
            <span class="tm-sl-network-store__name">${esc(store.name)}</span>
            <span class="tm-sl-network-store__meta">${distChip}${bbBadge}<span>${store.variants.length} τεμ.</span></span>
        </button>`;
    }

    function buildNetworkStoreBoard(modelName, storeRows, ctx) {
        const hasFilters = !!(ctx?.hasActiveFilters);
        if (!storeRows.length) {
            return buildEmptyState(
                ICON.emptySearch,
                'Δεν βρέθηκε σε άλλα καταστήματα',
                hasFilters
                    ? `Κανένα κατάστημα με ${modelName} για τα τρέχοντα φίλτρα. Καθαρίστε τα φίλτρα ή δοκιμάστε άλλο μοντέλο.`
                    : `Κανένα κατάστημα δικτύου δεν έχει ${modelName} αυτή τη στιγμή.`,
                hasFilters
                    ? { actionId: 'clear-filters', actionLabel: 'Καθαρισμός φίλτρων' }
                    : { actionId: 'back-models', actionLabel: 'Επιστροφή στα μοντέλα' }
            );
        }
        const tableCtx = { ...ctx, modelName };
        const navHtml = storeRows.map((store, idx) => buildNetworkStoreNavItem(store, idx, ctx, idx === 0)).join('');
        const panelsHtml = storeRows.map((store, idx) =>
            `<div class="tm-sl-network-panel" data-tm-sl-store-panel="${idx}">
                <div class="tm-sl-network-panel-meta">${buildNetworkStoreMetaInner(store, ctx)}</div>
                ${buildUnitTable(store.variants, tableCtx)}
            </div>`
        ).join('');

        const top = storeRows[0];
        const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
        const distLabel = ctx?.showDistance && myStore
            ? window.getStoreDistanceLabel?.(myStore, top.name)
            : '';
        const insightBits = [`Προτεινόμενο · ${top.name}`];
        if (distLabel) insightBits.push(distLabel);
        if (storeHasAnyBuyable(top)) insightBits.push('αγοράσιμο');
        const insight = `<div class="tm-sl-insight"><span class="tm-sl-insight__best">${esc(insightBits.join(' · '))}</span></div>`;

        return `<div class="tm-sl-network-board">
            <aside class="tm-sl-network-stores" role="tablist" aria-label="Καταστήματα">
                <div class="tm-sl-network-stores__label">Κοντά + αγοράσιμο</div>
                ${navHtml}
            </aside>
            <main class="tm-sl-network-detail" id="tm-sl-network-detail" role="tabpanel">
                ${insight}
                ${buildNetworkDetailHead(storeRows[0], ctx)}
                <div id="tm-sl-network-table-root">${buildUnitTable(storeRows[0].variants, tableCtx)}</div>
            </main>
            <div class="tm-sl-network-panels" hidden aria-hidden="true">${panelsHtml}</div>
        </div>`;
    }

    function storeHasAnyBuyable(store) {
        if (!store?.variants?.length) return false;
        return store.variants.some((v) => isStorePurchaseAllowed(store.name, !!v.isBuyback));
    }

    function buildStoreBoard(modelName, myStore, allRows, ctx) {
        let html = '';
        const otherRows = (allRows || []).filter((r) => !r.isMine);

        if (myStore && myStore.variants.length) {
            html += `<div class="tm-sl-mine-banner tm-sl-mine-banner--yes">
                <span class="tm-sl-mine-icon">✅</span>
                    <div>
                    <div class="tm-sl-mine-text">Υπάρχει στο ${esc(getMyStoreLabel())}</div>
                    <div class="tm-sl-mine-detail">${myStore.variants.length} ${myStore.variants.length === 1 ? 'συσκευή' : 'συσκευές'} — ${esc(myStore.preview)}</div>
                    </div>
            </div>`;
        } else {
            html += `<div class="tm-sl-mine-banner tm-sl-mine-banner--no">
                <span class="tm-sl-mine-icon">—</span>
                <div>
                    <div class="tm-sl-mine-text">Δεν υπάρχει στο ${esc(getMyStoreLabel())}</div>
                    <div class="tm-sl-mine-detail">Δείτε παρακάτω ποια καταστήματα έχουν ${esc(modelName)}</div>
            </div>
        </div>`;
    }

        if (!allRows?.length) {
            html += buildEmptyState(ICON.emptySearch, 'Δεν βρέθηκε σε κανένα κατάστημα', 'Δοκιμάστε άλλα φίλτρα ή ανανέωση δεδομένων');
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
                <h3 class="tm-sl-region-title">${esc(getMyStoreLabel())}</h3>
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

    function showToast(overlay, message, opts = {}) {
        const toast = overlay?.querySelector('#tm-sl-toast');
        if (!toast) return;
        const barcode = opts.barcode || '';
        if (barcode) {
            toast.innerHTML = `<span class="tm-sl-toast__msg">${esc(message)}</span>
                <button type="button" class="tm-sl-toast__open" data-tm-sl-open="${esc(barcode)}">Άνοιγμα</button>`;
            toast.querySelector('[data-tm-sl-open]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(`https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(barcode)}`, '_blank');
            });
        } else {
            toast.textContent = message;
        }
        toast.classList.add('is-visible');
        clearTimeout(toast._tmHideTimer);
        toast._tmHideTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, opts.durationMs || 2600);
    }

    function updateFreshness(overlay, lastUpdated) {
        const wrap = overlay?.querySelector('#tm-sl-freshness');
        const updatedEl = overlay?.querySelector('#tm-sl-updated');
        if (!wrap || !lastUpdated) return;
        const ageMs = Date.now() - lastUpdated.getTime();
        wrap.classList.remove('tm-sl-freshness--fresh', 'tm-sl-freshness--cached', 'tm-sl-freshness--stale');
        let label = 'Cache';
        if (ageMs < 5 * 60 * 1000) {
            wrap.classList.add('tm-sl-freshness--fresh');
            label = 'Ζωντανά';
        } else if (ageMs < 60 * 60 * 1000) {
            wrap.classList.add('tm-sl-freshness--cached');
            label = 'Cache';
        } else {
            wrap.classList.add('tm-sl-freshness--stale');
            label = 'Παλιά δεδομένα';
        }
        if (updatedEl) {
            updatedEl.textContent = `${label} · ${lastUpdated.toLocaleString('el-GR')}`;
        }
    }

    function formatEtaMs(ms) {
        if (ms == null || !Number.isFinite(ms)) return '';
        if (ms <= 800) return 'Λιγότερο από 1 δευτ.';
        const sec = Math.ceil(ms / 1000);
        if (sec < 60) return `Περίπου ${sec} δευτ.`;
        const min = Math.floor(sec / 60);
        const rem = sec % 60;
        if (min === 1 && rem === 0) return 'Περίπου 1 λεπτό';
        if (rem === 0) return `Περίπου ${min} λεπτά`;
        if (min === 1) return `Περίπου 1 λεπτό ${rem} δευτ.`;
        return `Περίπου ${min} λεπτά ${rem} δευτ.`;
    }

    function showLoadProgress(overlay, opts = {}) {
        const wrap = overlay?.querySelector('#tm-sl-load');
        if (!wrap) return;
        wrap.hidden = false;
        updateLoadProgress(overlay, {
            label: opts.label || 'Φόρτωση…',
            meta: opts.meta || '',
            ratio: opts.ratio,
            done: opts.done,
            total: opts.total,
            etaMs: opts.etaMs,
            indeterminate: opts.indeterminate !== false && opts.ratio == null && opts.total == null,
        });
    }

    function updateLoadProgress(overlay, opts = {}) {
        const wrap = overlay?.querySelector('#tm-sl-load');
        const labelEl = overlay?.querySelector('#tm-sl-load-label');
        const etaEl = overlay?.querySelector('#tm-sl-load-eta');
        const barEl = overlay?.querySelector('#tm-sl-load-bar');
        const metaEl = overlay?.querySelector('#tm-sl-load-meta');
        if (!wrap || wrap.hidden) return;

        if (opts.label != null && labelEl) labelEl.textContent = opts.label;

        let ratio = opts.ratio;
        if (ratio == null && opts.total > 0 && opts.done != null) {
            ratio = Math.max(0, Math.min(1, opts.done / opts.total));
        }

        const indeterminate = opts.indeterminate === true
            || (ratio == null && !(opts.total > 0));
        wrap.classList.toggle('is-indeterminate', indeterminate);

        if (barEl && !indeterminate && ratio != null) {
            barEl.style.width = `${Math.round(ratio * 100)}%`;
        } else if (barEl && indeterminate) {
            barEl.style.width = '';
        }

        if (etaEl) {
            const etaText = formatEtaMs(opts.etaMs);
            etaEl.textContent = etaText ? `Απομένουν: ${etaText}` : '';
        }

        if (metaEl) {
            if (opts.meta != null) {
                metaEl.textContent = opts.meta;
            } else if (opts.total > 0 && opts.done != null) {
                metaEl.textContent = `${opts.done} / ${opts.total}`;
            } else if (opts.percent != null) {
                metaEl.textContent = `${Math.round(opts.percent)}%`;
            }
        }
    }

    function hideLoadProgress(overlay) {
        const wrap = overlay?.querySelector('#tm-sl-load');
        if (!wrap) return;
        wrap.hidden = true;
        wrap.classList.remove('is-indeterminate');
        const barEl = overlay.querySelector('#tm-sl-load-bar');
        if (barEl) barEl.style.width = '0%';
        const etaEl = overlay.querySelector('#tm-sl-load-eta');
        if (etaEl) etaEl.textContent = '';
        const metaEl = overlay.querySelector('#tm-sl-load-meta');
        if (metaEl) metaEl.textContent = '';
    }

    function setRefreshing(overlay, refreshing) {
        const body = overlay?.querySelector('#tm-sl-body');
        const btn = overlay?.querySelector('#tm-sl-refresh');
        body?.classList.toggle('is-refreshing', !!refreshing);
        if (!btn) return;
        btn.classList.toggle('is-busy', !!refreshing);
        if (refreshing) {
            btn.setAttribute('disabled', 'true');
            btn.innerHTML = `<span class="tm-sl-btn-spin">${ICON.refresh}</span>`;
            btn.setAttribute('aria-label', 'Ανανέωση…');
            btn.title = 'Ανανέωση…';
        } else {
            btn.removeAttribute('disabled');
            btn.innerHTML = ICON.refresh;
            btn.setAttribute('aria-label', 'Ανανέωση');
            btn.title = 'Ανανέωση';
        }
    }

    function setStoresModelHeader(overlay, modelName, subtitle) {
        const shell = overlay?.querySelector('#tm-sl-shell');
        const titleEl = overlay?.querySelector('#tm-sl-title');
        const subtitleEl = overlay?.querySelector('#tm-sl-subtitle');
        shell?.classList.add('tm-sl-step--stores');
        if (titleEl) {
            titleEl.className = 'tm-sl-title tm-sl-title--model';
            titleEl.textContent = modelName || '';
        }
        if (subtitleEl) subtitleEl.textContent = subtitle || '';
    }

    function clearStoresModelHeader(overlay) {
        const shell = overlay?.querySelector('#tm-sl-shell');
        const titleEl = overlay?.querySelector('#tm-sl-title');
        shell?.classList.remove('tm-sl-step--stores');
        if (titleEl) titleEl.className = 'tm-sl-title';
    }

    function updateBreadcrumb(overlay, step, modelName) {
        const wrap = overlay?.querySelector('#tm-sl-breadcrumb-wrap');
        if (wrap) wrap.innerHTML = buildBreadcrumb(step, modelName);
    }

    function updateViewTabs(overlay, view) {
        const mineTab = overlay?.querySelector('#tm-sl-view-mine');
        const networkTab = overlay?.querySelector('#tm-sl-view-network');
        const shell = overlay?.querySelector('#tm-sl-shell');
        if (!mineTab || !networkTab) return;
        const isMine = view === 'mine';
        mineTab.classList.toggle('is-active', isMine);
        networkTab.classList.toggle('is-active', !isMine);
        mineTab.setAttribute('aria-selected', isMine ? 'true' : 'false');
        networkTab.setAttribute('aria-selected', !isMine ? 'true' : 'false');
        shell?.classList.toggle('tm-sl-view--network', !isMine);
        updateMyStoreLabels(overlay);
    }

    const UI_SCALE_STEPS = [1, 1.15, 1.3, 1.45];
    const UI_SCALE_DEFAULT = 1.15;

    function normalizeUiScale(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return UI_SCALE_DEFAULT;
        let best = UI_SCALE_STEPS[0];
        let bestDist = Math.abs(n - best);
        UI_SCALE_STEPS.forEach((step) => {
            const dist = Math.abs(n - step);
            if (dist < bestDist) {
                best = step;
                bestDist = dist;
            }
        });
        return best;
    }

    function setUiScale(overlay, scale) {
        const shell = overlay?.querySelector('#tm-sl-shell');
        if (!shell) return normalizeUiScale(scale);
        const next = normalizeUiScale(scale);
        shell.style.setProperty('--tm-sl-scale', String(next));
        shell.dataset.tmSlScale = String(next);

        const valueBtn = overlay.querySelector('#tm-sl-scale-value');
        const downBtn = overlay.querySelector('#tm-sl-scale-down');
        const upBtn = overlay.querySelector('#tm-sl-scale-up');
        const pct = Math.round(next * 100);
        if (valueBtn) {
            valueBtn.textContent = `${pct}%`;
            valueBtn.classList.toggle('is-enlarged', next > 1);
            valueBtn.title = next === UI_SCALE_DEFAULT
                ? 'Προεπιλεγμένο μέγεθος για οθόνες 13″'
                : 'Επαναφορά στο προεπιλεγμένο (115%)';
        }
        if (downBtn) downBtn.disabled = next <= UI_SCALE_STEPS[0];
        if (upBtn) upBtn.disabled = next >= UI_SCALE_STEPS[UI_SCALE_STEPS.length - 1];
        return next;
    }

    function stepUiScale(current, direction) {
        const idx = UI_SCALE_STEPS.indexOf(normalizeUiScale(current));
        const nextIdx = Math.max(0, Math.min(UI_SCALE_STEPS.length - 1, idx + direction));
        return UI_SCALE_STEPS[nextIdx];
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
        ICON,
        STYLES,
        UI_SCALE_STEPS,
        UI_SCALE_DEFAULT,
        ensureStylesInjected,
        esc,
        getMyStoreLabel,
        updateMyStoreLabels,
        formatActiveFiltersSummary,
        phoneTagChipHTML,
        buildPhoneTagsHTML,
        showPhoneTagPicker,
        buildContextStrip,
        buildStatusLegend,
        buildCoachTipHtml,
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
        buildSkeletonNetworkBoard,
        buildSkeletonMineBoard,
        buildPhoneListSection,
        buildUnitRowHTML,
        buildUnitTable,
        buildUnitTableRow,
        formatVariantLine,
        buildStoreChipHtml,
        buildPurchaseBadgeHtml,
        isStorePurchaseAllowed,
        showToast,
        updateFreshness,
        setRefreshing,
        showLoadProgress,
        updateLoadProgress,
        hideLoadProgress,
        formatEtaMs,
        setStoresModelHeader,
        clearStoresModelHeader,
        updateBreadcrumb,
        updateViewTabs,
        setDensity,
        setUiScale,
        normalizeUiScale,
        stepUiScale,
    };
})();
