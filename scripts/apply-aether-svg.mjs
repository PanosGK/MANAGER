/**
 * Apply scripts/svg-aether.mjs into myman_mascot.js
 * Inserts between crystal block and integrated accessories.
 */
import fs from 'fs';
import { pathToFileURL } from 'url';

const path = 'myman_mascot.js';
const nl = fs.readFileSync(path, 'utf8').includes('\r\n') ? '\r\n' : '\n';
const mod = await import(pathToFileURL('scripts/svg-aether.mjs').href + '?t=' + Date.now());
let svg = String(mod.aetherSvg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
if (!svg.endsWith(nl)) svg += nl;

let src = fs.readFileSync(path, 'utf8');

const startMarker = '<!-- AETHER CHARACTER - All Life Stages';
const endMarker = '<!-- Integrated accessories (anchor-local art, positioned by layoutMascotAccessory) -->';
const crystalEndRe = /[ \t]*<!-- Integrated accessories \(anchor-local art, positioned by layoutMascotAccessory\) -->/;

const existingStart = src.indexOf(startMarker);
const endM = src.match(crystalEndRe);
if (!endM) throw new Error('accessories marker missing');
const end = src.indexOf(endM[0]);

if (existingStart >= 0 && existingStart < end) {
  // Replace existing aether block
  src = src.slice(0, existingStart) + svg + src.slice(end);
  console.log('replaced existing aether block');
} else {
  // Insert before accessories
  src = src.slice(0, end) + svg + src.slice(end);
  console.log('inserted new aether block');
}

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
const check = fs.readFileSync(path, 'utf8');
for (const s of stages) {
  const id = `tm-mascot-${s}-aether`;
  const idx = check.indexOf(`id="${id}"`);
  if (idx < 0) { issues.push(`missing ${id}`); continue; }
  const next = check.indexOf('id="tm-mascot-', idx + 12);
  const chunk = check.slice(idx, next > 0 ? next : idx + 25000);
  for (const h of hooks) if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
}
if (issues.length) {
  console.error(issues);
  process.exit(1);
}
console.log('aether sprites applied ok');
