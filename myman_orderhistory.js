// ==UserScript==
// @name         MyManager Order History Feature
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tracks and displays history of accepted orders
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      thefixers.mymanager.gr
// ==/UserScript==

(function() {
    'use strict';

    // Respect user setting: disable entire feature if turned off
    const orderHistoryEnabled = GM_getValue('orderHistoryEnabled', true);
    if (!orderHistoryEnabled) {
        // Do not run any logic if disabled
        return;
    }

    // Optional: status checking (remote fetch) toggle to avoid heavy requests
    // Default ON so deleted/removed orders are detected correctly
    const orderHistoryStatusCheckEnabled = GM_getValue('orderHistoryStatusCheckEnabled', true);
    // Optional: background polling of order pages (even when not currently viewing them)
    const orderHistoryBackgroundEnabled = GM_getValue('orderHistoryBackgroundEnabled', true);
    
    // Detect current path once
    const path = window.location.pathname || '';
    const onOrdersPage = path.includes('srvorders_list.php') || path.includes('sparepartstoorder_list.php');

    // Detect which page we're on and use separate storage for each
    const isServiceOrdersPage = path.includes('srvorders_list.php');
    const isPartsOrdersPage = path.includes('sparepartstoorder_list.php');
    
    // Storage keys for order history (separate for each PAGE, not order type)
    const CURRENT_PAGE_HISTORY_KEY = isServiceOrdersPage 
        ? 'tm_srvorders_page_history' 
        : 'tm_partsorders_page_history';
    
    const MAX_HISTORY_ITEMS = 100; // Keep last 100 orders per page

    // Helper function to extract order URL from a table row
    function extractOrderUrl(row, rowIndex) {
        let orderUrl = window.location.href;
        
        // First, try to get the URL from the row's data-href attribute (parts orders store it on TR)
        let dataHref = row.getAttribute('data-href');
        
        // If not found on row, check cells (service orders store it on TD elements)
        if (!dataHref) {
            const cellWithHref = row.querySelector('td[data-href]');
            if (cellWithHref) {
                dataHref = cellWithHref.getAttribute('data-href');
            }
        }
        
        if (dataHref) {
            // Use window.location.href instead of origin to preserve the /mymanagerservice/ path
            orderUrl = dataHref.startsWith('http') ? dataHref : new URL(dataHref, window.location.href).href;
            console.log(`[Order History] Row ${rowIndex}: Found data-href:`, dataHref, '→', orderUrl);
            return orderUrl;
        }
        
        // Fallback: Try to find a direct link to the order edit or view page (prefer edit)
        const linkEl = row.querySelector('a[href*="_edit"], a[href*="edit.php"], a[href*="srvorders_edit"], a[href*="sparepartstoorder_edit"], a[href*="_view"], a[href*="view.php"], a[href*="srvorders_view"], a[href*="sparepartstoorder_view"]');
        
        if (linkEl) {
            const href = linkEl.getAttribute('href');
            if (href) {
                // Use window.location.href instead of origin to preserve the path
                orderUrl = href.startsWith('http') ? href : new URL(href, window.location.href).href;
                console.log(`[Order History] Row ${rowIndex}: Found link in <a>:`, href, '→', orderUrl);
            } else {
                console.warn(`[Order History] Row ${rowIndex}: Link element found but no href attribute`);
            }
        } else {
            console.warn(`[Order History] Row ${rowIndex}: No data-href or <a> link found`);
        }
        
        return orderUrl;
    }

    // Function to extract Service Order data (srvorders_list.php)
    // Note: Service orders have different structure than parts orders:
    // - data-href is stored on TD cells (not TR)
    // - No "Αρ." (order number) column - extract ID from URL instead
    // - Uses editid1 parameter from srvorders_edit.php?editid1=213842
    function extractServiceOrderData(table) {
        const orders = [];
        const headers = Array.from(table.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        // Find specific column indices for key fields
        const orderNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id') || lower.includes('αριθμός');
        });
        
        const phoneIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
        });
        
        const customerIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα') || lower.includes('ονοματεπώνυμο');
        });
        
        // Additional code column (Κωδικός / Code)
        const codeIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('κωδ') || lower.includes('code');
        });
        
        const repairNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') && (lower.includes('επισκευή') || lower.includes('repair') || lower.includes('εργ') || text.trim() === 'Αρ.');
        });

        const dateIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.startsWith('ημ') || lower.includes('date') || lower === 'ημ.';
        });

        const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        
        rows.forEach((row, index) => {
            if (row.style.display === 'none' || row.offsetParent === null) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            // Extract all columns dynamically
            const allColumns = {};
            headerTexts.forEach((headerText, colIndex) => {
                if (cells[colIndex]) {
                    const cellValue = (cells[colIndex].innerText || cells[colIndex].textContent || '').trim();
                    if (cellValue) {
                        allColumns[headerText] = cellValue;
                    }
                }
            });
            
            // Extract order URL
            const orderUrl = extractOrderUrl(row, index);
            
            // Extract order ID from URL (editid1 parameter) as primary identifier
            let orderNumber = '';
            try {
                const urlObj = new URL(orderUrl);
                orderNumber = urlObj.searchParams.get('editid1') || '';
                if (!orderNumber) {
                    // Try other common parameter names
                    orderNumber = urlObj.searchParams.get('id') || urlObj.searchParams.get('orderid') || '';
                }
            } catch (e) {
                console.warn(`[Order History] Row ${index}: Could not parse URL`, orderUrl);
            }
            
            // Fallback: try to get from order number column if it exists
            if (!orderNumber && orderNumberIndex !== -1 && cells[orderNumberIndex]) {
                orderNumber = (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim();
            }
            
            // Last resort: generate an ID
            if (!orderNumber) {
                orderNumber = `Service-${Date.now()}-${index}`;
            }
            
            const phone = phoneIndex !== -1 && cells[phoneIndex] 
                ? (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim() 
                : '';
            
            const customer = customerIndex !== -1 && cells[customerIndex]
                ? (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim()
                : '';
            
            const repairNumber = repairNumberIndex !== -1 && cells[repairNumberIndex]
                ? (cells[repairNumberIndex].innerText || cells[repairNumberIndex].textContent || '').trim()
                : '';
            
            const codeValue = codeIndex !== -1 && cells[codeIndex]
                ? (cells[codeIndex].innerText || cells[codeIndex].textContent || '').trim()
                : '';
            
            // Build a stronger unique id combining order number and code when present
            const compositeId = orderNumber && codeValue ? `${orderNumber}__${codeValue}` : orderNumber;
            
            if (phone || customer || orderNumber) {
                orders.push({
                    id: compositeId,
                    phone: phone,
                    customer: customer,
                    repairNumber: repairNumber,
                    type: 'Service Order',
                    url: orderUrl,
                    timestamp: Date.now(),
                    date: dateIndex !== -1 && cells[dateIndex] ? (cells[dateIndex].innerText || cells[dateIndex].textContent || '').trim() : '',
                    allColumns: allColumns // Store all columns
                });
            }
        });
        
        return orders;
    }

    // Function to extract Spare Parts Order data (sparepartstoorder_list.php)
    // Note: Parts orders have different structure than service orders:
    // - data-href is stored on TR rows
    // - Has "Αρ." (order number) column
    // - Has "Κωδικός" (code) column
    // - Uses editid1 parameter from sparepartstoorder_edit.php?editid1=1844472
    function extractPartsOrderData(table) {
        const orders = [];
        const headers = Array.from(table.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        // Find specific column indices for key fields
        const orderNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id') || lower.includes('αριθμός');
        });
        
        const phoneIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
        });
        
        const customerIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα') || lower.includes('ονοματεπώνυμο');
        });
        
        // Additional code column (Κωδικός / Code)
        const codeIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('κωδ') || lower.includes('code');
        });

        const dateIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.startsWith('ημ') || lower.includes('date') || lower === 'ημ.';
        });

        const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        
        rows.forEach((row, index) => {
            if (row.style.display === 'none' || row.offsetParent === null) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            // Extract all columns dynamically
            const allColumns = {};
            headerTexts.forEach((headerText, colIndex) => {
                if (cells[colIndex]) {
                    const cellValue = (cells[colIndex].innerText || cells[colIndex].textContent || '').trim();
                    if (cellValue) {
                        allColumns[headerText] = cellValue;
                    }
                }
            });
            
            // Extract order URL
            const orderUrl = extractOrderUrl(row, index);
            
            // Extract order ID from URL (editid1 parameter) as backup identifier
            let urlOrderId = '';
            try {
                const urlObj = new URL(orderUrl);
                urlOrderId = urlObj.searchParams.get('editid1') || '';
                if (!urlOrderId) {
                    urlOrderId = urlObj.searchParams.get('id') || urlObj.searchParams.get('orderid') || '';
                }
            } catch (e) {
                console.warn(`[Order History] Row ${index}: Could not parse URL`, orderUrl);
            }
            
            // Extract key fields for compatibility (parts orders DO have Αρ. column)
            const orderNumber = orderNumberIndex !== -1 && cells[orderNumberIndex]
                ? (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim()
                : (urlOrderId || `Parts-${Date.now()}-${index}`);
            
            const phone = phoneIndex !== -1 && cells[phoneIndex] 
                ? (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim() 
                : '';
            
            const customer = customerIndex !== -1 && cells[customerIndex]
                ? (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim()
                : '';
            
            const codeValue = codeIndex !== -1 && cells[codeIndex]
                ? (cells[codeIndex].innerText || cells[codeIndex].textContent || '').trim()
                : '';
            
            const compositeId = orderNumber && codeValue ? `${orderNumber}__${codeValue}` : orderNumber;
            
            if (phone || customer || orderNumber) {
                orders.push({
                    id: compositeId,
                    phone: phone,
                    customer: customer,
                    type: 'Parts Order',
                    url: orderUrl,
                    code: codeValue,
                    timestamp: Date.now(),
                    date: dateIndex !== -1 && cells[dateIndex] ? (cells[dateIndex].innerText || cells[dateIndex].textContent || '').trim() : '',
                    allColumns: allColumns // Store all columns
                });
            }
        });
        
        return orders;
    }

    // Main function to extract order data from the page
    function extractOrderData() {
        const orders = [];
        
        // Find the main table
        const table = document.querySelector('table.rnr-b-grid, table.rnr-b-table');
        if (!table) {
            console.log('[MMS Order History] No table found on page');
            return orders;
        }

        // Determine which extraction function to use based on URL
        const isServicePage = window.location.pathname.includes('srvorders_list.php');
        const isPartsPage = window.location.pathname.includes('sparepartstoorder_list.php');
        
        if (isServicePage) {
            // srvorders_list.php - use Service Order extraction
            const serviceOrders = extractServiceOrderData(table);
            orders.push(...serviceOrders);
            console.log(`[MMS Order History] Extracted ${serviceOrders.length} orders from srvorders_list.php`);
        } else if (isPartsPage) {
            // sparepartstoorder_list.php - use Parts Order extraction
            const partsOrders = extractPartsOrderData(table);
            orders.push(...partsOrders);
            console.log(`[MMS Order History] Extracted ${partsOrders.length} orders from sparepartstoorder_list.php`);
        } else {
            console.log('[MMS Order History] Unknown page type, using generic extraction');
            // Fallback to generic extraction if page type is unknown
            const headers = Array.from(table.querySelectorAll('thead th'));
            const headerTexts = headers.map(th => th.innerText.trim());
            
            const phoneIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
            });
            
            const customerIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα');
            });
            
            const orderNumberIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id');
            });
            
            const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
            
            rows.forEach((row, index) => {
                if (row.style.display === 'none' || row.offsetParent === null) return;
                const cells = row.querySelectorAll('td');
                if (cells.length === 0) return;
                
                const orderNumber = orderNumberIndex !== -1 && cells[orderNumberIndex]
                    ? (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim()
                    : `Order-${Date.now()}-${index}`;
                
                const phone = phoneIndex !== -1 && cells[phoneIndex] 
                    ? (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim() 
                    : '';
                
                const customer = customerIndex !== -1 && cells[customerIndex]
                    ? (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim()
                    : '';
                
                if (phone || customer || orderNumber) {
                    orders.push({
                        id: orderNumber,
                        phone: phone,
                        customer: customer,
                        date: new Date().toLocaleDateString('el-GR'),
                        description: '',
                        type: 'Order',
                        url: window.location.href,
                        timestamp: Date.now()
                    });
                }
            });
        }
        
        return orders;
    }

    // Helper function to normalize strings for comparison
    function normalizeString(str) {
        if (!str) return '';
        return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    }
    
    // Helper function to normalize phone numbers (extract only digits)
    function normalizePhone(phone) {
        if (!phone) return '';
        return phone.toString().replace(/[^0-9]/g, '');
    }
    
    // Helper function to check if two orders are duplicates
    function isDuplicateOrder(existing, newOrder) {
        // Normalize data for comparison
        const normalize = (str) => normalizeString(str);
        const normalizePhoneNum = (str) => normalizePhone(str);
        
        // 1. Exact order ID match (primary check) - must be exact match
        if (existing.id && newOrder.id) {
            const existingId = normalize(existing.id);
            const newOrderId = normalize(newOrder.id);
            
            // If both have real IDs (not generated), check exact match
            if (existingId && newOrderId && 
                !existingId.startsWith('service-') && !existingId.startsWith('parts-') && 
                !newOrderId.startsWith('service-') && !newOrderId.startsWith('parts-')) {
                if (existingId === newOrderId) {
                    return true;
                }
            }
        }
        
        // If repair numbers exist for both, allow multiple orders under same repair number (do not dedupe)
        if (existing.repairNumber && newOrder.repairNumber) {
            // Only exact ID match (handled above) would be considered duplicate; otherwise keep both
            return false;
        }
        
        // 2. Phone + Customer + Timestamp (broaden window to kill dupes)
        if (existing.phone && newOrder.phone && 
            existing.customer && newOrder.customer) {
            
            const existingPhone = normalizePhoneNum(existing.phone);
            const newOrderPhone = normalizePhoneNum(newOrder.phone);
            const existingCustomer = normalize(existing.customer);
            const newOrderCustomer = normalize(newOrder.customer);
            
            // Phone numbers must match exactly (at least 6 digits)
            const phoneMatch = existingPhone.length >= 6 && newOrderPhone.length >= 6 && 
                             existingPhone === newOrderPhone;
            
            // Customer names must match exactly (no partial matches)
            const customerMatch = existingCustomer === newOrderCustomer;
            
            if (phoneMatch && customerMatch) {
                // If timestamps are close (<= 24h) OR one is missing, treat as duplicate
                const timeDiff = Math.abs((existing.timestamp || 0) - (newOrder.timestamp || 0));
                if (!existing.timestamp || !newOrder.timestamp || timeDiff <= 24 * 60 * 60 * 1000) {
                    return true;
                }
            }
        }
        
        // 3. Phone + Customer + Type + Date (exact date match)
        if (existing.phone && newOrder.phone && 
            existing.customer && newOrder.customer &&
            existing.type === newOrder.type &&
            existing.date && newOrder.date) {
            
            const existingPhone = normalizePhoneNum(existing.phone);
            const newOrderPhone = normalizePhoneNum(newOrder.phone);
            const existingCustomer = normalize(existing.customer);
            const newOrderCustomer = normalize(newOrder.customer);
            const existingDate = normalize(existing.date);
            const newOrderDate = normalize(newOrder.date);
            
            const phoneMatch = existingPhone.length >= 6 && newOrderPhone.length >= 6 && 
                             existingPhone === newOrderPhone;
            const customerMatch = existingCustomer === newOrderCustomer;
            const dateMatch = existingDate === newOrderDate;
            
            if (phoneMatch && customerMatch && dateMatch) {
                return true;
            }
        }
        
        // 4. Check allColumns for key matching fields (if both have allColumns)
        if (existing.allColumns && newOrder.allColumns) {
            // Get all column names that exist in both
            const commonColumns = Object.keys(existing.allColumns).filter(col => 
                newOrder.allColumns.hasOwnProperty(col)
            );
            
            // If we have at least 3 matching columns with same values, it's likely a duplicate
            let matchingColumns = 0;
            const requiredColumns = ['Αρ.', 'Αριθμός', 'Phone', 'Τηλέφωνο', 'Customer', 'Πελάτης'];
            
            for (const col of commonColumns) {
                const existingVal = normalize(String(existing.allColumns[col] || ''));
                const newOrderVal = normalize(String(newOrder.allColumns[col] || ''));
                
                if (existingVal && newOrderVal && existingVal === newOrderVal) {
                    matchingColumns++;
                    // If it's a required column, it must match
                    if (requiredColumns.some(req => col.toLowerCase().includes(req.toLowerCase()))) {
                        if (existingVal !== newOrderVal) {
                            return false; // Required column doesn't match, not a duplicate
                        }
                    }
                }
            }
            
            // If we have phone + customer match in allColumns and at least 2 other columns match
            const hasPhoneMatch = commonColumns.some(col => {
                const lower = col.toLowerCase();
                return (lower.includes('phone') || lower.includes('τηλέφωνο')) &&
                       normalize(String(existing.allColumns[col])) === normalize(String(newOrder.allColumns[col]));
            });
            
            const hasCustomerMatch = commonColumns.some(col => {
                const lower = col.toLowerCase();
                return (lower.includes('customer') || lower.includes('πελάτης') || lower.includes('όνομα')) &&
                       normalize(String(existing.allColumns[col])) === normalize(String(newOrder.allColumns[col]));
            });
            
            if (hasPhoneMatch && hasCustomerMatch && matchingColumns >= 3) {
                return true;
            }
        }
        
        return false;
    }

    // Function to save orders to history (page-specific storage)
    function saveOrdersToHistory(newOrders) {
        if (!newOrders || newOrders.length === 0) return;
        
        let pageHistory = JSON.parse(GM_getValue(CURRENT_PAGE_HISTORY_KEY, '[]'));
        let addedCount = 0;
        let duplicateCount = 0;
        
        newOrders.forEach(newOrder => {
            const exists = pageHistory.some(existing => isDuplicateOrder(existing, newOrder));
            
            if (!exists) {
                pageHistory.unshift(newOrder);
                addedCount++;
            } else {
                duplicateCount++;
            }
        });
        
        if (pageHistory.length > MAX_HISTORY_ITEMS) {
            pageHistory = pageHistory.slice(0, MAX_HISTORY_ITEMS);
        }
        
        GM_setValue(CURRENT_PAGE_HISTORY_KEY, JSON.stringify(pageHistory));
        const pageType = isServiceOrdersPage ? 'Service Orders' : 'Parts Orders';
        console.log(`[MMS Order History] ${pageType}: ${addedCount} added, ${duplicateCount} duplicates skipped. Total: ${pageHistory.length}`);
    }

    // Function to monitor page for order acceptance
    function monitorOrderAcceptance() {
        // Check if we're on an order list page
        const isOrderListPage = window.location.pathname.includes('srvorders_list.php') || 
                                window.location.pathname.includes('sparepartstoorder_list.php');
        
        if (!isOrderListPage) return;
        
        let lastSavedOrders = [];
        let saveTimeout = null;
        
        // Function to save current orders
        const saveCurrentOrders = () => {
            const currentOrders = extractOrderData();
            if (currentOrders.length > 0) {
                // Only save if orders changed
                const ordersChanged = JSON.stringify(currentOrders) !== JSON.stringify(lastSavedOrders);
                if (ordersChanged) {
                    saveOrdersToHistory(currentOrders);
                    lastSavedOrders = currentOrders;
                }
            }
        };
        
        // Extract and save current orders on page load
        setTimeout(saveCurrentOrders, 1000);
        
        // Monitor for accept buttons/clicks
        const setupAcceptButtonListeners = () => {
            const acceptButtons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [onclick*="accept"], [onclick*="Accept"]');
            acceptButtons.forEach(btn => {
                const btnText = (btn.innerText || btn.textContent || btn.value || btn.title || '').toLowerCase();
                const btnOnClick = btn.getAttribute('onclick') || '';
                
                if (btnText.includes('accept') || btnText.includes('αποδοχή') || 
                    btnText.includes('ok') || btnText.includes('yes') ||
                    btnOnClick.toLowerCase().includes('accept')) {
                    
                    // Save orders before clicking
                    btn.addEventListener('click', (e) => {
                        // Save immediately before action
                        saveCurrentOrders();
                        
                        // Also save after a delay in case order is removed from DOM
                        setTimeout(saveCurrentOrders, 500);
                        setTimeout(saveCurrentOrders, 1000);
                    }, { capture: true });
                }
            });
        };
        
        setupAcceptButtonListeners();
        
        // Monitor for DOM changes (orders being removed after acceptance)
        const observer = new MutationObserver((mutations) => {
            let shouldSave = false;
            
            mutations.forEach(mutation => {
                if (mutation.removedNodes.length > 0) {
                    // Check if any table rows were removed
                    mutation.removedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'TR' || node.querySelector && node.querySelector('tr')) {
                                shouldSave = true;
                            }
                        }
                    });
                }
                
                if (mutation.addedNodes.length > 0) {
                    // New buttons might have been added
                    setupAcceptButtonListeners();
                }
            });
            
            if (shouldSave) {
                // Debounce saves
                if (saveTimeout) clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveCurrentOrders();
                }, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also periodically save orders (in case we miss the acceptance)
        const periodicSave = setInterval(() => {
            saveCurrentOrders();
        }, 5000); // Every 5 seconds
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            saveCurrentOrders();
            observer.disconnect();
            clearInterval(periodicSave);
        });
    }

    // Function to remove duplicates from existing history
    function removeDuplicatesFromHistory() {
        // Clean current page's history
        let pageHistory = JSON.parse(GM_getValue(CURRENT_PAGE_HISTORY_KEY, '[]'));
        const cleaned = [];
        
        pageHistory.forEach(order => {
            // Check if this order is a duplicate of any already in cleaned using improved logic
            const isDuplicate = cleaned.some(existing => isDuplicateOrder(existing, order));
            if (!isDuplicate) {
                cleaned.push(order);
            }
        });
        
        if (cleaned.length !== pageHistory.length) {
            GM_setValue(CURRENT_PAGE_HISTORY_KEY, JSON.stringify(cleaned));
            const pageType = isServiceOrdersPage ? 'service orders' : 'parts orders';
            console.log(`[MMS Order History] Removed ${pageHistory.length - cleaned.length} duplicate ${pageType}`);
        }
    }

    // Save orders to a specific history bucket (used by background fetcher)
    function saveOrdersToSpecificHistory(newOrders, historyKey, pageLabel) {
        if (!newOrders || newOrders.length === 0) return;
        
        let pageHistory;
        try {
            pageHistory = JSON.parse(GM_getValue(historyKey, '[]'));
        } catch (e) {
            pageHistory = [];
        }
        
        let addedCount = 0;
        let duplicateCount = 0;
        
        newOrders.forEach(newOrder => {
            const exists = pageHistory.some(existing => isDuplicateOrder(existing, newOrder));
            if (!exists) {
                pageHistory.unshift(newOrder);
                addedCount++;
            } else {
                duplicateCount++;
            }
        });
        
        if (pageHistory.length > MAX_HISTORY_ITEMS) {
            pageHistory = pageHistory.slice(0, MAX_HISTORY_ITEMS);
        }
        
        GM_setValue(historyKey, JSON.stringify(pageHistory));
        console.log(`[MMS Order History] [Background] ${pageLabel}: ${addedCount} added, ${duplicateCount} duplicates skipped. Total: ${pageHistory.length}`);
    }

    // Process fetched HTML from an orders list page and merge into history
    function processOrderListHtml(htmlText, pageType) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // Use same selectors as live page extraction
            const table = doc.querySelector('table.rnr-b-grid, table.rnr-b-table');
            if (!table) {
                console.warn('[MMS Order History] [Background] No grid table found for pageType:', pageType);
                return;
            }
            
            let orders = [];
            if (pageType === 'service') {
                orders = extractServiceOrderData(table);
            } else if (pageType === 'parts') {
                orders = extractPartsOrderData(table);
            }
            
            if (!orders || orders.length === 0) return;
            
            const historyKey = (pageType === 'service')
                ? 'tm_srvorders_page_history'
                : 'tm_partsorders_page_history';
            const label = (pageType === 'service') ? 'Service Orders' : 'Parts Orders';
            
            saveOrdersToSpecificHistory(orders, historyKey, label);
        } catch (e) {
            console.error('[MMS Order History] [Background] Error processing order list HTML for', pageType, e);
        }
    }

    // Perform one background fetch cycle for both order list pages
    function runOrderHistoryBackgroundFetch() {
        if (!orderHistoryBackgroundEnabled) return;
        
        const origin = window.location.origin || '';
        // Use the canonical /mymanagerservice/ path for list pages
        const base = origin + '/mymanagerservice/';
        
        const targets = [
            { url: base + 'srvorders_list.php', pageType: 'service' },
            { url: base + 'sparepartstoorder_list.php', pageType: 'parts' }
        ];
        
        targets.forEach(target => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: target.url,
                onload: (resp) => {
                    if (!resp.responseText) return;
                    processOrderListHtml(resp.responseText, target.pageType);
                },
                onerror: (err) => {
                    console.error('[MMS Order History] [Background] Fetch failed for', target.url, err);
                }
            });
        });
    }

    // Initialize periodic background fetching, once per browser session
    function initOrderHistoryBackgroundFetcher() {
        if (!orderHistoryBackgroundEnabled) return;
        
        // Prevent multiple timers if script is injected multiple times
        if (window._mmsOrderHistoryBackgroundStarted) return;
        window._mmsOrderHistoryBackgroundStarted = true;
        
        const INTERVAL_MINUTES = 15;
        const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;
        
        // Small random delay to avoid hammering server at exact same second
        const jitter = Math.random() * 60000;
        
        setTimeout(() => {
            // Run once immediately after jitter
            runOrderHistoryBackgroundFetch();
            // Then on interval
            setInterval(runOrderHistoryBackgroundFetch, INTERVAL_MS);
        }, jitter);
    }

    // Function to format date for grouping
    function formatDateForGroup(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    // Function to format timestamp to readable date/time
    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('el-GR', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Helper function to check order in a table
    function checkOrderInTable(table, order) {
        if (!table) {
            console.log(`[MMS Order History] ⚠️ No table provided for order ${order.id}`);
            return { exists: false, matchMethod: 'No table found' };
        }
        
        // Get headers to find columns (same logic as extractOrderData)
        const headers = Array.from(table.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        if (headerTexts.length === 0) {
            console.log(`[MMS Order History] ⚠️ No headers found in table for order ${order.id}`);
            return { exists: false, matchMethod: 'No table headers found' };
        }
        
        const orderNumberIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('αρ.') || lower.includes('number') || lower.includes('no') || lower.includes('id') || lower.includes('αριθμός');
        });
        
        const phoneIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τηλέφωνο') || lower.includes('phone') || lower.includes('tel');
        });
        
        const customerIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('πελάτης') || lower.includes('customer') || lower.includes('όνομα') || lower.includes('ονοματεπώνυμο');
        });
        
        console.log(`[MMS Order History] Checking order ${order.id} (${order.type}):`, {
            headerCount: headerTexts.length,
            headers: headerTexts,
            orderNumberIndex,
            phoneIndex,
            customerIndex,
            orderId: order.id,
            phone: order.phone,
            customer: order.customer
        });
        
        // Get all rows
        const rows = table.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        console.log(`[MMS Order History] Found ${rows.length} rows in table`);
        
        if (rows.length === 0) {
            console.log(`[MMS Order History] ⚠️ No rows found in table for order ${order.id}`);
            return { exists: false, matchMethod: 'No rows found in table' };
        }
        
        let exists = false;
        let matchMethod = '';
        
        // Helper function to normalize strings for comparison
        const normalize = (str) => {
            if (!str) return '';
            return String(str).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
        };
        
        const normalizePhone = (str) => {
            if (!str) return '';
            return String(str).replace(/[^0-9]/g, '').trim();
        };
        
        const normalizeName = (str) => {
            if (!str) return '';
            return String(str).toLowerCase().trim().replace(/\s+/g, ' ');
        };
        
        rows.forEach((row, rowIndex) => {
            if (exists) return; // Already found, skip remaining rows
            
            if (row.style.display === 'none' || row.offsetParent === null) return;
            
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length === 0) return;
            
            // Primary check: Order ID (try exact match first, then normalized)
            if (orderNumberIndex !== -1 && cells[orderNumberIndex]) {
                const cellText = (cells[orderNumberIndex].innerText || cells[orderNumberIndex].textContent || '').trim();
                const orderIdClean = String(order.id || '').trim();
                const cellTextClean = cellText.trim();
                
                if (cellTextClean && orderIdClean) {
                    // Exact match
                    if (cellTextClean === orderIdClean) {
                        exists = true;
                        matchMethod = `Order ID exact match in row ${rowIndex}: "${cellTextClean}"`;
                        console.log(`[MMS Order History] ✅ ${matchMethod}`);
                        return;
                    }
                    
                    // Normalized match
                    const normalizedOrderId = normalize(orderIdClean);
                    const normalizedCellText = normalize(cellTextClean);
                    
                    if (normalizedOrderId && normalizedCellText && 
                        (normalizedCellText === normalizedOrderId ||
                         normalizedCellText.includes(normalizedOrderId) ||
                         normalizedOrderId.includes(normalizedCellText))) {
                        exists = true;
                        matchMethod = `Order ID normalized match in row ${rowIndex}: "${cellTextClean}" (normalized: "${normalizedCellText}")`;
                        console.log(`[MMS Order History] ✅ ${matchMethod}`);
                        return;
                    }
                }
            }
            
            // Fallback check: Phone + Customer combination (more reliable)
            if (order.phone && order.customer && !exists) {
                let phoneMatch = false;
                let customerMatch = false;
                
                if (phoneIndex !== -1 && cells[phoneIndex]) {
                    const cellPhone = (cells[phoneIndex].innerText || cells[phoneIndex].textContent || '').trim();
                    const normalizedOrderPhone = normalizePhone(order.phone);
                    const normalizedCellPhone = normalizePhone(cellPhone);
                    
                    if (normalizedOrderPhone && normalizedCellPhone) {
                        if (normalizedCellPhone === normalizedOrderPhone ||
                            normalizedCellPhone.includes(normalizedOrderPhone) ||
                            normalizedOrderPhone.includes(normalizedCellPhone)) {
                            phoneMatch = true;
                        }
                    }
                }
                
                if (customerIndex !== -1 && cells[customerIndex]) {
                    const cellCustomer = (cells[customerIndex].innerText || cells[customerIndex].textContent || '').trim();
                    const normalizedOrderCustomer = normalizeName(order.customer);
                    const normalizedCellCustomer = normalizeName(cellCustomer);
                    
                    if (normalizedOrderCustomer && normalizedCellCustomer) {
                        if (normalizedCellCustomer === normalizedOrderCustomer ||
                            normalizedCellCustomer.includes(normalizedOrderCustomer) ||
                            normalizedOrderCustomer.includes(normalizedCellCustomer)) {
                            customerMatch = true;
                        }
                    }
                }
                
                // If both phone and customer match, it's the same order
                if (phoneMatch && customerMatch) {
                    exists = true;
                    matchMethod = `Phone+Customer match in row ${rowIndex}`;
                    console.log(`[MMS Order History] ✅ ${matchMethod}`);
                    return;
                }
            }
            
            // URL-based check: Extract order ID from data-href
            // This is CRITICAL for service orders because:
            // - Service orders have NO "Αρ." column in the table
            // - Some orders have NO phone number (e.g., customer "ΒΡΙΛΗΣΣΙΑ" with blank phone)
            // - The only way to match them is by extracting editid1 from the URL
            if (!exists && order.id) {
                // Check row's data-href attribute (parts orders)
                let rowHref = row.getAttribute('data-href');
                
                // If not on row, check cells (service orders store it on TD elements)
                if (!rowHref) {
                    const cellWithHref = row.querySelector('td[data-href]');
                    if (cellWithHref) {
                        rowHref = cellWithHref.getAttribute('data-href');
                    }
                }
                
                if (rowHref) {
                    try {
                        // Extract editid1 parameter from URL
                        const urlObj = new URL(rowHref, window.location.href);
                        const editId = urlObj.searchParams.get('editid1') || 
                                      urlObj.searchParams.get('id') || 
                                      urlObj.searchParams.get('orderid');
                        
                        if (editId) {
                            const orderIdClean = String(order.id).trim();
                            const editIdClean = String(editId).trim();
                            
                            // Check if order ID matches editid1 or contains it (for composite IDs like "237137__CODE")
                            if (orderIdClean === editIdClean || 
                                orderIdClean.startsWith(editIdClean + '__') ||
                                orderIdClean === editIdClean) {
                                exists = true;
                                matchMethod = `URL editid1 match in row ${rowIndex}: "${editIdClean}" from "${rowHref}"`;
                                console.log(`[MMS Order History] ✅ ${matchMethod}`);
                                return;
                            }
                        }
                    } catch (e) {
                        // Invalid URL, skip
                    }
                }
            }
            
            // Last resort: check all cells for order ID (scan entire row)
            if (!exists && order.id) {
                cells.forEach((cell, cellIndex) => {
                    if (exists) return;
                    
                    const text = (cell.innerText || cell.textContent || '').trim();
                    if (!text) return;
                    
                    const orderIdClean = String(order.id).trim();
                    const normalizedText = normalize(text);
                    const normalizedOrderId = normalize(orderIdClean);
                    
                    if (normalizedOrderId && normalizedText && 
                        (text === orderIdClean ||
                         text.includes(orderIdClean) ||
                         orderIdClean.includes(text) ||
                         normalizedText === normalizedOrderId ||
                         normalizedText.includes(normalizedOrderId) ||
                         normalizedOrderId.includes(normalizedText))) {
                        exists = true;
                        matchMethod = `Found order ID in cell ${cellIndex} of row ${rowIndex}: "${text}"`;
                        console.log(`[MMS Order History] ✅ ${matchMethod}`);
                    }
                });
            }
        });
        
        if (!exists) {
            console.log(`[MMS Order History] ❌ Order ${order.id} not found in table after checking ${rows.length} rows`);
        }
        
        return { exists, matchMethod: matchMethod || 'Not found' };
    }

    // Function to check if order still exists in system
    async function checkOrderStatus(order) {
        const cacheKey = `order_status_${order.id}_${order.type}`;
        const now = Date.now();
        
        // First, ALWAYS check the current page if we're on the order list page
        // This takes priority over cache to ensure accuracy when viewing the page
        const currentPath = window.location.pathname;
        const isServicePage = currentPath.includes('srvorders_list.php');
        const isPartsPage = currentPath.includes('sparepartstoorder_list.php');

        // Determine which list page this order belongs to using its stored URL as primary signal.
        // Falls back to type name to handle entries saved before the type label fix.
        const storedUrl = order.url || '';
        const isOrderFromServicePage = storedUrl.includes('srvorders') || order.type === 'Product Order' ||
            (order.type === 'Service Order' && !storedUrl.includes('sparepartstoorder'));
        const isOrderFromPartsPage = storedUrl.includes('sparepartstoorder') || order.type === 'Parts Order' ||
            (order.type === 'Service Order' && storedUrl.includes('sparepartstoorder'));

        if ((isOrderFromServicePage && isServicePage) || 
            (isOrderFromPartsPage && isPartsPage)) {
            const currentTable = document.querySelector('table.rnr-b-grid, table.rnr-b-table');
            if (currentTable) {
                console.log(`[MMS Order History] Checking order ${order.id} on current page (priority check)`);
                const result = checkOrderInTable(currentTable, order);
                const statusResult = { 
                    exists: result.exists, 
                    checking: false, 
                    matchMethod: result.matchMethod,
                    fromCurrentPage: true // Flag to indicate this came from current page
                };
                // Always update cache with current page result
                GM_setValue(cacheKey, { status: statusResult, timestamp: now });
                
                if (result.exists) {
                    console.log(`[MMS Order History] ✅ Order ${order.id} (${order.type}) found on current page - ${result.matchMethod}`);
                } else {
                    console.log(`[MMS Order History] ❌ Order ${order.id} (${order.type}) not found on current page`);
                }
                
                // If found on current page, return immediately (don't fetch)
                // If not found, continue to fetch (might be on a different page/filter)
                if (result.exists) {
                    return statusResult;
                }
                // If not found on current page, continue to fetch below
            }
        }
        
        // Check cache only if we're NOT on the order page
        const cached = GM_getValue(cacheKey, null);
        const cacheTime = cached ? cached.timestamp : 0;
        
        // Use cached result if less than 5 minutes old AND not from current page
        if (cached && (now - cacheTime < 300000) && !cached.status.fromCurrentPage) {
            return cached.status;
        }
        
        // If status checking is disabled, return without remote fetch
        if (!orderHistoryStatusCheckEnabled) {
            const result = { exists: null, checking: false, skipped: true };
            GM_setValue(cacheKey, { status: result, timestamp: now });
            return result;
        }
        
        // Default to checking (will be updated asynchronously)
        const status = { exists: null, checking: true };
        GM_setValue(cacheKey, { status, timestamp: now });
        
        // Otherwise, fetch the order list page.
        // Use the stored URL as the primary signal; type name is a fallback for old stored entries.
        const fetchStoredUrl = order.url || '';
        const fetchFromServicePage =
            fetchStoredUrl.includes('srvorders') ||
            order.type === 'Product Order' ||  // old label for service orders
            (order.type === 'Service Order' && !fetchStoredUrl.includes('sparepartstoorder'));
        const url = fetchFromServicePage
            ? 'https://thefixers.mymanager.gr/mymanagerservice/srvorders_list.php?pagesize=10000'
            : 'https://thefixers.mymanager.gr/mymanagerservice/sparepartstoorder_list.php?pagesize=10000';
        
        // Store fetch start time to compare with cache later
        const fetchStartTime = Date.now();
        
        return new Promise((resolve) => {
            console.log(`[MMS Order History] Fetching ${url} to check order ${order.id} (${order.type})`);
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    if (!response.responseText) {
                        console.error(`[MMS Order History] ⚠️ Empty response for order ${order.id}`);
                        const result = { exists: false, checking: false, error: true, matchMethod: 'Empty response' };
                        GM_setValue(cacheKey, { status: result, timestamp: now });
                        resolve(result);
                        return;
                    }
                    
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    
                    // Try multiple table selectors
                    const table = doc.querySelector('table.rnr-b-grid, table.rnr-b-table, table.rnr-gridtable, table[class*="grid"]');
                    
                    if (!table) {
                        console.error(`[MMS Order History] ⚠️ No table found in fetched page for order ${order.id}`);
                        console.log(`[MMS Order History] Response length: ${response.responseText.length}`);
                        console.log(`[MMS Order History] Available tables:`, doc.querySelectorAll('table').length);
                        const result = { exists: false, checking: false, error: true, matchMethod: 'No table found in response' };
                        GM_setValue(cacheKey, { status: result, timestamp: now });
                        resolve(result);
                        return;
                    }
                    
                    console.log(`[MMS Order History] Table found, checking order ${order.id}...`);
                    const result = checkOrderInTable(table, order);
                    
                    // Check if we have a more recent "Active" result from current page (within last 10 seconds)
                    const fetchEndTime = Date.now();
                    const latestCache = GM_getValue(cacheKey, null);
                    if (latestCache && latestCache.status && latestCache.status.fromCurrentPage && latestCache.status.exists) {
                        const timeSinceCurrentPageCheck = fetchEndTime - latestCache.timestamp;
                        // If current page check happened after fetch started, trust it more
                        if (latestCache.timestamp > fetchStartTime && timeSinceCurrentPageCheck < 10000) {
                            // Don't overwrite a recent "Active" result from current page
                            console.log(`[MMS Order History] ⚠️ Keeping current page "Active" result for order ${order.id} (checked ${timeSinceCurrentPageCheck}ms ago), not overwriting with fetch result`);
                            resolve(latestCache.status);
                            return;
                        }
                    }
                    
                    const statusResult = { 
                        exists: result.exists, 
                        checking: false, 
                        matchMethod: result.matchMethod,
                        error: false,
                        fromCurrentPage: false
                    };
                    GM_setValue(cacheKey, { status: statusResult, timestamp: now });
                    
                    if (result.exists) {
                        console.log(`[MMS Order History] ✅ Order ${order.id} (${order.type}) FOUND - ${result.matchMethod}`);
                    } else {
                        console.log(`[MMS Order History] ❌ Order ${order.id} (${order.type}) NOT FOUND - ${result.matchMethod}`);
                    }
                    
                    resolve(statusResult);
                },
                onerror: function(error) {
                    console.error(`[MMS Order History] ⚠️ Error fetching order list for ${order.id}:`, error);
                    const result = { exists: false, checking: false, error: true, matchMethod: 'Network error' };
                    GM_setValue(cacheKey, { status: result, timestamp: now });
                    resolve(result);
                }
            });
        });
    }

    // Function to batch check order statuses
    async function checkOrdersStatus(orders) {
        const statusPromises = orders.map(order => checkOrderStatus(order));
        return Promise.all(statusPromises);
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatPhoneDisplay(raw) {
        const trimmed = String(raw || '').trim();
        if (!trimmed) return '';
        const digits = trimmed.replace(/\D/g, '');
        if (!digits) return trimmed;
        let local = digits;
        if (local.startsWith('0030')) local = local.slice(4);
        else if (local.startsWith('30') && local.length >= 12) local = local.slice(2);
        if (local.length === 10) {
            return `${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;
        }
        if (local.length === 9 && local.startsWith('6')) {
            const padded = `0${local}`;
            return `${padded.slice(0, 3)} ${padded.slice(3, 7)} ${padded.slice(7)}`;
        }
        return trimmed;
    }

    function ensureOrderHistoryStyles() {
        if (document.getElementById('tm-order-history-ui-styles')) return;
        const style = document.createElement('style');
        style.id = 'tm-order-history-ui-styles';
        style.textContent = `
            .tm-oh-overlay {
                background: var(--tm-overlay-dim, rgba(0,0,0,0.72)) !important;
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                z-index: 10050 !important;
            }
            .tm-oh-shell {
                width: min(96vw, 1480px) !important;
                max-width: 1480px !important;
                height: 94vh !important;
                padding: 0 !important;
                border-radius: 18px !important;
                overflow: hidden !important;
                border: 1px solid var(--tm-shop-item-border) !important;
                box-shadow: 0 28px 80px var(--tm-shadow-color, rgba(0,0,0,0.45)) !important;
                background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
                color: var(--tm-primary-color) !important;
                display: flex !important;
                flex-direction: column !important;
            }
            .tm-oh-hero {
                padding: 20px 24px 16px;
                background: linear-gradient(135deg, color-mix(in srgb, var(--tm-primary-color) 18%, transparent) 0%, transparent 70%);
                border-bottom: 1px solid var(--tm-shop-item-border);
                flex-shrink: 0;
            }
            .tm-oh-hero-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 16px;
            }
            .tm-oh-title-wrap { min-width: 0; }
            .tm-oh-title {
                margin: 0;
                font-size: 1.35rem;
                font-weight: 800;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                letter-spacing: 0.01em;
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .tm-oh-page-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                background: color-mix(in srgb, var(--tm-info-color) 16%, transparent);
                color: var(--tm-info-color);
                border: 1px solid color-mix(in srgb, var(--tm-info-color) 35%, transparent);
            }
            .tm-oh-subtitle {
                margin: 6px 0 0;
                font-size: 12px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
            }
            .tm-oh-hero-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            .tm-oh-close {
                width: 38px;
                height: 38px;
                border-radius: 10px;
                border: 1px solid var(--tm-shop-item-border);
                background: var(--tm-input-bg, var(--tm-shop-item-bg));
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                font-size: 22px;
                line-height: 1;
                cursor: pointer;
                transition: background 0.15s, transform 0.15s, border-color 0.15s;
            }
            .tm-oh-close:hover {
                background: color-mix(in srgb, var(--tm-danger-color) 16%, transparent);
                border-color: color-mix(in srgb, var(--tm-danger-color) 40%, transparent);
                transform: scale(1.04);
            }
            .tm-oh-stats-row {
                display: flex;
                align-items: stretch;
                gap: 10px;
                flex-wrap: wrap;
            }
            .tm-oh-stat {
                min-width: 88px;
                padding: 10px 14px;
                border-radius: 12px;
                background: var(--tm-chip-bg, var(--tm-shop-item-hover-bg));
                border: 1px solid var(--tm-chip-border, var(--tm-shop-item-border));
            }
            .tm-oh-stat-value {
                display: block;
                font-size: 1.35rem;
                font-weight: 800;
                color: var(--tm-accent-color, var(--tm-info-color));
                line-height: 1.1;
            }
            .tm-oh-stat-label {
                display: block;
                margin-top: 2px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--tm-muted-text, var(--tm-secondary-color));
            }
            .tm-oh-toolbar {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: auto;
                flex-wrap: wrap;
            }
            .tm-oh-tool-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 10px;
                border: 1px solid var(--tm-shop-item-border);
                background: var(--tm-input-bg, var(--tm-shop-item-bg));
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s, border-color 0.15s, transform 0.12s;
                white-space: nowrap;
            }
            .tm-oh-tool-btn:hover:not(:disabled) {
                background: var(--tm-shop-item-hover-bg);
                border-color: var(--tm-primary-color);
                transform: translateY(-1px);
            }
            .tm-oh-tool-btn:disabled { opacity: 0.55; cursor: wait; }
            .tm-oh-tool-btn--danger:hover:not(:disabled) {
                background: color-mix(in srgb, var(--tm-danger-color) 14%, transparent);
                border-color: color-mix(in srgb, var(--tm-danger-color) 40%, transparent);
            }
            .tm-oh-filters {
                padding: 14px 24px;
                border-bottom: 1px solid var(--tm-shop-item-border);
                background: var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg));
                flex-shrink: 0;
            }
            .tm-oh-filters-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
            }
            .tm-oh-search-wrap {
                position: relative;
                flex: 1 1 220px;
                min-width: 180px;
            }
            .tm-oh-search-wrap::before {
                content: '🔍';
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 13px;
                opacity: 0.55;
                pointer-events: none;
            }
            .tm-oh-input, .tm-oh-select {
                width: 100%;
                box-sizing: border-box;
                border-radius: 10px;
                border: 1px solid var(--tm-input-border, var(--tm-shop-item-border));
                background: var(--tm-input-bg, var(--tm-shop-item-bg));
                color: var(--tm-input-text, var(--tm-shop-item-text, var(--tm-primary-color)));
                font-size: 13px;
                transition: border-color 0.15s, box-shadow 0.15s;
            }
            .tm-oh-search-wrap .tm-oh-input,
            #tm-order-history-search {
                padding: 0 12px 0 36px;
            }
            .tm-oh-select {
                padding: 10px 12px;
                padding-left: 12px;
                cursor: pointer;
                min-width: 130px;
                width: auto;
                flex: 0 0 auto;
            }
            .tm-oh-date-input {
                padding: 9px 10px;
                width: 132px;
                flex: 0 0 auto;
            }
            .tm-oh-input:focus, .tm-oh-select:focus {
                outline: none;
                border-color: var(--tm-input-focus-border, var(--tm-primary-color));
                box-shadow: 0 0 0 3px color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
            }
            .tm-oh-preset-group { display: flex; gap: 6px; flex-wrap: wrap; }
            .tm-oh-preset {
                padding: 8px 12px;
                border-radius: 999px;
                border: 1px solid var(--tm-shop-item-border);
                background: var(--tm-input-bg, var(--tm-shop-item-bg));
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
            }
            .tm-oh-preset:hover { background: var(--tm-shop-item-hover-bg); }
            .tm-oh-preset.is-active {
                background: var(--tm-primary-color);
                border-color: var(--tm-primary-color);
                color: var(--tm-text-on-primary, #fff);
            }
            .tm-oh-body {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                min-height: 0;
                background: var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg));
            }
            #tm-order-history-container {
                flex: 1;
                overflow: auto;
                padding: 16px 20px 20px;
            }
            .tm-oh-empty {
                text-align: center;
                padding: 72px 24px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
            }
            .tm-oh-empty-icon { font-size: 56px; margin-bottom: 14px; opacity: 0.45; }
            .tm-oh-empty-title {
                font-size: 1.15rem;
                font-weight: 700;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                margin-bottom: 6px;
            }
            .tm-oh-table-wrap {
                overflow: auto;
                width: 100%;
                max-height: 100%;
                border-radius: 14px;
                border: 1px solid var(--tm-shop-item-border);
                background: var(--tm-shop-item-bg);
            }
            .tm-order-history-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            .tm-order-history-table thead th {
                position: sticky;
                top: 0;
                z-index: 2;
                padding: 12px 14px;
                text-align: left;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--tm-grid-header-text, var(--tm-primary-color));
                background: var(--tm-grid-header-bg, var(--tm-shop-item-hover-bg));
                border-bottom: 1px solid var(--tm-shop-item-border);
                cursor: pointer;
                user-select: none;
                white-space: nowrap;
            }
            .tm-order-history-table thead th:hover { color: var(--tm-link-hover-color, var(--tm-info-color)); }
            .tm-order-history-table thead th.sort-asc::after { content: ' ▲'; font-size: 9px; opacity: 0.7; }
            .tm-order-history-table thead th.sort-desc::after { content: ' ▼'; font-size: 9px; opacity: 0.7; }
            .tm-order-history-table tbody tr.tm-order-history-row {
                border-bottom: 1px solid var(--tm-shop-item-border);
                transition: background 0.12s ease;
                cursor: pointer;
            }
            .tm-order-history-table tbody tr.tm-order-history-row:hover {
                background: var(--tm-grid-row-hover-bg, var(--tm-shop-item-hover-bg));
            }
            .tm-order-history-table tbody tr.tm-order-history-row--service {
                box-shadow: inset 3px 0 0 var(--tm-success-color);
            }
            .tm-order-history-table tbody tr.tm-order-history-row--parts {
                box-shadow: inset 3px 0 0 var(--tm-info-color);
            }
            .tm-order-history-table td {
                padding: 12px 14px;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                vertical-align: middle;
                max-width: 220px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tm-oh-phone {
                font-weight: 700;
                font-size: 14px;
                letter-spacing: 0.04em;
                white-space: nowrap;
            }
            .tm-oh-icon-btn {
                margin-left: 6px;
                padding: 3px 8px;
                border-radius: 6px;
                border: 1px solid var(--tm-shop-item-border);
                background: var(--tm-chip-bg, var(--tm-shop-item-hover-bg));
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                font-size: 11px;
                cursor: pointer;
                vertical-align: middle;
            }
            .tm-oh-icon-btn:hover { background: var(--tm-shop-item-hover-bg); border-color: var(--tm-primary-color); }
            .tm-oh-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
                white-space: nowrap;
            }
            .tm-oh-badge--checking { background: var(--tm-chip-bg); color: var(--tm-muted-text); border: 1px solid var(--tm-chip-border); }
            .tm-oh-badge--active {
                background: color-mix(in srgb, var(--tm-success-color) 15%, transparent);
                color: var(--tm-success-color);
                border: 1px solid color-mix(in srgb, var(--tm-success-color) 28%, transparent);
            }
            .tm-oh-badge--removed {
                background: color-mix(in srgb, var(--tm-danger-color) 12%, transparent);
                color: var(--tm-danger-color);
                border: 1px solid color-mix(in srgb, var(--tm-danger-color) 28%, transparent);
            }
            .tm-oh-badge--unknown {
                background: color-mix(in srgb, var(--tm-warning-color) 12%, transparent);
                color: var(--tm-warning-color);
                border: 1px solid color-mix(in srgb, var(--tm-warning-color) 28%, transparent);
            }
            .tm-oh-cell-muted { color: var(--tm-muted-text, var(--tm-secondary-color)); font-size: 12px; }
            .tm-oh-cell-customer { font-weight: 600; max-width: 240px; white-space: normal; line-height: 1.35; }
            .tm-order-filter-input {
                width: 100%;
                margin-top: 6px;
                padding: 6px 8px;
                font-size: 11px;
                border-radius: 8px;
                border: 1px solid var(--tm-input-border, var(--tm-shop-item-border));
                background: var(--tm-input-bg, var(--tm-shop-item-bg));
                color: var(--tm-input-text, var(--tm-shop-item-text, var(--tm-primary-color)));
            }
            .tm-order-filter-input:focus {
                outline: none;
                border-color: var(--tm-input-focus-border, var(--tm-primary-color));
            }
