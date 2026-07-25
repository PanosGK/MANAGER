/**
 * Storm Leviathan — MYTHICAL BOSS sky-whale (dense epic v3 · path silhouettes)
 * Complex body shape: arched sky-whale torso, armored dorsal ridge, snout + gullet,
 * storm-blade fins, split fluke, floating storm rings (adult+).
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
    plate: '#2a4568', plateHi: '#4a6a90', fin0: '#2b4a6e',
    body: [['0%', '#5a7aa0'], ['30%', '#2a4568'], ['65%', '#142438'], ['100%', '#0a1420']],
    belly: [['0%', '#6a8ab0', 0.92], ['100%', '#0e1c2c', 0.95]],
    iris: [['0%', '#e0f2fe'], ['40%', '#38bdf8'], ['100%', '#020617']],
    wing: [['0%', '#4a7aaa', 0.92], ['45%', '#1a3558', 0.88], ['100%', '#060e18', 0.96]],
    crown: '#67e8f9', cloud: '#94a3b8', gullet: '#0c4a6e',
  },
  evo1: {
    stroke: '#0f2744', pale: '#e0f2fe', vein: '#67e8f9', accent: '#0ea5e9',
    plate: '#1e3a58', plateHi: '#3a5a80', fin0: '#1e3a58',
    body: [['0%', '#3a5a80'], ['28%', '#1e3a58'], ['60%', '#0c1a2c'], ['100%', '#050c14']],
    belly: [['0%', '#4a6580', 0.9], ['100%', '#081018', 0.96]],
    iris: [['0%', '#bae6fd'], ['40%', '#0ea5e9'], ['100%', '#020617']],
    wing: [['0%', '#3a6a98', 0.92], ['45%', '#142848', 0.9], ['100%', '#040a12', 0.97]],
    crown: '#22d3ee', cloud: '#7dd3fc', gullet: '#0e7490',
  },
  evo2: {
    stroke: '#0a1e36', pale: '#f0f9ff', vein: '#22d3ee', accent: '#06b6d4',
    plate: '#152840', plateHi: '#2a4a6e', fin0: '#152840',
    body: [['0%', '#2a4a6e'], ['25%', '#152840'], ['55%', '#0a1628'], ['100%', '#02060c']],
    belly: [['0%', '#2e4860', 0.88], ['100%', '#040a12', 0.97]],
    iris: [['0%', '#a5f3fc'], ['35%', '#06b6d4'], ['100%', '#000']],
    wing: [['0%', '#2a5a88', 0.94], ['40%', '#0e2040', 0.9], ['100%', '#02060c', 0.97]],
    crown: '#22d3ee', cloud: '#67e8f9', gullet: '#155e75',
  },
  evo3: {
    stroke: '#050e18', pale: '#f0f9ff', vein: '#67e8f9', accent: '#38bdf8',
    plate: '#0e2038', plateHi: '#1e3a58', fin0: '#0e2038',
    body: [['0%', '#1e3a58'], ['18%', '#0e2038'], ['45%', '#060e18'], ['75%', '#02060c'], ['100%', '#000']],
    belly: [['0%', '#1a3048', 0.88], ['100%', '#010408', 0.98]],
    iris: [['0%', '#ecfeff'], ['28%', '#22d3ee'], ['65%', '#0369a1'], ['100%', '#000']],
    wing: [['0%', '#1e4a78', 0.95], ['30%', '#0a2040', 0.92], ['70%', '#040c18', 0.96], ['100%', '#000', 0.98]],
    crown: '#a5f3fc', cloud: '#7dd3fc', gullet: '#0e7490',
  },
  evo4: {
    stroke: '#040810', pale: '#e2e8f0', vein: '#94a3b8', accent: '#64748b',
    plate: '#101820', plateHi: '#2a343c', fin0: '#121820',
    body: [['0%', '#2a343c'], ['22%', '#141c24'], ['50%', '#080c12'], ['100%', '#000']],
    belly: [['0%', '#1a2228', 0.9], ['100%', '#010204', 0.98]],
    iris: [['0%', '#f1f5f9'], ['35%', '#64748b'], ['65%', '#0ea5e9'], ['100%', '#000']],
    wing: [['0%', '#3a4450', 0.9], ['40%', '#141c24', 0.92], ['100%', '#000', 0.98]],
    crown: '#cbd5e1', cloud: '#94a3b8', gullet: '#334155',
  },
  evo5: {
    stroke: '#020406', pale: '#f8fafc', vein: '#e2e8f0', accent: '#94a3b8',
    plate: '#0c1014', plateHi: '#2a3038', fin0: '#0e1218',
    body: [['0%', '#3a4048'], ['18%', '#1a1e24'], ['42%', '#0a0c10'], ['70%', '#040608'], ['100%', '#000']],
    belly: [['0%', '#22262c', 0.9], ['100%', '#000', 0.99]],
    iris: [['0%', '#fff'], ['25%', '#cbd5e1'], ['55%', '#0369a1'], ['100%', '#000']],
    wing: [['0%', '#4a5058', 0.9], ['35%', '#1a1e24', 0.92], ['70%', '#080a0c', 0.96], ['100%', '#000', 0.99]],
    crown: '#f8fafc', cloud: '#cbd5e1', gullet: '#1e293b',
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
    grad(`${p}-body`, pal.body, 'radial', 'cx="36%" cy="24%" r="85%"'),
    grad(`${p}-belly`, pal.belly, 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(`${p}-iris`, pal.iris, 'radial', 'cx="38%" cy="32%" r="70%"'),
    grad(`${p}-wing`, pal.wing, 'linear', 'x1="5%" y1="5%" x2="95%" y2="95%"'),
    grad(`${p}-wing2`, [['0%', pal.accent, 0.6], ['45%', pal.fin0, 0.75], ['100%', INK, 0.95]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-plate`, [['0%', pal.plateHi], ['50%', pal.plate], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="30%" y2="100%"'),
    grad(`${p}-core`, [['0%', WHITE, 0.75], ['30%', pal.vein, 0.5], ['100%', pal.accent, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', pal.vein, 0.2], ['45%', pal.accent, 0.08], ['100%', INK, 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    grad(`${p}-cloud`, [['0%', pal.cloud, 0.5], ['55%', pal.fin0, 0.22], ['100%', INK, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-gullet`, [['0%', pal.vein, 0.55], ['40%', pal.gullet, 0.85], ['100%', INK, 0.95]], 'radial', 'cx="50%" cy="20%" r="80%"'),
    `${I3}<filter id="${p}-glow" x="-50%" y="-50%" width="200%" height="200%">
${I4}<feGaussianBlur stdDeviation="1.35" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
  ].join('\n');
}

/** Arched sky-whale torso — NOT an ellipse. Path silhouette grows more jagged with tier. */
function torsoPath(tier) {
  // viewBox 100×100; body fills center with distinctive whale/serpent curve
  if (tier <= 1) {
    // Round calf but still path-shaped (teardrop whale)
    return 'M 50 28 C 68 28 78 42 76 56 C 74 72 62 82 50 84 C 38 82 26 72 24 56 C 22 42 32 28 50 28 Z';
  }
  if (tier === 2) {
    return 'M 48 22 C 66 20 80 36 78 52 C 76 68 70 78 58 84 C 50 88 42 86 34 80 C 24 72 20 58 22 44 C 24 30 34 22 48 22 Z';
  }
  if (tier === 3) {
    // Longer, S-curve suggestion
    return 'M 46 16 C 64 12 82 28 84 46 C 86 62 78 74 64 82 C 52 88 40 86 30 78 C 18 68 14 52 18 38 C 22 24 32 16 46 16 Z';
  }
  // Boss+ : massive arched back, tapered chest, heavy haunch
  return 'M 44 10 C 58 6 74 14 84 28 C 92 42 94 58 88 70 C 82 82 70 90 54 92 C 40 94 28 88 20 78 C 10 66 8 50 14 36 C 20 22 30 12 44 10 Z';
}

