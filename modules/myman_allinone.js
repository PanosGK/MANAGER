'type modules\utils.js  

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

        /* Talent Tree Styles */
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

        /* Data Management Styles */
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
    `);
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
// This script is intended to be used as a library via the @require directive
// in the main "MyManager All-in-One Suite" script. It does not do anything on its own.

// ===================================================================
// === FUN FEATURE: LEVEL UP SYSTEM
// ===================================================================

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
    // === TIER 1: Novice Talents (Level 1+) ===
    {
        id: 'repair_xp_boost_1', name: 'Repair Specialist I', cost: 1, levelRequired: 1,
        description: 'Gain +10% bonus XP from completing repairs.',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.10 }
    },
    {
        id: 'search_xp_boost_1', name: 'Data Miner I', cost: 1, levelRequired: 1,
        description: 'Gain +15% bonus XP from using Advanced Search.',
        bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.15 }
    },
    {
        id: 'coin_finder_1', name: 'Coin Scavenger', cost: 1, levelRequired: 1,
        description: 'Gain +10% more Fixer-Coins from all sources.',
        bonus: { type: 'coin_modifier', multiplier: 0.10 }
    },
    
    // === TIER 2: Apprentice Talents (Level 5+) ===
    {
        id: 'order_xp_boost_1', name: 'Logistics Expert I', cost: 1, levelRequired: 5,
        description: 'Gain +10% bonus XP from creating new orders.',
        bonus: { type: 'xp_modifier', stat: 'ordersCreated', multiplier: 0.10 }
    },
    {
        id: 'status_xp_boost_1', name: 'Workflow Master I', cost: 1, levelRequired: 5,
        description: 'Gain +10% bonus XP from status changes.',
        bonus: { type: 'xp_modifier', stat: 'statusChanges', multiplier: 0.10 }
    },
    {
        id: 'mascot_lover', name: 'Pet Whisperer', cost: 2, levelRequired: 5,
        description: 'Mascot happiness and hunger decay 25% slower.',
        bonus: { type: 'mascot_decay', multiplier: 0.75 }
    },
    
    // === TIER 3: Skilled Talents (Level 10+) ===
    {
        id: 'repair_xp_boost_2', name: 'Repair Specialist II', cost: 2, levelRequired: 10,
        description: 'Gain an additional +15% bonus XP from repairs (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.15 }
    },
    {
        id: 'search_xp_boost_2', name: 'Data Miner II', cost: 2, levelRequired: 10,
        description: 'Gain an additional +20% bonus XP from searches (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.20 }
    },
    {
        id: 'coin_finder_2', name: 'Treasure Hunter', cost: 2, levelRequired: 10,
        description: 'Gain an additional +15% more coins (stacks!).',
        bonus: { type: 'coin_modifier', multiplier: 0.15 }
    },
    {
        id: 'game_master_1', name: 'Game Enthusiast', cost: 2, levelRequired: 10,
        description: 'Gain +25% bonus XP from playing mini-games.',
        bonus: { type: 'xp_modifier', stat: 'anyGamePlayed', multiplier: 0.25 }
    },
    
    // === TIER 4: Expert Talents (Level 15+) ===
    {
        id: 'efficiency_expert', name: 'Efficiency Expert', cost: 3, levelRequired: 15,
        description: 'All XP gains increased by +5%.',
        bonus: { type: 'global_xp_modifier', multiplier: 0.05 }
    },
    {
        id: 'wealthy_technician', name: 'Wealthy Technician', cost: 3, levelRequired: 15,
        description: 'Start each day with 50 bonus coins.',
        bonus: { type: 'daily_bonus', coins: 50 }
    },
    {
        id: 'quick_learner', name: 'Quick Learner', cost: 3, levelRequired: 15,
        description: 'Reduce XP needed for next level by 5%.',
        bonus: { type: 'xp_reduction', multiplier: 0.05 }
    },
    
    // === TIER 5: Advanced Talents (Level 20+) ===
    {
        id: 'order_xp_boost_2', name: 'Logistics Expert II', cost: 3, levelRequired: 20,
        description: 'Additional +15% bonus XP from orders (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'ordersCreated', multiplier: 0.15 }
    },
    {
        id: 'status_xp_boost_2', name: 'Workflow Master II', cost: 3, levelRequired: 20,
        description: 'Additional +15% bonus XP from status changes (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'statusChanges', multiplier: 0.15 }
    },
    {
        id: 'lucky_finder', name: 'Lucky Finder', cost: 4, levelRequired: 20,
        description: '10% chance to find 50-150 bonus coins on any action.',
        bonus: { type: 'lucky_coins', chance: 0.10 }
    },
    {
        id: 'bounty_master', name: 'Bounty Hunter', cost: 3, levelRequired: 20,
        description: 'Daily bounties give +25% more rewards.',
        bonus: { type: 'bounty_modifier', multiplier: 0.25 }
    },
    
    // === TIER 6: Master Talents (Level 30+) ===
    {
        id: 'repair_xp_boost_3', name: 'Repair Specialist III', cost: 4, levelRequired: 30,
        description: 'Additional +20% bonus XP from repairs (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.20 }
    },
    {
        id: 'coin_finder_3', name: 'Gold Digger', cost: 4, levelRequired: 30,
        description: 'Additional +20% more coins (stacks!).',
        bonus: { type: 'coin_modifier', multiplier: 0.20 }
    },
    {
        id: 'efficiency_master', name: 'Efficiency Master', cost: 5, levelRequired: 30,
        description: 'All XP gains increased by additional +10% (stacks!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.10 }
    },
    {
        id: 'shop_discount_1', name: 'Savvy Shopper', cost: 4, levelRequired: 30,
        description: 'All shop items cost 15% less.',
        bonus: { type: 'shop_discount', multiplier: 0.15 }
    },
    
    // === TIER 7: Legendary Talents (Level 40+) ===
    {
        id: 'search_xp_boost_3', name: 'Data Miner III', cost: 5, levelRequired: 40,
        description: 'Additional +25% bonus XP from searches (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.25 }
    },
    {
        id: 'double_talent_chance', name: 'Fortune Favored', cost: 5, levelRequired: 40,
        description: 'Small chance to earn 2 talent points on level up.',
        bonus: { type: 'talent_point_bonus', chance: 0.15 }
    },
    {
        id: 'achievement_hunter', name: 'Achievement Hunter', cost: 4, levelRequired: 40,
        description: 'Achievements grant +50% more XP.',
        bonus: { type: 'achievement_modifier', multiplier: 0.50 }
    },
    {
        id: 'event_magnet', name: 'Event Magnet', cost: 5, levelRequired: 40,
        description: 'Random events spawn 30% more often.',
        bonus: { type: 'event_spawn', multiplier: 1.30 }
    },
    
    // === TIER 8: Elite Talents (Level 50+) ===
    {
        id: 'repair_xp_boost_4', name: 'Repair Specialist IV', cost: 6, levelRequired: 50,
        description: 'Additional +25% bonus XP from repairs (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.25 }
    },
    {
        id: 'coin_finder_4', name: 'Midas Touch', cost: 6, levelRequired: 50,
        description: 'Additional +25% more coins (stacks!).',
        bonus: { type: 'coin_modifier', multiplier: 0.25 }
    },
    {
        id: 'buff_duration', name: 'Buff Extender', cost: 5, levelRequired: 50,
        description: 'All consumable buffs last 50% longer.',
        bonus: { type: 'buff_duration', multiplier: 1.50 }
    },
    {
        id: 'shop_discount_2', name: 'Master Negotiator', cost: 5, levelRequired: 50,
        description: 'Additional 15% shop discount (stacks to 30% total!).',
        bonus: { type: 'shop_discount', multiplier: 0.15 }
    },
    
    // === TIER 9: Grandmaster Talents (Level 75+) ===
    {
        id: 'global_xp_master', name: 'XP Grandmaster', cost: 7, levelRequired: 75,
        description: 'All XP gains increased by additional +15% (stacks!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.15 }
    },
    {
        id: 'quick_learner_2', name: 'Genius Mind', cost: 7, levelRequired: 75,
        description: 'Reduce XP needed for levels by additional 10% (stacks!).',
        bonus: { type: 'xp_reduction', multiplier: 0.10 }
    },
    {
        id: 'boss_slayer', name: 'Boss Slayer', cost: 6, levelRequired: 75,
        description: 'Boss battles grant +50% more rewards.',
        bonus: { type: 'boss_modifier', multiplier: 0.50 }
    },
    {
        id: 'faction_champion', name: 'Faction Champion', cost: 6, levelRequired: 75,
        description: 'Faction contribution points earned 2x faster.',
        bonus: { type: 'faction_contribution', multiplier: 2.0 }
    },
    
    // === TIER 10: Legendary Talents (Level 100+) ===
    {
        id: 'repair_xp_boost_5', name: 'Repair Specialist V', cost: 8, levelRequired: 100,
        description: 'Additional +30% bonus XP from repairs (LEGENDARY!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.30 }
    },
    {
        id: 'coin_finder_5', name: 'Coin Emperor', cost: 8, levelRequired: 100,
        description: 'Additional +30% more coins (LEGENDARY!).',
        bonus: { type: 'coin_modifier', multiplier: 0.30 }
    },
    {
        id: 'daily_powerup', name: 'Daily Powerup', cost: 8, levelRequired: 100,
        description: 'Start each day with a random free buff active.',
        bonus: { type: 'daily_buff', enabled: true }
    },
    
    // === TIER 11: Ultimate Talents (Level 150+) ===
    {
        id: 'ultimate_efficiency', name: 'Ultimate Efficiency', cost: 10, levelRequired: 150,
        description: 'All XP gains increased by additional +20% (ULTIMATE!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.20 }
    },
    {
        id: 'coin_rain', name: 'Coin Rain', cost: 10, levelRequired: 150,
        description: 'Additional +35% more coins (ULTIMATE!).',
        bonus: { type: 'coin_modifier', multiplier: 0.35 }
    },
    {
        id: 'talent_regeneration', name: 'Talent Regeneration', cost: 12, levelRequired: 150,
        description: '25% chance to refund talent point on unlock.',
        bonus: { type: 'talent_refund', chance: 0.25 }
    },
    {
        id: 'event_controller', name: 'Event Controller', cost: 10, levelRequired: 150,
        description: 'Events last 50% longer.',
        bonus: { type: 'event_duration', multiplier: 1.50 }
    },
    
    // === TIER 12: Godlike Talents (Level 200+) ===
    {
        id: 'ascended_repairer', name: 'Ascended Repairer', cost: 15, levelRequired: 200,
        description: 'Repairs grant +50% XP and +50% coins (GODLIKE!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.50 }
    },
    {
        id: 'infinite_wealth', name: 'Infinite Wealth', cost: 15, levelRequired: 200,
        description: 'All coin gains increased by +50% (GODLIKE!).',
        bonus: { type: 'coin_modifier', multiplier: 0.50 }
    },
    {
        id: 'boss_magnet', name: 'Boss Magnet', cost: 12, levelRequired: 200,
        description: 'Boss battles spawn 3x more often.',
        bonus: { type: 'boss_spawn', multiplier: 3.0 }
    },
    {
        id: 'perfect_bounties', name: 'Perfect Bounties', cost: 12, levelRequired: 200,
        description: 'Bounty rewards doubled.',
        bonus: { type: 'bounty_modifier', multiplier: 1.0 }
    },
    
    // === TIER 13: Divine Talents (Level 250+) ===
    {
        id: 'digital_archon_power', name: 'Digital Archon Power', cost: 20, levelRequired: 250,
        description: 'ALL XP sources increased by +30% (DIVINE!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.30 }
    },
    {
        id: 'coin_deity', name: 'Coin Deity', cost: 20, levelRequired: 250,
        description: 'ALL coin sources increased by +75% (DIVINE!).',
        bonus: { type: 'coin_modifier', multiplier: 0.75 }
    },
    {
        id: 'talent_fountain', name: 'Talent Fountain', cost: 25, levelRequired: 250,
        description: 'Earn 2 talent points per level instead of 1.',
        bonus: { type: 'talent_points', multiplier: 2.0 }
    },
    {
        id: 'ultimate_mastery', name: 'Ultimate Mastery', cost: 30, levelRequired: 250,
        description: 'All bonuses increased by +10%. The pinnacle of power.',
        bonus: { type: 'universal_amplifier', multiplier: 0.10 }
    },
];

// ===================================================================
// === NOTIFICATION QUEUE SYSTEM (Prevents Overlapping Popups)
// ===================================================================
let notificationQueue = [];
let isDialogOpen = false;
let isShowingNotification = false;

// Override native confirm/alert to track dialog state
const originalConfirm = window.confirm;
const originalAlert = window.alert;

window.confirm = function(...args) {
    isDialogOpen = true;
    const result = originalConfirm.apply(this, args);
    isDialogOpen = false;
    // Process queue after dialog closes
    setTimeout(() => processNotificationQueue(), 100);
    return result;
};

window.alert = function(...args) {
    isDialogOpen = true;
    originalAlert.apply(this, args);
    isDialogOpen = false;
    // Process queue after dialog closes
    setTimeout(() => processNotificationQueue(), 100);
};

function queueNotification(type, data) {
    notificationQueue.push({ type, data });
    if (!isDialogOpen && !isShowingNotification) {
        processNotificationQueue();
    }
}

function processNotificationQueue() {
    if (isDialogOpen || isShowingNotification || notificationQueue.length === 0) return;
    
    isShowingNotification = true;
    const notification = notificationQueue.shift();
    
    switch (notification.type) {
        case 'levelup':
            triggerLevelUpAnimationImmediate(notification.data.newLevel, notification.data.oldLevel, notification.data.STORAGE_KEYS, notification.data.rewards, notification.data.isLegendary);
            // Wait for level-up animation to finish
            setTimeout(() => {
                isShowingNotification = false;
                processNotificationQueue();
            }, 3500); // Level-up animation duration
            break;
            
        case 'achievement':
            showAchievementNotificationImmediate(notification.data.title, notification.data.xp);
            // Wait for achievement notification
            setTimeout(() => {
                isShowingNotification = false;
                processNotificationQueue();
            }, 4000);
            break;
            
        case 'bounty':
            showPositiveMessage(notification.data.message);
            // Wait for message
            setTimeout(() => {
                isShowingNotification = false;
                processNotificationQueue();
            }, 2500);
            break;
            
        default:
            isShowingNotification = false;
            processNotificationQueue();
    }
}

// ===================================================================

function getXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Wrapper function that queues level-up animations
function triggerLevelUpAnimation(newLevel, oldLevel, STORAGE_KEYS, rewards = [], isLegendary = false) {
    if (typeof queueNotification === 'function') {
        queueNotification('levelup', { newLevel, oldLevel, STORAGE_KEYS, rewards, isLegendary });
    } else {
        // Fallback to immediate if queue not available
        triggerLevelUpAnimationImmediate(newLevel, oldLevel, STORAGE_KEYS, rewards, isLegendary);
    }
}

function triggerLevelUpAnimationImmediate(newLevel, oldLevel, STORAGE_KEYS, rewards = [], isLegendary = false) {
    const overlay = document.createElement('div');
    overlay.id = 'tm-level-up-overlay';

    let evolutionMessage = '';
    const evolutionMilestones = [10, 25, 50, 100, 250];
    if (evolutionMilestones.some(milestone => oldLevel < milestone && newLevel >= milestone)) {
        const evoNames = {
            10: 'Evo-1: Advanced Troubleshooter',
            25: 'Evo-2: Data Recovery Agent',
            50: 'Evo-3: Silicon Prophet',
            100: 'Evo-4: Master of the Mainboard',
            250: 'Evo-5: DIGITAL ARCHON'
        };
        const evoReached = evolutionMilestones.find(m => newLevel >= m && oldLevel < m);
        const evoName = evoNames[evoReached] || 'New Evolution';
        evolutionMessage = `<div class="tm-level-up-evolution">🌟 Your Mascot has Evolved! 🌟<br><span style="font-size: 0.8em; color: var(--tm-info-color);">${evoName}</span></div>`;
        // Update the mascot's appearance in real-time
        if (typeof window.updateMascotAppearanceByLevel === 'function') {
            window.updateMascotAppearanceByLevel(newLevel);
        }
    }

    if (isLegendary) {
        overlay.classList.add('legendary');
    }

    const rewardsHTML = rewards.map(reward => `<div class="tm-level-up-reward">${reward}</div>`).join('');

    overlay.innerHTML = `
        <div class="tm-level-up-content">
            <div class="tm-level-up-title">LEVEL UP!</div>
            ${evolutionMessage}
            <div class="tm-level-up-new-level">Level ${newLevel}</div>
            <div class="tm-level-up-rewards-container">${rewardsHTML}</div>
            <div class="tm-level-up-stat-increase">Your stats have improved!</div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Minimal fireworks (fewer bursts, shorter duration)
    triggerFireworks(isLegendary ? 5 : 3, 2000);

    // Fade out after duration
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 1000);
    }, 5000); // Show for 5 seconds
}

/**
 * Creates a spectacular fireworks display
 * @param {number} burstCount Number of firework bursts
 * @param {number} duration Duration of the fireworks display in milliseconds
 */
function triggerFireworks(burstCount = 8, duration = 4000) {
    const colors = ['#ff0000', '#ff6600', '#ffff00', '#00ff00', '#00ffff', '#0066ff', '#9900ff', '#ff00ff', '#ffd700', '#ff1493'];
    
    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
            // Random position for each firework burst (avoid edges)
            const x = 15 + Math.random() * 70; // 15-85% of viewport width
            const y = 20 + Math.random() * 40; // 20-60% of viewport height
            
            // Create a burst of particles
            const particlesPerBurst = 30 + Math.floor(Math.random() * 20);
            for (let j = 0; j < particlesPerBurst; j++) {
                const particle = document.createElement('div');
                particle.className = 'tm-firework-particle';
                
                // Random angle and velocity
                const angle = (Math.PI * 2 * j) / particlesPerBurst + (Math.random() - 0.5) * 0.5;
                const velocity = 100 + Math.random() * 150; // pixels
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                
                // Random color for each particle
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.backgroundColor = color;
                particle.style.boxShadow = `0 0 10px ${color}`;
                
                // Set initial position
                particle.style.left = `${x}vw`;
                particle.style.top = `${y}vh`;
                
                // Animation properties
                const duration = 1 + Math.random() * 0.5; // 1-1.5 seconds
                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);
                particle.style.animationDuration = `${duration}s`;
                
                document.body.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => particle.remove(), duration * 1000 + 100);
            }
            
            // Add a flash effect at the burst origin
            const flash = document.createElement('div');
            flash.className = 'tm-firework-flash';
            flash.style.left = `${x}vw`;
            flash.style.top = `${y}vh`;
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 300);
            
        }, (duration / burstCount) * i); // Stagger the bursts
    }
}

function grantXp(config, STORAGE_KEYS, points, sourceStat = null) {
    let indicator = null; // Declare indicator at the function scope
    let currentXp = config.levelUpSystemEnabled ? GM_getValue(STORAGE_KEYS.USER_XP, 0) : 0;
    let currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);

    // --- Apply Talent Bonuses ---
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    let talentMultiplier = 1.0; // Start with a base multiplier of 1
    // Find if any talent modifies the XP for the current action
    const relevantTalent = TALENT_TREE.find(t => unlockedTalents.includes(t.id) && t.bonus.type === 'xp_modifier' && t.bonus.stat === sourceStat);
    if (sourceStat && relevantTalent) {
        talentMultiplier += relevantTalent.bonus.multiplier; // Add the bonus from the talent
    }

    // Apply XP Boost based on level
    const xpBoost = Math.floor(currentLevel / 5) * 0.01; // +1% boost every 5 levels
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress(STORAGE_KEYS, 'xpEarned', points);
    }


    // Apply "Energized" buff if active
    const energizedExpires = GM_getValue(STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES, 0);
    if (Date.now() < energizedExpires) {
        talentMultiplier += 0.10; // Add 10% boost
    }


    // Coins are only granted on level-up, not from XP gains
    const finalPoints = Math.ceil(points * (1 + xpBoost) * talentMultiplier);
    currentXp += finalPoints;

    let xpForNextLevel = getXpForLevel(currentLevel);
    while (currentXp >= xpForNextLevel) {
        currentXp -= xpForNextLevel;
        const oldLevel = currentLevel;
        currentLevel++;

        // --- Grant Level-Up Rewards ---
        const rewards = [];
        
        // 1. Grant bonus coins (check if double coins buff is active for accurate display)
        const doubleCoinsExpires = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, 0);
        const hasDoubleCoinsBuff = Date.now() < doubleCoinsExpires;
        const baseCoins = 100;
        const actualCoins = hasDoubleCoinsBuff ? 200 : 100; // Will be calculated properly in grantCoins
        
        grantCoins(config, STORAGE_KEYS, baseCoins);
        
        // New: Grant 1 Talent Point per level up
        const currentTalentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
        GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, currentTalentPoints + 1);
        rewards.push('🌟 +1 Talent Point!');

        // Show actual coins received (with buff if active)
        if (hasDoubleCoinsBuff) {
            rewards.push('🪙 +100 Fixer-Coins! 💰 (+100 DOUBLE COINS BONUS!)');
        } else {
        rewards.push('🪙 +100 Fixer-Coins!');
        }
        // 2. Grant XP Boost every 5 levels
        // 2. Grant XP Boost & Reroll Token every 5 levels
        let isLegendaryLevelUp = false;
        if (currentLevel % 5 === 0) {
            rewards.push('✨ +1% Permanent XP Gain!');
            const currentTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);
            GM_setValue(STORAGE_KEYS.USER_REROLL_TOKENS, currentTokens + 1);
            rewards.push('🔄 +1 Bounty Reroll Token!');
        }
        // 3. Increase search history every 10 levels
        if (currentLevel % 10 === 0) {
            config.searchMaxHistory += 1;
            GM_setValue('searchMaxHistory', config.searchMaxHistory);
            rewards.push('📜 +1 Search History Slot!');
        }
        // 4. Grant a new cosmetic title at certain levels
        const newRank = RANKS.find(r => r.level === currentLevel);
        if (newRank) {
            GM_setValue(STORAGE_KEYS.USER_TITLE, newRank.title);
            if (newRank.glow) {
                isLegendaryLevelUp = true;
            }
            const glowStyle = newRank.glow ? 'text-shadow: 0 0 5px #fff;' : '';
            rewards.push(`🏆 New Title Unlocked: <span style="color:${newRank.color}; font-weight:bold; ${glowStyle}">${newRank.title}</span>!`);
        }
        // 5. Unlock a free theme at a specific level
        if (currentLevel === 15) {
            let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
            if (!purchased.includes('oceanic')) {
                purchased.push('oceanic');
                GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
                rewards.push('🌊 Free Theme Unlocked: Oceanic!');
            }
        }
        // 6. Grant special reward at level 100
        if (currentLevel === 100) {
            let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
            if (!purchased.includes('master_crown')) {
                purchased.push('master_crown');
                GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
                rewards.push('👑 Legendary Reward: The Master\'s Crown!');

                // Auto-equip the crown. This now adds it to the list of equipped items.
                if (typeof window.getAccessoryElement === 'function') {
                    let equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                    if (!equippedItems.includes('master_crown')) {
                        equippedItems.push('master_crown');
                        GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));
                        const crownAccessory = window.getAccessoryElement('master_crown');
                        if (crownAccessory) crownAccessory.style.display = 'block';
                    }
                }
            }
        }

        triggerLevelUpAnimation(currentLevel, oldLevel, STORAGE_KEYS, rewards, isLegendaryLevelUp);
        xpForNextLevel = getXpForLevel(currentLevel);
    }

    // --- New: Show XP Gain Indicator ---
    const xpBarContainer = document.getElementById('tm-xp-bar-container');
    if (xpBarContainer && points > 0) {
        indicator = document.createElement('div');
        indicator.className = 'tm-xp-gain-indicator';
        xpBarContainer.appendChild(indicator);

        // Update XP indicator to show boosted points if they are different
        if (finalPoints > points) {
            indicator.textContent = `+${points} XP (+${finalPoints - points} Bonus)`;
            indicator.style.color = '#28a745'; // Green for bonus
            indicator.style.fontSize = '15px';
        } else {
            indicator.textContent = `+${finalPoints} XP`;
        }


        // Remove the indicator after the animation finishes
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.parentElement.removeChild(indicator);
            }
        }, 1500); // Must match the animation duration in CSS
    }
    GM_setValue(STORAGE_KEYS.USER_XP, currentXp);
    GM_setValue(STORAGE_KEYS.USER_LEVEL, currentLevel);

    // Update mascot appearance for current level (if mascot is enabled)
    if (typeof window.updateMascotAppearanceByLevel === 'function') {
        window.updateMascotAppearanceByLevel(currentLevel);
    }

    // Update the UI
    const xpBarFill = document.getElementById('tm-xp-bar-fill');
    const xpText = document.getElementById('tm-xp-text');
    const levelText = document.getElementById('tm-level-text');
    const titleText = document.getElementById('tm-user-title-text');
    if (xpBarFill && xpText && levelText && titleText) {
        // --- New: Add temporary visual effects for XP gain ---
        if (finalPoints > 0) {
            const xpBar = xpBarContainer.querySelector('.tm-xp-bar');
            if (xpBar) {
                xpBar.classList.add('tm-xp-gain-flash');
                setTimeout(() => xpBar.classList.remove('tm-xp-gain-flash'), 500);
            }
            if (levelText) {
                levelText.classList.add('tm-level-pop');
                setTimeout(() => levelText.classList.remove('tm-level-pop'), 500);
            }
        }


        updateXpBarUI(STORAGE_KEYS, currentLevel, currentXp, xpForNextLevel);
    }
}

function grantCoins(config, STORAGE_KEYS, amount) {
    if (!config.levelUpSystemEnabled) return;
    let currentCoins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);

    // Apply coin talent bonus
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    let coinMultiplier = 1.0;
    const coinTalent = TALENT_TREE.find(t => unlockedTalents.includes(t.id) && t.bonus.type === 'coin_modifier');
    if (coinTalent) {
        coinMultiplier += coinTalent.bonus.multiplier;
    }

    // Apply "Double Coins" buff if active
    const doubleCoinsExpires = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, 0);
    const hasDoubleCoinsBuff = Date.now() < doubleCoinsExpires;
    if (hasDoubleCoinsBuff) {
        coinMultiplier += 1.0; // Add 100% bonus
    }

    const finalAmount = Math.ceil(amount * coinMultiplier);
    currentCoins += finalAmount;
    GM_setValue(STORAGE_KEYS.USER_COINS, currentCoins);
    
    // Show visual feedback for double coins bonus
    if (hasDoubleCoinsBuff && coinMultiplier >= 2.0 && amount >= 50) {
        console.log(`[MMS] 💰💰 DOUBLE COINS! ${amount} → ${finalAmount} coins`);
        // Create a floating coin indicator
        const coinIndicator = document.createElement('div');
        coinIndicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffd700;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 0 10px #ffc107, 0 2px 4px rgba(0,0,0,0.8);
            z-index: 15000;
            pointer-events: none;
            animation: tm-coin-bonus-popup 1.5s ease-out forwards;
        `;
        coinIndicator.textContent = `💰 +${finalAmount - amount} BONUS!`;
        document.body.appendChild(coinIndicator);
        
        // Create CSS animation if it doesn't exist
        if (!document.getElementById('tm-coin-bonus-animation')) {
            const style = document.createElement('style');
            style.id = 'tm-coin-bonus-animation';
            style.textContent = `
                @keyframes tm-coin-bonus-popup {
                    0% { 
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    20% { 
                        transform: translate(-50%, -70%) scale(1.2);
                        opacity: 1;
                    }
                    80% { 
                        transform: translate(-50%, -100%) scale(1);
                        opacity: 1;
                    }
                    100% { 
                        transform: translate(-50%, -120%) scale(0.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => coinIndicator.remove(), 1500);
    }
    
    // Update quest progress for earning coins
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress(STORAGE_KEYS, 'coinsEarned', amount);
    }
    updateCoinBalanceUI(STORAGE_KEYS, currentCoins);
}

function updateCoinBalanceUI(STORAGE_KEYS, balance) {
    const coinDisplay = document.getElementById('tm-coin-balance');
    if (!coinDisplay) return;
    coinDisplay.innerHTML = `🪙 ${balance}`;
}

/**
 * Tracks a daily statistic. Resets if the day has changed.
 * @param {string} statName The name of the stat to increment (e.g., 'searches').
 */
function trackDailyStat(config, STORAGE_KEYS, statName, value = 1) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let stats = {
        date: today,
        searches: 0,
        repairsCompleted: 0,
        ordersCreated: 0,
        statusChanges: 0,
        printOrder: 0,
        viewTechStats: 0,
        viewCustomerHistory: 0,
        setScratchpadReminder: 0,
        feedMascot: 0,
        petMascot: 0,
        memoryGame: 0,
        bugSquishGame: 0,
        xpEarned: 0,
        coinsEarned: 0
    };

    try {
        const savedStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
        // If the saved date is today, use it. Otherwise, the fresh object will be used.
        if (savedStats.date === today) {
            stats = savedStats;
        } else {
            // New day, so generate new quests
            generateDailyQuests(STORAGE_KEYS);
        }
    } catch (e) {
        console.error('[MMS] Could not parse daily stats, resetting.', e);
    }

    stats[statName] = (stats[statName] || 0) + value;
    GM_setValue(STORAGE_KEYS.DAILY_STATS, JSON.stringify(stats)); // Save before checking achievements
    
    // Also maintain a history object for charts (last 7 days)
    try {
        const history = JSON.parse(GM_getValue('tm_daily_stats_history', '{}'));
        if (!history[today]) {
            history[today] = { searches: 0, repairsCompleted: 0, ordersCreated: 0, statusChanges: 0 };
        }
        history[today][statName] = stats[statName];
        
        // Keep only last 7 days
        const daysToKeep = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            daysToKeep.push(date.toISOString().slice(0, 10));
        }
        const cleanedHistory = {};
        daysToKeep.forEach(day => {
            if (history[day]) cleanedHistory[day] = history[day];
        });
        GM_setValue('tm_daily_stats_history', JSON.stringify(cleanedHistory));
    } catch (e) {
        console.error('[MMS] Error updating stats history:', e);
    }
    
    console.log(`[MMS Stats] ${statName}: ${stats[statName]} (added ${value})`);

    // Don't check for achievements on every single action to avoid spam
    const achievementTrackedStats = ['searches', 'repairsCompleted', 'ordersCreated'];
    if (achievementTrackedStats.includes(statName))
    checkAchievements(config, STORAGE_KEYS, statName, stats[statName]);

    // Update quest progress for all stats
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress(STORAGE_KEYS, statName, value);
    }
    
    // Update boss battle progress if there's an active boss
    if (typeof updateBossProgress === 'function') {
        updateBossProgress(STORAGE_KEYS, statName);
    }

    // Handle combined stats like 'anyGamePlayed'
    if (statName === 'memoryGame' || statName === 'bugSquishGame') {
        stats['anyGamePlayed'] = (stats['anyGamePlayed'] || 0) + value;
        updateQuestProgress(STORAGE_KEYS, 'anyGamePlayed', value);
    }

    // Grant XP for the action
    if (config.levelUpSystemEnabled && XP_CONFIG[statName]) {
        grantXp(config, STORAGE_KEYS, XP_CONFIG[statName], statName); // Pass the source stat for talent calculation
    }
    if (config.interactiveMascotEnabled) {
        // Make the pet happy for user activity
        const happinessGain = (statName === 'repairsCompleted' || statName === 'ordersCreated') ? 20 : 5;
        updatePetStats(config, STORAGE_KEYS, happinessGain, 0);
    }
}

/**
 * Displays a temporary achievement notification.
 * @param {string} message The message to display.
 */
// Wrapper function that queues achievement notifications
function showAchievementNotification(message, xp = 0) {
    if (typeof queueNotification === 'function') {
        queueNotification('achievement', { title: message, xp: xp });
    } else {
        // Fallback to immediate if queue not available
        showAchievementNotificationImmediate(message, xp);
    }
}

function showAchievementNotificationImmediate(message, xp = 0) {
    // New: Log this to the notification center
    if (typeof createNotification === 'function') {
        createNotification(message, '✨');
    }

    let notification = document.getElementById('tm-achievement-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'tm-achievement-notification';
        document.body.appendChild(notification);
    }
    notification.innerHTML = `✨ ${message}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        // Remove after transition
        setTimeout(() => {
            if (notification.parentElement) notification.parentElement.removeChild(notification);
        }, 500);
    }, 4000);
}

/**
 * Checks for and triggers achievement notifications based on daily stats.
 * @param {string} statName The name of the stat that was just incremented.
 * @param {number} currentCount The new count for the stat.
 */
function checkAchievements(config, STORAGE_KEYS, statName, currentCount) {
    let unlockedAchievements = config.levelUpSystemEnabled ? JSON.parse(GM_getValue(STORAGE_KEYS.ACHIEVEMENTS, '{}')) : {};

    const achievements = {
        'searches': [
            { count: 1, message: 'Πρώτη Αναζήτηση! 🔍' },
            { count: 10, message: '10 Αναζητήσεις! Είσαι Master του Search! 🕵️' },
            { count: 50, message: '50 Αναζητήσεις! Δεν σου ξεφεύγει τίποτα! 🚀' },
            { count: 100, message: '100 Αναζητήσεις! Είσαι ο Βασιλιάς του Search! 👑' },
            { count: 250, message: '250 Αναζητήσεις! Το Matrix σε ζηλεύει! 💻' },
            { count: 500, message: '500 Αναζητήσεις! Είσαι μια μηχανή αναζήτησης! 🧠' },
            { count: 1000, message: '1000 Αναζητήσεις! All your base are belong to us! 👾' },
        ],
        'repairsCompleted': [
            { count: 1, message: 'Πρώτη Επισκευή Ολοκληρώθηκε! Συγχαρητήρια! 🎉' },
            { count: 10, message: '10 Επισκευές Ολοκληρώθηκαν! Είσαι ο Fixer! 🛠️' },
            { count: 50, message: '50 Επισκευές Ολοκληρώθηκαν! Ασταμάτητος! 🏆' },
            { count: 100, message: '100 Επισκευές! Είσαι Θρύλος! 🦾' },
            { count: 250, message: '250 Επισκευές! Μπορείς να φτιάξεις τα πάντα! ✨' },
            { count: 500, message: '500 Επισκευές! Ούτε ο MacGyver τέτοια στέλνεις! 📎' },
            { count: 1000, message: '1000 Επισκευές! Έχεις γίνει ένα με το κατσαβίδι! 🌀' },
        ],
        'ordersCreated': [
            { count: 1, message: 'Πρώτη Παραγγελία Καταχωρήθηκε! Ωραία δουλειά! 📝' },
            { count: 10, message: '10 Παραγγελίες Καταχωρήθηκαν! Είσαι ο Οργανωτής! 💼' },
            { count: 50, message: '50 Παραγγελίες Καταχωρήθηκαν! Απίστευτος! 🌟' },
            { count: 100, message: '100 Παραγγελίες! Είσαι ο Αυτοκράτορας της Οργάνωσης! 🏯' },
            { count: 250, message: '250 Παραγγελίες! Η τάξη είναι το δεύτερό σου όνομα! 📚' },
            { count: 500, message: '500 Παραγγελίες! Το χάος τρέμει στο πέρασμά σου! 🌌' },
            { count: 1000, message: '1000 Παραγγελίες! Έχεις φτάσει στο επίπεδο του Βιβλιοθηκονόμου! 📜' },
        ]
    };

    if (achievements[statName]) {
        achievements[statName].forEach(achievement => {
            if (currentCount === achievement.count && !unlockedAchievements[`${statName}-${achievement.count}`]) {
                showAchievementNotification(achievement.message);
                unlockedAchievements[`${statName}-${achievement.count}`] = true;
                if (config.levelUpSystemEnabled) {
                    // Grant bonus XP for achievements
                    if (XP_CONFIG.achievement) {
                        grantXp(config, STORAGE_KEYS, XP_CONFIG.achievement);
                    }
                    // New: Trigger Eureka animation on achievement unlock // Pass config
                    if (config.interactiveMascotEnabled && typeof triggerEurekaAnimation === 'function') { // Pass config
                        triggerEurekaAnimation(config);
                    }
                    if (config.interactiveMascotEnabled) setMascotState(config, 'happy', 5000);
                }
                GM_setValue(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlockedAchievements));
            }
        });
    }
}

// ===================================================================
// === DAILY BOUNTIES / QUESTS SYSTEM
// ===================================================================
function generateDailyQuests(STORAGE_KEYS) {
    const shuffled = QUEST_POOL.sort(() => 0.5 - Math.random());
    const dailyQuests = shuffled.slice(0, 3).map(quest => ({
        ...quest,
        progress: 0,
        claimed: false
    }));
    GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(dailyQuests));
    console.log('[MMS] New daily quests generated!');
}

function updateQuestProgress(STORAGE_KEYS, statName, value = 1) {
    let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
    if (quests.length === 0) return;

    let questsUpdated = false;
    quests.forEach(quest => {
        if (quest.targetStat === statName && !quest.claimed && quest.progress < quest.targetCount) {
            quest.progress += value;
            if (quest.progress >= quest.targetCount) {
                quest.progress = quest.targetCount; // Cap progress at target
                const completeMessage = `Bounty Complete: ${quest.description}`;
                
                // Queue the bounty completion notification
                if (typeof queueNotification === 'function') {
                    queueNotification('bounty', { message: completeMessage });
                } else {
                showPositiveMessage(completeMessage);
                }
                
                // Log bounty completion to notification center
                if (typeof createNotification === 'function') {
                createNotification(completeMessage, '📜');
                }
            }
            questsUpdated = true;
        }
    });

    if (questsUpdated) {
        GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
    }
}

function showQuestsModal(config, STORAGE_KEYS) {
    if (document.querySelector('.tm-modal-overlay')) return; // Prevent multiple modals

    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 600px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h2 class="tm-modal-title">📜 Daily Bounties</h2>
                <span id="tm-reroll-token-display" title="Bounty Reroll Tokens"></span>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div id="tm-quests-container" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;"></div>
        </div>
    `;
    // Add a class if there are completable bounties with a token
    const quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
    const hasCompletableBounty = quests.some(q => !q.claimed && q.progress < q.targetCount);
    const hasToken = (GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0) > 0;
    if (hasCompletableBounty && hasToken) overlay.classList.add('has-bounty-token');
    document.body.appendChild(overlay);

    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    populateQuestsModal(config, STORAGE_KEYS);
}

