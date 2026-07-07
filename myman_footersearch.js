// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Header quick search in rnr-hfiller + toggle for native search block
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const REPAIR_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/service_list.php?qs=';
    const PARTS_SEARCH_URL = 'https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=';
    const NATIVE_SEARCH_SELECTOR = '.style1.rnr-bl.rnr-b-search';
    const NATIVE_SEARCH_HIDDEN_KEY = 'tm_native_search_hidden';

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

    function findHeaderFiller() {
        return document.querySelector('#head-outterwrap .rnr-hfiller')
            || document.querySelector('#head-outter .rnr-hfiller')
            || document.querySelector('.rnr-top .rnr-hfiller')
            || document.querySelector('.rnr-hfiller');
    }

    function getNativeSearchBlocks() {
        const exact = document.querySelectorAll(NATIVE_SEARCH_SELECTOR);
        if (exact.length) return exact;
        return document.querySelectorAll('.rnr-b-search');
    }

    function isNativeSearchHidden() {
        return GM_getValue(NATIVE_SEARCH_HIDDEN_KEY, false) === true;
    }

    function applyNativeSearchHidden(hidden) {
        document.body.classList.toggle('tm-native-search-hidden', hidden);
        getNativeSearchBlocks().forEach((el) => {
            el.style.display = hidden ? 'none' : '';
        });
        const btn = document.getElementById('tm-toggle-native-search');
        if (btn) {
            btn.textContent = hidden ? '👁' : '✕';
            btn.title = hidden
                ? 'Εμφάνιση αναζήτησης συστήματος'
                : 'Απόκρυψη αναζήτησης συστήματος';
            btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
        }
    }

    function setNativeSearchHidden(hidden) {
        GM_setValue(NATIVE_SEARCH_HIDDEN_KEY, hidden);
        applyNativeSearchHidden(hidden);
    }

    function mountNativeSearchToggle(parentContainer) {
        if (!parentContainer || document.getElementById('tm-toggle-native-search')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'tm-toggle-native-search';
        btn.className = 'tm-toggle-native-search-btn';
        btn.addEventListener('click', () => {
            setNativeSearchHidden(!isNativeSearchHidden());
        });

        parentContainer.appendChild(btn);
        applyNativeSearchHidden(isNativeSearchHidden());
    }

    function mountQuickSearchBar(parentContainer, config) {
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

            searchBtn.addEventListener('click', () => {
                const input = getActiveInput();
                submitFromInput(input, input.dataset.searchBase);
            });

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

    function ensureHeaderSearchHost() {
        let host = document.getElementById('tm-header-quick-search-host');
        if (host) return host;

        const hfiller = findHeaderFiller();
        if (!hfiller) return null;

        host = document.createElement('div');
        host.id = 'tm-header-quick-search-host';
        host.className = 'tm-header-quick-search-host';
        hfiller.appendChild(host);
        return host;
    }

    function mountHeaderQuickSearch(config) {
        const host = ensureHeaderSearchHost();
        if (!host) return false;

        mountQuickSearchBar(host, config);
        mountNativeSearchToggle(host);
        applyNativeSearchHidden(isNativeSearchHidden());
        return true;
    }

    function updateFooterQuickSearchVisibility(config) {
        const bar = document.getElementById('tm-footer-quick-search');
        const host = document.getElementById('tm-header-quick-search-host');
        const enabled = config?.footerQuickSearchEnabled !== false;
        const display = enabled ? 'inline-flex' : 'none';
        if (bar) bar.style.display = display;
        if (host) host.style.display = enabled ? 'inline-flex' : 'none';
    }

    function initFooterQuickSearch(config) {
        const tryMount = (attempt = 0) => {
            if (config?.footerQuickSearchEnabled === false) {
                updateFooterQuickSearchVisibility(config);
                return;
            }
            if (mountHeaderQuickSearch(config)) return;
            if (attempt < 50) {
                setTimeout(() => tryMount(attempt + 1), 300);
            }
        };
        tryMount();
    }

    window.initFooterQuickSearch = initFooterQuickSearch;
    window.updateFooterQuickSearchVisibility = updateFooterQuickSearchVisibility;
    window.setNativeSearchHidden = setNativeSearchHidden;
})();
