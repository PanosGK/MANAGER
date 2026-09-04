// ==UserScript==
// @name         MyManager Print Module
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Printing utilities for MyManager
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const PRINT_FONT = "'IBM Plex Sans', 'Segoe UI', sans-serif";
    const PRINT_MONO = "'IBM Plex Mono', 'Consolas', monospace";
    const PRINT_TEMPLATE_KEY = () => window.STORAGE_KEYS?.PRINT_TEMPLATE || 'tm_print_template';

    function prepareFields(fields) {
        const barcodeField = fields.find(f =>
            /barcode|κωδικ/i.test(f.label)
        );
        const filtered = fields.filter(f =>
            f !== barcodeField &&
            !/περιγραφ|description/i.test(f.label)
        );
        return {
            barcode: barcodeField || null,
            fields: barcodeField ? [barcodeField, ...filtered] : filtered
        };
    }

    function escapeHtml(text) {
        return String(text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function isSparePartsOrderUrl(url) {
        return /sparepartstoorder/i.test(String(url || ''));
    }

    function getPrintModalCopy(url) {
        if (isSparePartsOrderUrl(url)) {
            return {
                title: 'Εκτύπωση ανταλλακτικού',
                eyebrow: 'Ανταλλακτικό',
            };
        }
        return {
            title: 'Εκτύπωση παραγγελίας',
            eyebrow: 'Παραγγελία',
        };
    }

    function getPrinterDisplayName() {
        try {
            if (typeof window.tmGetLoggedInDisplayName === 'function') {
                const n = String(window.tmGetLoggedInDisplayName({ fallback: null }) || '').trim();
                if (n) return n.slice(0, 64);
            }
            if (typeof window.MMS_PROFILES?.getLoggedInDisplayName === 'function') {
                const n = String(window.MMS_PROFILES.getLoggedInDisplayName({ fallback: null }) || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        try {
            if (typeof window.MMS_PROFILES?.parseLoginBlockDisplayName === 'function') {
                const n = String(window.MMS_PROFILES.parseLoginBlockDisplayName() || '').trim();
                if (n) return n.slice(0, 64);
            }
        } catch (_) { /* ignore */ }
        const el = document.querySelector('#login_block1 b, .rnr-b-loggedas b');
        if (el) {
            const n = String(el.textContent || '').replace(/^.*ως\s+/i, '').trim();
            if (n) return n.slice(0, 64);
        }
        return String(
            window.tmCurrentUser
            || window.config?.currentUser
            || window.config?.profileLabel
            || ''
        ).trim().slice(0, 64);
    }

    /** Shared card markup — position is applied via CSS class, not separate designs. */
    function renderPrintCard(details, fields, nowText, positionClass, eyebrow) {
        const { barcode, fields: rows } = prepareFields(fields);
        const bodyFields = barcode ? rows.slice(1) : rows;
        const dense = positionClass === 'pos-top-right';

        return `
        <div class="print-surface ${positionClass}${dense ? ' is-dense' : ''}">
            <div class="print-header">
                <div class="print-eyebrow">${escapeHtml(eyebrow || 'Παραγγελία')}</div>
                <h1 class="print-title">${escapeHtml(details.title)}</h1>
            </div>
            ${barcode ? `
            <div class="barcode-block">
                <div class="barcode-label">${escapeHtml(barcode.label)}</div>
                <div class="barcode-value">${escapeHtml(barcode.value)}</div>
            </div>` : ''}
            <div class="fields-list">
                ${bodyFields.map(field => {
                    const isLong = String(field.value || '').length > 60;
                    return `
                        <div class="field-row ${isLong ? 'full' : ''}">
                            <div class="field-label">${escapeHtml(field.label)}</div>
                            <div class="field-value">${escapeHtml(field.value)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="print-footer">
                <div class="footer-mark">MyManager</div>
                <div class="footer-timestamp">${escapeHtml(nowText)}</div>
            </div>
        </div>
        `;
    }

    const SHARED_CARD_STYLES = `
        /* Ink-light B&W: white fills, hairlines, centered text */
        .print-surface {
            font-family: ${PRINT_FONT};
            color: #000;
            background: #fff;
            border: 1px solid #000;
            box-sizing: border-box;
            page-break-inside: avoid;
        }
        .print-surface .print-header {
            background: #fff;
            color: #000;
            padding: 10px 12px 8px;
            border-bottom: 1px solid #000;
            text-align: center;
        }
        .print-surface .print-eyebrow {
            font-size: 8px;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #000;
            margin-bottom: 4px;
        }
        .print-surface .print-title {
            font-size: 15px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
            letter-spacing: -0.02em;
        }
        .print-surface .barcode-block {
            border-bottom: 1px solid #000;
            padding: 8px 12px 9px;
            background: #fff;
            text-align: center;
        }
        .print-surface .barcode-label {
            font-size: 8px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #333;
            margin-bottom: 2px;
        }
        .print-surface .barcode-value {
            font-family: ${PRINT_MONO};
            font-size: 17px;
            font-weight: 600;
            letter-spacing: 0.05em;
            line-height: 1.15;
        }
        .print-surface .fields-list {
            display: flex;
            flex-direction: column;
            padding: 2px 0;
        }
        .print-surface .field-row {
            display: grid;
            grid-template-columns: 34% 66%;
            gap: 8px;
            padding: 6px 12px;
            border-bottom: 1px solid #ddd;
            align-items: center;
            min-height: 0;
        }
        .print-surface .field-row:last-child { border-bottom: none; }
        .print-surface .field-row.full { grid-template-columns: 1fr; gap: 2px; }
        .print-surface .field-label {
            font-size: 8px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #444;
            background: transparent;
            border: 0;
            padding: 0;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .print-surface .field-row.full .field-label {
            border: 0;
            padding: 0;
        }
        .print-surface .field-value {
            font-size: 11.5px;
            font-weight: 500;
            line-height: 1.3;
            color: #000;
            padding: 0;
            white-space: pre-wrap;
            word-break: break-word;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .print-surface .field-value:empty::after {
            content: '—';
            color: #999;
        }
        .print-surface .print-footer {
            border-top: 1px solid #000;
            padding: 6px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
            color: #333;
        }
        .print-surface .footer-mark {
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .print-surface .footer-timestamp {
            font-size: 9px;
            font-weight: 500;
            font-family: ${PRINT_MONO};
        }
        /* Compact tweaks when pinned top-right */
        .print-surface.is-dense .print-header { padding: 8px 9px 6px; }
        .print-surface.is-dense .print-eyebrow { font-size: 8px; margin-bottom: 2px; }
        .print-surface.is-dense .print-title { font-size: 12px; }
        .print-surface.is-dense .barcode-block { padding: 6px 9px 7px; }
        .print-surface.is-dense .barcode-label { font-size: 8px; margin-bottom: 2px; }
        .print-surface.is-dense .barcode-value { font-size: 13px; letter-spacing: 0.04em; }
        .print-surface.is-dense .field-row { padding: 5px 9px; gap: 6px; }
        .print-surface.is-dense .field-label { font-size: 8px; }
        .print-surface.is-dense .field-value { font-size: 10.5px; line-height: 1.25; }
        .print-surface.is-dense .print-footer { padding: 5px 9px; }
        .print-surface.is-dense .footer-mark { font-size: 8px; }
        .print-surface.is-dense .footer-timestamp { font-size: 9px; }
    `;

    const POSITION_LAYOUT_STYLES = `
        /* No flex centering — that made top-right look like middle */
        html, body {
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-family: ${PRINT_FONT};
            font-size: 11px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .print-shell {
            position: relative;
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .print-surface.pos-center {
            width: 100%;
            max-width: 420px;
            margin: 0 auto;
            float: none;
        }
        .print-surface.pos-top-right {
            position: absolute;
            top: 0;
            right: 0;
            width: 95mm;
            max-width: 48%;
            float: none;
            margin: 0;
        }
        @media print {
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            }
            .print-shell {
                position: relative;
                width: 100%;
                min-height: 0;
                height: auto;
            }
            .print-surface.pos-center {
                width: 100%;
                max-width: 420px;
                margin: 0 auto;
            }
            .print-surface.pos-top-right {
                position: absolute;
                top: 0;
                right: 0;
                width: 95mm;
                max-width: 48%;
                float: none;
                margin: 0;
            }
        }
    `;

    // Keep legacy IDs so tm_print_template storage still works.
    const PRINT_TEMPLATES = [
        {
            id: 'classic',
            name: 'Κέντρο',
            description: 'Κάρτα στο κέντρο της σελίδας.',
            positionClass: 'pos-center',
            pageStyle: '@page { size: A4; margin: 14mm; }',
            thumb: 'center',
        },
        {
            id: 'quarter_top_right',
            name: 'Πάνω δεξιά',
            description: 'Κάρτα στην πάνω δεξιά γωνία.',
            positionClass: 'pos-top-right',
            pageStyle: '@page { size: A4; margin: 10mm; }',
            thumb: 'top-right',
        },
    ];

    function ensurePrintTemplateStyles() {
        let style = document.getElementById('tm-print-template-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'tm-print-template-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            #tm-print-template-modal {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.55);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                padding: 16px;
            }
            .tm-pt-card {
                background: #fff;
                color: #000;
                border: 2px solid #000;
                width: min(560px, 96vw);
                box-shadow: 8px 8px 0 #000;
                padding: 18px;
                font-family: ${PRINT_FONT};
            }
            .tm-pt-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 14px;
                padding-bottom: 12px;
                border-bottom: 2px solid #000;
                gap: 12px;
            }
            .tm-pt-title {
                font-size: 16px;
                font-weight: 700;
                letter-spacing: -0.01em;
                color: #000;
            }
            .tm-pt-subtitle {
                font-size: 12px;
                color: #444;
                margin-top: 3px;
            }
            .tm-pt-close {
                background: #000;
                border: 0;
                color: #fff;
                width: 28px;
                height: 28px;
                font-size: 18px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .tm-pt-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 10px;
            }
            @media (max-width: 520px) {
                .tm-pt-options { grid-template-columns: 1fr; }
            }
            .tm-pt-option {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 12px;
                border: 2px solid #000;
                background: #fff;
                cursor: pointer;
                text-align: left;
                transition: background 0.12s ease, box-shadow 0.12s ease;
                font-family: inherit;
                color: inherit;
            }
            .tm-pt-option:hover { background: #f7f7f7; }
            .tm-pt-option.is-selected {
                background: #f2f2f2;
                box-shadow: inset 0 0 0 2px #000;
            }
            .tm-pt-option:focus-visible {
                outline: 2px solid #000;
                outline-offset: 2px;
            }
            .tm-pt-thumb {
                position: relative;
                width: 100%;
                aspect-ratio: 210 / 297;
                border: 1.5px solid #bbb;
                background: #fafafa;
                border-radius: 2px;
                overflow: hidden;
            }
            .tm-pt-thumb-card {
                position: absolute;
                background: #111;
                border: 1px solid #000;
                box-shadow: 0 1px 2px rgba(0,0,0,0.15);
            }
            .tm-pt-thumb--center .tm-pt-thumb-card {
                left: 50%;
                top: 12%;
                transform: translateX(-50%);
                width: 42%;
                height: 28%;
            }
            .tm-pt-thumb--top-right .tm-pt-thumb-card {
                top: 6%;
                right: 6%;
                width: 38%;
                height: 22%;
            }
            .tm-pt-name {
                font-weight: 700;
                color: #000;
                font-size: 14px;
            }
            .tm-pt-desc {
                font-size: 11px;
                color: #555;
                line-height: 1.35;
            }
            .tm-pt-hint {
                font-size: 11px;
                color: #666;
                margin: 0 0 12px;
                line-height: 1.4;
            }
            .tm-pt-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                padding-top: 4px;
            }
            .tm-pt-actions button {
                border: 1.5px solid #000;
                border-radius: 0;
                padding: 9px 14px;
                font-weight: 700;
                cursor: pointer;
                font-family: inherit;
                font-size: 12px;
                letter-spacing: 0.04em;
                text-transform: uppercase;
            }
            .tm-pt-secondary {
                background: #fff;
                color: #000;
            }
            .tm-pt-secondary:hover { background: #f2f2f2; }
            .tm-pt-primary {
                background: #000;
                color: #fff;
            }
            .tm-pt-primary:hover { background: #222; }
        `;
    }

    function openPrintTemplateModal(opts = {}) {
        ensurePrintTemplateStyles();
        return new Promise(resolve => {
            const existing = document.getElementById('tm-print-template-modal');
            if (existing) existing.remove();

            const lastChoice = GM_getValue(PRINT_TEMPLATE_KEY(), PRINT_TEMPLATES[0].id);
            const validLast = PRINT_TEMPLATES.some(t => t.id === lastChoice)
                ? lastChoice
                : PRINT_TEMPLATES[0].id;
            const copy = getPrintModalCopy(opts.url);

            const overlay = document.createElement('div');
            overlay.id = 'tm-print-template-modal';
            overlay.innerHTML = `
                <div class="tm-pt-card" role="dialog" aria-modal="true" aria-labelledby="tm-pt-title">
                    <div class="tm-pt-header">
                        <div>
                            <div class="tm-pt-title" id="tm-pt-title">${escapeHtml(copy.title)}</div>
                            <div class="tm-pt-subtitle">Θέση εκτύπωσης</div>
                        </div>
                        <button type="button" class="tm-pt-close" aria-label="Κλείσιμο">×</button>
                    </div>
                    <div class="tm-pt-options" role="radiogroup" aria-label="Θέση εκτύπωσης">
                        ${PRINT_TEMPLATES.map(t => `
                            <button type="button" class="tm-pt-option${t.id === validLast ? ' is-selected' : ''}"
                                data-template="${t.id}" role="radio"
                                aria-checked="${t.id === validLast ? 'true' : 'false'}">
                                <div class="tm-pt-thumb tm-pt-thumb--${t.thumb}" aria-hidden="true">
                                    <div class="tm-pt-thumb-card"></div>
                                </div>
                                <div>
                                    <div class="tm-pt-name">${escapeHtml(t.name)}</div>
                                    <div class="tm-pt-desc">${escapeHtml(t.description)}</div>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                    <p class="tm-pt-hint">Θυμόμαστε την τελευταία επιλογή. Διπλό κλικ για άμεση εκτύπωση.</p>
                    <div class="tm-pt-actions">
                        <button type="button" class="tm-pt-secondary">Ακύρωση</button>
                        <button type="button" class="tm-pt-primary">Εκτύπωση</button>
                    </div>
                </div>
            `;

            let selectedId = validLast;
            let settled = false;

            const removeModal = () => overlay.remove();
            const finish = (value) => {
                if (settled) return;
                settled = true;
                removeModal();
                resolve(value);
            };

            const selectOption = (id) => {
                selectedId = id;
                overlay.querySelectorAll('.tm-pt-option').forEach(opt => {
                    const on = opt.getAttribute('data-template') === id;
                    opt.classList.toggle('is-selected', on);
                    opt.setAttribute('aria-checked', on ? 'true' : 'false');
                });
            };

            const confirmPrint = () => {
                if (!selectedId) return;
                GM_setValue(PRINT_TEMPLATE_KEY(), selectedId);
                finish(selectedId);
            };

            overlay.addEventListener('click', (e) => {
                if (e.target.id === 'tm-print-template-modal') finish(null);
            });

            overlay.querySelector('.tm-pt-close').addEventListener('click', () => finish(null));
            overlay.querySelector('.tm-pt-secondary').addEventListener('click', () => finish(null));
            overlay.querySelector('.tm-pt-primary').addEventListener('click', confirmPrint);

            overlay.querySelectorAll('.tm-pt-option').forEach(option => {
                option.addEventListener('click', () => {
                    selectOption(option.getAttribute('data-template'));
                });
                option.addEventListener('dblclick', (e) => {
                    e.preventDefault();
                    selectOption(option.getAttribute('data-template'));
                    confirmPrint();
                });
            });

            document.body.appendChild(overlay);
            overlay.querySelector('.tm-pt-primary')?.focus();
        });
    }

    function handlePrintClick(url, buttonElement = null) {
        if (typeof trackDailyStat === 'function' && window.config && window.STORAGE_KEYS) {
            trackDailyStat(window.config, window.STORAGE_KEYS, 'printOrder');
        }
        if (!url) return;

        const idleLabel = isSparePartsOrderUrl(url)
            ? 'Εκτύπωση Ανταλλακτικού'
            : 'Εκτύπωση Παραγγελίας';

        if (buttonElement) {
            buttonElement.textContent = 'Φόρτωση...';
            buttonElement.disabled = true;
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, 'text/html');
                const details = scrapeOrderDetails(doc);
                openPrintTemplateModal({ url })
                    .then(templateId => {
                        if (templateId) {
                            generatePrintPage(details, templateId, { url });
                        }
                    })
                    .finally(() => {
                        if (buttonElement) {
                            buttonElement.textContent = idleLabel;
                            buttonElement.disabled = false;
                        }
                    });
            },
            onerror: function(error) {
                console.error('Failed to fetch order details for printing:', error);
                alert('Αποτυχία φόρτωσης δεδομένων για εκτύπωση.');
                if (buttonElement) {
                    buttonElement.textContent = idleLabel;
                    buttonElement.disabled = false;
                }
            }
        });
    }
    window.handlePrintClick = handlePrintClick;

    function scrapeOrderDetails(doc) {
        const details = { title: 'Λεπτομέρειες Παραγγελίας', fields: [] };
        const titleElement = doc.querySelector('.pagetitle, h1.page-header, h1, h2');
        if (titleElement) {
            details.title = titleElement.innerText.trim();
        }

        const addField = (label, value) => {
            if (label && value !== null && value !== undefined && !details.fields.some(f => f.label === label)) {
                details.fields.push({ label, value: value.toString().trim() });
            }
        };

        doc.querySelectorAll('div.rnr-field').forEach(fieldDiv => {
            const labelEl = fieldDiv.querySelector('.rnr-label label');
            const controlEl = fieldDiv.querySelector('.rnr-control');
            if (!labelEl || !controlEl) return;

            const label = labelEl.innerText.trim();
            let value = null;

            const textInput = controlEl.querySelector('input[type="text"], input[type="Text"], input[type="number"], textarea');
            const checkboxInput = controlEl.querySelector('input[type="Checkbox"], input[type="checkbox"]');
            const readonlySpan = controlEl.querySelector('span[id^="readonly_value_"]');

            if (checkboxInput) {
                value = checkboxInput.checked ? 'Ναι' : 'Όχι';
            } else if (textInput) {
                value = textInput.value;
            } else if (readonlySpan) {
                value = readonlySpan.innerText;
            } else {
                value = controlEl.innerText.trim();
            }

            addField(label, value);
        });

        if (details.fields.length === 0) {
            console.error('[MMS] Scraping failed; no fields extracted.');
        }

        return details;
    }
    window.scrapeOrderDetails = scrapeOrderDetails;

    function generatePrintPage(
        details,
        templateId = GM_getValue(PRINT_TEMPLATE_KEY(), PRINT_TEMPLATES[0].id),
        opts = {}
    ) {
        const fields = (details?.fields || []).filter(field => field.value && field.label !== 'Κατάστημα');
        const now = new Date();
        const printerName = getPrinterDisplayName();
        const timePart = `${now.toLocaleDateString()} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const nowText = printerName ? `${timePart} • ${printerName}` : timePart;
        const template = PRINT_TEMPLATES.find(t => t.id === templateId) || PRINT_TEMPLATES[0];
        const copy = getPrintModalCopy(opts.url);
        const positionClass = template.positionClass || 'pos-center';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Το παράθυρο εκτύπωσης μπλοκαρίστηκε. Επιτρέψτε τα pop-ups και δοκιμάστε ξανά.');
            return;
        }

        printWindow.document.write(`
            <html><head><title>Εκτύπωση - ${escapeHtml(details.title)}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
            <style>
                ${template.pageStyle || '@page { size: A4; margin: 14mm; }'}
                * { box-sizing: border-box; }
                ${POSITION_LAYOUT_STYLES}
                ${SHARED_CARD_STYLES}
            </style></head><body>
            <div class="print-shell">
                ${renderPrintCard(details, fields, nowText, positionClass, copy.eyebrow)}
            </div>
            <script>
                function runPrint() {
                    window.print();
                    window.onafterprint = function() { window.close(); };
                }
                window.onload = function() {
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(runPrint).catch(runPrint);
                    } else {
                        setTimeout(runPrint, 250);
                    }
                };
            </script>
            </body></html>
        `);
        printWindow.document.close();
    }
})();