function bellyPath(tier) {
  if (tier <= 2) {
    return 'M 50 40 C 60 42 64 54 62 66 C 60 76 54 80 50 80 C 46 80 40 76 38 66 C 36 54 40 42 50 40 Z';
  }
  if (tier === 3) {
    return 'M 50 36 C 62 38 68 52 66 66 C 64 78 56 84 50 84 C 44 84 36 78 34 66 C 32 52 38 38 50 36 Z';
  }
  return 'M 50 32 C 64 34 72 48 70 64 C 68 78 58 86 50 86 C 42 86 32 78 30 64 C 28 48 36 34 50 32 Z';
}

/** Head: predatory snout + brow ridge — unique per tier */
function headAssembly(p, pal, stroke, tier, boss) {
  const head = tier <= 1
    ? 'M 42 18 C 48 12 58 12 64 18 C 70 24 72 34 68 40 C 64 46 54 48 48 46 C 40 44 36 34 38 26 C 38 22 40 18 42 18 Z'
    : tier === 2
      ? 'M 40 14 C 48 8 60 8 68 16 C 76 24 78 36 72 44 C 66 50 54 52 46 48 C 36 44 32 32 34 22 C 34 16 36 14 40 14 Z'
      : tier === 3
        ? 'M 38 10 C 48 4 62 6 72 16 C 80 26 82 40 74 48 C 66 54 52 54 42 48 C 32 42 28 30 30 20 C 30 12 34 10 38 10 Z'
        : 'M 36 6 C 48 0 64 2 76 14 C 86 26 88 42 78 52 C 70 58 54 58 42 52 C 30 46 24 32 26 18 C 26 10 30 6 36 6 Z';

  const snout = tier <= 2
    ? `M 62 28 Q 78 32 74 40 Q 66 42 58 38 Z`
    : `M 66 26 Q 90 30 86 42 Q 78 48 62 42 Q 58 34 66 26 Z`;

  const brow = boss
    ? `${I4}<path d="M 34 16 Q 48 6 66 14" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M 36 18 Q 50 10 64 16" stroke="${pal.vein}" stroke-width="1.2" fill="none" opacity="0.7"/>`
    : tier >= 2
      ? `${I4}<path d="M 38 18 Q 50 10 64 18" stroke="${stroke}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
      : '';

  const hornL = tier >= 3
    ? `${I4}<path d="M 40 12 L 32 0 L 44 10 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="M 36 6 L 34 2" stroke="${pal.crown}" stroke-width="1.2" opacity="0.8"/>`
    : '';
  const hornR = tier >= 3
    ? `${I4}<path d="M 62 10 L 72 -2 L 66 12 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="M 68 4 L 70 0" stroke="${pal.crown}" stroke-width="1.2" opacity="0.8"/>`
    : '';
  const hornMid = tier >= 5
    ? `${I4}<path d="M 48 6 L 50 -6 L 54 8 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="1"/>`
    : '';

  return `${I4}<path d="${head}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="${boss ? 1.9 : 1.5}"/>
${I4}<path d="${snout}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" opacity="0.95"/>
${I4}<path d="${snout}" fill="url(#${p}-gullet)" opacity="0.35"/>
${brow}
${hornL}
${hornR}
${hornMid}`;
}

