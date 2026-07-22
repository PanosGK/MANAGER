/**
 * Runs at document_start with the CSS content script.
 * - Skips login / quickview (reveal immediately)
 * - On repeat visits: apply cached theme/CSS, then reveal
 * - Mounts cached #tm-footer-controls-container; suite replaces + hydrates vars
 */
(function tmMmsFoucExtension() {
  'use strict';

  var READY = 'tm-mms-theme-ready';
  var BRIDGE = 'tm-mms-fouc-bridging';
  var LS_THEME = 'tm_mms_fouc_theme';
  var LS_MENU = 'tm_mms_fouc_menu_css';
  var LS_PAGE = 'tm_mms_fouc_page_css';

  function parseRgb(color) {
    var s = String(color || '').trim();
    var hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);
    if (hex) {
      return { r: parseInt(hex[1], 16), g: parseInt(hex[2], 16), b: parseInt(hex[3], 16) };
    }
    var shortHex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(s);
    if (shortHex) {
      return {
        r: parseInt(shortHex[1] + shortHex[1], 16),
        g: parseInt(shortHex[2] + shortHex[2], 16),
        b: parseInt(shortHex[3] + shortHex[3], 16),
      };
    }
    var rgb = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
    return null;
  }

  function isDarkColor(color) {
    var rgb = parseRgb(color);
    if (!rgb) return true;
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 < 0.55;
  }

  function installBridge(colors, bg) {
    var root = document.documentElement;
    if (!root) return;
    var dark = colors && colors['--tm-dark-color'] ? String(colors['--tm-dark-color']) : String(bg || '#121212');
    var surface = colors && colors['--tm-shop-item-bg'] ? String(colors['--tm-shop-item-bg']) : dark;
    var text = colors && colors['--tm-primary-color'] ? String(colors['--tm-primary-color']) : '#e8e8e8';
    if (!isDarkColor(dark) && !isDarkColor(surface)) return;

    root.classList.add(BRIDGE);
    var css = ''
      + 'html.' + BRIDGE + ',html.' + BRIDGE + ' body{'
      + 'background:' + dark + '!important;background-color:' + dark + '!important;color:' + text + '!important;}'
      + 'html.' + BRIDGE + ' body,'
      + 'html.' + BRIDGE + ' .rnr-page,'
      + 'html.' + BRIDGE + ' .rnr-pagewrapper,'
      + 'html.' + BRIDGE + ' .rnr-middle,'
      + 'html.' + BRIDGE + ' .rnr-left,'
      + 'html.' + BRIDGE + ' .rnr-center,'
      + 'html.' + BRIDGE + ' .rnr-right,'
      + 'html.' + BRIDGE + ' .rnr-top,'
      + 'html.' + BRIDGE + ' #head-outter,'
      + 'html.' + BRIDGE + ' #footer-outter,'
      + 'html.' + BRIDGE + ' .rnr-s-grid,'
      + 'html.' + BRIDGE + ' .rnr-c-grid,'
      + 'html.' + BRIDGE + ' .rnr-s-1,'
      + 'html.' + BRIDGE + ' .rnr-s-2,'
      + 'html.' + BRIDGE + ' .rnr-s-3,'
      + 'html.' + BRIDGE + ' .rnr-c-1,'
      + 'html.' + BRIDGE + ' .rnr-c-2,'
      + 'html.' + BRIDGE + ' .rnr-c-3,'
      + 'html.' + BRIDGE + ' .rnr-s-fields,'
      + 'html.' + BRIDGE + ' .rnr-c-fields,'
      + 'html.' + BRIDGE + ' .rnr-wrapper,'
      + 'html.' + BRIDGE + ' .rnr-brickcontents,'
      + 'html.' + BRIDGE + ' .MyMANAGERWhite_label1,'
      + 'html.' + BRIDGE + ' .rnr-scrollgrid-inner,'
      + 'html.' + BRIDGE + ' .fieldGrid,'
      + 'html.' + BRIDGE + ' table,'
      + 'html.' + BRIDGE + ' tr,'
      + 'html.' + BRIDGE + ' td,'
      + 'html.' + BRIDGE + ' th{'
      + 'background-color:' + dark + '!important;background-image:none!important;color:' + text + '!important;}'
      + 'html.' + BRIDGE + ' .rnr-top,'
      + 'html.' + BRIDGE + ' #head-outter,'
      + 'html.' + BRIDGE + ' .rnr-s-menu,'
      + 'html.' + BRIDGE + ' .rnr-b-vmenu li > div{'
      + 'background-color:' + surface + '!important;}';

    var style = document.getElementById('tm-mms-fouc-bridge');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tm-mms-fouc-bridge';
      root.appendChild(style);
    }
    style.textContent = css;
  }

  function reveal() {
    try {
      var root = document.documentElement;
      if (!root) return;
      root.classList.add(READY);
      root.classList.add('tm-mms-menu-ready');
      root.removeAttribute('data-tm-mms-fouc');
      root.style.removeProperty('display');
      root.style.removeProperty('visibility');
      root.style.removeProperty('opacity');
      root.style.removeProperty('background');
    } catch (e) { /* ignore */ }
  }

  try {
    var path = location.pathname || '';
    if (path.indexOf('login.php') !== -1) {
      reveal();
      return;
    }
    if (new URLSearchParams(location.search).get('tm_quickview') === '1') {
      reveal();
      return;
    }
  } catch (eSkip) {
    /* continue hidden */
  }

  var root = document.documentElement;
  if (!root) return;

  try {
    root.classList.remove(READY);
    root.setAttribute('data-tm-mms-fouc', '1');
  } catch (e1) { /* ignore */ }

  var canRevealEarly = false;
  var themeColors = null;
  var themeBg = '#121212';

  try {
    var raw = localStorage.getItem(LS_THEME);
    if (raw) {
      var theme = JSON.parse(raw);
      if (theme && theme.themeId === 'default') {
        canRevealEarly = true;
      }
      themeBg = theme && theme.bg ? String(theme.bg) : themeBg;
      if (themeBg) {
        root.style.setProperty('background', themeBg, 'important');
        var bgStyle = document.createElement('style');
        bgStyle.id = 'tm-mms-fouc-ext-bg';
        bgStyle.textContent = 'html:not(.' + READY + '){background:' + themeBg + '!important;}';
        root.appendChild(bgStyle);
      }
      if (theme && theme.colors && typeof theme.colors === 'object') {
        themeColors = theme.colors;
        Object.keys(theme.colors).forEach(function (key) {
          root.style.setProperty(key, theme.colors[key]);
        });
        canRevealEarly = true;
      }
    }
  } catch (eTheme) { /* ignore */ }

  try {
    var pageCss = localStorage.getItem(LS_PAGE);
    if (pageCss) {
      var pageStyle = document.getElementById('tm-mms-fouc-page-css');
      if (!pageStyle) {
        pageStyle = document.createElement('style');
        pageStyle.id = 'tm-mms-fouc-page-css';
        root.appendChild(pageStyle);
      }
      pageStyle.textContent = pageCss;
      canRevealEarly = true;
    }
  } catch (ePage) { /* ignore */ }

  try {
    var menuCss = localStorage.getItem(LS_MENU);
    if (menuCss) {
      var menuStyle = document.getElementById('tm-mms-menu-early-guard');
      if (!menuStyle) {
        menuStyle = document.createElement('style');
        menuStyle.id = 'tm-mms-menu-early-guard';
        root.appendChild(menuStyle);
      }
      menuStyle.textContent = menuCss;
    }
  } catch (eMenu) { /* ignore */ }

  if (canRevealEarly && themeColors) {
    installBridge(themeColors, themeBg);
  }

  // ---- Footer shell only (#tm-footer-controls-container) ----
  var LS_FOOTER = 'tm_mms_footer_shell';
  var SHELL_ATTR = 'data-tm-footer-shell';
  var FOOTER_CACHE_VERSION = 7;

  function ensureFooterShellCss() {
    if (document.getElementById('tm-mms-footer-shell-css')) return;
    var style = document.createElement('style');
    style.id = 'tm-mms-footer-shell-css';
    style.textContent = ''
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"]{pointer-events:none;width:100%;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-left,'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-middle,'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}';
    (document.documentElement || document).appendChild(style);
  }

  function injectFooterShellCachedCss(cssText) {
    if (!cssText) return;
    var style = document.getElementById('tm-mms-footer-shell-css-cache');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tm-mms-footer-shell-css-cache';
      (document.documentElement || document).appendChild(style);
    }
    style.textContent = cssText;
  }

  function readFooterCache() {
    try {
      var raw = localStorage.getItem(LS_FOOTER);
      if (!raw) return null;
      var data = JSON.parse(raw);
      // Accept current v7 and previous v4 snapshots
      if (!data || typeof data.html !== 'string' || data.html.length < 80) return null;
      if (data.v !== FOOTER_CACHE_VERSION && data.v !== 4) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  try {
    var earlyFooter = readFooterCache();
    if (earlyFooter && earlyFooter.css) injectFooterShellCachedCss(earlyFooter.css);
    if (earlyFooter) {
      console.log('[FOUC] footer cache ready (~' + Math.round(earlyFooter.html.length / 1024) + 'KB)');
    } else {
      console.log('[FOUC] footer cache empty — open MyManager once with the suite, wait ~5s, reload');
    }
  } catch (eEarlyCss) { /* ignore */ }

  function mountFooterShell() {
    try {
      if (document.getElementById('tm-footer-controls-container')) return false;
      var data = readFooterCache();
      if (!data) return false;
      var cell = document.querySelector('#footer-outterwrap table td[width="60%"]')
        || document.querySelector('#footer-outterwrap table td:nth-child(2)');
      if (!cell) return false;
      ensureFooterShellCss();
      injectFooterShellCachedCss(data.css || '');
      while (cell.firstChild) cell.removeChild(cell.firstChild);
      cell.insertAdjacentHTML('beforeend', data.html);
      var mounted = cell.querySelector('#tm-footer-controls-container');
      if (!mounted) return false;
      mounted.setAttribute(SHELL_ATTR, '1');
      mounted.classList.add('tm-footer-shell');
      console.log('[FOUC] mounted footer shell');
      return true;
    } catch (eFoot) {
      return false;
    }
  }

  function watchFooterShell() {
    if (mountFooterShell()) return;
    try {
      var obs = new MutationObserver(function () {
        if (mountFooterShell()) obs.disconnect();
      });
      obs.observe(document.documentElement || document, { childList: true, subtree: true });
      setTimeout(function () { try { obs.disconnect(); } catch (e) { /* ignore */ } }, 12000);
    } catch (eObs) { /* ignore */ }
  }

  watchFooterShell();

  if (canRevealEarly) {
    reveal();
  }

  setTimeout(function () {
    try {
      if (!document.documentElement.classList.contains(READY)) {
        reveal();
      }
    } catch (eFail) { /* ignore */ }
  }, 8000);
})();
