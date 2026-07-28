import fs from 'fs';

const path = 'myman_mascot.js';
let src = fs.readFileSync(path, 'utf8');
const spriteRe = /<g id="tm-mascot-(?:baby|evo[1-5])-dragon"[\s\S]*?(?=<g id="tm-mascot-)/g;

function fix(chunk) {
  const open = chunk.indexOf('<g class="tm-animate-body');
  if (open < 0) return chunk;
  const eye = chunk.indexOf('<g class="tm-mascot-eye-open"', open);
  const head = chunk.search(/<!-- Head/);
  if (eye < 0 || head < 0 || head < eye) return chunk;

  const mouthEnd = chunk.indexOf('/>', chunk.lastIndexOf('tm-mascot-mouth-sad', open)) + 2;
  const face = chunk.slice(eye, mouthEnd);
  const headEnd = chunk.indexOf('\n', chunk.lastIndexOf('baby-dragon-cheek)', head));
  const headBlock = chunk.slice(head, headEnd > head ? headEnd : chunk.indexOf('</g>', head));

  return chunk.slice(0, eye) + headBlock + '\n' + face + '\n' + chunk.slice(mouthEnd, head) + chunk.slice(headEnd > head ? headEnd : chunk.indexOf('</g>', head));
}

let n = 0;
src = src.replace(spriteRe, (c) => {
  const r = fix(c);
  if (r !== c) n++;
  return r;
});
fs.writeFileSync(path, src);
console.log('reordered', n);
