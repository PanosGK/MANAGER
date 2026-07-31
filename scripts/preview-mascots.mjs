/**
 * Unified mascot preview page — extracts live sprites from myman_mascot.js.
 *
 * Usage:
 *   npm run preview:mascots
 *   open mascot-preview.html
 */
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcPath = join(root, 'myman_mascot.js');
const outPath = join(root, 'mascot-preview.html');

const CHARS = [
  { id: 'dragon', name: 'Dragon', accent: '#26a69a' },
  { id: 'robot', name: 'Robot', accent: '#42a5f5' },
  { id: 'slime', name: 'Slime', accent: '#76ff03' },
  { id: 'plant', name: 'Plant', accent: '#8bc34a' },
  { id: 'ghost', name: 'Ghost', accent: '#9575cd' },
  { id: 'cat', name: 'Cat', accent: '#ffb74d' },
  { id: 'phoenix', name: 'Phoenix', accent: '#ff6d00' },
  { id: 'crystal', name: 'Crystal', accent: '#80deea' },
  { id: 'aether', name: 'Aether', accent: '#2ee0d0' },
  { id: 'leviathan', name: 'Leviathan', accent: '#4fc3f7' },
];

const STAGES = [
  { id: 'egg', label: 'Egg', sprite: (c) => (c ? null : 'tm-mascot-base') },
  { id: 'evo1', label: 'Evo 1', sprite: (c) => `tm-mascot-evo1-${c}` },
  { id: 'evo2', label: 'Evo 2', sprite: (c) => `tm-mascot-evo2-${c}` },
  { id: 'evo3', label: 'Evo 3', sprite: (c) => `tm-mascot-evo3-${c}` },
];

function extractGroup(src, id) {
  const needle = `id="${id}"`;
  const idIdx = src.indexOf(needle);
  if (idIdx < 0) return null;
  const start = src.lastIndexOf('<g', idIdx);
  let i = start;
  let depth = 0;
  while (i < src.length) {
    if (src.startsWith('<g', i) && (src[i + 2] === ' ' || src[i + 2] === '>')) {
      depth += 1;
      i += 2;
      continue;
    }
    if (src.startsWith('</g>', i)) {
      depth -= 1;
      i += 4;
      if (depth === 0) return src.slice(start, i);
      continue;
    }
    i += 1;
  }
  return null;
}

function remapIds(html, prefix) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  ids.sort((a, b) => b.length - a.length);
  let out = html;
  for (const id of ids) {
    const next = `${prefix}${id}`;
    out = out.split(`id="${id}"`).join(`id="${next}"`);
    out = out.split(`url(#${id})`).join(`url(#${next})`);
  }
  // Only unwrap the root stage group visibility — keep nested eye/mouth display styles.
  out = out.replace(
    /^(<g\b[^>]*?)\sstyle="display:\s*none;?(?:\s*visibility:\s*hidden;?\s*opacity:\s*0;?)?"/i,
    '$1',
  );
  return out;
}

const src = fs.readFileSync(srcPath, 'utf8');
const sprites = {};
const missing = [];

// Shared egg once
{
  const raw = extractGroup(src, 'tm-mascot-base');
  if (!raw) missing.push('tm-mascot-base');
  else sprites.egg = remapIds(raw, 'pv-egg-');
}

for (const char of CHARS) {
  sprites[char.id] = {};
  for (const stage of ['evo1', 'evo2', 'evo3']) {
    const id = `tm-mascot-${stage}-${char.id}`;
    const raw = extractGroup(src, id);
    if (!raw) {
      missing.push(id);
      continue;
    }
    sprites[char.id][stage] = remapIds(raw, `pv-${char.id}-${stage}-`);
  }
}

if (missing.length) {
  console.error('Missing sprites:', missing);
  process.exit(1);
}

const generatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const dataJson = JSON.stringify({ chars: CHARS, sprites, generatedAt });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Mascot Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,700&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg0: #12160f;
    --bg1: #1a2116;
    --panel: #222b1c;
    --line: #3a4a32;
    --text: #e8f0df;
    --muted: #9aaf8c;
    --accent: #8bc34a;
    --card: #182016;
    --checker-a: #1c2618;
    --checker-b: #152014;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    font-family: "Outfit", system-ui, sans-serif;
    color: var(--text);
    background:
      radial-gradient(ellipse 80% 50% at 10% -10%, #2a3a22 0%, transparent 55%),
      radial-gradient(ellipse 60% 40% at 100% 0%, #1e2a28 0%, transparent 50%),
      var(--bg0);
  }
  .shell {
    max-width: 1280px;
    margin: 0 auto;
    padding: 28px 20px 48px;
  }
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
  }
  .brand {
    font-family: "Source Serif 4", Georgia, serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .sub {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 0.92rem;
  }
  .meta {
    text-align: right;
    color: var(--muted);
    font-size: 0.78rem;
    line-height: 1.45;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background: #0e140c;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 1px 6px;
    font-size: 0.85em;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 18px;
    padding: 12px;
    background: color-mix(in srgb, var(--panel) 88%, black);
    border: 1px solid var(--line);
    border-radius: 14px;
  }
  .char-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
  }
  .char-btn, .mood-btn {
    appearance: none;
    border: 1px solid var(--line);
    background: var(--bg1);
    color: var(--text);
    border-radius: 999px;
    padding: 8px 14px;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .15s, background .15s, color .15s, transform .12s;
  }
  .char-btn:hover, .mood-btn:hover { border-color: color-mix(in srgb, var(--accent) 55%, var(--line)); }
  .char-btn.active {
    background: color-mix(in srgb, var(--accent) 22%, var(--bg1));
    border-color: var(--accent);
    color: #fff;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent);
  }
  .char-btn .dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-right: 7px;
    vertical-align: 1px;
    background: var(--dot, var(--accent));
  }
  .moods {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .mood-btn.active {
    background: #314028;
    border-color: #7cb342;
  }
  .stages {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  @media (max-width: 980px) {
    .stages { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 560px) {
    .stages { grid-template-columns: 1fr; }
  }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 12px;
    min-height: 280px;
    display: flex;
    flex-direction: column;
  }
  .card h2 {
    margin: 0 0 10px;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 600;
  }
  .stage {
    flex: 1;
    display: grid;
    place-items: center;
    border-radius: 12px;
    overflow: visible;
    background-image:
      linear-gradient(45deg, var(--checker-a) 25%, transparent 25%),
      linear-gradient(-45deg, var(--checker-a) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--checker-a) 75%),
      linear-gradient(-45deg, transparent 75%, var(--checker-a) 75%);
    background-size: 18px 18px;
    background-position: 0 0, 0 9px, 9px -9px, -9px 0;
    background-color: var(--checker-b);
  }
  .stage svg {
    width: min(100%, 240px);
    height: auto;
    overflow: visible;
    filter: drop-shadow(0 10px 18px rgba(0,0,0,0.35));
  }
  .gallery {
    display: none;
    margin-top: 22px;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .gallery.on { display: grid; }
  .gallery .mini {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    text-align: center;
  }
  .gallery .mini:hover { border-color: var(--accent); }
  .gallery .mini svg { width: 100%; height: auto; overflow: visible; }
  .gallery .mini span {
    display: block;
    margin-top: 6px;
    font-size: 0.78rem;
    color: var(--muted);
    font-weight: 600;
  }
  .hint {
    margin-top: 18px;
    color: var(--muted);
    font-size: 0.82rem;
  }
  /* Mood visibility */
  .preview-root.mood-sad .tm-mascot-mouth-happy { display: none !important; }
  .preview-root.mood-sad .tm-mascot-mouth-sad { display: inline !important; }
  .preview-root.mood-sleep .tm-mascot-eye-open { display: none !important; }
  .preview-root.mood-sleep .tm-mascot-eye-closed { display: block !important; }
  .preview-root.mood-happy .tm-mascot-mouth-sad { display: none !important; }
  .preview-root.mood-happy .tm-mascot-mouth-happy { display: inline !important; }
  .preview-root.mood-happy .tm-mascot-eye-closed { display: none !important; }
  .preview-root.mood-happy .tm-mascot-eye-open { display: block !important; }

  /* Light idle motion */
  .preview-root.anim-on .tm-animate-body {
    animation: pv-bob 2.8s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center bottom;
  }
  .preview-root.anim-on .tm-animate-wing-left,
  .preview-root.anim-on .tm-animate-wing-right {
    animation: pv-flap 1.6s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  .preview-root.anim-on .tm-animate-wing-right { animation-delay: 0.08s; }
  .preview-root.anim-on .tm-animate-tail {
    animation: pv-wag 2.2s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: left center;
  }
  @keyframes pv-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-1.6px); }
  }
  @keyframes pv-flap {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-8deg); }
  }
  @keyframes pv-wag {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(6deg); }
  }

  /* Aether multi-seg flap (matches live intent) */
  .preview-root.anim-on .tm-aether-wing-seg {
    transform-box: fill-box;
    transform-origin: 100% 42%;
  }
  .preview-root.anim-on .tm-animate-wing-left .tm-aether-wing-root,
  .preview-root.anim-on .tm-animate-wing-right .tm-aether-wing-root {
    animation: pv-aether-root 1.45s cubic-bezier(0.22, 0.82, 0.28, 1) infinite;
  }
  .preview-root.anim-on .tm-animate-wing-left .tm-aether-wing-mid,
  .preview-root.anim-on .tm-animate-wing-right .tm-aether-wing-mid {
    animation: pv-aether-mid 1.45s cubic-bezier(0.2, 0.9, 0.25, 1) infinite;
    animation-delay: 0.03s;
  }
  .preview-root.anim-on .tm-animate-wing-left .tm-aether-wing-tip,
  .preview-root.anim-on .tm-animate-wing-right .tm-aether-wing-tip {
    animation: pv-aether-tip 1.45s cubic-bezier(0.15, 0.95, 0.2, 1) infinite;
    animation-delay: 0.06s;
  }
  @keyframes pv-aether-root {
    0%, 100% { transform: rotate(8deg); }
    22% { transform: rotate(-12deg); }
    50% { transform: rotate(6deg); }
  }
  @keyframes pv-aether-mid {
    0%, 100% { transform: rotate(4deg); }
    24% { transform: rotate(-18deg); }
    52% { transform: rotate(3deg); }
  }
  @keyframes pv-aether-tip {
    0%, 100% { transform: rotate(0deg); }
    26% { transform: rotate(-24deg); }
    54% { transform: rotate(4deg); }
  }
  .tm-aether-fx { opacity: 0 !important; }
