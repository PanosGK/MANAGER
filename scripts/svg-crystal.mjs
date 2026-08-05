/**
 * Void Titan — CRYSTAL reimagined from scratch (v4)
 *
 * A grave colossus of star-forged obsidian that fell from the outer dark.
 * No cute gem faces: angular slit eyes, disconnected parts held together
 * by its own gravity, a burning stellar core in the chest.
 *   evo1 — Meteor Shard:     the fallen fragment, core barely ignited,
 *                            debris still orbiting from the impact
 *   evo2 — Gravity Sentinel: levitating head-block over a monolith torso,
 *                            floating pauldrons, legs hovering apart
 *   evo3 — Starforged Titan: full colossus — crowned helm, monolith
 *                            shoulders, blazing star heart, orbital ring
 *
 * Run: node scripts/svg-crystal.mjs
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

// ── Palette: obsidian rock + stellar fire ──────────────────────────
const EDGE = '#0a0d18';        // outlines
const RIM = '#8fa3c7';         // cold dust rim-light
const STARWHITE = '#fff6e0';   // core center
const STARGOLD = '#ffd97a';    // core glow
const EMBER = '#ff9d45';       // fissure fire

function grad(id, stops, type = 'radial', attrs = 'cx="40%" cy="30%" r="70%"') {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${attrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function titanDefs(p) {
  return [
    grad(`${p}-rock`, [
      ['0%', '#3d4668', 1],
      ['35%', '#1e2440', 1],
      ['70%', '#0e1122', 1],
      ['100%', '#04050b', 1],
    ], 'linear', 'x1="20%" y1="0%" x2="80%" y2="100%"'),
    grad(`${p}-facet`, [
      ['0%', '#c7d2ee', 0.5],
      ['100%', '#c7d2ee', 0],
    ], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(`${p}-core`, [
      ['0%', STARWHITE, 1],
      ['30%', STARGOLD, 0.95],
      ['65%', EMBER, 0.45],
      ['100%', EMBER, 0],
    ], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-coreglow`, [
      ['0%', STARGOLD, 0.35],
      ['100%', STARGOLD, 0],
    ], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(`${p}-eyefill`, [
      ['0%', STARWHITE, 1],
      ['60%', STARGOLD, 0.95],
      ['100%', EMBER, 0.85],
    ], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(`${p}-dust`, [
      ['0%', RIM, 0.2],
      ['100%', RIM, 0],
    ], 'radial', 'cx="50%" cy="45%" r="55%"'),
  ].join('\n');
}

/** Stern angular eye slits, brows slanted in. */
function titanEyes(p, lx, rx, cy, w, h) {
  return `${I3}<g class="tm-mascot-eye-open">
${I4}<ellipse cx="${lx}" cy="${cy}" rx="${w * 2}" ry="${h * 2.4}" fill="url(#${p}-coreglow)"/>
${I4}<ellipse cx="${rx}" cy="${cy}" rx="${w * 2}" ry="${h * 2.4}" fill="url(#${p}-coreglow)"/>
${I4}<path d="M ${lx - w} ${cy - h} L ${lx + w} ${cy - h * 0.1} L ${lx + w} ${cy + h * 0.7} L ${lx - w} ${cy + h * 0.3} Z" fill="url(#${p}-eyefill)" stroke="${EDGE}" stroke-width="0.7"/>
${I4}<path d="M ${rx + w} ${cy - h} L ${rx - w} ${cy - h * 0.1} L ${rx - w} ${cy + h * 0.7} L ${rx + w} ${cy + h * 0.3} Z" fill="url(#${p}-eyefill)" stroke="${EDGE}" stroke-width="0.7"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - w} ${cy} L ${lx + w} ${cy + h * 0.5}" stroke="${STARGOLD}" stroke-width="1.3" stroke-linecap="round"/>
${I4}<path d="M ${rx + w} ${cy} L ${rx - w} ${cy + h * 0.5}" stroke="${STARGOLD}" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>`;
}

/** Grim minimal mouths — a stern seam in the rock. */
function titanMouths(cx, y, span = 4) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${cx - span} ${y} L ${cx} ${y + 1.4} L ${cx + span} ${y}" stroke="${STARGOLD}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${cx - span} ${y + 1.4} L ${cx} ${y - 0.6} L ${cx + span} ${y + 1.4}" stroke="${EMBER}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
}

