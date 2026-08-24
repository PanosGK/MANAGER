// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Remove leftover header search; stop native Runner leftover qs (e.g. 6826) from re-submitting
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const NATIVE_SEARCH_HIDDEN_KEY = 'tm_native_search_hidden';
    const LEGACY_QS_KEYS = ['tm_footer_qs_repair', 'tm_footer_qs_parts'];
    const nativeTyped = { value: '', at: 0 };

    function restoreNativeSearch() {
        try { GM_setValue(NATIVE_SEARCH_HIDDEN_KEY, false); } catch (_) { /* ignore */ }
        document.body?.classList.remove('tm-native-search-hidden');
        document.querySelectorAll('.rnr-b-search').forEach((el) => {
            el.style.display = '';
            el.style.pointerEvents = '';
        });
        document.querySelectorAll('[data-tm-native-search-suppressed="1"]').forEach((el) => {
            el.removeAttribute('data-tm-native-search-suppressed');
            el.style.pointerEvents = '';
            el.style.visibility = '';
        });
    }

    function unwrapRepairTitleRow() {
        const row = document.getElementById('tm-repair-edit-title-row');
        if (row?.parentNode) {
            const parent = row.parentNode;
            while (row.firstChild) parent.insertBefore(row.firstChild, row);
            row.remove();
        }
        document.querySelectorAll('.tm-repair-edit-header-with-search').forEach((el) => {
            el.classList.remove('tm-repair-edit-header-with-search');
        });
    }

    function removeHeaderQuickSearch() {
        [
            'tm-footer-quick-search',
            'tm-header-quick-search-host',
            'tm-repair-edit-quick-search-host',
            'tm-toggle-native-search',
        ].forEach((id) => document.getElementById(id)?.remove());
        document.querySelectorAll('.tm-qs-host, .tm-qs-panel, .tm-header-orphan-btn').forEach((el) => {
            if (el.classList.contains('tm-header-orphan-btn')) {
                el.classList.remove('tm-header-orphan-btn');
                return;
            }
            el.remove();
        });
        unwrapRepairTitleRow();
        restoreNativeSearch();
        LEGACY_QS_KEYS.forEach((key) => {
            try { GM_setValue(key, ''); } catch (_) { /* ignore */ }
        });
    }

    function nativeSearchFields() {
        return document.querySelectorAll('input[id^="ctlSearchFor"], input[name^="ctlSearchFor"]');
    }

    function isNativeSearchField(el) {
        if (!el) return false;
        return /ctlSearchFor/i.test(String(el.id || '')) || /ctlSearchFor/i.test(String(el.name || ''));
    }

    function currentUrlQs() {
        try {
            return String(new URLSearchParams(location.search).get('qs') || '').trim();
        } catch (_) {
            return '';
        }
    }

    function userTypedNativeValue(value) {
        const q = String(value || '').trim();
        return !!(q && q === nativeTyped.value && (Date.now() - nativeTyped.at) < 120000);
    }

    function clearStaleNativeSearch({ force = false } = {}) {
        const urlQs = currentUrlQs();
        nativeSearchFields().forEach((el) => {
            const v = String(el.value || '').trim();
            if (!v) {
                try { el.setAttribute('value', ''); } catch (_) { /* ignore */ }
                return;
            }
            if (!force) {
                if (urlQs && v === urlQs) return;
                if (document.activeElement === el && userTypedNativeValue(v)) return;
                if (userTypedNativeValue(v)) return;
            }
            el.value = '';
            try { el.setAttribute('value', ''); } catch (_) { /* ignore */ }
        });
    }

    function hardenNativeSearchFields() {
        nativeSearchFields().forEach((el) => {
            if (el.dataset.tmQsNativeHardened === '1') return;
            el.dataset.tmQsNativeHardened = '1';
            el.setAttribute('autocomplete', 'off');
            el.setAttribute('data-lpignore', 'true');
            el.setAttribute('data-1p-ignore', 'true');
        });
    }

    function restoreMisplacedNativeSearchControls() {
        const brick = document.querySelector('.rnr-b-search');
        if (!brick) return;
        document.querySelectorAll([
            'a[id^="searchButtTop"]',
            'a[id^="searchButton"]',
            'a[id^="clearSearch"]',
            'a.rnr-button[data-icon="search"]',
            'input[id^="ctlSearchFor"]',
            'input[name^="ctlSearchFor"]',
        ].join(',')).forEach((el) => {
            if (brick.contains(el)) return;
            if (el.closest?.('#tm-footer-quick-search, .tm-qs-host')) return;
            brick.appendChild(el);
        });
    }

    function installNativeLeftoverGuard() {
        if (window.__tmNativeLeftoverGuard) return;
        window.__tmNativeLeftoverGuard = true;

        document.addEventListener('keydown', (e) => {
            if (!e.isTrusted) return;
            if (!isNativeSearchField(e.target)) return;
            if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter') {
                setTimeout(() => {
                    nativeTyped.value = String(e.target.value || '').trim();
                    nativeTyped.at = Date.now();
                }, 0);
            }
        }, true);

        document.addEventListener('paste', (e) => {
            if (!e.isTrusted) return;
            if (!isNativeSearchField(e.target)) return;
            setTimeout(() => {
                nativeTyped.value = String(e.target.value || '').trim();
                nativeTyped.at = Date.now();
            }, 0);
        }, true);

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            if (!isNativeSearchField(e.target)) return;
            const q = String(e.target.value || '').trim();
            if (!q) return;
            if (userTypedNativeValue(q)) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            clearStaleNativeSearch({ force: true });
        }, true);

        document.addEventListener('click', (e) => {
            // Programmatic clicks (e.g. order-link auto-search) are untrusted — leave them.
            if (!e.isTrusted) return;
            const t = e.target;
            if (!t || typeof t.closest !== 'function') return;
            const nativeBtn = t.closest(
                'a[id^="searchButtTop"], a[id^="searchButton"], a.rnr-button[data-icon="search"]'
            );
            if (!nativeBtn) return;
            const field = document.querySelector('input[id^="ctlSearchFor"], input[name^="ctlSearchFor"]');
            const q = String(field?.value || '').trim();
            if (!q || userTypedNativeValue(q) || q === currentUrlQs()) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            clearStaleNativeSearch({ force: true });
        }, true);

        document.addEventListener('submit', (e) => {
            if (!e.isTrusted) return;
            const form = e.target;
            if (!form || typeof form.querySelector !== 'function') return;
            const field = form.querySelector('input[id^="ctlSearchFor"], input[name^="ctlSearchFor"]');
            if (!field) return;
            const q = String(field.value || '').trim();
            if (!q || userTypedNativeValue(q) || q === currentUrlQs()) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            clearStaleNativeSearch({ force: true });
        }, true);

        window.addEventListener('pageshow', () => {
            nativeTyped.value = '';
            nativeTyped.at = 0;
            clearStaleNativeSearch();
            hardenNativeSearchFields();
        });
    }

    function initFooterQuickSearch() {
        removeHeaderQuickSearch();
        installNativeLeftoverGuard();
        restoreMisplacedNativeSearchControls();
        hardenNativeSearchFields();
        clearStaleNativeSearch();

        let attempts = 0;
        const poll = () => {
            attempts += 1;
            if (document.getElementById('tm-header-quick-search-host')
                || document.getElementById('tm-footer-quick-search')
                || document.getElementById('tm-repair-edit-quick-search-host')) {
                removeHeaderQuickSearch();
            }
            restoreMisplacedNativeSearchControls();
            hardenNativeSearchFields();
            clearStaleNativeSearch();
            if (attempts < 25) setTimeout(poll, 300);
        };
        setTimeout(poll, 0);
    }

    window.initFooterQuickSearch = initFooterQuickSearch;
    window.updateFooterQuickSearchVisibility = removeHeaderQuickSearch;
    window.setNativeSearchHidden = () => restoreNativeSearch();
})();
