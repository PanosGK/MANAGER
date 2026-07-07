// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Repair and parts search boxes in the footer center
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

    function createSearchGroup({ id, label, icon, placeholder, baseUrl }) {
        const group = document.createElement('div');
        group.className = 'tm-footer-search-group';

        const labelEl = document.createElement('label');
        labelEl.className = 'tm-footer-search-label';
        labelEl.setAttribute('for', id);
        labelEl.innerHTML = `<span class="tm-footer-search-icon" aria-hidden="true">${icon}</span><span class="tm-footer-search-label-text">${label}</span>`;

        const inputWrap = document.createElement('div');
        inputWrap.className = 'tm-footer-search-input-wrap';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.className = 'tm-footer-search-input';
        input.placeholder = placeholder;
        input.autocomplete = 'off';
        input.spellcheck = false;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tm-footer-search-btn';
        btn.title = 'Αναζήτηση';
        btn.textContent = '→';

        const submit = () => goToSearch(buildSearchUrl(baseUrl, input.value));

        btn.addEventListener('click', submit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
            }
        });

        inputWrap.appendChild(input);
        inputWrap.appendChild(btn);
        group.appendChild(labelEl);
        group.appendChild(inputWrap);
        return group;
    }

    function mountFooterQuickSearch(parentContainer, config) {
        if (!parentContainer) return;

        let bar = document.getElementById('tm-footer-quick-search');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'tm-footer-quick-search';
            bar.setAttribute('role', 'search');
            bar.setAttribute('aria-label', 'Γρήγορη αναζήτηση');

            bar.appendChild(createSearchGroup({
                id: 'tm-footer-repair-search',
                label: 'Επισκευές',
                icon: '🔧',
                placeholder: 'Αρ., τηλέφωνο, πελάτης…',
                baseUrl: REPAIR_SEARCH_URL,
            }));
            bar.appendChild(createSearchGroup({
                id: 'tm-footer-parts-search',
                label: 'Ανταλλακτικά',
                icon: '📦',
                placeholder: 'Κωδικός, barcode…',
                baseUrl: PARTS_SEARCH_URL,
            }));

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
        bar.style.display = enabled ? 'flex' : 'none';
    }

    function initFooterQuickSearch(parentContainer, config) {
        mountFooterQuickSearch(parentContainer, config);
    }

    window.initFooterQuickSearch = initFooterQuickSearch;
    window.updateFooterQuickSearchVisibility = updateFooterQuickSearchVisibility;
})();
