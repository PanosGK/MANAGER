# MyManager All-in-One Suite

Tampermonkey userscript suite that enhances [MyManager](https://thefixers.mymanager.gr/) with search, gamification, phone catalog, scratchpad, and more.

## Install (recommended — auto-updates)

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Push this repo to GitHub. The `updateBase` in `myman_manifest.json` must match your raw URL, e.g. `https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main`.
3. Install the loader once:
    - Open `myman_loader.user.js` on GitHub → **Raw**
    - Tampermonkey should offer to install it  
    - Or: Tampermonkey → Create new script → paste the loader contents → Save
4. Enable **Check for userscript updates** in Tampermonkey settings (daily or on browser start).

Tampermonkey will check `@updateURL` and pull new versions automatically. You do **not** need to copy files manually.

### Stop the unthemed page flash (FOUC)

Tampermonkey runs **after** the browser’s first paint, so a userscript alone cannot hide the host UI in time. Use one of these (recommended: extension):

**Option A — Chrome / Edge extension (best)**  
1. Open `chrome://extensions` (or `edge://extensions`)  
2. Enable **Developer mode**  
3. **Load unpacked** → select the `fouc-extension` folder in this repo  
4. Keep it enabled alongside Tampermonkey  

**Option B — Stylus**  
1. Install [Stylus](https://add0n.com/stylus.html)  
2. Install `myman_fouc.user.css` from this repo  

Both hide `body` until the suite adds `html.tm-mms-theme-ready`.

### Manual update check

Open suite **Settings → Ενημερώσεις → Έλεγχος τώρα**, or in Tampermonkey: icon → **Dashboard** → **MyManager All-in-One Suite** → **Settings** → **Check for userscript updates**. Or open the loader URL and click **Override** or **Update**: https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_loader.user.js

## Local development

For editing files on your machine:

1. Install `myman_loader.local.user.js` in Tampermonkey (disable or remove the GitHub loader while developing).
2. Enable Tampermonkey **Allow access to file URLs** for this script (needed for async `file://` bundle load).
3. Edit module files directly; run `npm run build` after edits; reload the MyManager page to test.
4. For no FOUC while developing, also load `fouc-extension` (see above).

`myman_allinone.js` is the main application logic (no userscript header). The local loader fetches `myman_suite.bundle.js` asynchronously after the FOUC hide runs.

## Releasing a new version

1. Make your code changes.
2. Bump `version` in `myman_manifest.json` (and optional `releaseNotes`).
3. Run:
   ```bash
   node scripts/generate-loader.mjs
   ```
   This regenerates `myman_loader.user.js` and syncs `SCRIPT_META.version` in `myman_config.js`.
4. Commit and push to GitHub (`main` branch).
5. Users with the loader installed get the update on Tampermonkey’s next check (or immediately via manual check).

## File structure

| File | Purpose |
|------|---------|
| `myman_loader.user.js` | **Production** — install this; auto-updates from GitHub |
| `myman_loader.local.user.js` | **Local dev** — loads bundle from disk (async) |
| `fouc-extension/` | **FOUC guard** — Chrome/Edge unpacked extension (before first paint) |
| `myman_fouc.user.css` | Stylus alternative for FOUC |
| `myman_manifest.json` | Version + module list for updates |
| `myman_allinone.js` | Main app logic |
| `myman_*.js` | Feature modules (config, gamification, phonelist, etc.) |
| `scripts/generate-loader.mjs` | Regenerates the production loader |

## Tampermonkey notes

- `@require` modules are cached; bumping the loader `@version` forces Tampermonkey to re-fetch all modules.
- The repo must be **public** (or users need access) for `raw.githubusercontent.com` URLs to work.
- If your default branch is not `main`, change `updateBase` in the manifest.
