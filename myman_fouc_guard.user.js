// ==UserScript==
// @name         MyManager FOUC Guard (instant hide)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hides MyManager until the main suite applies your theme. Install alongside MyManager All-in-One Suite.
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
    style.textContent = [
        'html:not(.tm-mms-theme-ready){',
        'visibility:hidden!important;',
        'opacity:0!important;',
        'background:#121212!important;',
        '}',
        'html:not(.tm-mms-theme-ready) body{',
        'visibility:hidden!important;',
        'opacity:0!important;',
        '}',
    ].join('');

    var parent = document.head || document.getElementsByTagName('head')[0] || root;
    parent.appendChild(style);
})();
