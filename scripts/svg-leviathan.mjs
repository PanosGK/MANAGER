/**
 * Storm Leviathan — v7 "actual sea-serpent" redesign
 *
 * v6 was an abstract void/shard "Eclipse Maelstrom" — epic, but did not read
 * as a Leviathan at all. v7 replaces it with a real coiled sea-serpent/dragon
 * anatomy: a tapering serpentine body ribbon, a horned reptilian head with a
 * fanged jaw and two glowing slit eyes, a dorsal fin-spike ridge running the
 * length of the spine, small clawed fin-limbs, a finned tail, a storm mane
 * around the neck, and lightning cracking over the hide (heaviest on the
 * boss-tier adult+ forms). Each stage still gets a distinct silhouette
 * (Pokémon-evolution style): the coil tightens, the horn crown grows, and the
 * storm intensifies as it evolves.
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};
const STAGE_SLUG = {
  baby: 'baby', evo1: 'kid', evo2: 'teen', evo3: 'adult', evo4: 'mid', evo5: 'old',
};
const STAGE_TITLE = {
  baby: 'Storm Hatchling',
  evo1: 'Squall Serpent',
  evo2: 'Gale Drake',
  evo3: 'Storm Leviathan — BOSS',
  evo4: 'Tempest Leviathan',
  evo5: 'Primordial Leviathan',
};

const INK = '#01040a';
const LEVI_DEBUG = false;

const STAGE_PALETTES = {
  baby: { scale: '#2f5a78', deep: '#0e2338', rim: '#8fe0ff', accent: '#3fb6ea', horn: '#cbd9de', wrath: null },
  evo1: { scale: '#2a5270', deep: '#0b1f34', rim: '#7fd6f5', accent: '#2ea9d8', horn: '#c3d3da', wrath: null },
  evo2: { scale: '#234a68', deep: '#081a2c', rim: '#63c9ef', accent: '#1f96c4', horn: '#b7c9d2', wrath: '#fbbf24' },
  evo3: { scale: '#173650', deep: '#050f1c', rim: '#55c3ec', accent: '#1b84b3', horn: '#a9bdc8', wrath: '#ef4444' },
  evo4: { scale: '#112938', deep: '#030a12', rim: '#8fd3ea', accent: '#3f7f97', horn: '#93a7b3', wrath: '#dc2626' },
  evo5: { scale: '#0b1c26', deep: '#02060a', rim: '#dff3fa', accent: '#5c8a99', horn: '#7f929e', wrath: '#fecaca' },
};

function grad(id, stops, type = 'linear', attrs) {
  const tag = type === 'radial' ? 'radialGradient' : 'linearGradient';
  const defAttrs = attrs
    || (type === 'radial' ? 'cx="35%" cy="30%" r="75%"' : 'x1="15%" y1="0%" x2="85%" y2="100%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function wrapStage(stage, defs, body) {
  return `${I}<!-- LEVIATHAN ${STAGE_LABEL[stage]} — ${STAGE_TITLE[stage]} -->
${I}<g id="tm-mascot-${stage}-leviathan" style="display: none;">
${I2}<defs>
${defs}
${I2}</defs>
${body}
${I}</g>
`;
}

function makeDefs(p, pal) {
  return [
    grad(`${p}-scale`, [['0%', pal.rim], ['38%', pal.scale], ['100%', pal.deep]], 'linear'),
    grad(`${p}-belly`, [['0%', pal.accent, 0.9], ['100%', pal.deep]], 'linear'),
    grad(`${p}-horn`, [['0%', '#fff'], ['55%', pal.horn], ['100%', pal.deep]], 'linear'),
    grad(`${p}-iris`, [['0%', '#f0feff'], ['35%', pal.rim], ['100%', pal.accent]], 'radial'),
    grad(`${p}-mist`, [['0%', pal.accent, 0.28], ['55%', pal.rim, 0.1], ['100%', pal.deep, 0]], 'radial', 'cx="50%" cy="55%" r="60%"'),
    `${I3}<filter id="${p}-glow" x="-60%" y="-60%" width="220%" height="220%">
${I4}<feGaussianBlur stdDeviation="1.1" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
  ].join('\n');
}

/* ---------- geometry helpers ---------- */

/**
 * A wavy S-curve spine of {x,y} points — a real slithering serpent, not a spiral shell.
 * Head sits at t=0 (headX,headY) facing back along `dirDeg`; the body undulates side to
 * side (amplitude eases in near the head so the neck stays straight) as it travels the
 * `length` toward the tail at t=1. A gentle tail-hook curl is blended in at the very end.
 */
