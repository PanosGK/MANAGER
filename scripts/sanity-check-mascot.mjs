import fs from 'fs';

const src = fs.readFileSync('myman_mascot.js', 'utf8');
const chars = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal'];
const stages = ['baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];
const missing = [];
for (const s of stages) {
  for (const c of chars) {
    const id = `tm-mascot-${s}-${c}`;
    if (!src.includes(`id="${id}"`)) missing.push(id);
  }
}

const lifeStages = ['egg', 'baby', 'kid', 'teen', 'adult', 'middleage', 'old'];
const thresholds = { egg: 0, baby: 5, kid: 65, teen: 180, adult: 360, middleage: 720, old: 1440, death: 4800 };

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
  console.log(`  ${label.padEnd(10)} @ ${String(min).padStart(4)} min -> sprite tm-mascot-${sprite}-*`);
}

const testMinutes = [0, 4.9, 5, 64, 65, 179, 180, 359, 360, 719, 720, 1439, 1440, 4799, 4800];
console.log('\nBoundary minutes -> stage:');
for (const m of testMinutes) {
  console.log(`  ${String(m).padStart(6)} min -> ${stageFromMinutes(m)}`);
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

console.log('\nPotential code issues:', issues.length ? issues.join('; ') : 'none detected by static scan');
