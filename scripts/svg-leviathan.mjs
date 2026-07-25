/**
 * Storm Leviathan — v12 "Evolution Morph Line"
 *
 * Pokémon-style stage morphs (distinct silhouettes, not just bigger + more spikes):
 *   baby  — Tide Serpentling: chubby tadpole-eel, big soft head, paddle tail
 *   evo1  — Squall Serpent: slim juvenile eel, first fangs + whiskers
 *   evo2  — Thunder Serpent: true sea-serpent S-curve, armor, crescent fluke
 *   evo3  — Storm Leviathan: BOSS morph — armored dragon-head, horn crest, sail spines
 *   evo4  — Tempest Sovereign: crowned dual-horn sovereign, frill + sail
 *   evo5  — Primordial Chaos: ancient final form — torn plates, chaos mane, forked lightning fluke
 *
 * Dense HD SVG layering kept; transparent floating mascot (no water box).
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
  baby: 'Tide Serpentling',
  evo1: 'Squall Serpent',
  evo2: 'Thunder Serpent',
  evo3: 'Storm Leviathan — BOSS',
  evo4: 'Tempest Sovereign',
  evo5: 'Primordial Chaos Serpent',
};

const STAGE_PALETTES = {
  baby: {
    hi: '#7ab0c8', mid: '#3a5e74', deep: '#142636', abyss: '#081018',
    belly: '#5a8094', rim: '#b8e4f4', eye: '#dff6ff', vein: '#9ad8f0',
    fang: '#eef8fc', spray: '#c8e8f4',
  },
  evo1: {
    hi: '#5a8ca6', mid: '#243f52', deep: '#08121a', abyss: '#02070b',
    belly: '#355468', rim: '#8ecae6', eye: '#b4eafd', vein: '#67e8f9',
    fang: '#eef8fc', spray: '#aed6e8',
  },
  evo2: {
    hi: '#4a7c96', mid: '#1c3546', deep: '#060e16', abyss: '#010508',
    belly: '#2c4a5c', rim: '#7bb8d4', eye: '#a6e4fb', vein: '#22d3ee',
    fang: '#f2fafc', spray: '#a0cedf',
  },
  evo3: {
    hi: '#3d6e88', mid: '#152838', deep: '#040a10', abyss: '#010306',
    belly: '#243e50', rim: '#6eb4d4', eye: '#a8e7fc', vein: '#38bdf8',
    fang: '#f6fcff', spray: '#98c8dc',
  },
  evo4: {
    hi: '#355a70', mid: '#101e28', deep: '#02070b', abyss: '#000204',
    belly: '#1a3240', rim: '#5fa6cb', eye: '#a0e2fa', vein: '#7dd3fc',
    fang: '#f0f6fa', spray: '#8cbcce',
  },
  evo5: {
    hi: '#4a6570', mid: '#0c1418', deep: '#010305', abyss: '#000102',
    belly: '#1a2428', rim: '#c0d8e4', eye: '#f0faff', vein: '#ffffff',
    fang: '#ffffff', spray: '#a8c4d0',
  },
};

function grad(id, stops, type = 'linear', attrs) {
  const tag = type === 'radial' ? 'radialGradient' : 'linearGradient';
  const defAttrs = attrs
    || (type === 'radial' ? 'cx="38%" cy="28%" r="72%"' : 'x1="10%" y1="0%" x2="90%" y2="100%"');
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
    grad(`${p}-skin`, [
      ['0%', pal.hi], ['22%', pal.rim], ['48%', pal.mid], ['78%', pal.deep], ['100%', pal.abyss],
    ], 'linear', 'x1="15%" y1="0%" x2="80%" y2="100%"'),
    grad(`${p}-skin-rad`, [
      ['0%', pal.hi, 0.95], ['35%', pal.mid], ['100%', pal.abyss],
    ], 'radial', 'cx="45%" cy="30%" r="75%"'),
    grad(`${p}-belly`, [
      ['0%', pal.belly], ['55%', pal.mid], ['100%', pal.deep],
    ], 'linear', 'x1="40%" y1="0%" x2="55%" y2="100%"'),
    grad(`${p}-fin`, [
      ['0%', pal.rim], ['40%', pal.mid], ['100%', pal.abyss],
    ], 'linear', 'x1="50%" y1="0%" x2="50%" y2="100%"'),
    grad(`${p}-eye`, [
      ['0%', '#ffffff'], ['18%', pal.eye], ['55%', pal.rim], ['82%', pal.deep], ['100%', '#000'],
    ], 'radial', 'cx="36%" cy="30%" r="70%"'),
    grad(`${p}-glow`, [
      ['0%', pal.eye, 0.35], ['45%', pal.vein, 0.12], ['100%', pal.vein, 0],
    ], 'radial', 'cx="50%" cy="45%" r="55%"'),
    `${I3}<pattern id="${p}-scales" width="3.2" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
${I4}<path d="M 0 1.3 Q 1.6 0.1 3.2 1.3 Q 1.6 2.4 0 1.3 Z" fill="${pal.deep}" opacity="0.42"/>
${I4}<path d="M 0 1.3 Q 1.6 0.35 3.2 1.3" fill="none" stroke="${pal.rim}" stroke-width="0.28" opacity="0.4"/>
${I4}<path d="M 1.6 0 Q 3.2 1.1 1.6 2.2" fill="none" stroke="${pal.hi}" stroke-width="0.18" opacity="0.18"/>
${I3}</pattern>`,
    `${I3}<pattern id="${p}-micro" width="2" height="2" patternUnits="userSpaceOnUse">
${I4}<circle cx="0.6" cy="0.7" r="0.25" fill="${pal.rim}" opacity="0.12"/>
${I4}<circle cx="1.5" cy="1.4" r="0.18" fill="${pal.abyss}" opacity="0.18"/>
${I3}</pattern>`,
    `${I3}<filter id="${p}-soft" x="-60%" y="-60%" width="220%" height="220%">
${I4}<feGaussianBlur stdDeviation="0.9" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
    `${I3}<filter id="${p}-glowf" x="-100%" y="-100%" width="300%" height="300%">
${I4}<feGaussianBlur stdDeviation="1.4" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
    `${I3}<filter id="${p}-wet" x="-20%" y="-20%" width="140%" height="140%">
${I4}<feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur"/>
${I4}<feSpecularLighting in="blur" surfaceScale="2.2" specularConstant="0.9" specularExponent="18" lighting-color="${pal.rim}" result="spec">
${I4}  <fePointLight x="30" y="10" z="40"/>
${I4}</feSpecularLighting>
${I4}<feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
${I4}<feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0"/>
${I3}</filter>`,
  ].join('\n');
}

function smoothPath(pts, closed = false) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  if (closed) d += ' Z';
  return d;
}

/**
 * Build tapering serpentine ribbon. Morph tweaks mid-body bulge / wave profile.
 * morph: tadpole | eel | serpent | leviathan | sovereign | chaos
 */