function serpentSpine({
  headX, headY, dirDeg, length, amplitude, waves, segments, ampEase = 0.16, hookFrac = 0.12,
}) {
  const rad = (dirDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lx = t * length;
    const easeIn = Math.min(1, t / ampEase);
    let ly = Math.sin(t * waves * Math.PI * 2) * amplitude * easeIn;
    if (t > 1 - hookFrac) {
      const hookT = (t - (1 - hookFrac)) / hookFrac;
      ly += Math.sin(hookT * Math.PI * 0.9) * amplitude * 0.55;
    }
    pts.push({ x: headX + lx * cos - ly * sin, y: headY + lx * sin + ly * cos });
  }
  return pts;
}

/** Per-point outward unit normal (perpendicular to local tangent), consistently on the "left" side. */
function spineNormals(points) {
  const n = points.length;
  const normals = [];
  for (let i = 0; i < n; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(n - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    normals.push({ x: -dy / len, y: dx / len });
  }
  return normals;
}

/** Tapered ribbon body through the spine — straight segments read cleanly at icon scale. */
function ribbonPath(points, normals, halfWidths) {
  const left = points.map((pt, i) => ({ x: pt.x + normals[i].x * halfWidths[i], y: pt.y + normals[i].y * halfWidths[i] }));
  const right = points.map((pt, i) => ({ x: pt.x - normals[i].x * halfWidths[i], y: pt.y - normals[i].y * halfWidths[i] }));
  const leftStr = left.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  const rightStr = right.slice().reverse().map((pt) => `L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  return `${leftStr} ${rightStr} Z`;
}

/** Thin belly-plate stripes across the underside of the ribbon (storm-serpent scute line). */
function bellyStripes(points, normals, halfWidths, every, stroke) {
  const parts = [];
  for (let i = 2; i < points.length - 2; i += every) {
    const pt = points[i];
    const n = normals[i];
    const hw = halfWidths[i] * 0.82;
    const x1 = pt.x + n.x * hw;
    const y1 = pt.y + n.y * hw;
    const x2 = pt.x - n.x * hw;
    const y2 = pt.y - n.y * hw;
    parts.push(`${I4}<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${stroke}" stroke-width="0.6" opacity="0.28"/>`);
  }
  return parts.join('\n');
}

/** Row of dorsal fin-spikes along one continuous edge of the ribbon — the sea-serpent's spine ridge. */
function dorsalRidge(points, normals, halfWidths, indices, spikeLen, hornColor, stroke) {
  return indices.map((i, k) => {
    const pt = points[i];
    const n = normals[i];
    const hw = halfWidths[i];
    const baseX = pt.x + n.x * hw * 0.7;
    const baseY = pt.y + n.y * hw * 0.7;
    const len = spikeLen * (0.7 + (k % 3) * 0.22);
    const tipX = baseX + n.x * len;
    const tipY = baseY + n.y * len;
    const tx = points[Math.min(points.length - 1, i + 1)].x - points[Math.max(0, i - 1)].x;
    const ty = points[Math.min(points.length - 1, i + 1)].y - points[Math.max(0, i - 1)].y;
    const tl = Math.hypot(tx, ty) || 1;
    const backX = baseX - (tx / tl) * len * 0.4;
    const backY = baseY - (ty / tl) * len * 0.4;
    const frontX = baseX + (tx / tl) * len * 0.4;
    const frontY = baseY + (ty / tl) * len * 0.4;
    return `${I4}<path d="M ${backX.toFixed(1)} ${backY.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${frontX.toFixed(1)} ${frontY.toFixed(1)} Z" fill="${hornColor}" stroke="${stroke}" stroke-width="0.7" opacity="${(0.72 + (k % 3) * 0.08).toFixed(2)}"/>`;
  }).join('\n');
}

/** Small clawed fin-limb sprouting sideways from a spine point. */
function finLimb(pt, normal, side, size, fillId, stroke) {
  const nx = normal.x * side;
  const ny = normal.y * side;
  const tipX = pt.x + nx * size;
  const tipY = pt.y + ny * size;
  const px = -ny;
  const py = nx;
  const baseLX = pt.x + px * size * 0.35;
  const baseLY = pt.y + py * size * 0.35;
  const baseRX = pt.x - px * size * 0.35;
  const baseRY = pt.y - py * size * 0.35;
  const claw1X = tipX + px * size * 0.32;
  const claw1Y = tipY + py * size * 0.32;
  const claw2X = tipX - px * size * 0.32;
  const claw2Y = tipY - py * size * 0.32;
  return `${I4}<path d="M ${baseLX.toFixed(1)} ${baseLY.toFixed(1)} Q ${(tipX - nx * size * 0.15).toFixed(1)} ${(tipY - ny * size * 0.15).toFixed(1)} ${claw1X.toFixed(1)} ${claw1Y.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${claw2X.toFixed(1)} ${claw2Y.toFixed(1)} Q ${(tipX - nx * size * 0.15).toFixed(1)} ${(tipY - ny * size * 0.15).toFixed(1)} ${baseRX.toFixed(1)} ${baseRY.toFixed(1)} Z" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.9" opacity="0.85"/>`;
}

/** Curved horn sweeping back from a base point — solid pale fill so it stays readable against a dark hide. */
function hornShape(baseX, baseY, angleDeg, len, baseWidth, hornColor, stroke) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const tipX = baseX + dx * len;
  const tipY = baseY + dy * len;
  const curveX = baseX + dx * len * 0.55 + px * len * 0.4;
  const curveY = baseY + dy * len * 0.55 + py * len * 0.4;
  const leftX = baseX + px * baseWidth;
  const leftY = baseY + py * baseWidth;
  const rightX = baseX - px * baseWidth;
  const rightY = baseY - py * baseWidth;
  return `${I4}<path d="M ${leftX.toFixed(1)} ${leftY.toFixed(1)} Q ${curveX.toFixed(1)} ${curveY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${(curveX - px * baseWidth * 0.5).toFixed(1)} ${(curveY - py * baseWidth * 0.5).toFixed(1)} ${rightX.toFixed(1)} ${rightY.toFixed(1)} Z" fill="${hornColor}" stroke="${stroke}" stroke-width="0.9" opacity="0.96"/>`;
}

