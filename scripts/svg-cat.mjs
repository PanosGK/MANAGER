/**
 * Selene Line — CAT reimagined from scratch (v10)
 *
 * A creature born OF moonlight, not a cat wearing moon marks.
 * New palette (ice-blue silver on midnight ink, no purple/pink),
 * new anatomy, new silhouettes:
 *   evo1 — Lunar Wisp:   moon-spirit kitten condensing from mist,
 *                        lower body dissolves into curls of light
 *   evo2 — Moon Warden:  slender upright sentinel (Bastet poise),
 *                        tail wrapped around the base, glowing tip
 *   evo3 — Selene Oracle: guardian feline enthroned before a full-moon
 *                        halo, mane of light tongues, star-marked chest
 *
 * Run: node scripts/svg-cat.mjs
 */
import fs from 'fs';

const I = '                ';
const I2 = `${I}    `;
const I3 = `${I2}    `;
const I4 = `${I3}    `;

const STAGES = ['evo1', 'evo2', 'evo3'];
const HOOKS = [
  'tm-animate-body', 'tm-animate-arm-left', 'tm-animate-arm-right',
  'tm-animate-leg-left', 'tm-animate-leg-right', 'tm-animate-tail',
  'tm-animate-wing-left', 'tm-animate-wing-right',
  'tm-mascot-eye-open', 'tm-mascot-eye-closed',
  'tm-mascot-mouth-happy', 'tm-mascot-mouth-sad',
];

// ── Palette: midnight ink + ice moonlight ──────────────────────────
const INK = '#070b1a';        // outline
const LIGHT = '#dfe9ff';      // brightest moonlight
const BEAM = '#9fc0ff';       // mid glow
const FROST = '#7fd8ff';      // cyan accent (inner ears, brands)

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="30%" r="70%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${attrs}>\n${stopLines}\n${I3}</${tag}>`;
}

/** Shared defs for the whole line. */
function lineDefs(p, opts = {}) {
  const parts = [
    grad(`${p}-body`, [
      ['0%', '#3a4a7e', 1],
      ['35%', '#1c2650', 1],
      ['70%', '#0e142e', 1],
      ['100%', '#05070f', 1],
    ], 'radial', 'cx="38%" cy="26%" r="75%"'),
    grad(`${p}-sheen`, [
      ['0%', LIGHT, 0.75],
      ['100%', BEAM, 0],
    ], 'radial', 'cx="42%" cy="25%" r="60%"'),
    grad(`${p}-iris`, [
      ['0%', '#ffffff'],
      ['35%', '#cfe4ff'],
      ['70%', '#5f8dff'],
      ['100%', '#12245e'],
    ], 'radial', 'cx="38%" cy="32%" r="62%"'),
    grad(`${p}-mist`, [
      ['0%', BEAM, 0.35],
      ['55%', BEAM, 0.12],
      ['100%', BEAM, 0],
    ], 'radial', 'cx="50%" cy="45%" r="55%"'),
    grad(`${p}-moonfill`, [
      ['0%', '#ffffff', 0.95],
      ['55%', LIGHT, 0.8],
      ['100%', BEAM, 0.35],
    ], 'radial', 'cx="38%" cy="32%" r="62%"'),
  ];
  if (opts.eyeglow) {
    parts.push(grad(`${p}-eyeglow`, [
      ['0%', BEAM, 0.6],
      ['100%', BEAM, 0],
    ], 'radial', 'cx="50%" cy="50%" r="50%"'));
  }
  if (opts.halo) {
    parts.push(grad(`${p}-halo`, [
      ['0%', '#ffffff', 0.5],
      ['55%', LIGHT, 0.28],
      ['82%', BEAM, 0.12],
      ['100%', BEAM, 0],
    ], 'radial', 'cx="50%" cy="50%" r="50%"'));
  }
  return parts.join('\n');
}

/** Crescent moon path (opens right). */
function crescent(cx, cy, r) {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${r * 0.72} ${r * 0.72} 0 1 1 ${cx} ${cy - r} Z`;
}

function star(x, y, r, color = LIGHT, op = 0.5) {
  return `${I4}<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op}"/>`;
}

