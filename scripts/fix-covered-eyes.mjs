/**
 * Fix SVG paint order where face (eyes/mouth) was drawn before the head fill,
 * so the head ellipse covers the eyes (dragon evo2/evo3, plant evo1).
 */
import fs from 'fs';

const path = 'myman_mascot.js';
let src = fs.readFileSync(path, 'utf8');

function extractGroup(src, id) {
  const needle = `id="${id}"`;
  const idIdx = src.indexOf(needle);
  if (idIdx < 0) return null;
  let start = src.lastIndexOf('<g', idIdx);
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

function pullFaceBlock(html) {
  const eyeOpen = html.indexOf('<g class="tm-mascot-eye-open');
  if (eyeOpen < 0) throw new Error('no eye-open');
  // include eye-closed + both mouths that immediately follow (possibly without leading whitespace consistency)
  const mouthSad = html.indexOf('tm-mascot-mouth-sad', eyeOpen);
  if (mouthSad < 0) throw new Error('no mouth-sad');
  // end of mouth-sad element (path or g)
  const afterSad = html.indexOf('>', mouthSad);
  let end = afterSad + 1;
  // if it's an opening <g>, consume until </g>
  const tagStart = html.lastIndexOf('<', mouthSad);
  if (html.startsWith('<g', tagStart)) {
    const close = html.indexOf('</g>', afterSad);
    end = close + 4;
  }
  // trim trailing whitespace after face for cleaner insert
  let faceEnd = end;
  while (html[faceEnd] === '\r' || html[faceEnd] === '\n') faceEnd++;

  // also consume a following lone </g> that was closing body early? NO — leave that to caller.

  const face = html.slice(eyeOpen, end);
  const without = html.slice(0, eyeOpen) + html.slice(end);
  return { face: face.trimEnd() + '\n', without, eyeOpen };
}

function replaceId(src, id, newHtml) {
  const g = extractGroup(src, id);
  if (!g) throw new Error('missing ' + id);
  return src.slice(0, g.start) + newHtml + src.slice(g.end);
}

// ── Dragon evo2: move face after horns, before fang lines ──
{
  const id = 'tm-mascot-evo2-dragon';
  const g = extractGroup(src, id);
  let html = g.html;
  const { face, without } = pullFaceBlock(html);
  html = without;
  // Insert before fang paths (or before body close if fangs missing)
  const fang = html.indexOf('<path d="M 46 45 L 45 49"');
  const bodyClose = html.lastIndexOf('</g>\n                    <!-- Arms -->');
  const insertAt = fang >= 0 ? fang : bodyClose;
  if (insertAt < 0) throw new Error('dragon evo2 insert point missing');
  html = html.slice(0, insertAt) + face + html.slice(insertAt);
  // Ensure head comes before face: if <!-- Head --> still after face somehow, fail check
  const headIdx = html.indexOf('<!-- Head -->');
  const eyeIdx = html.indexOf('tm-mascot-eye-open');
  if (headIdx > eyeIdx) throw new Error('dragon evo2 still has head after eyes');
  src = replaceId(src, id, html);
  console.log('fixed', id);
}

// ── Dragon evo3: move face to <!-- Eyes --> placeholder after hat/mustache ──
{
  const id = 'tm-mascot-evo3-dragon';
  const g = extractGroup(src, id);
  let html = g.html;
  const { face, without } = pullFaceBlock(html);
  html = without;
  const marker = html.indexOf('<!-- Eyes -->');
  if (marker < 0) throw new Error('dragon evo3 Eyes marker missing');
  // insert after the marker line
  const lineEnd = html.indexOf('\n', marker);
  const insertAt = lineEnd >= 0 ? lineEnd + 1 : marker + '<!-- Eyes -->'.length;
  html = html.slice(0, insertAt) + face + html.slice(insertAt);
  const headIdx = html.indexOf('<!-- Dragon head under hat -->');
  const eyeIdx = html.indexOf('tm-mascot-eye-open');
  if (headIdx < 0 || headIdx > eyeIdx) throw new Error('dragon evo3 head/eye order wrong');
  src = replaceId(src, id, html);
  console.log('fixed', id);
}

// ── Plant evo1: move face after bulb head / cheeks ──
{
  const id = 'tm-mascot-evo1-plant';
  const g = extractGroup(src, id);
  let html = g.html;
  const { face, without } = pullFaceBlock(html);
  html = without;
  // After removing face, body may still need a close before arms. Original had </g> right after mouths.
  // Check if there's still a </g> before arms.
  const arms = html.indexOf('<!-- Tiny leaf arms -->');
  if (arms < 0) throw new Error('plant arms marker missing');
  // Ensure body is closed before arms: look backward for </g>
  const beforeArms = html.slice(0, arms);
  if (!/<\/g>\s*$/.test(beforeArms.trimEnd() + '\n') && !beforeArms.trimEnd().endsWith('</g>')) {
    // insert </g> before arms if body still open (stem ends, no close)
    // The original close was after mouths; pullFaceBlock left that </g>. Good.
  }
  // Insert face after last cheek circle (after bulb block)
  const cheekR = html.lastIndexOf('fill="url(#plant-baby-cheek)"/>');
  if (cheekR < 0) throw new Error('plant cheek missing');
  const insertAt = cheekR + 'fill="url(#plant-baby-cheek)"/>'.length;
  html = html.slice(0, insertAt) + '\n' + face + html.slice(insertAt);
  const bulbIdx = html.indexOf('<!-- Bulb head');
  const eyeIdx = html.indexOf('tm-mascot-eye-open');
  if (bulbIdx < 0 || bulbIdx > eyeIdx) throw new Error('plant evo1 bulb/eye order wrong');
  src = replaceId(src, id, html);
  console.log('fixed', id);
}

fs.writeFileSync(path, src);
console.log('wrote', path);