function populateQuestsModal(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-quests-container');
    if (!container) return;

    const rerollTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);
    const tokenDisplay = document.getElementById('tm-reroll-token-display');
    if (tokenDisplay) {
        tokenDisplay.innerHTML = `🔄 ${rerollTokens}`;
    }

    const bountyTokens = GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0;
    const bountyTokenDisplay = document.createElement('span');
    if (bountyTokenDisplay) {
        bountyTokenDisplay.innerHTML = ` | 🎯 ${bountyTokens}`;
        tokenDisplay.insertAdjacentElement('afterend', bountyTokenDisplay);
    }

    const quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
    if (quests.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">Bounties refresh daily. Check back tomorrow!</p>';
        return;
    }

    container.innerHTML = quests.map(quest => {
        const isComplete = quest.progress >= quest.targetCount;
        const progressPercent = (quest.progress / quest.targetCount) * 100;
        const canReroll = !quest.claimed && !isComplete && rerollTokens > 0;
        const canUseToken = !quest.claimed && !isComplete && bountyTokens > 0;
        return `
            <div class="tm-quest-item ${quest.claimed ? 'completed' : ''}">
                <div class="tm-quest-status-icon">${isComplete ? '✅' : '⏳'}</div>
                <div class="tm-quest-details">
                    <div class="tm-quest-description">${quest.description}</div>
                    <div class="tm-quest-progress-bar" title="${quest.progress} / ${quest.targetCount}">
                        <div style="width: ${progressPercent}%;"></div>
                    </div>
                    <div class="tm-quest-progress-text">${quest.progress} / ${quest.targetCount}</div>
                </div>
                <div class="tm-quest-reward">
                    XP: ${quest.rewardXp}<br>Coins: ${quest.rewardCoins}
                </div>
                <div class="tm-quest-actions">
                    <button class="tm-quest-claim-btn" data-quest-id="${quest.id}" ${(!isComplete || quest.claimed) ? 'disabled' : ''}>
                        ${quest.claimed ? 'Claimed' : 'Claim'}
                    </button>
                    <button class="tm-quest-reroll-btn" data-quest-id="${quest.id}" title="Reroll this bounty" ${!canReroll ? 'disabled' : ''}>🔄</button>
                    <button class="tm-quest-complete-btn" data-quest-id="${quest.id}" title="Use a Bounty Completion Token" ${!canUseToken ? 'disabled' : ''}>🎯</button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.tm-quest-claim-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questId = e.target.dataset.questId;
            let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
            const quest = quests.find(q => q.id === questId);
            if (quest && !quest.claimed && quest.progress >= quest.targetCount) {
                grantXp(config, STORAGE_KEYS, quest.rewardXp);
                grantCoins(config, STORAGE_KEYS, quest.rewardCoins);
                quest.claimed = true;
                // New: Chance to trigger Energized state on bounty completion
                if (Math.random() < 0.33) { // 33% chance
                    triggerEnergizedState(config, STORAGE_KEYS, 5 * 60 * 1000); // 5 minutes
                }
                GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
                populateQuestsModal(config, STORAGE_KEYS); // Re-render the modal to update state
            }
        });
    });

    container.querySelectorAll('.tm-quest-reroll-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questIdToReroll = e.target.dataset.questId;
            let currentTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);

            if (currentTokens <= 0) {
                showPositiveMessage("No reroll tokens left!");
                return;
            }

            if (!confirm("Use 1 Reroll Token to get a new bounty?")) return;

            // Decrement token and save
            currentTokens--;
            GM_setValue(STORAGE_KEYS.USER_REROLL_TOKENS, currentTokens);

            // Find a new quest
            let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
            const currentQuestIds = quests.map(q => q.id);
            const availableNewQuests = QUEST_POOL.filter(p => !currentQuestIds.includes(p.id));

            if (availableNewQuests.length > 0) {
                const newQuestTemplate = availableNewQuests[Math.floor(Math.random() * availableNewQuests.length)];
                const newQuest = { ...newQuestTemplate, progress: 0, claimed: false };

                // Replace the old quest
                const questIndex = quests.findIndex(q => q.id === questIdToReroll);
                if (questIndex !== -1) {
                    quests[questIndex] = newQuest;
                    GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
                    populateQuestsModal(config, STORAGE_KEYS); // Re-render
                }
            } else {
                showPositiveMessage("No more unique bounties available today!");
            }
        });
    });

    container.querySelectorAll('.tm-quest-complete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questIdToComplete = e.target.dataset.questId;
            let currentTokens = GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0;

            if (currentTokens <= 0) {
                showPositiveMessage("No Bounty Completion Tokens left!");
                return;
            }

            if (!confirm("Use 1 Bounty Completion Token to instantly complete this bounty?")) return;

            // Decrement token and save
            GM_setValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, currentTokens - 1);

            let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
            const quest = quests.find(q => q.id === questIdToComplete);
            if (quest) {
                quest.progress = quest.targetCount; // Instantly complete
                GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
                populateQuestsModal(config, STORAGE_KEYS); // Re-render
            }
        });
    });
}

/**
 * Creates and displays a modal showing all available titles and ranks.
 */
function showTitlesModal(STORAGE_KEYS) {
    if (document.querySelector('#tm-titles-modal')) return; // Prevent multiple modals

    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);

    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.id = 'tm-titles-modal';

    // Get the base SVG for the mascot to display its evolutions
    const mascotSVGTemplate = `
        <svg class="tm-mascot-robot" viewBox="0 0 100 100" style="overflow: visible; width: 60px; height: 60px;">
            <g class="tm-mascot-flipper" transform-origin="50 50">
                <g id="tm-mascot-base" style="display: none;">
                    <g class="tm-mascot-antenna"><line x1="50" y1="15" x2="50" y2="5" stroke="#333" stroke-width="2"/><circle cx="50" cy="5" r="3" fill="#ffc107"/></g>
                    <g class="tm-mascot-main-body"><rect x="25" y="15" width="50" height="40" rx="10" fill="#e0e0e0" stroke="#333" stroke-width="3"/><g class="tm-mascot-eye-open"><circle cx="40" cy="35" r="5" fill="white"/><circle cx="40" cy="35" r="2" fill="black"/><circle cx="60" cy="35" r="5" fill="white"/><circle cx="60" cy="35" r="2" fill="black"/></g><path class="tm-mascot-mouth-happy" d="M 40 45 Q 50 55 60 45" stroke="black" stroke-width="2" fill="none"/><rect x="20" y="55" width="60" height="30" rx="5" fill="#d0d0d0" stroke="#333" stroke-width="3"/></g>
                    <g class="tm-mascot-thrusters"><rect class="tm-mascot-thruster-left" x="30" y="85" width="15" height="10" fill="#6c757d"/><rect class="tm-mascot-thruster-right" x="55" y="85" width="15" height="10" fill="#6c757d"/></g>
                </g>
                <g id="tm-mascot-evo1" style="display: none;">
                    <g class="tm-mascot-antenna"><line x1="50" y1="15" x2="50" y2="5" stroke="#555" stroke-width="2"/><circle cx="50" cy="5" r="3" fill="#17a2b8"/></g>
                    <g class="tm-mascot-main-body"><rect x="25" y="15" width="50" height="40" rx="5" fill="#d4e6f1" stroke="#34495e" stroke-width="3"/><g class="tm-mascot-eye-open"><rect x="35" y="32" width="10" height="6" fill="white" rx="1"/><rect x="55" y="32" width="10" height="6" fill="white" rx="1"/></g><path class="tm-mascot-mouth-happy" d="M 40 45 Q 50 50 60 45" stroke="black" stroke-width="2" fill="none"/><rect x="20" y="55" width="60" height="30" rx="3" fill="#b9d7ea" stroke="#34495e" stroke-width="3"/></g>
                    <g class="tm-mascot-thrusters"><rect class="tm-mascot-thruster-left" x="30" y="85" width="15" height="10" fill="#5d6d7e" rx="2"/><rect class="tm-mascot-thruster-right" x="55" y="85" width="15" height="10" fill="#5d6d7e" rx="2"/></g>
                </g>
                <g id="tm-mascot-evo2" style="display: none;">
                    <g class="tm-mascot-antenna"><line x1="50" y1="15" x2="50" y2="5" stroke="#333" stroke-width="2"/><circle cx="50" cy="5" r="3" fill="#ffc107" stroke="#fff" stroke-width="0.5"/></g>
                    <g class="tm-mascot-main-body"><rect x="25" y="15" width="50" height="40" rx="8" fill="#f1f1f1" stroke="#ffc107" stroke-width="3"/><g class="tm-mascot-eye-open"><path d="M 35 32 L 45 32 L 40 40 Z" fill="#17a2b8"/><path d="M 55 32 L 65 32 L 60 40 Z" fill="#17a2b8"/></g><path class="tm-mascot-mouth-happy" d="M 40 48 L 60 48" stroke="black" stroke-width="2" fill="none"/><rect x="20" y="55" width="60" height="30" rx="5" fill="#e0e0e0" stroke="#ffc107" stroke-width="3"/></g>
                    <g class="tm-mascot-thrusters"><rect class="tm-mascot-thruster-left" x="30" y="85" width="15" height="12" fill="#333" rx="3"/><rect class="tm-mascot-thruster-right" x="55" y="85" width="15" height="12" fill="#333" rx="3"/></g>
                </g>
                <g id="tm-mascot-evo3" style="display: none;">
                    <g class="tm-mascot-antenna"><line x1="50" y1="15" x2="50" y2="5" stroke="#a335ee" stroke-width="2.5"/><circle cx="50" cy="5" r="3.5" fill="#f0f" stroke="#fff" stroke-width="1"/></g>
                    <g class="tm-mascot-main-body"><rect x="25" y="15" width="50" height="40" rx="12" fill="#2c2c2c" stroke="#a335ee" stroke-width="3"/><g class="tm-mascot-eye-open"><path d="M 35 30 L 45 40 M 45 30 L 35 40" stroke="#f0f" stroke-width="2"/><path d="M 55 30 L 65 40 M 65 30 L 55 40" stroke="#f0f" stroke-width="2"/></g><path class="tm-mascot-mouth-happy" d="M 40 48 L 60 48" stroke="#f0f" stroke-width="2" fill="none"/><rect x="20" y="55" width="60" height="30" rx="8" fill="#3c3c3c" stroke="#a335ee" stroke-width="3"/></g>
                    <g class="tm-mascot-thrusters"><rect class="tm-mascot-thruster-left" x="30" y="85" width="15" height="15" fill="#a335ee" rx="4"/><rect class="tm-mascot-thruster-right" x="55" y="85" width="15" height="15" fill="#a335ee" rx="4"/></g>
                </g>
                <g id="tm-mascot-evo4" style="display: none;">
                    <g class="tm-mascot-antenna"><line x1="50" y1="15" x2="50" y2="5" stroke="#ff8000" stroke-width="3"/><circle cx="50" cy="5" r="4" fill="#ffc107" stroke="#fff" stroke-width="1"><animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite"/></circle></g>
                    <g class="tm-mascot-main-body"><rect x="25" y="15" width="50" height="40" rx="15" fill="#fff" stroke="#ff8000" stroke-width="4"/><g class="tm-mascot-eye-open"><circle cx="40" cy="35" r="6" fill="#ff8000"/><circle cx="60" cy="35" r="6" fill="#ff8000"/></g><path class="tm-mascot-mouth-happy" d="M 40 45 Q 50 55 60 45" stroke="#ff8000" stroke-width="3" fill="none"/><rect x="20" y="55" width="60" height="30" rx="10" fill="#eee" stroke="#ff8000" stroke-width="4"/></g>
                    <g class="tm-mascot-thrusters"><rect class="tm-mascot-thruster-left" x="30" y="85" width="15" height="15" fill="#ff8000" rx="5"/><rect class="tm-mascot-thruster-right" x="55" y="85" width="15" height="15" fill="#ff8000" rx="5"/></g>
                </g>
            </g>
        </svg>
    `;

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

// Talent modal - moved out of settings
function showTalentsModal(config, STORAGE_KEYS) {
    const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    
    // Count available talents
    const availableTalents = TALENT_TREE.filter(t => currentLevel >= t.levelRequired).length;
    const totalTalents = TALENT_TREE.length;
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 900px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h3>🌟 Talent Tree (${unlockedTalents.length}/${availableTalents} Unlocked)</h3>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div class="tm-modal-body" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;">
                <!-- Talent Points Display -->
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-bottom: 16px;">
                    <div style="
                        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                    ">
                        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Available Points</div>
                        <div style="font-size: 38px; font-weight: bold;">⭐ ${talentPoints}</div>
                        <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Earn 1 per level</div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        min-width: 180px;
                    ">
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Progress</div>
                        <div style="font-size: 24px; font-weight: bold; color: #4facfe;">${unlockedTalents.length}/${availableTalents}</div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${totalTalents - availableTalents} locked by level</div>
                    </div>
                </div>
                
                <!-- Talents Grid -->
                <div id="tm-talents-modal-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    populateTalentsModal(STORAGE_KEYS);
}

function populateTalentsModal(STORAGE_KEYS) {
    const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const grid = document.getElementById('tm-talents-modal-grid');
    
    if (!grid) return;
    
    grid.innerHTML = TALENT_TREE.map(talent => {
        const isUnlocked = unlockedTalents.includes(talent.id);
        const canAfford = talentPoints >= talent.cost;
        const levelMet = currentLevel >= talent.levelRequired;
        const canUnlock = canAfford && levelMet && !isUnlocked;
        
        // Determine tier color based on level requirement
        let tierColor = '#94a3b8';
        let tierLabel = 'Novice';
        if (talent.levelRequired >= 250) { tierColor = '#e5cc80'; tierLabel = 'DIVINE'; }
        else if (talent.levelRequired >= 200) { tierColor = '#ff1493'; tierLabel = 'GODLIKE'; }
        else if (talent.levelRequired >= 150) { tierColor = '#ff00ff'; tierLabel = 'ULTIMATE'; }
        else if (talent.levelRequired >= 100) { tierColor = '#ff8000'; tierLabel = 'LEGENDARY'; }
        else if (talent.levelRequired >= 75) { tierColor = '#ffd700'; tierLabel = 'Grandmaster'; }
        else if (talent.levelRequired >= 50) { tierColor = '#a335ee'; tierLabel = 'Elite'; }
        else if (talent.levelRequired >= 40) { tierColor = '#9c27b0'; tierLabel = 'Epic'; }
        else if (talent.levelRequired >= 30) { tierColor = '#673ab7'; tierLabel = 'Master'; }
        else if (talent.levelRequired >= 20) { tierColor = '#3f51b5'; tierLabel = 'Advanced'; }
        else if (talent.levelRequired >= 15) { tierColor = '#2196f3'; tierLabel = 'Expert'; }
        else if (talent.levelRequired >= 10) { tierColor = '#03a9f4'; tierLabel = 'Skilled'; }
        else if (talent.levelRequired >= 5) { tierColor = '#00bcd4'; tierLabel = 'Apprentice'; }

        return `
            <div style="
                background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                border-radius: 10px;
                padding: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ${isUnlocked ? `border-left: 4px solid ${tierColor};` : ''}
                ${!levelMet ? 'opacity: 0.5; filter: grayscale(80%);' : ''}
                transition: all 0.3s;
                position: relative;
            " class="tm-talent-card">
                <!-- Tier Badge -->
                <div style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: ${tierColor};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">${tierLabel}</div>
                
                <div style="font-weight: 700; font-size: 14px; color: ${isUnlocked ? tierColor : '#2c3e50'}; margin-bottom: 6px; padding-right: 60px;">
                    ${isUnlocked ? '✓ ' : '🔒 '}${talent.name}
            </div>
                
                <!-- Level Requirement -->
                <div style="font-size: 10px; color: ${levelMet ? '#4caf50' : '#ef5350'}; margin-bottom: 6px; font-weight: 600;">
                    ${levelMet ? '✓' : '🔒'} Requires Level ${talent.levelRequired}
                </div>
                
                <div style="font-size: 12px; color: #64748b; min-height: 36px; margin-bottom: 12px; line-height: 1.4;">
                    ${talent.description}
                </div>
                ${isUnlocked ? `
                    <button style="
                        width: 100%;
                        padding: 8px;
                        background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 11px;
                        cursor: not-allowed;
                    " disabled>✓ Unlocked</button>
                ` : !levelMet ? `
                    <button style="
                        width: 100%;
                        padding: 8px;
                        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 11px;
                        cursor: not-allowed;
                    " disabled>🔒 Level ${talent.levelRequired} Required</button>
                ` : `
                    <button class="tm-talent-unlock-btn" data-talent-id="${talent.id}" style="
                        width: 100%;
                        padding: 8px;
                        background: linear-gradient(135deg, ${canUnlock ? '#4facfe 0%, #00f2fe 100%' : '#cbd5e1 0%, #94a3b8 100%'});
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 11px;
                        cursor: ${canUnlock ? 'pointer' : 'not-allowed'};
                        transition: all 0.2s;
                    " ${!canUnlock ? 'disabled' : ''}>
                        ${canAfford ? `Unlock (⭐ ${talent.cost})` : `Need ${talent.cost - talentPoints} more points`}
                    </button>
                `}
        </div>
    `;
    }).join('');
    
    // Add event listeners
    grid.querySelectorAll('.tm-talent-unlock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const talentId = btn.dataset.talentId;
    const talent = TALENT_TREE.find(t => t.id === talentId);

    if (talent) {
                const level = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
                let points = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                
                // Check level requirement
                if (level < talent.levelRequired) {
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage(`🔒 Requires Level ${talent.levelRequired}!`);
                    }
                    return;
                }
                
                if (points >= talent.cost) {
                    points -= talent.cost;
                    GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, points);
                    
                    let unlocked = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                    unlocked.push(talentId);
                    GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlocked));
                    
                    // Determine tier for message
                    let tierMsg = '';
                    if (talent.levelRequired >= 250) tierMsg = ' (DIVINE!)';
                    else if (talent.levelRequired >= 200) tierMsg = ' (GODLIKE!)';
                    else if (talent.levelRequired >= 150) tierMsg = ' (ULTIMATE!)';
                    else if (talent.levelRequired >= 100) tierMsg = ' (LEGENDARY!)';
                    
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage(`🌟 ${talent.name} unlocked${tierMsg}`);
                    }
                    
                    // Refresh the modal
                    document.querySelector('.tm-modal-overlay').remove();
                    showTalentsModal(window.config, STORAGE_KEYS);
                }
            }
        });
    });
}

// Keep old function for backward compatibility with settings page (but make it simpler)
function getTalentsHTML(STORAGE_KEYS) {
    return `
        <div class="tm-settings-section">
            <h3>🌟 Talents</h3>
            <p class="tm-setting-description">Το Talent Tree έχει μετακινηθεί! Κάντε κλικ στο κουμπί 🌟 στο footer για να δείτε τα talents σας.</p>
            <div style="text-align: center; padding: 20px;">
                <button onclick="window.showTalentsModal?.(window.config, window.STORAGE_KEYS)" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">🌟 Open Talent Tree</button>
            </div>
        </div>
    `;
}

function showShopModal(config, STORAGE_KEYS) {
    if (document.querySelector('#tm-shop-modal')) return; // Prevent multiple modals

    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.id = 'tm-shop-modal';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 700px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h2 class="tm-modal-title">🪙 Shop</h2>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div id="tm-shop-content-container" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px; padding-right: 10px;">
                <div class="tm-shop-tabs">
                    <button class="tm-shop-tab active" data-category="themes">🎨 Themes</button>
                    <button class="tm-shop-tab" data-category="accessories">🎩 Accessories</button>
                    <button class="tm-shop-tab" data-category="consumables">⚡ Consumables</button>
                </div>
                <div id="tm-shop-items-wrapper">
                    <!-- Shop items will be populated here -->
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    populateShop(config, STORAGE_KEYS); // Populate the content

    // Add tab switching logic
    const tabsContainer = overlay.querySelector('.tm-shop-tabs');
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.tm-shop-tab') && !e.target.classList.contains('active')) {
            const category = e.target.dataset.category;
            // Update tab active state
            tabsContainer.querySelectorAll('.tm-shop-tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            // Update content active state
            overlay.querySelectorAll('.tm-shop-category-content').forEach(content => content.classList.remove('active'));
            overlay.querySelector(`#tm-shop-category-${category}`).classList.add('active');
        }
    });

    // --- Shop Logic ---
    overlay.querySelector('#tm-shop-items-wrapper').addEventListener('click', (e) => {
        if (e.target.matches('.tm-shop-item-btn')) {
            if (e.target.classList.contains('buy')) {
                handleShopPurchase(e.target, config, STORAGE_KEYS); // This function is already defined and handles purchases
            } else if (e.target.classList.contains('equip') || e.target.classList.contains('equipped')) {
                const button = e.target;
                const itemId = button.dataset.itemId;
                const itemType = button.dataset.itemType;

                // Equip/Unequip logic
                if (itemType === 'accessory') {
                    let equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                    const accessoryElement = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                    
                    if (!accessoryElement) {
                        console.error(`[MMS Shop] Failed to get accessory element for ${itemId}`);
                        return;
                    }

                    if (equippedItems.includes(itemId)) {
                        // Unequip: Remove from array and hide element
                        equippedItems = equippedItems.filter(id => id !== itemId);
                        if (accessoryElement) accessoryElement.style.display = 'none';
                        console.log(`[MMS Shop] Unequipped ${itemId}`);
                        
                        // Reset mascot state to idle when unequipping animation accessories
                        if (itemId === 'stunt_bike' || itemId === 'juggling_balls' || itemId === 'bookworm_kit') {
                            if (typeof window.setMascotState === 'function') {
                                window.setMascotState({}, 'idle');
                            }
                        }
                    } else {
                        // Equip: Add to array and show element
                        equippedItems.push(itemId);
                        if (accessoryElement) accessoryElement.style.display = 'block';
                        console.log(`[MMS Shop] Equipped ${itemId}`);
                        
                        // Trigger animation state when equipping special accessories
                        // Note: Juggling balls don't force permanent state - they trigger periodic animations
                        if (itemId === 'stunt_bike') {
                            if (typeof window.setMascotState === 'function') {
                                window.setMascotState({}, 'biking', 0); // 0 = infinite duration
                            }
                        } else if (itemId === 'bookworm_kit') {
                            if (typeof window.setMascotState === 'function') {
                                window.setMascotState({}, 'reading', 0); // 0 = infinite duration
                            }
                        }
                    }

                    GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));

                } else if (itemType === 'theme') {
                    if (typeof window.applyTheme === 'function') {
                        window.applyTheme(itemId);
                }
                }
                populateShop(config, STORAGE_KEYS); // Re-render shop to update buttons
            }
        }
    });
}

function populateShop(config, STORAGE_KEYS) {
    const itemsWrapper = document.getElementById('tm-shop-items-wrapper');
    if (!itemsWrapper) return;

    // Define categories
    const shopModal = document.getElementById('tm-shop-modal');
    let activeCategory = 'themes'; // Default to themes
    if (shopModal) {
        const activeTab = shopModal.querySelector('.tm-shop-tab.active');
        if (activeTab) {
            activeCategory = activeTab.dataset.category;
        }
    }

    const categories = {
        themes: [],
        accessories: [],
        consumables: []
        // Note: Customization/Evolutions category removed - mascot evolutions unlock automatically by level
    };

    // Sort all items into categories
    Object.keys(UI_THEMES).forEach(id => categories.themes.push({ id, ...UI_THEMES[id], type: 'theme' }));
    categories.accessories.push(
        // Hats & Headwear (250-800 coins)
        { id: 'top_hat', name: 'Top Hat', icon: '🎩', cost: 250, type: 'accessory' },
        { id: 'cowboy_hat', name: 'Cowboy Hat', icon: '🤠', cost: 300, type: 'accessory' },
        { id: 'party_hat', name: 'Party Hat', icon: '🎊', cost: 200, type: 'accessory' },
        { id: 'wizard_hat', name: 'Wizard Hat', icon: '🧙', cost: 500, type: 'accessory' },
        { id: 'chef_hat', name: 'Chef Hat', icon: '👨‍🍳', cost: 350, type: 'accessory' },
        { id: 'halo', name: 'Angel Halo', icon: '😇', cost: 800, type: 'accessory' },
        
        // Eyewear (200-400 coins)
        { id: 'cool_shades', name: 'Cool Shades', icon: '😎', cost: 350, type: 'accessory' },
        { id: 'nerd_glasses', name: 'Nerd Glasses', icon: '🤓', cost: 300, type: 'accessory' },
        { id: 'monocle', name: 'Fancy Monocle', icon: '🧐', cost: 400, type: 'accessory' },
        
        // Tools & Items (300-1200 coins)
        { id: 'rainy_day_umbrella', name: 'Rainy Day Umbrella', icon: '☂️', cost: 350, type: 'accessory' },
        { id: 'beach_umbrella', name: 'Beach Umbrella', icon: '🏖️', cost: 400, type: 'accessory' },
        { id: 'bookworm_kit', name: 'Bookworm Kit', icon: '📚', cost: 300, type: 'accessory' },
        { id: 'stunt_bike', name: 'Stunt Bike', icon: '🚲', cost: 750, type: 'accessory' },
        { id: 'juggling_balls', name: 'Juggling Balls', icon: '🤹', cost: 400, type: 'accessory' },
        { id: 'jetpack', name: 'Jetpack', icon: '🚀', cost: 1200, type: 'accessory' },
        { id: 'skateboard', name: 'Skateboard', icon: '🛹', cost: 600, type: 'accessory' },
        { id: 'magic_wand', name: 'Magic Wand', icon: '🪄', cost: 550, type: 'accessory' },
        { id: 'camera', name: 'Camera', icon: '📸', cost: 450, type: 'accessory' },
        { id: 'microphone', name: 'Microphone', icon: '🎤', cost: 500, type: 'accessory' },
        { id: 'guitar', name: 'Guitar', icon: '🎸', cost: 700, type: 'accessory' },
        
        // Festive & Special (400-2000 coins)
        { id: 'santa_hat', name: 'Santa Hat', icon: '🎅', cost: 600, type: 'accessory' },
        { id: 'flower_crown', name: 'Flower Crown', icon: '🌸', cost: 400, type: 'accessory' },
        { id: 'laurel_wreath', name: 'Laurel Wreath', icon: '🏆', cost: 900, type: 'accessory' },
        { id: 'devil_horns', name: 'Devil Horns', icon: '😈', cost: 666, type: 'accessory' },
        { id: 'ninja_mask', name: 'Ninja Mask', icon: '🥷', cost: 750, type: 'accessory' },
        
        // Premium Items (1000-10000 coins)
        { id: 'master_crown', name: 'Master\'s Crown', icon: '👑', cost: 10000, type: 'accessory' },
        { id: 'diamond_ring', name: 'Diamond Ring', icon: '💎', cost: 5000, type: 'accessory' },
        { id: 'golden_trophy', name: 'Golden Trophy', icon: '🥇', cost: 3000, type: 'accessory' },
        { id: 'rainbow_wings', name: 'Rainbow Wings', icon: '🌈', cost: 2500, type: 'accessory' },
        { id: 'power_glove', name: 'Power Glove', icon: '🔥', cost: 1500, type: 'accessory' },
        { id: 'vip_pass', name: 'VIP Pass', icon: '🎫', cost: 2000, type: 'accessory' },
    );
    categories.consumables.push(
        // Utility Items (25-300 coins)
        { id: 'reroll_token', name: 'Bounty Reroll Token', icon: '🔄', cost: 100, type: 'consumable', desc: 'Reroll daily bounty' },
        { id: SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, name: 'Bounty Completion Token', icon: '🎯', cost: 300, type: 'consumable', desc: 'Instantly complete bounty' },
        { id: 'confetti_bomb', name: 'Confetti Bomb', icon: '🎉', cost: 25, type: 'consumable', desc: 'Party celebration!' },
        
        // Food & Snacks (30-120 coins)
        { id: 'happiness_snack', name: 'Happiness Snack', icon: '💖', cost: 50, type: 'consumable', desc: 'Max happiness' },
        { id: 'hunger_meal', name: 'Hunger Meal', icon: '🍱', cost: 50, type: 'consumable', desc: 'Max hunger' },
        { id: 'super_meal', name: 'Super Meal', icon: '🍜', cost: 100, type: 'consumable', desc: 'Max hunger + happiness' },
        { id: 'pizza_slice', name: 'Pizza Slice', icon: '🍕', cost: 60, type: 'consumable', desc: '+40 hunger, +20 happiness' },
        { id: 'burger_combo', name: 'Burger Combo', icon: '🍔', cost: 70, type: 'consumable', desc: '+40 hunger, +20 happiness' },
        { id: 'ice_cream', name: 'Ice Cream', icon: '🍦', cost: 40, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'donut', name: 'Donut', icon: '🍩', cost: 35, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'cookie', name: 'Cookie', icon: '🍪', cost: 30, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'chocolate_bar', name: 'Chocolate Bar', icon: '🍫', cost: 45, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'sushi_platter', name: 'Sushi Platter', icon: '🍣', cost: 120, type: 'consumable', desc: '+60 hunger, +40 happiness' },
        
        // Drinks & Potions (50-250 coins)
        { id: 'energized_drink', name: 'Energized Drink', icon: '⚡️', cost: 150, type: 'consumable', desc: '15 min energized buff' },
        { id: 'coffee', name: 'Coffee', icon: '☕', cost: 50, type: 'consumable', desc: '5 min energized buff' },
        { id: 'smoothie', name: 'Smoothie', icon: '🥤', cost: 75, type: 'consumable', desc: '+20 hunger, +30 happiness' },
        { id: 'health_potion', name: 'Health Potion', icon: '🧪', cost: 100, type: 'consumable', desc: '+50 to both stats' },
        { id: 'mana_potion', name: 'Mana Potion', icon: '🔮', cost: 120, type: 'consumable', desc: '+50 to both stats' },
        { id: 'speed_potion', name: 'Speed Potion', icon: '💨', cost: 130, type: 'consumable', desc: '8 min energized buff' },
        { id: 'lucky_potion', name: 'Lucky Potion', icon: '🍀', cost: 180, type: 'consumable', desc: '5 min double coins' },
        { id: 'rainbow_juice', name: 'Rainbow Juice', icon: '🌈', cost: 200, type: 'consumable', desc: 'Max stats + confetti' },
        { id: 'golden_elixir', name: 'Golden Elixir', icon: '✨', cost: 250, type: 'consumable', desc: 'Max stats + 20 min buff' },
        
        // XP & Coins (150-400 coins)
        { id: 'double_coins_voucher', name: 'Double Coins Voucher', icon: '💰', cost: 200, type: 'consumable', desc: '10 min double coins' },
        { id: 'xp_boost_small', name: 'Small XP Boost', icon: '📈', cost: 150, type: 'consumable', desc: 'Instant +100 XP' },
        { id: 'xp_boost_medium', name: 'Medium XP Boost', icon: '📊', cost: 250, type: 'consumable', desc: 'Instant +250 XP' },
        { id: 'xp_boost_large', name: 'Large XP Boost', icon: '💹', cost: 400, type: 'consumable', desc: 'Instant +500 XP' },
        { id: 'coin_magnet', name: 'Coin Magnet', icon: '🧲', cost: 180, type: 'consumable', desc: '7 min double coins' },
        { id: 'lucky_coin', name: 'Lucky Coin', icon: '🪙', cost: 170, type: 'consumable', desc: '7 min double coins' },
        
        // Special Effects (100-350 coins)
        { id: 'fireworks', name: 'Fireworks', icon: '🎆', cost: 100, type: 'consumable', desc: 'Huge celebration!' },
        { id: 'sparkles', name: 'Sparkles', icon: '✨', cost: 80, type: 'consumable', desc: 'Sparkly effect' },
        { id: 'rainbow_trail', name: 'Rainbow Trail', icon: '🌈', cost: 150, type: 'consumable', desc: 'Rainbow + 50 happiness' },
        { id: 'snow_globe', name: 'Snow Globe', icon: '❄️', cost: 120, type: 'consumable', desc: 'Snow celebration' },
        { id: 'bubble_blast', name: 'Bubble Blast', icon: '🫧', cost: 90, type: 'consumable', desc: 'Bubble party' },
        { id: 'star_shower', name: 'Star Shower', icon: '🌟', cost: 130, type: 'consumable', desc: 'Starry effect' },
        { id: 'heart_explosion', name: 'Heart Explosion', icon: '💕', cost: 110, type: 'consumable', desc: 'Hearts + 80 happiness' },
        { id: 'disco_ball', name: 'Disco Ball', icon: '🪩', cost: 200, type: 'consumable', desc: 'Ultimate party!' },
        
        // Power-ups (200-500 coins)
        { id: 'time_warp', name: 'Time Warp', icon: '⏰', cost: 300, type: 'consumable', desc: '30 min buff + 200 XP' },
        { id: 'shield_buff', name: 'Shield Buff', icon: '🛡️', cost: 250, type: 'consumable', desc: 'Max both stats' },
        { id: 'magnet_buff', name: 'Magnet Buff', icon: '🧲', cost: 220, type: 'consumable', desc: '15 min double coins' },
        { id: 'focus_boost', name: 'Focus Boost', icon: '🎯', cost: 280, type: 'consumable', desc: '25 min buff + 150 XP' },
        { id: 'productivity_pill', name: 'Productivity Pill', icon: '💊', cost: 350, type: 'consumable', desc: '25 min buff + 150 XP' },
        { id: 'inspiration_spark', name: 'Inspiration Spark', icon: '💡', cost: 320, type: 'consumable', desc: '300 XP + confetti' },
        { id: 'turbo_mode', name: 'Turbo Mode', icon: '🚀', cost: 400, type: 'consumable', desc: '20 min double buff' },
        { id: 'mega_boost', name: 'Mega Boost', icon: '⚡', cost: 500, type: 'consumable', desc: '30 min full buff + 500 XP' },
    );

    // Evolutions are automatically unlocked by leveling up, not purchasable
    // They are removed from the shop to prevent buying/equipping

    const purchasedItems = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    let currentCoins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);

    itemsWrapper.innerHTML = ''; // Clear previous items

    // Create content for each category
    for (const category in categories) {
        const categoryContent = document.createElement('div');
        categoryContent.id = `tm-shop-category-${category}`;
        categoryContent.className = 'tm-shop-category-content';
        if (category === activeCategory) categoryContent.classList.add('active'); // Make the correct tab active

        const shopGrid = document.createElement('div');
        shopGrid.className = 'tm-shop-grid'; // Use a class instead of a duplicate ID

        categories[category].forEach(item => {
            const isOwned = purchasedItems.includes(item.id);
            const isEquipped = (item.type === 'accessory' && equippedItems.includes(item.id)) || (item.type === 'theme' && config && config.equippedTheme === item.id);

            const itemDiv = document.createElement('div');
            itemDiv.className = `tm-shop-item ${isOwned || (config && config.debugEnabled && item.type !== 'consumable') ? 'owned' : ''}`;
            itemDiv.innerHTML = `
                <div class="tm-shop-item-icon">${item.icon}</div>
                <div class="tm-shop-item-name">${item.name}</div>
                ${item.desc ? `<div class="tm-shop-item-desc">${item.desc}</div>` : ''}
                <div class="tm-shop-item-cost">${(isOwned && item.type !== 'consumable') ? 'Owned' : (config && config.debugEnabled ? '🪙 0 (Free)' : `🪙 ${item.cost}`)}</div>
                <button class="tm-shop-item-btn" data-item-id="${item.id}" data-item-cost="${item.cost}" data-item-type="${item.type}"></button>
            `;

            const button = itemDiv.querySelector('.tm-shop-item-btn');
            if (isOwned || (config && config.debugEnabled && item.type !== 'consumable')) {
                button.textContent = isEquipped ? (item.type === 'accessory' ? 'Unequip' : 'Equipped') : 'Equip';
                button.className += isEquipped ? ' equipped' : ' equip';
                // For accessories, the button is never disabled if owned, as it toggles equip/unequip.
                if (isEquipped && item.type !== 'accessory') {
                    button.disabled = true;
                }
            } else {
                button.textContent = (config && config.debugEnabled) ? 'Get (Free)' : 'Buy';
                button.className += ' buy';
                if (!(config && config.debugEnabled) && currentCoins < item.cost) button.disabled = true;
            }
            shopGrid.appendChild(itemDiv);
        });
        categoryContent.appendChild(shopGrid);
        itemsWrapper.appendChild(categoryContent);
    }
}