function serpentRibbon(cfg) {
  const { hx, hy, segs, length, amp, waves, headW, tailW, morph } = cfg;
  const tops = [];
  const bots = [];
  const centers = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = hx - length * t;
    let y = hy + Math.sin(t * Math.PI * waves) * amp * (0.35 + t * 0.65)
      + Math.sin(t * Math.PI * 2.2) * amp * 0.18;
    // Morph-specific undulation / posture
    if (morph === 'tadpole') y = hy + Math.sin(t * Math.PI * 1.1) * amp * 0.55;
    if (morph === 'chaos') y += Math.sin(t * Math.PI * 3.4) * amp * 0.22;

    let flare = t < 0.12 ? 1 + (1 - t / 0.12) * 0.35 : 1;
    // Chubby tadpole mid-bulge
    if (morph === 'tadpole') flare *= 1 + Math.sin(t * Math.PI) * 0.55;
    // Juvenile eel stays slender
    if (morph === 'eel') flare *= 0.85 + Math.sin(t * Math.PI) * 0.12;
    // Boss+ forms thicken mid-body like armored dragons
    if (morph === 'leviathan' || morph === 'sovereign') {
      flare *= 1 + Math.sin(Math.min(1, t * 1.4) * Math.PI) * 0.45;
    }
    if (morph === 'chaos') flare *= 1 + Math.sin(t * Math.PI) * 0.35 + (t > 0.55 ? 0.15 : 0);

    const w = (headW * (1 - t) + tailW * t) * flare;
    const x2 = hx - length * Math.min(1, t + 0.02);
    const y2 = hy + Math.sin(Math.min(1, t + 0.02) * Math.PI * waves) * amp * (0.35 + Math.min(1, t + 0.02) * 0.65);
    const dx = x2 - x;
    const dy = y2 - y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    centers.push([x, y]);
    tops.push([x + nx * w, y + ny * w]);
    bots.push([x - nx * w, y - ny * w]);
  }
  return { tops, bots, centers };
}

function bodyFill(ribbon, p, stroke, scaleOp = 0.62) {
  const edge = [...ribbon.tops, ...ribbon.bots.slice().reverse()];
  const d = smoothPath(edge, true);
  return `${I4}<path d="${d}" fill="url(#${p}-skin)" stroke="${stroke}" stroke-width="1.15" stroke-linejoin="round" filter="url(#${p}-wet)"/>
${I4}<path d="${d}" fill="url(#${p}-scales)" opacity="${scaleOp}"/>
${I4}<path d="${d}" fill="url(#${p}-micro)" opacity="0.55"/>
${I4}<path d="${smoothPath(ribbon.tops)}" fill="none" stroke="${stroke}" stroke-width="0.4" opacity="0.25"/>
${I4}<path d="${smoothPath(ribbon.tops.map(([x, y], i) => [x * 0.98 + ribbon.centers[i][0] * 0.02, y * 0.85 + ribbon.centers[i][1] * 0.15]))}" fill="none" stroke="#ffffff" stroke-width="0.45" opacity="0.14" stroke-linecap="round"/>`;
}

function bellyStripe(ribbon, p) {
  const n = ribbon.centers.length;
  const band = [];
  const upper = [];
  for (let i = Math.floor(n * 0.05); i < Math.floor(n * 0.92); i++) {
    const [x, y] = ribbon.centers[i];
    const [tx, ty] = ribbon.tops[i];
    const [bx, by] = ribbon.bots[i];
    band.push([x + (bx - x) * 0.55, y + (by - y) * 0.55 + (ty - y) * 0.08]);
    upper.push([x + (bx - x) * 0.15, y + (by - y) * 0.15]);
  }
  const d = smoothPath([...upper, ...band.slice().reverse()], true);
  return `${I4}<path d="${d}" fill="url(#${p}-belly)" opacity="0.55"/>`;
}

function armorPlates(ribbon, stroke, count) {
  if (count <= 0) return '';
  const parts = [];
  const n = ribbon.tops.length;
  for (let i = 0; i < count; i++) {
    const t0 = 0.12 + (0.7 * i) / count;
    const idx = Math.floor(t0 * (n - 1));
    const [x, y] = ribbon.tops[idx];
    const [cx, cy] = ribbon.centers[idx];
    const mx = (x + cx) / 2;
    const my = (y + cy) / 2;
    parts.push(`${I4}<path d="M ${(x - 2.2).toFixed(1)} ${(y + 0.5).toFixed(1)} Q ${mx.toFixed(1)} ${(my - 1.5).toFixed(1)} ${(x + 3.5).toFixed(1)} ${(y + 1.2).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.85" opacity="0.55" stroke-linecap="round"/>`);
  }
  return parts.join('\n');
}

