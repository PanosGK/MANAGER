/**
 * Starveil Aether — MYTHICAL BOSS reimagined (v2)
 * Primordial star-god: void body, constellation veins, sacred orbits,
 * blade-wings of nebula light. Distinct silhouette per life stage.
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

const CYAN = '#00e5ff';
const GOLD = '#ffd740';
const MAGENTA = '#e040fb';
const VOID = '#0a0018';
const WHITE = '#fff8e7';

function grad(id, stops, type = 'radial', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = attrs
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="100%" y2="100%"' : 'cx="40%" cy="30%" r="75%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function mythicEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, { mythic = false, ancient = false } = {}) {
  const sclera = ancient ? '#fffde7' : '#f3e5f5';
  const glow = ancient ? GOLD : CYAN;
  const ring = mythic
    ? `${I4}<circle cx="${lx}" cy="${cy}" r="${(rxE * 1.45).toFixed(1)}" fill="none" stroke="${CYAN}" stroke-width="0.7" opacity="0.35"/>
${I4}<circle cx="${rx}" cy="${cy}" r="${(rxE * 1.45).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.35"/>
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(rxE * 1.55).toFixed(1)}" ry="${(ryE * 1.4).toFixed(1)}" fill="${CYAN}" opacity="0.12"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(rxE * 1.55).toFixed(1)}" ry="${(ryE * 1.4).toFixed(1)}" fill="${GOLD}" opacity="0.12"/>`
    : '';
  const cross = mythic
    ? `${I4}<path d="M ${lx} ${(cy - ryE * 0.7).toFixed(1)} L ${lx} ${(cy + ryE * 0.55).toFixed(1)}" stroke="${glow}" stroke-width="0.55" opacity="0.55"/>
${I4}<path d="M ${rx} ${(cy - ryE * 0.7).toFixed(1)} L ${rx} ${(cy + ryE * 0.55).toFixed(1)}" stroke="${glow}" stroke-width="0.55" opacity="0.55"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${ring}
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.7"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.7"/>
${I4}<ellipse cx="${lx + 0.3}" cy="${cy + 0.2}" rx="${(rxE * 0.62).toFixed(1)}" ry="${(ryE * 0.65).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx + 0.3}" cy="${cy + 0.2}" rx="${(rxE * 0.62).toFixed(1)}" ry="${(ryE * 0.65).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx + 0.4}" cy="${cy + 0.5}" rx="${(rxE * 0.24).toFixed(1)}" ry="${(ryE * 0.42).toFixed(1)}" fill="${VOID}"/>
${I4}<ellipse cx="${rx + 0.4}" cy="${cy + 0.5}" rx="${(rxE * 0.24).toFixed(1)}" ry="${(ryE * 0.42).toFixed(1)}" fill="${VOID}"/>
${cross}
${I4}<circle cx="${(lx + 1.6).toFixed(1)}" cy="${(cy - ryE * 0.35).toFixed(1)}" r="${Math.max(1.4, rxE * 0.32).toFixed(1)}" fill="${WHITE}" opacity="0.95"/>
${I4}<circle cx="${(rx + 1.6).toFixed(1)}" cy="${(cy - ryE * 0.35).toFixed(1)}" r="${Math.max(1.4, rxE * 0.32).toFixed(1)}" fill="${WHITE}" opacity="0.95"/>
${I4}<circle cx="${(lx - rxE * 0.28).toFixed(1)}" cy="${(cy + ryE * 0.3).toFixed(1)}" r="0.9" fill="${CYAN}" opacity="0.8"/>
${I4}<circle cx="${(rx - rxE * 0.28).toFixed(1)}" cy="${(cy + ryE * 0.3).toFixed(1)}" r="0.9" fill="${GOLD}" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3.4} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3.4} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function starSealMouth(y, stroke, fill = MAGENTA, size = 1) {
  const s = Number(size) || 1;
  const w = 3.8 * s;
  const d = 4.6 * s;
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${(50 - w).toFixed(1)} ${y} L 50 ${(y + d).toFixed(1)} L ${(50 + w).toFixed(1)} ${y} Q 50 ${(y + 1.7 * s).toFixed(1)} ${(50 - w).toFixed(1)} ${y}" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${(50 - w - 0.7).toFixed(1)} ${y + 1} L 50 ${(y + d + 1.2).toFixed(1)} L ${(50 + w + 0.7).toFixed(1)} ${y + 1} Q 50 ${(y - 0.7).toFixed(1)} ${(50 - w - 0.7).toFixed(1)} ${y + 1}" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>
${I4}<circle cx="50" cy="${(y + d * 0.45).toFixed(1)}" r="${(0.9 * s).toFixed(1)}" fill="${GOLD}" opacity="0.7"/>`;
}

function shadow(rx = 30, opacity = 0.28) {
  return `${I3}<ellipse cx="50" cy="97" rx="${rx}" ry="5.8" fill="${VOID}" opacity="${opacity}"/>
${I3}<ellipse cx="50" cy="97" rx="${(rx * 0.55).toFixed(1)}" ry="3" fill="${CYAN}" opacity="0.12"/>`;
}

/** 4–6 pointed SVG stars as sparkles */
function starPoly(cx, cy, r, fill, opacity, cls = 'tm-aether-spark') {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
  }
  return `${I3}<polygon class="${cls}" points="${pts.join(' ')}" fill="${fill}" opacity="${opacity}"/>`;
}

