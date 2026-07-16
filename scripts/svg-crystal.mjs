/**
 * Prism Titan — dense cute epic v3 (6 life stages)
 * Export for apply-cute-epic-svgs.mjs
 */

const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="30%" r="75%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function glossyEyes(lx, rx, cy, rxEye, ryEye, iris, stroke, sclera = '#e0f7fa') {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.5}" rx="${rxEye * 0.55}" ry="${ryEye * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.5}" rx="${rxEye * 0.55}" ry="${ryEye * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.8}" rx="${rxEye * 0.28}" ry="${ryEye * 0.35}" fill="#050508"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.8}" rx="${rxEye * 0.28}" ry="${ryEye * 0.35}" fill="#050508"/>
${I4}<circle cx="${lx + 1.5}" cy="${cy - ryEye * 0.35}" r="${Math.max(1.2, rxEye * 0.28)}" fill="#fff"/>
${I4}<circle cx="${rx + 1.5}" cy="${cy - ryEye * 0.35}" r="${Math.max(1.2, rxEye * 0.28)}" fill="#fff"/>
${I4}<circle cx="${lx - rxEye * 0.35}" cy="${cy + ryEye * 0.35}" r="${Math.max(0.6, rxEye * 0.12)}" fill="#b2ebf2" opacity="0.75"/>
${I4}<circle cx="${rx - rxEye * 0.35}" cy="${cy + ryEye * 0.35}" r="${Math.max(0.6, rxEye * 0.12)}" fill="#b2ebf2" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxEye} ${cy} Q ${lx} ${cy - 3} ${lx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxEye} ${cy} Q ${rx} ${cy - 3} ${rx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Chevron soft mouths for crystal */
function chevronMouths(y, stroke) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - 5} ${y} L 50 ${y + 5} L ${50 + 5} ${y}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - 5} ${y + 4} L 50 ${y - 1} L ${50 + 5} ${y + 4}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function shadow(cy = 92, rx = 26, opacity = 0.2) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="5" fill="#1a1a1a" opacity="${opacity}"/>`;
}

function shardFin(side, p, accent, core, flip = 1) {
  const x = flip < 0 ? 30 : 70;
  const tip = flip < 0 ? 10 : 90;
  const mid = flip < 0 ? 16 : 84;
  const base = flip < 0 ? 28 : 72;
  return `${I3}<g class="tm-animate-wing-${side}">
