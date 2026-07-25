/**
 * Storm Leviathan — v8 "Storm-Breaker" redesign
 *
 * Reference: a colossal sea monster breaching stormy waves, back arched high
 * above the water, lightning striking the sky around it (not a coiled snake,
 * not an abstract void). This rebuild composes each stage as a creature
 * emerging from the sea: a whale/shark-like head with an open, toothed jaw
 * breaking the surface, a smooth dorsal hump arching up behind it into a
 * curved fin, and a dark wave-line "cutting" the lower body off to sell the
 * half-submerged silhouette. Menace comes from scale, darkness and teeth —
 * not big cartoon eyes — and jagged lightning bolts crack the sky around it.
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
  baby: 'Ripple Hatchling',
  evo1: 'Squall Breaker',
  evo2: 'Gale Breaker',
  evo3: 'Storm Leviathan — BOSS',
  evo4: 'Tempest Colossus',
  evo5: 'Primordial Storm-Breaker',
};

const INK = '#010306';

const STAGE_PALETTES = {
  baby: { body: '#25445c', deep: '#0f1f2c', rim: '#82cbe8', eye: '#a9e4ff', bolt: '#cfe9ff', water: '#0a1420', foam: '#bfe6f5' },
  evo1: { body: '#213e54', deep: '#0d1c28', rim: '#79c3e3', eye: '#a4e0fb', bolt: '#d3ecff', water: '#08121c', foam: '#b9e2f2' },
  evo2: { body: '#1c3448', deep: '#0a1720', rim: '#6fb9dc', eye: '#9edcf9', bolt: '#dcf0ff', water: '#071019', foam: '#aedcee' },
  evo3: { body: '#152736', deep: '#070f16', rim: '#69b6dd', eye: '#a8e7fc', bolt: '#eaf6ff', water: '#050b11', foam: '#a3d6ec' },
  evo4: { body: '#101d28', deep: '#04090d', rim: '#5fa6cb', eye: '#a0e2fa', bolt: '#e3f2ff', water: '#04080c', foam: '#98cde6' },
  evo5: { body: '#0a1319', deep: '#020608', rim: '#9fc4d6', eye: '#d8f3ff', bolt: '#ffffff', water: '#03060a', foam: '#8fc0d9' },
};

function grad(id, stops, type = 'linear', attrs) {
  const tag = type === 'radial' ? 'radialGradient' : 'linearGradient';
  const defAttrs = attrs
    || (type === 'radial' ? 'cx="50%" cy="30%" r="75%"' : 'x1="20%" y1="0%" x2="80%" y2="100%"');
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
    grad(`${p}-body`, [['0%', pal.rim], ['42%', pal.body], ['100%', pal.deep]], 'linear', 'x1="20%" y1="0%" x2="65%" y2="100%"'),
    grad(`${p}-fin`, [['0%', pal.rim], ['60%', pal.body], ['100%', pal.deep]], 'linear'),
    grad(`${p}-eye`, [['0%', '#f4fdff'], ['40%', pal.eye], ['100%', pal.rim]], 'radial'),
    grad(`${p}-water`, [['0%', pal.water, 0.94], ['100%', pal.water, 0.98]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    `${I3}<filter id="${p}-glow" x="-80%" y="-80%" width="260%" height="260%">
${I4}<feGaussianBlur stdDeviation="1.1" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`,
  ].join('\n');
}

/* ---------- geometry helpers ---------- */

function rot(dx, dy) { return { dx, dy, px: -dy, py: dx }; }

/** Multi-segment jagged lightning bolt with a short secondary fork, striking down through the sky. */
function skyBolt(x, yTop, yBottom, jitter, color, glowId, weight = 1.1) {
  const segs = 5;
  const pts = [{ x, y: yTop }];
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const y = yTop + (yBottom - yTop) * t;
    const jx = x + (Math.sin(i * 2.4) * jitter) * (1 - t * 0.3);
    pts.push({ x: jx, y });
  }
  const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  const forkStart = pts[2];
  const forkEnd = { x: forkStart.x + jitter * 1.4, y: forkStart.y + (yBottom - yTop) * 0.22 };
  return `${I3}<path d="${d}" stroke="${color}" stroke-width="${weight}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" filter="url(#${glowId})"/>
${I3}<path d="M ${forkStart.x.toFixed(1)} ${forkStart.y.toFixed(1)} L ${forkEnd.x.toFixed(1)} ${forkEnd.y.toFixed(1)}" stroke="${color}" stroke-width="${(weight * 0.7).toFixed(1)}" fill="none" stroke-linecap="round" opacity="0.6" filter="url(#${glowId})"/>`;
}

