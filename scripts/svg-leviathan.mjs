/**
 * Storm Leviathan — "Eclipse Maelstrom" evo line (v6 · boss-intimidation pass)
 * Distinct silhouette per stage (Pokémon-evolution style) PLUS an escalating
 * "barely contained fury" layer on adult+ forms: bigger/sharper shrapnel,
 * hotter slit-pupil eye, jagged red wrath-cracks breaking through the cold void.
 *   baby  → tiny round fracture seed (calm)
 *   evo1  → seed cracked into a 3-chunk drifting cluster
 *   evo2  → chunks fused into a tall jagged monolith/spine (first wrath hint)
 *   evo3  → BOSS: void core + twin broken halo-rings, slit eye, wrath cracks
 *   evo4  → tighter triple-ring gyroscope, denser + angrier
 *   evo5  → radiating mandala/dark-sun spikes, largest and most intense form
 * Export for apply-leviathan-svg.mjs → myman_mascot.js
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const STAGE_LABEL = {
  baby: 'BABY', evo1: 'KID', evo2: 'TEEN', evo3: 'ADULT', evo4: 'MIDDLE AGE', evo5: 'OLD',
};

const INK = '#00010a';

const STAGE_PALETTES = {
  baby: { stroke: '#1a3a5c', rim: '#7dd3fc', accent: '#38bdf8', shard: '#33507a', wrath: null },
  evo1: { stroke: '#0f2744', rim: '#67e8f9', accent: '#0ea5e9', shard: '#26456c', wrath: null },
  evo2: { stroke: '#0a1e36', rim: '#22d3ee', accent: '#06b6d4', shard: '#1a3350', wrath: '#fbbf24' },
  evo3: { stroke: '#050e18', rim: '#a5f3fc', accent: '#38bdf8', shard: '#14283f', wrath: '#ef4444' },
  evo4: { stroke: '#040810', rim: '#cbd5e1', accent: '#64748b', shard: '#1c2530', wrath: '#dc2626' },
  evo5: { stroke: '#020406', rim: '#f8fafc', accent: '#94a3b8', shard: '#23282f', wrath: '#fecaca' },
};

function grad(id, stops, type = 'radial', attrs) {
  const tag = type === 'linear' ? 'linearGradient' : 'radialGradient';
  const defAttrs = attrs
    || (type === 'linear' ? 'x1="0%" y1="0%" x2="100%" y2="100%"' : 'cx="40%" cy="28%" r="78%"');
  const stopLines = stops.map(([o, c, a = 1]) =>
    `${I4}<stop offset="${o}" style="stop-color:${c};stop-opacity:${a}" />`).join('\n');
  return `${I3}<${tag} id="${id}" ${defAttrs}>\n${stopLines}\n${I3}</${tag}>`;
}

function wrapStage(stage, title, defs, body) {
  return `${I}<!-- LEVIATHAN ${STAGE_LABEL[stage]} — ${title} -->
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
    grad(`${p}-void`, [['0%', INK], ['56%', INK], ['82%', pal.rim, 0.6], ['100%', INK, 0]], 'radial', 'cx="45%" cy="42%" r="65%"'),
    grad(`${p}-shard`, [['0%', pal.rim], ['45%', pal.shard], ['100%', INK]], 'linear', 'x1="10%" y1="0%" x2="90%" y2="100%"'),
    grad(`${p}-iris`, [['0%', pal.rim], ['40%', pal.accent], ['100%', '#000']], 'radial', 'cx="35%" cy="30%" r="70%"'),
    grad(`${p}-aura`, [['0%', pal.accent, 0.26], ['45%', pal.rim, 0.12], ['100%', INK, 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    `${I3}<filter id="${p}-glow" x="-60%" y="-60%" width="220%" height="220%">
${I4}<feGaussianBlur stdDeviation="1.3" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
  ].join('\n');
}

/** Elongated shard/shrapnel polygon oriented along angleDeg, tip pointing outward. */
function shardPolygon(cx, cy, angleDeg, len, wid) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const tipX = cx + dx * len;
  const tipY = cy + dy * len;
  const backX = cx - dx * len * 0.42;
  const backY = cy - dy * len * 0.42;
  const leftX = cx + px * wid;
  const leftY = cy + py * wid;
  const rightX = cx - px * wid;
  const rightY = cy - py * wid;
  return `M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${leftX.toFixed(1)} ${leftY.toFixed(1)} L ${backX.toFixed(1)} ${backY.toFixed(1)} L ${rightX.toFixed(1)} ${rightY.toFixed(1)} Z`;
}

