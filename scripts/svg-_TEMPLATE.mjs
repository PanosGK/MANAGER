/**
 * MASCOT SVG TEMPLATE — copy to scripts/svg-{char}.mjs and fill in.
 *
 * OTHER AI: deliver ONLY this file (or a finished copy). Do not edit
 * myman_mascot.js, myman_styles.js, settings, or the bundle.
 *
 * THIS REPO (human / Cursor): runs the file to inject art, then preview/sanity/release.
 *
 * Contract:
 *   - Exactly 3 stages: evo1, evo2, evo3
 *   - Group ids: tm-mascot-evo{N}-{CHAR}
 *   - Gradient ids unique: {CHAR}-evo{N}-…
 *   - Required hooks on EVERY stage (see HOOKS)
 *   - Paint order: body/head fills FIRST, then eyes + mouths ON TOP
 *   - eye-closed + mouth-sad use style="display:none;"
 *   - viewBox space is roughly 0..100 x 0..100 (overflow ok for wings)
 *
 * Apply (after renaming CHAR + filename):
 *   node scripts/svg-{char}.mjs
 *   npm run preview:mascots
 *   npm run sanity
 */
import fs from 'fs';

/** @type {string} lowercase id — must match filename + live character id */
const CHAR = 'CHANGEME';
/** Human title for comments */
const TITLE = 'CHANGEME Line';
/** Markers in myman_mascot.js — UPPERCASE character name in the HTML comment */
const START_MARKER = `                <!-- ${CHAR.toUpperCase()} CHARACTER`;
const END_MARKER = '                <!-- NEXT_CHARACTER'; // replace with real next marker

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

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="30%" r="75%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function eyes(lx, rx, cy, rxE, ryE, iris, stroke) {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#fffef8" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#fffef8" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="${lx + 0.7}" cy="${cy + 1.1}" rx="${rxE * 0.55}" ry="${ryE * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.7}" cy="${cy + 1.1}" rx="${rxE * 0.55}" ry="${ryE * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.8}" cy="${cy + 1.4}" rx="${rxE * 0.28}" ry="${ryE * 0.32}" fill="#1a1020"/>
${I4}<ellipse cx="${rx + 0.8}" cy="${cy + 1.4}" rx="${rxE * 0.28}" ry="${ryE * 0.32}" fill="#1a1020"/>
${I4}<circle cx="${lx + 2}" cy="${cy - ryE * 0.28}" r="${rxE * 0.3}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${rx + 2}" cy="${cy - ryE * 0.28}" r="${rxE * 0.3}" fill="#fff" opacity="0.95"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 6) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 5} ${50 + span} ${y}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

