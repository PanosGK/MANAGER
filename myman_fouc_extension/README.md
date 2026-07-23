# MyManager FOUC Guard (Chrome extension)

Shows a **carbon copy** of the last suite UI (CSS + buttons + last values) as fast as possible, then Tampermonkey replaces shells and hydrates fresh values.

## Install / update

1. `chrome://extensions` → Developer mode  
2. **Load unpacked** / **Reload** → `myman_fouc_extension`  
3. Confirm **1.11.0** + storage permission  
4. Hard-refresh MyManager, wait ~12s once to seed, then reload again

## What is cached

- **CSS** — full suite chrome/theme styles  
- **HTML shells** — footer, brand, header search, right rail, mascot, scroll button  
- **Last values** — coins, XP, weather, labels, icons (SVGs kept)  
- **Placement** — same parents the suite uses (`td[width=60%/40%]`, `.rnr-hfiller`, `body`)

Open panels / dropdown lists are not cached (too ephemeral).

## Console

**Seed:** `[FOUC] carbon-copy cached N shell(s) (~…KB) + CSS …`  
**Next visit:** `[FOUC] suite CSS applied early` → `[FOUC] mounted N UI shell(s)` → suite boots and hydrates
