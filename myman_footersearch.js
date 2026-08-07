// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Quick search in header or repair edit header
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

    function isRepairEditPage() {
        return window.location.pathname.includes('service_edit.php');
    }

    function findRepairEditHeader() {
        return document.querySelector('.rnr-brickcontents.style2.rnr-b-editheader')
            || document.querySelector('.rnr-brickcontents.rnr-b-editheader')
            || document.querySelector('.rnr-b-editheader');
    }

    function findHeaderFiller() {
        return document.querySelector('#head-outterwrap .rnr-hfiller')
            || document.querySelector('#head-outter .rnr-hfiller')
            || document.querySelector('.rnr-top .rnr-hfiller')
            || document.querySelector('.rnr-hfiller');
    }

    /** Native Runner search controls — never relocate these (they must stay in .rnr-b-search). */
    function isNativeSearchControl(el) {
        if (!el || el.nodeType !== 1) return false;
        if (el.closest?.('.rnr-b-search, .rnr-search, .searchform')) return true;
        const id = String(el.id || '');
        if (/^(searchButtTop|searchButton|clearSearch|showOptPanel|showSrchWin|advButton|ctlSearchFor|simpleSrch)/i.test(id)) {
            return true;
        }
        if (el.getAttribute?.('data-icon') === 'search') return true;
        if (el.matches?.('input[name^="ctlSearchFor"], a[name="skipsearch"]')) return true;
        return false;
    }

    /** Loose header actions (e.g. Εξαγωγή) that sit outside search/loggedas bricks and break the row. */
    function isHeaderOrphanAction(el) {
        if (!el || el.nodeType !== 1) return false;
        if (el.classList.contains('rnr-bl')
            || el.classList.contains('rnr-br')
            || el.classList.contains('rnr-hfiller')
            || el.classList.contains('tm-qs-host')) {
            return false;
        }
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return false;
        if (el.tagName === 'A' && el.getAttribute('name') === 'skipsearch') return false;
        // Never pull native search buttons out of their brick — that leaves them
        // clickable over the grid (e.g. column sort headers like .rnr-orderlink).
        if (isNativeSearchControl(el)) return false;
        if (el.id === 'export_1' || el.matches?.('a[href*="service_export.php"]')) return true;
        return el.matches?.('a.rnr-button, button.rnr-button') === true
            && !el.classList.contains('tm-qs-search-btn');
    }

    function relocateHeaderOrphanButtons(hfiller) {
        if (!hfiller) return;
        const menu = hfiller.closest('.rnr-c-hmenu') || hfiller.parentElement;
        if (!menu) return;

        // Undo prior bad relocations: put native search controls back into their brick.
        hfiller.querySelectorAll('.tm-header-orphan-btn').forEach((btn) => {
            if (!isNativeSearchControl(btn)) return;
            btn.classList.remove('tm-header-orphan-btn');
            btn.style.pointerEvents = '';
            btn.style.visibility = '';
            btn.removeAttribute('data-tm-native-search-suppressed');
            const searchBrick = menu.querySelector('.rnr-b-search') || document.querySelector('.rnr-b-search');
            if (searchBrick && !searchBrick.contains(btn)) {
                searchBrick.appendChild(btn);
            }
        });

        const orphans = [...menu.children].filter(isHeaderOrphanAction);
        if (!orphans.length) return;

        const host = document.getElementById('tm-header-quick-search-host');
        orphans.forEach((btn) => {
            btn.classList.add('tm-header-orphan-btn');
            if (host && host.parentElement === hfiller) {
                hfiller.insertBefore(btn, host);
            } else if (!hfiller.contains(btn)) {
                hfiller.prepend(btn);
            }
        });
    }

    function getNativeSearchBlocks() {
        const exact = document.querySelectorAll(NATIVE_SEARCH_SELECTOR);
        if (exact.length) return exact;
        return document.querySelectorAll('.rnr-b-search');
    }

    function isNativeSearchHidden() {
        return GM_getValue(NATIVE_SEARCH_HIDDEN_KEY, false) === true;
    }

    function getNativeSearchLooseControls() {
        return document.querySelectorAll([
            'a[id^="searchButtTop"]',
            'a[id^="searchButton"]',
            'a[id^="clearSearch"]',
            'a[id^="showOptPanel"]',
            'a[id^="showSrchWin"]',
            'a[id^="advButton"]',
            'input[id^="ctlSearchFor"]',
            'input[name^="ctlSearchFor"]',
            'a.rnr-button[data-icon="search"]',
        ].join(','));
    }

    function applyNativeSearchHidden(hidden) {
        document.body.classList.toggle('tm-native-search-hidden', hidden);
        getNativeSearchBlocks().forEach((el) => {
            el.style.display = hidden ? 'none' : '';
            el.style.pointerEvents = hidden ? 'none' : '';
        });
        // Also disable any search controls that were left outside .rnr-b-search
        // (e.g. previously relocated orphans) so they cannot intercept grid clicks.
        getNativeSearchLooseControls().forEach((el) => {
            if (hidden) {
                el.setAttribute('data-tm-native-search-suppressed', '1');
                el.style.pointerEvents = 'none';
                if (!el.closest('.rnr-b-search')) {
                    el.style.visibility = 'hidden';
                }
            } else if (el.getAttribute('data-tm-native-search-suppressed') === '1') {
                el.removeAttribute('data-tm-native-search-suppressed');
                el.style.pointerEvents = '';
                el.style.visibility = '';
            }
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
        btn.className = 'tm-qs-hide-native';
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
            bar.className = 'tm-qs-panel';
            bar.setAttribute('role', 'search');
            bar.setAttribute('aria-label', 'Γρήγορη αναζήτηση');

            const repairGroup = document.createElement('div');
            repairGroup.className = 'tm-qs-input-group';

            const repairInput = document.createElement('input');
            repairInput.type = 'text';
            repairInput.id = 'tm-footer-repair-search';
            repairInput.className = 'tm-qs-input';
            repairInput.placeholder = 'Αρ., τηλέφωνο, πελάτης…';
            repairInput.setAttribute('aria-label', 'Αναζήτηση επισκευών');
            repairInput.autocomplete = 'off';
            repairInput.setAttribute('autocomplete', 'off');
            repairInput.spellcheck = false;
            repairInput.dataset.searchBase = REPAIR_SEARCH_URL;

            repairGroup.appendChild(repairInput);

            const partsGroup = document.createElement('div');
            partsGroup.className = 'tm-qs-input-group';

            const partsInput = document.createElement('input');
            partsInput.type = 'text';
            partsInput.id = 'tm-footer-parts-search';
            partsInput.className = 'tm-qs-input';
            partsInput.placeholder = 'Κωδικός, barcode…';
            partsInput.setAttribute('aria-label', 'Αναζήτηση ανταλλακτικών');
            partsInput.autocomplete = 'off';
            partsInput.setAttribute('autocomplete', 'off');
            partsInput.spellcheck = false;
            partsInput.dataset.searchBase = PARTS_SEARCH_URL;

            partsGroup.appendChild(partsInput);

            const searchBtn = document.createElement('button');
            searchBtn.type = 'button';
            // Do NOT use Runner's .rnr-button — it can be bound/relocated as a native control
            // and intercept clicks meant for grid sort headers (.rnr-orderlink).
            searchBtn.id = 'tm-footer-search-submit';
            searchBtn.className = 'tm-qs-search-btn';
            searchBtn.textContent = 'Αναζήτηση';

            const resolveSearchInput = () => {
                const qRepair = repairInput.value.trim();
                const qParts = partsInput.value.trim();
                if (!qRepair && !qParts) return null;

                const active = document.activeElement;
                if (active === partsInput && qParts) return partsInput;
                if (active === repairInput && qRepair) return repairInput;
                if (qRepair) return repairInput;
                if (qParts) return partsInput;
                return null;
            };

            const handleSearch = () => {
                const input = resolveSearchInput();
                if (!input) {
                    repairInput.focus();
                    return;
                }
                submitFromInput(input, input.dataset.searchBase);
            };

            searchBtn.addEventListener('click', handleSearch);

            repairInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (repairInput.value.trim()) {
                        submitFromInput(repairInput, repairInput.dataset.searchBase);
                    } else {
                        handleSearch();
                    }
                }
            });

            partsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (partsInput.value.trim()) {
                        submitFromInput(partsInput, partsInput.dataset.searchBase);
                    } else {
                        handleSearch();
                    }
                }
            });

            bar.appendChild(repairGroup);
            bar.appendChild(partsGroup);
            bar.appendChild(searchBtn);
            parentContainer.appendChild(bar);

            mountNativeSearchToggle(bar);
        } else if (bar.parentElement !== parentContainer) {
            parentContainer.appendChild(bar);
            if (!document.getElementById('tm-toggle-native-search')) {
                mountNativeSearchToggle(bar);
            }
            const movedRepairInput = bar.querySelector('#tm-footer-repair-search');
            const movedPartsInput = bar.querySelector('#tm-footer-parts-search');
            if (movedRepairInput) movedRepairInput.value = '';
            if (movedPartsInput) movedPartsInput.value = '';
        }

        bar.querySelectorAll('.tm-qs-input-group label').forEach((label) => label.remove());

        // Legacy bars used Runner's .rnr-button — strip it so native handlers ignore our control.
        const legacyBtn = bar.querySelector('#tm-footer-search-submit');
        if (legacyBtn) {
            legacyBtn.classList.remove('rnr-button');
            legacyBtn.classList.add('tm-qs-search-btn');
            legacyBtn.type = 'button';
        }

        updateFooterQuickSearchVisibility(config);
    }

    function ensureRepairEditHeaderHost() {
        let host = document.getElementById('tm-repair-edit-quick-search-host');
        const header = findRepairEditHeader();
        if (!header) return null;

        header.classList.add('tm-repair-edit-header-with-search');

        const title = header.querySelector('h1');
        if (!title) {
            if (!host) {
                host = document.createElement('div');
                host.id = 'tm-repair-edit-quick-search-host';
                host.className = 'tm-qs-host tm-qs-host--repair';
                header.append(host);
            }
            return host;
        }

        let row = document.getElementById('tm-repair-edit-title-row');
        if (!row) {
            row = document.createElement('div');
            row.id = 'tm-repair-edit-title-row';
            row.className = 'tm-repair-edit-title-row';
            title.parentNode.insertBefore(row, title);
            row.appendChild(title);
        } else if (!row.contains(title)) {
            row.insertBefore(title, row.firstChild);
        }

        if (!host) {
            host = document.createElement('div');
            host.id = 'tm-repair-edit-quick-search-host';
            host.className = 'tm-qs-host tm-qs-host--repair';
        }

        if (!row.contains(host)) {
            row.appendChild(host);
        }

        return host;
    }

    function ensureHeaderSearchHost() {
        let host = document.getElementById('tm-header-quick-search-host');
        if (host && (host.getAttribute('data-tm-ui-shell') === '1'
            || (typeof window.tmIsUiShellEl === 'function' && window.tmIsUiShellEl(host)))) {
            host.remove();
            host = null;
        }
        const hfiller = host?.closest('.rnr-hfiller') || findHeaderFiller();
        if (!hfiller) return host || null;

        if (!host) {
            host = document.createElement('div');
            host.id = 'tm-header-quick-search-host';
            host.className = 'tm-qs-host tm-qs-host--header';
            hfiller.prepend(host);
        }

        relocateHeaderOrphanButtons(hfiller);
        return host;
    }

    function mountRepairEditHeaderQuickSearch(config) {
        const host = ensureRepairEditHeaderHost();
        if (!host) return false;

        const headerHost = document.getElementById('tm-header-quick-search-host');
        if (headerHost) headerHost.style.display = 'none';

        mountQuickSearchBar(host, config);
        applyNativeSearchHidden(isNativeSearchHidden());
        return true;
    }

    function mountHeaderQuickSearch(config) {
        const repairHost = document.getElementById('tm-repair-edit-quick-search-host');
        if (repairHost) repairHost.style.display = 'none';

        const host = ensureHeaderSearchHost();
        if (!host) return false;

        mountQuickSearchBar(host, config);
        applyNativeSearchHidden(isNativeSearchHidden());
        return true;
    }

    function mountQuickSearch(config) {
        if (isRepairEditPage()) {
            return mountRepairEditHeaderQuickSearch(config);
        }
        return mountHeaderQuickSearch(config);
    }

    function updateFooterQuickSearchVisibility(config) {
        const bar = document.getElementById('tm-footer-quick-search');
        const headerHost = document.getElementById('tm-header-quick-search-host');
        const repairHost = document.getElementById('tm-repair-edit-quick-search-host');
        const enabled = config?.footerQuickSearchEnabled !== false;
        const display = enabled ? 'flex' : 'none';
        if (bar) bar.style.display = display;
        [headerHost, repairHost].forEach((el) => {
            if (el) el.style.display = 'none';
        });
        if (!enabled) return;
        if (isRepairEditPage()) {
            if (repairHost) repairHost.style.display = 'flex';
        } else if (headerHost) {
            headerHost.style.display = 'flex';
        }
    }

    function initFooterQuickSearch(config) {
        const tryMount = (attempt = 0) => {
            if (config?.footerQuickSearchEnabled === false) {
                updateFooterQuickSearchVisibility(config);
                return;
            }
            if (mountQuickSearch(config)) return;
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