/** Head wedge (skull + upper jaw roofline) — blunt, massive, whale/shark-like, facing along (dx,dy). */
function headSkull(hx, hy, dir, s, fillId, stroke) {
  const { dx, dy, px, py } = dir;
  const snoutTip = { x: hx + dx * s * 1.12, y: hy + dy * s * 1.12 - s * 0.02 };
  const browTop = { x: hx - dx * s * 0.15 + px * s * 1.0, y: hy - dy * s * 0.15 + py * s * 1.0 };
  const backTop = { x: hx - dx * s * 1.1 + px * s * 0.72, y: hy - dy * s * 1.1 + py * s * 0.72 };
  const jawHinge = { x: hx - dx * s * 1.0 - px * s * 0.32, y: hy - dy * s * 1.0 - py * s * 0.32 };
  const upperJawFront = { x: hx + dx * s * 0.95 - px * s * 0.38, y: hy + dy * s * 0.95 - py * s * 0.38 };
  const browCtrl = { x: hx - dx * s * 0.75 + px * s * 1.12, y: hy - dy * s * 0.75 + py * s * 1.12 };
  const snoutCtrl = { x: hx + dx * s * 0.65 + px * s * 0.62, y: hy + dy * s * 0.65 + py * s * 0.62 };
  const d = `M ${backTop.x.toFixed(1)} ${backTop.y.toFixed(1)} Q ${browCtrl.x.toFixed(1)} ${browCtrl.y.toFixed(1)} ${browTop.x.toFixed(1)} ${browTop.y.toFixed(1)} Q ${snoutCtrl.x.toFixed(1)} ${snoutCtrl.y.toFixed(1)} ${snoutTip.x.toFixed(1)} ${snoutTip.y.toFixed(1)} L ${upperJawFront.x.toFixed(1)} ${upperJawFront.y.toFixed(1)} L ${jawHinge.x.toFixed(1)} ${jawHinge.y.toFixed(1)} Z`;
  return {
    svg: `${I4}<path d="${d}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`,
    snoutTip, browTop, backTop, jawHinge, upperJawFront,
  };
}