function constellationField(count = 10, epic = false) {
  const pts = [
    [10, 18], [90, 16], [6, 40], [94, 42], [14, 66], [86, 68],
    [26, 10], [74, 8], [4, 56], [96, 54], [38, 6], [62, 5],
    [20, 82], [80, 84], [48, 4], [52, 92],
  ].slice(0, count);
  const lines = epic
    ? `${I3}<g class="tm-aether-constellation" opacity="0.35">
${I4}<path d="M 14 22 L 38 10 L 62 8 L 86 18" fill="none" stroke="${GOLD}" stroke-width="0.55"/>
${I4}<path d="M 10 44 L 26 28 L 50 20 L 74 28 L 90 44" fill="none" stroke="${CYAN}" stroke-width="0.5"/>
${I4}<path d="M 18 70 L 40 58 L 60 58 L 82 70" fill="none" stroke="${MAGENTA}" stroke-width="0.45"/>
${I3}</g>`
    : '';
  const sparks = pts.map(([x, y], i) => {
    const fill = i % 3 === 0 ? GOLD : i % 3 === 1 ? CYAN : MAGENTA;
    if (i % 4 === 0) return starPoly(x, y, i % 8 === 0 ? 2.8 : 2.1, fill, 0.45 + (i % 4) * 0.1);
    return `${I3}<circle class="tm-aether-spark" cx="${x}" cy="${y}" r="${i % 2 ? 1.2 : 1.7}" fill="${fill}" opacity="${0.4 + (i % 5) * 0.1}"/>`;
  }).join('\n');
  return `${lines}\n${sparks}`;
}

function sacredOrbits(scale = 1, epic = false) {
  const r1 = (40 * scale).toFixed(1);
  const r2 = (32 * scale).toFixed(1);
  const r3 = (24 * scale).toFixed(1);
  const nodes = epic
    ? `${I3}<circle class="tm-aether-orbit-node" cx="${(50 + Number(r1)).toFixed(1)}" cy="54" r="2.2" fill="${GOLD}"/>
${I3}<circle class="tm-aether-orbit-node" cx="${(50 - Number(r2) * 0.7).toFixed(1)}" cy="${(54 - Number(r2) * 0.55).toFixed(1)}" r="1.8" fill="${CYAN}"/>
${I3}<circle class="tm-aether-orbit-node" cx="${(50 + Number(r3) * 0.5).toFixed(1)}" cy="${(54 + Number(r3) * 0.75).toFixed(1)}" r="1.5" fill="${MAGENTA}"/>`
    : '';
  return `${I3}<g class="tm-aether-orbit-group">
${I4}<ellipse class="tm-aether-orbit" cx="50" cy="54" rx="${r1}" ry="${(Number(r1) * 0.52).toFixed(1)}" fill="none" stroke="${CYAN}" stroke-width="1.5" opacity="0.65" stroke-dasharray="5 4"/>
${I4}<ellipse class="tm-aether-orbit" cx="50" cy="54" rx="${r2}" ry="${(Number(r2) * 0.58).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="1.1" opacity="0.55" stroke-dasharray="3 5" transform="rotate(35 50 54)"/>
${epic ? `${I4}<ellipse class="tm-aether-orbit" cx="50" cy="54" rx="${r3}" ry="${(Number(r3) * 0.7).toFixed(1)}" fill="none" stroke="${MAGENTA}" stroke-width="0.9" opacity="0.45" stroke-dasharray="2 4" transform="rotate(-28 50 54)"/>` : ''}
${nodes}
${I3}</g>`;
}