function handleShopPurchase(button, config, STORAGE_KEYS) {
    const itemId = button.dataset.itemId;
    const itemCost = parseInt(button.dataset.itemCost, 10);
    const itemType = button.dataset.itemType;

    // The bug was here. The coin check was happening even in debug mode.
    // I've fixed it so if debug mode is on, the cost is considered 0.
    const finalCost = (config && config.debugEnabled) ? 0 : itemCost;
    let currentCoins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);

    if (currentCoins < finalCost) {
        alert('Δεν έχετε αρκετά Fixer-Coins!');
        return;
    }

    currentCoins -= finalCost;
    GM_setValue(STORAGE_KEYS.USER_COINS, currentCoins);
    updateCoinBalanceUI(STORAGE_KEYS, currentCoins);

    if (itemType === 'consumable' && itemId === 'reroll_token') {
        const currentTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);
        GM_setValue(STORAGE_KEYS.USER_REROLL_TOKENS, currentTokens + 1);
    } else if (itemType === 'consumable' && itemId === SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN) {
        const currentTokens = GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0;
        GM_setValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, currentTokens + 1);
    } else if (itemType === 'consumable') {
        // Handle immediate use of other consumables
        switch (itemId) {
            // === DRINKS & ENERGY ===
            case 'energized_drink':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 15 * 60 * 1000); // 15 minutes
                }
                break;
            case 'coffee':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 5 * 60 * 1000); // 5 minutes
                }
                break;
            case 'smoothie':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 30, 20);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 2000);
                }
                break;
            case 'health_potion':
            case 'mana_potion':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 50, 50);
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(50);
                }
                break;
            case 'speed_potion':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 8 * 60 * 1000); // 8 minutes
                }
                break;
            case 'lucky_potion':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 5 * 60 * 1000); // 5 minutes
                }
                break;
            case 'rainbow_juice':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 100); // Max both stats
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(150);
                }
                break;
            case 'golden_elixir':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 100);
                }
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 20 * 60 * 1000); // 20 minutes
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(300);
                }
                break;
                
            // === FOOD & SNACKS ===
            case 'happiness_snack':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 0); // Max out happiness
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 3000);
                }
                break;
            case 'hunger_meal':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 0, 100); // Max out hunger
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 2000);
                }
                break;
            case 'super_meal':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 50, 100);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 3000);
                }
                break;
            case 'pizza_slice':
            case 'burger_combo':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 20, 40);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 2000);
                }
                break;
            case 'ice_cream':
            case 'donut':
            case 'cookie':
            case 'chocolate_bar':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 30, 15);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 2000);
                }
                break;
            case 'sushi_platter':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 40, 60);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 3000);
                }
                break;
                
            // === XP & COINS ===
            case 'double_coins_voucher':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 10 * 60 * 1000); // 10 minutes
                }
                break;
            case 'xp_boost_small':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 100, 'XP Boost Small');
                }
                break;
            case 'xp_boost_medium':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 250, 'XP Boost Medium');
                }
                break;
            case 'xp_boost_large':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 500, 'XP Boost Large');
                }
                break;
            case 'coin_magnet':
            case 'lucky_coin':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 7 * 60 * 1000); // 7 minutes
                }
                break;
                
            // === SPECIAL EFFECTS ===
            case 'confetti_bomb':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(200);
                }
                break;
            case 'fireworks':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(300);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 3000);
                }
                break;
            case 'sparkles':
            case 'star_shower':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(100);
                }
                break;
            case 'rainbow_trail':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(250);
                }
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 50, 0);
                }
                break;
            case 'snow_globe':
            case 'bubble_blast':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(150);
                }
                break;
            case 'heart_explosion':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(180);
                }
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 80, 0);
                }
                break;
            case 'disco_ball':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(400);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 5000);
                }
                break;
                
            // === POWER-UPS ===
            case 'time_warp':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 30 * 60 * 1000); // 30 minutes
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 200, 'Time Warp');
                }
                break;
            case 'shield_buff':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 100);
                }
                break;
            case 'magnet_buff':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 15 * 60 * 1000); // 15 minutes
                }
                break;
            case 'focus_boost':
            case 'productivity_pill':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 25 * 60 * 1000); // 25 minutes
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 150, itemId === 'productivity_pill' ? 'Productivity Pill' : 'Focus Boost');
                }
                break;
            case 'inspiration_spark':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 300, 'Inspiration Spark');
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(200);
                }
                break;
            case 'turbo_mode':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 20 * 60 * 1000); // 20 minutes
                }
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 10 * 60 * 1000); // 10 minutes
                }
                break;
            case 'mega_boost':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 30 * 60 * 1000); // 30 minutes
                }
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 15 * 60 * 1000); // 15 minutes
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 500, 'Mega Boost');
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(500);
                }
                break;
        }
    } else {
        let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
        if (!purchased.includes(itemId)) purchased.push(itemId);
        GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
    }

    if (typeof window.showPositiveMessage === 'function') {
        window.showPositiveMessage('Αγορά επιτυχής!');
    }
    populateShop(config, STORAGE_KEYS); // Re-render the shop
}

/**
 * Initializes a small widget in the footer to display today's tracked statistics.
 * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
 */
function initDailyDashboardWidget(config, parentContainer, STORAGE_KEYS) {
    if (!config || !config.dashboardWidgetEnabled) return;

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

    // Get status transfer counts
    const status40Count = GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
    const status100Count = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);

    // Create the widget's HTML
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'tm-daily-dashboard-widget';
    widgetContainer.style.color = '#fff';
    widgetContainer.style.fontSize = '12px';
    widgetContainer.style.display = 'flex';
    widgetContainer.style.alignItems = 'center';
    widgetContainer.style.gap = '8px';
    widgetContainer.title = `Σημερινά Στατιστικά:\n- ${stats.ordersCreated || 0} Νέες Παραγγελίες\n- ${stats.repairsCompleted || 0} Ολοκληρωμένες Επισκευές\n- ${stats.searches || 0} Αναζητήσεις\n- ${status40Count} Μεταφορές σε 40\n- ${status100Count} Μεταφορές σε 100`;

    widgetContainer.innerHTML = `
        <span style="font-weight: bold;">Σήμερα:</span>
        <span>📝 ${stats.ordersCreated || 0}</span>
        <span style="opacity: 0.5;">|</span>
        <span>🛠️ ${stats.repairsCompleted || 0}</span>
        <span style="opacity: 0.5;">|</span>
        <span>🔍 ${stats.searches || 0}</span>
        <span style="opacity: 0.5;">|</span>
        <span title="Μεταφορές σε Status 40">📞 ${status40Count}</span>
        <span style="opacity: 0.5;">|</span>
        <span title="Μεταφορές σε Status 100">✅ ${status100Count}</span>
    `;

    // Add the widget to the parent container in the footer
    parentContainer.appendChild(widgetContainer);
    console.log('[MMS] Daily Dashboard widget initialized in footer.');
}

/**
 * Creates a small widget in the footer to display the user's XP bar.
 * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
 */
function initXpBarWidget(parentContainer, STORAGE_KEYS) {
    if (!config.levelUpSystemEnabled) return;

    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const currentTitle = GM_getValue(STORAGE_KEYS.USER_TITLE, RANKS[0].title);
    const currentXp = GM_getValue(STORAGE_KEYS.USER_XP, 0);

    const xpBarContainer = document.createElement('div');
    xpBarContainer.id = 'tm-xp-bar-container';
    const xpForNextLevel = getXpForLevel(currentLevel);
    xpBarContainer.title = `${currentTitle}\nExperience Points`;
    xpBarContainer.innerHTML = `
        <div id="tm-buff-timers-container">
            <!-- Buff timers will be injected here -->
        </div>
        <span id="tm-user-title-text"></span> 
        <span id="tm-energized-buff-indicator" style="display: none;"></span>
        <span id="tm-level-text">Lv. ${currentLevel}</span>
        <div class="tm-xp-bar" title="${currentXp} / ${xpForNextLevel} XP">
            <div id="tm-xp-bar-fill" style="width: ${(currentXp / xpForNextLevel) * 100}%;"></div>
            <div id="tm-xp-text">${xpForNextLevel - currentXp} XP to next level</div>
        </div>
    `;
    const rankInfo = RANKS.slice().reverse().find(r => currentLevel >= r.level) || RANKS[0];
    const titleColor = rankInfo.color;
    const glowStyle = rankInfo.glow ? `text-shadow: 0 0 5px ${titleColor};` : '';

    parentContainer.appendChild(xpBarContainer);
    // Now that the elements are in the DOM, update them with the correct title and style
    const titleText = document.getElementById('tm-user-title-text');
    titleText.textContent = currentTitle;
    titleText.style.color = titleColor;
    titleText.style.textShadow = glowStyle;

    // Make the entire bar clickable to show the titles modal
    xpBarContainer.style.cursor = 'pointer';
    xpBarContainer.addEventListener('click', () => showTitlesModal(STORAGE_KEYS));

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
    if (xpText) xpText.textContent = `${xpForNext - xp} XP to next level`;
    if (xpBar) xpBar.title = `${xp} / ${xpForNext} XP`;

    const rankInfo = RANKS.slice().reverse().find(r => level >= r.level) || RANKS[0];

    if (titleText) {
        titleText.textContent = rankInfo.title;
        titleText.style.color = rankInfo.color;
        titleText.style.textShadow = rankInfo.glow ? `0 0 5px ${rankInfo.color}` : 'none';
    }
    levelText.textContent = `Lv. ${level}`;
}

/**
 * Tracks new orders by monitoring clicks on the "Save" button on the add order page.
 */
function initOrderTracking(config, STORAGE_KEYS) {
    if (!config.levelUpSystemEnabled) return;

    const pathname = window.location.pathname;
    
    // Check if we're on an order add page
    const isOrderAddPage = pathname.includes('srvorders_add') || pathname.includes('sparepartstoorder_add');
    
    if (!isOrderAddPage) {
        console.log('[MMS] Not on order add page, skipping order tracking setup.');
        return;
    }

    console.log('[MMS] On order add page. Looking for save button...');

    // Function to attach listener to save button
    function attachSaveListener() {
        // Try multiple selectors to find the save button
        const saveButton = document.querySelector('#saveButton1') || 
                          document.querySelector('a.rnr-button.main[href="#"]') ||
                          Array.from(document.querySelectorAll('a.rnr-button')).find(btn => 
                              btn.textContent.trim().includes('Αποθήκευση') || 
                              btn.textContent.trim().includes('Save')
                          );
        
        if (!saveButton) {
            console.log('[MMS] Save button not found yet, will retry...');
            return false;
        }

        console.log('[MMS] ✓ Found save button:', saveButton.textContent.trim());

        // Prevent duplicate listeners
        if (saveButton.hasAttribute('data-tm-tracked')) {
            console.log('[MMS] Save button already has listener.');
            return true;
        }
        
        saveButton.setAttribute('data-tm-tracked', 'true');

        saveButton.addEventListener('click', (e) => {
            console.log('[MMS] 🎯 Save button clicked! Tracking order creation...');
            
            // Use a small delay to ensure the form validates first
            setTimeout(() => {
            trackDailyStat(config, STORAGE_KEYS, 'ordersCreated');
                
                // Show feedback
                if (config.interactiveMascotEnabled) {
                    setMascotState(config, 'happy', 3000);
                    const orderMessages = [
                        'Νέα παραγγελία ρε!', 'Saved!', 'Ωραία!', 
                        'Κατάχωρήθηκε!', 'Πάμε!', 'Order done!',
                        'Μια ακόμα!', 'Γράψαμε!', 'Κομπλέ!'
                    ];
                    showMascotBubble(orderMessages[Math.floor(Math.random() * orderMessages.length)], 2000);
                }
            }, 100);
        }, { once: false });
        
        return true;
    }

    // Try to attach immediately
    if (!attachSaveListener()) {
        // If not found, retry after DOM is fully loaded
        let attempts = 0;
        const retryInterval = setInterval(() => {
            attempts++;
            console.log(`[MMS] Retry #${attempts} to find save button...`);
            
            if (attachSaveListener() || attempts >= 10) {
                clearInterval(retryInterval);
                if (attempts >= 10) {
                    console.log('[MMS] ⚠️ Could not find save button after 10 attempts.');
                }
            }
        }, 500); // Retry every 500ms
    }
}

/**
 * Initializes fun, non-essential features like confetti.
 */