/** Morph-aware head: soft round → eel → dragon → crowned chaos. */
function head(cfg, p, pal, stroke) {
  const { hx, hy, headW, morph } = cfg;
  const s = headW;
  let skull;
  let brow = '';
  let extras = '';

  if (morph === 'tadpole') {
    // Soft round baby head — big cheek, short snout
    skull = `M ${(hx - s * 1.15).toFixed(1)} ${(hy - s * 0.15).toFixed(1)}
      C ${(hx - s * 1.1).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} ${(hx + s * 0.55).toFixed(1)} ${(hy - s * 1.25).toFixed(1)} ${(hx + s * 1.05).toFixed(1)} ${(hy - s * 0.35).toFixed(1)}
      Q ${(hx + s * 1.2).toFixed(1)} ${hy.toFixed(1)} ${(hx + s * 1.0).toFixed(1)} ${(hy + s * 0.45).toFixed(1)}
      C ${(hx + s * 0.3).toFixed(1)} ${(hy + s * 1.05).toFixed(1)} ${(hx - s * 0.9).toFixed(1)} ${(hy + s * 0.95).toFixed(1)} ${(hx - s * 1.15).toFixed(1)} ${(hy - s * 0.15).toFixed(1)} Z`;
  } else if (morph === 'eel') {
    skull = `M ${(hx - s * 1.05).toFixed(1)} ${(hy - s * 0.75).toFixed(1)}
      C ${(hx - s * 0.15).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} ${(hx + s * 0.95).toFixed(1)} ${(hy - s * 0.55).toFixed(1)} ${(hx + s * 1.45).toFixed(1)} ${(hy - s * 0.05).toFixed(1)}
      Q ${(hx + s * 1.55).toFixed(1)} ${(hy + s * 0.15).toFixed(1)} ${(hx + s * 1.35).toFixed(1)} ${(hy + s * 0.4).toFixed(1)}
      L ${(hx - s * 0.7).toFixed(1)} ${(hy + s * 0.7).toFixed(1)}
      Q ${(hx - s * 1.2).toFixed(1)} ${(hy + s * 0.15).toFixed(1)} ${(hx - s * 1.05).toFixed(1)} ${(hy - s * 0.75).toFixed(1)} Z`;
    // Whiskers (new evo trait)
    extras = `${I4}<path d="M ${(hx + s * 0.9).toFixed(1)} ${(hy + s * 0.25).toFixed(1)} Q ${(hx + s * 1.5).toFixed(1)} ${(hy + s * 0.7).toFixed(1)} ${(hx + s * 1.9).toFixed(1)} ${(hy + s * 0.55).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.7" opacity="0.7" stroke-linecap="round"/>
${I4}<path d="M ${(hx + s * 0.85).toFixed(1)} ${(hy + s * 0.4).toFixed(1)} Q ${(hx + s * 1.35).toFixed(1)} ${(hy + s * 0.9).toFixed(1)} ${(hx + s * 1.7).toFixed(1)} ${(hy + s * 0.85).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.55" opacity="0.55" stroke-linecap="round"/>`;
  } else if (morph === 'serpent') {
    skull = `M ${(hx - s * 1.1).toFixed(1)} ${(hy - s * 0.95).toFixed(1)}
      C ${(hx - s * 0.2).toFixed(1)} ${(hy - s * 1.35).toFixed(1)} ${(hx + s * 0.85).toFixed(1)} ${(hy - s * 0.7).toFixed(1)} ${(hx + s * 1.35).toFixed(1)} ${(hy - s * 0.15).toFixed(1)}
      Q ${(hx + s * 1.45).toFixed(1)} ${hy.toFixed(1)} ${(hx + s * 1.3).toFixed(1)} ${(hy + s * 0.35).toFixed(1)}
      L ${(hx + s * 0.9).toFixed(1)} ${(hy + s * 0.55).toFixed(1)}
      L ${(hx - s * 0.85).toFixed(1)} ${(hy + s * 0.85).toFixed(1)}
      Q ${(hx - s * 1.25).toFixed(1)} ${(hy + s * 0.2).toFixed(1)} ${(hx - s * 1.1).toFixed(1)} ${(hy - s * 0.95).toFixed(1)} Z`;
    brow = `M ${(hx - s * 0.55).toFixed(1)} ${(hy - s * 0.85).toFixed(1)}
      Q ${(hx + s * 0.15).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} ${(hx + s * 0.7).toFixed(1)} ${(hy - s * 0.55).toFixed(1)}
      Q ${(hx + s * 0.2).toFixed(1)} ${(hy - s * 0.7).toFixed(1)} ${(hx - s * 0.4).toFixed(1)} ${(hy - s * 0.55).toFixed(1)} Z`;
  } else if (morph === 'leviathan') {
    // Armored dragon head — longer snout, heavy brow, single horn crest (big evo morph)
    skull = `M ${(hx - s * 1.25).toFixed(1)} ${(hy - s * 1.05).toFixed(1)}
      C ${(hx - s * 0.3).toFixed(1)} ${(hy - s * 1.55).toFixed(1)} ${(hx + s * 0.7).toFixed(1)} ${(hy - s * 0.95).toFixed(1)} ${(hx + s * 1.55).toFixed(1)} ${(hy - s * 0.25).toFixed(1)}
      Q ${(hx + s * 1.7).toFixed(1)} ${(hy + s * 0.05).toFixed(1)} ${(hx + s * 1.5).toFixed(1)} ${(hy + s * 0.4).toFixed(1)}
      L ${(hx + s * 0.85).toFixed(1)} ${(hy + s * 0.7).toFixed(1)}
      L ${(hx - s * 0.95).toFixed(1)} ${(hy + s * 1.0).toFixed(1)}
      Q ${(hx - s * 1.4).toFixed(1)} ${(hy + s * 0.15).toFixed(1)} ${(hx - s * 1.25).toFixed(1)} ${(hy - s * 1.05).toFixed(1)} Z`;
    brow = `M ${(hx - s * 0.7).toFixed(1)} ${(hy - s * 0.95).toFixed(1)}
      Q ${(hx + s * 0.1).toFixed(1)} ${(hy - s * 1.35).toFixed(1)} ${(hx + s * 0.85).toFixed(1)} ${(hy - s * 0.65).toFixed(1)}
      L ${(hx + s * 0.55).toFixed(1)} ${(hy - s * 0.4).toFixed(1)}
      Q ${(hx - s * 0.1).toFixed(1)} ${(hy - s * 0.75).toFixed(1)} ${(hx - s * 0.55).toFixed(1)} ${(hy - s * 0.55).toFixed(1)} Z`;
    // Single backward horn crest
    extras = `${I4}<path d="M ${(hx - s * 0.15).toFixed(1)} ${(hy - s * 1.05).toFixed(1)} L ${(hx - s * 0.55).toFixed(1)} ${(hy - s * 1.85).toFixed(1)} L ${(hx + s * 0.25).toFixed(1)} ${(hy - s * 1.0).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M ${(hx - s * 0.2).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} L ${(hx - s * 0.45).toFixed(1)} ${(hy - s * 1.65).toFixed(1)}" stroke="${pal.vein}" stroke-width="0.55" opacity="0.7" filter="url(#${p}-glowf)" class="tm-leviathan-vein"/>`;
  } else if (morph === 'sovereign') {
    // Dual-horn crowned head + cheek armor
    skull = `M ${(hx - s * 1.3).toFixed(1)} ${(hy - s * 1.1).toFixed(1)}
      C ${(hx - s * 0.25).toFixed(1)} ${(hy - s * 1.6).toFixed(1)} ${(hx + s * 0.75).toFixed(1)} ${(hy - s * 1.05).toFixed(1)} ${(hx + s * 1.6).toFixed(1)} ${(hy - s * 0.3).toFixed(1)}
      Q ${(hx + s * 1.75).toFixed(1)} ${hy.toFixed(1)} ${(hx + s * 1.55).toFixed(1)} ${(hy + s * 0.45).toFixed(1)}
      L ${(hx + s * 0.9).toFixed(1)} ${(hy + s * 0.75).toFixed(1)}
      L ${(hx - s * 1.0).toFixed(1)} ${(hy + s * 1.05).toFixed(1)}
      Q ${(hx - s * 1.45).toFixed(1)} ${(hy + s * 0.1).toFixed(1)} ${(hx - s * 1.3).toFixed(1)} ${(hy - s * 1.1).toFixed(1)} Z`;
    brow = `M ${(hx - s * 0.75).toFixed(1)} ${(hy - s * 1.0).toFixed(1)}
      Q ${(hx + s * 0.15).toFixed(1)} ${(hy - s * 1.4).toFixed(1)} ${(hx + s * 0.9).toFixed(1)} ${(hy - s * 0.7).toFixed(1)}
      L ${(hx + s * 0.6).toFixed(1)} ${(hy - s * 0.4).toFixed(1)}
      Q ${(hx).toFixed(1)} ${(hy - s * 0.8).toFixed(1)} ${(hx - s * 0.6).toFixed(1)} ${(hy - s * 0.55).toFixed(1)} Z`;
    // Tall dual crown horns + neck frill — readable at preview size
    extras = `${I4}<path d="M ${(hx - s * 0.4).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} L ${(hx - s * 1.05).toFixed(1)} ${(hy - s * 2.35).toFixed(1)} L ${(hx + s * 0.1).toFixed(1)} ${(hy - s * 1.1).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M ${(hx + s * 0.2).toFixed(1)} ${(hy - s * 1.0).toFixed(1)} L ${(hx - s * 0.15).toFixed(1)} ${(hy - s * 2.05).toFixed(1)} L ${(hx + s * 0.6).toFixed(1)} ${(hy - s * 0.9).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M ${(hx - s * 0.95).toFixed(1)} ${(hy + s * 0.2).toFixed(1)} Q ${(hx - s * 1.75).toFixed(1)} ${(hy + s * 0.1).toFixed(1)} ${(hx - s * 1.95).toFixed(1)} ${(hy - s * 0.55).toFixed(1)} L ${(hx - s * 1.2).toFixed(1)} ${(hy - s * 0.65).toFixed(1)} Q ${(hx - s * 1.25).toFixed(1)} ${(hy + s * 0.05).toFixed(1)} ${(hx - s * 0.8).toFixed(1)} ${(hy + s * 0.3).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.75" opacity="0.95"/>
${I4}<path d="M ${(hx - s * 0.7).toFixed(1)} ${(hy - s * 1.2).toFixed(1)} L ${(hx - s * 0.95).toFixed(1)} ${(hy - s * 2.1).toFixed(1)}" stroke="${pal.vein}" stroke-width="0.6" opacity="0.75" filter="url(#${p}-glowf)" class="tm-leviathan-vein"/>`;
  } else {
    // chaos — ancient scarred skull, triple horn ridge, jagged jawline
    skull = `M ${(hx - s * 1.35).toFixed(1)} ${(hy - s * 1.15).toFixed(1)}
      C ${(hx - s * 0.2).toFixed(1)} ${(hy - s * 1.7).toFixed(1)} ${(hx + s * 0.8).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} ${(hx + s * 1.7).toFixed(1)} ${(hy - s * 0.35).toFixed(1)}
      Q ${(hx + s * 1.9).toFixed(1)} ${(hy + s * 0.05).toFixed(1)} ${(hx + s * 1.6).toFixed(1)} ${(hy + s * 0.5).toFixed(1)}
      L ${(hx + s * 1.15).toFixed(1)} ${(hy + s * 0.55).toFixed(1)}
      L ${(hx + s * 0.95).toFixed(1)} ${(hy + s * 0.85).toFixed(1)}
      L ${(hx - s * 1.05).toFixed(1)} ${(hy + s * 1.15).toFixed(1)}
      Q ${(hx - s * 1.5).toFixed(1)} ${(hy + s * 0.2).toFixed(1)} ${(hx - s * 1.35).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} Z`;
    brow = `M ${(hx - s * 0.8).toFixed(1)} ${(hy - s * 1.05).toFixed(1)}
      Q ${(hx + s * 0.2).toFixed(1)} ${(hy - s * 1.5).toFixed(1)} ${(hx + s * 1.0).toFixed(1)} ${(hy - s * 0.75).toFixed(1)}
      L ${(hx + s * 0.65).toFixed(1)} ${(hy - s * 0.4).toFixed(1)}
      Q ${(hx).toFixed(1)} ${(hy - s * 0.85).toFixed(1)} ${(hx - s * 0.65).toFixed(1)} ${(hy - s * 0.55).toFixed(1)} Z`;
    extras = `${I4}<path d="M ${(hx - s * 0.55).toFixed(1)} ${(hy - s * 1.2).toFixed(1)} L ${(hx - s * 1.2).toFixed(1)} ${(hy - s * 2.55).toFixed(1)} L ${(hx - s * 0.05).toFixed(1)} ${(hy - s * 1.15).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="M ${(hx).toFixed(1)} ${(hy - s * 1.1).toFixed(1)} L ${(hx - s * 0.35).toFixed(1)} ${(hy - s * 2.25).toFixed(1)} L ${(hx + s * 0.45).toFixed(1)} ${(hy - s * 1.0).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.85"/>
${I4}<path d="M ${(hx + s * 0.4).toFixed(1)} ${(hy - s * 0.95).toFixed(1)} L ${(hx + s * 0.1).toFixed(1)} ${(hy - s * 1.85).toFixed(1)} L ${(hx + s * 0.75).toFixed(1)} ${(hy - s * 0.85).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.8"/>
${I4}<path d="M ${(hx - s * 0.4).toFixed(1)} ${(hy - s * 0.2).toFixed(1)} L ${(hx + s * 0.3).toFixed(1)} ${(hy + s * 0.15).toFixed(1)}" stroke="${pal.abyss}" stroke-width="0.9" opacity="0.7" stroke-linecap="round"/>
${I4}<path d="M ${(hx - s * 1.0).toFixed(1)} ${(hy + s * 0.25).toFixed(1)} Q ${(hx - s * 1.9).toFixed(1)} ${(hy + s * 0.05).toFixed(1)} ${(hx - s * 2.1).toFixed(1)} ${(hy - s * 0.65).toFixed(1)} L ${(hx - s * 1.3).toFixed(1)} ${(hy - s * 0.7).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.75" opacity="0.95"/>
${I4}<path d="M ${(hx - s * 0.85).toFixed(1)} ${(hy - s * 1.3).toFixed(1)} L ${(hx - s * 1.1).toFixed(1)} ${(hy - s * 2.3).toFixed(1)}" stroke="${pal.vein}" stroke-width="0.7" opacity="0.85" filter="url(#${p}-glowf)" class="tm-leviathan-vein"/>`;
  }

  const snoutMul = morph === 'tadpole' ? 1.0 : morph === 'eel' ? 1.45 : morph === 'serpent' ? 1.3 : 1.55;
  const eyeMulX = morph === 'tadpole' ? 0.05 : 0.15;
  const eyeMulY = morph === 'tadpole' ? -0.1 : -0.25;

  const nostril = morph === 'tadpole'
    ? `${I4}<circle cx="${(hx + s * 0.75).toFixed(1)}" cy="${(hy + s * 0.05).toFixed(1)}" r="${(s * 0.08).toFixed(1)}" fill="${pal.abyss}" opacity="0.7"/>`
    : `${I4}<ellipse cx="${(hx + s * 1.05).toFixed(1)}" cy="${(hy - s * 0.05).toFixed(1)}" rx="${(s * 0.12).toFixed(1)}" ry="${(s * 0.08).toFixed(1)}" fill="${pal.abyss}" opacity="0.85"/>`;

  const gloss = `M ${(hx - s * 0.6).toFixed(1)} ${(hy - s * 0.7).toFixed(1)} Q ${(hx + s * 0.3).toFixed(1)} ${(hy - s * 0.95).toFixed(1)} ${(hx + s * 0.9).toFixed(1)} ${(hy - s * 0.35).toFixed(1)}`;
  const scaleOp = morph === 'tadpole' ? 0.15 : morph === 'eel' ? 0.3 : 0.4;

  return {
    svg: `${I4}<path d="${skull}" fill="url(#${p}-skin-rad)" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>
${I4}<path d="${skull}" fill="url(#${p}-scales)" opacity="${scaleOp}"/>
${brow ? `${I4}<path d="${brow}" fill="${pal.deep}" opacity="0.55"/>` : ''}
${I4}<path d="${gloss}" fill="none" stroke="${pal.rim}" stroke-width="0.7" opacity="0.45" stroke-linecap="round"/>
${nostril}
${extras}`,
    eyeX: hx + s * eyeMulX,
    eyeY: hy + s * eyeMulY,
    jawHingeX: hx - s * (morph === 'tadpole' ? 0.35 : 0.55),
    jawHingeY: hy + s * (morph === 'tadpole' ? 0.45 : 0.35),
    snoutX: hx + s * snoutMul,
    snoutY: hy + s * (morph === 'tadpole' ? 0.35 : 0.2),
    upperJawY: hy + s * (morph === 'tadpole' ? 0.55 : 0.5),
    s,
    morph,
  };
}

