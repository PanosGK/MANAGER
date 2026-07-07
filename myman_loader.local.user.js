// ==UserScript==
// @name         MyManager All-in-One Suite (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      166
// @description  Local development entry — loads modules from disk. For production, use myman_loader.user.js instead.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_themes.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_config.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_profiles.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_utils.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_print.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_styles.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_settings.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_search.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_scratchpad.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_mascot.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_gamification.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_phonelist.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_technicianstats.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_orderhistory.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_status40.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_pricetransfer.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_statushover.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_orderlink.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_weather.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_eod.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_repair_reminders.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_repair_phone.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_footersearch.js
// @require      file://C:\Users\User\Documents\GitHub\MANAGER\myman_allinone.js
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Edit the file:// paths above if your repo lives elsewhere.