/** Lower jaw — open (mouth-happy, dark maw + interlocking teeth) vs shut (mouth-sad). */
function jawAndTeeth(hx, hy, dir, s, jawHinge, upperJawFront, snoutTip, toothCount, fillId, stroke, toothColor) {
  const { dx, dy, px, py } = dir;
  const hinge = { x: hx - dx * s * 1.0 - px * s * 0.5, y: hy - dy * s * 1.0 - py * s * 0.5 };
  const openChin = { x: hx + dx * s * 0.8 - px * s * 1.35, y: hy + dy * s * 0.8 - py * s * 1.35 };
  const openTip = { x: hx + dx * s * 1.08 - px * s * 0.62, y: hy + dy * s * 1.08 - py * s * 0.62 };
  const shutChin = { x: hx + dx * s * 0.92 - px * s * 0.5, y: hy + dy * s * 0.92 - py * s * 0.5 };

  const openPath = `M ${hinge.x.toFixed(1)} ${hinge.y.toFixed(1)} Q ${openChin.x.toFixed(1)} ${openChin.y.toFixed(1)} ${openTip.x.toFixed(1)} ${openTip.y.toFixed(1)} L ${snoutTip.x.toFixed(1)} ${snoutTip.y.toFixed(1)} L ${upperJawFront.x.toFixed(1)} ${upperJawFront.y.toFixed(1)} Z`;
  const shutPath = `M ${hinge.x.toFixed(1)} ${hinge.y.toFixed(1)} Q ${((hinge.x + shutChin.x) / 2).toFixed(1)} ${((hinge.y + shutChin.y) / 2 + 1).toFixed(1)} ${shutChin.x.toFixed(1)} ${shutChin.y.toFixed(1)} L ${upperJawFront.x.toFixed(1)} ${upperJawFront.y.toFixed(1)} Z`;

  // dark maw cavity behind the teeth, sunk slightly inward from the jaw edges
  const cavity = `M ${(hinge.x + (upperJawFront.x - hinge.x) * 0.15).toFixed(1)} ${(hinge.y + (upperJawFront.y - hinge.y) * 0.15).toFixed(1)} L ${(upperJawFront.x + (snoutTip.x - upperJawFront.x) * 0.12).toFixed(1)} ${(upperJawFront.y + (snoutTip.y - upperJawFront.y) * 0.12).toFixed(1)} L ${(openTip.x + (snoutTip.x - openTip.x) * 0.1).toFixed(1)} ${(openTip.y + (snoutTip.y - openTip.y) * 0.1).toFixed(1)} L ${(openChin.x + (openTip.x - openChin.x) * 0.25).toFixed(1)} ${(openChin.y + (openTip.y - openChin.y) * 0.25).toFixed(1)} Z`;

  const teeth = [];
  const upperLine = { ax: upperJawFront.x, ay: upperJawFront.y, bx: snoutTip.x, by: snoutTip.y };
  const lowerLine = { ax: hinge.x, ay: hinge.y, bx: openTip.x, by: openTip.y };
  for (let i = 0; i < toothCount; i++) {
    const t = toothCount <= 1 ? 0.5 : 0.08 + (i / (toothCount - 1)) * 0.82;
    const bx = upperLine.ax + (upperLine.bx - upperLine.ax) * t;
    const by = upperLine.ay + (upperLine.by - upperLine.ay) * t;
    const len = s * 0.3;
    const tipX = bx - py * len;
    const tipY = by + px * len;
    const w = s * 0.05;
    teeth.push(`${I4}<path d="M ${(bx + px * w).toFixed(1)} ${(by + py * w).toFixed(1)} L ${tipX.toFixed(1)} ${tipY.toFixed(1)} L ${(bx - px * w).toFixed(1)} ${(by - py * w).toFixed(1)} Z" fill="${toothColor}"/>`);
    const lt = toothCount <= 1 ? 0.5 : 0.15 + (i / (toothCount - 1)) * 0.7;
    const lbx = lowerLine.ax + (lowerLine.bx - lowerLine.ax) * lt;
    const lby = lowerLine.ay + (lowerLine.by - lowerLine.ay) * lt;
    const lTipX = lbx + py * len * 0.85;
    const lTipY = lby - px * len * 0.85;
    teeth.push(`${I4}<path d="M ${(lbx + px * w).toFixed(1)} ${(lby + py * w).toFixed(1)} L ${lTipX.toFixed(1)} ${lTipY.toFixed(1)} L ${(lbx - px * w).toFixed(1)} ${(lby - py * w).toFixed(1)} Z" fill="${toothColor}" opacity="0.92"/>`);
  }

  return `${I3}<g class="tm-mascot-mouth-happy">
${I4}<path d="${openPath}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.9"/>
${I4}<path d="${cavity}" fill="#02040a" opacity="0.92"/>
${teeth.join('\n')}
${I3}</g>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="${shutPath}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.9"/>`;
}

