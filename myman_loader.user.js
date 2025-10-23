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
// @connect      localhost
//require           c:/Users/User/Documents/GitHub/MANAGER/modules/myman_allinone.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('[MMS Loader] Starting script injection...');

    // An array of local script paths to load in order.
    const scriptsToLoad = [
        'http://localhost:8080/modules/myman_allinone.js'
    ];

    async function loadScripts() {
        for (const scriptUrl of scriptsToLoad) {
            try {
                // Use GM_xmlhttpRequest to fetch the local script content.
                // This can bypass the browser's restriction on fetching file:// resources.
                GM_xmlhttpRequest({
                    method: "GET",
                    url: scriptUrl,
                    onload: function(response) {
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = response.responseText;
                        document.head.appendChild(scriptElement);
                        console.log(`[MMS Loader] Successfully loaded and injected: ${scriptUrl}`);
                    },
                    onerror: function(error) {
                        console.error(`[MMS Loader] GM_xmlhttpRequest failed for script: ${scriptUrl}`, error);
                    }
                });
            } catch (error) {
                console.error(`[MMS Loader] Caught an unexpected error for script: ${scriptUrl}`, error);
            }
        }
    }

    loadScripts();
})();