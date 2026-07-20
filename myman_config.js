// ==UserScript==
// @name         MyManager Config
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Configuration and constants for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===================================================================
    // === CONFIGURATION & CONSTANTS
    // ===================================================================

    const SCRIPT_META = {
        version: '264',
        loaderVersion: '35',
        silentVersion: '2',
        displayVersion: '35.2',
        updateBase: 'https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main',
        manifestUrl: 'https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_manifest.json',
        loaderUrl: 'https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_loader.user.js'
    };

    const STORAGE_KEYS = {
        SCRIPT_ENABLED: 'tm_script_enabled', // Master toggle
        USER_XP: 'tm_user_xp',
        USER_LEVEL: 'tm_user_level',
        ACHIEVEMENTS: 'tm_achievements_unlocked',
        USER_COINS: 'tm_user_coins',
        STARTER_COINS_GRANTED: 'tm_starter_coins_granted',
        USER_TITLE: 'tm_user_title', // New: For cosmetic titles
        PURCHASED_ITEMS: 'tm_purchased_items',
        EQUIPPED_ITEMS: 'tm_equipped_items', // Changed from singular to plural
        EQUIPPED_THEME: 'tm_equipped_theme',
        THEME_COLORS_CACHE: 'tm_theme_colors_cache',
        PET_STATS: 'tm_pet_stats',
        TAMAGOTCHI_DATA: 'tm_tamagotchi_data',
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
        // Printing
        PRINT_TEMPLATE: 'tm_print_template',

        // Random Events Keys
        ACTIVE_EVENT: 'tm_active_event',
        LAST_EVENT_CHECK: 'tm_last_event_check',
        LAST_EVENT_END_TIME: 'tm_last_event_end_time', // Cooldown tracking
        EVENT_HISTORY: 'tm_event_history',
        EVENT_NOTIFICATION_MINIMIZED: 'tm_event_notification_minimized',

        // Smart Templates Keys
        REPAIR_TEMPLATES: 'tm_repair_templates',

        // Dashboard Keys
        DASHBOARD_STATS_HISTORY: 'tm_dashboard_stats_history',
        REPAIR_TIME_HISTORY: 'tm_repair_time_history',

        // Boss Battles Keys
        ACTIVE_BOSS: 'tm_active_boss',
        LAST_BOSS_END_TIME: 'tm_last_boss_end_time', // Cooldown tracking
        BOSS_HISTORY: 'tm_boss_history',
        BOSS_DEFEATS: 'tm_boss_defeats',
        BOSS_NOTIFICATION_MINIMIZED: 'tm_boss_notification_minimized',
        BOSS_NOTIFICATION_DISMISSED: 'tm_boss_notification_dismissed',

        // Menu Visibility Keys
        HIDDEN_MENU_ITEMS: 'tm_hidden_menu_items',

        // Status Transfer Tracking
        STATUS_40_TRANSFERS: 'tm_status_40_transfers', // Count of repairs moved to status 40
        STATUS_65_TRANSFERS: 'tm_status_65_transfers', // Count of repairs moved to status 65 (waiting for parts)
        STATUS_100_TRANSFERS: 'tm_status_100_transfers', // Count of repairs moved to status 100
        STATUS_TRANSFER_HISTORY: 'tm_status_transfer_history', // History of repairs moved to different statuses

        // Recent Repairs History
        RECENT_REPAIRS: 'tm_recent_repairs', // Track recently accessed repairs

        // Daily bounties / quests (legacy alias DAILY_BOUNTIES points here)
        DAILY_BOUNTIES: 'tm_daily_quests',

        // Order history (service + parts order pages)
        ORDER_HISTORY_SERVICE: 'tm_srvorders_page_history',
        ORDER_HISTORY_PARTS: 'tm_partsorders_page_history',
        ORDER_HISTORY_STATUS_CHECK: 'orderHistoryStatusCheckEnabled',
        ORDER_HISTORY_BACKGROUND: 'orderHistoryBackgroundEnabled',

        // Coin History
        COIN_HISTORY: 'tm_coin_history', // Track coin earning history

        // Level Reward System Keys
        PERMANENT_XP_BOOST: 'tm_permanent_xp_boost', // Cumulative XP boost from levels
        COIN_MULTIPLIER: 'tm_coin_multiplier', // Cumulative coin multiplier from levels
        SHOP_DISCOUNT: 'tm_shop_discount', // Cumulative shop discount from levels
        MASCOT_FOOD_ITEMS: 'tm_mascot_food_items', // Mascot food inventory
        MASCOT_TREAT_ITEMS: 'tm_mascot_treat_items', // Mascot treat inventory
        ENERGIZED_BUFF_COUNT: 'tm_energized_buff_count', // Number of energized buffs in inventory
        DOUBLE_COINS_BUFF_COUNT: 'tm_double_coins_buff_count', // Number of double coins buffs in inventory
        ASCENDED_STATUS: 'tm_ascended_status', // Level 200 status unlock
        DIGITAL_ARCHON_STATUS: 'tm_digital_archon_status', // Level 250 status unlock

        // Admin account for Status 40 (footer logo login on service_edit)
        STATUS40_ADMIN_USERNAME: 'tm_status40_admin_username',
        STATUS40_ADMIN_PASSWORD: 'tm_status40_admin_password',

        // Add other keys here as needed
        EOD_CHECKLIST_DISMISSED: 'tm_eod_checklist_dismissed',

        // Scheduled reminders for repairs (service_edit)
        REPAIR_REMINDERS: 'tm_repair_reminders_v1',
        REPAIR_REMINDER_BANNERS: 'tm_repair_reminder_active_banners_v1',
        REMINDER_HISTORY: 'tm_reminder_history_v1',

        // Script update preferences (per profile) — loaderVersion only (not bundle)
        SKIPPED_UPDATE_VERSION: 'tm_skipped_loader_version',
        SCRIPT_UPDATE_NOTIFIED_VERSION: 'tm_script_update_notified_loader_version',

        // Add other keys here as needed
    };

    const SHOP_ITEMS = {
        BOUNTY_COMPLETE_TOKEN: 'bounty_complete_token',
        // Add other item IDs here for easy reference
    };

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

    // Make constants globally accessible for other scripts
    window.SCRIPT_META = SCRIPT_META;
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.SHOP_ITEMS = SHOP_ITEMS;
    window.XP_CONFIG = XP_CONFIG;
    window.QUEST_POOL = QUEST_POOL;
    window.RANKS = RANKS;
    window.TALENT_TREE = TALENT_TREE;

})();