/**
 * Reptilian head wedge capping the front of the ribbon, oriented along facing angleDeg.
 * Deliberately flares wider than the neck ribbon (like a cobra hood) and carries its own
 * bold outline + brow/nostril marks so it reads as a distinct head, not a blob continuing
 * the body's silhouette.
 */
function headWedge(hx, hy, angleDeg, size, fillId, faceId, stroke) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const tipX = hx + dx * size * 1.3;
  const tipY = hy + dy * size * 1.3;
  const jawLX = hx + dx * size * 0.3 + px * size * 0.6;
  const jawLY = hy + dy * size * 0.3 + py * size * 0.6;
  const jawRX = hx + dx * size * 0.3 - px * size * 0.6;
  const jawRY = hy + dy * size * 0.3 - py * size * 0.6;
  const browLX = hx - dx * size * 0.68 + px * size * 1;
  const browLY = hy - dy * size * 0.68 + py * size * 1;
  const browRX = hx - dx * size * 0.68 - px * size * 1;
  const browRY = hy - dy * size * 0.68 - py * size * 1;
  const wedge = `${I4}<path d="M ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${jawLX.toFixed(1)} ${jawLY.toFixed(1)} ${browLX.toFixed(1)} ${browLY.toFixed(1)} L ${browRX.toFixed(1)} ${browRY.toFixed(1)} Q ${jawRX.toFixed(1)} ${jawRY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Z" fill="url(#${fillId})" stroke="${stroke}" stroke-width="1.1" stroke-linejoin="round"/>`;
  const snoutX = hx + dx * size * 0.62;
  const snoutY = hy + dy * size * 0.62;
  const snoutLX = hx + dx * size * 0.02 + px * size * 0.5;
  const snoutLY = hy + dy * size * 0.02 + py * size * 0.5;
  const snoutRX = hx + dx * size * 0.02 - px * size * 0.5;
  const snoutRY = hy + dy * size * 0.02 - py * size * 0.5;
  const snoutPatch = `${I4}<path d="M ${snoutX.toFixed(1)} ${snoutY.toFixed(1)} L ${snoutLX.toFixed(1)} ${snoutLY.toFixed(1)} Q ${(hx - dx * size * 0.25 + px * size * 0.28).toFixed(1)} ${(hy - dy * size * 0.25 + py * size * 0.28).toFixed(1)} ${(hx - dx * size * 0.35).toFixed(1)} ${(hy - dy * size * 0.35).toFixed(1)} Q ${(hx - dx * size * 0.25 - px * size * 0.28).toFixed(1)} ${(hy - dy * size * 0.25 - py * size * 0.28).toFixed(1)} ${snoutRX.toFixed(1)} ${snoutRY.toFixed(1)} Z" fill="url(#${faceId})" opacity="0.85"/>`;
  const nostrilLX = hx + dx * size * 0.95 + px * size * 0.16;
  const nostrilLY = hy + dy * size * 0.95 + py * size * 0.16;
  const nostrilRX = hx + dx * size * 0.95 - px * size * 0.16;
  const nostrilRY = hy + dy * size * 0.95 - py * size * 0.16;
  const nostrils = `${I4}<circle cx="${nostrilLX.toFixed(1)}" cy="${nostrilLY.toFixed(1)}" r="${Math.max(0.5, size * 0.06).toFixed(1)}" fill="${stroke}" opacity="0.75"/>
${I4}<circle cx="${nostrilRX.toFixed(1)}" cy="${nostrilRY.toFixed(1)}" r="${Math.max(0.5, size * 0.06).toFixed(1)}" fill="${stroke}" opacity="0.75"/>`;
  const browRidge = `${I4}<path d="M ${browLX.toFixed(1)} ${browLY.toFixed(1)} Q ${(hx - dx * size * 0.5).toFixed(1)} ${(hy - dy * size * 0.5).toFixed(1)} ${browRX.toFixed(1)} ${browRY.toFixed(1)}" stroke="${stroke}" stroke-width="1" fill="none" opacity="0.55"/>`;
  return `${wedge}\n${snoutPatch}\n${nostrils}\n${browRidge}`;
}

