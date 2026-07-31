/**
 * Bloomkin — PLANT mascot sprites v4 (3 evolutions)
 *
 * Clean cute-epic redesign: readable silhouettes, face always ON TOP of head,
 * no pot clutter / overlapping canopy mush.
 *
 *   evo1 — Seedling: round seed-body, leaf-hair tufts, root nubs
 *   evo2 — Bloomkin: pear leafy biped with daisy petal collar
 *   evo3 — Grovekin: stout bark trunk, moss cloak, amber heart, canopy cape
 *
 * Run: node scripts/svg-plant.mjs
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

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="30%" r="75%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function eyes(lx, rx, cy, rxE, ryE, iris, stroke, opts = {}) {
  const white = opts.white ?? '#fffef5';
  const pupil = opts.pupil ?? '#14240c';
  const sw = opts.sw ?? 1.45;
  const closedSw = opts.closedSw ?? 2.3;
  const hi = opts.hi ?? rxE * 0.3;
  const hi2 = opts.hi2 ?? rxE * 0.12;
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${white}" stroke="${stroke}" stroke-width="${sw}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${white}" stroke="${stroke}" stroke-width="${sw}"/>
${I4}<ellipse cx="${lx + 0.7}" cy="${cy + 1.2}" rx="${rxE * 0.55}" ry="${ryE * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.7}" cy="${cy + 1.2}" rx="${rxE * 0.55}" ry="${ryE * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.8}" cy="${cy + 1.5}" rx="${rxE * 0.28}" ry="${ryE * 0.32}" fill="${pupil}"/>
${I4}<ellipse cx="${rx + 0.8}" cy="${cy + 1.5}" rx="${rxE * 0.28}" ry="${ryE * 0.32}" fill="${pupil}"/>
${I4}<circle cx="${lx + 2.1}" cy="${cy - ryE * 0.28}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${rx + 2.1}" cy="${cy - ryE * 0.28}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${lx - 0.9}" cy="${cy + ryE * 0.3}" r="${hi2}" fill="#fff" opacity="0.45"/>
${I4}<circle cx="${rx - 0.9}" cy="${cy + ryE * 0.3}" r="${hi2}" fill="#fff" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy + 0.5} Q ${lx} ${cy - ryE * 0.4} ${lx + rxE} ${cy + 0.5}" stroke="${stroke}" stroke-width="${closedSw}" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy + 0.5} Q ${rx} ${cy - ryE * 0.4} ${rx + rxE} ${cy + 0.5}" stroke="${stroke}" stroke-width="${closedSw}" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 7, sw = 2, dip = 5) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + dip} ${50 + span} ${y}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
}

function blush(lx, rx, cy, id, r = 3.8) {
  return `${I3}<circle cx="${lx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
${I3}<circle cx="${rx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

function shadow(cy = 92, rx = 22, op = 0.2) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="4.5" fill="#1a1a1a" opacity="${op}"/>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- PLANT ${stage.toUpperCase()} — ${title} -->
${I}<g id="tm-mascot-${stage}-plant" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/* ── EVO1: Seedling — chubby seed with leaf hair ── */
function evo1() {
  const p = 'plant-evo1';
  const line = '#2e5a1c';
  const defs = [
    grad(`${p}-body`, [['0%', '#e8ffb0'], ['35%', '#9ccc65'], ['70%', '#558b2f'], ['100%', '#33691e']], 'radial', 'cx="42%" cy="32%" r="70%"'),
    grad(`${p}-belly`, [['0%', '#fffde7'], ['60%', '#f0f4c3'], ['100%', '#c5e1a5']], 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(`${p}-leaf`, [['0%', '#d4ff9a'], ['45%', '#7cb342'], ['100%', '#33691e']], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-leaf-dark`, [['0%', '#8bc34a'], ['100%', '#1b5e20']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-iris`, [['0%', '#c6ff00'], ['50%', '#689f38'], ['100%', '#1b3309']], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-cheek`, [['0%', '#ff8a80', 0.55], ['100%', '#ff8a80', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-root`, [['0%', '#a1887f'], ['100%', '#4e342e']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.45], ['100%', '#ffffff', 0]], 'radial', 'cx="30%" cy="25%" r="45%"'),
  ].join('\n');

  const body = `${shadow(90, 20, 0.18)}
${I3}<!-- Leaf-bud tail -->
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 70 Q 72 74 74 66 Q 75 60 70 61" fill="url(#${p}-leaf-dark)" stroke="${line}" stroke-width="1.2"/>
${I4}<ellipse cx="72" cy="62" rx="3.2" ry="4.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="0.9" transform="rotate(18 72 62)"/>
${I3}</g>
${I3}<!-- Soft leaf nubs as wings -->
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="28" cy="58" rx="5" ry="7.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1.1" transform="rotate(-28 28 58)" opacity="0.9"/>
${I4}<path d="M 27 54 Q 25 58 27 62" stroke="#1b5e20" stroke-width="0.6" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="72" cy="58" rx="5" ry="7.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1.1" transform="rotate(28 72 58)" opacity="0.9"/>
${I4}<path d="M 73 54 Q 75 58 73 62" stroke="#1b5e20" stroke-width="0.6" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 62 Q 24 60 20 54" fill="none" stroke="#558b2f" stroke-width="2.6" stroke-linecap="round"/>
${I4}<ellipse cx="19" cy="52" rx="4.2" ry="5.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1" transform="rotate(-40 19 52)"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 62 Q 76 60 80 54" fill="none" stroke="#558b2f" stroke-width="2.6" stroke-linecap="round"/>
${I4}<ellipse cx="81" cy="52" rx="4.2" ry="5.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1" transform="rotate(40 81 52)"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 78 Q 38 86 36 90" stroke="url(#${p}-root)" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="35" cy="91" rx="4" ry="2" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 78 Q 62 86 64 90" stroke="url(#${p}-root)" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="65" cy="91" rx="4" ry="2" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Round seed body = head+torso -->
${I4}<ellipse cx="50" cy="56" rx="22" ry="24" fill="url(#${p}-body)" stroke="${line}" stroke-width="2"/>
${I4}<ellipse cx="50" cy="62" rx="13" ry="12" fill="url(#${p}-belly)" opacity="0.95"/>
${I4}<ellipse cx="40" cy="44" rx="8" ry="5.5" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="42" cy="42" rx="2.8" ry="1.5" fill="#fff" opacity="0.55"/>
${I4}<!-- Speckles -->
${I4}<circle cx="38" cy="58" r="1.2" fill="#33691e" opacity="0.22"/>
${I4}<circle cx="60" cy="54" r="1" fill="#33691e" opacity="0.2"/>
${I4}<circle cx="54" cy="68" r="0.9" fill="#33691e" opacity="0.18"/>
${I4}<!-- Leaf-hair tufts (behind face layer, still above body) -->
${I4}<ellipse cx="50" cy="30" rx="5" ry="9" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1.1"/>
${I4}<ellipse cx="40" cy="34" rx="4.2" ry="7.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1" transform="rotate(-32 40 34)"/>
${I4}<ellipse cx="60" cy="34" rx="4.2" ry="7.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1" transform="rotate(32 60 34)"/>
${I4}<path d="M 50 24 Q 50 18 50 14" stroke="#1b5e20" stroke-width="0.7" fill="none" opacity="0.4"/>
${blush(34, 66, 60, `${p}-cheek`, 3.6)}
${eyes(41, 59, 52, 7.2, 8.6, `url(#${p}-iris)`, line)}
${mouths(66, line, 6.5, 2, 4.5)}
${I3}</g>`;

  return wrapStage('evo1', 'Seedling', defs, body);
}

/* ── EVO2: Bloomkin — flower-collared leafy biped ── */
function evo2() {
  const p = 'plant-evo2';
  const line = '#1b5e20';
  const petal = '#f48fb1';
  const petalDeep = '#ec407a';
  const defs = [
    grad(`${p}-body`, [['0%', '#c8e6c9'], ['40%', '#66bb6a'], ['100%', '#2e7d32']], 'radial', 'cx="45%" cy="30%" r="72%"'),
    grad(`${p}-belly`, [['0%', '#fff8e1'], ['100%', '#ffe082']], 'radial', 'cx="50%" cy="40%" r="55%"'),
    grad(`${p}-leaf`, [['0%', '#b9f6ca'], ['40%', '#66bb6a'], ['100%', '#1b5e20']], 'linear', 'x1="0%" y1="0%" x2="80%" y2="100%"'),
    grad(`${p}-stem`, [['0%', '#a5d6a7'], ['100%', '#33691e']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-iris`, [['0%', '#ffecb3'], ['40%', '#ffb300'], ['100%', '#e65100']], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-cheek`, [['0%', '#ff80ab', 0.5], ['100%', '#ff80ab', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-petal`, [['0%', '#fff'], ['35%', '#f8bbd0'], ['100%', '#ec407a']], 'radial', 'cx="40%" cy="30%" r="70%"'),
    grad(`${p}-center`, [['0%', '#fffde7'], ['55%', '#ffd54f'], ['100%', '#f9a825']], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-root`, [['0%', '#8d6e63'], ['100%', '#3e2723']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(94, 24, 0.2)}
${I3}<!-- Bloom tip tail -->
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 72 Q 78 78 80 68 Q 81 62 74 63" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1.3"/>
${I4}<circle cx="78" cy="64" r="3.4" fill="url(#${p}-center)" stroke="${petalDeep}" stroke-width="0.8"/>
${I4}<circle cx="77.2" cy="63.2" r="1.1" fill="#fff" opacity="0.55"/>
${I3}</g>
${I3}<!-- Petal cape wings -->
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="24" cy="52" rx="7" ry="12" fill="url(#${p}-petal)" stroke="${petalDeep}" stroke-width="1.2" transform="rotate(-30 24 52)"/>
${I4}<path d="M 22 44 Q 20 52 22 58" stroke="${petalDeep}" stroke-width="0.7" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="76" cy="52" rx="7" ry="12" fill="url(#${p}-petal)" stroke="${petalDeep}" stroke-width="1.2" transform="rotate(30 76 52)"/>
${I4}<path d="M 78 44 Q 80 52 78 58" stroke="${petalDeep}" stroke-width="0.7" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 38 58 Q 26 56 20 48" fill="none" stroke="url(#${p}-stem)" stroke-width="3.2" stroke-linecap="round"/>
${I4}<ellipse cx="18" cy="46" rx="5" ry="6.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1.1" transform="rotate(-25 18 46)"/>
${I4}<circle cx="16" cy="42" r="1.6" fill="${petal}" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 62 58 Q 74 56 80 48" fill="none" stroke="url(#${p}-stem)" stroke-width="3.2" stroke-linecap="round"/>
${I4}<ellipse cx="82" cy="46" rx="5" ry="6.5" fill="url(#${p}-leaf)" stroke="${line}" stroke-width="1.1" transform="rotate(25 82 46)"/>
${I4}<circle cx="84" cy="42" r="1.6" fill="${petal}" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 43 80 Q 38 88 36 94" stroke="url(#${p}-root)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="35" cy="95" rx="4.5" ry="2.2" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 57 80 Q 62 88 64 94" stroke="url(#${p}-root)" stroke-width="3.4" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="65" cy="95" rx="4.5" ry="2.2" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Pear leafy torso -->
${I4}<path d="M 36 78 Q 32 58 38 44 Q 50 34 62 44 Q 68 58 64 78 Q 58 86 50 88 Q 42 86 36 78 Z"
${I4}      fill="url(#${p}-body)" stroke="${line}" stroke-width="2"/>
${I4}<ellipse cx="50" cy="68" rx="11" ry="12" fill="url(#${p}-belly)" opacity="0.92"/>
${I4}<ellipse cx="42" cy="50" rx="6" ry="4" fill="#fff" opacity="0.18"/>
${I4}<!-- Daisy petal collar around head -->
${I4}<ellipse cx="50" cy="22" rx="5.5" ry="9" fill="url(#${p}-petal)" stroke="${petalDeep}" stroke-width="1"/>
${I4}<ellipse cx="36" cy="28" rx="5" ry="8.5" fill="url(#${p}-petal)" stroke="${petalDeep}" stroke-width="1" transform="rotate(-40 36 28)"/>
${I4}<ellipse cx="64" cy="28" rx="5" ry="8.5" fill="url(#${p}-petal)" stroke="${petalDeep}" stroke-width="1" transform="rotate(40 64 28)"/>
${I4}<ellipse cx="40" cy="20" rx="4.5" ry="7.5" fill="#fce4ec" stroke="${petalDeep}" stroke-width="0.9" transform="rotate(-18 40 20)"/>
${I4}<ellipse cx="60" cy="20" rx="4.5" ry="7.5" fill="#fce4ec" stroke="${petalDeep}" stroke-width="0.9" transform="rotate(18 60 20)"/>
${I4}<!-- Round flower face disc -->
${I4}<circle cx="50" cy="36" r="14" fill="url(#${p}-center)" stroke="#f9a825" stroke-width="1.6"/>
${I4}<circle cx="50" cy="36" r="14" fill="none" stroke="#fffde7" stroke-width="0.7" opacity="0.5"/>
${I4}<ellipse cx="44" cy="30" rx="5" ry="3.2" fill="#fff" opacity="0.35"/>
${blush(36, 64, 42, `${p}-cheek`, 3.4)}
${eyes(43, 57, 34, 5.8, 6.8, `url(#${p}-iris)`, '#bf360c', { white: '#fffef8', sw: 1.3 })}
${mouths(46, '#bf360c', 6, 1.9, 4)}
${I3}</g>`;

  return wrapStage('evo2', 'Bloomkin', defs, body);
}

/* ── EVO3: Grovekin — bark guardian with canopy cape ── */
function evo3() {
  const p = 'plant-evo3';
  const line = '#3e2723';
  const leafLine = '#1b5e20';
  const defs = [
    grad(`${p}-bark`, [['0%', '#bcaaa4'], ['35%', '#8d6e63'], ['70%', '#5d4037'], ['100%', '#3e2723']], 'linear', 'x1="20%" y1="0%" x2="80%" y2="100%"'),
    grad(`${p}-bark-hi`, [['0%', '#d7ccc8'], ['100%', '#6d4c41']], 'radial', 'cx="35%" cy="28%" r="65%"'),
    grad(`${p}-leaf`, [['0%', '#dcedc8'], ['40%', '#7cb342'], ['100%', '#33691e']], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-moss`, [['0%', '#aed581', 0.9], ['100%', '#558b2f', 0.7]], 'radial', 'cx="50%" cy="40%" r="55%"'),
    grad(`${p}-amber`, [['0%', '#fff8e1'], ['40%', '#ffb300', 0.95], ['100%', '#e65100', 0.2]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ffe082'], ['45%', '#ff8f00'], ['100%', '#4e342e']], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-cheek`, [['0%', '#ffab91', 0.45], ['100%', '#ffab91', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-wing`, [['0%', '#c5e1a5', 0.95], ['100%', '#33691e', 0.7]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-aura`, [['0%', '#aed581', 0.2], ['100%', '#aed581', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(97, 28, 0.24)}
${I3}<ellipse cx="50" cy="58" rx="36" ry="34" fill="url(#${p}-aura)" opacity="0.7"/>
${I3}<!-- Vine tail with amber tip -->
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 78 Q 82 84 86 74 Q 88 68 80 68" fill="url(#${p}-bark)" stroke="${line}" stroke-width="1.5"/>
${I4}<circle cx="84" cy="70" r="3.6" fill="url(#${p}-amber)"/>
${I4}<circle cx="83" cy="69" r="1.2" fill="#fffde7" opacity="0.7"/>
${I3}</g>
${I3}<!-- Broad leaf cape wings -->
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 56 Q 12 46 8 30 Q 6 20 16 22 Q 24 34 30 48 Z"
${I4}      fill="url(#${p}-wing)" stroke="${leafLine}" stroke-width="1.6"/>
${I4}<path d="M 14 28 Q 18 38 26 48" stroke="${leafLine}" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<path d="M 18 32 Q 22 42 28 52" stroke="${leafLine}" stroke-width="0.7" fill="none" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 56 Q 88 46 92 30 Q 94 20 84 22 Q 76 34 70 48 Z"
${I4}      fill="url(#${p}-wing)" stroke="${leafLine}" stroke-width="1.6"/>
${I4}<path d="M 86 28 Q 82 38 74 48" stroke="${leafLine}" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<path d="M 82 32 Q 78 42 72 52" stroke="${leafLine}" stroke-width="0.7" fill="none" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="62" rx="7" ry="11" fill="url(#${p}-bark)" stroke="${line}" stroke-width="1.5"/>
${I4}<ellipse cx="22" cy="56" rx="2.5" ry="1.8" fill="#d7ccc8" opacity="0.35"/>
${I4}<ellipse cx="20" cy="72" rx="5.5" ry="6.5" fill="url(#${p}-leaf)" stroke="${leafLine}" stroke-width="1.2"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="62" rx="7" ry="11" fill="url(#${p}-bark)" stroke="${line}" stroke-width="1.5"/>
${I4}<ellipse cx="78" cy="56" rx="2.5" ry="1.8" fill="#d7ccc8" opacity="0.35"/>
${I4}<ellipse cx="80" cy="72" rx="5.5" ry="6.5" fill="url(#${p}-leaf)" stroke="${leafLine}" stroke-width="1.2"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 88 Q 34 96 32 100" stroke="url(#${p}-bark)" stroke-width="4" fill="none" stroke-linecap="round"/>
${I4}<path d="M 46 89 Q 40 98 42 102" stroke="#4e342e" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="32" cy="101" rx="5" ry="2.4" fill="#2c1810"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 88 Q 66 96 68 100" stroke="url(#${p}-bark)" stroke-width="4" fill="none" stroke-linecap="round"/>
${I4}<path d="M 54 89 Q 60 98 58 102" stroke="#4e342e" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="68" cy="101" rx="5" ry="2.4" fill="#2c1810"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Stout trunk -->
${I4}<path d="M 36 90 Q 34 62 38 46 Q 50 38 62 46 Q 66 62 64 90 Q 58 94 50 95 Q 42 94 36 90 Z"
${I4}      fill="url(#${p}-bark)" stroke="${line}" stroke-width="2"/>
${I4}<ellipse cx="42" cy="54" rx="6" ry="4" fill="url(#${p}-bark-hi)" opacity="0.55"/>
${I4}<!-- Bark grooves -->
${I4}<path d="M 42 52 Q 44 62 43 72" stroke="#3e2723" stroke-width="1.1" fill="none" opacity="0.4"/>
${I4}<path d="M 56 54 Q 55 66 56 76" stroke="#3e2723" stroke-width="1" fill="none" opacity="0.38"/>
${I4}<path d="M 48 50 Q 50 58 49 66" stroke="#4e342e" stroke-width="0.85" fill="none" opacity="0.32"/>
${I4}<!-- Moss patches -->
${I4}<ellipse cx="38" cy="70" rx="5" ry="3" fill="url(#${p}-moss)" transform="rotate(-12 38 70)"/>
${I4}<ellipse cx="60" cy="66" rx="4.5" ry="2.8" fill="url(#${p}-moss)" transform="rotate(14 60 66)"/>
${I4}<!-- Amber heart glow -->
${I4}<ellipse cx="50" cy="68" rx="7" ry="8" fill="url(#${p}-amber)"/>
${I4}<ellipse cx="50" cy="68" rx="3.5" ry="4" fill="#fff8e1" opacity="0.55"/>
${I4}<!-- Canopy hair behind face -->
${I4}<ellipse cx="50" cy="24" rx="20" ry="15" fill="url(#${p}-leaf)" stroke="${leafLine}" stroke-width="1.8"/>
${I4}<ellipse cx="36" cy="28" rx="8" ry="11" fill="url(#${p}-leaf)" stroke="${leafLine}" stroke-width="1" transform="rotate(-22 36 28)"/>
${I4}<ellipse cx="64" cy="28" rx="8" ry="11" fill="url(#${p}-leaf)" stroke="${leafLine}" stroke-width="1" transform="rotate(22 64 28)"/>
${I4}<ellipse cx="50" cy="14" rx="7" ry="9" fill="#558b2f" stroke="${leafLine}" stroke-width="0.9"/>
${I4}<ellipse cx="42" cy="18" rx="5" ry="3" fill="#fff" opacity="0.14"/>
${I4}<!-- Clear bark face plate ON TOP of canopy -->
${I4}<ellipse cx="50" cy="36" rx="13" ry="11" fill="url(#${p}-bark-hi)" stroke="${line}" stroke-width="1.4"/>
${I4}<path d="M 42 34 Q 50 32 58 34" stroke="#5d4037" stroke-width="0.75" fill="none" opacity="0.4"/>
${blush(38, 62, 42, `${p}-cheek`, 3.2)}
${eyes(43, 57, 35, 5.6, 6.4, `url(#${p}-iris)`, line, { white: '#fff8e1', sw: 1.35 })}
${mouths(44, line, 6.5, 1.9, 3.8)}
${I3}</g>`;

  return wrapStage('evo3', 'Grovekin', defs, body);
}

export const plantSvg = [
  `${I}<!-- PLANT CHARACTER - All Life Stages (Bloomkin v4 · 3-stage) -->`,
  `${I}<!-- Wildwood & Life • Rare Rarity • Seedling → Bloomkin → Grovekin -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  evo1(),
  evo2(),
  evo3(),
].join('\n');

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-plant.mjs');

if (isMain) {
  const path = 'myman_mascot.js';
  let src = fs.readFileSync(path, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';

  function normalize(svg) {
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

  src = replaceBetween(
    src,
    '                <!-- PLANT CHARACTER',
    '                <!-- GHOST CHARACTER',
    normalize(plantSvg),
  );

  const issues = [];
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-plant`;
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

  // Refresh unified mascot preview
  await import('./preview-mascots.mjs');
}
