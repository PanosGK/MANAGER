
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