function shardAtEllipseAngle(cx, cy, rx, ry, angleDeg, rotDeg) {
  const a = (angleDeg * Math.PI) / 180;
  const x0 = rx * Math.cos(a);
  const y0 = ry * Math.sin(a);
  const r = (rotDeg * Math.PI) / 180;
  const x = cx + (x0 * Math.cos(r) - y0 * Math.sin(r));
  const y = cy + (x0 * Math.sin(r) + y0 * Math.cos(r));
  const tangent = angleDeg + rotDeg + 90;
  return [x, y, tangent];
}

/** widthRatio smaller = sharper/more blade-like. Boss tiers use tighter ratios. */
function arcOfShards(cx, cy, rx, ry, angles, rotDeg, size, fillId, stroke, glowId, widthRatio = 0.3) {
  return angles.map((angle, i) => {
    const [x, y, tangent] = shardAtEllipseAngle(cx, cy, rx, ry, angle, rotDeg);
    const s = size * (0.74 + (i % 3) * 0.18);
    const op = (0.62 + (i % 4) * 0.09).toFixed(2);
    return `${I4}<path d="${shardPolygon(x, y, tangent, s, s * widthRatio)}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.9" opacity="${op}" filter="url(#${glowId})"/>`;
  }).join('\n');
}

/** A broken ring of orbiting shrapnel — gaps in gapIdx make it read as fractured, not a clean halo. */
function ringOfShards(cx, cy, rx, ry, count, rotDeg, gapIdx, size, fillId, stroke, glowId, widthRatio = 0.3) {
  const angles = [];
  for (let i = 0; i < count; i++) if (!gapIdx.includes(i)) angles.push((360 / count) * i);
  return arcOfShards(cx, cy, rx, ry, angles, rotDeg, size, fillId, stroke, glowId, widthRatio);
}

/** Only a partial arc of shrapnel — used for rings still "forming" on younger stages. */
function partialRing(cx, cy, rx, ry, startDeg, endDeg, count, rotDeg, size, fillId, stroke, glowId) {
  const angles = [];
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 0 : i / (count - 1);
    angles.push(startDeg + (endDeg - startDeg) * t);
  }
  return arcOfShards(cx, cy, rx, ry, angles, rotDeg, size, fillId, stroke, glowId);
}

/** Small drifting fragment cluster — used where limbs would be; nothing is attached to the core. */
function fragmentCluster(cx, cy, count, size, fillId, stroke, seedAngle) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const angle = seedAngle + i * 47;
    const dist = size * 0.9 + (i % 2) * size * 0.45;
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.cos(rad) * dist;
    const y = cy + Math.sin(rad) * dist * 0.6;
    const len = size * (0.82 + (i % 3) * 0.18);
    const op = (0.62 + (i % 3) * 0.1).toFixed(2);
    parts.push(`${I4}<path d="${shardPolygon(x, y, angle + 90, len, len * 0.32)}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.8" opacity="${op}"/>`);
  }
  return parts.join('\n');
}

/** Comet-debris tail trailing downward, shrinking and fading. */
function cometTail(cx, cy, count, size, fillId, stroke) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const y = cy + t * 30;
    const x = cx + Math.sin(t * 6) * 4 * (1 - t);
    const s = size * (1 - t * 0.7);
    const op = (0.74 * (1 - t * 0.8)).toFixed(2);
    parts.push(`${I4}<path d="${shardPolygon(x, y, 90, s, s * 0.32)}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.75" opacity="${op}"/>`);
  }
  return parts.join('\n');
}

