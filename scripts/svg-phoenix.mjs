/**
 * Ashborn Phoenix — dense cute epic v3 (6 life stages)
 * Export for apply-cute-epic-svgs.mjs
 */

const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="30%" r="75%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Dragon-style big glossy eyes */
function glossyEyes(lx, rx, cy, rxEye, ryEye, iris, stroke, sclera = '#fff8e1') {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.5}" rx="${rxEye * 0.55}" ry="${ryEye * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.5}" rx="${rxEye * 0.55}" ry="${ryEye * 0.58}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.8}" rx="${rxEye * 0.28}" ry="${ryEye * 0.35}" fill="#1a0a00"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.8}" rx="${rxEye * 0.28}" ry="${ryEye * 0.35}" fill="#1a0a00"/>
${I4}<circle cx="${lx + 1.5}" cy="${cy - ryEye * 0.35}" r="${Math.max(1.2, rxEye * 0.28)}" fill="#fffde7"/>
${I4}<circle cx="${rx + 1.5}" cy="${cy - ryEye * 0.35}" r="${Math.max(1.2, rxEye * 0.28)}" fill="#fffde7"/>
${I4}<circle cx="${lx - rxEye * 0.35}" cy="${cy + ryEye * 0.35}" r="${Math.max(0.6, rxEye * 0.12)}" fill="#ffecb3" opacity="0.75"/>
${I4}<circle cx="${rx - rxEye * 0.35}" cy="${cy + ryEye * 0.35}" r="${Math.max(0.6, rxEye * 0.12)}" fill="#ffecb3" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxEye} ${cy} Q ${lx} ${cy - 3} ${lx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxEye} ${cy} Q ${rx} ${cy - 3} ${rx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function beakMouths(y, stroke, fill = '#ff6d00') {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - 4} ${y} Q 50 ${y + 4} ${50 + 4} ${y}" stroke="${stroke}" stroke-width="1.9" fill="${fill}" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - 4} ${y + 2} Q 50 ${y - 2} ${50 + 4} ${y + 2}" stroke="${stroke}" stroke-width="1.9" fill="${fill}" stroke-linecap="round"/>`;
}

function shadow(cy = 92, rx = 26, opacity = 0.2) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="5" fill="#1a1a1a" opacity="${opacity}"/>`;
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
    baby: 'fluffy ember chick',
    evo1: 'flame fledgling',
    evo2: 'solar youth',
    evo3: 'Ashborn Phoenix',
    evo4: 'crimson ash elder',
    evo5: 'immortal ashborn',
  };

  const plumage = stage === 'evo5'
    ? [['0%', '#fffde7'], ['30%', '#fff8e1'], ['55%', '#ffecb3'], ['80%', '#ffcc80'], ['100%', '#ff8a65']]
    : stage === 'evo4'
      ? [['0%', '#ff8a65'], ['25%', '#d84315'], ['50%', '#5d4037'], ['75%', '#bf360c'], ['100%', '#3e2723']]
      : stage === 'evo3'
        ? [['0%', '#ffe082'], ['25%', '#ff6d00'], ['55%', '#e65100'], ['100%', '#bf360c']]
        : stage === 'evo2'
          ? [['0%', '#fff176'], ['35%', '#ff9100'], ['100%', '#e64a19']]
          : stage === 'evo1'
            ? [['0%', '#fff59d'], ['40%', '#ff9800'], ['100%', '#ef6c00']]
            : [['0%', '#fff9c4'], ['35%', '#ffb74d'], ['100%', '#ff7043']];

  const stroke = stage === 'evo5' ? '#ff8f00' : stage === 'evo4' ? '#4e342e' : '#bf360c';
  const accent = stage === 'evo5' ? '#ffd54f' : stage === 'evo4' ? '#ffab40' : '#ffea00';
  const flame = stage === 'evo5' ? '#fff9c4' : stage === 'evo4' ? '#ff5722' : '#ff6d00';

  const defs = [
    grad(`${p}-body`, plumage, 'radial', 'cx="38%" cy="28%" r="78%"'),
    grad(`${p}-belly`, [['0%', '#fffde7'], ['60%', '#ffe082'], ['100%', '#ffcc80']], 'radial', 'cx="50%" cy="38%" r="62%"'),
    grad(`${p}-wing`, stage === 'evo5'
      ? [['0%', '#fffde7', 0.95], ['40%', '#ffecb3', 0.9], ['100%', '#ffab40', 0.8]]
      : [['0%', accent, 0.95], ['45%', flame, 0.9], ['100%', '#bf360c', 0.85]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#fffde7'], ['35%', accent], ['100%', '#ff3d00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, stage === 'evo5'
      ? [['0%', '#fff9c4'], ['45%', '#ffb300'], ['100%', '#e65100']]
      : [['0%', '#ffecb3'], ['50%', '#ff6d00'], ['100%', '#bf360c']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-cheek`, [['0%', '#ff8a80', 0.5], ['100%', '#ff8a80', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', stage === 'evo5' ? '#fff59d' : flame, stage === 'evo5' ? 0.45 : 0.32], ['100%', flame, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    ...(stage === 'evo4' ? [grad(`${p}-ash`, [['0%', '#78909c', 0.7], ['100%', '#37474f', 0.3]], 'radial', 'cx="50%" cy="50%" r="50%')] : []),
  ].join('\n');

  // ── BABY: round fluffy ember chick ──
  if (stage === 'baby') {
    const body = `${shadow(90, 24, 0.18)}
${I3}<ellipse cx="50" cy="54" rx="36" ry="34" fill="url(#${p}-aura)" opacity="0.65"/>
${I3}<g class="tm-animate-tail">
${I4}<ellipse cx="68" cy="72" rx="8" ry="6" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<ellipse cx="74" cy="68" rx="5" ry="4" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.9" opacity="0.85"/>
${I4}<circle cx="78" cy="66" r="2.5" fill="${accent}" opacity="0.7"/>
${I4}<circle cx="77" cy="65" r="0.9" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="26" cy="58" rx="7" ry="10" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.1" transform="rotate(-22 26 58)" opacity="0.9"/>
${I4}<path d="M 24 54 Q 20 58 24 62" stroke="${accent}" stroke-width="0.7" fill="none" opacity="0.55"/>
${I4}<circle cx="22" cy="56" r="1.2" fill="#fff" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="74" cy="58" rx="7" ry="10" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.1" transform="rotate(22 74 58)" opacity="0.9"/>
${I4}<path d="M 76 54 Q 80 58 76 62" stroke="${accent}" stroke-width="0.7" fill="none" opacity="0.55"/>
${I4}<circle cx="78" cy="56" r="1.2" fill="#fff" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Fluffy down layers -->
${I4}<ellipse cx="50" cy="66" rx="24" ry="20" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<ellipse cx="46" cy="58" rx="10" ry="6" fill="#fff" opacity="0.22"/>
${I4}<ellipse cx="50" cy="68" rx="15" ry="13" fill="url(#${p}-belly)"/>
${I4}<path d="M 42 64 Q 50 66 58 64" stroke="#ffe082" stroke-width="0.9" fill="none" opacity="0.65"/>
${I4}<circle cx="38" cy="62" r="1.5" fill="${stroke}" opacity="0.22"/>
${I4}<circle cx="44" cy="58" r="1.2" fill="${stroke}" opacity="0.18"/>
${I4}<circle cx="56" cy="58" r="1.2" fill="${stroke}" opacity="0.18"/>
${I4}<circle cx="62" cy="62" r="1.5" fill="${stroke}" opacity="0.22"/>
${I4}<circle cx="40" cy="72" r="1.1" fill="${stroke}" opacity="0.16"/>
${I4}<circle cx="60" cy="72" r="1.1" fill="${stroke}" opacity="0.16"/>
${I4}<circle cx="50" cy="66" r="7" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="66" r="3" fill="#fffde7" opacity="0.75"/>
${I4}<!-- Oversized chick head -->
${I4}<ellipse cx="50" cy="38" rx="18" ry="16" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<ellipse cx="42" cy="32" rx="7" ry="4" fill="#fff" opacity="0.2"/>
${I4}<!-- Down tufts -->
${I4}<ellipse cx="36" cy="34" rx="4" ry="6" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.9" transform="rotate(-18 36 34)"/>
${I4}<ellipse cx="64" cy="34" rx="4" ry="6" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="0.9" transform="rotate(18 64 34)"/>
${I4}<ellipse cx="50" cy="28" rx="3" ry="5" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.7"/>
${I4}<!-- Cheeks -->
${I4}<circle cx="34" cy="42" r="4" fill="url(#${p}-cheek)"/>
${I4}<circle cx="66" cy="42" r="4" fill="url(#${p}-cheek)"/>
${I4}<!-- Beak base -->
${I4}<path d="M 46 46 L 50 52 L 54 46 Z" fill="#ff8a50" stroke="${stroke}" stroke-width="0.8"/>
${I4}<circle cx="36" cy="50" r="1.6" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="64" cy="52" r="1.4" fill="${flame}" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="28" cy="64" rx="6" ry="8" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" transform="rotate(-20 28 64)"/>
${I4}<path d="M 24 70 L 22 74 M 26 71 L 25 75 M 28 70 L 30 74" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="72" cy="64" rx="6" ry="8" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" transform="rotate(20 72 64)"/>
${I4}<path d="M 72 70 L 70 74 M 74 71 L 75 75 M 76 70 L 78 74" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="84" rx="6" ry="4" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 36 86 L 34 89 M 40 87 L 40 90 M 44 86 L 46 89" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="84" rx="6" ry="4" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 54 86 L 52 89 M 60 87 L 60 90 M 64 86 L 66 89" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${glossyEyes(41, 59, 36, 7, 8.5, `url(#${p}-iris)`, stroke)}
${beakMouths(48, stroke)}`;
    return wrapStage(stage, titles.baby, defs, body);
  }

  // ── EVO1: fledgling, longer flame tail/wings ──
  if (stage === 'evo1') {
    const body = `${shadow(92, 28, 0.2)}
${I3}<ellipse cx="50" cy="52" rx="38" ry="36" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 70 Q 76 82 84 66 Q 88 54 80 50 Q 72 54 64 70 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 68 72 Q 78 90 88 68" fill="url(#${p}-wing)" opacity="0.7" stroke="${flame}" stroke-width="0.9"/>
${I4}<path d="M 72 68 Q 82 84 90 62" fill="none" stroke="${accent}" stroke-width="1" opacity="0.55"/>
${I4}<circle cx="84" cy="58" r="2.5" fill="${accent}" opacity="0.75"/>
${I4}<circle cx="83" cy="57" r="1" fill="#fff" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 32 54 Q 14 44 10 58 Q 12 70 22 66 Q 28 60 32 56 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 24 52 Q 16 48 14 58" stroke="${accent}" stroke-width="0.85" fill="none" opacity="0.55"/>
${I4}<path d="M 20 58 Q 14 56 14 64" stroke="#ff8a65" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 18 62 Q 12 60 12 68" stroke="#ff3d00" stroke-width="0.65" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 68 54 Q 86 44 90 58 Q 88 70 78 66 Q 72 60 68 56 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 76 52 Q 84 48 86 58" stroke="${accent}" stroke-width="0.85" fill="none" opacity="0.55"/>
${I4}<path d="M 80 58 Q 86 56 86 64" stroke="#ff8a65" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 82 62 Q 88 60 88 68" stroke="#ff3d00" stroke-width="0.65" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="64" rx="22" ry="19" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<ellipse cx="44" cy="56" rx="8" ry="5" fill="#fff" opacity="0.18"/>
${I4}<ellipse cx="50" cy="66" rx="13" ry="11" fill="url(#${p}-belly)"/>
${I4}<path d="M 42 62 Q 50 64 58 62" stroke="#ffe082" stroke-width="0.85" fill="none" opacity="0.6"/>
${I4}<circle cx="50" cy="64" r="7.5" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="64" r="3.2" fill="#fffde7" opacity="0.7"/>
${I4}<ellipse cx="50" cy="36" rx="16" ry="14" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.7"/>
${I4}<path d="M 42 26 L 40 14 L 46 24 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 50 24 L 50 10 L 54 22 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 58 26 L 60 14 L 54 24 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 46 42 L 50 48 L 54 42 Z" fill="#ff8a50" stroke="${stroke}" stroke-width="0.75"/>
${I4}<circle cx="36" cy="52" r="1.7" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="64" cy="54" r="1.5" fill="${flame}" opacity="0.45"/>
${I4}<circle cx="42" cy="72" r="1.3" fill="#ff3d00" opacity="0.35"/>
${I4}<circle cx="58" cy="74" r="1.2" fill="${accent}" opacity="0.35"/>
${I4}<circle cx="34" cy="42" r="3.5" fill="url(#${p}-cheek)"/>
${I4}<circle cx="66" cy="42" r="3.5" fill="url(#${p}-cheek)"/>
${I4}<path d="M 48 24 Q 50 18 52 24" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="30" cy="62" rx="5.5" ry="9" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2" transform="rotate(-22 30 62)"/>
${I4}<path d="M 26 70 L 22 76 M 28 72 L 26 78 M 30 70 L 32 76" stroke="${flame}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="70" cy="62" rx="5.5" ry="9" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.2" transform="rotate(22 70 62)"/>
${I4}<path d="M 68 70 L 66 76 M 70 72 L 72 78 M 72 70 L 76 76" stroke="${flame}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 42 80 L 38 90" stroke="${flame}" stroke-width="2.4" stroke-linecap="round"/>
${I4}<path d="M 38 90 L 34 94 M 38 90 L 38 96 M 38 90 L 42 94" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 58 80 L 62 90" stroke="${flame}" stroke-width="2.4" stroke-linecap="round"/>
${I4}<path d="M 62 90 L 58 94 M 62 90 L 62 96 M 62 90 L 66 94" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${glossyEyes(42, 58, 34, 6, 7, `url(#${p}-iris)`, stroke)}
${beakMouths(44, stroke)}`;
    return wrapStage(stage, titles.evo1, defs, body);
  }

  // ── EVO2: teen dramatic wings ──
  if (stage === 'evo2') {
    const body = `${shadow(94, 32, 0.22)}
${I3}<ellipse cx="50" cy="50" rx="44" ry="42" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 50 Q 4 28 2 48 Q 4 68 18 64 Q 26 58 30 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<path d="M 16 40 Q 10 50 14 60" stroke="${accent}" stroke-width="1" fill="none" opacity="0.6"/>
${I4}<path d="M 12 48 Q 8 54 12 62" stroke="#ff8a65" stroke-width="0.85" fill="none" opacity="0.5"/>
${I4}<path d="M 10 56 Q 6 60 8 68" stroke="#ff3d00" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 6 34 L 2 28" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 10 32 L 8 26" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 50 Q 96 28 98 48 Q 96 68 82 64 Q 74 58 70 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.8"/>
${I4}<path d="M 84 40 Q 90 50 86 60" stroke="${accent}" stroke-width="1" fill="none" opacity="0.6"/>
${I4}<path d="M 88 48 Q 92 54 88 62" stroke="#ff8a65" stroke-width="0.85" fill="none" opacity="0.5"/>
${I4}<path d="M 90 56 Q 94 60 92 68" stroke="#ff3d00" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 94 34 L 98 28" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>
${I4}<path d="M 90 32 L 92 26" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 60 72 Q 74 92 86 64 Q 90 48 82 44 Q 72 50 60 72 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 66 74 Q 78 96 88 70" fill="url(#${p}-wing)" opacity="0.65" stroke="${flame}" stroke-width="0.9"/>
${I4}<path d="M 70 70 Q 82 88 92 66" fill="none" stroke="${accent}" stroke-width="1.1" opacity="0.55"/>
${I4}<circle cx="86" cy="58" r="2.8" fill="${accent}" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="62" rx="24" ry="20" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.1"/>
${I4}<ellipse cx="42" cy="54" rx="9" ry="5" fill="#fff" opacity="0.16"/>
${I4}<ellipse cx="50" cy="64" rx="14" ry="12" fill="url(#${p}-belly)"/>
${I4}<path d="M 40 60 Q 50 62 60 60" stroke="#ffe082" stroke-width="0.9" fill="none" opacity="0.55"/>
${I4}<circle cx="50" cy="62" r="8" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="62" r="3.5" fill="#fffde7" opacity="0.7"/>
${I4}<ellipse cx="50" cy="32" rx="17" ry="15" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.9"/>
${I4}<path d="M 40 22 L 36 8 L 44 20 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M 50 20 L 50 4 L 56 18 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M 60 22 L 64 8 L 56 20 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M 38 18 L 32 6 L 40 16 Z" fill="#ff8a65" opacity="0.75"/>
${I4}<path d="M 62 18 L 68 6 L 60 16 Z" fill="#ff8a65" opacity="0.75"/>
${I4}<path d="M 46 40 L 50 47 L 54 40 Z" fill="#ff8a50" stroke="${stroke}" stroke-width="0.8"/>
${I4}<circle cx="34" cy="48" r="1.8" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="66" cy="50" r="1.6" fill="${flame}" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="28" cy="60" rx="6" ry="10" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" transform="rotate(-18 28 60)"/>
${I4}<path d="M 24 68 L 20 74 M 26 70 L 24 76 M 28 68 L 30 74" stroke="${flame}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="72" cy="60" rx="6" ry="10" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3" transform="rotate(18 72 60)"/>
${I4}<path d="M 70 68 L 68 74 M 72 70 L 74 76 M 74 68 L 78 74" stroke="${flame}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 40 80 L 36 92" stroke="${flame}" stroke-width="2.6" stroke-linecap="round"/>
${I4}<path d="M 36 92 L 32 96 M 36 92 L 36 98 M 36 92 L 40 96" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 60 80 L 64 92" stroke="${flame}" stroke-width="2.6" stroke-linecap="round"/>
${I4}<path d="M 64 92 L 60 96 M 64 92 L 64 98 M 64 92 L 68 96" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${glossyEyes(41, 59, 30, 5.5, 6.5, `url(#${p}-iris)`, stroke)}
${beakMouths(42, stroke)}`;
    return wrapStage(stage, titles.evo2, defs, body);
  }

  // ── EVO3: adult majestic solar crest, layered feathers ──
  if (stage === 'evo3') {
    const body = `${shadow(95, 36, 0.28)}
${I3}<ellipse cx="50" cy="48" rx="46" ry="44" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 24 48 Q 2 26 0 44 Q 2 62 14 58 Q 22 52 26 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2"/>
${I4}<path d="M 10 36 Q 6 44 10 52" stroke="${accent}" stroke-width="1.05" fill="none" opacity="0.55"/>
${I4}<path d="M 8 42 Q 4 48 8 56" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<path d="M 6 48 Q 2 52 4 60" stroke="#ff3d00" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<path d="M 14 50 Q 18 54 22 58" stroke="#ffe082" stroke-width="0.75" fill="none" opacity="0.35"/>
${I4}<path d="M 4 30 L 0 24" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 76 48 Q 98 26 100 44 Q 98 62 86 58 Q 78 52 74 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="2"/>
${I4}<path d="M 90 36 Q 94 44 90 52" stroke="${accent}" stroke-width="1.05" fill="none" opacity="0.55"/>
${I4}<path d="M 92 42 Q 96 48 92 56" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<path d="M 94 48 Q 98 52 96 60" stroke="#ff3d00" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<path d="M 86 50 Q 82 54 78 58" stroke="#ffe082" stroke-width="0.75" fill="none" opacity="0.35"/>
${I4}<path d="M 96 30 L 100 24" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 70 Q 72 94 88 62 Q 94 44 86 40 Q 74 46 58 70 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.7"/>
${I4}<path d="M 64 72 Q 76 98 90 68" fill="url(#${p}-wing)" opacity="0.6" stroke="${flame}" stroke-width="1"/>
${I4}<path d="M 68 68 Q 80 90 94 64" fill="none" stroke="${accent}" stroke-width="1.15" opacity="0.55"/>
${I4}<path d="M 72 64 Q 84 82 92 58" fill="none" stroke="#ff8a65" stroke-width="0.85" opacity="0.4"/>
${I4}<circle cx="88" cy="54" r="3" fill="${accent}" opacity="0.85"/>
${I4}<circle cx="87" cy="53" r="1.2" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="60" rx="26" ry="22" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.4"/>
${I4}<ellipse cx="40" cy="52" rx="10" ry="5.5" fill="#fff" opacity="0.14"/>
${I4}<ellipse cx="50" cy="62" rx="16" ry="14" fill="url(#${p}-belly)"/>
${I4}<path d="M 38 56 Q 50 58 62 56" stroke="#ffe082" stroke-width="1" fill="none" opacity="0.6"/>
${I4}<path d="M 36 62 Q 50 65 64 62" stroke="#ffe082" stroke-width="0.95" fill="none" opacity="0.55"/>
${I4}<path d="M 38 68 Q 50 71 62 68" stroke="#ffe082" stroke-width="0.9" fill="none" opacity="0.5"/>
${I4}<!-- Layered feather rows -->
${I4}<path d="M 44 50 L 42 56 L 46 56 Z" fill="#ff8a65" stroke="${stroke}" stroke-width="0.7"/>
${I4}<path d="M 50 48 L 48 54 L 52 54 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.7"/>
${I4}<path d="M 56 50 L 54 56 L 58 56 Z" fill="#ff8a65" stroke="${stroke}" stroke-width="0.7"/>
${I4}<circle cx="50" cy="60" r="9" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="60" r="4" fill="#fffde7" opacity="0.75"/>
${I4}<!-- Head + solar crest -->
${I4}<ellipse cx="50" cy="28" rx="19" ry="17" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.2"/>
${I4}<ellipse cx="42" cy="22" rx="8" ry="4.5" fill="#fff" opacity="0.14"/>
${I4}<path d="M 38 18 L 32 4 L 42 16 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 46 16 L 44 0 L 52 14 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 54 16 L 56 0 L 48 14 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 62 18 L 68 4 L 58 16 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.95"/>
${I4}<path d="M 34 14 L 28 2 L 36 12 Z" fill="#ff8a65" opacity="0.8"/>
${I4}<path d="M 66 14 L 72 2 L 64 12 Z" fill="#ff8a65" opacity="0.8"/>
${I4}<circle cx="50" cy="6" r="2" fill="#fffde7" opacity="0.7"/>
${I4}<path d="M 45 38 L 50 46 L 55 38 Z" fill="#ff8a50" stroke="${stroke}" stroke-width="0.85"/>
${I4}<circle cx="32" cy="44" r="2" fill="${accent}" opacity="0.55"/>
${I4}<circle cx="68" cy="46" r="1.8" fill="${flame}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="58" rx="7" ry="11" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5" transform="rotate(-16 26 58)"/>
${I4}<path d="M 22 68 L 18 74 M 24 70 L 22 76 M 26 68 L 28 74" stroke="${flame}" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="58" rx="7" ry="11" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5" transform="rotate(16 74 58)"/>
${I4}<path d="M 72 68 L 70 74 M 74 70 L 76 76 M 76 68 L 80 74" stroke="${flame}" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="88" rx="7.5" ry="5.5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.6"/>
${I4}<path d="M 32 90 L 28 95 M 37 91 L 37 96 M 42 91 L 42 96 M 46 90 L 50 95" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="88" rx="7.5" ry="5.5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.6"/>
${I4}<path d="M 54 90 L 50 95 M 59 91 L 59 96 M 64 91 L 64 96 M 68 90 L 72 95" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
${I3}</g>
${glossyEyes(40, 60, 26, 6, 7, `url(#${p}-iris)`, stroke)}
${beakMouths(40, stroke)}`;
    return wrapStage(stage, titles.evo3, defs, body);
  }

  // ── EVO4: crimson ash-mottled elder ──
  if (stage === 'evo4') {
    const body = `${shadow(96, 34, 0.26)}
${I3}<ellipse cx="50" cy="50" rx="42" ry="40" fill="url(#${p}-aura)" opacity="0.85"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 26 52 Q 8 38 6 54 Q 8 68 18 64 Q 24 58 28 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.7"/>
${I4}<path d="M 14 46 Q 10 52 14 60" stroke="#78909c" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<ellipse cx="12" cy="50" rx="4" ry="3" fill="url(#${p}-ash)" opacity="0.55"/>
${I4}<path d="M 20 52 Q 16 56 18 62" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 74 52 Q 92 38 94 54 Q 92 68 82 64 Q 76 58 72 54 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.7"/>
${I4}<path d="M 86 46 Q 90 52 86 60" stroke="#78909c" stroke-width="0.9" fill="none" opacity="0.45"/>
${I4}<ellipse cx="88" cy="50" rx="4" ry="3" fill="url(#${p}-ash)" opacity="0.55"/>
${I4}<path d="M 80 52 Q 84 56 82 62" stroke="${accent}" stroke-width="0.8" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 60 74 Q 74 90 86 68 Q 90 54 82 50 Q 70 58 60 74 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="84" cy="62" rx="5" ry="4" fill="url(#${p}-ash)" opacity="0.6"/>
${I4}<path d="M 66 76 Q 78 94 88 72" fill="none" stroke="#ff5722" stroke-width="0.9" opacity="0.45"/>
${I4}<circle cx="82" cy="58" r="2.2" fill="${accent}" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="62" rx="25" ry="21" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.2"/>
${I4}<ellipse cx="42" cy="54" rx="9" ry="5" fill="#fff" opacity="0.1"/>
${I4}<!-- Ash mottling -->
${I4}<ellipse cx="38" cy="60" rx="6" ry="5" fill="url(#${p}-ash)" opacity="0.5"/>
${I4}<ellipse cx="62" cy="64" rx="5" ry="4" fill="url(#${p}-ash)" opacity="0.45"/>
${I4}<ellipse cx="48" cy="70" rx="4" ry="3" fill="url(#${p}-ash)" opacity="0.4"/>
${I4}<ellipse cx="50" cy="64" rx="14" ry="12" fill="url(#${p}-belly)" opacity="0.85"/>
${I4}<circle cx="50" cy="62" r="8" fill="url(#${p}-core)" opacity="0.9"/>
${I4}<circle cx="50" cy="62" r="3.5" fill="#ffab40" opacity="0.65"/>
${I4}<ellipse cx="50" cy="30" rx="18" ry="16" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<ellipse cx="40" cy="58" rx="5" ry="3" fill="url(#${p}-ash)" opacity="0.35"/>
${I4}<path d="M 40 22 L 36 10 L 44 20 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 50 20 L 50 6 L 54 18 Z" fill="${accent}" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 60 22 L 64 10 L 56 20 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M 46 40 L 50 47 L 54 40 Z" fill="#d84315" stroke="${stroke}" stroke-width="0.8"/>
${I4}<circle cx="34" cy="48" r="1.5" fill="#78909c" opacity="0.5"/>
${I4}<circle cx="66" cy="50" r="1.4" fill="#78909c" opacity="0.45"/>
${I4}<circle cx="44" cy="74" r="1.2" fill="#ff5722" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="28" cy="60" rx="6" ry="10" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4" transform="rotate(-18 28 60)"/>
${I4}<ellipse cx="24" cy="66" rx="3" ry="2.5" fill="url(#${p}-ash)" opacity="0.45"/>
${I4}<path d="M 24 70 L 20 76 M 26 72 L 24 78" stroke="#5d4037" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="72" cy="60" rx="6" ry="10" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4" transform="rotate(18 72 60)"/>
${I4}<ellipse cx="76" cy="66" rx="3" ry="2.5" fill="url(#${p}-ash)" opacity="0.45"/>
${I4}<path d="M 74 70 L 76 76 M 72 72 L 74 78" stroke="#5d4037" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="88" rx="7" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 34 90 L 30 95 M 39 91 L 39 96 M 44 91 L 48 95" stroke="#4e342e" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="88" rx="7" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 52 90 L 48 95 M 57 91 L 57 96 M 62 91 L 66 95" stroke="#4e342e" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${glossyEyes(41, 59, 28, 5, 5.8, `url(#${p}-iris)`, stroke, '#fff3e0')}
${beakMouths(42, stroke, '#d84315')}`;
    return wrapStage(stage, titles.evo4, defs, body);
  }

  // ── EVO5: white-gold immortal with aura ──
  const body = `${shadow(98, 38, 0.22)}
${I3}<ellipse cx="50" cy="46" rx="48" ry="46" fill="url(#${p}-aura)"/>
${I3}<ellipse cx="50" cy="46" rx="40" ry="38" fill="none" stroke="#fff59d" stroke-width="1.2" opacity="0.35"/>
${I3}<ellipse cx="50" cy="46" rx="32" ry="30" fill="none" stroke="#ffecb3" stroke-width="0.8" opacity="0.25"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 22 46 Q 0 20 -2 42 Q 0 64 12 60 Q 20 54 24 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.9" opacity="0.95"/>
${I4}<path d="M 8 32 Q 4 40 8 50" stroke="#fffde7" stroke-width="1" fill="none" opacity="0.55"/>
${I4}<path d="M 6 40 Q 2 46 6 54" stroke="#ffecb3" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<circle cx="4" cy="36" r="1.5" fill="#fff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 78 46 Q 100 20 102 42 Q 100 64 88 60 Q 80 54 76 50 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.9" opacity="0.95"/>
${I4}<path d="M 92 32 Q 96 40 92 50" stroke="#fffde7" stroke-width="1" fill="none" opacity="0.55"/>
${I4}<path d="M 94 40 Q 98 46 94 54" stroke="#ffecb3" stroke-width="0.85" fill="none" opacity="0.45"/>
${I4}<circle cx="96" cy="36" r="1.5" fill="#fff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 68 Q 70 98 90 60 Q 96 38 86 34 Q 72 42 56 68 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.6" opacity="0.9"/>
${I4}<path d="M 62 70 Q 74 100 92 66" fill="url(#${p}-wing)" opacity="0.5" stroke="#fff9c4" stroke-width="0.9"/>
${I4}<path d="M 66 66 Q 78 92 94 62" fill="none" stroke="#fffde7" stroke-width="1.1" opacity="0.5"/>
${I4}<circle cx="90" cy="52" r="3.2" fill="#fff59d" opacity="0.9"/>
${I4}<circle cx="89" cy="51" r="1.3" fill="#fff" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="58" rx="24" ry="20" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.2"/>
${I4}<ellipse cx="42" cy="50" rx="10" ry="5.5" fill="#fff" opacity="0.28"/>
${I4}<ellipse cx="50" cy="60" rx="15" ry="13" fill="url(#${p}-belly)"/>
${I4}<path d="M 38 54 Q 50 56 62 54" stroke="#fff9c4" stroke-width="0.95" fill="none" opacity="0.55"/>
${I4}<circle cx="50" cy="58" r="9" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="58" r="4" fill="#fff" opacity="0.8"/>
${I4}<ellipse cx="50" cy="26" rx="18" ry="16" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<!-- Golden solar halo -->
${I4}<ellipse cx="50" cy="8" rx="16" ry="4" fill="none" stroke="#fff59d" stroke-width="1.3" opacity="0.55"/>
${I4}<path d="M 36 16 L 30 0 L 40 14 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M 44 14 L 42 -2 L 50 12 Z" fill="#fff59d" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M 56 14 L 58 -2 L 50 12 Z" fill="#fff59d" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M 64 16 L 70 0 L 60 14 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<circle cx="50" cy="-2" r="2.2" fill="#fffde7" opacity="0.85"/>
${I4}<circle cx="28" cy="38" r="2" fill="#fff" opacity="0.55"/>
${I4}<circle cx="72" cy="36" r="2" fill="#fff" opacity="0.5"/>
${I4}<path d="M 45 36 L 50 44 L 55 36 Z" fill="#ffcc80" stroke="${stroke}" stroke-width="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="56" rx="6.5" ry="10" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4" transform="rotate(-14 26 56)"/>
${I4}<path d="M 22 66 L 18 72 M 24 68 L 22 74" stroke="#ffab40" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="56" rx="6.5" ry="10" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.4" transform="rotate(14 74 56)"/>
${I4}<path d="M 74 66 L 76 72 M 72 68 L 74 74" stroke="#ffab40" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="86" rx="7" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5" opacity="0.9"/>
${I4}<path d="M 32 88 L 28 93 M 37 89 L 37 94 M 42 89 L 46 93" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="86" rx="7" ry="5" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.5" opacity="0.9"/>
${I4}<path d="M 54 88 L 50 93 M 59 89 L 59 94 M 64 89 L 68 93" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${glossyEyes(40, 60, 24, 5.5, 6.5, `url(#${p}-iris)`, stroke, '#fffde7')}
${beakMouths(38, stroke, '#ffcc80')}`;
  return wrapStage(stage, titles.evo5, defs, body);
}

export const phoenixSvg = [
  `${I}<!-- PHOENIX CHARACTER - All Life Stages (dense cute epic v3) -->`,
  `${I}<!-- Solar Flame • Legendary Rarity • Ashborn Phoenix -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  ...STAGES.map(phoenixStage),
].join('\n');
