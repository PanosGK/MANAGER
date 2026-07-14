// ==UserScript==
// @name         MyManager Suite Menu Icons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Custom left-menu icons for suite features (matches native menu-icon styling).
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// ==/UserScript==

(function() {
    'use strict';

    const SUITE_MENU_ICON_SVGS = {
        'super-search': `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="6.75" cy="6.75" r="4" fill="none" stroke="#000" stroke-width="1.6"/>
                <path d="M10.25 10.25L14 14" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round"/>
            </svg>`,
        'phone-catalog': `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="4.75" y="1.75" width="6.5" height="12.5" rx="1.2" fill="none" stroke="#000" stroke-width="1.6"/>
                <path d="M6.75 4.75h2.5M6.75 6.75h2.5M6.75 8.75h1.75" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round"/>
                <circle cx="8" cy="12.25" r="0.75" fill="#000"/>
            </svg>`
    };

    function svgToDataUri(svg) {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
    }

    function createSuiteMenuIcon(kind) {
        const svg = SUITE_MENU_ICON_SVGS[kind];
        const img = document.createElement('img');
        img.className = 'menu-icon tm-suite-menu-icon';
        if (kind) img.classList.add(`tm-suite-menu-icon--${kind}`);
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.draggable = false;
        if (svg) img.src = svgToDataUri(svg);
        return img;
    }

    function populateSuiteMenuLink(link, label, iconKind) {
        if (!link) return;
        link.setAttribute('href', '#');
        link.innerHTML = '';
        if (iconKind && SUITE_MENU_ICON_SVGS[iconKind]) {
            link.appendChild(createSuiteMenuIcon(iconKind));
            link.appendChild(document.createTextNode(` ${label}`));
        } else {
            link.textContent = label;
        }
    }

    function getSuiteMenuItemLink(li) {
        return li.querySelector(':scope > div > div > a[href], :scope > div a[href], :scope > a[href]');
    }

    function createSuiteMenuItem(templateLi, label, iconKind) {
        let li;
        if (templateLi) {
            li = templateLi.cloneNode(true);
            li.classList.remove('current', 'expanded');
            li.removeAttribute('id');
            li.querySelectorAll(':scope > ul').forEach((ul) => ul.remove());
        } else {
            li = document.createElement('li');
            li.innerHTML = '<div><div><a href="#"></a></div></div>';
        }

        populateSuiteMenuLink(getSuiteMenuItemLink(li), label, iconKind);
        return li;
    }

    window.createSuiteMenuIcon = createSuiteMenuIcon;
    window.populateSuiteMenuLink = populateSuiteMenuLink;
    window.createSuiteMenuItem = createSuiteMenuItem;
})();
