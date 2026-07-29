// ==UserScript==
// @name         MyManager Phone Catalog Features
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  UX upgrades for phone catalog panels — tags, favorites, IMEI, compare, smart search.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    const FEATURE_STYLES = `
        .tm-sl-toolbar-quick { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
        .tm-sl-quick-toggle {
            border:1px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, transparent);
            background: color-mix(in srgb, var(--tm-shop-item-bg) 92%, var(--tm-primary-color));
            color: var(--tm-shop-item-text, var(--tm-primary-color));
            border-radius:999px; padding:4px 10px; font-size:11px; font-weight:700;
            cursor:pointer; line-height:1.2;
        }
        .tm-sl-quick-toggle.is-active {
            background: color-mix(in srgb, var(--tm-primary-color) 16%, transparent);
            border-color: color-mix(in srgb, var(--tm-primary-color) 45%, transparent);
            color: var(--tm-primary-color);
        }
        .tm-sl-recent-strip {
            display:flex; flex-wrap:wrap; gap:6px; align-items:center;
            padding:0 2px 2px; margin-top:4px;
        }
        .tm-sl-recent-strip__label {
            font-size:10px; font-weight:800; letter-spacing:0.04em; text-transform:uppercase;
            opacity:0.55;
        }
        .tm-sl-recent-chip {
            border:1px solid color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
            background: transparent; color: inherit; border-radius:8px;
            padding:3px 8px; font-size:11px; font-weight:650; cursor:pointer;
        }
        .tm-sl-recent-chip:hover { border-color: var(--tm-primary-color); color: var(--tm-primary-color); }
        .tm-sl-model-card { position:relative; }
        .tm-sl-model-card.is-favorite { box-shadow: inset 0 0 0 1px color-mix(in srgb, #eab308 35%, transparent); }
        .tm-sl-fav-btn {
            position:absolute; top:8px; right:8px; width:28px; height:28px;
            border:none; border-radius:8px; cursor:pointer;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 80%, transparent);
            color: color-mix(in srgb, var(--tm-shop-item-text) 45%, transparent);
            display:inline-flex; align-items:center; justify-content:center;
            z-index:2;
        }
        .tm-sl-fav-btn.is-on { color:#ca8a04; }
        .tm-sl-fav-btn:hover { color:#ca8a04; background: color-mix(in srgb, #eab308 14%, transparent); }
        .tm-sl-model-badges { display:flex; flex-wrap:wrap; gap:4px; margin-top:6px; }
        .tm-sl-model-badge {
            font-size:10px; font-weight:800; letter-spacing:0.02em;
            padding:2px 6px; border-radius:999px;
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 16%, transparent);
            color: var(--tm-warning-color, #b45309);
        }
        .tm-sl-model-badge--bb {
            background: color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
            color: var(--tm-primary-color);
        }
        .tm-sl-model-alias {
            font-size:10px; opacity:0.65; margin-top:4px; line-height:1.3;
        }
        .tm-sl-insight-strip, .tm-sl-summary-strip, .tm-sl-best-strip {
            display:flex; flex-wrap:wrap; gap:8px; align-items:center;
            padding:8px 10px; margin-bottom:8px; border-radius:10px;
            background: color-mix(in srgb, var(--tm-primary-color) 6%, var(--tm-shop-item-bg));
            border:1px solid color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
            font-size:12px;
        }
        .tm-sl-insight-pill, .tm-sl-summary-pill, .tm-sl-best-pill {
            display:inline-flex; align-items:center; gap:5px;
            padding:3px 8px; border-radius:999px; font-weight:700;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 88%, transparent);
            border:1px solid color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
        }
        .tm-sl-insight-pill--warn {
            border-color: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 45%, transparent);
            color: var(--tm-warning-color, #b45309);
        }
        .tm-sl-sticky-filters {
            position:sticky; top:0; z-index:5;
            background: color-mix(in srgb, var(--tm-shop-item-bg) 92%, transparent);
            backdrop-filter: blur(8px); padding:6px 0 8px; margin-bottom:4px;
        }
        .tm-sl-unit-table th.is-sortable { cursor:pointer; user-select:none; }
        .tm-sl-unit-table th.is-sortable:hover { color: var(--tm-primary-color); }
        .tm-sl-unit-table th.is-sorted::after { content:' ▾'; font-size:10px; opacity:0.7; }
        .tm-sl-unit-table th.is-sorted-asc::after { content:' ▴'; }
        .tm-sl-unit-table tr.is-selected td {
            background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
        }
        .tm-sl-unit-table tr.is-focused td {
            outline: 1px solid color-mix(in srgb, var(--tm-primary-color) 45%, transparent);
            outline-offset:-1px;
        }
        .tm-sl-unit-table .tm-sl-table-imei,
        .tm-sl-unit-table .tm-sl-table-title {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size:11px; cursor:pointer;
        }
        .tm-sl-unit-table .tm-sl-table-imei:hover,
        .tm-sl-unit-table .tm-sl-table-title:hover { color: var(--tm-primary-color); }
        .tm-sl-tag-chip {
            display:inline-flex; align-items:center; gap:3px;
            padding:1px 6px; border-radius:999px; font-size:10px; font-weight:700;
            border:1px solid transparent; margin:1px;
        }
        .tm-sl-tag-add {
            border:1px dashed color-mix(in srgb, var(--tm-shop-item-border) 80%, transparent);
            background:transparent; color:inherit; border-radius:999px;
            font-size:10px; padding:1px 6px; cursor:pointer;
        }
        .tm-sl-tag-menu {
            position:absolute; z-index:30; min-width:160px; max-height:220px; overflow:auto;
            background: var(--tm-modal-bg, var(--tm-shop-item-bg));
            border:1px solid var(--tm-shop-item-border); border-radius:10px;
            box-shadow: 0 12px 28px var(--tm-shadow-color, rgba(0,0,0,0.35));
            padding:6px;
        }
        .tm-sl-tag-menu button {
            display:flex; width:100%; align-items:center; gap:8px;
            border:none; background:transparent; color:inherit;
            padding:6px 8px; border-radius:7px; cursor:pointer; font-size:12px; text-align:left;
        }
        .tm-sl-tag-menu button:hover,
        .tm-sl-tag-menu button.is-on {
            background: color-mix(in srgb, var(--tm-primary-color) 12%, transparent);
        }
        .tm-sl-selection-bar {
            display:flex; flex-wrap:wrap; gap:8px; align-items:center;
            padding:8px 10px; margin-bottom:8px; border-radius:10px;
            background: color-mix(in srgb, var(--tm-primary-color) 8%, var(--tm-shop-item-bg));
            border:1px solid color-mix(in srgb, var(--tm-primary-color) 20%, transparent);
            font-size:12px; font-weight:700;
        }
        .tm-sl-selection-bar[hidden] { display:none !important; }
        .tm-sl-col-menu {
            display:flex; flex-wrap:wrap; gap:6px; align-items:center;
            font-size:11px; opacity:0.9;
        }
        .tm-sl-col-menu label { display:inline-flex; gap:4px; align-items:center; cursor:pointer; }
        .tm-sl-compare-wrap {
            margin-bottom:10px; border-radius:10px; overflow:auto;
            border:1px solid color-mix(in srgb, var(--tm-shop-item-border) 75%, transparent);
        }
        .tm-sl-compare-table {
            width:100%; border-collapse:collapse; font-size:12px; min-width:480px;
        }
        .tm-sl-compare-table th, .tm-sl-compare-table td {
            padding:6px 8px; border-bottom:1px solid color-mix(in srgb, var(--tm-shop-item-border) 55%, transparent);
            text-align:left; white-space:nowrap;
        }
        .tm-sl-compare-table th { font-size:10px; text-transform:uppercase; letter-spacing:0.04em; opacity:0.7; }
        .tm-sl-compare-table tr.is-best td {
            background: color-mix(in srgb, var(--tm-success-color, #16a34a) 10%, transparent);
        }
        .tm-sl-network-store.is-resolving { opacity:0.7; }
        .tm-sl-network-store__hint {
            font-size:10px; opacity:0.65; font-weight:650;
        }
        .tm-sl-network-store.is-closest .tm-sl-network-store__name::after {
            content:' · κοντύτερο'; font-weight:700; opacity:0.65; font-size:10px;
        }
        .tm-sl-network-store.is-most-stock .tm-sl-network-store__name::after {
            content:' · περισσότερο stock'; font-weight:700; opacity:0.65; font-size:10px;
        }
        .tm-sl-network-store.is-closest.is-most-stock .tm-sl-network-store__name::after {
            content:' · καλύτερη επιλογή'; font-weight:700; opacity:0.7; font-size:10px;
        }
        .tm-sl-parse-banner {
            display:flex; flex-wrap:wrap; gap:8px; align-items:center;
            padding:7px 10px; margin:0 0 8px; border-radius:10px;
            background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 12%, transparent);
            border:1px solid color-mix(in srgb, var(--tm-warning-color, #f59e0b) 35%, transparent);
            font-size:12px;
        }
        .tm-sl-parse-banner a, .tm-sl-parse-banner button.linkish {
            background:none; border:none; color: var(--tm-primary-color);
            cursor:pointer; font-weight:700; padding:0; text-decoration:underline;
        }
        .tm-sl-breadcrumb button {
            background:none; border:none; color:inherit; cursor:pointer;
            padding:0; font:inherit; opacity:0.75;
        }
        .tm-sl-breadcrumb button:hover { opacity:1; color: var(--tm-primary-color); }
        .tm-sl-empty-actions { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px; }
        .tm-sl-shell.tm-sl-hide-col-imei .tm-sl-col-imei { display:none; }
        .tm-sl-shell.tm-sl-hide-col-price .tm-sl-col-price { display:none; }
        .tm-sl-shell.tm-sl-hide-col-tags .tm-sl-col-tags { display:none; }
        .tm-sl-shell.tm-sl-hide-col-title .tm-sl-col-title { display:none; }
        .tm-sl-scope-note {
            font-size:10px; opacity:0.6; margin-left:auto;
        }
        .tm-sl-price-outlier { color: var(--tm-warning-color, #b45309); font-weight:800; }
        .tm-sl-unit-btn--line { font-size:11px; padding:0 6px; min-width:auto; }
    `;

    function ensureFeatureStyles() {
        if (document.getElementById('tm-sl-feature-styles')) return;
        const style = document.createElement('style');
        style.id = 'tm-sl-feature-styles';
        style.textContent = FEATURE_STYLES;
        document.head.appendChild(style);
    }

    function esc(value) {
        return window.PhoneCatalogUI?.esc
            ? window.PhoneCatalogUI.esc(value)
            : String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
    }

    function starSvg(filled) {
        return filled
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5 4.6L18.2 22 12 18.2 5.8 22 7 14.6 2 10l7.1-1.1L12 2z"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.9 6.9L22 10l-5 4.6L18.2 22 12 18.2 5.8 22 7 14.6 2 10l7.1-1.1L12 2z"/></svg>';
    }

    function parsePrice(value) {
        if (value == null || value === '') return null;
        const n = parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));
        return Number.isFinite(n) ? n : null;
    }

    function formatPrice(n) {
        if (n == null || !Number.isFinite(n)) return '—';
        return `${Math.round(n)}€`;
    }

    /** Smart query: "15 pro 256 blue", barcode, IMEI */
    function parseSmartSearch(raw) {
        const q = String(raw || '').trim();
        if (!q) return { text: '', tokens: [], barcode: '', imei: '', gb: '', grade: '', colorHint: '' };
        const upper = q.toUpperCase();
        const digitsOnly = q.replace(/\D/g, '');
        let barcode = '';
        let imei = '';
        if (/^\d{8,14}$/.test(digitsOnly) && digitsOnly.length <= 14 && !/\s/.test(q.trim())) {
            barcode = digitsOnly;
        } else if (/^\d{15}$/.test(digitsOnly)) {
            imei = digitsOnly;
        }
        const gbMatch = upper.match(/\b(\d+)\s*(GB|TB)\b/);
        const gradeMatch = upper.match(/\b(A\+|A|B|C)\b/);
        const tokens = upper
            .replace(/\b(\d+)\s*(GB|TB)\b/g, ' ')
            .replace(/\b(A\+|A|B|C)\b/g, ' ')
            .split(/[\s,/|+]+/)
            .map((t) => t.trim())
            .filter((t) => t.length >= 2);
        return {
            text: q.toLowerCase(),
            tokens,
            barcode,
            imei,
            gb: gbMatch ? `${gbMatch[1]}${gbMatch[2]}` : '',
            grade: gradeMatch ? gradeMatch[1] : '',
            colorHint: tokens.find((t) => /BLUE|BLACK|WHITE|GOLD|SILVER|RED|GREEN|PINK|PURPLE|YELLOW|TITAN/i.test(t)) || '',
        };
    }

    function modelMatchesSmartQuery(modelName, data, queryInfo, phonesForModel) {
        if (!queryInfo || (!queryInfo.text && !queryInfo.barcode && !queryInfo.imei)) return true;
        if (queryInfo.barcode || queryInfo.imei) {
            const list = phonesForModel || [];
            return list.some((p) => {
                if (queryInfo.barcode && String(p.barcode || '') === queryInfo.barcode) return true;
                if (queryInfo.imei && String(p.imei || '') === queryInfo.imei) return true;
                if (queryInfo.barcode && String(p.barcode || '').includes(queryInfo.barcode)) return true;
                if (queryInfo.imei && String(p.imei || '').includes(queryInfo.imei)) return true;
                return false;
            });
        }
        const hay = String(modelName || '').toUpperCase();
        if (queryInfo.tokens.length) {
            if (!queryInfo.tokens.every((t) => hay.includes(t))) return false;
        } else if (queryInfo.text && !hay.includes(queryInfo.text.toUpperCase())) {
            return false;
        }
        if (queryInfo.gb && data) {
            // soft: don't exclude models solely by gb at grid level unless phones provided
            if (phonesForModel?.length) {
                const extractGB = window.extractGB || (() => '');
                if (!phonesForModel.some((p) => String(extractGB(p.name || p.model) || '').toUpperCase() === queryInfo.gb)) {
                    return false;
                }
            }
        }
        return true;
    }

    function findModelByCode(allPhones, otherStorePhones, code, helpers) {
        const extractBaseModel = helpers?.extractBaseModel || window.extractBaseModel || ((m) => m);
        const filter = helpers?.filterCatalogPhones || window.filterCatalogPhones || ((p) => p);
        const pools = [...filter(allPhones || []), ...filter(otherStorePhones || [])];
        const hit = pools.find((p) => String(p.barcode || '') === code || String(p.imei || '') === code);
        if (!hit) return null;
        return extractBaseModel(hit.model) || null;
    }

    function computeVariantInsights(variants, ctx) {
        const prices = variants.map((v) => parsePrice(v.price)).filter((n) => n != null);
        const min = prices.length ? Math.min(...prices) : null;
        const max = prices.length ? Math.max(...prices) : null;
        const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
        const colors = new Set(variants.map((v) => v.color).filter(Boolean));
        const gbs = new Set(variants.map((v) => v.gb).filter(Boolean));
        const onlyBb = variants.length > 0 && variants.every((v) => v.isBuyback);
        const buyable = variants.filter((v) => {
            if (!ctx?.showPurchaseStatus) return true;
            if (!v.storeName) return true;
            return typeof window.isStoreAllowedForPhone !== 'function'
                || window.isStoreAllowedForPhone(v.storeName, !!v.isBuyback);
        });
        const cheapest = buyable
            .map((v) => ({ v, p: parsePrice(v.price) }))
            .filter((x) => x.p != null)
            .sort((a, b) => a.p - b.p)[0]?.v || null;

        return {
            count: variants.length,
            colorCount: colors.size,
            gbCount: gbs.size,
            min, max, avg, onlyBb, cheapest,
            buyableCount: buyable.length,
        };
    }

    function buildSummaryStripHtml(insights) {
        if (!insights?.count) return '';
        const pills = [
            `<span class="tm-sl-summary-pill">${insights.count} τεμ.</span>`,
        ];
        if (insights.colorCount) pills.push(`<span class="tm-sl-summary-pill">${insights.colorCount} χρώμ.</span>`);
        if (insights.gbCount) pills.push(`<span class="tm-sl-summary-pill">${insights.gbCount} GB</span>`);
        if (insights.min != null) {
            const range = insights.min === insights.max
                ? formatPrice(insights.min)
                : `${formatPrice(insights.min)} – ${formatPrice(insights.max)}`;
            pills.push(`<span class="tm-sl-summary-pill">τιμές ${esc(range)}</span>`);
            if (insights.avg != null) pills.push(`<span class="tm-sl-summary-pill">μ.ό. ${esc(formatPrice(insights.avg))}</span>`);
        }
        if (insights.onlyBb) pills.push('<span class="tm-sl-summary-pill">μόνο BB</span>');
        return `<div class="tm-sl-summary-strip" aria-label="Σύνοψη">${pills.join('')}</div>`;
    }

    function buildBestMatchStripHtml(insights, ctx) {
        const bits = [];
        if (insights?.cheapest) {
            const v = insights.cheapest;
            const line = [v.grade, v.gb, v.color, formatPrice(parsePrice(v.price))].filter(Boolean).join(' · ');
            bits.push(`<span class="tm-sl-best-pill" title="Φθηνότερο διαθέσιμο">Φθηνότερο: ${esc(line)}</span>`);
        }
        if (insights?.onlyBb) {
            bits.push('<span class="tm-sl-best-pill">Απομένει μόνο BB</span>');
        }
        if (ctx?.nearestStoreLabel) {
            bits.push(`<span class="tm-sl-best-pill">Κοντύτερο με stock: ${esc(ctx.nearestStoreLabel)}</span>`);
        }
        if (ctx?.mostStockStoreLabel && ctx.mostStockStoreLabel !== ctx.nearestStoreLabel) {
            bits.push(`<span class="tm-sl-best-pill">Περισσότερο stock: ${esc(ctx.mostStockStoreLabel)}</span>`);
        }
        if (!bits.length) return '';
        return `<div class="tm-sl-best-strip" aria-label="Καλύτερη επιλογή">${bits.join('')}</div>`;
    }

    function buildCompareMatrixHtml(storeRows, filters) {
        if (!storeRows?.length) return '';
        const hasFilters = !!(filters?.grade || filters?.gb || filters?.color);
        if (!hasFilters && storeRows.length > 12) return '';

        const variantKeys = new Map();
        storeRows.forEach((store) => {
            store.variants.forEach((v) => {
                const key = [v.grade || '', v.gb || '', v.color || '', v.isBuyback ? 'BB' : ''].join('|');
                if (!variantKeys.has(key)) {
                    variantKeys.set(key, { grade: v.grade, gb: v.gb, color: v.color, isBuyback: v.isBuyback });
                }
            });
        });
        const keys = [...variantKeys.entries()];
        if (!keys.length || keys.length > 10) return '';

        const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
        let bestIdx = 0;
        let bestScore = -1;
        storeRows.forEach((store, idx) => {
            let score = store.variants.length * 10;
            if (typeof window.getStoreDistanceKm === 'function' && myStore) {
                const km = window.getStoreDistanceKm(myStore, store.name);
                if (km != null) score += Math.max(0, 40 - km);
            }
            if (score > bestScore) {
                bestScore = score;
                bestIdx = idx;
            }
        });

        const head = `<tr><th>Παραλλαγή</th>${storeRows.map((s) => `<th>${esc(s.name)}</th>`).join('')}</tr>`;
        const body = keys.map(([key, meta]) => {
            const label = [meta.grade, meta.gb, meta.color, meta.isBuyback ? 'BB' : ''].filter(Boolean).join(' · ') || '—';
            const cells = storeRows.map((store) => {
                const n = store.variants.filter((v) =>
                    [v.grade || '', v.gb || '', v.color || '', v.isBuyback ? 'BB' : ''].join('|') === key
                ).length;
                return `<td>${n ? `${n}` : '—'}</td>`;
            }).join('');
            return `<tr><td>${esc(label)}</td>${cells}</tr>`;
        }).join('');

        const totals = `<tr class="is-best"><td>Σύνολο</td>${storeRows.map((s, i) =>
            `<td>${s.variants.length}${i === bestIdx ? ' ★' : ''}</td>`
        ).join('')}</tr>`;

        return `<div class="tm-sl-compare-wrap">
            <table class="tm-sl-compare-table" aria-label="Σύγκριση καταστημάτων">
                <thead>${head}</thead>
                <tbody>${body}${totals}</tbody>
            </table>
        </div>`;
    }

    function buildParseBannerHtml(issues) {
        if (!issues) return '';
        const parts = [];
        if (issues.duplicateBarcodes?.length) {
            parts.push(`${issues.duplicateBarcodes.length} διπλά barcodes`);
        }
        if (issues.unknownColors?.length) {
            parts.push(`${issues.unknownColors.length} άγνωστα χρώματα`);
        }
        if (issues.unknownModels?.length) {
            parts.push(`${issues.unknownModels.length} άγνωστα μοντέλα`);
        }
        if (!parts.length) return '';
        return `<div class="tm-sl-parse-banner" role="status">
            <span>Προσοχή parse: ${esc(parts.join(' · '))}</span>
            <button type="button" class="linkish" data-tm-sl-open-settings="colors">Χρώματα</button>
            <button type="button" class="linkish" data-tm-sl-open-settings="models">Μοντέλα</button>
        </div>`;
    }

    function purchaseBlockReason(v, ctx) {
        if (!ctx?.showPurchaseStatus || !v?.storeName) return '';
        const allowed = typeof window.isStoreAllowedForPhone !== 'function'
            || window.isStoreAllowedForPhone(v.storeName, !!v.isBuyback);
        if (allowed) return '';
        if (v.isBuyback) {
            return 'Buyback από κατάστημα IKE — δεν επιτρέπεται αγορά από άλλα καταστήματα (κανόνας BB).';
        }
        return `Το κατάστημα «${v.storeName}» δεν επιτρέπεται για κανονική αγορά (κανόνες καταστημάτων).`;
    }

    function buildTagCellsHtml(barcode, ctx) {
        const tags = (typeof window.getTagsForBarcode === 'function'
            ? window.getTagsForBarcode(barcode)
            : []) || [];
        const defs = typeof window.loadTagDefinitions === 'function' ? window.loadTagDefinitions() : {};
        const chips = tags.map((key) => {
            const def = defs[key] || {};
            const color = def.color || '#64748b';
            const name = def.name || key;
            return `<span class="tm-sl-tag-chip" style="background:${esc(color)}22;border-color:${esc(color)};color:${esc(color)}" data-tag="${esc(key)}">${esc(name)}</span>`;
        }).join('');
        return `<div class="tm-sl-tags-cell" data-tm-sl-tags-for="${esc(barcode)}">
            ${chips}
            <button type="button" class="tm-sl-tag-add" data-tm-sl-tag-edit="${esc(barcode)}" title="Ετικέτες">+</button>
        </div>`;
    }

    function formatCopyLine(v, modelName) {
        const bits = [
            modelName || '',
            v.grade || '',
            v.gb || '',
            v.color || '',
            v.barcode || '',
            v.imei ? `IMEI ${v.imei}` : '',
        ].filter(Boolean);
        return bits.join(' · ');
    }

    function sortVariants(variants, sortKey, sortDir, ctx) {
        const dir = sortDir === 'asc' ? 1 : -1;
        const list = [...variants];
        const gradeCmp = (a, b) => (typeof window.comparePhoneGrades === 'function'
            ? window.comparePhoneGrades(a, b)
            : String(a || '').localeCompare(String(b || '')));
        list.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case 'grade': cmp = gradeCmp(a.grade, b.grade); break;
                case 'gb': {
                    const num = (s) => {
                        const u = String(s || '').toUpperCase();
                        const n = parseInt(u, 10) || 0;
                        return u.includes('TB') ? n * 1024 : n;
                    };
                    cmp = num(a.gb) - num(b.gb);
                    break;
                }
                case 'color': cmp = String(a.color || '').localeCompare(String(b.color || ''), 'el'); break;
                case 'price': cmp = (parsePrice(a.price) ?? 1e12) - (parsePrice(b.price) ?? 1e12); break;
                case 'imei': cmp = String(a.imei || '').localeCompare(String(b.imei || '')); break;
                case 'barcode': cmp = String(a.barcode || '').localeCompare(String(b.barcode || '')); break;
                case 'status': {
                    const score = (v) => {
                        const blocked = !!purchaseBlockReason(v, ctx);
                        if (blocked) return 2;
                        if (v.isBuyback) return 1;
                        return 0;
                    };
                    cmp = score(a) - score(b);
                    break;
                }
                default: cmp = gradeCmp(a.grade, b.grade) || String(a.barcode || '').localeCompare(String(b.barcode || ''));
            }
            return cmp * dir;
        });
        return list;
    }

    function applyColumnVisibility(shell, prefs) {
        if (!shell) return;
        const p = prefs || (typeof window.loadColumnPrefs === 'function' ? window.loadColumnPrefs() : {});
        shell.classList.toggle('tm-sl-hide-col-imei', p.imei === false);
        shell.classList.toggle('tm-sl-hide-col-price', p.price === false);
        shell.classList.toggle('tm-sl-hide-col-tags', p.tags === false);
        shell.classList.toggle('tm-sl-hide-col-title', p.title !== true);
    }

    function buildColumnMenuHtml(prefs) {
        const p = prefs || {};
        const item = (key, label, checked) =>
            `<label><input type="checkbox" data-tm-sl-col="${key}" ${checked ? 'checked' : ''}> ${label}</label>`;
        return `<div class="tm-sl-col-menu" title="Ορατές στήλες">
            ${item('imei', 'IMEI', p.imei !== false)}
            ${item('price', 'Τιμή', p.price !== false)}
            ${item('tags', 'Ετικέτες', p.tags !== false)}
            ${item('title', 'Αρχικός τίτλος', p.title === true)}
        </div>`;
    }

    function buildSelectionBarHtml() {
        return `<div class="tm-sl-selection-bar" id="tm-sl-selection-bar" hidden>
            <span id="tm-sl-selection-count">0 επιλεγμένα</span>
            <button type="button" class="tm-sl-btn" data-tm-sl-export-selected>Εξαγωγή επιλεγμένων</button>
            <button type="button" class="tm-sl-btn" data-tm-sl-clear-selection>Καθαρισμός</button>
        </div>`;
    }

    function patchPhoneCatalogUI() {
        const UI = window.PhoneCatalogUI;
        if (!UI || UI.__featuresPatched) return;
        UI.__featuresPatched = true;
        ensureFeatureStyles();

        const origEnsure = UI.ensureStylesInjected;
        UI.ensureStylesInjected = function patchedEnsure() {
            origEnsure?.();
            ensureFeatureStyles();
        };

        const origBreadcrumb = UI.buildBreadcrumb;
        UI.buildBreadcrumb = function (step, modelName, viewLabel) {
            if (step === 'stores' && modelName) {
                const view = viewLabel || 'Κατάστημα';
                return `<nav class="tm-sl-breadcrumb" aria-label="Διαδρομή">
                    <button type="button" data-tm-sl-crumb="models">Μοντέλα</button>
                    <span class="tm-sl-breadcrumb-sep">›</span>
                    <button type="button" data-tm-sl-crumb="model">${esc(modelName)}</button>
                    <span class="tm-sl-breadcrumb-sep">›</span>
                    <span class="tm-sl-breadcrumb-current">${esc(view)}</span>
                </nav>`;
            }
            return origBreadcrumb ? origBreadcrumb(step, modelName) : `<nav class="tm-sl-breadcrumb"><span class="tm-sl-breadcrumb-current">Μοντέλα</span></nav>`;
        };

        UI.buildCoachTipHtml = function () {
            return `<div class="tm-sl-coach" id="tm-sl-coach" role="note">
                <span>1. Μοντέλο · 2. Φίλτρα · 3. Αντιγραφή barcode/IMEI · Συμβουλή: πρόσθεσε διευθύνσεις καταστημάτων για ταξινόμηση απόστασης</span>
                <button type="button" class="tm-sl-coach-dismiss" id="tm-sl-coach-dismiss" title="Απόκρυψη" aria-label="Απόκρυψη συμβουλής">×</button>
            </div>`;
        };

        const origModelToolbar = UI.buildModelSearchToolbar;
        UI.buildModelSearchToolbar = function (activeSort, opts) {
            const base = origModelToolbar ? origModelToolbar(activeSort) : '';
            const qf = opts?.quickFilters || (typeof window.loadQuickFilters === 'function' ? window.loadQuickFilters() : {});
            const scope = typeof window.getPhoneCatalogScope === 'function' ? window.getPhoneCatalogScope() : 'iphone';
            const keep = typeof window.getPhoneKeepFiltersPref === 'function' ? window.getPhoneKeepFiltersPref() : false;
            const toggles = `
                <div class="tm-sl-toolbar-quick">
                    <button type="button" class="tm-sl-quick-toggle${qf.favoritesOnly ? ' is-active' : ''}" data-tm-sl-quick="favoritesOnly">Αγαπημένα</button>
                    <button type="button" class="tm-sl-quick-toggle${qf.inStockOnly ? ' is-active' : ''}" data-tm-sl-quick="inStockOnly">Μόνο stock</button>
                    <button type="button" class="tm-sl-quick-toggle${qf.buyableOnly ? ' is-active' : ''}" data-tm-sl-quick="buyableOnly">Μόνο αγοράσιμα</button>
                    <button type="button" class="tm-sl-quick-toggle${keep ? ' is-active' : ''}" data-tm-sl-quick="keepFilters" title="Κράτα φίλτρα όταν αλλάζεις καρτέλα">Κράτα φίλτρα</button>
                    <button type="button" class="tm-sl-quick-toggle${scope === 'all' ? ' is-active' : ''}" data-tm-sl-quick="scopeAll" title="Προβολή όλων των συσκευών, όχι μόνο iPhone">Όλες οι συσκευές</button>
                    <span class="tm-sl-scope-note">${scope === 'all' ? 'Scope: όλες' : 'Scope: iPhone'}</span>
                </div>`;
            const recent = opts?.recentModels || [];
            const recentHtml = recent.length
                ? `<div class="tm-sl-recent-strip" aria-label="Πρόσφατα">
                    <span class="tm-sl-recent-strip__label">Πρόσφατα</span>
                    ${recent.map((m) => `<button type="button" class="tm-sl-recent-chip" data-tm-sl-recent="${esc(m)}">${esc(m)}</button>`).join('')}
                   </div>`
                : '';
            const placeholderFix = base.replace(
                'placeholder="Αναζήτηση μοντέλου…"',
                'placeholder="Μοντέλο, 15 pro 256, barcode ή IMEI…"'
            );
            const refreshTitle = placeholderFix.includes('id="tm-sl-model-search"')
                ? placeholderFix
                : placeholderFix;
            return `${refreshTitle}${toggles}${recentHtml}`;
        };

        const origStoreToolbar = UI.buildStoreToolbar;
        UI.buildStoreToolbar = function (modelName, chipsHtml, opts) {
            const showPurchase = opts?.network ? true : false;
            const base = origStoreToolbar
                ? origStoreToolbar(modelName, chipsHtml, { ...opts, network: showPurchase })
                : '';
            // Fix: mine legend should not include purchase status
            let html = base;
            if (!opts?.network) {
                html = html.replace(
                    UI.buildStatusLegend({ showPurchaseStatus: true }),
                    UI.buildStatusLegend({ showPurchaseStatus: false })
                );
            }
            const sticky = chipsHtml
                ? ''
                : '';
            const cols = buildColumnMenuHtml(opts?.columnPrefs || (typeof window.loadColumnPrefs === 'function' ? window.loadColumnPrefs() : {}));
            const tagFilters = opts?.tagFilterHtml || '';
            return `${html}
                <div class="tm-sl-toolbar-row tm-sl-sticky-filters">
                    ${cols}
                    ${tagFilters}
                    ${opts?.isFavorite
                        ? `<button type="button" class="tm-sl-quick-toggle is-active" data-tm-sl-fav-model="${esc(modelName)}">${starSvg(true)} Αγαπημένο</button>`
                        : `<button type="button" class="tm-sl-quick-toggle" data-tm-sl-fav-model="${esc(modelName)}">${starSvg(false)} Αγαπημένο</button>`}
                </div>${sticky}`;
        };

        const origFilterChips = UI.buildFilterChips;
        UI.buildFilterChips = function (filters, active, ctx) {
            let html = origFilterChips ? origFilterChips(filters, active, ctx) : '';
            const tagDefs = typeof window.loadTagDefinitions === 'function' ? window.loadTagDefinitions() : {};
            const tagKeys = Object.keys(tagDefs || {});
            if (tagKeys.length) {
                tagKeys.forEach((key) => {
                    const def = tagDefs[key] || {};
                    const isActive = active?.tag === key;
                    html += `<button type="button" class="tm-sl-chip${isActive ? ' is-active' : ''}"
                        data-tm-sl-filter="tag" data-tm-sl-value="${esc(key)}">
                        <span class="tm-sl-tag-chip" style="background:${esc(def.color || '#64748b')}33;border-color:${esc(def.color || '#64748b')};color:${esc(def.color || '#64748b')}">${esc(def.name || key)}</span>
                    </button>`;
                });
            }
            return html;
        };

        const origModelGrid = UI.buildModelGrid;
        UI.buildModelGrid = function (models, ctx) {
            if (!models.length) {
                return origModelGrid ? origModelGrid(models, ctx) : '';
            }
            const favorites = new Set(typeof window.loadFavoriteModels === 'function' ? window.loadFavoriteModels() : []);
            const query = ctx?.query || '';
            const catalogView = ctx?.catalogView || 'mine';
            const getGradeStyle = ctx?.getGradeStyle || (() => '');
            const myStoreLabel = UI.getMyStoreLabel?.() || 'Το κατάστημά μου';
            const highlightMatch = UI.highlightMatch || ((t) => esc(t));
            const gradeChipHTML = UI.gradeChipHTML || ((g, n) => `${esc(g)}:${n}`);
            const getModelHeatClass = UI.getModelHeatClass || (() => '');

            const cards = models.map(([model, data], i) => {
                const grades = Object.entries(data.grades || {})
                    .sort((a, b) => (typeof window.comparePhoneGrades === 'function'
                        ? window.comparePhoneGrades(a[0], b[0])
                        : a[0].localeCompare(b[0])))
                    .map(([g, n]) => gradeChipHTML(g, n, getGradeStyle))
                    .join('');
                const heat = getModelHeatClass(data);
                const delay = Math.min(i, 7);
                const isFav = favorites.has(model);
                const count = catalogView === 'mine'
                    ? (data.myCount || data.totalUnits || 0)
                    : (data.totalUnits || 0);
                const badges = [];
                if (count === 1) badges.push('<span class="tm-sl-model-badge">Τελευταίο τεμ.</span>');
                else if (count > 0 && count <= 2) badges.push('<span class="tm-sl-model-badge">Χαμηλό stock</span>');
                if (data.onlyBb) badges.push('<span class="tm-sl-model-badge tm-sl-model-badge--bb">Μόνο BB</span>');
                const alias = data.aliasHint
                    ? `<div class="tm-sl-model-alias">επίσης ως ${esc(data.aliasHint)}</div>`
                    : '';
                const favBtn = `<button type="button" class="tm-sl-fav-btn${isFav ? ' is-on' : ''}" data-tm-sl-fav-model="${esc(model)}" title="${isFav ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}" aria-label="Αγαπημένο">${starSvg(isFav)}</button>`;

                if (catalogView === 'mine') {
                    return `<div class="tm-sl-model-card ${heat}${isFav ? ' is-favorite' : ''}" role="button" tabindex="0"
                        data-tm-sl-model="${esc(model)}" style="--i:${delay}">
                        ${favBtn}
                        <div class="tm-sl-model-name">${highlightMatch(model, query)}</div>
                        <div class="tm-sl-model-count">${count}<span>τεμ.</span></div>
                        <div class="tm-sl-model-meta">στο ${esc(myStoreLabel)}</div>
                        ${badges.length ? `<div class="tm-sl-model-badges">${badges.join('')}</div>` : ''}
                        ${alias}
                        ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
                    </div>`;
                }

                const storeLabel = data.storeCount === 1 ? '1 κατάστημα' : `${data.storeCount} καταστήματα`;
                return `<div class="tm-sl-model-card ${heat}${isFav ? ' is-favorite' : ''}" role="button" tabindex="0"
                    data-tm-sl-model="${esc(model)}" style="--i:${delay}">
                    ${favBtn}
                    <div class="tm-sl-model-name">${highlightMatch(model, query)}</div>
                    <div class="tm-sl-model-count">${data.storeCount || 0}<span>κατ.</span></div>
                    <div class="tm-sl-model-meta">${esc(storeLabel)} · ${data.totalUnits} τεμ.</div>
                    ${badges.length ? `<div class="tm-sl-model-badges">${badges.join('')}</div>` : ''}
                    ${alias}
                    ${grades ? `<div class="tm-sl-grade-row">${grades}</div>` : ''}
                </div>`;
            }).join('');

            const banner = ctx?.parseBannerHtml || '';
            return `${banner}<div class="tm-sl-model-grid">${cards}</div>`;
        };

        UI.buildUnitActionButtonsHTML = function (barcode, opts) {
            const ICON = UI.ICON || {};
            const line = opts?.copyLine ? esc(opts.copyLine) : '';
            const networkBtn = opts?.showElsewhere
                ? `<button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--icon" data-tm-sl-elsewhere="${esc(barcode)}" title="Δες σε άλλα καταστήματα" aria-label="Άλλα καταστήματα">${ICON.store || '⇄'}</button>`
                : '';
            return `<div class="tm-sl-table-actions">
                <button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--primary tm-sl-unit-btn--icon" data-tm-sl-copy="${esc(barcode)}" title="Αντιγραφή barcode" aria-label="Αντιγραφή barcode">${ICON.copy || 'Copy'}</button>
                ${line ? `<button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--line" data-tm-sl-copy-line="${line}" title="Αντιγραφή γραμμής">Γραμμή</button>` : ''}
                ${opts?.imei ? `<button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--icon" data-tm-sl-copy-imei="${esc(opts.imei)}" title="Αντιγραφή IMEI" aria-label="Αντιγραφή IMEI">IMEI</button>` : ''}
                <button type="button" class="tm-sl-unit-btn tm-sl-unit-btn--icon" data-tm-sl-open="${esc(barcode)}" title="Άνοιγμα στο σύστημα" aria-label="Άνοιγμα">${ICON.open || '↗'}</button>
                ${networkBtn}
            </div>`;
        };

        UI.buildUnitTableRow = function (v, ctx) {
            const hexMap = ctx?.colorHexMap || {};
            const getGradeStyle = ctx?.getGradeStyle || (() => '');
            const colorSwatchHTML = UI.colorSwatchHTML || (() => '');
            const storeName = v.storeName || '';
            const showPurchaseStatus = !!ctx?.showPurchaseStatus;
            const blockReason = purchaseBlockReason(v, ctx);
            const purchaseBlocked = !!blockReason;
            const rowClass = [
                purchaseBlocked ? 'tm-sl-unit-row--blocked' : '',
                v._priceOutlier ? 'tm-sl-unit-row--outlier' : '',
            ].filter(Boolean).join(' ');

            const gradeCell = v.grade
                ? `<span class="tm-sl-table-grade" style="${getGradeStyle(v.grade)}">${esc(v.grade)}</span>`
                : '—';
            const gbCell = v.gb ? `<span class="tm-sl-table-gb">${esc(v.gb)}</span>` : '—';
            const colorCell = v.color
                ? `<span class="tm-sl-table-color">${colorSwatchHTML(v.color, hexMap)}<span>${esc(v.color)}</span></span>`
                : '—';
            const statusTitle = blockReason || (v.isBuyback ? 'Buyback' : 'Διαθέσιμο');
            let statusCell;
            if (purchaseBlocked) {
                statusCell = `<span class="tm-sl-table-status tm-sl-table-status--blocked" title="${esc(statusTitle)}">${v.isBuyback ? 'Δεν αγοράζεται · BB' : 'Δεν αγοράζεται'}</span>`;
            } else if (v.isBuyback) {
                statusCell = `<span class="tm-sl-table-status tm-sl-table-status--bb" title="${esc(statusTitle)}">BB</span>`;
            } else {
                statusCell = `<span class="tm-sl-table-status tm-sl-table-status--ok" title="${esc(statusTitle)}">Διαθέσιμο</span>`;
            }
            const barcodeCell = `<span class="tm-sl-table-barcode" data-tm-sl-copy="${esc(v.barcode)}" title="Αντιγραφή barcode">${esc(v.barcode)}</span>`;
            const imeiCell = v.imei
                ? `<span class="tm-sl-table-imei" data-tm-sl-copy-imei="${esc(v.imei)}" title="Αντιγραφή IMEI">${esc(v.imei)}</span>`
                : '—';
            const priceNum = parsePrice(v.price);
            const priceCls = v._priceOutlier ? ' tm-sl-price-outlier' : '';
            const priceCell = v.price
                ? `<span class="tm-sl-table-price${priceCls}" title="${v._priceOutlier ? 'Ασυνήθιστη τιμή για αυτή την παραλλαγή' : ''}">${esc(v.price)}</span>`
                : '—';
            const titleCell = v.name || v.phone?.name || v.phone?.model
                ? `<span class="tm-sl-table-title" title="${esc(v.name || v.phone?.name || '')}">${esc((v.name || v.phone?.name || '').slice(0, 42))}</span>`
                : '—';
            const tagsCell = buildTagCellsHtml(v.barcode, ctx);
            const copyLine = formatCopyLine({ ...v, barcode: v.barcode }, ctx?.modelName);
            const actions = UI.buildUnitActionButtonsHTML(v.barcode, {
                imei: v.imei,
                copyLine,
                showElsewhere: !!ctx?.showElsewhereActions && !!v.otherStoreCount,
            });

            return `<tr class="tm-sl-unit-row ${rowClass}" data-barcode="${esc(v.barcode)}" tabindex="-1"
                data-grade="${esc(v.grade || '')}" data-gb="${esc(v.gb || '')}" data-color="${esc(v.color || '')}"
                data-price="${priceNum ?? ''}" data-imei="${esc(v.imei || '')}">
                <td class="tm-sl-col-select"><input type="checkbox" class="tm-sl-row-select" data-tm-sl-select="${esc(v.barcode)}" aria-label="Επιλογή"></td>
                <td>${gradeCell}</td>
                <td>${gbCell}</td>
                <td>${colorCell}</td>
                <td>${statusCell}</td>
                <td>${barcodeCell}</td>
                <td class="tm-sl-col-imei">${imeiCell}</td>
                <td class="tm-sl-col-price">${priceCell}</td>
                <td class="tm-sl-col-tags">${tagsCell}</td>
                <td class="tm-sl-col-title">${titleCell}</td>
                <td>${actions}</td>
            </tr>`;
        };

        UI.buildUnitTable = function (variants, ctx) {
            const sortKey = ctx?.unitSortKey || 'grade';
            const sortDir = ctx?.unitSortDir || 'asc';
            const insights = computeVariantInsights(variants, ctx);
            const priced = variants.map((v) => {
                const p = parsePrice(v.price);
                const outlier = p != null && insights.avg != null && insights.count >= 3
                    && Math.abs(p - insights.avg) > Math.max(40, insights.avg * 0.35);
                return { ...v, _priceOutlier: outlier, imei: v.imei || v.phone?.imei || '', name: v.name || v.phone?.name || '', otherStoreCount: v.otherStoreCount ?? v.phone?.otherStoreCount };
            });
            const sorted = sortVariants(priced, sortKey, sortDir, ctx);
            const th = (key, label, extraClass = '') => {
                const sortedCls = sortKey === key ? (sortDir === 'asc' ? ' is-sorted is-sorted-asc' : ' is-sorted') : '';
                return `<th class="is-sortable ${extraClass}${sortedCls}" data-tm-sl-unit-sort="${key}">${label}</th>`;
            };
            const rows = sorted.map((v) => UI.buildUnitTableRow(v, ctx)).join('');
            return `${buildSelectionBarHtml()}
            <div class="tm-sl-network-detail-table-wrap tm-sl-mine-table-wrap">
                <table class="tm-sl-unit-table" data-tm-sl-unit-table="1">
                    <thead>
                        <tr>
                            <th class="tm-sl-col-select"><input type="checkbox" id="tm-sl-select-all" title="Επιλογή όλων" aria-label="Επιλογή όλων"></th>
                            ${th('grade', 'Βαθμ.')}
                            ${th('gb', 'GB')}
                            ${th('color', 'Χρώμα')}
                            ${th('status', 'Κατάσταση')}
                            ${th('barcode', 'Barcode')}
                            ${th('imei', 'IMEI', 'tm-sl-col-imei')}
                            ${th('price', 'Τιμή', 'tm-sl-col-price')}
                            <th class="tm-sl-col-tags">Ετικέτες</th>
                            <th class="tm-sl-col-title">Τίτλος</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        };

        const origMineBoard = UI.buildMyStoreBoard;
        UI.buildMyStoreBoard = function (modelName, variants, ctx) {
            if (!variants.length) {
                const hasFilters = !!(ctx?.hasActiveFilters);
                const networkHint = !hasFilters;
                return UI.buildEmptyState(
                    UI.ICON?.emptyPhone,
                    'Χωρίς διαθέσιμες συσκευές',
                    hasFilters
                        ? `Κανένα αποτέλεσμα για ${modelName} με τα τρέχοντα φίλτρα.`
                        : `Δεν υπάρχει ${modelName} στο ${UI.getMyStoreLabel?.() || 'κατάστημά σας'}.`,
                    hasFilters
                        ? { actionId: 'clear-filters', actionLabel: 'Καθαρισμός φίλτρων' }
                        : networkHint
                            ? { actionId: 'switch-network', actionLabel: 'Δες άλλα καταστήματα' }
                            : { actionId: 'back-models', actionLabel: 'Επιστροφή στα μοντέλα' }
                );
            }
            const enrichedCtx = { ...ctx, modelName, showElsewhereActions: true };
            const insights = computeVariantInsights(variants, enrichedCtx);
            const qtyLabel = variants.length === 1 ? '1 συσκευή' : `${variants.length} συσκευές`;
            return `<section class="tm-sl-mine-board">
                <div class="tm-sl-mine-detail-head">
                    <h3>${UI.ICON?.pin || ''} ${esc(UI.getMyStoreLabel?.() || '')}</h3>
                    <div class="tm-sl-mine-detail-head__meta"><span>${esc(qtyLabel)}</span></div>
                </div>
                ${buildSummaryStripHtml(insights)}
                ${buildBestMatchStripHtml(insights, enrichedCtx)}
                ${UI.buildUnitTable(variants, enrichedCtx)}
            </section>`;
        };

        const origNetworkBoard = UI.buildNetworkStoreBoard;
        UI.buildNetworkStoreBoard = function (modelName, storeRows, ctx) {
            if (!storeRows.length) {
                return origNetworkBoard ? origNetworkBoard(modelName, storeRows, ctx) : '';
            }
            const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
            let closestIdx = -1;
            let mostStockIdx = 0;
            let bestDist = Infinity;
            let bestStock = -1;
            storeRows.forEach((store, idx) => {
                if (store.variants.length > bestStock) {
                    bestStock = store.variants.length;
                    mostStockIdx = idx;
                }
                if (typeof window.getStoreDistanceKm === 'function' && myStore) {
                    const km = window.getStoreDistanceKm(myStore, store.name);
                    if (km != null && km < bestDist) {
                        bestDist = km;
                        closestIdx = idx;
                    }
                }
            });

            const allVariants = storeRows.flatMap((s) => s.variants);
            const insights = computeVariantInsights(allVariants, { ...ctx, showPurchaseStatus: true });
            const nearestStoreLabel = closestIdx >= 0 ? storeRows[closestIdx].name : '';
            const mostStockStoreLabel = storeRows[mostStockIdx]?.name || '';
            const compareHtml = buildCompareMatrixHtml(storeRows, ctx?.activeFilters);
            const resolvingNote = ctx?.storesResolving
                ? '<div class="tm-sl-parse-banner">Φόρτωση τοποθεσιών καταστημάτων…</div>'
                : '';
            const noGeo = ctx?.showDistance && closestIdx < 0
                ? `<div class="tm-sl-parse-banner">Δεν υπάρχουν συντεταγμένες —
                    <button type="button" class="linkish" data-tm-sl-open-settings="stores">Πρόσθεσε διευθύνσεις</button>
                   για ταξινόμηση απόστασης.</div>`
                : '';

            const navHtml = storeRows.map((store, idx) => {
                const signal = UI.getStoreSignalClass?.(store.variants.length) || '';
                const bbBadge = ctx?.showPurchaseStatus ? (UI.buildStoreHeadPurchaseBadge
                    ? '' // use meta from existing builder via clone path
                    : '') : '';
                const distLabel = ctx?.showDistance && myStore
                    ? window.getStoreDistanceLabel?.(myStore, store.name)
                    : '';
                const distChip = distLabel ? `<span class="tm-sl-store-dist">${esc(distLabel)}</span>` : '';
                const cls = [
                    'tm-sl-network-store',
                    signal,
                    idx === 0 ? 'is-active is-recommended' : '',
                    idx === closestIdx ? 'is-closest' : '',
                    idx === mostStockIdx ? 'is-most-stock' : '',
                    store._resolving ? 'is-resolving' : '',
                ].filter(Boolean).join(' ');
                const hint = store._resolving ? '<span class="tm-sl-network-store__hint">φόρτωση…</span>' : '';
                const purchaseBadge = ctx?.showPurchaseStatus && typeof UI.buildStoreHeadPurchaseBadge === 'function'
                    ? '' : '';
                void bbBadge; void purchaseBadge;
                const headBadge = (() => {
                    const hasBuyback = store.variants.some((v) => v.isBuyback);
                    if (!hasBuyback || !ctx?.showPurchaseStatus) return '';
                    const allowed = typeof window.isStoreAllowedForPhone !== 'function'
                        || window.isStoreAllowedForPhone(store.name, true);
                    return allowed
                        ? '<span class="tm-sl-store-bb-status tm-sl-store-bb-status--ok">BB ✓</span>'
                        : '<span class="tm-sl-store-bb-status tm-sl-store-bb-status--no">✕ Όχι BB</span>';
                })();

                return `<button type="button" class="${cls}" data-tm-sl-select-store="${idx}" role="tab"
                    aria-selected="${idx === 0 ? 'true' : 'false'}" tabindex="${idx === 0 ? '0' : '-1'}">
                    <span class="tm-sl-network-store__name">${esc(store.name)}</span>
                    <span class="tm-sl-network-store__meta">${distChip}${headBadge}${hint}<span>${store.variants.length} τεμ.</span></span>
                </button>`;
            }).join('');

            const enrichedCtx = {
                ...ctx,
                modelName,
                nearestStoreLabel,
                mostStockStoreLabel,
            };

            const panelsHtml = storeRows.map((store, idx) => {
                const meta = typeof UI.buildNetworkStoreMetaInner === 'function'
                    ? UI.buildNetworkStoreMetaInner(store, enrichedCtx)
                    : `<h3>${esc(store.name)}</h3>`;
                return `<div class="tm-sl-network-panel" data-tm-sl-store-panel="${idx}">
                    <div class="tm-sl-network-panel-meta">${meta}</div>
                    ${UI.buildUnitTable(store.variants, enrichedCtx)}
                </div>`;
            }).join('');

            const firstHead = typeof UI.buildNetworkDetailHead === 'function'
                ? UI.buildNetworkDetailHead(storeRows[0], enrichedCtx)
                : `<div class="tm-sl-network-detail-head"><h3>${esc(storeRows[0].name)}</h3></div>`;

            return `<div class="tm-sl-network-board">
                ${resolvingNote}${noGeo}
                ${buildSummaryStripHtml(insights)}
                ${buildBestMatchStripHtml(insights, enrichedCtx)}
                ${compareHtml}
                <aside class="tm-sl-network-stores" role="tablist" aria-label="Καταστήματα">
                    <div class="tm-sl-network-stores__label">Καταστήματα · ${storeRows.length}</div>
                    ${navHtml}
                </aside>
                <main class="tm-sl-network-detail" id="tm-sl-network-detail" role="tabpanel">
                    ${firstHead}
                    <div id="tm-sl-network-table-root">${UI.buildUnitTable(storeRows[0].variants, enrichedCtx)}</div>
                </main>
                <div class="tm-sl-network-panels" hidden aria-hidden="true">${panelsHtml}</div>
            </div>`;
        };

        // expose meta builder if missing on UI
        if (typeof UI.buildNetworkStoreMetaInner !== 'function') {
            UI.buildNetworkStoreMetaInner = function (store, ctx) {
                const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
                const distLabel = ctx?.showDistance && myStore
                    ? window.getStoreDistanceLabel?.(myStore, store.name)
                    : '';
                const qtyLabel = store.variants.length === 1 ? '1 τεμ.' : `${store.variants.length} τεμ.`;
                return `<h3 id="tm-sl-network-store-title">${esc(store.name)}</h3>
                    <div class="tm-sl-network-detail-head__meta">
                        ${distLabel ? `<span class="tm-sl-store-dist">${esc(distLabel)}</span>` : ''}
                        <span>${qtyLabel}</span>
                    </div>`;
            };
        }
    }

    window.PhoneCatalogFeatures = {
        ensureFeatureStyles,
        parseSmartSearch,
        modelMatchesSmartQuery,
        findModelByCode,
        computeVariantInsights,
        buildSummaryStripHtml,
        buildBestMatchStripHtml,
        buildCompareMatrixHtml,
        buildParseBannerHtml,
        purchaseBlockReason,
        formatCopyLine,
        sortVariants,
        applyColumnVisibility,
        buildColumnMenuHtml,
        patchPhoneCatalogUI,
        parsePrice,
        formatPrice,
    };

    if (window.PhoneCatalogUI) {
        patchPhoneCatalogUI();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.PhoneCatalogUI) patchPhoneCatalogUI();
        });
    }
})();
