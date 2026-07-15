/** iOS 26 Liquid Glass — performance-optimized (blur only on top-level chrome). */
const LIQUID_GLASS_STYLES = `
/* ===== iOS 26 Liquid Glass (optimized) ===== */
:root {
    --lg-font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
    --lg-label: #1d1d1f;
    --lg-label-secondary: rgba(60, 60, 67, 0.68);
    --lg-separator: rgba(60, 60, 67, 0.22);
    --lg-fill: rgba(255, 255, 255, 0.58);
    --lg-fill-strong: rgba(255, 255, 255, 0.78);
    --lg-fill-thick: rgba(255, 255, 255, 0.90);
    --lg-stroke: rgba(255, 255, 255, 0.72);
    --lg-stroke-subtle: rgba(255, 255, 255, 0.45);
    --lg-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    --lg-inset: inset 0 1px 0 rgba(255, 255, 255, 0.85);
    --lg-blur-chrome: blur(18px) saturate(140%);
    --lg-radius-sm: 12px;
    --lg-radius-md: 16px;
    --lg-radius-lg: 22px;
    --lg-radius-pill: 999px;
}

/* --- Wallpaper (static — no animation, no extra layer) --- */
body {
    background:
        radial-gradient(ellipse 80vmax 60vmax at 12% 18%, rgba(0, 122, 255, 0.14) 0%, transparent 55%),
        radial-gradient(ellipse 70vmax 55vmax at 88% 12%, rgba(175, 82, 222, 0.10) 0%, transparent 52%),
        radial-gradient(ellipse 75vmax 50vmax at 72% 88%, rgba(255, 45, 85, 0.06) 0%, transparent 58%),
        radial-gradient(ellipse 65vmax 55vmax at 22% 82%, rgba(48, 209, 88, 0.08) 0%, transparent 55%),
        linear-gradient(165deg, #e8edf9 0%, #f3f0fb 38%, #edf6ff 72%, #e7f3ef 100%) !important;
    font-family: var(--lg-font) !important;
    color: var(--lg-label) !important;
    -webkit-font-smoothing: antialiased !important;
}
body::before, body::after { display: none !important; }

.rnr-page, .rnr-middle, .rnr-left, .rnr-center, .rnr-right,
.rnr-s-fields, .rnr-s-form, .rnr-s-1, .rnr-s-2, .rnr-s-3,
.rnr-s-empty, .rnr-s-hmenu, .rnr-s-undermenu, .rnr-s-grid, .rnr-s-menu,
.rnr-c-fields, .rnr-c-form, .rnr-c-1, .rnr-c-2, .rnr-c-3,
.rnr-c-edit, .rnr-cw-edit, .rnr-cw-recordcontrols, .rnr-c-recordcontrols,
.rnr-scrollgrid-inner, .fieldGrid, .rnr-pagewrapper, .rnr-cw-1,
.rnr-brickcontents, .rnr-b-wrapper, .rnr-wrapper, .rnr-cbw-fields,
.rnr-b-editfields2_atop, .rnr-b-editheader, .rnr-b-editbuttons, .pag_n {
    background: transparent !important;
    color: var(--lg-label) !important;
    font-family: var(--lg-font) !important;
    text-shadow: none !important;
    animation: none !important;
}

/* --- Chrome blur: only nav + footer (few fixed layers) --- */
.rnr-top, #head-outter, #footer-outter, #footer-outterwrap {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-chrome) !important;
    -webkit-backdrop-filter: var(--lg-blur-chrome) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
    color: var(--lg-label) !important;
}
.rnr-cw-hmenu, .rnr-cw-pagination, .rnr-cw-pagination_bottom,
.rnr-s-menu, .rnr-c-hmenu, .rnr-c-pagination, .rnr-c-pagination_bottom {
    background: var(--lg-fill) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-inset) !important;
    color: var(--lg-label) !important;
}

#footer-outter, #footer-outterwrap {
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75) !important;
}
#footer-outterwrap td, #footer-outterwrap span { color: var(--lg-label) !important; text-shadow: none !important; }
#footer-outterwrap a, #footer-outterwrap a span { color: var(--tm-primary-color) !important; }

/* --- Typography --- */
h1, h2, h3, h4, h5, h6, .pagetitle, .rnr-b-editheader h1 {
    color: var(--lg-label) !important;
    font-weight: 650 !important;
    letter-spacing: -0.035em !important;
    text-shadow: none !important;
    animation: none !important;
}
.rnr-b-editheader h1 { color: var(--tm-primary-color) !important; }
.fieldGrid .rnr-label label, .fieldGrid .rnr-label b {
    color: var(--lg-label-secondary) !important;
    font-size: 13px !important;
    font-weight: 590 !important;
}

/* --- Links --- */
a, a:visited, .rnr-orderlink {
    color: var(--tm-primary-color) !important;
    text-decoration: none !important;
    text-shadow: none !important;
}
a:hover, .rnr-orderlink:hover {
    color: var(--tm-primary-hover) !important;
    opacity: 0.85;
}

/* --- Controls: solid glass (no per-button blur) --- */
.rnr-button, .MyMANAGERWhite_label1 .rnr-button.rnr-button,
.btn, .ui-button, #tm-settings-save, #tm-settings-reset,
#tm-quick-search-add-btn, .minimal-store-btn,
#tm-footer-controls-left button, #tm-footer-controls-right button,
#tm-recent-repairs-btn, #tm-scroll-to-top-btn, .tm-slide-out-btn,
#tm-phone-catalog-btn, .tm-shop-item-btn, .tm-talent-unlock-btn,
.tm-talent-unlock-btn-dashboard, #tm-mascot-interaction-buttons button {
    background: var(--lg-fill-strong) !important;
    color: var(--tm-primary-color) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-pill) !important;
    font-weight: 590 !important;
    font-family: var(--lg-font) !important;
    text-shadow: none !important;
    box-shadow: var(--lg-inset) !important;
    transition: background 0.15s ease, border-color 0.15s ease !important;
}
.rnr-button:hover, .MyMANAGERWhite_label1 .rnr-button:hover, .btn:hover,
#tm-footer-controls-left button:hover, #tm-footer-controls-right button:hover,
#tm-recent-repairs-btn:hover, .minimal-store-btn:hover, .tm-shop-item-btn:hover:not(:disabled) {
    background: rgba(0, 122, 255, 0.14) !important;
    border-color: rgba(0, 122, 255, 0.28) !important;
}
.rnr-button.img, .menu-icon, .tm-suite-menu-icon {
    filter: brightness(0) saturate(100%) invert(32%) sepia(98%) saturate(1800%) hue-rotate(196deg) brightness(98%) contrast(101%) !important;
}

/* --- Form fields: solid fill --- */
input, select, textarea, .form-control {
    background: var(--lg-fill-strong) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-sm) !important;
    font-family: var(--lg-font) !important;
    text-shadow: none !important;
    box-shadow: var(--lg-inset) !important;
}
input:focus, select:focus, textarea:focus {
    border-color: rgba(0, 122, 255, 0.45) !important;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12), var(--lg-inset) !important;
    outline: none !important;
}

/* --- Sidebar / menu --- */
.rnr-b-vmenu li > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *,
.rnr-b-vmenu_undermenu > ul > li > a, .rnr-b-hmenu.main {
    background: var(--lg-fill) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-sm) !important;
    transition: background 0.15s ease !important;
}
.rnr-b-vmenu li:hover > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *:hover {
    background: rgba(0, 122, 255, 0.08) !important;
}
.rnr-b-vmenu li.current > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *.current {
    background: rgba(0, 122, 255, 0.14) !important;
    border-color: rgba(0, 122, 255, 0.24) !important;
}
.rnr-b-vmenu li.current a { color: var(--tm-primary-color) !important; font-weight: 600 !important; }
.rnr-b-hmenu.main.current.current { background: rgba(0, 122, 255, 0.12) !important; }

/* --- Tables: one card shell, solid row fills (no row blur) --- */
.rnr-gridtable, .MyMANAGERWhite_label1.rnr-s-grid > table {
    border: 0.55px solid var(--lg-separator) !important;
    border-radius: var(--lg-radius-md) !important;
    overflow: hidden !important;
    box-shadow: var(--lg-shadow) !important;
    background: var(--lg-fill) !important;
}
.rnr-gridtable tr.rnr-row, .rnr-gridtable tr.rnr-toprow, .rnr-toprow.style1,
.MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row > td,
.rnr-c-grid > .rnr-b-grid > .rnr-gridtable > tbody > tr > td {
    background: var(--lg-fill) !important;
}
.rnr-gridtable tr.rnr-row:nth-last-child(2n+1) > td,
.MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row:nth-last-child(2n+1) > td {
    background: var(--lg-fill-strong) !important;
}
.rnr-c-grid.rnr-b-grid, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-toprow > th {
    background: var(--lg-fill-thick) !important;
    font-weight: 650 !important;
    color: var(--lg-label-secondary) !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.04em !important;
}
.rnr-gridtable td, .rnr-gridtable th,
.MyMANAGERWhite_label1.rnr-s-grid > table > * > * > td {
    border-color: var(--lg-separator) !important;
    color: var(--lg-label) !important;
}
.rnr-gridtable tr.rnr-row:hover, .rnr-row.style1:hover,
.MyMANAGERWhite_label1.rnr-s-grid > table.hoverable > * > .rnr-row:hover > td {
    background: rgba(0, 122, 255, 0.07) !important;
    color: var(--lg-label) !important;
    text-shadow: none !important;
}
.rnr-search-highlight {
    color: var(--lg-label) !important;
    background: rgba(255, 204, 0, 0.38) !important;
    border-radius: 4px !important;
}

/* --- Badges --- */
.badge, .statusbadge { color: var(--lg-label) !important; text-shadow: none !important; border-radius: var(--lg-radius-pill) !important; }
.etdbadge {
    background: rgba(0, 122, 255, 0.10) !important;
    color: var(--tm-primary-color) !important;
    border: 0.55px solid rgba(0, 122, 255, 0.22) !important;
}

/* --- Overlays: blur only on open modal shells --- */
.ui-dialog, .jconfirm-box, .tm-modal-content, .tm-phone-modal-content,
#tm-scratchpad-container, #tm-notification-panel, #tm-mascot-interaction-panel,
.search_suggest, .dropdown-menu {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur-chrome) !important;
    -webkit-backdrop-filter: var(--lg-blur-chrome) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
}
.ui-widget-content, .ui-datepicker {
    background: var(--lg-fill-strong) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
}
.ui-widget-header, .jconfirm-box .title-c,
.tm-modal-header, .tm-modal-footer, .tm-settings-section,
#tm-scratchpad-header, #tm-scratchpad-tabs-container, #tm-scratchpad-toolbar {
    background: rgba(255, 255, 255, 0.35) !important;
    border-color: var(--lg-separator) !important;
    color: var(--lg-label) !important;
    text-shadow: none !important;
}
.jconfirm { background: rgba(0, 0, 0, 0.22) !important; }
.dropdown-item { color: var(--lg-label) !important; }
.dropdown-item:hover { background: rgba(0, 122, 255, 0.08) !important; }

.tm-modal-title, .tm-modal-close, .tm-setting-label label, .tm-talent-name { color: var(--lg-label) !important; }
.tm-setting-description, .tm-talent-description { color: var(--lg-label-secondary) !important; }
.tm-settings-sidebar .tm-nav a {
    background: var(--lg-fill) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-sm) !important;
    color: var(--lg-label) !important;
}
.tm-settings-sidebar .tm-nav a.active {
    background: rgba(0, 122, 255, 0.12) !important;
    color: var(--tm-primary-color) !important;
    font-weight: 600 !important;
}

/* --- Shop --- */
.tm-shop-tab {
    background: var(--lg-fill) !important;
    border-color: var(--lg-separator) !important;
    color: var(--lg-label-secondary) !important;
    border-radius: var(--lg-radius-sm) var(--lg-radius-sm) 0 0 !important;
}
.tm-shop-tab.active {
    background: var(--lg-fill-strong) !important;
    color: var(--tm-primary-color) !important;
    font-weight: 600 !important;
}
.tm-shop-item {
    background: var(--lg-fill) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-inset) !important;
    color: var(--lg-label) !important;
}
.tm-shop-item.owned { background: rgba(0, 122, 255, 0.08) !important; border-color: rgba(0, 122, 255, 0.20) !important; }
.tm-shop-item-btn.equipped { background: rgba(52, 199, 89, 0.12) !important; color: var(--tm-success-color) !important; }

/* --- Scratchpad editor areas --- */
#tm-scratchpad-editor, #tm-scratchpad-search {
    background: rgba(255, 255, 255, 0.55) !important;
    color: var(--lg-label) !important;
}
.tm-scratchpad-tab.active { background: var(--lg-fill-strong) !important; color: var(--lg-label) !important; font-weight: 600 !important; }

/* --- Notifications --- */
#tm-positive-message, #tm-achievement-notification.show {
    background: var(--lg-fill-strong) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow) !important;
    color: var(--lg-label) !important;
    text-shadow: none !important;
}
#tm-notification-unread-count { background: var(--tm-danger-color) !important; color: #fff !important; }
#tm-notification-panel .tm-notification-header h4,
.tm-notif-history-message,
.tm-reminder-card-title { color: var(--lg-label) !important; }
.tm-notification-message,
.tm-notif-history-card.read .tm-notif-history-message { color: var(--lg-label-secondary) !important; }
.tm-notification-timestamp,
.tm-notif-history-time,
.tm-notif-empty-hint,
.tm-alerts-section-label { color: var(--lg-label-secondary) !important; }
.tm-notif-empty-title { color: var(--lg-label) !important; }
.tm-notification-item.unread,
.tm-notif-history-card.unread {
    background: color-mix(in srgb, var(--tm-info-color) 8%, var(--lg-fill)) !important;
    border-color: color-mix(in srgb, var(--tm-info-color) 22%, var(--lg-stroke-subtle)) !important;
}
.tm-notif-history-icon-wrap {
    background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--lg-fill)) !important;
    border-color: color-mix(in srgb, var(--tm-primary-color) 18%, var(--lg-stroke-subtle)) !important;
}
.tm-notif-tab.active {
    background: color-mix(in srgb, var(--tm-primary-color) 10%, var(--lg-fill)) !important;
    border-color: color-mix(in srgb, var(--tm-primary-color) 22%, var(--lg-stroke-subtle)) !important;
}
.tm-reminder-card-message {
    background: color-mix(in srgb, var(--lg-label) 4%, var(--lg-fill)) !important;
    border-color: var(--lg-stroke-subtle) !important;
    color: var(--lg-label) !important;
}

.tm-mascot-speech-bubble {
    background: var(--lg-fill-thick) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-shadow) !important;
}

/* --- Form sections --- */
.rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c {
    background: var(--lg-fill) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
    padding: 12px !important;
    box-shadow: var(--lg-inset) !important;
    margin-bottom: 10px !important;
}

/* --- Tabs --- */
.rnr-tab {
    background: var(--lg-fill) !important;
    border-color: var(--lg-separator) !important;
    border-radius: var(--lg-radius-sm) var(--lg-radius-sm) 0 0 !important;
}
.rnr-tab.selected {
    background: var(--lg-fill-strong) !important;
    border-color: rgba(0, 122, 255, 0.22) !important;
}
.rnr-tab a { color: var(--lg-label) !important; }
.rnr-tab.selected a { color: var(--tm-primary-color) !important; font-weight: 600 !important; }

/* --- Undermenu --- */
.rnr-s-undermenu .rnr-b-search > span, .rnr-s-undermenu .rnr-b-loggedas > div { color: var(--lg-label) !important; }
.rnr-s-undermenu .rnr-b-loggedas b { color: var(--tm-primary-color) !important; font-weight: 650 !important; }
.MyMANAGERWhite_label1.rnr-s-undermenu > :not(.runner-c) > *.style1,
.MyMANAGERWhite_label1.rnr-s-2 > :not(.runner-c) > *.style1 {
    background: var(--lg-fill) !important;
    border-radius: var(--lg-radius-sm) !important;
}

/* --- Event / gamification --- */
#tm-event-notification {
    background: var(--lg-fill-strong) !important;
    border: 0.55px solid rgba(255, 159, 10, 0.28) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow) !important;
    color: var(--lg-label) !important;
}
#tm-event-notification h3, #tm-event-notification h4 { color: var(--tm-warning-color) !important; }

.tm-dashboard-tab {
    background: var(--lg-fill) !important;
    border-color: var(--lg-separator) !important;
    color: var(--lg-label-secondary) !important;
    border-radius: var(--lg-radius-sm) !important;
}
.tm-dashboard-tab.active {
    background: var(--lg-fill-strong) !important;
    color: var(--tm-primary-color) !important;
    font-weight: 600 !important;
}
#tm-dashboard-content { color: var(--lg-label) !important; }
#tm-performance-chart { background: var(--lg-fill) !important; border-radius: var(--lg-radius-md) !important; }

.tm-talent-card, .tm-talent-item, #tm-factions-grid .tm-faction-card,
.tm-quest-item, .tm-title-item {
    background: var(--lg-fill) !important;
    border: 0.55px solid var(--lg-separator) !important;
    border-radius: var(--lg-radius-md) !important;
    color: var(--lg-label) !important;
}
.tm-talent-card.unlocked, .tm-talent-item.unlocked, .tm-quest-item.completed {
    background: rgba(52, 199, 89, 0.08) !important;
    border-color: rgba(52, 199, 89, 0.22) !important;
}

.search_suggest div.search_suggest_link_over { background: rgba(0, 122, 255, 0.08) !important; }

/* --- Global cleanup --- */
.rnr-s-grid b, .rnr-s-grid strong, .tm-modal-content b, .tm-modal-content strong {
    color: var(--lg-label) !important;
    text-shadow: none !important;
}
img[src='images/smsdelivered.png'] {
    filter: brightness(0) saturate(100%) invert(32%) sepia(98%) saturate(1800%) hue-rotate(196deg) brightness(98%) contrast(101%) !important;
}
.rnr-message {
    background: rgba(0, 122, 255, 0.06) !important;
    border: 0.55px solid rgba(0, 122, 255, 0.18) !important;
    border-radius: var(--lg-radius-sm) !important;
    color: var(--lg-label) !important;
}
#tm-xp-bar-container *, #tm-daily-dashboard-widget *, #tm-user-title-text,
.tm-refresh-time-text, #tm-weather-temp { color: var(--lg-label) !important; text-shadow: none !important; }
#tm-xp-bar-fill { background: var(--tm-primary-color) !important; box-shadow: none !important; animation: none !important; }
#tm-coin-balance * { color: var(--tm-primary-color) !important; }

/* --- Accessibility: disable expensive effects --- */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation: none !important;
        transition: none !important;
    }
}
@media (prefers-reduced-transparency: reduce) {
    .rnr-top, #head-outter, #footer-outter, #footer-outterwrap,
    .ui-dialog, .jconfirm-box, .tm-modal-content, .tm-phone-modal-content,
    #tm-scratchpad-container, #tm-notification-panel, #tm-mascot-interaction-panel,
    .search_suggest, .dropdown-menu {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        background: var(--lg-fill-thick) !important;
    }
}
`;