/** A row of bold, always-visible fang triangles along the upper jaw — a permanent feature, not mood-dependent. */
function fangRow(hx, hy, angleDeg, size, fangCount, stroke) {
  if (fangCount <= 0) return '';
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const parts = [];
  for (let i = 0; i < fangCount; i++) {
    const t = fangCount <= 1 ? 0.5 : i / (fangCount - 1);
    const lateral = size * 0.42 * (t * 2 - 1);
    const baseX = hx + dx * size * 0.92 + px * lateral;
    const baseY = hy + dy * size * 0.92 + py * lateral;
    const len = size * (0.26 + (i % 2) * 0.07);
    const tipX = baseX + dx * len;
    const tipY = baseY + dy * len;
    const w = size * 0.07;
    const lX = baseX + px * w;
    const lY = baseY + py * w;
    const rX = baseX - px * w;
    const rY = baseY - py * w;
    parts.push(`${I4}<path d="M ${lX.toFixed(1)} ${lY.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${rX.toFixed(1)} ${rY.toFixed(1)} Z" fill="#f4fbfd" stroke="${stroke}" stroke-width="0.4" opacity="0.95"/>`);
  }
  return parts.join('\n');
}

/** Mood mouth line — a clear pale stroke so it reads against the dark hide, "happy" vs a downturned "sad". */
function moodMouth(hx, hy, angleDeg, size, pal) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const leftX = hx + dx * size * 0.78 + px * size * 0.44;
  const leftY = hy + dy * size * 0.78 + py * size * 0.44;
  const rightX = hx + dx * size * 0.78 - px * size * 0.44;
  const rightY = hy + dy * size * 0.78 - py * size * 0.44;
  const happyChinX = hx + dx * size * 1.22;
  const happyChinY = hy + dy * size * 1.22;
  const sadChinX = hx + dx * size * 0.98;
  const sadChinY = hy + dy * size * 0.98;
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${leftX.toFixed(1)} ${leftY.toFixed(1)} Q ${happyChinX.toFixed(1)} ${happyChinY.toFixed(1)} ${rightX.toFixed(1)} ${rightY.toFixed(1)}" stroke="${pal.rim}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.85"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${leftX.toFixed(1)} ${leftY.toFixed(1)} Q ${sadChinX.toFixed(1)} ${sadChinY.toFixed(1)} ${rightX.toFixed(1)} ${rightY.toFixed(1)}" stroke="${pal.rim}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.7"/>`;
}

/** Two glowing reptilian slit-eyes placed either side of the head's facing axis. */
function serpentEyes(hx, hy, angleDeg, size, r, p, pal, stroke, boss) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const ex = hx - dx * size * 0.32;
  const ey = hy - dy * size * 0.32;
  const spread = size * 0.36;
  const eyes = [
    { x: ex + px * spread, y: ey + py * spread },
    { x: ex - px * spread, y: ey - py * spread },
  ];
  const glowMul = boss ? 2.5 : 1.7;
  const glowOp = boss ? 0.32 : 0.16;
  const open = eyes.map((eye) => `${I4}<circle cx="${eye.x.toFixed(1)}" cy="${eye.y.toFixed(1)}" r="${(r * glowMul).toFixed(1)}" fill="${pal.rim}" opacity="${glowOp}" filter="url(#${p}-glow)"/>
