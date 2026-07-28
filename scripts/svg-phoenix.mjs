/**
 * Ashborn Phoenix — v12 "Evolution Line"
 *
 * Pokémon-style evolution: every stage has its own silhouette and pose.
 *   baby  — chubby standing chick with stub wings and a tail puff
 *   evo1  — slim standing fledgling testing half-open wings
 *   evo2  — full flight raptor with spread wing fans
 *   evo3  — BOSS: giant wings, flowing tail streamers, sun-ray aura
 *   evo4  — charred warlord: jagged angular wings, glowing body cracks
 *   evo5  — solar seraph: double wing layers, halo, long divine streamers
 */
const I = '                ';
const I2 = I + '    ';
const I3 = I2 + '    ';
const I4 = I3 + '    ';

const STAGES = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const TITLES = {
  baby: 'Ember Chick', evo1: 'Flame Fledgling', evo2: 'Blaze Raptor',
  evo3: 'Ashborn Phoenix — BOSS', evo4: 'Cinder Warlord', evo5: 'Solar Seraph',
};

const CFG = {
  baby: { form: 'chick', scale: .896, crest: 3, tail: 3, aura: 0, embers: 3, rays: 0 },
  evo1: { form: 'fledgling', scale: .986, crest: 4, tail: 4, aura: 20, embers: 5, rays: 0 },
  evo2: { form: 'flyer', scale: 1.064, crest: 5, tail: 5, aura: 30, embers: 7, rays: 0, wingMult: 1, crestMult: 1.1 },
  evo3: { form: 'flyer', scale: 1.232, crest: 7, tail: 7, aura: 48, embers: 12, rays: 8, boss: true, wingMult: 1.24, wingLift: 6, crestMult: 1.5, streamers: 3 },
  evo4: { form: 'flyer', scale: 1.142, crest: 6, tail: 6, aura: 40, embers: 10, rays: 6, boss: true, charred: true, wingMult: 1.12, wingLift: 8, crestMult: 1.4, jagged: true },
  evo5: { form: 'flyer', scale: 1.254, crest: 9, tail: 8, aura: 56, embers: 15, rays: 12, boss: true, divine: true, wingMult: 1.18, wingLift: 6, crestMult: 1.5, streamers: 4, doubleWings: true, halo: true },
};

const PAL = {
  baby: { hi: '#ffd98f', mid: '#ffa73e', deep: '#e8651a', dark: '#8a2708' },
  evo1: { hi: '#ffc355', mid: '#ff8c1a', deep: '#dd3f09', dark: '#6b1504' },
  evo2: { hi: '#ffb63f', mid: '#ff7a10', deep: '#cf3206', dark: '#571003' },
  evo3: { hi: '#ffb300', mid: '#ff6f00', deep: '#c62815', dark: '#4a0a02' },
  evo4: { hi: '#d98e4a', mid: '#a84a12', deep: '#5d1e0a', dark: '#200705' },
  evo5: { hi: '#fff6d0', mid: '#ffe27a', deep: '#ffb300', dark: '#8a5a00' },
};