function initFunFeatures(config, STORAGE_KEYS) {
    if (!config.confettiEnabled) return;

    // --- Track Status Changes & Confetti on Completion ---
    if (window.location.pathname.includes('/mymanagerservice/service_edit.php')) {
        const buttons = document.querySelectorAll('.rnr-b-editbuttons a.rnr-button');
        buttons.forEach(button => {
            // Assume any button in this container that isn't "Back to List" or "Print" is a status change.
            const buttonText = button.innerText.toUpperCase();
            const isStatusButton = !buttonText.includes('BACK TO LIST') && !buttonText.includes('ΕΚΤΥΠΩΣΗ');

            if (isStatusButton) {
                button.addEventListener('click', () => {
                    const buttonHref = button.getAttribute('href') || '';
                    
                    // Check if this is a status 90 button (part order)
                    const isStatus90 = buttonHref.includes('statusid=90');
                    
                    if (isStatus90) {
                        // Intercept confirm dialogs for status 90 → 65 transition
                        const originalConfirm = window.confirm;
                        window.confirm = function(message) {
                            const result = originalConfirm(message);
                            if (result) {
                                // User confirmed the order placement
                                console.log('[MMS] Status 90→65 order confirmed. Tracking order creation.');
                                trackDailyStat(config, STORAGE_KEYS, 'ordersCreated');
                                
                                if (config.interactiveMascotEnabled) {
                                    const orderMessages = [
                                        'Παραγγελία part!', 'Το παραγγέλνω!', 
                                        'Έρχεται το ανταλλακτικό!', 'Order placed!', 'Κομπλέ!',
                                        'Part incoming!', 'Ας έρθει!', 'Ωραία φάση!'
                                    ];
                                    showMascotBubble(orderMessages[Math.floor(Math.random() * orderMessages.length)], 2500);
                                }
                            }
                            // Restore original confirm
                            window.confirm = originalConfirm;
                            return result;
                        };
                    }
                    
                    // A small delay to let the page's own logic run before we track.
                    setTimeout(() => {
                        console.log(`[MMS] Status change button clicked: "${button.innerText}".`);
                        trackDailyStat(config, STORAGE_KEYS, 'statusChanges'); // Grant XP for any status change.

                        // Special rewards for completing a repair
                        if (button.innerHTML.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ')) {
                            trackDailyStat(config, STORAGE_KEYS, 'repairsCompleted');
                            if (config.interactiveMascotEnabled) {
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
        </div>
        
        <div class="tm-settings-section">
            <h3>🚀 Advanced Features</h3>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-random-events-enabled">⚡ Random Events</label>
                    <p class="tm-setting-description">Τυχαία events που εμφανίζονται και δίνουν bonuses (2x coins, 2x XP, κλπ).</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-random-events-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-factions-enabled">🏰 Factions</label>
                    <p class="tm-setting-description">Μπείτε σε faction για να ξεκλειδώσετε ειδικά perks και bonuses.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-factions-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-personal-dashboard-enabled">📊 Personal Dashboard</label>
                    <p class="tm-setting-description">Δείτε analytics, charts και performance statistics.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-personal-dashboard-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-boss-battles-enabled">⚔️ Boss Battles</label>
                    <p class="tm-setting-description">Αποδεχτείτε epic challenges με legendary rewards!</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-boss-battles-enabled"></div>
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
                <label for="tm-setting-mascot-speed">Ταχύτητα Περιπλάνησης</label>
                <p class="tm-setting-description">Ορίστε την ταχύτητα κίνησης του mascot (pixels ανά δευτερόλεπτο).</p>
            </div>
            <div class="tm-setting-control">
                <input type="number" id="tm-setting-mascot-speed" min="25" max="500" step="25">
            </div>
        </div>
        </div>`;
}

function getGamificationSettingsHTML(STORAGE_KEYS) {
    return getLevelUpSettingsHTML() + getMascotSettingsHTML() + getTalentsHTML(STORAGE_KEYS);
}

function initGamificationSettings(config, STORAGE_KEYS) {
    // Populate Checkboxes
    const populateCheckbox = (id, key) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = config[key];
    };
    populateCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
    populateCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
    populateCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');

    // Populate new feature checkboxes
    populateCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
    populateCheckbox('tm-setting-factions-enabled', 'factionsEnabled');
    populateCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
    populateCheckbox('tm-setting-boss-battles-enabled', 'bossBattlesEnabled');

    document.getElementById('tm-setting-mascot-speed').value = config.mascotRoamingSpeed;

    // Talent unlock now handled in dedicated modal (showTalentsModal)
}

function saveGamificationSettings() {
    const saveCheckbox = (id, key) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            const value = checkbox.checked;
            GM_setValue(key, value);
            config[key] = value;
        }
    };

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

    // --- Save Gamification/Fun Settings ---
    saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
    saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
    saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
    saveNumber('tm-setting-mascot-speed', 'mascotRoamingSpeed');

    // Weather location is now hardcoded to Athens
}

// Make functions globally accessible for external scripts
// ===================================================================
// === FEATURE: RANDOM EVENTS
// ===================================================================

const RANDOM_EVENTS = {
    RUSH_HOUR: {
        id: 'rush_hour',
        name: 'Rush Hour!',
        description: 'Earn 2x coins for the next hour!',
        icon: '⚡',
        duration: 60 * 60 * 1000, // 1 hour
        effect: { coinMultiplier: 2 },
        weight: 20 // Spawn chance weight
    },
    PERFECT_DAY: {
        id: 'perfect_day',
        name: 'Perfect Day Challenge',
        description: 'Complete 5 repairs flawlessly for 500 bonus coins!',
        icon: '🎯',
        duration: 4 * 60 * 60 * 1000, // 4 hours
        effect: { perfectRepairsNeeded: 5, reward: 500 },
        weight: 15
    },
    MYSTERY_CUSTOMER: {
        id: 'mystery_customer',
        name: 'Mystery Customer',
        description: 'Next repair is worth 5x rewards!',
        icon: '🎭',
        duration: 2 * 60 * 60 * 1000, // 2 hours
        effect: { nextRepairMultiplier: 5 },
        weight: 10
    },
    TREASURE_HUNT: {
        id: 'treasure_hunt',
        name: 'Mascot Found Treasure!',
        description: 'Your mascot found hidden coins!',
        icon: '💎',
        duration: 0, // Instant
        effect: { instantCoins: () => Math.floor(Math.random() * 300) + 100 },
        weight: 25
    },
    DOUBLE_XP: {
        id: 'double_xp',
        name: 'Knowledge Surge',
        description: 'Earn 2x XP for 30 minutes!',
        icon: '📚',
        duration: 30 * 60 * 1000, // 30 minutes
        effect: { xpMultiplier: 2 },
        weight: 20
    },
    LUCKY_REPAIR: {
        id: 'lucky_repair',
        name: 'Lucky Repair',
        description: 'Next repair grants a random rare item!',
        icon: '🍀',
        duration: 1 * 60 * 60 * 1000, // 1 hour
        effect: { nextRepairItem: true },
        weight: 10
    }
};

function checkRandomEvent(config, STORAGE_KEYS) {
    const now = Date.now();
    const lastCheck = GM_getValue(STORAGE_KEYS.LAST_EVENT_CHECK, 0);
    const activeEvent = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_EVENT, 'null'));
    
    // Check if active event expired
    if (activeEvent && now > activeEvent.expiresAt) {
        GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, 'null');
        if (window.showPositiveMessage) {
            window.showPositiveMessage(`Event "${activeEvent.name}" has ended!`);
        }
        updateEventNotification(null);
    }
    
    // Check for new event every 30 minutes
    if (now - lastCheck < 30 * 60 * 1000) return;
    
    GM_setValue(STORAGE_KEYS.LAST_EVENT_CHECK, now);
    
    // Don't spawn if event already active
    if (activeEvent && now < activeEvent.expiresAt) return;
    
    // 15% chance to spawn event
    if (Math.random() > 0.15) return;
    
    // Select random event weighted by spawn chance
    const events = Object.values(RANDOM_EVENTS);
    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEvent = null;
    for (const event of events) {
        random -= event.weight;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }
    
    if (!selectedEvent) return;
    
    // Activate event
    const eventData = {
        ...selectedEvent,
        startedAt: now,
        expiresAt: now + selectedEvent.duration,
        progress: 0
    };
    
    // Handle instant events
    if (selectedEvent.duration === 0) {
        if (selectedEvent.effect.instantCoins) {
            const coins = selectedEvent.effect.instantCoins();
            grantCoins(config, STORAGE_KEYS, coins);
            if (window.showPositiveMessage) {
                window.showPositiveMessage(`${selectedEvent.icon} ${selectedEvent.name}! +${coins} coins!`);
            }
        }
        
        // Log to history
        const history = JSON.parse(GM_getValue(STORAGE_KEYS.EVENT_HISTORY, '[]'));
        history.push({ ...eventData, completedAt: now });
        GM_setValue(STORAGE_KEYS.EVENT_HISTORY, JSON.stringify(history.slice(-50)));
        return;
    }
    
    GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, JSON.stringify(eventData));
    
    // Show notification
    if (window.showPositiveMessage) {
        const duration = Math.floor(selectedEvent.duration / 60000);
        window.showPositiveMessage(`${selectedEvent.icon} ${selectedEvent.name}! ${selectedEvent.description} (${duration}m)`);
    }
    
    updateEventNotification(eventData);
}

function updateEventNotification(eventData) {
    let container = document.getElementById('tm-event-notification');
    
    if (!eventData) {
        if (container) container.remove();
        return;
    }
    
    // Store minimized state before updating, or check storage if first load
    let wasMinimized = false;
    if (container) {
        wasMinimized = container.getAttribute('data-minimized') === 'true';
    } else {
        // Check if it was minimized in a previous session
        wasMinimized = GM_getValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
    }
    
    const isNewContainer = !container;
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'tm-event-notification';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 2px solid #9c89ff;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 9998;
            width: 550px;
            min-height: 52px;
            animation: bossSlideDown 0.5s ease-out;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            box-sizing: border-box;
            display: flex;
            align-items: center;
        `;
        container.setAttribute('data-minimized', wasMinimized ? 'true' : 'false');
        document.body.appendChild(container);
    }
    
    // Check if boss notification exists and adjust position
    const bossNotification = document.getElementById('tm-boss-notification');
    if (bossNotification && bossNotification.style.display !== 'none') {
        container.style.top = '80px'; // Position below boss notification
    } else {
        container.style.top = '20px'; // Use same position as boss
    }
    
    const timeLeft = Math.max(0, eventData.expiresAt - Date.now());
    const formattedTime = formatTimeRemaining(timeLeft);
    
    container.innerHTML = `
        <div style="font-size: 36px; line-height: 1; flex-shrink: 0;">${eventData.icon}</div>
        <div style="flex: 1; min-width: 0; margin: 0 12px;">
            <div style="font-weight: bold; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">🎲 ${eventData.name}</div>
            <div style="font-size: 12px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${eventData.description}</div>
        </div>
        <span style="font-size: 13px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 5px 12px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; margin-right: 12px;">
            ⏱️ ${formattedTime}
        </span>
        <button id="tm-hide-event-btn" style="
            background: rgba(0,0,0,0.3);
            color: white;
            border: none;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            flex-shrink: 0;
            margin-left: 8px;
        " title="Hide notification">×</button>
    `;
    
    // Restore minimized state if it was minimized before update
    if (wasMinimized) {
        container.style.top = '-40px';
        container.style.cursor = 'pointer';
        container.style.padding = '4px 16px';
        container.style.minHeight = '40px';
        container.setAttribute('data-minimized', 'true');
    }
    
    // Hide/Minimize button
    const hideBtn = container.querySelector('#tm-hide-event-btn');
    
    const minimizeNotification = () => {
        container.style.top = '-40px';
        container.style.cursor = 'pointer';
        container.style.padding = '4px 16px';
        container.style.minHeight = '40px';
        container.setAttribute('data-minimized', 'true');
        // Save minimized state to storage
        GM_setValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, true);
    };
    
    const expandNotification = () => {
        // Check if boss notification exists to determine correct position
        const bossNotification = document.getElementById('tm-boss-notification');
        const correctTop = (bossNotification && bossNotification.style.display !== 'none') ? '80px' : '20px';
        
        container.style.top = correctTop;
        container.style.cursor = 'default';
        container.style.padding = '8px 16px';
        container.style.minHeight = '52px';
        container.setAttribute('data-minimized', 'false');
        // Save expanded state to storage
        GM_setValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
    };
    
    if (hideBtn) {
        hideBtn.addEventListener('mouseenter', () => {
            hideBtn.style.background = 'rgba(0,0,0,0.6)';
        });
        hideBtn.addEventListener('mouseleave', () => {
            hideBtn.style.background = 'rgba(0,0,0,0.3)';
        });
        hideBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeNotification();
        });
    }
    
    // Expand on hover or click when minimized
    container.addEventListener('mouseenter', () => {
        if (container.getAttribute('data-minimized') === 'true') {
            expandNotification();
        }
    });
    
    container.addEventListener('click', (e) => {
        if (container.getAttribute('data-minimized') === 'true') {
            expandNotification();
        }
    });
    
    // Update every second
    setTimeout(() => {
        if (timeLeft > 0) {
            // Only show notification if it's not manually hidden
            if (container && container.style.display !== 'none') {
                updateEventNotification(eventData);
            }
        } else {
            // Event expired - clear everything
            container.remove();
            GM_setValue(window.STORAGE_KEYS.ACTIVE_EVENT, 'null');
            GM_setValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
            
            if (window.showPositiveMessage) {
                window.showPositiveMessage('⏰ Random event expired!');
            }
        }
    }, 1000);
}

// ===================================================================
// === (REMOVED: SMART TEMPLATES)
// ===================================================================

// ===================================================================
// === FEATURE: FACTIONS/HOUSES SYSTEM
// ===================================================================

const FACTIONS = {
    IOS_SQUAD: {
        id: 'ios_squad',
        name: 'iOS Squadron',
        icon: '🍎',
        color: '#007aff',
        description: 'Masters of Apple device repairs',
        perks: { iosRepairBonus: 1.2, applePartDiscount: 0.9 }
    },
    ANDROID_ALLIANCE: {
        id: 'android_alliance',
        name: 'Android Alliance',
        icon: '🤖',
        color: '#3ddc84',
        description: 'Experts in Android ecosystem',
        perks: { androidRepairBonus: 1.2, samsungExpertise: true }
    },
    SCREEN_WIZARDS: {
        id: 'screen_wizards',
        name: 'Screen Wizards',
        icon: '🪄',
        color: '#9c27b0',
        description: 'Screen replacement specialists',
        perks: { screenRepairSpeed: 1.3, glassHandling: true }
    },
    WATER_WARRIORS: {
        id: 'water_warriors',
        name: 'Water Warriors',
        icon: '💧',
        color: '#00bcd4',
        description: 'Water damage recovery experts',
        perks: { waterDamageBonus: 1.5, diagnosticSpeed: 1.2 }
    },
    SPEED_DEMONS: {
        id: 'speed_demons',
        name: 'Speed Demons',
        icon: '⚡',
        color: '#ff5722',
        description: 'Fast turnaround specialists',
        perks: { speedBonus: 1.3, rushOrderExpert: true }
    }
};

function showFactionsModal(config, STORAGE_KEYS) {
    const currentFaction = GM_getValue(STORAGE_KEYS.USER_FACTION, null);
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 700px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h3>🏰 Choose Your Faction</h3>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div class="tm-modal-body" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;">
                ${currentFaction ? `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                        <strong>Current Faction:</strong> ${FACTIONS[currentFaction.toUpperCase().replace(/ /g, '_')]?.icon} ${FACTIONS[currentFaction.toUpperCase().replace(/ /g, '_')]?.name}
                        <div style="font-size: 12px; margin-top: 4px;">Contribution: ${GM_getValue(STORAGE_KEYS.FACTION_CONTRIBUTION, 0)} points</div>
                    </div>
                ` : '<div style="text-align: center; margin-bottom: 15px; color: #666;">Choose a faction to unlock special perks!</div>'}
                <div id="tm-factions-grid" style="display: grid; grid-template-columns: 1fr; gap: 12px;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    populateFactions(STORAGE_KEYS, currentFaction);
}

function populateFactions(STORAGE_KEYS, currentFaction) {
    const grid = document.getElementById('tm-factions-grid');
    if (!grid) return;
    
    grid.innerHTML = Object.values(FACTIONS).map(faction => {
        const isActive = currentFaction === faction.id;
        return `
            <div class="tm-faction-card" data-faction="${faction.id}" style="
                background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                padding: 16px;
                border-radius: 12px;
                border-left: 4px solid ${faction.color};
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: all 0.3s;
                ${isActive ? `border: 2px solid ${faction.color}; box-shadow: 0 0 0 3px ${faction.color}33;` : ''}
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <div style="font-size: 32px;">${faction.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 16px; color: ${faction.color};">
                            ${faction.name} ${isActive ? '✓' : ''}
                        </div>
                        <div style="font-size: 12px; color: #64748b;">${faction.description}</div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
                    ${Object.entries(faction.perks).map(([key, value]) => 
                        `• ${key.replace(/([A-Z])/g, ' $1').trim()}: ${typeof value === 'number' ? `+${Math.round((value - 1) * 100)}%` : '✓'}`
                    ).join('<br>')}
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    grid.querySelectorAll('.tm-faction-card').forEach(card => {
        card.addEventListener('click', () => {
            const factionId = card.dataset.faction;
            if (currentFaction && currentFaction !== factionId) {
                if (!confirm('Switch factions? Your contribution will reset!')) return;
                GM_setValue(STORAGE_KEYS.FACTION_CONTRIBUTION, 0);
            }
            GM_setValue(STORAGE_KEYS.USER_FACTION, factionId);
            if (window.showPositiveMessage) {
                const faction = FACTIONS[factionId.toUpperCase().replace(/ /g, '_')];
                window.showPositiveMessage(`${faction.icon} Joined ${faction.name}!`);
            }
            document.querySelector('.tm-modal-overlay').remove();
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
    });
}

// ===================================================================
// === FEATURE: PERSONAL DASHBOARD WITH ANALYTICS
// ===================================================================

function showDashboardModal(config, STORAGE_KEYS) {
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 700px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h3>📊 Personal Dashboard</h3>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div class="tm-modal-body" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;">
                <!-- Dashboard Tabs -->
                <div class="tm-dashboard-tabs" style="display: flex; gap: 5px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                    <button class="tm-dashboard-tab active" data-tab="overview" style="
                        padding: 10px 20px;
                        background: none;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        font-weight: 600;
                        color: #64748b;
                        transition: all 0.2s;
                    ">📈 Overview</button>
                    <button class="tm-dashboard-tab" data-tab="performance" style="
                        padding: 10px 20px;
                        background: none;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        font-weight: 600;
                        color: #64748b;
                        transition: all 0.2s;
                    ">📊 Performance</button>
                    <button class="tm-dashboard-tab" data-tab="faction" style="
                        padding: 10px 20px;
                        background: none;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        font-weight: 600;
                        color: #64748b;
                        transition: all 0.2s;
                    ">🏰 Faction</button>
                </div>
                
                <!-- Tab Content -->
                <div id="tm-dashboard-content"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    // Tab switching
    overlay.querySelectorAll('.tm-dashboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            overlay.querySelectorAll('.tm-dashboard-tab').forEach(t => {
                t.classList.remove('active');
                t.style.color = '#64748b';
                t.style.borderBottomColor = 'transparent';
            });
            tab.classList.add('active');
            tab.style.color = '#4facfe';
            tab.style.borderBottomColor = '#4facfe';
            
            populateDashboard(config, STORAGE_KEYS, tab.dataset.tab);
        });
    });
    
    populateDashboard(config, STORAGE_KEYS, 'overview');
}

function populateDashboard(config, STORAGE_KEYS, activeTab = 'overview', overlay = null) {
    const container = document.getElementById('tm-dashboard-content');
    if (!container) return;
    
    // Get stats
    const level = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const xp = GM_getValue(STORAGE_KEYS.USER_XP, 0);
    const coins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);
    const dailyStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
    
    // Get achievements with fallback handling
    let achievements = {};
    try {
        const achievementsData = GM_getValue(STORAGE_KEYS.ACHIEVEMENTS, '{}');
        achievements = JSON.parse(achievementsData);
        console.log('[MMS Dashboard] Achievements loaded:', achievements);
        console.log('[MMS Dashboard] Achievements count:', Object.keys(achievements).length);
    } catch (e) {
        console.error('[MMS Dashboard] Error parsing achievements:', e);
        achievements = {};
    }
    
    const faction = GM_getValue(STORAGE_KEYS.USER_FACTION, null);
    
    const today = new Date().toISOString().slice(0, 10);
    // Fix: dailyStats is stored flat with a 'date' property, not nested by date
    const stats = (dailyStats.date === today) ? dailyStats : {};
    
    // Calculate insights (fixed property names)
    const totalRepairs = stats.repairsCompleted || 0;
    const totalSearches = stats.searches || 0;
    const totalOrders = stats.ordersCreated || 0;
    
    // Get lifetime status transfer counts
    const status40Count = GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
    const status100Count = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
    
    if (activeTab === 'overview') {
        container.innerHTML = `
            <!-- Quick Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Level</div>
                    <div style="font-size: 42px; font-weight: bold;">${level}</div>
                    <div style="font-size: 13px; margin-top: 6px; opacity: 0.9;">${xp} XP</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Balance</div>
                    <div style="font-size: 42px; font-weight: bold;">🪙</div>
                    <div style="font-size: 20px; margin-top: 6px; font-weight: 600;">${coins}</div>
                </div>
            </div>
            
            <!-- Today's Summary -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 16px 0; color: #2c3e50; text-align: center;">📅 Today's Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="text-align: center; padding: 12px; background: rgba(79, 172, 254, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #4facfe;">${totalRepairs}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Repairs</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(102, 187, 106, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #66bb6a;">${totalSearches}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Searches</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255, 152, 0, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #ff9800;">${totalOrders}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Orders</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(233, 30, 99, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #e91e63;">${Object.keys(achievements).length}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Achievements</div>
                    </div>
                </div>
            </div>
            
            <!-- Lifetime Status Transfers -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 16px;">
                <h4 style="margin: 0 0 16px 0; color: #2c3e50; text-align: center;">📊 Lifetime Status Transfers</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%); border-radius: 8px; border-left: 4px solid #4CAF50;">
                        <div style="font-size: 14px; color: #388E3C; font-weight: 600; margin-bottom: 8px;">↗️ Status 40</div>
                        <div style="font-size: 36px; font-weight: bold; color: #4CAF50;">${status40Count}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Repairs moved to Status 40</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%); border-radius: 8px; border-left: 4px solid #2196F3;">
                        <div style="font-size: 14px; color: #1976D2; font-weight: 600; margin-bottom: 8px;">✅ Status 100</div>
                        <div style="font-size: 36px; font-weight: bold; color: #2196F3;">${status100Count}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Repairs moved to Status 100</div>
                    </div>
                </div>
            </div>
            
            <!-- Unlocked Achievements List -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 16px;">
                <h4 style="margin: 0 0 16px 0; color: #2c3e50; text-align: center;">🏆 Unlocked Achievements (${Object.keys(achievements).length})</h4>
                ${Object.keys(achievements).length > 0 ? `
                    <div style="display: grid; gap: 8px; max-height: 300px; overflow-y: auto;">
                        ${Object.keys(achievements).map(key => {
                            const [stat, count] = key.split('-');
                            const icons = { searches: '🔍', repairsCompleted: '🛠️', ordersCreated: '📝' };
                            const labels = { searches: 'Searches', repairsCompleted: 'Repairs', ordersCreated: 'Orders' };
                            return `
                                <div style="padding: 10px 12px; background: rgba(233, 30, 99, 0.05); border-left: 3px solid #e91e63; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 20px;">${icons[stat] || '✨'}</span>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #2c3e50; font-size: 13px;">${labels[stat] || stat}: ${count}</div>
                                        <div style="font-size: 11px; color: #64748b;">${key}</div>
                                    </div>
                                    <span style="color: #e91e63; font-weight: bold;">✓</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
                        <div>No achievements unlocked yet!</div>
                        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">Start completing searches, repairs, and orders to unlock achievements!</div>
                    </div>
                `}
            </div>
        `;
    } else if (activeTab === 'performance') {
        container.innerHTML = `
            <!-- Performance Chart -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px;">
                <h4 style="margin: 0 0 16px 0; color: #2c3e50; text-align: center;">📈 7-Day Repair Trend</h4>
                <div id="tm-performance-chart" style="height: 180px;"></div>
            </div>
            
            <!-- Performance Insights -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 12px 0; color: #2c3e50;">💡 Insights</h4>
                <div style="font-size: 14px; color: #64748b; line-height: 1.8;">
                    ${totalRepairs > 0 ? `✅ Great job today! You've completed <strong style="color: #4facfe;">${totalRepairs}</strong> repairs.` : '📊 Start completing repairs to see insights!'}
                    <br>
                    ${totalSearches > 5 ? `🔍 You're very active with <strong style="color: #66bb6a;">${totalSearches}</strong> searches today!` : ''}
                    <br>
                    ${Object.keys(achievements).length > 10 ? `🏆 Impressive! <strong style="color: #ffc107;">${Object.keys(achievements).length}</strong> achievements unlocked!` : ''}
                </div>
            </div>
        `;
        drawPerformanceChart();
    } else if (activeTab === 'faction') {
        const factionData = faction ? FACTIONS[faction.toUpperCase().replace(/ /g, '_')] : null;
        const contribution = GM_getValue(STORAGE_KEYS.FACTION_CONTRIBUTION, 0);
        
        container.innerHTML = factionData ? `
            <!-- Faction Info -->
            <div style="background: linear-gradient(135deg, ${factionData.color}dd 0%, ${factionData.color}99 100%); color: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 16px; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 12px;">${factionData.icon}</div>
                <h2 style="margin: 0 0 8px 0; font-size: 24px;">${factionData.name}</h2>
                <p style="font-size: 14px; opacity: 0.9; margin: 0 0 16px 0;">${factionData.description}</p>
                <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Your Contribution</div>
                    <div style="font-size: 28px; font-weight: bold;">${contribution}</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">points</div>
                </div>
            </div>
            
            <!-- Faction Perks -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 12px 0; color: #2c3e50;">🎁 Active Perks</h4>
                <div style="display: grid; gap: 8px;">
                    ${Object.entries(factionData.perks).map(([key, value]) => `
                        <div style="padding: 10px; background: rgba(${parseInt(factionData.color.slice(1,3), 16)}, ${parseInt(factionData.color.slice(3,5), 16)}, ${parseInt(factionData.color.slice(5,7), 16)}, 0.1); border-left: 3px solid ${factionData.color}; border-radius: 6px;">
                            <strong style="color: ${factionData.color};">✓ ${key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                                ${typeof value === 'number' ? `+${Math.round((value - 1) * 100)}% bonus` : 'Unlocked'}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button id="tm-switch-faction-btn" style="
                    width: 100%;
                    margin-top: 16px;
                    padding: 10px;
                    background: linear-gradient(135deg, ${factionData.color} 0%, ${factionData.color}cc 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                ">Switch Faction</button>
            </div>
        ` : `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">🏰</div>
                <h3 style="color: #2c3e50; margin-bottom: 12px;">No Faction Selected</h3>
                <p style="color: #64748b; margin-bottom: 24px;">Join a faction to unlock special perks and bonuses!</p>
                <button id="tm-choose-faction-btn" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 16px;
                ">Choose Your Faction</button>
            </div>
        `;
        
        // Add event listeners after HTML is set
        setTimeout(() => {
            const switchBtn = document.getElementById('tm-switch-faction-btn');
            const chooseBtn = document.getElementById('tm-choose-faction-btn');
            
            if (switchBtn) {
                switchBtn.addEventListener('click', () => {
                    showFactionsModal(config, STORAGE_KEYS);
                });
            }
            
            if (chooseBtn) {
                chooseBtn.addEventListener('click', () => {
                    showFactionsModal(config, STORAGE_KEYS);
                });
            }
        }, 0);
    } else if (activeTab === 'talents') {
        // Talents Tab Content
        const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
        const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
        const availableTalents = TALENT_TREE.filter(t => level >= t.levelRequired).length;
        const totalTalents = TALENT_TREE.length;
        
        container.innerHTML = `
            <!-- Talent Points Display -->
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-bottom: 16px;">
                <div style="
                    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                ">
                    <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Available Points</div>
                    <div style="font-size: 38px; font-weight: bold;">⭐ ${talentPoints}</div>
                    <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Earn 1 per level</div>
                </div>
                
                <div style="
                    background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    min-width: 180px;
                ">
                    <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Progress</div>
                    <div style="font-size: 24px; font-weight: bold; color: #4facfe;">${unlockedTalents.length}/${availableTalents}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${totalTalents - availableTalents} locked by level</div>
                </div>
            </div>
            
            <!-- Talents Grid -->
            <div id="tm-talents-dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;"></div>
        `;
        
        populateTalentsDashboard(STORAGE_KEYS, level);
    } else if (activeTab === 'shop') {
        // Shop Tab Content
        container.innerHTML = `
            <div class="tm-shop-tabs" style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0;">
                <button class="tm-shop-tab active" data-category="themes" style="
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid #4facfe;
                    cursor: pointer;
                    font-weight: 600;
                    color: #4facfe;
                    transition: all 0.2s;
                ">🎨 Themes</button>
                <button class="tm-shop-tab" data-category="accessories" style="
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                ">🎩 Accessories</button>
                <button class="tm-shop-tab" data-category="consumables" style="
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                ">⚡ Consumables</button>
            </div>
            <div id="tm-shop-dashboard-wrapper">
                <!-- Shop items will be populated here -->
            </div>
        `;
        
        populateShopDashboard(config, STORAGE_KEYS);
        
        // Add tab switching logic
        container.querySelectorAll('.tm-shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.tm-shop-tab').forEach(t => {
                    t.style.color = '#64748b';
                    t.style.borderBottomColor = 'transparent';
                    t.classList.remove('active');
                });
                tab.style.color = '#4facfe';
                tab.style.borderBottomColor = '#4facfe';
                tab.classList.add('active');
                
                const category = tab.dataset.category;
                container.querySelectorAll('.tm-shop-category-content').forEach(content => content.classList.remove('active'));
                container.querySelector(`#tm-shop-category-${category}`)?.classList.add('active');
            });
        });
    } else if (activeTab === 'quests') {
        // Quests Tab Content
        const activeBoss = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_BOSS, 'null'));
        const activeEvent = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_EVENT, 'null'));
        const dailyBounties = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_BOUNTIES, '[]'));
        
        container.innerHTML = `
            <!-- Active Quests -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px;">
                <h4 style="margin: 0 0 16px 0; color: #2c3e50;">⚔️ Active Quests</h4>
                ${activeBoss && !activeBoss.abandoned ? `
                    <div style="padding: 16px; background: linear-gradient(135deg, #ff5252 0%, #e53935 100%); color: white; border-radius: 8px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-size: 18px; font-weight: bold;">${activeBoss.boss.icon} ${activeBoss.boss.name}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Boss Battle</div>
                        </div>
                        <div style="font-size: 13px; opacity: 0.95; margin-bottom: 8px;">${activeBoss.boss.description}</div>
                        <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; font-size: 12px;">
                            Progress: ${activeBoss.progress || 0} / ${activeBoss.boss.requiredCount || 0}
                        </div>
                    </div>
                ` : ''}
                ${activeEvent ? `
                    <div style="padding: 16px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 8px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-size: 18px; font-weight: bold;">${activeEvent.event.icon} ${activeEvent.event.title}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Random Event</div>
                        </div>
                        <div style="font-size: 13px; opacity: 0.95;">${activeEvent.event.message}</div>
                    </div>
                ` : ''}
                ${!activeBoss && !activeEvent ? `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <div style="font-size: 48px; margin-bottom: 12px;">📜</div>
                        <div>No active quests at the moment.</div>
                        <div style="font-size: 13px; margin-top: 8px; opacity: 0.8;">Keep working to trigger new quests!</div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Daily Bounties -->
            <div style="background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 16px 0; color: #2c3e50;">🎯 Daily Bounties</h4>
                ${dailyBounties.length > 0 ? dailyBounties.map(bounty => `
                    <div style="padding: 12px; background: ${bounty.completed ? 'rgba(102, 187, 106, 0.1)' : 'rgba(79, 172, 254, 0.1)'}; border-left: 3px solid ${bounty.completed ? '#66bb6a' : '#4facfe'}; border-radius: 6px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 4px;">${bounty.task}</div>
                                <div style="font-size: 12px; color: #64748b;">Reward: ${bounty.xpReward} XP, ${bounty.coinReward} 🪙</div>
                            </div>
                            <div style="font-size: 24px;">${bounty.completed ? '✅' : '⏳'}</div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <div style="font-size: 48px; margin-bottom: 12px;">🎯</div>
                        <div>No daily bounties available.</div>
                    </div>
                `}
            </div>
        `;
    }
}

function drawPerformanceChart() {
    const chartContainer = document.getElementById('tm-performance-chart');
    if (!chartContainer) return;
    
    // Get last 7 days of data
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().slice(0, 10));
    }
    
    // Load history from storage
    const dailyStatsHistory = JSON.parse(GM_getValue('tm_daily_stats_history', '{}'));
    const data = days.map(day => dailyStatsHistory[day]?.repairsCompleted || 0);
    const maxValue = Math.max(...data, 1);
    
    // Simple bar chart using CSS
    chartContainer.innerHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 100%; gap: 4px;">
            ${data.map((value, index) => {
                const height = (value / maxValue) * 100;
                const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(days[index]).getDay()];
                return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                        <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #4facfe;">${value}</div>
                        <div style="
                            width: 100%;
                            height: ${height}%;
                            background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
                            border-radius: 4px 4px 0 0;
                            min-height: ${value > 0 ? '10px' : '2px'};
                            transition: height 0.3s ease;
                        "></div>
                        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${dayLabel}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Helper function to populate talents in dashboard
function populateTalentsDashboard(STORAGE_KEYS, currentLevel) {
    const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    const grid = document.getElementById('tm-talents-dashboard-grid');
    
    if (!grid) return;
    
    grid.innerHTML = TALENT_TREE.map(talent => {
        const isUnlocked = unlockedTalents.includes(talent.id);
        const canAfford = talentPoints >= talent.cost;
        const levelMet = currentLevel >= talent.levelRequired;
        const canUnlock = canAfford && levelMet && !isUnlocked;
        
        // Determine tier color based on level requirement
        let tierColor = '#94a3b8';
        let tierLabel = 'Novice';
        if (talent.levelRequired >= 250) { tierColor = '#e5cc80'; tierLabel = 'DIVINE'; }
        else if (talent.levelRequired >= 200) { tierColor = '#ff1493'; tierLabel = 'GODLIKE'; }
        else if (talent.levelRequired >= 150) { tierColor = '#ff00ff'; tierLabel = 'ULTIMATE'; }
        else if (talent.levelRequired >= 100) { tierColor = '#ff8000'; tierLabel = 'LEGENDARY'; }
        else if (talent.levelRequired >= 75) { tierColor = '#9c27b0'; tierLabel = 'EPIC'; }
        else if (talent.levelRequired >= 50) { tierColor = '#2196f3'; tierLabel = 'RARE'; }
        else if (talent.levelRequired >= 25) { tierColor = '#4caf50'; tierLabel = 'UNCOMMON'; }
        
        return `
            <div class="tm-talent-card ${isUnlocked ? 'unlocked' : ''} ${!levelMet ? 'locked' : ''}" 
                 style="
                     padding: 16px;
                     background: ${isUnlocked ? 'linear-gradient(145deg, #e7f1ff 0%, #d0e8ff 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)'};
                     border: 2px solid ${isUnlocked ? tierColor : '#e2e8f0'};
                     border-radius: 12px;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                     opacity: ${levelMet ? '1' : '0.6'};
                     transition: all 0.3s;
                 ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div style="font-size: 32px;">${talent.icon}</div>
                    <div style="
                        background: ${tierColor};
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                    ">${tierLabel}</div>
                </div>
                
                <div style="font-weight: 700; font-size: 15px; color: #2c3e50; margin-bottom: 4px;">${talent.name}</div>
                <div style="font-size: 12px; color: #64748b; min-height: 40px; margin-bottom: 12px; line-height: 1.4;">${talent.description}</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #94a3b8;">
                        Cost: <strong style="color: #ffd700;">${talent.cost} ⭐</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">
                        Req: <strong>Lv.${talent.levelRequired}</strong>
                    </div>
                </div>
                
                <button class="tm-talent-unlock-btn-dashboard" data-talent-id="${talent.id}" 
                        style="
                            width: 100%;
                            padding: 10px;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: ${canUnlock ? 'pointer' : 'not-allowed'};
                            background: ${isUnlocked ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)' : canUnlock ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : '#e2e8f0'};
                            color: ${isUnlocked || canUnlock ? 'white' : '#94a3b8'};
                            transition: all 0.2s;
                        "
                        ${!canUnlock && !isUnlocked ? 'disabled' : ''}>
                    ${isUnlocked ? '✓ Unlocked' : !levelMet ? `🔒 Level ${talent.levelRequired}` : !canAfford ? `Need ${talent.cost - talentPoints} more ⭐` : `Unlock (${talent.cost} ⭐)`}
                </button>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    grid.querySelectorAll('.tm-talent-unlock-btn-dashboard').forEach(btn => {
        btn.addEventListener('click', () => {
            const talentId = btn.dataset.talentId;
            const talent = TALENT_TREE.find(t => t.id === talentId);
            const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
            const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
            const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
            
            if (!talent || unlockedTalents.includes(talentId)) return;
            if (talentPoints < talent.cost || currentLevel < talent.levelRequired) return;
            
            // Deduct points and unlock
            GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, talentPoints - talent.cost);
            unlockedTalents.push(talentId);
            GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlockedTalents));
            
            // Refresh the talents display
            populateTalentsDashboard(STORAGE_KEYS, currentLevel);
            
            // Update the points display
            const pointsDisplay = document.querySelector('#tm-talents-dashboard-grid').parentElement.previousElementSibling;
            if (pointsDisplay) {
                const newPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                const newUnlocked = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                const availableTalents = TALENT_TREE.filter(t => currentLevel >= t.levelRequired).length;
                pointsDisplay.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                    ">
                        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Available Points</div>
                        <div style="font-size: 38px; font-weight: bold;">⭐ ${newPoints}</div>
                        <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Earn 1 per level</div>
                    </div>
                    
                    <div style="
                        background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        min-width: 180px;
                    ">
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Progress</div>
                        <div style="font-size: 24px; font-weight: bold; color: #4facfe;">${newUnlocked.length}/${availableTalents}</div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${TALENT_TREE.length - availableTalents} locked by level</div>
                    </div>
                `;
            }
            
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('success', `${talent.icon} ${talent.name} unlocked!`);
            }
        });
    });
}

// Helper function to populate shop in dashboard
function populateShopDashboard(config, STORAGE_KEYS) {
    const wrapper = document.getElementById('tm-shop-dashboard-wrapper');
    if (!wrapper) return;
    
    const coins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);
    const purchasedItems = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    
    // Create category containers
    wrapper.innerHTML = `
        <div id="tm-shop-category-themes" class="tm-shop-category-content active" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;"></div>
        <div id="tm-shop-category-accessories" class="tm-shop-category-content" style="display: none; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;"></div>
        <div id="tm-shop-category-consumables" class="tm-shop-category-content" style="display: none; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;"></div>
    `;
    
    // Populate themes
    const themesContainer = wrapper.querySelector('#tm-shop-category-themes');
    if (config.mascotEnabled && window.MASCOT_THEMES) {
        themesContainer.innerHTML = window.MASCOT_THEMES.map(theme => {
            const isPurchased = purchasedItems.includes(theme.id) || theme.price === 0;
            return `
                <div style="padding: 16px; background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">${theme.icon}</div>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 6px;">${theme.name}</div>
                    <div style="font-size: 12px; color: #64748b; min-height: 36px; margin-bottom: 12px;">${theme.description}</div>
                    <button class="tm-shop-item-btn ${isPurchased ? 'purchased' : 'buy'}" 
                            data-item-id="${theme.id}" 
                            data-item-type="theme"
                            data-item-price="${theme.price}"
                            style="
                                width: 100%;
                                padding: 10px;
                                border: none;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: ${isPurchased ? 'not-allowed' : 'pointer'};
                                background: ${isPurchased ? '#e2e8f0' : 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)'};
                                color: ${isPurchased ? '#94a3b8' : 'white'};
                            "
                            ${isPurchased ? 'disabled' : ''}>
                        ${isPurchased ? '✓ Owned' : `Buy ${theme.price} 🪙`}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Populate accessories
    const accessoriesContainer = wrapper.querySelector('#tm-shop-category-accessories');
    if (config.mascotEnabled && window.MASCOT_ACCESSORIES) {
        accessoriesContainer.innerHTML = window.MASCOT_ACCESSORIES.map(accessory => {
            const isPurchased = purchasedItems.includes(accessory.id);
            const isEquipped = equippedItems.includes(accessory.id);
            return `
                <div style="padding: 16px; background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">${accessory.icon}</div>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 6px;">${accessory.name}</div>
                    <div style="font-size: 12px; color: #64748b; min-height: 36px; margin-bottom: 12px;">${accessory.description}</div>
                    <button class="tm-shop-item-btn ${!isPurchased ? 'buy' : isEquipped ? 'equipped' : 'equip'}" 
                            data-item-id="${accessory.id}" 
                            data-item-type="accessory"
                            data-item-price="${accessory.price}"
                            style="
                                width: 100%;
                                padding: 10px;
                                border: none;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: pointer;
                                background: ${!isPurchased ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : isEquipped ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
                                color: white;
                            ">
                        ${!isPurchased ? `Buy ${accessory.price} 🪙` : isEquipped ? '✓ Equipped' : 'Equip'}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Populate consumables
    const consumablesContainer = wrapper.querySelector('#tm-shop-category-consumables');
    if (config.mascotEnabled && window.MASCOT_CONSUMABLES) {
        consumablesContainer.innerHTML = window.MASCOT_CONSUMABLES.map(consumable => {
            return `
                <div style="padding: 16px; background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">${consumable.icon}</div>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 6px;">${consumable.name}</div>
                    <div style="font-size: 12px; color: #64748b; min-height: 36px; margin-bottom: 8px;">${consumable.description}</div>
                    <div style="font-size: 11px; color: #4facfe; background: rgba(79, 172, 254, 0.1); padding: 6px; border-radius: 6px; margin-bottom: 12px;">
                        ℹ️ ${consumable.info || 'Use to boost your performance!'}
                    </div>
                    <button class="tm-shop-item-btn use" 
                            data-item-id="${consumable.id}" 
                            data-item-type="consumable"
                            data-item-price="${consumable.price}"
                            style="
                                width: 100%;
                                padding: 10px;
                                border: none;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: pointer;
                                background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
                                color: white;
                            ">
                        Use ${consumable.price} 🪙
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Add event listeners for shop buttons
    wrapper.addEventListener('click', (e) => {
        if (e.target.matches('.tm-shop-item-btn')) {
            if (e.target.classList.contains('buy')) {
                handleShopPurchase(e.target, config, STORAGE_KEYS, () => {
                    populateShopDashboard(config, STORAGE_KEYS);
                });
            } else if (e.target.classList.contains('equip') || e.target.classList.contains('equipped')) {
                const button = e.target;
                const itemId = button.dataset.itemId;
                const itemType = button.dataset.itemType;

                if (itemType === 'accessory') {
                    let equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                    const accessoryElement = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                    
                    if (!accessoryElement) {
                        console.error(`[MMS Shop] Failed to get accessory element for ${itemId}`);
                        return;
                    }

                    if (equippedItems.includes(itemId)) {
                        // Unequip
                        equippedItems = equippedItems.filter(id => id !== itemId);
                        GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));
                        
                        // Remove from mascot
                        if (typeof window.removeAccessoryFromMascot === 'function') {
                            window.removeAccessoryFromMascot(itemId);
                        }
                    } else {
                        // Equip
                        equippedItems.push(itemId);
                        GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));
                        
                        // Add to mascot
                        if (typeof window.addAccessoryToMascot === 'function') {
                            window.addAccessoryToMascot(itemId, accessoryElement);
                        }
                    }
                    
                    populateShopDashboard(config, STORAGE_KEYS);
                }
            } else if (e.target.classList.contains('use')) {
                const button = e.target;
                const itemId = button.dataset.itemId;
                const price = parseInt(button.dataset.itemPrice, 10);
                const coins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);
                
                if (coins < price) {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('error', 'Not enough coins!');
                    }
                    return;
                }
                
                GM_setValue(STORAGE_KEYS.USER_COINS, coins - price);
                
                if (typeof window.applyConsumableEffect === 'function') {
                    window.applyConsumableEffect(itemId, config, STORAGE_KEYS);
                }
                
                populateShopDashboard(config, STORAGE_KEYS);
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification('success', `Consumable used!`);
                }
            }
        }
    });
}

// ===================================================================
// === FEATURE: BOSS BATTLES SYSTEM
// ===================================================================

const BOSS_BATTLES = {
    WATER_TITAN: {
        id: 'water_titan',
        name: 'Water Titan',
        icon: '🌊',
        description: 'Severe water damage on flagship device',
        difficulty: 3,
        timeLimit: 30 * 60 * 1000, // 30 minutes
        rewards: { coins: 1000, xp: 500, item: 'legendary_repair_kit' },
        requiredAction: 'repairsCompleted',
        requiredCount: 3,
        taskDescription: 'Complete 3 repairs to defeat this boss'
    },
    BOARD_BEAST: {
        id: 'board_beast',
        name: 'Board Beast',
        icon: '⚡',
        description: 'Complex motherboard repair challenge',
        difficulty: 5,
        timeLimit: 45 * 60 * 1000, // 45 minutes
        rewards: { coins: 2000, xp: 1000, item: 'master_soldering_iron' },
        requiredAction: 'repairsCompleted',
        requiredCount: 5,
        taskDescription: 'Complete 5 repairs to defeat this boss'
    },
    SCREEN_DEMON: {
        id: 'screen_demon',
        name: 'Screen Demon',
        icon: '👹',
        description: 'Multiple screen replacements under pressure',
        difficulty: 2,
        timeLimit: 20 * 60 * 1000, // 20 minutes
        rewards: { coins: 750, xp: 350, item: 'precision_toolkit' },
        requiredAction: 'repairsCompleted',
        requiredCount: 2,
        taskDescription: 'Complete 2 repairs to defeat this boss'
    },
    DATA_DRAGON: {
        id: 'data_dragon',
        name: 'Data Dragon',
        icon: '🐉',
        description: 'Data recovery from corrupted device',
        difficulty: 4,
        timeLimit: 60 * 60 * 1000, // 60 minutes
        rewards: { coins: 1500, xp: 750, item: 'data_recovery_master' },
        requiredAction: 'searches',
        requiredCount: 10,
        taskDescription: 'Perform 10 searches to defeat this boss'
    },
    ORDER_OVERLORD: {
        id: 'order_overlord',
        name: 'Order Overlord',
        icon: '📦',
        description: 'Massive order processing backlog',
        difficulty: 3,
        timeLimit: 40 * 60 * 1000, // 40 minutes
        rewards: { coins: 1200, xp: 600, item: 'organization_master' },
        requiredAction: 'ordersCreated',
        requiredCount: 4,
        taskDescription: 'Create 4 orders to defeat this boss'
    }
};

function checkBossSpawn(config, STORAGE_KEYS) {
    const activeBoss = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_BOSS, 'null'));
    
    // Don't spawn if boss already active
    if (activeBoss && Date.now() < activeBoss.expiresAt) return;
    
    // 5% chance to spawn boss per hour
    if (Math.random() > 0.05) return;
    
    // Select random boss
    const bosses = Object.values(BOSS_BATTLES);
    const selectedBoss = bosses[Math.floor(Math.random() * bosses.length)];
    
    const bossData = {
        ...selectedBoss,
        spawnedAt: Date.now(),
        expiresAt: Date.now() + selectedBoss.timeLimit,
        progress: 0, // Initialize progress counter
        accepted: false // Track if user accepted the challenge
    };
    
    GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, JSON.stringify(bossData));
    
    // Show notification
    if (window.showPositiveMessage) {
        window.showPositiveMessage(`⚔️ BOSS BATTLE! ${selectedBoss.icon} ${selectedBoss.name} has appeared!`);
    }
    
    showBossBattleNotification(bossData);
}

// Function to update boss progress when user performs actions
function updateBossProgress(STORAGE_KEYS, actionType) {
    const activeBoss = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_BOSS, 'null'));
    
    if (!activeBoss || !activeBoss.accepted) return;
    if (activeBoss.abandoned) return; // Don't track progress for abandoned bosses
    if (Date.now() > activeBoss.expiresAt) return;
    if (activeBoss.requiredAction !== actionType) return;
    
    // Increment progress
    activeBoss.progress = (activeBoss.progress || 0) + 1;
    GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, JSON.stringify(activeBoss));
    
    // Check if completed
    if (activeBoss.progress >= activeBoss.requiredCount) {
        if (window.showPositiveMessage) {
            window.showPositiveMessage(`⚔️ Boss objective complete! (${activeBoss.progress}/${activeBoss.requiredCount}) - Return to claim your rewards!`);
        }
    } else {
        // Show progress update
        if (window.showPositiveMessage) {
            window.showPositiveMessage(`⚔️ Boss progress: ${activeBoss.progress}/${activeBoss.requiredCount}`, 2000);
        }
    }
    
    // Update the notification display
    showBossBattleNotification(activeBoss);
}

