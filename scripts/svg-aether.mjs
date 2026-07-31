/**
 * Starveil Aether — v9 "Fallen Voidblade" (3-seg wings + broken halo)
 *
 * Hardens the butterfly-soft read: angular shard wings, colder void palette,
 * predatory eyes from hatch, grim mouth. Lore-aligned blade-angel, not moth.
 *
 * Pokémon-style evolution: every stage has a distinct MAIN BODY shape.
 *   baby — Voidseed: faceted crystal seed (compact hex)
 *   evo1 — Veilspawn: short wide ragged husk
 *   evo2 — Astral Warden: ultra-thin spear pillar
 *   evo3 — Star Sovereign: broad armored hourglass
 *   evo4 — Eclipse Tyrant: wide diamond mantle with side spikes
 *   evo5 — Primordial: asymmetric twisted god-mass
 *
 * Every tm-aether-* hook class and data-fx group used by myman_styles.js /
 * myman_mascot.js FX code is preserved per stage (verified by self-check).
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';

const N = (v) => Number(v.toFixed(2));
const P = (x, y) => `${N(x)} ${N(y)}`;

/* Deterministic pseudo-random (stable art between builds). */
function rnd(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PAL = {
  // Colder / darker — less lavender-pastel (that read as butterfly)
  baby: { hi: '#9aa0c8', mid: '#4a3f78', deep: '#2a1d52', dark: '#120828', teal: '#3dcfbf', gold: '#c9a227', line: '#1a122e', void: '#05010c', blood: '#8b1e2d' },
  evo1: { hi: '#8b90b8', mid: '#3f3368', deep: '#241848', dark: '#0e061c', teal: '#36c9b8', gold: '#b8962a', line: '#160e28', void: '#04010a', blood: '#a01e30' },
  evo2: { hi: '#7e84ae', mid: '#34285c', deep: '#1c123c', dark: '#0a0416', teal: '#2fc4b4', gold: '#a88420', line: '#120a22', void: '#030108', blood: '#b71c2c' },
  evo3: { hi: '#a8a0c4', mid: '#3a2a62', deep: '#1a1040', dark: '#080314', teal: '#2ee0d0', gold: '#d4a017', line: '#10081e', void: '#020106', blood: '#c62828' },
  evo4: { hi: '#6a6080', mid: '#2c203e', deep: '#160e28', dark: '#06020e', teal: '#2bb8aa', gold: '#8a7020', line: '#0c0614', void: '#020106', blood: '#c62828' },
  evo5: { hi: '#d8d0b8', mid: '#4a3a68', deep: '#1e1438', dark: '#080412', teal: '#4aefe0', gold: '#e8c040', line: '#10081c', void: '#020106', blood: '#e64a3c' },
};

/* ── shared defs ── */
function defs(p, pal) {
  return `${I2}<radialGradient id="${p}-body" cx="38%" cy="24%" r="85%">
${I3}<stop offset="0%" style="stop-color:${pal.hi};stop-opacity:1" />
${I3}<stop offset="42%" style="stop-color:${pal.mid};stop-opacity:1" />
${I3}<stop offset="78%" style="stop-color:${pal.deep};stop-opacity:1" />
${I3}<stop offset="100%" style="stop-color:${pal.dark};stop-opacity:1" />
${I2}</radialGradient>
${I2}<linearGradient id="${p}-cloak" x1="0%" y1="0%" x2="0%" y2="100%">
${I3}<stop offset="0%" style="stop-color:${pal.deep};stop-opacity:1" />
${I3}<stop offset="55%" style="stop-color:${pal.dark};stop-opacity:1" />
${I3}<stop offset="100%" style="stop-color:${pal.void};stop-opacity:1" />
${I2}</linearGradient>
${I2}<radialGradient id="${p}-core" cx="50%" cy="45%" r="55%">
${I3}<stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
${I3}<stop offset="32%" style="stop-color:${pal.teal};stop-opacity:1" />
${I3}<stop offset="70%" style="stop-color:${pal.gold};stop-opacity:.85" />
${I3}<stop offset="100%" style="stop-color:${pal.void};stop-opacity:0" />
${I2}</radialGradient>
${I2}<linearGradient id="${p}-wing" x1="10%" y1="0%" x2="95%" y2="95%">
${I3}<stop offset="0%" style="stop-color:${pal.dark};stop-opacity:.98" />
${I3}<stop offset="38%" style="stop-color:${pal.void};stop-opacity:.98" />
${I3}<stop offset="72%" style="stop-color:${pal.deep};stop-opacity:.94" />
${I3}<stop offset="100%" style="stop-color:${pal.void};stop-opacity:1" />
${I2}</linearGradient>
${I2}<linearGradient id="${p}-blade" x1="0%" y1="0%" x2="100%" y2="0%">
${I3}<stop offset="0%" style="stop-color:${pal.teal};stop-opacity:.95" />
${I3}<stop offset="40%" style="stop-color:${pal.blood || pal.mid};stop-opacity:.55" />
${I3}<stop offset="100%" style="stop-color:${pal.void};stop-opacity:.98" />
${I2}</linearGradient>
${I2}<radialGradient id="${p}-iris" cx="40%" cy="35%" r="65%">
${I3}<stop offset="0%" style="stop-color:#eafffd;stop-opacity:1" />
${I3}<stop offset="55%" style="stop-color:${pal.teal};stop-opacity:1" />
${I3}<stop offset="100%" style="stop-color:${pal.void};stop-opacity:1" />
${I2}</radialGradient>
${I2}<radialGradient id="${p}-aura" cx="50%" cy="52%" r="70%">
${I3}<stop offset="0%" style="stop-color:${pal.teal};stop-opacity:.2" />
${I3}<stop offset="45%" style="stop-color:${pal.mid};stop-opacity:.1" />
${I3}<stop offset="100%" style="stop-color:${pal.void};stop-opacity:0" />
${I2}</radialGradient>
${I2}<linearGradient id="${p}-goldrim" x1="0%" y1="0%" x2="0%" y2="100%">
${I3}<stop offset="0%" style="stop-color:${pal.gold};stop-opacity:1" />
${I3}<stop offset="100%" style="stop-color:${pal.deep};stop-opacity:1" />
${I2}</linearGradient>
${I2}<filter id="${p}-glow" x="-80%" y="-80%" width="260%" height="260%">
${I3}<feGaussianBlur stdDeviation="1.1" result="b"/>
${I3}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I2}</filter>`;
}

/* ── scattered stars inside a region ── */
function stars(seed, count, cx, cy, rx, ry, color, maxR = 0.8) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = rnd(seed + i * 7) * Math.PI * 2;
    const d = Math.sqrt(rnd(seed + i * 13 + 3));
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    const r = 0.25 + rnd(seed + i * 29 + 9) * maxR;
    const o = 0.35 + rnd(seed + i * 41 + 5) * 0.6;
    out.push(`${I2}<circle cx="${N(x)}" cy="${N(y)}" r="${N(r)}" fill="${color}" opacity="${N(o)}"/>`);
  }
  return out.join('\n');
}

/* ── constellation: stars joined by faint lines ── */
function constellation(seed, pts, color) {
  const lines = [];
  for (let i = 0; i < pts.length - 1; i++) {
    lines.push(`${I2}<line x1="${N(pts[i][0])}" y1="${N(pts[i][1])}" x2="${N(pts[i + 1][0])}" y2="${N(pts[i + 1][1])}" stroke="${color}" stroke-width="0.3" opacity="0.4"/>`);
  }
  const dots = pts.map(([x, y], i) =>
    `${I2}<circle cx="${N(x)}" cy="${N(y)}" r="${N(0.5 + rnd(seed + i) * 0.5)}" fill="${color}" opacity="0.9"/>`);
  return lines.concat(dots).join('\n');
}

/* ── spear shard (hard edge — no soft Q curves) ── */
function blade(x, y, angle, length, width, fill, opacity = 1) {
  const rad = angle * Math.PI / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad), nx = -dy, ny = dx;
  const tip = P(x + dx * length, y + dy * length);
  const baseA = P(x + nx * width * 0.55, y + ny * width * 0.55);
  const baseB = P(x - nx * width * 0.55, y - ny * width * 0.55);
  const midA = P(x + dx * length * 0.42 + nx * width * 0.28, y + dy * length * 0.42 + ny * width * 0.28);
  const midB = P(x + dx * length * 0.48 - nx * width * 0.18, y + dy * length * 0.48 - ny * width * 0.18);
  const d = `M ${baseA} L ${midA} L ${tip} L ${midB} L ${baseB} Z`;
  return `${I2}<path d="${d}" fill="${fill}" opacity="${opacity}" stroke="${fill === 'none' ? 'none' : 'rgba(0,0,0,0.35)'}" stroke-width="0.25"/>`;
}

/**
 * Fallen voidblade wing (LEFT) — 3 articulated segments that CSS flaps separately:
 *   root (shoulder plate) → mid (blade mass) → tip (claw + tatters)
 * Bigger cathedral span + burnt/ragged feathers for fallen-angel read.
 * o: { sx,sy shoulder; span; blades; lift; crack; starSeed; tatters }
 */
