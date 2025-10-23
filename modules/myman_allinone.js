
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