function defs(p, pal) {
  return `${I3}<linearGradient id="${p}-plum" x1="0%" y1="0%" x2="100%" y2="100%">
${I4}<stop offset="0%" style="stop-color:${pal.hi};stop-opacity:1" />
${I4}<stop offset="35%" style="stop-color:${pal.mid};stop-opacity:1" />
${I4}<stop offset="70%" style="stop-color:${pal.deep};stop-opacity:1" />
${I4}<stop offset="100%" style="stop-color:${pal.dark};stop-opacity:1" />
${I3}</linearGradient>
${I3}<linearGradient id="${p}-fire" x1="0%" y1="0%" x2="0%" y2="100%">
${I4}<stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
${I4}<stop offset="30%" style="stop-color:#ffd740;stop-opacity:1" />
${I4}<stop offset="65%" style="stop-color:#ff6d00;stop-opacity:1" />
${I4}<stop offset="100%" style="stop-color:#b71c1c;stop-opacity:1" />
${I3}</linearGradient>
${I3}<radialGradient id="${p}-core" cx="50%" cy="42%" r="60%">
${I4}<stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
${I4}<stop offset="30%" style="stop-color:#ffd740;stop-opacity:.95" />
${I4}<stop offset="65%" style="stop-color:#ff4e0a;stop-opacity:.55" />
${I4}<stop offset="100%" style="stop-color:#ff4e0a;stop-opacity:0" />
${I3}</radialGradient>
${I3}<linearGradient id="${p}-flameOut" x1="0%" y1="0%" x2="0%" y2="100%">
${I4}<stop offset="0%" style="stop-color:#b71c1c;stop-opacity:1" />
${I4}<stop offset="45%" style="stop-color:#e64a19;stop-opacity:1" />
${I4}<stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
${I3}</linearGradient>
${I3}<linearGradient id="${p}-flameIn" x1="0%" y1="0%" x2="0%" y2="100%">
${I4}<stop offset="0%" style="stop-color:#ffb300;stop-opacity:1" />
${I4}<stop offset="55%" style="stop-color:#ffd740;stop-opacity:1" />
${I4}<stop offset="100%" style="stop-color:#fffde7;stop-opacity:1" />
${I3}</linearGradient>
${I3}<linearGradient id="${p}-beak" x1="0%" y1="0%" x2="0%" y2="100%">
${I4}<stop offset="0%" style="stop-color:#ffe082;stop-opacity:1" />
${I4}<stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
${I3}</linearGradient>
${I3}<filter id="${p}-glow" x="-100%" y="-100%" width="300%" height="300%">
${I4}<feGaussianBlur stdDeviation="1.5" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>
${I3}<filter id="${p}-soft" x="-60%" y="-60%" width="220%" height="220%">
${I4}<feGaussianBlur stdDeviation=".6" result="b"/>
${I4}<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
${I3}</filter>`;
}

/** Tapered feather: base at (x,y), pointing along `angle` degrees. */
function feather(x, y, angle, length, width, p, fill, opacity = 1, jagged = false) {
  const rad = angle * Math.PI / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad), nx = -dy, ny = dx;
  const P = (px, py) => `${px.toFixed(1)} ${py.toFixed(1)}`;
  const tip = P(x + dx * length, y + dy * length);
  let d;
  if (jagged) {
    // Angular, torn silhouette: straight segments with an inward notch.
    d = `M ${P(x + nx * width * .5, y + ny * width * .5)} L ${P(x + dx * length * .42 + nx * width * .38, y + dy * length * .42 + ny * width * .38)} L ${P(x + dx * length * .55 + nx * width * .16, y + dy * length * .55 + ny * width * .16)} L ${P(x + dx * length * .74 + nx * width * .3, y + dy * length * .74 + ny * width * .3)} L ${tip} L ${P(x + dx * length * .5 - nx * width * .3, y + dy * length * .5 - ny * width * .3)} L ${P(x - nx * width * .5, y - ny * width * .5)} Z`;
  } else {
    d = `M ${P(x + nx * width * .5, y + ny * width * .5)} Q ${P(x + dx * length * .55 + nx * width * .28, y + dy * length * .55 + ny * width * .28)} ${tip} Q ${P(x + dx * length * .55 - nx * width * .28, y + dy * length * .55 - ny * width * .28)} ${P(x - nx * width * .5, y - ny * width * .5)} Z`;
  }
  return `${I4}<path d="${d}" fill="${fill}" stroke="#7b1308" stroke-width=".4" opacity="${opacity}" filter="url(#${p}-soft)"/>`;
}

function mirrored(inner) {
  return `${I4}<g transform="translate(100,0) scale(-1,1)">
${inner}
${I4}</g>`;
}

function crest(p, cx, cy, count, sizeMult = 1, jagged = false) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? .5 : i / (count - 1);
    const angle = -132 + t * 84;
    const len = (7 + (1 - Math.abs(t - .5) * 2) * 6) * sizeMult;
    parts.push(feather(cx, cy, angle, len, 2.1 * sizeMult, p, `url(#${p}-fire)`, .96, jagged));
  }
  return parts.join('\n');
}

