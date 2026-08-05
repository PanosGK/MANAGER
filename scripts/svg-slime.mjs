/**
 * Abyssal Ooze — SLIME remake v10
 *
 * Smooth wet gelatin (reads as real slime) + dark mean face.
 * Soft organic curves — not cute orbs, not jagged polygons.
 *
 *   evo1 — Spore: small squat soft blob on a puddle
 *   evo2 — Cyst: medium melting dome with goo arms
 *   evo3 — Abyss: large amoeba with soft lobes + raised nucleus
 *
 * Run: node scripts/svg-slime.mjs
 */
import fs from 'fs';

const I = '                ';
const I2 = `${I}    `;
const I3 = `${I2}    `;
const I4 = `${I3}    `;

const STAGES = ['evo1', 'evo2', 'evo3'];
const HOOKS = [
  'tm-animate-body', 'tm-animate-arm-left', 'tm-animate-arm-right',
  'tm-animate-leg-left', 'tm-animate-leg-right', 'tm-animate-tail',
  'tm-animate-wing-left', 'tm-animate-wing-right',
  'tm-mascot-eye-open', 'tm-mascot-eye-closed',
  'tm-mascot-mouth-happy', 'tm-mascot-mouth-sad',
];

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="28%" r="70%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Small mean eyes in dark sockets */
function meanEyes(p, lx, rx, cy, rxE, ryE, stroke) {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#020604" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#020604" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="${lx}" cy="${cy + 0.2}" rx="${rxE * 0.68}" ry="${ryE * 0.48}" fill="url(#${p}-iris)"/>
${I4}<ellipse cx="${rx}" cy="${cy + 0.2}" rx="${rxE * 0.68}" ry="${ryE * 0.48}" fill="url(#${p}-iris)"/>
${I4}<ellipse cx="${lx + 0.35}" cy="${cy + 0.2}" rx="${rxE * 0.2}" ry="${ryE * 0.7}" fill="#010301"/>
${I4}<ellipse cx="${rx + 0.35}" cy="${cy + 0.2}" rx="${rxE * 0.2}" ry="${ryE * 0.7}" fill="#010301"/>
${I4}<ellipse cx="${lx - 0.6}" cy="${cy - ryE * 0.2}" rx="${Math.max(0.7, rxE * 0.15)}" ry="${Math.max(0.4, ryE * 0.1)}" fill="#d8ff40" opacity="0.65"/>
${I4}<ellipse cx="${rx - 0.6}" cy="${cy - ryE * 0.2}" rx="${Math.max(0.7, rxE * 0.15)}" ry="${Math.max(0.4, ryE * 0.1)}" fill="#d8ff40" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy + 1} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy + 1} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function thinMouth(y, stroke, span = 5) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 1.8} ${50 + span} ${y}" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.8"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 1} Q 50 ${y - 2.5} ${50 + span} ${y + 1}" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}

function wingPlaceholders(cy = 48) {
  return `${I3}<g class="tm-animate-wing-left" opacity="0"><circle cx="12" cy="${cy}" r="1"/></g>
${I3}<g class="tm-animate-wing-right" opacity="0"><circle cx="88" cy="${cy}" r="1"/></g>`;
}

function wrapStage(stage, label, defs, body) {
  return `${I}<!-- SLIME ${stage.toUpperCase()} — ${label} -->
${I}<g id="tm-mascot-${stage}-slime" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function shadow(cy, rx) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${Math.max(2.5, rx * 0.12)}" fill="#000" opacity="0.4"/>`;
}