/** Dorsal armor ridge — jagged plates along the spine */
function dorsalRidge(p, stroke, pal, tier) {
  if (tier < 2) {
    return `${I4}<path d="M 44 30 L 50 22 L 56 30 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="1" opacity="0.85"/>`;
  }
  const plates = [];
  const pts = tier >= 5
    ? [[38, 28, 44, 14, 48, 26], [46, 24, 50, 8, 56, 22], [54, 22, 60, 10, 66, 24], [62, 28, 70, 16, 74, 30], [34, 36, 38, 24, 44, 34]]
    : tier >= 4
      ? [[40, 26, 46, 12, 52, 24], [48, 22, 54, 8, 60, 22], [56, 24, 64, 12, 70, 28], [36, 34, 40, 22, 48, 32]]
      : tier === 3
        ? [[42, 28, 48, 16, 54, 26], [50, 24, 56, 12, 62, 26], [40, 36, 46, 26, 52, 34]]
        : [[44, 30, 50, 18, 56, 28], [48, 34, 54, 24, 60, 34]];
  for (const [x1, y1, x2, y2, x3, y3] of pts) {
    plates.push(`${I4}<path d="M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="1.05" opacity="0.9"/>`);
    plates.push(`${I4}<path d="M ${x1 + 2} ${y1 - 1} L ${x2} ${y2 + 3}" stroke="${pal.vein}" stroke-width="0.7" opacity="0.45"/>`);
  }
  return plates.join('\n');
}

