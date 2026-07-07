// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Minimal footer search — two fields, one search button
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

(function () {
    'use strict';

    const REPAIR_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=';
    const PARTS_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=';

    function buildSearchUrl(base, query) {
        const q = String(query || '').trim();
        if (!q) return '';
        return `${base}${encodeURIComponent(q)}`;
    }

    function goToSearch(url) {
        if (!url) return;
        window.location.href = url;
    }

    function submitFromInput(input, baseUrl) {
        const url = buildSearchUrl(baseUrl, input.value);
        if (url) goToSearch(url);
        else input.focus();
    }

    function mountFooterQuickSearch(parentContainer, config) {
        if (!parentContainer) return;

        let bar = document.getElementById('tm-footer-quick-search');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'tm-footer-quick-search';
            bar.className = 'tm-footer-search-compact';
            bar.setAttribute('role', 'search');
            bar.setAttribute('aria-label', 'Γρήγορη αναζήτηση');

            const repairWrap = document.createElement('div');
            repairWrap.className = 'tm-footer-search-field';
            repairWrap.innerHTML = '<span class="tm-footer-search-field-icon" aria-hidden="true">🔧</span>';

            const repairInput = document.createElement('input');
            repairInput.type = 'text';
            repairInput.id = 'tm-footer-repair-search';
            repairInput.className = 'tm-footer-search-input';
            repairInput.placeholder = 'Επισκευές';
            repairInput.autocomplete = 'off';
            repairInput.spellcheck = false;
            repairInput.dataset.searchBase = REPAIR_SEARCH_URL;
            repairWrap.appendChild(repairInput);

            const partsWrap = document.createElement('div');
            partsWrap.className = 'tm-footer-search-field';
            partsWrap.innerHTML = '<span class="tm-footer-search-field-icon" aria-hidden="true">📦</span>';

            const partsInput = document.createElement('input');
            partsInput.type = 'text';
            partsInput.id = 'tm-footer-parts-search';
            partsInput.className = 'tm-footer-search-input';
            partsInput.placeholder = 'Ανταλλακτικά';
            partsInput.autocomplete = 'off';
            partsInput.spellcheck = false;
            partsInput.dataset.searchBase = PARTS_SEARCH_URL;
            partsWrap.appendChild(partsInput);

            const searchBtn = document.createElement('button');
            searchBtn.type = 'button';
            searchBtn.id = 'tm-footer-search-submit';
            searchBtn.className = 'tm-footer-search-submit';
            searchBtn.title = 'Αναζήτηση (επιλεγμένο πεδίο)';
            searchBtn.setAttribute('aria-label', 'Αναζήτηση');
            searchBtn.textContent = '→';

            const getActiveInput = () => {
                const active = document.activeElement;
                if (active === repairInput || active === partsInput) return active;
                if (repairInput.value.trim()) return repairInput;
                if (partsInput.value.trim()) return partsInput;
                return repairInput;
            };

            const submitActive = () => {
                const input = getActiveInput();
                submitFromInput(input, input.dataset.searchBase);
            };

            searchBtn.addEventListener('click', submitActive);

            [repairInput, partsInput].forEach((input) => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        submitFromInput(input, input.dataset.searchBase);
                    }
                });
            });

            bar.appendChild(repairWrap);
            bar.appendChild(partsWrap);
            bar.appendChild(searchBtn);
            parentContainer.appendChild(bar);
        } else if (bar.parentElement !== parentContainer) {
            parentContainer.appendChild(bar);
        }

        updateFooterQuickSearchVisibility(config);
    }

    function updateFooterQuickSearchVisibility(config) {
        const bar = document.getElementById('tm-footer-quick-search');
        if (!bar) return;
        const enabled = config?.footerQuickSearchEnabled !== false;
        bar.style.display = enabled ? 'inline-flex' : 'none';
    }

    function initFooterQuickSearch(parentContainer, config) {
        mountFooterQuickSearch(parentContainer, config);
    }

    window.initFooterQuickSearch = initFooterQuickSearch;
    window.updateFooterQuickSearchVisibility = updateFooterQuickSearchVisibility;
})();
