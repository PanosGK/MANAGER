import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { phoenixSvg } from './svg-phoenix.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const stageBlocks = [...phoenixSvg.matchAll(/<g id="tm-mascot-([a-z0-9]+)-phoenix"[^>]*>([\s\S]*?)<\/g>\s*(?=(?:<!--|$))/g)];

const cards = stageBlocks.map(([, stage, inner]) => {
  return `
    <div class="card">
      <div class="label">${stage}</div>
      <svg viewBox="0 0 100 100" width="420" height="420">
        <g>${inner}</g>
      </svg>
    </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Phoenix Preview</title>
<style>
  body { background:#0a0604; margin:0; padding:24px; font-family: sans-serif; }
  .grid { display:flex; flex-wrap:wrap; gap:20px; }
  svg {
    background-image:
      linear-gradient(45deg, #1a1008 25%, transparent 25%), linear-gradient(-45deg, #1a1008 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #1a1008 75%), linear-gradient(-45deg, transparent 75%, #1a1008 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #120a06;
  }
  .card { background:#1a0e08; border:1px solid #5a2818; border-radius:12px; padding:10px; text-align:center; box-shadow: 0 0 24px rgba(255,60,0,0.12); }
  .label { color:#ff8040; font-size:13px; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; text-shadow: 0 0 8px rgba(255,100,0,0.5); }
  h1 { color:#ffb080; font-size:18px; font-weight:400; letter-spacing:2px; margin:0 0 16px; text-align:center; }
</style>
</head>
<body>
<h1>Ashborn Phoenix — Evolution Line v12</h1>
<p style="color:#c8a060;text-align:center;font-size:12px;margin:-8px 0 16px;letter-spacing:0.5px;">3-stage: chick &gt; BOSS streamers &gt; charred warlord</p>
<div class="grid">
${cards}
</div>
</body>
</html>`;

const outPath = join(__dirname, '..', 'phoenix-preview.html');
writeFileSync(outPath, html, 'utf-8');
console.log('wrote', outPath, 'stages found:', stageBlocks.length);
