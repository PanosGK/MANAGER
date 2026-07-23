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

    const PRINT_TEMPLATES = [
        {
            id: 'classic',
            name: 'Κλασικό A4',
            description: 'Πλήρης ασπρόμαυρη κάρτα για το πάνω μισό της σελίδας.',
            pageStyle: '@page { size: A4; margin: 14mm; }',
            styles: `
                .print-surface.classic {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                    font-family: ${PRINT_FONT};
                    color: #000;
                    background: #fff;
                    border: 2px solid #000;
                }
                .print-surface.classic .print-header {
                    background: #000;
                    color: #fff;
                    padding: 14px 16px 12px;
                    text-align: left;
                }
                .print-surface.classic .print-eyebrow {
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    opacity: 0.7;
                    margin-bottom: 4px;
                }
                .print-surface.classic .print-title {
                    font-size: 17px;
                    font-weight: 700;
                    line-height: 1.25;
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .print-surface.classic .barcode-block {
                    border-bottom: 2px solid #000;
                    padding: 12px 16px;
                    background: #fff;
                }
                .print-surface.classic .barcode-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #000;
                    margin-bottom: 4px;
                }
                .print-surface.classic .barcode-value {
                    font-family: ${PRINT_MONO};
                    font-size: 18px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    line-height: 1.2;
                }
                .print-surface.classic .fields-list {
                    display: flex;
                    flex-direction: column;
                }
                .print-surface.classic .field-row {
                    display: grid;
                    grid-template-columns: 38% 62%;
                    gap: 0;
                    border-bottom: 1px solid #000;
                    min-height: 36px;
                }
                .print-surface.classic .field-row:last-child {
                    border-bottom: none;
                }
                .print-surface.classic .field-row.full {
                    grid-template-columns: 1fr;
                }
                .print-surface.classic .field-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 8px 12px;
                    border-right: 1px solid #000;
                    display: flex;
                    align-items: center;
                    background: #f2f2f2;
                }
                .print-surface.classic .field-row.full .field-label {
                    border-right: none;
                    border-bottom: 1px solid #000;
                    padding-bottom: 4px;
                }
                .print-surface.classic .field-value {
                    font-size: 12px;
                    font-weight: 500;
                    line-height: 1.4;
                    padding: 8px 12px;
                    white-space: pre-wrap;
                    word-break: break-word;
                    display: flex;
                    align-items: center;
                }
                .print-surface.classic .field-value:empty::after {
                    content: '—';
                    color: #999;
                }
                .print-surface.classic .print-footer {
                    border-top: 2px solid #000;
                    padding: 8px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #fff;
                }
                .print-surface.classic .footer-mark {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }
                .print-surface.classic .footer-timestamp {
                    font-size: 10px;
                    font-weight: 500;
                    font-family: ${PRINT_MONO};
                }
            `,
            render: (details, fields, nowText) => {
                const { barcode, fields: rows } = prepareFields(fields);
                const bodyFields = barcode ? rows.slice(1) : rows;

                return `
                <div class="print-surface classic">
                    <div class="print-header">
                        <div class="print-eyebrow">Παραγγελία</div>
                        <h1 class="print-title">${escapeHtml(details.title)}</h1>
                    </div>
                    ${barcode ? `
                    <div class="barcode-block">
                        <div class="barcode-label">${escapeHtml(barcode.label)}</div>
                        <div class="barcode-value">${escapeHtml(barcode.value)}</div>
                    </div>` : ''}
                    <div class="fields-list">
                        ${bodyFields.map(field => {
                            const isLong = field.value.length > 60;
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
        },

        {
            id: 'quarter_top_right',
            name: 'Πάνω Δεξιά 1/4',
            description: 'Συμπαγής ασπρόμαυρη κάρτα πάνω δεξιά.',
            pageStyle: '@page { size: A4; margin: 10mm; }',
            styles: `
                .print-surface.quarter {
                    width: 48%;
                    max-width: 48%;
                    margin-left: auto;
                    margin-right: 0;
                    float: right;
                    box-sizing: border-box;
                    page-break-inside: avoid;
                    font-family: ${PRINT_FONT};
                    color: #000;
                    background: #fff;
                    border: 2px solid #000;
                    font-size: 11px;
                }
                .print-surface.quarter .print-header {
                    background: #000;
                    color: #fff;
                    padding: 8px 10px;
                }
                .print-surface.quarter .print-eyebrow {
                    font-size: 8px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    opacity: 0.7;
                    margin-bottom: 2px;
                }
                .print-surface.quarter .print-title {
                    font-size: 12px;
                    font-weight: 700;
                    line-height: 1.2;
                    margin: 0;
                }
                .print-surface.quarter .barcode-block {
                    border-bottom: 1.5px solid #000;
                    padding: 7px 10px;
                }
                .print-surface.quarter .barcode-label {
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }
                .print-surface.quarter .barcode-value {
                    font-family: ${PRINT_MONO};
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                }
                .print-surface.quarter .kv-list {
                    display: flex;
                    flex-direction: column;
                }
                .print-surface.quarter .kv-row {
                    display: grid;
                    grid-template-columns: 36% 64%;
                    border-bottom: 1px solid #000;
                }
                .print-surface.quarter .kv-row:last-child {
                    border-bottom: none;
                }
                .print-surface.quarter .kv-row .label {
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    padding: 5px 8px;
                    border-right: 1px solid #000;
                    background: #f2f2f2;
                    display: flex;
                    align-items: center;
                }
                .print-surface.quarter .kv-row .value {
                    font-size: 11px;
                    font-weight: 500;
                    line-height: 1.25;
                    padding: 5px 8px;
                    white-space: pre-wrap;
                    word-break: break-word;
                    display: flex;
                    align-items: center;
                }
                .print-surface.quarter .print-footer {
                    border-top: 1.5px solid #000;
                    padding: 5px 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .print-surface.quarter .footer-mark {
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                .print-surface.quarter .print-meta {
                    font-size: 9px;
                    font-family: ${PRINT_MONO};
                    font-weight: 500;
                }
            `,
            render: (details, fields, nowText) => {
                const { barcode, fields: rows } = prepareFields(fields);
                const bodyFields = barcode ? rows.slice(1) : rows;

                return `
                <div class="print-surface quarter">
                    <div class="print-header">
                        <div class="print-eyebrow">Παραγγελία</div>
                        <div class="print-title">${escapeHtml(details.title)}</div>
                    </div>
                    ${barcode ? `
                    <div class="barcode-block">
                        <div class="barcode-label">${escapeHtml(barcode.label)}</div>
                        <div class="barcode-value">${escapeHtml(barcode.value)}</div>
                    </div>` : ''}
                    <div class="kv-list">
                        ${bodyFields.map(field => `
                            <div class="kv-row">
                                <div class="label">${escapeHtml(field.label)}</div>
                                <div class="value">${escapeHtml(field.value)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="print-footer">
                        <div class="footer-mark">MyManager</div>
                        <span class="print-meta">${escapeHtml(nowText)}</span>
                    </div>
                </div>
                `;
            }
        }
    ];

    function ensurePrintTemplateStyles() {
        if (document.getElementById('tm-print-template-styles')) return;
        const style = document.createElement('style');
        style.id = 'tm-print-template-styles';
        style.textContent = `
            #tm-print-template-modal {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.55);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            .tm-pt-card {
                background: #fff;
                color: #000;
                border: 2px solid #000;
                border-radius: 0;
                width: min(480px, 92vw);
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
            }
            .tm-pt-title {
                font-size: 16px;
                font-weight: 700;
                letter-spacing: -0.01em;
                color: #000;
            }
            .tm-pt-subtitle {
                font-size: 11px;
                color: #444;
                margin-top: 3px;
                letter-spacing: 0.02em;
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
            }
            .tm-pt-options { display: grid; gap: 8px; margin-bottom: 14px; }
            .tm-pt-option {
                display: flex;
                gap: 10px;
                align-items: flex-start;
                padding: 12px;
                border: 1.5px solid #000;
                background: #fff;
                cursor: pointer;
                transition: background 0.12s ease;
            }
            .tm-pt-option:hover,
            .tm-pt-option:has(input:checked) {
                background: #f2f2f2;
            }
            .tm-pt-option input {
                margin-top: 2px;
                accent-color: #000;
            }
            .tm-pt-option .tm-pt-name {
                font-weight: 700;
                color: #000;
                font-size: 13px;
            }
            .tm-pt-option .tm-pt-desc {
                font-size: 11px;
                color: #444;
                margin-top: 2px;
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
        document.head.appendChild(style);
    }

    function openPrintTemplateModal() {
        ensurePrintTemplateStyles();
        return new Promise(resolve => {
            const existing = document.getElementById('tm-print-template-modal');
            if (existing) existing.remove();

            const lastChoice = GM_getValue(window.STORAGE_KEYS?.PRINT_TEMPLATE || 'tm_print_template', PRINT_TEMPLATES[0].id);
            const overlay = document.createElement('div');
            overlay.id = 'tm-print-template-modal';
            overlay.innerHTML = `
                <div class="tm-pt-card">
                    <div class="tm-pt-header">
                        <div>
                            <div class="tm-pt-title">Εκτύπωση παραγγελίας</div>
                            <div class="tm-pt-subtitle">Επιλέξτε πρότυπο εκτύπωσης</div>
                        </div>
                        <button class="tm-pt-close" aria-label="Close">×</button>
                    </div>
                    <div class="tm-pt-options">
                        ${PRINT_TEMPLATES.map(t => `
                            <label class="tm-pt-option" data-template="${t.id}">
                                <input type="radio" name="tm-pt-choice" value="${t.id}" ${t.id === lastChoice ? 'checked' : ''}>
                                <div>
                                    <div class="tm-pt-name">${t.name}</div>
                                    <div class="tm-pt-desc">${t.description}</div>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                    <div class="tm-pt-actions">
                        <button type="button" class="tm-pt-secondary">Ακύρωση</button>
                        <button type="button" class="tm-pt-primary">Εκτύπωση</button>
                    </div>
                </div>
            `;

            const removeModal = () => overlay.remove();
            const getSelectedTemplate = () => {
                const selected = overlay.querySelector('input[name="tm-pt-choice"]:checked');
                return selected ? selected.value : null;
            };

            overlay.addEventListener('click', (e) => {
                if (e.target.id === 'tm-print-template-modal') {
                    removeModal();
                    resolve(null);
                }
            });

            overlay.querySelector('.tm-pt-close').addEventListener('click', () => {
                removeModal();
                resolve(null);
            });

            overlay.querySelector('.tm-pt-secondary').addEventListener('click', () => {
                removeModal();
                resolve(null);
            });

            overlay.querySelector('.tm-pt-primary').addEventListener('click', () => {
                const choice = getSelectedTemplate();
                if (choice) {
                    GM_setValue(window.STORAGE_KEYS?.PRINT_TEMPLATE || 'tm_print_template', choice);
                    removeModal();
                    resolve(choice);
                }
            });

            overlay.querySelectorAll('.tm-pt-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const radio = option.querySelector('input');
                    if (e.target !== radio) {
                        radio.checked = true;
                    }
                });
            });

            document.body.appendChild(overlay);
        });
    }

    function handlePrintClick(url, buttonElement = null) {
        if (typeof trackDailyStat === 'function' && window.config && window.STORAGE_KEYS) {
            trackDailyStat(window.config, window.STORAGE_KEYS, 'printOrder');
        }
        if (!url) return;

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
                openPrintTemplateModal()
                    .then(templateId => {
                        if (templateId) {
                            generatePrintPage(details, templateId);
                        }
                    })
                    .finally(() => {
                        if (buttonElement) {
                            buttonElement.textContent = 'Εκτύπωση Παραγγελίας';
                            buttonElement.disabled = false;
                        }
                    });
            },
            onerror: function(error) {
                console.error('Failed to fetch order details for printing:', error);
                alert('Αποτυχία φόρτωσης δεδομένων για εκτύπωση.');
                if (buttonElement) {
                    buttonElement.textContent = 'Εκτύπωση Παραγγελίας';
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

    function generatePrintPage(details, templateId = GM_getValue(window.STORAGE_KEYS?.PRINT_TEMPLATE || 'tm_print_template', PRINT_TEMPLATES[0].id)) {
        const fields = (details?.fields || []).filter(field => field.value && field.label !== 'Κατάστημα');
        const now = new Date();
        const nowText = `${now.toLocaleDateString()} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const template = PRINT_TEMPLATES.find(t => t.id === templateId) || PRINT_TEMPLATES[0];

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Εκτύπωση - ${escapeHtml(details.title)}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@500;600;700&display=swap" rel="stylesheet">
            <style>
                ${template.pageStyle || '@page { size: A4; margin: 14mm; }'}
                * { box-sizing: border-box; }
                body {
                    font-family: ${PRINT_FONT};
                    font-size: 11px;
                    color: #000;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin: 0;
                    background: #fff;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .print-shell { width: 100%; display: flex; justify-content: center; }
                .print-shell.quarter-mode { justify-content: flex-end; align-items: flex-start; padding-top: 0; }
                .print-surface { width: 100%; max-width: 100%; }
                ${template.styles || ''}
            </style></head><body>
            <div class="print-shell ${template.id === 'quarter_top_right' ? 'quarter-mode' : ''}">
                ${template.render(details, fields, nowText)}
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
