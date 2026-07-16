/**
 * Worldroot Warden — PLANT mascot sprites (dense cute epic v3).
 * Dragon-quality eyes, limb wrapping, and detail density.
 * Patches myman_mascot.js between PLANT and GHOST markers (CRLF-safe).
 */
import fs from 'fs';

const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};
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

/** Dragon-style cartoony eyes — white sclera, iris gradient, pupil, dual highlights */
function dragonEyes(lx, rx, cy, rxE, ryE, iris, stroke, opts = {}) {
  const white = opts.white ?? '#fff';
  const pupil = opts.pupil ?? '#0d1a08';
  const hi = opts.hi ?? rxE * 0.32;
  const hi2 = opts.hi2 ?? rxE * 0.13;
  const sw = opts.sw ?? 1.4;
  const closedSw = opts.closedSw ?? 2.4;
  const irisRx = rxE * 0.56;
  const irisRy = ryE * 0.59;
  const pupRx = rxE * 0.29;
  const pupRy = ryE * 0.33;
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${white}" stroke="${stroke}" stroke-width="${sw}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${white}" stroke="${stroke}" stroke-width="${sw}"/>
${I4}<ellipse cx="${lx + 1}" cy="${cy + 1.5}" rx="${irisRx}" ry="${irisRy}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 1}" cy="${cy + 1.5}" rx="${irisRx}" ry="${irisRy}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 1}" cy="${cy + 1.8}" rx="${pupRx}" ry="${pupRy}" fill="${pupil}"/>
${I4}<ellipse cx="${rx + 1}" cy="${cy + 1.8}" rx="${pupRx}" ry="${pupRy}" fill="${pupil}"/>
${I4}<circle cx="${lx + 2.5}" cy="${cy - ryE * 0.22}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${rx + 2.5}" cy="${cy - ryE * 0.22}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${lx - 0.8}" cy="${cy + ryE * 0.33}" r="${hi2}" fill="#fff" opacity="0.5"/>
${I4}<circle cx="${rx - 0.8}" cy="${cy + ryE * 0.33}" r="${hi2}" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy + 1} Q ${lx} ${cy - ryE * 0.35} ${lx + rxE} ${cy + 1}" stroke="${stroke}" stroke-width="${closedSw}" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy + 1} Q ${rx} ${cy - ryE * 0.35} ${rx + rxE} ${cy + 1}" stroke="${stroke}" stroke-width="${closedSw}" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 7, sw = 2) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 5.5} ${50 + span} ${y}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
}

function shadow(cy = 90, rx = 26, op = 0.18) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="5" fill="#1a1a1a" opacity="${op}"/>`;
}

function blush(lx, rx, cy, r = 4, id = 'plant-cheek') {
  return `${I3}<circle cx="${lx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