${I4}<ellipse cx="${eye.x.toFixed(1)}" cy="${eye.y.toFixed(1)}" rx="${(r * 0.92).toFixed(1)}" ry="${r.toFixed(1)}" fill="url(#${p}-iris)" stroke="${stroke}" stroke-width="${boss ? 1.1 : 0.8}"/>
${I4}<ellipse class="tm-leviathan-pupil" cx="${eye.x.toFixed(1)}" cy="${eye.y.toFixed(1)}" rx="${(r * 0.16).toFixed(1)}" ry="${(r * 0.72).toFixed(1)}" fill="#000"/>
${I4}<circle cx="${(eye.x - r * 0.28).toFixed(1)}" cy="${(eye.y - r * 0.32).toFixed(1)}" r="${Math.max(0.5, r * 0.16).toFixed(1)}" fill="#fff" opacity="0.6"/>`).join('\n');
  const closed = eyes.map((eye) => `${I4}<path d="M ${(eye.x - r).toFixed(1)} ${eye.y.toFixed(1)} Q ${eye.x.toFixed(1)} ${(eye.y - r * 0.4).toFixed(1)} ${(eye.x + r).toFixed(1)} ${eye.y.toFixed(1)}" stroke="${stroke}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`).join('\n');
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${open}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${closed}
${I3}</g>`;
}

/** Cloud-tendril storm mane collar flaring from the neck (also used as the animated wing groups). */
function stormMane(cx, cy, angleDeg, count, size, fillId, stroke) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const spread = -36 + (72 / Math.max(1, count - 1)) * i;
    const a = ((angleDeg + spread) * Math.PI) / 180;
    const len = size * (0.75 + (i % 3) * 0.22);
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy;
    const py = dx;
    const tipX = cx + dx * len;
    const tipY = cy + dy * len;
    const cX = cx + dx * len * 0.55 + px * len * 0.32;
    const cY = cy + dy * len * 0.55 + py * len * 0.32;
    const baseLX = cx + px * len * 0.16;
    const baseLY = cy + py * len * 0.16;
    const baseRX = cx - px * len * 0.16;
    const baseRY = cy - py * len * 0.16;
    parts.push(`${I4}<path d="M ${baseLX.toFixed(1)} ${baseLY.toFixed(1)} Q ${cX.toFixed(1)} ${cY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${(cX - px * len * 0.1).toFixed(1)} ${(cY - py * len * 0.1).toFixed(1)} ${baseRX.toFixed(1)} ${baseRY.toFixed(1)} Z" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.6" opacity="${(0.5 + (i % 3) * 0.12).toFixed(2)}"/>`);
  }
  return parts.join('\n');
}

/** Finned tail tip capping the last spine point. */
function tailFin(pt, prevPt, size, fillId, stroke) {
  const dx = pt.x - prevPt.x;
  const dy = pt.y - prevPt.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tipX = pt.x + ux * size * 1.4;
  const tipY = pt.y + uy * size * 1.4;
  const finLX = pt.x + ux * size * 0.3 + px * size * 1.1;
  const finLY = pt.y + uy * size * 0.3 + py * size * 1.1;
  const finRX = pt.x + ux * size * 0.3 - px * size * 1.1;
  const finRY = pt.y + uy * size * 0.3 - py * size * 1.1;
  return `${I4}<path d="M ${(pt.x - px * size * 0.5).toFixed(1)} ${(pt.y - py * size * 0.5).toFixed(1)} L ${finLX.toFixed(1)} ${finLY.toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${finRX.toFixed(1)} ${finRY.toFixed(1)} L ${(pt.x + px * size * 0.5).toFixed(1)} ${(pt.y + py * size * 0.5).toFixed(1)} Z" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.8" opacity="0.9"/>`;
}

