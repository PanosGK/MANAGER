/**
 * Apply only scripts/svg-phoenix.mjs into myman_mascot.js
 */
import fs from 'fs';
import { pathToFileURL } from 'url';

const path = 'myman_mascot.js';
const nl = fs.readFileSync(path, 'utf8').includes('\r\n') ? '\r\n' : '\n';
const mod = await import(pathToFileURL('scripts/svg-phoenix.mjs').href + '?t=' + Date.now());
let svg = String(mod.phoenixSvg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
if (!svg.endsWith(nl)) svg += nl;

let src = fs.readFileSync(path, 'utf8');
const startRe = /[ \t]*<!-- PHOENIX CHARACTER - All Life Stages/;
const endRe = /[ \t]*<!-- CRYSTAL CHARACTER - All Life Stages/;
const startM = src.match(startRe);
const endM = src.match(endRe);
if (!startM || !endM) throw new Error('markers missing');
const start = src.indexOf(startM[0]);
const end = src.indexOf(endM[0]);
src = src.slice(0, start) + svg + src.slice(end);
fs.writeFileSync(path, src);

const stages = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const hooks = [
  'tm-animate-body', 'tm-animate-arm-left', 'tm-animate-arm-right',
  'tm-animate-leg-left', 'tm-animate-leg-right', 'tm-animate-tail',
  'tm-animate-wing-left', 'tm-animate-wing-right',
  'tm-mascot-eye-open', 'tm-mascot-eye-closed',
  'tm-mascot-mouth-happy', 'tm-mascot-mouth-sad',
];
const issues = [];
for (const s of stages) {
  const id = `tm-mascot-${s}-phoenix`;
  const idx = src.indexOf(`id="${id}"`);
  if (idx < 0) { issues.push(`missing ${id}`); continue; }
  const next = src.indexOf('id="tm-mascot-', idx + 12);
  const chunk = src.slice(idx, next > 0 ? next : idx + 25000);
  for (const h of hooks) if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
}
if (issues.length) {
  console.error(issues);
  process.exit(1);
}
console.log('phoenix sprites applied ok');
