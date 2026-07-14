// ==UserScript==
// @name         MyManager Phone Catalog UI
// @namespace    http://tampermonkey.net/
// @version      5.0
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
    };

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const STYLES = `
        @keyframes tm-sl-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tm-sl-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

        .tm-sl-overlay {
            animation: tm-sl-in 0.2s ease;
            backdrop-filter: blur(8px);
            background: var(--tm-overlay-dim, rgba(0,0,0,0.75)) !important;
        }
        .tm-sl-shell {
            animation: tm-sl-rise 0.28s cubic-bezier(0.22, 1, 0.36, 1);
            width: min(920px, 96vw) !important;
            max-width: 96vw !important;
            height: min(88vh, 820px) !important;
            max-height: 88vh !important;
            border-radius: 16px !important;
            border: 1px solid var(--tm-shop-item-border) !important;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
            box-shadow: 0 24px 64px var(--tm-shadow-color, rgba(0,0,0,0.4)) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden;
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        .tm-sl-header-actions { display: flex; gap: 8px; flex-shrink: 0; }
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
        .tm-sl-btn--icon { padding: 8px 10px; }
        .tm-sl-btn--back { margin-right: 4px; }

        .tm-sl-toolbar {
            padding: 12px 20px;
            border-bottom: 1px solid var(--tm-shop-item-border);
            background: var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg));
            flex-shrink: 0;
        }
        .tm-sl-search-wrap {
            position: relative; display: flex; align-items: center;
        }
        .tm-sl-search-icon {
            position: absolute; left: 12px; opacity: 0.45; pointer-events: none;
            display: flex;
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
        .tm-sl-chips {
            display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
        }
        .tm-sl-chip {
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

        .tm-sl-body {
            flex: 1; overflow-y: auto; padding: 16px 20px; min-height: 0;
        }

        .tm-sl-model-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 12px;
        }
        .tm-sl-model-card {
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            padding: 14px 16px;
            background: var(--tm-shop-item-bg);
            cursor: pointer;
            transition: border-color 0.15s, transform 0.12s, box-shadow 0.15s;
        }
        .tm-sl-model-card:hover {
            border-color: var(--tm-primary-color);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px color-mix(in srgb, var(--tm-shadow-color, #000) 25%, transparent);
        }
        .tm-sl-model-name {
            font-size: 14px; font-weight: 800; line-height: 1.25;
            margin-bottom: 8px;
            color: var(--tm-shop-item-text);
        }
        .tm-sl-model-meta {
            font-size: 12px; font-weight: 600;
            color: var(--tm-info-color, #0ea5e9);
            margin-bottom: 6px;
        }
        .tm-sl-model-stores {
            font-size: 11px; opacity: 0.75; margin-bottom: 8px;
        }
        .tm-sl-grade-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .tm-sl-grade-chip {
            font-size: 10px; font-weight: 700; padding: 2px 6px;
            border-radius: 4px;
            background: var(--tm-chip-bg, var(--tm-shop-item-hover-bg));
            border: 1px solid var(--tm-chip-border, var(--tm-shop-item-border));
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

        .tm-sl-store-list { display: flex; flex-direction: column; gap: 8px; }
        .tm-sl-store-row {
            border: 1px solid var(--tm-shop-item-border);
            border-radius: 12px;
            background: var(--tm-shop-item-bg);
            overflow: hidden;
        }
        .tm-sl-store-row.is-mine {
            border-color: color-mix(in srgb, var(--tm-primary-color) 40%, var(--tm-shop-item-border));
        }
        .tm-sl-store-head {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 14px; cursor: pointer;
            transition: background 0.12s;
        }
        .tm-sl-store-head:hover { background: var(--tm-shop-item-hover-bg); }
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
            display: none; border-top: 1px dashed var(--tm-shop-item-border);
            padding: 8px 10px 10px;
            background: color-mix(in srgb, var(--tm-shop-item-border) 8%, var(--tm-shop-item-bg));
        }
        .tm-sl-store-row.is-open .tm-sl-store-units { display: block; }
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
        .tm-sl-unit-spec { font-weight: 600; line-height: 1.35; }
        .tm-sl-unit-barcode {
            font-size: 10px; opacity: 0.65; font-family: ui-monospace, monospace;
        }
        .tm-sl-unit-price { font-size: 12px; font-weight: 700; white-space: nowrap; }
        .tm-sl-unit-actions { display: flex; gap: 4px; }
        .tm-sl-unit-btn {
            padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
            border: 1px solid var(--tm-shop-item-border);
            background: var(--tm-shop-item-bg); cursor: pointer;
        }
        .tm-sl-unit-btn:hover { border-color: var(--tm-primary-color); }

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
            font-size: 11px; opacity: 0.75; flex-shrink: 0;
        }
        .tm-sl-loading { text-align: center; padding: 40px; opacity: 0.7; }
    `;

    function buildEmptyState(icon, title, sub) {
        return `<div class="tm-sl-empty">
            <div class="tm-sl-empty-icon">${icon}</div>
            <div class="tm-sl-empty-title">${esc(title)}</div>
            ${sub ? `<div class="tm-sl-empty-sub">${esc(sub)}</div>` : ''}
        </div>`;
    }

    function buildShellHTML() {
        return `
        <style>${STYLES}</style>
        <div class="tm-sl-shell">
            <header class="tm-sl-header">
                <div class="tm-sl-header-row">
                    <div class="tm-sl-title-block">
                        <h2 class="tm-sl-title" id="tm-sl-title">Πού υπάρχει το μοντέλο</h2>
                        <p class="tm-sl-subtitle" id="tm-sl-subtitle">Επιλέξτε μοντέλο για να δείτε διαθεσιμότητα ανά κατάστημα</p>
                    </div>
                    <div class="tm-sl-header-actions">
                        <button type="button" id="tm-sl-refresh" class="tm-sl-btn" title="Ανανέωση">${ICON.refresh} Ανανέωση</button>
                        <button type="button" id="tm-sl-close" class="tm-sl-btn tm-sl-btn--icon" aria-label="Κλείσιμο">×</button>
                    </div>
                </div>
            </header>
            <div class="tm-sl-toolbar" id="tm-sl-toolbar"></div>
            <div class="tm-sl-body" id="tm-sl-body">${buildEmptyState('⏳', 'Φόρτωση…', '')}</div>
            <footer class="tm-sl-footer">
                <span id="tm-sl-status">—</span>
                <span id="tm-sl-updated"></span>
            </footer>
        </div>`;
    }

    function buildModelSearchToolbar() {
        return `
            <div class="tm-sl-search-wrap">
                <span class="tm-sl-search-icon">${ICON.search}</span>
                <input type="search" id="tm-sl-model-search" class="tm-sl-search"
                    placeholder="Αναζήτηση μοντέλου…" autocomplete="off">
            </div>`;
    }

    function buildStoreToolbar(modelName, chipsHtml) {
        return `
            <button type="button" id="tm-sl-back" class="tm-sl-btn tm-sl-btn--back">${ICON.back} Μοντέλα</button>
            <div class="tm-sl-chips" id="tm-sl-chips">${chipsHtml || ''}</div>`;
    }

    function buildModelGrid(models) {
        if (!models.length) {
            return buildEmptyState('📱', 'Δεν βρέθηκαν μοντέλα', 'Δοκιμάστε άλλη αναζήτηση ή ανανέωση');
        }
        const cards = models.map(([model, data]) => {
            const storeLabel = data.storeCount === 1
                ? '1 κατάστημα'
                : `${data.storeCount} καταστήματα`;
            const grades = Object.entries(data.grades || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([g, n]) => `<span class="tm-sl-grade-chip">${esc(g)}:${n}</span>`)
                .join('');
            return `<div class="tm-sl-model-card" role="button" tabindex="0" data-tm-sl-model="${esc(model)}">
                <div class="tm-sl-model-name">${esc(model)}</div>
                <div class="tm-sl-model-meta">${ICON.store.replace('width="16"', 'width="12"').replace('height="16"', 'height="12"')} ${esc(storeLabel)}</div>
                <div class="tm-sl-model-stores">${data.totalUnits} συσκευές στο δίκτυο</div>
                ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
            </div>`;
        }).join('');
        return `<div class="tm-sl-model-grid">${cards}</div>`;
    }

    function buildFilterChips(filters, active) {
        const parts = [];
        const addGroup = (key, label, values) => {
            if (!values.length) return;
            values.forEach((val) => {
                const isActive = active[key] === val;
                parts.push(`<button type="button" class="tm-sl-chip${isActive ? ' is-active' : ''}"
                    data-tm-sl-filter="${esc(key)}" data-tm-sl-value="${esc(val)}">${esc(label ? `${label}: ` : '')}${esc(val)}</button>`);
            });
        };
        addGroup('grade', '', filters.grades);
        addGroup('gb', '', filters.gbs);
        addGroup('color', '', filters.colors);
        if (active.grade || active.gb || active.color) {
            parts.push('<button type="button" class="tm-sl-chip" data-tm-sl-filter="clear">Καθαρισμός</button>');
        }
        return parts.join('');
    }

    function formatVariantLine(v) {
        const bits = [v.grade, v.gb, v.color].filter(Boolean);
        return bits.join(' · ') || '—';
    }

    function buildStoreBoard(modelName, myStore, storeRows, ctx) {
        let html = '';

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

        if (!storeRows.length && !(myStore && myStore.variants.length)) {
            html += buildEmptyState('🔍', 'Δεν βρέθηκε σε κανένα κατάστημα', 'Δοκιμάστε άλλα φίλτρα ή ανανέωση δεδομένων');
            return html;
        }

        const rows = storeRows.map((store, idx) => {
            const preview = store.variants.slice(0, 3).map(formatVariantLine).join(' · ');
            const units = store.variants.map((v) => {
                const gradeStyle = ctx.getGradeStyle(v.grade);
                return `<div class="tm-sl-unit" data-barcode="${esc(v.barcode)}">
                    <div class="tm-sl-unit-grade" style="${gradeStyle}">${esc(v.grade || '—')}</div>
                    <div>
                        <div class="tm-sl-unit-spec">${esc(formatVariantLine(v))}${v.isBuyback ? ' · BB' : ''}</div>
                        <div class="tm-sl-unit-barcode">${esc(v.barcode)}</div>
                    </div>
                    <div class="tm-sl-unit-actions">
                        ${v.price ? `<span class="tm-sl-unit-price">${esc(v.price)}</span>` : ''}
                        <button type="button" class="tm-sl-unit-btn" data-tm-sl-copy="${esc(v.barcode)}">Copy</button>
                        <button type="button" class="tm-sl-unit-btn" data-tm-sl-open="${esc(v.barcode)}">Open</button>
                    </div>
                </div>`;
            }).join('');
            return `<div class="tm-sl-store-row${store.isMine ? ' is-mine' : ''}" data-store-idx="${idx}">
                <div class="tm-sl-store-head" data-tm-sl-toggle-store="${idx}">
                    <span class="tm-sl-store-icon">${ICON.store}</span>
                    <span class="tm-sl-store-name">${esc(store.name)}</span>
                    <span class="tm-sl-store-qty">${store.variants.length} τεμ.</span>
                    <span class="tm-sl-store-chevron">${ICON.chevron}</span>
                </div>
                ${preview ? `<div class="tm-sl-store-preview">${esc(preview)}${store.variants.length > 3 ? '…' : ''}</div>` : ''}
                <div class="tm-sl-store-units">${units}</div>
            </div>`;
        }).join('');

        html += `<div class="tm-sl-store-list">${rows}</div>`;
        return html;
    }

    window.PhoneCatalogUI = {
        STYLES,
        esc,
        buildShellHTML,
        buildModelSearchToolbar,
        buildStoreToolbar,
        buildModelGrid,
        buildFilterChips,
        buildStoreBoard,
        buildEmptyState,
        formatVariantLine,
    };
})();