function voidWingLeft(p, pal, o) {
  const { sx, sy, span, blades: nBlades, lift = 0, crack = false, starSeed = 1, tatters = true } = o;
  const midX = sx - span * 0.38;
  const midY = sy - span * 0.28 - lift * 0.45;
  const tipJX = sx - span * 0.76;
  const tipJY = sy - span * 0.52 - lift * 0.85;
  const tipX = sx - span * 1.22;
  const tipY = sy - span * 0.62 - lift;
  const highX = sx - span * 0.48;
  const highY = sy - span * 0.88 - lift;
  const notchX = sx - span * 0.86;
  const notchY = sy - span * 0.12 - lift * 0.35;
  const lowX = sx - span * 0.8;
  const lowY = sy + span * 0.55;
  const heelX = sx - span * 0.18;
  const heelY = sy + span * 0.18;
  // fill-box + body-side origin — view-box px origins break under live SVG scale/nesting
  const origin = () => 'transform-origin:100% 42%;transform-box:fill-box';

  const rootBlades = Math.max(1, Math.ceil(nBlades * 0.35));
  const midBlades = Math.max(1, Math.ceil(nBlades * 0.4));
  const tipBlades = Math.max(1, nBlades - rootBlades - midBlades + 1);

  const makeBlades = (count, baseX, baseY, ang0, angSpan, lenMul, op) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const ang = ang0 - t * angSpan;
      const len = span * lenMul * (0.72 + Math.sin(t * Math.PI) * 0.4);
      const w = span * (0.085 + (1 - Math.abs(t - 0.5) * 2) * 0.04);
      out.push(blade(baseX, baseY, ang, len, w, `url(#${p}-blade)`, op));
    }
    return out.join('\n');
  };

  const tatterBits = [];
  if (tatters) {
    tatterBits.push(`${I2}<path class="tm-aether-wing-tatter" d="M ${P(notchX, notchY)} L ${P(notchX - span * 0.14, notchY + span * 0.18)} L ${P(notchX - span * 0.02, notchY + span * 0.12)} Z" fill="${pal.void}" stroke="${pal.blood || pal.teal}" stroke-width="0.4" opacity="0.85"/>`);
    tatterBits.push(`${I2}<path class="tm-aether-wing-tatter" d="M ${P(lowX + span * 0.04, lowY - span * 0.1)} L ${P(lowX - span * 0.16, lowY + span * 0.08)} L ${P(lowX + span * 0.02, lowY)} Z" fill="${pal.dark}" stroke="${pal.blood || pal.gold}" stroke-width="0.35" opacity="0.8"/>`);
    tatterBits.push(`${I2}<path class="tm-aether-wing-tatter" d="M ${P(tipX + span * 0.18, tipY + span * 0.12)} L ${P(tipX + span * 0.02, tipY + span * 0.28)} L ${P(tipX + span * 0.2, tipY + span * 0.2)} Z" fill="${pal.blood || pal.mid}" opacity="0.55"/>`);
  }

  return `${I2}<g class="tm-aether-wing-seg tm-aether-wing-root" style="${origin()}">
${I2}<path d="M ${P(sx, sy)} L ${P(sx - span * 0.22, sy - span * 0.2)} L ${P(sx - span * 0.28, sy + span * 0.08)} L ${P(sx - span * 0.06, sy + span * 0.12)} Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8" opacity="0.95"/>
${I2}<path d="M ${P(sx - 1, sy - 2)} L ${P(sx - span * 0.16, sy - span * 0.32)} L ${P(sx - span * 0.1, sy + 1)} Z" fill="${pal.blood || pal.gold}" opacity="0.45"/>
${makeBlades(rootBlades, sx - span * 0.02, sy, 198, 28, 0.42, 0.88)}
${I2}<g class="tm-aether-wing-seg tm-aether-wing-mid" style="${origin()}">
${I2}<path class="tm-aether-wing-membrane" d="M ${P(sx - span * 0.08, sy)} L ${P(highX, highY)} L ${P(tipJX + span * 0.08, tipJY)} L ${P(notchX + span * 0.12, notchY)} L ${P(lowX + span * 0.14, lowY - span * 0.08)} L ${P(heelX, heelY)} Z" fill="url(#${p}-wing)" stroke="${pal.line}" stroke-width="0.95"/>
${I2}<path d="M ${P(notchX + span * 0.12, notchY)} L ${P(notchX - span * 0.06, notchY + span * 0.12)} L ${P(lowX + span * 0.18, lowY - span * 0.1)} L ${P(lowX + span * 0.14, lowY - span * 0.08)}" fill="none" stroke="${pal.blood || pal.teal}" stroke-width="0.55" opacity="0.8"/>
${makeBlades(midBlades, midX + span * 0.04, midY + span * 0.04, 192, 48, 0.58, 0.92)}
${stars(starSeed, Math.max(1, Math.round(span / 16)), midX - span * 0.1, midY, span * 0.22, span * 0.16, pal.teal, 0.35)}
${crack ? `${I2}<path class="tm-aether-wing-crack" d="M ${P(sx - span * .22, sy - span * .06)} L ${P(midX - span * .06, midY + span * .08)} L ${P(tipJX + span * .06, tipJY + span * .04)}" fill="none" stroke="${pal.gold}" stroke-width="0.65" stroke-dasharray="1.4 1.1" opacity="0.8"/>` : ''}
${I2}<path class="tm-aether-wing-vein" d="M ${P(sx, sy)} L ${P(midX, midY)} L ${P(tipJX, tipJY)}" fill="none" stroke="${pal.teal}" stroke-width="1" stroke-linecap="round" opacity="0.9"/>
${I2}<g class="tm-aether-wing-seg tm-aether-wing-tip" style="${origin()}">
${I2}<path class="tm-aether-wing-membrane" d="M ${P(tipJX + span * 0.06, tipJY)} L ${P(highX - span * 0.12, highY + span * 0.06)} L ${P(tipX, tipY)} L ${P(notchX, notchY)} L ${P(tipJX - span * 0.04, tipJY + span * 0.16)} Z" fill="url(#${p}-wing)" stroke="${pal.line}" stroke-width="0.85" opacity="0.95"/>
${makeBlades(tipBlades, tipJX, tipJY, 200, 36, 0.48, 0.9)}
${tatterBits.join('\n')}
${I2}<path class="tm-aether-wing-vein" d="M ${P(tipJX, tipJY)} L ${P(tipX, tipY)}" fill="none" stroke="${pal.blood || pal.teal}" stroke-width="0.85" stroke-linecap="round" opacity="0.85"/>
${I2}<path class="tm-aether-wing-claw" d="M ${P(tipX, tipY)} L ${P(tipX - 4.2, tipY - 1.6)} L ${P(tipX - 0.8, tipY + 3.4)} Z" fill="${pal.teal}" opacity="0.98"/>
${I2}<path d="M ${P(tipX - 0.5, tipY)} L ${P(tipX - 5.2, tipY - 3.2)} L ${P(tipX - 1.4, tipY - 0.3)} Z" fill="${pal.blood || pal.gold}" opacity="0.88"/>
${I2}</g>
${I2}</g>
${I2}</g>`;
}

/** Broken / tilted fallen halo (keeps tm-aether-halo class for hooks). */
function brokenHalo(pal, cx, cy, r, tilt = -18) {
  const a0 = (-40 + tilt) * Math.PI / 180;
  const a1 = (220 + tilt) * Math.PI / 180;
  const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
  const shardX = cx + Math.cos((260 + tilt) * Math.PI / 180) * (r + 2);
  const shardY = cy + Math.sin((260 + tilt) * Math.PI / 180) * (r + 2);
  return `${I}    <path class="tm-aether-halo" d="M ${P(x0, y0)} A ${N(r)} ${N(r)} 0 1 1 ${P(x1, y1)}" fill="none" stroke="${pal.gold}" stroke-width="1.15" opacity="0.55"/>
${I}    <path class="tm-aether-halo" d="M ${P(x0, y0)} A ${N(r * 1.22)} ${N(r * 1.22)} 0 1 1 ${P(x1 + 1, y1 + 1)}" fill="none" stroke="${pal.blood || pal.teal}" stroke-width="0.5" opacity="0.35" stroke-dasharray="2.2 3"/>
${I}    <path d="M ${P(x1, y1)} L ${P(shardX, shardY)} L ${P(x1 - 2, y1 + 3)} Z" fill="${pal.gold}" opacity="0.7"/>
${I}    <path d="M ${P(shardX, shardY)} L ${P(shardX - 1.5, shardY + 5)} L ${P(shardX + 1.2, shardY + 3.5)} Z" fill="${pal.blood || pal.void}" opacity="0.75"/>`;
}

function mirrored(inner) {
  return `${I2}<g transform="translate(100,0) scale(-1,1)">
${inner}
${I2}</g>`;
}

