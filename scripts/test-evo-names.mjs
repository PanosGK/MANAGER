import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'myman_mascot.js');
const check = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
if (check.status !== 0) {
    console.error(check.stderr || check.stdout);
    process.exit(check.status || 1);
}

const src = fs.readFileSync(file, 'utf8');
const mapMatch = src.match(/const MASCOT_EVOLUTION_NAMES = \{[\s\S]*?\n\};/);
if (!mapMatch) throw new Error('MASCOT_EVOLUTION_NAMES missing');

const chars = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal', 'aether', 'leviathan'];
const stages = ['egg', 'evo1', 'evo2', 'evo3'];
const mapBlock = mapMatch[0];

for (const c of chars) {
    if (!new RegExp(`\\b${c}:\\s*\\{`).test(mapBlock)) throw new Error(`missing character ${c}`);
    for (const st of stages) {
        const re = new RegExp(`${c}:\\s*\\{[\\s\\S]*?${st}:\\s*'([^']+)'`);
        const m = mapBlock.match(re);
        if (!m) throw new Error(`missing ${c}.${st}`);
    }
}

if (!src.includes('tm-age-prev-mystery')) throw new Error('mystery blur missing');
if (!src.includes('Locked evolutions must not reveal')) throw new Error('lock guard missing');
if (!src.includes('function getMascotEvolutionDisplayName')) throw new Error('helper missing');

console.log('[test-evo-names] all 10 mascots × 4 stages named; locked blur wired; syntax OK');
