// ==================================================================================================
// Menu Item Hiding System
// ==================================================================================================
// This module provides functionality to hide/show menu items via right-click context menu

(function() {
    'use strict';

    // IMMEDIATE: Hide the menu temporarily until items are processed
    // This prevents flash of items that should be hidden
    (function hideMenuTemporarily() {
        try {
            const hiddenItems = JSON.parse(GM_getValue('tm_hidden_menu_items', '[]'));
            if (hiddenItems.length > 0) {
                // Hide the entire menu temporarily with high opacity transition
                GM_addStyle(`
                    .rnr-b-vmenu.simple.main {
                        opacity: 0 !important;
                        transition: opacity 0.1s ease-in !important;
                    }
                    .rnr-b-vmenu.simple.main.tm-menu-processed {
                        opacity: 1 !important;
                    }
                    /* Also apply immediate hiding for items with data-menu-id */
                    ${hiddenItems.map(item => {
                        const itemId = typeof item === 'string' ? item : item.id;
                        if (/^[a-zA-Z0-9-]+$/.test(itemId)) {
                            return `li[data-menu-id="${itemId}"] { display: none !important; }`;
                        }
                        return '';
                    }).filter(rule => rule !== '').join('\n')}
                `);
                console.log('[MMS] Applied immediate menu hiding CSS for', hiddenItems.length, 'items');
            }
        } catch (e) {
            console.warn('[MMS] Failed to apply immediate menu hiding:', e);
        }
    })();

    function initMenuItemHiding(config) {
        const STORAGE_KEYS = window.STORAGE_KEYS;
        
        // If feature is disabled, make sure menu is visible
        if (!config.hiddenMenuItemsEnabled) {
            setTimeout(() => {
                const menu = document.querySelector('.rnr-b-vmenu.simple.main');
                if (menu) {
                    menu.classList.add('tm-menu-processed');
                }
            }, 100);
            return;
        }
        
        // Wait for the menu to be fully loaded
        setTimeout(() => {
            const menu = document.querySelector('.rnr-b-vmenu.simple.main.initialized');
            if (!menu) {
                console.log('[MMS] Menu not found for hiding feature.');
                // Make sure menu is visible even if not found
                const anyMenu = document.querySelector('.rnr-b-vmenu.simple.main');
                if (anyMenu) {
                    anyMenu.classList.add('tm-menu-processed');
                }
                return;
            }
            
            console.log('[MMS] Initializing menu item hiding...');
            
            let hiddenItems = JSON.parse(GM_getValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, '[]'));
            
            // Clean up old format items with special characters
            // Keep only items with safe IDs (alphanumeric and hyphens only)
            const cleanedItems = hiddenItems.filter(item => {
                const id = typeof item === 'string' ? item : item.id;
                const isSafe = /^[a-zA-Z0-9-]+$/.test(id);
                if (!isSafe) {
                    console.warn('[MMS] Removing unsafe menu item ID during init:', id);
                }
                return isSafe;
            });
            
            if (cleanedItems.length !== hiddenItems.length) {
                console.log('[MMS] Cleaned', hiddenItems.length - cleanedItems.length, 'items with special characters on init');
                hiddenItems = cleanedItems;
                GM_setValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, JSON.stringify(cleanedItems));
            }
            
            // Apply hidden state to menu items
            applyHiddenMenuItems(menu, hiddenItems, STORAGE_KEYS);
            
            // Add right-click context menu to all menu items
            addMenuItemContextMenu(menu, STORAGE_KEYS);
            
            // Add "Manage Hidden Items" menu item to the list itself
            addManageMenuItemToList(menu, STORAGE_KEYS);
            
            // Mark menu as processed so it becomes visible (if it was hidden by immediate CSS)
            menu.classList.add('tm-menu-processed');
            
            console.log('[MMS] Menu item hiding initialized.');
        }, 1000);
    }
    
    function applyHiddenMenuItems(menu, hiddenItems, STORAGE_KEYS) {
        const allItems = menu.querySelectorAll('li');
        
        allItems.forEach((item, index) => {
            const itemText = item.textContent.trim();
            // Sanitize the ID to avoid special characters that break CSS selectors
            const sanitizedText = itemText.substring(0, 20)
                .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
            
            const itemId = `menu-item-${index}-${sanitizedText}`;
            item.setAttribute('data-menu-id', itemId);
            
            // Check if this item should be hidden (handle both string and object formats)
            const shouldHide = hiddenItems.some(hiddenItem => {
                if (typeof hiddenItem === 'string') {
                    return hiddenItem === itemId;
                } else {
                    return hiddenItem.id === itemId;
                }
            });
            
            if (shouldHide) {
                item.style.display = 'none';
                item.classList.add('tm-hidden-menu-item');
                console.log('[MMS] Hiding menu item on load:', itemId);
            }
        });
    }
    
    function addMenuItemContextMenu(menu, STORAGE_KEYS) {
        const allItems = menu.querySelectorAll('li');
        
        allItems.forEach(item => {
            // Skip special items (like our manage button)
            if (item.getAttribute('data-tm-special')) return;
            
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                
                const itemId = item.getAttribute('data-menu-id');
                // Get text from link or item itself
                const link = item.querySelector('a');
                const itemText = link ? link.textContent.trim() : item.textContent.trim();
                
                console.log('[MMS] Right-click on menu item:', itemId, itemText);
                
                if (confirm(`Hide "${itemText}" from the menu?\n\nYou can restore it later from "Manage Hidden Items".`)) {
                    hideMenuItem(itemId, itemText, STORAGE_KEYS);
                    item.style.display = 'none';
                    item.classList.add('tm-hidden-menu-item');
                    
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage(`✓ Menu item hidden`);
                    }
                }
            });
            
            // Add visual indicator on hover
            item.style.cursor = 'pointer';
            item.title = 'Right-click to hide this menu item';
        });
    }
    
    function hideMenuItem(itemId, itemName, STORAGE_KEYS) {
        let hiddenItems = JSON.parse(GM_getValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, '[]'));
        
        // Store as object with id and name for better display
        const existingItem = hiddenItems.find(item => 
            (typeof item === 'string' ? item === itemId : item.id === itemId)
        );
        
        if (!existingItem) {
            hiddenItems.push({ id: itemId, name: itemName });
            GM_setValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, JSON.stringify(hiddenItems));
            console.log('[MMS] Hidden item saved:', itemId, itemName);
        }
    }
    
    function unhideMenuItem(itemId, STORAGE_KEYS) {
        let hiddenItems = JSON.parse(GM_getValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, '[]'));
        // Handle both old format (string) and new format (object)
        hiddenItems = hiddenItems.filter(item => {
            if (typeof item === 'string') {
                return item !== itemId;
            } else {
                return item.id !== itemId;
            }
        });
        GM_setValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, JSON.stringify(hiddenItems));
        
        console.log('[MMS] Unhiding item:', itemId);
        
        // Show the item immediately - use safer element finding method
        const allItems = document.querySelectorAll('[data-menu-id]');
        let item = null;
        for (let el of allItems) {
            if (el.getAttribute('data-menu-id') === itemId) {
                item = el;
                break;
            }
        }
        
        if (item) {
            item.style.display = '';
            item.classList.remove('tm-hidden-menu-item');
            console.log('[MMS] Item restored to DOM:', itemId);
        } else {
            console.warn('[MMS] Could not find item to restore:', itemId);
        }
    }
    
    function showHiddenMenuItemsModal(STORAGE_KEYS) {
        let hiddenItems = JSON.parse(GM_getValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, '[]'));
        
        // CRITICAL: Clean up any items with special characters that break selectors
        const cleanedItems = hiddenItems.filter(item => {
            const id = typeof item === 'string' ? item : item.id;
            // Only keep items with safe characters
            const isSafe = /^[a-zA-Z0-9-]+$/.test(id);
            if (!isSafe) {
                console.warn('[MMS] Removing unsafe menu item ID:', id);
            }
            return isSafe;
        });
        
        if (cleanedItems.length !== hiddenItems.length) {
            console.log('[MMS] Cleaned', hiddenItems.length - cleanedItems.length, 'items with special characters');
            hiddenItems = cleanedItems;
            GM_setValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, JSON.stringify(cleanedItems));
        }
        
        console.log('[MMS] Opening hidden items modal. Found items:', hiddenItems.length);
        
        if (hiddenItems.length === 0) {
            if (window.showPositiveMessage) {
                window.showPositiveMessage('No hidden menu items found. Right-click any menu item to hide it.');
            }
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: tm-fade-in 0.3s ease-out;
        `;
        
        overlay.innerHTML = `
            <div class="tm-modal-content" style="
                max-width: 500px;
                background: #fff;
                padding: 25px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                position: relative;
                z-index: 10001;
            ">
                <div class="tm-modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solidrgb(230, 222, 222);
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                ">
                    <h3 style="margin: 0; flex-grow: 1;">🔒 Hidden Menu Items</h3>
                    <button class="tm-modal-close" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #666;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        z-index: 10002;
                    ">&times;</button>
                </div>
                <div class="tm-modal-body" style="
                    max-height: 60vh;
                    overflow-y: auto;
                    position: relative;
                    z-index: 10001;
                ">
                    <div style="margin-bottom: 16px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-size: 13px;">
                        <strong>💡 Tip:</strong> Right-click any menu item to hide it. Click "Restore" below to unhide items.
                    </div>
                    
                    <div id="tm-hidden-items-list" style="display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 10001;"></div>
                    
                    ${hiddenItems.length > 0 ? `
                        <button id="tm-restore-all-menu-items" style="
                            width: 100%;
                            margin-top: 16px;
                            padding: 10px;
                            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                            position: relative;
                            z-index: 10001;
                        ">Restore All Items</button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        console.log('[MMS] Modal appended to body');
        
        // Close handlers
        const closeBtn = overlay.querySelector('.tm-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('[MMS] Close button clicked');
                overlay.remove();
            });
            console.log('[MMS] Close handler attached');
        }
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                console.log('[MMS] Overlay background clicked');
                overlay.remove();
            }
        });
        
        // Populate hidden items list
        const listContainer = document.getElementById('tm-hidden-items-list');
        
        if (!listContainer) {
            console.error('[MMS] List container not found');
            return;
        }
        
        console.log('[MMS] Populating hidden items:', hiddenItems);
        
        hiddenItems.forEach(hiddenItem => {
            // Handle both old format (string) and new format (object)
            let itemId, itemText;
            
            if (typeof hiddenItem === 'string') {
                // Old format: just the ID
                itemId = hiddenItem;
                
                // Use safer element finding method to avoid querySelector errors with special characters
                const allItems = document.querySelectorAll('[data-menu-id]');
                let item = null;
                for (let el of allItems) {
                    if (el.getAttribute('data-menu-id') === itemId) {
                        item = el;
                        break;
                    }
                }
                
                if (item) {
                    const link = item.querySelector('a');
                    itemText = link ? link.textContent.trim() : item.textContent.trim();
                } else {
                    const parts = itemId.split('-');
                    itemText = parts.length >= 3 ? parts.slice(3).join('-') : itemId;
                }
            } else {
                // New format: object with id and name
                itemId = hiddenItem.id;
                itemText = hiddenItem.name || 'Unknown Item';
            }
            
            // Remove the lock emoji if it somehow got included
            itemText = itemText.replace('🔒', '').replace('Manage Hidden Items', '').trim();
            
            console.log('[MMS] Adding hidden item to modal:', itemId, '->', itemText);
            
            const itemCard = document.createElement('div');
            itemCard.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                position: relative;
                z-index: 10001;
            `;
            
            itemCard.innerHTML = `
                <span style="font-weight: 600; color: #2c3e50; font-size: 13px;">${itemText}</span>
                <button class="tm-restore-menu-item" data-item-id="${itemId}" style="
                    padding: 6px 12px;
                    background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    z-index: 10002;
                    pointer-events: auto;
                ">Restore</button>
            `;
            
            listContainer.appendChild(itemCard);
            console.log('[MMS] Item card added to list');
        });
        
        // Restore individual item
        listContainer.addEventListener('click', (e) => {
            console.log('[MMS] List container clicked. Target:', e.target);
            
            if (e.target.classList.contains('tm-restore-menu-item')) {
                console.log('[MMS] Restore button clicked');
                const itemId = e.target.getAttribute('data-item-id');
                console.log('[MMS] Restoring item:', itemId);
                
                unhideMenuItem(itemId, STORAGE_KEYS);
                
                if (window.showPositiveMessage) {
                    window.showPositiveMessage('✓ Menu item restored');
                }
                
                // Refresh modal
                overlay.remove();
                showHiddenMenuItemsModal(STORAGE_KEYS);
            }
        });
        
        console.log('[MMS] Individual restore handler attached');
        
        // Restore all items
        const restoreAllBtn = document.getElementById('tm-restore-all-menu-items');
        if (restoreAllBtn) {
            console.log('[MMS] Restore all button found');
            restoreAllBtn.addEventListener('click', (e) => {
                console.log('[MMS] Restore all button clicked');
                e.stopPropagation();
                
                // Handle both old format (string) and new format (object)
                hiddenItems.forEach(hiddenItem => {
                    const itemId = typeof hiddenItem === 'string' ? hiddenItem : hiddenItem.id;
                    unhideMenuItem(itemId, STORAGE_KEYS);
                });
                
                if (window.showPositiveMessage) {
                    window.showPositiveMessage('✓ All menu items restored');
                }
                
                overlay.remove();
            });
            console.log('[MMS] Restore all handler attached');
        } else {
            console.warn('[MMS] Restore all button NOT found');
        }
    }
    
    function addManageMenuItemToList(menu, STORAGE_KEYS) {
        // Get the first menu item to copy its styles
        const firstMenuItem = menu.querySelector('li');
        if (!firstMenuItem) return;
        
        // Create a separator (optional, for visual clarity)
        const separator = document.createElement('li');
        separator.setAttribute('data-tm-special', 'true');
        separator.style.cssText = `
            height: 1px;
            background: rgba(0,0,0,0.1);
            margin: 4px 0;
            pointer-events: none;
        `;
        
        // Create the manage menu item
        const manageItem = document.createElement('li');
        
        // Copy the computed styles from the first menu item
        const computedStyle = window.getComputedStyle(firstMenuItem);
        
        // Apply similar styling
        manageItem.innerHTML = `
            <a href="#" style="
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                color: inherit;
            ">
                <span style="font-size: 14px;">🔒</span>
                <span>Manage Hidden Items</span>
            </a>
        `;
        
        // Copy key styles from existing menu items
        manageItem.style.cssText = `
            list-style: none;
            padding: ${computedStyle.padding};
            margin: ${computedStyle.margin};
            background: ${computedStyle.background};
            border: ${computedStyle.border};
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        // Add hover effect matching the existing menu items
        manageItem.addEventListener('mouseenter', () => {
            manageItem.style.background = computedStyle.background || '#f0f0f0';
        });
        
        manageItem.addEventListener('mouseleave', () => {
            manageItem.style.background = '';
        });
        
        // Click handler
        manageItem.addEventListener('click', (e) => {
            e.preventDefault();
            showHiddenMenuItemsModal(STORAGE_KEYS);
        });
        
        // Prevent right-click menu on this special item
        manageItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Mark it so it doesn't get the hide context menu
        manageItem.setAttribute('data-tm-special', 'true');
        manageItem.title = 'Click to manage hidden menu items';
        
        // Add separator and manage item to the end of the menu
        menu.appendChild(separator);
        menu.appendChild(manageItem);
    }

    // Export to global scope
    window.initMenuItemHiding = initMenuItemHiding;

})();