/* ── eyes ── */
function eyes(p, pal, o) {
  const { y, dx, rx = 3.2, ry = 4, fierce = false, eclipse = false, browAngle = 0, irisFill = `url(#${p}-iris)`, crescentL = pal.gold, crescentR = pal.blood || pal.gold } = o;
  const L = 50 - dx, R = 50 + dx;
  const cls = `tm-mascot-eye-open tm-aether-eyes${eclipse ? ' tm-aether-eyes-eclipse' : ''}`;
  const parts = [`${I}    <g class="${cls}">`];
  const scleraFill = eclipse ? pal.void : '#1a1228';
  parts.push(`${I2}<ellipse class="tm-aether-eye-sclera" cx="${L}" cy="${y}" rx="${rx}" ry="${ry}" fill="${scleraFill}" stroke="${pal.line}" stroke-width="1.1" opacity="0.94"/>`);
  parts.push(`${I2}<ellipse class="tm-aether-eye-sclera" cx="${R}" cy="${y}" rx="${rx}" ry="${ry}" fill="${scleraFill}" stroke="${pal.line}" stroke-width="1.1" opacity="0.94"/>`);
  if (eclipse) {
    parts.push(`${I2}<ellipse class="tm-aether-iris" cx="${L}" cy="${y}" rx="${N(rx * 0.8)}" ry="${N(ry * 0.85)}" fill="${irisFill}" opacity="0.5"/>`);
    parts.push(`${I2}<ellipse class="tm-aether-iris" cx="${R}" cy="${y}" rx="${N(rx * 0.8)}" ry="${N(ry * 0.85)}" fill="${irisFill}" opacity="0.5"/>`);
    parts.push(`${I2}<circle class="tm-aether-eclipse-pupil" cx="${L}" cy="${y}" r="${N(rx * 0.62)}" fill="#05010c"/>`);
    parts.push(`${I2}<path class="tm-aether-eclipse-crescent" d="M ${P(L - rx * 0.12, y - ry * 0.56)} A ${N(rx * 0.42)} ${N(ry * 0.55)} 0 1 1 ${P(L - rx * 0.12, y + ry * 0.56)}" fill="${crescentL}" opacity="0.9"/>`);
    parts.push(`${I2}<circle class="tm-aether-eclipse-pupil" cx="${R}" cy="${y}" r="${N(rx * 0.62)}" fill="#05010c"/>`);
    parts.push(`${I2}<path class="tm-aether-eclipse-crescent" d="M ${P(R + rx * 0.12, y - ry * 0.56)} A ${N(rx * 0.42)} ${N(ry * 0.55)} 0 1 0 ${P(R + rx * 0.12, y + ry * 0.56)}" fill="${crescentR}" opacity="0.8"/>`);
  } else {
    parts.push(`${I2}<ellipse class="tm-aether-iris" cx="${L}" cy="${y}" rx="${N(rx * 0.52)}" ry="${N(ry * 0.6)}" fill="${irisFill}"/>`);
    parts.push(`${I2}<ellipse class="tm-aether-iris" cx="${R}" cy="${y}" rx="${N(rx * 0.52)}" ry="${N(ry * 0.6)}" fill="${irisFill}"/>`);
    parts.push(`${I2}<ellipse cx="${L}" cy="${y}" rx="${N(rx * 0.2)}" ry="${N(ry * 0.34)}" fill="#05010c"/>`);
    parts.push(`${I2}<ellipse cx="${R}" cy="${y}" rx="${N(rx * 0.2)}" ry="${N(ry * 0.34)}" fill="#05010c"/>`);
    parts.push(`${I2}<circle cx="${N(L - rx * 0.25)}" cy="${N(y - ry * 0.3)}" r="0.55" fill="#ffffff" opacity="0.9"/>`);
    parts.push(`${I2}<circle cx="${N(R - rx * 0.25)}" cy="${N(y - ry * 0.3)}" r="0.55" fill="#ffffff" opacity="0.9"/>`);
  }
  if (fierce) {
    // heavy upper lids + angled brows
    parts.push(`${I2}<path d="M ${P(L - rx, y - ry * 0.55 + browAngle)} L ${P(L + rx, y - ry * 0.05)} L ${P(L + rx, y - ry - 1)} L ${P(L - rx, y - ry - 1)} Z" fill="url(#${p}-cloak)"/>`);
    parts.push(`${I2}<path d="M ${P(R + rx, y - ry * 0.55 + browAngle)} L ${P(R - rx, y - ry * 0.05)} L ${P(R - rx, y - ry - 1)} L ${P(R + rx, y - ry - 1)} Z" fill="url(#${p}-cloak)"/>`);
    parts.push(`${I2}<line x1="${N(L - rx - 0.6)}" y1="${N(y - ry * 0.6 + browAngle)}" x2="${N(L + rx + 0.4)}" y2="${N(y - ry * 0.02)}" stroke="${pal.line}" stroke-width="1.2" stroke-linecap="round"/>`);
    parts.push(`${I2}<line x1="${N(R + rx + 0.6)}" y1="${N(y - ry * 0.6 + browAngle)}" x2="${N(R - rx - 0.4)}" y2="${N(y - ry * 0.02)}" stroke="${pal.line}" stroke-width="1.2" stroke-linecap="round"/>`);
  } else {
    parts.push(`${I2}<line x1="${N(L - rx)}" y1="${N(y - ry - 0.8)}" x2="${N(L + rx * 0.7)}" y2="${N(y - ry + 0.2)}" stroke="${pal.line}" stroke-width="1" stroke-linecap="round" opacity="0.7"/>`);
    parts.push(`${I2}<line x1="${N(R + rx)}" y1="${N(y - ry - 0.8)}" x2="${N(R - rx * 0.7)}" y2="${N(y - ry + 0.2)}" stroke="${pal.line}" stroke-width="1" stroke-linecap="round" opacity="0.7"/>`);
  }
  parts.push(`${I}    </g>`);
  parts.push(`${I}    <g class="tm-mascot-eye-closed" style="display:none;">`);
  parts.push(`${I2}<path d="M ${P(L - rx, y)} Q ${P(L, y + 1.4)} ${P(L + rx, y)}" stroke="${pal.line}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  parts.push(`${I2}<path d="M ${P(R - rx, y)} Q ${P(R, y + 1.4)} ${P(R + rx, y)}" stroke="${pal.line}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  parts.push(`${I}    </g>`);
  return parts.join('\n');
}

function mouth(pal, y, w = 4, grim = false) {
  const happy = grim
    ? `M ${P(50 - w, y)} L ${P(50 - w * 0.3, y + 0.7)} L ${P(50 + w * 0.3, y + 0.7)} L ${P(50 + w, y)}`
    : `M ${P(50 - w, y)} Q ${P(50, y + 2)} ${P(50 + w, y)}`;
  const sad = `M ${P(50 - w, y + 1.5)} Q ${P(50, y - 1)} ${P(50 + w, y + 1.5)}`;
  return `${I}    <path class="tm-mascot-mouth-happy" d="${happy}" stroke="${pal.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
${I}    <path class="tm-mascot-mouth-sad" style="display:none;" d="${sad}" stroke="${pal.line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
}

/* ── fx groups (hidden by default; JS toggles .tm-fx-on) ── */
function fxSparks(p, pal, n, seed) {
  const dots = [];
  for (let i = 0; i < n; i++) {
    const x = 8 + rnd(seed + i * 3) * 84;
    const y = 8 + rnd(seed + i * 5 + 2) * 60;
    const r = 0.7 + rnd(seed + i * 7 + 4) * 1.2;
    const c = [pal.teal, pal.gold, pal.hi][i % 3];
    dots.push(`${I2}<circle class="tm-aether-spark" cx="${N(x)}" cy="${N(y)}" r="${N(r)}" fill="${c}"/>`);
  }
  return `${I}    <g class="tm-aether-fx " data-fx="sparks" opacity="0">
${dots.join('\n')}
${I}    </g>`;
}

function fxCorona(p, pal) {
  return `${I}    <g class="tm-aether-fx " data-fx="corona" opacity="0">
${I2}<circle class="tm-aether-corona" cx="50" cy="50" r="30" fill="none" stroke="${pal.teal}" stroke-width="0.8" opacity="0.5" stroke-dasharray="3 4"/>
${I2}<circle class="tm-aether-corona" cx="50" cy="50" r="36" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.35" stroke-dasharray="1.5 5"/>
${I}    </g>`;
}

function fxAura(p) {
  return `${I}    <g class="tm-aether-fx " data-fx="aura" opacity="0">
${I2}<ellipse class="tm-aether-aura" cx="50" cy="52" rx="38" ry="34" fill="url(#${p}-aura)"/>
${I}    </g>`;
}

function fxAuraOuter(p, pal) {
  return `${I}    <g class="tm-aether-fx " data-fx="aura-outer" opacity="0">
${I2}<ellipse class="tm-aether-aura-outer" cx="50" cy="52" rx="46" ry="42" fill="none" stroke="${pal.mid}" stroke-width="1.6" opacity="0.3"/>
${I2}<ellipse class="tm-aether-aura-outer" cx="50" cy="52" rx="43" ry="39" fill="url(#${p}-aura)" opacity="0.5"/>
${I}    </g>`;
}

function fxHaze(p, pal) {
  return `${I}    <g class="tm-aether-fx " data-fx="haze" opacity="0">
${I2}<g class="tm-aether-haze">
${I3}<ellipse class="tm-aether-haze-blob" cx="30" cy="40" rx="12" ry="7" fill="${pal.mid}" opacity="0.2"/>
${I3}<ellipse class="tm-aether-haze-blob" cx="68" cy="58" rx="14" ry="8" fill="${pal.teal}" opacity="0.14"/>
${I3}<ellipse class="tm-aether-haze-blob" cx="50" cy="26" rx="10" ry="6" fill="${pal.gold}" opacity="0.12"/>
${I2}</g>
${I}    </g>`;
}

function fxBeams(p, pal) {
  return `${I}    <g class="tm-aether-fx tm-aether-beams" data-fx="beams" opacity="0">
${I2}<path class="tm-aether-beam-glow" d="M 46 6 L 54 6 L 52 46 L 48 46 Z" fill="${pal.gold}" opacity="0.18"/>
${I2}<path d="M 30 12 L 34 12 L 33 44 L 31 44 Z" fill="${pal.teal}" opacity="0.14"/>
${I2}<path d="M 66 12 L 70 12 L 69 44 L 67 44 Z" fill="${pal.teal}" opacity="0.14"/>
${I}    </g>`;
}

function fxSigil(p, pal) {
  return `${I}    <g class="tm-aether-fx " data-fx="sigil" opacity="0">
${I2}<ellipse class="tm-aether-sigil" cx="50" cy="94" rx="22" ry="4.5" fill="none" stroke="${pal.teal}" stroke-width="0.8" opacity="0.6"/>
${I2}<ellipse class="tm-aether-sigil" cx="50" cy="94" rx="15" ry="3" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.5" stroke-dasharray="2 2"/>
${I2}<path class="tm-aether-sigil" d="M 50 90 L 54 94 L 50 98 L 46 94 Z" fill="none" stroke="${pal.hi}" stroke-width="0.5" opacity="0.55"/>
${I}    </g>`;
}

function fxOrbits(p, pal, withNodes = false) {
  const nodes = withNodes ? `
${I2}<circle class="tm-aether-orbit-node" cx="18" cy="52" r="1.4" fill="${pal.gold}" opacity="0.9"/>
${I2}<circle class="tm-aether-orbit-node" cx="82" cy="52" r="1.1" fill="${pal.teal}" opacity="0.9"/>
${I2}<circle class="tm-aether-orbit-node" cx="50" cy="24" r="1.2" fill="${pal.hi}" opacity="0.85"/>` : '';
  return `${I}    <g class="tm-aether-fx tm-aether-orbit-group" data-fx="orbits" opacity="0">
${I2}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="32" ry="10" fill="none" stroke="${pal.teal}" stroke-width="0.55" opacity="0.5" transform="rotate(-14 50 52)"/>
${I2}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="36" ry="13" fill="none" stroke="${pal.mid}" stroke-width="0.45" opacity="0.4" transform="rotate(12 50 52)"/>
${I2}<ellipse class="tm-aether-orbit" cx="50" cy="52" rx="28" ry="8" fill="none" stroke="${pal.gold}" stroke-width="0.4" opacity="0.45" transform="rotate(-30 50 52)"/>${nodes}
${I}    </g>`;
}

function fxRunes(p, pal) {
  const glyphs = [];
  for (let i = 0; i < 5; i++) {
    const a = -90 + i * 72;
    const rad = a * Math.PI / 180;
    const x = 50 + Math.cos(rad) * 30, y = 54 + Math.sin(rad) * 26;
    glyphs.push(`${I2}<path d="M ${P(x - 1.4, y - 1.6)} L ${P(x + 1.4, y - 1.6)} L ${P(x, y + 1.8)} Z M ${P(x, y - 1.6)} L ${P(x, y + 1.8)}" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.7"/>`);
  }
  return `${I}    <g class="tm-aether-fx tm-aether-runes" data-fx="runes" opacity="0">
${I2}<circle class="tm-aether-rune-ring" cx="50" cy="54" r="30" fill="none" stroke="${pal.gold}" stroke-width="0.6" opacity="0.55" stroke-dasharray="4 3"/>
${glyphs.join('\n')}
${I}    </g>`;
}