/** Zigzag lightning crack connecting two chunks (used to visually bind fractured pieces). */
function crackLine(x1, y1, x2, y2, vein) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const off = 3.5;
  const kx = mx + px * off;
  const ky = my + py * off;
  return `${I4}<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${kx.toFixed(1)} ${ky.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${vein}" stroke-width="1" fill="none" opacity="0.55" class="tm-leviathan-vein"/>`;
}

/** Jagged fork of raw power radiating outward — the "barely contained fury" breaking through the void. */
function wrathBolt(cx, cy, angleDeg, len, color, glowId, weight = 1.3) {
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
  return `${I4}<path d="M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${mx.toFixed(1)} ${my.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}" stroke="${color}" stroke-width="${weight}" fill="none" stroke-linecap="round" opacity="0.8" filter="url(#${glowId})"/>`;
}

function wrathBolts(cx, cy, angles, len, color, glowId, weight) {
  if (!color) return '';
  return angles.map((a) => wrathBolt(cx, cy, a, len, color, glowId, weight)).join('\n');
}

/** Tall jagged stack of angular plates — the teen "monolith/spine" silhouette. */
function stackedSpine(cx, topY, plateCount, plateW, plateH, gap, fillId, stroke) {
  const parts = [];
  for (let i = 0; i < plateCount; i++) {
    const y = topY + i * (plateH + gap);
    const w = plateW * (0.55 + i * 0.11);
    const skew = (i % 2 === 0 ? 1 : -1) * 2;
    const x = cx + skew;
    parts.push(`${I4}<path d="M ${(x - w).toFixed(1)} ${(y - plateH * 0.5).toFixed(1)} L ${(x + w).toFixed(1)} ${(y - plateH * 0.35).toFixed(1)} L ${(x + w * 0.8).toFixed(1)} ${(y + plateH * 0.5).toFixed(1)} L ${(x - w * 0.8).toFixed(1)} ${(y + plateH * 0.4).toFixed(1)} Z" fill="url(#${fillId})" stroke="${stroke}" stroke-width="1" opacity="${(0.72 + i * 0.04).toFixed(2)}"/>`);
  }
  return parts.join('\n');
}

/** Faint swirl arcs inside the void, hinting at rotation. */
function swirlArcs(cx, cy, r, rimColor, glowId) {
  return `${I4}<path d="M ${(cx - r * 0.7).toFixed(1)} ${(cy - r * 0.1).toFixed(1)} A ${(r * 0.75).toFixed(1)} ${(r * 0.45).toFixed(1)} 20 1 1 ${(cx + r * 0.65).toFixed(1)} ${(cy + r * 0.25).toFixed(1)}" fill="none" stroke="${rimColor}" stroke-width="1.1" opacity="0.42" class="tm-leviathan-vein" filter="url(#${glowId})"/>
${I4}<path d="M ${(cx - r * 0.5).toFixed(1)} ${(cy + r * 0.35).toFixed(1)} A ${(r * 0.55).toFixed(1)} ${(r * 0.3).toFixed(1)} -25 1 0 ${(cx + r * 0.45).toFixed(1)} ${(cy - r * 0.3).toFixed(1)}" fill="none" stroke="${rimColor}" stroke-width="0.85" opacity="0.32" class="tm-leviathan-vein"/>`;
}

function voidCore(cx, cy, r, p, pal, glowId) {
  return `${I4}<circle cx="${cx}" cy="${cy}" r="${(r * 1.35).toFixed(1)}" fill="url(#${p}-void)" opacity="0.93"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="${INK}" opacity="0.97"/>
${swirlArcs(cx, cy, r, pal.rim, glowId)}
${I4}<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${pal.rim}" stroke-width="1" opacity="0.5" filter="url(#${glowId})"/>`;
}

