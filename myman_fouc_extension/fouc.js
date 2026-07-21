/**
 * Runs at document_start with the CSS content script.
 * - Skips login / quickview (reveal immediately)
 * - On repeat visits: apply cached theme/CSS, cover native white panels with a
 *   dark "bridge" layer, then reveal so users do not see white flashes
 * - Mounts cached UI chrome shells (footer, mascot, rail, header QS, brand)
 *   so only live variables hydrate when the Tampermonkey suite loads
 */
(function tmMmsFoucExtension() {
  'use strict';

  var READY = 'tm-mms-theme-ready';
  var BRIDGE = 'tm-mms-fouc-bridging';
  var LS_THEME = 'tm_mms_fouc_theme';
  var LS_MENU = 'tm_mms_fouc_menu_css';
  var LS_PAGE = 'tm_mms_fouc_page_css';
  var LS_INDEX = 'tm_mms_ui_shells';
  var LS_PREFIX = 'tm_mms_ui_shell__';
  var LS_FOOTER_LEGACY = 'tm_mms_footer_shell';
  var SHELL_ATTR = 'data-tm-ui-shell';
  var FOOTER_SHELL_ATTR = 'data-tm-footer-shell';
  var UI_CACHE_VERSION = 6;

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

  // ---- Cached UI chrome shells ----
  function readShellHtml(name) {
    try {
      var raw = localStorage.getItem(LS_PREFIX + name);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || (data.v !== UI_CACHE_VERSION && data.v !== 5) || typeof data.html !== 'string') return null;
      if (data.html.length < 40) return null;
      return data.html;
    } catch (e) {
      return null;
    }
  }

  function readUiCache() {
    var shells = {};
    var keys = ['footer', 'mascot', 'search', 'headerQs', 'suiteBrand'];
    var any = false;
    keys.forEach(function (key) {
      var html = readShellHtml(key);
      if (html) {
        shells[key] = { html: html };
        any = true;
      }
    });

    var css = '';
    try {
      var idxRaw = localStorage.getItem(LS_INDEX);
      if (idxRaw) {
        var idx = JSON.parse(idxRaw);
        if (idx && idx.css) css = String(idx.css);
        // v5 monolithic fallback
        if (!any && idx && idx.v === 5 && idx.shells) {
          return idx;
        }
      }
    } catch (eIdx) { /* ignore */ }

    if (any) {
      return { v: UI_CACHE_VERSION, css: css, shells: shells };
    }

    try {
      var legacy = localStorage.getItem(LS_FOOTER_LEGACY);
      if (!legacy) return null;
      var old = JSON.parse(legacy);
      if (!old || old.v !== 4 || typeof old.html !== 'string' || old.html.length < 80) return null;
      return {
        v: UI_CACHE_VERSION,
        css: old.css || '',
        shells: { footer: { html: old.html } },
      };
    } catch (eLeg) {
      return null;
    }
  }

  function ensureUiShellCss() {
    if (document.getElementById('tm-mms-ui-shell-css')) return;
    var style = document.createElement('style');
    style.id = 'tm-mms-ui-shell-css';
    style.textContent = ''
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"],'
      + '#tm-footer-controls-container[' + FOOTER_SHELL_ATTR + '="1"]{pointer-events:none;width:100%;}'
      + '[' + SHELL_ATTR + '="1"]{pointer-events:none!important;}';
    (document.documentElement || document).appendChild(style);
  }

  function injectUiShellCachedCss(cssText) {
    if (!cssText) return;
    var style = document.getElementById('tm-mms-ui-shell-css-cache');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tm-mms-ui-shell-css-cache';
      (document.documentElement || document).appendChild(style);
    }
    style.textContent = cssText;
  }

  function markShell(el, isFooter) {
    if (!el) return;
    el.setAttribute(SHELL_ATTR, '1');
    if (isFooter) {
      el.setAttribute(FOOTER_SHELL_ATTR, '1');
      el.classList.add('tm-footer-shell');
    }
    try { el.style.pointerEvents = 'none'; } catch (e) { /* ignore */ }
  }

  function findFooterCenter() {
    return document.querySelector('#footer-outterwrap table td[width="60%"]')
      || document.querySelector('#footer-outterwrap table td:nth-child(2)');
  }

  function findFooterRight() {
    var table = document.querySelector('#footer-outterwrap table');
    if (!table) return null;
    var cell = table.querySelector('td[width="40%"]');
    if (!cell) {
      var cells = table.querySelectorAll('td');
      if (cells.length) cell = cells[cells.length - 1];
    }
    return cell;
  }

  function findHeaderFiller() {
    return document.querySelector('#head-outterwrap .rnr-hfiller')
      || document.querySelector('#head-outter .rnr-hfiller')
      || document.querySelector('.rnr-top .rnr-hfiller')
      || document.querySelector('.rnr-hfiller');
  }

  var shellMounts = {
    footer: {
      id: 'tm-footer-controls-container',
      parent: findFooterCenter,
      mount: function (html, parent) {
        while (parent.firstChild) parent.removeChild(parent.firstChild);
        parent.insertAdjacentHTML('beforeend', html);
        var mounted = parent.querySelector('#tm-footer-controls-container');
        if (!mounted) return false;
        markShell(mounted, true);
        return true;
      },
    },
    mascot: {
      id: 'tm-mascot-container',
      parent: function () { return document.body || null; },
      mount: function (html, parent) {
        parent.insertAdjacentHTML('beforeend', html);
        var mounted = document.getElementById('tm-mascot-container');
        if (!mounted) return false;
        markShell(mounted, false);
        return true;
      },
    },
    search: {
      id: 'tm-search-container',
      parent: function () { return document.body || null; },
      mount: function (html, parent) {
        parent.insertAdjacentHTML('beforeend', html);
        var mounted = document.getElementById('tm-search-container');
        if (!mounted) return false;
        markShell(mounted, false);
        return true;
      },
    },
    headerQs: {
      id: 'tm-header-quick-search-host',
      parent: findHeaderFiller,
      mount: function (html, parent) {
        parent.insertAdjacentHTML('afterbegin', html);
        var mounted = document.getElementById('tm-header-quick-search-host');
        if (!mounted) return false;
        markShell(mounted, false);
        return true;
      },
    },
    suiteBrand: {
      id: 'tm-footer-suite-brand',
      parent: findFooterRight,
      mount: function (html, parent) {
        parent.innerHTML = '';
        parent.insertAdjacentHTML('beforeend', html);
        var mounted = document.getElementById('tm-footer-suite-brand');
        if (!mounted) return false;
        markShell(mounted, false);
        return true;
      },
    },
  };

  function mountShell(key, cache) {
    try {
      var def = shellMounts[key];
      var entry = cache && cache.shells && cache.shells[key];
      if (!def || !entry || typeof entry.html !== 'string' || entry.html.length < 40) return false;
      if (document.getElementById(def.id)) return false;
      var parent = def.parent();
      if (!parent) return false;
      ensureUiShellCss();
      injectUiShellCachedCss(cache.css || '');
      return !!def.mount(entry.html, parent);
    } catch (eMount) {
      return false;
    }
  }

  function mountAllShells() {
    var cache = readUiCache();
    if (!cache) return false;
    var any = false;
    Object.keys(shellMounts).forEach(function (key) {
      if (mountShell(key, cache)) any = true;
    });
    return any;
  }

  try {
    var earlyCache = readUiCache();
    if (earlyCache && earlyCache.css) injectUiShellCachedCss(earlyCache.css);
  } catch (eEarlyCss) { /* ignore */ }

  function watchUiShells() {
    mountAllShells();
    try {
      var pending = {};
      Object.keys(shellMounts).forEach(function (k) { pending[k] = true; });
      var obs = new MutationObserver(function () {
        var cache = readUiCache();
        if (!cache) return;
        Object.keys(pending).forEach(function (key) {
          if (document.getElementById(shellMounts[key].id)) {
            delete pending[key];
            return;
          }
          if (mountShell(key, cache)) delete pending[key];
        });
        if (!Object.keys(pending).length) obs.disconnect();
      });
      obs.observe(document.documentElement || document, { childList: true, subtree: true });
      setTimeout(function () { try { obs.disconnect(); } catch (e) { /* ignore */ } }, 20000);
    } catch (eObs) { /* ignore */ }
  }

  watchUiShells();

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
