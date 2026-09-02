// ==UserScript==
// @name         MyManager Store Locator
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Model-first store availability finder — smart search, recent models, shared filters.
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
    const UI_SCALE_KEY = 'tm_sl_ui_scale_v1';
    const SORT_KEY = 'tm_sl_model_sort';
    const CATALOG_VIEW_KEY = 'tm_sl_catalog_view';
    const CATALOG_CATEGORY_KEY = 'tm_sl_catalog_category_v1';
    const RECENT_MODELS_KEY = 'tm_sl_recent_models_v1';
    const LOAD_STATS_KEY = 'tm_sl_load_stats_v1';
    const DEFAULT_LOAD_STATS = {
        phoneListMs: 9000,
        otherStoresMs: 7000,
        storeResolvePerItemMs: 180,
    };

    function loadRecentModels() {
        try {
            const raw = GM_getValue(RECENT_MODELS_KEY, '[]');
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return Array.isArray(parsed) ? parsed.filter((m) => typeof m === 'string' && m.trim()).slice(0, 8) : [];
        } catch (e) {
            return [];
        }
    }

    function pushRecentModel(modelName) {
        const name = String(modelName || '').trim();
        if (!name) return loadRecentModels();
        const next = [name, ...loadRecentModels().filter((m) => m !== name)].slice(0, 8);
        GM_setValue(RECENT_MODELS_KEY, JSON.stringify(next));
        return next;
    }

    function looksLikeUnitCode(query) {
        const s = String(query || '').replace(/\s+/g, '');
        return /^\d{8,}$/.test(s);
    }

    function normalizeUnitCode(query) {
        return String(query || '').replace(/\s+/g, '');
    }

    function phoneMatchesUnitCode(phone, code) {
        if (!phone || !code) return false;
        if (String(phone.barcode || '') === code) return true;
        const imei = String(phone.imei || '').replace(/\D/g, '');
        return !!imei && (imei === code || imei.includes(code));
    }

    function cleanStoreName(name) {
        return String(name || '').replace(/\s*ΕΜΠΟΡΕΥΣΙΜΩΝ/gi, '').trim();
    }

    function resolveMyStoreLabel() {
        if (typeof window.PhoneCatalogUI?.getMyStoreLabel === 'function') {
            return window.PhoneCatalogUI.getMyStoreLabel();
        }
        const name = typeof window.getCurrentStoreName === 'function'
            ? String(window.getCurrentStoreName() || '').trim()
            : '';
        return name || 'Το κατάστημά μου';
    }

    function loadLoadStats() {
        try {
            const raw = GM_getValue(LOAD_STATS_KEY, null);
            const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
            return { ...DEFAULT_LOAD_STATS, ...(parsed || {}) };
        } catch (e) {
            return { ...DEFAULT_LOAD_STATS };
        }
    }

    function saveLoadStats(stats) {
        GM_setValue(LOAD_STATS_KEY, JSON.stringify(stats || DEFAULT_LOAD_STATS));
    }

    function blendDuration(prev, next) {
        const n = Math.max(400, Number(next) || 0);
        if (!prev || !Number.isFinite(prev)) return n;
        return Math.round(prev * 0.65 + n * 0.35);
    }

    function storeHasBuyableUnit(store) {
        if (!store?.variants?.length) return false;
        return store.variants.some((v) => {
            if (typeof window.isStoreAllowedForPhone !== 'function') return true;
            return window.isStoreAllowedForPhone(store.name, !!v.isBuyback);
        });
    }

    function sortNetworkStoreRows(rows) {
        const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
        return [...rows].sort((a, b) => {
            const aBuy = storeHasBuyableUnit(a) ? 0 : 1;
            const bBuy = storeHasBuyableUnit(b) ? 0 : 1;
            if (aBuy !== bBuy) return aBuy - bBuy;
            if (typeof window.compareStoresByProximity === 'function') {
                const prox = window.compareStoresByProximity(a.name, b.name, myStore);
                if (prox) return prox;
            }
            return (a.name || '').localeCompare(b.name || '', 'el');
        });
    }

    function sortStoreVariants(variants, storeName) {
        return [...variants].sort((a, b) => {
            const aAllowed = typeof window.isStoreAllowedForPhone === 'function'
                ? window.isStoreAllowedForPhone(storeName, !!a.isBuyback)
                : true;
            const bAllowed = typeof window.isStoreAllowedForPhone === 'function'
                ? window.isStoreAllowedForPhone(storeName, !!b.isBuyback)
                : true;
            if (aAllowed !== bAllowed) return aAllowed ? -1 : 1;
            if (!!a.isBuyback !== !!b.isBuyback) return a.isBuyback ? 1 : -1;
            const gradeCmp = (typeof window.comparePhoneGrades === 'function')
                ? window.comparePhoneGrades(a.grade || '', b.grade || '')
                : String(a.grade || '').localeCompare(String(b.grade || ''));
            if (gradeCmp) return gradeCmp;
            return String(a.barcode || '').localeCompare(String(b.barcode || ''));
        });
    }

    function phoneToVariant(phone, helpers) {
        const { extractGB, extractColor } = helpers;
        const isBuyback = typeof window.resolvePhoneIsBuyback === 'function'
            ? window.resolvePhoneIsBuyback(phone)
            : !!phone.isBuyback;
        return {
            grade: phone.grade || '',
            gb: extractGB(phone.name || phone.model) || '',
            color: extractColor(phone.name || phone.model) || '',
            barcode: phone.barcode,
            price: phone.retailPrice || '',
            isBuyback,
            imei: phone.imei || '',
            modelName: helpers.extractBaseModel?.(phone.model) || phone.model || '',
            phone,
        };
    }

    function variantKey(v) {
        return [v.barcode, v.grade, v.gb, v.color].join('|');
    }

    function buildMyStoreModelIndex(allPhones, helpers) {
        const { extractBaseModel, normalizePhoneGrade, filterIphoneTitlePhones } = helpers;
        const map = new Map();

        filterIphoneTitlePhones(allPhones).forEach((phone) => {
            if ((phone.unitsRemaining || 0) <= 0) return;
            const model = extractBaseModel(phone.model);
            if (!model) return;
            if (!map.has(model)) {
                map.set(model, { grades: {}, totalUnits: 0, myCount: 0, buybackCount: 0, storeCount: 0, storeList: [] });
            }
            const entry = map.get(model);
            entry.totalUnits += 1;
            entry.myCount += 1;
            if (typeof window.resolvePhoneIsBuyback === 'function'
                ? window.resolvePhoneIsBuyback(phone)
                : phone.isBuyback) {
                entry.buybackCount += 1;
            }
            const g = normalizePhoneGrade(phone.grade);
            if (g) entry.grades[g] = (entry.grades[g] || 0) + 1;
        });

        return [...map.entries()].filter(([, data]) => data.myCount > 0);
    }

    function buildNetworkModelIndex(otherStorePhones, helpers) {
        const { extractBaseModel, normalizePhoneGrade, filterIphoneTitlePhones } = helpers;
        const getStores = helpers.getEffectivePhoneStores || ((p) => helpers.filterOneUnitStores(p.stores || p.otherStores || []));
        const map = new Map();

        filterIphoneTitlePhones(otherStorePhones).forEach((phone) => {
            const model = extractBaseModel(phone.model);
            if (!model) return;
            let stores = getStores(phone);
            const otherCount = parseInt(phone.otherStoreCount, 10) || 0;
            if (!stores.length && otherCount <= 0) return;
            if (!map.has(model)) {
                map.set(model, { grades: {}, storeNames: new Set(), totalUnits: 0, myCount: 0 });
            }
            const entry = map.get(model);
            entry.totalUnits += 1;
            const g = normalizePhoneGrade(phone.grade);
            if (g) entry.grades[g] = (entry.grades[g] || 0) + 1;
            if (stores.length) {
                stores.forEach((store) => {
                    const name = cleanStoreName(store.name);
                    if (name) entry.storeNames.add(name);
                });
            } else {
                entry.storeNames.add('Άλλα καταστήματα');
            }
        });

        return [...map.entries()]
            .map(([model, data]) => {
                const storeList = [...data.storeNames].sort((a, b) => a.localeCompare(b, 'el'));
                return [model, {
                    ...data,
                    storeCount: data.storeNames.size,
                    storeList,
                }];
            })
            .filter(([, data]) => data.storeCount > 0);
    }

    function buildModelIndex(allPhones, otherStorePhones, helpers, catalogView = 'mine') {
        if (catalogView === 'network') {
            return buildNetworkModelIndex(otherStorePhones, helpers);
        }
        return buildMyStoreModelIndex(allPhones, helpers);
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

    function emptyActiveFilters() {
        return {
            grade: '', gb: '', color: '', tag: '',
            brand: '', cpu: '', ram: '', storage: '',
        };
    }

    function phoneTagKeys(phone) {
        if (typeof window.getPhoneTags !== 'function') return [];
        return window.getPhoneTags(phone?.barcode) || [];
    }

    function getLaptopSpecs(phone) {
        if (!phone) return { brand: '', cpu: '', ram: '', storage: '' };
        if (phone.brand || phone.cpu || phone.ram || phone.storage) {
            return {
                brand: phone.brand || '',
                cpu: phone.cpu || '',
                ram: phone.ram || '',
                storage: phone.storage || '',
            };
        }
        if (typeof window.parseLaptopSpecs === 'function') {
            return window.parseLaptopSpecs(phone.name || phone.model || '');
        }
        return { brand: '', cpu: '', ram: '', storage: '' };
    }

    function sortLaptopRamStorage(a, b) {
        const num = (s) => {
            const raw = String(s || '');
            const n = parseInt(raw, 10) || 0;
            return /TB/i.test(raw) ? n * 1024 : n;
        };
        return num(a) - num(b);
    }

    function collectLaptopFilterOptions(allPhones, otherStorePhones, helpers, catalogView = 'mine', model = null) {
        const { extractBaseModel, filterIphoneTitlePhones } = helpers;
        const brands = new Set();
        const cpus = new Set();
        const rams = new Set();
        const storages = new Set();
        const grades = new Set();

        const addPhone = (phone) => {
            if (model && extractBaseModel(phone.model) !== model) return;
            const specs = getLaptopSpecs(phone);
            if (specs.brand) brands.add(specs.brand);
            if (specs.cpu) cpus.add(specs.cpu);
            if (specs.ram) rams.add(specs.ram);
            if (specs.storage) storages.add(specs.storage);
            if (phone.grade) grades.add(phone.grade);
        };

        if (catalogView !== 'network') {
            filterIphoneTitlePhones(allPhones).forEach((p) => {
                if ((p.unitsRemaining || 0) > 0) addPhone(p);
            });
        }
        if (catalogView !== 'mine') {
            filterIphoneTitlePhones(otherStorePhones).forEach(addPhone);
        }

        return {
            brands: [...brands].sort((a, b) => a.localeCompare(b, 'el')),
            cpus: [...cpus].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
            rams: [...rams].sort(sortLaptopRamStorage),
            storages: [...storages].sort(sortLaptopRamStorage),
            grades: [...grades].sort((a, b) => helpers.comparePhoneGrades(a, b)),
            gbs: [],
            colors: [],
            tags: [],
        };
    }

    function collectLaptopFilterCounts(allPhones, otherStorePhones, activeFilters, helpers, catalogView = 'mine', model = null) {
        const { extractBaseModel, filterIphoneTitlePhones } = helpers;
        const counts = { brand: {}, cpu: {}, ram: {}, storage: {}, grade: {} };
        const phones = [];

        if (catalogView !== 'network') {
            filterIphoneTitlePhones(allPhones).forEach((p) => {
                if ((p.unitsRemaining || 0) > 0 && (!model || extractBaseModel(p.model) === model)) phones.push(p);
            });
        }
        if (catalogView !== 'mine') {
            filterIphoneTitlePhones(otherStorePhones).forEach((p) => {
                if (!model || extractBaseModel(p.model) === model) phones.push(p);
            });
        }

        function matchesExcept(phone, exceptKey) {
            const filters = { ...activeFilters, [exceptKey]: '' };
            if (model) return phoneMatchesFilters(phone, model, filters, helpers);
            return laptopMatchesFilters(phone, filters, helpers);
        }

        phones.forEach((phone) => {
            const specs = getLaptopSpecs(phone);
            if (matchesExcept(phone, 'brand') && specs.brand) {
                counts.brand[specs.brand] = (counts.brand[specs.brand] || 0) + 1;
            }
            if (matchesExcept(phone, 'cpu') && specs.cpu) {
                counts.cpu[specs.cpu] = (counts.cpu[specs.cpu] || 0) + 1;
            }
            if (matchesExcept(phone, 'ram') && specs.ram) {
                counts.ram[specs.ram] = (counts.ram[specs.ram] || 0) + 1;
            }
            if (matchesExcept(phone, 'storage') && specs.storage) {
                counts.storage[specs.storage] = (counts.storage[specs.storage] || 0) + 1;
            }
            if (matchesExcept(phone, 'grade') && phone.grade) {
                counts.grade[phone.grade] = (counts.grade[phone.grade] || 0) + 1;
            }
        });

        return counts;
    }

    function laptopMatchesFilters(phone, filters, helpers) {
        if (!filters) return true;
        const specs = getLaptopSpecs(phone);
        if (filters.brand && specs.brand !== filters.brand) return false;
        if (filters.cpu && specs.cpu !== filters.cpu) return false;
        if (filters.ram && specs.ram !== filters.ram) return false;
        if (filters.storage && specs.storage !== filters.storage) return false;
        if (filters.grade && phone.grade !== filters.grade) return false;
        if (filters.tag) {
            const tagKey = typeof window.normalizeTagKey === 'function'
                ? window.normalizeTagKey(filters.tag)
                : String(filters.tag || '').trim().toLowerCase();
            if (!phoneTagKeys(phone).includes(tagKey)) return false;
        }
        void helpers;
        return true;
    }

    function collectFiltersForModel(allPhones, otherStorePhones, model, helpers, catalogView = 'mine', category = 'phones') {
        if (category === 'laptops') {
            return collectLaptopFilterOptions(allPhones, otherStorePhones, helpers, catalogView, model);
        }
        const { extractBaseModel, extractGB, extractColor, filterIphoneTitlePhones } = helpers;
        const grades = new Set();
        const gbs = new Set();
        const colors = new Set();
        const tags = new Set();

        const addPhone = (phone) => {
            if (extractBaseModel(phone.model) !== model) return;
            if (phone.grade) grades.add(phone.grade);
            const gb = extractGB(phone.name || phone.model);
            if (gb) gbs.add(gb);
            const color = extractColor(phone.name || phone.model);
            if (color) colors.add(color);
            phoneTagKeys(phone).forEach((tag) => tags.add(tag));
        };

        if (catalogView !== 'network') {
            filterIphoneTitlePhones(allPhones).forEach((p) => {
                if ((p.unitsRemaining || 0) > 0) addPhone(p);
            });
        }
        if (catalogView !== 'mine') {
            filterIphoneTitlePhones(otherStorePhones).forEach(addPhone);
        }

        const sortGb = (a, b) => {
            const num = (s) => {
                const tb = s.toUpperCase().includes('TB');
                return parseInt(s, 10) * (tb ? 1024 : 1);
            };
            return num(a) - num(b);
        };
        const sortTag = (a, b) => {
            const nameOf = (k) => (typeof window.getTagDisplayName === 'function' ? window.getTagDisplayName(k) : k);
            return nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: 'base' });
        };

        return {
            grades: [...grades].sort((a, b) => helpers.comparePhoneGrades(a, b)),
            gbs: [...gbs].sort(sortGb),
            colors: [...colors].sort((a, b) => a.localeCompare(b, 'el')),
            tags: [...tags].sort(sortTag),
            brands: [],
            cpus: [],
            rams: [],
            storages: [],
        };
    }

    function collectFilterCounts(allPhones, otherStorePhones, model, activeFilters, helpers, catalogView = 'mine', category = 'phones') {
        if (category === 'laptops') {
            return collectLaptopFilterCounts(allPhones, otherStorePhones, activeFilters, helpers, catalogView, model);
        }
        const { extractBaseModel, extractGB, extractColor, filterIphoneTitlePhones } = helpers;
        const counts = { grade: {}, gb: {}, color: {}, tag: {} };

        const phones = [];
        if (catalogView !== 'network') {
            filterIphoneTitlePhones(allPhones).forEach((p) => {
                if ((p.unitsRemaining || 0) > 0 && extractBaseModel(p.model) === model) phones.push(p);
            });
        }
        if (catalogView !== 'mine') {
            filterIphoneTitlePhones(otherStorePhones).forEach((p) => {
                if (extractBaseModel(p.model) === model) phones.push(p);
            });
        }

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
        phones.forEach((phone) => {
            if (!matchesExcept(phone, 'tag')) return;
            phoneTagKeys(phone).forEach((tag) => {
                counts.tag[tag] = (counts.tag[tag] || 0) + 1;
            });
        });

        return counts;
    }

    function phoneMatchesFilters(phone, model, filters, helpers) {
        const { extractBaseModel, extractGB, extractColor } = helpers;
        if (extractBaseModel(phone.model) !== model) return false;
        if (phone.productKind === 'laptop' || filters.brand || filters.cpu || filters.ram || filters.storage) {
            if (!laptopMatchesFilters(phone, filters, helpers)) return false;
        }
        if (filters.grade && phone.grade !== filters.grade) return false;
        const gb = extractGB(phone.name || phone.model);
        if (filters.gb && gb !== filters.gb) return false;
        const color = extractColor(phone.name || phone.model);
        if (filters.color) {
            const resolve = typeof window.resolveDisplayColorName === 'function'
                ? window.resolveDisplayColorName
                : (c) => c;
            if (resolve(color) !== resolve(filters.color)) return false;
        }
        if (filters.tag) {
            const tagKey = typeof window.normalizeTagKey === 'function'
                ? window.normalizeTagKey(filters.tag)
                : String(filters.tag || '').trim().toLowerCase();
            if (!phoneTagKeys(phone).includes(tagKey)) return false;
        }
        return true;
    }

    function buildMyStoreUnitsData(model, allPhones, filters, helpers) {
        const { filterIphoneTitlePhones } = helpers;
        const variants = [];

        filterIphoneTitlePhones(allPhones).forEach((phone) => {
            if ((phone.unitsRemaining || 0) <= 0) return;
            if (!phoneMatchesFilters(phone, model, filters, helpers)) return;
            variants.push({
                ...phoneToVariant(phone, helpers),
                storeName: resolveMyStoreLabel(),
                isMine: true,
            });
        });

        return sortStoreVariants(variants, resolveMyStoreLabel());
    }

    function buildNetworkStoreBoardData(model, otherStorePhones, filters, helpers) {
        const { filterIphoneTitlePhones } = helpers;
        const getStores = helpers.getEffectivePhoneStores || ((p) => helpers.filterOneUnitStores(p.stores || p.otherStores || []));
        const storeMap = new Map();

        function addVariant(storeKey, storeName, variant) {
            if (!storeMap.has(storeKey)) {
                storeMap.set(storeKey, { name: storeName, isMine: false, variants: [], seen: new Set() });
            }
            const bucket = storeMap.get(storeKey);
            const key = variantKey(variant);
            if (bucket.seen.has(key)) return;
            bucket.seen.add(key);
            bucket.variants.push({ ...variant, storeName, isMine: false });
        }

        filterIphoneTitlePhones(otherStorePhones).forEach((phone) => {
            if (!phoneMatchesFilters(phone, model, filters, helpers)) return;
            const variant = phoneToVariant(phone, helpers);
            const stores = getStores(phone);
            if (!stores.length) return;
            stores.forEach((store) => {
                const name = cleanStoreName(store.name);
                if (!name) return;
                addVariant(name, name, variant);
            });
        });

        return sortNetworkStoreRows([...storeMap.values()]
            .filter((s) => s.variants.length > 0)
            .map(({ name, isMine, variants }) => ({
                name,
                isMine,
                variants: sortStoreVariants(variants, name),
                preview: variants.slice(0, 3).map((v) => {
                    const bits = [v.grade, v.gb, v.color].filter(Boolean);
                    return bits.join(' · ');
                }).join(' · '),
            })));
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
            addVariant(MINE_STORE_KEY, resolveMyStoreLabel(), true, phoneToVariant(phone, helpers));
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
                const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
                if (typeof window.compareStoresByProximity === 'function') {
                    return window.compareStoresByProximity(a.name, b.name, myStore);
                }
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

    async function showStoreLocatorModal(options = {}) {
        if (document.querySelector('.tm-sl-overlay')) return;

        // Inject CSS before building DOM so the first paint is already styled.
        if (typeof window.PhoneCatalogUI?.ensureStylesInjected === 'function') {
            window.PhoneCatalogUI.ensureStylesInjected();
        }

        if (typeof window.trackDailyStat === 'function' && window.config && window.STORAGE_KEYS) {
            window.trackDailyStat(window.config, window.STORAGE_KEYS, 'phoneCatalogOpen');
        }

        if (typeof window.detectAndCacheCurrentStoreName === 'function') {
            window.detectAndCacheCurrentStoreName(document);
        }

        const requestedCategory = options?.category === 'laptops' ? 'laptops' : 'phones';

        const UI = window.PhoneCatalogUI;
        const helpers = {
            extractBaseModel: (m) => {
                if (requestedCategory === 'laptops') {
                    if (typeof window.parseLaptopSpecs === 'function') {
                        const specs = window.parseLaptopSpecs(m);
                        if (specs?.modelLine) return specs.modelLine;
                    }
                    if (typeof window.parseLaptopName === 'function') {
                        const parsed = window.parseLaptopName(m);
                        if (parsed?.model) return parsed.model;
                    }
                }
                return (window.extractBaseModel || ((x) => x))(m);
            },
            extractGB: window.extractGB || (() => ''),
            extractColor: window.extractColor || (() => ''),
            normalizePhoneGrade: window.normalizePhoneGrade || ((g) => g),
            comparePhoneGrades: window.comparePhoneGrades || ((a, b) => a.localeCompare(b)),
            filterIphoneTitlePhones: (list) => {
                if (requestedCategory === 'laptops') return Array.isArray(list) ? list : [];
                return (window.filterIphoneTitlePhones || ((p) => p))(list);
            },
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
        let catalogView = GM_getValue(CATALOG_VIEW_KEY, 'mine');
        let catalogCategory = requestedCategory;
        GM_setValue(CATALOG_CATEGORY_KEY, catalogCategory);
        let densityCompact = GM_getValue(DENSITY_KEY, false);
        const defaultScale = UI.UI_SCALE_DEFAULT || 1.15;
        let uiScale = typeof UI.normalizeUiScale === 'function'
            ? UI.normalizeUiScale(GM_getValue(UI_SCALE_KEY, defaultScale))
            : defaultScale;
        let activeFilters = emptyActiveFilters();
        let allPhones = [];
        let otherStorePhones = [];
        let otherStoreLoaded = false;
        let allLaptops = [];
        let otherStoreLaptops = [];
        let otherStoreLaptopsLoaded = false;
        let storesResolving = false;
        let lastUpdated = null;
        let keyboardBound = false;
        let lastTrackedLookupModel = null;
        let lastTrackedNetworkModel = null;

        UI.setDensity(overlay, densityCompact);
        if (typeof UI.setUiScale === 'function') {
            uiScale = UI.setUiScale(overlay, uiScale);
        }
        UI.updateViewTabs(overlay, catalogView);
        UI.updateCategoryTabs?.(overlay, catalogCategory);

        let recentModels = loadRecentModels();
        let pendingFlashBarcode = null;

        function getLocalPool() {
            return catalogCategory === 'laptops' ? allLaptops : allPhones;
        }
        function getNetworkPool() {
            return catalogCategory === 'laptops' ? otherStoreLaptops : otherStorePhones;
        }
        function isNetworkPoolLoaded() {
            return catalogCategory === 'laptops' ? otherStoreLaptopsLoaded : otherStoreLoaded;
        }

        function syncCatalogHeaders() {
            if (step === 'stores' && selectedModel) return;
            UI.clearStoresModelHeader(overlay);
            UI.updateMyStoreLabels(overlay);
            if (catalogCategory === 'laptops') {
                if (catalogView === 'mine') {
                    titleEl.textContent = 'Φορητοί · ' + UI.getMyStoreLabel();
                    subtitleEl.textContent = 'Μεταχειρισμένοι φορητοί υπολογιστές σε stock';
                } else {
                    titleEl.textContent = 'Φορητοί · Άλλα καταστήματα';
                    subtitleEl.textContent = 'Πού υπάρχουν φορητοί στο δίκτυο';
                }
                return;
            }
            if (catalogView === 'mine') {
                titleEl.textContent = UI.getMyStoreLabel();
                subtitleEl.textContent = 'Τι έχετε σε stock τώρα';
            } else {
                titleEl.textContent = 'Άλλα καταστήματα';
                subtitleEl.textContent = 'Πού υπάρχει κάθε μοντέλο στο δίκτυο';
            }
        }

        function getSettingsCtx() {
            return {
                allPhones: getLocalPool(),
                otherStorePhones: getNetworkPool(),
                onChange: () => {
                    if (typeof window.syncPhoneColorCatalog === 'function') {
                        window.syncPhoneColorCatalog(getLocalPool());
                    }
                    if (typeof window.clearPhoneCatalogParseCaches === 'function') {
                        window.clearPhoneCatalogParseCaches();
                    } else if (typeof window.clearPhoneCatalogCaches === 'function') {
                        window.clearPhoneCatalogCaches({ includeLists: false });
                    }
                    UI.updateMyStoreLabels(overlay);
                    if (step === 'stores' && selectedModel) {
                        renderStoresStep();
                    } else {
                        renderModelsStep();
                    }
                },
                getExportPhones: () => {
                    if (catalogView === 'mine') {
                        return getLocalPool().filter((p) => (p.unitsRemaining || 0) > 0);
                    }
                    return getNetworkPool();
                },
            };
        }

        if (typeof window.PhoneCatalogSettings?.wireSettingsMenu === 'function') {
            window.PhoneCatalogSettings.wireSettingsMenu(overlay, getSettingsCtx);
        }

        function getColorHexMap() {
            return typeof window.getAllColorHexMap === 'function' ? window.getAllColorHexMap() : {};
        }

        function buildUiCtx(extra) {
            return {
                getGradeStyle: (grade) => helpers.getPhoneGradeCircleStyle(grade),
                getGradeColor: (grade) => (typeof window.getPhoneGradeColor === 'function'
                    ? window.getPhoneGradeColor(grade)
                    : '#607d8b'),
                colorHexMap: getColorHexMap(),
                query: modelQuery,
                catalogView,
                ...extra,
            };
        }

        function closeModal() {
            document.querySelectorAll('.tm-sl-settings-menu.tm-sl-menu--fixed, .tm-sl-export-menu.tm-sl-menu--fixed, .tm-sl-tag-picker')
                .forEach((el) => el.remove());
            overlay.remove();
        }

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
        }

        function syncFreshness() {
            if (!lastUpdated) return;
            let by = '';
            try {
                const meta = typeof window.loadPhoneListRefreshMeta === 'function'
                    ? window.loadPhoneListRefreshMeta()
                    : null;
                if (meta?.by) by = String(meta.by).trim();
                if (meta?.at) {
                    const metaDate = new Date(meta.at);
                    if (!Number.isNaN(metaDate.getTime())) lastUpdated = metaDate;
                }
            } catch (_) { /* ignore */ }
            UI.updateFreshness(overlay, lastUpdated, by);
        }

        function wireModelCards() {
            bodyEl.querySelectorAll('.tm-sl-model-card[data-tm-sl-model]').forEach((card) => {
                const activate = () => {
                    selectedModel = card.getAttribute('data-tm-sl-model');
                    recentModels = pushRecentModel(selectedModel);
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
                    recentModels = pushRecentModel(selectedModel);
                    renderStoresStep();
                });
                keyboardBound = true;
            }
        }

        function trackCatalogStat(statName, value = 1) {
            if (typeof window.trackDailyStat === 'function' && window.config && window.STORAGE_KEYS) {
                window.trackDailyStat(window.config, window.STORAGE_KEYS, statName, value);
            }
        }

        function formatCopyToast(el, code) {
            const row = el.closest('tr.tm-sl-unit-row');
            const bits = [];
            const model = row?.getAttribute('data-tm-sl-model') || selectedModel || '';
            const grade = row?.getAttribute('data-tm-sl-grade') || '';
            const gb = row?.getAttribute('data-tm-sl-gb') || '';
            const color = row?.getAttribute('data-tm-sl-color') || '';
            const shortModel = String(model).replace(/^IPHONE\s+/i, '').trim();
            if (shortModel) bits.push(shortModel);
            if (grade) bits.push(grade);
            if (gb) bits.push(gb);
            if (color) bits.push(color);
            const shortCode = code.length > 8 ? `${code.slice(0, 4)}…${code.slice(-3)}` : code;
            bits.push(shortCode);
            return `Αντιγράφηκε · ${bits.join(' · ')}`;
        }

        function openProductByBarcode(code) {
            if (!code) return;
            window.open(`https://thefixers.mymanager.gr/mymanagerservice/products_list.php?qs=${encodeURIComponent(code)}`, '_blank');
        }

        function wireUnitActions() {
            bodyEl.querySelectorAll('[data-tm-sl-copy]').forEach((el) => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = el.getAttribute('data-tm-sl-copy');
                    if (!code || typeof GM_setClipboard !== 'function') return;
                    GM_setClipboard(code);
                    trackCatalogStat('phoneCatalogBarcodeCopy');
                    if (el.matches('button')) {
                        const prev = el.innerHTML;
                        const prevLabel = el.getAttribute('aria-label') || '';
                        el.classList.add('is-copied');
                        el.innerHTML = 'ΟΚ';
                        el.setAttribute('aria-label', 'Αντιγράφηκε');
                        clearTimeout(el._tmCopyTimer);
                        el._tmCopyTimer = setTimeout(() => {
                            el.classList.remove('is-copied');
                            el.innerHTML = prev;
                            if (prevLabel) el.setAttribute('aria-label', prevLabel);
                        }, 1200);
                    } else {
                        UI.showToast(overlay, formatCopyToast(el, code), { barcode: code });
                    }
                });
            });

            bodyEl.querySelectorAll('[data-tm-sl-open]').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openProductByBarcode(btn.getAttribute('data-tm-sl-open'));
                });
            });

            bodyEl.querySelectorAll('tr.tm-sl-unit-row[data-tm-sl-open-row]').forEach((row) => {
                row.addEventListener('dblclick', (e) => {
                    if (e.target.closest('[data-tm-sl-copy], [data-tm-sl-tag-edit], .tm-sl-phone-tag, .tm-sl-tag-picker, .tm-sl-unit-note')) return;
                    openProductByBarcode(row.getAttribute('data-tm-sl-open-row'));
                });
                row.addEventListener('contextmenu', (e) => {
                    if (e.target.closest('[data-tm-sl-copy]')) return;
                    e.preventDefault();
                    const code = row.getAttribute('data-barcode');
                    if (!code || typeof UI.showPhoneTagPicker !== 'function') return;
                    UI.showPhoneTagPicker(row, code, () => renderStoresStep());
                });
            });

            bodyEl.querySelectorAll('[data-tm-sl-tag-edit]').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = btn.getAttribute('data-tm-sl-tag-edit');
                    if (!code || typeof UI.showPhoneTagPicker !== 'function') return;
                    UI.showPhoneTagPicker(btn, code, () => renderStoresStep());
                });
            });

            bodyEl.querySelectorAll('.tm-sl-unit-note').forEach((el) => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const row = el.closest('[data-barcode]');
                    const code = row?.getAttribute('data-barcode');
                    if (!code || typeof UI.showPhoneTagPicker !== 'function') return;
                    UI.showPhoneTagPicker(el, code, () => renderStoresStep());
                });
            });

            bodyEl.querySelectorAll('.tm-sl-phone-tag[data-tm-sl-tag-key]').forEach((chip) => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = chip.getAttribute('data-tm-sl-tag-barcode');
                    const key = chip.getAttribute('data-tm-sl-tag-key');
                    if (!code || !key || typeof window.togglePhoneTag !== 'function') return;
                    window.togglePhoneTag(code, key);
                    renderStoresStep();
                });
            });

            if (pendingFlashBarcode) {
                const flashCode = pendingFlashBarcode;
                const flashRow = [...bodyEl.querySelectorAll('tr.tm-sl-unit-row[data-barcode]')]
                    .find((row) => row.getAttribute('data-barcode') === flashCode);
                if (flashRow) {
                    flashRow.classList.add('tm-sl-unit-row--flash');
                    flashRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    setTimeout(() => flashRow.classList.remove('tm-sl-unit-row--flash'), 2200);
                }
                pendingFlashBarcode = null;
            }

            bodyEl.querySelectorAll('[data-tm-sl-empty-action]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-tm-sl-empty-action');
                    if (action === 'clear-filters') {
                        activeFilters = emptyActiveFilters();
                        renderStoresStep();
                    } else if (action === 'clear-search') {
                        modelQuery = '';
                        renderModelsStep();
                    } else if (action === 'back-models') {
                        activeFilters = emptyActiveFilters();
                        renderModelsStep();
                    } else if (action === 'refresh') {
                        refreshData();
                    } else if (action === 'refresh-server') {
                        reloadFromServer();
                    }
                });
            });
        }

        function wireNetworkStoreBoard() {
            const board = bodyEl.querySelector('.tm-sl-network-board');
            if (!board) return false;

            const navItems = [...board.querySelectorAll('[data-tm-sl-select-store]')];
            const detailEl = board.querySelector('#tm-sl-network-detail');
            const panelsRoot = board.querySelector('.tm-sl-network-panels');

            const selectStore = (idx) => {
                navItems.forEach((item) => {
                    const active = item.dataset.tmSlSelectStore === String(idx);
                    item.classList.toggle('is-active', active);
                    item.setAttribute('aria-selected', active ? 'true' : 'false');
                    item.tabIndex = active ? 0 : -1;
                });
                const panel = panelsRoot?.querySelector(`[data-tm-sl-store-panel="${idx}"]`);
                if (panel && detailEl) {
                    const metaRow = detailEl.querySelector('.tm-sl-network-detail-head__row');
                    const panelMeta = panel.querySelector('.tm-sl-network-panel-meta');
                    if (metaRow && panelMeta) metaRow.innerHTML = panelMeta.innerHTML;

                    const tableRoot = detailEl.querySelector('#tm-sl-network-table-root');
                    const panelTable = panel.querySelector('.tm-sl-network-detail-table-wrap');
                    if (tableRoot && panelTable) tableRoot.innerHTML = panelTable.outerHTML;

                    wireUnitActions();
                }
            };

            navItems.forEach((item) => {
                item.addEventListener('click', () => selectStore(item.dataset.tmSlSelectStore));
            });

            board.querySelector('.tm-sl-network-stores')?.addEventListener('keydown', (e) => {
                const current = document.activeElement;
                const idx = navItems.indexOf(current);
                if (idx < 0) return;
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = navItems[Math.min(idx + 1, navItems.length - 1)];
                    next?.focus();
                    selectStore(next.dataset.tmSlSelectStore);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = navItems[Math.max(idx - 1, 0)];
                    prev?.focus();
                    selectStore(prev.dataset.tmSlSelectStore);
                }
            });

            if (navItems.length) {
                navItems[0].classList.add('is-active');
                navItems[0].setAttribute('aria-selected', 'true');
                navItems[0].tabIndex = 0;
                wireUnitActions();
            } else {
                wireUnitActions();
            }
            return true;
        }

        function wireFilterChips(root) {
            if (!root) return;
            root.querySelectorAll('[data-tm-sl-filter]').forEach((chip) => {
                chip.addEventListener('click', () => {
                    const key = chip.getAttribute('data-tm-sl-filter');
                    if (key === 'clear') {
                        activeFilters = emptyActiveFilters();
                    } else {
                        const val = chip.getAttribute('data-tm-sl-value') || '';
                        activeFilters[key] = activeFilters[key] === val ? '' : val;
                    }
                    if (step === 'stores' && selectedModel) renderStoresStep();
                    else renderModelsStep();
                });
            });
        }

        function wireStoreBoard() {
            if (wireNetworkStoreBoard()) return;

            bodyEl.querySelectorAll('[data-tm-sl-toggle-store]').forEach((head) => {
                const toggle = () => {
                    const row = head.closest('.tm-sl-store-row');
                    if (!row) return;
                    row.classList.toggle('is-open');
                    head.setAttribute('aria-expanded', row.classList.contains('is-open') ? 'true' : 'false');
                };
                head.addEventListener('click', (e) => {
                    if (e.target.closest('[data-tm-sl-call-store], .tm-sl-store-call')) return;
                    toggle();
                });
                head.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (e.target.closest('[data-tm-sl-call-store], .tm-sl-store-call')) return;
                        e.preventDefault();
                        toggle();
                    }
                });
            });

            wireUnitActions();
            bindStoreKeyboard(bodyEl);
        }

        function wireViewTabs() {
            const mineTab = overlay.querySelector('#tm-sl-view-mine');
            const networkTab = overlay.querySelector('#tm-sl-view-network');
            const switchView = async (view) => {
                if (catalogView === view) return;
                catalogView = view;
                GM_setValue(CATALOG_VIEW_KEY, catalogView);
                UI.updateViewTabs(overlay, catalogView);
                step = 'models';
                selectedModel = null;
                // Keep activeFilters across mine ↔ network so a GB/grade filter survives the switch.
                syncCatalogHeaders();

                const needsFetch = catalogView === 'network' && !isNetworkPoolLoaded();
                let skeletonTimer = null;
                if (needsFetch) {
                    skeletonTimer = setTimeout(() => {
                        bodyEl.innerHTML = UI.buildSkeletonGrid(8);
                        setStatus(catalogCategory === 'laptops' ? 'Φόρτωση φορητών δικτύου…' : 'Φόρτωση δικτύου…');
                    }, 80);
                    await ensureOtherStores();
                    clearTimeout(skeletonTimer);
                }
                renderModelsStep();
            };
            mineTab?.addEventListener('click', () => switchView('mine'));
            networkTab?.addEventListener('click', () => switchView('network'));
        }

        wireViewTabs();

        let modelSearchTimer = null;

        function getNearestStoreHint(model, data) {
            const stores = data?.storeList || [];
            if (!stores.length) return '';
            const myStore = typeof window.getCurrentStoreName === 'function' ? window.getCurrentStoreName() : '';
            if (!myStore || typeof window.compareStoresByProximity !== 'function') {
                const first = stores[0];
                const dist = typeof window.getStoreDistanceLabel === 'function'
                    ? window.getStoreDistanceLabel(myStore, first)
                    : '';
                return dist ? `${first} ${dist}` : first;
            }
            const sorted = [...stores].sort((a, b) => window.compareStoresByProximity(a, b, myStore));
            const nearest = sorted[0];
            const dist = typeof window.getStoreDistanceLabel === 'function'
                ? window.getStoreDistanceLabel(myStore, nearest)
                : '';
            return dist ? `${nearest} ${dist}` : nearest;
        }

        function findPhoneByUnitCode(code) {
            const pools = catalogView === 'mine'
                ? [getLocalPool()]
                : [getNetworkPool(), getLocalPool()];
            for (const pool of pools) {
                const hit = (pool || []).find((p) => phoneMatchesUnitCode(p, code));
                if (hit) return hit;
            }
            return null;
        }

        async function jumpToUnitCode(rawQuery) {
            const code = normalizeUnitCode(rawQuery);
            if (!looksLikeUnitCode(code)) return false;

            if (catalogView === 'network' && !isNetworkPoolLoaded()) {
                await ensureOtherStores();
            }

            let phone = findPhoneByUnitCode(code);
            if (!phone && catalogView === 'mine') {
                // Fallback: check network if not in mine stock.
                if (!isNetworkPoolLoaded()) await ensureOtherStores();
                phone = (getNetworkPool() || []).find((p) => phoneMatchesUnitCode(p, code));
                if (phone) {
                    catalogView = 'network';
                    GM_setValue(CATALOG_VIEW_KEY, catalogView);
                    UI.updateViewTabs(overlay, catalogView);
                }
            }
            if (!phone) {
                UI.showToast(overlay, `Δεν βρέθηκε · ${code}`);
                return true;
            }

            const model = helpers.extractBaseModel(phone.model);
            if (!model) return true;
            selectedModel = model;
            recentModels = pushRecentModel(model);
            pendingFlashBarcode = phone.barcode || code;
            modelQuery = '';
            await renderStoresStep();
            if (phone.barcode && typeof GM_setClipboard === 'function') {
                // Soft hint only — user can click to copy; don't auto-copy on jump.
            }
            UI.showToast(overlay, `Βρέθηκε · ${model.replace(/^IPHONE\s+/i, '')} · ${phone.barcode || code}`, {
                barcode: phone.barcode || '',
            });
            return true;
        }

        function getFilteredModels() {
            const localPool = catalogCategory === 'laptops'
                ? applyLaptopFiltersToPool(getLocalPool())
                : getLocalPool();
            const networkPool = catalogCategory === 'laptops'
                ? applyLaptopFiltersToPool(getNetworkPool())
                : getNetworkPool();
            let models = buildModelIndex(localPool, networkPool, helpers, catalogView);
            models = sortModels(models, modelSort);
            if (modelQuery) {
                const q = modelQuery;
                const code = normalizeUnitCode(q);
                if (looksLikeUnitCode(code)) {
                    models = models.filter(([name, data]) => {
                        // Keep model list light while typing a code; jump happens on Enter.
                        return name.toLowerCase().includes(q);
                    });
                } else {
                    models = models.filter(([name]) => name.toLowerCase().includes(q));
                }
            }
            return models;
        }

        function renderModelsBody() {
            const models = getFilteredModels();
            bodyEl.innerHTML = UI.buildModelGrid(models, buildUiCtx({
                getNearestStoreHint,
            }));
            if (catalogView === 'mine') {
                const mineCount = getLocalPool().filter((p) => (p.unitsRemaining || 0) > 0).length;
                setStatus(`${models.length} μοντέλα · ${mineCount} συσκευές στο ${resolveMyStoreLabel()}`);
            } else {
                setStatus(`${models.length} μοντέλα · ${getNetworkPool().length} συσκευές στο δίκτυο`);
            }
            wireModelCards();
            wireUnitActions();
        }

        function wireModelSearchToolbar() {
            const searchInput = toolbarEl.querySelector('#tm-sl-model-search');
            if (searchInput) {
                searchInput.value = modelQuery;
                searchInput.addEventListener('input', () => {
                    modelQuery = searchInput.value.trim().toLowerCase();
                    clearTimeout(modelSearchTimer);
                    modelSearchTimer = setTimeout(() => {
                        renderModelsBody();
                    }, 120);
                });
                searchInput.addEventListener('keydown', async (e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    const raw = searchInput.value.trim();
                    if (await jumpToUnitCode(raw)) return;
                    modelQuery = raw.toLowerCase();
                    renderModelsBody();
                });
            }

            const sortSelect = toolbarEl.querySelector('#tm-sl-model-sort, [data-tm-sl-sort-select]');
            if (sortSelect) {
                sortSelect.value = modelSort;
                sortSelect.addEventListener('change', () => {
                    modelSort = sortSelect.value || 'name';
                    GM_setValue(SORT_KEY, modelSort);
                    // Re-sort list only — do NOT re-run renderModelsStep (that rebuilds
                    // the toolbar and auto-focuses search, which feels like a search fired).
                    renderModelsBody();
                });
            }

            toolbarEl.querySelectorAll('[data-tm-sl-sort]').forEach((pill) => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    modelSort = pill.getAttribute('data-tm-sl-sort') || 'name';
                    GM_setValue(SORT_KEY, modelSort);
                    toolbarEl.querySelectorAll('[data-tm-sl-sort]').forEach((p) => {
                        p.classList.toggle('is-active', p.getAttribute('data-tm-sl-sort') === modelSort);
                    });
                    if (sortSelect) sortSelect.value = modelSort;
                    renderModelsBody();
                });
            });

            toolbarEl.querySelectorAll('[data-tm-sl-recent]').forEach((chip) => {
                chip.addEventListener('click', () => {
                    const model = chip.getAttribute('data-tm-sl-recent');
                    if (!model) return;
                    selectedModel = model;
                    recentModels = pushRecentModel(model);
                    renderStoresStep();
                });
            });
        }

        function hasActiveFilters() {
            return !!(
                activeFilters.grade || activeFilters.gb || activeFilters.color || activeFilters.tag
                || activeFilters.brand || activeFilters.cpu || activeFilters.ram || activeFilters.storage
            );
        }

        function buildLaptopChipsHtml(model = null) {
            const filterOptions = model
                ? collectFiltersForModel(getLocalPool(), getNetworkPool(), model, helpers, catalogView, 'laptops')
                : collectLaptopFilterOptions(getLocalPool(), getNetworkPool(), helpers, catalogView, null);
            const filterCounts = model
                ? collectFilterCounts(getLocalPool(), getNetworkPool(), model, activeFilters, helpers, catalogView, 'laptops')
                : collectLaptopFilterCounts(getLocalPool(), getNetworkPool(), activeFilters, helpers, catalogView, null);
            return UI.buildFilterChips(filterOptions, activeFilters, buildUiCtx({
                counts: filterCounts,
                laptopFilters: true,
            }));
        }

        function applyLaptopFiltersToPool(pool) {
            if (!hasActiveFilters()) return pool;
            return (pool || []).filter((p) => laptopMatchesFilters(p, activeFilters, helpers));
        }

        function mergeNetworkStoreHints() {
            if (catalogCategory === 'laptops') return;
            if (typeof window.mergeOtherStoresFromAllPhones === 'function') {
                window.mergeOtherStoresFromAllPhones(allPhones, otherStorePhones);
            }
        }

        async function resolveNetworkStoreDetails(modelFilter = null, onProgress = null) {
            if (storesResolving || typeof window.resolvePhonesStoreDetails !== 'function') return;
            mergeNetworkStoreHints();
            const networkPool = getNetworkPool();
            const phones = modelFilter
                ? networkPool.filter(modelFilter)
                : networkPool;
            const needsResolve = phones.some((p) => {
                const stores = helpers.getEffectivePhoneStores(p);
                return !stores.length && (parseInt(p.otherStoreCount, 10) || 0) > 0;
            });
            if (!needsResolve) {
                onProgress?.(1, 1);
                return;
            }

            storesResolving = true;
            try {
                await window.resolvePhonesStoreDetails(networkPool, {
                    concurrency: 8,
                    filter: modelFilter || undefined,
                    persistOtherStoreCache: catalogCategory !== 'laptops',
                    onProgress: (done, total) => {
                        setStatus(`Φόρτωση καταστημάτων ${done}/${total}…`);
                        onProgress?.(done, total);
                    },
                });
            } finally {
                storesResolving = false;
            }
        }

        function renderModelsStep() {
            step = 'models';
            selectedModel = null;
            lastTrackedLookupModel = null;
            lastTrackedNetworkModel = null;
            UI.updateBreadcrumb(overlay, 'models');
            syncCatalogHeaders();
            const chipsHtml = catalogCategory === 'laptops' ? buildLaptopChipsHtml(null) : '';
            toolbarEl.innerHTML = UI.buildModelSearchToolbar(modelSort, {
                recentModels,
                chipsHtml,
                placeholder: catalogCategory === 'laptops'
                    ? 'Μάρκα, μοντέλο, CPU, barcode'
                    : 'Μοντέλο, barcode ή IMEI',
            });
            wireModelSearchToolbar();
            if (catalogCategory === 'laptops') wireFilterChips(toolbarEl);

            const searchInput = toolbarEl.querySelector('#tm-sl-model-search');
            if (searchInput) {
                requestAnimationFrame(() => {
                    if (document.activeElement !== searchInput) searchInput.focus();
                });
            }

            renderModelsBody();
        }

        async function renderStoresStep() {
            if (!selectedModel) return renderModelsStep();
            step = 'stores';
            UI.updateBreadcrumb(overlay, 'stores', selectedModel);
            UI.setStoresModelHeader(overlay, selectedModel, catalogView === 'mine'
                ? `${resolveMyStoreLabel()} · κλικ στο barcode για αντιγραφή`
                : 'Διαθεσιμότητα σε άλλα καταστήματα');

            const filterOptions = collectFiltersForModel(
                getLocalPool(), getNetworkPool(), selectedModel, helpers, catalogView, catalogCategory
            );
            const filterCounts = collectFilterCounts(
                getLocalPool(), getNetworkPool(), selectedModel, activeFilters, helpers, catalogView, catalogCategory
            );
            const chipsHtml = UI.buildFilterChips(filterOptions, activeFilters, buildUiCtx({
                counts: filterCounts,
                laptopFilters: catalogCategory === 'laptops',
            }));
            const isNetwork = catalogView === 'network';
            const filtersSummary = typeof UI.formatActiveFiltersSummary === 'function'
                ? UI.formatActiveFiltersSummary(activeFilters)
                : '';
            const filtersActive = hasActiveFilters();

            let qtyLabel = '';
            let mineVariants = null;
            if (!isNetwork) {
                mineVariants = buildMyStoreUnitsData(selectedModel, getLocalPool(), activeFilters, helpers);
                qtyLabel = `${mineVariants.length} τεμ.`;
            }

            toolbarEl.innerHTML = UI.buildStoreToolbar(selectedModel, chipsHtml, {
                network: isNetwork,
                filtersSummary,
                qtyLabel,
                showPurchaseStatus: isNetwork,
            });

            toolbarEl.querySelector('#tm-sl-back')?.addEventListener('click', () => {
                // Keep laptop facet filters when returning to model list.
                if (catalogCategory !== 'laptops') activeFilters = emptyActiveFilters();
                renderModelsStep();
            });
            wireFilterChips(toolbarEl);

            if (catalogView === 'mine') {
                const variants = mineVariants || buildMyStoreUnitsData(selectedModel, getLocalPool(), activeFilters, helpers);
                bodyEl.innerHTML = UI.buildMyStoreBoard(selectedModel, variants, buildUiCtx({
                    hideStoreInUnits: true,
                    hasActiveFilters: filtersActive,
                }));
                setStatus(`${variants.length} ${variants.length === 1 ? 'συσκευή' : 'συσκευές'} στο ${resolveMyStoreLabel()}`);
                if (selectedModel !== lastTrackedLookupModel) {
                    trackCatalogStat('phoneCatalogLookup');
                    lastTrackedLookupModel = selectedModel;
                }
                wireUnitActions();
                return;
            }

            const needsResolve = getNetworkPool().some((p) => {
                if (helpers.extractBaseModel(p.model) !== selectedModel) return false;
                const stores = helpers.getEffectivePhoneStores(p);
                return !stores.length && (parseInt(p.otherStoreCount, 10) || 0) > 0;
            });
            if (needsResolve) {
                bodyEl.innerHTML = UI.buildSkeletonNetworkBoard();
                const progress = createLoadProgressController();
                progress.beginPhaseClock();
                progress.updateDeterminate('Φόρτωση λεπτομερειών καταστημάτων…', 0, 1);
                setStatus('Φόρτωση καταστημάτων…');

                const modelFilter = (p) => helpers.extractBaseModel(p.model) === selectedModel;
                await resolveNetworkStoreDetails(modelFilter, (done, total) => {
                    progress.updateDeterminate('Φόρτωση λεπτομερειών καταστημάτων…', done, total || 1);
                });
                progress.finishPhase('storeResolve', progress.getPhaseElapsed());
                progress.hide();
            } else {
                const modelFilter = (p) => helpers.extractBaseModel(p.model) === selectedModel;
                await resolveNetworkStoreDetails(modelFilter);
            }

            const storeRows = buildNetworkStoreBoardData(selectedModel, getNetworkPool(), activeFilters, helpers);
            bodyEl.innerHTML = UI.buildNetworkStoreBoard(selectedModel, storeRows, buildUiCtx({
                showPurchaseStatus: true,
                hideStoreInUnits: true,
                showDistance: true,
                hasActiveFilters: filtersActive,
            }));

            const storeCount = storeRows.length;
            setStatus(`${storeCount} ${storeCount === 1 ? 'κατάστημα' : 'καταστήματα'} στο δίκτυο`);
            if (selectedModel !== lastTrackedLookupModel) {
                trackCatalogStat('phoneCatalogLookup');
                lastTrackedLookupModel = selectedModel;
            }
            if (selectedModel !== lastTrackedNetworkModel) {
                trackCatalogStat('phoneCatalogNetworkLookup');
                lastTrackedNetworkModel = selectedModel;
            }
            wireStoreBoard();
        }

        async function ensureOtherStores(onProgress, opts = {}) {
            if (catalogCategory === 'laptops') {
                if (otherStoreLaptopsLoaded) return;
                if (!opts.force) {
                    const cached = typeof window.getOtherStoreLaptopCache === 'function'
                        ? window.getOtherStoreLaptopCache()
                        : null;
                    if (!cached?.length) return;
                }
                if (typeof window.fetchOtherStoreLaptops !== 'function') return;
                otherStoreLaptops = await window.fetchOtherStoreLaptops({
                    force: !!opts.force,
                    onProgress,
                });
                otherStoreLaptopsLoaded = true;
                return;
            }
            if (otherStoreLoaded) return;
            if (!opts.force) {
                const cached = typeof window.getOtherStoreCache === 'function'
                    ? window.getOtherStoreCache()
                    : null;
                if (!cached?.length) return;
            }
            if (typeof window.fetchOtherStorePhones !== 'function') return;
            otherStorePhones = helpers.filterIphoneTitlePhones(
                await window.fetchOtherStorePhones({ force: !!opts.force, onProgress })
            );
            otherStoreLoaded = true;
            mergeNetworkStoreHints();
        }

        function createLoadProgressController() {
            const stats = loadLoadStats();
            let phaseStart = Date.now();
            let expectedMs = stats.phoneListMs;
            let ticker = null;
            let lastTotal = 0;

            const stopTicker = () => {
                if (ticker) {
                    clearInterval(ticker);
                    ticker = null;
                }
            };

            const startIndeterminate = (label, expected) => {
                stopTicker();
                phaseStart = Date.now();
                expectedMs = Math.max(1200, expected || expectedMs || 8000);
                lastTotal = 0;
                UI.showLoadProgress(overlay, {
                    label,
                    indeterminate: true,
                    etaMs: expectedMs,
                    meta: 'Παρακαλώ περιμένετε…',
                });
                setStatus(label);
                ticker = setInterval(() => {
                    const elapsed = Date.now() - phaseStart;
                    const remain = Math.max(700, expectedMs - elapsed);
                    const softRatio = Math.min(0.92, elapsed / Math.max(expectedMs, 1));
                    UI.updateLoadProgress(overlay, {
                        label,
                        indeterminate: true,
                        etaMs: remain,
                        meta: softRatio > 0.75
                            ? 'Ολοκληρώνεται…'
                            : 'Παρακαλώ περιμένετε…',
                    });
                }, 250);
            };

            const updateDeterminate = (label, done, total) => {
                stopTicker();
                lastTotal = total;
                const elapsed = Date.now() - phaseStart;
                let etaMs = null;
                if (done > 0 && total > done) {
                    etaMs = (elapsed / done) * (total - done);
                } else if (total > 0 && done === 0) {
                    etaMs = (stats.storeResolvePerItemMs || 180) * total;
                } else {
                    etaMs = 600;
                }
                UI.showLoadProgress(overlay, {
                    label,
                    done,
                    total,
                    etaMs,
                    indeterminate: false,
                    ratio: total > 0 ? done / total : 0,
                });
                setStatus(`${label} ${done}/${total}`);
            };

            const finishPhase = (key, durationMs) => {
                stopTicker();
                if (key === 'phoneListMs' || key === 'otherStoresMs') {
                    stats[key] = blendDuration(stats[key], durationMs);
                } else if (key === 'storeResolve' && lastTotal > 0) {
                    stats.storeResolvePerItemMs = blendDuration(
                        stats.storeResolvePerItemMs,
                        durationMs / lastTotal
                    );
                }
            };

            const hide = () => {
                stopTicker();
                UI.hideLoadProgress(overlay);
                saveLoadStats(stats);
            };

            return {
                stats,
                startIndeterminate,
                updateDeterminate,
                finishPhase,
                hide,
                beginPhaseClock: () => { phaseStart = Date.now(); },
                getPhaseElapsed: () => Date.now() - phaseStart,
            };
        }

        async function refreshData(opts = {}) {
            const quiet = !!opts.quiet;
            const progress = createLoadProgressController();
            UI.setRefreshing(overlay, true);
            const bodyEmpty = !bodyEl.querySelector('.tm-sl-model-grid, .tm-sl-mine-board, .tm-sl-network-board');
            if (bodyEmpty && !quiet) {
                bodyEl.innerHTML = UI.buildSkeletonGrid(8);
            }

            try {
                if (!quiet) {
                    progress.startIndeterminate(
                        catalogCategory === 'laptops'
                            ? 'Φόρτωση μεταχειρισμένων φορητών…'
                            : 'Φόρτωση καταλόγου συσκευών…',
                        progress.stats.phoneListMs
                    );
                } else {
                    setStatus('Ενημέρωση στο παρασκήνιο…');
                }
                progress.beginPhaseClock();
                const onListProgress = quiet
                    ? () => {}
                    : (info) => {
                        if (!info) return;
                        if (info.phase === 'expand') {
                            UI.updateLoadProgress(overlay, {
                                label: 'Ανάκτηση πλήρων ονομάτων…',
                                ratio: Math.min(0.98, 0.7 + (info.ratio || 0) * 0.25),
                                indeterminate: false,
                                etaMs: 1200,
                                meta: info.total ? `${info.done || 0}/${info.total}` : 'Περισσότερα…',
                            });
                            setStatus('Ανάκτηση πλήρων ονομάτων…');
                            return;
                        }
                        if (info.phase === 'download' && info.ratio != null) {
                            const remain = Math.max(
                                600,
                                (progress.stats.phoneListMs || 9000) * (1 - info.ratio)
                            );
                            UI.updateLoadProgress(overlay, {
                                label: catalogCategory === 'laptops' ? 'Λήψη φορητών…' : 'Λήψη καταλόγου…',
                                ratio: Math.min(0.9, 0.08 + info.ratio * 0.75),
                                indeterminate: false,
                                etaMs: remain,
                                meta: info.total
                                    ? `${Math.round((info.loaded / info.total) * 100)}% λήψη`
                                    : 'Λήψη δεδομένων…',
                            });
                            setStatus(catalogCategory === 'laptops' ? 'Λήψη φορητών…' : 'Λήψη καταλόγου…');
                        } else if (info.phase === 'parse') {
                            UI.updateLoadProgress(overlay, {
                                label: 'Επεξεργασία καταλόγου…',
                                ratio: 0.92,
                                indeterminate: false,
                                etaMs: 900,
                                meta: 'Ανάλυση συσκευών…',
                            });
                        } else if (info.phase === 'init') {
                            UI.updateLoadProgress(overlay, {
                                label: 'Σύνδεση με τον κατάλογο…',
                                indeterminate: true,
                                etaMs: progress.stats.phoneListMs,
                                meta: 'Προετοιμασία…',
                            });
                        }
                    };

                if (catalogCategory === 'laptops') {
                    if (typeof window.fetchLaptopList === 'function') {
                        allLaptops = await window.fetchLaptopList({
                            force: true,
                            onProgress: onListProgress,
                        });
                    }
                } else if (typeof window.fetchPhoneList === 'function') {
                    allPhones = helpers.filterIphoneTitlePhones(await window.fetchPhoneList({
                        force: true,
                        onProgress: onListProgress,
                    }));
                }
                progress.finishPhase('phoneListMs', progress.getPhaseElapsed());

                if (!quiet) {
                    if (catalogCategory === 'laptops') {
                        otherStoreLaptopsLoaded = false;
                        GM_setValue('tm_laptop_other_store_cache_v1', null);
                        GM_setValue('tm_laptop_other_store_cache_timestamp_v1', 0);
                    } else {
                        otherStoreLoaded = false;
                        GM_setValue('tm_phone_other_store_cache_v3', null);
                        GM_setValue('tm_phone_other_store_cache_timestamp', 0);
                    }

                    progress.startIndeterminate(
                        catalogCategory === 'laptops' ? 'Φόρτωση φορητών δικτύου…' : 'Φόρτωση δικτύου καταστημάτων…',
                        progress.stats.otherStoresMs
                    );
                    progress.beginPhaseClock();
                    await ensureOtherStores((info) => {
                        if (info?.phase === 'download' && info.ratio != null) {
                            UI.updateLoadProgress(overlay, {
                                label: 'Λήψη δικτύου…',
                                ratio: Math.min(0.9, 0.1 + info.ratio * 0.75),
                                indeterminate: false,
                                etaMs: Math.max(600, (progress.stats.otherStoresMs || 7000) * (1 - info.ratio)),
                                meta: info.total
                                    ? `${Math.round((info.loaded / info.total) * 100)}% λήψη`
                                    : 'Λήψη δεδομένων…',
                            });
                        } else if (info?.phase === 'parse' || info?.phase === 'expand') {
                            UI.updateLoadProgress(overlay, {
                                label: info.phase === 'expand' ? 'Ανάκτηση πλήρων ονομάτων…' : 'Επεξεργασία δικτύου…',
                                ratio: 0.93,
                                indeterminate: false,
                                etaMs: 800,
                                meta: info.phase === 'expand' && info.total
                                    ? `${info.done || 0}/${info.total}`
                                    : 'Ανάλυση αποθεμάτων…',
                            });
                        }
                    }, { force: true });
                    progress.finishPhase('otherStoresMs', progress.getPhaseElapsed());

                    if (catalogView === 'network') {
                        progress.beginPhaseClock();
                        progress.updateDeterminate('Φόρτωση λεπτομερειών καταστημάτων…', 0, 1);
                        await resolveNetworkStoreDetails(null, (done, total) => {
                            progress.updateDeterminate('Φόρτωση λεπτομερειών καταστημάτων…', done, total || 1);
                        });
                        progress.finishPhase('storeResolve', progress.getPhaseElapsed());
                    }
                } else if (!isNetworkPoolLoaded()) {
                    await ensureOtherStores();
                }

                if (catalogCategory !== 'laptops' && typeof window.syncPhoneColorCatalog === 'function') {
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
                if (!quiet || bodyEmpty) {
                    bodyEl.innerHTML = UI.buildEmptyState(
                        UI.ICON.emptyError,
                        'Σφάλμα φόρτωσης',
                        err.message || '',
                        { actionId: 'back-models', actionLabel: 'Επιστροφή' }
                    );
                    wireUnitActions();
                }
                setStatus('Σφάλμα φόρτωσης');
            } finally {
                progress.hide();
                UI.setRefreshing(overlay, false);
            }
        }

        async function reloadFromServer() {
            UI.setServerRefreshing(overlay, true);
            try {
                allPhones = [];
                otherStorePhones = [];
                otherStoreLoaded = false;
                otherStoreLaptops = [];
                otherStoreLaptopsLoaded = false;
                allLaptops = [];
                await paintStoredCatalogData();
                const hasData = allPhones.length || otherStorePhones.length || allLaptops.length || otherStoreLaptops.length;
                if (hasData) UI.showToast(overlay, 'Φορτώθηκε από server');
            } catch (err) {
                console.warn('[MMS Store Locator] server reload failed', err);
                UI.showToast(overlay, 'Αποτυχία φόρτωσης από server');
                setStatus('Αποτυχία φόρτωσης από server');
            } finally {
                UI.setServerRefreshing(overlay, false);
            }
        }

        overlay.querySelector('#tm-sl-close')?.addEventListener('click', closeModal);
        overlay.querySelector('#tm-sl-refresh')?.addEventListener('click', refreshData);

        const serverRefreshBtn = overlay.querySelector('#tm-sl-refresh-server');
        if (typeof window.suiteUseDatabase === 'function' && !window.suiteUseDatabase()) {
            serverRefreshBtn?.remove();
        } else {
            serverRefreshBtn?.addEventListener('click', reloadFromServer);
        }
        overlay.querySelector('#tm-sl-density')?.addEventListener('click', () => {
            densityCompact = !densityCompact;
            GM_setValue(DENSITY_KEY, densityCompact);
            UI.setDensity(overlay, densityCompact);
        });
        overlay.querySelector('#tm-sl-scale-down')?.addEventListener('click', () => {
            uiScale = UI.stepUiScale(uiScale, -1);
            uiScale = UI.setUiScale(overlay, uiScale);
            GM_setValue(UI_SCALE_KEY, uiScale);
        });
        overlay.querySelector('#tm-sl-scale-up')?.addEventListener('click', () => {
            uiScale = UI.stepUiScale(uiScale, 1);
            uiScale = UI.setUiScale(overlay, uiScale);
            GM_setValue(UI_SCALE_KEY, uiScale);
        });
        overlay.querySelector('#tm-sl-scale-value')?.addEventListener('click', () => {
            uiScale = UI.UI_SCALE_DEFAULT || 1.15;
            uiScale = UI.setUiScale(overlay, uiScale);
            GM_setValue(UI_SCALE_KEY, uiScale);
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function onSlKeydown(e) {
            if (!document.body.contains(overlay)) {
                document.removeEventListener('keydown', onSlKeydown);
                return;
            }
            const tag = (e.target && e.target.tagName) || '';
            const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;

            if (!typing && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_')) {
                e.preventDefault();
                const dir = (e.key === '+' || e.key === '=') ? 1 : -1;
                uiScale = UI.stepUiScale(uiScale, dir);
                uiScale = UI.setUiScale(overlay, uiScale);
                GM_setValue(UI_SCALE_KEY, uiScale);
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                if (step === 'stores') {
                    activeFilters = emptyActiveFilters();
                    renderModelsStep();
                    return;
                }
                document.removeEventListener('keydown', onSlKeydown);
                closeModal();
                return;
            }

            if (!typing && e.key === '/' && step === 'models') {
                e.preventDefault();
                toolbarEl.querySelector('#tm-sl-model-search')?.focus();
            }
        });

        bodyEl.innerHTML = UI.buildSkeletonGrid(8);
        syncCatalogHeaders();

        async function paintStoredCatalogData() {
            if (catalogCategory === 'laptops') {
                const laptopCached = typeof window.loadLaptopListCache === 'function'
                    ? window.loadLaptopListCache()
                    : null;
                const laptopOtherCached = typeof window.getOtherStoreLaptopCache === 'function'
                    ? window.getOtherStoreLaptopCache()
                    : null;
                if (laptopOtherCached?.length) {
                    otherStoreLaptops = laptopOtherCached;
                    otherStoreLaptopsLoaded = true;
                }
                if (laptopCached?.length) {
                    allLaptops = laptopCached;
                    const ts = Number(GM_getValue('tm_laptop_list_cache_timestamp_v1', Date.now())) || Date.now();
                    lastUpdated = new Date(ts);
                    syncFreshness();
                    renderModelsStep();
                    setStatus(`${allLaptops.length} φορητοί · πατήστε Ανανέωση για νέα λήψη`);
                    return;
                }
                bodyEl.innerHTML = UI.buildEmptyState(
                    UI.ICON.emptyPhone,
                    'Δεν υπάρχουν αποθηκευμένα δεδομένα',
                    'Πατήστε Ανανέωση για λήψη φορητών από MyManager.',
                    { actionId: 'refresh', actionLabel: 'Ανανέωση δεδομένων' }
                );
                wireUnitActions();
                setStatus('Χωρίς αποθηκευμένα δεδομένα — πατήστε Ανανέωση');
                return;
            }

            setStatus('Φόρτωση από βάση…');
            let snap = { phones: [], otherStorePhones: [], lastUpdated: null, refreshedBy: '' };
            try {
                if (typeof window.loadPhoneCatalogFromDatabase === 'function') {
                    snap = await window.loadPhoneCatalogFromDatabase();
                } else if (typeof window.loadPhoneListCache === 'function') {
                    snap.phones = window.loadPhoneListCache() || [];
                    snap.otherStorePhones = typeof window.getOtherStoreCache === 'function'
                        ? (window.getOtherStoreCache() || [])
                        : [];
                }
            } catch (err) {
                console.warn('[MMS Store Locator] stored catalog load failed', err);
            }

            if (snap.otherStorePhones?.length) {
                otherStorePhones = helpers.filterIphoneTitlePhones(snap.otherStorePhones);
                otherStoreLoaded = true;
            }

            if (snap.phones?.length) {
                allPhones = helpers.filterIphoneTitlePhones(snap.phones);
                if (snap.lastUpdated) lastUpdated = snap.lastUpdated;
            }

            mergeNetworkStoreHints();

            const hasMine = buildMyStoreModelIndex(allPhones, helpers).length > 0;
            const hasNetwork = buildNetworkModelIndex(otherStorePhones, helpers).length > 0;

            if (!hasMine && !hasNetwork) {
                bodyEl.innerHTML = UI.buildEmptyState(
                    UI.ICON.emptyPhone,
                    'Δεν υπάρχουν αποθηκευμένα δεδομένα',
                    'Πατήστε Ανανέωση για λήψη καταλόγου από MyManager.',
                    { actionId: 'refresh', actionLabel: 'Ανανέωση δεδομένων' }
                );
                wireUnitActions();
                setStatus('Χωρίς αποθηκευμένα δεδομένα — πατήστε Ανανέωση');
                return;
            }

            if (catalogView === 'network' && !hasNetwork && hasMine) {
                catalogView = 'mine';
                GM_setValue(CATALOG_VIEW_KEY, catalogView);
                UI.updateViewTabs(overlay, catalogView);
                syncCatalogHeaders();
            } else if (catalogView === 'mine' && !hasMine && hasNetwork) {
                catalogView = 'network';
                GM_setValue(CATALOG_VIEW_KEY, catalogView);
                UI.updateViewTabs(overlay, catalogView);
                syncCatalogHeaders();
            }

            syncFreshness();
            renderModelsStep();
            const who = snap.refreshedBy ? ` · ${snap.refreshedBy}` : '';
            const mineUnits = allPhones.filter((p) => (p.unitsRemaining || 0) > 0).length;
            const netUnits = otherStorePhones.length;
            if (catalogView === 'network') {
                setStatus(`${netUnits} συσκευές δικτύου${who} · πατήστε Ανανέωση για νέα λήψη`);
            } else {
                setStatus(`${mineUnits} συσκευές${who} · πατήστε Ανανέωση για νέα λήψη`);
            }
            return;
        }

        paintStoredCatalogData();
    }

    window.showStoreLocatorModal = showStoreLocatorModal;

    const PHONE_CATALOG_MENU_ID = 'tm-phone-catalog-menu-item';
    const LAPTOP_CATALOG_MENU_ID = 'tm-laptop-catalog-menu-item';

    function removeLegacyPhoneCatalogButton() {
        document.getElementById('tm-phone-catalog-btn')?.remove();
    }

    function getPhoneCatalogMenuLabel() {
        if (typeof window.phoneCatalogT === 'function') {
            const translated = window.phoneCatalogT('catalogTitle');
            if (translated && translated !== 'catalogTitle') return translated;
        }
        return 'Κατάλογος Συσκευών';
    }

    function getLaptopCatalogMenuLabel() {
        return 'Κατάλογος Laptop';
    }

    function cloneNativeMenuItem(templateLi, label, iconKind) {
        if (typeof window.createSuiteMenuItem === 'function') {
            return window.createSuiteMenuItem(templateLi, label, iconKind);
        }
        const li = templateLi.cloneNode(true);
        li.classList.remove('current', 'expanded');
        li.removeAttribute('id');
        li.querySelectorAll(':scope > ul').forEach((ul) => ul.remove());
        const link = li.querySelector(':scope > div > div > a[href], :scope > div a[href], :scope > a[href]');
        if (link) {
            link.setAttribute('href', '#');
            link.textContent = label;
        }
        return li;
    }

    function createFallbackMenuItem(label, iconKind) {
        if (typeof window.createSuiteMenuItem === 'function') {
            return window.createSuiteMenuItem(null, label, iconKind);
        }
        const li = document.createElement('li');
        li.innerHTML = `<div><div><a href="#">${label}</a></div></div>`;
        return li;
    }

    function findMenuInsertPoint(menu) {
        const manageItem = menu.querySelector('[data-tm-manage-hidden="true"]');
        if (manageItem) {
            const separator = manageItem.previousElementSibling;
            if (separator?.getAttribute('data-tm-special') === 'true') return separator;
            return manageItem;
        }
        return null;
    }

    function findLaptopMenuInsertPoint(menu) {
        const phoneItem = document.getElementById(PHONE_CATALOG_MENU_ID);
        if (phoneItem?.parentElement === menu) {
            return phoneItem.nextElementSibling;
        }
        return findMenuInsertPoint(menu);
    }

    function openPhoneCatalogFromMenu() {
        if (typeof window.showPhoneListModal === 'function') {
            window.showPhoneListModal({ category: 'phones' });
        }
    }

    function openLaptopCatalogFromMenu() {
        if (typeof window.showLaptopCatalogModal === 'function') {
            window.showLaptopCatalogModal();
        } else if (typeof window.showPhoneListModal === 'function') {
            window.showPhoneListModal({ category: 'laptops' });
        } else if (typeof window.showStoreLocatorModal === 'function') {
            window.showStoreLocatorModal({ category: 'laptops' });
        }
    }

    function ensureSuiteCatalogMenuItem({
        menuId,
        suiteKey,
        menuDataId,
        label,
        iconKind,
        onOpen,
        insertBefore,
    }) {
        const menu = document.querySelector('.rnr-b-vmenu.simple.main');
        if (!menu) return false;

        let item = document.getElementById(menuId);
        if (!item) {
            const template = menu.querySelector(':scope > li:not(.menuGroup):not([data-tm-special]):not([data-tm-suite-item])')
                || menu.querySelector('li:not([data-tm-special]):not([data-tm-suite-item])');
            item = template
                ? cloneNativeMenuItem(template, label, iconKind)
                : createFallbackMenuItem(label, iconKind);

            item.id = menuId;
            item.setAttribute('data-tm-suite-item', suiteKey);
            item.setAttribute('data-menu-id', menuDataId);
            item.addEventListener('click', (e) => {
                e.preventDefault();
                onOpen();
            });

            if (insertBefore) menu.insertBefore(item, insertBefore);
            else menu.appendChild(item);
        } else {
            const link = item.querySelector('a[href]');
            if (link && typeof window.populateSuiteMenuLink === 'function') {
                window.populateSuiteMenuLink(link, label, iconKind);
            } else if (link) {
                link.textContent = label;
            }
            if (!item.parentElement) {
                if (insertBefore) menu.insertBefore(item, insertBefore);
                else menu.appendChild(item);
            }
        }

        item.style.display = '';
        return true;
    }

    function ensurePhoneCatalogMenuItem(config) {
        removeLegacyPhoneCatalogButton();

        const menu = document.querySelector('.rnr-b-vmenu.simple.main');
        if (!menu) return false;

        const phoneEnabled = config?.phoneCatalogEnabled !== false;
        const laptopEnabled = config?.laptopCatalogEnabled !== false;
        const phoneItem = document.getElementById(PHONE_CATALOG_MENU_ID);
        const laptopItem = document.getElementById(LAPTOP_CATALOG_MENU_ID);

        if (!phoneEnabled) {
            if (phoneItem) phoneItem.style.display = 'none';
            if (laptopItem) laptopItem.style.display = 'none';
            return true;
        }

        const phoneOk = ensureSuiteCatalogMenuItem({
            menuId: PHONE_CATALOG_MENU_ID,
            suiteKey: 'phone-catalog',
            menuDataId: 'suite-phone-catalog',
            label: getPhoneCatalogMenuLabel(),
            iconKind: 'phone-catalog',
            onOpen: openPhoneCatalogFromMenu,
            insertBefore: findMenuInsertPoint(menu),
        });

        if (!laptopEnabled) {
            if (laptopItem) laptopItem.style.display = 'none';
            return phoneOk;
        }

        const laptopOk = ensureSuiteCatalogMenuItem({
            menuId: LAPTOP_CATALOG_MENU_ID,
            suiteKey: 'laptop-catalog',
            menuDataId: 'suite-laptop-catalog',
            label: getLaptopCatalogMenuLabel(),
            iconKind: 'laptop-catalog',
            onOpen: openLaptopCatalogFromMenu,
            insertBefore: findLaptopMenuInsertPoint(menu),
        });

        return phoneOk && laptopOk;
    }

    function initPhoneCatalogMenuItem(config) {
        removeLegacyPhoneCatalogButton();

        if (config?.phoneCatalogEnabled === false) {
            document.getElementById(PHONE_CATALOG_MENU_ID)?.remove();
            document.getElementById(LAPTOP_CATALOG_MENU_ID)?.remove();
            return;
        }
        if (config?.laptopCatalogEnabled === false) {
            document.getElementById(LAPTOP_CATALOG_MENU_ID)?.remove();
        }

        let attempts = 0;
        const maxAttempts = 80;
        let observer = null;

        const tryInject = () => {
            attempts += 1;
            if (ensurePhoneCatalogMenuItem(config)) {
                if (observer) observer.disconnect();
                return;
            }
            if (attempts >= maxAttempts && observer) observer.disconnect();
        };

        tryInject();

        observer = new MutationObserver(() => {
            tryInject();
        });
        const leftPanel = document.querySelector('.rnr-left') || document.body;
        observer.observe(leftPanel, { childList: true, subtree: true });
        setTimeout(() => observer?.disconnect(), 10000);
    }

    function updatePhoneCatalogMenuItemVisibility(config) {
        ensurePhoneCatalogMenuItem(config);
    }

    window.initPhoneCatalogMenuItem = initPhoneCatalogMenuItem;
    window.updatePhoneCatalogButtonVisibility = updatePhoneCatalogMenuItemVisibility;
})();
