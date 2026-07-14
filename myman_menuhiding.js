// ==================================================================================================
// Menu Item Hiding System — manage left sidebar visibility from the menu panel.
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

    function getMenuEntryAnchor(item) {
        const selectors = [
            ':scope > div > div > a[href]',
            ':scope > div a[href]',
            ':scope > a[href]',
            ':scope > div > div > a[itemtitle]',
            ':scope > div a[itemtitle]',
            ':scope > a[itemtitle]',
        ];
        for (const selector of selectors) {
            const link = item.querySelector(selector);
            if (link) return link;
        }
        return null;
    }

    function isSuiteMenuItem(item) {
        return item.hasAttribute('data-tm-suite-item') || item.hasAttribute('data-tm-manage-hidden');
    }

    function isHideableMenuItem(item) {
        if (item.getAttribute('data-tm-special') === 'true') return false;
        if (isSuiteMenuItem(item)) return false;

        const link = getMenuEntryAnchor(item);
        if (!link) return false;

        const href = (link.getAttribute('href') || '').trim();
        if (href && href !== '#') return true;
        if (item.classList.contains('menuGroup')) return true;
        if (link.hasAttribute('itemtitle')) return true;

        return false;
    }

    function cleanMenuItemLabel(name) {
        return String(name || '')
            .replace(/\u00bb/g, '')
            .replace(/»/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\d+\s*$/, '')
            .trim();
    }

    function extractMenuItemLabel(sourceEl) {
        const link = sourceEl.tagName === 'A' ? sourceEl : getMenuEntryAnchor(sourceEl) || sourceEl;
        if (!link) return cleanMenuItemLabel(sourceEl.textContent);

        if (link.getAttribute('itemtitle')) {
            return cleanMenuItemLabel(link.getAttribute('itemtitle'));
        }

        const clone = link.cloneNode(true);
        clone.querySelectorAll('b.raquo, .raquo, img.menu-icon').forEach((el) => el.remove());
        clone.querySelectorAll('*').forEach((el) => {
            const text = (el.textContent || '').trim();
            if (/^\d+$/.test(text)) {
                el.remove();
            }
        });

        const label = clone.textContent.replace(/\s+/g, ' ').trim();
        return cleanMenuItemLabel(label || link.textContent.replace(/\s+/g, ' ').trim());
    }

    function getMenuItemMeta(item) {
        const link = getMenuEntryAnchor(item);
        const name = extractMenuItemLabel(link || item);
        const href = link ? normalizeMenuHref(link.getAttribute('href') || '') : '';
        let id;

        if (href) {
            id = `href-${sanitizeToken(href)}`;
        } else if (link?.id) {
            id = `group-${sanitizeToken(link.id)}`;
        } else {
            id = `text-${sanitizeToken(name.substring(0, 40))}`;
        }

        return {
            id,
            name,
            href,
            isGroup: item.classList.contains('menuGroup'),
        };
    }

    function collectHideableMenuItems(menu) {
        const rows = [];

        function walk(container, depth) {
            Array.from(container.querySelectorAll(':scope > li')).forEach((item) => {
                if (isHideableMenuItem(item)) {
                    rows.push({
                        item,
                        depth,
                        meta: getMenuItemMeta(item),
                    });
                }

                const childList = item.querySelector(':scope > ul');
                if (childList) {
                    walk(childList, depth + 1);
                }
            });
        }

        walk(menu, 0);
        return rows;
    }

    function getHideableMenuItems(menu) {
        return collectHideableMenuItems(menu).map((row) => row.item);
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
            name: cleanMenuItemLabel(String(item?.name || item?.id || 'Unknown')),
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
                const targetName = cleanMenuItemLabel(hidden.name);
                const byName = currentMetas.find((meta) => cleanMenuItemLabel(meta.name) === targetName);
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

            if (!hidden.id.startsWith('href-') && !hidden.id.startsWith('text-') && !hidden.id.startsWith('group-')) {
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

    function buildMenuItemsCatalog(menu, hiddenItems) {
        const seen = new Set();
        const rows = [];

        if (menu) {
            collectHideableMenuItems(menu).forEach(({ item, depth, meta }) => {
                seen.add(meta.id);
                rows.push({
                    meta,
                    element: item,
                    depth,
                    hidden: isHiddenItem(meta, hiddenItems),
                    inMenu: true,
                });
            });
        }

        hiddenItems.forEach((hidden) => {
            if (!seen.has(hidden.id)) {
                rows.push({
                    meta: hidden,
                    element: null,
                    depth: 0,
                    hidden: true,
                    inMenu: false,
                });
            }
        });

        return rows;
    }

    function refreshMenuVisibilityInDom(menu, hiddenItems) {
        if (!menu) return;
        applyHiddenMenuItems(menu, hiddenItems);
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
        manageItem.title = 'Κάντε κλικ για διαχείριση ορατότητας του μενού';

        manageItem.addEventListener('click', (e) => {
            e.preventDefault();
            showMenuVisibilityPanel(STORAGE_KEYS);
        });
        manageItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        menu.appendChild(separator);
        menu.appendChild(manageItem);
    }

    function renderMenuVisibilityPanel(overlay, STORAGE_KEYS) {
        const menu = document.querySelector('.rnr-b-vmenu.simple.main');
        const hiddenItems = loadHiddenItems(STORAGE_KEYS);
        const catalog = buildMenuItemsCatalog(menu, hiddenItems);
        const listContainer = overlay.querySelector('#tm-menu-visibility-list');
        const summaryEl = overlay.querySelector('#tm-menu-visibility-summary');

        if (!listContainer) return;

        const hiddenCount = catalog.filter((row) => row.hidden).length;
        if (summaryEl) {
            summaryEl.textContent = catalog.length
                ? `${catalog.length - hiddenCount} ορατά · ${hiddenCount} κρυφά`
                : 'Δεν βρέθηκαν στοιχεία μενού.';
        }

        listContainer.innerHTML = '';

        if (!catalog.length) {
            listContainer.innerHTML = '<p style="margin:0;color:#666;font-size:13px;">Δεν βρέθηκαν στοιχεία στο αριστερό μενού.</p>';
            return;
        }

        catalog.forEach((row) => {
            const card = document.createElement('label');
            card.style.cssText = [
                'display:flex',
                'align-items:center',
                'justify-content:space-between',
                'gap:12px',
                'padding:12px 14px',
                'background:#f8f9fa',
                'border-radius:8px',
                'cursor:pointer',
                'border:1px solid #e9ecef',
            ].join(';');

            if (!row.inMenu) {
                card.style.opacity = '0.75';
            }

            if (row.depth > 0) {
                card.style.marginLeft = `${Math.min(row.depth, 4) * 16}px`;
            }

            const groupBadge = row.meta.isGroup
                ? '<span style="font-size:10px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Ομάδα</span>'
                : '';

            card.innerHTML = `
                <span style="display:flex;flex-direction:column;gap:2px;min-width:0;">
                    ${groupBadge}
                    <span style="font-weight:600;font-size:13px;color:#2c3e50;word-break:break-word;">${row.meta.name}</span>
                    ${row.inMenu ? '' : '<span style="font-size:11px;color:#888;">Δεν εμφανίζεται τώρα στο μενού</span>'}
                </span>
                <span style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                    <span style="font-size:12px;color:#666;">${row.hidden ? 'Κρυφό' : 'Ορατό'}</span>
                    <input type="checkbox" class="tm-menu-visibility-toggle" data-item-id="${row.meta.id}" ${row.hidden ? '' : 'checked'} style="width:18px;height:18px;cursor:pointer;">
                </span>
            `;

            const checkbox = card.querySelector('.tm-menu-visibility-toggle');
            checkbox.addEventListener('change', () => {
                const shouldShow = checkbox.checked;
                const currentHidden = loadHiddenItems(STORAGE_KEYS);
                const isCurrentlyHidden = isHiddenItem(row.meta, currentHidden);

                if (shouldShow && isCurrentlyHidden) {
                    unhideMenuItem(row.meta.id, STORAGE_KEYS);
                } else if (!shouldShow && !isCurrentlyHidden) {
                    hideMenuItem(row.meta, STORAGE_KEYS);
                    if (row.element) hideMenuItemElement(row.element);
                }

                renderMenuVisibilityPanel(overlay, STORAGE_KEYS);
            });

            listContainer.appendChild(card);
        });
    }

    function showMenuVisibilityPanel(STORAGE_KEYS) {
        const existing = document.getElementById('tm-menu-visibility-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tm-menu-visibility-overlay';
        overlay.className = 'tm-modal-overlay';
        overlay.innerHTML = `
            <div class="tm-modal-content" style="max-width:560px;">
                <div class="tm-modal-header">
                    <h3 class="tm-modal-title">🔒 Κρυφά Στοιχεία Μενού</h3>
                    <button class="tm-modal-close">&times;</button>
                </div>
                <div class="tm-modal-body" style="max-height:65vh;overflow-y:auto;">
                    <p style="margin:0 0 10px;font-size:13px;color:#555;">
                        Επιλέξτε ποια στοιχεία του αριστερού μενού θέλετε να εμφανίζονται.
                    </p>
                    <p id="tm-menu-visibility-summary" style="margin:0 0 14px;font-size:12px;color:#667eea;font-weight:600;"></p>
                    <div id="tm-menu-visibility-list" style="display:flex;flex-direction:column;gap:8px;"></div>
                    <button id="tm-restore-all-menu-items" type="button" style="width:100%;margin-top:16px;padding:10px;border:none;border-radius:8px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);color:#fff;">
                        Εμφάνιση Όλων
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelector('#tm-restore-all-menu-items').addEventListener('click', () => {
            const hiddenItems = loadHiddenItems(STORAGE_KEYS);
            hiddenItems.forEach((item) => unhideMenuItem(item.id, STORAGE_KEYS));
            const menu = document.querySelector('.rnr-b-vmenu.simple.main');
            if (menu) refreshMenuVisibilityInDom(menu, []);
            renderMenuVisibilityPanel(overlay, STORAGE_KEYS);
            if (window.showPositiveMessage) {
                window.showPositiveMessage('✓ Όλα τα στοιχεία εμφανίζονται ξανά');
            }
        });

        renderMenuVisibilityPanel(overlay, STORAGE_KEYS);
    }

    window.showHiddenMenuItemsModal = showMenuVisibilityPanel;
    window.showMenuVisibilityPanel = showMenuVisibilityPanel;

    function processMenu(config, STORAGE_KEYS) {
        const menu = document.querySelector('.rnr-b-vmenu.simple.main');
        if (!menu) return false;

        let hiddenItems = loadHiddenItems(STORAGE_KEYS);
        hiddenItems = migrateLegacyHiddenItems(menu, hiddenItems, STORAGE_KEYS);
        if (typeof window.tmRefreshMenuEarlyCss === 'function') {
            window.tmRefreshMenuEarlyCss(hiddenItems);
        }
        applyHiddenMenuItems(menu, hiddenItems);
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
