import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Prefer the generator; fall back to the extracted current block.
let src;
if (existsSync(join(__dirname, 'svg-aether.mjs'))) {
  const mod = await import(pathToFileURL(join(__dirname, 'svg-aether.mjs')).href + '?t=' + Date.now());
  src = mod.aetherSvg;
} else {
  src = readFileSync(join(__dirname, '_aether_current.txt'), 'utf8');
}

const stageBlocks = [...src.matchAll(/<g id="tm-mascot-([a-z0-9]+)-aether"[^>]*>([\s\S]*?)<\/g>\s*(?=(?:<!--|$))/g)];

const cards = stageBlocks.map(([, stage, inner]) => {
  // Reveal the hidden data-fx layers so the full design is visible in preview.
  const revealed = inner.replace(/(<g class="tm-aether-fx[^"]*"[^>]*?)opacity="0"/g, '$1opacity="0.85"');
  return `
    <div class="card">
      <div class="label">${stage}</div>
      <svg viewBox="0 0 100 100" width="420" height="420">
        <g>${revealed}</g>
      </svg>
    </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Aether Preview</title>
<style>
  body { background:#05010c; margin:0; padding:24px; font-family: sans-serif; }
  .grid { display:flex; flex-wrap:wrap; gap:20px; }
  svg {
    background-image:
      linear-gradient(45deg, #0e0618 25%, transparent 25%), linear-gradient(-45deg, #0e0618 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #0e0618 75%), linear-gradient(-45deg, transparent 75%, #0e0618 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #090312;
  }
  .card { background:#0c0518; border:1px solid #3a2258; border-radius:12px; padding:10px; text-align:center; box-shadow: 0 0 24px rgba(124,77,255,0.14); overflow:visible; }
  .label { color:#b39ddb; font-size:13px; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; text-shadow: 0 0 8px rgba(124,77,255,0.5); }
  h1 { color:#d1c4e9; font-size:18px; font-weight:400; letter-spacing:2px; margin:0 0 16px; text-align:center; }
  .tm-animate-wing-left { animation: flapL 3.6s cubic-bezier(0.55,0.05,0.35,1) infinite; transform-origin:right center; transform-box:fill-box; }
  .tm-animate-wing-right { animation: flapR 3.6s cubic-bezier(0.55,0.05,0.35,1) infinite; transform-origin:left center; transform-box:fill-box; }
  .tm-aether-wing-seg { transform-box:fill-box; transform-origin:100% 42%; }
  .tm-aether-wing-root { animation: segR 3.6s cubic-bezier(0.55,0.05,0.35,1) infinite; }
  .tm-aether-wing-mid { animation: segM 3.6s cubic-bezier(0.55,0.05,0.35,1) infinite; animation-delay:.1s; }
  .tm-aether-wing-tip { animation: segT 3.6s cubic-bezier(0.45,0.02,0.3,1) infinite; animation-delay:.2s; }
  .tm-aether-wing-tatter { animation: tat 2.8s ease-in-out infinite; transform-box:fill-box; transform-origin:top center; }
  @keyframes flapL { 0%,100%{transform:rotate(3deg)} 40%{transform:rotate(-5deg)} 55%{transform:rotate(-6deg)} 70%{transform:rotate(1deg)} }
  @keyframes flapR { 0%,100%{transform:rotate(-3deg)} 40%{transform:rotate(5deg)} 55%{transform:rotate(6deg)} 70%{transform:rotate(-1deg)} }
  @keyframes segR { 0%,100%{transform:rotate(4deg)} 42%{transform:rotate(-10deg)} 58%{transform:rotate(-12deg)} 72%{transform:rotate(2deg)} }
  @keyframes segM { 0%,100%{transform:rotate(2deg)} 40%{transform:rotate(-16deg)} 56%{transform:rotate(-20deg)} 74%{transform:rotate(4deg)} }
  @keyframes segT { 0%,100%{transform:rotate(0deg)} 38%{transform:rotate(-22deg)} 54%{transform:rotate(-28deg)} 76%{transform:rotate(8deg)} }
  @keyframes tat { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-6deg)} }
</style>
</head>
<body>
<h1>Starveil Aether — Evolution Line</h1>
<div class="grid">
${cards}
</div>
</body>
</html>`;

const outPath = join(__dirname, '..', 'aether-preview.html');
writeFileSync(outPath, html, 'utf-8');
console.log('wrote', outPath, 'stages found:', stageBlocks.length);