function tailFan(p, cx, cy, count, baseLen, peak, width, jagged = false) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? .5 : i / (count - 1);
    const angle = 56 + t * 68;
    const len = baseLen + (1 - Math.abs(t - .5) * 2) * peak;
    parts.push(feather(cx, cy, angle, len, width, p, i % 2 ? `url(#${p}-fire)` : `url(#${p}-plum)`, .95, jagged));
  }
  return parts.join('\n');
}

/** Deterministic pseudo-random in [0,1) so the crackle is stable per build. */
function crackle(i, salt = 1) {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** Wavy upward flame tongue; base centered at (x,y). Returns the path `d`. */
function flameTongue(x, y, h, w, lean) {
  const P = (px, py) => `${px.toFixed(1)} ${py.toFixed(1)}`;
  const tipX = x + lean, tipY = y - h;
  return `M ${P(x - w * .5, y)} Q ${P(x - w * .62, y - h * .28)} ${P(x - w * .28, y - h * .46)} Q ${P(x + lean * .35 - w * .12, y - h * .62)} ${P(tipX, tipY)} Q ${P(x + lean * .3 + w * .18, y - h * .6)} ${P(x + w * .3, y - h * .42)} Q ${P(x + w * .62, y - h * .24)} ${P(x + w * .5, y)} Q ${P(x, y + h * .06)} ${P(x - w * .5, y)} Z`;
}

/**
 * Crackling fire ring: irregular flame tongues around the bird, leaning
 * upward like real fire, with a bright inner core inside each tongue
 * and stray sparks above the flames.
 */
function aura(cfg, p, cy) {
  if (!cfg.aura) return '';
  const rx = Math.min(cfg.aura * .8, 42);
  const ry = cfg.aura * .58;
  const count = Math.max(7, Math.min(16, Math.round(cfg.aura / 3.6)));
  const outer = [];
  const inner = [];
  const sparks = [];
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2 - Math.PI / 2 + (crackle(i, 5) - .5) * .3;
    const bx = 50 + Math.cos(theta) * rx;
    const by = cy + Math.sin(theta) * ry;
    // Flames rise: blend the radial direction with a strong upward pull.
    const dx = Math.cos(theta) * .55;
    const dy = Math.sin(theta) * .55 - .85;
    const rot = Math.atan2(dx, -dy) * 180 / Math.PI;
    const bottom = Math.sin(theta) > .35;
    const h = cfg.aura * (bottom ? .24 : .42) * (.65 + crackle(i, 2) * .7);
    const w = h * .46;
    const lean = (crackle(i, 3) - .5) * w * .9;
    const at = `transform="rotate(${rot.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)})"`;
    outer.push(`${I3}<path d="${flameTongue(bx, by, h, w, lean)}" ${at} fill="url(#${p}-flameOut)" opacity="${cfg.boss ? .8 : .62}" filter="url(#${p}-soft)"/>`);
    inner.push(`${I3}<path d="${flameTongue(bx, by, h * .56, w * .58, lean * .6)}" ${at} fill="url(#${p}-flameIn)" opacity="${cfg.boss ? .85 : .68}" filter="url(#${p}-soft)"/>`);
    if (crackle(i, 7) > .45 && !bottom) {
      const sx = bx + dx * h * (1.15 + crackle(i, 9) * .5);
      const sy = by + dy * h * (1.15 + crackle(i, 9) * .5);
      sparks.push(`${I3}<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(.5 + crackle(i, 11) * .7).toFixed(2)}" fill="${crackle(i, 13) > .5 ? '#ffd740' : '#ff6d00'}" opacity=".8" filter="url(#${p}-glow)"/>`);
    }
  }
  const heat = `${I3}<ellipse cx="50" cy="${cy}" rx="${(rx * 1.02).toFixed(1)}" ry="${(ry * 1.1).toFixed(1)}" fill="url(#${p}-core)" opacity="${cfg.boss ? .3 : .18}" filter="url(#${p}-glow)"/>`;
  return [heat, ...outer, ...inner, ...sparks].join('\n');
}

