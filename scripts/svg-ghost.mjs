/**
 * Veil Wraith — dense cute-epic ghost mascots (all life stages).
 * Exported for apply-cute-epic-svgs.mjs → myman_mascot.js
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

/** Dragon-style cartoony eyes: sclera + iris + pupil + dual highlights */
function epicEyes(lx, rx, cy, rxEye, ryEye, iris, stroke, sclera = '#faf8ff') {
  const irx = +(rxEye * 0.52).toFixed(1);
  const iry = +(ryEye * 0.56).toFixed(1);
  const prx = +(rxEye * 0.26).toFixed(1);
  const pry = +(ryEye * 0.34).toFixed(1);
  const hi = Math.max(1.3, rxEye * 0.3).toFixed(1);
  const hi2 = Math.max(0.7, rxEye * 0.14).toFixed(1);
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${lx + 0.6}" cy="${cy + 0.4}" rx="${irx}" ry="${iry}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.6}" cy="${cy + 0.4}" rx="${irx}" ry="${iry}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.6}" cy="${cy + 0.7}" rx="${prx}" ry="${pry}" fill="#060612"/>
${I4}<ellipse cx="${rx + 0.6}" cy="${cy + 0.7}" rx="${prx}" ry="${pry}" fill="#060612"/>
${I4}<circle cx="${lx + 2}" cy="${cy - ryEye * 0.32}" r="${hi}" fill="#fff" opacity="0.96"/>
${I4}<circle cx="${rx + 2}" cy="${cy - ryEye * 0.32}" r="${hi}" fill="#fff" opacity="0.96"/>
${I4}<circle cx="${lx - 0.8}" cy="${cy + 2.2}" r="${hi2}" fill="#e1bee7" opacity="0.6"/>
${I4}<circle cx="${rx - 0.8}" cy="${cy + 2.2}" r="${hi2}" fill="#e1bee7" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxEye} ${cy} Q ${lx} ${cy - 3.5} ${lx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxEye} ${cy} Q ${rx} ${cy - 3.5} ${rx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Crescent cartoony eyes (teen) — still sclera/iris/pupil/highlights */
function crescentEyes(lx, rx, cy, stroke, iris) {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<path d="M ${lx - 6} ${cy + 2} Q ${lx} ${cy - 8} ${lx + 6} ${cy + 2} Q ${lx} ${cy + 4} ${lx - 6} ${cy + 2}" fill="#faf8ff" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M ${rx - 6} ${cy + 2} Q ${rx} ${cy - 8} ${rx + 6} ${cy + 2} Q ${rx} ${cy + 4} ${rx - 6} ${cy + 2}" fill="#faf8ff" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy - 0.5}" rx="3.2" ry="3.8" fill="${iris}"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy - 0.5}" rx="3.2" ry="3.8" fill="${iris}"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy}" rx="1.6" ry="2.2" fill="#060612"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy}" rx="1.6" ry="2.2" fill="#060612"/>
${I4}<circle cx="${lx + 1.8}" cy="${cy - 2.8}" r="1.5" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${rx + 1.8}" cy="${cy - 2.8}" r="1.5" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${lx - 1.2}" cy="${cy + 0.5}" r="0.75" fill="#b39ddb" opacity="0.55"/>
${I4}<circle cx="${rx - 1.2}" cy="${cy + 0.5}" r="0.75" fill="#b39ddb" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - 5} ${cy} Q ${lx} ${cy - 2} ${lx + 5} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - 5} ${cy} Q ${rx} ${cy - 2} ${rx + 5} ${cy}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 7) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 5.5} ${50 + span} ${y}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

