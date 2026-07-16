/**
 * Abyssal Ooze slime mascots — dense cute epic goo v4
 * Cartoony dragon-quality eyes, wet gloss, toxic/void arc.
 * Exports slimeSvg; run directly to patch myman_mascot.js (CRLF-aware).
 */
import fs from 'fs';

const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};
const HOOKS = [
  'tm-animate-body', 'tm-animate-arm-left', 'tm-animate-arm-right',
  'tm-animate-leg-left', 'tm-animate-leg-right', 'tm-animate-tail',
  'tm-animate-wing-left', 'tm-animate-wing-right',
  'tm-mascot-eye-open', 'tm-mascot-eye-closed',
  'tm-mascot-mouth-happy', 'tm-mascot-mouth-sad',
];

function grad(id, stops, type = 'radial', attrs = 'cx="38%" cy="28%" r="72%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = type === 'linear' ? (attrs || 'x1="0%" y1="0%" x2="0%" y2="100%"') : attrs;
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Dragon-style cartoony eyes: white sclera, iris, pupil, dual highlights + cheeks */
function cartoonEyes(p, lx, rx, cy, rxEye, ryEye, stroke, sclera = '#fff') {
  const hi = Math.max(1.6, rxEye * 0.32);
  const hi2 = Math.max(0.75, rxEye * 0.14);
  return `${I3}<!-- Cheeks -->
${I3}<circle cx="${lx - 7}" cy="${cy + 7}" r="4.2" fill="url(#${p}-cheek)"/>
${I3}<circle cx="${rx + 7}" cy="${cy + 7}" r="4.2" fill="url(#${p}-cheek)"/>
${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${rxEye}" ry="${ryEye}" fill="${sclera}" stroke="${stroke}" stroke-width="1.5"/>
${I4}<ellipse cx="${lx + 0.5}" cy="${cy + 0.5}" rx="${rxEye * 0.56}" ry="${ryEye * 0.58}" fill="url(#${p}-iris)"/>
${I4}<ellipse cx="${rx + 0.5}" cy="${cy + 0.5}" rx="${rxEye * 0.56}" ry="${ryEye * 0.58}" fill="url(#${p}-iris)"/>
${I4}<ellipse cx="${lx + 0.6}" cy="${cy + 0.8}" rx="${rxEye * 0.29}" ry="${ryEye * 0.33}" fill="#0a1208"/>
${I4}<ellipse cx="${rx + 0.6}" cy="${cy + 0.8}" rx="${rxEye * 0.29}" ry="${ryEye * 0.33}" fill="#0a1208"/>
${I4}<circle cx="${lx + 1.5}" cy="${cy - ryEye * 0.38}" r="${hi}" fill="#fff" opacity="0.96"/>
${I4}<circle cx="${rx + 1.5}" cy="${cy - ryEye * 0.38}" r="${hi}" fill="#fff" opacity="0.96"/>
${I4}<circle cx="${lx - 1.2}" cy="${cy + ryEye * 0.35}" r="${hi2}" fill="#fff" opacity="0.45"/>
${I4}<circle cx="${rx - 1.2}" cy="${cy + ryEye * 0.35}" r="${hi2}" fill="#fff" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - rxEye} ${cy} Q ${lx} ${cy - 3.5} ${lx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - rxEye} ${cy} Q ${rx} ${cy - 3.5} ${rx + rxEye} ${cy}" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function mouths(y, stroke, span = 8, happyDip = 6) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - span} ${y} Q 50 ${y + happyDip} ${50 + span} ${y}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - span} ${y + 2} Q 50 ${y - 5} ${50 + span} ${y + 2}" stroke="${stroke}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
}

function wingPlaceholders(cy = 50) {
  return `${I3}<g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="${cy}" r="1"/></g>
${I3}<g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="${cy}" r="1"/></g>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- SLIME ${STAGE_LABEL[stage]} — ${title} -->
${I}<g id="tm-mascot-${stage}-slime" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function slimeBaby() {
  const p = 'slime-baby';
  const stroke = '#1b5e20';
  const rim = '#69f0ae';
  const defs = [
    grad(`${p}-body`, [['0%', '#a5d6a7', 0.65], ['30%', '#43a047', 0.9], ['65%', '#1b5e20', 0.97], ['100%', '#02140c', 1]]),
    grad(`${p}-core`, [['0%', '#eeff41', 0.95], ['45%', '#76ff03', 0.6], ['100%', '#1b5e20', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#c6ff00'], ['100%', '#33691e']], 'radial', 'cx="40%" cy="35%" r="60%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.58], ['100%', '#ffffff', 0]], 'radial', 'cx="32%" cy="22%" r="48%"'),
    grad(`${p}-cheek`, [['0%', '#76ff03', 0.5], ['100%', '#76ff03', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-aura`, [['0%', '#b2ff59', 0.18], ['100%', '#b2ff59', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="90" rx="20" ry="4" fill="#1a1a1a" opacity="0.2"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 56 76 Q 66 82 68 74 Q 70 68 64 70 Z" fill="#0d3b1e" stroke="${rim}" stroke-width="1"/>
${I4}<ellipse cx="66" cy="72" rx="2.5" ry="3" fill="#76ff03" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="30" cy="64" rx="5.5" ry="7" fill="#143d22" stroke="${rim}" stroke-width="1.2" transform="rotate(-28 30 64)"/>
${I4}<ellipse cx="26" cy="70" rx="3.5" ry="4" fill="#1b5e20" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="70" cy="64" rx="5.5" ry="7" fill="#143d22" stroke="${rim}" stroke-width="1.2" transform="rotate(28 70 64)"/>
${I4}<ellipse cx="74" cy="70" rx="3.5" ry="4" fill="#1b5e20" opacity="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<ellipse cx="50" cy="58" rx="24" ry="26" fill="url(#${p}-aura)" opacity="0.55"/>
${I4}<!-- Tiny round droplet -->
${I4}<path d="M 32 72 Q 28 54 38 40 Q 44 30 50 28 Q 58 30 64 42 Q 70 56 66 72 Q 62 84 50 86 Q 38 84 32 72 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2"/>
${I4}<ellipse cx="40" cy="42" rx="9" ry="6" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="43" cy="38" rx="3.2" ry="1.8" fill="#fff" opacity="0.42"/>
${I4}<circle cx="36" cy="52" r="2.2" fill="#fff" opacity="0.28"/>
${I4}<circle cx="58" cy="56" r="1.6" fill="#b2ff59" opacity="0.35"/>
${I4}<circle cx="52" cy="46" r="1.3" fill="#fff" opacity="0.3"/>
${I4}<ellipse cx="50" cy="60" rx="10" ry="12" fill="url(#${p}-core)" opacity="0.82"/>
${I4}<circle cx="50" cy="62" r="3.5" fill="#eeff41" opacity="0.55"/>
${I4}<!-- Bubble highlights -->
${I4}<circle cx="38" cy="68" r="2.4" fill="#b2ff59" opacity="0.38"/>
${I4}<circle cx="62" cy="70" r="1.8" fill="#69f0ae" opacity="0.32"/>
${I4}<ellipse cx="47" cy="82" rx="1.8" ry="3" fill="#1b5e20" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="42" cy="84" rx="4.5" ry="2.8" fill="#0d3b1e" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 42 86 Q 41 90 42 92" stroke="#143d22" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.75"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="58" cy="85" rx="4" ry="2.5" fill="#0d3b1e" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 58 87 Q 59 91 58 93" stroke="#143d22" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
${I3}</g>
${cartoonEyes(p, 41, 59, 46, 7.5, 8.5, stroke)}
${mouths(64, '#558b2f', 7, 5.5)}
${wingPlaceholders(48)}`;

  return wrapStage('baby', 'wet toxic droplet', defs, body);
}

function slimeKid() {
  const p = 'slime-kid';
  const stroke = '#2e7d32';
  const rim = '#76ff03';
  const defs = [
    grad(`${p}-body`, [['0%', '#c5e1a5', 0.55], ['28%', '#66bb6a', 0.88], ['62%', '#2e7d32', 0.96], ['100%', '#03140c', 1]]),
    grad(`${p}-core`, [['0%', '#ffff00', 0.9], ['42%', '#76ff03', 0.58], ['100%', '#004d40', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#eeff41'], ['100%', '#1b5e20']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.52], ['100%', '#ffffff', 0]], 'radial', 'cx="30%" cy="20%" r="50%"'),
    grad(`${p}-cheek`, [['0%', '#aeea00', 0.48], ['100%', '#aeea00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="92" rx="26" ry="4.5" fill="#1a1a1a" opacity="0.24"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 58 78 Q 74 86 78 72 Q 80 64 72 66 Q 64 72 58 78 Z" fill="#0d3b1e" stroke="${rim}" stroke-width="1.1"/>
${I4}<ellipse cx="74" cy="70" rx="3" ry="4" fill="#76ff03" opacity="0.35"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 32 58 Q 18 58 12 48 Q 8 40 16 42 Q 22 50 28 56 Z" fill="#143d22" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="14" cy="44" rx="4.5" ry="5.5" fill="#1b5e20" opacity="0.85"/>
${I4}<circle cx="12" cy="42" r="1.4" fill="#76ff03" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 68 58 Q 82 58 88 48 Q 92 40 84 42 Q 78 50 72 56 Z" fill="#143d22" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="86" cy="44" rx="4.5" ry="5.5" fill="#1b5e20" opacity="0.85"/>
${I4}<circle cx="88" cy="42" r="1.4" fill="#76ff03" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Stretchier playful blob -->
${I4}<path d="M 26 70 Q 22 48 34 32 Q 42 20 50 18 Q 60 20 68 34 Q 78 50 74 72 Q 70 88 56 92 Q 50 94 44 92 Q 28 88 26 70 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.1"/>
${I4}<ellipse cx="38" cy="38" rx="12" ry="8" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="42" cy="34" rx="4.2" ry="2.2" fill="#fff" opacity="0.35"/>
${I4}<ellipse cx="50" cy="56" rx="13" ry="15" fill="url(#${p}-core)" opacity="0.78"/>
${I4}<circle cx="50" cy="58" r="5" fill="#eeff41" opacity="0.5"/>
${I4}<circle cx="36" cy="68" r="2.6" fill="#b2ff59" opacity="0.32"/>
${I4}<circle cx="64" cy="72" r="2" fill="#69f0ae" opacity="0.28"/>
${I4}<!-- More drips -->
${I4}<path d="M 44 88 Q 42 96 44 98" stroke="#1b5e20" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<path d="M 54 90 Q 56 98 54 100" stroke="#143d22" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<ellipse cx="44" cy="98" rx="2.2" ry="1.8" fill="#0d3b1e" opacity="0.7"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="40" cy="86" rx="7" ry="3.8" fill="#0a2416" stroke="${stroke}" stroke-width="1.2"/>
${I4}<path d="M 38 88 Q 36 94 38 96" stroke="#143d22" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.72"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="60" cy="87" rx="6.5" ry="3.5" fill="#0a2416" stroke="${stroke}" stroke-width="1.2"/>
${I4}<path d="M 62 89 Q 64 95 62 97" stroke="#143d22" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.68"/>
${I3}</g>
${cartoonEyes(p, 40, 60, 44, 7.2, 8.2, stroke)}
${mouths(62, '#558b2f', 9, 7)}
${wingPlaceholders(46)}`;

  return wrapStage('evo1', 'stretchy jelly lump', defs, body);
}

function slimeTeen() {
  const p = 'slime-teen';
  const stroke = '#1b5e20';
  const rim = '#aeea00';
  const defs = [
    grad(`${p}-body`, [['0%', '#b2dfdb', 0.42], ['22%', '#4caf50', 0.82], ['58%', '#1b5e20', 0.96], ['100%', '#010a06', 1]]),
    grad(`${p}-core`, [['0%', '#ffff8d', 0.98], ['38%', '#76ff03', 0.65], ['100%', '#004d40', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#eeff41'], ['65%', '#558b2f'], ['100%', '#0a1f0a']], 'radial', 'cx="35%" cy="30%" r="65%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.5], ['100%', '#ffffff', 0]], 'radial', 'cx="28%" cy="18%" r="52%"'),
    grad(`${p}-cheek`, [['0%', '#c6ff00', 0.42], ['100%', '#c6ff00', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-acid`, [['0%', '#eeff41', 0.7], ['100%', '#76ff03', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#1a1a1a" opacity="0.28"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 64 76 Q 84 84 90 68 Q 92 58 82 60 Q 70 68 64 76 Z" fill="#0a2416" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="86" cy="64" rx="4" ry="5" fill="#76ff03" opacity="0.38"/>
${I4}<circle cx="88" cy="62" r="1.5" fill="#eeff41" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 28 54 Q 10 50 6 38 Q 2 28 12 30 Q 18 40 24 50 Z" fill="#0d3b1e" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="8" cy="32" rx="5.5" ry="6.5" fill="#1b5e20" opacity="0.88"/>
${I4}<path d="M 6 28 Q 2 24 4 22" stroke="#76ff03" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.6"/>
${I4}<path d="M 4 26 Q 0 22 2 20" stroke="#76ff03" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 54 Q 90 50 94 38 Q 98 28 88 30 Q 82 40 76 50 Z" fill="#0d3b1e" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="92" cy="32" rx="5.5" ry="6.5" fill="#1b5e20" opacity="0.88"/>
${I4}<path d="M 94 28 Q 98 24 96 22" stroke="#76ff03" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.6"/>
${I4}<path d="M 96 26 Q 100 22 98 20" stroke="#76ff03" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Taller predatory goo -->
${I4}<path d="M 22 68 Q 18 42 30 26 Q 40 12 50 10 Q 62 12 72 28 Q 82 44 78 68 Q 76 88 62 94 Q 50 98 38 94 Q 24 88 22 68 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.3"/>
${I4}<ellipse cx="36" cy="34" rx="14" ry="10" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="40" cy="30" rx="5" ry="2.5" fill="#fff" opacity="0.3"/>
${I4}<ellipse cx="50" cy="54" rx="16" ry="18" fill="url(#${p}-core)" opacity="0.85"/>
${I4}<ellipse cx="50" cy="56" rx="10" ry="12" fill="url(#${p}-acid)" opacity="0.55"/>
${I4}<circle cx="50" cy="58" r="6" fill="#eeff41" opacity="0.58"/>
${I4}<circle cx="47" cy="54" r="1.8" fill="#fffde7" opacity="0.48"/>
${I4}<circle cx="38" cy="68" r="2.8" fill="#b2ff59" opacity="0.3"/>
${I4}<circle cx="62" cy="72" r="2.2" fill="#69f0ae" opacity="0.26"/>
${I4}<path d="M 42 90 Q 40 100 42 102" stroke="#1b5e20" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.76"/>
${I4}<path d="M 52 92 Q 54 102 52 104" stroke="#0d3b1e" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<ellipse cx="42" cy="102" rx="2.5" ry="2" fill="#143d22" opacity="0.72"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="36" cy="88" rx="9" ry="5" fill="#0a2416" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 34 90 Q 32 98 34 100" stroke="#143d22" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.74"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="64" cy="88" rx="9" ry="5" fill="#0a2416" stroke="${stroke}" stroke-width="1.3"/>
${I4}<path d="M 66 90 Q 68 98 66 100" stroke="#143d22" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.7"/>
${I3}</g>
${cartoonEyes(p, 39, 61, 40, 6.8, 7.8, stroke)}
${mouths(58, '#33691e', 10, 8)}
${I3}<path d="M 44 57 L 43 61 M 56 57 L 57 61" stroke="#eeff41" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
${wingPlaceholders(42)}`;

  return wrapStage('evo2', 'predatory goo blob', defs, body);
}

function slimeAdult() {
  const p = 'slime-adult';
  const stroke = '#0d2818';
  const rim = '#69f0ae';
  const defs = [
    grad(`${p}-body`, [['0%', '#c8e6c9', 0.45], ['18%', '#66bb6a', 0.78], ['50%', '#2e7d32', 0.94], ['100%', '#010a06', 1]]),
    grad(`${p}-layer`, [['0%', '#a5d6a7', 0.35], ['100%', '#1b5e20', 0]], 'radial', 'cx="50%" cy="45%" r="55%"'),
    grad(`${p}-core`, [['0%', '#ffff00', 0.96], ['32%', '#76ff03', 0.68], ['100%', '#004d40', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ffff8d'], ['50%', '#aeea00'], ['100%', '#1b5e20']], 'radial', 'cx="35%" cy="28%" r="65%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.55], ['100%', '#ffffff', 0]], 'radial', 'cx="26%" cy="16%" r="54%"'),
    grad(`${p}-cheek`, [['0%', '#76ff03', 0.4], ['100%', '#76ff03', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-rim`, [['60%', '#69f0ae', 0], ['100%', '#69f0ae', 0.28]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="96" rx="34" ry="5" fill="#1a1a1a" opacity="0.3"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 66 78 Q 88 88 94 70 Q 96 58 86 60 Q 72 68 66 78 Z" fill="#0a2416" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="90" cy="66" rx="5" ry="6" fill="#76ff03" opacity="0.32"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 26 56 Q 8 52 4 40 Q 0 28 10 30 Q 16 40 22 52 Z" fill="#0d3b1e" stroke="${rim}" stroke-width="1.4"/>
${I4}<ellipse cx="6" cy="32" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.86"/>
${I4}<ellipse cx="4" cy="28" rx="2.5" ry="3" fill="#76ff03" opacity="0.38"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 74 56 Q 92 52 96 40 Q 100 28 90 30 Q 84 40 78 52 Z" fill="#0d3b1e" stroke="${rim}" stroke-width="1.4"/>
${I4}<ellipse cx="94" cy="32" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.86"/>
${I4}<ellipse cx="96" cy="28" rx="2.5" ry="3" fill="#76ff03" opacity="0.38"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Majestic jelly mass — layered translucency, heroic stance -->
${I4}<path d="M 18 72 Q 14 46 28 28 Q 38 12 50 10 Q 64 12 76 32 Q 86 52 82 74 Q 80 90 64 96 Q 50 100 36 96 Q 20 90 18 72 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.5"/>
${I4}<ellipse cx="50" cy="58" rx="30" ry="34" fill="url(#${p}-rim)"/>
${I4}<ellipse cx="50" cy="62" rx="22" ry="26" fill="url(#${p}-layer)" opacity="0.65"/>
${I4}<ellipse cx="36" cy="32" rx="16" ry="12" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="40" cy="28" rx="6" ry="3" fill="#fff" opacity="0.3"/>
${I4}<ellipse cx="50" cy="58" rx="17" ry="21" fill="url(#${p}-core)" opacity="0.84"/>
${I4}<circle cx="50" cy="60" r="7.5" fill="#eeff41" opacity="0.52"/>
${I4}<circle cx="47" cy="56" r="2" fill="#fffde7" opacity="0.5"/>
${I4}<circle cx="36" cy="66" r="3.2" fill="#b2ff59" opacity="0.28"/>
${I4}<circle cx="64" cy="70" r="2.6" fill="#69f0ae" opacity="0.26"/>
${I4}<circle cx="56" cy="40" r="1.8" fill="#fff" opacity="0.18"/>
${I4}<!-- Dramatic drips -->
${I4}<path d="M 38 92 Q 36 104 38 108" stroke="#1b5e20" stroke-width="4.2" fill="none" stroke-linecap="round" opacity="0.78"/>
${I4}<path d="M 50 94 Q 52 106 50 110" stroke="#0d3b1e" stroke-width="3.8" fill="none" stroke-linecap="round" opacity="0.74"/>
${I4}<path d="M 60 92 Q 62 100 60 104" stroke="#143d22" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<ellipse cx="38" cy="108" rx="3.2" ry="2.5" fill="#0a2416" opacity="0.78"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="36" cy="90" rx="10" ry="5.5" fill="#0a2416" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 34 92 Q 32 100 34 104" stroke="#143d22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity="0.76"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="64" cy="90" rx="10" ry="5.5" fill="#0a2416" stroke="${stroke}" stroke-width="1.5"/>
${I4}<path d="M 66 92 Q 68 100 66 104" stroke="#143d22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity="0.72"/>
${I3}</g>
${cartoonEyes(p, 38, 62, 38, 6.8, 7.8, stroke)}
${mouths(56, '#1b5e20', 11, 8)}
${wingPlaceholders(44)}`;

  return wrapStage('evo3', 'majestic jelly mass', defs, body);
}

function slimeMiddle() {
  const p = 'slime-middle';
  const stroke = '#33691e';
  const rim = '#ffab40';
  const defs = [
    grad(`${p}-body`, [['0%', '#aed581', 0.44], ['24%', '#558b2f', 0.82], ['58%', '#33691e', 0.95], ['100%', '#020f0a', 1]]),
    grad(`${p}-core`, [['0%', '#ff6d00', 0.88], ['40%', '#eeff41', 0.55], ['100%', '#1b5e20', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ffab40'], ['100%', '#33691e']], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.42], ['100%', '#ffffff', 0]], 'radial', 'cx="30%" cy="22%" r="50%"'),
    grad(`${p}-cheek`, [['0%', '#ff8a65', 0.45], ['100%', '#ff8a65', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-crack`, [['0%', '#ff6d00', 0.75], ['100%', '#ffab40', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="96" rx="32" ry="4.5" fill="#1a1a1a" opacity="0.32"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 62 80 Q 80 88 86 74 Q 88 66 78 68 Q 68 74 62 80 Z" fill="#0a2416" stroke="${rim}" stroke-width="1.2"/>
${I4}<ellipse cx="82" cy="72" rx="3.5" ry="4" fill="#ff6d00" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 28 62 Q 12 64 8 52 Q 4 42 14 44 Q 20 52 26 60 Z" fill="#143d22" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="10" cy="46" rx="5.5" ry="6.5" fill="#33691e" opacity="0.82"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 62 Q 88 64 92 52 Q 96 42 86 44 Q 80 52 74 60 Z" fill="#143d22" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="90" cy="46" rx="5.5" ry="6.5" fill="#33691e" opacity="0.82"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Heavy molten ooze — orange core cracks, no crust plates -->
${I4}<path d="M 22 72 Q 18 50 30 34 Q 40 22 50 20 Q 62 22 72 36 Q 82 52 78 74 Q 76 90 62 96 Q 50 100 38 96 Q 24 90 22 72 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.4"/>
${I4}<ellipse cx="36" cy="38" rx="13" ry="9" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="40" cy="34" rx="4.5" ry="2.2" fill="#fff" opacity="0.24"/>
${I4}<ellipse cx="50" cy="58" rx="15" ry="17" fill="url(#${p}-core)" opacity="0.78"/>
${I4}<path d="M 42 52 Q 50 48 58 54 Q 54 66 48 68 Q 42 64 42 52 Z" fill="url(#${p}-crack)" opacity="0.32"/>
${I4}<path d="M 46 56 L 52 62 M 48 50 L 54 56" stroke="#ff6d00" stroke-width="1.4" fill="none" opacity="0.55" stroke-linecap="round"/>
${I4}<path d="M 44 64 Q 50 60 56 66" stroke="#ffab40" stroke-width="1.2" fill="none" opacity="0.45"/>
${I4}<circle cx="50" cy="60" r="4.5" fill="#ffab40" opacity="0.58"/>
${I4}<circle cx="38" cy="68" r="2.4" fill="#eeff41" opacity="0.26"/>
${I4}<circle cx="62" cy="72" r="2" fill="#ff6d00" opacity="0.32"/>
${I4}<!-- Slow thick drips -->
${I4}<path d="M 42 90 Q 40 102 42 106" stroke="#33691e" stroke-width="4.8" fill="none" stroke-linecap="round" opacity="0.82"/>
${I4}<path d="M 54 92 Q 56 104 54 108" stroke="#1b5e20" stroke-width="4.4" fill="none" stroke-linecap="round" opacity="0.78"/>
${I4}<ellipse cx="42" cy="106" rx="3.5" ry="2.5" fill="#0a2416" opacity="0.82"/>
${I4}<ellipse cx="54" cy="108" rx="3" ry="2" fill="#0a2416" opacity="0.78"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="90" rx="10" ry="6" fill="#0a2416" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="36" cy="94" rx="4" ry="3" fill="#1b5e20" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="90" rx="10" ry="6" fill="#0a2416" stroke="${stroke}" stroke-width="1.4"/>
${I4}<ellipse cx="64" cy="94" rx="4" ry="3" fill="#1b5e20" opacity="0.5"/>
${I3}</g>
${cartoonEyes(p, 41, 59, 44, 6.2, 6.8, stroke, '#fff8e1')}
${mouths(56, '#558b2f', 8, 5)}
${wingPlaceholders(48)}`;

  return wrapStage('evo4', 'heavy molten ooze', defs, body);
}

function slimeOld() {
  const p = 'slime-old';
  const stroke = '#0d2818';
  const rim = '#ea80fc';
  const defs = [
    grad(`${p}-body`, [['0%', '#4caf50', 0.48], ['28%', '#1b5e20', 0.9], ['68%', '#0d2818', 0.97], ['100%', '#010805', 1]]),
    grad(`${p}-aura`, [['0%', '#76ff03', 0.24], ['100%', '#76ff03', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-core`, [['0%', '#e040fb', 0.88], ['42%', '#76ff03', 0.48], ['100%', '#004d40', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-iris`, [['0%', '#ea80fc'], ['100%', '#1a237e']], 'radial', 'cx="40%" cy="35%" r="60%"'),
    grad(`${p}-gloss`, [['0%', '#ffffff', 0.4], ['100%', '#ffffff', 0]], 'radial', 'cx="34%" cy="28%" r="48%"'),
    grad(`${p}-cheek`, [['0%', '#ce93d8', 0.42], ['100%', '#ce93d8', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-void`, [['0%', '#7c4dff', 0.55], ['100%', '#311b92', 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
  ].join('\n');

  const body = `${I3}<ellipse cx="50" cy="58" rx="48" ry="44" fill="url(#${p}-aura)"/>
${I3}<ellipse cx="50" cy="96" rx="40" ry="5" fill="#1a1a1a" opacity="0.38"/>
${I3}<ellipse cx="50" cy="90" rx="38" ry="12" fill="#010805" opacity="0.78"/>
${I3}<ellipse cx="26" cy="88" rx="10" ry="5" fill="#0a2416" opacity="0.58"/>
${I3}<ellipse cx="76" cy="89" rx="9" ry="4.5" fill="#0a2416" opacity="0.52"/>
${I3}<g class="tm-animate-tail">
${I4}<path d="M 60 82 Q 82 92 90 74 Q 92 64 80 66 Q 68 74 60 82 Z" fill="#02140c" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="86" cy="70" rx="4" ry="5" fill="#e040fb" opacity="0.38"/>
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 26 70 Q 8 74 2 58 Q -2 46 8 48 Q 14 58 22 68 Z" fill="#0d2818" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="4" cy="52" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.78"/>
${I4}<circle cx="4" cy="50" r="2" fill="#e040fb" opacity="0.48"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 74 70 Q 92 74 98 58 Q 102 46 92 48 Q 86 58 78 68 Z" fill="#0d2818" stroke="${rim}" stroke-width="1.3"/>
${I4}<ellipse cx="96" cy="52" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.78"/>
${I4}<circle cx="96" cy="50" r="2" fill="#e040fb" opacity="0.48"/>
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<!-- Sprawling primordial puddle -->
${I4}<path d="M 14 76 Q 12 50 26 36 Q 38 24 50 22 Q 64 24 76 40 Q 88 56 86 76 Q 84 90 68 96 Q 50 100 32 96 Q 16 90 14 76 Z"
${I4}      fill="url(#${p}-body)" stroke="${stroke}" stroke-width="2.5"/>
${I4}<ellipse cx="38" cy="42" rx="14" ry="10" fill="url(#${p}-gloss)"/>
${I4}<ellipse cx="42" cy="38" rx="5" ry="2.5" fill="#fff" opacity="0.22"/>
${I4}<ellipse cx="50" cy="64" rx="18" ry="15" fill="url(#${p}-core)" opacity="0.86"/>
${I4}<ellipse cx="50" cy="66" rx="10" ry="8" fill="url(#${p}-void)" opacity="0.45"/>
${I4}<circle cx="50" cy="66" r="6.5" fill="#ea80fc" opacity="0.58"/>
${I4}<circle cx="47" cy="62" r="1.8" fill="#f3e5f5" opacity="0.52"/>
${I4}<circle cx="34" cy="60" r="3" fill="#76ff03" opacity="0.26"/>
${I4}<circle cx="66" cy="66" r="2.5" fill="#ea80fc" opacity="0.3"/>
${I4}<!-- Third eye floating in goo -->
${I4}<ellipse cx="50" cy="38" rx="5" ry="4" fill="#010a06" stroke="${rim}" stroke-width="1.2" opacity="0.92"/>
${I4}<ellipse cx="50" cy="38" rx="2.6" ry="2.2" fill="url(#${p}-iris)"/>
${I4}<ellipse cx="50.2" cy="38.2" rx="1.1" ry="1.4" fill="#0a0618"/>
${I4}<circle cx="50.8" cy="37" r="0.85" fill="#f3e5f5"/>
${I4}<!-- Drip fringe -->
${I4}<path d="M 28 90 Q 26 100 28 102" stroke="#0d2818" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
${I4}<path d="M 42 94 Q 40 106 42 108" stroke="#1b5e20" stroke-width="4.2" fill="none" stroke-linecap="round" opacity="0.8"/>
${I4}<path d="M 54 94 Q 56 106 54 108" stroke="#1b5e20" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.76"/>
${I4}<path d="M 68 90 Q 70 100 68 102" stroke="#0d2818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
${I4}<path d="M 36 88 Q 34 94 36 96" stroke="#33691e" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
${I4}<path d="M 62 88 Q 64 94 62 96" stroke="#33691e" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.58"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${I4}<ellipse cx="38" cy="92" rx="11" ry="5" fill="#02140c" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 34 94 Q 30 102 32 104" stroke="#0d2818" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="62" cy="92" rx="11" ry="5" fill="#02140c" stroke="${stroke}" stroke-width="1.4"/>
${I4}<path d="M 66 94 Q 70 102 68 104" stroke="#0d2818" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.68"/>
${I3}</g>
${cartoonEyes(p, 39, 61, 52, 5.8, 6.5, stroke)}
${mouths(64, '#69f0ae', 9, 5.5)}
${wingPlaceholders(54)}`;

  return wrapStage('evo5', 'sprawling primordial puddle', defs, body);
}

export const slimeSvg = [
  `${I}<!-- SLIME CHARACTER - All Life Stages (dense cute epic goo v4) -->`,
  `${I}<!-- Liquid & Bounce • Rare Rarity • Abyssal Ooze -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  slimeBaby(),
  slimeKid(),
  slimeTeen(),
  slimeAdult(),
  slimeMiddle(),
  slimeOld(),
  `${I}<!-- ═══════════════════════════════════════ -->`,
].join('\n');

function normalize(svg, nl) {
  let s = String(svg).replace(/\r\n/g, '\n').replace(/\n/g, nl);
  if (!s.endsWith(nl)) s += nl;
  return s;
}

function replaceBetween(hay, startNeedle, endNeedle, replacement) {
  const start = hay.indexOf(startNeedle);
  const end = hay.indexOf(endNeedle);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`markers fail: ${startNeedle.slice(0, 50)} (${start}) → ${endNeedle.slice(0, 50)} (${end})`);
  }
  return hay.slice(0, start) + replacement + hay.slice(end);
}

function validateHooks(src) {
  const issues = [];
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-slime`;
    const idx = src.indexOf(`id="${id}"`);
    if (idx < 0) { issues.push(`missing ${id}`); continue; }
    const next = src.indexOf('id="tm-mascot-', idx + 12);
    const chunk = src.slice(idx, next > 0 ? next : idx + 14000);
    for (const h of HOOKS) {
      if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
    }
  }
  return issues;
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-slime.mjs');

if (isMain) {
  const path = 'myman_mascot.js';
  let src = fs.readFileSync(path, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';

  src = replaceBetween(
    src,
    '                <!-- SLIME CHARACTER - All Life Stages',
    '                <!-- PLANT CHARACTER - All Life Stages',
    normalize(slimeSvg, nl),
  );

  const issues = validateHooks(src);
  if (issues.length) {
    console.error('VALIDATION FAILED', issues.length);
    issues.forEach((i) => console.error(' -', i));
    process.exit(1);
  }

  fs.writeFileSync(path, src);
  console.log('OK wrote', path, '— slime v4, hooks verified');
}
