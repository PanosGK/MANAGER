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

    const PRINT_ACCENT_COLOR = '#00bcd4';
    const PRINT_MUTED_COLOR = '#f5f7fa';

    const PRINT_TEMPLATES = [
        {
            id: 'classic',
            name: 'Κλασικό A4',
            description: 'Απλό, καθαρό πρότυπο για το πάνω μισό της σελίδας.',
            pageStyle: '@page { size: A4; margin: 12mm; }',
            styles: `
                .print-surface.classic { max-width: 400px; margin: 0 auto; font-family: 'Inter', 'Segoe UI', sans-serif; }
                .print-surface.classic .print-header { text-align: center; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 2px solid ${PRINT_ACCENT_COLOR}; }
                .print-surface.classic .print-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-align: center; }
                .print-surface.classic .fields-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; border: 1px solid #e2e8f0; }
                .print-surface.classic .field-item { display: flex; flex-direction: column; padding: 10px 12px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; min-height: 60px; justify-content: center; align-items: center; text-align: center; }
                .print-surface.classic .field-item:nth-child(2n) { border-right: none; }
                .print-surface.classic .field-item.full { grid-column: span 2; border-right: none; }
                .print-surface.classic .field-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; text-align: center; }
                .print-surface.classic .field-value { font-size: 12px; font-weight: 600; color: #0f172a; line-height: 1.5; white-space: pre-wrap; word-break: break-word; text-align: center; }
                .print-surface.classic .field-value:empty::after { content: '—'; color: #cbd5e1; }
                .print-surface.classic .print-footer { margin-top: 12px; padding-top: 8px; text-align: center; border-top: 1px solid #e2e8f0; }
                .print-surface.classic .footer-timestamp { font-size: 10px; color: #94a3b8; font-weight: 600; text-align: center; }
            `,
            render: (details, fields, nowText) => {
                // Filter out description field and reorder: put barcode first
                const barcodeField = fields.find(f => f.label.toLowerCase().includes('barcode') || f.label.toLowerCase().includes('κωδικ'));
                const filteredFields = fields.filter(f => 
                    f !== barcodeField && 
                    !f.label.toLowerCase().includes('περιγραφ') && 
                    !f.label.toLowerCase().includes('description')
                );
                
                const reorderedFields = barcodeField ? [barcodeField, ...filteredFields] : filteredFields;
                
                return `
                <div class="print-surface classic">
                    <div class="print-header">
                        <div class="print-title">${details.title}</div>
                    </div>
                    <div class="fields-grid">
                        ${reorderedFields.map(field => {
                            const isLong = field.value.length > 60;
                            return `
                                <div class="field-item ${isLong ? 'full' : ''}">
                                    <div class="field-label">${field.label}</div>
                                    <div class="field-value">${field.value}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="print-footer">
                        <div class="footer-timestamp">${nowText}</div>
                    </div>
                </div>
                `;
            }
        },
        
        {
            id: 'quarter_top_right',
            name: 'Πάνω Δεξιά 1/4',
            description: 'Μίνιμαλ καρτέλα πάνω δεξιά.',
            pageStyle: '@page { size: A4; margin: 12mm; }',
            styles: `
                .print-surface.quarter { width: 48%; max-width: 48%; margin-left: auto; margin-right: 0; align-self: flex-start; border: 1px solid #e6e9ee; border-radius: 8px; padding: 5px 6px; box-shadow: none; background: #ffffff; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 12px; text-align: center; float: right; box-sizing: border-box; page-break-inside: avoid; }
                .print-surface.quarter .print-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 3px; padding: 2px 0 4px; border-bottom: 1px solid #e6e9ee; text-align: center; }
                .print-surface.quarter .print-left { display: flex; flex-direction: column; gap: 1px; align-items: center; }
                .print-surface.quarter .print-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.2px; text-transform: uppercase; color: #6b7280; text-align: center; }
                .print-surface.quarter .print-title { font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.08; text-align: center; }
                .print-surface.quarter .print-meta { font-size: 10.5px; padding: 2px 6px; border-radius: 6px; background: #f3f4f6; border: 1px solid #e5e7eb; color: #0f172a; white-space: nowrap; text-align: center; display: inline-block; }
                .print-surface.quarter .print-body { margin-top: 3px; padding: 0; }
                .print-surface.quarter .kv-list { display: flex; flex-direction: column; gap: 0; }
                .print-surface.quarter .kv-row { display: grid; grid-template-columns: 38% 62%; gap: 2px; align-items: center; justify-items: center; padding: 3px 0; border-bottom: 1px dashed #e6e9ee; text-align: center; }
                .print-surface.quarter .kv-row:last-child { border-bottom: none; }
                .print-surface.quarter .kv-row .label { font-size: 11px; font-weight: 700; color: #4b5563; letter-spacing: 0.02px; text-align: center; }
                .print-surface.quarter .kv-row .value { font-size: 12px; color: #0f172a; line-height: 1.2; white-space: pre-wrap; word-break: break-word; text-align: center; }
            `,
            render: (details, fields, nowText) => `
                <div class="print-surface quarter">
                    <div class="print-header">
                        <div class="print-left">
                            <div class="print-title">${details.title}</div>
                        </div>
                    </div>
                    <div class="print-body">
                        <div class="kv-list">
                            ${fields.map(field => `
                                <div class="kv-row">
                                    <div class="label">${field.label}</div>
                                    <div class="value">${field.value}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="padding: 8px 0 0; text-align: center;">
                            <span class="print-meta">${nowText}</span>
                        </div>
                    </div>
                </div>
            `
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
                background: rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            .tm-pt-card {
                background: #0f172a;
                color: #e2e8f0;
                border: 1px solid #1e293b;
                border-radius: 10px;
                width: min(520px, 92vw);
                box-shadow: 0 10px 40px rgba(0,0,0,0.35);
                padding: 16px;
                font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            }
            .tm-pt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .tm-pt-title { font-size: 16px; font-weight: 700; color: #e2e8f0; }
            .tm-pt-subtitle { font-size: 12px; color: #94a3b8; }
            .tm-pt-close { background: none; border: 0; color: #cbd5e1; font-size: 20px; cursor: pointer; }
            .tm-pt-options { display: grid; gap: 8px; margin-bottom: 12px; }
            .tm-pt-option { display: flex; gap: 10px; align-items: flex-start; padding: 10px; border: 1px solid #1f2937; border-radius: 8px; background: #111827; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
            .tm-pt-option:hover { border-color: ${PRINT_ACCENT_COLOR}; background: #0b1220; }
            .tm-pt-option input { margin-top: 3px; accent-color: ${PRINT_ACCENT_COLOR}; }
            .tm-pt-option .tm-pt-name { font-weight: 700; color: #e2e8f0; }
            .tm-pt-option .tm-pt-desc { font-size: 12px; color: #94a3b8; }
            .tm-pt-actions { display: flex; justify-content: flex-end; gap: 8px; }
            .tm-pt-actions button { border: 0; border-radius: 6px; padding: 8px 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
            .tm-pt-secondary { background: #1f2937; color: #e2e8f0; }
            .tm-pt-primary { background: ${PRINT_ACCENT_COLOR}; color: #082f49; }
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
            <html><head><title>Εκτύπωση - ${details.title}</title>
            <style>
                ${template.pageStyle || '@page { size: A4; margin: 12mm; }'}
                :root { --print-accent: ${PRINT_ACCENT_COLOR}; --print-muted: ${PRINT_MUTED_COLOR}; }
                * { box-sizing: border-box; }
                body {
                    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                    font-size: 11px;
                    color: #0f172a;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin: 0;
                    background: white;
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
                window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
            </script>
            </body></html>
        `);
        printWindow.document.close();
    }
})();

