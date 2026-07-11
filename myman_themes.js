const THEME_STYLES = `/* Universal Theme Styles */
            @keyframes matrix-subtle-flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.9; } }
            @keyframes matrix-scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
            @keyframes matrix-rain-scroll { 0% { background-position: 0 0; } 100% { background-position: -200px 400px; } }
            
            body { /* Add a subtle central glow */
            
                background: radial-gradient(ellipse at center, var(--tm-dark-color) 0%, var(--tm-dark-hover) 70%) !important;
                background-attachment: fixed;
            }
            .rnr-page, .rnr-middle, .rnr-left, .rnr-center, .rnr-right, .rnr-s-fields, .rnr-s-form, .rnr-s-1, .rnr-s-2, .rnr-s-3, .rnr-s-empty, .rnr-s-hmenu, .rnr-s-undermenu, .rnr-c-fields, .rnr-c-form, .rnr-c-1, .rnr-c-2, .rnr-c-3, .pag_n, .rnr-c-edit, .rnr-cw-edit, .rnr-cw-recordcontrols, .rnr-c-recordcontrols, .rnr-scrollgrid-inner, .fieldGrid, .rnr-pagewrapper, .rnr-c-1, .rnr-cw-1, .rnr-brickcontents, .rnr-b-wrapper, .rnr-wrapper, .rnr-cbw-fields, .rnr-b-editfields2_atop, .rnr-b-editheader, .rnr-b-editbuttons {
                background: transparent !important; color: var(--tm-primary-color) !important; font-family: 'Consolas', 'Menlo', 'Monaco', monospace !important;
            }
            body::before {
                content: " "; display: block; position: fixed; top: 0; left: 0; z-index: -1;
                width: 100%; height: 100%;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ctext x='0' y='15' fill='var(--tm-shop-item-border)' font-size='10' font-family='monospace'%3E%CE%91%CE%92%CE%93%CE%94%CE%95%CE%96%CE%97%CE%98%CE%99%CE%9A%CE%9B%CE%9C%CE%9D%CE%9E%CE%9F%CE%A0%CE%A1%CE%A3%CE%A4%CE%A5%CE%A6%CE%A7%CE%A8%CE%A901%3C/text%3E%3C/svg%3E");
                opacity: 0.3; animation: matrix-rain-scroll 20s linear infinite;
            }
            body::after {
                content: " "; display: block; position: fixed; top: 0; left: 0; z-index: -1; width: 100%; height: 100%;
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%); background-size: 100% 4px;
                animation: matrix-scanline 8s linear infinite; opacity: 0.4;
            }
            .rnr-top, #head-outter, #footer-outter, .rnr-cw-hmenu, .rnr-cw-pagination, .rnr-cw-pagination_bottom, .rnr-s-menu, .rnr-s-grid, .rnr-c-hmenu, .rnr-c-pagination, .rnr-c-pagination_bottom { 
                background-color: var(--tm-shop-item-bg) !important; border: 1px solid var(--tm-shop-item-border) !important; color: var(--tm-primary-color) !important; border-radius: 4px; box-shadow: none; backdrop-filter: blur(5px);
            }
            h1, h2, h3, h4, h5, h6, .pagetitle { text-shadow: 0 0 8px var(--tm-primary-color); animation: matrix-subtle-flicker 2s infinite; }
            a, a:visited, .rnr-orderlink { color: var(--tm-primary-hover) !important; text-decoration: none !important; transition: all 0.2s; }
            a:hover, .rnr-orderlink:hover { text-decoration: none !important; color: var(--tm-info-color) !important; text-shadow: 0 0 5px var(--tm-info-color); transform: translate(1px, -1px); }
            input, select, textarea, .form-control { background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 4px !important; padding: 5px; text-shadow: none !important; }
            input:focus, select:focus, textarea:focus { box-shadow: 0 0 8px var(--tm-primary-color); outline: none; border-color: var(--tm-primary-color) !important; }
            
            /* Buttons - Minimal & Rounded */
            .rnr-button, .MyMANAGERWhite_label1 .rnr-button.rnr-button { 
                background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; text-shadow: none; transition: all 0.2s ease-out; box-shadow: none;
            }
            .rnr-button:hover, .MyMANAGERWhite_label1 .rnr-button:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; text-shadow: none; box-shadow: 0 0 10px var(--tm-primary-color); }
            .rnr-button.img { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(1000%) hue-rotate(90deg); }

            /* Menu */
            .rnr-b-vmenu a, .rnr-b-hmenu a { text-shadow: none !important; }
            .rnr-b-vmenu li > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *, .rnr-b-vmenu_undermenu > ul > li > a { border-bottom: 1px solid var(--tm-shop-item-border) !important; border-top: none !important; border-radius: 4px; background: var(--tm-dark-color) !important; transition: background-color 0.2s; }
            .rnr-b-vmenu li:hover > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *:hover { background: var(--tm-shop-item-hover-bg) !important; }
            .rnr-b-vmenu li.current > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *.current { background: var(--tm-primary-color) !important; border-left: 3px solid var(--tm-info-color); }
            .rnr-b-vmenu li.current a, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *.current a { color: var(--tm-dark-hover) !important; font-weight: bold; text-shadow: none !important; }
            .menu-icon { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(1000%) hue-rotate(90deg); }
            .rnr-b-vmenu li.current .menu-icon { filter: none; }
            .rnr-b-hmenu.main { background: var(--tm-dark-color) !important; }
            .rnr-b-hmenu.main > div:not(.rnr-hseparator) { color: var(--tm-primary-color) !important; }
            .rnr-b-hmenu.main:hover:not(.expanded) { background: var(--tm-shop-item-hover-bg) !important; }
            .rnr-b-hmenu.main.current.current { background: var(--tm-primary-color) !important; }
            .rnr-b-hmenu.main.current.current > div { color: var(--tm-dark-hover) !important; }

            /* Grid / Tables */
            .rnr-gridtable, .MyMANAGERWhite_label1.rnr-s-grid > table { border: 1px solid var(--tm-secondary-hover) !important; }
            .rnr-gridtable tr.rnr-row, .rnr-gridtable tr.rnr-toprow, .rnr-toprow.style1, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row > td, .rnr-c-grid > .rnr-b-grid > .rnr-gridtable > tbody > tr > td { background: var(--tm-dark-color) !important; }
            .rnr-gridtable tr.rnr-row:nth-last-child(2n+1) > td, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row:nth-last-child(2n+1) > td { background: var(--tm-shop-item-owned-bg) !important; }
            .rnr-gridtable tr.rnr-row, .rnr-row.style1 { transition: background-color 0.2s ease-out; }
            .rnr-gridtable tr.rnr-row:hover, .rnr-row.style1:hover, .MyMANAGERWhite_label1.rnr-s-grid > table.hoverable > * > .rnr-row:hover > td { background: var(--tm-secondary-hover) !important; color: var(--tm-info-color) !important; text-shadow: 0 0 3px var(--tm-info-color); }
            .rnr-gridtable td, .rnr-gridtable th, .MyMANAGERWhite_label1.rnr-s-grid > table > * > * > td { border-color: var(--tm-shop-item-border) !important; color: var(--tm-primary-color) !important; }
            .rnr-c-grid.rnr-b-grid, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-toprow > th { background: var(--tm-dark-hover) !important; }
            .rnr-search-highlight { color: var(--tm-dark-hover) !important; background-color: var(--tm-primary-color) !important; text-shadow: none; }

            /* Badges */
            .badge, .statusbadge { color: var(--tm-text-on-dark, #cccccc) !important; border-radius: 4px; text-shadow: none !important; }
            .badge.blink { animation: matrix-subtle-flicker 1s infinite; }
            .etdbadge {
                background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 4px !important; text-shadow: 0 0 5px var(--tm-primary-color);
            }
            
            /* --- Override Component Libraries --- */
            /* jQuery UI Dialogs & Popups */
            .ui-widget-content, .ui-dialog, .ui-datepicker { background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 4px !important; box-shadow: 0 5px 25px var(--tm-primary-color, rgba(0, 255, 0, 0.15)); }
            .ui-widget-header { background: var(--tm-dark-hover) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 4px 4px 0 0 !important; }
            .ui-dialog .ui-dialog-titlebar-close { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(1000%) hue-rotate(90deg); }
            .ui-button { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 4px !important; }
            .ui-button:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; }
            .ui-state-default, .ui-widget-content .ui-state-default { background: var(--tm-dark-color) !important; border: 1px solid var(--tm-secondary-hover) !important; color: var(--tm-primary-color) !important; }
            .ui-state-hover, .ui-widget-content .ui-state-hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; }
            .ui-state-active, .ui-widget-content .ui-state-active { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; font-weight: bold; }
            
            /* Bootstrap Components */
            .btn { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; }
            .btn:hover { background: var(--tm-primary-color) !important; color: var(--tm-text-on-primary, var(--tm-dark-hover)) !important; }
            .dropdown-menu { background-color: var(--tm-dark-hover) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 4px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
            .dropdown-item { color: var(--tm-primary-color) !important; }
            .dropdown-item:hover { background-color: var(--tm-shop-item-hover-bg) !important; color: var(--tm-info-color) !important; }
            
            /* jConfirm Popup */
            .jconfirm { background: rgba(0, 0, 0, 0.75) !important; backdrop-filter: blur(5px); }
            .jconfirm-box { background: var(--tm-dark-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 8px !important; box-shadow: 0 0 25px var(--tm-primary-color) !important; }
            .jconfirm-box .closeIcon { color: var(--tm-primary-color) !important; transition: all 0.2s; }
            .jconfirm-box .closeIcon:hover { color: var(--tm-danger-color) !important; text-shadow: 0 0 8px var(--tm-danger-color); }
            .jconfirm-box .title-c { background: var(--tm-dark-hover) !important; border-bottom: 1px solid var(--tm-secondary-hover) !important; border-radius: 8px 8px 0 0 !important; }
            .jconfirm-box .title { color: var(--tm-primary-color) !important; text-shadow: 0 0 5px var(--tm-primary-color); }
            .jconfirm-box .content-pane { background: transparent !important; }
            .jconfirm-box .content { color: var(--tm-primary-color) !important; }
            .jconfirm-box .buttons { border-top: 1px solid var(--tm-secondary-hover) !important; background: transparent !important; }
            .jconfirm-box .buttons .btn { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; margin: 0 5px; }
            .jconfirm-box .buttons .btn:hover { background: var(--tm-primary-color) !important; color: var(--tm-text-on-primary, var(--tm-dark-hover)) !important; box-shadow: 0 0 10px var(--tm-primary-color); }
            
            /* --- Override Inline & Specific Styles --- */
            /* Table row conditional formatting - text-shadow removal for readability */
            td.rnr-style5-ccc_dETDDiff, .rnr-style5-ccc_dETDDiff { background: #333300 !important; } /* Was yellow */
            td.rnr-style6-ccc_dETDDiff, .rnr-style6-ccc_dETDDiff { background: #4d0000 !important; } /* Was red */
            td.rnr-style5-dTimeDiff, .rnr-style5-dTimeDiff { background: #002b00 !important; } /* Was light green */
            span[style*='#FFFF66'] { background-color: #333300 !important; } /* Catch inline yellow */
            span[style*='#ff2244'] { background-color: #4d0000 !important; } /* Catch inline red */
            
            /* Other elements */
            /* Make bold text white only on dark backgrounds to avoid unreadable text on green/yellow backgrounds */
            .rnr-s-grid b, .rnr-s-grid strong, .rnr-s-undermenu b, .rnr-s-undermenu strong, .tm-modal-content b, .tm-modal-content strong { color: var(--tm-info-color) !important; text-shadow: 0 0 5px var(--tm-info-color); }
            img[src='images/smsdelivered.png'] { filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(1000%) hue-rotate(90deg); }
            .rnr-tab.selected { background-color: var(--tm-dark-hover) !important; border-color: var(--tm-primary-color) !important; }
            .style1.rnr-br.rnr-b-loggedas { background: transparent !important; }
            .rnr-tab { background-color: var(--tm-dark-color) !important; border-color: var(--tm-shop-item-border) !important; }
            .rnr-tab a { color: var(--tm-primary-color) !important; }
            .rnr-tab.selected a { color: var(--tm-info-color) !important; }
            .yui-navset .yui-content { border-color: var(--tm-secondary-hover) !important; }
            .rnr-message { background-color: var(--tm-shop-item-hover-bg) !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            .rnr-s-undermenu .rnr-b-search > span, .rnr-s-undermenu .rnr-b-loggedas > div { color: var(--tm-primary-color) !important; text-shadow: none; }
            .rnr-s-undermenu .rnr-b-loggedas b { color: var(--tm-info-color) !important; }

            /* Fix for blue background on specific undermenu elements */
            .MyMANAGERWhite_label1.rnr-s-undermenu > :not(.runner-c) > *.style1, .MyMANAGERWhite_label1.rnr-s-undermenu > * > :not(.rnr-b-wrapper) .style1 { background: var(--tm-dark-color) !important; }
            .MyMANAGERWhite_label1.rnr-s-2 > :not(.runner-c) > *.style1, .MyMANAGERWhite_label1.rnr-s-2 > * > :not(.rnr-b-wrapper) .style1 { background: var(--tm-dark-color) !important; }
            .rnr-row.style1 > td { transition: background-color 0.2s ease-out; } /* Smooth hover for entire row */
            .rnr-row.style1:hover > td { background: var(--tm-secondary-hover) !important; color: var(--tm-info-color) !important; }

            /* --- Suite Modals (Settings, Shop, etc.) --- */
            .tm-modal-content { background: var(--tm-modal-bg, var(--tm-dark-color)) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-shop-item-border) !important; box-shadow: 0 0 25px rgba(0,0,0,0.1) !important; border-radius: 8px; }
            .tm-phone-modal-content { background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-shop-item-border) !important; box-shadow: 0 0 25px rgba(0,0,0,0.1) !important; border-radius: 8px; }
            /* Settings modal - use theme background */
            .tm-modal-content:has(.tm-settings-layout) {
                background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
                color: var(--tm-text-on-dark, var(--tm-primary-color)) !important;
                border-color: var(--tm-shop-item-border) !important;
            }
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-header,
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-footer {
                background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
                border-color: var(--tm-shop-item-border) !important;
            }
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-title,
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-close {
                color: var(--tm-text-on-dark, var(--tm-primary-color)) !important;
            }
           
            .tm-modal-content:has(.tm-settings-layout) .tm-setting-description {
                color: var(--tm-secondary-color) !important;
            }
            .tm-modal-header, .tm-settings-section, .tm-modal-footer { border-color: var(--tm-shop-item-border) !important; text-shadow: none !important; background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important; }
            .tm-modal-header { color: var(--tm-primary-color) !important; }
            .tm-modal-title, .tm-modal-close, .tm-setting-label label, .tm-talent-name { color: var(--tm-primary-color) !important; }
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-title,
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-close,
            
            .tm-setting-description, .tm-talent-description { color: var(--tm-secondary-color) !important; }

            /* Shop Tabs & Items */
            .tm-shop-tabs { border-bottom-color: var(--tm-secondary-color) !important; }
            .tm-shop-tab { background: var(--tm-dark-color) !important; border-color: var(--tm-secondary-color) !important; color: var(--tm-primary-color) !important; }
            .tm-shop-tab.active { background: var(--tm-dark-hover) !important; color: var(--tm-info-color) !important; border-bottom-color: var(--tm-dark-hover) !important; }
            .tm-shop-item { background: var(--tm-shop-item-bg) !important; border: 1px solid var(--tm-shop-item-border) !important; color: var(--tm-primary-color) !important; }
            .tm-shop-item.owned { background: var(--tm-shop-item-owned-bg) !important; border-color: var(--tm-secondary-hover) !important; }
            .tm-shop-item:hover { border-color: var(--tm-primary-color) !important; }
            .tm-shop-item-btn { background: transparent !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; border-radius: 16px !important; }
            .tm-shop-item-btn:hover:not(:disabled) { background: var(--tm-primary-color) !important; color: var(--tm-text-on-primary, var(--tm-dark-hover)) !important; }
            .tm-shop-item-btn.equipped { background: var(--tm-success-color) !important; color: var(--tm-text-on-success, var(--tm-dark-hover)) !important; border-color: var(--tm-success-color) !important; }
            .tm-shop-item-btn:disabled { background: var(--tm-dark-hover) !important; color: var(--tm-secondary-hover) !important; border-color: var(--tm-secondary-hover) !important; }

            /* Settings Styles */
            .tm-settings-sidebar .tm-nav a { background: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; }
            .tm-settings-sidebar .tm-nav a:hover { background: var(--tm-shop-item-hover-bg) !important; }
            .tm-settings-sidebar .tm-nav a.active { background: var(--tm-secondary-hover) !important; color: var(--tm-info-color) !important; }
            
            /* Factions System */
            #tm-factions-grid .tm-faction-card { background: var(--tm-shop-item-bg) !important; border: 1px solid var(--tm-shop-item-border) !important; color: var(--tm-primary-color) !important; }
            #tm-factions-grid .tm-faction-card:hover { background: var(--tm-shop-item-hover-bg) !important; border-color: var(--tm-primary-color) !important; }
            #tm-factions-grid .tm-faction-card.selected { background: var(--tm-shop-item-owned-bg) !important; border-color: var(--tm-primary-color) !important; border-width: 2px !important; }
            
            /* Faction Info Cards in Dashboard */
            #tm-dashboard-content div[style*="background: linear-gradient(135deg, #"][style*="color: white"] {
                background: var(--tm-shop-item-bg) !important;
                color: var(--tm-primary-color) !important;
                border: 2px solid var(--tm-primary-color) !important;
            }
            #tm-dashboard-content div[style*="background: linear-gradient(135deg, #"][style*="color: white"] h2,
            #tm-dashboard-content div[style*="background: linear-gradient(135deg, #"][style*="color: white"] p {
                color: var(--tm-primary-color) !important;
            }
            #tm-dashboard-content div[style*="background: rgba(0,0,0,0.2)"] {
                background: var(--tm-dark-hover) !important;
            }
            #tm-dashboard-content button[style*="linear-gradient"] {
                background: transparent !important;
                border: 1px solid var(--tm-primary-color) !important;
                color: var(--tm-primary-color) !important;
            }
            #tm-dashboard-content button[style*="linear-gradient"]:hover {
                background: var(--tm-primary-color) !important;
                color: var(--tm-dark-hover) !important;
            }
            
            /* Talents System */
            .tm-talent-card { 
                background: var(--tm-shop-item-bg) !important; 
                border-color: var(--tm-shop-item-border) !important; 
            }
            .tm-talent-card.unlocked { 
                background: var(--tm-shop-item-owned-bg) !important; 
                border-color: var(--tm-primary-color) !important; 
            }
            .tm-talent-card.locked { opacity: 0.5 !important; }
            .tm-talent-card div[style*="color: #2c3e50"] { color: var(--tm-primary-color) !important; }
            .tm-talent-card div[style*="color: #64748b"],
            .tm-talent-card div[style*="color: #94a3b8"] { color: var(--tm-secondary-hover) !important; }
            .tm-talent-card strong[style*="color: #ffd700"] { color: var(--tm-warning-color) !important; }
            
            /* Talent Unlock Buttons */
            .tm-talent-unlock-btn, .tm-talent-unlock-btn-dashboard { 
                background: transparent !important; 
                border: 1px solid var(--tm-primary-color) !important; 
                color: var(--tm-primary-color) !important; 
            }
            .tm-talent-unlock-btn:hover:not(:disabled), 
            .tm-talent-unlock-btn-dashboard:hover:not(:disabled) { 
                background: var(--tm-primary-color) !important; 
                color: var(--tm-dark-hover) !important; 
            }
            .tm-talent-unlock-btn:disabled, 
            .tm-talent-unlock-btn-dashboard:disabled { 
                background: var(--tm-dark-hover) !important; 
                color: var(--tm-secondary-hover) !important; 
                border-color: var(--tm-secondary-hover) !important; 
            }
            
            /* Talent Points Display */
            .tm-talent-points-badge { 
                background: var(--tm-shop-item-bg) !important; 
                color: var(--tm-warning-color) !important; 
                border: 1px solid var(--tm-warning-color) !important; 
            }
            
            /* Talents Modal Grid */
            #tm-talents-modal-grid .tm-talent-card,
            #tm-talents-dashboard-grid .tm-talent-card {
                background: var(--tm-shop-item-bg) !important;
                border-color: var(--tm-shop-item-border) !important;
            }
            #tm-talents-modal-grid .tm-talent-card.unlocked,
            #tm-talents-dashboard-grid .tm-talent-card.unlocked {
                background: var(--tm-shop-item-owned-bg) !important;
                border-color: var(--tm-primary-color) !important;
            }
            /* Debug Tab Specific Styles */
            #sec-debug input[type="number"] { background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 16px !important; text-align: center; }
            #sec-debug input[type="number"]::-webkit-inner-spin-button, 
            #sec-debug input[type="number"]::-webkit-outer-spin-button { 
                -webkit-appearance: none; margin: 0; 
            }
            #sec-debug button { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; text-shadow: none; transition: all 0.2s ease-out; box-shadow: none; padding: 0 15px; margin-left: 5px; }
            #sec-debug button:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; box-shadow: 0 0 10px var(--tm-primary-color); }
            .tm-mascot-state-btn, .tm-mascot-stage-btn { background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 8px !important; padding: 8px 12px !important; cursor: pointer; font-weight: 500; text-shadow: none; transition: all 0.2s ease-out; box-shadow: none; font-size: 13px; }
            .tm-mascot-state-btn:hover, .tm-mascot-stage-btn:hover { background: linear-gradient(135deg, rgba(79, 172, 254, 0.4) 0%, rgba(0, 242, 254, 0.4) 100%) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important; }
            .tm-setting-control input[type="checkbox"], #tm-working-hours-editor input[type="checkbox"] { -webkit-appearance: none; appearance: none; background-color: var(--tm-dark-hover); margin: 0; font: inherit; color: var(--tm-primary-color); width: 1.15em; height: 1.15em; border: 1px solid var(--tm-primary-color); border-radius: 2px; transform: translateY(-0.075em); display: grid; place-content: center; }
            .tm-setting-control input[type="checkbox"]::before, #tm-working-hours-editor input[type="checkbox"]::before { content: ""; width: 0.65em; height: 0.65em; transform: scale(0); transition: 120ms transform ease-in-out; box-shadow: inset 1em 1em var(--tm-primary-color); }
            #tm-working-hours-editor { background: var(--tm-shop-item-bg) !important; border: 1px solid var(--tm-shop-item-border) !important; }
            .tm-setting-control input[type="checkbox"]:checked::before, #tm-working-hours-editor input[type="checkbox"]:checked::before { transform: scale(1); }
            .tm-setting-control input[type="checkbox"]:focus { outline: none; box-shadow: 0 0 8px var(--tm-primary-color); }
            .tm-talent-points-display { 
                background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-radius: 4px;
                text-shadow: 0 0 5px var(--tm-primary-color);
            }
            .tm-talent-points-display span { color: var(--tm-info-color) !important; }
            .tm-settings-section h3 { color: var(--tm-primary-color) !important; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid var(--tm-secondary-hover) !important; text-shadow: 0 0 5px var(--tm-primary-color); }
            /* Style for the debug mode row in settings */
            @keyframes matrix-pulse-red { 0%, 100% { border-color: #800; box-shadow: 0 0 5px #f00; } 50% { border-color: #f00; box-shadow: 0 0 15px #f00; } }
            .tm-settings-section .tm-setting-row[style*="fffbe6"] { background: #1a0505 !important; border: 1px solid #800 !important; border-radius: 8px; animation: matrix-pulse-red 3s infinite; }
            .tm-settings-section .tm-setting-row[style*="fffbe6"] label { color: #ff4444 !important; }
            .tm-talent-item { background: var(--tm-shop-item-bg) !important; border-color: var(--tm-shop-item-border) !important; }
            .tm-talent-item.unlocked { background: var(--tm-shop-item-owned-bg) !important; border-left-color: var(--tm-primary-color) !important; }
            .tm-talent-btn.unlockable { background-color: var(--tm-success-color) !important; color: var(--tm-dark-hover) !important; }
            .tm-talent-btn.unlocked { background-color: #222 !important; color: #888 !important; }
            .tm-talent-btn:disabled:not(.unlocked) { background-color: #111 !important; color: #555 !important; cursor: not-allowed; }
            .tm-data-btn.export, .tm-data-btn.import, .tm-data-btn.reset { background: transparent !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            /* Settings Modal Buttons */
            #tm-settings-save, #tm-settings-reset, #tm-quick-search-add-btn, #tm-scratchpad-template-add-btn, #tm-price-options-add-btn { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; }
            #tm-settings-save:hover, #tm-settings-reset:hover, #tm-quick-search-add-btn:hover, #tm-scratchpad-template-add-btn:hover, #tm-price-options-add-btn:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; box-shadow: 0 0 10px var(--tm-primary-color); }
            .tm-quick-search-remove-btn, .tm-template-remove-btn { background: transparent !important; color: var(--tm-danger-color) !important; border: 1px solid var(--tm-danger-color) !important; border-radius: 16px !important; }
            .tm-quick-search-remove-btn:hover, .tm-template-remove-btn:hover { background: var(--tm-danger-color) !important; color: var(--tm-dark-hover) !important; box-shadow: 0 0 10px var(--tm-danger-color); }
            .tm-data-btn.export:hover, .tm-data-btn.import:hover, .tm-data-btn.reset:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; }

            /* --- Popups, Notifications, and Overlays --- */
            /* Search Suggest Popup */
            .search_suggest { background: var(--tm-dark-hover) !important; border: 1px solid var(--tm-primary-color) !important; box-shadow: 0 0 10px var(--tm-primary-color); }
            .search_suggest div { color: var(--tm-primary-color) !important; border-color: var(--tm-shop-item-border) !important; }
            .search_suggest div.search_suggest_header { background: var(--tm-dark-color) !important; }
            .search_suggest div.search_suggest_link_over { background: var(--tm-shop-item-hover-bg) !important; color: var(--tm-info-color) !important; }

            /* Positive Message & Achievement Popups */
            #tm-positive-message, #tm-achievement-notification { background-color: var(--tm-shop-item-hover-bg) !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; text-shadow: 0 0 5px var(--tm-primary-color); }

            /* Game Overlays */
            #tm-memory-game-overlay, #tm-game-overlay { background: var(--tm-dark-color) !important; backdrop-filter: blur(10px); }
            #tm-memory-game-status, #tm-game-ui, #tm-game-end-screen h1, #tm-game-end-screen h2 { color: var(--tm-primary-color) !important; text-shadow: 0 0 8px var(--tm-primary-color); }
            .tm-memory-game-pad { border-color: var(--tm-primary-color) !important; background: var(--tm-dark-hover) !important; }
            .tm-memory-game-pad.active { background: var(--tm-primary-color) !important; }

            /* Login Page Settings Panel */
            #login-settings-panel { background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; box-shadow: 0 0 20px var(--tm-primary-color) !important; }
            #login-settings-panel h2, #login-settings-panel h3 { color: var(--tm-primary-color) !important; border-color: var(--tm-secondary-hover) !important; }
            .login-user-item { background: var(--tm-dark-hover) !important; border-color: var(--tm-shop-item-border) !important; }
            .login-user-item span { color: var(--tm-primary-color) !important; }
            .login-user-item button { background: #222 !important; color: #888 !important; }
            .login-user-item button:hover { background: var(--tm-danger-hover) !important; color: var(--tm-info-color) !important; }
            #login-settings-panel input, #login-settings-panel textarea { background: var(--tm-dark-hover) !important; color: var(--tm-primary-color) !important; border-color: var(--tm-secondary-hover) !important; }
            #login-settings-panel input:focus, #login-settings-panel textarea:focus { border-color: var(--tm-primary-color) !important; box-shadow: 0 0 8px var(--tm-primary-color) !important; }
            #save-login-user-btn { background: var(--tm-success-hover) !important; }
            #save-login-user-btn:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; }

            /* --- Scratchpad Theme --- */
            #tm-scratchpad-container { background: var(--tm-dark-color) !important; border: 1px solid var(--tm-primary-color) !important; box-shadow: 0 0 20px var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            #tm-scratchpad-header { background: var(--tm-shop-item-bg) !important; border-bottom: 1px solid var(--tm-secondary-hover) !important; }
            #tm-scratchpad-title, #tm-scratchpad-last-edited { color: var(--tm-primary-color) !important; }
            #tm-scratchpad-header-controls button { color: var(--tm-primary-color) !important; }
            #tm-scratchpad-header-controls button:hover { background: var(--tm-shop-item-hover-bg) !important; color: var(--tm-info-color) !important; }
            #tm-scratchpad-search { background: var(--tm-dark-hover) !important; border-color: var(--tm-secondary-hover) !important; color: var(--tm-primary-color) !important; }
            #tm-scratchpad-search:focus { border-color: var(--tm-primary-color) !important; box-shadow: 0 0 8px var(--tm-primary-color); }
            #tm-scratchpad-tabs-container { background: var(--tm-shop-item-bg) !important; border-bottom-color: var(--tm-secondary-hover) !important; }
            .tm-scratchpad-tab { background: var(--tm-dark-color) !important; color: var(--tm-secondary-hover) !important; }
            .tm-scratchpad-tab.active { background: var(--tm-dark-hover) !important; color: var(--tm-primary-color) !important; }
            .tm-scratchpad-tab.pinned { border-left-color: var(--tm-primary-color) !important; }
            #tm-scratchpad-new-tab-btn { background: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; }
            #tm-scratchpad-toolbar { background: var(--tm-shop-item-bg) !important; border-bottom-color: var(--tm-secondary-hover) !important; }
            #tm-scratchpad-toolbar button { color: var(--tm-primary-color) !important; }
            #tm-scratchpad-toolbar button:hover { background: var(--tm-shop-item-hover-bg) !important; color: var(--tm-info-color) !important; }
            #tm-scratchpad-editor { background: var(--tm-dark-hover) !important; color: var(--tm-primary-color) !important; }
            .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(50%) sepia(100%) saturate(1000%) hue-rotate(90deg); }
            #tm-scratchpad-reminder-popover, #tm-scratchpad-template-popover { background: var(--tm-dark-color) !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            .tm-scratchpad-source-link { background: var(--tm-shop-item-bg) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; }
            .tm-scratchpad-source-link:hover { background: var(--tm-shop-item-hover-bg) !important; }
            #tm-scratchpad-reminder-popover h5, #tm-scratchpad-template-popover h5 { color: var(--tm-primary-color) !important; }

            /* --- Notification Center - Keep glass theme --- */
            #tm-notification-unread-count { background-color: var(--tm-danger-color) !important; color: white !important; text-shadow: none; }
            #tm-notification-panel { background: var(--tm-dark-color) !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            .tm-notification-header { border-bottom-color: var(--tm-secondary-hover) !important; }
            .tm-notification-header h4 { color: var(--tm-primary-color) !important; }
            .tm-notification-header button { color: var(--tm-primary-hover) !important; }
            .tm-notification-item { border-bottom-color: var(--tm-shop-item-border) !important; }
            .tm-notification-item.unread { background-color: var(--tm-shop-item-owned-bg) !important; }
            .tm-notification-message { color: var(--tm-primary-color) !important; }
            .tm-notification-timestamp { color: var(--tm-secondary-hover) !important; }
            #tm-notification-empty-state { color: var(--tm-secondary-hover) !important; }
            
            /* --- Mascot Interaction Panel --- */
            #tm-mascot-interaction-panel { background: var(--tm-dark-color) !important; border: 1px solid var(--tm-primary-color) !important; box-shadow: 0 0 15px var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            .tm-pet-stat-label { color: var(--tm-primary-color) !important; }
            .tm-pet-stat-bar { background-color: var(--tm-dark-hover) !important; border: 1px solid var(--tm-secondary-hover) !important; }
            #tm-pet-happiness-bar .tm-pet-stat-bar-fill { background-color: var(--tm-primary-color) !important; }
            #tm-pet-hunger-bar .tm-pet-stat-bar-fill { background-color: var(--tm-secondary-hover) !important; }
            #tm-mascot-interaction-buttons button { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; }
            #tm-mascot-interaction-buttons button:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; }

            /* --- Final Theming Pass for All Script Elements --- */
            /* Custom Login Page */
            .minimal-login-container h1 { text-shadow: 0 0 8px var(--tm-primary-color); }
            #minimal-username-input { background: var(--tm-shop-item-bg) !important; border-color: var(--tm-secondary-hover) !important; color: var(--tm-primary-color) !important; text-shadow: 0 0 5px var(--tm-primary-color); }
            #minimal-username-input:focus { border-color: var(--tm-primary-color) !important; box-shadow: 0 0 15px var(--tm-primary-color) !important; }
            .minimal-store-btn { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; }
            .minimal-store-btn:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; box-shadow: 0 0 10px var(--tm-primary-color); }
            #login-settings-btn { background: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; }

            /* Slide-out Buttons (Right side) */
            .tm-slide-out-btn { background-color: var(--tm-dark-color) !important; border: 1px solid var(--tm-secondary-hover) !important; border-right: none !important; color: var(--tm-primary-color) !important; }
            .tm-slide-out-btn:hover { background-color: var(--tm-dark-hover) !important; }
            #tm-phone-catalog-btn { 
                background: var(--tm-dark-color) !important; 
                background-color: var(--tm-dark-color) !important; 
                background-image: none !important;
                border: 1px solid var(--tm-secondary-hover) !important; 
                border-right: none !important; 
                color: var(--tm-primary-color) !important; 
                font-weight: 600 !important; 
            }
            #tm-phone-catalog-btn:hover { 
                background: var(--tm-dark-hover) !important; 
                background-color: var(--tm-dark-hover) !important; 
                background-image: none !important;
            }

            /* Scroll-to-Top Button */
            #tm-scroll-to-top-btn { background-color: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; }
            #tm-scroll-to-top-btn:hover { background-color: var(--tm-dark-hover) !important; }

            /* XP Bar, Coin Balance, Dashboard - Keep glass theme but adjust text colors */
            #tm-xp-bar-container *, #tm-daily-dashboard-widget * { color: white !important; text-shadow: 0 0 3px rgba(255,255,255,0.5); }
            #tm-coin-balance * { color: var(--tm-primary-color) !important; text-shadow: 0 0 3px rgba(255,255,255,0.5); }
            #tm-xp-bar-fill { animation: none; box-shadow: none; } /* Disable default pulse for a cleaner look */
            #tm-user-title-text { text-shadow: 0 0 5px var(--tm-info-color); }

            /* Level Up Overlay */
            .tm-level-up-title { color: var(--tm-primary-color) !important; letter-spacing: 4px; }
            .tm-level-up-reward { background: rgba(255,255,255,0.06) !important; color: var(--tm-primary-color) !important; border-color: var(--tm-primary-color) !important; }
            .tm-level-up-progress-fill { background: linear-gradient(90deg, var(--tm-secondary-hover), var(--tm-primary-color)) !important; }
            .tm-level-up-content::after { border-color: var(--tm-primary-color) !important; }

            /* Daily Bounties & Titles Modals */
            .tm-quest-item, .tm-title-item { background: var(--tm-shop-item-bg) !important; border-color: var(--tm-shop-item-border) !important; }
            .tm-quest-item.completed { background: var(--tm-shop-item-owned-bg) !important; border-color: var(--tm-secondary-hover) !important; }
            .tm-quest-description, .tm-title-name { color: var(--tm-primary-color) !important; }
            .tm-quest-reward { background: var(--tm-dark-hover) !important; color: var(--tm-primary-hover) !important; }
            .tm-title-level { background: var(--tm-dark-hover) !important; color: var(--tm-primary-color) !important; }

            /* Mascot Speech Bubble */
            .tm-mascot-speech-bubble { background-color: var(--tm-dark-color) !important; border-color: var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; }
            .tm-mascot-speech-bubble::after { border-top-color: var(--tm-primary-color) !important; }
            
            /* --- Dashboard Modal & Tabs --- */
            .tm-dashboard-tabs { border-bottom-color: var(--tm-secondary-hover) !important; }
            .tm-dashboard-tab { background: var(--tm-dark-color) !important; border-color: var(--tm-shop-item-border) !important; color: var(--tm-secondary-hover) !important; }
            .tm-dashboard-tab.active, .tm-dashboard-tab:hover { background: var(--tm-dark-hover) !important; color: var(--tm-primary-color) !important; border-bottom-color: var(--tm-primary-color) !important; }
            #tm-dashboard-content { color: var(--tm-primary-color) !important; }
            
            /* Dashboard Overview Cards */
            #tm-dashboard-content > div > div[style*="linear-gradient"] { 
                background: var(--tm-shop-item-bg) !important; 
                border: 1px solid var(--tm-shop-item-border) !important;
                color: var(--tm-primary-color) !important;
            }
            #tm-dashboard-content h4 { color: var(--tm-primary-color) !important; }
            #tm-dashboard-content > div > div[style*="background: linear-gradient"] > div { color: var(--tm-primary-color) !important; }
            
            /* Dashboard Stat Cards (Today's Summary items) */
            #tm-dashboard-content div[style*="rgba(79, 172, 254"],
            #tm-dashboard-content div[style*="rgba(102, 187, 106"],
            #tm-dashboard-content div[style*="rgba(255, 152, 0"],
            #tm-dashboard-content div[style*="rgba(233, 30, 99"] {
                background: var(--tm-dark-hover) !important;
                color: var(--tm-primary-color) !important;
            }
            #tm-dashboard-content div[style*="rgba(79, 172, 254"] div[style*="color: #4facfe"],
            #tm-dashboard-content div[style*="rgba(102, 187, 106"] div[style*="color: #66bb6a"],
            #tm-dashboard-content div[style*="rgba(255, 152, 0"] div[style*="color: #ff9800"],
            #tm-dashboard-content div[style*="rgba(233, 30, 99"] div[style*="color: #e91e63"],
            #tm-dashboard-content div[style*="color: #64748b"] {
                color: var(--tm-primary-color) !important;
            }
            
            /* Dashboard Performance Chart */
            #tm-performance-chart { background: var(--tm-dark-hover) !important; }
            
            /* --- Boss Battle Notification --- */
            #tm-boss-notification { background: var(--tm-dark-color) !important; border: 2px solid var(--tm-danger-color) !important; color: var(--tm-primary-color) !important; box-shadow: 0 0 20px var(--tm-danger-color) !important; }
            #tm-boss-notification h3, #tm-boss-notification h4 { color: var(--tm-danger-color) !important; text-shadow: 0 0 8px var(--tm-danger-color); }
            #tm-boss-notification button { background: transparent !important; border: 1px solid var(--tm-danger-color) !important; color: var(--tm-danger-color) !important; }
            #tm-boss-notification button:hover { background: var(--tm-danger-color) !important; color: var(--tm-dark-hover) !important; }
            .tm-boss-progress-bar { background: var(--tm-dark-hover) !important; border: 1px solid var(--tm-secondary-hover) !important; }
            .tm-boss-progress-fill { background: linear-gradient(90deg, var(--tm-danger-color), var(--tm-warning-color)) !important; }
            
            /* --- Event Notification --- */
            #tm-event-notification { background: var(--tm-dark-color) !important; border: 2px solid var(--tm-warning-color) !important; color: var(--tm-primary-color) !important; box-shadow: 0 0 20px var(--tm-warning-color) !important; }
            #tm-event-notification h3, #tm-event-notification h4 { color: var(--tm-warning-color) !important; text-shadow: 0 0 8px var(--tm-warning-color); }
            #tm-event-notification button { background: transparent !important; border: 1px solid var(--tm-warning-color) !important; color: var(--tm-warning-color) !important; }
            #tm-event-notification button:hover { background: var(--tm-warning-color) !important; color: var(--tm-dark-hover) !important; }

            /* --- Footer Theming --- */
            #footer-outter, #footer-outterwrap { background-color: var(--tm-shop-item-bg) !important; }
            #footer-outterwrap td, #footer-outterwrap span { color: var(--tm-primary-color) !important; text-shadow: 0 0 3px var(--tm-primary-color); }
            #footer-outterwrap a, #footer-outterwrap a span { color: var(--tm-primary-hover) !important; text-decoration: none !important; }
            #footer-outterwrap a:hover, #footer-outterwrap a:hover span { color: var(--tm-info-color) !important; text-decoration: underline !important; }
            /* Footer icons - add padding and margin */
            #footer-outterwrap img, #footer-outterwrap a img, #footer-outterwrap td img {
                padding: 8px !important;
                margin: 4px !important;
            }
            /* Footer buttons - consistent styling */
            #tm-recent-repairs-btn {
                padding: 8px 16px !important;
                margin: 4px !important;
                border-radius: 12px !important;
                min-height: 36px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                line-height: 1.5 !important;
            }
            /* Replace the default footer logo with a custom Matrix-themed SVG logo */
            #footer-outterwrap .footer-logo { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='40' viewBox='0 0 200 40'%3E%3Cdefs%3E%3Cfilter id='matrix-glow'%3E%3CfeGaussianBlur stdDeviation='1.5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ctext x='50%25' y='50%25' dy='.3em' fill='var(--tm-primary-color)' font-family='Consolas,Monaco,monospace' font-size='22' font-weight='bold' text-anchor='middle' filter='url(%23matrix-glow)'%3EThe Fixers%3C/text%3E%3C/svg%3E") !important; filter: none !important; }
            
            /* Footer Widgets - Keep glass theme but adjust text/icon colors */
            #tm-weather-temp { color: white !important; }
            #tm-weather-details { background: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; }
            .tm-refresh-time-text { color: white !important; }
            
            /* Buff Timers - Keep glass theme */
            .tm-buff-timer-icon { color: white !important; }

            /* --- Repair Edit Page Specifics --- */
            .rnr-b-editheader h1 { color: var(--tm-info-color) !important; text-shadow: 0 0 8px var(--tm-info-color); } /* Make header white for emphasis */
            .fieldGrid .rnr-label label, .fieldGrid .rnr-label b { color: var(--tm-secondary-hover) !important; } /* Use secondary green for labels */
            .fieldGrid td { background: transparent !important; }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { border: 1px solid var(--tm-shop-item-border) !important; background: rgba(0, 10, 0, 0.2) !important; border-radius: 4px; padding: 10px; }
            /* Style for sub-grids on the edit page (e.g., spare parts list) */
            .rnr-cw-grid.rnr-s-grid > table > tbody > tr[data-record-id] { background: var(--tm-shop-item-owned-bg) !important; }
            .rnr-cw-grid.rnr-s-grid > table > tbody > tr[data-record-id] td { color: var(--tm-primary-color) !important; }
            .rnr-cw-grid.rnr-s-grid > table > tbody > tr[data-record-id]:hover { background: var(--tm-secondary-hover) !important; }
            .rnr-cw-grid.rnr-s-grid > table > tbody > tr[data-record-id]:hover td { color: var(--tm-info-color) !important; }

            /* --- Dark Theme Text Contrast (override base styles hardcoded grays/blacks) --- */
            .tm-modal-title,
            .tm-integrated-panel-title,
            .tm-settings-section h3,
            .tm-setting-label label,
            .tm-settings-main,
            .tm-settings-main label,
            .tm-settings-main p,
            .tm-settings-main span,
            .tm-settings-main li,
            .tm-settings-main td,
            .tm-settings-main th,
            #tm-status-message,
            .tm-search-list-section h4,
            .tm-search-list-item,
            .tm-search-list-item a,
            #tm-search-favorite-btn,
            .tm-search-list-action-btn,
            .tm-talent-name,
            .tm-talent-description,
            .tm-talent-points-display,
            .tm-talent-item,
            .tm-notification-message,
            .tm-panel-info,
            .tm-age-text,
            .tm-weight-text,
            .tm-panel-close,
            .tm-stat-name,
            .tm-section-title,
            .tm-quest-description,
            .tm-title-name,
            #tm-scratchpad-last-edited,
            .tm-sortable-header {
                color: var(--tm-text-on-dark, var(--tm-primary-color)) !important;
            }
            .tm-notification-timestamp,
            .tm-setting-description,
            .tm-talent-description,
            #tm-notification-empty-state,
            .tm-details-loading,
            .tm-search-list-section h4 {
                color: var(--tm-secondary-hover, var(--tm-secondary-color)) !important;
            }
            .tm-settings-sidebar .tm-nav a {
                color: var(--tm-primary-color) !important;
                background: var(--tm-dark-color) !important;
            }
            .tm-settings-sidebar .tm-nav a.active {
                color: var(--tm-info-color, var(--tm-primary-color)) !important;
            }
            .tm-settings-section {
                border-bottom-color: var(--tm-shop-item-border) !important;
            }
            .tm-settings-section h3 {
                border-bottom-color: var(--tm-shop-item-border) !important;
            }
            .tm-modal-footer {
                border-top-color: var(--tm-shop-item-border) !important;
            }
            #tm-search-history-favorites-container {
                border-top-color: var(--tm-shop-item-border) !important;
            }
            .tm-search-list-section h4 {
                border-bottom-color: var(--tm-shop-item-border) !important;
            }
            .tm-result-details-container {
                background-color: var(--tm-shop-item-bg) !important;
                border-top-color: var(--tm-shop-item-border) !important;
                color: var(--tm-primary-color) !important;
            }
            .tm-details-table td {
                border-color: var(--tm-shop-item-border) !important;
                color: var(--tm-primary-color) !important;
            }
            .tm-details-label {
                background-color: var(--tm-dark-hover) !important;
                color: var(--tm-secondary-hover, var(--tm-secondary-color)) !important;
            }
            .tm-details-value {
                color: var(--tm-primary-color) !important;
            }
            .tm-talent-btn.unlocked {
                color: var(--tm-secondary-hover, var(--tm-secondary-color)) !important;
            }
            .tm-talent-btn:disabled:not(.unlocked) {
                color: var(--tm-secondary-color) !important;
            }
            .login-user-item button {
                color: var(--tm-secondary-hover, var(--tm-secondary-color)) !important;
            }
            /* Inline grays/blacks from dynamically generated HTML */
            [style*="color: #333"],
            [style*="color:#333"],
            [style*="color: #666"],
            [style*="color:#666"],
            [style*="color: #888"],
            [style*="color:#888"],
            [style*="color: #999"],
            [style*="color:#999"],
            [style*="color: #495057"],
            [style*="color:#495057"],
            [style*="color: #343a40"],
            [style*="color:#343a40"],
            [style*="color: #2c3e50"],
            [style*="color:#2c3e50"],
            [style*="color: #64748b"],
            [style*="color:#64748b"],
            [style*="color: #94a3b8"],
            [style*="color:#94a3b8"],
            [style*="color: #6c757d"],
            [style*="color:#6c757d"] {
                color: var(--tm-text-on-dark, var(--tm-primary-color)) !important;
            }
            /* Runner field values / labels that stay black */
            .fieldGrid .rnr-value,
            .fieldGrid .rnr-readonly,
            .fieldGrid span,
            .fieldGrid div,
            .rnr-b-editfields2_atop td,
            .rnr-b-editfields2_atop span,
            .rnr-b-editfields2_atop label,
            .rnr-s-undermenu span,
            .rnr-s-undermenu div,
            .rnr-b-loggedas,
            .rnr-b-loggedas div,
            .pagetitle,
            .pagetitle span {
                color: var(--tm-primary-color) !important;
            }
        `;