function jawAndTeeth(h, p, pal, stroke, fangCount) {
  const { jawHingeX, jawHingeY, snoutX, snoutY, upperJawY, s, morph } = h;
  if (morph === 'tadpole' || fangCount <= 0) {
    // Soft closed smile — no teeth yet
    const cute = `M ${(jawHingeX).toFixed(1)} ${(jawHingeY + s * 0.1).toFixed(1)} Q ${((jawHingeX + snoutX) / 2).toFixed(1)} ${(upperJawY + s * 0.35).toFixed(1)} ${(snoutX - s * 0.15).toFixed(1)} ${(snoutY + s * 0.15).toFixed(1)}`;
    const shut = `M ${jawHingeX.toFixed(1)} ${jawHingeY.toFixed(1)} Q ${((jawHingeX + snoutX) / 2).toFixed(1)} ${(upperJawY + 0.8).toFixed(1)} ${(snoutX - s * 0.2).toFixed(1)} ${(upperJawY + 0.3).toFixed(1)}`;
    return `${I3}<g class="tm-mascot-mouth-happy">
${I4}<path d="${cute}" fill="none" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>
${I3}</g>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="${shut}" fill="none" stroke="${stroke}" stroke-width="1.1" stroke-linecap="round"/>`;
  }

  const openMul = morph === 'leviathan' || morph === 'sovereign' || morph === 'chaos' ? 0.95 : 0.75;
  const openChinY = upperJawY + s * openMul;
  const openTipX = snoutX - s * 0.15;
  const openPath = `M ${jawHingeX.toFixed(1)} ${jawHingeY.toFixed(1)} Q ${((jawHingeX + openTipX) / 2).toFixed(1)} ${(openChinY + 1).toFixed(1)} ${openTipX.toFixed(1)} ${openChinY.toFixed(1)} L ${snoutX.toFixed(1)} ${snoutY.toFixed(1)} L ${(snoutX - s * 0.35).toFixed(1)} ${upperJawY.toFixed(1)} Z`;
  const shutPath = `M ${jawHingeX.toFixed(1)} ${jawHingeY.toFixed(1)} Q ${((jawHingeX + snoutX) / 2).toFixed(1)} ${(upperJawY + 1).toFixed(1)} ${(snoutX - s * 0.2).toFixed(1)} ${(upperJawY + 0.5).toFixed(1)} L ${(snoutX - s * 0.35).toFixed(1)} ${upperJawY.toFixed(1)} Z`;
  const cavity = `M ${(jawHingeX + s * 0.15).toFixed(1)} ${(jawHingeY + s * 0.1).toFixed(1)} L ${(snoutX - s * 0.4).toFixed(1)} ${(upperJawY + s * 0.05).toFixed(1)} L ${(openTipX - s * 0.1).toFixed(1)} ${(openChinY - s * 0.15).toFixed(1)} Z`;

  const teeth = [];
  for (let i = 0; i < fangCount; i++) {
    const t = fangCount <= 1 ? 0.5 : 0.1 + (i / (fangCount - 1)) * 0.75;
    const ux = jawHingeX + (snoutX - jawHingeX) * t;
    const uy = jawHingeY + (snoutY - jawHingeY) * t * 0.35 + s * 0.15;
    const len = s * (0.28 + (i % 3 === 1 ? 0.1 : 0) + (morph === 'chaos' ? 0.08 : 0));
    const w = s * (morph === 'chaos' ? 0.07 : 0.055);
    teeth.push(`${I4}<path d="M ${(ux - w).toFixed(1)} ${uy.toFixed(1)} L ${ux.toFixed(1)} ${(uy + len).toFixed(1)} L ${(ux + w).toFixed(1)} ${uy.toFixed(1)} Z" fill="${pal.fang}"/>`);
    const lx = jawHingeX + (openTipX - jawHingeX) * (0.15 + t * 0.7);
    const ly = jawHingeY + (openChinY - jawHingeY) * (0.55 + t * 0.25);
    teeth.push(`${I4}<path d="M ${(lx - w * 0.85).toFixed(1)} ${ly.toFixed(1)} L ${lx.toFixed(1)} ${(ly - len * 0.8).toFixed(1)} L ${(lx + w * 0.85).toFixed(1)} ${ly.toFixed(1)} Z" fill="${pal.fang}" opacity="0.9"/>`);
  }

  return `${I3}<g class="tm-mascot-mouth-happy">
${I4}<path d="${openPath}" fill="url(#${p}-skin)" stroke="${stroke}" stroke-width="1"/>
${I4}<path d="${cavity}" fill="${pal.abyss}" opacity="0.92"/>
${teeth.join('\n')}
${I3}</g>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="${shutPath}" fill="url(#${p}-skin)" stroke="${stroke}" stroke-width="1"/>`;
}