function showBossBattleNotification(bossData) {
    let container = document.getElementById('tm-boss-notification');
    
    if (!bossData) {
        if (container) container.remove();
        // Reposition event notification if it exists
        const eventNotification = document.getElementById('tm-event-notification');
        if (eventNotification && eventNotification.getAttribute('data-minimized') !== 'true') {
            eventNotification.style.top = '20px'; // Move to primary position
        }
        return;
    }
    
    // Store minimized state before updating, or check storage if first load
    let wasMinimized = false;
    if (container) {
        wasMinimized = container.getAttribute('data-minimized') === 'true';
    } else {
        // Check if it was minimized in a previous session
        wasMinimized = GM_getValue(window.STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, false);
    }
    
    const isNewContainer = !container;
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'tm-boss-notification';
        
        // Set initial background/border based on abandoned state
        const initialBackground = bossData.abandoned 
            ? 'linear-gradient(135deg, #424242 0%, #1a1a1a 100%)' 
            : 'linear-gradient(135deg, #ff5252 0%, #b71c1c 100%)';
        const initialBorder = bossData.abandoned ? '2px solid #666' : '2px solid #ff8a80';
        
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${initialBackground};
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            border: ${initialBorder};
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 9998;
            width: 550px;
            min-height: 52px;
            animation: bossSlideDown 0.5s ease-out;
            backdrop-filter: blur(10px);
            transition: background 0.3s ease, border-color 0.3s ease;
            box-sizing: border-box;
            display: flex;
            align-items: center;
        `;
        container.setAttribute('data-minimized', wasMinimized ? 'true' : 'false');
        container.setAttribute('data-abandoned', bossData.abandoned ? 'true' : 'false');
        document.body.appendChild(container);
    }
    
    // Update background and border ONLY if abandoned state changed
    const wasAbandoned = container.getAttribute('data-abandoned') === 'true';
    if (wasAbandoned !== !!bossData.abandoned) {
        const backgroundGradient = bossData.abandoned 
            ? 'linear-gradient(135deg, #424242 0%, #1a1a1a 100%)' 
            : 'linear-gradient(135deg, #ff5252 0%, #b71c1c 100%)';
        const borderColor = bossData.abandoned ? '#666' : '#ff8a80';
        
        container.style.background = backgroundGradient;
        container.style.border = `2px solid ${borderColor}`;
        container.setAttribute('data-abandoned', bossData.abandoned ? 'true' : 'false');
    }
    
    const timeLeft = Math.max(0, bossData.expiresAt - Date.now());
    const formattedTime = formatTimeRemaining(timeLeft);
    
    const progress = bossData.progress || 0;
    const progressPercent = Math.min(100, (progress / bossData.requiredCount) * 100);
    const isCompleted = progress >= bossData.requiredCount;
    
    // Show progress info if boss is accepted
    const progressText = bossData.accepted ? `<span style="font-size: 11px; opacity: 0.9; margin-left: 8px;">(${progress}/${bossData.requiredCount})</span>` : '';
    
    // Different button layouts depending on boss state
    let actionButtonsHTML;
    let abandonMessage = '';
    
    if (bossData.abandoned) {
        // Quest was abandoned - show stored taunting message, no buttons
        const tauntMessage = bossData.tauntMessage || 'You are not worthy...';
        abandonMessage = `
            <div style="
                font-size: 12px;
                color: #999;
                font-style: italic;
                opacity: 0.8;
                text-align: center;
            ">💀 ${tauntMessage}</div>
        `;
        actionButtonsHTML = '';
    } else if (!bossData.accepted) {
        // Not accepted yet - show View Details and Accept buttons
        actionButtonsHTML = `
            <button id="tm-view-boss-btn" style="
                padding: 8px 14px;
                background: linear-gradient(135deg, #424242 0%, #212121 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 13px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s, box-shadow 0.2s;
                flex-shrink: 0;
                margin-right: 8px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.4)';" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)';">👁️ View</button>
            <button id="tm-accept-boss-btn" style="
                padding: 8px 14px;
                background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                color: #000;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 13px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s, box-shadow 0.2s;
                flex-shrink: 0;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.4)';" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)';">⚔️ Accept</button>
        `;
    } else {
        // Already accepted - show single button (View or Claim)
        const buttonText = isCompleted ? '🎉 Claim' : '📊 View';
        const buttonColor = isCompleted ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' : 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)';
        actionButtonsHTML = `
            <button id="tm-accept-boss-btn" style="
                padding: 8px 16px;
                background: ${buttonColor};
                color: ${isCompleted ? 'white' : '#000'};
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 13px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s, box-shadow 0.2s;
                flex-shrink: 0;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.4)';" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)';">${buttonText}</button>
        `;
    }
    
    container.innerHTML = `
        <div style="font-size: 36px; line-height: 1; flex-shrink: 0;">${bossData.icon}</div>
        <div style="flex: 1; min-width: 0; margin: 0 12px;">
            <div style="font-weight: bold; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">⚔️ ${bossData.name}${progressText}</div>
            ${abandonMessage}
        </div>
        <span style="font-size: 13px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 5px 12px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; margin-right: 12px;">
            ⏱️ ${formattedTime}
        </span>
        ${actionButtonsHTML}
        <button id="tm-hide-boss-btn" style="
            background: rgba(0,0,0,0.3);
            color: white;
            border: none;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            flex-shrink: 0;
            margin-left: 8px;
        " title="Hide notification">×</button>
    `;
    
    // Restore minimized state if it was minimized before update
    if (wasMinimized) {
        container.style.top = '-40px';
        container.style.cursor = 'pointer';
        container.style.padding = '4px 16px';
        container.style.minHeight = '40px';
        container.setAttribute('data-minimized', 'true');
    }
    
    // Hide/Minimize button
    const hideBtn = container.querySelector('#tm-hide-boss-btn');
    
    const minimizeNotification = () => {
        container.style.top = '-40px';
        container.style.cursor = 'pointer';
        container.style.padding = '4px 16px';
        container.style.minHeight = '40px';
        container.setAttribute('data-minimized', 'true');
        // Save minimized state to storage
        GM_setValue(window.STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, true);
    };
    
    const expandNotification = () => {
        container.style.top = '20px';
        container.style.cursor = 'default';
        container.style.padding = '8px 16px';
        container.style.minHeight = '52px';
        container.setAttribute('data-minimized', 'false');
        // Save expanded state to storage
        GM_setValue(window.STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, false);
    };
    
    if (hideBtn) {
        hideBtn.addEventListener('mouseenter', () => {
            hideBtn.style.background = 'rgba(0,0,0,0.6)';
        });
        hideBtn.addEventListener('mouseleave', () => {
            hideBtn.style.background = 'rgba(0,0,0,0.3)';
        });
        hideBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeNotification();
        });
    }
    
    // Expand on hover or click when minimized
    container.addEventListener('mouseenter', () => {
        if (container.getAttribute('data-minimized') === 'true') {
            expandNotification();
        }
    });
    
    container.addEventListener('click', () => {
        if (container.getAttribute('data-minimized') === 'true') {
            expandNotification();
        }
    });
    
    // View button (only exists when boss is not accepted)
    const viewBtn = container.querySelector('#tm-view-boss-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Get fresh boss data from storage
            const freshBossData = JSON.parse(GM_getValue(window.STORAGE_KEYS.ACTIVE_BOSS, 'null'));
            if (freshBossData) {
                // Open modal in VIEW-ONLY mode (don't mark as accepted)
                showBossBattleModal(freshBossData, true); // Pass true for viewOnly mode
            }
        });
    }
    
    // Accept/View button
    const acceptBtn = container.querySelector('#tm-accept-boss-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Get fresh boss data from storage to ensure all properties are present
            const freshBossData = JSON.parse(GM_getValue(window.STORAGE_KEYS.ACTIVE_BOSS, 'null'));
            if (freshBossData) {
                showBossBattleModal(freshBossData);
            }
        });
    }
    
    // Reposition event notification if it exists (since boss is now visible)
    const eventNotification = document.getElementById('tm-event-notification');
    if (eventNotification && eventNotification.getAttribute('data-minimized') !== 'true') {
        eventNotification.style.top = '80px'; // Position below boss
    }
    
    // Update every second
    setTimeout(() => {
        if (timeLeft > 0) {
            // Only show notification if it's not manually hidden
            if (container && container.style.display !== 'none') {
                showBossBattleNotification(bossData);
            }
        } else {
            // Boss expired - clear everything
            container.remove();
            GM_setValue(window.STORAGE_KEYS.ACTIVE_BOSS, 'null');
            GM_setValue(window.STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, false);
            
            // Reposition event notification to primary position
            const eventNotification = document.getElementById('tm-event-notification');
            if (eventNotification && eventNotification.getAttribute('data-minimized') !== 'true') {
                eventNotification.style.top = '20px';
            }
            
            // Show expiration message if boss was accepted but not completed
            if (bossData.accepted && !bossData.abandoned) {
                const progress = bossData.progress || 0;
                if (progress < bossData.requiredCount) {
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage('⏰ Boss Battle expired! The challenge has vanished...');
                    }
                }
            }
        }
    }, 1000);
}

function showBossBattleModal(bossData, viewOnly = false) {
    // Don't open modal if boss is abandoned
    if (bossData.abandoned) {
        if (window.showPositiveMessage) {
            window.showPositiveMessage('💀 This challenge was abandoned. You cannot interact with it.');
        }
        return;
    }
    
    // Mark boss as accepted only if not in view-only mode
    let wasJustAccepted = false;
    if (!viewOnly && !bossData.accepted) {
        bossData.accepted = true;
        wasJustAccepted = true;
        GM_setValue(window.STORAGE_KEYS.ACTIVE_BOSS, JSON.stringify(bossData));
        
        // Immediately update the notification banner to reflect acceptance
        showBossBattleNotification(bossData);
        
        // Refresh the page after accepting the boss battle
        setTimeout(() => {
            location.reload();
        }, 500);
        return;
    }
    
    const progress = bossData.progress || 0;
    const requiredCount = bossData.requiredCount || 0;
    const isCompleted = progress >= requiredCount;
    const progressPercent = requiredCount > 0 ? Math.min(100, (progress / requiredCount) * 100) : 0;
    const taskDescription = bossData.taskDescription || 'Complete the objective';
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="
            max-width: 500px; 
            max-height: 85vh;
            background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%);
            border: 3px solid #ff5252;
            box-shadow: 0 0 40px rgba(255, 82, 82, 0.6);
        ">
            <!-- Header -->
            <div class="tm-modal-header" style="
                background: linear-gradient(135deg, #8b0000 0%, #450000 100%);
                color: white; 
                padding: 20px;
                border-bottom: 2px solid #ff5252;
                text-align: center;
            ">
                <div style="font-size: 60px; margin-bottom: 10px;">${bossData.icon}</div>
                <h3 style="font-size: 22px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">
                    ${bossData.name}
                </h3>
                <div style="font-size: 13px; opacity: 0.9; font-style: italic;">${bossData.description}</div>
                <div style="margin-top: 8px; font-size: 16px;">${'⭐'.repeat(bossData.difficulty)}</div>
                <button class="tm-modal-close" style="color: #fff; font-size: 28px; position: absolute; top: 15px; right: 20px;">&times;</button>
            </div>
            
            <!-- Body -->
            <div class="tm-modal-body" style="padding: 20px;">
                <!-- Info Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <!-- Time Limit -->
                    <div style="
                        background: rgba(255, 82, 82, 0.15);
                        border: 1px solid rgba(255, 82, 82, 0.4);
                        padding: 12px;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; color: #ff8a80; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Time Limit</div>
                        <div style="font-size: 20px; font-weight: bold; color: #ff5252;">⏱️ ${formatTimeRemaining(bossData.timeLimit)}</div>
                    </div>
                    
                    <!-- Difficulty -->
                    <div style="
                        background: rgba(255, 215, 0, 0.15);
                        border: 1px solid rgba(255, 215, 0, 0.4);
                        padding: 12px;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <div style="font-size: 11px; color: #ffd700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Difficulty</div>
                        <div style="font-size: 20px; font-weight: bold; color: #ffd700;">★ ${bossData.difficulty}/3</div>
                    </div>
                </div>
                
                <!-- Objective Section -->
                <div style="
                    background: rgba(255, 82, 82, 0.1);
                    border: 2px solid rgba(255, 82, 82, 0.3);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    ">
                        <span style="font-size: 14px; font-weight: bold; color: #ff8a80; text-transform: uppercase;">🎯 Objective</span>
                        <span style="font-size: 12px; font-weight: bold; color: ${isCompleted ? '#4caf50' : '#ffd700'};">${progress}/${requiredCount}</span>
                    </div>
                    <div style="font-size: 13px; color: #ccc; margin-bottom: 12px;">${taskDescription}</div>
                    <div style="
                        background: rgba(0,0,0,0.5);
                        height: 20px;
                        border-radius: 10px;
                        overflow: hidden;
                        border: 1px solid rgba(255, 82, 82, 0.3);
                    ">
                        <div style="
                            width: ${progressPercent}%;
                            height: 100%;
                            background: ${isCompleted 
                                ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)' 
                                : 'linear-gradient(90deg, #ffd700 0%, #ffaa00 100%)'};
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                
                <!-- Rewards Section -->
                <div style="
                    background: rgba(255, 215, 0, 0.1);
                    border: 2px solid rgba(255, 215, 0, 0.3);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 14px; font-weight: bold; color: #ffd700; margin-bottom: 10px; text-transform: uppercase;">🎁 Rewards</div>
                    <div style="display: flex; justify-content: center; gap: 24px;">
                        <div>
                            <div style="font-size: 24px; margin-bottom: 4px;">💰</div>
                            <div style="font-size: 18px; font-weight: bold; color: #fff;">${bossData.rewards.coins}</div>
                            <div style="font-size: 11px; color: #999;">Coins</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; margin-bottom: 4px;">⭐</div>
                            <div style="font-size: 18px; font-weight: bold; color: #fff;">${bossData.rewards.xp}</div>
                            <div style="font-size: 11px; color: #999;">XP</div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <button id="tm-complete-boss-btn" style="
                    width: 100%;
                    padding: 14px;
                    background: ${isCompleted 
                        ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' 
                        : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'};
                    color: white;
                    border: 2px solid ${isCompleted ? '#66bb6a' : '#444'};
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: ${isCompleted ? 'pointer' : 'not-allowed'};
                    font-size: 15px;
                    margin-bottom: 10px;
                    opacity: ${isCompleted ? '1' : '0.5'};
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    transition: all 0.3s ease;
                " ${!isCompleted ? 'disabled' : ''}
                   onmouseover="${isCompleted ? 'this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 20px rgba(76, 175, 80, 0.6)\'' : ''}"
                   onmouseout="${isCompleted ? 'this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'none\'' : ''}"
                >${isCompleted ? '✓ CLAIM VICTORY' : '⏳ IN PROGRESS...'}</button>
                
                <button id="tm-abandon-boss-btn" style="
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    color: #ff8a80;
                    border: 1px solid rgba(255, 82, 82, 0.4);
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(139, 0, 0, 0.3)'; this.style.borderColor='#ff5252';"
                   onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255, 82, 82, 0.4)';"
                >✗ Abandon Quest</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Close handlers - refresh notification if in view-only mode
    const handleClose = () => {
        overlay.remove();
        if (viewOnly) {
            // Refresh notification to show split buttons again
            const freshBossData = JSON.parse(GM_getValue(window.STORAGE_KEYS.ACTIVE_BOSS, 'null'));
            if (freshBossData) {
                showBossBattleNotification(freshBossData);
            }
        }
    };
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', handleClose);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) handleClose(); });
    
    overlay.querySelector('#tm-complete-boss-btn').addEventListener('click', () => {
        if (isCompleted) {
            completeBossBattle(bossData);
            overlay.remove();
        }
    });
    
    overlay.querySelector('#tm-abandon-boss-btn').addEventListener('click', () => {
        // Mark boss as abandoned and select a permanent taunt message
        const taunts = [
            'You are not worthy...',
            'Coward! The boss laughs at you.',
            'Too scared to fight?',
            'The boss remembers your fear.',
            'Weakness disgusts me.',
            'Run away, little one.'
        ];
        bossData.abandoned = true;
        bossData.tauntMessage = taunts[Math.floor(Math.random() * taunts.length)];
        GM_setValue(window.STORAGE_KEYS.ACTIVE_BOSS, JSON.stringify(bossData));
        overlay.remove();
        
        // Refresh the page after abandoning
        setTimeout(() => {
            window.location.reload();
        }, 100);
    });
}

function completeBossBattle(bossData) {
    const STORAGE_KEYS = window.STORAGE_KEYS;
    const config = window.config;
    
    // VALIDATION: Check if objective is actually completed
    const progress = bossData.progress || 0;
    if (progress < bossData.requiredCount) {
        if (window.showPositiveMessage) {
            window.showPositiveMessage(`❌ Cannot claim rewards! Complete the objective first (${progress}/${bossData.requiredCount})`);
        }
        return;
    }
    
    // Grant rewards
    if (window.grantCoins) window.grantCoins(config, STORAGE_KEYS, bossData.rewards.coins);
    if (window.grantXp) window.grantXp(config, STORAGE_KEYS, bossData.rewards.xp);
    
    // Record victory
    const history = JSON.parse(GM_getValue(STORAGE_KEYS.BOSS_HISTORY, '[]'));
    history.push({
        bossId: bossData.id,
        defeatedAt: Date.now(),
        rewards: bossData.rewards,
        completedIn: Date.now() - bossData.spawnedAt,
        progress: progress
    });
    GM_setValue(STORAGE_KEYS.BOSS_HISTORY, JSON.stringify(history.slice(-50)));
    
    // Increment defeats counter
    const defeats = GM_getValue(STORAGE_KEYS.BOSS_DEFEATS, 0);
    GM_setValue(STORAGE_KEYS.BOSS_DEFEATS, defeats + 1);
    
    // Clear active boss and minimized state
    GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, 'null');
    GM_setValue(STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, false);
    showBossBattleNotification(null);
    
    // Show victory message with confetti
    if (window.showPositiveMessage) {
        window.showPositiveMessage(`🎉 ${bossData.icon} ${bossData.name} DEFEATED! +${bossData.rewards.coins} coins, +${bossData.rewards.xp} XP!`);
    }
    if (window.triggerConfetti) {
        window.triggerConfetti(300);
    }
}

// Debug functions to force spawn events and bosses (bypass probability checks)
function forceRandomEvent(config, STORAGE_KEYS) {
    const now = Date.now();
    
    // Clear any existing event
    GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, 'null');
    
    // Select random event weighted by spawn chance
    const events = Object.values(RANDOM_EVENTS);
    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEvent = null;
    for (const event of events) {
        random -= event.weight;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }
    
    if (!selectedEvent) {
        selectedEvent = events[0]; // Fallback to first event
    }
    
    // Activate event
    const eventData = {
        ...selectedEvent,
        startedAt: now,
        expiresAt: now + selectedEvent.duration,
        progress: 0
    };
    
    // Handle instant events
    if (selectedEvent.duration === 0) {
        if (selectedEvent.effect.instantCoins) {
            const coins = selectedEvent.effect.instantCoins();
            grantCoins(config, STORAGE_KEYS, coins);
            if (window.showPositiveMessage) {
                window.showPositiveMessage(`${selectedEvent.icon} ${selectedEvent.name}! +${coins} coins!`);
            }
        }
        
        // Log to history
        const history = JSON.parse(GM_getValue(STORAGE_KEYS.EVENT_HISTORY, '[]'));
        history.push({ ...eventData, completedAt: now });
        GM_setValue(STORAGE_KEYS.EVENT_HISTORY, JSON.stringify(history.slice(-50)));
        return;
    }
    
    GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, JSON.stringify(eventData));
    
    // Show notification
    if (window.showPositiveMessage) {
        const duration = Math.floor(selectedEvent.duration / 60000);
        window.showPositiveMessage(`${selectedEvent.icon} ${selectedEvent.name}! ${selectedEvent.description} (${duration}m)`);
    }
    
    updateEventNotification(eventData);
}

function forceBossSpawn(config, STORAGE_KEYS) {
    // Clear any existing boss
    GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, 'null');
    
    // Select random boss
    const bosses = Object.values(BOSS_BATTLES);
    const selectedBoss = bosses[Math.floor(Math.random() * bosses.length)];
    
    const bossData = {
        ...selectedBoss,
        spawnedAt: Date.now(),
        expiresAt: Date.now() + selectedBoss.timeLimit,
        progress: 0,
        accepted: false
    };
    
    GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, JSON.stringify(bossData));
    
    // Show notification
    if (window.showPositiveMessage) {
        window.showPositiveMessage(`⚔️ BOSS BATTLE! ${selectedBoss.icon} ${selectedBoss.name} has appeared!`);
    }
    
    showBossBattleNotification(bossData);
}

// Debug function to stop/clear any active boss battle
function stopBossBattle(STORAGE_KEYS) {
    // Clear active boss
    GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, 'null');
    GM_setValue(STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, false);
    
    // Remove notification
    showBossBattleNotification(null);
}

// Debug function to stop/clear any active random event
function stopRandomEvent(STORAGE_KEYS) {
    // Clear active event
    GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, 'null');
    GM_setValue(STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
    
    // Remove notification
    updateEventNotification(null);
}

// Helper function to format time intelligently
function formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return '0s';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${seconds}s`;
    }
}

// Export new feature functions
window.checkRandomEvent = checkRandomEvent;
window.updateEventNotification = updateEventNotification;
window.showFactionsModal = showFactionsModal;
window.showDashboardModal = showDashboardModal;
window.showTalentsModal = showTalentsModal;
window.checkBossSpawn = checkBossSpawn;
window.showBossBattleNotification = showBossBattleNotification;
window.completeBossBattle = completeBossBattle;
window.updateBossProgress = updateBossProgress;
window.forceRandomEvent = forceRandomEvent; // Debug function
window.forceBossSpawn = forceBossSpawn; // Debug function
window.stopBossBattle = stopBossBattle; // Debug function
window.stopRandomEvent = stopRandomEvent; // Debug function
window.formatTimeRemaining = formatTimeRemaining; // Helper function

window.getGamificationSettingsHTML = getGamificationSettingsHTML;
window.populateShop = populateShop;
window.showShopModal = showShopModal;
window.handleShopPurchase = handleShopPurchase;
window.getTalentsHTML = getTalentsHTML;
window.getMascotSettingsHTML = getMascotSettingsHTML;
window.getLevelUpSettingsHTML = getLevelUpSettingsHTML;
window.showQuestsModal = showQuestsModal;
window.populateQuestsModal = populateQuestsModal;
window.trackDailyStat = trackDailyStat;
window.grantXp = grantXp;
window.grantCoins = grantCoins;
window.checkAchievements = checkAchievements;
window.updateQuestProgress = updateQuestProgress;
window.generateDailyQuests = generateDailyQuests;
window.getXpForLevel = getXpForLevel;
window.triggerLevelUpAnimation = triggerLevelUpAnimation;
window.updateCoinBalanceUI = updateCoinBalanceUI;
window.showAchievementNotification = showAchievementNotification;
window.queueNotification = queueNotification;
window.processNotificationQueue = processNotificationQueue;
window.initOrderTracking = initOrderTracking;
window.initFunFeatures = initFunFeatures;
window.initFunFeatures = initFunFeatures;// This script is intended to be used as a library via the @require directive
// in the main "MyManager All-in-One Suite" script. It does not do anything on its own.

/**
 * Initializes the custom minimal login experience.
 * @param {object} STORAGE_KEYS - An object containing storage keys from the main script.
 */
function initLoginPage(STORAGE_KEYS) {
    const LOGIN_USERS_KEY = 'tm_login_users_v2';

    // 1. Hide the original, cluttered login page content
    const originalPage = document.querySelector('.rnr-page');
    if (originalPage) {
        originalPage.style.display = 'none';
    }

    // The original form is still needed to submit the login
    const originalForm = document.getElementById('form1');
    if (!originalForm) {
        console.error("Original login form not found. Cannot proceed.");
        return;
    }

    // Load users from GM_storage
    let USER_CREDENTIALS = JSON.parse(GM_getValue(LOGIN_USERS_KEY, '{}'));

    // 2. Inject new, minimal HTML and styles
    GM_addStyle(`
        /* --- Google Fonts --- */
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

        /* --- Base Styles --- */
        body.custom-login {
            background: #0f0f23 !important;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #fff;
            overflow: hidden;
            position: relative;
        }
        
        /* Animated background gradient */
        body.custom-login::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
            opacity: 0.4;
            z-index: 0;
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Floating particles */
        body.custom-login::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
            z-index: 0;
        }
        
        .minimal-login-container {
            position: relative;
            z-index: 1;
        }

        /* --- Hide Original Header/Footer --- */
        .custom-login #head-outter, .custom-login #footer-outter {
            display: none !important;
        }

        /* --- Main Login Container --- */
        .minimal-login-container {
            background: rgba(0, 0, 0, 0.4) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 450px;
            width: 90%;
            animation: fadeIn 1s ease-out;
            text-align: center;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .minimal-login-container h1 {
            font-weight: 300;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            letter-spacing: 1px;
            color: #fff !important;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.4);
        }

        /* --- Error Message --- */
        .minimal-login-error {
            background: #e53935; /* A slightly darker red for better contrast */
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            width: 100%;
            box-sizing: border-box;
            text-align: center;
            font-weight: 500;
            display: none; /* Hidden by default */
            animation: fadeIn 0.5s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        /* --- Input Fields --- */
        #minimal-username-input,
        #minimal-password-input {
            background: rgba(255, 255, 255, 0.25) !important;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            padding: 15px 30px;
            font-size: 1.2rem;
            color: #fff !important;
            text-align: center;
            width: 110%;
            max-width: 450px;
            margin-left: -5%;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        #minimal-username-input::placeholder,
        #minimal-password-input::placeholder { 
            color: rgba(255, 255, 255, 0.8) !important; 
        }
        #minimal-username-input:focus,
        #minimal-password-input:focus {
            background: rgba(255, 255, 255, 0.35) !important;
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }

        /* --- Store Selector --- */
        #minimal-store-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
            width: 100%;
        }
        .minimal-store-btn {
            background: rgba(255, 255, 255, 0.25) !important;
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: white !important;
            padding: 15px 30px;
            font-size: 1.1rem;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-grow: 1;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .minimal-store-btn:hover {
            background: rgba(255, 255, 255, 0.4) !important;
            border-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
            transform: translateY(-3px);
        }

        /* --- Settings Panel --- */
        #login-settings-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            font-size: 22px;
            cursor: pointer;
            transition: all 0.4s ease;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #login-settings-btn:hover {
            background: rgba(255,255,255,0.4);
            transform: rotate(90deg);
        }
        #login-settings-panel {
            position: fixed;
            top: 0;
            right: -450px; /* Start off-screen */
            width: 420px;
            height: 100%;
            background: #f8f9fa;
            box-shadow: -5px 0 15px rgba(0,0,0,0.3);
            z-index: 10000;
            transition: right 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            padding: 20px;
            color: #343a40;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }
        #login-settings-panel.visible { right: 0; }
        #login-settings-panel h2 { margin-top: 0; font-weight: 400; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
        #login-users-list { flex-grow: 1; overflow-y: auto; margin-bottom: 20px; }
        .login-user-item { background: #ffffff; border: 1px solid #e9ecef; padding: 10px 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease-in-out; cursor: pointer; }
        .login-user-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.05); border-color: #ced4da; }
        .login-user-item span { font-weight: 500; font-size: 1.1rem; color: #495057; }
        .login-user-item button { background: #f1f3f5; border: none; color: #868e96; padding: 5px 10px; border-radius: 5px; cursor: pointer; transition: all 0.2s ease; }
        .login-user-item button:hover { background: #e63946; color: white; }
        #login-settings-panel input, #login-settings-panel textarea { width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ced4da; background: #ffffff; color: #495057; box-sizing: border-box; font-size: 1rem; font-family: 'Roboto', sans-serif; transition: border-color 0.2s, box-shadow 0.2s; }
        #login-settings-panel input:focus, #login-settings-panel textarea:focus { outline: none; border-color: #80bdff; box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); }
        #save-login-user-btn { width: 100%; padding: 15px; background: #007bff; border: none; color: white; font-size: 1.1rem; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; }
        #save-login-user-btn:hover { background: #0056b3; }
        #save-login-user-btn.update { background: #28a745; } /* Green for update */
        #save-login-user-btn.update:hover { background: #218838; }
        #clear-login-form-btn { background: none; border: none; color: #6c757d; cursor: pointer; text-decoration: underline; font-size: 12px; margin-top: 10px; }
        #login-settings-feedback {
            text-align: center; color: #28a745; font-weight: bold;
            padding: 10px; margin-top: 10px; border-radius: 8px;
            background: #e9f7ef; border: 1px solid #a6d9ba;
            opacity: 0; transition: opacity 0.3s ease-in-out;
        }

        /* --- New: Settings Modal Styles --- */
        .login-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        .login-modal-content {
            background: #f8f9fa; color: #343a40;
            padding: 25px; border-radius: 15px;
            width: 90%; max-width: 850px; /* MODIFIED: Increased width */
            box-shadow: 0 5px 25px rgba(0,0,0,0.3);
            display: flex; flex-direction: column;
            max-height: 90vh;
        }
        .login-modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dee2e6; padding-bottom: 15px; margin-bottom: 20px; }
        .login-modal-header h2 { margin: 0; font-weight: 500; font-size: 1.5rem; }
        .login-modal-close { font-size: 28px; font-weight: bold; cursor: pointer; border: none; background: none; color: #6c757d; }
        /* MODIFIED: Replaced flex with grid for better layout */
        .login-modal-body {
            display: grid;
            grid-template-columns: 250px 1fr; /* Users list on left, form on right */
            gap: 25px;
            overflow: hidden;
            flex-grow: 1;
        }
        /* NEW: Section for the user list */
        .login-users-section {
            display: flex;
            flex-direction: column;
            border-right: 1px solid #dee2e6;
            padding-right: 25px;
            overflow-y: auto;
        }
        /* NEW: Section for the form */
        .login-form-section {
            display: flex;
            flex-direction: column;
            overflow-y: auto; /* Allow form to scroll if needed */
            min-width: 0;
        }
        .login-form-section h3 { margin: 0 0 20px 0; font-weight: 500; text-align: center; }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .form-group label { font-weight: 500; margin-bottom: 5px; font-size: 14px; color: #495057; }
        /* --- New Drag and Drop Styles --- */
        .form-section { padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; background: #fff; }
        .form-section h4 { margin: -15px -15px 15px -15px; padding: 10px 15px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; font-size: 1rem; font-weight: 500; border-radius: 8px 8px 0 0; }
        .dnd-container { display: flex; align-items: center; gap: 10px; flex-grow: 1; min-height: 150px; }
        .dnd-column { flex: 1; display: flex; flex-direction: column; }
        .dnd-column h5 { margin: 0 0 10px 0; font-size: 13px; text-align: center; color: #6c757d; font-weight: normal; }
        .dnd-arrow {
            font-size: 24px; color: #adb5bd;
            padding: 0 10px;
        }
        .dnd-list { flex-grow: 1; background: #f0f2f5; border: 2px dashed #ced4da; border-radius: 8px; padding: 10px; overflow-y: auto; transition: all 0.2s; }
        .dnd-list.drag-over { border-color: #007bff; background: #e7f1ff; }
        .dnd-store-item { background: #fff; padding: 8px 12px; border-radius: 5px; border: 1px solid #dee2e6; margin-bottom: 8px; cursor: grab; user-select: none; transition: all 0.2s; }
        .dnd-store-item:last-child { margin-bottom: 0; }
        .dnd-store-item:hover { border-color: #80bdff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .dnd-store-item.dragging { opacity: 0.5; background: #cce5ff; }

        #login-settings-feedback { margin-top: auto; } /* Push feedback to the bottom */
        .form-actions {
            margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;
            display: flex; justify-content: flex-end; gap: 10px;
        }
        .form-actions #save-login-user-btn { width: auto; flex-grow: 1; }
        .form-actions #clear-login-form-btn {
            flex-grow: 0; background: #6c757d; color: white; border: none;
            padding: 0 20px; border-radius: 8px; text-decoration: none; font-size: 1rem;
            transition: background-color 0.2s;
        }
        .form-actions #clear-login-form-btn:hover { background: #5a6268; }

        /* NEW: Styles for modal header buttons */
        .modal-header-actions { display: flex; align-items: center; gap: 10px; }
        .modal-action-btn {
            background: #e9ecef;
            border: none;
            color: #495057;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .modal-action-btn:hover { background: #ced4da; }
        .login-modal-close {
            position: relative;
            top: -2px; /* Minor adjustment for visual alignment */
        }
        #login-users-list { flex-grow: 1; overflow-y: auto; }
        .login-user-item.active {
            background-color: #e7f1ff;
            border-left: 4px solid #007bff;
            padding-left: 11px;
        }
    `);
    document.body.classList.add('custom-login');

    const minimalContainer = document.createElement('div');
    minimalContainer.className = 'minimal-login-container';
    minimalContainer.innerHTML = `
        <h1>Who are you?</h1>
        <div id="minimal-login-error" class="minimal-login-error"></div>
        <input type="text" id="minimal-username-input" placeholder="Enter your username" autocomplete="off">
        <input type="password" id="minimal-password-input" placeholder="Enter your password" autocomplete="off" style="display: none; margin-top: 15px;">
        <button id="minimal-login-btn" class="minimal-store-btn" style="display: none; margin-top: 15px;">Continue</button>
        <div id="minimal-store-selector" style="display: none;"></div>
    `;
    // Insert our new UI before the hidden original form
    originalPage.parentNode.insertBefore(minimalContainer, originalPage);

    // --- Event Handling ---
    const usernameInput = document.getElementById('minimal-username-input');
    const storeSelector = document.getElementById('minimal-store-selector');
    const titleHeader = minimalContainer.querySelector('h1');

    // Check for and display existing login errors from the original page
    const errorMessageElement = document.querySelector('.rnr-message');
    if (errorMessageElement && errorMessageElement.textContent.trim()) {
        const errorDiv = document.getElementById('minimal-login-error');
        errorDiv.textContent = errorMessageElement.textContent.trim();
        errorDiv.style.display = 'block';
        titleHeader.textContent = 'Login Failed';
    }

    // Create and append settings button and panel
    const settingsButton = document.createElement('button');
    settingsButton.id = 'login-settings-btn';
    settingsButton.title = 'Manage Users';
    settingsButton.innerHTML = '&#9881;'; // Gear icon
    document.body.appendChild(settingsButton);

    settingsButton.addEventListener('click', () => {
        showLoginSettingsModal(() => {
            // When the modal closes, reload the credentials in the main scope
            USER_CREDENTIALS = JSON.parse(GM_getValue(LOGIN_USERS_KEY, '{}'));
        });
    });

    const passwordInput = document.getElementById('minimal-password-input');
    const loginBtn = document.getElementById('minimal-login-btn');
    
    let typingTimer;
    let passwordShowTimer;
    
    // Function to show store selection
    const showStoreSelection = () => {
        const username = usernameInput.value.trim().toLowerCase();
        const credentials = USER_CREDENTIALS[username];

        if (credentials && credentials.stores && credentials.stores.length > 0) {
            // A known user is found!
            titleHeader.textContent = 'Select a Store';
            usernameInput.style.display = 'none';
            passwordInput.style.display = 'none';
            loginBtn.style.display = 'none';

            storeSelector.innerHTML = ''; // Clear previous buttons
            credentials.stores.forEach(store => {
                const storeBtn = document.createElement('button');
                storeBtn.className = 'minimal-store-btn';
                storeBtn.textContent = store.name;
                storeBtn.dataset.storeId = store.id;
                storeSelector.appendChild(storeBtn);

                storeBtn.addEventListener('click', () => {
                    // On store selection, fill the original hidden form and submit
                    document.getElementById('username').value = username;
                    document.getElementById('password').value = credentials.password;
                    document.getElementById('iProfileID').value = store.id;
                    originalForm.submit();
                });
            });

            storeSelector.style.display = 'flex';
        }
    };
    
    // Function to show store selection for non-saved users
    const showStoreSelectionForNewUser = () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            return;
        }
        
        // Get all unique stores from saved users
        const allStores = new Map();
        Object.values(USER_CREDENTIALS).forEach(cred => {
            if (cred.stores) {
                cred.stores.forEach(store => {
                    allStores.set(store.id, store);
                });
            }
        });
        
        if (allStores.size > 0) {
            // Show store selection
            titleHeader.textContent = 'Select a Store';
            usernameInput.style.display = 'none';
            passwordInput.style.display = 'none';
            loginBtn.style.display = 'none';
            
            storeSelector.innerHTML = ''; // Clear previous buttons
            allStores.forEach(store => {
                const storeBtn = document.createElement('button');
                storeBtn.className = 'minimal-store-btn';
                storeBtn.textContent = store.name;
                storeBtn.dataset.storeId = store.id;
                storeSelector.appendChild(storeBtn);

                storeBtn.addEventListener('click', () => {
                    // Fill the form with manual credentials
                    document.getElementById('username').value = username;
                    document.getElementById('password').value = password;
                    document.getElementById('iProfileID').value = store.id;
                    originalForm.submit();
                });
            });

            storeSelector.style.display = 'flex';
        } else {
            // No stores available, submit without store selection
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
            originalForm.submit();
        }
    };
    
    // Wait for user to stop typing, then check for saved user
    usernameInput.addEventListener('input', () => {
        // Clear any existing timers
        clearTimeout(typingTimer);
        clearTimeout(passwordShowTimer);
        
        // Hide everything while typing
        passwordInput.style.display = 'none';
        loginBtn.style.display = 'none';
        storeSelector.style.display = 'none';
        
        const username = usernameInput.value.trim().toLowerCase();
        
        if (username.length === 0) {
            // Empty username - keep everything hidden
            return;
        }
        
        // Wait 500ms after user stops typing
        typingTimer = setTimeout(() => {
            const credentials = USER_CREDENTIALS[username];
            
            if (credentials && credentials.stores && credentials.stores.length > 0) {
                // Saved user - automatically show store selection
                showStoreSelection();
            } else {
                // Not a saved user - wait 3 seconds, then show password field
                passwordShowTimer = setTimeout(() => {
                    passwordInput.style.display = 'block';
                    loginBtn.style.display = 'block';
                }, 3000);
            }
        }, 500);
    });
    
    // Press Enter on username field
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Clear timers and immediately check
            clearTimeout(typingTimer);
            clearTimeout(passwordShowTimer);
            
            const username = usernameInput.value.trim().toLowerCase();
            const credentials = USER_CREDENTIALS[username];
            
            if (credentials && credentials.stores && credentials.stores.length > 0) {
                showStoreSelection();
            } else {
                // Show password field immediately and focus
                passwordInput.style.display = 'block';
                loginBtn.style.display = 'block';
                passwordInput.focus();
            }
        }
    });
    
    // Press Enter on password field
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            showStoreSelectionForNewUser();
        }
    });
    
    loginBtn.addEventListener('click', showStoreSelectionForNewUser);

    usernameInput.focus();
}

/**
 * Creates and displays a modal for managing user credentials.
 * @param {function} onModalClose - A callback function to execute when the modal is closed.
 */
