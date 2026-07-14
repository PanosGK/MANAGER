// ==================================================================================================
// Menu Item Hiding System — hide left sidebar items via right-click; restore from settings.
// ==================================================================================================

(function tmMenuItemHidingModule() {
    'use strict';

    const HIDDEN_ITEMS_KEY = 'tm_hidden_menu_items';
    const MENU_READY_CLASS = 'tm-mms-menu-ready';
    const MENU_PROCESSED_CLASS = 'tm-menu-processed';

    function parseHiddenItems(raw) {
        try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    function sanitizeToken(value) {
        return String(value || '')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .slice(0, 80);
    }

    function normalizeMenuHref(rawHref) {
        const trimmed = (rawHref || '').trim();
        if (!trimmed || trimmed === '#') return '';
        let path = trimmed.replace(/^https?:\/\/[^/?#]+/i, '');
        path = path.replace(/^\.\//, '');
        return path.split('#')[0];
    }

    function cssAttrSubstring(value) {
        return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function getDirectMenuLink(item) {
        return item.querySelector(':scope > div > div > a[href], :scope > div a[href], :scope > a[href]');
    }

    function getMenuItemMeta(item) {
        const link = getDirectMenuLink(item);
        const name = (link || item).textContent.replace(/\s+/g, ' ').trim();
        const href = link ? normalizeMenuHref(link.getAttribute('href') || '') : '';
        const id = href
            ? `href-${sanitizeToken(href)}`
            : `text-${sanitizeToken(name.substring(0, 40))}`;

        return { id, name, href };
    }

    function getHideableMenuItems(menu) {
        return Array.from(menu.querySelectorAll('li')).filter((item) => {
            if (item.getAttribute('data-tm-special') === 'true') return false;
            if (item.hasAttribute('data-tm-manage-hidden')) return false;
            const link = getDirectMenuLink(item);
            if (!link) return false;
            const href = (link.getAttribute('href') || '').trim();
            return href && href !== '#';
        });
    }

    function buildMenuItemHideSelector(href) {
        if (!href) return '';
        const escaped = cssAttrSubstring(href);
        return [
            `.rnr-b-vmenu.simple.main li:has(> div > div > a[href*="${escaped}"])`,
            `.rnr-b-vmenu.simple.main li:has(> div a[href*="${escaped}"])`,
        ].join(',\n');
    }

    function normalizeHiddenItem(item) {
        if (typeof item === 'string') {
            return { id: item, name: item, href: '' };
        }
        return {
            id: String(item?.id || ''),
            name: String(item?.name || item?.id || 'Unknown'),
            href: String(item?.href || ''),
        };
    }

    function loadHiddenItems(STORAGE_KEYS) {
        const key = STORAGE_KEYS?.HIDDEN_MENU_ITEMS || HIDDEN_ITEMS_KEY;
        return parseHiddenItems(GM_getValue(key, '[]')).map(normalizeHiddenItem).filter((item) => item.id);
    }

    function saveHiddenItems(STORAGE_KEYS, items) {
        const key = STORAGE_KEYS?.HIDDEN_MENU_ITEMS || HIDDEN_ITEMS_KEY;
        GM_setValue(key, JSON.stringify(items));
    }

    function isHiddenItem(meta, hiddenItems) {
        return hiddenItems.some((hidden) => hidden.id === meta.id);
    }

    function markMenuReady() {
        document.documentElement.classList.add(MENU_READY_CLASS);
        document.querySelectorAll('.rnr-left, .rnr-b-vmenu.simple.main').forEach((node) => {
            node.classList.add(MENU_READY_CLASS);
            node.classList.add(MENU_PROCESSED_CLASS);
        });
        if (typeof window.tmRevealThemedPageIfReady === 'function') {
            window.tmRevealThemedPageIfReady();
        }
    }

    window.tmMarkMenuReady = markMenuReady;

    function hideMenuItemElement(item) {
        item.style.display = 'none';
        item.classList.add('tm-hidden-menu-item');
    }

    function showMenuItemElement(item) {
        item.style.display = '';
        item.classList.remove('tm-hidden-menu-item');
    }

    function applyHiddenMenuItems(menu, hiddenItems) {
        getHideableMenuItems(menu).forEach((item) => {
            const meta = getMenuItemMeta(item);
            item.setAttribute('data-menu-id', meta.id);
            if (meta.href) item.setAttribute('data-menu-href', meta.href);

            if (isHiddenItem(meta, hiddenItems)) {
                hideMenuItemElement(item);
            } else {
                showMenuItemElement(item);
            }
        });
    }

    function migrateLegacyHiddenItems(menu, hiddenItems, STORAGE_KEYS) {
        const currentMetas = getHideableMenuItems(menu).map((item) => getMenuItemMeta(item));

        const migrated = hiddenItems.map((hidden) => {
            const exact = currentMetas.find((meta) => meta.id === hidden.id);
            if (exact) return { id: exact.id, name: exact.name, href: exact.href };

            if (hidden.name) {
                const byName = currentMetas.find((meta) => meta.name === hidden.name);
                if (byName) {
                    return { id: byName.id, name: byName.name, href: byName.href };
                }
            }

            if (hidden.id.startsWith('href-') && !hidden.id.includes('_') && hidden.href) {
                const legacyFile = hidden.href;
                const byFileAndName = currentMetas.find((meta) => {
                    return meta.href.startsWith(legacyFile) && (!hidden.name || meta.name === hidden.name);
                });
                if (byFileAndName) {
                    return { id: byFileAndName.id, name: byFileAndName.name, href: byFileAndName.href };
                }
            }

            if (!hidden.id.startsWith('href-') && !hidden.id.startsWith('text-')) {
                const legacySuffix = hidden.id.split('-').slice(3).join('-');
                if (legacySuffix) {
                    const bySuffix = currentMetas.find((meta) => {
                        const token = sanitizeToken(meta.name);
                        return token === legacySuffix || meta.name.toLowerCase().includes(legacySuffix.toLowerCase());
                    });
                    if (bySuffix) {
                        return { id: bySuffix.id, name: bySuffix.name, href: bySuffix.href };
                    }
                }
            }

            return null;
        }).filter(Boolean);

        const deduped = [];
        const seen = new Set();
        migrated.forEach((item) => {
            const key = item.href || item.id;
            if (seen.has(key)) return;
            seen.add(key);
            deduped.push(item);
        });

        if (JSON.stringify(deduped) !== JSON.stringify(hiddenItems)) {
            saveHiddenItems(STORAGE_KEYS, deduped);
        }

        return deduped;
    }

    function hideMenuItem(meta, STORAGE_KEYS) {
        let hiddenItems = loadHiddenItems(STORAGE_KEYS);
        if (!isHiddenItem(meta, hiddenItems)) {
            hiddenItems.push({ id: meta.id, name: meta.name, href: meta.href });
            saveHiddenItems(STORAGE_KEYS, hiddenItems);
        }
        if (typeof window.tmRefreshMenuEarlyCss === 'function') {
            window.tmRefreshMenuEarlyCss(hiddenItems);
        }
    }

    function unhideMenuItem(itemId, STORAGE_KEYS) {
        let hiddenItems = loadHiddenItems(STORAGE_KEYS);
        hiddenItems = hiddenItems.filter((item) => item.id !== itemId);
        saveHiddenItems(STORAGE_KEYS, hiddenItems);

        document.querySelectorAll('[data-menu-id]').forEach((item) => {
            if (item.getAttribute('data-menu-id') === itemId) {
                showMenuItemElement(item);
            }
        });

        if (typeof window.tmRefreshMenuEarlyCss === 'function') {
            window.tmRefreshMenuEarlyCss(hiddenItems);
        }
    }

    function addMenuItemContextMenu(menu, STORAGE_KEYS) {
        getHideableMenuItems(menu).forEach((item) => {
            if (item.dataset.tmHideBound === '1') return;
            item.dataset.tmHideBound = '1';

            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const meta = getMenuItemMeta(item);
                const promptText = `Απόκρυψη "${meta.name}" από το μενού;\n\nΜπορείτε να το επαναφέρετε από Ρυθμίσεις → Αριστερό Μενού.`;

                if (confirm(promptText)) {
                    hideMenuItem(meta, STORAGE_KEYS);
                    hideMenuItemElement(item);
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage('✓ Το στοιχείο μενού αποκρύφθηκε');
                    }
                }
            });

            item.title = 'Δεξί κλικ για απόκρυψη';
        });
    }

    function addManageMenuItemToList(menu, STORAGE_KEYS) {
        if (menu.querySelector('[data-tm-manage-hidden="true"]')) return;

        const separator = document.createElement('li');
        separator.setAttribute('data-tm-special', 'true');
        separator.style.cssText = 'height:1px;background:rgba(0,0,0,0.1);margin:4px 0;pointer-events:none;';

        const manageItem = document.createElement('li');
        manageItem.setAttribute('data-tm-special', 'true');
        manageItem.setAttribute('data-tm-manage-hidden', 'true');
        manageItem.innerHTML = `
            <div><div><a href="#">🔒 Κρυφά Στοιχεία Μενού</a></div></div>
        `;
        manageItem.title = 'Κάντε κλικ για διαχείριση κρυφών στοιχείων';

        manageItem.addEventListener('click', (e) => {
            e.preventDefault();
            showHiddenMenuItemsModal(STORAGE_KEYS);
        });
        manageItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        menu.appendChild(separator);
        menu.appendChild(manageItem);
    }

    function showHiddenMenuItemsModal(STORAGE_KEYS) {
        const hiddenItems = loadHiddenItems(STORAGE_KEYS);

        if (hiddenItems.length === 0) {
            if (window.showPositiveMessage) {
                window.showPositiveMessage('Δεν υπάρχουν κρυφά στοιχεία. Κάντε δεξί κλικ σε ένα στοιχείο του μενού για απόκρυψη.');
            }
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.innerHTML = `
            <div class="tm-modal-content" style="max-width:520px;">
                <div class="tm-modal-header">
                    <h3 class="tm-modal-title">🔒 Κρυφά Στοιχεία Μενού</h3>
                    <button class="tm-modal-close">&times;</button>
                </div>
                <div class="tm-modal-body" style="max-height:60vh;overflow-y:auto;">
                    <p style="margin:0 0 14px;font-size:13px;color:#555;">
                        Δεξί κλικ σε οποιοδήποτε στοιχείο του αριστερού μενού για απόκρυψη. Επαναφέρετε τα παρακάτω όποτε θέλετε.
                    </p>
                    <div id="tm-hidden-items-list" style="display:flex;flex-direction:column;gap:8px;"></div>
                    <button id="tm-restore-all-menu-items" style="width:100%;margin-top:16px;padding:10px;border:none;border-radius:8px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);color:#fff;">
                        Επαναφορά Όλων
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        const listContainer = overlay.querySelector('#tm-hidden-items-list');
        hiddenItems.forEach((hiddenItem) => {
            const card = document.createElement('div');
            card.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8f9fa;border-radius:8px;';
            card.innerHTML = `
                <span style="font-weight:600;font-size:13px;">${hiddenItem.name}</span>
                <button class="tm-restore-menu-item" data-item-id="${hiddenItem.id}" style="padding:6px 12px;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;background:#4caf50;color:#fff;">Επαναφορά</button>
            `;
            listContainer.appendChild(card);
        });

        listContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tm-restore-menu-item')) return;
            unhideMenuItem(e.target.getAttribute('data-item-id'), STORAGE_KEYS);
            if (window.showPositiveMessage) {
                window.showPositiveMessage('✓ Το στοιχείο επαναφέρθηκε');
            }
            overlay.remove();
            showHiddenMenuItemsModal(STORAGE_KEYS);
        });

        overlay.querySelector('#tm-restore-all-menu-items').addEventListener('click', () => {
            hiddenItems.forEach((item) => unhideMenuItem(item.id, STORAGE_KEYS));
            if (window.showPositiveMessage) {
                window.showPositiveMessage('✓ Όλα τα στοιχεία επαναφέρθηκαν');
            }
            overlay.remove();
        });
    }

    window.showHiddenMenuItemsModal = showHiddenMenuItemsModal;

    function processMenu(config, STORAGE_KEYS) {
        const menu = document.querySelector('.rnr-b-vmenu.simple.main');
        if (!menu) return false;

        let hiddenItems = loadHiddenItems(STORAGE_KEYS);
        hiddenItems = migrateLegacyHiddenItems(menu, hiddenItems, STORAGE_KEYS);
        if (typeof window.tmRefreshMenuEarlyCss === 'function') {
            window.tmRefreshMenuEarlyCss(hiddenItems);
        }
        applyHiddenMenuItems(menu, hiddenItems);
        addMenuItemContextMenu(menu, STORAGE_KEYS);
        addManageMenuItemToList(menu, STORAGE_KEYS);
        markMenuReady();
        return true;
    }

    function initMenuItemHiding(config) {
        const STORAGE_KEYS = window.STORAGE_KEYS;

        if (!config?.hiddenMenuItemsEnabled) {
            markMenuReady();
            return;
        }

        let attempts = 0;
        const maxAttempts = 80;
        let observer = null;

        const tryProcess = () => {
            attempts += 1;
            if (processMenu(config, STORAGE_KEYS)) {
                if (observer) observer.disconnect();
                return;
            }
            if (attempts >= maxAttempts) {
                markMenuReady();
                if (observer) observer.disconnect();
            }
        };

        tryProcess();

        observer = new MutationObserver(() => {
            tryProcess();
        });

        const leftPanel = document.querySelector('.rnr-left') || document.body;
        observer.observe(leftPanel, { childList: true, subtree: true });

        setTimeout(() => {
            markMenuReady();
            if (observer) observer.disconnect();
        }, 5000);
    }

    window.buildMenuItemHideSelector = buildMenuItemHideSelector;
    window.normalizeMenuHref = normalizeMenuHref;
    window.initMenuItemHiding = initMenuItemHiding;
})();
