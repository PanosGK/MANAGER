// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Always-visible repair and parts search boxes fixed at bottom of screen
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

(function () {
    'use strict';

    const REPAIR_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=';
    const PARTS_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=';

    function shouldSkipPage() {
        if (window.location.pathname.includes('login.php')) return true;
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return true;
        return false;
    }

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
        labelEl.innerHTML = `<span class="tm-footer-search-icon" aria-hidden="true">${icon}</span>${label}`;

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

        group.appendChild(labelEl);
        group.appendChild(input);
        group.appendChild(btn);
        return group;
    }

    function mountFixedQuickSearch() {
        if (shouldSkipPage()) return true;
        if (document.getElementById('tm-footer-quick-search')) return true;
        if (!document.body) return false;

        const bar = document.createElement('div');
        bar.id = 'tm-footer-quick-search';
        bar.className = 'tm-footer-quick-search--fixed';
        bar.setAttribute('role', 'search');
        bar.setAttribute('aria-label', 'Γρήγορη αναζήτηση');

        const inner = document.createElement('div');
        inner.className = 'tm-footer-quick-search-inner';
        inner.appendChild(createSearchGroup({
            id: 'tm-footer-repair-search',
            label: 'Επισκευές',
            icon: '🔧',
            placeholder: 'Αρ. επισκευής, τηλέφωνο, πελάτης…',
            baseUrl: REPAIR_SEARCH_URL,
        }));
        inner.appendChild(createSearchGroup({
            id: 'tm-footer-parts-search',
            label: 'Ανταλλακτικά',
            icon: '📦',
            placeholder: 'Κωδικός, περιγραφή, barcode…',
            baseUrl: PARTS_SEARCH_URL,
        }));

        bar.appendChild(inner);
        document.body.appendChild(bar);
        document.body.classList.add('tm-has-footer-quick-search');
        return true;
    }

    function initFooterQuickSearch() {
        const tryMount = () => mountFixedQuickSearch();

        if (tryMount()) return;

        let attempts = 0;
        const timer = setInterval(() => {
            attempts += 1;
            if (tryMount() || attempts >= 50) {
                clearInterval(timer);
            }
        }, 200);
    }

    window.initFooterQuickSearch = initFooterQuickSearch;
})();