/** Single deep-set slit eye in 3/4 profile — a narrow glowing sliver, menacing rather than cute. */
function browEye(hx, hy, dir, s, r, p, pal, stroke, boss) {
  const { dx, dy, px, py } = dir;
  const ex = hx - dx * s * 0.06 + px * s * 0.42;
  const ey = hy - dy * s * 0.06 + py * s * 0.42;
  const glowMul = boss ? 2.4 : 1.6;
  const glowOp = boss ? 0.32 : 0.16;
  const socketRx = r * 1.7;
  const socketRy = r * 1.15;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return `${I3}<g class="tm-mascot-eye-open tm-leviathan-eye">
${I4}<ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${socketRx.toFixed(1)}" ry="${socketRy.toFixed(1)}" fill="#02050a" opacity="0.75" transform="rotate(${angleDeg.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>
${I4}<ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${(r * 1.3).toFixed(1)}" ry="${(r * 0.55).toFixed(1)}" fill="${pal.eye}" opacity="${glowOp}" filter="url(#${p}-glow)" transform="rotate(${angleDeg.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>
${I4}<ellipse class="tm-leviathan-iris" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.34).toFixed(1)}" fill="url(#${p}-eye)" stroke="${stroke}" stroke-width="0.4" transform="rotate(${angleDeg.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>
${I4}<ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${(r * 0.16).toFixed(1)}" ry="${(r * 0.3).toFixed(1)}" fill="#000" transform="rotate(${angleDeg.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)})"/>
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${(ex - r).toFixed(1)} ${ey.toFixed(1)} Q ${ex.toFixed(1)} ${(ey + r * 0.3).toFixed(1)} ${(ex + r).toFixed(1)} ${ey.toFixed(1)}" stroke="${stroke}" stroke-width="1" fill="none" stroke-linecap="round"/>
${I3}</g>`;
}

/**
 * Smooth, rounded dorsal hump arching from the base of the head's neck, over
 * a broad crest (where the fin roots), back down into the water — a whale-
 * like breaching back, not a sharp mountain.
 */
function dorsalHump(neckPt, crest, submergeX, baseY, fillId, stroke) {
  const riseX = neckPt.x - (neckPt.x - crest.x) * 0.55;
  const riseY = neckPt.y + (crest.y - neckPt.y) * 0.7;
  const nearPeakL = { x: crest.x + (neckPt.x - crest.x) * 0.42, y: crest.y };
  const nearPeakR = { x: crest.x - (crest.x - submergeX) * 0.32, y: crest.y };
  const fallX = crest.x - (crest.x - submergeX) * 0.62;
  const fallY = crest.y + (baseY - crest.y) * 0.4;
  const d = `M ${neckPt.x.toFixed(1)} ${baseY.toFixed(1)} L ${neckPt.x.toFixed(1)} ${neckPt.y.toFixed(1)} C ${riseX.toFixed(1)} ${riseY.toFixed(1)} ${nearPeakL.x.toFixed(1)} ${nearPeakL.y.toFixed(1)} ${crest.x.toFixed(1)} ${crest.y.toFixed(1)} C ${nearPeakR.x.toFixed(1)} ${crest.y.toFixed(1)} ${fallX.toFixed(1)} ${fallY.toFixed(1)} ${submergeX.toFixed(1)} ${baseY.toFixed(1)} Z`;
  return `${I4}<path d="${d}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`;
}

/** Slender, swept-back shark/sail dorsal fin, rooted directly on the hump's crest. */
function dorsalFin(crest, height, width, fillId, stroke, torn) {
  const baseL = { x: crest.x + width * 0.32, y: crest.y + 0.5 };
  const baseR = { x: crest.x - width * 0.28, y: crest.y + 1 };
  const tip = { x: crest.x - width * 0.16, y: crest.y - height };
  const leadCtrl1 = { x: crest.x + width * 0.26, y: crest.y - height * 0.4 };
  const leadCtrl2 = { x: crest.x + width * 0.06, y: crest.y - height * 0.82 };
  const backCtrl = { x: crest.x - width * 0.22, y: crest.y - height * 0.22 };
  const tornNotch = torn ? ` L ${(tip.x + width * 0.22).toFixed(1)} ${(tip.y + height * 0.22).toFixed(1)} L ${(tip.x + width * 0.08).toFixed(1)} ${(tip.y + height * 0.16).toFixed(1)}` : '';
  const d = `M ${baseL.x.toFixed(1)} ${baseL.y.toFixed(1)} C ${leadCtrl1.x.toFixed(1)} ${leadCtrl1.y.toFixed(1)} ${leadCtrl2.x.toFixed(1)} ${leadCtrl2.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}${tornNotch} Q ${backCtrl.x.toFixed(1)} ${backCtrl.y.toFixed(1)} ${baseR.x.toFixed(1)} ${baseR.y.toFixed(1)} Z`;
  return `${I4}<path d="${d}" fill="url(#${fillId})" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`;
}