${I3}<circle cx="${rx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- PLANT ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-plant" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function prefix(stage) {
  return `plant-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
}

function commonDefs(p, stage) {
  const leaf = stage === 'evo5'
    ? [['0%', '#dce775'], ['35%', '#7cb342'], ['70%', '#558b2f'], ['100%', '#1b5e20']]
    : stage === 'evo2'
      ? [['0%', '#c5e1a5'], ['30%', '#81c784'], ['65%', '#43a047'], ['100%', '#2e7d32']]
      : [['0%', '#d4ff9a'], ['35%', '#8bc34a'], ['70%', '#558b2f'], ['100%', '#33691e']];
  const bark = stage === 'evo4' || stage === 'evo5'
    ? [['0%', '#a1887f'], ['40%', '#6d4c41'], ['100%', '#3e2723']]
    : [['0%', '#bcaaa4'], ['45%', '#795548'], ['100%', '#4e342e']];
  const bloom = stage === 'evo2' ? '#f48fb1' : stage === 'evo5' ? '#ffd54f' : '#aed581';
  return [
    grad(`${p}-leaf`, leaf, 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-leaf-dark`, [['0%', '#689f38'], ['100%', '#33691e']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-bark`, bark, 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-bark-shade`, [['0%', '#5d4037'], ['100%', '#3e2723']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-bulb`, [['0%', '#fffde7'], ['50%', '#c5e1a5'], ['100%', '#7cb342']], 'radial', 'cx="45%" cy="35%" r="65%"'),
    grad(`${p}-iris`, [['0%', '#aed581'], ['45%', '#558b2f'], ['100%', '#1b2e12']], 'radial', 'cx="40%" cy="35%" r="60%"'),
    grad(`${p}-cheek`, [['0%', '#ff8a9b', 0.55], ['100%', '#ff8a9b', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-bloom`, [['0%', '#fff59d'], ['50%', bloom], ['100%', '#e91e63', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-amber`, [['0%', '#fff8e1'], ['40%', '#ffb300', 0.85], ['100%', '#ff6f00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#76ff03', 0.22], ['55%', '#aed581', 0.12], ['100%', '#76ff03', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-wing`, [['0%', '#e8f5e9', 0.9], ['100%', '#66bb6a', 0.55]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-sap`, [['0%', '#fffde7'], ['50%', '#ffd54f'], ['100%', '#ff8f00']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\n');
}

/* ── BABY: sprout in cracked pot ── */
function babyStage() {
  const p = prefix('baby');
  const defs = commonDefs(p, 'baby');
  const body = `${shadow(90, 26)}
${I3}<!-- Vine nub tail -->
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 72 Q 74 76 78 70 Q 80 64 76 62 Q 72 60 70 64"
${I4}      fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1.4"/>
${I4}<path d="M 72 66 Q 76 64 78 68" fill="none" stroke="#aed581" stroke-width="0.7" opacity="0.65"/>
${I4}<ellipse cx="77" cy="63" rx="2.5" ry="3.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.8" transform="rotate(20 77 63)"/>
${I3}</g>
${I3}<!-- Cotyledon wing nubs -->
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="28" cy="56" rx="5.5" ry="8" fill="url(#${p}-wing)" stroke="#558b2f" stroke-width="1.1" transform="rotate(-22 28 56)"/>
${I4}<path d="M 26 52 Q 24 56 26 60" stroke="#33691e" stroke-width="0.7" fill="none" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="72" cy="56" rx="5.5" ry="8" fill="url(#${p}-wing)" stroke="#558b2f" stroke-width="1.1" transform="rotate(22 72 56)"/>
${I4}<path d="M 74 52 Q 76 56 74 60" stroke="#33691e" stroke-width="0.7" fill="none" opacity="0.55"/>
${I3}</g>
${I3}<!-- Cracked pot + stem -->
${I3}<g class="tm-animate-body">
${I4}<path d="M 32 78 L 36 92 L 64 92 L 68 78 Z" fill="url(#${p}-bark)" stroke="#3e2723" stroke-width="1.8"/>
${I4}<ellipse cx="50" cy="78" rx="18" ry="4.5" fill="#6d4c41" stroke="#4e342e" stroke-width="0.8"/>
${I4}<ellipse cx="50" cy="76" rx="15" ry="3" fill="#5d4037"/>
${I4}<!-- Cracks -->
${I4}<path d="M 38 80 L 42 88 M 44 79 L 46 90 M 56 79 L 54 91 M 62 81 L 58 89" stroke="#3e2723" stroke-width="1.1" stroke-linecap="round" opacity="0.65"/>
${I4}<path d="M 40 84 Q 44 86 48 84" stroke="#8d6e63" stroke-width="0.7" fill="none" opacity="0.4"/>
${I4}<!-- Soil -->
${I4}<ellipse cx="50" cy="77" rx="14" ry="2.5" fill="#4e342e"/>
${I4}<circle cx="44" cy="76" r="1.2" fill="#3e2723" opacity="0.45"/>
${I4}<circle cx="56" cy="76.5" r="1" fill="#3e2723" opacity="0.4"/>
${I4}<!-- Tiny stem -->
${I4}<rect x="47" y="62" width="6" ry="1" height="16" rx="2" fill="url(#${p}-bark-shade)" stroke="#4e342e" stroke-width="0.9"/>
${I4}<path d="M 48 68 Q 50 69 52 68" stroke="#5d4037" stroke-width="0.6" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<!-- Tiny leaf arms -->
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 66 Q 22 64 18 58 Q 16 54 20 54" fill="none" stroke="#558b2f" stroke-width="2.8" stroke-linecap="round"/>
${I4}<ellipse cx="18" cy="55" rx="4.5" ry="6" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(-35 18 55)"/>
${I4}<path d="M 17 52 Q 18 56 17 59" stroke="#2e7d32" stroke-width="0.6" fill="none" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 66 Q 78 64 82 58 Q 84 54 80 54" fill="none" stroke="#558b2f" stroke-width="2.8" stroke-linecap="round"/>
${I4}<ellipse cx="82" cy="55" rx="4.5" ry="6" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(35 82 55)"/>
${I4}<path d="M 83 52 Q 82 56 83 59" stroke="#2e7d32" stroke-width="0.6" fill="none" opacity="0.55"/>
${I3}</g>
${I3}<!-- Root feet -->
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 90 Q 34 94 32 98 Q 30 100 34 99" stroke="url(#${p}-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
${I4}<path d="M 44 91 Q 40 96 42 99" stroke="url(#${p}-bark-shade)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="33" cy="99" rx="3.5" ry="1.8" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 90 Q 66 94 68 98 Q 70 100 66 99" stroke="url(#${p}-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
${I4}<path d="M 56 91 Q 60 96 58 99" stroke="url(#${p}-bark-shade)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="67" cy="99" rx="3.5" ry="1.8" fill="#3e2723"/>
${I3}</g>
${I3}<!-- Bulb head (oversized) -->
${I3}<ellipse cx="50" cy="40" rx="20" ry="18" fill="url(#${p}-bulb)" stroke="#558b2f" stroke-width="2"/>
${I3}<ellipse cx="42" cy="33" rx="7" ry="4.5" fill="#fff" opacity="0.22"/>
${I3}<!-- Sprout tuft -->
${I3}<ellipse cx="50" cy="22" rx="4" ry="7" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9"/>
${I3}<ellipse cx="42" cy="26" rx="3.5" ry="5.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.8" transform="rotate(-25 42 26)"/>
${I3}<ellipse cx="58" cy="26" rx="3.5" ry="5.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.8" transform="rotate(25 58 26)"/>
${I3}<circle cx="38" cy="44" r="1.3" fill="#33691e" opacity="0.25"/>
${I3}<circle cx="62" cy="46" r="1.3" fill="#33691e" opacity="0.25"/>
${I3}<circle cx="46" cy="52" r="1.1" fill="#33691e" opacity="0.2"/>
${blush(34, 66, 46, 4, `${p}-cheek`)}
${dragonEyes(40, 60, 38, 7.5, 9.2, `url(#${p}-iris)`, '#558b2f')}
${mouths(50, '#33691e', 7)}`;

  return wrapStage('baby', 'sprout ward', defs, body);
}

/* ── KID: taller sapling ── */
function kidStage() {
  const p = prefix('evo1');
  const defs = commonDefs(p, 'evo1');
  const body = `${shadow(92, 28)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 68 Q 82 74 86 64 Q 88 56 80 54 Q 74 52 72 58"
${I4}      fill="none" stroke="#558b2f" stroke-width="3" stroke-linecap="round"/>
${I4}<path d="M 72 60 Q 78 58 82 62" fill="none" stroke="#aed581" stroke-width="0.8" opacity="0.55"/>
${I4}<ellipse cx="84" cy="58" rx="3" ry="4.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(15 84 58)"/>
${I4}<ellipse cx="80" cy="64" rx="2.5" ry="3.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.7" transform="rotate(-10 80 64)"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 50 Q 16 42 14 32 Q 13 26 18 28 Q 24 38 30 48 Z"
${I4}      fill="url(#${p}-wing)" stroke="#558b2f" stroke-width="1.3"/>
${I4}<path d="M 20 32 Q 22 38 26 44" stroke="#33691e" stroke-width="0.75" fill="none" opacity="0.5"/>
${I4}<path d="M 24 34 Q 26 40 29 46" stroke="#33691e" stroke-width="0.65" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 50 Q 84 42 86 32 Q 87 26 82 28 Q 76 38 70 48 Z"
${I4}      fill="url(#${p}-wing)" stroke="#558b2f" stroke-width="1.3"/>
${I4}<path d="M 80 32 Q 78 38 74 44" stroke="#33691e" stroke-width="0.75" fill="none" opacity="0.5"/>
${I4}<path d="M 76 34 Q 74 40 71 46" stroke="#33691e" stroke-width="0.65" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Taller sapling trunk -->
${I4}<path d="M 44 88 L 42 52 Q 50 46 58 52 L 56 88 Z" fill="url(#${p}-bark)" stroke="#4e342e" stroke-width="1.6"/>
${I4}<path d="M 46 60 Q 50 62 54 60" stroke="#3e2723" stroke-width="0.8" fill="none" opacity="0.45"/>
${I4}<path d="M 45 72 Q 50 74 55 72" stroke="#3e2723" stroke-width="0.75" fill="none" opacity="0.4"/>
${I4}<path d="M 46 82 Q 50 84 54 82" stroke="#3e2723" stroke-width="0.7" fill="none" opacity="0.35"/>
${I4}<!-- Canopy puff -->
${I4}<ellipse cx="50" cy="38" rx="18" ry="16" fill="url(#${p}-leaf)" stroke="#558b2f" stroke-width="1.8"/>
${I4}<ellipse cx="42" cy="32" rx="7" ry="4" fill="#fff" opacity="0.18"/>
${I4}<ellipse cx="36" cy="36" rx="7" ry="10" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(-28 36 36)"/>
${I4}<ellipse cx="64" cy="36" rx="7" ry="10" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(28 64 36)"/>
${I4}<ellipse cx="50" cy="26" rx="6" ry="9" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9"/>
${I4}<!-- Freckle dots -->
${I4}<circle cx="40" cy="40" r="1.1" fill="#33691e" opacity="0.35"/>
${I4}<circle cx="48" cy="36" r="0.9" fill="#33691e" opacity="0.3"/>
${I4}<circle cx="56" cy="39" r="1" fill="#33691e" opacity="0.32"/>
${I4}<circle cx="44" cy="44" r="0.8" fill="#33691e" opacity="0.28"/>
${I4}<circle cx="58" cy="43" r="0.85" fill="#33691e" opacity="0.28"/>
${I4}<circle cx="52" cy="48" r="0.9" fill="#33691e" opacity="0.25"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 42 54 Q 28 52 20 46 Q 16 42 22 40" fill="none" stroke="url(#${p}-bark)" stroke-width="3.5" stroke-linecap="round"/>
${I4}<path d="M 24 44 Q 18 42 16 46" fill="none" stroke="url(#${p}-bark)" stroke-width="2.5" stroke-linecap="round"/>
${I4}<ellipse cx="14" cy="44" rx="5" ry="6.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(-20 14 44)"/>
${I4}<path d="M 13 41 Q 14 45 13 48" stroke="#2e7d32" stroke-width="0.65" fill="none" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 58 54 Q 72 52 80 46 Q 84 42 78 40" fill="none" stroke="url(#${p}-bark)" stroke-width="3.5" stroke-linecap="round"/>
${I4}<path d="M 76 44 Q 82 42 84 46" fill="none" stroke="url(#${p}-bark)" stroke-width="2.5" stroke-linecap="round"/>
${I4}<ellipse cx="86" cy="44" rx="5" ry="6.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(20 86 44)"/>
${I4}<path d="M 87 41 Q 86 45 87 48" stroke="#2e7d32" stroke-width="0.65" fill="none" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 44 88 Q 38 94 36 98" stroke="url(#${p}-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M 46 89 Q 42 95 44 99" stroke="url(#${p}-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="37" cy="99" rx="4.5" ry="2.2" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 56 88 Q 62 94 64 98" stroke="url(#${p}-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M 54 89 Q 58 95 56 99" stroke="url(#${p}-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="63" cy="99" rx="4.5" ry="2.2" fill="#3e2723"/>
${I3}</g>
${dragonEyes(41, 59, 36, 7, 8.2, `url(#${p}-iris)`, '#558b2f')}
${mouths(48, '#33691e', 7)}`;

  return wrapStage('evo1', 'sapling scout', defs, body);
}

/* ── TEEN: flowering youth ── */
function teenStage() {
  const p = prefix('evo2');
  const defs = commonDefs(p, 'evo2');
  const body = `${shadow(93, 30)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 68 70 Q 84 78 88 66 Q 90 58 82 56 Q 76 54 74 60"
${I4}      fill="url(#${p}-leaf)" stroke="#2e7d32" stroke-width="1.6"/>
${I4}<path d="M 78 62 Q 84 58 86 64" fill="none" stroke="#81c784" stroke-width="0.85" opacity="0.55"/>
${I4}<circle cx="86" cy="58" r="3.5" fill="url(#${p}-bloom)" stroke="#e91e63" stroke-width="0.8"/>
${I4}<circle cx="85" cy="57" r="1.2" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 52 Q 12 42 10 30 Q 9 22 16 24 Q 22 36 28 48 Q 30 52 32 56 Z"
${I4}      fill="url(#${p}-wing)" stroke="#43a047" stroke-width="1.5"/>
${I4}<path d="M 16 28 Q 20 36 26 46" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.5"/>
${I4}<circle cx="14" cy="32" r="2.2" fill="url(#${p}-bloom)" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 52 Q 88 42 90 30 Q 91 22 84 24 Q 78 36 72 48 Q 70 52 68 56 Z"
${I4}      fill="url(#${p}-wing)" stroke="#43a047" stroke-width="1.5"/>
${I4}<path d="M 84 28 Q 80 36 74 46" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.5"/>
${I4}<circle cx="86" cy="32" r="2.2" fill="url(#${p}-bloom)" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 42 88 L 40 48 Q 50 40 60 48 L 58 88 Z" fill="url(#${p}-bark)" stroke="#4e342e" stroke-width="1.7"/>
${I4}<path d="M 44 58 Q 50 60 56 58" stroke="#3e2723" stroke-width="0.85" fill="none" opacity="0.4"/>
${I4}<path d="M 43 70 Q 50 72 57 70" stroke="#3e2723" stroke-width="0.8" fill="none" opacity="0.38"/>
${I4}<!-- Canopy -->
${I4}<ellipse cx="50" cy="34" rx="20" ry="17" fill="url(#${p}-leaf)" stroke="#43a047" stroke-width="2"/>
${I4}<ellipse cx="42" cy="28" rx="7" ry="4" fill="#fff" opacity="0.16"/>
${I4}<!-- Petal hair crown -->
${I4}<ellipse cx="36" cy="22" rx="5" ry="7" fill="#f48fb1" stroke="#e91e63" stroke-width="0.9" transform="rotate(-35 36 22)"/>
${I4}<ellipse cx="64" cy="22" rx="5" ry="7" fill="#f48fb1" stroke="#e91e63" stroke-width="0.9" transform="rotate(35 64 22)"/>
${I4}<ellipse cx="50" cy="16" rx="4.5" ry="6.5" fill="#fff59d" stroke="#fbc02d" stroke-width="0.8"/>
${I4}<ellipse cx="44" cy="18" rx="3.5" ry="5" fill="#f8bbd0" stroke="#ec407a" stroke-width="0.7" transform="rotate(-15 44 18)"/>
${I4}<ellipse cx="56" cy="18" rx="3.5" ry="5" fill="#f8bbd0" stroke="#ec407a" stroke-width="0.7" transform="rotate(15 56 18)"/>
${I4}<!-- Blossom clusters -->
${I4}<circle cx="34" cy="32" r="3.2" fill="url(#${p}-bloom)" stroke="#e91e63" stroke-width="0.7"/>
${I4}<circle cx="66" cy="33" r="3.2" fill="url(#${p}-bloom)" stroke="#e91e63" stroke-width="0.7"/>
${I4}<circle cx="50" cy="26" r="2.8" fill="#fff59d" stroke="#fbc02d" stroke-width="0.6"/>
${I4}<circle cx="38" cy="38" r="2.2" fill="#f48fb1" opacity="0.85"/>
${I4}<circle cx="62" cy="39" r="2.2" fill="#f48fb1" opacity="0.85"/>
${I4}<circle cx="33.5" cy="31.5" r="1" fill="#fff" opacity="0.55"/>
${I4}<circle cx="65.5" cy="32.5" r="1" fill="#fff" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 40 52 Q 24 50 16 44 Q 12 40 18 38" fill="none" stroke="url(#${p}-bark)" stroke-width="3.8" stroke-linecap="round"/>
${I4}<!-- Thorn-soft gauntlet -->
${I4}<path d="M 12 40 L 8 36 M 14 42 L 6 42 M 16 44 L 10 48" stroke="#558b2f" stroke-width="1.3" stroke-linecap="round"/>
${I4}<ellipse cx="14" cy="40" rx="6" ry="7" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.2"/>
${I4}<path d="M 10 36 L 12 38 L 10 40 Z M 16 36 L 14 38 L 16 40 Z" fill="#aed581" stroke="#558b2f" stroke-width="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 60 52 Q 76 50 84 44 Q 88 40 82 38" fill="none" stroke="url(#${p}-bark)" stroke-width="3.8" stroke-linecap="round"/>
${I4}<path d="M 88 40 L 92 36 M 86 42 L 94 42 M 84 44 L 90 48" stroke="#558b2f" stroke-width="1.3" stroke-linecap="round"/>
${I4}<ellipse cx="86" cy="40" rx="6" ry="7" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.2"/>
${I4}<path d="M 90 36 L 88 38 L 90 40 Z M 84 36 L 86 38 L 84 40 Z" fill="#aed581" stroke="#558b2f" stroke-width="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 44 88 Q 38 94 36 98" stroke="url(#${p}-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 46 89 Q 42 95 44 99" stroke="url(#${p}-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="37" cy="99" rx="5" ry="2.5" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 56 88 Q 62 94 64 98" stroke="url(#${p}-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 54 89 Q 58 95 56 99" stroke="url(#${p}-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="63" cy="99" rx="5" ry="2.5" fill="#3e2723"/>
${I3}</g>
${dragonEyes(41, 59, 32, 6.8, 7.8, `url(#${p}-iris)`, '#2e7d32')}
${mouths(44, '#33691e', 8)}`;

  return wrapStage('evo2', 'blooming youth', defs, body);
}

/* ── ADULT: tree guardian ── */
function adultStage() {
  const p = prefix('evo3');
  const defs = commonDefs(p, 'evo3');
  const body = `${shadow(95, 34, 0.22)}
${I3}<ellipse cx="50" cy="52" rx="40" ry="38" fill="url(#${p}-aura)" opacity="0.65"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 24 54 Q 6 42 4 26 Q 3 14 14 16 Q 20 30 24 42 Q 26 50 30 58 Z"
${I4}      fill="url(#${p}-wing)" stroke="#33691e" stroke-width="1.8"/>
${I4}<path d="M 12 24 Q 16 34 22 46" stroke="#2e7d32" stroke-width="1" fill="none" opacity="0.5"/>
${I4}<path d="M 16 28 Q 20 38 25 50" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.4"/>
${I4}<path d="M 20 32 Q 23 42 28 52" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.32"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 76 54 Q 94 42 96 26 Q 97 14 86 16 Q 80 30 76 42 Q 74 50 70 58 Z"
${I4}      fill="url(#${p}-wing)" stroke="#33691e" stroke-width="1.8"/>
${I4}<path d="M 88 24 Q 84 34 78 46" stroke="#2e7d32" stroke-width="1" fill="none" opacity="0.5"/>
${I4}<path d="M 84 28 Q 80 38 75 50" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.4"/>
${I4}<path d="M 80 32 Q 77 42 72 52" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.32"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 70 74 Q 88 80 92 70 Q 94 62 86 60 Q 80 58 78 64"
${I4}      fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1.8"/>
${I4}<path d="M 82 66 Q 88 62 90 68" fill="none" stroke="#689f38" stroke-width="0.85" opacity="0.45"/>
${I4}<ellipse cx="90" cy="62" rx="3.5" ry="5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Trunk body -->
${I4}<path d="M 38 90 Q 36 62 40 44 Q 50 36 60 44 Q 64 62 62 90 Q 58 92 50 93 Q 42 92 38 90 Z"
${I4}      fill="url(#${p}-bark)" stroke="#3e2723" stroke-width="2"/>
${I4}<!-- Bark texture lines -->
${I4}<path d="M 42 50 Q 46 58 44 68" stroke="#3e2723" stroke-width="1.1" fill="none" opacity="0.45"/>
${I4}<path d="M 56 52 Q 54 62 55 72" stroke="#3e2723" stroke-width="1.05" fill="none" opacity="0.42"/>
${I4}<path d="M 48 48 Q 50 56 49 64" stroke="#4e342e" stroke-width="0.9" fill="none" opacity="0.35"/>
${I4}<path d="M 40 76 Q 44 78 48 76" stroke="#3e2723" stroke-width="0.85" fill="none" opacity="0.38"/>
${I4}<path d="M 52 78 Q 56 80 60 78" stroke="#3e2723" stroke-width="0.85" fill="none" opacity="0.38"/>
${I4}<circle cx="46" cy="66" r="1.3" fill="#3e2723" opacity="0.3"/>
${I4}<circle cx="54" cy="70" r="1.2" fill="#3e2723" opacity="0.28"/>
${I4}<!-- Canopy head -->
${I4}<ellipse cx="50" cy="26" rx="22" ry="18" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="2.2"/>
${I4}<ellipse cx="42" cy="20" rx="8" ry="4.5" fill="#fff" opacity="0.14"/>
${I4}<ellipse cx="34" cy="24" rx="8" ry="11" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1" transform="rotate(-25 34 24)"/>
${I4}<ellipse cx="66" cy="24" rx="8" ry="11" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1" transform="rotate(25 66 24)"/>
${I4}<ellipse cx="50" cy="14" rx="7" ry="10" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="0.9"/>
${I4}<!-- Wood face in canopy -->
${I4}<ellipse cx="50" cy="30" rx="12" ry="10" fill="url(#${p}-bark-shade)" stroke="#3e2723" stroke-width="1.2"/>
${I4}<path d="M 42 28 Q 50 26 58 28" stroke="#4e342e" stroke-width="0.8" fill="none" opacity="0.45"/>
${I4}<path d="M 43 34 Q 50 36 57 34" stroke="#4e342e" stroke-width="0.75" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="58" rx="7.5" ry="11" fill="url(#${p}-bark)" stroke="#4e342e" stroke-width="1.6"/>
${I4}<ellipse cx="22" cy="52" rx="2.8" ry="2" fill="#fff" opacity="0.12"/>
${I4}<ellipse cx="18" cy="66" rx="6" ry="7.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.3"/>
${I4}<path d="M 16 62 Q 18 66 16 70" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="58" rx="7.5" ry="11" fill="url(#${p}-bark)" stroke="#4e342e" stroke-width="1.6"/>
${I4}<ellipse cx="78" cy="52" rx="2.8" ry="2" fill="#fff" opacity="0.12"/>
${I4}<ellipse cx="82" cy="66" rx="6" ry="7.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.3"/>
${I4}<path d="M 84 62 Q 82 66 84 70" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 90 Q 34 96 30 100 Q 28 102 32 101" stroke="url(#${p}-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 46 91 Q 42 97 44 101" stroke="url(#${p}-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<path d="M 48 92 Q 50 98 48 102" stroke="url(#${p}-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="31" cy="101" rx="5" ry="2.5" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 90 Q 66 96 70 100 Q 72 102 68 101" stroke="url(#${p}-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 54 91 Q 58 97 56 101" stroke="url(#${p}-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<path d="M 52 92 Q 50 98 52 102" stroke="url(#${p}-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="69" cy="101" rx="5" ry="2.5" fill="#3e2723"/>
${I3}</g>
${dragonEyes(43, 57, 30, 6.5, 7.5, `url(#${p}-iris)`, '#33691e', { pupil: '#1a2e0f' })}
${mouths(38, '#33691e', 8, 2.2)}`;

  return wrapStage('evo3', 'Worldroot Warden', defs, body);
}

/* ── MIDDLE: ancient oak ── */
function midStage() {
  const p = prefix('evo4');
  const defs = commonDefs(p, 'evo4');
  const body = `${shadow(97, 32, 0.24)}
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 26 58 Q 14 50 12 40 Q 11 34 16 36 Q 22 46 28 56 Z"
${I4}      fill="url(#${p}-wing)" stroke="#558b2f" stroke-width="1.3" opacity="0.85"/>
${I4}<ellipse cx="14" cy="42" rx="4" ry="2.5" fill="#689f38" opacity="0.5" transform="rotate(-20 14 42)"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 74 58 Q 86 50 88 40 Q 89 34 84 36 Q 78 46 72 56 Z"
${I4}      fill="url(#${p}-wing)" stroke="#558b2f" stroke-width="1.3" opacity="0.85"/>
${I4}<ellipse cx="86" cy="42" rx="4" ry="2.5" fill="#689f38" opacity="0.5" transform="rotate(20 86 42)"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 78 Q 80 84 84 74 Q 86 68 80 66"
${I4}      fill="url(#${p}-bark-shade)" stroke="#3e2723" stroke-width="1.5"/>
${I4}<ellipse cx="82" cy="70" rx="3" ry="4" fill="#795548" stroke="#4e342e" stroke-width="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Stout ancient trunk — slower, wider pose -->
${I4}<path d="M 34 94 Q 32 64 38 42 Q 50 32 62 42 Q 68 64 66 94 Q 60 96 50 97 Q 40 96 34 94 Z"
${I4}      fill="url(#${p}-bark)" stroke="#3e2723" stroke-width="2.1"/>
${I4}<path d="M 40 50 Q 44 62 42 76" stroke="#3e2723" stroke-width="1.15" fill="none" opacity="0.42"/>
${I4}<path d="M 58 52 Q 56 64 57 78" stroke="#3e2723" stroke-width="1.1" fill="none" opacity="0.4"/>
${I4}<path d="M 46 46 Q 50 54 49 62" stroke="#4e342e" stroke-width="0.95" fill="none" opacity="0.35"/>
${I4}<!-- Knotholes -->
${I4}<ellipse cx="44" cy="58" rx="3.5" ry="4" fill="#2c1810" stroke="#3e2723" stroke-width="1"/>
${I4}<ellipse cx="56" cy="72" rx="3" ry="3.5" fill="#2c1810" stroke="#3e2723" stroke-width="0.9"/>
${I4}<circle cx="43.5" cy="57.5" r="1" fill="#4e342e" opacity="0.5"/>
${I4}<!-- Moss tufts -->
${I4}<ellipse cx="38" cy="68" rx="5" ry="3" fill="#689f38" opacity="0.65" transform="rotate(-15 38 68)"/>
${I4}<ellipse cx="62" cy="60" rx="4.5" ry="2.8" fill="#558b2f" opacity="0.6" transform="rotate(12 62 60)"/>
${I4}<ellipse cx="36" cy="82" rx="4" ry="2.5" fill="#7cb342" opacity="0.55" transform="rotate(-8 36 82)"/>
${I4}<!-- Hollow amber glow -->
${I4}<ellipse cx="50" cy="64" rx="8" ry="9" fill="url(#${p}-amber)" opacity="0.75"/>
${I4}<ellipse cx="50" cy="64" rx="4.5" ry="5" fill="#fff8e1" opacity="0.55"/>
${I4}<circle cx="50" cy="64" r="2" fill="#ffb300" opacity="0.7"/>
${I4}<!-- Canopy -->
${I4}<ellipse cx="50" cy="28" rx="24" ry="19" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="2"/>
${I4}<ellipse cx="42" cy="22" rx="8" ry="4.5" fill="#fff" opacity="0.12"/>
${I4}<ellipse cx="32" cy="28" rx="9" ry="12" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1" transform="rotate(-22 32 28)"/>
${I4}<ellipse cx="68" cy="28" rx="9" ry="12" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1" transform="rotate(22 68 28)"/>
${I4}<!-- Acorns -->
${I4}<ellipse cx="30" cy="36" rx="2.2" ry="3" fill="#795548" stroke="#4e342e" stroke-width="0.7"/>
${I4}<path d="M 30 33 Q 30 31 32 32 Q 30 31 28 32 Q 30 31 30 33" fill="#558b2f" stroke="#33691e" stroke-width="0.5"/>
${I4}<ellipse cx="68" cy="38" rx="2.2" ry="3" fill="#795548" stroke="#4e342e" stroke-width="0.7"/>
${I4}<path d="M 68 35 Q 68 33 70 34 Q 68 33 66 34 Q 68 33 68 35" fill="#558b2f" stroke="#33691e" stroke-width="0.5"/>
${I4}<ellipse cx="50" cy="18" rx="2" ry="2.8" fill="#6d4c41" stroke="#4e342e" stroke-width="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 36 56 Q 22 54 14 48 Q 10 44 16 42" fill="none" stroke="url(#${p}-bark)" stroke-width="4" stroke-linecap="round"/>
${I4}<ellipse cx="12" cy="44" rx="5.5" ry="7" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1.1"/>
${I4}<ellipse cx="10" cy="40" rx="3" ry="2" fill="#689f38" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 64 56 Q 78 54 86 48 Q 90 44 84 42" fill="none" stroke="url(#${p}-bark)" stroke-width="4" stroke-linecap="round"/>
${I4}<ellipse cx="88" cy="44" rx="5.5" ry="7" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1.1"/>
${I4}<ellipse cx="90" cy="40" rx="3" ry="2" fill="#689f38" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 94 Q 32 100 30 104" stroke="url(#${p}-bark-shade)" stroke-width="4" fill="none" stroke-linecap="round"/>
${I4}<path d="M 44 95 Q 38 102 40 106" stroke="url(#${p}-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="31" cy="105" rx="5.5" ry="2.8" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 94 Q 68 100 70 104" stroke="url(#${p}-bark-shade)" stroke-width="4" fill="none" stroke-linecap="round"/>
${I4}<path d="M 56 95 Q 62 102 60 106" stroke="url(#${p}-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="69" cy="105" rx="5.5" ry="2.8" fill="#3e2723"/>
${I3}</g>
${dragonEyes(42, 58, 32, 5.8, 6.5, `url(#${p}-iris)`, '#33691e', { pupil: '#1a2e0f', sw: 1.3 })}
${mouths(40, '#33691e', 7, 2)}`;

  return wrapStage('evo4', 'ancient oak', defs, body);
}

/* ── OLD: World Tree ── */
function oldStage() {
  const p = prefix('evo5');
  const defs = commonDefs(p, 'evo5');
  const body = `${shadow(99, 36, 0.26)}
${I3}<ellipse cx="50" cy="50" rx="46" ry="48" fill="url(#${p}-aura)" class="tm-wisdom-aura"/>
${I3}<!-- Floating spirit orbs -->
${I3}<circle cx="18" cy="36" r="3.5" fill="url(#${p}-bloom)" opacity="0.75" class="tm-sparkle"/>
${I3}<circle cx="17" cy="35" r="1.4" fill="#fff" opacity="0.7"/>
${I3}<circle cx="82" cy="42" r="3" fill="url(#${p}-bloom)" opacity="0.7" class="tm-sparkle"/>
${I3}<circle cx="81" cy="41" r="1.2" fill="#fff" opacity="0.65"/>
${I3}<circle cx="14" cy="58" r="2.5" fill="#aed581" opacity="0.6" class="tm-sparkle"/>
${I3}<circle cx="86" cy="64" r="2.8" fill="#ffd54f" opacity="0.65" class="tm-sparkle"/>
${I3}<circle cx="50" cy="8" r="2.5" fill="#fff" opacity="0.5" class="tm-sparkle"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 22 56 Q 4 44 2 28 Q 1 16 12 18 Q 18 32 22 44 Q 24 52 28 60 Z"
${I4}      fill="url(#${p}-wing)" stroke="#33691e" stroke-width="1.6" opacity="0.9"/>
${I4}<path d="M 10 26 Q 14 36 20 48" stroke="#558b2f" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<circle cx="8" cy="30" r="2" fill="#ffd54f" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 78 56 Q 96 44 98 28 Q 99 16 88 18 Q 82 32 78 44 Q 76 52 72 60 Z"
${I4}      fill="url(#${p}-wing)" stroke="#33691e" stroke-width="1.6" opacity="0.9"/>
${I4}<path d="M 90 26 Q 86 36 80 48" stroke="#558b2f" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<circle cx="92" cy="30" r="2" fill="#ffd54f" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 80 Q 78 88 82 78 Q 84 72 78 70"
${I4}      fill="url(#${p}-bark-shade)" stroke="#3e2723" stroke-width="1.6"/>
${I4}<circle cx="80" cy="74" r="2.5" fill="url(#${p}-sap)" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Massive trunk -->
${I4}<path d="M 32 96 Q 28 60 36 38 Q 50 26 64 38 Q 72 60 68 96 Q 62 98 50 99 Q 38 98 32 96 Z"
${I4}      fill="url(#${p}-bark)" stroke="#3e2723" stroke-width="2.2"/>
${I4}<!-- Rune bark -->
${I4}<path d="M 42 48 L 44 52 L 42 56 L 40 52 Z" fill="none" stroke="#ffd54f" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M 58 52 L 60 56 L 58 60 L 56 56 Z" fill="none" stroke="#ffd54f" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M 48 68 L 50 72 L 52 68" fill="none" stroke="#ffd54f" stroke-width="0.85" opacity="0.5"/>
${I4}<path d="M 44 78 Q 50 80 56 78" stroke="#ffd54f" stroke-width="0.8" fill="none" opacity="0.45"/>
${I4}<circle cx="46" cy="58" r="1.5" fill="#ffd54f" opacity="0.4"/>
${I4}<circle cx="54" cy="74" r="1.3" fill="#ffd54f" opacity="0.38"/>
${I4}<!-- Golden sap drips -->
${I4}<path d="M 46 82 Q 46 88 45 92" stroke="url(#${p}-sap)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 54 78 Q 55 84 54 90" stroke="url(#${p}-sap)" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.8"/>
${I4}<circle cx="45" cy="93" r="2" fill="#ffd54f" opacity="0.75"/>
${I4}<circle cx="54" cy="91" r="1.8" fill="#ffb300" opacity="0.7"/>
${I4}<!-- Huge canopy -->
${I4}<ellipse cx="50" cy="22" rx="28" ry="22" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="2.2"/>
${I4}<ellipse cx="40" cy="16" rx="10" ry="5" fill="#fff" opacity="0.12"/>
${I4}<ellipse cx="28" cy="22" rx="11" ry="14" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1.1" transform="rotate(-20 28 22)"/>
${I4}<ellipse cx="72" cy="22" rx="11" ry="14" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1.1" transform="rotate(20 72 22)"/>
${I4}<ellipse cx="50" cy="8" rx="9" ry="12" fill="url(#${p}-leaf-dark)" stroke="#33691e" stroke-width="1"/>
${I4}<circle cx="34" cy="18" r="2.5" fill="#ffd54f" opacity="0.65"/>
${I4}<circle cx="66" cy="20" r="2.5" fill="#ffd54f" opacity="0.6"/>
${I4}<circle cx="50" cy="6" r="2" fill="#fff" opacity="0.45"/>
${I4}<!-- Wise wood face -->
${I4}<ellipse cx="50" cy="30" rx="13" ry="11" fill="url(#${p}-bark-shade)" stroke="#3e2723" stroke-width="1.3"/>
${I4}<path d="M 42 28 Q 50 26 58 28" stroke="#5d4037" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<path d="M 40 34 Q 44 32 48 34" stroke="#5d4037" stroke-width="0.7" fill="none" opacity="0.35"/>
${I4}<path d="M 52 34 Q 56 32 60 34" stroke="#5d4037" stroke-width="0.7" fill="none" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 54 Q 18 50 10 42 Q 6 38 12 36" fill="none" stroke="url(#${p}-bark)" stroke-width="4.5" stroke-linecap="round"/>
${I4}<ellipse cx="8" cy="38" rx="6" ry="7.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.2"/>
${I4}<circle cx="6" cy="34" r="2" fill="#ffd54f" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 54 Q 82 50 90 42 Q 94 38 88 36" fill="none" stroke="url(#${p}-bark)" stroke-width="4.5" stroke-linecap="round"/>
${I4}<ellipse cx="92" cy="38" rx="6" ry="7.5" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.2"/>
${I4}<circle cx="94" cy="34" r="2" fill="#ffd54f" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 38 96 Q 28 102 24 106 Q 22 108 26 107" stroke="url(#${p}-bark-shade)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 42 97 Q 36 104 38 108" stroke="url(#${p}-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 46 98 Q 48 105 46 110" stroke="url(#${p}-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="25" cy="107" rx="6" ry="3" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 62 96 Q 72 102 76 106 Q 78 108 74 107" stroke="url(#${p}-bark-shade)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 58 97 Q 64 104 62 108" stroke="url(#${p}-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M 54 98 Q 52 105 54 110" stroke="url(#${p}-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="75" cy="107" rx="6" ry="3" fill="#3e2723"/>
${I3}</g>
${dragonEyes(42, 58, 30, 5.2, 6, `url(#${p}-iris)`, '#33691e', { pupil: '#1a2e0f', sw: 1.2, closedSw: 2.2 })}
${mouths(38, '#33691e', 7, 2)}`;

  return wrapStage('evo5', 'World Tree', defs, body);
}

export const plantSvg = [
  `${I}<!-- PLANT CHARACTER - All Life Stages (dense cute epic v3) -->`,
  `${I}<!-- Wildwood & Life • Rare Rarity • Worldroot Warden -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  babyStage(),
  kidStage(),
  teenStage(),
  adultStage(),
  midStage(),
  oldStage(),
].join('\n');

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-plant.mjs');

if (isMain) {
// --- Apply to myman_mascot.js ---
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
  const chunk = src.slice(idx, next > 0 ? next : idx + 15000);
  for (const h of HOOKS) {
    if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
  }
}
if (issues.length) {
  console.error('VALIDATION FAILED', issues.length);
  issues.slice(0, 50).forEach((i) => console.error(' -', i));
  process.exit(1);
}

fs.writeFileSync(path, src);
console.log('OK wrote', path, 'plant chars', plantSvg.length);
}
