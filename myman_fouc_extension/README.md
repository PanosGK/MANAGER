# MyManager FOUC Guard (Chrome extension)

Blanks **MyManager** before first paint, then remounts **all suite UI chrome** as shells until the Tampermonkey suite hydrates live values.

## Install / update

1. `chrome://extensions` → Developer mode  
2. **Load unpacked** → `myman_fouc_extension` (or **Reload**)  
3. Confirm version **1.9.0** + **storage** permission  
4. Hard-refresh MyManager (`thefixers.mymanager.gr`)

## What is cached (v1.9)

| Shell | Purpose |
|-------|---------|
| `#tm-footer-controls-container` | XP, coins, weather, settings, EOD, recent, bell… |
| `#tm-footer-suite-brand` | Custom Ver. label |
| `#tm-header-quick-search-host` | Header quick search |
| `#tm-search-container` | Right-rail buttons |
| `#tm-mascot-container` | Silhouette placeholder (no heavy SVG) |
| `#tm-scroll-to-top-btn` | Scroll button |

On the next visit the extension mounts these shells immediately. The suite then **replaces** each shell and fills **variables** (coins, XP, weather temp, unread count, etc.).

## Console checks

**Seed (wait ~6–10s):**
```
[FOUC] guard v1.9.0 ready (thefixers.mymanager.gr) — multi-UI shell cache
[FOUC] cached N UI shell(s) from live-dom
```

**Next visit:**
```
[FOUC] UI shell cache hit (chrome.storage)
[FOUC] mounted N UI shell(s)
```
