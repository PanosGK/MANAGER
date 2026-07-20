/**
 * Starveil Aether — MYTHICAL BOSS v3 · SERIOUS / EPIC
 * Austere primordial star-sovereign: angular void form, blade geometry,
 * sacred rings, minimal ornament. Not cute — divine and severe.
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

function grad(id, stops, type = 'radial', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = attrs
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="100%" y2="100%"' : 'cx="40%" cy="28%" r="78%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Narrow, solemn eyes — no oversized cartoon sclera */
function solemnEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, { slit = false, glow = false } = {}) {
  const irisRx = slit ? rxE * 0.35 : rxE * 0.48;
  const irisRy = slit ? ryE * 0.72 : ryE * 0.55;
  const glowEl = glow
    ? `${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(rxE * 1.6).toFixed(1)}" ry="${(ryE * 1.35).toFixed(1)}" fill="${CYAN}" opacity="0.1"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(rxE * 1.6).toFixed(1)}" ry="${(ryE * 1.35).toFixed(1)}" fill="${GOLD}" opacity="0.08"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${glowEl}
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${PALE}" stroke="${stroke}" stroke-width="1.4" opacity="0.92"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${PALE}" stroke="${stroke}" stroke-width="1.4" opacity="0.92"/>
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${irisRx.toFixed(1)}" ry="${irisRy.toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${irisRx.toFixed(1)}" ry="${irisRy.toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(irisRx * 0.35).toFixed(1)}" ry="${(irisRy * 0.55).toFixed(1)}" fill="${INK}"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(irisRx * 0.35).toFixed(1)}" ry="${(irisRy * 0.55).toFixed(1)}" fill="${INK}"/>
${I4}<line x1="${(lx - rxE * 0.85).toFixed(1)}" y1="${(cy - ryE * 0.9).toFixed(1)}" x2="${(lx + rxE * 0.7).toFixed(1)}" y2="${(cy - ryE * 0.55).toFixed(1)}" stroke="${stroke}" stroke-width="1.35" stroke-linecap="round" opacity="0.75"/>
${I4}<line x1="${(rx + rxE * 0.85).toFixed(1)}" y1="${(cy - ryE * 0.9).toFixed(1)}" x2="${(rx - rxE * 0.7).toFixed(1)}" y2="${(cy - ryE * 0.55).toFixed(1)}" stroke="${stroke}" stroke-width="1.35" stroke-linecap="round" opacity="0.75"/>
${I4}<circle cx="${(lx + irisRx * 0.25).toFixed(1)}" cy="${(cy - irisRy * 0.35).toFixed(1)}" r="0.9" fill="${PALE}" opacity="0.55"/>
${I4}<circle cx="${(rx + irisRx * 0.25).toFixed(1)}" cy="${(cy - irisRy * 0.35).toFixed(1)}" r="0.9" fill="${PALE}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} L ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} L ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Thin solemn mouth — no chubby star beak */
function solemnMouth(y, stroke) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M 45 ${y} Q 50 ${(y + 2.2).toFixed(1)} 55 ${y}" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 ${(y + 2).toFixed(1)} Q 50 ${(y - 1.2).toFixed(1)} 55 ${(y + 2).toFixed(1)}" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}

function shadow(rx = 28, opacity = 0.35) {
  return `${I3}<ellipse cx="50" cy="96" rx="${rx}" ry="4.5" fill="${INK}" opacity="${opacity}"/>`;
}

function sparseStars(count = 6) {
  const pts = [
    [12, 20], [88, 18], [8, 48], [92, 50], [18, 72], [82, 74],
    [30, 12], [70, 10], [6, 62], [94, 60],
  ].slice(0, count);
  return pts.map(([x, y], i) =>
    `${I3}<circle class="tm-aether-spark" cx="${x}" cy="${y}" r="${i % 3 === 0 ? 1.4 : 0.9}" fill="${i % 2 ? GOLD : CYAN}" opacity="${0.35 + (i % 3) * 0.1}"/>`
  ).join('\n');
}

function sacredRings(epic = false) {
  return `${I3}<g class="tm-aether-orbit-group">
${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="42" ry="18" fill="none" stroke="${CYAN}" stroke-width="1.15" opacity="0.45" stroke-dasharray="6 5"/>
${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="34" ry="22" fill="none" stroke="${GOLD}" stroke-width="0.85" opacity="0.35" stroke-dasharray="3 6" transform="rotate(28 50 52)"/>
${epic ? `${I4}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="26" ry="26" fill="none" stroke="${VIOLET}" stroke-width="0.7" opacity="0.3" stroke-dasharray="2 5" transform="rotate(-18 50 52)"/>
${I4}<circle class="tm-aether-orbit-node" cx="92" cy="52" r="1.6" fill="${GOLD}" opacity="0.7"/>
${I4}<circle class="tm-aether-orbit-node" cx="24" cy="40" r="1.3" fill="${CYAN}" opacity="0.65"/>` : ''}
${I3}</g>`;
}

/** Angular blade wings — severe silhouette */
function bladeWing(side, p, stroke, size = 'md') {
  const flip = side === 'left' ? -1 : 1;
  const bx = side === 'left' ? 30 : 70;
  const span = size === 'xl' ? 36 : size === 'lg' ? 30 : size === 'sm' ? 18 : 24;
  const tip = bx + flip * span;
  const mid = bx + flip * span * 0.55;
  return `${I3}<g class="tm-animate-wing-${side}">
${I4}<path d="M ${bx} 50 L ${mid} 34 L ${tip} 40 L ${mid + flip * 2} 52 L ${bx} 58 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.25" opacity="0.9"/>
${I4}<path d="M ${bx} 54 L ${mid} 48 L ${tip - flip * 6} 56 L ${mid} 60 Z" fill="url(#${p}-wing2)" stroke="${stroke}" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M ${bx + flip * 2} 48 L ${tip} 38" stroke="${CYAN}" stroke-width="0.7" opacity="0.5"/>
${I4}<circle cx="${tip}" cy="40" r="1.5" fill="${GOLD}" opacity="0.65"/>
${I3}</g>`;
}

function voidMantle(p, stroke, epic = false) {
  return `${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 68 L 78 74 L 88 52 L 80 70 L 64 66 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.15" opacity="0.88"/>
${I4}<path d="M 62 70 L 84 78 L 90 60" fill="none" stroke="${CYAN}" stroke-width="0.75" opacity="0.4"/>
${I4}<circle cx="88" cy="52" r="1.8" fill="${GOLD}" opacity="0.7"/>
${epic ? `${I4}<path d="M 70 72 L 86 86 L 92 70" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="0.8" opacity="0.5"/>` : ''}
${I3}</g>`;
}

function runeCore(cx, cy, r, p, mythic = false) {
  const seal = mythic
    ? `${I4}<circle class="tm-aether-core-ring" cx="${cx}" cy="${cy}" r="${(r * 1.65).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="0.75" opacity="0.4"/>
${I4}<path d="M ${cx} ${(cy - r * 1.35).toFixed(1)} L ${(cx + r * 0.9).toFixed(1)} ${(cy + r * 0.7).toFixed(1)} L ${(cx - r * 0.9).toFixed(1)} ${(cy + r * 0.7).toFixed(1)} Z" fill="none" stroke="${CYAN}" stroke-width="0.65" opacity="0.4"/>`
    : '';
  return `${seal}
${I4}<circle class="tm-aether-core" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}-core)"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${(r * 0.35).toFixed(1)}" fill="${PALE}" opacity="0.7"/>`;
}

function diadem(headY, headRy, tier = 1) {
  const top = headY - headRy;
  if (tier === 1) {
    return `${I4}<path d="M 46 ${(top + 2).toFixed(1)} L 50 ${(top - 4).toFixed(1)} L 54 ${(top + 2).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linejoin="round"/>
${I4}<circle cx="50" cy="${(top - 4).toFixed(1)}" r="1.4" fill="${GOLD}" opacity="0.8"/>`;
  }
  if (tier === 2) {
    return `${I4}<path d="M 34 ${(headY - 2).toFixed(1)} L 28 ${(top - 6).toFixed(1)}" stroke="${CYAN}" stroke-width="1.8" stroke-linecap="round"/>
${I4}<path d="M 66 ${(headY - 2).toFixed(1)} L 72 ${(top - 6).toFixed(1)}" stroke="${GOLD}" stroke-width="1.8" stroke-linecap="round"/>
${I4}<circle cx="28" cy="${(top - 6).toFixed(1)}" r="1.6" fill="${CYAN}" opacity="0.75"/>
${I4}<circle cx="72" cy="${(top - 6).toFixed(1)}" r="1.6" fill="${GOLD}" opacity="0.75"/>
${I4}<path d="M 46 ${(top + 1).toFixed(1)} L 50 ${(top - 5).toFixed(1)} L 54 ${(top + 1).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="1.3"/>`;
  }
  return `${I4}<ellipse class="tm-aether-halo" cx="50" cy="${(top + 1).toFixed(1)}" rx="15" ry="3.2" fill="none" stroke="${GOLD}" stroke-width="1.35" opacity="0.75"/>
${I4}<path d="M 30 ${(headY - 1).toFixed(1)} L 22 ${(top - 10).toFixed(1)}" stroke="${CYAN}" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 70 ${(headY - 1).toFixed(1)} L 78 ${(top - 10).toFixed(1)}" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 44 ${(top + 2).toFixed(1)} L 50 ${(top - 8).toFixed(1)} L 56 ${(top + 2).toFixed(1)}" fill="${DEEP}" stroke="${GOLD}" stroke-width="1.1"/>
${I4}<circle cx="22" cy="${(top - 10).toFixed(1)}" r="1.8" fill="${CYAN}" opacity="0.8"/>
${I4}<circle cx="78" cy="${(top - 10).toFixed(1)}" r="1.8" fill="${GOLD}" opacity="0.8"/>
${I4}<circle cx="50" cy="${(top - 8).toFixed(1)}" r="1.5" fill="${PALE}" opacity="0.85"/>`;
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

function aetherStage(stage) {
  const p = `aether-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'void spark',
    evo1: 'astral initiate',
    evo2: 'veil warden',
    evo3: 'Starveil Aether — MYTHICAL SOVEREIGN',
    evo4: 'eclipse sovereign',
    evo5: 'primordial absolute',
  };

  // Darker, more restrained palette
  const bodyStops = stage === 'evo5'
    ? [['0%', '#d4c4a8'], ['25%', '#9e8c6a'], ['55%', '#5c4a7a'], ['100%', '#1a1028']]
    : stage === 'evo4'
      ? [['0%', '#6a5a80'], ['35%', '#3d2a58'], ['70%', '#1a0a28'], ['100%', INK]]
      : stage === 'evo3'
        ? [['0%', '#8b7bb8'], ['30%', '#5a3d9a'], ['65%', '#2a1550'], ['100%', DEEP]]
        : stage === 'evo2'
          ? [['0%', '#7a6a9a'], ['45%', '#4a3580'], ['100%', '#1e1038']]
          : stage === 'evo1'
            ? [['0%', '#8a7aaa'], ['50%', '#554080'], ['100%', '#2a1848']]
            : [['0%', '#9a8ab0'], ['55%', '#5a4880'], ['100%', '#322050']];

  const stroke = stage === 'evo5' ? '#a89060'
    : stage === 'evo4' ? '#3a2060'
      : '#2a1848';
  const mythic = stage === 'evo3' || stage === 'evo4' || stage === 'evo5';
  const wingSize = stage === 'baby' ? 'sm' : stage === 'evo1' ? 'md' : stage === 'evo2' ? 'lg' : 'xl';
  const crownTier = stage === 'baby' ? 1 : (stage === 'evo1' || stage === 'evo2') ? 2 : 3;
  const slitEyes = stage !== 'baby' && stage !== 'evo1';

  const defs = [
    grad(`${p}-body`, bodyStops, 'radial', 'cx="38%" cy="22%" r="80%"'),
    grad(`${p}-belly`, [['0%', '#4a3a68', 0.9], ['100%', DEEP, 0.95]], 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(`${p}-wing`, [['0%', '#6a90a8', 0.85], ['40%', VIOLET, 0.7], ['100%', DEEP, 0.75]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-wing2`, [['0%', GOLD, 0.35], ['100%', DEEP, 0.5]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-core`, [['0%', PALE], ['25%', CYAN], ['60%', VIOLET], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, stage === 'evo5'
      ? [['0%', '#f0e6c8'], ['50%', GOLD], ['100%', '#3a2810']]
      : [['0%', '#a8e6f0'], ['45%', CYAN], ['100%', INK]], 'radial', 'cx="40%" cy="35%" r="65%"'),
    grad(`${p}-aura`, [['0%', CYAN, mythic ? 0.22 : 0.12], ['40%', VIOLET, 0.18], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    grad(`${p}-corona`, [['0%', GOLD, 0.18], ['50%', CYAN, 0.1], ['100%', VIOLET, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-tail`, [['0%', '#5a4a78'], ['50%', VIOLET], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
  ].join('\n');

  // Elongated, less chubby proportions
  const cfg = {
    baby: {
      shadowRx: 22, auraR: 34, bodyY: 62, bodyRx: 16, bodyRy: 20, headY: 34, headRx: 13, headRy: 14,
      eyeY: 32, eyeRx: 4.2, eyeRy: 5.5, mouthY: 42, sparks: 5, orbit: false, coreR: 4.5,
    },
    evo1: {
      shadowRx: 24, auraR: 36, bodyY: 60, bodyRx: 16.5, bodyRy: 21, headY: 31, headRx: 13.5, headRy: 14.5,
      eyeY: 29, eyeRx: 4.4, eyeRy: 5.8, mouthY: 40, sparks: 6, orbit: true, coreR: 5,
    },
    evo2: {
      shadowRx: 26, auraR: 38, bodyY: 58, bodyRx: 17, bodyRy: 22, headY: 28, headRx: 14, headRy: 15,
      eyeY: 26, eyeRx: 4.6, eyeRy: 6.2, mouthY: 38, sparks: 7, orbit: true, coreR: 5.5,
    },
    evo3: {
      shadowRx: 28, auraR: 42, bodyY: 56, bodyRx: 17.5, bodyRy: 23.5, headY: 25, headRx: 14.5, headRy: 15.5,
      eyeY: 23, eyeRx: 4.8, eyeRy: 6.5, mouthY: 36, sparks: 8, orbit: true, coreR: 6.5,
    },
    evo4: {
      shadowRx: 28, auraR: 42, bodyY: 56, bodyRx: 18, bodyRy: 24, headY: 25, headRx: 14.5, headRy: 15.5,
      eyeY: 23, eyeRx: 4.8, eyeRy: 6.5, mouthY: 36, sparks: 7, orbit: true, coreR: 6.2,
    },
    evo5: {
      shadowRx: 30, auraR: 44, bodyY: 54, bodyRx: 18.5, bodyRy: 24.5, headY: 23, headRx: 15, headRy: 16,
      eyeY: 21, eyeRx: 5, eyeRy: 6.8, mouthY: 34, sparks: 8, orbit: true, coreR: 7,
    },
  }[stage];

  const body = `${shadow(cfg.shadowRx, mythic ? 0.4 : 0.3)}
${I3}<ellipse class="tm-aether-aura" cx="50" cy="48" rx="${cfg.auraR}" ry="${(cfg.auraR * 0.88).toFixed(1)}" fill="url(#${p}-aura)"/>
${I3}<ellipse class="tm-aether-corona" cx="50" cy="50" rx="${(cfg.auraR * 0.62).toFixed(1)}" ry="${(cfg.auraR * 0.55).toFixed(1)}" fill="url(#${p}-corona)" opacity="0.7"/>
${cfg.orbit ? sacredRings(mythic) : ''}
${sparseStars(cfg.sparks)}
${bladeWing('left', p, stroke, wingSize)}
${bladeWing('right', p, stroke, wingSize)}
${voidMantle(p, stroke, mythic)}
${I3}<g class="tm-animate-body">
${I4}<!-- Tall angular torso -->
${I4}<path d="M ${(50 - cfg.bodyRx).toFixed(1)} ${(cfg.bodyY - cfg.bodyRy * 0.55).toFixed(1)}
  Q ${(50 - cfg.bodyRx * 1.05).toFixed(1)} ${cfg.bodyY} ${(50 - cfg.bodyRx * 0.85).toFixed(1)} ${(cfg.bodyY + cfg.bodyRy * 0.75).toFixed(1)}
  L ${(50 + cfg.bodyRx * 0.85).toFixed(1)} ${(cfg.bodyY + cfg.bodyRy * 0.75).toFixed(1)}
  Q ${(50 + cfg.bodyRx * 1.05).toFixed(1)} ${cfg.bodyY} ${(50 + cfg.bodyRx).toFixed(1)} ${(cfg.bodyY - cfg.bodyRy * 0.55).toFixed(1)}
  Q 50 ${(cfg.bodyY - cfg.bodyRy).toFixed(1)} ${(50 - cfg.bodyRx).toFixed(1)} ${(cfg.bodyY - cfg.bodyRy * 0.55).toFixed(1)} Z"
  fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="50" cy="${cfg.bodyY + 2}" rx="${(cfg.bodyRx * 0.55).toFixed(1)}" ry="${(cfg.bodyRy * 0.5).toFixed(1)}" fill="url(#${p}-belly)"/>
${I4}<!-- Subtle rune line -->
${I4}<path d="M 50 ${(cfg.bodyY - cfg.bodyRy * 0.35).toFixed(1)} L 50 ${(cfg.bodyY + cfg.bodyRy * 0.4).toFixed(1)}" stroke="${CYAN}" stroke-width="0.6" opacity="0.35"/>
${runeCore(50, cfg.bodyY, cfg.coreR, p, mythic)}
${I4}<!-- Angular head -->
${I4}<path d="M ${(50 - cfg.headRx).toFixed(1)} ${cfg.headY}
  Q ${(50 - cfg.headRx).toFixed(1)} ${(cfg.headY - cfg.headRy).toFixed(1)} 50 ${(cfg.headY - cfg.headRy).toFixed(1)}
  Q ${(50 + cfg.headRx).toFixed(1)} ${(cfg.headY - cfg.headRy).toFixed(1)} ${(50 + cfg.headRx).toFixed(1)} ${cfg.headY}
  Q ${(50 + cfg.headRx * 0.85).toFixed(1)} ${(cfg.headY + cfg.headRy * 0.85).toFixed(1)} 50 ${(cfg.headY + cfg.headRy).toFixed(1)}
  Q ${(50 - cfg.headRx * 0.85).toFixed(1)} ${(cfg.headY + cfg.headRy * 0.85).toFixed(1)} ${(50 - cfg.headRx).toFixed(1)} ${cfg.headY} Z"
  fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.55"/>
${diadem(cfg.headY, cfg.headRy, crownTier)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 34 ${cfg.bodyY - 4} L 22 ${cfg.bodyY + 2} L 24 ${cfg.bodyY + 12} L 32 ${cfg.bodyY + 6} Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<circle cx="22" cy="${cfg.bodyY + 12}" r="1.5" fill="${CYAN}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 66 ${cfg.bodyY - 4} L 78 ${cfg.bodyY + 2} L 76 ${cfg.bodyY + 12} L 68 ${cfg.bodyY + 6} Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.15"/>
${I4}<circle cx="78" cy="${cfg.bodyY + 12}" r="1.5" fill="${GOLD}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 78 L 38 92 L 46 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="42" cy="92" rx="5" ry="1.8" fill="${INK}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 78 L 54 92 L 62 92 Z" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<ellipse cx="58" cy="92" rx="5" ry="1.8" fill="${INK}" opacity="0.55"/>
${I3}</g>
${solemnEyes(41, 59, cfg.eyeY, cfg.eyeRx, cfg.eyeRy, `url(#${p}-iris)`, stroke, { slit: slitEyes, glow: mythic })}
${solemnMouth(cfg.mouthY, stroke)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const aetherSvg = [
  `${I}<!-- AETHER CHARACTER - All Life Stages (MYTHICAL BOSS v3 · SERIOUS / EPIC) -->`,
  `${I}<!-- Primordial Cosmos • Mythical Rarity • Starveil Aether — austere sovereign -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(aetherStage),
].join('\n');
