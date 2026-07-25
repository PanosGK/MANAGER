/**
 * Storm Leviathan — MYTHICAL sky-whale evo line
 * Intimidating storm god: armored plates, lightning veins, hollow storm-eye.
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

const INK = '#02060c';
const STORM = '#7dd3fc';
const DEEP = '#0a1628';

const STAGE_PALETTES = {
  baby: {
    stroke: '#1e3a5f', pale: '#e0f2fe',
    body: [['0%', '#3d5a80'], ['45%', '#1b2a44'], ['100%', '#0a1424']],
    belly: [['0%', '#4a6a8a', 0.9], ['100%', '#0c1828', 0.95]],
    vein: '#7dd3fc', iris: [['0%', '#e0f2fe'], ['50%', '#38bdf8'], ['100%', '#020617']],
    plate: '#243b55', fin: '#1e3a5f',
  },
  evo1: {
    stroke: '#0f2744', pale: '#e0f2fe',
    body: [['0%', '#2a4a6e'], ['40%', '#132438'], ['100%', '#060e18']],
    belly: [['0%', '#3a5570', 0.88], ['100%', '#081018', 0.96]],
    vein: '#67e8f9', iris: [['0%', '#bae6fd'], ['45%', '#0ea5e9'], ['100%', '#020617']],
    plate: '#1a3050', fin: '#152a44',
  },
  evo2: {
    stroke: '#0a1e36', pale: '#f0f9ff',
    body: [['0%', '#1e3a5a'], ['35%', '#0c1a2c'], ['70%', '#050c16'], ['100%', '#02060c']],
    belly: [['0%', '#2a4058', 0.85], ['100%', '#040a12', 0.97]],
    vein: '#22d3ee', iris: [['0%', '#a5f3fc'], ['40%', '#06b6d4'], ['100%', '#000']],
    plate: '#152840', fin: '#0e2038',
  },
  evo3: {
    stroke: '#061018', pale: '#f0f9ff',
    body: [['0%', '#1a3350'], ['25%', '#0a1828'], ['55%', '#040a14'], ['100%', '#010408']],
    belly: [['0%', '#1e3048', 0.85], ['100%', '#02060c', 0.98]],
    vein: '#67e8f9', iris: [['0%', '#ecfeff'], ['35%', '#22d3ee'], ['100%', '#000']],
    plate: '#0e2038', fin: '#0a1830',
  },
  evo4: {
    stroke: '#040810', pale: '#e2e8f0',
    body: [['0%', '#243040'], ['30%', '#0c141c'], ['60%', '#05080e'], ['100%', '#010204']],
    belly: [['0%', '#1a2430', 0.9], ['100%', '#010204', 0.98]],
    vein: '#94a3b8', iris: [['0%', '#f1f5f9'], ['40%', '#64748b'], ['70%', '#0ea5e9'], ['100%', '#000']],
    plate: '#121820', fin: '#0a1018',
  },
  evo5: {
    stroke: '#020406', pale: '#e2e8f0',
    body: [['0%', '#2a3038'], ['25%', '#14181e'], ['55%', '#080a0e'], ['80%', '#030406'], ['100%', '#000']],
    belly: [['0%', '#1a1e24', 0.9], ['100%', '#000', 0.99]],
    vein: '#cbd5e1', iris: [['0%', '#f8fafc'], ['30%', '#94a3b8'], ['65%', '#0369a1'], ['100%', '#000']],
    plate: '#0e1014', fin: '#06080c',
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

function stormEye(cx, cy, rx, ry, irisRef, stroke, pale, vein, intense = false) {
  const glow = intense
    ? `${I4}<ellipse cx="${cx}" cy="${cy}" rx="${(rx * 1.7).toFixed(1)}" ry="${(ry * 1.5).toFixed(1)}" fill="${vein}" opacity="0.18"/>
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${(rx * 1.25).toFixed(1)}" ry="${(ry * 1.15).toFixed(1)}" fill="${vein}" opacity="0.12"/>`
    : `${I4}<ellipse cx="${cx}" cy="${cy}" rx="${(rx * 1.35).toFixed(1)}" ry="${(ry * 1.2).toFixed(1)}" fill="${vein}" opacity="0.1"/>`;
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${glow}
${I4}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${pale}" stroke="${stroke}" stroke-width="1.4" opacity="0.9"/>
${I4}<ellipse class="tm-leviathan-iris" cx="${cx}" cy="${cy}" rx="${(rx * 0.62).toFixed(1)}" ry="${(ry * 0.62).toFixed(1)}" fill="${irisRef}"/>
${I4}<circle class="tm-leviathan-pupil" cx="${cx}" cy="${cy}" r="${(rx * 0.28).toFixed(1)}" fill="${INK}"/>
${I4}<circle cx="${(cx - rx * 0.2).toFixed(1)}" cy="${(cy - ry * 0.25).toFixed(1)}" r="${Math.max(0.8, rx * 0.12).toFixed(1)}" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${cx - rx} ${cy} Q ${cx} ${cy - 2} ${cx + rx} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function grimMouth(y, stroke, width = 8) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - width} ${y} Q 50 ${(y + 1.5).toFixed(1)} ${50 + width} ${y}" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - width} ${(y + 2).toFixed(1)} Q 50 ${(y - 1).toFixed(1)} ${50 + width} ${(y + 2).toFixed(1)}" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}

function shadow(rx = 28, opacity = 0.4) {
  return `${I3}<ellipse cx="50" cy="96" rx="${rx}" ry="4.5" fill="${INK}" opacity="${opacity}"/>`;
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
    grad(`${p}-body`, pal.body, 'radial', 'cx="42%" cy="30%" r="78%"'),
    grad(`${p}-belly`, pal.belly, 'radial', 'cx="50%" cy="45%" r="55%"'),
    grad(`${p}-iris`, pal.iris, 'radial', 'cx="40%" cy="35%" r="70%"'),
    grad(`${p}-fin`, [['0%', pal.fin], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    `${I3}<filter id="${p}-glow" x="-40%" y="-40%" width="180%" height="180%">
${I4}<feGaussianBlur stdDeviation="1.2" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
  ].join('\n');
}

function veins(p, stroke, vein, count = 3) {
  const paths = [
    `M 28 42 Q 40 48 55 44`,
    `M 45 38 Q 58 50 72 46`,
    `M 32 58 Q 50 62 68 56`,
    `M 38 70 Q 52 74 64 68`,
    `M 22 50 Q 35 55 48 52`,
  ].slice(0, count);
  return paths.map((d, i) =>
    `${I4}<path class="tm-leviathan-vein" d="${d}" stroke="${vein}" stroke-width="${1.1 + i * 0.15}" fill="none" opacity="${0.45 + i * 0.08}" filter="url(#${p}-glow)"/>`
  ).join('\n');
}

function plates(stroke, plate, n = 3) {
  const els = [];
  for (let i = 0; i < n; i++) {
    const y = 40 + i * 10;
    const rx = 14 - i * 1.5;
    els.push(`${I4}<ellipse cx="50" cy="${y}" rx="${rx}" ry="3.2" fill="${plate}" stroke="${stroke}" stroke-width="0.8" opacity="0.55"/>`);
  }
  return els.join('\n');
}

/** Shared whale body scaffolding — scales by stage params */
function whaleCore(p, pal, {
  bodyRx = 22, bodyRy = 28, headCy = 22, headRx = 14, headRy = 12,
  eyeCx = 58, eyeCy = 20, eyeRx = 5, eyeRy = 5.5,
  veinCount = 3, plateCount = 3, jawY = 30, intenseEye = false,
  shadowRx = 26,
} = {}) {
  const { stroke, pale, vein, plate } = pal;
  return `${shadow(shadowRx)}
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${I4}<!-- Sky-whale torso -->
${I4}<ellipse cx="50" cy="52" rx="${bodyRx}" ry="${bodyRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="50" cy="56" rx="${(bodyRx * 0.62).toFixed(1)}" ry="${(bodyRy * 0.55).toFixed(1)}" fill="url(#${p}-belly)" opacity="0.85"/>
${plates(stroke, plate, plateCount)}
${veins(p, stroke, vein, veinCount)}
${I4}<!-- Head / snout -->
${I4}<ellipse cx="50" cy="${headCy}" rx="${headRx}" ry="${headRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.45"/>
${I4}<path d="M ${50 + headRx * 0.35} ${headCy + 2} Q ${50 + headRx + 4} ${headCy + 4} ${50 + headRx * 0.5} ${headCy + 8}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1" opacity="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 32 48 Q 12 40 8 55 Q 18 62 32 56 Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.2" opacity="0.92"/>
${I4}<path d="M 28 50 L 14 48" stroke="${vein}" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 68 48 Q 88 40 92 55 Q 82 62 68 56 Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.2" opacity="0.92"/>
${I4}<path d="M 72 50 L 86 48" stroke="${vein}" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 36 62 Q 22 68 24 78 Q 34 76 40 70 Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.1" opacity="0.88"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 64 62 Q 78 68 76 78 Q 66 76 60 70 Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.1" opacity="0.88"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 78 Q 36 90 44 92 Q 48 86 46 80 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 78 Q 64 90 56 92 Q 52 86 54 80 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 50 78 Q 50 90 42 96 Q 50 92 58 96 Q 50 90 50 78" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.2" opacity="0.9"/>
${I4}<path d="M 50 82 L 50 94" stroke="${vein}" stroke-width="0.9" opacity="0.55"/>
${I3}</g>
${stormEye(eyeCx, eyeCy, eyeRx, eyeRy, `url(#${p}-iris)`, stroke, pale, vein, intenseEye)}
${grimMouth(jawY, stroke, intenseEye ? 9 : 7)}`;
}

function stageBaby(p, pal) {
  return whaleCore(p, pal, {
    bodyRx: 16, bodyRy: 20, headCy: 28, headRx: 11, headRy: 10,
    eyeCx: 56, eyeCy: 26, eyeRx: 3.8, eyeRy: 4.2,
    veinCount: 2, plateCount: 1, jawY: 34, shadowRx: 18,
  });
}

function stageEvo1(p, pal) {
  return whaleCore(p, pal, {
    bodyRx: 18, bodyRy: 24, headCy: 24, headRx: 12, headRy: 11,
    eyeCx: 57, eyeCy: 22, eyeRx: 4.2, eyeRy: 4.6,
    veinCount: 2, plateCount: 2, jawY: 32, shadowRx: 20,
  });
}

function stageEvo2(p, pal) {
  return whaleCore(p, pal, {
    bodyRx: 20, bodyRy: 26, headCy: 22, headRx: 13, headRy: 11.5,
    eyeCx: 58, eyeCy: 20, eyeRx: 4.6, eyeRy: 5.2,
    veinCount: 3, plateCount: 3, jawY: 30, intenseEye: true, shadowRx: 24,
  });
}

function stageEvo3(p, pal) {
  return whaleCore(p, pal, {
    bodyRx: 22, bodyRy: 28, headCy: 20, headRx: 14, headRy: 12,
    eyeCx: 58, eyeCy: 18, eyeRx: 5.2, eyeRy: 5.8,
    veinCount: 4, plateCount: 4, jawY: 29, intenseEye: true, shadowRx: 28,
  });
}

function stageEvo4(p, pal) {
  return whaleCore(p, pal, {
    bodyRx: 23, bodyRy: 29, headCy: 19, headRx: 14.5, headRy: 12.5,
    eyeCx: 59, eyeCy: 17, eyeRx: 5.4, eyeRy: 6,
    veinCount: 4, plateCount: 4, jawY: 28, intenseEye: true, shadowRx: 30,
  });
}

function stageEvo5(p, pal) {
  return whaleCore(p, pal, {
    bodyRx: 24, bodyRy: 30, headCy: 18, headRx: 15, headRy: 13,
    eyeCx: 59, eyeCy: 16, eyeRx: 5.8, eyeRy: 6.4,
    veinCount: 5, plateCount: 5, jawY: 27, intenseEye: true, shadowRx: 32,
  });
}

function leviathanStage(stage) {
  const p = `leviathan-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'Storm Calf',
    evo1: 'Gale Spawn',
    evo2: 'Thunderback',
    evo3: 'Storm Leviathan',
    evo4: 'Abyss Gale',
    evo5: 'Primordial Tempest',
  };
  const pal = STAGE_PALETTES[stage] || STAGE_PALETTES.evo3;
  const defs = makeDefs(p, pal);
  const builders = {
    baby: stageBaby, evo1: stageEvo1, evo2: stageEvo2,
    evo3: stageEvo3, evo4: stageEvo4, evo5: stageEvo5,
  };
  const body = (builders[stage] || stageEvo3)(p, pal);
  return wrapStage(stage, titles[stage], defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · sky-whale) -->
${STAGES.map(leviathanStage).join('\n')}`;
