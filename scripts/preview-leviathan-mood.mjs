import { writeFileSync } from 'fs';
import { leviathanSvg } from './svg-leviathan.mjs';

const stageArg = process.argv[2] || 'evo3';
const blocks = [...leviathanSvg.matchAll(/<g id="tm-mascot-([a-z0-9]+)-leviathan"[^>]*>([\s\S]*?)<\/g>\s*(?=(?:<!--|$))/g)];
const found = blocks.find((b) => b[1] === stageArg);
if (!found) throw new Error('stage not found: ' + stageArg);
const [, stage, inner] = found;

const moodInner = inner
  .replace('class="tm-mascot-mouth-happy">', 'class="tm-mascot-mouth-happy" style="display:none;">')
  .replace('class="tm-mascot-mouth-sad" style="display:none;">', 'class="tm-mascot-mouth-sad">')
  .replace('class="tm-mascot-eye-open tm-leviathan-eye">', 'class="tm-mascot-eye-open tm-leviathan-eye" style="display:none;">')
  .replace('class="tm-mascot-eye-closed" style="display:none;">', 'class="tm-mascot-eye-closed">');

const html = `<!DOCTYPE html><html><head><style>
body{background:#3a6b9c;margin:0;padding:24px;}
svg{background-image:linear-gradient(45deg,#fff 25%,transparent 25%),linear-gradient(-45deg,#fff 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#fff 75%),linear-gradient(-45deg,transparent 75%,#fff 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0px;background-color:#b8c4cc;}
</style></head><body>
<svg viewBox="0 0 100 100" width="900" height="900"><g>${moodInner}</g></svg>
</body></html>`;

writeFileSync('leviathan-solo.html', html);
console.log('wrote mood-sad/eye-closed variant for', stage);
