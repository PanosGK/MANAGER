/**
 * Dragon sprites: move head art into tm-animate-body (faces already anchored there).
 */
import fs from 'fs';

const path = 'myman_mascot.js';
let src = fs.readFileSync(path, 'utf8');

const spriteRe = /<g id="tm-mascot-(?:baby|evo[1-5])-dragon"[\s\S]*?(?=<g id="tm-mascot-)/g;

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

function fixDragon(chunk) {
  const bodyOpen = chunk.indexOf('<g class="tm-animate-body');
  if (bodyOpen < 0) return chunk;
  const bodyClose = findGroupEnd(chunk, bodyOpen);
  if (bodyClose < 0) return chunk;

  const tail = chunk.slice(bodyClose);
  const headStart = tail.search(/\r?\n\s*<!-- Head/);
  if (headStart < 0) return chunk;

  const feetStart = tail.search(/\r?\n\s*<!-- Feet/);
  const legStart = tail.search(/\r?\n\s*<g class="tm-animate-leg-left"/);
  const sliceEnd = [feetStart, legStart].filter((n) => n >= 0).sort((a, b) => a - b)[0];
  if (sliceEnd == null || sliceEnd <= headStart) return chunk;

  const headBlock = tail.slice(headStart, sliceEnd);
  const cleanedHead = headBlock.replace(/\r?\n\s*<!-- Eyes -->\s*(\r?\n\s*)*/g, '\n');
  const beforeClose = chunk.slice(0, bodyClose);
  const afterHead = tail.slice(sliceEnd);
  const withoutHead = tail.slice(0, headStart) + afterHead;
  return beforeClose + cleanedHead + withoutHead;
}

let count = 0;
src = src.replace(spriteRe, (chunk) => {
  const next = fixDragon(chunk);
  if (next !== chunk) count++;
  return next;
});

fs.writeFileSync(path, src);
console.log(`fixed ${count} dragon sprites`);
