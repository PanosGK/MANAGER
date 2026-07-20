/**
 * Starveil Aether — MYTHICAL evo line v9 (dragon-blade wings + pulsing veins)
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
    // Color discipline: blood / bone-gold / void-purple only
    a: '#c62828', b: '#b8963a', c: '#4a148c',
    stroke: '#120208', pale: '#f0e4e4',
    body: [['0%', '#5a2830'], ['30%', '#3a0c1c'], ['60%', '#1a0618'], ['100%', '#050008']],
    belly: [['0%', '#2a1018', 0.9], ['100%', '#050008', 0.98]],
    wing0: '#7a3038', wing1: '#3a0a5c',
    iris: [['0%', '#ffcdd2'], ['40%', '#c62828'], ['100%', '#1a0000']],
    aura0: '#c62828', aura1: '#4a148c', aura2: '#b8963a',
  },
  evo5: {
    // Color discipline: abyss-red / bone / void-brown
    a: '#7a0000', b: '#c9b896', c: '#3e2723',
    stroke: '#1a100c', pale: '#efe6d8',
    body: [['0%', '#c4b49a'], ['25%', '#5a4038'], ['55%', '#241414'], ['80%', '#140606'], ['100%', '#050202']],
    belly: [['0%', '#3a2820', 0.85], ['100%', '#050202', 0.98]],
    wing0: '#6d4c41', wing1: '#3e2723',
    iris: [['0%', '#efebe9'], ['35%', '#a1887f'], ['70%', '#7a0000'], ['100%', '#1a0000']],
    aura0: '#7a0000', aura1: '#3e2723', aura2: '#c9b896',
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

function solemnEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, { slit = false, glow = false, glowA = CYAN, glowB = GOLD, sclera = PALE, eclipse = false } = {}) {
  const irisRx = eclipse ? rxE * 0.55 : (slit ? rxE * 0.32 : rxE * 0.48);
  const irisRy = eclipse ? ryE * 0.55 : (slit ? ryE * 0.75 : ryE * 0.55);
  const glowEl = glow
    ? `${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(rxE * 1.55).toFixed(1)}" ry="${(ryE * 1.3).toFixed(1)}" fill="${glowA}" opacity="0.12"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(rxE * 1.55).toFixed(1)}" ry="${(ryE * 1.3).toFixed(1)}" fill="${glowB}" opacity="0.1"/>`
    : '';
  const pupilL = eclipse
    ? `${I4}<circle class="tm-aether-eclipse-pupil" cx="${lx}" cy="${cy}" r="${(irisRx * 0.85).toFixed(1)}" fill="${INK}"/>
${I4}<path class="tm-aether-eclipse-crescent" d="M ${lx - irisRx * 0.15} ${cy - irisRy * 0.7} A ${irisRx * 0.55} ${irisRy * 0.55} 0 1 1 ${lx - irisRx * 0.15} ${cy + irisRy * 0.7}" fill="${glowB}" opacity="0.85"/>`
    : `${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(irisRx * 0.35).toFixed(1)}" ry="${(irisRy * 0.55).toFixed(1)}" fill="${INK}"/>`;
  const pupilR = eclipse
    ? `${I4}<circle class="tm-aether-eclipse-pupil" cx="${rx}" cy="${cy}" r="${(irisRx * 0.85).toFixed(1)}" fill="${INK}"/>
${I4}<path class="tm-aether-eclipse-crescent" d="M ${rx + irisRx * 0.15} ${cy - irisRy * 0.7} A ${irisRx * 0.55} ${irisRy * 0.55} 0 1 0 ${rx + irisRx * 0.15} ${cy + irisRy * 0.7}" fill="${glowA}" opacity="0.75"/>`
    : `${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(irisRx * 0.35).toFixed(1)}" ry="${(irisRy * 0.55).toFixed(1)}" fill="${INK}"/>`;
  return `${I3}<g class="tm-mascot-eye-open tm-aether-eyes${eclipse ? ' tm-aether-eyes-eclipse' : ''}">
${glowEl}
${I4}<ellipse class="tm-aether-eye-sclera" cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.35" opacity="0.92"/>
${I4}<ellipse class="tm-aether-eye-sclera" cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.35" opacity="0.92"/>
${I4}<ellipse class="tm-aether-iris" cx="${lx}" cy="${cy}" rx="${irisRx.toFixed(1)}" ry="${irisRy.toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse class="tm-aether-iris" cx="${rx}" cy="${cy}" rx="${irisRx.toFixed(1)}" ry="${irisRy.toFixed(1)}" fill="${irisRef}"/>
${pupilL}
${pupilR}
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
    grad(`${p}-wing`, [['0%', pal.wing0, 0.75], ['25%', DEEP, 0.55], ['55%', pal.wing1, 0.8], ['100%', INK, 0.95]], 'linear', 'x1="15%" y1="10%" x2="90%" y2="90%"'),
    grad(`${p}-wing2`, [['0%', pal.a, 0.35], ['40%', pal.c, 0.45], ['100%', INK, 0.7]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-wingveil`, [['0%', pal.a, 0.22], ['50%', pal.c, 0.12], ['100%', INK, 0]], 'radial', 'cx="30%" cy="35%" r="70%"'),
    grad(`${p}-wingglow`, [['0%', pal.b, 0.35], ['55%', pal.a, 0.1], ['100%', DEEP, 0]], 'radial', 'cx="40%" cy="40%" r="60%"'),
    grad(`${p}-core`, [['0%', pal.pale], ['30%', pal.a], ['70%', pal.c], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, pal.iris, 'radial', 'cx="40%" cy="35%" r="65%"'),
    grad(`${p}-aura`, [['0%', pal.aura0, 0.12], ['28%', pal.aura1, 0.1], ['58%', pal.aura2, 0.05], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="52%" r="78%"'),
    grad(`${p}-aura2`, [['0%', pal.aura2, 0.08], ['35%', pal.aura0, 0.06], ['100%', pal.aura1, 0]], 'radial', 'cx="50%" cy="55%" r="72%"'),
    grad(`${p}-corona`, [['0%', pal.aura2, 0.1], ['45%', pal.aura0, 0.05], ['100%', pal.aura1, 0]], 'radial', 'cx="50%" cy="55%" r="70%"'),
    grad(`${p}-tail`, [['0%', pal.wing0], ['55%', pal.c], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-plate`, [['0%', '#3a2a55'], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-sigil`, [['0%', pal.b, 0.55], ['100%', pal.a, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-beam`, [['0%', pal.pale, 0.55], ['50%', pal.a, 0.22], ['100%', pal.c, 0]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\n');
}

/** Layered aura + addons. tier 1=baby … 6=old */
/** FX groups start hidden — JS randomly toggles .tm-fx-on as the pet ages. */
function fxGroup(name, inner, extraClass = '') {
  return `${I3}<g class="tm-aether-fx ${extraClass}" data-fx="${name}" opacity="0">
${inner}
${I3}</g>`;
}

