# MyManager FOUC Guard (Chrome extension)

Shows a **carbon copy** of the last suite UI (CSS + buttons + last values) as fast as possible, then Tampermonkey replaces shells and hydrates fresh values.

## Install / update

1. `chrome://extensions` → Developer mode  
2. **Load unpacked** / **Reload** → `myman_fouc_extension`  
3. Confirm **1.12.1** + storage permission  
4. Hard-refresh MyManager

FOUC caches only live, enabled chrome (hidden/disabled widgets are stripped). If the page stays blank, Remove and **Load unpacked** from `myman_fouc_extension`.

## What is cached

- **CSS** — full suite chrome/theme styles  
- **HTML shells** — footer, brand, right rail, mascot silhouette, scroll button  
  (header quick-search is **not** cached — it raced live mount)  
- **Last values** — coins, XP, weather, labels, icons (SVGs kept)  
- **Placement** — same parents the suite uses (`td[width=60%/40%]`, `.rnr-hfiller`, `body`)

Open panels / dropdown lists are not cached (too ephemeral).

## Console

**Seed:** `[FOUC] carbon-copy cached N shell(s) (~…KB) + CSS …`  
**Next visit:** `[FOUC] suite CSS applied early` → `[FOUC] mounted N UI shell(s)` → suite boots and hydrates

If the page stays blank: reload the extension to **1.11.3** (reveal runs before shell mount).
