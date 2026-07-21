# MyManager FOUC Guard (Chrome extension)

Blanks [thesellers.mymanager.gr](https://thesellers.mymanager.gr/) **before first paint** until the Tampermonkey suite adds `tm-mms-theme-ready`.

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
- Mounts **cached UI chrome shells** so the page looks fully painted while the suite hydrates live values:
  - Footer controls (icons, XP, coins, weather, settings, …)
  - Mascot (last visible sprite + position)
  - Right-side rail (scratchpad / quests buttons)
  - Header quick-search host
  - Footer suite brand / version
- First visit stays blank until the suite seeds the cache once
- Login / quickview pages are revealed immediately
- 8s failsafe if anything goes wrong

Cache keys (localStorage): `tm_mms_ui_shell__footer`, `tm_mms_ui_shell__mascot`, … plus index `tm_mms_ui_shells`.

## After updating

1. Chrome → Extensions → **Reload** this extension (**v1.5.1+**)
2. Open MyManager once and wait ~12s (seeds `tm_mms_ui_shell__*` keys)
3. In DevTools console check: `Object.keys(localStorage).filter(k => k.includes('tm_mms_ui'))`
4. Navigate again — chrome should appear instantly; coins / badge / XP refresh when the suite loads

If cache is empty after step 2, look for `[MMS UI Shell] cached:` in the console.