const UI_THEMES = {
    'default': {
        name: 'Default', icon: '🎨', cost: 0,
        colors: {
            '--tm-primary-color': '#007bff', '--tm-primary-hover': '#0056b3',
            '--tm-secondary-color': '#6c757d', '--tm-secondary-hover': '#5a6268',
            '--tm-success-color': '#28a745', '--tm-success-hover': '#218838',
            '--tm-danger-color': '#dc3545', '--tm-danger-hover': '#c82333',
            '--tm-warning-color': '#ffc107', '--tm-warning-hover': '#e0a800',
            '--tm-info-color': '#17a2b8', '--tm-info-hover': '#138496',
            '--tm-dark-color': '#343a40', '--tm-dark-hover': '#23272b',
            '--tm-shop-item-bg': '#f8f9fa', '--tm-shop-item-border': '#dee2e6',
            '--tm-shop-item-hover-bg': '#e9ecef', '--tm-shop-item-owned-bg': '#e7f1ff',
            '--tm-text-on-primary': '#ffffff', '--tm-text-on-success': '#ffffff',
            '--tm-text-on-light': '#343a40', '--tm-text-on-dark': '#cccccc',
            '--tm-modal-bg': '#ffffff',
        },
        pageStyles: `/* Default Theme - Light Background Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; background-color: var(--tm-danger-color) !important; }
            .minimal-store-btn:hover, .rnr-button:hover, #tm-settings-save:hover, #tm-settings-reset:hover, 
            #tm-mascot-interaction-buttons button:hover, .tm-shop-item-btn:hover:not(:disabled),
            .tm-talent-unlock-btn:hover:not(:disabled), .tm-talent-unlock-btn-dashboard:hover:not(:disabled),
            #tm-dashboard-content button[style*="linear-gradient"]:hover { 
                color: var(--tm-text-on-primary) !important; 
            }
            .tm-modal-content, .tm-modal-header, .tm-modal-footer { 
                background: var(--tm-modal-bg) !important;
                color: var(--tm-text-on-light) !important; 
                border-color: var(--tm-shop-item-border) !important; 
            }
            /* Settings modal - use theme background */
            .tm-modal-content:has(.tm-settings-layout),
            .tm-modal-content .tm-settings-layout {
                background: var(--tm-modal-bg) !important;
            }
            .tm-modal-content:has(.tm-settings-layout) {
                background: var(--tm-modal-bg) !important;
                color: var(--tm-text-on-light) !important;
            }
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-header,
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-footer {
                background: var(--tm-modal-bg) !important;
                color: var(--tm-text-on-light) !important;
                border-color: var(--tm-shop-item-border) !important;
            }
            .tm-modal-title, .tm-modal-close { color: var(--tm-primary-color) !important; }
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-title,
            .tm-modal-content:has(.tm-settings-layout) .tm-modal-close {
                color: var(--tm-text-on-light) !important;
            }
            .tm-setting-label label { color: var(--tm-primary-color) !important; }
            .tm-modal-content:has(.tm-settings-layout) .tm-setting-label label {
                color: var(--tm-text-on-light) !important;
            }
            .tm-setting-description { color: var(--tm-secondary-hover) !important; }
            .tm-modal-content:has(.tm-settings-layout) .tm-setting-description {
                color: var(--tm-secondary-color) !important;
            }
            
            /* Footer buttons - consistent styling */
            #tm-footer-controls-left button, #tm-footer-controls-right button,
            button[title*="Talent"], button[title*="Faction"], button[title*="Boss"],
            #tm-recent-repairs-btn {
                padding: 8px 16px !important;
                margin: 4px !important;
                border-radius: 12px !important;
                min-height: 36px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                line-height: 1.5 !important;
            }
            #tm-footer-controls-left button:hover, #tm-footer-controls-right button:hover,
            #tm-recent-repairs-btn:hover {
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }

            /* Default-theme styling for Phone Catalog slide-out button */
            #tm-phone-catalog-btn {
                background: #ffffff !important;
                color: var(--tm-primary-color) !important;
                border-color: var(--tm-shop-item-border) !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08) !important;
            }
            #tm-phone-catalog-btn:hover {
                background: var(--tm-primary-color) !important;
                color: var(--tm-text-on-primary) !important;
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15) !important;
            }
   
            /* Boss Battle & Random Event Modals - Special Grey Gradient Styling */
            .tm-modal-content[style*="background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%)"] {
                background: linear-gradient(145deg, #4a4a4a 0%, #2d2d2d 100%) !important;
                color: #ffffff !important;
                border: 3px solid #666666 !important;
                box-shadow: 0 0 40px rgba(102, 102, 102, 0.8), 
                           0 0 80px rgba(102, 102, 102, 0.4) !important;
                animation: tm-modal-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite, 
                          tm-modal-float 6s ease-in-out infinite !important;
                position: relative !important;
                overflow: hidden !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            
            /* Animated background shimmer effect */
            .tm-modal-content[style*="background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%)"]::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(255, 255, 255, 0.1) 50%,
                    transparent 70%
                );
                animation: tm-shimmer 5s ease-in-out infinite;
                pointer-events: none;
            }
            
            /* Boss Battle Modal Header Styling */
            .tm-modal-content[style*="background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%)"] .tm-modal-header {
                background: linear-gradient(135deg, #5a5a5a 0%, #3a3a3a 100%) !important;
                border-bottom: 2px solid #888888 !important;
                animation: tm-header-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                color: #ffffff !important;
            }
            
            /* Boss Battle Modal Header Text Styling */
            .tm-modal-content[style*="background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%)"] .tm-modal-header h3,
            .tm-modal-content[style*="background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%)"] .tm-modal-header div,
            .tm-modal-content[style*="background: linear-gradient(145deg, #0a0a0a 0%, #000000 100%)"] .tm-modal-header .tm-modal-close {
                color: #ffffff !important;
                text-shadow: 0 0 8px rgba(255, 255, 255, 0.3) !important;
            }
            
            /* Random Event Modal Styling */
            .tm-modal-content[style*="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"] {
                background: linear-gradient(145deg, #6a6a6a 0%, #4a4a4a 100%) !important;
                color: #ffffff !important;
                border: 3px solid #888888 !important;
                box-shadow: 0 0 40px rgba(136, 136, 136, 0.8),
                           0 0 80px rgba(136, 136, 136, 0.4) !important;
                animation: tm-modal-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite, 
                          tm-modal-float 6s ease-in-out infinite !important;
                position: relative !important;
                overflow: hidden !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            
            /* Random Event Modal Header Styling */
            .tm-modal-content[style*="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"] .tm-modal-header {
                background: linear-gradient(135deg, #6a6a6a 0%, #4a4a4a 100%) !important;
                border-bottom: 2px solid #888888 !important;
                animation: tm-header-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                color: #ffffff !important;
            }
            
            /* Random Event Modal Header Text Styling */
            .tm-modal-content[style*="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"] .tm-modal-header h3,
            .tm-modal-content[style*="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"] .tm-modal-header div,
            .tm-modal-content[style*="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"] .tm-modal-header .tm-modal-close {
                color: #ffffff !important;
                text-shadow: 0 0 8px rgba(255, 255, 255, 0.3) !important;
            }
            
            /* Random Event Modal Shimmer */
            .tm-modal-content[style*="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)"]::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(255, 255, 255, 0.15) 50%,
                    transparent 70%
                );
                animation: tm-shimmer 4s ease-in-out infinite;
                pointer-events: none;
            }
            
            /* Enhanced Animation Keyframes with Smooth Easing */
            @keyframes tm-modal-glow {
                0% { 
                    box-shadow: 0 0 30px rgba(102, 102, 102, 0.6), 
                               0 0 60px rgba(102, 102, 102, 0.3),
                               0 0 90px rgba(102, 102, 102, 0.1),
                               inset 0 0 15px rgba(255, 255, 255, 0.05);
                    transform: scale(1);
                }
                25% { 
                    box-shadow: 0 0 45px rgba(102, 102, 102, 0.8), 
                               0 0 90px rgba(102, 102, 102, 0.5),
                               0 0 135px rgba(102, 102, 102, 0.2),
                               inset 0 0 25px rgba(255, 255, 255, 0.15);
                    transform: scale(1.002);
                }
                50% { 
                    box-shadow: 0 0 60px rgba(102, 102, 102, 1), 
                               0 0 120px rgba(102, 102, 102, 0.7),
                               0 0 180px rgba(102, 102, 102, 0.3),
                               inset 0 0 35px rgba(255, 255, 255, 0.25);
                    transform: scale(1.005);
                }
                75% { 
                    box-shadow: 0 0 45px rgba(102, 102, 102, 0.8), 
                               0 0 90px rgba(102, 102, 102, 0.5),
                               0 0 135px rgba(102, 102, 102, 0.2),
                               inset 0 0 25px rgba(255, 255, 255, 0.15);
                    transform: scale(1.002);
                }
                100% { 
                    box-shadow: 0 0 30px rgba(102, 102, 102, 0.6), 
                               0 0 60px rgba(102, 102, 102, 0.3),
                               0 0 90px rgba(102, 102, 102, 0.1),
                               inset 0 0 15px rgba(255, 255, 255, 0.05);
                    transform: scale(1);
                }
            }
            
            @keyframes tm-shimmer {
                0% { 
                    transform: translateX(-120%) translateY(-120%) rotate(45deg);
                    opacity: 0;
                }
                10% { 
                    opacity: 1;
                }
                90% { 
                    opacity: 1;
                }
                100% { 
                    transform: translateX(120%) translateY(120%) rotate(45deg);
                    opacity: 0;
                }
            }
            
            @keyframes tm-header-pulse {
                0% { 
                    background: linear-gradient(135deg, #5a5a5a 0%, #3a3a3a 100%);
                    border-bottom-color: #888888;
                    transform: translateY(0px);
                }
                25% { 
                    background: linear-gradient(135deg, #575757 0%, #3d3d3d 100%);
                    border-bottom-color: #909090;
                    transform: translateY(-0.5px);
                }
                50% { 
                    background: linear-gradient(135deg, #6a6a6a 0%, #4a4a4a 100%);
                    border-bottom-color: #aaaaaa;
                    transform: translateY(-1px);
                }
                75% { 
                    background: linear-gradient(135deg, #575757 0%, #3d3d3d 100%);
                    border-bottom-color: #909090;
                    transform: translateY(-0.5px);
                }
                100% { 
                    background: linear-gradient(135deg, #5a5a5a 0%, #3a3a3a 100%);
                    border-bottom-color: #888888;
                    transform: translateY(0px);
                }
            }
            
            /* Additional smooth floating animation */
            @keyframes tm-modal-float {
                0%, 100% { 
                    transform: translateY(0px) rotateX(0deg);
                }
                50% { 
                    transform: translateY(-2px) rotateX(1deg);
                }
            }
            
            .tm-level-up-title { color: var(--tm-primary-color) !important; }
            .tm-level-up-content::after { border-color: var(--tm-primary-color) !important; }
            #tm-mascot-interaction-panel { background: var(--tm-modal-bg) !important; color: var(--tm-primary-color) !important; border-color: var(--tm-shop-item-border) !important; }
            .tm-pet-stat-label { color: var(--tm-primary-color) !important; }
            #tm-notification-panel { background: var(--tm-modal-bg) !important; color: var(--tm-primary-color) !important; }
            .tm-notification-header h4 { color: var(--tm-primary-color) !important; }
            .tm-notification-message { color: var(--tm-primary-color) !important; }
            #tm-scratchpad-container { background: var(--tm-modal-bg) !important; color: var(--tm-primary-color) !important; }
            #tm-scratchpad-title { color: var(--tm-primary-color) !important; }
            #tm-scratchpad-editor { color: var(--tm-primary-color) !important; }
            .tm-mascot-speech-bubble { background: var(--tm-modal-bg) !important; color: var(--tm-primary-color) !important; border-color: var(--tm-primary-color) !important; }`

    },
    'matrix': {
        name: 'Matrix', icon: '📟', cost: 500, type: 'theme', // Cost is for the shop
        colors: {
            '--tm-primary-color': '#00ff00',      // Main interactive color (bright green)
            '--tm-primary-hover': '#33ff33',      // Lighter green for hover
            '--tm-secondary-color': '#00d100',    // A darker green for less important elements
            '--tm-secondary-hover': '#00aa00',    // Hover for secondary
            '--tm-success-color': '#00dd00',      // Success actions
            '--tm-success-hover': '#009900',      //
            '--tm-danger-color': '#ff0000',       // Red for errors/danger
            '--tm-danger-hover': '#cc0000',       //
            '--tm-warning-color': '#ffff00',      // Amber/yellow for warnings
            '--tm-warning-hover': '#cccc00',      //
            '--tm-info-color': '#ffffff',         // White for informational elements, a key accent
            '--tm-info-hover': '#cccccc',         //
            '--tm-dark-color': '#080808',         // Dark background elements
            '--tm-dark-hover': '#000000',         //

            // Shop Item Styles for Matrix
            '--tm-shop-item-bg': '#0a0a0a',
            '--tm-shop-item-border': '#003300',
            '--tm-shop-item-hover-bg': '#002200',
            '--tm-shop-item-owned-bg': '#001a00',
            '--tm-text-on-primary': '#000000',
            '--tm-text-on-success': '#000000',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#00ff00',
            '--tm-modal-bg': '#0a0a0a',
        },
        pageStyles: THEME_STYLES + `/* Matrix Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }`
    },
    'oceanic': {
        name: 'Oceanic', icon: '🌊', cost: 500, type: 'theme',
        colors: {
            '--tm-primary-color': '#40E0D0',      // Turquoise (Shallow Water)
            '--tm-primary-hover': '#48D1CC',      // MediumTurquoise
            '--tm-secondary-color': '#008B8B',    // DarkCyan (Deeper Water)
            '--tm-secondary-hover': '#00CED1',    // DarkTurquoise
            '--tm-success-color': '#2E8B57',      // SeaGreen (Kelp)
            '--tm-success-hover': '#3CB371',      // MediumSeaGreen
            '--tm-danger-color': '#FF6347',       // Tomato (Warning Coral)
            '--tm-danger-hover': '#E55337',       //
            '--tm-warning-color': '#FFD700',      // Gold (Sunken Treasure)
            '--tm-warning-hover': '#E0BE00',      //
            '--tm-info-color': '#87CEEB',         // SkyBlue (Sunlight Rays)
            '--tm-info-hover': '#7AC5E3',         //
            '--tm-dark-color': '#001f3f',         // Navy (Abyss)
            '--tm-dark-hover': '#001a33',         // Darker Navy

            // Shop Item Styles for Oceanic
            '--tm-shop-item-bg': 'rgba(0, 31, 63, 0.7)',      // A semi-transparent abyss blue
            '--tm-shop-item-border': 'var(--tm-primary-color)', // Bright turquoise border
            '--tm-shop-item-hover-bg': 'var(--tm-secondary-color)', // Deeper water color on hover
            '--tm-shop-item-owned-bg': 'rgba(255, 215, 0, 0.15)', // A faint golden glow for owned items
            '--tm-text-on-primary': '#001f3f',
            '--tm-text-on-success': '#001f3f',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#87CEEB',
            '--tm-modal-bg': 'rgba(0, 31, 63, 0.95)',
        },
        pageStyles: THEME_STYLES + `/* Oceanic Theme Overrides */
            @keyframes oceanic-caustics-scroll { 0% { background-position: 0 0; } 100% { background-position: -200px 400px; } }
            body::before { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><filter id="wavy"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="10" /><feDisplacementMap in="SourceGraphic" scale="10" /></filter></defs><rect width="100" height="100" fill="rgba(0,191,255,0.05)" filter="url(%23wavy)" /></svg>') !important; animation: oceanic-caustics-scroll 20s linear infinite !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(95%) sepia(9%) saturate(11%) hue-rotate(193deg) brightness(114%) contrast(100%) !important; }
            
            /* Oceanic Contrast Fixes */
            .tm-modal-content { background: rgba(0, 31, 63, 0.95) !important; }
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { background: rgba(0, 50, 80, 0.3) !important; }
            `
    },
    'cyberpunk': {
        name: 'Cyberpunk', icon: '🌃', cost: 750, type: 'theme', // Cost is for the shop
        colors: {
            '--tm-primary-color': '#00aaff',      // Electric Blue
            '--tm-primary-hover': '#33bbff',      // Lighter Electric Blue
            '--tm-secondary-color': '#0064c8',    // Deep, dark blue for borders
            '--tm-secondary-hover': '#004488',    //
            '--tm-success-color': '#ffff00',      // Vibrant Yellow (for text)
            '--tm-success-hover': '#ffff66',      //
            '--tm-danger-color': '#ff00ff',       // Magenta (as a warning/danger color)
            '--tm-danger-hover': '#cc00cc',       //
            '--tm-warning-color': '#ff9900',      // Bright Orange
            '--tm-warning-hover': '#e68a00',      //
            '--tm-info-color': '#00ffff',         // Cyan (for accents/links)
            '--tm-info-hover': '#00cccc',         //
            '--tm-dark-color': '#0a0514',         // Very dark purplish-blue
            '--tm-dark-hover': '#05020a',         // Near black

            // Shop Item Styles for Cyberpunk
            '--tm-shop-item-bg': '#0a0514',
            '--tm-shop-item-border': '#003366',
            '--tm-shop-item-hover-bg': '#004488',
            '--tm-shop-item-owned-bg': '#003366',
            '--tm-text-on-primary': '#000000',
            '--tm-text-on-success': '#000000',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#00ffff',
            '--tm-modal-bg': 'rgba(10, 5, 20, 0.98)',
        },
        pageStyles: THEME_STYLES + `/* Cyberpunk Theme Overrides */
            body::before { background-image: linear-gradient(var(--tm-primary-color, #00aaff) 1px, transparent 1px), linear-gradient(90deg, var(--tm-primary-color, #00aaff) 1px, transparent 1px) !important; background-size: 50px 50px !important; opacity: 0.1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(58%) sepia(99%) saturate(1455%) hue-rotate(168deg) brightness(102%) contrast(102%) !important; }
            
            /* Cyberpunk Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }
            .tm-modal-content { background: rgba(10, 5, 20, 0.98) !important; }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { background: rgba(0, 51, 102, 0.25) !important; }`
    },
    'solarized_dark': {
        name: 'Solarized Dark', icon: '☀️', cost: 750, type: 'theme',
        colors: {
            '--tm-primary-color': '#268bd2', '--tm-primary-hover': '#1a6094',
            '--tm-secondary-color': '#1c9dc6', '--tm-secondary-hover': '#657b83',
            '--tm-success-color': '#859900', '--tm-success-hover': '#5d6b00',
            '--tm-danger-color': '#dc322f', '--tm-danger-hover': '#cb4b16',
            '--tm-warning-color': '#b58900', '--tm-warning-hover': '#93a1a1',
            '--tm-info-color': '#2aa198', '--tm-info-hover': '#2aa198',
            '--tm-dark-color': '#073642', '--tm-dark-hover': '#002b36',

            // Shop Item Styles for Solarized Dark
            '--tm-shop-item-bg': '#073642',
            '--tm-shop-item-border': '#586e75',
            '--tm-shop-item-hover-bg': '#002b36',
            '--tm-shop-item-owned-bg': '#002b36',
            '--tm-text-on-primary': '#ffffff',
            '--tm-text-on-success': '#ffffff',
            '--tm-text-on-light': '#839496',
            '--tm-text-on-dark': '#93a1a1',
            '--tm-modal-bg': '#073642',
        },
        pageStyles: THEME_STYLES + `/* Solarized Dark Theme Overrides */
            body::before { background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23073642' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E") !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(334%) hue-rotate(148deg) brightness(91%) contrast(88%) !important; }
            
            /* Solarized Dark Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'solarized_light': {
        name: 'Solarized Light', icon: '💡', cost: 750, type: 'theme',
        colors: {
            '--tm-primary-color': '#5b21b6',      // Deep purple - Main interactive
            '--tm-primary-hover': '#7c3aed',      // Lighter purple - Hover
            '--tm-secondary-color': '#78716c',    // Warm stone - Secondary
            '--tm-secondary-hover': '#57534e',    // Darker stone
            '--tm-success-color': '#059669',      // Emerald green
            '--tm-success-hover': '#047857',      // Dark emerald
            '--tm-danger-color': '#e11d48',       // Rose red
            '--tm-danger-hover': '#be123c',       // Dark rose
            '--tm-warning-color': '#d97706',      // Amber
            '--tm-warning-hover': '#b45309',      // Dark amber
            '--tm-info-color': '#0284c7',         // Sky blue
            '--tm-info-hover': '#0369a1',         // Dark sky
            '--tm-dark-color': '#fafaf9',         // Warm white background
            '--tm-dark-hover': '#f5f5f4',         // Warm gray

            // Shop Item Styles for Solarized Light
            '--tm-shop-item-bg': '#ffffff',       // Pure white cards
            '--tm-shop-item-border': '#e7e5e4',   // Warm border
            '--tm-shop-item-hover-bg': '#fafaf9', // Warm hover
            '--tm-shop-item-owned-bg': '#faf5ff', // Light purple tint
            '--tm-text-on-primary': '#ffffff',
            '--tm-text-on-success': '#ffffff',
            '--tm-text-on-light': '#5b21b6',
            '--tm-text-on-dark': '#fffbfb',
            '--tm-modal-bg': '#ffffff',
        },
        pageStyles: THEME_STYLES + `/* Solarized Light Theme Overrides */
            body { background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%) !important; }
            body::before { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235b21b6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(14%) sepia(64%) saturate(5213%) hue-rotate(262deg) brightness(91%) contrast(102%) !important; }
            
            /* Light Theme Specific Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }
            .minimal-store-btn:hover, .rnr-button:hover, #tm-settings-save:hover, #tm-settings-reset:hover, 
            .tm-quick-search-add-btn:hover, .tm-scratchpad-template-add-btn:hover, #tm-price-options-add-btn:hover,
            #tm-mascot-interaction-buttons button:hover, .tm-shop-item-btn:hover:not(:disabled),
            .tm-talent-unlock-btn:hover:not(:disabled), .tm-talent-unlock-btn-dashboard:hover:not(:disabled),
            #tm-dashboard-content button[style*="linear-gradient"]:hover { 
                color: #ffffff !important; 
            }
            #tm-xp-bar-container, #tm-coin-balance, #tm-daily-dashboard-widget { text-shadow: none !important; }
            #footer-outterwrap td, #footer-outterwrap span { text-shadow: none !important; }
            #minimal-username-input { text-shadow: none !important; }
            .tm-level-up-title { color: var(--tm-primary-color) !important; text-shadow: none !important; }
            h1, h2, h3, h4, h5, h6, .pagetitle { text-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }
            .rnr-b-editheader h1 { color: var(--tm-primary-color) !important; text-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }
            .tm-mascot-speech-bubble { text-shadow: none !important; }
            #tm-boss-notification h3, #tm-boss-notification h4, #tm-event-notification h3, #tm-event-notification h4 { text-shadow: 0 2px 4px rgba(0,0,0,0.2) !important; }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { background: rgba(200, 200, 200, 0.15) !important; }`
    },
    'midnight_purple': {
        name: 'Midnight Purple', icon: '🌙', cost: 500, type: 'theme',
        colors: {
            '--tm-primary-color': '#9d4edd',      // Vivid Purple
            '--tm-primary-hover': '#c77dff',      // Light Purple
            '--tm-secondary-color': '#db00ff',    // Dark Purple
            '--tm-secondary-hover': '#7209b7',    // Medium Purple
            '--tm-success-color': '#10b981',      // Emerald
            '--tm-success-hover': '#059669',      // Dark Emerald
            '--tm-danger-color': '#ef4444',       // Red
            '--tm-danger-hover': '#dc2626',       // Dark Red
            '--tm-warning-color': '#f59e0b',      // Amber
            '--tm-warning-hover': '#d97706',      // Dark Amber
            '--tm-info-color': '#e0aaff',         // Light Lavender
            '--tm-info-hover': '#c77dff',         // Medium Lavender
            '--tm-dark-color': '#10002b',         // Very Dark Purple
            '--tm-dark-hover': '#240046',         // Dark Purple

            '--tm-shop-item-bg': '#240046',
            '--tm-shop-item-border': '#5a189a',
            '--tm-shop-item-hover-bg': '#3c096c',
            '--tm-shop-item-owned-bg': '#5a189a',
            '--tm-text-on-primary': '#ffffff',
            '--tm-text-on-success': '#ffffff',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#e0aaff',
            '--tm-modal-bg': '#240046',
        },
        pageStyles: THEME_STYLES + `/* Midnight Purple Theme */
            body::before { background-image: radial-gradient(circle at 50% 50%, rgba(157, 78, 221, 0.1) 0%, transparent 50%) !important; opacity: 0.5 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(60%) sepia(98%) saturate(4461%) hue-rotate(230deg) brightness(97%) contrast(101%) !important; }
            
            /* Midnight Purple Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'sunset': {
        name: 'Sunset', icon: '🌅', cost: 500, type: 'theme',
        colors: {
            '--tm-primary-color': '#ff6b6b',      // Coral Red
            '--tm-primary-hover': '#ff8787',      // Light Coral
            '--tm-secondary-color': '#ff922b',    // Orange
            '--tm-secondary-hover': '#ffa94d',    // Light Orange
            '--tm-success-color': '#51cf66',      // Green
            '--tm-success-hover': '#37b24d',      // Dark Green
            '--tm-danger-color': '#f03e3e',       // Red
            '--tm-danger-hover': '#c92a2a',       // Dark Red
            '--tm-warning-color': '#ffd43b',      // Yellow
            '--tm-warning-hover': '#fab005',      // Gold
            '--tm-info-color': '#ffec99',         // Cream
            '--tm-info-hover': '#ffe066',         // Light Yellow
            '--tm-dark-color': '#2d1b1b',         // Dark Brown
            '--tm-dark-hover': '#1a0f0f',         // Very Dark Brown

            '--tm-shop-item-bg': '#3d2424',
            '--tm-shop-item-border': '#5c3333',
            '--tm-shop-item-hover-bg': '#4a2929',
            '--tm-shop-item-owned-bg': '#5c3d3d',
            '--tm-text-on-primary': '#ffffff',
            '--tm-text-on-success': '#ffffff',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#ffec99',
            '--tm-modal-bg': '#3d2424',
        },
        pageStyles: THEME_STYLES + `/* Sunset Theme */
            body::before { background: linear-gradient(180deg, rgba(255,107,107,0.1) 0%, rgba(255,146,43,0.1) 50%, rgba(240,62,62,0.1) 100%) !important; opacity: 0.4 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(61%) sepia(67%) saturate(581%) hue-rotate(312deg) brightness(102%) contrast(101%) !important; }
            
            /* Sunset Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'neon_pink': {
        name: 'Neon Pink', icon: '💗', cost: 750, type: 'theme',
        colors: {
            '--tm-primary-color': '#ff10f0',      // Hot Pink
            '--tm-primary-hover': '#ff6bec',      // Light Pink
            '--tm-secondary-color': '#b026ff',    // Purple
            '--tm-secondary-hover': '#d63aff',    // Light Purple
            '--tm-success-color': '#00ff9f',      // Mint
            '--tm-success-hover': '#00d984',      // Dark Mint
            '--tm-danger-color': '#ff2975',       // Pink Red
            '--tm-danger-hover': '#ff0066',       // Hot Pink Red
            '--tm-warning-color': '#ffb627',      // Orange
            '--tm-warning-hover': '#ff9500',      // Dark Orange
            '--tm-info-color': '#00ffff',         // Cyan
            '--tm-info-hover': '#00d4d4',         // Dark Cyan
            '--tm-dark-color': '#1a0033',         // Very Dark Purple
            '--tm-dark-hover': '#0d001a',         // Black Purple

            '--tm-shop-item-bg': '#2d0052',
            '--tm-shop-item-border': '#5c0099',
            '--tm-shop-item-hover-bg': '#40006b',
            '--tm-shop-item-owned-bg': '#5c0099',
            '--tm-text-on-primary': '#000000',
            '--tm-text-on-success': '#000000',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#ff10f0',
            '--tm-modal-bg': '#2d0052',
        },
        pageStyles: THEME_STYLES + `/* Neon Pink Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(255,16,240,0.03) 0px, transparent 2px, transparent 4px, rgba(255,16,240,0.03) 6px) !important; opacity: 1 !important; }
            body::after { background: repeating-linear-gradient(90deg, rgba(255,16,240,0.03) 0px, transparent 2px, transparent 4px, rgba(255,16,240,0.03) 6px) !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(56%) sepia(92%) saturate(5679%) hue-rotate(293deg) brightness(104%) contrast(101%) !important; }
            
            /* Neon Pink Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'forest': {
        name: 'Forest', icon: '🌲', cost: 500, type: 'theme',
        colors: {
            '--tm-primary-color': '#51cf66',      // Leaf Green
            '--tm-primary-hover': '#69db7c',      // Light Green
            '--tm-secondary-color': '#2b8a3e',    // Dark Green
            '--tm-secondary-hover': '#37b24d',    // Medium Green
            '--tm-success-color': '#74c0fc',      // Sky Blue
            '--tm-success-hover': '#4dabf7',      // Dark Blue
            '--tm-danger-color': '#ff6b6b',       // Berry Red
            '--tm-danger-hover': '#fa5252',       // Dark Red
            '--tm-warning-color': '#ffd43b',      // Sunlight Yellow
            '--tm-warning-hover': '#fab005',      // Amber
            '--tm-info-color': '#8ce99a',         // Mint
            '--tm-info-hover': '#69db7c',         // Light Green
            '--tm-dark-color': '#1a2e1a',         // Dark Forest
            '--tm-dark-hover': '#0f1a0f',         // Very Dark Forest

            '--tm-shop-item-bg': '#243324',
            '--tm-shop-item-border': '#2b8a3e',
            '--tm-shop-item-hover-bg': '#2f4a2f',
            '--tm-shop-item-owned-bg': '#2b5a2b',
            '--tm-text-on-primary': '#000000',
            '--tm-text-on-success': '#000000',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#8ce99a',
            '--tm-modal-bg': '#243324',
        },
        pageStyles: THEME_STYLES + `/* Forest Theme */
            body::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z' fill='rgba(81,207,102,0.05)' /%3E%3C/svg%3E") !important; opacity: 0.3 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(79%) sepia(11%) saturate(1459%) hue-rotate(77deg) brightness(94%) contrast(90%) !important; }
            
            /* Forest Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }`
    },
    'retro_amber': {
        name: 'Retro Terminal', icon: '📺', cost: 750, type: 'theme',
        colors: {
            '--tm-primary-color': '#ffb000',      // Amber
            '--tm-primary-hover': '#ffc233',      // Light Amber
            '--tm-secondary-color': '#ffb300',    // Dark Amber
            '--tm-secondary-hover': '#cc8800',    // Medium Amber
            '--tm-success-color': '#ffcc00',      // Gold
            '--tm-success-hover': '#e6b800',      // Dark Gold
            '--tm-danger-color': '#ff6600',       // Orange Red
            '--tm-danger-hover': '#e65c00',       // Dark Orange
            '--tm-warning-color': '#ffd700',      // Yellow
            '--tm-warning-hover': '#e6c200',      // Dark Yellow
            '--tm-info-color': '#ffe066',         // Light Yellow
            '--tm-info-hover': '#ffd633',         // Medium Yellow
            '--tm-dark-color': '#1a1000',         // Very Dark Brown
            '--tm-dark-hover': '#0d0800',         // Black Brown

            '--tm-shop-item-bg': '#2d1f00',
            '--tm-shop-item-border': '#4a3300',
            '--tm-shop-item-hover-bg': '#3d2900',
            '--tm-shop-item-owned-bg': '#4a3a00',
            '--tm-text-on-primary': '#000000',
            '--tm-text-on-success': '#000000',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#ffb000',
            '--tm-modal-bg': '#2d1f00',
        },
        pageStyles: THEME_STYLES + `/* Retro Terminal Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(255,176,0,0.03) 0px, transparent 1px, transparent 2px, rgba(255,176,0,0.03) 3px) !important; opacity: 1 !important; }
            @keyframes crt-flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.95; } }
            body { animation: crt-flicker 0.15s infinite; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(68%) sepia(54%) saturate(777%) hue-rotate(359deg) brightness(103%) contrast(101%) !important; }`
    },
    'ice': {
        name: 'Ice', icon: '❄️', cost: 500, type: 'theme',
        colors: {
            '--tm-primary-color': '#74c0fc',      // Ice Blue
            '--tm-primary-hover': '#a5d8ff',      // Light Ice Blue
            '--tm-secondary-color': '#339af0',    // Ocean Blue
            '--tm-secondary-hover': '#4dabf7',    // Medium Blue
            '--tm-success-color': '#51cf66',      // Mint Green
            '--tm-success-hover': '#37b24d',      // Dark Mint
            '--tm-danger-color': '#ff6b6b',       // Warm Red
            '--tm-danger-hover': '#fa5252',       // Dark Red
            '--tm-warning-color': '#ffd43b',      // Warm Yellow
            '--tm-warning-hover': '#fab005',      // Dark Yellow
            '--tm-info-color': '#e7f5ff',         // Very Light Blue
            '--tm-info-hover': '#d0ebff',         // Light Blue
            '--tm-dark-color': '#0c1f2e',         // Dark Blue
            '--tm-dark-hover': '#05121d',         // Very Dark Blue

            '--tm-shop-item-bg': '#1a2f42',
            '--tm-shop-item-border': '#2d4a5c',
            '--tm-shop-item-hover-bg': '#24394d',
            '--tm-shop-item-owned-bg': '#2d5270',
            '--tm-text-on-primary': '#0c1f2e',
            '--tm-text-on-success': '#0c1f2e',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#e7f5ff',
            '--tm-modal-bg': '#1a2f42',
        },
        pageStyles: THEME_STYLES + `/* Ice Theme */
            body::before { background-image: radial-gradient(circle at 20% 50%, rgba(116,192,252,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(165,216,255,0.05) 0%, transparent 50%) !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(81%) sepia(10%) saturate(1479%) hue-rotate(179deg) brightness(99%) contrast(98%) !important; }
            
            /* Ice Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'crimson': {
        name: 'Crimson', icon: '🔴', cost: 750, type: 'theme',
        colors: {
            '--tm-primary-color': '#ff6b6b',      // Crimson
            '--tm-primary-hover': '#ff8787',      // Light Crimson
            '--tm-secondary-color': '#c92a2a',    // Dark Red
            '--tm-secondary-hover': '#e03131',    // Medium Red
            '--tm-success-color': '#51cf66',      // Green (contrast)
            '--tm-success-hover': '#37b24d',      // Dark Green
            '--tm-danger-color': '#ff0000',       // Bright Red
            '--tm-danger-hover': '#cc0000',       // Dark Red
            '--tm-warning-color': '#ffd43b',      // Yellow
            '--tm-warning-hover': '#fab005',      // Gold
            '--tm-info-color': '#ffc9c9',         // Light Pink
            '--tm-info-hover': '#ffa8a8',         // Pink
            '--tm-dark-color': '#2b0a0a',         // Very Dark Red
            '--tm-dark-hover': '#1a0505',         // Black Red

            '--tm-shop-item-bg': '#3d1414',
            '--tm-shop-item-border': '#5c1f1f',
            '--tm-shop-item-hover-bg': '#4a1a1a',
            '--tm-shop-item-owned-bg': '#5c2929',
            '--tm-text-on-primary': '#ffffff',
            '--tm-text-on-success': '#ffffff',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#ffc9c9',
            '--tm-modal-bg': '#3d1414',
        },
        pageStyles: THEME_STYLES + `/* Crimson Theme */
            body::before { background-image: radial-gradient(circle at 50% 50%, rgba(255,107,107,0.1) 0%, transparent 70%) !important; opacity: 0.5 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(61%) sepia(67%) saturate(581%) hue-rotate(312deg) brightness(102%) contrast(101%) !important; }
            
            /* Crimson Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'dracula': {
        name: 'Dracula', icon: '🧛', cost: 1000, type: 'theme',
        colors: {
            '--tm-primary-color': '#bd93f9',      // Purple
            '--tm-primary-hover': '#caa6fe',      // Light Purple
            '--tm-secondary-color': '#6272a4',    // Blue Grey
            '--tm-secondary-hover': '#7585b5',    // Light Blue Grey
            '--tm-success-color': '#50fa7b',      // Green
            '--tm-success-hover': '#5af78e',      // Light Green
            '--tm-danger-color': '#ff5555',       // Red
            '--tm-danger-hover': '#ff6e6e',       // Light Red
            '--tm-warning-color': '#f1fa8c',      // Yellow
            '--tm-warning-hover': '#f4fc9d',      // Light Yellow
            '--tm-info-color': '#8be9fd',         // Cyan
            '--tm-info-hover': '#9feffe',         // Light Cyan
            '--tm-dark-color': '#282a36',         // Dark Background
            '--tm-dark-hover': '#1e1f29',         // Darker Background

            '--tm-shop-item-bg': '#383a4a',
            '--tm-shop-item-border': '#6272a4',
            '--tm-shop-item-hover-bg': '#44475a',
            '--tm-shop-item-owned-bg': '#4a4d66',
            '--tm-text-on-primary': '#282a36',
            '--tm-text-on-success': '#282a36',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#8be9fd',
            '--tm-modal-bg': '#383a4a',
        },
        pageStyles: THEME_STYLES + `/* Dracula Theme */
            body::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='10' y='20' fill='rgba(189,147,249,0.05)' font-size='16' font-family='monospace'%3E🦇🩸🧛%3C/text%3E%3C/svg%3E") !important; opacity: 0.3 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(79%) sepia(23%) saturate(1280%) hue-rotate(203deg) brightness(99%) contrast(97%) !important; }
            
            /* Dracula Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }`
    },
    'nord': {
        name: 'Nord', icon: '🏔️', cost: 750, type: 'theme',
        colors: {
            '--tm-primary-color': '#88c0d0',      // Frost Blue
            '--tm-primary-hover': '#8fbcbb',      // Frost Green
            '--tm-secondary-color': '#5e81ac',    // sunset Blue
            '--tm-secondary-hover': '#81a1c1',    // Light Blue
            '--tm-success-color': '#a3be8c',      // sunset Green
            '--tm-success-hover': '#b8d0a0',      // Light Green
            '--tm-danger-color': '#bf616a',       // sunset Red
            '--tm-danger-hover': '#d08770',       // sunset Orange
            '--tm-warning-color': '#ebcb8b',      // sunset Yellow
            '--tm-warning-hover': '#f0d9a0',      // Light Yellow
            '--tm-info-color': '#b48ead',         // sunset Purple
            '--tm-info-hover': '#c4a0bf',         // Light Purple
            '--tm-dark-color': '#2e3440',         // Polar Night Dark
            '--tm-dark-hover': '#3b4252',         // Polar Night Medium

            '--tm-shop-item-bg': '#3b4252',
            '--tm-shop-item-border': '#4c566a',
            '--tm-shop-item-hover-bg': '#434c5e',
            '--tm-shop-item-owned-bg': '#4c566a',
            '--tm-text-on-primary': '#2e3440',
            '--tm-text-on-success': '#2e3440',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#eceff4',
            '--tm-modal-bg': '#3b4252',
        },
        pageStyles: THEME_STYLES + `/* Nord Theme */
            body::before { background: linear-gradient(135deg, rgba(94,129,172,0.05) 0%, rgba(136,192,208,0.05) 100%) !important; opacity: 0.5 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(74%) sepia(14%) saturate(657%) hue-rotate(152deg) brightness(92%) contrast(87%) !important; }
            
            /* Nord Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'tokyo_night': {
        name: 'Tokyo Night', icon: '🗼', cost: 1000, type: 'theme',
        colors: {
            '--tm-primary-color': '#7aa2f7',      // Blue
            '--tm-primary-hover': '#89b4fa',      // Light Blue
            '--tm-secondary-color': '#565f89',    // Dark Blue Grey
            '--tm-secondary-hover': '#6272a4',    // Blue Grey
            '--tm-success-color': '#9ece6a',      // Green
            '--tm-success-hover': '#b4db7c',      // Light Green
            '--tm-danger-color': '#f7768e',       // Pink Red
            '--tm-danger-hover': '#ff9caa',       // Light Pink
            '--tm-warning-color': '#e0af68',      // Orange
            '--tm-warning-hover': '#e9c07a',      // Light Orange
            '--tm-info-color': '#7dcfff',         // Cyan
            '--tm-info-hover': '#99dbff',         // Light Cyan
            '--tm-dark-color': '#1a1b26',         // Dark Background
            '--tm-dark-hover': '#16161e',         // Darker Background

            '--tm-shop-item-bg': '#24283b',
            '--tm-shop-item-border': '#414868',
            '--tm-shop-item-hover-bg': '#2f3549',
            '--tm-shop-item-owned-bg': '#343b58',
            '--tm-text-on-primary': '#1a1b26',
            '--tm-text-on-success': '#1a1b26',
            '--tm-text-on-light': '#1a1a1a',
            '--tm-text-on-dark': '#c0caf5',
            '--tm-modal-bg': '#24283b',
        },
        pageStyles: THEME_STYLES + `/* Tokyo Night Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(122,162,247,0.02) 0px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, rgba(122,162,247,0.02) 0px, transparent 1px, transparent 2px) !important; opacity: 1 !important; background-size: 30px 30px !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(67%) sepia(27%) saturate(930%) hue-rotate(186deg) brightness(98%) contrast(95%) !important; }
            
            /* Tokyo Night Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'liquid_glass': {
        name: 'Liquid Glass', icon: '🫧', cost: 1500, type: 'theme',
        colors: {
            '--tm-primary-color': '#007AFF',
            '--tm-primary-hover': '#0065D8',
            '--tm-secondary-color': '#8E8E93',
            '--tm-secondary-hover': '#636366',
            '--tm-success-color': '#34C759',
            '--tm-success-hover': '#248A3D',
            '--tm-danger-color': '#FF3B30',
            '--tm-danger-hover': '#D70015',
            '--tm-warning-color': '#FF9500',
            '--tm-warning-hover': '#C77700',
            '--tm-info-color': '#32ADE6',
            '--tm-info-hover': '#007AFF',
            '--tm-dark-color': '#EEF0F8',
            '--tm-dark-hover': '#E5E5EA',
            '--tm-shop-item-bg': 'rgba(255, 255, 255, 0.46)',
            '--tm-shop-item-border': 'rgba(60, 60, 67, 0.18)',
            '--tm-shop-item-hover-bg': 'rgba(255, 255, 255, 0.62)',
            '--tm-shop-item-owned-bg': 'rgba(0, 122, 255, 0.10)',
            '--tm-text-on-primary': '#FFFFFF',
            '--tm-text-on-success': '#FFFFFF',
            '--tm-text-on-light': '#1D1D1F',
            '--tm-text-on-dark': '#636366',
            '--tm-modal-bg': 'rgba(255, 255, 255, 0.68)',
        },
        pageStyles: LIQUID_GLASS_STYLES,
    },
};

function tmReadEquippedThemeId() {
    const themeKey = 'tm_equipped_theme';
    if (typeof GM_getValue === 'function') {
        try {
            const profileId = GM_getValue('tm_mms_last_profile_id', '');
            if (profileId) {
                const scoped = GM_getValue(`tm:p:${profileId}:${themeKey}`, undefined);
                if (scoped !== undefined && scoped !== null && scoped !== '') {
                    return String(scoped);
                }
            }
            const legacy = GM_getValue(themeKey, undefined);
            if (legacy !== undefined && legacy !== null && legacy !== '') {
                return String(legacy);
            }
        } catch (_) { /* ignore */ }
    }
    if (window.__tmEarlyThemeId) return String(window.__tmEarlyThemeId);
    return 'default';
}

