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
            #tm-footer-suite-brand {
                display: inline-flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
                width: 100%;
                padding: 0 8px;
                box-sizing: border-box;
            }
            .tm-footer-version-label {
                margin: 0;
                padding: 0;
                border: none;
                background: none;
                font: inherit;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.02em;
                opacity: 0.9;
                white-space: nowrap;
                color: inherit;
                cursor: pointer;
                text-decoration: none;
            }
            .tm-footer-version-label:hover {
                opacity: 1;
                text-decoration: underline;
            }
            .tm-footer-loader-update-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 22px;
                height: 22px;
                padding: 0;
                border: 1px solid rgba(96, 165, 250, 0.55);
                border-radius: 50%;
                background: rgba(59, 130, 246, 0.18);
                color: #93c5fd;
                cursor: pointer;
                flex-shrink: 0;
                animation: tm-loader-update-pulse 2s ease-in-out infinite;
            }
            .tm-footer-loader-update-btn:hover {
                background: rgba(59, 130, 246, 0.35);
                color: #dbeafe;
            }
            .tm-footer-loader-update-btn[hidden] {
                display: none !important;
            }
            @keyframes tm-loader-update-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.35); }
                50% { box-shadow: 0 0 0 4px rgba(96, 165, 250, 0); }
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
                --tm-shop-item-text: #343a40;
                --tm-text-on-primary: #ffffff;
                --tm-text-on-success: #ffffff;
                --tm-text-on-light: #343a40;
                --tm-text-on-dark: #cccccc;
                --tm-modal-bg: #ffffff;
                --tm-surface-bg: #f8f9fa;
                --tm-panel-bg: #ffffff;
                --tm-glass-bg: linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
                --tm-glass-border: rgba(255,255,255,0.2);
                --tm-widget-text: #ffffff;
                --tm-xp-fill-start: #ffc107;
                --tm-xp-fill-end: #e0a800;
                --tm-coin-color: #ffc107;
                --tm-header-bar-bg: #ffffff;
                --tm-footer-bar-bg: #23272b;
                --tm-header-bar-text: #343a40;
                --tm-footer-bar-text: #f4f4f4;
                --tm-footer-text: #f4f4f4;
                --tm-count-badge-bg: #23272b;
                --tm-count-badge-text: #17a2b8;
                --tm-grid-header-bg: #23272b;
                --tm-grid-header-text: #007bff;
                --tm-row-highlight-danger-bg: rgba(220, 53, 69, 0.32);
                --tm-row-highlight-success-bg: rgba(40, 167, 69, 0.26);
                --tm-overlay-dim: rgba(0, 0, 0, 0.65);
                --tm-price-color: #28a745;
                --tm-price-border: #28a745;
                --tm-price-bg: rgba(40, 167, 69, 0.12);
                --tm-success-color-rgb: 40, 167, 69;
                --tm-chip-bg: rgba(128, 128, 128, 0.13);
                --tm-chip-border: rgba(128, 128, 128, 0.22);
                --tm-chip-text: #343a40;
                --tm-subtle-text: #6c757d;
                --tm-muted-text: #6c757d;
                --tm-shadow-color: rgba(0, 0, 0, 0.15);
                --tm-footer-control-height: 40px;
            }
            .tm-phone-catalog-overlay { background: var(--tm-overlay-dim) !important; }
            .tm-phone-modal-content {
                background: var(--tm-modal-bg, var(--tm-shop-item-bg));
                color: var(--tm-primary-color);
            }
            .tm-phone-price-pill, .tm-os-price-pill {
                color: var(--tm-price-color, var(--tm-success-color));
                border: 1px solid var(--tm-price-border, var(--tm-success-color));
                background: var(--tm-price-bg, rgba(var(--tm-success-color-rgb, 40, 167, 69), 0.12));
            }
            .tm-phone-barcode, .tm-os-barcode {
                color: var(--tm-subtle-text, var(--tm-shop-item-text));
                background: var(--tm-chip-bg);
                border: 1px solid var(--tm-chip-border);
            }
            .tm-phone-storage-chip {
                background: var(--tm-chip-bg);
                border: 1px solid var(--tm-chip-border);
                color: var(--tm-chip-text, var(--tm-shop-item-text));
            }
            .tm-phone-buyback-badge {
                background: color-mix(in srgb, var(--tm-info-color) 14%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-info-color) 35%, transparent);
                color: var(--tm-info-color);
            }
            /* Order history panel (default / base tokens) */
            .tm-oh-overlay { background: var(--tm-overlay-dim) !important; }
            .tm-oh-shell {
                background: var(--tm-modal-bg, var(--tm-shop-item-bg));
                color: var(--tm-primary-color);
                border: 1px solid var(--tm-shop-item-border);
            }
            .tm-oh-hero {
                background: linear-gradient(135deg, color-mix(in srgb, var(--tm-primary-color) 14%, transparent) 0%, transparent 70%);
                border-bottom: 1px solid var(--tm-shop-item-border);
            }
            .tm-oh-title { color: var(--tm-shop-item-text, var(--tm-primary-color)); }
            .tm-oh-subtitle { color: var(--tm-muted-text, var(--tm-secondary-color)); }
            .tm-oh-page-badge {
                background: color-mix(in srgb, var(--tm-info-color) 14%, transparent);
                color: var(--tm-info-color);
                border: 1px solid color-mix(in srgb, var(--tm-info-color) 32%, transparent);
            }
            .tm-oh-stat {
                background: var(--tm-chip-bg);
                border: 1px solid var(--tm-chip-border);
            }
            .tm-oh-stat-value { color: var(--tm-info-color); }
            .tm-oh-stat-label { color: var(--tm-muted-text); }
            .tm-oh-tool-btn, .tm-oh-close, .tm-oh-preset, .tm-oh-input, .tm-oh-select, .tm-order-filter-input {
                background: var(--tm-shop-item-bg);
                border: 1px solid var(--tm-shop-item-border);
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-oh-preset.is-active {
                background: var(--tm-primary-color);
                border-color: var(--tm-primary-color);
                color: var(--tm-text-on-primary, #fff);
            }
            .tm-oh-filters, .tm-oh-body { background: var(--tm-shop-item-owned-bg, var(--tm-shop-item-bg)); }
            .tm-oh-table-wrap {
                background: var(--tm-shop-item-bg);
                border: 1px solid var(--tm-shop-item-border);
            }
            .tm-order-history-table thead th {
                background: var(--tm-grid-header-bg, var(--tm-shop-item-hover-bg));
                color: var(--tm-grid-header-text, var(--tm-primary-color));
                border-bottom: 1px solid var(--tm-shop-item-border);
            }
            .tm-order-history-table tbody tr.tm-order-history-row:hover {
                background: var(--tm-shop-item-hover-bg);
            }
            .tm-order-history-table td { color: var(--tm-shop-item-text, var(--tm-primary-color)); }
            .tm-oh-badge--active {
                background: color-mix(in srgb, var(--tm-success-color) 14%, transparent);
                color: var(--tm-success-color);
                border: 1px solid color-mix(in srgb, var(--tm-success-color) 30%, transparent);
            }
            .tm-oh-badge--removed {
                background: color-mix(in srgb, var(--tm-danger-color) 12%, transparent);
                color: var(--tm-danger-color);
                border: 1px solid color-mix(in srgb, var(--tm-danger-color) 28%, transparent);
            }
            .tm-oh-badge--unknown {
                background: color-mix(in srgb, var(--tm-warning-color) 12%, transparent);
                color: var(--tm-warning-color);
                border: 1px solid color-mix(in srgb, var(--tm-warning-color) 28%, transparent);
            }
            /* Order link popup (status 65) */
            .tm-order-popup-overlay,
            #tm-order-popup {
                position: fixed;
                inset: 0;
                background: var(--tm-overlay-dim, rgba(0, 0, 0, 0.65));
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000001;
                animation: tm-fade-in 0.2s ease-out;
            }
            .tm-order-popup-content {
                background: var(--tm-modal-bg, var(--tm-panel-bg, #ffffff));
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                border-radius: 12px;
                box-shadow: 0 10px 40px var(--tm-shadow-color, rgba(0, 0, 0, 0.3));
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                animation: tm-scale-up 0.3s ease-out;
            }
            .tm-order-popup-header {
                padding: 20px;
                border-bottom: 1px solid var(--tm-shop-item-border, #dee2e6);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, color-mix(in srgb, var(--tm-info-color) 22%, var(--tm-modal-bg, #ffffff)) 0%, color-mix(in srgb, var(--tm-primary-color) 12%, var(--tm-modal-bg, #ffffff)) 100%);
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                border-radius: 12px 12px 0 0;
            }
            .tm-order-popup-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-order-popup-close {
                background: color-mix(in srgb, var(--tm-shop-item-text, #333) 12%, transparent);
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                font-size: 24px;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
            }
            .tm-order-popup-close:hover {
                background: color-mix(in srgb, var(--tm-danger-color) 16%, transparent);
                border-color: var(--tm-danger-color);
                color: var(--tm-danger-color);
                transform: scale(1.05);
            }
            .tm-order-popup-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
                min-height: 0;
                background: var(--tm-modal-bg, var(--tm-panel-bg, #ffffff));
            }
            .tm-order-popup-error {
                color: var(--tm-danger-color);
                text-align: center;
                padding: 30px 20px;
                font-size: 15px;
                background: color-mix(in srgb, var(--tm-danger-color) 10%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-danger-color) 28%, transparent);
                border-radius: 8px;
                margin: 10px;
            }
            .tm-order-card-new {
                background: var(--tm-shop-item-bg, #f8f9fa);
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                border-radius: 12px;
                padding: 0;
                box-shadow: 0 4px 12px var(--tm-shadow-color, rgba(0, 0, 0, 0.08));
                overflow: hidden;
                margin-bottom: 20px;
            }
            .tm-order-header {
                background: linear-gradient(135deg, color-mix(in srgb, var(--tm-info-color) 28%, var(--tm-modal-bg, #fff)) 0%, color-mix(in srgb, var(--tm-primary-color) 18%, var(--tm-modal-bg, #fff)) 100%);
                padding: 20px;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-order-product-name {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 5px;
                line-height: 1.3;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-order-product-code {
                font-size: 13px;
                opacity: 0.85;
                font-family: monospace;
                color: var(--tm-muted-text, var(--tm-secondary-color));
            }
            .tm-order-cost-badge {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: color-mix(in srgb, var(--tm-info-color) 8%, transparent);
                border-left: 4px solid var(--tm-info-color);
            }
            .tm-cost-label {
                font-size: 12px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            .tm-cost-value {
                font-size: 22px;
                font-weight: 700;
                color: var(--tm-info-color);
            }
            .tm-order-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                padding: 20px;
            }
            .tm-order-info-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 12px;
                background: var(--tm-modal-bg, var(--tm-panel-bg, #ffffff));
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                border-radius: 8px;
                box-shadow: 0 1px 3px var(--tm-shadow-color, rgba(0, 0, 0, 0.06));
                transition: box-shadow 0.2s ease, transform 0.2s ease;
            }
            .tm-order-info-item:hover {
                box-shadow: 0 2px 6px var(--tm-shadow-color, rgba(0, 0, 0, 0.1));
                transform: translateY(-1px);
            }
            .tm-info-label {
                font-size: 11px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
                font-weight: 600;
            }
            .tm-info-value {
                font-size: 14px;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                font-weight: 600;
                word-break: break-word;
            }
            .tm-order-notes {
                padding: 20px;
                background: color-mix(in srgb, var(--tm-warning-color) 6%, var(--tm-modal-bg, #fff));
                border-top: 1px solid var(--tm-shop-item-border, #dee2e6);
            }
            .tm-note-item {
                padding: 12px 15px;
                background: var(--tm-modal-bg, var(--tm-panel-bg, #ffffff));
                border-radius: 6px;
                margin-bottom: 10px;
                font-size: 13px;
                line-height: 1.5;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                border-left: 3px solid var(--tm-warning-color);
            }
            .tm-note-item strong {
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                display: block;
                margin-bottom: 4px;
            }
            .tm-order-action-btn,
            .tm-order-view-full-btn {
                display: block;
                text-align: center;
                padding: 15px;
                background: var(--tm-primary-color);
                color: var(--tm-text-on-primary, #ffffff);
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
                border: 1px solid var(--tm-primary-color);
            }
            .tm-order-view-full-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                margin-top: 15px;
            }
            .tm-order-action-btn:hover,
            .tm-order-view-full-btn:hover {
                background: var(--tm-primary-hover);
                border-color: var(--tm-primary-hover);
                color: var(--tm-text-on-primary, #ffffff);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px var(--tm-shadow-color, rgba(0, 0, 0, 0.15));
            }
            /* Repair reminder popover (service_edit) */
            .tm-repair-reminder-backdrop,
            #tm-repair-reminder-backdrop {
                position: fixed;
                inset: 0;
                background: var(--tm-overlay-dim, rgba(0, 0, 0, 0.55));
                z-index: 2147482999;
            }
            .tm-repair-reminder-popover,
            #tm-repair-reminder-popover {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: calc(100vw - 32px);
                max-width: 360px;
                max-height: calc(100vh - 32px);
                overflow-y: auto;
                box-sizing: border-box;
                background: var(--tm-modal-bg, var(--tm-panel-bg, #ffffff));
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                border-radius: 14px;
                padding: 14px;
                box-shadow: 0 12px 40px var(--tm-shadow-color, rgba(0, 0, 0, 0.45));
                z-index: 2147483000;
            }
            .tm-rr-hidden { display: none !important; }
            .tm-rr-inner { position: relative; }
            .tm-rr-title {
                font-weight: 700;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                margin-bottom: 8px;
                font-size: 13px;
                padding-right: 22px;
            }
            .tm-rr-close {
                position: absolute;
                top: 0;
                right: 0;
                background: none;
                border: none;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
                padding: 0;
            }
            .tm-rr-close:hover { color: var(--tm-danger-color); }
            .tm-rr-label {
                display: block;
                font-size: 11px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                margin-bottom: 4px;
            }
            .tm-rr-input,
            .tm-rr-select,
            .tm-rr-textarea {
                width: 100%;
                box-sizing: border-box;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                background: var(--tm-input-bg, var(--tm-shop-item-bg, #f8f9fa));
                color: var(--tm-input-text, var(--tm-shop-item-text, var(--tm-primary-color)));
                font-size: 13px;
                margin-bottom: 10px;
            }
            .tm-rr-textarea {
                min-height: 72px;
                resize: vertical;
                font-family: inherit;
                line-height: 1.4;
            }
            .tm-rr-quick-row {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 12px;
            }
            .tm-rr-quick {
                flex: 1;
                min-width: 72px;
                padding: 6px;
                font-size: 11px;
                border-radius: 8px;
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                background: var(--tm-chip-bg, var(--tm-shop-item-hover-bg));
                color: var(--tm-chip-text, var(--tm-shop-item-text, var(--tm-primary-color)));
                cursor: pointer;
                transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
            }
            .tm-rr-quick--wide { min-width: 100%; }
            .tm-rr-quick:hover {
                background: var(--tm-shop-item-hover-bg);
                border-color: var(--tm-primary-color);
                color: var(--tm-primary-color);
            }
            .tm-rr-save {
                width: 100%;
                padding: 10px;
                border-radius: 10px;
                border: 1px solid var(--tm-primary-color);
                background: var(--tm-primary-color);
                color: var(--tm-text-on-primary, #ffffff);
                font-weight: 700;
                cursor: pointer;
                font-size: 13px;
                transition: background-color 0.15s ease, border-color 0.15s ease;
            }
            .tm-rr-save:hover {
                background: var(--tm-primary-hover);
                border-color: var(--tm-primary-hover);
            }
            .tm-rr-list {
                margin-top: 12px;
                padding-top: 10px;
                border-top: 1px solid var(--tm-shop-item-border, #dee2e6);
                font-size: 11px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                max-height: 120px;
                overflow-y: auto;
            }
            .tm-rr-list-empty { opacity: 0.75; }
            .tm-rr-list-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 6px;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-rr-del {
                flex-shrink: 0;
                background: color-mix(in srgb, var(--tm-danger-color) 18%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-danger-color) 38%, transparent);
                color: var(--tm-danger-color);
                border-radius: 6px;
                padding: 2px 8px;
                cursor: pointer;
                font-size: 10px;
            }
            .tm-rr-del:hover {
                background: var(--tm-danger-color);
                color: var(--tm-text-on-primary, #fff);
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
                max-width: 460px;
                max-height: min(85vh, calc(100vh - 32px));
                background: var(--tm-panel-bg, var(--tm-modal-bg, var(--tm-shop-item-bg, var(--tm-dark-color)))) !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                border: 1px solid var(--tm-shop-item-border) !important;
                border-radius: 16px;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
                z-index: 2147482999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-sizing: border-box;
            }
            .tm-notification-header {
                padding: 14px 16px;
                border-bottom: 1px solid var(--tm-shop-item-border, #dee2e6) !important;
                background: var(--tm-notification-header-bg, #ffffff) !important;
                color: var(--tm-notification-header-text, #212529) !important;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .tm-notification-header h4 {
                margin: 0;
                font-size: 15px;
                font-weight: 700;
                letter-spacing: 0.01em;
                color: var(--tm-notification-header-text, #212529) !important;
                flex: 1;
                min-width: 0;
            }
            .tm-notification-header-actions {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
            }
            .tm-notif-header-btn {
                padding: 5px 10px;
                border-radius: 8px;
                border: 1px solid var(--tm-shop-item-border, #dee2e6) !important;
                background: color-mix(in srgb, var(--tm-notification-header-text, #212529) 6%, transparent);
                color: var(--tm-notification-header-text, #495057) !important;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                line-height: 1.3;
                white-space: nowrap;
                text-decoration: none;
                transition: background 0.15s, border-color 0.15s;
            }
            .tm-notif-header-btn:hover {
                background: color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
                border-color: color-mix(in srgb, var(--tm-primary-color) 35%, var(--tm-shop-item-border)) !important;
            }
            .tm-notif-header-btn--danger {
                color: var(--tm-danger-color) !important;
                border-color: color-mix(in srgb, var(--tm-danger-color) 35%, var(--tm-shop-item-border)) !important;
                background: color-mix(in srgb, var(--tm-danger-color) 8%, transparent);
            }
            .tm-notif-header-btn--danger:hover {
                background: color-mix(in srgb, var(--tm-danger-color) 16%, transparent);
            }
            #tm-notification-panel-close {
                font-size: 22px !important;
                line-height: 1;
                text-decoration: none !important;
                opacity: 0.75;
                border: none !important;
                background: transparent !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                padding: 2px 6px !important;
                cursor: pointer;
            }
            #tm-notification-panel-close:hover { opacity: 1; }
            .tm-notification-tabs {
                display: flex;
                gap: 6px;
                padding: 8px 10px;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 3%, transparent);
            }
            .tm-notif-tab {
                flex: 1;
                padding: 9px 12px;
                border: 1px solid transparent;
                border-radius: 10px;
                background: transparent;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                transition: background 0.15s, color 0.15s, border-color 0.15s;
            }
            .tm-notif-tab:hover {
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 5%, transparent);
            }
            .tm-notif-tab.active {
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                background: color-mix(in srgb, var(--tm-primary-color) 12%, transparent);
                border-color: color-mix(in srgb, var(--tm-primary-color) 28%, var(--tm-shop-item-border)) !important;
            }
            .tm-notification-tab-panel {
                flex-grow: 1;
                overflow-y: auto;
                display: none;
                background: var(--tm-panel-bg, var(--tm-modal-bg, var(--tm-shop-item-bg, var(--tm-dark-color)))) !important;
            }
            .tm-notification-tab-panel.active { display: block; }
            #tm-notification-list {
                flex-grow: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 10px 12px 14px;
                background: transparent !important;
            }
            /* Legacy row layout (fallback) */
            .tm-notification-item {
                display: flex; gap: 10px; padding: 10px;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                cursor: pointer;
            }
            .tm-notification-item:last-child { border-bottom: none; }
            .tm-notification-item.unread {
                background: color-mix(in srgb, var(--tm-info-color) 10%, transparent) !important;
            }
            .tm-notification-icon { font-size: 18px; flex-shrink: 0; }
            .tm-notification-content { flex-grow: 1; }
            .tm-notification-message {
                font-size: 14px;
                line-height: 1.4;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            }
            .tm-notification-timestamp {
                font-size: 11px;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                margin-top: 4px;
            }
            /* Notification history cards */
            .tm-notif-history-card {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1px solid var(--tm-shop-item-border) !important;
                background: var(--tm-shop-item-bg, rgba(255, 255, 255, 0.03)) !important;
                cursor: pointer;
                transition: background 0.15s, border-color 0.15s, transform 0.12s;
            }
            .tm-notif-history-card:hover {
                border-color: color-mix(in srgb, var(--tm-primary-color) 30%, var(--tm-shop-item-border)) !important;
                background: var(--tm-shop-item-hover-bg, color-mix(in srgb, var(--tm-primary-color) 6%, transparent)) !important;
            }
            .tm-notif-history-card.unread {
                border-color: color-mix(in srgb, var(--tm-info-color) 35%, var(--tm-shop-item-border)) !important;
                background: color-mix(in srgb, var(--tm-info-color) 9%, var(--tm-shop-item-bg, transparent)) !important;
                box-shadow: inset 3px 0 0 var(--tm-info-color);
            }
            .tm-notif-history-card.read {
                opacity: 0.88;
            }
            .tm-notif-history-icon-wrap {
                flex-shrink: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                font-size: 18px;
                line-height: 1;
                background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-primary-color) 18%, transparent);
            }
            .tm-notif-history-card.unread .tm-notif-history-icon-wrap {
                background: color-mix(in srgb, var(--tm-info-color) 14%, transparent);
                border-color: color-mix(in srgb, var(--tm-info-color) 28%, transparent);
            }
            .tm-notif-history-body { flex: 1; min-width: 0; }
            .tm-notif-history-message {
                font-size: 13px;
                font-weight: 500;
                line-height: 1.45;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                word-break: break-word;
            }
            .tm-notif-history-card.read .tm-notif-history-message {
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                font-weight: 400;
            }
            .tm-notif-history-meta {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 6px;
            }
            .tm-notif-history-time {
                font-size: 11px;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
            }
            .tm-notif-unread-pill {
                display: inline-flex;
                align-items: center;
                padding: 1px 7px;
                border-radius: 999px;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: var(--tm-info-color) !important;
                background: color-mix(in srgb, var(--tm-info-color) 16%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-info-color) 30%, transparent);
            }
            #tm-notification-empty-state {
                text-align: center;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                padding: 36px 24px 44px;
            }
            #tm-notification-empty-state.tm-notif-empty--compact {
                padding: 28px 16px 32px;
            }
            .tm-notif-empty-icon {
                font-size: 32px;
                line-height: 1;
                margin-bottom: 10px;
                opacity: 0.55;
            }
            .tm-notif-empty-title {
                font-size: 14px;
                font-weight: 700;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                margin-bottom: 6px;
            }
            .tm-notif-empty-hint {
                font-size: 12px;
                line-height: 1.45;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                max-width: 260px;
                margin: 0 auto;
            }
            #tm-notification-list, #tm-active-alerts-list { padding: 8px; }
            .tm-alerts-active-section,
            .tm-alerts-history-section {
                padding-bottom: 4px;
            }
            #tm-active-alerts-list,
            #tm-reminders-history-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 8px 10px 12px;
            }
            .tm-reminder-card {
                border-radius: 12px;
                border: 1px solid var(--tm-shop-item-border) !important;
                background: var(--tm-shop-item-bg) !important;
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }
            .tm-reminder-card--scheduled {
                border-color: color-mix(in srgb, var(--tm-info-color) 35%, var(--tm-shop-item-border)) !important;
                background: color-mix(in srgb, var(--tm-info-color) 7%, var(--tm-shop-item-bg)) !important;
            }
            .tm-reminder-card--overdue {
                border-color: color-mix(in srgb, var(--tm-danger-color) 40%, var(--tm-shop-item-border)) !important;
                background: color-mix(in srgb, var(--tm-danger-color) 8%, var(--tm-shop-item-bg)) !important;
            }
            .tm-reminder-card--live {
                border-color: color-mix(in srgb, var(--tm-warning-color) 45%, var(--tm-shop-item-border)) !important;
                background: color-mix(in srgb, var(--tm-warning-color) 10%, var(--tm-shop-item-bg)) !important;
                box-shadow: 0 0 0 1px color-mix(in srgb, var(--tm-warning-color) 12%, transparent), 0 4px 14px rgba(0, 0, 0, 0.1);
            }
            .tm-reminder-card--history {
                opacity: 0.95;
                box-shadow: none;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 3%, var(--tm-shop-item-bg)) !important;
            }
            .tm-reminder-card--history-fired { border-left: 3px solid var(--tm-warning-color) !important; }
            .tm-reminder-card--history-snoozed { border-left: 3px solid var(--tm-info-color) !important; }
            .tm-reminder-card--history-dismissed { border-left: 3px solid var(--tm-muted-text, var(--tm-secondary-color)) !important; }
            .tm-reminder-card--history-cancelled { border-left: 3px solid var(--tm-danger-color) !important; }
            .tm-reminder-card-header {
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            .tm-reminder-card-icon {
                font-size: 22px;
                line-height: 1;
                flex-shrink: 0;
                width: 28px;
                text-align: center;
            }
            .tm-reminder-card-head-text {
                flex: 1;
                min-width: 0;
            }
            .tm-reminder-card-title {
                font-size: 14px;
                font-weight: 700;
                line-height: 1.35;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                margin-bottom: 6px;
                word-break: break-word;
            }
            .tm-reminder-card-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .tm-reminder-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.02em;
                line-height: 1.5;
                border: 1px solid transparent;
            }
            .tm-reminder-badge--source {
                background: color-mix(in srgb, var(--tm-muted-text, var(--tm-secondary-color)) 16%, transparent);
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                border-color: color-mix(in srgb, var(--tm-muted-text, var(--tm-secondary-color)) 28%, transparent);
            }
            .tm-reminder-badge--scheduled {
                background: color-mix(in srgb, var(--tm-info-color) 16%, transparent);
                color: var(--tm-info-color) !important;
                border-color: color-mix(in srgb, var(--tm-info-color) 35%, transparent);
            }
            .tm-reminder-badge--overdue {
                background: color-mix(in srgb, var(--tm-danger-color) 16%, transparent);
                color: var(--tm-danger-color) !important;
                border-color: color-mix(in srgb, var(--tm-danger-color) 38%, transparent);
            }
            .tm-reminder-badge--live {
                background: color-mix(in srgb, var(--tm-warning-color) 20%, transparent);
                color: var(--tm-warning-color) !important;
                border-color: color-mix(in srgb, var(--tm-warning-color) 40%, transparent);
            }
            .tm-reminder-badge--fired {
                background: color-mix(in srgb, var(--tm-warning-color) 16%, transparent);
                color: var(--tm-warning-color) !important;
                border-color: color-mix(in srgb, var(--tm-warning-color) 32%, transparent);
            }
            .tm-reminder-badge--snoozed {
                background: color-mix(in srgb, var(--tm-info-color) 16%, transparent);
                color: var(--tm-info-color) !important;
                border-color: color-mix(in srgb, var(--tm-info-color) 32%, transparent);
            }
            .tm-reminder-badge--dismissed,
            .tm-reminder-badge--closed {
                background: color-mix(in srgb, var(--tm-muted-text, var(--tm-secondary-color)) 14%, transparent);
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                border-color: color-mix(in srgb, var(--tm-muted-text, var(--tm-secondary-color)) 26%, transparent);
            }
            .tm-reminder-badge--cancelled {
                background: color-mix(in srgb, var(--tm-danger-color) 14%, transparent);
                color: var(--tm-danger-color) !important;
                border-color: color-mix(in srgb, var(--tm-danger-color) 30%, transparent);
            }
            .tm-reminder-card-message {
                font-size: 12px;
                line-height: 1.45;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                opacity: 0.92;
                word-break: break-word;
                padding: 8px 10px;
                border-radius: 8px;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 4%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 80%, transparent);
            }
            .tm-reminder-card-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .tm-reminder-meta-chip {
                display: inline-flex;
                align-items: center;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                line-height: 1.3;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 5%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-shop-item-border) 70%, transparent);
                white-space: nowrap;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tm-reminder-card-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                padding-top: 2px;
            }
            .tm-reminder-action-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 6px 12px;
                border-radius: 8px;
                border: 1px solid color-mix(in srgb, var(--tm-info-color) 38%, transparent);
                background: color-mix(in srgb, var(--tm-info-color) 12%, transparent);
                color: var(--tm-info-color) !important;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
                white-space: nowrap;
            }
            .tm-reminder-action-link:hover {
                background: color-mix(in srgb, var(--tm-info-color) 22%, transparent);
                text-decoration: none;
            }
            .tm-reminder-action-btn {
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }
            .tm-reminder-action-btn--danger {
                border: 1px solid color-mix(in srgb, var(--tm-danger-color) 42%, transparent);
                background: color-mix(in srgb, var(--tm-danger-color) 12%, transparent);
                color: var(--tm-danger-color) !important;
            }
            .tm-reminder-action-btn--danger:hover {
                background: color-mix(in srgb, var(--tm-danger-color) 22%, transparent);
            }
            /* Legacy alert row classes (kept for cancel handler) */
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
            .tm-alerts-section-label {
                padding: 12px 14px 4px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
            }
            .tm-alerts-history-section {
                border-top: 1px solid var(--tm-shop-item-border) !important;
                margin-top: 4px;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 3%, transparent);
            }
            .tm-alerts-history-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 8px 10px 0 4px;
            }
            .tm-alerts-history-header .tm-alerts-section-label {
                padding-bottom: 0;
                padding-left: 10px;
            }
            #tm-clear-reminder-history-btn {
                padding: 5px 12px;
                border-radius: 8px;
                border: 1px solid var(--tm-shop-item-border) !important;
                background: color-mix(in srgb, var(--tm-shop-item-text, var(--tm-primary-color)) 5%, transparent);
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
            }
            #tm-clear-reminder-history-btn:hover {
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                border-color: color-mix(in srgb, var(--tm-primary-color) 35%, var(--tm-shop-item-border)) !important;
                background: color-mix(in srgb, var(--tm-primary-color) 10%, transparent);
            }
            .tm-reminder-history-search {
                display: block;
                width: calc(100% - 20px);
                margin: 8px 10px 4px;
                padding: 9px 12px;
                box-sizing: border-box;
                border: 1px solid var(--tm-shop-item-border) !important;
                border-radius: 10px;
                background: var(--tm-shop-item-bg, var(--tm-dark-hover)) !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                font-size: 12px;
            }
            .tm-reminder-history-search:focus {
                outline: none;
                border-color: color-mix(in srgb, var(--tm-info-color) 50%, var(--tm-shop-item-border)) !important;
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--tm-info-color) 18%, transparent);
            }
            .tm-reminder-history-search::placeholder {
                color: var(--tm-muted-text, var(--tm-secondary-hover)) !important;
                opacity: 0.85;
            }
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

            /* Recent Repairs popup — theme tokens */
            #tm-recent-repairs-menu {
                background: var(--tm-panel-bg, var(--tm-modal-bg, var(--tm-shop-item-bg))) !important;
                border: 1px solid var(--tm-shop-item-border) !important;
                box-shadow: 0 8px 24px var(--tm-shadow-color, rgba(0,0,0,0.25)) !important;
            }
            #tm-recent-repairs-menu,
            #tm-recent-repairs-menu * {
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repairs-header {
                background: var(--tm-panel-bg, var(--tm-modal-bg, var(--tm-shop-item-bg))) !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                border-radius: 8px 8px 0 0;
                border-bottom: 1px solid var(--tm-shop-item-border) !important;
                padding: 12px;
                font-weight: bold;
            }
            #tm-recent-repairs-menu .tm-recent-repairs-empty {
                color: var(--tm-muted-text, var(--tm-secondary-color)) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repair-item {
                border-bottom-color: var(--tm-shop-item-border) !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repair-item:hover {
                background: var(--tm-shop-item-hover-bg) !important;
                transform: translateX(4px);
            }
            #tm-recent-repairs-menu .tm-recent-repair-title {
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repair-meta {
                color: var(--tm-muted-text, var(--tm-secondary-color)) !important;
            }
            #tm-recent-repairs-menu .tm-recent-repairs-footer {
                border-top-color: var(--tm-shop-item-border) !important;
                background: var(--tm-panel-bg, var(--tm-modal-bg, var(--tm-shop-item-bg))) !important;
            }
            #tm-recent-repairs-menu #tm-clear-recent-repairs {
                background: var(--tm-danger-color) !important;
                color: var(--tm-text-on-primary, white) !important;
                border: none !important;
            }
            .tm-repair-quickview-btn {
                background: color-mix(in srgb, var(--tm-info-color) 14%, transparent) !important;
                border: 1px solid color-mix(in srgb, var(--tm-info-color) 32%, transparent) !important;
                color: var(--tm-info-color) !important;
            }
            .tm-repair-quickview-btn:hover {
                background: color-mix(in srgb, var(--tm-info-color) 24%, transparent) !important;
                border-color: var(--tm-info-color) !important;
            }

            /* Recent Repairs footer button */
            #tm-recent-repairs-btn {
                background: var(--tm-glass-bg, var(--tm-surface-bg, var(--tm-shop-item-bg))) !important;
                border: 1px solid var(--tm-glass-border, var(--tm-surface-border, var(--tm-shop-item-border))) !important;
                color: var(--tm-footer-text, var(--tm-widget-text, var(--tm-shop-item-text, var(--tm-primary-color)))) !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease !important;
                box-shadow: 0 2px 8px var(--tm-shadow-color, rgba(0,0,0,0.15)) !important;
            }
            #tm-recent-repairs-btn:hover {
                background: var(--tm-glass-hover-bg, var(--tm-surface-hover-bg, var(--tm-shop-item-hover-bg))) !important;
                border-color: var(--tm-primary-color) !important;
                color: var(--tm-primary-color) !important;
            }

            /* Price transfer button: theme-aware */
            #tm-price-transfer-btn {
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

            /* Individual button colors (auxiliary slide-outs only) */
            #tm-quests-btn { background-color: #8B4513; } /* SaddleBrown */
            #tm-quests-btn:hover { background-color: #A0522D; } /* Sienna */

            #tm-tech-stats-btn { background-color: var(--tm-info-color); }
            #tm-tech-stats-btn:hover { background-color: var(--tm-info-hover); }

            /* Customer History Link Style */
            .tm-customer-history-link {
                cursor: pointer;
                text-decoration: underline;
                color: var(--tm-link-color, var(--tm-info-color));
                font-weight: bold;
            }
            .tm-customer-history-link:hover {
                color: var(--tm-link-hover-color, var(--tm-info-hover, var(--tm-info-color)));
            }

            /* Customer History Modal */
            #tm-customer-history-modal.tm-modal-overlay {
                background: var(--tm-overlay-dim, rgba(0, 0, 0, 0.65));
            }
            .tm-customer-history-content {
                background: var(--tm-modal-bg, var(--tm-shop-item-bg)) !important;
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
                border: 1px solid var(--tm-shop-item-border) !important;
                box-shadow: 0 20px 60px var(--tm-shadow-color, rgba(0, 0, 0, 0.25)) !important;
            }
            .tm-customer-history-content .tm-modal-header {
                border-bottom-color: var(--tm-shop-item-border) !important;
            }
            .tm-customer-history-content .tm-modal-title,
            .tm-customer-history-content .tm-modal-close {
                color: var(--tm-shop-item-text, var(--tm-primary-color)) !important;
            }
            .tm-customer-history-content .tm-modal-close {
                background: transparent;
                border: none;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
            }
            .tm-customer-history-content .tm-modal-close:hover {
                color: var(--tm-danger-color) !important;
            }
            #tm-customer-history-container {
                overflow-y: auto;
                flex: 1;
                min-height: 0;
            }
            #tm-customer-history-modal #tm-status-message {
                text-align: center;
                padding: 20px;
                font-size: 16px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
            }
            #tm-customer-history-modal .tm-details-error {
                color: var(--tm-danger-color) !important;
            }
            .tm-customer-history-table {
                width: 100%;
                border-collapse: collapse;
                text-align: center;
                margin-top: 10px;
                font-size: 13px;
            }
            .tm-customer-history-table thead th,
            .tm-customer-history-table .tm-sortable-header {
                background: var(--tm-shop-item-hover-bg, #e9ecef);
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                border: 1px solid var(--tm-shop-item-border);
                padding: 10px 12px;
                font-weight: 700;
            }
            .tm-customer-history-table tbody td {
                border: 1px solid var(--tm-shop-item-border);
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                padding: 10px 12px;
                vertical-align: middle;
            }
            .tm-customer-history-table tbody tr:nth-child(odd) {
                background: var(--tm-grid-row-alt-bg, var(--tm-shop-item-owned-bg));
            }
            .tm-customer-history-table tbody tr:hover {
                background: var(--tm-grid-row-hover-bg, var(--tm-shop-item-hover-bg));
            }
            .tm-customer-history-table a {
                color: var(--tm-link-color, var(--tm-primary-hover));
                text-decoration: none;
                font-weight: 600;
            }
            .tm-customer-history-table a:hover {
                color: var(--tm-link-hover-color, var(--tm-info-color));
                text-decoration: underline;
            }
            .tm-sortable-header {
                cursor: pointer;
                transition: background-color 0.15s ease, color 0.15s ease;
            }
            .tm-sortable-header:hover {
                background-color: var(--tm-shop-item-owned-bg, var(--tm-shop-item-hover-bg)) !important;
                color: var(--tm-link-hover-color, var(--tm-info-color)) !important;
            }
            /* Hover effect on container to show buttons */
            #tm-search-container:hover .tm-slide-out-btn {
                transform: translateX(0);
                opacity: 1;
                pointer-events: auto;
            }

            /* Suite custom left-menu icons (super search, phone catalog) */
            img.tm-suite-menu-icon {
                width: 16px;
                height: 16px;
                max-width: 16px;
                max-height: 16px;
                display: inline;
                vertical-align: text-bottom;
                object-fit: contain;
                flex-shrink: 0;
                filter: brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(1000%) hue-rotate(90deg);
            }
            .rnr-b-vmenu li.current img.tm-suite-menu-icon {
                filter: none;
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
                gap: 0;
                flex-grow: 1;
                overflow: hidden;
                min-height: 0;
            }
            .tm-settings-sidebar {
                width: 200px;
                flex-shrink: 0;
                border-right: 1px solid var(--tm-shop-item-border, #e2e8f0);
                padding: 4px 12px 8px 0;
                overflow-y: auto;
            }
            .tm-settings-sidebar .tm-nav {
                list-style: none; margin: 0; padding: 0;
                display: flex; flex-direction: column; gap: 4px;
            }
            .tm-settings-sidebar .tm-nav a {
                text-decoration: none;
                color: var(--tm-shop-item-text, #334155);
                font-weight: 500;
                font-size: 13px;
                border-radius: 10px;
                padding: 9px 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                background: transparent;
                border: 1px solid transparent;
                transition: background 0.15s, color 0.15s, border-color 0.15s;
            }
            .tm-settings-sidebar .tm-nav .tm-nav-icon {
                width: 1.25em; text-align: center; opacity: 0.85; flex-shrink: 0;
            }
            .tm-settings-sidebar .tm-nav .tm-nav-label { min-width: 0; }
            .tm-settings-sidebar .tm-nav a:hover {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 8%, var(--tm-shop-item-bg, #f8fafc));
            }
            .tm-settings-sidebar .tm-nav a.active {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 12%, var(--tm-shop-item-bg, #f8fafc));
                color: var(--tm-primary-color, #0b5ed7);
                border-color: color-mix(in srgb, var(--tm-primary-color, #007bff) 22%, transparent);
                font-weight: 600;
            }
            .tm-settings-main {
                flex: 1;
                min-width: 0;
                padding: 0 4px 0 16px;
            }
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

            /* ===== Super Search Modal ===== */
            .tm-search-modal-overlay {
                background: var(--tm-overlay-dim, rgba(15, 23, 42, 0.55));
                backdrop-filter: blur(4px);
            }
            .tm-search-modal-content {
                width: min(96vw, 1100px);
                max-width: 1100px;
                height: min(88vh, 820px);
                padding: 0;
                overflow: hidden;
                border-radius: 16px;
                border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
                background: var(--tm-modal-bg, #fff);
            }
            .tm-search-modal-header {
                margin: 0;
                padding: 18px 22px;
                border-bottom: 1px solid var(--tm-shop-item-border, #e8ecf0);
                background: linear-gradient(180deg, var(--tm-shop-item-hover-bg, #f8fafc) 0%, var(--tm-modal-bg, #fff) 100%);
            }
            .tm-search-modal-brand {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
                min-width: 0;
            }
            .tm-search-modal-icon { font-size: 26px; line-height: 1; }
            .tm-search-modal-content .tm-modal-title {
                font-size: 18px;
                font-weight: 700;
                text-align: left;
                margin: 0;
                color: var(--tm-shop-item-text, #1e293b);
            }
            .tm-search-modal-subtitle {
                margin: 2px 0 0;
                font-size: 12px;
                color: var(--tm-muted-text, #64748b);
            }
            .tm-search-modal-meta {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
            }
            .tm-search-kbd-hint {
                font-size: 11px;
                padding: 3px 7px;
                border-radius: 6px;
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                background: var(--tm-chip-bg, #f1f5f9);
                color: var(--tm-muted-text, #64748b);
                font-family: inherit;
            }

            .tm-search-toolbar {
                padding: 14px 22px 12px;
                border-bottom: 1px solid var(--tm-shop-item-border, #e8ecf0);
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .tm-search-input-wrap {
                display: flex;
                align-items: stretch;
                gap: 0;
                background: var(--tm-shop-item-bg, #fff);
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }
            .tm-search-input-icon {
                display: flex;
                align-items: center;
                padding: 0 12px;
                color: var(--tm-muted-text, #94a3b8);
                font-size: 18px;
                background: var(--tm-shop-item-hover-bg, #f8fafc);
                border-right: 1px solid var(--tm-shop-item-border, #e2e8f0);
            }
            #tm-search-input {
                flex: 1;
                min-width: 0;
                border: none;
                padding: 12px 14px;
                font-size: 15px;
                text-align: left;
                background: transparent;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            #tm-search-input:focus {
                outline: none;
                box-shadow: none;
            }
            .tm-search-input-wrap:focus-within {
                border-color: var(--tm-primary-color);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            }
            #tm-search-favorite-btn {
                border: none;
                border-left: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: var(--tm-shop-item-hover-bg, #f8fafc);
                padding: 0 14px;
                font-size: 20px;
                cursor: pointer;
                color: var(--tm-muted-text, #94a3b8);
                display: flex;
                align-items: center;
            }
            #tm-search-favorite-btn:hover { color: var(--tm-warning-color); }
            #tm-search-favorite-btn.favorited { color: var(--tm-warning-color); }
            #tm-search-submit {
                border: none;
                border-left: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: var(--tm-success-color);
                color: #fff;
                padding: 0 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
            }
            #tm-search-submit:hover:not(:disabled) { background: var(--tm-success-hover); }
            #tm-search-submit:disabled { background: var(--tm-secondary-color); cursor: not-allowed; }
            .tm-search-cancel-btn {
                border: none;
                border-left: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: var(--tm-danger-color);
                color: #fff;
                padding: 0 16px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
            }
            .tm-search-cancel-btn:hover { background: var(--tm-danger-hover); }

            .tm-search-scope-toggles {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            .tm-search-filters-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
            }
            .tm-search-history-toggles {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-left: auto;
            }
            .tm-search-toggle-check {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                cursor: pointer;
                user-select: none;
                padding: 5px 10px;
                border-radius: 999px;
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                background: var(--tm-chip-bg, #f8fafc);
                font-size: 12px;
                font-weight: 600;
                color: var(--tm-chip-text, #475569);
                transition: border-color 0.15s, background 0.15s, color 0.15s;
            }
            .tm-search-toggle-check:hover {
                border-color: var(--tm-primary-color);
                color: var(--tm-primary-color);
            }
            .tm-search-toggle-check input {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
                pointer-events: none;
            }
            .tm-search-toggle-check-ui {
                width: 15px;
                height: 15px;
                border-radius: 4px;
                border: 1.5px solid var(--tm-shop-item-border, #94a3b8);
                background: var(--tm-modal-bg, #fff);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: background 0.15s, border-color 0.15s;
            }
            .tm-search-toggle-check-ui::after {
                content: '';
                width: 4px;
                height: 7px;
                border: solid #fff;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg) scale(0);
                margin-top: -1px;
                transition: transform 0.12s ease;
            }
            .tm-search-toggle-check input:checked + .tm-search-toggle-check-ui {
                background: var(--tm-primary-color);
                border-color: var(--tm-primary-color);
            }
            .tm-search-toggle-check input:checked + .tm-search-toggle-check-ui::after {
                transform: rotate(45deg) scale(1);
            }
            .tm-search-toggle-check input:focus-visible + .tm-search-toggle-check-ui {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            }
            .tm-search-toggle-check input:checked ~ .tm-search-toggle-check-label {
                color: var(--tm-primary-color);
            }
            .tm-search-toggle-check-label {
                line-height: 1.2;
                white-space: nowrap;
            }
            .tm-search-scope {
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                background: var(--tm-chip-bg, #f1f5f9);
                color: var(--tm-chip-text, #475569);
                border-radius: 999px;
                padding: 5px 14px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s, border-color 0.15s, color 0.15s;
            }
            .tm-search-scope:hover {
                border-color: var(--tm-primary-color);
                color: var(--tm-primary-color);
            }
            .tm-search-scope.active {
                background: var(--tm-primary-color);
                border-color: var(--tm-primary-color);
                color: #fff;
            }

            .tm-search-body {
                display: flex;
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }
            .tm-search-sidebar {
                width: 220px;
                flex-shrink: 0;
                border-right: 1px solid var(--tm-shop-item-border, #e8ecf0);
                padding: 14px 12px;
                overflow-y: auto;
                background: var(--tm-shop-item-hover-bg, #f8fafc);
            }
            .tm-search-sidebar-section + .tm-search-sidebar-section { margin-top: 16px; }
            .tm-search-sidebar-title {
                margin: 0 0 8px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: var(--tm-muted-text, #64748b);
            }
            .tm-search-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .tm-search-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                max-width: 100%;
                border: 1px solid var(--tm-chip-border, #cbd5e1);
                background: var(--tm-modal-bg, #fff);
                color: var(--tm-chip-text, #334155);
                border-radius: 999px;
                padding: 4px 10px;
                font-size: 12px;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
            }
            .tm-search-chip:hover {
                border-color: var(--tm-primary-color);
                background: var(--tm-shop-item-bg, #fff);
            }
            .tm-search-chip--favorite .tm-search-chip-star {
                color: var(--tm-warning-color);
                font-size: 10px;
            }
            .tm-search-chip-label {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 140px;
            }
            .tm-search-chip-remove {
                margin-left: 2px;
                opacity: 0.5;
                font-size: 14px;
                line-height: 1;
            }
            .tm-search-chip-remove:hover { opacity: 1; color: var(--tm-danger-color); }
            .tm-search-chips-empty {
                font-size: 11px;
                color: var(--tm-muted-text, #94a3b8);
                font-style: italic;
            }

            .tm-search-main {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .tm-search-progress {
                display: none;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
                border-bottom: 1px solid var(--tm-shop-item-border, #e8ecf0);
                background: var(--tm-shop-item-hover-bg, #f8fafc);
            }
            .tm-search-progress--active { display: flex; }
            .tm-search-progress-track {
                flex: 1;
                height: 4px;
                background: var(--tm-shop-item-border, #e2e8f0);
                border-radius: 999px;
                overflow: hidden;
            }
            .tm-search-progress-bar-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, var(--tm-primary-color), var(--tm-info-color));
                border-radius: 999px;
                transition: width 0.25s ease;
            }
            .tm-search-progress-text {
                font-size: 11px;
                color: var(--tm-muted-text, #64748b);
                white-space: nowrap;
            }

            #tm-results-container {
                flex: 1;
                overflow-y: auto;
                padding: 14px 16px;
                pointer-events: auto;
            }
            .tm-search-empty-state,
            .tm-search-loading-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 48px 24px;
                color: var(--tm-muted-text, #64748b);
                gap: 8px;
                min-height: 200px;
            }
            .tm-search-loading-state { flex-direction: row; gap: 12px; }
            .tm-search-empty-icon { font-size: 36px; opacity: 0.7; }
            .tm-search-empty-title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-search-empty-hint {
                margin: 0;
                font-size: 13px;
                max-width: 360px;
                line-height: 1.5;
            }
            .tm-search-results-summary {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
                padding: 8px 12px;
                margin-bottom: 12px;
                border-radius: 10px;
                background: var(--tm-chip-bg, #f1f5f9);
                border: 1px solid var(--tm-chip-border, #e2e8f0);
                font-size: 13px;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
            }
            .tm-search-results-query {
                color: var(--tm-muted-text, #64748b);
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .tm-result-card {
                border: 1px solid var(--tm-shop-item-border);
                border-radius: 12px;
                margin-bottom: 10px;
                overflow: hidden;
                background: var(--tm-shop-item-bg);
                transition: box-shadow 0.2s, border-color 0.2s;
            }
            .tm-result-card.tm-result-clickable { cursor: pointer; }
            .tm-result-card.tm-result-clickable:hover {
                border-color: var(--tm-primary-color);
                box-shadow: 0 4px 14px rgba(0,0,0,0.06);
            }
            .tm-result-card--expanded {
                border-color: var(--tm-info-color);
                box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
            }
            .tm-result-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                border-bottom: 1px solid var(--tm-shop-item-border);
                background: var(--tm-shop-item-hover-bg, #f8fafc);
            }
            .tm-result-card-title {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                flex: 1;
            }
            .tm-result-card-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                border-radius: 8px;
                background: var(--tm-primary-color);
                color: #fff;
                font-size: 11px;
                font-weight: 700;
                flex-shrink: 0;
            }
            .tm-result-card-primary {
                font-weight: 700;
                font-size: 14px;
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .tm-result-card-type {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                padding: 2px 8px;
                border-radius: 999px;
                background: var(--tm-chip-bg);
                border: 1px solid var(--tm-chip-border);
                color: var(--tm-muted-text);
                flex-shrink: 0;
            }
            .tm-result-card-type--history {
                background: rgba(139, 92, 246, 0.12);
                border-color: rgba(139, 92, 246, 0.35);
                color: #6d28d9;
            }
            .tm-result-card--from-history {
                border-left: 3px solid #8b5cf6;
            }
            .tm-result-card-actions {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }
            .tm-result-card-fields {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                padding: 10px 12px;
            }
            .tm-result-field-pill {
                font-size: 12px;
                padding: 4px 10px;
                border-radius: 8px;
                background: var(--tm-chip-bg);
                border: 1px solid var(--tm-chip-border);
                color: var(--tm-shop-item-text, var(--tm-primary-color));
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .tm-result-card-hint {
                padding: 0 12px 8px;
                font-size: 10px;
                color: var(--tm-muted-text, #94a3b8);
            }
            .tm-result-card--expanded .tm-result-card-hint { display: none; }

            .tm-result-highlight {
                background-color: var(--tm-warning-color);
                color: var(--tm-dark-hover, #1e293b);
                border-radius: 2px;
                padding: 0 2px;
            }
            .tm-print-btn, .tm-goto-btn {
                background-color: var(--tm-info-color);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 6px 10px;
                font-size: 12px;
                cursor: pointer;
                text-decoration: none;
                pointer-events: auto;
            }
            .tm-print-btn { padding: 6px 9px; }
            .tm-print-btn:hover { background-color: var(--tm-info-hover); }
            .tm-goto-btn { background-color: var(--tm-success-color); }
            .tm-goto-btn:hover { background-color: var(--tm-success-hover); }

            /* Legacy result classes (other modals may still use) */
            .tm-result-item { border: 1px solid var(--tm-shop-item-border); border-radius: 5px; margin-bottom: 10px; overflow: hidden; pointer-events: auto; background: var(--tm-shop-item-bg); }
            .tm-result-clickable { cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; pointer-events: auto; }
            .tm-result-header { background-color: var(--tm-shop-item-bg); color: var(--tm-primary-color); padding: 8px 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
            .tm-result-body { padding: 12px; color: var(--tm-primary-color); }
            .tm-result-table { width: 100%; border-collapse: collapse; }
            .tm-result-table td { padding: 5px; border-bottom: 1px solid var(--tm-shop-item-border); font-size: 13px; text-align: center; color: var(--tm-primary-color); }

            /* Hacker theme — search modal */
            .tm-hacker-theme-enabled .tm-search-modal-content {
                background: #050505;
                color: #0f0;
                border: 1px solid #0f0;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            }
            .tm-hacker-theme-enabled .tm-search-modal-header { border-bottom-color: #0f0; background: #0a0a0a; }
            .tm-hacker-theme-enabled .tm-search-modal-content .tm-modal-title { color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-modal-subtitle { color: #3f3; }
            .tm-hacker-theme-enabled .tm-modal-close { color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-input-wrap { border-color: #0f0; background: #030d03; }
            .tm-hacker-theme-enabled .tm-search-input-icon { background: #0a0a0a; border-color: #0f0; color: #0f0; }
            .tm-hacker-theme-enabled #tm-search-input { color: #0f0; }
            .tm-hacker-theme-enabled #tm-search-input:focus { color: #0f0; background-color: #030d03; text-shadow: 0 0 4px #0f0; }
            .tm-hacker-theme-enabled .tm-search-input-wrap:focus-within { box-shadow: 0 0 8px #0f0; }
            .tm-hacker-theme-enabled #tm-search-submit { background-color: #009900; }
            .tm-hacker-theme-enabled #tm-search-submit:hover { background-color: #00cc00; }
            .tm-hacker-theme-enabled #tm-search-favorite-btn { border-color: #0f0; color: #0f0; }
            .tm-hacker-theme-enabled #tm-search-favorite-btn.favorited { color: #ffff00; }
            .tm-hacker-theme-enabled .tm-search-sidebar { background: #080808; border-color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-sidebar-title { color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-chip { border-color: #0f0; background: #080808; color: #3f3; }
            .tm-hacker-theme-enabled .tm-search-scope { border-color: #0f0; color: #0f0; background: #080808; }
            .tm-hacker-theme-enabled .tm-search-scope.active { background: #009900; }
            .tm-hacker-theme-enabled .tm-search-toggle-check { border-color: #0f0; background: #080808; color: #3f3; }
            .tm-hacker-theme-enabled .tm-search-toggle-check-ui { border-color: #0f0; background: #030d03; }
            .tm-hacker-theme-enabled .tm-search-toggle-check input:checked + .tm-search-toggle-check-ui { background: #009900; border-color: #0f0; }
            .tm-hacker-theme-enabled .tm-search-toggle-check input:checked ~ .tm-search-toggle-check-label { color: #0f0; }
            .tm-hacker-theme-enabled .tm-result-card-type--history { color: #0f0; border-color: #0f0; background: #0a1a0a; }
            .tm-hacker-theme-enabled .tm-result-card--from-history { border-left-color: #0f0; }
            .tm-hacker-theme-enabled .tm-result-card { border-color: #0f0; background: #080808; }
            .tm-hacker-theme-enabled .tm-result-card-header { background: #111; border-color: #0f0; }
            .tm-hacker-theme-enabled .tm-result-highlight { background-color: #00ff00; color: #000; }
            .tm-hacker-theme-enabled .tm-goto-btn, .tm-hacker-theme-enabled .tm-print-btn { background-color: #009900; }
            .tm-hacker-theme-enabled .tm-goto-btn:hover, .tm-hacker-theme-enabled .tm-print-btn:hover { background-color: #00cc00; }

            @media (max-width: 768px) {
                .tm-search-body { flex-direction: column; }
                .tm-search-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid var(--tm-shop-item-border, #e8ecf0);
                    max-height: 120px;
                }
                .tm-search-modal-meta .tm-search-kbd-hint { display: none; }
                .tm-search-history-toggles { margin-left: 0; width: 100%; }
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
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                color: var(--tm-primary-color) !important;
            }
            #tm-daily-dashboard-widget:hover {
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border-color: rgba(255,255,255,0.4) !important;
            }
            
            /* New Settings Panel Styles — theme-aware minimal */
            .tm-settings-modal {
                position: relative;
                background: var(--tm-modal-bg, var(--tm-shop-item-bg, #ffffff)) !important;
                color: var(--tm-shop-item-text, #1e293b);
                border: 1px solid var(--tm-shop-item-border, #e2e8f0) !important;
                border-radius: 16px !important;
                box-shadow: 0 20px 50px color-mix(in srgb, var(--tm-shadow-color, #0f172a) 18%, transparent);
                padding: 0 !important;
                max-width: 980px;
                overflow: hidden;
            }
            .tm-settings-modal .tm-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
                padding: 18px 20px 14px;
                margin: 0;
                border-bottom: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: transparent !important;
            }
            .tm-settings-header-text { min-width: 0; }
            .tm-settings-modal .tm-modal-title {
                margin: 0;
                font-size: 1.15rem;
                font-weight: 700;
                text-align: left;
                color: var(--tm-shop-item-text, #0f172a);
                pointer-events: auto;
            }
            .tm-settings-subtitle {
                margin: 4px 0 0;
                font-size: 12px;
                color: var(--tm-subtle-text, var(--tm-secondary-color, #64748b));
            }
            .tm-settings-modal .tm-modal-close {
                width: 34px; height: 34px;
                border: none; border-radius: 10px; cursor: pointer;
                background: var(--tm-shop-item-bg, #f1f5f9);
                color: var(--tm-shop-item-text, #334155);
                font-size: 18px; line-height: 1;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s, color 0.15s;
            }
            .tm-settings-modal .tm-modal-close:hover {
                background: color-mix(in srgb, var(--tm-danger-color, #ef4444) 14%, transparent);
                color: var(--tm-danger-color, #b91c1c);
            }
            .tm-settings-modal .tm-settings-layout {
                padding: 12px 16px 8px;
            }
            .tm-settings-modal #tm-settings-content {
                padding-right: 6px;
            }
            .tm-settings-modal .tm-settings-footer {
                padding: 14px 20px;
                margin: 0;
                border-top: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: transparent !important;
                gap: 12px;
            }

            .tm-settings-section {
                margin-bottom: 18px;
                padding: 0 0 16px;
                border-bottom: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: transparent !important;
            }
            .tm-settings-section:last-of-type {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .tm-settings-section-head {
                margin-bottom: 12px;
            }
            .tm-settings-section h3,
            .tm-settings-section-head h3 {
                margin: 0 0 4px;
                font-size: 15px;
                font-weight: 700;
                color: var(--tm-shop-item-text, #0f172a);
                text-align: left;
                border: none;
                padding: 0;
                text-transform: none;
                letter-spacing: normal;
                text-shadow: none;
            }
            .tm-settings-section-desc {
                margin: 0;
                font-size: 12.5px;
                line-height: 1.4;
                color: var(--tm-subtle-text, var(--tm-secondary-color, #64748b));
            }
            .tm-settings-subgroup {
                margin: 14px 0 8px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: var(--tm-muted-text, var(--tm-secondary-color, #94a3b8));
            }
            .tm-setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
                margin-bottom: 8px;
                padding: 10px 12px;
                border-radius: 12px;
                border: 1px solid transparent;
                transition: background 0.15s;
            }
            .tm-setting-row:hover {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 5%, transparent);
            }
            .tm-setting-row--stack {
                flex-direction: column;
                align-items: stretch;
            }
            .tm-setting-row--stack .tm-setting-control {
                justify-content: flex-start;
                width: 100%;
            }
            .tm-setting-row--divider {
                margin-top: 8px;
                padding-top: 14px;
                border-top: 1px solid var(--tm-shop-item-border, #e2e8f0);
                border-radius: 0;
            }
            .tm-setting-row--danger {
                background: color-mix(in srgb, var(--tm-danger-color, #ef4444) 10%, var(--tm-shop-item-bg, #fff));
                border-color: color-mix(in srgb, var(--tm-danger-color, #ef4444) 28%, transparent);
            }
            .tm-setting-row--danger .tm-setting-label label {
                color: var(--tm-danger-color, #b91c1c);
            }
            .tm-setting-row--warn {
                background: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 10%, var(--tm-shop-item-bg, #fff));
                border-color: color-mix(in srgb, var(--tm-warning-color, #f59e0b) 30%, transparent);
            }
            .tm-setting-row--accent {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 8%, var(--tm-shop-item-bg, #fff));
                border-color: color-mix(in srgb, var(--tm-primary-color, #007bff) 22%, transparent);
            }
            .tm-setting-label {
                flex: 1;
                min-width: 0;
                text-align: left;
            }
            .tm-setting-label label {
                font-weight: 600;
                color: var(--tm-shop-item-text, #334155);
                font-size: 13.5px;
            }
            .tm-setting-control {
                flex-shrink: 0;
                text-align: right;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 8px;
            }
            .tm-setting-control--wrap { flex-wrap: wrap; justify-content: flex-end; }
            .tm-setting-control--grid {
                display: grid !important;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 6px;
                width: 100%;
            }
            .tm-setting-control--stack {
                flex-direction: column;
                align-items: flex-end;
            }
            .tm-setting-control input[type="number"],
            .tm-settings-input,
            .tm-settings-modal input[type="text"],
            .tm-settings-modal input[type="password"] {
                width: 88px;
                min-width: 0;
                padding: 8px 10px;
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                border-radius: 10px;
                text-align: center;
                background: var(--tm-input-bg, var(--tm-shop-item-bg, #fff));
                color: var(--tm-shop-item-text, #1e293b);
            }
            .tm-settings-input,
            .tm-settings-modal input[type="text"],
            .tm-settings-modal input[type="password"] {
                width: auto;
                min-width: 180px;
                text-align: left;
            }
            .tm-setting-control input[type="checkbox"] {
                transform: scale(1.15);
                cursor: pointer;
                accent-color: var(--tm-primary-color, #007bff);
            }
            .tm-setting-description {
                font-size: 12px;
                color: var(--tm-subtle-text, var(--tm-secondary-color, #64748b));
                margin-top: 3px;
                text-align: left;
                margin-bottom: 0;
                line-height: 1.4;
            }
            .tm-setting-label-row {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            .tm-setting-label-row label {
                margin: 0;
            }
            .tm-setting-info-btn {
                flex-shrink: 0;
                width: 22px;
                height: 22px;
                padding: 0;
                border-radius: 999px;
                border: 1px solid color-mix(in srgb, var(--tm-primary-color, #007bff) 35%, var(--tm-shop-item-border, #cbd5e1));
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 8%, var(--tm-shop-item-bg, #fff));
                color: var(--tm-primary-color, #007bff);
                font-size: 11px;
                font-weight: 700;
                font-style: italic;
                font-family: Georgia, 'Times New Roman', serif;
                line-height: 1;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.12s;
            }
            .tm-setting-info-btn:hover {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 16%, var(--tm-shop-item-bg, #fff));
                border-color: var(--tm-primary-color, #007bff);
                transform: scale(1.06);
            }
            .tm-setting-info-btn:focus-visible {
                outline: 2px solid color-mix(in srgb, var(--tm-primary-color, #007bff) 55%, transparent);
                outline-offset: 2px;
            }
            .tm-settings-help-panel {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: min(340px, 92%);
                z-index: 20;
                display: flex;
                flex-direction: column;
                background: var(--tm-modal-bg, var(--tm-shop-item-bg, #ffffff));
                border-left: 1px solid var(--tm-shop-item-border, #e2e8f0);
                box-shadow: -12px 0 28px color-mix(in srgb, var(--tm-shadow-color, #0f172a) 14%, transparent);
                transform: translateX(100%);
                opacity: 0;
                pointer-events: none;
                transition: transform 0.22s ease, opacity 0.18s ease;
            }
            .tm-settings-help-panel[hidden] {
                display: none !important;
            }
            .tm-settings-modal.tm-settings-help-open .tm-settings-help-panel {
                transform: translateX(0);
                opacity: 1;
                pointer-events: auto;
            }
            .tm-settings-help-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 10px;
                padding: 16px 16px 12px;
                border-bottom: 1px solid var(--tm-shop-item-border, #e2e8f0);
            }
            .tm-settings-help-header h3 {
                margin: 0;
                font-size: 15px;
                font-weight: 700;
                color: var(--tm-shop-item-text, #0f172a);
                line-height: 1.35;
            }
            .tm-settings-help-close {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                background: var(--tm-shop-item-bg, #f1f5f9);
                color: var(--tm-shop-item-text, #334155);
                font-size: 18px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .tm-settings-help-close:hover {
                background: color-mix(in srgb, var(--tm-danger-color, #ef4444) 14%, transparent);
                color: var(--tm-danger-color, #b91c1c);
            }
            .tm-settings-help-body {
                padding: 14px 16px 20px;
                overflow-y: auto;
                flex: 1;
            }
            .tm-settings-help-block {
                margin-bottom: 16px;
            }
            .tm-settings-help-block:last-child {
                margin-bottom: 0;
            }
            .tm-settings-help-block h4 {
                margin: 0 0 6px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: var(--tm-muted-text, var(--tm-secondary-color, #94a3b8));
            }
            .tm-settings-help-block p {
                margin: 0;
                font-size: 13px;
                line-height: 1.5;
                color: var(--tm-shop-item-text, #334155);
            }
            .tm-settings-muted { opacity: 0.8; }
            .tm-settings-unit {
                font-size: 12px;
                color: var(--tm-subtle-text, #64748b);
            }
            .tm-settings-profile-line { margin-bottom: 12px; }
            .tm-settings-code-line {
                word-break: break-all;
                font-size: 11px;
                opacity: 0.85;
            }
            .tm-settings-panel {
                padding: 14px;
                margin-top: 10px;
                border-radius: 12px;
                background: var(--tm-shop-item-bg, #f8fafc);
                border: 1px solid var(--tm-shop-item-border, #e2e8f0);
            }
            .tm-settings-panel-title {
                text-align: center;
                margin-bottom: 10px !important;
            }
            .tm-settings-editor { padding: 0 2px 8px; }
            .tm-settings-danger-zone {
                margin-top: 18px;
                padding-top: 14px;
                border-top: 1px dashed color-mix(in srgb, var(--tm-danger-color, #ef4444) 35%, transparent);
                text-align: center;
            }
            .tm-settings-ghost-btn,
            .tm-settings-primary-btn,
            .tm-settings-danger-btn {
                padding: 7px 12px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 12.5px;
                font-weight: 600;
                transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
            }
            .tm-settings-ghost-btn {
                background: transparent;
                color: var(--tm-primary-color, #007bff);
                border: 1px solid color-mix(in srgb, var(--tm-primary-color, #007bff) 45%, transparent);
            }
            .tm-settings-ghost-btn:hover {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 10%, transparent);
            }
            .tm-settings-primary-btn {
                background: var(--tm-primary-color, #007bff);
                color: var(--tm-text-on-primary, #fff);
                border: 1px solid var(--tm-primary-color, #007bff);
            }
            .tm-settings-primary-btn:hover {
                background: var(--tm-primary-hover, #0056b3);
            }
            .tm-settings-danger-btn {
                background: color-mix(in srgb, var(--tm-danger-color, #ef4444) 12%, transparent);
                color: var(--tm-danger-color, #b91c1c);
                border: 1px solid color-mix(in srgb, var(--tm-danger-color, #ef4444) 40%, transparent);
            }
            .tm-settings-danger-btn:hover {
                background: color-mix(in srgb, var(--tm-danger-color, #ef4444) 20%, transparent);
            }
            .tm-mascot-state-btn,
            .tm-mascot-stage-btn,
            .tm-mascot-char-btn {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 8%, var(--tm-shop-item-bg, #fff));
                color: var(--tm-shop-item-text, #334155);
                border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                border-radius: 10px;
                padding: 7px 10px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
            }
            .tm-mascot-state-btn:hover,
            .tm-mascot-stage-btn:hover,
            .tm-mascot-char-btn:hover {
                border-color: var(--tm-primary-color, #007bff);
                color: var(--tm-primary-color, #007bff);
            }
            #tm-settings-feedback {
                margin-right: auto;
                color: var(--tm-success-color, #28a745);
                font-weight: 600;
                font-size: 13px;
                transition: opacity 0.3s;
            }
            .tm-modal-footer {
                padding-top: 20px;
                margin-top: 10px;
                border-top: 1px solid var(--tm-shop-item-border, #eee);
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
            }
            #tm-settings-save, #tm-settings-reset {
                padding: 11px 20px;
                font-size: 14px;
                font-weight: 600;
                color: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                min-width: 200px;
                transition: background-color 0.2s, transform 0.1s ease-out, box-shadow 0.2s;
            }
            #tm-settings-save { background-color: var(--tm-primary-color); }
            #tm-settings-save:hover {
                background-color: var(--tm-primary-hover);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px color-mix(in srgb, var(--tm-primary-color) 35%, transparent);
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
                border: 1px solid var(--tm-shop-item-border, #ccc);
                text-align: center;
                border-radius: 10px;
                flex: 1;
                background: var(--tm-input-bg, #fff);
                color: var(--tm-shop-item-text, #1e293b);
            }
            .tm-quick-search-remove-btn, #tm-quick-search-add-btn, #tm-price-options-add-btn, #tm-scratchpad-template-add-btn {
                padding: 7px 12px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                color: white;
                margin-top: 4px;
            }
            .tm-quick-search-remove-btn { background-color: var(--tm-danger-color); }
            .tm-quick-search-remove-btn:hover { background-color: var(--tm-danger-hover); }
            #tm-quick-search-add-btn, #tm-price-options-add-btn, #tm-scratchpad-template-add-btn {
                background-color: var(--tm-primary-color);
            }
            #tm-quick-search-add-btn:hover, #tm-price-options-add-btn:hover, #tm-scratchpad-template-add-btn:hover {
                background-color: var(--tm-primary-hover);
            }
            #tm-quick-search-add-btn.tm-settings-ghost-btn,
            #tm-price-options-add-btn.tm-settings-ghost-btn,
            #tm-scratchpad-template-add-btn.tm-settings-ghost-btn {
                color: var(--tm-primary-color, #007bff);
                background: transparent;
                border: 1px solid color-mix(in srgb, var(--tm-primary-color, #007bff) 45%, transparent);
            }

            #tm-working-hours-editor {
                padding: 14px;
                background-color: var(--tm-shop-item-bg, #f8f9fa);
                border: 1px solid var(--tm-shop-item-border, transparent);
                border-radius: 12px;
                margin-top: 12px;
            }
            #tm-working-hours-time-inputs {
                display: flex;
                justify-content: center;
                gap: 10px;
                align-items: center;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }
            #tm-working-days-editor {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px;
            }
            #tm-working-days-editor label {
                font-weight: normal;
            }
            @media (max-width: 720px) {
                .tm-settings-modal { width: 96%; height: 92vh; }
                .tm-settings-layout { flex-direction: column; }
                .tm-settings-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid var(--tm-shop-item-border, #e2e8f0);
                    padding: 0 0 10px;
                }
                .tm-settings-sidebar .tm-nav {
                    flex-direction: row;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    gap: 6px;
                    padding-bottom: 4px;
                }
                .tm-settings-sidebar .tm-nav a {
                    white-space: nowrap;
                }
                .tm-settings-main { padding: 10px 0 0; }
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
            .tm-scratchpad-tabs-empty {
                font-size: 11px;
                color: #6c757d;
                font-style: italic;
                padding: 4px 8px;
                white-space: nowrap;
            }
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
                --tm-footer-control-height: 40px;
            }
            #tm-footer-controls-row,
            #tm-footer-controls-left,
            #tm-footer-controls-middle,
            #tm-footer-controls-right {
                align-items: center;
            }
            #tm-footer-controls-container :is(
                #tm-notification-bell-btn,
                #tm-settings-btn,
                #tm-refresh-timer-container,
                #tm-recent-repairs-btn,
                #tm-eod-btn,
                #tm-daily-dashboard-widget,
                #tm-xp-bar-container,
                #tm-coin-balance,
                #tm-weather-widget,
                .tm-buff-timer,
                .tm-footer-widget,
                .tm-footer-icon-btn,
                #tm-footer-controls-left button,
                #tm-footer-controls-right button
            ) {
                height: var(--tm-footer-control-height) !important;
                min-height: var(--tm-footer-control-height) !important;
                max-height: var(--tm-footer-control-height) !important;
                box-sizing: border-box !important;
            }
            #tm-recent-repairs-dropdown {
                display: inline-flex !important;
                align-items: center !important;
                height: var(--tm-footer-control-height) !important;
                margin: 0 !important;
            }
            #tm-buff-timers-container {
                display: flex;
                align-items: center;
                gap: 8px;
                height: var(--tm-footer-control-height);
            }
            .tm-footer-icon-btn {
                width: var(--tm-footer-control-height) !important;
                min-width: var(--tm-footer-control-height) !important;
                padding: 0 !important;
                justify-content: center !important;
                font-size: 16px !important;
                line-height: 1 !important;
            }
            #tm-recent-repairs-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0 14px !important;
                font-size: 12px !important;
            }
            #tm-eod-btn {
                position: relative;
                width: var(--tm-footer-control-height) !important;
                min-width: var(--tm-footer-control-height) !important;
                padding: 0 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 12px !important;
                font-size: 16px !important;
                line-height: 1 !important;
                cursor: pointer !important;
                border: 1px solid var(--tm-glass-border, rgba(255,255,255,0.2)) !important;
                background: var(--tm-glass-bg, linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)) !important;
                color: var(--tm-widget-text, white) !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
                transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease !important;
            }
            .tm-eod-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--tm-danger-color);
                color: var(--tm-text-on-primary, #fff);
                border-radius: 50%;
                min-width: 16px;
                height: 16px;
                font-size: 10px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                padding: 0 3px;
                box-sizing: border-box;
                border: 2px solid var(--tm-footer-bar-bg, var(--tm-shop-item-bg));
            }
            /* EOD modal — always loaded (default theme skips suite style injection) */
            #tm-eod-modal {
                position: fixed;
                inset: 0;
                background: var(--tm-overlay-dim, rgba(0, 0, 0, 0.82));
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            }
            .tm-eod-panel {
                background: var(--tm-modal-bg, var(--tm-panel-bg, #ffffff));
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                border-radius: 24px;
                padding: 28px;
                width: 90%;
                max-width: 560px;
                max-height: 82vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 28px 70px var(--tm-shadow-color, rgba(0, 0, 0, 0.45));
                color: var(--tm-primary-color, #343a40);
            }
            .tm-eod-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
            .tm-eod-title { margin: 0; color: var(--tm-primary-color); font-size: 1.2rem; font-weight: 700; }
            .tm-eod-done-badge {
                background: color-mix(in srgb, var(--tm-success-color) 18%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-success-color) 35%, transparent);
                color: var(--tm-success-color);
                border-radius: 20px;
                padding: 2px 9px;
                font-size: 11px;
                font-weight: 700;
                margin-left: 8px;
                vertical-align: middle;
            }
            .tm-eod-header-actions { display: flex; align-items: center; gap: 6px; }
            #tm-eod-refresh {
                background: var(--tm-chip-bg, var(--tm-shop-item-hover-bg));
                border: 1px solid var(--tm-chip-border, var(--tm-shop-item-border));
                color: var(--tm-muted-text, var(--tm-secondary-color));
                border-radius: 8px;
                padding: 5px 10px;
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: background-color 0.15s, color 0.15s, border-color 0.15s;
                white-space: nowrap;
            }
            #tm-eod-refresh:hover:not(:disabled) {
                background: var(--tm-shop-item-hover-bg);
                border-color: var(--tm-primary-color);
                color: var(--tm-primary-color);
            }
            #tm-eod-refresh:disabled { opacity: 0.6; cursor: wait; }
            #tm-eod-close {
                background: none;
                border: none;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                font-size: 22px;
                cursor: pointer;
                padding: 0 4px;
                line-height: 1;
            }
            #tm-eod-close:hover { color: var(--tm-danger-color); }
            .tm-eod-subtitle { margin: 0 0 18px; color: var(--tm-muted-text, var(--tm-secondary-color)); font-size: 13px; }
            .tm-eod-subtitle b { color: var(--tm-primary-color); }
            .tm-eod-subtitle .tm-eod-pending { color: var(--tm-warning-color); }
            .tm-eod-subtitle .tm-eod-complete { color: var(--tm-success-color); }
            #tm-eod-list { overflow-y: auto; flex: 1; padding-right: 4px; min-height: 0; }
            .tm-eod-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px 14px;
                border-radius: 12px;
                margin-bottom: 8px;
                background: var(--tm-shop-item-owned-bg, #e7f1ff);
                border: 1px solid var(--tm-shop-item-border, #dee2e6);
                transition: opacity 0.2s, background-color 0.2s;
            }
            .tm-eod-item.is-done {
                opacity: 0.5;
                background: var(--tm-shop-item-bg, #f8f9fa);
            }
            .tm-eod-check {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: var(--tm-primary-color);
                flex-shrink: 0;
                margin-top: 2px;
            }
            .tm-eod-check:disabled { cursor: not-allowed; opacity: 0.85; }
            .tm-eod-item-body { flex: 1; min-width: 0; }
            .tm-eod-item-row1 { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 4px; }
            .tm-eod-item-id { font-weight: 700; font-size: 14px; color: var(--tm-primary-color); }
            .tm-eod-item-customer { font-size: 13px; color: var(--tm-primary-color); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
            .tm-eod-item.is-done .tm-eod-item-id,
            .tm-eod-item.is-done .tm-eod-item-customer { text-decoration: line-through; color: var(--tm-muted-text, var(--tm-secondary-color)); }
            .tm-eod-item-device, .tm-eod-item-time { font-size: 11px; color: var(--tm-muted-text, var(--tm-secondary-color)); }
            .tm-eod-item-device { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
            .tm-eod-open-link {
                padding: 5px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                background: color-mix(in srgb, var(--tm-primary-color) 12%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-primary-color) 25%, transparent);
                color: var(--tm-link-color, var(--tm-primary-hover));
                text-decoration: none;
                flex-shrink: 0;
                margin-top: 1px;
                transition: background-color 0.15s, border-color 0.15s;
            }
            .tm-eod-open-link:hover {
                background: var(--tm-primary-color);
                color: var(--tm-text-on-primary, #fff);
                border-color: var(--tm-primary-color);
            }
            .tm-eod-empty { text-align: center; padding: 44px 0; color: var(--tm-muted-text, var(--tm-secondary-color)); }
            .tm-eod-empty-icon { font-size: 44px; margin-bottom: 12px; }
            .tm-eod-done-separator {
                font-size: 11px;
                color: var(--tm-muted-text, var(--tm-secondary-color));
                text-align: center;
                padding: 8px 0 4px;
                margin-top: 6px;
                letter-spacing: 0.05em;
            }
            #tm-eod-mark-all {
                width: 100%;
                margin-top: 16px;
                padding: 12px;
                background: color-mix(in srgb, var(--tm-primary-color) 14%, transparent);
                border: 1px solid color-mix(in srgb, var(--tm-primary-color) 35%, transparent);
                color: var(--tm-primary-color);
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 700;
                transition: background-color 0.15s, color 0.15s;
            }
            #tm-eod-mark-all:hover {
                background: var(--tm-primary-color);
                color: var(--tm-text-on-primary, #fff);
            }
            #tm-xp-bar-container {
                padding: 4px 10px !important;
                overflow: hidden;
            }
            #tm-footer-controls-container :is(
                #tm-notification-bell-btn,
                #tm-settings-btn,
                #tm-refresh-timer-container,
                #tm-recent-repairs-btn,
                #tm-eod-btn,
                #tm-daily-dashboard-widget,
                #tm-xp-bar-container,
                #tm-coin-balance,
                #tm-weather-widget,
                .tm-buff-timer,
                .tm-footer-widget,
                .tm-footer-icon-btn
            ):hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 12px var(--tm-shadow-color, rgba(0,0,0,0.2)) !important;
                border-color: var(--tm-glass-border, rgba(255,255,255,0.4)) !important;
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
                padding: 0;
            }
            .tm-qs-host--header {
                margin-right: 6px;
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
            .tm-qs-host--repair .tm-qs-input,
            .tm-qs-host--header .tm-qs-input,
            .tm-qs-host--repair .tm-qs-search-btn,
            .tm-qs-host--header .tm-qs-search-btn,
            .tm-qs-host--repair .tm-qs-hide-native,
            .tm-qs-host--header .tm-qs-hide-native {
                background-color: var(--tm-input-bg, #fff) !important;
                color: var(--tm-input-text, #212529) !important;
                -webkit-text-fill-color: var(--tm-input-text, #212529);
                border-color: var(--tm-input-border, #ced4da) !important;
            }
            .tm-qs-host--repair .tm-qs-input::placeholder,
            .tm-qs-host--header .tm-qs-input::placeholder {
                color: var(--tm-muted-text, #6c757d) !important;
                -webkit-text-fill-color: var(--tm-muted-text, #6c757d);
                opacity: 0.85;
            }
            .tm-qs-panel {
                display: inline-flex;
                flex-direction: row;
                align-items: center;
                gap: 4px;
                padding: 0;
                margin: 0;
                background: transparent;
                border: none;
                border-radius: 0;
                box-shadow: none;
                font: inherit;
                flex-wrap: nowrap;
                max-width: min(520px, 100%);
                box-sizing: border-box;
                vertical-align: middle;
            }
            .tm-qs-host--header .tm-qs-panel {
                gap: 4px;
                max-width: min(460px, 100%);
            }
            .tm-qs-input-group {
                flex: 1 1 88px;
                min-width: 72px;
            }
            .tm-qs-input {
                width: 100%;
                margin: 0;
                padding: 5px;
                border: 1px solid var(--tm-input-border, #ced4da);
                border-radius: 4px;
                font: inherit;
                font-size: inherit;
                line-height: normal;
                outline: none;
                box-sizing: border-box;
                background: var(--tm-input-bg, #fff);
                color: var(--tm-input-text, #212529);
                box-shadow: none;
                vertical-align: middle;
            }
            .tm-qs-input::placeholder {
                color: var(--tm-muted-text, #6c757d);
                opacity: 0.85;
                font-size: inherit;
            }
            .tm-qs-input:focus {
                border-color: var(--tm-input-focus-border, var(--tm-primary-color, #adb5bd));
                outline: 1px dotted var(--tm-input-text, #333);
                outline-offset: 1px;
            }
            .tm-qs-search-btn {
                flex-shrink: 0;
                margin: 0 !important;
                padding: 4px 10px !important;
                height: auto !important;
                min-height: 0 !important;
                font: inherit !important;
                font-weight: normal !important;
                line-height: normal !important;
                box-shadow: none !important;
                white-space: nowrap;
                vertical-align: middle;
                background: var(--tm-input-bg, #fff) !important;
                color: var(--tm-input-text, #212529) !important;
                border: 1px solid var(--tm-input-border, #ced4da) !important;
            }
            .tm-qs-hide-native {
                flex-shrink: 0;
                align-self: center;
                margin: 0;
                padding: 4px 6px;
                min-width: 22px;
                height: auto;
                border: 1px solid var(--tm-input-border, #ced4da);
                border-radius: 4px;
                background: var(--tm-input-bg, #fff);
                color: var(--tm-input-text, #212529);
                font: inherit;
                font-size: 12px;
                line-height: 1;
                cursor: pointer;
                box-shadow: none;
                vertical-align: middle;
            }
            .tm-qs-hide-native:hover {
                border-color: var(--tm-input-focus-border, #adb5bd);
                background: var(--tm-shop-item-hover-bg, #f8f9fa);
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
                background: var(--tm-glass-bg, linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%));
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: var(--tm-footer-text, var(--tm-widget-text, var(--tm-primary-color)));
                border: 1px solid var(--tm-glass-border, rgba(255,255,255,0.2));
                border-radius: 12px;
                height: var(--tm-footer-control-height, 40px);
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
                box-shadow: 0 2px 8px var(--tm-shadow-color, rgba(0,0,0,0.15));
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 13px;
                white-space: nowrap;
                box-sizing: border-box;
            }
            
            .tm-footer-widget:hover {
                border-color: var(--tm-primary-color);
                background: var(--tm-glass-hover-bg, linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%));
                color: var(--tm-primary-color);
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
                width: 300px;
                display: none; /* Hidden by default */
                flex-direction: column;
                gap: 8px;
            }
            #tm-scratchpad-reminder-popover h5 { margin: 0 0 6px 0; font-size: 14px; text-align: center; }
            .tm-sp-reminder-label {
                font-size: 11px;
                font-weight: 600;
                color: #6c757d;
                margin: 0;
            }
            #tm-scratchpad-reminder-popover input,
            #tm-scratchpad-reminder-popover select,
            #tm-scratchpad-reminder-popover textarea {
                width: 100%;
                padding: 8px;
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: 4px;
                font: inherit;
            }
            #tm-scratchpad-reminder-notes {
                min-height: 72px;
                resize: vertical;
                line-height: 1.4;
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

            .tm-star-particle,
            .tm-heart-particle,
            .tm-rainbow-particle {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 99999;
                line-height: 1;
            }
            .tm-star-particle {
                animation: tm-star-fall 3s ease-in forwards;
            }
            .tm-heart-particle {
                animation: tm-heart-float 2.5s ease-out forwards;
            }
            .tm-rainbow-particle {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                animation: tm-rainbow-fall 3s ease-out forwards;
            }
            .tm-sparkle-particle {
                position: fixed;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                background: radial-gradient(circle, #fff 0%, #ffe066 45%, transparent 70%);
                box-shadow: 0 0 8px #ffe066;
                animation: tm-sparkle-burst 1.6s ease-out forwards;
            }
            .tm-snow-particle {
                position: fixed;
                top: 0;
                left: 0;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
                animation: tm-snow-fall 4.5s linear forwards;
            }
            .tm-bubble-particle {
                position: fixed;
                bottom: -8vh;
                left: 0;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                border: 2px solid rgba(255, 255, 255, 0.75);
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(120,200,255,0.25));
                animation: tm-bubble-rise 3.5s ease-out forwards;
            }
            .tm-disco-overlay {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 99998;
                background: linear-gradient(120deg, rgba(255,0,128,0.08), rgba(0,255,255,0.08), rgba(255,255,0,0.08));
                animation: tm-disco-flash 0.6s ease-in-out 4 alternate;
            }
            @keyframes tm-star-fall {
                0% { transform: translateY(-10vh) rotate(0deg) scale(0.6); opacity: 0; }
                10% { opacity: 1; }
                100% { transform: translateY(110vh) rotate(540deg) scale(1.1); opacity: 0; }
            }
            @keyframes tm-heart-float {
                0% { transform: translateY(20vh) scale(0.5); opacity: 0; }
                15% { opacity: 1; }
                100% { transform: translateY(-20vh) scale(1.2); opacity: 0; }
            }
            @keyframes tm-rainbow-fall {
                0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            @keyframes tm-sparkle-burst {
                0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(var(--sx), var(--sy)) scale(1); opacity: 0; }
            }
            @keyframes tm-snow-fall {
                0% { transform: translateY(-10vh) translateX(0); opacity: 0.9; }
                100% { transform: translateY(110vh) translateX(var(--sway)); opacity: 0.2; }
            }
            @keyframes tm-bubble-rise {
                0% { transform: translateY(0) translateX(0) scale(0.6); opacity: 0.7; }
                100% { transform: translateY(-115vh) translateX(var(--drift)) scale(1); opacity: 0; }
            }
            @keyframes tm-disco-flash {
                0% { opacity: 0.15; filter: hue-rotate(0deg); }
                100% { opacity: 0.35; filter: hue-rotate(90deg); }
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
            #tm-mascot-container.mascot-dragging {
                cursor: grabbing;
                z-index: 10050;
                transition: none !important;
            }
            #tm-mascot-container.mascot-dragging .tm-mascot-robot {
                cursor: grabbing;
                animation: none !important;
            }
            #tm-mascot-container.mascot-parked::after {
                content: '📌';
                position: absolute;
                top: -2px;
                right: -2px;
                font-size: 11px;
                line-height: 1;
                opacity: 0.85;
                pointer-events: none;
                filter: drop-shadow(0 1px 1px rgba(0,0,0,0.35));
            }
            #tm-mascot-container.mascot-focus-quiet {
                opacity: 0.88;
                filter: saturate(0.85);
            }
            #tm-mascot-container.mascot-focus-quiet #tm-mascot-speech-bubble {
                display: none !important;
            }
            #tm-mascot-container.mascot-hiding {
                opacity: 0.42;
                filter: blur(0.4px) brightness(0.85);
                z-index: 40;
                transition: opacity 0.35s ease, filter 0.35s ease;
            }
            #tm-mascot-container.mascot-hiding.mascot-hide-hint {
                opacity: 0.62;
                animation: tm-mascot-hide-peek 1.2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-hide-found .tm-mascot-robot {
                animation: tm-mascot-happy-dance 0.8s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-chasing .tm-mascot-robot {
                animation: tm-mascot-chase-wiggle 0.35s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-chase-tired {
                opacity: 0.75;
                filter: grayscale(0.25);
            }
            #tm-mascot-container.mascot-spin .tm-mascot-robot {
                animation: tm-mascot-trick-spin 0.7s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-bow .tm-mascot-robot {
                animation: tm-mascot-trick-bow 1.1s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-firebreath .tm-mascot-robot {
                animation: tm-mascot-trick-fire 0.55s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-firebreath::before {
                content: '';
                position: absolute;
                left: 50%;
                top: 42%;
                width: 28px;
                height: 18px;
                margin-left: 10px;
                border-radius: 40% 60% 50% 50%;
                background: radial-gradient(circle at 20% 50%, #fff59d, #ff6d00 55%, transparent 70%);
                opacity: 0.85;
                pointer-events: none;
                animation: tm-mascot-fire-plume 0.45s ease-out infinite;
                z-index: 2;
            }
            #tm-mascot-container.mascot-jetpack-boost #jetpack .tm-mascot-thruster-left,
            #tm-mascot-container.mascot-jetpack-boost #jetpack .tm-mascot-thruster-right {
                animation: tm-mascot-jetpack-flame 0.15s linear infinite !important;
                filter: brightness(1.4);
            }
            #tm-mascot-container #jetpack.tm-accessory-equipped,
            #tm-mascot-container #bubble_wand.tm-accessory-equipped {
                cursor: pointer;
                pointer-events: auto;
            }
            @keyframes tm-mascot-hide-peek {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }
            @keyframes tm-mascot-chase-wiggle {
                0%, 100% { transform: rotate(-4deg) scale(1.02); }
                50% { transform: rotate(4deg) scale(1.05); }
            }
            @keyframes tm-mascot-trick-spin {
                from { transform: rotate(0deg) scale(1.05); }
                to { transform: rotate(360deg) scale(1.05); }
            }
            @keyframes tm-mascot-trick-bow {
                0%, 100% { transform: rotate(0deg) translateY(0); }
                40% { transform: rotate(18deg) translateY(6px); }
                55% { transform: rotate(18deg) translateY(6px); }
            }
            @keyframes tm-mascot-trick-fire {
                0%, 100% { transform: scale(1) translateX(0); }
                50% { transform: scale(1.08) translateX(3px); }
            }
            @keyframes tm-mascot-fire-plume {
                0% { opacity: 0.2; transform: scaleX(0.4) translateX(0); }
                50% { opacity: 0.95; transform: scaleX(1.2) translateX(8px); }
                100% { opacity: 0.15; transform: scaleX(0.6) translateX(14px); }
            }

            /* Mascot play overlay + mini-games */
            #tm-mascot-play-overlay {
                position: fixed; inset: 0; z-index: 100200;
                display: flex; align-items: center; justify-content: center;
            }
            #tm-mascot-play-overlay .tm-mascot-play-backdrop {
                position: absolute; inset: 0;
                background: rgba(15, 23, 42, 0.5);
                backdrop-filter: blur(4px);
            }
            #tm-mascot-play-overlay .tm-mascot-play-card {
                position: relative;
                width: min(420px, 94vw);
                max-height: 90vh;
                overflow: auto;
                background: var(--tm-modal-bg, #fff);
                color: var(--tm-shop-item-text, #1e293b);
                border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                border-radius: 16px;
                box-shadow: 0 18px 40px rgba(0,0,0,0.25);
                padding: 16px 16px 14px;
            }
            #tm-mascot-play-overlay .tm-mascot-play-head {
                display: flex; justify-content: space-between; gap: 10px; align-items: flex-start;
                margin-bottom: 12px;
            }
            #tm-mascot-play-overlay .tm-mascot-play-title { margin: 0; font-size: 1.1rem; }
            #tm-mascot-play-overlay .tm-mascot-play-sub { margin: 4px 0 0; font-size: 12px; opacity: 0.75; }
            #tm-mascot-play-overlay .tm-mascot-play-close {
                border: none; background: var(--tm-shop-item-bg, #f1f5f9); border-radius: 10px;
                width: 32px; height: 32px; cursor: pointer; font-size: 18px;
            }
            #tm-mascot-play-overlay .tm-mascot-play-result { margin: 0 0 8px; font-weight: 600; }
            #tm-mascot-play-overlay .tm-mascot-play-done,
            #tm-mascot-play-overlay .tm-scramble-check,
            #tm-mascot-play-overlay .tm-rhythm-pad {
                border: 1px solid var(--tm-primary-color, #007bff);
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 12%, transparent);
                color: var(--tm-primary-color, #007bff);
                border-radius: 12px; padding: 10px 14px; cursor: pointer; font-weight: 700;
            }
            .tm-rhythm-stage { text-align: center; }
            .tm-rhythm-mascot { font-size: 42px; margin: 8px 0 4px; display: inline-block; }
            .tm-rhythm-mascot.beat { animation: tm-rhythm-flap 0.28s ease-out; }
            @keyframes tm-rhythm-flap {
                0% { transform: scale(1) rotate(0); }
                40% { transform: scale(1.2) rotate(-12deg); }
                100% { transform: scale(1) rotate(0); }
            }
            .tm-rhythm-hit { font-size: 18px; font-weight: 700; min-height: 28px; margin-bottom: 8px; }
            .tm-rhythm-hit.good { color: #16a34a; }
            .tm-rhythm-hit.ok { color: #ca8a04; }
            .tm-rhythm-hit.miss { color: #dc2626; }
            .tm-rhythm-stats { display: flex; justify-content: center; gap: 14px; font-size: 12px; margin-bottom: 12px; }
            .tm-rhythm-pad { width: 100%; font-size: 1.2rem; padding: 18px !important; }
            .tm-rhythm-pad.good { background: #16a34a !important; color: #fff !important; border-color: #16a34a !important; }
            .tm-rhythm-pad.miss { background: #dc2626 !important; color: #fff !important; border-color: #dc2626 !important; }
            .tm-shadow-silhouette {
                width: 100px; height: 100px; margin: 0 auto 10px;
                background: #0f172a;
                border-radius: 16px;
                filter: contrast(2);
                box-shadow: inset 0 0 0 2px rgba(255,255,255,0.08);
                position: relative;
                overflow: hidden;
            }
            .tm-shadow-silhouette::after {
                content: attr(data-char);
                position: absolute; inset: 0;
                display: flex; align-items: center; justify-content: center;
                font-size: 48px; filter: brightness(0);
                opacity: 0.95;
            }
            .tm-shadow-silhouette[data-char="dragon"]::after { content: '🐉'; }
            .tm-shadow-silhouette[data-char="robot"]::after { content: '🤖'; }
            .tm-shadow-silhouette[data-char="slime"]::after { content: '🟢'; }
            .tm-shadow-silhouette[data-char="plant"]::after { content: '🌱'; }
            .tm-shadow-silhouette[data-char="ghost"]::after { content: '👻'; }
            .tm-shadow-silhouette[data-char="cat"]::after { content: '🐱'; }
            .tm-shadow-silhouette[data-char="phoenix"]::after { content: '🔥'; }
            .tm-shadow-silhouette[data-char="crystal"]::after { content: '💎'; }
            .tm-shadow-options { display: grid; gap: 8px; }
            .tm-shadow-opt {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 12px; border-radius: 12px; cursor: pointer;
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                background: var(--tm-shop-item-bg, #f8fafc);
            }
            .tm-shadow-opt.correct { border-color: #16a34a; background: #dcfce7; }
            .tm-shadow-opt.wrong { border-color: #dc2626; background: #fee2e2; }
            .tm-shadow-emoji { font-size: 22px; }
            .tm-scramble-list { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 8px; }
            .tm-scramble-ticket {
                display: grid; grid-template-columns: auto 1fr auto auto; gap: 8px; align-items: center;
                padding: 10px; border-radius: 12px; border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: var(--tm-shop-item-bg, #fff);
            }
            .tm-scramble-status { color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 999px; }
            .tm-scramble-moves button {
                width: 28px; height: 28px; border-radius: 8px; border: 1px solid #cbd5e1; cursor: pointer; background: #f8fafc;
            }
            .tm-scramble-check { width: 100%; }
            .tm-mascot-bubble-toy-layer {
                position: fixed; inset: 0; z-index: 100100; pointer-events: none;
            }
            .tm-mascot-toy-bubble {
                position: fixed; width: 28px; height: 28px; border-radius: 50%;
                border: 2px solid rgba(125, 211, 252, 0.9);
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(125,211,252,0.35));
                pointer-events: auto; cursor: pointer;
                animation: tm-toy-bubble-float var(--tm-bubble-dur, 3s) ease-out forwards;
            }
            .tm-mascot-toy-bubble.popped {
                animation: tm-toy-bubble-pop 0.25s ease-out forwards;
            }
            @keyframes tm-toy-bubble-float {
                to { transform: translate(var(--tm-bubble-dx, 40px), -160px); opacity: 0.15; }
            }
            @keyframes tm-toy-bubble-pop {
                to { transform: scale(1.6); opacity: 0; }
            }
            #tm-mascot-stats-modal .tm-mascot-nickname-row {
                display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
                margin: 0 0 12px; padding: 8px 10px;
                border-radius: 12px;
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 6%, transparent);
            }
            #tm-mascot-stats-modal .tm-mascot-nickname-row label { font-size: 12px; font-weight: 600; }
            #tm-mascot-stats-modal .tm-mascot-nickname-input {
                flex: 1; min-width: 120px; padding: 8px 10px; border-radius: 10px;
                border: 1px solid var(--tm-shop-item-border, #cbd5e1);
                background: var(--tm-input-bg, #fff);
            }
            #tm-mascot-stats-modal .tm-actions-subtitle {
                margin: 10px 0 8px; font-size: 12px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.7;
            }
            #tm-mascot-stats-modal .tm-trick-unlocked {
                border-color: color-mix(in srgb, #16a34a 45%, transparent);
                background: color-mix(in srgb, #16a34a 10%, transparent);
            }
            /* ...but the robot and its panel inside are. */
            #tm-mascot-container > svg {
                pointer-events: auto;
            }
            .tm-mascot-robot {
                width: 100%; height: 100%;
                /* Default idle animation - applies to ALL evolutions */
                animation: tm-mascot-idle-float 4s ease-in-out infinite;
                cursor: grab;
                touch-action: none;
                image-rendering: pixelated; /* Key for the retro look */
                /* Performance optimizations */
                will-change: transform;
                transform: translateZ(0); /* Force hardware acceleration */
            }
            /* Optimize all mascot accessories for smooth animation */
            #tm-mascot-acc-front .tm-mascot-accessory { pointer-events: none; }
            #tm-mascot-acc-front .tm-mascot-accessory[data-tm-back-slot="true"] { opacity: 0.98; }
            .tm-accessory-art { transform-origin: center center; transform-box: fill-box; }
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
            #tm-mascot-container.mascot-idle .tm-animate-body,
            #tm-mascot-container.mascot-idle .tm-mascot-robot { animation: tm-mascot-idle-float 4s ease-in-out infinite; }
            #tm-mascot-container.mascot-idle .tm-mascot-eye-open,
            #tm-mascot-container.mascot-happy .tm-mascot-eye-open,
            #tm-mascot-container.mascot-sad .tm-mascot-eye-open {
                animation: tm-mascot-blink 5s steps(1, end) infinite;
            }
            
            /* Accessories animate on inner art so SVG anchor transforms stay intact */
            #tm-mascot-container.mascot-idle #party_hat .tm-accessory-art,
            #tm-mascot-container.mascot-idle #star_crown .tm-accessory-art,
            #tm-mascot-container.mascot-idle #flower_crown .tm-accessory-art,
            #tm-mascot-container.mascot-idle #digital_headphones .tm-accessory-art,
            #tm-mascot-container.mascot-idle #halo .tm-accessory-art {
                animation: tm-mascot-hat-gentle-bob 2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-idle #pixel_sunglasses .tm-accessory-art,
            #tm-mascot-container.mascot-idle #tech_goggles .tm-accessory-art {
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
            #tm-mascot-container.mascot-happy #party_hat .tm-accessory-art,
            #tm-mascot-container.mascot-happy #star_crown .tm-accessory-art,
            #tm-mascot-container.mascot-happy #flower_crown .tm-accessory-art {
                animation: tm-mascot-hat-bounce-happy 0.8s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-happy #jetpack .tm-accessory-art {
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
            #tm-mascot-container.mascot-energized .tm-mascot-accessory {
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
            #tm-mascot-container.mascot-surprised .tm-mascot-robot { animation: tm-mascot-startled 0.45s ease-out infinite; }
            #tm-mascot-container.mascot-surprised .tm-mascot-antenna { animation: tm-mascot-antenna-happy-wiggle 0.35s ease-in-out infinite; }
            #tm-mascot-container.mascot-dodging #party_hat .tm-accessory-art,
            #tm-mascot-container.mascot-dodging #star_crown .tm-accessory-art,
            #tm-mascot-container.mascot-dodging #flower_crown .tm-accessory-art {
                animation: tm-mascot-hat-fly-off 0.4s ease-out;
            }
            #tm-mascot-container.mascot-dodging #pixel_sunglasses .tm-accessory-art,
            #tm-mascot-container.mascot-dodging #tech_goggles .tm-accessory-art {
                animation: tm-mascot-shades-wobble 0.4s ease-out;
            }

            /* Enhanced Playful States with Natural Accessory Interactions */
            #tm-mascot-container.mascot-reading .tm-mascot-robot { animation: tm-mascot-reading-bob 3s ease-in-out infinite; }
            #tm-mascot-container.mascot-reading #book {
                display: block !important;
            }
            #tm-mascot-container.mascot-reading #book .tm-accessory-art {
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
            #tm-mascot-container.mascot-juggling #bubble_wand {
                display: block !important;
            }
            #tm-mascot-container.mascot-juggling #bubble_wand .tm-accessory-art {
                animation: tm-mascot-shades-adjust 1.2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-sunny #pixel_sunglasses,
            #tm-mascot-container.mascot-sunny #tech_goggles { display: block !important; }
            #tm-mascot-container.mascot-rainy #umbrella {
                display: block !important;
            }
            #tm-mascot-container.mascot-rainy #umbrella .tm-accessory-art {
                animation: tm-mascot-shades-adjust 2s ease-in-out infinite;
            }
            #tm-mascot-container.mascot-glitching .tm-mascot-accessory {
                animation: tm-mascot-accessory-glitch 0.3s infinite;
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

            .tm-panel-section-danger {
                border-top: 1px solid rgba(220, 53, 69, 0.2);
                margin-top: 4px;
                padding-top: 12px;
            }

            .tm-btn-kill-restart {
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.22), rgba(220, 53, 69, 0.12));
                border-color: rgba(220, 53, 69, 0.45);
                width: 100%;
            }
            .tm-btn-kill-restart:hover {
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.35), rgba(220, 53, 69, 0.22));
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
                min-height: 40px;
                height: auto;
                padding: 5px 10px 6px;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                min-width: 200px;
                max-width: 260px;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 3px;
            }
            .tm-xp-bar-header {
                display: flex;
                align-items: center;
                gap: 5px;
                flex-wrap: wrap;
                line-height: 1.2;
                padding-right: 2px;
            }
            .tm-xp-bar-sep { opacity: 0.5; font-size: 10px; }
            #tm-level-text {
                position: static;
                background: linear-gradient(135deg, rgba(255,215,0,0.35) 0%, rgba(255,170,0,0.25) 100%);
                padding: 1px 6px;
                border-radius: 8px;
                font-size: 9px;
                font-weight: 800;
                color: white;
                border: 1px solid rgba(255, 215, 0, 0.45);
                flex-shrink: 0;
            }
            #tm-user-title-text {
                display: inline;
                font-size: 9px;
                font-weight: 700;
                margin: 0;
                padding: 0;
                letter-spacing: 0.2px;
                text-transform: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 120px;
                color: white;
            }
            .tm-buff-inventory {
                margin-left: auto;
                font-size: 9px;
                font-weight: 800;
                padding: 2px 6px;
                border-radius: 8px;
                background: rgba(0,0,0,0.25);
                border: 1px solid rgba(255,255,255,0.25);
                cursor: pointer;
                color: #fff;
            }
            .tm-buff-inventory:hover { background: rgba(0,191,255,0.35); }
            .tm-xp-bar-track-row { width: 100%; }
            .tm-level-perks-line {
                font-size: 8px;
                opacity: 0.85;
                color: rgba(255,255,255,0.9);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tm-xp-next-preview {
                position: absolute;
                left: 0;
                right: 0;
                bottom: calc(100% + 6px);
                z-index: 100010;
                background: rgba(20,24,32,0.96);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 10px;
                padding: 8px 10px;
                font-size: 10px;
                color: #eee;
                box-shadow: 0 8px 24px rgba(0,0,0,0.35);
                pointer-events: none;
            }
            .tm-xp-preview-title { font-weight: 800; margin-bottom: 4px; color: #ffd700; }
            .tm-xp-preview-line { margin: 2px 0; opacity: 0.95; }
            .tm-xp-preview-perks { margin-top: 5px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.12); opacity: 0.8; }
            .tm-shop-price-original { text-decoration: line-through; opacity: 0.55; margin-right: 4px; }
            .tm-shop-price-sale { color: var(--tm-success-color, #22c55e); font-weight: 800; }
            .tm-quest-bounty-bonus { font-size: 10px; opacity: 0.75; margin-top: 2px; }
            .tm-loot-box-panel {
                background: var(--tm-shop-item-bg, #1a1a2e);
                border-radius: 14px;
                padding: 20px;
                max-width: 420px;
                width: min(92vw, 420px);
                border: 1px solid rgba(255,215,0,0.35);
            }
            .tm-loot-box-title { margin: 0 0 6px; text-align: center; color: #ffd700; }
            .tm-loot-box-sub { margin: 0 0 14px; text-align: center; opacity: 0.85; font-size: 13px; }
            .tm-loot-box-options { display: flex; flex-direction: column; gap: 8px; }
            .tm-loot-box-option {
                display: grid;
                grid-template-columns: 36px 1fr;
                grid-template-rows: auto auto;
                gap: 2px 10px;
                align-items: center;
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.12);
                background: rgba(255,255,255,0.05);
                cursor: pointer;
                color: inherit;
                text-align: left;
            }
            .tm-loot-box-option:hover { border-color: #ffd700; background: rgba(255,215,0,0.12); }
            .tm-loot-box-option__icon { grid-row: 1 / 3; font-size: 22px; }
            .tm-loot-box-option__label { font-weight: 800; font-size: 13px; }
            .tm-loot-box-option__desc { grid-column: 2; font-size: 11px; opacity: 0.75; }
            #tm-xp-bar-container:hover {
                background: linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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
                background: linear-gradient(90deg, var(--tm-xp-fill-start, #ffd700) 0%, var(--tm-xp-fill-end, #ffaa00) 100%);
                transition: width 0.5s ease-out;
                box-shadow: 0 0 10px var(--tm-glow-color, rgba(255, 215, 0, 0.5));
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
            .tm-shop-consumable-group {
                grid-column: 1 / -1;
                font-weight: 700;
                font-size: 13px;
                color: var(--tm-primary-color, #343a40);
                margin: 10px 0 2px;
                padding-top: 10px;
                border-top: 1px solid var(--tm-shop-item-border, #dee2e6);
            }
            .tm-shop-grid > .tm-shop-consumable-group:first-child {
                border-top: none;
                margin-top: 0;
                padding-top: 0;
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