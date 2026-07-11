// ==UserScript==
// @name         MyManager FOUC Guard
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Optional extra hide layer (no downloads). Enable if you still see a flash before the main suite loads.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var path = (window.location && window.location.pathname) || '';
    if (path.indexOf('login.php') !== -1) return;
    if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

    var root = document.documentElement;
    root.style.setProperty('visibility', 'hidden', 'important');
    root.style.setProperty('opacity', '0', 'important');
    root.style.backgroundColor = '#121212';

    var style = document.createElement('style');
    style.id = 'tm-mms-fouc-guard';
    style.textContent = 'html:not(.tm-mms-theme-ready),html:not(.tm-mms-theme-ready) body{visibility:hidden!important;opacity:0!important;background:#121212!important}';
    (document.head || root).appendChild(style);
})();
