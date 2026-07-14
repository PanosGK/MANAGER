// ==UserScript==
// @name         MyManager Store Locator
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Model-first store availability finder for the phone catalog.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    const MINE_STORE_KEY = '__mine__';
    const DENSITY_KEY = 'tm_sl_density_compact';
    const SORT_KEY = 'tm_sl_model_sort';

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
        const { extractBaseModel, normalizePhoneGrade, filterIphoneTitlePhones } = helpers;
        const getStores = helpers.getEffectivePhoneStores || ((p) => helpers.filterOneUnitStores(p.stores || p.otherStores || []));
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
            getStores(phone).forEach((store) => {
                const name = cleanStoreName(store.name);
                if (name) entry.storeNames.add(name);
            });
        });

        const MINE_LABEL = 'Το κατάστημά μου';
        return [...map.entries()]
            .map(([model, data]) => {
                const storeList = [...data.storeNames]
                    .map((key) => (key === MINE_STORE_KEY ? MINE_LABEL : key))
                    .sort((a, b) => {
                        if (a === MINE_LABEL) return -1;
                        if (b === MINE_LABEL) return 1;
                        return a.localeCompare(b, 'el');
                    });
                return [model, {
                    ...data,
                    storeCount: data.storeNames.size,
                    storeList,
                }];
            })
            .filter(([, data]) => data.storeCount > 0 || data.myCount > 0);
    }

    function sortModels(models, sortKey) {
        const list = [...models];
        if (sortKey === 'stores') {
            list.sort((a, b) => (b[1].storeCount - a[1].storeCount) || a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }));
        } else if (sortKey === 'stock') {
            list.sort((a, b) => (b[1].totalUnits - a[1].totalUnits) || a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }));
        } else {
            list.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }));
        }
        return list;
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

    function collectFilterCounts(allPhones, otherStorePhones, model, activeFilters, helpers) {
        const { extractBaseModel, extractGB, extractColor, filterIphoneTitlePhones } = helpers;
        const counts = { grade: {}, gb: {}, color: {} };

        const phones = [];
        filterIphoneTitlePhones(allPhones).forEach((p) => {
            if ((p.unitsRemaining || 0) > 0 && extractBaseModel(p.model) === model) phones.push(p);
        });
        filterIphoneTitlePhones(otherStorePhones).forEach((p) => {
            if (extractBaseModel(p.model) === model) phones.push(p);
        });

        function matchesExcept(phone, exceptKey) {
            const filters = { ...activeFilters };
            filters[exceptKey] = '';
            return phoneMatchesFilters(phone, model, filters, helpers);
        }

        phones.forEach((phone) => {
            if (!matchesExcept(phone, 'grade')) return;
            if (phone.grade) counts.grade[phone.grade] = (counts.grade[phone.grade] || 0) + 1;
        });
        phones.forEach((phone) => {
            if (!matchesExcept(phone, 'gb')) return;
            const gb = extractGB(phone.name || phone.model);
            if (gb) counts.gb[gb] = (counts.gb[gb] || 0) + 1;
        });
        phones.forEach((phone) => {
            if (!matchesExcept(phone, 'color')) return;
            const color = extractColor(phone.name || phone.model);
            if (color) counts.color[color] = (counts.color[color] || 0) + 1;
        });

        return counts;
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
        const { filterIphoneTitlePhones } = helpers;
        const getStores = helpers.getEffectivePhoneStores || ((p) => helpers.filterOneUnitStores(p.stores || p.otherStores || []));
        const storeMap = new Map();

        function addVariant(storeKey, storeName, isMine, variant) {
            if (!storeMap.has(storeKey)) {
                storeMap.set(storeKey, { name: storeName, isMine, variants: [], seen: new Set() });
            }
            const bucket = storeMap.get(storeKey);
            const key = variantKey(variant);
            if (bucket.seen.has(key)) return;
            bucket.seen.add(key);
            bucket.variants.push({ ...variant, storeName, isMine });
        }

        filterIphoneTitlePhones(allPhones).forEach((phone) => {
            if ((phone.unitsRemaining || 0) <= 0) return;
            if (!phoneMatchesFilters(phone, model, filters, helpers)) return;
            addVariant(MINE_STORE_KEY, 'Το κατάστημά μου', true, phoneToVariant(phone, helpers));
        });

        filterIphoneTitlePhones(otherStorePhones).forEach((phone) => {
            if (!phoneMatchesFilters(phone, model, filters, helpers)) return;
            const variant = phoneToVariant(phone, helpers);
            const stores = getStores(phone);
            if (!stores.length) return;
            stores.forEach((store) => {
                const name = cleanStoreName(store.name);
                if (!name) return;
                addVariant(name, name, false, variant);
            });
        });

        const rows = [...storeMap.values()]
            .filter((s) => s.variants.length > 0)
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

    function bindGridKeyboard(container, itemSelector, onActivate) {
        const items = () => [...container.querySelectorAll(itemSelector)];
        container.addEventListener('keydown', (e) => {
            const list = items();
            if (!list.length) return;
            const current = document.activeElement;
            let idx = list.indexOf(current);
            if (idx < 0 && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
                e.preventDefault();
                list[0]?.focus();
                return;
            }
            if (idx < 0) return;

            const cols = Math.max(1, Math.floor(container.offsetWidth / 260));
            let next = idx;
            if (e.key === 'ArrowRight') next = Math.min(idx + 1, list.length - 1);
            else if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
            else if (e.key === 'ArrowDown') next = Math.min(idx + cols, list.length - 1);
            else if (e.key === 'ArrowUp') next = Math.max(idx - cols, 0);
            else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate(current);
                return;
            } else return;

            e.preventDefault();
            list[next]?.focus();
        });
    }

    function bindStoreKeyboard(bodyEl) {
        bodyEl.addEventListener('keydown', (e) => {
            const heads = [...bodyEl.querySelectorAll('.tm-sl-store-head[tabindex="0"]')];
            if (!heads.length) return;
            const current = document.activeElement;
            let idx = heads.indexOf(current);
            if (idx < 0 && (e.key === 'ArrowDown')) {
                e.preventDefault();
                heads[0]?.focus();
                return;
            }
            if (idx < 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                heads[Math.min(idx + 1, heads.length - 1)]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                heads[Math.max(idx - 1, 0)]?.focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                current?.click();
            }
        });
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
            getEffectivePhoneStores: window.getEffectivePhoneStores || ((p) => (window.filterOneUnitStores || ((s) => s))(p.stores || p.otherStores || [])),
        };

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay tm-sl-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;';
        overlay.innerHTML = UI.buildShellHTML();
        document.body.appendChild(overlay);

        const bodyEl = overlay.querySelector('#tm-sl-body');
        const toolbarEl = overlay.querySelector('#tm-sl-toolbar');
        const statusEl = overlay.querySelector('#tm-sl-status');
        const titleEl = overlay.querySelector('#tm-sl-title');
        const subtitleEl = overlay.querySelector('#tm-sl-subtitle');

        let step = 'models';
        let selectedModel = null;
        let modelQuery = '';
        let modelSort = GM_getValue(SORT_KEY, 'name');
        let densityCompact = GM_getValue(DENSITY_KEY, false);
        let activeFilters = { grade: '', gb: '', color: '' };
        let allPhones = [];
        let otherStorePhones = [];
        let otherStoreLoaded = false;
        let storesResolving = false;
        let lastUpdated = null;
        let keyboardBound = false;

        UI.setDensity(overlay, densityCompact);

        function getColorHexMap() {
            return typeof window.getAllColorHexMap === 'function' ? window.getAllColorHexMap() : {};
        }

        function buildUiCtx(extra) {
            return {
                getGradeStyle: (grade) => helpers.getPhoneGradeCircleStyle(grade),
                colorHexMap: getColorHexMap(),
                query: modelQuery,
                ...extra,
            };
        }

        function closeModal() {
            overlay.remove();
        }

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
        }

        function syncFreshness() {
            if (lastUpdated) UI.updateFreshness(overlay, lastUpdated);
        }

        function wireModelCards() {
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
            if (!keyboardBound) {
                bindGridKeyboard(bodyEl, '.tm-sl-model-card[data-tm-sl-model]', (el) => {
                    selectedModel = el.getAttribute('data-tm-sl-model');
                    renderStoresStep();
                });
                keyboardBound = true;
            }
        }

        function wireStoreBoard() {
            bodyEl.querySelectorAll('[data-tm-sl-toggle-store]').forEach((head) => {
                const toggle = () => {
                    const row = head.closest('.tm-sl-store-row');
                    row?.classList.toggle('is-open');
                };
                head.addEventListener('click', toggle);
                head.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle();
                    }
                });
            });

            bodyEl.querySelectorAll('[data-tm-sl-copy]').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = btn.getAttribute('data-tm-sl-copy');
                    if (code && typeof GM_setClipboard === 'function') {
                        GM_setClipboard(code);
                        UI.showToast(overlay, `Αντιγράφηκε ✓ ${code}`);
                    }
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

            bindStoreKeyboard(bodyEl);
        }

        function mergeNetworkStoreHints() {
            if (typeof window.mergeOtherStoresFromAllPhones === 'function') {
                window.mergeOtherStoresFromAllPhones(allPhones, otherStorePhones);
            }
        }

        async function resolveNetworkStoreDetails(modelFilter = null) {
            if (storesResolving || typeof window.resolvePhonesStoreDetails !== 'function') return;
            mergeNetworkStoreHints();
            const phones = modelFilter
                ? otherStorePhones.filter(modelFilter)
                : otherStorePhones;
            const needsResolve = phones.some((p) => {
                const stores = helpers.getEffectivePhoneStores(p);
                return !stores.length && (parseInt(p.otherStoreCount, 10) || 0) > 0;
            });
            if (!needsResolve) return;

            storesResolving = true;
            try {
                await window.resolvePhonesStoreDetails(otherStorePhones, {
                    concurrency: 8,
                    filter: modelFilter || undefined,
                    persistOtherStoreCache: true,
                    onProgress: (done, total) => {
                        setStatus(`Φόρτωση καταστημάτων ${done}/${total}…`);
                    },
                });
            } finally {
                storesResolving = false;
            }
        }

        function renderModelsStep() {
            step = 'models';
            selectedModel = null;
            UI.updateBreadcrumb(overlay, 'models');
            titleEl.textContent = 'Πού υπάρχει το μοντέλο';
            subtitleEl.textContent = 'Επιλέξτε μοντέλο για να δείτε διαθεσιμότητα ανά κατάστημα';
            toolbarEl.innerHTML = UI.buildModelSearchToolbar(modelSort);

            const searchInput = toolbarEl.querySelector('#tm-sl-model-search');
            if (searchInput) {
                searchInput.value = modelQuery;
                searchInput.addEventListener('input', () => {
                    modelQuery = searchInput.value.trim().toLowerCase();
                    renderModelsStep();
                });
                setTimeout(() => searchInput.focus(), 50);
            }

            toolbarEl.querySelectorAll('[data-tm-sl-sort]').forEach((pill) => {
                pill.addEventListener('click', () => {
                    modelSort = pill.getAttribute('data-tm-sl-sort') || 'name';
                    GM_setValue(SORT_KEY, modelSort);
                    renderModelsStep();
                });
            });

            let models = buildModelIndex(allPhones, otherStorePhones, helpers);
            models = sortModels(models, modelSort);
            if (modelQuery) {
                models = models.filter(([name]) => name.toLowerCase().includes(modelQuery));
            }

            bodyEl.innerHTML = UI.buildModelGrid(models, buildUiCtx());
            setStatus(`${models.length} μοντέλα · ${allPhones.length + otherStorePhones.length} συσκευές στο δίκτυο`);
            wireModelCards();
        }

        async function renderStoresStep() {
            if (!selectedModel) return renderModelsStep();
            step = 'stores';
            UI.updateBreadcrumb(overlay, 'stores', selectedModel);
            titleEl.textContent = selectedModel;
            subtitleEl.textContent = 'Διαθεσιμότητα ανά κατάστημα';

            bodyEl.innerHTML = UI.buildSkeletonStores(5);
            setStatus('Φόρτωση καταστημάτων…');

            const modelFilter = (p) => helpers.extractBaseModel(p.model) === selectedModel;
            await resolveNetworkStoreDetails(modelFilter);

            const filterOptions = collectFiltersForModel(allPhones, otherStorePhones, selectedModel, helpers);
            const filterCounts = collectFilterCounts(allPhones, otherStorePhones, selectedModel, activeFilters, helpers);
            const chipsHtml = UI.buildFilterChips(filterOptions, activeFilters, buildUiCtx({ counts: filterCounts }));
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
            bodyEl.innerHTML = UI.buildStoreBoard(selectedModel, board.mine, board.allRows, buildUiCtx());

            const storeCount = board.allRows.length;
            setStatus(`${storeCount} ${storeCount === 1 ? 'κατάστημα' : 'καταστήματα'} με διαθέσιμες εκδόσεις`);
            wireStoreBoard();
        }

        async function ensureOtherStores() {
            if (otherStoreLoaded) return;
            if (typeof window.fetchOtherStorePhones !== 'function') return;
            otherStorePhones = helpers.filterIphoneTitlePhones(await window.fetchOtherStorePhones());
            otherStoreLoaded = true;
            mergeNetworkStoreHints();
        }

        async function refreshData() {
            bodyEl.innerHTML = step === 'stores' ? UI.buildSkeletonStores(6) : UI.buildSkeletonGrid(8);
            try {
                if (typeof window.fetchPhoneList === 'function') {
                    allPhones = helpers.filterIphoneTitlePhones(await window.fetchPhoneList());
                }
                otherStoreLoaded = false;
                GM_setValue('tm_phone_other_store_cache_v3', null);
                GM_setValue('tm_phone_other_store_cache_timestamp', 0);
                await ensureOtherStores();
                setStatus('Φόρτωση καταστημάτων…');
                await resolveNetworkStoreDetails();
                if (typeof window.syncPhoneColorCatalog === 'function') {
                    window.syncPhoneColorCatalog(allPhones);
                }
                lastUpdated = new Date();
                syncFreshness();
                if (step === 'stores' && selectedModel) {
                    await renderStoresStep();
                } else {
                    renderModelsStep();
                }
            } catch (err) {
                bodyEl.innerHTML = UI.buildEmptyState('❌', 'Σφάλμα φόρτωσης', err.message || '');
            }
        }

        overlay.querySelector('#tm-sl-close')?.addEventListener('click', closeModal);
        overlay.querySelector('#tm-sl-refresh')?.addEventListener('click', refreshData);
        overlay.querySelector('#tm-sl-density')?.addEventListener('click', () => {
            densityCompact = !densityCompact;
            GM_setValue(DENSITY_KEY, densityCompact);
            UI.setDensity(overlay, densityCompact);
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function onSlKeydown(e) {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', onSlKeydown);
                closeModal();
            }
        });

        bodyEl.innerHTML = UI.buildSkeletonGrid(8);
        const cached = typeof window.loadPhoneListCache === 'function' ? window.loadPhoneListCache() : null;
        if (cached && cached.length) {
            allPhones = helpers.filterIphoneTitlePhones(cached);
            const ts = GM_getValue(window.PHONE_LIST_CACHE_TIMESTAMP_KEY || 'tm_phone_list_cache_timestamp', Date.now());
            lastUpdated = new Date(ts);
            syncFreshness();
            ensureOtherStores().then(async () => {
                await resolveNetworkStoreDetails();
                renderModelsStep();
            });
        } else {
            bodyEl.innerHTML = UI.buildEmptyState('📱', 'Χωρίς δεδομένα', 'Πατήστε Ανανέωση για φόρτωση');
            setStatus('Πατήστε ανανέωση');
        }
    }

    window.showStoreLocatorModal = showStoreLocatorModal;
})();
