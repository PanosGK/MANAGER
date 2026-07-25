/**
 * Storm Leviathan — MYTHICAL "Eclipse Maelstrom" evo line (v4 · abstract/eldritch)
 * No animal anatomy: a swirling void core wearing two asymmetric broken halo-rings
 * of orbiting storm shrapnel, drifting fragment clusters instead of limbs, a comet
 * debris tail, and a single burning eye set in a fracture of the void.
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
  baby: { stroke: '#1a3a5c', rim: '#7dd3fc', accent: '#38bdf8', shard: '#33507a' },
  evo1: { stroke: '#0f2744', rim: '#67e8f9', accent: '#0ea5e9', shard: '#26456c' },
  evo2: { stroke: '#0a1e36', rim: '#22d3ee', accent: '#06b6d4', shard: '#1a3350' },
  evo3: { stroke: '#050e18', rim: '#a5f3fc', accent: '#38bdf8', shard: '#14283f' },
  evo4: { stroke: '#040810', rim: '#cbd5e1', accent: '#64748b', shard: '#1c2530' },
  evo5: { stroke: '#020406', rim: '#f8fafc', accent: '#94a3b8', shard: '#23282f' },
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
    grad(`${p}-void`, [['0%', INK], ['58%', INK], ['84%', pal.rim, 0.5], ['100%', INK, 0]], 'radial', 'cx="45%" cy="42%" r="65%"'),
    grad(`${p}-shard`, [['0%', pal.rim], ['45%', pal.shard], ['100%', INK]], 'linear', 'x1="10%" y1="0%" x2="90%" y2="100%"'),
    grad(`${p}-iris`, [['0%', pal.rim], ['40%', pal.accent], ['100%', '#000']], 'radial', 'cx="35%" cy="30%" r="70%"'),
    grad(`${p}-aura`, [['0%', pal.accent, 0.24], ['45%', pal.rim, 0.1], ['100%', INK, 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
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
  const backX = cx - dx * len * 0.45;
  const backY = cy - dy * len * 0.45;
  const leftX = cx + px * wid;
  const leftY = cy + py * wid;
  const rightX = cx - px * wid;
  const rightY = cy - py * wid;
  return `M ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${leftX.toFixed(1)} ${leftY.toFixed(1)} L ${backX.toFixed(1)} ${backY.toFixed(1)} L ${rightX.toFixed(1)} ${rightY.toFixed(1)} Z`;
}

/** A broken ring of orbiting shrapnel — gaps in gapIdx make it read as fractured, not a clean halo. */
function ringOfShards(cx, cy, rx, ry, count, rotDeg, gapIdx, size, fillId, stroke, glowId) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    if (gapIdx.includes(i)) continue;
    const angle = (360 / count) * i;
    const a = (angle * Math.PI) / 180;
    const x0 = rx * Math.cos(a);
    const y0 = ry * Math.sin(a);
    const r = (rotDeg * Math.PI) / 180;
    const x = cx + (x0 * Math.cos(r) - y0 * Math.sin(r));
    const y = cy + (x0 * Math.sin(r) + y0 * Math.cos(r));
    const tangent = angle + rotDeg + 90;
    const s = size * (0.72 + (i % 3) * 0.16);
    const op = (0.58 + (i % 4) * 0.09).toFixed(2);
    parts.push(`${I4}<path d="${shardPolygon(x, y, tangent, s, s * 0.38)}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.85" opacity="${op}" filter="url(#${glowId})"/>`);
  }
  return parts.join('\n');
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
    const len = size * (0.8 + (i % 3) * 0.16);
    const op = (0.6 + (i % 3) * 0.1).toFixed(2);
    parts.push(`${I4}<path d="${shardPolygon(x, y, angle + 90, len, len * 0.4)}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.75" opacity="${op}"/>`);
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
    const op = (0.72 * (1 - t * 0.8)).toFixed(2);
    parts.push(`${I4}<path d="${shardPolygon(x, y, 90, s, s * 0.35)}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.7" opacity="${op}"/>`);
  }
  return parts.join('\n');
}

/** Faint swirl arcs inside the void, hinting at rotation without literal spiral math blowing up. */
function swirlArcs(cx, cy, r, rimColor, glowId) {
  return `${I4}<path d="M ${(cx - r * 0.7).toFixed(1)} ${(cy - r * 0.1).toFixed(1)} A ${(r * 0.75).toFixed(1)} ${(r * 0.45).toFixed(1)} 20 1 1 ${(cx + r * 0.65).toFixed(1)} ${(cy + r * 0.25).toFixed(1)}" fill="none" stroke="${rimColor}" stroke-width="1.1" opacity="0.42" class="tm-leviathan-vein" filter="url(#${glowId})"/>
${I4}<path d="M ${(cx - r * 0.5).toFixed(1)} ${(cy + r * 0.35).toFixed(1)} A ${(r * 0.55).toFixed(1)} ${(r * 0.3).toFixed(1)} -25 1 0 ${(cx + r * 0.45).toFixed(1)} ${(cy - r * 0.3).toFixed(1)}" fill="none" stroke="${rimColor}" stroke-width="0.85" opacity="0.32" class="tm-leviathan-vein"/>`;
}