function fxRibbons(p, pal) {
  return `${I}    <g class="tm-aether-fx tm-aether-ribbons" data-fx="ribbons" opacity="0">
${I2}<path class="tm-aether-ribbon" d="M 18 30 C 10 44 14 62 24 74 C 18 60 20 44 26 34 Z" fill="${pal.teal}" opacity="0.3"/>
${I2}<path class="tm-aether-ribbon" d="M 82 30 C 90 44 86 62 76 74 C 82 60 80 44 74 34 Z" fill="${pal.mid}" opacity="0.3"/>
${I2}<path class="tm-aether-ribbon" d="M 30 16 C 40 8 60 8 70 16 C 58 12 42 12 30 16 Z" fill="${pal.gold}" opacity="0.25"/>
${I}    </g>`;
}

function fxFracture(p, pal) {
  return `${I}    <g class="tm-aether-fx " data-fx="fracture" opacity="0">
${I2}<g class="tm-aether-ground-fracture">
${I3}<path d="M 50 93 L 38 95 L 30 99" fill="none" stroke="${pal.teal}" stroke-width="0.7" stroke-dasharray="2 1.4" opacity="0.7"/>
${I3}<path d="M 50 93 L 62 96 L 72 99" fill="none" stroke="${pal.gold}" stroke-width="0.6" stroke-dasharray="1.8 1.2" opacity="0.65"/>
${I3}<path d="M 50 93 L 48 98" fill="none" stroke="${pal.hi}" stroke-width="0.5" stroke-dasharray="1.2 1" opacity="0.55"/>
${I2}</g>
${I}    </g>`;
}

function fxShards(p, pal) {
  return `${I}    <g class="tm-aether-fx tm-aether-shards" data-fx="shards" opacity="0">
${I2}<path class="tm-aether-shard" d="M 16 34 L 20 30 L 21 37 Z" fill="${pal.teal}" opacity="0.8"/>
${I2}<path class="tm-aether-shard" d="M 84 32 L 80 27 L 78 35 Z" fill="${pal.mid}" opacity="0.8"/>
${I2}<path class="tm-aether-shard" d="M 12 58 L 16 55 L 15 62 Z" fill="${pal.gold}" opacity="0.7"/>
${I2}<path class="tm-aether-shard" d="M 88 56 L 84 52 L 83 60 Z" fill="${pal.hi}" opacity="0.7"/>
${I}    </g>`;
}

/* ── crown of floating stars (visible regalia) ── */
function crown(pal, cy, n, spread, tiered = false) {
  const parts = [`${I2}<g class="tm-aether-crown-constellation">`];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = n <= 1 ? 0.5 : i / (n - 1);
    const x = 50 + (t - 0.5) * spread;
    const y = cy - Math.sin(t * Math.PI) * (tiered ? 7 : 4.5);
    pts.push([x, y]);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    parts.push(`${I3}<line x1="${N(pts[i][0])}" y1="${N(pts[i][1])}" x2="${N(pts[i + 1][0])}" y2="${N(pts[i + 1][1])}" stroke="${pal.gold}" stroke-width="0.35" opacity="0.5"/>`);
  }
  pts.forEach(([x, y], i) => {
    const r = i === Math.floor(n / 2) ? 1.5 : 0.9 + rnd(i * 3 + 1) * 0.4;
    parts.push(`${I3}<circle class="tm-aether-crown-star" cx="${N(x)}" cy="${N(y)}" r="${N(r)}" fill="${i % 2 ? pal.teal : pal.gold}"/>`);
  });
  if (tiered) {
    parts.push(`${I3}<path d="M ${P(50 - spread * 0.32, cy + 2)} Q ${P(50, cy - 3)} ${P(50 + spread * 0.32, cy + 2)}" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.6"/>`);
  }
  parts.push(`${I2}</g>`);
  return parts.join('\n');
}

/* ── rune tattoos on the body (3 glyphs; CSS pulses them) ── */
function runeTattoos(pal, cx, cy) {
  return `${I2}<g class="tm-aether-rune-tattoos">
${I3}<path class="tm-aether-rune-glyph" d="M ${P(cx - 6, cy)} l 1.6 -2 l 1.6 2 l -1.6 2 Z" fill="none" stroke="${pal.teal}" stroke-width="0.5" opacity="0.8"/>
${I3}<path class="tm-aether-rune-glyph" d="M ${P(cx + 4.5, cy - 1)} v 3.4 m -1.4 -1.7 h 2.8" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.8"/>
${I3}<path class="tm-aether-rune-glyph" d="M ${P(cx - 1, cy + 5)} l 1.2 -2.2 l 1.2 2.2 Z" fill="none" stroke="${pal.hi}" stroke-width="0.5" opacity="0.75"/>
${I2}</g>`;
}

/* ════════════════ STAGE BUILDERS ════════════════ */

