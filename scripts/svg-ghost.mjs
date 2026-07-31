/**
 * Wispuff — GHOST mascot sprites v7 (Pokémon-style evolution)
 *
 * Playful Ghost-type line: cute, readable silhouettes, clear evo jumps.
 * Soft periwinkle ectoplasm — charming spooky, not horror.
 *
 *   evo1 — Wispuff: round gas puff, tiny stub arms, big friendly eyes
 *   evo2 — Hauntling: teardrop floater with grabby hands + wavy hem
 *   evo3 — Spectrex: solid mischievous biped ghost, ear tufts, grin
 *
 * Run: node scripts/svg-ghost.mjs
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

/** Pokémon-style big eyes */
function pokeEyes(lx, rx, cy, rxE, ryE, iris, stroke, opts = {}) {
  const white = opts.white ?? '#fffef8';
  const pupil = opts.pupil ?? '#1a1030';
  const sw = opts.sw ?? 1.45;
  const hi = Math.max(1.4, rxE * 0.3);
  const hi2 = Math.max(0.7, rxE * 0.13);
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${white}" stroke="${stroke}" stroke-width="${sw}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${white}" stroke="${stroke}" stroke-width="${sw}"/>
${I4}<ellipse cx="${lx + 0.8}" cy="${cy + 1.2}" rx="${rxE * 0.55}" ry="${ryE * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.8}" cy="${cy + 1.2}" rx="${rxE * 0.55}" ry="${ryE * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.9}" cy="${cy + 1.5}" rx="${rxE * 0.28}" ry="${ryE * 0.34}" fill="${pupil}"/>
${I4}<ellipse cx="${rx + 0.9}" cy="${cy + 1.5}" rx="${rxE * 0.28}" ry="${ryE * 0.34}" fill="${pupil}"/>
${I4}<circle cx="${lx + 2.2}" cy="${cy - ryE * 0.28}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${rx + 2.2}" cy="${cy - ryE * 0.28}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${lx - 0.8}" cy="${cy + ryE * 0.3}" r="${hi2}" fill="#fff" opacity="0.45"/>
${I4}<circle cx="${rx - 0.8}" cy="${cy + ryE * 0.3}" r="${hi2}" fill="#fff" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy + 0.5} Q ${lx} ${cy - ryE * 0.45} ${lx + rxE} ${cy + 0.5}" stroke="${stroke}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy + 0.5} Q ${rx} ${cy - ryE * 0.45} ${rx + rxE} ${cy + 0.5}" stroke="${stroke}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
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

