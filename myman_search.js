// ==UserScript==
// @name         MyManager Search
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Advanced Search module for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function initSearchFeature() {
        const config = window.config || {};
        const STORAGE_KEYS = window.STORAGE_KEYS || {};

        console.log('[MMS] Search Feature: Initializing with config:', {
            searchFeatureEnabled: config.searchFeatureEnabled,
            hasConfig: !!config,
            hasStorageKeys: !!STORAGE_KEYS,
            configKeys: Object.keys(config).length
        });

        if (!config.searchFeatureEnabled) {
            console.log('[MMS] Search Feature: DISABLED - searchFeatureEnabled is', config.searchFeatureEnabled);
            return;
        }
        
        console.log('[MMS] Search Feature: ENABLED - Proceeding with initialization');

        /**
         * Creates the main container on the right side of the screen for slide-out buttons.
         * This is called early to ensure the container exists for other features.
         */
        function createRightSidePanel() {
            if (document.getElementById('tm-search-container')) return; // Already exists

            const container = document.createElement('div');
            container.id = 'tm-search-container';
            document.body.appendChild(container);
            console.log('[MMS] Right-side panel container created.');
        }
        createRightSidePanel(); // Ensure the panel exists

        // --- Feature-specific Constants ---
        const QUICK_SEARCH_HIDDEN_KEY = 'tm_quick_search_hidden';

        // --- Configuration & Constants ---
        const SEARCH_URLS = [
            '/mymanagerservice/srvorders_list.php?pagesize=-1',      // Merchandise Orders
            '/mymanagerservice/sparepartstoorder_list.php?pagesize=-1' // Spare Parts Orders
        ];

        // State Variables
        let searchResults = []; // Holds results from a search
        let searchTerms = []; // Holds the split terms of the current query

        function createSearchModal() {
            if (document.querySelector('.tm-modal-overlay')) return; // Prevent multiple modals

            const overlay = document.createElement('div');
            overlay.className = 'tm-modal-overlay';
            // Enable hacker theme automatically when matrix theme is active
            const currentTheme = GM_getValue('equippedTheme', 'default');
            overlay.classList.toggle('tm-hacker-theme-enabled', currentTheme === 'matrix');
            overlay.innerHTML = `
                <div class="tm-modal-content">
                    <div class="tm-modal-header">
                        <h2 class="tm-modal-title">Αναζήτηση Παραγγελίας</h2>
                        <button class="tm-modal-close">&times;</button>
                    </div>
                    <div id="tm-search-input-area">
                        <input type="text" id="tm-search-input" placeholder="Αρ. Παραγγελίας, Όνομα, Ανταλλακτικό...">
                        <button id="tm-search-favorite-btn" title="Προσθήκη στα Αγαπημένα">&#9734;</button>
                        <button id="tm-search-submit">Αναζήτηση</button>
                    </div>
                    <div id="tm-search-history-favorites-container">
                        <div class="tm-search-list-section">
                            <h4>Πρόσφατες Αναζητήσεις</h4>
                            <ul id="tm-search-history-list" class="tm-search-list"></ul>
                        </div>
                        <div class="tm-search-list-section">
                            <h4>Αγαπημένες Αναζητήσεις</h4>
                            <ul id="tm-search-favorites-list" class="tm-search-list"></ul>
                        </div>
                    </div>
                    <div id="tm-results-container">
                        <div id="tm-status-message">Εισάγετε έναν όρο αναζήτησης για να ξεκινήσετε.</div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            renderHistoryAndFavorites(overlay, config, STORAGE_KEYS);

            // Event Listeners
            overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            overlay.querySelector('#tm-search-submit').addEventListener('click', handleSearchSubmit);

            const searchInput = overlay.querySelector('#tm-search-input');
            const favoriteBtn = overlay.querySelector('#tm-search-favorite-btn');

            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') handleSearchSubmit();
                updateFavoriteButtonState(searchInput.value, favoriteBtn, STORAGE_KEYS);
            });

            favoriteBtn.addEventListener('click', () => {
                toggleFavoriteSearch(searchInput.value, favoriteBtn, STORAGE_KEYS);
                renderHistoryAndFavorites(overlay, config, STORAGE_KEYS); // Re-render to show changes
            });

            updateFavoriteButtonState(searchInput.value, favoriteBtn, STORAGE_KEYS);

            // Auto-focus the input field for immediate typing
            setTimeout(() => searchInput.focus(), 100);
        }

        // --- History & Favorites Logic ---
        function getSearchHistory(STORAGE_KEYS) {
            try {
                const data = GM_getValue(STORAGE_KEYS.SEARCH_HISTORY_KEY, '[]');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('[MMS Search] Error parsing search history:', e);
                return [];
            }
        }
        function saveSearchHistory(STORAGE_KEYS, history) { GM_setValue(STORAGE_KEYS.SEARCH_HISTORY_KEY, JSON.stringify(history)); }

        function getFavoriteSearches(STORAGE_KEYS) {
            try {
                const data = GM_getValue(STORAGE_KEYS.FAVORITE_SEARCHES_KEY, '[]');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('[MMS Search] Error parsing favorite searches:', e);
                return [];
            }
        }
        function saveFavoriteSearches(STORAGE_KEYS, favorites) { GM_setValue(STORAGE_KEYS.FAVORITE_SEARCHES_KEY, JSON.stringify(favorites)); }

        function addSearchToHistory(query, config, STORAGE_KEYS) {
            if (!query) return;
            let history = getSearchHistory(STORAGE_KEYS);
            // Remove existing instance to move it to the top
            history = history.filter(item => item !== query);
            // Add to the front
            history.unshift(query);
            // Trim to max length
            if (history.length > config.searchMaxHistory) {
                history.length = config.searchMaxHistory;
            }
            saveSearchHistory(STORAGE_KEYS, history);
        }

        function toggleFavoriteSearch(query, starButton, STORAGE_KEYS) {
            if (!query) return;
            let favorites = getFavoriteSearches(STORAGE_KEYS);
            const index = favorites.indexOf(query);

            if (index > -1) { // It's already a favorite, so remove it
                favorites.splice(index, 1);
            } else { // Not a favorite, so add it
                favorites.unshift(query);
            }
            saveFavoriteSearches(STORAGE_KEYS, favorites);
            updateFavoriteButtonState(query, starButton, STORAGE_KEYS);
        }

        function updateFavoriteButtonState(query, starButton, STORAGE_KEYS) {
            if (!starButton) return;
            const favorites = getFavoriteSearches(STORAGE_KEYS);
            if (query && favorites.includes(query)) {
                starButton.innerHTML = '&#9733;'; // Solid star
                starButton.classList.add('favorited');
                starButton.title = 'Αφαίρεση από τα Αγαπημένα';
            } else {
                starButton.innerHTML = '&#9734;'; // Outline star
                starButton.classList.remove('favorited');
                starButton.title = 'Προσθήκη στα Αγαπημένα';
            }
        }

        function renderHistoryAndFavorites(modal, config, STORAGE_KEYS) {
            const historyList = modal.querySelector('#tm-search-history-list');
            const favoritesList = modal.querySelector('#tm-search-favorites-list');

            historyList.innerHTML = '';
            favoritesList.innerHTML = '';

            // Render History
            const history = getSearchHistory(STORAGE_KEYS);
            if (history.length === 0) {
                historyList.innerHTML = '<li style="color: #888; font-style: italic;">Δεν υπάρχουν πρόσφατες αναζητήσεις.</li>';
            } else {
                history.forEach(query => {
                    const li = document.createElement('li');
                    li.className = 'tm-search-list-item';
                    li.innerHTML = `<a href="#" title="Αναζήτηση για: ${query}">${query}</a>`;
                    li.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        performSearchInModal(query, config, STORAGE_KEYS);
                    });
                    historyList.appendChild(li);
                });
            }

            // Render Favorites
            const favorites = getFavoriteSearches(STORAGE_KEYS);
            if (favorites.length === 0) {
                favoritesList.innerHTML = '<li style="color: #888; font-style: italic;">Δεν υπάρχουν αγαπημένες αναζητήσεις.</li>';
            } else {
                favorites.forEach(query => {
                    const li = document.createElement('li');
                    li.className = 'tm-search-list-item';
                    li.innerHTML = `
                        <a href="#" title="Αναζήτηση για: ${query}">${query}</a>
                        <button class="tm-search-list-action-btn" title="Αφαίρεση Αγαπημένου">&#128465;</button>
                    `;
                    li.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); performSearchInModal(query, config, STORAGE_KEYS); });
                    li.querySelector('button').addEventListener('click', () => {
                        toggleFavoriteSearch(query, modal.querySelector('#tm-search-favorite-btn'), STORAGE_KEYS);
                        renderHistoryAndFavorites(modal, config, STORAGE_KEYS); // Re-render after removal
                    });
                    favoritesList.appendChild(li);
                });
            }
        }

        function addMainButton() {
            const container = document.getElementById('tm-search-container');
            if (!container) return;

            const button = document.createElement('button');
            button.id = 'tm-search-btn';
            button.className = 'tm-slide-out-btn'; // Pass config
            button.textContent = 'Αναζήτηση Παραγγελίας';
            button.addEventListener('click', createSearchModal);

            container.appendChild(button);

            if (config.levelUpSystemEnabled) {
                // Add Daily Bounties button
                const questsButton = document.createElement('button');
                questsButton.id = 'tm-quests-btn';
                questsButton.className = 'tm-slide-out-btn';
                questsButton.innerHTML = '📜 Daily Bounties';
                questsButton.addEventListener('click', () => window.showQuestsModal(config, STORAGE_KEYS));
                container.appendChild(questsButton);
            }

            // Add Technician Stats button if on the correct page
            // This function is called on 'window.load', so the DOM is already ready.
            const isOnServiceListPage = window.location.pathname.includes('/mymanagerservice/service_list.php');
            const isView105 = new URLSearchParams(window.location.search).get('view') === '105';

            let status105Count = 0;
            if (isOnServiceListPage && isView105) {
                const gridTable = document.querySelector('table.rnr-b-grid');
                if (gridTable) {
                    const allHeaders = Array.from(gridTable.querySelectorAll('thead th'));
                    const headerTexts = allHeaders.map(th => th.innerText.trim());
                    const statusIndex = headerTexts.findIndex(text => text.includes('Κατάσταση'));

                    if (statusIndex !== -1) {
                        const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"]');
                        rows.forEach(row => {
                            const statusCell = row.cells[statusIndex];
                            // The status is inside a span with an ID like 'edit5_ccc_iStatusID'
                            const statusSpan = statusCell ? statusCell.querySelector('span[id$="_ccc_iStatusID"]') : null;
                            if (statusSpan && statusSpan.innerText.trim() === '105') {
                                status105Count++;
                            }
                        });
                    }
                }
            }

            if (config.technicianStatsEnabled && isOnServiceListPage && isView105 && status105Count >= 10) {
                const statsButton = document.createElement('button');
                statsButton.id = 'tm-tech-stats-btn';
                statsButton.innerHTML = '📊 Στατιστικά Τεχνικών';
                statsButton.className = 'tm-slide-out-btn'; // Pass config
                statsButton.onclick = window.initTechnicianStatsFeature; // Use onclick to prevent multiple listeners
                container.appendChild(statsButton);
            }
        }

        function updateQuickSearchButtons(phoneModel) {
            const container = document.getElementById('tm-quick-search-container');
            if (!container) return;

            console.log('[MMS] Updating quick search buttons with phone model:', phoneModel);

            // Update all existing buttons with the phone model
            const buttons = container.querySelectorAll('a[data-term]');
            buttons.forEach(button => {
                const originalTerm = button.dataset.originalTerm || button.dataset.term;
                if (!button.dataset.originalTerm) {
                    button.dataset.originalTerm = originalTerm;
                }
                const newSearchTerm = `${phoneModel} ${originalTerm}`;
                button.dataset.term = newSearchTerm;
                button.title = `Αναζήτηση για: "${newSearchTerm}"`;
                console.log('[MMS] Updated button:', button.textContent, '->', newSearchTerm);
            });
        }

        // Global function to manually refresh phone model detection
        window.refreshPhoneModelDetection = function() {
            const phoneModel = window.getPhoneModelFromPage();
            console.log('[MMS] Manual phone model refresh:', phoneModel || 'None');
            if (phoneModel) {
                updateQuickSearchButtons(phoneModel);
                if (window.showPositiveMessage) {
                    window.showPositiveMessage(`📱 Phone model detected: ${phoneModel}`);
                }
            } else {
                if (window.showPositiveMessage) {
                    window.showPositiveMessage('❌ No phone model detected. Check console for details.');
                }
            }
            return phoneModel;
        };

        function createQuickSearchPanel() {
            if (!config.quickSearchEnabled) return;

            // Get phone model with retry mechanism for dynamic content
            let phoneModel = window.getPhoneModelFromPage();
            console.log('[MMS] Initial phone model detection:', phoneModel || 'None');

            // If no phone model detected initially, try again after a short delay
            if (!phoneModel) {
                setTimeout(() => {
                    phoneModel = window.getPhoneModelFromPage();
                    console.log('[MMS] Retry phone model detection:', phoneModel || 'None');
                    // If we found a phone model on retry, we'll need to update the buttons
                    if (phoneModel) {
                        updateQuickSearchButtons(phoneModel);
                    }
                }, 1000);
            }


            // The content of the "Spare Parts" tab is loaded dynamically.
            // We must use a MutationObserver to wait for the target element to appear.
            const observer = new MutationObserver((mutations, obs) => {
                // The target is the "Add" button inside the spare parts tab's content.
                // The tab's content is inside a div with id="detailPreview3"
                const sparePartsTabContent = document.getElementById('detailPreview3');
                if (!sparePartsTabContent) return; // Not loaded yet

                const addButton = sparePartsTabContent.querySelector('a[id^="inlineAdd"]');
                if (addButton) {
                    console.log('[MMS] Quick Search: Found the "Add" button in the spare parts tab.');
                    console.log('[MMS] Add button classes:', addButton.className);

                    // Check if we've already added the container to prevent duplicates
                    if (addButton.parentElement.querySelector('#tm-quick-search-container')) {
                        obs.disconnect(); // Already added, stop observing
                        return;
                    }

                    // Create a main container for the tags
                    const container = document.createElement('div');
                    container.id = 'tm-quick-search-container';

                    const panel = document.createElement('div');
                    panel.id = 'tm-quick-search-panel';

                    config.quickSearchButtons.forEach(buttonInfo => {
                        const button = document.createElement('a');
                        const searchTerm = phoneModel ? `${phoneModel} ${buttonInfo.term}` : buttonInfo.term;

                        button.textContent = buttonInfo.label;
                        // Copy the exact classes from the Add button
                        button.className = addButton.className || 'rnr-button';
                        button.href = '#';
                        button.title = `Αναζήτηση για: "${searchTerm}"`;
                        button.dataset.term = searchTerm;
                        button.dataset.originalTerm = buttonInfo.term; // Store original term for later updates
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            handleQuickSearchClick(e);
                        });
                        panel.appendChild(button);
                    });
                    container.appendChild(panel);

                    // Insert the container right after the "Add" button
                    addButton.parentElement.insertBefore(container, addButton.nextSibling);

                    obs.disconnect(); // We're done, stop observing to save resources
                }
            });

            // Start observing the document for changes to find our target
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Helper to perform a search from anywhere (e.g., history, quick actions)
        function performSearchInModal(query, config, STORAGE_KEYS) {
            const modal = document.querySelector('.tm-modal-overlay');
            if (!modal) {
                // If modal isn't open, open it and then search
                createSearchModal(config, STORAGE_KEYS);
                // Need to wait a moment for the modal to be in the DOM
                setTimeout(() => performSearchInModal(query, config, STORAGE_KEYS), 100);
                return;
            }

            const searchInput = modal.querySelector('#tm-search-input');
            const searchButton = modal.querySelector('#tm-search-submit');

            if (searchInput && searchButton) {
                searchInput.value = query;
                searchButton.click();
            }
        }

        // --- Search Logic ---
        function handleSearchSubmit() {
            const input = document.getElementById('tm-search-input');
            const submitBtn = document.getElementById('tm-search-submit');
            const resultsContainer = document.getElementById('tm-results-container');

            const query = input.value.trim();
            console.log('[MMS] Search: handleSearchSubmit called with query:', query);
            
            if (!query) {
                console.log('[MMS] Search: Empty query, returning early');
                return;
            }

            window.trackDailyStat(config, STORAGE_KEYS, 'searches');
            addSearchToHistory(query, config, STORAGE_KEYS);
            renderHistoryAndFavorites(document.querySelector('.tm-modal-overlay'), config, STORAGE_KEYS); // Update history live

            // Split the query by spaces or commas for an "AND" search where all terms must match.
            searchTerms = query.split(/[\s,]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
            console.log('[MMS] Search: Search terms:', searchTerms);
            
            if (searchTerms.length === 0) {
                console.log('[MMS] Search: No valid search terms, returning early');
                return;
            }

            searchResults = [];
            processedUrls.clear();
            console.log('[MMS] Search: Starting search with URLs:', SEARCH_URLS);
            submitBtn.disabled = true;
            submitBtn.textContent = 'Αναζήτηση...';

            let terminalInterval = null;

            // Use hacker search effects when matrix theme is active
            const currentTheme = GM_getValue('equippedTheme', 'default');
            if (currentTheme === 'matrix') {
                resultsContainer.innerHTML = `<div id="tm-hacker-terminal"><div id="tm-hacker-output"></div><span class="tm-hacker-cursor"></span></div>`;
                const hackerOutput = document.getElementById('tm-hacker-output');
                const hackerLines = [
                    'Booting MyManager All-in-One Suite v1.0...',
                    'Establishing connection to thefixers.mymanager.gr...',
                    'Connection successful. Bypassing security protocols...',
                    'Accessing main database...',
                    'Injecting search query: ' + query,
                    'Compiling data streams...',
                    'Filtering results through quantum entanglement matrix...',
                    'Parsing HTML nodes... 10%...',
                    'Parsing HTML nodes... 30%...',
                    'Parsing HTML nodes... 70%...',
                    'Decompressing data packets...',
                    'Finalizing results...',
                    '<span class="tm-hacker-success">QUERY EXECUTED SUCCESSFULLY</span>'
                ];

                let lineIndex = 0;
                terminalInterval = setInterval(() => {
                    if (lineIndex < hackerLines.length) {
                        const lineDiv = document.createElement('div');
                        lineDiv.innerHTML = hackerLines[lineIndex];
                        hackerOutput.appendChild(lineDiv);
                        hackerOutput.parentElement.scrollTop = hackerOutput.parentElement.scrollHeight;
                        lineIndex++;
                    } else {
                        clearInterval(terminalInterval);
                    }
                }, 250);
            } else {
                resultsContainer.innerHTML = `<div id="tm-status-message" class="tm-minimal-loader"><div class="tm-spinner"></div>Αναζήτηση...</div>`;
            }

            // This function will be called when the search is complete.
            const onSearchComplete = () => {
                window.setMascotState(config, 'idle');
                if (terminalInterval) clearInterval(terminalInterval);
                // A small delay to let the "SUCCESS" message be seen if using hacker theme
                // Add delay for matrix theme hacker effects
                const currentTheme = GM_getValue('equippedTheme', 'default');
                setTimeout(displayResults, currentTheme === 'matrix' ? 500 : 0);
            };

            if (config.interactiveMascotEnabled) window.setMascotState(config, 'searching');
            urlsToProcess = [...SEARCH_URLS]; // Re-initialize the queue with the base URLs
            processNextUrl(onSearchComplete, config); // Start the search
        }

        function handleQuickSearchClick(event) {
            const term = event.target.dataset.term;
            if (!term) return;

            const baseUrl = '/mymanagerservice/products_list.php';
            // The term is already formatted (e.g., "POCO X3 GT, LCD"), so we just need to URL-encode it.
            const searchUrl = `${baseUrl}?qs=${encodeURIComponent(term)}`;

            window.open(searchUrl, '_blank');
            window.trackDailyStat(config, STORAGE_KEYS, 'searches'); // Grant XP for using quick search
        }

        let urlsToProcess = [];
        let processedUrls = new Set();
        let activeSearchRequests = 0;

        // This function remains within initSearchFeature as it's specific to the search modal's operation
        function processNextUrl(onComplete) {
            if (urlsToProcess.length === 0) {
                if (activeSearchRequests === 0 && onComplete) onComplete();
                return;
            }

            const url = urlsToProcess.shift();
            // If we have already processed this exact URL, skip to the next one.
            if (processedUrls.has(url)) {
                processNextUrl(onComplete);
                return;
            }
            // Mark the URL as processed *before* the request to avoid race conditions.
            // where a page might be added to the queue multiple times.
            processedUrls.add(url);

            activeSearchRequests++; // Increment for the new request
            console.log(`Searching in: ${url} for terms:`, searchTerms);

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    console.log(`[MMS] Search: Successfully fetched ${url}, response status:`, response.status);
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    console.log(`[MMS] Search: Parsed HTML, looking for rows in page`);
                    parseAndSearchPage(doc, response.finalUrl);
                    activeSearchRequests--; // Decrement after processing
                    console.log(`[MMS] Search: Active requests remaining:`, activeSearchRequests);
                    // Process the next URL in the queue if there is one
                    if (urlsToProcess.length > 0) {
                        processNextUrl(onComplete);
                    } else if (activeSearchRequests === 0) {
                        // Only call onComplete when all requests are finished
                        console.log(`[MMS] Search: All requests completed, calling onComplete`);
                        if (onComplete) onComplete();
                    }
                },
                onerror: function(error) {
                    console.error(`[MMS] Search: Error fetching ${url}:`, error);
                    activeSearchRequests--; // Decrement on error too
                    if (urlsToProcess.length > 0) processNextUrl(onComplete);
                }
            });
        }

        // This function remains within initSearchFeature as it's specific to the search modal's operation
        function parseAndSearchPage(doc, pageBaseUrl) {
            console.log(`[MMS] Search: parseAndSearchPage called for URL:`, pageBaseUrl);
            
            doc.querySelectorAll('.pagination a').forEach(a => {
                const pageHref = a.getAttribute('href');
                if (pageHref && !pageHref.startsWith('javascript:')) {
                    const absoluteUrl = new URL(pageHref, pageBaseUrl).href;
                    if (!processedUrls.has(absoluteUrl)) {
                        urlsToProcess.push(absoluteUrl);
                    }
                }
            });

            const rows = doc.querySelectorAll('tbody tr');
            console.log(`[MMS] Search: Found ${rows.length} rows to process in this page`);
            
            let matchCount = 0;
            rows.forEach(row => {
                const rowText = row.innerText.toLowerCase();
                // Check if the row text includes ALL search terms (AND logic)
                const allTermsMatch = searchTerms.every(term => rowText.includes(term));

                if (allTermsMatch) {
                    matchCount++;
                    console.log(`[MMS] Search: Found matching row:`, rowText.substring(0, 100) + '...');
                    const linkUrl = window.findOrderLink(row, pageBaseUrl);
                    console.log(`[MMS] Search: Link URL for match:`, linkUrl);

                    if (linkUrl && !searchResults.some(r => r.orderLink === linkUrl)) {
                        searchResults.push({
                            term: document.getElementById('tm-search-input').value.trim(),
                            rowHTML: row.innerHTML,
                            orderLink: linkUrl
                        });
                        console.log(`[MMS] Search: Added result to searchResults. Total results:`, searchResults.length);
                    } else {
                        console.log(`[MMS] Search: Skipped result - no link URL or duplicate`);
                    }
                }
            });
            console.log(`[MMS] Search: Processed ${rows.length} rows, found ${matchCount} matches in this page`);
        }

        // --- Results & Printing ---
        function toggleOrderDetails(result, itemDiv) {
            console.log('[MMS] Toggling details for:', result);
            const existingDetails = itemDiv.querySelector('.tm-result-details-container');

            // If details are already visible, remove them to collapse the view.
            if (existingDetails) {
                existingDetails.remove();
                return;
            }

            console.log('[MMS] Creating details container and fetching from:', result.orderLink);
            // Create a container and show a loading message.
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'tm-result-details-container';
            detailsContainer.innerHTML = '<div class="tm-details-loading">Φόρτωση λεπτομερειών...</div>';
            itemDiv.appendChild(detailsContainer);

            GM_xmlhttpRequest({
                method: 'GET',
                url: result.orderLink,
                onload: function(response) {
                    console.log('[MMS] Successfully fetched order details page.');
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const details = window.scrapeOrderDetails(doc);
                    console.log('[MMS] Scraped details object:', details);

                    let detailsHTML = '<table class="tm-details-table">';
                    details.fields.forEach(field => {
                        detailsHTML += `
                                <tr>
                                    <td class="tm-details-label">${field.label}</td>
                                    <td class="tm-details-value">${field.value}</td>
                                </tr>`;
                    });
                    detailsHTML += '</table>';
                    detailsContainer.innerHTML = detailsHTML;

                },
                onerror: function(error) {
                    console.error('[MMS] Failed to fetch order details:', error);
                    detailsContainer.innerHTML = '<div class="tm-details-error">Αποτυχία φόρτωσης λεπτομερειών.</div>';
                }
            });
        }

        function displayResults() {
            const resultsContainer = document.getElementById('tm-results-container');
            const submitBtn = document.getElementById('tm-search-submit');
            const input = document.getElementById('tm-search-input');

            console.log('[MMS] Search: displayResults called with', searchResults.length, 'results');

            if (searchResults.length === 0) {
                console.log('[MMS] Search: No results found, displaying empty message');
                resultsContainer.innerHTML = `<div id="tm-status-message">Δεν βρέθηκαν αποτελέσματα για "${input.value}". Δοκιμάστε ξανά.</div>`;
            } else {
                console.log('[MMS] Search: Displaying', searchResults.length, 'results');
                if (config.confettiEnabled) window.triggerConfetti(30); // Fun: Confetti on successful search
                resultsContainer.innerHTML = '';
                searchResults.forEach((result, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'tm-result-item';

                    // Highlight all search terms
                    let highlightedHTML = result.rowHTML;
                    searchTerms.forEach(term => {
                        const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                        highlightedHTML = highlightedHTML.replace(regex, `<span class="tm-result-highlight">$&</span>`);
                    });

                    itemDiv.innerHTML = `
                        <div class="tm-result-header">
                            <span>Αποτέλεσμα #${index + 1} (Βρέθηκε για: ${result.term})</span>
                            <div>
                                ${result.orderLink ? `<a href="${result.orderLink}" target="_blank" class="tm-goto-btn">Μετάβαση στην Παραγγελία</a>` : ''}
                                ${result.orderLink ? `<button class="tm-print-btn" data-link="${result.orderLink}">Εκτύπωση Παραγγελίας</button>` : ''}
                            </div>
                        </div>
                        <div class="tm-result-body">
                            <table class="tm-result-table">${highlightedHTML}</table>
                        </div>
                    `;
                    resultsContainer.appendChild(itemDiv);

                    // Make the result body clickable if it has an order link
                    if (result.orderLink) {
                        const resultBody = itemDiv.querySelector('.tm-result-body');
                        console.log(`[MMS] Result #${index + 1}: Found orderLink: ${result.orderLink}. Attaching click listener.`);
                        if (resultBody) {
                            resultBody.classList.add('tm-result-clickable');
                            resultBody.title = 'Κάντε κλικ για εμφάνιση/απόκρυψη λεπτομερειών';
                            resultBody.addEventListener('click', () => {
                                toggleOrderDetails(result, itemDiv);
                            });
                        }
                    } else {
                        console.warn(`[MMS] Result #${index + 1}: No orderLink found. Not making clickable. Row HTML:`, result.rowHTML);
                    }
                });

                resultsContainer.querySelectorAll('.tm-print-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const url = e.target.dataset.link;
                        window.handlePrintClick(url, e.target);
                    });
                });
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Αναζήτηση';
        }

        // New function for adding print button to edit pages
        function addPrintButtonToEditPage() {
            console.log('[MMS] Attempting to add print button to edit page...');
            const buttonsLeftContainer = document.querySelector('.rnr-buttons-left');
            const existingPrintBtn = document.querySelector('.tm-print-page-btn');
            
            console.log('[MMS] Print button check:', {
                hasButtonsContainer: !!buttonsLeftContainer,
                hasExistingPrintBtn: !!existingPrintBtn,
                currentPath: window.location.pathname
            });
            
            if (!buttonsLeftContainer || existingPrintBtn) {
                console.warn('[MMS] Could not add print button:', {
                    noContainer: !buttonsLeftContainer,
                    alreadyExists: !!existingPrintBtn
                });
                return;
            }

            const printButton = document.createElement('a'); // Using 'a' for consistent styling with other buttons
            printButton.className = 'rnr-button main tm-print-page-btn'; // Reusing rnr-button main for consistent look
            printButton.style.marginLeft = '10px'; // Add some spacing

            printButton.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                console.log('[MMS] Print button clicked, calling handlePrintClick with URL:', window.location.href);
                window.handlePrintClick(window.location.href, printButton);
            });

            buttonsLeftContainer.appendChild(printButton);
            printButton.textContent = 'Εκτύπωση Παραγγελίας';
            printButton.href = '#'; // Prevent actual navigation
            console.log('[MMS] ✅ Print button successfully added to edit page:', {
                buttonText: printButton.textContent,
                buttonClass: printButton.className,
                containerFound: !!buttonsLeftContainer
            });
        }

        // --- Feature Initializer ---
        const pathname = window.location.pathname;
        const isEditPage = pathname.includes('_edit.php');

        if (isEditPage && pathname.includes('/mymanagerservice/service_edit.php')) {
            createQuickSearchPanel();
            addPrintButtonToEditPage(); // Also add print button to service edit pages
        } else if (isEditPage) {
            addPrintButtonToEditPage();
        } else if (pathname.includes('_list.php')) {
            // On non-edit pages (list pages), just add the main search button.
            addMainButton();
        }
    }

    // Make the main initializer function globally accessible
    window.initSearchFeature = initSearchFeature;

})();