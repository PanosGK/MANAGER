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
  // Keep FX at SVG opacity="0" like live (only .tm-fx-on reveals them).
  // Expanded viewBox + overflow:visible match live paint outside 0–100.
  return `
    <div class="card">
      <div class="label">${stage}</div>
      <div class="stage mascot-char-aether mascot-idle" id="tm-mascot-container">
        <svg class="tm-mascot-robot mascot-char-aether" viewBox="-45 -35 190 160" width="420" height="355" style="overflow: visible;">
          <g>${inner}</g>
        </svg>
      </div>
    </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Aether Preview</title>
<style>
  /* Preview mirrors live Aether wing CSS from myman_styles.js */
  body { background:#05010c; margin:0; padding:24px; font-family: sans-serif; }
  .grid { display:flex; flex-wrap:wrap; gap:20px; }
  .stage {
    width: 420px; height: 355px;
    display:flex; align-items:center; justify-content:center;
    overflow: visible;
  }
  svg.tm-mascot-robot {
    overflow: visible;
    background-image:
      linear-gradient(45deg, #0e0618 25%, transparent 25%), linear-gradient(-45deg, #0e0618 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #0e0618 75%), linear-gradient(-45deg, transparent 75%, #0e0618 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #090312;
    filter: drop-shadow(0 0 6px rgba(46, 224, 208, 0.35));
  }
  .card { background:#0c0518; border:1px solid #3a2258; border-radius:12px; padding:10px; text-align:center; box-shadow: 0 0 24px rgba(124,77,255,0.14); overflow:visible; }
  .label { color:#b39ddb; font-size:13px; margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; text-shadow: 0 0 8px rgba(124,77,255,0.5); }
  h1 { color:#d1c4e9; font-size:18px; font-weight:400; letter-spacing:2px; margin:0 0 16px; text-align:center; }
  .note { color:#7a6a98; font-size:12px; text-align:center; margin:-8px 0 18px; }

  /* Parent wing killed — only 3-seg flap (live) */
  .tm-animate-wing-left, .tm-animate-wing-right {
    animation: none !important;
    transform: none !important;
  }
  .tm-aether-wing-seg {
    transform-box: fill-box;
    transform-origin: 100% 42%;
  }
  .tm-animate-wing-left .tm-aether-wing-root,
  .tm-animate-wing-right .tm-aether-wing-root {
    animation: tm-aether-seg-root 1.45s cubic-bezier(0.22, 0.82, 0.28, 1) infinite !important;
  }
  .tm-animate-wing-left .tm-aether-wing-mid,
  .tm-animate-wing-right .tm-aether-wing-mid {
    animation: tm-aether-seg-mid 1.45s cubic-bezier(0.2, 0.9, 0.25, 1) infinite !important;
    animation-delay: 0.03s !important;
  }
  .tm-animate-wing-left .tm-aether-wing-tip,
  .tm-animate-wing-right .tm-aether-wing-tip {
    animation: tm-aether-seg-tip 1.45s cubic-bezier(0.15, 0.95, 0.2, 1) infinite !important;
    animation-delay: 0.06s !important;
  }
  .tm-aether-wing-tatter {
    animation: tm-aether-tatter-sway 2.8s ease-in-out infinite !important;
    transform-box: fill-box;
    transform-origin: top center;
  }
  /* Membrane: SVG opacity wins (no black-slab CSS override) */
  .tm-aether-wing-membrane { /* intentionally no opacity override */ }
  .tm-aether-wing-vein { opacity: 0.65; }
  .tm-aether-wing-crack { opacity: 0.45; }
  .tm-aether-ghost-wing-left,
  .tm-aether-ghost-wing-right {
    opacity: 0.08 !important;
    filter: blur(0.6px);
  }
  .tm-aether-fx { opacity: 0 !important; }

  @keyframes tm-aether-seg-root {
    0%, 100% { transform: rotate(8deg); }
    10% { transform: rotate(10deg); }
    22% { transform: rotate(-12deg); }
    32% { transform: rotate(-10deg); }
    50% { transform: rotate(6deg); }
    64%, 100% { transform: rotate(8deg); }
  }
  @keyframes tm-aether-seg-mid {
    0%, 100% { transform: rotate(4deg); }
    10% { transform: rotate(8deg); }
    24% { transform: rotate(-18deg); }
    34% { transform: rotate(-14deg); }
    52% { transform: rotate(3deg); }
    66%, 100% { transform: rotate(4deg); }
  }
  @keyframes tm-aether-seg-tip {
    0%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(8deg); }
    26% { transform: rotate(-24deg); }
    36% { transform: rotate(-18deg); }
    54% { transform: rotate(4deg); }
    68%, 100% { transform: rotate(0deg); }
  }
  @keyframes tm-aether-tatter-sway {
    0%, 100% { transform: rotate(0deg) translate(0, 0); opacity: 0.8; }
    50% { transform: rotate(-6deg) translate(-0.4px, 0.6px); opacity: 1; }
  }
</style>
</head>
<body>
<h1>Starveil Aether — Evolution Line</h1>
<p class="note">Live-matched: same flap keyframes, FX hidden, overflow visible, SVG membrane opacity</p>
<div class="grid">
${cards}
</div>
</body>
</html>`;

const outPath = join(__dirname, '..', 'aether-preview.html');
writeFileSync(outPath, html, 'utf-8');
console.log('wrote', outPath, 'stages found:', stageBlocks.length);
