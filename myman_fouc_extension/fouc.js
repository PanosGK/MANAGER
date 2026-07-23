/**
 * MyManager FOUC Guard — content script (document_start)
 *
 * Self-contained footer cache:
 * 1) On load: mount last snapshot from chrome.storage (no Tampermonkey bridge needed)
 * 2) After suite builds the live footer: snapshot it into chrome.storage
 */
(function tmMmsFoucExtension() {
  'use strict';

  var READY = 'tm-mms-theme-ready';
  var BRIDGE = 'tm-mms-fouc-bridging';
  var LS_THEME = 'tm_mms_fouc_theme';
  var LS_MENU = 'tm_mms_fouc_menu_css';
  var LS_PAGE = 'tm_mms_fouc_page_css';
  var SHELL_ATTR = 'data-tm-footer-shell';
  var EXT_STORE_KEY = 'tm_mms_footer_shell';
  var CACHE_VERSION = 9;
  var XFER_ID = 'tm-mms-footer-xfer';

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
  } catch (eSkip) { /* continue */ }

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
      if (theme && theme.themeId === 'default') canRevealEarly = true;
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

  // ---------- Footer shell: self-cache in chrome.storage ----------

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

  function findFooterCell() {
    return document.querySelector('#footer-outterwrap table td[width="60%"]')
      || document.querySelector('#footer-outterwrap table td:nth-child(2)')
      || document.querySelector('#footer-outterwrap td');
  }

  function isValidFooterData(data) {
    return !!(data && typeof data.html === 'string' && data.html.length >= 80
      && (data.v === CACHE_VERSION || data.v === 8 || data.v === 7 || data.v === 4));
  }

  function slimFooterHtml(container) {
    try {
      var clone = container.cloneNode(true);
      clone.removeAttribute(SHELL_ATTR);
      clone.classList.add('tm-footer-shell');
      var menu = clone.querySelector('#tm-recent-repairs-menu');
      if (menu) {
        menu.style.display = 'none';
        menu.innerHTML = '';
      }
      var kill = clone.querySelectorAll(
        '#tm-notification-panel, #tm-notification-backdrop, .tm-modal-overlay, #tm-coin-history-tooltip'
      );
      for (var i = 0; i < kill.length; i++) kill[i].remove();
      var svgs = clone.querySelectorAll('svg');
      for (var s = 0; s < svgs.length; s++) {
        var mark = document.createElement('span');
        mark.className = 'tm-footer-shell-icon';
        svgs[s].replaceWith(mark);
      }
      var html = clone.outerHTML;
      if (html.length < 80 || html.length > 250000) return null;
      return html;
    } catch (e) {
      return null;
    }
  }

  function saveFooterSnapshot(html, source) {
    if (!html || html.length < 80) return;
    var data = { v: CACHE_VERSION, updatedAt: Date.now(), html: html };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        var packet = {};
        packet[EXT_STORE_KEY] = data;
        chrome.storage.local.set(packet, function () {
          console.log('[FOUC] cached footer (~' + Math.round(html.length / 1024)
            + 'KB) from ' + source);
        });
      }
    } catch (eSave) {
      console.warn('[FOUC] cache write failed', eSave);
    }
    try {
      localStorage.setItem('tm_mms_footer_shell', JSON.stringify(data));
    } catch (eLs) { /* ignore */ }
  }

  function mountFooterShell(data) {
    try {
      if (document.getElementById('tm-footer-controls-container')) return false;
      if (!isValidFooterData(data)) return false;
      var cell = findFooterCell();
      if (!cell) return false;
      ensureFooterShellCss();
      while (cell.firstChild) cell.removeChild(cell.firstChild);
      cell.insertAdjacentHTML('beforeend', data.html);
      var mounted = cell.querySelector('#tm-footer-controls-container');
      if (!mounted) return false;
      mounted.setAttribute(SHELL_ATTR, '1');
      mounted.classList.add('tm-footer-shell');
      console.log('[FOUC] mounted cached footer');
      return true;
    } catch (eFoot) {
      return false;
    }
  }

  var pendingMount = null;
  var mountObs = null;

  function watchMount(data) {
    pendingMount = data;
    if (mountFooterShell(pendingMount)) return;
    if (mountObs) return;
    try {
      mountObs = new MutationObserver(function () {
        if (mountFooterShell(pendingMount)) {
          try { mountObs.disconnect(); } catch (e) { /* ignore */ }
          mountObs = null;
        }
      });
      mountObs.observe(document.documentElement || document, { childList: true, subtree: true });
      setTimeout(function () {
        if (mountObs) {
          try { mountObs.disconnect(); } catch (e2) { /* ignore */ }
          mountObs = null;
        }
      }, 20000);
    } catch (eObs) { /* ignore */ }
  }

  // Load cache ASAP (async chrome.storage + sync localStorage fallback)
  try {
    var lsRaw = localStorage.getItem('tm_mms_footer_shell');
    if (lsRaw) {
      var lsData = JSON.parse(lsRaw);
      if (isValidFooterData(lsData)) {
        console.log('[FOUC] footer cache hit (localStorage)');
        watchMount(lsData);
      }
    }
  } catch (eLsRead) { /* ignore */ }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([EXT_STORE_KEY], function (result) {
        var data = result && result[EXT_STORE_KEY];
        if (isValidFooterData(data)) {
          console.log('[FOUC] footer cache hit (chrome.storage)');
          watchMount(data);
        } else if (!pendingMount) {
          console.log('[FOUC] no footer cache yet — will snapshot after suite paints');
        }
      });
    } else {
      console.warn('[FOUC] chrome.storage unavailable — reload extension v1.8+');
    }
  } catch (eStore) {
    console.warn('[FOUC] storage read failed', eStore);
  }

  // Snapshot the LIVE footer once the suite builds it (no TM bridge required).
  var lastSnapHash = '';
  var snapTimer = 0;

  function trySnapshotLiveFooter() {
    var el = document.getElementById('tm-footer-controls-container');
    if (!el) return;
    if (el.getAttribute(SHELL_ATTR) === '1') return; // still the placeholder
    // Need some real widgets, not an empty shell.
    if (!el.querySelector('#tm-footer-controls-row')) return;
    var html = slimFooterHtml(el);
    if (!html) return;
    if (html === lastSnapHash) return;
    lastSnapHash = html;
    saveFooterSnapshot(html, 'live-dom');
  }

  function scheduleSnapshot() {
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      snapTimer = 0;
      trySnapshotLiveFooter();
    }, 500);
  }

  function startLiveFooterWatcher() {
    try {
      var obs = new MutationObserver(function () {
        scheduleSnapshot();
        // Also accept suite DOM transfer node if present.
        var xfer = document.getElementById(XFER_ID);
        if (xfer && xfer.textContent) {
          try {
            var parsed = JSON.parse(xfer.textContent);
            if (isValidFooterData(parsed)) {
              saveFooterSnapshot(parsed.html, 'dom-xfer');
              xfer.remove();
            }
          } catch (eX) { /* ignore */ }
        }
      });
      obs.observe(document.documentElement || document, { childList: true, subtree: true });
      // Timed backups after suite typically finishes.
      setTimeout(trySnapshotLiveFooter, 3000);
      setTimeout(trySnapshotLiveFooter, 6000);
      setTimeout(trySnapshotLiveFooter, 12000);
    } catch (eWatch) { /* ignore */ }
  }

  startLiveFooterWatcher();

  if (canRevealEarly) reveal();

  setTimeout(function () {
    try {
      if (!document.documentElement.classList.contains(READY)) reveal();
    } catch (eFail) { /* ignore */ }
  }, 8000);

  console.log('[FOUC] guard v1.8.1 ready (' + location.hostname + ')');
})();
