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
            .badge, .statusbadge { color: #ccc !important; border-radius: 4px; text-shadow: none !important; }
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
            .btn:hover { background: var(--tm-primary-color) !important; color: #000000 !important; }
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
            .jconfirm-box .buttons .btn:hover { background: var(--tm-primary-color) !important; color: #000000 !important; box-shadow: 0 0 10px var(--tm-primary-color); }
            
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
            .tm-modal-content { background: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; box-shadow: 0 0 25px var(--tm-primary-color) !important; border-radius: 8px; }
            .tm-modal-header, .tm-settings-section, .tm-modal-footer { border-color: var(--tm-secondary-hover) !important; text-shadow: none !important; }
            .tm-modal-title, .tm-modal-close, .tm-setting-label label, .tm-talent-name { color: var(--tm-primary-color) !important; }
            .tm-setting-description, .tm-talent-description { color: var(--tm-secondary-hover) !important; }

            /* Shop Tabs & Items */
            .tm-shop-tabs { border-bottom-color: var(--tm-secondary-color) !important; }
            .tm-shop-tab { background: var(--tm-dark-color) !important; border-color: var(--tm-secondary-color) !important; color: var(--tm-primary-color) !important; }
            .tm-shop-tab.active { background: var(--tm-dark-hover) !important; color: var(--tm-info-color) !important; border-bottom-color: var(--tm-dark-hover) !important; }
            .tm-shop-item { background: var(--tm-shop-item-bg) !important; border: 1px solid var(--tm-shop-item-border) !important; color: var(--tm-primary-color) !important; }
            .tm-shop-item.owned { background: var(--tm-shop-item-owned-bg) !important; border-color: var(--tm-secondary-hover) !important; }
            .tm-shop-item:hover { border-color: var(--tm-primary-color) !important; }
            .tm-shop-item-btn { background: transparent !important; border: 1px solid var(--tm-primary-color) !important; color: var(--tm-primary-color) !important; border-radius: 16px !important; }
            .tm-shop-item-btn:hover:not(:disabled) { background: var(--tm-primary-color) !important; color: #000000 !important; }
            .tm-shop-item-btn.equipped { background: var(--tm-success-color) !important; color: #000000 !important; border-color: var(--tm-success-color) !important; }
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
            #tm-settings-save, #tm-settings-reset, #tm-quick-search-add-btn, #tm-scratchpad-template-add-btn { background: transparent !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-primary-color) !important; border-radius: 16px !important; }
            #tm-settings-save:hover, #tm-settings-reset:hover, #tm-quick-search-add-btn:hover, #tm-scratchpad-template-add-btn:hover { background: var(--tm-primary-color) !important; color: var(--tm-dark-hover) !important; box-shadow: 0 0 10px var(--tm-primary-color); }
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

            /* Scroll-to-Top Button */
            #tm-scroll-to-top-btn { background-color: var(--tm-dark-color) !important; color: var(--tm-primary-color) !important; border: 1px solid var(--tm-secondary-hover) !important; }
            #tm-scroll-to-top-btn:hover { background-color: var(--tm-dark-hover) !important; }

            /* XP Bar, Coin Balance, Dashboard - Keep glass theme but adjust text colors */
            #tm-xp-bar-container *, #tm-coin-balance *, #tm-daily-dashboard-widget * { color: white !important; text-shadow: 0 0 3px rgba(255,255,255,0.5); }
            #tm-xp-bar-fill { animation: none; box-shadow: none; } /* Disable default pulse for a cleaner look */
            #tm-user-title-text { text-shadow: 0 0 5px var(--tm-info-color); }

            /* Level Up Overlay */
            #tm-level-up-overlay { background: var(--tm-dark-hover) !important; }
            #tm-level-up-overlay::before, #tm-level-up-overlay::after { display: none; } /* Disable default particles */
            .tm-level-up-content { text-shadow: 0 0 10px var(--tm-primary-color), 0 0 20px var(--tm-primary-color); }
            .tm-level-up-title { color: var(--tm-primary-color); }
            .tm-level-up-reward { background: var(--tm-dark-hover) !important; color: var(--tm-primary-hover) !important; border: 1px solid var(--tm-primary-color) !important; }
            .tm-level-up-progress-fill { background: linear-gradient(90deg, var(--tm-secondary-hover), var(--tm-primary-color)) !important; }

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
        },
        pageStyles: `/* Default Theme - Light Background Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; background-color: var(--tm-danger-color) !important; }
            .minimal-store-btn:hover, .rnr-button:hover, #tm-settings-save:hover, #tm-settings-reset:hover, 
            #tm-mascot-interaction-buttons button:hover, .tm-shop-item-btn:hover:not(:disabled),
            .tm-talent-unlock-btn:hover:not(:disabled), .tm-talent-unlock-btn-dashboard:hover:not(:disabled),
            #tm-dashboard-content button[style*="linear-gradient"]:hover { 
                color: #ffffff !important; 
            }
            .tm-modal-content, .tm-modal-header, .tm-modal-footer { 
                background: #ffffff !important; 
                color: var(--tm-dark-color) !important; 
                border-color: var(--tm-shop-item-border) !important; 
            }
            .tm-modal-title, .tm-modal-close { color: var(--tm-primary-color) !important; }
            .tm-setting-label label { color: var(--tm-dark-color) !important; }
            .tm-setting-description { color: var(--tm-secondary-color) !important; }
   
            #tm-level-up-overlay { background: rgba(0,0,0,0.85) !important; }
            .tm-level-up-title, .tm-level-up-content { color: #ffffff !important; }
            #tm-mascot-interaction-panel { background: #ffffff !important; color: var(--tm-dark-color) !important; border-color: var(--tm-shop-item-border) !important; }
            .tm-pet-stat-label { color: var(--tm-dark-color) !important; }
            #tm-notification-panel { background: #ffffff !important; color: var(--tm-dark-color) !important; }
            .tm-notification-header h4 { color: var(--tm-dark-color) !important; }
            .tm-notification-message { color: var(--tm-dark-color) !important; }
            #tm-scratchpad-container { background: #ffffff !important; color: var(--tm-dark-color) !important; }
            #tm-scratchpad-title { color: var(--tm-dark-color) !important; }
            #tm-scratchpad-editor { color: var(--tm-dark-color) !important; }
            .tm-mascot-speech-bubble { background: #ffffff !important; color: var(--tm-dark-color) !important; border-color: var(--tm-primary-color) !important; }`

    },
    'matrix': {
        name: 'Matrix', icon: '📟', cost: 500, type: 'theme', // Cost is for the shop
        colors: {
            '--tm-primary-color': '#00ff00',      // Main interactive color (bright green)
            '--tm-primary-hover': '#33ff33',      // Lighter green for hover
            '--tm-secondary-color': '#008000',    // A darker green for less important elements
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
            '--tm-secondary-color': '#003366',    // Deep, dark blue for borders
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
            '--tm-secondary-color': '#586e75', '--tm-secondary-hover': '#657b83',
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
        },
        pageStyles: THEME_STYLES + `/* Solarized Dark Theme Overrides */
            body::before { background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23073642' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E") !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(60%) sepia(11%) saturate(334%) hue-rotate(148deg) brightness(91%) contrast(88%) !important; }
            
            /* Solarized Dark Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
        },
        pageStyles: THEME_STYLES + `/* Solarized Light Theme Overrides */
            body { background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%) !important; }
            body::before { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235b21b6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(14%) sepia(64%) saturate(5213%) hue-rotate(262deg) brightness(91%) contrast(102%) !important; }
            
            /* Light Theme Specific Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }
            .minimal-store-btn:hover, .rnr-button:hover, #tm-settings-save:hover, #tm-settings-reset:hover, 
            .tm-quick-search-add-btn:hover, .tm-scratchpad-template-add-btn:hover, 
            #tm-mascot-interaction-buttons button:hover, .tm-shop-item-btn:hover:not(:disabled),
            .tm-talent-unlock-btn:hover:not(:disabled), .tm-talent-unlock-btn-dashboard:hover:not(:disabled),
            #tm-dashboard-content button[style*="linear-gradient"]:hover { 
                color: #ffffff !important; 
            }
            #tm-xp-bar-container, #tm-coin-balance, #tm-daily-dashboard-widget { text-shadow: none !important; }
            #footer-outterwrap td, #footer-outterwrap span { text-shadow: none !important; }
            #minimal-username-input { text-shadow: none !important; }
            .tm-level-up-content { text-shadow: none !important; color: var(--tm-primary-color) !important; }
            .tm-level-up-title { text-shadow: 0 2px 4px rgba(0,0,0,0.3) !important; }
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
            '--tm-secondary-color': '#5a189a',    // Dark Purple
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
        },
        pageStyles: THEME_STYLES + `/* Midnight Purple Theme */
            body::before { background-image: radial-gradient(circle at 50% 50%, rgba(157, 78, 221, 0.1) 0%, transparent 50%) !important; opacity: 0.5 !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(60%) sepia(98%) saturate(4461%) hue-rotate(230deg) brightness(97%) contrast(101%) !important; }
            
            /* Midnight Purple Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
        },
        pageStyles: THEME_STYLES + `/* Sunset Theme */
            body::before { background: linear-gradient(180deg, rgba(255,107,107,0.1) 0%, rgba(255,146,43,0.1) 50%, rgba(240,62,62,0.1) 100%) !important; opacity: 0.4 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(61%) sepia(67%) saturate(581%) hue-rotate(312deg) brightness(102%) contrast(101%) !important; }
            
            /* Sunset Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
        },
        pageStyles: THEME_STYLES + `/* Neon Pink Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(255,16,240,0.03) 0px, transparent 2px, transparent 4px, rgba(255,16,240,0.03) 6px) !important; opacity: 1 !important; }
            body::after { background: repeating-linear-gradient(90deg, rgba(255,16,240,0.03) 0px, transparent 2px, transparent 4px, rgba(255,16,240,0.03) 6px) !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(56%) sepia(92%) saturate(5679%) hue-rotate(293deg) brightness(104%) contrast(101%) !important; }
            
            /* Neon Pink Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
            '--tm-secondary-color': '#aa7700',    // Dark Amber
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
        },
        pageStyles: THEME_STYLES + `/* Ice Theme */
            body::before { background-image: radial-gradient(circle at 20% 50%, rgba(116,192,252,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(165,216,255,0.05) 0%, transparent 50%) !important; opacity: 1 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(81%) sepia(10%) saturate(1479%) hue-rotate(179deg) brightness(99%) contrast(98%) !important; }
            
            /* Ice Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
        },
        pageStyles: THEME_STYLES + `/* Crimson Theme */
            body::before { background-image: radial-gradient(circle at 50% 50%, rgba(255,107,107,0.1) 0%, transparent 70%) !important; opacity: 0.5 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(61%) sepia(67%) saturate(581%) hue-rotate(312deg) brightness(102%) contrast(101%) !important; }
            
            /* Crimson Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
        },
        pageStyles: THEME_STYLES + `/* Nord Theme */
            body::before { background: linear-gradient(135deg, rgba(94,129,172,0.05) 0%, rgba(136,192,208,0.05) 100%) !important; opacity: 0.5 !important; animation: none !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(74%) sepia(14%) saturate(657%) hue-rotate(152deg) brightness(92%) contrast(87%) !important; }
            
            /* Nord Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
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
        },
        pageStyles: THEME_STYLES + `/* Tokyo Night Theme */
            body::before { background-image: repeating-linear-gradient(0deg, rgba(122,162,247,0.02) 0px, transparent 1px, transparent 2px), repeating-linear-gradient(90deg, rgba(122,162,247,0.02) 0px, transparent 1px, transparent 2px) !important; opacity: 1 !important; background-size: 30px 30px !important; }
            .rnr-button.img, .menu-icon, .ui-dialog .ui-dialog-titlebar-close, img[src='images/smsdelivered.png'], .tm-scratchpad-checkbox { filter: brightness(0) saturate(100%) invert(67%) sepia(27%) saturate(930%) hue-rotate(186deg) brightness(98%) contrast(95%) !important; }
            
            /* Tokyo Night Contrast Fixes */
            #tm-notification-unread-count { color: #ffffff !important; }`
    },
    'ios_glass': {
        name: 'iOS Glass', icon: '🍎', cost: 1200, type: 'theme',
        colors: {
            '--tm-primary-color': '#007aff',      // iOS Blue
            '--tm-primary-hover': '#0051d5',      // Dark iOS Blue
            '--tm-secondary-color': '#8e8e93',    // iOS Gray
            '--tm-secondary-hover': '#636366',    // Dark Gray
            '--tm-success-color': '#34c759',      // iOS Green
            '--tm-success-hover': '#248a3d',      // Dark Green
            '--tm-danger-color': '#ff3b30',       // iOS Red
            '--tm-danger-hover': '#d70015',       // Dark Red
            '--tm-warning-color': '#ff9500',      // iOS Orange
            '--tm-warning-hover': '#c93400',      // Dark Orange
            '--tm-info-color': '#5ac8fa',         // iOS Cyan
            '--tm-info-hover': '#0a84ff',         // Dark Cyan
            '--tm-dark-color': '#f2f2f7',         // iOS Light Background
            '--tm-dark-hover': '#e5e5ea',         // iOS Light Gray

            '--tm-shop-item-bg': 'rgba(255, 255, 255, 0.15)',
            '--tm-shop-item-border': 'rgba(0, 0, 0, 0.04)',
            '--tm-shop-item-hover-bg': 'rgba(255, 255, 255, 0.15)',
            '--tm-shop-item-owned-bg': 'rgba(0, 122, 255, 0.08)',
        },
        pageStyles: `/* iOS Glass Theme - Modern Apple Design with Enhanced Glassmorphism */
            /* Clean light background with subtle gradient */
            body { 
                background: linear-gradient(135deg, #f2f2f7 0%, #e5e5ea 100%) !important;
                background-attachment: fixed;
            }
            
            /* Animated glass shimmer overlay */
            @keyframes ios-glass-shimmer {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            
            @keyframes ios-gentle-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            /* Multiple layered glass overlays for depth */
            body::before { 
                content: " "; 
                display: block; 
                position: fixed; 
                top: 0; 
                left: 0; 
                z-index: -1;
                width: 100%; 
                height: 100%;
                background-image: 
                    radial-gradient(circle at 20% 30%, rgba(0, 122, 255, 0.06) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(52, 199, 89, 0.04) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(90, 200, 250, 0.03) 0%, transparent 60%);
                opacity: 1 !important; 
                animation: ios-gentle-float 15s ease-in-out infinite;
            }
            
            /* Light refraction effect */
            body::after {
                content: " ";
                display: block;
                position: fixed;
                top: -50%;
                left: -50%;
                z-index: -2;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(255, 255, 255, 0.1) 50%,
                    transparent 70%
                );
                animation: ios-glass-shimmer 20s ease-in-out infinite;
                pointer-events: none;
            }
            
            /* Clean glassmorphic panels */
            .rnr-page, .rnr-middle, .rnr-left, .rnr-center, .rnr-right, .rnr-s-fields, .rnr-s-form, 
            .rnr-s-1, .rnr-s-2, .rnr-s-3, .rnr-s-empty, .rnr-s-hmenu, .rnr-s-undermenu, 
            .rnr-c-fields, .rnr-c-form, .rnr-c-1, .rnr-c-2, .rnr-c-3, .pag_n, .rnr-c-edit, 
            .rnr-cw-edit, .rnr-cw-recordcontrols, .rnr-c-recordcontrols, .rnr-scrollgrid-inner, 
            .fieldGrid, .rnr-pagewrapper, .rnr-c-1, .rnr-cw-1, .rnr-brickcontents, 
            .rnr-b-wrapper, .rnr-wrapper, .rnr-cbw-fields, .rnr-b-editfields2_atop, 
            .rnr-b-editheader, .rnr-b-editbuttons {
                background: transparent !important; 
                color: #1c1c1e !important;
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif !important;
            }
            
            /* iOS 26 Liquid Glass panels - Authentic Apple design */
            .rnr-top, #head-outter, #footer-outter, .rnr-cw-hmenu, .rnr-cw-pagination, 
            .rnr-cw-pagination_bottom, .rnr-s-menu, .rnr-s-grid, .rnr-c-hmenu, 
            .rnr-c-pagination, .rnr-c-pagination_bottom { 
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                position: relative;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            
            /* Add light refraction on glass panels */
            .rnr-top::before, #head-outter::before, .rnr-s-grid::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
                border-radius: 20px 20px 0 0;
                pointer-events: none;
            }
            
            /* Clean typography */
            h1, h2, h3, h4, h5, h6, .pagetitle { 
                color: #1c1c1e !important;
                text-shadow: none !important;
                font-weight: 600;
                letter-spacing: -0.5px;
            }
            
            /* Links */
            a, a:visited, .rnr-orderlink { 
                color: var(--tm-primary-color) !important; 
                text-decoration: none !important; 
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            a:hover, .rnr-orderlink:hover { 
                color: var(--tm-primary-hover) !important;
                opacity: 0.8;
            }
            
            /* iOS 26 Liquid Glass form elements */
            input, select, textarea, .form-control { 
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #1c1c1e !important; 
                border: 1px solid rgba(255, 255, 255, 0.2) !important; 
                border-radius: 10px !important; 
                padding: 10px 14px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
            }
            input:focus, select:focus, textarea:focus { 
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.2) 0%,
                    rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                box-shadow: 
                    0 0 0 3px rgba(0, 122, 255, 0.1),
                    0 4px 6px rgba(0, 0, 0, 0.1) !important;
                outline: none !important;
                transform: translateY(-1px);
            }
            
            /* iOS 26 Liquid Glass buttons */
            .rnr-button, .MyMANAGERWhite_label1 .rnr-button.rnr-button { 
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important; 
                border: 1px solid rgba(255, 255, 255, 0.2) !important; 
                border-radius: 12px !important; 
                padding: 10px 18px !important;
                font-weight: 600 !important;
                text-shadow: none !important;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                position: relative;
                overflow: hidden;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            
            /* Glass shine effect on buttons */
            .rnr-button::before, .MyMANAGERWhite_label1 .rnr-button.rnr-button::before {
                content: "";
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
                transition: left 0.5s ease;
            }
            .rnr-button:hover::before, .MyMANAGERWhite_label1 .rnr-button:hover::before {
                left: 100%;
            }
            
            .rnr-button:hover, .MyMANAGERWhite_label1 .rnr-button:hover { 
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.2) 0%,
                    rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            .rnr-button.img { 
                filter: brightness(0) saturate(100%) invert(32%) sepia(87%) saturate(1871%) hue-rotate(197deg) brightness(102%) contrast(106%);
            }

            /* iOS 26 Liquid Glass menu items */
            .rnr-b-vmenu li > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *, 
            .rnr-b-vmenu_undermenu > ul > li > a { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px;
                margin-bottom: 6px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .rnr-b-vmenu li:hover > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *:hover { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                transform: translateX(4px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            .rnr-b-vmenu li.current > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *.current { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                border-left: 3px solid var(--tm-primary-color) !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .rnr-b-vmenu li.current a, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *.current a { 
                color: var(--tm-primary-color) !important; 
                font-weight: 600 !important;
            }

            /* Enhanced Grid / Tables with intensive glass */
            .rnr-gridtable, .MyMANAGERWhite_label1.rnr-s-grid > table { 
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.08),
                    0 1px 0 rgba(255, 255, 255, 0.15) inset;
            }
            .rnr-gridtable tr.rnr-row, .rnr-gridtable tr.rnr-toprow, .rnr-toprow.style1,
            .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row > td, 
            .rnr-c-grid > .rnr-b-grid > .rnr-gridtable > tbody > tr > td { 
                background: rgba(255, 255, 255, 0.4) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
            }
            .rnr-gridtable tr.rnr-row:nth-last-child(2n+1) > td, 
            .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row:nth-last-child(2n+1) > td { 
                background: rgba(255, 255, 255, 0.6) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
            }
            .rnr-gridtable tr.rnr-row, .rnr-row.style1 { 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .rnr-gridtable tr.rnr-row:hover, .rnr-row.style1:hover, 
            .MyMANAGERWhite_label1.rnr-s-grid > table.hoverable > * > .rnr-row:hover > td { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.06) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                transform: scale(1.01);
                box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
            }
            .rnr-gridtable td, .rnr-gridtable th, 
            .MyMANAGERWhite_label1.rnr-s-grid > table > * > * > td { 
                border-color: rgba(0, 0, 0, 0.03) !important; 
                color: #1c1c1e !important;
            }
            .rnr-c-grid.rnr-b-grid, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-toprow > th { 
                background: rgba(255, 255, 255, 0.15) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                font-weight: 600;
                box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            .rnr-search-highlight { 
                background-color: rgba(255, 204, 0, 0.3) !important;
                color: #1c1c1e !important;
                border-radius: 4px;
                padding: 2px 4px;
            }

            /* Enhanced Badges with Glass Effect */
            .badge, .statusbadge { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.55) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                color: #1c1c1e !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 8px;
                padding: 3px 8px;
                font-weight: 500;
                box-shadow: 
                    0 2px 6px rgba(0, 0, 0, 0.04),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            .etdbadge {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.18) 0%, rgba(0, 122, 255, 0.12) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                color: var(--tm-primary-color) !important; 
                border: 0.5px solid rgba(0, 122, 255, 0.3) !important; 
                border-radius: 10px !important;
                padding: 5px 10px !important;
                font-weight: 600;
                box-shadow: 
                    0 2px 8px rgba(0, 122, 255, 0.12),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            
            /* jQuery UI with glass effect */
            .ui-widget-content, .ui-dialog, .ui-datepicker { 
                background: rgba(255, 255, 255, 0.15) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                color: #1c1c1e !important; 
                border: 0.5px solid rgba(0, 0, 0, 0.08) !important; 
                border-radius: 16px !important; 
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                            0 1px 0 rgba(255, 255, 255, 0.15) inset !important;
            }
            .ui-widget-header { 
                background: rgba(255, 255, 255, 0.5) !important;
                color: #1c1c1e !important; 
                border: none !important;
                border-bottom: 0.5px solid rgba(0, 0, 0, 0.08) !important;
                border-radius: 16px 16px 0 0 !important;
                font-weight: 600;
            }
            .ui-button { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important; 
                border: 1px solid rgba(0, 122, 255, 0.3) !important; 
                border-radius: 10px !important;
                padding: 8px 16px !important;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .ui-button:hover { 
                background: var(--tm-primary-color) !important;
                color: #ffffff !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* iOS 26 Liquid Glass Bootstrap Buttons */
            .btn { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important; 
                border: 1px solid rgba(0, 122, 255, 0.3) !important; 
                border-radius: 10px !important;
                padding: 8px 16px !important;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .btn:hover { 
                background: var(--tm-primary-color) !important;
                color: #ffffff !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
            }
            .dropdown-menu { 
                background: rgba(255, 255, 255, 0.15) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(0, 0, 0, 0.08) !important; 
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
                padding: 4px;
            }
            .dropdown-item { 
                color: #1c1c1e !important;
                border-radius: 8px;
                padding: 8px 12px;
                transition: all 0.15s ease;
            }
            .dropdown-item:hover { 
                background: rgba(0, 122, 255, 0.08) !important;
            }
            
            /* jConfirm Popup */
            .jconfirm { 
                background: rgba(0, 0, 0, 0.3) !important; 
                backdrop-filter: blur(10px) !important;
            }
            .jconfirm-box { 
                background: rgba(255, 255, 255, 0.15) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(0, 0, 0, 0.08) !important; 
                border-radius: 16px !important; 
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15) !important;
            }
            .jconfirm-box .title { 
                color: #1c1c1e !important;
                font-weight: 600;
            }
            .jconfirm-box .content { 
                color: #3a3a3c !important;
            }
            .jconfirm-box .buttons .btn { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important; 
                border: 1px solid rgba(0, 122, 255, 0.3) !important; 
                border-radius: 10px !important;
                padding: 8px 16px !important;
                font-weight: 600;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .jconfirm-box .buttons .btn:hover { 
                background: var(--tm-primary-color) !important;
                color: #ffffff !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
            }

            /* --- iOS 26 Liquid Glass Modals --- */
            .tm-modal-overlay {
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }
            
            .tm-modal-content { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #1c1c1e !important; 
                border: 1px solid rgba(255, 255, 255, 0.2) !important; 
                border-radius: 20px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                position: relative;
            }
            
            /* Glass reflection on modal */
            .tm-modal-content::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 40%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
                border-radius: 24px 24px 0 0;
                pointer-events: none;
            }
            .tm-modal-header, .tm-modal-footer { 
                border-color: rgba(0, 0, 0, 0.08) !important;
            }
            .tm-modal-title, .tm-modal-close { 
                color: #1c1c1e !important;
                font-weight: 600;
            }
            .tm-setting-label label { 
                color: #1c1c1e !important;
                font-weight: 500;
            }
            .tm-setting-description { 
                color: #636366 !important;
            }

            /* iOS 26 Liquid Glass Shop Items */
            .tm-shop-item { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                position: relative;
                overflow: hidden;
            }
            
            /* Glass shine on shop items */
            .tm-shop-item::after {
                content: "";
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%);
                transform: rotate(45deg);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .tm-shop-item:hover::after {
                opacity: 1;
                animation: ios-glass-shimmer 1s ease-out;
            }
            
            .tm-shop-item.owned { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .tm-shop-item:hover { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                transform: translateY(-4px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            .tm-shop-item-btn { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important; 
                color: var(--tm-primary-color) !important; 
                border-radius: 10px !important;
                padding: 8px 16px !important;
                font-weight: 600;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tm-shop-item-btn:hover:not(:disabled) { 
                background: var(--tm-primary-color) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #ffffff !important;
                transform: scale(1.02);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15) !important;
            }
            .tm-shop-item-btn.equipped {
                background: linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(52, 199, 89, 0.3) !important;
                color: var(--tm-success-color) !important;
            }
            .tm-shop-item-btn:disabled {
                background: linear-gradient(135deg, rgba(142, 142, 147, 0.1) 0%, rgba(142, 142, 147, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(142, 142, 147, 0.2) !important;
                color: #8e8e93 !important;
                opacity: 0.5;
            }

            /* Footer & Header Liquid Glass */
            #footer-outter, #footer-outterwrap { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            #footer-outterwrap td, #footer-outterwrap span { 
                color: #1c1c1e !important;
            }
            #footer-outterwrap a, #footer-outterwrap a span { 
                color: var(--tm-primary-color) !important;
            }
            #footer-outterwrap a:hover, #footer-outterwrap a:hover span { 
                color: var(--tm-primary-hover) !important;
            }
            #head-outter, #head-outterwrap { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
            }

            /* Contrast Fixes */
            #tm-notification-unread-count { 
                color: #ffffff !important; 
                background-color: var(--tm-danger-color) !important;
                font-weight: 600;
            }
            
            /* === UNIVERSAL BUTTON ALIGNMENT FOR iOS GLASS === */
            button, .btn, .rnr-button, input[type="button"], input[type="submit"],
            .tm-quick-search-remove-btn, .tm-template-remove-btn,
            .tm-talent-unlock-btn, .tm-talent-unlock-btn-dashboard {
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
            }
            
            /* === FOOTER ELEMENTS - iOS Glass Theme Specific (Performance Optimized) === */
            
            /* iOS 26 Liquid Glass XP Bar */
            #tm-xp-bar-container {
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-xp-bar-container:hover {
                background: linear-gradient(135deg,
                    rgba(255, 255, 255, 0.2) 0%,
                    rgba(255, 255, 255, 0.1) 100%) !important;
                transform: translate3d(0, -2px, 0);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            #tm-xp-bar-container * {
                color: #1c1c1e !important;
            }
            #tm-user-title-text {
                color: var(--tm-primary-color) !important;
                font-weight: 700;
            }
            
            /* iOS 26 Liquid Glass Coin Balance */
            #tm-coin-balance {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-coin-balance:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                transform: translate3d(0, -2px, 0);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            #tm-coin-balance * {
                color: #1c1c1e !important;
                font-weight: 700;
            }
            
            /* iOS 26 Liquid Glass Dashboard Widget */
            #tm-daily-dashboard-widget {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-daily-dashboard-widget:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                transform: translate3d(0, -2px, 0);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            #tm-daily-dashboard-widget * {
                color: #1c1c1e !important;
                font-weight: 600;
            }
            
            /* iOS 26 Liquid Glass Weather Widget */
            #tm-weather-widget {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-weather-widget:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            #tm-weather-temp {
                color: #1c1c1e !important;
                font-weight: 600;
            }
            
            /* iOS 26 Liquid Glass Refresh Timer */
            #tm-refresh-timer-container {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-refresh-timer-container:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            .tm-refresh-circle-bg {
                stroke: rgba(0, 0, 0, 0.08) !important;
            }
            .tm-refresh-circle-progress {
                stroke: var(--tm-primary-color) !important;
            }
            .tm-refresh-time-text {
                color: #1c1c1e !important;
                font-weight: 600;
            }
            
            /* iOS 26 Liquid Glass Settings Button */
            #tm-settings-btn {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                color: #1c1c1e !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-settings-btn:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            
            /* iOS 26 Liquid Glass Notification Bell */
            #tm-notification-bell-btn {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                color: #1c1c1e !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-notification-bell-btn:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            
            /* iOS 26 Liquid Glass Buff Timers */
            .tm-buff-timer {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            .tm-buff-timer:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            .tm-buff-timer-bg {
                stroke: rgba(0, 0, 0, 0.08) !important;
            }
            .tm-buff-timer-icon {
                color: #1c1c1e !important;
            }
            
            /* iOS 26 Liquid Glass Feature Buttons */
            #tm-footer-controls-left button, #tm-footer-controls-right button,
            button[title*="Talent"], button[title*="Faction"], button[title*="Boss"] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                padding: 8px 16px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                color: #1c1c1e !important;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                will-change: transform;
                transform: translate3d(0, 0, 0);
            }
            #tm-footer-controls-left button:hover, #tm-footer-controls-right button:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            
            /* Talent Points Badge on Footer Button */
            #tm-footer-controls-left button div[style*="background"],
            button[title*="Talent"] div {
                background: linear-gradient(135deg, rgba(255, 59, 48, 0.90) 0%, rgba(255, 59, 48, 0.80) 100%) !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.5) !important;
                box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3) !important;
            }
            
            /* XP Bar Fill with Glass Overlay */
            #tm-xp-bar-fill {
                background: linear-gradient(90deg, 
                    rgba(0, 122, 255, 0.8) 0%, 
                    rgba(90, 200, 250, 0.8) 100%) !important;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3) !important;
            }
            
            /* Level Badge with Glass */
            #tm-level-text {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.85) 0%, rgba(255, 215, 0, 0.75) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255, 215, 0, 0.5) !important;
                color: #1c1c1e !important;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2) !important;
            }
            
            /* Energized Buff Indicator with Glass */
            #tm-energized-buff-indicator {
                background: linear-gradient(135deg, rgba(0, 191, 255, 0.85) 0%, rgba(0, 242, 254, 0.75) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(0, 191, 255, 0.6) !important;
                color: white !important;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(0, 191, 255, 0.3) !important;
            }
            
            /* iOS 26 Liquid Glass Mascot Panel */
            #tm-mascot-interaction-panel { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #1c1c1e !important; 
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                position: relative;
            }
            #tm-mascot-interaction-buttons button {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                border-radius: 10px !important;
                padding: 8px 16px !important;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            #tm-mascot-interaction-buttons button:hover {
                background: var(--tm-primary-color) !important;
                color: #ffffff !important;
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
            }
            .tm-pet-stat-label { 
                color: #1c1c1e !important;
                font-weight: 500;
            }
            
            /* Enhanced Scratchpad with Ultra Glass */
            #tm-scratchpad-container { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.68) 100%) !important;
                backdrop-filter: blur(18px) saturate(150%) brightness(115%) !important;
                -webkit-backdrop-filter: blur(18px) saturate(150%) brightness(115%) !important;
                color: #1c1c1e !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 20px;
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.18),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset,
                    0 -2px 4px rgba(0, 0, 0, 0.03) inset,
                    0 0 0 1px rgba(255, 255, 255, 0.6) inset !important;
                position: relative;
            }
            
            /* Glass reflection overlay */
            #tm-scratchpad-container::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
                border-radius: 20px 20px 0 0;
                pointer-events: none;
                z-index: 1;
            }
            #tm-scratchpad-title { 
                color: #1c1c1e !important;
                font-weight: 600;
            }
            #tm-scratchpad-editor { 
                color: #1c1c1e !important;
            }
            
            /* Enhanced Notification Panel with Intensive Glass */
            #tm-notification-panel { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #1c1c1e !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 18px;
                box-shadow: 
                    0 12px 40px rgba(0, 0, 0, 0.12),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset,
                    0 -2px 4px rgba(0, 0, 0, 0.03) inset;
                position: relative;
            }
            
            /* Glass reflection on notification panel */
            #tm-notification-panel::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 30%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
                border-radius: 18px 18px 0 0;
                pointer-events: none;
            }
            .tm-notification-header h4 { 
                color: #1c1c1e !important;
                font-weight: 600;
            }
            .tm-notification-message { 
                color: #1c1c1e !important;
            }
            
            /* Dashboard */
            .tm-dashboard-tab { 
                background: transparent !important;
                color: #8e8e93 !important;
                border: none !important;
                font-weight: 500;
            }
            .tm-dashboard-tab.active, .tm-dashboard-tab:hover { 
                color: var(--tm-primary-color) !important;
                border-bottom: 2px solid var(--tm-primary-color) !important;
            }
            
            /* Enhanced Level Up Overlay with Frosted Glass */
            #tm-level-up-overlay { 
                background: rgba(0, 0, 0, 0.4) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }
            .tm-level-up-content { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(80px) saturate(150%) brightness(120%) !important;
                -webkit-backdrop-filter: blur(80px) saturate(150%) brightness(120%) !important;
                border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
                border-radius: 28px;
                padding: 48px;
                box-shadow: 
                    0 32px 80px rgba(0, 0, 0, 0.2),
                    0 4px 8px rgba(255, 255, 255, 0.95) inset,
                    0 -4px 8px rgba(0, 0, 0, 0.03) inset,
                    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
                position: relative;
                animation: ios-gentle-float 3s ease-in-out infinite;
            }
            
            /* Ultra glass reflection on level up */
            .tm-level-up-content::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%);
                border-radius: 28px 28px 0 0;
                pointer-events: none;
            }
            
            .tm-level-up-title { 
                color: var(--tm-primary-color) !important;
                font-weight: 700;
                position: relative;
                z-index: 1;
            }
            
            /* Enhanced Mascot Speech Bubble with Glass */
            .tm-mascot-speech-bubble { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.80) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) brightness(110%) !important;
                color: #1c1c1e !important;
                border: 1px solid rgba(255, 255, 255, 0.95) !important;
                border-radius: 16px;
                box-shadow: 
                    0 8px 24px rgba(0, 0, 0, 0.12),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset,
                    0 -1px 2px rgba(0, 0, 0, 0.02) inset;
                font-weight: 500;
                position: relative;
            }
            
            /* Glass shine on speech bubble */
            .tm-mascot-speech-bubble::before {
                content: "";
                position: absolute;
                top: -20%;
                left: 10%;
                width: 60%;
                height: 40%;
                background: radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
            }
            
            /* Enhanced Talents & Quests with Glass */
            .tm-talent-item, .tm-quest-item, .tm-title-item { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.55) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
                position: relative;
            }
            .tm-talent-item:hover, .tm-quest-item:hover, .tm-title-item:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                transform: translateY(-2px) scale(1.01);
                box-shadow: 
                    0 8px 24px rgba(0, 0, 0, 0.1),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            .tm-talent-item.unlocked, .tm-quest-item.completed { 
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.10) 100%) !important;
                backdrop-filter: blur(10px) saturate(145%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(145%) brightness(110%) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                box-shadow: 
                    0 4px 16px rgba(0, 122, 255, 0.12),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Settings Sidebar */
            .tm-settings-sidebar .tm-nav a { 
                background: rgba(255, 255, 255, 0.5) !important;
                color: #1c1c1e !important;
                border-radius: 10px;
                font-weight: 500;
            }
            .tm-settings-sidebar .tm-nav a:hover { 
                background: rgba(255, 255, 255, 0.15) !important;
            }
            .tm-settings-sidebar .tm-nav a.active { 
                background: rgba(0, 122, 255, 0.12) !important;
                color: var(--tm-primary-color) !important;
                font-weight: 600;
            }
            
            /* Enhanced Repair Edit Page with Intensive Glass */
            .rnr-b-editheader h1 { 
                color: #1c1c1e !important;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.15);
            }
            .fieldGrid .rnr-label label, .fieldGrid .rnr-label b { 
                color: #636366 !important;
                font-weight: 500;
            }
            .rnr-s-fields > .rnr-c, .rnr-s-1 > .rnr-c { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.45) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.05),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset,
                    0 -1px 2px rgba(0, 0, 0, 0.02) inset;
                position: relative;
            }
            
            /* Glass reflection on field containers */
            .rnr-s-fields > .rnr-c::before, .rnr-s-1 > .rnr-c::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 40%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
                border-radius: 16px 16px 0 0;
                pointer-events: none;
            }
            
            /* Enhanced Boss & Event Notifications with Ultra Glass */
            #tm-boss-notification, #tm-event-notification { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(15px) brightness(115%) !important;
                -webkit-backdrop-filter: blur(15px) brightness(115%) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 20px;
                box-shadow: 
                    0 16px 48px rgba(0, 0, 0, 0.15),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset,
                    0 -2px 4px rgba(0, 0, 0, 0.03) inset !important;
                position: relative;
                animation: ios-gentle-float 4s ease-in-out infinite;
            }
            
            /* Glass reflection on notifications */
            #tm-boss-notification::before, #tm-event-notification::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 40%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
                border-radius: 20px 20px 0 0;
                pointer-events: none;
            }
            
            /* Enhanced Slide-out Buttons with Glass */
            .tm-slide-out-btn { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-right: none !important;
                border-radius: 16px 0 0 16px;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.08),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tm-slide-out-btn:hover { 
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.80) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                transform: translateX(-4px);
                box-shadow: 
                    0 8px 24px rgba(0, 0, 0, 0.12),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* === Additional Glass Effects for More Elements === */
            
            /* Tabs with Glass Effect */
            .rnr-tab, .yui-nav li, .tm-shop-tab, .tm-dashboard-tab, .tm-scratchpad-tab {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.45) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 12px 12px 0 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 2px 8px rgba(0, 0, 0, 0.04),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            .rnr-tab.selected, .yui-nav li.selected, .tm-shop-tab.active, .tm-scratchpad-tab.active {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.20) 0%, rgba(0, 122, 255, 0.12) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                border: 0.5px solid rgba(0, 122, 255, 0.3) !important;
                box-shadow: 
                    0 4px 12px rgba(0, 122, 255, 0.15),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Pagination Controls with Glass */
            .pag_a, .pag_a a, .pag_n, .pag_n a {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.50) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                color: var(--tm-primary-color) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 10px !important;
                padding: 6px 12px !important;
                margin: 0 2px !important;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 2px 6px rgba(0, 0, 0, 0.04),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            .pag_a:hover, .pag_a a:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                transform: translateY(-2px);
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.08),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* iOS 26 Liquid Glass Search Elements */
            .search_suggest, .rnr-b-search, .tm-search-list-item {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .search_suggest div {
                color: #1c1c1e !important;
                border-color: rgba(255, 255, 255, 0.2) !important;
            }
            .search_suggest div.search_suggest_header {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #1c1c1e !important;
                font-weight: 600;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
            }
            .search_suggest div.search_suggest_link_over {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important;
            }
            
            /* Horizontal Menu Items with Glass */
            .rnr-b-hmenu, .rnr-b-hmenu.main {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.55) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 12px;
                box-shadow: 
                    0 2px 8px rgba(0, 0, 0, 0.06),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .rnr-b-hmenu:hover, .rnr-b-hmenu.main:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
            }
            .rnr-b-hmenu.current, .rnr-b-hmenu.main.current {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.18) 0%, rgba(0, 122, 255, 0.12) 100%) !important;
                backdrop-filter: blur(10px) saturate(145%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(145%) brightness(110%) !important;
                border-color: rgba(0, 122, 255, 0.3) !important;
            }
            
            /* Message Boxes and Alerts with Glass */
            .rnr-message, #tm-positive-message, #tm-achievement-notification {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px;
                box-shadow: 
                    0 12px 32px rgba(0, 0, 0, 0.12),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset,
                    0 -2px 4px rgba(0, 0, 0, 0.02) inset;
                color: #1c1c1e !important;
                font-weight: 500;
            }
            
            /* Tooltips and Popovers with Glass */
            .tooltip, .popover, .tm-scratchpad-popover, 
            #tm-scratchpad-reminder-popover, #tm-scratchpad-template-popover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 14px;
                box-shadow: 
                    0 8px 24px rgba(0, 0, 0, 0.1),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
                color: #1c1c1e !important;
            }
            
            /* Image Containers and Wrappers with Glass */
            .rnr-c-1, .rnr-cw-1, .rnr-c-2, .rnr-c-3 {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(106%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(106%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 14px;
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.05),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            
            /* iOS 26 Liquid Glass Print/Action Buttons */
            .tm-print-btn, .tm-goto-btn, .tm-print-page-btn {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                border-radius: 10px !important;
                padding: 8px 16px !important;
                font-weight: 600;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tm-print-btn:hover, .tm-goto-btn:hover, .tm-print-page-btn:hover {
                background: var(--tm-primary-color) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #ffffff !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* iOS 26 Liquid Glass Scroll to Top Button */
            #tm-scroll-to-top-btn {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 50%;
                width: 48px !important;
                height: 48px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            #tm-scroll-to-top-btn:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                transform: translateY(-4px) scale(1.05);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            
            /* Weather Modal Content with Glass */
            #tm-weather-details > div {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.55) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Customer History and Detail Views with Glass */
            #tm-customer-history-container, .tm-details-table {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.50) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(106%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(106%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 14px;
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.05),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Result Items (Search Results) with Glass */
            .tm-result-item {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.55) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tm-result-item:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.70) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(110%) !important;
                transform: translateY(-2px) scale(1.01);
                box-shadow: 
                    0 8px 24px rgba(0, 0, 0, 0.1),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Login Page Elements with Glass */
            .minimal-login-container {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
                backdrop-filter: blur(15px) brightness(115%) !important;
                -webkit-backdrop-filter: blur(15px) brightness(115%) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 24px;
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.15),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset,
                    0 -2px 4px rgba(0, 0, 0, 0.03) inset;
            }
            #login-settings-panel {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.68) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 20px;
                box-shadow: 
                    0 16px 48px rgba(0, 0, 0, 0.12),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Game Overlays with Frosted Glass */
            #tm-memory-game-overlay, #tm-game-overlay {
                background: rgba(0, 0, 0, 0.5) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
            }
            .tm-memory-game-pad, #tm-game-ui {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.60) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                box-shadow: 
                    0 6px 20px rgba(0, 0, 0, 0.1),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            .tm-memory-game-pad:hover {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.30) 0%, rgba(0, 122, 255, 0.20) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) brightness(115%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(115%) !important;
                transform: scale(1.05);
                box-shadow: 
                    0 8px 24px rgba(0, 122, 255, 0.2),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Stat Bars and Progress Indicators with Glass */
            .tm-pet-stat-bar, .tm-boss-progress-bar, .tm-level-up-progress-bar {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%) !important;
                backdrop-filter: blur(15px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(15px) saturate(140%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 12px;
                box-shadow: 
                    0 2px 6px rgba(0, 0, 0, 0.04) inset,
                    0 1px 0 rgba(255, 255, 255, 0.15);
                overflow: hidden;
            }
            
            /* List Items and Cards with Glass */
            .tm-notification-item, .login-user-item, .tm-search-list-item {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.45) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 12px;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
            }
            .tm-notification-item:hover, .login-user-item:hover, .tm-search-list-item:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.60) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) brightness(108%) !important;
                transform: translateX(4px);
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.06),
                    0 1px 0 rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Headers and Titles with Glass Backing */
            .tm-modal-header, .tm-notification-header, .tm-scratchpad-header,
            #tm-scratchpad-header, .tm-integrated-panel-header {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.50) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border-bottom: 0.5px solid rgba(0, 0, 0, 0.06) !important;
                position: relative;
            }
            
            /* Glass reflection on headers */
            .tm-modal-header::before, .tm-notification-header::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
                pointer-events: none;
            }
            
            /* iOS 26 Liquid Glass Settings Buttons */
            #tm-settings-save, #tm-settings-reset, #tm-quick-search-add-btn,
            #tm-scratchpad-template-add-btn, .tm-data-btn {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                border-radius: 12px !important;
                padding: 10px 20px !important;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            #tm-settings-save:hover, #tm-settings-reset:hover, 
            #tm-quick-search-add-btn:hover, #tm-scratchpad-template-add-btn:hover,
            .tm-data-btn:hover {
                background: var(--tm-primary-color) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #ffffff !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* Talent Points Display with Glass */
            .tm-talent-points-display, .tm-talent-points-badge {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.18) 0%, rgba(255, 215, 0, 0.12) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(110%) !important;
                border: 1px solid rgba(255, 215, 0, 0.3) !important;
                border-radius: 12px;
                box-shadow: 
                    0 4px 12px rgba(255, 215, 0, 0.1),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Quest Rewards and Title Displays with Glass */
            .tm-quest-reward, .tm-title-level {
                background: linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.10) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(52, 199, 89, 0.3) !important;
                border-radius: 10px;
                box-shadow: 
                    0 2px 8px rgba(52, 199, 89, 0.08),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Faction Cards with Glass */
            .tm-faction-card {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.68) 0%, rgba(255, 255, 255, 0.58) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 18px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 6px 20px rgba(0, 0, 0, 0.08),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
                position: relative;
            }
            .tm-faction-card:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                transform: translateY(-4px) scale(1.03);
                box-shadow: 
                    0 12px 32px rgba(0, 0, 0, 0.12),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            .tm-faction-card.selected {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.20) 0%, rgba(0, 122, 255, 0.12) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1.5px solid rgba(0, 122, 255, 0.4) !important;
                box-shadow: 
                    0 8px 24px rgba(0, 122, 255, 0.2),
                    0 2px 4px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Editor Toolbars with Glass */
            #tm-scratchpad-toolbar {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.50) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(106%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(106%) !important;
                border-bottom: 0.5px solid rgba(0, 0, 0, 0.06) !important;
                box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Dropdown and Select Menus Enhancement */
            select option {
                background: rgba(255, 255, 255, 0.95) !important;
                color: #1c1c1e !important;
            }
            
            /* === INTENSIVE GLASS EFFECTS FOR ALL PAGE ELEMENTS === */
            
            /* Search Input with Ultra Glass */
            #ctlSearchFor1, input[name*="Search"], input[name*="search"] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.50) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 14px !important;
                padding: 10px 16px !important;
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset,
                    0 -1px 2px rgba(0, 0, 0, 0.02) inset;
            }
            
            /* Store/Location Dropdowns with Glass */
            #cbMyRecords, #cbDatePeriod, select[name*="cb"] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.50) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 14px !important;
                padding: 8px 12px !important;
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
                color: #1c1c1e !important;
                font-weight: 500;
            }
            
            /* Search Container with Glass Background */
            .rnr-b-search {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) brightness(108%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                padding: 12px 16px !important;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Logged In User Block with Glass */
            .rnr-b-loggedas, #login_block1 {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.45) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(108%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                padding: 10px 16px !important;
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.06),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Message Box with Intensive Glass */
            .rnr-b-message, .rnr-message {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.08) 100%) !important;
                backdrop-filter: blur(10px) saturate(145%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(145%) brightness(110%) !important;
                border: 1px solid rgba(0, 122, 255, 0.3) !important;
                border-radius: 16px;
                padding: 16px 20px !important;
                box-shadow: 
                    0 6px 20px rgba(0, 122, 255, 0.12),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset,
                    0 -1px 2px rgba(0, 0, 0, 0.02) inset;
                color: var(--tm-primary-color) !important;
                font-weight: 500;
            }
            
            /* iOS 26 Liquid Glass Dropdown Buttons */
            .dropdown button, .dropdown .btn, button.btn {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 12px !important;
                padding: 8px 16px !important;
                color: #1c1c1e !important;
                font-weight: 600;
                text-align: center !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                vertical-align: middle !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            .dropdown button:hover, .dropdown .btn:hover, button.btn:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.12) !important;
            }
            
            /* Status Badges Enhanced with Intense Glass */
            .statusbadge {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(110%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 10px !important;
                padding: 4px 10px !important;
                font-weight: 600 !important;
                box-shadow: 
                    0 3px 10px rgba(0, 0, 0, 0.08),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset,
                    0 -1px 2px rgba(0, 0, 0, 0.02) inset;
                display: inline-block;
                margin: 0 4px;
            }
            
            /* Regular Badges with Glass */
            .badge {
                background: linear-gradient(135deg, rgba(255, 59, 48, 0.18) 0%, rgba(255, 59, 48, 0.12) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                border: 0.5px solid rgba(255, 59, 48, 0.3) !important;
                border-radius: 12px !important;
                padding: 3px 8px !important;
                color: var(--tm-danger-color) !important;
                font-weight: 600 !important;
                box-shadow: 
                    0 2px 8px rgba(255, 59, 48, 0.15),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
                display: inline-block;
                margin-left: 6px;
            }
            .badge.blink {
                animation: ios-badge-pulse 1.5s ease-in-out infinite;
            }
            @keyframes ios-badge-pulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 
                        0 2px 8px rgba(255, 59, 48, 0.15),
                        0 1px 0 rgba(255, 255, 255, 0.2) inset;
                }
                50% { 
                    transform: scale(1.1);
                    box-shadow: 
                        0 4px 16px rgba(255, 59, 48, 0.35),
                        0 1px 2px rgba(255, 255, 255, 0.95) inset;
                }
            }
            
            /* Header and Footer Logo Areas with Glass */
            #head-outter, #head-outterwrap {
                background: linear-gradient(135deg, rgba(42, 42, 42, 0.85) 0%, rgba(42, 42, 42, 0.75) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) brightness(90%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(90%) !important;
                border-bottom: 0.5px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.15),
                    0 1px 0 rgba(255, 255, 255, 0.05) inset;
                opacity: 1 !important;
            }
            
            #footer-outter, #footer-outterwrap {
                background: linear-gradient(135deg, rgba(42, 42, 42, 0.90) 0%, rgba(42, 42, 42, 0.80) 100%) !important;
                backdrop-filter: blur(15px) brightness(95%) !important;
                -webkit-backdrop-filter: blur(15px) brightness(95%) !important;
                border-top: 0.5px solid rgba(255, 255, 255, 0.1) !important;
                box-shadow: 
                    0 -4px 16px rgba(0, 0, 0, 0.15),
                    0 1px 0 rgba(255, 255, 255, 0.05) inset;
                opacity: 1 !important;
            }
            
            /* Logo Images with Soft Glow */
            .header-logo, .footer-logo, h1.logo img {
                filter: drop-shadow(0 4px 12px rgba(255, 255, 255, 0.1)) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .header-logo:hover, .footer-logo:hover {
                filter: drop-shadow(0 6px 20px rgba(255, 255, 255, 0.2)) !important;
                transform: scale(1.02);
            }
            
            /* Menu Items Enhanced with Glass Layers */
            .rnr-b-vmenu ul li {
                position: relative;
            }
            .rnr-b-vmenu ul li::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100%;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
                border-radius: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            .rnr-b-vmenu ul li:hover::before {
                opacity: 1;
            }
            
            /* Menu Icons with Glass Backing */
            .menu-icon {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                padding: 6px;
                border-radius: 10px;
                border: 0.5px solid rgba(255, 255, 255, 0.3);
                box-shadow: 
                    0 2px 6px rgba(0, 0, 0, 0.04),
                    0 1px 0 rgba(255, 255, 255, 0.5) inset;
            }
            
            /* Horizontal Filler with Gradient */
            .rnr-hfiller {
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 255, 255, 0.1) 50%, 
                    transparent 100%) !important;
                height: 1px;
                margin: 0 10px;
            }
            
            /* Search Buttons Container with Glass */
            .rnr-b-search_buttons {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.35) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border-radius: 12px;
                padding: 8px !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            }
            
            /* Message Wrapper with Nested Glass */
            .rnr-cw-message {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.20) 100%) !important;
                backdrop-filter: blur(15px) saturate(170%) !important;
                -webkit-backdrop-filter: blur(15px) saturate(170%) !important;
                border-radius: 18px;
                padding: 12px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            }
            
            /* Grid Wrapper with Enhanced Glass */
            .rnr-cw-grid {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%) !important;
                backdrop-filter: blur(8px) saturate(175%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(175%) brightness(105%) !important;
                border-radius: 18px;
                padding: 16px;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.06),
                    0 1px 0 rgba(255, 255, 255, 0.6) inset;
            }
            
            /* Content Containers with Layered Glass */
            .rnr-cont, .rnr-c-grid {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.45) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(107%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(107%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 16px;
                box-shadow: 
                    0 6px 20px rgba(0, 0, 0, 0.07),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Logout and Action Buttons with Glass */
            #logoutButton1, a.rnr-button[id*="Button"], a.rnr-button[onclick*="location"] {
                background: linear-gradient(135deg, rgba(255, 59, 48, 0.12) 0%, rgba(255, 59, 48, 0.08) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(255, 59, 48, 0.3) !important;
                box-shadow: 
                    0 2px 8px rgba(255, 59, 48, 0.1),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
                color: var(--tm-danger-color) !important;
            }
            #logoutButton1:hover, a.rnr-button[id*="Button"]:hover {
                background: linear-gradient(135deg, rgba(255, 59, 48, 0.22) 0%, rgba(255, 59, 48, 0.15) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) !important;
                box-shadow: 
                    0 4px 14px rgba(255, 59, 48, 0.18),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Show All Button with Glass */
            #showAll1, a#showAll1 {
                background: linear-gradient(135deg, rgba(52, 199, 89, 0.12) 0%, rgba(52, 199, 89, 0.08) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(52, 199, 89, 0.3) !important;
                color: var(--tm-success-color) !important;
                box-shadow: 
                    0 2px 8px rgba(52, 199, 89, 0.1),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            #showAll1:hover {
                background: linear-gradient(135deg, rgba(52, 199, 89, 0.22) 0%, rgba(52, 199, 89, 0.15) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) !important;
                box-shadow: 
                    0 4px 14px rgba(52, 199, 89, 0.18),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Search Button with Magnifying Glass Icon */
            #searchButtTop1, a.rnr-button.img[data-icon="search"] {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.18) 0%, rgba(0, 122, 255, 0.12) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(0, 122, 255, 0.35) !important;
                border-radius: 12px !important;
                box-shadow: 
                    0 3px 12px rgba(0, 122, 255, 0.15),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
                padding: 8px 12px !important;
            }
            #searchButtTop1:hover {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.28) 0%, rgba(0, 122, 255, 0.20) 100%) !important;
                backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(150%) brightness(110%) !important;
                transform: scale(1.05);
                box-shadow: 
                    0 6px 18px rgba(0, 122, 255, 0.25),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Undermenu with Glass */
            .rnr-s-undermenu, .rnr-cw-hmenu {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.30) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) brightness(106%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) brightness(106%) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 16px;
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.06),
                    0 1px 0 rgba(255, 255, 255, 0.15) inset;
            }
            
            /* Accessibility Links with Glass */
            .rnr-s508, a.rnr-s508 {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.60) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 10px;
                padding: 6px 12px !important;
                color: var(--tm-primary-color) !important;
                box-shadow: 
                    0 2px 8px rgba(0, 0, 0, 0.06),
                    0 1px 0 rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Table Cells with Refined Glass */
            .rnr-gridtable tbody tr td {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.35) 100%) !important;
                backdrop-filter: blur(18px) saturate(175%) !important;
                -webkit-backdrop-filter: blur(18px) saturate(175%) !important;
                border: 0.5px solid rgba(0, 0, 0, 0.03) !important;
            }
            
            /* Menu Leaf Items with Enhanced Glass */
            .menuLeaf > div, .menuGroup > div {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.38) 100%) !important;
                backdrop-filter: blur(22px) saturate(140%) brightness(106%) !important;
                -webkit-backdrop-filter: blur(22px) saturate(140%) brightness(106%) !important;
                border: 0.5px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 13px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 
                    0 3px 10px rgba(0, 0, 0, 0.04),
                    0 1px 0 rgba(255, 255, 255, 0.15) inset;
            }
            .menuLeaf:hover > div, .menuGroup:hover > div {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.60) 100%) !important;
                backdrop-filter: blur(32px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(32px) saturate(150%) brightness(110%) !important;
                transform: translateX(6px) scale(1.02);
                box-shadow: 
                    0 6px 18px rgba(0, 0, 0, 0.08),
                    0 1px 2px rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Submenu Items with Nested Glass */
            .rnr-b-vmenu ul ul li {
                margin-left: 8px;
            }
            .rnr-b-vmenu ul ul li > div {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.30) 100%) !important;
                backdrop-filter: blur(18px) saturate(175%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(18px) saturate(175%) brightness(105%) !important;
            }
            
            /* Links in Menu with Text Shadow */
            .rnr-b-vmenu a, .rnr-b-hmenu a {
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .rnr-b-vmenu a:hover, .rnr-b-hmenu a:hover {
                text-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
            }
            
            /* User Name Display with Highlight */
            .rnr-b-loggedas b, #login_block1 b {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.08) 100%);
                backdrop-filter: blur(10px);
                padding: 2px 8px;
                border-radius: 8px;
                color: var(--tm-primary-color) !important;
                font-weight: 600 !important;
                box-shadow: 
                    0 1px 4px rgba(0, 122, 255, 0.1),
                    0 1px 0 rgba(255, 255, 255, 0.15) inset;
            }
            
            /* Powered By Link with Glass Effect */
            #footer-outterwrap a, #footer-outterwrap a span {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.05) 100%);
                backdrop-filter: blur(10px);
                padding: 2px 8px;
                border-radius: 8px;
                border: 0.5px solid rgba(255, 255, 255, 0.2);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: inline-block;
            }
            #footer-outterwrap a:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.12) 100%);
                backdrop-filter: blur(8px) saturate(140%);
                -webkit-backdrop-filter: blur(8px) saturate(140%);
                transform: translateY(-2px);
                box-shadow: 
                    0 4px 12px rgba(255, 255, 255, 0.15),
                    0 1px 0 rgba(255, 255, 255, 0.5) inset;
            }
            
            /* Table Headers with Enhanced Glass */
            .rnr-gridtable thead, .rnr-toprow {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
                backdrop-filter: blur(12px) saturate(185%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(185%) brightness(110%) !important;
                border-bottom: 1px solid rgba(0, 122, 255, 0.15) !important;
                box-shadow: 
                    0 2px 8px rgba(0, 0, 0, 0.05),
                    0 1px 0 rgba(255, 255, 255, 0.95) inset;
            }
            
            /* Empty Table Body with Glass Message */
            .rnr-gridtable tbody:empty::after {
                content: "Φόρτωση δεδομένων...";
                display: block;
                text-align: center;
                padding: 40px;
                color: #8e8e93;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%);
                backdrop-filter: blur(8px) saturate(140%);
                border-radius: 12px;
                margin: 20px;
                font-weight: 500;
            }
            
            /* Specific Store Connection Display with Glass */
            #footer-outterwrap .dropdown button[style*="cursors"] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
                backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) brightness(105%) !important;
                color: white !important;
                border: 0.5px solid rgba(255, 255, 255, 0.3) !important;
                border-radius: 12px !important;
                padding: 8px 16px !important;
                font-weight: 600;
                box-shadow: 
                    0 3px 10px rgba(0, 0, 0, 0.1),
                    0 1px 2px rgba(255, 255, 255, 0.2) inset;
            }
            
            /* Center and Left Containers */
            .rnr-center, .rnr-left, .rnr-right {
                position: relative;
            }
            .rnr-center::before, .rnr-left::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at 50% 50%, rgba(0, 122, 255, 0.02) 0%, transparent 60%);
                pointer-events: none;
                border-radius: 20px;
            }
            
            /* Wrapper Containers with Subtle Glass */
            .rnr-wrapper, .rnr-b-wrapper {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
                backdrop-filter: blur(15px) saturate(170%) !important;
                -webkit-backdrop-filter: blur(15px) saturate(170%) !important;
                border-radius: 14px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            }
            
            /* Page Background Enhancement */
            .rnr-page {
                position: relative;
            }
            .rnr-page::after {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at 30% 40%, rgba(0, 122, 255, 0.015) 0%, transparent 50%),
                            radial-gradient(ellipse at 70% 60%, rgba(52, 199, 89, 0.01) 0%, transparent 50%);
                pointer-events: none;
                z-index: -1;
            }`
    },
    'sunset_glass': {
        name: 'Sunset Glass', icon: '🌅', cost: 1500, type: 'theme',
        colors: {
            '--tm-primary-color': '#fb923c',      // Vibrant Orange
            '--tm-primary-hover': '#fdba74',      // Light Orange
            '--tm-secondary-color': '#f97316',    // Deep Orange
            '--tm-secondary-hover': '#fb923c',    // Medium Orange
            '--tm-success-color': '#fbbf24',      // Golden Yellow
            '--tm-success-hover': '#fcd34d',      // Light Gold
            '--tm-danger-color': '#ef4444',       // Red
            '--tm-danger-hover': '#f87171',       // Light Red
            '--tm-warning-color': '#f59e0b',      // Amber
            '--tm-warning-hover': '#fbbf24',      // Light Amber
            '--tm-info-color': '#ec4899',         // Magenta
            '--tm-info-hover': '#f472b6',         // Light Magenta
            '--tm-dark-color': '#1c0a00',         // Deep Brown
            '--tm-dark-hover': '#2d1508',         // Dark Brown

            '--tm-shop-item-bg': 'rgba(28, 10, 0, 0.85)',
            '--tm-shop-item-border': 'rgba(251, 146, 60, 0.3)',
            '--tm-shop-item-hover-bg': 'rgba(45, 21, 8, 0.95)',
            '--tm-shop-item-owned-bg': 'rgba(251, 146, 60, 0.15)',
        },
        pageStyles: `/* Sunset Glass Theme - Flowing Lava with Warm Vibrant Colors */
            
            /* Flowing lava wave animations */
            @keyframes lava-flow {
                0% { transform: translateX(-30%) translateY(0%) scale(1); opacity: 0.7; }
                50% { transform: translateX(0%) translateY(-3%) scale(1.08); opacity: 0.9; }
                100% { transform: translateX(30%) translateY(0%) scale(1); opacity: 0.7; }
            }
            
            @keyframes lava-flow-2 {
                0% { transform: translateX(30%) translateY(0%) scale(1); opacity: 0.6; }
                50% { transform: translateX(0%) translateY(3%) scale(1.12); opacity: 0.8; }
                100% { transform: translateX(-30%) translateY(0%) scale(1); opacity: 0.6; }
            }
            
            @keyframes ember-glow {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(251, 146, 60, 0.5), 0 0 40px rgba(249, 115, 22, 0.3); 
                    filter: brightness(1);
                }
                50% { 
                    box-shadow: 0 0 35px rgba(251, 146, 60, 0.7), 0 0 70px rgba(249, 115, 22, 0.5); 
                    filter: brightness(1.15);
                }
            }
            
            @keyframes fire-shimmer {
                0% { transform: translateY(-100%) rotate(-10deg); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateY(200%) rotate(10deg); opacity: 0; }
            }
            
            @keyframes heat-wave {
                0%, 100% { transform: translateY(0px) scaleX(1); }
                50% { transform: translateY(-8px) scaleX(1.02); }
            }
            
            @keyframes ember-rise {
                0% { transform: translateY(20px) scale(0.8); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 0.8; }
                100% { transform: translateY(-100px) scale(1.2); opacity: 0; }
            }
            
            /* Warm sunset gradient background */
            body { 
                background: linear-gradient(180deg, #1a0505 0%, #2d0a0a 20%, #4a1410 40%, #2d0a0a 70%, #1a0505 100%) !important;
                background-attachment: fixed;
                position: relative;
                overflow-x: hidden;
            }
            
            /* Flowing lava waves - Layer 1 (Orange/Red) */
            body::before { 
                content: "";
                position: fixed;
                top: -10%;
                left: 0;
                width: 150%;
                height: 120%;
                z-index: -2;
                background: 
                    radial-gradient(ellipse 800px 350px at 15% 25%, rgba(251, 146, 60, 0.25) 0%, transparent 55%),
                    radial-gradient(ellipse 700px 300px at 75% 45%, rgba(249, 115, 22, 0.22) 0%, transparent 52%),
                    radial-gradient(ellipse 750px 320px at 35% 75%, rgba(239, 68, 68, 0.2) 0%, transparent 50%);
                animation: lava-flow 18s ease-in-out infinite;
                pointer-events: none;
                filter: blur(70px);
            }
            
            /* Flowing lava waves - Layer 2 (Gold/Magenta) */
            body::after {
                content: "";
                position: fixed;
                top: -10%;
                left: 0;
                width: 150%;
                height: 120%;
                z-index: -1;
                background: 
                    radial-gradient(ellipse 750px 300px at 85% 35%, rgba(251, 191, 36, 0.18) 0%, transparent 52%),
                    radial-gradient(ellipse 680px 280px at 25% 65%, rgba(236, 72, 153, 0.16) 0%, transparent 50%),
                    radial-gradient(ellipse 720px 310px at 55% 90%, rgba(245, 158, 11, 0.14) 0%, transparent 48%);
                animation: lava-flow-2 22s ease-in-out infinite reverse;
                pointer-events: none;
                filter: blur(75px);
            }
            
            /* Frosted glass panels with sunset tint */
            .rnr-page, .rnr-middle, .rnr-left, .rnr-center, .rnr-right, .rnr-s-fields, .rnr-s-form, 
            .rnr-s-1, .rnr-s-2, .rnr-s-3, .rnr-s-empty, .rnr-s-hmenu, .rnr-s-undermenu, 
            .rnr-c-fields, .rnr-c-form, .rnr-c-1, .rnr-c-2, .rnr-c-3, .pag_n, .rnr-c-edit, 
            .rnr-cw-edit, .rnr-cw-recordcontrols, .rnr-c-recordcontrols, .rnr-scrollgrid-inner, 
            .fieldGrid, .rnr-pagewrapper, .rnr-c-1, .rnr-cw-1, .rnr-brickcontents, 
            .rnr-b-wrapper, .rnr-wrapper, .rnr-cbw-fields, .rnr-b-editfields2_atop, 
            .rnr-b-editheader, .rnr-b-editbuttons {
                background: transparent !important;
                color: #fed7aa !important;
            }
            
            /* Main frosted glass containers with sunset glow */
            .rnr-top, #head-outter, #footer-outter, .rnr-cw-hmenu, .rnr-cw-pagination, 
            .rnr-cw-pagination_bottom, .rnr-s-menu, .rnr-s-grid, .rnr-c-hmenu, 
            .rnr-c-pagination, .rnr-c-pagination_bottom { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.85) 0%, rgba(45, 21, 8, 0.9) 100%) !important;
                backdrop-filter: blur(12px) saturate(150%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(150%) !important;
                border: 1px solid rgba(251, 146, 60, 0.3) !important;
                border-radius: 16px;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(251, 146, 60, 0.2) inset,
                    0 0 25px rgba(251, 146, 60, 0.1) !important;
                position: relative;
                will-change: transform;
                transform: translate3d(0, 0, 0);
                overflow: hidden;
            }
            
            /* Fire shimmer effect on panels */
            .rnr-top::before, #head-outter::before {
                content: "";
                position: absolute;
                top: -100%;
                left: 0;
                width: 100%;
                height: 200%;
                background: linear-gradient(
                    0deg,
                    transparent 30%,
                    rgba(251, 146, 60, 0.25) 50%,
                    rgba(239, 68, 68, 0.15) 60%,
                    transparent 70%
                );
                animation: fire-shimmer 7s ease-in-out infinite;
                pointer-events: none;
            }
            
            /* Lava gradient overlay on panels */
            .rnr-top::after, #head-outter::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 40%;
                background: linear-gradient(180deg, rgba(251, 146, 60, 0.18) 0%, rgba(249, 115, 22, 0.08) 50%, transparent 100%);
                border-radius: 16px 16px 0 0;
                pointer-events: none;
            }
            
            /* Typography */
            h1, h2, h3, h4, h5, h6, .pagetitle { 
                color: #fed7aa !important;
                text-shadow: 0 0 20px rgba(251, 146, 60, 0.5) !important;
                font-weight: 600;
            }
            
            /* Links */
            a, a:visited, .rnr-orderlink { 
                color: var(--tm-primary-color) !important;
                text-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
                text-decoration: none !important;
                transition: all 0.3s ease;
            }
            a:hover, .rnr-orderlink:hover { 
                color: var(--tm-primary-hover) !important;
                text-shadow: 0 0 20px rgba(251, 146, 60, 0.8);
            }
            
            /* Form elements with sunset glass */
            input, select, textarea, .form-control { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.7) 0%, rgba(45, 21, 8, 0.8) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                color: #fed7aa !important;
                border: 1px solid rgba(251, 146, 60, 0.4) !important;
                border-radius: 12px !important;
                padding: 10px 14px !important;
                box-shadow: 
                    0 4px 16px rgba(0, 0, 0, 0.3), 
                    0 0 0 1px rgba(251, 146, 60, 0.15) inset,
                    0 0 10px rgba(251, 146, 60, 0.05) !important;
                transition: all 0.3s ease;
            }
            input:focus, select:focus, textarea:focus { 
                background: linear-gradient(135deg, rgba(45, 21, 8, 0.85) 0%, rgba(60, 28, 12, 0.9) 100%) !important;
                border: 1px solid rgba(251, 146, 60, 0.7) !important;
                box-shadow: 
                    0 0 0 4px rgba(251, 146, 60, 0.2), 
                    0 4px 20px rgba(251, 146, 60, 0.4),
                    0 0 30px rgba(251, 146, 60, 0.2) !important;
                outline: none !important;
                transform: translateY(-2px);
            }
            
            /* Glowing buttons */
            .rnr-button, .MyMANAGERWhite_label1 .rnr-button.rnr-button { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(251, 146, 60, 0.4) !important;
                border-radius: 12px !important;
                padding: 10px 18px !important;
                font-weight: 600 !important;
                text-shadow: 0 0 10px rgba(251, 146, 60, 0.5) !important;
                transition: all 0.3s ease;
                box-shadow: 0 4px 16px rgba(251, 146, 60, 0.2) !important;
                position: relative;
                overflow: hidden;
            }
            .rnr-button:hover, .MyMANAGERWhite_label1 .rnr-button:hover { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.25) 100%) !important;
                border: 1px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 0 30px rgba(251, 146, 60, 0.5), 0 6px 20px rgba(251, 146, 60, 0.3) !important;
                transform: translateY(-2px);
                color: var(--tm-primary-hover) !important;
                text-shadow: 0 0 15px rgba(251, 146, 60, 0.8) !important;
            }
            
            /* Menu items with ember glow */
            .rnr-b-vmenu li > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *, 
            .rnr-b-vmenu_undermenu > ul > li > a { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.7) 0%, rgba(45, 21, 8, 0.8) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.25) !important;
                color: #fed7aa !important;
                border-radius: 10px;
                margin: 4px 0;
                transition: all 0.3s ease;
            }
            .rnr-b-vmenu li:hover > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *:hover { 
                background: linear-gradient(135deg, rgba(60, 28, 12, 0.85) 0%, rgba(75, 35, 15, 0.9) 100%) !important;
                border: 1px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 0 25px rgba(251, 146, 60, 0.4);
                transform: translateX(8px);
            }
            .rnr-b-vmenu li.current > div, .MyMANAGERWhite_label1 .rnr-b-vmenu.simple.main > *.current { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.35) 0%, rgba(249, 115, 22, 0.25) 100%) !important;
                border: 1px solid rgba(251, 146, 60, 0.7) !important;
                box-shadow: 0 0 30px rgba(251, 146, 60, 0.5);
                animation: ember-glow 3s ease-in-out infinite;
            }
            
            /* Glowing grid tables */
            .rnr-gridtable, .MyMANAGERWhite_label1.rnr-s-grid > table { 
                border: 1px solid rgba(251, 146, 60, 0.3) !important;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(251, 146, 60, 0.1);
            }
            .rnr-c-grid > .rnr-b-grid > .rnr-gridtable > tbody > tr > td { 
                background: rgba(28, 10, 0, 0.5) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
                border-bottom: 1px solid rgba(251, 146, 60, 0.15) !important;
            }
            .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-row:nth-last-child(2n+1) > td { 
                background: rgba(45, 21, 8, 0.6) !important;
                backdrop-filter: blur(8px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(8px) saturate(140%) !important;
            }
            .MyMANAGERWhite_label1.rnr-s-grid > table.hoverable > * > .rnr-row:hover > td { 
                background: linear-gradient(90deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%) !important;
                box-shadow: 0 0 15px rgba(251, 146, 60, 0.2);
                transform: scale(1.01);
            }
            
            /* Table headers with lava glow */
            .rnr-c-grid.rnr-b-grid, .MyMANAGERWhite_label1.rnr-s-grid > table > * > .rnr-toprow > th { 
                background: linear-gradient(135deg, rgba(60, 28, 12, 0.85) 0%, rgba(45, 21, 8, 0.9) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                color: var(--tm-primary-color) !important;
                font-weight: 600;
                text-shadow: 0 0 15px rgba(251, 146, 60, 0.7);
                border-bottom: 2px solid rgba(251, 146, 60, 0.5) !important;
            }
            
            /* Glowing badges */
            .badge, .statusbadge { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.2) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                color: #fed7aa !important;
                border: 1px solid rgba(251, 146, 60, 0.4) !important;
                border-radius: 8px;
                padding: 4px 10px;
                box-shadow: 0 0 15px rgba(251, 146, 60, 0.3);
                font-weight: 600;
            }
            
            /* sunset modals */
            .tm-modal-overlay {
                background: rgba(0, 0, 0, 0.8) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }
            .tm-modal-content { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.95) 0%, rgba(45, 21, 8, 0.98) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                color: #fed7aa !important;
                border: 1px solid rgba(251, 146, 60, 0.5) !important;
                border-radius: 20px !important;
                box-shadow: 
                    0 24px 64px rgba(0, 0, 0, 0.7),
                    0 0 50px rgba(251, 146, 60, 0.3),
                    0 0 0 1px rgba(251, 146, 60, 0.25) inset !important;
                position: relative;
                overflow: hidden;
            }
            .tm-modal-content::before {
                content: "";
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(251, 146, 60, 0.2) 50%,
                    transparent 70%
                );
                animation: fire-shimmer 5s ease-in-out infinite;
                pointer-events: none;
            }
            .tm-modal-content::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 30%;
                background: linear-gradient(180deg, rgba(251, 146, 60, 0.18) 0%, transparent 100%);
                border-radius: 20px 20px 0 0;
                pointer-events: none;
            }
            
            /* Shop items with sunset glow */
            .tm-shop-item { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.85) 0%, rgba(45, 21, 8, 0.9) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.35) !important;
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 25px rgba(251, 146, 60, 0.15);
                transition: all 0.3s ease;
                animation: heat-wave 4s ease-in-out infinite;
                position: relative;
                overflow: hidden;
            }
            .tm-shop-item::before {
                content: "";
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(251, 146, 60, 0.15) 50%,
                    transparent 70%
                );
                animation: fire-shimmer 4s ease-in-out infinite;
                pointer-events: none;
            }
            .tm-shop-item:hover {
                border: 1px solid rgba(251, 146, 60, 0.7) !important;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(251, 146, 60, 0.4);
                transform: translateY(-8px) scale(1.02);
                animation: ember-glow 2s ease-in-out infinite;
            }
            .tm-shop-item.owned { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%) !important;
                border: 1px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 8px 24px rgba(251, 146, 60, 0.25), 0 0 30px rgba(251, 146, 60, 0.3);
            }
            
            /* Footer elements with sunset style */
            #tm-xp-bar-container, #tm-coin-balance, #tm-daily-dashboard-widget, 
            #tm-weather-widget, #tm-refresh-timer-container, #tm-settings-btn, #tm-notification-bell-btn {
                background: linear-gradient(135deg, rgba(45, 21, 8, 0.85) 0%, rgba(28, 10, 0, 0.9) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.45) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 146, 60, 0.25) !important;
                color: #fed7aa !important;
                position: relative;
                overflow: hidden;
            }
            #tm-xp-bar-container::before, #tm-coin-balance::before, #tm-daily-dashboard-widget::before,
            #tm-weather-widget::before, #tm-refresh-timer-container::before {
                content: "";
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.2) 50%, transparent 100%);
                animation: fire-shimmer 3s ease-in-out infinite;
                pointer-events: none;
            }
            #tm-xp-bar-container:hover, #tm-coin-balance:hover, #tm-daily-dashboard-widget:hover,
            #tm-weather-widget:hover, #tm-refresh-timer-container:hover, #tm-settings-btn:hover, #tm-notification-bell-btn:hover {
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 35px rgba(251, 146, 60, 0.5) !important;
                border: 1px solid rgba(251, 146, 60, 0.7) !important;
                animation: ember-glow 2s ease-in-out infinite;
            }
            #tm-xp-bar-container *, #tm-coin-balance *, #tm-daily-dashboard-widget *, 
            #tm-weather-widget *, #tm-refresh-timer-container *, .tm-buff-timer * {
                color: #fed7aa !important;
                text-shadow: 0 0 10px rgba(251, 146, 60, 0.6);
            }
            #tm-user-title-text {
                color: var(--tm-primary-color) !important;
                text-shadow: 0 0 20px rgba(251, 146, 60, 1), 0 0 40px rgba(251, 146, 60, 0.5) !important;
            }
            
            /* XP Bar lava gradient */
            #tm-xp-bar-fill {
                background: linear-gradient(90deg, 
                    rgba(251, 146, 60, 1) 0%, 
                    rgba(249, 115, 22, 0.95) 25%,
                    rgba(239, 68, 68, 0.9) 50%,
                    rgba(251, 191, 36, 0.95) 75%,
                    rgba(236, 72, 153, 0.9) 100%) !important;
                box-shadow: 0 0 25px rgba(251, 146, 60, 0.7), 0 0 50px rgba(239, 68, 68, 0.4);
                animation: ember-glow 3s ease-in-out infinite;
                position: relative;
            }
            
            /* Buff timers with ember glow */
            .tm-buff-timer {
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 191, 36, 0.5) !important;
                box-shadow: 0 0 20px rgba(251, 191, 36, 0.4) !important;
                animation: ember-glow 4s ease-in-out infinite;
            }
            
            /* Feature buttons */
            #tm-footer-controls-left button, #tm-footer-controls-right button {
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.4) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 15px rgba(251, 146, 60, 0.2) !important;
                color: #fed7aa !important;
            }
            #tm-footer-controls-left button:hover, #tm-footer-controls-right button:hover {
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 25px rgba(251, 146, 60, 0.4) !important;
            }
            
            /* Mascot panel with sunset */
            #tm-mascot-interaction-panel { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.95) 0%, rgba(45, 21, 8, 0.98) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(251, 146, 60, 0.5) !important;
                box-shadow: 0 0 40px rgba(251, 146, 60, 0.4), 0 20px 60px rgba(0, 0, 0, 0.5);
                position: relative;
                overflow: hidden;
            }
            #tm-mascot-interaction-panel::before {
                content: "";
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(251, 146, 60, 0.15) 50%,
                    transparent 70%
                );
                animation: fire-shimmer 5s ease-in-out infinite;
                pointer-events: none;
            }
            
            /* sunset scrollbar */
            ::-webkit-scrollbar { width: 12px; background: rgba(28, 10, 0, 0.5); }
            ::-webkit-scrollbar-track { background: rgba(45, 21, 8, 0.3); border-radius: 10px; }
            ::-webkit-scrollbar-thumb { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.6) 0%, rgba(249, 115, 22, 0.5) 100%);
                border-radius: 10px;
                border: 2px solid rgba(28, 10, 0, 0.5);
                box-shadow: 0 0 10px rgba(251, 146, 60, 0.3);
            }
            ::-webkit-scrollbar-thumb:hover { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.8) 0%, rgba(249, 115, 22, 0.7) 100%);
                box-shadow: 0 0 20px rgba(251, 146, 60, 0.6);
            }
            
            /* jConfirm with sunset */
            .jconfirm { 
                background: rgba(0, 0, 0, 0.8) !important;
                backdrop-filter: blur(10px) !important;
            }
            .jconfirm-box { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.95) 0%, rgba(45, 21, 8, 0.98) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.5) !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 50px rgba(251, 146, 60, 0.3);
            }
            .jconfirm-title { 
                color: var(--tm-primary-color) !important; 
                text-shadow: 0 0 20px rgba(251, 146, 60, 1), 0 0 40px rgba(251, 146, 60, 0.5);
            }
            .jconfirm-content { color: #fed7aa !important; }
            
            /* Dropdowns with sunset */
            .dropdown-menu { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.95) 0%, rgba(45, 21, 8, 0.98) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.4) !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 146, 60, 0.2);
            }
            .dropdown-item { color: #fed7aa !important; }
            .dropdown-item:hover { 
                background: linear-gradient(90deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%) !important;
                color: var(--tm-primary-hover) !important;
                box-shadow: 0 0 15px rgba(251, 146, 60, 0.3);
            }
            
            /* Tooltips with sunset */
            .tooltip, .popover { 
                background: linear-gradient(135deg, rgba(45, 21, 8, 0.95) 0%, rgba(28, 10, 0, 0.98) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.5) !important;
                color: #fed7aa !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 146, 60, 0.3);
            }
            
            /* Placeholder text */
            ::placeholder { color: rgba(209, 250, 229, 0.4) !important; }
            
            /* Select options */
            select option { 
                background: rgba(45, 21, 8, 0.98) !important;
                color: #fed7aa !important;
            }
            
            /* UI widgets with sunset */
            .ui-widget-content, .ui-dialog, .ui-datepicker { 
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.95) 0%, rgba(45, 21, 8, 0.98) 100%) !important;
                backdrop-filter: blur(12px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
                color: #fed7aa !important;
                border: 1px solid rgba(251, 146, 60, 0.4) !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(251, 146, 60, 0.2);
            }
            .ui-state-active, .ui-widget-header { 
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.35) 0%, rgba(249, 115, 22, 0.25) 100%) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
            }
            
            /* Contrast fixes */
            #tm-notification-unread-count { 
                background: linear-gradient(135deg, #f87171 0%, #ef4444 100%) !important;
                color: #ffffff !important;
                box-shadow: 0 0 15px rgba(248, 113, 113, 0.6);
            }
            
            /* Game overlays with sunset */
            #tm-memory-game-overlay, #tm-game-overlay { 
                background: rgba(28, 10, 0, 0.9) !important;
                backdrop-filter: blur(15px) !important;
            }
            
            /* Notification panel with sunset */
            #tm-notification-panel {
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.95) 0%, rgba(45, 21, 8, 0.98) 100%) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(251, 146, 60, 0.5) !important;
                box-shadow: 0 0 40px rgba(251, 146, 60, 0.4);
            }
            
            /* Level up overlay with sunset glow */
            .tm-level-up-content {
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%) !important;
                backdrop-filter: blur(18px) saturate(150%) !important;
                -webkit-backdrop-filter: blur(18px) saturate(150%) !important;
                border: 2px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 0 80px rgba(251, 146, 60, 0.8), 0 0 120px rgba(251, 146, 60, 0.4);
                animation: ember-glow 2s ease-in-out infinite;
            }
            
            /* Talent/Quest items with sunset */
            .tm-talent-item, .tm-quest-item, .tm-title-item {
                background: linear-gradient(135deg, rgba(28, 10, 0, 0.8) 0%, rgba(45, 21, 8, 0.85) 100%) !important;
                backdrop-filter: blur(10px) saturate(140%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
                border: 1px solid rgba(251, 146, 60, 0.35) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 15px rgba(251, 146, 60, 0.1);
                transition: all 0.3s ease;
            }
            .tm-talent-item:hover, .tm-quest-item:hover, .tm-title-item:hover {
                border: 1px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 0 30px rgba(251, 146, 60, 0.4);
                transform: translateY(-3px);
            }
            .tm-talent-item.unlocked, .tm-title-item.unlocked {
                background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.25) 100%) !important;
                border: 1px solid rgba(251, 146, 60, 0.6) !important;
                box-shadow: 0 0 35px rgba(251, 146, 60, 0.5);
                animation: ember-glow 4s ease-in-out infinite;
            }`
    },
};