</style>
</head>
<body>
<div class="shell preview-root mood-happy anim-on" id="app">
  <header>
    <div>
      <h1 class="brand">Mascot Preview</h1>
      <p class="sub">Live sprites from <code>myman_mascot.js</code> · all characters · 3 evolutions</p>
    </div>
    <div class="meta">
      Generated <span id="gen-at"></span><br/>
      Regenerate with <code>npm run preview:mascots</code>
    </div>
  </header>

  <div class="toolbar">
    <nav class="char-nav" id="char-nav" aria-label="Characters"></nav>
    <div class="moods" role="group" aria-label="Preview controls">
      <button type="button" class="mood-btn active" data-mood="happy">Happy</button>
      <button type="button" class="mood-btn" data-mood="sad">Sad</button>
      <button type="button" class="mood-btn" data-mood="sleep">Sleep</button>
      <button type="button" class="mood-btn active" data-anim="1" id="anim-btn">Anim</button>
      <button type="button" class="mood-btn" id="gallery-btn">Gallery</button>
    </div>
  </div>

  <section class="stages" id="stages" aria-live="polite"></section>
  <section class="gallery" id="gallery" aria-label="All mascots evo2"></section>
  <p class="hint">Tip: open this file after any sprite change. Single-character previews (<code>*-preview.html</code>) are obsolete — use this page.</p>
</div>

