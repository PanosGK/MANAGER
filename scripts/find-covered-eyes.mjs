import fs from 'fs';

const s = fs.readFileSync(new URL('../myman_mascot.js', import.meta.url), 'utf8');
const ids = [...s.matchAll(/id="(tm-mascot-evo[123]-[a-z]+)"/g)].map((m) => m[1]);

function extract(id) {
  const re = new RegExp(`<g id="${id}"[^>]*>`);
  const m = s.match(re);
  if (!m) return null;
  const start = s.indexOf(m[0]);
  let i = start + m[0].length;
  let depth = 1;
  while (i < s.length && depth > 0) {
    const open = s.indexOf('<g ', i);
    const open2 = s.indexOf('<g>', i);
    const openAt = [open, open2].filter((x) => x >= 0).sort((a, b) => a - b)[0] ?? -1;
    const close = s.indexOf('</g>', i);
    if (close < 0) break;
    if (openAt >= 0 && openAt < close) {
      depth++;
      i = openAt + 3;
    } else {
      depth--;
      if (depth === 0) return s.slice(start, close + 4);
      i = close + 4;
    }
  }
  return null;
}

function parseAttrs(tag) {
  const o = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)="([^"]*)"/g)) o[m[1]] = m[2];
  return o;
}

function groupInner(g, classNeedle) {
  const idx = g.indexOf(classNeedle);
  if (idx < 0) return null;
  // walk back to the actual <g ...> that contains this class
  const tagStart = g.lastIndexOf('<g ', idx);
  if (tagStart < 0) return null;
  const tagEnd = g.indexOf('>', tagStart);
  let i = tagEnd + 1;
  let depth = 1;
  while (i < g.length && depth > 0) {
    const open = g.indexOf('<g ', i);
    const close = g.indexOf('</g>', i);
    if (close < 0) return null;
    if (open >= 0 && open < close) {
      depth++;
      i = open + 3;
    } else {
      depth--;
      if (depth === 0) return { inner: g.slice(tagEnd + 1, close), end: close + 4, start: tagStart };
      i = close + 4;
    }
  }
  return null;
}

function coversPoint(tag, x, y) {
  if (/opacity="0(?:\.0+)?(?:0+)?"/.test(tag)) return false;
  if (/fill="none"/.test(tag)) return false;
  if (/opacity="0\.0+1"/.test(tag)) return false; // hook dots
  const a = parseAttrs(tag);
  const cx = parseFloat(a.cx);
  const cy = parseFloat(a.cy);
  if (tag.startsWith('<circle')) {
    const r = parseFloat(a.r);
    if (![cx, cy, r].every(Number.isFinite) || r < 3) return false;
    return Math.hypot(x - cx, y - cy) < r * 0.9;
  }
  if (tag.startsWith('<ellipse')) {
    const rx = parseFloat(a.rx ?? a.r);
    const ry = parseFloat(a.ry ?? a.r);
    if (![cx, cy, rx, ry].every(Number.isFinite)) return false;
    if (rx < 4 && ry < 4) return false;
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy < 0.81;
  }
  return false;
}

let problems = 0;
for (const id of ids) {
  const g = extract(id);
  if (!g) {
    console.log(id, 'EXTRACT FAIL');
    continue;
  }
  const eye = groupInner(g, 'tm-mascot-eye-open');
  if (!eye) {
    console.log(id, 'NO EYE GROUP');
    problems++;
    continue;
  }
  const pts = [];
  for (const m of eye.inner.matchAll(/<(ellipse|circle)\b[^>]*>/g)) {
    const a = parseAttrs(m[0]);
    const cx = parseFloat(a.cx);
    const cy = parseFloat(a.cy);
    if (Number.isFinite(cx) && Number.isFinite(cy)) pts.push({ cx, cy });
  }
  if (!pts.length) {
    console.log(id, 'EMPTY EYES');
    problems++;
    continue;
  }
  const after = g.slice(eye.end);
  // also flag obvious head-after-eyes markers
  const headMarker = /<!--\s*Head\s*-->/i.test(after) || /<!--\s*head\s*-->/i.test(after);
  const shapes = [...after.matchAll(/<(ellipse|circle)\b[^>]*>/g)].map((m) => m[0]);
  const covered = [];
  const seen = new Set();
  for (const p of pts) {
    const key = `${p.cx},${p.cy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const sh of shapes) {
      if (coversPoint(sh, p.cx, p.cy)) {
        covered.push({ p, sh: sh.replace(/\s+/g, ' ').slice(0, 140) });
        break;
      }
    }
  }
  if (covered.length || headMarker) {
    problems++;
    console.log(`\n!! ${id}${headMarker ? ' (Head markup AFTER eyes)' : ''}`);
    for (const c of covered) console.log(`   covered (${c.p.cx},${c.p.cy}) by ${c.sh}`);
    if (!covered.length && headMarker) console.log('   (marker only — inspect manually)');
  } else {
    console.log(`ok ${id}`);
  }
}
console.log(`\n${problems} problem sprite(s)`);