function stormEye(h, p, pal, stroke, eyeR, boss) {
  const { eyeX, eyeY, morph } = h;
  const glow = boss ? 2.6 : morph === 'tadpole' ? 1.3 : 1.7;
  const pupilRx = morph === 'tadpole' ? eyeR * 0.4 : eyeR * 0.26;
  const pupilRy = morph === 'tadpole' ? eyeR * 0.4 : eyeR * 0.58;
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${I4}<ellipse cx="${eyeX.toFixed(1)}" cy="${eyeY.toFixed(1)}" rx="${(eyeR * glow * 1.3).toFixed(1)}" ry="${(eyeR * glow).toFixed(1)}" fill="${pal.eye}" opacity="${boss ? 0.3 : 0.14}" filter="url(#${p}-glowf)"/>
${I4}<ellipse cx="${eyeX.toFixed(1)}" cy="${eyeY.toFixed(1)}" rx="${(eyeR * 1.4).toFixed(1)}" ry="${(eyeR * 1.15).toFixed(1)}" fill="${pal.abyss}" opacity="0.8"/>
${I4}<ellipse class="tm-leviathan-iris" cx="${eyeX.toFixed(1)}" cy="${eyeY.toFixed(1)}" rx="${eyeR.toFixed(1)}" ry="${(eyeR * 0.88).toFixed(1)}" fill="url(#${p}-eye)" stroke="${stroke}" stroke-width="0.65"/>
${I4}<ellipse class="tm-leviathan-pupil" cx="${(eyeX + eyeR * 0.08).toFixed(1)}" cy="${eyeY.toFixed(1)}" rx="${pupilRx.toFixed(1)}" ry="${pupilRy.toFixed(1)}" fill="#000"/>
${I4}<ellipse cx="${(eyeX - eyeR * 0.32).toFixed(1)}" cy="${(eyeY - eyeR * 0.28).toFixed(1)}" rx="${(eyeR * 0.22).toFixed(1)}" ry="${(eyeR * 0.14).toFixed(1)}" fill="#fff" opacity="0.75"/>
${boss ? `${I4}<circle cx="${(eyeX + eyeR * 0.2).toFixed(1)}" cy="${(eyeY + eyeR * 0.25).toFixed(1)}" r="${Math.max(0.3, eyeR * 0.1).toFixed(1)}" fill="${pal.vein}" opacity="0.45"/>` : ''}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${(eyeX - eyeR).toFixed(1)} ${eyeY.toFixed(1)} Q ${eyeX.toFixed(1)} ${(eyeY - eyeR * 0.55).toFixed(1)} ${(eyeX + eyeR).toFixed(1)} ${eyeY.toFixed(1)}" stroke="${stroke}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/** Dorsal features morph: none → ridge → spines → sail → chaos mane. */
function dorsalFeatures(ribbon, p, pal, stroke, cfg) {
  const { spines, morph, torn } = cfg;
  if (spines <= 0 && morph === 'tadpole') {
    // Soft baby bump ridge
    const idx = Math.floor(ribbon.tops.length * 0.35);
    const [x, y] = ribbon.tops[idx];
    return `${I4}<ellipse cx="${x.toFixed(1)}" cy="${(y - 1.2).toFixed(1)}" rx="3.2" ry="1.6" fill="url(#${p}-fin)" opacity="0.55"/>`;
  }
  if (morph === 'eel') {
    // Tiny continuous dorsal ridge (first morph trait)
    const n = ribbon.tops.length;
    const pts = [];
    for (let i = Math.floor(n * 0.15); i < Math.floor(n * 0.7); i += 2) {
      pts.push([ribbon.tops[i][0], ribbon.tops[i][1] - 1.8 - (i % 3) * 0.4]);
    }
    const base = ribbon.tops.slice(Math.floor(n * 0.15), Math.floor(n * 0.7));
    const d = smoothPath([...pts, ...base.slice().reverse()], true);
    return `${I4}<path d="${d}" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.55" opacity="0.85"/>`;
  }

  const parts = [];
  const n = ribbon.tops.length;

  // Sail membrane behind spines for sovereign/chaos
  if (morph === 'sovereign' || morph === 'chaos') {
    const sailPts = [];
    const basePts = [];
    for (let i = 0; i < spines; i++) {
      const t = 0.14 + (0.55 * i) / Math.max(1, spines - 1);
      const idx = Math.min(n - 2, Math.floor(t * (n - 1)));
      const [x, y] = ribbon.tops[idx];
      const h = (morph === 'chaos' ? 7 : 5.5) + Math.sin(i * 1.4) * 2;
      sailPts.push([x - h * 0.1, y - h * 0.85]);
      basePts.push([x, y + 0.3]);
    }
    if (sailPts.length > 1) {
      parts.push(`${I4}<path d="${smoothPath([...sailPts, ...basePts.slice().reverse()], true)}" fill="url(#${p}-fin)" opacity="0.35" stroke="${stroke}" stroke-width="0.4"/>`);
    }
  }

  for (let i = 0; i < spines; i++) {
    const t = 0.14 + (0.62 * i) / Math.max(1, spines - 1);
    const idx = Math.min(n - 2, Math.floor(t * (n - 1)));
    const [x, y] = ribbon.tops[idx];
    const hBase = morph === 'chaos' ? 6.5 : morph === 'sovereign' ? 5.8 : morph === 'leviathan' ? 5.2 : 4.2;
    const h = hBase + Math.sin(i * 1.7) * 1.8 + (spines - i) * 0.3;
    const tipX = x - h * 0.15;
    const tipY = y - h;
    const notch = torn && i % 3 === 0
      ? ` L ${(tipX + 1.6).toFixed(1)} ${(tipY + h * 0.35).toFixed(1)} L ${(tipX + 0.4).toFixed(1)} ${(tipY + h * 0.28).toFixed(1)}`
      : '';
    parts.push(`${I4}<path d="M ${(x - 1.6).toFixed(1)} ${(y + 0.4).toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)}${notch} L ${(x + 1.8).toFixed(1)} ${(y + 0.6).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.7"/>`);
    if (i % 2 === 0 && (morph === 'leviathan' || morph === 'sovereign' || morph === 'chaos' || morph === 'serpent')) {
      parts.push(`${I4}<path d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${tipX.toFixed(1)} ${(tipY + 1).toFixed(1)}" stroke="${pal.vein}" stroke-width="0.55" opacity="0.65" filter="url(#${p}-glowf)" class="tm-leviathan-vein"/>`);
    }
  }

  // Chaos mane strands
  if (morph === 'chaos') {
    for (let i = 0; i < 4; i++) {
      const t = 0.2 + i * 0.12;
      const idx = Math.min(n - 1, Math.floor(t * (n - 1)));
      const [x, y] = ribbon.tops[idx];
      parts.push(`${I4}<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${(x - 4).toFixed(1)} ${(y - 8 - i).toFixed(1)} ${(x - 9).toFixed(1)} ${(y - 5 - i * 1.5).toFixed(1)}" fill="none" stroke="${pal.vein}" stroke-width="0.7" opacity="0.55" filter="url(#${p}-glowf)" class="tm-leviathan-vein" stroke-linecap="round"/>`);
    }
  }
  return parts.join('\n');
}

/** Pectoral fin morphs: stub → fin → wing-fin → storm sails. */
function pectoral(ribbon, p, stroke, size, morph) {
  const idx = Math.floor(ribbon.centers.length * (morph === 'tadpole' ? 0.2 : 0.12));
  const [x, y] = ribbon.bots[idx];

  if (morph === 'tadpole') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<ellipse cx="${(x - 1).toFixed(1)}" cy="${(y + 2.5).toFixed(1)}" rx="${(size * 0.55).toFixed(1)}" ry="${(size * 0.35).toFixed(1)}" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.7" opacity="0.9"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<ellipse cx="${(x + 4).toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" rx="${(size * 0.4).toFixed(1)}" ry="${(size * 0.25).toFixed(1)}" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.6" opacity="0.75"/>
${I3}</g>`;
  }

  if (morph === 'eel') {
    return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${(x - size * 0.4).toFixed(1)} ${(y + size * 0.9).toFixed(1)} ${(x - size * 0.9).toFixed(1)} ${(y + size * 0.55).toFixed(1)} Q ${(x - size * 0.3).toFixed(1)} ${(y + size * 0.35).toFixed(1)} ${(x + 1).toFixed(1)} ${(y + 0.3).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.85"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right" opacity="0.001"><circle cx="${(x + 3).toFixed(1)}" cy="${y.toFixed(1)}" r="0.4" fill="${stroke}"/></g>`;
  }

  // serpent / leviathan / sovereign / chaos — larger wing-fins
  const span = morph === 'chaos' ? 1.35 : morph === 'sovereign' ? 1.25 : morph === 'leviathan' ? 1.15 : 1;
  const sz = size * span;
  return `${I3}<g class="tm-animate-wing-left">
${I4}<path d="M ${x.toFixed(1)} ${y.toFixed(1)} C ${(x - sz * 0.15).toFixed(1)} ${(y + sz * 0.7).toFixed(1)} ${(x - sz * 0.7).toFixed(1)} ${(y + sz * 1.1).toFixed(1)} ${(x - sz * 1.1).toFixed(1)} ${(y + sz * 0.85).toFixed(1)} C ${(x - sz * 0.45).toFixed(1)} ${(y + sz * 0.55).toFixed(1)} ${(x - sz * 0.1).toFixed(1)} ${(y + sz * 0.25).toFixed(1)} ${(x + 1).toFixed(1)} ${(y + 0.5).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.95" opacity="0.95"/>
${I4}<path d="M ${(x - 1).toFixed(1)} ${(y + 1).toFixed(1)} Q ${(x - sz * 0.5).toFixed(1)} ${(y + sz * 0.55).toFixed(1)} ${(x - sz * 0.85).toFixed(1)} ${(y + sz * 0.7).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.45" opacity="0.4"/>
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${I4}<path d="M ${(x + 5).toFixed(1)} ${(y - 1).toFixed(1)} C ${(x + 3).toFixed(1)} ${(y + sz * 0.55).toFixed(1)} ${(x - sz * 0.25).toFixed(1)} ${(y + sz * 0.85).toFixed(1)} ${(x - sz * 0.55).toFixed(1)} ${(y + sz * 0.7).toFixed(1)} C ${(x + 1).toFixed(1)} ${(y + sz * 0.35).toFixed(1)} ${(x + 4).toFixed(1)} ${(y + sz * 0.15).toFixed(1)} ${(x + 6).toFixed(1)} ${y.toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.85" opacity="0.85"/>
${I3}</g>`;
}

/**
 * Tail morphs:
 *   tadpole — round paddle
 *   eel — leaf / lance fin
 *   serpent/leviathan — crescent
 *   sovereign — broad crescent + trailing tip
 *   chaos — forked lightning fluke
 */
function fluke(ribbon, p, stroke, size, morph, pal) {
  const last = ribbon.centers.length - 1;
  const [x, y] = ribbon.centers[last];

  if (morph === 'tadpole') {
    return `${I3}<g class="tm-animate-tail">
${I4}<ellipse cx="${(x - size * 0.35).toFixed(1)}" cy="${y.toFixed(1)}" rx="${(size * 0.7).toFixed(1)}" ry="${(size * 0.55).toFixed(1)}" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.95"/>
${I4}<ellipse cx="${(x - size * 0.45).toFixed(1)}" cy="${(y - 0.5).toFixed(1)}" rx="${(size * 0.25).toFixed(1)}" ry="${(size * 0.18).toFixed(1)}" fill="${stroke}" opacity="0.15"/>
${I3}</g>`;
  }

  if (morph === 'eel') {
    return `${I3}<g class="tm-animate-tail">
${I4}<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${(x - size * 0.4).toFixed(1)} ${(y - size * 0.85).toFixed(1)} ${(x - size * 1.15).toFixed(1)} ${(y - size * 0.15).toFixed(1)} Q ${(x - size * 0.55).toFixed(1)} ${y.toFixed(1)} ${(x - size * 1.1).toFixed(1)} ${(y + size * 0.2).toFixed(1)} Q ${(x - size * 0.35).toFixed(1)} ${(y + size * 0.7).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="0.95"/>
${I3}</g>`;
  }

  if (morph === 'chaos') {
    // Clearly forked final-form fluke (two separate blades)
    return `${I3}<g class="tm-animate-tail">
${I4}<path d="M ${x.toFixed(1)} ${(y - 1).toFixed(1)} L ${(x - size * 0.55).toFixed(1)} ${(y - size * 1.35).toFixed(1)} L ${(x - size * 1.45).toFixed(1)} ${(y - size * 0.75).toFixed(1)} L ${(x - size * 0.45).toFixed(1)} ${(y - 0.3).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.05" stroke-linejoin="round"/>
${I4}<path d="M ${x.toFixed(1)} ${(y + 1).toFixed(1)} L ${(x - size * 0.55).toFixed(1)} ${(y + size * 1.35).toFixed(1)} L ${(x - size * 1.45).toFixed(1)} ${(y + size * 0.75).toFixed(1)} L ${(x - size * 0.45).toFixed(1)} ${(y + 0.3).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.05" stroke-linejoin="round"/>
${I4}<path d="M ${(x - size * 0.3).toFixed(1)} ${(y - size * 0.7).toFixed(1)} L ${(x - size * 1.2).toFixed(1)} ${y.toFixed(1)} L ${(x - size * 0.3).toFixed(1)} ${(y + size * 0.7).toFixed(1)}" fill="none" stroke="${pal.vein}" stroke-width="0.85" opacity="0.8" filter="url(#${p}-glowf)" class="tm-leviathan-vein"/>
${I3}</g>`;
  }

  // Crescent (serpent / leviathan / sovereign)
  const tip = x - size * (morph === 'sovereign' ? 1.2 : 1.05);
  const spread = morph === 'sovereign' ? 1.15 : 0.95;
  return `${I3}<g class="tm-animate-tail">
${I4}<path d="M ${x.toFixed(1)} ${(y - size * 0.15).toFixed(1)} L ${(x - size * 0.25).toFixed(1)} ${(y - size * spread).toFixed(1)} L ${tip.toFixed(1)} ${y.toFixed(1)} L ${(x - size * 0.25).toFixed(1)} ${(y + size * spread).toFixed(1)} L ${x.toFixed(1)} ${(y + size * 0.15).toFixed(1)} Q ${(x - size * 0.35).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y - size * 0.15).toFixed(1)} Z" fill="url(#${p}-fin)" stroke="${stroke}" stroke-width="1.05" stroke-linejoin="round"/>
${I4}<path d="M ${(x - size * 0.2).toFixed(1)} ${(y - size * 0.55).toFixed(1)} L ${(tip + size * 0.25).toFixed(1)} ${y.toFixed(1)} L ${(x - size * 0.2).toFixed(1)} ${(y + size * 0.55).toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="0.45" opacity="0.35"/>
${I3}</g>`;
}

function limbAnchors(ribbon, stroke) {
  const i = Math.floor(ribbon.centers.length * 0.35);
  const j = Math.floor(ribbon.centers.length * 0.55);
  const [x1, y1] = ribbon.bots[i];
  const [x2, y2] = ribbon.bots[j];
  return `${I3}<g class="tm-animate-arm-left" opacity="0.001"><circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="0.5" fill="${stroke}"/></g>
${I3}<g class="tm-animate-arm-right" opacity="0.001"><circle cx="${(x1 + 3).toFixed(1)}" cy="${y1.toFixed(1)}" r="0.5" fill="${stroke}"/></g>
${I3}<g class="tm-animate-leg-left" opacity="0.001"><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="0.5" fill="${stroke}"/></g>
${I3}<g class="tm-animate-leg-right" opacity="0.001"><circle cx="${(x2 + 3).toFixed(1)}" cy="${y2.toFixed(1)}" r="0.5" fill="${stroke}"/></g>`;
}

function stormVeins(ribbon, pal, glowId, count) {
  if (count <= 0) return '';
  const parts = [];
  const n = ribbon.centers.length;
  for (let i = 0; i < count; i++) {
    const pts = [];
    for (let k = 0; k < 5; k++) {
      const t = 0.08 + k * 0.16 + i * 0.03;
      const idx = Math.min(n - 1, Math.floor(t * (n - 1)));
      const [cx, cy] = ribbon.centers[idx];
      const [tx, ty] = ribbon.tops[idx];
      const mix = 0.25 + (k % 3) * 0.12;
      pts.push([cx + (tx - cx) * mix + (k % 2 ? 1.2 : -1.2), cy + (ty - cy) * mix + (i - 1) * 1.5]);
    }
    parts.push(`${I4}<path d="${smoothPath(pts)}" fill="none" stroke="${pal.vein}" stroke-width="${1.15 - i * 0.2}" opacity="${0.7 - i * 0.12}" filter="url(#${glowId})" class="tm-leviathan-vein" stroke-linecap="round"/>`);
  }
  return parts.join('\n');
}

function microDetails(ribbon, pal, stroke, scars) {
  const parts = [];
  const n = ribbon.centers.length;
  for (let i = 0; i < scars; i++) {
    const idx = Math.floor((0.25 + i * 0.12) * (n - 1));
    const [x, y] = ribbon.centers[idx];
    parts.push(`${I4}<circle cx="${(x + (i % 2 ? 1.5 : -1)).toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" r="${0.7 + (i % 3) * 0.25}" fill="${stroke}" opacity="0.45"/>`);
  }
  return parts.join('\n');
}

function shadow(rx, op = 0.32) {
  return `${I3}<ellipse cx="48" cy="93" rx="${rx}" ry="4.2" fill="#010408" opacity="${op}"/>`;
}

function aura(p, show, r) {
  if (!show) return '';
  return `${I3}<ellipse cx="52" cy="50" rx="${r}" ry="${(r * 0.62).toFixed(1)}" fill="url(#${p}-glow)"/>`;
}

function bolts(pal, glowId, count) {
  if (count <= 0) return '';
  const pts = [
    [8, 10, 14, 26, 10, 34],
    [92, 8, 86, 24, 90, 32],
    [14, 42, 20, 52, 16, 62],
    [86, 40, 80, 50, 84, 60],
    [30, 6, 34, 16, 32, 22],
    [70, 5, 66, 15, 68, 22],
  ].slice(0, count);
  return pts.map(([a, b, c, d, e, f], i) =>
    `${I3}<path d="M ${a} ${b} L ${c} ${d} L ${e} ${f}" stroke="${pal.vein}" stroke-width="${i < 2 ? 1.2 : 0.85}" fill="none" stroke-linecap="round" opacity="0.7" filter="url(#${glowId})"/>`
  ).join('\n');
}

/**
 * Distinct Pokémon-style morph configs.
 * Each stage changes form language — not just stats.
 */
const STAGE_CFG = {
  // Soft chubby tadpole-eel — round head, paddle, no armor
  baby: {
    morph: 'tadpole',
    hx: 62, hy: 52, segs: 16, length: 34, amp: 4, waves: 1.1, headW: 9.5, tailW: 4.5,
    eyeR: 3.2, fangs: 0, plates: 0, spines: 0, veins: 0, bolts: 0, scars: 0, spray: 2,
    pec: 6, fluke: 8, boss: false, shadowRx: 22, auraR: 0, scaleOp: 0.18,
  },
  // Slim juvenile eel — whiskers, first fangs, leaf tail, ridge
  evo1: {
    morph: 'eel',
    hx: 72, hy: 50, segs: 22, length: 50, amp: 7, waves: 1.45, headW: 7.5, tailW: 2.0,
    eyeR: 2.4, fangs: 2, plates: 0, spines: 1, veins: 0, bolts: 1, scars: 0, spray: 3,
    pec: 8, fluke: 10, boss: false, shadowRx: 28, auraR: 0, scaleOp: 0.35,
  },
  // True sea-serpent — armor, crescent fluke, dorsal spines
  evo2: {
    morph: 'serpent',
    hx: 78, hy: 46, segs: 28, length: 62, amp: 10, waves: 1.8, headW: 10, tailW: 2.2,
    eyeR: 2.9, fangs: 4, plates: 6, spines: 5, veins: 1, bolts: 2, scars: 1, spray: 4,
    pec: 11, fluke: 13, boss: false, shadowRx: 34, auraR: 34, scaleOp: 0.55,
  },
  // BIG EVO — armored dragon-head + horn crest + thick mid-body
  evo3: {
    morph: 'leviathan',
    hx: 82, hy: 44, segs: 32, length: 68, amp: 11, waves: 1.9, headW: 12.5, tailW: 2.3,
    eyeR: 3.5, fangs: 7, plates: 9, spines: 8, veins: 2, bolts: 4, scars: 2, spray: 6,
    pec: 14, fluke: 16, boss: true, shadowRx: 38, auraR: 42, scaleOp: 0.65,
  },
  // Sovereign morph — dual horns, frill, sail membrane
  evo4: {
    morph: 'sovereign',
    hx: 84, hy: 42, segs: 34, length: 72, amp: 12, waves: 2.0, headW: 13.5, tailW: 2.4,
    eyeR: 3.7, fangs: 8, plates: 10, spines: 9, veins: 3, bolts: 5, scars: 4, spray: 7,
    pec: 15, fluke: 18, boss: true, shadowRx: 40, auraR: 44, scaleOp: 0.7,
  },
  // Final legendary — chaos mane, triple horns, forked lightning fluke, torn
  evo5: {
    morph: 'chaos',
    hx: 86, hy: 40, segs: 36, length: 76, amp: 14, waves: 2.2, headW: 14.5, tailW: 2.5,
    eyeR: 3.9, fangs: 9, plates: 11, spines: 11, veins: 4, bolts: 6, scars: 6, spray: 8,
    pec: 16, fluke: 19, boss: true, shadowRx: 42, auraR: 48, torn: true, scaleOp: 0.75,
  },
};

function buildStage(stage, p, pal, stroke, cfg) {
  const ribbon = serpentRibbon(cfg);
  const h = head(cfg, p, pal, stroke);
  const sprayParts = [];
  const sprayPts = [[12, 22], [88, 18], [18, 40], [82, 36], [25, 14], [75, 12], [8, 55], [92, 50]];
  for (let i = 0; i < cfg.spray; i++) {
    const [x, y] = sprayPts[i % sprayPts.length];
    sprayParts.push(`${I3}<circle cx="${x}" cy="${y}" r="${0.55 + (i % 3) * 0.25}" fill="${pal.spray}" opacity="${0.28 + (i % 4) * 0.07}" filter="url(#${p}-soft)"/>`);
  }

  return `${shadow(cfg.shadowRx, cfg.boss ? 0.4 : 0.3)}
${aura(p, !!cfg.auraR, cfg.auraR)}
${bolts(pal, `${p}-glowf`, cfg.bolts)}
${sprayParts.join('\n')}
${fluke(ribbon, p, stroke, cfg.fluke, cfg.morph, pal)}
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${bodyFill(ribbon, p, stroke, cfg.scaleOp)}
${bellyStripe(ribbon, p)}
${armorPlates(ribbon, stroke, cfg.plates)}
${stormVeins(ribbon, pal, `${p}-glowf`, cfg.veins)}
${dorsalFeatures(ribbon, p, pal, stroke, cfg)}
${h.svg}
${jawAndTeeth(h, p, pal, stroke, cfg.fangs)}
${stormEye(h, p, pal, stroke, cfg.eyeR, cfg.boss)}
${microDetails(ribbon, pal, stroke, cfg.scars)}
${I3}</g>
${pectoral(ribbon, p, stroke, cfg.pec, cfg.morph)}
${limbAnchors(ribbon, stroke)}`;
}

function leviathanStage(stage) {
  const p = `leviathan-${STAGE_SLUG[stage]}`;
  const pal = STAGE_PALETTES[stage];
  const stroke = pal.deep;
  const defs = makeDefs(p, pal);
  const body = buildStage(stage, p, pal, stroke, STAGE_CFG[stage]);
  return wrapStage(stage, defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · Evolution Morph Line v12 · Pokémon-style stage morphs) -->
${STAGES.map(leviathanStage).join('\n')}`;