/* baby — Voidseed: faceted crystal seed (compact hex) */
function buildBaby() {
  const p = 'aether-baby', pal = PAL.baby;
  return `${I}<!-- AETHER BABY — Voidseed -->
${I}<g id="tm-mascot-baby-aether" style="display: none;">
${I}    <defs>
${defs(p, pal)}
${I}    </defs>
${I}    <ellipse cx="50" cy="96" rx="16" ry="3.6" fill="#05010c" opacity="0.25"/>
${I}    <ellipse cx="50" cy="92" rx="11" ry="2.2" fill="${pal.teal}" opacity="0.18"/>
${fxSparks(p, pal, 4, 11)}
${I}    <g class="tm-animate-wing-left">
${voidWingLeft(p, pal, { sx: 36, sy: 58, span: 20, blades: 3, lift: 0, crack: false, starSeed: 21, tatters: false })}
${I}    </g>
${I}    <g class="tm-animate-wing-right">
${mirrored(voidWingLeft(p, pal, { sx: 36, sy: 58, span: 20, blades: 3, lift: 0, crack: false, starSeed: 22, tatters: false }))}
${I}    </g>
${I}    <g class="tm-animate-tail">
${I2}<path d="M 58 72 Q 66 76 70 84 Q 63 79 57 75 Z" fill="url(#${p}-blade)" opacity="0.65"/>
${I2}<circle cx="69" cy="83" r="1" fill="${pal.gold}" opacity="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-body">
${I2}<path d="M 50 38 L 64 46 L 68 58 L 62 72 L 50 78 L 38 72 L 32 58 L 36 46 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.5"/>
${I2}<path d="M 50 38 L 64 46 L 68 58 L 62 72 L 50 78 L 38 72 L 32 58 L 36 46 Z" fill="none" stroke="${pal.teal}" stroke-width="0.45" opacity="0.35"/>
${I2}<path d="M 40 50 L 50 42 L 60 50 L 54 48 L 50 49 L 46 48 Z" fill="${pal.void}" opacity="0.35"/>
${I2}<path d="M 38 62 L 44 70 L 56 70 L 62 62 L 54 74 L 46 74 Z" fill="url(#${p}-cloak)" opacity="0.7"/>
${I2}<path d="M 42 63 L 50 58 L 58 63 L 54 61 L 50 61 L 46 61 Z" fill="${pal.blood}" opacity="0.35"/>
${stars(31, 4, 50, 60, 10, 10, pal.teal, 0.45)}
${I2}<circle class="tm-aether-core" cx="50" cy="68" r="3.2" fill="url(#${p}-core)"/>
${I2}<circle class="tm-aether-core-ring" cx="50" cy="68" r="5.2" fill="none" stroke="${pal.teal}" stroke-width="0.55" opacity="0.45"/>
${I}    </g>
${I}    <g class="tm-aether-regalia">
${I2}<circle cx="50" cy="34" r="2.2" fill="url(#${p}-core)" opacity="0.95" filter="url(#${p}-glow)"/>
${I2}<path d="M 46 30 L 50 26 L 54 30 L 50 33 Z" fill="none" stroke="${pal.gold}" stroke-width="0.55" opacity="0.7"/>
${I}    </g>
${I}    <g class="tm-animate-arm-left">
${I2}<path d="M 33 60 L 27 64 L 29 70 L 34 65 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="0.75" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-arm-right">
${I2}<path d="M 67 60 L 73 64 L 71 70 L 66 65 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="0.75" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-leg-left">
${I2}<ellipse cx="44" cy="78" rx="3.2" ry="2.2" fill="${pal.dark}" opacity="0.7"/>
${I}    </g>
${I}    <g class="tm-animate-leg-right">
${I2}<ellipse cx="56" cy="78" rx="3.2" ry="2.2" fill="${pal.dark}" opacity="0.7"/>
${I}    </g>
${eyes(p, pal, { y: 52, dx: 6.5, rx: 3.4, ry: 4.2, fierce: true, browAngle: -1.2 })}
${mouth(pal, 60, 3, true)}
${I}</g>`;
}

/* evo1 — Veilspawn: short wide ragged husk */
function buildEvo1() {
  const p = 'aether-kid', pal = PAL.evo1;
  return `${I}<!-- AETHER KID — Veilspawn -->
${I}<g id="tm-mascot-evo1-aether" style="display: none;">
${I}    <defs>
${defs(p, pal)}
${I}    </defs>
${I}    <ellipse cx="50" cy="96" rx="17" ry="3.6" fill="#05010c" opacity="0.25"/>
${fxAura(p)}
${fxCorona(p, pal)}
${fxSparks(p, pal, 5, 41)}
${I}    <g class="tm-animate-wing-left">
${voidWingLeft(p, pal, { sx: 34, sy: 54, span: 30, blades: 4, lift: 2, crack: true, starSeed: 43 })}
${I}    </g>
${I}    <g class="tm-animate-wing-right">
${mirrored(voidWingLeft(p, pal, { sx: 34, sy: 54, span: 30, blades: 4, lift: 2, crack: true, starSeed: 44 }))}
${I}    </g>
${I}    <g class="tm-animate-tail">
${I2}<path d="M 56 78 Q 66 82 68 92 Q 60 88 54 82 Z" fill="url(#${p}-blade)" opacity="0.6"/>
${I2}<circle cx="67" cy="90" r="1.1" fill="${pal.gold}" opacity="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-body">
${I2}<path d="M 50 30 L 66 36 L 74 50 L 70 64 L 76 80 L 62 74 L 56 86 L 50 78 L 44 86 L 38 74 L 24 80 L 30 64 L 26 50 L 34 36 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.3"/>
${I2}<path d="M 50 36 L 62 40 L 68 52 L 64 64 L 68 76 L 50 70 L 32 76 L 36 64 L 32 52 L 38 40 Z" fill="url(#${p}-cloak)" opacity="0.5"/>
${stars(51, 9, 50, 58, 14, 16, pal.gold, 0.55)}
${I2}<path d="M 38 34 L 34 26 L 40 30 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.6"/>
${I2}<path d="M 62 34 L 66 26 L 60 30 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.6"/>
${I2}<circle class="tm-aether-core" cx="50" cy="62" r="4" fill="url(#${p}-core)"/>
${I2}<circle class="tm-aether-core-ring" cx="50" cy="62" r="6.4" fill="none" stroke="${pal.teal}" stroke-width="0.55" opacity="0.4"/>
${I}    </g>
${I}    <g class="tm-aether-regalia">
${I2}<path d="M 44 21 Q 50 17 56 21" fill="none" stroke="${pal.teal}" stroke-width="0.7" opacity="0.6" stroke-dasharray="1.6 1.4"/>
${I2}<circle cx="50" cy="18.5" r="1.4" fill="${pal.gold}" opacity="0.9" filter="url(#${p}-glow)"/>
${I}    </g>
${I}    <g class="tm-animate-arm-left">
${I2}<path d="M 34 54 Q 27 58 26 66 Q 31 62 35 59 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="0.8" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-arm-right">
${I2}<path d="M 66 54 Q 73 58 74 66 Q 69 62 65 59 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="0.8" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-leg-left">
${I2}<path d="M 43 84 Q 42 89 44 92 Q 46 89 45 84 Z" fill="${pal.mid}" opacity="0.45"/>
${I}    </g>
${I}    <g class="tm-animate-leg-right">
${I2}<path d="M 57 84 Q 58 89 56 92 Q 54 89 55 84 Z" fill="${pal.mid}" opacity="0.45"/>
${I}    </g>
${eyes(p, pal, { y: 44, dx: 6, rx: 3.1, ry: 4, fierce: true, browAngle: -1.4 })}
${mouth(pal, 53, 3.2, true)}
${I}</g>`;
}

/* evo2 — Astral Warden: hooded sentinel with blade wings */
function buildEvo2() {
  const p = 'aether-teen', pal = PAL.evo2;
  return `${I}<!-- AETHER TEEN — Astral Warden -->
${I}<g id="tm-mascot-evo2-aether" style="display: none;">
${I}    <defs>
${defs(p, pal)}
${I}    </defs>
${I}    <ellipse cx="50" cy="96" rx="19" ry="3.8" fill="#05010c" opacity="0.28"/>
${fxAura(p)}
${fxCorona(p, pal)}
${fxHaze(p, pal)}
${fxBeams(p, pal)}
${fxSigil(p, pal)}
${I}    <g class="tm-animate-wing-left">
${voidWingLeft(p, pal, { sx: 35, sy: 46, span: 38, blades: 5, lift: 6, crack: true, starSeed: 63 })}
${I}    </g>
${I}    <g class="tm-animate-wing-right">
${mirrored(voidWingLeft(p, pal, { sx: 35, sy: 46, span: 38, blades: 5, lift: 6, crack: true, starSeed: 64 }))}
${I}    </g>
${I}    <g class="tm-animate-tail">
${I2}<path d="M 54 80 C 62 84 64 92 60 97 C 59 91 55 86 51 83 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.7" opacity="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-body">
${I2}<path d="M 50 10 L 56 22 L 55 34 L 58 52 L 54 74 L 60 90 L 52 86 L 50 94 L 48 86 L 40 90 L 46 74 L 42 52 L 45 34 L 44 22 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.3"/>
${I2}<path d="M 50 16 L 53 26 L 53 36 L 55 52 L 52 72 L 50 78 L 48 72 L 45 52 L 47 36 L 47 26 Z" fill="url(#${p}-cloak)" opacity="0.62"/>
${constellation(71, [[46, 48], [49, 55], [47, 62], [51, 68], [54, 58], [52, 50]], pal.gold)}
${stars(72, 6, 50, 58, 5, 16, pal.hi, 0.45)}
${I2}<path d="M 44 32 L 36 26 L 32 32 L 38 36 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.7"/>
${I2}<path d="M 56 32 L 64 26 L 68 32 L 62 36 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.7"/>
${I2}<path d="M 44 35 L 38 32 L 34 34" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.7"/>
${I2}<path d="M 56 35 L 62 32 L 66 34" fill="none" stroke="${pal.gold}" stroke-width="0.5" opacity="0.7"/>
${I2}<path d="M 45 22 L 40 12 L 47 18 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.7"/>
${I2}<path d="M 55 22 L 60 12 L 53 18 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.7"/>
${I2}<path d="M 45 66 L 55 66 L 53 70 L 47 70 Z" fill="url(#${p}-goldrim)" opacity="0.85"/>
${runeTattoos(pal, 50, 60)}
${I2}<circle class="tm-aether-core" cx="50" cy="46" r="3.6" fill="url(#${p}-core)"/>
${I}    </g>
${I}    <g class="tm-aether-regalia">
${I2}<path d="M 47 27 L 50 24 L 53 27 L 50 30 Z" fill="${pal.gold}" opacity="0.95" filter="url(#${p}-glow)"/>
${I2}<path d="M 44 21 Q 50 16 56 21" fill="none" stroke="${pal.teal}" stroke-width="0.6" opacity="0.55" stroke-dasharray="1.4 1.6"/>
${I}    </g>
${I}    <g class="tm-animate-arm-left">
${I2}<path d="M 38 50 Q 30 56 29 66 L 32 64 L 31 70 L 35 66 Q 37 58 40 54 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="0.9"/>
${I2}<path d="M 27 65 L 25 70 M 30 66 L 29 71 M 33 65 L 33 70" fill="none" stroke="${pal.teal}" stroke-width="0.8" stroke-linecap="round" opacity="0.85"/>
${I}    </g>
${I}    <g class="tm-animate-arm-right">
${I2}<path d="M 62 50 Q 70 56 71 66 L 68 64 L 69 70 L 65 66 Q 63 58 60 54 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="0.9"/>
${I2}<path d="M 73 65 L 75 70 M 70 66 L 71 71 M 67 65 L 67 70" fill="none" stroke="${pal.teal}" stroke-width="0.8" stroke-linecap="round" opacity="0.85"/>
${I}    </g>
${I}    <g class="tm-animate-leg-left">
${I2}<path d="M 43 86 L 41 94 L 46 94 L 47 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-leg-right">
${I2}<path d="M 57 86 L 59 94 L 54 94 L 53 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${eyes(p, pal, { y: 36, dx: 5, rx: 2.9, ry: 3.4, fierce: true, browAngle: -1.4 })}
${mouth(pal, 44, 2.8, true)}
${fxOrbits(p, pal)}
${fxSparks(p, pal, 6, 75)}
${I}</g>`;
}