<script id="mascot-data" type="application/json">${dataJson.replace(/</g, '\\u003c')}</script>
<script>
(() => {
  const DATA = JSON.parse(document.getElementById('mascot-data').textContent);
  const app = document.getElementById('app');
  const charNav = document.getElementById('char-nav');
  const stagesEl = document.getElementById('stages');
  const galleryEl = document.getElementById('gallery');
  const genAt = document.getElementById('gen-at');
  genAt.textContent = DATA.generatedAt;

  const SHARED_DEFS = \`
    <defs>
      <filter id="tm-mascot-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="tm-mascot-strong-glow">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>\`;

  let active = DATA.chars[0].id;
  let galleryOn = false;

  function setAccent(hex) {
    document.documentElement.style.setProperty('--accent', hex);
  }

  function svgFor(inner, wide = false) {
    const vb = wide ? '-30 -25 160 150' : '0 0 100 110';
    return \`<svg viewBox="\${vb}" xmlns="http://www.w3.org/2000/svg">\${SHARED_DEFS}\${inner}</svg>\`;
  }

  function renderNav() {
    charNav.innerHTML = DATA.chars.map((c) => \`
      <button type="button" class="char-btn\${c.id === active ? ' active' : ''}" data-char="\${c.id}">
        <span class="dot" style="--dot:\${c.accent}"></span>\${c.name}
      </button>\`).join('');
  }

  function renderStages() {
    const char = DATA.chars.find((c) => c.id === active);
    setAccent(char.accent);
    const wide = active === 'aether' || active === 'phoenix' || active === 'leviathan';
    const blocks = [
      { key: 'egg', label: 'Egg', html: DATA.sprites.egg },
      { key: 'evo1', label: 'Evo 1', html: DATA.sprites[active].evo1 },
      { key: 'evo2', label: 'Evo 2', html: DATA.sprites[active].evo2 },
      { key: 'evo3', label: 'Evo 3', html: DATA.sprites[active].evo3 },
    ];
    stagesEl.innerHTML = blocks.map((b) => \`
      <article class="card">
        <h2>\${char.name} · \${b.label}</h2>
        <div class="stage">\${svgFor(b.html, wide && b.key !== 'egg')}</div>
      </article>\`).join('');
  }

  function renderGallery() {
    galleryEl.innerHTML = DATA.chars.map((c) => \`
      <button type="button" class="mini" data-jump="\${c.id}">
        \${svgFor(DATA.sprites[c.id].evo2, c.id === 'aether' || c.id === 'phoenix' || c.id === 'leviathan')}
        <span>\${c.name}</span>
      </button>\`).join('');
  }

  charNav.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-char]');
    if (!btn) return;
    active = btn.dataset.char;
    renderNav();
    renderStages();
  });

  document.querySelectorAll('[data-mood]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mood]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      app.classList.remove('mood-happy', 'mood-sad', 'mood-sleep');
      app.classList.add('mood-' + btn.dataset.mood);
    });
  });

  document.getElementById('anim-btn').addEventListener('click', (e) => {
    const on = app.classList.toggle('anim-on');
    e.currentTarget.classList.toggle('active', on);
  });

  document.getElementById('gallery-btn').addEventListener('click', (e) => {
    galleryOn = !galleryOn;
    e.currentTarget.classList.toggle('active', galleryOn);
    galleryEl.classList.toggle('on', galleryOn);
    if (galleryOn) renderGallery();
  });

  galleryEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-jump]');
    if (!btn) return;
    active = btn.dataset.jump;
    galleryOn = false;
    document.getElementById('gallery-btn').classList.remove('active');
    galleryEl.classList.remove('on');
    renderNav();
    renderStages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Deep link: mascot-preview.html#plant
  const hash = (location.hash || '').replace(/^#/, '');
  if (DATA.chars.some((c) => c.id === hash)) active = hash;

  renderNav();
  renderStages();
})();
</script>
</body>
</html>
`;

fs.writeFileSync(outPath, html);
const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`OK wrote ${outPath} (${sizeKb} KB)`);
console.log(`chars: ${CHARS.map((c) => c.id).join(', ')}`);
console.log(`generatedAt: ${generatedAt}`);