function embers(cfg, p) {
  const pts = [[13, 24], [20, 48], [85, 21], [91, 47], [24, 75], [80, 72], [35, 11], [73, 9], [9, 61], [93, 62], [42, 5], [66, 6], [17, 35], [87, 35], [31, 86]];
  return pts.slice(0, cfg.embers).map(([x, y], i) =>
    `${I3}<circle cx="${x}" cy="${y}" r="${i % 3 ? .75 : 1.2}" fill="${i % 2 ? '#ff6d00' : '#ffd740'}" opacity="${.32 + (i % 3) * .12}" filter="url(#${p}-soft)"/>`
  ).join('\n');
}

/** Front-facing eyes + beak. opts: eyeY, eyeDx, eyeR, browAngry, beakY, glow, fierce, iris */
function face(p, o) {
  const lx = 50 - o.eyeDx, rx = 50 + o.eyeDx;
  const iris = o.iris || '#ffd740';
  const brow = o.fierce
    // Heavy eyelid wedges cutting across the eyes = predator glare.
    ? `${I4}<path d="M ${lx - 2.8} ${o.eyeY - 3} L ${lx + 2.4} ${o.eyeY - .7} L ${lx - 2.8} ${o.eyeY - 1} Z" fill="#4a0a02"/>
${I4}<path d="M ${rx + 2.8} ${o.eyeY - 3} L ${rx - 2.4} ${o.eyeY - .7} L ${rx + 2.8} ${o.eyeY - 1} Z" fill="#4a0a02"/>
${I4}<path d="M ${lx - 3} ${o.eyeY - 3.2} L ${lx + 2.6} ${o.eyeY - .9}" fill="none" stroke="#2b0501" stroke-width=".7" stroke-linecap="round"/>
${I4}<path d="M ${rx + 3} ${o.eyeY - 3.2} L ${rx - 2.6} ${o.eyeY - .9}" fill="none" stroke="#2b0501" stroke-width=".7" stroke-linecap="round"/>`
    : o.browAngry
      ? `${I4}<path d="M ${lx - 2.4} ${o.eyeY - 3.6} L ${lx + 2.2} ${o.eyeY - 1.4}" fill="none" stroke="#751406" stroke-width="1" stroke-linecap="round"/>
${I4}<path d="M ${rx + 2.4} ${o.eyeY - 3.6} L ${rx - 2.2} ${o.eyeY - 1.4}" fill="none" stroke="#751406" stroke-width="1" stroke-linecap="round"/>`
      : `${I4}<path d="M ${lx - 1.8} ${o.eyeY - 2.6} Q ${lx} ${o.eyeY - 3.2} ${lx + 1.8} ${o.eyeY - 2.6}" fill="none" stroke="#8a3a10" stroke-width=".5" stroke-linecap="round" opacity=".7"/>
${I4}<path d="M ${rx - 1.8} ${o.eyeY - 2.6} Q ${rx} ${o.eyeY - 3.2} ${rx + 1.8} ${o.eyeY - 2.6}" fill="none" stroke="#8a3a10" stroke-width=".5" stroke-linecap="round" opacity=".7"/>`;
  const b = o.beakY;
  const bw = o.fierce ? 2.9 : o.eyeR > 2.2 ? 2 : 2.4;
  const pupil = o.fierce
    // Narrow vertical slit pupils.
    ? `${I4}<ellipse cx="${lx + .1}" cy="${o.eyeY + .15}" rx="${(o.eyeR * .24).toFixed(2)}" ry="${(o.eyeR * .85).toFixed(2)}" fill="#1b0502"/>
${I4}<ellipse cx="${rx + .1}" cy="${o.eyeY + .15}" rx="${(o.eyeR * .24).toFixed(2)}" ry="${(o.eyeR * .85).toFixed(2)}" fill="#1b0502"/>`
    : `${I4}<ellipse cx="${lx + .1}" cy="${o.eyeY + .1}" rx="${(o.eyeR * .4).toFixed(2)}" ry="${(o.eyeR * .72).toFixed(2)}" fill="#1b0502"/>
${I4}<ellipse cx="${rx + .1}" cy="${o.eyeY + .1}" rx="${(o.eyeR * .4).toFixed(2)}" ry="${(o.eyeR * .72).toFixed(2)}" fill="#1b0502"/>`;
  return `${I3}<g class="tm-mascot-eye-open">
${o.glow ? `${I4}<circle cx="${lx}" cy="${o.eyeY}" r="${o.eyeR + 1.2}" fill="${o.iris || '#ff6d00'}" opacity=".5" filter="url(#${p}-glow)"/>
${I4}<circle cx="${rx}" cy="${o.eyeY}" r="${o.eyeR + 1.2}" fill="${o.iris || '#ff6d00'}" opacity=".5" filter="url(#${p}-glow)"/>
` : ''}${I4}<circle cx="${lx}" cy="${o.eyeY}" r="${o.eyeR}" fill="${iris}" stroke="#5d1306" stroke-width=".45"/>
${I4}<circle cx="${rx}" cy="${o.eyeY}" r="${o.eyeR}" fill="${iris}" stroke="#5d1306" stroke-width=".45"/>
${pupil}
${I4}<circle cx="${lx - o.eyeR * .3}" cy="${o.eyeY - o.eyeR * .35}" r="${(o.eyeR * .22).toFixed(2)}" fill="#fffde7"/>
${I4}<circle cx="${rx - o.eyeR * .3}" cy="${o.eyeY - o.eyeR * .35}" r="${(o.eyeR * .22).toFixed(2)}" fill="#fffde7"/>
${brow}
${I3}</g>
${I3}<g class="tm-mascot-eye-closed" style="display:none;">
${I4}<path d="M ${lx - 1.5} ${o.eyeY} Q ${lx} ${o.eyeY - 1.2} ${lx + 1.5} ${o.eyeY}" fill="none" stroke="#5d1306" stroke-width=".9" stroke-linecap="round"/>
${I4}<path d="M ${rx - 1.5} ${o.eyeY} Q ${rx} ${o.eyeY - 1.2} ${rx + 1.5} ${o.eyeY}" fill="none" stroke="#5d1306" stroke-width=".9" stroke-linecap="round"/>
${I3}</g>
${I3}<path class="tm-mascot-mouth-happy" d="M ${50 - bw} ${b} Q 50 ${b - .8} ${50 + bw} ${b} L ${50 + bw * .5} ${b + 3.2} Q 50 ${b + 5.4} ${50 - .2} ${b + 6} Q ${50 - bw * .55} ${b + 4.6} ${50 - bw * .6} ${b + 3.2} Z" fill="url(#${p}-beak)" stroke="#8a5a00" stroke-width=".55" stroke-linejoin="round"/>
${I3}<path class="tm-mascot-mouth-sad" style="display:none;" d="M ${50 - bw} ${b + .5} Q 50 ${b - .3} ${50 + bw} ${b + .5} L ${50 + bw * .45} ${b + 4} Q 50 ${b + 6.2} ${50 - .3} ${b + 6.8} Q ${50 - bw * .5} ${b + 5.2} ${50 - bw * .55} ${b + 4} Z" fill="url(#${p}-beak)" stroke="#8a5a00" stroke-width=".55" stroke-linejoin="round"/>`;
}