function shadow(cy = 92, rx = 20, op = 0.16) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="4" fill="#1a1a2a" opacity="${op}"/>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- GHOST ${stage.toUpperCase()} — ${title} -->
${I}<g id="tm-mascot-${stage}-ghost" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/* ── EVO1: Wispuff — round gas puff (Gastly energy) ── */
function evo1() {
  const p = 'ghost-evo1';
  const line = '#4a3a7a';
  const defs = [
    grad(`${p}-body`, [['0%', '#f0e8ff'], ['35%', '#c5b0f0'], ['70%', '#8e78c8'], ['100%', '#5c4a9a']], 'radial', 'cx="42%" cy="30%" r="72%"'),
    grad(`${p}-belly`, [['0%', '#ffffff', 0.75], ['100%', '#d4c4f5', 0.2]], 'radial', 'cx="50%" cy="45%" r="55%"'),
    grad(`${p}-iris`, [['0%', '#e8d5ff'], ['45%', '#7e57c2'], ['100%', '#2a1850']], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-cheek`, [['0%', '#ff9ec8', 0.5], ['100%', '#ff9ec8', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#b39ddb', 0.3], ['100%', '#b39ddb', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-spark`, [['0%', '#fff'], ['100%', '#ce93d8', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-wisp`, [['0%', '#ede7f6', 0.9], ['100%', '#9575cd', 0.3]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(88, 18, 0.14)}
${I3}<ellipse cx="50" cy="54" rx="32" ry="30" fill="url(#${p}-aura)"/>
${I3}<!-- Gas puff sparks -->
${I3}<circle cx="28" cy="40" r="2.2" fill="url(#${p}-spark)" opacity="0.7" class="tm-sparkle"/>
${I3}<circle cx="74" cy="44" r="1.8" fill="url(#${p}-spark)" opacity="0.6" class="tm-sparkle"/>
${I3}<circle cx="34" cy="70" r="1.5" fill="#ce93d8" opacity="0.45"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 70 Q 70 78 72 66 Q 73 58 66 60" fill="url(#${p}-wisp)" stroke="${line}" stroke-width="1" opacity="0.8"/>
${I4}<circle cx="70" cy="64" r="2" fill="#fff" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="30" cy="54" rx="4" ry="6" fill="url(#${p}-wisp)" stroke="${line}" stroke-width="0.9" transform="rotate(-20 30 54)" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="70" cy="54" rx="4" ry="6" fill="url(#${p}-wisp)" stroke="${line}" stroke-width="0.9" transform="rotate(20 70 54)" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="30" cy="60" rx="4.5" ry="5.5" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.15"/>
${I4}<ellipse cx="28" cy="57" rx="1.5" ry="1.1" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="70" cy="60" rx="4.5" ry="5.5" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.15"/>
${I4}<ellipse cx="72" cy="57" rx="1.5" ry="1.1" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left" opacity="0.001"><circle cx="42" cy="78" r="0.5" fill="${line}"/></g>
${I3}<g class="tm-animate-leg-right" opacity="0.001"><circle cx="58" cy="78" r="0.5" fill="${line}"/></g>
${I3}<g class="tm-animate-body">
${I4}<!-- Soft round puff -->
${I4}<ellipse cx="50" cy="52" rx="20" ry="22" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.9"/>
${I4}<ellipse cx="50" cy="56" rx="11" ry="10" fill="url(#${p}-belly)"/>
${I4}<ellipse cx="42" cy="42" rx="7" ry="5" fill="#fff" opacity="0.28"/>
${I4}<ellipse cx="43" cy="40" rx="2.5" ry="1.4" fill="#fff" opacity="0.5"/>
${blush(35, 65, 58, `${p}-cheek`, 3.6)}
${pokeEyes(41, 59, 48, 6.8, 8, `url(#${p}-iris)`, line)}
${mouths(64, line, 6, 1.9, 4.5)}
${I3}</g>`;

  return wrapStage('evo1', 'Wispuff', defs, body);
}

/* ── EVO2: Hauntling — hands + wavy hem (Haunter energy) ── */
function evo2() {
  const p = 'ghost-evo2';
  const line = '#3d2a6e';
  const defs = [
    grad(`${p}-body`, [['0%', '#e8deff'], ['30%', '#b39ddb'], ['65%', '#7e57c2'], ['100%', '#4527a0']], 'radial', 'cx="44%" cy="24%" r="74%"'),
    grad(`${p}-belly`, [['0%', '#fff'], ['100%', '#d1c4e9', 0.25]], 'radial', 'cx="50%" cy="50%" r="55%"'),
    grad(`${p}-iris`, [['0%', '#f3e5f5'], ['40%', '#ab47bc'], ['100%', '#311b92']], 'radial', 'cx="38%" cy="30%" r="62%"'),
    grad(`${p}-cheek`, [['0%', '#f48fb1', 0.5], ['100%', '#f48fb1', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#9575cd', 0.32], ['100%', '#9575cd', 0]], 'radial', 'cx="50%" cy="48%" r="50%"'),
    grad(`${p}-hand`, [['0%', '#d1c4e9'], ['100%', '#5e35b1']], 'radial', 'cx="40%" cy="30%" r="65%"'),
    grad(`${p}-wisp`, [['0%', '#ede7f6'], ['100%', '#673ab7', 0.35]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(94, 22, 0.16)}
${I3}<ellipse cx="50" cy="52" rx="36" ry="34" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 76 Q 74 88 78 72 Q 80 62 70 64" fill="url(#${p}-wisp)" stroke="${line}" stroke-width="1.15"/>
${I4}<circle cx="76" cy="68" r="2.4" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 48 Q 16 42 12 54 Q 14 64 26 58 Z" fill="url(#${p}-wisp)" stroke="${line}" stroke-width="1" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 Q 84 42 88 54 Q 86 64 74 58 Z" fill="url(#${p}-wisp)" stroke="${line}" stroke-width="1" opacity="0.85"/>
${I3}</g>
${I3}<!-- Big grabby hands -->
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="18" cy="52" rx="8" ry="9" fill="url(#${p}-hand)" stroke="${line}" stroke-width="1.4"/>
${I4}<ellipse cx="14" cy="46" rx="2.5" ry="1.8" fill="#fff" opacity="0.25"/>
${I4}<path d="M 12 58 L 8 64 M 16 60 L 14 66 M 20 58 L 22 64" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="82" cy="52" rx="8" ry="9" fill="url(#${p}-hand)" stroke="${line}" stroke-width="1.4"/>
${I4}<ellipse cx="86" cy="46" rx="2.5" ry="1.8" fill="#fff" opacity="0.25"/>
${I4}<path d="M 78 58 L 76 64 M 82 60 L 84 66 M 88 58 L 92 64" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left" opacity="0.001"><circle cx="42" cy="86" r="0.5" fill="${line}"/></g>
${I3}<g class="tm-animate-leg-right" opacity="0.001"><circle cx="58" cy="86" r="0.5" fill="${line}"/></g>
${I3}<g class="tm-animate-body">
${I4}<!-- Teardrop body with wavy hem -->
${I4}<path d="M 50 18 Q 70 28 72 48 Q 74 64 66 76 L 60 82 L 54 76 L 50 84 L 46 76 L 40 82 L 34 76 Q 26 64 28 48 Q 30 28 50 18 Z"
${I4}      fill="url(#${p}-body)" stroke="${line}" stroke-width="1.9"/>
${I4}<ellipse cx="50" cy="48" rx="12" ry="11" fill="url(#${p}-belly)"/>
${I4}<ellipse cx="42" cy="34" rx="7" ry="4.5" fill="#fff" opacity="0.22"/>
${blush(34, 66, 52, `${p}-cheek`, 3.5)}
${pokeEyes(41, 59, 40, 7.2, 8.2, `url(#${p}-iris)`, line)}
${I4}<!-- Playful tongue tip -->
${I4}<ellipse cx="50" cy="58" rx="3.2" ry="2.4" fill="#f48fb1" stroke="${line}" stroke-width="0.7"/>
${mouths(54, line, 7, 2, 3.5)}
${I3}</g>`;

  return wrapStage('evo2', 'Hauntling', defs, body);
}

/* ── EVO3: Spectrex — solid mischievous biped (Gengar energy) ── */
function evo3() {
  const p = 'ghost-evo3';
  const line = '#2a1848';
  const defs = [
    grad(`${p}-body`, [['0%', '#d4c4f5'], ['30%', '#9575cd'], ['65%', '#5e35b1'], ['100%', '#311b92']], 'radial', 'cx="40%" cy="22%" r="76%"'),
    grad(`${p}-belly`, [['0%', '#ede7f6'], ['100%', '#7e57c2']], 'radial', 'cx="50%" cy="40%" r="55%"'),
    grad(`${p}-iris`, [['0%', '#ffe082'], ['40%', '#ffb300'], ['100%', '#e65100']], 'radial', 'cx="38%" cy="32%" r="60%"'),
    grad(`${p}-cheek`, [['0%', '#ef5350', 0.4], ['100%', '#ef5350', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#7e57c2', 0.35], ['100%', '#7e57c2', 0]], 'radial', 'cx="50%" cy="48%" r="50%"'),
    grad(`${p}-ear`, [['0%', '#b39ddb'], ['100%', '#4527a0']], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(96, 24, 0.18)}
${I3}<ellipse cx="50" cy="54" rx="38" ry="36" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 72 Q 78 80 80 66 Q 81 58 72 60 L 64 70 Z" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.3"/>
${I4}<path d="M 72 66 L 78 62 L 76 70 Z" fill="#4527a0"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 50 Q 14 42 10 54 Q 12 64 24 58 Z" fill="url(#${p}-ear)" stroke="${line}" stroke-width="1.1" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 50 Q 86 42 90 54 Q 88 64 76 58 Z" fill="url(#${p}-ear)" stroke="${line}" stroke-width="1.1" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="24" cy="60" rx="7" ry="10" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.4"/>
${I4}<ellipse cx="21" cy="54" rx="2.2" ry="1.6" fill="#fff" opacity="0.18"/>
${I4}<path d="M 20 68 L 16 74 M 24 70 L 22 76 M 28 68 L 30 74" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="76" cy="60" rx="7" ry="10" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.4"/>
${I4}<ellipse cx="79" cy="54" rx="2.2" ry="1.6" fill="#fff" opacity="0.18"/>
${I4}<path d="M 72 68 L 70 74 M 76 70 L 78 76 M 80 68 L 84 74" stroke="${line}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="88" rx="7" ry="5" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.3"/>
${I4}<path d="M 36 90 L 34 94 M 40 91 L 40 95 M 44 90 L 46 94" stroke="${line}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="88" rx="7" ry="5" fill="url(#${p}-body)" stroke="${line}" stroke-width="1.3"/>
${I4}<path d="M 56 90 L 54 94 M 60 91 L 60 95 M 64 90 L 66 94" stroke="${line}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Spiky-ear biped silhouette -->
${I4}<path d="M 38 28 L 32 14 L 42 24 L 50 10 L 58 24 L 68 14 L 62 28 Q 74 36 76 54 Q 76 72 68 82 Q 58 90 50 88 Q 42 90 32 82 Q 24 72 24 54 Q 26 36 38 28 Z"
${I4}      fill="url(#${p}-body)" stroke="${line}" stroke-width="1.9"/>
${I4}<!-- Belly moon -->
${I4}<ellipse cx="50" cy="62" rx="12" ry="13" fill="url(#${p}-belly)"/>
${I4}<ellipse cx="42" cy="40" rx="6" ry="4" fill="#fff" opacity="0.16"/>
${I4}<!-- Ear inner tips -->
${I4}<path d="M 36 22 L 34 16 L 40 22 Z" fill="#ede7f6" opacity="0.55"/>
${I4}<path d="M 64 22 L 66 16 L 60 22 Z" fill="#ede7f6" opacity="0.55"/>
${I4}<path d="M 50 16 L 48 12 L 52 12 Z" fill="#ede7f6" opacity="0.45"/>
${blush(34, 66, 52, `${p}-cheek`, 3.4)}
${pokeEyes(41, 59, 42, 6.5, 7.2, `url(#${p}-iris)`, line, { pupil: '#1a0a00' })}
${I4}<!-- Mischief grin (wider) -->
${I4}<path class="tm-mascot-mouth-happy" d="M 40 56 Q 50 66 60 56" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 60 Q 50 52 60 60" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<!-- Tiny fang accents -->
${I4}<path d="M 44 58 L 45 62 L 46 58 Z" fill="#fff" stroke="${line}" stroke-width="0.5"/>
${I4}<path d="M 54 58 L 55 62 L 56 58 Z" fill="#fff" stroke="${line}" stroke-width="0.5"/>
${I3}</g>`;

  return wrapStage('evo3', 'Spectrex', defs, body);
}

export const ghostSvg = [
  `${I}<!-- GHOST CHARACTER - All Life Stages (Wispuff v7 · Pokémon evo) -->`,
  `${I}<!-- Spirit & Mischief • Epic Rarity • Wispuff → Hauntling → Spectrex -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  evo1(),
  evo2(),
  evo3(),
].join('\n');

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-ghost.mjs');

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
    '                <!-- GHOST CHARACTER',
    '                <!-- CAT CHARACTER',
    normalize(ghostSvg),
  );

  const issues = [];
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-ghost`;
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
