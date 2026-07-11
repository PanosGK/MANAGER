// ==UserScript==
// @name         MyManager Styles
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Global styles for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_addStyle
// ==/UserScript==


(function() {
    'use strict';

    // ===================================================================
    // === 1. STYLING (ALL FEATURES)
    // ===================================================================
    function addGlobalStyles() {
        if (window.__tmGlobalStylesApplied) return;
        window.__tmGlobalStylesApplied = true;
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
            /* Notification center: centered modal (appended to body) */
            #tm-notification-backdrop { pointer-events: auto; }
            #tm-notification-panel {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: calc(100vw - 32px);
                max-width: 440px;
                max-height: min(85vh, calc(100vh - 32px));
                background: var(--tm-dark-color) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid var(--tm-primary-color) !important;
                border-radius: 12px;
                box-shadow: 0 12px 40px rgba(0,0,0,0.45);
                z-index: 2147482999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-sizing: border-box;
            }
            .tm-notification-header {
                padding: 10px 12px 10px 15px;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                background: var(--tm-dark-hover) !important;
                color: var(--tm-primary-color) !important;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            .tm-notification-header h4 { margin: 0; font-size: 16px; color: var(--tm-primary-color) !important; flex: 1; min-width: 0; }
            .tm-notification-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            .tm-notification-header-actions button {
                background: none;
                border: none;
                color: var(--tm-primary-color) !important;
                cursor: pointer;
                font-size: 12px;
                text-decoration: underline;
                padding: 4px 6px;
            }
            #tm-notification-panel-close {
                font-size: 22px !important;
                line-height: 1;
                text-decoration: none !important;
                opacity: 0.85;
            }
            #tm-notification-panel-close:hover { opacity: 1; }
            #tm-notification-list { flex-grow: 1; overflow-y: auto; padding: 8px; background: var(--tm-dark-color) !important; }
            .tm-notification-item {
                display: flex; gap: 10px; padding: 10px;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                color: var(--tm-primary-color) !important;
                cursor: pointer;
            }
            .tm-notification-item:last-child { border-bottom: none; }
            .tm-notification-item.unread { background-color: var(--tm-shop-item-owned-bg) !important; }
            .tm-notification-icon { font-size: 18px; flex-shrink: 0; color: var(--tm-primary-color) !important; }
            .tm-notification-content { flex-grow: 1; }
            .tm-notification-message { font-size: 14px; color: var(--tm-primary-color) !important; }
            .tm-notification-timestamp { font-size: 11px; color: var(--tm-secondary-hover) !important; margin-top: 4px; }
            #tm-notification-empty-state { text-align: center; color: var(--tm-secondary-hover) !important; padding: 40px 20px; }
            .tm-notification-tabs {
                display: flex;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                background: var(--tm-dark-hover) !important;
            }
            .tm-notif-tab {
                flex: 1;
                padding: 10px 12px;
                border: none;
                background: transparent;
                color: var(--tm-secondary-hover) !important;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                border-bottom: 2px solid transparent;
                transition: color 0.15s, border-color 0.15s;
            }
            .tm-notif-tab:hover { color: var(--tm-primary-color) !important; }
            .tm-notif-tab.active {
                color: var(--tm-primary-color) !important;
                border-bottom-color: var(--tm-info-color);
            }
            .tm-notification-tab-panel {
                flex-grow: 1;
                overflow-y: auto;
                display: none;
                background: var(--tm-dark-color) !important;
            }
            .tm-notification-tab-panel.active { display: block; }
            #tm-notification-list, #tm-active-alerts-list { padding: 8px; }
            .tm-alert-item {
                display: flex;
                gap: 10px;
                padding: 12px 10px;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                align-items: flex-start;
            }
            .tm-alert-item:last-child { border-bottom: none; }
            .tm-alert-item-icon { font-size: 20px; flex-shrink: 0; line-height: 1.2; }
            .tm-alert-item-body { flex-grow: 1; min-width: 0; }
            .tm-alert-item-title {
                font-size: 14px;
                font-weight: 700;
                color: var(--tm-primary-color) !important;
                margin-bottom: 4px;
            }
            .tm-alert-item-meta {
                font-size: 11px;
                color: var(--tm-secondary-hover) !important;
                margin-bottom: 4px;
            }
            .tm-alert-item-message {
                font-size: 12px;
                color: var(--tm-primary-color) !important;
                opacity: 0.9;
                line-height: 1.35;
                word-break: break-word;
            }
            .tm-alert-item-actions {
                display: flex;
                flex-direction: column;
                gap: 6px;
                flex-shrink: 0;
            }
            .tm-alert-cancel-btn {
                padding: 5px 10px;
                border-radius: 8px;
                border: 1px solid rgba(239, 68, 68, 0.45);
                background: rgba(239, 68, 68, 0.12);
                color: #f87171 !important;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }
            .tm-alert-cancel-btn:hover { background: rgba(239, 68, 68, 0.22); }
            .tm-alert-open-link {
                font-size: 11px;
                color: var(--tm-info-color) !important;
                text-decoration: none;
                white-space: nowrap;
            }
            .tm-alert-open-link:hover { text-decoration: underline; }
            #tm-alerts-tab-count {
                display: inline-block;
                min-width: 18px;
                padding: 0 5px;
                margin-left: 4px;
                border-radius: 10px;
                background: var(--tm-danger-color);
                color: white;
                font-size: 10px;
                font-weight: 700;
                line-height: 16px;
                text-align: center;
            }
            #tm-alerts-tab-count:empty { display: none; }

            /* Recent Repairs popup only: theme-aware (button appearance unchanged). No black text, no purple. */
            #tm-recent-repairs-menu {
                background: var(--tm-dark-color) !important;
                border: 1px solid var(--tm-primary-color) !important;
                
            }
            #tm-recent-repairs-menu,
            #tm-recent-repairs-menu * {
                color: var(--tm-primary-color) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repairs-header {
                background: var(--tm-dark-color) !important;
                color: var(--tm-primary-color) !important;
                border-radius: 8px 8px 0 0;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                padding: 12px;
                font-weight: bold;
            }
            #tm-recent-repairs-menu .tm-recent-repairs-empty {
                color: var(--tm-secondary-hover) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repair-item {
                border-bottom-color: var(--tm-shop-item-border) !important;
                color: var(--tm-primary-color) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repair-item:hover {
                background: var(--tm-shop-item-owned-bg) !important;
                transform: translateX(4px);
            }
            #tm-recent-repairs-menu .tm-recent-repair-title {
                color: var(--tm-primary-color) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repair-meta {
                color: var(--tm-secondary-hover) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repairs-footer {
                border-top-color: var(--tm-shop-item-border) !important;
                background: var(--tm-dark-color) !important;
            }
            #tm-recent-repairs-menu #tm-clear-recent-repairs {
                background: var(--tm-danger-color) !important;
                color: var(--tm-text-on-primary, white) !important;
                border: none !important;
            }

            /* Price transfer button: theme-aware */
            #tm-price-transfer-btn {
                background: var(--tm-shop-item-bg) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid var(--tm-primary-color) !important;
                border-radius: 3px;
                padding: 3px 8px;
                margin-left: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.15s ease;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            #tm-price-transfer-btn:hover {
                background: var(--tm-primary-color) !important;
                color: var(--tm-text-on-primary, var(--tm-dark-hover)) !important;
                border-color: var(--tm-primary-hover) !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            #tm-price-transfer-btn.tm-price-transfer-success {
                background: var(--tm-success-color) !important;
                border-color: var(--tm-success-color) !important;
                color: var(--tm-text-on-primary, white) !important;
            }
            #tm-price-transfer-btn.tm-price-transfer-error {
                background: var(--tm-danger-color) !important;
                border-color: var(--tm-danger-color) !important;
                color: var(--tm-text-on-primary, white) !important;
            }

            /* Override inline color: black (e.g. on span) so text is red */
            [style*="color: black"],
            [style*="color:black"],
            span[style*="color: black"],
            span[style*="color:black"] {
                color: #ff0000 !important;
            }







            /* --- Talent Tree Styles --- */
            .tm-talent-points-display { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 10px; background: #f0f8ff; padding: 8px; border-radius: 6px; }
            .tm-talent-points-display span { color: var(--tm-primary-color); }
            #tm-talents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
            .tm-talent-item { border: 1px solid var(--tm-shop-item-border); border-radius: 8px; padding: 15px; text-align: center; background: var(--tm-shop-item-bg); transition: all 0.2s ease; color: var(--tm-primary-color); }
            .tm-talent-item.unlocked { background: #e7f1ff; border-left: 4px solid var(--tm-primary-color); }
            .tm-talent-name { font-weight: bold; font-size: 15px; margin-bottom: 8px; }
            .tm-talent-description { font-size: 12px; color: #6c757d; min-height: 40px; margin-bottom: 12px; }
            .tm-talent-btn { width: 100%; padding: 8px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; color: white; }
            .tm-talent-btn.unlockable { background-color: var(--tm-success-color); }
            .tm-talent-btn.unlockable:hover { background-color: var(--tm-success-hover); }
            .tm-talent-btn.unlocked { background-color: var(--tm-secondary-color); cursor: default; }
            .tm-talent-btn:disabled:not(.unlocked) { background-color: #ccc; cursor: not-allowed; }

            /* --- Data Management Styles --- */
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
                background: #ffffff; padding: 25px; border-radius: 8px;
                width: 90%; max-width: 1200px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                height: 85vh; /* Use fixed height to prevent resizing between tabs */
                pointer-events: auto; /* Enable interaction with modal content */
                display: flex; flex-direction: column;
                color: var(--tm-primary-color);
                border: 1px solid var(--tm-primary-color);
                animation: tm-scale-up 0.3s ease-out;
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
                border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;
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
            .tm-result-item { border: 1px solid var(--tm-shop-item-border); border-radius: 5px; margin-bottom: 10px; overflow: hidden; pointer-events: auto; background: var(--tm-shop-item-bg); }
            .tm-result-clickable { cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; pointer-events: auto; }
            .tm-result-clickable:hover {
                box-shadow: 0 0 8px var(--tm-primary-color);
            }
            .tm-result-header { background-color: var(--tm-shop-item-bg); color: var(--tm-primary-color); padding: 8px 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; text-align: center; border: 1px solid var(--tm-shop-item-border); }
            .tm-result-body { padding: 12px; color: var(--tm-primary-color); }
            .tm-result-table { width: 100%; border-collapse: collapse; }
            .tm-result-table td { padding: 5px; border-bottom: 1px solid var(--tm-shop-item-border); font-size: 13px; text-align: center; color: var(--tm-primary-color); }
            .tm-result-table tr:last-child td { border-bottom: none; }
            .tm-result-highlight { background-color: var(--tm-warning-color); color: var(--tm-dark-hover); }
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
                color: var(--tm-primary-color) !important;
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
                color: var(--tm-primary-color) !important;
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
                color: var(--tm-primary-color) !important;
            }
            #tm-daily-dashboard-widget:hover {
                background: linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-3px) scale(1.05);
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
            .tm-quick-search-remove-btn, #tm-quick-search-add-btn, #tm-price-options-add-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: white;
            }
            .tm-quick-search-remove-btn { background-color: var(--tm-danger-color); }
            .tm-quick-search-remove-btn:hover { background-color: var(--tm-danger-hover); }
            #tm-quick-search-add-btn, #tm-price-options-add-btn { background-color: var(--tm-primary-color); margin-top: 5px; }
            #tm-quick-search-add-btn:hover, #tm-price-options-add-btn:hover { background-color: var(--tm-primary-hover); }

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
            .tm-scratchpad-tab.active { background: var(--tm-dark-hover); font-weight: bold; color: var(--tm-primary-color); }
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
                padding: 2px 8px 4px;
                box-sizing: border-box;
            }
            #tm-footer-controls-row {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                gap: 8px;
            }
            .tm-qs-host {
                display: flex;
                align-items: center;
                flex-shrink: 0;
                margin: 0;
                padding: 10px;
            }
            .tm-qs-host--header {
                margin-right: 10px;
            }
            .tm-qs-host--repair {
                margin: 0;
                padding: 0;
                max-width: min(560px, 100%);
            }
            .rnr-hfiller:has(.tm-qs-host--header) {
                display: flex !important;
                align-items: center;
                justify-content: flex-start !important;
                gap: 8px;
                flex-wrap: wrap;
                min-width: 0;
            }
            .tm-repair-edit-header-with-search {
                display: block !important;
            }
            .tm-repair-edit-title-row {
                display: inline-flex !important;
                flex-direction: row !important;
                align-items: center !important;
                flex-wrap: nowrap;
                gap: 10px;
                width: auto !important;
                max-width: 100%;
                vertical-align: middle;
            }
            .tm-repair-edit-title-row h1 {
                flex: 0 1 auto;
                margin: 0 !important;
                width: auto !important;
                white-space: nowrap;
            }
            .tm-repair-edit-title-row .tm-qs-host--repair {
                flex: 0 0 auto;
            }
            .tm-qs-panel {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                background: var(--tm-qs-panel-bg, var(--tm-shop-item-bg, #ffffff));
                border: 1px solid var(--tm-qs-panel-border, var(--tm-shop-item-border, #e2e8f0));
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                flex-wrap: wrap;
                max-width: 560px;
                box-sizing: border-box;
            }
            .tm-qs-host--header .tm-qs-panel {
                padding: 5px 8px;
                gap: 6px;
                max-width: min(480px, 100%);
            }
            .tm-qs-input-group {
                flex: 1;
                min-width: 88px;
            }
            .tm-qs-input {
                width: 100%;
                padding: 4px 8px;
                border: 1px solid var(--tm-qs-input-border, var(--tm-shop-item-border, #cbd5e1));
                border-radius: 6px;
                font-size: 12px;
                line-height: 1.3;
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
                background: var(--tm-qs-input-bg, var(--tm-shop-item-bg, #ffffff));
                color: var(--tm-qs-input-color, var(--tm-primary-color, #1a202c));
            }
            .tm-qs-input::placeholder {
                color: var(--tm-qs-placeholder, #a0aec0);
                font-size: 11px;
            }
            .tm-qs-input:focus {
                border-color: var(--tm-qs-focus, var(--tm-primary-color, #2563eb));
            }
            .tm-qs-search-btn {
                padding: 4px 12px;
                height: 28px;
                background-color: var(--tm-qs-btn-bg, var(--tm-primary-color, #2563eb));
                color: #ffffff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: background-color 0.2s, transform 0.1s;
                box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
                flex-shrink: 0;
            }
            .tm-qs-search-btn:hover {
                background-color: var(--tm-qs-btn-hover, #1d4ed8);
            }
            .tm-qs-search-btn:active {
                transform: scale(0.98);
            }
            .tm-qs-hide-native {
                flex-shrink: 0;
                align-self: center;
                height: 24px;
                min-width: 24px;
                padding: 0 5px;
                border: 1px solid var(--tm-qs-panel-border, var(--tm-shop-item-border, #e2e8f0));
                border-radius: 6px;
                background: var(--tm-qs-panel-bg, var(--tm-shop-item-bg, #ffffff));
                color: var(--tm-qs-label-color, var(--tm-primary-color, #4a5568));
                font-size: 12px;
                line-height: 1;
                cursor: pointer;
                transition: background-color 0.2s, border-color 0.2s;
            }
            .tm-qs-hide-native:hover {
                background: var(--tm-qs-input-bg, #f8fafc);
                border-color: var(--tm-qs-input-border, #cbd5e1);
            }
            body.tm-native-search-hidden .style1.rnr-bl.rnr-b-search,
            body.tm-native-search-hidden .rnr-b-search.style1.rnr-bl {
                display: none !important;
            }
            #tm-footer-controls-left {
                display: flex;
                align-items: center;
                gap: 8px;
               
                justify-content: flex-end;
            }
            #tm-footer-controls-middle {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 0 1 auto;
                max-width: min(100%, 340px);
                gap: 6px;
                flex-wrap: nowrap;
                min-width: 0;
            }
            #tm-footer-controls-right {
                display: flex;
                align-items: center;
                gap: 8px;
                
                justify-content: flex-start;
            }
            
            /* --- Unified Footer Widget Styling --- */
            .tm-footer-widget {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: var(--tm-primary-color);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                height: 40px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                font-weight: 600;
                font-size: 13px;
                white-space: nowrap;
            }
            
            .tm-footer-widget:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4);
                background: linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%);
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
            /* Floating orb particles replacing fireworks */
            .tm-level-up-orb {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                z-index: 19999;
                animation: lu-orb-float var(--orb-dur, 2s) cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
            }
            @keyframes lu-orb-float {
                0%   { transform: translate(0, 0) scale(1);   opacity: 0.9; }
                60%  { opacity: 0.6; }
                100% { transform: translate(var(--ox), var(--oy)) scale(0); opacity: 0; }
            }
            /* Expanding ring burst at card center */
            .tm-level-up-ring {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                z-index: 19998;
                border: 2px solid var(--ring-color, rgba(255,255,255,0.5));
                transform: translate(-50%, -50%) scale(0);
                animation: lu-ring-expand var(--ring-dur, 0.8s) ease-out forwards;
            }
            @keyframes lu-ring-expand {
                0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
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
            /* --- Level Up Screen (frosted-glass card design) --- */
            #tm-level-up-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.50);
                backdrop-filter: blur(10px) saturate(140%);
                -webkit-backdrop-filter: blur(10px) saturate(140%);
                z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                transition: opacity 0.6s ease-out;
                padding: 20px;
                animation: lu-overlay-in 0.35s ease-out;
            }
            @keyframes lu-overlay-in {
                from { opacity: 0; backdrop-filter: blur(0); }
                to   { opacity: 1; }
            }
            #tm-level-up-overlay.legendary {
                --lu-accent: #ffc107;
                --lu-accent2: #ff8c00;
            }
            /* No pulsing background blob */
            #tm-level-up-overlay::before { display: none; }

            .tm-level-up-content {
                background: rgba(14, 14, 20, 0.82);
                backdrop-filter: blur(28px) saturate(180%);
                -webkit-backdrop-filter: blur(28px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.10);
                border-radius: 28px;
                padding: 48px 52px 40px;
                text-align: center;
                color: white;
                max-width: 460px;
                width: 100%;
                position: relative;
                overflow: hidden;
                box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05);
                animation: lu-card-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
                z-index: 1;
            }
            /* Sheen sweep */
            .tm-level-up-content::before {
                content: '';
                position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
                animation: lu-sheen 1.2s ease-out 0.6s forwards;
                pointer-events: none;
            }
            /* Ring pulse around card */
            .tm-level-up-content::after {
                content: '';
                position: absolute; top: 50%; left: 50%;
                width: 100%; height: 100%;
                border-radius: 28px;
                border: 1.5px solid var(--lu-accent, rgba(255,255,255,0.25));
                opacity: 0;
                animation: lu-card-ring 1.8s ease-out 0.4s infinite;
                pointer-events: none;
            }
            @keyframes lu-card-pop {
                0%   { transform: scale(0.65) translateY(32px); opacity: 0; }
                100% { transform: scale(1)    translateY(0);    opacity: 1; }
            }
            @keyframes lu-sheen {
                0%   { left: -100%; }
                100% { left: 150%; }
            }
            @keyframes lu-card-ring {
                0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.5; }
                100% { transform: translate(-50%,-50%) scale(1.35); opacity: 0; }
            }
            .tm-level-up-content::-webkit-scrollbar { width: 4px; }
            .tm-level-up-content::-webkit-scrollbar-track { background: transparent; }
            .tm-level-up-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
            
            /* Global theme-aware scrollbars */
            ::-webkit-scrollbar {
                width: 12px;
                height: 12px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(var(--tm-primary-color-rgb, 255,255,255), 0.1);
                border-radius: 6px;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(var(--tm-primary-color-rgb, 255,255,255), 0.3);
                border-radius: 6px;
                border: 2px solid transparent;
                background-clip: padding-box;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(var(--tm-primary-color-rgb, 255,255,255), 0.5);
            }
            ::-webkit-scrollbar-thumb:active {
                background: rgba(var(--tm-primary-color-rgb, 255,255,255), 0.7);
            }
            ::-webkit-scrollbar-corner {
                background: rgba(var(--tm-primary-color-rgb, 255,255,255), 0.1);
            }
            /* "LEVEL UP" label — small uppercase eyebrow */
            .tm-level-up-title {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 4px;
                text-transform: uppercase;
                color: var(--lu-accent, rgba(255,255,255,0.55));
                opacity: 0;
                animation: lu-fade-up 0.4s ease-out 0.25s forwards;
                margin-bottom: 10px;
            }
            /* Level number is now the hero */
            .tm-level-up-new-level {
                font-size: clamp(72px, 14vw, 112px);
                font-weight: 800;
                line-height: 1;
                letter-spacing: -3px;
                background: linear-gradient(150deg, #ffffff 30%, rgba(255,255,255,0.55) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                opacity: 0;
                animation: lu-number-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
                margin: 0 0 6px;
            }
            @keyframes lu-number-pop {
                0%   { transform: scale(1.3); opacity: 0; filter: blur(6px); }
                100% { transform: scale(1);   opacity: 1; filter: blur(0); }
            }
            /* Legendary: gold number */
            #tm-level-up-overlay.legendary .tm-level-up-content {
                border-color: rgba(255, 193, 7, 0.20);
                box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 0 80px rgba(255, 193, 7, 0.10);
            }
            #tm-level-up-overlay.legendary .tm-level-up-new-level {
                background: linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ffd700 100%);
                -webkit-background-clip: text;
                background-clip: text;
            }
            /* Rewards as pill chips */
            .tm-level-up-rewards-container {
                display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
                margin: 22px 0 18px;
            }
            .tm-level-up-reward {
                font-size: 13px;
                color: rgba(255,255,255,0.88);
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.12);
                padding: 6px 16px;
                border-radius: 100px;
                opacity: 0;
                animation: lu-fade-up 0.4s ease-out 0.55s forwards;
            }
            .tm-level-up-reward:nth-child(2) { animation-delay: 0.65s; }
            .tm-level-up-reward:nth-child(3) { animation-delay: 0.75s; }
            .tm-level-up-reward:nth-child(4) { animation-delay: 0.85s; }

            /* Progress bar */
            .tm-level-up-progress-bar {
                width: 100%; height: 3px;
                background: rgba(255,255,255,0.10); border-radius: 2px;
                margin: 18px 0 0; overflow: hidden;
            }
            .tm-level-up-progress-fill {
                width: 0%; height: 100%;
                background: linear-gradient(90deg, var(--lu-accent, #60a5fa), rgba(255,255,255,0.6));
                border-radius: 2px;
                transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tm-level-up-stat-increase {
                font-size: 12px;
                color: rgba(255,255,255,0.38);
                margin-top: 18px;
                letter-spacing: 0.5px;
                opacity: 0;
                animation: lu-fade-up 0.4s ease-out 1s forwards;
            }
            .tm-level-up-evolution {
                font-size: 14px; color: #ffc107;
                margin: 14px 0 0;
                opacity: 0;
                animation: lu-fade-up 0.4s ease-out 0.4s forwards;
            }
            @keyframes lu-fade-up {
                from { transform: translateY(10px); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
            }
            @keyframes tm-level-up-throb {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* --- New: Mascot Mood Backgrounds --- */
            #tm-mascot-container::before {
                content: ''; position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%); width: 200px; height: 200px;
                border-radius: 50%; z-index: -1; transition: all 0.8s ease-in-out;
                opacity: 0;
            }
            #tm-mascot-container.mascot-happy::before {
                background: radial-gradient(circle, rgba(255,223,186,0.6) 0%, rgba(255,223,186,0) 70%);
                opacity: 1;
            }
            #tm-mascot-container.mascot-sad::before {
                background: radial-gradient(circle, rgba(176,196,222,0.7) 0%, rgba(176,196,222,0) 70%);
                opacity: 1;
            }
            #tm-mascot-container.mascot-energized::before {
                background: radial-gradient(circle, rgba(0,191,255,0.5) 0%, rgba(0,191,255,0) 60%);
                box-shadow: 0 0 25px rgba(0,191,255,0.7);
                opacity: 1;
                animation: tm-energized-aura-pulse 1.5s ease-in-out infinite;
                will-change: opacity;
            }
            
            @keyframes tm-energized-aura-pulse {
                0%, 100% { 
                    opacity: 0.5;
                }
                50% { 
                    opacity: 0.8;
                }
            }
            /* --- Fun Feature: Interactive Mascot --- */
            #tm-mascot-container {
                position: fixed;
                top: 0;
                left: 0;
                /* Optimized for smooth movement */
                will-change: transform;
                transform: translate3d(0, 0, 0); /* Enable hardware acceleration */
                backface-visibility: hidden; /* Prevent flickering */
                -webkit-backface-visibility: hidden;
                perspective: 1000px; /* Enable 3D transforms for smoother animation */

                width: 100px;
                height: 100px;
                z-index: 9990;
                pointer-events: none; /* The container itself is not clickable... */
            }
            /* ...but the robot and its panel inside are. */
            #tm-mascot-container > svg {
                pointer-events: auto;
            }
            .tm-mascot-robot {
                width: 100%; height: 100%;
                /* Default idle animation - applies to ALL evolutions */
                animation: tm-mascot-idle-float 4s ease-in-out infinite;
                cursor: pointer;
                image-rendering: pixelated; /* Key for the retro look */
                /* Performance optimizations */
                will-change: transform;
                transform: translateZ(0); /* Force hardware acceleration */
            }
            /* Optimize all mascot accessories for smooth animation */
            .tm-mascot-accessory, #top_hat, #master_crown, #jetpack,
            .tm-mascot-book, .tm-mascot-bicycle, .tm-mascot-ball,
            .tm-mascot-sunglasses, .tm-mascot-umbrella, 
            .tm-mascot-thinking-bubble, .tm-mascot-eureka-bubble {
                will-change: transform, opacity;
                transform: translateZ(0); /* Hardware acceleration */
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }
            #tm-mascot-container .tm-mascot-eye { animation: tm-mascot-blink 5s infinite; }
            /* New: Add subtle secondary animation to the antenna */
            #tm-mascot-container .tm-mascot-antenna {
                transform-origin: 50% 15px; /* Set rotation point at the base of the antenna */
                animation: tm-mascot-antenna-sway 6s ease-in-out infinite;
                will-change: transform;
                transform: translateZ(0);
            }
            #tm-mascot-container .tm-mascot-main-body {
                will-change: transform;
                transform: translateZ(0);
            }

            #tm-mascot-container .tm-mascot-magnifying-glass { display: none; }

            .tm-mascot-flipper {
                transition: transform 0.4s ease;
                transform-origin: 50% 50%;
                will-change: transform;
                transform: translateZ(0);
                backface-visibility: hidden;
            }

            /* Make the pet react to hover - use filter instead of transform to avoid overriding animations */
            #tm-mascot-container:hover .tm-mascot-robot {
                filter: brightness(1.1);
                cursor: grab;
            }

            /* Mascot States */
            #tm-mascot-container.mascot-idle .tm-mascot-main-body { animation: tm-mascot-roam-fly 1.2s ease-in-out infinite; }
            #tm-mascot-container.mascot-idle .tm-mascot-eye-open,
            #tm-mascot-container.mascot-happy .tm-mascot-eye-open,
            #tm-mascot-container.mascot-sad .tm-mascot-eye-open {
                animation: tm-mascot-blink 5s steps(1, end) infinite;
            }
            
            /* Accessories animate naturally during idle/roaming */
            #tm-mascot-container.mascot-idle #top_hat,
            #tm-mascot-container.mascot-idle #master_crown {
                animation: tm-mascot-hat-gentle-bob 2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-idle .tm-mascot-sunglasses {
                animation: tm-mascot-shades-adjust 4s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-idle #jetpack .tm-mascot-thruster-left,
            #tm-mascot-container.mascot-idle #jetpack .tm-mascot-thruster-right {
                animation: tm-mascot-jetpack-flame 0.8s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-searching .tm-mascot-robot { animation: tm-mascot-search-move 2s ease-in-out infinite; }
            #tm-mascot-container.mascot-searching .tm-mascot-magnifying-glass { display: block; }

            #tm-mascot-container.mascot-happy .tm-mascot-robot { animation: tm-mascot-happy-dance 0.8s ease-in-out infinite; }
            #tm-mascot-container.mascot-happy .tm-mascot-antenna { animation: tm-mascot-antenna-happy-wiggle 0.4s ease-in-out infinite; }
            #tm-mascot-container.mascot-happy #top_hat,
            #tm-mascot-container.mascot-happy #master_crown {
                animation: tm-mascot-hat-bounce-happy 0.8s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-happy #jetpack {
                animation: tm-mascot-jetpack-boost 0.4s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-energized .tm-mascot-robot { 
                animation: tm-mascot-energized-power 0.6s ease-in-out infinite !important;
                filter: brightness(1.2) saturate(1.3);
            }
            #tm-mascot-container.mascot-energized .tm-mascot-antenna { 
                animation: tm-mascot-antenna-energized-glow 0.4s ease-in-out infinite !important;
            }
            #tm-mascot-container.mascot-energized .tm-mascot-antenna circle {
                fill: #00bfff !important;
            }
            #tm-mascot-container.mascot-energized .tm-mascot-main-body {
                box-shadow: 0 0 15px rgba(0,191,255,0.6);
                animation: tm-energized-body-pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes tm-energized-body-pulse {
                0%, 100% {
                    box-shadow: 0 0 10px rgba(0,191,255,0.5), 0 0 20px rgba(0,191,255,0.3);
                }
                50% {
                    box-shadow: 0 0 20px rgba(0,191,255,0.9), 0 0 35px rgba(0,191,255,0.6);
                }
            }
            /* Hide accessory animations when energized to prevent conflicts */
            #tm-mascot-container.mascot-energized .tm-mascot-ball,
            #tm-mascot-container.mascot-energized .tm-mascot-bicycle,
            #tm-mascot-container.mascot-energized .tm-mascot-book,
            #tm-mascot-container.mascot-energized #top_hat,
            #tm-mascot-container.mascot-energized #master_crown,
            #tm-mascot-container.mascot-energized #jetpack {
                animation: none !important;
            }
            /* Energized state overrides all other body animations */
            #tm-mascot-container.mascot-energized .tm-mascot-head,
            #tm-mascot-container.mascot-energized .tm-mascot-thrusters {
                animation: none !important;
            }
            
            /* Electric particles - created dynamically via JS */
            /* Enhanced Searching Animation */
            #tm-mascot-container.mascot-searching .tm-mascot-robot { animation: tm-mascot-search-move 2s ease-in-out infinite; }
            #tm-mascot-container.mascot-searching .tm-mascot-antenna { animation: tm-mascot-antenna-spin 1s linear infinite; }
            #tm-mascot-container.mascot-searching .tm-mascot-magnifying-glass { display: block; }
            /* Use the simpler float animation for sad/sleeping states on the main body */
            #tm-mascot-container.mascot-sad .tm-mascot-robot {
                animation: tm-mascot-idle-float 6s ease-in-out infinite;
                transform: rotate(-2deg); /* Add a slight sad tilt */
            }
            #tm-mascot-container.mascot-sleeping .tm-mascot-robot { animation: tm-mascot-idle-float 8s ease-in-out infinite; }
            #tm-mascot-container.mascot-sleeping .tm-mascot-eye-open { display: none; }
            #tm-mascot-container.mascot-sleeping .tm-mascot-eye-closed { display: block; }

            #tm-mascot-container.mascot-sad .tm-mascot-mouth-happy { display: none; }
            #tm-mascot-container.mascot-sad .tm-mascot-mouth-sad { display: block; }

            #tm-mascot-container.mascot-dodging .tm-mascot-robot { animation: tm-mascot-startled 0.4s ease-out; }
            #tm-mascot-container.mascot-dodging #top_hat,
            #tm-mascot-container.mascot-dodging #master_crown {
                animation: tm-mascot-hat-fly-off 0.4s ease-out;
            }
            #tm-mascot-container.mascot-dodging .tm-mascot-sunglasses {
                animation: tm-mascot-shades-wobble 0.4s ease-out;
            }

            /* Enhanced Playful States with Natural Accessory Interactions */
            #tm-mascot-container.mascot-reading .tm-mascot-robot { animation: tm-mascot-reading-bob 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-reading .tm-mascot-book { 
                display: block; 
                animation: tm-mascot-book-flip 2s ease-in-out infinite;
                transform-origin: left center;
            }

            #tm-mascot-container.mascot-biking .tm-mascot-robot { animation: tm-mascot-biking-bounce 1s ease-in-out infinite; }
            #tm-mascot-container.mascot-biking .tm-mascot-bicycle { 
                display: block; 
                animation: tm-mascot-bike-wobble 1s ease-in-out infinite;
            }

            #tm-mascot-container.mascot-juggling .tm-mascot-robot { 
                animation: tm-mascot-juggling-sway 2.4s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball { 
                display: block;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball-1 { 
                animation: tm-mascot-juggle-left-to-right 1.2s ease-in-out infinite;
                animation-delay: 0s;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball-2 { 
                animation: tm-mascot-juggle-right-to-left 1.2s ease-in-out infinite;
                animation-delay: 0.4s;
            }
            #tm-mascot-container.mascot-juggling .tm-mascot-ball-3 { 
                animation: tm-mascot-juggle-left-to-right 1.2s ease-in-out infinite;
                animation-delay: 0.8s;
            }
            
            /* Ensure smooth transition when exiting juggling state */
            #tm-mascot-container.mascot-idle .tm-mascot-robot {
                animation: tm-mascot-idle-float 4s ease-in-out infinite;
                transition: transform 0.3s ease-out;
            }
            
            /* Evolution-specific idle enhancements - Pulsing antenna lights */
            .tm-mascot-antenna circle {
                animation: tm-antenna-light-pulse 2s ease-in-out infinite;
            }
            
            @keyframes tm-antenna-light-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
            
            /* All state animations work on .tm-mascot-robot which contains all evolution forms */
            /* Roaming animations work on #tm-mascot-container via JavaScript */
            
            /* Eating Animation - Make it more natural */
            #tm-mascot-container.mascot-eating .tm-mascot-robot { animation: tm-mascot-eating-chew 0.6s ease-in-out 3; }
            #tm-mascot-container.mascot-eating .tm-mascot-main-body { animation: none; }
            
            /* Thinking Animation - More contemplative */
            #tm-mascot-container.mascot-thinking .tm-mascot-robot { animation: tm-mascot-pondering 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-thinking .tm-mascot-thinking-bubble { 
                display: block;
                animation: tm-mascot-thought-pulse 2s ease-in-out infinite;
            }

            /* Mascot Animations */
            @keyframes tm-mascot-barrel-roll {
                from { transform: rotate(0deg) scale(1); }
                to { transform: rotate(360deg) scale(1.2); }
            }
            @keyframes tm-mascot-antenna-spin {
                from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes tm-mascot-glitch {
                0%, 100% { transform: translate(0, 0); }
                20% { transform: translate(-3px, 3px) rotate(-2deg); }
                40% { transform: translate(3px, -3px) rotate(2deg); }
                60% { transform: translate(-3px, -3px) rotate(1deg); }
                80% { transform: translate(3px, 3px) rotate(-1deg); }
            }
            @keyframes tm-mascot-idle-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            /* New: Keyframe for antenna sway */
            @keyframes tm-mascot-antenna-sway {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(8deg); }
            }
            @keyframes tm-mascot-blink {
                0%, 95%, 100% { transform: scaleY(1); transform-origin: center; }
                97% { transform: scaleY(0.1); transform-origin: center; }
            }
            @keyframes tm-mascot-search-move {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                25% { transform: translate(5px, -5px) rotate(5deg); }
                75% { transform: translate(-5px, 0) rotate(-5deg); }
            }
            @keyframes tm-mascot-happy-dance {
                0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                15% { transform: translateY(-12px) rotate(-8deg) scale(1.03); }
                30% { transform: translateY(-5px) rotate(8deg) scale(1.05); }
                45% { transform: translateY(-15px) rotate(-10deg) scale(1.04); }
                60% { transform: translateY(-3px) rotate(0deg) scale(1.08); }
                75% { transform: translateY(-18px) rotate(12deg) scale(1.06); }
                90% { transform: translateY(-8px) rotate(-5deg) scale(1.02); }
            }
            @keyframes tm-mascot-roam-fly {
                0%, 100% { transform: translateY(0) rotate(1deg); }
                50% { transform: translateY(-5px) rotate(-1deg); }
            }
            #tm-mascot-container.mascot-idle .tm-mascot-thruster-left,
            #tm-mascot-container.mascot-dodging .tm-mascot-thruster-left { animation: tm-mascot-thruster-anim 1.2s ease-in-out infinite 0.1s; }
            #tm-mascot-container.mascot-idle .tm-mascot-thruster-right,
            #tm-mascot-container.mascot-dodging .tm-mascot-thruster-right { animation: tm-mascot-thruster-anim 1.2s ease-in-out infinite; }
            @keyframes tm-mascot-thruster-anim {
                0%, 100% { transform: translateY(0) scaleY(1); opacity: 1; }
                50% { transform: translateY(4px) scaleY(0.8); opacity: 0.7; }
            }

            @keyframes tm-mascot-startled {
                0%, 100% { transform: translate(0, 0); }
                30% { transform: translate(0, -15px) scale(1.05, 0.9); }
                60% { transform: translateY(0) scale(0.95, 1.05); }
            }
            /* Enhanced Reading Animation - Gentle bobbing while focused on book */
            @keyframes tm-mascot-reading-bob {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-3px) rotate(2deg); }
            }
            @keyframes tm-mascot-book-flip {
                0%, 80% { transform: rotateY(0deg); }
                85%, 95% { transform: rotateY(-15deg); }
                100% { transform: rotateY(0deg); }
            }
            
            /* Enhanced Biking Animation - Realistic cycling motion with pedaling rhythm */
            @keyframes tm-mascot-biking-bounce {
                0% { transform: translateY(0) rotate(0deg) scaleY(1); }
                10% { transform: translateY(-4px) rotate(-1deg) scaleY(1.02); }
                20% { transform: translateY(-6px) rotate(-2deg) scaleY(0.98); }
                30% { transform: translateY(-3px) rotate(0deg) scaleY(1.01); }
                40% { transform: translateY(0) rotate(1deg) scaleY(1); }
                50% { transform: translateY(-2px) rotate(2deg) scaleY(0.99); }
                60% { transform: translateY(-5px) rotate(1deg) scaleY(1.01); }
                70% { transform: translateY(-7px) rotate(0deg) scaleY(0.98); }
                80% { transform: translateY(-4px) rotate(-1deg) scaleY(1.02); }
                90% { transform: translateY(-1px) rotate(0deg) scaleY(1); }
                100% { transform: translateY(0) rotate(0deg) scaleY(1); }
            }
            @keyframes tm-mascot-bike-wobble {
                0% { transform: rotate(0deg) translateX(0); }
                12% { transform: rotate(-1.5deg) translateX(-1px); }
                25% { transform: rotate(-3deg) translateX(-2px); }
                37% { transform: rotate(-1.5deg) translateX(-1px); }
                50% { transform: rotate(0deg) translateX(0); }
                62% { transform: rotate(1.5deg) translateX(1px); }
                75% { transform: rotate(3deg) translateX(2px); }
                87% { transform: rotate(1.5deg) translateX(1px); }
                100% { transform: rotate(0deg) translateX(0); }
            }
            
            /* Enhanced Juggling Animation - Smooth body sway */
            @keyframes tm-mascot-juggling-sway {
                0% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(-2px) rotate(-2deg); }
                50% { transform: translateX(0) rotate(0deg); }
                75% { transform: translateX(2px) rotate(2deg); }
                100% { transform: translateX(0) rotate(0deg); }
            }
            /* Left-to-right arc for odd-numbered balls */
            @keyframes tm-mascot-juggle-left-to-right {
                0% { 
                    transform: translate(-25px, 5px) scale(1); 
                }
                50% { 
                    transform: translate(0px, -40px) scale(0.7); 
                }
                100% { 
                    transform: translate(25px, 5px) scale(1); 
                }
            }
            
            /* Right-to-left arc for even-numbered balls */
            @keyframes tm-mascot-juggle-right-to-left {
                0% { 
                    transform: translate(25px, 5px) scale(1); 
                }
                50% { 
                    transform: translate(0px, -40px) scale(0.7); 
                }
                100% { 
                    transform: translate(-25px, 5px) scale(1); 
                }
            }
            
            /* Enhanced Eating Animation - Chewing motion */
            @keyframes tm-mascot-eating-chew {
                0%, 100% { transform: scaleY(1); }
                40% { transform: scaleY(0.95); }
                60% { transform: scaleY(1.02); }
            }
            
            /* Enhanced Thinking Animation - Gentle pondering motion */
            @keyframes tm-mascot-pondering {
                0%, 100% { transform: rotate(0deg) translateY(0); }
                33% { transform: rotate(-3deg) translateY(-2px); }
                66% { transform: rotate(3deg) translateY(-2px); }
            }
            @keyframes tm-mascot-thought-pulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
            
            /* Accessory-specific idle animations */
            @keyframes tm-mascot-hat-gentle-bob {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-2px) rotate(1deg); }
            }
            @keyframes tm-mascot-shades-adjust {
                0%, 90% { transform: translateY(0); }
                92%, 96% { transform: translateY(-1px); }
                100% { transform: translateY(0); }
            }
            @keyframes tm-mascot-jetpack-flame {
                0%, 100% { opacity: 1; transform: scaleY(1); }
                50% { opacity: 0.7; transform: scaleY(1.3); }
            }
            
            /* Weather accessory animations */
            @keyframes tm-mascot-sunny-relax {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(-5deg); }
            }
            @keyframes tm-mascot-sunglasses-shine {
                0%, 85% { opacity: 1; }
                90% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            @keyframes tm-mascot-rainy-shelter {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(-3px) rotate(-2deg); }
                75% { transform: translateX(3px) rotate(2deg); }
            }
            @keyframes tm-mascot-umbrella-sway {
                0%, 100% { transform: translate(40px, -30px) rotate(-20deg); }
                50% { transform: translate(40px, -30px) rotate(-15deg); }
            }
            
            /* Enhanced antenna reactions */
            @keyframes tm-mascot-antenna-happy-wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-15deg); }
                75% { transform: rotate(15deg); }
            }
            @keyframes tm-mascot-antenna-energized-glow {
                0%, 100% { 
                    transform: rotate(-12deg); 
                }
                25% { 
                    transform: rotate(12deg); 
                }
                50% { 
                    transform: rotate(-12deg); 
                }
                75% { 
                    transform: rotate(12deg); 
                }
            }
            
            @keyframes tm-mascot-energized-power {
                0% { 
                    transform: translateY(0) scale(1) rotate(0deg); 
                }
                25% { 
                    transform: translateY(-8px) scale(1.03) rotate(-2deg); 
                }
                50% { 
                    transform: translateY(-12px) scale(1.05) rotate(0deg); 
                }
                75% { 
                    transform: translateY(-8px) scale(1.03) rotate(2deg); 
                }
                100% { 
                    transform: translateY(0) scale(1) rotate(0deg); 
                }
            }
            @keyframes tm-mascot-hat-bounce-happy {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                15% { transform: translateY(-15px) rotate(-10deg); }
                30% { transform: translateY(-8px) rotate(10deg); }
                45% { transform: translateY(-18px) rotate(-8deg); }
                60% { transform: translateY(-5px) rotate(5deg); }
                75% { transform: translateY(-20px) rotate(15deg); }
                90% { transform: translateY(-10px) rotate(-5deg); }
            }
            @keyframes tm-mascot-jetpack-boost {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-3px) scale(1.05, 0.95); }
            }
            @keyframes tm-mascot-accessory-glitch {
                0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                25% { transform: translate(-2px, 2px) rotate(-5deg); opacity: 0.8; }
                50% { transform: translate(2px, -2px) rotate(5deg); opacity: 1; }
                75% { transform: translate(-1px, -1px) rotate(-3deg); opacity: 0.9; }
            }
            @keyframes tm-mascot-hat-fly-off {
                0% { transform: translateY(0) rotate(0deg); }
                30% { transform: translateY(-15px) rotate(25deg); }
                100% { transform: translateY(-5px) rotate(10deg); }
            }
            @keyframes tm-mascot-shades-wobble {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                30% { transform: translateY(-3px) rotate(-8deg); }
                60% { transform: translateY(-2px) rotate(8deg); }
            }
            
            @keyframes tm-mascot-powersave-drift {
                0%, 100% { transform: translateY(0); opacity: 1; }
                50% { transform: translateY(15px); opacity: 0.7; }
            }
            @keyframes tm-mascot-eye-dim {
                0%, 100% { fill-opacity: 1; }
                50% { fill-opacity: 0.3; }
            }
            @keyframes tm-mascot-sparks {
                0%, 100% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1); }
            }
            #tm-mascot-container.mascot-glitching .tm-mascot-sparks { display: block; animation: tm-mascot-sparks 0.2s steps(1, end) infinite; }
            #tm-mascot-container.mascot-glitching .tm-mascot-robot { animation: tm-mascot-glitch 0.3s infinite; }
            #tm-mascot-container.mascot-glitching #top_hat,
            #tm-mascot-container.mascot-glitching #master_crown {
                animation: tm-mascot-accessory-glitch 0.3s infinite;
            }
            /* New Eureka State */
            #tm-mascot-container.mascot-eureka .tm-mascot-robot { animation: tm-mascot-barrel-roll 1s ease-out; }
            #tm-mascot-container.mascot-eureka .tm-mascot-eureka-bubble { display: block; }

            /* Enhanced Weather States with Natural Accessory Movement */
            #tm-mascot-container.mascot-sunny .tm-mascot-robot { animation: tm-mascot-sunny-relax 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-sunny .tm-mascot-sunglasses { 
                display: block; 
                animation: tm-mascot-sunglasses-shine 2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-rainy .tm-mascot-robot { animation: tm-mascot-rainy-shelter 2.5s ease-in-out infinite; }
            #tm-mascot-container.mascot-rainy .tm-mascot-umbrella { 
                display: block; 
                animation: tm-mascot-umbrella-sway 3s ease-in-out infinite;
            }

            /* New Power-Save State */
            #tm-mascot-container.mascot-powersave .tm-mascot-robot { animation: tm-mascot-powersave-drift 8s ease-in-out infinite; }
            #tm-mascot-container.mascot-powersave .tm-mascot-eye-open circle:last-child { animation: tm-mascot-eye-dim 4s ease-in-out infinite; }
            #tm-mascot-container.mascot-powersave .tm-mascot-zzz-bubble { display: block; }
            #tm-mascot-container.mascot-powersave .tm-mascot-thruster-left, #tm-mascot-container.mascot-powersave .tm-mascot-thruster-right { display: none; }

            /* Visual effects for mascot needing cleaning */
            @keyframes tm-poop-float {
                0%, 100% { 
                    transform: translate(-50%, -50%) translateY(0) scale(1); 
                    opacity: 0.8; 
                }
                50% { 
                    transform: translate(-50%, -50%) translateY(-10px) scale(1.1); 
                    opacity: 1; 
                }
            }
            @keyframes tm-needs-cleaning-pulse {
                0%, 100% { 
                    filter: brightness(1) saturate(1);
                    box-shadow: 0 0 0 0 rgba(139, 69, 19, 0);
                }
                50% { 
                    filter: brightness(0.9) saturate(0.8);
                    box-shadow: 0 0 20px 5px rgba(139, 69, 19, 0.5);
                }
            }
            #tm-mascot-container.mascot-needs-cleaning {
                animation: tm-needs-cleaning-pulse 2s ease-in-out infinite;
                position: relative;
            }
            #tm-mascot-container.mascot-needs-cleaning::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle, rgba(139, 69, 19, 0.2) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                animation: tm-needs-cleaning-pulse 2s ease-in-out infinite;
            }
            .tm-poop-particle {
                position: absolute;
                pointer-events: none;
                z-index: 9998;
                user-select: none;
            }
            
            /* Visual effects for mascot needing toilet */
            @keyframes tm-toilet-urgency-subtle {
                0%, 100% { 
                    opacity: 0.7;
                    transform: scale(1);
                }
                50% { 
                    opacity: 1;
                    transform: scale(1.05);
                }
            }
            #tm-mascot-container.mascot-needs-toilet {
                position: relative;
            }
            .tm-toilet-urgency-indicator {
                position: absolute;
                pointer-events: none;
                z-index: 9999;
                user-select: none;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }





            /* Mascot Interaction Panel */
            /* New Modern Tamagotchi Control Panel */
            #tm-mascot-interaction-panel {
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 250, 255, 0.98) 100%);
                border: 1px solid rgba(0, 183, 255, 0.2);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 183, 255, 0.1);
                padding: 0;
                width: 280px;
                max-width: calc(100vw - 40px);
                max-height: calc(100vh - 180px);
                overflow-y: auto;
                overflow-x: hidden;
                z-index: 9991;
                display: none;
                flex-direction: column;
                font-size: 12px;
                backdrop-filter: blur(10px);
            }

            /* Panel Header */
            .tm-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: linear-gradient(135deg, rgba(0, 183, 255, 0.1) 0%, rgba(200, 220, 240, 0.1) 100%);
                border-bottom: 1px solid rgba(0, 183, 255, 0.15);
                border-radius: 12px 12px 0 0;
            }

            .tm-panel-title {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex: 1;
            }

            .tm-stage-badge {
                font-size: 14px;
                font-weight: bold;
                color: #00b7ff;
                text-shadow: 0 1px 2px rgba(0, 183, 255, 0.3);
            }

            .tm-panel-info {
                display: flex;
                gap: 12px;
                font-size: 10px;
                color: #666;
            }

            .tm-age-text, .tm-weight-text {
                color: #888;
            }

            .tm-panel-close {
                width: 24px;
                height: 24px;
                border: none;
                background: rgba(200, 200, 200, 0.3);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #666;
                transition: all 0.2s;
                padding: 0;
                line-height: 1;
            }

            .tm-panel-close:hover {
                background: rgba(255, 100, 100, 0.3);
                color: #dc3545;
                transform: scale(1.1);
            }

            /* Status Alerts */
            #tm-status-alerts {
                padding: 8px 16px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .tm-alert {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
            }

            .tm-alert-poop {
                background: rgba(139, 69, 19, 0.15);
                border: 1px solid rgba(139, 69, 19, 0.3);
                color: #8b4513;
            }

            .tm-alert-sick {
                background: rgba(220, 53, 69, 0.15);
                border: 1px solid rgba(220, 53, 69, 0.3);
                color: #dc3545;
            }

            .tm-alert-icon {
                font-size: 14px;
            }

            .tm-alert-text {
                flex: 1;
            }

            /* Panel Sections */
            .tm-panel-section {
                padding: 12px 16px;
                border-bottom: 1px solid rgba(0, 183, 255, 0.1);
            }

            .tm-panel-section:last-child {
                border-bottom: none;
            }

            .tm-section-title {
                font-size: 11px;
                font-weight: 600;
                color: #00b7ff;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
            }

            /* Stats Grid */
            .tm-stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .tm-stat-item {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .tm-stat-icon {
                font-size: 18px;
                flex-shrink: 0;
            }

            .tm-stat-content {
                flex: 1;
                min-width: 0;
            }

            .tm-stat-name {
                font-size: 10px;
                color: #666;
                margin-bottom: 4px;
                font-weight: 500;
            }

            .tm-stat-bar-modern {
                width: 100%;
                height: 8px;
                background-color: rgba(200, 200, 200, 0.3);
                border-radius: 4px;
                overflow: hidden;
                border: none;
            }

            .tm-pet-stat-bar-fill {
                height: 100%;
                transition: width 0.3s ease-out;
                border-radius: 4px;
            }

            #tm-pet-happiness-bar .tm-pet-stat-bar-fill { 
                background: linear-gradient(90deg, #ffc107, #ffeb3b);
            }
            #tm-pet-hunger-bar .tm-pet-stat-bar-fill { 
                background: linear-gradient(90deg, #28a745, #4caf50);
            }
            #tm-pet-health-bar .tm-pet-stat-bar-fill { 
                background: linear-gradient(90deg, #dc3545, #ff5252);
            }
            #tm-pet-discipline-bar .tm-pet-stat-bar-fill { 
                background: linear-gradient(90deg, #00b7ff, #00e5ff);
            }

            /* Actions Grid */
            .tm-actions-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }

            /* Action Buttons */
            .tm-action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                padding: 10px 8px;
                border: 1px solid rgba(200, 200, 200, 0.4);
                border-radius: 8px;
                cursor: pointer;
                background: rgba(255, 255, 255, 0.6);
                transition: all 0.2s ease;
                font-size: 10px;
                min-height: 50px;
            }

            .tm-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 183, 255, 0.2);
            }

            .tm-action-btn:active {
                transform: translateY(0);
            }

            .tm-btn-icon {
                font-size: 18px;
            }

            .tm-btn-label {
                font-weight: 500;
                color: #555;
            }

            /* Button Variants */
            .tm-btn-primary {
                background: linear-gradient(135deg, rgba(40, 167, 69, 0.15), rgba(40, 167, 69, 0.05));
                border-color: rgba(40, 167, 69, 0.3);
            }
            .tm-btn-primary:hover {
                background: linear-gradient(135deg, rgba(40, 167, 69, 0.25), rgba(40, 167, 69, 0.15));
                border-color: rgba(40, 167, 69, 0.5);
            }

            .tm-btn-secondary {
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 193, 7, 0.05));
                border-color: rgba(255, 193, 7, 0.3);
            }
            .tm-btn-secondary:hover {
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.25), rgba(255, 193, 7, 0.15));
                border-color: rgba(255, 193, 7, 0.5);
            }

            .tm-btn-love {
                background: linear-gradient(135deg, rgba(255, 105, 180, 0.15), rgba(255, 105, 180, 0.05));
                border-color: rgba(255, 105, 180, 0.3);
            }
            .tm-btn-love:hover {
                background: linear-gradient(135deg, rgba(255, 105, 180, 0.25), rgba(255, 105, 180, 0.15));
                border-color: rgba(255, 105, 180, 0.5);
            }

            .tm-btn-clean {
                background: linear-gradient(135deg, rgba(139, 69, 19, 0.15), rgba(139, 69, 19, 0.05));
                border-color: rgba(139, 69, 19, 0.3);
            }
            .tm-btn-clean:hover {
                background: linear-gradient(135deg, rgba(139, 69, 19, 0.25), rgba(139, 69, 19, 0.15));
                border-color: rgba(139, 69, 19, 0.5);
            }

            .tm-btn-medicine {
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.15), rgba(220, 53, 69, 0.05));
                border-color: rgba(220, 53, 69, 0.3);
            }
            .tm-btn-medicine:hover {
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.25), rgba(220, 53, 69, 0.15));
                border-color: rgba(220, 53, 69, 0.5);
            }

            .tm-btn-toilet {
                background: linear-gradient(135deg, rgba(108, 117, 125, 0.15), rgba(108, 117, 125, 0.05));
                border-color: rgba(108, 117, 125, 0.3);
            }
            .tm-btn-toilet:hover {
                background: linear-gradient(135deg, rgba(108, 117, 125, 0.25), rgba(108, 117, 125, 0.15));
                border-color: rgba(108, 117, 125, 0.5);
            }

            .tm-btn-praise {
                background: linear-gradient(135deg, rgba(0, 183, 255, 0.15), rgba(0, 183, 255, 0.05));
                border-color: rgba(0, 183, 255, 0.3);
            }
            .tm-btn-praise:hover {
                background: linear-gradient(135deg, rgba(0, 183, 255, 0.25), rgba(0, 183, 255, 0.15));
                border-color: rgba(0, 183, 255, 0.5);
            }

            .tm-btn-scold {
                background: linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05));
                border-color: rgba(255, 152, 0, 0.3);
            }
            .tm-btn-scold:hover {
                background: linear-gradient(135deg, rgba(255, 152, 0, 0.25), rgba(255, 152, 0, 0.15));
                border-color: rgba(255, 152, 0, 0.5);
            }

            .tm-btn-game {
                background: linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.05));
                border-color: rgba(156, 39, 176, 0.3);
            }
            .tm-btn-game:hover {
                background: linear-gradient(135deg, rgba(156, 39, 176, 0.25), rgba(156, 39, 176, 0.15));
                border-color: rgba(156, 39, 176, 0.5);
            }

            .tm-btn-lights {
                background: linear-gradient(135deg, rgba(255, 235, 59, 0.15), rgba(255, 235, 59, 0.05));
                border-color: rgba(255, 235, 59, 0.3);
            }
            .tm-btn-lights:hover {
                background: linear-gradient(135deg, rgba(255, 235, 59, 0.25), rgba(255, 235, 59, 0.15));
                border-color: rgba(255, 235, 59, 0.5);
            }

            .tm-btn-info {
                background: linear-gradient(135deg, rgba(96, 125, 139, 0.15), rgba(96, 125, 139, 0.05));
                border-color: rgba(96, 125, 139, 0.3);
            }
            .tm-btn-info:hover {
                background: linear-gradient(135deg, rgba(96, 125, 139, 0.25), rgba(96, 125, 139, 0.15));
                border-color: rgba(96, 125, 139, 0.5);
            }

            .tm-btn-death {
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.3), rgba(220, 53, 69, 0.2));
                border-color: rgba(220, 53, 69, 0.5);
                width: 100%;
            }
            .tm-btn-death:hover {
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.4), rgba(220, 53, 69, 0.3));
                border-color: rgba(220, 53, 69, 0.7);
            }

            #tm-pet-revive-btn-container {
                padding: 12px 16px;
            }

            /* Mascot Speech Bubble */
            .tm-mascot-speech-bubble {
                position: absolute;
                top: -20px; /* Start position for animation */
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                border: 2px solid #333;
                border-radius: 10px;
                padding: 5px 10px;
                font-size: 12px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                white-space: nowrap;
                z-index: 9992;
                box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
                opacity: 0;
                transition: opacity 0.3s ease-out, top 0.3s ease-out;
            }
            .tm-mascot-speech-bubble.show {
                top: -30px; /* End position */
                opacity: 1;
            }
            /* Add a little tail for the bubble */
            .tm-mascot-speech-bubble::after {
                content: '';
                position: absolute;
                bottom: -8px; left: 50%; transform: translateX(-50%);
                width: 0; height: 0; border-left: 8px solid transparent;
                border-right: 8px solid transparent; border-top: 8px solid #333;
            }
            /* XP Bar in Footer - Redesigned with integrated title */
            #tm-xp-bar-container {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 12px;
                height: 40px;
                padding: 4px 10px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                min-width: 180px;
                max-width: 200px;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            #tm-xp-bar-container:hover {
                background: linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            
            /* Title above the bar */
            #tm-user-title-text {
                display: block;
                font-size: 9px;
                font-weight: 700;
                text-align: left;
                margin-bottom: 4px;
                padding: 0 55px 0 6px; /* More padding on right for badges, left aligned */
                letter-spacing: 0.3px;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.2;
                color: white;
            }
            
            /* Level badge */
            #tm-level-text {
                position: absolute;
                top: 3px;
                right: 6px;
                background: linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,170,0,0.3) 100%);
                backdrop-filter: blur(4px);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: 700;
                color: white;
                border: 1px solid rgba(255, 215, 0, 0.5);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            /* --- New: Energized Buff Indicator --- */
            #tm-energized-buff-indicator {
                position: absolute;
                top: 3px;
                left: 6px;
                background: linear-gradient(135deg, rgba(0,191,255,0.3) 0%, rgba(0,242,254,0.3) 100%);
                backdrop-filter: blur(4px);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 8px;
                font-weight: 700;
                color: white;
                border: 1px solid rgba(0, 191, 255, 0.5);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                animation: tm-pulse-glow 1.5s infinite;
            }

            .tm-xp-bar {
                width: 100%;
                height: 10px;
                background: rgba(0,0,0,0.4);
                border: 1px solid rgba(255,215,0,0.3);
                border-radius: 5px;
                overflow: hidden;
                position: relative;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            }
            #tm-xp-bar-fill {
                height: 100%; width: 0%;
                background: linear-gradient(90deg, #ffd700 0%, #ffaa00 100%);
                transition: width 0.5s ease-out;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                position: relative;
            }
            #tm-xp-bar-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
            }
            #tm-xp-text {
                position: absolute;
                width: 100%;
                text-align: center;
                font-size: 8px;
                line-height: 10px;
                color: #fff;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                z-index: 1;
            }
            @keyframes tm-pulse-glow {
                0%, 100% { box-shadow: 0 0 4px var(--tm-warning-color); }
                50% { box-shadow: 0 0 12px var(--tm-warning-color), 0 0 18px var(--tm-warning-color); }
            }
            /* --- XP Gain Indicator --- */
            /* --- Buff Timers --- */
            #tm-buff-timers-container { 
                display: flex; 
                gap: 8px; 
                align-items: center;
                margin-right: 10px;
            }
            .tm-buff-timer {
                position: relative;
                width: 40px;
                height: 40px;
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tm-buff-timer:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            .tm-buff-timer svg {
                position: absolute;
                width: 36px;
                height: 36px;
                transform: rotate(-90deg);
            }
            .tm-buff-timer-bg {
                fill: none;
                stroke: rgba(255,255,255,0.15);
                stroke-width: 2.5;
            }
            .tm-buff-timer-circle {
                fill: none;
                stroke-width: 2.5;
                stroke-linecap: round;
                transition: stroke-dasharray 0.5s linear;
            }
            .tm-buff-timer-icon {
                position: relative;
                font-size: 18px;
                z-index: 1;
                color: white !important;
            }
            .tm-xp-gain-indicator {
                position: absolute;
                bottom: 20px; /* Start just above the bar */
                left: 50%;
                transform: translateX(-50%);
                color: #ffc107; /* Same as the XP bar color */
                font-weight: bold;
                font-size: 14px;
                text-shadow: 0 0 5px black;
                pointer-events: none;
                opacity: 0;
                animation: tm-xp-float-up-enhanced 1.5s ease-out forwards;
            }
            @keyframes tm-xp-float-up-enhanced {
                0% { opacity: 1; transform: translate(-50%, 0) scale(0.8); }
                20% { transform: translate(-50%, -10px) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50px) scale(0.5); }
            }
            /* New: Animation for the XP bar flashing on gain */
            .tm-xp-gain-flash {
                animation: tm-xp-bar-flash 0.5s ease-out;
            }
            @keyframes tm-xp-bar-flash {
                50% { box-shadow: 0 0 15px #fff, 0 0 25px #fff; }
            }
            /* New: Animation for the level text popping on gain */
            .tm-level-pop { animation: tm-level-text-pop 0.5s ease-out; }
            @keyframes tm-level-text-pop {
                50% { transform: scale(1.4); color: #ffc107; text-shadow: 0 0 8px #fff; }
            }




            /* Coin Balance in Footer */
            #tm-coin-balance {
                background: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: var(--tm-primary-color) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                font-size: 14px;
                font-weight: bold;
                height: 40px;
                padding: 0 14px;
                border-radius: 12px;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #tm-coin-balance:hover {
                background: linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }

            /* --- Feature: Shop --- */
            #tm-shop-items-wrapper {
                padding: 10px 0;
                overflow-y: auto; /* Allow scrolling if needed */
                max-height: 60vh; /* Limit height for better UX */
            }
            .tm-shop-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr); /* 3 column grid */
                gap: 12px;
                max-width: 600px; /* Limit width for better layout */
                margin: 0 auto; /* Center the grid */
            }
            @media (max-width: 768px) {
                .tm-shop-grid {
                    grid-template-columns: repeat(2, 1fr); /* 2 columns on small screens */
                }
            }
            @media (max-width: 480px) {
                .tm-shop-grid {
                    grid-template-columns: 1fr; /* 1 column on mobile */
                }
            }
            .tm-shop-tabs { display: flex; gap: 5px; margin-bottom: 15px; border-bottom: 1px solid #ccc; }
            .tm-shop-tab { padding: 8px 15px; cursor: pointer; border: 1px solid #ccc; border-bottom: none; border-radius: 5px 5px 0 0; background: #f1f1f1; }
            .tm-shop-tab.active { background: var(--tm-dark-hover); border-bottom: 1px solid var(--tm-dark-hover); margin-bottom: -1px; font-weight: bold; color: var(--tm-primary-color); }
            .tm-shop-category-content {
                display: none; /* Hide all categories by default */
            }
            .tm-shop-category-content.active {
                display: block; /* Show only the active one */
            }
            .tm-shop-item {
                border: none;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
                background: linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1), 
                            0 1px 3px rgba(0,0,0,0.06);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                cursor: pointer;
                min-height: 160px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 6px;
            }
            .tm-shop-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(145deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                z-index: 0;
                border-radius: 12px;
            }
            .tm-shop-item:hover::before { opacity: 1; }
            .tm-shop-item:hover { 
                transform: translateY(-4px);
                box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3), 
                            0 4px 10px rgba(0,0,0,0.1);
            }
            .tm-shop-item.owned { 
                background: linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%);
                border-left: 3px solid #4caf50;
            }
            .tm-shop-item.currently-equipped {
                background: linear-gradient(145deg, #fff9e6 0%, #ffe9b3 100%);
                border: 2px solid #ffc107;
                box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2),
                            0 4px 12px rgba(255, 193, 7, 0.3);
            }
            .tm-shop-equipped-badge {
                position: absolute;
                top: 6px;
                right: 6px;
                background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
                color: #fff;
                padding: 4px 8px;
                border-radius: 10px;
                font-size: 9px;
                font-weight: bold;
                z-index: 1;
                box-shadow: 0 2px 6px rgba(255, 152, 0, 0.4);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tm-shop-item-icon { 
                font-size: 48px; 
                margin-bottom: 6px; 
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 52px;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
                transition: transform 0.3s ease;
                position: relative;
                z-index: 1;
                pointer-events: none;
            }
            .tm-shop-item-icon svg {
                width: 48px;
                height: 48px;
                filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
            }
            .tm-shop-item:hover .tm-shop-item-icon {
                transform: scale(1.12) translateY(-2px);
            }
            .tm-shop-item.currently-equipped .tm-shop-item-icon {
                animation: tm-shop-icon-pulse 2s ease-in-out infinite;
            }
            @keyframes tm-shop-icon-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
            }
            .tm-shop-item-name { 
                font-weight: 600; 
                font-size: 13px; 
                margin-bottom: 4px;
                color: var(--tm-primary-color);
                position: relative;
                z-index: 1;
                pointer-events: none;
                line-height: 1.4;
            }
            .tm-shop-item.owned .tm-shop-item-name {
                color: var(--tm-success-color);
            }
            .tm-shop-item.currently-equipped .tm-shop-item-name {
                color: var(--tm-warning-color);
                font-weight: 700;
            }
            .tm-shop-item-desc {
                font-size: 11px;
                color: var(--tm-primary-color);
                text-align: center;
                margin: 4px 0;
                padding: 0 8px;
                line-height: 1.3;
                font-style: italic;
                opacity: 0.8;
                pointer-events: none;
            }
            .tm-shop-item-cost { 
                font-size: 12px; 
                color: var(--tm-primary-color); 
                margin: 4px 0;
                font-weight: 500;
                position: relative;
                z-index: 1;
                pointer-events: none;
            }
            .tm-shop-item-btn {
                width: 100%; 
                padding: 8px; 
                border: none;
                border-radius: 8px;
                cursor: pointer; 
                font-weight: 600; 
                font-size: 11px;
                color: white; 
                margin-top: 8px;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                z-index: 10;
                pointer-events: auto;
            }
            .tm-shop-item-btn.buy { 
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                box-shadow: 0 3px 10px rgba(79, 172, 254, 0.4);
            }
            .tm-shop-item-btn.buy:hover { 
                background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(79, 172, 254, 0.5);
            }
            .tm-shop-item-btn.equip { 
                background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
                box-shadow: 0 3px 10px rgba(67, 160, 71, 0.4);
            }
            .tm-shop-item-btn.equip:hover { 
                background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(67, 160, 71, 0.5);
            }
            .tm-shop-item-btn.equipped { 
                background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
                cursor: pointer;
                box-shadow: 0 3px 10px rgba(255, 152, 0, 0.4);
                animation: tm-shop-equipped-glow 2s ease-in-out infinite;
            }
            .tm-shop-item-btn.equipped:hover {
                background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(229, 57, 53, 0.5);
            }
            .tm-shop-item-btn:disabled { 
                background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
                box-shadow: none;
                cursor: not-allowed;
                opacity: 0.6;
            }
            @keyframes tm-shop-equipped-glow {
                0%, 100% { box-shadow: 0 3px 10px rgba(255, 152, 0, 0.4); }
                50% { box-shadow: 0 4px 15px rgba(255, 152, 0, 0.6), 0 0 25px rgba(255, 152, 0, 0.3); }
            }
            
            /* Boss battle shake animation */
            @keyframes bossShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-3px); }
                75% { transform: translateX(3px); }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes talentBadgePulse {
                0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 3px 8px rgba(255, 82, 82, 0.5);
                }
                50% { 
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.8), 0 0 20px rgba(255, 82, 82, 0.4);
                }
            }

            /* --- Feature: Memory Mini-Game --- */
            #tm-memory-game-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.7); z-index: 10001;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 20px;
            }
            #tm-memory-game-status {
                background: rgba(0,0,0,0.8); color: white; padding: 15px 25px;
                border-radius: 10px; font-size: 24px; font-weight: bold;
                text-align: center;
            }
            #tm-memory-game-mascot-container {
                position: relative; width: 200px; height: 200px;
            }
            #tm-memory-game-mascot-container .tm-mascot-robot {
                width: 100%; height: 100%;
            }
            .tm-memory-game-pad {
                position: absolute;
                border-radius: 50%;
                cursor: pointer;
                background: rgba(255,255,255,0.1);
                border: 2px dashed white;
                transition: background-color 0.1s;
            }
            .tm-memory-game-pad.active {
                background: rgba(255,255,255,0.8);
                transform: scale(1.1);
            }

            /* --- Feature: Bug Squish Mini-Game --- */
            #tm-game-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.2); z-index: 10001;
                cursor: crosshair;
            }
            #tm-game-ui {
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.7); color: white; padding: 10px 20px;
                border-radius: 10px; font-size: 24px; font-weight: bold;
                display: flex; gap: 30px; z-index: 10002;
            }
            .tm-game-bug {
                position: absolute;
                font-size: 32px;
                cursor: pointer;
                user-select: none;
                transition: transform 0.2s ease-out;
                animation: tm-bug-crawl 8s linear infinite;
            }
            .tm-game-bug:hover {
                transform: scale(1.2);
            }
            .tm-game-bug.squished {
                animation: tm-bug-squish 0.3s forwards;
                pointer-events: none;
            }
            @keyframes tm-bug-squish {
                0% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(0.5) rotate(90deg); opacity: 0; }
            }
            @keyframes tm-bug-crawl {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(20px, 10px) rotate(15deg); }
                50% { transform: translate(0px, 20px) rotate(0deg); }
                75% { transform: translate(-20px, 10px) rotate(-15deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
            #tm-game-end-screen {
                text-align: center;
            }

            /* --- Feature: Daily Quests (Bounties) --- */
            #tm-quests-container {
                display: flex; flex-direction: column; gap: 15px; padding: 10px;
            }
            .tm-quest-item {
                display: flex; align-items: center; gap: 15px;
                background: #f8f9fa; border: 1px solid #dee2e6;
                border-radius: 8px; padding: 10px;
                transition: all 0.3s;
            }
            .tm-quest-item.completed {
                background: #e8f5e9; /* Light green */
                border-color: #a5d6a7;
                opacity: 0.7;
            }
            .tm-quest-status-icon { font-size: 24px; }
            .tm-quest-details { flex-grow: 1; }
            .tm-quest-description { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .tm-quest-progress-bar {
                height: 8px; background: #e9ecef; border-radius: 4px;
                overflow: hidden; border: 1px solid #ccc;
            }
            .tm-quest-progress-bar div {
                height: 100%; background-color: var(--tm-success-color);
                transition: width 0.5s ease-out;
            }
            .tm-quest-item.completed .tm-quest-progress-bar div {
                background-color: #66bb6a; /* Darker green for completed */
            }
            .tm-quest-progress-text {
                font-size: 11px; color: #6c757d; text-align: right;
                margin-top: 2px;
            }
            .tm-quest-reward {
                font-weight: bold; font-size: 13px; color: #4CAF50;
                background: #f1f8e9; padding: 5px 8px; border-radius: 5px;
                white-space: nowrap;
            }
            .tm-quest-actions { display: flex; flex-direction: column; gap: 5px; }
            .tm-quest-reroll-btn { background: var(--tm-info-color); color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 14px; cursor: pointer; }
            .tm-quest-reroll-btn:hover { background: var(--tm-info-hover); }
            .tm-quest-reroll-btn:disabled { background: var(--tm-secondary-color); cursor: not-allowed; }
            #tm-reroll-token-display { font-size: 14px; font-weight: bold; color: var(--tm-info-color); margin: 0 15px; }
            .tm-quest-item.completed .tm-quest-reward {
                color: #388e3c;
                text-decoration: line-through;
            }

            /* --- Titles Modal --- */
            #tm-titles-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                max-height: 60vh;
                overflow-y: auto;
            }
            .tm-title-item {
                display: flex;
                align-items: center;
                gap: 15px;
                background: var(--tm-dark-color);
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 12px 15px;
                transition: all 0.2s;
            }
            .tm-title-item.locked {
                opacity: 0.5;
                filter: grayscale(60%);
            }
            .tm-title-item.unlocked {
                border-left: 4px solid var(--tm-success-color);
            }
            .tm-title-level {
                font-weight: bold;
                font-size: 14px;
                color: #fff;
                background-color: var(--tm-secondary-color);
                padding: 4px 8px;
                border-radius: 5px;
                min-width: 50px;
                text-align: center;
            }
            .tm-title-name {
                font-weight: bold;
                font-size: 16px;
                flex-grow: 1;
            }




            /* --- Feature: Positive Message --- */
            #tm-positive-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 123, 255, 0.9);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-size: 20px;
                font-weight: bold;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.5s ease-out;
                pointer-events: none;
            }

            /* --- Feature: Automated Parts Search Sidebar --- */
            #tm-auto-parts-sidebar {
                position: fixed; top: 80px; left: 10px; width: 280px;
                max-height: calc(100vh - 100px); background: #f9f9f9;
                border: 1px solid #ccc; border-radius: 8px; z-index: 9995;
                box-shadow: 0 3px 10px rgba(0,0,0,0.15); display: flex;
                flex-direction: column; font-size: 13px;
            }
            #tm-auto-parts-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 8px 12px; background: #e9ecef; border-bottom: 1px solid #ccc;
            }
            #tm-auto-parts-title { font-weight: bold; color: #333; }
            #tm-auto-parts-close { background: none; border: none; font-size: 20px; cursor: pointer; }
            #tm-auto-parts-content { padding: 10px; overflow-y: auto; }
            .tm-parts-category { margin-bottom: 15px; }
            .tm-parts-category-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px; }
            .tm-parts-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; }
            .tm-parts-list-item a { display: block; padding: 4px 6px; border-radius: 4px; text-decoration: none; color: var(--tm-primary-color); background: #fff; border: 1px solid #eee; }
            .tm-parts-list-item a:hover { background: #e7f1ff; }
            .tm-parts-loading, .tm-parts-not-found { color: #888; font-style: italic; }
        `);
    }
    // Make the function globally accessible
    window.addGlobalStyles = addGlobalStyles;

    function bootstrapStylesAndReveal() {
        const pathname = window.location.pathname || '';
        if (pathname.includes('login.php')) return;
        if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

        try {
            if (typeof GM_getValue === 'function' && GM_getValue('tm_script_enabled', true) === false) return;
        } catch (_) { /* ignore */ }

        if (typeof window.tmApplyThemeColors === 'function' && typeof window.tmReadEquippedThemeId === 'function') {
            window.tmApplyThemeColors(window.tmReadEquippedThemeId());
        }

        addGlobalStyles();

        if (typeof window.tmRevealThemedPageIfReady === 'function') {
            window.tmRevealThemedPageIfReady();
        }
    }

    bootstrapStylesAndReveal();
})();