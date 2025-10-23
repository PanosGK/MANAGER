 // ==UserScript==
// @name         MyManager All-in-One Suite (Modular)
// @namespace    http://tampermonkey.net/
// @version      121
// @description  An all-in-one suite for mymanager.gr, combining Advanced Search, Auto-Refresh, Quick Navigation, a Dashboard, and more. Now with modular loading!
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// @connect      github.com
// @require      file://c:\Users\User\Desktop\Scripts_Into_Development\myman_themes.js
// @require      file://c:\Users\User\Desktop\Scripts_Into_Development\myman_login.js
// @require      file://c:\Users\User\Desktop\Scripts_Into_Development\myman_mascot.js
// @require      file://c:\Users\User\Desktop\Scripts_Into_Development\myman_gamification.js
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================================
    // MODULAR LOADING SYSTEM
    // ============================================================================
    
    // Library loading configuration
    const LIBRARY_CONFIG = {
        // Local file paths (for development)
        local: {
            themes: 'file://c:\\Users\\User\\Desktop\\Scripts_Into_Development\\myman_themes.js',
            login: 'file://c:\\Users\\User\\Desktop\\Scripts_Into_Development\\myman_login.js',
            mascot: 'file://c:\\Users\\User\\Desktop\\Scripts_Into_Development\\myman_mascot.js',
            gamification: 'file://c:\\Users\\User\\Desktop\\Scripts_Into_Development\\myman_gamification.js'
        },
        // Web URLs (for production)
        web: {
            themes: 'https://raw.githubusercontent.com/yourusername/mymanager-scripts/main/myman_themes.js',
            login: 'https://raw.githubusercontent.com/yourusername/mymanager-scripts/main/myman_login.js',
            mascot: 'https://raw.githubusercontent.com/yourusername/mymanager-scripts/main/myman_mascot.js',
            gamification: 'https://raw.githubusercontent.com/yourusername/mymanager-scripts/main/myman_gamification.js'
        }
    };

    // Check if we should load libraries from web or local
    const loadLibrariesFromWeb = GM_getValue('loadLibrariesFromWeb', false);
    
    if (loadLibrariesFromWeb) {
        console.log('[MMS] 🌐 Loading libraries from web...');
        // Load libraries from web URLs
        loadLibraryFromWeb('themes', () => {
            loadLibraryFromWeb('login', () => {
                loadLibraryFromWeb('mascot', () => {
                    loadLibraryFromWeb('gamification', () => {
                        console.log('[MMS] 🎉 All web libraries loaded!');
                        initializeMainScript();
                    });
                });
            });
        });
    } else {
        console.log('[MMS] 📁 Loading libraries from local files...');
        // Load libraries from local files using @require
        // This will be handled by the @require directives in the header
        initializeMainScript();
    }

    function loadLibraryFromWeb(moduleName, callback) {
        const libraryUrl = LIBRARY_CONFIG.web[moduleName];
        console.log(`[MMS] Loading ${moduleName} from web: ${libraryUrl}`);
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: libraryUrl,
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        // Execute the loaded script
                        eval(response.responseText);
                        console.log(`[MMS] ✅ Successfully loaded ${moduleName} from web`);
                        if (callback) callback();
                    } catch (error) {
                        console.error(`[MMS] ❌ Error executing ${moduleName} from web:`, error);
                        // Fallback to local
                        loadLibraryLocal(moduleName, callback);
                    }
                } else {
                    console.error(`[MMS] ❌ Failed to load ${moduleName} from web (${response.status}), falling back to local`);
                    loadLibraryLocal(moduleName, callback);
                }
            },
            onerror: function(error) {
                console.error(`[MMS] ❌ Network error loading ${moduleName} from web, falling back to local:`, error);
                loadLibraryLocal(moduleName, callback);
            }
        });
    }

    function loadLibraryLocal(moduleName, callback) {
        const localUrl = LIBRARY_CONFIG.local[moduleName];
        console.log(`[MMS] Loading ${moduleName} from local: ${localUrl}`);
        
        // For local files, we'll use a script tag
        const script = document.createElement('script');
        script.src = localUrl;
        script.onload = function() {
            console.log(`[MMS] ✅ Successfully loaded ${moduleName} from local`);
            if (callback) callback();
        };
        script.onerror = function() {
            console.error(`[MMS] ❌ Failed to load ${moduleName} from local`);
            if (callback) callback();
        };
        document.head.appendChild(script);
    }

    function initializeMainScript() {
        console.log('[MMS] 🚀 Initializing MyManager All-in-One Suite...');
        
        // Hide the body initially to prevent Flash of Unstyled Content (FOUC).
        // It will be made visible at the end of the 'load' event listener.
        GM_addStyle('body { visibility: hidden; opacity: 0; transition: opacity 0.3s ease-in; }');
        
        // ===================================================================
        // === ERROR HANDLER: SUPPRESS SERVER JSON CONFIGURATION ERRORS
        // ===================================================================
        // Intercept and suppress the specific JSON configuration error that appears
        // when adding comments/notes to repairs
        (function() {
            // Store original functions
            const originalAlert = window.alert;
            const originalConfirm = window.confirm;
        
            // Helper function to check if message is a JSON configuration response
            function isConfigurationMessage(message) {
                if (typeof message !== 'string') return false;
                
                try {
                    const parsed = JSON.parse(message);
                    // Check for various configuration response patterns
                    return (parsed.settings && parsed.settings.tableSettings) ||
                           (parsed.html && parsed.additionalJS) ||
                           (parsed.controlsMap) ||
                           (parsed.viewControlsMap);
                } catch (e) {
                    return false;
                }
            }
            
            // Override window.alert to filter out JSON configuration errors
            window.alert = function(message) {
                if (isConfigurationMessage(message)) {
                    console.log('[MMS] Suppressed server configuration alert');
                    console.log('[MMS] Configuration type:', message.substring(0, 100) + '...');
                    return; // Don't show the alert
                }
            
            // Call the original alert for all other messages
            return originalAlert.apply(this, arguments);
        };
        
        // Override window.confirm as well (in case it's used for errors)
        window.confirm = function(message) {
            if (isConfigurationMessage(message)) {
                console.log('[MMS] Suppressed server configuration confirm dialog');
                return true; // Auto-confirm
            }
            
            // Call the original confirm for all other messages
            return originalConfirm.apply(this, arguments);
        };
        
        // Also intercept modal/popup creation if MyManager uses custom dialogs
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.apply(this, arguments);
            
            // Monitor for error dialog divs
            if (tagName && tagName.toLowerCase() === 'div') {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && element.textContent) {
                            if (isConfigurationMessage(element.textContent)) {
                                console.log('[MMS] Suppressed configuration dialog div');
                                element.style.display = 'none';
                            }
                        }
                    });
                });
                
                // Start observing after a microtask to avoid immediate observation
                setTimeout(() => {
                    observer.observe(element, { childList: true, subtree: true });
                }, 0);
            }
            
            return element;
        };
        
        console.log('[MMS] Enhanced error handler initialized - Configuration messages will be suppressed');
    })();

    // ===================================================================
    // === UTILITY FUNCTIONS
    // ===================================================================

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Displays a temporary positive message in the center of the screen.
     * @param {string} message The message to display.
     */
    function showPositiveMessage(message) {
        let msgEl = document.getElementById('tm-positive-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.id = 'tm-positive-message';
            document.body.appendChild(msgEl);
        }
        msgEl.textContent = message;
        msgEl.style.opacity = '1';
        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => {
                if (msgEl.parentElement) msgEl.parentElement.removeChild(msgEl);
            }, 500); // Wait for fade out
        }, 2000); // Display for 2 seconds
    }
    
    // Make functions globally accessible for external scripts
    window.showPositiveMessage = showPositiveMessage;
    window.triggerConfetti = triggerConfetti;

    /**
     * Creates a confetti explosion animation.
     * @param {number} [count=50] The number of confetti particles.
     */
    function triggerConfetti(count = 50) {
        const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'tm-confetti-particle';
            const x = Math.random() * 100; // vw
            const delay = Math.random() * 0.5; // seconds
            const duration = 2 + Math.random() * 2; // seconds

            particle.style.left = `${x}vw`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.transform = `scale(${0.5 + Math.random()})`;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), duration * 1000 + delay * 1000);
        }
    }

    // Note: showAchievementNotification and checkAchievements are now in myman_gamification.js

    /**
     * Checks if the current time is within the configured working hours and days.
     * @returns {boolean} True if it's currently working time, false otherwise.
     */
    function isWorkingHours() {
        const now = new Date();
        const day = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const hour = now.getHours();

        const isWorkingDay = config.workingDays.includes(day);
        // End hour 24 means up to 23:59:59
        const endHourCheck = config.workingHoursEnd === 24 ? 24 : config.workingHoursEnd;
        const isWorkingTime = hour >= config.workingHoursStart && hour < endHourCheck;

        return isWorkingDay && isWorkingTime;
    }

    /**
     * Cleans a raw device model name by removing prefixes, colors, and other noise.
     * @param {string} rawName The raw model name string.
     * @returns {string|null} The cleaned model name or null.
     */
    function cleanModelName(rawName) {
        if (!rawName) return null;

        let cleanedName = rawName.toUpperCase(); // Work with uppercase for consistency


        // --- Step 1: Remove known prefixes ---
        const prefixesToRemove = [
            'KINHTO ANDROID SMARTPHONE',
            'NOTEBOOK-NETBOOK ΕΜΠΟΡΙΟΥ',
            'ΣΥΣΚΕΥΗ DIGITAL ΕΜΠΟΡΙΟΥ',
            'NOTEBOOK-NETBOOK',
            'ΚΙΝΗΤΟ', // Greek K
            'KINHTO', // Latin K
            'CONSOLE',
            'SAMSUNG',
        ];

        for (const prefix of prefixesToRemove) {
            if (cleanedName.startsWith(prefix)) {
                cleanedName = cleanedName.substring(prefix.length).trim();
                break; // Stop after finding the first matching prefix
            }
        }

        // --- Step 2: Remove color and material keywords from anywhere ---
        const keywordsToRemove = [
            // Multi-word first to ensure they are matched before single words (e.g., 'NATURAL TITANIUM' before 'NATURAL')
            'NATURAL TITANIUM', 'BLUE TITANIUM', 'WHITE TITANIUM', 'BLACK TITANIUM',
            'ROSE GOLD', 'SPACE GRAY', 'MIDNIGHT GREEN', 'DEEP PURPLE', 'SIERRA BLUE', 'ALPINE GREEN',
            // Single-word
            'NATURAL', 'TITANIUM', 'BLACK', 'WHITE', 'BLUE', 'RED', 'GREEN', 'GOLD', 'SILVER',
            'PURPLE', 'YELLOW', 'ORANGE', 'PINK', 'BRONZE', 'GRAPHITE',
            // Greek Colors and other keywords
            'ΜΑΥΡΟ', 'ΑΣΠΡΟ', 'ΜΠΛΕ', 'ΚΟΚΚΙΝΟ', 'ΠΡΑΣΙΝΟ', 'ΧΡΥΣΟ', 'ΑΣΗΜΙ',
            'ΜΩΒ', 'ΚΙΤΡΙΝΟ', 'ΠΟΡΤΟΚΑΛΙ', 'ΡΟΖ', 'samsung'
        ];

        for (const keyword of keywordsToRemove) {
            // Use a regex to remove the keyword as a whole word, case-insensitive.
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            cleanedName = cleanedName.replace(regex, '');
        }

        // --- Step 3: Transliterate Greek to Latin (AFTER removing prefixes/keywords) ---
        const greekToLatinMap = {
            'Α': 'A', 'Β': 'V', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'TH',
            'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
            'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'X', 'Ψ': 'PS', 'Ω': 'O'
        };

        // Use a single regex for efficiency
        const greekCharsRegex = new RegExp(Object.keys(greekToLatinMap).join('|'), 'g');
        cleanedName = cleanedName.replace(greekCharsRegex, (matched) => greekToLatinMap[matched]);
        // Fallback for final sigma
        cleanedName = cleanedName.replace(/Σ/g, 'S');


        // --- Step 3: Clean up extra spaces and remove trailing codes ---
        cleanedName = cleanedName.replace(/\s+/g, ' ').trim(); // Collapse multiple spaces to one
        cleanedName = cleanedName.replace(/\s*-\s*\d+\s*$/, '').trim();

        // --- Step 4: Handle adjacent duplicated words ---
        const words = cleanedName.split(' ');
        const uniqueWords = [];
        for (let i = 0; i < words.length; i++) {
            if (i === 0 || words[i] !== words[i - 1]) {
                uniqueWords.push(words[i]);
            }
        }
        cleanedName = uniqueWords.join(' ');

        return cleanedName.trim();
    }

    /**
     * Attempts to find and clean the phone model name from the current page.
     * @returns {string|null} The cleaned model name or null if not found.
     */
    function getPhoneModelFromPage() {
        let rawModel = null;
        // Try to find the model from common field names on the page.
        const modelInput = document.querySelector('div[data-fieldname="strProductName"] input, div[data-fieldname="strDeviceDescription"] input');
        if (modelInput && modelInput.value) {
            rawModel = modelInput.value.trim();
        }

        // Fallback: try to get it from the page title if the input field wasn't found or was empty.
        if (!rawModel) {
            const titleElement = document.querySelector('.pagetitle, h1.page-header, h1, h2');
            if (titleElement) {
                const match = titleElement.innerText.match(/\[(.*?)\]/);
                if (match && match[1]) {
                    rawModel = match[1].trim();
                }
            }
        }

        return cleanModelName(rawModel);
    }

    // ===================================================================
    // === FUN FEATURE: LEVEL UP SYSTEM
    // ===================================================================
    const STORAGE_KEYS = {
        SCRIPT_ENABLED: 'tm_script_enabled', // Master toggle
        USER_XP: 'tm_user_xp',
        USER_LEVEL: 'tm_user_level',
        ACHIEVEMENTS: 'tm_achievements_unlocked',
        USER_COINS: 'tm_user_coins',
        USER_TITLE: 'tm_user_title', // New: For cosmetic titles
        PURCHASED_ITEMS: 'tm_purchased_items',
        EQUIPPED_ITEMS: 'tm_equipped_items', // Changed from singular to plural
        EQUIPPED_THEME: 'tm_equipped_theme',
        PET_STATS: 'tm_pet_stats',
        DAILY_STATS: 'tm_daily_stats_v2',
        DAILY_QUESTS: 'tm_daily_quests',
        USER_REROLL_TOKENS: 'tm_user_reroll_tokens',
        // New Scratchpad Keys
        SCRATCHPAD_NOTES: 'tm_scratchpad_notes_v2',
        SCRATCHPAD_ACTIVE_NOTE_ID: 'tm_scratchpad_active_note_id',
        SCRATCHPAD_TEMPLATES: 'tm_scratchpad_templates',
        // New Talent System Keys
        USER_TALENT_POINTS: 'tm_user_talent_points',
        UNLOCKED_TALENTS: 'tm_unlocked_talents',
        USER_NOTIFICATIONS: 'tm_user_notifications_v1',
        ENERGIZED_BUFF_EXPIRES: 'tm_energized_buff_expires',
        DOUBLE_COINS_BUFF_EXPIRES: 'tm_double_coins_buff_expires',
        // Advanced Search Keys
        SEARCH_HISTORY_KEY: 'tm_search_history',
        FAVORITE_SEARCHES_KEY: 'tm_favorite_searches',
        
        // Random Events Keys
        ACTIVE_EVENT: 'tm_active_event',
        LAST_EVENT_CHECK: 'tm_last_event_check',
        EVENT_HISTORY: 'tm_event_history',
        EVENT_NOTIFICATION_MINIMIZED: 'tm_event_notification_minimized',
        
        // Smart Templates Keys
        REPAIR_TEMPLATES: 'tm_repair_templates',
        
        // Factions Keys
        USER_FACTION: 'tm_user_faction',
        FACTION_CONTRIBUTION: 'tm_faction_contribution',
        FACTION_CHALLENGES: 'tm_faction_challenges',
        
        // Dashboard Keys
        DASHBOARD_STATS_HISTORY: 'tm_dashboard_stats_history',
        REPAIR_TIME_HISTORY: 'tm_repair_time_history',
        
        // Boss Battles Keys
        ACTIVE_BOSS: 'tm_active_boss',
        BOSS_HISTORY: 'tm_boss_history',
        BOSS_DEFEATS: 'tm_boss_defeats',
        BOSS_NOTIFICATION_MINIMIZED: 'tm_boss_notification_minimized',
        
        // Menu Visibility Keys
        HIDDEN_MENU_ITEMS: 'tm_hidden_menu_items',
        
        // Status Transfer Tracking
        STATUS_40_TRANSFERS: 'tm_status_40_transfers', // Count of repairs moved to status 40
        STATUS_100_TRANSFERS: 'tm_status_100_transfers', // Count of repairs moved to status 100

        // Recent Repairs History
        RECENT_REPAIRS: 'tm_recent_repairs', // Track recently accessed repairs

        // Add other keys here as needed
    };

    // Make STORAGE_KEYS globally accessible for external scripts
    window.STORAGE_KEYS = STORAGE_KEYS;

    const SHOP_ITEMS = {
        BOUNTY_COMPLETE_TOKEN: 'bounty_complete_token',
        // Add other item IDs here for easy reference
    };
    
    // Make SHOP_ITEMS globally accessible for external scripts
    window.SHOP_ITEMS = SHOP_ITEMS;

    const XP_CONFIG = {
        searches: 5,
        repairsCompleted: 50,
        ordersCreated: 20,
        achievement: 100, // Bonus for unlocking any achievement
        statusChange: 15, // For any repair status change
        printOrder: 25, // For printing an order/repair ticket
        viewTechStats: 10, // For opening the technician stats modal
        viewCustomerHistory: 10, // For opening the customer history modal
        setScratchpadReminder: 20, // For setting a reminder in the scratchpad
        feedMascot: 5, // For feeding the interactive mascot
        petMascot: 5, // For petting the interactive mascot
        memoryGame: 15, // Base XP for playing the memory mini-game
        bugSquishGame: 30, // Base XP for playing the bug squish mini-game
    };

    const QUEST_POOL = [
        { id: 'complete_3_repairs', description: 'Complete 3 repairs', targetStat: 'repairsCompleted', targetCount: 3, rewardXp: 150, rewardCoins: 50 },
        { id: 'create_5_orders', description: 'Create 5 new orders', targetStat: 'ordersCreated', targetCount: 5, rewardXp: 100, rewardCoins: 30 },
        { id: 'search_10_times', description: 'Use Advanced Search 10 times', targetStat: 'searches', targetCount: 10, rewardXp: 75, rewardCoins: 15 },
        { id: 'pet_mascot_5_times', description: 'Pet the mascot 5 times', targetStat: 'petMascot', targetCount: 5, rewardXp: 50, rewardCoins: 10 },
        { id: 'feed_mascot_3_times', description: 'Feed the mascot 3 times', targetStat: 'feedMascot', targetCount: 3, rewardXp: 40, rewardCoins: 10 },
        { id: 'change_5_statuses', description: 'Change the status of 5 repairs', targetStat: 'statusChanges', targetCount: 5, rewardXp: 80, rewardCoins: 20 },
        { id: 'print_2_orders', description: 'Print 2 order tickets', targetStat: 'printOrder', targetCount: 2, rewardXp: 50, rewardCoins: 15 },
        { id: 'view_5_histories', description: 'View customer history 5 times', targetStat: 'viewCustomerHistory', targetCount: 5, rewardXp: 60, rewardCoins: 15 },
        { id: 'play_2_games', description: 'Play any mini-game 2 times', targetStat: 'anyGamePlayed', targetCount: 2, rewardXp: 70, rewardCoins: 25 },
        { id: 'earn_100_xp', description: 'Earn 100 XP from any source', targetStat: 'xpEarned', targetCount: 100, rewardXp: 100, rewardCoins: 30 },
        { id: 'earn_20_coins', description: 'Earn 20 Fixer-Coins', targetStat: 'coinsEarned', targetCount: 20, rewardXp: 50, rewardCoins: 50 },
    ];

    // Unified constant for all ranks and titles.
    const RANKS = [
        { level: 1,   title: 'Novice Tech',             color: '#d1d1d1' },
        { level: 5,   title: 'Component Handler',       color: '#d1d1d1' },
        { level: 10,  title: 'Adept Troubleshooter',    color: '#1eff00' },
        { level: 15,  title: 'Screen Specialist',       color: '#1eff00' },
        { level: 20,  title: 'Microsoldering Master',   color: '#0070dd' },
        { level: 25,  title: 'Data Recovery Agent',     color: '#0070dd' },
        { level: 30,  title: 'Firmware Wizard',         color: '#0070dd' },
        { level: 40,  title: 'Board-Level Expert',      color: '#a335ee' },
        { level: 50,  title: 'Silicon Prophet',         color: '#a335ee' },
        { level: 75,  title: 'Kernel Commander',        color: '#a335ee' },
        { level: 100, title: 'Master of the Mainboard', color: '#ff8000', glow: true },
        { level: 250, title: 'Digital Archon',          color: '#e5cc80', glow: true }
    ];

    const TALENT_TREE = [
        {
            id: 'repair_xp_boost_1', name: 'Repair Specialist I', cost: 1,
            description: 'Gain +10% bonus XP from completing repairs.',
            bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.10 }
        },
        {
            id: 'order_xp_boost_1', name: 'Logistics Expert I', cost: 1,
            description: 'Gain +10% bonus XP from creating new orders.',
            bonus: { type: 'xp_modifier', stat: 'ordersCreated', multiplier: 0.10 }
        },
        {
            id: 'search_xp_boost_1', name: 'Data Miner I', cost: 1,
            description: 'Gain +20% bonus XP from using Advanced Search.',
            bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.20 }
        },
        {
            id: 'coin_finder_1', name: 'Coin Scavenger', cost: 2,
            description: 'Gain +10% more Fixer-Coins from all sources.',
            bonus: { type: 'coin_modifier', multiplier: 0.10 }
        },
        {
            id: 'game_master_1', name: 'Game Enthusiast', cost: 2,
            description: 'Gain +25% bonus XP from playing mini-games.',
            bonus: { type: 'xp_modifier', stat: 'anyGamePlayed', multiplier: 0.25 }
        },
    ];
    
    // Note: The following gamification functions are loaded from myman_gamification.js:
    // - getXpForLevel, triggerLevelUpAnimation, grantXp, grantCoins, updateCoinBalanceUI, trackDailyStat
    // - They should not be redefined here to avoid conflicts.

    /**
     * Requests permission for and shows a desktop notification.
     * @param {string} title The title of the notification.
     * @param {string} body The body text of the notification.
     */
    function showNotification(title, body) {
        if (!("Notification" in window)) {
            alert(`Reminder: ${body}`); // Fallback for browsers without Notification API
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(title, { body: body, icon: 'https://www.google.com/s2/favicons?domain=thefixers.mymanager.gr' });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body: body, icon: 'https://www.google.com/s2/favicons?domain=thefixers.mymanager.gr' });
                }
            });
        }
    }

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
        hackerSearchEnabled: true,
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
        factionsEnabled: true,
        personalDashboardEnabled: true,
        bossBattlesEnabled: true,
        // Menu item visibility
        hiddenMenuItemsEnabled: true,
        // Recent Repairs & Age Indicator
        recentRepairsEnabled: true,
        repairAgeIndicatorEnabled: true,
        recentRepairsMaxItems: 5,
        // NEW: Library loading preference
        loadLibrariesFromWeb: false, // false = local files, true = web URLs
    };
    // Default theme colors are now derived from the UI_THEMES object from the @require'd script
    DEFAULTS.defaultThemeColors = UI_THEMES.default.colors;

    function applyTheme(themeId) {
        // Remove any existing theme stylesheet
        const existingStyle = document.getElementById('tm-page-theme-styles');
        if (existingStyle) existingStyle.remove();

        const theme = UI_THEMES[themeId] || UI_THEMES['default'];
        console.log(`[MMS] Applying theme: ${theme.name}`);
        for (const [variable, color] of Object.entries(theme.colors)) {
            document.documentElement.style.setProperty(variable, color);
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
    // === 1. STYLING (ALL FEATURES)
    // ===================================================================
    function addGlobalStyles() {
        GM_addStyle(`
            /* --- Footer Height and Positioning Adjustment --- */
            #footer-outterwrap {
                height: calc(100% + 20px) !important;
                min-height: calc(100% + 20px) !important;
            }
            #footer-outterwrap table {
                height: 100% !important;
            }
            #footer-outterwrap table td[width="60%"] {
                text-align: center;
            }
            
            /* --- Global CSS Variables for Theming --- */
            :root {
                --tm-primary-color: #007bff;
                --tm-buff-timer-bg-color: rgba(255, 255, 255, 0.1);
                --tm-primary-hover: #0056b3;
                --tm-secondary-color: #6c757d;
                --tm-secondary-hover: #5a6268;
                --tm-success-color: #28a745;
                --tm-success-hover: #218838;
                --tm-danger-color: #dc3545;
                --tm-danger-hover: #c82333;
                --tm-warning-color: #ffc107;
                --tm-warning-hover: #e0a800;
                --tm-info-color: #17a2b8;
                --tm-info-hover: #138496;
                --tm-dark-color: #343a40;
                --tm-dark-hover: #23272b;

                /* Shop Item Styles */
                --tm-shop-item-bg: #f8f9fa;
                --tm-shop-item-border: #dee2e6;
                --tm-shop-item-hover-bg: #e9ecef;
                --tm-shop-item-owned-bg: #e7f1ff;
            }
            /* --- Feature: Advanced Search --- */
            /* --- Notification Center Styles --- */
            #tm-notification-bell-wrapper { position: relative; }
            #tm-notification-bell-btn {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            #tm-notification-bell-btn:hover { 
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(255, 152, 0, 0.4) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            #tm-notification-unread-count {
                position: absolute; top: -2px; right: -2px;
                background-color: var(--tm-danger-color); color: white;
                border-radius: 50%; width: 18px; height: 18px;
                font-size: 11px; font-weight: bold;
                display: flex; align-items: center; justify-content: center;
                pointer-events: none;
                transform: scale(0); transition: transform 0.2s ease-out;
            }
            #tm-notification-unread-count.visible { transform: scale(1); }
            #tm-notification-panel {
                position: absolute; bottom: 50px; right: 0;
                width: 350px; max-height: 400px;
                background: #fff; border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10001; display: flex; flex-direction: column;
                overflow: hidden;
            }
            .tm-notification-header { padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .tm-notification-header h4 { margin: 0; font-size: 16px; }
            .tm-notification-header button { background: none; border: none; color: var(--tm-primary-color); cursor: pointer; font-size: 12px; text-decoration: underline; }
            #tm-notification-list { flex-grow: 1; overflow-y: auto; padding: 8px; }
            .tm-notification-item { display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #f5f5f5; }
            .tm-notification-item:last-child { border-bottom: none; }
            .tm-notification-item.unread { background-color: #f0f8ff; }
            .tm-notification-icon { font-size: 18px; flex-shrink: 0; }
            .tm-notification-content { flex-grow: 1; }
            .tm-notification-message { font-size: 14px; color: #333; }
            .tm-notification-timestamp { font-size: 11px; color: #888; margin-top: 4px; }
            #tm-notification-empty-state { text-align: center; color: #999; padding: 40px 20px; }









            /* --- Talent Tree Styles --- */
            .tm-talent-points-display { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 10px; background: #f0f8ff; padding: 8px; border-radius: 6px; }
            .tm-talent-points-display span { color: var(--tm-primary-color); }
            #tm-talents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
            .tm-talent-item { border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; text-align: center; background: #fff; transition: all 0.2s ease; }
            .tm-talent-item.unlocked { background: #e7f1ff; border-left: 4px solid var(--tm-primary-color); }
            .tm-talent-name { font-weight: bold; font-size: 15px; margin-bottom: 8px; }
            .tm-talent-description { font-size: 12px; color: #6c757d; min-height: 40px; margin-bottom: 12px; }
            .tm-talent-btn { width: 100%; padding: 8px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; color: white; }
            .tm-talent-btn.unlockable { background-color: var(--tm-success-color); }
            .tm-talent-btn.unlockable:hover { background-color: var(--tm-success-hover); }
            .tm-talent-btn.unlocked { background-color: var(--tm-secondary-color); cursor: default; }
            .tm-talent-btn:disabled:not(.unlocked) { background-color: #ccc; cursor: not-allowed; }

            /* --- Data Management Styles --- */
            .tm-data-actions { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
            .tm-data-btn {
                padding: 12px 25px;
                font-size: 16px;
                font-weight: bold;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.1s;
            }
            .tm-data-btn.export { background-color: var(--tm-primary-color); }
            .tm-data-btn.export:hover {
                background-color: var(--tm-primary-hover);
                transform: translateY(-2px);
            }
            .tm-data-btn.import { background-color: var(--tm-info-color); }
            .tm-data-btn.import:hover {
                background-color: var(--tm-info-hover);
                transform: translateY(-2px);
            }
            .tm-data-btn.reset { background-color: var(--tm-danger-color); }
            .tm-data-btn.reset:hover {
                background-color: var(--tm-danger-hover);
            }





            #tm-search-container {
                position: fixed;
                top: 100px;
                right: 0;
                z-index: 9999;
                padding: 20px 5px 20px 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: flex-end; /* Align buttons to the right edge */
            }

            /* Common style for buttons that slide out from the right */
            .tm-slide-out-btn {
                padding: 10px 15px;
                border: none;
                border-top-left-radius: 8px;
                border-bottom-left-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                box-shadow: -2px 2px 8px rgba(0,0,0,0.2);
                transform: translateX(100%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                pointer-events: none; /* Not clickable when hidden */
                color: white;
                width: 180px; /* Set a fixed width for consistency */
                text-align: left; /* Align text to the left */
                box-sizing: border-box; /* Ensure padding is included in the width */
            }

            /* Individual button colors */
            #tm-search-btn { background-color: var(--tm-primary-color); }
            #tm-search-btn:hover { background-color: var(--tm-primary-hover); }

            #tm-quests-btn { background-color: #8B4513; } /* SaddleBrown */
            #tm-quests-btn:hover { background-color: #A0522D; } /* Sienna */

            #tm-tech-stats-btn { background-color: var(--tm-info-color); }
            #tm-tech-stats-btn:hover { background-color: var(--tm-info-hover); }

            /* Customer History Link Style */
            .tm-customer-history-link {
                cursor: pointer; text-decoration: underline; color: var(--tm-info-color);
                font-weight: bold;
            }

            /* Customer History Modal Content */
            #tm-customer-history-container {
                overflow-y: auto; /* Make the history list scrollable */
            }

            /* Sortable headers in history modal */
            .tm-sortable-header {
                cursor: pointer;
            }
            .tm-sortable-header:hover { background-color: #e9ecef; }
            /* Hover effect on container to show buttons */
            #tm-search-container:hover .tm-slide-out-btn {
                transform: translateX(0);
                opacity: 1;
                pointer-events: auto;
            }

            /* Modal Styles */
            .tm-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.6); z-index: 10000;
                display: flex; align-items: center; justify-content: center;
                animation: tm-fade-in 0.3s ease-out;
                pointer-events: auto;
            }
            .tm-modal-content {
                background: #fff; padding: 25px; border-radius: 8px;
                width: 90%; max-width: 800px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                height: 85vh; /* Use fixed height to prevent resizing between tabs */
                display: flex; flex-direction: column;
                animation: tm-scale-up 0.3s ease-out;
                pointer-events: auto;
                position: relative;
                z-index: 1;
            }
            #tm-settings-content {
                flex-grow: 1;
                overflow-y: auto;
                padding-right: 10px; /* Space for scrollbar */
            }
            .tm-modal-header {
                display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid #dee2e6; padding-bottom: 15px; margin-bottom: 20px;
                pointer-events: auto;
                position: relative;
                z-index: 2;
            }
            .tm-modal-title { font-size: 20px; color: #333; margin: 0; flex-grow: 1; text-align: center; pointer-events: none; }
            .tm-integrated-panel-header {
                display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid #dee2e6; padding-bottom: 15px; margin-bottom: 20px;
            }
            .tm-integrated-panel-title {
                font-size: 20px; color: #333; margin: 0; flex-grow: 1;
                text-align: center; pointer-events: none;
            }
            /* Settings layout as panel with sidebar */
            .tm-settings-layout {
                display: flex;
                gap: 16px;
                flex-grow: 1; /* Allow this layout to fill the space */
                overflow: hidden; /* Prevent this container from scrolling */
            }
            .tm-settings-sidebar { width: 220px; border-right: 1px solid #eee; padding-right: 12px; }
            .tm-settings-sidebar .tm-nav { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
            .tm-settings-sidebar .tm-nav a { text-decoration: none; color: #333; font-weight: 600; border-radius: 6px; padding: 8px 10px; display: block; background: #f8f9fa; }
            .tm-settings-sidebar .tm-nav a.active { background: #e7f1ff; color: #0b5ed7; }
            .tm-settings-sidebar .tm-nav a:hover { background: #eef2f7; }
            .tm-settings-main { flex: 1; padding-left: 4px; }
            .tm-settings-main section { display: none; }
            .tm-settings-main section.active { display: block; }
            @keyframes tm-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes tm-scale-up {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes bossSlideDown {
                from { 
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to { 
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
            @keyframes bossModalPulse {
                0%, 100% { box-shadow: 0 0 50px rgba(255, 82, 82, 0.5), inset 0 0 30px rgba(255, 82, 82, 0.1); }
                50% { box-shadow: 0 0 60px rgba(255, 82, 82, 0.7), inset 0 0 40px rgba(255, 82, 82, 0.15); }
            }
            @keyframes bossHeaderShine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }
            @keyframes bossIconFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes bossRingPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
            }
            @keyframes bossProgressComplete {
                0%, 100% { box-shadow: 0 0 20px #4caf50; }
                50% { box-shadow: 0 0 30px #4caf50, 0 0 40px #4caf50; }
            }
            @keyframes bossButtonGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1); }
                50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.2); }
            }
            @keyframes bossTimerPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            .tm-modal-close { font-size: 28px; font-weight: bold; cursor: pointer; border: none; background: none; color: var(--tm-secondary-color); position: relative; z-index: 10; pointer-events: auto; }
            .tm-modal-close:hover { color: var(--tm-secondary-hover); }

            /* Search Input Area */
            #tm-search-input-area { display: flex; margin-bottom: 20px; pointer-events: auto; position: relative; z-index: 1; }
            #tm-search-input { flex-grow: 1; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; text-align: center; pointer-events: auto; }
            #tm-search-submit { padding: 10px 20px; font-size: 16px; background-color: var(--tm-success-color); color: white; border: none; cursor: pointer; pointer-events: auto; }
            #tm-search-submit:disabled { background-color: var(--tm-secondary-color); cursor: not-allowed; }
            /* Default focus style for search input */
            #tm-search-input:focus {
                border-color: var(--tm-primary-color);
                box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); /* Standard bootstrap-like focus */
                transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
            }
            /* "Hacker" effect on focus, only when theme is enabled */
            .tm-hacker-theme-enabled #tm-search-input:focus {
                border-color: #0f0;
                box-shadow: 0 0 8px #0f0, 0 0 15px #0f0;
                color: #0f0;
                background-color: #030d03;
                text-shadow: 0 0 4px #0f0;
            }
            /* Full hacker theme for the search modal */
            .tm-hacker-theme-enabled .tm-modal-content {
                background: #050505;
                color: #0f0;
                border: 1px solid #0f0;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            }
            .tm-hacker-theme-enabled .tm-modal-header { border-bottom-color: #0f0; }
            .tm-hacker-theme-enabled .tm-modal-title { color: #0f0; }
            .tm-hacker-theme-enabled .tm-modal-close { color: #0f0; }
            .tm-hacker-theme-enabled #tm-search-submit { background-color: #009900; border-color: #0f0; }
            .tm-hacker-theme-enabled #tm-search-submit:hover { background-color: #00cc00; }
            .tm-hacker-theme-enabled #tm-search-favorite-btn { border-color: #0f0; color: #0f0; }
            .tm-hacker-theme-enabled #tm-search-favorite-btn.favorited { color: #ffff00; }
            .tm-hacker-theme-enabled #tm-search-history-favorites-container { border-top-color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-list-section h4 { color: #0f0; border-bottom-color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-list-item a { color: #3f3; }
            .tm-hacker-theme-enabled .tm-search-list-action-btn { color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-list-action-btn:hover { color: #ff0000; }
            .tm-hacker-theme-enabled #tm-status-message { color: #0f0; }
            .tm-hacker-theme-enabled .tm-result-item { border-color: #0f0; background: #080808; }
            .tm-hacker-theme-enabled .tm-result-header { background: #111; }
            .tm-hacker-theme-enabled .tm-result-table td { border-color: #0f0; }
            .tm-hacker-theme-enabled .tm-result-highlight { background-color: #00ff00; color: #000; }
            .tm-hacker-theme-enabled .tm-goto-btn, .tm-hacker-theme-enabled .tm-print-btn { background-color: #009900; }
            .tm-hacker-theme-enabled .tm-goto-btn:hover, .tm-hacker-theme-enabled .tm-print-btn:hover { background-color: #00cc00; }

            /* Search History & Favorites */
            #tm-search-input { border-top-right-radius: 0; border-bottom-right-radius: 0; }
            #tm-search-favorite-btn {
                padding: 10px; font-size: 18px; background: none;
                border: 1px solid #ccc; border-left: none;
                cursor: pointer; color: #6c757d;
                display: flex; align-items: center; justify-content: center;
                pointer-events: auto;
            }
            #tm-search-favorite-btn:hover { background-color: #f0f0f0; }
            #tm-search-favorite-btn.favorited { color: var(--tm-warning-color); /* Gold for favorited */ }
            #tm-search-submit { border-radius: 0 4px 4px 0; }

            #tm-search-history-favorites-container {
                display: flex;
                gap: 20px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                pointer-events: auto;
            }
            .tm-search-list-section { flex: 1; min-width: 0; }
            .tm-search-list-section h4 {
                margin-top: 0; margin-bottom: 8px; font-size: 14px;
                color: #555; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;
            }
            .tm-search-list {
                list-style: none; padding: 0; margin: 0;
                max-height: 120px; overflow-y: auto;
            }
            .tm-search-list-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 4px 0; font-size: 13px;
            }
            .tm-search-list-item a {
                color: var(--tm-primary-color); text-decoration: none; cursor: pointer;
                flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                pointer-events: auto;
            }
            .tm-search-list-item a:hover { text-decoration: underline; }
            .tm-search-list-action-btn {
                background: none; border: none; cursor: pointer; font-size: 14px;
                margin-left: 5px; color: #888; padding: 2px; line-height: 1;
                flex-shrink: 0;
                pointer-events: auto;
            }
            .tm-search-list-action-btn:hover { color: #dc3545; } /* Red for remove */

            /* Results Area */
            #tm-results-container { overflow-y: auto; pointer-events: auto; }
            .tm-result-item { border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px; overflow: hidden; pointer-events: auto; }
            .tm-result-clickable { cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; pointer-events: auto; }
            .tm-result-clickable:hover {
                box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
            }
            .tm-result-header { background-color: #f7f7f7; padding: 8px 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; text-align: center; }
            .tm-result-body { padding: 12px; }
            .tm-result-table { width: 100%; border-collapse: collapse; }
            .tm-result-table td { padding: 5px; border-bottom: 1px solid #eee; font-size: 13px; text-align: center; }
            .tm-result-table tr:last-child td { border-bottom: none; }
            .tm-result-highlight { background-color: yellow; }
            .tm-print-btn, .tm-goto-btn {
                background-color: var(--tm-info-color); color: white; border: none; border-radius: 4px;
                padding: 5px 10px; font-size: 12px; cursor: pointer; text-decoration: none;
                margin-left: 5px;
                pointer-events: auto;
            }
            .tm-print-btn:hover { background-color: var(--tm-info-hover); }
            .tm-goto-btn {
                background-color: var(--tm-success-color);
            }
            .tm-goto-btn:hover {
                background-color: var(--tm-success-hover);
            }

            /* Quick Action Buttons within details */
            .tm-quick-action-btn {
                margin-left: 5px;
                padding: 2px 5px;
                font-size: 10px;
                background-color: var(--tm-primary-color);
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                vertical-align: middle; /* Align with text */
            }
            .tm-quick-action-btn:hover {
                background-color: var(--tm-primary-hover);
            }
            #tm-status-message { text-align: center; padding: 20px; font-size: 16px; color: #666; }

            /* Inline Details Styles */
            .tm-result-details-container {
                padding: 15px;
                background-color: #fdfdfd;
                border-top: 1px dashed #ccc;
            }
            .tm-details-loading, .tm-details-error {
                color: #888; font-style: italic; padding: 10px 0;
            }
            .tm-details-error { color: var(--tm-danger-color); }
            .tm-details-table { width: 100%; border-collapse: collapse; }
            .tm-details-table td {
                padding: 8px; border: 1px solid #e9ecef; text-align: center;
                font-size: 13px; vertical-align: top;
            }
            .tm-details-label {
                font-weight: bold; background-color: #f8f9fa;
                width: 25%;
            }
            .tm-details-value {
                width: 75%; white-space: pre-wrap; word-break: break-word;
            }

            /* --- Feature: Auto-Refresh Timer - Circular Countdown Design --- */
            #tm-refresh-timer-container {
                position: relative;
                width: 40px;
                height: 40px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #tm-refresh-timer-container:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            
            /* --- Weather Widget Glass Theme --- */
            #tm-weather-widget {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
            }
            #tm-weather-widget:hover {
                border-color: rgba(255,255,255,0.4) !important;
            }
            .tm-refresh-circle {
                width: 34px;
                height: 34px;
                transform: rotate(-90deg);
                position: absolute;
            }
            .tm-refresh-circle-bg {
                fill: none;
                stroke: rgba(255,255,255,0.15);
                stroke-width: 2.5;
            }
            .tm-refresh-circle-progress {
                fill: none;
                stroke: #3b82f6;
                stroke-width: 2.5;
                stroke-linecap: round;
                transition: stroke 0.3s ease, stroke-dashoffset 0.5s linear;
            }
            .tm-refresh-time-text {
                position: relative;
                font-size: 10px;
                font-weight: 700;
                color: white;
                pointer-events: none;
                text-align: center;
                line-height: 1;
                font-family: 'Courier New', monospace;
                z-index: 1;
            }

            /* --- Feature: Quick Search Buttons --- */
            #tm-quick-search-container {
                /* Injected as a set of inline buttons/tags */
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin-left: 15px; /* Space from the 'Add' button */
            }
            #tm-quick-search-panel {
                display: contents; /* Makes the panel a non-visual container */
            }
            /* Quick search buttons will use rnr-button class for native MyManager styling */

            /* --- Feature: Settings Panel --- */
            #tm-settings-btn {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            #tm-settings-btn:hover { 
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            
            /* --- Daily Dashboard Widget Glass Theme --- */
            #tm-daily-dashboard-widget {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                color: white !important;
            }
            #tm-daily-dashboard-widget:hover {
                background: linear-gradient(135deg, rgba(0, 191, 255, 0.4) 0%, rgba(0, 149, 255, 0.4) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            
            /* New Settings Panel Styles */
            .tm-settings-section {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            .tm-settings-section:last-of-type {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .tm-settings-section h3 {
                margin-top: 0;
                margin-bottom: 20px;
                font-size: 16px;
                color: #343a40;
                text-align: left;
                border-bottom: 1px solid #f1f1f1;
                padding-bottom: 10px;
            }
            .tm-setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding: 0 10px;
            }
            .tm-setting-label {
                flex-basis: 60%;
                text-align: left;
            }
            .tm-setting-label label {
                font-weight: bold;
                color: #495057;
                font-size: 14px;
            }
            .tm-setting-control {
                flex-basis: 35%;
                text-align: right;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
            }
            .tm-setting-control input[type="number"] {
                width: 70px;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                text-align: center;
            }
            .tm-setting-control input[type="checkbox"] {
                transform: scale(1.3);
                cursor: pointer;
            }
            .tm-setting-description {
                font-size: 12px;
                color: #6c757d;
                margin-top: 4px;
                text-align: left;
                margin-bottom: 0;
            }
            #tm-settings-feedback {
                margin-left: 15px; color: #28a745; font-weight: bold;
                font-size: 14px;
                transition: opacity 0.3s;
            }
            .tm-modal-footer {
                padding-top: 20px;
                margin-top: 10px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
            }
            #tm-settings-save, #tm-settings-reset {
                padding: 12px 25px;
                font-size: 16px;
                font-weight: bold;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                min-width: 220px; /* Ensure buttons have the same width */
                transition: background-color 0.2s, transform 0.1s ease-out, box-shadow 0.2s;
            }
            #tm-settings-save { background-color: var(--tm-primary-color); }
            #tm-settings-save:hover {
                background-color: var(--tm-primary-hover);
                transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            #tm-settings-reset { background-color: var(--tm-secondary-color); }
            #tm-settings-reset:hover { background-color: var(--tm-secondary-hover); }

            /* Specific Editor Styles */
            #tm-quick-search-editor .tm-quick-search-row {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: center;
            }
            #tm-quick-search-editor input[type="text"] {
                padding: 8px;
                border: 1px solid #ccc; text-align: center;
                border-radius: 4px;
                flex: 1;
            }
            .tm-quick-search-remove-btn, #tm-quick-search-add-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: white;
            }
            .tm-quick-search-remove-btn { background-color: var(--tm-danger-color); }
            .tm-quick-search-remove-btn:hover { background-color: var(--tm-danger-hover); }
            #tm-quick-search-add-btn { background-color: var(--tm-primary-color); margin-top: 5px; }
            #tm-quick-search-add-btn:hover { background-color: var(--tm-primary-hover); }

            #tm-working-hours-editor {
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 5px;
                margin-top: 15px;
            }
            #tm-working-hours-time-inputs {
                display: flex;
                justify-content: center;
                gap: 10px;
                align-items: center;
                margin-bottom: 15px;
            }
            #tm-working-days-editor {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 15px;
            }
            #tm-working-days-editor label {
                font-weight: normal;
            }
            /* --- Bottom Center Controls Container --- */
            #tm-bottom-center-container {
                position: fixed;
                bottom: 50px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            /* --- Supercharged Scratchpad Styles --- */
            #tm-scratchpad-tabs-container {
                display: flex;
                background-color: #f0f0f0;
                border-bottom: 1px solid #ccc;
                padding: 5px 5px 0 5px;
            }
            #tm-scratchpad-tabs { display: flex; flex-grow: 1; gap: 2px; }
            .tm-scratchpad-tab {
                padding: 6px 10px; background: #ddd; border-radius: 5px 5px 0 0;
                cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 5px;
            }
            .tm-scratchpad-tab.active { background: #fff; font-weight: bold; }
            .tm-scratchpad-tab.pinned { border-left: 3px solid var(--tm-primary-color); }
            .tm-scratchpad-tab-pin { background: none; border: none; cursor: pointer; font-size: 12px; padding: 0 2px; opacity: 0.6; }
            .tm-scratchpad-tab-close { background: none; border: none; cursor: pointer; font-size: 14px; padding: 0 2px; }
            .tm-scratchpad-tab-close:hover { color: var(--tm-danger-color); }
            #tm-scratchpad-new-tab-btn {
                background: #ccc; border: none; border-radius: 5px 5px 0 0; padding: 0 8px;
                font-size: 16px; font-weight: bold; cursor: pointer;
            }
            #tm-scratchpad-new-tab-btn:hover { background: #bbb; }
            #tm-scratchpad-editor { flex-grow: 1; padding: 10px; overflow-y: auto; outline: none; }
            #tm-scratchpad-editor h1, #tm-scratchpad-editor h2 { margin: 0.5em 0; padding-bottom: 0.2em; border-bottom: 1px solid #eee; }
            .tm-scratchpad-checkbox { vertical-align: middle; margin: 0 2px; }
            .tm-scratchpad-source-link { font-size: 10px; text-decoration: none; background: #f0f0f0; padding: 1px 4px; border-radius: 3px; color: var(--tm-info-color); }
            .tm-scratchpad-source-link:hover { background: #e0e0e0; }
            /* --- Footer Controls Container --- */
            #tm-footer-controls-container {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                max-width: 1400px;
                margin: 0 auto;
                gap: 8px;
            }
            #tm-footer-controls-left {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                justify-content: flex-end;
            }
            #tm-footer-controls-middle {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 auto;
                gap: 8px;
            }
            #tm-footer-controls-right {
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                justify-content: flex-start;
            }

            /* --- Feature: Persistent Scratchpad --- */
            #tm-scratchpad-toggle-btn {
                background-color: var(--tm-secondary-color); /* Specific color */
            }
            #tm-scratchpad-toggle-btn:hover { background-color: var(--tm-secondary-hover); }
            #tm-scratchpad-container {
                position: fixed; /* Will be adjusted by JS */
                bottom: 60px;
                left: 20px; /* Default position */
                z-index: 9998;
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: none; /* Hidden by default */
                flex-direction: column;
                width: 250px; /* Default width */
                height: 300px; /* Default height */
                resize: both; /* Allow user resizing */
                overflow: hidden; /* Important for resize */
                min-width: 150px;
                min-height: 100px;
            }
            #tm-scratchpad-header {
                background-color: #e9ecef;
                padding: 6px 10px;
                cursor: move; /* Allow dragging */
                border-bottom: 1px solid #ccc;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none; /* Prevent text selection while dragging */
                height: 32px;
                box-sizing: border-box;
            }
            #tm-scratchpad-title { font-weight: bold; font-size: 13px; color: #333; flex-grow: 1; }
            #tm-scratchpad-search {
                border: 1px solid #ccc; border-radius: 10px; padding: 2px 8px;
                font-size: 11px; width: 100px; transition: width 0.3s;
            }
            #tm-scratchpad-search:focus { width: 150px; }
            #tm-scratchpad-header-controls { display: flex; align-items: center; gap: 8px; }
            #tm-scratchpad-header-controls button {
                background: none; border: none; font-size: 16px;
                cursor: pointer; color: #555; line-height: 1;
                padding: 2px 4px; border-radius: 3px;
            }
            #tm-scratchpad-header-controls button:hover { background-color: #d4d9de; color: #000; }
            #tm-scratchpad-clear-btn:hover { color: var(--tm-danger-hover); }
            #tm-scratchpad-close-btn:hover { color: var(--tm-dark-hover); }
            #tm-scratchpad-last-edited {
                font-size: 10px; color: #6c757d; margin-left: 10px; font-style: italic;
            }
            #tm-scratchpad-reminder-popover {
                position: absolute;
                top: 35px;
                right: 10px;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 6px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                padding: 15px;
                width: 280px;
                display: none; /* Hidden by default */
                flex-direction: column;
                gap: 10px;
            }
            #tm-scratchpad-reminder-popover h5 { margin: 0 0 10px 0; font-size: 14px; text-align: center; }
            #tm-scratchpad-reminder-popover input, #tm-scratchpad-reminder-popover select {
                width: 100%;
                padding: 8px;
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            #tm-scratchpad-reminder-controls { display: flex; gap: 10px; justify-content: space-between; }
            #tm-scratchpad-reminder-controls button {
                flex: 1;
                padding: 8px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: white;
            }
            #tm-scratchpad-set-reminder-btn { background-color: var(--tm-primary-color); }
            #tm-scratchpad-set-reminder-btn:hover { background-color: var(--tm-primary-hover); }
            #tm-scratchpad-reminder-1hr-btn { background-color: var(--tm-info-color); }
            #tm-scratchpad-reminder-1hr-btn:hover { background-color: var(--tm-info-hover); }
            #tm-scratchpad-reminder-cancel-btn { background-color: var(--tm-secondary-color); }
            #tm-scratchpad-reminder-cancel-btn:hover { background-color: var(--tm-secondary-hover); }
            #tm-scratchpad-active-reminder { font-size: 11px; color: var(--tm-success-color); font-weight: bold; margin-top: 5px; text-align: center; }
            #tm-scratchpad-clear-reminder-btn { background: none; border: none; color: var(--tm-danger-color); cursor: pointer; text-decoration: underline; font-size: 11px; }
            #tm-scratchpad-reminder-btn.active { color: var(--tm-primary-color); }
            .tm-scratchpad-popover {
                position: absolute; top: 70px; right: 10px;
                background: #fff; border: 1px solid #ccc; border-radius: 6px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10000;
                padding: 15px; width: 200px; display: none;
            }
            .tm-scratchpad-popover h5 { margin: 0 0 10px 0; font-size: 14px; text-align: center; }
            #tm-scratchpad-template-list { display: flex; flex-direction: column; gap: 5px; }
            #tm-scratchpad-template-list button {
                padding: 8px; border: 1px solid #ccc; border-radius: 4px;
                background: #f8f9fa; cursor: pointer; text-align: left;
            }
            #tm-scratchpad-toolbar {
                background-color: #f0f0f0;
                padding: 5px;
                border-bottom: 1px solid #ccc;
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                justify-content: center;
            }
            #tm-scratchpad-toolbar button {
                background: none;
                border: 1px solid transparent; /* Add border for consistent size */
                font-size: 14px;
                cursor: pointer;
                color: #333;
                line-height: 1;
                padding: 4px 6px;
                border-radius: 4px;
                min-width: 28px; /* Ensure consistent width */
                transition: background-color 0.2s, border-color 0.2s;
            }
            #tm-scratchpad-toolbar button:hover { background-color: #d4d9de; border-color: #bbb; }
            .tm-toolbar-separator {
                width: 1px;
                background-color: #ccc;
                margin: 2px 5px;
                align-self: stretch;
            }
            /* Maximized state for scratchpad */
            #tm-scratchpad-container.maximized {
                transition: all 0.3s ease-in-out !important;
            }




            /* --- Feature: Scroll to Top Button --- */
            #tm-scroll-to-top-btn {
                position: fixed;
                bottom: 20px;
                left: 20px; /* Moved from right */
                z-index: 9997; /* Below other controls */
                background-color: var(--tm-dark-color);
                color: white;
                border: none;
                width: 32px; /* Made smaller */
                height: 32px; /* Made smaller */
                border-radius: 50%;
                font-size: 18px; /* Made smaller */
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: none; /* Hidden by default */
                align-items: center;
                justify-content: center;
                transition: opacity 0.3s, visibility 0.3s;
            }

            /* --- Fun Feature: Confetti --- */
            .tm-confetti-particle {
                position: fixed;
                top: 0;
                left: 0;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                animation: tm-confetti-fall 3s ease-out forwards;
            }
            @keyframes tm-confetti-fall {
                0% {
                    transform: translateY(-10vh) rotateZ(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(110vh) rotateZ(720deg);
                    opacity: 0;
                }
            }

            /* --- Fun Feature: Fireworks --- */
            .tm-firework-particle {
                position: fixed;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                animation: tm-firework-explode var(--duration, 1s) ease-out forwards;
            }
            @keyframes tm-firework-explode {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--tx), var(--ty)) scale(0);
                    opacity: 0;
                }
            }
            .tm-firework-flash {
                position: fixed;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
                pointer-events: none;
                z-index: 99998;
                transform: translate(-50%, -50%);
                animation: tm-firework-flash 0.3s ease-out forwards;
            }
            @keyframes tm-firework-flash {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }

            /* --- Feature: Achievement Notification --- */
            #tm-achievement-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: var(--tm-success-color);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                font-size: 14px;
                font-weight: bold;
                z-index: 10000;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease-out, transform 0.5s ease-out;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            #tm-achievement-notification.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* --- Fun Feature: Hacker Terminal Loader --- */
            #tm-hacker-terminal {
                background-color: #000;
                color: #0f0;
                font-family: 'Courier New', monospace;
                padding: 20px;
                border-radius: 5px;
                height: 300px;
                overflow-y: hidden;
                display: flex;
                flex-direction: column;
                justify-content: flex-end; /* Start from the bottom */
            }
            #tm-hacker-output {
                font-size: 14px;
                line-height: 1.4;
                white-space: pre-wrap;
                word-break: break-all;
            }
            #tm-hacker-output div {
                opacity: 0;
                animation: tm-fade-in 0.2s forwards;
            }
            .tm-hacker-cursor {
                display: inline-block;
                width: 10px;
                height: 16px;
                background-color: #0f0;
                animation: tm-hacker-blink 1s step-end infinite;
                vertical-align: bottom;
            }
            @keyframes tm-hacker-blink {
                from, to { background-color: transparent; }
                50% { background-color: #0f0; }
            }
            #tm-hacker-output .tm-hacker-success {
                color: #0f0;
                font-weight: bold;
                background-color: #0f0;
                color: #000;
                padding: 2px 5px;
            }

            /* --- Minimalist Search Loader --- */
            .tm-minimal-loader {
                display: flex; align-items: center; justify-content: center; gap: 10px;
            }
            .tm-spinner {
                display: inline-block;
                width: 20px; height: 20px;
                border: 3px solid rgba(0,0,0,0.2);
                border-radius: 50%;
                border-top-color: var(--tm-primary-color);
                animation: tm-spin 1s ease-in-out infinite;
            }
            @keyframes tm-spin {
                to { transform: rotate(360deg); }
            }
            /* --- Fun Feature: Level Up Animation --- */
            #tm-level-up-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: #000; z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                transition: opacity 1s ease-out;
                overflow-x: hidden; /* Hide horizontal overflow for rays */
                overflow-y: auto; /* Allow vertical scrolling */
                animation: tm-level-up-bg-fade-in 0.5s ease-out;
                padding: 20px; /* Add padding for smaller screens */
            }
            @keyframes tm-level-up-bg-fade-in {
                from { background: rgba(0,0,0,0.7); }
                to { background: #000; }
            }
            #tm-level-up-overlay.legendary {
                --level-up-color-1: #ffc107;
                --level-up-color-2: #e5cc80;
            }
            #tm-level-up-overlay::before {
                content: ''; 
                position: absolute; 
                top: 0; 
                left: 0;
                width: 100%; 
                height: 100%;
                background: radial-gradient(ellipse at center, 
                    var(--level-up-color-1, #007bff) 0%, 
                    transparent 60%);
                opacity: 0.2;
                animation: tm-level-up-bg-pulse 2s ease-in-out infinite;
            }
            .tm-level-up-content {
                text-align: center; color: white;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                animation: tm-level-up-content-appear 0.5s ease-out forwards;
                max-height: 90vh; /* Limit height to viewport */
                overflow-y: auto; /* Allow scrolling if content is too tall */
                overflow-x: hidden; /* Prevent horizontal scroll */
                padding: 20px;
                box-sizing: border-box;
                position: relative; /* For proper z-index stacking */
                z-index: 1; /* Above the background effects */
                -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
            }
            /* Custom scrollbar for level-up content */
            .tm-level-up-content::-webkit-scrollbar {
                width: 8px;
            }
            .tm-level-up-content::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
            }
            .tm-level-up-content::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.4);
                border-radius: 4px;
            }
            .tm-level-up-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.6);
            }
            .tm-level-up-title {
                font-size: 10vw; font-weight: bold;
                animation: tm-level-up-slide-in 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                opacity: 0;
            }
            #tm-level-up-overlay.legendary .tm-level-up-content {
                border: 2px solid #e5cc80;
                border-radius: 12px;
                padding: 2vw 4vw;
                box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
                margin: auto; /* Center when scrolling */
            }
            .tm-level-up-new-level {
                font-size: 5vw; margin: 10px 0 20px 0;
                animation: tm-level-up-slide-in 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.2s forwards;
                opacity: 0;
            }
            .tm-level-up-rewards-container {
                display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
            }
            .tm-level-up-reward {
                font-size: 2.5vw; color: #ffc107;
                background: rgba(255,255,255,0.1); padding: 5px 10px;
                border-radius: 5px; display: inline-block;
                opacity: 0;
                animation: tm-level-up-slide-in 0.6s ease-out 0.5s forwards;
            }
            /* Staggered animation for rewards */
            .tm-level-up-reward:nth-child(2) { animation-delay: 0.6s; }
            .tm-level-up-reward:nth-child(3) { animation-delay: 0.7s; }
            .tm-level-up-reward:nth-child(4) { animation-delay: 0.8s; }

            /* New: Progress Bar for level up */
            .tm-level-up-progress-bar {
                width: 80%; max-width: 400px; height: 10px;
                background: rgba(255,255,255,0.2); border-radius: 5px;
                margin: 20px auto; overflow: hidden;
            }
            .tm-level-up-progress-fill {
                width: 0%; height: 100%;
                background: linear-gradient(90deg, #ffc107, #ff8000);
                border-radius: 5px;
                transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tm-level-up-stat-increase {
                font-size: 1.5vw; color: #eee; font-style: italic;
                margin-top: 20px;
                opacity: 0;
                animation: tm-level-up-slide-in 0.8s ease-out 1s forwards;
            }
            .tm-level-up-evolution {
                font-size: 3vw; color: #ffc107; margin-top: 20px;
                animation: tm-level-up-slide-in 0.8s ease-out 0.3s forwards;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                opacity: 0;
            }
            @keyframes tm-level-up-bg-pulse {
                0%, 100% { 
                    opacity: 0.15;
                    transform: scale(1);
                }
                50% { 
                    opacity: 0.25;
                    transform: scale(1.05);
                }
            }
            @keyframes tm-level-up-content-appear {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes tm-level-up-slide-in {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes tm-level-up-throb {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* --- New: Mascot Mood Backgrounds --- */
            #tm-mascot-container::before {
                content: ''; position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); width: 200px; height: 200px;
                border-radius: 50%; z-index: -1; transition: all 0.8s ease-in-out;
                opacity: 0;
            }
            #tm-mascot-container.mascot-happy::before {
                background: radial-gradient(circle, rgba(255,223,186,0.6) 0%, rgba(255,223,186,0) 70%);
                opacity: 1;
            }
            #tm-mascot-container.mascot-sad::before {
                background: radial-gradient(circle, rgba(176,196,222,0.7) 0%, rgba(176,196,222,0) 70%);
                opacity: 1;
            }
            #tm-mascot-container.mascot-energized::before {
                background: radial-gradient(circle, rgba(0,191,255,0.5) 0%, rgba(0,191,255,0) 60%);
                box-shadow: 0 0 25px rgba(0,191,255,0.7);
                opacity: 1;
                animation: tm-energized-aura-pulse 1.5s ease-in-out infinite;
                will-change: opacity;
            }
            
            @keyframes tm-energized-aura-pulse {
                0%, 100% { 
                    opacity: 0.5;
                }
                50% { 
                    opacity: 0.8;
                }
            }
            /* --- Fun Feature: Interactive Mascot --- */
            #tm-mascot-container {
                position: fixed;
                top: 0;
                left: 0;
                /* Optimized for smooth movement */
                will-change: transform;
                transform: translate3d(0, 0, 0); /* Enable hardware acceleration */
                backface-visibility: hidden; /* Prevent flickering */
                -webkit-backface-visibility: hidden;
                perspective: 1000px; /* Enable 3D transforms for smoother animation */

                width: 100px;
                height: 100px;
                z-index: 9990;
                pointer-events: none; /* The container itself is not clickable... */
            }
            /* ...but the robot and its panel inside are. */
            #tm-mascot-container > svg, #tm-mascot-container > #tm-mascot-interaction-panel {
                pointer-events: auto;
            }
            .tm-mascot-robot {
                width: 100%; height: 100%;
                /* Default idle animation - applies to ALL evolutions */
                animation: tm-mascot-idle-float 4s ease-in-out infinite;
                cursor: pointer;
                image-rendering: pixelated; /* Key for the retro look */
                /* Performance optimizations */
                will-change: transform;
                transform: translateZ(0); /* Force hardware acceleration */
            }
            /* Optimize all mascot accessories for smooth animation */
            .tm-mascot-accessory, #top_hat, #master_crown, #jetpack,
            .tm-mascot-book, .tm-mascot-bicycle, .tm-mascot-ball,
            .tm-mascot-sunglasses, .tm-mascot-umbrella, 
            .tm-mascot-thinking-bubble, .tm-mascot-eureka-bubble {
                will-change: transform, opacity;
                transform: translateZ(0); /* Hardware acceleration */
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }
            #tm-mascot-container .tm-mascot-eye { animation: tm-mascot-blink 5s infinite; }
            /* New: Add subtle secondary animation to the antenna */
            #tm-mascot-container .tm-mascot-antenna {
                transform-origin: 50% 15px; /* Set rotation point at the base of the antenna */
                animation: tm-mascot-antenna-sway 6s ease-in-out infinite;
                will-change: transform;
                transform: translateZ(0);
            }
            #tm-mascot-container .tm-mascot-main-body {
                will-change: transform;
                transform: translateZ(0);
            }

            #tm-mascot-container .tm-mascot-magnifying-glass { display: none; }

            .tm-mascot-flipper {
                transition: transform 0.4s ease;
                transform-origin: 50% 50%;
                will-change: transform;
                transform: translateZ(0);
                backface-visibility: hidden;
            }

            /* Make the pet react to hover - use filter instead of transform to avoid overriding animations */
            #tm-mascot-container:hover .tm-mascot-robot {
                filter: brightness(1.1);
                cursor: grab;
            }

            /* Mascot States */
            #tm-mascot-container.mascot-idle .tm-mascot-main-body { animation: tm-mascot-roam-fly 1.2s ease-in-out infinite; }
            #tm-mascot-container.mascot-idle .tm-mascot-eye-open,
            #tm-mascot-container.mascot-happy .tm-mascot-eye-open,
            #tm-mascot-container.mascot-sad .tm-mascot-eye-open {
                animation: tm-mascot-blink 5s steps(1, end) infinite;
            }
            
            /* Accessories animate naturally during idle/roaming */
            #tm-mascot-container.mascot-idle #top_hat,
            #tm-mascot-container.mascot-idle #master_crown {
                animation: tm-mascot-hat-gentle-bob 2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-idle .tm-mascot-sunglasses {
                animation: tm-mascot-shades-adjust 4s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-idle #jetpack .tm-mascot-thruster-left,
            #tm-mascot-container.mascot-idle #jetpack .tm-mascot-thruster-right {
                animation: tm-mascot-jetpack-flame 0.8s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-searching .tm-mascot-robot { animation: tm-mascot-search-move 2s ease-in-out infinite; }
            #tm-mascot-container.mascot-searching .tm-mascot-magnifying-glass { display: block; }

            #tm-mascot-container.mascot-happy .tm-mascot-robot { animation: tm-mascot-happy-dance 0.8s ease-in-out infinite; }
            #tm-mascot-container.mascot-happy .tm-mascot-antenna { animation: tm-mascot-antenna-happy-wiggle 0.4s ease-in-out infinite; }
            #tm-mascot-container.mascot-happy #top_hat,
            #tm-mascot-container.mascot-happy #master_crown {
                animation: tm-mascot-hat-bounce-happy 0.8s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-happy #jetpack {
                animation: tm-mascot-jetpack-boost 0.4s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-energized .tm-mascot-robot { 
                animation: tm-mascot-energized-power 0.6s ease-in-out infinite !important;
                filter: brightness(1.2) saturate(1.3);
            }
            #tm-mascot-container.mascot-energized .tm-mascot-antenna { 
                animation: tm-mascot-antenna-energized-glow 0.4s ease-in-out infinite !important;
            }
            #tm-mascot-container.mascot-energized .tm-mascot-antenna circle {
                fill: #00bfff !important;
            }
            #tm-mascot-container.mascot-energized .tm-mascot-main-body {
                box-shadow: 0 0 15px rgba(0,191,255,0.6);
                animation: tm-energized-body-pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes tm-energized-body-pulse {
                0%, 100% {
                    box-shadow: 0 0 10px rgba(0,191,255,0.5), 0 0 20px rgba(0,191,255,0.3);
                }
                50% {
                    box-shadow: 0 0 20px rgba(0,191,255,0.9), 0 0 35px rgba(0,191,255,0.6);
                }
            }
            /* Hide accessory animations when energized to prevent conflicts */
            #tm-mascot-container.mascot-energized .tm-mascot-ball,
            #tm-mascot-container.mascot-energized .tm-mascot-bicycle,
            #tm-mascot-container.mascot-energized .tm-mascot-book,
            #tm-mascot-container.mascot-energized #top_hat,
            #tm-mascot-container.mascot-energized #master_crown,
            #tm-mascot-container.mascot-energized #jetpack {
                animation: none !important;
            }
            /* Energized state overrides all other body animations */
            #tm-mascot-container.mascot-energized .tm-mascot-head,
            #tm-mascot-container.mascot-energized .tm-mascot-thrusters {
                animation: none !important;
            }
            
            /* Electric particles - created dynamically via JS */
            /* Enhanced Searching Animation */
            #tm-mascot-container.mascot-searching .tm-mascot-robot { animation: tm-mascot-search-move 2s ease-in-out infinite; }
            #tm-mascot-container.mascot-searching .tm-mascot-antenna { animation: tm-mascot-antenna-spin 1s linear infinite; }
            #tm-mascot-container.mascot-searching .tm-mascot-magnifying-glass { display: block; }
            /* Use the simpler float animation for sad/sleeping states on the main body */
            #tm-mascot-container.mascot-sad .tm-mascot-robot {
                animation: tm-mascot-idle-float 6s ease-in-out infinite;
                transform: rotate(-2deg); /* Add a slight sad tilt */
            }
            #tm-mascot-container.mascot-sleeping .tm-mascot-robot { animation: tm-mascot-idle-float 8s ease-in-out infinite; }
            #tm-mascot-container.mascot-sleeping .tm-mascot-eye-open { display: none; }
            #tm-mascot-container.mascot-sleeping .tm-mascot-eye-closed { display: block; }

            #tm-mascot-container.mascot-sad .tm-mascot-mouth-happy { display: none; }
            #tm-mascot-container.mascot-sad .tm-mascot-mouth-sad { display: block; }

            #tm-mascot-container.mascot-dodging .tm-mascot-robot { animation: tm-mascot-startled 0.4s ease-out; }
            #tm-mascot-container.mascot-dodging #top_hat,
            #tm-mascot-container.mascot-dodging #master_crown {
                animation: tm-mascot-hat-fly-off 0.4s ease-out;
            }
            #tm-mascot-container.mascot-dodging .tm-mascot-sunglasses {
                animation: tm-mascot-shades-wobble 0.4s ease-out;
            }

            /* Enhanced Playful States with Natural Accessory Interactions */
            #tm-mascot-container.mascot-reading .tm-mascot-robot { animation: tm-mascot-reading-bob 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-reading .tm-mascot-book { 
                display: block; 
                animation: tm-mascot-book-flip 2s ease-in-out infinite;
                transform-origin: left center;
            }

            #tm-mascot-container.mascot-biking .tm-mascot-robot { animation: tm-mascot-biking-bounce 1s ease-in-out infinite; }
            #tm-mascot-container.mascot-biking .tm-mascot-bicycle { 
                display: block; 
                animation: tm-mascot-bike-wobble 1s ease-in-out infinite;
            }

            #tm-mascot-container.mascot-juggling .tm-mascot-robot { 
                animation: tm-mascot-juggling-sway 2.4s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball { 
                display: block;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball-1 { 
                animation: tm-mascot-juggle-left-to-right 1.2s ease-in-out infinite;
                animation-delay: 0s;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball-2 { 
                animation: tm-mascot-juggle-right-to-left 1.2s ease-in-out infinite;
                animation-delay: 0.4s;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball-3 { 
                animation: tm-mascot-juggle-left-to-right 1.2s ease-in-out infinite;
                animation-delay: 0.8s;
            }
            
            /* Ensure smooth transition when exiting juggling state */
            #tm-mascot-container.mascot-idle .tm-mascot-robot {
                animation: tm-mascot-idle-float 4s ease-in-out infinite;
                transition: transform 0.3s ease-out;
            }
            
            /* Evolution-specific idle enhancements - Pulsing antenna lights */
            .tm-mascot-antenna circle {
                animation: tm-antenna-light-pulse 2s ease-in-out infinite;
            }
            
            @keyframes tm-antenna-light-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            
            /* All state animations work on .tm-mascot-robot which contains all evolution forms */
            /* Roaming animations work on #tm-mascot-container via JavaScript */
            
            /* Eating Animation - Make it more natural */
            #tm-mascot-container.mascot-eating .tm-mascot-robot { animation: tm-mascot-eating-chew 0.6s ease-in-out 3; }
            #tm-mascot-container.mascot-eating .tm-mascot-main-body { animation: none; }
            
            /* Thinking Animation - More contemplative */
            #tm-mascot-container.mascot-thinking .tm-mascot-robot { animation: tm-mascot-pondering 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-thinking .tm-mascot-thinking-bubble { 
                display: block;
                animation: tm-mascot-thought-pulse 2s ease-in-out infinite;
            }

            /* Mascot Animations */
            @keyframes tm-mascot-barrel-roll {
                from { transform: rotate(0deg) scale(1); }
                to { transform: rotate(360deg) scale(1.2); }
            }
            @keyframes tm-mascot-antenna-spin {
                from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes tm-mascot-glitch {
                0%, 100% { transform: translate(0, 0); }
                20% { transform: translate(-3px, 3px) rotate(-2deg); }
                40% { transform: translate(3px, -3px) rotate(2deg); }
                60% { transform: translate(-3px, -3px) rotate(1deg); }
                80% { transform: translate(3px, 3px) rotate(-1deg); }
            }
            @keyframes tm-mascot-idle-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            /* New: Keyframe for antenna sway */
            @keyframes tm-mascot-antenna-sway {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(8deg); }
            }
            @keyframes tm-mascot-blink {
                0%, 95%, 100% { transform: scaleY(1); transform-origin: center; }
                97% { transform: scaleY(0.1); transform-origin: center; }
            }
            @keyframes tm-mascot-search-move {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                25% { transform: translate(5px, -5px) rotate(5deg); }
                75% { transform: translate(-5px, 0) rotate(-5deg); }
            }
            @keyframes tm-mascot-happy-dance {
                0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                15% { transform: translateY(-12px) rotate(-8deg) scale(1.03); }
                30% { transform: translateY(-5px) rotate(8deg) scale(1.05); }
                45% { transform: translateY(-15px) rotate(-10deg) scale(1.04); }
                60% { transform: translateY(-3px) rotate(0deg) scale(1.08); }
                75% { transform: translateY(-18px) rotate(12deg) scale(1.06); }
                90% { transform: translateY(-8px) rotate(-5deg) scale(1.02); }
            }
            @keyframes tm-mascot-roam-fly {
                0%, 100% { transform: translateY(0) rotate(1deg); }
                50% { transform: translateY(-5px) rotate(-1deg); }
            }
            #tm-mascot-container.mascot-idle .tm-mascot-thruster-left,
            #tm-mascot-container.mascot-dodging .tm-mascot-thruster-left { animation: tm-mascot-thruster-anim 1.2s ease-in-out infinite 0.1s; }
            #tm-mascot-container.mascot-idle .tm-mascot-thruster-right,
            #tm-mascot-container.mascot-dodging .tm-mascot-thruster-right { animation: tm-mascot-thruster-anim 1.2s ease-in-out infinite; }
            @keyframes tm-mascot-thruster-anim {
                0%, 100% { transform: translateY(0) scaleY(1); opacity: 1; }
                50% { transform: translateY(4px) scaleY(0.8); opacity: 0.7; }
            }

            @keyframes tm-mascot-startled {
                0%, 100% { transform: translate(0, 0); }
                30% { transform: translate(0, -15px) scale(1.05, 0.9); }
                60% { transform: translateY(0) scale(0.95, 1.05); }
            }
            /* Enhanced Reading Animation - Gentle bobbing while focused on book */
            @keyframes tm-mascot-reading-bob {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-3px) rotate(2deg); }
            }
            @keyframes tm-mascot-book-flip {
                0%, 80% { transform: rotateY(0deg); }
                85%, 95% { transform: rotateY(-15deg); }
                100% { transform: rotateY(0deg); }
            }
            
            /* Enhanced Biking Animation - Realistic cycling motion with pedaling rhythm */
            @keyframes tm-mascot-biking-bounce {
                0% { transform: translateY(0) rotate(0deg) scaleY(1); }
                10% { transform: translateY(-4px) rotate(-1deg) scaleY(1.02); }
                20% { transform: translateY(-6px) rotate(-2deg) scaleY(0.98); }
                30% { transform: translateY(-3px) rotate(0deg) scaleY(1.01); }
                40% { transform: translateY(0) rotate(1deg) scaleY(1); }
                50% { transform: translateY(-2px) rotate(2deg) scaleY(0.99); }
                60% { transform: translateY(-5px) rotate(1deg) scaleY(1.01); }
                70% { transform: translateY(-7px) rotate(0deg) scaleY(0.98); }
                80% { transform: translateY(-4px) rotate(-1deg) scaleY(1.02); }
                90% { transform: translateY(-1px) rotate(0deg) scaleY(1); }
                100% { transform: translateY(0) rotate(0deg) scaleY(1); }
            }
            @keyframes tm-mascot-bike-wobble {
                0% { transform: rotate(0deg) translateX(0); }
                12% { transform: rotate(-1.5deg) translateX(-1px); }
                25% { transform: rotate(-3deg) translateX(-2px); }
                37% { transform: rotate(-1.5deg) translateX(-1px); }
                50% { transform: rotate(0deg) translateX(0); }
                62% { transform: rotate(1.5deg) translateX(1px); }
                75% { transform: rotate(3deg) translateX(2px); }
                87% { transform: rotate(1.5deg) translateX(1px); }
                100% { transform: rotate(0deg) translateX(0); }
            }
            
            /* Enhanced Juggling Animation - Smooth body sway */
            @keyframes tm-mascot-juggling-sway {
                0% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(-2px) rotate(-2deg); }
                50% { transform: translateX(0) rotate(0deg); }
                75% { transform: translateX(2px) rotate(2deg); }
                100% { transform: translateX(0) rotate(0deg); }
            }
            /* Left-to-right arc for odd-numbered balls */
            @keyframes tm-mascot-juggle-left-to-right {
                0% { 
                    transform: translate(-25px, 5px) scale(1); 
                }
                50% { 
                    transform: translate(0px, -40px) scale(0.7); 
                }
                100% { 
                    transform: translate(25px, 5px) scale(1); 
                }
            }
            
            /* Right-to-left arc for even-numbered balls */
            @keyframes tm-mascot-juggle-right-to-left {
                0% { 
                    transform: translate(25px, 5px) scale(1); 
                }
                50% { 
                    transform: translate(0px, -40px) scale(0.7); 
                }
                100% { 
                    transform: translate(-25px, 5px) scale(1); 
                }
            }
            
            /* Enhanced Eating Animation - Chewing motion */
            @keyframes tm-mascot-eating-chew {
                0%, 100% { transform: scaleY(1); }
                40% { transform: scaleY(0.95); }
                60% { transform: scaleY(1.02); }
            }
            
            /* Enhanced Thinking Animation - Gentle pondering motion */
            @keyframes tm-mascot-pondering {
                0%, 100% { transform: rotate(0deg) translateY(0); }
                33% { transform: rotate(-3deg) translateY(-2px); }
                66% { transform: rotate(3deg) translateY(-2px); }
            }
            @keyframes tm-mascot-thought-pulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
            
            /* Accessory-specific idle animations */
            @keyframes tm-mascot-hat-gentle-bob {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-2px) rotate(1deg); }
            }
            @keyframes tm-mascot-shades-adjust {
                0%, 90% { transform: translateY(0); }
                92%, 96% { transform: translateY(-1px); }
                100% { transform: translateY(0); }
            }
            @keyframes tm-mascot-jetpack-flame {
                0%, 100% { opacity: 1; transform: scaleY(1); }
                50% { opacity: 0.7; transform: scaleY(1.3); }
            }
            
            /* Weather accessory animations */
            @keyframes tm-mascot-sunny-relax {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(-5deg); }
            }
            @keyframes tm-mascot-sunglasses-shine {
                0%, 85% { opacity: 1; }
                90% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            @keyframes tm-mascot-rainy-shelter {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(-3px) rotate(-2deg); }
                75% { transform: translateX(3px) rotate(2deg); }
            }
            @keyframes tm-mascot-umbrella-sway {
                0%, 100% { transform: translate(40px, -30px) rotate(-20deg); }
                50% { transform: translate(40px, -30px) rotate(-15deg); }
            }
            
            /* Enhanced antenna reactions */
            @keyframes tm-mascot-antenna-happy-wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-15deg); }
                75% { transform: rotate(15deg); }
            }
            @keyframes tm-mascot-antenna-energized-glow {
                0%, 100% { 
                    transform: rotate(-12deg); 
                }
                25% { 
                    transform: rotate(12deg); 
                }
                50% { 
                    transform: rotate(-12deg); 
                }
                75% { 
                    transform: rotate(12deg); 
                }
            }
            
            @keyframes tm-mascot-energized-power {
                0% { 
                    transform: translateY(0) scale(1) rotate(0deg); 
                }
                25% { 
                    transform: translateY(-8px) scale(1.03) rotate(-2deg); 
                }
                50% { 
                    transform: translateY(-12px) scale(1.05) rotate(0deg); 
                }
                75% { 
                    transform: translateY(-8px) scale(1.03) rotate(2deg); 
                }
                100% { 
                    transform: translateY(0) scale(1) rotate(0deg); 
                }
            }
            @keyframes tm-mascot-hat-bounce-happy {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                15% { transform: translateY(-15px) rotate(-10deg); }
                30% { transform: translateY(-8px) rotate(10deg); }
                45% { transform: translateY(-18px) rotate(-8deg); }
                60% { transform: translateY(-5px) rotate(5deg); }
                75% { transform: translateY(-20px) rotate(15deg); }
                90% { transform: translateY(-10px) rotate(-5deg); }
            }
            @keyframes tm-mascot-jetpack-boost {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-3px) scale(1.05, 0.95); }
            }
            @keyframes tm-mascot-accessory-glitch {
                0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                25% { transform: translate(-2px, 2px) rotate(-5deg); opacity: 0.8; }
                50% { transform: translate(2px, -2px) rotate(5deg); opacity: 1; }
                75% { transform: translate(-1px, -1px) rotate(-3deg); opacity: 0.9; }
            }
            @keyframes tm-mascot-hat-fly-off {
                0% { transform: translateY(0) rotate(0deg); }
                30% { transform: translateY(-15px) rotate(25deg); }
                100% { transform: translateY(-5px) rotate(10deg); }
            }
            @keyframes tm-mascot-shades-wobble {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                30% { transform: translateY(-3px) rotate(-8deg); }
                60% { transform: translateY(-2px) rotate(8deg); }
            }
            
            @keyframes tm-mascot-powersave-drift {
                0%, 100% { transform: translateY(0); opacity: 1; }
                50% { transform: translateY(15px); opacity: 0.7; }
            }
            @keyframes tm-mascot-eye-dim {
                0%, 100% { fill-opacity: 1; }
                50% { fill-opacity: 0.3; }
            }
            @keyframes tm-mascot-sparks {
                0%, 100% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1); }
            }
            #tm-mascot-container.mascot-glitching .tm-mascot-sparks { display: block; animation: tm-mascot-sparks 0.2s steps(1, end) infinite; }
            #tm-mascot-container.mascot-glitching .tm-mascot-robot { animation: tm-mascot-glitch 0.3s infinite; }
            #tm-mascot-container.mascot-glitching #top_hat,
            #tm-mascot-container.mascot-glitching #master_crown {
                animation: tm-mascot-accessory-glitch 0.3s infinite;
            }
            /* New Eureka State */
            #tm-mascot-container.mascot-eureka .tm-mascot-robot { animation: tm-mascot-barrel-roll 1s ease-out; }
            #tm-mascot-container.mascot-eureka .tm-mascot-eureka-bubble { display: block; }

            /* Enhanced Weather States with Natural Accessory Movement */
            #tm-mascot-container.mascot-sunny .tm-mascot-robot { animation: tm-mascot-sunny-relax 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-sunny .tm-mascot-sunglasses { 
                display: block; 
                animation: tm-mascot-sunglasses-shine 2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-rainy .tm-mascot-robot { animation: tm-mascot-rainy-shelter 2.5s ease-in-out infinite; }
            #tm-mascot-container.mascot-rainy .tm-mascot-umbrella { 
                display: block; 
                animation: tm-mascot-umbrella-sway 3s ease-in-out infinite;
            }

            /* New Power-Save State */
            #tm-mascot-container.mascot-powersave .tm-mascot-robot { animation: tm-mascot-powersave-drift 8s ease-in-out infinite; }
            #tm-mascot-container.mascot-powersave .tm-mascot-eye-open circle:last-child { animation: tm-mascot-eye-dim 4s ease-in-out infinite; }
            #tm-mascot-container.mascot-powersave .tm-mascot-zzz-bubble { display: block; }
            #tm-mascot-container.mascot-powersave .tm-mascot-thruster-left, #tm-mascot-container.mascot-powersave .tm-mascot-thruster-right { display: none; }





            /* Mascot Interaction Panel */
            #tm-mascot-interaction-panel {
                position: absolute;
                bottom: 110px; /* Position above the mascot */
                left: 0;
                background-color: rgba(255, 255, 255, 0.95);
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                padding: 10px;
                width: 180px;
                z-index: 9991;
                display: none; /* Hidden by default */
                flex-direction: column;
                gap: 8px;
                font-size: 12px;
            }
            .tm-pet-stat-bar {
                width: 100%; height: 14px; background-color: #e9ecef;
                border-radius: 7px; overflow: hidden; border: 1px solid #ccc;
            }
            .tm-pet-stat-bar-fill {
                height: 100%; transition: width 0.3s ease-out;
            }
            #tm-pet-happiness-bar .tm-pet-stat-bar-fill { background-color: #ffc107; } /* Yellow */
            #tm-pet-hunger-bar .tm-pet-stat-bar-fill { background-color: #28a745; } /* Green */
            .tm-pet-stat-label { font-weight: bold; margin-bottom: 2px; }
            #tm-mascot-interaction-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap; /* Allow buttons to wrap to the next line */
                margin-top: 5px;
            }
            #tm-mascot-interaction-buttons button {
                flex: 1;
                padding: 5px;
                font-size: 12px;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
                background-color: #f8f9fa;
                transition: background-color 0.2s;
            }

            /* Mascot Speech Bubble */
            .tm-mascot-speech-bubble {
                position: absolute;
                top: -20px; /* Start position for animation */
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                border: 2px solid #333;
                border-radius: 10px;
                padding: 5px 10px;
                font-size: 12px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                white-space: nowrap;
                z-index: 9992;
                box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
                opacity: 0;
                transition: opacity 0.3s ease-out, top 0.3s ease-out;
            }
            .tm-mascot-speech-bubble.show {
                top: -30px; /* End position */
                opacity: 1;
            }
            /* Add a little tail for the bubble */
            .tm-mascot-speech-bubble::after {
                content: '';
                position: absolute;
                bottom: -8px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0; border-left: 8px solid transparent;
                border-right: 8px solid transparent; border-top: 8px solid #333;
            }
            /* XP Bar in Footer - Redesigned with integrated title */
            #tm-xp-bar-container {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 12px;
                height: 40px;
                padding: 4px 10px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                min-width: 180px;
                max-width: 200px;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            #tm-xp-bar-container:hover {
                background: linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            
            /* Title above the bar */
            #tm-user-title-text {
                display: block;
                font-size: 9px;
                font-weight: 700;
                text-align: left;
                margin-bottom: 4px;
                padding: 0 55px 0 6px; /* More padding on right for badges, left aligned */
                letter-spacing: 0.3px;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.2;
                color: white;
            }
            
            /* Level badge */
            #tm-level-text {
                position: absolute;
                top: 3px;
                right: 6px;
                background: linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,170,0,0.3) 100%);
                backdrop-filter: blur(4px);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: 700;
                color: white;
                border: 1px solid rgba(255, 215, 0, 0.5);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            /* --- New: Energized Buff Indicator --- */
            #tm-energized-buff-indicator {
                position: absolute;
                top: 3px;
                left: 6px;
                background: linear-gradient(135deg, rgba(0,191,255,0.3) 0%, rgba(0,242,254,0.3) 100%);
                backdrop-filter: blur(4px);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: 700;
                color: white;
                border: 1px solid rgba(0, 191, 255, 0.5);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                animation: tm-pulse-glow 1.5s infinite;
            }

            .tm-xp-bar {
                width: 100%;
                height: 10px;
                background: rgba(0,0,0,0.4);
                border: 1px solid rgba(255,215,0,0.3);
                border-radius: 5px;
                overflow: hidden;
                position: relative;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            }
            #tm-xp-bar-fill {
                height: 100%; width: 0%;
                background: linear-gradient(90deg, #ffd700 0%, #ffaa00 100%);
                transition: width 0.5s ease-out;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                position: relative;
            }
            #tm-xp-bar-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
            }
            #tm-xp-text {
                position: absolute;
                width: 100%;
                text-align: center;
                font-size: 8px;
                line-height: 10px;
                color: #fff;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                z-index: 1;
            }
            @keyframes tm-pulse-glow {
                0%, 100% { box-shadow: 0 0 4px var(--tm-warning-color); }
                50% { box-shadow: 0 0 12px var(--tm-warning-color), 0 0 18px var(--tm-warning-color); }
            }
            /* --- XP Gain Indicator --- */
            /* --- Buff Timers --- */
            #tm-buff-timers-container { 
                display: flex; 
                gap: 8px; 
                align-items: center;
                margin-right: 10px;
            }
            .tm-buff-timer {
                position: relative;
                width: 40px;
                height: 40px;
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tm-buff-timer:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            .tm-buff-timer svg {
                position: absolute;
                width: 36px;
                height: 36px;
                transform: rotate(-90deg);
            }
            .tm-buff-timer-bg {
                fill: none;
                stroke: rgba(255,255,255,0.15);
                stroke-width: 2.5;
            }
            .tm-buff-timer-circle {
                fill: none;
                stroke-width: 2.5;
                stroke-linecap: round;
                transition: stroke-dasharray 0.5s linear;
            }
            .tm-buff-timer-icon {
                position: relative;
                font-size: 18px;
                z-index: 1;
                color: white !important;
            }
            .tm-xp-gain-indicator {
                position: absolute;
                bottom: 20px; /* Start just above the bar */
                left: 50%;
                transform: translateX(-50%);
                color: #ffc107; /* Same as the XP bar color */
                font-weight: bold;
                font-size: 14px;
                text-shadow: 0 0 5px black;
                pointer-events: none;
                opacity: 0;
                animation: tm-xp-float-up-enhanced 1.5s ease-out forwards;
            }
            @keyframes tm-xp-float-up-enhanced {
                0% { opacity: 1; transform: translate(-50%, 0) scale(0.8); }
                20% { transform: translate(-50%, -10px) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50px) scale(0.5); }
            }
            /* New: Animation for the XP bar flashing on gain */
            .tm-xp-gain-flash {
                animation: tm-xp-bar-flash 0.5s ease-out;
            }
            @keyframes tm-xp-bar-flash {
                50% { box-shadow: 0 0 15px #fff, 0 0 25px #fff; }
            }
            /* New: Animation for the level text popping on gain */
            .tm-level-pop { animation: tm-level-text-pop 0.5s ease-out; }
            @keyframes tm-level-text-pop {
                50% { transform: scale(1.4); color: #ffc107; text-shadow: 0 0 8px #fff; }
            }




            /* Coin Balance in Footer */
            #tm-coin-balance {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                font-size: 14px;
                font-weight: bold;
                height: 40px;
                padding: 0 14px;
                border-radius: 12px;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #tm-coin-balance:hover {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.4) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,215,0,0.5) !important;
            }

            /* --- Feature: Shop --- */
            #tm-shop-items-wrapper {
                padding: 10px 0;
                overflow-y: auto; /* Allow scrolling if needed */
                max-height: 60vh; /* Limit height for better UX */
            }
            .tm-shop-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr); /* 3 column grid */
                gap: 12px;
                max-width: 600px; /* Limit width for better layout */
                margin: 0 auto; /* Center the grid */
            }
            @media (max-width: 768px) {
                .tm-shop-grid {
                    grid-template-columns: repeat(2, 1fr); /* 2 columns on small screens */
                }
            }
            @media (max-width: 480px) {
                .tm-shop-grid {
                    grid-template-columns: 1fr; /* 1 column on mobile */
                }
            }
            .tm-shop-tabs { display: flex; gap: 5px; margin-bottom: 15px; border-bottom: 1px solid #ccc; }
            .tm-shop-tab { padding: 8px 15px; cursor: pointer; border: 1px solid #ccc; border-bottom: none; border-radius: 5px 5px 0 0; background: #f1f1f1; }
            .tm-shop-tab.active { background: #fff; border-bottom: 1px solid #fff; margin-bottom: -1px; font-weight: bold; }
            .tm-shop-category-content {
                display: none; /* Hide all categories by default */
            }
            .tm-shop-category-content.active {
                display: block; /* Show only the active one */
            }
            .tm-shop-item {
                border: none;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
                background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1), 
                            0 1px 3px rgba(0,0,0,0.06);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                cursor: pointer;
                min-height: 160px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 6px;
            }
            .tm-shop-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(145deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                z-index: 0;
                border-radius: 12px;
            }
            .tm-shop-item:hover::before { opacity: 1; }
            .tm-shop-item:hover { 
                transform: translateY(-4px);
                box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3), 
                            0 4px 10px rgba(0,0,0,0.1);
            }
            .tm-shop-item.owned { 
                background: linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%);
                border-left: 3px solid #4caf50;
            }
            .tm-shop-item.currently-equipped {
                background: linear-gradient(145deg, #fff9e6 0%, #ffe9b3 100%);
                border: 2px solid #ffc107;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2),
                            0 4px 12px rgba(255, 193, 7, 0.3);
            }
            .tm-shop-equipped-badge {
                position: absolute;
                top: 6px;
                right: 6px;
                background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
                color: #fff;
                padding: 4px 8px;
                border-radius: 10px;
                font-size: 9px;
                font-weight: bold;
                z-index: 1;
                box-shadow: 0 2px 6px rgba(255, 152, 0, 0.4);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tm-shop-item-icon { 
                font-size: 48px; 
                margin-bottom: 6px; 
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 52px;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
                transition: transform 0.3s ease;
                position: relative;
                z-index: 1;
                pointer-events: none;
            }
            .tm-shop-item-icon svg {
                width: 48px;
                height: 48px;
                filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
            }
            .tm-shop-item:hover .tm-shop-item-icon {
                transform: scale(1.12) translateY(-2px);
            }
            .tm-shop-item.currently-equipped .tm-shop-item-icon {
                animation: tm-shop-icon-pulse 2s ease-in-out infinite;
            }
            @keyframes tm-shop-icon-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
            }
            .tm-shop-item-name { 
                font-weight: 600; 
                font-size: 13px; 
                margin-bottom: 4px;
                color: var(--tm-primary-color);
                position: relative;
                z-index: 1;
                pointer-events: none;
                line-height: 1.4;
            }
            .tm-shop-item.owned .tm-shop-item-name {
                color: var(--tm-success-color);
            }
            .tm-shop-item.currently-equipped .tm-shop-item-name {
                color: var(--tm-warning-color);
                font-weight: 700;
            }
            .tm-shop-item-desc {
                font-size: 11px;
                color: var(--tm-primary-color);
                text-align: center;
                margin: 4px 0;
                padding: 0 8px;
                line-height: 1.3;
                font-style: italic;
                opacity: 0.8;
                pointer-events: none;
            }
            .tm-shop-item-cost { 
                font-size: 12px; 
                color: var(--tm-primary-color); 
                margin: 4px 0;
                font-weight: 500;
                position: relative;
                z-index: 1;
                pointer-events: none;
            }
            .tm-shop-item-btn {
                width: 100%; 
                padding: 8px; 
                border: none;
                border-radius: 8px;
                cursor: pointer; 
                font-weight: 600; 
                font-size: 11px;
                color: white; 
                margin-top: 8px;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                z-index: 10;
                pointer-events: auto;
            }
            .tm-shop-item-btn.buy { 
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                box-shadow: 0 3px 10px rgba(79, 172, 254, 0.4);
            }
            .tm-shop-item-btn.buy:hover { 
                background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(79, 172, 254, 0.5);
            }
            .tm-shop-item-btn.equip { 
                background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
                box-shadow: 0 3px 10px rgba(67, 160, 71, 0.4);
            }
            .tm-shop-item-btn.equip:hover { 
                background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(67, 160, 71, 0.5);
            }
            .tm-shop-item-btn.equipped { 
                background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
                cursor: pointer;
                box-shadow: 0 3px 10px rgba(255, 152, 0, 0.4);
                animation: tm-shop-equipped-glow 2s ease-in-out infinite;
            }
            .tm-shop-item-btn.equipped:hover {
                background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(229, 57, 53, 0.5);
            }
            .tm-shop-item-btn:disabled { 
                background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
                box-shadow: none;
                cursor: not-allowed;
                opacity: 0.6;
            }
            @keyframes tm-shop-equipped-glow {
                0%, 100% { box-shadow: 0 3px 10px rgba(255, 152, 0, 0.4); }
                50% { box-shadow: 0 4px 15px rgba(255, 152, 0, 0.6), 0 0 25px rgba(255, 152, 0, 0.3); }
            }
            
            /* Boss battle shake animation */
            @keyframes bossShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-3px); }
                75% { transform: translateX(3px); }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes talentBadgePulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 3px 8px rgba(255, 82, 82, 0.5);
                }
                50% { 
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.8), 0 0 20px rgba(255, 82, 82, 0.4);
                }
            }

            /* --- Feature: Memory Mini-Game --- */
            #tm-memory-game-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); z-index: 10001;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 20px;
            }
            #tm-memory-game-status {
                background: rgba(0,0,0,0.8); color: white; padding: 15px 25px;
                border-radius: 10px; font-size: 24px; font-weight: bold;
                text-align: center;
            }
            #tm-memory-game-mascot-container {
                position: relative; width: 200px; height: 200px;
            }
            #tm-memory-game-mascot-container .tm-mascot-robot {
                width: 100%; height: 100%;
            }
            .tm-memory-game-pad {
                position: absolute;
                border-radius: 50%;
                cursor: pointer;
                background: rgba(255,255,255,0.1);
                border: 2px dashed white;
                transition: background-color 0.1s;
            }
            .tm-memory-game-pad.active {
                background: rgba(255,255,255,0.8);
                transform: scale(1.1);
            }

            /* --- Feature: Bug Squish Mini-Game --- */
            #tm-game-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.2); z-index: 10001;
                cursor: crosshair;
            }
            #tm-game-ui {
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.7); color: white; padding: 10px 20px;
                border-radius: 10px; font-size: 24px; font-weight: bold;
                display: flex; gap: 30px; z-index: 10002;
            }
            .tm-game-bug {
                position: absolute;
                font-size: 32px;
                cursor: pointer;
                user-select: none;
                transition: transform 0.2s ease-out;
                animation: tm-bug-crawl 8s linear infinite;
            }
            .tm-game-bug:hover {
                transform: scale(1.2);
            }
            .tm-game-bug.squished {
                animation: tm-bug-squish 0.3s forwards;
                pointer-events: none;
            }
            @keyframes tm-bug-squish {
                0% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(0.5) rotate(90deg); opacity: 0; }
            }
            @keyframes tm-bug-crawl {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(20px, 10px) rotate(15deg); }
                50% { transform: translate(0px, 20px) rotate(0deg); }
                75% { transform: translate(-20px, 10px) rotate(-15deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
            #tm-game-end-screen {
                text-align: center;
            }

            /* --- Feature: Daily Quests (Bounties) --- */
            #tm-quests-container {
                display: flex; flex-direction: column; gap: 15px; padding: 10px;
            }
            .tm-quest-item {
                display: flex; align-items: center; gap: 15px;
                background: #f8f9fa; border: 1px solid #dee2e6;
                border-radius: 8px; padding: 10px;
                transition: all 0.3s;
            }
            .tm-quest-item.completed {
                background: #e8f5e9; /* Light green */
                border-color: #a5d6a7;
                opacity: 0.7;
            }
            .tm-quest-status-icon { font-size: 24px; }
            .tm-quest-details { flex-grow: 1; }
            .tm-quest-description { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .tm-quest-progress-bar {
                height: 8px; background: #e9ecef; border-radius: 4px;
                overflow: hidden; border: 1px solid #ccc;
            }
            .tm-quest-progress-bar div {
                height: 100%; background-color: var(--tm-success-color);
                transition: width 0.5s ease-out;
            }
            .tm-quest-item.completed .tm-quest-progress-bar div {
                background-color: #66bb6a; /* Darker green for completed */
            }
            .tm-quest-progress-text {
                font-size: 11px; color: #6c757d; text-align: right;
                margin-top: 2px;
            }
            .tm-quest-reward {
                font-weight: bold; font-size: 13px; color: #4CAF50;
                background: #f1f8e9; padding: 5px 8px; border-radius: 5px;
                white-space: nowrap;
            }
            .tm-quest-actions { display: flex; flex-direction: column; gap: 5px; }
            .tm-quest-reroll-btn { background: var(--tm-info-color); color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 14px; cursor: pointer; }
            .tm-quest-reroll-btn:hover { background: var(--tm-info-hover); }
            .tm-quest-reroll-btn:disabled { background: var(--tm-secondary-color); cursor: not-allowed; }
            #tm-reroll-token-display { font-size: 14px; font-weight: bold; color: var(--tm-info-color); margin: 0 15px; }
            .tm-quest-item.completed .tm-quest-reward {
                color: #388e3c;
                text-decoration: line-through;
            }

            /* --- Titles Modal --- */
            #tm-titles-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                max-height: 60vh;
                overflow-y: auto;
            }
            .tm-title-item {
                display: flex;
                align-items: center;
                gap: 15px;
                background: var(--tm-dark-color);
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 12px 15px;
                transition: all 0.2s;
            }
            .tm-title-item.locked {
                opacity: 0.5;
                filter: grayscale(60%);
            }
            .tm-title-item.unlocked {
                border-left: 4px solid var(--tm-success-color);
            }
            .tm-title-level {
                font-weight: bold;
                font-size: 14px;
                color: #fff;
                background-color: var(--tm-secondary-color);
                padding: 4px 8px;
                border-radius: 5px;
                min-width: 50px;
                text-align: center;
            }
            .tm-title-name {
                font-weight: bold;
                font-size: 16px;
                flex-grow: 1;
            }




            /* --- Feature: Positive Message --- */
            #tm-positive-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 123, 255, 0.9);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-size: 20px;
                font-weight: bold;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.5s ease-out;
                pointer-events: none;
            }
        `);
    }

    // ===================================================================
    // === GLOBAL PRINTING FUNCTIONS (Accessible from anywhere)
    // ===================================================================
    /**
     * Handles the click event for any print button. Fetches the order details page
     * and opens a formatted print dialog.
     * @param {string} url The URL of the order page to print.
     * @param {HTMLButtonElement} [buttonElement=null] The button that was clicked, to provide visual feedback.
     */
    function handlePrintClick(url, buttonElement = null) {
        trackDailyStat(config, STORAGE_KEYS, 'printOrder'); // Grant XP for printing
        if (!url) return;

        if (buttonElement) {
            buttonElement.textContent = 'Φόρτωση...';
            buttonElement.disabled = true;
        }

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, 'text/html');
                const details = scrapeOrderDetails(doc);
                generatePrintPage(details);
                if (buttonElement) {
                    buttonElement.textContent = 'Εκτύπωση Παραγγελίας';
                    buttonElement.disabled = false;
                }
            },
            onerror: function(error) {
                console.error('Failed to fetch order details for printing:', error);
                alert('Αποτυχία φόρτωσης δεδομένων για εκτύπωση.');
                if (buttonElement) {
                    buttonElement.textContent = 'Εκτύπωση Παραγγελίας';
                    buttonElement.disabled = false;
                }
            }
        });
    }

    /**
     * Scrapes all relevant order details from a given order page document.
     * It tries multiple scraping strategies to be robust against HTML changes.
     * @param {Document} doc The HTML document of the order page to scrape.
     * @returns {{title: string, fields: {label: string, value: string}[]}} An object containing the order title and an array of field-label pairs.
     */
    function scrapeOrderDetails(doc) {
        console.log('[MMS] Starting scrapeOrderDetails. Analyzing fetched page...');
        const details = { title: 'Λεπτομέρειες Παραγγελίας', fields: [] };
        // Try to find a title using a few common selectors
        const titleElement = doc.querySelector('.pagetitle, h1.page-header, h1, h2');
        if (titleElement) {
            details.title = titleElement.innerText.trim();
            console.log(`[MMS] Found page title: "${details.title}"`);
        }

        const addField = (label, value) => {
            if (label && value !== null && value !== undefined && !details.fields.some(f => f.label === label)) {
                details.fields.push({ label, value: value.toString().trim() });
            }
        };

        // This new method is based on the provided HTML structure for the edit page.
        console.log('[MMS] Scraping: Using primary method (div.rnr-field).');
        doc.querySelectorAll('div.rnr-field').forEach(fieldDiv => {
            const labelEl = fieldDiv.querySelector('.rnr-label label');
            const controlEl = fieldDiv.querySelector('.rnr-control');

            if (!labelEl || !controlEl) return;

            const label = labelEl.innerText.trim();
            let value = null;

            const textInput = controlEl.querySelector('input[type="text"], input[type="Text"], input[type="number"], textarea');
            const checkboxInput = controlEl.querySelector('input[type="Checkbox"], input[type="checkbox"]');
            const readonlySpan = controlEl.querySelector('span[id^="readonly_value_"]');

            if (checkboxInput) {
                value = checkboxInput.checked ? 'Ναι' : 'Όχι';
            } else if (textInput) {
                value = textInput.value;
            } else if (readonlySpan) {
                value = readonlySpan.innerText;
            } else {
                value = controlEl.innerText.trim();
            }

            addField(label, value);
        });
        console.log(`[MMS] Scraping: Found ${details.fields.length} fields.`);

        // --- Final Check ---
        if (details.fields.length === 0) {
            console.error('[MMS] Scraping: ALL METHODS FAILED. Could not extract any details from the fetched page. Please report this issue.');
            console.error(doc.body.innerHTML);
        }

        return details;
    }

    /**
     * Generates and opens a new browser window with a print-friendly layout
     * for the provided order details.
     * @param {{title: string, fields: {label: string, value: string}[]}} details The scraped order details.
     */
    function generatePrintPage(details) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Εκτύπωση - ${details.title}</title>
            <style>
               @page { size: A4; margin: 15mm; }
               body {
                    font-family: Arial, sans-serif; font-size: 10px;
                    display: flex; justify-content: center; /* Horizontal centering */
                    align-items: flex-start; /* Align items to the top */
                    margin: 0; /* Reset default body margins */
                }
                .print-container {
                    width: 100%;
                }
                h1 {
                    text-align: center; color: #333; border-bottom: 1px solid #666;
                    padding-bottom: 5px; margin-bottom: 15px; font-size: 16px;
                }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                td { padding: 5px; border: 1px solid #ddd; text-align: center; }
                td.label { font-weight: bold; background-color: #f7f7f7; width: 35%; }
                td.value { width: 65%; white-space: pre-wrap; word-break: break-word; }
            </style></head><body>
            <div class="print-container">
                <h1>${details.title}</h1>
                <table>
                    ${details.fields.filter(field => field.value).map(field => `
                        <tr>
                            <td class="label">${field.label}</td>
                            <td class="value">${field.value}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td class="label">Ενημερώθηκε ο πελάτης</td>
                        <td class="value" style="height: 25px;">&nbsp;</td>
                    </tr>
                </table>
            </div>
            <script>
                window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
            </script>
            </body></html>
        `);
        printWindow.document.close();
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

    // ===================================================================
    // === 2. FEATURE: ADVANCED SEARCH & PRINT
    // ===================================================================
    function initSearchFeature() {
        if (!config.searchFeatureEnabled) return;

        /**
         * Creates the main container on the right side of the screen for slide-out buttons.
         * This is called early to ensure the container exists for other features.
         */
        function createRightSidePanel() {
            if (document.getElementById('tm-search-container')) return; // Already exists

            const container = document.createElement('div');
            container.id = 'tm-search-container';
            document.body.appendChild(container);
            console.log('[MMS] Right-side panel container created.');
        }
        createRightSidePanel(); // Ensure the panel exists

        // --- Feature-specific Constants ---
        const QUICK_SEARCH_HIDDEN_KEY = 'tm_quick_search_hidden';

        // --- Configuration & Constants ---
        const SEARCH_URLS = [
            '/mymanagerservice/srvorders_list.php?pagesize=-1',      // Merchandise Orders
            '/mymanagerservice/sparepartstoorder_list.php?pagesize=-1' // Spare Parts Orders
        ];

        // State Variables
        let searchResults = []; // Holds results from a search
        let searchTerms = []; // Holds the split terms of the current query

        function createSearchModal() {
            if (document.querySelector('.tm-modal-overlay')) return; // Prevent multiple modals

            const overlay = document.createElement('div');
            overlay.className = 'tm-modal-overlay';
            overlay.classList.toggle('tm-hacker-theme-enabled', config.hackerSearchEnabled);
            overlay.innerHTML = `
                <div class="tm-modal-content">
                    <div class="tm-modal-header">
                        <h2 class="tm-modal-title">Αναζήτηση Παραγγελίας</h2>
                        <button class="tm-modal-close">&times;</button>
                    </div>
                    <div id="tm-search-input-area">
                        <input type="text" id="tm-search-input" placeholder="Αρ. Παραγγελίας, Όνομα, Ανταλλακτικό...">
                        <button id="tm-search-favorite-btn" title="Προσθήκη στα Αγαπημένα">&#9734;</button>
                        <button id="tm-search-submit">Αναζήτηση</button>
                    </div>
                    <div id="tm-search-history-favorites-container">
                        <div class="tm-search-list-section">
                            <h4>Πρόσφατες Αναζητήσεις</h4>
                            <ul id="tm-search-history-list" class="tm-search-list"></ul>
                        </div>
                        <div class="tm-search-list-section">
                            <h4>Αγαπημένες Αναζητήσεις</h4>
                            <ul id="tm-search-favorites-list" class="tm-search-list"></ul>
                        </div>
                    </div>
                    <div id="tm-results-container">
                        <div id="tm-status-message">Εισάγετε έναν όρο αναζήτησης για να ξεκινήσετε.</div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            renderHistoryAndFavorites(overlay, config, STORAGE_KEYS);

            // Event Listeners
            overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            overlay.querySelector('#tm-search-submit').addEventListener('click', handleSearchSubmit);

            const searchInput = overlay.querySelector('#tm-search-input');
            const favoriteBtn = overlay.querySelector('#tm-search-favorite-btn');

            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') handleSearchSubmit();
                updateFavoriteButtonState(searchInput.value, favoriteBtn, STORAGE_KEYS);
            });

            favoriteBtn.addEventListener('click', () => {
                toggleFavoriteSearch(searchInput.value, favoriteBtn, STORAGE_KEYS);
                renderHistoryAndFavorites(overlay, config, STORAGE_KEYS); // Re-render to show changes
            });

            updateFavoriteButtonState(searchInput.value, favoriteBtn, STORAGE_KEYS);

            // Auto-focus the input field for immediate typing
            setTimeout(() => searchInput.focus(), 100);
        }

        // --- History & Favorites Logic ---
        function getSearchHistory(STORAGE_KEYS) { 
            try {
                const data = GM_getValue(STORAGE_KEYS.SEARCH_HISTORY_KEY, '[]');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('[MMS Search] Error parsing search history:', e);
                return [];
            }
        }
        function saveSearchHistory(STORAGE_KEYS, history) { GM_setValue(STORAGE_KEYS.SEARCH_HISTORY_KEY, JSON.stringify(history)); }

        function getFavoriteSearches(STORAGE_KEYS) { 
            try {
                const data = GM_getValue(STORAGE_KEYS.FAVORITE_SEARCHES_KEY, '[]');
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('[MMS Search] Error parsing favorite searches:', e);
                return [];
            }
        }
        function saveFavoriteSearches(STORAGE_KEYS, favorites) { GM_setValue(STORAGE_KEYS.FAVORITE_SEARCHES_KEY, JSON.stringify(favorites)); }

        function addSearchToHistory(query, config, STORAGE_KEYS) {
            if (!query) return;
            let history = getSearchHistory(STORAGE_KEYS);
            // Remove existing instance to move it to the top
            history = history.filter(item => item !== query);
            // Add to the front
            history.unshift(query);
            // Trim to max length
            if (history.length > config.searchMaxHistory) {
                history.length = config.searchMaxHistory;
            }
            saveSearchHistory(STORAGE_KEYS, history);
        }

        function toggleFavoriteSearch(query, starButton, STORAGE_KEYS) {
            if (!query) return;
            let favorites = getFavoriteSearches(STORAGE_KEYS);
            const index = favorites.indexOf(query);

            if (index > -1) { // It's already a favorite, so remove it
                favorites.splice(index, 1);
            } else { // Not a favorite, so add it
                favorites.unshift(query);
            }
            saveFavoriteSearches(STORAGE_KEYS, favorites);
            updateFavoriteButtonState(query, starButton, STORAGE_KEYS);
        }

        function updateFavoriteButtonState(query, starButton, STORAGE_KEYS) {
            if (!starButton) return;
            const favorites = getFavoriteSearches(STORAGE_KEYS);
            if (query && favorites.includes(query)) {
                starButton.innerHTML = '&#9733;'; // Solid star
                starButton.classList.add('favorited');
                starButton.title = 'Αφαίρεση από τα Αγαπημένα';
            } else {
                starButton.innerHTML = '&#9734;'; // Outline star
                starButton.classList.remove('favorited');
                starButton.title = 'Προσθήκη στα Αγαπημένα';
            }
        }

        function renderHistoryAndFavorites(modal, config, STORAGE_KEYS) {
            const historyList = modal.querySelector('#tm-search-history-list');
            const favoritesList = modal.querySelector('#tm-search-favorites-list');

            historyList.innerHTML = '';
            favoritesList.innerHTML = '';

            // Render History
            const history = getSearchHistory(STORAGE_KEYS);
            if (history.length === 0) {
                historyList.innerHTML = '<li style="color: #888; font-style: italic;">Δεν υπάρχουν πρόσφατες αναζητήσεις.</li>';
            } else {
                history.forEach(query => {
                    const li = document.createElement('li');
                    li.className = 'tm-search-list-item';
                    li.innerHTML = `<a href="#" title="Αναζήτηση για: ${query}">${query}</a>`;
                    li.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        performSearchInModal(query, config, STORAGE_KEYS);
                    });
                    historyList.appendChild(li);
                });
            }

            // Render Favorites
            const favorites = getFavoriteSearches(STORAGE_KEYS);
            if (favorites.length === 0) {
                favoritesList.innerHTML = '<li style="color: #888; font-style: italic;">Δεν υπάρχουν αγαπημένες αναζητήσεις.</li>';
            } else {
                favorites.forEach(query => {
                    const li = document.createElement('li');
                    li.className = 'tm-search-list-item';
                    li.innerHTML = `
                        <a href="#" title="Αναζήτηση για: ${query}">${query}</a>
                        <button class="tm-search-list-action-btn" title="Αφαίρεση Αγαπημένου">&#128465;</button>
                    `;
                    li.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); performSearchInModal(query, config, STORAGE_KEYS); });
                    li.querySelector('button').addEventListener('click', () => {
                        toggleFavoriteSearch(query, modal.querySelector('#tm-search-favorite-btn'), STORAGE_KEYS);
                        renderHistoryAndFavorites(modal, config, STORAGE_KEYS); // Re-render after removal
                    });
                    favoritesList.appendChild(li);
                });
            }
        }

        function addMainButton() {
            const container = document.getElementById('tm-search-container');
            if (!container) return;

            const button = document.createElement('button');
            button.id = 'tm-search-btn';
            button.className = 'tm-slide-out-btn'; // Pass config
            button.textContent = 'Αναζήτηση Παραγγελίας';
            button.addEventListener('click', createSearchModal);

            container.appendChild(button);

            if (config.levelUpSystemEnabled) {
                // Add Daily Bounties button
                const questsButton = document.createElement('button');
                questsButton.id = 'tm-quests-btn';
                questsButton.className = 'tm-slide-out-btn';
                questsButton.innerHTML = '📜 Daily Bounties';
                questsButton.addEventListener('click', () => showQuestsModal(config, STORAGE_KEYS));
                container.appendChild(questsButton);
            }

            // Add Technician Stats button if on the correct page
            // This function is called on 'window.load', so the DOM is already ready.
            const isOnServiceListPage = window.location.pathname.includes('/mymanagerservice/service_list.php');
            const isView105 = new URLSearchParams(window.location.search).get('view') === '105';

            let status105Count = 0;
            if (isOnServiceListPage && isView105) {
                const gridTable = document.querySelector('table.rnr-b-grid');
                if (gridTable) {
                    const allHeaders = Array.from(gridTable.querySelectorAll('thead th'));
                    const headerTexts = allHeaders.map(th => th.innerText.trim());
                    const statusIndex = headerTexts.findIndex(text => text.includes('Κατάσταση'));

                    if (statusIndex !== -1) {
                        const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"]');
                        rows.forEach(row => {
                            const statusCell = row.cells[statusIndex];
                            // The status is inside a span with an ID like 'edit5_ccc_iStatusID'
                            const statusSpan = statusCell ? statusCell.querySelector('span[id$="_ccc_iStatusID"]') : null;
                            if (statusSpan && statusSpan.innerText.trim() === '105') {
                                status105Count++;
                            }
                        });
                    }
                }
            }

            if (config.technicianStatsEnabled && isOnServiceListPage && isView105 && status105Count >= 10) {
                const statsButton = document.createElement('button');
                statsButton.id = 'tm-tech-stats-btn';
                statsButton.innerHTML = '📊 Στατιστικά Τεχνικών';
                statsButton.className = 'tm-slide-out-btn'; // Pass config
                statsButton.onclick = initTechnicianStatsFeature; // Use onclick to prevent multiple listeners
                container.appendChild(statsButton);
            }
        }

        function createQuickSearchPanel() {
            if (!config.quickSearchEnabled) return;

            const phoneModel = getPhoneModelFromPage();
            console.log('[MMS] Detected phone model for quick search:', phoneModel || 'None');


            // The content of the "Spare Parts" tab is loaded dynamically.
            // We must use a MutationObserver to wait for the target element to appear.
            const observer = new MutationObserver((mutations, obs) => {
                // The target is the "Add" button inside the spare parts tab's content.
                // The tab's content is inside a div with id="detailPreview3"
                const sparePartsTabContent = document.getElementById('detailPreview3');
                if (!sparePartsTabContent) return; // Not loaded yet

                const addButton = sparePartsTabContent.querySelector('a[id^="inlineAdd"]');
                if (addButton) {
                    console.log('[MMS] Quick Search: Found the "Add" button in the spare parts tab.');
                    console.log('[MMS] Add button classes:', addButton.className);

                    // Check if we've already added the container to prevent duplicates
                    if (addButton.parentElement.querySelector('#tm-quick-search-container')) {
                        obs.disconnect(); // Already added, stop observing
                        return;
                    }

                    // Create a main container for the tags
                    const container = document.createElement('div');
                    container.id = 'tm-quick-search-container';

                    const panel = document.createElement('div');
                    panel.id = 'tm-quick-search-panel';

                    config.quickSearchButtons.forEach(buttonInfo => {
                        const button = document.createElement('a');
                        const searchTerm = phoneModel ? `${phoneModel} ${buttonInfo.term}` : buttonInfo.term;

                        button.textContent = buttonInfo.label;
                        // Copy the exact classes from the Add button
                        button.className = addButton.className || 'rnr-button';
                        button.href = '#';
                        button.title = `Αναζήτηση για: "${searchTerm}"`;
                        button.dataset.term = searchTerm;
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            handleQuickSearchClick(e);
                        });
                        panel.appendChild(button);
                    });
                    container.appendChild(panel);

                    // Insert the container right after the "Add" button
                    addButton.parentElement.insertBefore(container, addButton.nextSibling);

                    obs.disconnect(); // We're done, stop observing to save resources
                }
            });

            // Start observing the document for changes to find our target
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Helper to perform a search from anywhere (e.g., history, quick actions)
        function performSearchInModal(query, config, STORAGE_KEYS) {
            const modal = document.querySelector('.tm-modal-overlay');
            if (!modal) {
                // If modal isn't open, open it and then search
                createSearchModal(config, STORAGE_KEYS);
                // Need to wait a moment for the modal to be in the DOM
                setTimeout(() => performSearchInModal(query, config, STORAGE_KEYS), 100);
                return;
            }

            const searchInput = modal.querySelector('#tm-search-input');
            const searchButton = modal.querySelector('#tm-search-submit');

            if (searchInput && searchButton) {
                searchInput.value = query;
                searchButton.click();
            }
        }

        // --- Search Logic ---
        function handleSearchSubmit() {
            const input = document.getElementById('tm-search-input');
            const submitBtn = document.getElementById('tm-search-submit');
            const resultsContainer = document.getElementById('tm-results-container');

            const query = input.value.trim();
            if (!query) return;

            trackDailyStat(config, STORAGE_KEYS, 'searches');
            addSearchToHistory(query, config, STORAGE_KEYS);
            renderHistoryAndFavorites(document.querySelector('.tm-modal-overlay'), config, STORAGE_KEYS); // Update history live

            // Split the query by spaces or commas for an "AND" search where all terms must match.
            searchTerms = query.split(/[\s,]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
            if (searchTerms.length === 0) return;

            searchResults = [];
            processedUrls.clear();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Αναζήτηση...';

            let terminalInterval = null;

            if (config.hackerSearchEnabled) {
                resultsContainer.innerHTML = `<div id="tm-hacker-terminal"><div id="tm-hacker-output"></div><span class="tm-hacker-cursor"></span></div>`;
                const hackerOutput = document.getElementById('tm-hacker-output');
                const hackerLines = [
                    'Booting MyManager All-in-One Suite v1.0...',
                    'Establishing connection to thefixers.mymanager.gr...',
                    'Connection successful. Bypassing security protocols...',
                    'Accessing main database...',
                    'Injecting search query: ' + query,
                    'Compiling data streams...',
                    'Filtering results through quantum entanglement matrix...',
                    'Parsing HTML nodes... 10%...',
                    'Parsing HTML nodes... 30%...',
                    'Parsing HTML nodes... 70%...',
                    'Decompressing data packets...',
                    'Finalizing results...',
                    '<span class="tm-hacker-success">QUERY EXECUTED SUCCESSFULLY</span>'
                ];

                let lineIndex = 0;
                terminalInterval = setInterval(() => {
                    if (lineIndex < hackerLines.length) {
                        const lineDiv = document.createElement('div');
                        lineDiv.innerHTML = hackerLines[lineIndex];
                        hackerOutput.appendChild(lineDiv);
                        hackerOutput.parentElement.scrollTop = hackerOutput.parentElement.scrollHeight;
                        lineIndex++;
                    } else {
                        clearInterval(terminalInterval);
                    }
                }, 250);
            } else {
                resultsContainer.innerHTML = `<div id="tm-status-message" class="tm-minimal-loader"><div class="tm-spinner"></div>Αναζήτηση...</div>`;
            }

            // This function will be called when the search is complete.
            const onSearchComplete = () => {
                setMascotState(config, 'idle');
                if (terminalInterval) clearInterval(terminalInterval);
                // A small delay to let the "SUCCESS" message be seen if using hacker theme
                setTimeout(displayResults, config.hackerSearchEnabled ? 500 : 0);
            };

            if (config.interactiveMascotEnabled) setMascotState('searching');
            urlsToProcess = [...SEARCH_URLS]; // Re-initialize the queue with the base URLs
            processNextUrl(onSearchComplete, config); // Start the search
        }

        function handleQuickSearchClick(event) {
            const term = event.target.dataset.term;
            if (!term) return;

            const baseUrl = '/mymanagerservice/products_list.php';
            // The term is already formatted (e.g., "POCO X3 GT, LCD"), so we just need to URL-encode it.
            const searchUrl = `${baseUrl}?qs=${encodeURIComponent(term)}`;

            window.open(searchUrl, '_blank');
            trackDailyStat(config, STORAGE_KEYS, 'searches'); // Grant XP for using quick search
        }

        let urlsToProcess = [];
        let processedUrls = new Set();
        let activeSearchRequests = 0;

        // This function remains within initSearchFeature as it's specific to the search modal's operation
        function processNextUrl(onComplete) {
            if (urlsToProcess.length === 0) {
                if (activeSearchRequests === 0 && onComplete) onComplete();
                return;
            }

            const url = urlsToProcess.shift();
            // If we have already processed this exact URL, skip to the next one.
            if (processedUrls.has(url)) {
                processNextUrl(onComplete);
                return;
            }
            // Mark the URL as processed *before* the request to avoid race conditions.
            // where a page might be added to the queue multiple times.
            processedUrls.add(url);

            activeSearchRequests++; // Increment for the new request
            console.log(`Searching in: ${url} for terms:`, searchTerms);

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function(response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    parseAndSearchPage(doc, response.finalUrl);
                    activeSearchRequests--; // Decrement after processing
                    // Process the next URL in the queue if there is one
                    if (urlsToProcess.length > 0) {
                        processNextUrl(onComplete);
                    } else if (activeSearchRequests === 0) {
                        // Only call onComplete when all requests are finished
                        if (onComplete) onComplete();
                    }
                },
                onerror: function(error) {
                    console.error(`Error fetching ${url}:`, error);
                    activeSearchRequests--; // Decrement on error too
                    if (urlsToProcess.length > 0) processNextUrl(onComplete);
                }
            });
        }

        // This function remains within initSearchFeature as it's specific to the search modal's operation
        function parseAndSearchPage(doc, pageBaseUrl) {
            doc.querySelectorAll('.pagination a').forEach(a => {
                const pageHref = a.getAttribute('href');
                if (pageHref && !pageHref.startsWith('javascript:')) {
                    const absoluteUrl = new URL(pageHref, pageBaseUrl).href;
                    if (!processedUrls.has(absoluteUrl)) {
                        urlsToProcess.push(absoluteUrl);
                    }
                }
            });

            doc.querySelectorAll('tbody tr').forEach(row => {
                const rowText = row.innerText.toLowerCase();
                // Check if the row text includes ALL search terms (AND logic)
                const allTermsMatch = searchTerms.every(term => rowText.includes(term));

                if (allTermsMatch) {
                    const linkUrl = findOrderLink(row, pageBaseUrl);

                    if (linkUrl && !searchResults.some(r => r.orderLink === linkUrl)) {
                        searchResults.push({
                            term: document.getElementById('tm-search-input').value.trim(),
                            rowHTML: row.innerHTML,
                            orderLink: linkUrl
                        });
                    }
                }
            });
        }

        // --- Results & Printing ---
        function toggleOrderDetails(result, itemDiv) {
            console.log('[MMS] Toggling details for:', result);
            const existingDetails = itemDiv.querySelector('.tm-result-details-container');

            // If details are already visible, remove them to collapse the view.
            if (existingDetails) {
                existingDetails.remove();
                return;
            }

            console.log('[MMS] Creating details container and fetching from:', result.orderLink);
            // Create a container and show a loading message.
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'tm-result-details-container';
            detailsContainer.innerHTML = '<div class="tm-details-loading">Φόρτωση λεπτομερειών...</div>';
            itemDiv.appendChild(detailsContainer);

            GM_xmlhttpRequest({
                method: 'GET',
                url: result.orderLink,
                onload: function(response) {
                    console.log('[MMS] Successfully fetched order details page.');
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const details = scrapeOrderDetails(doc);
                    console.log('[MMS] Scraped details object:', details);

                    let detailsHTML = '<table class="tm-details-table">';
                    details.fields.forEach(field => {
                        detailsHTML += `
                                <tr>
                                    <td class="tm-details-label">${field.label}</td>
                                    <td class="tm-details-value">${field.value}</td>
                                </tr>`;
                    });
                    detailsHTML += '</table>';
                    detailsContainer.innerHTML = detailsHTML;

                },
                onerror: function(error) {
                    console.error('[MMS] Failed to fetch order details:', error);
                    detailsContainer.innerHTML = '<div class="tm-details-error">Αποτυχία φόρτωσης λεπτομερειών.</div>';
                }
            });
        }

        function displayResults() {
            const resultsContainer = document.getElementById('tm-results-container');
            const submitBtn = document.getElementById('tm-search-submit');
            const input = document.getElementById('tm-search-input');

            if (searchResults.length === 0) {
                resultsContainer.innerHTML = `<div id="tm-status-message">Δεν βρέθηκαν αποτελέσματα για "${input.value}". Δοκιμάστε ξανά.</div>`;
            } else {
                if (config.confettiEnabled) triggerConfetti(30); // Fun: Confetti on successful search
                resultsContainer.innerHTML = '';
                searchResults.forEach((result, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'tm-result-item';

                    // Highlight all search terms
                    let highlightedHTML = result.rowHTML;
                    searchTerms.forEach(term => {
                        const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
                        highlightedHTML = highlightedHTML.replace(regex, `<span class="tm-result-highlight">$&</span>`);
                    });

                    itemDiv.innerHTML = `
                        <div class="tm-result-header">
                            <span>Αποτέλεσμα #${index + 1} (Βρέθηκε για: ${result.term})</span>
                            <div>
                                ${result.orderLink ? `<a href="${result.orderLink}" target="_blank" class="tm-goto-btn">Μετάβαση στην Παραγγελία</a>` : ''}
                                ${result.orderLink ? `<button class="tm-print-btn" data-link="${result.orderLink}">Εκτύπωση Παραγγελίας</button>` : ''}
                            </div>
                        </div>
                        <div class="tm-result-body">
                            <table class="tm-result-table">${highlightedHTML}</table>
                        </div>
                    `;
                    resultsContainer.appendChild(itemDiv);

                    // Make the result body clickable if it has an order link
                    if (result.orderLink) {
                        const resultBody = itemDiv.querySelector('.tm-result-body');
                        console.log(`[MMS] Result #${index + 1}: Found orderLink: ${result.orderLink}. Attaching click listener.`);
                        if (resultBody) {
                            resultBody.classList.add('tm-result-clickable');
                            resultBody.title = 'Κάντε κλικ για εμφάνιση/απόκρυψη λεπτομερειών';
                            resultBody.addEventListener('click', () => {
                                toggleOrderDetails(result, itemDiv);
                            });
                        }
                    } else {
                        console.warn(`[MMS] Result #${index + 1}: No orderLink found. Not making clickable. Row HTML:`, result.rowHTML);
                    }
                });

                resultsContainer.querySelectorAll('.tm-print-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const url = e.target.dataset.link;
                        handlePrintClick(url, e.target);
                    });
                });
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Αναζήτηση';
        }

        // New function for adding print button to edit pages
        function addPrintButtonToEditPage() {
            const buttonsLeftContainer = document.querySelector('.rnr-buttons-left');
            if (!buttonsLeftContainer || document.querySelector('.tm-print-page-btn')) {
                console.warn('[MMS] Could not find .rnr-buttons-left container for print button.');
                return;
            }

            const printButton = document.createElement('a'); // Using 'a' for consistent styling with other buttons
            printButton.className = 'rnr-button main tm-print-page-btn'; // Reusing rnr-button main for consistent look
            printButton.style.marginLeft = '10px'; // Add some spacing

            printButton.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                handlePrintClick(window.location.href, printButton);
            });

            buttonsLeftContainer.appendChild(printButton);
            printButton.textContent = 'Εκτύπωση Παραγγελίας';
            printButton.href = '#'; // Prevent actual navigation
            console.log('[MMS] Print button added to edit page.');
        }

        // --- Feature Initializer ---
        const pathname = window.location.pathname;
        const isEditPage = pathname.includes('_edit.php');

        if (isEditPage && pathname.includes('/mymanagerservice/service_edit.php')) {
            createQuickSearchPanel();
        } else if (isEditPage) {
            addPrintButtonToEditPage();
        } else if (pathname.includes('_list.php')) {
            // On non-edit pages (list pages), just add the main search button.
            addMainButton();
        }
    } // Pass config

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
        let refreshTimeout = null;

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
                    clearTimeout(refreshTimeout);
                    if (countdownInterval) clearInterval(countdownInterval);
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
                    // Use smart time formatting if available
                    const formattedTime = (typeof window.formatTimeRemaining === 'function') 
                        ? window.formatTimeRemaining(timeLeft)
                        : `${Math.floor((timeLeft / 1000 / 60) % 60)}:${Math.floor((timeLeft / 1000) % 60).toString().padStart(2, '0')}`;
                    
                    textSpan.textContent = formattedTime;
                    
                    // Update circle progress
                    const progress = 1 - (timeLeft / totalTime);
                    const offset = circumference * progress;
                    progressCircle.style.strokeDashoffset = offset;
                    
                    // Change color as time runs out
                    if (timeLeft < 60000) { // Last minute
                        progressCircle.style.stroke = '#ef4444';
                        container.style.animation = 'tmPulse 1s ease infinite';
                    } else if (timeLeft < 180000) { // Last 3 minutes
                        progressCircle.style.stroke = '#f59e0b';
                    }
                    
                    timeLeft -= 1000;
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
        console.log(`Page will auto-refresh in ${REFRESH_INTERVAL_MINUTES} minutes.`);
        if (isWorkingHours()) { refreshTimeout = setTimeout(() => {
            // Check again right before refreshing to handle cases where the page was left open.
            if (isWorkingHours()) {
                console.log('Refreshing page now...');
                window.location.reload();
            } else {
                console.log('Working hours ended. Auto-refresh will not occur.');
                const timerContainer = document.getElementById('tm-refresh-timer-container');
                if (timerContainer) {
                    timerContainer.querySelector('#tm-refresh-countdown-text').textContent = '⏸';
                    timerContainer.title = 'Auto-refresh paused';
                }
            }
        }, REFRESH_INTERVAL_MS); }
    }

    // ===================================================================
    // === 4. FEATURE: SETTINGS PANEL
    // ===================================================================

    function loadSettings() {
        config = { ...DEFAULTS }; // Start with defaults
        
        // Load script enabled state using STORAGE_KEYS
        const scriptEnabled = GM_getValue(STORAGE_KEYS.SCRIPT_ENABLED, DEFAULTS.scriptEnabled);
        config.scriptEnabled = scriptEnabled;
        
        Object.keys(DEFAULTS).forEach(key => {
            const savedValue = GM_getValue(key);
            if (savedValue !== undefined) {
                // If it's a JSON string, parse it.
                if (typeof DEFAULTS[key] === 'object' && typeof savedValue === 'string') {
                    try {
                        config[key] = JSON.parse(savedValue);
                    } catch (e) {
                        console.error(`[MMS] Failed to parse saved setting for ${key}, using default.`);
                    }
                } else {
                    config[key] = savedValue;
                }
            }
        });

        const savedButtons = GM_getValue('quickSearchButtons');
        if (savedButtons) {
            try {
                config.quickSearchButtons = JSON.parse(savedButtons);
            } catch (e) {
                console.error("[MMS] Error parsing saved quick search buttons, using defaults.", e);
            }
        }
        console.log('[MMS] Settings loaded:', config);
    }

    /**
     * Initializes the settings button and the settings modal panel.
     * @param {HTMLElement} parentContainer The container element to which the settings button will be appended.
     */
    function initSettingsPanel(parentContainer, config, STORAGE_KEYS) {

        function resetSettings() {
            if (!confirm('Είστε σίγουροι; Όλες οι ρυθμίσεις θα επανέλθουν στις αρχικές τους τιμές και η σελίδα θα ανανεωθεί.')) {
                 return;
            }

            // Reset mascot appearance to level 1 and clear all accessories
            const mascotContainer = document.getElementById('tm-mascot-container');
            if (mascotContainer) {
                // Hide all equipped accessories
                const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                equippedItems.forEach(itemId => {
                    const accessory = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                    if (accessory) accessory.style.display = 'none';
                });
                
                // Reset mascot to level 1 appearance
                if (typeof updateMascotAppearanceByLevel === 'function') {
                    updateMascotAppearanceByLevel(1);
                }
            }
            
            // Clear any active buff UI elements
            const buffTimersContainer = document.getElementById('tm-buff-timers-container');
            if (buffTimersContainer) {
                buffTimersContainer.innerHTML = '';
            }

             const ALL_STORAGE_KEYS = [
                // Settings
                ...Object.keys(DEFAULTS),
                STORAGE_KEYS.USER_REROLL_TOKENS,
                // Search Feature State
                'tm_search_history', 'tm_favorite_searches',
                // Scratchpad State
                'tm_user_scratchpad_text', 'tm_user_scratchpad_geometry', 'tm_user_scratchpad_is_open', 'tm_user_scratchpad_font_size', 'tm_user_scratchpad_last_edited', 'tm_user_scratchpad_is_maximized', // Old keys for cleanup
                STORAGE_KEYS.SCRATCHPAD_NOTES, STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, STORAGE_KEYS.SCRATCHPAD_TEMPLATES,
                // Fun Features State (include old and new item keys for full cleanup)
                STORAGE_KEYS.USER_XP, STORAGE_KEYS.USER_LEVEL, STORAGE_KEYS.ACHIEVEMENTS, STORAGE_KEYS.PET_STATS, STORAGE_KEYS.USER_COINS, STORAGE_KEYS.PURCHASED_ITEMS, STORAGE_KEYS.EQUIPPED_ITEMS, STORAGE_KEYS.EQUIPPED_THEME, STORAGE_KEYS.DAILY_QUESTS, STORAGE_KEYS.DAILY_STATS,
                STORAGE_KEYS.USER_TITLE,
                // Talent System
                STORAGE_KEYS.USER_TALENT_POINTS, STORAGE_KEYS.UNLOCKED_TALENTS,
                // Notification System
                STORAGE_KEYS.USER_NOTIFICATIONS,
                // Active Buffs/Consumables
                STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES,
                STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES,
                // Consumable Tokens
                SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN,
            ];
            
            // Clear all buff duration keys
            GM_deleteValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`);
            GM_deleteValue(`${STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES}_duration`);
            
            ALL_STORAGE_KEYS.forEach(key => GM_deleteValue(key));
            alert('Όλα τα δεδομένα επαναφέρθηκαν. Το mascot είναι τώρα Level 1 και όλα τα buffs έχουν διαγραφεί. Η σελίδα θα ανανεωθεί τώρα.');
            window.location.reload();
        }

        function saveSettings() {
            const feedback = document.getElementById('tm-settings-feedback');
            feedback.textContent = ''; // Clear previous feedback

            // --- Helper to save a checkbox setting ---
            const saveCheckbox = (id, key) => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    const value = checkbox.checked;
                    GM_setValue(key, value);
                    config[key] = value;
                }
            };

            // --- Helper to save a number setting ---
            const saveNumber = (id, key) => {
                const input = document.getElementById(id);
                if (input) {
                    const value = parseInt(input.value, 10);
                    if (!isNaN(value) && value >= (input.min || 0)) {
                        GM_setValue(key, value);
                        config[key] = value;
                    }
                }
            };

            // --- Save General UI Settings ---
            // Save script enabled (master toggle)
            const scriptEnabledCheckbox = document.getElementById('tm-setting-script-enabled');
            if (scriptEnabledCheckbox) {
                GM_setValue(STORAGE_KEYS.SCRIPT_ENABLED, scriptEnabledCheckbox.checked);
                config.scriptEnabled = scriptEnabledCheckbox.checked;
            }
            
            // Debug mode is handled separately with passcode protection
            saveCheckbox('tm-setting-login-page-enabled', 'customLoginPageEnabled');
            saveCheckbox('tm-setting-dashboard-enabled', 'dashboardWidgetEnabled');
            saveCheckbox('tm-setting-scroll-top-enabled', 'scrollToTopEnabled');
            saveCheckbox('tm-setting-tech-stats-enabled', 'technicianStatsEnabled');
            saveCheckbox('tm-setting-customer-history-enabled', 'customerHistoryEnabled');
            saveCheckbox('tm-setting-automated-parts-search-enabled', 'automatedPartsSearchEnabled');

            // --- Save Auto-Refresh settings ---
            saveCheckbox('tm-setting-autorefresh-enabled', 'autoRefreshEnabled');
            const startHourInput = document.getElementById('tm-setting-wh-start');
            const endHourInput = document.getElementById('tm-setting-wh-end');

            const newStartHour = parseInt(startHourInput.value, 10);
            const newEndHour = parseInt(endHourInput.value, 10);
            if (!isNaN(newStartHour) && newStartHour >= 0 && newStartHour < 24) {
                GM_setValue('workingHoursStart', newStartHour);
                config.workingHoursStart = newStartHour;
            }
            if (!isNaN(newEndHour) && newEndHour > 0 && newEndHour <= 24) {
                GM_setValue('workingHoursEnd', newEndHour);
                config.workingHoursEnd = newEndHour;
            }

            // Save Working Days
            const newWorkingDays = [];
            document.querySelectorAll('.tm-working-day-checkbox:checked').forEach(cb => {
                newWorkingDays.push(parseInt(cb.value, 10));
            });
            GM_setValue('workingDays', JSON.stringify(newWorkingDays));
            config.workingDays = newWorkingDays;

            // Save Refresh Interval
            saveNumber('tm-setting-refresh-interval', 'refreshIntervalMinutes');

            // --- Save Search Settings ---
            saveCheckbox('tm-setting-search-enabled', 'searchFeatureEnabled');
            saveCheckbox('tm-setting-hacker-search-enabled', 'hackerSearchEnabled');
            saveNumber('tm-setting-search-history-max', 'searchMaxHistory');
            saveCheckbox('tm-setting-quick-search-enabled', 'quickSearchEnabled');

            // --- Save Scratchpad Settings ---
            saveCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');

            // --- Save Gamification/Fun Settings ---
            saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            saveNumber('tm-setting-mascot-speed', 'mascotRoamingSpeed');

            // --- Save New Feature Settings ---
            saveCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
            saveCheckbox('tm-setting-smart-templates-enabled', 'smartTemplatesEnabled');
            saveCheckbox('tm-setting-factions-enabled', 'factionsEnabled');
            saveCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
            saveCheckbox('tm-setting-boss-battles-enabled', 'bossBattlesEnabled');
            
            // --- Save Library Loading Settings ---
            saveCheckbox('tm-setting-load-libraries-from-web', 'loadLibrariesFromWeb');

            // Weather location is now hardcoded to Athens (removed from settings)

            // --- Save Quick Search Buttons ---
            const newButtons = [];
            document.querySelectorAll('#tm-quick-search-editor .tm-quick-search-row').forEach(row => {
                const labelInput = row.querySelector('input[data-type="label"]');
                const termInput = row.querySelector('input[data-type="term"]');
                if (labelInput.value.trim() && termInput.value.trim()) {
                    newButtons.push({
                        label: labelInput.value.trim(),
                        term: termInput.value.trim()
                    });
                }
            });
            GM_setValue('quickSearchButtons', JSON.stringify(newButtons));
            config.quickSearchButtons = newButtons;

            // --- Save Scratchpad Templates ---
            const newTemplates = [];
            document.querySelectorAll('#tm-scratchpad-templates-editor .tm-template-row').forEach(row => {
                const titleInput = row.querySelector('input[data-type="title"]');
                const contentInput = row.querySelector('textarea[data-type="content"]');
                if (titleInput.value.trim() && contentInput.value.trim()) {
                    newTemplates.push({
                        id: row.dataset.id || `template_${Date.now()}`,
                        title: titleInput.value.trim(),
                        content: contentInput.value.trim()
                    });
                }
            });
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, JSON.stringify(newTemplates));

            // --- Save Scratchpad Settings ---
            saveCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');

            // --- Save Gamification/Fun Settings ---
            saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');

            console.log('[MMS] Settings saved:', config);
            // Reload the page so settings apply immediately
            showPositiveMessage('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
            try { window.location.reload(); } catch (_) {}
        }

        // --- Settings Modal HTML Generators (for better readability) ---
        function getGeneralUISettingsHTML() {
            // Merged General and Login settings
            return `
                <div class="tm-settings-section">
                    <h3>Γενικές Ρυθμίσεις</h3>
                    <div class="tm-setting-row" style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%); padding: 12px; border: 2px solid #ff4757; border-radius: 8px; margin-bottom: 15px;">
                        <div class="tm-setting-label">
                            <label for="tm-setting-script-enabled" style="color: white; font-weight: 700; font-size: 14px;">⚡ Script Enabled (Master Toggle)</label>
                            <p class="tm-setting-description" style="color: white; opacity: 0.95; font-weight: 500;">Disable all script functions. Uncheck to turn off everything. Use Ctrl+Shift+E to quickly toggle.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-script-enabled" style="transform: scale(1.3);">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-login-page-enabled">Προσαρμοσμένη Σελίδα Σύνδεσης</label>
                            <p class="tm-setting-description">Αντικαθιστά την προεπιλεγμένη σελίδα σύνδεσης με μια μινιμαλιστική έκδοση.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-login-page-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-dashboard-enabled">Εμφάνιση Widget "Σήμερα"</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-dashboard-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-scroll-top-enabled">Εμφάνιση Κουμπιού "Scroll to Top"</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-scroll-top-enabled"></div>
                    </div>
                    <div class="tm-setting-row" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px; border: 2px solid #5a67d8; border-radius: 8px; margin-bottom: 15px;">
                        <div class="tm-setting-label">
                            <label for="tm-setting-load-libraries-from-web" style="color: white; font-weight: 700; font-size: 14px;">🌐 Load Libraries from Web</label>
                            <p class="tm-setting-description" style="color: white; opacity: 0.95; font-weight: 500;">Load script modules from web URLs instead of local files. Requires internet connection. Page will reload after change.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-load-libraries-from-web" style="transform: scale(1.3);">
                        </div>
                    </div>
                    <div class="tm-setting-row" style="background: #fffbe6; padding-top: 10px; padding-bottom: 10px; border: 1px solid #ffe58f; border-radius: 5px;">
                        <div class="tm-setting-label">
                            <label for="tm-setting-debug-enabled">🔐 Debug Mode (Protected)</label>
                            <p class="tm-setting-description">Ενεργοποιεί επιλογές για testing και δωρεάν αντικείμενα στο κατάστημα. <strong>Απαιτείται κωδικός πρόσβασης.</strong></p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-debug-enabled"></div>
                    </div>
                </div>
            `;
        }

        function getDebugSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>🔧 Εργαλεία Debug</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-level-input">Ορισμός Level</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-level-input" min="1" value="${GM_getValue(STORAGE_KEYS.USER_LEVEL, 1)}"><button id="tm-debug-set-level-btn">Set</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-xp-input">Προσθήκη XP</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-xp-input" value="100"><button id="tm-debug-add-xp-btn">Add</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-coins-input">Προσθήκη Coins</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-coins-input" value="1000"><button id="tm-debug-add-coins-btn">Add</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Trigger Random Event</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-trigger-event-btn" style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🎲 Trigger Event</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Stop Random Event</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-stop-event-btn" style="background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🛑 Stop Event</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Spawn Boss Battle</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-spawn-boss-btn" style="background: linear-gradient(135deg, #ff5252 0%, #b71c1c 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">⚔️ Spawn Boss</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Stop Boss Battle</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-stop-boss-btn" style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🛑 Stop Boss</button></div>
                    </div>
                </div>
            `;
        }
        // Pass config
        function getSearchSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Αναζήτηση & Εργαλεία</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-search-enabled">Ενεργοποίηση Προηγμένης Αναζήτησης</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-hacker-search-enabled">Ενεργοποίηση "Hacker" Θέματος Αναζήτησης</label>
                            <p class="tm-setting-description">Εμφανίζει μια animation τερματικού κατά την αναζήτηση.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-hacker-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-search-history-max">Μέγεθος Ιστορικού Αναζητήσεων</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-setting-search-history-max" min="0" max="50"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-quick-search-enabled">Ενεργοποίηση Κουμπιών Γρήγορης Αναζήτησης</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-quick-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-tech-stats-enabled">Ενεργοποίηση Στατιστικών Τεχνικών</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-tech-stats-enabled"></div>
                    </div>
                </div>`;
        }

        function getAutoRefreshSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Αυτόματη Ανανέωση</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-autorefresh-enabled">Ενεργοποίηση Αυτόματης Ανανέωσης</label>
                            <p class="tm-setting-description">Ανανεώνει αυτόματα τις σελίδες λίστας.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-autorefresh-enabled" ${config.autoRefreshEnabled ? 'checked' : ''}>
                        </div>
                    </div>
                    <div id="tm-autorefresh-options">
                        <div class="tm-setting-row">
                            <div class="tm-setting-label">
                                <label for="tm-setting-refresh-interval">Διάστημα Ανανέωσης</label>
                                <p class="tm-setting-description">Ορίστε το διάστημα σε λεπτά.</p>
                            </div>
                            <div class="tm-setting-control">
                                <input type="number" id="tm-setting-refresh-interval" value="${config.refreshIntervalMinutes}" min="1" max="120">
                                <span>λεπτά</span>
                            </div>
                        </div>
                        <div id="tm-working-hours-editor">
                            <p class="tm-setting-description" style="text-align:center; margin-bottom:10px;">Ενεργό μόνο τις παρακάτω ώρες και ημέρες:</p>
                            <div id="tm-working-hours-time-inputs">
                                <label for="tm-setting-wh-start">Από:</label>
                                <input type="number" id="tm-setting-wh-start" value="${config.workingHoursStart}" min="0" max="23">
                                <label for="tm-setting-wh-end">Έως:</label>
                                <input type="number" id="tm-setting-wh-end" value="${config.workingHoursEnd}" min="1" max="24">
                            </div>
                            <div id="tm-working-days-editor"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        function getQuickSearchEditorHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Επεξεργαστής Γρήγορης Αναζήτησης</h3>
                    <p class="tm-setting-description">Προσαρμόστε τα κουμπιά που εμφανίζονται στις σελίδες επεξεργασίας παραγγελιών για γρήγορες αναζητήσεις ανταλλακτικών. Η 'Ετικέτα' είναι αυτό που εμφανίζει το κουμπί, και ο 'Όρος Αναζήτησης' είναι η λέξη-κλειδί που αναζητά.</p>
                    <div id="tm-quick-search-editor" style="padding: 0 10px;"></div>
                    <button id="tm-quick-search-add-btn" style="margin-top: 15px;">Προσθήκη Νέου Κουμπιού</button>
                </div>
            `;
        }

        function getScratchpadTemplatesEditorHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Πρότυπα Σημειωματαρίου</h3>
                    <p class="tm-setting-description">Δημιουργήστε πρότυπα για γρήγορη εισαγωγή στο σημειωματάριο. Χρήσιμο για checklists ή επαναλαμβανόμενες σημειώσεις.</p>
                    <div id="tm-scratchpad-templates-editor" style="padding: 0 10px;"></div>
                    <button id="tm-scratchpad-template-add-btn" style="margin-top: 15px;">Προσθήκη Νέου Προτύπου</button>
                </div>
            `;
        }

        function getScratchpadSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Σημειωματάριο</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-scratchpad-enabled">Ενεργοποίηση Σημειωματαρίου</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-scratchpad-enabled"></div>
                    </div>
                </div>
                ${getScratchpadTemplatesEditorHTML()}
            `;
        }

        function getLevelUpSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Gamification</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-levelup-enabled">Ενεργοποίηση Συστήματος Level-Up</label><p class="tm-setting-description">Κερδίστε XP και ανεβείτε level ολοκληρώνοντας εργασίες.</p></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-levelup-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-confetti-enabled">Ενεργοποίηση Εφέ Confetti</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-confetti-enabled"></div>
                    </div>
                </div>`;
        }

        function getMascotSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>🤖 Mascot</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-mascot-enabled">Ενεργοποίηση Mascot</label><p class="tm-setting-description">Εμφανίζει έναν διαδραστικό βοηθό στην οθόνη.</p></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-mascot-enabled"></div>
                    </div>
                <div class="tm-setting-row">
                    <div class="tm-setting-label">
                        <label for="tm-setting-weather-location">Τοποθεσία Καιρού</label>
                        <p class="tm-setting-description">Ορίστε την τοποθεσία για την αντίδραση του mascot στον καιρό (π.χ., "Athens, GR").</p>
                    </div>
                    <div class="tm-setting-control">
                        <input type="text" id="tm-setting-weather-location" style="width: 150px; text-align: left; padding: 8px;">
                    </div>
                </div>
                <div class="tm-setting-row">
                    <div class="tm-setting-label">
                        <label for="tm-setting-mascot-speed">Ταχύτητα Περιπλάνησης</label>
                        <p class="tm-setting-description">Ορίστε την ταχύτητα κίνησης του mascot (pixels ανά δευτερόλεπτο).</p>
                    </div>
                    <div class="tm-setting-control">
                        <input type="number" id="tm-setting-mascot-speed" min="25" max="500" step="25">
                    </div>
                </div>
                </div>`;
        }

        function getTalentsHTML() {
            const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
            const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));

            const talentsGrid = TALENT_TREE.map(talent => {
                const isUnlocked = unlockedTalents.includes(talent.id);
                const canAfford = talentPoints >= talent.cost;
                let buttonHTML;

                if (isUnlocked) {
                    buttonHTML = `<button class="tm-talent-btn unlocked" disabled>Unlocked</button>`;
                } else {
                    buttonHTML = `<button class="tm-talent-btn unlockable" data-talent-id="${talent.id}" ${!canAfford ? 'disabled' : ''}>Unlock (${talent.cost} TP)</button>`;
                }

                return `
                    <div class="tm-talent-item ${isUnlocked ? 'unlocked' : ''}">
                        <div class="tm-talent-name">${talent.name}</div>
                        <div class="tm-talent-description">${talent.description}</div>
                        ${buttonHTML}
                    </div>
                `;
            }).join('');

            return `
                <div class="tm-settings-section">
                    <h3>🌟 Talents</h3>
                    <div class="tm-talent-points-display">Διαθέσιμοι Πόντοι Talent: <span>${talentPoints}</span></div>
                    <p class="tm-setting-description">Ξοδέψτε πόντους που κερδίζετε από τα level up για να ξεκλειδώσετε μόνιμα passive bonuses.</p>
                    <div id="tm-talents-grid">${talentsGrid}</div>
                </div>
            `;
        }

        function getDataManagementHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Διαχείριση Δεδομένων</h3>
                    <p class="tm-setting-description">Εξάγετε όλες τις ρυθμίσεις και την πρόοδό σας σε ένα αρχείο JSON για backup, ή εισάγετέ το σε άλλη συσκευή.</p>
                    <div class="tm-data-actions">
                        <button id="tm-export-data-btn" class="tm-data-btn export">💾 Export Data</button>
                        <button id="tm-import-data-btn" class="tm-data-btn import">📂 Import Data</button>
                    </div>
                    <p class="tm-setting-description" style="text-align: center; margin-top: 20px;">Επαναφέρετε όλες τις ρυθμίσεις και την πρόοδο στις αρχικές τους τιμές. <strong>Αυτή η ενέργεια δεν αναιρείται.</strong></p>
                    <div class="tm-data-actions"><button id="tm-settings-reset" class="tm-data-btn reset">⚠️ Reset All Data</button></div>
                </div>`;
        }

        function handleExportData() {
            const backupData = {};
            const keysToBackup = [
                ...Object.keys(DEFAULTS), // All config keys
                ...Object.values(STORAGE_KEYS) // All dynamic data keys
            ];

            keysToBackup.forEach(key => {
                const value = GM_getValue(key);
                if (value !== undefined) {
                    backupData[key] = value;
                }
            });

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            const today = new Date().toISOString().slice(0, 10);
            a.download = `MyManagerSuite_Backup_${today}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showPositiveMessage('Data exported successfully!');
        }

        function handleImportData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = readerEvent => {
                    try {
                        const importedData = JSON.parse(readerEvent.target.result);

                        // Basic validation
                        if (typeof importedData.USER_XP === 'undefined' && typeof importedData.autoRefreshEnabled === 'undefined') {
                            throw new Error('Μη έγκυρη μορφή αρχείου backup.');
                        }

                        if (!confirm('Είστε σίγουροι ότι θέλετε να εισάγετε αυτά τα δεδομένα; Όλη η τρέχουσα πρόοδος και οι ρυθμίσεις θα αντικατασταθούν.')) {
                            return;
                        }

                        Object.keys(importedData).forEach(key => {
                            GM_setValue(key, importedData[key]);
                        });

                        alert('Τα δεδομένα εισήχθησαν με επιτυχία! Η σελίδα θα ανανεωθεί για να εφαρμοστούν οι αλλαγές.');
                        window.location.reload();

                    } catch (error) {
                        alert(`Σφάλμα κατά την εισαγωγή δεδομένων: ${error.message}`);
                        console.error('[MMS] Import failed:', error);
                    }
                };

                reader.readAsText(file);
            };

            input.click();
        }

        function createSettingsModal() {
            const overlay = document.createElement('div'); // Pass config
            overlay.className = 'tm-modal-overlay';
            overlay.innerHTML = `
                <div class="tm-modal-content"> // Pass config
                    <div class="tm-modal-header">
                        <h2 class="tm-modal-title">Ρυθμίσεις MyManager Suite</h2>
                        <button class="tm-modal-close">&times;</button>
                    </div>
                    <div class="tm-settings-layout">
                        <aside class="tm-settings-sidebar">
                            <ul class="tm-nav">
                                <li><a href="#sec-general">Γενικές</a></li>
                                <li><a href="#sec-search">Αναζήτηση & Εργαλεία</a></li>
                                <li><a href="#sec-autorefresh">Αυτόματη Ανανέωση</a></li>
                                <li><a href="#sec-scratchpad">Σημειωματάριο</a></li>                            
                                <li><a href="#sec-gamification">🎮 Gamification & Mascot</a></li>
                                <li><a href="#sec-data">Δεδομένα & Backup</a></li>
                                <li style="display: none;" data-debug-only="true"><a href="#sec-debug">🔧 Debug</a></li>
                            </ul>
                        </aside>
                        <main class="tm-settings-main" id="tm-settings-content">
                            <section id="sec-general">${getGeneralUISettingsHTML()}</section>
                            <section id="sec-search">${getSearchSettingsHTML()}${getQuickSearchEditorHTML()}</section>
                            <section id="sec-autorefresh">${getAutoRefreshSettingsHTML()}</section>
                            <section id="sec-scratchpad">${getScratchpadSettingsHTML()}</section>
                            <section id="sec-gamification">${getGamificationSettingsHTML(STORAGE_KEYS)}</section>
                            <section id="sec-debug">${getDebugSettingsHTML()}</section>
                            <section id="sec-data">${getDataManagementHTML()}</section>
                        </main>
                    </div>
                    <div class="tm-modal-footer">
                        <span id="tm-settings-feedback"></span>
                        <button id="tm-settings-save">Αποθήκευση & Επαναφόρτωση</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Event Listeners
            overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
            overlay.querySelector('#tm-settings-save').addEventListener('click', saveSettings);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            try {
                const links = overlay.querySelectorAll('.tm-settings-sidebar .tm-nav a');
                const sections = overlay.querySelectorAll('.tm-settings-main section');
                const debugTab = overlay.querySelector('[data-debug-only="true"]');
                const shopLink = Array.from(links).find(a => a.getAttribute('href') === '#sec-shop');

                function activate(id) {
                    sections.forEach(sec => sec.classList.toggle('active', '#' + sec.id === id));
                    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
                }
                links.forEach(a => {
                    a.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        const id = a.getAttribute('href');
                        activate(id);
                    });
                });
                // Special handling for debug tab
                if (debugTab) {
                    debugTab.style.display = config.debugEnabled ? 'block' : 'none';
                }
                // default active first
                if (links.length) activate(links[0].getAttribute('href'));
            } catch(_) {}

            // Talent unlock logic - Attach listener to the main content area for delegation
            const settingsContent = overlay.querySelector('#tm-settings-content');
            if (settingsContent) {
                settingsContent.addEventListener('click', (e) => handleTalentUnlock(e, STORAGE_KEYS));
                initDebugControls(config); // Initialize debug button listeners
            }

            // Attach listeners for Data Management buttons now that they exist in the DOM
            overlay.querySelector('#tm-settings-reset')?.addEventListener('click', resetSettings);
            overlay.querySelector('#tm-export-data-btn')?.addEventListener('click', handleExportData);
            overlay.querySelector('#tm-import-data-btn')?.addEventListener('click', handleImportData);

            // --- Populate Checkboxes ---
            const populateCheckbox = (id, key) => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = config[key];
            };
            populateCheckbox('tm-setting-script-enabled', 'scriptEnabled');
            populateCheckbox('tm-setting-load-libraries-from-web', 'loadLibrariesFromWeb');
            populateCheckbox('tm-setting-debug-enabled', 'debugEnabled');
            
            // Add passcode protection for debug mode
            const debugCheckbox = document.getElementById('tm-setting-debug-enabled');
            if (debugCheckbox) {
                debugCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Trying to enable debug mode - require passcode
                        const passcode = prompt('🔐 Enter Debug Mode Passcode:');
                        const correctPasscode = '1337'; // You can change this
                        
                        if (passcode !== correctPasscode) {
                            e.target.checked = false;
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage('❌ Incorrect passcode!');
                            } else {
                                alert('❌ Incorrect passcode!');
                            }
                            return;
                        } else {
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage('✓ Debug mode unlocked!');
                            }
                        }
                    }
                    // Save the value
                    GM_setValue('debugEnabled', e.target.checked);
                    config.debugEnabled = e.target.checked;
                });
            }
            
            populateCheckbox('tm-setting-login-page-enabled', 'customLoginPageEnabled');
            populateCheckbox('tm-setting-dashboard-enabled', 'dashboardWidgetEnabled');
            populateCheckbox('tm-setting-scroll-top-enabled', 'scrollToTopEnabled');
            populateCheckbox('tm-setting-tech-stats-enabled', 'technicianStatsEnabled');
            populateCheckbox('tm-setting-search-enabled', 'searchFeatureEnabled');
            populateCheckbox('tm-setting-hacker-search-enabled', 'hackerSearchEnabled');
            populateCheckbox('tm-setting-automated-parts-search-enabled', 'automatedPartsSearchEnabled');
            populateCheckbox('tm-setting-quick-search-enabled', 'quickSearchEnabled');
            populateCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');
            populateCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            populateCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            populateCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            populateCheckbox('tm-setting-customer-history-enabled', 'customerHistoryEnabled');
            
            // Populate new feature checkboxes
            populateCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
            populateCheckbox('tm-setting-smart-templates-enabled', 'smartTemplatesEnabled');
            populateCheckbox('tm-setting-factions-enabled', 'factionsEnabled');
            populateCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
            populateCheckbox('tm-setting-boss-battles-enabled', 'bossBattlesEnabled');
            
            document.getElementById('tm-setting-search-history-max').value = config.searchMaxHistory;
            initGamificationSettings(config, STORAGE_KEYS);

            // Logic for the new checkbox
            const checkbox = overlay.querySelector('#tm-setting-autorefresh-enabled');
            const optionsDiv = overlay.querySelector('#tm-autorefresh-options');

            checkbox.checked = config.autoRefreshEnabled;
            optionsDiv.style.display = config.autoRefreshEnabled ? 'block' : 'none';

            checkbox.addEventListener('change', () => {
                optionsDiv.style.display = checkbox.checked ? 'block' : 'none';
            });

            // --- Populate Working Hours Editor ---
            const whDaysEditor = overlay.querySelector('#tm-working-days-editor');
            const daysOfWeek = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
            daysOfWeek.forEach((day, index) => {
                const isChecked = config.workingDays.includes(index);
                whDaysEditor.innerHTML += `
                    <span>
                        <input type="checkbox" class="tm-working-day-checkbox" id="day-${index}" value="${index}" ${isChecked ? 'checked' : ''}>
                        <label for="day-${index}" style="display: inline; font-weight: normal;">${day}</label>
                    </span>
                `;
            });

            // --- Populate and manage Quick Search Editor ---
            const editorContainer = overlay.querySelector('#tm-quick-search-editor');

            function renderQuickSearchRows() {
                editorContainer.innerHTML = ''; // Clear existing rows
                config.quickSearchButtons.forEach((button) => {
                    addNewQuickSearchRow(button.label, button.term);
                });
            }

            function addNewQuickSearchRow(label = '', term = '') {
                const row = document.createElement('div');
                row.className = 'tm-quick-search-row';
                row.innerHTML = `
                    <input type="text" placeholder="Ετικέτα (π.χ., Οθόνη)" data-type="label" value="${label}">
                    <input type="text" placeholder="Όρος Αναζήτησης (π.χ., LCD)" data-type="term" value="${term}">
                    <button class="tm-quick-search-remove-btn" title="Αφαίρεση Κουμπιού">&times;</button>
                `;
                editorContainer.appendChild(row);
                row.querySelector('.tm-quick-search-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-quick-search-row').remove();
                });
            }

            // --- Populate and manage Scratchpad Templates Editor ---
            const templatesEditorContainer = overlay.querySelector('#tm-scratchpad-templates-editor');
            const savedTemplates = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, '[]'));

            function renderScratchpadTemplateRows() {
                templatesEditorContainer.innerHTML = ''; // Clear existing rows
                savedTemplates.forEach(template => {
                    addNewScratchpadTemplateRow(template);
                });
            }

            function addNewScratchpadTemplateRow(template = { id: '', title: '', content: '' }) {
                const row = document.createElement('div');
                row.className = 'tm-template-row';
                row.dataset.id = template.id;
                row.style.marginBottom = '15px';
                row.innerHTML = `
                    <input type="text" placeholder="Τίτλος Προτύπου" data-type="title" value="${template.title}" style="width: 100%; padding: 8px; box-sizing: border-box; margin-bottom: 5px;">
                    <textarea placeholder="Περιεχόμενο Προτύπου..." data-type="content" style="width: 100%; min-height: 80px; padding: 8px; box-sizing: border-box; font-family: monospace;">${template.content}</textarea>
                    <button class="tm-template-remove-btn" title="Αφαίρεση Προτύπου" style="background: var(--tm-danger-color); color: white; border: none; border-radius: 4px; cursor: pointer; float: right; margin-top: 5px;">&times;</button>
                `;
                templatesEditorContainer.appendChild(row);
                row.querySelector('.tm-template-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-template-row').remove();
                });
            }

            overlay.querySelector('#tm-scratchpad-template-add-btn').addEventListener('click', (e) => {
                e.preventDefault();
                addNewScratchpadTemplateRow();
            });

            // Attach listener for the Quick Search "Add" button now that it's in the DOM
            overlay.querySelector('#tm-quick-search-add-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                addNewQuickSearchRow();
            });

            // Attach listener for the Quick Search "Add" button now that it's in the DOM
            overlay.querySelector('#tm-quick-search-add-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                addNewQuickSearchRow();
            });
            renderScratchpadTemplateRows();
            renderQuickSearchRows(); // Initial render
        }

        function initDebugControls(config) {
            if (!config.debugEnabled) return;

            document.getElementById('tm-debug-set-level-btn')?.addEventListener('click', () => {
                const newLevel = parseInt(document.getElementById('tm-debug-level-input').value, 10);
                if (newLevel > 0) {
                    GM_setValue(STORAGE_KEYS.USER_LEVEL, newLevel);
                    GM_setValue(STORAGE_KEYS.USER_XP, 0);
                    
                    // Update the title based on the new level
                    const newRank = RANKS.slice().reverse().find(r => newLevel >= r.level) || RANKS[0];
                    GM_setValue(STORAGE_KEYS.USER_TITLE, newRank.title);
                    
                    // Update mascot appearance
                    if (typeof updateMascotAppearanceByLevel === 'function') {
                        updateMascotAppearanceByLevel(newLevel);
                    }
                    
                    // Update UI
                    updateXpBarUI(STORAGE_KEYS, newLevel, 0, getXpForLevel(newLevel));
                    showPositiveMessage(`Level set to ${newLevel}. Title: ${newRank.title}`);
                }
            });
            document.getElementById('tm-debug-add-xp-btn')?.addEventListener('click', () => {
                const xpToAdd = parseInt(document.getElementById('tm-debug-xp-input').value, 10); if (xpToAdd) grantXp(config, STORAGE_KEYS, xpToAdd);
            });
            document.getElementById('tm-debug-add-coins-btn')?.addEventListener('click', () => {
                const coinsToAdd = parseInt(document.getElementById('tm-debug-coins-input').value, 10); if (coinsToAdd) grantCoins(config, STORAGE_KEYS, coinsToAdd);
            });
            
            // Trigger Random Event button
            document.getElementById('tm-debug-trigger-event-btn')?.addEventListener('click', () => {
                if (typeof window.forceRandomEvent === 'function') {
                    window.forceRandomEvent(config, STORAGE_KEYS);
                    showPositiveMessage('🎲 Random event triggered!');
                } else {
                    showPositiveMessage('❌ Random events not available');
                }
            });
            
            // Stop Random Event button
            document.getElementById('tm-debug-stop-event-btn')?.addEventListener('click', () => {
                if (typeof window.stopRandomEvent === 'function') {
                    window.stopRandomEvent(STORAGE_KEYS);
                    showPositiveMessage('🛑 Random event stopped!');
                } else {
                    showPositiveMessage('❌ Random events not available');
                }
            });
            
            // Spawn Boss Battle button
            document.getElementById('tm-debug-spawn-boss-btn')?.addEventListener('click', () => {
                if (typeof window.forceBossSpawn === 'function') {
                    window.forceBossSpawn(config, STORAGE_KEYS);
                    showPositiveMessage('⚔️ Boss battle spawned!');
                } else {
                    showPositiveMessage('❌ Boss battles not available');
                }
            });
            
            // Stop Boss Battle button
            document.getElementById('tm-debug-stop-boss-btn')?.addEventListener('click', () => {
                if (typeof window.stopBossBattle === 'function') {
                    window.stopBossBattle(STORAGE_KEYS);
                    showPositiveMessage('🛑 Boss battle stopped!');
                } else {
                    showPositiveMessage('❌ Boss battles not available');
                }
            });
        }
        function handleTalentUnlock(e, STORAGE_KEYS) {
            if (!e.target.matches('.tm-talent-btn.unlockable')) return;

            const button = e.target;
            const talentId = button.dataset.talentId;
            const talent = TALENT_TREE.find(t => t.id === talentId);

            if (talent) {
                let talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                if (talentPoints >= talent.cost) {
                    talentPoints -= talent.cost;
                    GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, talentPoints);

                    let unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                    unlockedTalents.push(talentId);
                    GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlockedTalents));

                    // Re-render the talents section
                    document.getElementById('tm-talents-grid').parentElement.innerHTML = getTalentsHTML(STORAGE_KEYS);
                }
            }
        }
        function addSettingsButton() {
            // --- Notification Bell ---
            if (config.levelUpSystemEnabled) {
                const bellWrapper = document.createElement('div');
                bellWrapper.id = 'tm-notification-bell-wrapper';
                bellWrapper.innerHTML = `
                    <button id="tm-notification-bell-btn" title="Notifications">🔔</button>
                    <span id="tm-notification-unread-count">0</span>
                `;
                parentContainer.appendChild(bellWrapper);
                bellWrapper.querySelector('#tm-notification-bell-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent the outside click listener from firing immediately
                    toggleNotificationPanel();
                });
                updateNotificationBadge(); // Initial check
            }

            const button = document.createElement('button');
            button.id = 'tm-settings-btn';
            button.innerHTML = '⚙️'; // Settings gear icon
            button.title = 'Ρυθμίσεις MyManager Suite';
            button.addEventListener('click', createSettingsModal);
            parentContainer.appendChild(button);

            const coinBalance = document.createElement('div');
            coinBalance.id = 'tm-coin-balance';
            coinBalance.title = 'Fixer-Coins (Click to open Shop)';
            coinBalance.style.cursor = 'pointer'; // Pass config
            coinBalance.addEventListener('click', () => {
                if (typeof window.showShopModal === 'function') {
                    window.showShopModal(config, STORAGE_KEYS);
                }
            });
            parentContainer.appendChild(coinBalance);
            updateCoinBalanceUI(STORAGE_KEYS, GM_getValue(STORAGE_KEYS.USER_COINS, 0));

            // This button seems unused, so I'm commenting it out for now.
            // const wordCloudButton = document.createElement('button');
            // wordCloudButton.id = 'tm-word-cloud-btn';
            // wordCloudButton.className = 'tm-slide-out-btn';
            // wordCloudButton.textContent = '☁️ Word Cloud Σήμερα';
        }

        // Initializer for settings
        addSettingsButton();
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

    function toggleNotificationPanel() {
        let panel = document.getElementById('tm-notification-panel');
        if (panel) {
            panel.remove();
            return;
        }

        panel = document.createElement('div');
        panel.id = 'tm-notification-panel';

        const notifications = JSON.parse(GM_getValue(STORAGE_KEYS.USER_NOTIFICATIONS, '[]'));
        let listHTML = '';

        if (notifications.length === 0) {
            listHTML = '<div id="tm-notification-empty-state">No notifications yet!</div>';
        } else {
            listHTML = notifications.map(n => `
                <div class="tm-notification-item ${n.read ? '' : 'unread'}">
                    <div class="tm-notification-icon">${n.icon}</div>
                    <div class="tm-notification-content">
                        <div class="tm-notification-message">${n.message}</div>
                        <div class="tm-notification-timestamp">${new Date(n.timestamp).toLocaleString('el-GR')}</div>
                    </div>
                </div>
            `).join('');
        }

        panel.innerHTML = `
            <div class="tm-notification-header">
                <h4>Notifications</h4>
                <button id="tm-mark-all-read-btn">Mark all as read</button>
            </div>
            <div id="tm-notification-list">${listHTML}</div>
        `;

        document.getElementById('tm-notification-bell-wrapper').appendChild(panel);

        // Mark all as read logic
        panel.querySelector('#tm-mark-all-read-btn').addEventListener('click', () => {
            let notifs = JSON.parse(GM_getValue(STORAGE_KEYS.USER_NOTIFICATIONS, '[]'));
            notifs.forEach(n => n.read = true);
            GM_setValue(STORAGE_KEYS.USER_NOTIFICATIONS, JSON.stringify(notifs));
            updateNotificationBadge();
            toggleNotificationPanel(); // Close the panel
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (panel && !panel.contains(e.target) && e.target.closest('#tm-notification-bell-btn') === null) {
                    panel.remove();
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 0);
    }
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

        // 2. Find the main search button container and add the toggle button there.
        const rightSideContainer = document.getElementById('tm-search-container');
        if (!rightSideContainer) {
            console.log('[MMS] Right-side container not found, not adding Scratchpad toggle button.');
            return; // Don't add the button if the main container isn't there
        }

        const toggleButton = document.createElement('button');
        toggleButton.id = 'tm-scratchpad-toggle-btn';
        toggleButton.className = 'tm-slide-out-btn';
        toggleButton.textContent = '🗒️ Σημειωματάριο';
        rightSideContainer.appendChild(toggleButton);

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

        // --- Data Migration from old format ---
        function migrateOldScratchpadData() {
            const oldText = GM_getValue('tm_user_scratchpad_text');
            if (oldText !== undefined && oldText !== null) {
                console.log('[MMS] Migrating old scratchpad data to new multi-note format.');
                const oldReminder = JSON.parse(GM_getValue('tm_scratchpad_reminder', 'null'));
                const oldLastEdited = GM_getValue('tm_user_scratchpad_last_edited');

                const newNote = {
                    id: `note_${Date.now()}`,
                    title: 'Default Note',
                    content: oldText,
                    reminder: oldReminder,
                    isPinned: false,
                    lastEdited: oldLastEdited,
                    fontSize: GM_getValue('tm_user_scratchpad_font_size', 13)
                };

                GM_setValue(STORAGE_KEYS.SCRATCHPAD_NOTES, JSON.stringify([newNote]));
                GM_setValue(STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID, newNote.id);

                // Delete old keys
                GM_deleteValue('tm_user_scratchpad_text');
                GM_deleteValue('tm_scratchpad_reminder');
                GM_deleteValue('tm_user_scratchpad_last_edited');
                GM_deleteValue('tm_user_scratchpad_font_size');
            }
        }
        migrateOldScratchpadData();

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
            highlightSearchTermsInEditor(); // Highlight after loading
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
            // Ensure scratchpad is open
            if (container.style.display !== 'flex') {
                toggleButton.click();
            }
            // Add source link if provided
            const sourceLinkHTML = sourceUrl ? `<a href="${sourceUrl}" target="_blank" class="tm-scratchpad-source-link">🔗 Go to Source</a>` : '';

            // Append text to the current note
            const currentContent = editor.innerHTML;
            const newContent = currentContent ? `${currentContent}<br><br>${text} ${sourceLinkHTML}` : `${text} ${sourceLinkHTML}`;
            editor.innerHTML = newContent;
            debouncedSaveText(); // Save the changes
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
        console.log('[MMS] Reminder check system initialized.');
    }

    /**
     * Creates and displays a modal showing all available titles and ranks.
     */
    function showTitlesModal() {
        if (document.querySelector('#tm-titles-modal')) return; // Prevent multiple modals

        const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.id = 'tm-titles-modal';

        const titlesHTML = RANKS.map(rank => {
            const isUnlocked = currentLevel >= rank.level;
            const glowStyle = rank.glow ? `text-shadow: 0 0 5px ${rank.color};` : '';

            return `
                <div class="tm-title-item ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="tm-title-level">Lv. ${rank.level}</div>
                    <div class="tm-title-name" style="color: ${rank.color}; ${glowStyle}">${rank.title}</div>
                </div>
            `;
        }).join('');

        overlay.innerHTML = `
            <div class="tm-modal-content" style="max-width: 600px; height: auto;">
                <div class="tm-modal-header"><h2 class="tm-modal-title">🏆 Titles & Ranks</h2><button class="tm-modal-close">&times;</button></div>
                <div id="tm-titles-container">${titlesHTML}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }
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
                        const rowText = Array.from(row.cells)
                            .map((cell, index) => {
                                const header = headers[index];
                                const text = cell.innerText.trim();
                                // Skip the first column (checkbox) and any empty cells
                                if (index === 0 || !text || !header) {
                                    return null;
                                }
                                return text;
                            })
                            .filter(Boolean) // Remove null entries
                            .join(' | ');

                        if (typeof window.sendToScratchpad === 'function') {
                            window.sendToScratchpad(rowText, orderLink);
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
     * Initializes fun, non-essential features like confetti.
     */
    function initFunFeatures() {
        if (!config.confettiEnabled) return;

        // --- Track Status Changes & Confetti on Completion ---
        if (window.location.pathname.includes('/mymanagerservice/service_edit.php')) {
            const buttons = document.querySelectorAll('.rnr-b-editbuttons a.rnr-button');
            console.log(`[MMS] Found ${buttons.length} buttons on page. Analyzing...`);
            
            buttons.forEach(button => {
                // Assume any button in this container that isn't "Back to List" or "Print" is a status change.
                const buttonText = button.innerText.toUpperCase().trim();
                
                // Check if it's a navigation button (not a status change)
                const isBackButton = buttonText.includes('BACK TO LIST') || 
                                    buttonText.includes('ΕΚΤΥΠΩΣΗ') ||
                                    buttonText.includes('ΠΙΣΩ ΣΤΗ ΛΙΣΤΑ') ||
                                    buttonText.includes('ΠΙΣΩ ΣΤΗ') ||
                                    buttonText.includes('ΛΙΣΤΑ') ||
                                    buttonText === 'ΠΙΣΩ';
                
                const isStatusButton = !isBackButton;
                
                // Debug log
                console.log(`[MMS] Button: "${buttonText}" -> isBackButton: ${isBackButton}, will ${isStatusButton ? 'TRACK' : 'SKIP'}`);

                if (isStatusButton) {
                    button.addEventListener('click', () => {
                        // Double-check this isn't a back/nav button (safety check)
                        const clickedText = button.innerText.toUpperCase().trim();
                        if (clickedText.includes('ΠΙΣΩ') || clickedText.includes('ΛΙΣΤΑ') || clickedText.includes('BACK')) {
                            console.log(`[MMS] ⏭️ Skipping navigation button: "${button.innerText}"`);
                            return; // Exit early, don't track
                        }
                        
                        // Try multiple methods to detect the target status
                        let targetStatus = null;
                        
                        console.log(`[MMS] 🔍 Status button clicked: "${button.innerText}"`);
                        
                        // Method 1: Check button text for known status keywords (most reliable)
                        const buttonTextLower = button.innerText.toLowerCase();
                        const buttonTextUpper = button.innerText.toUpperCase();
                        
                        // Greek keywords
                        if (buttonTextLower.includes('παραδοση') || buttonTextLower.includes('παραδοσ') || 
                            buttonTextLower.includes('deliver') || buttonTextLower.includes('complete') ||
                            buttonTextUpper.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ')) {
                            targetStatus = '100';
                            console.log(`[MMS] ✅ Status detected from button text (delivery): 100`);
                        } else if (buttonTextLower.includes('ενημερωση') || buttonTextLower.includes('ενημερωσ') ||
                                   buttonTextLower.includes('inform') || buttonTextLower.includes('notify') ||
                                   buttonTextLower.includes('πελατη') || buttonTextLower.includes('πελάτη') ||
                                   buttonTextUpper.includes('ΠΡΟΣ ΕΛΕΓΧΟ') || buttonTextLower.includes('ελεγχο') ||
                                   buttonTextLower.includes('έλεγχο')) {
                            targetStatus = '40';
                            console.log(`[MMS] 📞 Status detected from button text (notification/check): 40`);
                        }
                        
                        // Method 2: Check the status dropdown value
                        if (!targetStatus) {
                            const statusSelect = document.querySelector('select[name="iStatusID"]');
                            if (statusSelect && statusSelect.value) {
                                targetStatus = statusSelect.value;
                                console.log(`[MMS] Status dropdown value: ${targetStatus}`);
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
                                console.log(`[MMS] Status detected from button href/onclick: ${targetStatus}`);
                            }
                        }
                        
                        // A small delay to let the page's own logic run before we track.
                        setTimeout(() => {
                            console.log(`[MMS] Status change button clicked: "${button.innerText}".`);
                            trackDailyStat(config, STORAGE_KEYS, 'statusChanges'); // Grant XP for any status change.
                            
                            // Track specific status transfers if we detected a status
                            if (targetStatus === '40') {
                                const count = GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
                                GM_setValue(STORAGE_KEYS.STATUS_40_TRANSFERS, count + 1);
                                console.log(`[MMS] ✅ Transferred to status 40. Total: ${count + 1}`);
                            } else if (targetStatus === '100') {
                                const count = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
                                GM_setValue(STORAGE_KEYS.STATUS_100_TRANSFERS, count + 1);
                                console.log(`[MMS] ✅ Transferred to status 100. Total: ${count + 1}`);
                            } else if (targetStatus) {
                                console.log(`[MMS] ℹ️ Status detected but not 40 or 100: ${targetStatus}`);
                            } else {
                                console.log(`[MMS] ⚠️ Could not detect target status. Button: "${button.innerText}"`);
                            }

                            // Special rewards for completing a repair
                            if (button.innerHTML.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ')) {
                                trackDailyStat(config, STORAGE_KEYS, 'repairsCompleted');
                                if (config.interactiveMascotEnabled) { // Pass config
                                    setMascotState(config, 'happy', 5000);
                                }
                                if (config.confettiEnabled) triggerConfetti(100);
                            }
                        }, 500);
                    });
                }
            });
        }
    }

    // ===================================================================
    // === 7. FEATURE: TECHNICIAN STATS ON SERVICE LIST
    // ===================================================================
    /**
     * On the service list page, calculates and displays statistics for each technician.
     * Stats include: number of repairs, total labor cost, and total parts cost.
     */
    function initTechnicianStatsFeature() {
        // Prevent creating multiple modals if one is already open
        if (document.querySelector('.tm-modal-overlay')) {
            return;
        }

        // 1. Helper functions
        function parsePrice(priceText) {
            if (!priceText) return 0;
            // Remove currency symbols, spaces, and use dot as decimal separator
            const cleanText = priceText.replace(/€/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
            const price = parseFloat(cleanText);
            return isNaN(price) ? 0 : price;
        }

        // 2. Find the main data table and its headers
        const gridTable = document.querySelector('table.rnr-b-grid');
        if (!gridTable) {
            console.error('[MMS Stats] Could not find the main data grid table.');
            return;
        }

        const headers = Array.from(gridTable.querySelectorAll('thead th'));
        const headerTexts = headers.map(th => th.innerText.trim());

        // 3. Find the column indexes dynamically by header text
        const technicianIndex = headerTexts.findIndex(text => text.includes('Τεχνικός'));
        const laborCostIndex = headerTexts.findIndex(text => text.includes('Επισκευή'));
        const partsCostIndex = headerTexts.findIndex(text => text.includes('Ανταλλακτικά'));

        if (technicianIndex === -1 || laborCostIndex === -1 || partsCostIndex === -1) {
            console.error('[MMS Stats] Could not find all required columns (Technician, Labor Cost, Parts Cost).');
            console.log('[MMS Stats] Found Headers:', headerTexts);
            console.log(`[MMS Stats] Indexes - Tech: ${technicianIndex}, Labor: ${laborCostIndex}, Parts: ${partsCostIndex}`);
            return;
        }

        // 4. Iterate through all rows and aggregate data directly
        const stats = {};
        const rows = gridTable.querySelectorAll('tbody tr[id^="gridRow"]');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const technicianName = cells[technicianIndex]?.innerText.trim();
            if (technicianName) {
                const laborCost = parsePrice(cells[laborCostIndex]?.innerText);
                const partsCost = parsePrice(cells[partsCostIndex]?.innerText);

                if (!stats[technicianName]) {
                    stats[technicianName] = { repairs: 0, totalLabor: 0, totalParts: 0 };
                }
                stats[technicianName].repairs++;
                stats[technicianName].totalLabor += laborCost;
                stats[technicianName].totalParts += partsCost;
            }
        });

        if (Object.keys(stats).length === 0) {
            alert('Δεν βρέθηκαν δεδομένα τεχνικών για ανάλυση σε αυτή τη σελίδα.');
            return;
        }

        // 5. Build the HTML for the stats table
        let totalRepairs = 0, totalLabor = 0, totalParts = 0;
        let rowsHTML = '';
        const sortedTechs = Object.keys(stats).sort();

        for (const tech of sortedTechs) {
            rowsHTML += `
                <tr>
                    <td>${tech}</td>
                    <td>${stats[tech].repairs}</td>
                    <td>${stats[tech].totalLabor.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                    <td>${stats[tech].totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td>
                </tr>`;
            totalRepairs += stats[tech].repairs;
            totalLabor += stats[tech].totalLabor;
            totalParts += stats[tech].totalParts;
        }

        const tableHTML = `
             <table class="table table-bordered table-striped" style="width: 100%; text-align: center; margin-top: 10px;">
                 <thead style="background-color: #e9ecef;">
                     <tr><th>Τεχνικός</th><th>Πλήθος Επισκευών</th><th>Σύνολο Εργασίας</th><th>Σύνολο Ανταλ/κών</th></tr>
                 </thead>
                 <tbody>${rowsHTML}</tbody>
                 <tfoot style="font-weight: bold; background-color: #e9ecef;">
                     <tr><td>ΣΥΝΟΛΟ</td><td>${totalRepairs}</td><td>${totalLabor.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td><td>${totalParts.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</td></tr>
                 </tfoot>
             </table>`;

        // 6. Create the modal UI
        trackDailyStat(config, STORAGE_KEYS, 'viewTechStats'); // Grant XP only when the modal is about to be successfully created.
        console.log('[MMS] On service_list page, initializing Technician Stats feature.');

        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.innerHTML = `
            <div class="tm-modal-content">
                <div class="tm-modal-header">
                    <h2 class="tm-modal-title">Στατιστικά Τεχνικών (Τρέχουσα Σελίδα)</h2>
                    <button class="tm-modal-close">&times;</button>
                </div>
                <div id="tm-stats-table-container">${tableHTML}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        console.log('[MMS Stats] Technician stats modal displayed.');

        // 7. Set up event listeners for closing the modal
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

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
            
            console.log('[MMS] Customer History Quick View initialized successfully.');
        }, 500); // 500ms delay to ensure table is rendered
    }

    // ===================================================================
    // === 8a. FEATURE: AUTOMATED PARTS SEARCH SIDEBAR
    // ===================================================================
    /**
     * On repair pages, automatically searches for common parts for the detected
     * device model and displays them in a non-intrusive sidebar.
     */
    function initAutomatedPartsSearch() {
        // Only run on service edit pages and if the feature is enabled
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

        // Add styles for the new sidebar
        GM_addStyle(`
            #tm-auto-parts-sidebar {
                position: fixed; top: 80px; left: 10px; width: 280px;
                max-height: calc(100vh - 100px); background: #f9f9f9;
                border: 1px solid #ccc; border-radius: 8px; z-index: 9995;
                box-shadow: 0 3px 10px rgba(0,0,0,0.15); display: flex;
                flex-direction: column; font-size: 13px;
            }
            #tm-auto-parts-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 8px 12px; background: #e9ecef; border-bottom: 1px solid #ccc;
            }
            #tm-auto-parts-title { font-weight: bold; color: #333; }
            #tm-auto-parts-close { background: none; border: none; font-size: 20px; cursor: pointer; }
            #tm-auto-parts-content { padding: 10px; overflow-y: auto; }
            .tm-parts-category { margin-bottom: 15px; }
            .tm-parts-category-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px; }
            .tm-parts-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
            .tm-parts-list-item a {
                display: block; padding: 4px 6px; border-radius: 4px;
                text-decoration: none; color: var(--tm-primary-color);
                background: #fff; border: 1px solid #eee;
            }
            .tm-parts-list-item a:hover { background: #e7f1ff; }
            .tm-parts-loading, .tm-parts-not-found { color: #888; font-style: italic; }
        `);

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
            color: white;
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
            <span style="font-weight: bold; font-size: 10px; color: white;">Σήμερα:</span>
            <span style="color: white;">📝 ${stats.ordersCreated || 0}</span>
            <span style="opacity: 0.5; color: white;">|</span>
            <span style="color: white;">🛠️ ${stats.repairsCompleted || 0}</span>
            <span style="opacity: 0.5; color: white;">|</span>
            <span style="color: white;">🔍 ${stats.searches || 0}</span>
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
        console.log('[MMS] Daily Dashboard widget initialized in footer.');
    }

    /**
     * Creates a small widget in the footer to display the user's XP bar.
     * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
     */
    function initXpBarWidget(parentContainer) {
        if (!config.levelUpSystemEnabled) return;

        const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
        const currentTitle = GM_getValue(STORAGE_KEYS.USER_TITLE, RANKS[0].title);
        const currentXp = GM_getValue(STORAGE_KEYS.USER_XP, 0);

        const xpBarContainer = document.createElement('div');
        xpBarContainer.id = 'tm-xp-bar-container';
        const xpForNextLevel = getXpForLevel(currentLevel);
        const rankInfo = RANKS.slice().reverse().find(r => currentLevel >= r.level) || RANKS[0];
        const titleColor = rankInfo.color;
        const glowStyle = rankInfo.glow ? `text-shadow: 0 0 5px ${titleColor};` : '';
        
        xpBarContainer.title = `Click to view all titles & ranks`;
        xpBarContainer.style.position = 'relative'; // For absolute positioned badges
        
        xpBarContainer.innerHTML = `
            <span id="tm-energized-buff-indicator" style="display: none;"></span>
            <span id="tm-level-text">Lv. ${currentLevel}</span>
            <span id="tm-user-title-text" style="color: white;">${currentTitle}</span>
            <div class="tm-xp-bar" title="${currentXp} / ${xpForNextLevel} XP">
                <div id="tm-xp-bar-fill" style="width: ${(currentXp / xpForNextLevel) * 100}%;"></div>
                <div id="tm-xp-text">${currentXp}/${xpForNextLevel}</div>
            </div>
        `;

        parentContainer.appendChild(xpBarContainer);

        // Make the entire bar clickable to show the titles modal
        xpBarContainer.style.cursor = 'pointer';
        xpBarContainer.addEventListener('click', showTitlesModal);
        
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

        console.log('[MMS] XP Bar widget initialized in footer.');
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
        
        // Also save the title to storage so it persists
        GM_setValue(STORAGE_KEYS.USER_TITLE, rankInfo.title);

        if (titleText) {
            titleText.textContent = rankInfo.title;
            titleText.style.color = 'white';
            titleText.style.textShadow = rankInfo.glow ? `0 0 8px ${rankInfo.color}` : 'none';
        }
        if (levelText) {
        levelText.textContent = `Lv. ${level}`;
        }
        
        console.log(`[MMS XP Bar] Updated UI - Level: ${level}, Title: ${rankInfo.title}, XP: ${xp}/${xpForNext}`);
    }


    // ===================================================================
    // === 10a. MASCOT SUB-FEATURES (EUREKA, WEATHER)
    // ===================================================================

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
                        maxCount: maxCount
                    });
                    
                    // Generate MEAN Greek slang comments focused on the WORST status
                    const messages = [];
                    
                    // Generate MEAN Greek slang comments about the worst status
                    if (maxStatus && maxCount > 0) {
                        const count = maxCount;
                        const statusId = maxStatus;
                        
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
                        
                        // Status 65 - Ready/Delivery
                        if (statusId === '65') {
                            if (count > 8) {
                                messages.push(
                                    `Ρε ${count} στο 65! ΠΑΡΑΔΟΣΕ ΤΕΣ!`,
                                    `${count} στο 65! Οι πελάτες περιμένουν!`,
                                    `${count} έτοιμες ρε συ! ΠΑΡΑΔΟΣΗ!`,
                                    `Γαμώ τη μάνα μου ${count} στο 65!`,
                                    `${count} έτοιμες ρε! ΣΗΚΩΣΕ ΤΗΛΕΦΩΝΟ!`,
                                    `Μαλάκα μου ${count} στο 65! ΤΗΛΕΦΩΝΑ!`,
                                    `${count} στο 65 ρε... ΠΑΡΑΔΟΣΕΙΣ!`,
                                    `Ρε φίλε ${count} στο 65! ΚΙΝΗΣΟΥ!`,
                                    `Αχ γαμώτο ${count} στο 65!`,
                                    `${count} στο 65! Πελάτες καλούν ρε!`
                                );
                            } else {
                                messages.push(`${count} στο 65 - Εντάξει.`, `${count} έτοιμες - Κομπλέ ρε.`);
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
                    } else if (totalRepairs === 0) {
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
        const printButtons = document.querySelectorAll('.rnr-b-print, button[onclick*="print"]');
        printButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const messages = [
                    'Εκτύπωση! 🖨️', 'Print time!', 'Τυπώνουμε!',
                    'Printer go brrrr!', 'Χαρτί!', 'Printing!'
                ];
                window.showMascotBubble?.(messages[Math.floor(Math.random() * messages.length)], 2500);
            });
        });
        
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
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType !== Node.ELEMENT_NODE) return;

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
        document.addEventListener('keydown', (e) => {
            // Use Ctrl + Shift + F to open Advanced Search
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                document.getElementById('tm-search-btn')?.click();
            }

            // Use Ctrl + Shift + S to toggle Scratchpad
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                document.getElementById('tm-scratchpad-toggle-btn')?.click();
            }
        });
        console.log('[MMS] Keyboard shortcuts initialized (Ctrl+Shift+F for Search, Ctrl+Shift+S for Scratchpad).');
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

        // Add styles for the new sidebar
        GM_addStyle(`
            #tm-auto-parts-sidebar {
                position: fixed; top: 80px; left: 10px; width: 280px;
                max-height: calc(100vh - 100px); background: #f9f9f9;
                border: 1px solid #ccc; border-radius: 8px; z-index: 9995;
                box-shadow: 0 3px 10px rgba(0,0,0,0.15); display: flex;
                flex-direction: column; font-size: 13px;
            }
            #tm-auto-parts-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 8px 12px; background: #e9ecef; border-bottom: 1px solid #ccc;
            }
            #tm-auto-parts-title { font-weight: bold; color: #333; }
            #tm-auto-parts-close { background: none; border: none; font-size: 20px; cursor: pointer; }
            #tm-auto-parts-content { padding: 10px; overflow-y: auto; }
            .tm-parts-category { margin-bottom: 15px; }
            .tm-parts-category-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px; }
            .tm-parts-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
            .tm-parts-list-item a {
                display: block; padding: 4px 6px; border-radius: 4px;
                text-decoration: none; color: var(--tm-primary-color);
                background: #fff; border: 1px solid #eee;
            }
            .tm-parts-list-item a:hover { background: #e7f1ff; }
            .tm-parts-loading, .tm-parts-not-found { color: #888; font-style: italic; }
        `);

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
    function initWeatherWidget(parentContainer, config) {
        const weatherWidget = document.createElement('div');
        weatherWidget.id = 'tm-weather-widget';
        weatherWidget.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            height: 40px;
            padding: 0 14px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            position: relative;
        `;
        weatherWidget.innerHTML = `
            <span style="font-size: 18px;">🌤️</span>
            <span id="tm-weather-temp" style="color: white;">Loading...</span>
        `;
        
        weatherWidget.addEventListener('mouseenter', () => {
            weatherWidget.style.transform = 'translateY(-3px) scale(1.05)';
            weatherWidget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
            weatherWidget.style.borderColor = 'rgba(255,255,255,0.4)';
        });
        
        weatherWidget.addEventListener('mouseleave', () => {
            weatherWidget.style.transform = 'translateY(0) scale(1)';
            weatherWidget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            weatherWidget.style.borderColor = 'rgba(255,255,255,0.2)';
        });
        
        weatherWidget.addEventListener('click', () => {
            showWeatherDetails(config);
        });
        
        parentContainer.appendChild(weatherWidget);
        
        // Fetch weather data
        fetchWeatherData(config);
        
        // Update every 30 minutes
        setInterval(() => fetchWeatherData(config), 30 * 60 * 1000);
    }
    
    function fetchWeatherData(config) {
        // Athens coordinates (hardcoded)
        const lat = 37.9838;
        const lon = 23.7278;
        
        console.log(`[MMS Weather] Fetching weather for Athens (${lat}, ${lon})...`);
        
        // Fetch current weather directly
        fetchCurrentWeather(lat, lon);
    }
    
    function fetchCurrentWeather(lat, lon) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
            onload: function(weatherResponse) {
                console.log('[MMS Weather] Current weather response received');
                try {
                    const weatherData = JSON.parse(weatherResponse.responseText);
                    console.log('[MMS Weather] Current weather data:', weatherData);
                    updateWeatherWidget(weatherData);
                } catch (e) {
                    console.error('[MMS Weather] Failed to parse weather data:', e);
                }
            },
            onerror: function(err) {
                console.error('[MMS Weather] Failed to fetch current weather:', err);
            }
        });
    }
    
    function updateWeatherWidget(weatherData) {
        const tempElement = document.getElementById('tm-weather-temp');
        if (!tempElement) return;
        
        const temp = Math.round(weatherData.current.temperature_2m);
        const weatherCode = weatherData.current.weather_code;
        
        // Weather code to emoji mapping
        const weatherIcons = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️',
            51: '🌧️', 53: '🌧️', 55: '🌧️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            71: '❄️', 73: '❄️', 75: '❄️',
            80: '🌦️', 81: '🌦️', 82: '🌧️',
            95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        
        const icon = weatherIcons[weatherCode] || '🌤️';
        
        const widget = document.getElementById('tm-weather-widget');
        if (widget) {
            widget.querySelector('span:first-child').textContent = icon;
            tempElement.textContent = `${temp}°C Athens`;
            
            // Update hover gradient based on temperature (glass UI with color hints)
            widget.dataset.temp = temp; // Store temp for hover effect
            
            // Set the hover gradient color based on temperature
            if (temp > 30) {
                widget.dataset.hoverGradient = 'linear-gradient(135deg, rgba(255, 152, 0, 0.4) 0%, rgba(255, 87, 34, 0.4) 100%)';
            } else if (temp > 20) {
                widget.dataset.hoverGradient = 'linear-gradient(135deg, rgba(255, 213, 79, 0.4) 0%, rgba(255, 179, 0, 0.4) 100%)';
            } else if (temp > 10) {
                widget.dataset.hoverGradient = 'linear-gradient(135deg, rgba(79, 172, 254, 0.4) 0%, rgba(0, 242, 254, 0.4) 100%)';
            } else {
                widget.dataset.hoverGradient = 'linear-gradient(135deg, rgba(100, 181, 246, 0.4) 0%, rgba(25, 118, 210, 0.4) 100%)';
            }
            
            // Update the mouseenter event to use the stored gradient
            widget.addEventListener('mouseenter', function() {
                this.style.background = this.dataset.hoverGradient || 'linear-gradient(135deg, rgba(79, 172, 254, 0.4) 0%, rgba(0, 242, 254, 0.4) 100%)';
                this.style.backdropFilter = 'blur(10px)';
                this.style.webkitBackdropFilter = 'blur(10px)';
                this.style.transform = 'translateY(-3px) scale(1.05)';
                this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                this.style.borderColor = 'rgba(255,255,255,0.4)';
            });
            
            widget.addEventListener('mouseleave', function() {
                this.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)';
                this.style.backdropFilter = 'blur(10px)';
                this.style.webkitBackdropFilter = 'blur(10px)';
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                this.style.borderColor = 'rgba(255,255,255,0.2)';
            });
        }
    }
    
    function showWeatherDetails(config) {
        const overlay = document.createElement('div');
        overlay.className = 'tm-modal-overlay';
        overlay.innerHTML = `
            <div class="tm-modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <div class="tm-modal-header">
                    <h3>🌤️ Weather Forecast - Athens</h3>
                    <button class="tm-modal-close">&times;</button>
                </div>
                <div class="tm-modal-body">
                    <div id="tm-weather-details" style="text-align: center; padding: 20px;">
                        <div style="font-size: 18px; margin-bottom: 12px; color: #64748b;">Loading detailed forecast...</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        
        // Use Athens coordinates directly
        const lat = 37.9838;
        const lon = 23.7278;
        
        console.log(`[MMS Weather] Fetching 5-day forecast for Athens (${lat}, ${lon})...`);
        
        // Fetch enhanced 5-day forecast with current conditions
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=auto&forecast_days=5`,
            onload: function(weatherResponse) {
                console.log('[MMS Weather] Forecast response received');
                try {
                    const weatherData = JSON.parse(weatherResponse.responseText);
                    console.log('[MMS Weather] Forecast data:', weatherData);
                    displayWeatherForecast(weatherData);
                } catch (e) {
                    console.error('[MMS Weather] Parse error:', e);
                    const detailsEl = document.getElementById('tm-weather-details');
                    if (detailsEl) detailsEl.innerHTML = '<div style="color: #ef5350;">Failed to parse forecast data</div>';
                }
            },
            onerror: function(err) {
                console.error('[MMS Weather] Forecast request error:', err);
                const detailsEl = document.getElementById('tm-weather-details');
                if (detailsEl) detailsEl.innerHTML = '<div style="color: #ef5350;">Failed to fetch forecast. Check console for details.</div>';
            }
        });
    }
    
    function displayWeatherForecast(weatherData) {
        const detailsContainer = document.getElementById('tm-weather-details');
        if (!detailsContainer) {
            console.error('[MMS Weather] Details container not found!');
            return;
        }
        
        console.log('[MMS Weather] Displaying forecast...');
        
        if (!weatherData || !weatherData.daily) {
            console.error('[MMS Weather] Invalid weather data:', weatherData);
            detailsContainer.innerHTML = '<div style="color: #ef5350;">Invalid weather data received</div>';
            return;
        }
        
        const weatherIcons = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️',
            51: '🌧️', 53: '🌧️', 55: '🌧️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            71: '❄️', 73: '❄️', 75: '❄️',
            80: '🌦️', 81: '🌦️', 82: '🌧️',
            95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        
        const weatherDescriptions = {
            0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Foggy',
            51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
            61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
            71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
            80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
            95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
        };
        
        // Get wind direction
        const getWindDirection = (degrees) => {
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const index = Math.round(((degrees % 360) / 45)) % 8;
            return directions[index];
        };
        
        // Current conditions section
        let currentConditionsHTML = '';
        if (weatherData.current) {
            const current = weatherData.current;
            const temp = Math.round(current.temperature_2m);
            const feelsLike = Math.round(current.apparent_temperature);
            const humidity = current.relative_humidity_2m;
            const windSpeed = Math.round(current.wind_speed_10m);
            const windDir = getWindDirection(current.wind_direction_10m);
            const weatherCode = current.weather_code;
            const icon = weatherIcons[weatherCode] || '🌤️';
            const description = weatherDescriptions[weatherCode] || 'Unknown';
            
            currentConditionsHTML = `
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                        <div>
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">Current Weather</div>
                            <div style="font-size: 48px; font-weight: bold; line-height: 1;">${temp}°C</div>
                            <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">Feels like ${feelsLike}°C</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 64px; line-height: 1;">${icon}</div>
                            <div style="font-size: 13px; opacity: 0.9; margin-top: 8px;">${description}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.3);">
                        <div style="text-align: center;">
                            <div style="font-size: 12px; opacity: 0.8;">💧 Humidity</div>
                            <div style="font-size: 18px; font-weight: 600; margin-top: 4px;">${humidity}%</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 12px; opacity: 0.8;">💨 Wind</div>
                            <div style="font-size: 18px; font-weight: 600; margin-top: 4px;">${windSpeed} km/h ${windDir}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 12px; opacity: 0.8;">🌧️ Rain</div>
                            <div style="font-size: 18px; font-weight: 600; margin-top: 4px;">${current.precipitation || 0} mm</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 5-day forecast
        const days = weatherData.daily.time.map((date, index) => {
            const dateObj = new Date(date);
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
            const shortDay = dayName.substring(0, 3);
            const maxTemp = Math.round(weatherData.daily.temperature_2m_max[index]);
            const minTemp = Math.round(weatherData.daily.temperature_2m_min[index]);
            const weatherCode = weatherData.daily.weather_code[index];
            const icon = weatherIcons[weatherCode] || '🌤️';
            const description = weatherDescriptions[weatherCode] || 'Unknown';
            
            // Additional data
            const precipProb = weatherData.daily.precipitation_probability_max?.[index] || 0;
            const precipSum = weatherData.daily.precipitation_sum?.[index] || 0;
            const uvIndex = weatherData.daily.uv_index_max?.[index] || 0;
            const windMax = Math.round(weatherData.daily.wind_speed_10m_max?.[index] || 0);
            
            // Sunrise/Sunset
            let sunriseTime = '';
            let sunsetTime = '';
            if (weatherData.daily.sunrise && weatherData.daily.sunset) {
                const sunrise = new Date(weatherData.daily.sunrise[index]);
                const sunset = new Date(weatherData.daily.sunset[index]);
                sunriseTime = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                sunsetTime = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            
            return `
                <div style="
                    background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                    padding: 16px;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border-left: 3px solid ${index === 0 ? '#4facfe' : '#e0e0e0'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <div style="font-weight: 600; color: #2c3e50; font-size: 15px;">${index === 0 ? 'Today' : shortDay}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${description}</div>
                        </div>
                        <div style="font-size: 36px;">${icon}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #ff5722;">${maxTemp}°</div>
                            <div style="font-size: 14px; color: #64748b;">${minTemp}°</div>
                        </div>
                        <div style="text-align: right; font-size: 11px; color: #64748b;">
                            ${precipProb > 0 ? `<div>💧 ${precipProb}%</div>` : ''}
                            ${precipSum > 0 ? `<div>🌧️ ${precipSum.toFixed(1)}mm</div>` : ''}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #64748b;">
                        <div title="UV Index">☀️ UV ${uvIndex}</div>
                        <div title="Max Wind">💨 ${windMax} km/h</div>
                        ${sunriseTime ? `<div title="Sunrise">🌅 ${sunriseTime}</div>` : ''}
                        ${sunsetTime ? `<div title="Sunset">🌇 ${sunsetTime}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        detailsContainer.innerHTML = `
            ${currentConditionsHTML}
            <h4 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 16px;">5-Day Forecast</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
                ${days}
            </div>
        `;
        
        console.log('[MMS Weather] Forecast displayed successfully');
    }
    
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
        
        // Talents button (always show if gamification enabled)
        if (config.levelUpSystemEnabled) {
            const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
            const talentBtn = createFeatureButton(
                '🌟', 'Talent Tree', '#ffd700 0%, #ffaa00 100%',
                () => window.showTalentsModal?.(config, STORAGE_KEYS)
            );
            
            // Allow badge to extend outside button bounds
            talentBtn.style.overflow = 'visible';
            
            // Add badge if points available
            if (talentPoints > 0) {
                talentBtn.style.position = 'relative';
                const badge = document.createElement('div');
                badge.style.cssText = `
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
                    color: white;
                    border-radius: 10px;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 5px;
                    font-size: 11px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 3px 8px rgba(255, 82, 82, 0.5);
                    border: 2px solid rgba(255,255,255,0.3);
                    animation: talentBadgePulse 2s ease-in-out infinite;
                    white-space: nowrap;
                `;
                badge.textContent = talentPoints;
                talentBtn.appendChild(badge);
            }
            
            buttonContainer.appendChild(talentBtn);
        }
        
        if (buttonContainer.children.length > 0) {
            parentContainer.appendChild(buttonContainer);
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
        const count100 = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
        console.log(`[MMS] Status Transfer Counters:`);
        console.log(`  📞 Status 40: ${count40}`);
        console.log(`  ✅ Status 100: ${count100}`);
        return { status40: count40, status100: count100 };
    };
    
    window.resetStatusCounters = function() {
        GM_setValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
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
    
    function initMenuItemHiding(config) {
        if (!config.hiddenMenuItemsEnabled) return;
        
        // Wait for the menu to be fully loaded
        setTimeout(() => {
            const menu = document.querySelector('.rnr-b-vmenu.simple.main.initialized');
            if (!menu) {
                console.log('[MMS] Menu not found for hiding feature.');
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
            applyHiddenMenuItems(menu, hiddenItems);
            
            // Add right-click context menu to all menu items
            addMenuItemContextMenu(menu);
            
            // Add "Manage Hidden Items" menu item to the list itself
            addManageMenuItemToList(menu);
            
            console.log('[MMS] Menu item hiding initialized.');
        }, 1000);
    }
    
    function applyHiddenMenuItems(menu, hiddenItems) {
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
    
    function addMenuItemContextMenu(menu) {
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
                    hideMenuItem(itemId, itemText);
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
    
    function hideMenuItem(itemId, itemName) {
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
    
    function unhideMenuItem(itemId) {
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
    
    function showHiddenMenuItemsModal() {
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
                    border-bottom: 1px solid #dee2e6;
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
                
                unhideMenuItem(itemId);
                
                if (window.showPositiveMessage) {
                    window.showPositiveMessage('✓ Menu item restored');
                }
                
                // Refresh modal
                overlay.remove();
                showHiddenMenuItemsModal();
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
                    unhideMenuItem(itemId);
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
    
    function addManageMenuItemToList(menu) {
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
            showHiddenMenuItemsModal();
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

    // ===================================================================
    // === KEYBOARD SHORTCUT (always active)
    // ===================================================================
    // Ctrl+Shift+E to toggle script on/off
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            const currentState = GM_getValue(STORAGE_KEYS.SCRIPT_ENABLED, DEFAULTS.scriptEnabled);
            const newState = !currentState;
            GM_setValue(STORAGE_KEYS.SCRIPT_ENABLED, newState);
            
            // Show notification
            const notification = document.createElement('div');
            notification.innerHTML = `
                <strong>⚡ MyManager Suite ${newState ? 'ENABLED' : 'DISABLED'}</strong><br>
                <small>Page will reload in 2 seconds...</small>
            `;
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${newState ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)'};
                color: white;
                padding: 30px 40px;
                border-radius: 15px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                z-index: 9999999;
                text-align: center;
                line-height: 1.6;
                animation: tmPulse 0.5s ease;
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    });

    // ===================================================================
    // === FEATURE: RECENT REPAIRS DROPDOWN
    // ===================================================================
    
    /**
     * Track when a repair is accessed and save to history
     */
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
        
        // Create repair entry
        const repairEntry = {
            id: repairId,
            customerName: customerName,
            deviceInfo: deviceInfo,
            modelInfo: modelInfo,
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
    
    /**
     * Initialize the Recent Repairs dropdown widget
     */
    function initRecentRepairsDropdown(parentContainer, config, STORAGE_KEYS) {
        if (!config.recentRepairsEnabled) {
            console.log('[MMS] Recent Repairs feature is disabled.');
            return;
        }
        
        console.log('[MMS] Initializing Recent Repairs dropdown...');
        
        // Get recent repairs
        const recentRepairs = JSON.parse(GM_getValue(STORAGE_KEYS.RECENT_REPAIRS, '[]'));
        console.log('[MMS] Found', recentRepairs.length, 'recent repairs in storage.');
        
        // Create dropdown button
        const dropdownContainer = document.createElement('div');
        dropdownContainer.id = 'tm-recent-repairs-dropdown';
        dropdownContainer.style.cssText = `
            position: relative;
            display: inline-block;
            margin: 0 8px;
        `;
        
        const dropdownButton = document.createElement('button');
        dropdownButton.id = 'tm-recent-repairs-btn';
        dropdownButton.innerHTML = `📋 Πρόσφατες (${recentRepairs.length})`;
        dropdownButton.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: white;
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
            dropdownButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
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
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            min-width: 350px;
            max-width: 450px;
            max-height: 450px;
            overflow-y: auto;
            z-index: 10000;
            font-size: 13px;
        `;
        
        // Populate menu
        if (recentRepairs.length === 0) {
            dropdownMenu.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    Δεν υπάρχουν πρόσφατες επισκευές
                </div>
            `;
        } else {
            let menuHTML = `
                <div style="padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; border-radius: 8px 8px 0 0;">
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
                        padding: 10px;
                        border-bottom: 1px solid #eee;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border-radius: 4px;
                        margin-bottom: 4px;
                    " onmouseenter="this.style.background='#f0f4ff'; this.style.transform='translateX(4px)';" onmouseleave="this.style.background='transparent'; this.style.transform='translateX(0)';">
                        <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
                            #${repair.id} - ${repair.customerName}
                        </div>
                        ${deviceLine ? `<div style="font-size: 11px; color: #666; margin-bottom: 2px;">${deviceLine}</div>` : ''}
                        <div style="font-size: 10px; color: #999; margin-top: 4px;">
                            🕒 ${timeAgo}
                        </div>
                    </div>
                `;
            });
            
            menuHTML += `
                </div>
                <div style="padding: 10px; border-top: 1px solid #ddd; text-align: center;">
                    <button id="tm-clear-recent-repairs" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 11px;
                        cursor: pointer;
                        font-weight: 600;
                    ">🗑️ Καθαρισμός Ιστορικού</button>
                </div>
            `;
            
            dropdownMenu.innerHTML = menuHTML;
        }
        
        // Toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Position dropdown relative to button
                const buttonRect = dropdownButton.getBoundingClientRect();
                dropdownMenu.style.left = buttonRect.left + 'px';
            }
        });
        
        // Click on repair item to navigate
        dropdownMenu.addEventListener('click', (e) => {
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
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });
        
        dropdownContainer.appendChild(dropdownButton);
        dropdownContainer.appendChild(dropdownMenu);
        parentContainer.appendChild(dropdownContainer);
        
        console.log('[MMS] Recent Repairs dropdown initialized.');
    }
    
    /**
     * Helper function to format time ago
     */
    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'μόλις τώρα';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} λεπτά πριν`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ώρες πριν`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} μέρες πριν`;
        
        return new Date(timestamp).toLocaleDateString('el-GR');
    }
    
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
            const now = new Date();
            
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
    // === 8. SCRIPT INITIALIZER
    // ===================================================================
    window.addEventListener('load', () => {
        // Initialize the main script
        initializeMainScript();
        
        // Check if we're on the login page
        const isLoginPage = window.location.pathname.includes('login.php');
        
        // If we're on the login page, check if custom login is enabled
        if (isLoginPage) {
            const customLoginEnabled = GM_getValue('customLoginPageEnabled', DEFAULTS.customLoginPageEnabled);
            
            if (customLoginEnabled) {
                console.log('[MMS] Login page detected. Initializing custom login experience.');
                if (typeof initLoginPage === 'function') {
                    initLoginPage(STORAGE_KEYS);
                }
            } else {
                console.log('[MMS] Login page detected. Custom login is disabled, using default.');
            }
            
            // Make the body visible since we're done
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            return;
        }
        
        // Skip the logged-in user check - allow script to run on all pages
        // (The check has been removed per user request)

        // Load settings first, as they determine which features to run.
        loadSettings();
        
        // Debug: Log new feature config status
        console.log('[MMS] Recent Repairs Enabled:', config.recentRepairsEnabled);
        console.log('[MMS] Repair Age Indicator Enabled:', config.repairAgeIndicatorEnabled);

        // Check if script is enabled - if not, show minimal UI and exit
        if (!config.scriptEnabled) {
            console.log('[MMS] Script is disabled. Press Ctrl+Shift+E to re-enable.');
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
            
            // Add minimal notification badge
            const badge = document.createElement('div');
            badge.id = 'tm-disabled-badge';
            badge.innerHTML = '🚫 <strong>MMS Off</strong><br><small style="font-size: 9px; opacity: 0.9;">Ctrl+Shift+E</small>';
            badge.style.cssText = `
                position: fixed;
                bottom: 15px;
                right: 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 8px 14px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 600;
                box-shadow: 0 3px 10px rgba(0,0,0,0.25);
                z-index: 999999;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
                line-height: 1.3;
                opacity: 0.95;
            `;
            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'scale(1.08)';
                badge.style.opacity = '1';
            });
            badge.addEventListener('mouseleave', () => {
                badge.style.transform = 'scale(1)';
                badge.style.opacity = '0.95';
            });
            badge.addEventListener('click', () => {
                GM_setValue(STORAGE_KEYS.SCRIPT_ENABLED, true);
                location.reload();
            });
            document.body.appendChild(badge);
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
            initWeatherWidget(footerControlsMiddle, config);

            // Initialize features and place them in the correct containers
            initDailyDashboardWidget(footerControlsLeft, STORAGE_KEYS); // Stats widget on the left
            initXpBarWidget(footerControlsLeft, STORAGE_KEYS); // XP bar widget on the left
            
            // Add new feature buttons
            addNewFeatureButtons(footerControlsLeft, config, STORAGE_KEYS);
            
            // Initialize Recent Repairs dropdown
            initRecentRepairsDropdown(footerControlsRight, config, STORAGE_KEYS); // Recent repairs on the right
            
            if (config.autoRefreshEnabled) initRefreshFeature(footerControlsRight);     // Refresh timer on the right
            initSettingsPanel(footerControlsRight, config, STORAGE_KEYS); // Settings button always visible
        }

        // Initialize remaining features
        
        // Initialize random events check (checks every 30 minutes for new events)
        if (config.randomEventsEnabled && typeof window.checkRandomEvent === 'function') {
            window.checkRandomEvent(config, STORAGE_KEYS);
            setInterval(() => window.checkRandomEvent(config, STORAGE_KEYS), 30 * 60 * 1000);
            
            // Restore active event notification on page load
            const activeEvent = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_EVENT, 'null'));
            if (activeEvent && Date.now() < activeEvent.expiresAt) {
                window.updateEventNotification(activeEvent);
            }
        }
        
        // Initialize boss battles check (checks every hour for new bosses)
        if (config.bossBattlesEnabled && typeof window.checkBossSpawn === 'function') {
            window.checkBossSpawn(config, STORAGE_KEYS);
            setInterval(() => window.checkBossSpawn(config, STORAGE_KEYS), 60 * 60 * 1000);
            
            // Restore active boss notification on page load
            const activeBoss = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_BOSS, 'null'));
            if (activeBoss && Date.now() < activeBoss.expiresAt) {
                window.showBossBattleNotification(activeBoss);
            }
        }
        
        // Initialize menu item hiding
        initMenuItemHiding(config);
        
        initSearchFeature();
        initScratchpadFeature();
        initScrollToTopFeature();
        initReminderSystem(STORAGE_KEYS);
        initAutomatedPartsSearch();
        initFunFeatures(config); // Handles confetti and other event-based interactions
        initMascotPageReactions(config); // Mascot reactions to page events.
        initScratchpadIntegration();
        fetchWeatherAndReact(config); // Check the weather for the mascot
        initCustomerHistoryFeature(); // Pass config
        updateBuffTimersUI(config, STORAGE_KEYS);
        setInterval(() => updateBuffTimersUI(config, STORAGE_KEYS), 1000); // Update the timer every second
        initOrderTracking(config, STORAGE_KEYS);
        initKeyboardShortcuts();
        
        // Initialize new workflow features
        initRepairAgeIndicator(config); // Add age indicators to service list
        
        // Track repair access with a delay to ensure DOM is loaded
        setTimeout(() => {
            trackRepairAccess(config, STORAGE_KEYS);
        }, 1000);

        console.log('[MMS] MyManager All-in-One Suite Loaded!');

        // Make the body visible now that all styles and themes are applied.
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        });
    }

})();
