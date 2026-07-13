// ==UserScript==
// @name         MyManager All-in-One Suite (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      181
// @description  Local development — bundled modules from disk. Run: node scripts/generate-loader.mjs after edits.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_suite.bundle.js
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Local dev — bundle loads from disk (fast). Regenerate with: node scripts/generate-loader.mjs