function voidCore(cx, cy, r, p, pal, glowId) {
  return `${I4}<circle cx="${cx}" cy="${cy}" r="${(r * 1.35).toFixed(1)}" fill="url(#${p}-void)" opacity="0.92"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="${INK}" opacity="0.97"/>
${swirlArcs(cx, cy, r, pal.rim, glowId)}
${I4}<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${pal.rim}" stroke-width="1" opacity="0.5" filter="url(#${glowId})"/>`;
}

function maelstromEye(cx, cy, r, p, pal, stroke, boss) {
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${I4}<circle cx="${cx}" cy="${cy}" r="${(r * (boss ? 2.4 : 1.8)).toFixed(1)}" fill="${pal.rim}" opacity="${boss ? 0.22 : 0.13}" filter="url(#${p}-glow)"/>
${I4}<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="#000" stroke="${pal.rim}" stroke-width="${boss ? 1.7 : 1.25}"/>
${I4}<circle class="tm-leviathan-iris" cx="${cx}" cy="${cy}" r="${(r * 0.62).toFixed(1)}" fill="url(#${p}-iris)"/>
${I4}<circle class="tm-leviathan-pupil" cx="${cx}" cy="${cy}" r="${(r * 0.26).toFixed(1)}" fill="#000"/>
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

function leviathanStage(stage) {
  const tier = { baby: 1, evo1: 2, evo2: 3, evo3: 4, evo4: 5, evo5: 6 }[stage];
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
  const boss = tier >= 4;

  const coreR = 10.5 + tier * 2.1;
  const eyeX = 55 + tier * 0.5;
  const eyeY = 34 - tier * 1.6;
  const eyeR = 3.1 + tier * 0.58;
  const shardSize = 3.1 + tier * 0.82;

  const ringLeftCount = 6 + tier;
  const ringRightCount = 5 + tier;
  const ringLeft = {
    cx: 44 - tier * 0.8, cy: 50 - tier * 0.5,
    rx: 20 + tier * 4.3, ry: 8 + tier * 1.65,
    rot: -14 - tier * 2.1, count: ringLeftCount, gaps: [Math.floor(ringLeftCount / 2)],
  };
  const ringRight = {
    cx: 58 + tier * 1.1, cy: 52 + tier * 0.35,
    rx: 17 + tier * 4.8, ry: 6.5 + tier * 1.85,
    rot: 18 + tier * 2.5, count: ringRightCount, gaps: [1],
  };

  const armFragCount = 2 + Math.min(3, Math.floor(tier / 2) + 1);
  const legFragCount = Math.max(1, armFragCount - 1);
  const tailFragCount = 3 + tier;

  const defs = makeDefs(p, pal);

  const body = `${I3}<ellipse cx="50" cy="97" rx="${(22 + tier * 2.4).toFixed(1)}" ry="4.4" fill="${INK}" opacity="0.4"/>
${I3}<ellipse cx="50" cy="50" rx="${(40 + tier * 1.6).toFixed(1)}" ry="${(38 + tier * 1.3).toFixed(1)}" fill="url(#${p}-aura)" opacity="${boss ? 0.5 : 0.28}"/>
${stormSparks(pal, 5 + tier)}
${I3}<g class="tm-animate-wing-left">
${ringOfShards(ringLeft.cx, ringLeft.cy, ringLeft.rx, ringLeft.ry, ringLeft.count, ringLeft.rot, ringLeft.gaps, shardSize, `${p}-shard`, stroke, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${ringOfShards(ringRight.cx, ringRight.cy, ringRight.rx, ringRight.ry, ringRight.count, ringRight.rot, ringRight.gaps, shardSize, `${p}-shard`, stroke, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${voidCore(50, 50, coreR, p, pal, `${p}-glow`)}
${I3}</g>
${I3}<g class="tm-animate-arm-left">
${fragmentCluster(26, 56, armFragCount, shardSize, `${p}-shard`, stroke, 200)}
${I3}</g>
${I3}<g class="tm-animate-arm-right">
${fragmentCluster(74, 56, armFragCount, shardSize, `${p}-shard`, stroke, 20)}
${I3}</g>
${I3}<g class="tm-animate-leg-left">
${fragmentCluster(36, 76, legFragCount, shardSize * 0.85, `${p}-shard`, stroke, 260)}
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${fragmentCluster(64, 76, legFragCount, shardSize * 0.85, `${p}-shard`, stroke, 80)}
${I3}</g>
${I3}<g class="tm-animate-tail">
${cometTail(50, 80, tailFragCount, shardSize * 0.9, `${p}-shard`, stroke)}
${I3}</g>
${maelstromEye(eyeX, eyeY, eyeR, p, pal, stroke, boss)}
${fractureMouth(eyeX - 2, eyeY + coreR * 0.75, 3 + tier * 0.4, stroke)}`;

  return wrapStage(stage, titles[stage], defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · Eclipse Maelstrom v4 · abstract/eldritch) -->
${STAGES.map(leviathanStage).join('\n')}`;
