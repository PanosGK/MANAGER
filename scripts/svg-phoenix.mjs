/**
 * Ashborn Phoenix — dense cute epic v4 · BOSS MYTHICAL
 * Huge angry beautiful firebird for boss-battle presence.
 * Export for apply scripts → myman_mascot.js
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
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="100%" y2="100%"' : 'cx="40%" cy="30%" r="75%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Fierce phoenix eyes — glowing gold/crimson, angled angry brows */
function fierceEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, {
  angry = false, sclera = '#fff8e1', glow = '#fffde7',
} = {}) {
  const brow = angry
    ? `${I4}<path d="M ${lx - rxE - 1} ${cy - ryE - 1.5} Q ${lx} ${cy - ryE - 4.5} ${lx + rxE + 0.5} ${cy - ryE + 0.5}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx + rxE + 1} ${cy - ryE - 1.5} Q ${rx} ${cy - ryE - 4.5} ${rx - rxE - 0.5} ${cy - ryE + 0.5}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${lx - rxE} ${cy - ryE - 0.2} Q ${lx} ${cy - ryE - 2.2} ${lx + rxE} ${cy - ryE + 1}" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
${I4}<path d="M ${rx + rxE} ${cy - ryE - 0.2} Q ${rx} ${cy - ryE - 2.2} ${rx - rxE} ${cy - ryE + 1}" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${brow}
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="${lx + 0.4}" cy="${cy + 0.3}" rx="${(rxE * 0.58).toFixed(1)}" ry="${(ryE * 0.62).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx + 0.4}" cy="${cy + 0.3}" rx="${(rxE * 0.58).toFixed(1)}" ry="${(ryE * 0.62).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.6}" rx="${(rxE * 0.26).toFixed(1)}" ry="${(ryE * 0.4).toFixed(1)}" fill="#1a0500"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.6}" rx="${(rxE * 0.26).toFixed(1)}" ry="${(ryE * 0.4).toFixed(1)}" fill="#1a0500"/>
${I4}<circle cx="${(lx + 1.5).toFixed(1)}" cy="${(cy - ryE * 0.32).toFixed(1)}" r="${Math.max(1.3, rxE * 0.3).toFixed(1)}" fill="${glow}" opacity="0.95"/>
${I4}<circle cx="${(rx + 1.5).toFixed(1)}" cy="${(cy - ryE * 0.32).toFixed(1)}" r="${Math.max(1.3, rxE * 0.3).toFixed(1)}" fill="${glow}" opacity="0.95"/>
${I4}<circle cx="${(lx - rxE * 0.3).toFixed(1)}" cy="${(cy + ryE * 0.28).toFixed(1)}" r="${Math.max(0.7, rxE * 0.14).toFixed(1)}" fill="#ffab40" opacity="0.7"/>
${I4}<circle cx="${(rx - rxE * 0.3).toFixed(1)}" cy="${(cy + ryE * 0.28).toFixed(1)}" r="${Math.max(0.7, rxE * 0.14).toFixed(1)}" fill="#ffab40" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3.2} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3.2} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Predatory hooked beak — happy / open-rage sad swap */
function hookedBeak(y, stroke, fill = '#ff6d00', size = 1) {
  const s = size;
  const tip = (4.5 * s).toFixed(1);
  const depth = (7 * s).toFixed(1);
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - tip} ${y} L 50 ${y + Number(depth)} L ${50 + tip} ${y} Q 50 ${y + 2.5 * s} ${50 - tip} ${y}" fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linejoin="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - tip - 1} ${y + 1} L 50 ${y + Number(depth) + 1.5} L ${50 + tip + 1} ${y + 1} Q 50 ${y - 1} ${50 - tip - 1} ${y + 1}" fill="${fill}" stroke="${stroke}" stroke-width="1.7" stroke-linejoin="round"/>
${I4}<path d="M 50 ${y + 1} L 50 ${y + Number(depth) - 1}" stroke="#bf360c" stroke-width="0.7" opacity="0.45"/>`;
}

function shadow(rx = 30, opacity = 0.28) {
  return `${I3}<ellipse cx="50" cy="96" rx="${rx}" ry="5.5" fill="#1a0500" opacity="${opacity}"/>`;
}