/** Glowing lens eyes — no dark sclera, pure moonlight lenses with slit pupils. */
function moonEyes(p, lx, rx, cy, w, h, opts = {}) {
  const glow = opts.glow ?? false;
  const lens = (x) => `${I4}<path d="M ${x - w} ${cy} Q ${x} ${cy - h * 1.25} ${x + w} ${cy} Q ${x} ${cy + h * 1.25} ${x - w} ${cy} Z" fill="url(#${p}-iris)" stroke="${INK}" stroke-width="0.9"/>
${I4}<ellipse cx="${x}" cy="${cy}" rx="${Math.max(0.65, w * 0.16)}" ry="${h * 0.85}" fill="#02040c"/>
${I4}<circle cx="${x - w * 0.35}" cy="${cy - h * 0.35}" r="${Math.max(0.5, w * 0.14)}" fill="#ffffff" opacity="0.85"/>`;
  return `${I3}<g class="tm-mascot-eye-open">
${glow ? `${I4}<ellipse cx="${lx}" cy="${cy}" rx="${w * 1.8}" ry="${h * 1.9}" fill="url(#${p}-eyeglow)"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${w * 1.8}" ry="${h * 1.9}" fill="url(#${p}-eyeglow)"/>` : ''}
${lens(lx)}
${lens(rx)}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - w} ${cy} Q ${lx} ${cy + 2} ${lx + w} ${cy}" stroke="${BEAM}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
${I4}<path d="M ${rx - w} ${cy} Q ${rx} ${cy + 2} ${rx + w} ${cy}" stroke="${BEAM}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Mouths in moonlight silver (faces are dark). */
function moonMouths(cx, y, span = 3.4) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${cx - span} ${y} Q ${cx - span * 0.4} ${y + 1.9} ${cx} ${y + 0.7} Q ${cx + span * 0.4} ${y + 1.9} ${cx + span} ${y}" stroke="${BEAM}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${cx - span} ${y + 1.4} Q ${cx} ${y - 1.2} ${cx + span} ${y + 1.4}" stroke="${BEAM}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
}

function moonNose(cx, cy, s = 1) {
  return `${I4}<path d="M ${cx} ${cy - 0.9 * s} L ${cx - 1.6 * s} ${cy + 1 * s} L ${cx + 1.6 * s} ${cy + 1 * s} Z" fill="${BEAM}" opacity="0.9"/>`;
}

function moonWhiskers(cx, y, len = 10, gap = 5) {
  return `${I4}<path d="M ${cx - gap} ${y - 1} L ${cx - gap - len} ${y - 3} M ${cx - gap} ${y + 0.5} L ${cx - gap - len + 1} ${y + 1} M ${cx - gap} ${y + 2} L ${cx - gap - len + 2} ${y + 4}" stroke="${LIGHT}" stroke-width="0.6" opacity="0.6" stroke-linecap="round"/>
${I4}<path d="M ${cx + gap} ${y - 1} L ${cx + gap + len} ${y - 3} M ${cx + gap} ${y + 0.5} L ${cx + gap + len - 1} ${y + 1} M ${cx + gap} ${y + 2} L ${cx + gap + len - 2} ${y + 4}" stroke="${LIGHT}" stroke-width="0.6" opacity="0.6" stroke-linecap="round"/>`;
}

