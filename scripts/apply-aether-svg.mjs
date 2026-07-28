/**
 * Apply only scripts/svg-aether.mjs into myman_mascot.js
 */
import fs from 'fs';
import { pathToFileURL } from 'url';

const path = 'myman_mascot.js';
const nl = fs.readFileSync(path, 'utf8').includes('\r\n') ? '\r\n' : '\n';
const mod = await import(pathToFileURL('scripts/svg-aether.mjs').href + '?t=' + Date.now());
let svg = String(mod.aetherSvg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
if (!svg.endsWith(nl)) svg += nl;

let src = fs.readFileSync(path, 'utf8');
const startRe = /[ \t]*<!-- AETHER CHARACTER - All Life Stages/;
const endRe = /[ \t]*<!-- LEVIATHAN CHARACTER - All Life Stages/;
const startM = src.match(startRe);
const endM = src.match(endRe);
if (!startM || !endM) throw new Error('markers missing');
const start = src.indexOf(startM[0]);
const end = src.indexOf(endM[0]);
src = src.slice(0, start) + svg + src.slice(end);
fs.writeFileSync(path, src);

// Full hook verification (all tm-aether-* + tm-animate-* classes per stage).
const issues = mod.verifyAetherHooks(src);
if (issues.length) {
  console.error(issues);
  process.exit(1);
}
console.log('aether sprites applied ok');