/** Blade / ribbon wings — mythical silhouette, not soft ellipses */
function bladeWing(side, p, stroke, size = 'md', layers = 2) {
  const flip = side === 'left' ? -1 : 1;
  const baseX = side === 'left' ? 28 : 72;
  const span = size === 'xl' ? 34 : size === 'lg' ? 28 : size === 'sm' ? 16 : 22;
  const tipX = baseX + flip * span;
  const midX = baseX + flip * (span * 0.55);
  const y0 = 42;
  const paths = [];
  paths.push(`${I4}<path d="M ${baseX} 52 Q ${midX} ${y0 - 4} ${tipX} ${y0 + 2} Q ${midX + flip * 2} 58 ${baseX} 64 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.3" opacity="0.92"/>`);
  if (layers >= 2) {
    paths.push(`${I4}<path d="M ${baseX} 56 Q ${midX} ${y0 + 8} ${tipX - flip * 4} ${y0 + 18} Q ${midX} 66 ${baseX} 68 Z" fill="url(#${p}-wing2)" stroke="${stroke}" stroke-width="1" opacity="0.7"/>`);
  }
  if (layers >= 3) {
    paths.push(`${I4}<path d="M ${baseX + flip * 2} 48 Q ${midX + flip * 4} ${y0 - 10} ${tipX + flip * 2} ${y0 - 6}" fill="none" stroke="${GOLD}" stroke-width="1.1" opacity="0.75"/>`);
    paths.push(`${I4}<path d="M ${baseX + flip * 3} 54 Q ${midX} 50 ${tipX - flip * 2} ${y0 + 8}" fill="none" stroke="${CYAN}" stroke-width="0.85" opacity="0.65"/>`);
  }
  paths.push(`${I4}<circle cx="${tipX}" cy="${y0 + 2}" r="${layers >= 3 ? 2.4 : 1.8}" fill="${GOLD}" opacity="0.85"/>`);
  paths.push(`${I4}<circle cx="${midX}" cy="${y0 + 6}" r="1.3" fill="${CYAN}" opacity="0.7"/>`);
  if (layers >= 3) {
    paths.push(starPoly(tipX - flip * 3, y0 - 4, 2.2, WHITE, 0.7, 'tm-aether-spark'));
  }
  return `${I3}<g class="tm-animate-wing-${side}">
${paths.join('\n')}
${I3}</g>`;
}

function voidTail(p, stroke, epic = false) {
  return `${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 72 Q 72 78 86 58 Q 78 74 66 70 Z" fill="url(#${p}-tail)" stroke="${stroke}" stroke-width="1.2" opacity="0.92"/>
${I4}<path d="M 64 70 Q 80 82 92 64" fill="none" stroke="${CYAN}" stroke-width="1" opacity="0.55"/>
${I4}<path d="M 62 74 Q 76 88 88 72" fill="none" stroke="${GOLD}" stroke-width="0.8" opacity="0.45"/>
${I4}<circle cx="86" cy="58" r="2.6" fill="${GOLD}" opacity="0.85"/>
${I4}<circle cx="78" cy="78" r="1.5" fill="${CYAN}" opacity="0.7"/>
${epic ? `${I4}<circle cx="92" cy="64" r="1.8" fill="${MAGENTA}" opacity="0.75"/>
${starPoly(84, 70, 2.4, GOLD, 0.55)}` : ''}
${I3}</g>`;
}