function rockChip(x, y, s, rot = 0, op = 0.9) {
  return `${I4}<path d="M ${x} ${y - s} L ${x + s * 0.9} ${y - s * 0.2} L ${x + s * 0.5} ${y + s} L ${x - s * 0.7} ${y + s * 0.5} Z" fill="url(#REPLACE-rock)" stroke="${EDGE}" stroke-width="0.7" opacity="${op}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
}

function chip(p, x, y, s, rot = 0, op = 0.9) {
  return rockChip(x, y, s, rot, op).replace('REPLACE-rock', `${p}-rock`);
}

function starDot(x, y, r, op = 0.5, c = STARWHITE) {
  return `${I4}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op}"/>`;
}

function wrapStage(stage, label, defs, body) {
  return `${I}<!-- CRYSTAL ${stage.toUpperCase()} — ${label} -->
${I}<g id="tm-mascot-${stage}-crystal" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

/**
 * evo1 — Meteor Shard
 * The fallen fragment: one great angular shard hovering above its
 * impact point, core barely ignited, debris still circling.
 */
function evo1() {
  const p = 'crystal-evo1';
  const defs = titanDefs(p);

  const body = `${I3}<ellipse cx="50" cy="92" rx="20" ry="3" fill="#02030a" opacity="0.5"/>
${I3}<ellipse cx="50" cy="54" rx="34" ry="36" fill="url(#${p}-dust)"/>
${starDot(18, 26, 1, 0.5)}
${starDot(80, 20, 0.8, 0.45)}
${starDot(86, 62, 1.1, 0.4)}

${I3}<g class="tm-animate-tail">
${I4}<!-- Impact debris trail -->
${chip(p, 74, 26, 3.5, 20, 0.85)}
${chip(p, 82, 16, 2.2, -15, 0.7)}
${I4}<path d="M 66 36 L 78 22" stroke="${RIM}" stroke-width="0.6" opacity="0.3" stroke-dasharray="1.5 3"/>
${I3}</g>

${I3}<g class="tm-animate-wing-left">
${chip(p, 20, 48, 2.8, 30, 0.8)}
${starDot(14, 40, 0.9, 0.4)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${chip(p, 82, 48, 2.4, -25, 0.8)}
${starDot(88, 42, 0.9, 0.4)}
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<path d="M 36 50 L 26 56 L 30 64 L 38 60 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1"/>
${I4}<path d="M 36 52 L 29 57" stroke="url(#${p}-facet)" stroke-width="0.8" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 64 50 L 74 56 L 70 64 L 62 60 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1"/>
${I4}<path d="M 64 52 L 71 57" stroke="url(#${p}-facet)" stroke-width="0.8" opacity="0.6"/>
${I3}</g>

${I3}<g class="tm-animate-leg-left">
${chip(p, 42, 87, 2.6, 10, 0.85)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${chip(p, 58, 87, 2.6, -12, 0.85)}
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- The great shard, tip down, hovering -->
${I4}<path d="M 50 20 L 66 34 L 63 62 L 50 80 L 37 62 L 34 34 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.5"/>
${I4}<path d="M 50 20 L 50 80" stroke="${RIM}" stroke-width="0.5" opacity="0.25"/>
${I4}<path d="M 34 34 L 50 44 L 66 34" stroke="${EDGE}" stroke-width="0.7" opacity="0.6" fill="none"/>
${I4}<path d="M 50 20 L 58 30 L 50 34 Z" fill="url(#${p}-facet)" opacity="0.7"/>
${I4}<!-- Dim igniting core -->
${I4}<circle cx="50" cy="54" r="9" fill="url(#${p}-coreglow)"/>
${I4}<circle cx="50" cy="54" r="4.5" fill="url(#${p}-core)"/>
${I4}<!-- Fissures crawling from the core -->
${I4}<path d="M 50 50 L 46 42 M 53 56 L 59 60 M 47 57 L 42 64" stroke="${EMBER}" stroke-width="0.8" opacity="0.75" stroke-linecap="round"/>
${I4}<path d="M 52 50 L 56 40" stroke="${STARGOLD}" stroke-width="0.6" opacity="0.6" stroke-linecap="round"/>
${I3}</g>

${titanEyes(p, 44, 56, 36, 3.4, 2.4)}
${titanMouths(50, 66, 3.4)}`;

  return wrapStage('evo1', 'Meteor Shard — the fallen fragment', defs, body);
}

/**
 * evo2 — Gravity Sentinel
 * The fragment reshapes: a levitating head-block above a monolith torso,
 * pauldrons and legs floating apart, held by its own gravity.
 */
function evo2() {
  const p = 'crystal-evo2';
  const defs = titanDefs(p);

  const body = `${I3}<ellipse cx="50" cy="93" rx="26" ry="3" fill="#02030a" opacity="0.5"/>
${I3}<ellipse cx="50" cy="52" rx="38" ry="42" fill="url(#${p}-dust)"/>
${starDot(14, 22, 1, 0.5)}
${starDot(88, 30, 0.9, 0.4)}
${starDot(10, 66, 0.8, 0.4)}

${I3}<g class="tm-animate-tail">
${I4}<!-- Orbital debris arc behind -->
${I4}<path d="M 20 60 A 34 12 0 0 1 80 56" stroke="${RIM}" stroke-width="0.7" fill="none" opacity="0.3" stroke-dasharray="2 4"/>
${chip(p, 78, 58, 2.2, 15, 0.7)}
${chip(p, 24, 64, 1.8, -20, 0.65)}
${I3}</g>

${I3}<g class="tm-animate-wing-left">
${chip(p, 12, 34, 2.6, 25, 0.75)}
${starDot(8, 28, 0.8, 0.4)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${chip(p, 88, 34, 2.6, -25, 0.75)}
${starDot(92, 28, 0.8, 0.4)}
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<!-- Floating pauldron + arm shard, disconnected -->
${I4}<path d="M 30 34 L 18 38 L 16 48 L 26 50 L 32 42 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.2"/>
${I4}<path d="M 24 54 L 18 66 L 24 70 L 28 58 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.05"/>
${I4}<path d="M 29 36 L 20 40" stroke="url(#${p}-facet)" stroke-width="0.8" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 70 34 L 82 38 L 84 48 L 74 50 L 68 42 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.2"/>
${I4}<path d="M 76 54 L 82 66 L 76 70 L 72 58 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.05"/>
${I4}<path d="M 71 36 L 80 40" stroke="url(#${p}-facet)" stroke-width="0.8" opacity="0.6"/>
${I3}</g>

${I3}<g class="tm-animate-leg-left">
${I4}<!-- Hovering leg shard, gap below torso -->
${I4}<path d="M 38 76 L 36 90 L 44 90 L 45 76 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.15"/>
${I4}<path d="M 37 90 L 43 90" stroke="${STARGOLD}" stroke-width="0.7" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 55 76 L 56 90 L 64 90 L 62 76 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.15"/>
${I4}<path d="M 57 90 L 63 90" stroke="${STARGOLD}" stroke-width="0.7" opacity="0.4"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Monolith torso, tapering down -->
${I4}<path d="M 34 36 L 66 36 L 62 72 L 38 72 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.5"/>
${I4}<path d="M 34 36 L 44 44 L 38 72" stroke="${EDGE}" stroke-width="0.6" opacity="0.5" fill="none"/>
${I4}<path d="M 66 36 L 58 46" stroke="${EDGE}" stroke-width="0.6" opacity="0.5"/>
${I4}<path d="M 36 38 L 46 38 L 40 48 Z" fill="url(#${p}-facet)" opacity="0.55"/>
${I4}<!-- Star heart -->
${I4}<circle cx="50" cy="52" r="11" fill="url(#${p}-coreglow)"/>
${I4}<circle cx="50" cy="52" r="5.5" fill="url(#${p}-core)"/>
${I4}<path d="M 50 46 L 47 38 M 54 54 L 61 58 M 46 56 L 40 62 M 52 47 L 57 40" stroke="${EMBER}" stroke-width="0.85" opacity="0.8" stroke-linecap="round"/>
${I4}<!-- Levitating head-block above the torso (gap = power) -->
${I4}<path d="M 40 14 L 60 14 L 62 28 L 50 32 L 38 28 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.4"/>
${I4}<path d="M 42 15 L 50 15 L 45 22 Z" fill="url(#${p}-facet)" opacity="0.6"/>
${I4}<path d="M 40 14 L 36 8 M 60 14 L 64 8" stroke="${RIM}" stroke-width="0.8" opacity="0.4" stroke-linecap="round"/>
${I3}</g>

${titanEyes(p, 44.5, 55.5, 22, 3.6, 2.4)}
${titanMouths(50, 28.5, 3.6)}`;

  return wrapStage('evo2', 'Gravity Sentinel — held by its own gravity', defs, body);
}

/**
 * evo3 — Starforged Titan
 * The full colossus: crowned helm, monolith pauldrons, blazing star heart,
 * pillar legs, and an orbital ring of captured debris.
 */
function evo3() {
  const p = 'crystal-evo3';
  const defs = titanDefs(p);

  const body = `${I3}<ellipse cx="50" cy="95" rx="32" ry="3.2" fill="#02030a" opacity="0.55"/>
${I3}<ellipse cx="50" cy="50" rx="44" ry="46" fill="url(#${p}-dust)"/>
${starDot(10, 18, 1.1, 0.5)}
${starDot(90, 14, 0.9, 0.45)}
${starDot(6, 58, 0.8, 0.4)}
${starDot(94, 66, 1, 0.4)}

${I3}<g class="tm-animate-tail">
${I4}<!-- Orbital ring of captured debris -->
${I4}<path d="M 10 52 A 40 13 0 0 1 90 48" stroke="${RIM}" stroke-width="0.9" fill="none" opacity="0.35"/>
${I4}<path d="M 14 56 A 36 11 0 0 1 86 52" stroke="${RIM}" stroke-width="0.5" fill="none" opacity="0.22" stroke-dasharray="2 4"/>
${chip(p, 12, 50, 2.4, 20, 0.8)}
${chip(p, 88, 46, 2.8, -15, 0.8)}
${chip(p, 30, 58, 1.6, 30, 0.6)}
${I3}</g>

${I3}<g class="tm-animate-wing-left">
${I4}<!-- High shard satellite -->
${I4}<path d="M 22 18 L 14 8 L 12 22 L 18 26 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.05"/>
${I4}<path d="M 20 19 L 15 12" stroke="url(#${p}-facet)" stroke-width="0.8" opacity="0.6"/>
${starDot(10, 6, 0.9, 0.5)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M 78 18 L 86 8 L 88 22 L 82 26 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.05"/>
${I4}<path d="M 80 19 L 85 12" stroke="url(#${p}-facet)" stroke-width="0.8" opacity="0.6"/>
${starDot(90, 6, 0.9, 0.5)}
${I3}</g>

${I3}<g class="tm-animate-arm-left">
${I4}<!-- Monolith pauldron + hanging fist block -->
${I4}<path d="M 28 30 L 12 34 L 10 50 L 22 54 L 30 42 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.35"/>
${I4}<path d="M 26 32 L 14 37" stroke="url(#${p}-facet)" stroke-width="1" opacity="0.6"/>
${I4}<path d="M 18 58 L 12 72 L 22 76 L 26 62 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.2"/>
${I4}<path d="M 14 70 L 20 73" stroke="${STARGOLD}" stroke-width="0.7" opacity="0.45"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${I4}<path d="M 72 30 L 88 34 L 90 50 L 78 54 L 70 42 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.35"/>
${I4}<path d="M 74 32 L 86 37" stroke="url(#${p}-facet)" stroke-width="1" opacity="0.6"/>
${I4}<path d="M 82 58 L 88 72 L 78 76 L 74 62 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.2"/>
${I4}<path d="M 86 70 L 80 73" stroke="${STARGOLD}" stroke-width="0.7" opacity="0.45"/>
${I3}</g>

${I3}<g class="tm-animate-leg-left">
${I4}<!-- Pillar leg -->
${I4}<path d="M 36 74 L 33 92 L 45 92 L 46 74 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.35"/>
${I4}<path d="M 34 92 L 44 92" stroke="${STARGOLD}" stroke-width="0.9" opacity="0.5"/>
${I4}<path d="M 38 76 L 36 88" stroke="${EDGE}" stroke-width="0.6" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 54 74 L 55 92 L 67 92 L 64 74 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.35"/>
${I4}<path d="M 56 92 L 66 92" stroke="${STARGOLD}" stroke-width="0.9" opacity="0.5"/>
${I4}<path d="M 62 76 L 64 88" stroke="${EDGE}" stroke-width="0.6" opacity="0.5"/>
${I3}</g>

${I3}<g class="tm-animate-body">
${I4}<!-- Massive tapering torso -->
${I4}<path d="M 30 30 L 70 30 L 64 74 L 36 74 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.6"/>
${I4}<path d="M 30 30 L 42 40 L 36 74" stroke="${EDGE}" stroke-width="0.7" opacity="0.5" fill="none"/>
${I4}<path d="M 70 30 L 60 42" stroke="${EDGE}" stroke-width="0.7" opacity="0.5"/>
${I4}<path d="M 33 32 L 45 32 L 38 44 Z" fill="url(#${p}-facet)" opacity="0.55"/>
${I4}<!-- Blazing star heart -->
${I4}<circle cx="50" cy="50" r="14" fill="url(#${p}-coreglow)"/>
${I4}<circle cx="50" cy="50" r="7" fill="url(#${p}-core)"/>
${I4}<circle cx="50" cy="50" r="2.6" fill="${STARWHITE}"/>
${I4}<!-- Deep fissures radiating -->
${I4}<path d="M 50 43 L 46 33 M 55 53 L 63 60 M 45 55 L 37 63 M 53 44 L 58 34 M 47 45 L 41 38" stroke="${EMBER}" stroke-width="1" opacity="0.85" stroke-linecap="round"/>
${I4}<path d="M 50 57 L 50 66" stroke="${STARGOLD}" stroke-width="0.8" opacity="0.6" stroke-linecap="round"/>
${I4}<!-- Crowned helm, levitating -->
${I4}<path d="M 38 10 L 62 10 L 64 24 L 50 28 L 36 24 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="1.5"/>
${I4}<path d="M 40 11 L 49 11 L 43 19 Z" fill="url(#${p}-facet)" opacity="0.6"/>
${I4}<!-- Crown spikes -->
${I4}<path d="M 40 10 L 37 2 L 44 8 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="0.9"/>
${I4}<path d="M 48 9 L 50 0 L 52 9 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="0.9"/>
${I4}<path d="M 60 10 L 63 2 L 56 8 Z" fill="url(#${p}-rock)" stroke="${EDGE}" stroke-width="0.9"/>
${I4}<circle cx="50" cy="1.5" r="1" fill="${STARGOLD}" opacity="0.8"/>
${I3}</g>

${titanEyes(p, 44, 56, 18, 4, 2.6)}
${titanMouths(50, 24.5, 4)}`;

  return wrapStage('evo3', 'Starforged Titan — colossus of the outer dark', defs, body);
}

export const crystalSvg = [
  `${I}<!-- CRYSTAL CHARACTER - All Life Stages (Void Titan v4 · starforged, from scratch) -->`,
  `${I}<!-- Aether & Stone • Epic Rarity • Meteor Shard → Gravity Sentinel → Starforged Titan -->`,
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

/** Replace from the start of the CRYSTAL marker line to the start of the AETHER marker line. */
function replaceBlock(src, replacement) {
  const sIdx = src.indexOf('<!-- CRYSTAL CHARACTER - All Life Stages');
  const eIdx = src.indexOf('<!-- AETHER CHARACTER - All Life Stages');
  if (sIdx < 0 || eIdx < 0 || eIdx <= sIdx) {
    throw new Error(`markers fail: crystal(${sIdx}) aether(${eIdx})`);
  }
  const sLine = src.lastIndexOf('\n', sIdx) + 1;
  const eLine = src.lastIndexOf('\n', eIdx) + 1;
  return src.slice(0, sLine) + replacement + src.slice(eLine);
}

function validateHooks(src) {
  const issues = [];
  for (const s of STAGES) {
    const id = `tm-mascot-${s}-crystal`;
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

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('svg-crystal.mjs');

if (isMain) {
  const path = 'myman_mascot.js';
  let src = fs.readFileSync(path, 'utf8');
  const nl = src.includes('\r\n') ? '\r\n' : '\n';

  src = replaceBlock(src, normalize(crystalSvg, nl));

  const issues = validateHooks(src);
  if (issues.length) {
    console.error('VALIDATION FAILED', issues.length);
    issues.forEach((i) => console.error(' -', i));
    process.exit(1);
  }

  fs.writeFileSync(path, src);
  console.log('OK wrote', path, '— crystal v4 Void Titan (from scratch), hooks verified');
}
