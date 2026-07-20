import fs from 'fs';

const src = fs.readFileSync('myman_mascot.js', 'utf8');
const chars = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal', 'aether'];
const stages = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const missing = [];
for (const s of stages) {
  for (const c of chars) {
    const id = `tm-mascot-${s}-${c}`;
    if (!src.includes(`id="${id}"`)) missing.push(id);
  }
}

const lifeStages = ['egg', 'baby', 'kid', 'teen', 'adult', 'middleage', 'old'];
// Office-minutes thresholds (~12h/day × 15 days ≈ old)
const thresholds = { egg: 0, baby: 1, kid: 488, teen: 1350, adult: 2700, middleage: 5400, old: 10800, death: 36000 };

function stageFromMinutes(m) {
  if (m < thresholds.baby) return 'egg';
  if (m < thresholds.kid) return 'baby';
  if (m < thresholds.teen) return 'kid';
  if (m < thresholds.adult) return 'teen';
  if (m < thresholds.middleage) return 'adult';
  if (m < thresholds.old) return 'middleage';
  return 'old';
}

const stageToSprite = {
  egg: 'base',
  baby: 'baby',
  kid: 'evo1',
  teen: 'evo2',
  adult: 'evo3',
  middleage: 'evo4',
  old: 'evo5',
};

console.log('=== Mascot Sanity Check ===\n');
console.log('Sprites missing:', missing.length ? missing.join(', ') : 'none');
console.log('tm-mascot-base:', src.includes('id="tm-mascot-base"') ? 'ok' : 'MISSING');

console.log('\nStage threshold simulation:');
for (const [label, min] of Object.entries(thresholds)) {
  if (label === 'death') continue;
  const sprite = stageToSprite[label] || '?';
  const officeDays = (min / (60 * 12)).toFixed(min >= 720 ? 1 : 2);
  console.log(`  ${label.padEnd(10)} @ ${String(min).padStart(5)} office-min (~${officeDays}d @ 9–21) -> sprite tm-mascot-${sprite}-*`);
}

const testMinutes = [0, 0.9, 1, 487, 488, 1349, 1350, 2699, 2700, 5399, 5400, 10799, 10800, 35999, 36000];
console.log('\nBoundary office-minutes -> stage:');
for (const m of testMinutes) {
  console.log(`  ${String(m).padStart(7)} min -> ${stageFromMinutes(m)}`);
}

const setStates = [...src.matchAll(/setMascotState\([^,]+,\s*'([^']+)'/g)].map((m) => m[1]);
const uniqueStates = [...new Set(setStates)].sort();
console.log('\nBehavior states used in setMascotState:', uniqueStates.join(', '));

const cssInMascot = [...src.matchAll(/#tm-mascot-container\.mascot-([a-z-]+)/g)].map((m) => m[1]);
const cssUnique = [...new Set(cssInMascot)].sort();
console.log('CSS states in myman_mascot.js:', cssUnique.join(', '));

const issues = [];
if (missing.length) issues.push(`${missing.length} missing sprite IDs`);
if (!src.includes('function applyMascotBehaviorState')) issues.push('behavior state may wipe modifier classes');
if (!src.includes('if (!container || tamagotchiIsDead) return')) issues.push('evolution may run while dead');
if (!src.includes('if (tamagotchiIsDead || tamaCinematicLock) return')) issues.push('pet state may interrupt cinematics');
if (!src.includes('getOfficeMinutesBetween') || !src.includes('TAMA_OFFICE_HOUR_START')) {
  issues.push('office-hours life clock missing');
}

// Duplicate-instance / type-flip guards
const initGuards = {
  ensureSingleMascotDom: src.includes('function ensureSingleMascotDom'),
  initLock: src.includes('__tmMascotInitializing'),
  initFlag: src.includes('__tmMascotInitialized'),
  scopedSprites: src.includes('getMascotSpriteById'),
  noDragonFallback: !/previewCharacter = tamagotchiCharacterType && tamagotchiCharacterType !== 'none'\s*\n\s*\? tamagotchiCharacterType\s*\n\s*: 'dragon'/.test(src)
    && !src.includes(": 'dragon';"),
  noSaveReroll: !src.includes("ensureTamagotchiCharacterType({ allowRandom: true })")
    || (src.match(/ensureTamagotchiCharacterType\(\{\s*allowRandom:\s*true\s*\}\)/g) || []).length <= 1,
};

console.log('\nDuplicate mascot / type-flip guards:');
for (const [name, ok] of Object.entries(initGuards)) {
  console.log(`  ${ok ? 'OK ' : 'MISSING '} ${name}`);
  if (!ok) issues.push(`guard missing: ${name}`);
}

const initCallSites = (src.match(/initInteractiveMascot\s*\(/g) || []).length;
console.log(`\ninitInteractiveMascot call sites in myman_mascot.js: ${initCallSites} (definition only expected)`);

console.log('\nPotential code issues:', issues.length ? issues.join('; ') : 'none detected by static scan');
if (issues.length) process.exitCode = 1;