/** Side armor scutes following the body curve */
function sideScutes(p, stroke, pal, tier) {
  if (tier < 2) return '';
  const rows = tier >= 4
    ? [
      [[28, 40], [32, 48], [30, 56], [34, 64], [32, 72]],
      [[72, 40], [68, 48], [70, 56], [66, 64], [68, 72]],
    ]
    : [
      [[30, 42], [34, 52], [32, 62]],
      [[70, 42], [66, 52], [68, 62]],
    ];
  return rows.flatMap((side, si) => side.map(([x, y], i) =>
    `${I4}<path d="M ${x} ${y - 4} L ${x + (si ? -5 : 5)} ${y} L ${x} ${y + 4} L ${x + (si ? 3 : -3)} ${y} Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="0.85" opacity="0.75"/>`
  )).join('\n');
}

function veinLattice(p, vein, count) {
  const paths = [
    'M 30 38 Q 42 44 54 40 Q 66 36 74 42',
    'M 28 50 Q 40 56 52 52 Q 64 48 76 54',
    'M 32 62 Q 46 68 58 64 Q 70 60 74 66',
    'M 40 30 Q 50 36 62 32',
    'M 34 72 Q 50 78 66 70',
    'M 44 44 L 48 56 L 54 48 L 58 60',
    'M 36 46 Q 50 42 64 50',
  ].slice(0, count);
  return paths.map((d, i) =>
    `${I4}<path class="tm-leviathan-vein" d="${d}" stroke="${vein}" stroke-width="${(1.2 + (i % 3) * 0.25).toFixed(2)}" fill="none" opacity="${(0.42 + i * 0.05).toFixed(2)}" filter="url(#${p}-glow)"/>`
  ).join('\n');
}

