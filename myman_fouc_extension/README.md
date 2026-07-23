# MyManager FOUC Guard (Chrome extension)

Blanks **MyManager** before first paint, then remounts **suite UI chrome + CSS** until the Tampermonkey suite hydrates live values.

## Install / update

1. `chrome://extensions` → Developer mode  
2. **Load unpacked** → `myman_fouc_extension` (or **Reload**)  
3. Confirm version **1.10.0** + **storage** permission  
4. Hard-refresh MyManager

## What is cached (v1.10)

**HTML shells:** footer, brand, header QS, right rail, mascot silhouette, scroll-to-top  

**CSS:** all suite styles (`#tm-*` / `.tm-*` / `--tm-*`, theme extended styles, global chrome CSS) via `chrome.storage` + `localStorage` (`tm_mms_suite_css`)

On the next visit the extension injects CSS first, then mounts shells. The suite replaces shells and fills variables (coins, XP, weather, etc.).

## Console checks

**Seed (wait ~6–12s):**
```
[FOUC] guard v1.10.0 ready (thefixers.mymanager.gr) — multi-UI shell cache
[FOUC] cached suite CSS (~NKB) from live-dom
[FOUC] cached N UI shell(s) … from live-dom
```

**Next visit:**
```
[FOUC] suite CSS applied early (~NKB)
[FOUC] mounted N UI shell(s)
```
