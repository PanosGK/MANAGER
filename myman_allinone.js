(function() {
    'use strict';

    // Hide the body initially to prevent Flash of Unstyled Content (FOUC).
    // It will be made visible at the end of the 'load' event listener.
    // Skip on the login page so the native form is immediately visible.
    if (!window.location.pathname.includes('login.php')) {
        GM_addStyle('body { visibility: hidden; opacity: 0; transition: opacity 0.3s ease-in; }');
    }
    
    // IMMEDIATE: Hide print buttons on service_edit.php pages
    // This runs immediately, before any other code
    (function hidePrintButtonsImmediate() {
        const currentPathname = window.location.pathname;
        if (currentPathname.includes('service_edit.php')) {
            // Add CSS immediately
            GM_addStyle(`
                .tm-print-page-btn,
                a.tm-print-page-btn,
                .rnr-button.tm-print-page-btn,
                .rnr-button.main.tm-print-page-btn,
                button.tm-print-page-btn,
                a.rnr-button.tm-print-page-btn,
                a.rnr-button.main.tm-print-page-btn,
                .rnr-b-editbuttons a.tm-print-page-btn,
                .rnr-b-editbuttons .tm-print-page-btn,
                a[class*="print"],
                button[class*="print"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    left: -9999px !important;
                }
            `);
            
            // Function to remove print buttons
            function removePrintButtons() {
                const allElements = document.querySelectorAll('a, button, .rnr-button');
                allElements.forEach(el => {
                    const hasPrintClass = el.classList && (el.classList.contains('tm-print-page-btn') || el.classList.contains('rnr-b-print'));
                    const hasPrintOnclick = el.onclick && el.onclick.toString().toLowerCase().includes('print');
                    const hasPrintHref = el.href && el.href.toLowerCase().includes('print');
                    const btnText = (el.textContent || el.innerText || '').toLowerCase();
                    const hasPrintText = btnText.includes('εκτύπωση') || btnText.includes('print') || btnText.includes('ετύπωση');
                    
                    if (hasPrintClass || hasPrintOnclick || hasPrintHref || hasPrintText) {
                        try {
                            el.remove();
                        } catch (e) {
                            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important; left: -9999px !important;';
                        }
                    }
                });
            }
            
            // Run immediately and repeatedly
            if (document.body) {
                removePrintButtons();
            }
            
            // Run on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', removePrintButtons);
            } else {
                removePrintButtons();
            }
            
            // Run on window load
            window.addEventListener('load', removePrintButtons);
            
            // Continuous monitoring
            const interval = setInterval(removePrintButtons, 50);
            
            // MutationObserver for immediate removal
            if (document.body) {
                const observer = new MutationObserver(removePrintButtons);
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            }
        }
    })();

    // ===================================================================
    // === FUN FEATURE: LEVEL UP SYSTEM
    // ===================================================================
    // Note: The following gamification functions are loaded from myman_gamification.js:
    // - getXpForLevel, triggerLevelUpAnimation, grantXp, grantCoins, updateCoinBalanceUI, trackDailyStat
    // - They should not be redefined here to avoid conflicts.

    // Note: Daily Bounties functions (generateDailyQuests, updateQuestProgress, showQuestsModal, populateQuestsModal) are now in myman_gamification.js
    
    // ===================================================================
    // === 0. CONFIGURATION & SETTINGS
    // ===================================================================

    const DEFAULTS = {
        scriptEnabled: true, // Master toggle for all script functions
        refreshIntervalMinutes: 7,
        autoRefreshEnabled: true,
        debugEnabled: false,
        customLoginPageEnabled: true,
        workingHoursStart: 9,
        workingHoursEnd: 21,
        workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
        searchFeatureEnabled: true,
        // New config for themes
        equippedTheme: 'default',
        searchMaxHistory: 10,
        quickSearchEnabled: true,
        quickSearchWidgetOnRepairPage: true, // This was the new setting
        quickSearchButtons: [
            { label: 'LCD', term: 'LCD' },
            { label: 'Dock', term: 'DOCK' },
            { label: 'Battery', term: 'BATTERY' },
            { label: 'Back Cover', term: 'Back Cover' },
        ],
        scratchpadEnabled: true,
        scrollToTopEnabled: true,
        technicianStatsEnabled: true,
        customerHistoryEnabled: true,
        dashboardWidgetEnabled: true,
        levelUpSystemEnabled: true,
        interactiveMascotEnabled: true,
        confettiEnabled: true,
        mascotRoamingSpeed: 100,
        automatedPartsSearchEnabled: true,
        // New supercharged features
        randomEventsEnabled: true,
        smartTemplatesEnabled: true,
        personalDashboardEnabled: true,
        statusTrackingEnabled: true,
        bossBattlesEnabled: true,
        shopEnabled: true,
        achievementsEnabled: true,
        // Menu item visibility
        hiddenMenuItemsEnabled: true,
        // Recent Repairs & Age Indicator
        recentRepairsEnabled: true,
        repairAgeIndicatorEnabled: true,
        recentRepairsMaxItems: 5,
        // Weather Widget
        weatherWidgetEnabled: true,
        phoneCatalogEnabled: true,
        orderHistoryEnabled: true,
        eodChecklistEnabled: true,
        autoUpdateCheckEnabled: true,
        // Price dropdown options for repair page
        priceOptions: [
            { label: 'Καθαρισμός', value: 35, action: 'add', condition: 'default' },
            { label: 'Καθαρισμός (PS5)', value: 85, action: 'add', condition: 'ps5' },
            { label: 'Μεταφορά', value: 10, action: 'add', condition: 'default' },
            { label: 'Εγγύηση', value: 0.01, action: 'replace', condition: 'default' }
        ],
    };
    // Default theme colors are now derived from the UI_THEMES object from the @require'd script
    DEFAULTS.defaultThemeColors = UI_THEMES.default.colors;
    window.DEFAULTS = DEFAULTS;

    // Helper function to convert hex color to RGB values
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function applyTheme(themeId) {
        // Remove any existing style attribute stylesheet
        const existingStyle = document.getElementById('tm-page-theme-styles');
        if (existingStyle) existingStyle.remove();

        const theme = UI_THEMES[themeId] || UI_THEMES['default'];
        if (config?.debugEnabled) {
        console.log(`[MMS] Applying theme: ${theme.name}`);
        }
        for (const [variable, color] of Object.entries(theme.colors)) {
            document.documentElement.style.setProperty(variable, color);
            
            // If this is the primary color, also set the RGB version for scrollbars
            if (variable === '--tm-primary-color') {
                const rgb = hexToRgb(color);
                if (rgb) {
                    document.documentElement.style.setProperty('--tm-primary-color-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
                }
            }
        }
        GM_setValue(STORAGE_KEYS.EQUIPPED_THEME, themeId);
        config.equippedTheme = themeId;

        // Inject page-specific styles if they exist for the theme
        if (theme.pageStyles) {
            const styleEl = document.createElement('style');
            styleEl.id = 'tm-page-theme-styles';
            styleEl.innerHTML = theme.pageStyles;
            document.head.appendChild(styleEl);
        }
    }
    
    // Make applyTheme globally accessible for external scripts
    window.applyTheme = applyTheme;

    // The global config object. It will be populated by loadSettings().
    let config = {};
    // Make config globally accessible for external scripts
    if (!('config' in window)) {
        Object.defineProperty(window, 'config', {
            get: () => config,
            set: (value) => { config = value; },
            configurable: true  // Allow redefinition if script runs again
        });
    } else {
        // If already exists, just update it
        config = window.config || {};
    }

    // ===================================================================
    // === SETTINGS LOADER FUNCTION
    // ===================================================================
    
    /**
     * Loads all settings from GM storage and populates the global config object.
     * This function matches the exact storage keys used by saveSettings().
     */
    function loadSettings() {
        // Iterate through all default settings and load them from storage
        for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
            // Map settings to their corresponding storage keys exactly as saveSettings() uses them
            let storageKey;
            
            switch (key) {
                // Settings that use STORAGE_KEYS constants
                case 'scriptEnabled':
                    storageKey = STORAGE_KEYS.SCRIPT_ENABLED;
                    break;
                case 'equippedTheme':
                    storageKey = STORAGE_KEYS.EQUIPPED_THEME;
                    break;
                case 'userLevel':
                    storageKey = STORAGE_KEYS.USER_LEVEL;
                    break;
                case 'userXp':
                    storageKey = STORAGE_KEYS.USER_XP;
                    break;
                case 'userCoins':
                    storageKey = STORAGE_KEYS.USER_COINS;
                    break;
                case 'userTitle':
                    storageKey = STORAGE_KEYS.USER_TITLE;
                    break;
                
                // Settings that use special storage keys
                case 'workingDays':
                    storageKey = 'workingDays';
                    break;
                case 'quickSearchButtons':
                    storageKey = 'quickSearchButtons';
                    break;
                
                // Most settings use their direct camelCase names as storage keys
                default:
                    storageKey = key;
                    break;
            }
            
            // Load the setting from storage or use the default value
            let loadedValue = GM_getValue(storageKey, defaultValue);
            
            // Parse JSON strings for array/object settings
            if (key === 'workingDays' || key === 'quickSearchButtons' || key === 'priceOptions') {
                try {
                    if (typeof loadedValue === 'string') {
                        loadedValue = JSON.parse(loadedValue);
                    }
                } catch (e) {
                    console.warn(`[MMS] Failed to parse JSON for ${key}, using default:`, e);
                    loadedValue = defaultValue;
                }
            }
            
            config[key] = loadedValue;
        }
        
        if (config.debugEnabled) {
            console.log('[MMS] Settings loaded successfully', config);
            console.log('[MMS] Search settings debug:', {
                searchFeatureEnabled: config.searchFeatureEnabled,
                searchMaxHistory: config.searchMaxHistory,
                quickSearchEnabled: config.quickSearchEnabled
            });
        }
    }


    /**
     * Finds the primary navigable link within a table row.
     * Used by multiple features to get the detail page URL for an item in a list.
     * @param {HTMLTableRowElement} row The table row element to search within.
     * @param {string} pageBaseUrl The base URL of the page, used to resolve relative links.
     * @returns {string|null} The absolute URL of the order link, or null if not found.
     */
    function findOrderLink(row, pageBaseUrl) {
        // Method 1: Check for a 'data-href' on the row itself OR a child TD. This is the most common pattern for this framework.
        let href = row.dataset.href;
        if (!href) {
            const tdWithHref = row.querySelector('td[data-href]');
            if (tdWithHref && tdWithHref.dataset.href) {
                href = tdWithHref.dataset.href;
            }
        }
        if (href && !href.startsWith('javascript:')) {
            console.log('[MMS] Link finder: Success with data-href attribute.');
            return new URL(href, pageBaseUrl).href;
        }

        // Method 2: Find any plausible link inside the row as a fallback.
        const anyLink = row.querySelector('a[href*="editid1="], a[href*="viewid1="], a[href*="edit"], a[href*="view"]');
        if (anyLink && anyLink.getAttribute('href')) {
            href = anyLink.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                 console.log('[MMS] Link finder: Success with generic fallback link.');
                 return anyLink.href;
            }
        }

        // If all methods fail, return null. The calling function should handle this.
        return null;
    }
    
    // Make findOrderLink globally accessible for external scripts
    window.findOrderLink = findOrderLink;

    // ===================================================================
    // === 3. FEATURE: AUTO-REFRESH
    // ===================================================================
    function initRefreshFeature(parentContainer) {
        if (!config.autoRefreshEnabled) {
            console.log('[MMS] Auto-refresh is disabled in settings.');
            return;
        }

        // --- Configuration ---
        const REFRESH_INTERVAL_MINUTES = config.refreshIntervalMinutes;
        const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_MINUTES * 60 * 1000;

        let countdownInterval = null;

        function isRefreshBlocked() {
            return typeof window.isMmsNotificationActive === 'function' && window.isMmsNotificationActive();
        }

        // --- UI Creation - Circular Countdown Design ---
        function createTimerUI() {
            const container = document.createElement('div');
            container.id = 'tm-refresh-timer-container';
            
            // Create SVG circle with countdown inside
            container.innerHTML = `
                <svg width="34" height="34" viewBox="0 0 50 50" class="tm-refresh-circle">
                    <circle cx="25" cy="25" r="20" class="tm-refresh-circle-bg"/>
                    <circle cx="25" cy="25" r="20" class="tm-refresh-circle-progress"/>
                </svg>
                <div class="tm-refresh-time-text">
                    <span id="tm-refresh-countdown-text">--:--</span>
                </div>
            `;

            parentContainer.appendChild(container);

            // Cancel on click
            container.addEventListener('click', (e) => {
                if (confirm('Cancel auto-refresh?')) {
                    if (countdownInterval) clearInterval(countdownInterval);
                    countdownInterval = null;
                    container.style.opacity = '0.5';
                    container.querySelector('#tm-refresh-countdown-text').textContent = '✓';
                    container.title = 'Auto-refresh cancelled';
                    console.log('Auto-refresh cancelled by user.');
                }
            });

            const textSpan = document.getElementById('tm-refresh-countdown-text');
            const progressCircle = container.querySelector('.tm-refresh-circle-progress');
            const circumference = 2 * Math.PI * 20; // 2πr where r=20
            
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = 0;

            if (isWorkingHours()) {
                let timeLeft = REFRESH_INTERVAL_MS;
                const totalTime = REFRESH_INTERVAL_MS;
                
                countdownInterval = setInterval(() => {
                    const blocked = isRefreshBlocked();

                    if (!blocked) {
                        timeLeft -= 1000;
                        if (timeLeft <= 0) {
                            clearInterval(countdownInterval);
                            countdownInterval = null;
                            console.log('Refreshing page now...');
                            window.location.reload();
                            return;
                        }
                    } else {
                        container.title = 'Auto-refresh paused (notification showing)';
                    }

                    // Use smart time formatting if available
                    const formattedTime = (typeof window.formatTimeRemaining === 'function') 
                        ? window.formatTimeRemaining(timeLeft)
                        : `${Math.floor((timeLeft / 1000 / 60) % 60)}:${Math.floor((timeLeft / 1000) % 60).toString().padStart(2, '0')}`;
                    
                    textSpan.textContent = blocked ? '⏸' : formattedTime;
                    
                    // Update circle progress
                    const progress = 1 - (timeLeft / totalTime);
                    const offset = circumference * progress;
                    progressCircle.style.strokeDashoffset = offset;
                    
                    // Change color as time runs out
                    if (!blocked && timeLeft < 60000) { // Last minute
                        progressCircle.style.stroke = '#ef4444';
                        container.style.animation = 'tmPulse 1s ease infinite';
                    } else if (!blocked && timeLeft < 180000) { // Last 3 minutes
                        progressCircle.style.stroke = '#f59e0b';
                        container.style.animation = '';
                    } else if (blocked) {
                        container.style.animation = '';
                    }
                    
                    if (!blocked) {
                        container.title = 'Click to cancel auto-refresh';
                    }
                }, 1000);
                
                container.title = 'Click to cancel auto-refresh';
            } else {
                textSpan.textContent = '⏸';
                container.title = 'Auto-refresh paused (outside working hours)';
                container.style.opacity = '0.6';
            }
        }

        // --- Logic ---
        createTimerUI();
        console.log(`Page will auto-refresh in ${REFRESH_INTERVAL_MINUTES} minutes (pauses during script notifications).`);
    }

    

    // ===================================================================
    // === 4a. FEATURE: NOTIFICATION CENTER
    // ===================================================================
    function createNotification(message, icon = '🔔') {
        let notifications = JSON.parse(GM_getValue(STORAGE_KEYS.USER_NOTIFICATIONS, '[]'));

        const newNotification = {
            id: `notif_${Date.now()}`,
            message: message,
            icon: icon,
            timestamp: Date.now(),
            read: false
        };

        notifications.unshift(newNotification);

        // Keep the list to a reasonable size (e.g., 30)
        if (notifications.length > 30) {
            notifications.length = 30;
        }

        GM_setValue(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifications));
        updateNotificationBadge();
    }
    
    // Make createNotification globally accessible for external scripts
    window.createNotification = createNotification;

    function updateNotificationBadge() {
        const badge = document.getElementById('tm-notification-unread-count');
        if (!badge) return;

        const notifications = JSON.parse(GM_getValue(STORAGE_KEYS.USER_NOTIFICATIONS, '[]'));
        const unreadCount = notifications.filter(n => !n.read).length;

        badge.textContent = unreadCount;
        badge.classList.toggle('visible', unreadCount > 0);
    }
    
    // Make updateNotificationBadge globally accessible for external scripts
    window.updateNotificationBadge = updateNotificationBadge;

    function escapeNotificationText(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getStoredNotifications() {
        try {
            return JSON.parse(GM_getValue(STORAGE_KEYS.USER_NOTIFICATIONS, '[]')) || [];
        } catch {
            return [];
        }
    }

    function buildNotificationListHTML() {
        const notifications = getStoredNotifications();
        if (notifications.length === 0) {
            return '<div id="tm-notification-empty-state">Δεν υπάρχουν ειδοποιήσεις ακόμα.</div>';
        }
        return notifications.map((n, idx) => {
            const idAttr = n.id ? escapeNotificationText(n.id) : '';
            const icon = escapeNotificationText(n.icon || '🔔');
            const msg = escapeNotificationText(n.message || '');
            const when = n.timestamp ? new Date(n.timestamp).toLocaleString('el-GR') : '';
            const unread = n.read ? '' : ' unread';
            return `
                <div class="tm-notification-item${unread}" data-index="${idx}" data-id="${idAttr}" role="button" tabindex="0" title="Κλικ για σήμανση ως αναγνωσμένο">
                    <div class="tm-notification-icon">${icon}</div>
                    <div class="tm-notification-content">
                        <div class="tm-notification-message">${msg}</div>
                        <div class="tm-notification-timestamp">${when}</div>
                    </div>
                </div>`;
        }).join('');
    }

    function closeNotificationPanel() {
        document.getElementById('tm-notification-backdrop')?.remove();
        document.getElementById('tm-notification-panel')?.remove();
        if (window._tmNotificationEscapeHandler) {
            document.removeEventListener('keydown', window._tmNotificationEscapeHandler);
            window._tmNotificationEscapeHandler = null;
        }
    }

    window.closeNotificationPanel = closeNotificationPanel;

    function openNotificationPanel() {
        if (document.getElementById('tm-notification-panel')) return;
        if (!document.getElementById('tm-notification-bell-wrapper')) return;

        const backdrop = document.createElement('div');
        backdrop.id = 'tm-notification-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.style.cssText =
            'position:fixed;inset:0;background:rgba(0,0,0,0.48);z-index:2147482998;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);';

        const panel = document.createElement('div');
        panel.id = 'tm-notification-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'tm-notification-panel-title');

        panel.innerHTML = `
            <div class="tm-notification-header">
                <h4 id="tm-notification-panel-title">Κέντρο ειδοποιήσεων</h4>
                <div class="tm-notification-header-actions">
                    <button type="button" id="tm-mark-all-read-btn" title="Σήμανση όλων ως αναγνωσμένων">Όλα αναγνωσμένα</button>
                    <button type="button" id="tm-clear-all-notif-btn" title="Διαγραφή όλου του ιστορικού">Διαγραφή όλων</button>
                    <button type="button" id="tm-notification-panel-close" title="Κλείσιμο" aria-label="Κλείσιμο">&times;</button>
                </div>
            </div>
            <div id="tm-notification-list">${buildNotificationListHTML()}</div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);

        const listEl = panel.querySelector('#tm-notification-list');

        function refreshNotificationList() {
            if (listEl) listEl.innerHTML = buildNotificationListHTML();
        }

        listEl.addEventListener('click', (e) => {
            const row = e.target.closest('.tm-notification-item');
            if (!row) return;
            const id = row.getAttribute('data-id') || '';
            const idx = parseInt(row.getAttribute('data-index'), 10);
            let notifs = getStoredNotifications();
            let changed = false;
            if (id) {
                const n = notifs.find((x) => x.id === id);
                if (n && !n.read) {
                    n.read = true;
                    changed = true;
                }
            } else if (!Number.isNaN(idx) && notifs[idx] && !notifs[idx].read) {
                notifs[idx].read = true;
                changed = true;
            }
            if (changed) {
                GM_setValue(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifs));
                updateNotificationBadge();
                row.classList.remove('unread');
            }
        });

        panel.querySelector('#tm-mark-all-read-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            let notifs = getStoredNotifications();
            notifs.forEach((n) => {
                n.read = true;
            });
            GM_setValue(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifs));
            updateNotificationBadge();
            refreshNotificationList();
        });

        panel.querySelector('#tm-clear-all-notif-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (!confirm('Διαγραφή όλων των ειδοποιήσεων από το ιστορικό;')) return;
            GM_setValue(STORAGE_KEYS.USER_NOTIFICATIONS, '[]');
            updateNotificationBadge();
            refreshNotificationList();
        });

        panel.querySelector('#tm-notification-panel-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeNotificationPanel();
        });

        backdrop.addEventListener('click', () => closeNotificationPanel());

        panel.addEventListener('click', (e) => e.stopPropagation());

        window._tmNotificationEscapeHandler = (e) => {
            if (e.key === 'Escape') closeNotificationPanel();
        };
        document.addEventListener('keydown', window._tmNotificationEscapeHandler);
    }

    function toggleNotificationPanel() {
        if (document.getElementById('tm-notification-panel')) {
            closeNotificationPanel();
        } else {
            openNotificationPanel();
        }
    }
    
    // Make toggleNotificationPanel globally accessible for external scripts
    window.toggleNotificationPanel = toggleNotificationPanel;
    // ===================================================================
    // === 5. FEATURE: PERSISTENT SCRATCHPAD
    // ===================================================================
    /**
     * Initializes the persistent scratchpad feature, which includes a draggable,
     * resizable text area whose content and geometry are saved.
     */
    function initScratchpadFeature() {
        if (!config.scratchpadEnabled) return;

        const SCRATCHPAD_STORAGE_KEY_IS_MAXIMIZED = 'tm_user_scratchpad_is_maximized'; // For maximized state

        // --- UI Creation ---
        // 1. Create the Scratchpad Panel
        const container = document.createElement('div');
        container.id = 'tm-scratchpad-container';
        container.innerHTML = `
            <div id="tm-scratchpad-tabs-container">
                <div id="tm-scratchpad-tabs"></div>
                <button id="tm-scratchpad-new-tab-btn" title="Νέα Σημείωση">+</button>
            </div>
            <div id="tm-scratchpad-header">
                <span id="tm-scratchpad-title">Σημειωματάριο</span>
                <div id="tm-scratchpad-header-controls">
                    <input type="search" id="tm-scratchpad-search" placeholder="Αναζήτηση...">
                    <span id="tm-scratchpad-last-edited" style="display:none;"></span>
                    <button id="tm-scratchpad-template-btn" title="Εισαγωγή Προτύπου">📋</button>
                    <button id="tm-scratchpad-reminder-btn" title="Ορισμός Υπενθύμισης">🔔</button>
                    <button id="tm-scratchpad-clear-btn" title="Καθαρισμός τρέχουσας σημείωσης">&#128465;</button>
                    <button id="tm-scratchpad-font-size-down" title="Μείωση Μεγέθους Γραμματοσειράς">A-</button>
                    <button id="tm-scratchpad-font-size-up" title="Αύξηση Μεγέθους Γραμματοσειράς">A+</button>
                    <button id="tm-scratchpad-maximize-btn" title="Μεγιστοποίηση/Επαναφορά">&#x26F6;</button>
                    <button id="tm-scratchpad-close-btn" title="Κλείσιμο Σημειωματαρίου">&times;</button>
                </div>
            </div>
            <div id="tm-scratchpad-toolbar">
                <!-- Group 1: Lists -->
                <button data-command="insertUnorderedList" title="Bulleted List">●</button>
                <button data-command="insertOrderedList" title="Numbered List">1.</button>
                <div class="tm-toolbar-separator"></div>
                <!-- Group 2: Block Styles -->
                <button data-command="formatBlock" data-value="h1" title="Heading 1">H1</button>
                <button data-command="formatBlock" data-value="p" title="Paragraph">P</button>
                <div class="tm-toolbar-separator"></div>
                <!-- Group 3: Inline Styles -->
                <button data-command="bold" title="Bold (Ctrl+B)"><b>B</b></button>
                <button data-command="italic" title="Italic (Ctrl+I)"><i>I</i></button>
                <button data-command="underline" title="Underline (Ctrl+U)"><u>U</u></button>
                <button data-command="strikeThrough" title="Strikethrough"><s>S</s></button>
                <div class="tm-toolbar-separator"></div>
                <!-- Group 4: Actions -->
                <button data-command="createLink" title="Insert Link">🔗</button>
                <button data-command="removeFormat" title="Clear Formatting">🧹</button>
            </div>
            <div id="tm-scratchpad-editor" contenteditable="true" spellcheck="false" placeholder="Προσωρινές σημειώσεις..."></div>
            <div id="tm-scratchpad-reminder-popover">
                <h5>Ορισμός Υπενθύμισης</h5>
                <input type="text" id="tm-scratchpad-reminder-text" placeholder="Τι να σας θυμίσω;">
                <input type="datetime-local" id="tm-scratchpad-reminder-datetime">
                <select id="tm-scratchpad-reminder-recurrence">
                    <option value="none">Χωρίς επανάληψη</option>
                    <option value="daily">Καθημερινά</option>
                    <option value="weekly">Εβδομαδιαία</option>
                </select>
                <div id="tm-scratchpad-reminder-controls">
                    <button id="tm-scratchpad-set-reminder-btn">Ορισμός</button>
                    <button id="tm-scratchpad-reminder-1hr-btn">Σε 1 Ώρα</button>
                </div>
                <button id="tm-scratchpad-reminder-cancel-btn">Ακύρωση</button>
                <div id="tm-scratchpad-active-reminder"></div>
            </div>
            <div id="tm-scratchpad-template-popover" class="tm-scratchpad-popover">
                <h5>Εισαγωγή Προτύπου</h5>
                <div id="tm-scratchpad-template-list"></div>
            </div>
        `;
        document.body.appendChild(container);

        // 2. Find or create the main search button container and add the toggle button there.
        let rightSideContainer = document.getElementById('tm-search-container');
        if (!rightSideContainer) {
            // Create the container if it doesn't exist
            rightSideContainer = document.createElement('div');
            rightSideContainer.id = 'tm-search-container';
            document.body.appendChild(rightSideContainer);
        }

        const toggleButton = document.createElement('button');
        toggleButton.id = 'tm-scratchpad-toggle-btn';
        toggleButton.className = 'tm-slide-out-btn';
        toggleButton.textContent = '🗒️ Σημειωματάριο';
        rightSideContainer.appendChild(toggleButton);
        
        // Add Phone Catalog button to side container (only if enabled and not already added)
        if (config.phoneCatalogEnabled && !document.getElementById('tm-phone-catalog-btn')) {
            const phoneCatalogBtn = document.createElement('button');
            phoneCatalogBtn.id = 'tm-phone-catalog-btn';
            phoneCatalogBtn.className = 'tm-slide-out-btn';
            phoneCatalogBtn.textContent = '📱 Phone Catalog';
            phoneCatalogBtn.title = 'Phone Catalog';
            // Clear any inline styles - theme CSS will handle styling
            phoneCatalogBtn.style.background = '';
            phoneCatalogBtn.style.backgroundColor = '';
            phoneCatalogBtn.style.backgroundImage = '';
            phoneCatalogBtn.style.color = '';
            phoneCatalogBtn.addEventListener('click', () => {
                if (typeof window.showPhoneListModal === 'function') {
                    window.showPhoneListModal();
                }
            });
            rightSideContainer.appendChild(phoneCatalogBtn);
        }

        const editor = container.querySelector('#tm-scratchpad-editor');
        const header = container.querySelector('#tm-scratchpad-header');
        const searchInput = container.querySelector('#tm-scratchpad-search');
        const clearBtn = container.querySelector('#tm-scratchpad-clear-btn');
        const fontSizeDownBtn = container.querySelector('#tm-scratchpad-font-size-down');
        const fontSizeUpBtn = container.querySelector('#tm-scratchpad-font-size-up');
        const maximizeBtn = container.querySelector('#tm-scratchpad-maximize-btn');
        const closeBtn = container.querySelector('#tm-scratchpad-close-btn');
        const lastEditedSpan = container.querySelector('#tm-scratchpad-last-edited');
        const reminderBtn = container.querySelector('#tm-scratchpad-reminder-btn');
        const reminderTextInput = container.querySelector('#tm-scratchpad-reminder-text');
        const reminderPopover = container.querySelector('#tm-scratchpad-reminder-popover');
        const reminderDateTimeInput = container.querySelector('#tm-scratchpad-reminder-datetime');
        const reminderRecurrenceSelect = container.querySelector('#tm-scratchpad-reminder-recurrence');
        const setReminderBtn = container.querySelector('#tm-scratchpad-set-reminder-btn');
        const setReminder1hrBtn = container.querySelector('#tm-scratchpad-reminder-1hr-btn');
        const cancelReminderBtn = container.querySelector('#tm-scratchpad-reminder-cancel-btn');
        const activeReminderDiv = container.querySelector('#tm-scratchpad-active-reminder');
        const newTabBtn = container.querySelector('#tm-scratchpad-new-tab-btn');
        const tabsContainer = container.querySelector('#tm-scratchpad-tabs');
        const templateBtn = container.querySelector('#tm-scratchpad-template-btn');
        const templatePopover = container.querySelector('#tm-scratchpad-template-popover');
        const templateList = container.querySelector('#tm-scratchpad-template-list');
        const toolbar = container.querySelector('#tm-scratchpad-toolbar');


        // --- Data Access Functions ---
        function getNotes() {
            const notes = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_NOTES, '[]'));
            if (notes.length === 0) {
                const firstNote = { id: `note_${Date.now()}`, title: 'Note 1', content: '', reminder: null, isPinned: false, lastEdited: null, fontSize: 13 };
                return [firstNote];
            }
            return notes;
        }

        function saveNotes(notes) {
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_NOTES, JSON.stringify(notes));
        }

        function getActiveNoteId() {
            const notes = getNotes();
            let activeId = GM_getValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID);
            // Ensure the active ID is valid
            if (!activeId || !notes.some(n => n.id === activeId)) {
                activeId = notes[0]?.id;
                GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, activeId);
            }
            return activeId;
        }

        function getActiveNote() {
            const notes = getNotes();
            const activeId = getActiveNoteId();
            return notes.find(n => n.id === activeId) || notes[0];
        }

        function updateActiveNote(props) {
            let notes = getNotes();
            const activeId = getActiveNoteId();
            const noteIndex = notes.findIndex(n => n.id === activeId);
            if (noteIndex !== -1) {
                notes[noteIndex] = { ...notes[noteIndex], ...props };
                saveNotes(notes);
            }
        }

        // --- Load saved state ---
        function loadActiveNote(preserveCursor = false) {
            const note = getActiveNote();
            if (!note) return;

            const cursorPos = preserveCursor ? saveCursorPosition() : null;

            editor.innerHTML = note.content || '';
            renderCheckboxesInEditor();
            updateLastEditedDisplay(note.lastEdited);
            editor.style.fontSize = `${note.fontSize || 13}px`;
            highlightSearchTermsInEditor(); // Highlight after loading1
            updateReminderDisplay();
            
            if (preserveCursor && cursorPos !== null) {
                restoreCursorPosition(cursorPos);
            } else if (!preserveCursor) {
                // When switching notes, focus at the end
                editor.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                if (editor.childNodes.length > 0) {
                    range.selectNodeContents(editor);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        // --- Toolbar Logic ---
        toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const command = button.dataset.command;
            const value = button.dataset.value || null;

            e.preventDefault(); // Prevent button from taking focus away from the editor
            editor.focus();

            if (command === 'createLink') {
                const url = prompt('Enter the URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, value);
            }
            debouncedSaveText(); // Save changes after formatting
        });

        // Load visibility state
        const wasOpen = GM_getValue('tm_user_scratchpad_is_open', false);
        if (wasOpen) {
            container.style.display = 'flex';
        }

        // Load saved position and size
        const savedGeometryJSON = GM_getValue('tm_user_scratchpad_geometry');
        if (savedGeometryJSON) {
            try {
                const geo = JSON.parse(savedGeometryJSON);
                if (geo.top && geo.left) {
                    container.style.top = geo.top;
                    container.style.left = geo.left;
                    container.style.bottom = 'auto';
                    container.style.right = 'auto';
                }
                if (geo.width && geo.height) {
                    container.style.width = geo.width;
                    container.style.height = geo.height;
                }
            } catch (e) { console.error('[MMS] Could not parse saved scratchpad geometry.', e); }
        }

        // Load maximized state
        let isMaximized = GM_getValue(SCRATCHPAD_STORAGE_KEY_IS_MAXIMIZED, false);
        let originalGeometry = null;
        if (isMaximized) {
            toggleMaximize(); // Apply maximized state
        }

        // --- Logic ---
        function updateLastEditedDisplay(timestamp) {
            if (timestamp) {
                const date = new Date(timestamp);
                lastEditedSpan.textContent = `Τελευταία επεξεργασία: ${date.toLocaleDateString('el-GR')} ${date.toLocaleTimeString('el-GR')}`;
            } else {
                lastEditedSpan.textContent = '';
            }
        }

        // Show/Hide Logic
        toggleButton.addEventListener('click', () => {
            const willBeVisible = container.style.display === 'none';
            container.style.display = willBeVisible ? 'flex' : 'none';
            GM_setValue('tm_user_scratchpad_is_open', willBeVisible);
        });

        closeBtn.addEventListener('click', () => {
            container.style.display = 'none';
            GM_setValue('tm_user_scratchpad_is_open', false);
        });

        // Save text on input
        const debouncedSaveText = debounce((e) => {
            const content = editor.innerHTML;
            const now = new Date().toISOString();
            updateActiveNote({ content: content, lastEdited: now });
            updateLastEditedDisplay(now);
        }, 500);
        editor.addEventListener('input', debouncedSaveText);
        
        // Make debouncedSaveText globally accessible for sendToScratchpad
        window.debouncedSaveText = debouncedSaveText;

        // --- Helper Functions for Cursor Position ---
        function saveCursorPosition() {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return null;
            
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const caretOffset = preCaretRange.toString().length;
            
            return caretOffset;
        }
        
        function restoreCursorPosition(caretOffset) {
            if (caretOffset === null) return;
            
            const selection = window.getSelection();
            const range = document.createRange();
            
            let charCount = 0;
            let foundPosition = false;
            
            function traverseNodes(node) {
                if (foundPosition) return;
                
                if (node.nodeType === Node.TEXT_NODE) {
                    const nextCharCount = charCount + node.length;
                    if (caretOffset >= charCount && caretOffset <= nextCharCount) {
                        range.setStart(node, caretOffset - charCount);
                        range.collapse(true);
                        foundPosition = true;
                        return;
                    }
                    charCount = nextCharCount;
                } else {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        traverseNodes(node.childNodes[i]);
                        if (foundPosition) return;
                    }
                }
            }
            
            try {
                traverseNodes(editor);
                if (foundPosition) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } catch (e) {
                // If restoration fails, just log and continue
                console.log('[MMS] Could not restore cursor position:', e);
            }
        }

        // --- Markdown Formatting ---
        const applyMarkdownFormatting = debounce(() => {
            // Save cursor position before modifying content
            const cursorPos = saveCursorPosition();
            
            // This is a simple implementation. More complex scenarios might need a proper parser.
            let content = editor.innerHTML;
            // Use more specific regex to avoid matching inside tags. The `>` ensures we are not inside a tag.
            content = content.replace(/&gt; \*\*([^\*]+)\*\*/g, '> <strong>$1</strong>'); // Bold
            content = content.replace(/&gt; \*([^\*]+)\*/g, '> <em>$1</em>');     // Italic
            content = content.replace(/&gt; ~([^~]+)~/g, '> <s>$1</s>');         // Strikethrough

            // For headings, it's safer to use formatBlock if possible, but this is a simple regex way.
            // This is fragile and for demonstration. A real implementation would be more complex.
            if (content.includes('<div># ')) {
                content = content.replace(/<div># (.+?)<\/div>/g, '<h1>$1</h1>');
            }
            if (content.includes('<div>## ')) {
                content = content.replace(/<div>## (.+?)<\/div>/g, '<h2>$1</h2>');
            }

            // Only update if content actually changed to avoid unnecessary cursor resets
            if (content !== editor.innerHTML) {
            editor.innerHTML = content;
                // Restore cursor position after updating content
                restoreCursorPosition(cursorPos);
            }
        }, 700);
        editor.addEventListener('input', applyMarkdownFormatting);

        // --- Tabs Logic ---
        function renderTabs() {
            let notes = getNotes();
            const activeId = getActiveNoteId();
            const query = searchInput.value.toLowerCase().trim();

            // Filter notes based on the search query
            if (query) {
                notes = notes.filter(note => {
                    // To search content, we need to convert the saved HTML to plain text.
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = note.content || '';
                    const textContent = tempDiv.innerText.toLowerCase();

                    return note.title.toLowerCase().includes(query) ||
                           textContent.includes(query);
                });
            }

            // Sort notes so pinned ones are first
            notes.sort((a, b) => {
                if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
                return (a.order || 0) - (b.order || 0);
            });

            tabsContainer.innerHTML = '';
            if (notes.length === 0 && query) {
                tabsContainer.innerHTML = `<span style="padding: 6px 10px; font-size: 12px; color: #666; font-style: italic;">No matches found.</span>`;
            }
            notes.forEach(note => {
                const tab = document.createElement('div');
                tab.className = 'tm-scratchpad-tab';
                tab.dataset.noteId = note.id;
                tab.draggable = true; // Make tabs draggable
                if (note.id === activeId) tab.classList.add('active');
                if (note.isPinned) tab.classList.add('pinned');

                const pinIcon = note.isPinned ? '📌' : '📍';
                tab.innerHTML = `<button class="tm-scratchpad-tab-pin" title="Pin Note">${pinIcon}</button><span class="tm-scratchpad-tab-title" title="Double-click to rename">${note.title}</span><button class="tm-scratchpad-tab-close" title="Delete Note">&times;</button>`;
                tabsContainer.appendChild(tab);
            });
        }

        function handleTabClick(e) {
            const tab = e.target.closest('.tm-scratchpad-tab');
            if (!tab) return;
            if (e.type === 'dblclick') {
                const titleSpan = e.target.closest('.tm-scratchpad-tab-title');
                if (titleSpan) {
                    const noteId = titleSpan.parentElement.dataset.noteId;
                    const newTitle = prompt('Enter new note title:', titleSpan.textContent);
                    if (newTitle && newTitle.trim()) {
                        let notes = getNotes();
                        const note = notes.find(n => n.id === noteId);
                        if (note) {
                            note.title = newTitle.trim();
                            saveNotes(notes);
                            renderTabs();
                        }
                    }
                }
                return; // Stop further processing for dblclick
            }
            const noteId = tab.dataset.noteId;
            if (e.target.classList.contains('tm-scratchpad-tab-pin')) {
                // Pin/Unpin note
                let notes = getNotes();
                const note = notes.find(n => n.id === noteId);
                if (note) {
                    note.isPinned = !note.isPinned;
                    saveNotes(notes);
                    renderTabs();
                }

            } else if (e.target.classList.contains('tm-scratchpad-tab-close')) {
                // Close tab
                if (getNotes().length <= 1) {
                    showPositiveMessage('Cannot close the last note.');
                    return;
                }
                if (confirm(`Are you sure you want to delete "${tab.querySelector('.tm-scratchpad-tab-title').textContent}"?`)) {
                    let notes = getNotes().filter(n => n.id !== noteId);
                    saveNotes(notes);
                    if (getActiveNoteId() === noteId) {
                        GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, notes[0].id);
                    }
                    renderTabs();
                    loadActiveNote();
                }
            } else {
                // Switch tab
                GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, noteId);
                renderTabs();
                loadActiveNote();
            }
        }

        newTabBtn.addEventListener('click', () => {
            let notes = getNotes();
            const newNote = { id: `note_${Date.now()}`, title: `Note ${notes.length + 1}`, content: '', reminder: null, isPinned: false, lastEdited: null, fontSize: 13 };
            notes.push(newNote);
            saveNotes(notes);
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, newNote.id);
            renderTabs();
            loadActiveNote();
        });

        // --- Drag and Drop Tab Reordering ---
        let draggedTab = null;

        tabsContainer.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('tm-scratchpad-tab')) {
                draggedTab = e.target;
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            }
        });

        tabsContainer.addEventListener('dragend', (e) => {
            if (draggedTab) {
                draggedTab.classList.remove('dragging');
                draggedTab = null;

                // Save the new order
                const orderedIds = Array.from(tabsContainer.querySelectorAll('.tm-scratchpad-tab')).map(tab => tab.dataset.noteId);
                let notes = getNotes();
                notes.forEach(note => {
                    const newIndex = orderedIds.indexOf(note.id);
                    note.order = newIndex !== -1 ? newIndex : 999; // Assign order, put missing ones at the end
                });
                saveNotes(notes);
                renderTabs(); // Re-render to solidify the order
            }
        });

        tabsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(tabsContainer, e.clientX);
            if (draggedTab) {
                if (afterElement == null) {
                    tabsContainer.appendChild(draggedTab);
                } else {
                    tabsContainer.insertBefore(draggedTab, afterElement);
                }
            }
        });

        function getDragAfterElement(container, x) {
            const draggableElements = [...container.querySelectorAll('.tm-scratchpad-tab:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2;
                return (offset < 0 && offset > closest.offset) ? { offset: offset, element: child } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
        // --- New, more robust click handling to differentiate single vs. double clicks ---
        let clickTimer = null;
        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tm-scratchpad-tab');
            if (!tab) return;

            // If a timer is already running, it means this is the second click (a double-click)
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;

                // --- Double-click logic ---
                const titleSpan = e.target.closest('.tm-scratchpad-tab-title');
                if (titleSpan) {
                    const noteId = titleSpan.parentElement.dataset.noteId;
                    const currentNote = getNotes().find(n => n.id === noteId);
                    const newTitle = prompt('Enter new note title:', currentNote.title);
                    if (newTitle && newTitle.trim()) {
                        let notes = getNotes();
                        const noteToUpdate = notes.find(n => n.id === noteId);
                        if (noteToUpdate) {
                            noteToUpdate.title = newTitle.trim();
                            saveNotes(notes);
                            renderTabs();
                        }
                    }
                }
            } else {
                // This is the first click. Start a timer.
                clickTimer = setTimeout(() => {
                    clickTimer = null; // Reset timer

                    // --- Single-click logic (runs after 250ms if no second click) ---
                    const noteId = tab.dataset.noteId;
                    if (e.target.classList.contains('tm-scratchpad-tab-pin')) {
                        let notes = getNotes();
                        const note = notes.find(n => n.id === noteId);
                        if (note) { note.isPinned = !note.isPinned; saveNotes(notes); renderTabs(); }
                    } else if (e.target.classList.contains('tm-scratchpad-tab-close')) {
                        if (getNotes().length <= 1) { showPositiveMessage('Cannot close the last note.'); return; }
                        if (confirm(`Are you sure you want to delete "${tab.querySelector('.tm-scratchpad-tab-title').textContent}"?`)) {
                            let notes = getNotes().filter(n => n.id !== noteId);
                            saveNotes(notes);
                            if (getActiveNoteId() === noteId) { GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, notes[0].id); }
                            renderTabs(); loadActiveNote();
                        }
                    } else { // Switch tab
                        GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, noteId);
                        renderTabs(); loadActiveNote();
                    }
                }, 250); // 250ms delay to wait for a potential second click
            }
        });

        // --- Search Logic ---
        searchInput.addEventListener('input', debounce(() => {
            renderTabs();
            // Also re-apply highlighting to the currently visible editor content
            highlightSearchTermsInEditor();
        }, 200));

        // --- Highlighting Logic for Search ---
        function highlightSearchTermsInEditor() {
            const query = searchInput.value.trim();
            
            // Save cursor position before modifications
            const cursorPos = saveCursorPosition();
            
            // First, remove any existing highlights
            editor.querySelectorAll('mark.tm-search-highlight').forEach(mark => {
                mark.outerHTML = mark.innerHTML; // Unwrap the text
            });
            // Normalize the editor's HTML to merge adjacent text nodes
            editor.normalize();

            if (!query) {
                // Restore cursor if we just removed highlights
                if (cursorPos !== null) restoreCursorPosition(cursorPos);
                return;
            }

            const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
            let node;
            const nodesToReplace = [];

            while (node = walker.nextNode()) {
                if (node.parentElement.tagName === 'MARK') continue; // Don't search within highlights
                if (regex.test(node.nodeValue)) {
                    nodesToReplace.push(node);
                }
            }

            nodesToReplace.forEach(textNode => {
                const newHTML = textNode.nodeValue.replace(regex, '<mark class="tm-search-highlight">$1</mark>');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                textNode.parentNode.replaceChild(fragment, textNode);
            });
            
            // Restore cursor position after highlighting
            if (cursorPos !== null) {
                restoreCursorPosition(cursorPos);
            }
        }

        // --- Interactive Checklists Logic ---
        function renderCheckboxesInEditor() {
            // Save cursor position before modifications
            const cursorPos = saveCursorPosition();
            
            // Use a more robust method that doesn't rely on simple string replacement
            const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
            let node;
            const nodesToProcess = [];
            
            // First, collect all nodes that need processing
            while (node = walker.nextNode()) {
                const text = node.nodeValue;
                if (text.includes('[ ]') || text.includes('[x]')) {
                    nodesToProcess.push(node);
                }
            }
            
            // Then process them
            nodesToProcess.forEach(textNode => {
                const text = textNode.nodeValue;
                    const fragment = document.createDocumentFragment();
                const parts = text.split(/(\[ \]|\[x\])/g); // Split by checkbox syntax
                    parts.forEach(part => {
                        if (part === '[ ]') {
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'tm-scratchpad-checkbox';
                            fragment.appendChild(cb);
                        } else if (part === '[x]') {
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'tm-scratchpad-checkbox';
                            cb.checked = true;
                            fragment.appendChild(cb);
                    } else if (part) {
                            fragment.appendChild(document.createTextNode(part));
                        }
                    });
                textNode.parentNode.replaceChild(fragment, textNode);
            });
            
            // Restore cursor position after rendering checkboxes
            if (cursorPos !== null) {
                restoreCursorPosition(cursorPos);
            }
        }

        editor.addEventListener('input', debounce(renderCheckboxesInEditor, 300));

        editor.addEventListener('change', (e) => {
            if (e.target.matches('.tm-scratchpad-checkbox')) {
                // This is tricky because the innerHTML doesn't update on checkbox change.
                // We need to reconstruct the text representation and save it.
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = editor.innerHTML;
                tempDiv.querySelectorAll('.tm-scratchpad-checkbox').forEach(cb => {
                    // Replace the checkbox input with its text equivalent
                    const textNode = document.createTextNode(cb.checked ? '[x]' : '[ ]');
                    cb.parentNode.replaceChild(textNode, cb);
                });
                const newContent = tempDiv.innerHTML;
                updateActiveNote({ content: newContent });
                // The 'input' event listener will re-render the checkboxes visually.
            }
        });

        // --- Template Logic ---
        templateBtn.addEventListener('click', () => {
            const templates = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, '[]'));
            if (templates.length === 0) {
                showPositiveMessage('No templates saved. Add them in the settings.');
                return;
            }
            templateList.innerHTML = templates.map(t => `<button data-content="${encodeURIComponent(t.content)}">${t.title}</button>`).join('');
            templatePopover.style.display = 'block';
        });

        templateList.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const content = decodeURIComponent(e.target.dataset.content);
                document.execCommand('insertHTML', false, `<br>${content}`);
                templatePopover.style.display = 'none';
                renderCheckboxesInEditor();
            }
        });

        // Hide popovers on outside click
        document.addEventListener('click', (e) => {
            if (!templatePopover.contains(e.target) && e.target !== templateBtn) {
                templatePopover.style.display = 'none';
            }
            if (!reminderPopover.contains(e.target) && e.target !== reminderBtn) {
                reminderPopover.style.display = 'none';
            }
        });

        // Font Size Controls
        fontSizeDownBtn.addEventListener('click', () => {
            let note = getActiveNote();
            let newSize = (note.fontSize || 13) - 1;
            if (newSize >= 8) {
                editor.style.fontSize = `${newSize}px`;
                updateActiveNote({ fontSize: newSize });
            }
        });

        fontSizeUpBtn.addEventListener('click', () => {
            let note = getActiveNote();
            let newSize = (note.fontSize || 13) + 1;
            if (newSize <= 30) {
                editor.style.fontSize = `${newSize}px`;
                updateActiveNote({ fontSize: newSize });
            }
        });

        // Maximize/Restore Logic
        function toggleMaximize() {
            if (!isMaximized) {
                // Save current geometry before maximizing
                const rect = container.getBoundingClientRect();
                originalGeometry = {
                    top: container.style.top,
                    left: container.style.left,
                    width: `${rect.width}px`,
                    height: container.style.height
                };
                container.classList.add('maximized');
                container.style.top = '10px';
                container.style.left = '10px';
                container.style.width = 'calc(100vw - 20px)';
                container.style.height = 'calc(100vh - 20px)';
            } else {
                // Restore original geometry
                container.classList.remove('maximized');
                if (originalGeometry) {
                    container.style.top = originalGeometry.top;
                    container.style.left = originalGeometry.left;
                    container.style.width = originalGeometry.width;
                    container.style.height = originalGeometry.height;
                }
            }
            isMaximized = !isMaximized;
            GM_setValue(SCRATCHPAD_STORAGE_KEY_IS_MAXIMIZED, isMaximized);
        }
        maximizeBtn.addEventListener('click', toggleMaximize);

        // --- Reminder Logic ---
        function updateReminderDisplay() {
            const note = getActiveNote();
            const reminder = note?.reminder;
            if (reminder && reminder.dueTime) {
                const dueDate = new Date(reminder.dueTime);
                let recurrenceText = '';
                if (reminder.recurrence === 'daily') recurrenceText = ' (Καθημερινά)';
                if (reminder.recurrence === 'weekly') recurrenceText = ' (Εβδομαδιαία)';

                activeReminderDiv.innerHTML = `
                    <span style="font-weight:normal; display:block; margin-bottom: 3px;">${reminder.text}</span>
                    ${dueDate.toLocaleString('el-GR')}${recurrenceText}
                    <button id="tm-scratchpad-clear-reminder-btn">Καθαρισμός</button>
                `;
                activeReminderDiv.querySelector('#tm-scratchpad-clear-reminder-btn').addEventListener('click', clearReminder);
                reminderBtn.classList.add('active');
            } else {
                activeReminderDiv.innerHTML = '';
                reminderBtn.classList.remove('active');
            }
        }

        function saveReminder(dueTime, recurrence, text) {
            if (!text) {
                alert('Παρακαλώ εισάγετε το κείμενο της υπενθύμισης.');
                return;
            }

            // Request permission if needed
            if (window.Notification && Notification.permission !== "granted") {
                Notification.requestPermission();
            }

            const newReminder = {
                id: `scratchpad_${Date.now()}`,
                text: text,
                dueTime: dueTime,
                recurrence: recurrence,
                createdAt: Date.now()
            };
            updateActiveNote({ reminder: newReminder });
            console.log('[MMS] Reminder set:', newReminder);
            trackDailyStat(config, STORAGE_KEYS, 'setScratchpadReminder'); // Grant XP for setting a reminder
            updateReminderDisplay();
            reminderPopover.style.display = 'none';
        }

        function clearReminder() {
            updateActiveNote({ reminder: null });
            console.log('[MMS] Reminder cleared.');
            updateReminderDisplay();
        }

        reminderBtn.addEventListener('click', () => {
            reminderPopover.style.display = reminderPopover.style.display === 'flex' ? 'none' : 'flex';
            if (reminderPopover.style.display === 'flex') {
                // Pre-fill with existing reminder text if available
                const note = getActiveNote();
                const reminder = note?.reminder;
                reminderTextInput.value = reminder?.text || '';
                if (reminder?.dueTime) {
                    const d = new Date(reminder.dueTime);
                    reminderDateTimeInput.value = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}T${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
                }
            }
        });

        cancelReminderBtn.addEventListener('click', () => {
            reminderPopover.style.display = 'none';
        });

        setReminderBtn.addEventListener('click', () => {
            const dueTime = new Date(reminderDateTimeInput.value).getTime();
            if (isNaN(dueTime) || dueTime < Date.now()) {
                alert('Παρακαλώ επιλέξτε μια μελλοντική ημερομηνία και ώρα.');
                return;
            }
            saveReminder(dueTime, reminderRecurrenceSelect.value, reminderTextInput.value.trim());
        });

        setReminder1hrBtn.addEventListener('click', () => {
            const dueTime = Date.now() + 60 * 60 * 1000;
            saveReminder(dueTime, reminderRecurrenceSelect.value, reminderTextInput.value.trim());
        });

        // --- Dragging and Sizing Logic ---
        let isDragging = false;
        let offsetX, offsetY;

        const saveGeometry = debounce(() => {
            const rect = container.getBoundingClientRect();
            const geometry = {
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`
            };
            GM_setValue('tm_user_scratchpad_geometry', JSON.stringify(geometry));
            console.log('[MMS] Saved scratchpad geometry:', geometry);
        }, 500);

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button') || isMaximized) return;

            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
            container.style.transition = 'none'; // Disable transitions during drag
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (isMaximized) return; // No dragging when maximized
            if (!isDragging) return;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            container.style.left = `${newX}px`;
            container.style.top = `${newY}px`;
            container.style.bottom = 'auto';
            container.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.style.transition = ''; // Re-enable transitions
                document.body.style.userSelect = '';
                if (!isMaximized) saveGeometry();
                saveGeometry();
            }
        });

        // Use a ResizeObserver to save geometry when the user resizes the panel
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                if (container.style.display === 'flex' && !isMaximized) {
                    saveGeometry();
                }
            });
            resizeObserver.observe(container);
        }

        // --- "Send to Scratchpad" Integration ---
        window.sendToScratchpad = (text, sourceUrl = null) => {
            // Get DOM elements directly
            const scratchpadContainer = document.getElementById('tm-scratchpad-container');
            const toggleButton = document.getElementById('tm-scratchpad-toggle-btn');
            const editor = document.getElementById('tm-scratchpad-editor');
            
            // Check if elements exist
            if (!scratchpadContainer || !toggleButton || !editor) {
                console.error('[MMS] Scratchpad elements not found. Make sure scratchpad is initialized.');
                return;
            }
            
            // Ensure scratchpad is open
            if (scratchpadContainer.style.display !== 'flex') {
                toggleButton.click();
            }
            // Add source link if provided
            const sourceLinkHTML = sourceUrl ? `<a href="${sourceUrl}" target="_blank" class="tm-scratchpad-source-link">🔗 Go to Source</a>` : '';

            // Append text to the current note
            const currentContent = editor.innerHTML;
            const newContent = currentContent ? `${currentContent}<br><br>${text} ${sourceLinkHTML}` : `${text} ${sourceLinkHTML}`;
            editor.innerHTML = newContent;
            
            // Save the changes using the global debouncedSaveText function
            if (typeof window.debouncedSaveText === 'function') {
                window.debouncedSaveText();
            }
            
            showPositiveMessage('Sent to Scratchpad!');
        };

        // Add a click listener to the editor to handle links inside contenteditable
        editor.addEventListener('click', (e) => {
            // Check if the clicked element is an anchor tag with an href
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault(); // Prevent the default contenteditable behavior (like placing a cursor)
                window.open(e.target.href, '_blank'); // Manually open the link in a new tab
            }
        });

        // Initial Load
        renderTabs();
        loadActiveNote();
    }

    // ===================================================================
    // === 6. FEATURE: REMINDER SYSTEM
    // ===================================================================
    function initReminderSystem() {
        if (!config?.scratchpadEnabled) return;

        function checkReminders() {
            const now = Date.now();
            let notes = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_NOTES, '[]'));
            let notesUpdated = false;

            notes.forEach(note => {
                const reminder = note.reminder;
                if (!reminder || !reminder.dueTime || reminder.dueTime > now) {
                    return; // No reminder or not due yet
                }

                // --- Reminder is due ---
                console.log(`[MMS] Reminder is due for note "${note.title}":`, reminder);
                showNotification(`Υπενθύμιση: ${note.title}`, reminder.text);
                notesUpdated = true;

                if (reminder.recurrence === 'none') {
                    // One-time reminder, so delete it
                    note.reminder = null;
                } else {
                    // Recurring reminder, calculate next due time
                    let nextDueTime = new Date(reminder.dueTime);
                    if (reminder.recurrence === 'daily') {
                        nextDueTime.setDate(nextDueTime.getDate() + 1);
                    } else if (reminder.recurrence === 'weekly') {
                        nextDueTime.setDate(nextDueTime.getDate() + 7);
                    }

                    // Ensure the next due time is in the future
                    while (nextDueTime.getTime() < now) {
                        if (reminder.recurrence === 'daily') nextDueTime.setDate(nextDueTime.getDate() + 1);
                        if (reminder.recurrence === 'weekly') nextDueTime.setDate(nextDueTime.getDate() + 7);
                    }

                    reminder.dueTime = nextDueTime.getTime();
                    console.log(`[MMS] Rescheduled recurring reminder for "${note.title}" to:`, new Date(reminder.dueTime));
                }
            });

            if (notesUpdated) GM_setValue(STORAGE_KEYS.SCRATCHPAD_NOTES, JSON.stringify(notes));

            // Update the UI if the scratchpad is open
            if (document.getElementById('tm-scratchpad-container')) {
                // This is a bit of a hack, but it's the simplest way to trigger a UI update
                // A more robust solution would use custom events.
                const reminderBtn = document.getElementById('tm-scratchpad-reminder-btn');
                if (reminderBtn) {
                    // Simulate a click to force a re-render of the reminder info
                    reminderBtn.click();
                    reminderBtn.click();
                }
            }
        }

        // Check for reminders every 30 seconds
        setInterval(checkReminders, 30 * 1000);
        if (config?.debugEnabled) {
        console.log('[MMS] Reminder check system initialized.');
        }
    }

    // showTitlesModal function now loaded from myman_gamification.js
    
    /**
     * Adds "Send to Scratchpad" buttons on relevant pages.
     */
    function initScratchpadIntegration() {
        if (!config.scratchpadEnabled) return;

        // On service list page, add button to each row
        if (window.location.pathname.includes('/mymanagerservice/service_list.php')) {
            const gridTable = document.querySelector('table.rnr-b-grid');
            if (!gridTable) return;

            // Get headers once for all rows
            const headers = Array.from(gridTable.querySelectorAll('thead th')).map(th => th.innerText.trim());

            gridTable.querySelectorAll('tbody tr[id^="gridRow"]').forEach(row => {
                const firstCell = row.cells[0];
                if (firstCell) {
                    const button = document.createElement('button');
                    button.innerHTML = '🗒️';
                    button.title = 'Send to Scratchpad';
                    button.className = 'tm-quick-action-btn';
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const orderLink = findOrderLink(row, window.location.href);
                        // Pass config
                        // Create a key-value string from headers and cell content
                        const rowData = [];
                        Array.from(row.cells).forEach((cell, index) => {
                                const header = headers[index];
                                const text = cell.innerText.trim();
                                // Skip the first column (checkbox) and any empty cells
                            if (index === 0 || !text) {
                                return;
                            }
                            // Include header if available, otherwise just use the text
                            if (header) {
                                rowData.push(`${header}: ${text}`);
                            } else {
                                rowData.push(text);
                            }
                        });
                        
                        const rowText = rowData.join('<br>');

                        // Debug: Log what we're sending
                        console.log('[MMS] Sending to scratchpad:', { 
                            rowText, 
                            orderLink, 
                            rowCells: row.cells.length, 
                            headers: headers.length,
                            rowData: rowData
                        });

                        if (typeof window.sendToScratchpad === 'function') {
                            window.sendToScratchpad(rowText, orderLink);
                        } else {
                            console.error('[MMS] sendToScratchpad function not found!');
                        }
                    });
                    firstCell.appendChild(button);
                }
            });
        }
    }
    // ===================================================================
    /**
     * Initializes a "Scroll to Top" button that appears on long pages.
     */
    function initScrollToTopFeature() {
        if (!config.scrollToTopEnabled) return;

        const btn = document.createElement('button');
        btn.id = 'tm-scroll-to-top-btn';
        btn.innerHTML = '&#9650;'; // Up arrow
        btn.title = 'Μετάβαση στην κορυφή';
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const debouncedScrollCheck = debounce(() => {
            if (window.scrollY > 300) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        }, 150);

        window.addEventListener('scroll', debouncedScrollCheck);
    }



    // Note: initOrderTracking is now in myman_gamification.js

    /**
     * Initializes status transfer counter tracking (independent of confetti setting).
     */
    function initStatusCounterTracking() {
        if (config?.statusTrackingEnabled === false) {
            return;
        }
        // Only run on service edit pages where status changes happen
        if (!window.location.pathname.includes('service_edit.php')) {
            return;
        }

        // Check if we need to set status to 40 after login

        console.log('[MMS] 🔍 Initializing status tracking on:', window.location.href);
        
        // Method 1: Monitor status dropdown changes
        const statusSelect = document.querySelector('select[name="iStatusID"]');
        if (statusSelect) {
            let lastStatus = statusSelect.value;
            console.log('[MMS] 📊 Found status dropdown, current value:', lastStatus);
            
            statusSelect.addEventListener('change', (e) => {
                const newStatus = e.target.value;
                console.log(`[MMS] 📊 Status dropdown changed: ${lastStatus} → ${newStatus}`);
                
                if (newStatus !== lastStatus && newStatus) {
                    // Check if a button was clicked recently (within 2 seconds)
                    // If so, normally skip dropdown tracking (button click already tracked it),
                    // EXCEPT for the special case of status 100 on the repair edit page,
                    // where we want to count the final confirmed status 100.
                    const timeSinceButtonClick = Date.now() - (window._tmLastButtonClickTime || 0);
                    const isRepairPage = window.location.pathname.includes('/mymanagerservice/service_edit.php');
                    const isStatus100 = newStatus === '100';
                    if (timeSinceButtonClick < 2000 && !(isRepairPage && isStatus100)) {
                        console.log('[MMS] 📊 Dropdown changed, but skipping (button click tracked it)', {
                            timeSinceButtonClick: timeSinceButtonClick + 'ms'
                        });
                        lastStatus = newStatus; // Update lastStatus to prevent future triggers
                        return; // Skip to avoid double-counting
                    }
                    
                    // Extract repair info
                    const repairInfo = extractRepairInfoSync();
                    repairInfo.status = newStatus;
                    repairInfo.source = 'dropdown';
                    
                    storeStatusTransfer(repairInfo);
                    lastStatus = newStatus;
                }
            });
        }
        
        // Method 2: Monitor form submissions
        // Track last button click to avoid double-counting when button triggers form submit
        let lastButtonClickTime = 0;
        window._tmLastButtonClickTime = 0; // Also store globally for button listeners to set
        
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const statusSelect = form.querySelector('select[name="iStatusID"]');
                if (statusSelect && statusSelect.value) {
                    // Check if a button was clicked within the last 2 seconds.
                    // Normally we skip form submission tracking in that case (button click already tracked it),
                    // but we make an exception for status 100 on the repair edit page so that
                    // the final confirmed completion is counted.
                    const timeSinceButtonClick = Date.now() - (window._tmLastButtonClickTime || 0);
                    const isRepairPage = window.location.pathname.includes('/mymanagerservice/service_edit.php');
                    const isStatus100 = statusSelect.value === '100';
                    if (timeSinceButtonClick < 2000 && !(isRepairPage && isStatus100)) {
                        console.log('[MMS] 📝 Form submitted, but skipping (button click tracked it)', {
                            timeSinceButtonClick: timeSinceButtonClick + 'ms'
                        });
                        return; // Skip to avoid double-counting
                    }
                    
                    console.log('[MMS] 📝 Form submitted with status:', statusSelect.value);
                    const repairInfo = extractRepairInfoSync();
                    repairInfo.status = statusSelect.value;
                    repairInfo.source = 'form_submit';
                    storeStatusTransfer(repairInfo);
                }
            });
        });
        
        // Helper function to extract repair info synchronously
        function extractRepairInfoSync() {
            const repairInfo = {
                repairId: null,
                customerName: null,
                deviceInfo: null,
                timestamp: Date.now(),
                url: window.location.href
            };
            
            // Quick extraction
            const urlMatch = window.location.href.match(/[?&]iServiceID=(\d+)/i) || 
                           window.location.href.match(/service_edit\.php[?&]id=(\d+)/i) ||
                           window.location.href.match(/[?&]id=(\d+)/i);
            if (urlMatch) {
                repairInfo.repairId = urlMatch[1];
            }
            
            const serviceIdInput = document.querySelector('input[name="iServiceID"]') || 
                                  document.querySelector('input[name="id"]');
            if (serviceIdInput && serviceIdInput.value) {
                repairInfo.repairId = serviceIdInput.value.trim();
            }
            
            const customerInput = document.querySelector('input[name*="CustomerName"]') ||
                                 document.querySelector('input[name*="customer"]') ||
                                 document.querySelector('input[name*="ClientName"]');
            if (customerInput && customerInput.value) {
                repairInfo.customerName = customerInput.value.trim();
            }
            
            // Try multiple methods to get device info
            const deviceSelectors = [
                'input[name*="Device"]',
                'input[name*="Model"]',
                'input[name*="DeviceModel"]',
                'input[name*="Product"]',
                'input[name*="Brand"]',
                'input[id*="Device"]',
                'input[id*="Model"]',
                'input[id*="device"]',
                'input[id*="model"]',
                'input[id*="product"]'
            ];
            
            for (const selector of deviceSelectors) {
                try {
                    const input = document.querySelector(selector);
                    if (input && input.value) {
                        const value = input.value.trim();
                        // Skip if value is "oxi", "no", "όχι", or empty
                        if (value && 
                            value.toLowerCase() !== 'oxi' && 
                            value.toLowerCase() !== 'no' && 
                            value.toLowerCase() !== 'όχι' &&
                            value.length > 1) {
                            repairInfo.deviceInfo = value;
                            break;
                        }
                    }
                } catch (e) {
                    // Skip invalid selectors
                }
            }
            
            // If still not found, try to extract from page title (e.g., "KINHTO ANDROID SMARTPHONE A52")
            if (!repairInfo.deviceInfo) {
                const title = document.title || '';
                // Look for device patterns in title
                const deviceMatch = title.match(/(?:SMARTPHONE|PHONE|TABLET|LAPTOP|COMPUTER|ΚΙΝΗΤΟ|ΤΑΠΛΕΤ)[\s\w]+/i);
                if (deviceMatch) {
                    repairInfo.deviceInfo = deviceMatch[0].trim();
                }
            }
            
            // Also try to find device info in table cells by looking for labels
            if (!repairInfo.deviceInfo) {
                const labels = document.querySelectorAll('label, td, th');
                for (const label of labels) {
                    const labelText = label.textContent?.toLowerCase() || '';
                    if (labelText.includes('device') || labelText.includes('model') || 
                        labelText.includes('μηχάνημα') || labelText.includes('μοντέλο') ||
                        labelText.includes('product') || labelText.includes('brand')) {
                        // Try to find input next to this label
                        const nextInput = label.nextElementSibling?.querySelector('input') ||
                                         label.parentElement?.querySelector('input') ||
                                         label.closest('tr')?.querySelector('input');
                        if (nextInput && nextInput.value) {
                            const value = nextInput.value.trim();
                            if (value && 
                                value.toLowerCase() !== 'oxi' && 
                                value.toLowerCase() !== 'no' && 
                                value.toLowerCase() !== 'όχι' &&
                                value.length > 1) {
                                repairInfo.deviceInfo = value;
                                break;
                            }
                        }
                        // Or get text from next cell
                        const nextCell = label.nextElementSibling;
                        if (nextCell && nextCell.textContent) {
                            const value = nextCell.textContent.trim();
                            if (value && 
                                value.toLowerCase() !== 'oxi' && 
                                value.toLowerCase() !== 'no' && 
                                value.toLowerCase() !== 'όχι' &&
                                value.length > 1 &&
                                value.length < 150) {
                                repairInfo.deviceInfo = value;
                                break;
                            }
                        }
                    }
                }
            }
            
            return repairInfo;
        }
        
        // In-memory guard to prevent double-count for same repair/status
        const recentStatusByRepair = new Map();
        
        // Helper function to store status transfer
        function storeStatusTransfer(repairInfo) {
            try {
                // NOTE: Status 100 (ΠΡΟΣ ΠΑΡΑΔΟΣΗ) button_click is counted directly.
                // The button navigates the page immediately so a form_submit / dropdown-change
                // event never fires afterwards.  The 8-second dedup guard below handles any
                // rare double-fire (e.g. if the page also emits a form submit).

                const history = JSON.parse(GM_getValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, '[]'));
                const nowTs = repairInfo.timestamp || Date.now();
                const keyId = repairInfo.repairId || repairInfo.url || 'unknown';
                const lastSeen = recentStatusByRepair.get(keyId);
                if (lastSeen && lastSeen.status === repairInfo.status && (nowTs - lastSeen.timestamp) < 15000) {
                    if (config?.debugEnabled) {
                        console.log(`[MMS] ⚠️ Skipping duplicate (in-memory) status ${repairInfo.status} for repair ${keyId}`);
                    }
                    return;
                }
                
                // Update in-memory guard
                recentStatusByRepair.set(keyId, { status: repairInfo.status, timestamp: nowTs });
                
                // Enhanced deduplication: Check if a similar entry already exists (within last 8 seconds)
                const duplicateWindow = 8000; // 8 seconds (increased from 5 to catch button+form combos)
                const isDuplicate = history.some(entry => {
                    const timeDiff = Math.abs(entry.timestamp - repairInfo.timestamp);
                    const sameRepairId = entry.repairId && repairInfo.repairId && entry.repairId === repairInfo.repairId;
                    const sameStatus = entry.status === repairInfo.status;
                    const sameUrl = entry.url && repairInfo.url && entry.url === repairInfo.url;
                    const withinTimeWindow = timeDiff < duplicateWindow;
                    
                    // Consider it a duplicate if:
                    // 1. Same repair ID and status within time window, OR
                    // 2. Same URL and status within time window (for URL-based tracking), OR
                    // 3. ENHANCED: Same status within time window even if repair ID is missing
                    //    (catches button_click + form_submit double-fire)
                    return withinTimeWindow && 
                           sameStatus && 
                           (sameRepairId || 
                            (sameUrl && (!repairInfo.repairId || !entry.repairId)) ||
                            (!entry.repairId && !repairInfo.repairId && sameUrl));
                });
                
                if (isDuplicate) {
                    console.log(`[MMS] ⚠️ Skipping duplicate status transfer: Status ${repairInfo.status}`, {
                        repairId: repairInfo.repairId || 'not found',
                        source: repairInfo.source || 'unknown'
                    });
                    return; // Don't store duplicate
                }
                
                history.unshift(repairInfo);
                if (history.length > 200) {
                    history.length = 200;
                }
                GM_setValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, JSON.stringify(history));
                console.log(`[MMS] ✅ Stored status transfer (${repairInfo.source}): Status ${repairInfo.status}`, {
                    repairId: repairInfo.repairId || 'not found',
                    customer: repairInfo.customerName || 'not found',
                    device: repairInfo.deviceInfo || 'not found'
                });
                
                // Update counters for all tracked statuses
                const trackedStatuses = ['30', '40', '55', '65', '70', '75', '90', '100', '105'];
                if (trackedStatuses.includes(repairInfo.status)) {
                    const statusKey = `tm_status_${repairInfo.status}_transfers`;
                    const count = GM_getValue(statusKey, 0);
                    GM_setValue(statusKey, count + 1);
                    console.log(`[MMS] 📊 Status ${repairInfo.status} counter: ${count + 1}`);
                }

                // Special rewards for completing a repair (status 100)
                // We award this only when a status 100 transfer is actually stored (after all filters/dedup).
                if (repairInfo.status === '100') {
                    // Always track the daily count — this is a core stat shown in the widget,
                    // independent of whether the level-up / XP system is enabled.
                    console.log('[MMS] 🛠️ REPAIR COMPLETED — calling trackDailyStat(repairsCompleted)');
                    trackDailyStat(config, STORAGE_KEYS, 'repairsCompleted');
                    if (config.interactiveMascotEnabled) {
                        setMascotState(config, 'happy', 5000);
                    }
                }
            } catch (e) {
                console.error('[MMS] ❌ Error storing status transfer:', e);
            }
        }

        // Function to attach listeners to buttons
        const attachStatusListeners = () => {
            // Try multiple selectors to find all possible status buttons
            const selectors = [
                '.rnr-b-editbuttons a.rnr-button',
                '.rnr-b-editbuttons a',
                '.rnr-b-editbuttons button',
                'a.rnr-button',
                'form a[href*="iStatusID"]',
                'form a[href*="statusid"]',
                'a[onclick*="iStatusID"]',
                'a[onclick*="statusid"]',
                'button[onclick*="iStatusID"]',
                'button[onclick*="statusid"]',
                // Look for buttons with status-related text
                'a:contains("ΠΡΟΣ ΕΛΕΓΧΟ"), a:contains("ΠΡΟΣ ΠΑΡΑΔΟΣΗ"), a:contains("ΕΤΟΙΜΟ")',
            ];
            
            let allButtons = new Set();
            
            // Try each selector
            selectors.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    found.forEach(btn => allButtons.add(btn));
                } catch (e) {
                    // Some selectors might not be valid (like :contains), skip them
                }
            });
            
            // Also search by text content for status buttons
            const allLinks = document.querySelectorAll('a, button');
            allLinks.forEach(element => {
                const text = element.innerText?.toUpperCase().trim() || '';
                // Look for status button keywords
                if (text.includes('ΠΡΟΣ ΕΛΕΓΧΟ') || 
                    text.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ') || 
                    text.includes('ΠΡΟΣ ΠΑΡΑΔΟΣ') ||
                    text.includes('ΕΤΟΙΜΟ') ||
                    text.includes('ΠΕΡΙΜΕΝΕΙ') ||
                    text.includes('ΕΝΗΜΕΡΩΣΗ') ||
                    text.includes('ΕΝΗΜΕΡΩΣ') ||
                    (text.includes('ΠΡΟΣ') && (text.includes('ΕΛΕΓΧΟ') || text.includes('ΠΑΡΑΔΟΣΗ')))) {
                    allButtons.add(element);
                }
            });
            
            const buttons = Array.from(allButtons);
            
            if (buttons.length === 0) {
                // Buttons not found yet, retry
                if (config?.debugEnabled) {
                    console.log('[MMS] 🔍 Status tracking: Buttons not found, will retry...');
                }
                return false;
            }
            
            // Log initialization (only in debug mode to reduce clutter)
            if (config?.debugEnabled) {
                console.log(`[MMS] ✅ Status tracking: Found ${buttons.length} buttons`);
            }
            
            buttons.forEach(button => {
                // Skip if already has listener
                if (button.hasAttribute('data-tm-status-tracked')) {
                    return;
                }
                button.setAttribute('data-tm-status-tracked', 'true');
                // Assume any button in this container that isn't "Back to List" or "Print" is a status change.
                const buttonText = button.innerText.toUpperCase().trim();
                
                // Check if it's a navigation button (not a status change)
                const isBackButton = buttonText.includes('BACK TO LIST') || 
                                    buttonText.includes('ΕΚΤΥΠΩΣΗ') ||
                                    buttonText.includes('ΠΙΣΩ ΣΤΗ ΛΙΣΤΑ') ||
                                    buttonText.includes('ΠΙΣΩ ΣΤΗ') ||
                                    buttonText.includes('ΛΙΣΤΑ') ||
                                    buttonText === 'ΠΙΣΩ' ||
                                    buttonText.includes('BACK') ||
                                    buttonText.includes('CANCEL') ||
                                    buttonText.includes('ΑΚΥΡΩΣΗ') ||
                                    buttonText.includes('ΕΠΙΣΤΡΟΦΗ') ||
                                    buttonText.includes('RETURN') ||
                                    buttonText.includes('NAVIGATE') ||
                                    buttonText.includes('ΜΕΝΟΥ') ||
                                    buttonText.includes('MENU');
                
                const isStatusButton = !isBackButton;

                if (isStatusButton) {
                    console.log(`[MMS] 📌 Attaching listener to status button: "${buttonText}"`);
                    button.addEventListener('click', (e) => {
                        // Mark that a button was clicked so form submission listener can skip
                        window._tmLastButtonClickTime = Date.now();
                        
                        console.log(`[MMS] 🖱️ Status button clicked!`, {
                            text: button.innerText || button.textContent,
                            href: button.getAttribute('href'),
                            onclick: button.getAttribute('onclick')
                        });
                        
                        // Get button text (try multiple methods)
                        const buttonText = button.innerText?.trim() || button.textContent?.trim() || button.getAttribute('title') || '';
                        
                        // Double-check this isn't a back/nav button (safety check)
                        const clickedText = buttonText.toUpperCase();
                        if (clickedText.includes('ΠΙΣΩ') || clickedText.includes('ΛΙΣΤΑ') || 
                            clickedText.includes('BACK') || clickedText.includes('CANCEL') ||
                            clickedText.includes('ΑΚΥΡΩΣΗ') || clickedText.includes('ΕΠΙΣΤΡΟΦΗ') ||
                            clickedText.includes('RETURN') || clickedText.includes('NAVIGATE') ||
                            clickedText.includes('ΜΕΝΟΥ') || clickedText.includes('MENU') ||
                            clickedText.includes('ΕΚΤΥΠΩΣΗ')) {
                            return; // Exit early, don't track
                        }
                        
                        // Get text from multiple sources (needed for detection and logging)
                        const buttonTextFull = button.innerText?.trim() || button.textContent?.trim() || button.getAttribute('title') || '';
                        const buttonTextUpper = buttonTextFull.toUpperCase();
                        
                        // Check if button text contains status-related keywords (this is the primary check)
                        const hasStatusKeywords = buttonTextUpper.includes('ΠΡΟΣ ΕΛΕΓΧΟ') || 
                                                 buttonTextUpper.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ') || 
                                                 buttonTextUpper.includes('ΠΡΟΣ ΠΑΡΑΔΟΣ') ||
                                                 buttonTextUpper.includes('ΕΤΟΙΜΟ') ||
                                                 buttonTextUpper.includes('ΠΕΡΙΜΕΝΕΙ') ||
                                                 buttonTextUpper.includes('ΕΝΗΜΕΡΩΣΗ') ||
                                                 buttonTextUpper.includes('ΕΝΗΜΕΡΩΣ') ||
                                                 buttonTextUpper.includes('DELIVER') ||
                                                 buttonTextUpper.includes('COMPLETE') ||
                                                 buttonTextUpper.includes('READY') ||
                                                 buttonTextUpper.includes('WAITING') ||
                                                 // Check if button text starts with a status number (like "40" or "65" or "100")
                                                 /^\s*\d+\s*/.test(buttonTextFull);
                        
                        // Additional check: Make sure this button actually changes status
                        const buttonHref = button.getAttribute('href') || '';
                        const buttonOnclick = button.getAttribute('onclick') || '';
                        
                        // If button has status keywords OR has status-changing href/onclick, it's a status button
                        const hasStatusChange = hasStatusKeywords ||
                                              buttonHref.includes('iStatusID') || 
                                              buttonHref.includes('statusid') ||
                                              buttonOnclick.includes('iStatusID') ||
                                              buttonOnclick.includes('statusid') ||
                                              buttonHref.includes('javascript:') ||
                                              buttonOnclick.includes('submit') ||
                                              buttonOnclick.includes('form') ||
                                              (buttonHref && buttonHref !== '#') ||
                                              (buttonOnclick && buttonOnclick.trim() !== '');
                        
                        if (!hasStatusChange) {
                            console.log('[MMS] ⚠️ Skipping button (no status change detected):', buttonTextFull);
                            return; // Exit early, don't track
                        }
                        
                        console.log('[MMS] ✅ Status button confirmed:', buttonTextFull);
                        
                        // Try multiple methods to detect the target status
                        let targetStatus = null;
                        
                        // Method 0: Extract status number directly from button text (e.g., "40\nΠΡΟΣ ΕΛΕΓΧΟ" -> "40")
                        const statusNumberMatch = buttonTextFull.match(/^\s*(\d+)\s*/);
                        if (statusNumberMatch) {
                            targetStatus = statusNumberMatch[1];
                            console.log(`[MMS] 📊 Extracted status from button text: ${targetStatus}`);
                        }
                        
                        // Method 1: Check button text for known status keywords (most reliable)
                        const buttonTextLower = buttonTextFull.toLowerCase();
                        // buttonTextUpper already declared above
                        
                        // Greek keywords (only if we didn't find a number)
                        if (!targetStatus) {
                            if (buttonTextLower.includes('παραδοση') || buttonTextLower.includes('παραδοσ') || 
                                buttonTextLower.includes('deliver') || buttonTextLower.includes('complete') ||
                                buttonTextUpper.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ')) {
                                targetStatus = '100';
                            } else if (buttonTextLower.includes('ενημερωση') || buttonTextLower.includes('ενημερωσ') ||
                                       buttonTextLower.includes('inform') || buttonTextLower.includes('notify') ||
                                       buttonTextLower.includes('πελατη') || buttonTextLower.includes('πελάτη') ||
                                       buttonTextUpper.includes('ΠΡΟΣ ΕΛΕΓΧΟ') || buttonTextLower.includes('ελεγχο') ||
                                       buttonTextLower.includes('έλεγχο')) {
                                targetStatus = '40';
                            } else if (buttonTextLower.includes('ετοιμο') || buttonTextLower.includes('ετοιμ') ||
                                       buttonTextLower.includes('ready') || buttonTextLower.includes('waiting') ||
                                       buttonTextLower.includes('περιμενει') || buttonTextLower.includes('περιμένει') ||
                                       buttonTextUpper.includes('ΕΤΟΙΜΟ') || buttonTextUpper.includes('ΠΕΡΙΜΕΝΕΙ')) {
                                targetStatus = '65';
                            }
                        }
                        
                        // Method 2: Check the status dropdown value
                        if (!targetStatus) {
                            const statusSelect = document.querySelector('select[name="iStatusID"]');
                            if (statusSelect && statusSelect.value) {
                                targetStatus = statusSelect.value;
                            }
                        }
                        
                        // Method 3: Check the button's href or onclick for status clues
                        if (!targetStatus) {
                            const href = button.getAttribute('href') || '';
                            const onclick = button.getAttribute('onclick') || '';
                            
                            // Look for status patterns in href like "iStatusID=40" or similar
                            const hrefStatusMatch = href.match(/iStatusID[=:](\d+)/i) || onclick.match(/iStatusID[=:](\d+)/i);
                            if (hrefStatusMatch) {
                                targetStatus = hrefStatusMatch[1];
                            }
                        }
                        
                        // Store detected status and button info for later use
                        const statusChangeData = {
                            targetStatus: targetStatus,
                            buttonText: buttonTextFull,
                            timestamp: Date.now()
                        };
                        
                        console.log(`[MMS] 🔘 Status button clicked: "${buttonTextFull}" -> Status ${targetStatus || 'unknown'}`);
                        
                        // CRITICAL: Store data IMMEDIATELY and SYNCHRONOUSLY before page refresh
                        // Extract repair info RIGHT NOW before any navigation happens
                        const repairInfo = {
                            repairId: null,
                            customerName: null,
                            deviceInfo: null,
                            status: targetStatus || 'unknown',
                            timestamp: Date.now(),
                            url: window.location.href,
                            buttonText: buttonTextFull
                        };
                        
                        // Quick extraction - get what we can immediately
                        // Method 1: Repair ID from URL
                        const urlMatch = window.location.href.match(/[?&]iServiceID=(\d+)/i) || 
                                       window.location.href.match(/service_edit\.php[?&]id=(\d+)/i) ||
                                       window.location.href.match(/[?&]id=(\d+)/i);
                        if (urlMatch) {
                            repairInfo.repairId = urlMatch[1];
                        }
                        
                        // Method 2: Quick form field check
                        const serviceIdInput = document.querySelector('input[name="iServiceID"]') || 
                                              document.querySelector('input[name="id"]');
                        if (serviceIdInput && serviceIdInput.value) {
                            repairInfo.repairId = serviceIdInput.value.trim();
                        }
                        
                        // Method 3: Customer name (quick check)
                        const customerInput = document.querySelector('input[name*="CustomerName"]') ||
                                             document.querySelector('input[name*="customer"]') ||
                                             document.querySelector('input[name*="ClientName"]');
                        if (customerInput && customerInput.value) {
                            repairInfo.customerName = customerInput.value.trim();
                        }
                        
                        // Method 4: Device info (quick check with multiple selectors, skip "oxi")
                        const deviceSelectors = [
                            'input[name*="Device"]',
                            'input[name*="Model"]',
                            'input[name*="DeviceModel"]',
                            'input[id*="Device"]',
                            'input[id*="Model"]'
                        ];
                        
                        for (const selector of deviceSelectors) {
                            try {
                                const input = document.querySelector(selector);
                                if (input && input.value) {
                                    const value = input.value.trim();
                                    // Skip if value is "oxi", "no", "όχι", or empty
                                    if (value && 
                                        value.toLowerCase() !== 'oxi' && 
                                        value.toLowerCase() !== 'no' && 
                                        value.toLowerCase() !== 'όχι' &&
                                        value.length > 1) {
                                        repairInfo.deviceInfo = value;
                                        break;
                                    }
                                }
                            } catch (e) {
                                // Skip invalid selectors
                            }
                        }
                        
                        // If still not found, try page title (e.g., "KINHTO ANDROID SMARTPHONE A52")
                        if (!repairInfo.deviceInfo) {
                            const title = document.title || '';
                            const deviceMatch = title.match(/(?:SMARTPHONE|PHONE|TABLET|LAPTOP|COMPUTER|ΚΙΝΗΤΟ|ΤΑΠΛΕΤ)[\s\w]+/i);
                            if (deviceMatch) {
                                repairInfo.deviceInfo = deviceMatch[0].trim();
                            }
                        }
                        
                        // For status 100: a jConfirm popup appears with "Ναι" / "Όχι" buttons.
                        // Only count the repair as complete when the user explicitly clicks "Ναι".
                        if (targetStatus === '100') {
                            console.log('[MMS] ⏳ Status 100 button clicked — waiting for jConfirm "Ναι"');

                            const _onJConfirmClick = (e) => {
                                const btn = e.target.closest('button, a, [role="button"]');
                                if (!btn) return;

                                const btnText = (btn.innerText || btn.textContent || '').trim();
                                const inButtonsBox = !!btn.closest('.buttons');
                                if (!inButtonsBox) return; // ignore unrelated clicks

                                if (btnText === 'Ναι' || btnText.toLowerCase() === 'ναι') {
                                    console.log('[MMS] ✅ jConfirm "Ναι" confirmed — counting repair as completed');
                                    document.removeEventListener('click', _onJConfirmClick, true);
                                    repairInfo.source = 'jconfirm_confirmed';
                                    storeStatusTransfer(repairInfo);
                                } else if (btnText === 'Όχι' || btnText.toLowerCase() === 'όχι') {
                                    console.log('[MMS] ❌ jConfirm "Όχι" — repair NOT counted');
                                    document.removeEventListener('click', _onJConfirmClick, true);
                                }
                            };

                            // Capture phase so we intercept before jConfirm closes the dialog
                            document.addEventListener('click', _onJConfirmClick, true);
                            // Safety cleanup — remove listener if the popup is never interacted with
                            setTimeout(() => document.removeEventListener('click', _onJConfirmClick, true), 30000);

                        } else {
                            // All other statuses: count immediately on button click
                            repairInfo.source = 'button_click';
                            storeStatusTransfer(repairInfo);
                        }

                        // Also set up a confirmation interceptor (only needed for flows that use native confirm, e.g. 90 → 65)
                        // NOTE: Special case - Status 65 is ONLY reached when:
                        // 1. User clicks button to move to status 90
                        // 2. System detects parts are not available
                        // 3. System asks if user wants to move to status 65 instead
                        // We need to detect this and update the stored entry from 90 → 65
                        if (targetStatus === '90') {
                            const originalConfirm = window.confirm;
                            let confirmWasShown = false;
                            
                            // Intercept confirm for this specific click
                            window.confirm = function(message) {
                                confirmWasShown = true;
                                console.log(`[MMS] ⚠️ Confirmation dialog shown: "${message}"`);
                                
                                // Check if this is a status 65 redirect (parts not available)
                                // Detection: Look for status 65 mentioned in dialog, or keywords about parts/waiting
                                const messageLower = message.toLowerCase();
                                const isStatus65Redirect = messageLower.includes('65') || 
                                                           messageLower.includes('αναμον') || // Greek for "waiting"
                                                           messageLower.includes('ανταλλ') || // Greek for "parts"
                                                           messageLower.includes('διαθέσι') || // Greek for "available"
                                                           messageLower.includes('waiting') ||
                                                           messageLower.includes('parts') ||
                                                           (messageLower.includes('status') && messageLower.includes('65'));
                                
                                const userConfirmed = originalConfirm.call(window, message);
                                
                                if (!userConfirmed) {
                                    console.log(`[MMS] ❌ User cancelled confirmation`);
                                    // Remove the entry we just added since user cancelled
                                    try {
                                        const history = JSON.parse(GM_getValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, '[]'));
                                        if (history.length > 0 && history[0].timestamp === repairInfo.timestamp) {
                                            history.shift(); // Remove the first entry (the one we just added)
                                            GM_setValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, JSON.stringify(history));
                                            console.log(`[MMS] 🗑️ Removed cancelled status transfer from history`);
                                            
                                            // Also decrement the status counter
                                            const statusKey = `tm_status_${targetStatus}_transfers`;
                                            const count = GM_getValue(statusKey, 0);
                                            if (count > 0) {
                                                GM_setValue(statusKey, count - 1);
                                                console.log(`[MMS] 📊 Status ${targetStatus} counter decremented: ${count - 1}`);
                                            }
                                        }
                                    } catch (e) {
                                        console.error(`[MMS] ❌ Error removing cancelled transfer:`, e);
                                    }
                                } else {
                                    console.log(`[MMS] ✅ User confirmed - status change will be applied`);
                                    
                                    // If this is a status 65 redirect, update the stored entry
                                    if (isStatus65Redirect && targetStatus === '90') {
                                        console.log(`[MMS] 🔄 Detected status 65 redirect (parts not available)`);
                                        console.log(`[MMS] 📝 Confirmation message was: "${message}"`);
                                        try {
                                            const history = JSON.parse(GM_getValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, '[]'));
                                            
                                            // Update the most recent entry (the status 90 we just stored)
                                            if (history.length > 0 && history[0].timestamp === repairInfo.timestamp) {
                                                history[0].status = '65';
                                                history[0].redirectedFrom = '90';
                                                history[0].redirectReason = 'Parts not available';
                                                GM_setValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, JSON.stringify(history));
                                                console.log(`[MMS] ✅ Updated status transfer: 90 → 65 (parts not available)`);
                                                
                                                // Decrement status 90 counter
                                                const status90Key = 'tm_status_90_transfers';
                                                const count90 = GM_getValue(status90Key, 0);
                                                if (count90 > 0) {
                                                    GM_setValue(status90Key, count90 - 1);
                                                }
                                                
                                                // Increment status 65 counter
                                                const status65Key = 'tm_status_65_transfers';
                                                const count65 = GM_getValue(status65Key, 0);
                                                GM_setValue(status65Key, count65 + 1);
                                                console.log(`[MMS] 📊 Status counters updated: 90=${count90 - 1}, 65=${count65 + 1}`);
                                            }
                                        } catch (e) {
                                            console.error(`[MMS] ❌ Error updating status 65 redirect:`, e);
                                        }
                                    }
                                }
                                
                                // Restore original confirm
                                setTimeout(() => {
                                    window.confirm = originalConfirm;
                                }, 50);
                                
                                return userConfirmed;
                            };
                            
                            // Restore confirm after timeout (in case no dialog appears)
                            setTimeout(() => {
                                if (!confirmWasShown) {
                                    window.confirm = originalConfirm;
                                }
                            }, 1000);
                        }
                        
                        // Also try to enhance the data after page loads (if page doesn't refresh)
                        // But don't wait for this - we already stored the essential data (or will after confirmation)
                        trackStatusChange(statusChangeData);
                        
                        // Function to track the status change (gamification only - history already stored by storeStatusTransfer)
                        function trackStatusChange(data) {
                            // Try to enhance the existing history entry with more info after a delay
                            setTimeout(() => {
                                // Function to extract repair information from the page
                                const extractRepairInfo = () => {
                                    const repairInfo = {
                                        repairId: null,
                                        customerName: null,
                                        deviceInfo: null
                                    };
                                    
                                    // Method 1: Try to get repair ID from URL (most reliable)
                                    const urlMatch = window.location.href.match(/[?&]iServiceID=(\d+)/i) || 
                                                   window.location.href.match(/service_edit\.php[?&]id=(\d+)/i) ||
                                                   window.location.href.match(/[?&]id=(\d+)/i);
                                    if (urlMatch) {
                                        repairInfo.repairId = urlMatch[1];
                                    }
                                    
                                    // Method 2: Try to get repair ID from form fields
                                    if (!repairInfo.repairId) {
                                        const selectors = [
                                            'input[name="iServiceID"]',
                                            'input[name="id"]',
                                            'input[name="serviceId"]',
                                            'input[name="ServiceID"]',
                                            'input[type="hidden"][name*="Service"]',
                                            'input[type="hidden"][name*="ID"]'
                                        ];
                                        for (const selector of selectors) {
                                            const input = document.querySelector(selector);
                                            if (input && input.value) {
                                                repairInfo.repairId = input.value.trim();
                                                break;
                                            }
                                        }
                                    }
                                    
                                    // Method 3: Try to get repair ID from page title or heading
                                    if (!repairInfo.repairId) {
                                        const titleMatch = document.title.match(/#?(\d+)/);
                                        if (titleMatch) {
                                            repairInfo.repairId = titleMatch[1];
                                        }
                                    }
                                    
                                    // Method 4: Try to get customer name from various sources
                                    const customerSelectors = [
                                        'input[name*="CustomerName"]',
                                        'input[name*="customer"]',
                                        'input[name*="ClientName"]',
                                        'input[name*="client"]',
                                        'input[name*="Name"]',
                                        'input[id*="Customer"]',
                                        'input[id*="customer"]',
                                        'input[id*="Client"]',
                                        'input[id*="client"]'
                                    ];
                                    for (const selector of customerSelectors) {
                                        try {
                                            const input = document.querySelector(selector);
                                            if (input && input.value && input.value.trim().length > 0) {
                                                repairInfo.customerName = input.value.trim();
                                                break;
                                            }
                                        } catch (e) {
                                            // Skip invalid selectors
                                        }
                                    }
                                    
                                    // Also try to find customer name in table cells by looking for labels
                                    if (!repairInfo.customerName) {
                                        const labels = document.querySelectorAll('label, td, th');
                                        for (const label of labels) {
                                            const labelText = label.textContent?.toLowerCase() || '';
                                            if (labelText.includes('customer') || labelText.includes('πελάτης') || 
                                                labelText.includes('όνομα') || labelText.includes('client')) {
                                                // Try to find input next to this label
                                                const nextInput = label.nextElementSibling?.querySelector('input') ||
                                                                 label.parentElement?.querySelector('input') ||
                                                                 label.closest('tr')?.querySelector('input');
                                                if (nextInput && nextInput.value && nextInput.value.trim().length > 0) {
                                                    repairInfo.customerName = nextInput.value.trim();
                                                    break;
                                                }
                                                // Or get text from next cell
                                                const nextCell = label.nextElementSibling;
                                                if (nextCell && nextCell.textContent && 
                                                    nextCell.textContent.trim().length > 0 &&
                                                    nextCell.textContent.trim().length < 100) {
                                                    repairInfo.customerName = nextCell.textContent.trim();
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Method 5: Try to get device info
                                    const deviceSelectors = [
                                        'input[name*="Device"]',
                                        'input[name*="Model"]',
                                        'input[name*="DeviceModel"]',
                                        'input[name*="Product"]',
                                        'input[name*="Brand"]',
                                        'input[id*="Device"]',
                                        'input[id*="Model"]',
                                        'input[id*="device"]',
                                        'input[id*="model"]'
                                    ];
                                    for (const selector of deviceSelectors) {
                                        try {
                                            const input = document.querySelector(selector);
                                            if (input && input.value) {
                                                const value = input.value.trim();
                                                // Skip if value is "oxi", "no", "όχι", or empty
                                                if (value && 
                                                    value.toLowerCase() !== 'oxi' && 
                                                    value.toLowerCase() !== 'no' && 
                                                    value.toLowerCase() !== 'όχι' &&
                                                    value.length > 1) {
                                                    repairInfo.deviceInfo = value;
                                                    break;
                                                }
                                            }
                                        } catch (e) {
                                            // Skip invalid selectors
                                        }
                                    }
                                    
                                    // If still not found, try page title
                                    if (!repairInfo.deviceInfo) {
                                        const title = document.title || '';
                                        const deviceMatch = title.match(/(?:SMARTPHONE|PHONE|TABLET|LAPTOP|COMPUTER|ΚΙΝΗΤΟ|ΤΑΠΛΕΤ)[\s\w]+/i);
                                        if (deviceMatch) {
                                            repairInfo.deviceInfo = deviceMatch[0].trim();
                                        }
                                    }
                                    
                                    // Also try to find device info in table cells by looking for labels
                                    if (!repairInfo.deviceInfo) {
                                        const labels = document.querySelectorAll('label, td, th');
                                        for (const label of labels) {
                                            const labelText = label.textContent?.toLowerCase() || '';
                                            if (labelText.includes('device') || labelText.includes('model') || 
                                                labelText.includes('μηχάνημα') || labelText.includes('μοντέλο') ||
                                                labelText.includes('product') || labelText.includes('brand')) {
                                                // Try to find input next to this label
                                                const nextInput = label.nextElementSibling?.querySelector('input') ||
                                                                 label.parentElement?.querySelector('input') ||
                                                                 label.closest('tr')?.querySelector('input');
                                                if (nextInput && nextInput.value && nextInput.value.trim().length > 0) {
                                                    repairInfo.deviceInfo = nextInput.value.trim();
                                                    break;
                                                }
                                                // Or get text from next cell
                                                const nextCell = label.nextElementSibling;
                                                if (nextCell && nextCell.textContent && 
                                                    nextCell.textContent.trim().length > 0 &&
                                                    nextCell.textContent.trim().length < 150) {
                                                    repairInfo.deviceInfo = nextCell.textContent.trim();
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    
                                    return repairInfo;
                                };
                                
                                const enhancedInfo = extractRepairInfo();
                                if (enhancedInfo.repairId || enhancedInfo.customerName || enhancedInfo.deviceInfo) {
                                    // Update the most recent entry if we found more info
                                    const updatedHistory = JSON.parse(GM_getValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, '[]'));
                                    if (updatedHistory.length > 0) {
                                        const latest = updatedHistory[0];
                                        const timeDiff = Math.abs(Date.now() - latest.timestamp);
                                        const enhancementWindow = 5000; // 5 seconds
                                        
                                        // Match by status and recency (within enhancement window) to ensure we're updating the right entry
                                        if (latest.status === data.targetStatus && timeDiff < enhancementWindow) {
                                            // Same entry, enhance it
                                            let wasEnhanced = false;
                                            if (enhancedInfo.repairId && !latest.repairId) {
                                                latest.repairId = enhancedInfo.repairId;
                                                wasEnhanced = true;
                                            }
                                            if (enhancedInfo.customerName && !latest.customerName) {
                                                latest.customerName = enhancedInfo.customerName;
                                                wasEnhanced = true;
                                            }
                                            if (enhancedInfo.deviceInfo && !latest.deviceInfo) {
                                                latest.deviceInfo = enhancedInfo.deviceInfo;
                                                wasEnhanced = true;
                                            }
                                            
                                            if (wasEnhanced) {
                                                GM_setValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, JSON.stringify(updatedHistory));
                                                
                                                if (config?.debugEnabled) {
                                                    console.log(`[MMS] 📝 Enhanced repair history:`, latest);
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 500); // Longer delay to let page fully update
                            
                            // A small delay to let the page's own logic run before we track gamification.
                            setTimeout(() => {
                                // Always track status changes, even if we couldn't determine the exact status
                                if (config?.levelUpSystemEnabled) {
                                    trackDailyStat(config, STORAGE_KEYS, 'statusChanges'); // Grant XP for any status change.
                                    if (config?.debugEnabled) {
                                        const dailyStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
                                        console.log(`[MMS] 📊 Status change tracked (${data.targetStatus || 'unknown'}) - Daily: ${dailyStats.statusChanges || 0}`);
                                    }
                                }
                            }, 500);
                        }
                    });
                }
            });
            
            return true;
        };
        
        // Try to attach immediately
        if (!attachStatusListeners()) {
            // Retry with delays if buttons aren't ready
            let attempts = 0;
            const maxAttempts = 10;
            const retryInterval = setInterval(() => {
                attempts++;
                if (attachStatusListeners() || attempts >= maxAttempts) {
                    clearInterval(retryInterval);
                    if (attempts >= maxAttempts && config?.debugEnabled) {
                        console.warn('[MMS] Status tracking: Could not find buttons after', maxAttempts, 'attempts');
                    }
                }
            }, 500);
        }
    }

    /**
     * Injects a red "40" button into .rnr-buttons-left when the repair is in status 65 or 100,
     * giving a quick shortcut to move the repair back to status 40 (ΠΡΟΣ ΕΛΕΓΧΟ).
     */
    function injectReturnTo40Button() {
        if (!window.location.pathname.includes('service_edit.php')) return;

        function getPageRepairStatus() {
            // Method 1: statusbadge that is NOT inside the buttons area (that's the current status display)
            const allBadges = document.querySelectorAll('.statusbadge');
            for (const badge of allBadges) {
                if (badge.closest('.rnr-buttons-left') || badge.closest('.rnr-b-editbuttons')) continue;
                const m = (badge.textContent || badge.innerText || '').match(/^\s*(\d+)/);
                if (m) return m[1];
            }
            // Method 2: the actual select name used by mymanager
            const selectSelectors = [
                'select[name="value_ccc_iStatusID_1"]',
                'select[id="value_ccc_iStatusID_1"]',
                'select[name="iStatusID"]',
                'select[name*="StatusID"]',
                'select[id*="StatusID"]'
            ];
            for (const sel of selectSelectors) {
                const el = document.querySelector(sel);
                if (el && el.value) return el.value;
            }
            return null;
        }

        function getStatusSelect() {
            const selectSelectors = [
                'select[name="value_ccc_iStatusID_1"]',
                'select[id="value_ccc_iStatusID_1"]',
                'select[name="iStatusID"]',
                'select[name*="StatusID"]',
                'select[id*="StatusID"]'
            ];
            for (const sel of selectSelectors) {
                const el = document.querySelector(sel);
                if (el) return el;
            }
            return null;
        }

        const tryInject = (retries = 12) => {
            if (document.getElementById('tm-back-to-40-btn')) return;

            // If the native status-40 button already exists on this page, don't add ours
            if (document.getElementById('assignButton1')) return;

            const buttonContainer = document.querySelector('.rnr-buttons-left');
            if (!buttonContainer) {
                if (retries > 0) setTimeout(() => tryInject(retries - 1), 500);
                return;
            }

            const currentStatus = getPageRepairStatus();
            console.log('[MMS] injectReturnTo40Button: detected status =', currentStatus);

            if (currentStatus !== '65' && currentStatus !== '100') return;

            const statusSelect = getStatusSelect();

            const btn = document.createElement('a');
            btn.id = 'tm-back-to-40-btn';
            btn.className = 'rnr-button';
            btn.href = '#';
            btn.setAttribute('data-tm-status-tracked', 'true');
            btn.innerHTML = `
                <span class="statusbadge blink" style="background-color:#ff0a0a">40</span><br>
                <span style="font-size:13px">ΠΡΟΣ ΕΛΕΓΧΟ</span>
            `;

            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // Prefer clicking a native hidden button with badge "40"
                let nativeBtn40 = null;
                document.querySelectorAll('.rnr-button, a[href="#"]').forEach(b => {
                    if (b === btn) return;
                    const badge = b.querySelector('.statusbadge');
                    if (badge && badge.textContent.trim() === '40') nativeBtn40 = b;
                });
                if (nativeBtn40) { nativeBtn40.click(); return; }

                // Fallback: set dropdown + click save
                const sel = getStatusSelect();
                if (sel) {
                    sel.value = '40';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
                const saveBtn = document.getElementById('saveButton1') ||
                                document.querySelector('a.rnr-button.main') ||
                                document.querySelector('a[id*="save"]');
                if (saveBtn) {
                    saveBtn.style.removeProperty('display');
                    saveBtn.click();
                }
            });

            buttonContainer.prepend(btn);
            console.log('[MMS] ✅ Injected Return-to-40 button (current repair status:', currentStatus, ')');
        };

        // First attempt after a short delay to let the page render its own buttons
        setTimeout(() => tryInject(), 600);
    }

    /**
     * Initializes fun, non-essential features like confetti.
     */
    function initFunFeatures() {
        if (!config.confettiEnabled) return;

        // --- Confetti on Status 100 Completion ---
        if (window.location.pathname.includes('/mymanagerservice/service_edit.php')) {
            const buttons = document.querySelectorAll('.rnr-b-editbuttons a.rnr-button');
            
            buttons.forEach(button => {
                const buttonText = button.innerText.toUpperCase().trim();
                const isBackButton = buttonText.includes('BACK TO LIST') || 
                                    buttonText.includes('ΕΚΤΥΠΩΣΗ') ||
                                    buttonText.includes('ΠΙΣΩ ΣΤΗ ΛΙΣΤΑ') ||
                                    buttonText.includes('ΠΙΣΩ ΣΤΗ') ||
                                    buttonText.includes('ΛΙΣΤΑ') ||
                                    buttonText === 'ΠΙΣΩ' ||
                                    buttonText.includes('BACK') ||
                                    buttonText.includes('CANCEL') ||
                                    buttonText.includes('ΑΚΥΡΩΣΗ') ||
                                    buttonText.includes('ΕΠΙΣΤΡΟΦΗ') ||
                                    buttonText.includes('RETURN') ||
                                    buttonText.includes('NAVIGATE') ||
                                    buttonText.includes('ΜΕΝΟΥ') ||
                                    buttonText.includes('MENU');
                
                const isStatusButton = !isBackButton;

                if (isStatusButton) {
                    button.addEventListener('click', () => {
                        // Check for delivery/completion status
                        const buttonTextLower = button.innerText.toLowerCase();
                        const buttonTextUpper = button.innerText.toUpperCase();
                        
                        const isDeliveryButton = buttonTextLower.includes('παραδοση') || buttonTextLower.includes('παραδοσ') || 
                                               buttonTextLower.includes('deliver') || buttonTextLower.includes('complete') ||
                                               buttonTextUpper.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ');
                        
                        if (isDeliveryButton) {
                            setTimeout(() => {
                                triggerConfetti(100);
                            }, 500);
                        }
                    });
                }
            });
            
            // Add "Send to Status 40" button with special account
            if (typeof window.initStatus40Button === 'function') {
                window.initStatus40Button();
            }
        }
    }

    // ===================================================================
    // === 7. FEATURE: SEND TO STATUS 40 WITH SPECIAL ACCOUNT
    // ===================================================================
    // This feature has been moved to myman_status40.js
    // The functions are available via window.initStatus40Button and window.checkPendingStatus40
    
    // ===================================================================
    // === 8. FEATURE: TECHNICIAN STATS ON SERVICE LIST
    // ===================================================================
    // This feature has been moved to myman_technicianstats.js
    // The functions are available via window.initTechnicianStatsFeature

    // ===================================================================
    // === 8. FEATURE: CUSTOMER HISTORY QUICK VIEW
    // ===================================================================

    /**
     * Fetches and displays a customer's repair history in a modal.
     * @param {string} searchTerm The name or phone number of the customer to search for.
     */
    function showCustomerHistoryModal(searchTerm) {
        trackDailyStat(config, STORAGE_KEYS, 'viewCustomerHistory'); // Grant XP for viewing history
        // Close any existing history modal to prevent race conditions and overlap.
        const existingModal = document.getElementById('tm-customer-history-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 1. Create and show a loading modal immediately
        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.id = 'tm-customer-history-modal'; // Assign a unique ID
        overlay.innerHTML = `
            <div class="tm-modal-content">
                <div class="tm-modal-header">
                    <h2 class="tm-modal-title">Ιστορικό Επισκευών: ${searchTerm}</h2>
                    <button class="tm-modal-close">&times;</button>
                </div>
                <div id="tm-customer-history-container">
                    <div id="tm-status-message">Αναζήτηση ιστορικού...</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // 2. Perform the background search
        const searchUrl = `/mymanagerservice/service_list.php?qs=${encodeURIComponent(searchTerm)}&pagesize=-1`;
        GM_xmlhttpRequest({
            method: 'GET',
            url: searchUrl,
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, 'text/html');
                const historyContainer = overlay.querySelector('#tm-customer-history-container');

                const rows = doc.querySelectorAll('tbody tr[id^="gridRow"]');
                if (rows.length === 0) {
                    historyContainer.innerHTML = `<div id="tm-status-message">Δεν βρέθηκαν άλλες επισκευές για αυτόν τον πελάτη.</div>`;
                    return;
                }

                // Find column indexes from the fetched document
                const headers = Array.from(doc.querySelectorAll('thead th'));
                const headerTexts = headers.map(th => th.innerText.trim());
                const dateIndex = headerTexts.findIndex(text => text.includes('Ημ.Εισαγωγής'));
                const deviceIndex = headerTexts.findIndex(text => text.includes('Συσκευή'));
                const ageIndex = headerTexts.findIndex(text => text.includes('Παλαιότητα'));
                const repairNumberIndex = headerTexts.findIndex(text => text.includes('Αρ.'));
                const statusIndex = headerTexts.findIndex(text => text.includes('Κατάσταση'));

                // 3. Build the results table
                let tableHTML = `
                    <table class="table table-bordered table-striped" style="width: 100%; text-align: center; margin-top: 10px;">
                        <thead><tr style="text-align: center;">
                            <th class="tm-sortable-header" data-column="0" data-sort-type="date">Ημ/νία Εισαγωγής</th>
                            <th class="tm-sortable-header" data-column="1" data-sort-type="string">Παλαιότητα</th>
                            <th class="tm-sortable-header" data-column="2" data-sort-type="string">Αρ.</th>
                            <th class="tm-sortable-header" data-column="3" data-sort-type="string">Συσκευή</th>
                            <th class="tm-sortable-header" data-column="4" data-sort-type="string">Κατάσταση</th>
                        </tr></thead>
                        <tbody>`;

                rows.forEach(row => {
                    const cells = row.cells;
                    const repairLink = findOrderLink(row, response.finalUrl) || '#';
                    const dateText = cells[dateIndex]?.innerText.trim() || 'N/A';
                    const ageText = cells[ageIndex]?.innerText.trim() || 'N/A';
                    const repairNumberText = cells[repairNumberIndex]?.innerText || 'N/A';
                    const statusHTML = cells[statusIndex]?.innerHTML || 'N/A';
                    tableHTML += `
                        <tr>
                            <td>${dateText}</td>
                            <td>${ageText}</td>
                            <td><a href="${repairLink}" target="_blank">${repairNumberText}</a></td>
                            <td>${cells[deviceIndex]?.innerText.trim() || 'N/A'}</td>
                            <td>${statusHTML}</td>
                        </tr>
                    `;
                });

                tableHTML += `</tbody></table>`;
                historyContainer.innerHTML = tableHTML;

                // 4. Add sorting logic
                const table = historyContainer.querySelector('table');
                const sortableHeaders = table.querySelectorAll('.tm-sortable-header');
                const tbody = table.querySelector('tbody');
                let currentSort = { column: -1, direction: 'asc' };

                sortableHeaders.forEach(header => {
                    header.addEventListener('click', () => {
                        const columnIndex = parseInt(header.dataset.column, 10);
                        const sortType = header.dataset.sortType || 'string';
                        const direction = (currentSort.column === columnIndex && currentSort.direction === 'asc') ? 'desc' : 'asc';

                        const rowsArray = Array.from(tbody.querySelectorAll('tr'));

                        const parseValue = (cell, type) => {
                            const text = cell.innerText.trim();
                            if (type === 'date') {
                                const parts = text.split(' ')[0].split('/');
                                return parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(0);
                            }
                            if (type === 'price') {
                                return parseFloat(text.replace(/€/g, '').replace(/\./g, '').replace(/,/g, '.').trim()) || 0;
                            }
                            return text.toLowerCase();
                        };

                        rowsArray.sort((a, b) => {
                            const valA = parseValue(a.cells[columnIndex], sortType);
                            const valB = parseValue(b.cells[columnIndex], sortType);

                            if (valA < valB) return direction === 'asc' ? -1 : 1;
                            if (valA > valB) return direction === 'asc' ? 1 : -1;
                            return 0;
                        });

                        // Re-append sorted rows
                        rowsArray.forEach(row => tbody.appendChild(row));

                        // Update header indicators
                        sortableHeaders.forEach(h => h.innerHTML = h.innerHTML.replace(/ [▲▼]/, ''));
                        header.innerHTML += direction === 'asc' ? ' ▲' : ' ▼';

                        currentSort = { column: columnIndex, direction: direction };
                    });
                });

                // Automatically sort by date descending on first load
                const dateHeader = historyContainer.querySelector('[data-column="0"]');
                if (dateHeader) {
                    // Click twice to get descending order
                    dateHeader.click();
                    setTimeout(() => {
                        if (currentSort.direction === 'asc') {
                            dateHeader.click();
                        }
                    }, 0);
                }
            },
            onerror: function(error) {
                overlay.querySelector('#tm-customer-history-container').innerHTML = `<div id="tm-status-message" class="tm-details-error">Σφάλμα κατά την ανάκτηση ιστορικού.</div>`;
                console.error('[MMS History] Failed to fetch customer history:', error);
            }
        });
    }

    /**
     * Finds customer name and phone cells in the service list and makes them clickable to show history.
     */
    function initCustomerHistoryFeature() {
        if (!config.customerHistoryEnabled) {
            console.log('[MMS] Customer History feature is disabled in settings.');
            return;
        }
        
        if (!window.location.pathname.includes('/mymanagerservice/service_list.php')) {
            console.log('[MMS] Not on service list page, skipping Customer History feature.');
            return;
        }

        // Use a slight delay to ensure the table is fully rendered
        setTimeout(() => {
        const gridTable = document.querySelector('table.rnr-b-grid');
            if (!gridTable) {
                console.log('[MMS] Grid table not found for Customer History feature.');
                return;
            }

        const headers = Array.from(gridTable.querySelectorAll('thead th'));
        const customerNameIndex = headers.findIndex(th => th.innerText.trim().includes('Πελάτης'));
        const phoneIndex = headers.findIndex(th => th.innerText.trim().includes('Τηλέφωνο'));

            console.log(`[MMS] Customer History: Found customer column at index ${customerNameIndex}, phone at ${phoneIndex}`);

        const makeCellClickable = (cell, isPhoneNumber = false) => {
            if (cell && cell.innerText.trim()) {
                cell.classList.add('tm-customer-history-link');
                cell.title = 'Εμφάνιση ιστορικού επισκευών';
                    cell.style.cursor = 'pointer';
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                        console.log('[MMS] Customer History clicked:', cell.innerText.trim());
                        
                        // Get the text from the cell
                        let searchTerm = cell.innerText.trim().split('\n')[0]; // Use first line if multiple
                        
                    // If it's a phone number, clean it by removing all non-digit characters.
                    // This handles formats like '69X XXX XXXX' by turning them into '69XXXXXXXX'.
                    if (isPhoneNumber) {
                            searchTerm = searchTerm.replace(/\D/g, '');
                            console.log('[MMS] Cleaned phone number for search:', searchTerm);
                    }
                        
                    showCustomerHistoryModal(searchTerm);
                });
            }
        };

            const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"]');
            console.log(`[MMS] Customer History: Processing ${rows.length} rows`);
            
            rows.forEach(row => {
            if (customerNameIndex > -1) makeCellClickable(row.cells[customerNameIndex], false);
            if (phoneIndex > -1) makeCellClickable(row.cells[phoneIndex], true);
        });
            
            if (config?.debugEnabled) {
            console.log('[MMS] Customer History Quick View initialized successfully.');
        }
        }, 500); // 500ms delay to ensure table is rendered
    }

    
    // ===================================================================
    // === 9. FEATURE: DAILY DASHBOARD WIDGET
    // ===================================================================
    /**
     * Creates a small widget in the footer to display today's tracked statistics.
     * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
     */
    function initDailyDashboardWidget(parentContainer) {
        if (!config.dashboardWidgetEnabled) return;

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Load stats from GM storage
        let stats = { date: today, searches: 0, repairsCompleted: 0, ordersCreated: 0 };
        try {
            const savedStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
            // If the saved date is today, use the saved stats. Otherwise, the fresh object (all zeros) will be used.
            if (savedStats.date === today) {
                stats = savedStats;
            }
        } catch (e) {
            console.error('[MMS] Could not parse daily stats for dashboard, showing zeros.', e);
        }

        // Create the widget's HTML
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'tm-daily-dashboard-widget';
        widgetContainer.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: var(--tm-primary-color);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            height: 40px;
            padding: 0 14px;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        `;
        widgetContainer.title = `Σημερινά Στατιστικά (Click για Personal Dashboard):\n- ${stats.ordersCreated || 0} Νέες Παραγγελίες\n- ${stats.repairsCompleted || 0} Ολοκληρωμένες Επισκευές\n- ${stats.searches || 0} Αναζητήσεις`;

        widgetContainer.innerHTML = `
            <span style="font-weight: bold; font-size: 10px;">Σήμερα:</span>
            <span>📝 ${stats.ordersCreated || 0}</span>
            <span style="opacity: 0.5;">|</span>
            <span>🛠️ ${stats.repairsCompleted || 0}</span>
            <span style="opacity: 0.5;">|</span>
            <span>🔍 ${stats.searches || 0}</span>
        `;
        
        // Add click handler to open Personal Dashboard
        widgetContainer.addEventListener('click', () => {
            console.log('[MMS] Dashboard widget clicked!');
            if (typeof window.showDashboardModal === 'function') {
                console.log('[MMS] Opening Personal Dashboard...');
                try {
                    window.showDashboardModal(config, STORAGE_KEYS);
                } catch (e) {
                    console.error('[MMS] Error opening dashboard:', e);
                    alert('Error opening Personal Dashboard. Check console for details.');
                }
            } else {
                console.error('[MMS] showDashboardModal function not found! Gamification script may not be loaded.');
                alert('Personal Dashboard not available. The gamification script may not be loaded properly.');
            }
        });
        
        // Add consistent hover animations
        widgetContainer.addEventListener('mouseenter', () => {
            widgetContainer.style.transform = 'translateY(-3px) scale(1.05)';
            widgetContainer.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            widgetContainer.style.borderColor = 'rgba(255,255,255,0.4)';
        });
        widgetContainer.addEventListener('mouseleave', () => {
            widgetContainer.style.transform = 'translateY(0) scale(1)';
            widgetContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            widgetContainer.style.borderColor = 'rgba(255,255,255,0.2)';
        });

        // Add the widget to the parent container in the footer
        parentContainer.appendChild(widgetContainer);
            if (config?.debugEnabled) {
        console.log('[MMS] Daily Dashboard widget initialized in footer.');
            }
    }

    /**
     * Creates a small widget in the footer to display the user's XP bar.
     * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
     */
    function initXpBarWidget(parentContainer) {
        if (!config.levelUpSystemEnabled) return;

        const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
        const currentXp = GM_getValue(STORAGE_KEYS.USER_XP, 0);

        const xpBarContainer = document.createElement('div');
        xpBarContainer.id = 'tm-xp-bar-container';
        const xpForNextLevel = getXpForLevel(currentLevel);
        const rankInfo = RANKS.slice().reverse().find(r => currentLevel >= r.level) || RANKS[0];
        const defaultRankTitle = (rankInfo && rankInfo.title) || (RANKS[0] && RANKS[0].title) || 'Novice Tech';
        let storedTitle = GM_getValue(STORAGE_KEYS.USER_TITLE, defaultRankTitle);
        if (storedTitle == null || String(storedTitle) === 'undefined' || String(storedTitle).trim() === '') {
            storedTitle = defaultRankTitle;
        }
        const currentTitle = storedTitle;
        const titleColor = rankInfo && rankInfo.color ? rankInfo.color : '#d1d1d1';
        const glowStyle = rankInfo && rankInfo.glow ? `text-shadow: 0 0 5px ${titleColor};` : '';
        
        xpBarContainer.title = `Click to view all titles & ranks`;
        xpBarContainer.style.position = 'relative'; // For absolute positioned badges
        
        xpBarContainer.innerHTML = `
            <span id="tm-energized-buff-indicator" style="display: none;"></span>
            <span id="tm-level-text">Lv. ${currentLevel}</span>
            <span id="tm-user-title-text">${currentTitle}</span>
            <div class="tm-xp-bar" title="${currentXp} / ${xpForNextLevel} XP">
                <div id="tm-xp-bar-fill" style="width: ${(currentXp / xpForNextLevel) * 100}%;"></div>
                <div id="tm-xp-text">${currentXp}/${xpForNextLevel}</div>
            </div>
        `;
        
        // Coin balance is in its own dedicated widget, not in the XP bar anymore

        parentContainer.appendChild(xpBarContainer);

        // Make the entire bar clickable to show the titles modal
        xpBarContainer.style.cursor = 'pointer';
        xpBarContainer.addEventListener('click', () => showTitlesModal(STORAGE_KEYS));
        
        // Add consistent hover animations
        xpBarContainer.addEventListener('mouseenter', () => {
            xpBarContainer.style.transform = 'translateY(-3px) scale(1.05)';
            xpBarContainer.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            xpBarContainer.style.borderColor = 'rgba(255,255,255,0.4)';
        });
        xpBarContainer.addEventListener('mouseleave', () => {
            xpBarContainer.style.transform = 'translateY(0) scale(1)';
            xpBarContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            xpBarContainer.style.borderColor = 'rgba(255,255,255,0.2)';
        });

        if (config?.debugEnabled) {
        console.log('[MMS] XP Bar widget initialized in footer.');
        }
    }

    function updateXpBarUI(STORAGE_KEYS, level, xp, xpForNext) {
        const xpBarFill = document.getElementById('tm-xp-bar-fill');
        const xpText = document.getElementById('tm-xp-text');
        const levelText = document.getElementById('tm-level-text');
        const titleText = document.getElementById('tm-user-title-text');
        const xpBar = document.querySelector('.tm-xp-bar');

        const percentage = (xp / xpForNext) * 100;
        if (xpBarFill) xpBarFill.style.width = `${percentage}%`;
        if (xpText) xpText.textContent = `${xp}/${xpForNext}`;
        if (xpBar) xpBar.title = `${xp} / ${xpForNext} XP`;

        const rankInfo = RANKS.slice().reverse().find(r => level >= r.level) || RANKS[0];
        const safeRankTitle = (rankInfo && rankInfo.title) ? rankInfo.title : (RANKS[0] && RANKS[0].title) || 'Novice Tech';
        
        // Also save the title to storage so it persists
        GM_setValue(STORAGE_KEYS.USER_TITLE, safeRankTitle);

        if (titleText) {
            titleText.textContent = safeRankTitle;
            titleText.style.color = 'white';
            titleText.style.textShadow = (rankInfo && rankInfo.glow && rankInfo.color) ? `0 0 8px ${rankInfo.color}` : 'none';
        }
        if (levelText) {
        levelText.textContent = `Lv. ${level}`;
        }
        
        console.log(`[MMS XP Bar] Updated UI - Level: ${level}, Title: ${safeRankTitle}, XP: ${xp}/${xpForNext}`);
    }


    // ===================================================================
    // === 11. FUN FEATURE: MEMORY MINI-GAME
    // ===================================================================
    function startMemoryGame() {
        if (document.getElementById('tm-memory-game-overlay')) return;

        trackDailyStat(config, STORAGE_KEYS, 'memoryGame'); // Grant base XP for playing

        const overlay = document.createElement('div');
        overlay.id = 'tm-memory-game-overlay';
        document.body.appendChild(overlay);

        overlay.innerHTML = `
            <div id="tm-memory-game-status">Get Ready...</div>
            <div id="tm-memory-game-mascot-container">
                ${document.getElementById('tm-mascot-container').querySelector('.tm-mascot-robot').outerHTML}
                <div class="tm-memory-game-pad" data-pad="0" style="top: 15%; left: 30%; width: 20%; height: 20%;"></div>
                <div class="tm-memory-game-pad" data-pad="1" style="top: 15%; left: 50%; width: 20%; height: 20%;"></div>
                <div class="tm-memory-game-pad" data-pad="2" style="bottom: 15%; left: 30%; width: 20%; height: 20%;"></div>
                <div class="tm-memory-game-pad" data-pad="3" style="bottom: 15%; left: 50%; width: 20%; height: 20%;"></div>
            </div>
            <div id="tm-memory-game-score" style="color: white; font-size: 20px;">Round: 1</div>
        `;

        const statusEl = overlay.querySelector('#tm-memory-game-status');
        const scoreEl = overlay.querySelector('#tm-memory-game-score');
        const pads = overlay.querySelectorAll('.tm-memory-game-pad');
        const padColors = ['#007bff', '#28a745', '#dc3545', '#ffc107'];

        let sequence = [];
        let playerSequence = [];
        let round = 1;
        let canPlayerClick = false;

        function flashPad(padIndex) {
            return new Promise(resolve => {
                const pad = pads[padIndex];
                pad.style.backgroundColor = padColors[padIndex];
                pad.classList.add('active');
                setTimeout(() => {
                    pad.style.backgroundColor = '';
                    pad.classList.remove('active');
                    setTimeout(resolve, 150); // Pause between flashes
                }, 400);
            });
        }

        async function playSequence() {
            canPlayerClick = false;
            statusEl.textContent = "Watch...";
            await new Promise(r => setTimeout(r, 1000));

            for (const padIndex of sequence) {
                await flashPad(padIndex);
            }

            canPlayerClick = true;
            statusEl.textContent = "Your Turn!";
            playerSequence = [];
        }

        function nextRound() {
            scoreEl.textContent = `Round: ${round}`;
            sequence.push(Math.floor(Math.random() * 4));
            playSequence();
        }

        function endGame(isWin) {
            canPlayerClick = false;
            const finalRound = round - 1;
            const bonusXp = finalRound * 5; // 5 XP per successful round
            grantXp(config, STORAGE_KEYS, bonusXp);

            statusEl.innerHTML = `
                Game Over! You reached round ${finalRound}.<br>
                You earned ${XP_CONFIG.memoryGame + bonusXp} XP!
            `;
            overlay.style.cursor = 'pointer';
            overlay.addEventListener('click', () => overlay.remove());
        }

        pads.forEach(pad => {
            pad.addEventListener('click', async () => {
                if (!canPlayerClick) return;

                const padIndex = parseInt(pad.dataset.pad, 10);
                await flashPad(padIndex);
                playerSequence.push(padIndex);

                // Check if the player's move was correct so far
                const lastPlayerMoveIndex = playerSequence.length - 1;
                if (playerSequence[lastPlayerMoveIndex] !== sequence[lastPlayerMoveIndex]) {
                    endGame(false);
                    return;
                }

                // If the player has completed the sequence
                if (playerSequence.length === sequence.length) {
                    round++;
                    setTimeout(nextRound, 500);
                }
            });
        });

        setTimeout(nextRound, 1500); // Start the first round
    }

    // ===================================================================
    // === 11. FUN FEATURE: BUG SQUISH MINI-GAME
    // ===================================================================
    function startBugSquishGame() {
        // Don't start if a game is already running
        if (document.getElementById('tm-game-overlay')) return;

        trackDailyStat(config, STORAGE_KEYS, 'bugSquishGame'); // Grant base XP for playing

        const overlay = document.createElement('div');
        overlay.id = 'tm-game-overlay';
        document.body.appendChild(overlay);

        const gameUI = document.createElement('div');
        gameUI.id = 'tm-game-ui';
        gameUI.innerHTML = `
            <div id="tm-game-timer">Time: 15</div>
            <div id="tm-game-score">Score: 0</div>
        `;
        document.body.appendChild(gameUI);

        let score = 0;
        let timeLeft = 15;
        let gameInterval = null;
        let bugSpawner = null;

        const timerEl = document.getElementById('tm-game-timer');
        const scoreEl = document.getElementById('tm-game-score');

        function spawnBug() {
            const bug = document.createElement('div');
            bug.className = 'tm-game-bug';
            bug.textContent = '🐞';

            // Position bug randomly, avoiding edges
            bug.style.top = `${Math.random() * 85 + 5}%`;
            bug.style.left = `${Math.random() * 90 + 5}%`;

            bug.addEventListener('click', () => {
                if (bug.classList.contains('squished')) return;
                score++;
                scoreEl.textContent = `Score: ${score}`;
                bug.classList.add('squished');
                setTimeout(() => bug.remove(), 300);
            });

            overlay.appendChild(bug);

            // Remove bug after a few seconds if not clicked
            setTimeout(() => {
                if (bug.parentElement) bug.remove();
            }, 4000);
        }

        function endGame() {
            clearInterval(gameInterval);
            clearTimeout(bugSpawner);

            // Grant bonus XP based on score (2 XP per bug)
            const bonusXp = score * 2;
            if (bonusXp > 0) {
                grantXp(config, STORAGE_KEYS, bonusXp);
            }

            overlay.innerHTML = `
                <div id="tm-game-end-screen">
                    <h1>Game Over!</h1>
                    <h2>Final Score: ${score}</h2>
                    <p>You earned ${XP_CONFIG.bugSquishGame + bonusXp} XP!</p>
                    <p>(Click to close)</p>
                </div>
            `;
            overlay.style.background = 'rgba(0,0,0,0.7)';
            overlay.style.cursor = 'pointer';
            overlay.addEventListener('click', () => {
                overlay.remove();
                gameUI.remove();
            });
        }

        gameInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = `Time: ${timeLeft}`;
            if (timeLeft <= 0) endGame();
            else spawnBug(); // Spawn a new bug every second
        }, 1000);

        spawnBug(); // Spawn the first bug immediately
    }
    
    // Make mini-game functions globally accessible for mascot interactions
    window.startMemoryGame = startMemoryGame;
    window.startBugSquishGame = startBugSquishGame;

    /**
     * Makes the mascot react to success or error messages on the page.
     */
    function initMascotPageReactions() {
        if (!config.interactiveMascotEnabled) return;

        const mascotContainer = document.getElementById('tm-mascot-container');
        if (!mascotContainer) {
            setTimeout(() => initMascotPageReactions(), 2000);
            return;
        }

        // Detect page type
        const currentPage = window.location.pathname;
        
        // Test if mascot bubble works
        setTimeout(() => {
            if (window.showMascotBubble) {
                const testMessages = [
                    'Έτοιμος να βοηθήσω!', 'Ready to help!', 'Let\'s work!',
                    'Πάμε!', 'Τι κάνουμε σήμερα;', 'What\'s up?'
                ];
                window.showMascotBubble(testMessages[Math.floor(Math.random() * testMessages.length)], 3000);
            }
        }, 2000);
        
        // === REPAIR INTERACTIONS ===
        if (currentPage.includes('service')) {
            // Watch for repair status changes
            const statusButtons = document.querySelectorAll('.rnr-b-status');
            statusButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    setTimeout(() => {
                        const messages = [
                            'Status άλλαξε!', 'Μπράβο!', 'Ωραίος!', 
                            'Πάμε παρακάτω!', 'Next!', 'Προχωράμε!'
                        ];
                        window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2500);
                    }, 500);
                });
            });
            
            // Watch for repair saves
            const saveButtons = document.querySelectorAll('.rnr-button.main, button[type="submit"]');
            saveButtons.forEach(btn => {
                if (btn.textContent.includes('Αποθήκευση') || btn.textContent.includes('Save')) {
                    btn.addEventListener('click', () => {
                        setTimeout(() => {
                            const messages = [
                                'Saved! ✓', 'Αποθηκεύτηκε!', 'Done!', 
                                'Τέλειο!', 'All good!', 'Όλα οκ!'
                            ];
                            window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2500);
                            window.setMascotState?.(config, 'happy', 3000);
                        }, 300);
                    });
                }
            });
            
            // Detect repair details
            const deviceField = document.querySelector('input[name*="ProductName"], input[name*="DeviceDescription"]');
            if (deviceField && deviceField.value) {
                setTimeout(() => {
                    const device = deviceField.value.substring(0, 20);
                    const messages = [
                        `${device}... Μμμ...`, 
                        `${device}! Το ξέρω αυτό!`,
                        `Ωραία συσκευή!`,
                        `Ας δούμε τι έχει...`
                    ];
                    window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 3000);
                }, 1500);
            }
            
            // Analyze and react to repair statuses from the side menu
            const statusMenu = document.querySelector('.rnr-b-vmenu.simple.main.initialized');
            if (statusMenu) {
                setTimeout(() => {
                    // Only track specific status IDs
                    const trackedStatusIds = ['30', '40', '65', '90'];
                    const statusIdMap = {};
                    let totalRepairs = 0;
                    
                    // Find all menu links with status information
                    const menuLinks = statusMenu.querySelectorAll('a[href*="statusid"]');
                    
                    menuLinks.forEach(link => {
                        // Check if this link is for one of the tracked status IDs
                        const href = link.getAttribute('href');
                        const statusIdMatch = href.match(/statusid=(\d+)/);
                        
                        if (statusIdMatch && trackedStatusIds.includes(statusIdMatch[1])) {
                            // Extract status name and count
                            const statusBadge = link.querySelector('.statusbadge');
                            const countBadge = link.querySelector('.badge');
                            
                            if (statusBadge && countBadge) {
                                const statusId = statusIdMatch[1]; // Use the actual status ID (30, 40, 65, 90)
                                const count = parseInt(countBadge.textContent.trim(), 10);
                                const linkText = link.textContent;
                                const statusName = linkText.replace(statusBadge.textContent, '').replace(count.toString(), '').trim();
                                
                                if (!isNaN(count) && count > 0) {
                                    statusIdMap[statusId] = { name: statusName, count: count };
                                    totalRepairs += count;
                                }
                            }
                        }
                    });
                    
                    // Find the status with the HIGHEST count - that's what we'll roast
                    let maxStatus = null;
                    let maxCount = 0;
                    
                    Object.keys(statusIdMap).forEach(statusId => {
                        if (statusIdMap[statusId].count > maxCount) {
                            maxCount = statusIdMap[statusId].count;
                            maxStatus = statusId;
                        }
                    });
                    
                    console.log('[MMS Mascot] Repair Status Analysis from Menu:', {
                        totalRepairs,
                        trackedStatusIds,
                        statusIdMap,
                        maxStatus: maxStatus,
                        maxCount: maxCount,
                        willReactToAllStatuses: Object.keys(statusIdMap).filter(id => statusIdMap[id].count > 0)
                    });
                    
                    // Generate MEAN Greek slang comments for ALL statuses with counts > 0
                    const messages = [];
                    
                    // Generate comments for ALL statuses that have counts > 0
                    Object.keys(statusIdMap).forEach(statusId => {
                        const statusData = statusIdMap[statusId];
                        const count = statusData.count;
                        
                        if (count > 0) {
                        
                        // Status 30 - Intake/New
                        if (statusId === '30') {
                            if (count > 5) {
                                messages.push(
                                    `Ρε μαλάκα ${count} στο 30! ΚΟΥΝΗΣΟΥ!`,
                                    `Άντε ρε! ${count} στο 30 και χαζεύεις;`,
                                    `${count} εισαγωγές; ΞΥΠΝΑ ΚΑΗΜΕΝΕ!`,
                                    `Γαμώτο ${count} στο 30... πάμε τώρα!`,
                                    `Ρε συ ${count} στο 30! Πότε θα τις πιάσεις;`,
                                    `Παναγία μου ${count} νέες! ΔΟΥΛΕΙΑ!`,
                                    `${count} στο 30 ρε... τι περιμένεις;`,
                                    `Μωρέ ${count} στο 30! Κούνα κώλο!`,
                                    `Ρε πούστη μου ${count} στο 30!`,
                                    `${count} στο 30! Μπάξε καμιά ρε!`
                                );
                            } else {
                                messages.push(`${count} στο 30 - Οκ ρε.`, `${count} εισαγωγές - Καλά.`);
                            }
                        }
                        
                        // Status 40 - In Progress
                        if (statusId === '40') {
                            if (count > 5) {
                                messages.push(
                                    `Ρε ${count} στο 40! Γιατί τόσες;`,
                                    `${count} στο 40 ρε φίλε! ΤΕΛΕΙΩΣΕ ΤΕΣ!`,
                                    `${count} στο 40! Προχώρα μπροστά!`,
                                    `Ρε μαλάκα ${count} στο 40!`,
                                    `${count} σε εργασία! Κινήσου ρε!`,
                                    `Ρε φιλαράκο ${count} στο 40 - πότε τελειώνουν;`,
                                    `${count} στο 40 ρε... σιγά-σιγά;`,
                                    `Ουφ ${count} στο 40! Τι γίνεται ρε;`,
                                    `Στραβώσαμε ρε! ${count} στο 40!`,
                                    `${count} στο 40! Αγάλα-αγάλα ε;`
                                );
                            } else {
                                messages.push(`${count} στο 40 - Οκ.`, `${count} σε εργασία - Καλά είμαστε.`);
                            }
                        }
                        
                        // Status 65 - Waiting for Parts
                        if (statusId === '65') {
                            if (count > 8) {
                                messages.push(
                                    `Ρε ${count} στο 65! ΠΕΡΙΜΕΝΟΥΝ PARTS!`,
                                    `${count} στο 65! Ανταλλακτικά δε φτάνουν!`,
                                    `${count} περιμένουν parts ρε συ!`,
                                    `Γαμώ τη μάνα μου ${count} χωρίς parts!`,
                                    `${count} στο 65 ρε! ΠΟΥ ΤΑ PARTS;`,
                                    `Μαλάκα μου ${count} χωρίς ανταλλακτικά!`,
                                    `${count} στο 65 ρε... ΠΑΡΑΓΓΕΙΛΕ!`,
                                    `Ρε φίλε ${count} περιμένουν! PARTS!`,
                                    `Αχ γαμώτο ${count} χωρίς parts!`,
                                    `${count} στο 65! Ανταλλακτικά ρε!`
                                );
                            } else {
                                messages.push(`${count} στο 65 - Περιμένουν parts.`, `${count} για ανταλλακτικά - Εντάξει.`);
                            }
                        }
                        
                        // Status 90
                        if (statusId === '90') {
                            if (count > 2) {
                                messages.push(
                                    `Ρε ${count} στο 90! Τι έγινε εκεί;`,
                                    `${count} στο 90 ρε συ! ΦΤΙΑΞΕ ΤΟ!`,
                                    `${count} στο 90! Μαλακία γίνεται!`,
                                    `Γαμώ τα πάντα ${count} στο 90!`,
                                    `${count} στο 90 ρε! ΠΡΟΣΟΧΗ!`,
                                    `Ρε συ ${count} στο 90! ΚΙΝΔΥΝΟΣ!`,
                                    `${count} στο 90 ρε... τι τρέχει;`,
                                    `Μωρέ ${count} στο 90! Πως έγινε αυτό;`,
                                    `Ουστ ${count} στο 90!`,
                                    `${count} στο 90! Αχ σκατά!`
                                );
                            } else {
                                messages.push(`${count} στο 90 - Καλά.`, `${count} στο 90 - Οκ είναι.`);
                            }
                        }
                        } // End of if (count > 0)
                    }); // End of forEach loop
                    
                    // Handle case when no repairs exist
                    if (totalRepairs === 0) {
                        messages.push('Καθαρά όλα!', 'Άδειο!', 'Ησυχία!', 'Τίποτα σήμερα!');
                    }
                    
                    // Display the comment
                    if (messages.length > 0) {
                        window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 4000);
                    }
                    
                    // Set mascot mood based on urgency of tracked statuses (updated thresholds)
                    let isUrgent = false;
                    
                    if ((statusIdMap['30'] && statusIdMap['30'].count > 5) || 
                        (statusIdMap['40'] && statusIdMap['40'].count > 5) ||
                        (statusIdMap['65'] && statusIdMap['65'].count > 8) ||
                        (statusIdMap['90'] && statusIdMap['90'].count > 2)) {
                        isUrgent = true;
                    }
                    
                    if (isUrgent) {
                        window.setMascotState?.(config, 'surprised', 3000);
                    }
                }, 2500);
            }
        }
        
        // === ORDER INTERACTIONS ===
        // Check for order save buttons on order pages OR repair pages (orders can be created from repairs)
        if (currentPage.includes('order') || currentPage.includes('service_edit')) {
            // Watch for order creations - look for save buttons on order forms
            const orderSaveBtn = document.querySelector('#saveButton1, button.rnr-button.main[href="#"]');
            if (orderSaveBtn) {
                orderSaveBtn.addEventListener('click', () => {
                    setTimeout(() => {
                        // Track the order creation for stats and XP
                        trackDailyStat(config, STORAGE_KEYS, 'ordersCreated');
                        
                        const messages = [
                            'Παραγγελία! 📦', 'Order placed!', 'Τέλεια!',
                            'Πάμε για ανταλλακτικά!', 'Parts incoming!', 'Nice!'
                        ];
                        window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2500);
                        window.setMascotState?.(config, 'happy', 3000);
                    }, 300);
                });
            }
        }
        
        // Additional check specifically for order pages
        if (currentPage.includes('order')) {
            
            // React to items in order list
            const orderItems = document.querySelectorAll('.rnr-b-table tbody tr');
            if (orderItems.length > 0) {
                setTimeout(() => {
                    const count = orderItems.length;
                    const messages = [
                        `${count} παραγγελίες!`, 
                        `Πολλές παραγγελίες σήμερα!`,
                        `Έχουμε δουλειά!`,
                        `${count} orders... Ωραία!`
                    ];
                    window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 3000);
                }, 2000);
            }
        }
        
        // === PARTS/INVENTORY INTERACTIONS ===
        if (currentPage.includes('sparepart') || currentPage.includes('ανταλλακτ')) {
            const partsRows = document.querySelectorAll('.rnr-b-table tbody tr');
            if (partsRows.length > 5) {
                setTimeout(() => {
                    const messages = [
                        'Πολλά parts!', 'Καλό stock!', 'Nice inventory!',
                        'Έχουμε όλα!', 'Full stock!', 'Ωραία!'
                    ];
                    window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 3000);
                }, 2000);
            }
            
            // React to search in parts
            const searchInput = document.querySelector('input[type="search"], input[name*="search"]');
            if (searchInput) {
                searchInput.addEventListener('focus', () => {
                    const messages = [
                        'Ψάχνεις κάτι;', 'Searching...', 'Τι χρειάζεσαι;',
                        'Βοηθάω;', 'What part?', 'Πες μου!'
                    ];
                    window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2500);
                });
            }
        }
        
        // === CUSTOMER INTERACTIONS ===
        if (currentPage.includes('customer') || currentPage.includes('πελατ')) {
            // Watch for phone/email clicks
            const contactLinks = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');
            contactLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const messages = [
                        'Καλή επικοινωνία!', 'Call them!', 'Πάμε!',
                        'Τηλέφωνο!', 'Contact!', 'Let\'s talk!'
                    ];
                    window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2000);
                });
            });
        }
        
        // === GENERAL PAGE INTERACTIONS ===
        
        // Watch for table interactions (clicking rows)
        const tableRows = document.querySelectorAll('.rnr-b-table tbody tr');
        tableRows.forEach((row, index) => {
            row.addEventListener('click', () => {
                if (Math.random() < 0.1) { // 10% chance to react
                    const messages = [
                        'Τι ψάχνεις;', 'Hmm...', 'Ας δούμε...',
                        'Ενδιαφέρον!', 'Ωραίο!', 'Checking...'
                    ];
                    window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2000);
                }
            });
        });
        
        // Watch for print actions
        // Check if we're on an allowed order edit page
        // Only allow on: srvorders_edit.php and sparepartstoorder_edit.php
        // Explicitly exclude: service_edit.php (repair edit page)
        // Use pathname instead of full URL since editid1 appears in all URLs
        const currentPathname = window.location.pathname;
        const isServiceEditPage = currentPathname.includes('service_edit.php');
        const isAllowedOrderEditPage = (currentPathname.includes('srvorders_edit.php') || 
                                     currentPathname.includes('sparepartstoorder_edit.php')) &&
                                    !isServiceEditPage;
        
        // Add CSS to hide print buttons on service_edit.php with !important
        if (isServiceEditPage) {
            GM_addStyle(`
                .tm-print-page-btn,
                a.tm-print-page-btn,
                .rnr-button.tm-print-page-btn,
                .rnr-button.main.tm-print-page-btn,
                button.tm-print-page-btn,
                a.rnr-button.tm-print-page-btn,
                a.rnr-button.main.tm-print-page-btn,
                .rnr-b-editbuttons a.tm-print-page-btn,
                .rnr-b-editbuttons .tm-print-page-btn {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    overflow: hidden !important;
                    position: absolute !important;
                    left: -9999px !important;
                }
            `);
        }
        
        // Function to hide/remove print buttons aggressively
        function hidePrintButtons() {
            if (!isServiceEditPage) return;
            
            // Include all possible print button selectors
            const allButtons = document.querySelectorAll('a, button, .rnr-button');
            const printButtons = [];
            
            allButtons.forEach(btn => {
                const hasPrintClass = btn.classList && (btn.classList.contains('tm-print-page-btn') || btn.classList.contains('rnr-b-print'));
                const hasPrintOnclick = btn.onclick && btn.onclick.toString().toLowerCase().includes('print');
                const hasPrintHref = btn.href && btn.href.toLowerCase().includes('print');
                const btnText = (btn.textContent || btn.innerText || '').toLowerCase();
                const hasPrintText = btnText.includes('εκτύπωση') || btnText.includes('print') || btnText.includes('ετύπωση');
                
                if (hasPrintClass || hasPrintOnclick || hasPrintHref || hasPrintText) {
                    printButtons.push(btn);
                }
            });
            
        printButtons.forEach(btn => {
                // Remove it completely
                try {
                    btn.remove();
                } catch (e) {
                    // If remove fails, hide it aggressively
                    btn.style.display = 'none !important';
                    btn.style.visibility = 'hidden !important';
                    btn.style.opacity = '0 !important';
                    btn.style.height = '0 !important';
                    btn.style.width = '0 !important';
                    btn.style.overflow = 'hidden !important';
                    btn.style.position = 'absolute !important';
                    btn.style.left = '-9999px !important';
                }
            });
        }
        
        // Run immediately and multiple times
        hidePrintButtons();
        setTimeout(hidePrintButtons, 50);
        setTimeout(hidePrintButtons, 100);
        setTimeout(hidePrintButtons, 200);
        setTimeout(hidePrintButtons, 500);
        setTimeout(hidePrintButtons, 1000);
        
        // Run repeatedly to catch dynamically added buttons
        if (isServiceEditPage) {
            const hideInterval = setInterval(hidePrintButtons, 100);
            // Also use MutationObserver for immediate removal
            const printObserver = new MutationObserver(() => {
                hidePrintButtons();
            });
            printObserver.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        } else {
            // Only add mascot reactions on allowed pages
            const printButtons = document.querySelectorAll('.rnr-b-print, button[onclick*="print"], .tm-print-page-btn');
            printButtons.forEach(btn => {
                if (!btn.hasAttribute('data-tm-print-listener')) {
                    btn.setAttribute('data-tm-print-listener', 'true');
            btn.addEventListener('click', () => {
                const messages = [
                    'Εκτύπωση! 🖨️', 'Print time!', 'Τυπώνουμε!',
                    'Printer go brrrr!', 'Χαρτί!', 'Printing!'
                ];
                window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2500);
            });
                }
        });
        }
        
        // Watch for delete/remove actions
        const deleteButtons = document.querySelectorAll('button[onclick*="delete"], button[onclick*="remove"], .rnr-b-delete');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const messages = [
                    'Προσοχή!', 'Careful!', 'Σίγουρα;',
                    'Delete;', 'Διαγραφή!', 'Watch out!'
                ];
                window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2000);
                window.setMascotState?.(config, 'surprised', 2000);
            });
        });
        
        // Watch for form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                const messages = [
                    'Στέλνουμε!', 'Submitting!', 'Πάμε!',
                    'Let\'s go!', 'Done!', 'Sent!'
                ];
                window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2000);
            });
        });

        // === MUTATION OBSERVER FOR DYNAMIC CONTENT ===
        const observer = new MutationObserver(mutations => {
            // Check if we're on an allowed order edit page
            // Only allow on: srvorders_edit.php and sparepartstoorder_edit.php
            // Explicitly exclude: service_edit.php (repair edit page)
            // Use pathname instead of full URL since editid1 appears in all URLs
            const currentPathname = window.location.pathname;
            const isServiceEditPage = currentPathname.includes('service_edit.php');
            const isAllowedOrderEditPage = (currentPathname.includes('srvorders_edit.php') || 
                                           currentPathname.includes('sparepartstoorder_edit.php')) &&
                                          !isServiceEditPage;
            
            // Hide any newly added print buttons if not on allowed page or if on service_edit.php
            if (!isAllowedOrderEditPage || isServiceEditPage) {
                const newPrintButtons = document.querySelectorAll('.rnr-b-print, button[onclick*="print"], .tm-print-page-btn, a.tm-print-page-btn, .rnr-button.tm-print-page-btn');
                newPrintButtons.forEach(btn => {
                    btn.style.display = 'none';
                });
            }
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType !== Node.ELEMENT_NODE) return;
                        
                        // --- Hide print buttons if not on allowed page or if on service_edit.php ---
                        if (!isAllowedOrderEditPage || isServiceEditPage) {
                            if (node.classList && (node.classList.contains('rnr-b-print') || node.classList.contains('tm-print-page-btn') || (node.onclick && node.onclick.toString().includes('print')))) {
                                node.style.display = 'none';
                            }
                            // Also check for print buttons within the added node
                            const printBtnsInNode = node.querySelectorAll && node.querySelectorAll('.rnr-b-print, button[onclick*="print"], .tm-print-page-btn, a.tm-print-page-btn, .rnr-button.tm-print-page-btn');
                            if (printBtnsInNode) {
                                printBtnsInNode.forEach(btn => {
                                    btn.style.display = 'none';
                                });
                            }
                        }

                        // --- Check for Success Messages ---
                        const isSuccess = node.classList.contains('message_success') || node.classList.contains('alert-success') || (node.innerText && node.innerText.toLowerCase().includes(' επιτυχ'));
                        if (isSuccess) {
                            const happyMessages = [
                                'Ναι ρε! 🎉', 'Μπράβο!', 'Εξαιρετικά!', 'Άψογα!', 
                                'Τέλειο!', 'Success!', 'Όλα καλά!', 'Γαμάτο!',
                                'Perfect!', 'Nice!', 'Ωραίος!', 'Let\'s go!'
                            ];
                            window.setMascotState?.(config, 'happy', 5000);
                            window.showMascotBubble?.(happyMessages[Math.floor(Math.random() * happyMessages.length)], 3000);
                            if (config.confettiEnabled) triggerConfetti(100);
                            return;
                        }

                        // --- Check for Error Messages ---
                        const isError = node.classList.contains('message_error') || node.classList.contains('alert-danger') || (node.innerText && (node.innerText.toLowerCase().includes('σφάλμα') || node.innerText.toLowerCase().includes('error')));
                        if (isError) {
                            const sadMessages = [
                                'Ωχ όχι ρε...', 'Τι έγινε;', 'Πρόβλημα!', 'Μμμ...', 
                                'Δεν πάει καλά...', 'Άου!', 'Μαλακία...', 'Χμμ...',
                                'Error ρε!', 'Fuck...', 'Τι έπαθε;', 'Shit happens...'
                            ];
                            window.setMascotState?.(config, 'sad', 5000);
                            window.showMascotBubble?.(sadMessages[Math.floor(Math.random() * sadMessages.length)], 3000);
                            // A small, sad shake animation
                            mascotContainer.style.animation = 'tm-mascot-startled 0.5s ease-out';
                            setTimeout(() => { mascotContainer.style.animation = ''; }, 500);
                            return;
                        }
                    });
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Initializes global keyboard shortcuts for productivity.
     */
    function initKeyboardShortcuts() {
        // Respect master toggle
        if (config?.scriptEnabled === false) return;
        
        const isEditableTarget = (el) => {
            if (!el) return false;
            const tag = (el.tagName || '').toLowerCase();
            return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
        };
        
        const matchesShortcut = (e, keyChar) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return false; // Shift-only — no other modifiers
            const key = (e.key || '').toLowerCase();
            const code = (e.code || '').toLowerCase();
            const capsOn = typeof e.getModifierState === 'function' && e.getModifierState('CapsLock');
            const shifted = e.shiftKey || capsOn;
            return shifted && (key === keyChar || code === `key${keyChar}`);
        };
        
        const handler = (e) => {
            if (e.repeat) return;
            if (isEditableTarget(e.target)) return;
            
            // Shift + F → Advanced Search (only if enabled)
            if (matchesShortcut(e, 'f') && config?.searchFeatureEnabled) {
                const btn = document.getElementById('tm-search-btn');
                if (btn) {
                    e.preventDefault();
                    btn.click();
                } else if (config?.debugEnabled) {
                    console.log('[MMS] Shortcut: Search button not found (tm-search-btn).');
                }
                return;
            }
            
            // Shift + S → Scratchpad (only if enabled)
            if (matchesShortcut(e, 's') && config?.scratchpadEnabled) {
                const btn = document.getElementById('tm-scratchpad-toggle-btn');
                if (btn) {
                    e.preventDefault();
                    btn.click();
                } else if (config?.debugEnabled) {
                    console.log('[MMS] Shortcut: Scratchpad toggle button not found (tm-scratchpad-toggle-btn).');
                }
                return;
            }
        };
        
        // Attach on both capture and bubble to fight site handlers
        window.addEventListener('keydown', handler, true);
        document.addEventListener('keydown', handler, false);
        
        if (config?.debugEnabled) {
            console.log('[MMS] Keyboard shortcuts initialized (Shift+F Search, Shift+S Scratchpad).');
        }
    }

    // ===================================================================
    // === 8a. FEATURE: AUTOMATED PARTS SEARCH SIDEBAR
    // ===================================================================
    /**
     * On repair pages, automatically searches for common parts for the detected
     * device model and displays them in a non-intrusive sidebar.
     */
    function initAutomatedPartsSearch() {
        // Only run on service edit pages and if the feature is enabled // Pass config
        if (!config.automatedPartsSearchEnabled || !window.location.pathname.includes('/mymanagerservice/service_edit.php')) {
            return;
        }

        const deviceModel = getPhoneModelFromPage();
        if (!deviceModel) {
            console.log('[MMS Parts Search] No device model detected on this page. Aborting.');
            return;
        }

        console.log(`[MMS Parts Search] Detected model: "${deviceModel}". Initializing sidebar.`);

        // 1. Create the Sidebar UI
        const sidebar = document.createElement('div');
        sidebar.id = 'tm-auto-parts-sidebar';
        sidebar.innerHTML = `
            <div id="tm-auto-parts-header">
                <span id="tm-auto-parts-title">Suggested Parts</span>
                <button id="tm-auto-parts-close">&times;</button>
            </div>
            <div id="tm-auto-parts-content"></div>
        `;
        document.body.appendChild(sidebar);

        sidebar.querySelector('#tm-auto-parts-close').addEventListener('click', () => sidebar.remove());

        const contentContainer = sidebar.querySelector('#tm-auto-parts-content');

        // 2. Perform searches for each common part
        config.quickSearchButtons.forEach(part => {
            const searchTerm = `${deviceModel} ${part.term}`;
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'tm-parts-category';
            categoryDiv.innerHTML = `
                <div class="tm-parts-category-title">${part.label}</div>
                <div class="tm-parts-loading">Searching...</div>
                <ul class="tm-parts-list"></ul>
            `;
            contentContainer.appendChild(categoryDiv);

            const searchUrl = `/mymanagerservice/products_list.php?qs=${encodeURIComponent(searchTerm)}`;

            GM_xmlhttpRequest({
                method: 'GET',
                url: searchUrl,
                onload: function(response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    // The results table can be inside different containers. Let's make the selector more robust.
                    // It's usually the first major grid table on the page.
                    const gridTable = doc.querySelector('.rnr-c-grid table.rnr-b-grid, table.rnr-b-grid');
                    const list = categoryDiv.querySelector('.tm-parts-list');

                    categoryDiv.querySelector('.tm-parts-loading').style.display = 'none';

                    if (!gridTable) {
                        categoryDiv.innerHTML += '<div class="tm-parts-not-found">Error: Could not find data table.</div>';
                        return;
                    }

                    // Dynamically find the description column index
                    const headers = Array.from(gridTable.querySelectorAll('thead th')).map(th => th.innerText.trim());
                    const descriptionIndex = headers.findIndex(h => h.includes('Περιγραφή') || h.includes('Description'));

                    

                    const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"]');
                    if (rows.length === 0 || descriptionIndex === -1) {
                        categoryDiv.innerHTML += '<div class="tm-parts-not-found">No results found.</div>';
                    } else {
                        rows.forEach(row => {
                            const link = row.querySelector('a[href*="products_edit.php"]');
                            const description = row.cells[descriptionIndex]?.innerText.trim();
                            if (link && description) {
                                list.innerHTML += `<li class="tm-parts-list-item"><a href="${link.href}" target="_blank">${description}</a></li>`;
                            }
                        });
                    }
                }
            });
        });
    }

    // ===================================================================
    // === WEATHER WIDGET
    // ===================================================================
    // Weather widget functions have been moved to myman_weather.js
    // The widget is initialised via window.initWeatherWidget (exported by that module).
    
    // ===================================================================
    // === NEW FEATURES: BUTTONS INITIALIZER
    // ===================================================================
    function addNewFeatureButtons(parentContainer, config, STORAGE_KEYS) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;
        
        // Helper function to create feature button
        function createFeatureButton(icon, title, gradient, onClick) {
            const btn = document.createElement('button');
            btn.innerHTML = icon;
            btn.title = title;
            btn.style.cssText = `
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
                width: 40px;
                height: 40px;
                padding: 0;
                border-radius: 12px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            // Add gradient overlay on hover
            btn.addEventListener('mouseenter', () => {
                btn.style.background = `linear-gradient(135deg, ${gradient})`;
                btn.style.backdropFilter = 'blur(10px)';
                btn.style.webkitBackdropFilter = 'blur(10px)';
                btn.style.transform = 'translateY(-3px) scale(1.05)';
                btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                btn.style.borderColor = 'rgba(255,255,255,0.4)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)';
                btn.style.backdropFilter = 'blur(10px)';
                btn.style.webkitBackdropFilter = 'blur(10px)';
                btn.style.transform = 'translateY(0) scale(1)';
                btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                btn.style.borderColor = 'rgba(255,255,255,0.2)';
            });
            btn.addEventListener('click', onClick);
            return btn;
        }
        
        // Talent Tree: moved to Personal Dashboard → 🌟 Talents tab (see myman_gamification.js showDashboardModal)
        
        // Technician Stats button (only show on service list page, if enabled, and if required columns exist)
        if (config.technicianStatsEnabled && window.location.pathname.includes('/mymanagerservice/service_list.php')) {
            // Function to check and add/remove button based on column availability
            const checkAndUpdateButton = () => {
                // Find existing button
                const existingBtn = buttonContainer.querySelector('[title="Στατιστικά Τεχνικών"]');
                
                // Check if function is available
                if (typeof window.checkTechnicianStatsColumnsAvailable !== 'function') {
                    // If function not available yet but we're on the right page, show button anyway
                    // The actual scraping will handle errors gracefully
                    if (!existingBtn) {
                        const techStatsBtn = createFeatureButton(
                            '📊', 'Στατιστικά Τεχνικών', '#4caf50 0%, #2e7d32 100%',
                            () => {
                                if (typeof window.initTechnicianStatsFeature === 'function') {
                                    window.initTechnicianStatsFeature();
                                } else {
                                    console.error('[MMS] Technician Stats feature function not found.');
                                    if (window.showPositiveMessage) {
                                        window.showPositiveMessage('❌ Technician Stats feature not available.');
                                    }
                                }
                            }
                        );
                        buttonContainer.appendChild(techStatsBtn);
                        // Ensure container is appended to parent if not already
                        if (!parentContainer.contains(buttonContainer)) {
                            parentContainer.appendChild(buttonContainer);
                        }
                        console.log('[MMS] Technician Stats button added (check function not available yet, will verify on click).');
                    }
                    return;
                }
                
                // Check if required columns exist
                const columnsAvailable = window.checkTechnicianStatsColumnsAvailable();
                
                if (columnsAvailable) {
                    // If columns are available and button doesn't exist, create it
                    if (!existingBtn) {
                        const techStatsBtn = createFeatureButton(
                            '📊', 'Στατιστικά Τεχνικών', '#4caf50 0%, #2e7d32 100%',
                            () => {
                                if (typeof window.initTechnicianStatsFeature === 'function') {
                                    window.initTechnicianStatsFeature();
                                } else {
                                    console.error('[MMS] Technician Stats feature function not found.');
                                    if (window.showPositiveMessage) {
                                        window.showPositiveMessage('❌ Technician Stats feature not available.');
                                    }
                                }
                            }
                        );
                        buttonContainer.appendChild(techStatsBtn);
                        // Ensure container is appended to parent if not already
                        if (!parentContainer.contains(buttonContainer)) {
                            parentContainer.appendChild(buttonContainer);
                            console.log('[MMS] Button container appended to parent container.');
                        }
                        // Verify button is in DOM
                        const btnInDOM = document.body.contains(techStatsBtn) || parentContainer.contains(techStatsBtn);
                        console.log('[MMS] Technician Stats button added - columns found. Button in DOM:', btnInDOM, 'Container in parent:', parentContainer.contains(buttonContainer), 'Container children:', buttonContainer.children.length);
                    }
                } else {
                    // If columns are not available and button exists, remove it
                    if (existingBtn) {
                        existingBtn.remove();
                        console.log('[MMS] Technician Stats button removed - required columns not found.');
                    }
                }
            };
            
            // Try immediately
            checkAndUpdateButton();
            
            // Also try after delays in case table loads dynamically or function loads later
            setTimeout(checkAndUpdateButton, 500);
            setTimeout(checkAndUpdateButton, 1000);
            setTimeout(checkAndUpdateButton, 2000);
            setTimeout(checkAndUpdateButton, 3000);
        }
        
        // Order History button (only show on order list pages and if enabled)
        const currentPath = window.location.pathname;
        const isOrderListPage = currentPath.includes('srvorders_list.php') || 
                                currentPath.includes('sparepartstoorder_list.php');
        
        if (isOrderListPage && config.orderHistoryEnabled && typeof window.showOrderHistoryModal === 'function') {
            const orderHistoryBtn = createFeatureButton(
                '📋', 'Order History', '#2196f3 0%, #1976d2 100%',
                () => {
                    if (typeof window.showOrderHistoryModal === 'function') {
                        window.showOrderHistoryModal();
                    }
                }
            );
            orderHistoryBtn.id = 'tm-order-history-btn';
            buttonContainer.appendChild(orderHistoryBtn);
        }
        
        // Append container to parent if it has children (but also check after delays for tech stats button)
        if (buttonContainer.children.length > 0) {
            if (!parentContainer.contains(buttonContainer)) {
            parentContainer.appendChild(buttonContainer);
            }
        }
    }
    
    // ===================================================================
    // === MENU ITEM VISIBILITY MANAGER
    // ===================================================================
    
    // Global helper function to manually clear hidden menu items (can be called from console)
    window.clearHiddenMenuItems = function() {
        GM_setValue(STORAGE_KEYS.HIDDEN_MENU_ITEMS, '[]');
        console.log('[MMS] Hidden menu items cleared. Refresh the page.');
        if (window.showPositiveMessage) {
            window.showPositiveMessage('✓ Hidden menu items cleared. Please refresh the page.');
        }
    };
    
    // Global helper functions for status transfer counters
    window.checkStatusCounters = function() {
        const count40 = GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
        const count65 = GM_getValue(STORAGE_KEYS.STATUS_65_TRANSFERS, 0);
        const count100 = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
        console.log(`[MMS] Status Transfer Counters:`);
        console.log(`  📞 Status 40: ${count40}`);
        console.log(`  📦 Status 65 (Waiting for Parts): ${count65}`);
        console.log(`  ✅ Status 100: ${count100}`);
        return { status40: count40, status65: count65, status100: count100 };
    };
    
    window.resetStatusCounters = function() {
        GM_setValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
        GM_setValue(STORAGE_KEYS.STATUS_65_TRANSFERS, 0);
        GM_setValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
        console.log('[MMS] Status transfer counters reset to 0.');
        if (window.showPositiveMessage) {
            window.showPositiveMessage('✓ Status counters reset');
        }
        location.reload();
    };
    
    window.incrementStatus40 = function() {
        const count = GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
        GM_setValue(STORAGE_KEYS.STATUS_40_TRANSFERS, count + 1);
        console.log(`[MMS] Manual increment: Status 40 = ${count + 1}`);
        location.reload();
    };
    
    window.incrementStatus65 = function() {
        const count = GM_getValue(STORAGE_KEYS.STATUS_65_TRANSFERS, 0);
        GM_setValue(STORAGE_KEYS.STATUS_65_TRANSFERS, count + 1);
        console.log(`[MMS] Manual increment: Status 65 (Waiting for Parts) = ${count + 1}`);
        location.reload();
    };
    
    window.incrementStatus100 = function() {
        const count = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
        GM_setValue(STORAGE_KEYS.STATUS_100_TRANSFERS, count + 1);
        console.log(`[MMS] Manual increment: Status 100 = ${count + 1}`);
        location.reload();
    };
    
    // Global helper functions for recent repairs debugging
    window.checkRecentRepairs = function() {
        const repairs = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
        console.log(`[MMS] Recent Repairs (${repairs.length}):`);
        repairs.forEach((repair, index) => {
            const device = repair.deviceInfo || 'No device';
            const model = repair.modelInfo ? ` | ${repair.modelInfo}` : '';
            console.log(`  ${index + 1}. #${repair.id} - ${repair.customerName} - ${device}${model}`);
        });
        return repairs;
    };
    
    window.clearRecentRepairs = function() {
        GM_setValue(STORAGE_KEYS.RECENT_REPAIRS, '[]');
        console.log('[MMS] Recent repairs cleared.');
        location.reload();
    };
    
    window.manualTrackRepair = function() {
        console.log('[MMS] Manually triggering repair tracking...');
        trackRepairAccess(config, STORAGE_KEYS);
    };
    
    window.addTestRepair = function(id, name, device, model) {
        const repairId = id || '12345';
        const customerName = name || 'Test Customer';
        const deviceInfo = device || 'Test Device';
        const modelInfo = model || '';
        
        const repairEntry = {
            id: repairId,
            customerName: customerName,
            deviceInfo: deviceInfo,
            modelInfo: modelInfo,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        let recentRepairs = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
        recentRepairs = recentRepairs.filter(r => r.id !== repairId);
        recentRepairs.unshift(repairEntry);
        recentRepairs = recentRepairs.slice(0, 5);
        GM_setValue(STORAGE_KEYS.RECENT_REPAIRS, JSON.stringify(recentRepairs));
        
        console.log(`[MMS] Added test repair: #${repairId} - ${customerName}`);
        location.reload();
    };
    
    // Global helper to test mascot bubble (can be called from console)
    window.testMascotBubble = function(message) {
        const msg = message || 'Test message! Δοκιμή!';
        if (window.showMascotBubble) {
            window.showMascotBubble(msg, 3000);
        } else {
            console.error('[MMS Mascot] showMascotBubble not available!');
        }
    };

    // ===================================================================
    // === KEYBOARD SHORTCUT (always active)
    // ===================================================================
    // Shift+E to toggle script on/off (stealth mode - no notifications)
    document.addEventListener('keydown', (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            const currentState = GM_getValue(STORAGE_KEYS.SCRIPT_ENABLED, DEFAULTS.scriptEnabled);
            const newState = !currentState;
            GM_setValue(STORAGE_KEYS.SCRIPT_ENABLED, newState);
            
            // Silent mode - no notifications, just reload immediately
                location.reload();
        }
    });

    function trackRepairAccess(config, STORAGE_KEYS) {
        if (!config.recentRepairsEnabled) {
            console.log('[MMS] Recent Repairs tracking is disabled in config.');
            return;
        }
        
        // Only track on repair edit pages
        const pathname = window.location.pathname;
        if (!pathname.includes('service_edit.php')) {
            console.log('[MMS] Not on repair edit page, skipping tracking. Path:', pathname);
            return;
        }
        
        console.log('[MMS] On repair edit page, attempting to track access...');
        console.log('[MMS] Current URL:', window.location.href);
        
        // Extract repair ID from URL - try multiple parameter names
        const urlParams = new URLSearchParams(window.location.search);
        
        // Log all URL parameters for debugging
        console.log('[MMS] All URL parameters:');
        for (const [key, value] of urlParams.entries()) {
            console.log(`  ${key} = ${value}`);
        }
        
        // Try common parameter names
        let repairId = urlParams.get('serviceID') || 
                      urlParams.get('id') || 
                      urlParams.get('ID') ||
                      urlParams.get('iServiceID') ||
                      urlParams.get('service_id') ||
                      urlParams.get('repairId') ||
                      urlParams.get('repair_id');
        
        // If still not found, try to extract from page title or heading
        if (!repairId) {
            console.log('[MMS] Trying to extract ID from page title...');
            const pageTitle = document.title;
            // Match patterns like #ΙΗ-4353 or #12345 (Greek letters, numbers, hyphens)
            const titleMatch = pageTitle.match(/#([Α-ΩΑ-Ωα-ωA-Za-z0-9\-]+)/);
            if (titleMatch) {
                repairId = titleMatch[1];
                console.log('[MMS] ✅ Found ID in page title:', repairId);
            }
        }
        
        // Try to get from page heading elements
        if (!repairId) {
            console.log('[MMS] Trying to extract ID from page heading...');
            const heading = document.querySelector('h1, h2, .page-title, .pagetitle');
            if (heading) {
                const headingMatch = heading.textContent.match(/#([Α-ΩΑ-Ωα-ωA-Za-z0-9\-]+)/);
                if (headingMatch) {
                    repairId = headingMatch[1];
                    console.log('[MMS] ✅ Found ID in heading:', repairId);
                }
            }
        }
        
        console.log('[MMS] Final extracted repair ID:', repairId);
        
        if (!repairId) {
            console.warn('[MMS] ⚠️ No repair ID found in URL or page. Cannot track.');
            console.warn('[MMS] 📋 Please send me:');
            console.warn('[MMS]   1. The full URL');
            console.warn('[MMS]   2. All URL parameters shown above');
            console.warn('[MMS]   3. Page title:', document.title);
            return;
        }
        
        // Get customer name from page - try specific selectors in priority order
        let customerName = 'Άγνωστος Πελάτης';
        let customerField = null;
        
        console.log('[MMS] Looking for customer name field...');
        
        // Try selectors in priority order (check each one individually)
        const customerSelectors = [
            '#value_strCustomer_1',
            'input[name="value_strCustomer_1"]',
            '[id^="value_strCustomer"]',
            'div[data-fieldname="strCustomerName"] input',
            'div[data-fieldname="strClientName"] input',
            'input[name="strCustomerName"]',
            'input[name="strClientName"]',
            '#edit1_strCustomer_0',  // Check empty span LAST
        ];
        
        // Try each selector until we find one with a value
        for (const selector of customerSelectors) {
            const field = document.querySelector(selector);
            if (field) {
                const value = field.value || field.textContent || field.innerText;
                if (value && value.trim()) {
                    customerField = field;
                    customerName = value.trim();
                    console.log('[MMS] ✅ Found customer name via', selector, ':', customerName);
                    break; // Stop searching
                } else {
                    console.log('[MMS] Found field', selector, 'but it\'s empty, trying next...');
                }
            }
        }
        
        if (!customerField || !customerName || customerName === 'Άγνωστος Πελάτης') {
            console.warn('[MMS] ⚠️ No customer name found with value. Using default.');
        }
        
        // Get device info - try specific selectors in priority order
        let deviceInfo = '';
        
        const deviceSelectors = [
            '#value_strProductName_1',
            'input[name="value_strProductName_1"]',
            '[id^="value_strProductName"]',
            'div[data-fieldname="strProductName"] input',
            'div[data-fieldname="strDeviceDescription"] input',
            'input[name="strProductName"]',
            'input[name="strDeviceDescription"]',
            '[id^="edit1_strProductName"]',  // Check edit field LAST
        ];
        
        // Try each selector until we find one with a value
        for (const selector of deviceSelectors) {
            const field = document.querySelector(selector);
            if (field) {
                const value = field.value || field.textContent || field.innerText;
                if (value && value.trim()) {
                    deviceInfo = value.trim();
                    console.log('[MMS] ✅ Found device info via', selector, ':', deviceInfo);
                    break;
                }
            }
        }
        
        if (!deviceInfo) {
            console.log('[MMS] Device info field not found (optional)');
        }
        
        // Get model from page title (between square brackets)
        let modelInfo = '';
        
        const pageTitle = document.title;
        const modelMatch = pageTitle.match(/\[([^\]]+)\]/);
        if (modelMatch && modelMatch[1]) {
            modelInfo = modelMatch[1].trim();
            console.log('[MMS] ✅ Found model from title:', modelInfo);
        } else {
            console.log('[MMS] No model found in title brackets');
            
            // Fallback: try form fields
            const modelSelectors = [
                '#value_strDeviceDescription_1',
                'input[name="value_strDeviceDescription_1"]',
                '[id^="value_strDeviceDescription"]',
                'div[data-fieldname="strDeviceDescription"] input',
                'input[name="strDeviceDescription"]',
                '[id^="edit1_strDeviceDescription"]',
            ];
            
            for (const selector of modelSelectors) {
                const field = document.querySelector(selector);
                if (field) {
                    const value = field.value || field.textContent || field.innerText;
                    if (value && value.trim()) {
                        modelInfo = value.trim();
                        console.log('[MMS] ✅ Found model info via', selector, ':', modelInfo);
                        break;
                    }
                }
            }
        }
        
        // Capture current repair status
        let repairStatus = null;
        const statusBadges = document.querySelectorAll('.statusbadge');
        for (const badge of statusBadges) {
            if (badge.closest('.rnr-buttons-left') || badge.closest('.rnr-b-editbuttons')) continue;
            const m = (badge.textContent || badge.innerText || '').match(/^\s*(\d+)/);
            if (m) { repairStatus = m[1]; break; }
        }
        if (!repairStatus) {
            const statusSel = document.querySelector(
                'select[name="value_ccc_iStatusID_1"], select[id="value_ccc_iStatusID_1"], select[name="iStatusID"]'
            );
            if (statusSel && statusSel.value) repairStatus = statusSel.value;
        }

        // Create repair entry
        const repairEntry = {
            id: repairId,
            customerName: customerName,
            deviceInfo: deviceInfo,
            modelInfo: modelInfo,
            status: repairStatus,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        // Get existing history
        let recentRepairs = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
        
        // Remove duplicate if exists
        recentRepairs = recentRepairs.filter(r => r.id !== repairId);
        
        // Add to beginning
        recentRepairs.unshift(repairEntry);
        
        // Keep only max items
        recentRepairs = recentRepairs.slice(0, config.recentRepairsMaxItems);
        
        // Save
        GM_setValue(STORAGE_KEYS.RECENT_REPAIRS, JSON.stringify(recentRepairs));
        
        console.log('[MMS] Tracked repair access:', repairId, customerName);
    }
    
    // ── Quick View buttons on the repair list table ──────────────────────────
    function initRepairListQuickView() {
        // Only run on pages that have the repairs grid
        if (!document.querySelector('tr.rnr-row[data-href]')) return;

        // Inject button styles once
        if (!document.getElementById('tm-qv-row-styles')) {
            const s = document.createElement('style');
            s.id = 'tm-qv-row-styles';
            s.textContent = `
                .tm-qv-row-btn {
                    display: inline-flex; align-items: center; justify-content: center;
                    margin-top: 4px;
                    width: 26px; height: 22px;
                    background: rgba(79,172,254,0.13);
                    border: 1px solid rgba(79,172,254,0.32);
                    border-radius: 6px;
                    color: #4facfe;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.1s;
                    vertical-align: middle;
                    line-height: 1;
                    padding: 0;
                }
                .tm-qv-row-btn:hover {
                    background: rgba(79,172,254,0.28);
                    transform: scale(1.12);
                }
            `;
            document.head.appendChild(s);
        }

        const injected = new Set();

        function injectButtons() {
            document.querySelectorAll('tr.rnr-row[data-href]').forEach(row => {
                const href = row.getAttribute('data-href');
                if (!href || injected.has(row)) return;
                injected.add(row);

                const cell = row.querySelector('td.rnr-nowrap');
                if (!cell) return;

                // Remove the native details link
                cell.querySelector('a[data-icon="details"]')?.remove();

                const absUrl = new URL(href, window.location.href).href;

                const btn = document.createElement('button');
                btn.className = 'tm-qv-row-btn';
                btn.title = 'Γρήγορη Προβολή';
                btn.textContent = '👁';

                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    e.preventDefault();
                    openRepairQuickView(absUrl);
                });

                cell.appendChild(btn);
            });
        }

        injectButtons();

        // Watch for rows added by pagination / filtering
        const tbody = document.querySelector('tbody');
        if (tbody) {
            new MutationObserver(injectButtons).observe(tbody, { childList: true, subtree: true });
        }
    }

    function openRepairQuickView(url) {
        document.getElementById('tm-quickview-modal')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tm-quickview-modal';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 999999;
            background: rgba(0,0,0,0.72);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            animation: tm-qv-in 0.18s ease;
        `;

        overlay.innerHTML = `
            <style>
                @keyframes tm-qv-in {
                    from { opacity: 0; transform: scale(0.97); }
                    to   { opacity: 1; transform: scale(1); }
                }
                #tm-quickview-modal .tm-qv-shell {
                    position: relative;
                    width: 94vw; height: 90vh;
                    max-width: 1300px;
                    display: flex; flex-direction: column;
                    border-radius: 18px;
                    overflow: hidden;
                    background: var(--tm-bg-color, #1a1a2e);
                    border: 1px solid rgba(255,255,255,0.12);
                    box-shadow: 0 32px 80px rgba(0,0,0,0.7);
                }
                #tm-quickview-modal .tm-qv-bar {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.04);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    flex-shrink: 0;
                }
                #tm-quickview-modal .tm-qv-title {
                    flex: 1; font-size: 13px; font-weight: 600;
                    color: rgba(255,255,255,0.6);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                #tm-quickview-modal .tm-qv-btn {
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.14);
                    color: rgba(255,255,255,0.75);
                    border-radius: 8px;
                    padding: 5px 12px;
                    font-size: 12px; font-weight: 600;
                    cursor: pointer; white-space: nowrap;
                    transition: background 0.15s;
                }
                #tm-quickview-modal .tm-qv-btn:hover {
                    background: rgba(255,255,255,0.14);
                }
                #tm-quickview-modal .tm-qv-btn.primary {
                    background: rgba(79,172,254,0.15);
                    border-color: rgba(79,172,254,0.35);
                    color: #4facfe;
                }
                #tm-quickview-modal .tm-qv-btn.primary:hover {
                    background: rgba(79,172,254,0.28);
                }
                #tm-quickview-modal .tm-qv-loader {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 14px; color: rgba(255,255,255,0.35);
                    font-size: 13px; pointer-events: none;
                    background: var(--tm-bg-color, #1a1a2e);
                    z-index: 2;
                    transition: opacity 0.3s;
                }
                #tm-quickview-modal .tm-qv-spinner {
                    width: 36px; height: 36px;
                    border: 3px solid rgba(79,172,254,0.2);
                    border-top-color: #4facfe;
                    border-radius: 50%;
                    animation: tm-qv-spin 0.7s linear infinite;
                }
                @keyframes tm-qv-spin { to { transform: rotate(360deg); } }
                #tm-quickview-modal iframe {
                    flex: 1; width: 100%; border: none;
                    background: #fff;
                }
            </style>
            <div class="tm-qv-shell">
                <div class="tm-qv-bar">
                    <span class="tm-qv-title">⏳ Φόρτωση…</span>
                    <button class="tm-qv-btn primary" id="tm-qv-open">↗ Άνοιγμα</button>
                    <button class="tm-qv-btn" id="tm-qv-close">✕ Κλείσιμο</button>
                </div>
                <div style="position:relative;flex:1;display:flex;flex-direction:column;min-height:0;">
                    <div class="tm-qv-loader" id="tm-qv-loader">
                        <div class="tm-qv-spinner"></div>
                        <span>Φόρτωση σελίδας…</span>
                    </div>
                    <iframe id="tm-qv-iframe" src="${url + (url.includes('?') ? '&' : '?') + 'tm_quickview=1'}"></iframe>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const iframe  = overlay.querySelector('#tm-qv-iframe');
        const loader  = overlay.querySelector('#tm-qv-loader');
        const title   = overlay.querySelector('.tm-qv-title');

        iframe.addEventListener('load', () => {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 300);
            try {
                title.textContent = iframe.contentDocument?.title || url;
            } catch (_) {
                title.textContent = url;
            }
        });

        overlay.querySelector('#tm-qv-close').addEventListener('click', () => overlay.remove());
        overlay.querySelector('#tm-qv-open').addEventListener('click', () => {
            window.location.href = url;
            overlay.remove();
        });
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        // Esc to close
        const escHandler = e => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    }

    function initRecentRepairsDropdown(parentContainer, config, STORAGE_KEYS) {
        // Always create the button container, but hide it if disabled
        // This allows updateRecentRepairsButtonVisibility to show/hide it dynamically
        const dropdownContainer = document.createElement('div');
        dropdownContainer.id = 'tm-recent-repairs-dropdown';
        dropdownContainer.style.cssText = `
            position: relative;
            display: ${config.recentRepairsEnabled ? 'inline-block' : 'none'};
            margin: 0 8px;
        `;
        
        if (!config.recentRepairsEnabled) {
            console.log('[MMS] Recent Repairs feature is disabled.');
            parentContainer.appendChild(dropdownContainer);
            return;
        }
        
        console.log('[MMS] Initializing Recent Repairs dropdown...');
        
        // Get recent repairs
        const recentRepairs = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
        console.log('[MMS] Found', recentRepairs.length, 'recent repairs in storage.');
        
        // Update display style since container already exists
        dropdownContainer.style.display = 'inline-block';
        
        const dropdownButton = document.createElement('button');
        dropdownButton.id = 'tm-recent-repairs-btn';
        dropdownButton.innerHTML = `📋 Πρόσφατες (${recentRepairs.length})`;
        dropdownButton.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: var(--tm-primary-color);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        
        dropdownButton.addEventListener('mouseenter', () => {
            dropdownButton.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)';
            dropdownButton.style.backdropFilter = 'blur(10px)';
            dropdownButton.style.webkitBackdropFilter = 'blur(10px)';
            dropdownButton.style.transform = 'translateY(-3px) scale(1.05)';
            dropdownButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            dropdownButton.style.borderColor = 'rgba(255,255,255,0.4)';
        });
        
        dropdownButton.addEventListener('mouseleave', () => {
            dropdownButton.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)';
            dropdownButton.style.backdropFilter = 'blur(10px)';
            dropdownButton.style.webkitBackdropFilter = 'blur(10px)';
            dropdownButton.style.transform = 'translateY(0) scale(1)';
            dropdownButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            dropdownButton.style.borderColor = 'rgba(255,255,255,0.2)';
        });
        
        // Create dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.id = 'tm-recent-repairs-menu';
        dropdownMenu.style.cssText = `
            display: none;
            position: fixed;
            bottom: 55px;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.25);
            min-width: 350px;
            max-width: 450px;
            max-height: 450px;
            overflow-y: auto;
            z-index: 10000;
            font-size: 13px;
        `;
        
        // Populate menu (popup only uses theme vars via myman_styles.js)
        if (recentRepairs.length === 0) {
            dropdownMenu.innerHTML = `
                <div class="tm-recent-repairs-empty" style="padding: 20px; text-align: center;">
                    Δεν υπάρχουν πρόσφατες επισκευές
                </div>
            `;
        } else {
            let menuHTML = `
                <div class="tm-recent-repairs-header">
                    📋 Πρόσφατες Επισκευές
                </div>
                <div style="padding: 8px;">
            `;
            
            recentRepairs.forEach((repair, index) => {
                const timeAgo = getTimeAgo(repair.timestamp);
                
                // Build device info line - show both device and model if available
                let deviceLine = '';
                if (repair.deviceInfo || repair.modelInfo) {
                    const parts = [];
                    if (repair.deviceInfo) parts.push(repair.deviceInfo);
                    if (repair.modelInfo && repair.modelInfo !== repair.deviceInfo) parts.push(repair.modelInfo);
                    const fullText = parts.join(' | ');
                    deviceLine = fullText.substring(0, 50) + (fullText.length > 50 ? '...' : '');
                }
                
                menuHTML += `
                    <div class="tm-recent-repair-item" data-url="${repair.url}" style="
                        display: flex; align-items: center; gap: 8px;
                        padding: 10px;
                        border-bottom: 1px solid transparent;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border-radius: 4px;
                        margin-bottom: 4px;
                    ">
                        <div style="flex: 1; min-width: 0;">
                            <div class="tm-recent-repair-title" style="font-weight: 600; margin-bottom: 4px;">
                                #${repair.id} - ${repair.customerName}
                            </div>
                            ${deviceLine ? `<div class="tm-recent-repair-meta" style="font-size: 11px; margin-bottom: 2px;">${deviceLine}</div>` : ''}
                            <div class="tm-recent-repair-meta" style="font-size: 10px; margin-top: 4px;">
                                🕒 ${timeAgo}
                            </div>
                        </div>
                        <button class="tm-repair-quickview-btn" data-url="${repair.url}"
                            title="Γρήγορη Προβολή"
                            style="
                                flex-shrink: 0;
                                background: rgba(79,172,254,0.12);
                                border: 1px solid rgba(79,172,254,0.3);
                                color: #4facfe;
                                border-radius: 7px;
                                padding: 5px 9px;
                                font-size: 14px;
                                cursor: pointer;
                                transition: background 0.15s, transform 0.1s;
                                line-height: 1;
                            ">👁</button>
                    </div>
                `;
            });
            
            menuHTML += `
                </div>
                <div class="tm-recent-repairs-footer" style="padding: 10px; border-top: 1px solid transparent; text-align: center;">
                    <button id="tm-clear-recent-repairs" style="padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600;">
                        🗑️ Καθαρισμός Ιστορικού
                    </button>
                </div>
            `;
            
            dropdownMenu.innerHTML = menuHTML;
        }
        
        // Toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Position dropdown relative to button
                const buttonRect = dropdownButton.getBoundingClientRect();
                dropdownMenu.style.left = buttonRect.left + 'px';
            }
        });
        
        // Click on repair item to navigate (or quick-view)
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();

            // Quick View button
            const qvBtn = e.target.closest('.tm-repair-quickview-btn');
            if (qvBtn) {
                e.preventDefault();
                dropdownMenu.style.display = 'none';
                openRepairQuickView(qvBtn.getAttribute('data-url'));
                return;
            }

            // Normal click → navigate
            const repairItem = e.target.closest('.tm-recent-repair-item');
            if (repairItem) {
                const url = repairItem.getAttribute('data-url');
                window.location.href = url;
            }
        });
        
        // Clear recent repairs
        const clearBtn = dropdownMenu.querySelector('#tm-clear-recent-repairs');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Καθαρισμός όλου του ιστορικού πρόσφατων επισκευών;')) {
                    GM_setValue(STORAGE_KEYS.RECENT_REPAIRS, '[]');
                    dropdownMenu.style.display = 'none';
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage('✓ Το ιστορικό καθαρίστηκε');
                    }
                    // Reload to update counter
                    setTimeout(() => location.reload(), 1000);
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && !dropdownButton.contains(e.target)) {
            dropdownMenu.style.display = 'none';
            }
        });
        
        dropdownContainer.appendChild(dropdownButton);
        dropdownContainer.appendChild(dropdownMenu);
        parentContainer.appendChild(dropdownContainer);
        
        if (config?.debugEnabled) {
        console.log('[MMS] Recent Repairs dropdown initialized.');
        }
    }
    
    // Function to update recent repairs button visibility based on config
    function updateRecentRepairsButtonVisibility(config) {
        const recentRepairsDropdown = document.getElementById('tm-recent-repairs-dropdown');
        if (recentRepairsDropdown) {
            recentRepairsDropdown.style.display = config.recentRepairsEnabled ? 'inline-block' : 'none';
        }
    }
    
    // Make function globally accessible
    window.updateRecentRepairsButtonVisibility = updateRecentRepairsButtonVisibility;
    
    function updatePhoneCatalogButtonVisibility(config) {
        const phoneCatalogBtn = document.getElementById('tm-phone-catalog-btn');
        if (phoneCatalogBtn) {
            phoneCatalogBtn.style.display = config.phoneCatalogEnabled ? 'flex' : 'none';
            // Remove any inline background/color styles to let theme CSS handle it
            phoneCatalogBtn.style.background = '';
            phoneCatalogBtn.style.backgroundColor = '';
            phoneCatalogBtn.style.color = '';
        } else if (config.phoneCatalogEnabled) {
            // Button doesn't exist yet, try to create it
            setTimeout(() => {
                let rightSideContainer = document.getElementById('tm-search-container');
                if (!rightSideContainer) {
                    rightSideContainer = document.createElement('div');
                    rightSideContainer.id = 'tm-search-container';
                    rightSideContainer.style.cssText = 'position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
                    document.body.appendChild(rightSideContainer);
                }
                
                if (!document.getElementById('tm-phone-catalog-btn')) {
                    const phoneCatalogBtn = document.createElement('button');
                    phoneCatalogBtn.id = 'tm-phone-catalog-btn';
                    phoneCatalogBtn.className = 'tm-slide-out-btn';
                    phoneCatalogBtn.textContent = '📱 Phone Catalog';
                    phoneCatalogBtn.title = 'Phone Catalog';
                    // Clear any inline styles - theme CSS will handle styling
                    phoneCatalogBtn.style.background = '';
                    phoneCatalogBtn.style.backgroundColor = '';
                    phoneCatalogBtn.style.backgroundImage = '';
                    phoneCatalogBtn.style.color = '';
                    phoneCatalogBtn.addEventListener('click', () => {
                        if (typeof window.showPhoneListModal === 'function') {
                            window.showPhoneListModal();
                        }
                    });
                    rightSideContainer.appendChild(phoneCatalogBtn);
                }
            }, 100);
        }
    }
    
    // Make function globally accessible
    window.updatePhoneCatalogButtonVisibility = updatePhoneCatalogButtonVisibility;
    
    function updateOrderHistoryButtonVisibility(config) {
        const orderHistoryBtn = document.getElementById('tm-order-history-btn');
        if (orderHistoryBtn) {
            const currentPath = window.location.pathname;
            const isOrderListPage = currentPath.includes('srvorders_list.php') || 
                                    currentPath.includes('sparepartstoorder_list.php');
            // Only show if on order list page AND enabled
            orderHistoryBtn.style.display = (isOrderListPage && config.orderHistoryEnabled) ? 'flex' : 'none';
        }
    }
    
    // Make function globally accessible
    window.updateOrderHistoryButtonVisibility = updateOrderHistoryButtonVisibility;
    
    // ===================================================================
    // === FEATURE: REPAIR AGE INDICATOR
    // ===================================================================
    
    /**
     * Add age indicators to repairs in the service list
     */
    function initRepairAgeIndicator(config) {
        if (!config.repairAgeIndicatorEnabled) {
            console.log('[MMS] Repair Age Indicator is disabled.');
            return;
        }
        
        // Only run on service list pages
        if (!window.location.pathname.includes('service_list.php')) {
            return;
        }
        
        console.log('[MMS] Initializing Repair Age Indicator...');
        
        // Wait for table to load
        setTimeout(() => {
            const gridTable = document.querySelector('table.rnr-b-grid');
            if (!gridTable) {
                console.log('[MMS] Grid table not found for Age Indicator.');
                return;
            }
            
            // Find the date column (usually "Ημ/νία")
            const headers = Array.from(gridTable.querySelectorAll('thead th'));
            const dateIndex = headers.findIndex(th => {
                const text = th.innerText.trim();
                return text.includes('Ημ/νία') || text.includes('Ημερομηνία') || text.includes('Date');
            });
            
            if (dateIndex === -1) {
                console.log('[MMS] Date column not found for Age Indicator.');
                return;
            }
            
            console.log('[MMS] Age Indicator: Found date column at index', dateIndex);
            
            // Process each row
            const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"]');
            let processedCount = 0;
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const dateCell = cells[dateIndex];
                
                if (!dateCell) return;
                
                // Extract date from cell
                const dateText = dateCell.innerText.trim();
                const ageInfo = calculateRepairAge(dateText);
                
                if (!ageInfo) return;
                
                // Add age indicator as a badge
                const ageBadge = document.createElement('span');
                ageBadge.className = 'tm-age-indicator';
                ageBadge.textContent = ageInfo.label;
                ageBadge.title = `Παλαιότητα: ${ageInfo.days} ${ageInfo.days === 1 ? 'μέρα' : 'μέρες'}`;
                ageBadge.style.cssText = `
                    display: inline-block;
                    padding: 2px 8px;
                    margin-left: 6px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 700;
                    color: white;
                    background: ${ageInfo.color};
                    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                    vertical-align: middle;
                `;
                
                // Add glow effect for old repairs
                if (ageInfo.days >= 10) {
                    ageBadge.style.animation = 'tmPulse 2s infinite';
                }
                
                dateCell.appendChild(ageBadge);
                
                // Also add background color to the entire row for visibility
                row.style.background = ageInfo.rowBg;
                
                processedCount++;
            });
            
            console.log(`[MMS] Age Indicator: Processed ${processedCount} rows.`);
            
        }, 800); // Delay to ensure table is fully rendered
    }
    
    /**
     * Calculate repair age from date string
     */
    function calculateRepairAge(dateText) {
        if (!dateText) return null;
        
        try {
            // Parse Greek date format (dd/mm/yyyy)
            const dateParts = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (!dateParts) return null;
            
            const day = parseInt(dateParts[1]);
            const month = parseInt(dateParts[2]) - 1; // JS months are 0-indexed
            const year = parseInt(dateParts[3]);
            
            const repairDate = new Date(year, month, day);
            const now =  new Date();
            
            // Calculate days difference
            const diffTime = now - repairDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            // Determine color and label based on age
            let color, label, rowBg;
            
            if (diffDays <= 2) {
                // Green: Fresh (0-2 days)
                color = '#28a745';
                label = '🟢 Νέα';
                rowBg = 'rgba(40, 167, 69, 0.05)';
            } else if (diffDays <= 5) {
                // Yellow: Recent (3-5 days)
                color = '#ffc107';
                label = '🟡 Πρόσφατη';
                rowBg = 'rgba(255, 193, 7, 0.08)';
            } else if (diffDays <= 10) {
                // Orange: Aging (6-10 days)
                color = '#fd7e14';
                label = '🟠 Παλιά';
                rowBg = 'rgba(253, 126, 20, 0.1)';
            } else {
                // Red: Old (10+ days)
                color = '#dc3545';
                label = `🔴 ${diffDays}μ`;
                rowBg = 'rgba(220, 53, 69, 0.12)';
            }
            
            return {
                days: diffDays,
                color: color,
                label: label,
                rowBg: rowBg
            };
            
        } catch (e) {
            console.error('[MMS] Error parsing date:', dateText, e);
            return null;
        }
    }

    // ===================================================================
    // === 8. SCRIPT INITIALIZER (SAFE EXECUTION)
    // ===================================================================
    
    // ===================================================================
    // === COMMENT FORM INTERFERENCE PREVENTION
    // ===================================================================
    
    // System to prevent script overlays from interfering with native comment form creation
    const COMMENT_FORM_MANAGER = {
        enabled: false, // Disable comment form detection to avoid overhead unless explicitly enabled
        isFormCreating: GM_getValue('TM_FORM_CREATING', false),
        overlaysHidden: false,
        originalOverlayStates: new Map(),
        debugMode: false, // Disable verbose debugging by default to avoid slowdown
        isWaitingForForm: false, // Guard to prevent multiple simultaneous waits
        
        // Persistent state management
        setFormCreating: function(value) {
            this.isFormCreating = value;
            GM_setValue('TM_FORM_CREATING', value);
            if (this.debugMode) {
                console.log('[MMS Debug] Set persistent form creating state:', value);
            }
        },
        
        // Check if we should delay script initialization
        shouldDelayInitialization: function() {
            const isFormCreating = GM_getValue('TM_FORM_CREATING', false);
            const hasCommentForm = document.querySelector('textarea[id*="value_strNotes_"]');
            
            if (this.debugMode && isFormCreating) {
                console.log('[MMS Debug] Form creation in progress, checking if we should delay...');
                console.log('[MMS Debug] Has comment form:', !!hasCommentForm);
            }
            
            return isFormCreating && !hasCommentForm;
        },
        
        // Clear persistent state when form is detected
        clearFormCreating: function() {
            this.setFormCreating(false);
            if (this.debugMode) {
                console.log('[MMS Debug] Cleared persistent form creating state');
            }
        },
        
        // Detect comment form JSON in AJAX responses
        detectCommentFormJSON: function(responseText) {
            // Short-circuit if the feature is disabled
            if (!this.enabled) return false;
            try {
                if (typeof responseText !== 'string') return false;
                
                // Skip very large responses to prevent hangs (limit to 500KB)
                const MAX_RESPONSE_SIZE = 500 * 1024;
                if (responseText.length > MAX_RESPONSE_SIZE) {
                    if (this.debugMode) {
                        console.log('[MMS Debug] Skipping large response:', responseText.length, 'bytes');
                    }
                    return false;
                }
                
                if (this.debugMode) {
                    console.log('[MMS Debug] Checking response for comment form patterns...');
                    console.log('[MMS Debug] Response length:', responseText.length);
                    console.log('[MMS Debug] Response preview:', responseText.substring(0, 200) + '...');
                }
                
                // Look for the specific JSON pattern that indicates comment form creation
                const patterns = [
                    '"srvnotes"',
                    '"strNotes"',
                    '"editFormat":"Text area"',
                    'value_strNotes_',
                    '"strCaption":"\\u0395\\u03c3\\u03c9\\u03c4\\u03b5\\u03c1\\u03b9\\u03ba\\u03ac \\u03a3\\u03c7\\u03cc\\u03bb\\u03b9\\u03b1"'
                ];
                
                // Use a single pass instead of multiple .includes() calls
                let matchFound = false;
                for (let i = 0; i < patterns.length; i++) {
                    if (responseText.indexOf(patterns[i]) !== -1) {
                        matchFound = true;
                        break;
                    }
                }
                
                if (this.debugMode) {
                    const matchResults = patterns.map(pattern => ({
                        pattern,
                        found: matchFound && responseText.indexOf(pattern) !== -1
                    }));
                    console.log('[MMS Debug] Pattern matching results:', matchResults);
                }
                
                if (this.debugMode && matchFound) {
                    console.log('[MMS Debug] ✓ Comment form JSON detected!');
                }
                
                return matchFound;
            } catch (error) {
                if (this.debugMode) {
                    console.log('[MMS Debug] Error in detection:', error);
                }
                return false;
            }
        },
        
        // Temporarily hide script overlays and disable interference
        hideOverlays: function() {
            if (this.overlaysHidden) return;
            
            if (this.debugMode) {
                console.log('[MMS Debug] Starting comprehensive overlay hiding...');
            }
            
            // Use specific selectors first (more efficient) before broad ones
            const specificSelectors = [
                '#tm-search-container',
                '#tm-scratchpad-container', 
                '#tm-settings-panel',
                '#tm-notification-panel',
                '#tm-notification-backdrop',
                '#tm-notification-fullscreen-overlay',
                // '#tm-footer-controls-container',  // Don't hide footer controls - contains Recent Repairs
                '#tm-disabled-badge',
                '#tm-mascot-container',
                '#tm-mascot-interaction-panel'
            ];
            
            // Use a Set to avoid hiding the same element multiple times
            const elementsToHide = new Set();
            
            // First, collect elements from specific selectors
            specificSelectors.forEach(selector => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        elementsToHide.add(element);
                    }
                } catch (e) {
                    // Ignore invalid selector errors
                }
            });
            
            // Then check for elements with tm- prefix (more targeted)
            try {
                const tmElements = document.querySelectorAll('[id^="tm-"]');
                tmElements.forEach(element => {
                    // Skip elements that should never be hidden
                    const neverHideIds = [
                        'tm-recent-repairs-dropdown',
                        'tm-recent-repairs-btn',
                        'tm-recent-repairs-menu'
                    ];
                    
                    if (element && !element.closest('form') && !neverHideIds.includes(element.id)) {
                        elementsToHide.add(element);
                    }
                });
            } catch (e) {
                // Ignore errors
            }
            
            let hiddenCount = 0;
            
            // Hide all collected elements
            elementsToHide.forEach(element => {
                try {
                    // Skip if element is part of the native page or already hidden
                    if (element && element.style.display !== 'none' && !element.closest('form')) {
                        this.originalOverlayStates.set(element, {
                            display: element.style.display || '',
                            visibility: element.style.visibility || '',
                            pointerEvents: element.style.pointerEvents || '',
                            zIndex: element.style.zIndex || '',
                            opacity: element.style.opacity || ''
                        });
                        
                        element.style.display = 'none';
                        element.style.pointerEvents = 'none';
                        element.style.zIndex = '-1';
                        element.style.opacity = '0';
                        hiddenCount++;
                    }
                } catch (e) {
                    // Ignore errors for individual elements
                }
            });
            
            // Also temporarily disable event listeners by adding a flag
            window.TM_COMMENT_FORM_CREATING = true;
            
            this.overlaysHidden = true;
            
            if (this.debugMode) {
                console.log(`[MMS Debug] Hidden ${hiddenCount} script elements`);
                console.log('[MMS Debug] Set TM_COMMENT_FORM_CREATING flag to disable event handlers');
            }
        },
        
        // Restore script overlays
        showOverlays: function() {
            if (!this.overlaysHidden) return;
            
            let restoredCount = 0;
            
            this.originalOverlayStates.forEach((originalState, element) => {
                if (element) {
                    element.style.display = originalState.display;
                    element.style.visibility = originalState.visibility;
                    element.style.pointerEvents = originalState.pointerEvents;
                    element.style.zIndex = originalState.zIndex;
                    element.style.opacity = originalState.opacity;
                    restoredCount++;
                }
            });
            
            // Remove the flag that disables event listeners
            window.TM_COMMENT_FORM_CREATING = false;
            
            this.originalOverlayStates.clear();
            this.overlaysHidden = false;
            
            if (this.debugMode) {
                console.log(`[MMS Debug] Restored ${restoredCount} script elements`);
                console.log('[MMS Debug] Cleared TM_COMMENT_FORM_CREATING flag');
            }
        },
        
        // Wait for comment form to be created and then restore overlays
        waitForFormAndRestore: function() {
            // Prevent multiple simultaneous waits
            if (this.isWaitingForForm) {
                if (this.debugMode) {
                    console.log('[MMS Debug] Already waiting for form, skipping duplicate call');
                }
                return;
            }
            
            this.isWaitingForForm = true;
            const maxWaitTime = 5000; // 5 seconds max
            const checkInterval = 100; // Check every 100ms
            let elapsed = 0;
            
            const checkForForm = () => {
                // Look for the textarea that should be created
                const commentTextarea = document.querySelector('textarea[id*="value_strNotes_"]');
                
                if (commentTextarea || elapsed >= maxWaitTime) {
                    this.isWaitingForForm = false;
                    this.clearFormCreating();
                    setTimeout(() => this.showOverlays(), 500); // Small delay to ensure form is fully ready
                    
                    if (config?.debugEnabled) {
                        console.log('[MMS] Comment form detection complete:', {
                            formFound: !!commentTextarea,
                            elapsed: elapsed
                        });
                    }
                    return;
                }
                
                elapsed += checkInterval;
                setTimeout(checkForForm, checkInterval);
            };
            
            checkForForm();
        }
    };
    
    // Intercept AJAX responses to detect comment form creation
    // Disabled by default to avoid startup overhead. Enable COMMENT_FORM_MANAGER.enabled to use.
    (function() {
        if (!COMMENT_FORM_MANAGER.enabled) return;
        // Intercept XMLHttpRequest
        const originalXHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(data) {
            const xhr = this;
            
            const originalOnReadyStateChange = xhr.onreadystatechange;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    // Defer to avoid blocking the main thread
                    setTimeout(() => {
                        try {
                            if (COMMENT_FORM_MANAGER.detectCommentFormJSON(xhr.responseText)) {
                                if (config?.debugEnabled) {
                                    console.log('[MMS] Comment form JSON detected, hiding overlays');
                                }
                                COMMENT_FORM_MANAGER.setFormCreating(true);
                                COMMENT_FORM_MANAGER.hideOverlays();
                                COMMENT_FORM_MANAGER.waitForFormAndRestore();
                            }
                        } catch (e) {
                            console.error('[MMS] Error in comment form detection:', e);
                        }
                    }, 0);
                }
                
                if (originalOnReadyStateChange) {
                    originalOnReadyStateChange.apply(this, arguments);
                }
            };
            
            return originalXHRSend.apply(this, arguments);
        };
        
        // Intercept fetch API
        if (window.fetch) {
            const originalFetch = window.fetch;
            window.fetch = function() {
                return originalFetch.apply(this, arguments).then(response => {
                    if (response.ok) {
                        const clonedResponse = response.clone();
                        clonedResponse.text().then(responseText => {
                            // Defer to avoid blocking
                            setTimeout(() => {
                                try {
                                    if (COMMENT_FORM_MANAGER.detectCommentFormJSON(responseText)) {
                                        if (config?.debugEnabled) {
                                            console.log('[MMS] Comment form JSON detected via fetch, hiding overlays');
                                        }
                                        COMMENT_FORM_MANAGER.setFormCreating(true);
                                        COMMENT_FORM_MANAGER.hideOverlays();
                                        COMMENT_FORM_MANAGER.waitForFormAndRestore();
                                    }
                                } catch (e) {
                                    console.error('[MMS] Error in comment form detection:', e);
                                }
                            }, 0);
                        }).catch(() => {}); // Ignore errors in detection
                    }
                    return response;
                });
            };
        }
    })();
    
    // Add click detection for comment buttons to proactively hide overlays
    (function() {
        // Monitor for comment button clicks
        function setupCommentButtonDetection() {
            // Use event delegation to catch dynamically created buttons
            document.addEventListener('click', function(event) {
                const target = event.target;
                
                // Check if clicked element is a comment button
                const isCommentButton = (
                    target.tagName === 'A' &&
                    target.classList.contains('rnr-button') &&
                    (target.name === 'inlineAdd_2' || target.id === 'inlineAdd2' || 
                     target.textContent.includes('Εισαγωγή') || target.textContent.includes('Add'))
                );
                
                if (isCommentButton) {
                    if (COMMENT_FORM_MANAGER.debugMode) {
                        console.log('[MMS Debug] Comment button clicked, proactively hiding overlays');
                        console.log('[MMS Debug] Button details:', {
                            id: target.id,
                            name: target.name,
                            className: target.className,
                            text: target.textContent
                        });
                    }
                    
                    // Immediately hide overlays when comment button is clicked
                    COMMENT_FORM_MANAGER.setFormCreating(true);
                    COMMENT_FORM_MANAGER.hideOverlays();
                    
                    // Start monitoring for the form creation
                    setTimeout(() => {
                        COMMENT_FORM_MANAGER.waitForFormAndRestore();
                    }, 100);
                }
            }, true); // Use capture phase to catch early
        }
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupCommentButtonDetection);
        } else {
            setupCommentButtonDetection();
        }
    })();
    
    // Also monitor for any modal/popup creation that might contain forms
    (function() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if a modal or popup with form elements was added
                        const hasForm = node.querySelector && (
                            node.querySelector('textarea[id*="value_strNotes_"]') ||
                            node.querySelector('.rnr-button[name*="inlineAdd"]') ||
                            node.classList?.contains('modal') ||
                            node.classList?.contains('popup')
                        );
                        
                        if (hasForm && COMMENT_FORM_MANAGER.debugMode) {
                            console.log('[MMS Debug] Form-related element detected in DOM:', node);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    })();
    
    // Expose comment form manager for debugging
    window.COMMENT_FORM_DEBUG = {
        // Check if overlays are currently hidden
        areOverlaysHidden: () => COMMENT_FORM_MANAGER.overlaysHidden,
        
        // Check if form creation is in progress
        isFormCreating: () => COMMENT_FORM_MANAGER.isFormCreating,
        
        // Manually hide overlays (for testing)
        hideOverlays: () => COMMENT_FORM_MANAGER.hideOverlays(),
        
        // Manually show overlays (for testing)
        showOverlays: () => COMMENT_FORM_MANAGER.showOverlays(),
        
        // Test comment form detection
        testDetection: (jsonString) => {
            console.log('[MMS Debug] Testing comment form detection:', 
                COMMENT_FORM_MANAGER.detectCommentFormJSON(jsonString));
        },
        
        // Check for existing comment form
        checkForCommentForm: () => {
            const textarea = document.querySelector('textarea[id*="value_strNotes_"]');
            console.log('[MMS Debug] Comment form check:', {
                found: !!textarea,
                element: textarea
            });
            return textarea;
        },
        
        // Find all comment buttons on the page
        findCommentButtons: () => {
            const buttons = document.querySelectorAll('a.rnr-button[name*="inlineAdd"], a.rnr-button[id*="inlineAdd"]');
            console.log('[MMS Debug] Found comment buttons:', buttons);
            return buttons;
        },
        
        // Check current state
        getStatus: () => {
            const status = {
                isFormCreating: COMMENT_FORM_MANAGER.isFormCreating,
                overlaysHidden: COMMENT_FORM_MANAGER.overlaysHidden,
                debugMode: COMMENT_FORM_MANAGER.debugMode,
                globalFlag: window.TM_COMMENT_FORM_CREATING,
                hiddenElementsCount: COMMENT_FORM_MANAGER.originalOverlayStates.size,
                allScriptElements: document.querySelectorAll('[id^="tm-"], [class*="tm-"]').length,
                visibleScriptElements: document.querySelectorAll('[id^="tm-"]:not([style*="display: none"]), [class*="tm-"]:not([style*="display: none"])').length
            };
            console.log('[MMS Debug] Current status:', status);
            return status;
        },
        
        // Toggle debug mode
        toggleDebugMode: () => {
            COMMENT_FORM_MANAGER.debugMode = !COMMENT_FORM_MANAGER.debugMode;
            console.log('[MMS Debug] Debug mode:', COMMENT_FORM_MANAGER.debugMode ? 'ENABLED' : 'DISABLED');
        },
        
        // Force test the whole flow
        simulateCommentButtonClick: () => {
            console.log('[MMS Debug] Simulating comment button click...');
            COMMENT_FORM_MANAGER.setFormCreating(true);
            COMMENT_FORM_MANAGER.hideOverlays();
            COMMENT_FORM_MANAGER.waitForFormAndRestore();
        },
        
        // Check persistent state
        checkPersistentState: () => {
            const state = {
                persistentFormCreating: GM_getValue('TM_FORM_CREATING', false),
                localFormCreating: COMMENT_FORM_MANAGER.isFormCreating,
                shouldDelay: COMMENT_FORM_MANAGER.shouldDelayInitialization()
            };
            console.log('[MMS Debug] Persistent state check:', state);
            return state;
        },
        
        // Clear persistent state manually
        clearPersistentState: () => {
            COMMENT_FORM_MANAGER.clearFormCreating();
            console.log('[MMS Debug] Persistent state cleared manually');
        }
    };

    // ===================================================================
    // === MAIN SCRIPT INITIALIZATION
    // ===================================================================
    
    window.addEventListener('load', () => {
        // CRITICAL: Check if we should delay initialization due to comment form creation
        if (COMMENT_FORM_MANAGER.shouldDelayInitialization()) {
            if (COMMENT_FORM_MANAGER.debugMode) {
                console.log('[MMS Debug] Delaying script initialization - comment form creation in progress');
            }
            
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            
            // Monitor for comment form completion
            const checkAndInit = () => {
                const hasCommentForm = document.querySelector('textarea[id*="value_strNotes_"]');
                if (hasCommentForm || !GM_getValue('TM_FORM_CREATING', false)) {
                    if (COMMENT_FORM_MANAGER.debugMode) {
                        console.log('[MMS Debug] Comment form detected or timeout, proceeding with initialization');
                    }
                    COMMENT_FORM_MANAGER.clearFormCreating();
                    // Restart initialization after form is ready
                    setTimeout(initializeScript, 1000);
                } else {
                    // Keep checking
                    setTimeout(checkAndInit, 200);
                }
            };
            
            checkAndInit();
            return; // Exit early, will reinitialize later
        }
        
        initializeScript();
    });
    
    function initializeScript() {
        // Do nothing on the login page — no buttons, no UI, no features
        if (window.location.pathname.includes('login.php')) {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            return;
        }

        // Quick View iframe — show the native page cleanly, no script UI
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            return;
        }

        // Activate per-user storage profile before loading settings.
        if (typeof window.MMS_PROFILES?.activateProfileForCurrentUser === 'function') {
            window.MMS_PROFILES.activateProfileForCurrentUser();
        }

        window.addEventListener('mms-profile-changed', () => {
            loadSettings();
            if (config?.debugEnabled) {
                console.log('[MMS] Profile changed — settings reloaded for', window.tmCurrentUser);
            }
        });

        // Load settings first, as they determine which features to run.
        loadSettings();

        // User info is set by MMS_PROFILES.activateProfileForCurrentUser (above).
        if (config?.debugEnabled && window.tmCurrentUser) {
            console.log('[MMS] Logged in as:', window.tmCurrentUser, window.tmCurrentUsername ? `(username: ${window.tmCurrentUsername})` : '(username not mapped)');
        }

        // Debug: Log new feature config status
        if (config?.debugEnabled) {
        console.log('[MMS] Recent Repairs Enabled:', config.recentRepairsEnabled);
        console.log('[MMS] Repair Age Indicator Enabled:', config.repairAgeIndicatorEnabled);
        }

        // Check if script is enabled - if not, show minimal UI and exit
        if (!config.scriptEnabled) {
            // Stealth mode - completely silent, no UI elements, no messages
            // Only the key combination Ctrl+Shift+E can re-enable (handler is set up above)
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            return; // Exit early - don't initialize any features
        }

        // Apply theme first, so all subsequent UI elements get the right colors
        applyTheme(GM_getValue(STORAGE_KEYS.EQUIPPED_THEME, 'default'));
        addGlobalStyles();

        // Create a shared container for bottom controls
        // const bottomControlsContainer = document.createElement('div');
        // bottomControlsContainer.id = 'tm-bottom-center-container';
        // document.body.appendChild(bottomControlsContainer);
        const footerCenterCell = document.querySelector('#footer-outterwrap table td[width="60%"]');
        // Initialize floating/other features that don't depend on the footer // Pass config
        initInteractiveMascot(config, STORAGE_KEYS); // Handles the mascot


        if (footerCenterCell) {
            // Create a wrapper to hold both existing content and our new controls
            const wrapper = document.createElement('div');
            wrapper.id = 'tm-footer-controls-container';

            // Create our controls containers
            const footerControlsLeft = document.createElement('div');
            footerControlsLeft.id = 'tm-footer-controls-left';

            const footerControlsMiddle = document.createElement('div');
            footerControlsMiddle.id = 'tm-footer-controls-middle';

            const footerControlsRight = document.createElement('div');
            footerControlsRight.id = 'tm-footer-controls-right';

            // Create a container for buff timers and add it to the left controls
            const buffTimersContainer = document.createElement('div');
            buffTimersContainer.id = 'tm-buff-timers-container';
            footerControlsLeft.appendChild(buffTimersContainer);

            // Initialize buff timers display after a short delay to ensure functions are loaded
            setTimeout(() => {
                if (typeof window.updateBuffTimersUI === 'function') {
                    window.updateBuffTimersUI(config, STORAGE_KEYS);
                    console.log('[MMS] Buff timers UI initialized.');
                } else {
                    console.warn('[MMS] updateBuffTimersUI not available yet.');
                }
                
                // Update buff timers every second
                setInterval(() => {
                    if (typeof window.updateBuffTimersUI === 'function') {
                        window.updateBuffTimersUI(config, STORAGE_KEYS);
                    }
                }, 1000);
            }, 500);

            // Hide or remove the original ΒΡΙΛΗΣΣΙΑ button and other native content
            while (footerCenterCell.firstChild) {
                footerCenterCell.removeChild(footerCenterCell.firstChild);
            }
            
            // Add our wrapper instead
            footerCenterCell.appendChild(wrapper);

            // Add all three sections to the wrapper
            wrapper.appendChild(footerControlsLeft);
            wrapper.appendChild(footerControlsMiddle);
            wrapper.appendChild(footerControlsRight);
            
            // Initialize weather widget in middle
            if (typeof window.initWeatherWidget === 'function') {
                window.initWeatherWidget(footerControlsMiddle, config);
            }

            // Initialize features and place them in the correct containers
            initDailyDashboardWidget(footerControlsLeft, STORAGE_KEYS); // Stats widget on the left
            initXpBarWidget(footerControlsLeft, STORAGE_KEYS); // XP bar widget on the left
            
            // Add new feature buttons
            addNewFeatureButtons(footerControlsLeft, config, STORAGE_KEYS);
            
            // Initialize Recent Repairs dropdown
            initRecentRepairsDropdown(footerControlsRight, config, STORAGE_KEYS); // Recent repairs on the right
            
            if (config.autoRefreshEnabled) initRefreshFeature(footerControlsRight);     // Refresh timer on the right
            initSettingsPanel(footerControlsRight, config, STORAGE_KEYS); // Settings button always visible

            // End of Day Checklist — 📋 button in footer (needs tm-footer-controls-right)
            if (typeof window.initEODChecklist === 'function') {
                window.initEODChecklist(config, STORAGE_KEYS);
            }
        }

        // End of Day Checklist fallback if footer layout is missing
        if (!document.getElementById('tm-footer-controls-right')
            && typeof window.initEODChecklist === 'function') {
            window.initEODChecklist(config, STORAGE_KEYS);
        }

        // Initialize remaining features
        
        // Initialize random events check (checks every 2.5 hours for new events - REDUCED FREQUENCY)
        if (config.randomEventsEnabled && typeof window.checkRandomEvent === 'function') {
            window.checkRandomEvent(config, STORAGE_KEYS);
            setInterval(() => window.checkRandomEvent(config, STORAGE_KEYS), 2.5 * 60 * 60 * 1000);
            
            // Restore active event notification on page load
            const activeEvent = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_EVENT, 'null'));
            if (activeEvent && Date.now() < activeEvent.expiresAt) {
                window.updateEventNotification(activeEvent);
            }
        }
        
        // Initialize boss battles check (checks every 2.5 hours for new bosses - REDUCED FREQUENCY)
        if (config.bossBattlesEnabled && typeof window.checkBossSpawn === 'function') {
            window.checkBossSpawn(config, STORAGE_KEYS);
            setInterval(() => window.checkBossSpawn(config, STORAGE_KEYS), 2.5 * 60 * 60 * 1000);
            
            // Restore active boss notification on page load
            const activeBoss = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_BOSS, 'null'));
            if (activeBoss && Date.now() < activeBoss.expiresAt) {
                window.showBossBattleNotification(activeBoss);
            }
        }
        
        if (config?.searchFeatureEnabled) {
        if (config?.debugEnabled) {
            console.log('[MMS] About to initialize search feature. Config searchFeatureEnabled:', config.searchFeatureEnabled);
        }
        window.initSearchFeature();
        }
        if (config?.scratchpadEnabled) {
        window.initScratchpadFeature(config, STORAGE_KEYS); // Pass config
        }
        
        // Ensure Phone Catalog button is added to side container
        setTimeout(() => {
            let rightSideContainer = document.getElementById('tm-search-container');
            if (!rightSideContainer) {
                rightSideContainer = document.createElement('div');
                rightSideContainer.id = 'tm-search-container';
                document.body.appendChild(rightSideContainer);
            }
            
            // Add Phone Catalog button if enabled and not already added
            if (config.phoneCatalogEnabled && !document.getElementById('tm-phone-catalog-btn')) {
                const phoneCatalogBtn = document.createElement('button');
                phoneCatalogBtn.id = 'tm-phone-catalog-btn';
                phoneCatalogBtn.className = 'tm-slide-out-btn';
                phoneCatalogBtn.textContent = '📱 Phone Catalog';
                phoneCatalogBtn.title = 'Phone Catalog';
                // Clear any inline styles - theme CSS will handle styling
                phoneCatalogBtn.style.background = '';
                phoneCatalogBtn.style.backgroundColor = '';
                phoneCatalogBtn.style.backgroundImage = '';
                phoneCatalogBtn.style.color = '';
                phoneCatalogBtn.addEventListener('click', () => {
                    if (typeof window.showPhoneListModal === 'function') {
                        window.showPhoneListModal();
                    }
                });
                rightSideContainer.appendChild(phoneCatalogBtn);
            }
        }, 500);
        
        initScrollToTopFeature();
        if (typeof window.initRepairReminderFeature === 'function') {
            window.initRepairReminderFeature(config, STORAGE_KEYS);
        }
        if (config?.scratchpadEnabled) {
        initReminderSystem(STORAGE_KEYS);
        }
        initAutomatedPartsSearch();
        if (config?.statusTrackingEnabled !== false) {
            initStatusCounterTracking(); // Status transfer counters
        }
        injectReturnTo40Button(); // Red "40" shortcut button on status-65 and status-100 repairs
        initFunFeatures(config); // Handles confetti and other event-based interactions
        initMascotPageReactions(config); // Mascot reactions to page events.
        initScratchpadIntegration();
        fetchWeatherAndReact(config); // Check the weather for the mascot
        initCustomerHistoryFeature(config); // Pass config
        updateBuffTimersUI(config, STORAGE_KEYS);
        setInterval(() => updateBuffTimersUI(config, STORAGE_KEYS), 1000); // Update the timer every second
        initOrderTracking(config, STORAGE_KEYS);
        initKeyboardShortcuts();
        
        // Initialize new workflow features
        initRepairAgeIndicator(config); // Add age indicators to service list
        initRepairListQuickView();      // Add 👁 quick-view buttons to every list row
        
        // Ensure Status 40 button is initialized on repair edit pages
        if (window.location.pathname.includes('service_edit.php') && typeof window.initStatus40Button === 'function') {
            // Call twice with slight delay to handle late DOM elements
            setTimeout(() => window.initStatus40Button(), 200);
            setTimeout(() => window.initStatus40Button(), 1200);
        }
        
        // Initialize suggested price transfer button on repair edit pages
        initSuggestedPriceTransfer();
        
        // Initialize status hover preview for menu items
        initStatusHoverPreview();
        
        // Initialize order link button for status 65 repairs
        if (typeof window.initOrderLinkModule === 'function') {
            window.initOrderLinkModule();
        }
        
        // Track repair access with a delay to ensure DOM is loaded
        setTimeout(() => {
            trackRepairAccess(config, STORAGE_KEYS);
        }, 1000);

        console.log('[MMS] MyManager All-in-One Suite Loaded!');

        if (typeof window.initScriptUpdateChecker === 'function') {
            window.initScriptUpdateChecker();
        }

        // Update shop button visibility on page load
        if (typeof window.updateShopButtonVisibility === 'function') {
            window.updateShopButtonVisibility(config);
        }
        
        // Update recent repairs button visibility on page load
        if (typeof window.updateRecentRepairsButtonVisibility === 'function') {
            window.updateRecentRepairsButtonVisibility(config);
        }
        
        // Update weather widget visibility on page load
        if (typeof window.updateWeatherWidgetVisibility === 'function') {
            window.updateWeatherWidgetVisibility(config);
        }
        
        // Update phone catalog button visibility on page load
        if (typeof window.updatePhoneCatalogButtonVisibility === 'function') {
            window.updatePhoneCatalogButtonVisibility(config);
        }
        
        // Update order history button visibility on page load
        if (typeof window.updateOrderHistoryButtonVisibility === 'function') {
            window.updateOrderHistoryButtonVisibility(config);
        }

        // Make the body visible now that all styles and themes are applied.
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }

})(); // End of MyManager All-in-One Suite
