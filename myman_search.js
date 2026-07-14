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
        createRightSidePanel(); // Ensure the panel exists (scratchpad / auxiliary slide-outs)

        const SEARCH_MENU_ID = 'tm-search-menu-item';
        let searchKeyboardShortcutsBound = false;
        const QUICK_SEARCH_HIDDEN_KEY = 'tm_quick_search_hidden';

        // --- Configuration & Constants ---
        const SEARCH_URL_MAP = {
            orders: '/mymanagerservice/srvorders_list.php?pagesize=-1',
            spareparts: '/mymanagerservice/sparepartstoorder_list.php?pagesize=-1'
        };

        const SEARCH_INCLUDE_MERCHANDISE_HISTORY_KEY = 'tm_search_include_merchandise_history';
        const SEARCH_INCLUDE_PARTS_HISTORY_KEY = 'tm_search_include_parts_history';

        // State Variables
        let searchResults = [];
        let searchTerms = [];
        let searchScope = 'all';
        let searchGeneration = 0;
        let searchProgress = { total: 0, done: 0 };

        function getSearchUrlsForScope(scope) {
            if (scope === 'orders') return [SEARCH_URL_MAP.orders];
            if (scope === 'spareparts') return [SEARCH_URL_MAP.spareparts];
            return Object.values(SEARCH_URL_MAP);
        }

        function getResultTypeLabel(result) {
            const source = typeof result === 'object' ? result.source : null;
            const orderLink = typeof result === 'object' ? result.orderLink : result;
            if (source === 'history-merchandise') return 'Ιστορικό Εμπόρ.';
            if (source === 'history-parts') return 'Ιστορικό Ανταλλ.';
            if (!orderLink) return 'Αποτέλεσμα';
            if (orderLink.includes('sparepartstoorder')) return 'Ανταλλακτικό';
            if (orderLink.includes('srvorders')) return 'Παραγγελία';
            return 'Αποτέλεσμα';
        }

        function escapeSearchHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function loadOrderHistory(storageKey) {
            try {
                const data = GM_getValue(storageKey, '[]');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('[MMS Search] Error parsing order history:', e);
                return [];
            }
        }

        function orderHistorySearchText(order) {
            const parts = [
                order.id,
                order.phone,
                order.customer,
                order.code,
                order.repairNumber,
                order.date,
                order.type
            ];
            if (order.allColumns) {
                parts.push(...Object.values(order.allColumns));
            }
            return parts.filter(Boolean).join(' ').toLowerCase();
        }

        function buildHistoryDisplayCells(order) {
            const cells = [];
            const seen = new Set();
            const push = (text) => {
                const value = String(text).trim();
                if (!value || seen.has(value)) return;
                seen.add(value);
                cells.push({ html: escapeSearchHtml(value), text: value });
            };

            push(order.id);
            push(order.customer);
            push(order.phone);
            push(order.code);
            push(order.repairNumber);
            push(order.date);
            if (order.allColumns) {
                Object.values(order.allColumns).forEach(push);
            }
            return cells;
        }

        function searchOrderHistory(storageKey, source) {
            const orders = loadOrderHistory(storageKey);
            const query = document.getElementById('tm-search-input')?.value.trim() || '';

            orders.forEach(order => {
                const text = orderHistorySearchText(order);
                const allTermsMatch = searchTerms.every(term => text.includes(term));
                if (!allTermsMatch || !order.url) return;
                if (searchResults.some(r => r.orderLink === order.url)) return;

                searchResults.push({
                    term: query,
                    orderLink: order.url,
                    source,
                    historyEntry: order
                });
            });
        }

        function getSearchSourceOptions() {
            const merchCb = document.getElementById('tm-search-include-merchandise-history');
            const partsCb = document.getElementById('tm-search-include-parts-history');
            return {
                merchandiseHistory: merchCb ? merchCb.checked : false,
                partsHistory: partsCb ? partsCb.checked : false
            };
        }

        function countHistorySearchTasks(options) {
            let count = 0;
            if (options.merchandiseHistory) count++;
            if (options.partsHistory) count++;
            return count;
        }

        function runHistorySearches(options, generation) {
            if (generation !== searchGeneration) return;

            const serviceKey = STORAGE_KEYS.ORDER_HISTORY_SERVICE || 'tm_srvorders_page_history';
            const partsKey = STORAGE_KEYS.ORDER_HISTORY_PARTS || 'tm_partsorders_page_history';

            if (options.merchandiseHistory) {
                searchOrderHistory(serviceKey, 'history-merchandise');
                searchProgress.done++;
                updateSearchProgressUI();
            }
            if (options.partsHistory) {
                searchOrderHistory(partsKey, 'history-parts');
                searchProgress.done++;
                updateSearchProgressUI();
            }
        }

        function extractRowCells(rowHTML) {
            const tr = document.createElement('tr');
            tr.innerHTML = rowHTML;
            return Array.from(tr.querySelectorAll('td'))
                .map(td => ({ html: td.innerHTML, text: td.innerText.trim() }))
                .filter(cell => cell.text);
        }

        function highlightTermsInHtml(html, terms) {
            let highlighted = html;
            terms.forEach(term => {
                const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                highlighted = highlighted.replace(regex, '<span class="tm-result-highlight">$&</span>');
            });
            return highlighted;
        }

        function updateSearchProgressUI() {
            const progressEl = document.getElementById('tm-search-progress');
            if (!progressEl) return;
            const pct = searchProgress.total > 0
                ? Math.min(100, Math.round((searchProgress.done / searchProgress.total) * 100))
                : 0;
            const bar = progressEl.querySelector('.tm-search-progress-bar-fill');
            const text = progressEl.querySelector('.tm-search-progress-text');
            if (bar) bar.style.width = `${pct}%`;
            if (text) {
                text.textContent = searchProgress.total > 0
                    ? `Αναζήτηση… ${searchProgress.done}/${searchProgress.total}`
                    : 'Αναζήτηση…';
            }
        }

        function setSearchProgressVisible(visible) {
            const progressEl = document.getElementById('tm-search-progress');
            if (progressEl) progressEl.classList.toggle('tm-search-progress--active', visible);
        }

        function removeLegacySearchButton() {
            document.getElementById('tm-search-btn')?.remove();
        }

        function cloneNativeMenuItem(templateLi, label) {
            const li = templateLi.cloneNode(true);
            li.classList.remove('current', 'expanded');
            li.removeAttribute('id');
            li.querySelectorAll(':scope > ul').forEach((ul) => ul.remove());

            const link = li.querySelector(':scope > div > div > a[href], :scope > div a[href], :scope > a[href]');
            if (link) {
                const icon = link.querySelector('img.menu-icon');
                link.setAttribute('href', '#');
                link.innerHTML = '';
                if (icon) {
                    link.appendChild(icon.cloneNode(true));
                    link.appendChild(document.createTextNode(` ${label}`));
                } else {
                    link.textContent = label;
                }
            }

            return li;
        }

        function createFallbackMenuItem(label) {
            const li = document.createElement('li');
            li.innerHTML = `<div><div><a href="#">${label}</a></div></div>`;
            return li;
        }

        function findMenuInsertPoint(menu) {
            const manageItem = menu.querySelector('[data-tm-manage-hidden="true"]');
            if (manageItem) {
                const separator = manageItem.previousElementSibling;
                if (separator?.getAttribute('data-tm-special') === 'true') return separator;
                return manageItem;
            }
            return null;
        }

        function findSearchMenuInsertPoint(menu) {
            const phoneCatalogItem = document.getElementById('tm-phone-catalog-menu-item');
            if (phoneCatalogItem?.parentElement === menu) {
                return phoneCatalogItem.nextElementSibling;
            }
            return findMenuInsertPoint(menu);
        }

        function getSearchMenuLabel() {
            return 'Αναζήτηση Παραγγελίας';
        }

        function bindSearchKeyboardShortcuts() {
            if (searchKeyboardShortcutsBound) return;
            searchKeyboardShortcutsBound = true;

            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                    e.preventDefault();
                    createSearchModal();
                }
            });
        }

        function ensureSearchMenuItem(activeConfig) {
            removeLegacySearchButton();

            const menu = document.querySelector('.rnr-b-vmenu.simple.main');
            if (!menu) return false;

            const enabled = activeConfig?.searchFeatureEnabled !== false;
            let item = document.getElementById(SEARCH_MENU_ID);

            if (!enabled) {
                if (item) item.style.display = 'none';
                return true;
            }

            const label = getSearchMenuLabel();

            if (!item) {
                const template = menu.querySelector(':scope > li:not(.menuGroup):not([data-tm-special]):not([data-tm-suite-item])')
                    || menu.querySelector('li:not([data-tm-special]):not([data-tm-suite-item])');
                item = template
                    ? cloneNativeMenuItem(template, label)
                    : createFallbackMenuItem(label);

                item.id = SEARCH_MENU_ID;
                item.setAttribute('data-tm-suite-item', 'super-search');
                item.setAttribute('data-menu-id', 'suite-super-search');
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    createSearchModal();
                });

                const insertBefore = findSearchMenuInsertPoint(menu);
                if (insertBefore) menu.insertBefore(item, insertBefore);
                else menu.appendChild(item);
            } else {
                const link = item.querySelector('a[href]');
                if (link) {
                    const icon = link.querySelector('img.menu-icon');
                    link.innerHTML = '';
                    if (icon) {
                        link.appendChild(icon.cloneNode(true));
                        link.appendChild(document.createTextNode(` ${label}`));
                    } else {
                        link.textContent = label;
                    }
                }
                if (!item.parentElement) {
                    const insertBefore = findSearchMenuInsertPoint(menu);
                    if (insertBefore) menu.insertBefore(item, insertBefore);
                    else menu.appendChild(item);
                }
            }

            item.style.display = '';
            return true;
        }

        function initSearchMenuItem(activeConfig) {
            removeLegacySearchButton();
            bindSearchKeyboardShortcuts();

            if (activeConfig?.searchFeatureEnabled === false) {
                document.getElementById(SEARCH_MENU_ID)?.remove();
                return;
            }

            let attempts = 0;
            const maxAttempts = 80;
            let observer = null;

            const tryInject = () => {
                attempts += 1;
                if (ensureSearchMenuItem(activeConfig)) {
                    if (observer) observer.disconnect();
                    return;
                }
                if (attempts >= maxAttempts && observer) observer.disconnect();
            };

            tryInject();

            observer = new MutationObserver(() => {
                tryInject();
            });
            const leftPanel = document.querySelector('.rnr-left') || document.body;
            observer.observe(leftPanel, { childList: true, subtree: true });
            setTimeout(() => observer?.disconnect(), 10000);
        }

        function updateSearchMenuItemVisibility(activeConfig) {
            ensureSearchMenuItem(activeConfig);
        }

        function createSearchModal() {
            if (document.getElementById('tm-search-modal-overlay')) return;

            const overlay = document.createElement('div');
            overlay.id = 'tm-search-modal-overlay';
            overlay.className = 'tm-modal-overlay tm-search-modal-overlay';
            const currentTheme = GM_getValue('equippedTheme', 'default');
            overlay.classList.toggle('tm-hacker-theme-enabled', currentTheme === 'matrix');
            overlay.innerHTML = `
                <div class="tm-modal-content tm-search-modal-content">
                    <div class="tm-modal-header tm-search-modal-header">
                        <div class="tm-search-modal-brand">
                            <span class="tm-search-modal-icon" aria-hidden="true">🔍</span>
                            <div>
                                <h2 class="tm-modal-title">Αναζήτηση Παραγγελίας</h2>
                                <p class="tm-search-modal-subtitle">Παραγγελίες &amp; ανταλλακτικά — όλοι οι όροι πρέπει να ταιριάζουν</p>
                            </div>
                        </div>
                        <div class="tm-search-modal-meta">
                            <kbd class="tm-search-kbd-hint" title="Άνοιγμα αναζήτησης">Ctrl+K</kbd>
                            <button class="tm-modal-close" aria-label="Κλείσιμο">&times;</button>
                        </div>
                    </div>

                    <div class="tm-search-toolbar">
                        <div id="tm-search-input-area" class="tm-search-input-wrap">
                            <span class="tm-search-input-icon" aria-hidden="true">⌕</span>
                            <input type="text" id="tm-search-input" placeholder="Αρ. παραγγελίας, όνομα, ανταλλακτικό…" autocomplete="off" spellcheck="false">
                            <button id="tm-search-favorite-btn" type="button" title="Προσθήκη στα Αγαπημένα">&#9734;</button>
                            <button id="tm-search-submit" type="button">Αναζήτηση</button>
                            <button id="tm-search-cancel" type="button" class="tm-search-cancel-btn" hidden>Ακύρωση</button>
                        </div>
                        <div class="tm-search-filters-row">
                            <div class="tm-search-scope-toggles" role="group" aria-label="Ζωντανή αναζήτηση">
                                <button type="button" class="tm-search-scope active" data-scope="all">Όλα</button>
                                <button type="button" class="tm-search-scope" data-scope="orders">Παραγγελίες</button>
                                <button type="button" class="tm-search-scope" data-scope="spareparts">Ανταλλακτικά</button>
                            </div>
                            <div class="tm-search-history-toggles" role="group" aria-label="Ιστορικό παραγγελιών">
                                <label class="tm-search-toggle-check">
                                    <input type="checkbox" id="tm-search-include-merchandise-history">
                                    <span class="tm-search-toggle-check-ui" aria-hidden="true"></span>
                                    <span class="tm-search-toggle-check-label">Ιστορικό Εμπορευμάτων</span>
                                </label>
                                <label class="tm-search-toggle-check">
                                    <input type="checkbox" id="tm-search-include-parts-history">
                                    <span class="tm-search-toggle-check-ui" aria-hidden="true"></span>
                                    <span class="tm-search-toggle-check-label">Ιστορικό Ανταλλακτικών</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="tm-search-body">
                        <aside class="tm-search-sidebar">
                            <div class="tm-search-sidebar-section">
                                <h4 class="tm-search-sidebar-title">Πρόσφατες</h4>
                                <div id="tm-search-history-chips" class="tm-search-chips"></div>
                            </div>
                            <div class="tm-search-sidebar-section">
                                <h4 class="tm-search-sidebar-title">Αγαπημένες</h4>
                                <div id="tm-search-favorites-chips" class="tm-search-chips"></div>
                            </div>
                        </aside>
                        <main class="tm-search-main">
                            <div id="tm-search-progress" class="tm-search-progress" aria-hidden="true">
                                <div class="tm-search-progress-track">
                                    <div class="tm-search-progress-bar-fill"></div>
                                </div>
                                <span class="tm-search-progress-text">Αναζήτηση…</span>
                            </div>
                            <div id="tm-results-container">
                                <div class="tm-search-empty-state">
                                    <span class="tm-search-empty-icon" aria-hidden="true">📋</span>
                                    <p class="tm-search-empty-title">Ξεκινήστε μια αναζήτηση</p>
                                    <p class="tm-search-empty-hint">Πληκτρολογήστε όρους χωρισμένους με κενό — όλοι πρέπει να υπάρχουν στο αποτέλεσμα.</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            renderHistoryAndFavorites(overlay, config, STORAGE_KEYS);

            const closeModal = () => overlay.remove();
            overlay.querySelector('.tm-modal-close').addEventListener('click', closeModal);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

            overlay.querySelector('#tm-search-submit').addEventListener('click', handleSearchSubmit);
            overlay.querySelector('#tm-search-cancel').addEventListener('click', () => {
                searchGeneration++;
                finishSearchUI();
                const resultsContainer = document.getElementById('tm-results-container');
                if (resultsContainer) {
                    resultsContainer.innerHTML = `
                        <div class="tm-search-empty-state">
                            <span class="tm-search-empty-icon" aria-hidden="true">⏹</span>
                            <p class="tm-search-empty-title">Η αναζήτηση ακυρώθηκε</p>
                        </div>`;
                }
            });

            overlay.querySelectorAll('.tm-search-scope').forEach(btn => {
                btn.addEventListener('click', () => {
                    searchScope = btn.dataset.scope || 'all';
                    overlay.querySelectorAll('.tm-search-scope').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });

            const merchHistoryCb = overlay.querySelector('#tm-search-include-merchandise-history');
            const partsHistoryCb = overlay.querySelector('#tm-search-include-parts-history');
            if (merchHistoryCb) {
                merchHistoryCb.checked = GM_getValue(SEARCH_INCLUDE_MERCHANDISE_HISTORY_KEY, true);
                merchHistoryCb.addEventListener('change', () => {
                    GM_setValue(SEARCH_INCLUDE_MERCHANDISE_HISTORY_KEY, merchHistoryCb.checked);
                });
            }
            if (partsHistoryCb) {
                partsHistoryCb.checked = GM_getValue(SEARCH_INCLUDE_PARTS_HISTORY_KEY, true);
                partsHistoryCb.addEventListener('change', () => {
                    GM_setValue(SEARCH_INCLUDE_PARTS_HISTORY_KEY, partsHistoryCb.checked);
                });
            }

            const searchInput = overlay.querySelector('#tm-search-input');
            const favoriteBtn = overlay.querySelector('#tm-search-favorite-btn');

            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') handleSearchSubmit();
                if (e.key === 'Escape') closeModal();
                updateFavoriteButtonState(searchInput.value, favoriteBtn, STORAGE_KEYS);
            });

            favoriteBtn.addEventListener('click', () => {
                toggleFavoriteSearch(searchInput.value, favoriteBtn, STORAGE_KEYS);
                renderHistoryAndFavorites(overlay, config, STORAGE_KEYS);
            });

            updateFavoriteButtonState(searchInput.value, favoriteBtn, STORAGE_KEYS);
            setTimeout(() => searchInput.focus(), 100);
        }

        function finishSearchUI() {
            const submitBtn = document.getElementById('tm-search-submit');
            const cancelBtn = document.getElementById('tm-search-cancel');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Αναζήτηση';
            }
            if (cancelBtn) cancelBtn.hidden = true;
            setSearchProgressVisible(false);
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
            const historyChips = modal.querySelector('#tm-search-history-chips');
            const favoritesChips = modal.querySelector('#tm-search-favorites-chips');
            if (!historyChips || !favoritesChips) return;

            historyChips.innerHTML = '';
            favoritesChips.innerHTML = '';

            const history = getSearchHistory(STORAGE_KEYS);
            if (history.length === 0) {
                historyChips.innerHTML = '<span class="tm-search-chips-empty">Καμία πρόσφατη αναζήτηση</span>';
            } else {
                history.forEach(query => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'tm-search-chip';
                    chip.title = `Αναζήτηση: ${query}`;
                    chip.innerHTML = `<span class="tm-search-chip-label">${query}</span>`;
                    chip.addEventListener('click', () => performSearchInModal(query, config, STORAGE_KEYS));
                    historyChips.appendChild(chip);
                });
            }

            const favorites = getFavoriteSearches(STORAGE_KEYS);
            if (favorites.length === 0) {
                favoritesChips.innerHTML = '<span class="tm-search-chips-empty">Κανένα αγαπημένο</span>';
            } else {
                favorites.forEach(query => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'tm-search-chip tm-search-chip--favorite';
                    chip.title = `Αναζήτηση: ${query}`;
                    chip.innerHTML = `
                        <span class="tm-search-chip-star" aria-hidden="true">★</span>
                        <span class="tm-search-chip-label">${query}</span>
                        <span class="tm-search-chip-remove" aria-label="Αφαίρεση">×</span>`;
                    chip.addEventListener('click', (e) => {
                        if (e.target.closest('.tm-search-chip-remove')) return;
                        performSearchInModal(query, config, STORAGE_KEYS);
                    });
                    chip.querySelector('.tm-search-chip-remove').addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleFavoriteSearch(query, modal.querySelector('#tm-search-favorite-btn'), STORAGE_KEYS);
                        renderHistoryAndFavorites(modal, config, STORAGE_KEYS);
                    });
                    favoritesChips.appendChild(chip);
                });
            }
        }

        function addAuxiliarySlideOutButtons() {
            const container = document.getElementById('tm-search-container');
            if (!container) return;

            if (config.levelUpSystemEnabled && !document.getElementById('tm-quests-btn')) {
                const questsButton = document.createElement('button');
                questsButton.id = 'tm-quests-btn';
                questsButton.className = 'tm-slide-out-btn';
                questsButton.innerHTML = '📜 Daily Bounties';
                questsButton.addEventListener('click', () => window.showQuestsModal(config, STORAGE_KEYS));
                container.appendChild(questsButton);
            }

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
                            const statusSpan = statusCell ? statusCell.querySelector('span[id$="_ccc_iStatusID"]') : null;
                            if (statusSpan && statusSpan.innerText.trim() === '105') {
                                status105Count++;
                            }
                        });
                    }
                }
            }

            if (config.technicianStatsEnabled && isOnServiceListPage && isView105 && status105Count >= 10 && !document.getElementById('tm-tech-stats-btn')) {
                const statsButton = document.createElement('button');
                statsButton.id = 'tm-tech-stats-btn';
                statsButton.innerHTML = '📊 Στατιστικά Τεχνικών';
                statsButton.className = 'tm-slide-out-btn';
                statsButton.onclick = window.initTechnicianStatsFeature;
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
            const modal = document.getElementById('tm-search-modal-overlay');
            if (!modal) {
                createSearchModal();
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

        function handleSearchSubmit() {
            const input = document.getElementById('tm-search-input');
            const submitBtn = document.getElementById('tm-search-submit');
            const cancelBtn = document.getElementById('tm-search-cancel');
            const resultsContainer = document.getElementById('tm-results-container');

            const query = input.value.trim();
            if (!query) return;

            searchGeneration++;
            const currentGeneration = searchGeneration;

            window.trackDailyStat(config, STORAGE_KEYS, 'searches');
            addSearchToHistory(query, config, STORAGE_KEYS);
            const modal = document.getElementById('tm-search-modal-overlay');
            if (modal) renderHistoryAndFavorites(modal, config, STORAGE_KEYS);

            searchTerms = query.split(/[\s,]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
            if (searchTerms.length === 0) return;

            searchResults = [];
            processedUrls.clear();

            const sourceOptions = getSearchSourceOptions();
            const liveUrls = getSearchUrlsForScope(searchScope);
            const historyTasks = countHistorySearchTasks(sourceOptions);
            searchProgress = { total: liveUrls.length + historyTasks, done: 0 };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Αναζήτηση…';
            if (cancelBtn) cancelBtn.hidden = false;
            setSearchProgressVisible(true);
            updateSearchProgressUI();

            let terminalInterval = null;
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
                resultsContainer.innerHTML = `<div class="tm-search-loading-state"><div class="tm-spinner"></div><span>Σάρωση πηγών δεδομένων…</span></div>`;
            }

            const onSearchComplete = () => {
                if (currentGeneration !== searchGeneration) return;
                window.setMascotState(config, 'idle');
                if (terminalInterval) clearInterval(terminalInterval);
                const theme = GM_getValue('equippedTheme', 'default');
                setTimeout(displayResults, theme === 'matrix' ? 500 : 0);
            };

            if (config.interactiveMascotEnabled) window.setMascotState(config, 'searching');

            runHistorySearches(sourceOptions, currentGeneration);

            urlsToProcess = [...liveUrls];
            if (urlsToProcess.length === 0) {
                onSearchComplete();
            } else {
                processNextUrl(onSearchComplete, currentGeneration);
            }
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

        function processNextUrl(onComplete, generation) {
            if (generation !== undefined && generation !== searchGeneration) return;

            if (urlsToProcess.length === 0) {
                if (activeSearchRequests === 0 && onComplete) onComplete();
                return;
            }

            const url = urlsToProcess.shift();
            if (processedUrls.has(url)) {
                processNextUrl(onComplete, generation);
                return;
            }
            processedUrls.add(url);

            activeSearchRequests++;
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    if (generation !== undefined && generation !== searchGeneration) {
                        activeSearchRequests--;
                        return;
                    }
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    parseAndSearchPage(doc, response.finalUrl, generation);
                    activeSearchRequests--;
                    searchProgress.done++;
                    updateSearchProgressUI();
                    if (urlsToProcess.length > 0) {
                        processNextUrl(onComplete, generation);
                    } else if (activeSearchRequests === 0) {
                        if (onComplete) onComplete();
                    }
                },
                onerror: function() {
                    if (generation !== undefined && generation !== searchGeneration) {
                        activeSearchRequests--;
                        return;
                    }
                    activeSearchRequests--;
                    searchProgress.done++;
                    updateSearchProgressUI();
                    if (urlsToProcess.length > 0) processNextUrl(onComplete, generation);
                    else if (activeSearchRequests === 0 && onComplete) onComplete();
                }
            });
        }

        function parseAndSearchPage(doc, pageBaseUrl, generation) {
            if (generation !== undefined && generation !== searchGeneration) return;

            doc.querySelectorAll('.pagination a').forEach(a => {
                const pageHref = a.getAttribute('href');
                if (pageHref && !pageHref.startsWith('javascript:')) {
                    const absoluteUrl = new URL(pageHref, pageBaseUrl).href;
                    if (!processedUrls.has(absoluteUrl)) {
                        urlsToProcess.push(absoluteUrl);
                        searchProgress.total++;
                        updateSearchProgressUI();
                    }
                }
            });

            const rows = doc.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const rowText = row.innerText.toLowerCase();
                const allTermsMatch = searchTerms.every(term => rowText.includes(term));

                if (allTermsMatch) {
                    const linkUrl = window.findOrderLink(row, pageBaseUrl);
                    if (linkUrl && !searchResults.some(r => r.orderLink === linkUrl)) {
                        searchResults.push({
                            term: document.getElementById('tm-search-input').value.trim(),
                            rowHTML: row.innerHTML,
                            orderLink: linkUrl
                        });
                    }
                }
            });
        }

        // --- Results & Printing ---
        function toggleOrderDetails(result, itemDiv) {
            console.log('[MMS] Toggling details for:', result);
            const existingDetails = itemDiv.querySelector('.tm-result-details-container');

            // If details are already visible, remove them to collapse the view.
            if (existingDetails) {
                existingDetails.remove();
                itemDiv.classList.remove('tm-result-card--expanded');
                return;
            }

            console.log('[MMS] Creating details container and fetching from:', result.orderLink);
            // Create a container and show a loading message.
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'tm-result-details-container';
            detailsContainer.innerHTML = '<div class="tm-details-loading">Φόρτωση λεπτομερειών…</div>';
            itemDiv.appendChild(detailsContainer);
            itemDiv.classList.add('tm-result-card--expanded');

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
            const input = document.getElementById('tm-search-input');
            const query = input ? input.value.trim() : '';

            finishSearchUI();

            if (searchResults.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="tm-search-empty-state">
                        <span class="tm-search-empty-icon" aria-hidden="true">🔎</span>
                        <p class="tm-search-empty-title">Δεν βρέθηκαν αποτελέσματα</p>
                        <p class="tm-search-empty-hint">Για «${query}» — δοκιμάστε λιγότερους όρους ή άλλο εύρος.</p>
                    </div>`;
                return;
            }

            if (config.confettiEnabled) window.triggerConfetti(30);

            const summary = document.createElement('div');
            summary.className = 'tm-search-results-summary';
            summary.innerHTML = `
                <span>Βρέθηκαν <strong>${searchResults.length}</strong> αποτελέσματα</span>
                <span class="tm-search-results-query">«${query}»</span>`;
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(summary);

            searchResults.forEach((result, index) => {
                const cells = result.historyEntry
                    ? buildHistoryDisplayCells(result.historyEntry)
                    : extractRowCells(result.rowHTML);
                const primary = cells[0] ? highlightTermsInHtml(cells[0].html, searchTerms) : '—';
                const metaCells = cells.slice(1, 5);
                const typeLabel = getResultTypeLabel(result);
                const isHistoryResult = result.source === 'history-merchandise' || result.source === 'history-parts';

                const itemDiv = document.createElement('article');
                itemDiv.className = 'tm-result-card';
                if (result.orderLink) itemDiv.classList.add('tm-result-clickable');
                if (isHistoryResult) itemDiv.classList.add('tm-result-card--from-history');

                const fieldsHtml = metaCells.map(cell =>
                    `<span class="tm-result-field-pill">${highlightTermsInHtml(cell.html, searchTerms)}</span>`
                ).join('');

                itemDiv.innerHTML = `
                    <div class="tm-result-card-header">
                        <div class="tm-result-card-title">
                            <span class="tm-result-card-badge">${index + 1}</span>
                            <span class="tm-result-card-primary">${primary}</span>
                            <span class="tm-result-card-type${isHistoryResult ? ' tm-result-card-type--history' : ''}">${typeLabel}</span>
                        </div>
                        <div class="tm-result-card-actions">
                            ${result.orderLink ? `<a href="${result.orderLink}" target="_blank" class="tm-goto-btn" title="Άνοιγμα παραγγελίας">↗ Άνοιγμα</a>` : ''}
                            ${result.orderLink ? `<button type="button" class="tm-print-btn" data-link="${result.orderLink}" title="Εκτύπωση">🖨</button>` : ''}
                        </div>
                    </div>
                    ${fieldsHtml ? `<div class="tm-result-card-fields">${fieldsHtml}</div>` : ''}
                    <div class="tm-result-card-hint">Κλικ για λεπτομέρειες</div>
                `;
                resultsContainer.appendChild(itemDiv);

                if (result.orderLink) {
                    itemDiv.addEventListener('click', (e) => {
                        if (e.target.closest('.tm-goto-btn, .tm-print-btn')) return;
                        toggleOrderDetails(result, itemDiv);
                    });
                }
            });

            resultsContainer.querySelectorAll('.tm-print-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.handlePrintClick(e.currentTarget.dataset.link, e.currentTarget);
                });
            });
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
        window.openSuperSearchModal = createSearchModal;
        window.updateSearchMenuItemVisibility = updateSearchMenuItemVisibility;
        initSearchMenuItem(config);

        const pathname = window.location.pathname;
        const isEditPage = pathname.includes('_edit.php');

        if (isEditPage && pathname.includes('/mymanagerservice/service_edit.php')) {
            createQuickSearchPanel();
            addPrintButtonToEditPage(); // Also add print button to service edit pages
        } else if (isEditPage) {
            addPrintButtonToEditPage();
        } else if (pathname.includes('_list.php')) {
            addAuxiliarySlideOutButtons();
        }
    }

    window.initSearchFeature = initSearchFeature;

})();