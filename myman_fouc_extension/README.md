# MyManager FOUC Guard (Chrome extension)

Blanks [thesellers.mymanager.gr](https://thesellers.mymanager.gr/) **before first paint** until the Tampermonkey suite adds `tm-mms-theme-ready`.

## Install (unpacked)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → `myman_fouc_extension`
4. Keep the MyManager Tampermonkey loader installed
5. Hard-refresh MyManager

## What it caches

Only `#tm-footer-controls-container` (icons + last coins/XP/weather/etc.).  
Theme CSS variables are applied early from localStorage.  
Mascot / other widgets are **not** cached (that made the suite too slow).

## After updating

1. Reload this extension (**v1.6.1**)
2. Open MyManager ~5s once — console: `[MMS Footer Shell] cached … via footer+2s`
3. Check: `tmDebugFooterShell()` or `localStorage.getItem('tm_mms_footer_shell')?.length`
4. Navigate again — console: `[FOUC] mounted footer shell`