/** evo1 — small squat wet blob */
function slimeEvo1() {
  const p = 'slime-evo1';
  const stroke = '#0c1c0e';
  const rim = '#4d7a3a';
  const defs = [
    grad(`${p}-body`, [
      ['0%', '#3d6b38', 0.72],
      ['35%', '#1a3a1c', 0.92],
      ['70%', '#0a180c', 0.98],
      ['100%', '#020604', 1],
    ], 'radial', 'cx="42%" cy="36%" r="64%"'),
    grad(`${p}-core`, [
      ['0%', '#b8e600', 0.55],
      ['50%', '#5a9a20', 0.2],
      ['100%', '#1a3a10', 0],
    ], 'radial', 'cx="50%" cy="55%" r="48%"'),
    grad(`${p}-gloss`, [
      ['0%', '#8fbc6a', 0.4],
      ['45%', '#8fbc6a', 0.1],
      ['100%', '#8fbc6a', 0],
    ], 'radial', 'cx="34%" cy="30%" r="42%"'),
    grad(`${p}-iris`, [['0%', '#d0ff30'], ['100%', '#204818']], 'radial', 'cx="40%" cy="40%" r="60%"'),
    grad(`${p}-puddle`, [
      ['0%', '#2a5024', 0.65],
      ['100%', '#061008', 0.95],
    ], 'radial', 'cx="50%" cy="40%" r="70%"'),
  ].join('\n');

  const body = `${shadow(92, 28)}
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="36" cy="86" rx="12" ry="4.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="64" cy="86" rx="12" ry="4.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<ellipse cx="50" cy="86" rx="26" ry="6" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.2"/>

${I3}<g class="tm-animate-tail">
${I4}<ellipse cx="70" cy="78" rx="7" ry="5" fill="#0e1c10" stroke="${rim}" stroke-width="1" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="74" rx="6" ry="7" fill="#0e1c10" stroke="${rim}" stroke-width="1" transform="rotate(-10 26 74)"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="74" rx="6" ry="7" fill="#0e1c10" stroke="${rim}" stroke-width="1" transform="rotate(10 74 74)"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<path d="M 24 80
${I4}  C 22 66 30 56 50 54
${I4}  C 70 56 78 66 76 80
${I4}  C 72 90 58 92 50 92
${I4}  C 42 92 28 90 24 80 Z"
${I4}  fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<ellipse cx="50" cy="72" rx="14" ry="9" fill="url(#${p}-core)"/>
${I4}<ellipse cx="40" cy="64" rx="11" ry="7" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="42" cy="62" rx="3.5" ry="1.8" fill="#c5e1a5" opacity="0.28"/>
${I4}<circle cx="58" cy="74" r="1.8" fill="#b8e600" opacity="0.3"/>
${I3}</g>

${meanEyes(p, 40, 60, 66, 4.6, 3.2, stroke)}
${thinMouth(76, rim, 4.5)}
${wingPlaceholders(62)}`;

  return wrapStage('evo1', 'Spore — squat wet blob', defs, body);
}

/** evo2 — melting medium dome */
function slimeEvo2() {
  const p = 'slime-evo2';
  const stroke = '#0a160c';
  const rim = '#5a8a3a';
  const defs = [
    grad(`${p}-body`, [
      ['0%', '#4a7a38', 0.55],
      ['30%', '#1e4220', 0.9],
      ['65%', '#0c1c10', 0.97],
      ['100%', '#020604', 1],
    ], 'radial', 'cx="40%" cy="28%" r="70%"'),
    grad(`${p}-core`, [
      ['0%', '#d4ff20', 0.7],
      ['40%', '#7ab820', 0.3],
      ['100%', '#1a3a10', 0],
    ], 'radial', 'cx="50%" cy="52%" r="50%"'),
    grad(`${p}-gloss`, [
      ['0%', '#a5d67a', 0.38],
      ['40%', '#a5d67a', 0.1],
      ['100%', '#a5d67a', 0],
    ], 'radial', 'cx="32%" cy="24%" r="46%"'),
    grad(`${p}-iris`, [['0%', '#e0ff40'], ['100%', '#1e4818']], 'radial', 'cx="38%" cy="40%" r="62%"'),
    grad(`${p}-puddle`, [
      ['0%', '#2e5824', 0.6],
      ['100%', '#061008', 0.95],
    ], 'radial', 'cx="50%" cy="40%" r="72%"'),
  ].join('\n');

  const body = `${shadow(95, 30)}
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="34" cy="90" rx="13" ry="5.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.1"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="66" cy="90" rx="13" ry="5.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.1"/>
${I3}</g>
${I3}<ellipse cx="50" cy="90" rx="26" ry="7" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.3"/>

${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 74 C 76 78 82 68 80 58 C 78 52 70 54 66 64 Z" fill="#0e1c10" stroke="${rim}" stroke-width="1.1"/>
${I4}<ellipse cx="76" cy="60" rx="2.5" ry="2" fill="#b8e600" opacity="0.28"/>
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 30 62 C 16 58 10 46 12 38 C 14 32 22 36 26 48 Z" fill="#0e1c10" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="14" cy="40" rx="4.5" ry="5" fill="#142818" stroke="${rim}" stroke-width="0.9"/>
${I4}<circle cx="13" cy="38" r="1.4" fill="#9ccc00" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 70 62 C 84 58 90 46 88 38 C 86 32 78 36 74 48 Z" fill="#0e1c10" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="86" cy="40" rx="4.5" ry="5" fill="#142818" stroke="${rim}" stroke-width="0.9"/>
${I4}<circle cx="87" cy="38" r="1.4" fill="#9ccc00" opacity="0.35"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Melting dome — taller than evo1, still soft jelly -->
${I4}<path d="M 24 82
${I4}  C 18 60 28 34 50 26
${I4}  C 72 34 82 60 76 82
${I4}  C 72 94 56 96 50 96
${I4}  C 44 96 28 94 24 82 Z"
${I4}  fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.2"/>
${I4}<ellipse cx="50" cy="62" rx="15" ry="16" fill="url(#${p}-core)"/>
${I4}<ellipse cx="38" cy="44" rx="13" ry="11" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="40" cy="40" rx="4.5" ry="2.2" fill="#dcedc8" opacity="0.25"/>
${I4}<circle cx="50" cy="64" r="3.5" fill="#d4ff20" opacity="0.35"/>
${I4}<circle cx="36" cy="70" r="2.2" fill="#7cb342" opacity="0.22"/>
${I4}<path d="M 36 50 C 40 47 44 50 44 50" stroke="#081208" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.55"/>
${I4}<path d="M 64 50 C 60 47 56 50 56 50" stroke="#081208" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.55"/>
${I3}</g>

${meanEyes(p, 40, 60, 52, 5.2, 3.5, stroke)}
${thinMouth(66, rim, 5.5)}
${wingPlaceholders(46)}`;

  return wrapStage('evo2', 'Cyst — melting toxic dome', defs, body);
}