function emberSparks(count = 6) {
  const pts = [
    [18, 28], [82, 24], [12, 48], [88, 50], [22, 70], [78, 72],
    [8, 38], [92, 40], [30, 18], [70, 16], [16, 62], [84, 64],
  ].slice(0, count);
  return pts.map(([x, y], i) =>
    `${I3}<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 1.8 : 1.2}" fill="${i % 2 ? '#fff59d' : '#ff6d00'}" opacity="${0.35 + (i % 4) * 0.1}"/>`
  ).join('\n');
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- PHOENIX ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-phoenix" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function phoenixStage(stage) {
  const p = `phoenix-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'ember hatchling',
    evo1: 'wrath fledgling',
    evo2: 'solar ravager',
    evo3: 'Ashborn Phoenix — BOSS',
    evo4: 'crimson ash tyrant',
    evo5: 'immortal sun god',
  };

  const plumage = stage === 'evo5'
    ? [['0%', '#fffde7'], ['20%', '#fff59d'], ['45%', '#ffd54f'], ['70%', '#ff8a65'], ['100%', '#ff6d00']]
    : stage === 'evo4'
      ? [['0%', '#ff8a65'], ['20%', '#e64a19'], ['45%', '#bf360c'], ['70%', '#4e342e'], ['100%', '#1a0a00']]
      : stage === 'evo3'
        ? [['0%', '#fff59d'], ['18%', '#ffea00'], ['40%', '#ff6d00'], ['65%', '#dd2c00'], ['100%', '#4a0000']]
        : stage === 'evo2'
          ? [['0%', '#fff176'], ['30%', '#ff9100'], ['60%', '#e64a19'], ['100%', '#bf360c']]
          : stage === 'evo1'
            ? [['0%', '#fff59d'], ['40%', '#ff9800'], ['100%', '#ef6c00']]
            : [['0%', '#fff9c4'], ['40%', '#ffb74d'], ['100%', '#ff7043']];

  const stroke = stage === 'evo5' ? '#ff6f00'
    : stage === 'evo4' ? '#3e2723'
      : stage === 'evo3' ? '#3d0000'
        : '#bf360c';
  const accent = stage === 'evo5' ? '#fff59d' : stage === 'evo4' ? '#ffab40' : '#ffea00';
  const flame = stage === 'evo5' ? '#ffcc80' : stage === 'evo4' ? '#ff5722' : '#ff3d00';
  const boss = stage === 'evo3' || stage === 'evo4' || stage === 'evo5';
  const angry = stage !== 'baby';

  const defs = [
    grad(`${p}-body`, plumage, 'radial', 'cx="36%" cy="26%" r="80%"'),
    grad(`${p}-belly`, [['0%', '#fffde7'], ['50%', '#ffe082'], ['100%', '#ffab40']], 'radial', 'cx="50%" cy="35%" r="65%"'),
    grad(`${p}-wing`, [['0%', '#fffde7', 0.98], ['25%', accent, 0.95], ['55%', '#ff6d00', 0.92], ['85%', flame, 0.88], ['100%', '#bf360c', 0.8]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-wing2`, [['0%', '#ffea00', 0.9], ['50%', '#ff3d00', 0.85], ['100%', '#7f0000', 0.75]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['25%', '#fff59d'], ['55%', '#ff6d00'], ['100%', '#ff3d00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, stage === 'evo5'
      ? [['0%', '#fffde7'], ['40%', '#ffd54f'], ['100%', '#e65100']]
      : [['0%', '#fff59d'], ['35%', '#ff9100'], ['70%', '#dd2c00'], ['100%', '#4a0000']], 'radial', 'cx="35%" cy="28%" r="68%"'),
    grad(`${p}-cheek`, [['0%', '#ff8a80', 0.55], ['100%', '#ff8a80', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#fff59d', boss ? 0.55 : 0.35], ['40%', '#ff6d00', 0.28], ['100%', '#bf360c', 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    grad(`${p}-corona`, [['0%', '#fffde7', 0.5], ['35%', '#ffea00', 0.3], ['100%', '#ff3d00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-tail`, [['0%', '#fffde7'], ['30%', accent], ['60%', '#ff6d00'], ['100%', '#7f0000']], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    ...(stage === 'evo4' ? [grad(`${p}-ash`, [['0%', '#90a4ae', 0.65], ['100%', '#37474f', 0.25]], 'radial', 'cx="50%" cy="50%" r="50%')] : []),
  ].join('\n');

  // Shared geometry knobs
  const cfg = {
    baby: {
      shadowRx: 26, auraR: 38, bodyY: 66, bodyRx: 23, bodyRy: 19, headY: 36, headRx: 18, headRy: 16,
      eyeY: 34, eyeRx: 7, eyeRy: 8.5, beakY: 46, beakSize: 0.9, sparks: 5, crest: 'sm', wings: 'sm',
    },
    evo1: {
      shadowRx: 30, auraR: 42, bodyY: 64, bodyRx: 22, bodyRy: 18, headY: 34, headRx: 16.5, headRy: 14.5,
      eyeY: 32, eyeRx: 6.5, eyeRy: 7.8, beakY: 44, beakSize: 1, sparks: 7, crest: 'md', wings: 'md',
    },
    evo2: {
      shadowRx: 34, auraR: 46, bodyY: 62, bodyRx: 23, bodyRy: 19, headY: 30, headRx: 17, headRy: 15,
      eyeY: 28, eyeRx: 6.8, eyeRy: 8, beakY: 42, beakSize: 1.1, sparks: 9, crest: 'lg', wings: 'lg',
    },
    evo3: {
      shadowRx: 38, auraR: 50, bodyY: 60, bodyRx: 25, bodyRy: 21, headY: 26, headRx: 19, headRy: 17,
      eyeY: 24, eyeRx: 7.5, eyeRy: 8.8, beakY: 40, beakSize: 1.25, sparks: 12, crest: 'boss', wings: 'boss',
    },
    evo4: {
      shadowRx: 36, auraR: 46, bodyY: 62, bodyRx: 24, bodyRy: 20, headY: 28, headRx: 18, headRy: 16,
      eyeY: 26, eyeRx: 7, eyeRy: 8.2, beakY: 42, beakSize: 1.15, sparks: 10, crest: 'lg', wings: 'lg',
    },
    evo5: {
      shadowRx: 40, auraR: 52, bodyY: 58, bodyRx: 24, bodyRy: 20, headY: 24, headRx: 18.5, headRy: 16.5,
      eyeY: 22, eyeRx: 7.2, eyeRy: 8.5, beakY: 38, beakSize: 1.2, sparks: 12, crest: 'divine', wings: 'boss',
    },
  }[stage];

  const c = cfg;

  // ── Wings (huge for boss) ──
  let wings;
  if (c.wings === 'boss') {
    wings = `${I3}<g class="tm-animate-wing-left">
${I4}<!-- Outer flame wing -->
${I4}<path d="M 30 48 Q -6 8 -8 40 Q -4 72 16 68 Q 26 58 32 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2.2"/>
${I4}<path d="M 26 50 Q 2 22 0 46 Q 2 66 18 62 Q 24 56 28 52 Z" fill="url(#${p}-wing2)" opacity="0.85" stroke="${flame}" stroke-width="1.1"/>
${I4}<path d="M 8 28 Q 0 36 4 52" stroke="${accent}" stroke-width="1.3" fill="none" opacity="0.7"/>
${I4}<path d="M 4 36 Q -2 42 2 56" stroke="#ff8a65" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 2 46 Q -4 50 0 62" stroke="#ff3d00" stroke-width="0.95" fill="none" opacity="0.5"/>
${I4}<path d="M 12 54 Q 18 60 24 64" stroke="#fff59d" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<path d="M -2 22 L -8 12" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
${I4}<path d="M 4 18 L 0 8" stroke="${flame}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 10 16 L 8 6" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<circle cx="-4" cy="30" r="2" fill="#fffde7" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 Q 106 8 108 40 Q 104 72 84 68 Q 74 58 68 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2.2"/>
${I4}<path d="M 74 50 Q 98 22 100 46 Q 98 66 82 62 Q 76 56 72 52 Z" fill="url(#${p}-wing2)" opacity="0.85" stroke="${flame}" stroke-width="1.1"/>
${I4}<path d="M 92 28 Q 100 36 96 52" stroke="${accent}" stroke-width="1.3" fill="none" opacity="0.7"/>
${I4}<path d="M 96 36 Q 102 42 98 56" stroke="#ff8a65" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<path d="M 98 46 Q 104 50 100 62" stroke="#ff3d00" stroke-width="0.95" fill="none" opacity="0.5"/>
${I4}<path d="M 88 54 Q 82 60 76 64" stroke="#fff59d" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<path d="M 102 22 L 108 12" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
${I4}<path d="M 96 18 L 100 8" stroke="${flame}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 90 16 L 92 6" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<circle cx="104" cy="30" r="2" fill="#fffde7" opacity="0.55"/>
${I3}</g>`;
  } else if (c.wings === 'lg') {
    wings = `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 50 Q 0 22 -2 46 Q 0 68 16 64 Q 24 56 30 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.9"/>
${I4}<path d="M 12 36 Q 4 44 8 58" stroke="${accent}" stroke-width="1.1" fill="none" opacity="0.6"/>
${I4}<path d="M 8 44 Q 2 50 6 62" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.5"/>
${I4}<path d="M 4 28 L -2 20" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 10 24 L 6 16" stroke="${flame}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 50 Q 100 22 102 46 Q 100 68 84 64 Q 76 56 70 52 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.9"/>
${I4}<path d="M 88 36 Q 96 44 92 58" stroke="${accent}" stroke-width="1.1" fill="none" opacity="0.6"/>
${I4}<path d="M 92 44 Q 98 50 94 62" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.5"/>
${I4}<path d="M 96 28 L 102 20" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 90 24 L 94 16" stroke="${flame}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>`;
  } else if (c.wings === 'md') {
    wings = `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 52 Q 10 36 8 52 Q 10 68 22 64 Q 28 58 32 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 18 44 Q 12 50 16 60" stroke="${accent}" stroke-width="0.9" fill="none" opacity="0.55"/>
${I4}<path d="M 12 32 L 6 24" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 52 Q 90 36 92 52 Q 90 68 78 64 Q 72 58 68 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 82 44 Q 88 50 84 60" stroke="${accent}" stroke-width="0.9" fill="none" opacity="0.55"/>
${I4}<path d="M 88 32 L 94 24" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>`;
  } else {
    wings = `${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="24" cy="58" rx="8" ry="12" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.2" transform="rotate(-28 24 58)"/>
${I4}<path d="M 20 50 Q 14 54 18 62" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.55"/>
${I4}<circle cx="18" cy="52" r="1.3" fill="#fff" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="76" cy="58" rx="8" ry="12" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.2" transform="rotate(28 76 58)"/>
${I4}<path d="M 80 50 Q 86 54 82 62" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.55"/>
${I4}<circle cx="82" cy="52" r="1.3" fill="#fff" opacity="0.45"/>
${I3}</g>`;
  }

  // ── Tail of living flame ──
  let tail;
  if (boss) {
    tail = `${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 68 Q 78 102 98 52 Q 104 28 90 24 Q 74 36 58 68 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<path d="M 62 70 Q 80 108 100 60" fill="url(#${p}-wing)" opacity="0.7" stroke="${flame}" stroke-width="1.1"/>
${I4}<path d="M 66 66 Q 84 98 102 56" fill="none" stroke="${accent}" stroke-width="1.3" opacity="0.65"/>
${I4}<path d="M 70 62 Q 86 90 96 50" fill="none" stroke="#ff8a65" stroke-width="1" opacity="0.5"/>
${I4}<path d="M 74 58 Q 88 82 94 48" fill="none" stroke="#fff59d" stroke-width="0.85" opacity="0.45"/>
${I4}<ellipse cx="96" cy="40" rx="6" ry="8" fill="${accent}" opacity="0.75"/>
${I4}<circle cx="95" cy="38" r="2.2" fill="#fff" opacity="0.7"/>
${I4}<circle cx="100" cy="48" r="1.6" fill="#ff3d00" opacity="0.55"/>
${I3}</g>`;
  } else if (stage === 'evo2') {
    tail = `${I3}<g class="tm-animate-tail">
${I4}<path d="M 60 70 Q 78 96 92 58 Q 96 40 86 38 Q 72 48 60 70 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 66 72 Q 80 100 94 64" fill="url(#${p}-wing)" opacity="0.65" stroke="${flame}" stroke-width="0.95"/>
${I4}<circle cx="90" cy="50" r="3" fill="${accent}" opacity="0.8"/>
${I3}</g>`;
  } else if (stage === 'evo1') {
    tail = `${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 70 Q 80 88 90 60 Q 94 46 84 44 Q 72 52 64 70 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.35"/>
${I4}<path d="M 70 72 Q 82 92 92 64" fill="none" stroke="${accent}" stroke-width="1" opacity="0.55"/>
${I4}<circle cx="88" cy="54" r="2.4" fill="${accent}" opacity="0.75"/>
${I3}</g>`;
  } else {
    tail = `${I3}<g class="tm-animate-tail">
${I4}<ellipse cx="68" cy="72" rx="9" ry="7" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<ellipse cx="76" cy="66" rx="6" ry="5" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<circle cx="80" cy="62" r="2.6" fill="${accent}" opacity="0.75"/>
${I3}</g>`;
  }

  // ── Crest ──
  let crest;
  if (c.crest === 'boss') {
    crest = `${I4}<!-- Mythic solar crown -->
${I4}<ellipse cx="50" cy="6" rx="22" ry="5" fill="url(#${p}-corona)" opacity="0.85"/>
${I4}<path d="M 28 18 L 18 -2 L 34 14 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 36 14 L 30 -6 L 42 12 Z" fill="${flame}" stroke="${stroke}" stroke-width="1.05"/>
${I4}<path d="M 44 10 L 40 -10 L 50 8 Z" fill="${accent}" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 56 10 L 60 -10 L 50 8 Z" fill="${accent}" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 64 14 L 70 -6 L 58 12 Z" fill="${flame}" stroke="${stroke}" stroke-width="1.05"/>
${I4}<path d="M 72 18 L 82 -2 L 66 14 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 22 12 L 12 0 L 26 10 Z" fill="#ff8a65" opacity="0.85"/>
${I4}<path d="M 78 12 L 88 0 L 74 10 Z" fill="#ff8a65" opacity="0.85"/>
${I4}<circle cx="50" cy="-6" r="2.8" fill="#fffde7" opacity="0.9"/>
${I4}<circle cx="50" cy="2" r="1.6" fill="#ff3d00" opacity="0.55"/>`;
  } else if (c.crest === 'divine') {
    crest = `${I4}<!-- Immortal sun halo -->
${I4}<ellipse cx="50" cy="4" rx="24" ry="5.5" fill="none" stroke="#fff59d" stroke-width="1.6" opacity="0.7"/>
${I4}<ellipse cx="50" cy="4" rx="18" ry="3.5" fill="url(#${p}-corona)" opacity="0.8"/>
${I4}<path d="M 30 16 L 22 -4 L 36 14 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="M 40 12 L 36 -8 L 48 10 Z" fill="#fff59d" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="M 50 8 L 50 -12 L 56 8 Z" fill="#fffde7" stroke="${stroke}" stroke-width="1.05"/>
${I4}<path d="M 60 12 L 64 -8 L 52 10 Z" fill="#fff59d" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="M 70 16 L 78 -4 L 64 14 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1"/>
${I4}<circle cx="50" cy="-8" r="3" fill="#fff" opacity="0.9"/>
${I4}<circle cx="24" cy="8" r="1.8" fill="#fff" opacity="0.55"/>
${I4}<circle cx="76" cy="8" r="1.8" fill="#fff" opacity="0.55"/>`;
  } else if (c.crest === 'lg') {
    crest = `${I4}<path d="M 36 18 L 28 2 L 40 16 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 44 14 L 40 -2 L 50 12 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 56 14 L 60 -2 L 50 12 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 64 18 L 72 2 L 60 16 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 32 12 L 24 0 L 34 10 Z" fill="#ff8a65" opacity="0.8"/>
${I4}<path d="M 68 12 L 76 0 L 66 10 Z" fill="#ff8a65" opacity="0.8"/>
${I4}<circle cx="50" cy="0" r="2" fill="#fffde7" opacity="0.75"/>`;
  } else if (c.crest === 'md') {
    crest = `${I4}<path d="M 40 22 L 36 8 L 44 20 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 50 18 L 50 4 L 54 16 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 60 22 L 64 8 L 56 20 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.85"/>`;
  } else {
    crest = `${I4}<ellipse cx="36" cy="32" rx="4" ry="6" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.85" transform="rotate(-16 36 32)"/>
${I4}<ellipse cx="64" cy="32" rx="4" ry="6" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.85" transform="rotate(16 64 32)"/>
${I4}<ellipse cx="50" cy="26" rx="3.2" ry="5" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.7"/>`;
  }

  // Stage extras
  let bodyExtra = '';
  let auraExtra = '';
  if (stage === 'evo3') {
    auraExtra = `${I3}<ellipse cx="50" cy="46" rx="42" ry="40" fill="url(#${p}-corona)" opacity="0.55"/>
${I3}<ellipse cx="50" cy="46" rx="34" ry="32" fill="none" stroke="#ffea00" stroke-width="1.2" opacity="0.35"/>
${I3}<ellipse cx="50" cy="46" rx="26" ry="24" fill="none" stroke="#ff3d00" stroke-width="0.8" opacity="0.25"/>`;
    bodyExtra = `${I4}<!-- Armor-like flame plates -->
${I4}<path d="M 38 48 L 36 56 L 42 54 Z" fill="#ff8a65" stroke="${stroke}" stroke-width="0.75"/>
${I4}<path d="M 50 46 L 48 54 L 52 54 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.8"/>
${I4}<path d="M 62 48 L 58 54 L 64 56 Z" fill="#ff8a65" stroke="${stroke}" stroke-width="0.75"/>
${I4}<path d="M 34 58 Q 50 62 66 58" stroke="#ffe082" stroke-width="1.15" fill="none" opacity="0.65"/>
${I4}<path d="M 36 64 Q 50 68 64 64" stroke="#ffe082" stroke-width="1" fill="none" opacity="0.55"/>
${I4}<path d="M 38 70 Q 50 74 62 70" stroke="#ffab40" stroke-width="0.9" fill="none" opacity="0.45"/>`;
  } else if (stage === 'evo4') {
    bodyExtra = `${I4}<!-- Ash scars -->
${I4}<ellipse cx="36" cy="58" rx="6" ry="5" fill="url(#${p}-ash)" opacity="0.55"/>
${I4}<ellipse cx="64" cy="62" rx="5" ry="4" fill="url(#${p}-ash)" opacity="0.5"/>
${I4}<path d="M 54 32 L 58 38 L 56 42" stroke="#90a4ae" stroke-width="1.3" fill="none" opacity="0.7"/>
${I4}<path d="M 34 56 Q 50 60 66 56" stroke="#ffab40" stroke-width="1" fill="none" opacity="0.45"/>`;
  } else if (stage === 'evo5') {
    auraExtra = `${I3}<ellipse cx="50" cy="44" rx="44" ry="42" fill="url(#${p}-corona)" opacity="0.65"/>
${I3}<ellipse cx="50" cy="44" rx="36" ry="34" fill="none" stroke="#fffde7" stroke-width="1.4" opacity="0.4"/>
${I3}<ellipse cx="50" cy="44" rx="28" ry="26" fill="none" stroke="#ffd54f" stroke-width="0.9" opacity="0.3"/>`;
    bodyExtra = `${I4}<path d="M 36 52 Q 50 54 64 52" stroke="#fffde7" stroke-width="1.1" fill="none" opacity="0.55"/>
${I4}<circle cx="28" cy="40" r="2.2" fill="#fff" opacity="0.55"/>
${I4}<circle cx="72" cy="38" r="2.2" fill="#fff" opacity="0.5"/>`;
  } else if (stage === 'evo2') {
    bodyExtra = `${I4}<path d="M 38 56 Q 50 58 62 56" stroke="#ffe082" stroke-width="0.95" fill="none" opacity="0.55"/>
${I4}<path d="M 40 62 Q 50 64 60 62" stroke="#ffe082" stroke-width="0.85" fill="none" opacity="0.45"/>`;
  }

  const armY = stage === 'baby' ? 64 : 58;
  const legY = boss ? 88 : 86;

  const body = `${shadow(c.shadowRx, boss ? 0.32 : 0.24)}
${I3}<ellipse cx="50" cy="48" rx="${c.auraR}" ry="${(c.auraR * 0.94).toFixed(0)}" fill="url(#${p}-aura)"/>
${auraExtra}
${emberSparks(c.sparks)}
${wings}
${tail}
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="${c.bodyY}" rx="${c.bodyRx}" ry="${c.bodyRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="${boss ? 2.5 : 1.8}"/>
${I4}<ellipse cx="${(50 - c.bodyRx + 8).toFixed(1)}" cy="${c.bodyY - 8}" rx="9" ry="5" fill="#fff" opacity="0.16"/>
${I4}<ellipse cx="50" cy="${c.bodyY + 2}" rx="${(c.bodyRx - 8).toFixed(1)}" ry="${(c.bodyRy - 6).toFixed(1)}" fill="url(#${p}-belly)"/>
${bodyExtra}
${I4}<circle cx="50" cy="${c.bodyY}" r="${boss ? 10 : 7.5}" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="${c.bodyY}" r="${boss ? 4.5 : 3.2}" fill="#fffde7" opacity="${boss ? 0.85 : 0.7}"/>
${I4}<!-- Head -->
${I4}<ellipse cx="50" cy="${c.headY}" rx="${c.headRx}" ry="${c.headRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="${boss ? 2.3 : 1.7}"/>
${I4}<ellipse cx="${(50 - c.headRx + 7).toFixed(1)}" cy="${c.headY - 5}" rx="7" ry="4" fill="#fff" opacity="0.15"/>
${crest}
${I4}<circle cx="34" cy="${c.headY + 6}" r="${boss ? 4.5 : 3.8}" fill="url(#${p}-cheek)"/>
${I4}<circle cx="66" cy="${c.headY + 6}" r="${boss ? 4.5 : 3.8}" fill="url(#${p}-cheek)"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="${armY}" rx="${boss ? 7.5 : 6}" ry="${boss ? 12 : 9}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4" transform="rotate(-20 26 ${armY})"/>
${I4}<path d="M 22 ${armY + 10} L 16 ${armY + 18} M 24 ${armY + 12} L 22 ${armY + 20} M 26 ${armY + 10} L 30 ${armY + 18}" stroke="${flame}" stroke-width="${boss ? 1.6 : 1.3}" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="${armY}" rx="${boss ? 7.5 : 6}" ry="${boss ? 12 : 9}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4" transform="rotate(20 74 ${armY})"/>
${I4}<path d="M 74 ${armY + 10} L 70 ${armY + 18} M 76 ${armY + 12} L 78 ${armY + 20} M 78 ${armY + 10} L 84 ${armY + 18}" stroke="${flame}" stroke-width="${boss ? 1.6 : 1.3}" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="${legY}" rx="${boss ? 8 : 6.5}" ry="${boss ? 6 : 5}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 32 ${legY + 2} L 26 ${legY + 8} M 37 ${legY + 3} L 37 ${legY + 10} M 42 ${legY + 3} L 42 ${legY + 10} M 46 ${legY + 2} L 52 ${legY + 8}" stroke="${stroke}" stroke-width="${boss ? 1.7 : 1.4}" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="${legY}" rx="${boss ? 8 : 6.5}" ry="${boss ? 6 : 5}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 54 ${legY + 2} L 48 ${legY + 8} M 59 ${legY + 3} L 59 ${legY + 10} M 64 ${legY + 3} L 64 ${legY + 10} M 68 ${legY + 2} L 74 ${legY + 8}" stroke="${stroke}" stroke-width="${boss ? 1.7 : 1.4}" stroke-linecap="round"/>
${I3}</g>
${fierceEyes(40, 60, c.eyeY, c.eyeRx, c.eyeRy, `url(#${p}-iris)`, stroke, {
    angry, sclera: stage === 'evo5' ? '#fffde7' : '#fff8e1', glow: stage === 'evo5' ? '#fff' : '#fffde7',
  })}
${hookedBeak(c.beakY, stroke, stage === 'evo5' ? '#ffcc80' : stage === 'evo4' ? '#d84315' : '#ff6d00', c.beakSize)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const phoenixSvg = [
  `${I}<!-- PHOENIX CHARACTER - All Life Stages (dense cute epic v4 · BOSS MYTHICAL) -->`,
  `${I}<!-- Solar Flame • Legendary Rarity • Ashborn Phoenix -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(phoenixStage),
].join('\n');
