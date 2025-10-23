
// ==UserScript==
// @name         MyManager All-in-One Suite
// @namespace    http://tampermonkey.net/
// @version      121
// @description  An all-in-one suite for mymanager.gr, combining Advanced Search, Auto-Refresh, Quick Navigation, a Dashboard, and more.
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\utils.js
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\config.js
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\styles.js
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\gamification.js
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\myman_login.js
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\myman_mascot.js
// @require      file://c:\Users\User\Documents\GitHub\MANAGER\modules\myman_themes.js

 
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// ==/UserScript==

(function() {
    'use strict';

    // Hide the body initially to prevent Flash of Unstyled Content (FOUC).
    // It will be made visible at the end of the 'load' event listener.
    GM_addStyle('body { visibility: hidden; opacity: 0; transition: opacity 0.3s ease-in; }');
    
    // ===================================================================
    // === ERROR HANDLER: SUPPRESS SERVER JSON CONFIGURATION ERRORS
    // ===================================================================
    // Intercept and suppress the specific JSON configuration error that appears
    // when adding comments/notes to repairs
    (function() {
        // Store original functions
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        
        // Helper function to check if message is a JSON configuration response
        function isConfigurationMessage(message) {
            if (typeof message !== 'string') return false;
            
            try {
                const parsed = JSON.parse(message);
                // Check for various configuration response patterns
                return (parsed.settings && parsed.settings.tableSettings) ||
                       (parsed.html && parsed.additionalJS) ||
                       (parsed.controlsMap) ||
                       (parsed.viewControlsMap);
            } catch (e) {
                return false;
            }
        }
        
        // Override window.alert to filter out JSON configuration errors
        window.alert = function(message) {
            if (isConfigurationMessage(message)) {
                console.log('[MMS] Suppressed server configuration alert');
                console.log('[MMS] Configuration type:', message.substring(0, 100) + '...');
                return; // Don't show the alert
            }
            
            // Call the original alert for all other messages
            return originalAlert.apply(this, arguments);
        };
        
        // Override window.confirm as well (in case it's used for errors)
        window.confirm = function(message) {
            if (isConfigurationMessage(message)) {
                console.log('[MMS] Suppressed server configuration confirm dialog');
                return true; // Auto-confirm
            }
            
            // Call the original confirm for all other messages
            return originalConfirm.apply(this, arguments);
        };
        
        // Also intercept modal/popup creation if MyManager uses custom dialogs
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.apply(this, arguments);
            
            // Monitor for error dialog divs
            if (tagName && tagName.toLowerCase() === 'div') {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && element.textContent) {
                            if (isConfigurationMessage(element.textContent)) {
                                console.log('[MMS] Suppressed configuration dialog div');
                                element.style.display = 'none';
                            }
                        }
                    });
                });
                
                // Start observing after a microtask to avoid immediate observation
                setTimeout(() => {
                    observer.observe(element, { childList: true, subtree: true });
                }, 0);
            }
            
            return element;
        };
        
        console.log('[MMS] Enhanced error handler initialized - Configuration messages will be suppressed');
    })();

    // Functions are loaded from the @require'd scripts.
    // The main script can now be used for initialization and event listeners.

    document.addEventListener('DOMContentLoaded', function() {
        // Initialization logic here
    });

    window.addEventListener('load', function() {
        // Make the body visible now that all styles and scripts are loaded.
        GM_addStyle('body { visibility: visible; opacity: 1; }');
    });

})();