/** evo3 — large amoeba with lobes + nucleus head */
function slimeEvo3() {
  const p = 'slime-evo3';
  const stroke = '#061008';
  const rim = '#689f38';
  const defs = [
    grad(`${p}-body`, [
      ['0%', '#4a7a38', 0.45],
      ['28%', '#1a3e1c', 0.88],
      ['60%', '#0a1a0e', 0.96],
      ['100%', '#010402', 1],
    ], 'radial', 'cx="44%" cy="38%" r="70%"'),
    grad(`${p}-head`, [
      ['0%', '#3e6b32', 0.55],
      ['40%', '#122816', 0.92],
      ['100%', '#020604', 1],
    ], 'radial', 'cx="45%" cy="30%" r="65%"'),
    grad(`${p}-core`, [
      ['0%', '#eeff30', 0.8],
      ['35%', '#a8d420', 0.4],
      ['100%', '#1a4010', 0],
    ], 'radial', 'cx="50%" cy="55%" r="50%"'),
    grad(`${p}-gloss`, [
      ['0%', '#9ccc6a', 0.32],
      ['100%', '#9ccc6a', 0],
    ], 'radial', 'cx="34%" cy="22%" r="46%"'),
    grad(`${p}-iris`, [['0%', '#e8ff40'], ['55%', '#7aad30'], ['100%', '#1a4010']], 'radial', 'cx="38%" cy="38%" r="62%"'),
    grad(`${p}-puddle`, [
      ['0%', '#2e5a24', 0.5],
      ['50%', '#142818', 0.88],
      ['100%', '#020604', 1],
    ], 'radial', 'cx="50%" cy="32%" r="78%"'),
    grad(`${p}-lobe`, [
      ['0%', '#2a5a28', 0.5],
      ['100%', '#0a180c', 0.92],
    ], 'radial', 'cx="40%" cy="40%" r="65%"'),
  ].join('\n');

  const body = `${shadow(98, 44)}
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="22" cy="90" rx="17" ry="7.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<ellipse cx="12" cy="82" rx="9" ry="6" fill="url(#${p}-lobe)" stroke="${stroke}" stroke-width="1" opacity="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="78" cy="90" rx="17" ry="7.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<ellipse cx="88" cy="82" rx="9" ry="6" fill="url(#${p}-lobe)" stroke="${stroke}" stroke-width="1" opacity="0.9"/>
${I3}</g>
${I3}<ellipse cx="50" cy="92" rx="40" ry="8.5" fill="url(#${p}-puddle)" stroke="${stroke}" stroke-width="1.5"/>

${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 72 C 82 80 92 68 90 54 C 88 46 76 48 70 60 Z" fill="#0a160c" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="86" cy="56" rx="3" ry="2.5" fill="#b8e600" opacity="0.3"/>
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 28 58 C 10 56 2 44 4 34 C 6 26 18 30 24 44 Z" fill="#0c1c10" stroke="${rim}" stroke-width="1.25"/>
${I4}<ellipse cx="6" cy="36" rx="5.5" ry="6.5" fill="#142818" stroke="${rim}" stroke-width="1"/>
${I4}<circle cx="5" cy="34" r="1.8" fill="#9ccc00" opacity="0.35"/>
${I4}<ellipse cx="16" cy="70" rx="9" ry="5.5" fill="url(#${p}-lobe)" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 58 C 90 56 98 44 96 34 C 94 26 82 30 76 44 Z" fill="#0c1c10" stroke="${rim}" stroke-width="1.25"/>
${I4}<ellipse cx="94" cy="36" rx="5.5" ry="6.5" fill="#142818" stroke="${rim}" stroke-width="1"/>
${I4}<circle cx="95" cy="34" r="1.8" fill="#9ccc00" opacity="0.35"/>
${I4}<ellipse cx="84" cy="70" rx="9" ry="5.5" fill="url(#${p}-lobe)" opacity="0.85"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Wide amoeba midsection -->
${I4}<path d="M 18 80
${I4}  C 14 62 26 50 50 48
${I4}  C 74 50 86 62 82 80
${I4}  C 78 92 58 94 50 94
${I4}  C 42 94 22 92 18 80 Z"
${I4}  fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.3"/>
${I4}<!-- Soft raised nucleus / head -->
${I4}<path d="M 32 52
${I4}  C 30 34 38 16 50 12
${I4}  C 62 16 70 34 68 52
${I4}  C 64 58 56 60 50 60
${I4}  C 44 60 36 58 32 52 Z"
${I4}  fill="url(#${p}-head)" stroke="${stroke}" stroke-width="2.1"/>
${I4}<ellipse cx="50" cy="68" rx="15" ry="10" fill="url(#${p}-core)"/>
${I4}<ellipse cx="42" cy="28" rx="12" ry="10" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="44" cy="24" rx="4" ry="2" fill="#dcedc8" opacity="0.22"/>
${I4}<circle cx="50" cy="70" r="4" fill="#eeff30" opacity="0.38"/>
${I4}<circle cx="34" cy="74" r="2.5" fill="#7cb342" opacity="0.2"/>
${I4}<circle cx="66" cy="76" r="2" fill="#b8e600" opacity="0.18"/>
${I4}<path d="M 34 40 C 38 36 44 40 44 40" stroke="#081208" stroke-width="2.3" fill="none" stroke-linecap="round" opacity="0.6"/>
${I4}<path d="M 66 40 C 62 36 56 40 56 40" stroke="#081208" stroke-width="2.3" fill="none" stroke-linecap="round" opacity="0.6"/>
${I3}</g>

${meanEyes(p, 40, 60, 34, 5.4, 3.4, stroke)}
${thinMouth(46, rim, 5.5)}
${wingPlaceholders(38)}`;

  return wrapStage('evo3', 'Abyss — amoeba with nucleus', defs, body);
}

