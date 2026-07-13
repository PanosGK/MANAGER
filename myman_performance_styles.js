/** Global GPU/compositor savings — injected after theme styles. */
const PERFORMANCE_STYLES_BASE = `
/* ===== Theme performance (GPU) ===== */

/* Full-screen infinite animations repaint every frame */
body::before,
body::after {
    animation: none !important;
}
body {
    background-attachment: scroll !important;
    animation: none !important;
}

/* Heading flicker / glow on every page */
h1, h2, h3, h4, h5, h6, .pagetitle {
    animation: none !important;
    text-shadow: none !important;
}

/* backdrop-filter is the #1 GPU cost — use solid panels instead (not default-theme footer) */
.rnr-top, #head-outter, #footer-outter, #footer-outterwrap,
.rnr-cw-hmenu, .rnr-cw-pagination, .rnr-cw-pagination_bottom,
.rnr-s-menu, .rnr-s-grid, .rnr-c-hmenu, .rnr-c-pagination, .rnr-c-pagination_bottom,
.jconfirm, #tm-memory-game-overlay, #tm-game-overlay,
.tm-modal-overlay,
#tm-mascot-interaction-panel,
#tm-notification-backdrop {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

/* Drop expensive glow text on scroll/hover */
.rnr-gridtable tr.rnr-row:hover,
.rnr-row.style1:hover,
a:hover, .rnr-orderlink:hover,
.etdbadge,
.jconfirm-box .title,
.jconfirm-box .closeIcon:hover,
#footer-outterwrap td, #footer-outterwrap span,
.rnr-s-grid b, .rnr-s-grid strong,
.tm-settings-section h3,
#tm-positive-message, #tm-achievement-notification {
    text-shadow: none !important;
}

/* Modal overlays: solid dim, no blur */
.jconfirm { background: rgba(0, 0, 0, 0.82) !important; }
.tm-modal-overlay { background: var(--tm-shop-item-bg) !important; }

/* Level-up screen (rare) — skip heavy blur */
#tm-level-up-overlay,
.tm-level-up-content {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}
.tm-level-up-content {
    background: var(--tm-modal-bg, rgba(14, 14, 20, 0.96)) !important;
}
.tm-level-up-content::after {
    animation: none !important;
}

/* Default-theme decorative modal loops */
.tm-modal-content[style*="linear-gradient"] {
    animation: none !important;
}
.tm-modal-content[style*="linear-gradient"]::before {
    display: none !important;
    animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation: none !important;
        transition: none !important;
    }
}
`;

const PERFORMANCE_STYLES_DEFAULT_FOOTER = `
/* Default theme: glass footer widgets (never solid shop-item-bg) */
#tm-notification-bell-btn,
#tm-refresh-timer-container,
#tm-weather-widget,
#tm-settings-btn,
#tm-daily-dashboard-widget,
#tm-xp-bar-container,
#tm-coin-balance,
.tm-footer-widget,
.tm-buff-timer,
#tm-recent-repairs-btn {
    background: var(--tm-glass-bg, linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border-color: var(--tm-glass-border, rgba(255,255,255,0.2)) !important;
}
#tm-eod-btn {
    background: var(--tm-glass-bg, linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border-color: var(--tm-glass-border, rgba(255,255,255,0.2)) !important;
}
`;

const PERFORMANCE_STYLES_NON_DEFAULT_FOOTER = `
/* Non-default themes: solid footer widgets (no glass blur) */
#tm-notification-bell-btn,
#tm-refresh-timer-container,
#tm-weather-widget,
#tm-settings-btn,
#tm-daily-dashboard-widget,
#tm-xp-bar-container,
#tm-coin-balance,
.tm-footer-widget,
.tm-buff-timer,
#tm-recent-repairs-btn {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: var(--tm-shop-item-bg) !important;
    border-color: var(--tm-shop-item-border, rgba(255,255,255,0.2)) !important;
}
#tm-eod-btn {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: var(--tm-shop-item-bg) !important;
    border-color: var(--tm-shop-item-border, rgba(255,255,255,0.2)) !important;
}

/* Cheaper transitions (avoid compositing "all") */
.rnr-button, .btn, .tm-footer-widget, #tm-xp-bar-container,
#tm-settings-btn, #tm-refresh-timer-container, #tm-recent-repairs-btn, #tm-eod-btn {
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease !important;
}
`;

function tmInjectPerformanceStyles() {
    const themeId = typeof window.tmReadEquippedThemeId === 'function'
        ? window.tmReadEquippedThemeId()
        : String(window.__tmEarlyThemeId || 'default');
    const isDefaultTheme = themeId === 'default';

    document.getElementById('tm-performance-styles')?.remove();
    const el = document.createElement('style');
    el.id = 'tm-performance-styles';
    el.textContent = (isDefaultTheme ? '' : PERFORMANCE_STYLES_BASE)
        + (isDefaultTheme ? PERFORMANCE_STYLES_DEFAULT_FOOTER : PERFORMANCE_STYLES_NON_DEFAULT_FOOTER);
    document.head.appendChild(el);
}

window.tmInjectPerformanceStyles = tmInjectPerformanceStyles;
