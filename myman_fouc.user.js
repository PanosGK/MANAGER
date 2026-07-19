// ==UserScript==
// @name         MyManager FOUC Guard (instant hide)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Backup hide only. For a true blank before first paint, load myman-fouc-extension in Chrome (see repo). Install alongside the main suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @run-at       document-start
// @grant        none
// @inject-into  page
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
    root.classList.add('tm-mms-fouc-ext');
    root.style.setProperty('display', 'none', 'important');
    root.style.setProperty('visibility', 'hidden', 'important');
    root.style.setProperty('opacity', '0', 'important');
    root.style.setProperty('background', '#121212', 'important');

    var style = document.createElement('style');
    style.id = 'tm-mms-fouc-guard-instant';
    style.textContent = [
        'html.tm-mms-fouc-ext:not(.' + READY + '),',
        'html.tm-mms-fouc-ext:not(.' + READY + ') body,',
        'html[data-tm-mms-fouc="1"]:not(.' + READY + '),',
        'html[data-tm-mms-fouc="1"]:not(.' + READY + ') body{',
        'display:none!important;visibility:hidden!important;opacity:0!important;',
        '}',
        'html.tm-mms-fouc-ext:not(.' + READY + '),',
        'html[data-tm-mms-fouc="1"]:not(.' + READY + '){background:#121212!important;}',
    ].join('');
    (root.firstChild ? root.insertBefore(style, root.firstChild) : root.appendChild(style));

    setTimeout(function () {
        if (!root.classList.contains(READY)) {
            root.classList.add(READY);
            root.removeAttribute('data-tm-mms-fouc');
            root.classList.remove('tm-mms-fouc-ext');
            root.style.removeProperty('display');
            root.style.removeProperty('visibility');
            root.style.removeProperty('opacity');
            root.style.removeProperty('background');
        }
    }, 8000);
})();