export const slimeSvg = [
  `${I}<!-- SLIME CHARACTER - All Life Stages (wet gelatin v10 · 3-stage) -->`,
  `${I}<!-- Liquid & Bounce • Rare Rarity • Abyssal Ooze -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  slimeEvo1(),
  slimeEvo2(),
  slimeEvo3(),
  `${I}<!-- ═══════════════════════════════════════ -->`,
].join('\n');

function normalize(svg, nl) {
  let s = String(svg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
  if (!s.endsWith(nl)) s += nl;
  return s;
}

function replaceBetween(hay, startNeedle, endNeedle, replacement) {
  const start = hay.indexOf(startNeedle);
  const end = hay.indexOf(endNeedle);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`markers fail: ${startNeedle.slice(0, 50)} (${start}) → ${endNeedle.slice(0, 50)} (${end})`);
  }
  return hay.slice(0, start) + replacement + hay.slice(end);
}

function validateHooks(src) {
  const issues = [];
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-slime`;
    const idx = src.indexOf(`id="${id}"`);
    if (idx < 0) { issues.push(`missing ${id}`); continue; }
    const next = src.indexOf('id="tm-mascot-', idx + 12);
    const chunk = src.slice(idx, next > 0 ? next : idx + 18000);
    for (const h of HOOKS) {
      if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
    }
  }
  return issues;
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-slime.mjs');

if (isMain) {
  const path = 'myman_mascot.js';
  let src = fs.readFileSync(path, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';

  src = replaceBetween(
    src,
    '                <!-- SLIME CHARACTER - All Life Stages',
    '                <!-- PLANT CHARACTER - All Life Stages',
    normalize(slimeSvg, nl),
  );

  const issues = validateHooks(src);
  if (issues.length) {
    console.error('VALIDATION FAILED', issues.length);
    issues.forEach((i) => console.error(' -', i));
    process.exit(1);
  }

  fs.writeFileSync(path, src);
  console.log('OK wrote', path, '— slime v10 wet gelatin, hooks verified');
}