function showLoginSettingsModal(onModalClose) {
    const LOGIN_USERS_KEY = 'tm_login_users_v2';
    // Prevent multiple modals
    if (document.querySelector('.login-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'login-modal-overlay';
    overlay.innerHTML = `
        <div class="login-modal-content">
            <div class="login-modal-header">
                <h2>Manage Users</h2>
                <div class="modal-header-actions">
                    <button id="add-new-user-btn" title="Add New User" class="modal-action-btn">+</button>
                    <button class="login-modal-close" title="Close">&times;</button>
                </div>
            </div>
            <div class="login-modal-body">
                <div class="login-users-section">
                    <div id="login-users-list"></div>
                </div>
                <div class="login-form-section" style="display: none;">
                    <h3 id="login-form-title">Add New User</h3>
                    <div class="form-section">
                        <h4>User Details</h4>
                        <div class="form-group">
                            <label for="login-username">Username</label>
                            <input type="text" id="login-username" placeholder="e.g., alex (must be unique)">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" placeholder="••••••••••">
                        </div>
                    </div>
                    <div class="form-section" style="flex-grow: 1; display: flex; flex-direction: column;">
                        <h4>Store Assignments</h4>
                        <div class="dnd-container">
                            <div class="dnd-column">
                                <h5>Available Stores</h5>
                                <div id="available-stores-list" class="dnd-list"></div>
                            </div>
                            <div class="dnd-arrow">⇄</div>
                            <div class="dnd-column">
                                <h5>User's Stores</h5>
                                <div id="selected-stores-list" class="dnd-list"></div>
                            </div>
                        </div>
                    </div>
                    <div id="login-settings-feedback" style="opacity: 0;"></div>
                    <div class="form-actions">
                        <button id="save-login-user-btn">Save User</button>
                        <button id="clear-login-form-btn">Clear Form</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // --- Get elements from the newly created modal ---
    const formSection = overlay.querySelector('.login-form-section');
    const usersList = document.getElementById('login-users-list');
    const saveBtn = document.getElementById('save-login-user-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const formTitle = document.getElementById('login-form-title');
    const clearFormBtn = document.getElementById('clear-login-form-btn');
    const feedbackDiv = document.getElementById('login-settings-feedback');
    const closeBtn = overlay.querySelector('.login-modal-close');
    const addNewUserBtn = document.getElementById('add-new-user-btn');
    const availableStoresList = document.getElementById('available-stores-list');
    const selectedStoresList = document.getElementById('selected-stores-list');
    let allStores = [];

    function showForm() { formSection.style.display = 'flex'; }
    function hideForm() { formSection.style.display = 'none'; }

    // --- Event Listeners for the modal ---
    const closeAndCallback = () => {
        overlay.remove();
        if (onModalClose) onModalClose();
    };
    closeBtn.addEventListener('click', closeAndCallback);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAndCallback(); });

    let users = JSON.parse(GM_getValue(LOGIN_USERS_KEY, '{}'));
    let isEditing = false;
    let editingUsername = null;

    function clearForm() {
        usernameInput.value = '';
        passwordInput.value = '';
        usernameInput.disabled = false;
        isEditing = false;
        editingUsername = null;
        saveBtn.textContent = 'Save User';
        saveBtn.classList.remove('update');
        formTitle.textContent = 'Add New User';
        document.querySelectorAll('.login-user-item.active').forEach(el => el.classList.remove('active'));
        populateStoreLists([]); // Clear selected stores, show all in available
    }

    clearFormBtn.addEventListener('click', () => { clearForm(); hideForm(); });
    addNewUserBtn.addEventListener('click', () => { clearForm(); showForm(); });

    function renderUsers() {
        usersList.innerHTML = '';
        if (Object.keys(users).length === 0) {
            usersList.innerHTML = '<p style="text-align: center; color: #6c757d;">No users saved. Add one!</p>';
            return;
        }
        for (const username in users) {
            const userItem = document.createElement('div');
            userItem.className = 'login-user-item';
            userItem.innerHTML = `
                <span title="Click to edit">${username}</span>
                <button data-username="${username}" title="Remove User">&times;</button>
            `;
            if (isEditing && username === editingUsername) userItem.classList.add('active');
            usersList.appendChild(userItem);
        }
    }

    usersList.addEventListener('click', (e) => {
        const userToRemove = e.target.dataset.username;
        if (userToRemove) { // Remove user
            if (confirm(`Are you sure you want to remove the user '${userToRemove}'?`)) {
                delete users[userToRemove];
                GM_setValue(LOGIN_USERS_KEY, JSON.stringify(users));
                showFeedback(`User '${userToRemove}' removed.`, 'error');
                if (editingUsername === userToRemove) { clearForm(); hideForm(); }
                renderUsers();
            }
        } else if (e.target.tagName === 'SPAN') { // Edit user
            const userToEdit = e.target.textContent;
            const userData = users[userToEdit];
            usernameInput.value = userToEdit;
            passwordInput.value = userData.password;
            populateStoreLists(userData.stores);
            usernameInput.disabled = true;
            isEditing = true;
            editingUsername = userToEdit;
            saveBtn.textContent = 'Update User';
            saveBtn.classList.add('update');
            formTitle.textContent = `Editing '${userToEdit}'`;
            renderUsers();
            showForm();
        }
    });

    saveBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        const stores = Array.from(selectedStoresList.querySelectorAll('.dnd-store-item')).map(item => ({ name: item.textContent, id: item.dataset.storeId }));

        if (!username || !password || stores.length === 0) {
            showFeedback('Please fill all fields and add at least one store.', 'error');
            return;
        }

        users[username] = { password: password, stores: stores };
        GM_setValue(LOGIN_USERS_KEY, JSON.stringify(users));
        showFeedback(`User '${username}' ${isEditing ? 'updated' : 'saved'} successfully!`);
        renderUsers();
        clearForm();
        hideForm();
    });

    function showFeedback(message, type = 'success') {
        feedbackDiv.textContent = message;
        feedbackDiv.style.borderColor = type === 'success' ? '#a6d9ba' : '#f5c6cb';
        feedbackDiv.style.backgroundColor = type === 'success' ? '#e9f7ef' : '#f8d7da';
        feedbackDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        feedbackDiv.style.opacity = '1';
        setTimeout(() => { feedbackDiv.style.opacity = '0'; }, 3000);
    };

    // --- Drag and Drop Logic ---
    function setupDragAndDrop() {
        const lists = [availableStoresList, selectedStoresList];
        let draggedItem = null;

        lists.forEach(list => {
            list.addEventListener('dragstart', e => { if (e.target.classList.contains('dnd-store-item')) { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); } });
            list.addEventListener('dragend', () => { if (draggedItem) { draggedItem.classList.remove('dragging'); draggedItem = null; } });
            list.addEventListener('dragover', e => { e.preventDefault(); list.classList.add('drag-over'); });
            list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
            list.addEventListener('drop', e => { e.preventDefault(); list.classList.remove('drag-over'); if (draggedItem && list !== draggedItem.parentElement) { list.appendChild(draggedItem); } });
        });
    }

    function createStoreItem(store) {
        const item = document.createElement('div');
        item.className = 'dnd-store-item';
        item.textContent = store.name;
        item.dataset.storeId = store.id;
        item.draggable = true;
        return item;
    }

    function populateStoreLists(selectedStores = []) {
        availableStoresList.innerHTML = '';
        selectedStoresList.innerHTML = '';
        const selectedIds = new Set(selectedStores.map(s => s.id));
        allStores.forEach(store => {
            if (selectedIds.has(store.id)) {
                selectedStoresList.appendChild(createStoreItem(store));
            } else {
                availableStoresList.appendChild(createStoreItem(store));
            }
        });
    }

    function fetchAllStores() {
        const storeSelect = document.getElementById('iProfileID');
        if (storeSelect) {
            allStores = Array.from(storeSelect.options).filter(opt => opt.value && opt.text.trim()).map(opt => ({ name: opt.text.trim(), id: opt.value }));
        }
    }

    renderUsers();
    fetchAllStores();
    setupDragAndDrop();
    clearForm();
    hideForm();
}

// Make initLoginPage globally accessible for external scripts
window.initLoginPage = initLoginPage;// This script is intended to be used as a library via the @require directive
// in the main "MyManager All-in-One Suite" script. It does not do anything on its own.

let mascotStateTimeout = null;
let idleTimer = null;
let isRoaming = false;
let roamingTimeout = null;
let playfulTimeout = null;
let petStats = { happiness: 100, hunger: 100, lastUpdate: Date.now() };

/**
 * Helper function to get the correct accessory element from the DOM, handling special cases.
 * @param {string} itemId The ID of the accessory.
 * @returns {HTMLElement|null} The DOM element for the accessory.
 */
function getAccessoryElement(itemId) {
    switch (itemId) {
        case 'bookworm_kit': return document.querySelector('.tm-mascot-book');
        case 'stunt_bike': return document.querySelector('.tm-mascot-bicycle');
        case 'juggling_balls': return document.querySelector('.tm-mascot-ball');
        case 'cool_shades': return document.querySelector('.tm-mascot-sunglasses');
        case 'rainy_day_umbrella': return document.querySelector('.tm-mascot-umbrella');
        // Default case for items where the element ID matches the item ID
        default: return document.getElementById(itemId);
    }
}

function stopRoaming(config) {
    if (roamingTimeout) clearTimeout(roamingTimeout);
    if (playfulTimeout) clearTimeout(playfulTimeout);

    const mascotContainer = document.getElementById('tm-mascot-container');
    if (mascotContainer) {
        // Commit the current animated position before canceling
        const animations = mascotContainer.getAnimations();
        if (animations.length > 0) {
            // Get the current computed position during animation
        const computedStyle = window.getComputedStyle(mascotContainer);
            const matrix = new DOMMatrix(computedStyle.transform);
            const currentX = matrix.m41;
            const currentY = matrix.m42;
            
            // Cancel all animations
            animations.forEach(anim => anim.cancel());
            
            // Set the final position explicitly
            mascotContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    roamingTimeout = null;
    isRoaming = false;
}

function startRoaming(config) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer) return;
    if (isRoaming) return;
    isRoaming = true;

    // Set initial position before starting to move
    if (!mascotContainer.style.transform) {
        // New: Randomize starting position to one of four corners
        const mascotWidth = mascotContainer.offsetWidth || 100;
        const mascotHeight = mascotContainer.offsetHeight || 100;
        const padding = 50; // Px from the edge

        const positions = [
            { x: padding, y: padding + 100 }, // Top-left (with extra top padding)
            { x: window.innerWidth - mascotWidth - padding, y: padding + 100 }, // Top-right
            { x: padding, y: window.innerHeight - mascotHeight - padding }, // Bottom-left
            { x: window.innerWidth - mascotWidth - padding, y: window.innerHeight - mascotHeight - padding } // Bottom-right
        ];

        const startPosition = positions[Math.floor(Math.random() * positions.length)];

        // Ensure the position is not off-screen if the window is very small
        const initialX = Math.max(0, Math.min(startPosition.x, window.innerWidth - mascotWidth));
        const initialY = Math.max(0, Math.min(startPosition.y, window.innerHeight - mascotHeight));

        mascotContainer.style.transform = `translate(${initialX}px, ${initialY}px)`;
    }

    // Set a timer for a random playful action
    function schedulePlayfulAction() {
        if (playfulTimeout) clearTimeout(playfulTimeout);
        const randomDelay = 30000 + Math.random() * 30000; // 30-60 seconds
        playfulTimeout = setTimeout(() => {
            const actions = ['reading', 'biking', 'juggling', 'thinking', 'glitching'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            // Set state with a duration, after which it will revert to idle (and thus roaming)
            setMascotState(config, randomAction, 10000); // Action lasts 10 seconds
        }, randomDelay);
    }

    // Initial schedule
    schedulePlayfulAction();

    async function moveToNewPosition() {
        // Triple-check: Only move if the mascot is truly in an idle/roaming state.
        // This prevents a new move from starting if a temporary state (like 'happy') was just triggered.
        const currentMascotState = mascotContainer.className;
        if (!isRoaming || !currentMascotState.includes('mascot-idle')) {
            return; // Exit if not in a valid roaming state.
        }

        if (!isRoaming) return; // Stop if roaming has been cancelled

        const body = mascotContainer.querySelector('.tm-mascot-main-body');
        const flipper = mascotContainer.querySelector('.tm-mascot-flipper');

        // Get current translation from the transform property
        const transformMatrix = new DOMMatrix(window.getComputedStyle(mascotContainer).transform);
        const [currentX, currentY] = [transformMatrix.m41, transformMatrix.m42];

        // Calculate new random position within viewport bounds
        const mascotWidth = mascotContainer.offsetWidth;
        const mascotHeight = mascotContainer.offsetHeight;
        let newX = Math.random() * (window.innerWidth - mascotWidth);
        let newY = Math.random() * (window.innerHeight - mascotHeight);

        // Refined "collision" check: if moving to the top of the screen, the panel might go off.
        // Let's re-roll the position quickly instead of just stopping.
        if (newY < 150) { // 150px is a safe buffer for the panel
            roamingTimeout = setTimeout(moveToNewPosition, 100); // Try again quickly
            return;
        }

        // Flip the pet's SVG based on horizontal direction (smooth transition)
        if (flipper) {
            flipper.style.transition = 'transform 0.3s ease-out';
            flipper.style.transform = (newX < currentX) ? 'scaleX(-1)' : 'scaleX(1)';
        }

        // Tilt the body into the turn (smoother)
        const tilt = Math.max(-10, Math.min(10, (newX - currentX) * 0.03)); // Reduced tilt for smoother look
        if (body) {
            body.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'; // Smoother easing
            body.style.transform = `rotate(${tilt}deg)`;
        }

        // Calculate distance to keep speed constant
        const speed = config.mascotRoamingSpeed || 100; // pixels per second
        const distance = Math.sqrt(Math.pow(newX - currentX, 2) + Math.pow(newY - currentY, 2));
        const duration = Math.max(2, distance / speed); // Minimum 2s duration

        // --- Optimized Web Animations API Implementation ---

        // 1. Calculate a control point for a smoother Bezier curve
        const midX = (currentX + newX) / 2;
        const midY = (currentY + newY) / 2;
        const dx = newX - currentX;
        const dy = newY - currentY;
        const bulge = (Math.random() - 0.5) * 0.3; // Reduced bulge for smoother arcs
        const controlX = midX - dy * bulge;
        const controlY = midY + dx * bulge;

        // 2. Define the animation keyframes for a curved path
        // Use current computed position as start to avoid jumps
        const keyframes = [
            { transform: `translate(${currentX}px, ${currentY}px)` }, // Start from current position
            { transform: `translate(${controlX}px, ${controlY}px)`, offset: 0.5 }, // Mid-point (curve)
            { transform: `translate(${newX}px, ${newY}px)` }  // End
        ];

        // 3. Create and play the animation with optimized settings
        const animation = mascotContainer.animate(keyframes, {
            duration: duration * 1000, // duration in milliseconds
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design Standard easing for smooth motion
            fill: 'forwards', // Keep the final state
            composite: 'replace' // Replace previous animations cleanly
        });

        try {
            // 4. Wait for the animation to finish. The 'finished' promise is a key part of the API.
            await animation.finished;
            
            // Commit the final position to avoid drift
            requestAnimationFrame(() => {
                mascotContainer.style.transform = `translate(${newX}px, ${newY}px)`;
            });
        } catch (error) {
            // The animation might be cancelled (e.g., by another state change).
            // In that case, we just stop this movement sequence.
            return;
        }

        if (!isRoaming) return; // Check again if roaming was cancelled during the move

        // Reset body tilt after settling (smoother)
        if (body) {
            await new Promise(resolve => setTimeout(resolve, 150));
            body.style.transform = 'rotate(0deg)';
        }

        if (!isRoaming) return; // Final check before scheduling next move

        // Occasionally say something while roaming
        if (Math.random() < 0.25) { // 25% chance
            const idleRepairMessages = [
                'Πάμε για δουλίτσα!', 'Τι θα σπάσει σήμερα;', 'Έτοιμος!',
                'Ας δούμε τι έχουμε...', 'Μπαταρία μια χαρά!', 'Χμμ...',
                'Πού πήγε το κατσαβίδι μου;', 'Micro-solder time!', 'Reflow?',
                'Καλή φάση!', 'Περιμένουμε;', 'Έχει δουλειά;',
                'Σα νέο θα το κάνω!', 'Καμένο το IC...', 'Ας δω το schematic...',
                'Power on ρε!', 'Reballing θέλει;', 'Board-level ε;',
                'Τάσεις μέτρα!', 'Flux και θερμό!', 'Ρεζίνες που είσαι;',
                'Τι θα μου φέρουν τώρα;', 'Καφεδάκι;', 'Screen γρήγορα!',
                'Battery άλλαξε!', 'Charging port πάλι;', 'Κάμερα έπαθε;',
                'Audio πάει;', 'WiFi τσέκαρε!', 'Baseband γαμήθηκε;',
                'Λογική ταμπλέτα;', 'Short που είσαι;', 'Καλώδια μπέρδεψα!',
                'Ποια θύρα τώρα;', 'Flux παντού!', 'Solder θέλει!'
            ];
            showMascotBubble(idleRepairMessages[Math.floor(Math.random() * idleRepairMessages.length)], 2500);
        }

        // Set a timeout to move again after the transition ends
        schedulePlayfulAction(); // Reschedule playful action
        roamingTimeout = setTimeout(moveToNewPosition, 2000 + Math.random() * 3000); // Wait 2-5 seconds before next move
    }

    moveToNewPosition();
}

function showMascotBubble(text, duration = 2000) {
    const bubble = document.getElementById('tm-mascot-speech-bubble');
    if (!bubble) return;

    // Casual Greek slang messages
    const messages = [
        "Ωπα!", "Έι!", "Άκου!", "Ουφ!", "Τι έγινε ρε;",
        "Ναι ρε;", "Ας δούμε τι έχουμε...", "Ωραίος!", "Πάμε καλά!", 
        "Φοβερά!", "Τέλεια!", "Μια χαρά!", "Όλα μια χαρά!",
        "Ας το δούμε!", "Σιγά ρε!", "Ωραία φάση!", "Γαμάτο!"
    ];
    // If no text is provided, pick a random one.
    const messageToShow = text || messages[Math.floor(Math.random() * messages.length)];

    bubble.textContent = messageToShow;
    bubble.style.display = 'block';
    // Use a timeout to allow the display property to apply before adding the class for transition
    setTimeout(() => {
        bubble.classList.add('show');
    }, 10);

    // Hide it after the duration
    setTimeout(() => {
        bubble.classList.remove('show');
        // Set display to none after the transition ends
        setTimeout(() => { bubble.style.display = 'none'; }, 300);
    }, duration);
}

function triggerDodgeAnimation(config, moveX, moveY) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer || mascotContainer.classList.contains('mascot-dodging')) {
        return; // Don't dodge if already dodging
    }

    // Stop roaming and set the dodging state. `setMascotState` will call `stopRoaming(config)`.
    setMascotState(config, 'dodging', 1000); // State lasts for 1s
    showMascotBubble(null, 1000); // Show a random bubble for 1s

    // The dodge movement logic
    // The dodge direction should be opposite to the mouse movement
    const dodgeDistance = 75; // Make the dodge shorter
    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
    const dodgeX = -(moveX / magnitude) * dodgeDistance;
    const dodgeY = -(moveY / magnitude) * dodgeDistance;

    // Apply an immediate, short-lived transform
    const currentTransform = new DOMMatrix(window.getComputedStyle(mascotContainer).transform);
    let newX = currentTransform.m41 + dodgeX;
    let newY = currentTransform.m42 + dodgeY;

    // Boundary checks to keep the mascot on screen
    const mascotWidth = mascotContainer.offsetWidth;
    const mascotHeight = mascotContainer.offsetHeight;
    newX = Math.max(0, Math.min(newX, window.innerWidth - mascotWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - mascotHeight));

    mascotContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'; // Use CSS transition for this short, sharp movement
    mascotContainer.style.transform = `translate(${newX}px, ${newY}px)`;

    // The state will automatically revert via the timeout in setMascotState.
    // When it reverts, it will call updatePetStateByStats(), which can restart roaming if appropriate.
    setTimeout(() => {
        mascotContainer.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)'; // Restore default transition
    }, 400); // Match the dodge transition duration
}

function setMascotState(config, state, duration = 0) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer) return;

    // Clear any previous temporary state timeout
    if (mascotStateTimeout) {
        clearTimeout(mascotStateTimeout);
        mascotStateTimeout = null;
    }

    // Get previous state before changing
    const previousState = mascotContainer.className.replace('tm-mascot-container mascot-', '');

    mascotContainer.className = 'tm-mascot-container mascot-' + state;
    
    // Reset robot element transform when exiting juggling state to prevent shaking
    if (previousState === 'juggling' && state !== 'juggling') {
        const robot = mascotContainer.querySelector('.tm-mascot-robot');
        if (robot) {
            robot.style.animation = 'none';
            robot.style.transform = '';
            // Force reflow to apply the reset
            void robot.offsetWidth;
        }
    }

    // If a duration is set, revert to the correct base state after the time is up
    if (duration > 0) {
        mascotStateTimeout = setTimeout(() => { // Revert based on current needs, passing 'true' to indicate the temp state is over.
            // Need to get STORAGE_KEYS from window scope
            if (typeof window.STORAGE_KEYS !== 'undefined') {
                updatePetStateByStats(config, window.STORAGE_KEYS, true);
            }
        }, duration);
    }

    // Handle roaming based on the new state, AFTER the class has been set.
    // BUT don't start roaming if the interaction panel is visible
    const interactionPanel = document.getElementById('tm-mascot-interaction-panel');
    const isPanelVisible = interactionPanel && interactionPanel.style.display === 'flex';
    
    // States that allow roaming (mascot can move around while in these states)
    const roamingStates = ['idle', 'biking', 'juggling', 'reading', 'happy', 'sad', 'energized'];
    
    if (roamingStates.includes(state) && !isRoaming && !isPanelVisible) {
        // Add small delay when transitioning from juggling to prevent jerky motion
        if (previousState === 'juggling' && state !== 'juggling') {
            setTimeout(() => startRoaming(config), 300);
        } else {
        startRoaming(config);
        }
    } else if (!roamingStates.includes(state) && isRoaming) {
        stopRoaming(config);
    }
}

// Track last time a low-stat message was shown (cooldown mechanism)
let lastLowStatMessageTime = 0;

function updatePetStateByStats(config, STORAGE_KEYS, isExitingTempState = false) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    
    // Don't change state if the interaction panel is open (user is interacting)
    const interactionPanel = document.getElementById('tm-mascot-interaction-panel');
    if (interactionPanel && interactionPanel.style.display === 'flex') {
        console.log('[MMS Mascot] Interaction panel open, not updating state.');
        return;
    }
    
    // Check if mascot has equipped accessories that should persist their animation states
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    const hasBike = equippedItems.includes('stunt_bike');
    const hasJugglingBalls = equippedItems.includes('juggling_balls');
    const hasBook = equippedItems.includes('bookworm_kit');
    
    // This function is called periodically AND at the end of temporary states (like 'dodging').
    // We only want to interrupt a temporary state if we are explicitly being told to do so by its timeout finishing. Also, don't interrupt the energized state.
    // BUT: Allow persistent accessory states (biking, juggling, reading) to continue unless it's a temporary effect ending OR stats are too low
    const temporaryStates = ['mascot-happy', 'mascot-eating', 'mascot-dodging', 'mascot-thinking', 'mascot-glitching', 'mascot-eureka', 'mascot-sunny', 'mascot-rainy', 'mascot-energized'];
    const persistentAccessoryStates = ['mascot-reading', 'mascot-biking', 'mascot-juggling'];
    
    if (!isExitingTempState && mascotContainer) {
        // Don't override temporary states
        if (temporaryStates.some(c => mascotContainer.classList.contains(c))) {
            return;
        }
        // Don't override persistent accessory states UNLESS stats are critically low
        if (persistentAccessoryStates.some(c => mascotContainer.classList.contains(c)) && petStats.hunger >= 30 && petStats.happiness >= 30) {
            return;
        }
    }

    if (petStats.hunger < 30 || petStats.happiness < 30) {
        setMascotState(config, 'sad');
        // Show occasional reminder about low stats with cooldown
        const now = Date.now();
        const cooldownPeriod = 45000; // 45 seconds cooldown between messages
        
        if (now - lastLowStatMessageTime > cooldownPeriod && Math.random() < 0.3) {
            const lowStatMessages = [
                'Πεινάω ρε...', 'Λυπάμαι...', 'Φαγητό θέλω!', 
                'Δεν είμαι καλά...', 'Χάδι παρακαλώ!', 'Τάισέ με ρε!',
                'Πότε θα φάω ρε;', 'Μοναξιά έχω...', 'Προσοχή μου λίγο!',
                'Ignored...', 'Sad boy...', 'Hungry...'
            ];
            showMascotBubble(lowStatMessages[Math.floor(Math.random() * lowStatMessages.length)], 2500);
            lastLowStatMessageTime = now; // Update the timestamp
        }
    } else {
        // When stats are good, restore accessory animation state or default to idle
        // Note: Juggling balls don't force permanent juggling - they trigger periodic animations instead
        if (hasBike) {
            setMascotState(config, 'biking', 0);
        } else if (hasBook) {
            setMascotState(config, 'reading', 0);
    } else {
        setMascotState(config, 'idle');
        }
    }
}

function loadPetStats(config, STORAGE_KEYS) {
    const savedStats = JSON.parse(GM_getValue(STORAGE_KEYS.PET_STATS, 'null'));
    if (savedStats) {
        petStats = savedStats;
    }
    // Apply decay for the time the script was inactive
    const timeDiffHours = (Date.now() - petStats.lastUpdate) / (1000 * 60 * 60);
    const decayAmount = Math.floor(timeDiffHours * 5); // Decay 5 points per hour
    if (decayAmount > 0) {
        console.log(`[MMS Pet] Applying ${decayAmount} decay for offline time.`);
        petStats.happiness = Math.max(0, petStats.happiness - decayAmount);
        petStats.hunger = Math.max(0, petStats.hunger - decayAmount);
    }
    updatePetStats(config, STORAGE_KEYS, 0, 0); // This will save the potentially decayed stats
}

function updatePetStats(config, STORAGE_KEYS, happinessChange, hungerChange) {
    petStats.happiness = Math.max(0, Math.min(100, petStats.happiness + happinessChange));
    petStats.hunger = Math.max(0, Math.min(100, petStats.hunger + hungerChange));
    petStats.lastUpdate = Date.now();

    GM_setValue(STORAGE_KEYS.PET_STATS, JSON.stringify(petStats));
    updatePetInteractionPanel();
    updatePetStateByStats(config, STORAGE_KEYS);
}

function updatePetInteractionPanel() {
    const happinessFill = document.getElementById('tm-pet-happiness-fill');
    const hungerFill = document.getElementById('tm-pet-hunger-fill');
    if (!happinessFill || !hungerFill) return;

    happinessFill.style.width = `${petStats.happiness}%`;
    hungerFill.style.width = `${petStats.hunger}%`;
}

function resetIdleTimer(config) {
    if (idleTimer) { clearTimeout(idleTimer); }
    const mascotContainer = document.getElementById('tm-mascot-container');
    // If waking up from power-save, do a little jolt
    if (mascotContainer && mascotContainer.classList.contains('mascot-powersave')) {
        const robot = mascotContainer.querySelector('.tm-mascot-robot');
        if (robot) {
            robot.style.animation = 'tm-mascot-startled 0.4s ease-out';
            setTimeout(() => { robot.style.animation = ''; }, 400);
        }
    }

    // Wake up and set to idle/sad (need STORAGE_KEYS from window scope)
    if (typeof window.STORAGE_KEYS !== 'undefined') {
        updatePetStateByStats(config, window.STORAGE_KEYS);
    }

    // Set mascot to sleep after 3 minutes of inactivity
    idleTimer = setTimeout(() => {
        setMascotState(config, 'powersave');
    }, 3 * 60 * 1000);
}

function initInteractiveMascot(config, STORAGE_KEYS) {
    if (!config.interactiveMascotEnabled) return;

    const container = document.createElement('div');
    container.id = 'tm-mascot-container';
    container.classList.add('tm-mascot-container');
    container.title = "Click me!";
    // Simple robot SVG
    container.innerHTML = `
        <div id="tm-mascot-speech-bubble" class="tm-mascot-speech-bubble" style="display: none;"></div>
        <div id="tm-mascot-interaction-panel">
            <div id="tm-pet-happiness-bar" title="Η ευτυχία μειώνεται με τον χρόνο και αυξάνεται όταν τον χαϊδεύετε ή κάνετε εργασίες.">
                <div class="tm-pet-stat-label">😊 Ευτυχία</div>
                <div class="tm-pet-stat-bar"><div id="tm-pet-happiness-fill" class="tm-pet-stat-bar-fill"></div></div>
            </div>
            <div id="tm-pet-hunger-bar" title="Η πείνα αυξάνεται με τον χρόνο. Τάισε το mascot για να την μειώσεις!">
                <div class="tm-pet-stat-label">🍔 Πείνα</div>
                <div class="tm-pet-stat-bar"><div id="tm-pet-hunger-fill" class="tm-pet-stat-bar-fill"></div></div>
            </div>
            <div id="tm-mascot-interaction-buttons">
                <button id="tm-pet-feed-btn" title="Φάε κάτι!">Φαγητό</button>
                <button id="tm-pet-pet-btn" title="Χάιδεψέ με!">Χάδι</button>
                <button id="tm-play-bug-game-btn" title="Παίξε Bug Squish!">Bugs 🐞</button>
                <button id="tm-play-memory-game-btn" title="Παίξε Memory!">Memory 🧠</button>
            </div>
        </div>
        <svg class="tm-mascot-robot" viewBox="0 0 100 100" style="overflow: visible;">
            <!-- Flipper group for horizontal flipping -->
            <g class="tm-mascot-flipper" transform-origin="50 50">
                <!-- Jetpack - Behind body, wider to align with thrusters -->
                <g id="jetpack" class="tm-mascot-accessory" style="display: none; transform: translate(0px, 54px);">
                    <defs>
                        <linearGradient id="jetpack-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#d5d8dc;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#95a5a6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f8c8d;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f39c12;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#e67e22;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d35400;stop-opacity:0.5" />
                        </linearGradient>
                    </defs>
                    <!-- Left tank - aligned with left thruster -->
                    <rect x="8" y="0" width="18" height="30" rx="5" fill="url(#jetpack-gradient)" stroke="#5d6d7e" stroke-width="1.5"/>
                    <circle cx="17" cy="10" r="3" fill="#34495e" stroke="#2c3e50" stroke-width="0.5"/>
                    <rect x="11" y="6" width="4" height="8" fill="#3498db" rx="1" opacity="0.4"/>
                    <ellipse class="tm-mascot-thruster-left" cx="17" cy="32" rx="6" ry="9" fill="url(#flame-gradient)"/>
                    
                    <!-- Right tank - aligned with right thruster -->
                    <rect x="74" y="0" width="18" height="30" rx="5" fill="url(#jetpack-gradient)" stroke="#5d6d7e" stroke-width="1.5"/>
                    <circle cx="83" cy="10" r="3" fill="#34495e" stroke="#2c3e50" stroke-width="0.5"/>
                    <rect x="77" y="6" width="4" height="8" fill="#3498db" rx="1" opacity="0.4"/>
                    <ellipse class="tm-mascot-thruster-right" cx="83" cy="32" rx="6" ry="9" fill="url(#flame-gradient)"/>
                </g>
                
                <!-- Base Form (Lv 1-9) - Novice Robot -->
                <g id="tm-mascot-base" style="display: block;">
                    <defs>
                        <linearGradient id="base-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Antenna with light -->
                    <g class="tm-mascot-antenna">
                        <line x1="50" y1="15" x2="50" y2="5" stroke="#4a4a4a" stroke-width="2.5" stroke-linecap="round"/>
                        <circle cx="50" cy="5" r="3.5" fill="#ffc107"/>
                        <circle cx="49" cy="4" r="1.5" fill="#ffe066" opacity="0.8"/>
                    </g>
                    <!-- Head and body -->
                    <g class="tm-mascot-main-body">
                        <rect x="24" y="14" width="52" height="42" rx="12" fill="url(#base-body-grad)" stroke="#4a4a4a" stroke-width="3"/>
                        <!-- Panel details -->
                        <rect x="28" y="20" width="8" height="2" fill="#3498db" rx="1" opacity="0.6"/>
                        <rect x="64" y="20" width="8" height="2" fill="#3498db" rx="1" opacity="0.6"/>
                        <circle cx="50" cy="25" r="2" fill="#28a745" opacity="0.7"/>
                        <!-- Eyes -->
                        <g class="tm-mascot-eye-open">
                            <circle cx="40" cy="35" r="6" fill="#ffffff"/>
                            <circle cx="40" cy="35" r="3" fill="#2c3e50"/>
                            <circle cx="41" cy="34" r="1" fill="#ffffff"/>
                            <circle cx="60" cy="35" r="6" fill="#ffffff"/>
                            <circle cx="60" cy="35" r="3" fill="#2c3e50"/>
                            <circle cx="61" cy="34" r="1" fill="#ffffff"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 34 35 Q 40 32 46 35" stroke="#2c3e50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 54 35 Q 60 32 66 35" stroke="#2c3e50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- Mouth -->
                        <path class="tm-mascot-mouth-happy" d="M 40 46 Q 50 54 60 46" stroke="#2c3e50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 52 Q 50 44 60 52" stroke="#2c3e50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <!-- Body chassis -->
                        <rect x="20" y="54" width="60" height="32" rx="8" fill="#c0c0c0" stroke="#4a4a4a" stroke-width="3"/>
                        <rect x="24" y="60" width="52" height="3" fill="#95a5a6" rx="1"/>
                        <circle cx="35" cy="70" r="3" fill="#34495e" opacity="0.6"/>
                        <circle cx="65" cy="70" r="3" fill="#34495e" opacity="0.6"/>
                    </g>
                    <!-- Thrusters -->
                    <g class="tm-mascot-thrusters">
                        <rect class="tm-mascot-thruster-left" x="28" y="86" width="16" height="11" fill="#7f8c8d" rx="2" stroke="#5d6d7e" stroke-width="1"/>
                        <rect class="tm-mascot-thruster-right" x="56" y="86" width="16" height="11" fill="#7f8c8d" rx="2" stroke="#5d6d7e" stroke-width="1"/>
                    </g>
                </g>

                <!-- Evo 1 Form (Lv 10-24) - Advanced Troubleshooter -->
                <g id="tm-mascot-evo1" style="display: none;">
                    <defs>
                        <linearGradient id="evo1-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b3d9f2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Dual antenna -->
                    <g class="tm-mascot-antenna">
                        <line x1="45" y1="15" x2="45" y2="5" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
                        <line x1="55" y1="15" x2="55" y2="5" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="45" cy="5" r="3" fill="#17a2b8"/>
                        <circle cx="55" cy="5" r="3" fill="#17a2b8"/>
                    </g>
                    <!-- Sleeker head -->
                    <g class="tm-mascot-main-body">
                        <rect x="24" y="14" width="52" height="42" rx="10" fill="url(#evo1-body-grad)" stroke="#2c3e50" stroke-width="3"/>
                        <!-- Screen display panels -->
                        <rect x="28" y="20" width="44" height="8" fill="#17a2b8" rx="2" opacity="0.3"/>
                        <!-- Digital eyes -->
                        <g class="tm-mascot-eye-open">
                            <rect x="34" y="31" width="12" height="8" fill="#ffffff" rx="2"/>
                            <rect x="37" y="33" width="6" height="4" fill="#17a2b8" rx="1"/>
                            <rect x="54" y="31" width="12" height="8" fill="#ffffff" rx="2"/>
                            <rect x="57" y="33" width="6" height="4" fill="#17a2b8" rx="1"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <line x1="34" y1="35" x2="46" y2="35" stroke="#17a2b8" stroke-width="3" stroke-linecap="round"/>
                            <line x1="54" y1="35" x2="66" y2="35" stroke="#17a2b8" stroke-width="3" stroke-linecap="round"/>
                        </g>
                        <!-- Mouth -->
                        <path class="tm-mascot-mouth-happy" d="M 38 46 Q 50 52 62 46" stroke="#17a2b8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 38 52 Q 50 46 62 52" stroke="#17a2b8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <!-- Body -->
                        <rect x="20" y="54" width="60" height="32" rx="6" fill="#90c9e8" stroke="#2c3e50" stroke-width="3"/>
                        <rect x="26" y="60" width="10" height="18" fill="#17a2b8" rx="2" opacity="0.4"/>
                        <rect x="64" y="60" width="10" height="18" fill="#17a2b8" rx="2" opacity="0.4"/>
                    </g>
                    <!-- Enhanced thrusters -->
                    <g class="tm-mascot-thrusters">
                        <rect class="tm-mascot-thruster-left" x="28" y="86" width="16" height="12" fill="#5d6d7e" rx="3" stroke="#34495e" stroke-width="1.5"/>
                        <rect class="tm-mascot-thruster-right" x="56" y="86" width="16" height="12" fill="#5d6d7e" rx="3" stroke="#34495e" stroke-width="1.5"/>
                        <circle cx="36" cy="91" r="2" fill="#3498db" opacity="0.6"/>
                        <circle cx="64" cy="91" r="2" fill="#3498db" opacity="0.6"/>
                    </g>
                </g>

                <!-- Evo 2 Form (Lv 25-49) - Data Recovery Agent -->
                <g id="tm-mascot-evo2" style="display: none;">
                    <defs>
                        <linearGradient id="evo2-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff9e6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f5e6cc;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="evo2-glow">
                            <stop offset="0%" style="stop-color:#ffc107;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#ffc107;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Triple antenna array -->
                    <g class="tm-mascot-antenna">
                        <line x1="42" y1="15" x2="42" y2="6" stroke="#e67e22" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="50" y1="15" x2="50" y2="3" stroke="#e67e22" stroke-width="3" stroke-linecap="round"/>
                        <line x1="58" y1="15" x2="58" y2="6" stroke="#e67e22" stroke-width="2.5" stroke-linecap="round"/>
                        <circle cx="42" cy="6" r="3" fill="#ffc107" stroke="#fff" stroke-width="0.8"/>
                        <circle cx="50" cy="3" r="4" fill="#ffc107" stroke="#fff" stroke-width="1">
                            <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="58" cy="6" r="3" fill="#ffc107" stroke="#fff" stroke-width="0.8"/>
                    </g>
                    <!-- Advanced head -->
                    <g class="tm-mascot-main-body">
                        <rect x="23" y="13" width="54" height="44" rx="12" fill="url(#evo2-body-grad)" stroke="#f39c12" stroke-width="3.5"/>
                        <!-- Glow effect -->
                        <ellipse cx="50" cy="35" rx="30" ry="25" fill="url(#evo2-glow)"/>
                        <!-- Scanner display -->
                        <rect x="28" y="19" width="44" height="6" fill="#f39c12" rx="3" opacity="0.4"/>
                        <rect x="30" y="21" width="20" height="2" fill="#ffc107" rx="1"/>
                        <!-- Triangular advanced eyes -->
                        <g class="tm-mascot-eye-open">
                            <path d="M 34 30 L 46 30 L 40 42 Z" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
                            <circle cx="40" cy="34" r="2" fill="#fff"/>
                            <path d="M 54 30 L 66 30 L 60 42 Z" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
                            <circle cx="60" cy="34" r="2" fill="#fff"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <line x1="34" y1="36" x2="46" y2="36" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>
                            <line x1="54" y1="36" x2="66" y2="36" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>
                        </g>
                        <!-- Mouth -->
                        <path class="tm-mascot-mouth-happy" d="M 38 48 L 62 48" stroke="#e67e22" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 38 52 Q 50 46 62 52" stroke="#e67e22" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <!-- Advanced body -->
                        <rect x="19" y="54" width="62" height="33" rx="8" fill="#f5deb3" stroke="#f39c12" stroke-width="3.5"/>
                        <rect x="24" y="59" width="12" height="20" fill="#f39c12" rx="3" opacity="0.3"/>
                        <rect x="64" y="59" width="12" height="20" fill="#f39c12" rx="3" opacity="0.3"/>
                        <circle cx="50" cy="70" r="4" fill="#ffc107" opacity="0.5"/>
                    </g>
                    <!-- Power thrusters -->
                    <g class="tm-mascot-thrusters">
                        <rect class="tm-mascot-thruster-left" x="27" y="87" width="17" height="13" fill="#2c3e50" rx="4" stroke="#1a252f" stroke-width="1.5"/>
                        <rect class="tm-mascot-thruster-right" x="56" y="87" width="17" height="13" fill="#2c3e50" rx="4" stroke="#1a252f" stroke-width="1.5"/>
                        <ellipse cx="35" cy="93" rx="4" ry="2" fill="#ffc107" opacity="0.7"/>
                        <ellipse cx="64" cy="93" rx="4" ry="2" fill="#ffc107" opacity="0.7"/>
                    </g>
                </g>

                <!-- Evo 3 Form (Lv 50-99) - Silicon Prophet -->
                <g id="tm-mascot-evo3" style="display: none;">
                    <defs>
                        <linearGradient id="evo3-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#4a4a5e;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#2a2a3e;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="evo3-purple-glow">
                            <stop offset="0%" style="stop-color:#a335ee;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#a335ee;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Mystical antenna crown -->
                    <g class="tm-mascot-antenna">
                        <line x1="38" y1="15" x2="38" y2="7" stroke="#a335ee" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="50" y1="15" x2="50" y2="2" stroke="#a335ee" stroke-width="3.5" stroke-linecap="round"/>
                        <line x1="62" y1="15" x2="62" y2="7" stroke="#a335ee" stroke-width="2.5" stroke-linecap="round"/>
                        <circle cx="38" cy="7" r="3" fill="#d946ef" stroke="#fff" stroke-width="1">
                            <animate attributeName="fill" values="#d946ef;#a855f7;#d946ef" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="50" cy="2" r="4.5" fill="#d946ef" stroke="#fff" stroke-width="1.2">
                            <animate attributeName="r" values="4.5;5.5;4.5" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="62" cy="7" r="3" fill="#d946ef" stroke="#fff" stroke-width="1">
                            <animate attributeName="fill" values="#d946ef;#a855f7;#d946ef" dur="2s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                    <!-- Dark mystical head -->
                    <g class="tm-mascot-main-body">
                        <rect x="22" y="12" width="56" height="46" rx="14" fill="url(#evo3-body-grad)" stroke="#a335ee" stroke-width="4"/>
                        <!-- Purple energy aura -->
                        <ellipse cx="50" cy="35" rx="32" ry="28" fill="url(#evo3-purple-glow)"/>
                        <!-- Circuit patterns -->
                        <path d="M 28 22 L 35 22 L 38 19 L 42 22" stroke="#a335ee" stroke-width="1.5" fill="none" opacity="0.6"/>
                        <path d="M 72 22 L 65 22 L 62 19 L 58 22" stroke="#a335ee" stroke-width="1.5" fill="none" opacity="0.6"/>
                        <!-- X-shaped mystic eyes -->
                        <g class="tm-mascot-eye-open">
                            <path d="M 34 30 L 46 42 M 46 30 L 34 42" stroke="#d946ef" stroke-width="2.5" stroke-linecap="round"/>
                            <path d="M 54 30 L 66 42 M 66 30 L 54 42" stroke="#d946ef" stroke-width="2.5" stroke-linecap="round"/>
                            <circle cx="40" cy="36" r="2" fill="#fff" opacity="0.8">
                                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="60" cy="36" r="2" fill="#fff" opacity="0.8">
                                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="3s" repeatCount="indefinite"/>
                            </circle>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <line x1="34" y1="36" x2="46" y2="36" stroke="#d946ef" stroke-width="3" stroke-linecap="round"/>
                            <line x1="54" y1="36" x2="66" y2="36" stroke="#d946ef" stroke-width="3" stroke-linecap="round"/>
                        </g>
                        <!-- Energy mouth -->
                        <path class="tm-mascot-mouth-happy" d="M 37 49 L 63 49" stroke="#d946ef" stroke-width="3" fill="none" stroke-linecap="round">
                            <animate attributeName="stroke" values="#d946ef;#a855f7;#d946ef" dur="2s" repeatCount="indefinite"/>
                        </path>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 37 52 Q 50 46 63 52" stroke="#d946ef" stroke-width="3" fill="none" stroke-linecap="round"/>
                        <!-- Dark armored body -->
                        <rect x="18" y="54" width="64" height="34" rx="10" fill="#3a3a4a" stroke="#a335ee" stroke-width="4"/>
                        <rect x="23" y="59" width="14" height="22" fill="#a335ee" rx="3" opacity="0.2"/>
                        <rect x="63" y="59" width="14" height="22" fill="#a335ee" rx="3" opacity="0.2"/>
                        <!-- Energy core -->
                        <circle cx="50" cy="71" r="5" fill="#d946ef" opacity="0.6">
                            <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                    <!-- Mystical thrusters -->
                    <g class="tm-mascot-thrusters">
                        <rect class="tm-mascot-thruster-left" x="26" y="88" width="18" height="14" fill="#a335ee" rx="5" stroke="#8b2fc9" stroke-width="2"/>
                        <rect class="tm-mascot-thruster-right" x="56" y="88" width="18" height="14" fill="#a335ee" rx="5" stroke="#8b2fc9" stroke-width="2"/>
                        <ellipse cx="35" cy="95" rx="5" ry="3" fill="#d946ef" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
                        </ellipse>
                        <ellipse cx="65" cy="95" rx="5" ry="3" fill="#d946ef" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
                        </ellipse>
                    </g>
                </g>

                <!-- Evo 4 Form (Lv 100+) - Master of the Mainboard (Legendary) -->
                <g id="tm-mascot-evo4" style="display: none;">
                    <defs>
                        <linearGradient id="evo4-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#fff5e6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffe6cc;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="evo4-orange-glow">
                            <stop offset="0%" style="stop-color:#ff8000;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8000;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Legendary crown antenna array -->
                    <g class="tm-mascot-antenna">
                        <line x1="35" y1="15" x2="33" y2="5" stroke="#ff8000" stroke-width="3" stroke-linecap="round"/>
                        <line x1="43" y1="15" x2="43" y2="3" stroke="#ff8000" stroke-width="3.5" stroke-linecap="round"/>
                        <line x1="50" y1="15" x2="50" y2="0" stroke="#ff8000" stroke-width="4" stroke-linecap="round"/>
                        <line x1="57" y1="15" x2="57" y2="3" stroke="#ff8000" stroke-width="3.5" stroke-linecap="round"/>
                        <line x1="65" y1="15" x2="67" y2="5" stroke="#ff8000" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="33" cy="5" r="3.5" fill="#ffc107" stroke="#fff" stroke-width="1.2">
                            <animate attributeName="fill" values="#ffc107;#ffed4e;#ffc107" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="43" cy="3" r="4" fill="#ffc107" stroke="#fff" stroke-width="1.2">
                            <animate attributeName="r" values="4;5;4" dur="1.2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="50" cy="0" r="5" fill="#ff8000" stroke="#fff" stroke-width="1.5">
                            <animate attributeName="r" values="5;6.5;5" dur="1s" repeatCount="indefinite"/>
                            <animate attributeName="fill" values="#ff8000;#ffc107;#ff8000" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="57" cy="3" r="4" fill="#ffc107" stroke="#fff" stroke-width="1.2">
                            <animate attributeName="r" values="4;5;4" dur="1.2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="67" cy="5" r="3.5" fill="#ffc107" stroke="#fff" stroke-width="1.2">
                            <animate attributeName="fill" values="#ffc107;#ffed4e;#ffc107" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                    <!-- Legendary head -->
                    <g class="tm-mascot-main-body">
                        <rect x="20" y="10" width="60" height="50" rx="16" fill="url(#evo4-body-grad)" stroke="#ff8000" stroke-width="5"/>
                        <!-- Orange legendary glow -->
                        <ellipse cx="50" cy="35" rx="36" ry="30" fill="url(#evo4-orange-glow)" opacity="0.5"/>
                        <!-- Legendary circuit patterns -->
                        <path d="M 26 18 L 36 18 L 40 22 L 44 18 L 52 18" stroke="#ff8000" stroke-width="2" fill="none" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                        </path>
                        <path d="M 74 18 L 64 18 L 60 22 L 56 18 L 48 18" stroke="#ff8000" stroke-width="2" fill="none" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                        </path>
                        <!-- Legendary eyes -->
                        <g class="tm-mascot-eye-open">
                            <circle cx="38" cy="35" r="8" fill="#ff8000" opacity="0.8"/>
                            <circle cx="38" cy="35" r="5" fill="#ffc107"/>
                            <circle cx="36" cy="33" r="2" fill="#fff" opacity="0.9"/>
                            <circle cx="62" cy="35" r="8" fill="#ff8000" opacity="0.8"/>
                            <circle cx="62" cy="35" r="5" fill="#ffc107"/>
                            <circle cx="60" cy="33" r="2" fill="#fff" opacity="0.9"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 30 35 Q 38 30 46 35" stroke="#ff8000" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <path d="M 54 35 Q 62 30 70 35" stroke="#ff8000" stroke-width="3" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- Legendary smile -->
                        <path class="tm-mascot-mouth-happy" d="M 36 48 Q 50 58 64 48" stroke="#ff8000" stroke-width="4" fill="none" stroke-linecap="round">
                            <animate attributeName="stroke" values="#ff8000;#ffc107;#ff8000" dur="2s" repeatCount="indefinite"/>
                        </path>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 36 52 Q 50 44 64 52" stroke="#ff8000" stroke-width="4" fill="none" stroke-linecap="round"/>
                        <!-- Legendary body -->
                        <rect x="16" y="56" width="68" height="36" rx="12" fill="#fff8e1" stroke="#ff8000" stroke-width="5"/>
                        <rect x="22" y="62" width="16" height="24" fill="#ff8000" rx="4" opacity="0.2">
                            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite"/>
                        </rect>
                        <rect x="62" y="62" width="16" height="24" fill="#ff8000" rx="4" opacity="0.2">
                            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite"/>
                        </rect>
                        <!-- Power core -->
                        <circle cx="50" cy="74" r="7" fill="#ffc107" stroke="#ff8000" stroke-width="2">
                            <animate attributeName="r" values="7;8.5;7" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="50" cy="74" r="4" fill="#fff" opacity="0.7"/>
                    </g>
                    <!-- Legendary thrusters with plasma -->
                    <g class="tm-mascot-thrusters">
                        <rect class="tm-mascot-thruster-left" x="25" y="92" width="20" height="16" fill="#ff8000" rx="6" stroke="#e67e00" stroke-width="2.5"/>
                        <rect class="tm-mascot-thruster-right" x="55" y="92" width="20" height="16" fill="#ff8000" rx="6" stroke="#e67e00" stroke-width="2.5"/>
                        <ellipse cx="35" cy="100" rx="6" ry="4" fill="#ffed4e" opacity="0.9">
                            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.8s" repeatCount="indefinite"/>
                            <animate attributeName="ry" values="4;5;4" dur="0.8s" repeatCount="indefinite"/>
                        </ellipse>
                        <ellipse cx="65" cy="100" rx="6" ry="4" fill="#ffed4e" opacity="0.9">
                            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.8s" repeatCount="indefinite"/>
                            <animate attributeName="ry" values="4;5;4" dur="0.8s" repeatCount="indefinite"/>
                        </ellipse>
                    </g>
                </g>

                <!-- Evo 5 Form (Lv 250+) - Digital Archon (Ultimate) -->
                <g id="tm-mascot-evo5" style="display: none;">
                    <defs>
                        <linearGradient id="evo5-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#e5cc80;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d4af37;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="evo5-rainbow-glow">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#e5cc80;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#d4af37;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Ultimate antenna halo -->
                    <g class="tm-mascot-antenna">
                        <!-- Halo ring -->
                        <circle cx="50" cy="5" r="20" fill="none" stroke="#e5cc80" stroke-width="2" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <!-- Central spire -->
                        <line x1="50" y1="15" x2="50" y2="-5" stroke="#d4af37" stroke-width="4.5" stroke-linecap="round"/>
                        <circle cx="50" cy="-5" r="6" fill="#fff" stroke="#e5cc80" stroke-width="2">
                            <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <!-- Satellite spikes -->
                        <line x1="40" y1="15" x2="36" y2="4" stroke="#d4af37" stroke-width="3.5" stroke-linecap="round"/>
                        <line x1="60" y1="15" x2="64" y2="4" stroke="#d4af37" stroke-width="3.5" stroke-linecap="round"/>
                        <circle cx="36" cy="4" r="4" fill="#e5cc80" stroke="#fff" stroke-width="1.5">
                            <animate attributeName="fill" values="#e5cc80;#fff;#e5cc80" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="64" cy="4" r="4" fill="#e5cc80" stroke="#fff" stroke-width="1.5">
                            <animate attributeName="fill" values="#e5cc80;#fff;#e5cc80" dur="2s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                    <!-- Ultimate Divine Head -->
                    <g class="tm-mascot-main-body">
                        <rect x="18" y="8" width="64" height="54" rx="18" fill="url(#evo5-body-grad)" stroke="#d4af37" stroke-width="6"/>
                        <!-- Divine glow aura -->
                        <ellipse cx="50" cy="35" rx="40" ry="34" fill="url(#evo5-rainbow-glow)" opacity="0.7"/>
                        <!-- Sacred geometry -->
                        <path d="M 50 20 L 58 28 L 50 36 L 42 28 Z" stroke="#e5cc80" stroke-width="2" fill="none" opacity="0.5">
                            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite"/>
                        </path>
                        <!-- Divine eyes with multiple rings -->
                        <g class="tm-mascot-eye-open">
                            <circle cx="37" cy="38" r="10" fill="#ffffff" opacity="0.3"/>
                            <circle cx="37" cy="38" r="7" fill="#e5cc80">
                                <animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="37" cy="38" r="4" fill="#fff"/>
                            <circle cx="35" cy="36" r="1.5" fill="#d4af37"/>
                            <circle cx="63" cy="38" r="10" fill="#ffffff" opacity="0.3"/>
                            <circle cx="63" cy="38" r="7" fill="#e5cc80">
                                <animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="63" cy="38" r="4" fill="#fff"/>
                            <circle cx="61" cy="36" r="1.5" fill="#d4af37"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 27 38 Q 37 32 47 38" stroke="#d4af37" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 53 38 Q 63 32 73 38" stroke="#d4af37" stroke-width="4" fill="none" stroke-linecap="round"/>
                        </g>
                        <!-- Divine smile -->
                        <path class="tm-mascot-mouth-happy" d="M 34 52 Q 50 62 66 52" stroke="#d4af37" stroke-width="5" fill="none" stroke-linecap="round">
                            <animate attributeName="stroke" values="#d4af37;#e5cc80;#fff;#e5cc80;#d4af37" dur="3s" repeatCount="indefinite"/>
                        </path>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 34 56 Q 50 48 66 56" stroke="#d4af37" stroke-width="5" fill="none" stroke-linecap="round"/>
                        <!-- Ultimate divine body -->
                        <rect x="14" y="58" width="72" height="38" rx="14" fill="#fffaec" stroke="#d4af37" stroke-width="6"/>
                        <!-- Energy panels with animation -->
                        <rect x="20" y="64" width="18" height="26" fill="#e5cc80" rx="5" opacity="0.3">
                            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite"/>
                        </rect>
                        <rect x="62" y="64" width="18" height="26" fill="#e5cc80" rx="5" opacity="0.3">
                            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite"/>
                        </rect>
                        <!-- Divine core with orbiting particles -->
                        <circle cx="50" cy="78" r="9" fill="#d4af37" stroke="#e5cc80" stroke-width="2.5">
                            <animate attributeName="r" values="9;11;9" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="50" cy="78" r="5" fill="#fff" opacity="0.8"/>
                        <circle cx="50" cy="78" r="2" fill="#d4af37">
                            <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                    <!-- Ultimate plasma thrusters -->
                    <g class="tm-mascot-thrusters">
                        <rect class="tm-mascot-thruster-left" x="23" y="96" width="22" height="18" fill="#d4af37" rx="7" stroke="#b8924c" stroke-width="3"/>
                        <rect class="tm-mascot-thruster-right" x="55" y="96" width="22" height="18" fill="#d4af37" rx="7" stroke="#b8924c" stroke-width="3"/>
                        <!-- Plasma flames -->
                        <ellipse cx="34" cy="105" rx="7" ry="5" fill="#fff" opacity="0.9">
                            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.7s" repeatCount="indefinite"/>
                            <animate attributeName="ry" values="5;7;5" dur="0.7s" repeatCount="indefinite"/>
                        </ellipse>
                        <ellipse cx="66" cy="105" rx="7" ry="5" fill="#fff" opacity="0.9">
                            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.7s" repeatCount="indefinite"/>
                            <animate attributeName="ry" values="5;7;5" dur="0.7s" repeatCount="indefinite"/>
                        </ellipse>
                        <!-- Outer glow -->
                        <ellipse cx="34" cy="108" rx="9" ry="6" fill="#e5cc80" opacity="0.5">
                            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.7s" repeatCount="indefinite"/>
                        </ellipse>
                        <ellipse cx="66" cy="108" rx="9" ry="6" fill="#e5cc80" opacity="0.5">
                            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.7s" repeatCount="indefinite"/>
                        </ellipse>
                    </g>
                </g>

                <!-- Enhanced Accessories (apply to all forms) -->
                <!-- Top Hat - Classic gentleman's hat with ribbon -->
                <g id="top_hat" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="30" y="2" width="40" height="4" fill="#1a1a1a" rx="2"/>
                    <rect x="32" y="4" width="36" height="1" fill="#444"/>
                    <rect x="35" y="-8" width="30" height="18" fill="#1a1a1a" rx="1"/>
                    <rect x="36" y="-6" width="28" height="14" fill="#2d2d2d"/>
                    <rect x="38" y="0" width="24" height="3" fill="#dc3545"/>
                    <ellipse cx="50" cy="1.5" rx="3" ry="1" fill="#ff6b6b" opacity="0.6"/>
                </g>
                
                <!-- Master's Crown - Legendary reward with gems -->
                <g id="master_crown" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <defs>
                        <radialGradient id="crown-gold">
                            <stop offset="0%" style="stop-color:#ffe066;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffc107;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="gem-blue">
                            <stop offset="0%" style="stop-color:#66d9ff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0088cc;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <path d="M 28 8 L 33 -2 L 43 3 L 50 -5 L 57 3 L 67 -2 L 72 8 Z" fill="url(#crown-gold)" stroke="#e5cc80" stroke-width="1.5" stroke-linejoin="round"/>
                    <circle cx="38" cy="3" r="2" fill="url(#gem-blue)" stroke="#0066aa" stroke-width="0.5"/>
                    <circle cx="50" cy="-1" r="2.5" fill="#ff6b8a" stroke="#cc3366" stroke-width="0.5"/>
                    <circle cx="62" cy="3" r="2" fill="#90ee90" stroke="#22aa44" stroke-width="0.5"/>
                    <ellipse cx="50" cy="7" rx="16" ry="2" fill="#ffc107" opacity="0.3"/>
                </g>
                
                <!-- Book - Detailed with pages and bookmark -->
                <g class="tm-mascot-accessory tm-mascot-book" style="display: none;">
                    <rect x="18" y="48" width="28" height="24" fill="#8b4513" rx="2" stroke="#5d2e0f" stroke-width="1"/>
                    <rect x="20" y="50" width="24" height="20" fill="#d4a574" rx="1"/>
                    <line x1="32" y1="50" x2="32" y2="70" stroke="#8b4513" stroke-width="0.5"/>
                    <rect x="23" y="54" width="7" height="1" fill="#8b4513" opacity="0.5"/>
                    <rect x="23" y="58" width="6" height="1" fill="#8b4513" opacity="0.5"/>
                    <rect x="34" y="54" width="6" height="1" fill="#8b4513" opacity="0.5"/>
                    <rect x="34" y="58" width="7" height="1" fill="#8b4513" opacity="0.5"/>
                    <rect x="39" y="48" width="2" height="10" fill="#dc3545"/>
                </g>
                
                <!-- Bicycle - Detailed with spokes and pedals -->
                <g class="tm-mascot-accessory tm-mascot-bicycle" style="display: none;">
                    <rect x="20" y="80" width="60" height="4" fill="#e74c3c" rx="2"/>
                    <rect x="45" y="78" width="10" height="2" fill="#c0392b" rx="1"/>
                    <circle cx="30" cy="90" r="6" stroke="#2c3e50" stroke-width="2" fill="none"/>
                    <circle cx="30" cy="90" r="2" fill="#34495e"/>
                    <line x1="26" y1="86" x2="34" y2="94" stroke="#95a5a6" stroke-width="0.8"/>
                    <line x1="34" y1="86" x2="26" y2="94" stroke="#95a5a6" stroke-width="0.8"/>
                    <circle cx="70" cy="90" r="6" stroke="#2c3e50" stroke-width="2" fill="none"/>
                    <circle cx="70" cy="90" r="2" fill="#34495e"/>
                    <line x1="66" y1="86" x2="74" y2="94" stroke="#95a5a6" stroke-width="0.8"/>
                    <line x1="74" y1="86" x2="66" y2="94" stroke="#95a5a6" stroke-width="0.8"/>
                    <rect x="48" y="82" width="4" height="2" fill="#7f8c8d" rx="0.5"/>
                </g>
                
                <!-- Juggling Balls - Colorful with shine effect -->
                <g class="tm-mascot-accessory tm-mascot-ball" style="display: none;">
                    <defs>
                        <radialGradient id="ball-shine-1">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="70%" style="stop-color:#ffc107;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f39c12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ball-shine-2">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="70%" style="stop-color:#ff5722;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e64a19;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ball-shine-3">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="70%" style="stop-color:#17a2b8;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#138496;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Ball 1 (Yellow) -->
                    <g class="tm-mascot-ball-1">
                        <circle cx="50" cy="10" r="6" fill="url(#ball-shine-1)"/>
                        <ellipse cx="48" cy="8" rx="2" ry="1.5" fill="#fff" opacity="0.6"/>
                    </g>
                    <!-- Ball 2 (Red) - slightly offset in time -->
                    <g class="tm-mascot-ball-2">
                        <circle cx="50" cy="10" r="6" fill="url(#ball-shine-2)"/>
                        <ellipse cx="48" cy="8" rx="2" ry="1.5" fill="#fff" opacity="0.6"/>
                    </g>
                    <!-- Ball 3 (Cyan) - offset again -->
                    <g class="tm-mascot-ball-3">
                        <circle cx="50" cy="10" r="6" fill="url(#ball-shine-3)"/>
                        <ellipse cx="48" cy="8" rx="2" ry="1.5" fill="#fff" opacity="0.6"/>
                    </g>
                </g>
                <!-- New: Thinking Accessory -->
                <g class="tm-mascot-accessory tm-mascot-thinking-bubble" style="display: none;" transform="translate(15, -35)">
                    <path d="M 50 20 C 65 10, 75 25, 60 35 C 70 45, 55 55, 40 45" fill="white" stroke="#333" stroke-width="2"/>
                    <text x="50" y="38" font-size="18" font-family="Arial" font-weight="bold" text-anchor="middle">?</text>
                </g>
                <!-- New: Glitching Accessory -->
                <g class="tm-mascot-accessory tm-mascot-sparks" style="display: none;">
                    <path d="M 40 20 L 45 30 L 35 30 Z" fill="#ffc107" transform="rotate(20 40 25)"/>
                    <path d="M 60 40 L 65 50 L 55 50 Z" fill="#17a2b8" transform="rotate(-30 60 45)"/>
                </g>
                <!-- New: Eureka Accessory -->
                <g class="tm-mascot-accessory tm-mascot-eureka-bubble" style="display: none;" transform="translate(15, -35)">
                    <path d="M 50 20 C 65 10, 75 25, 60 35 C 70 45, 55 55, 40 45" fill="white" stroke="#333" stroke-width="2"/>
                    <text x="50" y="38" font-size="24" font-family="Arial" text-anchor="middle">💡</text>
                </g>
                <!-- Enhanced Weather Accessories -->
                <!-- Cool Sunglasses - Detailed with reflections (positioned over eyes) -->
                <g class="tm-mascot-accessory tm-mascot-sunglasses" style="display: none;" transform="translate(0, 0)">
                    <defs>
                        <linearGradient id="lens-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Left lens -->
                    <rect x="32" y="30" width="16" height="9" rx="4" fill="url(#lens-gradient)" stroke="#000" stroke-width="1.2"/>
                    <!-- Right lens -->
                    <rect x="52" y="30" width="16" height="9" rx="4" fill="url(#lens-gradient)" stroke="#000" stroke-width="1.2"/>
                    <!-- Reflections -->
                    <rect x="34" y="32" width="4" height="2" fill="#87ceeb" opacity="0.6" rx="1"/>
                    <rect x="54" y="32" width="4" height="2" fill="#87ceeb" opacity="0.6" rx="1"/>
                    <!-- Bridge -->
                    <line x1="48" y1="34" x2="52" y2="34" stroke="#1a1a1a" stroke-width="2"/>
                    <!-- Temples (arms) -->
                    <line x1="30" y1="34" x2="24" y2="34" stroke="#1a1a1a" stroke-width="1.5"/>
                    <line x1="68" y1="34" x2="76" y2="34" stroke="#1a1a1a" stroke-width="1.5"/>
                </g>
                
                <!-- Umbrella - Detailed with panels and handle -->
                <g class="tm-mascot-accessory tm-mascot-umbrella" style="display: none;" transform="translate(40, -30) rotate(-20)">
                    <defs>
                        <linearGradient id="umbrella-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#c0392b;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M 0 20 Q 12.5 2 25 20" fill="url(#umbrella-gradient)" stroke="#a93226" stroke-width="1.5"/>
                    <path d="M 25 20 Q 37.5 2 50 20" fill="#e74c3c" stroke="#a93226" stroke-width="1.5"/>
                    <line x1="0" y1="20" x2="8" y2="18" stroke="#a93226" stroke-width="1"/>
                    <line x1="25" y1="20" x2="25" y2="18" stroke="#a93226" stroke-width="1"/>
                    <line x1="50" y1="20" x2="42" y2="18" stroke="#a93226" stroke-width="1"/>
                    <line x1="25" y1="20" x2="25" y2="42" stroke="#34495e" stroke-width="2.5"/>
                    <path d="M 25 42 Q 27 44 25 46" stroke="#34495e" stroke-width="2.5" fill="none"/>
                </g>
                
                <!-- Beach Umbrella - Colorful striped parasol -->
                <g id="beach_umbrella" class="tm-mascot-accessory" style="display: none;" transform="translate(40, -30) rotate(-20)">
                    <defs>
                        <linearGradient id="beach-stripe-1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffb300;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="beach-stripe-2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#00bcd4;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0097a7;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Striped canopy panels -->
                    <path d="M 0 20 Q 12.5 2 25 20" fill="url(#beach-stripe-1)" stroke="#e0a800" stroke-width="1.5"/>
                    <path d="M 25 20 Q 37.5 2 50 20" fill="url(#beach-stripe-2)" stroke="#00838f" stroke-width="1.5"/>
                    <!-- Panel lines -->
                    <line x1="0" y1="20" x2="8" y2="18" stroke="#e0a800" stroke-width="1"/>
                    <line x1="25" y1="20" x2="25" y2="18" stroke="#00838f" stroke-width="1"/>
                    <line x1="50" y1="20" x2="42" y2="18" stroke="#e0a800" stroke-width="1"/>
                    <!-- Pole -->
                    <line x1="25" y1="20" x2="25" y2="42" stroke="#8b4513" stroke-width="2.5"/>
                    <path d="M 25 42 Q 27 44 25 46" stroke="#8b4513" stroke-width="2.5" fill="none"/>
                    <!-- Top ornament -->
                    <circle cx="25" cy="2" r="2.5" fill="#ff4081"/>
                </g>
                
                <!-- New: Power-Save Accessory -->
                <g class="tm-mascot-accessory tm-mascot-zzz-bubble" style="display: none;" transform="translate(15, -35)">
                    <text x="50" y="0" font-size="18" font-family="Arial" font-weight="bold" text-anchor="middle">Zzz</text>
                </g>
                
                <!-- Additional Hats & Headwear -->
                <g id="cowboy_hat" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <ellipse cx="50" cy="10" rx="20" ry="4" fill="#8b4513" stroke="#654321" stroke-width="1.5"/>
                    <path d="M 35 10 Q 50 -5 65 10" fill="#a0522d" stroke="#654321" stroke-width="1.5"/>
                    <rect x="45" y="1" width="10" height="9" rx="2" fill="#8b4513" stroke="#654321" stroke-width="1"/>
                </g>
                
                <g id="party_hat" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <path d="M 35 12 L 50 -10 L 65 12 Z" fill="#ff6b9d" stroke="#e91e63" stroke-width="1.5"/>
                    <circle cx="50" cy="-8" r="4" fill="#ffd700"/>
                    <ellipse cx="50" cy="12" rx="18" ry="3" fill="#ff1493"/>
                </g>
                
                <g id="wizard_hat" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <path d="M 35 12 Q 50 -15 65 12" fill="#4b0082" stroke="#2d004d" stroke-width="1.5"/>
                    <ellipse cx="50" cy="12" rx="18" ry="3" fill="#2d004d"/>
                    <circle cx="45" cy="2" r="2.5" fill="#ffd700"/>
                    <circle cx="55" cy="-3" r="2" fill="#ffd700"/>
                    <circle cx="48" cy="-8" r="2" fill="#ffd700"/>
                </g>
                
                <g id="chef_hat" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="35" y="8" width="30" height="5" rx="2" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
                    <ellipse cx="42" cy="4" rx="6" ry="8" fill="#ffffff" stroke="#ddd" stroke-width="1"/>
                    <ellipse cx="50" cy="2" rx="7" ry="10" fill="#ffffff" stroke="#ddd" stroke-width="1"/>
                    <ellipse cx="58" cy="4" rx="6" ry="8" fill="#ffffff" stroke="#ddd" stroke-width="1"/>
                </g>
                
                <g id="halo" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <ellipse cx="50" cy="-5" rx="15" ry="3" fill="none" stroke="#ffd700" stroke-width="2.5" opacity="0.8"/>
                    <ellipse cx="50" cy="-5" rx="15" ry="3" fill="#ffff00" opacity="0.2"/>
                </g>
                
                <g id="santa_hat" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <path d="M 35 12 Q 45 -10 65 12" fill="#c62828" stroke="#8b0000" stroke-width="1.5"/>
                    <ellipse cx="50" cy="12" rx="18" ry="3" fill="#ffffff"/>
                    <circle cx="64" cy="-8" r="5" fill="#ffffff" stroke="#ddd" stroke-width="1"/>
                </g>
                
                <g id="flower_crown" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <ellipse cx="50" cy="8" rx="22" ry="4" fill="#90ee90" stroke="#228b22" stroke-width="1"/>
                    <circle cx="38" cy="5" r="3" fill="#ff69b4"/>
                    <circle cx="50" cy="3" r="3.5" fill="#ffb6c1"/>
                    <circle cx="62" cy="5" r="3" fill="#ff1493"/>
                </g>
                
                <g id="laurel_wreath" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <ellipse cx="50" cy="8" rx="24" ry="5" fill="#228b22" stroke="#006400" stroke-width="1.5"/>
                    <circle cx="35" cy="8" r="2" fill="#ffd700"/>
                    <circle cx="65" cy="8" r="2" fill="#ffd700"/>
                </g>
                
                <g id="devil_horns" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <path d="M 30 10 Q 32 -5 35 5" fill="#8b0000" stroke="#4d0000" stroke-width="1.5"/>
                    <path d="M 70 10 Q 68 -5 65 5" fill="#8b0000" stroke="#4d0000" stroke-width="1.5"/>
                </g>
                
                <g id="ninja_mask" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="28" y="22" width="44" height="18" rx="3" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
                    <rect x="34" y="30" width="11" height="7" rx="1" fill="#2c3e50"/>
                    <rect x="55" y="30" width="11" height="7" rx="1" fill="#2c3e50"/>
                </g>
                
                <!-- Eyewear -->
                <g id="nerd_glasses" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="32" y="28" width="14" height="10" rx="2" fill="none" stroke="#000" stroke-width="2"/>
                    <rect x="54" y="28" width="14" height="10" rx="2" fill="none" stroke="#000" stroke-width="2"/>
                    <line x1="46" y1="33" x2="54" y2="33" stroke="#000" stroke-width="2"/>
                    <line x1="32" y1="33" x2="28" y2="31" stroke="#000" stroke-width="1.5"/>
                    <line x1="68" y1="33" x2="72" y2="31" stroke="#000" stroke-width="1.5"/>
                </g>
                
                <g id="monocle" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <circle cx="60" cy="33" r="7" fill="none" stroke="#2c3e50" stroke-width="2"/>
                    <circle cx="60" cy="33" r="6" fill="rgba(255,255,255,0.2)"/>
                    <line x1="67" y1="30" x2="72" y2="28" stroke="#2c3e50" stroke-width="1.5"/>
                </g>
                
                <!-- Tools & Items -->
                <g id="skateboard" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="20" y="92" width="60" height="6" rx="3" fill="#ff6347" stroke="#d32f2f" stroke-width="1.5"/>
                    <circle cx="30" cy="100" r="3" fill="#2c3e50"/>
                    <circle cx="70" cy="100" r="3" fill="#2c3e50"/>
                </g>
                
                <g id="magic_wand" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <g transform="translate(75, 60) rotate(45)">
                        <rect x="-2" y="-15" width="4" height="30" rx="2" fill="#8b4513" stroke="#654321" stroke-width="0.8"/>
                        <polygon points="0,-17 6,-15 0,-11 -6,-15" fill="#ffd700" stroke="#ffed4e" stroke-width="1"/>
                        <circle cx="0" cy="-15" r="1" fill="#fff" opacity="0.8"/>
                    </g>
                </g>
                
                <g id="camera" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="70" y="58" width="18" height="12" rx="3" fill="#2c3e50" stroke="#1a252f" stroke-width="1.5"/>
                    <circle cx="79" cy="64" r="4.5" fill="#34495e" stroke="#2c3e50" stroke-width="1"/>
                    <circle cx="79" cy="64" r="2.5" fill="#95a5a6"/>
                    <rect x="85" y="60" width="2" height="2" rx="0.5" fill="#e74c3c"/>
                </g>
                
                <g id="microphone" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <ellipse cx="12" cy="60" rx="4" ry="8" fill="#95a5a6" stroke="#7f8c8d" stroke-width="1.5"/>
                    <rect x="10" y="68" width="4" height="15" fill="#34495e" stroke-width="1"/>
                    <ellipse cx="12" cy="83" rx="5" ry="2" fill="#2c3e50"/>
                </g>
                
                <g id="guitar" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <g transform="translate(10, 65) rotate(-25)">
                        <ellipse cx="0" cy="0" rx="10" ry="13" fill="#8b4513" stroke="#654321" stroke-width="1.5"/>
                        <circle cx="0" cy="0" r="5" fill="#2c3e50" opacity="0.3"/>
                        <rect x="-2" y="-18" width="4" height="18" fill="#654321" stroke="#4a3319" stroke-width="1"/>
                        <rect x="-4" y="-20" width="8" height="4" rx="1" fill="#8b4513" stroke="#654321" stroke-width="1"/>
                    </g>
                </g>
                
                <!-- Premium Items -->
                <g id="diamond_ring" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <ellipse cx="78" cy="58" rx="3" ry="3.5" fill="#c0c0c0" stroke="#999" stroke-width="1"/>
                    <polygon points="78,54 81,57 78,60 75,57" fill="#b9f2ff" stroke="#4dd0e1" stroke-width="0.8"/>
                    <circle cx="78" cy="57" r="0.8" fill="#fff" opacity="0.8"/>
                </g>
                
                <g id="golden_trophy" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="8" y="55" width="6" height="3" fill="#8b4513"/>
                    <rect x="7" y="58" width="8" height="2" fill="#654321"/>
                    <path d="M 6 46 L 6 55 L 16 55 L 16 46 Q 16 43 11 43 Q 6 43 6 46" fill="#ffd700" stroke="#ffed4e" stroke-width="1"/>
                    <circle cx="4" cy="49" r="2" fill="#ffd700"/>
                    <circle cx="18" cy="49" r="2" fill="#ffd700"/>
                </g>
                
                <g id="rainbow_wings" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <!-- Left wing -->
                    <ellipse cx="15" cy="60" rx="10" ry="20" fill="#ff0000" opacity="0.4" transform="rotate(-30 15 60)"/>
                    <ellipse cx="18" cy="62" rx="9" ry="18" fill="#ff7f00" opacity="0.4" transform="rotate(-25 18 62)"/>
                    <ellipse cx="21" cy="64" rx="8" ry="16" fill="#ffff00" opacity="0.4" transform="rotate(-20 21 64)"/>
                    <!-- Right wing -->
                    <ellipse cx="85" cy="60" rx="10" ry="20" fill="#4b0082" opacity="0.4" transform="rotate(30 85 60)"/>
                    <ellipse cx="82" cy="62" rx="9" ry="18" fill="#0000ff" opacity="0.4" transform="rotate(25 82 62)"/>
                    <ellipse cx="79" cy="64" rx="8" ry="16" fill="#00ff00" opacity="0.4" transform="rotate(20 79 64)"/>
                </g>
                
                <g id="power_glove" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="6" y="62" width="10" height="14" rx="2" fill="#ff4500" stroke="#d32f2f" stroke-width="1.5"/>
                    <rect x="7" y="64" width="8" height="3" fill="#ffd700" opacity="0.6"/>
                    <circle cx="11" cy="69" r="2" fill="#ffeb3b"/>
                    <circle cx="11" cy="69" r="3" fill="#ff0" opacity="0.3"/>
                </g>
                
                <g id="vip_pass" class="tm-mascot-accessory" style="display: none;" transform="translate(0, 0)">
                    <rect x="74" y="60" width="12" height="16" rx="2" fill="#ffd700" stroke="#ffed4e" stroke-width="1.5"/>
                    <text x="80" y="70" font-size="6" font-weight="bold" text-anchor="middle" fill="#8b4513">VIP</text>
                    <rect x="76" y="62" width="8" height="2" fill="#fff" opacity="0.3"/>
                </g>
            </g>
        </svg>
    `;
    document.body.appendChild(container);

    const interactionPanel = container.querySelector('#tm-mascot-interaction-panel');

    // --- Dodge on fast hover logic ---
    let lastMousePos = { x: 0, y: 0, time: 0 };
    container.addEventListener('mouseenter', () => {
        lastMousePos = { x: 0, y: 0, time: 0 }; // Reset on enter
    });
    container.addEventListener('mousemove', (e) => {
        if (lastMousePos.time === 0) {
            lastMousePos = { x: e.clientX, y: e.clientY, time: Date.now() };
            return;
        }

        const now = Date.now();
        const timeDiff = now - lastMousePos.time;

        if (timeDiff < 25) return; // Sample every 25ms

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = distance / timeDiff; // pixels per millisecond

        lastMousePos = { x: e.clientX, y: e.clientY, time: now };

        const speedThreshold = 1.5; // 1500 pixels/second
        if (speed > speedThreshold) {
            triggerDodgeAnimation(config, deltaX, deltaY);
        }
    });


    // --- Pet Interaction Logic ---
    container.addEventListener('click', (e) => {
        // Ignore clicks on the panel's buttons
        if (e.target.closest('button')) return;

        // Dynamically position panel based on mascot's vertical position
        const mascotRect = container.getBoundingClientRect(); // Mascot's position on screen
        const panelHeight = interactionPanel.offsetHeight || 150; // Use offsetHeight or fallback
        const panelWidth = interactionPanel.offsetWidth || 180; // Use offsetWidth or fallback

        // Vertical positioning: show below if not enough space above
        if (mascotRect.top < panelHeight + 20) {
            interactionPanel.style.bottom = 'auto';
            interactionPanel.style.top = '110px';
        } else { // Otherwise, show panel above (default CSS position)
            interactionPanel.style.top = 'auto';
            interactionPanel.style.bottom = '110px';
        }

        // Horizontal positioning: Keep the panel fully inside the viewport.
        if (mascotRect.left + panelWidth > window.innerWidth - 10) { // If it would go off the right edge...
            // ...align the panel's right edge with the mascot's right edge.
            interactionPanel.style.left = 'auto';
            interactionPanel.style.right = '0px'; // Aligns panel's right to mascot's right
        } else { // Otherwise, align left edge with mascot's left edge (default CSS position)
            interactionPanel.style.left = '0px';
            interactionPanel.style.right = 'auto';
        }

        const willBeVisible = interactionPanel.style.display !== 'flex';
        if (willBeVisible) {
            stopRoaming(config);
            interactionPanel.style.display = 'flex';
            // Greeting messages when clicked
            const greetingMessages = [
                'Ναι ρε;', 'Τι κάνουμε;', 'Έλα!', 'Λέγε!', 
                'Με φώναξες;', 'Sup?', 'Τι θες ρε;', 'Εδώ είμαι φίλε!',
                'Φτιάχνουμε;', 'Βοήθεια θες;', 'Πάμε για δουλίτσα!', 'Λέγε φίλε!'
            ];
            showMascotBubble(greetingMessages[Math.floor(Math.random() * greetingMessages.length)], 2000);
        } else {
            interactionPanel.style.display = 'none';
            console.log('[MMS Mascot] Closing interaction panel...');
            
            // Farewell messages when closing
            const byeMessages = ['Γεια ρε!', 'Τα λέμε!', 'Πάω!', 'Ciao!', 'Φιλάκια!', 'Άντε!'];
            if (Math.random() < 0.5) { // 50% chance to say goodbye
                showMascotBubble(byeMessages[Math.floor(Math.random() * byeMessages.length)], 1500);
            }
            
            // Force mascot to idle state and resume roaming
            setTimeout(() => {
                const mascotContainer = document.getElementById('tm-mascot-container');
                console.log('[MMS Mascot] Panel closed. Resuming activity...');
                
                // Check stats and set appropriate state
                if (petStats.hunger < 30 || petStats.happiness < 30) {
                    setMascotState(config, 'sad');
                } else {
                    setMascotState(config, 'idle');
                }
                
                // Explicitly start roaming if idle
                if (mascotContainer && mascotContainer.classList.contains('mascot-idle') && !isRoaming) {
                    startRoaming(config);
                }
            }, 200);
        }
        e.stopPropagation();
    });
    document.body.addEventListener('click', (e) => {
        // Close the panel if the click is outside of it and the mascot container.
        if (interactionPanel.style.display === 'flex' && !interactionPanel.contains(e.target) && !container.contains(e.target)) {
            container.click();
        }
    });

    container.querySelector('#tm-pet-feed-btn').addEventListener('click', () => {
        if (petStats.hunger < 100) {
            const feedMessages = [
                'Νόστιμο ρε!', 'Ωραίος!', 'Μμμμ!', 'Γαμάτο!', 
                'Πεινάω ρε!', 'Νάμ νάμ!', 'Ευχαριστώ φίλε!', 'Άλλο λίγο;',
                'Σουβλακάκι!', 'Γύρος παίζει;', 'Καφέδακι!', 'Τυρόπιτα ε;',
                'Burger time!', 'Pizza ρε!', 'Ενέργεια!', 'Φαγάκι!',
                'Yummy!', 'Κόλλησα!', 'Θα φάω!', 'Ωραία φάση!'
            ];
            updatePetStats(config, STORAGE_KEYS, 0, 30); // Pass config and STORAGE_KEYS
            trackDailyStat(config, STORAGE_KEYS, 'feedMascot'); // Grant XP
            setMascotState(config, 'eating', 2000);
            showMascotBubble(feedMessages[Math.floor(Math.random() * feedMessages.length)], 2000);
        } else {
            const fullMessages = ['Χόρτασα ρε!', 'Γεμάτος!', 'Όχι άλλο!', 'Μπας και σκάσω;', 'Αρκετά φίλε!'];
            showMascotBubble(fullMessages[Math.floor(Math.random() * fullMessages.length)], 1500);
        }
    });

    container.querySelector('#tm-pet-pet-btn').addEventListener('click', () => {
        if (petStats.happiness < 100) {
            const petMessages = [
                'Ω ναι ρε!', 'Αγάπη!', 'Ωραίος!', 'Γαμάτο!', 
                'Ακόμα ρε!', 'Χαίρομαι!', 'Ευχαριστώ φίλε!', 'Καλύτερα έτσι!',
                'Ωραία φάση!', 'Love it!', 'Ναι ρε!', 'Χίχι!',
                'Γαργαλάει!', 'Ωχού!', 'Πάλι πάλι!', 'Nice!',
                'Τέλεια!', 'Μου αρέσει!', 'Ωωω!', 'Γλυκά μου!'
            ];
            trackDailyStat(config, STORAGE_KEYS, 'petMascot'); // Grant XP
            updatePetStats(config, STORAGE_KEYS, 15, 0);
            setMascotState(config, 'happy', 2000);
            showMascotBubble(petMessages[Math.floor(Math.random() * petMessages.length)], 2000);
        } else {
            const maxHappyMessages = ['Μια χαρά είμαι!', 'Τέλειος!', 'All good!', 'Ήδη χαρούμενος!', 'Κομπλέ!'];
            showMascotBubble(maxHappyMessages[Math.floor(Math.random() * maxHappyMessages.length)], 1500);
        }
    });

    container.querySelector('#tm-play-bug-game-btn').addEventListener('click', () => {
        startBugSquishGame();
        interactionPanel.style.display = 'none';
    });

    container.querySelector('#tm-play-memory-game-btn').addEventListener('click', () => {
        startMemoryGame();
        interactionPanel.style.display = 'none'; // Close panel after starting game
    });
    // --- Load equipped items ---
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    if (equippedItems.length > 0) {
        console.log(`[MMS Mascot] Equipping items:`, equippedItems);
        equippedItems.forEach(itemId => {
            const accessory = getAccessoryElement(itemId); // Use the helper from the main script
            if (accessory) accessory.style.display = 'block';
            
            // Restore animation state for special accessories (except juggling - it's periodic)
            if (itemId === 'stunt_bike') {
                setMascotState(config, 'biking', 0);
            } else if (itemId === 'bookworm_kit') {
                setMascotState(config, 'reading', 0);
            }
        });
    }
    // --- Initialization ---
    loadPetStats(config, STORAGE_KEYS);
    resetIdleTimer(config);
    
    // Check and restore active buffs on page load
    const energizedExpires = GM_getValue(STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES, 0);
    const energizedDuration = GM_getValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`, 0);
    const energizedTimeLeft = energizedExpires - Date.now();
    
    if (energizedTimeLeft > 0 && energizedDuration > 0) {
        console.log(`[MMS] ⚡ Restoring energized buff: ${Math.ceil(energizedTimeLeft/1000)}s remaining`);
        
        // Restore energized state with remaining time (no popup on page load)
        setMascotState(config, 'energized', energizedTimeLeft);
        
        // Recreate particle effects
        const mascotContainer = document.getElementById('tm-mascot-container');
        if (mascotContainer) {
            // Remove any existing particles
            const oldParticles = mascotContainer.querySelector('.tm-electric-particles');
            if (oldParticles) oldParticles.remove();
            
            // Create particle container
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'tm-electric-particles';
            particlesContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 140px;
                height: 140px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 100;
            `;
            
            // Create 8 electric particles
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                const angle = (360 / 8) * i;
                const color = i % 2 === 0 ? '#00bfff' : '#ffd700';
                
                particle.style.cssText = `
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 8px ${color}, 0 0 12px ${color};
                    top: 50%;
                    left: 50%;
                    transform-origin: 0 0;
                    animation: tm-particle-orbit-${i} 2s ease-in-out infinite;
                    opacity: 0.9;
                `;
                
                // Create unique animation for each particle
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes tm-particle-orbit-${i} {
                        0% { 
                            transform: 
                                rotate(${angle}deg) 
                                translateX(50px) 
                                translateY(-3px)
                                scale(1);
                        }
                        50% { 
                            transform: 
                                rotate(${angle + 180}deg) 
                                translateX(60px) 
                                translateY(-3px)
                                scale(1.3);
                        }
                        100% { 
                            transform: 
                                rotate(${angle + 360}deg) 
                                translateX(50px) 
                                translateY(-3px)
                                scale(1);
                        }
                    }
                `;
                document.head.appendChild(style);
                particlesContainer.appendChild(particle);
            }
            
            mascotContainer.appendChild(particlesContainer);
            console.log('[MMS] ⚡ Restored electric particles on page load');
            
            // Remove particles when buff expires
            setTimeout(() => {
                if (particlesContainer && particlesContainer.parentNode) {
                    console.log('[MMS] ⚡ Removing electric particles (buff expired)');
                    particlesContainer.remove();
                }
            }, energizedTimeLeft);
        }
    } else {
        // No active energized buff, proceed with normal state
        updatePetStateByStats(config, STORAGE_KEYS); // Initial state check to start roaming
    }
    
    // Check for double coins buff and add visual effects
    const doubleCoinsExpires = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, 0);
    const doubleCoinsTimeLeft = doubleCoinsExpires - Date.now();
    if (doubleCoinsTimeLeft > 0) {
        const minutesLeft = Math.ceil(doubleCoinsTimeLeft / 60000);
        console.log(`[MMS] 💰 Double coins buff active: ${minutesLeft} min remaining (restored on page load)`);
        
        // Create golden coin particles (no popup on page load)
        const mascotContainer = document.getElementById('tm-mascot-container');
        if (mascotContainer) {
            // Remove any existing coin particles
            const oldCoins = mascotContainer.querySelector('.tm-coin-particles');
            if (oldCoins) oldCoins.remove();
            
            // Create coin particle container
            const coinsContainer = document.createElement('div');
            coinsContainer.className = 'tm-coin-particles';
            coinsContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 150px;
                height: 150px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 99;
            `;
            
            // Create 6 golden coin particles
            for (let i = 0; i < 6; i++) {
                const coin = document.createElement('div');
                const delay = i * 0.3;
                
                coin.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%);
                    border-radius: 50%;
                    box-shadow: 0 0 8px #ffc107, 0 0 15px rgba(255, 215, 0, 0.6);
                    top: 50%;
                    left: 50%;
                    animation: tm-coin-float-${i} 3s ease-in-out infinite;
                    animation-delay: ${delay}s;
                    opacity: 0.85;
                `;
                
                // Create unique floating animation for each coin
                const style = document.createElement('style');
                const startX = -30 + (i * 12);
                const endY = -60 - (Math.random() * 40);
                
                style.textContent = `
                    @keyframes tm-coin-float-${i} {
                        0% { 
                            transform: translate(${startX}px, 0px) scale(0.5);
                            opacity: 0;
                        }
                        20% { 
                            transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                            opacity: 0.85;
                        }
                        50% { 
                            transform: translate(${startX}px, ${endY}px) scale(1.2);
                            opacity: 1;
                        }
                        70% { 
                            transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                            opacity: 0.85;
                        }
                        100% { 
                            transform: translate(${startX}px, 0px) scale(0.5);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
                coinsContainer.appendChild(coin);
            }
            
            mascotContainer.appendChild(coinsContainer);
            console.log('[MMS] 💰 Restored coin particles on page load');
            
            // Remove coins when buff expires
            setTimeout(() => {
                if (coinsContainer && coinsContainer.parentNode) {
                    console.log('[MMS] 💰 Removing coin particles (buff expired)');
                    coinsContainer.remove();
                }
            }, doubleCoinsTimeLeft);
        }
    }

    // Listen for user activity to reset idle timer
    ['mousemove', 'keydown', 'click'].forEach(eventType => { // Pass config to resetIdleTimer
        document.addEventListener(eventType, () => resetIdleTimer(config));
    });

    // Periodic decay of stats
    setInterval(() => {
        // Only decay if user is active
        if (document.getElementById('tm-mascot-container').className.includes('sleeping')) return;
        updatePetStats(config, STORAGE_KEYS, -1, -2); // Happiness decays slower than hunger
    }, 60 * 1000); // Decay every minute

    // Periodic juggling animation (if balls are equipped)
    function checkPeriodicJuggling() {
        const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
        if (equippedItems.includes('juggling_balls')) {
            const mascotContainer = document.getElementById('tm-mascot-container');
            const interactionPanel = document.getElementById('tm-mascot-interaction-panel');
            
            // Only juggle if mascot is in idle/happy state, interaction panel is closed, and not energized
            if (mascotContainer && 
                (mascotContainer.classList.contains('mascot-idle') || mascotContainer.classList.contains('mascot-happy')) &&
                !mascotContainer.classList.contains('mascot-energized') &&
                (!interactionPanel || interactionPanel.style.display !== 'flex')) {
                
                // Duration synced to animation cycle (1.2s) to avoid mid-animation cutoff
                const jugglingDuration = 2400; // 2.4 seconds = 2 complete cycles
                setMascotState(config, 'juggling', jugglingDuration);
                
                // Optional: Show a message occasionally
                if (Math.random() < 0.3) { // 30% chance
                    const jugglingMessages = ['Κοίτα!', 'Ορίστε!', 'Check this!', 'Παρακολούθα!', 'Το κόλπο!'];
                    showMascotBubble(jugglingMessages[Math.floor(Math.random() * jugglingMessages.length)], 1500);
                }
            }
        }
        
        // Schedule next check at a random interval (20-40 seconds)
        const nextCheck = 20000 + Math.random() * 20000;
        setTimeout(checkPeriodicJuggling, nextCheck);
    }
    
    // Start periodic juggling checks after a random initial delay
    setTimeout(checkPeriodicJuggling, 15000 + Math.random() * 10000);

    // Update mascot appearance based on current level on page load
    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    updateMascotAppearanceByLevel(currentLevel);
    console.log(`[MMS Fun] Interactive Mascot initialized at level ${currentLevel}.`);
    
    // Set initial state and start roaming
    // Note: This must come AFTER buff restoration and accessory loading
    // If no state was set by buffs/accessories, set idle/sad based on stats
    const finalMascotContainer = document.getElementById('tm-mascot-container');
    const currentState = finalMascotContainer?.className || '';
    console.log(`[MMS Mascot] Final state check: "${currentState}"`);
    
    // If still no mascot- class (no energized, no biking, no reading), set based on stats
    if (!currentState.includes('mascot-energized') && 
        !currentState.includes('mascot-biking') && 
        !currentState.includes('mascot-reading')) {
        console.log('[MMS Mascot] Setting initial state based on stats...');
        updatePetStateByStats(config, STORAGE_KEYS); // This will set idle/sad and start roaming
    } else {
        console.log('[MMS Mascot] Special state already active, skipping default state.');
    }
}

/** Triggers the "Eureka!" animation for the mascot. */
function triggerEurekaAnimation(config) {
    setMascotState(config, 'eureka', 1500); // Animation lasts 1.5 seconds
    const eurekaMessages = [
        'Το βρήκα ρε!', 'Α! Αυτό ήταν!', 'Εδώ είναι το πρόβλημα!', 
        'Φυσικά ρε!', 'Μα ναι!', 'Eureka!', 'Το έπιασα!',
        'Α! Κατάλαβα!', 'Αυτό ψάχνω!', 'Got it!', 'Εννοείται ρε!'
    ];
    const msg = eurekaMessages[Math.floor(Math.random() * eurekaMessages.length)];
    showMascotBubble(msg, 1500);
}

/** Triggers the "Double Coins" visual effect for the mascot. */
function triggerDoubleCoinsEffect(config, STORAGE_KEYS, duration) {
    console.log(`[MMS] 💰 Triggering Double Coins Effect for ${duration/1000}s`);
    
    const expires = Date.now() + duration;
    GM_setValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, expires);
    GM_setValue(`${STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES}_duration`, duration);
    
    console.log(`[MMS] Double coins buff stored: expires at ${new Date(expires).toLocaleTimeString()}`);
    
    // Create golden coin particles
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (mascotContainer) {
        console.log('[MMS] 💰 Creating coin particles...');
        
        // Remove any existing coin particles
        const oldCoins = mascotContainer.querySelector('.tm-coin-particles');
        if (oldCoins) oldCoins.remove();
        
        // Create coin particle container
        const coinsContainer = document.createElement('div');
        coinsContainer.className = 'tm-coin-particles';
        coinsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 150px;
            height: 150px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 99;
        `;
        
        // Create 6 golden coin particles
        for (let i = 0; i < 6; i++) {
            const coin = document.createElement('div');
            const delay = i * 0.3;
            
            coin.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%);
                border-radius: 50%;
                box-shadow: 0 0 8px #ffc107, 0 0 15px rgba(255, 215, 0, 0.6);
                top: 50%;
                left: 50%;
                animation: tm-coin-float-${i} 3s ease-in-out infinite;
                animation-delay: ${delay}s;
                opacity: 0.85;
            `;
            
            // Create unique floating animation for each coin
            const style = document.createElement('style');
            const startX = -30 + (i * 12);
            const endY = -60 - (Math.random() * 40);
            
            style.textContent = `
                @keyframes tm-coin-float-${i} {
                    0% { 
                        transform: translate(${startX}px, 0px) scale(0.5);
                        opacity: 0;
                    }
                    20% { 
                        transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                        opacity: 0.85;
                    }
                    50% { 
                        transform: translate(${startX}px, ${endY}px) scale(1.2);
                        opacity: 1;
                    }
                    70% { 
                        transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                        opacity: 0.85;
                    }
                    100% { 
                        transform: translate(${startX}px, 0px) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            coinsContainer.appendChild(coin);
        }
        
        mascotContainer.appendChild(coinsContainer);
        console.log(`[MMS] 💰 Created ${coinsContainer.children.length} coin particles`);
        
        // Remove coins when buff expires
        setTimeout(() => {
            if (coinsContainer && coinsContainer.parentNode) {
                console.log('[MMS] 💰 Removing coin particles (buff expired)');
                coinsContainer.remove();
            }
        }, duration);
    }
    
    if (typeof window.showPositiveMessage === 'function') {
        window.showPositiveMessage('💰 Double Coins active for 10 minutes!');
    }
    if (typeof window.createNotification === 'function') {
        window.createNotification('💰 Double Coins active for 10 minutes!', '💰');
    }
    
    // Update buff timers UI - try now and retry if container not ready
    updateBuffTimersUI(config, STORAGE_KEYS);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 500);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 1000);
    
    console.log('[MMS] 💰 Double Coins effect activated successfully!');
}