/* ============================== BABY: chubby chick ============================== */
function buildChick(cfg, p) {
  const stubL = `${I4}<path d="M 38 48 Q 30 50 29 57 Q 33 61 39 58 Q 40.5 52 38 48 Z" fill="url(#${p}-plum)" stroke="#7b1308" stroke-width=".9"/>
${I4}<path d="M 37 51 Q 33 53 32.5 56.5" fill="none" stroke="#ffd98f" stroke-width=".6" opacity=".7"/>`;
  return `${I3}<g class="tm-animate-tail">
${tailFan(p, 50, 71, cfg.tail, 6, 3, 3)}
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${stubL}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${mirrored(stubL)}
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 34 C 40 35 36 44 36 54 C 36 66 42 73 50 74 C 58 73 64 66 64 54 C 64 44 60 35 50 34 Z" fill="url(#${p}-plum)" stroke="#7b1308" stroke-width="1.1"/>
${I4}<ellipse cx="50" cy="59" rx="7.5" ry="8" fill="url(#${p}-core)" opacity=".5" filter="url(#${p}-glow)"/>
${I4}<path d="M 44 62 Q 50 60 56 62 M 45.5 66.5 Q 50 64.8 54.5 66.5" fill="none" stroke="#8a2708" stroke-width=".45" opacity=".3"/>
${crest(p, 50, 34.5, cfg.crest, .8)}
${face(p, { eyeY: 46, eyeDx: 4.5, eyeR: 2.6, browAngry: true, beakY: 50.5, glow: false })}
${I3}</g>
${I3}<g class="tm-animate-arm-left" opacity=".001"><circle cx="38" cy="52" r=".4"/></g>
${I3}<g class="tm-animate-arm-right" opacity=".001"><circle cx="62" cy="52" r=".4"/></g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 46 73.5 L 46 78 M 46 78 L 44 81 M 46 78 L 46.3 81.4 M 46 78 L 48 81" fill="none" stroke="#d4a54a" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 54 73.5 L 54 78 M 54 78 L 56 81 M 54 78 L 53.7 81.4 M 54 78 L 52 81" fill="none" stroke="#d4a54a" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>`;
}