function tmHexToRgb(hex) {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || ''));
    if (!match) return null;
    return {
        r: parseInt(match[1], 16),
        g: parseInt(match[2], 16),
        b: parseInt(match[3], 16),
    };
}

function tmParseRgbColor(color) {
    const s = String(color || '').trim();
    const rgba = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgba) {
        return { r: +rgba[1], g: +rgba[2], b: +rgba[3] };
    }
    return tmHexToRgb(s);
}

function tmIsLightShopItemBg(bg) {
    const rgb = tmParseRgbColor(bg);
    if (!rgb) return true;
    const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return lum > 0.52;
}

function tmResolveShopItemText(themeColors) {
    if (themeColors['--tm-shop-item-text']) {
        return themeColors['--tm-shop-item-text'];
    }
    const shopBg = themeColors['--tm-shop-item-bg'];
    if (tmIsLightShopItemBg(shopBg)) {
        return themeColors['--tm-text-on-light'] || '#343a40';
    }
    return themeColors['--tm-text-on-dark'] || themeColors['--tm-primary-color'] || '#e8e8e8';
}

function tmApplyThemeColors(themeId, options = {}) {
    const theme = UI_THEMES[themeId] || UI_THEMES.default;
    const root = document.documentElement;

    for (const [variable, color] of Object.entries(theme.colors)) {
        root.style.setProperty(variable, color);
        if (variable === '--tm-primary-color') {
            const rgb = tmHexToRgb(color);
            if (rgb) {
                root.style.setProperty('--tm-primary-color-rgb', `${rgb.r},${rgb.g},${rgb.b}`);
            }
        }
    }

    const bg = theme.colors['--tm-dark-color'] || theme.colors['--tm-shop-item-bg'];
    if (bg) {
        root.style.backgroundColor = bg;
    }
    root.style.setProperty('--tm-shop-item-text', tmResolveShopItemText(theme.colors));

    if (options.pageStyles !== false) {
        document.getElementById('tm-page-theme-styles')?.remove();
        if (theme.pageStyles) {
            const styleEl = document.createElement('style');
            styleEl.id = 'tm-page-theme-styles';
            styleEl.innerHTML = theme.pageStyles;
            document.head.appendChild(styleEl);
        }
    }

    return theme;
}

window.UI_THEMES = UI_THEMES;
window.tmApplyThemeColors = tmApplyThemeColors;
window.tmReadEquippedThemeId = tmReadEquippedThemeId;

(function tmBootstrapThemeOnLoad() {
    const pathname = window.location.pathname || '';
    if (pathname.includes('login.php')) return;
    if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;
    if (typeof GM_getValue === 'function') {
        try {
            if (GM_getValue('tm_script_enabled', true) === false) return;
        } catch (_) { /* ignore */ }
    }

    const themeId = tmReadEquippedThemeId();
    tmApplyThemeColors(themeId);
    window.__tmEarlyThemeApplied = true;
})();