function cycloneEye(cx, cy, rx, ry, irisRef, stroke, pale, vein, { boss = false, glowId = '' } = {}) {
  const glow = glowId ? ` filter="url(#${glowId})"` : '';
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${(rx * (boss ? 2.2 : 1.6)).toFixed(1)}" ry="${(ry * (boss ? 2 : 1.45)).toFixed(1)}" fill="${vein}" opacity="${boss ? 0.24 : 0.12}"${glow}/>
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${pale}" stroke="${stroke}" stroke-width="${boss ? 2.1 : 1.5}" opacity="0.94"/>
${I4}<ellipse class="tm-leviathan-iris" cx="${cx}" cy="${cy}" rx="${(rx * 0.7).toFixed(1)}" ry="${(ry * 0.7).toFixed(1)}" fill="${irisRef}"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${(rx * 0.44).toFixed(1)}" fill="none" stroke="${vein}" stroke-width="0.75" opacity="0.55"/>
${I4}<circle class="tm-leviathan-pupil" cx="${cx}" cy="${cy}" r="${(rx * 0.26).toFixed(1)}" fill="${INK}"/>
${I4}<path d="M ${cx} ${(cy - rx * 0.2).toFixed(1)} Q ${(cx + rx * 0.2).toFixed(1)} ${cy} ${cx} ${(cy + rx * 0.2).toFixed(1)} Q ${(cx - rx * 0.2).toFixed(1)} ${cy} ${cx} ${(cy - rx * 0.2).toFixed(1)}" fill="${vein}" opacity="0.4"/>
${I4}<circle cx="${(cx - rx * 0.25).toFixed(1)}" cy="${(cy - ry * 0.3).toFixed(1)}" r="${Math.max(0.9, rx * 0.13).toFixed(1)}" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${cx - rx} ${cy} Q ${cx} ${cy - 2.5} ${cx + rx} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function grimJaw(y, stroke, { fangs = 0, width = 10, open = false } = {}) {
  let fangSvg = '';
  if (fangs > 0) {
    const step = (width * 2) / (fangs + 1);
    for (let i = 1; i <= fangs; i++) {
      const x = 50 - width + step * i;
      fangSvg += `
${I4}<path d="M ${(x - 1.2).toFixed(1)} ${(y + 0.4).toFixed(1)} L ${x.toFixed(1)} ${(y + 4.8).toFixed(1)} L ${(x + 1.2).toFixed(1)} ${(y + 0.4).toFixed(1)}" fill="${WHITE}" stroke="${stroke}" stroke-width="0.55" opacity="0.9"/>`;
    }
  }
  const happyY = open ? y + 1.5 : y;
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - width} ${happyY} Q 50 ${(happyY + (open ? 5 : 2.2)).toFixed(1)} ${50 + width} ${happyY}" stroke="${stroke}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - width} ${(y + 3).toFixed(1)} Q 50 ${(y - 1.5).toFixed(1)} ${50 + width} ${(y + 3).toFixed(1)}" stroke="${stroke}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${50 - width + 1} ${(happyY + 1).toFixed(1)} Q 50 ${(happyY + (open ? 6 : 3.8)).toFixed(1)} ${50 + width - 1} ${(happyY + 1).toFixed(1)}" fill="${INK}" opacity="0.7"/>${fangSvg}`;
}

function lightningCrown(p, pal, tier) {
  if (tier < 2) return '';
  const bolts = tier >= 5
    ? [[24, 10, 30, 0, 36, 12], [40, 4, 50, -6, 58, 6], [62, 6, 72, -2, 78, 12], [34, 14, 40, 4, 46, 14], [54, 12, 60, 2, 68, 14]]
    : tier >= 4
      ? [[28, 10, 34, 0, 42, 12], [46, 4, 52, -4, 58, 8], [60, 8, 70, 0, 76, 12], [38, 14, 48, 6, 54, 16]]
      : [[32, 12, 40, 2, 48, 14], [52, 8, 58, 0, 66, 12], [40, 16, 50, 8, 56, 16]];
  return `${I3}<g class="tm-leviathan-crown">
${bolts.map(([x1, y1, x2, y2, x3, y3], i) =>
    `${I4}<path d="M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}" stroke="${pal.crown}" stroke-width="${i % 2 ? 1.5 : 2.2}" fill="none" stroke-linejoin="miter" opacity="${0.55 + i * 0.05}" filter="url(#${p}-glow)"/>`
  ).join('\n')}
${I3}</g>`;
}

function cloudMane(p, pal, tier) {
  if (tier < 2) return '';
  const blobs = tier >= 4
    ? [[16, 24, 10], [84, 22, 10], [12, 40, 8], [88, 38, 8], [26, 12, 7], [74, 10, 7], [50, 4, 6], [8, 56, 6], [92, 54, 6]]
    : tier >= 3
      ? [[18, 26, 9], [82, 24, 9], [14, 42, 7], [86, 40, 7], [50, 6, 5]]
      : [[22, 28, 7], [78, 26, 7], [50, 10, 4]];
  return `${I3}<g class="tm-leviathan-mane" opacity="0.88">
${blobs.map(([x, y, r]) =>
    `${I4}<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 0.62).toFixed(1)}" fill="url(#${p}-cloud)"/>`
  ).join('\n')}
