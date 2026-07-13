/**
 * Bumps bundle version + Custom Ver. (displayVersion), writes releaseNotes, regenerates artifacts.
 *
 *   node scripts/release.mjs "What changed in this release"
 *
 * Only bumps loaderVersion when you pass --loader (or edit myman_manifest.json manually).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'myman_manifest.json');

function bumpNumericVersion(value) {
    const n = parseInt(String(value).replace(/\D/g, ''), 10);
    return String(Number.isFinite(n) ? n + 1 : 1);
}

function bumpDisplayVersion(displayVersion) {
    const parts = String(displayVersion || '0.0.0.0').split('.').map((p) => {
        const n = parseInt(p, 10);
        return Number.isFinite(n) ? n : 0;
    });
    while (parts.length < 4) parts.push(0);
    parts[parts.length - 1] += 1;
    return parts.join('.');
}

const args = process.argv.slice(2);
const bumpLoader = args.includes('--loader');
const notes = args.filter((a) => a !== '--loader').join(' ').trim();

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const prevBundle = manifest.version;
const prevDisplay = manifest.displayVersion;

manifest.version = bumpNumericVersion(manifest.version);
manifest.displayVersion = bumpDisplayVersion(manifest.displayVersion);
if (notes) manifest.releaseNotes = notes;
if (bumpLoader) {
    manifest.loaderVersion = bumpNumericVersion(manifest.loaderVersion || manifest.version);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const gen = spawnSync(process.execPath, [path.join(__dirname, 'generate-loader.mjs')], {
    cwd: root,
    stdio: 'inherit',
});

if (gen.status !== 0) {
    process.exit(gen.status || 1);
}

console.log(`Released: bundle v${prevBundle} → v${manifest.version}, Custom Ver. ${prevDisplay} → ${manifest.displayVersion}${bumpLoader ? `, loader v${manifest.loaderVersion}` : ''}`);
