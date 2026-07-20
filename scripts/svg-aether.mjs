/**
 * Starveil Aether — MYTHICAL evo line v4 (Pokémon-style stages)
 * Same species DNA (void / cyan / gold / rune-core / blades) but
 * EACH stage has a clearly different silhouette — like a real evo line.
 * Export for apply-aether-svg.mjs → myman_mascot.js
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};

const CYAN = '#4dd0e1';
const GOLD = '#c9a227';
const VIOLET = '#7c4dff';
const DEEP = '#12001f';
const INK = '#05010c';
const PALE = '#e8e0f0';

/** Per-evo colors — softer young → colder adult → cruel eclipse/primordial */
const STAGE_PALETTES = {
  baby: {
    a: '#7ec8c3', b: '#c9a0dc', c: '#ffe082',
    stroke: '#6a5a82', pale: '#f3e5f5',
    body: [['0%', '#e1bee7'], ['45%', '#b39ddb'], ['100%', '#7e57c2']],
    belly: [['0%', '#f8eafc', 0.9], ['100%', '#5e35b1', 0.9]],
    wing0: '#b2dfdb', wing1: '#ce93d8',
    iris: [['0%', '#e0f7fa'], ['55%', '#80cbc4'], ['100%', '#1a0033']],
    aura0: '#80cbc4', aura1: '#ce93d8', aura2: '#ffe082',
  },
  evo1: {
    a: '#4db6ac', b: '#9575cd', c: '#ffb74d',
    stroke: '#4a3a6a', pale: '#ede7f6',
    body: [['0%', '#b39ddb'], ['40%', '#7e57c2'], ['100%', '#4527a0']],
    belly: [['0%', '#d1c4e9', 0.85], ['100%', '#311b92', 0.95]],
    wing0: '#80cbc4', wing1: '#7e57c2',
    iris: [['0%', '#b2ebf2'], ['50%', '#26a69a'], ['100%', '#0a0018']],
    aura0: '#4db6ac', aura1: '#9575cd', aura2: '#ffb74d',
  },
  evo2: {
    a: '#00acc1', b: '#5c6bc0', c: '#c0a060',
    stroke: '#2a1848', pale: '#e8e0f0',
    body: [['0%', '#7986cb'], ['40%', '#5e35b1'], ['100%', '#1a237e']],
    belly: [['0%', '#5c6bc0', 0.85], ['100%', '#0d0220', 0.95]],
    wing0: '#4dd0e1', wing1: '#3949ab',
    iris: [['0%', '#84ffff'], ['45%', '#00acc1'], ['100%', '#05010c']],
    aura0: '#00acc1', aura1: '#5c6bc0', aura2: '#c0a060',
  },
  evo3: {
    a: '#26c6da', b: '#ffd54f', c: '#7c4dff',
    stroke: '#1a0a30', pale: '#e8e0f0',
    body: [['0%', '#9575cd'], ['30%', '#651fff'], ['65%', '#311b92'], ['100%', '#0a0018']],
    belly: [['0%', '#4a3a68', 0.85], ['100%', '#05010c', 0.95]],
    wing0: '#4dd0e1', wing1: '#7c4dff',
    iris: [['0%', '#a8e6f0'], ['45%', '#26c6da'], ['100%', '#05010c']],
    aura0: '#26c6da', aura1: '#7c4dff', aura2: '#ffd54f',
  },
  evo4: {
    a: '#ef5350', b: '#bf8f2e', c: '#6a1b9a',
    stroke: '#1a0508', pale: '#f5e6e6',
    body: [['0%', '#6a3a4a'], ['30%', '#4a1028'], ['60%', '#2a0830'], ['100%', '#050008']],
    belly: [['0%', '#3a1520', 0.9], ['100%', '#050008', 0.98]],
    wing0: '#8d4a4a', wing1: '#4a148c',
    iris: [['0%', '#ffcdd2'], ['40%', '#e53935'], ['100%', '#1a0000']],
    aura0: '#ef5350', aura1: '#6a1b9a', aura2: '#bf8f2e',
  },
  evo5: {
    a: '#8b0000', b: '#c9b896', c: '#5d4037',
    stroke: '#2a1810', pale: '#efe6d8',
    body: [['0%', '#c4b49a'], ['25%', '#6a5040'], ['55%', '#2a1818'], ['80%', '#1a0808'], ['100%', '#050202']],
    belly: [['0%', '#4a3028', 0.85], ['100%', '#050202', 0.98]],
    wing0: '#8d6e63', wing1: '#5d4037',
    iris: [['0%', '#efebe9'], ['35%', '#a1887f'], ['70%', '#8b0000'], ['100%', '#1a0000']],
    aura0: '#8b0000', aura1: '#5d4037', aura2: '#c9b896',
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

function solemnEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, { slit = false, glow = false, glowA = CYAN, glowB = GOLD, sclera = PALE } = {}) {
  const irisRx = slit ? rxE * 0.32 : rxE * 0.48;
  const irisRy = slit ? ryE * 0.75 : ryE * 0.55;
  const glowEl = glow
    ? `${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(rxE * 1.55).toFixed(1)}" ry="${(ryE * 1.3).toFixed(1)}" fill="${glowA}" opacity="0.12"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(rxE * 1.55).toFixed(1)}" ry="${(ryE * 1.3).toFixed(1)}" fill="${glowB}" opacity="0.1"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${glowEl}
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.35" opacity="0.92"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.35" opacity="0.92"/>
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${irisRx.toFixed(1)}" ry="${irisRy.toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${irisRx.toFixed(1)}" ry="${irisRy.toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(irisRx * 0.35).toFixed(1)}" ry="${(irisRy * 0.55).toFixed(1)}" fill="${INK}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(irisRx * 0.35).toFixed(1)}" ry="${(irisRy * 0.55).toFixed(1)}" fill="${INK}"/>
${I4}<line x1="${(lx - rxE * 0.85).toFixed(1)}" y1="${(cy - ryE * 0.85).toFixed(1)}" x2="${(lx + rxE * 0.65).toFixed(1)}" y2="${(cy - ryE * 0.5).toFixed(1)}" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round" opacity="0.75"/>
${I4}<line x1="${(rx + rxE * 0.85).toFixed(1)}" y1="${(cy - ryE * 0.85).toFixed(1)}" x2="${(rx - rxE * 0.65).toFixed(1)}" y2="${(cy - ryE * 0.5).toFixed(1)}" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} L ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.1" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} L ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.1" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function solemnMouth(y, stroke, width = 5) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - width} ${y} Q 50 ${(y + 2).toFixed(1)} ${50 + width} ${y}" stroke="${stroke}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - width} ${(y + 2).toFixed(1)} Q 50 ${(y - 1).toFixed(1)} ${50 + width} ${(y + 2).toFixed(1)}" stroke="${stroke}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
}

function shadow(rx, opacity = 0.35) {
  return `${I3}<ellipse cx="50" cy="96" rx="${rx}" ry="4.2" fill="${INK}" opacity="${opacity}"/>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- AETHER ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-aether" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function makeDefs(p, pal) {
  return [
    grad(`${p}-body`, pal.body, 'radial', 'cx="38%" cy="22%" r="80%"'),
    grad(`${p}-belly`, pal.belly, 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(`${p}-wing`, [['0%', pal.wing0, 0.85], ['40%', pal.wing1, 0.7], ['100%', DEEP, 0.8]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-wing2`, [['0%', pal.b, 0.45], ['100%', DEEP, 0.55]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-core`, [['0%', pal.pale], ['30%', pal.a], ['70%', pal.c], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, pal.iris, 'radial', 'cx="40%" cy="35%" r="65%"'),
    grad(`${p}-aura`, [['0%', pal.aura0, 0.26], ['35%', pal.aura1, 0.22], ['70%', pal.aura2, 0.1], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    grad(`${p}-aura2`, [['0%', pal.aura2, 0.22], ['40%', pal.aura0, 0.14], ['100%', pal.aura1, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-corona`, [['0%', pal.aura2, 0.3], ['40%', pal.aura0, 0.14], ['100%', pal.aura1, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-tail`, [['0%', pal.wing0], ['55%', pal.c], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-plate`, [['0%', '#3a2a55'], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-sigil`, [['0%', pal.b, 0.55], ['100%', pal.a, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-beam`, [['0%', pal.pale, 0.55], ['50%', pal.a, 0.22], ['100%', pal.c, 0]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\n');
}

/** Layered aura + addons. tier 1=baby … 6=old */
function epicAddons(p, tier = 1, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  const sparks = [
    [12, 16], [88, 14], [6, 40], [94, 42], [18, 70], [82, 72],
    [28, 8], [72, 6], [4, 58], [96, 56], [40, 4], [60, 4],
    [22, 84], [78, 86], [48, 2], [52, 90],
  ].slice(0, 4 + tier * 2);

  const sparkSvg = sparks.map(([x, y], i) => {
    const fill = i % 3 === 0 ? GOLD : i % 3 === 1 ? CYAN : VIOLET;
    const r = i % 4 === 0 ? 1.8 : i % 2 ? 1.0 : 1.35;
    return `${I3}<circle class="tm-aether-spark" cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${0.35 + (i % 4) * 0.1}"/>`;
  }).join('\n');

  const auraR = 26 + tier * 3.2;
  let layers = `${I3}<ellipse class="tm-aether-aura" cx="50" cy="50" rx="${auraR.toFixed(1)}" ry="${(auraR * 0.9).toFixed(1)}" fill="url(#${p}-aura)"/>
${I3}<ellipse class="tm-aether-aura-outer" cx="50" cy="50" rx="${(auraR * 1.18).toFixed(1)}" ry="${(auraR * 1.05).toFixed(1)}" fill="url(#${p}-aura2)" opacity="0.7"/>
${I3}<ellipse class="tm-aether-corona" cx="50" cy="52" rx="${(auraR * 0.62).toFixed(1)}" ry="${(auraR * 0.55).toFixed(1)}" fill="url(#${p}-corona)" opacity="0.65"/>`;

  // Energy beam rays behind body
  if (tier >= 2) {
    layers += `
${I3}<g class="tm-aether-beams" opacity="${0.25 + tier * 0.04}">
${I4}<path d="M 50 8 L 46 48 L 54 48 Z" fill="url(#${p}-beam)"/>
${I4}<path d="M 18 28 L 44 52 L 50 46 Z" fill="url(#${p}-beam)" opacity="0.7"/>
${I4}<path d="M 82 28 L 56 52 L 50 46 Z" fill="url(#${p}-beam)" opacity="0.7"/>
${tier >= 4 ? `${I4}<path d="M 12 60 L 44 56 L 48 50 Z" fill="url(#${p}-beam)" opacity="0.55"/>
${I4}<path d="M 88 60 L 56 56 L 52 50 Z" fill="url(#${p}-beam)" opacity="0.55"/>` : ''}
${I3}</g>`;
  }

  // Ground / foot sigil
  if (tier >= 2) {
    layers += `
${I3}<ellipse class="tm-aether-sigil" cx="50" cy="94" rx="${14 + tier}" ry="${3 + tier * 0.3}" fill="url(#${p}-sigil)" opacity="0.55"/>
${I3}<ellipse class="tm-aether-sigil" cx="50" cy="94" rx="${10 + tier * 0.6}" ry="2.2" fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.5"/>`;
  }

  // Orbit rings
  if (tier >= 2) {
    const rings = [];
    rings.push(`${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${32 + tier * 2}" ry="${12 + tier}" fill="none" stroke="${CYAN}" stroke-width="1.15" opacity="0.5" stroke-dasharray="5 4"/>`);
    if (tier >= 3) {
      rings.push(`${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${26 + tier}" ry="${16 + tier * 0.6}" fill="none" stroke="${GOLD}" stroke-width="0.9" opacity="0.4" stroke-dasharray="3 5" transform="rotate(32 50 52)"/>`);
    }
    if (tier >= 4) {
      rings.push(`${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${20 + tier}" ry="${20 + tier * 0.4}" fill="none" stroke="${VIOLET}" stroke-width="0.75" opacity="0.35" stroke-dasharray="2 4" transform="rotate(-24 50 52)"/>`);
      rings.push(`${I4}<circle class="tm-aether-orbit-node" cx="${50 + 32 + tier * 2}" cy="52" r="1.8" fill="${GOLD}" opacity="0.75"/>`);
      rings.push(`${I4}<circle class="tm-aether-orbit-node" cx="${50 - (26 + tier) * 0.7}" cy="${52 - (16 + tier * 0.6) * 0.55}" r="1.4" fill="${CYAN}" opacity="0.7"/>`);
    }
    if (tier >= 5) {
      rings.push(`${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${38 + tier}" ry="${10 + tier * 0.4}" fill="none" stroke="${PALE}" stroke-width="0.6" opacity="0.3" stroke-dasharray="1 7" transform="rotate(12 50 52)"/>`);
    }
    layers += `
${I3}<g class="tm-aether-orbit-group">
${rings.join('\n')}
${I3}</g>`;
  }

  // Rune circle around core area
  if (tier >= 3) {
    layers += `
${I3}<g class="tm-aether-runes" opacity="0.45">
${I4}<circle class="tm-aether-rune-ring" cx="50" cy="54" r="${11 + tier}" fill="none" stroke="${GOLD}" stroke-width="0.7" stroke-dasharray="2 3"/>
${I4}<path d="M 50 ${(54 - 11 - tier).toFixed(1)} L ${(50 + 3).toFixed(1)} ${(54 - 6 - tier * 0.4).toFixed(1)}" stroke="${CYAN}" stroke-width="0.7"/>
${I4}<path d="M ${(50 + 11 + tier).toFixed(1)} 54 L ${(50 + 7 + tier * 0.4).toFixed(1)} ${(54 + 3).toFixed(1)}" stroke="${GOLD}" stroke-width="0.7"/>
${I4}<path d="M 50 ${(54 + 11 + tier).toFixed(1)} L ${(50 - 3).toFixed(1)} ${(54 + 6 + tier * 0.4).toFixed(1)}" stroke="${CYAN}" stroke-width="0.7"/>
${I4}<path d="M ${(50 - 11 - tier).toFixed(1)} 54 L ${(50 - 7 - tier * 0.4).toFixed(1)} ${(54 - 3).toFixed(1)}" stroke="${GOLD}" stroke-width="0.7"/>
${I3}</g>`;
  }

  // Floating glyph shards
  if (tier >= 4) {
    layers += `
${I3}<g class="tm-aether-shards">
${I4}<path class="tm-aether-shard" d="M 16 44 L 12 38 L 20 40 Z" fill="${CYAN}" opacity="0.45"/>
${I4}<path class="tm-aether-shard" d="M 84 44 L 88 38 L 80 40 Z" fill="${GOLD}" opacity="0.45"/>
${I4}<path class="tm-aether-shard" d="M 24 68 L 18 64 L 26 62 Z" fill="${VIOLET}" opacity="0.4"/>
${I4}<path class="tm-aether-shard" d="M 76 68 L 82 64 L 74 62 Z" fill="${CYAN}" opacity="0.4"/>
${tier >= 5 ? `${I4}<path class="tm-aether-shard" d="M 50 6 L 46 12 L 54 12 Z" fill="${GOLD}" opacity="0.5"/>
${I4}<path class="tm-aether-shard" d="M 8 52 L 4 48 L 10 46 Z" fill="${GOLD}" opacity="0.35"/>
${I4}<path class="tm-aether-shard" d="M 92 52 L 96 48 L 90 46 Z" fill="${CYAN}" opacity="0.35"/>` : ''}
${I3}</g>`;
  }

  // Energy ribbons (mantle trails)
  if (tier >= 3) {
    layers += `
${I3}<g class="tm-aether-ribbons" opacity="0.5">
${I4}<path class="tm-aether-ribbon" d="M 34 40 Q 18 30 10 48 Q 16 42 30 46" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
${I4}<path class="tm-aether-ribbon" d="M 66 40 Q 82 30 90 48 Q 84 42 70 46" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
${tier >= 5 ? `${I4}<path class="tm-aether-ribbon" d="M 40 72 Q 28 84 16 78" fill="none" stroke="${VIOLET}" stroke-width="1"/>
${I4}<path class="tm-aether-ribbon" d="M 60 72 Q 72 84 84 78" fill="none" stroke="${GOLD}" stroke-width="1"/>` : ''}
${I3}</g>`;
  }

  return `${layers}
${sparkSvg}`;
}

/** BABY — Voidseed: floating orb chrysalis, stub fins, no real limbs yet */
function babyBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(18, 0.28)}
${epicAddons(p, 1, pal)}
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 34 58 L 22 50 L 24 62 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 66 58 L 78 50 L 76 62 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 70 L 68 78 L 62 68 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="0.9" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Seed orb -->
${I4}<ellipse cx="50" cy="58" rx="18" ry="20" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="50" cy="60" rx="10" ry="12" fill="url(#${p}-belly)" opacity="0.7"/>
${I4}<circle class="tm-aether-core" cx="50" cy="58" r="5" fill="url(#${p}-core)"/>
${I4}<circle class="tm-aether-core-ring" cx="50" cy="58" r="8" fill="none" stroke="${CYAN}" stroke-width="0.6" opacity="0.4" stroke-dasharray="2 2"/>
${I4}<path d="M 50 42 L 50 74" stroke="${CYAN}" stroke-width="0.55" opacity="0.35"/>
${I4}<path d="M 40 50 L 60 66" stroke="${GOLD}" stroke-width="0.45" opacity="0.25"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="32" cy="62" rx="3" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.9" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="68" cy="62" rx="3" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.9" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="44" cy="78" rx="4" ry="3" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.9" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="56" cy="78" rx="4" ry="3" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.9" opacity="0.55"/>
${I3}</g>
${solemnEyes(43, 57, 50, 4, 4.8, `url(#${p}-iris)`, stroke)}
${solemnMouth(60, stroke, 4)}`;
}

/** KID — Veilspawn: pear body, stub legs, horn nubs, triangle wing stubs */
function kidBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(22, 0.3)}
${epicAddons(p, 2, pal)}
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 32 52 L 14 40 L 18 56 L 30 58 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<circle cx="14" cy="40" r="1.3" fill="${CYAN}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 68 52 L 86 40 L 82 56 L 70 58 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<circle cx="86" cy="40" r="1.3" fill="${GOLD}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 60 70 L 76 80 L 70 66 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Pear torso -->
${I4}<path d="M 36 48 Q 34 70 42 80 L 58 80 Q 66 70 64 48 Q 58 38 50 36 Q 42 38 36 48 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="50" cy="62" rx="9" ry="11" fill="url(#${p}-belly)"/>
${I4}<circle class="tm-aether-core" cx="50" cy="58" r="5.5" fill="url(#${p}-core)"/>
${I4}<circle class="tm-aether-core-ring" cx="50" cy="58" r="8.5" fill="none" stroke="${GOLD}" stroke-width="0.6" opacity="0.4" stroke-dasharray="2 2"/>
${I4}<!-- Round head -->
${I4}<ellipse cx="50" cy="32" rx="13" ry="13" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.45"/>
${I4}<!-- Horn nubs -->
${I4}<path d="M 40 24 L 36 16" stroke="${CYAN}" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 60 24 L 64 16" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>
${I4}<circle cx="36" cy="16" r="1.5" fill="${CYAN}" opacity="0.7"/>
${I4}<circle cx="64" cy="16" r="1.5" fill="${GOLD}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 36 58 L 26 64 L 28 70 L 36 64 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 64 58 L 74 64 L 72 70 L 64 64 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 44 80 L 40 92 L 48 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 56 80 L 52 92 L 60 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1"/>
${I3}</g>
${solemnEyes(43, 57, 30, 4.2, 5.2, `url(#${p}-iris)`, stroke)}
${solemnMouth(40, stroke, 4.5)}`;
}

/** TEEN — Astral Warden: bipedal, scythe wings, crescent horns, 1 orbit */
function teenBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(24, 0.32)}
${epicAddons(p, 3, pal)}
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 48 L 8 28 L 4 44 L 12 58 L 28 56 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<path d="M 26 50 L 10 40" stroke="${CYAN}" stroke-width="0.7" opacity="0.5"/>
${I4}<circle cx="6" cy="30" r="1.5" fill="${CYAN}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 L 92 28 L 96 44 L 88 58 L 72 56 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<path d="M 74 50 L 90 40" stroke="${GOLD}" stroke-width="0.7" opacity="0.5"/>
${I4}<circle cx="94" cy="30" r="1.5" fill="${GOLD}" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 68 L 80 76 L 74 60 L 62 64 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<circle cx="80" cy="74" r="1.6" fill="${GOLD}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Slim torso -->
${I4}<path d="M 38 44 Q 36 66 40 78 L 60 78 Q 64 66 62 44 Q 56 36 50 34 Q 44 36 38 44 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.55"/>
${I4}<ellipse cx="50" cy="58" rx="8" ry="12" fill="url(#${p}-belly)"/>
${I4}<circle class="tm-aether-core" cx="50" cy="54" r="6" fill="url(#${p}-core)"/>
${I4}<path d="M 50 44 L 50 66" stroke="${CYAN}" stroke-width="0.55" opacity="0.4"/>
${I4}<!-- Head -->
${I4}<ellipse cx="50" cy="26" rx="12.5" ry="13" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<!-- Crescent horns -->
${I4}<path d="M 38 20 Q 28 8 34 4" fill="none" stroke="${CYAN}" stroke-width="2.2" stroke-linecap="round"/>
${I4}<path d="M 62 20 Q 72 8 66 4" fill="none" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round"/>
${I4}<circle cx="34" cy="4" r="1.7" fill="${CYAN}"/>
${I4}<circle cx="66" cy="4" r="1.7" fill="${GOLD}"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 38 52 L 24 58 L 26 68 L 38 60 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<circle cx="24" cy="66" r="1.4" fill="${CYAN}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 62 52 L 76 58 L 74 68 L 62 60 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<circle cx="76" cy="66" r="1.4" fill="${GOLD}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 78 L 38 92 L 48 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<ellipse cx="43" cy="92" rx="5" ry="1.6" fill="${INK}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 78 L 52 92 L 62 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<ellipse cx="57" cy="92" rx="5" ry="1.6" fill="${INK}" opacity="0.5"/>
${I3}</g>
${solemnEyes(42, 58, 24, 4.4, 5.6, `url(#${p}-iris)`, stroke, { slit: true })}
${solemnMouth(36, stroke, 5)}`;
}

/** ADULT — Starveil Sovereign: tall, multi-blade wings, diadem, triple orbits, mantle */
function adultBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(28, 0.38)}
${epicAddons(p, 4, pal)}
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 46 L 2 18 L -4 36 L 6 58 L 16 64 L 28 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.35"/>
${I4}<path d="M 26 50 L 6 42 L 10 60 L 24 56 Z" fill="url(#${p}-wing2)" stroke="${stroke}" stroke-width="0.9" opacity="0.65"/>
${I4}<path d="M 20 40 L 0 22" stroke="${CYAN}" stroke-width="0.75" opacity="0.5"/>
${I4}<circle cx="0" cy="20" r="1.8" fill="${CYAN}" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 46 L 98 18 L 104 36 L 94 58 L 84 64 L 72 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.35"/>
${I4}<path d="M 74 50 L 94 42 L 90 60 L 76 56 Z" fill="url(#${p}-wing2)" stroke="${stroke}" stroke-width="0.9" opacity="0.65"/>
${I4}<path d="M 80 40 L 100 22" stroke="${GOLD}" stroke-width="0.75" opacity="0.5"/>
${I4}<circle cx="100" cy="20" r="1.8" fill="${GOLD}" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 70 L 82 78 L 92 52 L 84 72 L 64 68 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<path d="M 70 72 L 88 84" stroke="${CYAN}" stroke-width="0.7" opacity="0.4"/>
${I4}<circle cx="92" cy="52" r="2" fill="${GOLD}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Tall angular sovereign torso -->
${I4}<path d="M 36 40 Q 34 64 38 78 L 62 78 Q 66 64 64 40 Q 58 30 50 28 Q 42 30 36 40 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.65"/>
${I4}<ellipse cx="50" cy="56" rx="8" ry="14" fill="url(#${p}-belly)"/>
${I4}<circle class="tm-aether-core" cx="50" cy="52" r="7" fill="url(#${p}-core)"/>
${I4}<circle class="tm-aether-core-ring" cx="50" cy="52" r="10" fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.4"/>
${I4}<path d="M 50 38 L 50 68" stroke="${CYAN}" stroke-width="0.6" opacity="0.4"/>
${I4}<!-- Head -->
${I4}<path d="M 38 24 Q 38 10 50 8 Q 62 10 62 24 Q 60 34 50 36 Q 40 34 38 24 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.55"/>
${I4}<!-- Diadem + antlers -->
${I4}<ellipse class="tm-aether-halo" cx="50" cy="8" rx="14" ry="3" fill="none" stroke="${GOLD}" stroke-width="1.3" opacity="0.75"/>
${I4}<path d="M 40 14 L 50 0 L 60 14" fill="${DEEP}" stroke="${GOLD}" stroke-width="1.1"/>
${I4}<path d="M 36 18 L 24 2" stroke="${CYAN}" stroke-width="2.1" stroke-linecap="round"/>
${I4}<path d="M 64 18 L 76 2" stroke="${GOLD}" stroke-width="2.1" stroke-linecap="round"/>
${I4}<circle cx="24" cy="2" r="1.8" fill="${CYAN}"/>
${I4}<circle cx="76" cy="2" r="1.8" fill="${GOLD}"/>
${I4}<circle cx="50" cy="0" r="1.6" fill="${PALE}"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 36 48 L 18 54 L 20 68 L 36 58 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<circle cx="18" cy="66" r="1.6" fill="${CYAN}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 64 48 L 82 54 L 80 68 L 64 58 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<circle cx="82" cy="66" r="1.6" fill="${GOLD}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 78 L 36 94 L 48 94 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="42" cy="94" rx="6" ry="1.8" fill="${INK}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 78 L 52 94 L 64 94 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="58" cy="94" rx="6" ry="1.8" fill="${INK}" opacity="0.55"/>
${I3}</g>
${solemnEyes(41, 59, 20, 4.6, 6, `url(#${p}-iris)`, stroke, { slit: true, glow: true, glowA: CYAN, glowB: GOLD, sclera: pal.pale })}
${solemnMouth(30, stroke, 5.5)}`;
}

/** MID — Eclipse Sovereign: armored plates, jagged wings, eclipse disk, heavier */
function midBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(28, 0.42)}
${epicAddons(p, 5, pal)}
${I4}<!-- Eclipse disk behind head -->
${I3}<circle class="tm-aether-eclipse" cx="50" cy="22" r="16" fill="${INK}" opacity="0.55"/>
${I3}<circle class="tm-aether-eclipse" cx="50" cy="22" r="16" fill="none" stroke="${GOLD}" stroke-width="1.4" opacity="0.55"/>
${I3}<circle class="tm-aether-eclipse" cx="54" cy="20" r="12" fill="url(#${p}-aura)" opacity="0.35"/>
${I3}<g class="tm-animate-wing-left">
${I4}<!-- Jagged eclipse wing -->
${I4}<path d="M 30 48 L 6 22 L 0 34 L 4 50 L 2 62 L 14 58 L 28 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 24 50 L 8 44 L 12 58 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="0.8" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 L 94 22 L 100 34 L 96 50 L 98 62 L 86 58 L 72 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 76 50 L 92 44 L 88 58 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="0.8" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 70 L 84 82 L 90 58 L 78 74 L 62 68 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 72 74 L 86 88" stroke="${GOLD}" stroke-width="0.8" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Armored wider torso -->
${I4}<path d="M 34 42 Q 32 66 38 80 L 62 80 Q 68 66 66 42 Q 58 32 50 30 Q 42 32 34 42 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.7"/>
${I4}<path d="M 40 44 L 40 72 L 60 72 L 60 44 Z" fill="url(#${p}-plate)" opacity="0.55"/>
${I4}<ellipse cx="50" cy="58" rx="8" ry="12" fill="url(#${p}-belly)"/>
${I4}<circle class="tm-aether-core" cx="50" cy="54" r="6.5" fill="url(#${p}-core)"/>
${I4}<!-- Heavier head -->
${I4}<ellipse cx="50" cy="22" rx="13" ry="13.5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.55"/>
${I4}<path d="M 38 16 L 28 4" stroke="${GOLD}" stroke-width="2.3" stroke-linecap="round"/>
${I4}<path d="M 62 16 L 72 4" stroke="${GOLD}" stroke-width="2.3" stroke-linecap="round"/>
${I4}<path d="M 44 10 L 50 2 L 56 10" fill="${INK}" stroke="${GOLD}" stroke-width="1"/>
${I4}<circle cx="28" cy="4" r="1.6" fill="${GOLD}" opacity="0.7"/>
${I4}<circle cx="72" cy="4" r="1.6" fill="${GOLD}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 50 L 16 56 L 18 72 L 34 62 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<path d="M 20 60 L 18 70" stroke="${GOLD}" stroke-width="1.2"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 50 L 84 56 L 82 72 L 66 62 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<path d="M 80 60 L 82 70" stroke="${GOLD}" stroke-width="1.2"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 80 L 36 94 L 48 94 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<rect x="36" y="90" width="12" height="3" rx="1" fill="url(#${p}-plate)" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 80 L 52 94 L 64 94 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<rect x="52" y="90" width="12" height="3" rx="1" fill="url(#${p}-plate)" opacity="0.7"/>
${I3}</g>
${solemnEyes(41, 59, 20, 4.5, 5.8, `url(#${p}-iris)`, stroke, { slit: true, glow: true, glowA: CYAN, glowB: GOLD, sclera: pal.pale })}
${solemnMouth(32, stroke, 5)}`;
}

/** OLD — Primordial Absolute: elongated ethereal, huge translucent wings, thin halo */
function oldBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(30, 0.3)}
${epicAddons(p, 6, pal)}
${I3}<ellipse class="tm-aether-halo" cx="50" cy="14" rx="22" ry="5" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.7"/>
${I3}<ellipse class="tm-aether-halo" cx="50" cy="14" rx="16" ry="3.5" fill="none" stroke="${CYAN}" stroke-width="0.8" opacity="0.45"/>
${I3}<ellipse class="tm-aether-halo" cx="50" cy="14" rx="28" ry="7" fill="none" stroke="${VIOLET}" stroke-width="0.55" opacity="0.35" stroke-dasharray="3 4"/>
${I3}<g class="tm-animate-wing-left">
${I4}<!-- Vast ethereal wing -->
${I4}<path d="M 30 44 Q -8 8 -10 40 Q -6 72 18 68 Q 26 56 32 48 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.2" opacity="0.75"/>
${I4}<path d="M 26 46 Q 2 24 0 46 Q 2 64 20 60" fill="url(#${p}-wing2)" opacity="0.45"/>
${I4}<path d="M 14 30 Q 4 38 8 54" stroke="${GOLD}" stroke-width="0.7" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 44 Q 108 8 110 40 Q 106 72 82 68 Q 74 56 68 48 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.2" opacity="0.75"/>
${I4}<path d="M 74 46 Q 98 24 100 46 Q 98 64 80 60" fill="url(#${p}-wing2)" opacity="0.45"/>
${I4}<path d="M 86 30 Q 96 38 92 54" stroke="${CYAN}" stroke-width="0.7" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 68 Q 78 78 96 48 Q 86 72 68 70 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1" opacity="0.8"/>
${I4}<path d="M 64 70 Q 84 86 98 60" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.4"/>
${I4}<circle cx="96" cy="48" r="2" fill="${GOLD}" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Elongated ethereal form -->
${I4}<path d="M 38 38 Q 36 62 40 76 L 60 76 Q 64 62 62 38 Q 56 26 50 24 Q 44 26 38 38 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5" opacity="0.92"/>
${I4}<ellipse cx="50" cy="52" rx="7" ry="14" fill="url(#${p}-belly)" opacity="0.75"/>
${I4}<circle class="tm-aether-core" cx="50" cy="48" r="7.5" fill="url(#${p}-core)"/>
${I4}<circle class="tm-aether-core-ring" cx="50" cy="48" r="11" fill="none" stroke="${GOLD}" stroke-width="0.65" opacity="0.45"/>
${I4}<path d="M 50 34 L 50 64" stroke="${GOLD}" stroke-width="0.55" opacity="0.4"/>
${I4}<!-- Elongated serene head -->
${I4}<ellipse cx="50" cy="18" rx="12" ry="13" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.45"/>
${I4}<path d="M 38 12 L 28 -2" stroke="${GOLD}" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 62 12 L 72 -2" stroke="${GOLD}" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 46 6 L 50 -4 L 54 6" fill="none" stroke="${CYAN}" stroke-width="1.1"/>
${I4}<circle cx="28" cy="-2" r="1.7" fill="${GOLD}" opacity="0.75"/>
${I4}<circle cx="72" cy="-2" r="1.7" fill="${GOLD}" opacity="0.75"/>
${I4}<circle cx="50" cy="-4" r="1.4" fill="${PALE}" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 38 46 L 20 50 L 22 64 L 38 56 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1" opacity="0.85"/>
${I4}<circle cx="20" cy="62" r="1.5" fill="${GOLD}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 62 46 L 80 50 L 78 64 L 62 56 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1" opacity="0.85"/>
${I4}<circle cx="80" cy="62" r="1.5" fill="${CYAN}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 76 L 38 92 L 48 90 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 76 L 52 90 L 62 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.1" opacity="0.8"/>
${I3}</g>
${solemnEyes(41, 59, 16, 4.4, 5.8, `url(#${p}-iris)`, stroke, { slit: true, glow: true, glowA: CYAN, glowB: GOLD, sclera: pal.pale })}
${solemnMouth(28, stroke, 5)}`;
}

function aetherStage(stage) {
  const p = `aether-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'Voidseed',
    evo1: 'Veilspawn',
    evo2: 'Astral Warden',
    evo3: 'Starveil Sovereign',
    evo4: 'Eclipse Sovereign',
    evo5: 'Primordial Absolute',
  };

  const pal = STAGE_PALETTES[stage] || STAGE_PALETTES.evo3;
  const stroke = pal.stroke;
  const defs = makeDefs(p, pal);
  const builders = {
    baby: babyBody,
    evo1: kidBody,
    evo2: teenBody,
    evo3: adultBody,
    evo4: midBody,
    evo5: oldBody,
  };

  return wrapStage(stage, titles[stage], defs, builders[stage](p, stroke, pal));
}

export const aetherSvg = [
  `${I}<!-- AETHER CHARACTER - All Life Stages (MYTHICAL evo line v5 · stage color progression) -->`,
  `${I}<!-- Voidseed → Veilspawn → Astral Warden → Sovereign → Eclipse → Primordial -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(aetherStage),
].join('\n');
