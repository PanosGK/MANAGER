// ==UserScript==
// @name         MyManager Technician Stats Feature
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Technician statistics feature for service list page
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === FEATURE: TECHNICIAN STATS ON SERVICE LIST
    // ===================================================================
    /**
     * On the service list page, calculates and displays statistics for each technician.
     * Stats include: number of repairs, total labor cost, and total parts cost.
     */
    
    // Function to check if required columns exist on the page
    function checkTechnicianStatsColumnsAvailable() {
        // Only check on service list page
        if (!window.location.pathname.includes('/mymanagerservice/service_list.php')) {
            console.log('[MMS Stats] Not on service list page, columns check returns false');
            return false;
        }
        
        const gridTable = document.querySelector('table.rnr-b-grid');
        if (!gridTable) {
            console.log('[MMS Stats] Table not found, columns check returns false');
            return false;
        }

        const headers = Array.from(gridTable.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());
        
        // If no headers found, table might not be loaded yet
        if (headerTexts.length === 0) {
            console.log('[MMS Stats] No headers found in table, columns check returns false');
            return false;
        }
        
        console.log('[MMS Stats] Checking columns. Found headers:', headerTexts);

        // Check for technician column
        const technicianIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τεχνικός') || lower.includes('technician') || lower.includes('tech');
        });
        
        // Check for repair price column - "Επισκευή" (not "Τιμή Επισκευής")
        const repairPriceIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase().trim();
            return (lower === 'επισκευή' || lower === 'επισκευη') && !lower.includes('τιμή');
        });
        
        let foundRepairPriceIndex = repairPriceIndex;
        if (foundRepairPriceIndex === -1) {
            foundRepairPriceIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('επισκευή') && !lower.includes('τιμή') && !lower.includes('ανταλλακτικά');
            });
        }
        
        // Check for parts column
        const partsCostIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return (lower.includes('ανταλλακτικά') || lower.includes('parts') || lower.includes('ανταλλακτικό')) &&
                   (lower.includes('κόστος') || lower.includes('cost') || lower.includes('τιμή') || lower.includes('price') || 
                    lower.includes('€') || lower.match(/\d/));
        });
        
        let foundPartsIndex = partsCostIndex;
        if (foundPartsIndex === -1) {
            foundPartsIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('ανταλλακτικά') || 
                       lower.includes('ανταλλακτικό') ||
                       lower.includes('parts') ||
                       lower.includes('spare') ||
                       lower.includes('component') ||
                       lower.includes('accessory');
            });
        }
        
        // If still not found, try position-based detection
        if (foundPartsIndex === -1 && foundRepairPriceIndex !== -1) {
            const possibleIndex = foundRepairPriceIndex + 1;
            if (possibleIndex < headerTexts.length) {
                const possibleHeader = headerTexts[possibleIndex].toLowerCase();
                if (possibleHeader.match(/[\d€]/) || headerTexts[possibleIndex].trim() === '') {
                    foundPartsIndex = possibleIndex;
                }
            }
        }
        
        // Return true only if all required columns are found
        const allColumnsFound = technicianIndex !== -1 && foundRepairPriceIndex !== -1 && foundPartsIndex !== -1;
        
        if (allColumnsFound) {
            console.log('[MMS Stats] All required columns found. Button will be shown.');
        } else {
            console.log('[MMS Stats] Required columns not found. Button will be hidden.', {
                technician: technicianIndex !== -1,
                repairPrice: foundRepairPriceIndex !== -1,
                parts: foundPartsIndex !== -1
            });
        }
        
        return allColumnsFound;
    }
    
    // Helper function to scrape and calculate stats
    function scrapeTechnicianStats() {
        // Access config and STORAGE_KEYS from window for global access
        const config = window.config || {};
        const STORAGE_KEYS = window.STORAGE_KEYS || {};

        // 1. Helper functions
        function parsePrice(priceText) {
            if (!priceText) return 0;
            // Remove currency symbols and spaces
            let cleanText = priceText.replace(/€/g, '').replace(/\s/g, '').trim();
            
            // Handle Greek number format: dots as thousand separators, comma as decimal
            // e.g., "1.234,56" or "1234,56" or "1234.56"
            // First, check if there's a comma (Greek decimal separator)
            if (cleanText.includes(',')) {
                // Remove dots (thousand separators) and replace comma with dot
                cleanText = cleanText.replace(/\./g, '').replace(',', '.');
            } else if (cleanText.includes('.')) {
                // Check if dot is decimal or thousand separator
                // If there are multiple dots or dot is followed by 2 digits, it's likely a decimal
                const parts = cleanText.split('.');
                if (parts.length === 2 && parts[1].length <= 2) {
                    // Single dot with 1-2 digits after = decimal separator
                    // Keep as is
                } else {
                    // Multiple dots or many digits after = thousand separators, remove them
                    cleanText = cleanText.replace(/\./g, '');
                }
            }
            
            const price = parseFloat(cleanText);
            return isNaN(price) ? 0 : price;
        }

        // 2. Find the main data table and its headers
        const gridTable = document.querySelector('table.rnr-b-grid');
        if (!gridTable) {
            console.error('[MMS Stats] Could not find the main data grid table.');
            return { error: 'Could not find data table.', stats: null, tableHTML: null, processedRows: 0 };
        }

        const headers = Array.from(gridTable.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());

        // 3. Find the column indexes dynamically by header text
        // Use flexible matching to handle various column name formats
        const technicianIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            return lower.includes('τεχνικός') || lower.includes('technician') || lower.includes('tech');
        });
        
        // Find the repair price column - "Επισκευή" (not "Τιμή Επισκευής")
        const repairPriceIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase().trim();
            // Match "Επισκευή" exactly, but exclude "Τιμή Επισκευής"
            return (lower === 'επισκευή' || lower === 'επισκευη') && !lower.includes('τιμή');
        });
        
        let foundRepairPriceIndex = repairPriceIndex;
        if (foundRepairPriceIndex === -1) {
            // Fallback: try search that includes "Επισκευή" but excludes "Τιμή"
            foundRepairPriceIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('επισκευή') && !lower.includes('τιμή') && !lower.includes('ανταλλακτικά');
            });
        }
        
        const partsCostIndex = headerTexts.findIndex(text => {
            const lower = text.toLowerCase();
            // Match if it contains parts keywords, optionally with cost/price keywords
            return (lower.includes('ανταλλακτικά') || lower.includes('parts') || lower.includes('ανταλλακτικό')) &&
                   (lower.includes('κόστος') || lower.includes('cost') || lower.includes('τιμή') || lower.includes('price') || 
                    lower.includes('€') || lower.match(/\d/)); // Also match if it has currency or numbers
        });
        
        // If parts cost not found with combined search, try simpler search
        let foundPartsIndex = partsCostIndex;
        if (foundPartsIndex === -1) {
            // Try various Greek and English terms for parts
            foundPartsIndex = headerTexts.findIndex(text => {
                const lower = text.toLowerCase();
                return lower.includes('ανταλλακτικά') || 
                       lower.includes('ανταλλακτικό') ||
                       lower.includes('parts') ||
                       lower.includes('spare') ||
                       lower.includes('component') ||
                       lower.includes('accessory');
            });
        }
        
        // If still not found, try to find it by position (usually after repair price)
        if (foundPartsIndex === -1 && foundRepairPriceIndex !== -1) {
            // Parts column is often right after repair price column
            const possibleIndex = foundRepairPriceIndex + 1;
            if (possibleIndex < headerTexts.length) {
                const possibleHeader = headerTexts[possibleIndex].toLowerCase();
                // Check if it looks like a cost/price column (has numbers, currency, or is empty but in right position)
                if (possibleHeader.match(/[\d€]/) || headerTexts[possibleIndex].trim() === '') {
                    foundPartsIndex = possibleIndex;
                    console.log(`[MMS Stats] Found Parts column by position (index ${possibleIndex}) after Repair Price column`);
                }
            }
        }

        // Log found headers for debugging
        console.log('[MMS Stats] Found Headers:', headerTexts);
        console.log(`[MMS Stats] Column Indexes - Tech: ${technicianIndex}, Repair Price: ${foundRepairPriceIndex}, Parts: ${foundPartsIndex}`);

        if (technicianIndex === -1 || foundRepairPriceIndex === -1 || foundPartsIndex === -1) {
            console.error('[MMS Stats] Could not find all required columns (Technician, Repair Price, Parts Cost).');
            console.log('[MMS Stats] Available headers:', headerTexts.map((h, i) => `${i}: "${h}"`).join(', '));
            return { error: `Δεν βρέθηκαν όλες οι απαιτούμενες στήλες.\n\nΒρέθηκαν:\n- Τεχνικός: ${technicianIndex !== -1 ? 'Ναι (στήλη ' + technicianIndex + ')' : 'Όχι'}\n- Τιμή Επισκευής: ${foundRepairPriceIndex !== -1 ? 'Ναι (στήλη ' + foundRepairPriceIndex + ')' : 'Όχι'}\n- Ανταλλακτικά: ${foundPartsIndex !== -1 ? 'Ναι (στήλη ' + foundPartsIndex + ')' : 'Όχι'}\n\nΕλέγξτε την κονσόλα για λεπτομέρειες.`, stats: null, tableHTML: null, processedRows: 0 };
        }
        
        // Use the found indices
        const finalRepairPriceIndex = foundRepairPriceIndex;
        const finalPartsIndex = foundPartsIndex;

        // 4. Iterate through all rows and aggregate data directly
        const stats = {};
        // Try multiple row selectors to catch all data rows
        const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"], tbody tr[class*="grid"], tbody tr:not([style*="display: none"])');
        let processedRows = 0;
        let skippedRows = 0;
        
        rows.forEach((row, rowIndex) => {
            // Skip if row is hidden
            if (row.style.display === 'none' || row.offsetParent === null) {
                skippedRows++;
                return;
            }
            
            const cells = row.querySelectorAll('td');
            
            // Ensure we have enough cells
            if (cells.length <= Math.max(technicianIndex, finalRepairPriceIndex, finalPartsIndex)) {
                skippedRows++;
                return;
            }
            
            const technicianName = cells[technicianIndex]?.innerText?.trim() || 
                                   cells[technicianIndex]?.textContent?.trim() || '';
            
            if (technicianName && technicianName.length > 0) {
                const repairPriceText = cells[finalRepairPriceIndex]?.innerText || cells[finalRepairPriceIndex]?.textContent || '';
                const partsText = cells[finalPartsIndex]?.innerText || cells[finalPartsIndex]?.textContent || '';
                
                const repairPrice = parsePrice(repairPriceText);
                const partsCost = parsePrice(partsText);

                if (!stats[technicianName]) {
                    stats[technicianName] = { repairs: 0, totalRepairPrice: 0, totalParts: 0 };
                }
                stats[technicianName].repairs++;
                stats[technicianName].totalRepairPrice += repairPrice;
                stats[technicianName].totalParts += partsCost;
                processedRows++;
                
                // Debug first few rows
                if (rowIndex < 3) {
                    console.log(`[MMS Stats] Row ${rowIndex + 1}: Tech="${technicianName}", Repair Price="${repairPriceText}" (${repairPrice}), Parts="${partsText}" (${partsCost})`);
                }
            } else {
                skippedRows++;
            }
        });
        
        console.log(`[MMS Stats] Processed ${processedRows} rows, skipped ${skippedRows} rows`);

        if (Object.keys(stats).length === 0) {
            return { error: 'Δεν βρέθηκαν δεδομένα τεχνικών για ανάλυση σε αυτή τη σελίδα.', stats: null, tableHTML: null, processedRows: 0 };
        }

        // 5. Build the HTML for the stats table
        let totalRepairs = 0, totalRepairPrice = 0, totalParts = 0;
        let rowsHTML = '';
        const sortedTechs = Object.keys(stats).sort();

        for (const tech of sortedTechs) {
            const techNetProfit = stats[tech].totalRepairPrice - stats[tech].totalParts;
            rowsHTML += `
                <tr>
                    <td>${tech}</td>
                    <td>${stats[tech].repairs}</td>
                    <td style="color: var(--tm-success-color);">${stats[tech].totalRepairPrice.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                    <td style="color: var(--tm-danger-color);">${stats[tech].totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                    <td style="color: ${techNetProfit >= 0 ? 'var(--tm-success-color)' : 'var(--tm-danger-color)'}; font-weight: 600;">
                        ${techNetProfit >= 0 ? '▲' : '▼'} ${techNetProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                    </td>
                </tr>`;
            totalRepairs += stats[tech].repairs;
            totalRepairPrice += stats[tech].totalRepairPrice;
            totalParts += stats[tech].totalParts;
        }

        // Calculate net profit (repair price - parts used)
        const netProfit = totalRepairPrice - totalParts;
        
        const tableHTML = `
             <div style="margin-bottom: 12px; padding: 10px; background: var(--tm-shop-item-bg); border-radius: 8px; font-size: 12px; color: var(--tm-secondary-hover); border: 1px solid var(--tm-shop-item-border);">
                 <strong>ℹ️ Σημείωση:</strong> Τα στατιστικά αφορούν μόνο τις επισκευές που εμφανίζονται στην τρέχουσα σελίδα (${processedRows} επισκευές). Για πλήρη στατιστικά, φορτώστε όλες τις σελίδες ή χρησιμοποιήστε την αναζήτηση.
             </div>
             <div style="margin-bottom: 16px; padding: 16px; background: var(--tm-shop-item-bg); border-radius: 12px; border: 1px solid var(--tm-success-color);">
                 <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                     <div>
                         <div style="font-size: 11px; color: var(--tm-secondary-hover); margin-bottom: 4px; text-transform: uppercase;">💰 Συνολική Τιμή</div>
                         <div style="font-size: 20px; font-weight: bold; color: var(--tm-success-color);">${totalRepairPrice.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                     </div>
                     <div>
                         <div style="font-size: 11px; color: var(--tm-secondary-hover); margin-bottom: 4px; text-transform: uppercase;">🛠️ Ανταλλακτικά</div>
                         <div style="font-size: 20px; font-weight: bold; color: var(--tm-danger-color);">${totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                     </div>
                     <div>
                         <div style="font-size: 11px; color: var(--tm-secondary-hover); margin-bottom: 4px; text-transform: uppercase;">📊 Καθαρό Κέρδος</div>
                         <div style="font-size: 20px; font-weight: bold; color: ${netProfit >= 0 ? 'var(--tm-success-color)' : 'var(--tm-danger-color)'};">
                             ${netProfit >= 0 ? '▲' : '▼'} ${netProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                         </div>
                     </div>
                 </div>
             </div>
             <table class="table table-bordered table-striped" style="width: 100%; text-align: center; margin-top: 10px;">
                 <thead style="background-color: var(--tm-shop-item-bg);">
                     <tr>
                         <th class="tm-sortable-header" data-sort="name" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             Τεχνικός <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="repairs" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             Πλήθος Επισκευών <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="price" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             💰 Τιμή Επισκευής <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="parts" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             🛠️ Ανταλλακτικά <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="profit" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             📊 Καθαρό <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                     </tr>
                 </thead>
                 <tbody>${rowsHTML}</tbody>
                 <tfoot style="font-weight: bold; background-color: var(--tm-shop-item-bg);">
                     <tr>
                         <td style="color: var(--tm-primary-color);">ΣΥΝΟΛΟ</td>
                         <td style="color: var(--tm-primary-color);">${totalRepairs}</td>
                         <td style="color: var(--tm-success-color);">${totalRepairPrice.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                         <td style="color: var(--tm-danger-color);">${totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                         <td style="color: ${netProfit >= 0 ? 'var(--tm-success-color)' : 'var(--tm-danger-color)'};">
                             ${netProfit >= 0 ? '▲' : '▼'} ${netProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                         </td>
                     </tr>
                 </tfoot>
             </table>`;

        return { error: null, stats: stats, tableHTML: tableHTML, processedRows: processedRows, totalRepairs: totalRepairs, totalRepairPrice: totalRepairPrice, totalParts: totalParts };
    }

    function initTechnicianStatsFeature() {
        // Access config and STORAGE_KEYS from window for global access
        const config = window.config || {};
        const STORAGE_KEYS = window.STORAGE_KEYS || {};
        
        // Check if modal already exists - if so, just refresh it
        const existingOverlay = document.querySelector('.tm-modal-overlay[data-tech-stats-modal]');
        if (existingOverlay) {
            // Refresh existing modal
            refreshTechnicianStatsModal(existingOverlay);
            return;
        }
        
        // Prevent creating multiple modals if one is already open (but not our stats modal)
        if (document.querySelector('.tm-modal-overlay:not([data-tech-stats-modal])')) {
            return;
        }
        
        // Scrape the data
        const result = scrapeTechnicianStats();
        
        if (result.error) {
            alert(result.error);
            return;
        }

        // 6. Create the modal UI
        console.log('[MMS] On service_list page, initializing Technician Stats feature.');

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.setAttribute('data-tech-stats-modal', 'true');
        overlay.innerHTML = `
            <div class="tm-modal-content">
                <div class="tm-modal-header">
                    <h2 class="tm-modal-title">Στατιστικά Τεχνικών (Τρέχουσα Σελίδα)</h2>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button id="tm-stats-refresh-btn" title="Ανανέωση δεδομένων" style="
                            background: var(--tm-shop-item-bg);
                            color: var(--tm-primary-color);
                            border: 1px solid var(--tm-shop-item-border);
                            width: 36px;
                            height: 36px;
                            padding: 0;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 18px;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">🔄</button>
                        <button class="tm-modal-close">&times;</button>
                    </div>
                </div>
                <div id="tm-stats-controls" style="
                    padding: 12px;
                    background: var(--tm-shop-item-bg);
                    border-bottom: 1px solid var(--tm-shop-item-border);
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                ">
                    <input type="text" id="tm-stats-search" placeholder="🔍 Αναζήτηση τεχνικού..." style="
                        flex: 1;
                        min-width: 200px;
                        padding: 8px 12px;
                        border: 1px solid var(--tm-shop-item-border);
                        border-radius: 6px;
                        background: var(--tm-shop-item-hover-bg);
                        color: var(--tm-dark-color);
                        font-size: 13px;
                    ">
                    <button id="tm-stats-clear-filters" style="
                        padding: 8px 16px;
                        border: 1px solid var(--tm-shop-item-border);
                        border-radius: 6px;
                        background: var(--tm-shop-item-bg);
                        color: var(--tm-dark-color);
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">🗑️ Καθαρισμός</button>
                </div>
                <div id="tm-stats-table-container" style="
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    min-height: 0;
                    padding-right: 8px;
                ">${result.tableHTML}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        console.log('[MMS Stats] Technician stats modal displayed.');

        // Store raw stats data for filtering/sorting
        overlay._statsData = result;
        overlay._sortField = 'profit';
        overlay._sortOrder = 'desc';
        
        // 7. Set up event listeners
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        
        // Refresh button event listener
        const refreshBtn = overlay.querySelector('#tm-stats-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                refreshTechnicianStatsModal(overlay);
            });
            
            // Add hover effects
            refreshBtn.addEventListener('mouseenter', () => {
                refreshBtn.style.background = 'var(--tm-success-color)';
                refreshBtn.style.color = 'var(--tm-shop-item-bg)';
                refreshBtn.style.transform = 'rotate(180deg) scale(1.1)';
                refreshBtn.style.boxShadow = '0 4px 12px var(--tm-success-color)';
            });
            refreshBtn.addEventListener('mouseleave', () => {
                refreshBtn.style.background = 'var(--tm-shop-item-bg)';
                refreshBtn.style.color = 'var(--tm-primary-color)';
                refreshBtn.style.transform = 'rotate(0deg) scale(1)';
                refreshBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            });
        }
        
        // Filter and sort controls
        setupStatsFilters(overlay);
        
        // Set initial sort indicator
        updateSortIndicators(overlay);
    }
    
    // Function to refresh the stats modal
    function refreshTechnicianStatsModal(overlay) {
        const container = overlay.querySelector('#tm-stats-table-container');
        const refreshBtn = overlay.querySelector('#tm-stats-refresh-btn');
        
        if (!container) return;
        
        // Show loading state
        if (refreshBtn) {
            refreshBtn.style.opacity = '0.5';
            refreshBtn.style.pointerEvents = 'none';
            refreshBtn.textContent = '⏳';
        }
        
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--tm-primary-color);">🔄 Ανανέωση δεδομένων...</div>';
        
        // Small delay to show loading state, then scrape
        setTimeout(() => {
            const result = scrapeTechnicianStats();
            
            if (result.error) {
                container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--tm-danger-color);">❌ ${result.error}</div>`;
            } else {
                // Store updated stats data
                overlay._statsData = result;
                // Re-apply current filters/sort
                applyStatsFilters(overlay);
                console.log('[MMS Stats] Technician stats refreshed.');
            }
            
            // Ensure scrollable styles are maintained after refresh
            if (!container.style.overflowY) {
                container.style.overflowY = 'auto';
                container.style.overflowX = 'hidden';
                container.style.flex = '1';
                container.style.minHeight = '0';
                container.style.paddingRight = '8px';
            }
            
            // Restore refresh button
            if (refreshBtn) {
                refreshBtn.style.opacity = '1';
                refreshBtn.style.pointerEvents = 'auto';
                refreshBtn.textContent = '🔄';
            }
        }, 300);
    }
    
    // Function to setup filter and sort controls
    function setupStatsFilters(overlay) {
        const searchInput = overlay.querySelector('#tm-stats-search');
        const clearBtn = overlay.querySelector('#tm-stats-clear-filters');
        const sortableHeaders = overlay.querySelectorAll('.tm-sortable-header');
        
        if (!searchInput) return;
        
        // Search input handler
        searchInput.addEventListener('input', () => {
            applyStatsFilters(overlay);
        });
        
        // Sortable header click handlers
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                if (overlay._sortField === sortField) {
                    // Toggle sort order if clicking same column
                    overlay._sortOrder = overlay._sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    // New column, default to ascending
                    overlay._sortField = sortField;
                    overlay._sortOrder = 'asc';
                }
                updateSortIndicators(overlay);
                applyStatsFilters(overlay);
            });
            
            // Add hover effect
            header.addEventListener('mouseenter', () => {
                header.style.background = 'var(--tm-shop-item-hover-bg)';
            });
            header.addEventListener('mouseleave', () => {
                if (overlay._sortField !== header.dataset.sort) {
                    header.style.background = 'var(--tm-shop-item-bg)';
                }
            });
        });
        
        // Clear filters button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                overlay._sortField = 'profit';
                overlay._sortOrder = 'desc';
                updateSortIndicators(overlay);
                applyStatsFilters(overlay);
            });
            
            // Add hover effect
            clearBtn.addEventListener('mouseenter', () => {
                clearBtn.style.background = 'var(--tm-danger-color)';
                clearBtn.style.color = 'var(--tm-shop-item-bg)';
                clearBtn.style.borderColor = 'var(--tm-danger-color)';
            });
            clearBtn.addEventListener('mouseleave', () => {
                clearBtn.style.background = 'var(--tm-shop-item-bg)';
                clearBtn.style.color = 'var(--tm-dark-color)';
                clearBtn.style.borderColor = 'var(--tm-shop-item-border)';
            });
        }
    }
    
    // Function to update sort indicators in headers
    function updateSortIndicators(overlay) {
        const sortableHeaders = overlay.querySelectorAll('.tm-sortable-header');
        sortableHeaders.forEach(header => {
            const indicator = header.querySelector('.tm-sort-indicator');
            const sortField = header.dataset.sort;
            
            if (overlay._sortField === sortField) {
                // Show indicator for active sort column
                indicator.textContent = overlay._sortOrder === 'asc' ? ' ▲' : ' ▼';
                indicator.style.color = 'var(--tm-primary-color)';
                header.style.background = 'var(--tm-shop-item-hover-bg)';
            } else {
                // Clear indicator for inactive columns
                indicator.textContent = '';
                header.style.background = 'var(--tm-shop-item-bg)';
            }
        });
    }
    
    // Function to apply filters and sorting
    function applyStatsFilters(overlay) {
        const container = overlay.querySelector('#tm-stats-table-container');
        const searchInput = overlay.querySelector('#tm-stats-search');
        const statsData = overlay._statsData;
        
        if (!container || !statsData || !statsData.stats) return;
        
        const searchTerm = (searchInput?.value || '').toLowerCase().trim();
        const sortField = overlay._sortField || 'profit';
        const sortOrder = overlay._sortOrder || 'desc';
        
        // Filter stats
        let filteredStats = {};
        if (searchTerm) {
            Object.keys(statsData.stats).forEach(tech => {
                if (tech.toLowerCase().includes(searchTerm)) {
                    filteredStats[tech] = statsData.stats[tech];
                }
            });
        } else {
            filteredStats = { ...statsData.stats };
        }
        
        // Sort stats
        const sortedTechs = Object.keys(filteredStats).sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'name':
                    comparison = a.localeCompare(b, 'el');
                    break;
                case 'repairs':
                    comparison = filteredStats[a].repairs - filteredStats[b].repairs;
                    break;
                case 'price':
                    comparison = filteredStats[a].totalRepairPrice - filteredStats[b].totalRepairPrice;
                    break;
                case 'parts':
                    comparison = filteredStats[a].totalParts - filteredStats[b].totalParts;
                    break;
                case 'profit':
                    const profitA = filteredStats[a].totalRepairPrice - filteredStats[a].totalParts;
                    const profitB = filteredStats[b].totalRepairPrice - filteredStats[b].totalParts;
                    comparison = profitA - profitB;
                    break;
            }
            
            return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        // Rebuild table HTML
        let rowsHTML = '';
        let totalRepairs = 0, totalRepairPrice = 0, totalParts = 0;
        
        for (const tech of sortedTechs) {
            const techNetProfit = filteredStats[tech].totalRepairPrice - filteredStats[tech].totalParts;
            rowsHTML += `
                <tr>
                    <td>${tech}</td>
                    <td>${filteredStats[tech].repairs}</td>
                    <td style="color: var(--tm-success-color);">${filteredStats[tech].totalRepairPrice.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                    <td style="color: var(--tm-danger-color);">${filteredStats[tech].totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                    <td style="color: ${techNetProfit >= 0 ? 'var(--tm-success-color)' : 'var(--tm-danger-color)'}; font-weight: 600;">
                        ${techNetProfit >= 0 ? '▲' : '▼'} ${techNetProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                    </td>
                </tr>`;
            totalRepairs += filteredStats[tech].repairs;
            totalRepairPrice += filteredStats[tech].totalRepairPrice;
            totalParts += filteredStats[tech].totalParts;
        }
        
        const netProfit = totalRepairPrice - totalParts;
        
        // Rebuild full HTML (preserve info box and summary)
        const tableHTML = `
             <div style="margin-bottom: 12px; padding: 10px; background: var(--tm-shop-item-bg); border-radius: 8px; font-size: 12px; color: var(--tm-secondary-hover); border: 1px solid var(--tm-shop-item-border);">
                 <strong>ℹ️ Σημείωση:</strong> Τα στατιστικά αφορούν μόνο τις επισκευές που εμφανίζονται στην τρέχουσα σελίδα (${statsData.processedRows} επισκευές). Για πλήρη στατιστικά, φορτώστε όλες τις σελίδες ή χρησιμοποιήστε την αναζήτηση.
                 ${searchTerm ? `<br><strong>🔍 Αποτελέσματα αναζήτησης:</strong> ${sortedTechs.length} τεχνικός/οί` : ''}
             </div>
             <div style="margin-bottom: 16px; padding: 16px; background: var(--tm-shop-item-bg); border-radius: 12px; border: 1px solid var(--tm-success-color);">
                 <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                     <div>
                         <div style="font-size: 11px; color: var(--tm-secondary-hover); margin-bottom: 4px; text-transform: uppercase;">💰 Συνολική Τιμή</div>
                         <div style="font-size: 20px; font-weight: bold; color: var(--tm-success-color);">${totalRepairPrice.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                     </div>
                     <div>
                         <div style="font-size: 11px; color: var(--tm-secondary-hover); margin-bottom: 4px; text-transform: uppercase;">🛠️ Ανταλλακτικά</div>
                         <div style="font-size: 20px; font-weight: bold; color: var(--tm-danger-color);">${totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</div>
                     </div>
                     <div>
                         <div style="font-size: 11px; color: var(--tm-secondary-hover); margin-bottom: 4px; text-transform: uppercase;">📊 Καθαρό Κέρδος</div>
                         <div style="font-size: 20px; font-weight: bold; color: ${netProfit >= 0 ? 'var(--tm-success-color)' : 'var(--tm-danger-color)'};">
                             ${netProfit >= 0 ? '▲' : '▼'} ${netProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                         </div>
                     </div>
                 </div>
             </div>
             <table class="table table-bordered table-striped" style="width: 100%; text-align: center; margin-top: 10px;">
                 <thead style="background-color: var(--tm-shop-item-bg);">
                     <tr>
                         <th class="tm-sortable-header" data-sort="name" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             Τεχνικός <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="repairs" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             Πλήθος Επισκευών <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="price" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             💰 Τιμή Επισκευής <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="parts" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             🛠️ Ανταλλακτικά <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                         <th class="tm-sortable-header" data-sort="profit" style="color: var(--tm-primary-color); cursor: pointer; user-select: none; padding: 12px; position: relative; transition: background 0.2s;">
                             📊 Καθαρό <span class="tm-sort-indicator" style="margin-left: 4px; font-size: 12px;"></span>
                         </th>
                     </tr>
                 </thead>
                 <tbody>${rowsHTML}</tbody>
                 <tfoot style="font-weight: bold; background-color: var(--tm-shop-item-bg);">
                     <tr>
                         <td style="color: var(--tm-primary-color);">ΣΥΝΟΛΟ</td>
                         <td style="color: var(--tm-primary-color);">${totalRepairs}</td>
                         <td style="color: var(--tm-success-color);">${totalRepairPrice.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                         <td style="color: var(--tm-danger-color);">${totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                         <td style="color: ${netProfit >= 0 ? 'var(--tm-success-color)' : 'var(--tm-danger-color)'};">
                             ${netProfit >= 0 ? '▲' : '▼'} ${netProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                         </td>
                     </tr>
                 </tfoot>
             </table>`;
        
        container.innerHTML = tableHTML;
        
        // Re-setup click handlers for sortable headers after rebuilding table
        setupStatsFilters(overlay);
        updateSortIndicators(overlay);
    }

    // Make functions globally accessible
    window.scrapeTechnicianStats = scrapeTechnicianStats;
    window.initTechnicianStatsFeature = initTechnicianStatsFeature;
    window.refreshTechnicianStatsModal = refreshTechnicianStatsModal;
    window.checkTechnicianStatsColumnsAvailable = checkTechnicianStatsColumnsAvailable;

})();