/**
 * Progressive mythic addons — unlock by tier (baby=1 … old=6).
 * Young stages stay quiet; older ones unlock more aura types.
 */
function epicAddons(p, tier = 1, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  const PALE_L = pal.pale || PALE;
  const parts = [];

  // Sparks — tiny from baby, denser later
  const sparkCount = Math.min(2 + Math.max(0, tier - 1) * 2, 14);
  const sparks = [
    [12, 16], [88, 14], [6, 40], [94, 42], [18, 70], [82, 72],
    [28, 8], [72, 6], [4, 58], [96, 56], [40, 4], [60, 4],
    [22, 84], [78, 86],
  ].slice(0, sparkCount);
  const sparkSvg = sparks.map(([x, y], i) => {
    const fill = i % 3 === 0 ? GOLD : i % 3 === 1 ? CYAN : VIOLET;
    const r = i % 4 === 0 ? 1.8 : i % 2 ? 1.0 : 1.35;
    return `${I4}<circle class="tm-aether-spark" cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  }).join('\n');
  parts.push(fxGroup('sparks', sparkSvg));

  const auraR = 34 + tier * 4.2;

  // Soft inner corona — kid+
  if (tier >= 2) {
    parts.push(fxGroup('corona',
      `${I4}<ellipse class="tm-aether-corona" cx="50" cy="56" rx="${(auraR * 0.78).toFixed(1)}" ry="${(auraR * 0.62).toFixed(1)}" fill="url(#${p}-corona)"/>`));
  }

  // Soft body aura — kid+
  if (tier >= 2) {
    parts.push(fxGroup('aura',
      `${I4}<ellipse class="tm-aether-aura" cx="50" cy="54" rx="${auraR.toFixed(1)}" ry="${(auraR * 0.82).toFixed(1)}" fill="url(#${p}-aura)"/>`));
  }

  // Atmospheric haze / heat shimmer — teen+
  if (tier >= 3) {
    parts.push(fxGroup('haze',
      `${I4}<g class="tm-aether-haze">
${I4}<ellipse class="tm-aether-haze-blob" cx="50" cy="58" rx="${(auraR * 1.05).toFixed(1)}" ry="${(auraR * 0.9).toFixed(1)}" fill="url(#${p}-aura)" opacity="0.18"/>
${I4}<ellipse class="tm-aether-haze-blob" cx="42" cy="50" rx="${(auraR * 0.45).toFixed(1)}" ry="${(auraR * 0.7).toFixed(1)}" fill="${CYAN}" opacity="0.06"/>
${I4}<ellipse class="tm-aether-haze-blob" cx="58" cy="52" rx="${(auraR * 0.4).toFixed(1)}" ry="${(auraR * 0.65).toFixed(1)}" fill="${GOLD}" opacity="0.05"/>
${I4}</g>`));
  }

  // Outer aura bloom — adult+
  if (tier >= 4) {
    parts.push(fxGroup('aura-outer',
      `${I4}<ellipse class="tm-aether-aura-outer" cx="50" cy="56" rx="${(auraR * 1.32).toFixed(1)}" ry="${(auraR * 1.08).toFixed(1)}" fill="url(#${p}-aura2)"/>`));
  }

  // Energy beams — teen+
  if (tier >= 3) {
    let beams = `${I4}<path d="M 50 8 L 46 48 L 54 48 Z" fill="url(#${p}-beam)"/>
${I4}<path d="M 18 28 L 44 52 L 50 46 Z" fill="url(#${p}-beam)" opacity="0.7"/>
${I4}<path d="M 82 28 L 56 52 L 50 46 Z" fill="url(#${p}-beam)" opacity="0.7"/>`;
    if (tier >= 5) {
      beams += `
${I4}<path d="M 12 60 L 44 56 L 48 50 Z" fill="url(#${p}-beam)" opacity="0.55"/>
${I4}<path d="M 88 60 L 56 56 L 52 50 Z" fill="url(#${p}-beam)" opacity="0.55"/>`;
    }
    parts.push(fxGroup('beams', beams, 'tm-aether-beams'));
  }

  // Ground / foot sigil — teen+
  if (tier >= 3) {
    parts.push(fxGroup('sigil',
      `${I4}<ellipse class="tm-aether-sigil" cx="50" cy="94" rx="${14 + tier}" ry="${3 + tier * 0.3}" fill="url(#${p}-sigil)"/>
${I4}<ellipse class="tm-aether-sigil" cx="50" cy="94" rx="${10 + tier * 0.6}" ry="2.2" fill="none" stroke="${GOLD}" stroke-width="0.7"/>`));
  }

  // Ground fracture under older forms
  if (tier >= 4) {
    parts.push(fxGroup('fracture',
      `${I4}<g class="tm-aether-ground-fracture">
${I4}<path d="M 50 94 L 38 92 L 32 96" fill="none" stroke="${CYAN}" stroke-width="0.7" opacity="0.55"/>
${I4}<path d="M 50 94 L 62 91 L 70 96" fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.5"/>
${I4}<path d="M 44 95 L 40 98 L 48 97" fill="none" stroke="${VIOLET}" stroke-width="0.55" opacity="0.45"/>
${I4}<path d="M 56 95 L 64 98 L 58 97" fill="none" stroke="${CYAN}" stroke-width="0.55" opacity="0.4"/>
${tier >= 5 ? `${I4}<path d="M 50 94 L 50 99" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.5"/>
${I4}<path d="M 28 96 L 35 94" fill="none" stroke="${VIOLET}" stroke-width="0.5" opacity="0.35"/>
${I4}<path d="M 72 96 L 65 94" fill="none" stroke="${CYAN}" stroke-width="0.5" opacity="0.35"/>` : ''}
${I4}</g>`));
  }

  // Orbit rings — teen+ (more rings as it ages)
  if (tier >= 3) {
    const rings = [
      `${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${32 + tier * 2}" ry="${12 + tier}" fill="none" stroke="${CYAN}" stroke-width="1.15" stroke-dasharray="5 4"/>`,
    ];
    if (tier >= 4) {
      rings.push(`${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${26 + tier}" ry="${16 + tier * 0.6}" fill="none" stroke="${GOLD}" stroke-width="0.9" stroke-dasharray="3 5" transform="rotate(32 50 52)"/>`);
    }
    if (tier >= 5) {
      rings.push(`${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="${20 + tier}" ry="${20 + tier * 0.4}" fill="none" stroke="${VIOLET}" stroke-width="0.75" stroke-dasharray="2 4" transform="rotate(-24 50 52)"/>`);
      rings.push(`${I4}<circle class="tm-aether-orbit-node" cx="${50 + 32 + tier * 2}" cy="52" r="1.8" fill="${GOLD}"/>`);
      rings.push(`${I4}<circle class="tm-aether-orbit-node" cx="${50 - (26 + tier) * 0.7}" cy="${52 - (16 + tier * 0.6) * 0.55}" r="1.4" fill="${CYAN}"/>`);
    }
    if (tier >= 5) {
      rings.push(`${I4}<ellipse class="tm-aether-orbit tm-aether-orbit-broken" cx="50" cy="52" rx="${38 + tier}" ry="${10 + tier * 0.4}" fill="none" stroke="${PALE_L}" stroke-width="0.6" stroke-dasharray="6 22" transform="rotate(12 50 52)" opacity="0.55"/>`);
      rings.push(`${I4}<path class="tm-aether-orbit-scar" d="M 78 48 Q 86 40 90 52" fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.4"/>`);
    }
    parts.push(fxGroup('orbits', rings.join('\n'), 'tm-aether-orbit-group'));
  }

  // Rune circle — adult+
  if (tier >= 4) {
    parts.push(fxGroup('runes',
      `${I4}<circle class="tm-aether-rune-ring" cx="50" cy="54" r="${11 + tier}" fill="none" stroke="${GOLD}" stroke-width="0.7" stroke-dasharray="2 3"/>
${I4}<path d="M 50 ${(54 - 11 - tier).toFixed(1)} L ${(50 + 3).toFixed(1)} ${(54 - 6 - tier * 0.4).toFixed(1)}" stroke="${CYAN}" stroke-width="0.7"/>
${I4}<path d="M ${(50 + 11 + tier).toFixed(1)} 54 L ${(50 + 7 + tier * 0.4).toFixed(1)} ${(54 + 3).toFixed(1)}" stroke="${GOLD}" stroke-width="0.7"/>
${I4}<path d="M 50 ${(54 + 11 + tier).toFixed(1)} L ${(50 - 3).toFixed(1)} ${(54 + 6 + tier * 0.4).toFixed(1)}" stroke="${CYAN}" stroke-width="0.7"/>
${I4}<path d="M ${(50 - 11 - tier).toFixed(1)} 54 L ${(50 - 7 - tier * 0.4).toFixed(1)} ${(54 - 3).toFixed(1)}" stroke="${GOLD}" stroke-width="0.7"/>`,
      'tm-aether-runes'));
  }

  // Ribbons — adult+
  if (tier >= 4) {
    let ribbons = `${I4}<path class="tm-aether-ribbon" d="M 34 40 Q 18 30 10 48 Q 16 42 30 46" fill="none" stroke="${CYAN}" stroke-width="1.2"/>
${I4}<path class="tm-aether-ribbon" d="M 66 40 Q 82 30 90 48 Q 84 42 70 46" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`;
    if (tier >= 6) {
      ribbons += `
${I4}<path class="tm-aether-ribbon" d="M 40 72 Q 28 84 16 78" fill="none" stroke="${VIOLET}" stroke-width="1"/>
${I4}<path class="tm-aether-ribbon" d="M 60 72 Q 72 84 84 78" fill="none" stroke="${GOLD}" stroke-width="1"/>`;
    }
    parts.push(fxGroup('ribbons', ribbons, 'tm-aether-ribbons'));
  }

  // Glyph shards — middleage+
  if (tier >= 5) {
    let shards = `${I4}<path class="tm-aether-shard" d="M 16 44 L 12 38 L 20 40 Z" fill="${CYAN}"/>
${I4}<path class="tm-aether-shard" d="M 84 44 L 88 38 L 80 40 Z" fill="${GOLD}"/>
${I4}<path class="tm-aether-shard" d="M 24 68 L 18 64 L 26 62 Z" fill="${VIOLET}"/>
${I4}<path class="tm-aether-shard" d="M 76 68 L 82 64 L 74 62 Z" fill="${CYAN}"/>`;
    if (tier >= 6) {
      shards += `
${I4}<path class="tm-aether-shard" d="M 50 6 L 46 12 L 54 12 Z" fill="${GOLD}"/>
${I4}<path class="tm-aether-shard" d="M 8 52 L 4 48 L 10 46 Z" fill="${GOLD}"/>
${I4}<path class="tm-aether-shard" d="M 92 52 L 96 48 L 90 46 Z" fill="${CYAN}"/>`;
    }
    parts.push(fxGroup('shards', shards, 'tm-aether-shards'));
  }

  return parts.join('\n');
}

/** Legendary / mythical wing pairs — layered sails, veins, star tips. Side: -1 left, 1 right. */
function mythicWingPair(p, stroke, pal, stage) {
  const A = pal.a;
  const B = pal.b;
  const C = pal.c;
  const left = mythicWingSide(p, stroke, A, B, C, stage, -1);
  const right = mythicWingSide(p, stroke, A, B, C, stage, 1);
  // Ghost wing stack — mid/old only (layered ethereal afterimage)
  if (stage !== 'evo4' && stage !== 'evo5') return `${left}\n${right}`;
  const ghost = (side) => {
    const cls = side < 0 ? 'tm-aether-ghost-wing-left' : 'tm-aether-ghost-wing-right';
    const X = (x) => (side < 0 ? x : 100 - x);
    return `${I3}<g class="${cls}" opacity="0.28" transform="translate(${side < 0 ? -4 : 4} 3) scale(1.1)">
${I4}<path d="M ${X(32)} 48 L ${X(8)} 16 L ${X(-4)} 28 L ${X(2)} 52 L ${X(14)} 62 L ${X(28)} 52 Z" fill="url(#${p}-wingveil)" stroke="${side < 0 ? A : B}" stroke-width="0.6"/>
${I3}</g>`;
  };
  return `${ghost(-1)}\n${ghost(1)}\n${left}\n${right}`;
}

function runeTattoos(p, stroke, pal, tier = 3) {
  const A = pal.a;
  const B = pal.b;
  const C = pal.c;
  return `${I3}<g class="tm-aether-rune-tattoos" opacity="0.55">
${I4}<path class="tm-aether-rune-glyph" d="M 44 48 L 46 54 L 42 54 Z" fill="none" stroke="${A}" stroke-width="0.7"/>
${I4}<path class="tm-aether-rune-glyph" d="M 56 48 L 54 54 L 58 54 Z" fill="none" stroke="${B}" stroke-width="0.7"/>
${I4}<path class="tm-aether-rune-glyph" d="M 50 44 L 50 58" stroke="${C}" stroke-width="0.55"/>
${tier >= 4 ? `${I4}<circle class="tm-aether-rune-glyph" cx="46" cy="60" r="1.2" fill="none" stroke="${A}" stroke-width="0.5"/>
${I4}<circle class="tm-aether-rune-glyph" cx="54" cy="60" r="1.2" fill="none" stroke="${B}" stroke-width="0.5"/>` : ''}
${tier >= 5 ? `${I4}<path class="tm-aether-rune-glyph" d="M 42 52 Q 50 56 58 52" fill="none" stroke="${GOLD}" stroke-width="0.5"/>` : ''}
${I3}</g>`;
}

/** Stage-unique crown / core regalia — readable silhouette per evo */
function stageRegalia(p, stroke, pal, stage) {
  const A = pal.a;
  const B = pal.b;
  const C = pal.c;
  if (stage === 'baby') {
    return `${I3}<g class="tm-aether-regalia">
${I4}<circle cx="50" cy="42" r="3.2" fill="url(#${p}-core)" opacity="0.85"/>
${I4}<circle cx="50" cy="42" r="5.5" fill="none" stroke="${A}" stroke-width="0.55" opacity="0.45" stroke-dasharray="1.5 2"/>
${I3}</g>`;
  }
  if (stage === 'evo1') {
    return `${I3}<g class="tm-aether-regalia">
${I4}<path d="M 40 22 L 36 12 L 38 22" fill="${A}" opacity="0.55"/>
${I4}<path d="M 60 22 L 64 12 L 62 22" fill="${B}" opacity="0.55"/>
${I4}<path d="M 44 18 Q 50 12 56 18" fill="none" stroke="${B}" stroke-width="0.9" opacity="0.6"/>
${I3}</g>`;
  }
  if (stage === 'evo2') {
    return `${I3}<g class="tm-aether-regalia">
${I4}<path d="M 38 18 Q 28 4 36 0" fill="none" stroke="${A}" stroke-width="2.3" stroke-linecap="round"/>
${I4}<path d="M 62 18 Q 72 4 64 0" fill="none" stroke="${B}" stroke-width="2.3" stroke-linecap="round"/>
${I4}<path d="M 42 10 Q 50 4 58 10" fill="none" stroke="${C}" stroke-width="0.8" opacity="0.55"/>
${I4}<circle cx="36" cy="0" r="1.8" fill="${A}"/>
${I4}<circle cx="64" cy="0" r="1.8" fill="${B}"/>
${I3}</g>`;
  }
  if (stage === 'evo3') {
    return `${I3}<g class="tm-aether-regalia">
${I4}<ellipse class="tm-aether-halo" cx="50" cy="6" rx="15" ry="3.2" fill="none" stroke="${B}" stroke-width="1.35" opacity="0.8"/>
${I4}<g class="tm-aether-crown-constellation">
${I4}<circle class="tm-aether-crown-star" cx="42" cy="2" r="1.1" fill="${A}"/>
${I4}<circle class="tm-aether-crown-star" cx="50" cy="-2" r="1.4" fill="${B}"/>
${I4}<circle class="tm-aether-crown-star" cx="58" cy="2" r="1.1" fill="${A}"/>
${I4}<circle class="tm-aether-crown-star" cx="36" cy="8" r="0.8" fill="${C}"/>
${I4}<circle class="tm-aether-crown-star" cx="64" cy="8" r="0.8" fill="${C}"/>
${I4}<path d="M 42 2 L 50 -2 L 58 2" fill="none" stroke="${B}" stroke-width="0.45" opacity="0.55"/>
${I4}</g>
${I4}<path d="M 40 12 L 50 -2 L 60 12" fill="${DEEP}" stroke="${B}" stroke-width="1.15" opacity="0.85"/>
${I4}<path d="M 36 16 L 22 0" stroke="${A}" stroke-width="2.2" stroke-linecap="round"/>
${I4}<path d="M 64 16 L 78 0" stroke="${B}" stroke-width="2.2" stroke-linecap="round"/>
${I4}<circle cx="22" cy="0" r="1.9" fill="${A}"/>
${I4}<circle cx="78" cy="0" r="1.9" fill="${B}"/>
${I3}</g>`;
  }
  if (stage === 'evo4') {
    return `${I3}<g class="tm-aether-regalia">
${I4}<circle class="tm-aether-eclipse" cx="50" cy="20" r="17" fill="${INK}" opacity="0.5"/>
${I4}<circle class="tm-aether-eclipse" cx="50" cy="20" r="17" fill="none" stroke="${B}" stroke-width="1.5" opacity="0.6"/>
${I4}<circle class="tm-aether-eclipse" cx="55" cy="18" r="12" fill="url(#${p}-aura)" opacity="0.4"/>
${I4}<g class="tm-aether-crown-constellation">
${I4}<circle class="tm-aether-crown-star" cx="40" cy="4" r="1.1" fill="${B}"/>
${I4}<circle class="tm-aether-crown-star" cx="50" cy="-2" r="1.5" fill="${A}"/>
${I4}<circle class="tm-aether-crown-star" cx="60" cy="4" r="1.1" fill="${B}"/>
${I4}<circle class="tm-aether-crown-star" cx="34" cy="10" r="0.75" fill="${C}"/>
${I4}<circle class="tm-aether-crown-star" cx="66" cy="10" r="0.75" fill="${C}"/>
${I4}</g>
${I4}<path d="M 38 14 L 26 0" stroke="${B}" stroke-width="2.4" stroke-linecap="round"/>
${I4}<path d="M 62 14 L 78 2" stroke="${B}" stroke-width="2.1" stroke-linecap="round" opacity="0.75"/>
${I4}<path d="M 44 8 L 50 0 L 56 8" fill="${INK}" stroke="${B}" stroke-width="1"/>
${I4}<circle cx="26" cy="0" r="1.7" fill="${B}"/>
${I3}</g>`;
  }
  return `${I3}<g class="tm-aether-regalia">
${I4}<ellipse class="tm-aether-halo" cx="50" cy="12" rx="24" ry="5.5" fill="none" stroke="${B}" stroke-width="1.55" opacity="0.75"/>
${I4}<ellipse class="tm-aether-halo" cx="50" cy="12" rx="17" ry="3.8" fill="none" stroke="${A}" stroke-width="0.85" opacity="0.5"/>
${I4}<ellipse class="tm-aether-halo" cx="50" cy="12" rx="30" ry="7.5" fill="none" stroke="${C}" stroke-width="0.55" opacity="0.35" stroke-dasharray="3 4"/>
${I4}<g class="tm-aether-crown-constellation">
${I4}<circle class="tm-aether-crown-star" cx="38" cy="6" r="1.2" fill="${B}"/>
${I4}<circle class="tm-aether-crown-star" cx="50" cy="-2" r="1.6" fill="${A}"/>
${I4}<circle class="tm-aether-crown-star" cx="62" cy="6" r="1.2" fill="${B}"/>
${I4}<circle class="tm-aether-crown-star" cx="30" cy="12" r="0.9" fill="${C}"/>
${I4}<circle class="tm-aether-crown-star" cx="70" cy="12" r="0.9" fill="${C}"/>
${I4}<circle class="tm-aether-crown-star" cx="44" cy="2" r="0.7" fill="${pal.pale}"/>
${I4}<circle class="tm-aether-crown-star" cx="56" cy="2" r="0.7" fill="${pal.pale}"/>
${I4}</g>
${I4}<path d="M 38 10 L 26 -4" stroke="${B}" stroke-width="1.9" stroke-linecap="round" opacity="0.9"/>
${I4}<path d="M 62 10 L 78 -2" stroke="${B}" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 46 4 L 50 -6 L 54 4" fill="none" stroke="${A}" stroke-width="1.15"/>
${I4}<circle cx="26" cy="-4" r="1.8" fill="${B}" opacity="0.8"/>
${I4}<circle cx="78" cy="-2" r="1.4" fill="${A}" opacity="0.65"/>
${I3}</g>`;
}

function mythicWingSide(p, stroke, A, B, C, stage, side) {
  const cls = side < 0 ? 'tm-animate-wing-left' : 'tm-animate-wing-right';
  const tip = side < 0 ? A : B;
  const tip2 = side < 0 ? B : A;
  const X = (x) => (side < 0 ? x : 100 - x);
  const asym = (stage === 'evo4' || stage === 'evo5') ? (side < 0 ? 0.94 : 1.14) : 1;
  const wrapOpen = asym === 1
    ? `${I3}<g class="${cls}">`
    : `${I3}<g class="${cls}" transform="translate(50 52) scale(${asym.toFixed(2)}) translate(-50 -52)">`;

  const claw = (x, y, fill = tip) =>
    `${I4}<path class="tm-aether-wing-claw" d="M ${X(x)} ${y} L ${X(x - 3)} ${y - 5} L ${X(x + 1)} ${y - 2} Z" fill="${fill}" opacity="0.9"/>`;
  const vein = (d, color, delay = 0) =>
    `${I4}<path class="tm-aether-wing-vein" d="${d}" fill="none" stroke="${color}" stroke-width="0.9" stroke-linecap="round" style="animation-delay:${delay}s"/>`;
  const crack = (d, color, delay = 0.4) =>
    `${I4}<path class="tm-aether-wing-crack" d="${d}" fill="none" stroke="${color}" stroke-width="0.55" stroke-linecap="round" stroke-dasharray="1.8 1.4" style="animation-delay:${delay}s"/>`;

  // Dragon / void-blade wings — angular membranes, finger bones, pulsing cracks (not butterfly sails)
  if (stage === 'baby') {
    return `${wrapOpen}
${I4}<path d="M ${X(36)} 58 L ${X(20)} 46 L ${X(16)} 54 L ${X(22)} 64 L ${X(34)} 62 Z" class="tm-aether-wing-membrane" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M ${X(34)} 58 L ${X(24)} 52 L ${X(22)} 58 L ${X(28)} 62 Z" fill="url(#${p}-wing2)" opacity="0.65"/>
${vein(`M ${X(34)} 58 L ${X(22)} 50 L ${X(18)} 56`, tip, 0)}
${claw(16, 48, tip)}
${I3}</g>`;
  }

  if (stage === 'evo1') {
    return `${wrapOpen}
${I4}<path d="M ${X(34)} 52 L ${X(14)} 30 L ${X(4)} 36 L ${X(8)} 48 L ${X(2)} 56 L ${X(12)} 62 L ${X(24)} 60 L ${X(32)} 54 Z" class="tm-aether-wing-membrane" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<path d="M ${X(32)} 52 L ${X(16)} 38 L ${X(12)} 48 L ${X(18)} 56 L ${X(28)} 54 Z" fill="url(#${p}-wing2)" opacity="0.7"/>
${I4}<path d="M ${X(30)} 50 L ${X(18)} 36 L ${X(10)} 40" fill="none" stroke="${stroke}" stroke-width="1.05" opacity="0.55"/>
${I4}<path d="M ${X(28)} 54 L ${X(14)} 50 L ${X(8)} 54" fill="none" stroke="${stroke}" stroke-width="0.85" opacity="0.45"/>
${vein(`M ${X(32)} 50 L ${X(16)} 36 L ${X(6)} 38`, tip, 0)}
${vein(`M ${X(30)} 54 L ${X(16)} 52 L ${X(6)} 56`, tip2, 0.35)}
${crack(`M ${X(22)} 44 L ${X(18)} 50 L ${X(20)} 56`, C, 0.2)}
${claw(4, 34, tip)}
${claw(2, 54, tip2)}
${I3}</g>`;
  }

  if (stage === 'evo2') {
    return `${wrapOpen}
${I4}<path d="M ${X(32)} 48 L ${X(10)} 18 L ${X(-2)} 24 L ${X(2)} 40 L ${X(-6)} 50 L ${X(2)} 62 L ${X(14)} 66 L ${X(26)} 58 L ${X(30)} 50 Z" class="tm-aether-wing-membrane" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.25"/>
${I4}<path d="M ${X(28)} 48 L ${X(10)} 28 L ${X(4)} 40 L ${X(8)} 56 L ${X(22)} 56 Z" fill="url(#${p}-wing2)" opacity="0.72"/>
${I4}<path d="M ${X(30)} 46 L ${X(12)} 22 L ${X(2)} 28" fill="none" stroke="${stroke}" stroke-width="1.15" opacity="0.6"/>
${I4}<path d="M ${X(28)} 50 L ${X(12)} 42 L ${X(0)} 46" fill="none" stroke="${stroke}" stroke-width="0.95" opacity="0.5"/>
${I4}<path d="M ${X(26)} 56 L ${X(14)} 58 L ${X(4)} 62" fill="none" stroke="${stroke}" stroke-width="0.8" opacity="0.4"/>
${vein(`M ${X(30)} 46 L ${X(12)} 24 L ${X(0)} 26`, tip, 0)}
${vein(`M ${X(28)} 52 L ${X(10)} 46 L ${X(-2)} 50`, B, 0.4)}
${vein(`M ${X(26)} 56 L ${X(12)} 60 L ${X(4)} 64`, C, 0.7)}
${crack(`M ${X(18)} 36 L ${X(14)} 44 L ${X(18)} 52`, tip, 0.15)}
${crack(`M ${X(16)} 50 L ${X(10)} 54 L ${X(14)} 60`, C, 0.55)}
${claw(-2, 22, tip)}
${claw(-6, 48, tip2)}
${I3}</g>`;
  }

  if (stage === 'evo3') {
    return `${wrapOpen}
${I4}<path d="M ${X(30)} 46 L ${X(8)} 10 L ${X(-6)} 16 L ${X(-2)} 34 L ${X(-12)} 44 L ${X(-4)} 58 L ${X(-8)} 70 L ${X(8)} 72 L ${X(20)} 64 L ${X(28)} 52 Z" class="tm-aether-wing-membrane" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M ${X(28)} 48 L ${X(8)} 22 L ${X(0)} 36 L ${X(4)} 54 L ${X(18)} 58 L ${X(26)} 50 Z" fill="url(#${p}-wing2)" opacity="0.75"/>
${I4}<path d="M ${X(26)} 50 L ${X(12)} 36 L ${X(6)} 48 L ${X(12)} 58 L ${X(22)} 54 Z" fill="url(#${p}-wingveil)" opacity="0.45"/>
${I4}<path d="M ${X(28)} 44 L ${X(10)} 14 L ${X(-4)} 18" fill="none" stroke="${stroke}" stroke-width="1.2" opacity="0.65"/>
${I4}<path d="M ${X(26)} 48 L ${X(8)} 36 L ${X(-8)} 42" fill="none" stroke="${stroke}" stroke-width="1" opacity="0.55"/>
${I4}<path d="M ${X(24)} 54 L ${X(8)} 52 L ${X(-4)} 58" fill="none" stroke="${stroke}" stroke-width="0.9" opacity="0.45"/>
${I4}<path d="M ${X(22)} 60 L ${X(10)} 64 L ${X(0)} 70" fill="none" stroke="${stroke}" stroke-width="0.75" opacity="0.4"/>
${vein(`M ${X(28)} 44 L ${X(10)} 16 L ${X(-4)} 18`, tip, 0)}
${vein(`M ${X(26)} 50 L ${X(8)} 40 L ${X(-8)} 44`, B, 0.3)}
${vein(`M ${X(24)} 56 L ${X(8)} 56 L ${X(-4)} 62`, tip2, 0.6)}
${vein(`M ${X(22)} 60 L ${X(10)} 66 L ${X(0)} 70`, C, 0.9)}
${crack(`M ${X(16)} 28 L ${X(12)} 38 L ${X(16)} 46`, tip, 0.1)}
${crack(`M ${X(14)} 48 L ${X(6)} 52 L ${X(12)} 60`, C, 0.5)}
${crack(`M ${X(10)} 34 L ${X(4)} 42 L ${X(8)} 50`, B, 0.8)}
${claw(-6, 14, tip)}
${claw(-12, 42, tip2)}
${claw(-8, 68, C)}
${I3}</g>`;
  }

  if (stage === 'evo4') {
    return `${wrapOpen}
${I4}<path d="M ${X(32)} 48 L ${X(10)} 8 L ${X(-4)} 14 L ${X(2)} 30 L ${X(-10)} 38 L ${X(-2)} 50 L ${X(-12)} 58 L ${X(-2)} 70 L ${X(12)} 74 L ${X(24)} 64 L ${X(30)} 52 Z" class="tm-aether-wing-membrane" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M ${X(28)} 48 L ${X(10)} 22 L ${X(2)} 36 L ${X(6)} 54 L ${X(20)} 58 Z" fill="url(#${p}-wing2)" opacity="0.7"/>
${I4}<path d="M ${X(26)} 50 L ${X(14)} 40 L ${X(10)} 52 L ${X(18)} 56 Z" fill="url(#${p}-plate)" stroke="${stroke}" stroke-width="0.7" opacity="0.8"/>
${I4}<path d="M ${X(30)} 44 L ${X(12)} 12 L ${X(-2)} 16" fill="none" stroke="${stroke}" stroke-width="1.25" opacity="0.65"/>
${I4}<path d="M ${X(28)} 50 L ${X(10)} 38 L ${X(-8)} 42" fill="none" stroke="${stroke}" stroke-width="1.05" opacity="0.55"/>
${I4}<path d="M ${X(26)} 56 L ${X(10)} 56 L ${X(-8)} 62" fill="none" stroke="${stroke}" stroke-width="0.9" opacity="0.45"/>
${vein(`M ${X(30)} 44 L ${X(12)} 12 L ${X(-2)} 14`, tip, 0)}
${vein(`M ${X(28)} 50 L ${X(10)} 40 L ${X(-8)} 42`, B, 0.35)}
${vein(`M ${X(26)} 56 L ${X(8)} 58 L ${X(-6)} 64`, tip2, 0.7)}
${crack(`M ${X(18)} 24 L ${X(12)} 34 L ${X(18)} 44`, tip, 0.1)}
${crack(`M ${X(14)} 46 L ${X(4)} 50 L ${X(10)} 60`, C, 0.45)}
${crack(`M ${X(8)} 28 L ${X(0)} 36 L ${X(6)} 46`, B, 0.85)}
${claw(-4, 12, tip)}
${claw(-10, 36, tip2)}
${claw(-12, 56, B)}
${I3}</g>`;
  }

  // evo5 — vast tattered dragon wings
  return `${wrapOpen}
${I4}<path d="M ${X(32)} 44 L ${X(6)} 2 L ${X(-10)} 8 L ${X(-4)} 28 L ${X(-18)} 36 L ${X(-8)} 50 L ${X(-20)} 58 L ${X(-10)} 72 L ${X(-14)} 84 L ${X(6)} 82 L ${X(20)} 70 L ${X(28)} 54 L ${X(32)} 46 Z" class="tm-aether-wing-membrane" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.2" opacity="0.88"/>
${I4}<path d="M ${X(28)} 46 L ${X(4)} 14 L ${X(-6)} 30 L ${X(0)} 52 L ${X(14)} 60 L ${X(24)} 50 Z" fill="url(#${p}-wing2)" opacity="0.6"/>
${I4}<path d="M ${X(26)} 48 L ${X(10)} 28 L ${X(2)} 42 L ${X(8)} 56 L ${X(20)} 54 Z" fill="url(#${p}-wingveil)" opacity="0.4"/>
${I4}<path d="M ${X(30)} 42 L ${X(8)} 6 L ${X(-8)} 10" fill="none" stroke="${stroke}" stroke-width="1.25" opacity="0.65"/>
${I4}<path d="M ${X(28)} 48 L ${X(6)} 30 L ${X(-14)} 36" fill="none" stroke="${stroke}" stroke-width="1.1" opacity="0.55"/>
${I4}<path d="M ${X(26)} 54 L ${X(6)} 50 L ${X(-14)} 56" fill="none" stroke="${stroke}" stroke-width="0.95" opacity="0.45"/>
${I4}<path d="M ${X(24)} 60 L ${X(8)} 66 L ${X(-8)} 74" fill="none" stroke="${stroke}" stroke-width="0.8" opacity="0.4"/>
${vein(`M ${X(30)} 42 L ${X(8)} 6 L ${X(-8)} 10`, tip, 0)}
${vein(`M ${X(28)} 48 L ${X(6)} 32 L ${X(-14)} 36`, B, 0.25)}
${vein(`M ${X(26)} 54 L ${X(4)} 52 L ${X(-16)} 58`, tip2, 0.5)}
${vein(`M ${X(24)} 60 L ${X(6)} 68 L ${X(-10)} 78`, C, 0.75)}
${crack(`M ${X(16)} 18 L ${X(10)} 30 L ${X(16)} 40`, tip, 0.1)}
${crack(`M ${X(12)} 40 L ${X(2)} 46 L ${X(10)} 56`, C, 0.4)}
${crack(`M ${X(8)} 24 L ${X(-2)} 34 L ${X(4)} 44`, B, 0.7)}
${crack(`M ${X(6)} 58 L ${X(-4)} 64 L ${X(2)} 74`, tip2, 1.0)}
${claw(-10, 6, tip)}
${claw(-18, 34, tip2)}
${claw(-20, 56, B)}
${claw(-14, 82, C)}
${I3}</g>`;
}

/** BABY — Voidseed: floating orb chrysalis, stub fins, no real limbs yet */
function babyBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(18, 0.28)}
${epicAddons(p, 1, pal)}
${mythicWingPair(p, stroke, pal, 'baby')}
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
${stageRegalia(p, stroke, pal, 'baby')}
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
${mythicWingPair(p, stroke, pal, 'evo1')}
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
${I3}</g>
${stageRegalia(p, stroke, pal, 'evo1')}
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
${mythicWingPair(p, stroke, pal, 'evo2')}
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
${I3}</g>
${stageRegalia(p, stroke, pal, 'evo2')}
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
${mythicWingPair(p, stroke, pal, 'evo3')}
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
${runeTattoos(p, stroke, pal, 4)}
${I4}<!-- Head -->
${I4}<path d="M 38 24 Q 38 10 50 8 Q 62 10 62 24 Q 60 34 50 36 Q 40 34 38 24 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.55"/>
${I3}</g>
${stageRegalia(p, stroke, pal, 'evo3')}
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
${mythicWingPair(p, stroke, pal, 'evo4')}
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
${runeTattoos(p, stroke, pal, 5)}
${I4}<!-- Heavier head -->
${I4}<ellipse cx="50" cy="22" rx="13" ry="13.5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.55"/>
${I3}</g>
${stageRegalia(p, stroke, pal, 'evo4')}
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
${solemnEyes(41, 59, 20, 4.5, 5.8, `url(#${p}-iris)`, stroke, { slit: true, glow: true, glowA: CYAN, glowB: GOLD, sclera: pal.pale, eclipse: true })}
${solemnMouth(32, stroke, 5)}`;
}

/** OLD — Primordial Absolute: elongated ethereal, huge translucent wings, thin halo */
function oldBody(p, stroke, pal = STAGE_PALETTES.evo3) {
  const CYAN = pal.a;
  const GOLD = pal.b;
  const VIOLET = pal.c;
  return `${shadow(30, 0.3)}
${epicAddons(p, 6, pal)}
${mythicWingPair(p, stroke, pal, 'evo5')}
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
${runeTattoos(p, stroke, pal, 6)}
${I4}<!-- Elongated serene head -->
${I4}<ellipse cx="50" cy="18" rx="12" ry="13" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.45"/>
${I3}</g>
${stageRegalia(p, stroke, pal, 'evo5')}
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
${solemnEyes(41, 59, 16, 4.4, 5.8, `url(#${p}-iris)`, stroke, { slit: true, glow: true, glowA: CYAN, glowB: GOLD, sclera: pal.pale, eclipse: true })}
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
