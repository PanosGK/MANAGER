/**
 * Silent release: bumps silentVersion → Custom Ver. {loader}.{silent} (e.g. 5.11)
 *
 *   node scripts/release.mjs "What changed"
 *
 * Loader release (resets silent to 1, bumps loader digit):
 *   node scripts/release.mjs --loader "Loader change"
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

function formatCustomVer(loaderVersion, silentVersion) {
    return `${loaderVersion}.${silentVersion}`;
}

const args = process.argv.slice(2);
const bumpLoader = args.includes('--loader');
const notes = args.filter((a) => a !== '--loader').join(' ').trim();

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const prevBundle = manifest.version;
const prevDisplay = manifest.displayVersion || formatCustomVer(manifest.loaderVersion, manifest.silentVersion || '1');

manifest.version = bumpNumericVersion(manifest.version);

if (bumpLoader) {
    manifest.loaderVersion = bumpNumericVersion(manifest.loaderVersion || '1');
    manifest.silentVersion = '1';
} else {
    manifest.silentVersion = bumpNumericVersion(manifest.silentVersion || '0');
}

manifest.displayVersion = formatCustomVer(manifest.loaderVersion, manifest.silentVersion);
if (notes) manifest.releaseNotes = notes;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const gen = spawnSync(process.execPath, [path.join(__dirname, 'generate-loader.mjs')], {
    cwd: root,
    stdio: 'inherit',
});

if (gen.status !== 0) {
    process.exit(gen.status || 1);
}

console.log(`Released: Custom Ver. ${prevDisplay} → ${manifest.displayVersion} (bundle v${prevBundle} → v${manifest.version}${bumpLoader ? `, loader v${manifest.loaderVersion}` : ''})`);
