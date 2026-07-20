/**
 * Starveil Aether — MYTHICAL boss mascot (6 life stages)
 * Cosmic void + gold star legendary Pokémon energy.
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

function grad(id, stops, type = 'radial', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = attrs
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="100%" y2="100%"' : 'cx="40%" cy="30%" r="75%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function cosmicEyes(lx, rx, cy, rxE, ryE, irisRef, stroke, {
  sclera = '#ede7f6', glow = '#e1f5fe', mythic = false,
} = {}) {
  const flare = mythic
    ? `${I4}<ellipse cx="${lx}" cy="${cy}" rx="${(rxE * 1.35).toFixed(1)}" ry="${(ryE * 1.25).toFixed(1)}" fill="#00e5ff" opacity="0.18"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${(rxE * 1.35).toFixed(1)}" ry="${(ryE * 1.25).toFixed(1)}" fill="#ffd740" opacity="0.16"/>`
    : '';
  return `${I3}<g class="tm-mascot-eye-open">
${flare}
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="${sclera}" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="${lx + 0.4}" cy="${cy + 0.3}" rx="${(rxE * 0.58).toFixed(1)}" ry="${(ryE * 0.62).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${rx + 0.4}" cy="${cy + 0.3}" rx="${(rxE * 0.58).toFixed(1)}" ry="${(ryE * 0.62).toFixed(1)}" fill="${irisRef}"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.6}" rx="${(rxE * 0.26).toFixed(1)}" ry="${(ryE * 0.4).toFixed(1)}" fill="#0a0018"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.6}" rx="${(rxE * 0.26).toFixed(1)}" ry="${(ryE * 0.4).toFixed(1)}" fill="#0a0018"/>
${I4}<circle cx="${(lx + 1.5).toFixed(1)}" cy="${(cy - ryE * 0.32).toFixed(1)}" r="${Math.max(1.3, rxE * 0.3).toFixed(1)}" fill="${glow}" opacity="0.95"/>
${I4}<circle cx="${(rx + 1.5).toFixed(1)}" cy="${(cy - ryE * 0.32).toFixed(1)}" r="${Math.max(1.3, rxE * 0.3).toFixed(1)}" fill="${glow}" opacity="0.95"/>
${I4}<circle cx="${(lx - rxE * 0.3).toFixed(1)}" cy="${(cy + ryE * 0.28).toFixed(1)}" r="${Math.max(0.7, rxE * 0.14).toFixed(1)}" fill="#00e5ff" opacity="0.75"/>
${I4}<circle cx="${(rx - rxE * 0.3).toFixed(1)}" cy="${(cy + ryE * 0.28).toFixed(1)}" r="${Math.max(0.7, rxE * 0.14).toFixed(1)}" fill="#ffd740" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3.2} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3.2} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function starMouth(y, stroke, fill = '#b388ff', size = 1) {
  const s = Number(size) || 1;
  const w = 3.4 * s;
  const d = 4.2 * s;
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${(50 - w).toFixed(1)} ${y} L 50 ${(y + d).toFixed(1)} L ${(50 + w).toFixed(1)} ${y} Q 50 ${(y + 1.6 * s).toFixed(1)} ${(50 - w).toFixed(1)} ${y}" fill="${fill}" stroke="${stroke}" stroke-width="1.35" stroke-linejoin="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${(50 - w - 0.6).toFixed(1)} ${y + 1} L 50 ${(y + d + 1).toFixed(1)} L ${(50 + w + 0.6).toFixed(1)} ${y + 1} Q 50 ${(y - 0.6).toFixed(1)} ${(50 - w - 0.6).toFixed(1)} ${y + 1}" fill="${fill}" stroke="${stroke}" stroke-width="1.35" stroke-linejoin="round"/>`;
}

function shadow(rx = 28, opacity = 0.22) {
  return `${I3}<ellipse cx="50" cy="96" rx="${rx}" ry="5.5" fill="#050018" opacity="${opacity}"/>`;
}

function starSparks(count = 8) {
  const pts = [
    [14, 22], [86, 20], [8, 44], [92, 46], [18, 68], [82, 70],
    [28, 14], [72, 12], [6, 58], [94, 56], [40, 10], [60, 8],
  ].slice(0, count);
  return pts.map(([x, y], i) => {
    const fill = i % 3 === 0 ? '#ffd740' : i % 3 === 1 ? '#00e5ff' : '#e040fb';
    const r = i % 4 === 0 ? 2.0 : i % 2 ? 1.15 : 1.5;
    return `${I3}<circle class="tm-aether-spark" cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${0.4 + (i % 5) * 0.1}"/>`;
  }).join('\n');
}

function orbitRing(rx, ry, stroke, opacity = 0.55) {
  return `${I3}<ellipse class="tm-aether-orbit" cx="50" cy="54" rx="${rx}" ry="${ry}" fill="none" stroke="${stroke}" stroke-width="1.4" opacity="${opacity}" stroke-dasharray="4 5"/>
${I3}<ellipse class="tm-aether-orbit" cx="50" cy="54" rx="${(rx * 0.78).toFixed(1)}" ry="${(ry * 0.72).toFixed(1)}" fill="none" stroke="#ffd740" stroke-width="0.9" opacity="${opacity * 0.7}" stroke-dasharray="2 6"/>`;
}

function etherealWing(side, p, accent, cyan, gold, size = 'md') {
  const flip = side === 'left' ? -1 : 1;
  const cx = side === 'left' ? 22 : 78;
  const cfg = size === 'lg'
    ? { rx: 11, ry: 18, tip: 16 }
    : size === 'sm'
      ? { rx: 7, ry: 11, tip: 10 }
      : { rx: 9, ry: 14, tip: 13 };
  const tipX = cx + flip * cfg.tip;
  const rot = flip * -32;
  return `${I3}<g class="tm-animate-wing-${side}">
${I4}<ellipse cx="${cx}" cy="56" rx="${cfg.rx}" ry="${cfg.ry}" fill="url(#${p}-wing)" stroke="${accent}" stroke-width="1.25" transform="rotate(${rot} ${cx} 56)" opacity="0.92"/>
${I4}<ellipse cx="${cx + flip * 2}" cy="52" rx="${(cfg.rx * 0.55).toFixed(1)}" ry="${(cfg.ry * 0.7).toFixed(1)}" fill="url(#${p}-wing2)" opacity="0.55" transform="rotate(${rot} ${cx} 56)"/>
${I4}<path d="M ${cx} 46 Q ${tipX} 40 ${cx + flip * 4} 62" stroke="${cyan}" stroke-width="0.9" fill="none" opacity="0.65"/>
${I4}<path d="M ${cx} 54 Q ${tipX + flip * 2} 50 ${cx + flip * 2} 68" stroke="${gold}" stroke-width="0.7" fill="none" opacity="0.5"/>
${I4}<circle cx="${tipX}" cy="42" r="1.6" fill="${gold}" opacity="0.75"/>
${I4}<circle cx="${cx + flip * 6}" cy="48" r="1.1" fill="${cyan}" opacity="0.7"/>
${I3}</g>`;
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
    baby: 'starseed spark',
    evo1: 'nebula fledgling',
    evo2: 'voidwalker teen',
    evo3: 'Starveil Aether — MYTHICAL',
    evo4: 'eclipse sovereign',
    evo5: 'primordial cosmos',
  };

  const bodyStops = stage === 'evo5'
    ? [['0%', '#fffde7'], ['25%', '#e1bee7'], ['55%', '#b388ff'], ['100%', '#7c4dff']]
    : stage === 'evo4'
      ? [['0%', '#ce93d8'], ['30%', '#7b1fa2'], ['60%', '#311b92'], ['100%', '#0a0018']]
      : stage === 'evo3'
        ? [['0%', '#e1bee7'], ['20%', '#b388ff'], ['50%', '#7c4dff'], ['75%', '#651fff'], ['100%', '#1a0033']]
        : stage === 'evo2'
          ? [['0%', '#d1c4e9'], ['40%', '#9575cd'], ['100%', '#5e35b1']]
          : stage === 'evo1'
            ? [['0%', '#ede7f6'], ['45%', '#b39ddb'], ['100%', '#7e57c2']]
            : [['0%', '#f3e5f5'], ['40%', '#ce93d8'], ['100%', '#ab47bc']];

  const stroke = stage === 'evo5' ? '#ffd740'
    : stage === 'evo4' ? '#4a148c'
      : stage === 'evo3' ? '#4a148c'
        : '#6a1b9a';
  const accent = stage === 'evo5' ? '#fff59d' : stage === 'evo4' ? '#ea80fc' : '#e040fb';
  const cyan = '#00e5ff';
  const gold = '#ffd740';
  const mythic = stage === 'evo3' || stage === 'evo4' || stage === 'evo5';
  const wingSize = stage === 'baby' ? 'sm' : (mythic ? 'lg' : 'md');

  const defs = [
    grad(`${p}-body`, bodyStops, 'radial', 'cx="38%" cy="28%" r="78%"'),
    grad(`${p}-belly`, [['0%', '#f3e5f5'], ['45%', '#b388ff'], ['100%', '#7c4dff']], 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(`${p}-wing`, [['0%', '#e1f5fe', 0.95], ['30%', cyan, 0.85], ['65%', '#b388ff', 0.8], ['100%', '#4a148c', 0.7]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-wing2`, [['0%', gold, 0.7], ['50%', '#e040fb', 0.55], ['100%', '#311b92', 0.4]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['20%', gold], ['50%', cyan], ['100%', '#7c4dff', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, stage === 'evo5'
      ? [['0%', '#fffde7'], ['40%', gold], ['100%', '#7c4dff']]
      : [['0%', '#e1f5fe'], ['35%', cyan], ['70%', '#b388ff'], ['100%', '#1a0033']], 'radial', 'cx="35%" cy="28%" r="68%"'),
    grad(`${p}-cheek`, [['0%', '#ea80fc', 0.45], ['100%', '#ea80fc', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', gold, mythic ? 0.45 : 0.28], ['35%', cyan, 0.32], ['70%', '#e040fb', 0.22], ['100%', '#4a148c', 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    grad(`${p}-corona`, [['0%', '#fff', 0.55], ['30%', gold, 0.35], ['100%', cyan, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-tail`, [['0%', '#e1f5fe'], ['30%', cyan], ['60%', '#b388ff'], ['100%', '#311b92']], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
  ].join('\n');

  const cfg = {
    baby: {
      shadowRx: 24, auraR: 36, bodyY: 64, bodyRx: 21, bodyRy: 18, headY: 36, headRx: 17, headRy: 15,
      eyeY: 34, eyeRx: 6.5, eyeRy: 7.8, mouthY: 46, mouthSize: 0.85, sparks: 6, orbit: false,
    },
    evo1: {
      shadowRx: 26, auraR: 38, bodyY: 64, bodyRx: 23, bodyRy: 19, headY: 34, headRx: 18, headRy: 16,
      eyeY: 32, eyeRx: 7, eyeRy: 8.2, mouthY: 45, mouthSize: 0.9, sparks: 8, orbit: false,
    },
    evo2: {
      shadowRx: 28, auraR: 40, bodyY: 62, bodyRx: 24, bodyRy: 20, headY: 32, headRx: 19, headRy: 16.5,
      eyeY: 30, eyeRx: 7.2, eyeRy: 8.5, mouthY: 44, mouthSize: 0.95, sparks: 9, orbit: true,
    },
    evo3: {
      shadowRx: 30, auraR: 42, bodyY: 62, bodyRx: 25, bodyRy: 21, headY: 30, headRx: 20, headRy: 17,
      eyeY: 28, eyeRx: 7.5, eyeRy: 9, mouthY: 43, mouthSize: 1.05, sparks: 11, orbit: true,
    },
    evo4: {
      shadowRx: 30, auraR: 42, bodyY: 62, bodyRx: 25, bodyRy: 21, headY: 30, headRx: 20, headRy: 17,
      eyeY: 28, eyeRx: 7.5, eyeRy: 9, mouthY: 43, mouthSize: 1.05, sparks: 10, orbit: true,
    },
    evo5: {
      shadowRx: 32, auraR: 44, bodyY: 60, bodyRx: 26, bodyRy: 22, headY: 28, headRx: 21, headRy: 17.5,
      eyeY: 26, eyeRx: 8, eyeRy: 9.5, mouthY: 42, mouthSize: 1.1, sparks: 12, orbit: true,
    },
  }[stage];

  const crest = mythic
    ? `${I4}<path d="M 50 ${(cfg.headY - cfg.headRy - 2).toFixed(1)} L 53 ${(cfg.headY - cfg.headRy + 6).toFixed(1)} L 58 ${(cfg.headY - cfg.headRy + 2).toFixed(1)} L 54 ${(cfg.headY - cfg.headRy + 8).toFixed(1)} L 56 ${(cfg.headY - cfg.headRy + 14).toFixed(1)} L 50 ${(cfg.headY - cfg.headRy + 10).toFixed(1)} L 44 ${(cfg.headY - cfg.headRy + 14).toFixed(1)} L 46 ${(cfg.headY - cfg.headRy + 8).toFixed(1)} L 42 ${(cfg.headY - cfg.headRy + 2).toFixed(1)} L 47 ${(cfg.headY - cfg.headRy + 6).toFixed(1)} Z" fill="${gold}" stroke="${stroke}" stroke-width="0.9" opacity="0.95"/>
${I4}<circle cx="50" cy="${(cfg.headY - cfg.headRy + 7).toFixed(1)}" r="2.2" fill="#fff" opacity="0.85"/>`
    : `${I4}<ellipse cx="50" cy="${(cfg.headY - cfg.headRy + 2).toFixed(1)}" rx="3.2" ry="5" fill="url(#${p}-wing)" stroke="${accent}" stroke-width="0.7"/>
${I4}<circle cx="50" cy="${(cfg.headY - cfg.headRy).toFixed(1)}" r="1.6" fill="${gold}" opacity="0.8"/>`;

  const horns = stage !== 'baby'
    ? `${I4}<path d="M 36 ${cfg.headY - 4} Q 28 ${cfg.headY - 16} 34 ${cfg.headY - 18}" fill="none" stroke="${cyan}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 64 ${cfg.headY - 4} Q 72 ${cfg.headY - 16} 66 ${cfg.headY - 18}" fill="none" stroke="${gold}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
${I4}<circle cx="34" cy="${cfg.headY - 18}" r="1.8" fill="${cyan}" opacity="0.9"/>
${I4}<circle cx="66" cy="${cfg.headY - 18}" r="1.8" fill="${gold}" opacity="0.9"/>`
    : '';

  const body = `${shadow(cfg.shadowRx, mythic ? 0.28 : 0.2)}
${I3}<ellipse class="tm-aether-aura" cx="50" cy="48" rx="${cfg.auraR}" ry="${(cfg.auraR * 0.92).toFixed(1)}" fill="url(#${p}-aura)"/>
${I3}<ellipse class="tm-aether-corona" cx="50" cy="52" rx="${(cfg.auraR * 0.72).toFixed(1)}" ry="${(cfg.auraR * 0.66).toFixed(1)}" fill="url(#${p}-corona)" opacity="0.7"/>
${cfg.orbit ? orbitRing(cfg.auraR + 2, cfg.auraR * 0.55, cyan, mythic ? 0.7 : 0.45) : ''}
${starSparks(cfg.sparks)}
${etherealWing('left', p, accent, cyan, gold, wingSize)}
${etherealWing('right', p, accent, cyan, gold, wingSize)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 70 Q 78 78 84 62 Q 76 70 68 66 Z" fill="url(#${p}-tail)" stroke="${accent}" stroke-width="1.1" opacity="0.9"/>
${I4}<path d="M 66 68 Q 80 74 86 58" stroke="${cyan}" stroke-width="0.8" fill="none" opacity="0.55"/>
${I4}<circle cx="84" cy="60" r="2.4" fill="${gold}" opacity="0.8"/>
${I4}<circle cx="78" cy="72" r="1.4" fill="${cyan}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="${cfg.bodyY}" rx="${cfg.bodyRx}" ry="${cfg.bodyRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<ellipse cx="38" cy="${cfg.bodyY - 6}" rx="8" ry="4.5" fill="#fff" opacity="0.14"/>
${I4}<ellipse cx="50" cy="${cfg.bodyY + 2}" rx="${(cfg.bodyRx * 0.62).toFixed(1)}" ry="${(cfg.bodyRy * 0.68).toFixed(1)}" fill="url(#${p}-belly)"/>
${I4}<circle cx="50" cy="${cfg.bodyY}" r="${mythic ? 9 : 7.2}" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="${cfg.bodyY}" r="${mythic ? 3.6 : 3}" fill="#fff" opacity="0.75"/>
${mythic ? `${I4}<circle cx="50" cy="${cfg.bodyY}" r="12" fill="none" stroke="${gold}" stroke-width="0.8" opacity="0.45" stroke-dasharray="2 3"/>` : ''}
${I4}<ellipse cx="50" cy="${cfg.headY}" rx="${cfg.headRx}" ry="${cfg.headRy}" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.7"/>
${I4}<ellipse cx="40" cy="${cfg.headY - 4}" rx="6.5" ry="3.5" fill="#fff" opacity="0.14"/>
${crest}
${horns}
${I4}<circle cx="34" cy="${cfg.headY + 6}" r="3.5" fill="url(#${p}-cheek)"/>
${I4}<circle cx="66" cy="${cfg.headY + 6}" r="3.5" fill="url(#${p}-cheek)"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="${cfg.bodyY - 2}" rx="5.5" ry="8.5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" transform="rotate(-22 26 ${cfg.bodyY - 2})"/>
${I4}<circle cx="20" cy="${cfg.bodyY + 8}" r="2.2" fill="${cyan}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="${cfg.bodyY - 2}" rx="5.5" ry="8.5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" transform="rotate(22 74 ${cfg.bodyY - 2})"/>
${I4}<circle cx="80" cy="${cfg.bodyY + 8}" r="2.2" fill="${gold}" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="86" rx="6.2" ry="4.8" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 35 88 L 30 94 M 40 90 L 40 96 M 45 88 L 48 94" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="86" rx="6.2" ry="4.8" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 55 88 L 52 94 M 60 90 L 60 96 M 65 88 L 70 94" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${cosmicEyes(40, 60, cfg.eyeY, cfg.eyeRx, cfg.eyeRy, `url(#${p}-iris)`, stroke, { mythic })}
${starMouth(cfg.mouthY, stroke, accent, cfg.mouthSize)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const aetherSvg = [
  `${I}<!-- AETHER CHARACTER - All Life Stages (dense cute epic · MYTHICAL BOSS) -->`,
  `${I}<!-- Cosmic Void & Starlight • Mythical Rarity • Starveil Aether -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(aetherStage),
].join('\n');
