/**
 * Robot mascot SVG — Neon Colossus arc (dense cute epic v3)
 * Exports robotSvg for injection into myman_mascot.js
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

function grad(id, stops, type = 'linear', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'radial'
    ? (attrs ?? 'cx="50%" cy="50%" r="50%"')
    : (attrs ?? 'x1="0%" y1="0%" x2="100%" y2="100%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function eyes(lx, rx, cy, rxE, ryE, iris, stroke) {
  const cl = (n) => Number(n.toFixed(1));
  const hi = cl(Math.max(1.2, rxE * 0.32));
  const lo = cl(Math.max(0.7, rxE * 0.13));
  const iRx = cl(rxE * 0.56);
  const iRy = cl(ryE * 0.58);
  const pRx = cl(rxE * 0.29);
  const pRy = cl(ryE * 0.33);
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#fff" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxE}" ry="${ryE}" fill="#fff" stroke="${stroke}" stroke-width="1.6"/>
${I4}<ellipse cx="${lx + 1}" cy="${cy + 1}" rx="${iRx}" ry="${iRy}" fill="${iris}"/>
${I4}<ellipse cx="${rx + 1}" cy="${cy + 1}" rx="${iRx}" ry="${iRy}" fill="${iris}"/>
${I4}<ellipse cx="${lx + 1}" cy="${cy + 1.5}" rx="${pRx}" ry="${pRy}" fill="#0a1628"/>
${I4}<ellipse cx="${rx + 1}" cy="${cy + 1.5}" rx="${pRx}" ry="${pRy}" fill="#0a1628"/>
${I4}<circle cx="${cl(lx + 2.5)}" cy="${cl(cy - ryE * 0.35)}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${cl(rx + 2.5)}" cy="${cl(cy - ryE * 0.35)}" r="${hi}" fill="#fff" opacity="0.95"/>
${I4}<circle cx="${cl(lx - 0.8)}" cy="${cl(cy + ryE * 0.3)}" r="${lo}" fill="#fff" opacity="0.5"/>
${I4}<circle cx="${cl(rx - 0.8)}" cy="${cl(cy + ryE * 0.3)}" r="${lo}" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxE} ${cy} Q ${lx} ${cy - 3} ${lx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxE} ${cy} Q ${rx} ${cy - 3} ${rx + rxE} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 7) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + 5} ${50 + span} ${y}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 4} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
}

function wrap(id, title, defs, body) {
  return `${I}<!-- ROBOT ${title} -->
${I}<g id="${id}" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/* ─── BABY — chubby cube spawn ─── */
const babyDefs = [
  grad('robot-baby-chassis', [['0%', '#cfd8dc'], ['40%', '#78909c'], ['100%', '#37474f']], 'linear'),
  grad('robot-baby-panel', [['0%', '#e0f7fa'], ['100%', '#4dd0e1']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  grad('robot-baby-core', [['0%', '#fffde7'], ['35%', '#76ff03', 0.9], ['100%', '#00e5ff', 0]], 'radial'),
  grad('robot-baby-iris', [['0%', '#00e5ff'], ['55%', '#0288d1'], ['100%', '#01579b']], 'radial', 'cx="38%" cy="32%" r="62%"'),
  grad('robot-baby-blush', [['0%', '#ff8a9b', 0.55], ['100%', '#ff8a9b', 0]], 'radial'),
  grad('robot-baby-thruster', [['0%', '#b2ebf2'], ['100%', '#00bcd4', 0.4]], 'radial'),
  grad('robot-baby-gloss', [['0%', '#fff', 0.35], ['100%', '#fff', 0]], 'radial', 'cx="35%" cy="25%" r="55%"'),
].join('\n');

const babyBody = `${I3}<ellipse cx="50" cy="92" rx="22" ry="4" fill="#1a1a1a" opacity="0.2"/>
${I3}<!-- Cable tail -->
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 72 Q 76 78 80 70 Q 82 64 78 62" fill="none" stroke="#546e7a" stroke-width="2.2" stroke-linecap="round"/>
${I4}<path d="M 76 66 Q 80 64 78 68" fill="none" stroke="#78909c" stroke-width="1.2" opacity="0.6"/>
${I4}<rect x="76" y="60" width="6" height="5" rx="1" fill="#37474f" stroke="#00e5ff" stroke-width="1"/>
${I4}<rect x="78" y="62" width="2" height="1.5" fill="#00e5ff" opacity="0.8"/>
${I4}<circle cx="79" cy="61" r="0.8" fill="#76ff03" opacity="0.7"/>
${I3}</g>
${I3}<!-- Thruster nub wings -->
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="26" cy="58" rx="5" ry="7" fill="url(#robot-baby-thruster)" stroke="#00acc1" stroke-width="1.2" transform="rotate(-20 26 58)"/>
${I4}<ellipse cx="24" cy="62" rx="2" ry="3" fill="#00e5ff" opacity="0.55"/>
${I4}<circle cx="23" cy="64" r="1.2" fill="#76ff03" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="74" cy="58" rx="5" ry="7" fill="url(#robot-baby-thruster)" stroke="#00acc1" stroke-width="1.2" transform="rotate(20 74 58)"/>
${I4}<ellipse cx="76" cy="62" rx="2" ry="3" fill="#00e5ff" opacity="0.55"/>
${I4}<circle cx="77" cy="64" r="1.2" fill="#76ff03" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Chubby cube torso -->
${I4}<rect x="32" y="54" width="36" height="26" rx="7" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="2"/>
${I4}<rect x="36" y="58" width="28" height="14" rx="3" fill="url(#robot-baby-panel)" stroke="#4dd0e1" stroke-width="0.8" opacity="0.9"/>
${I4}<ellipse cx="42" cy="60" rx="8" ry="4" fill="url(#robot-baby-gloss)"/>
${I4}<circle cx="50" cy="66" r="6" fill="url(#robot-baby-core)"/>
${I4}<circle cx="50" cy="66" r="2.5" fill="#fffde7" opacity="0.8"/>
${I4}<!-- Cute bolts -->
${I4}<circle cx="34" cy="58" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
${I4}<circle cx="66" cy="58" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
${I4}<circle cx="34" cy="76" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
${I4}<circle cx="66" cy="76" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
${I4}<line x1="33" y1="58" x2="35" y2="58" stroke="#eceff1" stroke-width="0.6"/>
${I4}<line x1="65" y1="58" x2="67" y2="58" stroke="#eceff1" stroke-width="0.6"/>
${I4}<!-- Blush LED panels -->
${I4}<circle cx="38" cy="72" r="3.5" fill="url(#robot-baby-blush)"/>
${I4}<circle cx="62" cy="72" r="3.5" fill="url(#robot-baby-blush)"/>
${I4}<rect x="44" y="74" width="12" height="2" rx="1" fill="#00e5ff" opacity="0.5"/>
${I4}<!-- Cube head -->
${I4}<rect x="34" y="28" width="32" height="24" rx="6" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="2"/>
${I4}<rect x="38" y="32" width="24" height="14" rx="3" fill="#263238" stroke="#37474f" stroke-width="0.8"/>
${I4}<ellipse cx="42" cy="34" rx="6" ry="3" fill="#fff" opacity="0.1"/>
${I4}<!-- Bobble antenna -->
${I4}<path d="M 50 28 Q 48 20 50 14 Q 52 20 50 28" fill="none" stroke="#78909c" stroke-width="1.8" stroke-linecap="round"/>
${I4}<circle cx="50" cy="12" r="3.5" fill="#76ff03" stroke="#00e5ff" stroke-width="1.2"/>
${I4}<circle cx="49" cy="11" r="1.2" fill="#fff" opacity="0.7"/>
${I4}<circle cx="36" cy="30" r="1.5" fill="#90a4ae" stroke="#546e7a" stroke-width="0.6"/>
${I4}<circle cx="64" cy="30" r="1.5" fill="#90a4ae" stroke="#546e7a" stroke-width="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="26" cy="64" rx="5" ry="7" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
${I4}<ellipse cx="24" cy="60" rx="2" ry="1.5" fill="#fff" opacity="0.2"/>
${I4}<rect x="22" y="70" width="8" height="6" rx="2" fill="#455a64" stroke="#00e5ff" stroke-width="1"/>
${I4}<circle cx="24" cy="73" r="1" fill="#76ff03"/>
${I4}<circle cx="28" cy="73" r="1" fill="#00e5ff"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="74" cy="64" rx="5" ry="7" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
${I4}<ellipse cx="76" cy="60" rx="2" ry="1.5" fill="#fff" opacity="0.2"/>
${I4}<rect x="70" y="70" width="8" height="6" rx="2" fill="#455a64" stroke="#00e5ff" stroke-width="1"/>
${I4}<circle cx="72" cy="73" r="1" fill="#76ff03"/>
${I4}<circle cx="76" cy="73" r="1" fill="#00e5ff"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="84" rx="6" ry="5" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
${I4}<ellipse cx="40" cy="88" rx="7" ry="3" fill="#37474f" stroke="#546e7a" stroke-width="1.2"/>
${I4}<rect x="36" y="87" width="8" height="2" rx="1" fill="#00e5ff" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="84" rx="6" ry="5" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
${I4}<ellipse cx="60" cy="88" rx="7" ry="3" fill="#37474f" stroke="#546e7a" stroke-width="1.2"/>
${I4}<rect x="56" y="87" width="8" height="2" rx="1" fill="#00e5ff" opacity="0.4"/>
${I3}</g>
${eyes(41, 59, 40, 6.5, 7.5, 'url(#robot-baby-iris)', '#546e7a')}
${mouths(48, '#00e5ff', 6)}`;

/* ─── EVO1 KID — tread scout ─── */
const evo1Defs = [
  grad('robot-kid-chassis', [['0%', '#b0bec5'], ['35%', '#607d8b'], ['100%', '#263238']], 'linear'),
  grad('robot-kid-panel', [['0%', '#e1f5fe'], ['100%', '#29b6f6']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  grad('robot-kid-core', [['0%', '#fff9c4'], ['40%', '#ffee58', 0.9], ['100%', '#00e5ff', 0]], 'radial'),
  grad('robot-kid-iris', [['0%', '#4fc3f7'], ['55%', '#0288d1'], ['100%', '#01579b']], 'radial', 'cx="38%" cy="32%" r="62%"'),
  grad('robot-kid-blush', [['0%', '#ff8a9b', 0.45], ['100%', '#ff8a9b', 0]], 'radial'),
  grad('robot-kid-dish', [['0%', '#eceff1'], ['100%', '#78909c']], 'radial', 'cx="50%" cy="30%" r="70%"'),
  grad('robot-kid-star', [['0%', '#fff59d'], ['100%', '#ffc107']], 'radial'),
].join('\n');

const evo1Body = `${I3}<ellipse cx="50" cy="94" rx="28" ry="5" fill="#1a1a1a" opacity="0.22"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 70 Q 80 76 84 66 Q 86 58 78 60" fill="none" stroke="#607d8b" stroke-width="2.5" stroke-linecap="round"/>
${I4}<path d="M 78 62 Q 82 60 80 66" fill="none" stroke="#90a4ae" stroke-width="1" opacity="0.5"/>
${I4}<rect x="80" y="56" width="5" height="6" rx="1" fill="#455a64" stroke="#29b6f6" stroke-width="1"/>
${I4}<circle cx="82" cy="58" r="1" fill="#ffee58"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="24" cy="54" rx="4" ry="6" fill="#455a64" stroke="#29b6f6" stroke-width="1" opacity="0.85"/>
${I4}<circle cx="22" cy="58" r="1.5" fill="#00e5ff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="76" cy="54" rx="4" ry="6" fill="#455a64" stroke="#29b6f6" stroke-width="1" opacity="0.85"/>
${I4}<circle cx="78" cy="58" r="1.5" fill="#00e5ff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Backpack antenna dish -->
${I4}<ellipse cx="50" cy="42" rx="14" ry="10" fill="url(#robot-kid-dish)" stroke="#607d8b" stroke-width="1.2" opacity="0.9"/>
${I4}<ellipse cx="50" cy="40" rx="8" ry="5" fill="#37474f" stroke="#29b6f6" stroke-width="0.8"/>
${I4}<line x1="50" y1="35" x2="50" y2="28" stroke="#78909c" stroke-width="1.5"/>
${I4}<circle cx="50" cy="26" r="2.5" fill="#ffee58" stroke="#ffc107" stroke-width="0.8"/>
${I4}<!-- Taller chassis -->
${I4}<rect x="30" y="48" width="40" height="28" rx="5" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="2"/>
${I4}<rect x="34" y="52" width="32" height="14" rx="2.5" fill="url(#robot-kid-panel)" stroke="#29b6f6" stroke-width="0.8"/>
${I4}<ellipse cx="40" cy="54" rx="7" ry="3" fill="#fff" opacity="0.15"/>
${I4}<circle cx="50" cy="62" r="7" fill="url(#robot-kid-core)"/>
${I4}<circle cx="50" cy="62" r="3" fill="#fff9c4" opacity="0.75"/>
${I4}<!-- Sticker stars -->
${I4}<path d="M 36 56 L 37 58 L 39 58 L 37.5 59.5 L 38 62 L 36 60.5 L 34 62 L 34.5 59.5 L 33 58 L 35 58 Z" fill="url(#robot-kid-star)" stroke="#ffc107" stroke-width="0.5"/>
${I4}<path d="M 62 70 L 63 72 L 65 72 L 63.5 73.5 L 64 76 L 62 74.5 L 60 76 L 60.5 73.5 L 59 72 L 61 72 Z" fill="url(#robot-kid-star)" stroke="#ffc107" stroke-width="0.5"/>
${I4}<path d="M 64 54 L 64.8 56 L 67 56 L 65.2 57.2 L 65.8 59 L 64 58 L 62.2 59 L 62.8 57.2 L 61 56 L 63.2 56 Z" fill="url(#robot-kid-star)" opacity="0.8"/>
${I4}<circle cx="38" cy="72" r="3" fill="url(#robot-kid-blush)"/>
${I4}<circle cx="62" cy="72" r="3" fill="url(#robot-kid-blush)"/>
${I4}<!-- Head -->
${I4}<rect x="34" y="22" width="32" height="22" rx="4" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.8"/>
${I4}<rect x="38" y="26" width="24" height="12" rx="2" fill="#1a237e" opacity="0.85"/>
${I4}<rect x="42" y="42" width="16" height="4" rx="1" fill="#263238" stroke="#29b6f6" stroke-width="0.6"/>
${I4}<path d="M 44 44 L 48 44 L 46 46 Z" fill="#ffee58" opacity="0.8"/>
${I4}<path d="M 52 44 L 56 44 L 54 46 Z" fill="#ffee58" opacity="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<rect x="18" y="52" width="10" height="18" rx="2.5" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.3" transform="rotate(-14 23 61)"/>
${I4}<rect x="16" y="68" width="12" height="7" rx="2" fill="#37474f" stroke="#29b6f6" stroke-width="1"/>
${I4}<circle cx="20" cy="71" r="1.3" fill="#ffee58"/>
${I4}<circle cx="24" cy="71" r="1.3" fill="#00e5ff"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<rect x="72" y="52" width="10" height="18" rx="2.5" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.3" transform="rotate(14 77 61)"/>
${I4}<rect x="72" y="68" width="12" height="7" rx="2" fill="#37474f" stroke="#29b6f6" stroke-width="1"/>
${I4}<circle cx="76" cy="71" r="1.3" fill="#ffee58"/>
${I4}<circle cx="80" cy="71" r="1.3" fill="#00e5ff"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<rect x="34" y="76" width="12" height="8" rx="2" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.2"/>
${I4}<rect x="30" y="84" width="20" height="8" rx="3" fill="#263238" stroke="#455a64" stroke-width="1.5"/>
${I4}<circle cx="34" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
${I4}<circle cx="40" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
${I4}<circle cx="46" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
${I4}<rect x="32" y="86" width="16" height="2" rx="1" fill="#455a64"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<rect x="54" y="76" width="12" height="8" rx="2" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.2"/>
${I4}<rect x="50" y="84" width="20" height="8" rx="3" fill="#263238" stroke="#455a64" stroke-width="1.5"/>
${I4}<circle cx="54" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
${I4}<circle cx="60" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
${I4}<circle cx="66" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
${I4}<rect x="52" y="86" width="16" height="2" rx="1" fill="#455a64"/>
${I3}</g>
${eyes(41, 59, 32, 6, 7, 'url(#robot-kid-iris)', '#607d8b')}
${mouths(44, '#29b6f6', 7)}`;

/* ─── EVO2 TEEN — sleek visor mecha ─── */
const evo2Defs = [
  grad('robot-teen-chassis', [['0%', '#90a4ae'], ['40%', '#455a64'], ['100%', '#1a237e']], 'linear'),
  grad('robot-teen-panel', [['0%', '#e0f7fa'], ['50%', '#00bcd4'], ['100%', '#006064']], 'linear'),
  grad('robot-teen-core', [['0%', '#f8bbd0'], ['40%', '#e040fb', 0.85], ['100%', '#00e5ff', 0]], 'radial'),
  grad('robot-teen-iris', [['0%', '#ea80fc'], ['50%', '#7b1fa2'], ['100%', '#1a237e']], 'radial', 'cx="38%" cy="32%" r="62%"'),
  grad('robot-teen-visor', [['0%', '#00e5ff', 0.7], ['50%', '#00bcd4', 0.5], ['100%', '#006064', 0.3]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="0%"'),
  grad('robot-teen-fin', [['0%', '#b2ebf2'], ['100%', '#00838f', 0.6]], 'linear'),
  grad('robot-teen-hover', [['0%', '#00e5ff', 0.5], ['100%', '#00e5ff', 0]], 'radial'),
  grad('robot-teen-gloss', [['0%', '#fff', 0.3], ['100%', '#fff', 0]], 'radial', 'cx="30%" cy="20%" r="50%"'),
].join('\n');

const evo2Body = `${I3}<ellipse cx="50" cy="96" rx="30" ry="5" fill="#1a1a1a" opacity="0.25"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 68 68 Q 84 74 88 62 Q 90 52 82 54" fill="none" stroke="#455a64" stroke-width="2.8" stroke-linecap="round"/>
${I4}<ellipse cx="86" cy="58" rx="3" ry="4" fill="#00e5ff" opacity="0.5"/>
${I4}<circle cx="86" cy="58" r="1.5" fill="#e040fb" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 50 Q 14 42 12 52 Q 14 62 26 58 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1.4"/>
${I4}<path d="M 18 48 Q 14 52 16 56" stroke="#00838f" stroke-width="0.8" fill="none" opacity="0.55"/>
${I4}<circle cx="14" cy="50" r="1.5" fill="#e040fb" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 50 Q 86 42 88 52 Q 86 62 74 58 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1.4"/>
${I4}<path d="M 82 48 Q 86 52 84 56" stroke="#00838f" stroke-width="0.8" fill="none" opacity="0.55"/>
${I4}<circle cx="86" cy="50" r="1.5" fill="#e040fb" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<rect x="28" y="46" width="44" height="30" rx="4" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="2.2"/>
${I4}<rect x="32" y="50" width="36" height="16" rx="2" fill="url(#robot-teen-panel)" stroke="#00bcd4" stroke-width="0.9"/>
${I4}<ellipse cx="38" cy="52" rx="8" ry="4" fill="url(#robot-teen-gloss)"/>
${I4}<circle cx="50" cy="60" r="8" fill="url(#robot-teen-core)"/>
${I4}<circle cx="50" cy="60" r="3.5" fill="#f8bbd0" opacity="0.7"/>
${I4}<!-- Magenta accent stripes -->
${I4}<path d="M 30 54 L 34 54" stroke="#e040fb" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 66 54 L 70 54" stroke="#e040fb" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 30 70 L 34 70" stroke="#00e5ff" stroke-width="2" stroke-linecap="round"/>
${I4}<path d="M 66 70 L 70 70" stroke="#00e5ff" stroke-width="2" stroke-linecap="round"/>
${I4}<!-- Shoulder fins -->
${I4}<path d="M 28 48 L 22 40 L 30 52 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1"/>
${I4}<path d="M 72 48 L 78 40 L 70 52 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1"/>
${I4}<!-- Sleek helmet head -->
${I4}<ellipse cx="50" cy="30" rx="18" ry="14" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="2"/>
${I4}<ellipse cx="50" cy="30" rx="14" ry="8" fill="url(#robot-teen-visor)" stroke="#00bcd4" stroke-width="1"/>
${I4}<ellipse cx="42" cy="28" rx="5" ry="2.5" fill="#fff" opacity="0.2"/>
${I4}<line x1="50" y1="16" x2="50" y2="10" stroke="#78909c" stroke-width="1.5"/>
${I4}<circle cx="50" cy="9" r="2" fill="#e040fb" stroke="#00e5ff" stroke-width="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<rect x="16" y="48" width="11" height="22" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.4" transform="rotate(-18 21.5 59)"/>
${I4}<ellipse cx="14" cy="52" rx="2.5" ry="2" fill="#fff" opacity="0.15"/>
${I4}<rect x="12" y="68" width="14" height="8" rx="2" fill="#263238" stroke="#00e5ff" stroke-width="1.1"/>
${I4}<rect x="14" y="70" width="3" height="4" fill="#e040fb" opacity="0.7"/>
${I4}<rect x="19" y="70" width="3" height="4" fill="#00e5ff" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<rect x="73" y="48" width="11" height="22" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.4" transform="rotate(18 78.5 59)"/>
${I4}<ellipse cx="86" cy="52" rx="2.5" ry="2" fill="#fff" opacity="0.15"/>
${I4}<rect x="74" y="68" width="14" height="8" rx="2" fill="#263238" stroke="#00e5ff" stroke-width="1.1"/>
${I4}<rect x="76" y="70" width="3" height="4" fill="#e040fb" opacity="0.7"/>
${I4}<rect x="81" y="70" width="3" height="4" fill="#00e5ff" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<rect x="34" y="76" width="10" height="14" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.3"/>
${I4}<ellipse cx="39" cy="94" rx="10" ry="3" fill="url(#robot-teen-hover)"/>
${I4}<ellipse cx="39" cy="92" rx="8" ry="2.5" fill="#263238" stroke="#00bcd4" stroke-width="1.2"/>
${I4}<circle cx="39" cy="94" r="2" fill="#00e5ff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<rect x="56" y="76" width="10" height="14" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.3"/>
${I4}<ellipse cx="61" cy="94" rx="10" ry="3" fill="url(#robot-teen-hover)"/>
${I4}<ellipse cx="61" cy="92" rx="8" ry="2.5" fill="#263238" stroke="#00bcd4" stroke-width="1.2"/>
${I4}<circle cx="61" cy="94" r="2" fill="#00e5ff" opacity="0.6"/>
${I3}</g>
${eyes(42, 58, 30, 5.5, 6.5, 'url(#robot-teen-iris)', '#455a64')}
${mouths(38, '#00bcd4', 6)}`;

/* ─── EVO3 ADULT — Neon Colossus ─── */
const evo3Defs = [
  grad('robot-adult-armor', [['0%', '#78909c'], ['35%', '#37474f'], ['70%', '#1a237e'], ['100%', '#0d1b2a']], 'linear'),
  grad('robot-adult-plate', [['0%', '#b0bec5'], ['50%', '#546e7a'], ['100%', '#263238']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  grad('robot-adult-core', [['0%', '#fffde7'], ['30%', '#76ff03', 0.95], ['70%', '#00e5ff', 0.6], ['100%', '#00e5ff', 0]], 'radial'),
  grad('robot-adult-iris', [['0%', '#00e5ff'], ['50%', '#00bcd4'], ['100%', '#006064']], 'radial', 'cx="35%" cy="28%" r="65%"'),
  grad('robot-adult-jet', [['0%', '#90a4ae'], ['40%', '#455a64'], ['100%', '#263238']], 'linear'),
  grad('robot-adult-vent', [['0%', '#00e5ff', 0.6], ['100%', '#00e5ff', 0]], 'radial'),
  grad('robot-adult-cannon', [['0%', '#607d8b'], ['100%', '#263238']], 'linear'),
  grad('robot-adult-glow', [['0%', '#00e5ff', 0.35], ['100%', '#00e5ff', 0]], 'radial', 'cx="50%" cy="55%" r="45%"'),
].join('\n');

const evo3Body = `${I3}<ellipse cx="50" cy="98" rx="38" ry="5.5" fill="#1a1a1a" opacity="0.28"/>
${I3}<ellipse cx="50" cy="58" rx="42" ry="38" fill="url(#robot-adult-glow)" opacity="0.5"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 20 48 Q 4 34 2 20 Q 1 10 10 12 Q 14 26 20 40 Q 22 46 26 54 Z" fill="url(#robot-adult-jet)" stroke="#263238" stroke-width="2"/>
${I4}<path d="M 8 18 Q 12 28 18 40" stroke="#37474f" stroke-width="1" fill="none" opacity="0.5"/>
${I4}<path d="M 12 22 Q 16 32 22 44" stroke="#37474f" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<rect x="6" y="24" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
${I4}<rect x="8" y="30" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
${I4}<rect x="10" y="36" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
${I4}<circle cx="4" cy="16" r="2" fill="#76ff03" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 80 48 Q 96 34 98 20 Q 99 10 90 12 Q 86 26 80 40 Q 78 46 74 54 Z" fill="url(#robot-adult-jet)" stroke="#263238" stroke-width="2"/>
${I4}<path d="M 92 18 Q 88 28 82 40" stroke="#37474f" stroke-width="1" fill="none" opacity="0.5"/>
${I4}<path d="M 88 22 Q 84 32 78 44" stroke="#37474f" stroke-width="0.8" fill="none" opacity="0.4"/>
${I4}<rect x="90" y="24" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
${I4}<rect x="88" y="30" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
${I4}<rect x="86" y="36" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
${I4}<circle cx="96" cy="16" r="2" fill="#76ff03" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 72 70 Q 90 76 94 64 Q 96 54 86 56" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="2"/>
${I4}<rect x="90" y="58" width="6" height="5" rx="1" fill="#37474f" stroke="#00e5ff" stroke-width="1"/>
${I4}<circle cx="93" cy="60" r="1.5" fill="#76ff03"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Broad heroic torso -->
${I4}<path d="M 22 52 L 26 44 L 74 44 L 78 52 L 76 78 L 24 78 Z" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="2.4"/>
${I4}<rect x="28" y="48" width="44" height="22" rx="3" fill="url(#robot-adult-plate)" stroke="#546e7a" stroke-width="1.2"/>
${I4}<ellipse cx="38" cy="52" rx="8" ry="4" fill="#fff" opacity="0.1"/>
${I4}<!-- Layered armor plates -->
${I4}<path d="M 26 56 L 30 52 L 34 56 L 30 60 Z" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
${I4}<path d="M 66 56 L 70 52 L 74 56 L 70 60 Z" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
${I4}<path d="M 36 72 L 40 68 L 44 72 L 40 76 Z" fill="#546e7a" stroke="#37474f" stroke-width="0.7"/>
${I4}<path d="M 56 72 L 60 68 L 64 72 L 60 76 Z" fill="#546e7a" stroke="#37474f" stroke-width="0.7"/>
${I4}<!-- Big chest core -->
${I4}<circle cx="50" cy="62" r="12" fill="url(#robot-adult-core)"/>
${I4}<circle cx="50" cy="62" r="6" fill="#fffde7" opacity="0.8"/>
${I4}<circle cx="50" cy="62" r="3" fill="#76ff03" opacity="0.9"/>
${I4}<path d="M 38 58 L 62 58 M 38 66 L 62 66" stroke="#00e5ff" stroke-width="0.8" opacity="0.4"/>
${I4}<!-- Head -->
${I4}<rect x="36" y="20" width="28" height="20" rx="3" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="2"/>
${I4}<rect x="40" y="24" width="20" height="10" rx="2" fill="#0a1628" stroke="#00e5ff" stroke-width="0.8"/>
${I4}<line x1="50" y1="20" x2="50" y2="12" stroke="#78909c" stroke-width="2"/>
${I4}<circle cx="50" cy="10" r="3" fill="#76ff03" stroke="#00e5ff" stroke-width="1"/>
${I4}<circle cx="49" cy="9" r="1" fill="#fff" opacity="0.7"/>
${I4}<rect x="32" y="42" width="8" height="6" rx="1" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
${I4}<rect x="60" y="42" width="8" height="6" rx="1" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="20" cy="58" rx="7" ry="12" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.8"/>
${I4}<rect x="10" y="66" width="18" height="10" rx="2" fill="url(#robot-adult-cannon)" stroke="#00e5ff" stroke-width="1.4"/>
${I4}<rect x="6" y="68" width="8" height="6" rx="1.5" fill="#263238" stroke="#76ff03" stroke-width="1"/>
${I4}<circle cx="8" cy="71" r="2" fill="#0a1628"/>
${I4}<rect x="14" y="70" width="4" height="3" fill="#00e5ff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="80" cy="58" rx="7" ry="12" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.8"/>
${I4}<rect x="72" y="66" width="18" height="10" rx="2" fill="url(#robot-adult-cannon)" stroke="#00e5ff" stroke-width="1.4"/>
${I4}<rect x="86" y="68" width="8" height="6" rx="1.5" fill="#263238" stroke="#76ff03" stroke-width="1"/>
${I4}<circle cx="92" cy="71" r="2" fill="#0a1628"/>
${I4}<rect x="82" y="70" width="4" height="3" fill="#00e5ff" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<rect x="32" y="78" width="14" height="14" rx="2" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.6"/>
${I4}<ellipse cx="39" cy="94" rx="10" ry="5" fill="#1a237e" stroke="#00e5ff" stroke-width="1.5"/>
${I4}<rect x="34" y="90" width="10" height="3" rx="1" fill="#00e5ff" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<rect x="54" y="78" width="14" height="14" rx="2" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.6"/>
${I4}<ellipse cx="61" cy="94" rx="10" ry="5" fill="#1a237e" stroke="#00e5ff" stroke-width="1.5"/>
${I4}<rect x="56" y="90" width="10" height="3" rx="1" fill="#00e5ff" opacity="0.4"/>
${I3}</g>
${eyes(42, 58, 30, 5.5, 6.5, 'url(#robot-adult-iris)', '#263238')}
${mouths(38, '#00e5ff', 8)}`;

/* ─── EVO4 MIDDLE — battle-scarred engineer ─── */
const evo4Defs = [
  grad('robot-mid-steel', [['0%', '#9e9e9e'], ['40%', '#616161'], ['100%', '#424242']], 'linear'),
  grad('robot-mid-dent', [['0%', '#757575'], ['100%', '#37474f']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  grad('robot-mid-core', [['0%', '#fff8e1'], ['40%', '#ffab40', 0.9], ['100%', '#ff6d00', 0]], 'radial'),
  grad('robot-mid-iris', [['0%', '#ffcc80'], ['55%', '#ff8f00'], ['100%', '#e65100']], 'radial', 'cx="38%" cy="32%" r="62%"'),
  grad('robot-mid-goggle', [['0%', '#37474f'], ['100%', '#212121']], 'radial'),
  grad('robot-mid-belt', [['0%', '#5d4037'], ['100%', '#3e2723']], 'linear'),
  grad('robot-mid-warn', [['0%', '#ffab40'], ['100%', '#ff6d00', 0.5]], 'radial'),
  grad('robot-mid-gloss', [['0%', '#fff', 0.2], ['100%', '#fff', 0]], 'radial', 'cx="35%" cy="25%" r="50%"'),
].join('\n');

const evo4Body = `${I3}<ellipse cx="50" cy="96" rx="32" ry="5" fill="#1a1a1a" opacity="0.26"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 72 Q 82 80 86 68 Q 88 60 80 62" fill="none" stroke="#616161" stroke-width="3" stroke-linecap="round"/>
${I4}<path d="M 78 66 Q 84 62 82 70" fill="none" stroke="#9e9e9e" stroke-width="1" opacity="0.4"/>
${I4}<rect x="82" y="60" width="5" height="5" rx="1" fill="#424242" stroke="#ffab40" stroke-width="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 26 52 L 14 44 L 16 58 L 10 62 L 24 58 Z" fill="url(#robot-mid-steel)" stroke="#616161" stroke-width="1.2" opacity="0.85"/>
${I4}<path d="M 18 50 L 12 46" stroke="#ffab40" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 74 52 L 86 44 L 84 58 L 90 62 L 76 58 Z" fill="url(#robot-mid-steel)" stroke="#616161" stroke-width="1.2" opacity="0.85"/>
${I4}<path d="M 82 50 L 88 46" stroke="#ffab40" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Dented torso -->
${I4}<path d="M 30 50 Q 28 54 30 58 L 32 76 Q 34 80 38 78 L 62 78 Q 66 80 68 76 L 70 58 Q 72 54 70 50 Q 66 46 50 46 Q 34 46 30 50 Z" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="2"/>
${I4}<path d="M 34 54 Q 36 52 38 56 Q 36 58 34 56 Z" fill="url(#robot-mid-dent)" opacity="0.7"/>
${I4}<path d="M 62 60 Q 64 58 66 62 Q 64 64 62 62 Z" fill="url(#robot-mid-dent)" opacity="0.65"/>
${I4}<ellipse cx="40" cy="56" rx="6" ry="3" fill="url(#robot-mid-gloss)"/>
${I4}<circle cx="50" cy="62" r="8" fill="url(#robot-mid-core)"/>
${I4}<circle cx="50" cy="62" r="3.5" fill="#fff8e1" opacity="0.7"/>
${I4}<!-- Amber warning lights -->
${I4}<circle cx="32" cy="52" r="2.5" fill="url(#robot-mid-warn)" stroke="#ff6d00" stroke-width="0.8"/>
${I4}<circle cx="68" cy="52" r="2.5" fill="url(#robot-mid-warn)" stroke="#ff6d00" stroke-width="0.8"/>
${I4}<path d="M 32 50 L 33 54 L 31 54 Z" fill="#ff6d00" opacity="0.8"/>
${I4}<path d="M 68 50 L 69 54 L 67 54 Z" fill="#ff6d00" opacity="0.8"/>
${I4}<!-- Toolbelt -->
${I4}<rect x="32" y="74" width="36" height="5" rx="1.5" fill="url(#robot-mid-belt)" stroke="#3e2723" stroke-width="1"/>
${I4}<rect x="36" y="78" width="3" height="6" rx="0.5" fill="#78909c" stroke="#546e7a" stroke-width="0.6"/>
${I4}<rect x="42" y="78" width="4" height="7" rx="0.5" fill="#ffab40" stroke="#ff6d00" stroke-width="0.6"/>
${I4}<rect x="48" y="78" width="3" height="5" rx="0.5" fill="#607d8b"/>
${I4}<rect x="54" y="78" width="4" height="6" rx="0.5" fill="#78909c" stroke="#546e7a" stroke-width="0.6"/>
${I4}<!-- Head with goggles -->
${I4}<rect x="34" y="24" width="32" height="20" rx="3" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.8"/>
${I4}<rect x="38" y="28" width="24" height="10" rx="2" fill="#263238"/>
${I4}<!-- Welding goggles on forehead -->
${I4}<ellipse cx="42" cy="22" rx="6" ry="4" fill="url(#robot-mid-goggle)" stroke="#212121" stroke-width="1.2"/>
${I4}<ellipse cx="58" cy="22" rx="6" ry="4" fill="url(#robot-mid-goggle)" stroke="#212121" stroke-width="1.2"/>
${I4}<rect x="40" y="20" width="20" height="3" rx="1" fill="#424242"/>
${I4}<ellipse cx="42" cy="22" rx="3" ry="2" fill="#ffab40" opacity="0.4"/>
${I4}<ellipse cx="58" cy="22" rx="3" ry="2" fill="#ffab40" opacity="0.4"/>
${I4}<!-- Scratch marks -->
${I4}<path d="M 36 30 L 40 34" stroke="#757575" stroke-width="0.8" opacity="0.5"/>
${I4}<path d="M 60 32 L 64 36" stroke="#757575" stroke-width="0.8" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<rect x="18" y="52" width="11" height="20" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3" transform="rotate(-14 23.5 62)"/>
${I4}<rect x="16" y="70" width="13" height="8" rx="2" fill="#37474f" stroke="#616161" stroke-width="1"/>
${I4}<circle cx="20" cy="73" r="1.2" fill="#ffab40"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<rect x="71" y="52" width="11" height="20" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3" transform="rotate(14 76.5 62)"/>
${I4}<!-- Wrench in hand -->
${I4}<path d="M 84 68 L 90 62 L 92 64 L 88 70 L 90 74 L 86 72 Z" fill="#78909c" stroke="#546e7a" stroke-width="1"/>
${I4}<circle cx="90" cy="66" r="2.5" fill="none" stroke="#9e9e9e" stroke-width="1.5"/>
${I4}<rect x="84" y="70" width="10" height="5" rx="1.5" fill="#37474f" stroke="#616161" stroke-width="1"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<rect x="34" y="80" width="12" height="12" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3"/>
${I4}<ellipse cx="40" cy="94" rx="9" ry="4" fill="#37474f" stroke="#616161" stroke-width="1.2"/>
${I4}<path d="M 36 92 Q 40 90 44 92" stroke="#757575" stroke-width="0.8" fill="none"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<rect x="54" y="80" width="12" height="12" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3"/>
${I4}<ellipse cx="60" cy="94" rx="9" ry="4" fill="#37474f" stroke="#616161" stroke-width="1.2"/>
${I4}<path d="M 56 92 Q 60 90 64 92" stroke="#757575" stroke-width="0.8" fill="none"/>
${I3}</g>
${eyes(42, 58, 33, 5, 6, 'url(#robot-mid-iris)', '#424242')}
${mouths(40, '#ffab40', 7)}`;

/* ─── EVO5 OLD — ancient sage unit ─── */
const evo5Defs = [
  grad('robot-old-bronze', [['0%', '#bcaaa4'], ['35%', '#8d6e63'], ['70%', '#4db6ac'], ['100%', '#00695c']], 'linear'),
  grad('robot-old-oxide', [['0%', '#80cbc4'], ['50%', '#4db6ac'], ['100%', '#263238']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  grad('robot-old-core', [['0%', '#f3e5f5'], ['40%', '#ce93d8', 0.85], ['100%', '#7b1fa2', 0]], 'radial'),
  grad('robot-old-iris', [['0%', '#b39ddb'], ['55%', '#7e57c2'], ['100%', '#4527a0']], 'radial', 'cx="40%" cy="35%" r="60%"'),
  grad('robot-old-monocle', [['0%', '#e1bee7', 0.6], ['100%', '#7b1fa2', 0.2]], 'radial'),
  grad('robot-old-cable', [['0%', '#78909c'], ['100%', '#455a64']], 'linear'),
  grad('robot-old-aura', [['0%', '#ce93d8', 0.25], ['100%', '#ce93d8', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  grad('robot-old-cane', [['0%', '#a1887f'], ['100%', '#5d4037']], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
].join('\n');

const evo5Body = `${I3}<ellipse cx="50" cy="54" rx="40" ry="38" fill="url(#robot-old-aura)" opacity="0.6"/>
${I3}<ellipse cx="50" cy="98" rx="26" ry="4" fill="#1a1a1a" opacity="0.22"/>
${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 28 58 Q 16 50 14 42 Q 12 38 18 40 Q 24 48 30 56 Z" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="1" opacity="0.75"/>
${I4}<path d="M 20 44 Q 24 50 28 54" stroke="#80cbc4" stroke-width="0.6" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 72 58 Q 84 50 86 42 Q 88 38 82 40 Q 76 48 70 56 Z" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="1" opacity="0.75"/>
${I4}<path d="M 80 44 Q 76 50 72 54" stroke="#80cbc4" stroke-width="0.6" fill="none" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 78 Q 74 86 78 76 Q 80 70 74 70" fill="none" stroke="url(#robot-old-cable)" stroke-width="2.5" stroke-linecap="round"/>
${I4}<circle cx="76" cy="72" r="2" fill="#4db6ac" stroke="#00695c" stroke-width="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Weathered sage chassis -->
${I4}<ellipse cx="50" cy="68" rx="22" ry="20" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.8"/>
${I4}<ellipse cx="44" cy="62" rx="7" ry="4" fill="#fff" opacity="0.08"/>
${I4}<circle cx="50" cy="68" r="9" fill="url(#robot-old-core)"/>
${I4}<circle cx="50" cy="68" r="4" fill="#f3e5f5" opacity="0.65"/>
${I4}<!-- Wisdom glyphs -->
${I4}<path d="M 42 64 L 44 66 L 42 68 L 40 66 Z" fill="#ce93d8" opacity="0.5"/>
${I4}<path d="M 58 64 L 60 66 L 58 68 L 56 66 Z" fill="#ce93d8" opacity="0.5"/>
${I4}<circle cx="50" cy="76" r="1.5" fill="#4db6ac" opacity="0.45"/>
${I4}<path d="M 48 78 L 50 80 L 52 78" stroke="#80cbc4" stroke-width="0.7" fill="none" opacity="0.5"/>
${I4}<!-- Aged head -->
${I4}<ellipse cx="50" cy="36" rx="16" ry="14" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.6"/>
${I4}<ellipse cx="44" cy="32" rx="5" ry="2.5" fill="#fff" opacity="0.1"/>
${I4}<!-- Bent antenna -->
${I4}<path d="M 50 22 Q 44 14 48 8 Q 52 12 50 22" fill="none" stroke="#8d6e63" stroke-width="1.8" stroke-linecap="round"/>
${I4}<circle cx="47" cy="9" r="2" fill="#ce93d8" stroke="#7b1fa2" stroke-width="0.8" opacity="0.8"/>
${I4}<!-- Patina marks -->
${I4}<path d="M 38 38 Q 40 36 42 38" stroke="#4db6ac" stroke-width="0.6" fill="none" opacity="0.4"/>
${I4}<path d="M 58 38 Q 60 36 62 38" stroke="#4db6ac" stroke-width="0.6" fill="none" opacity="0.4"/>
${I4}<!-- Cable beard -->
${I4}<path d="M 40 44 Q 32 54 36 62 L 40 58 Q 38 50 40 46 Z" fill="#90a4ae" stroke="#607d8b" stroke-width="0.8" opacity="0.85"/>
${I4}<path d="M 50 46 Q 46 58 48 66 L 52 64 Q 50 54 50 48 Z" fill="#b0bec5" stroke="#78909c" stroke-width="0.8" opacity="0.8"/>
${I4}<path d="M 60 44 Q 68 54 64 62 L 60 58 Q 62 50 60 46 Z" fill="#90a4ae" stroke="#607d8b" stroke-width="0.8" opacity="0.85"/>
${I4}<line x1="38" y1="50" x2="34" y2="58" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
${I4}<line x1="50" y1="52" x2="49" y2="62" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
${I4}<line x1="62" y1="50" x2="66" y2="58" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="30" cy="66" rx="5" ry="9" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.2"/>
${I4}<ellipse cx="28" cy="74" rx="4" ry="4.5" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="70" cy="66" rx="5" ry="9" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.2"/>
${I4}<ellipse cx="72" cy="74" rx="4" ry="4.5" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="0.8"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="42" cy="90" rx="6" ry="4" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1"/>
${I4}<ellipse cx="42" cy="94" rx="5" ry="2.5" fill="#4db6ac" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="58" cy="90" rx="6" ry="4" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1"/>
${I4}<!-- Cane -->
${I4}<line x1="64" y1="72" x2="70" y2="96" stroke="url(#robot-old-cane)" stroke-width="3" stroke-linecap="round"/>
${I4}<line x1="64" y1="72" x2="70" y2="96" stroke="#bcaaa4" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
${I4}<circle cx="63" cy="70" r="3.5" fill="#4db6ac" stroke="#00695c" stroke-width="1"/>
${I4}<circle cx="63.5" cy="69.5" r="1.2" fill="#ce93d8" opacity="0.75"/>
${I4}<ellipse cx="58" cy="94" rx="5" ry="2.5" fill="#4db6ac" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="43" cy="34" rx="4.5" ry="5" fill="#fff" stroke="#5d4037" stroke-width="1.2"/>
${I4}<ellipse cx="57" cy="34" rx="4.5" ry="5" fill="#fff" stroke="#5d4037" stroke-width="1.2"/>
${I4}<ellipse cx="43.5" cy="34.5" rx="2.5" ry="2.8" fill="url(#robot-old-iris)"/>
${I4}<ellipse cx="57.5" cy="34.5" rx="2.5" ry="2.8" fill="url(#robot-old-iris)"/>
${I4}<ellipse cx="43.5" cy="35" rx="1.2" ry="1.5" fill="#1a0a2e"/>
${I4}<ellipse cx="57.5" cy="35" rx="1.2" ry="1.5" fill="#1a0a2e"/>
${I4}<circle cx="44.5" cy="32.5" r="1" fill="#fff" opacity="0.9"/>
${I4}<circle cx="58.5" cy="32.5" r="1" fill="#fff" opacity="0.9"/>
${I4}<!-- Monocle LED on right eye -->
${I4}<circle cx="57" cy="34" r="6" fill="none" stroke="url(#robot-old-monocle)" stroke-width="1.2"/>
${I4}<line x1="63" cy="34" x2="68" cy="32" stroke="#8d6e63" stroke-width="1" stroke-linecap="round"/>
${I4}<circle cx="68" cy="32" r="1" fill="#ce93d8"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M 39 34 Q 43 31 47 34" stroke="#5d4037" stroke-width="1.8" fill="none" stroke-linecap="round"/>
${I4}<path d="M 53 34 Q 57 31 61 34" stroke="#5d4037" stroke-width="1.8" fill="none" stroke-linecap="round"/>
${I3}</g>
${mouths(42, '#7b1fa2', 6)}`;

export const robotSvg = `${I}<!-- ROBOT CHARACTER - All Life Stages (dense cute epic v3) -->
${I}<!-- Plasma & Code • Epic Rarity • Neon Colossus -->
${I}<!-- ═══════════════════════════════════════ -->

${wrap('tm-mascot-baby-robot', 'BABY — chubby cube spawn', babyDefs, babyBody)}${wrap('tm-mascot-evo1-robot', 'KID — tread scout', evo1Defs, evo1Body)}${wrap('tm-mascot-evo2-robot', 'TEEN — sleek visor mecha', evo2Defs, evo2Body)}${wrap('tm-mascot-evo3-robot', 'ADULT — Neon Colossus', evo3Defs, evo3Body)}${wrap('tm-mascot-evo4-robot', 'MIDDLE AGE — battle-scarred engineer', evo4Defs, evo4Body)}${wrap('tm-mascot-evo5-robot', 'OLD — ancient sage unit', evo5Defs, evo5Body)}
`;