/** Jagged fork of storm energy — used as lightning crackling over the hide. */
function lightningCrack(cx, cy, angleDeg, len, color, glowId, weight = 1) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const midLen = len * 0.55;
  const kink = len * 0.2;
  const mx = cx + dx * midLen + px * kink;
  const my = cy + dy * midLen + py * kink;
  const endX = cx + dx * len - px * kink * 0.6;
  const endY = cy + dy * len - py * kink * 0.6;
  return `${I4}<path d="M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${mx.toFixed(1)} ${my.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}" stroke="${color}" stroke-width="${weight}" fill="none" stroke-linecap="round" opacity="0.82" filter="url(#${glowId})" class="tm-leviathan-vein"/>`;
}

/** Broken swirling water rings at the base — the leviathan rising from a storm-tossed sea. */
function maelstromRings(cx, cy, count, rimColor, glowId) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const rx = 16 + i * 8;
    const ry = 3.4 + i * 1.4;
    const gapStart = 40 + i * 35;
    parts.push(`${I4}<path d="M ${(cx - rx).toFixed(1)} ${cy.toFixed(1)} A ${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 1 ${(cx + rx).toFixed(1)} ${cy.toFixed(1)}" fill="none" stroke="${rimColor}" stroke-width="1" opacity="${(0.4 - i * 0.06).toFixed(2)}" filter="url(#${glowId})" stroke-dasharray="${(rx * 0.9).toFixed(0)} ${(gapStart % 20 + 6).toFixed(0)}"/>`);
  }
  return parts.join('\n');
}

function stormSparks(pal, count) {
  const pts = [
    [8, 16], [92, 14], [4, 40], [96, 42], [12, 66], [88, 68],
    [20, 6], [80, 4], [2, 54], [98, 52], [38, 2], [62, 2],
  ].slice(0, count);
  return pts.map(([x, y], i) => {
    const fill = i % 3 === 0 ? pal.rim : i % 2 ? pal.accent : '#eaf7fb';
    return `${I3}<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 1.5 : 1}" fill="${fill}" opacity="${0.28 + (i % 4) * 0.08}"/>`;
  }).join('\n');
}

/* ---------- stage builder ---------- */

