# MyManager All-in-One Suite

Tampermonkey userscript suite that enhances [MyManager](https://thefixers.mymanager.gr/) with search, gamification, phone catalog, scratchpad, and more.

## Install (recommended — auto-updates)

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Push this repo to GitHub (or use an existing repo). Update `updateBase` in `myman_manifest.json` if your repo URL differs from `Gkorogias/MANAGER`.
3. Install the loader once:
   - Open `myman_loader.user.js` on GitHub → **Raw**
   - Tampermonkey should offer to install it  
   - Or: Tampermonkey → Create new script → paste the loader contents → Save
4. Enable **Check for userscript updates** in Tampermonkey settings (daily or on browser start).

Tampermonkey will check `@updateURL` and pull new versions automatically. You do **not** need to copy files manually.

### Manual update check

Open **Settings → Διαχείριση Δεδομένων → Έλεγχος Ενημερώσεων**, or use Tampermonkey Dashboard → **Check for userscript updates**.

## Local development

For editing files on your machine:

1. Edit `file://` paths in `myman_loader.local.user.js` to match your clone path.
2. Install `myman_loader.local.user.js` in Tampermonkey (disable or remove the GitHub loader while developing).
3. Enable Tampermonkey **Allow access to file URLs** for your browser.
4. Edit module files directly; reload the MyManager page to test.

`myman_allinone.js` is the main application logic (no userscript header). Loaders pull it in via `@require`.

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
| `myman_loader.local.user.js` | **Local dev** — loads modules from disk |
| `myman_manifest.json` | Version + module list for updates |
| `myman_allinone.js` | Main app logic |
| `myman_*.js` | Feature modules (config, gamification, phonelist, etc.) |
| `scripts/generate-loader.mjs` | Regenerates the production loader |

## Tampermonkey notes

- `@require` modules are cached; bumping the loader `@version` forces Tampermonkey to re-fetch all modules.
- The repo must be **public** (or users need access) for `raw.githubusercontent.com` URLs to work.
- If your default branch is not `main`, change `updateBase` in the manifest.