/** Triggers the "Energized" state for the mascot, providing a temporary XP boost. */
function triggerEnergizedState(config, STORAGE_KEYS, duration) {
    console.log(`[MMS] 🔋 Triggering Energized State for ${duration/1000}s`);
    
    const expires = Date.now() + duration;
    GM_setValue(STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES, expires);
    GM_setValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`, duration); // Store total duration
    
    console.log(`[MMS] Energized buff stored: expires at ${new Date(expires).toLocaleTimeString()}`);

    setMascotState(config, 'energized', duration);
    
    // Create electric particle effects
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (mascotContainer) {
        console.log('[MMS] ⚡ Creating electric particles...');
        
        // Remove any existing particles
        const oldParticles = mascotContainer.querySelector('.tm-electric-particles');
        if (oldParticles) {
            console.log('[MMS] Removing old particles');
            oldParticles.remove();
        }
        
        // Create particle container
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'tm-electric-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 140px;
            height: 140px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 100;
        `;
        
        // Create 8 electric particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const angle = (360 / 8) * i;
            const color = i % 2 === 0 ? '#00bfff' : '#ffd700';
            
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 8px ${color}, 0 0 12px ${color};
                top: 50%;
                left: 50%;
                transform-origin: 0 0;
                animation: tm-particle-orbit-${i} 2s ease-in-out infinite;
                opacity: 0.9;
            `;
            
            // Create unique animation for each particle
            const style = document.createElement('style');
            style.textContent = `
                @keyframes tm-particle-orbit-${i} {
                    0% { 
                        transform: 
                            rotate(${angle}deg) 
                            translateX(50px) 
                            translateY(-3px)
                            scale(1);
                    }
                    50% { 
                        transform: 
                            rotate(${angle + 180}deg) 
                            translateX(60px) 
                            translateY(-3px)
                            scale(1.3);
                    }
                    100% { 
                        transform: 
                            rotate(${angle + 360}deg) 
                            translateX(50px) 
                            translateY(-3px)
                            scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
            particlesContainer.appendChild(particle);
        }
        
        mascotContainer.appendChild(particlesContainer);
        console.log(`[MMS] ⚡ Created ${particlesContainer.children.length} electric particles`);
        
        // Remove particles when buff expires
        setTimeout(() => {
            if (particlesContainer && particlesContainer.parentNode) {
                console.log('[MMS] ⚡ Removing electric particles (buff expired)');
                particlesContainer.remove();
            }
        }, duration);
    } else {
        console.warn('[MMS] Mascot container not found, cannot create particles');
    }
    
    if (typeof window.showPositiveMessage === 'function') {
        window.showPositiveMessage('Mascot is ENERGIZED! +10% XP Boost!');
    }
    if (typeof window.createNotification === 'function') {
        window.createNotification('Mascot is ENERGIZED! +10% XP Boost for 15 minutes!', '⚡');
    }

    // Update buff timers UI - try now and retry if container not ready
    updateBuffTimersUI(config, STORAGE_KEYS);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 500);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 1000);
    
    console.log('[MMS] ⚡ Energized state activated successfully!');
}

