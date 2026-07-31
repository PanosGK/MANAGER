/**
 * Remap baked mascot SVG groups in myman_mascot.js to 3 evolutions:
 *   baby  → evo1
 *   evo3  → evo2
 *   evo4  → evo3
 * Drop old evo1, evo2, evo5 groups.
 */
import fs from 'fs';

const path = 'myman_mascot.js';
const chars = [
  'dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal', 'aether', 'leviathan',
];

function extractGroup(src, id) {
  const needle = `id="${id}"`;
  const idIdx = src.indexOf(needle);
  if (idIdx < 0) return null;
  // Walk back to opening <g
  let start = src.lastIndexOf('<g', idIdx);
  if (start < 0) return null;
  let i = start;
  let depth = 0;
  while (i < src.length) {
    if (src.startsWith('<g', i) && (src[i + 2] === ' ' || src[i + 2] === '>')) {
      depth += 1;
      i += 2;
      continue;
    }
    if (src.startsWith('</g>', i)) {
      depth -= 1;
      i += 4;
      if (depth === 0) {
        // include trailing newline if present
        let end = i;
        if (src[end] === '\r') end += 1;
        if (src[end] === '\n') end += 1;
        return { start, end, html: src.slice(start, end) };
      }
      continue;
    }
    i += 1;
  }
  return null;
}

function renameGroupId(html, fromId, toId) {
  return html.replace(`id="${fromId}"`, `id="${toId}"`);
}

let src = fs.readFileSync(path, 'utf8');
const issues = [];

for (const char of chars) {
  const baby = extractGroup(src, `tm-mascot-baby-${char}`);
  const evo3 = extractGroup(src, `tm-mascot-evo3-${char}`);
  const evo4 = extractGroup(src, `tm-mascot-evo4-${char}`);
  if (!baby || !evo3 || !evo4) {
    issues.push(`${char}: missing baby/evo3/evo4 (baby=${!!baby} evo3=${!!evo3} evo4=${!!evo4})`);
    continue;
  }

  // Collect ranges to remove: all 6 stage groups for this char
  const stages = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
  const ranges = [];
  for (const s of stages) {
    const g = extractGroup(src, `tm-mascot-${s}-${char}`);
    if (g) ranges.push(g);
  }
  ranges.sort((a, b) => b.start - a.start); // delete from end

  // Build replacements
  const newEvo1 = renameGroupId(baby.html, `tm-mascot-baby-${char}`, `tm-mascot-evo1-${char}`);
  const newEvo2 = renameGroupId(evo3.html, `tm-mascot-evo3-${char}`, `tm-mascot-evo2-${char}`);
  const newEvo3 = renameGroupId(evo4.html, `tm-mascot-evo4-${char}`, `tm-mascot-evo3-${char}`);
  const block = newEvo1 + newEvo2 + newEvo3;

  // Insert point = start of earliest stage group for this character
  const insertAt = Math.min(...ranges.map((r) => r.start));

  // Delete all old ranges
  for (const r of ranges) {
    src = src.slice(0, r.start) + src.slice(r.end);
  }
  // After deletions, insertAt still valid for the earliest (we deleted from end)
  src = src.slice(0, insertAt) + block + src.slice(insertAt);
  console.log(`remapped ${char}: baby→evo1, evo3→evo2, evo4→evo3 (dropped evo1/evo2/evo5)`);
}

if (issues.length) {
  console.error(issues);
  process.exit(1);
}

// Sanity: each char has evo1/2/3 and no baby/evo4/evo5/orphan evo ids for dropped
for (const char of chars) {
  for (const s of ['evo1', 'evo2', 'evo3']) {
    if (!src.includes(`id="tm-mascot-${s}-${char}"`)) {
      issues.push(`missing tm-mascot-${s}-${char}`);
    }
  }
  for (const s of ['baby', 'evo4', 'evo5']) {
    if (src.includes(`id="tm-mascot-${s}-${char}"`)) {
      issues.push(`still has tm-mascot-${s}-${char}`);
    }
  }
}
if (issues.length) {
  console.error('post-check failed', issues);
  process.exit(1);
}

fs.writeFileSync(path, src);
console.log('OK wrote', path, 'len', src.length);