/* ========================= EVO1: standing fledgling ========================= */
function buildFledgling(cfg, p) {
  const fan = [[205, 14, 6], [190, 16, 6.5], [175, 17, 6.5], [160, 15, 6]];
  const wingL = `${fan.map(([a, len, w]) => feather(41, 48, a, len, w, p, `url(#${p}-plum)`, .97)).join('\n')}
${fan.slice(0, 3).map(([a, len, w]) => feather(41, 48, a + 4, len * .58, w * .85, p, `url(#${p}-fire)`, .85)).join('\n')}`;
  return `${I3}<g class="tm-animate-tail">
${tailFan(p, 50, 68, cfg.tail, 10, 5, 3.6)}
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${wingL}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${mirrored(wingL)}
${I3}</g>
${I3}<g class="tm-animate-body">
${I4}<path d="M 50 34 C 43 36 40 44 41 54 C 42 63 46 69 50 70 C 54 69 58 63 59 54 C 60 44 57 36 50 34 Z" fill="url(#${p}-plum)" stroke="#7b1308" stroke-width="1.1"/>
${I4}<ellipse cx="50" cy="55" rx="6" ry="7" fill="url(#${p}-core)" opacity=".55" filter="url(#${p}-glow)"/>
${I4}<path d="M 45 50 Q 50 48 55 50 M 45.5 57 Q 50 55 54.5 57" fill="none" stroke="#6b1504" stroke-width=".45" opacity=".3"/>
${crest(p, 50, 34, cfg.crest, .9)}
${face(p, { eyeY: 43.5, eyeDx: 4, eyeR: 2.1, browAngry: true, beakY: 48, glow: false })}
${I3}</g>
${I3}<g class="tm-animate-arm-left" opacity=".001"><circle cx="41" cy="48" r=".4"/></g>
${I3}<g class="tm-animate-arm-right" opacity=".001"><circle cx="59" cy="48" r=".4"/></g>
${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 46.5 69.5 L 46.2 74.5 M 46.2 74.5 L 44.2 77.4 M 46.2 74.5 L 46.5 77.8 M 46.2 74.5 L 48.2 77.4" fill="none" stroke="#d4a54a" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 53.5 69.5 L 53.8 74.5 M 53.8 74.5 L 55.8 77.4 M 53.8 74.5 L 53.5 77.8 M 53.8 74.5 L 51.8 77.4" fill="none" stroke="#d4a54a" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>`;
}

/* ===================== EVO2-5: flying raptor variants ===================== */
function flyerWingArt(cfg, p) {
  const m = cfg.wingMult || 1;
  const lift = cfg.wingLift || 0;
  const fan = [
    [213 + lift, 35, 11], [202 + lift, 36, 11.5], [191 + lift, 35, 11],
    [180 + lift, 33, 10.5], [169 + lift, 30, 10], [158 + lift, 26, 9], [147 + lift, 21, 8],
  ];
  const layer = (lenMult, opacity, fill) => fan.map(([a, len, w]) =>
    feather(43, 43, a, len * m * lenMult, w * lenMult, p, fill, opacity, cfg.jagged)).join('\n');
  const back = cfg.doubleWings
    ? fan.map(([a, len, w]) =>
      feather(45, 45, a + 8, len * m * 1.16, w * 1.05, p, `url(#${p}-fire)`, .55, false)).join('\n') + '\n'
    : '';
  const coverts = fan.slice(0, 6).map(([a, len, w]) =>
    feather(43, 43, a + 4, len * m * .58, w * .85, p, `url(#${p}-fire)`, .85, cfg.jagged)).join('\n');
  return `${back}${layer(1, .97, `url(#${p}-plum)`)}
${coverts}
${I4}<path d="M 47 40 Q 41 39 37.5 43.5 Q 40 49 46 50 Q 48.5 45 47 40 Z" fill="url(#${p}-plum)" stroke="#7b1308" stroke-width=".8"/>`;
}

function buildFlyer(cfg, p) {
  const stroke = cfg.charred ? '#2b100d' : '#7b1308';
  const wingL = flyerWingArt(cfg, p);
  const streamers = cfg.streamers
    ? (cfg.streamers === 3 ? [[74, 26], [90, 32], [106, 26]] : [[70, 26], [83, 33], [97, 33], [110, 26]])
      .map(([a, len]) => feather(50, 63, a, len, 2.4, p, `url(#${p}-fire)`, .92)).join('\n') + '\n'
    : '';
  const cracks = cfg.charred
    ? `${I4}<path d="M 47 45 L 48.8 49.5 L 47.4 54 M 53.2 47 L 51.6 51.5 L 53 56 M 50 58 L 49 61.5" fill="none" stroke="#ff6d00" stroke-width=".55" opacity=".85" filter="url(#${p}-glow)"/>
` : '';
  const halo = cfg.halo
    ? `${I3}<ellipse cx="50" cy="18.5" rx="7.5" ry="2.2" fill="none" stroke="#ffd740" stroke-width="1.1" opacity=".85" filter="url(#${p}-glow)"/>
` : '';
  return `${I3}<g class="tm-animate-tail">
${streamers}${tailFan(p, 50, 62, cfg.tail, 16, 12, 4.6, cfg.jagged)}
${I3}</g>
${I3}<g class="tm-animate-wing-left">
${wingL}
${I3}</g>
${I3}<g class="tm-animate-wing-right">
${mirrored(wingL)}
${I3}</g>
${halo}${I3}<g class="tm-animate-body">
${I4}<path d="M 50 35 C 42.5 38.5 40.5 46 42 54 C 43.5 61 47 65.5 50 66.5 C 53 65.5 56.5 61 58 54 C 59.5 46 57.5 38.5 50 35 Z" fill="url(#${p}-plum)" stroke="${stroke}" stroke-width="1.1"/>
${I4}<path d="M 44.5 45 Q 50 42.8 55.5 45 M 44 52 Q 50 49.8 56 52 M 46 59 Q 50 57 54 59" fill="none" stroke="${stroke}" stroke-width=".45" opacity=".3"/>
${I4}<ellipse cx="50" cy="51" rx="6.5" ry="8" fill="url(#${p}-core)" opacity="${cfg.boss ? .9 : .6}" filter="url(#${p}-glow)"/>
${cracks}${I4}<path d="M 43 30 Q 43 23 50 22 Q 57 23 57 30 Q 56 36 50 37 Q 44 36 43 30 Z" fill="url(#${p}-plum)" stroke="${stroke}" stroke-width="1"/>
${crest(p, 50, 23, cfg.crest, cfg.crestMult || 1, !!cfg.boss)}
${face(p, { eyeY: 28.8, eyeDx: 3.2, eyeR: 1.7, fierce: true, iris: cfg.charred ? '#ff5252' : '#ffab00', beakY: 32.8, glow: true })}
${I3}</g>
${I3}<g class="tm-animate-arm-left" opacity=".001"><circle cx="44" cy="48" r=".4"/></g>
${I3}<g class="tm-animate-arm-right" opacity=".001"><circle cx="56" cy="48" r=".4"/></g>
${cfg.boss ? `${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 46.5 63 Q 44.3 65.5 44.7 68.5 M 44.7 68.5 Q 42.2 70 41 72.8 L 40.4 74.2 M 44.7 68.5 Q 44.9 71.6 44.2 74 L 43.9 75.4 M 44.7 68.5 Q 47 70.6 48.2 73 L 48.8 74.4" fill="none" stroke="#d4a54a" stroke-width="1.6" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 53.5 63 Q 55.7 65.5 55.3 68.5 M 55.3 68.5 Q 57.8 70 59 72.8 L 59.6 74.2 M 55.3 68.5 Q 55.1 71.6 55.8 74 L 56.1 75.4 M 55.3 68.5 Q 53 70.6 51.8 73 L 51.2 74.4" fill="none" stroke="#d4a54a" stroke-width="1.6" stroke-linecap="round"/>
${I3}</g>` : `${I3}<g class="tm-animate-leg-left">
${I4}<path d="M 47 64 Q 45.5 66 45.8 68 M 45.8 68 L 43.8 69.8 M 45.8 68 L 46 70.6 M 45.8 68 L 47.8 69.6" fill="none" stroke="#d4a54a" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>
${I3}<g class="tm-animate-leg-right">
${I4}<path d="M 53 64 Q 54.5 66 54.2 68 M 54.2 68 L 56.2 69.8 M 54.2 68 L 54 70.6 M 54.2 68 L 52.2 69.6" fill="none" stroke="#d4a54a" stroke-width="1.3" stroke-linecap="round"/>
${I3}</g>`}`;
}

const BUILDERS = { chick: buildChick, fledgling: buildFledgling, flyer: buildFlyer };

function stageSvg(stage) {
  const cfg = CFG[stage];
  const pal = PAL[stage];
  const p = `phoenix-${stage}`;
  const standing = cfg.form !== 'flyer';
  const shadowY = standing ? 84 : 94;
  const auraCy = standing ? 52 : 46;
  const svg = `${I3}<ellipse cx="50" cy="${shadowY}" rx="${cfg.boss ? 40 : standing ? 17 : 28}" ry="4.4" fill="#120303" opacity="${cfg.boss ? .45 : .26}"/>
${aura(cfg, p, auraCy)}
${embers(cfg, p)}
${I3}<g transform="translate(50 50) scale(${cfg.scale}) translate(-50 -50)">
${BUILDERS[cfg.form](cfg, p)}
${I3}</g>`;
  return `${I}<!-- PHOENIX ${stage.toUpperCase()} — ${TITLES[stage]} -->
${I}<g id="tm-mascot-${stage}-phoenix" style="display: none;">
${I2}<defs>
${defs(p, pal)}
${I2}</defs>
${svg}
${I}</g>
`;
}

export const phoenixSvg = [
  `${I}<!-- PHOENIX CHARACTER - All Life Stages (evolution line v12 · distinct silhouettes per stage) -->`,
  `${I}<!-- chick > fledgling > blaze raptor > BOSS streamers > charred warlord > solar seraph -->`,
  '',
  ...STAGES.map(stageSvg),
].join('\n');
