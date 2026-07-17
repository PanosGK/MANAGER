// ==UserScript==
// @name         MyManager All-in-One Suite (Local Dev)
// @namespace    http://tampermonkey.net/
// @version      13
// @description  Local development — theme_early first, then modules from disk. Run: npm run build. Enable "Allow access to local file URLs".
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
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_theme_early.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_liquid_glass_styles.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_performance_styles.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_themes.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_config.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_profiles.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_utils.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_print.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_styles.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_settings.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_menuhiding.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_menu_icons.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_search.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_scratchpad.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_mascot.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_mascot_play.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_gamification.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_phone_catalog_ui.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_phonelist.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_phone_catalog_settings.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_store_locator.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_technicianstats.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_orderhistory.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_status40.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_pricetransfer.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_statushover.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_orderlink.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_weather.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_eod.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_repair_reminders.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_repair_phone.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_footersearch.js
// @require      file://C:/Users/User/Documents/GitHub/MANAGER/myman_allinone.js
// @connect      thefixers.mymanager.gr
// @connect      geocoding-api.open-meteo.com
// @connect      api.open-meteo.com
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Local: theme_early is the first @require (hides body until themes are ready).