function buildStage(stage, p, pal, stroke, cfg) {
  const points = serpentSpine(cfg.spine);
  const normals = spineNormals(points);
  const n = points.length;
  const halfWidths = points.map((_, i) => {
    const t = i / (n - 1);
    const eased = 1 - Math.pow(1 - t, 1.6);
    return cfg.headHW + (cfg.tailHW - cfg.headHW) * eased;
  });

  const head = points[0];
  const maneIdx = Math.max(2, Math.round(n * 0.12));
  const manePt = points[maneIdx];
  // Derived directly from the spine's travel direction (not a finite-difference of the
  // first two points) so the head orientation stays clean regardless of wave easing.
  const headAngle = cfg.spine.dirDeg + 180;
  const headRad = (headAngle * Math.PI) / 180;
  const faceDx = Math.cos(headRad);
  const faceDy = Math.sin(headRad);
  const facePx = -faceDy;
  const facePy = faceDx;
  const backX = -faceDx;
  const backY = -faceDy;

  const armIdx = Math.round(n * cfg.armT);
  const legIdx = Math.round(n * cfg.legT);
  const armPt = points[armIdx];
  const armN = normals[armIdx];
  const legPt = points[legIdx];
  const legN = normals[legIdx];

  const tailPt = points[n - 1];
  const tailPrev = points[n - 2];

  const dorsalIdx = [];
  for (let i = Math.round(n * 0.26); i < n - Math.round(n * 0.1); i += cfg.dorsalEvery) dorsalIdx.push(i);

  const browDist = cfg.headSize * 0.62;
  const hornSpread = cfg.hornCount <= 1 ? [0] : Array.from({ length: cfg.hornCount }, (_, i) => -1 + (2 / (cfg.hornCount - 1)) * i);
  const horns = hornSpread.map((s, i) => {
    const lateral = s * cfg.headSize * 0.85;
    const baseX = head.x + backX * browDist + facePx * lateral;
    const baseY = head.y + backY * browDist + facePy * lateral;
    const dirX = backX * 0.7 + facePx * s;
    const dirY = backY * 0.7 + facePy * s;
    const hornAngle = (Math.atan2(dirY, dirX) * 180) / Math.PI;
    const len = cfg.hornLen * (1 - Math.abs(s) * 0.15) * (1 + (i % 2) * 0.08);
    return hornShape(baseX, baseY, hornAngle, len, cfg.headSize * 0.15, pal.horn, stroke);
  }).join('\n');

  // Confined to a ~170° arc on the back/lateral side of the head so cracks
  // radiate away from the horn crown instead of slashing across the face.
  const wrathAngles = cfg.wrathCount > 0
    ? Array.from({ length: cfg.wrathCount }, (_, i) => {
      const t = cfg.wrathCount <= 1 ? 0.5 : i / (cfg.wrathCount - 1);
      return headAngle + 95 + 170 * t;
    })
    : [];
  const wrathOriginX = head.x + backX * cfg.headSize * 0.55;
  const wrathOriginY = head.y + backY * cfg.headSize * 0.55;

  const groundCx = (head.x + tailPt.x) / 2;
  const mistCx = groundCx;
  const mistCy = (head.y + tailPt.y) / 2;
  const mistR = Math.max(cfg.spine.length * 0.62, 34);

  return `${I3}<ellipse cx="${groundCx.toFixed(1)}" cy="96" rx="${(cfg.spine.amplitude * 1.7 + 10).toFixed(1)}" ry="${cfg.boss ? 4.6 : 3}" fill="${INK}" opacity="0.4"/>
${I3}<ellipse cx="${mistCx.toFixed(1)}" cy="${mistCy.toFixed(1)}" rx="${mistR.toFixed(1)}" ry="${(mistR * 0.92).toFixed(1)}" fill="url(#${p}-mist)" opacity="${cfg.boss ? 0.55 : 0.28}"/>
${stormSparks(pal, cfg.sparkCount)}
${cfg.maelstromCount > 0 ? maelstromRings(tailPt.x, Math.min(94, tailPt.y + 6), cfg.maelstromCount, pal.rim, `${p}-glow`) : ''}
${I3}<g class="tm-animate-wing-left">
${stormMane(manePt.x, manePt.y, headAngle + 150, cfg.maneCount, cfg.maneSize, `${p}-belly`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${stormMane(manePt.x, manePt.y, headAngle - 150, cfg.maneCount, cfg.maneSize, `${p}-belly`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${finLimb(armPt, armN, 1, cfg.limbSize, `${p}-scale`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${finLimb(armPt, armN, -1, cfg.limbSize, `${p}-scale`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${finLimb(legPt, legN, 1, cfg.limbSize * 0.88, `${p}-scale`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${finLimb(legPt, legN, -1, cfg.limbSize * 0.88, `${p}-scale`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${tailFin(tailPt, tailPrev, cfg.tailFinSize, `${p}-scale`, stroke)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${I4}<path d="${ribbonPath(points, normals, halfWidths)}" fill="url(#${p}-scale)" stroke="${stroke}" stroke-width="1"/>
${bellyStripes(points, normals, halfWidths, cfg.dorsalEvery, stroke)}
${dorsalRidge(points, normals, halfWidths, dorsalIdx, cfg.dorsalLen, pal.horn, stroke)}
${horns}
${headWedge(head.x, head.y, headAngle, cfg.headSize, `${p}-scale`, `${p}-belly`, stroke)}
${fangRow(head.x, head.y, headAngle, cfg.headSize, cfg.fangCount, stroke)}
${wrathAngles.map((ang) => lightningCrack(wrathOriginX, wrathOriginY, ang, cfg.wrathLen, pal.wrath, `${p}-glow`, cfg.boss ? 1.5 : 1)).join('\n')}
${I3}</g>
${moodMouth(head.x, head.y, headAngle, cfg.headSize, pal)}
${serpentEyes(head.x, head.y, headAngle, cfg.headSize, cfg.eyeR, p, pal, stroke, cfg.boss)}
${LEVI_DEBUG ? `
<circle cx="${head.x.toFixed(1)}" cy="${head.y.toFixed(1)}" r="1" fill="red"/>
<circle cx="${(head.x + faceDx * cfg.headSize * 0.45).toFixed(1)}" cy="${(head.y + faceDy * cfg.headSize * 0.45).toFixed(1)}" r="1" fill="lime"/>
<circle cx="${(head.x + backX * browDist).toFixed(1)}" cy="${(head.y + backY * browDist).toFixed(1)}" r="1" fill="yellow"/>
<line x1="${head.x.toFixed(1)}" y1="${head.y.toFixed(1)}" x2="${(head.x + faceDx * cfg.headSize * 1.3).toFixed(1)}" y2="${(head.y + faceDy * cfg.headSize * 1.3).toFixed(1)}" stroke="magenta" stroke-width="0.3"/>
` : ''}`;
}