${I3}</g>`;
}

/** Floating storm rings — Giratina-like epic geometry (adult+) */
function stormRings(p, pal, stroke, tier) {
  if (tier < 4) return '';
  const extra = tier >= 5
    ? `${I4}<ellipse cx="50" cy="48" rx="46" ry="18" fill="none" stroke="${pal.accent}" stroke-width="1.1" opacity="0.28" transform="rotate(-18 50 48)"/>
${I4}<ellipse cx="50" cy="52" rx="40" ry="14" fill="none" stroke="${pal.vein}" stroke-width="0.9" opacity="0.22" transform="rotate(22 50 52)"/>`
    : '';
  return `${I3}<g class="tm-leviathan-rings" opacity="0.85">
${I4}<ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="${pal.crown}" stroke-width="1.6" opacity="0.4" transform="rotate(-12 50 50)" filter="url(#${p}-glow)"/>
${I4}<ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="${stroke}" stroke-width="0.7" opacity="0.35" transform="rotate(-12 50 50)"/>
${I4}<circle cx="12" cy="42" r="2.4" fill="${pal.vein}" opacity="0.55"/>
${I4}<circle cx="88" cy="58" r="2.4" fill="${pal.accent}" opacity="0.55"/>
${I4}<circle cx="22" cy="62" r="1.6" fill="${WHITE}" opacity="0.4"/>
${I4}<circle cx="78" cy="38" r="1.6" fill="${WHITE}" opacity="0.4"/>
${extra}
${I3}</g>`;
}

function stormSparks(pal, count) {
  const pts = [
    [8, 16], [92, 14], [4, 40], [96, 42], [12, 66], [88, 68],
    [20, 6], [80, 4], [2, 54], [98, 52], [38, 2], [62, 2],
    [14, 84], [86, 86], [50, 0],
  ].slice(0, count);
  return pts.map(([x, y], i) => {
    const fill = i % 3 === 0 ? pal.crown : i % 2 ? pal.vein : WHITE;
    return `${I3}<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 1.8 : 1.15}" fill="${fill}" opacity="${0.35 + (i % 4) * 0.1}"/>`;
  }).join('\n');
}

