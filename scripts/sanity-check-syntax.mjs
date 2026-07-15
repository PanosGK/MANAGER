/**
 * Syntax sanity check for all suite source files and the generated bundle.
 * Run: node scripts/sanity-check-syntax.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function collectFiles() {
    const files = fs.readdirSync(root)
        .filter((f) => f.startsWith('myman_') && f.endsWith('.js'))
        .map((f) => path.join(root, f));
    const scripts = fs.readdirSync(path.join(root, 'scripts'))
        .filter((f) => f.endsWith('.mjs'))
        .map((f) => path.join(root, 'scripts', f));
    const bundle = path.join(root, 'myman_suite.bundle.js');
    if (fs.existsSync(bundle)) files.push(bundle);
    return [...files, ...scripts.filter((f) => !f.endsWith('sanity-check-syntax.mjs'))];
}

const files = collectFiles();
const failures = [];

for (const file of files) {
    const rel = path.relative(root, file);
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
        failures.push({ file: rel, output: (result.stderr || result.stdout || '').trim() });
    }
}

// Extra parse check for bundle (catches some concat issues)
const bundlePath = path.join(root, 'myman_suite.bundle.js');
if (fs.existsSync(bundlePath)) {
    try {
        const code = fs.readFileSync(bundlePath, 'utf8');
        // eslint-disable-next-line no-new-func
        new Function(code);
    } catch (err) {
        failures.push({ file: 'myman_suite.bundle.js (Function parse)', output: err.message });
    }
}

console.log('=== Syntax Sanity Check ===\n');
console.log(`Checked ${files.length} files`);

if (failures.length === 0) {
    console.log('\nAll files passed syntax checks.');
    process.exit(0);
}

console.log(`\n${failures.length} failure(s):\n`);
for (const f of failures) {
    console.log(`--- ${f.file} ---`);
    console.log(f.output);
    console.log('');
}
process.exit(1);