/* evo3 — Star Sovereign: crowned regent, halo, cathedral wings */
function buildEvo3() {
  const p = 'aether-adult', pal = PAL.evo3;
  return `${I}<!-- AETHER ADULT — Star Sovereign -->
${I}<g id="tm-mascot-evo3-aether" style="display: none;">
${I}    <defs>
${defs(p, pal)}
${I}    </defs>
${I}    <ellipse cx="50" cy="96" rx="21" ry="4" fill="#05010c" opacity="0.3"/>
${fxAura(p)}
${fxAuraOuter(p, pal)}
${fxCorona(p, pal)}
${fxHaze(p, pal)}
${fxBeams(p, pal)}
${fxSigil(p, pal)}
${fxRunes(p, pal)}
${fxFracture(p, pal)}
${brokenHalo(pal, 50, 26, 14, -22)}
${I}    <g class="tm-animate-wing-left">
${voidWingLeft(p, pal, { sx: 34, sy: 44, span: 44, blades: 6, lift: 12, crack: true, starSeed: 83 })}
${I}    </g>
${I}    <g class="tm-animate-wing-right">
${mirrored(voidWingLeft(p, pal, { sx: 34, sy: 44, span: 44, blades: 6, lift: 12, crack: true, starSeed: 84 }))}
${I}    </g>
${I}    <g class="tm-animate-tail">
${I2}<path d="M 50 82 C 56 88 58 94 54 99 C 52 94 49 90 45 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.7" opacity="0.85"/>
${I2}<path d="M 46 84 C 42 89 41 95 44 99 C 45 94 47 90 50 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.6" opacity="0.7"/>
${I}    </g>
${I}    <g class="tm-animate-body">
${I2}<path d="M 50 12 L 58 16 L 68 24 L 74 36 L 70 48 L 62 56 L 66 78 L 58 74 L 50 88 L 42 74 L 34 78 L 38 56 L 30 48 L 26 36 L 32 24 L 42 16 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.4"/>
${I2}<path d="M 50 20 L 56 24 L 64 32 L 66 40 L 60 50 L 62 72 L 50 66 L 38 72 L 40 50 L 34 40 L 36 32 L 44 24 Z" fill="url(#${p}-cloak)" opacity="0.66"/>
${constellation(91, [[42, 44], [47, 50], [44, 58], [50, 64], [56, 57], [53, 49], [58, 44]], pal.gold)}
${stars(92, 10, 50, 55, 12, 16, pal.hi, 0.5)}
${I2}<path d="M 38 30 L 26 22 L 18 30 L 28 36 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.8"/>
${I2}<path d="M 62 30 L 74 22 L 82 30 L 72 36 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.8"/>
${I2}<path d="M 38 34 L 28 30 L 22 33" fill="none" stroke="${pal.gold}" stroke-width="0.6" opacity="0.75"/>
${I2}<path d="M 62 34 L 72 30 L 78 33" fill="none" stroke="${pal.gold}" stroke-width="0.6" opacity="0.75"/>
${I2}<path d="M 44 66 L 56 66 L 54 71 L 46 71 Z" fill="url(#${p}-goldrim)" opacity="0.9"/>
${runeTattoos(pal, 50, 58)}
${I2}<circle class="tm-aether-core" cx="50" cy="44" r="5" fill="url(#${p}-core)" filter="url(#${p}-glow)"/>
${I2}<circle class="tm-aether-core-ring" cx="50" cy="44" r="8" fill="none" stroke="${pal.gold}" stroke-width="0.7" opacity="0.5"/>
${I}    </g>
${I}    <g class="tm-aether-regalia">
${crown(pal, 10, 5, 26)}
${I2}<path d="M 42 16 L 40 8 L 45 13 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.6"/>
${I2}<path d="M 58 16 L 60 8 L 55 13 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.6"/>
${I}    </g>
${I}    <g class="tm-animate-arm-left">
${I2}<path d="M 36 46 Q 26 52 24 64 L 28 61 L 27 68 L 32 63 Q 34 54 38 50 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1"/>
${I2}<path d="M 22 63 L 19 69 M 26 64 L 24 70 M 29 63 L 29 69" fill="none" stroke="${pal.gold}" stroke-width="0.9" stroke-linecap="round" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-arm-right">
${I2}<path d="M 64 46 Q 74 52 76 64 L 72 61 L 73 68 L 68 63 Q 66 54 62 50 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1"/>
${I2}<path d="M 78 63 L 81 69 M 74 64 L 76 70 M 71 63 L 71 69" fill="none" stroke="${pal.gold}" stroke-width="0.9" stroke-linecap="round" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-leg-left">
${I2}<path d="M 43 85 L 40 94 L 46 94 L 47 86 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-leg-right">
${I2}<path d="M 57 85 L 60 94 L 54 94 L 53 86 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${eyes(p, pal, { y: 30, dx: 5.2, rx: 3, ry: 3.4, fierce: true, browAngle: -1.6, irisFill: pal.gold })}
${mouth(pal, 38.5, 2.8, true)}
${fxOrbits(p, pal)}
${fxRibbons(p, pal)}
${fxSparks(p, pal, 7, 95)}
${I}</g>`;
}

