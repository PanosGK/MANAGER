
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
