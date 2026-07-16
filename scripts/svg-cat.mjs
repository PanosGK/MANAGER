/**
 * Moonfang Oracle — cat mascot SVG (dense cute epic v4 · feline boss)
 * Distinct from dragon/phoenix: triangular ears, slit pupils, pink nose,
 * whiskers, fluffy S-tail, midnight lunar palette (not orange fire).
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

function grad(id, stops, type = 'radial', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = attrs
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="0%" y2="100%"' : 'cx="38%" cy="28%" r="75%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Almond cat eyes with vertical slit pupils (boss look on adult+) */
function catEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, {
  slit = false, halfLidded = false, glow = '#e8f5ff',
} = {}) {
  const irisRx = (rxE * 0.52).toFixed(1);
  const irisRy = (ryE * 0.72).toFixed(1);
  const slitW = Math.max(0.9, rxE * (slit ? 0.14 : 0.22)).toFixed(1);
  const slitH = (ryE * (slit ? 0.62 : 0.42)).toFixed(1);
  const lidL = halfLidded
    ? `${I4}<path d="M ${lx - rxE - 0.4} ${cy - 0.5} Q ${lx} ${cy - ryE * 0.7} ${lx + rxE + 0.4} ${cy - 0.5}" fill="${stroke}" opacity="0.78"/>
${I4}<path d="M ${rx - rxE - 0.4} ${cy - 0.5} Q ${rx} ${cy - ryE * 0.7} ${rx + rxE + 0.4} ${cy - 0.5}" fill="${stroke}" opacity="0.78"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#f8fbff" stroke="${stroke}" stroke-width="1.45"/>
${I4}<ellipse cx="${lx + 0.3}" cy="${cy + 0.4}" rx="${irisRx}" ry="${irisRy}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx + 0.35}" cy="${cy + 0.5}" rx="${slitW}" ry="${slitH}" fill="#0a0614"/>
${I4}<circle cx="${(lx + 1.4).toFixed(1)}" cy="${(cy - ryE * 0.28).toFixed(1)}" r="${Math.max(1.2, rxE * 0.28).toFixed(1)}" fill="${glow}" opacity="0.95"/>
${I4}<circle cx="${(lx - 0.9).toFixed(1)}" cy="${(cy + ryE * 0.3).toFixed(1)}" r="${Math.max(0.55, rxE * 0.12).toFixed(1)}" fill="${glow}" opacity="0.5"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#f8fbff" stroke="${stroke}" stroke-width="1.45"/>
${I4}<ellipse cx="${rx + 0.3}" cy="${cy + 0.4}" rx="${irisRx}" ry="${irisRy}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx + 0.35}" cy="${cy + 0.5}" rx="${slitW}" ry="${slitH}" fill="#0a0614"/>
${I4}<circle cx="${(rx + 1.4).toFixed(1)}" cy="${(cy - ryE * 0.28).toFixed(1)}" r="${Math.max(1.2, rxE * 0.28).toFixed(1)}" fill="${glow}" opacity="0.95"/>
${I4}<circle cx="${(rx - 0.9).toFixed(1)}" cy="${(cy + ryE * 0.3).toFixed(1)}" r="${Math.max(0.55, rxE * 0.12).toFixed(1)}" fill="${glow}" opacity="0.5"/>
${lidL}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3.2} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3.2} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.3" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Classic cat mouth (:3) — happy / sad path hooks */
function catMouths(y, stroke, span = 6) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q ${50 - span / 2} ${y + 4.5} 50 ${y + 1.5} Q ${50 + span / 2} ${y + 4.5} ${50 + span} ${y}" stroke="${stroke}" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 3} Q 50 ${y - 2.5} ${50 + span} ${y + 3}" stroke="${stroke}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
}

function pinkNose(cx, cy, scale = 1) {
  const s = scale;
  return `${I4}<path d="M ${cx} ${cy - 1.2 * s} L ${cx - 2.4 * s} ${cy + 1.6 * s} L ${cx + 2.4 * s} ${cy + 1.6 * s} Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
${I4}<ellipse cx="${cx}" cy="${cy + 0.2 * s}" rx="${0.7 * s}" ry="${0.45 * s}" fill="#fff" opacity="0.45"/>`;
}

function cheekBlush(id, cxL, cxR, cy, r = 4.2) {
  return `${I4}<circle cx="${cxL}" cy="${cy}" r="${r}" fill="url(#${id})"/>
${I4}<circle cx="${cxR}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

function whiskers(yBase, long = false, stroke = '#e8eaf6') {
  const ext = long ? 17 : 13;
  const ext2 = long ? 15 : 12;
  return `${I4}<!-- Whiskers -->
${I4}<path d="M 41 ${yBase - 2} L ${41 - ext} ${yBase - 4} M 41 ${yBase} L ${41 - ext2} ${yBase} M 41 ${yBase + 2} L ${41 - ext + 1} ${yBase + 4}" stroke="${stroke}" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
${I4}<path d="M 59 ${yBase - 2} L ${59 + ext} ${yBase - 4} M 59 ${yBase} L ${59 + ext2} ${yBase} M 59 ${yBase + 2} L ${59 + ext - 1} ${yBase + 4}" stroke="${stroke}" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>`;
}

function toeBeans(cx, cy, scale = 1) {
  const s = scale;
  return `${I4}<ellipse cx="${cx}" cy="${cy + 1.1 * s}" rx="${4.2 * s}" ry="${2.6 * s}" fill="#f8bbd0" opacity="0.9"/>
${I4}<circle cx="${cx - 2.1 * s}" cy="${cy + 0.3 * s}" r="${0.95 * s}" fill="#ff6090" opacity="0.8"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${0.95 * s}" fill="#ff6090" opacity="0.8"/>
${I4}<circle cx="${cx + 2.1 * s}" cy="${cy + 0.3 * s}" r="${0.95 * s}" fill="#ff6090" opacity="0.8"/>`;
}

/** Big triangular cat ears (signature feline silhouette) */
function catEars(p, stroke, headY, tipY, size = 'md') {
  const spread = size === 'lg' ? 10 : size === 'sm' ? 6 : 8;
  const tipLift = size === 'lg' ? tipY - 2 : tipY;
  return `${I4}<!-- Cat ears -->
${I4}<path d="M ${34 - spread * 0.1} ${headY - 2} L ${26 - spread * 0.15} ${tipLift} L ${42} ${headY - 7} Z" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.35"/>
${I4}<path d="M ${34} ${headY - 3} L ${29 - spread * 0.1} ${tipLift + 6} L ${38} ${headY - 5.5} Z" fill="url(#${p}-ear)" opacity="0.92"/>
${I4}<path d="M ${66 + spread * 0.1} ${headY - 2} L ${74 + spread * 0.15} ${tipLift} L ${58} ${headY - 7} Z" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.35"/>
${I4}<path d="M ${66} ${headY - 3} L ${71 + spread * 0.1} ${tipLift + 6} L ${62} ${headY - 5.5} Z" fill="url(#${p}-ear)" opacity="0.92"/>`;
}

function moonCrest(accent, y = 10, boss = false) {
  if (!boss) {
    return `${I4}<!-- Tiny moon mark -->
${I4}<path d="M 50 ${y} A 4 4 0 1 1 50 ${y + 7.5} A 3.2 3.2 0 1 0 50 ${y}" fill="${accent}" opacity="0.85"/>`;
  }
  return `${I4}<!-- Boss moon crown -->
${I4}<path d="M 36 ${y + 6} Q 50 ${y - 2} 64 ${y + 6}" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.85"/>
${I4}<path d="M 50 ${y - 1} A 5.5 5.5 0 1 1 50 ${y + 9} A 4.2 4.2 0 1 0 50 ${y - 1}" fill="#fffde7" opacity="0.9"/>
${I4}<circle cx="38" cy="${y + 5}" r="1.6" fill="#fff" opacity="0.7"/>
${I4}<circle cx="62" cy="${y + 5}" r="1.6" fill="#fff" opacity="0.7"/>
${I4}<circle cx="50" cy="${y - 4}" r="1.3" fill="${accent}" opacity="0.75"/>`;
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
    baby: 'moon kitten',
    evo1: 'shadow cub',
    evo2: 'omen stalker',
    evo3: 'Moonfang Oracle',
    evo4: 'scarred omen lord',
    evo5: 'silver moon sage',
  };

  // Midnight lunar palette — NOT dragon/phoenix orange
  const fur = stage === 'evo5'
    ? [['0%', '#eceff1'], ['35%', '#b0bec5'], ['70%', '#78909c'], ['100%', '#455a64']]
    : stage === 'evo4'
      ? [['0%', '#5c6bc0'], ['30%', '#3949ab'], ['65%', '#283593'], ['100%', '#1a237e']]
      : stage === 'evo3'
        ? [['0%', '#7e57c2'], ['25%', '#5e35b1'], ['55%', '#311b92'], ['85%', '#1a0a2e'], ['100%', '#0d0221']]
        : stage === 'evo2'
          ? [['0%', '#9575cd'], ['40%', '#5e35b1'], ['100%', '#311b92']]
          : stage === 'evo1'
            ? [['0%', '#b39ddb'], ['40%', '#7e57c2'], ['100%', '#4527a0']]
            : [['0%', '#ce93d8'], ['35%', '#ab47bc'], ['70%', '#7b1fa2'], ['100%', '#4a148c']];

  const stroke = stage === 'evo5' ? '#546e7a'
    : stage === 'evo4' ? '#1a237e'
      : stage === 'evo3' ? '#12002b'
        : stage === 'evo2' ? '#311b92'
          : '#4a148c';

  const accent = stage === 'evo5' ? '#b3e5fc'
    : stage === 'evo4' ? '#ffd54f'
      : '#f48fb1';

  const irisStops = stage === 'evo5'
    ? [['0%', '#e0f7fa'], ['50%', '#4dd0e1'], ['100%', '#006064']]
    : stage === 'evo3' || stage === 'evo4'
      ? [['0%', '#fff59d'], ['40%', '#ffd54f'], ['100%', '#f57f17']]
      : [['0%', '#e1bee7'], ['45%', '#ce93d8'], ['100%', '#6a1b9a']];

  const defs = [
    grad(`${p}-fur`, fur),
    grad(`${p}-belly`, [['0%', '#f3e5f5'], ['55%', '#e1bee7'], ['100%', '#ce93d8']], 'radial', 'cx="50%" cy="35%" r="65%"'),
    grad(`${p}-iris`, irisStops, 'radial', 'cx="35%" cy="28%" r="68%"'),
    grad(`${p}-ear`, [['0%', '#f8bbd0'], ['100%', '#ad1457']], 'linear'),
    grad(`${p}-cheek`, [['0%', '#f48fb1', 0.55], ['100%', '#f48fb1', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#b39ddb', 0.38], ['45%', '#7e57c2', 0.2], ['100%', '#311b92', 0]], 'radial', 'cx="50%" cy="45%" r="55%"'),
    grad(`${p}-mane`, [['0%', '#e1bee7', 0.7], ['50%', '#7e57c2', 0.35], ['100%', '#311b92', 0]], 'radial', 'cx="50%" cy="40%" r="55%"'),
    grad(`${p}-tail-tip`, [['0%', '#fff'], ['60%', accent], ['100%', accent]], 'radial', 'cx="50%" cy="40%" r="55%"'),
  ].join('\n');

  const cfg = {
    baby: {
      bodyY: 68, bodyRx: 22, bodyRy: 20, headY: 34, headRx: 20, headRy: 18,
      earTip: 8, earSize: 'sm', tuft: 'sm',
      tail: 'M 62 70 Q 78 62 84 48 Q 88 38 80 40 Q 70 52 64 68 Z',
      eyeY: 32, eyeRx: 7.2, eyeRy: 8.8, mouthY: 46, shadowRx: 24,
      noseY: 42, slit: false, halfLidded: false, toeScale: 1.05, boss: false,
    },
    evo1: {
      bodyY: 66, bodyRx: 21, bodyRy: 19, headY: 32, headRx: 18.5, headRy: 16.5,
      earTip: 4, earSize: 'md', tuft: 'sm',
      tail: 'M 66 68 Q 86 56 92 40 Q 96 28 86 30 Q 74 44 68 66 Z',
      eyeY: 30, eyeRx: 6.8, eyeRy: 8.2, mouthY: 44, shadowRx: 26,
      noseY: 40, slit: false, halfLidded: false, toeScale: 1, boss: false,
    },
    evo2: {
      bodyY: 64, bodyRx: 19, bodyRy: 17, headY: 30, headRx: 17, headRy: 15,
      earTip: 2, earSize: 'md', tuft: 'md',
      tail: 'M 68 66 Q 90 50 96 32 Q 100 20 90 22 Q 78 36 70 64 Z',
      eyeY: 28, eyeRx: 6.4, eyeRy: 7.6, mouthY: 42, shadowRx: 25,
      noseY: 38, slit: true, halfLidded: false, toeScale: 0.95, boss: false,
    },
    evo3: {
      bodyY: 62, bodyRx: 21, bodyRy: 18, headY: 26, headRx: 18, headRy: 16,
      earTip: 2, earSize: 'lg', tuft: 'lg',
      tail: 'M 70 64 Q 94 46 100 24 Q 104 10 92 12 Q 80 28 72 62 Z',
      eyeY: 24, eyeRx: 7, eyeRy: 8.4, mouthY: 40, shadowRx: 30,
      noseY: 36, slit: true, halfLidded: false, toeScale: 1, boss: true,
    },
    evo4: {
      bodyY: 64, bodyRx: 20, bodyRy: 17.5, headY: 30, headRx: 17, headRy: 15,
      earTip: 4, earSize: 'md', tuft: 'md',
      tail: 'M 68 68 Q 88 54 94 36 Q 98 24 88 26 Q 76 42 70 66 Z',
      eyeY: 28, eyeRx: 6.6, eyeRy: 7.8, mouthY: 42, shadowRx: 27,
      noseY: 38, slit: true, halfLidded: false, toeScale: 1, boss: true,
    },
    evo5: {
      bodyY: 66, bodyRx: 19.5, bodyRy: 17, headY: 28, headRx: 17, headRy: 15.5,
      earTip: 2, earSize: 'md', tuft: 'md',
      tail: 'M 64 72 Q 80 80 88 68 Q 94 56 84 58 Q 72 66 66 72 Z',
      eyeY: 26, eyeRx: 7, eyeRy: 8.2, mouthY: 40, shadowRx: 26,
      noseY: 36, slit: true, halfLidded: true, toeScale: 0.95, boss: true,
    },
  }[stage];

  const c = cfg;
  const legY = stage === 'evo3' ? 84 : 86;
  const armY = stage === 'baby' ? 62 : 60;

  let aura = '';
  let tailExtra = '';
  let bodyExtra = '';
  let headExtra = '';
  let mane = '';

  if (stage === 'evo1') {
    tailExtra = `${I4}<ellipse cx="90" cy="34" rx="4" ry="5" fill="url(#${p}-tail-tip)" opacity="0.85"/>
${I4}<circle cx="86" cy="42" r="1.2" fill="#fff" opacity="0.55"/>`;
    bodyExtra = `${I4}<!-- Soft spots -->
${I4}<ellipse cx="40" cy="60" rx="3.5" ry="2.5" fill="${accent}" opacity="0.25"/>
${I4}<ellipse cx="58" cy="66" rx="2.8" ry="2" fill="${accent}" opacity="0.22"/>`;
  } else if (stage === 'evo2') {
    tailExtra = `${I4}<ellipse cx="94" cy="26" rx="5" ry="6.5" fill="url(#${p}-tail-tip)" opacity="0.9"/>
${I4}<path d="M 82 44 Q 90 36 94 28" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.45"/>`;
    bodyExtra = `${I4}<!-- Tabby stripes -->
${I4}<path d="M 38 56 Q 50 58 62 56" stroke="${stroke}" stroke-width="1.1" fill="none" opacity="0.28"/>
${I4}<path d="M 40 62 Q 50 64 60 62" stroke="${stroke}" stroke-width="0.95" fill="none" opacity="0.22"/>
${I4}<path d="M 42 68 Q 50 69.5 58 68" stroke="${stroke}" stroke-width="0.85" fill="none" opacity="0.18"/>`;
  } else if (stage === 'evo3') {
    aura = `${I3}<ellipse cx="50" cy="48" rx="44" ry="42" fill="url(#${p}-aura)"/>
${I3}<circle cx="22" cy="30" r="1.6" fill="#fff" opacity="0.4"/>
${I3}<circle cx="78" cy="26" r="1.3" fill="#fff" opacity="0.35"/>
${I3}<circle cx="18" cy="52" r="1.1" fill="#f48fb1" opacity="0.35"/>
${I3}<circle cx="82" cy="54" r="1.2" fill="#ffd54f" opacity="0.3"/>`;
    mane = `${I4}<!-- Boss lunar mane -->
${I4}<ellipse cx="50" cy="48" rx="26" ry="14" fill="url(#${p}-mane)" opacity="0.55"/>
${I4}<path d="M 28 44 Q 22 52 28 60" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="0.9" opacity="0.85"/>
${I4}<path d="M 72 44 Q 78 52 72 60" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="0.9" opacity="0.85"/>`;
    tailExtra = `${I4}<!-- Fluffy boss tail tip -->
${I4}<ellipse cx="96" cy="18" rx="7" ry="9" fill="url(#${p}-tail-tip)" opacity="0.95"/>
${I4}<path d="M 90 28 Q 98 22 100 30" stroke="#fff" stroke-width="1" fill="none" opacity="0.45"/>
${I4}<circle cx="98" cy="14" r="1.5" fill="#fff" opacity="0.65"/>`;
    bodyExtra = `${I4}<!-- Crescent collar amulet -->
${I4}<path d="M 34 50 Q 50 58 66 50" fill="none" stroke="#ffd54f" stroke-width="2" opacity="0.9"/>
${I4}<path d="M 50 54 A 5 5 0 1 1 50 62 A 3.8 3.8 0 1 0 50 54" fill="#fffde7" stroke="#f9a825" stroke-width="0.8"/>
${I4}<circle cx="50" cy="58" r="1.4" fill="#f48fb1" opacity="0.8"/>
${I4}<!-- Constellation chest marks -->
${I4}<circle cx="42" cy="58" r="1.1" fill="#fff" opacity="0.55"/>
${I4}<circle cx="50" cy="64" r="1.3" fill="#fff" opacity="0.5"/>
${I4}<circle cx="58" cy="58" r="1.1" fill="#fff" opacity="0.55"/>
${I4}<path d="M 42 58 L 50 64 L 58 58" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.45"/>`;
    headExtra = moonCrest(accent, 8, true);
  } else if (stage === 'evo4') {
    aura = `${I3}<ellipse cx="50" cy="50" rx="40" ry="38" fill="url(#${p}-aura)" opacity="0.7"/>`;
    tailExtra = `${I4}<ellipse cx="92" cy="30" rx="5.5" ry="7" fill="url(#${p}-tail-tip)" opacity="0.85"/>`;
    bodyExtra = `${I4}<!-- Battle scars + lucky bell -->
${I4}<path d="M 54 34 L 58 38 L 56 42" stroke="#90a4ae" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.75"/>
${I4}<path d="M 36 56 Q 50 62 64 56" fill="none" stroke="#ffd54f" stroke-width="1.5" opacity="0.8"/>
${I4}<path d="M 46 54 L 48 58 L 52 58 L 54 54 Q 50 52 46 54 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="0.8"/>
${I4}<circle cx="50" cy="59" r="1.3" fill="#f57f17"/>`;
    headExtra = `${I4}<!-- Worn crescent -->
${I4}<path d="M 50 10 A 4.5 4.5 0 1 1 50 18 A 3.4 3.4 0 1 0 50 10" fill="#ffd54f" opacity="0.75"/>`;
  } else if (stage === 'evo5') {
    aura = `${I3}<ellipse cx="50" cy="48" rx="40" ry="38" fill="url(#${p}-aura)" opacity="0.5"/>`;
    headExtra = `${I4}<!-- Silver moon halo -->
${I4}<ellipse cx="50" cy="12" rx="18" ry="3.8" fill="none" stroke="#eceff1" stroke-width="1.5" opacity="0.7"/>
${I4}<path d="M 50 6 A 5 5 0 1 1 50 15 A 3.8 3.8 0 1 0 50 6" fill="#fff" opacity="0.85"/>
${I4}<!-- Sage cheek ruff -->
${I4}<path d="M 32 36 Q 26 44 32 52 Q 36 46 34 40 Z" fill="#eceff1" stroke="#90a4ae" stroke-width="0.7" opacity="0.8"/>
${I4}<path d="M 68 36 Q 74 44 68 52 Q 64 46 66 40 Z" fill="#eceff1" stroke="#90a4ae" stroke-width="0.7" opacity="0.8"/>`;
    bodyExtra = `${I4}<!-- Silver collar -->
${I4}<path d="M 36 50 Q 50 56 64 50" fill="none" stroke="#cfd8dc" stroke-width="1.8" opacity="0.85"/>
${I4}<circle cx="50" cy="54" r="2.4" fill="#eceff1" stroke="#90a4ae" stroke-width="0.7"/>`;
    tailExtra = `${I4}<ellipse cx="84" cy="62" rx="5" ry="6" fill="#eceff1" opacity="0.75"/>`;
  } else {
    // baby
    headExtra = moonCrest(accent, 18, false);
    tailExtra = `${I4}<ellipse cx="80" cy="46" rx="3.5" ry="4.5" fill="url(#${p}-tail-tip)" opacity="0.8"/>`;
  }

  // Simpler ear tufts without fragile path mirroring
  const tufts = `${I3}<g class="tm-animate-wing-left">
${I4}<!-- Left ear tuft -->
${I4}<path d="M 24 ${c.earTip + 10} Q 14 ${c.earTip} 16 ${c.earTip + 14}" stroke="${accent}" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
${I4}<path d="M 22 ${c.earTip + 8} L 12 ${c.earTip - 2}" stroke="${stroke}" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
${I4}<circle cx="13" cy="${c.earTip}" r="1.35" fill="#fff" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<!-- Right ear tuft -->
${I4}<path d="M 76 ${c.earTip + 10} Q 86 ${c.earTip} 84 ${c.earTip + 14}" stroke="${accent}" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
${I4}<path d="M 78 ${c.earTip + 8} L 88 ${c.earTip - 2}" stroke="${stroke}" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
${I4}<circle cx="87" cy="${c.earTip}" r="1.35" fill="#fff" opacity="0.55"/>
${I3}</g>`;

  const glow = stage === 'evo5' ? '#e0f7fa' : stage === 'evo3' || stage === 'evo4' ? '#fffde7' : '#f3e5f5';

  const body = `${I3}<ellipse cx="50" cy="94" rx="${c.shadowRx}" ry="4.5" fill="#0a0614" opacity="0.28"/>
${aura}
${I3}<g class="tm-animate-tail">
${I4}<path d="${c.tail}" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.45"/>
${I4}<path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
${tailExtra}
${I3}</g>
${tufts}
${I3}<g class="tm-animate-body">
${mane}
${I4}<ellipse cx="50" cy="${c.bodyY}" rx="${c.bodyRx}" ry="${c.bodyRy}" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="${c.boss ? 2 : 1.55}"/>
${I4}<ellipse cx="50" cy="${c.bodyY + 3}" rx="${(c.bodyRx - 7).toFixed(1)}" ry="${(c.bodyRy - 6).toFixed(1)}" fill="url(#${p}-belly)"/>
${bodyExtra}
${I4}<!-- Round cat head -->
${I4}<ellipse cx="50" cy="${c.headY}" rx="${c.headRx}" ry="${c.headRy}" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="${c.boss ? 2 : 1.55}"/>
${I4}<ellipse cx="${(50 - c.headRx + 7).toFixed(1)}" cy="${c.headY - 5}" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
${catEars(p, stroke, c.headY, c.earTip, c.earSize)}
${headExtra}
${I4}<!-- Muzzle -->
${I4}<ellipse cx="50" cy="${c.headY + 8}" rx="8.5" ry="5.2" fill="url(#${p}-belly)"/>
${pinkNose(50, c.noseY, stage === 'baby' ? 1.05 : 1)}
${cheekBlush(`${p}-cheek`, 33, 67, c.headY + 5, stage === 'baby' ? 5 : 4)}
${whiskers(c.headY + 7, stage === 'evo5' || stage === 'evo3', stage === 'evo5' ? '#eceff1' : '#e8eaf6')}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="27" cy="${armY}" rx="6.2" ry="9.2" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2" transform="rotate(-24 27 ${armY})"/>
${I4}<ellipse cx="23" cy="${armY + 10}" rx="5.4" ry="4.4" fill="url(#${p}-belly)" stroke="${stroke}" stroke-width="0.9"/>
${toeBeans(23, armY + 10, c.toeScale)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="73" cy="${armY}" rx="6.2" ry="9.2" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2" transform="rotate(24 73 ${armY})"/>
${I4}<ellipse cx="77" cy="${armY + 10}" rx="5.4" ry="4.4" fill="url(#${p}-belly)" stroke="${stroke}" stroke-width="0.9"/>
${toeBeans(77, armY + 10, c.toeScale)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="39" cy="${legY}" rx="7.2" ry="5.4" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="39" cy="${legY + 2}" rx="5.2" ry="2.8" fill="url(#${p}-belly)"/>
${toeBeans(39, legY + 1, c.toeScale)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="61" cy="${legY}" rx="7.2" ry="5.4" fill="url(#${p}-fur)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="61" cy="${legY + 2}" rx="5.2" ry="2.8" fill="url(#${p}-belly)"/>
${toeBeans(61, legY + 1, c.toeScale)}
${I3}</g>
${catEyes(40, 60, c.eyeY, c.eyeRx, c.eyeRy, `url(#${p}-iris)`, stroke, {
    slit: c.slit, halfLidded: c.halfLidded, glow,
  })}
${catMouths(c.mouthY, stroke, stage === 'baby' ? 5.5 : 6.2)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

const header = `${I}<!-- CAT CHARACTER - All Life Stages (dense cute epic v4 · feline boss) -->
${I}<!-- Fate & Shadow • Rare Rarity • Moonfang Oracle -->
${I}<!-- ═══════════════════════════════════════ -->`;

export const catSvg = `${header}

${STAGES.map(catStage).join('\n')}
`;
