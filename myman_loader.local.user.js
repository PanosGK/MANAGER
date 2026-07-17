// ==UserScript==
// @name         MyManager All-in-One Suite (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      12
// @description  Local development — sync @require bundle (FOUC first inside bundle). Run: npm run build. Enable "Allow access to local file URLs".
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_suite.bundle.js
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Local: bundle @require runs FOUC as its first lines (same as when FOUC worked).
