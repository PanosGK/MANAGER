# MyManager FOUC Guard (Chrome extension)

Tampermonkey scripts start **after** Chrome can paint the page, so a userscript blank-screen always flashes. This tiny extension injects CSS at Chrome `document_start` (before paint).

The main MyManager Suite still reveals the page by adding `tm-mms-theme-ready` when the theme is ready.

## Install (once)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this folder: `myman-fouc-extension`
4. Keep the MyManager Tampermonkey suite installed as usual

No need to reinstall when the suite updates, unless this extension folder changes.
