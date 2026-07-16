/**
 * Sequentially apply scripts/svg-{robot,slime,plant,ghost,cat,phoenix,crystal}.mjs
 * into myman_mascot.js. CRLF-aware. Validates hooks.
 */
import fs from 'fs';
import { pathToFileURL } from 'url';

const path = 'myman_mascot.js';
const nl = fs.readFileSync(path, 'utf8').includes('\r\n') ? '\r\n' : '\n';

const jobs = [
  { file: 'scripts/svg-robot.mjs', exportName: 'robotSvg', startRe: /[ \t]*<!-- ROBOT CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- SLIME CHARACTER - All Life Stages/ },
  { file: 'scripts/svg-slime.mjs', exportName: 'slimeSvg', startRe: /[ \t]*<!-- SLIME CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- PLANT CHARACTER - All Life Stages/ },
  { file: 'scripts/svg-plant.mjs', exportName: 'plantSvg', startRe: /[ \t]*<!-- PLANT CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- GHOST CHARACTER - All Life Stages/ },
  { file: 'scripts/svg-ghost.mjs', exportName: 'ghostSvg', startRe: /[ \t]*<!-- GHOST CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- CAT CHARACTER - All Life Stages/ },
  { file: 'scripts/svg-cat.mjs', exportName: 'catSvg', startRe: /[ \t]*<!-- CAT CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- PHOENIX CHARACTER - All Life Stages/ },
  { file: 'scripts/svg-phoenix.mjs', exportName: 'phoenixSvg', startRe: /[ \t]*<!-- PHOENIX CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- CRYSTAL CHARACTER - All Life Stages/ },
  { file: 'scripts/svg-crystal.mjs', exportName: 'crystalSvg', startRe: /[ \t]*<!-- CRYSTAL CHARACTER - All Life Stages/, endRe: /[ \t]*<!-- Integrated accessories/ },
];

const HOOKS = [
  'tm-animate-body', 'tm-animate-arm-left', 'tm-animate-arm-right',
  'tm-animate-leg-left', 'tm-animate-leg-right', 'tm-animate-tail',
  'tm-animate-wing-left', 'tm-animate-wing-right',
  'tm-mascot-eye-open', 'tm-mascot-eye-closed',
  'tm-mascot-mouth-happy', 'tm-mascot-mouth-sad',
];

function findLineStart(src, re) {
  const m = src.match(re);
  if (!m) return -1;
  return src.indexOf(m[0]);
}

function normalize(svg) {
  let s = String(svg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
  if (!s.endsWith(nl)) s += nl;
  // ensure leading indent on first line if comment
  return s;
}

const missing = jobs.filter((j) => !fs.existsSync(j.file));
if (missing.length) {
  console.error('Missing SVG modules:');
  missing.forEach((m) => console.error(' -', m.file));
  process.exit(2);
}

let src = fs.readFileSync(path, 'utf8');

for (const job of jobs) {
  const mod = await import(pathToFileURL(job.file).href + '?t=' + Date.now());
  const svg = mod[job.exportName];
  if (!svg) throw new Error(`No export ${job.exportName} in ${job.file}`);
  const start = findLineStart(src, job.startRe);
  const end = findLineStart(src, job.endRe);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`markers fail ${job.file}: start=${start} end=${end}`);
  }
  src = src.slice(0, start) + normalize(svg) + src.slice(end);
  console.log('applied', job.file, `(${end - start} → ${normalize(svg).length})`);
}

const chars = ['robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal'];
const stages = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const issues = [];
for (const c of chars) {
  for (const s of stages) {
    const id = `tm-mascot-${s}-${c}`;
    const idx = src.indexOf(`id="${id}"`);
    if (idx < 0) { issues.push(`missing ${id}`); continue; }
    const next = src.indexOf('id="tm-mascot-', idx + 12);
    const chunk = src.slice(idx, next > 0 ? next : idx + 15000);
    for (const h of HOOKS) if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
  }
}
if (issues.length) {
  console.error('VALIDATION FAILED', issues.length);
  issues.slice(0, 60).forEach((i) => console.error(' -', i));
  process.exit(1);
}

fs.writeFileSync(path, src);
console.log('OK', path, src.length);
