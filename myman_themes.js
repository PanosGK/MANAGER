const THEME_STYLES = `/* Universal Theme Styles */
            @keyframes matrix-subtle-flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.9; } }
            @keyframes matrix-scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
            @keyframes matrix-rain-scroll { 0% { background-position: 0 0; } 100% { background-position: -200px 400px; } }
            
            body {
                background: radial-gradient(ellipse at center, var(--tm-dark-color) 0%, var(--tm-dark-hover) 70%) !important;
            }
            .rnr-page, .rnr-middle, .rnr-left, .rnr-center, .rnr-right, .rnr-s-fields, .rnr-s-form, .rnr-s-1, .rnr-s-2, .rnr-s-3, .rnr-s-empty, .rnr-s-hmenu, .rnr-s-undermenu, .rnr-c-fields, .rnr-c-form, .rnr-c-1, .rnr-c-2, .rnr-c-3, .pag_n, .rnr-c-edit, .rnr-cw-edit, .rnr-cw-recordcontrols, .rnr-c-recordcontrols, .rnr-scrollgrid-inner, .fieldGrid, .rnr-pagewrapper, .rnr-c-1, .rnr-cw-1, .rnr-brickcontents, .rnr-b-wrapper, .rnr-wrapper, .rnr-cbw-fields, .rnr-b-editfields2_atop, .rnr-b-editheader, .rnr-b-editbuttons {
                background: transparent !important; color: var(--tm-primary-color) !important; font-family: 'Consolas', 'Menlo', 'Monaco', monospace !important;
            }
            body::before {
                content: " "; display: block; position: fixed; top: 0; left: 0; z-index: -1;
                width: 100%; height: 100%;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ctext x='0' y='15' fill='var(--tm-shop-item-border)' font-size='10' font-family='monospace'%3E%CE%91%CE%92%CE%93%CE%94%CE%95%CE%96%CE%97%CE%98%CE%99%CE%9A%CE%9B%CE%9C%CE%9D%CE%9E%CE%9F%CE%A0%CE%A1%CE%A3%CE%A4%CE%A5%CE%A6%CE%A7%CE%A8%CE%A901%3C/text%3E%3C/svg%3E");
                opacity: 0.3;
            }
            body::after {
                content: " "; display: block; position: fixed; top: 0; left: 0; z-index: -1; width: 100%; height: 100%;
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.08) 50%); background-size: 100% 4px;
                opacity: 0.25;
            }
            .rnr-top, #head-outter, #footer-outter, .rnr-cw-hmenu, .rnr-cw-pagination, .rnr-cw-pagination_bottom, .rnr-s-menu, .rnr-s-grid, .rnr-c-hmenu, .rnr-c-pagination, .rnr-c-pagination_bottom { 
                background-color: var(--tm-shop-item-bg) !important; border: 1px solid var(--tm-shop-item-border) !important; color: var(--tm-primary-color) !important; border-radius: 4px; box-shadow: none;
            }
            h1, h2, h3, h4, h5, h6, .pagetitle { text-shadow: none; }
            a, a:visited, .rnr-orderlink { color: var(--tm-primary-hover) !important; text-decoration: none !important; transition: all 0.2s; }
            a:hover, .rnr-orderlink:hover { text-decoration: none !important; color: var(--tm-info-color) !important; }
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
            .rnr-gridtable tr.rnr-row:hover, .rnr-row.style1:hover, .MyMANAGERWhite_label1.rnr-s-grid > table.hoverable > * > .rnr-row:hover > td { background: var(--tm-secondary-hover) !important; color: var(--tm-info-color) !important; }
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
            .jconfirm { background: rgba(0, 0, 0, 0.82) !important; }
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
            #tm-memory-game-overlay, #tm-game-overlay { background: var(--tm-dark-color) !important; }
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

const THEME_EXTENDED_STYLES = `/* --- Extended theme tokens (derived per theme in tmApplyThemeColors) --- */
            h1, h2, h3, h4, h5, h6 { color: var(--tm-heading-color, var(--tm-info-color, var(--tm-primary-color))) !important; }
            .pagetitle, .pagetitle span { color: var(--tm-heading-color, var(--tm-info-color, var(--tm-primary-color))) !important; }
            .fieldGrid .rnr-label label, .fieldGrid .rnr-label b { color: var(--tm-label-color, var(--tm-secondary-hover, var(--tm-secondary-color))) !important; }

            /* Footer suite widgets */
            #tm-notification-bell-btn,
            #tm-settings-btn,
            #tm-refresh-timer-container,
            #tm-weather-widget,
            #tm-daily-dashboard-widget,
            #tm-xp-bar-container,
            #tm-coin-balance,
            .tm-footer-widget,
            .tm-buff-timer,
            #tm-recent-repairs-btn {
                background: var(--tm-glass-bg, var(--tm-surface-bg, var(--tm-shop-item-bg))) !important;
                border-color: var(--tm-glass-border, var(--tm-surface-border, var(--tm-shop-item-border))) !important;
                color: var(--tm-widget-text, var(--tm-footer-text, var(--tm-primary-color))) !important;
                box-shadow: 0 2px 8px var(--tm-shadow-color, rgba(0,0,0,0.15)) !important;
            }
            #tm-notification-bell-btn:hover,
            #tm-settings-btn:hover,
            #tm-refresh-timer-container:hover,
            #tm-weather-widget:hover,
            #tm-daily-dashboard-widget:hover,
            #tm-xp-bar-container:hover,
            #tm-coin-balance:hover,
            .tm-footer-widget:hover,
            .tm-buff-timer:hover,
            #tm-recent-repairs-btn:hover {
                background: var(--tm-glass-hover-bg, var(--tm-surface-hover-bg, var(--tm-shop-item-hover-bg))) !important;
                border-color: var(--tm-glass-border, var(--tm-surface-border, var(--tm-shop-item-border))) !important;
            }
            #tm-notification-bell-btn,
            #tm-settings-btn,
            .tm-refresh-time-text,
            #tm-weather-temp,
            #tm-user-title-text,
            .tm-buff-timer-icon,
            #tm-xp-bar-container *,
            #tm-daily-dashboard-widget * {
                color: var(--tm-widget-text, var(--tm-footer-text, var(--tm-primary-color))) !important;
            }
            #tm-coin-balance, #tm-coin-balance * { color: var(--tm-coin-color, var(--tm-warning-color)) !important; text-shadow: none !important; }

            /* XP / level badges */
            .tm-xp-bar { background: var(--tm-xp-track-bg, rgba(0,0,0,0.4)) !important; border-color: var(--tm-xp-track-border, var(--tm-surface-border)) !important; }
            #tm-xp-bar-fill {
                background: linear-gradient(90deg, var(--tm-xp-fill-start, var(--tm-warning-color)), var(--tm-xp-fill-end, var(--tm-warning-hover, var(--tm-warning-color)))) !important;
                box-shadow: 0 0 10px var(--tm-glow-color, var(--tm-warning-color)) !important;
            }
            #tm-level-text {
                background: var(--tm-level-badge-bg, var(--tm-warning-color)) !important;
                border-color: var(--tm-level-badge-border, var(--tm-warning-color)) !important;
                color: var(--tm-widget-text, var(--tm-text-on-primary, #fff)) !important;
            }
            #tm-energized-buff-indicator {
                background: var(--tm-buff-badge-bg, var(--tm-info-color)) !important;
                border-color: var(--tm-buff-badge-border, var(--tm-info-color)) !important;
                color: var(--tm-widget-text, var(--tm-text-on-primary, #fff)) !important;
            }
            .tm-xp-gain-indicator { color: var(--tm-warning-color) !important; }
            .tm-level-pop { animation: tm-level-text-pop 0.5s ease-out; }

            /* Overlays & popups */
            .jconfirm, #tm-notification-backdrop { background: var(--tm-overlay-dim, rgba(0,0,0,0.82)) !important; }
            #tm-recent-repairs-menu,
            .tm-recent-repairs-header,
            .tm-recent-repair-item {
                background: var(--tm-panel-bg, var(--tm-shop-item-bg)) !important;
                color: var(--tm-primary-color) !important;
                border-color: var(--tm-surface-border, var(--tm-shop-item-border)) !important;
            }
            .tm-recent-repair-item:hover { background: var(--tm-surface-hover-bg, var(--tm-shop-item-hover-bg)) !important; }
            .tm-recent-repair-meta { color: var(--tm-muted-text, var(--tm-secondary-color)) !important; }

            /* Quests & specialty footer buttons */
            #tm-quests-btn { background-color: var(--tm-secondary-hover, var(--tm-secondary-color)) !important; color: var(--tm-text-on-primary, #fff) !important; }
            #tm-quests-btn:hover { background-color: var(--tm-secondary-color) !important; }
            #tm-scratchpad-toggle-btn { background-color: var(--tm-secondary-color) !important; color: var(--tm-text-on-primary, #fff) !important; }
            #tm-scratchpad-toggle-btn:hover { background-color: var(--tm-secondary-hover) !important; }

            /* Repair edit sections */
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c {
                background: var(--tm-section-bg, var(--tm-surface-alt-bg, var(--tm-shop-item-owned-bg))) !important;
                border-color: var(--tm-surface-border, var(--tm-shop-item-border)) !important;
            }

            /* Chips / metadata */
            .tm-os-price-pill, .tm-phone-price-pill {
                color: var(--tm-price-color, var(--tm-success-color)) !important;
                border-color: var(--tm-price-border, var(--tm-success-color)) !important;
                background: var(--tm-price-bg, rgba(var(--tm-success-color-rgb, 40,167,69), 0.12)) !important;
            }
            .tm-os-barcode, .tm-phone-barcode {
                color: var(--tm-subtle-text, var(--tm-shop-item-text, var(--tm-primary-color))) !important;
                background: var(--tm-chip-bg, var(--tm-surface-hover-bg)) !important;
                border-color: var(--tm-chip-border, var(--tm-surface-border)) !important;
            }

            /* Alert / cancel actions */
            .tm-alert-cancel-btn {
                border-color: rgba(var(--tm-danger-color-rgb, 220,53,69), 0.45) !important;
                background: rgba(var(--tm-danger-color-rgb, 220,53,69), 0.12) !important;
                color: var(--tm-danger-color) !important;
            }
            .tm-alert-cancel-btn:hover { background: rgba(var(--tm-danger-color-rgb, 220,53,69), 0.22) !important; }

            /* Pagination & tabs */
            .rnr-cw-pagination, .rnr-cw-pagination_bottom, .rnr-c-pagination, .rnr-c-pagination_bottom {
                color: var(--tm-primary-color) !important;
            }
            .rnr-tab { background-color: var(--tm-tab-bg, var(--tm-nav-bg, var(--tm-dark-color))) !important; }
            .rnr-tab.selected { background-color: var(--tm-tab-active-bg, var(--tm-header-bg, var(--tm-dark-hover))) !important; border-color: var(--tm-tab-active-border, var(--tm-primary-color)) !important; }

            /* Scrollbar hints (webkit) */
            ::-webkit-scrollbar-thumb { background: var(--tm-scrollbar-thumb, var(--tm-secondary-hover, var(--tm-secondary-color))) !important; }
            ::-webkit-scrollbar-track { background: var(--tm-scrollbar-track, var(--tm-dark-hover, var(--tm-dark-color))) !important; }
        `;

/** Documented specialist UI palette sources (design systems & community themes). */
const UI_PALETTE_SOURCES = {
    default: 'IBM Carbon Design System — carbondesignsystem.com',
    solarized_dark: 'Solarized — Ethan Schoonover — ethanschoonover.com/solarized',
    solarized_light: 'Solarized — Ethan Schoonover',
    dracula: 'Dracula Theme — draculatheme.com/spec',
    nord: 'Nord Theme — nordtheme.com',
    tokyo_night: 'Tokyo Night — enkia/tokyo-night-vscode-theme',
    midnight_purple: 'Linear app UI — linear.app',
    neon_pink: 'Radix Colors Pink Dark — radix-ui.com/colors',
    oceanic: 'Tailwind CSS Teal — tailwindcss.com/docs/customizing-colors',
    ice: 'Nord Frost + IBM Carbon Gray',
    cyberpunk: 'Cyberpunk 2077 UI palette (FCEE0A / 00F0FF / FF2A6D)',
    forest: 'Material Design 3 Green — m3.material.io',
    sunset: 'Radix Colors Orange Dark — radix-ui.com/colors',
    crimson: 'Radix Colors Red Dark — radix-ui.com/colors',
    retro_amber: 'Gruvbox — morhetz/gruvbox',
    matrix: 'Classic VT220 phosphor terminal green',
    liquid_glass: 'Apple HIG system colors — developer.apple.com/design/human-interface-guidelines',
};

function tmMapPaletteToThemeColors(p) {
    const pick = (key, fallback) => (p[key] != null && p[key] !== '' ? p[key] : fallback);
    return {
        '--tm-primary-color': p.primary,
        '--tm-primary-hover': pick('primaryHover', p.primary),
        '--tm-secondary-color': p.secondary,
        '--tm-secondary-hover': pick('secondaryHover', p.secondary),
        '--tm-success-color': p.success,
        '--tm-success-hover': pick('successHover', p.success),
        '--tm-danger-color': p.danger,
        '--tm-danger-hover': pick('dangerHover', p.danger),
        '--tm-warning-color': p.warning,
        '--tm-warning-hover': pick('warningHover', p.warning),
        '--tm-info-color': p.info,
        '--tm-info-hover': pick('infoHover', p.info),
        '--tm-dark-color': p.dark,
        '--tm-dark-hover': pick('darkHover', p.dark),
        '--tm-shop-item-bg': p.surface,
        '--tm-shop-item-border': p.border,
        '--tm-shop-item-hover-bg': pick('surfaceHover', p.surface),
        '--tm-shop-item-owned-bg': pick('surfaceOwned', p.surface),
        '--tm-text-on-primary': pick('textOnPrimary', '#ffffff'),
        '--tm-text-on-success': pick('textOnSuccess', '#ffffff'),
        '--tm-text-on-light': pick('textOnLight', '#1a1a1a'),
        '--tm-text-on-dark': pick('textOnDark', p.info),
        '--tm-modal-bg': pick('modalBg', p.surface),
    };
}

const UI_SPECIALIST_PALETTES = {
    default: tmMapPaletteToThemeColors({
        primary: '#0f62fe', primaryHover: '#0353e9',
        secondary: '#6f6f6f', secondaryHover: '#525252',
        success: '#24a148', successHover: '#198038',
        danger: '#da1e28', dangerHover: '#a2191f',
        warning: '#f1c21b', warningHover: '#d2a106',
        info: '#1192e8', infoHover: '#0072c3',
        dark: '#393939', darkHover: '#262626',
        surface: '#f4f4f4', border: '#e0e0e0', surfaceHover: '#e8e8e8', surfaceOwned: '#d0e2ff',
        textOnPrimary: '#ffffff', textOnLight: '#161616', textOnDark: '#f4f4f4',
        modalBg: '#ffffff',
    }),
    solarized_dark: tmMapPaletteToThemeColors({
        primary: '#268bd2', primaryHover: '#2aa198',
        secondary: '#586e75', secondaryHover: '#657b83',
        success: '#859900', successHover: '#6c7c00',
        danger: '#dc322f', dangerHover: '#cb4b16',
        warning: '#b58900', warningHover: '#93a1a1',
        info: '#2aa198', infoHover: '#268bd2',
        dark: '#073642', darkHover: '#002b36',
        surface: '#073642', border: '#586e75', surfaceHover: '#002b36', surfaceOwned: '#002b36',
        textOnPrimary: '#fdf6e3', textOnLight: '#839496', textOnDark: '#93a1a1',
        modalBg: '#073642',
    }),
    solarized_light: tmMapPaletteToThemeColors({
        primary: '#268bd2', primaryHover: '#1a6094',
        secondary: '#93a1a1', secondaryHover: '#657b83',
        success: '#859900', successHover: '#6c7c00',
        danger: '#dc322f', dangerHover: '#cb4b16',
        warning: '#b58900', warningHover: '#93a1a1',
        info: '#2aa198', infoHover: '#268bd2',
        dark: '#fdf6e3', darkHover: '#eee8d5',
        surface: '#fdf6e3', border: '#93a1a1', surfaceHover: '#eee8d5', surfaceOwned: '#e8f4fc',
        textOnPrimary: '#fdf6e3', textOnLight: '#657b83', textOnDark: '#586e75',
        modalBg: '#fdf6e3',
    }),
    dracula: tmMapPaletteToThemeColors({
        primary: '#bd93f9', primaryHover: '#ff79c6',
        secondary: '#6272a4', secondaryHover: '#44475a',
        success: '#50fa7b', successHover: '#5af78e',
        danger: '#ff5555', dangerHover: '#ff6e6e',
        warning: '#f1fa8c', warningHover: '#ffb86c',
        info: '#8be9fd', infoHover: '#9feffe',
        dark: '#282a36', darkHover: '#1e1f29',
        surface: '#383a59', border: '#6272a4', surfaceHover: '#44475a', surfaceOwned: '#44475a',
        textOnPrimary: '#282a36', textOnSuccess: '#282a36', textOnDark: '#f8f8f2',
        modalBg: '#383a59',
    }),
    nord: tmMapPaletteToThemeColors({
        primary: '#88c0d0', primaryHover: '#8fbcbb',
        secondary: '#5e81ac', secondaryHover: '#81a1c1',
        success: '#a3be8c', successHover: '#b8d0a0',
        danger: '#bf616a', dangerHover: '#d08770',
        warning: '#ebcb8b', warningHover: '#f0d9a0',
        info: '#b48ead', infoHover: '#c4a0bf',
        dark: '#2e3440', darkHover: '#3b4252',
        surface: '#3b4252', border: '#4c566a', surfaceHover: '#434c5e', surfaceOwned: '#4c566a',
        textOnPrimary: '#2e3440', textOnSuccess: '#2e3440', textOnDark: '#eceff4',
        modalBg: '#3b4252',
    }),
    tokyo_night: tmMapPaletteToThemeColors({
        primary: '#7aa2f7', primaryHover: '#89b4fa',
        secondary: '#565f89', secondaryHover: '#414868',
        success: '#9ece6a', successHover: '#73daca',
        danger: '#f7768e', dangerHover: '#ff9eaa',
        warning: '#e0af68', warningHover: '#e9c07a',
        info: '#7dcfff', infoHover: '#99dbff',
        dark: '#1a1b26', darkHover: '#16161e',
        surface: '#24283b', border: '#414868', surfaceHover: '#2f3549', surfaceOwned: '#343b58',
        textOnPrimary: '#1a1b26', textOnSuccess: '#1a1b26', textOnDark: '#c0caf5',
        modalBg: '#24283b',
    }),
    midnight_purple: tmMapPaletteToThemeColors({
        primary: '#5e6ad2', primaryHover: '#828fff',
        secondary: '#3e3f4e', secondaryHover: '#4e4f60',
        success: '#4cb782', successHover: '#3da86f',
        danger: '#eb5757', dangerHover: '#f87171',
        warning: '#f2c94c', warningHover: '#f5d76e',
        info: '#95a2ff', infoHover: '#b4befe',
        dark: '#1c1d24', darkHover: '#15161c',
        surface: '#252630', border: '#32333e', surfaceHover: '#2c2d38', surfaceOwned: '#32334a',
        textOnPrimary: '#ffffff', textOnDark: '#b4bcd0',
        modalBg: '#252630',
    }),
    neon_pink: tmMapPaletteToThemeColors({
        primary: '#e93d9d', primaryHover: '#f04fa8',
        secondary: '#c41e7a', secondaryHover: '#d42d8a',
        success: '#3dd68c', successHover: '#2ec47a',
        danger: '#f2555a', dangerHover: '#ff6369',
        warning: '#ff8c42', warningHover: '#ffa05c',
        info: '#56d4f5', infoHover: '#7de0f7',
        dark: '#1f1117', darkHover: '#170d12',
        surface: '#29151f', border: '#6d2a4d', surfaceHover: '#351a28', surfaceOwned: '#3d1f30',
        textOnPrimary: '#1f1117', textOnSuccess: '#1f1117', textOnDark: '#f0a8d0',
        modalBg: '#29151f',
    }),
    oceanic: tmMapPaletteToThemeColors({
        primary: '#2dd4bf', primaryHover: '#5eead4',
        secondary: '#0e7490', secondaryHover: '#0891b2',
        success: '#059669', successHover: '#10b981',
        danger: '#fb7185', dangerHover: '#f43f5e',
        warning: '#fbbf24', warningHover: '#f59e0b',
        info: '#38bdf8', infoHover: '#0ea5e9',
        dark: '#042f2e', darkHover: '#022c22',
        surface: 'rgba(4, 47, 46, 0.88)', border: '#0e7490',
        surfaceHover: 'rgba(8, 145, 178, 0.35)', surfaceOwned: 'rgba(251, 191, 36, 0.12)',
        textOnPrimary: '#042f2e', textOnSuccess: '#042f2e', textOnDark: '#5eead4',
        modalBg: 'rgba(4, 47, 46, 0.96)',
    }),
    ice: tmMapPaletteToThemeColors({
        primary: '#d8dee9', primaryHover: '#eceff4',
        secondary: '#4c566a', secondaryHover: '#81a1c1',
        success: '#a3be8c', successHover: '#8fbcbb',
        danger: '#bf616a', dangerHover: '#d08770',
        warning: '#ebcb8b', warningHover: '#d8d8d8',
        info: '#88c0d0', infoHover: '#8fbcbb',
        dark: '#2e3440', darkHover: '#3b4252',
        surface: '#3b4252', border: '#4c566a', surfaceHover: '#434c5e', surfaceOwned: '#4c566a',
        textOnPrimary: '#2e3440', textOnDark: '#eceff4',
        modalBg: '#3b4252',
    }),
    cyberpunk: tmMapPaletteToThemeColors({
        primary: '#00f0ff', primaryHover: '#05d9e8',
        secondary: '#7700a6', secondaryHover: '#4a0072',
        success: '#fcee0a', successHover: '#fff44f',
        danger: '#ff2a6d', dangerHover: '#ff5c8d',
        warning: '#ff9e00', warningHover: '#ffb833',
        info: '#d300c5', infoHover: '#e833dc',
        dark: '#0d0221', darkHover: '#050114',
        surface: '#1a0533', border: '#7700a6', surfaceHover: '#240640', surfaceOwned: '#2e0855',
        textOnPrimary: '#0d0221', textOnSuccess: '#0d0221', textOnDark: '#00f0ff',
        modalBg: 'rgba(13, 2, 33, 0.98)',
    }),
    forest: tmMapPaletteToThemeColors({
        primary: '#81c784', primaryHover: '#a5d6a7',
        secondary: '#388e3c', secondaryHover: '#2e7d32',
        success: '#66bb6a', successHover: '#4caf50',
        danger: '#e57373', dangerHover: '#ef5350',
        warning: '#ffb74d', warningHover: '#ffa726',
        info: '#4db6ac', infoHover: '#26a69a',
        dark: '#1b2e1b', darkHover: '#0f1a0f',
        surface: '#243324', border: '#388e3c', surfaceHover: '#2f4a2f', surfaceOwned: '#2b5a2b',
        textOnPrimary: '#1b2e1b', textOnSuccess: '#1b2e1b', textOnDark: '#c8e6c9',
        modalBg: '#243324',
    }),
    sunset: tmMapPaletteToThemeColors({
        primary: '#f76b15', primaryHover: '#ff802b',
        secondary: '#e54d2e', secondaryHover: '#d4421f',
        success: '#46a758', successHover: '#3d9a4f',
        danger: '#e5484d', dangerHover: '#dc3d43',
        warning: '#ffb224', warningHover: '#f5a623',
        info: '#ffec99', infoHover: '#ffe066',
        dark: '#2d1b1b', darkHover: '#1a0f0f',
        surface: '#3d2424', border: '#5c3333', surfaceHover: '#4a2929', surfaceOwned: '#5c3d3d',
        textOnPrimary: '#ffffff', textOnDark: '#ffec99',
        modalBg: '#3d2424',
    }),
    crimson: tmMapPaletteToThemeColors({
        primary: '#e5484d', primaryHover: '#ff6369',
        secondary: '#aa2429', secondaryHover: '#8b1e22',
        success: '#46a758', successHover: '#3d9a4f',
        danger: '#e5484d', dangerHover: '#dc3d43',
        warning: '#ffb224', warningHover: '#f5a623',
        info: '#f3aeb5', infoHover: '#ffa8a8',
        dark: '#2b0a0a', darkHover: '#1a0505',
        surface: '#3d1414', border: '#5c1f1f', surfaceHover: '#4a1a1a', surfaceOwned: '#5c2929',
        textOnPrimary: '#ffffff', textOnDark: '#ffc9c9',
        modalBg: '#3d1414',
    }),
    retro_amber: tmMapPaletteToThemeColors({
        primary: '#fabd2f', primaryHover: '#fe8019',
        secondary: '#d79921', secondaryHover: '#b57614',
        success: '#b8bb26', successHover: '#98971a',
        danger: '#fb4934', dangerHover: '#cc241d',
        warning: '#fe8019', warningHover: '#d65d0e',
        info: '#83a598', infoHover: '#689d6a',
        dark: '#282828', darkHover: '#1d2021',
        surface: '#32302f', border: '#504945', surfaceHover: '#3c3836', surfaceOwned: '#45403d',
        textOnPrimary: '#282828', textOnSuccess: '#282828', textOnDark: '#ebdbb2',
        modalBg: '#32302f',
    }),
    matrix: tmMapPaletteToThemeColors({
        primary: '#00ff41', primaryHover: '#33ff66',
        secondary: '#00cc33', secondaryHover: '#009922',
        success: '#00dd00', successHover: '#00aa00',
        danger: '#ff0040', dangerHover: '#cc0033',
        warning: '#c0ff00', warningHover: '#99cc00',
        info: '#00ffcc', infoHover: '#00ccaa',
        dark: '#0d0d0d', darkHover: '#000000',
        surface: '#0a0f0a', border: '#003300', surfaceHover: '#001a00', surfaceOwned: '#001400',
        textOnPrimary: '#000000', textOnSuccess: '#000000', textOnDark: '#00ff41',
        modalBg: '#0a0f0a',
    }),
    liquid_glass: tmMapPaletteToThemeColors({
        primary: '#007AFF', primaryHover: '#0065D8',
        secondary: '#8E8E93', secondaryHover: '#636366',
        success: '#34C759', successHover: '#248A3D',
        danger: '#FF3B30', dangerHover: '#D70015',
        warning: '#FF9500', warningHover: '#C77700',
        info: '#32ADE6', infoHover: '#007AFF',
        dark: '#EEF0F8', darkHover: '#E5E5EA',
        surface: 'rgba(255, 255, 255, 0.46)', border: 'rgba(60, 60, 67, 0.18)',
        surfaceHover: 'rgba(255, 255, 255, 0.62)', surfaceOwned: 'rgba(0, 122, 255, 0.10)',
        textOnPrimary: '#FFFFFF', textOnLight: '#1D1D1F', textOnDark: '#636366',
        modalBg: 'rgba(255, 255, 255, 0.68)',
    }),
};

const UI_THEMES = {
    'default': {
        name: 'Default', icon: '🎨', cost: 0,
        colors: UI_SPECIALIST_PALETTES.default,
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
        colors: UI_SPECIALIST_PALETTES.matrix,
        pageStyles: THEME_STYLES + `/* Matrix Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }`
    },
    'oceanic': {
        name: 'Oceanic', icon: '🌊', cost: 500, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.oceanic,
        pageStyles: THEME_STYLES + `/* Oceanic Theme Overrides */
            body::before { background-image: radial-gradient(ellipse at 25% 15%, rgba(45,212,191,0.12) 0%, transparent 45%), radial-gradient(ellipse at 75% 85%, rgba(14,116,144,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(5,150,105,0.06) 0%, transparent 40%) !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(72%) sepia(42%) saturate(650%) hue-rotate(128deg) brightness(95%) contrast(101%) !important; }
            
            /* Oceanic Contrast Fixes */
            .tm-modal-content { background: rgba(0, 26, 46, 0.96) !important; }
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { background: rgba(8, 80, 100, 0.28) !important; }
            `
    },
    'cyberpunk': {
        name: 'Cyberpunk', icon: '🌃', cost: 750, type: 'theme', // Cost is for the shop
        colors: UI_SPECIALIST_PALETTES.cyberpunk,
        pageStyles: THEME_STYLES + `/* Cyberpunk Theme Overrides */
            body::before { background-image: linear-gradient(var(--tm-primary-color) 1px, transparent 1px), linear-gradient(90deg, var(--tm-primary-color) 1px, transparent 1px) !important; background-size: 50px 50px !important; opacity: 0.1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(58%) sepia(99%) saturate(1455%) hue-rotate(168deg) brightness(102%) contrast(102%) !important; }
            
            /* Cyberpunk Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }
            .tm-modal-content { background: rgba(10, 5, 20, 0.98) !important; }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { background: rgba(0, 51, 102, 0.25) !important; }`
    },
    'solarized_dark': {
        name: 'Solarized Dark', icon: '☀️', cost: 750, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.solarized_dark,
        pageStyles: THEME_STYLES + `/* Solarized Dark Theme Overrides */
            body::before { background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23073642' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E") !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(334%) hue-rotate(148deg) brightness(91%) contrast(88%) !important; }
            
            /* Solarized Dark Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'solarized_light': {
        name: 'Solarized Light', icon: '💡', cost: 750, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.solarized_light,
        pageStyles: THEME_STYLES + `/* Solarized Light Theme Overrides */
            body { background: linear-gradient(135deg, #fdf6e3 0%, #eee8d5 100%) !important; }
            body::before { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23268bd2' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(42%) sepia(52%) saturate(1200%) hue-rotate(182deg) brightness(92%) contrast(92%) !important; }
            
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
        colors: UI_SPECIALIST_PALETTES.midnight_purple,
        pageStyles: THEME_STYLES + `/* Midnight Purple Theme (Linear) */
            body::before { background-image: radial-gradient(circle at 50% 30%, rgba(94, 106, 210, 0.14) 0%, rgba(62, 63, 78, 0.06) 40%, transparent 70%) !important; opacity: 0.7 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(42%) sepia(85%) saturate(1800%) hue-rotate(243deg) brightness(98%) contrast(101%) !important; }
            
            /* Midnight Purple Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'sunset': {
        name: 'Sunset', icon: '🌅', cost: 500, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.sunset,
        pageStyles: THEME_STYLES + `/* Sunset Theme */
            body::before { background: linear-gradient(180deg, rgba(255,107,107,0.1) 0%, rgba(255,146,43,0.1) 50%, rgba(240,62,62,0.1) 100%) !important; opacity: 0.4 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(61%) sepia(67%) saturate(581%) hue-rotate(312deg) brightness(102%) contrast(101%) !important; }
            
            /* Sunset Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'neon_pink': {
        name: 'Neon Pink', icon: '💗', cost: 750, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.neon_pink,
        pageStyles: THEME_STYLES + `/* Neon Pink Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(233,61,157,0.05) 0px, transparent 2px, transparent 4px, rgba(233,61,157,0.05) 6px) !important; opacity: 1 !important; }
            body::after { background: repeating-linear-gradient(90deg, rgba(196,30,122,0.04) 0px, transparent 2px, transparent 4px, rgba(196,30,122,0.04) 6px) !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(45%) sepia(98%) saturate(5000%) hue-rotate(310deg) brightness(105%) contrast(101%) !important; }
            
            /* Neon Pink Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'forest': {
        name: 'Forest', icon: '🌲', cost: 500, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.forest,
        pageStyles: THEME_STYLES + `/* Forest Theme */
            body::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z' fill='rgba(81,207,102,0.05)' /%3E%3C/svg%3E") !important; opacity: 0.3 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(79%) sepia(11%) saturate(1459%) hue-rotate(77deg) brightness(94%) contrast(90%) !important; }
            
            /* Forest Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }`
    },
    'retro_amber': {
        name: 'Retro Terminal', icon: '📺', cost: 750, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.retro_amber,
        pageStyles: THEME_STYLES + `/* Retro Terminal (Gruvbox) Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(250,189,47,0.03) 0px, transparent 1px, transparent 2px, rgba(250,189,47,0.03) 3px) !important; opacity: 1 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(68%) sepia(54%) saturate(777%) hue-rotate(359deg) brightness(103%) contrast(101%) !important; }`
    },
    'ice': {
        name: 'Ice', icon: '❄️', cost: 500, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.ice,
        pageStyles: THEME_STYLES + `/* Ice Theme */
            body::before { background-image: radial-gradient(circle at 15% 20%, rgba(232,242,248,0.07) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(200,220,232,0.05) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 60%) !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(92%) sepia(8%) saturate(180%) hue-rotate(182deg) brightness(102%) contrast(92%) !important; }
            
            /* Ice Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'crimson': {
        name: 'Crimson', icon: '🔴', cost: 750, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.crimson,
        pageStyles: THEME_STYLES + `/* Crimson Theme */
            body::before { background-image: radial-gradient(circle at 50% 50%, rgba(255,107,107,0.1) 0%, transparent 70%) !important; opacity: 0.5 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(61%) sepia(67%) saturate(581%) hue-rotate(312deg) brightness(102%) contrast(101%) !important; }
            
            /* Crimson Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'dracula': {
        name: 'Dracula', icon: '🧛', cost: 1000, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.dracula,
        pageStyles: THEME_STYLES + `/* Dracula Theme */
            body::before { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='10' y='20' fill='rgba(189,147,249,0.05)' font-size='16' font-family='monospace'%3E🦇🩸🧛%3C/text%3E%3C/svg%3E") !important; opacity: 0.3 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(79%) sepia(23%) saturate(1280%) hue-rotate(203deg) brightness(99%) contrast(97%) !important; }
            
            /* Dracula Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-dark-hover) !important; }`
    },
    'nord': {
        name: 'Nord', icon: '🏔️', cost: 750, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.nord,
        pageStyles: THEME_STYLES + `/* Nord Theme */
            body::before { background: linear-gradient(135deg, rgba(94,129,172,0.05) 0%, rgba(136,192,208,0.05) 100%) !important; opacity: 0.5 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(74%) sepia(14%) saturate(657%) hue-rotate(152deg) brightness(92%) contrast(87%) !important; }
            
            /* Nord Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'tokyo_night': {
        name: 'Tokyo Night', icon: '🗼', cost: 1000, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.tokyo_night,
        pageStyles: THEME_STYLES + `/* Tokyo Night Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(122,162,247,0.02) 0px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, rgba(122,162,247,0.02) 0px, transparent 1px, transparent 2px) !important; opacity: 1 !important; background-size: 30px 30px !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(67%) sepia(27%) saturate(930%) hue-rotate(186deg) brightness(98%) contrast(95%) !important; }
            
            /* Tokyo Night Contrast Fixes */
            #tm-notification-unread-count { color: var(--tm-text-on-primary) !important; }`
    },
    'liquid_glass': {
        name: 'Liquid Glass', icon: '🫧', cost: 1500, type: 'theme',
        colors: UI_SPECIALIST_PALETTES.liquid_glass,
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

function tmRgbChannelString(color) {
    const rgb = tmParseRgbColor(color);
    return rgb ? `${rgb.r},${rgb.g},${rgb.b}` : null;
}

function tmBuildDerivedThemeTokens(colors) {
    const c = colors || {};
    const pick = (key, fallback) => (c[key] != null && c[key] !== '' ? c[key] : fallback);

    const primary = c['--tm-primary-color'] || '#007bff';
    const primaryHover = c['--tm-primary-hover'] || primary;
    const secondary = c['--tm-secondary-color'] || '#6c757d';
    const secondaryHover = c['--tm-secondary-hover'] || secondary;
    const success = c['--tm-success-color'] || '#28a745';
    const successHover = c['--tm-success-hover'] || success;
    const danger = c['--tm-danger-color'] || '#dc3545';
    const warning = c['--tm-warning-color'] || '#ffc107';
    const warningHover = c['--tm-warning-hover'] || warning;
    const info = c['--tm-info-color'] || '#17a2b8';
    const infoHover = c['--tm-info-hover'] || info;
    const dark = c['--tm-dark-color'] || '#343a40';
    const darkHover = c['--tm-dark-hover'] || '#23272b';
    const shopBg = c['--tm-shop-item-bg'] || '#f8f9fa';
    const shopBorder = c['--tm-shop-item-border'] || '#dee2e6';
    const shopHover = c['--tm-shop-item-hover-bg'] || shopBg;
    const shopOwned = c['--tm-shop-item-owned-bg'] || shopHover;
    const modalBg = c['--tm-modal-bg'] || shopBg;
    const textOnDark = c['--tm-text-on-dark'] || primary;
    const textOnLight = c['--tm-text-on-light'] || '#343a40';
    const isLight = tmIsLightShopItemBg(shopBg);

    const primaryRgb = tmRgbChannelString(primary);
    const successRgb = tmRgbChannelString(success);
    const dangerRgb = tmRgbChannelString(danger);
    const warningRgb = tmRgbChannelString(warning);
    const infoRgb = tmRgbChannelString(info);

    const glassBg = isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)'
        : (primaryRgb
            ? `linear-gradient(145deg, rgba(${primaryRgb},0.18) 0%, rgba(${primaryRgb},0.05) 100%)`
            : String(shopBg));
    const glassHover = warningRgb
        ? `linear-gradient(135deg, rgba(${warningRgb},0.35) 0%, rgba(${warningRgb},0.14) 100%)`
        : String(shopHover);
    const glassBorder = primaryRgb ? `rgba(${primaryRgb}, 0.28)` : 'rgba(255,255,255,0.2)';

    const derived = {
        '--tm-body-bg-start': dark,
        '--tm-body-bg-end': darkHover,
        '--tm-surface-bg': shopBg,
        '--tm-surface-hover-bg': shopHover,
        '--tm-surface-border': shopBorder,
        '--tm-surface-alt-bg': shopOwned,
        '--tm-panel-bg': modalBg,
        '--tm-header-bg': darkHover,
        '--tm-nav-bg': dark,
        '--tm-section-bg': shopOwned,
        '--tm-muted-text': secondary,
        '--tm-subtle-text': secondaryHover,
        '--tm-heading-color': info,
        '--tm-label-color': secondaryHover,
        '--tm-footer-text': isLight ? textOnLight : textOnDark,
        '--tm-link-color': primaryHover,
        '--tm-link-hover-color': info,
        '--tm-input-bg': shopBg,
        '--tm-input-border': secondaryHover,
        '--tm-input-text': primary,
        '--tm-input-focus-border': primary,
        '--tm-focus-ring': primary,
        '--tm-accent-color': info,
        '--tm-accent-hover': infoHover,
        '--tm-price-color': success,
        '--tm-price-border': success,
        '--tm-price-bg': successRgb ? `rgba(${successRgb}, 0.14)` : 'rgba(40,167,69,0.12)',
        '--tm-coin-color': warning,
        '--tm-xp-fill-start': warning,
        '--tm-xp-fill-end': warningHover,
        '--tm-xp-track-bg': 'rgba(0,0,0,0.4)',
        '--tm-xp-track-border': primaryRgb ? `rgba(${primaryRgb}, 0.35)` : `rgba(${warningRgb || '255,215,0'}, 0.35)`,
        '--tm-progress-bg': darkHover,
        '--tm-glass-bg': glassBg,
        '--tm-glass-border': glassBorder,
        '--tm-glass-hover-bg': glassHover,
        '--tm-widget-text': isLight ? '#ffffff' : textOnDark,
        '--tm-overlay-dim': 'rgba(0,0,0,0.82)',
        '--tm-shadow-color': primaryRgb ? `rgba(${primaryRgb}, 0.22)` : 'rgba(0,0,0,0.15)',
        '--tm-glow-color': primary,
        '--tm-chip-bg': shopHover,
        '--tm-chip-border': shopBorder,
        '--tm-chip-text': primary,
        '--tm-tab-bg': dark,
        '--tm-tab-active-bg': darkHover,
        '--tm-tab-active-border': primary,
        '--tm-notification-panel-bg': dark,
        '--tm-notification-header-bg': darkHover,
        '--tm-buff-accent': info,
        '--tm-level-badge-bg': warningRgb
            ? `linear-gradient(135deg, rgba(${warningRgb},0.35) 0%, rgba(${warningRgb},0.18) 100%)`
            : warning,
        '--tm-level-badge-border': warningRgb ? `rgba(${warningRgb}, 0.55)` : warning,
        '--tm-buff-badge-bg': infoRgb
            ? `linear-gradient(135deg, rgba(${infoRgb},0.32) 0%, rgba(${infoRgb},0.14) 100%)`
            : info,
        '--tm-buff-badge-border': infoRgb ? `rgba(${infoRgb}, 0.55)` : info,
        '--tm-scrollbar-thumb': secondaryHover,
        '--tm-scrollbar-track': darkHover,
    };

    if (primaryRgb) derived['--tm-primary-color-rgb'] = primaryRgb;
    if (successRgb) derived['--tm-success-color-rgb'] = successRgb;
    if (dangerRgb) derived['--tm-danger-color-rgb'] = dangerRgb;
    if (warningRgb) derived['--tm-warning-color-rgb'] = warningRgb;
    if (infoRgb) derived['--tm-info-color-rgb'] = infoRgb;

    const merged = { ...derived };
    Object.keys(c).forEach((key) => {
        if (c[key] != null && c[key] !== '') merged[key] = c[key];
    });
    return merged;
}

function tmInjectExtendedThemeStyles() {
    document.getElementById('tm-extended-theme-styles')?.remove();
    const el = document.createElement('style');
    el.id = 'tm-extended-theme-styles';
    el.textContent = THEME_EXTENDED_STYLES;
    document.head.appendChild(el);
}

function tmApplyThemeColors(themeId, options = {}) {
    const theme = UI_THEMES[themeId] || UI_THEMES.default;
    const root = document.documentElement;
    const appliedColors = tmBuildDerivedThemeTokens(theme.colors);

    for (const [variable, color] of Object.entries(appliedColors)) {
        root.style.setProperty(variable, color);
    }

    const shopText = tmResolveShopItemText(appliedColors);
    root.style.setProperty('--tm-shop-item-text', shopText);
    appliedColors['--tm-shop-item-text'] = shopText;

    const bg = appliedColors['--tm-dark-color'] || appliedColors['--tm-shop-item-bg'];
    if (bg) {
        root.style.backgroundColor = bg;
    }
    document.documentElement.dataset.tmTheme = themeId;
    theme.appliedColors = appliedColors;

    tmInjectExtendedThemeStyles();

    if (options.pageStyles !== false) {
        document.getElementById('tm-page-theme-styles')?.remove();
        if (theme.pageStyles) {
            const styleEl = document.createElement('style');
            styleEl.id = 'tm-page-theme-styles';
            styleEl.innerHTML = theme.pageStyles;
            document.head.appendChild(styleEl);
        }
    }

    if (typeof window.tmInjectPerformanceStyles === 'function') {
        window.tmInjectPerformanceStyles();
    }

    return theme;
}

window.UI_THEMES = UI_THEMES;
window.tmApplyThemeColors = tmApplyThemeColors;
window.tmReadEquippedThemeId = tmReadEquippedThemeId;
window.tmBuildDerivedThemeTokens = tmBuildDerivedThemeTokens;
window.UI_PALETTE_SOURCES = UI_PALETTE_SOURCES;
window.UI_SPECIALIST_PALETTES = UI_SPECIALIST_PALETTES;
window.tmMapPaletteToThemeColors = tmMapPaletteToThemeColors;

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


