// ==UserScript==
// @name         MyMANAGER Footer Quick Search (module)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Header quick search removed — teardown leftover hosts and restore native search
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';

    const NATIVE_SEARCH_HIDDEN_KEY = 'tm_native_search_hidden';
    const LEGACY_QS_KEYS = ['tm_footer_qs_repair', 'tm_footer_qs_parts'];

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

    function initFooterQuickSearch() {
        removeHeaderQuickSearch();
        // Catch late FOUC/shell remounts of the old header bar.
        let attempts = 0;
        const poll = () => {
            attempts += 1;
            if (document.getElementById('tm-header-quick-search-host')
                || document.getElementById('tm-footer-quick-search')
                || document.getElementById('tm-repair-edit-quick-search-host')) {
                removeHeaderQuickSearch();
            }
            if (attempts < 20) setTimeout(poll, 400);
        };
        setTimeout(poll, 400);
    }

    window.initFooterQuickSearch = initFooterQuickSearch;
    window.updateFooterQuickSearchVisibility = removeHeaderQuickSearch;
    window.setNativeSearchHidden = () => restoreNativeSearch();
})();
