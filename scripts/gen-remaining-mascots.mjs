/**
 * Dense epic vector redo for robot, plant, ghost, cat, phoenix, crystal.
 * Writes into myman_mascot.js (CRLF-aware) and validates hooks.
 */
import fs from 'fs';

const I = '                '; // 16 spaces
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

function eyes(lx, rx, cy, rxEye, ryEye, iris, stroke, glow = '#fff') {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="#0a0a12" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="${lx + 0.4}" cy="${cy}" rx="${rxEye * 0.55}" ry="${ryEye * 0.55}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.6}" cy="${cy + 0.3}" rx="${rxEye * 0.25}" ry="${ryEye * 0.35}" fill="#050508"/>
${I4}<circle cx="${lx + 1.2}" cy="${cy - ryEye * 0.35}" r="${Math.max(0.8, rxEye * 0.22)}" fill="${glow}" opacity="0.9"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="#0a0a12" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="${rx + 0.4}" cy="${cy}" rx="${rxEye * 0.55}" ry="${ryEye * 0.55}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.6}" cy="${cy + 0.3}" rx="${rxEye * 0.25}" ry="${ryEye * 0.35}" fill="#050508"/>
${I4}<circle cx="${rx + 1.2}" cy="${cy - ryEye * 0.35}" r="${Math.max(0.8, rxEye * 0.22)}" fill="${glow}" opacity="0.9"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxEye} ${cy} Q ${lx} ${cy - 3} ${lx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxEye} ${cy} Q ${rx} ${cy - 3} ${rx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 8) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 6} ${50 + span} ${y}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

function shadow(cy = 92, rx = 28) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="4.5" fill="#000" opacity="0.32"/>`;
}

function wrapStage(char, stage, title, defs, body) {
  return `${I}<!-- ${char.toUpperCase()} ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-${char}" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/* ═══════════════════════ ROBOT ═══════════════════════ */
