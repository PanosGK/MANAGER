// ==UserScript==
// @name         MyManager Status Hover Preview
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Shows repair list preview when hovering over status menu items
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

/**
 * STATUS HOVER PREVIEW FEATURE
 * Shows a tooltip with the list of repairs when hovering over status menu items
 */
function initStatusHoverPreview() {
    console.log('[MMS Status Hover] Initializing hover preview...');
    
    // Wait for the menu to be available
    const checkInterval = setInterval(() => {
        const statusMenu = document.querySelector('.rnr-b-vmenu.simple.main.initialized');
        if (statusMenu) {
            clearInterval(checkInterval);
            setupHoverPreviews(statusMenu);
        }
    }, 500);
    
    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
}

function setupHoverPreviews(statusMenu) {
    const menuLinks = statusMenu.querySelectorAll('a[href*="service_list.php"]');
    
    menuLinks.forEach(link => {
        // Skip if already processed
        if (link.dataset.hoverProcessed) return;
        link.dataset.hoverProcessed = 'true';
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Create tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'tm-status-hover-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #ced4da;
            border-radius: 6px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            max-height: 500px;
            overflow-y: auto;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;
        document.body.appendChild(tooltip);
        
        let showTimeout;
        let hideTimeout;
        let isVisible = false;
        
        // Show tooltip on hover
        link.addEventListener('mouseenter', (e) => {
            clearTimeout(hideTimeout);
            showTimeout = setTimeout(() => {
                showTooltip(e, tooltip, href, link);
                isVisible = true;
            }, 500); // 500ms delay before showing
        });
        
        // Hide tooltip when mouse leaves (with delay)
        link.addEventListener('mouseleave', () => {
            clearTimeout(showTimeout);
            hideTimeout = setTimeout(() => {
                if (!tooltip.matches(':hover')) {
                    hideTooltip(tooltip);
                    isVisible = false;
                }
            }, 200); // 200ms delay before hiding
        });
        
        // Keep tooltip visible when hovering over it
        tooltip.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            clearTimeout(showTimeout);
        });
        
        // Hide when leaving tooltip
        tooltip.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                hideTooltip(tooltip);
                isVisible = false;
            }, 200);
        });
        
        // Store references for loading
        link._tooltip = tooltip;
        link._cachedContent = null;
    });
    
    console.log('[MMS Status Hover] Setup complete for', menuLinks.length, 'menu items');
}

function showTooltip(event, tooltip, href, link) {
    // Position tooltip near the link with some overlap area for smooth hover
    const rect = link.getBoundingClientRect();
    tooltip.style.left = (rect.right + 5) + 'px'; // Reduced gap for easier hover transition
    tooltip.style.top = rect.top + 'px';
    tooltip.style.display = 'block';
    
    // Check if we have cached content
    if (link._cachedContent) {
        tooltip.innerHTML = link._cachedContent;
        // Re-attach event listeners for cached content
        attachRepairCardListeners(tooltip);
        return;
    }
    
    // Show loading state
    tooltip.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
            <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
            <div>Φόρτωση επισκευών...</div>
        </div>
    `;
    
    // Load the page and scrape repairs
    loadRepairs(href, tooltip, link);
}

function attachRepairCardListeners(tooltip) {
    // Add click handlers to repair cards
    tooltip.querySelectorAll('.tm-repair-card').forEach(card => {
        const repairLink = card.dataset.link;
        
        // Remove old listeners by cloning (prevents duplicate listeners)
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Add hover effect
        newCard.addEventListener('mouseenter', () => {
            newCard.style.background = '#e9ecef';
            newCard.style.transform = 'translateX(3px)';
        });
        
        newCard.addEventListener('mouseleave', () => {
            newCard.style.background = '#f8f9fa';
            newCard.style.transform = 'translateX(0)';
        });
        
        // Navigate on click
        newCard.addEventListener('click', () => {
            window.location.href = repairLink;
        });
    });
}

function hideTooltip(tooltip) {
    tooltip.style.display = 'none';
}

function loadRepairs(url, tooltip, link) {
    // Make the URL absolute if needed, ensuring proper path
    let fullUrl = url;
    if (!url.startsWith('http')) {
        // If the URL doesn't start with a slash, it's a relative path
        if (!url.startsWith('/')) {
            // Add /mymanagerservice/ prefix for relative paths
            fullUrl = window.location.origin + '/mymanagerservice/' + url;
        } else {
            // Already has leading slash, just add origin
            fullUrl = window.location.origin + url;
        }
    }
    
    console.log('[MMS Status Hover] Loading repairs from:', fullUrl);
    
    // Use fetch instead of GM_xmlhttpRequest since we're on the same domain
    fetch(fullUrl)
        .then(response => response.text())
        .then(html => {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Find the repairs table
                const repairsTable = doc.querySelector('.rnr-c-grid.rnr-b-grid.rnr-gridtable.hoverable');
                
                if (!repairsTable) {
                    tooltip.innerHTML = `
                        <div style="color: #856404; padding: 10px; background: #fff3cd; border-radius: 4px;">
                            ⚠️ Δεν βρέθηκε πίνακας επισκευών
                        </div>
                    `;
                    return;
                }
                
                // Extract repair data
                const repairs = extractRepairData(repairsTable);
                
                if (repairs.length === 0) {
                    tooltip.innerHTML = `
                        <div style="color: #004085; padding: 10px; background: #cce5ff; border-radius: 4px;">
                            ℹ️ Δεν υπάρχουν επισκευές
                        </div>
                    `;
                    link._cachedContent = tooltip.innerHTML;
                    return;
                }
                
                // Display repairs
                const content = formatRepairsList(repairs);
                tooltip.innerHTML = content;
                link._cachedContent = content;
                
                // Attach click handlers to repair cards
                attachRepairCardListeners(tooltip);
                
                console.log('[MMS Status Hover] Loaded', repairs.length, 'repairs');
                
            } catch (error) {
                console.error('[MMS Status Hover] Error parsing repairs:', error);
                tooltip.innerHTML = `
                    <div style="color: #721c24; padding: 10px; background: #f8d7da; border-radius: 4px;">
                        ❌ Σφάλμα φόρτωσης
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('[MMS Status Hover] Request failed:', error);
            tooltip.innerHTML = `
                <div style="color: #721c24; padding: 10px; background: #f8d7da; border-radius: 4px;">
                    ❌ Αποτυχία φόρτωσης
                </div>
            `;
        });
}

