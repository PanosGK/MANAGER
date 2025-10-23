// ==UserScript==
// @name         MyManager All-in-One Suite (Loader)
// @namespace    http://tampermonkey.net/
// @version      15.22
// @description  Loads the MyManager All-in-One Suite for local development.
// @author       Gkorogias - Gemini AI - Chat GPT
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      thefixers.mymanager.gr
// ==/UserScript==

(function() {
    'use strict';

    console.log('[MMS Loader] Starting script injection...');

    // An array of local script paths to load in order.
    const scriptsToLoad = [
        'file://c:/Users/User/Desktop/Scripts_Into_Development/myman_themes.js',
        'file://c:/Users/User/Desktop/Scripts_Into_Development/myman_login.js',
        'file://c:/Users/User/Desktop/Scripts_Into_Development/myman_mascot.js',
        'file://c:/Users/User/Desktop/Scripts_Into_Development/myman_gamification.js',
        'file://c:/Users/User/Desktop/Scripts_Into_Development/myman_allinone.js'
    ];

    async function loadScripts() {
        for (const scriptUrl of scriptsToLoad) {
            try {
                // Add cache-busting parameter
                const cacheBuster = `?t=${Date.now()}`;
                const response = await fetch(scriptUrl + cacheBuster);
                const scriptText = await response.text();
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptText;
                document.head.appendChild(scriptElement);
                console.log(`[MMS Loader] Successfully loaded and injected: ${scriptUrl}`);
            } catch (error) {
                console.error(`[MMS Loader] Failed to load script: ${scriptUrl}`, error);
            }
        }
    }

    loadScripts();
})();