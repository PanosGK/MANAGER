/**
 * Patch svg-aether.mjs: per-evolution mean color progressions.
 */
import fs from 'fs';

const path = 'scripts/svg-aether.mjs';
let s = fs.readFileSync(path, 'utf8');

const PALETTE_BLOCK = `
/** Per-evo colors — softer young → colder adult → cruel eclipse/primordial */
const STAGE_PALETTES = {
  baby: {
    a: '#7ec8c3', b: '#c9a0dc', c: '#ffe082',
    stroke: '#6a5a82', pale: '#f3e5f5',
    body: [['0%', '#e1bee7'], ['45%', '#b39ddb'], ['100%', '#7e57c2']],
    belly: [['0%', '#f8eafc', 0.9], ['100%', '#5e35b1', 0.9]],
    wing0: '#b2dfdb', wing1: '#ce93d8',
    iris: [['0%', '#e0f7fa'], ['55%', '#80cbc4'], ['100%', '#1a0033']],
    aura0: '#80cbc4', aura1: '#ce93d8', aura2: '#ffe082',
  },
  evo1: {
    a: '#4db6ac', b: '#9575cd', c: '#ffb74d',
    stroke: '#4a3a6a', pale: '#ede7f6',
    body: [['0%', '#b39ddb'], ['40%', '#7e57c2'], ['100%', '#4527a0']],
    belly: [['0%', '#d1c4e9', 0.85], ['100%', '#311b92', 0.95]],
    wing0: '#80cbc4', wing1: '#7e57c2',
    iris: [['0%', '#b2ebf2'], ['50%', '#26a69a'], ['100%', '#0a0018']],
    aura0: '#4db6ac', aura1: '#9575cd', aura2: '#ffb74d',
  },
  evo2: {
    a: '#00acc1', b: '#5c6bc0', c: '#c0a060',
    stroke: '#2a1848', pale: '#e8e0f0',
    body: [['0%', '#7986cb'], ['40%', '#5e35b1'], ['100%', '#1a237e']],
    belly: [['0%', '#5c6bc0', 0.85], ['100%', '#0d0220', 0.95]],
    wing0: '#4dd0e1', wing1: '#3949ab',
    iris: [['0%', '#84ffff'], ['45%', '#00acc1'], ['100%', '#05010c']],
    aura0: '#00acc1', aura1: '#5c6bc0', aura2: '#c0a060',
  },
  evo3: {
    a: '#26c6da', b: '#ffd54f', c: '#7c4dff',
    stroke: '#1a0a30', pale: '#e8e0f0',
    body: [['0%', '#9575cd'], ['30%', '#651fff'], ['65%', '#311b92'], ['100%', '#0a0018']],
    belly: [['0%', '#4a3a68', 0.85], ['100%', '#05010c', 0.95]],
    wing0: '#4dd0e1', wing1: '#7c4dff',
    iris: [['0%', '#a8e6f0'], ['45%', '#26c6da'], ['100%', '#05010c']],
    aura0: '#26c6da', aura1: '#7c4dff', aura2: '#ffd54f',
  },
  evo4: {
    a: '#ef5350', b: '#bf8f2e', c: '#6a1b9a',
    stroke: '#1a0508', pale: '#f5e6e6',
    body: [['0%', '#6a3a4a'], ['30%', '#4a1028'], ['60%', '#2a0830'], ['100%', '#050008']],
    belly: [['0%', '#3a1520', 0.9], ['100%', '#050008', 0.98]],
    wing0: '#8d4a4a', wing1: '#4a148c',
    iris: [['0%', '#ffcdd2'], ['40%', '#e53935'], ['100%', '#1a0000']],
    aura0: '#ef5350', aura1: '#6a1b9a', aura2: '#bf8f2e',
  },
  evo5: {
    a: '#8b0000', b: '#c9b896', c: '#5d4037',
    stroke: '#2a1810', pale: '#efe6d8',
    body: [['0%', '#c4b49a'], ['25%', '#6a5040'], ['55%', '#2a1818'], ['80%', '#1a0808'], ['100%', '#050202']],
    belly: [['0%', '#4a3028', 0.85], ['100%', '#050202', 0.98]],
    wing0: '#8d6e63', wing1: '#5d4037',
    iris: [['0%', '#efebe9'], ['35%', '#a1887f'], ['70%', '#8b0000'], ['100%', '#1a0000']],
    aura0: '#8b0000', aura1: '#5d4037', aura2: '#c9b896',
  },
};
`;

if (!s.includes('STAGE_PALETTES')) {
  s = s.replace("const PALE = '#e8e0f0';", `const PALE = '#e8e0f0';\n${PALETTE_BLOCK}`);
}