/** Weathered barnacle bumps for the ancient stage. */
function barnacles(neckPt, submergeX, baseY, count, stroke) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const t = 0.15 + (0.7 / Math.max(1, count - 1)) * i;
    const x = neckPt.x + (submergeX - neckPt.x) * t;
    const y = baseY - 2 - (i % 2) * 1.5;
    parts.push(`${I4}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${0.9 + (i % 2) * 0.4}" fill="${stroke}" opacity="0.55"/>`);
  }
  return parts.join('\n');
}

/** Faint glowing power-veins along the hump for the ancient stage. */
function ancientVeins(neckPt, crest, submergeX, baseY, color, glowId) {
  const midX = (neckPt.x + crest.x) / 2;
  const midY = Math.min(neckPt.y, crest.y) + 4;
  return `${I4}<path d="M ${neckPt.x.toFixed(1)} ${(neckPt.y + 2).toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${crest.x.toFixed(1)} ${(crest.y + 4).toFixed(1)} Q ${((crest.x + submergeX) / 2).toFixed(1)} ${(baseY - 6).toFixed(1)} ${submergeX.toFixed(1)} ${(baseY - 1).toFixed(1)}" fill="none" stroke="${color}" stroke-width="0.7" opacity="0.55" filter="url(#${glowId})" class="tm-leviathan-vein"/>`;
}

/** The wavy sea surface, drawn last to "cut off" the lower body and sell the half-submerged look. */
function seaCutoff(baseY, waveAmp, p, pal, foamXs) {
  const wave = `M 0 ${baseY.toFixed(1)} Q 15 ${(baseY - waveAmp).toFixed(1)} 30 ${baseY.toFixed(1)} Q 45 ${(baseY + waveAmp).toFixed(1)} 60 ${baseY.toFixed(1)} Q 75 ${(baseY - waveAmp).toFixed(1)} 90 ${baseY.toFixed(1)} Q 97 ${(baseY + waveAmp * 0.6).toFixed(1)} 100 ${baseY.toFixed(1)} L 100 100 L 0 100 Z`;
  const foam = foamXs.map((x) => `${I3}<ellipse cx="${x.toFixed(1)}" cy="${(baseY - 0.5).toFixed(1)}" rx="${3 + Math.random() * 0}" ry="0.9" fill="${pal.foam}" opacity="0.5"/>`).join('\n');
  return `${I3}<path d="${wave}" fill="url(#${p}-water)"/>
${I3}<path d="M 0 ${baseY.toFixed(1)} Q 15 ${(baseY - waveAmp).toFixed(1)} 30 ${baseY.toFixed(1)} Q 45 ${(baseY + waveAmp).toFixed(1)} 60 ${baseY.toFixed(1)} Q 75 ${(baseY - waveAmp).toFixed(1)} 90 ${baseY.toFixed(1)} Q 97 ${(baseY + waveAmp * 0.6).toFixed(1)} 100 ${baseY.toFixed(1)}" fill="none" stroke="${pal.foam}" stroke-width="0.8" opacity="0.55"/>
${foam}`;
}

/** Small fin-tip triangle poking through the water — used sparingly for the tail hint. */
function finTip(x, y, angleDeg, size, fillId, stroke, opacity = 0.85) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const tip = { x: x + dx * size, y: y + dy * size };
  const baseL = { x: x + px * size * 0.4, y: y + py * size * 0.4 };
  const baseR = { x: x - px * size * 0.4, y: y - py * size * 0.4 };
  return `${I4}<path d="M ${baseL.x.toFixed(1)} ${baseL.y.toFixed(1)} L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L ${baseR.x.toFixed(1)} ${baseR.y.toFixed(1)} Z" fill="url(#${fillId})" stroke="${stroke}" stroke-width="0.7" opacity="${opacity}"/>`;
}

