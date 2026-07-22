/**
 * Runs at document_start with the CSS content script.
 * - Skips login / quickview (reveal immediately)
 * - On repeat visits: apply cached theme/CSS, then reveal
 * - Mounts cached #tm-footer-controls-container from chrome.storage (primary)
 *   or localStorage (fallback); suite replaces + hydrates vars
 */
(function tmMmsFoucExtension() {
  'use strict';

  var READY = 'tm-mms-theme-ready';
  var BRIDGE = 'tm-mms-fouc-bridging';
  var LS_THEME = 'tm_mms_fouc_theme';
  var LS_MENU = 'tm_mms_fouc_menu_css';
  var LS_PAGE = 'tm_mms_fouc_page_css';
  var LS_FOOTER = 'tm_mms_footer_shell';
  var SHELL_ATTR = 'data-tm-footer-shell';
  var FOOTER_CACHE_VERSION = 8;
  var MSG_TYPE = 'TM_MMS_FOOTER_CACHE';
  var EXT_STORE_KEY = 'tm_mms_footer_shell';

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

  // ---- Footer shell (chrome.storage primary — survives TM sandbox isolation) ----

  function ensureFooterShellCss() {
    if (document.getElementById('tm-mms-footer-shell-css')) return;
    var style = document.createElement('style');
    style.id = 'tm-mms-footer-shell-css';
    style.textContent = ''
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"]{pointer-events:none;width:100%;opacity:.92;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-row{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-left,'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-middle,'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}';
    (document.documentElement || document).appendChild(style);
  }

  function isValidFooterData(data) {
    if (!data || typeof data.html !== 'string' || data.html.length < 80) return false;
    if (data.v !== FOOTER_CACHE_VERSION && data.v !== 7 && data.v !== 4) return false;
    return true;
  }

  function readFooterFromLocalStorage() {
    try {
      var raw = localStorage.getItem(LS_FOOTER);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return isValidFooterData(data) ? data : null;
    } catch (e) {
      return null;
    }
  }

  function saveFooterToExtensionStore(data) {
    if (!isValidFooterData(data)) return;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        var packet = {};
        packet[EXT_STORE_KEY] = {
          v: data.v,
          updatedAt: data.updatedAt || Date.now(),
          html: data.html,
        };
        chrome.storage.local.set(packet, function () {
          console.log('[FOUC] footer saved to extension storage (~'
            + Math.round(data.html.length / 1024) + 'KB)');
        });
      }
    } catch (eSave) {
      console.warn('[FOUC] extension storage write failed', eSave);
    }
    // Mirror to page localStorage for suite-side fallback mounts.
    try {
      localStorage.setItem(LS_FOOTER, JSON.stringify({
        v: data.v,
        updatedAt: data.updatedAt || Date.now(),
        html: data.html,
        css: '',
      }));
    } catch (eLs) { /* quota */ }
  }

  // Receive snapshots from the Tampermonkey suite (sandbox-safe bridge).
  try {
    window.addEventListener('message', function (ev) {
      try {
        var d = ev && ev.data;
        if (!d || d.type !== MSG_TYPE) return;
        if (!isValidFooterData(d)) return;
        saveFooterToExtensionStore(d);
      } catch (eMsg) { /* ignore */ }
    }, true);
    document.documentElement.addEventListener('tm-mms-footer-cache', function (ev) {
      try {
        var d = ev && ev.detail;
        if (!d || d.type !== MSG_TYPE) return;
        if (!isValidFooterData(d)) return;
        saveFooterToExtensionStore(d);
      } catch (eEv) { /* ignore */ }
    }, true);
  } catch (eListen) { /* ignore */ }

  var cachedFooter = null;
  var footerMountAttempted = false;

  function mountFooterShell(data) {
    try {
      if (document.getElementById('tm-footer-controls-container')) return false;
      if (!isValidFooterData(data)) return false;
      var cell = document.querySelector('#footer-outterwrap table td[width="60%"]')
        || document.querySelector('#footer-outterwrap table td:nth-child(2)');
      if (!cell) return false;
      ensureFooterShellCss();
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

  function watchFooterShell(data) {
    cachedFooter = data || cachedFooter;
    if (mountFooterShell(cachedFooter)) return;
    try {
      var obs = new MutationObserver(function () {
        if (mountFooterShell(cachedFooter)) obs.disconnect();
      });
      obs.observe(document.documentElement || document, { childList: true, subtree: true });
      setTimeout(function () { try { obs.disconnect(); } catch (e) { /* ignore */ } }, 15000);
    } catch (eObs) { /* ignore */ }
  }

  function startFooterFromData(data, source) {
    if (footerMountAttempted) {
      if (data) cachedFooter = data;
      return;
    }
    footerMountAttempted = true;
    if (data) {
      console.log('[FOUC] footer cache ready from ' + source + ' (~'
        + Math.round(data.html.length / 1024) + 'KB)');
      watchFooterShell(data);
    } else {
      console.log('[FOUC] footer cache empty — wait for suite sync, then reload');
      watchFooterShell(null);
    }
  }

  // 1) Fast path: page localStorage (same origin as content script)
  var lsFooter = readFooterFromLocalStorage();
  if (lsFooter) {
    startFooterFromData(lsFooter, 'localStorage');
  }

  // 2) Reliable path: extension chrome.storage (written via postMessage from suite)
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([EXT_STORE_KEY], function (result) {
        var data = result && result[EXT_STORE_KEY];
        if (isValidFooterData(data)) {
          if (!footerMountAttempted) {
            startFooterFromData(data, 'chrome.storage');
          } else if (!document.getElementById('tm-footer-controls-container')) {
            watchFooterShell(data);
          }
        } else if (!footerMountAttempted) {
          startFooterFromData(null, 'chrome.storage');
        }
      });
    } else if (!footerMountAttempted) {
      startFooterFromData(null, 'no-storage-api');
    }
  } catch (eStore) {
    if (!footerMountAttempted) startFooterFromData(lsFooter, 'localStorage-fallback');
  }

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
