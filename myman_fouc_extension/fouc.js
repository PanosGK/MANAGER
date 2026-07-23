/**
 * MyManager FOUC Guard — content script (document_start)
 *
 * Caches ALL suite UI chrome as HTML shells; on next visit mounts shells early.
 * Suite then replaces each shell and hydrates live values (coins, XP, weather, etc.).
 *
 * Shells: footer controls, suite brand, header quick-search, right rail,
 *         mascot silhouette, scroll-to-top.
 */
(function tmMmsFoucExtension() {
  'use strict';

  var READY = 'tm-mms-theme-ready';
  var BRIDGE = 'tm-mms-fouc-bridging';
  var LS_THEME = 'tm_mms_fouc_theme';
  var LS_MENU = 'tm_mms_fouc_menu_css';
  var LS_PAGE = 'tm_mms_fouc_page_css';
  var SHELL_ATTR = 'data-tm-ui-shell';
  var FOOTER_SHELL_ATTR = 'data-tm-footer-shell'; // legacy
  var EXT_STORE_KEY = 'tm_mms_ui_shells';
  var EXT_CSS_KEY = 'tm_mms_suite_css';
  var MAX_CSS = 1500000;
  var LEGACY_FOOTER_KEY = 'tm_mms_footer_shell';
  var CACHE_VERSION = 12;
  var MAX_HTML = 180000;

  var SHELL_SPECS = [
    {
      id: 'tm-footer-controls-container',
      parent: 'footer-center',
      minLen: 80,
    },
    {
      id: 'tm-footer-suite-brand',
      parent: 'footer-right',
      minLen: 40,
    },
    {
      id: 'tm-header-quick-search-host',
      parent: 'header-filler',
      minLen: 40,
    },
    {
      id: 'tm-search-container',
      parent: 'body',
      minLen: 20,
    },
    {
      id: 'tm-mascot-container',
      parent: 'body',
      minLen: 20,
      silhouette: true,
    },
    {
      id: 'tm-scroll-to-top-btn',
      parent: 'body',
      minLen: 10,
    },
  ];

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

  // ---------- Multi-shell UI cache ----------

  var SKIP_STYLE_IDS = {
    'tm-mms-fouc-guard': 1,
    'tm-mms-fouc-bridge': 1,
    'tm-mms-fouc-ext-bg': 1,
    'tm-mms-fouc-page-css': 1,
    'tm-mms-menu-early-guard': 1,
    'tm-mms-ui-shell-css': 1,
    'tm-mms-suite-css-cache': 1,
    'tm-mms-footer-shell-css': 1,
    'tm-mms-footer-shell-css-cache': 1
  };

  function collectSuiteCss() {
    var parts = [];
    var seen = Object.create(null);
    var nodes = document.querySelectorAll('style');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.id || '';
      if (id && SKIP_STYLE_IDS[id]) continue;
      if (id.indexOf('tm-mms-fouc') === 0) continue;
      var text = el.textContent || '';
      if (!text || text.length < 20) continue;
      var isSuite = (id && id.indexOf('tm-') === 0)
        || text.indexOf('#tm-') !== -1
        || text.indexOf('.tm-') !== -1
        || text.indexOf('--tm-') !== -1
        || text.indexOf('tm-mms-') !== -1;
      if (!isSuite) continue;
      var key = id || ('anon:' + text.length + ':' + text.slice(0, 40));
      if (seen[key]) continue;
      seen[key] = 1;
      parts.push(text);
    }
    var css = parts.join('\n\n');
    if (css.length > MAX_CSS) css = css.slice(0, MAX_CSS);
    return css;
  }

  function injectSuiteCss(cssText) {
    if (!cssText) return;
    var style = document.getElementById('tm-mms-suite-css-cache');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tm-mms-suite-css-cache';
      (document.documentElement || document.head || document).appendChild(style);
    }
    style.textContent = cssText;
  }

  function saveSuiteCss(cssText, source) {
    if (!cssText || cssText.length < 40) return;
    var packet = { v: CACHE_VERSION, updatedAt: Date.now(), css: cssText };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        var store = {};
        store[EXT_CSS_KEY] = packet;
        chrome.storage.local.set(store, function () {
          console.log('[FOUC] cached suite CSS (~' + Math.round(cssText.length / 1024) + 'KB) from ' + source);
        });
      }
    } catch (e) { /* ignore */ }
    try {
      localStorage.setItem(EXT_CSS_KEY, JSON.stringify(packet));
    } catch (eLs) {
      try {
        // Quota: keep a smaller chrome-critical slice
        var slim = cssText.slice(0, 200000);
        localStorage.setItem(EXT_CSS_KEY, JSON.stringify({
          v: CACHE_VERSION,
          updatedAt: Date.now(),
          css: slim
        }));
      } catch (e2) { /* ignore */ }
    }
    // Also keep legacy page-css key warm for older loaders
    try {
      if (cssText.length < 900000) localStorage.setItem('tm_mms_fouc_page_css', cssText);
    } catch (ePage) { /* ignore */ }
  }


  // Early suite CSS inject (sync localStorage first)
  try {
    var earlyCssRaw = localStorage.getItem(EXT_CSS_KEY);
    if (earlyCssRaw) {
      var earlyCssPkt = JSON.parse(earlyCssRaw);
      if (earlyCssPkt && earlyCssPkt.css) {
        injectSuiteCss(earlyCssPkt.css);
        console.log('[FOUC] suite CSS applied early (~' + Math.round(earlyCssPkt.css.length / 1024) + 'KB)');
      }
    }
  } catch (eEarlyCss) { /* ignore */ }

  function ensureShellCss() {
    if (document.getElementById('tm-mms-ui-shell-css')) return;
    var style = document.createElement('style');
    style.id = 'tm-mms-ui-shell-css';
    style.textContent = ''
      + '[' + SHELL_ATTR + '="1"],[' + FOOTER_SHELL_ATTR + '="1"]{pointer-events:none!important;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"],'
      + '#tm-footer-controls-container[' + FOOTER_SHELL_ATTR + '="1"]{width:100%;opacity:.92;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-row,'
      + '#tm-footer-controls-container[' + FOOTER_SHELL_ATTR + '="1"] #tm-footer-controls-row{'
      + 'display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;}'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-left,'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-middle,'
      + '#tm-footer-controls-container[' + SHELL_ATTR + '="1"] #tm-footer-controls-right,'
      + '#tm-footer-controls-container[' + FOOTER_SHELL_ATTR + '="1"] #tm-footer-controls-left,'
      + '#tm-footer-controls-container[' + FOOTER_SHELL_ATTR + '="1"] #tm-footer-controls-middle,'
      + '#tm-footer-controls-container[' + FOOTER_SHELL_ATTR + '="1"] #tm-footer-controls-right{'
      + 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;}'
      + '#tm-mascot-container[' + SHELL_ATTR + '="1"]{'
      + 'position:fixed;z-index:99990;width:88px;height:88px;border-radius:18px;'
      + 'background:rgba(120,120,140,.18);backdrop-filter:blur(4px);'
      + 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);opacity:.85;}'
      + '#tm-search-container[' + SHELL_ATTR + '="1"]{opacity:.9;}'
      + '#tm-scroll-to-top-btn[' + SHELL_ATTR + '="1"]{opacity:.7;}'
      + '#tm-header-quick-search-host[' + SHELL_ATTR + '="1"]{opacity:.9;}';
    (document.documentElement || document).appendChild(style);
  }

  function findFooterCenter() {
    return document.querySelector('#footer-outterwrap table td[width="60%"]')
      || document.querySelector('#footer-outterwrap table td:nth-child(2)')
      || document.querySelector('#footer-outterwrap td');
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
      || document.querySelector('.rnr-hfiller')
      || document.querySelector('#head-outterwrap');
  }

  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    function esc(id) {
      try {
        if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(id);
      } catch (e) { /* ignore */ }
      return String(id).replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    }
    if (el.id) return '#' + esc(el.id);
    var parts = [];
    var node = el;
    var depth = 0;
    while (node && node.nodeType === 1 && depth < 12) {
      if (node.id) {
        parts.unshift('#' + esc(node.id));
        break;
      }
      var tag = (node.tagName || '').toLowerCase();
      var parent = node.parentElement;
      if (!parent) {
        parts.unshift(tag);
        break;
      }
      var same = parent.children;
      var idx = 1;
      var total = 0;
      for (var i = 0; i < same.length; i++) {
        if ((same[i].tagName || '').toLowerCase() === tag) {
          total++;
          if (same[i] === node) idx = total;
        }
      }
      parts.unshift(total > 1 ? (tag + ':nth-of-type(' + idx + ')') : tag);
      node = parent;
      depth++;
    }
    return parts.join(' > ');
  }

  function capturePlacement(el, fallbackKind) {
    var parent = el.parentElement;
    var next = el.nextElementSibling;
    var prev = el.previousElementSibling;
    var childIndex = -1;
    if (parent) {
      var kids = parent.children;
      for (var i = 0; i < kids.length; i++) {
        if (kids[i] === el) { childIndex = i; break; }
      }
    }
    return {
      kind: fallbackKind || 'body',
      parentId: parent && parent.id ? parent.id : '',
      parentPath: parent ? cssPath(parent) : 'body',
      childIndex: childIndex,
      beforeId: next && next.id ? next.id : '',
      afterId: prev && prev.id ? prev.id : '',
      // Exact live styles the suite applied (positioned widgets)
      inlineStyle: el.getAttribute('style') || '',
      replaceParentChildren: !!(fallbackKind === 'footer-center' || fallbackKind === 'footer-right'),
    };
  }

  function resolveExactParent(placement) {
    if (!placement) return null;
    if (placement.parentId) {
      var byId = document.getElementById(placement.parentId);
      if (byId) return byId;
    }
    if (placement.parentPath) {
      try {
        var byPath = document.querySelector(placement.parentPath);
        if (byPath) return byPath;
      } catch (e) { /* ignore */ }
    }
    return resolveParent(placement.kind || 'body');
  }

  function insertAtExactPlace(parent, html, placement) {
    if (!parent) return null;
    ensureShellCss();

    if (placement && placement.replaceParentChildren) {
      while (parent.firstChild) parent.removeChild(parent.firstChild);
      parent.insertAdjacentHTML('beforeend', html);
      return parent.lastElementChild;
    }

    // Prefer: before the same next sibling the live node had
    if (placement && placement.beforeId) {
      var beforeEl = document.getElementById(placement.beforeId);
      if (beforeEl && beforeEl.parentElement === parent) {
        beforeEl.insertAdjacentHTML('beforebegin', html);
        return beforeEl.previousElementSibling;
      }
    }

    // Or after the previous sibling
    if (placement && placement.afterId) {
      var afterEl = document.getElementById(placement.afterId);
      if (afterEl && afterEl.parentElement === parent) {
        afterEl.insertAdjacentHTML('afterend', html);
        return afterEl.nextElementSibling;
      }
    }

    // Or at the same child index
    if (placement && typeof placement.childIndex === 'number' && placement.childIndex >= 0) {
      var ref = parent.children[placement.childIndex];
      if (ref) {
        ref.insertAdjacentHTML('beforebegin', html);
        return ref.previousElementSibling;
      }
    }

    parent.insertAdjacentHTML('beforeend', html);
    return parent.lastElementChild;
  }

  function resolveParent(kind) {
    if (kind === 'footer-center') return findFooterCenter();
    if (kind === 'footer-right') return findFooterRight();
    if (kind === 'header-filler') return findHeaderFiller();
    if (kind === 'body') return document.body || document.documentElement;
    return null;
  }

  function isShellEl(el) {
    return !!(el && (el.getAttribute(SHELL_ATTR) === '1' || el.getAttribute(FOOTER_SHELL_ATTR) === '1'));
  }

  function slimCloneHtml(el, spec) {
    try {
      if (spec.silhouette) {
        var style = el.getAttribute('style') || '';
        if (!style) {
          var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
          var left = (el.style && el.style.left) || (rect ? Math.round(rect.left) + 'px' : '24px');
          var top = (el.style && el.style.top) || (rect ? Math.round(rect.top) + 'px' : '120px');
          var w = (rect && rect.width > 40) ? Math.round(rect.width) : 88;
          var h = (rect && rect.height > 40) ? Math.round(rect.height) : 88;
          style = 'position:fixed;left:' + left + ';top:' + top + ';width:' + w + 'px;height:' + h + 'px;';
        }
        return '<div id="tm-mascot-container" class="tm-footer-shell tm-ui-shell-mascot" style="'
          + style.replace(/"/g, '&quot;') + '"></div>';
      }

      var clone = el.cloneNode(true);
      clone.removeAttribute(SHELL_ATTR);
      clone.removeAttribute(FOOTER_SHELL_ATTR);
      clone.classList.add('tm-ui-shell');

      var menu = clone.querySelector('#tm-recent-repairs-menu');
      if (menu) {
        menu.style.display = 'none';
        menu.innerHTML = '';
      }
      var kill = clone.querySelectorAll(
        '#tm-notification-panel,#tm-notification-backdrop,.tm-modal-overlay,#tm-coin-history-tooltip,#tm-mascot-interaction-panel'
      );
      for (var i = 0; i < kill.length; i++) kill[i].remove();

      // Strip heavy SVGs — keep layout with placeholders
      var svgs = clone.querySelectorAll('svg');
      for (var s = 0; s < svgs.length; s++) {
        var mark = document.createElement('span');
        mark.className = 'tm-ui-shell-icon';
        mark.setAttribute('aria-hidden', 'true');
        svgs[s].replaceWith(mark);
      }

      var html = clone.outerHTML;
      if (!html || html.length < (spec.minLen || 20) || html.length > MAX_HTML) return null;
      return html;
    } catch (e) {
      return null;
    }
  }

  function normalizeCache(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if ((raw.v === CACHE_VERSION || raw.v === 11 || raw.v === 10 || raw.v === 9)
      && raw.shells && typeof raw.shells === 'object') {
      return raw;
    }
    if (raw.html && typeof raw.html === 'string' && raw.html.length >= 80) {
      return {
        v: CACHE_VERSION,
        updatedAt: raw.updatedAt || Date.now(),
        css: raw.css || '',
        shells: {
          'tm-footer-controls-container': {
            id: 'tm-footer-controls-container',
            parent: 'footer-center',
            placement: {
              kind: 'footer-center',
              parentPath: '#footer-outterwrap table td[width="60%"]',
              replaceParentChildren: true,
            },
            html: raw.html,
          },
        },
      };
    }
    return null;
  }

  function saveCache(cache, source) {
    if (!cache || !cache.shells) return;
    cache.v = CACHE_VERSION;
    cache.updatedAt = Date.now();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        var packet = {};
        packet[EXT_STORE_KEY] = cache;
        chrome.storage.local.set(packet, function () {
          var n = Object.keys(cache.shells).length;
          console.log('[FOUC] cached ' + n + ' UI shell(s)' + (cache.css ? (' + CSS ~' + Math.round(cache.css.length / 1024) + 'KB') : '') + ' from ' + source);
        });
      }
    } catch (eSave) {
      console.warn('[FOUC] cache write failed', eSave);
    }
    try {
      localStorage.setItem(EXT_STORE_KEY, JSON.stringify(cache));
    } catch (eLs) { /* ignore */ }
  }

  function mountOne(entry) {
    try {
      if (!entry || !entry.html || !entry.id) return false;
      if (document.getElementById(entry.id)) return false;

      var placement = entry.placement || { kind: entry.parent || 'body' };
      var parent = resolveExactParent(placement);
      if (!parent) return false;

      var mountedHint = insertAtExactPlace(parent, entry.html, placement);
      var mounted = document.getElementById(entry.id) || mountedHint;
      if (!mounted) return false;

      // Restore exact inline styles from when the suite painted the live node
      if (placement.inlineStyle) {
        try { mounted.setAttribute('style', placement.inlineStyle); } catch (eSt) { /* ignore */ }
      }

      mounted.setAttribute(SHELL_ATTR, '1');
      if (entry.id === 'tm-footer-controls-container') {
        mounted.setAttribute(FOOTER_SHELL_ATTR, '1');
      }
      mounted.classList.add('tm-ui-shell');
      return true;
    } catch (e) {
      return false;
    }
  }

  var pendingCache = null;
  var mountObs = null;

  function tryMountAll(cache) {
    if (!cache || !cache.shells) return 0;
    pendingCache = cache;
    ensureShellCss();
    var mounted = 0;
    SHELL_SPECS.forEach(function (spec) {
      var entry = cache.shells[spec.id];
      if (entry && mountOne(entry)) mounted++;
    });
    return mounted;
  }

  function watchMount(cache) {
    pendingCache = cache;
    var n = tryMountAll(cache);
    if (n > 0) {
      console.log('[FOUC] mounted ' + n + ' UI shell(s)');
    }
    if (mountObs) return;
    try {
      mountObs = new MutationObserver(function () {
        var more = tryMountAll(pendingCache);
        if (more > 0) console.log('[FOUC] mounted +' + more + ' UI shell(s)');
        // Stop when body+footer exist and we've tried everything we have
        if (document.body && findFooterCenter()) {
          // keep observing briefly for late header filler
        }
      });
      mountObs.observe(document.documentElement || document, { childList: true, subtree: true });
      setTimeout(function () {
        if (mountObs) {
          try { mountObs.disconnect(); } catch (e) { /* ignore */ }
          mountObs = null;
        }
      }, 20000);
    } catch (eObs) { /* ignore */ }
  }

  // Load cache
  try {
    var lsRaw = localStorage.getItem(EXT_STORE_KEY) || localStorage.getItem(LEGACY_FOOTER_KEY);
    if (lsRaw) {
      var lsData = normalizeCache(JSON.parse(lsRaw));
      if (lsData) {
        if (lsData.css) injectSuiteCss(lsData.css);
        console.log('[FOUC] UI shell cache hit (localStorage)');
        watchMount(lsData);
      }
    }
  } catch (eLsRead) { /* ignore */ }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([EXT_STORE_KEY, LEGACY_FOOTER_KEY, EXT_CSS_KEY], function (result) {
        var data = normalizeCache(result && result[EXT_STORE_KEY])
          || normalizeCache(result && result[LEGACY_FOOTER_KEY]);
        if (result && result[EXT_CSS_KEY] && result[EXT_CSS_KEY].css) {
          injectSuiteCss(result[EXT_CSS_KEY].css);
          console.log('[FOUC] suite CSS from chrome.storage (~' + Math.round(result[EXT_CSS_KEY].css.length / 1024) + 'KB)');
        }
        if (data) {
          if (data.css) injectSuiteCss(data.css);
          console.log('[FOUC] UI shell cache hit (chrome.storage)');
          watchMount(data);
        } else if (!pendingCache) {
          console.log('[FOUC] no UI shell cache yet — will snapshot after suite paints');
        }
      });
    } else {
      console.warn('[FOUC] chrome.storage unavailable — reload extension');
    }
  } catch (eStore) {
    console.warn('[FOUC] storage read failed', eStore);
  }

  // Snapshot live suite UI (not shells)
  var lastHashes = {};
  var snapTimer = 0;
  var memoryCache = pendingCache || { v: CACHE_VERSION, shells: {}, updatedAt: 0 };

  function snapshotLiveShells(source) {
    var changed = false;
    SHELL_SPECS.forEach(function (spec) {
      var el = document.getElementById(spec.id);
      if (!el) return;
      if (isShellEl(el)) return;
      var html = slimCloneHtml(el, spec);
      if (!html) return;
      var placement = capturePlacement(el, spec.parent);
      var hash = html + '|' + (placement.parentPath || '') + '|' + placement.childIndex + '|' + (placement.inlineStyle || '');
      if (lastHashes[spec.id] === hash) return;
      lastHashes[spec.id] = hash;
      memoryCache.shells[spec.id] = {
        id: spec.id,
        parent: spec.parent,
        placement: placement,
        html: html,
      };
      changed = true;
    });
    var css = collectSuiteCss();
    if (css && css !== lastHashes.__css) {
      lastHashes.__css = css;
      memoryCache.css = css;
      saveSuiteCss(css, source || 'live-dom');
      changed = true;
    }
    if (changed) {
      saveCache(memoryCache, source || 'live-dom');
    }
  }

  function scheduleSnapshot() {
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      snapTimer = 0;
      snapshotLiveShells('live-dom');
    }, 600);
  }

  function startLiveWatcher() {
    try {
      var obs = new MutationObserver(function () {
        scheduleSnapshot();
      });
      obs.observe(document.documentElement || document, { childList: true, subtree: true });
      setTimeout(function () { snapshotLiveShells('t+3s'); }, 3000);
      setTimeout(function () { snapshotLiveShells('t+6s'); }, 6000);
      setTimeout(function () { snapshotLiveShells('t+12s'); }, 12000);
    } catch (eWatch) { /* ignore */ }
  }

  // Accept suite postMessage / DOM transfer (optional bridge)
  try {
    window.addEventListener('message', function (ev) {
      try {
        var d = ev && ev.data;
        if (!d || d.type !== 'TM_MMS_UI_SHELLS') return;
        var normalized = normalizeCache(d.cache || d);
        if (!normalized) return;
        memoryCache = normalized;
        Object.keys(normalized.shells || {}).forEach(function (id) {
          lastHashes[id] = normalized.shells[id].html;
        });
        if (normalized.css) {
          lastHashes.__css = normalized.css;
          saveSuiteCss(normalized.css, 'suite-msg');
          injectSuiteCss(normalized.css);
        }
        saveCache(normalized, 'suite-msg');
      } catch (eMsg) { /* ignore */ }
    }, true);
  } catch (eListen) { /* ignore */ }

  startLiveWatcher();

  if (canRevealEarly) reveal();

  setTimeout(function () {
    try {
      if (!document.documentElement.classList.contains(READY)) reveal();
    } catch (eFail) { /* ignore */ }
  }, 8000);

  console.log('[FOUC] guard v1.10.1 ready (' + location.hostname + ') — exact-placement UI shells');
})();
