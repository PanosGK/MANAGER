/**
 * Storm Leviathan — MYTHICAL BOSS sky-whale evo line (dense epic v2)
 * Intimidating: storm-plate armor, lightning crown, layered storm-fins,
 * hollow cyclone eye, jaw fangs, cloud mane, vein lattice.
 * Export for apply-leviathan-svg.mjs → myman_mascot.js
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};

const INK = '#010308';
const WHITE = '#f0f9ff';

const STAGE_PALETTES = {
  baby: {
    stroke: '#1a3a5c', pale: '#e0f2fe', vein: '#7dd3fc', accent: '#38bdf8',
    plate: '#2a4568', plateHi: '#3d5f88', fin0: '#2b4a6e', fin1: '#0c1a2c',
    body: [['0%', '#4a6a90'], ['35%', '#2a4568'], ['70%', '#142438'], ['100%', '#0a1420']],
    belly: [['0%', '#5a7a9a', 0.92], ['100%', '#0e1c2c', 0.95]],
    iris: [['0%', '#e0f2fe'], ['40%', '#38bdf8'], ['100%', '#020617']],
    wing: [['0%', '#4a7aaa', 0.9], ['40%', '#1a3558', 0.85], ['100%', '#060e18', 0.95]],
    crown: '#67e8f9', cloud: '#94a3b8',
  },
  evo1: {
    stroke: '#0f2744', pale: '#e0f2fe', vein: '#67e8f9', accent: '#0ea5e9',
    plate: '#1e3a58', plateHi: '#2f5078', fin0: '#1e3a58', fin1: '#081420',
    body: [['0%', '#3a5a80'], ['30%', '#1e3a58'], ['65%', '#0c1a2c'], ['100%', '#050c14']],
    belly: [['0%', '#4a6580', 0.9], ['100%', '#081018', 0.96]],
    iris: [['0%', '#bae6fd'], ['40%', '#0ea5e9'], ['100%', '#020617']],
    wing: [['0%', '#3a6a98', 0.9], ['45%', '#142848', 0.88], ['100%', '#040a12', 0.96]],
    crown: '#22d3ee', cloud: '#7dd3fc',
  },
  evo2: {
    stroke: '#0a1e36', pale: '#f0f9ff', vein: '#22d3ee', accent: '#06b6d4',
    plate: '#152840', plateHi: '#243e60', fin0: '#152840', fin1: '#040a12',
    body: [['0%', '#2a4a6e'], ['25%', '#152840'], ['55%', '#0a1628'], ['100%', '#02060c']],
    belly: [['0%', '#2e4860', 0.88], ['100%', '#040a12', 0.97]],
    iris: [['0%', '#a5f3fc'], ['35%', '#06b6d4'], ['100%', '#000']],
    wing: [['0%', '#2a5a88', 0.92], ['40%', '#0e2040', 0.9], ['100%', '#02060c', 0.97]],
    crown: '#22d3ee', cloud: '#67e8f9',
  },
  evo3: {
    stroke: '#050e18', pale: '#f0f9ff', vein: '#67e8f9', accent: '#38bdf8',
    plate: '#0e2038', plateHi: '#1a3558', fin0: '#0e2038', fin1: '#010408',
    body: [['0%', '#1e3a58'], ['20%', '#0e2038'], ['50%', '#060e18'], ['75%', '#02060c'], ['100%', '#000']],
    belly: [['0%', '#1a3048', 0.88], ['100%', '#010408', 0.98]],
    iris: [['0%', '#ecfeff'], ['30%', '#22d3ee'], ['70%', '#0369a1'], ['100%', '#000']],
    wing: [['0%', '#1e4a78', 0.95], ['30%', '#0a2040', 0.92], ['70%', '#040c18', 0.95], ['100%', '#000', 0.98]],
    crown: '#a5f3fc', cloud: '#7dd3fc',
  },
  evo4: {
    stroke: '#040810', pale: '#e2e8f0', vein: '#94a3b8', accent: '#64748b',
    plate: '#101820', plateHi: '#1e2830', fin0: '#121820', fin1: '#010204',
    body: [['0%', '#2a343c'], ['25%', '#141c24'], ['55%', '#080c12'], ['100%', '#000']],
    belly: [['0%', '#1a2228', 0.9], ['100%', '#010204', 0.98]],
    iris: [['0%', '#f1f5f9'], ['35%', '#64748b'], ['65%', '#0ea5e9'], ['100%', '#000']],
    wing: [['0%', '#3a4450', 0.9], ['40%', '#141c24', 0.92], ['100%', '#000', 0.98]],
    crown: '#cbd5e1', cloud: '#94a3b8',
  },
  evo5: {
    stroke: '#020406', pale: '#f8fafc', vein: '#e2e8f0', accent: '#94a3b8',
    plate: '#0c1014', plateHi: '#1a1e24', fin0: '#0e1218', fin1: '#000',
    body: [['0%', '#3a4048'], ['20%', '#1a1e24'], ['45%', '#0a0c10'], ['70%', '#040608'], ['100%', '#000']],
    belly: [['0%', '#22262c', 0.9], ['100%', '#000', 0.99]],
    iris: [['0%', '#fff'], ['25%', '#cbd5e1'], ['55%', '#0369a1'], ['100%', '#000']],
    wing: [['0%', '#4a5058', 0.88], ['35%', '#1a1e24', 0.92], ['70%', '#080a0c', 0.96], ['100%', '#000', 0.99]],
    crown: '#f8fafc', cloud: '#cbd5e1',
  },
};

function grad(id, stops, type = 'radial', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = attrs
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="100%" y2="100%"' : 'cx="40%" cy="28%" r="78%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- LEVIATHAN ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-leviathan" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function makeDefs(p, pal) {
  return [
    grad(`${p}-body`, pal.body, 'radial', 'cx="38%" cy="26%" r="82%"'),
    grad(`${p}-belly`, pal.belly, 'radial', 'cx="50%" cy="42%" r="58%"'),
    grad(`${p}-iris`, pal.iris, 'radial', 'cx="38%" cy="32%" r="70%"'),
    grad(`${p}-wing`, pal.wing, 'linear', 'x1="5%" y1="10%" x2="95%" y2="90%"'),
    grad(`${p}-wing2`, [['0%', pal.accent, 0.55], ['40%', pal.fin0, 0.7], ['100%', INK, 0.95]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-plate`, [['0%', pal.plateHi], ['55%', pal.plate], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-core`, [['0%', WHITE, 0.7], ['35%', pal.vein, 0.45], ['100%', pal.accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', pal.vein, 0.22], ['40%', pal.accent, 0.1], ['100%', INK, 0]], 'radial', 'cx="50%" cy="50%" r="55%"'),
    grad(`${p}-cloud`, [['0%', pal.cloud, 0.45], ['60%', pal.fin0, 0.2], ['100%', INK, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    `${I3}<filter id="${p}-glow" x="-50%" y="-50%" width="200%" height="200%">
${I4}<feGaussianBlur stdDeviation="1.4" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
    `${I3}<filter id="${p}-soft" x="-30%" y="-30%" width="160%" height="160%">
${I4}<feGaussianBlur stdDeviation="0.8"/>
${I3}</filter>`,
  ].join('\n');
}

function cycloneEye(cx, cy, rx, ry, irisRef, stroke, pale, vein, { boss = false, glowFilter = '' } = {}) {
  const g1 = (rx * (boss ? 2.1 : 1.55)).toFixed(1);
  const g2 = (ry * (boss ? 1.9 : 1.4)).toFixed(1);
  const glowAttr = glowFilter ? ` filter="url(#${glowFilter})"` : '';
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${g1}" ry="${g2}" fill="${vein}" opacity="${boss ? 0.22 : 0.12}"${glowAttr}/>
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${(rx * 1.35).toFixed(1)}" ry="${(ry * 1.25).toFixed(1)}" fill="${vein}" opacity="0.14"/>
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${pale}" stroke="${stroke}" stroke-width="${boss ? 2 : 1.5}" opacity="0.94"/>
${I4}<ellipse class="tm-leviathan-iris" cx="${cx}" cy="${cy}" rx="${(rx * 0.68).toFixed(1)}" ry="${(ry * 0.68).toFixed(1)}" fill="${irisRef}"/>
${I4}<!-- Cyclone pupil rings -->
${I4}<circle cx="${cx}" cy="${cy}" r="${(rx * 0.42).toFixed(1)}" fill="none" stroke="${vein}" stroke-width="0.7" opacity="0.55"/>
${I4}<circle class="tm-leviathan-pupil" cx="${cx}" cy="${cy}" r="${(rx * 0.28).toFixed(1)}" fill="${INK}"/>
${I4}<path d="M ${cx} ${cy - rx * 0.22} Q ${cx + rx * 0.18} ${cy} ${cx} ${cy + rx * 0.22} Q ${cx - rx * 0.18} ${cy} ${cx} ${cy - rx * 0.22}" fill="${vein}" opacity="0.35"/>
${I4}<circle cx="${(cx - rx * 0.22).toFixed(1)}" cy="${(cy - ry * 0.28).toFixed(1)}" r="${Math.max(0.9, rx * 0.14).toFixed(1)}" fill="#fff" opacity="0.45"/>
${boss ? `${I4}<path d="M ${cx - rx - 1} ${cy - ry - 2} Q ${cx} ${cy - ry - 5} ${cx + rx + 1} ${cy - ry - 1}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${cx - rx} ${cy - ry - 0.5} Q ${cx} ${cy - ry - 2.5} ${cx + rx} ${cy - ry + 0.5}" stroke="${vein}" stroke-width="1.1" fill="none" opacity="0.7"/>` : ''}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${cx - rx} ${cy} Q ${cx} ${cy - 2.5} ${cx + rx} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function grimJaw(y, stroke, vein, { fangs = 0, width = 10 } = {}) {
  let fangSvg = '';
  if (fangs > 0) {
    const step = (width * 2) / (fangs + 1);
    for (let i = 1; i <= fangs; i++) {
      const x = 50 - width + step * i;
      fangSvg += `
${I4}<path d="M ${x - 1.1} ${y + 0.5} L ${x} ${y + 4.2} L ${x + 1.1} ${y + 0.5}" fill="${WHITE}" stroke="${stroke}" stroke-width="0.5" opacity="0.85"/>`;
    }
  }
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - width} ${y} Q 50 ${(y + 2).toFixed(1)} ${50 + width} ${y}" stroke="${stroke}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - width} ${(y + 2.5).toFixed(1)} Q 50 ${(y - 1.2).toFixed(1)} ${50 + width} ${(y + 2.5).toFixed(1)}" stroke="${stroke}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${50 - width + 1} ${y + 0.8} Q 50 ${y + 3.5} ${50 + width - 1} ${y + 0.8}" fill="${INK}" opacity="0.65"/>${fangSvg}`;
}

function armorPlates(p, stroke, pal, count, boss) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const y = 38 + i * (boss ? 7.5 : 8.5);
    const rx = (boss ? 18 : 15) - i * 1.2;
    lines.push(`${I4}<ellipse cx="50" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${boss ? 4.2 : 3.4}" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="1.1" opacity="0.82"/>`);
    lines.push(`${I4}<ellipse cx="50" cy="${(y - 1.2).toFixed(1)}" rx="${(rx * 0.72).toFixed(1)}" ry="1.4" fill="${pal.plateHi}" opacity="0.35"/>`);
    if (boss || i % 2 === 0) {
      lines.push(`${I4}<circle cx="${(50 - rx + 3).toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" fill="${pal.vein}" opacity="0.45"/>`);
      lines.push(`${I4}<circle cx="${(50 + rx - 3).toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" fill="${pal.vein}" opacity="0.45"/>`);
    }
  }
  return lines.join('\n');
}

function veinLattice(p, vein, count) {
  const paths = [
    'M 26 40 Q 40 46 52 42 Q 64 38 74 44',
    'M 24 52 Q 38 58 50 54 Q 62 50 76 56',
    'M 28 64 Q 42 70 55 66 Q 68 62 72 68',
    'M 32 34 Q 48 30 68 36',
    'M 30 74 Q 50 78 70 72',
    'M 38 46 L 42 58 L 48 50 L 54 62',
    'M 46 36 Q 50 48 58 40',
  ].slice(0, count);
  return paths.map((d, i) =>
    `${I4}<path class="tm-leviathan-vein" d="${d}" stroke="${vein}" stroke-width="${(1.15 + (i % 3) * 0.2).toFixed(2)}" fill="none" opacity="${(0.4 + i * 0.06).toFixed(2)}" filter="url(#${p}-glow)"/>`
  ).join('\n');
}

function lightningCrown(p, pal, tier) {
  if (tier < 2) return '';
  const bolts = tier >= 5
    ? [[28, 8, 34, 2, 38, 10], [42, 4, 50, -2, 56, 6], [62, 6, 68, 0, 74, 10], [36, 12, 40, 6, 44, 14], [56, 12, 60, 5, 66, 14]]
    : tier >= 4
      ? [[30, 10, 36, 3, 42, 12], [46, 6, 50, 0, 54, 8], [58, 8, 66, 2, 72, 12], [40, 14, 48, 8, 52, 16]]
      : tier >= 3
        ? [[32, 12, 40, 4, 46, 14], [50, 8, 54, 2, 60, 12], [62, 10, 70, 4, 74, 14]]
        : [[36, 14, 44, 8, 50, 16], [52, 12, 58, 6, 66, 14]];
  return `${I3}<g class="tm-leviathan-crown">
${bolts.map(([x1, y1, x2, y2, x3, y3], i) =>
    `${I4}<path d="M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}" stroke="${pal.crown}" stroke-width="${i % 2 ? 1.6 : 2.1}" fill="none" stroke-linejoin="round" opacity="${0.55 + i * 0.06}" filter="url(#${p}-glow)"/>`
  ).join('\n')}
${I4}<ellipse cx="50" cy="10" rx="${8 + tier}" ry="3" fill="url(#${p}-core)" opacity="0.35"/>
${I3}</g>`;
}

function cloudMane(p, pal, tier) {
  if (tier < 2) return '';
  const blobs = tier >= 4
    ? [[22, 22, 9], [78, 20, 9], [18, 34, 7], [82, 32, 7], [30, 14, 6], [70, 12, 6], [50, 8, 5]]
    : tier >= 3
      ? [[24, 24, 8], [76, 22, 8], [20, 36, 6], [80, 34, 6], [50, 10, 5]]
      : [[26, 26, 7], [74, 24, 7], [50, 12, 4]];
  return `${I3}<g class="tm-leviathan-mane" opacity="0.85">
${blobs.map(([x, y, r]) =>
    `${I4}<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 0.65).toFixed(1)}" fill="url(#${p}-cloud)"/>`
  ).join('\n')}
${I3}</g>`;
}

function stormSparks(pal, count) {
  const pts = [
    [10, 18], [90, 16], [6, 42], [94, 44], [14, 68], [86, 70],
    [22, 8], [78, 6], [4, 56], [96, 54], [40, 4], [60, 4],
    [16, 82], [84, 84], [48, 2],
  ].slice(0, count);
  return pts.map(([x, y], i) => {
    const fill = i % 3 === 0 ? pal.crown : i % 2 ? pal.vein : WHITE;
    return `${I3}<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 1.7 : 1.15}" fill="${fill}" opacity="${0.35 + (i % 4) * 0.1}"/>`;
  }).join('\n');
}

function bossWings(p, stroke, pal, size) {
  // size: sm | md | lg | boss
  if (size === 'boss') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 46 Q -4 18 -10 48 Q -6 78 14 74 Q 24 60 32 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2"/>
${I4}<path d="M 26 48 Q 2 28 -2 50 Q 2 70 18 66 Q 24 58 28 52 Z" fill="url(#${p}-wing2)" opacity="0.8" stroke="${pal.vein}" stroke-width="0.9"/>
${I4}<path d="M 8 34 Q 0 42 4 58" stroke="${pal.vein}" stroke-width="1.3" fill="none" opacity="0.65"/>
${I4}<path d="M 4 42 Q -4 48 0 62" stroke="${pal.accent}" stroke-width="1.1" fill="none" opacity="0.5"/>
${I4}<path d="M 12 54 Q 18 62 26 66" stroke="${WHITE}" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<path d="M -2 28 L -10 14" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
${I4}<path d="M 4 22 L -2 10" stroke="${pal.vein}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 10 20 L 6 8" stroke="${pal.crown}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<circle cx="-4" cy="36" r="2.2" fill="${pal.vein}" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 46 Q 104 18 110 48 Q 106 78 86 74 Q 76 60 68 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2"/>
${I4}<path d="M 74 48 Q 98 28 102 50 Q 98 70 82 66 Q 76 58 72 52 Z" fill="url(#${p}-wing2)" opacity="0.8" stroke="${pal.vein}" stroke-width="0.9"/>
${I4}<path d="M 92 34 Q 100 42 96 58" stroke="${pal.vein}" stroke-width="1.3" fill="none" opacity="0.65"/>
${I4}<path d="M 96 42 Q 104 48 100 62" stroke="${pal.accent}" stroke-width="1.1" fill="none" opacity="0.5"/>
${I4}<path d="M 88 54 Q 82 62 74 66" stroke="${WHITE}" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<path d="M 102 28 L 110 14" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
${I4}<path d="M 96 22 L 102 10" stroke="${pal.vein}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 90 20 L 94 8" stroke="${pal.crown}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<circle cx="104" cy="36" r="2.2" fill="${pal.vein}" opacity="0.4"/>
${I3}</g>`;
  }
  if (size === 'lg') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 48 Q 2 24 -2 48 Q 2 72 16 68 Q 24 58 32 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<path d="M 12 36 Q 4 44 8 58" stroke="${pal.vein}" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 4 28 L -4 18" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 10 24 L 4 14" stroke="${pal.vein}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 Q 98 24 102 48 Q 98 72 84 68 Q 76 58 68 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<path d="M 88 36 Q 96 44 92 58" stroke="${pal.vein}" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 96 28 L 104 18" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 90 24 L 96 14" stroke="${pal.vein}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>`;
  }
  if (size === 'md') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 32 50 Q 10 32 6 52 Q 10 68 22 64 Q 28 56 34 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 14 40 Q 8 48 12 58" stroke="${pal.vein}" stroke-width="0.9" fill="none" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 68 50 Q 90 32 94 52 Q 90 68 78 64 Q 72 56 66 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 86 40 Q 92 48 88 58" stroke="${pal.vein}" stroke-width="0.9" fill="none" opacity="0.5"/>
${I3}</g>`;
  }
  return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 34 52 Q 16 40 14 54 Q 18 66 28 62 Q 32 56 36 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 66 52 Q 84 40 86 54 Q 82 66 72 62 Q 68 56 64 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I3}</g>`;
}

function leviathanStage(stage) {
  const tier = { baby: 1, evo1: 2, evo2: 3, evo3: 4, evo4: 5, evo5: 6 }[stage];
  const p = `leviathan-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'Storm Calf',
    evo1: 'Gale Spawn',
    evo2: 'Thunderback',
    evo3: 'Storm Leviathan — BOSS',
    evo4: 'Abyss Gale Tyrant',
    evo5: 'Primordial Tempest God',
  };
  const pal = STAGE_PALETTES[stage];
  const stroke = pal.stroke;
  const boss = tier >= 4;
  const cfg = {
    1: { bodyRx: 18, bodyRy: 22, headCy: 26, headRx: 13, headRy: 11, eye: [56, 24, 4.2, 4.8], jawY: 34, jawW: 8, fangs: 0, plates: 2, veins: 3, sparks: 5, wings: 'sm', shadow: 22 },
    2: { bodyRx: 20, bodyRy: 25, headCy: 22, headRx: 14, headRy: 12, eye: [57, 20, 4.8, 5.4], jawY: 32, jawW: 9, fangs: 2, plates: 3, veins: 4, sparks: 7, wings: 'md', shadow: 26 },
    3: { bodyRx: 22, bodyRy: 27, headCy: 20, headRx: 15, headRy: 12.5, eye: [58, 18, 5.4, 6], jawY: 30, jawW: 10, fangs: 3, plates: 4, veins: 5, sparks: 9, wings: 'lg', shadow: 30 },
    4: { bodyRx: 24, bodyRy: 29, headCy: 18, headRx: 16, headRy: 13.5, eye: [59, 16, 6.2, 7], jawY: 29, jawW: 11, fangs: 4, plates: 5, veins: 6, sparks: 12, wings: 'boss', shadow: 34 },
    5: { bodyRx: 24, bodyRy: 30, headCy: 17, headRx: 16.5, headRy: 14, eye: [59, 15, 6.4, 7.2], jawY: 28, jawW: 11, fangs: 5, plates: 5, veins: 7, sparks: 12, wings: 'boss', shadow: 36 },
    6: { bodyRx: 25, bodyRy: 31, headCy: 16, headRx: 17, headRy: 14.5, eye: [60, 14, 6.8, 7.6], jawY: 27, jawW: 12, fangs: 5, plates: 6, veins: 7, sparks: 14, wings: 'boss', shadow: 38 },
  }[tier];

  const [ex, ey, erx, ery] = cfg.eye;
  const defs = makeDefs(p, pal);

  const body = `${I3}<ellipse cx="50" cy="96" rx="${cfg.shadow}" ry="5" fill="${INK}" opacity="0.45"/>
${I3}<ellipse cx="50" cy="54" rx="${(cfg.bodyRx * 1.55).toFixed(1)}" ry="${(cfg.bodyRy * 1.35).toFixed(1)}" fill="url(#${p}-aura)" opacity="${boss ? 0.55 : 0.3}"/>
${stormSparks(pal, cfg.sparks)}
${cloudMane(p, pal, tier)}
${lightningCrown(p, pal, tier)}
${bossWings(p, stroke, pal, cfg.wings)}
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${I4}<!-- Massive sky-whale torso -->
${I4}<ellipse cx="50" cy="52" rx="${cfg.bodyRx}" ry="${cfg.bodyRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="${boss ? 2 : 1.5}"/>
${I4}<ellipse cx="50" cy="56" rx="${(cfg.bodyRx * 0.62).toFixed(1)}" ry="${(cfg.bodyRy * 0.55).toFixed(1)}" fill="url(#${p}-belly)" opacity="0.88"/>
${armorPlates(p, stroke, pal, cfg.plates, boss)}
${veinLattice(p, pal.vein, cfg.veins)}
${I4}<!-- Storm-core heart -->
${I4}<ellipse cx="50" cy="50" rx="${boss ? 7 : 5}" ry="${boss ? 6 : 4.2}" fill="url(#${p}-core)" opacity="${boss ? 0.55 : 0.35}"/>
${I4}<ellipse cx="50" cy="50" rx="${boss ? 3.2 : 2.2}" ry="${boss ? 2.8 : 1.8}" fill="${pal.vein}" opacity="0.5" filter="url(#${p}-glow)"/>
${I4}<!-- Predatory head -->
${I4}<ellipse cx="50" cy="${cfg.headCy}" rx="${cfg.headRx}" ry="${cfg.headRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="${boss ? 1.8 : 1.45}"/>
${I4}<path d="M ${50 + cfg.headRx * 0.2} ${cfg.headCy + 1} Q ${50 + cfg.headRx + 6} ${cfg.headCy + 3} ${50 + cfg.headRx * 0.55} ${cfg.headCy + 9}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2" opacity="0.92"/>
${I4}<path d="M ${50 - cfg.headRx * 0.55} ${cfg.headCy - 2} Q ${50 - cfg.headRx - 2} ${cfg.headCy + 4} ${50 - cfg.headRx * 0.3} ${cfg.headCy + 8}" fill="${pal.plate}" stroke="${stroke}" stroke-width="1" opacity="0.7"/>
${boss ? `${I4}<path d="M 38 ${cfg.headCy - 4} L 42 ${cfg.headCy - 10} L 46 ${cfg.headCy - 5}" fill="${pal.plate}" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="M 54 ${cfg.headCy - 5} L 58 ${cfg.headCy - 11} L 62 ${cfg.headCy - 4}" fill="${pal.plate}" stroke="${stroke}" stroke-width="1"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 60 Q 14 66 12 80 Q 22 82 36 72 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3" opacity="0.92"/>
${I4}<path d="M 28 68 L 16 74" stroke="${pal.vein}" stroke-width="0.9" opacity="0.5"/>
${I4}<path d="M 14 78 L 10 84" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 18 80 L 14 88" stroke="${pal.vein}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 60 Q 86 66 88 80 Q 78 82 64 72 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3" opacity="0.92"/>
${I4}<path d="M 72 68 L 84 74" stroke="${pal.vein}" stroke-width="0.9" opacity="0.5"/>
${I4}<path d="M 86 78 L 90 84" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 82 80 L 86 88" stroke="${pal.vein}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 76 Q 32 90 40 94 Q 46 88 44 78 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.15" opacity="0.85"/>
${I4}<path d="M 36 90 L 30 96" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 76 Q 68 90 60 94 Q 54 88 56 78 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.15" opacity="0.85"/>
${I4}<path d="M 64 90 L 70 96" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 50 78 Q 50 88 36 96 Q 50 90 64 96 Q 50 88 50 78" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.6" opacity="0.95"/>
${I4}<path d="M 50 82 L 42 94" stroke="${pal.vein}" stroke-width="1.1" opacity="0.55"/>
${I4}<path d="M 50 82 L 58 94" stroke="${pal.accent}" stroke-width="1.1" opacity="0.5"/>
${I4}<path d="M 50 84 L 50 96" stroke="${WHITE}" stroke-width="0.8" opacity="0.35"/>
${boss ? `${I4}<path d="M 38 92 L 32 98" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 62 92 L 68 98" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>` : ''}
${I3}</g>
${cycloneEye(ex, ey, erx, ery, `url(#${p}-iris)`, stroke, pal.pale, pal.vein, { boss, glowFilter: `${p}-glow` })}
${grimJaw(cfg.jawY, stroke, pal.vein, { fangs: cfg.fangs, width: cfg.jawW })}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · dense epic boss v2) -->
${STAGES.map(leviathanStage).join('\n')}`;