/* evo4 — Eclipse Tyrant: black sun disc, jagged mantle, crescent eyes */
function buildEvo4() {
  const p = 'aether-mid', pal = PAL.evo4;
  const ghostWing = voidWingLeft(p, pal, { sx: 35, sy: 44, span: 32, blades: 4, lift: 8, crack: false, starSeed: 103, tatters: false });
  return `${I}<!-- AETHER MIDDLEAGE — Eclipse Tyrant -->
${I}<g id="tm-mascot-evo4-aether" style="display: none;">
${I}    <defs>
${defs(p, pal)}
${I}    </defs>
${I}    <ellipse cx="50" cy="96" rx="22" ry="4" fill="#05010c" opacity="0.35"/>
${fxAura(p)}
${fxAuraOuter(p, pal)}
${fxCorona(p, pal)}
${fxHaze(p, pal)}
${fxBeams(p, pal)}
${fxSigil(p, pal)}
${fxRunes(p, pal)}
${fxFracture(p, pal)}
${I}    <g class="tm-aether-regalia">
${I2}<circle class="tm-aether-eclipse" cx="50" cy="22" r="17" fill="#05010c" opacity="0.6"/>
${I2}<circle class="tm-aether-eclipse" cx="50" cy="22" r="17" fill="none" stroke="${pal.gold}" stroke-width="1.4" opacity="0.75"/>
${I2}<circle class="tm-aether-eclipse" cx="50" cy="22" r="20" fill="none" stroke="${pal.blood}" stroke-width="0.6" opacity="0.4" stroke-dasharray="1 3"/>
${crown(pal, 8, 5, 24)}
${I}    </g>
${I}    <g class="tm-aether-ghost-wing-left" opacity="0.28" transform="translate(-5 4) scale(1.12)">
${ghostWing}
${I}    </g>
${I}    <g class="tm-aether-ghost-wing-right" opacity="0.28" transform="translate(5 4) scale(1.12)">
${mirrored(ghostWing)}
${I}    </g>
${I}    <g class="tm-animate-wing-left">
${voidWingLeft(p, pal, { sx: 35, sy: 44, span: 46, blades: 7, lift: 10, crack: true, starSeed: 105 })}
${I}    </g>
${I}    <g class="tm-animate-wing-right">
${mirrored(voidWingLeft(p, pal, { sx: 35, sy: 44, span: 46, blades: 7, lift: 10, crack: true, starSeed: 106 }))}
${I}    </g>
${I}    <g class="tm-animate-tail">
${I2}<path d="M 50 82 C 58 87 61 94 57 99 C 54 94 50 90 45 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.7" opacity="0.85"/>
${I}    </g>
${I}    <g class="tm-animate-body">
${I2}<path d="M 50 8 L 62 18 L 78 28 L 70 38 L 82 48 L 70 60 L 78 84 L 60 78 L 50 92 L 40 78 L 22 84 L 30 60 L 18 48 L 30 38 L 22 28 L 38 18 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.4"/>
${I2}<path d="M 50 16 L 58 24 L 68 32 L 62 40 L 70 48 L 62 58 L 66 76 L 50 70 L 34 76 L 38 58 L 30 48 L 38 40 L 32 32 L 42 24 Z" fill="url(#${p}-cloak)" opacity="0.72"/>
${constellation(111, [[43, 42], [48, 48], [45, 56], [51, 62], [57, 55], [54, 47]], pal.blood)}
${stars(112, 8, 50, 52, 12, 14, pal.gold, 0.45)}
${I2}<path d="M 36 26 L 24 16 L 14 26 L 22 24 L 28 32 Z" fill="url(#${p}-cloak)" stroke="${pal.gold}" stroke-width="0.7"/>
${I2}<path d="M 64 26 L 76 16 L 86 26 L 78 24 L 72 32 Z" fill="url(#${p}-cloak)" stroke="${pal.gold}" stroke-width="0.7"/>
${I2}<path d="M 20 22 L 16 14 L 24 20 Z" fill="${pal.blood}" opacity="0.75"/>
${I2}<path d="M 80 22 L 84 14 L 76 20 Z" fill="${pal.blood}" opacity="0.75"/>
${I2}<path d="M 44 64 L 56 64 L 54 69 L 46 69 Z" fill="url(#${p}-goldrim)" opacity="0.8"/>
${runeTattoos(pal, 50, 56)}
${I2}<circle class="tm-aether-core" cx="50" cy="42" r="4.6" fill="url(#${p}-core)" filter="url(#${p}-glow)"/>
${I}    </g>
${I}    <g class="tm-animate-arm-left">
${I2}<path d="M 37 46 Q 26 52 23 66 L 28 62 L 27 70 L 33 64 Q 35 54 39 50 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1"/>
${I2}<path d="M 21 65 L 17 72 M 25 66 L 23 73 M 29 65 L 29 71" fill="none" stroke="${pal.blood}" stroke-width="1" stroke-linecap="round" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-arm-right">
${I2}<path d="M 63 46 Q 74 52 77 66 L 72 62 L 73 70 L 67 64 Q 65 54 61 50 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1"/>
${I2}<path d="M 79 65 L 83 72 M 75 66 L 77 73 M 71 65 L 71 71" fill="none" stroke="${pal.blood}" stroke-width="1" stroke-linecap="round" opacity="0.9"/>
${I}    </g>
${I}    <g class="tm-animate-leg-left">
${I2}<path d="M 43 86 L 39 95 L 46 95 L 47 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-leg-right">
${I2}<path d="M 57 86 L 61 95 L 54 95 L 53 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${eyes(p, pal, { y: 27, dx: 5.4, rx: 3, ry: 3.2, fierce: true, browAngle: -1.8, eclipse: true, crescentL: pal.gold, crescentR: pal.blood })}
${mouth(pal, 36, 2.6, true)}
${fxOrbits(p, pal, true)}
${fxRibbons(p, pal)}
${fxShards(p, pal)}
${fxSparks(p, pal, 8, 115)}
${I}</g>`;
}

/* evo5 — Primordial: asymmetric god-form, dominant + shattered wings */
function buildEvo5() {
  const p = 'aether-old', pal = PAL.evo5;
  const ghostWing = voidWingLeft(p, pal, { sx: 35, sy: 42, span: 34, blades: 4, lift: 10, crack: false, starSeed: 123, tatters: false });
  return `${I}<!-- AETHER OLD — Primordial -->
${I}<g id="tm-mascot-evo5-aether" style="display: none;">
${I}    <defs>
${defs(p, pal)}
${I}    </defs>
${I}    <ellipse cx="50" cy="96" rx="23" ry="4.2" fill="#05010c" opacity="0.38"/>
${fxAura(p)}
${fxAuraOuter(p, pal)}
${fxCorona(p, pal)}
${fxHaze(p, pal)}
${fxBeams(p, pal)}
${fxSigil(p, pal)}
${fxRunes(p, pal)}
${fxFracture(p, pal)}
${brokenHalo(pal, 50, 22, 16, -28)}
${I}    <g class="tm-aether-ghost-wing-left" opacity="0.28" transform="translate(-5 4) scale(1.14)">
${ghostWing}
${I}    </g>
${I}    <g class="tm-aether-ghost-wing-right" opacity="0.28" transform="translate(5 4) scale(1.14)">
${mirrored(ghostWing)}
${I}    </g>
${I}    <g class="tm-animate-wing-left tm-aether-wing-broken" transform="translate(50 52) scale(0.74) translate(-50 -52)">
${voidWingLeft(p, pal, { sx: 36, sy: 46, span: 34, blades: 4, lift: 6, crack: true, starSeed: 125 })}
${I2}<path class="tm-aether-wing-break" d="M 12 32 L 5 40 L 14 46" fill="none" stroke="${pal.blood}" stroke-width="1.1" stroke-dasharray="2 1.5" opacity="0.75"/>
${I2}<path class="tm-aether-wing-break" d="M 4 56 L 12 62 L 6 70" fill="none" stroke="${pal.gold}" stroke-width="0.85" stroke-dasharray="1.5 1.2" opacity="0.6"/>
${I2}<path d="M 6 30 L 10 25 L 12 31 Z" fill="url(#${p}-blade)" opacity="0.7"/>
${I2}<path d="M 0 46 L 5 42 L 6 49 Z" fill="url(#${p}-blade)" opacity="0.6"/>
${I2}<path d="M 8 64 L 13 61 L 13 68 Z" fill="url(#${p}-blade)" opacity="0.55"/>
${I}    </g>
${I}    <g class="tm-animate-wing-right tm-aether-wing-dominant" transform="translate(50 52) scale(1.38) translate(-50 -52)">
${mirrored(voidWingLeft(p, pal, { sx: 36, sy: 45, span: 48, blades: 8, lift: 14, crack: true, starSeed: 126 }))}
${I}    </g>
${I}    <g class="tm-animate-tail">
${I2}<path d="M 50 82 C 59 87 62 94 58 99 C 55 94 50 90 45 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.7" opacity="0.85"/>
${I2}<path d="M 46 84 C 40 89 39 96 43 99 C 44 94 46 90 49 87 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.6" opacity="0.7"/>
${I}    </g>
${I}    <g class="tm-animate-body">
${I2}<path d="M 48 6 L 56 10 L 64 18 L 72 30 L 78 46 L 76 64 L 84 90 L 64 82 L 52 96 L 42 86 L 28 90 L 34 68 L 26 52 L 30 34 L 36 20 L 42 10 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.5"/>
${I2}<path d="M 48 14 L 56 18 L 62 28 L 68 40 L 70 56 L 68 74 L 52 68 L 38 76 L 40 58 L 34 44 L 38 30 L 44 20 Z" fill="url(#${p}-cloak)" opacity="0.72"/>
${constellation(131, [[42, 40], [48, 46], [44, 54], [52, 62], [60, 52], [56, 44], [62, 38]], pal.gold)}
${stars(132, 12, 52, 52, 12, 18, pal.hi, 0.55)}
${I2}<path d="M 36 24 L 22 14 L 12 24 L 20 22 L 28 32 Z" fill="url(#${p}-cloak)" stroke="${pal.gold}" stroke-width="0.8"/>
${I2}<path d="M 62 22 L 76 10 L 90 22 L 80 20 L 72 30 Z" fill="url(#${p}-cloak)" stroke="${pal.gold}" stroke-width="0.8"/>
${I2}<path d="M 18 20 L 12 11 L 24 18 Z" fill="${pal.gold}" opacity="0.8"/>
${I2}<path d="M 82 18 L 88 8 L 76 16 Z" fill="${pal.gold}" opacity="0.8"/>
${I2}<path d="M 49 32 L 51 32 L 52 58 L 50 58 Z" fill="#ffffff" opacity="0.85" filter="url(#${p}-glow)"/>
${I2}<circle class="tm-aether-core" cx="52" cy="44" r="5.4" fill="url(#${p}-core)" filter="url(#${p}-glow)"/>
${I2}<circle class="tm-aether-core-ring" cx="52" cy="44" r="8.6" fill="none" stroke="${pal.gold}" stroke-width="0.8" opacity="0.55"/>
${I2}<path d="M 44 64 L 58 64 L 56 69 L 46 69 Z" fill="url(#${p}-goldrim)" opacity="0.9"/>
${runeTattoos(pal, 52, 57)}
${I}    </g>
${I}    <g class="tm-aether-regalia">
${crown(pal, 6, 7, 30, true)}
${I2}<path d="M 41 14 L 38 4 L 44 10 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.6"/>
${I2}<path d="M 59 14 L 62 4 L 56 10 Z" fill="url(#${p}-goldrim)" stroke="${pal.line}" stroke-width="0.6"/>
${I2}<path d="M 50 12 L 48 3 L 52 3 Z" fill="${pal.gold}" opacity="0.9" filter="url(#${p}-glow)"/>
${I}    </g>
${I}    <g class="tm-animate-arm-left">
${I2}<path d="M 36 44 Q 24 51 21 66 L 27 61 L 26 70 L 32 63 Q 34 53 38 48 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.1"/>
${I2}<path d="M 19 65 L 14 73 M 24 66 L 22 74 M 28 65 L 28 72" fill="none" stroke="${pal.teal}" stroke-width="1.1" stroke-linecap="round" opacity="0.95"/>
${I}    </g>
${I}    <g class="tm-animate-arm-right">
${I2}<path d="M 64 44 Q 76 51 79 66 L 73 61 L 74 70 L 68 63 Q 66 53 62 48 Z" fill="url(#${p}-body)" stroke="${pal.line}" stroke-width="1.1"/>
${I2}<path d="M 81 65 L 86 73 M 76 66 L 78 74 M 72 65 L 72 72" fill="none" stroke="${pal.teal}" stroke-width="1.1" stroke-linecap="round" opacity="0.95"/>
${I}    </g>
${I}    <g class="tm-animate-leg-left">
${I2}<path d="M 43 88 L 38 96 L 46 96 L 47 89 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${I}    <g class="tm-animate-leg-right">
${I2}<path d="M 57 88 L 62 96 L 54 96 L 53 89 Z" fill="url(#${p}-cloak)" stroke="${pal.line}" stroke-width="0.8"/>
${I}    </g>
${eyes(p, pal, { y: 26, dx: 5.4, rx: 3.1, ry: 3.3, fierce: true, browAngle: -1.8, eclipse: true, crescentL: '#f4ecd0', crescentR: pal.blood })}
${mouth(pal, 34.5, 2.6, true)}
${fxOrbits(p, pal, true)}
${fxRibbons(p, pal)}
${fxShards(p, pal)}
${fxSparks(p, pal, 9, 135)}
${I}</g>`;
}

