# MyManager FOUC Guard (Chrome extension)

Blanks [thesellers.mymanager.gr](https://thesellers.mymanager.gr/) **before first paint** until the Tampermonkey suite adds `tm-mms-theme-ready`.

## Install (unpacked)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → `myman_fouc_extension`
4. Keep the MyManager Tampermonkey loader installed
5. Hard-refresh MyManager

## What it caches

Only `#tm-footer-controls-container` (footer icons / coins / XP / weather chrome).

**Storage:** the suite `postMessage`s a snapshot → extension saves it in **`chrome.storage.local`** (not Tampermonkey sandbox localStorage). That is what makes early mount reliable.

## After updating

1. Chrome → Extensions → **Reload** this extension (**v1.7.0** — needs `storage` permission; confirm if prompted)
2. Open MyManager, wait ~5s — console should show:
   - `[MMS Footer Shell] cached (~NKB) via footer+2s`
   - `[FOUC] footer saved to extension storage (~NKB)`
3. Hard-refresh / navigate — console: `[FOUC] mounted footer shell`