${I4}<path d="M ${base} 48 L ${tip} 30 L ${mid} 50 L ${tip + flip * 2} 58 L ${base - flip * 2} 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M ${mid} 44 L ${tip + flip * 4} 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
${I4}<path d="M ${mid + flip * 2} 50 L ${tip} 54" stroke="${core}" stroke-width="0.65" opacity="0.4"/>
${I4}<circle cx="${tip + flip * 3}" cy="34" r="1.3" fill="${core}" opacity="0.55"/>
${I3}</g>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- CRYSTAL ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-crystal" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function crystalStage(stage) {
  const p = `crystal-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'round gem spawn',
    evo1: 'prism cluster',
    evo2: 'facet warrior',
    evo3: 'Prism Titan',
    evo4: 'veined colossus',
    evo5: 'eternal crystal',
  };

  const gem = stage === 'evo5'
    ? [['0%', '#f3e5f5'], ['30%', '#b39ddb'], ['60%', '#7e57c2'], ['100%', '#311b92']]
    : stage === 'evo4'
      ? [['0%', '#80cbc4'], ['30%', '#546e7a'], ['60%', '#455a64'], ['100%', '#263238']]
      : stage === 'evo3'
        ? [['0%', '#e0f7fa'], ['30%', '#4dd0e1'], ['65%', '#00838f'], ['100%', '#006064']]
        : stage === 'evo2'
          ? [['0%', '#b2ebf2'], ['35%', '#26c6da'], ['100%', '#00838f']]
          : stage === 'evo1'
            ? [['0%', '#e0f7fa'], ['40%', '#80deea'], ['100%', '#0097a7']]
            : [['0%', '#e0f7fa'], ['45%', '#80deea'], ['100%', '#4dd0e1']];

  const accent = stage === 'evo5' ? '#ce93d8' : stage === 'evo4' ? '#ffab40' : '#4dd0e1';
  const core = stage === 'evo5' ? '#ea80fc' : stage === 'evo4' ? '#ff6d00' : '#76ff03';
  const stroke = stage === 'evo5' ? '#7b1fa2' : stage === 'evo4' ? '#37474f' : '#006064';

  const defs = [
    grad(`${p}-body`, gem, 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['35%', core], ['100%', stroke, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, stage === 'evo5'
      ? [['0%', '#e1bee7'], ['100%', '#4a148c']]
      : [['0%', '#b2ebf2'], ['100%', '#006064']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-facet`, [['0%', '#fff', 0.75], ['100%', accent, 0.08]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-aura`, [['0%', stage === 'evo5' ? '#ea80fc' : accent, stage === 'evo5' ? 0.38 : 0.28], ['100%', accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    ...(stage === 'evo4' ? [grad(`${p}-vein`, [['0%', '#ffab40', 0.9], ['100%', '#e65100', 0.4]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"')] : []),
  ].join('\n');

  // ── BABY: round gem, cute facet face ──
  if (stage === 'baby') {
    const body = `${shadow(90, 22, 0.18)}
${I3}<ellipse cx="50" cy="54" rx="34" ry="32" fill="url(#${p}-aura)" opacity="0.6"/>
${shardFin('left', p, accent, core, -1)}
${shardFin('right', p, accent, core, 1)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 68 L 74 78 L 70 66 L 64 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<path d="M 68 70 L 72 74" stroke="#fff" stroke-width="0.6" opacity="0.4"/>
${I4}<circle cx="74" cy="76" r="1.5" fill="${core}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Round gem body -->
${I4}<circle cx="50" cy="58" r="20" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.8"/>
${I4}<path d="M 50 38 L 50 78" stroke="#fff" stroke-width="0.7" opacity="0.35"/>
${I4}<path d="M 34 50 L 66 66" stroke="#fff" stroke-width="0.55" opacity="0.25"/>
${I4}<path d="M 66 50 L 34 66" stroke="${stroke}" stroke-width="0.5" opacity="0.25"/>
${I4}<path d="M 42 46 L 50 52 L 44 58 Z" fill="url(#${p}-facet)"/>
${I4}<path d="M 56 48 L 60 54 L 54 56 Z" fill="#fff" opacity="0.22"/>
${I4}<circle cx="50" cy="58" r="8" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="58" r="3.5" fill="#fff" opacity="0.65"/>
${I4}<!-- Facet face plate -->
${I4}<path d="M 50 32 L 62 42 L 50 48 L 38 42 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.4"/>
${I4}<path d="M 44 40 L 50 34 L 50 44 Z" fill="url(#${p}-facet)"/>
${I4}<circle cx="38" cy="56" r="1.3" fill="${core}" opacity="0.4"/>
${I4}<circle cx="62" cy="58" r="1.2" fill="${accent}" opacity="0.35"/>
${I4}<circle cx="34" cy="52" r="1.1" fill="#fff" opacity="0.28"/>
${I4}<circle cx="66" cy="54" r="1.1" fill="#fff" opacity="0.26"/>
${I4}<path d="M 46 52 L 50 56 L 54 52" stroke="${accent}" stroke-width="0.7" fill="none" opacity="0.35"/>
${I4}<ellipse cx="44" cy="62" rx="2" ry="1.5" fill="#fff" opacity="0.18"/>
${I4}<ellipse cx="56" cy="64" rx="2" ry="1.5" fill="#fff" opacity="0.16"/>
${I4}<circle cx="50" cy="40" r="1.2" fill="${core}" opacity="0.35"/>
${I4}<circle cx="40" cy="68" r="1.1" fill="#fff" opacity="0.2"/>
${I4}<circle cx="60" cy="70" r="1.1" fill="#fff" opacity="0.19"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 58 L 24 52 L 26 66 L 32 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<circle cx="24" cy="54" r="1.2" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 58 L 76 52 L 74 66 L 68 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<circle cx="76" cy="54" r="1.2" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 76 L 38 88 L 46 88 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<ellipse cx="42" cy="88" rx="5" ry="2" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 76 L 54 88 L 62 88 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<ellipse cx="58" cy="88" rx="5" ry="2" fill="${stroke}"/>
${I3}</g>
${glossyEyes(42, 58, 38, 6.5, 7.5, `url(#${p}-iris)`, accent)}
${chevronMouths(46, accent)}`;
    return wrapStage(stage, titles.baby, defs, body);
  }

  // ── EVO1: cluster body ──
  if (stage === 'evo1') {
    const body = `${shadow(92, 26, 0.2)}
${I3}<ellipse cx="50" cy="52" rx="38" ry="36" fill="url(#${p}-aura)"/>
${shardFin('left', p, accent, core, -1)}
${shardFin('right', p, accent, core, 1)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 72 L 82 84 L 76 68 L 68 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 72 74 L 78 80" stroke="#fff" stroke-width="0.65" opacity="0.4"/>
${I4}<circle cx="80" cy="82" r="1.8" fill="${core}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Cluster nodes -->
${I4}<circle cx="42" cy="60" r="10" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<circle cx="58" cy="58" r="11" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<circle cx="50" cy="68" r="9" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 42 52 L 50 48 L 58 52" stroke="#fff" stroke-width="0.6" opacity="0.3" fill="none"/>
${I4}<path d="M 44 66 L 50 62 L 56 66" stroke="#fff" stroke-width="0.55" opacity="0.25" fill="none"/>
${I4}<circle cx="50" cy="62" r="7" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="62" r="3" fill="#fff" opacity="0.6"/>
${I4}<path d="M 50 30 L 60 40 L 50 46 L 40 40 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 44 38 L 50 32 L 50 42 Z" fill="url(#${p}-facet)"/>
${I4}<circle cx="38" cy="56" r="1.5" fill="${core}" opacity="0.45"/>
${I4}<circle cx="62" cy="54" r="1.4" fill="${accent}" opacity="0.4"/>
${I4}<circle cx="46" cy="72" r="1.2" fill="#fff" opacity="0.3"/>
${I4}<circle cx="36" cy="54" r="1.2" fill="#fff" opacity="0.25"/>
${I4}<circle cx="64" cy="56" r="1.1" fill="#fff" opacity="0.24"/>
${I4}<path d="M 46 52 L 50 56 L 54 52" stroke="${accent}" stroke-width="0.7" fill="none" opacity="0.32"/>
${I4}<ellipse cx="44" cy="64" rx="2" ry="1.4" fill="#fff" opacity="0.16"/>
${I4}<ellipse cx="56" cy="66" rx="2" ry="1.4" fill="#fff" opacity="0.15"/>
${I4}<circle cx="50" cy="38" r="1.3" fill="${core}" opacity="0.38"/>
${I4}<circle cx="34" cy="60" r="1.1" fill="#fff" opacity="0.22"/>
${I4}<circle cx="66" cy="62" r="1.1" fill="#fff" opacity="0.21"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 32 58 L 18 50 L 20 68 L 28 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 20 68 L 14 76 L 18 74 L 22 78 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 68 58 L 82 50 L 80 68 L 72 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<path d="M 80 68 L 86 76 L 82 74 L 78 78 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 78 L 36 90 L 44 90 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<ellipse cx="40" cy="90" rx="6" ry="2.5" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 78 L 56 90 L 64 90 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1"/>
${I4}<ellipse cx="60" cy="90" rx="6" ry="2.5" fill="${stroke}"/>
${I3}</g>
${glossyEyes(43, 57, 36, 6, 6.8, `url(#${p}-iris)`, accent)}
${chevronMouths(44, accent)}`;
    return wrapStage(stage, titles.evo1, defs, body);
  }

  // ── EVO2: spiky teen warrior, still cute eyes ──
  if (stage === 'evo2') {
    const body = `${shadow(94, 28, 0.22)}
${I3}<ellipse cx="50" cy="50" rx="40" ry="38" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 46 L 8 28 L 14 50 L 6 58 L 26 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 20 42 L 12 34" stroke="#fff" stroke-width="0.8" opacity="0.45"/>
${I4}<path d="M 18 50 L 10 54" stroke="${core}" stroke-width="0.7" opacity="0.4"/>
${I4}<path d="M 16 38 L 10 30" stroke="${accent}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 46 L 92 28 L 86 50 L 94 58 L 74 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 80 42 L 88 34" stroke="#fff" stroke-width="0.8" opacity="0.45"/>
${I4}<path d="M 82 50 L 90 54" stroke="${core}" stroke-width="0.7" opacity="0.4"/>
${I4}<path d="M 84 38 L 90 30" stroke="${accent}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 74 L 84 88 L 78 70 L 70 68 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 72 72 L 80 80" stroke="#fff" stroke-width="0.7" opacity="0.4"/>
${I4}<path d="M 76 76 L 82 84" stroke="${core}" stroke-width="0.65" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 30 L 68 42 L 68 66 L 50 78 L 32 66 L 32 42 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.7"/>
${I4}<path d="M 50 30 L 50 78" stroke="#fff" stroke-width="0.65" opacity="0.28"/>
${I4}<path d="M 32 42 L 68 66" stroke="#fff" stroke-width="0.55" opacity="0.22"/>
${I4}<path d="M 68 42 L 32 66" stroke="${stroke}" stroke-width="0.5" opacity="0.25"/>
${I4}<!-- Spikes -->
${I4}<path d="M 32 42 L 22 32 L 34 46 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<path d="M 68 42 L 78 32 L 66 46 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<path d="M 50 78 L 44 90 L 56 90 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<path d="M 40 36 L 50 42 L 44 50 Z" fill="url(#${p}-facet)"/>
${I4}<circle cx="50" cy="54" r="9" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="54" r="4" fill="#fff" opacity="0.55"/>
${I4}<path d="M 50 18 L 60 28 L 50 34 L 40 28 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 44 26 L 50 20 L 50 30 Z" fill="url(#${p}-facet)"/>
${I4}<circle cx="38" cy="58" r="1.5" fill="${core}" opacity="0.45"/>
${I4}<circle cx="62" cy="60" r="1.3" fill="${accent}" opacity="0.4"/>
${I4}<circle cx="36" cy="50" r="1.2" fill="#fff" opacity="0.22"/>
${I4}<circle cx="64" cy="52" r="1.1" fill="#fff" opacity="0.2"/>
${I4}<path d="M 46 50 L 50 54 L 54 50" stroke="${core}" stroke-width="0.75" fill="none" opacity="0.4"/>
${I4}<ellipse cx="42" cy="60" rx="2.2" ry="1.5" fill="#fff" opacity="0.17"/>
${I4}<ellipse cx="58" cy="62" rx="2.2" ry="1.5" fill="#fff" opacity="0.16"/>
${I4}<circle cx="32" cy="50" r="1.1" fill="#fff" opacity="0.2"/>
${I4}<circle cx="68" cy="52" r="1.1" fill="#fff" opacity="0.19"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 32 56 L 16 48 L 18 68 L 28 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 18 68 L 12 76 L 16 74 L 20 78 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.95"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 68 56 L 84 48 L 82 68 L 72 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 82 68 L 88 76 L 84 74 L 80 78 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.95"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 78 L 34 92 L 46 92 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<ellipse cx="40" cy="92" rx="7" ry="2.5" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 78 L 54 92 L 66 92 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<ellipse cx="60" cy="92" rx="7" ry="2.5" fill="${stroke}"/>
${I3}</g>
${glossyEyes(43, 57, 30, 6, 6.8, `url(#${p}-iris)`, accent)}
${chevronMouths(40, accent)}`;
    return wrapStage(stage, titles.evo2, defs, body);
  }

  // ── EVO3: Prism Titan heroic golem ──
  if (stage === 'evo3') {
    const body = `${shadow(95, 32, 0.26)}
${I3}<ellipse cx="50" cy="48" rx="44" ry="42" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 26 44 L 4 22 L 12 48 L 2 56 L 24 54 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.4"/>
${I4}<path d="M 16 38 L 8 30" stroke="#fff" stroke-width="0.85" opacity="0.45"/>
${I4}<path d="M 14 46 L 6 50" stroke="${core}" stroke-width="0.75" opacity="0.4"/>
${I4}<circle cx="6" cy="28" r="1.5" fill="${core}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 74 44 L 96 22 L 88 48 L 98 56 L 76 54 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.4"/>
${I4}<path d="M 84 38 L 92 30" stroke="#fff" stroke-width="0.85" opacity="0.45"/>
${I4}<path d="M 86 46 L 94 50" stroke="${core}" stroke-width="0.75" opacity="0.4"/>
${I4}<circle cx="94" cy="28" r="1.5" fill="${core}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 74 L 88 90 L 80 68 L 72 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 74 72 L 82 80 L 78 76 L 84 82" stroke="#fff" stroke-width="0.65" opacity="0.35" fill="none"/>
${I4}<circle cx="86" cy="88" r="2" fill="${core}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 24 L 72 38 L 72 68 L 50 84 L 28 68 L 28 38 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="2"/>
${I4}<path d="M 50 24 L 50 84" stroke="#fff" stroke-width="0.75" opacity="0.3"/>
${I4}<path d="M 28 38 L 72 68" stroke="#fff" stroke-width="0.6" opacity="0.22"/>
${I4}<path d="M 72 38 L 28 68" stroke="${stroke}" stroke-width="0.55" opacity="0.25"/>
${I4}<path d="M 38 34 L 50 42 L 42 52 Z" fill="url(#${p}-facet)"/>
${I4}<path d="M 58 36 L 64 48 L 54 46 Z" fill="#fff" opacity="0.22"/>
${I4}<path d="M 44 58 L 50 64 L 46 72 Z" fill="url(#${p}-facet)" opacity="0.8"/>
${I4}<circle cx="50" cy="54" r="11" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="54" r="5" fill="#fff" opacity="0.6"/>
${I4}<path d="M 50 14 L 64 26 L 50 32 L 36 26 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.5"/>
${I4}<path d="M 42 24 L 50 16 L 50 28 Z" fill="url(#${p}-facet)"/>
${I4}<path d="M 32 40 L 20 28 L 34 44 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<path d="M 68 40 L 80 28 L 66 44 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1"/>
${I4}<path d="M 44 48 L 48 48 M 46 46 L 46 50" stroke="${core}" stroke-width="0.9" opacity="0.55"/>
${I4}<circle cx="38" cy="62" r="1.6" fill="${core}" opacity="0.45"/>
${I4}<circle cx="62" cy="64" r="1.4" fill="${accent}" opacity="0.4"/>
${I4}<circle cx="34" cy="48" r="1.3" fill="#fff" opacity="0.2"/>
${I4}<circle cx="66" cy="50" r="1.2" fill="#fff" opacity="0.19"/>
${I4}<path d="M 44 48 L 50 52 L 56 48" stroke="${core}" stroke-width="0.8" fill="none" opacity="0.42"/>
${I4}<ellipse cx="40" cy="58" rx="2.5" ry="1.6" fill="#fff" opacity="0.18"/>
${I4}<ellipse cx="60" cy="60" rx="2.5" ry="1.6" fill="#fff" opacity="0.17"/>
${I4}<line x1="50" y1="38" x2="50" y2="44" stroke="#fff" stroke-width="0.6" opacity="0.25"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 28 54 L 10 44 L 12 68 L 24 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 12 68 L 6 78 L 10 76 L 14 80 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 54 L 90 44 L 88 68 L 76 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 88 68 L 94 78 L 90 76 L 86 80 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 38 84 L 32 96 L 44 96 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<ellipse cx="38" cy="96" rx="8" ry="3" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 62 84 L 56 96 L 68 96 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<ellipse cx="62" cy="96" rx="8" ry="3" fill="${stroke}"/>
${I3}</g>
${glossyEyes(43, 57, 28, 5.5, 6.2, `url(#${p}-iris)`, accent)}
${chevronMouths(38, accent)}`;
    return wrapStage(stage, titles.evo3, defs, body);
  }

  // ── EVO4: weathered chips, amber veins ──
  if (stage === 'evo4') {
    const body = `${shadow(96, 30, 0.24)}
${I3}<ellipse cx="50" cy="50" rx="42" ry="40" fill="url(#${p}-aura)" opacity="0.85"/>
${shardFin('left', p, accent, core, -1)}
${shardFin('right', p, accent, core, 1)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 74 L 86 88 L 78 70 L 70 68 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 74 72 L 80 78" stroke="url(#${p}-vein)" stroke-width="1.1" opacity="0.65"/>
${I4}<circle cx="84" cy="86" r="1.8" fill="${core}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 28 L 70 40 L 70 66 L 50 80 L 30 66 L 30 40 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.8"/>
${I4}<path d="M 50 28 L 50 80" stroke="#fff" stroke-width="0.6" opacity="0.2"/>
${I4}<path d="M 30 40 L 70 66" stroke="${stroke}" stroke-width="0.5" opacity="0.22"/>
${I4}<!-- Chips & cracks -->
${I4}<path d="M 36 44 L 32 40 L 38 48 Z" fill="#37474f" stroke="${stroke}" stroke-width="0.7"/>
${I4}<path d="M 62 50 L 66 46 L 60 54 Z" fill="#455a64" stroke="${stroke}" stroke-width="0.7"/>
${I4}<path d="M 44 68 L 40 72 L 46 70 Z" fill="#546e7a" stroke="${stroke}" stroke-width="0.65"/>
${I4}<!-- Amber veins -->
${I4}<path d="M 34 48 Q 42 52 38 60" stroke="url(#${p}-vein)" stroke-width="1.4" fill="none" opacity="0.75"/>
${I4}<path d="M 58 44 Q 54 54 60 62" stroke="url(#${p}-vein)" stroke-width="1.2" fill="none" opacity="0.65"/>
${I4}<path d="M 46 36 Q 50 46 48 56" stroke="url(#${p}-vein)" stroke-width="1" fill="none" opacity="0.55"/>
${I4}<circle cx="50" cy="54" r="9" fill="url(#${p}-core)" opacity="0.9"/>
${I4}<circle cx="50" cy="54" r="4" fill="#ffab40" opacity="0.55"/>
${I4}<path d="M 50 18 L 60 28 L 50 34 L 40 28 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3"/>
${I4}<path d="M 44 26 L 50 20 L 50 30 Z" fill="url(#${p}-facet)" opacity="0.7"/>
${I4}<circle cx="36" cy="58" r="1.5" fill="${core}" opacity="0.4"/>
${I4}<circle cx="64" cy="60" r="1.3" fill="#78909c" opacity="0.4"/>
${I4}<circle cx="36" cy="52" r="1.2" fill="#fff" opacity="0.15"/>
${I4}<circle cx="64" cy="54" r="1.1" fill="#fff" opacity="0.14"/>
${I4}<path d="M 44 46 L 50 50 L 56 46" stroke="url(#${p}-vein)" stroke-width="0.85" fill="none" opacity="0.5"/>
${I4}<ellipse cx="42" cy="62" rx="2" ry="1.4" fill="#fff" opacity="0.14"/>
${I4}<ellipse cx="58" cy="64" rx="2" ry="1.4" fill="#fff" opacity="0.13"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 30 56 L 16 48 L 18 68 L 28 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 22 52 L 18 48" stroke="url(#${p}-vein)" stroke-width="0.9" opacity="0.5"/>
${I4}<path d="M 18 68 L 12 76 L 16 74 L 20 78 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 70 56 L 84 48 L 82 68 L 72 66 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<path d="M 78 52 L 82 48" stroke="url(#${p}-vein)" stroke-width="0.9" opacity="0.5"/>
${I4}<path d="M 82 68 L 88 76 L 84 74 L 80 78 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 80 L 34 94 L 46 94 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<ellipse cx="40" cy="94" rx="7" ry="2.5" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 80 L 54 94 L 66 94 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2"/>
${I4}<ellipse cx="60" cy="94" rx="7" ry="2.5" fill="${stroke}"/>
${I3}</g>
${glossyEyes(43, 57, 30, 5, 5.8, `url(#${p}-iris)`, accent, '#eceff1')}
${chevronMouths(40, accent)}`;
    return wrapStage(stage, titles.evo4, defs, body);
  }

  // ── EVO5: eternal floating orbit gems, violet core ──
  const body = `${shadow(98, 34, 0.18)}
${I3}<ellipse cx="50" cy="50" rx="46" ry="44" fill="url(#${p}-aura)"/>
${I3}<ellipse cx="50" cy="50" rx="38" ry="36" fill="none" stroke="#ce93d8" stroke-width="1" opacity="0.3"/>
${I3}<!-- Orbit gems -->
${I3}<circle cx="22" cy="32" r="4" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.9" opacity="0.75"/>
${I3}<circle cx="78" cy="30" r="3.5" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.85" opacity="0.7"/>
${I3}<circle cx="18" cy="58" r="3" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.8" opacity="0.65"/>
${I3}<circle cx="82" cy="56" r="3.2" fill="url(#${p}-body)" stroke="${accent}" stroke-width="0.85" opacity="0.68"/>
${I3}<circle cx="50" cy="14" r="2.8" fill="${core}" opacity="0.6"/>
${I3}<ellipse cx="50" cy="50" rx="28" ry="26" fill="none" stroke="#b39ddb" stroke-width="0.6" opacity="0.25"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 24 46 L 4 24 L 10 50 L 0 58 L 22 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3" opacity="0.85"/>
${I4}<path d="M 12 40 L 6 32" stroke="#fff" stroke-width="0.75" opacity="0.4"/>
${I4}<circle cx="4" cy="28" r="1.4" fill="${core}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 76 46 L 96 24 L 90 50 L 100 58 L 78 56 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.3" opacity="0.85"/>
${I4}<path d="M 88 40 L 94 32" stroke="#fff" stroke-width="0.75" opacity="0.4"/>
${I4}<circle cx="96" cy="28" r="1.4" fill="${core}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 70 L 84 86 L 76 66 L 68 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1" opacity="0.8"/>
${I4}<circle cx="82" cy="84" r="2.2" fill="${core}" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 26 L 68 38 L 68 64 L 50 76 L 32 64 L 32 38 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.8" opacity="0.92"/>
${I4}<path d="M 50 26 L 50 76" stroke="#fff" stroke-width="0.65" opacity="0.28"/>
${I4}<path d="M 32 38 L 68 64" stroke="#e1bee7" stroke-width="0.55" opacity="0.22"/>
${I4}<path d="M 68 38 L 32 64" stroke="${stroke}" stroke-width="0.5" opacity="0.22"/>
${I4}<path d="M 40 34 L 50 42 L 44 50 Z" fill="url(#${p}-facet)"/>
${I4}<circle cx="50" cy="52" r="12" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="52" r="6" fill="#ea80fc" opacity="0.85"/>
${I4}<circle cx="50" cy="52" r="3" fill="#fff" opacity="0.7"/>
${I4}<path d="M 50 16 L 62 26 L 50 30 L 38 26 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.4"/>
${I4}<path d="M 44 24 L 50 18 L 50 28 Z" fill="url(#${p}-facet)"/>
${I4}<circle cx="36" cy="56" r="1.6" fill="${core}" opacity="0.5"/>
${I4}<circle cx="64" cy="58" r="1.4" fill="#ce93d8" opacity="0.45"/>
${I4}<circle cx="34" cy="50" r="1.2" fill="#fff" opacity="0.22"/>
${I4}<circle cx="66" cy="52" r="1.1" fill="#fff" opacity="0.2"/>
${I4}<path d="M 44 44 L 50 48 L 56 44" stroke="${core}" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<ellipse cx="40" cy="56" rx="2.2" ry="1.5" fill="#fff" opacity="0.2"/>
${I4}<ellipse cx="60" cy="58" rx="2.2" ry="1.5" fill="#fff" opacity="0.19"/>
${I4}<line x1="50" y1="36" x2="50" y2="42" stroke="#e1bee7" stroke-width="0.65" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 30 52 L 14 44 L 16 66 L 26 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
${I4}<path d="M 16 66 L 10 74 L 14 72 L 18 76 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 70 52 L 86 44 L 84 66 L 74 64 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
${I4}<path d="M 84 66 L 90 74 L 86 72 L 82 76 Z" fill="url(#${p}-body)" stroke="${core}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 76 L 36 88 L 44 86 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1" opacity="0.75"/>
${I4}<ellipse cx="40" cy="88" rx="5" ry="2" fill="${stroke}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 76 L 56 88 L 64 86 Z" fill="url(#${p}-body)" stroke="${accent}" stroke-width="1.1" opacity="0.75"/>
${I4}<ellipse cx="60" cy="88" rx="5" ry="2" fill="${stroke}" opacity="0.6"/>
${I3}</g>
${glossyEyes(43, 57, 26, 5.5, 6.2, `url(#${p}-iris)`, accent, '#f3e5f5')}
${chevronMouths(36, accent)}`;
  return wrapStage(stage, titles.evo5, defs, body);
}

export const crystalSvg = [
  `${I}<!-- CRYSTAL CHARACTER - All Life Stages (dense cute epic v3) -->`,
  `${I}<!-- Aether & Stone • Epic Rarity • Prism Titan -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(crystalStage),
].join('\n');
