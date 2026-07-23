# MyManager FOUC Guard (Chrome extension)

Blanks **MyManager** (`thefixers.mymanager.gr`) **before first paint**, then remounts a cached footer until the suite hydrates.

## Install / update

1. `chrome://extensions` → Developer mode
2. **Load unpacked** → this `myman_fouc_extension` folder  
   (or **Reload** if already loaded)
3. Confirm version **1.8.1** and accept **storage** permission
4. Hard-refresh MyManager on **thefixers.mymanager.gr**

> **Important:** v1.8.0 only matched `thesellers.mymanager.gr` — the suite runs on **`thefixers.mymanager.gr`**, so the addon did nothing until 1.8.1.

## How footer caching works

1. Suite builds the live footer
2. Extension snapshots `#tm-footer-controls-container` → `chrome.storage.local`
3. Next visit: extension mounts that snapshot as soon as `#footer-outterwrap` exists
4. Suite replaces the placeholder with the live footer

## Console checks

**First visit after reload (wait ~6s):**
```
[FOUC] guard v1.8.1 ready (thefixers.mymanager.gr)
[FOUC] no footer cache yet — will snapshot after suite paints
[FOUC] cached footer (~NKB) from live-dom
```

**Second visit:**
```
[FOUC] footer cache hit (chrome.storage)
[FOUC] mounted cached footer
```
