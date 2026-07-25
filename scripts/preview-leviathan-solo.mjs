import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { leviathanSvg } from './svg-leviathan.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stageArg = process.argv[2] || 'evo3';
const cropArg = process.argv[3]; // e.g. "40,20,40,40" as x,y,w,h

const stageBlocks = [...leviathanSvg.matchAll(/<g id="tm-mascot-([a-z0-9]+)-leviathan"[^>]*>([\s\S]*?)<\/g>\s*(?=(?:<!--|$))/g)];
const found = stageBlocks.find(([, stage]) => stage === stageArg);
if (!found) {
  console.error('stage not found:', stageArg, 'available:', stageBlocks.map((b) => b[1]));
  process.exit(1);
}
const [, stage, inner] = found;
const viewBox = cropArg ? cropArg.split(',').join(' ') : '0 0 100 100';

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Leviathan Solo — ${stage}</title>
<style>
  body { background:#26324a; margin:0; padding:24px; }
  svg {
    background-image:
      linear-gradient(45deg, #445 25%, transparent 25%), linear-gradient(-45deg, #445 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #445 75%), linear-gradient(-45deg, transparent 75%, #445 75%);
    background-size: 40px 40px;
    background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
    background-color: #2e3b52;
  }
</style>
</head>
<body>
<svg viewBox="${viewBox}" width="900" height="900">
  <g>${inner}</g>
</svg>
</body>
</html>`;

const outPath = join(__dirname, '..', 'leviathan-solo.html');
writeFileSync(outPath, html, 'utf-8');
console.log('wrote', outPath, 'stage:', stage);
