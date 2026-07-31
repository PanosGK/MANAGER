/**
 * Surgical logic patches for 3-evolution remake (after sprite remap).
 * Avoids touching SVG path geometry by operating on known JS patterns only.
 */
import fs from 'fs';

const path = 'myman_mascot.js';
let s = fs.readFileSync(path, 'utf8');

function rep(re, to, label) {
  const before = s;
  s = s.replace(re, to);
  if (s === before) console.warn('no match:', label);
  else console.log('ok:', label);
}

// Force-hatch / warm egg stage assignments
rep(/tamagotchiStage = 'baby'/g, "tamagotchiStage = 'evo1'", "stage=baby→evo1 assign");
rep(/updateMascotAppearanceByStage\('baby'\)/g, "updateMascotAppearanceByStage('evo1')", "appear baby→evo1");
rep(/playAetherStageCinematic\('baby'/g, "playAetherStageCinematic('evo1'", "aether hatch evo1");
rep(/playPhoenixStageCinematic\('baby'/g, "playPhoenixStageCinematic('evo1'", "phoenix hatch evo1");
rep(/tamagotchiStage !== 'baby'/g, "tamagotchiStage !== 'evo1'", "!== baby");
rep(/tamagotchiStage === 'baby'/g, "tamagotchiStage === 'evo1'", "=== baby");

// Final-form comparisons
rep(/tamagotchiStage === 'old'/g, "tamagotchiStage === 'evo3'", "=== old→evo3");
rep(/tamagotchiStage !== 'old'/g, "tamagotchiStage !== 'evo3'", "!== old→evo3");
rep(/playAetherStageCinematic\('old'/g, "playAetherStageCinematic('evo3'", "aether old→evo3");
rep(/playPhoenixStageCinematic\('old'/g, "playPhoenixStageCinematic('evo3'", "phoenix old→evo3");
rep(/playGenericStageCinematic\('old'\)/g, "playGenericStageCinematic('evo3')", "generic old→evo3");

// Threshold leftovers
rep(/TAMA_STAGE_MINUTES\.old/g, 'TAMA_STAGE_MINUTES.evo3', 'minutes.old→evo3');

// Sprite key fallbacks
rep(/TAMA_STAGE_TO_SPRITE_KEY\[stage\] \|\| 'baby'/g, "TAMA_STAGE_TO_SPRITE_KEY[stage] || 'evo1'", "sprite key fallback");
rep(/getMascotSpriteIdForStage[\s\S]{0,80}\|\| 'baby'/g, (m) => m.replace("'baby'", "'evo1'"), "getMascotSpriteId fallback");

// resolveLifeMinutesFromSave — drop age-years recovery
rep(
  /return stageFloor \+ Math\.max\(0, \(savedData\.age \|\| 0\) \* TAMA_MINUTES_PER_YEAR\);/g,
  'return stageFloor;',
  'resolveLife no age years A',
);
rep(
  /const floor = TAMA_STAGE_MINUTES\[stage !== 'egg' \? stage : 'baby'\] \?\? TAMA_STAGE_MINUTES\.evo1;\s*const recovered = Math\.max\(floor, Math\.max\(0, \(savedData\.age \|\| 0\) \* TAMA_MINUTES_PER_YEAR\)\);/g,
  "const floor = TAMA_STAGE_MINUTES[stage !== 'egg' ? stage : 'evo1'] ?? TAMA_STAGE_MINUTES.evo1;\n        const recovered = floor;",
  'resolveLife no age years B',
);

// Death revive penalty used years — convert to evo2→evo3 gap style minutes chunk
rep(
  /tamagotchiLifeMinutes = Math\.max\(TAMA_STAGE_MINUTES\.evo1, tamagotchiLifeMinutes - TAMA_MINUTES_PER_YEAR\);/g,
  'tamagotchiLifeMinutes = Math.max(TAMA_STAGE_MINUTES.evo1, tamagotchiLifeMinutes - Math.max(60, Math.round((TAMA_STAGE_MINUTES.evo2 - TAMA_STAGE_MINUTES.evo1) * 0.15)));',
  'revive life penalty',
);

// CSS class lists
rep(
  /'mascot-egg', 'mascot-baby', 'mascot-kid', 'mascot-teen',\s*'mascot-adult', 'mascot-middleage', 'mascot-old', 'mascot-child'/g,
  "'mascot-egg', 'mascot-evo1', 'mascot-evo2', 'mascot-evo3'",
  'class list A',
);
rep(
  /'mascot-baby', 'mascot-kid', 'mascot-child', 'mascot-adult', 'mascot-egg',\s*'mascot-teen', 'mascot-middleage', 'mascot-old'/g,
  "'mascot-egg', 'mascot-evo1', 'mascot-evo2', 'mascot-evo3'",
  'class list B',
);
rep(
  /robot\.classList\.remove\('mascot-baby', 'mascot-kid', 'mascot-teen', 'mascot-adult', 'mascot-middleage', 'mascot-old', 'mascot-child'\);/g,
  "robot.classList.remove('mascot-evo1', 'mascot-evo2', 'mascot-evo3');",
  'robot remove classes',
);

// Appearance switch
rep(
  /const allStages = \['base', 'baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'\];/g,
  "const allStages = ['base', 'evo1', 'evo2', 'evo3'];",
  'allStages',
);
rep(
  /switch \(stage\) \{\s*case 'baby': stageId = 'baby'; break;\s*case 'kid': stageId = 'evo1'; break;\s*case 'teen': stageId = 'evo2'; break;\s*case 'adult': stageId = 'evo3'; break;\s*case 'middleage': stageId = 'evo4'; break;\s*case 'old': stageId = 'evo5'; break;\s*default: stageId = 'baby';\s*\}/g,
  `switch (stage) {
        case 'evo1': stageId = 'evo1'; break;
        case 'evo2': stageId = 'evo2'; break;
        case 'evo3': stageId = 'evo3'; break;
        default: stageId = 'evo1';
    }`,
  'appearance switch',
);

// Age preview defaults
rep(
  /TAMA_LIFE_STAGE_ORDER\.includes\(tamagotchiStage\) \? tamagotchiStage : 'baby'/g,
  "TAMA_LIFE_STAGE_ORDER.includes(tamagotchiStage) ? tamagotchiStage : 'evo1'",
  'preview default stage',
);
rep(/<h2 id="tm-age-prev-title">Age Preview<\/h2>/g, '<h2 id="tm-age-prev-title">Evolution Preview</h2>', 'preview title');
rep(
  /οι εξελίξεις ξεκλειδώνουν καθώς μεγαλώνει\./g,
  'οι εξελίξεις ξεκλειδώνουν καθώς προχωρά.',
  'preview subtitle',
);

// Care panel age → evolution
rep(
  /\$\{isEgg \? `Εκκόλαψη ~\$\{minutesToHatch\} λεπτά` : `Ηλικία \$\{Math\.floor\(tamagotchiAge\)\}`\}/g,
  '${isEgg ? `Εκκόλαψη ~${minutesToHatch} λεπτά` : `Εξέλιξη: ${MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage}`}',
  'meta-age care',
);
rep(
  /if \(metaAge\) metaAge\.textContent = `Ηλικία \$\{Math\.floor\(tamagotchiAge\)\}`;/g,
  "if (metaAge) metaAge.textContent = `Εξέλιξη: ${MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage}`;",
  'meta-age refresh',
);

// Death screen
rep(
  /<p class="tm-tama-death-stat">Ηλικία: \$\{Math\.floor\(tamagotchiAge\)\} χρόνια<\/p>/g,
  '<p class="tm-tama-death-stat">Εξέλιξη: ${MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage}</p>',
  'death stat',
);

// Legacy age display block
rep(
  /if \(ageDisplay\) ageDisplay\.textContent = `ΗΛΙΚΙΑ: \$\{Math\.floor\(tamagotchiAge\)\}`;/g,
  "if (ageDisplay) ageDisplay.textContent = `ΕΞΕΛΙΞΗ: ${MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage}`;",
  'legacy age display',
);

// Stage badge map in update panel
rep(
  /'baby': 'ΜΩΡΟ',\s*'kid': 'ΠΑΙΔΙ',\s*'teen': 'ΕΦΗΒΟΣ',\s*'adult': 'ΕΝΗΛΙΚΑΣ',\s*'middleage': 'ΜΕΣΗ ΗΛΙΚΙΑ',\s*'old': 'ΓΕΡΟΣ'/g,
  "'evo1': 'ΕΞΕΛΙΞΗ 1',\n        'evo2': 'ΕΞΕΛΙΞΗ 2',\n        'evo3': 'ΕΞΕΛΙΞΗ 3'",
  'stage badge map',
);

// save payload — drop age field
rep(/\s*age: tamagotchiAge,\r?\n/g, '\n', 'save drop age');

// load maxReachedStage migrate
rep(
  /const savedMax = savedData\.maxReachedStage;\s*tamagotchiMaxReachedStage = \(typeof savedMax === 'string' && TAMA_LIFE_STAGE_ORDER\.includes\(savedMax\)\)\s*\? savedMax\s*: 'egg';/g,
  `const savedMax = migrateLifeStageName(savedData.maxReachedStage);
        tamagotchiMaxReachedStage = TAMA_LIFE_STAGE_ORDER.includes(savedMax) ? savedMax : 'egg';`,
  'load maxReached migrate',
);

// Comments / logs
rep(/Age Preview/g, 'Evolution Preview', 'Age Preview wording');
rep(
  /Died from old age at', tamagotchiAge, 'years/g,
  "Died from lifespan end at stage', tamagotchiStage",
  'death log',
);
rep(
  /age=\$\{Math\.floor\(tamagotchiAge\)\}/g,
  'stage=${tamagotchiStage}',
  'resync log',
);
rep(
  /age: \$\{Math\.floor\(tamagotchiAge\)\} years/g,
  'stage: ${tamagotchiStage}',
  'init log',
);

// FX default stage fallbacks commonly used
rep(/tamagotchiStage \|\| 'baby'/g, "tamagotchiStage || 'evo1'", "fx fallback baby→evo1");
rep(/tamagotchiStage \|\| 'adult'/g, "tamagotchiStage || 'evo2'", "fx fallback adult→evo2");
rep(/stage \|\| tamagotchiStage \|\| 'baby'/g, "stage || tamagotchiStage || 'evo1'", "stage||baby");
rep(/stage \|\| tamagotchiStage \|\| 'adult'/g, "stage || tamagotchiStage || 'evo2'", "stage||adult");
rep(/typeof tamagotchiStage !== 'undefined' \? tamagotchiStage : 'baby'/g, "typeof tamagotchiStage !== 'undefined' ? tamagotchiStage : 'evo1'", "typeof baby default");

// Aether FX stage arrays / old|middleage checks
rep(
  /const stages = \['baby', 'kid', 'teen', 'adult', 'middleage', 'old'\];/g,
  "const stages = ['evo1', 'evo2', 'evo3'];",
  'aether stages array',
);
rep(
  /\(stage === 'old' \|\| stage === 'middleage'\)/g,
  "(stage === 'evo3')",
  'old|middleage→evo3',
);
rep(/stage === 'old'/g, "stage === 'evo3'", "stage===old remaining");
rep(/stage === 'baby'/g, "stage === 'evo1'", "stage===baby remaining");
rep(/liveStage === 'old'/g, "liveStage === 'evo3'", "liveStage old");
rep(/AETHER_STAGE_TIER\[tamagotchiStage\] \|\| 0\) >= 6/g, 'AETHER_STAGE_TIER[tamagotchiStage] || 0) >= 3', 'aether tier>=3');
rep(/PHOENIX_STAGE_TIER\[tamagotchiStage\] \|\| 0\) >= 4/g, 'PHOENIX_STAGE_TIER[tamagotchiStage] || 0) >= 2', 'phoenix tier>=2');

// Hatch sequence branch in checkTamagotchiEvolution — becameOld block already partly handled
rep(
  /\} else if \(tamagotchiStage === 'evo3' && oldStage !== 'evo3'\) \{\s*const oldMessages = MASCOT_MESSAGES\.becameOld;\s*showMascotBubble\(oldMessages\[Math\.floor\(Math\.random\(\) \* oldMessages\.length\)\], 3000\);\s*if \(tamagotchiCharacterType === 'aether'\) playAetherStageCinematic\('evo3'\);\s*else if \(tamagotchiCharacterType === 'phoenix'\) playPhoenixStageCinematic\('evo3'\);\s*else playGenericStageCinematic\('evo3'\);\s*\} else if \(stageChanged\) \{/g,
  `} else if (stageChanged) {`,
  'remove becameOld special branch',
);

// Death warning near end of life — keep using evo3 threshold (already renamed from .old)
// Evolution preview footnote already fine

fs.writeFileSync(path, s);
console.log('wrote', path, 'len', s.length);

// Report leftovers
const leftover = [];
for (const pat of [
  'tamagotchiAge',
  'TAMA_MINUTES_PER_YEAR',
  "tamagotchiStage === 'baby'",
  "tamagotchiStage === 'old'",
  "mascot-baby",
  "mascot-kid",
  'Ηλικία',
  'ΗΛΙΚΙΑ',
  'Age Preview',
]) {
  if (s.includes(pat)) leftover.push(pat);
}
console.log('leftovers:', leftover.length ? leftover.join(', ') : 'none');