function wrapStage(stage, label, defs, body) {
  return `${I}<!-- CAT ${stage.toUpperCase()} — ${label} -->
${I}<g id="tm-mascot-${stage}-cat" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/**
 * evo1 — Lunar Wisp
 * A kitten-spirit condensing out of moon mist. Solid head and chest,
 * lower body dissolving into curls of light. Floats — no true legs.
 */
function evo1() {
  const p = 'cat-evo1';
  const defs = lineDefs(p);

  const body = `${I3}<ellipse cx="50" cy="88" rx="16" ry="2.6" fill="#04060e" opacity="0.4"/>
${I3}<ellipse cx="50" cy="52" rx="34" ry="36" fill="url(#${p}-mist)"/>
${I3}<!-- Small crescent companion -->
${I3}<path d="${crescent(76, 22, 7)}" fill="url(#${p}-moonfill)" opacity="0.8"/>

${I3}<g class="tm-animate-tail">
${I4}<!-- Wisp trail spiraling off the dissolving body -->
${I4}<path d="M 60 70 C 72 72 80 66 80 56 C 80 50 74 50 72 56 C 70 62 66 68 60 70 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.1" opacity="0.9"/>
${I4}<circle cx="82" cy="48" r="2" fill="${LIGHT}" opacity="0.5"/>
${I4}<circle cx="86" cy="42" r="1.2" fill="${BEAM}" opacity="0.4"/>
${I3}</g>

${I3}<g class="tm-animate-leg-left">
${I4}<!-- Dissolving mist curl (left) -->
${I4}<path d="M 40 78 C 36 84 38 88 44 88 C 40 84 42 80 44 78 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="0.9" opacity="0.8"/>
${I4}<circle cx="38" cy="90" r="1.6" fill="${BEAM}" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<!-- Dissolving mist curl (right) -->
${I4}<path d="M 56 78 C 60 84 58 88 52 88 C 56 84 54 80 52 78 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="0.9" opacity="0.8"/>
${I4}<circle cx="60" cy="90" r="1.6" fill="${BEAM}" opacity="0.45"/>
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<ellipse cx="41" cy="64" rx="3.2" ry="4.4" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1" transform="rotate(-10 41 64)"/>
${I4}<path d="M 39.5 66.5 L 42.5 66.5" stroke="${BEAM}" stroke-width="0.6" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<ellipse cx="59" cy="64" rx="3.2" ry="4.4" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1" transform="rotate(10 59 64)"/>
${I4}<path d="M 57.5 66.5 L 60.5 66.5" stroke="${BEAM}" stroke-width="0.6" opacity="0.5"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Condensing teardrop torso, frayed at the bottom -->
${I4}<path d="M 38 50 C 33 60 34 70 40 76 C 44 80 40 83 36 82 C 42 86 50 84 50 80 C 50 84 58 86 64 82 C 60 83 56 80 60 76 C 66 70 67 60 62 50 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.35"/>
${I4}<ellipse cx="50" cy="60" rx="9" ry="8" fill="url(#${p}-sheen)" opacity="0.5"/>
${I4}<!-- Chest crescent brand -->
${I4}<path d="${crescent(50, 63, 3.2)}" fill="${FROST}" opacity="0.65"/>
${I4}<!-- Head — wide spirit skull -->
${I4}<path d="M 36 42 C 34 30 40 24 50 23 C 60 24 66 30 64 42 C 62 50 38 50 36 42 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.35"/>
${I4}<!-- Tall spirit ears -->
${I4}<path d="M 38 30 L 32 10 L 47 26 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<path d="M 40 29 L 36 16 L 44 27 Z" fill="${FROST}" opacity="0.5"/>
${I4}<path d="M 62 30 L 68 10 L 53 26 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<path d="M 60 29 L 64 16 L 56 27 Z" fill="${FROST}" opacity="0.5"/>
${I4}<ellipse cx="50" cy="30" rx="8" ry="4" fill="url(#${p}-sheen)" opacity="0.55"/>
${moonNose(50, 43, 0.95)}
${moonWhiskers(50, 44, 9, 5)}
${star(30, 54, 1.2, LIGHT, 0.5)}
${star(70, 58, 1, BEAM, 0.45)}
${I3}</g>

${I3}<g class="tm-animate-wing-left">
${I4}<circle cx="20" cy="40" r="1.4" fill="${LIGHT}" opacity="0.5"/>
${I4}<circle cx="25" cy="32" r="0.9" fill="${FROST}" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<circle cx="82" cy="62" r="1.4" fill="${LIGHT}" opacity="0.5"/>
${I4}<circle cx="78" cy="70" r="0.9" fill="${FROST}" opacity="0.4"/>
${I3}</g>

${moonEyes(p, 43, 57, 36, 4.6, 3.4)}
${moonMouths(50, 46, 3)}`;

  return wrapStage('evo1', 'Lunar Wisp — condensing moon-spirit', defs, body);
}

/**
 * evo2 — Moon Warden
 * Tall, elegant sentinel — a slender upright feline statue of moonlight
 * (Bastet-like poise). Long neck, refined head, tail wrapped around the
 * base with a glowing tip. Bridges wisp → Oracle.
 */
function evo2() {
  const p = 'cat-evo2';
  const defs = lineDefs(p);

  const body = `${I3}<ellipse cx="50" cy="92" rx="24" ry="3" fill="#04060e" opacity="0.42"/>
${I3}<ellipse cx="50" cy="52" rx="34" ry="40" fill="url(#${p}-mist)"/>
${I3}<path d="${crescent(78, 16, 6)}" fill="url(#${p}-moonfill)" opacity="0.75"/>

${I3}<g class="tm-animate-tail">
${I4}<!-- Tail wraps around the base, tip curling up with light -->
${I4}<path d="M 64 82 C 74 84 76 90 66 91 L 34 91 C 26 91 24 86 30 84 C 40 81 54 80 64 82 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.2"/>
${I4}<path d="M 30 86 C 24 84 22 78 26 74 C 29 71 33 74 31 78 C 30 81 30 84 30 86 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.1"/>
${I4}<circle cx="27" cy="72" r="2" fill="${LIGHT}" opacity="0.6"/>
${I4}<circle cx="27" cy="72" r="3.5" fill="none" stroke="${BEAM}" stroke-width="0.5" opacity="0.4"/>
${I3}</g>

${I3}<g class="tm-animate-leg-left">
${I4}<!-- Haunch mass, left -->
${I4}<path d="M 34 86 C 28 82 28 70 36 66 C 32 74 34 82 38 87 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<ellipse cx="36" cy="88" rx="4.5" ry="2.2" fill="url(#${p}-body)" stroke="${INK}" stroke-width="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<!-- Haunch mass, right -->
${I4}<path d="M 66 86 C 72 82 72 70 64 66 C 68 74 66 82 62 87 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<ellipse cx="64" cy="88" rx="4.5" ry="2.2" fill="url(#${p}-body)" stroke="${INK}" stroke-width="0.9"/>
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<!-- Slim front pillar leg -->
${I4}<path d="M 43 62 L 42 88 L 47.5 88 L 48 62 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<path d="M 42 88 L 47.5 88" stroke="${BEAM}" stroke-width="0.9" opacity="0.55" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 52 62 L 52.5 88 L 58 88 L 57 62 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<path d="M 52.5 88 L 58 88" stroke="${BEAM}" stroke-width="0.9" opacity="0.55" stroke-linecap="round"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Slender upright figure: haunches → waist → chest → neck -->
${I4}<path d="M 34 84 C 30 72 34 62 40 56 C 44 51 44 46 46 40 C 47 36 53 36 54 40 C 56 46 56 51 60 56 C 66 62 70 72 66 84 C 64 90 36 90 34 84 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.45"/>
${I4}<ellipse cx="50" cy="56" rx="7" ry="10" fill="url(#${p}-sheen)" opacity="0.4"/>
${I4}<!-- Crescent pendant on chest -->
${I4}<path d="${crescent(50, 52, 3.4)}" fill="${FROST}" opacity="0.7"/>
${I4}<!-- Stardust down the flank -->
${star(60, 64, 1, LIGHT, 0.5)}
${star(63, 72, 0.8, BEAM, 0.45)}
${star(61, 80, 0.7, LIGHT, 0.4)}
${I4}<!-- Refined head on long neck -->
${I4}<path d="M 40 32 C 38 22 43 16 50 15 C 57 16 62 22 60 32 C 58 39 42 39 40 32 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.4"/>
${I4}<!-- Tall elegant ears -->
${I4}<path d="M 41 22 L 37 4 L 49 18 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<path d="M 42.5 21 L 40 10 L 47 18.5 Z" fill="${FROST}" opacity="0.5"/>
${I4}<path d="M 59 22 L 63 4 L 51 18 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15"/>
${I4}<path d="M 57.5 21 L 60 10 L 53 18.5 Z" fill="${FROST}" opacity="0.5"/>
${I4}<ellipse cx="50" cy="21" rx="7" ry="3.5" fill="url(#${p}-sheen)" opacity="0.5"/>
${I4}<!-- Brow crescent -->
${I4}<path d="M 46.5 20 Q 50 17 53.5 20" stroke="${LIGHT}" stroke-width="1.1" fill="none" opacity="0.7" stroke-linecap="round"/>
${moonNose(50, 32, 0.9)}
${moonWhiskers(50, 33, 10, 5)}
${I3}</g>

${I3}<g class="tm-animate-wing-left">
${I4}<path d="M 30 48 Q 20 44 18 34" stroke="${BEAM}" stroke-width="1" fill="none" opacity="0.45" stroke-linecap="round"/>
${I4}<circle cx="18" cy="32" r="1.2" fill="${LIGHT}" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 70 48 Q 80 44 82 34" stroke="${BEAM}" stroke-width="1" fill="none" opacity="0.45" stroke-linecap="round"/>
${I4}<circle cx="82" cy="32" r="1.2" fill="${LIGHT}" opacity="0.5"/>
${I3}</g>

${moonEyes(p, 44.5, 55.5, 26, 4, 3)}
${moonMouths(50, 35, 2.8)}`;

  return wrapStage('evo2', 'Moon Warden — elegant sentinel', defs, body);
}

/**
 * evo3 — Selene Oracle
 * Guardian feline enthroned before a full-moon halo. Mane of light
 * tongues, star-marked chest, twin flowing tails. Apex of the line.
 */
function evo3() {
  const p = 'cat-evo3';
  const defs = lineDefs(p, { eyeglow: true, halo: true });

  // Mane: tongues of light radiating around the head, in front of the halo
  const tongues = [
    [30, 34, 20, 20], [36, 26, 28, 10], [46, 22, 44, 6],
    [56, 24, 60, 8], [64, 30, 74, 16], [68, 40, 82, 32],
    [32, 44, 18, 42],
  ].map(([x1, y1, x2, y2]) =>
    `${I4}<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2 + 2} ${(y1 + y2) / 2 - 3} ${x2} ${y2}" stroke="${LIGHT}" stroke-width="1.6" fill="none" opacity="0.45" stroke-linecap="round"/>`).join('\n');

  const body = `${I3}<ellipse cx="50" cy="94" rx="32" ry="3.2" fill="#04060e" opacity="0.45"/>
${I3}<!-- Full-moon halo -->
${I3}<circle cx="50" cy="36" r="27" fill="url(#${p}-halo)"/>
${I3}<circle cx="50" cy="36" r="24" fill="none" stroke="${LIGHT}" stroke-width="0.9" opacity="0.5"/>
${I3}<circle cx="50" cy="36" r="21" fill="none" stroke="${BEAM}" stroke-width="0.5" opacity="0.3"/>

${I3}<g class="tm-animate-tail">
${I4}<!-- Twin flowing tails -->
${I4}<path d="M 68 66 C 86 60 96 42 92 24 C 90 16 82 20 82 28 C 82 42 76 56 66 62 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.3"/>
${I4}<path d="M 70 70 C 88 68 98 54 96 40 C 95 33 88 36 88 43 C 88 54 80 64 68 66 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.15" opacity="0.75"/>
${I4}<path d="M 84 34 C 88 28 90 22 89 20" stroke="${LIGHT}" stroke-width="1" fill="none" opacity="0.5" stroke-linecap="round"/>
${I4}<circle cx="93" cy="22" r="1.8" fill="${LIGHT}" opacity="0.5"/>
${I4}<circle cx="97" cy="40" r="1.3" fill="${BEAM}" opacity="0.45"/>
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<!-- Front pillar leg -->
${I4}<path d="M 34 70 L 32 92 L 40 92 L 41 70 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.25"/>
${I4}<path d="M 32 92 L 40 92" stroke="${BEAM}" stroke-width="1" opacity="0.55" stroke-linecap="round"/>
${I4}<path d="M 35 88 L 35 92 M 38 88 L 38 92" stroke="${INK}" stroke-width="0.6" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 59 70 L 60 92 L 68 92 L 66 70 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.25"/>
${I4}<path d="M 60 92 L 68 92" stroke="${BEAM}" stroke-width="1" opacity="0.55" stroke-linecap="round"/>
${I4}<path d="M 62 88 L 62 92 M 65 88 L 65 92" stroke="${INK}" stroke-width="0.6" opacity="0.5"/>
${I3}</g>

${I3}<g class="tm-animate-leg-left">
${I4}<!-- Haunch paw peeking at the side -->
${I4}<ellipse cx="26" cy="88" rx="6" ry="4.5" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.1"/>
${I4}<path d="M 22 90 L 30 90" stroke="${BEAM}" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<ellipse cx="74" cy="88" rx="6" ry="4.5" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.1"/>
${I4}<path d="M 70 90 L 78 90" stroke="${BEAM}" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Enthroned torso, tall and regal -->
${I4}<path d="M 30 90 C 26 68 32 54 50 52 C 68 54 74 68 70 90 C 68 94 32 94 30 90 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.5"/>
${I4}<ellipse cx="50" cy="66" rx="11" ry="8" fill="url(#${p}-sheen)" opacity="0.4"/>
${I4}<!-- Star-marked chest: crescent + constellation -->
${I4}<path d="${crescent(50, 70, 4.2)}" fill="${FROST}" opacity="0.7"/>
${star(42, 78, 1.1, LIGHT, 0.55)}
${star(50, 82, 0.9, BEAM, 0.5)}
${star(58, 78, 1.1, LIGHT, 0.55)}
${I4}<path d="M 42 78 L 50 82 L 58 78" stroke="${BEAM}" stroke-width="0.55" fill="none" opacity="0.4"/>
${I4}<!-- Mane of light tongues -->
${tongues}
${I4}<!-- Regal head before the halo -->
${I4}<path d="M 36 44 C 34 30 40 23 50 22 C 60 23 66 30 64 44 C 62 53 38 53 36 44 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.5"/>
${I4}<!-- Crown ears with lit tips -->
${I4}<path d="M 38 30 L 33 6 L 48 25 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.2"/>
${I4}<path d="M 40 29 L 36 13 L 45 26 Z" fill="${FROST}" opacity="0.5"/>
${I4}<circle cx="33.5" cy="7" r="1.5" fill="${LIGHT}" opacity="0.75"/>
${I4}<path d="M 62 30 L 67 6 L 52 25 Z" fill="url(#${p}-body)" stroke="${INK}" stroke-width="1.2"/>
${I4}<path d="M 60 29 L 64 13 L 55 26 Z" fill="${FROST}" opacity="0.5"/>
${I4}<circle cx="66.5" cy="7" r="1.5" fill="${LIGHT}" opacity="0.75"/>
${I4}<ellipse cx="50" cy="30" rx="9" ry="4.5" fill="url(#${p}-sheen)" opacity="0.5"/>
${I4}<!-- Third-eye moon dot -->
${I4}<circle cx="50" cy="28" r="1.8" fill="${LIGHT}" opacity="0.85"/>
${I4}<circle cx="50" cy="28" r="3.2" fill="none" stroke="${BEAM}" stroke-width="0.5" opacity="0.5"/>
${moonNose(50, 44, 1.05)}
${moonWhiskers(50, 45, 12, 6)}
${I3}</g>

${I3}<g class="tm-animate-wing-left">
${I4}<!-- Floating light arc -->
${I4}<path d="M 22 56 Q 10 52 8 40" stroke="${LIGHT}" stroke-width="1.3" fill="none" opacity="0.5" stroke-linecap="round"/>
${I4}<circle cx="8" cy="38" r="1.5" fill="${LIGHT}" opacity="0.55"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 78 56 Q 90 52 92 40" stroke="${LIGHT}" stroke-width="1.3" fill="none" opacity="0.5" stroke-linecap="round"/>
${I4}<circle cx="92" cy="38" r="1.5" fill="${LIGHT}" opacity="0.55"/>
${I3}</g>

${moonEyes(p, 43, 57, 37, 5, 3.6, { glow: true })}
${moonMouths(50, 47, 3.4)}`;

  return wrapStage('evo3', 'Selene Oracle — moonlight guardian', defs, body);
}

export const catSvg = [
  `${I}<!-- CAT CHARACTER - All Life Stages (Selene Line v10 · moonlight creature, from scratch) -->`,
  `${I}<!-- Fate & Shadow • Rare Rarity • Lunar Wisp → Moon Warden → Selene Oracle -->`,
  `${I}<!-- ═══════════════════════════════════════ -->`,
  '',
  evo1(),
  evo2(),
  evo3(),
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
    const id = `tm-mascot-${s}-cat`;
    const idx = src.indexOf(`id="${id}"`);
    if (idx < 0) { issues.push(`missing ${id}`); continue; }
    const next = src.indexOf('id="tm-mascot-', idx + 12);
    const chunk = src.slice(idx, next > 0 ? next : idx + 20000);
    for (const h of HOOKS) {
      if (!chunk.includes(h)) issues.push(`${id} missing ${h}`);
    }
  }
  return issues;
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-cat.mjs');

if (isMain) {
  const path = 'myman_mascot.js';
  let src = fs.readFileSync(path, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';

  src = replaceBetween(
    src,
    '                <!-- CAT CHARACTER - All Life Stages',
    '                <!-- PHOENIX CHARACTER - All Life Stages',
    normalize(catSvg, nl),
  );

  const issues = validateHooks(src);
  if (issues.length) {
    console.error('VALIDATION FAILED', issues.length);
    issues.forEach((i) => console.error(' -', i));
    process.exit(1);
  }

  fs.writeFileSync(path, src);
  console.log('OK wrote', path, '— cat v10 Selene Line (from scratch), hooks verified');
}
