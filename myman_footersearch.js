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
    // Legacy keys from an old persist feature — clear so they cannot resurface.
    const LEGACY_QS_KEYS = ['tm_footer_qs_repair', 'tm_footer_qs_parts'];
    // Only honor dirty flags stamped during THIS page load (bfcache / HTML clones
    // can resurrect old data-* flags from a prior visit).
    const QS_PAGE_TOKEN = `p${Date.now().toString(36)}`;

    function buildSearchUrl(base, query) {
        const q = String(query || '').trim();
        if (!q) return '';
        return `${base}${encodeURIComponent(q)}`;
    }

    function goToSearch(url) {
        if (!url) return;
        window.location.href = url;
    }

    function resetQuickSearchInput(input) {
        if (!input) return;
        input.value = '';
        delete input.dataset.tmQsDirty;
        delete input.dataset.tmQsLastEdit;
        delete input.dataset.tmQsSession;
        delete input.dataset.tmQsUserKey;
    }

    function markQuickSearchTyped(input) {
        if (!input) return;
        input.dataset.tmQsDirty = '1';
        input.dataset.tmQsSession = QS_PAGE_TOKEN;
        input.dataset.tmQsLastEdit = String(Date.now());
    }

    /** True only if the user actually pressed keys in this field on this page. */
    function isQuickSearchTypedThisPage(input) {
        return input?.dataset?.tmQsDirty === '1'
            && input.dataset.tmQsSession === QS_PAGE_TOKEN
            && input.dataset.tmQsUserKey === '1';
    }

    function clearNativeSearchFields({ force = false } = {}) {
        document.querySelectorAll('input[id^="ctlSearchFor"], input[name^="ctlSearchFor"]').forEach((el) => {
            if (!force && document.activeElement === el) return;
            el.value = '';
            try { el.setAttribute('value', ''); } catch (_) { /* ignore */ }
        });
    }

    function submitFromInput(input, baseUrl) {
        // Capture BEFORE any resets — clearing the live input must not change the URL.
        const url = buildSearchUrl(baseUrl, input?.value);
        if (url) {
            // Clear BOTH quick-search fields and the native Runner box so a leftover
            // qs (e.g. "6826") cannot win the next submit or get re-posted by the form.
            document.querySelectorAll('#tm-footer-repair-search, #tm-footer-parts-search')
                .forEach(resetQuickSearchInput);
            clearNativeSearchFields({ force: true });
            goToSearch(url);
        } else {
            input?.focus();
        }
    }

    function clearLegacyQuickSearchStorage() {
        LEGACY_QS_KEYS.forEach((key) => {
            try { GM_setValue(key, ''); } catch (_) { /* ignore */ }
        });
    }

    /** Harden against browser autofill (often ignores autocomplete=off). */
    function hardenQuickSearchInput(input) {
        if (!input) return;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('data-lpignore', 'true');
        input.setAttribute('data-1p-ignore', 'true');
        input.setAttribute('data-form-type', 'other');
        // Odd name discourages password-manager / history autofill of prior qs terms.
        if (!input.name || input.name.startsWith('tm-qs-')) {
            input.name = `tm-qs-${input.id || 'field'}-${Math.random().toString(36).slice(2, 8)}`;
        }
        // Autofill fires `input` without keydown — only trust real keystrokes.
        input.addEventListener('keydown', (e) => {
            if (!e.isTrusted) return;
            if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter') {
                input.dataset.tmQsUserKey = '1';
            }
        });
        input.addEventListener('input', () => {
            if (input.dataset.tmQsUserKey !== '1') {
                // Browser autofill of a prior qs (e.g. "6826") — drop it.
                if (input.value) input.value = '';
                delete input.dataset.tmQsDirty;
                delete input.dataset.tmQsLastEdit;
                delete input.dataset.tmQsSession;
                return;
            }
            markQuickSearchTyped(input);
        });
        input.addEventListener('focus', () => {
            if (input.readOnly) input.readOnly = false;
        });
        // Block autofill paint, then unlock for typing.
        input.readOnly = true;
        const unlock = () => { input.readOnly = false; };
        setTimeout(unlock, 0);
        setTimeout(unlock, 250);
    }

    function scrubStaleQuickSearchValues(bar) {
        if (!bar) return;
        bar.querySelectorAll('#tm-footer-repair-search, #tm-footer-parts-search').forEach((input) => {
            // Keep only text the user is actively typing on this page.
            if (document.activeElement === input && isQuickSearchTypedThisPage(input)) return;
            if (isQuickSearchTypedThisPage(input) && input.dataset.tmQsLastEdit) {
                const age = Date.now() - Number(input.dataset.tmQsLastEdit);
                if (age >= 0 && age < 5000) return;
            }
            resetQuickSearchInput(input);
        });
        // Native Runner box often keeps the last qs from the server HTML — wipe it so
        // an accidental Enter / search-button click cannot re-run e.g. "6826".
        clearNativeSearchFields();
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
        if (hidden) clearNativeSearchFields();
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

    /**
     * Hard-block accidental Runner search submits of a stale ctlSearchFor value
     * (e.g. a prior "6826" left in the native box by the server / autofill).
     */
    function installNativeSearchGuard() {
        if (window.__tmNativeSearchGuard) return;
        window.__tmNativeSearchGuard = true;

        // bfcache back-restore resurrects input values AND dirty flags, letting an
        // old query outrank whatever the user types next — reset both fields fully.
        window.addEventListener('pageshow', (e) => {
            if (!e.persisted) return;
            document
                .querySelectorAll('#tm-footer-repair-search, #tm-footer-parts-search')
                .forEach(resetQuickSearchInput);
            clearNativeSearchFields({ force: true });
        });

        // Enter in our quick-search field must never fall through to the page form
        // (which would submit native ctlSearchFor leftover instead).
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const t = e.target;
            if (!t || !t.classList || !t.classList.contains('tm-qs-input')) return;
            if (!t.closest('#tm-footer-quick-search, .tm-qs-host')) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            if (t.value.trim() && t.dataset.searchBase) {
                t.dataset.tmQsUserKey = '1';
                markQuickSearchTyped(t);
                submitFromInput(t, t.dataset.searchBase);
            } else {
                document.getElementById('tm-footer-search-submit')?.click();
            }
        }, true);

        document.addEventListener('submit', (e) => {
            const active = document.activeElement;
            if (!active || !active.closest?.('#tm-footer-quick-search, .tm-qs-host')) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            if (active.classList?.contains('tm-qs-input') && active.dataset.searchBase && active.value.trim()) {
                active.dataset.tmQsUserKey = '1';
                markQuickSearchTyped(active);
                submitFromInput(active, active.dataset.searchBase);
            }
        }, true);

        // Always block native search-button clicks when the box still holds a stale
        // leftover and our quick-search bar is present — unless the user is typing
        // in the native field itself.
        document.addEventListener('click', (e) => {
            const t = e.target;
            if (!t || typeof t.closest !== 'function') return;
            if (t.closest('#tm-footer-quick-search, .tm-qs-host')) return;
            const nativeBtn = t.closest(
                'a[id^="searchButtTop"], a[id^="searchButton"], a.rnr-button[data-icon="search"], [data-tm-native-search-suppressed="1"]'
            );
            if (!nativeBtn) return;

            if (isNativeSearchHidden()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }

            // Prefer our typed quick-search over a stale native leftover.
            const ourTyped = [...document.querySelectorAll('#tm-footer-repair-search, #tm-footer-parts-search')]
                .filter((input) => isQuickSearchTypedThisPage(input) && input.value.trim())
                .sort((a, b) => Number(b.dataset.tmQsLastEdit || 0) - Number(a.dataset.tmQsLastEdit || 0))[0];
            if (ourTyped?.dataset?.searchBase) {
                e.preventDefault();
                e.stopImmediatePropagation();
                submitFromInput(ourTyped, ourTyped.dataset.searchBase);
            }
        }, true);

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            const t = e.target;
            if (!t) return;
            const id = String(t.id || '');
            const name = String(t.name || '');
            if (!/ctlSearchFor/i.test(id) && !/ctlSearchFor/i.test(name)) return;

            if (isNativeSearchHidden()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return;
            }

            // Prefer our typed quick-search over native leftovers.
            const ourTyped = [...document.querySelectorAll('#tm-footer-repair-search, #tm-footer-parts-search')]
                .filter((input) => isQuickSearchTypedThisPage(input) && input.value.trim())
                .sort((a, b) => Number(b.dataset.tmQsLastEdit || 0) - Number(a.dataset.tmQsLastEdit || 0))[0];
            if (ourTyped?.dataset?.searchBase) {
                e.preventDefault();
                e.stopImmediatePropagation();
                submitFromInput(ourTyped, ourTyped.dataset.searchBase);
            }
        }, true);
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
        if (bar && bar.dataset.tmQsLive !== '1') {
            // Dead clone without listeners — Enter would native-submit a stale qs.
            bar.remove();
            bar = null;
        }
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'tm-footer-quick-search';
            bar.className = 'tm-qs-panel';
            bar.setAttribute('role', 'search');
            bar.setAttribute('aria-label', 'Γρήγορη αναζήτηση');
            bar.dataset.tmQsLive = '1';

            const repairGroup = document.createElement('div');
            repairGroup.className = 'tm-qs-input-group';

            const repairInput = document.createElement('input');
            repairInput.type = 'text';
            repairInput.id = 'tm-footer-repair-search';
            repairInput.className = 'tm-qs-input';
            repairInput.placeholder = 'Αρ., τηλέφωνο, πελάτης…';
            repairInput.setAttribute('aria-label', 'Αναζήτηση επισκευών');
            repairInput.spellcheck = false;
            repairInput.dataset.searchBase = REPAIR_SEARCH_URL;
            hardenQuickSearchInput(repairInput);

            repairGroup.appendChild(repairInput);

            const partsGroup = document.createElement('div');
            partsGroup.className = 'tm-qs-input-group';

            const partsInput = document.createElement('input');
            partsInput.type = 'text';
            partsInput.id = 'tm-footer-parts-search';
            partsInput.className = 'tm-qs-input';
            partsInput.placeholder = 'Κωδικός, barcode…';
            partsInput.setAttribute('aria-label', 'Αναζήτηση ανταλλακτικών');
            partsInput.spellcheck = false;
            partsInput.dataset.searchBase = PARTS_SEARCH_URL;
            hardenQuickSearchInput(partsInput);

            partsGroup.appendChild(partsInput);

            const searchBtn = document.createElement('button');
            searchBtn.type = 'button';
            // Do NOT use Runner's .rnr-button — it can be bound/relocated as a native control
            // and intercept clicks meant for grid sort headers (.rnr-orderlink).
            searchBtn.id = 'tm-footer-search-submit';
            searchBtn.className = 'tm-qs-search-btn';
            searchBtn.textContent = 'Αναζήτηση';

            const isDirty = (input) => isQuickSearchTypedThisPage(input);
            const lastEdit = (input) => Number(input?.dataset?.tmQsLastEdit || 0);

            const resolveSearchInput = () => {
                const qRepair = repairInput.value.trim();
                const qParts = partsInput.value.trim();
                if (!qRepair && !qParts) return null;

                const active = document.activeElement;
                // Prefer the focused field (user is clearly typing / scanning there).
                if (active === partsInput && qParts) return partsInput;
                if (active === repairInput && qRepair) return repairInput;
                // Button click with unfocused fields: only honor user-typed values,
                // most recently edited first — an older leftover (e.g. a stale "6826")
                // must never outrank what the user just typed in the other field.
                const dirtyCandidates = [repairInput, partsInput]
                    .filter((input) => input.value.trim() && isDirty(input))
                    .sort((a, b) => lastEdit(b) - lastEdit(a));
                return dirtyCandidates[0] || null;
            };

            const handleSearch = () => {
                const input = resolveSearchInput();
                if (!input) {
                    // Drop stale autofill so the next click cannot search it.
                    if (!isDirty(repairInput)) resetQuickSearchInput(repairInput);
                    if (!isDirty(partsInput)) resetQuickSearchInput(partsInput);
                    repairInput.focus();
                    return;
                }
                submitFromInput(input, input.dataset.searchBase);
            };

            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearch();
            });

            repairInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (repairInput.value.trim()) {
                        repairInput.dataset.tmQsUserKey = '1';
                        markQuickSearchTyped(repairInput);
                        submitFromInput(repairInput, repairInput.dataset.searchBase);
                    } else {
                        handleSearch();
                    }
                }
            });

            partsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (partsInput.value.trim()) {
                        partsInput.dataset.tmQsUserKey = '1';
                        markQuickSearchTyped(partsInput);
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
            // Beat late browser autofill of prior qs terms.
            scrubStaleQuickSearchValues(bar);
            setTimeout(() => scrubStaleQuickSearchValues(bar), 0);
            setTimeout(() => scrubStaleQuickSearchValues(bar), 400);
            setTimeout(() => scrubStaleQuickSearchValues(bar), 1200);
        } else if (bar.parentElement !== parentContainer) {
            parentContainer.appendChild(bar);
            if (!document.getElementById('tm-toggle-native-search')) {
                mountNativeSearchToggle(bar);
            }
            resetQuickSearchInput(bar.querySelector('#tm-footer-repair-search'));
            resetQuickSearchInput(bar.querySelector('#tm-footer-parts-search'));
        }

        bar.querySelectorAll('.tm-qs-input-group label').forEach((label) => label.remove());

        // Legacy bars used Runner's .rnr-button — strip it so native handlers ignore our control.
        const legacyBtn = bar.querySelector('#tm-footer-search-submit');
        if (legacyBtn) {
            legacyBtn.classList.remove('rnr-button');
            legacyBtn.classList.add('tm-qs-search-btn');
            legacyBtn.type = 'button';
        }

        scrubStaleQuickSearchValues(bar);
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
        clearLegacyQuickSearchStorage();
        installNativeSearchGuard();
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
