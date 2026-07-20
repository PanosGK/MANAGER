# MyManager FOUC Guard (Chrome extension)

Blanks [thefixers.mymanager.gr](https://thefixers.mymanager.gr/) **before first paint** until the Tampermonkey suite adds `tm-mms-theme-ready`.

Tampermonkey alone cannot do this reliably on Chrome (MV3) — scripts often run 1–2 seconds late. This extension uses a real `document_start` CSS content script.

## Install (unpacked)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. **Load unpacked** → select this folder: `myman_fouc_extension`
4. Keep the MyManager Tampermonkey loader installed as usual
5. Hard-refresh MyManager

You can disable the Tampermonkey `myman_fouc.user.js` script — this extension replaces it.

## How it works

- `fouc.css` hides `html` until class `tm-mms-theme-ready` is present
- On **repeat visits**, `fouc.js` applies cached theme CSS from `localStorage` and reveals immediately (no waiting for Tampermonkey)
- Also mounts an **exact snapshot of `#tm-footer-controls-container`** (baked styles + last values); the suite replaces it and refreshes live vars when ready
- First visit stays blank until the suite seeds the cache once
- Login / quickview pages are revealed immediately
- 8s failsafe if anything goes wrong