/** Updates the UI element for the energized buff timer. */
function updateBuffTimersUI(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-buff-timers-container');
    if (!container) {
        console.warn('[MMS Buff] Buff timers container not found in DOM.');
        return;
    }

    const buffs = [
        {
            id: 'energized',
            key: STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES,
            icon: '⚡',
            title: 'Energized! +10% XP Boost active.',
            color: '#00bfff' // DeepSkyBlue
        },
        {
            id: 'double_coins',
            key: STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES,
            icon: '💰',
            title: 'Double Coins active!',
            color: '#ffc107' // Gold
        }
    ];

    buffs.forEach(buff => {
        const expires = GM_getValue(buff.key, 0);
        const totalDuration = GM_getValue(`${buff.key}_duration`, 0);
        const timeLeft = expires - Date.now();
        let timerEl = document.getElementById(`tm-buff-timer-${buff.id}`);

        if (timeLeft > 0 && totalDuration > 0) {
            // Use smart time formatting if available
            const formattedTime = (typeof window.formatTimeRemaining === 'function') 
                ? window.formatTimeRemaining(timeLeft)
                : `${Math.ceil(timeLeft/1000)}s`;
            
            console.log(`[MMS Buff] ${buff.id} active: ${formattedTime} remaining`);
            
            if (!timerEl) {
                console.log(`[MMS Buff] Creating timer element for ${buff.id}`);
                timerEl = document.createElement('div');
                timerEl.id = `tm-buff-timer-${buff.id}`;
                timerEl.className = 'tm-buff-timer';
                timerEl.innerHTML = `
                    <svg viewBox="0 0 36 36">
                        <path class="tm-buff-timer-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="tm-buff-timer-circle" stroke="${buff.color}" stroke-dasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span class="tm-buff-timer-icon">${buff.icon}</span>
                `;
                container.appendChild(timerEl);
            }

            // Update tooltip with smart formatting
            timerEl.title = `${buff.title} (${formattedTime} remaining)`;

            const progress = (timeLeft / totalDuration) * 100;
            const circle = timerEl.querySelector('.tm-buff-timer-circle');
            if (circle) {
            circle.style.strokeDasharray = `${progress}, 100`;
            }

        } else {
            if (timerEl) {
                timerEl.remove();
            }
            // If the buff just expired, check if the mascot state needs updating
            if (buff.id === 'energized') {
                const mascotContainer = document.getElementById('tm-mascot-container');
                if (mascotContainer && mascotContainer.classList.contains('mascot-energized')) {
                    // Need STORAGE_KEYS from window scope
                    if (typeof window.STORAGE_KEYS !== 'undefined') {
                        updatePetStateByStats(config, window.STORAGE_KEYS, true); // Force revert from temp state
                    }
                }
            }
        }
    });
}


/** Fetches weather and updates the mascot's appearance. Runs once per session. */
function fetchWeatherAndReact(config) {
    if (!config.interactiveMascotEnabled) return;

    // Use a session flag to prevent multiple fetches
    if (sessionStorage.getItem('tm_weather_fetched')) return;

    // Athens coordinates (hardcoded)
    const lat = 37.9838;
    const lon = 23.7278;
    
    console.log(`[MMS Weather] Fetching weather for Athens (${lat}, ${lon})...`);

    // Fetch weather using Athens coordinates
                GM_xmlhttpRequest({
                    method: 'GET',
        url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code&timezone=auto`,
                    onload: function(weatherResponse) {
            console.log('[MMS Weather] Mascot weather response received');
                        try {
                            const weatherData = JSON.parse(weatherResponse.responseText);
                            const weatherCode = weatherData.current.weather_code;
                console.log(`[MMS Weather] Mascot weather code: ${weatherCode}`);
                            sessionStorage.setItem('tm_weather_fetched', 'true');

                            // Weather codes: 0-3 are generally clear/sunny. 51-99 are rainy/snowy.
                            if (weatherCode >= 0 && weatherCode <= 3) {
                    const sunnyMessages = [
                        'Τι μέρα ρε!', 'Ήλιος έχει!', 'Ωραίος καιρός!', 
                        'Καλός!', 'Λάμπει!', 'Τέλεια μέρα!',
                        'Ζέστη!', 'Καλοκαιράκι!', 'Sunny day!', 'Nice!'
                    ];
                                setMascotState(config, 'sunny', 120000); // Show for 2 minutes
                    showMascotBubble(sunnyMessages[Math.floor(Math.random() * sunnyMessages.length)], 3000);
                            } else if (weatherCode >= 51 && weatherCode <= 99) {
                    const rainyMessages = [
                        'Βροχή ρε...', 'Στάλα στάλα...', 'Μούσκεμα!', 
                        'Ουφ βρέχει...', 'Που είναι η ομπρέλα μου;', 'Βροχερό!',
                        'Τι μαύρα;', 'Έχει νερά!', 'Rainy day...', 'Άσχημα...'
                    ];
                                setMascotState(config, 'rainy', 120000); // Show for 2 minutes
                    showMascotBubble(rainyMessages[Math.floor(Math.random() * rainyMessages.length)], 3000);
                            }
                        } catch (e) {
                console.error('[MMS Weather] Failed to parse mascot weather data:', e);
                        }
                    },
                    onerror: function(error) {
            console.error('[MMS Weather] Failed to fetch mascot weather:', error);
        }
    });
}

function initMascotPageReactions(config) {
    if (!config.interactiveMascotEnabled) return;

    // Check for a success message
    const successMessage = document.querySelector('.rnr-message');
    if (successMessage && successMessage.offsetParent !== null) { // Check if it's visible
        const successMessages = [
            'Ωραία ρε!', 'Μπράβο!', 'Τέλεια!', 'Έγινε!', 'Success!', 
            'Γαμάτο!', 'Άψογα!', 'Εξαιρετικά!', 'Επισκευή OK!',
            'Perfect!', 'Κομπλέ!', 'Done!', 'Φοβερά!'
        ];
        setMascotState(config, 'happy', 3000);
        showMascotBubble(successMessages[Math.floor(Math.random() * successMessages.length)], 2000);
    }

    // Check for an error message
    const errorMessage = document.querySelector('.rnr-error');
    if (errorMessage && errorMessage.offsetParent !== null) {
        const errorMessages = [
            'Ουπς...', 'Τι έπαθε ρε;', 'Ωχ...', 'Πρόβλημα!', 
            'Δεν πάει καλά...', 'Μμμ...', 'Τι γίνεται;',
            'Error ρε!', 'Άσχημα...', 'Fuck...', 'Τι έγινε;'
        ];
        setMascotState(config, 'sad', 3000);
        showMascotBubble(errorMessages[Math.floor(Math.random() * errorMessages.length)], 2000);
    }
}

function updateMascotAppearanceByLevel(level) {
    console.log(`[MMS Mascot] 🔄 Updating mascot appearance for level ${level}...`);
    
    const base = document.getElementById('tm-mascot-base');
    const evo1 = document.getElementById('tm-mascot-evo1');
    const evo2 = document.getElementById('tm-mascot-evo2');
    const evo3 = document.getElementById('tm-mascot-evo3');
    const evo4 = document.getElementById('tm-mascot-evo4');
    const evo5 = document.getElementById('tm-mascot-evo5');

    if (!base || !evo1 || !evo2 || !evo3 || !evo4 || !evo5) {
        console.warn('[MMS Mascot] ⚠️ Evolution elements not found. Checking what exists...');
        console.log(`Base: ${!!base}, Evo1: ${!!evo1}, Evo2: ${!!evo2}, Evo3: ${!!evo3}, Evo4: ${!!evo4}, Evo5: ${!!evo5}`);
        return;
    }

    // Hide all forms first
    base.style.display = 'none';
    evo1.style.display = 'none';
    evo2.style.display = 'none';
    evo3.style.display = 'none';
    evo4.style.display = 'none';
    evo5.style.display = 'none';

    // Show the appropriate evolution based on level
    if (level >= 250) {
        evo5.style.display = 'block';
        console.log(`[MMS Mascot] ✅ Updated to Evo-5 DIGITAL ARCHON (Level ${level})`);
    } else if (level >= 100) {
        evo4.style.display = 'block';
        console.log(`[MMS Mascot] ✅ Updated to Evo-4 MASTER (Level ${level})`);
    } else if (level >= 50) {
        evo3.style.display = 'block';
        console.log(`[MMS Mascot] ✅ Updated to Evo-3 PROPHET (Level ${level})`);
    } else if (level >= 25) {
        evo2.style.display = 'block';
        console.log(`[MMS Mascot] ✅ Updated to Evo-2 ADVANCED (Level ${level})`);
    } else if (level >= 10) {
        evo1.style.display = 'block';
        console.log(`[MMS Mascot] ✅ Updated to Evo-1 SLEEK (Level ${level})`);
    } else {
        base.style.display = 'block';
        console.log(`[MMS Mascot] ✅ Updated to Base NOVICE (Level ${level})`);
    }
    
    const robot = document.querySelector('.tm-mascot-robot');
    if (robot) {
        const computedStyle = window.getComputedStyle(robot);
        console.log(`[MMS Mascot] Robot animation: ${computedStyle.animation}`);
    }
}

// Make functions globally accessible for external scripts
window.getAccessoryElement = getAccessoryElement;
window.updateMascotAppearanceByLevel = updateMascotAppearanceByLevel;
window.setMascotState = setMascotState;
window.showMascotBubble = showMascotBubble;
window.updatePetStats = updatePetStats;
window.triggerEurekaAnimation = triggerEurekaAnimation;
window.triggerEnergizedState = triggerEnergizedState;
window.triggerDoubleCoinsEffect = triggerDoubleCoinsEffect;
window.updateBuffTimersUI = updateBuffTimersUI;