function bossWings(p, stroke, pal, size) {
  if (size === 'boss') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 44 Q -8 16 -14 46 Q -10 78 12 76 Q 20 62 30 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2.1"/>
${I4}<path d="M 24 46 Q -2 26 -6 48 Q -2 70 16 68 Q 22 58 28 50 Z" fill="url(#${p}-wing2)" opacity="0.82" stroke="${pal.vein}" stroke-width="0.95"/>
${I4}<path d="M 4 32 Q -6 40 -2 58" stroke="${pal.vein}" stroke-width="1.35" fill="none" opacity="0.65"/>
${I4}<path d="M 0 40 Q -10 48 -4 64" stroke="${pal.accent}" stroke-width="1.1" fill="none" opacity="0.5"/>
${I4}<path d="M 10 54 Q 16 64 24 68" stroke="${WHITE}" stroke-width="0.85" fill="none" opacity="0.4"/>
${I4}<path d="M -6 26 L -16 10" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 0 20 L -8 6" stroke="${pal.vein}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 8 18 L 2 4" stroke="${pal.crown}" stroke-width="1.3" stroke-linecap="round"/>
${I4}<path d="M -12 38 L -18 34" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<circle cx="-6" cy="40" r="2.4" fill="${pal.vein}" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 44 Q 108 16 114 46 Q 110 78 88 76 Q 80 62 70 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2.1"/>
${I4}<path d="M 76 46 Q 102 26 106 48 Q 102 70 84 68 Q 78 58 72 50 Z" fill="url(#${p}-wing2)" opacity="0.82" stroke="${pal.vein}" stroke-width="0.95"/>
${I4}<path d="M 96 32 Q 106 40 102 58" stroke="${pal.vein}" stroke-width="1.35" fill="none" opacity="0.65"/>
${I4}<path d="M 100 40 Q 110 48 104 64" stroke="${pal.accent}" stroke-width="1.1" fill="none" opacity="0.5"/>
${I4}<path d="M 90 54 Q 84 64 76 68" stroke="${WHITE}" stroke-width="0.85" fill="none" opacity="0.4"/>
${I4}<path d="M 106 26 L 116 10" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 100 20 L 108 6" stroke="${pal.vein}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 92 18 L 98 4" stroke="${pal.crown}" stroke-width="1.3" stroke-linecap="round"/>
${I4}<path d="M 112 38 L 118 34" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<circle cx="106" cy="40" r="2.4" fill="${pal.vein}" opacity="0.45"/>
${I3}</g>`;
  }
  if (size === 'lg') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 46 Q 0 22 -6 48 Q -2 72 14 70 Q 22 58 32 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.85"/>
${I4}<path d="M 10 34 Q 0 42 4 58" stroke="${pal.vein}" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 0 28 L -8 16" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<path d="M 8 24 L 2 12" stroke="${pal.vein}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 46 Q 100 22 106 48 Q 102 72 86 70 Q 78 58 68 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.85"/>
${I4}<path d="M 90 34 Q 100 42 96 58" stroke="${pal.vein}" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 100 28 L 108 16" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<path d="M 92 24 L 98 12" stroke="${pal.vein}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>`;
  }
  if (size === 'md') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 32 48 Q 8 30 4 52 Q 8 68 20 66 Q 28 56 34 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 12 40 Q 6 48 10 58" stroke="${pal.vein}" stroke-width="0.9" fill="none" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 68 48 Q 92 30 96 52 Q 92 68 80 66 Q 72 56 66 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 88 40 Q 94 48 90 58" stroke="${pal.vein}" stroke-width="0.9" fill="none" opacity="0.5"/>
${I3}</g>`;
  }
  return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 34 50 Q 16 38 14 54 Q 18 66 28 62 Q 32 56 36 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 66 50 Q 84 38 86 54 Q 82 66 72 62 Q 68 56 64 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
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
    1: { eye: [58, 26, 4.4, 5], jawY: 38, jawW: 8, fangs: 0, veins: 3, sparks: 5, wings: 'sm', shadow: 24, openJaw: false },
    2: { eye: [60, 22, 5, 5.6], jawY: 36, jawW: 9, fangs: 2, veins: 4, sparks: 7, wings: 'md', shadow: 28, openJaw: false },
    3: { eye: [62, 20, 5.6, 6.2], jawY: 36, jawW: 11, fangs: 3, veins: 5, sparks: 10, wings: 'lg', shadow: 32, openJaw: true },
    4: { eye: [64, 18, 6.4, 7.2], jawY: 38, jawW: 12, fangs: 5, veins: 6, sparks: 12, wings: 'boss', shadow: 36, openJaw: true },
    5: { eye: [64, 16, 6.6, 7.4], jawY: 38, jawW: 12, fangs: 5, veins: 7, sparks: 13, wings: 'boss', shadow: 38, openJaw: true },
    6: { eye: [65, 15, 7, 7.8], jawY: 38, jawW: 13, fangs: 6, veins: 7, sparks: 14, wings: 'boss', shadow: 40, openJaw: true },
  }[tier];

  const [ex, ey, erx, ery] = cfg.eye;
  const defs = makeDefs(p, pal);

  const body = `${I3}<ellipse cx="50" cy="96" rx="${cfg.shadow}" ry="5.2" fill="${INK}" opacity="0.48"/>
