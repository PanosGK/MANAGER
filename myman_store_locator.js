// ==UserScript==
// @name         MyManager Store Locator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Model-first store availability finder for the phone catalog.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const MINE_STORE_KEY = '__mine__';

    function cleanStoreName(name) {
        return String(name || '').replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
    }

    function phoneToVariant(phone, helpers) {
        const { extractGB, extractColor } = helpers;
        return {
            grade: phone.grade || '',
            gb: extractGB(phone.name || phone.model) || '',
            color: extractColor(phone.name || phone.model) || '',
            barcode: phone.barcode,
            price: phone.retailPrice || '',
            isBuyback: !!phone.isBuyback,
            phone,
        };
    }

    function variantKey(v) {
        return [v.barcode, v.grade, v.gb, v.color].join('|');
    }

    function buildModelIndex(allPhones, otherStorePhones, helpers) {
        const { extractBaseModel, normalizePhoneGrade, filterIphoneTitlePhones, filterOneUnitStores } = helpers;
        const map = new Map();

        function ensure(model) {
            if (!map.has(model)) {
                map.set(model, {
                    grades: {},
                    storeNames: new Set(),
                    totalUnits: 0,
                    myCount: 0,
                });
            }
            return map.get(model);
        }

        filterIphoneTitlePhones(allPhones).forEach((phone) => {
            if ((phone.unitsRemaining || 0) <= 0) return;
            const model = extractBaseModel(phone.model);
            if (!model) return;
            const entry = ensure(model);
            entry.totalUnits += 1;
            entry.myCount += 1;
            entry.storeNames.add(MINE_STORE_KEY);
            const g = normalizePhoneGrade(phone.grade);
            if (g) entry.grades[g] = (entry.grades[g] || 0) + 1;
        });

        filterIphoneTitlePhones(otherStorePhones).forEach((phone) => {
            const model = extractBaseModel(phone.model);
            if (!model) return;
            const entry = ensure(model);
            entry.totalUnits += 1;
            const g = normalizePhoneGrade(phone.grade);
            if (g) entry.grades[g] = (entry.grades[g] || 0) + 1;
            filterOneUnitStores(phone.stores || []).forEach((store) => {
                const name = cleanStoreName(store.name);
                if (name) entry.storeNames.add(name);
            });
        });

        return [...map.entries()]
            .map(([model, data]) => [model, {
                ...data,
                storeCount: data.storeNames.size,
            }])
            .filter(([, data]) => data.storeCount > 0 || data.myCount > 0);
    }

    function collectFiltersForModel(allPhones, otherStorePhones, model, helpers) {
        const { extractBaseModel, extractGB, extractColor, filterIphoneTitlePhones } = helpers;
        const grades = new Set();
        const gbs = new Set();
        const colors = new Set();

        const addPhone = (phone) => {
            if (extractBaseModel(phone.model) !== model) return;
            if (phone.grade) grades.add(phone.grade);
            const gb = extractGB(phone.name || phone.model);
            if (gb) gbs.add(gb);
            const color = extractColor(phone.name || phone.model);
            if (color) colors.add(color);
        };

        filterIphoneTitlePhones(allPhones).forEach((p) => {
            if ((p.unitsRemaining || 0) > 0) addPhone(p);
        });
        filterIphoneTitlePhones(otherStorePhones).forEach(addPhone);

        const sortGb = (a, b) => {
            const num = (s) => {
                const tb = s.toUpperCase().includes('TB');
                return parseInt(s, 10) * (tb ? 1024 : 1);
            };
            return num(a) - num(b);
        };

        return {
            grades: [...grades].sort((a, b) => helpers.comparePhoneGrades(a, b)),
            gbs: [...gbs].sort(sortGb),
            colors: [...colors].sort((a, b) => a.localeCompare(b, 'el')),
        };
    }

    function phoneMatchesFilters(phone, model, filters, helpers) {
        const { extractBaseModel, extractGB, extractColor } = helpers;
        if (extractBaseModel(phone.model) !== model) return false;
        if (filters.grade && phone.grade !== filters.grade) return false;
        const gb = extractGB(phone.name || phone.model);
        if (filters.gb && gb !== filters.gb) return false;
        const color = extractColor(phone.name || phone.model);
        if (filters.color && color !== filters.color) return false;
        return true;
    }

    function buildStoreBoardData(model, allPhones, otherStorePhones, filters, helpers) {
        const { filterIphoneTitlePhones, filterOneUnitStores } = helpers;
        const storeMap = new Map();

        function addVariant(storeKey, storeName, isMine, variant) {
            if (!storeMap.has(storeKey)) {
                storeMap.set(storeKey, { name: storeName, isMine, variants: [], seen: new Set() });
            }
            const bucket = storeMap.get(storeKey);
            const key = variantKey(variant);
            if (bucket.seen.has(key)) return;
            bucket.seen.add(key);
            bucket.variants.push(variant);
        }

        filterIphoneTitlePhones(allPhones).forEach((phone) => {
            if ((phone.unitsRemaining || 0) <= 0) return;
            if (!phoneMatchesFilters(phone, model, filters, helpers)) return;
            addVariant(MINE_STORE_KEY, 'Το κατάστημά μου', true, phoneToVariant(phone, helpers));
        });

        filterIphoneTitlePhones(otherStorePhones).forEach((phone) => {
            if (!phoneMatchesFilters(phone, model, filters, helpers)) return;
            const variant = phoneToVariant(phone, helpers);
            const stores = filterOneUnitStores(phone.stores || []);
            if (!stores.length) {
                addVariant('__pending__', 'Άλλα καταστήματα (χωρίς λεπτομέρειες)', false, variant);
                return;
            }
            stores.forEach((store) => {
                const name = cleanStoreName(store.name);
                if (!name) return;
                addVariant(name, name, false, variant);
            });
        });

        const rows = [...storeMap.values()]
            .filter((s) => s.key !== '__pending__' || s.variants.length)
            .map(({ name, isMine, variants }) => ({
                name,
                isMine,
                variants,
                preview: variants.slice(0, 3).map((v) => {
                    const bits = [v.grade, v.gb, v.color].filter(Boolean);
                    return bits.join(' · ');
                }).join(' · '),
            }))
            .sort((a, b) => {
                if (a.isMine) return -1;
                if (b.isMine) return 1;
                return a.name.localeCompare(b.name, 'el');
            });

        const mine = rows.find((r) => r.isMine) || null;
        const others = rows.filter((r) => !r.isMine);

        return { mine, storeRows: others, allRows: rows };
    }

    async function showStoreLocatorModal() {
        if (document.querySelector('.tm-sl-overlay')) return;

        const UI = window.PhoneCatalogUI;
        const helpers = {
            extractBaseModel: window.extractBaseModel || ((m) => m),
            extractGB: window.extractGB || (() => ''),
            extractColor: window.extractColor || (() => ''),
            normalizePhoneGrade: window.normalizePhoneGrade || ((g) => g),
            comparePhoneGrades: window.comparePhoneGrades || ((a, b) => a.localeCompare(b)),
            filterIphoneTitlePhones: window.filterIphoneTitlePhones || ((p) => p),
            filterOneUnitStores: window.filterOneUnitStores || ((s) => s),
            getPhoneGradeCircleStyle: window.getPhoneGradeCircleStyle || (() => ''),
        };

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay tm-sl-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;';
        overlay.innerHTML = UI.buildShellHTML();
        document.body.appendChild(overlay);

        const bodyEl = overlay.querySelector('#tm-sl-body');
        const toolbarEl = overlay.querySelector('#tm-sl-toolbar');
        const statusEl = overlay.querySelector('#tm-sl-status');
        const updatedEl = overlay.querySelector('#tm-sl-updated');
        const titleEl = overlay.querySelector('#tm-sl-title');
        const subtitleEl = overlay.querySelector('#tm-sl-subtitle');

        let step = 'models';
        let selectedModel = null;
        let modelQuery = '';
        let activeFilters = { grade: '', gb: '', color: '' };
        let allPhones = [];
        let otherStorePhones = [];
        let otherStoreLoaded = false;
        let lastUpdated = null;

        const ctx = {
            getGradeStyle: (grade) => helpers.getPhoneGradeCircleStyle(grade),
        };

        function closeModal() {
            overlay.remove();
        }

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
        }

        function renderModelsStep() {
            step = 'models';
            selectedModel = null;
            titleEl.textContent = 'Πού υπάρχει το μοντέλο';
            subtitleEl.textContent = 'Επιλέξτε μοντέλο για να δείτε διαθεσιμότητα ανά κατάστημα';
            toolbarEl.innerHTML = UI.buildModelSearchToolbar();

            const searchInput = toolbarEl.querySelector('#tm-sl-model-search');
            if (searchInput) {
                searchInput.value = modelQuery;
                searchInput.addEventListener('input', () => {
                    modelQuery = searchInput.value.trim().toLowerCase();
                    renderModelsStep();
                });
                setTimeout(() => searchInput.focus(), 50);
            }

            let models = buildModelIndex(allPhones, otherStorePhones, helpers);
            models = models.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }));
            if (modelQuery) {
                models = models.filter(([name]) => name.toLowerCase().includes(modelQuery));
            }

            bodyEl.innerHTML = UI.buildModelGrid(models);
            setStatus(`${models.length} μοντέλα · ${allPhones.length + otherStorePhones.length} συσκευές στο δίκτυο`);

            bodyEl.querySelectorAll('.tm-sl-model-card[data-tm-sl-model]').forEach((card) => {
                const activate = () => {
                    selectedModel = card.getAttribute('data-tm-sl-model');
                    renderStoresStep();
                };
                card.addEventListener('click', activate);
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        activate();
                    }
                });
            });
        }

        function renderStoresStep() {
            if (!selectedModel) return renderModelsStep();
            step = 'stores';
            titleEl.textContent = selectedModel;
            subtitleEl.textContent = 'Διαθεσιμότητα ανά κατάστημα';

            const filterOptions = collectFiltersForModel(allPhones, otherStorePhones, selectedModel, helpers);
            const chipsHtml = UI.buildFilterChips(filterOptions, activeFilters);
            toolbarEl.innerHTML = UI.buildStoreToolbar(selectedModel, chipsHtml);

            toolbarEl.querySelector('#tm-sl-back')?.addEventListener('click', () => {
                activeFilters = { grade: '', gb: '', color: '' };
                renderModelsStep();
            });

            toolbarEl.querySelectorAll('[data-tm-sl-filter]').forEach((chip) => {
                chip.addEventListener('click', () => {
                    const key = chip.getAttribute('data-tm-sl-filter');
                    if (key === 'clear') {
                        activeFilters = { grade: '', gb: '', color: '' };
                    } else {
                        const val = chip.getAttribute('data-tm-sl-value') || '';
                        activeFilters[key] = activeFilters[key] === val ? '' : val;
                    }
                    renderStoresStep();
                });
            });

            const board = buildStoreBoardData(selectedModel, allPhones, otherStorePhones, activeFilters, helpers);
            bodyEl.innerHTML = UI.buildStoreBoard(selectedModel, board.mine, board.storeRows, ctx);

            const storeCount = board.allRows.length;
            setStatus(`${storeCount} ${storeCount === 1 ? 'κατάστημα' : 'καταστήματα'} με διαθέσιμες εκδόσεις`);

            bodyEl.querySelectorAll('[data-tm-sl-toggle-store]').forEach((head) => {
                head.addEventListener('click', () => {
                    const row = head.closest('.tm-sl-store-row');
                    row?.classList.toggle('is-open');
                });
            });

            bodyEl.querySelectorAll('[data-tm-sl-copy]').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = btn.getAttribute('data-tm-sl-copy');
                    if (code && typeof GM_setClipboard === 'function') GM_setClipboard(code);
                });
            });

            bodyEl.querySelectorAll('[data-tm-sl-open]').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = btn.getAttribute('data-tm-sl-open');
                    if (code) {
                        window.open(`https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(code)}`, '_blank');
                    }
                });
            });
        }

        async function ensureOtherStores() {
            if (otherStoreLoaded) return;
            if (typeof window.fetchOtherStorePhones !== 'function') return;
            otherStorePhones = helpers.filterIphoneTitlePhones(await window.fetchOtherStorePhones());
            otherStoreLoaded = true;
        }

        async function refreshData() {
            bodyEl.innerHTML = UI.buildEmptyState('⏳', 'Ανανέωση δεδομένων…', '');
            try {
                if (typeof window.fetchPhoneList === 'function') {
                    allPhones = helpers.filterIphoneTitlePhones(await window.fetchPhoneList());
                }
                await ensureOtherStores();
                if (typeof window.syncPhoneColorCatalog === 'function') {
                    window.syncPhoneColorCatalog(allPhones);
                }
                lastUpdated = new Date();
                updatedEl.textContent = `Ενημέρωση: ${lastUpdated.toLocaleString('el-GR')}`;
                if (step === 'stores' && selectedModel) renderStoresStep();
                else renderModelsStep();
            } catch (err) {
                bodyEl.innerHTML = UI.buildEmptyState('❌', 'Σφάλμα φόρτωσης', err.message || '');
            }
        }

        overlay.querySelector('#tm-sl-close')?.addEventListener('click', closeModal);
        overlay.querySelector('#tm-sl-refresh')?.addEventListener('click', refreshData);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        const cached = typeof window.loadPhoneListCache === 'function' ? window.loadPhoneListCache() : null;
        if (cached && cached.length) {
            allPhones = helpers.filterIphoneTitlePhones(cached);
            const ts = GM_getValue(window.PHONE_LIST_CACHE_TIMESTAMP_KEY || 'tm_phone_list_cache_timestamp', Date.now());
            lastUpdated = new Date(ts);
            updatedEl.textContent = `Ενημέρωση: ${lastUpdated.toLocaleString('el-GR')}`;
            ensureOtherStores().then(() => renderModelsStep());
        } else {
            bodyEl.innerHTML = UI.buildEmptyState('📱', 'Χωρίς δεδομένα', 'Πατήστε Ανανέωση για φόρτωση');
            setStatus('Πατήστε ανανέωση');
        }
    }

    window.showStoreLocatorModal = showStoreLocatorModal;
})();
