/**
 * Patch FOUC + suite shell module to cache all suite CSS with UI shells.
 * Run: node scripts/patch-fouc-css-cache.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const CSS_COLLECT_FN = `
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
    var css = parts.join('\\n\\n');
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
`;

// --- Patch fouc.js ---
let fouc = fs.readFileSync(path.join(root, 'myman_fouc_extension/fouc.js'), 'utf8');

if (!fouc.includes('EXT_CSS_KEY')) {
  fouc = fouc.replace(
    "var EXT_STORE_KEY = 'tm_mms_ui_shells';",
    "var EXT_STORE_KEY = 'tm_mms_ui_shells';\n  var EXT_CSS_KEY = 'tm_mms_suite_css';\n  var MAX_CSS = 1500000;"
  );
}
fouc = fouc.replace(/var CACHE_VERSION = \d+;/, 'var CACHE_VERSION = 11;');
fouc = fouc.replace(/\[FOUC\] guard v[\d.]+ ready/, '[FOUC] guard v1.10.0 ready');

if (!fouc.includes('function collectSuiteCss')) {
  fouc = fouc.replace(
    '// ---------- Multi-shell UI cache ----------',
    '// ---------- Multi-shell UI cache ----------\n' + CSS_COLLECT_FN
  );
}

// Inject CSS early — AFTER collect/inject helpers are defined
if (!fouc.includes('Early suite CSS inject')) {
  fouc = fouc.replace(
    'function saveSuiteCss(cssText, source) {',
    `function saveSuiteCss(cssText, source) {`
  );
  // Place early load right after saveSuiteCss function ends — find ensureShellCss and prepend
  fouc = fouc.replace(
    '  function ensureShellCss() {',
    `  // Early suite CSS inject (sync localStorage first)
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

  function ensureShellCss() {`
  );
}

// Remove wrongly-placed early inject near bridge if present
fouc = fouc.replace(
  /\n  \/\/ Early suite CSS inject \(sync localStorage first\)\n  try \{\n    var earlyCssRaw = localStorage\.getItem\(EXT_CSS_KEY\);[\s\S]*?\} catch \(eEarlyCss\) \{ \/\* ignore \*\/ \}\n\n  \/\/ ---------- Multi-shell UI cache ----------/,
  '\n\n  // ---------- Multi-shell UI cache ----------'
);

// Update normalizeCache to accept v10/v11 and keep css
fouc = fouc.replace(
  /function normalizeCache\(raw\) \{[\s\S]*?return null;\n  \}/,
  `function normalizeCache(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if ((raw.v === CACHE_VERSION || raw.v === 10 || raw.v === 9) && raw.shells && typeof raw.shells === 'object') {
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
            html: raw.html,
          },
        },
      };
    }
    return null;
  }`
);

// Update saveCache logging
fouc = fouc.replace(
  "console.log('[FOUC] cached ' + n + ' UI shell(s) from ' + source);",
  "console.log('[FOUC] cached ' + n + ' UI shell(s)' + (cache.css ? (' + CSS ~' + Math.round(cache.css.length / 1024) + 'KB') : '') + ' from ' + source);"
);

// When loading chrome.storage, also load CSS key and inject
if (!fouc.includes("chrome.storage.local.get([EXT_STORE_KEY, LEGACY_FOOTER_KEY, EXT_CSS_KEY]")) {
  fouc = fouc.replace(
    'chrome.storage.local.get([EXT_STORE_KEY, LEGACY_FOOTER_KEY], function (result) {',
    'chrome.storage.local.get([EXT_STORE_KEY, LEGACY_FOOTER_KEY, EXT_CSS_KEY], function (result) {'
  );
  fouc = fouc.replace(
    `if (data) {
          console.log('[FOUC] UI shell cache hit (chrome.storage)');
          watchMount(data);
        } else if (!pendingCache) {
          console.log('[FOUC] no UI shell cache yet — will snapshot after suite paints');
        }`,
    `if (result && result[EXT_CSS_KEY] && result[EXT_CSS_KEY].css) {
          injectSuiteCss(result[EXT_CSS_KEY].css);
          console.log('[FOUC] suite CSS from chrome.storage (~' + Math.round(result[EXT_CSS_KEY].css.length / 1024) + 'KB)');
        }
        if (data) {
          if (data.css) injectSuiteCss(data.css);
          console.log('[FOUC] UI shell cache hit (chrome.storage)');
          watchMount(data);
        } else if (!pendingCache) {
          console.log('[FOUC] no UI shell cache yet — will snapshot after suite paints');
        }`
  );
}

// Update snapshotLiveShells to also collect CSS
fouc = fouc.replace(
  `function snapshotLiveShells(source) {
    var changed = false;
    SHELL_SPECS.forEach(function (spec) {
      var el = document.getElementById(spec.id);
      if (!el) return;
      if (isShellEl(el)) return;
      var html = slimCloneHtml(el, spec);
      if (!html) return;
      if (lastHashes[spec.id] === html) return;
      lastHashes[spec.id] = html;
      memoryCache.shells[spec.id] = {
        id: spec.id,
        parent: spec.parent,
        html: html,
      };
      changed = true;
    });
    if (changed) {
      saveCache(memoryCache, source || 'live-dom');
    }
  }`,
  `function snapshotLiveShells(source) {
    var changed = false;
    SHELL_SPECS.forEach(function (spec) {
      var el = document.getElementById(spec.id);
      if (!el) return;
      if (isShellEl(el)) return;
      var html = slimCloneHtml(el, spec);
      if (!html) return;
      if (lastHashes[spec.id] === html) return;
      lastHashes[spec.id] = html;
      memoryCache.shells[spec.id] = {
        id: spec.id,
        parent: spec.parent,
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
  }`
);

// On suite message, also apply css
fouc = fouc.replace(
  `memoryCache = normalized;
        Object.keys(normalized.shells || {}).forEach(function (id) {
          lastHashes[id] = normalized.shells[id].html;
        });
        saveCache(normalized, 'suite-msg');`,
  `memoryCache = normalized;
        Object.keys(normalized.shells || {}).forEach(function (id) {
          lastHashes[id] = normalized.shells[id].html;
        });
        if (normalized.css) {
          lastHashes.__css = normalized.css;
          saveSuiteCss(normalized.css, 'suite-msg');
          injectSuiteCss(normalized.css);
        }
        saveCache(normalized, 'suite-msg');`
);

// Also inject when mounting from localStorage hit
fouc = fouc.replace(
  `if (lsData) {
        console.log('[FOUC] UI shell cache hit (localStorage)');
        watchMount(lsData);
      }`,
  `if (lsData) {
        if (lsData.css) injectSuiteCss(lsData.css);
        console.log('[FOUC] UI shell cache hit (localStorage)');
        watchMount(lsData);
      }`
);

fs.writeFileSync(path.join(root, 'myman_fouc_extension/fouc.js'), fouc);

// --- Patch footer_shell / ui shell module ---
let shell = fs.readFileSync(path.join(root, 'myman_footer_shell.js'), 'utf8');
shell = shell.replace(/const CACHE_VERSION = \d+;/, 'const CACHE_VERSION = 11;');

if (!shell.includes('function collectSuiteCss')) {
  const collectFn = `
    const SKIP_STYLE_IDS = new Set([
        'tm-mms-fouc-guard', 'tm-mms-fouc-bridge', 'tm-mms-fouc-ext-bg',
        'tm-mms-fouc-page-css', 'tm-mms-menu-early-guard', 'tm-mms-ui-shell-css',
        'tm-mms-suite-css-cache', 'tm-mms-footer-shell-css', 'tm-mms-footer-shell-css-cache',
    ]);
    const MAX_CSS = 1500000;

    function collectSuiteCss() {
        const parts = [];
        const seen = new Set();
        document.querySelectorAll('style').forEach((el) => {
            const id = el.id || '';
            if (id && SKIP_STYLE_IDS.has(id)) return;
            if (id.startsWith('tm-mms-fouc')) return;
            const text = el.textContent || '';
            if (text.length < 20) return;
            const isSuite = (id && id.startsWith('tm-'))
                || text.includes('#tm-')
                || text.includes('.tm-')
                || text.includes('--tm-')
                || text.includes('tm-mms-');
            if (!isSuite) return;
            const key = id || \`anon:\${text.length}:\${text.slice(0, 40)}\`;
            if (seen.has(key)) return;
            seen.add(key);
            parts.push(text);
        });
        let css = parts.join('\\n\\n');
        if (css.length > MAX_CSS) css = css.slice(0, MAX_CSS);
        return css;
    }
`;
  shell = shell.replace(
    'function collectAllShells() {',
    collectFn + '\n    function collectAllShells() {'
  );
}

shell = shell.replace(
  `const shells = collectAllShells();
            const ids = Object.keys(shells);
            if (!ids.length) {
                lastError = 'no live shells yet';
                console.warn('[MMS UI Shell] skip (' + reason + '): ' + lastError);
                return false;
            }
            const cache = { v: CACHE_VERSION, updatedAt: Date.now(), shells };
            const lsOk = writeLocal(cache);
            publishToExtension(cache);
            lastOkAt = Date.now();
            lastError = '';
            console.log(
                \`[MMS UI Shell] cached \${ids.length} shell(s) (~\${Math.round(JSON.stringify(shells).length / 1024)}KB) via \${reason}\`
                + (lsOk ? '' : ' [ext-msg]')
            );`,
  `const shells = collectAllShells();
            const css = collectSuiteCss();
            const ids = Object.keys(shells);
            if (!ids.length && !css) {
                lastError = 'no live shells/css yet';
                console.warn('[MMS UI Shell] skip (' + reason + '): ' + lastError);
                return false;
            }
            const cache = { v: CACHE_VERSION, updatedAt: Date.now(), shells, css: css || '' };
            const lsOk = writeLocal(cache);
            publishToExtension(cache);
            try {
                if (css) pageLocalStorage().setItem('tm_mms_suite_css', JSON.stringify({
                    v: CACHE_VERSION, updatedAt: Date.now(), css,
                }));
            } catch (_) { /* quota */ }
            lastOkAt = Date.now();
            lastError = '';
            console.log(
                \`[MMS UI Shell] cached \${ids.length} shell(s)\`
                + (css ? \` + CSS ~\${Math.round(css.length / 1024)}KB\` : '')
                + \` via \${reason}\`
                + (lsOk ? '' : ' [ext-msg]')
            );`
);