/* ════════════════ assembly + self-check ════════════════ */

const HEADER = `${I}<!-- AETHER CHARACTER - All Life Stages (MYTHICAL evo line v9 · fallen voidblade · 3-seg wings) -->
${I}<!-- Voidseed → Veilspawn → Astral Warden → Star Sovereign → Eclipse Tyrant → Primordial -->
${I}<!-- ═══════════════════════════════════════ -->
`;

export const aetherSvg = [
  HEADER,
  buildBaby(), '',
  buildEvo1(), '',
  buildEvo2(), '',
  buildEvo3(), '',
  buildEvo4(), '',
  buildEvo5(), '',
].join('\n');

/* Required hook classes and data-fx groups per stage (from the original
 * sprite inventory — CSS/JS in myman_styles.js + myman_mascot.js target these). */
const COMMON = [
  'tm-animate-body', 'tm-animate-arm-left', 'tm-animate-arm-right',
  'tm-animate-leg-left', 'tm-animate-leg-right', 'tm-animate-tail',
  'tm-animate-wing-left', 'tm-animate-wing-right',
  'tm-mascot-eye-open', 'tm-mascot-eye-closed',
  'tm-mascot-mouth-happy', 'tm-mascot-mouth-sad',
  'tm-aether-core', 'tm-aether-eyes', 'tm-aether-eye-sclera',
  'tm-aether-fx', 'tm-aether-regalia', 'tm-aether-spark',
  'tm-aether-wing-claw', 'tm-aether-wing-membrane', 'tm-aether-wing-vein',
  'tm-aether-wing-root', 'tm-aether-wing-mid', 'tm-aether-wing-tip',
];
const REQUIRED = {
  baby: {
    classes: [...COMMON, 'tm-aether-core-ring', 'tm-aether-iris'],
    fx: ['sparks'],
  },
  evo1: {
    classes: [...COMMON, 'tm-aether-core-ring', 'tm-aether-iris', 'tm-aether-aura', 'tm-aether-corona', 'tm-aether-wing-crack'],
    fx: ['aura', 'corona', 'sparks'],
  },
  evo2: {
    classes: [...COMMON, 'tm-aether-iris', 'tm-aether-aura', 'tm-aether-corona', 'tm-aether-wing-crack',
      'tm-aether-beam-glow', 'tm-aether-beams', 'tm-aether-haze', 'tm-aether-haze-blob',
      'tm-aether-orbit', 'tm-aether-orbit-group', 'tm-aether-sigil'],
    fx: ['aura', 'beams', 'corona', 'haze', 'orbits', 'sigil', 'sparks'],
  },
  evo3: {
    classes: [...COMMON, 'tm-aether-core-ring', 'tm-aether-iris', 'tm-aether-aura', 'tm-aether-aura-outer', 'tm-aether-corona',
      'tm-aether-wing-crack', 'tm-aether-beam-glow', 'tm-aether-beams', 'tm-aether-haze', 'tm-aether-haze-blob',
      'tm-aether-orbit', 'tm-aether-orbit-group', 'tm-aether-sigil', 'tm-aether-crown-constellation', 'tm-aether-crown-star',
      'tm-aether-ground-fracture', 'tm-aether-halo', 'tm-aether-ribbon', 'tm-aether-ribbons',
      'tm-aether-rune-glyph', 'tm-aether-rune-ring', 'tm-aether-rune-tattoos', 'tm-aether-runes'],
    fx: ['aura', 'aura-outer', 'beams', 'corona', 'fracture', 'haze', 'orbits', 'ribbons', 'runes', 'sigil', 'sparks'],
  },
  evo4: {
    classes: [...COMMON, 'tm-aether-iris', 'tm-aether-aura', 'tm-aether-aura-outer', 'tm-aether-corona',
      'tm-aether-wing-crack', 'tm-aether-beam-glow', 'tm-aether-beams', 'tm-aether-haze', 'tm-aether-haze-blob',
      'tm-aether-orbit', 'tm-aether-orbit-group', 'tm-aether-orbit-node', 'tm-aether-sigil',
      'tm-aether-crown-constellation', 'tm-aether-crown-star', 'tm-aether-ground-fracture',
      'tm-aether-ribbon', 'tm-aether-ribbons', 'tm-aether-rune-glyph', 'tm-aether-rune-ring',
      'tm-aether-rune-tattoos', 'tm-aether-runes', 'tm-aether-shard', 'tm-aether-shards',
      'tm-aether-eclipse', 'tm-aether-eclipse-crescent', 'tm-aether-eclipse-pupil', 'tm-aether-eyes-eclipse',
      'tm-aether-ghost-wing-left', 'tm-aether-ghost-wing-right'],
    fx: ['aura', 'aura-outer', 'beams', 'corona', 'fracture', 'haze', 'orbits', 'ribbons', 'runes', 'shards', 'sigil', 'sparks'],
  },
  evo5: {
    classes: [...COMMON, 'tm-aether-core-ring', 'tm-aether-iris', 'tm-aether-aura', 'tm-aether-aura-outer', 'tm-aether-corona',
      'tm-aether-wing-crack', 'tm-aether-beam-glow', 'tm-aether-beams', 'tm-aether-haze', 'tm-aether-haze-blob',
      'tm-aether-orbit', 'tm-aether-orbit-group', 'tm-aether-orbit-node', 'tm-aether-sigil',
      'tm-aether-crown-constellation', 'tm-aether-crown-star', 'tm-aether-ground-fracture', 'tm-aether-halo',
      'tm-aether-ribbon', 'tm-aether-ribbons', 'tm-aether-rune-glyph', 'tm-aether-rune-ring',
      'tm-aether-rune-tattoos', 'tm-aether-runes', 'tm-aether-shard', 'tm-aether-shards',
      'tm-aether-eclipse-crescent', 'tm-aether-eclipse-pupil', 'tm-aether-eyes-eclipse',
      'tm-aether-ghost-wing-left', 'tm-aether-ghost-wing-right',
      'tm-aether-wing-break', 'tm-aether-wing-broken', 'tm-aether-wing-dominant'],
    fx: ['aura', 'aura-outer', 'beams', 'corona', 'fracture', 'haze', 'orbits', 'ribbons', 'runes', 'shards', 'sigil', 'sparks'],
  },
};

export function verifyAetherHooks(svg = aetherSvg) {
  const issues = [];
  for (const [stage, req] of Object.entries(REQUIRED)) {
    const id = `tm-mascot-${stage}-aether`;
    const start = svg.indexOf(`id="${id}"`);
    if (start < 0) { issues.push(`missing stage ${id}`); continue; }
    const next = svg.indexOf('id="tm-mascot-', start + 12);
    const chunk = svg.slice(start, next > 0 ? next : svg.length);
    for (const cls of req.classes) {
      if (!new RegExp(`class="[^"]*(?:^| )${cls}(?:$| |")`).test(chunk) && !chunk.includes(cls)) {
        issues.push(`${id} missing class ${cls}`);
      }
    }
    for (const fx of req.fx) {
      if (!chunk.includes(`data-fx="${fx}"`)) issues.push(`${id} missing data-fx ${fx}`);
    }
  }
  return issues;
}

const issues = verifyAetherHooks();
if (issues.length) {
  throw new Error('aether hook check failed:\n' + issues.join('\n'));
}
