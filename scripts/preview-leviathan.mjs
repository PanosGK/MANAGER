import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { leviathanSvg } from './svg-leviathan.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const stageBlocks = [...leviathanSvg.matchAll(/<g id="tm-mascot-([a-z0-9]+)-leviathan"[^>]*>([\s\S]*?)<\/g>\s*(?=(?:<!--|$))/g)];

const cards = stageBlocks.map(([, stage, inner]) => {
  // The regex capture already excludes the outer stage wrapper's own
  // "display: none;" (that's in the opening tag, not the captured inner
  // content), and inner alternate-state groups like eye-closed / mouth-sad
  // stay hidden here — matching production, where JS toggles only one of
  // each pair visible at a time.
  return `
    <div class="card">
      <div class="label">${stage}</div>
      <svg viewBox="0 0 100 100" width="420" height="420">
        <rect x="0" y="0" width="100" height="100" fill="#04070d"/>
        <g>${inner}</g>
      </svg>
    </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Leviathan Preview</title>
<style>
  body { background:#000; margin:0; padding:24px; font-family: sans-serif; }
  .grid { display:flex; flex-wrap:wrap; gap:20px; }
  svg { background:#04070d; }
  .card { background:#0a0e14; border:1px solid #223; border-radius:12px; padding:10px; text-align:center; }
  .label { color:#9cf; font-size:13px; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; }
</style>
</head>
<body>
<div class="grid">
${cards}
</div>
</body>
</html>`;

const outPath = join(__dirname, '..', 'leviathan-preview.html');
writeFileSync(outPath, html, 'utf-8');
console.log('wrote', outPath, 'stages found:', stageBlocks.length);