${I3}<ellipse cx="50" cy="52" rx="48" ry="40" fill="url(#${p}-aura)" opacity="${boss ? 0.5 : 0.28}"/>
${stormSparks(pal, cfg.sparks)}
${stormRings(p, pal, stroke, tier)}
${cloudMane(p, pal, tier)}
${lightningCrown(p, pal, tier)}
${bossWings(p, stroke, pal, cfg.wings)}
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${I4}<!-- Path torso (arched sky-whale — not ellipse) -->
${I4}<path d="${torsoPath(tier)}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="${boss ? 2.1 : 1.55}" stroke-linejoin="round"/>
${I4}<path d="${bellyPath(tier)}" fill="url(#${p}-belly)" opacity="0.9"/>
${dorsalRidge(p, stroke, pal, tier)}
${sideScutes(p, stroke, pal, tier)}
${veinLattice(p, pal.vein, cfg.veins)}
${I4}<!-- Storm-core -->
${I4}<ellipse cx="50" cy="${tier >= 4 ? 48 : 50}" rx="${boss ? 7.5 : 5}" ry="${boss ? 6.5 : 4}" fill="url(#${p}-core)" opacity="${boss ? 0.6 : 0.35}"/>
${I4}<ellipse cx="50" cy="${tier >= 4 ? 48 : 50}" rx="${boss ? 3.4 : 2.2}" ry="${boss ? 3 : 1.8}" fill="${pal.vein}" opacity="0.55" filter="url(#${p}-glow)"/>
${headAssembly(p, pal, stroke, tier, boss)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 30 58 Q 8 64 4 82 Q 16 86 32 72 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.35" opacity="0.93"/>
${I4}<path d="M 22 66 L 10 74" stroke="${pal.vein}" stroke-width="0.95" opacity="0.55"/>
${I4}<path d="M 8 80 L 2 90" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<path d="M 14 82 L 8 94" stroke="${pal.vein}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<path d="M 18 78 L 14 88" stroke="${pal.crown}" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 70 58 Q 92 64 96 82 Q 84 86 68 72 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.35" opacity="0.93"/>
${I4}<path d="M 78 66 L 90 74" stroke="${pal.vein}" stroke-width="0.95" opacity="0.55"/>
${I4}<path d="M 92 80 L 98 90" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<path d="M 86 82 L 92 94" stroke="${pal.vein}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<path d="M 82 78 L 86 88" stroke="${pal.crown}" stroke-width="1" stroke-linecap="round" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 38 78 Q 28 90 34 96 Q 42 92 44 82 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2" opacity="0.88"/>
${I4}<path d="M 32 92 L 24 98" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 36 94 L 30 100" stroke="${pal.vein}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 62 78 Q 72 90 66 96 Q 58 92 56 82 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2" opacity="0.88"/>
${I4}<path d="M 68 92 L 76 98" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 64 94 L 70 100" stroke="${pal.vein}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<!-- Split storm fluke -->
${I4}<path d="M 50 80 Q 50 88 28 98 Q 42 90 50 86 Q 58 90 72 98 Q 50 88 50 80 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.7" opacity="0.95"/>
${I4}<path d="M 50 84 L 34 96" stroke="${pal.vein}" stroke-width="1.15" opacity="0.55"/>
${I4}<path d="M 50 84 L 66 96" stroke="${pal.accent}" stroke-width="1.15" opacity="0.5"/>
${I4}<path d="M 50 86 L 50 98" stroke="${WHITE}" stroke-width="0.85" opacity="0.35"/>
${boss ? `${I4}<path d="M 30 96 L 22 102" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<path d="M 70 96 L 78 102" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
${I4}<path d="M 36 94 L 32 100" stroke="${pal.crown}" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 64 94 L 68 100" stroke="${pal.crown}" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>` : ''}
${I3}</g>
${cycloneEye(ex, ey, erx, ery, `url(#${p}-iris)`, stroke, pal.pale, pal.vein, { boss, glowId: `${p}-glow` })}
${grimJaw(cfg.jawY, stroke, { fangs: cfg.fangs, width: cfg.jawW, open: cfg.openJaw })}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · path silhouette boss v3) -->
${STAGES.map(leviathanStage).join('\n')}`;