/** Soft spray/foam burst where the body breaks the surface — used for the wing/arm animation anchors. */
function splashBurst(x, y, size, pal) {
  const droplets = [-0.6, 0, 0.6].map((off, i) => {
    const dx = off * size;
    const dy = -size * (0.5 + Math.abs(off) * 0.3);
    return `${I4}<circle cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r="${(size * (0.32 - i * 0.05)).toFixed(2)}" fill="${pal.foam}" opacity="${0.5 - i * 0.08}"/>`;
  }).join('\n');
  return `${I4}<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(size * 1.1).toFixed(1)}" ry="${(size * 0.32).toFixed(1)}" fill="${pal.foam}" opacity="0.28"/>
${droplets}`;
}

/* ---------- stage builder ---------- */

function buildStage(p, pal, stroke, cfg) {
  const dir = rot(Math.cos((cfg.headTiltDeg * Math.PI) / 180), Math.sin((cfg.headTiltDeg * Math.PI) / 180));
  const head = headSkull(cfg.headCX, cfg.headCY, dir, cfg.headSize, `${p}-body`, stroke);
  const neckPt = head.backTop;
  const crest = { x: cfg.crestX, y: cfg.crestY };

  const jawTeeth = jawAndTeeth(cfg.headCX, cfg.headCY, dir, cfg.headSize, head.jawHinge, head.upperJawFront, head.snoutTip, cfg.teeth, `${p}-body`, stroke, '#f4fbfd');
  const eye = browEye(cfg.headCX, cfg.headCY, dir, cfg.headSize, cfg.eyeR, p, pal, stroke, cfg.boss);
  // The hump stays a modest, rounded whale-back rise; the tall dramatic
  // height comes from the slender fin rooted on top of it, not a pointy hill.
  const desiredTipY = crest.y - cfg.finHeight;
  const humpPeak = { x: crest.x, y: neckPt.y - (neckPt.y - crest.y) * 0.4 };
  const hump = dorsalHump(neckPt, humpPeak, cfg.submergeX, cfg.baseY, `${p}-body`, stroke);
  const fin = dorsalFin(humpPeak, humpPeak.y - desiredTipY, cfg.headSize * 1.3, `${p}-fin`, stroke, cfg.ancient);
  const auxFin = cfg.auxFin
    ? dorsalFin({ x: (humpPeak.x + cfg.submergeX) / 2 + 3, y: (humpPeak.y + cfg.baseY) / 2 + 3 }, (humpPeak.y - desiredTipY) * 0.35, cfg.headSize * 0.65, `${p}-fin`, stroke, false)
    : '';

  const lightningXs = [];
  for (let i = 0; i < cfg.lightningCount; i++) {
    const leftSide = i % 2 === 0;
    const spread = 6 + Math.floor(i / 2) * 14;
    lightningXs.push(leftSide ? Math.max(4, cfg.submergeX - 8 - spread) : Math.min(96, cfg.headCX + 14 + spread));
  }

  const wingLeftPt = { x: (neckPt.x + crest.x) / 2 - 2, y: cfg.baseY - 0.4 };
  const wingRightPt = { x: (crest.x + cfg.submergeX) / 2 + 2, y: cfg.baseY - 0.4 };
  const tailPt = { x: Math.max(3, cfg.submergeX - 10), y: cfg.baseY };

  return `${lightningXs.map((x, i) => skyBolt(x, 0, cfg.baseY - 14 - (i % 2) * 6, 4 + (i % 3) * 1.5, pal.bolt, `${p}-glow`, cfg.boss ? 1.3 : 1)).join('\n')}
${I3}<g class="tm-animate-tail" opacity="0.5">
${finTip(tailPt.x, tailPt.y, -55, cfg.headSize * 0.4, `${p}-fin`, stroke, 0.55)}
${I3}</g>
${I3}<g class="tm-animate-body tm-mascot-main-body tm-leviathan-body">
${hump}
${cfg.ancient ? ancientVeins(neckPt, humpPeak, cfg.submergeX, cfg.baseY, pal.eye, `${p}-glow`) : ''}
${cfg.ancient ? barnacles(neckPt, cfg.submergeX, cfg.baseY, 4, stroke) : ''}
${auxFin}
${fin}
${head.svg}
${jawTeeth}
${eye}
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${splashBurst(wingLeftPt.x, wingLeftPt.y, cfg.headSize * 0.32, pal)}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${splashBurst(wingRightPt.x, wingRightPt.y, cfg.headSize * 0.26, pal)}
${I3}</g>
${I3}<g class="tm-animate-arm-left" opacity="0.001">
${I4}<circle cx="${cfg.submergeX.toFixed(1)}" cy="${cfg.baseY.toFixed(1)}" r="0.5" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-arm-right" opacity="0.001">
${I4}<circle cx="${(cfg.headCX + cfg.headSize * 0.2).toFixed(1)}" cy="${cfg.baseY.toFixed(1)}" r="0.5" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-left" opacity="0.001">
${I4}<circle cx="${cfg.submergeX.toFixed(1)}" cy="${cfg.baseY.toFixed(1)}" r="0.5" fill="${stroke}"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right" opacity="0.001">
${I4}<circle cx="${(cfg.headCX + cfg.headSize * 0.2).toFixed(1)}" cy="${cfg.baseY.toFixed(1)}" r="0.5" fill="${stroke}"/>
${I3}</g>
${seaCutoff(cfg.baseY, cfg.waveAmp, p, pal, [neckPt.x - 3, crest.x, cfg.submergeX + 2])}`;
}