// makeDefs(p, bodyStops, stroke) -> makeDefs(p, pal)
s = s.replace(
  /function makeDefs\(p, bodyStops, stroke\) \{[\s\S]*?^\}\n\n\/\*\* Layered aura/m,
  `function makeDefs(p, pal) {
  return [
    grad(\`\${p}-body\`, pal.body, 'radial', 'cx="38%" cy="22%" r="80%"'),
    grad(\`\${p}-belly\`, pal.belly, 'radial', 'cx="50%" cy="40%" r="60%"'),
    grad(\`\${p}-wing\`, [['0%', pal.wing0, 0.85], ['40%', pal.wing1, 0.7], ['100%', DEEP, 0.8]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(\`\${p}-wing2\`, [['0%', pal.b, 0.45], ['100%', DEEP, 0.55]], 'linear', 'x1="100%" y1="0%" x2="0%" y2="100%"'),
    grad(\`\${p}-core\`, [['0%', pal.pale], ['30%', pal.a], ['70%', pal.c], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(\`\${p}-iris\`, pal.iris, 'radial', 'cx="40%" cy="35%" r="65%"'),
    grad(\`\${p}-aura\`, [['0%', pal.aura0, 0.26], ['35%', pal.aura1, 0.22], ['70%', pal.aura2, 0.1], ['100%', DEEP, 0]], 'radial', 'cx="50%" cy="48%" r="55%"'),
    grad(\`\${p}-aura2\`, [['0%', pal.aura2, 0.22], ['40%', pal.aura0, 0.14], ['100%', pal.aura1, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(\`\${p}-corona\`, [['0%', pal.aura2, 0.3], ['40%', pal.aura0, 0.14], ['100%', pal.aura1, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(\`\${p}-tail\`, [['0%', pal.wing0], ['55%', pal.c], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="100%" y2="100%"'),
    grad(\`\${p}-plate\`, [['0%', '#3a2a55'], ['100%', INK]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
    grad(\`\${p}-sigil\`, [['0%', pal.b, 0.55], ['100%', pal.a, 0]], 'radial', 'cx="50%" cy="50%" r="50%"'),
    grad(\`\${p}-beam\`, [['0%', pal.pale, 0.55], ['50%', pal.a, 0.22], ['100%', pal.c, 0]], 'linear', 'x1="0%" y1="0%" x2="0%" y2="100%"'),
  ].join('\\n');
}

/** Layered aura`
);

// epicAddons(p, tier) -> epicAddons(p, tier, pal) and use pal accents
s = s.replace(
  'function epicAddons(p, tier = 1) {',
  'function epicAddons(p, tier = 1, pal = STAGE_PALETTES.evo3) {\n  const CYAN = pal.a;\n  const GOLD = pal.b;\n  const VIOLET = pal.c;'
);

// Body builders: accept pal and localize accents
for (const name of ['babyBody', 'kidBody', 'teenBody', 'adultBody', 'midBody', 'oldBody']) {
  s = s.replace(
    `function ${name}(p, stroke) {`,
    `function ${name}(p, stroke, pal = STAGE_PALETTES.evo3) {\n  const CYAN = pal.a;\n  const GOLD = pal.b;\n  const VIOLET = pal.c;`
  );
}

// epicAddons calls with tier only -> add pal
s = s.replace(/\$\{epicAddons\(p, (\d+)\)\}/g, '${epicAddons(p, $1, pal)}');

// aetherStage palette wiring
s = s.replace(
  /function aetherStage\(stage\) \{[\s\S]*?const defs = makeDefs\(p, bodyStops, stroke\);\n  const builders = \{[\s\S]*?return wrapStage\(stage, titles\[stage\], defs, builders\[stage\]\(p, stroke\)\);\n\}/,
  `function aetherStage(stage) {
  const p = \`aether-\${stage === 'evo1' ? 'kid' : stage === 'evo2' ? 'teen' : stage === 'evo3' ? 'adult' : stage === 'evo4' ? 'mid' : stage === 'evo5' ? 'old' : 'baby'}\`;
  const titles = {
    baby: 'Voidseed',
    evo1: 'Veilspawn',
    evo2: 'Astral Warden',
    evo3: 'Starveil Sovereign',
    evo4: 'Eclipse Sovereign',
    evo5: 'Primordial Absolute',
  };

  const pal = STAGE_PALETTES[stage] || STAGE_PALETTES.evo3;
  const stroke = pal.stroke;
  const defs = makeDefs(p, pal);
  const builders = {
    baby: babyBody,
    evo1: kidBody,
    evo2: teenBody,
    evo3: adultBody,
    evo4: midBody,
    evo5: oldBody,
  };

  return wrapStage(stage, titles[stage], defs, builders[stage](p, stroke, pal));
}`
);

// Update header comment
s = s.replace(
  'MYTHICAL evo line v4 · Pokémon-style)',
  'MYTHICAL evo line v5 · stage color progression)'
);

fs.writeFileSync(path, s);
console.log('patched ok', {
  palettes: s.includes('STAGE_PALETTES'),
  makeDefs: s.includes('function makeDefs(p, pal)'),
  epicPal: s.includes('epicAddons(p, tier = 1, pal'),
  babyPal: s.includes('function babyBody(p, stroke, pal'),
  aetherPal: s.includes('const pal = STAGE_PALETTES[stage]'),
});