function wrapStage(stage, label, defs, body) {
  return `${I}<!-- ${CHAR.toUpperCase()} ${stage.toUpperCase()} — ${label} -->
${I}<g id="tm-mascot-${stage}-${CHAR}" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function limbHooks() {
  return `${I3}<g class="tm-animate-arm-left"><circle cx="28" cy="60" r="4" fill="#888"/></g>
${I3}<g class="tm-animate-arm-right"><circle cx="72" cy="60" r="4" fill="#888"/></g>
${I3}<g class="tm-animate-leg-left"><circle cx="40" cy="88" r="3" fill="#666"/></g>
${I3}<g class="tm-animate-leg-right"><circle cx="60" cy="88" r="3" fill="#666"/></g>
${I3}<g class="tm-animate-tail"><circle cx="70" cy="70" r="3" fill="#aaa" opacity="0.6"/></g>
${I3}<g class="tm-animate-wing-left" opacity="0.001"><circle cx="20" cy="50" r="1"/></g>
${I3}<g class="tm-animate-wing-right" opacity="0.001"><circle cx="80" cy="50" r="1"/></g>`;
}

/** Replace these three with real art — keep hooks + eyes-after-body. */
function evo1() {
  const p = `${CHAR}-evo1`;
  const line = '#333';
  const defs = [
    grad(`${p}-body`, [['0%', '#eee'], ['100%', '#999']], 'radial', 'cx="42%" cy="30%" r="70%"'),
    grad(`${p}-iris`, [['0%', '#cff'], ['100%', '#246']], 'radial', 'cx="40%" cy="35%" r="60%"'),
  ].join('\n');
  const body = `${I3}<ellipse cx="50" cy="92" rx="18" ry="3.5" fill="#000" opacity="0.15"/>
${limbHooks()}
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="55" rx="22" ry="24" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.8"/>
${eyes(41, 59, 48, 6.5, 7.5, `url(#${p}-iris)`, line)}
${mouths(64, line)}
${I3}</g>`;
  return wrapStage('evo1', 'Form 1', defs, body);
}

function evo2() {
  const p = `${CHAR}-evo2`;
  const line = '#333';
  const defs = [
    grad(`${p}-body`, [['0%', '#ddd'], ['100%', '#777']], 'radial', 'cx="42%" cy="28%" r="72%"'),
    grad(`${p}-iris`, [['0%', '#cff'], ['100%', '#246']], 'radial', 'cx="40%" cy="35%" r="60%"'),
  ].join('\n');
  const body = `${I3}<ellipse cx="50" cy="94" rx="20" ry="3.5" fill="#000" opacity="0.16"/>
${limbHooks()}
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="52" rx="24" ry="28" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.8"/>
${eyes(41, 59, 44, 6.8, 7.8, `url(#${p}-iris)`, line)}
${mouths(60, line, 7)}
${I3}</g>`;
  return wrapStage('evo2', 'Form 2', defs, body);
}

function evo3() {
  const p = `${CHAR}-evo3`;
  const line = '#222';
  const defs = [
    grad(`${p}-body`, [['0%', '#ccc'], ['100%', '#555']], 'radial', 'cx="40%" cy="24%" r="75%"'),
    grad(`${p}-iris`, [['0%', '#ffe082'], ['100%', '#e65100']], 'radial', 'cx="38%" cy="32%" r="60%"'),
  ].join('\n');
  const body = `${I3}<ellipse cx="50" cy="96" rx="22" ry="3.5" fill="#000" opacity="0.18"/>
${limbHooks()}
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="50" rx="26" ry="30" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.9"/>
${eyes(41, 59, 40, 6.5, 7.2, `url(#${p}-iris)`, line)}
${mouths(56, line, 8)}
${I3}</g>`;
  return wrapStage('evo3', 'Form 3', defs, body);
}

export const mascotSvg = [
  `${I}<!-- ${CHAR.toUpperCase()} CHARACTER - All Life Stages (${TITLE}) -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  evo1(),
  evo2(),
  evo3(),
].join('\n');

// Alias expected by some apply scripts: export const foxSvg = mascotSvg;
export const templateSvg = mascotSvg;

const isMain = process.argv[1] && /svg-[^/\\]+\.mjs$/i.test(process.argv[1].replace(/\\/g, '/'));

if (isMain) {
  if (CHAR === 'CHANGEME' || END_MARKER.includes('NEXT_CHARACTER')) {
    console.error('Set CHAR and END_MARKER (real next character comment) before applying.');
    process.exit(1);
  }

  const path = 'myman_mascot.js';
  let src = fs.readFileSync(path, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';
  const normalize = (svg) => {
    let s = String(svg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
    if (!s.endsWith(nl)) s += nl;
    return s;
  };

  const start = src.indexOf(START_MARKER);
  const end = src.indexOf(END_MARKER);
  if (start < 0 || end < 0 || end <= start) {
    console.error('Markers not found. For a NEW character, insert the marker block in myman_mascot.js first.');
    console.error({ START_MARKER, END_MARKER, start, end });
    process.exit(1);
  }

  const block = normalize(mascotSvg);
  src = src.slice(0, start) + block + src.slice(end);

  const issues = [];
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-${CHAR}`;
    const idx = src.indexOf(`id="${id}"`);
    if (idx < 0) { issues.push(`missing ${id}`); continue; }
    const next = src.indexOf('id="tm-mascot-', idx + 12);
    const chunk = src.slice(idx, next > 0 ? next : idx + 20000);
    for (const h of HOOKS) {
      if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
    }
  }
  if (issues.length) {
    console.error('VALIDATION FAILED', issues);
    process.exit(1);
  }

  fs.writeFileSync(path, src);
  console.log('OK wrote', path);
  await import('./preview-mascots.mjs');
}
