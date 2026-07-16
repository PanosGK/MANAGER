/**
 * Moonfang Oracle — cat mascot SVG (dense cute epic v3).
 * Export for apply-cute-epic-svgs.mjs → myman_mascot.js
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};

function grad(id, stops, type = 'radial', attrs = 'cx="38%" cy="28%" r="75%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Dragon-style oversized shiny eyes (white sclera + iris + pupil + dual highlights) */
function shinyEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, { halfLidded = false, glow = '#fff' } = {}) {
  const lidL = halfLidded
    ? `${I4}<path d="M ${lx - rxE - 0.5} ${cy - 1} Q ${lx} ${cy - ryE * 0.55} ${lx + rxE + 0.5} ${cy - 1}" fill="${stroke}" opacity="0.72"/>
${I4}<path d="M ${rx - rxE - 0.5} ${cy - 1} Q ${rx} ${cy - ryE * 0.55} ${rx + rxE + 0.5} ${cy - 1}" fill="${stroke}" opacity="0.72"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#fff" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.5}" rx="${(rxE * 0.56).toFixed(1)}" ry="${(ryE * 0.58).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx + 0.6}" cy="${cy + 0.8}" rx="${(rxE * 0.28).toFixed(1)}" ry="${(ryE * 0.38).toFixed(1)}" fill="#0a0812"/>
${I4}<circle cx="${(lx + 1.6).toFixed(1)}" cy="${(cy - ryE * 0.32).toFixed(1)}" r="${Math.max(1.4, rxE * 0.32).toFixed(1)}" fill="${glow}" opacity="0.96"/>
${I4}<circle cx="${(lx - 0.8).toFixed(1)}" cy="${(cy + ryE * 0.28).toFixed(1)}" r="${Math.max(0.7, rxE * 0.14).toFixed(1)}" fill="${glow}" opacity="0.55"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#fff" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.5}" rx="${(rxE * 0.56).toFixed(1)}" ry="${(ryE * 0.58).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx + 0.6}" cy="${cy + 0.8}" rx="${(rxE * 0.28).toFixed(1)}" ry="${(ryE * 0.38).toFixed(1)}" fill="#0a0812"/>
${I4}<circle cx="${(rx + 1.6).toFixed(1)}" cy="${(cy - ryE * 0.32).toFixed(1)}" r="${Math.max(1.4, rxE * 0.32).toFixed(1)}" fill="${glow}" opacity="0.96"/>
${I4}<circle cx="${(rx - 0.8).toFixed(1)}" cy="${(cy + ryE * 0.28).toFixed(1)}" r="${Math.max(0.7, rxE * 0.14).toFixed(1)}" fill="${glow}" opacity="0.55"/>
${lidL}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3.5} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3.5} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 7) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 5.5} ${50 + span} ${y}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

function cheekBlush(id, cxL, cxR, cy, r = 4.5) {
  return `${I4}<circle cx="${cxL}" cy="${cy}" r="${r}" fill="url(#${id})"/>
${I4}<circle cx="${cxR}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

function whiskers(yBase, long = false) {
  const ext = long ? 16 : 12;
  const ext2 = long ? 14 : 12;
  return `${I4}<!-- Whiskers -->
${I4}<path d="M 40 ${yBase - 2} L ${40 - ext} ${yBase - 3} M 40 ${yBase} L ${40 - ext2} ${yBase} M 40 ${yBase + 2} L ${40 - ext + 2} ${yBase + 3}" stroke="#fff" stroke-width="0.75" opacity="0.6" stroke-linecap="round"/>
${I4}<path d="M 60 ${yBase - 2} L ${60 + ext} ${yBase - 3} M 60 ${yBase} L ${60 + ext2} ${yBase} M 60 ${yBase + 2} L ${60 + ext - 2} ${yBase + 3}" stroke="#fff" stroke-width="0.75" opacity="0.6" stroke-linecap="round"/>`;
}

function furTufts(stroke, opacity = 0.28) {
  return `${I4}<!-- Fur tufts -->
${I4}<circle cx="36" cy="58" r="1.5" fill="${stroke}" opacity="${opacity}"/>
${I4}<circle cx="64" cy="58" r="1.5" fill="${stroke}" opacity="${opacity}"/>
${I4}<circle cx="42" cy="72" r="1.2" fill="${stroke}" opacity="${opacity * 0.85}"/>
${I4}<circle cx="58" cy="72" r="1.2" fill="${stroke}" opacity="${opacity * 0.85}"/>
${I4}<path d="M 48 52 Q 50 54 52 52" stroke="${stroke}" stroke-width="0.9" fill="none" opacity="${opacity * 0.7}"/>
${I4}<path d="M 46 62 Q 48 64 50 62" stroke="${stroke}" stroke-width="0.8" fill="none" opacity="${opacity * 0.6}"/>`;
}

function toeBeans(cx, cy, scale = 1) {
  const s = scale;
  return `${I4}<ellipse cx="${cx}" cy="${cy + 1 * s}" rx="${4.5 * s}" ry="${2.8 * s}" fill="#f8bbd0" opacity="0.85"/>
${I4}<circle cx="${cx - 2 * s}" cy="${cy + 0.5 * s}" r="${1 * s}" fill="#ff6090" opacity="0.75"/>
${I4}<circle cx="${cx}" cy="${cy + 0.2 * s}" r="${1 * s}" fill="#ff6090" opacity="0.75"/>
${I4}<circle cx="${cx + 2 * s}" cy="${cy + 0.5 * s}" r="${1 * s}" fill="#ff6090" opacity="0.75"/>`;
}

function lunarEarFlare(p, stroke, mark, size = 'sm') {
  const flare = size === 'lg'
    ? { lx: 'M 26 34 Q 10 18 14 36 Q 18 48 30 42 Z', rx: 'M 74 34 Q 90 18 86 36 Q 82 48 70 42 Z' }
    : size === 'md'
      ? { lx: 'M 28 34 Q 16 20 18 34 Q 20 44 30 40 Z', rx: 'M 72 34 Q 84 20 82 34 Q 80 44 70 40 Z' }
      : { lx: 'M 30 36 Q 20 24 22 36 Q 24 42 32 40 Z', rx: 'M 70 36 Q 80 24 78 36 Q 76 42 68 40 Z' };
  return `${I3}<g class="tm-animate-wing-left">
${I4}<!-- Lunar ear-flare -->
${I4}<path d="${flare.lx}" fill="url(#${p}-flare)" stroke="${stroke}" stroke-width="1" opacity="0.88"/>
${I4}<path d="M 24 30 L 18 24" stroke="${mark}" stroke-width="0.9" opacity="0.55"/>
${I4}<circle cx="16" cy="26" r="1.2" fill="#fff" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="${flare.rx}" fill="url(#${p}-flare)" stroke="${stroke}" stroke-width="1" opacity="0.88"/>
${I4}<path d="M 76 30 L 82 24" stroke="${mark}" stroke-width="0.9" opacity="0.55"/>
${I4}<circle cx="84" cy="26" r="1.2" fill="#fff" opacity="0.45"/>
${I3}</g>`;
}

function tinyCrescent(mark, y = 28, tiny = true) {
  const sw = tiny ? 1.2 : 1.6;
  const r = tiny ? 0.9 : 1.3;
  return `${I4}<!-- Crescent mark -->
${I4}<path d="M 50 ${y} Q 46 ${y + 4} 50 ${y + 8} Q 54 ${y + 4} 50 ${y}" fill="none" stroke="${mark}" stroke-width="${sw}" opacity="0.85"/>
${I4}<circle cx="50" cy="${y + 4}" r="${r}" fill="${mark}" opacity="0.65"/>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- CAT ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-cat" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function catStage(stage) {
  const p = `cat-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'moon kitten', evo1: 'mystic cub', evo2: 'lunar stalker',
    evo3: 'Moonfang Oracle', evo4: 'scarred lucky', evo5: 'silver sage',
  };
  const mark = '#ff6090';
  const fur = stage === 'evo5'
    ? [['0%', '#f5f7fa'], ['35%', '#b0bec5'], ['70%', '#78909c'], ['100%', '#546e7a']]
    : stage === 'evo4'
      ? [['0%', '#d7ccc8'], ['40%', '#a1887f'], ['100%', '#6d4c41']]
      : [['0%', '#ffe0b2'], ['30%', '#ffb74d'], ['65%', '#f57c00'], ['100%', '#e65100']];
  const stroke = stage === 'evo5' ? '#607d8b' : stage === 'evo4' ? '#795548' : '#e65100';
  const irisGlow = stage === 'evo5' ? '#e0f7fa' : stage === 'evo2' || stage === 'evo3' ? '#b3e5fc' : '#fff';

  const defs = [
    grad(`${p}-fur`, fur),
    grad(`${p}-belly`, [['0%', '#fff8e1'], ['60%', '#ffe0b2'], ['100%', '#ffcc80']], 'radial', 'cx="50%" cy="35%" r="65%"'),
    grad(`${p}-iris`, [['0%', '#80d8ff'], ['45%', '#0288d1'], ['100%', '#01579b']], 'radial', 'cx="35%" cy="28%" r="68%"'),
    grad(`${p}-ear`, [['0%', '#f8bbd0'], ['100%', '#c2185b']], 'linear'),
    grad(`${p}-cheek`, [['0%', '#ff8a9b', 0.6], ['100%', '#ff8a9b', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-flare`, [['0%', '#e1f5fe', 0.75], ['50%', '#80deea', 0.45], ['100%', '#4dd0e1', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#b39ddb', 0.32], ['50%', '#7986cb', 0.18], ['100%', '#5c6bc0', 0]], 'radial', 'cx="50%" cy="45%" r="55%"'),
    grad(`${p}-pad-glow`, [['0%', '#80deea', 0.85], ['100%', '#80deea', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  // ── per-stage geometry ──
  const cfg = {
    baby: {
      bodyY: 70, bodyRx: 24, bodyRy: 21, headY: 36, headRx: 21, headRy: 19,
      earTip: 12, tail: 'M 64 72 Q 76 68 80 58 Q 82 50 76 52 Q 70 58 66 70 Z',
      eyeY: 34, eyeRx: 7.5, eyeRy: 9, mouthY: 48, shadowRx: 26,
      flareSize: 'sm', crescentTiny: true, toeScale: 1.1, halfLidded: false,
    },
    evo1: {
      bodyY: 66, bodyRx: 23, bodyRy: 20, headY: 34, headRx: 19, headRy: 17,
      earTip: 8, tail: 'M 68 68 Q 86 58 92 42 Q 94 32 86 34 Q 74 46 68 66 Z',
      eyeY: 32, eyeRx: 7, eyeRy: 8.2, mouthY: 46, shadowRx: 28,
      flareSize: 'md', crescentTiny: true, toeScale: 1, halfLidded: false,
    },
    evo2: {
      bodyY: 64, bodyRx: 20, bodyRy: 17, headY: 32, headRx: 17, headRy: 15,
      earTip: 6, tail: 'M 70 66 Q 90 52 94 36 Q 96 26 88 28 Q 78 40 70 64 Z',
      eyeY: 30, eyeRx: 6.2, eyeRy: 7.2, mouthY: 44, shadowRx: 26,
      flareSize: 'md', crescentTiny: false, toeScale: 0.95, halfLidded: false,
    },
    evo3: {
      bodyY: 62, bodyRx: 22, bodyRy: 19, headY: 28, headRx: 18, headRy: 16,
      earTip: 4, tail: 'M 72 64 Q 94 48 98 28 Q 100 16 90 18 Q 80 32 72 62 Z',
      eyeY: 26, eyeRx: 6.8, eyeRy: 7.8, mouthY: 42, shadowRx: 32,
      flareSize: 'lg', crescentTiny: false, toeScale: 1, halfLidded: false,
    },
    evo4: {
      bodyY: 64, bodyRx: 21, bodyRy: 18, headY: 32, headRx: 17, headRy: 15,
      earTip: 7, tail: 'M 68 68 Q 84 56 88 40 Q 90 30 82 32 Q 72 48 68 66 Z',
      eyeY: 30, eyeRx: 6.5, eyeRy: 7.5, mouthY: 44, shadowRx: 27,
      flareSize: 'md', crescentTiny: false, toeScale: 1, halfLidded: false,
    },
    evo5: {
      bodyY: 66, bodyRx: 20, bodyRy: 17, headY: 30, headRx: 17, headRy: 15,
      earTip: 5, tail: 'M 66 72 Q 82 78 86 66 Q 88 58 80 60 Q 72 66 66 72 Z',
      eyeY: 28, eyeRx: 7.2, eyeRy: 8, mouthY: 42, shadowRx: 28,
      flareSize: 'md', crescentTiny: false, toeScale: 0.95, halfLidded: true,
    },
  }[stage];

  const c = cfg;
  const legY = stage === 'evo3' ? 84 : 86;
  const armY = stage === 'baby' ? 64 : 62;

  let extras = '';
  let aura = '';
  let tailExtra = '';
  let bodyExtra = '';
  let headExtra = '';

  if (stage === 'evo1') {
    tailExtra = `${I4}<circle cx="88" cy="36" r="2" fill="#fff" opacity="0.75"/>
${I4}<path d="M 84 44 L 86 40 L 88 44 L 86 48 Z" fill="#fff59d" opacity="0.7"/>
${I4}<circle cx="78" cy="50" r="1.3" fill="#fff" opacity="0.55"/>
${I4}<circle cx="62" cy="54" r="1.1" fill="#ffe082" opacity="0.5"/>`;
    bodyExtra = `${I4}<!-- Sparkle dots -->
${I4}<circle cx="38" cy="56" r="1.4" fill="#fff" opacity="0.7"/>
${I4}<path d="M 58 52 L 59 50 L 60 52 L 59 54 Z" fill="#fff59d" opacity="0.75"/>
${I4}<circle cx="44" cy="68" r="1.2" fill="#fff" opacity="0.55"/>
${I4}<circle cx="56" cy="70" r="1.1" fill="#ffe082" opacity="0.5"/>`;
    headExtra = `${I4}<!-- Bigger ears -->
${I4}<path d="M 32 ${c.headY - 4} L 26 ${c.earTip} L 40 ${c.headY - 8} Z" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 32 ${c.headY - 5} L 28 ${c.earTip + 4} L 36 ${c.headY - 7} Z" fill="url(#${p}-ear)" opacity="0.9"/>
${I4}<path d="M 68 ${c.headY - 4} L 74 ${c.earTip} L 60 ${c.headY - 8} Z" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 68 ${c.headY - 5} L 72 ${c.earTip + 4} L 64 ${c.headY - 7} Z" fill="url(#${p}-ear)" opacity="0.9"/>`;
  } else if (stage === 'evo2') {
    tailExtra = `${I4}<ellipse cx="92" cy="30" rx="3.5" ry="4.5" fill="${mark}" opacity="0.4"/>
${I4}<path d="M 80 48 Q 88 42 90 34" stroke="#e1f5fe" stroke-width="0.9" fill="none" opacity="0.5"/>`;
    bodyExtra = `${I4}<!-- Sleek stripe accents -->
${I4}<path d="M 38 58 Q 50 60 62 58" stroke="${stroke}" stroke-width="0.8" fill="none" opacity="0.25"/>
${I4}<path d="M 40 64 Q 50 66 60 64" stroke="${stroke}" stroke-width="0.7" fill="none" opacity="0.2"/>`;
  } else if (stage === 'evo3') {
    aura = `${I3}<ellipse cx="50" cy="50" rx="42" ry="40" fill="url(#${p}-aura)"/>
${I3}<circle cx="28" cy="38" r="1.8" fill="#b39ddb" opacity="0.45"/>
${I3}<circle cx="72" cy="42" r="1.5" fill="#7986cb" opacity="0.4"/>
${I3}<circle cx="50" cy="18" r="1.6" fill="#fff" opacity="0.35"/>`;
    tailExtra = `${I4}<!-- Flowing tail wisps -->
${I4}<path d="M 88 22 Q 96 18 98 26" stroke="#e1f5fe" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 84 32 Q 92 28 94 36" stroke="#b39ddb" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<ellipse cx="94" cy="24" rx="3" ry="4" fill="${mark}" opacity="0.35"/>`;
    bodyExtra = `${I4}<!-- Crescent collar -->
${I4}<path d="M 36 52 Q 50 58 64 52" fill="none" stroke="${mark}" stroke-width="1.8" opacity="0.75"/>
${I4}<path d="M 48 56 L 50 60 L 52 56 Z" fill="${mark}" opacity="0.55"/>
${I4}<circle cx="50" cy="57" r="2.2" fill="#7986cb" opacity="0.45"/>
${I4}<circle cx="50" cy="57" r="1" fill="#fff" opacity="0.5"/>
${I4}<!-- Heroic chest fur -->
${I4}<path d="M 44 58 Q 50 62 56 58" stroke="#ffe0b2" stroke-width="1" fill="none" opacity="0.55"/>`;
  } else if (stage === 'evo4') {
    bodyExtra = `${I4}<!-- Lucky bell -->
${I4}<path d="M 46 54 L 48 58 L 52 58 L 54 54 Q 50 52 46 54 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="0.9"/>
${I4}<circle cx="50" cy="59" r="1.4" fill="#f9a825"/>
${I4}<path d="M 49 59 L 50 61 L 51 59" stroke="#fff" stroke-width="0.5" fill="none"/>
${I4}<!-- Coin charm -->
${I4}<circle cx="58" cy="56" r="3" fill="#ffca28" stroke="#f57f17" stroke-width="0.8"/>
${I4}<rect x="57" y="55" width="2" height="2" rx="0.3" fill="#fff8e1" opacity="0.7"/>
${I4}<!-- Scar charm -->
${I4}<path d="M 56 36 L 58 38 L 57 40" stroke="#bcaaa4" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.75"/>
${I4}<circle cx="57" cy="39" r="0.8" fill="#ff6090" opacity="0.45"/>`;
  } else if (stage === 'evo5') {
    aura = `${I3}<ellipse cx="50" cy="50" rx="40" ry="38" fill="url(#${p}-aura)" opacity="0.55"/>`;
    headExtra = `${I4}<!-- Moon halo -->
${I4}<ellipse cx="50" cy="14" rx="16" ry="3.5" fill="none" stroke="#eceff1" stroke-width="1.4" opacity="0.65"/>
${I4}<circle cx="34" cy="14" r="2" fill="#cfd8dc" opacity="0.55"/>
${I4}<circle cx="50" cy="12" r="2.5" fill="#fff" opacity="0.7"/>
${I4}<circle cx="66" cy="14" r="2" fill="#cfd8dc" opacity="0.55"/>
${I4}<!-- Sage chest ruff -->
${I4}<path d="M 42 48 Q 38 56 42 62 Q 46 58 44 52 Z" fill="#eceff1" stroke="#b0bec5" stroke-width="0.7" opacity="0.75"/>
${I4}<path d="M 58 48 Q 62 56 58 62 Q 54 58 56 52 Z" fill="#eceff1" stroke="#b0bec5" stroke-width="0.7" opacity="0.75"/>`;
    bodyExtra = `${I4}<!-- Weathered tufts -->
${I4}<path d="M 38 60 Q 36 64 38 68" stroke="#78909c" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<path d="M 62 60 Q 64 64 62 68" stroke="#78909c" stroke-width="0.8" fill="none" opacity="0.4"/>`;
  }

  const defaultEars = stage === 'evo1' ? '' : `${I4}<!-- Ears -->
${I4}<path d="M 34 ${c.headY - 2} L 28 ${c.earTip + 6} L 42 ${c.headY - 6} Z" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<path d="M 34 ${c.headY - 3} L 30 ${c.earTip + 10} L 38 ${c.headY - 5} Z" fill="url(#${p}-ear)" opacity="0.88"/>
${I4}<path d="M 66 ${c.headY - 2} L 72 ${c.earTip + 6} L 58 ${c.headY - 6} Z" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<path d="M 66 ${c.headY - 3} L 70 ${c.earTip + 10} L 62 ${c.headY - 5} Z" fill="url(#${p}-ear)" opacity="0.88"/>`;

  const padGlow = stage === 'evo2' ? `${I4}<ellipse cx="40" cy="88" rx="6" ry="3" fill="url(#${p}-pad-glow)" opacity="0.65"/>
${I4}<ellipse cx="60" cy="88" rx="6" ry="3" fill="url(#${p}-pad-glow)" opacity="0.65"/>` : '';

  const body = `${I3}<ellipse cx="50" cy="94" rx="${c.shadowRx}" ry="4.5" fill="#1a1a1a" opacity="0.22"/>
${aura}
${I3}<g class="tm-animate-tail">
${I4}<path d="${c.tail.replace(/^M /, 'M ')}" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 74 58 Q 82 50 84 44" stroke="#fff3e0" stroke-width="0.85" fill="none" opacity="0.4"/>
${tailExtra}
${I3}</g>
${lunarEarFlare(p, stroke, mark, c.flareSize)}
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="${c.bodyY}" rx="${c.bodyRx}" ry="${c.bodyRy}" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="${stage === 'evo3' ? 2 : 1.6}"/>
${I4}<ellipse cx="50" cy="${c.bodyY + 4}" rx="${c.bodyRx - 8}" ry="${c.bodyRy - 7}" fill="url(#${p}-belly)"/>
${I4}<path d="M ${50 - c.bodyRx + 8} ${c.bodyY - 2} Q 50 ${c.bodyY} ${50 + c.bodyRx - 8} ${c.bodyY - 2}" stroke="#ffe0b2" stroke-width="0.9" fill="none" opacity="0.55"/>
${bodyExtra}
${I4}<!-- Head -->
${I4}<ellipse cx="50" cy="${c.headY}" rx="${c.headRx}" ry="${c.headRy}" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="${stage === 'evo3' ? 2 : 1.6}"/>
${I4}<ellipse cx="${50 - c.headRx + 8}" cy="${c.headY - 6}" rx="7" ry="4" fill="#fff" opacity="0.18"/>
${defaultEars}
${headExtra}
${tinyCrescent(mark, c.headY - 8, c.crescentTiny)}
${I4}<!-- Muzzle -->
${I4}<ellipse cx="50" cy="${c.headY + 8}" rx="9" ry="5.5" fill="url(#${p}-belly)"/>
${I4}<ellipse cx="47" cy="${c.headY + 8}" rx="1.3" ry="1" fill="#5d4037"/>
${I4}<ellipse cx="53" cy="${c.headY + 8}" rx="1.3" ry="1" fill="#5d4037"/>
${cheekBlush(`${p}-cheek`, 34, 66, c.headY + 6, stage === 'baby' ? 5 : 4.2)}
${whiskers(c.headY + 6, stage === 'evo5')}
${furTufts(stroke, stage === 'evo4' ? 0.2 : 0.28)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="28" cy="${armY}" rx="6.5" ry="9.5" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2" transform="rotate(-22 28 ${armY})"/>
${I4}<ellipse cx="24" cy="${armY + 10}" rx="5.5" ry="4.5" fill="url(#${p}-belly)" stroke="${stroke}" stroke-width="0.9"/>
${stage === 'baby' || stage === 'evo1' ? toeBeans(24, armY + 10, c.toeScale) : `${I4}<circle cx="22" cy="${armY + 10}" r="1.1" fill="${mark}" opacity="0.55"/>
${I4}<circle cx="25" cy="${armY + 12}" r="1.1" fill="${mark}" opacity="0.55"/>
${I4}<circle cx="27" cy="${armY + 9}" r="1.1" fill="${mark}" opacity="0.55"/>`}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="72" cy="${armY}" rx="6.5" ry="9.5" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2" transform="rotate(22 72 ${armY})"/>
${I4}<ellipse cx="76" cy="${armY + 10}" rx="5.5" ry="4.5" fill="url(#${p}-belly)" stroke="${stroke}" stroke-width="0.9"/>
${stage === 'baby' || stage === 'evo1' ? toeBeans(76, armY + 10, c.toeScale) : `${I4}<circle cx="74" cy="${armY + 10}" r="1.1" fill="${mark}" opacity="0.55"/>
${I4}<circle cx="77" cy="${armY + 12}" r="1.1" fill="${mark}" opacity="0.55"/>
${I4}<circle cx="78" cy="${armY + 9}" r="1.1" fill="${mark}" opacity="0.55"/>`}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${padGlow}
${I4}<ellipse cx="40" cy="${legY}" rx="7.5" ry="5.5" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="40" cy="${legY + 2}" rx="5.5" ry="3" fill="url(#${p}-belly)"/>
${stage === 'baby' || stage === 'evo1' ? toeBeans(40, legY + 1, c.toeScale) : stage === 'evo2' ? `${I4}<ellipse cx="40" cy="${legY + 2}" rx="4" ry="2.2" fill="#80deea" opacity="0.55"/>
${I4}<circle cx="37" cy="${legY + 1}" r="1" fill="#4dd0e1" opacity="0.7"/>
${I4}<circle cx="40" cy="${legY}" r="1" fill="#4dd0e1" opacity="0.7"/>
${I4}<circle cx="43" cy="${legY + 1}" r="1" fill="#4dd0e1" opacity="0.7"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="${legY}" rx="7.5" ry="5.5" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="60" cy="${legY + 2}" rx="5.5" ry="3" fill="url(#${p}-belly)"/>
${stage === 'baby' || stage === 'evo1' ? toeBeans(60, legY + 1, c.toeScale) : stage === 'evo2' ? `${I4}<ellipse cx="60" cy="${legY + 2}" rx="4" ry="2.2" fill="#80deea" opacity="0.55"/>
${I4}<circle cx="57" cy="${legY + 1}" r="1" fill="#4dd0e1" opacity="0.7"/>
${I4}<circle cx="60" cy="${legY}" r="1" fill="#4dd0e1" opacity="0.7"/>
${I4}<circle cx="63" cy="${legY + 1}" r="1" fill="#4dd0e1" opacity="0.7"/>` : ''}
${I3}</g>
${shinyEyes(41, 59, c.eyeY, c.eyeRx, c.eyeRy, `url(#${p}-iris)`, stroke, { halfLidded: c.halfLidded, glow: irisGlow })}
${mouths(c.mouthY, stroke, stage === 'baby' ? 6 : 7)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

const header = `${I}<!-- CAT CHARACTER - All Life Stages (dense cute epic v3) -->
${I}<!-- Fate & Shadow • Rare Rarity • Moonfang Oracle -->
${I}<!-- ═══════════════════════════════════════ -->`;

export const catSvg = `${header}

${STAGES.map(catStage).join('\n')}
`;