`;
        document.head.appendChild(style);
    }

    // Function to show order history modal
    function showOrderHistoryModal() {
        // Check if modal already exists
        if (document.querySelector('.tm-modal-overlay[data-order-history-modal]')) {
            return;
        }

        ensureOrderHistoryStyles();
        
        // Load history from current page only
        const pageHistory = JSON.parse(GM_getValue(CURRENT_PAGE_HISTORY_KEY, '[]'));
        
        // Sort by timestamp (newest first)
        const sortedPageHistory = pageHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        // Determine page name for display
        const pageName = isServiceOrdersPage ? 'Παραγγελίες Υπηρεσιών' : 'Παραγγελίες Ανταλλακτικών';
        const pageBadge = isServiceOrdersPage ? 'Υπηρεσίες' : 'Ανταλλακτικά';
        const totalCount = sortedPageHistory.length;
        
        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay tm-oh-overlay';
        overlay.setAttribute('data-order-history-modal', 'true');
        overlay.innerHTML = `
            <div class="tm-modal-content tm-oh-shell">
                <div class="tm-oh-hero">
                    <div class="tm-oh-hero-top">
                        <div class="tm-oh-title-wrap">
                            <h2 class="tm-oh-title">
                                📦 Ιστορικό Παραγγελιών
                                <span class="tm-oh-page-badge">${pageBadge}</span>
                            </h2>
                            <p class="tm-oh-subtitle">${pageName} · Κλικ σε γραμμή για άνοιγμα παραγγελίας</p>
                        </div>
                        <div class="tm-oh-hero-actions">
                            <button type="button" class="tm-oh-close tm-modal-close" title="Κλείσιμο" aria-label="Κλείσιμο">&times;</button>
                        </div>
                    </div>
                    <div class="tm-oh-stats-row">
                        <div class="tm-oh-stat">
                            <span class="tm-oh-stat-value" id="tm-order-history-stats">${totalCount}</span>
                            <span class="tm-oh-stat-label">Σύνολο</span>
                        </div>
                        <div class="tm-oh-stat">
                            <span class="tm-oh-stat-value" id="tm-order-history-visible-count">0</span>
                            <span class="tm-oh-stat-label">Εμφανίζονται</span>
                        </div>
                        <div class="tm-oh-toolbar">
                            <button type="button" id="tm-order-rescan-btn" class="tm-oh-tool-btn" title="Ανασάρωση τρέχουσας σελίδας">
                                <span>🔄</span><span>Ανασάρωση</span>
                            </button>
                            <button type="button" id="tm-order-columns-toggle" class="tm-oh-tool-btn" title="Φίλτρα στηλών">
                                <span>👁️</span><span>Στήλες</span>
                            </button>
                            <button type="button" id="tm-order-export-btn" class="tm-oh-tool-btn" title="Εξαγωγή CSV">
                                <span>📥</span><span>Εξαγωγή</span>
                            </button>
                            <button type="button" id="tm-order-history-clear" class="tm-oh-tool-btn tm-oh-tool-btn--danger" title="Εκκαθάριση ιστορικού">
                                <span>🗑️</span><span>Εκκαθάριση</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="tm-oh-filters">
                    <div class="tm-oh-filters-row">
                        <div class="tm-oh-search-wrap">
                            <input type="text" id="tm-order-history-search" class="tm-oh-input" placeholder="Αναζήτηση πελάτη, τηλεφώνου, κωδικού…">
                        </div>
                        <select id="tm-order-status-filter" class="tm-oh-select">
                            <option value="">Όλες οι καταστάσεις</option>
                            <option value="active">✅ Ενεργές</option>
                            <option value="removed">❌ Αφαιρεμένες</option>
                        </select>
                        <input type="date" id="tm-order-date-from" class="tm-oh-input tm-oh-date-input" title="Από">
                        <span class="tm-oh-cell-muted">→</span>
                        <input type="date" id="tm-order-date-to" class="tm-oh-input tm-oh-date-input" title="Έως">
                        <div class="tm-oh-preset-group">
                            <button type="button" class="tm-order-date-preset tm-oh-preset" data-preset="today">Σήμερα</button>
                            <button type="button" class="tm-order-date-preset tm-oh-preset" data-preset="last7">7 ημέρες</button>
                            <button type="button" class="tm-order-date-preset tm-oh-preset" data-preset="last30">30 ημέρες</button>
                            <button type="button" class="tm-order-date-preset tm-oh-preset" data-preset="thisMonth">Μήνας</button>
                            <button type="button" id="tm-order-date-clear" class="tm-oh-preset" title="Καθαρισμός ημερομηνιών">✕</button>
                        </div>
                    </div>
                </div>
                <div class="tm-oh-body">
                    <div id="tm-order-history-container"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Event listeners
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        
        // Get container reference
        const container = overlay.querySelector('#tm-order-history-container');
        
        // Function to render orders (used by search and filter)
        let currentSearchTerm = '';
        let currentStatusFilter = '';
        let currentDateFrom = '';
        let currentDateTo = '';
        let sortColumn = 'Date';
        let sortDirection = 'desc';
        let visibleColumns = new Set();
        let statusesChecked = false;
        const statusResultsMap = new Map();
        const updateVisibleCounter = () => {
            const visibleCountEl = overlay.querySelector('#tm-order-history-visible-count');
            if (!visibleCountEl) return;
            const rows = Array.from(container.querySelectorAll('.tm-order-history-row'));
            const visible = rows.filter(r => r.style.display !== 'none').length;
            visibleCountEl.textContent = visible;
        };
        
        const renderOrders = () => {
            // Use orders from current page only
            let ordersToRender = [...sortedPageHistory];
            
            // Apply search
            let filtered = ordersToRender;
            if (currentSearchTerm) {
                const searchLower = currentSearchTerm.toLowerCase();
                filtered = filtered.filter(order => {
                    // Search in all standard fields
                    const searchableText = [
                        order.phone, order.customer, order.description, order.id,
                        order.repairNumber, order.status, order.technician, order.price,
                        order.partName, order.quantity, order.supplier, order.cost
                    ].filter(Boolean).join(' ').toLowerCase();
                    
                    // Also search in allColumns
                    let allColumnsText = '';
                    if (order.allColumns) {
                        allColumnsText = Object.values(order.allColumns).filter(Boolean).join(' ').toLowerCase();
                    }
                    
                    return searchableText.includes(searchLower) || allColumnsText.includes(searchLower);
                });
            }
            
            // Apply date range filter
            if (currentDateFrom || currentDateTo) {
                filtered = filtered.filter(order => {
                    const orderDate = new Date(order.timestamp);
                    if (currentDateFrom) {
                        const fromDate = new Date(currentDateFrom);
                        fromDate.setHours(0, 0, 0, 0);
                        if (orderDate < fromDate) return false;
                    }
                    if (currentDateTo) {
                        const toDate = new Date(currentDateTo);
                        toDate.setHours(23, 59, 59, 999);
                        if (orderDate > toDate) return false;
                    }
                    return true;
                });
            }
            
            // Update visible counter after all filtering
            const visibleCountEl = overlay.querySelector('#tm-order-history-visible-count');
            if (visibleCountEl) {
                visibleCountEl.textContent = filtered.length;
            }
            
            // Apply sorting
            filtered.sort((a, b) => {
                let aVal, bVal;
                
                if (sortColumn === 'Date' || sortColumn === 'Added') {
                    aVal = a.timestamp;
                    bVal = b.timestamp;
                } else if (sortColumn === 'Type') {
                    aVal = a.type || '';
                    bVal = b.type || '';
                } else if (sortColumn === 'Phone') {
                    aVal = a.phone || '';
                    bVal = b.phone || '';
                } else if (sortColumn === 'Customer') {
                    aVal = a.customer || '';
                    bVal = b.customer || '';
                } else if (a.allColumns && a.allColumns[sortColumn] && b.allColumns && b.allColumns[sortColumn]) {
                    aVal = String(a.allColumns[sortColumn]);
                    bVal = String(b.allColumns[sortColumn]);
                } else {
                    aVal = '';
                    bVal = '';
                }
                
                // Try to parse as number
                const aNum = parseFloat(aVal);
                const bNum = parseFloat(bVal);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                // String comparison
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortDirection === 'asc' ? comparison : -comparison;
            });
            
            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="tm-oh-empty">
                        <div class="tm-oh-empty-icon">🔍</div>
                        <div class="tm-oh-empty-title">Δεν βρέθηκαν παραγγελίες</div>
                        <div>Δοκιμάστε άλλη αναζήτηση ή φίλτρο ημερομηνίας</div>
                    </div>
                `;
                updateVisibleCounter();
                return;
            }
            
            // Collect all unique column names from all orders
            const allColumnNames = new Set();
            filtered.forEach(order => {
                if (order.allColumns) {
                    Object.keys(order.allColumns).forEach(col => allColumnNames.add(col));
                }
            });
            
            // Standard columns always shown
            // 'Date'  → actual order date extracted from the table (falls back to capture date for old entries)
            // 'Added' → relative capture time ("5 mins ago"), so it's distinct from the real order date
            let standardColumns = ['Date', 'Added', 'Status'];

            // Phone and Customer are relevant for service orders (srvorders_list), not parts orders
            if (isServiceOrdersPage) {
                standardColumns.push('Phone', 'Customer');
            }

            // Deduplicate: exclude allColumns keys that are already covered by a standard column.
            // Matching is done by pattern so Greek-named columns (Τηλέφωνο, Πελάτης, Ημ/νία, …)
            // don't end up shown twice alongside their English-named equivalents.
            const _phonePattern    = /τηλ|phone|tel/i;
            const _customerPattern = /πελάτ|customer|ονομ/i;
            const _datePattern     = /^ημ|date/i;

            const columnOrder = [
                ...standardColumns,
                ...Array.from(allColumnNames).filter(col => {
                    if (standardColumns.includes(col)) return false;
                    if (_datePattern.test(col)) return false;          // 'Date' covers this
                    if (isServiceOrdersPage && _phonePattern.test(col)) return false;    // 'Phone' covers this
                    if (isServiceOrdersPage && _customerPattern.test(col)) return false; // 'Customer' covers this
                    return true;
                })
            ];
            
            // Build table HTML
            let html = `
                <div class="tm-oh-table-wrap">
                    <table class="tm-order-history-table">
                        <thead>
                            <tr>
                                ${columnOrder.map(col => {
                                    const isSorted = col === sortColumn;
                                    const sortClass = isSorted ? (sortDirection === 'asc' ? 'sort-asc' : 'sort-desc') : '';
                                    return `
                                        <th class="${sortClass}" data-column="${escapeHtml(col)}">
                                            <div>${escapeHtml(col)}</div>
                                            <input type="text" class="tm-order-filter-input" data-filter-col="${escapeHtml(col)}" placeholder="Φίλτρο…" style="display: none;">
                                        </th>
                                    `;
                                }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map((order) => {
                                const phoneDisplay = formatPhoneDisplay(order.phone) || order.phone || '';
                                const isServiceOrderEntry = order.type === 'Service Order' || order.type === 'Product Order';
                                const rowTypeClass = isServiceOrderEntry ? 'tm-order-history-row--service' : 'tm-order-history-row--parts';
                                const dateTimeText = formatDateTime(order.timestamp);
                                const orderDate = order.date || new Date(order.timestamp).toLocaleDateString('el-GR');
                                const statusId = `order-status-${String(order.id || '').replace(/[^a-zA-Z0-9]/g, '-')}-${String(order.type || '').replace(/\s+/g, '-')}`;

                                const getCellValue = (colName) => {
                                    if (colName === 'Phone') {
                                        if (!order.phone) return '<span class="tm-oh-cell-muted">—</span>';
                                        return `<span class="tm-oh-phone">${escapeHtml(phoneDisplay)}</span><button type="button" class="tm-oh-icon-btn tm-copy-phone-btn" data-phone="${escapeHtml(order.phone)}" title="Αντιγραφή">📋</button>`;
                                    }
                                    if (colName === 'Customer') {
                                        return `<span class="tm-oh-cell-customer">${escapeHtml(order.customer || '—')}</span>`;
                                    }
                                    if (colName === 'Date') return `<span>${escapeHtml(orderDate)}</span>`;
                                    if (colName === 'Added') return `<span class="tm-oh-cell-muted">${escapeHtml(dateTimeText)}</span>`;
                                    if (colName === 'Status') return `<span id="${statusId}" class="tm-oh-badge tm-oh-badge--checking">⏳ Έλεγχος…</span>`;
                                    if (colName === 'Repair Number') return escapeHtml(order.repairNumber || '');
                                    if (order.allColumns && order.allColumns[colName]) {
                                        return escapeHtml(String(order.allColumns[colName]));
                                    }
                                    return '';
                                };

                                const getCellTitle = (colName) => {
                                    if (colName === 'Phone') return phoneDisplay || order.phone || '';
                                    if (colName === 'Customer') return order.customer || '';
                                    if (colName === 'Date') return orderDate;
                                    if (colName === 'Added') return dateTimeText;
                                    if (colName === 'Status') return 'Έλεγχος…';
                                    if (colName === 'Repair Number') return order.repairNumber || '';
                                    if (order.allColumns && order.allColumns[colName]) {
                                        return String(order.allColumns[colName]);
                                    }
                                    return '';
                                };

                                return `
                                    <tr class="tm-order-history-row ${rowTypeClass}" data-order-id="${escapeHtml(order.id)}" data-order-type="${escapeHtml(order.type)}">
                                        ${columnOrder.map((col) => {
                                            const cellValue = getCellValue(col);
                                            const cellTitle = getCellTitle(col);
                                            let textAlign = 'left';
                                            if (col === 'Date' || col === 'Added' || col.includes('Date') || col.includes('Ημ')) {
                                                textAlign = 'center';
                                            } else if (col.includes('Price') || col.includes('Cost') || col.includes('Amount') || col.includes('Quantity')) {
                                                textAlign = 'right';
                                            }
                                            return `<td style="text-align:${textAlign};" title="${escapeHtml(cellTitle)}">${cellValue}</td>`;
                                        }).join('')}
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Attach sortable column headers
            const headers = container.querySelectorAll('.tm-order-history-table thead th[data-column]');
            headers.forEach(header => {
                header.addEventListener('click', (e) => {
                    if (e.target.tagName === 'INPUT') return; // Don't sort when clicking filter input
                    const col = header.dataset.column;
                    if (sortColumn === col) {
                        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortColumn = col;
                        sortDirection = 'asc';
                    }
                    renderOrders();
                });
            });
            
            // Attach column filter inputs
            const filterInputs = container.querySelectorAll('.tm-order-filter-input');
            filterInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const filterCol = e.target.dataset.filterCol;
                    const filterValue = e.target.value.toLowerCase();
                    const rows = container.querySelectorAll('.tm-order-history-row');
                    const headerArray = Array.from(headers);
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        const colIndex = headerArray.findIndex(h => h.dataset.column === filterCol);
                        if (colIndex >= 0 && colIndex < cells.length) {
                            const cellText = cells[colIndex].textContent.toLowerCase();
                            row.style.display = cellText.includes(filterValue) ? '' : 'none';
                        }
                    });
                    updateVisibleCounter();
                });
            });
            
            // Status checking: only on first modal open; reuse cached results on subsequent renders
            if (filtered.length > 0) {
                const applyStatusToRow = (order, status) => {
                    const statusId = `order-status-${String(order.id || '').replace(/[^a-zA-Z0-9]/g, '-')}-${String(order.type || '').replace(/\s+/g, '-')}`;
                    const statusEl = container.querySelector(`#${statusId}`);
                    if (!statusEl) return;
                    
                    if (status.checking) {
                        statusEl.className = 'tm-oh-badge tm-oh-badge--checking';
                        statusEl.innerHTML = '⏳ Έλεγχος…';
                    } else if (status.error) {
                        statusEl.className = 'tm-oh-badge tm-oh-badge--unknown';
                        statusEl.innerHTML = '❓ Άγνωστο';
                        statusEl.title = 'Δεν ήταν δυνατός ο έλεγχος κατάστασης';
                    } else if (status.exists) {
                        statusEl.className = 'tm-oh-badge tm-oh-badge--active';
                        statusEl.innerHTML = '✅ Ενεργή';
                        statusEl.title = 'Η παραγγελία υπάρχει ακόμα στο σύστημα';
                    } else {
                        statusEl.className = 'tm-oh-badge tm-oh-badge--removed';
                        statusEl.innerHTML = '❌ Αφαιρέθηκε';
                        statusEl.title = 'Η παραγγελία αφαιρέθηκε από το σύστημα';
                    }
                };
                
                if (!statusesChecked) {
                    checkOrdersStatus(filtered).then(statuses => {
                        statuses.forEach((status, idx) => {
                            const order = filtered[idx];
                            const key = `${order.id}_${order.type}`;
                            statusResultsMap.set(key, status);
                            applyStatusToRow(order, status);
                        });
                        statusesChecked = true;
                        
                        // Apply status filter if active
                        if (currentStatusFilter) {
                            const rows = container.querySelectorAll('.tm-order-history-row');
                            rows.forEach(row => {
                                const statusEl = row.querySelector('[id^="order-status-"]');
                                if (statusEl) {
                                    const statusText = statusEl.textContent || '';
                                    const shouldShow = 
                                        (currentStatusFilter === 'active' && (statusText.includes('✅') || statusText.includes('Ενεργ'))) ||
                                        (currentStatusFilter === 'removed' && (statusText.includes('❌') || statusText.includes('Αφαιρ')));
                                    row.style.display = shouldShow ? '' : 'none';
                                } else if (currentStatusFilter !== '') {
                                    row.style.display = 'none';
                                }
                            });
                            updateVisibleCounter();
                        }
                    }).catch(err => {
                        console.error('[MMS Order History] Error checking order statuses:', err);
                    });
                } else if (statusResultsMap.size > 0) {
                    // Re-apply cached statuses to newly rendered rows without re-checking
                    filtered.forEach(order => {
                        const key = `${order.id}_${order.type}`;
                        const status = statusResultsMap.get(key);
                        if (status) {
                            applyStatusToRow(order, status);
                        }
                    });
                    if (currentStatusFilter) {
                        const rows = container.querySelectorAll('.tm-order-history-row');
                        rows.forEach(row => {
                            const statusEl = row.querySelector('[id^="order-status-"]');
                            if (statusEl) {
                                const statusText = statusEl.textContent || '';
                                const shouldShow = 
                                    (currentStatusFilter === 'active' && (statusText.includes('✅') || statusText.includes('Ενεργ') || statusText.includes('Active'))) ||
                                    (currentStatusFilter === 'removed' && (statusText.includes('❌') || statusText.includes('Αφαιρ') || statusText.includes('Removed')));
                                row.style.display = shouldShow ? '' : 'none';
                            } else if (currentStatusFilter !== '') {
                                row.style.display = 'none';
                            }
                        });
                    }
                    updateVisibleCounter();
                }
            }

            // Make rows open the source page in a new tab
            const rows = container.querySelectorAll('.tm-order-history-row');
            rows.forEach(row => {
                row.style.cursor = 'pointer';
                row.addEventListener('click', (e) => {
                    // Don't trigger if clicking on interactive elements
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                        return;
                    }
                    
                    const orderId = row.dataset.orderId;
                    const orderType = row.dataset.orderType;
                    const order = filtered.find(o => String(o.id) === String(orderId) && o.type === orderType);
                    
                    console.log('[Order History] Click debug:', {
                        orderId,
                        orderType,
                        foundOrder: !!order,
                        orderUrl: order?.url
                    });
                    
                    if (order && order.url) {
                        console.log('[Order History] Opening URL:', order.url);
                        window.open(order.url, '_blank');
                    } else if (order) {
                        console.warn('[Order History] Order found but no URL stored');
                        if (window.showNegativeMessage) {
                            window.showNegativeMessage('No URL stored for this order');
                        }
                    } else {
                        console.warn('[Order History] Order not found in filtered list');
                    }
                });
            });

            // Final visible counter after all row-level changes
            updateVisibleCounter();
        };
        
        // Initial render
        renderOrders();
        
        // Search functionality
        const searchInput = overlay.querySelector('#tm-order-history-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value.toLowerCase();
                renderOrders();
            });
        }
        
        // Status filter
        const statusFilter = overlay.querySelector('#tm-order-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                currentStatusFilter = e.target.value;
                // Apply filter to existing rows without re-rendering (to preserve status checks)
                const rows = container.querySelectorAll('.tm-order-history-row');
                rows.forEach(row => {
                    const statusEl = row.querySelector('[id^="order-status-"]');
                    if (statusEl) {
                        const statusText = statusEl.textContent || '';
                        const shouldShow = 
                            currentStatusFilter === '' ||
                            (currentStatusFilter === 'active' && (statusText.includes('✅') || statusText.includes('Ενεργ'))) ||
                            (currentStatusFilter === 'removed' && (statusText.includes('❌') || statusText.includes('Αφαιρ')));
                        row.style.display = shouldShow ? '' : 'none';
                    } else if (currentStatusFilter !== '') {
                        // Hide if status not checked yet and filter is active
                        row.style.display = 'none';
                    } else {
                        row.style.display = '';
                    }
                });
                updateVisibleCounter();
            });
        }
        
        // Date range filters
        const dateFrom = overlay.querySelector('#tm-order-date-from');
        const dateTo = overlay.querySelector('#tm-order-date-to');
        if (dateFrom) {
            dateFrom.addEventListener('change', (e) => {
                currentDateFrom = e.target.value;
                renderOrders();
            });
        }
        if (dateTo) {
            dateTo.addEventListener('change', (e) => {
                currentDateTo = e.target.value;
                renderOrders();
            });
        }
        
        // Helper to format date for input[type=date]
        const formatDateForInput = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Date preset buttons
        const datePresetButtons = overlay.querySelectorAll('.tm-order-date-preset');
        datePresetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let fromDate, toDate;
                
                switch (preset) {
                    case 'today':
                        fromDate = new Date(today);
                        toDate = new Date(today);
                        break;
                    case 'yesterday':
                        fromDate = new Date(today);
                        fromDate.setDate(today.getDate() - 1);
                        toDate = new Date(fromDate);
                        break;
                    case 'last7':
                        fromDate = new Date(today);
                        fromDate.setDate(today.getDate() - 6);
                        toDate = new Date(today);
                        break;
                    case 'last30':
                        fromDate = new Date(today);
                        fromDate.setDate(today.getDate() - 29);
                        toDate = new Date(today);
                        break;
                    case 'thisMonth':
                        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                        toDate = new Date(today);
                        break;
                }
                
                if (fromDate && toDate) {
                    dateFrom.value = formatDateForInput(fromDate);
                    dateTo.value = formatDateForInput(toDate);
                    currentDateFrom = dateFrom.value;
                    currentDateTo = dateTo.value;
                    
                    datePresetButtons.forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    
                    renderOrders();
                }
            });
        });
        
        // Clear date filter button
        const dateClearBtn = overlay.querySelector('#tm-order-date-clear');
        if (dateClearBtn) {
            dateClearBtn.addEventListener('click', () => {
                dateFrom.value = '';
                dateTo.value = '';
                currentDateFrom = '';
                currentDateTo = '';
                
                datePresetButtons.forEach(b => b.classList.remove('is-active'));
                
                renderOrders();
            });
        }

        // Rescan current page for orders
        const rescanBtn = overlay.querySelector('#tm-order-rescan-btn');
        if (rescanBtn) {
            rescanBtn.addEventListener('click', () => {
                try {
                    rescanBtn.disabled = true;
                    rescanBtn.innerHTML = '<span>⏳</span><span>Ανασάρωση…</span>';
                    
                    const beforeCount = JSON.parse(GM_getValue(CURRENT_PAGE_HISTORY_KEY, '[]')).length;
                    
                    const newOrders = extractOrderData();
                    if (newOrders && newOrders.length > 0) {
                        console.log(`[MMS Order History] Found ${newOrders.length} orders on page`);
                        saveOrdersToHistory(newOrders);
                        
                        // Reload history from storage
                        const newPageHistory = JSON.parse(GM_getValue(CURRENT_PAGE_HISTORY_KEY, '[]'));
                        sortedPageHistory.length = 0;
                        sortedPageHistory.push(...newPageHistory.sort((a, b) => b.timestamp - a.timestamp));
                        
                        const totalAdded = newPageHistory.length - beforeCount;
                        const duplicates = newOrders.length - totalAdded;
                        
                        // Update stats
                        const statsEl = overlay.querySelector('#tm-order-history-stats');
                        if (statsEl) {
                            statsEl.textContent = String(newPageHistory.length);
                        }
                        
                        // Reset status cache so checks can re-run if needed
                        statusesChecked = false;
                        statusResultsMap.clear();
                        
                        // Clear GM_setValue status cache for all orders on this page
                        newPageHistory.forEach(order => {
                            const cacheKey = `order_status_${order.id}_${order.type}`;
                            GM_deleteValue(cacheKey);
                        });
                        
                        renderOrders();
                        
                        if (window.showPositiveMessage) {
                            window.showPositiveMessage(`Rescan: Found ${newOrders.length} orders | Added: ${totalAdded} | Duplicates: ${duplicates}`);
                        }
                    } else {
                        if (window.showNegativeMessage) {
                            window.showNegativeMessage('No orders found on current page');
                        }
                    }
                } catch (error) {
                    console.error('[MMS Order History] Rescan error:', error);
                    if (window.showNegativeMessage) {
                        window.showNegativeMessage('Rescan failed: ' + error.message);
                    }
                } finally {
                    rescanBtn.disabled = false;
                    rescanBtn.innerHTML = '<span>🔄</span><span>Ανασάρωση</span>';
                }
            });
        }
        
        // Export functionality
        const exportBtn = overlay.querySelector('#tm-order-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                // Get current page's orders
                let ordersToExport = [...sortedPageHistory];
                
                // Apply same filters as display
                let filtered = ordersToExport;
                if (currentSearchTerm) {
                    const searchLower = currentSearchTerm.toLowerCase();
                    filtered = ordersToExport.filter(order => {
                        const searchableText = [
                            order.phone, order.customer, order.description, order.id,
                            order.repairNumber, order.status, order.technician, order.price,
                            order.partName, order.quantity, order.supplier, order.cost
                        ].filter(Boolean).join(' ').toLowerCase();
                        let allColumnsText = '';
                        if (order.allColumns) {
                            allColumnsText = Object.values(order.allColumns).filter(Boolean).join(' ').toLowerCase();
                        }
                        return searchableText.includes(searchLower) || allColumnsText.includes(searchLower);
                    });
                } else {
                    filtered = ordersToExport;
                }
                
                // Apply date filters
                if (currentDateFrom || currentDateTo) {
                    filtered = filtered.filter(order => {
                        const orderDate = new Date(order.timestamp);
                        if (currentDateFrom) {
                            const fromDate = new Date(currentDateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            if (orderDate < fromDate) return false;
                        }
                        if (currentDateTo) {
                            const toDate = new Date(currentDateTo);
                            toDate.setHours(23, 59, 59, 999);
                            if (orderDate > toDate) return false;
                        }
                        return true;
                    });
                }
                
                // Collect all columns
                const allColumnNames = new Set();
                filtered.forEach(order => {
                    if (order.allColumns) {
                        Object.keys(order.allColumns).forEach(col => allColumnNames.add(col));
                    }
                });
                let standardColumns = ['Type', 'Date', 'Added', 'Status'];
                if (isServiceOrdersPage) {
                    standardColumns.push('Phone', 'Customer', 'Repair Number');
                }
                const _csvPhonePattern    = /τηλ|phone|tel/i;
                const _csvCustomerPattern = /πελάτ|customer|ονομ/i;
                const _csvDatePattern     = /^ημ|date/i;
                const columnOrder = [
                    ...standardColumns,
                    ...Array.from(allColumnNames).filter(col => {
                        if (standardColumns.includes(col)) return false;
                        if (_csvDatePattern.test(col)) return false;
                        if (isServiceOrdersPage && _csvPhonePattern.test(col)) return false;
                        if (isServiceOrdersPage && _csvCustomerPattern.test(col)) return false;
                        return true;
                    })
                ];
                
                // Create CSV
                const headers = columnOrder.join(',');
                const rows = filtered.map(order => {
                    return columnOrder.map(col => {
                        let val = '';
                        if (col === 'Phone') val = order.phone || '';
                        else if (col === 'Customer') val = order.customer || '';
                        else if (col === 'Date') val = order.date || new Date(order.timestamp).toLocaleDateString('el-GR');
                        else if (col === 'Added') val = formatDateTime(order.timestamp);
                        else if (col === 'Status') val = 'Unknown';
                        else if (col === 'Repair Number') val = order.repairNumber || '';
                        else if (order.allColumns && order.allColumns[col]) val = String(order.allColumns[col]);
                        return `"${String(val).replace(/"/g, '""')}"`;
                    }).join(',');
                });
                
                const csv = [headers, ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                const pageType = isServiceOrdersPage ? 'service_repairs' : 'parts_orders';
                link.download = `order_history_${pageType}_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
            });
        }
        
        // Column visibility toggle
        const columnsToggle = overlay.querySelector('#tm-order-columns-toggle');
        if (columnsToggle) {
            columnsToggle.addEventListener('click', () => {
                const filterInputs = container.querySelectorAll('.tm-order-filter-input');
                const isVisible = filterInputs[0] && filterInputs[0].style.display !== 'none';
                filterInputs.forEach(input => {
                    input.style.display = isVisible ? 'none' : 'block';
                });
            });
        }
        
        // Clear history button
        const clearBtn = overlay.querySelector('#tm-order-history-clear');
        clearBtn.addEventListener('click', (e) => {
            const clearMessage = `Εκκαθάριση όλου του ιστορικού (${pageName})?\n\nΘα διαγραφούν όλες οι αποθηκευμένες παραγγελίες για αυτή τη σελίδα.`;
            
            if (confirm(clearMessage)) {
                // Clear current page's history
                GM_setValue(CURRENT_PAGE_HISTORY_KEY, '[]');
                
                // Update stats display
                const statsEl = overlay.querySelector('#tm-order-history-stats');
                if (statsEl) {
                    statsEl.textContent = '0';
                }
                
                // Clear local array
                sortedPageHistory.length = 0;
                
                // Re-render
                renderOrders();
                
                if (window.showPositiveMessage) {
                    window.showPositiveMessage(`Το ιστορικό εκκαθαρίστηκε (${pageName})`);
                }
            }
        });
        
        // Copy phone number functionality (delegated event listener)
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('tm-copy-phone-btn') || e.target.closest('.tm-copy-phone-btn')) {
                const btn = e.target.classList.contains('tm-copy-phone-btn') ? e.target : e.target.closest('.tm-copy-phone-btn');
                const phone = btn.getAttribute('data-phone');
                if (phone) {
                    navigator.clipboard.writeText(phone).then(() => {
                        const originalText = btn.textContent;
                        btn.textContent = '✓ Copied!';
                        btn.style.background = 'rgba(76, 175, 80, 0.4)';
                        btn.style.borderColor = 'rgba(76, 175, 80, 0.6)';
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = 'var(--tm-shop-item-bg)';
                            btn.style.borderColor = 'var(--tm-shop-item-border)';
                        }, 1500);
                    }).catch(err => {
                        console.error('Failed to copy phone:', err);
                    });
                }
            }
        });
    }

    // Initialize monitoring when page loads
    function initOrderHistory() {
        // Always start background fetcher (runs on all pages)
        initOrderHistoryBackgroundFetcher();

        // The rest of the logic only applies when we're actually on an orders list page
        if (!onOrdersPage) {
            return;
        }

        // Clean up any existing duplicates first (runs once on page load)
        removeDuplicatesFromHistory();
        
        // Monitor for order acceptance
        monitorOrderAcceptance();
        
        // Also extract orders on page load
        setTimeout(() => {
            const orders = extractOrderData();
            if (orders.length > 0) {
                saveOrdersToHistory(orders);
            }
        }, 1000);
    }

    // Make functions globally accessible
    window.showOrderHistoryModal = showOrderHistoryModal;
    window.initOrderHistory = initOrderHistory;
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOrderHistory);
    } else {
        initOrderHistory();
    }

})();

