/** iOS 26 Liquid Glass — standalone theme stylesheet (no THEME_STYLES inheritance). */
const LIQUID_GLASS_STYLES = `
/* ===== iOS 26 Liquid Glass ===== */
:root {
    --lg-font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
    --lg-bg: #eef0f8;
    --lg-label: #1d1d1f;
    --lg-label-secondary: rgba(60, 60, 67, 0.68);
    --lg-label-tertiary: rgba(60, 60, 67, 0.44);
    --lg-separator: rgba(60, 60, 67, 0.22);
    --lg-fill: rgba(255, 255, 255, 0.46);
    --lg-fill-strong: rgba(255, 255, 255, 0.68);
    --lg-fill-thick: rgba(255, 255, 255, 0.82);
    --lg-stroke: rgba(255, 255, 255, 0.62);
    --lg-stroke-subtle: rgba(255, 255, 255, 0.38);
    --lg-shadow: 0 10px 40px rgba(0, 0, 0, 0.07), 0 2px 8px rgba(0, 0, 0, 0.04);
    --lg-inset: inset 0 1px 0 rgba(255, 255, 255, 0.88), inset 0 -0.5px 0 rgba(0, 0, 0, 0.03);
    --lg-blur: blur(44px) saturate(195%) brightness(1.03);
    --lg-blur-soft: blur(28px) saturate(180%);
    --lg-radius-sm: 12px;
    --lg-radius-md: 16px;
    --lg-radius-lg: 22px;
    --lg-radius-pill: 999px;
    --lg-ease: cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes lg-wallpaper-drift {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 1; }
    50% { transform: scale(1.04) translate(-1%, 1%); opacity: 0.95; }
}

/* --- Wallpaper & canvas --- */
body {
    background: linear-gradient(165deg, #e8edf9 0%, #f3f0fb 38%, #edf6ff 72%, #e7f3ef 100%) !important;
    background-attachment: fixed !important;
    font-family: var(--lg-font) !important;
    color: var(--lg-label) !important;
    -webkit-font-smoothing: antialiased !important;
    text-rendering: optimizeLegibility !important;
}
body::before {
    content: "" !important;
    position: fixed !important;
    inset: -10% !important;
    z-index: -2 !important;
    pointer-events: none !important;
    background:
        radial-gradient(ellipse 55vmax 45vmax at 12% 18%, rgba(0, 122, 255, 0.16) 0%, transparent 58%),
        radial-gradient(ellipse 50vmax 40vmax at 88% 12%, rgba(175, 82, 222, 0.12) 0%, transparent 55%),
        radial-gradient(ellipse 60vmax 35vmax at 72% 88%, rgba(255, 45, 85, 0.08) 0%, transparent 60%),
        radial-gradient(ellipse 45vmax 45vmax at 22% 82%, rgba(48, 209, 88, 0.10) 0%, transparent 58%) !important;
    animation: lg-wallpaper-drift 28s ease-in-out infinite !important;
    filter: none !important;
    opacity: 1 !important;
}
body::after { display: none !important; }

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

/* --- Floating glass chrome (nav bars, headers, footers) --- */
.rnr-top, #head-outter, #footer-outter, #footer-outterwrap,
.rnr-cw-hmenu, .rnr-cw-pagination, .rnr-cw-pagination_bottom,
.rnr-s-menu, .rnr-c-hmenu, .rnr-c-pagination, .rnr-c-pagination_bottom {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
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

/* --- Typography (iOS 26: bolder, clean) --- */
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
    opacity: 0.82;
    transform: none !important;
}

/* --- Capsule glass controls --- */
.rnr-button, .MyMANAGERWhite_label1 .rnr-button.rnr-button,
.btn, .ui-button, #tm-settings-save, #tm-settings-reset,
#tm-quick-search-add-btn, .minimal-store-btn,
#tm-footer-controls-left button, #tm-footer-controls-right button,
#tm-recent-repairs-btn, #tm-scroll-to-top-btn, .tm-slide-out-btn,
#tm-phone-catalog-btn, .tm-shop-item-btn, .tm-talent-unlock-btn,
.tm-talent-unlock-btn-dashboard, #tm-mascot-interaction-buttons button {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    color: var(--tm-primary-color) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-pill) !important;
    font-weight: 590 !important;
    font-family: var(--lg-font) !important;
    text-shadow: none !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05), var(--lg-inset) !important;
    transition: transform 0.22s var(--lg-ease), background 0.22s var(--lg-ease), box-shadow 0.22s var(--lg-ease) !important;
}
.rnr-button:hover, .MyMANAGERWhite_label1 .rnr-button:hover, .btn:hover,
#tm-footer-controls-left button:hover, #tm-footer-controls-right button:hover,
#tm-recent-repairs-btn:hover, .minimal-store-btn:hover, .tm-shop-item-btn:hover:not(:disabled) {
    background: rgba(0, 122, 255, 0.14) !important;
    border-color: rgba(0, 122, 255, 0.28) !important;
    transform: scale(1.02) !important;
    box-shadow: 0 6px 20px rgba(0, 122, 255, 0.14), var(--lg-inset) !important;
}
.rnr-button.img, .menu-icon {
    filter: brightness(0) saturate(100%) invert(32%) sepia(98%) saturate(1800%) hue-rotate(196deg) brightness(98%) contrast(101%) !important;
}

/* --- Form fields (inset glass) --- */
input, select, textarea, .form-control {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-sm) !important;
    font-family: var(--lg-font) !important;
    text-shadow: none !important;
    box-shadow: var(--lg-inset) !important;
}
input:focus, select:focus, textarea:focus {
    border-color: rgba(0, 122, 255, 0.45) !important;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.14), var(--lg-inset) !important;
    outline: none !important;
}

/* --- Sidebar / menu glass cards --- */
.rnr-b-vmenu li > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *,
.rnr-b-vmenu_undermenu > ul > li > a, .rnr-b-hmenu.main {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-sm) !important;
    transition: background 0.2s var(--lg-ease) !important;
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

/* --- Tables (content on glass cards) --- */
.rnr-gridtable, .MyMANAGERWhite_label1.rnr-s-grid > table {
    border: 0.55px solid var(--lg-separator) !important;
    border-radius: var(--lg-radius-md) !important;
    overflow: hidden !important;
    box-shadow: var(--lg-shadow) !important;
}
.rnr-gridtable tr.rnr-row, .rnr-gridtable tr.rnr-toprow, .rnr-toprow.style1,
.MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row > td,
.rnr-c-grid > .rnr-b-grid > .rnr-gridtable > tbody > tr > td {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
}
.rnr-gridtable tr.rnr-row:nth-last-child(2n+1) > td,
.MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row:nth-last-child(2n+1) > td {
    background: var(--lg-fill-strong) !important;
}
.rnr-c-grid.rnr-b-grid, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-toprow > th {
    background: var(--lg-fill-thick) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
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

/* --- Badges & status --- */
.badge, .statusbadge { color: var(--lg-label) !important; text-shadow: none !important; border-radius: var(--lg-radius-pill) !important; }
.etdbadge {
    background: rgba(0, 122, 255, 0.10) !important;
    color: var(--tm-primary-color) !important;
    border: 0.55px solid rgba(0, 122, 255, 0.22) !important;
}

/* --- jQuery UI / dialogs --- */
.ui-widget-content, .ui-dialog, .ui-datepicker, .jconfirm-box {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
}
.ui-widget-header, .jconfirm-box .title-c {
    background: rgba(255, 255, 255, 0.28) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    border-color: var(--lg-separator) !important;
    color: var(--lg-label) !important;
}
.jconfirm { background: rgba(0, 0, 0, 0.18) !important; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; }
.dropdown-menu {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
}
.dropdown-item { color: var(--lg-label) !important; }
.dropdown-item:hover { background: rgba(0, 122, 255, 0.08) !important; }

/* --- Suite modals --- */
.tm-modal-content, .tm-phone-modal-content {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.10), var(--lg-inset) !important;
}
.tm-modal-header, .tm-modal-footer, .tm-settings-section {
    background: rgba(255, 255, 255, 0.22) !important;
    border-color: var(--lg-separator) !important;
    text-shadow: none !important;
}
.tm-modal-title, .tm-modal-close, .tm-setting-label label, .tm-talent-name { color: var(--lg-label) !important; }
.tm-setting-description, .tm-talent-description { color: var(--lg-label-secondary) !important; }
.tm-settings-sidebar .tm-nav a {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
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
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
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
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-inset) !important;
    color: var(--lg-label) !important;
}
.tm-shop-item.owned { background: rgba(0, 122, 255, 0.08) !important; border-color: rgba(0, 122, 255, 0.20) !important; }
.tm-shop-item-btn.equipped { background: rgba(52, 199, 89, 0.12) !important; color: var(--tm-success-color) !important; }

/* --- Scratchpad --- */
#tm-scratchpad-container {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
    color: var(--lg-label) !important;
}
#tm-scratchpad-header, #tm-scratchpad-tabs-container, #tm-scratchpad-toolbar {
    background: rgba(255, 255, 255, 0.20) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    border-color: var(--lg-separator) !important;
}
#tm-scratchpad-editor, #tm-scratchpad-search {
    background: rgba(255, 255, 255, 0.28) !important;
    color: var(--lg-label) !important;
}
.tm-scratchpad-tab.active { background: var(--lg-fill-strong) !important; color: var(--lg-label) !important; font-weight: 600 !important; }

/* --- Notifications --- */
#tm-notification-panel, #tm-positive-message, #tm-achievement-notification.show {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
    color: var(--lg-label) !important;
    text-shadow: none !important;
}
#tm-notification-unread-count { background: var(--tm-danger-color) !important; color: #fff !important; }
.tm-notification-message { color: var(--lg-label) !important; }
.tm-notification-timestamp { color: var(--lg-label-secondary) !important; }
.tm-notification-item.unread { background: rgba(0, 122, 255, 0.06) !important; }

/* --- Mascot panel --- */
#tm-mascot-interaction-panel {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
}
.tm-mascot-speech-bubble {
    background: var(--lg-fill-thick) !important;
    color: var(--lg-label) !important;
    border: 0.55px solid var(--lg-stroke-subtle) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-shadow) !important;
}

/* --- Repair edit grouped sections --- */
.rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
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

/* --- Undermenu / logged in bar --- */
.rnr-s-undermenu .rnr-b-search > span, .rnr-s-undermenu .rnr-b-loggedas > div { color: var(--lg-label) !important; }
.rnr-s-undermenu .rnr-b-loggedas b { color: var(--tm-primary-color) !important; font-weight: 650 !important; }
.MyMANAGERWhite_label1.rnr-s-undermenu > :not(.runner-c) > *.style1,
.MyMANAGERWhite_label1.rnr-s-2 > :not(.runner-c) > *.style1 {
    background: var(--lg-fill) !important;
    backdrop-filter: var(--lg-blur-soft) !important;
    -webkit-backdrop-filter: var(--lg-blur-soft) !important;
    border-radius: var(--lg-radius-sm) !important;
}

/* --- Event / gamification overlays --- */
#tm-event-notification {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid rgba(255, 159, 10, 0.28) !important;
    border-radius: var(--lg-radius-lg) !important;
    box-shadow: 0 8px 28px rgba(255, 159, 10, 0.08), var(--lg-inset) !important;
    color: var(--lg-label) !important;
}
#tm-event-notification h3, #tm-event-notification h4 { color: var(--tm-warning-color) !important; }

/* --- Dashboard --- */
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

/* --- Talents / factions --- */
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

/* --- Search suggest --- */
.search_suggest {
    background: var(--lg-fill-strong) !important;
    backdrop-filter: var(--lg-blur) !important;
    -webkit-backdrop-filter: var(--lg-blur) !important;
    border: 0.55px solid var(--lg-stroke) !important;
    border-radius: var(--lg-radius-md) !important;
    box-shadow: var(--lg-shadow), var(--lg-inset) !important;
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
`;
