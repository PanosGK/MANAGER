// ==UserScript==
// @name         MyManager FOUC Guard (instant hide)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Hides MyManager before first paint. Install alongside MyManager All-in-One Suite (grant-none runs earlier than the main loader).
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_fouc.user.js
// @downloadURL  https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_fouc.user.js
// ==/UserScript==

(function () {
    'use strict';
    var path = (window.location && window.location.pathname) || '';
    if (path.indexOf('login.php') !== -1) return;
    if (new URLSearchParams(window.location.search).get('tm_quickview') === '1') return;

    var READY = 'tm-mms-theme-ready';
    var root = document.documentElement;
    root.classList.remove(READY);
    root.setAttribute('data-tm-mms-fouc', '1');
    root.style.setProperty('display', 'none', 'important');
    root.style.setProperty('visibility', 'hidden', 'important');
    root.style.setProperty('opacity', '0', 'important');
    root.style.setProperty('background', '#121212', 'important');

    var style = document.createElement('style');
    style.id = 'tm-mms-fouc-guard-instant';
    style.textContent = [
        'html[data-tm-mms-fouc="1"]:not(.' + READY + '),',
        'html[data-tm-mms-fouc="1"]:not(.' + READY + ') body{',
        'display:none!important;visibility:hidden!important;opacity:0!important;',
        '}',
        'html[data-tm-mms-fouc="1"]:not(.' + READY + '){background:#121212!important;}',
    ].join('');
    root.appendChild(style);

    // Failsafe if the main suite never reveals (8s).
    setTimeout(function () {
        if (!root.classList.contains(READY)) {
            root.classList.add(READY);
            root.removeAttribute('data-tm-mms-fouc');
            root.style.removeProperty('display');
            root.style.removeProperty('visibility');
            root.style.removeProperty('opacity');
            root.style.removeProperty('background');
        }
    }, 8000);
})();