function extractRepairData(table) {
    const repairs = [];
    
    // Find column indices by header names
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const columnIndices = {
        repairId: headers.findIndex(h => h.includes('Αρ.')),
        customer: headers.findIndex(h => h.includes('Πελάτης')),
        phone: headers.findIndex(h => h.includes('Τηλέφωνο')),
        device: headers.findIndex(h => h.includes('Συσκευή'))
    };
    
    console.log('[MMS Status Hover] Found columns:', columnIndices);
    
    const rows = table.querySelectorAll('tbody tr[id^="gridRow"]');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        
        // Extract data from the correct columns
        const repairId = columnIndices.repairId >= 0 ? cells[columnIndices.repairId]?.textContent.trim() : '';
        const customer = columnIndices.customer >= 0 ? cells[columnIndices.customer]?.textContent.trim() : '';
        const phone = columnIndices.phone >= 0 ? cells[columnIndices.phone]?.textContent.trim() : '';
        const device = columnIndices.device >= 0 ? cells[columnIndices.device]?.textContent.trim() : '';
        const link = row.querySelector('a[href*="service_edit.php"]')?.href || '';
        
        if (repairId) {
            repairs.push({ repairId, customer, phone, device, link });
        }
    });
    
    return repairs;
}

function formatRepairsList(repairs) {
    const maxDisplay = 20;
    const displayRepairs = repairs.slice(0, maxDisplay);
    const hasMore = repairs.length > maxDisplay;
    
    let html = `
        <div style="font-weight: 600; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #e9ecef;">
            📋 Επισκευές (${repairs.length})
        </div>
        <div style="font-size: 13px;">
    `;
    
    displayRepairs.forEach(repair => {
        html += `
            <div class="tm-repair-card" data-link="${repair.link}" style="padding: 8px; margin-bottom: 6px; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #00d4ff; cursor: pointer; transition: all 0.2s ease;">
                <div style="font-weight: 600; color: #495057; margin-bottom: 4px;">
                    #${repair.repairId}
                </div>
                <div style="color: #6c757d; font-size: 12px;">
                    👤 ${repair.customer}
                </div>
                ${repair.phone ? `<div style="color: #6c757d; font-size: 12px;">📞 ${repair.phone}</div>` : ''}
                <div style="color: #6c757d; font-size: 12px;">
                    📱 ${repair.device}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    if (hasMore) {
        html += `
            <div style="text-align: center; padding: 8px; margin-top: 8px; color: #6c757d; font-size: 12px; border-top: 1px solid #e9ecef;">
                +${repairs.length - maxDisplay} ακόμα...
            </div>
        `;
    }
    
    return html;
}

// Make the function globally available
if (typeof window !== 'undefined') {
    window.initStatusHoverPreview = initStatusHoverPreview;
}