fs.writeFileSync(path.join(root, 'myman_footer_shell.js'), shell);

// --- Patch styles.js to sync after global CSS apply ---
let styles = fs.readFileSync(path.join(root, 'myman_styles.js'), 'utf8');
if (!styles.includes('tmSyncAllUiShells')) {
  styles = styles.replace(
    `        if (criticalStart >= 0) {
            GM_addStyle(css.slice(criticalStart));
        } else if (shopStart >= 0) {
            GM_addStyle(css.slice(shopStart));
        }
    }`,
    `        if (criticalStart >= 0) {
            GM_addStyle(css.slice(criticalStart));
        } else if (shopStart >= 0) {
            GM_addStyle(css.slice(shopStart));
        }

        // Persist suite CSS for FOUC early paint (shells + styles).
        try {
            if (typeof window.tmSyncAllUiShells === 'function') {
                setTimeout(() => window.tmSyncAllUiShells({ force: true, reason: 'styles' }), 1200);
            }
        } catch (_) { /* ignore */ }
    }`
  );
  fs.writeFileSync(path.join(root, 'myman_styles.js'), styles);
}

// Manifest bump
const manPath = path.join(root, 'myman_fouc_extension/manifest.json');
const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
man.version = '1.10.0';
man.description = 'Blanks MyManager before first paint; caches suite UI shells + full CSS until vars hydrate.';
fs.writeFileSync(manPath, `${JSON.stringify(man, null, 2)}\n`);

console.log('Patched FOUC CSS cache → extension 1.10.0, cache v11');