/** slit=true gives a predatory vertical-slit pupil instead of a round one (boss tiers). */
function maelstromEye(cx, cy, r, p, pal, stroke, boss, slit = false) {
  const glowMul = boss ? 2.7 : 1.8;
  const glowOp = boss ? 0.3 : 0.13;
  const pupil = slit
    ? `${I4}<ellipse class="tm-leviathan-pupil" cx="${cx}" cy="${cy}" rx="${(r * 0.15).toFixed(1)}" ry="${(r * 0.52).toFixed(1)}" fill="#000"/>`
    : `${I4}<circle class="tm-leviathan-pupil" cx="${cx}" cy="${cy}" r="${(r * 0.26).toFixed(1)}" fill="#000"/>`;
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${I4}<circle cx="${cx}" cy="${cy}" r="${(r * glowMul).toFixed(1)}" fill="${pal.rim}" opacity="${glowOp}" filter="url(#${p}-glow)"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="#000" stroke="${pal.rim}" stroke-width="${boss ? 1.9 : 1.25}"/>
${I4}<ellipse class="tm-leviathan-iris" cx="${cx}" cy="${cy}" rx="${(r * 0.7).toFixed(1)}" ry="${(r * (slit ? 0.78 : 0.62)).toFixed(1)}" fill="url(#${p}-iris)"/>
${pupil}
${I4}<path d="M ${(cx - r * 1.1).toFixed(1)} ${(cy - r * 0.3).toFixed(1)} L ${(cx - r * 2.6).toFixed(1)} ${(cy - r * 1.1).toFixed(1)}" stroke="${stroke}" stroke-width="1" opacity="0.5" class="tm-leviathan-vein"/>
${I4}<path d="M ${(cx + r * 1.1).toFixed(1)} ${(cy + r * 0.4).toFixed(1)} L ${(cx + r * 2.4).toFixed(1)} ${(cy + r * 1.3).toFixed(1)}" stroke="${stroke}" stroke-width="0.8" opacity="0.4" class="tm-leviathan-vein"/>
${I4}<circle cx="${(cx - r * 0.25).toFixed(1)}" cy="${(cy - r * 0.3).toFixed(1)}" r="${Math.max(0.7, r * 0.14).toFixed(1)}" fill="#fff" opacity="0.5"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${(cx - r).toFixed(1)} ${cy} Q ${cx} ${(cy - r * 0.5).toFixed(1)} ${(cx + r).toFixed(1)} ${cy}" stroke="${stroke}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

function fractureMouth(cx, cy, len, stroke) {
  return `${I3}<path class="tm-mascot-mouth-happy" d="M ${(cx - len).toFixed(1)} ${cy} L ${(cx - len * 0.3).toFixed(1)} ${(cy + len * 0.4).toFixed(1)} L ${cx} ${cy} L ${(cx + len * 0.3).toFixed(1)} ${(cy + len * 0.4).toFixed(1)} L ${(cx + len).toFixed(1)} ${cy}" stroke="${stroke}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${(cx - len * 1.3).toFixed(1)} ${(cy - len * 0.2).toFixed(1)} L ${(cx - len * 0.4).toFixed(1)} ${(cy + len * 0.6).toFixed(1)} L ${cx} ${(cy - len * 0.1).toFixed(1)} L ${(cx + len * 0.4).toFixed(1)} ${(cy + len * 0.6).toFixed(1)} L ${(cx + len * 1.3).toFixed(1)} ${(cy - len * 0.2).toFixed(1)}" stroke="${stroke}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.8"/>`;
}

function stormSparks(pal, count) {
  const pts = [
    [8, 16], [92, 14], [4, 40], [96, 42], [12, 66], [88, 68],
    [20, 6], [80, 4], [2, 54], [98, 52], [38, 2], [62, 2],
    [14, 84], [86, 86], [50, 0],
  ].slice(0, count);
  return pts.map(([x, y], i) => {
    const fill = i % 3 === 0 ? pal.rim : i % 2 ? pal.accent : '#f0f9ff';
    return `${I3}<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 1.7 : 1.1}" fill="${fill}" opacity="${0.32 + (i % 4) * 0.09}"/>`;
  }).join('\n');
}

/** BABY — Fracture Seed: a tiny round void orb, minimal debris, calm. */
function stageBaby(p, pal, stroke) {
  const coreR = 9;
  const eyeX = 52;
  const eyeY = 46;
  const eyeR = 3.2;
  return `${I3}<ellipse cx="50" cy="88" rx="14" ry="3" fill="${INK}" opacity="0.35"/>
${I3}<ellipse cx="50" cy="50" rx="24" ry="22" fill="url(#${p}-aura)" opacity="0.22"/>
${stormSparks(pal, 4)}
${I3}<g class="tm-animate-wing-left">
${I4}<path d="${shardPolygon(38, 44, 200, 4, 1.4)}" fill="url(#${p}-shard)" stroke="${stroke}" stroke-width="0.7" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="${shardPolygon(64, 46, -20, 4, 1.4)}" fill="url(#${p}-shard)" stroke="${stroke}" stroke-width="0.7" opacity="0.6"/>
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${voidCore(50, 50, coreR, p, pal, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(38, 58, 1, 2.6, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(62, 58, 1, 2.6, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(42, 68, 1, 2.2, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(58, 68, 1, 2.2, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(50, 66, 2, 2, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, false, false)}
${fractureMouth(eyeX - 1, eyeY + coreR * 0.7, 2.4, stroke)}`;
}

/** EVO1 (kid) — Drifting Rift: the seed cracked into 3 loose chunks. */
function stageEvo1(p, pal, stroke) {
  const mainR = 9;
  const satR1 = 5;
  const satR2 = 4;
  const mainX = 48;
  const mainY = 48;
  const sat1X = 66;
  const sat1Y = 40;
  const sat2X = 40;
  const sat2Y = 68;
  const eyeX = 50;
  const eyeY = 44;
  const eyeR = 3.6;
  return `${I3}<ellipse cx="50" cy="90" rx="20" ry="3.4" fill="${INK}" opacity="0.35"/>
${I3}<ellipse cx="50" cy="52" rx="34" ry="30" fill="url(#${p}-aura)" opacity="0.26"/>
${stormSparks(pal, 6)}
${I3}<g class="tm-animate-wing-left">
${partialRing(mainX, mainY, 20, 9, 140, 220, 3, -10, 3.4, `${p}-shard`, stroke, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${partialRing(mainX, mainY, 18, 8, -40, 30, 3, 14, 3.2, `${p}-shard`, stroke, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${voidCore(mainX, mainY, mainR, p, pal, `${p}-glow`)}
${crackLine(mainX + mainR * 0.6, mainY - mainR * 0.3, sat1X - satR1 * 0.4, sat1Y + satR1 * 0.3, pal.rim)}
${crackLine(mainX - mainR * 0.5, mainY + mainR * 0.5, sat2X + satR2 * 0.3, sat2Y - satR2 * 0.4, pal.rim)}
${voidCore(sat1X, sat1Y, satR1, p, pal, `${p}-glow`)}
${voidCore(sat2X, sat2Y, satR2, p, pal, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(30, 54, 2, 3, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(74, 50, 2, 3, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(38, 74, 1, 2.6, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(60, 72, 1, 2.6, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(45, 76, 3, 2.4, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, false, false)}
${fractureMouth(eyeX - 1, eyeY + mainR * 0.7, 2.8, stroke)}`;
}

/** EVO2 (teen) — Storm Maelstrom: fused into a tall jagged monolith/spine. First hint of wrath. */
function stageEvo2(p, pal, stroke) {
  const cx = 50;
  const eyeX = 52;
  const eyeY = 24;
  const eyeR = 4.2;
  return `${I3}<ellipse cx="50" cy="94" rx="24" ry="4" fill="${INK}" opacity="0.4"/>
${I3}<ellipse cx="50" cy="52" rx="38" ry="36" fill="url(#${p}-aura)" opacity="0.32"/>
${stormSparks(pal, 8)}
${I3}<g class="tm-animate-wing-left">
${partialRing(cx, 60, 26, 11, 150, 260, 5, -16, 3.8, `${p}-shard`, stroke, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${partialRing(cx, 60, 15, 7, -30, 20, 2, 16, 3, `${p}-shard`, stroke, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${stackedSpine(cx, 20, 5, 11, 13, 2, `${p}-shard`, stroke)}
${I4}<circle cx="${cx}" cy="60" r="10" fill="url(#${p}-void)" opacity="0.85"/>
${swirlArcs(cx, 60, 10, pal.rim, `${p}-glow`)}
${wrathBolts(eyeX, eyeY, [-70, 230], 9, pal.wrath, `${p}-glow`, 1)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(26, 56, 3, 3.6, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(74, 56, 3, 3.6, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(36, 78, 2, 3.2, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(64, 78, 2, 3.2, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(50, 82, 6, 3, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, false, false)}
${fractureMouth(eyeX - 2, eyeY + 8, 3.6, stroke)}`;
}

/** EVO3 (adult) — BOSS: void core + twin broken halo-rings, slit eye, wrath cracks. */
function stageEvo3(p, pal, stroke) {
  const coreR = 22.5;
  const eyeX = 58;
  const eyeY = 26.5;
  const eyeR = 6.5;
  const shardSize = 7.6;
  const ringLeft = { cx: 39, cy: 47, rx: 43, ry: 17, rot: -23, count: 11, gaps: [5] };
  const ringRight = { cx: 63, cy: 53, rx: 41.5, ry: 16, rot: 29, count: 10, gaps: [1] };
  return `${I3}<ellipse cx="50" cy="97" rx="34" ry="4.6" fill="${INK}" opacity="0.42"/>
${I3}<ellipse cx="50" cy="50" rx="53" ry="50" fill="url(#${p}-aura)" opacity="0.62"/>
${stormSparks(pal, 14)}
${I3}<g class="tm-animate-wing-left">
${ringOfShards(ringLeft.cx, ringLeft.cy, ringLeft.rx, ringLeft.ry, ringLeft.count, ringLeft.rot, ringLeft.gaps, shardSize, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${ringOfShards(ringRight.cx, ringRight.cy, ringRight.rx, ringRight.ry, ringRight.count, ringRight.rot, ringRight.gaps, shardSize, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${voidCore(50, 50, coreR, p, pal, `${p}-glow`)}
${wrathBolts(eyeX, eyeY, [-75, -15, 165, 205], 16, pal.wrath, `${p}-glow`, 1.5)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(24, 56, 4, shardSize, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(76, 56, 4, shardSize, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(34, 78, 3, shardSize * 0.85, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(66, 78, 3, shardSize * 0.85, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(50, 82, 7, shardSize * 0.9, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, true, true)}
${fractureMouth(eyeX - 2, eyeY + coreR * 0.72, 5.6, stroke)}`;
}

/** EVO4 (middle age) — Abyssal Eclipse: tighter triple-ring gyroscope, denser + angrier. */
function stageEvo4(p, pal, stroke) {
  const coreR = 17.2;
  const eyeX = 58;
  const eyeY = 29;
  const eyeR = 6.8;
  const shardSize = 8.2;
  return `${I3}<ellipse cx="50" cy="96" rx="33" ry="4.9" fill="${INK}" opacity="0.45"/>
${I3}<ellipse cx="50" cy="50" rx="50" ry="46" fill="url(#${p}-aura)" opacity="0.6"/>
${stormSparks(pal, 13)}
${I3}<g class="tm-animate-wing-left">
${ringOfShards(45, 47, 26, 23, 10, -30, [4], shardSize * 0.9, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${ringOfShards(55, 52, 24, 10.5, 12, 42, [2], shardSize * 0.9, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${voidCore(50, 50, coreR, p, pal, `${p}-glow`)}
${I4}<!-- Third gyroscope ring, near-vertical, crossing the other two -->
${ringOfShards(50, 50, 9.5, 27, 8, 82, [3], shardSize * 0.75, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${wrathBolts(eyeX, eyeY, [-80, -25, 150, 200, 260], 18, pal.wrath, `${p}-glow`, 1.6)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(28, 52, 3, shardSize * 0.75, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(72, 52, 3, shardSize * 0.75, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(36, 76, 2, shardSize * 0.65, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(64, 76, 2, shardSize * 0.65, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(50, 80, 7, shardSize * 0.6, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, true, true)}
${fractureMouth(eyeX - 2, eyeY + coreR * 0.68, 4.6, stroke)}`;
}

/** EVO5 (old) — Primordial Void-Storm: radiating mandala/dark-sun spikes, largest and most intense. */
function stageEvo5(p, pal, stroke) {
  const coreR = 24.5;
  const eyeX = 59;
  const eyeY = 25.5;
  const eyeR = 7.4;
  const shardSize = 9;
  const spikeCount = 14;
  const spikes = [];
  for (let i = 0; i < spikeCount; i++) {
    const angle = (360 / spikeCount) * i;
    const a = (angle * Math.PI) / 180;
    const ix = 50 + Math.cos(a) * (coreR * 0.9);
    const iy = 50 + Math.sin(a) * (coreR * 0.9);
    const op = (0.55 + (i % 3) * 0.13).toFixed(2);
    spikes.push(`${I4}<path d="${shardPolygon(ix, iy, angle, coreR * 0.98, coreR * 0.15)}" fill="url(#${p}-shard)" stroke="${stroke}" stroke-width="1" opacity="${op}" filter="url(#${p}-glow)"/>`);
  }
  return `${I3}<ellipse cx="50" cy="97" rx="39" ry="5.4" fill="${INK}" opacity="0.48"/>
${I3}<ellipse cx="50" cy="50" rx="57" ry="53" fill="url(#${p}-aura)" opacity="0.68"/>
${stormSparks(pal, 15)}
${I3}<g class="tm-animate-wing-left">
${ringOfShards(38, 47, 39, 16, 13, -26, [6], shardSize, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${ringOfShards(64, 54, 37, 15, 12, 32, [1], shardSize, `${p}-shard`, stroke, `${p}-glow`, 0.24)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${voidCore(50, 50, coreR, p, pal, `${p}-glow`)}
${spikes.join('\n')}
${wrathBolts(eyeX, eyeY, [-85, -35, -5, 140, 185, 235, 280], 22, pal.wrath, `${p}-glow`, 1.8)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(16, 58, 4, shardSize * 0.8, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(84, 58, 4, shardSize * 0.8, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(30, 82, 3, shardSize * 0.7, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(70, 82, 3, shardSize * 0.7, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(50, 86, 9, shardSize * 0.65, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, true, true)}
${fractureMouth(eyeX - 2, eyeY + coreR * 0.62, 5, stroke)}`;
}

const STAGE_BUILDERS = {
  baby: stageBaby, evo1: stageEvo1, evo2: stageEvo2,
  evo3: stageEvo3, evo4: stageEvo4, evo5: stageEvo5,
};

function leviathanStage(stage) {
  const p = `leviathan-${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}`;
  const titles = {
    baby: 'Fracture Seed',
    evo1: 'Drifting Rift',
    evo2: 'Storm Maelstrom',
    evo3: 'Eclipse Maelstrom — BOSS',
    evo4: 'Abyssal Eclipse',
    evo5: 'Primordial Void-Storm',
  };
  const pal = STAGE_PALETTES[stage];
  const stroke = pal.stroke;
  const defs = makeDefs(p, pal);
  const body = STAGE_BUILDERS[stage](p, pal, stroke);
  return wrapStage(stage, titles[stage], defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · Eclipse Maelstrom v6 · boss-intimidation pass) -->
${STAGES.map(leviathanStage).join('\n')}`;