function robotStage(stage) {
  const p = `robot-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'armored cube spawn', kid: 'tread scout', teen: 'sleek mecha',
    adult: 'Neon Colossus', middle: 'war-scarred titan', old: 'ancient sage unit',
  };
  const label = stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'middle' : stage === 'evo5' ? 'old' : 'baby';
  const steel = stage === 'evo5'
    ? [['0%', '#5d4037'], ['45%', '#37474f'], ['100%', '#1a237e']]
    : stage === 'evo4'
      ? [['0%', '#78909c'], ['40%', '#455a64'], ['100%', '#263238']]
      : [['0%', '#b0bec5'], ['35%', '#546e7a'], ['100%', '#1b263b']];
  const accent = stage === 'evo5' ? '#ea80fc' : stage === 'evo4' ? '#ffab40' : '#00e5ff';
  const core = stage === 'evo5' ? '#ce93d8' : stage === 'evo4' ? '#ff6d00' : '#76ff03';

  const defs = [
    grad(`${p}-body`, steel, 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fffde7', 1], ['35%', core, 0.95], ['100%', accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-panel`, [['0%', accent, 0.9], ['100%', '#01579b', 1]], 'linear'),
    grad(`${p}-iris`, [['0%', accent], ['100%', '#0d47a1']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-glow`, [['0%', accent, 0.45], ['100%', accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const scale = stage === 'baby' ? 0.85 : stage === 'evo1' ? 0.92 : stage === 'evo5' ? 1.05 : 1;
  const bodyH = 22 * scale;
  const headY = stage === 'baby' ? 34 : 30;

  const body = `${shadow(94, 26 + (stage === 'evo5' ? 6 : 0))}
${I3}<ellipse cx="50" cy="58" rx="34" ry="30" fill="url(#${p}-glow)" opacity="0.55"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 68 72 Q 84 78 88 66 Q 90 58 82 60" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
${I4}<circle cx="86" cy="62" r="3" fill="${core}" opacity="0.7"/>
${I4}<circle cx="86" cy="62" r="1.2" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 52 L 14 40 L 18 56 L 12 62 L 26 60 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 22 48 L 16 44" stroke="${accent}" stroke-width="1" opacity="0.6"/>
${I4}<circle cx="16" cy="42" r="1.5" fill="${core}" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 52 L 86 40 L 82 56 L 88 62 L 74 60 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 78 48 L 84 44" stroke="${accent}" stroke-width="1" opacity="0.6"/>
${I4}<circle cx="84" cy="42" r="1.5" fill="${core}" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<rect x="${50 - 18 * scale}" y="${58 - bodyH / 2}" width="${36 * scale}" height="${bodyH}" rx="4" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.6"/>
${I4}<rect x="${50 - 12 * scale}" y="${56 - bodyH / 4}" width="${24 * scale}" height="${10 * scale}" rx="2" fill="url(#${p}-panel)" opacity="0.85"/>
${I4}<circle cx="50" cy="60" r="${7 * scale}" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="60" r="${3 * scale}" fill="#fffde7" opacity="0.75"/>
${I4}<rect x="38" y="48" width="4" height="3" rx="0.5" fill="${accent}" opacity="0.7"/>
${I4}<rect x="58" y="48" width="4" height="3" rx="0.5" fill="${accent}" opacity="0.7"/>
${I4}<path d="M 40 52 L 60 52" stroke="${accent}" stroke-width="0.6" opacity="0.35"/>
${I4}<path d="M 40 66 L 44 66 M 56 66 L 60 66" stroke="${core}" stroke-width="1.2" opacity="0.6"/>
${I4}<circle cx="42" cy="70" r="1.2" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="50" cy="72" r="1.2" fill="${core}" opacity="0.5"/>
${I4}<circle cx="58" cy="70" r="1.2" fill="${accent}" opacity="0.5"/>
${I4}<!-- Head chassis -->
${I4}<rect x="36" y="${headY - 12}" width="28" height="22" rx="3.5" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.5"/>
${I4}<rect x="40" y="${headY - 8}" width="20" height="12" rx="2" fill="#0a1628" opacity="0.85"/>
${I4}<line x1="50" y1="${headY - 12}" x2="50" y2="${headY - 18}" stroke="${accent}" stroke-width="1.5"/>
${I4}<circle cx="50" cy="${headY - 19}" r="2.8" fill="${core}" stroke="${accent}" stroke-width="0.8"/>
${I4}<circle cx="50" cy="${headY - 19}" r="1" fill="#fff" opacity="0.7"/>
${I4}<path d="M 38 ${headY - 6} L 36 ${headY - 10} L 38 ${headY - 8} Z" fill="${accent}" opacity="0.5"/>
${I4}<path d="M 62 ${headY - 6} L 64 ${headY - 10} L 62 ${headY - 8} Z" fill="${accent}" opacity="0.5"/>
${I4}${stage === 'evo5' ? `<path d="M 44 ${headY - 14} Q 50 ${headY - 16} 56 ${headY - 14}" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.5"/>` : ''}
${I4}${stage === 'evo3' || stage === 'evo4' ? `<path d="M 42 44 L 46 48 L 42 48 Z M 58 44 L 54 48 L 58 48 Z" fill="${accent}" opacity="0.45"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<rect x="22" y="50" width="10" height="20" rx="2" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2" transform="rotate(-12 27 60)"/>
${I4}<rect x="20" y="68" width="12" height="8" rx="1.5" fill="#263238" stroke="${core}" stroke-width="1"/>
${I4}<circle cx="24" cy="72" r="1.5" fill="${core}"/>
${I4}<circle cx="28" cy="72" r="1.5" fill="${accent}"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<rect x="68" y="50" width="10" height="20" rx="2" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2" transform="rotate(12 73 60)"/>
${I4}<rect x="68" y="68" width="12" height="8" rx="1.5" fill="#263238" stroke="${core}" stroke-width="1"/>
${I4}<circle cx="72" cy="72" r="1.5" fill="${core}"/>
${I4}<circle cx="76" cy="72" r="1.5" fill="${accent}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<rect x="36" y="78" width="10" height="12" rx="2" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<ellipse cx="41" cy="90" rx="7" ry="3.5" fill="#1a237e" stroke="${accent}" stroke-width="1"/>
${I4}${stage === 'evo1' ? `<circle cx="41" cy="90" r="2" fill="#546e7a"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<rect x="54" y="78" width="10" height="12" rx="2" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<ellipse cx="59" cy="90" rx="7" ry="3.5" fill="#1a237e" stroke="${accent}" stroke-width="1"/>
${I4}${stage === 'evo1' ? `<circle cx="59" cy="90" r="2" fill="#546e7a"/>` : ''}
${I4}${stage === 'evo5' ? `<path d="M 64 86 L 72 96" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/><circle cx="72" cy="96" r="2" fill="${accent}"/>` : ''}
${I3}</g>
${eyes(42, 58, headY - 2, 4.5, 5, `url(#${p}-iris)`, accent, '#e0f7fa')}
${mouths(headY + 8, accent, 7)}
${I3}${stage !== 'baby' ? `<text x="50" y="74" text-anchor="middle" font-size="3.5" fill="${accent}" opacity="0.45" font-family="monospace">${stage === 'evo5' ? 'UNIT-Ω' : stage === 'evo3' ? 'NX-01' : 'R-' + stage}</text>` : ''}`;

  return wrapStage('robot', stage, titles[label] || titles.baby, defs, body);
}

/* ═══════════════════════ PLANT ═══════════════════════ */
function plantStage(stage) {
  const p = `plant-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'sprout ward', kid: 'sapling scout', teen: 'blooming youth',
    adult: 'Worldroot Warden', middle: 'ancient oak', old: 'World Tree',
  };
  const label = stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'middle' : stage === 'evo5' ? 'old' : 'baby';
  const leaf = stage === 'evo5'
    ? [['0%', '#c5e1a5'], ['50%', '#558b2f'], ['100%', '#1b5e20']]
    : [['0%', '#aed581'], ['40%', '#7cb342'], ['100%', '#33691e']];
  const bark = [['0%', '#8d6e63'], ['50%', '#5d4037'], ['100%', '#3e2723']];
  const bloom = stage === 'evo2' || stage === 'evo3' ? '#f48fb1' : stage === 'evo5' ? '#ffd54f' : '#81c784';

  const defs = [
    grad(`${p}-leaf`, leaf, 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-bark`, bark, 'linear'),
    grad(`${p}-core`, [['0%', '#fffde7'], ['40%', bloom], ['100%', '#1b5e20', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#c6ff00'], ['100%', '#1b5e20']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-aura`, [['0%', '#76ff03', 0.25], ['100%', '#76ff03', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(94, 30)}
${stage === 'evo5' || stage === 'evo3' ? `${I3}<ellipse cx="50" cy="50" rx="42" ry="40" fill="url(#${p}-aura)"/>` : ''}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 74 Q 78 82 82 70 Q 84 62 76 64 Z" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1"/>
${I4}<path d="M 70 70 Q 76 68 78 72" stroke="#aed581" stroke-width="0.7" fill="none" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="24" cy="48" rx="10" ry="14" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(-28 24 48)"/>
${I4}<path d="M 24 40 Q 20 48 24 56" stroke="#1b5e20" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<circle cx="20" cy="44" r="1.5" fill="${bloom}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="76" cy="48" rx="10" ry="14" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(28 76 48)"/>
${I4}<path d="M 76 40 Q 80 48 76 56" stroke="#1b5e20" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<circle cx="80" cy="44" r="1.5" fill="${bloom}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Pot / roots base for early; trunk for later -->
${I4}${stage === 'baby' || stage === 'evo1'
    ? `<path d="M 34 78 L 38 92 L 62 92 L 66 78 Z" fill="url(#${p}-bark)" stroke="#3e2723" stroke-width="1.3"/>
${I4}<ellipse cx="50" cy="78" rx="17" ry="4" fill="#6d4c41"/>
${I4}<ellipse cx="50" cy="76" rx="14" ry="3" fill="#4e342e"/>
${I4}<circle cx="44" cy="74" r="1.5" fill="#8d6e63" opacity="0.5"/>
${I4}<circle cx="56" cy="75" r="1.2" fill="#8d6e63" opacity="0.45"/>`
    : `<path d="M 40 70 Q 38 50 42 36 Q 50 28 58 36 Q 62 50 60 70 Q 56 88 50 90 Q 44 88 40 70 Z" fill="url(#${p}-bark)" stroke="#3e2723" stroke-width="1.5"/>
${I4}<path d="M 44 48 Q 48 60 46 72" stroke="#3e2723" stroke-width="1" fill="none" opacity="0.4"/>
${I4}<path d="M 56 50 Q 54 62 55 74" stroke="#3e2723" stroke-width="1" fill="none" opacity="0.35"/>`}
${I4}<!-- Canopy / bulb head -->
${I4}<ellipse cx="50" cy="${stage === 'baby' ? 48 : 40}" rx="${stage === 'baby' ? 16 : 20}" ry="${stage === 'baby' ? 16 : 18}" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="1.5"/>
${I4}<ellipse cx="42" cy="${stage === 'baby' ? 42 : 34}" rx="7" ry="4" fill="#c5e1a5" opacity="0.35"/>
${I4}<circle cx="50" cy="${stage === 'baby' ? 52 : 46}" r="6" fill="url(#${p}-core)"/>
${I4}<circle cx="48" cy="${stage === 'baby' ? 50 : 44}" r="1.5" fill="#fff" opacity="0.45"/>
${I4}<!-- Leaf tufts -->
${I4}<ellipse cx="38" cy="30" rx="6" ry="9" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(-30 38 30)"/>
${I4}<ellipse cx="62" cy="30" rx="6" ry="9" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(30 62 30)"/>
${I4}<ellipse cx="50" cy="24" rx="5" ry="8" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9"/>
${I4}${stage === 'evo2' || stage === 'evo3' || stage === 'evo5' ? `
${I4}<circle cx="40" cy="28" r="3" fill="${bloom}" opacity="0.8"/>
${I4}<circle cx="60" cy="28" r="3" fill="${bloom}" opacity="0.8"/>
${I4}<circle cx="50" cy="22" r="2.5" fill="#fff59d" opacity="0.7"/>` : ''}
${I4}${stage === 'evo5' ? `
${I4}<circle cx="30" cy="40" r="2" fill="#ffd54f" opacity="0.6"/>
${I4}<circle cx="70" cy="42" r="2" fill="#ffd54f" opacity="0.55"/>
${I4}<circle cx="50" cy="16" r="2.5" fill="#fff" opacity="0.4"/>
${I4}<path d="M 44 56 L 48 56 M 46 54 L 46 58" stroke="#ffd54f" stroke-width="0.8" opacity="0.5"/>` : ''}
${I4}<circle cx="36" cy="50" r="1.4" fill="#1b5e20" opacity="0.3"/>
${I4}<circle cx="64" cy="52" r="1.4" fill="#1b5e20" opacity="0.3"/>
${I4}<circle cx="46" cy="60" r="1.1" fill="#1b5e20" opacity="0.25"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 32 58 Q 18 56 14 48 Q 12 42 18 44" fill="none" stroke="url(#${p}-leaf)" stroke-width="5" stroke-linecap="round"/>
${I4}<ellipse cx="14" cy="44" rx="5" ry="6" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 68 58 Q 82 56 86 48 Q 88 42 82 44" fill="none" stroke="url(#${p}-leaf)" stroke-width="5" stroke-linecap="round"/>
${I4}<ellipse cx="86" cy="44" rx="5" ry="6" fill="url(#${p}-leaf)" stroke="#33691e" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 86 Q 34 92 36 96" stroke="url(#${p}-bark)" stroke-width="4" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="36" cy="96" rx="5" ry="2.5" fill="#3e2723"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 86 Q 66 92 64 96" stroke="url(#${p}-bark)" stroke-width="4" fill="none" stroke-linecap="round"/>
${I4}<ellipse cx="64" cy="96" rx="5" ry="2.5" fill="#3e2723"/>
${I3}</g>
${eyes(42, 58, stage === 'baby' ? 44 : 38, 5, 5.5, `url(#${p}-iris)`, '#33691e', '#e8f5e9')}
${mouths(stage === 'baby' ? 56 : 50, '#33691e', 7)}`;

  return wrapStage('plant', stage, titles[label], defs, body);
}

/* ═══════════════════════ GHOST ═══════════════════════ */
function ghostStage(stage) {
  const p = `ghost-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'spectral droplet', kid: 'sheet wraith', teen: 'veiled stalker',
    adult: 'Veil Wraith', middle: 'chain phantom', old: 'eternal phantom',
  };
  const label = stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'middle' : stage === 'evo5' ? 'old' : 'baby';
  const bodyC = stage === 'evo5'
    ? [['0%', '#ede7f6', 0.95], ['40%', '#7e57c2', 0.85], ['100%', '#1a237e', 0.9]]
    : [['0%', '#e1bee7', 0.9], ['35%', '#9575cd', 0.88], ['100%', '#311b92', 0.95]];
  const accent = stage === 'evo5' ? '#80deea' : '#ce93d8';

  const defs = [
    grad(`${p}-body`, bodyC, 'radial', 'cx="42%" cy="28%" r="75%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['40%', accent], ['100%', '#311b92', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ea80fc'], ['100%', '#1a237e']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-aura`, [['0%', accent, 0.3], ['100%', accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-wisp`, [['0%', '#b39ddb', 0.8], ['100%', '#311b92', 0.2]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(94, 28)}
${I3}<ellipse cx="50" cy="55" rx="40" ry="38" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 78 Q 72 90 78 70 Q 80 58 70 62 Q 62 70 58 78 Z" fill="url(#${p}-wisp)" opacity="0.85"/>
${I4}<path d="M 66 72 Q 74 78 76 68" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<circle cx="74" cy="66" r="2" fill="${accent}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 50 Q 10 40 8 55 Q 10 68 24 60 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.9" opacity="0.8"/>
${I4}<path d="M 20 48 Q 12 52 16 58" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 50 Q 90 40 92 55 Q 90 68 76 60 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.9" opacity="0.8"/>
${I4}<path d="M 80 48 Q 88 52 84 58" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 28 58 Q 24 36 36 26 Q 50 16 64 26 Q 76 36 72 58 Q 70 78 60 86 Q 50 92 40 86 Q 30 78 28 58 Z"
${I4}      fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3" opacity="0.92"/>
${I4}<!-- Hood / veil -->
${I4}<path d="M 32 40 Q 50 22 68 40 Q 66 34 50 28 Q 34 34 32 40 Z" fill="#1a237e" opacity="0.45"/>
${I4}<ellipse cx="42" cy="36" rx="8" ry="5" fill="#fff" opacity="0.12"/>
${I4}<circle cx="50" cy="58" r="9" fill="url(#${p}-core)" opacity="0.85"/>
${I4}<circle cx="50" cy="58" r="4" fill="#fff" opacity="0.45"/>
${I4}<!-- Wisp dots -->
${I4}<circle cx="36" cy="64" r="2.2" fill="${accent}" opacity="0.4"/>
${I4}<circle cx="64" cy="66" r="1.8" fill="#e1bee7" opacity="0.35"/>
${I4}<circle cx="44" cy="74" r="1.5" fill="${accent}" opacity="0.3"/>
${I4}<circle cx="56" cy="76" r="1.3" fill="#b39ddb" opacity="0.3"/>
${I4}${stage === 'evo3' || stage === 'evo5' ? `
${I4}<path d="M 40 48 L 38 54 L 42 52 Z" fill="${accent}" opacity="0.5"/>
${I4}<path d="M 60 48 L 58 54 L 62 52 Z" fill="${accent}" opacity="0.5"/>` : ''}
${I4}${stage === 'evo5' ? `
${I4}<ellipse cx="50" cy="34" rx="3.5" ry="2.8" fill="#0a0a12" stroke="${accent}" stroke-width="1"/>
${I4}<ellipse cx="50" cy="34" rx="1.8" ry="1.4" fill="url(#${p}-iris)"/>
${I4}<circle cx="50.5" cy="33.2" r="0.6" fill="#fff"/>
${I4}<path d="M 34 56 L 38 56 M 36 54 L 36 58" stroke="${accent}" stroke-width="0.8" opacity="0.45"/>
${I4}<circle cx="62" cy="54" r="2.5" fill="none" stroke="${accent}" stroke-width="0.7" opacity="0.4"/>` : ''}
${I4}<!-- Bottom tendrils -->
${I4}<path d="M 38 86 Q 36 94 40 96" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 50 90 Q 50 98 52 100" stroke="url(#${p}-wisp)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.75"/>
${I4}<path d="M 62 86 Q 64 94 60 96" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 30 58 Q 14 60 10 48 Q 8 40 16 42" fill="none" stroke="url(#${p}-body)" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
${I4}<path d="M 12 42 L 6 36 M 12 44 L 4 44 M 14 46 L 8 50" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 70 58 Q 86 60 90 48 Q 92 40 84 42" fill="none" stroke="url(#${p}-body)" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
${I4}<path d="M 88 42 L 94 36 M 88 44 L 96 44 M 86 46 L 92 50" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="90" rx="7" ry="4" fill="url(#${p}-wisp)" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="90" rx="7" ry="4" fill="url(#${p}-wisp)" opacity="0.7"/>
${I3}</g>
${eyes(40, 60, 42, 6, 6.5, `url(#${p}-iris)`, accent, '#f3e5f5')}
${mouths(54, accent, 8)}`;

  return wrapStage('ghost', stage, titles[label], defs, body);
}

/* ═══════════════════════ CAT ═══════════════════════ */
function catStage(stage) {
  const p = `cat-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'moon kitten', kid: 'mystic cub', teen: 'lunar stalker',
    adult: 'Moonfang Oracle', middle: 'scarred lucky', old: 'silver sage',
  };
  const label = stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'middle' : stage === 'evo5' ? 'old' : 'baby';
  const fur = stage === 'evo5'
    ? [['0%', '#eceff1'], ['40%', '#90a4ae'], ['100%', '#546e7a']]
    : stage === 'evo4'
      ? [['0%', '#ffcc80'], ['45%', '#ef6c00'], ['100%', '#bf360c']]
      : [['0%', '#ffe0b2'], ['35%', '#ff9800'], ['100%', '#e65100']];
  const mark = '#ff6090';

  const defs = [
    grad(`${p}-fur`, fur, 'radial', 'cx="38%" cy="28%" r="75%"'),
    grad(`${p}-belly`, [['0%', '#fff8e1'], ['100%', '#ffe0b2']], 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(`${p}-iris`, [['0%', '#80d8ff'], ['60%', '#0277bd'], ['100%', '#01579b']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-ear`, [['0%', '#f8bbd0'], ['100%', '#c2185b']], 'linear'),
    grad(`${p}-aura`, [['0%', '#ff80ab', 0.28], ['100%', '#ff80ab', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(94, 28)}
${stage === 'evo3' || stage === 'evo5' ? `${I3}<ellipse cx="50" cy="52" rx="38" ry="36" fill="url(#${p}-aura)"/>` : ''}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 70 Q 84 60 88 48 Q 90 40 84 42 Q 76 50 70 66 Z" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.2"/>
${I4}<ellipse cx="86" cy="44" rx="4" ry="5" fill="${mark}" opacity="0.45"/>
${I4}<path d="M 74 58 Q 82 52 84 46" stroke="#fff3e0" stroke-width="0.8" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<!-- Lunar flare / ear-wing -->
${I4}<path d="M 30 36 L 18 22 L 26 38 Z" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1"/>
${I4}<path d="M 28 34 L 20 26" stroke="${mark}" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 36 L 82 22 L 74 38 Z" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1"/>
${I4}<path d="M 72 34 L 80 26" stroke="${mark}" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="64" rx="22" ry="20" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.5"/>
${I4}<ellipse cx="50" cy="68" rx="14" ry="12" fill="url(#${p}-belly)"/>
${I4}<path d="M 42 64 Q 50 66 58 64" stroke="#ffe0b2" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<!-- Head -->
${I4}<ellipse cx="50" cy="40" rx="18" ry="16" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.5"/>
${I4}<ellipse cx="42" cy="34" rx="6" ry="3.5" fill="#fff" opacity="0.2"/>
${I4}<!-- Ears -->
${I4}<path d="M 34 30 L 28 14 L 42 26 Z" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.2"/>
${I4}<path d="M 34 28 L 30 18 L 38 26 Z" fill="url(#${p}-ear)" opacity="0.85"/>
${I4}<path d="M 66 30 L 72 14 L 58 26 Z" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.2"/>
${I4}<path d="M 66 28 L 70 18 L 62 26 Z" fill="url(#${p}-ear)" opacity="0.85"/>
${I4}<!-- Crescent mark -->
${I4}<path d="M 50 28 Q 46 32 50 36 Q 54 32 50 28" fill="none" stroke="${mark}" stroke-width="1.4" opacity="0.8"/>
${I4}<circle cx="50" cy="32" r="1.2" fill="${mark}" opacity="0.7"/>
${I4}<!-- Cheeks / muzzle -->
${I4}<ellipse cx="50" cy="46" rx="8" ry="5" fill="url(#${p}-belly)"/>
${I4}<circle cx="47" cy="46" r="1" fill="#5d4037"/>
${I4}<circle cx="53" cy="46" r="1" fill="#5d4037"/>
${I4}<!-- Whiskers -->
${I4}<path d="M 40 44 L 28 42 M 40 46 L 28 46 M 40 48 L 30 50" stroke="#fff" stroke-width="0.7" opacity="0.55"/>
${I4}<path d="M 60 44 L 72 42 M 60 46 L 72 46 M 60 48 L 70 50" stroke="#fff" stroke-width="0.7" opacity="0.55"/>
${I4}<!-- Fur tufts -->
${I4}<circle cx="38" cy="58" r="1.3" fill="#e65100" opacity="0.25"/>
${I4}<circle cx="62" cy="58" r="1.3" fill="#e65100" opacity="0.25"/>
${I4}<circle cx="44" cy="72" r="1.1" fill="#e65100" opacity="0.2"/>
${I4}<circle cx="56" cy="72" r="1.1" fill="#e65100" opacity="0.2"/>
${I4}${stage === 'evo3' || stage === 'evo5' ? `
${I4}<path d="M 40 54 Q 50 58 60 54" fill="none" stroke="${mark}" stroke-width="1.2" opacity="0.6"/>
${I4}<circle cx="50" cy="56" r="2" fill="${mark}" opacity="0.4"/>` : ''}
${I4}${stage === 'evo5' ? `
${I4}<ellipse cx="50" cy="22" rx="14" ry="3" fill="none" stroke="#eceff1" stroke-width="1.2" opacity="0.5"/>
${I4}<circle cx="36" cy="22" r="1.5" fill="#fff" opacity="0.5"/>
${I4}<circle cx="64" cy="22" r="1.5" fill="#fff" opacity="0.5"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="30" cy="62" rx="6" ry="9" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.1" transform="rotate(-20 30 62)"/>
${I4}<ellipse cx="26" cy="72" rx="5" ry="4" fill="url(#${p}-belly)" stroke="#e65100" stroke-width="0.8"/>
${I4}<circle cx="24" cy="72" r="1" fill="${mark}" opacity="0.6"/>
${I4}<circle cx="27" cy="74" r="1" fill="${mark}" opacity="0.6"/>
${I4}<circle cx="28" cy="71" r="1" fill="${mark}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="70" cy="62" rx="6" ry="9" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.1" transform="rotate(20 70 62)"/>
${I4}<ellipse cx="74" cy="72" rx="5" ry="4" fill="url(#${p}-belly)" stroke="#e65100" stroke-width="0.8"/>
${I4}<circle cx="72" cy="72" r="1" fill="${mark}" opacity="0.6"/>
${I4}<circle cx="75" cy="74" r="1" fill="${mark}" opacity="0.6"/>
${I4}<circle cx="76" cy="71" r="1" fill="${mark}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="86" rx="7" ry="5" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.1"/>
${I4}<ellipse cx="40" cy="88" rx="5" ry="2.5" fill="url(#${p}-belly)"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="86" rx="7" ry="5" fill="url(#${p}-fur)" stroke="#e65100" stroke-width="1.1"/>
${I4}<ellipse cx="60" cy="88" rx="5" ry="2.5" fill="url(#${p}-belly)"/>
${I3}</g>
${eyes(42, 58, 38, 5.5, 6, `url(#${p}-iris)`, '#e65100', '#fff')}
${mouths(50, '#e65100', 5)}`;

  return wrapStage('cat', stage, titles[label], defs, body);
}

/* ═══════════════════════ PHOENIX ═══════════════════════ */
function phoenixStage(stage) {
  const p = `phoenix-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'ember chick', kid: 'flame fledgling', teen: 'solar youth',
    adult: 'Ashborn Phoenix', middle: 'crimson elder', old: 'immortal ashborn',
  };
  const label = stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'middle' : stage === 'evo5' ? 'old' : 'baby';
  const plumage = stage === 'evo5'
    ? [['0%', '#fff8e1'], ['35%', '#ffecb3'], ['70%', '#ff8a65'], ['100%', '#bf360c']]
    : stage === 'evo4'
      ? [['0%', '#ff8a65'], ['40%', '#ff3d00'], ['100%', '#b71c1c']]
      : [['0%', '#ffe57f'], ['30%', '#ff6d00'], ['100%', '#dd2c00']];
  const accent = stage === 'evo5' ? '#fff59d' : '#ffea00';

  const defs = [
    grad(`${p}-body`, plumage, 'radial', 'cx="40%" cy="30%" r="75%"'),
    grad(`${p}-wing`, [['0%', '#ffea00', 0.95], ['50%', '#ff6d00', 0.9], ['100%', '#bf360c', 0.85]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fffde7'], ['40%', accent], ['100%', '#ff3d00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ffecb3'], ['50%', '#ff6d00'], ['100%', '#bf360c']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-aura`, [['0%', '#ff6d00', 0.35], ['100%', '#ff6d00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(94, 30)}
${I3}<ellipse cx="50" cy="52" rx="42" ry="40" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 72 Q 70 88 78 60 Q 82 48 74 52 Q 64 60 58 72 Z" fill="url(#${p}-wing)" stroke="#bf360c" stroke-width="1.1"/>
${I4}<path d="M 62 74 Q 72 92 80 68" fill="url(#${p}-wing)" opacity="0.75" stroke="#e65100" stroke-width="0.8"/>
${I4}<path d="M 66 70 Q 76 86 84 64" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.6"/>
${I4}<circle cx="78" cy="58" r="2" fill="${accent}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 34 52 Q 8 36 6 58 Q 8 72 20 68 Q 28 62 34 56 Z" fill="url(#${p}-wing)" stroke="#bf360c" stroke-width="1.3"/>
${I4}<path d="M 28 50 Q 14 42 12 54" stroke="${accent}" stroke-width="0.9" fill="none" opacity="0.55"/>
${I4}<path d="M 26 56 Q 14 52 14 62" stroke="#ff8a65" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<path d="M 24 60 Q 16 58 16 66" stroke="#ff3d00" stroke-width="0.7" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 66 52 Q 92 36 94 58 Q 92 72 80 68 Q 72 62 66 56 Z" fill="url(#${p}-wing)" stroke="#bf360c" stroke-width="1.3"/>
${I4}<path d="M 72 50 Q 86 42 88 54" stroke="${accent}" stroke-width="0.9" fill="none" opacity="0.55"/>
${I4}<path d="M 74 56 Q 86 52 86 62" stroke="#ff8a65" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<path d="M 76 60 Q 84 58 84 66" stroke="#ff3d00" stroke-width="0.7" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="58" rx="18" ry="22" fill="url(#${p}-body)" stroke="#bf360c" stroke-width="1.5"/>
${I4}<ellipse cx="44" cy="50" rx="7" ry="5" fill="#fff" opacity="0.2"/>
${I4}<circle cx="50" cy="58" r="8" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="58" r="3.5" fill="#fffde7" opacity="0.7"/>
${I4}<!-- Head -->
${I4}<ellipse cx="50" cy="34" rx="14" ry="13" fill="url(#${p}-body)" stroke="#bf360c" stroke-width="1.4"/>
${I4}<!-- Crest / solar crown -->
${I4}<path d="M 42 24 L 40 12 L 46 22 Z" fill="url(#${p}-wing)" stroke="#bf360c" stroke-width="0.8"/>
${I4}<path d="M 50 22 L 50 8 L 54 20 Z" fill="${accent}" stroke="#bf360c" stroke-width="0.8"/>
${I4}<path d="M 58 24 L 60 12 L 54 22 Z" fill="url(#${p}-wing)" stroke="#bf360c" stroke-width="0.8"/>
${I4}${stage === 'evo3' || stage === 'evo5' ? `
${I4}<path d="M 38 20 L 34 10 L 42 18 Z" fill="#ff8a65" opacity="0.8"/>
${I4}<path d="M 62 20 L 66 10 L 58 18 Z" fill="#ff8a65" opacity="0.8"/>` : ''}
${I4}<!-- Beak base (mouth paths overlay) -->
${I4}<path d="M 46 40 L 50 46 L 54 40 Z" fill="#ff6d00" stroke="#bf360c" stroke-width="0.7" opacity="0.85"/>
${I4}<!-- Ember particles -->
${I4}<circle cx="36" cy="48" r="1.8" fill="${accent}" opacity="0.55"/>
${I4}<circle cx="64" cy="50" r="1.5" fill="#ff6d00" opacity="0.5"/>
${I4}<circle cx="42" cy="70" r="1.4" fill="#ff3d00" opacity="0.4"/>
${I4}<circle cx="58" cy="72" r="1.2" fill="${accent}" opacity="0.4"/>
${I4}${stage === 'evo5' ? `
${I4}<circle cx="28" cy="40" r="2" fill="#fff" opacity="0.45"/>
${I4}<circle cx="72" cy="38" r="2" fill="#fff" opacity="0.4"/>
${I4}<circle cx="50" cy="16" r="1.5" fill="#fffde7" opacity="0.6"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="32" cy="58" rx="5" ry="8" fill="url(#${p}-body)" stroke="#bf360c" stroke-width="1" transform="rotate(-25 32 58)"/>
${I4}<path d="M 28 66 L 24 72 M 30 68 L 28 74 M 32 66 L 34 72" stroke="#ff6d00" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="68" cy="58" rx="5" ry="8" fill="url(#${p}-body)" stroke="#bf360c" stroke-width="1" transform="rotate(25 68 58)"/>
${I4}<path d="M 68 66 L 66 72 M 70 68 L 72 74 M 72 66 L 76 72" stroke="#ff6d00" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 78 L 38 90" stroke="#ff6d00" stroke-width="2.5" stroke-linecap="round"/>
${I4}<path d="M 38 90 L 34 94 M 38 90 L 38 96 M 38 90 L 42 94" stroke="#bf360c" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 78 L 62 90" stroke="#ff6d00" stroke-width="2.5" stroke-linecap="round"/>
${I4}<path d="M 62 90 L 58 94 M 62 90 L 62 96 M 62 90 L 66 94" stroke="#bf360c" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${eyes(42, 58, 32, 5, 5.5, `url(#${p}-iris)`, '#bf360c', '#fffde7')}
${I3}<path class="tm-mascot-mouth-happy" d="M 46 42 Q 50 48 54 42" stroke="#bf360c" stroke-width="1.8" fill="#ff6d00" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M 46 44 Q 50 40 54 44" stroke="#bf360c" stroke-width="1.8" fill="#ff6d00" stroke-linecap="round"/>`;

  return wrapStage('phoenix', stage, titles[label], defs, body);
}

/* ═══════════════════════ CRYSTAL ═══════════════════════ */
function crystalStage(stage) {
  const p = `crystal-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'gem shard', kid: 'prism cluster', teen: 'facet warrior',
    adult: 'Prism Titan', middle: 'veined colossus', old: 'eternal crystal',
  };
  const label = stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'middle' : stage === 'evo5' ? 'old' : 'baby';
  const gem = stage === 'evo5'
    ? [['0%', '#e1bee7'], ['35%', '#4dd0e1'], ['100%', '#006064']]
    : stage === 'evo4'
      ? [['0%', '#80cbc4'], ['40%', '#00838f'], ['100%', '#004d40']]
      : [['0%', '#e0f7fa'], ['30%', '#4dd0e1'], ['100%', '#00838f']];
  const core = stage === 'evo5' ? '#ea80fc' : stage === 'evo4' ? '#ffab40' : '#76ff03';
  const accent = '#4dd0e1';

  const defs = [
    grad(`${p}-body`, gem, 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['35%', core], ['100%', '#006064', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#b2ebf2'], ['100%', '#006064']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-facet`, [['0%', '#fff', 0.7], ['100%', accent, 0.1]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-aura`, [['0%', accent, 0.3], ['100%', accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(94, 28)}
${I3}<ellipse cx="50" cy="55" rx="40" ry="38" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 74 L 82 86 L 78 70 L 70 68 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 70 72 L 78 80" stroke="#fff" stroke-width="0.7" opacity="0.4"/>
${I4}<circle cx="80" cy="84" r="1.5" fill="${core}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 48 L 12 32 L 16 52 L 10 58 L 28 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 24 44 L 14 36" stroke="#fff" stroke-width="0.8" opacity="0.45"/>
${I4}<path d="M 22 50 L 12 54" stroke="${core}" stroke-width="0.7" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 L 88 32 L 84 52 L 90 58 L 72 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 76 44 L 86 36" stroke="#fff" stroke-width="0.8" opacity="0.45"/>
${I4}<path d="M 78 50 L 88 54" stroke="${core}" stroke-width="0.7" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Faceted torso hex -->
${I4}<path d="M 50 28 L 68 40 L 68 64 L 50 78 L 32 64 L 32 40 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.6"/>
${I4}<path d="M 50 28 L 50 78" stroke="#fff" stroke-width="0.6" opacity="0.25"/>
${I4}<path d="M 32 40 L 68 64" stroke="#fff" stroke-width="0.5" opacity="0.2"/>
${I4}<path d="M 68 40 L 32 64" stroke="#006064" stroke-width="0.5" opacity="0.25"/>
${I4}<path d="M 40 36 L 50 42 L 44 50 Z" fill="url(#${p}-facet)"/>
${I4}<path d="M 58 38 L 62 48 L 54 46 Z" fill="#fff" opacity="0.2"/>
${I4}<circle cx="50" cy="54" r="9" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="54" r="4" fill="#fff" opacity="0.55"/>
${I4}<!-- Head crystal -->
${I4}<path d="M 50 18 L 60 30 L 50 36 L 40 30 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 44 28 L 50 22 L 50 32 Z" fill="url(#${p}-facet)"/>
${I4}<!-- Shoulder spikes -->
${I4}<path d="M 32 42 L 24 34 L 34 46 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.9"/>
${I4}<path d="M 68 42 L 76 34 L 66 46 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.9"/>
${I4}<circle cx="38" cy="60" r="1.5" fill="${core}" opacity="0.45"/>
${I4}<circle cx="62" cy="62" r="1.3" fill="${accent}" opacity="0.4"/>
${I4}<circle cx="46" cy="70" r="1.1" fill="#fff" opacity="0.3"/>
${I4}${stage === 'evo3' || stage === 'evo5' ? `
${I4}<path d="M 44 48 L 48 48 M 46 46 L 46 50" stroke="${core}" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M 52 50 Q 56 48 54 54" stroke="${core}" stroke-width="0.8" fill="none" opacity="0.5"/>` : ''}
${I4}${stage === 'evo5' ? `
${I4}<circle cx="28" cy="30" r="3" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.8" opacity="0.7"/>
${I4}<circle cx="72" cy="28" r="2.5" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.8" opacity="0.65"/>
${I4}<circle cx="50" cy="12" r="2" fill="${core}" opacity="0.55"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 32 56 L 18 48 L 20 66 L 28 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 20 66 L 14 74 L 18 72 L 22 76 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 68 56 L 82 48 L 80 66 L 72 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 80 66 L 86 74 L 82 72 L 78 76 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 78 L 36 92 L 44 92 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<ellipse cx="40" cy="92" rx="6" ry="2.5" fill="#006064"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 78 L 56 92 L 64 92 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<ellipse cx="60" cy="92" rx="6" ry="2.5" fill="#006064"/>
${I3}</g>
${eyes(43, 57, 30, 4.5, 5, `url(#${p}-iris)`, accent, '#e0f7fa')}
${mouths(40, accent, 6)}`;

  return wrapStage('crystal', stage, titles[label], defs, body);
}

function buildCharacter(char, headerLines, stageFn) {
  const stages = STAGES.map(stageFn).join('\n');
  return `${headerLines.join('\n')}\n\n${stages}\n`;
}

const sections = {
  robot: buildCharacter('robot', [
    `${I}<!-- ROBOT CHARACTER - All Life Stages (dense epic vector v2) -->`,
    `${I}<!-- Plasma & Code • Epic Rarity • Neon Colossus -->`,
    `${I}<!-- ═══════════════════════════════════════ -->`,
  ], robotStage),
  plant: buildCharacter('plant', [
    `${I}<!-- PLANT CHARACTER - All Life Stages (dense epic vector v2) -->`,
    `${I}<!-- Wildwood & Life • Rare Rarity • Worldroot Warden -->`,
    `${I}<!-- ═══════════════════════════════════════ -->`,
  ], plantStage),
  ghost: buildCharacter('ghost', [
    `${I}<!-- GHOST CHARACTER - All Life Stages (dense epic vector v2) -->`,
    `${I}<!-- Spirit & Void • Epic Rarity • Veil Wraith -->`,
    `${I}<!-- ═══════════════════════════════════════ -->`,
  ], ghostStage),
  cat: buildCharacter('cat', [
    `${I}<!-- CAT CHARACTER - All Life Stages (dense epic vector v2) -->`,
    `${I}<!-- Fate & Shadow • Rare Rarity • Moonfang Oracle -->`,
    `${I}<!-- ═══════════════════════════════════════ -->`,
  ], catStage),
  phoenix: buildCharacter('phoenix', [
    `${I}<!-- PHOENIX CHARACTER - All Life Stages (dense epic vector v2) -->`,
    `${I}<!-- Solar Flame • Legendary Rarity • Ashborn Phoenix -->`,
    `${I}<!-- ═══════════════════════════════════════ -->`,
  ], phoenixStage),
  crystal: buildCharacter('crystal', [
    `${I}<!-- CRYSTAL CHARACTER - All Life Stages (dense epic vector v2) -->`,
    `${I}<!-- Aether & Stone • Epic Rarity • Prism Titan -->`,
    `${I}<!-- ═══════════════════════════════════════ -->`,
  ], crystalStage),
};

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

const jobs = [
  { name: 'robot', start: '                <!-- ROBOT CHARACTER - All Life Stages -->', end: '                <!-- SLIME CHARACTER - All Life Stages (gooey blob v3) -->', svg: sections.robot },
  { name: 'plant', start: '                <!-- PLANT CHARACTER - All Life Stages -->', end: '                <!-- GHOST CHARACTER - All Life Stages -->', svg: sections.plant },
  { name: 'ghost', start: '                <!-- GHOST CHARACTER - All Life Stages -->', end: '                <!-- CAT CHARACTER - All Life Stages -->', svg: sections.ghost },
  { name: 'cat', start: '                <!-- CAT CHARACTER - All Life Stages -->', end: '                <!-- PHOENIX CHARACTER - All Life Stages -->', svg: sections.cat },
  { name: 'phoenix', start: '                <!-- PHOENIX CHARACTER - All Life Stages -->', end: '                <!-- CRYSTAL CHARACTER - All Life Stages -->', svg: sections.phoenix },
  { name: 'crystal', start: '                <!-- CRYSTAL CHARACTER - All Life Stages -->', end: '                <!-- Integrated accessories (anchor-local art, positioned by layoutMascotAccessory) -->', svg: sections.crystal },
];

// Forward order: each job's end marker is the NEXT section's start comment,
// which must not already have been rewritten.
for (const job of jobs) {
  src = replaceBetween(src, job.start, job.end, normalize(job.svg));
  console.log('replaced', job.name);
}

const issues = [];
for (const c of Object.keys(sections)) {
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-${c}`;
    const idx = src.indexOf(`id="${id}"`);
    if (idx < 0) { issues.push(`missing ${id}`); continue; }
    const next = src.indexOf('id="tm-mascot-', idx + 12);
    const chunk = src.slice(idx, next > 0 ? next : idx + 12000);
    for (const h of HOOKS) {
      if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
    }
  }
}
if (issues.length) {
  console.error('VALIDATION FAILED', issues.length);
  issues.slice(0, 50).forEach((i) => console.error(' -', i));
  process.exit(1);
}

fs.writeFileSync(path, src);
console.log('OK wrote', path, 'chars', src.length);