const STAGE_CFG = {
  baby: {
    headCX: 56, headCY: 79, headSize: 6.5, headTiltDeg: -8, eyeR: 1.5,
    crestX: 44, crestY: 77, submergeX: 34, finHeight: 2, auxFin: false, ancient: false,
    baseY: 82, waveAmp: 1.2, teeth: 0, lightningCount: 0, boss: false,
  },
  evo1: {
    headCX: 58, headCY: 72, headSize: 8.5, headTiltDeg: -9, eyeR: 1.9,
    crestX: 44, crestY: 68, submergeX: 30, finHeight: 4, auxFin: false, ancient: false,
    baseY: 78, waveAmp: 1.4, teeth: 0, lightningCount: 1, boss: false,
  },
  evo2: {
    headCX: 62, headCY: 62, headSize: 11, headTiltDeg: -10, eyeR: 2.4,
    crestX: 42, crestY: 54, submergeX: 24, finHeight: 8, auxFin: false, ancient: false,
    baseY: 74, waveAmp: 1.6, teeth: 3, lightningCount: 2, boss: false,
  },
  evo3: {
    headCX: 67, headCY: 52, headSize: 13.5, headTiltDeg: -11, eyeR: 3,
    crestX: 40, crestY: 38, submergeX: 18, finHeight: 13, auxFin: false, ancient: false,
    baseY: 71, waveAmp: 1.9, teeth: 6, lightningCount: 4, boss: true,
  },
  evo4: {
    headCX: 69, headCY: 47, headSize: 14.5, headTiltDeg: -12, eyeR: 3.3,
    crestX: 39, crestY: 30, submergeX: 15, finHeight: 16, auxFin: true, ancient: false,
    baseY: 70, waveAmp: 2.1, teeth: 7, lightningCount: 5, boss: true,
  },
  evo5: {
    headCX: 71, headCY: 42, headSize: 15.5, headTiltDeg: -13, eyeR: 3.5,
    crestX: 38, crestY: 24, submergeX: 12, finHeight: 18, auxFin: true, ancient: true,
    baseY: 69, waveAmp: 2.3, teeth: 8, lightningCount: 6, boss: true,
  },
};

function leviathanStage(stage) {
  const p = `leviathan-${STAGE_SLUG[stage]}`;
  const pal = STAGE_PALETTES[stage];
  const stroke = pal.deep;
  const defs = makeDefs(p, pal);
  const body = buildStage(p, pal, stroke, STAGE_CFG[stage]);
  return wrapStage(stage, defs, body);
}

export const leviathanSvg = `${I}<!-- LEVIATHAN CHARACTER - All Life Stages (MYTHICAL Storm Leviathan · Storm-Breaker v8 · breaching-colossus redesign) -->
${STAGES.map(leviathanStage).join('\n')}`;
