/**
 * Post-process mascot SVG in myman_mascot.js: move face layers inside tm-animate-body.
 */
import fs from 'fs';

const path = 'myman_mascot.js';
let src = fs.readFileSync(path, 'utf8');

const FACE_RE = /[ \t]*(?:<g class="tm-mascot-eye-(?:open|closed)"[\s\S]*?<\/g>|<path class="tm-mascot-mouth-(?:happy|sad)"[\s\S]*?\/>)/g;

function findGroupEnd(s, openIdx) {
  let depth = 1;
  let i = s.indexOf('>', openIdx) + 1;
  while (i < s.length) {
    const nextOpen = s.indexOf('<g', i);
    const nextClose = s.indexOf('</g>', i);
    if (nextClose < 0) return -1;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 2;
      continue;
    }
    depth--;
    if (depth === 0) return nextClose;
    i = nextClose + 4;
  }
  return -1;
}

function anchorChunk(chunk) {
  const openIdx = chunk.indexOf('<g class="tm-animate-body');
  if (openIdx < 0) return chunk;

  const bodyInnerStart = chunk.indexOf('>', openIdx) + 1;
  const bodyClose = findGroupEnd(chunk, openIdx);
  if (bodyClose < 0) return chunk;

  const beforeBody = chunk.slice(0, bodyInnerStart);
  const bodyInner = chunk.slice(bodyInnerStart, bodyClose);
  let afterBody = chunk.slice(bodyClose);

  const faces = [];
  afterBody = afterBody.replace(FACE_RE, (m) => {
    faces.push(m);
    return '';
  });
  if (!faces.length) return chunk;

  const trimmedFaces = faces.map((f) => f.trim()).filter(Boolean);
  if (trimmedFaces.every((f) => bodyInner.includes(f))) return chunk;

  const nl = bodyInner.includes('\r\n') ? '\r\n' : '\n';
  return beforeBody + bodyInner + trimmedFaces.join(nl) + nl + afterBody;
}

let count = 0;
const spriteRe = /<g id="tm-mascot-(?:baby|evo[1-5])-(?:dragon|robot|slime|plant|ghost|cat|phoenix|crystal|aether|leviathan)"[\s\S]*?(?=<g id="tm-mascot-|<\/g>\s*\r?\n\s*<!-- Integrated accessories)/g;
src = src.replace(spriteRe, (chunk) => {
  if (!chunk.includes('tm-mascot-eye-open') || !chunk.includes('tm-animate-body')) return chunk;
  const next = anchorChunk(chunk);
  if (next !== chunk) count++;
  return next;
});

fs.writeFileSync(path, src);
console.log(`anchored faces in ${count} mascot sprites`);