function shadow(cy = 92, rx = 24, op = 0.2) {
  return `${I3}<ellipse cx="50" cy="${cy}" rx="${rx}" ry="5" fill="#1a1a1a" opacity="${op}"/>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- GHOST ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-ghost" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/* ─── BABY: spectral droplet ─── */
function babyGhost() {
  const p = 'ghost-baby';
  const stroke = '#7e57c2';
  const accent = '#ce93d8';
  const defs = [
    grad(`${p}-body`, [['0%', '#f3e5f5'], ['35%', '#e1bee7'], ['70%', '#b39ddb'], ['100%', '#7e57c2']], 'radial', 'cx="45%" cy="25%" r="78%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['40%', '#e1bee7'], ['100%', '#9575cd', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ea80fc'], ['55%', '#7c4dff'], ['100%', '#1a237e']], 'radial', 'cx="38%" cy="28%" r="68%"'),
    grad(`${p}-blush`, [['0%', '#ff80ab', 0.5], ['100%', '#ff80ab', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-wisp`, [['0%', '#ede7f6', 0.9], ['100%', '#9575cd', 0.25]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-aura`, [['0%', '#ce93d8', 0.28], ['100%', '#ce93d8', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(90, 22, 0.18)}
${I3}<ellipse cx="50" cy="54" rx="36" ry="34" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 76 Q 68 84 72 74 Q 74 66 68 64 Q 62 68 58 76 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.9" opacity="0.75"/>
${I4}<circle cx="70" cy="68" r="1.8" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="66" cy="72" r="1.2" fill="#fff" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="26" cy="56" rx="5" ry="7" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1" transform="rotate(-22 26 56)" opacity="0.85"/>
${I4}<path d="M 24 52 Q 22 56 24 60" stroke="#fff" stroke-width="0.6" opacity="0.45" fill="none"/>
${I4}<circle cx="22" cy="58" r="1.1" fill="${accent}" opacity="0.3"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="74" cy="56" rx="5" ry="7" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1" transform="rotate(22 74 56)" opacity="0.85"/>
${I4}<path d="M 76 52 Q 78 56 76 60" stroke="#fff" stroke-width="0.6" opacity="0.45" fill="none"/>
${I4}<circle cx="78" cy="58" r="1.1" fill="${accent}" opacity="0.3"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 24 Q 66 30 70 46 Q 72 62 64 76 Q 50 88 36 76 Q 28 62 30 46 Q 34 30 50 24 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<ellipse cx="42" cy="38" rx="9" ry="6" fill="#fff" opacity="0.18"/>
${I4}<ellipse cx="50" cy="58" rx="12" ry="10" fill="url(#${p}-core)" opacity="0.7"/>
${I4}<circle cx="50" cy="58" r="5" fill="#fff" opacity="0.4"/>
${I4}<circle cx="34" cy="48" r="5" fill="url(#${p}-blush)"/>
${I4}<circle cx="66" cy="48" r="5" fill="url(#${p}-blush)"/>
${I4}<circle cx="38" cy="66" r="1.5" fill="${accent}" opacity="0.35"/>
${I4}<circle cx="62" cy="68" r="1.3" fill="#e1bee7" opacity="0.3"/>
${I4}<circle cx="44" cy="74" r="1.1" fill="${accent}" opacity="0.28"/>
${I4}<circle cx="56" cy="76" r="1" fill="#b39ddb" opacity="0.25"/>
${I4}<circle cx="48" cy="68" r="1.2" fill="#fff" opacity="0.22"/>
${I4}<circle cx="52" cy="70" r="1" fill="#e1bee7" opacity="0.2"/>
${I4}<path d="M 46 32 Q 50 30 54 32" stroke="#fff" stroke-width="0.7" fill="none" opacity="0.35"/>
${I4}<path d="M 38 52 Q 42 54 46 52" stroke="${stroke}" stroke-width="0.6" fill="none" opacity="0.25"/>
${I4}<path d="M 54 52 Q 58 54 62 52" stroke="${stroke}" stroke-width="0.6" fill="none" opacity="0.25"/>
${I4}<ellipse cx="50" cy="46" rx="6" ry="4" fill="#fff" opacity="0.08"/>
${I4}<circle cx="32" cy="58" r="1.4" fill="${accent}" opacity="0.22"/>
${I4}<circle cx="68" cy="60" r="1.2" fill="#b39ddb" opacity="0.2"/>
${I4}<path d="M 40 82 Q 38 88 42 90" stroke="url(#${p}-wisp)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.65"/>
${I4}<path d="M 50 84 Q 50 92 52 94" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 60 82 Q 62 88 58 90" stroke="url(#${p}-wisp)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="28" cy="58" rx="5.5" ry="7" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<ellipse cx="26" cy="54" rx="2" ry="1.5" fill="#fff" opacity="0.22"/>
${I4}<path d="M 24 64 L 22 67 M 26 65 L 25 68 M 28 64 L 29 67" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="72" cy="58" rx="5.5" ry="7" fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.3"/>
${I4}<ellipse cx="74" cy="54" rx="2" ry="1.5" fill="#fff" opacity="0.22"/>
${I4}<path d="M 70 64 L 70 67 M 73 65 L 74 68 M 76 64 L 78 67" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="86" rx="5.5" ry="3.5" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1" opacity="0.8"/>
${I4}<circle cx="38" cy="88" r="0.9" fill="#fff" opacity="0.25"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="86" rx="5.5" ry="3.5" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1" opacity="0.8"/>
${I4}<circle cx="62" cy="88" r="0.9" fill="#fff" opacity="0.25"/>
${I3}</g>
${epicEyes(40, 60, 40, 7.5, 9, `url(#${p}-iris)`, stroke)}
${mouths(52, stroke, 6)}`;

  return wrapStage('baby', 'spectral droplet', defs, body);
}

/* ─── EVO1 KID: sheet ghost ─── */
function evo1Ghost() {
  const p = 'ghost-kid';
  const stroke = '#6a1b9a';
  const accent = '#b39ddb';
  const defs = [
    grad(`${p}-body`, [['0%', '#ede7f6'], ['30%', '#d1c4e9'], ['65%', '#9575cd'], ['100%', '#512da8']], 'radial', 'cx="42%" cy="22%" r="80%"'),
    grad(`${p}-core`, [['0%', '#fff'], ['45%', '#ce93d8'], ['100%', '#311b92', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#e040fb'], ['50%', '#7e57c2'], ['100%', '#1a237e']], 'radial', 'cx="36%" cy="30%" r="65%"'),
    grad(`${p}-wisp`, [['0%', '#e1bee7', 0.85], ['100%', '#4527a0', 0.2]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-aura`, [['0%', '#b39ddb', 0.32], ['100%', '#b39ddb', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(94, 28, 0.22)}
${I3}<ellipse cx="50" cy="52" rx="42" ry="40" fill="url(#${p}-aura)"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 80 Q 70 96 82 78 Q 88 64 78 58 Q 66 62 56 80 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="1" opacity="0.8"/>
${I4}<path d="M 68 74 Q 78 82 80 70" stroke="#e1bee7" stroke-width="0.8" fill="none" opacity="0.5"/>
${I4}<path d="M 72 68 Q 82 72 84 62" stroke="#ce93d8" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<circle cx="80" cy="60" r="2.2" fill="${accent}" opacity="0.55"/>
${I4}<circle cx="76" cy="66" r="1.5" fill="#fff" opacity="0.35"/>
${I4}<circle cx="84" cy="72" r="1.3" fill="#e1bee7" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 26 52 Q 12 44 10 58 Q 12 70 22 62 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.95" opacity="0.82"/>
${I4}<path d="M 16 50 Q 12 54 14 60" stroke="#fff" stroke-width="0.65" fill="none" opacity="0.4"/>
${I4}<circle cx="14" cy="56" r="1.2" fill="${accent}" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 74 52 Q 88 44 90 58 Q 88 70 78 62 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.95" opacity="0.82"/>
${I4}<path d="M 84 50 Q 88 54 86 60" stroke="#fff" stroke-width="0.65" fill="none" opacity="0.4"/>
${I4}<circle cx="86" cy="56" r="1.2" fill="${accent}" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 26 56 Q 22 32 38 20 Q 50 12 62 20 Q 78 32 74 56 Q 72 76 62 88 Q 50 96 38 88 Q 28 76 26 56 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.2" opacity="0.93"/>
${I4}<ellipse cx="42" cy="34" rx="10" ry="6" fill="#fff" opacity="0.15"/>
${I4}<circle cx="50" cy="56" r="10" fill="url(#${p}-core)" opacity="0.8"/>
${I4}<circle cx="50" cy="56" r="4.5" fill="#fff" opacity="0.42"/>
${I4}<circle cx="36" cy="62" r="2" fill="${accent}" opacity="0.38"/>
${I4}<circle cx="64" cy="64" r="1.7" fill="#e1bee7" opacity="0.32"/>
${I4}<circle cx="42" cy="74" r="1.4" fill="${accent}" opacity="0.28"/>
${I4}<circle cx="58" cy="76" r="1.2" fill="#b39ddb" opacity="0.25"/>
${I4}<path d="M 34 88 Q 32 96 38 98" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<path d="M 44 90 Q 42 100 48 102" stroke="url(#${p}-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.75"/>
${I4}<path d="M 50 92 Q 50 102 54 104" stroke="url(#${p}-wisp)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.78"/>
${I4}<path d="M 56 90 Q 58 100 52 102" stroke="url(#${p}-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.75"/>
${I4}<path d="M 66 88 Q 68 96 62 98" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<path d="M 36 52 Q 50 48 64 52" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.3"/>
${I4}<path d="M 32 64 Q 36 66 40 64" stroke="${stroke}" stroke-width="0.7" fill="none" opacity="0.28"/>
${I4}<path d="M 60 64 Q 64 66 68 64" stroke="${stroke}" stroke-width="0.7" fill="none" opacity="0.28"/>
${I4}<circle cx="46" cy="70" r="1.3" fill="#fff" opacity="0.2"/>
${I4}<circle cx="54" cy="72" r="1.1" fill="#e1bee7" opacity="0.18"/>
${I4}<circle cx="30" cy="70" r="1.5" fill="${accent}" opacity="0.25"/>
${I4}<circle cx="70" cy="72" r="1.3" fill="${accent}" opacity="0.22"/>
${I4}<ellipse cx="50" cy="44" rx="8" ry="5" fill="#fff" opacity="0.07"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 28 58 Q 12 62 8 50 Q 6 42 14 44" fill="none" stroke="url(#${p}-body)" stroke-width="5.5" stroke-linecap="round" opacity="0.9"/>
${I4}<path d="M 10 44 L 4 38 M 10 46 L 2 46 M 12 48 L 6 52" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 58 Q 88 62 92 50 Q 94 42 86 44" fill="none" stroke="url(#${p}-body)" stroke-width="5.5" stroke-linecap="round" opacity="0.9"/>
${I4}<path d="M 90 44 L 96 38 M 90 46 L 98 46 M 88 48 L 94 52" stroke="${accent}" stroke-width="1.4" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="92" rx="6.5" ry="4" fill="url(#${p}-wisp)" opacity="0.75"/>
${I4}<circle cx="36" cy="93" r="1" fill="#fff" opacity="0.22"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="92" rx="6.5" ry="4" fill="url(#${p}-wisp)" opacity="0.75"/>
${I4}<circle cx="64" cy="93" r="1" fill="#fff" opacity="0.22"/>
${I3}</g>
${epicEyes(40, 60, 38, 6.8, 8, `url(#${p}-iris)`, stroke)}
${mouths(50, stroke, 7)}`;

  return wrapStage('evo1', 'sheet wraith', defs, body);
}

/* ─── EVO2 TEEN: veiled stalker ─── */
function evo2Ghost() {
  const p = 'ghost-teen';
  const stroke = '#4527a0';
  const accent = '#9575cd';
  const defs = [
    grad(`${p}-body`, [['0%', '#d1c4e9'], ['40%', '#9575cd'], ['100%', '#311b92']], 'radial', 'cx="40%" cy="20%" r="82%"'),
    grad(`${p}-veil`, [['0%', '#1a237e', 0.7], ['100%', '#0d0221', 0.85]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-iris`, [['0%', '#b388ff'], ['50%', '#651fff'], ['100%', '#120338']], 'radial', 'cx="35%" cy="28%" r="68%"'),
    grad(`${p}-wisp`, [['0%', '#b39ddb', 0.88], ['100%', '#311b92', 0.15]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [['0%', '#7c4dff', 0.6], ['100%', '#120338', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${shadow(95, 30, 0.24)}
${I3}<ellipse cx="50" cy="50" rx="44" ry="42" fill="url(#${p}-core)" opacity="0.35"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 54 82 Q 66 98 80 84 Q 86 72 76 66 Q 64 70 54 82 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="1" opacity="0.78"/>
${I4}<path d="M 64 78 Q 74 88 78 76" stroke="#ce93d8" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<circle cx="78" cy="70" r="2" fill="${accent}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 24 50 Q 6 38 4 54 Q 6 72 20 64 Q 26 58 28 52 Z" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1.1" opacity="0.85"/>
${I4}<path d="M 12 48 Q 8 56 14 62" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<path d="M 8 52 L 4 48" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<circle cx="10" cy="58" r="1.1" fill="${accent}" opacity="0.32"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 76 50 Q 94 38 96 54 Q 94 72 80 64 Q 74 58 72 52 Z" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1.1" opacity="0.85"/>
${I4}<path d="M 88 48 Q 92 56 86 62" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<path d="M 92 52 L 96 48" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
${I4}<circle cx="90" cy="58" r="1.1" fill="${accent}" opacity="0.32"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 24 58 Q 20 34 36 22 Q 50 14 64 22 Q 80 34 76 58 Q 74 78 62 90 Q 50 98 38 90 Q 26 78 24 58 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.3" opacity="0.92"/>
${I4}<path d="M 30 38 Q 50 18 70 38 Q 68 32 50 26 Q 32 32 30 38 Z" fill="url(#${p}-veil)" stroke="${stroke}" stroke-width="1.2"/>
${I4}<path d="M 36 34 Q 50 24 64 34" stroke="#b39ddb" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<ellipse cx="42" cy="32" rx="7" ry="4" fill="#fff" opacity="0.1"/>
${I4}<circle cx="50" cy="58" r="8" fill="url(#${p}-core)" opacity="0.75"/>
${I4}<circle cx="50" cy="58" r="3.5" fill="#651fff" opacity="0.45"/>
${I4}<circle cx="34" cy="64" r="1.8" fill="${accent}" opacity="0.35"/>
${I4}<circle cx="66" cy="66" r="1.5" fill="#e1bee7" opacity="0.3"/>
${I4}<path d="M 32 88 Q 30 98 36 100" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 42 92 Q 40 102 46 104" stroke="url(#${p}-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<path d="M 50 94 Q 50 104 54 106" stroke="url(#${p}-wisp)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.75"/>
${I4}<path d="M 58 92 Q 60 102 54 104" stroke="url(#${p}-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<path d="M 68 88 Q 70 98 64 100" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 34 46 Q 50 42 66 46" stroke="#b39ddb" stroke-width="0.75" fill="none" opacity="0.35"/>
${I4}<path d="M 38 52 Q 42 54 46 52" stroke="${stroke}" stroke-width="0.65" fill="none" opacity="0.3"/>
${I4}<path d="M 54 52 Q 58 54 62 52" stroke="${stroke}" stroke-width="0.65" fill="none" opacity="0.3"/>
${I4}<circle cx="48" cy="64" r="1.4" fill="#651fff" opacity="0.35"/>
${I4}<circle cx="52" cy="66" r="1.2" fill="#fff" opacity="0.2"/>
${I4}<circle cx="30" cy="62" r="1.3" fill="${accent}" opacity="0.28"/>
${I4}<circle cx="70" cy="64" r="1.1" fill="${accent}" opacity="0.25"/>
${I4}<path d="M 44 30 L 46 34 M 54 30 L 52 34" stroke="#9575cd" stroke-width="0.7" opacity="0.4"/>
${I4}<circle cx="50" cy="50" r="1.3" fill="#fff" opacity="0.18"/>
${I4}<path d="M 42 60 Q 46 62 50 60" stroke="${accent}" stroke-width="0.6" fill="none" opacity="0.3"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 26 58 Q 10 64 6 50 Q 4 42 12 44" fill="none" stroke="url(#${p}-body)" stroke-width="5" stroke-linecap="round" opacity="0.88"/>
${I4}<path d="M 8 44 L 2 38 M 8 46 L 0 46 M 10 48 L 4 52" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 74 58 Q 90 64 94 50 Q 96 42 88 44" fill="none" stroke="url(#${p}-body)" stroke-width="5" stroke-linecap="round" opacity="0.88"/>
${I4}<path d="M 92 44 L 98 38 M 92 46 L 100 46 M 90 48 L 96 52" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="94" rx="6" ry="3.8" fill="url(#${p}-wisp)" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="94" rx="6" ry="3.8" fill="url(#${p}-wisp)" opacity="0.7"/>
${I3}</g>
${crescentEyes(41, 59, 36, stroke, `url(#${p}-iris)`)}
${mouths(48, stroke, 6)}`;

  return wrapStage('evo2', 'veiled stalker', defs, body);
}

/* ─── EVO3 ADULT: Veil Wraith ─── */
function evo3Ghost() {
  const p = 'ghost-adult';
  const stroke = '#120338';
  const accent = '#7c4dff';
  const defs = [
    grad(`${p}-cloak`, [['0%', '#4a148c'], ['35%', '#311b92'], ['70%', '#1a237e'], ['100%', '#0d0221']], 'radial', 'cx="45%" cy="25%" r="85%"'),
    grad(`${p}-void`, [['0%', '#1a0033'], ['40%', '#0a0018'], ['100%', '#000000']], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-void-glow`, [['0%', '#b388ff', 0.85], ['45%', '#651fff', 0.5], ['100%', '#120338', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#e1bee7'], ['40%', '#ea80fc'], ['70%', '#651fff'], ['100%', '#120338']], 'radial', 'cx="32%" cy="28%" r="70%"'),
    grad(`${p}-wisp`, [['0%', '#9575cd', 0.9], ['100%', '#1a237e', 0.1]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-claw`, [['0%', '#d1c4e9'], ['100%', '#4527a0']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(96, 34, 0.28)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 8 48 Q 2 58 6 68 Q 10 74 16 70 Q 14 60 8 48 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.9" opacity="0.65"/>
${I4}<path d="M 92 48 Q 98 58 94 68 Q 90 74 84 70 Q 86 60 92 48 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.9" opacity="0.65"/>
${I4}<path d="M 10 56 Q 6 62 10 68" stroke="#ce93d8" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<path d="M 90 56 Q 94 62 90 68" stroke="#ce93d8" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<circle cx="8" cy="62" r="1.8" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="92" cy="62" r="1.8" fill="${accent}" opacity="0.5"/>
${I4}<circle cx="12" cy="66" r="1.2" fill="#e1bee7" opacity="0.4"/>
${I4}<circle cx="88" cy="66" r="1.2" fill="#e1bee7" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 22 48 Q 10 36 6 52 Q 8 68 18 62 Q 24 56 22 48 Z" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1.2" opacity="0.8"/>
${I4}<path d="M 14 50 Q 10 56 12 62" stroke="#b39ddb" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 10 54 Q 6 60 10 66" stroke="#9575cd" stroke-width="0.65" fill="none" opacity="0.35"/>
${I4}<path d="M 8 54 L 4 50" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 78 48 Q 90 36 94 52 Q 92 68 82 62 Q 76 56 78 48 Z" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1.2" opacity="0.8"/>
${I4}<path d="M 86 50 Q 90 56 88 62" stroke="#b39ddb" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 90 54 Q 94 60 90 66" stroke="#9575cd" stroke-width="0.65" fill="none" opacity="0.35"/>
${I4}<path d="M 92 54 L 96 50" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 20 54 L 14 94 Q 18 98 28 96 L 34 58 Z" fill="url(#${p}-cloak)" stroke="${stroke}" stroke-width="1.6"/>
${I4}<path d="M 80 54 L 86 94 Q 82 98 72 96 L 66 58 Z" fill="url(#${p}-cloak)" stroke="${stroke}" stroke-width="1.6"/>
${I4}<path d="M 28 52 Q 50 44 72 52 L 78 92 Q 74 98 50 100 Q 26 98 22 92 Z" fill="url(#${p}-cloak)" stroke="${stroke}" stroke-width="2.4"/>
${I4}<path d="M 32 58 Q 36 78 34 90" stroke="#1a237e" stroke-width="1.8" fill="none" opacity="0.4"/>
${I4}<path d="M 68 58 Q 64 78 66 90" stroke="#1a237e" stroke-width="1.8" fill="none" opacity="0.4"/>
${I4}<path d="M 24 70 L 28 74 L 26 78 L 22 74 Z" fill="#311b92" stroke="${accent}" stroke-width="0.6" opacity="0.55"/>
${I4}<path d="M 76 70 L 72 74 L 74 78 L 78 74 Z" fill="#311b92" stroke="${accent}" stroke-width="0.6" opacity="0.55"/>
${I4}<path d="M 30 82 L 34 86 L 32 90 L 28 86 Z" fill="#4527a0" stroke="${accent}" stroke-width="0.55" opacity="0.5"/>
${I4}<path d="M 70 82 L 66 86 L 68 90 L 72 86 Z" fill="#4527a0" stroke="${accent}" stroke-width="0.55" opacity="0.5"/>
${I4}<ellipse cx="50" cy="68" rx="14" ry="12" fill="url(#${p}-void-glow)" opacity="0.55"/>
${I4}<circle cx="50" cy="68" r="9" fill="url(#${p}-void)"/>
${I4}<circle cx="50" cy="68" r="5" fill="url(#${p}-void-glow)" opacity="0.85"/>
${I4}<circle cx="50" cy="68" r="2.2" fill="#e1bee7" opacity="0.7"/>
${I4}<path d="M 38 48 Q 50 38 62 48 Q 58 42 50 40 Q 42 42 38 48 Z" fill="#0d0221" opacity="0.75" stroke="${accent}" stroke-width="1"/>
${I4}<ellipse cx="42" cy="44" rx="6" ry="3.5" fill="#fff" opacity="0.08"/>
${I4}<path d="M 34 88 Q 32 96 38 98" stroke="url(#${p}-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
${I4}<path d="M 44 92 Q 42 100 48 102" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<path d="M 50 94 Q 50 102 54 104" stroke="url(#${p}-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 56 92 Q 58 100 52 102" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<path d="M 66 88 Q 68 96 62 98" stroke="url(#${p}-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
${I4}<path d="M 26 64 L 30 68 L 28 72 L 24 68 Z" fill="#311b92" stroke="${accent}" stroke-width="0.5" opacity="0.45"/>
${I4}<path d="M 74 64 L 70 68 L 72 72 L 76 68 Z" fill="#311b92" stroke="${accent}" stroke-width="0.5" opacity="0.45"/>
${I4}<circle cx="36" cy="76" r="1.3" fill="${accent}" opacity="0.35"/>
${I4}<circle cx="64" cy="78" r="1.2" fill="#b39ddb" opacity="0.3"/>
${I4}<path d="M 40 52 Q 50 50 60 52" stroke="#651fff" stroke-width="0.7" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 24 58 Q 8 62 4 48 Q 2 40 10 42" fill="none" stroke="url(#${p}-claw)" stroke-width="5.5" stroke-linecap="round" opacity="0.92"/>
${I4}<path d="M 6 40 L 0 34 M 6 42 L -2 42 M 8 44 L 2 48" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 4 38 L -2 32 M 8 38 L 10 32 M 10 42 L 14 36" stroke="#d1c4e9" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 76 58 Q 92 62 96 48 Q 98 40 90 42" fill="none" stroke="url(#${p}-claw)" stroke-width="5.5" stroke-linecap="round" opacity="0.92"/>
${I4}<path d="M 94 40 L 100 34 M 94 42 L 102 42 M 92 44 L 98 48" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/>
${I4}<path d="M 96 38 L 102 32 M 92 38 L 90 32 M 90 42 L 86 36" stroke="#d1c4e9" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="96" rx="7" ry="4.5" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="96" rx="7" ry="4.5" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="1" opacity="0.65"/>
${I3}</g>
${epicEyes(40, 60, 42, 6.5, 7.5, `url(#${p}-iris)`, stroke, '#f3e8ff')}
${mouths(52, accent, 7)}`;

  return wrapStage('evo3', 'Veil Wraith', defs, body);
}

/* ─── EVO4 MIDDLE: chain phantom ─── */
function evo4Ghost() {
  const p = 'ghost-mid';
  const stroke = '#78909c';
  const accent = '#b0bec5';
  const defs = [
    grad(`${p}-body`, [['0%', '#eceff1', 0.92], ['40%', '#b0bec5', 0.85], ['100%', '#546e7a', 0.9]], 'radial', 'cx="42%" cy="24%" r="80%"'),
    grad(`${p}-veil`, [['0%', '#607d8b', 0.55], ['100%', '#37474f', 0.75]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-iris`, [['0%', '#80deea'], ['55%', '#4dd0e1'], ['100%', '#006064']], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-wisp`, [['0%', '#cfd8dc', 0.75], ['100%', '#546e7a', 0.2]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-chain`, [['0%', '#eceff1'], ['100%', '#78909c']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\n');

  const body = `${shadow(97, 28, 0.2)}
${I3}<ellipse cx="50" cy="54" rx="38" ry="36" fill="url(#${p}-wisp)" opacity="0.25"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 80 Q 72 92 80 78 Q 84 68 74 64 Q 64 68 58 80 Z" fill="url(#${p}-wisp)" stroke="${accent}" stroke-width="0.95" opacity="0.7"/>
${I4}<ellipse cx="72" cy="72" rx="3" ry="2" fill="none" stroke="url(#${p}-chain)" stroke-width="1.4"/>
${I4}<ellipse cx="78" cy="68" rx="2.5" ry="1.8" fill="none" stroke="url(#${p}-chain)" stroke-width="1.2"/>
${I4}<ellipse cx="82" cy="74" rx="2.2" ry="1.6" fill="none" stroke="url(#${p}-chain)" stroke-width="1.1"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 26 54 Q 14 46 12 58 Q 14 68 24 62 Z" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="0.9" opacity="0.72"/>
${I4}<ellipse cx="16" cy="56" rx="2" ry="1.5" fill="none" stroke="url(#${p}-chain)" stroke-width="1"/>
${I4}<ellipse cx="14" cy="62" rx="1.8" ry="1.3" fill="none" stroke="url(#${p}-chain)" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 74 54 Q 86 46 88 58 Q 86 68 76 62 Z" fill="url(#${p}-wisp)" stroke="${stroke}" stroke-width="0.9" opacity="0.72"/>
${I4}<ellipse cx="84" cy="56" rx="2" ry="1.5" fill="none" stroke="url(#${p}-chain)" stroke-width="1"/>
${I4}<ellipse cx="86" cy="62" rx="1.8" ry="1.3" fill="none" stroke="url(#${p}-chain)" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 26 58 Q 22 36 38 24 Q 50 16 62 24 Q 78 36 74 58 Q 72 78 62 90 Q 50 98 38 90 Q 26 78 26 58 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2" opacity="0.88"/>
${I4}<path d="M 32 40 Q 50 26 68 40 Q 66 34 50 30 Q 34 34 32 40 Z" fill="url(#${p}-veil)" opacity="0.65"/>
${I4}<path d="M 36 36 L 40 42 M 44 34 L 46 42 M 52 34 L 54 42 M 58 36 L 62 42" stroke="#cfd8dc" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M 38 38 Q 42 40 46 38" stroke="#90a4ae" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<path d="M 54 38 Q 58 40 62 38" stroke="#90a4ae" stroke-width="0.7" fill="none" opacity="0.45"/>
${I4}<ellipse cx="42" cy="34" rx="7" ry="4" fill="#fff" opacity="0.1"/>
${I4}<circle cx="50" cy="58" r="8" fill="#546e7a" opacity="0.35"/>
${I4}<circle cx="50" cy="58" r="4" fill="#b0bec5" opacity="0.45"/>
${I4}<ellipse cx="30" cy="70" rx="2.5" ry="1.8" fill="none" stroke="url(#${p}-chain)" stroke-width="1.2"/>
${I4}<ellipse cx="70" cy="72" rx="2.5" ry="1.8" fill="none" stroke="url(#${p}-chain)" stroke-width="1.2"/>
${I4}<ellipse cx="34" cy="78" rx="2.2" ry="1.6" fill="none" stroke="url(#${p}-chain)" stroke-width="1.1"/>
${I4}<path d="M 34 88 Q 32 96 38 98" stroke="url(#${p}-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.6"/>
${I4}<path d="M 50 92 Q 50 100 54 102" stroke="url(#${p}-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.62"/>
${I4}<path d="M 66 88 Q 68 96 62 98" stroke="url(#${p}-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.6"/>
${I4}<ellipse cx="50" cy="66" rx="2.5" ry="1.8" fill="none" stroke="url(#${p}-chain)" stroke-width="1.1"/>
${I4}<path d="M 40 52 Q 50 50 60 52" stroke="#cfd8dc" stroke-width="0.7" fill="none" opacity="0.35"/>
${I4}<circle cx="46" cy="70" r="1.2" fill="#fff" opacity="0.18"/>
${I4}<circle cx="54" cy="72" r="1" fill="#b0bec5" opacity="0.16"/>
${I4}<path d="M 48 34 L 50 38 L 52 34" stroke="#90a4ae" stroke-width="0.65" fill="none" opacity="0.4"/>
${I4}<ellipse cx="42" cy="60" rx="2" ry="1.5" fill="none" stroke="url(#${p}-chain)" stroke-width="0.95"/>
${I4}<ellipse cx="58" cy="62" rx="2" ry="1.5" fill="none" stroke="url(#${p}-chain)" stroke-width="0.95"/>
${I4}<circle cx="50" cy="52" r="1.2" fill="#cfd8dc" opacity="0.25"/>
${I4}<path d="M 38 74 Q 40 78 42 74" stroke="#b0bec5" stroke-width="0.6" fill="none" opacity="0.3"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 28 58 Q 14 62 10 50 Q 8 44 14 46" fill="none" stroke="url(#${p}-body)" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 10 46 L 4 40 M 10 48 L 2 48" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 58 Q 86 62 90 50 Q 92 44 86 46" fill="none" stroke="url(#${p}-body)" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 90 46 L 96 40 M 90 48 L 98 48" stroke="${accent}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="94" rx="6" ry="3.8" fill="url(#${p}-wisp)" opacity="0.65"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="94" rx="6" ry="3.8" fill="url(#${p}-wisp)" opacity="0.65"/>
${I3}</g>
${epicEyes(41, 59, 40, 5.5, 6.2, `url(#${p}-iris)`, stroke, '#f5f5f5')}
${mouths(50, stroke, 6)}`;

  return wrapStage('evo4', 'chain phantom', defs, body);
}

/* ─── EVO5 OLD: eternal phantom ─── */
function evo5Ghost() {
  const p = 'ghost-old';
  const stroke = '#546e7a';
  const accent = '#80deea';
  const defs = [
    grad(`${p}-body`, [['0%', '#fafafa', 0.95], ['35%', '#e0f7fa', 0.88], ['70%', '#80cbc4', 0.82], ['100%', '#4db6ac', 0.85]], 'radial', 'cx="44%" cy="22%" r="82%"'),
    grad(`${p}-aura`, [['0%', '#fff', 0.5], ['45%', '#80deea', 0.22], ['100%', '#26c6da', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#80deea'], ['50%', '#4dd0e1'], ['100%', '#01579b']], 'radial', 'cx="40%" cy="35%" r="60%"'),
    grad(`${p}-ecto`, [['0%', '#e0f7fa', 0.85], ['100%', '#4db6ac', 0.25]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-third`, [['0%', '#e0f7fa'], ['100%', '#00838f']], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="54" rx="46" ry="52" fill="url(#${p}-aura)" class="tm-wisdom-aura"/>
${shadow(99, 26, 0.18)}
${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 82 Q 68 98 84 86 Q 90 74 80 68 Q 68 72 56 82 Z" fill="url(#${p}-ecto)" stroke="${accent}" stroke-width="0.95" opacity="0.72"/>
${I4}<path d="M 66 78 Q 78 90 82 78" stroke="#b2ebf2" stroke-width="0.75" fill="none" opacity="0.45"/>
${I4}<path d="M 72 74 Q 84 80 86 70" stroke="#80deea" stroke-width="0.65" fill="none" opacity="0.4"/>
${I4}<circle cx="84" cy="72" r="2" fill="${accent}" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 24 52 Q 8 40 6 56 Q 8 72 18 66 Q 26 60 28 54 Z" fill="url(#${p}-ecto)" stroke="${stroke}" stroke-width="1" opacity="0.78"/>
${I4}<path d="M 14 50 Q 10 56 12 62" stroke="#b2ebf2" stroke-width="0.65" fill="none" opacity="0.4"/>
${I4}<path d="M 10 58 Q 6 64 10 70" stroke="#80deea" stroke-width="0.6" fill="none" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 76 52 Q 92 40 94 56 Q 92 72 82 66 Q 74 60 72 54 Z" fill="url(#${p}-ecto)" stroke="${stroke}" stroke-width="1" opacity="0.78"/>
${I4}<path d="M 86 50 Q 90 56 88 62" stroke="#b2ebf2" stroke-width="0.65" fill="none" opacity="0.4"/>
${I4}<path d="M 90 58 Q 94 64 90 70" stroke="#80deea" stroke-width="0.6" fill="none" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 22 56 Q 18 34 36 22 Q 50 14 64 22 Q 82 34 78 56 Q 76 80 64 92 Q 50 100 36 92 Q 24 80 22 56 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="1.8" opacity="0.9"/>
${I4}<ellipse cx="42" cy="32" rx="8" ry="5" fill="#fff" opacity="0.14"/>
${I4}<path d="M 30 48 Q 34 72 32 88" stroke="#b0bec5" stroke-width="1.5" fill="none" opacity="0.35"/>
${I4}<path d="M 70 48 Q 66 72 68 88" stroke="#b0bec5" stroke-width="1.5" fill="none" opacity="0.35"/>
${I4}<circle cx="50" cy="60" r="9" fill="url(#${p}-aura)" opacity="0.55"/>
${I4}<circle cx="50" cy="60" r="4.5" fill="#fff" opacity="0.35"/>
${I4}<path d="M 14 62 L 18 62 L 20 58 L 16 58 Z" fill="none" stroke="${accent}" stroke-width="0.9" opacity="0.55"/>
${I4}<path d="M 86 58 L 82 58 L 80 62 L 84 62 Z" fill="none" stroke="${accent}" stroke-width="0.9" opacity="0.55"/>
${I4}<circle cx="18" cy="70" r="2.5" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.45"/>
${I4}<path d="M 82 72 L 86 76 L 82 80 L 78 76 Z" fill="none" stroke="${accent}" stroke-width="0.85" opacity="0.45"/>
${I4}<path d="M 12 78 Q 16 74 20 78 Q 16 82 12 78" fill="none" stroke="#4dd0e1" stroke-width="0.8" opacity="0.4"/>
${I4}<path d="M 88 84 Q 84 80 80 84 Q 84 88 88 84" fill="none" stroke="#4dd0e1" stroke-width="0.8" opacity="0.4"/>
${I4}<path d="M 36 88 Q 34 96 40 98" stroke="url(#${p}-ecto)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.65"/>
${I4}<path d="M 44 92 Q 42 102 48 104" stroke="url(#${p}-ecto)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<path d="M 50 94 Q 48 104 54 106" stroke="url(#${p}-ecto)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
${I4}<path d="M 56 92 Q 58 102 52 104" stroke="url(#${p}-ecto)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<path d="M 64 88 Q 66 96 60 98" stroke="url(#${p}-ecto)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.65"/>
${I4}<path d="M 8 52 Q 4 48 8 44 Q 12 48 8 52" fill="none" stroke="${accent}" stroke-width="0.75" opacity="0.4"/>
${I4}<path d="M 92 48 Q 96 44 92 40 Q 88 44 92 48" fill="none" stroke="${accent}" stroke-width="0.75" opacity="0.4"/>
${I4}<path d="M 16 64 L 20 64 L 22 60 L 18 60 Z" fill="none" stroke="${accent}" stroke-width="0.75" opacity="0.4"/>
${I4}<path d="M 84 68 L 88 68 L 90 64 L 86 64 Z" fill="none" stroke="${accent}" stroke-width="0.75" opacity="0.4"/>
${I4}<circle cx="24" cy="78" r="1.8" fill="#80deea" opacity="0.3"/>
${I4}<circle cx="76" cy="80" r="1.6" fill="#4dd0e1" opacity="0.28"/>
${I4}<path d="M 44 38 Q 50 36 56 38" stroke="#b0bec5" stroke-width="0.65" fill="none" opacity="0.35"/>
${I4}<line x1="46" y1="26" x2="54" y2="26" stroke="${accent}" stroke-width="0.6" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 26 58 Q 10 64 6 50 Q 4 44 12 46" fill="none" stroke="url(#${p}-body)" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 8 44 L 2 38 M 8 46 L 0 46 M 10 48 L 4 52" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 74 58 Q 90 64 94 50 Q 96 44 88 46" fill="none" stroke="url(#${p}-body)" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>
${I4}<path d="M 92 44 L 98 38 M 92 46 L 100 46 M 90 48 L 96 52" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="96" rx="5.5" ry="3.5" fill="url(#${p}-ecto)" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="96" rx="5.5" ry="3.5" fill="url(#${p}-ecto)" opacity="0.6"/>
${I3}</g>
${I3}<circle cx="50" cy="28" r="2.8" fill="url(#${p}-third)" stroke="${stroke}" stroke-width="0.9" opacity="0.75"/>
${I3}<circle cx="50" cy="28" r="1.4" fill="#4dd0e1" opacity="0.85"/>
${I3}<circle cx="50.5" cy="27.2" r="0.55" fill="#fff"/>
${epicEyes(42, 58, 36, 4.8, 5.2, `url(#${p}-iris)`, stroke, '#fafafa')}
${mouths(46, stroke, 5)}`;

  return wrapStage('evo5', 'eternal phantom', defs, body);
}

export const ghostSvg = `${I}<!-- GHOST CHARACTER - All Life Stages (dense cute epic v3) -->
${I}<!-- Spirit & Void • Epic Rarity • Veil Wraith -->
${I}<!-- ═══════════════════════════════════════ -->

${babyGhost()}${evo1Ghost()}${evo2Ghost()}${evo3Ghost()}${evo4Ghost()}${evo5Ghost()}`;