const STAGE_CFG = {
  baby: {
    spine: { headX: 52, headY: 30, dirDeg: 102, length: 36, amplitude: 8, waves: 1, segments: 16, ampEase: 0.2, hookFrac: 0.18 },
    headHW: 5, tailHW: 1.3, headSize: 9.2, hornCount: 1, hornLen: 3,
    maneCount: 2, maneSize: 3.6, limbSize: 2.1, armT: 0.24, legT: 0.6,
    dorsalEvery: 3, dorsalLen: 1.5, tailFinSize: 1.9, eyeR: 3.4, fangCount: 0,
    wrathCount: 0, wrathLen: 0, maelstromCount: 0, sparkCount: 3, boss: false,
  },
  evo1: {
    spine: { headX: 52, headY: 27, dirDeg: 101, length: 45, amplitude: 11, waves: 1.1, segments: 18, ampEase: 0.18, hookFrac: 0.17 },
    headHW: 5.7, tailHW: 1.5, headSize: 10.6, hornCount: 2, hornLen: 4.8,
    maneCount: 3, maneSize: 4.6, limbSize: 2.6, armT: 0.22, legT: 0.58,
    dorsalEvery: 3, dorsalLen: 2, tailFinSize: 2.3, eyeR: 4, fangCount: 2,
    wrathCount: 0, wrathLen: 0, maelstromCount: 0, sparkCount: 4, boss: false,
  },
  evo2: {
    spine: { headX: 53, headY: 24, dirDeg: 99, length: 55, amplitude: 14, waves: 1.25, segments: 22, ampEase: 0.16, hookFrac: 0.16 },
    headHW: 6.8, tailHW: 1.8, headSize: 12.9, hornCount: 2, hornLen: 7.6,
    maneCount: 4, maneSize: 5.8, limbSize: 3.3, armT: 0.2, legT: 0.57,
    dorsalEvery: 2, dorsalLen: 2.9, tailFinSize: 2.8, eyeR: 4.9, fangCount: 2,
    wrathCount: 2, wrathLen: 10, maelstromCount: 0, sparkCount: 6, boss: false,
  },
  evo3: {
    spine: { headX: 54, headY: 21, dirDeg: 97, length: 63, amplitude: 18, waves: 1.4, segments: 28, ampEase: 0.14, hookFrac: 0.14 },
    headHW: 8.6, tailHW: 2.2, headSize: 16.4, hornCount: 4, hornLen: 12,
    maneCount: 6, maneSize: 8.4, limbSize: 4.4, armT: 0.18, legT: 0.56,
    dorsalEvery: 2, dorsalLen: 4.2, tailFinSize: 3.6, eyeR: 6.2, fangCount: 4,
    wrathCount: 4, wrathLen: 16, maelstromCount: 2, sparkCount: 9, boss: true,
  },
  evo4: {
    spine: { headX: 54, headY: 20, dirDeg: 96, length: 67, amplitude: 20, waves: 1.5, segments: 30, ampEase: 0.13, hookFrac: 0.13 },
    headHW: 9.1, tailHW: 2.4, headSize: 17.4, hornCount: 6, hornLen: 13,
    maneCount: 7, maneSize: 9, limbSize: 4.8, armT: 0.17, legT: 0.55,
    dorsalEvery: 2, dorsalLen: 4.8, tailFinSize: 4, eyeR: 6.6, fangCount: 4,
    wrathCount: 5, wrathLen: 18, maelstromCount: 3, sparkCount: 10, boss: true,
  },
  evo5: {
    spine: { headX: 55, headY: 19, dirDeg: 95, length: 70, amplitude: 22, waves: 1.6, segments: 34, ampEase: 0.12, hookFrac: 0.13 },
    headHW: 9.6, tailHW: 2.6, headSize: 18.4, hornCount: 6, hornLen: 15,
    maneCount: 8, maneSize: 9.6, limbSize: 5.1, armT: 0.16, legT: 0.54,
    dorsalEvery: 2, dorsalLen: 5.4, tailFinSize: 4.4, eyeR: 7, fangCount: 6,
    wrathCount: 7, wrathLen: 21, maelstromCount: 4, sparkCount: 12, boss: true,
  },
};

function leviathanStage(stage) {
  const p = `leviathan-${STAGE_SLUG[stage]}`;
  const pal = STAGE_PALETTES[stage];
  const stroke = pal.deep;
  const defs = makeDefs(p, pal);
  const body = buildStage(stage, p, pal, stroke, STAGE_CFG[stage]);
  return wrapStage(stage, defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · sea-serpent redesign v7) -->
${STAGES.map(leviathanStage).join('\n')}`;