function sacredCore(cx, cy, r, p, mythic = false) {
  const outer = mythic
    ? `${I4}<circle class="tm-aether-core-ring" cx="${cx}" cy="${cy}" r="${(r * 1.55).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="0.9" opacity="0.5" stroke-dasharray="2 3"/>
${I4}<circle class="tm-aether-core-ring" cx="${cx}" cy="${cy}" r="${(r * 1.85).toFixed(1)}" fill="none" stroke="${CYAN}" stroke-width="0.6" opacity="0.35" stroke-dasharray="1 4"/>
${I4}<path d="M ${cx} ${(cy - r * 1.7).toFixed(1)} L ${(cx + r * 0.35).toFixed(1)} ${(cy - r * 0.9).toFixed(1)} L ${(cx + r * 1.4).toFixed(1)} ${(cy - r * 0.9).toFixed(1)} L ${(cx + r * 0.55).toFixed(1)} ${(cy - r * 0.2).toFixed(1)} L ${(cx + r * 0.85).toFixed(1)} ${(cy + r * 0.9).toFixed(1)} L ${cx} ${(cy + r * 0.35).toFixed(1)} L ${(cx - r * 0.85).toFixed(1)} ${(cy + r * 0.9).toFixed(1)} L ${(cx - r * 0.55).toFixed(1)} ${(cy - r * 0.2).toFixed(1)} L ${(cx - r * 1.4).toFixed(1)} ${(cy - r * 0.9).toFixed(1)} L ${(cx - r * 0.35).toFixed(1)} ${(cy - r * 0.9).toFixed(1)} Z" fill="${GOLD}" opacity="0.22"/>`
    : '';
  return `${outer}
${I4}<circle class="tm-aether-core" cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}-core)"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${(r * 0.42).toFixed(1)}" fill="${WHITE}" opacity="0.85"/>
${I4}<circle cx="${(cx - r * 0.25).toFixed(1)}" cy="${(cy - r * 0.2).toFixed(1)}" r="${(r * 0.18).toFixed(1)}" fill="${CYAN}" opacity="0.6"/>`;
}

function constellationVeins(bodyY, bodyRx, bodyRy) {
  return `${I4}<g class="tm-aether-veins" opacity="0.55">
${I4}<path d="M ${(50 - bodyRx * 0.55).toFixed(1)} ${(bodyY - 2).toFixed(1)} L 50 ${(bodyY - bodyRy * 0.4).toFixed(1)} L ${(50 + bodyRx * 0.55).toFixed(1)} ${(bodyY - 2).toFixed(1)}" fill="none" stroke="${CYAN}" stroke-width="0.7"/>
${I4}<path d="M 50 ${(bodyY - bodyRy * 0.4).toFixed(1)} L 50 ${(bodyY + bodyRy * 0.35).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="0.7"/>
${I4}<path d="M ${(50 - bodyRx * 0.4).toFixed(1)} ${(bodyY + 6).toFixed(1)} L 50 ${(bodyY + bodyRy * 0.35).toFixed(1)} L ${(50 + bodyRx * 0.4).toFixed(1)} ${(bodyY + 6).toFixed(1)}" fill="none" stroke="${MAGENTA}" stroke-width="0.55"/>
${I4}<circle cx="${(50 - bodyRx * 0.55).toFixed(1)}" cy="${(bodyY - 2).toFixed(1)}" r="1.2" fill="${CYAN}"/>
${I4}<circle cx="${(50 + bodyRx * 0.55).toFixed(1)}" cy="${(bodyY - 2).toFixed(1)}" r="1.2" fill="${GOLD}"/>
${I4}<circle cx="50" cy="${(bodyY + bodyRy * 0.35).toFixed(1)}" r="1.1" fill="${MAGENTA}"/>
${I4}</g>`;
}

