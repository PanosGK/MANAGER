// ==UserScript==
// @name         MyManager Order Link Module
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Order ↔ repair links (status 65 orders + repair from order page)
// @author       Assistant
// @match        https://thefixers.mymanager.gr/mymanagerservice/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    console.log('[MMS Order Link] Module loaded');

    /**
     * Gets the current repair status from the page
     * @returns {string|null} The status ID (e.g., '65') or null if not found
     */
    function getCurrentRepairStatus() {
        console.log('[MMS Order Link] Searching for repair status...');
        
        // Try to find status badge (the status is displayed as a badge, not a select)
        const statusBadge = document.querySelector('.statusbadge.statusbadge-large, .statusbadge-large, .statusbadge');
        if (statusBadge) {
            console.log('[MMS Order Link] ✓ Found status badge element');
            const statusText = statusBadge.textContent || statusBadge.innerText;
            console.log('[MMS Order Link] Status badge text:', statusText);
            
            // Extract the numeric status ID from the badge text (e.g., "65 ΑΝΑΜΟΝΗ ΑΝΤΑΛ/ΚΟΥ" -> "65")
            const statusMatch = statusText.match(/^\s*(\d+)/);
            if (statusMatch) {
                const statusId = statusMatch[1];
                console.log('[MMS Order Link] ✓ Extracted status ID:', statusId);
                return statusId;
            } else {
                console.log('[MMS Order Link] Could not extract numeric status from badge text');
            }
        } else {
            console.log('[MMS Order Link] ✗ Status badge not found');
        }
        
        // Fallback: try select elements
        const selectors = [
            'select[name="iStatusID"]',
            'select[name*="iStatusID"]',
            'select[id*="iStatusID"]',
            'select[name="value_ccc_iStatusID_1"]',
            'select[id="value_ccc_iStatusID_1"]'
        ];
        
        for (const selector of selectors) {
            const statusSelect = document.querySelector(selector);
            if (statusSelect && statusSelect.value) {
                console.log('[MMS Order Link] ✓ Found status in select element:', selector, 'value:', statusSelect.value);
                return statusSelect.value;
            }
        }
        
        console.log('[MMS Order Link] ✗ Status not found in badge or select elements');
        
        // List all status badges for debugging
        const allBadges = document.querySelectorAll('[class*="statusbadge"], [class*="status"]');
        console.log('[MMS Order Link] All status-related elements:', allBadges.length);
        allBadges.forEach((badge, i) => {
            console.log(`  Badge ${i}:`, badge.className, 'text:', badge.textContent?.substring(0, 50));
        });
        
        return null;
    }

    /**
     * Gets the repair ID (invoice number) from the page
     * @returns {string|null} The repair ID (e.g., 'ΙΗ-4854') or null if not found
     */
    function getRepairId() {
        console.log('[MMS Order Link] Searching for repair ID...');
        
        // Try multiple selectors to find the repair ID
        const selectors = [
            'input[name="iInvoiceNumber"]',
            'input[id*="InvoiceNumber"]',
            'span[id*="InvoiceNumber"]',
            'div[data-fieldname="iInvoiceNumber"] input',
            'td.rnr-field-text span[id*="iInvoiceNumber"]',
            'input[data-fieldname="iInvoiceNumber"]',
            '[name*="InvoiceNumber"]',
            '[id*="InvoiceNumber"]'
        ];

        for (const selector of selectors) {
            console.log('[MMS Order Link] Trying selector:', selector);
            const element = document.querySelector(selector);
            if (element) {
                console.log('[MMS Order Link] Found element with selector:', selector, element);
                const repairId = element.value || element.textContent || element.innerText;
                if (repairId && repairId.trim()) {
                    console.log('[MMS Order Link] ✓ Found repair ID:', repairId.trim());
                    return repairId.trim();
                } else {
                    console.log('[MMS Order Link] Element found but no value');
                }
            }
        }

        // Try to find it in the page title
        const title = document.title;
        console.log('[MMS Order Link] Page title:', title);
        const titleMatch = title.match(/ΙΗ-\d+|IH-\d+/i);
        if (titleMatch) {
            console.log('[MMS Order Link] ✓ Found repair ID in title:', titleMatch[0]);
            return titleMatch[0];
        }

        console.log('[MMS Order Link] ✗ Repair ID not found anywhere');
        return null;
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getPageRepairId() {
        try {
            if (typeof iInvoiceNumber !== 'undefined' && iInvoiceNumber) {
                return String(iInvoiceNumber).trim();
            }
        } catch (_) { /* ignore */ }
        return getRepairId();
    }

    function getPageRepairStatus() {
        try {
            if (typeof iStatusID !== 'undefined' && iStatusID != null) {
                return String(iStatusID);
            }
        } catch (_) { /* ignore */ }
        return getCurrentRepairStatus();
    }

    function parseOrdersFromDocument(doc, repairId) {
        const table = doc.querySelector('.rnr-c-grid.rnr-b-grid.rnr-gridtable.hoverable, table.rnr-gridtable');
        if (!table) {
            throw new Error('Orders table not found');
        }

        const headers = [];
        table.querySelectorAll('thead th').forEach((th) => {
            let headerText = th.textContent.trim();
            const orderSpan = th.querySelector('[id*="order_"], [data-order]');
            let columnKey = null;

            if (orderSpan) {
                const id = orderSpan.id || '';
                const dataOrder = orderSpan.getAttribute('data-order') || '';
                if (id.includes('iAverageBuy') || dataOrder.includes('iAverageBuy')) {
                    columnKey = 'Μέσο Κόστος';
                }
            }

            if (columnKey) {
                headers.push(columnKey);
            } else if (headerText && headerText !== ' ') {
                const lines = headerText.split('\n').map(l => l.trim()).filter(Boolean);
                headers.push(lines[0] || headerText);
            } else {
                headers.push('');
            }
        });

        const matchingOrders = [];
        table.querySelectorAll('tbody tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (!cells.length) return;

            let foundMatch = false;
            const rowData = {};
            const orderLink = row.getAttribute('data-href') || '';

            if (orderLink) {
                rowData._orderLink = orderLink.startsWith('http')
                    ? orderLink
                    : 'https://thefixers.mymanager.gr/mymanagerservice/' + orderLink;
            }

            cells.forEach((cell, index) => {
                if (index >= headers.length) return;

                const checkImg = cell.querySelector('img[src*="check_"]');
                let cellValue;

                if (checkImg) {
                    const imgSrc = checkImg.getAttribute('src') || '';
                    if (imgSrc.includes('check_yes')) cellValue = 'YES';
                    else if (imgSrc.includes('check_no')) cellValue = 'NO';
                    else cellValue = cell.textContent.trim();
                } else {
                    const span = cell.querySelector('span[id*="edit"]');
                    cellValue = span ? span.textContent.trim() : cell.textContent.trim();
                    cellValue = cellValue.replace(/\s+/g, ' ').trim();
                }

                rowData[headers[index]] = cellValue;
                if (cellValue.includes(repairId)) foundMatch = true;
            });

            if (foundMatch) matchingOrders.push(rowData);
        });

        return matchingOrders;
    }

    async function fetchOrdersForRepair(repairId) {
        const ordersUrl = 'https://thefixers.mymanager.gr/mymanagerservice/sparepartstoorder_list.php';
        const response = await fetch(ordersUrl);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return parseOrdersFromDocument(doc, repairId);
    }

    function nativeGridLabel(text, extraHtml = '') {
        const td = document.createElement('td');
        td.className = 'rnr-gridfieldlabel';
        td.innerHTML = text + extraHtml;
        return td;
    }

    function nativeGridValue(text) {
        const td = document.createElement('td');
        const span = document.createElement('span');
        span.textContent = text || '';
        td.appendChild(span);
        return td;
    }

    function nativeGridBool(value) {
        const td = document.createElement('td');
        const span = document.createElement('span');
        if (value === 'YES' || value === 'NO') {
            const img = document.createElement('img');
            img.src = value === 'YES' ? 'images/check_yes.gif' : 'images/check_no.gif';
            img.alt = value;
            span.appendChild(img);
        } else {
            span.textContent = value || '';
        }
        td.appendChild(span);
        return td;
    }

    function nativeGridRow(cells) {
        const tr = document.createElement('tr');
        tr.className = 'rnr-row';
        cells.forEach((cell) => tr.appendChild(cell));
        return tr;
    }

    function nativeGridSpacer() {
        const td = document.createElement('td');
        td.className = 'rnr-gridfieldlabel';
        td.innerHTML = '&nbsp;';
        return td;
    }

    function getRepairPartsFromTab() {
        const root = document.getElementById('detailPreview3');
        if (!root) return [];

        const parts = [];
        const seen = new Set();

        root.querySelectorAll('tbody:not(.gridRowAdd)').forEach((tbody) => {
            const codeEl = tbody.querySelector('[data-fieldname="strProductID"]');
            if (!codeEl) return;

            const code = (codeEl.getAttribute('value') || codeEl.textContent || '').trim();
            if (!code || seen.has(code)) return;
            seen.add(code);

            const unitsInput = tbody.querySelector('[data-fieldname="iUnits"]');
            parts.push({
                code,
                tbody,
                name: tbody.querySelector('[id*="strProductName"]')?.textContent?.trim() || '',
                units: unitsInput?.value || unitsInput?.textContent?.trim() || '',
                avgBuy: tbody.querySelector('[id*="iAverageBuy"]')?.textContent?.trim() || '',
                retailPrice: tbody.querySelector('[id*="iProductRetailPrice"]')?.textContent?.trim() || '',
            });
        });

        return parts;
    }

    function findMatchingOrderForPart(part, orders) {
        const code = String(part.code || '').trim();
        if (!code) return null;
        return orders.find(o => String(o['Κωδικός'] || '').trim() === code) || null;
    }

    function dedupeOrdersByProductCode(orders) {
        const byCode = new Map();
        orders.forEach((order) => {
            const code = String(order['Κωδικός'] || '').trim();
            if (!code) return;
            if (!byCode.has(code)) byCode.set(code, order);
        });
        return [...byCode.values()];
    }

    function clearInjectedOrderRows() {
        document.querySelectorAll('#detailPreview3 .tm-parts-order-row').forEach((row) => row.remove());
        document.querySelectorAll('#detailPreview3 tbody[data-tm-order-injected]').forEach((tbody) => {
            delete tbody.dataset.tmOrderInjected;
        });
    }

    function nativeGridValueColspan(text, colspan) {
        const td = document.createElement('td');
        td.colSpan = colspan;
        const span = document.createElement('span');
        span.textContent = text || '';
        td.appendChild(span);
        return td;
    }

    function nativeGridOrderButton(orderLink) {
        const td = document.createElement('td');
        td.className = 'rnr-edge';
        if (orderLink) {
            const link = document.createElement('a');
            link.className = 'rnr-button';
            link.href = orderLink;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'Παραγγελία';
            td.appendChild(link);
        }
        return td;
    }

    function injectOrderInfoRow(tbody, order) {
        tbody.querySelectorAll('.tm-parts-order-row').forEach((row) => row.remove());

        const orderDate = order['Παραγγελία'] || '';
        const toCentral = order['Παραγγελία σε Κεντρικό'] || '';
        const storeNotes = order['Σημειώσεις Καταστήματος'];
        const centralNotes = order['Σημειώσεις Κεντρικής Αποθήκης'];

        const mainRow = nativeGridRow([
            nativeGridSpacer(),
            nativeGridLabel('Παραγγελία'),
            nativeGridValue(orderDate),
            nativeGridLabel('Σε Κεντρικό'),
            nativeGridBool(toCentral),
            nativeGridLabel(''),
            order._orderLink ? nativeGridOrderButton(order._orderLink) : nativeGridValue(''),
        ]);
        mainRow.classList.add('tm-parts-order-row');
        tbody.appendChild(mainRow);

        if (storeNotes && storeNotes !== '-') {
            const storeRow = nativeGridRow([
                nativeGridSpacer(),
                nativeGridLabel('Σημ. Καταστήματος'),
                nativeGridValueColspan(storeNotes, 5),
            ]);
            storeRow.classList.add('tm-parts-order-row');
            tbody.appendChild(storeRow);
        }

        if (centralNotes && centralNotes !== '-') {
            const centralRow = nativeGridRow([
                nativeGridSpacer(),
                nativeGridLabel('Σημ. Κεντρικής'),
                nativeGridValueColspan(centralNotes, 5),
            ]);
            centralRow.classList.add('tm-parts-order-row');
            tbody.appendChild(centralRow);
        }

        tbody.dataset.tmOrderInjected = '1';
    }

    let partsTabObserver = null;
    let partsTabOrdersLoaded = false;

    async function loadPartsTabOrders(forceRefresh = false) {
        if (!isOrderLinkFeatureEnabled()) return;

        const root = document.getElementById('detailPreview3');

        if (getPageRepairStatus() !== '65') {
            clearInjectedOrderRows();
            document.getElementById('tm-parts-orders-panel')?.remove();
            return;
        }

        if (!root) return;

        const repairId = getPageRepairId();
        if (!repairId) return;

        if (!forceRefresh && partsTabOrdersLoaded && root.querySelector('.tm-parts-order-row')) {
            return;
        }

        try {
            const orders = await fetchOrdersForRepair(repairId);
            partsTabOrdersLoaded = true;
            clearInjectedOrderRows();

            const ordersByCode = dedupeOrdersByProductCode(orders);
            const parts = getRepairPartsFromTab();

            parts.forEach((part) => {
                const order = findMatchingOrderForPart(part, ordersByCode);
                if (order && part.tbody) {
                    injectOrderInfoRow(part.tbody, order);
                }
            });
        } catch (err) {
            console.error('[MMS Order Link] Parts tab order info:', err);
        }
    }

    function setupPartsTabOrderPanel() {
        if (getPageRepairStatus() !== '65') return;

        const tryLoad = () => {
            if (document.getElementById('detailPreview3')) {
                loadPartsTabOrders(false);
            }
        };

        tryLoad();
        scheduleInitTask(tryLoad, 800);
        scheduleInitTask(tryLoad, 2000);
        scheduleInitTask(tryLoad, 4000);

        if (partsTabObserver) {
            partsTabObserver.disconnect();
        }

        partsTabObserver = new MutationObserver(() => {
            if (document.getElementById('detailPreview3') && getPageRepairStatus() === '65') {
                scheduleInitTask(() => loadPartsTabOrders(false), 300);
            }
        });
        partsTabObserver.observe(document.body, { childList: true, subtree: true });

        document.querySelectorAll('.yui-nav a, .rnr-tab a').forEach((tab) => {
            tab.addEventListener('click', () => scheduleInitTask(tryLoad, 500));
        });
    }

    // ── Order page → repair link (sparepartstoorder_edit / srvorders_edit) ─────

    function isOrderEditPage() {
        const path = window.location.pathname || '';
        return (path.includes('sparepartstoorder_edit.php') || path.includes('srvorders_edit.php'))
            && !path.includes('service_edit.php');
    }

    function normalizeRepairIdForCompare(id) {
        return String(id).trim().toUpperCase().replace(/\s/g, '');
    }

    /**
     * Repair ID from order edit header, e.g. "ΠΑΡΑΓΓΕΛΙΑ #ΙΗ-6647 [...]" → "ΙΗ-6647"
     */
    function getRepairIdFromOrderPage() {
        const h1 = document.querySelector('.rnr-b-editheader h1');
        if (h1) {
            const text = h1.textContent || '';
            const hashMatch = text.match(/#\s*([Α-ΩA-ZΙΗ]{2}-\d+)/i);
            if (hashMatch) return hashMatch[1].trim();
            const looseMatch = text.match(/([ΙΗ]{2}-\d+|IH-\d+)/i);
            if (looseMatch) return looseMatch[1].trim();
        }
        const titleMatch = document.title.match(/([ΙΗ]{2}-\d+|IH-\d+|[Α-Ω]{2}-\d+)/i);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    function findRepairRowInDoc(doc, repairId, pageUrl) {
        const target = normalizeRepairIdForCompare(repairId);
        const rows = doc.querySelectorAll('tbody tr[id^="gridRow"]');
        const gridTable = doc.querySelector('table.rnr-b-grid, table.rnr-gridtable, table.hoverable');

        let repairColIndex = -1;
        if (gridTable) {
            const headers = Array.from(gridTable.querySelectorAll('thead th')).map(th => th.innerText.trim());
            repairColIndex = headers.findIndex(h => /^Αρ\.?/i.test(h) || h.includes('Αρ.'));
        }

        const findLink = (row) => {
            if (typeof window.findOrderLink === 'function') {
                return window.findOrderLink(row, pageUrl);
            }
            const href = row.dataset.href || row.querySelector('td[data-href]')?.dataset.href;
            if (href) return new URL(href, pageUrl).href;
            const a = row.querySelector('a[href*="service_edit"]');
            return a ? a.href : null;
        };

        let best = null;
        for (const row of rows) {
            let matches = normalizeRepairIdForCompare(row.innerText).includes(target);
            if (repairColIndex >= 0 && row.cells[repairColIndex]) {
                matches = normalizeRepairIdForCompare(row.cells[repairColIndex].innerText).includes(target);
            }
            if (!matches) continue;

            const link = findLink(row);
            if (link && link.includes('service_edit')) {
                return { row, link };
            }
            if (!best) best = { row, link };
        }

        if (rows.length === 1) {
            const link = findLink(rows[0]);
            if (link) return { row: rows[0], link };
        }

        return best;
    }

    function fetchRepairLinkForOrder(repairId) {
        const searchUrl = `https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=${encodeURIComponent(repairId)}&statusid=all&menuItemId=1`;

        return new Promise((resolve, reject) => {
            const handleHtml = (html, finalUrl) => {
                try {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const found = findRepairRowInDoc(doc, repairId, finalUrl || searchUrl);
                    if (found?.link) {
                        resolve(found.link);
                        return;
                    }
                    reject(new Error('Repair not found in service list'));
                } catch (err) {
                    reject(err);
                }
            };

            if (typeof GM_xmlhttpRequest === 'function') {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: searchUrl,
                    onload(response) {
                        handleHtml(response.responseText, response.finalUrl);
                    },
                    onerror() { reject(new Error('Search request failed')); },
                    ontimeout() { reject(new Error('Search request timed out')); },
                });
            } else {
                fetch(searchUrl)
                    .then(r => r.text())
                    .then(html => handleHtml(html, searchUrl))
                    .catch(reject);
            }
        });
    }

    function getOrderEditButtonHost() {
        return document.querySelector('.rnr-b-editbuttons')
            || document.querySelector('.rnr-b-editheader')
            || document.querySelector('.rnr-top');
    }

    function setRepairFromOrderButtonState(repairId, state, href) {
        let btn = document.getElementById('tm-repair-from-order-btn');
        const host = getOrderEditButtonHost();

        if (!btn) {
            btn = document.createElement(state === 'link' ? 'a' : 'span');
            btn.id = 'tm-repair-from-order-btn';
            btn.className = 'rnr-button main tm-repair-from-order-btn';
            if (host) {
                host.prepend(btn);
            } else {
                document.body.prepend(btn);
            }
        }

        if (state === 'loading') {
            btn.textContent = `🔍 Επισκευή ${repairId}…`;
            btn.title = 'Αναζήτηση επισκευής…';
            btn.removeAttribute('href');
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.75';
            return;
        }

        if (state === 'link' && href) {
            if (btn.tagName !== 'A') {
                const anchor = document.createElement('a');
                anchor.id = 'tm-repair-from-order-btn';
                anchor.className = btn.className;
                btn.replaceWith(anchor);
                btn = anchor;
                host?.prepend(btn);
            }
            btn.href = href;
            btn.target = '_blank';
            btn.rel = 'noopener';
            btn.textContent = `🔧 Επισκευή ${repairId}`;
            btn.title = 'Άνοιγμα επισκευής σε νέα καρτέλα';
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
            return;
        }

        if (state === 'search-fallback' && href) {
            if (btn.tagName !== 'A') {
                const anchor = document.createElement('a');
                anchor.id = 'tm-repair-from-order-btn';
                anchor.className = btn.className;
                btn.replaceWith(anchor);
                btn = anchor;
                host?.prepend(btn);
            }
            btn.href = href;
            btn.target = '_blank';
            btn.rel = 'noopener';
            btn.textContent = `🔍 Αναζήτηση ${repairId}`;
            btn.title = 'Άνοιγμα λίστας επισκευών';
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
        }
    }

    async function createRepairLinkFromOrderPage() {
        if (!isOrderEditPage()) return;
        if (!isOrderLinkFeatureEnabled()) return;

        const repairId = getRepairIdFromOrderPage();
        if (!repairId) {
            console.log('[MMS Order Link] No repair ID in order page header');
            return;
        }

        const existing = document.getElementById('tm-repair-from-order-btn');
        if (existing?.tagName === 'A' && existing.href && !existing.classList.contains('tm-repair-from-order-loading')) {
            return;
        }

        console.log('[MMS Order Link] Order page repair ID:', repairId);
        setRepairFromOrderButtonState(repairId, 'loading');

        const searchListUrl = `https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=${encodeURIComponent(repairId)}&statusid=all&menuItemId=1`;

        try {
            const repairUrl = await fetchRepairLinkForOrder(repairId);
            console.log('[MMS Order Link] Resolved repair URL:', repairUrl);
            setRepairFromOrderButtonState(repairId, 'link', repairUrl);
        } catch (err) {
            console.warn('[MMS Order Link] Could not resolve repair link:', err);
            setRepairFromOrderButtonState(repairId, 'search-fallback', searchListUrl);
        }
    }

    /**
     * Checks if we're on the orders page and should auto-search
     */
    function checkAutoSearch() {
        // Check if we're on the orders list page
        if (!window.location.href.includes('sparepartstoorder_list.php')) {
            return;
        }

        // Check if there's a pending search query
        const searchQuery = sessionStorage.getItem('tm_order_search_query');
        if (searchQuery) {
            console.log('[MMS Order Link] Auto-searching for:', searchQuery);
            
            // Clear the stored query
            sessionStorage.removeItem('tm_order_search_query');
            
            // Try to find and populate the search field
            const searchField = document.querySelector('input[name="ctlSearchFor1"], input[id="ctlSearchFor1"]');
            if (searchField) {
                searchField.value = searchQuery;
                searchField.dispatchEvent(new Event('input', { bubbles: true }));
                searchField.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Try to trigger the search button
                const searchButton = document.querySelector('#searchButtTop1, a.rnr-button[data-icon="search"]');
                if (searchButton) {
                    setTimeout(() => {
                        searchButton.click();
                        console.log('[MMS Order Link] Search triggered');
                    }, 500);
                }
            }
        }
    }

    // Add styles
    GM_addStyle(`
        .tm-repair-from-order-btn {
            margin-right: 8px !important;
            font-weight: 600 !important;
            white-space: nowrap;
        }

        /* Injected order row in parts grid (status 65) */
        #detailPreview3 .tm-parts-order-row td {
            background: #f5f5eb;
        }
    `);

    const initTimeoutIds = [];

    function isOrderLinkFeatureEnabled() {
        const cfg = window.config || {};
        if (cfg.scriptEnabled === false) return false;
        if (cfg.orderLinkEnabled === false) return false;
        return true;
    }

    function clearInitTimers() {
        while (initTimeoutIds.length) {
            clearTimeout(initTimeoutIds.pop());
        }
    }

    function scheduleInitTask(fn, delay) {
        initTimeoutIds.push(setTimeout(fn, delay));
    }

    function teardownOrderLinkUI() {
        clearInitTimers();
        partsTabOrdersLoaded = false;
        clearInjectedOrderRows();
        if (partsTabObserver) {
            partsTabObserver.disconnect();
            partsTabObserver = null;
        }
        document.querySelectorAll('.statusbadge.tm-order-link-active').forEach(badge => {
            const clone = badge.cloneNode(true);
            badge.parentNode?.replaceChild(clone, badge);
        });
        document.getElementById('tm-order-popup')?.remove();
        document.getElementById('tm-repair-from-order-btn')?.remove();
        document.getElementById('tm-parts-orders-panel')?.remove();
    }

    /**
     * Initialize the module
     */
    function init() {
        teardownOrderLinkUI();

        if (!isOrderLinkFeatureEnabled()) {
            console.log('[MMS Order Link] Disabled — skipping init');
            return;
        }

        console.log('[MMS Order Link] ========================================');
        console.log('[MMS Order Link] Module Initializing...');
        console.log('[MMS Order Link] Current URL:', window.location.href);
        console.log('[MMS Order Link] Document ready state:', document.readyState);
        console.log('[MMS Order Link] ========================================');
        
        // Check for auto-search on orders page
        checkAutoSearch();
        
        // Repair edit page — inject order info into parts tab (status 65)
        if (window.location.href.includes('service_edit.php')) {
            console.log('[MMS Order Link] ✓ Detected repair edit page');
            setupPartsTabOrderPanel();
        } else if (isOrderEditPage()) {
            console.log('[MMS Order Link] ✓ Detected order edit page — resolving repair link');
            const tryRepairLink = () => {
                if (!isOrderLinkFeatureEnabled()) return;
                createRepairLinkFromOrderPage();
            };
            tryRepairLink();
            scheduleInitTask(tryRepairLink, 600);
            scheduleInitTask(tryRepairLink, 1500);
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', tryRepairLink, { once: true });
            }
            window.addEventListener('load', () => scheduleInitTask(tryRepairLink, 500), { once: true });
        } else {
            console.log('[MMS Order Link] Not a repair/order edit page, skipping link buttons');
        }
    }

    window.initOrderLinkModule = init;
    window.teardownOrderLinkModule = teardownOrderLinkUI;
    window.getRepairIdFromOrderPage = getRepairIdFromOrderPage;
    window.createRepairLinkFromOrderPage = createRepairLinkFromOrderPage;
    window.fetchOrdersForRepair = fetchOrdersForRepair;
    window.loadPartsTabOrders = loadPartsTabOrders;

})();


