import fs from 'fs';

const s = fs.readFileSync(new URL('../myman_mascot.js', import.meta.url), 'utf8');
const chars = ['robot', 'dragon', 'phoenix', 'crystal', 'aether', 'leviathan'];
const stages = ['egg', 'evo1', 'evo2', 'evo3'];

function extract(id) {
  const re = new RegExp(`<g id="${id}"[^>]*>`);
  const m = s.match(re);
  if (!m) return null;
  const start = s.indexOf(m[0]);
  let i = start + m[0].length;
  let depth = 1;
  while (i < s.length && depth > 0) {
    const open = s.indexOf('<g', i);
    const close = s.indexOf('</g>', i);
    if (close < 0) break;
    if (open >= 0 && open < close) {
      depth++;
      i = open + 2;
    } else {
      depth--;
      if (depth === 0) return s.slice(start, close + 4);
      i = close + 4;
    }
  }
  return null;
}

function eyeOpenInners(g) {
  const out = [];
  const re = /<g class="tm-mascot-eye-open[^"]*"[^>]*>/g;
  let m;
  while ((m = re.exec(g))) {
    const start = m.index + m[0].length;
    let i = start;
    let depth = 1;
    while (i < g.length && depth > 0) {
      const open = g.indexOf('<g', i);
      const close = g.indexOf('</g>', i);
      if (close < 0) break;
      if (open >= 0 && open < close) {
        depth++;
        i = open + 2;
      } else {
        depth--;
        if (depth === 0) {
          out.push(g.slice(start, close));
          break;
        }
        i = close + 4;
      }
    }
  }
  return out;
}

for (const c of chars) {
  for (const st of stages) {
    const id = `tm-mascot-${st}-${c}`;
    const g = extract(id);
    if (!g) {
      console.log(`${id}: MISSING GROUP`);
      continue;
    }
    const inners = eyeOpenInners(g);
    const closed = (g.match(/tm-mascot-eye-closed/g) || []).length;
    const visible = g.includes('style="display:none;"') && g.includes('tm-mascot-eye-open')
      ? inners.some((inner) => !/<g[^>]*style="display:none/.test(g.slice(g.indexOf('tm-mascot-eye-open') - 50, g.indexOf('tm-mascot-eye-open') + 80)))
      : true;

    // open groups that themselves have display:none
    const openTags = [...g.matchAll(/<g class="tm-mascot-eye-open[^"]*"[^>]*>/g)].map((x) => x[0]);
    const hiddenOpens = openTags.filter((t) => /display\s*:\s*none/i.test(t)).length;

    let shapeCount = 0;
    let fillUrls = [];
    let solidFills = [];
    for (const inner of inners) {
      shapeCount += (inner.match(/<(ellipse|circle|path|rect)\b/g) || []).length;
      for (const f of inner.matchAll(/fill="([^"]+)"/g)) {
        if (f[1].startsWith('url(')) fillUrls.push(f[1]);
        else if (f[1] !== 'none') solidFills.push(f[1]);
      }
    }

    // resolve url fills against sprite defs + nearby
    const missing = [];
    for (const u of fillUrls) {
      const idMatch = u.match(/url\(#([^)]+)\)/);
      if (!idMatch) continue;
      const gid = idMatch[1];
      if (!s.includes(`id="${gid}"`) && !g.includes(`id="${gid}"`)) missing.push(gid);
    }

    // paint order: body-ish large shapes after last eye-open?
    const lastEye = g.lastIndexOf('class="tm-mascot-eye-open');
    const after = lastEye >= 0 ? g.slice(lastEye) : '';
    const coverCandidates = (after.match(/<(ellipse|circle|path)\b[^>]*(?:rx="(?:1[5-9]|[2-9]\d)"|r="(?:1[5-9]|[2-9]\d)")[^>]*>/g) || []).length;

    const flags = [];
    if (st !== 'egg' && inners.length === 0) flags.push('NO_OPEN_EYES');
    if (st !== 'egg' && shapeCount === 0) flags.push('EMPTY_OPEN_EYES');
    if (st !== 'egg' && solidFills.length === 0 && fillUrls.length === 0) flags.push('NO_FILLS');
    if (hiddenOpens && st !== 'egg') flags.push(`HIDDEN_OPEN=${hiddenOpens}`);
    if (missing.length) flags.push(`MISSING_DEFS=${missing.join(',')}`);
    if (coverCandidates > 0) flags.push(`LARGE_SHAPE_AFTER_EYES=${coverCandidates}`);
    if (st !== 'egg' && closed === 0) flags.push('NO_CLOSED');

    console.log(
      `${id.padEnd(28)} opens=${inners.length} shapes=${shapeCount} solids=${solidFills.length} urls=${fillUrls.length} closed=${closed}` +
        (flags.length ? `  !! ${flags.join(' | ')}` : '')
    );
    if (st !== 'egg' && solidFills.length) {
      const uniq = [...new Set(solidFills)].slice(0, 8);
      console.log(`  fills: ${uniq.join(', ')}`);
    }
  }
}