function crownOfStars(headY, headRy, tier = 1) {
  const top = headY - headRy - 2;
  if (tier === 1) {
    return `${I4}<ellipse cx="50" cy="${(top + 4).toFixed(1)}" rx="3.5" ry="5.5" fill="url(#aether-shared-halo)" stroke="${GOLD}" stroke-width="0.8" opacity="0.9"/>
${I4}<circle cx="50" cy="${top.toFixed(1)}" r="2" fill="${GOLD}"/>`;
  }
  if (tier === 2) {
    return `${I4}<path d="M 36 ${(headY - 2).toFixed(1)} Q 28 ${(top - 2).toFixed(1)} 34 ${(top - 4).toFixed(1)}" fill="none" stroke="${CYAN}" stroke-width="2.3" stroke-linecap="round"/>
${I4}<path d="M 64 ${(headY - 2).toFixed(1)} Q 72 ${(top - 2).toFixed(1)} 66 ${(top - 4).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="2.3" stroke-linecap="round"/>
${I4}<circle cx="34" cy="${(top - 4).toFixed(1)}" r="2.2" fill="${CYAN}"/>
${I4}<circle cx="66" cy="${(top - 4).toFixed(1)}" r="2.2" fill="${GOLD}"/>
${I4}<circle cx="50" cy="${(top + 1).toFixed(1)}" r="2.4" fill="${WHITE}" opacity="0.9"/>`;
  }
  // Full mythical diadem
  return `${I4}<ellipse class="tm-aether-halo" cx="50" cy="${(top + 2).toFixed(1)}" rx="16" ry="4.5" fill="none" stroke="${GOLD}" stroke-width="1.6" opacity="0.85"/>
${I4}<ellipse class="tm-aether-halo" cx="50" cy="${(top + 2).toFixed(1)}" rx="12" ry="3.2" fill="none" stroke="${CYAN}" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M 32 ${(headY - 2).toFixed(1)} Q 22 ${(top - 6).toFixed(1)} 30 ${(top - 10).toFixed(1)}" fill="none" stroke="${CYAN}" stroke-width="2.4" stroke-linecap="round"/>
${I4}<path d="M 68 ${(headY - 2).toFixed(1)} Q 78 ${(top - 6).toFixed(1)} 70 ${(top - 10).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>
${I4}<path d="M 42 ${(top + 4).toFixed(1)} L 50 ${(top - 8).toFixed(1)} L 58 ${(top + 4).toFixed(1)} L 50 ${(top - 1).toFixed(1)} Z" fill="${GOLD}" stroke="${WHITE}" stroke-width="0.6" opacity="0.95"/>
${I4}<circle cx="30" cy="${(top - 10).toFixed(1)}" r="2.4" fill="${CYAN}"/>
${I4}<circle cx="70" cy="${(top - 10).toFixed(1)}" r="2.4" fill="${GOLD}"/>
${I4}<circle cx="50" cy="${(top - 8).toFixed(1)}" r="2" fill="${WHITE}"/>
${starPoly(50, top - 14, 3.2, GOLD, 0.9)}`;
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
    baby: 'starseed cherub',
    evo1: 'nebula apostle',
    evo2: 'voidbound herald',
    evo3: 'Starveil Aether — MYTHICAL GOD',
    evo4: 'eclipse star-sovereign',
    evo5: 'primordial cosmos incarnate',
  };

  const bodyStops = stage === 'evo5'
    ? [['0%', '#fffde7'], ['18%', '#ffe082'], ['40%', '#e1bee7'], ['65%', '#b388ff'], ['100%', '#4a148c']]
    : stage === 'evo4'
      ? [['0%', '#ce93d8'], ['25%', '#7b1fa2'], ['55%', '#311b92'], ['80%', '#1a0033'], ['100%', '#050010']]
      : stage === 'evo3'
        ? [['0%', '#f3e5f5'], ['15%', '#b388ff'], ['40%', '#7c4dff'], ['70%', '#651fff'], ['100%', '#12002a']]
        : stage === 'evo2'
          ? [['0%', '#ede7f6'], ['35%', '#9575cd'], ['100%', '#5e35b1']]
          : stage === 'evo1'
            ? [['0%', '#f3e5f5'], ['40%', '#b39ddb'], ['100%', '#7e57c2']]
            : [['0%', '#fce4ec'], ['40%', '#ce93d8'], ['100%', '#ab47bc']];

  const stroke = stage === 'evo5' ? GOLD
    : stage === 'evo4' ? '#4a148c'
      : stage === 'evo3' ? '#311b92'
        : '#6a1b9a';
  const accent = stage === 'evo5' ? '#fff59d' : stage === 'evo4' ? '#ea80fc' : MAGENTA;
  const mythic = stage === 'evo3' || stage === 'evo4' || stage === 'evo5';
  const ancient = stage === 'evo5';
  const wingSize = stage === 'baby' ? 'sm' : stage === 'evo1' ? 'md' : stage === 'evo2' ? 'lg' : 'xl';
  const wingLayers = stage === 'baby' ? 1 : stage === 'evo1' ? 2 : 3;
  const crownTier = stage === 'baby' ? 1 : stage === 'evo1' || stage === 'evo2' ? 2 : 3;

  const defs = [
    grad(`${p}-body`, bodyStops, 'radial', 'cx="36%" cy="24%" r="82%"'),
    grad(`${p}-belly`, [['0%', WHITE], ['40%', '#e1bee7'], ['100%', '#7c4dff']], 'radial', 'cx="50%" cy="38%" r="62%"'),
    grad(`${p}-wing`, [['0%', WHITE, 0.98], ['25%', CYAN, 0.88], ['55%', '#b388ff', 0.82], ['85%', MAGENTA, 0.75], ['100%', '#311b92', 0.65]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-wing2`, [['0%', GOLD, 0.75], ['45%', MAGENTA, 0.55], ['100%', '#1a0033', 0.4]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-core`, [['0%', WHITE], ['18%', GOLD], ['45%', CYAN], ['75%', MAGENTA], ['100%', '#4a148c', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, ancient
      ? [['0%', WHITE], ['30%', GOLD], ['70%', '#ff6f00'], ['100%', '#4a148c']]
      : [['0%', '#e1f5fe'], ['30%', CYAN], ['65%', '#b388ff'], ['100%', VOID]], 'radial', 'cx="35%" cy="28%" r="68%"'),
    grad(`${p}-cheek`, [['0%', MAGENTA, 0.5], ['100%', MAGENTA, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', GOLD, mythic ? 0.55 : 0.32], ['25%', CYAN, 0.38], ['55%', MAGENTA, 0.28], ['100%', '#311b92', 0]], 'radial', 'cx="50%" cy="48%" r="58%"'),
    grad(`${p}-corona`, [['0%', WHITE, 0.65], ['30%', GOLD, 0.4], ['70%', CYAN, 0.2], ['100%', MAGENTA, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-tail`, [['0%', WHITE], ['25%', CYAN], ['55%', '#b388ff'], ['100%', '#1a0033']], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-void`, [['0%', '#4a148c', 0.15], ['50%', VOID, 0.35], ['100%', VOID, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    // shared halo paint reused via per-stage id still unique
    grad(`${p}-halo`, [['0%', GOLD, 0.9], ['100%', CYAN, 0.2]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const cfg = {
    baby: {
      shadowRx: 24, auraR: 38, bodyY: 64, bodyRx: 20, bodyRy: 17, headY: 36, headRx: 16.5, headRy: 14.5,
      eyeY: 34, eyeRx: 6.2, eyeRy: 7.4, mouthY: 46, mouthSize: 0.85, sparks: 8, orbit: false, coreR: 6.5,
    },
    evo1: {
      shadowRx: 26, auraR: 40, bodyY: 63, bodyRx: 22, bodyRy: 18.5, headY: 33, headRx: 17.5, headRy: 15.5,
      eyeY: 31, eyeRx: 6.8, eyeRy: 8, mouthY: 44, mouthSize: 0.92, sparks: 10, orbit: true, coreR: 7.2,
    },
    evo2: {
      shadowRx: 28, auraR: 42, bodyY: 62, bodyRx: 23.5, bodyRy: 19.5, headY: 31, headRx: 18.5, headRy: 16,
      eyeY: 29, eyeRx: 7.2, eyeRy: 8.5, mouthY: 43, mouthSize: 1, sparks: 12, orbit: true, coreR: 8,
    },
    evo3: {
      shadowRx: 32, auraR: 46, bodyY: 60, bodyRx: 25, bodyRy: 21, headY: 28, headRx: 20, headRy: 17,
      eyeY: 26, eyeRx: 7.8, eyeRy: 9.2, mouthY: 41, mouthSize: 1.1, sparks: 14, orbit: true, coreR: 9.5,
    },
    evo4: {
      shadowRx: 32, auraR: 46, bodyY: 60, bodyRx: 25.5, bodyRy: 21.5, headY: 28, headRx: 20, headRy: 17,
      eyeY: 26, eyeRx: 7.8, eyeRy: 9.2, mouthY: 41, mouthSize: 1.1, sparks: 13, orbit: true, coreR: 9.2,
    },
    evo5: {
      shadowRx: 34, auraR: 48, bodyY: 58, bodyRx: 26.5, bodyRy: 22, headY: 26, headRx: 21, headRy: 17.5,
      eyeY: 24, eyeRx: 8.2, eyeRy: 9.6, mouthY: 40, mouthSize: 1.15, sparks: 16, orbit: true, coreR: 10.5,
    },
  }[stage];

  const voidCape = mythic
    ? `${I3}<ellipse class="tm-aether-void-cape" cx="50" cy="${cfg.bodyY + 8}" rx="${cfg.bodyRx + 10}" ry="${cfg.bodyRy + 6}" fill="url(#${p}-void)" opacity="0.85"/>`
    : '';

  const body = `${shadow(cfg.shadowRx, mythic ? 0.32 : 0.22)}
${I3}<ellipse class="tm-aether-aura" cx="50" cy="48" rx="${cfg.auraR}" ry="${(cfg.auraR * 0.9).toFixed(1)}" fill="url(#${p}-aura)"/>
${I3}<ellipse class="tm-aether-corona" cx="50" cy="50" rx="${(cfg.auraR * 0.7).toFixed(1)}" ry="${(cfg.auraR * 0.64).toFixed(1)}" fill="url(#${p}-corona)" opacity="0.75"/>
${cfg.orbit ? sacredOrbits(cfg.auraR / 40, mythic) : ''}
${constellationField(cfg.sparks, mythic)}
${bladeWing('left', p, stroke, wingSize, wingLayers)}
${bladeWing('right', p, stroke, wingSize, wingLayers)}
${voidTail(p, stroke, mythic)}
${voidCape}
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="${cfg.bodyY}" rx="${cfg.bodyRx}" ry="${cfg.bodyRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.9"/>
${I4}<ellipse cx="38" cy="${cfg.bodyY - 7}" rx="8" ry="4.5" fill="${WHITE}" opacity="0.16"/>
${I4}<ellipse cx="50" cy="${cfg.bodyY + 3}" rx="${(cfg.bodyRx * 0.6).toFixed(1)}" ry="${(cfg.bodyRy * 0.65).toFixed(1)}" fill="url(#${p}-belly)" opacity="0.85"/>
${constellationVeins(cfg.bodyY, cfg.bodyRx, cfg.bodyRy)}
${sacredCore(50, cfg.bodyY, cfg.coreR, p, mythic)}
${I4}<ellipse cx="50" cy="${cfg.headY}" rx="${cfg.headRx}" ry="${cfg.headRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<ellipse cx="40" cy="${cfg.headY - 4}" rx="6.5" ry="3.5" fill="${WHITE}" opacity="0.15"/>
${crownOfStars(cfg.headY, cfg.headRy, crownTier).replace(/url\(#aether-shared-halo\)/g, `url(#${p}-halo)`)}
${I4}<circle cx="34" cy="${cfg.headY + 6}" r="3.6" fill="url(#${p}-cheek)"/>
${I4}<circle cx="66" cy="${cfg.headY + 6}" r="3.6" fill="url(#${p}-cheek)"/>
${mythic ? `${I4}<path d="M 42 ${(cfg.headY + cfg.headRy - 2).toFixed(1)} Q 50 ${(cfg.headY + cfg.headRy + 2).toFixed(1)} 58 ${(cfg.headY + cfg.headRy - 2).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="0.7" opacity="0.4"/>` : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="25" cy="${cfg.bodyY}" rx="5.8" ry="9" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.35" transform="rotate(-24 25 ${cfg.bodyY})"/>
${I4}<circle cx="18" cy="${cfg.bodyY + 10}" r="2.4" fill="${CYAN}" opacity="0.8"/>
${mythic ? starPoly(16, cfg.bodyY + 14, 2, GOLD, 0.65) : ''}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="75" cy="${cfg.bodyY}" rx="5.8" ry="9" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.35" transform="rotate(24 75 ${cfg.bodyY})"/>
${I4}<circle cx="82" cy="${cfg.bodyY + 10}" r="2.4" fill="${GOLD}" opacity="0.8"/>
${mythic ? starPoly(84, cfg.bodyY + 14, 2, CYAN, 0.65) : ''}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="86" rx="6.4" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.45"/>
${I4}<path d="M 34 88 L 28 95 M 40 90 L 40 97 M 46 88 L 50 95" stroke="${accent}" stroke-width="1.35" stroke-linecap="round"/>
${I4}<circle cx="28" cy="95" r="1.2" fill="${CYAN}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="86" rx="6.4" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.45"/>
${I4}<path d="M 54 88 L 50 95 M 60 90 L 60 97 M 66 88 L 72 95" stroke="${accent}" stroke-width="1.35" stroke-linecap="round"/>
${I4}<circle cx="72" cy="95" r="1.2" fill="${GOLD}" opacity="0.7"/>
${I3}</g>
${mythicEyes(40, 60, cfg.eyeY, cfg.eyeRx, cfg.eyeRy, `url(#${p}-iris)`, stroke, { mythic, ancient })}
${starSealMouth(cfg.mouthY, stroke, accent, cfg.mouthSize)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const aetherSvg = [
  `${I}<!-- AETHER CHARACTER - All Life Stages (dense cute epic · MYTHICAL BOSS v2) -->`,
  `${I}<!-- Primordial Cosmos • Mythical Rarity • Starveil Aether — reimagined -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(aetherStage),
].join('\n');
