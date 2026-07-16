// This script is intended to be used as a library via the @require directive
// in the main "MyManager All-in-One Suite" script. It does not do anything on its own.

let mascotStateTimeout = null;
let idleTimer = null;
let isRoaming = false;
let roamingTimeout = null;
let playfulTimeout = null;
let roamingConfig = null;
let roamingWatchdogInterval = null;

const ROAMING_ACTIVE_STATES = ['idle', 'biking', 'juggling', 'reading', 'happy', 'sad', 'energized'];
const ROAMING_MOVE_STATES = ['idle'];
const MASCOT_MODIFIER_CLASSES = ['mascot-needs-toilet', 'mascot-needs-cleaning', 'mascot-hatching', 'mascot-dying'];
const MASCOT_INTERACTION_CLASSES = [
    'mascot-parked', 'mascot-dragging', 'mascot-focus-quiet',
    'mascot-chasing', 'mascot-chase-tired', 'mascot-hiding', 'mascot-hide-hint', 'mascot-hide-found',
    'mascot-jetpack-boost',
];
// Mood classes are preserved separately (mascot-mood-*) in applyMascotBehaviorState.

/** Unified accessory catalog for Tamagotchi sprites (shop + equip + SVG ids must match). */
const MASCOT_ACCESSORY_CATALOG = [
    { id: 'digital_headphones', name: 'Digital Headphones', nameGr: 'Ψηφιακά ακουστικά', icon: '🎧', cost: 350, slot: 'head' },
    { id: 'pixel_sunglasses', name: 'Pixel Sunglasses', nameGr: 'Pixel γυαλιά', icon: '😎', cost: 300, slot: 'face' },
    { id: 'tech_goggles', name: 'Tech Goggles', nameGr: 'Tech γυαλιά', icon: '🥽', cost: 450, slot: 'face' },
    { id: 'party_hat', name: 'Party Hat', nameGr: 'Party καπέλο', icon: '🎊', cost: 200, slot: 'head' },
    { id: 'flower_crown', name: 'Flower Crown', nameGr: 'Στεφάνι λουλουδιών', icon: '🌸', cost: 400, slot: 'head' },
    { id: 'star_crown', name: "Master's Crown", nameGr: 'Κορώνα master', icon: '👑', cost: 10000, slot: 'head' },
    { id: 'halo', name: 'Angel Halo', nameGr: 'Φωτοστέφανο', icon: '😇', cost: 800, slot: 'head' },
    { id: 'rainbow_scarf', name: 'Rainbow Scarf', nameGr: 'Ουράνιο κασκόλ', icon: '🧣', cost: 300, slot: 'neck' },
    { id: 'backpack', name: 'Adventure Backpack', nameGr: 'Σακίδιο περιπέτειας', icon: '🎒', cost: 400, slot: 'back' },
    { id: 'jetpack', name: 'Jetpack', nameGr: 'Jetpack', icon: '🚀', cost: 1200, slot: 'back' },
    { id: 'shield', name: 'Energy Shield', nameGr: 'Ασπίδα ενέργειας', icon: '🛡️', cost: 500, slot: 'hand' },
    { id: 'magic_wand', name: 'Magic Wand', nameGr: 'Μαγικό ραβδί', icon: '🪄', cost: 550, slot: 'hand' },
    { id: 'bubble_wand', name: 'Bubble Wand', nameGr: 'Ραβδί φυσαλίδων', icon: '🫧', cost: 350, slot: 'hand' },
    { id: 'book', name: 'Bookworm Kit', nameGr: 'Βιβλίο', icon: '📚', cost: 300, slot: 'hand' },
    { id: 'umbrella', name: 'Rain Umbrella', nameGr: 'Ομπρέλα', icon: '☂️', cost: 350, slot: 'hand' },
    { id: 'digital_watch', name: 'Digital Watch', nameGr: 'Ψηφιακό ρολόι', icon: '⌚', cost: 350, slot: 'wrist' },
    { id: 'legend_badge', name: 'Legend Badge', nameGr: 'Σήμα θρύλου', icon: '🏅', cost: 2500, slot: 'body' },
    { id: 'power_ring', name: 'Power Ring', nameGr: 'Δαχτυλίδι δύναμης', icon: '💍', cost: 1500, slot: 'aura' },
];

/** Maps legacy pre-overhaul shop ids to new SVG ids (null = removed). */
const MASCOT_ACCESSORY_ID_ALIASES = {
    top_hat: 'party_hat',
    cowboy_hat: 'party_hat',
    wizard_hat: 'star_crown',
    chef_hat: 'party_hat',
    santa_hat: 'party_hat',
    party_hat: 'party_hat',
    halo: 'halo',
    cool_shades: 'pixel_sunglasses',
    nerd_glasses: 'tech_goggles',
    monocle: 'tech_goggles',
    rainy_day_umbrella: 'umbrella',
    beach_umbrella: 'umbrella',
    bookworm_kit: 'book',
    magic_wand: 'magic_wand',
    flower_crown: 'flower_crown',
    master_crown: 'star_crown',
    tech_goggles: 'tech_goggles',
    legend_badge: 'legend_badge',
    jetpack: 'jetpack',
    stunt_bike: null,
    juggling_balls: null,
    skateboard: null,
    camera: null,
    microphone: null,
    guitar: null,
    laurel_wreath: 'legend_badge',
    devil_horns: null,
    ninja_mask: null,
    diamond_ring: 'power_ring',
    golden_trophy: 'legend_badge',
    rainbow_wings: 'power_ring',
    power_glove: 'power_ring',
    vip_pass: 'legend_badge',
};

function normalizeAccessoryId(itemId) {
    if (!itemId) return null;
    if (MASCOT_ACCESSORY_CATALOG.some((item) => item.id === itemId)) return itemId;
    const aliased = MASCOT_ACCESSORY_ID_ALIASES[itemId];
    if (aliased === null) return null;
    if (aliased && MASCOT_ACCESSORY_CATALOG.some((item) => item.id === aliased)) return aliased;
    return null;
}

function getAccessoryCatalogItem(itemId) {
    const normalized = normalizeAccessoryId(itemId);
    return MASCOT_ACCESSORY_CATALOG.find((item) => item.id === normalized) || null;
}

function setMascotAccessoryVisible(el, visible) {
    if (!el) return;
    if (visible) el.style.removeProperty('display');
    else el.style.display = 'none';
}

function hideAllMascotAccessories() {
    MASCOT_ACCESSORY_CATALOG.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
            setMascotAccessoryVisible(el, false);
            el.classList.remove('tm-accessory-equipped');
        }
    });
}

function showMascotAccessory(itemId) {
    const el = getAccessoryElement(itemId);
    if (!el) return false;
    el.classList.add('tm-accessory-equipped');
    layoutMascotAccessory(itemId, tamagotchiStage);
    setMascotAccessoryVisible(el, true);
    return true;
}

function migrateAccessoryStorage(STORAGE_KEYS) {
    if (!STORAGE_KEYS?.PURCHASED_ITEMS || !STORAGE_KEYS?.EQUIPPED_ITEMS) return;

    const migrateList = (list) => [...new Set(
        (Array.isArray(list) ? list : [])
            .map(normalizeAccessoryId)
            .filter(Boolean)
    )];

    const purchased = migrateList(JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]')));
    const equipped = migrateList(JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]')));

    GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
    GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equipped));
}

function getEffectiveMascotStage() {
    return (mascotStagePreviewLock && mascotStagePreviewStage) ? mascotStagePreviewStage : tamagotchiStage;
}

function clearMascotStagePreview(restore = true) {
    if (mascotStagePreviewTimeout) {
        clearTimeout(mascotStagePreviewTimeout);
        mascotStagePreviewTimeout = null;
    }
    mascotStagePreviewLock = false;
    mascotStagePreviewStage = null;
    if (restore && document.getElementById('tm-mascot-container')) {
        updateMascotAppearanceByStage(tamagotchiStage);
    }
}

function previewMascotStage(stage, durationMs = 5000) {
    if (!stage || !document.getElementById('tm-mascot-container')) return false;

    if (mascotStagePreviewTimeout) {
        clearTimeout(mascotStagePreviewTimeout);
        mascotStagePreviewTimeout = null;
    }

    mascotStagePreviewLock = true;
    mascotStagePreviewStage = stage;
    updateMascotAppearanceByStage(stage);

    if (durationMs > 0) {
        mascotStagePreviewTimeout = setTimeout(() => clearMascotStagePreview(true), durationMs);
    }
    return true;
}

/**
 * Debug helper: permanently set the active mascot character and refresh the sprite.
 * If still an egg, advances to baby so the chosen character is visible.
 */
function debugSetMascotCharacter(characterType, STORAGE_KEYS) {
    if (!characterType || !TAMA_CHARACTER_TYPES.includes(characterType)) return false;

    cancelTamagotchiCinematics();
    clearMascotStagePreview(false);

    tamagotchiCharacterType = characterType;
    tamagotchiIsDead = false;

    if (tamagotchiStage === 'egg' || tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.baby) {
        tamagotchiLifeMinutes = Math.max(Number(tamagotchiLifeMinutes) || 0, TAMA_STAGE_MINUTES.baby);
        tamagotchiStage = 'baby';
        tamagotchiEggHatchCinematicDone = true;
    } else {
        tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
    }

    syncTamagotchiAgeFromLife();
    const keys = getTamagotchiStorageKeys(
        STORAGE_KEYS || (typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : null),
    );
    if (keys) saveTamagotchiData(keys);

    updateMascotAppearanceByStage(tamagotchiStage);
    if (typeof updateTamagotchiPersonality === 'function') {
        try { updateTamagotchiPersonality(); } catch { /* ignore */ }
    }

    console.log(`[Mascot] Debug character set to ${characterType} (stage ${tamagotchiStage})`);
    return true;
}

/**
 * Debug: natural / care death (hunger, health, old age) — NOT the AK-47 execution cinematic.
 * @param {object|null} STORAGE_KEYS
 * @param {'hunger'|'health'|'oldAge'} [cause='hunger']
 * @returns {boolean}
 */
function debugKillTamagotchiNatural(STORAGE_KEYS, cause = 'hunger') {
    const reason = ['hunger', 'health', 'oldAge'].includes(cause) ? cause : 'hunger';
    if (tamagotchiIsDead) {
        showMascotBubble('Ήδη νεκρό…', 2500);
        return false;
    }
    if (tamagotchiStage === 'egg' || tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.baby) {
        showMascotBubble('Το αυγό δεν πεθαίνει από πείνα/ηλικία.', 3000);
        return false;
    }

    cancelTamagotchiCinematics();
    clearMascotStagePreview(false);

    const keys = getTamagotchiStorageKeys(
        STORAGE_KEYS || (typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : null),
    );

    if (reason === 'oldAge') {
        tamagotchiLifeMinutes = Math.max(Number(tamagotchiLifeMinutes) || 0, TAMA_STAGE_MINUTES.death);
        syncTamagotchiAgeFromLife();
        tamagotchiStage = 'old';
        tamagotchiHealth = 0;
    } else if (reason === 'health') {
        tamagotchiHealth = 0;
        tamagotchiCareMistakes = Math.max(tamagotchiCareMistakes || 0, 5);
    } else {
        petStats.hunger = 0;
        petStats.happiness = Math.min(petStats.happiness || 0, 15);
        tamagotchiHealth = 0;
        // Make starvation condition true if anything re-checks office minutes
        tamagotchiLastFed = Date.now() - (6 * 60 * 60 * 1000);
    }

    tamagotchiIsDead = true;
    if (keys) {
        recordTamagotchiNaturalDeath(keys);
        if (keys.PET_STATS) {
            GM_setValue(keys.PET_STATS, JSON.stringify(petStats));
        }
    } else {
        tamagotchiNaturalDeathCount++;
    }

    const pool = reason === 'oldAge' ? MASCOT_MESSAGES.oldAgeDeath : MASCOT_MESSAGES.death;
    showMascotBubble(pool[Math.floor(Math.random() * pool.length)], 5000);
    setMascotState(null, 'dead', 10000);
    updateDeathOptionsButton();

    const delay = reason === 'oldAge' ? 1500 : 500;
    setTimeout(() => {
        if (keys) runTamagotchiDeathSequence(keys);
    }, delay);

    console.log(`[Mascot] Debug natural death (${reason})`);
    return true;
}

function getMascotCharacterType() {
    return tamagotchiCharacterType;
}

function applyEquippedMascotAccessories(STORAGE_KEYS, stage = getEffectiveMascotStage()) {
    hideAllMascotAccessories();
    if (!STORAGE_KEYS?.EQUIPPED_ITEMS) return;

    const equipped = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    equipped.map(normalizeAccessoryId).filter(Boolean).forEach(showMascotAccessory);
    updateMascotAccessoryLayout(stage);
}

function equipMascotAccessory(config, STORAGE_KEYS, itemId) {
    const catalogItem = getAccessoryCatalogItem(itemId);
    if (!catalogItem || !STORAGE_KEYS?.EQUIPPED_ITEMS) return false;

    let equipped = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    equipped = equipped.map(normalizeAccessoryId).filter(Boolean);
    equipped = equipped.filter((id) => getAccessoryCatalogItem(id)?.slot !== catalogItem.slot);
    if (!equipped.includes(catalogItem.id)) equipped.push(catalogItem.id);

    GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equipped));
    applyEquippedMascotAccessories(STORAGE_KEYS);
    return true;
}

function unequipMascotAccessory(STORAGE_KEYS, itemId) {
    if (!STORAGE_KEYS?.EQUIPPED_ITEMS) return false;
    const normalized = normalizeAccessoryId(itemId);
    if (!normalized) return false;

    let equipped = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    equipped = equipped.map(normalizeAccessoryId).filter((id) => id && id !== normalized);
    GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equipped));
    applyEquippedMascotAccessories(STORAGE_KEYS);
    return true;
}

function toggleMascotAccessory(config, STORAGE_KEYS, itemId) {
    const normalized = normalizeAccessoryId(itemId);
    if (!normalized || !STORAGE_KEYS?.EQUIPPED_ITEMS) return false;

    const equipped = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'))
        .map(normalizeAccessoryId)
        .filter(Boolean);

    if (equipped.includes(normalized)) {
        return unequipMascotAccessory(STORAGE_KEYS, normalized);
    }
    return equipMascotAccessory(config, STORAGE_KEYS, normalized);
}

function getShopAccessoryCatalog() {
    return MASCOT_ACCESSORY_CATALOG.map(({ slot, nameGr, ...item }) => ({
        ...item,
        type: 'accessory',
    }));
}

/** Body attachment points per Tamagotchi stage (viewBox coords). */
const MASCOT_STAGE_ANCHORS = {
    egg:      { headTop: [50, 16], eyes: [50, 44, 14], neck: [50, 54], chest: [50, 54], back: [50, 54], handR: [62, 54, 18], wristR: [60, 56], aura: [50, 54], scale: 0.6 },
    baby:     { headTop: [50, 24], eyes: [50, 36, 16], neck: [50, 46], chest: [50, 64], back: [50, 58], handR: [72, 60, 22], wristR: [74, 64], aura: [50, 64], scale: 0.82 },
    kid:      { headTop: [50, 20], eyes: [50, 32, 18], neck: [50, 42], chest: [50, 58], back: [50, 52], handR: [74, 56, 20], wristR: [76, 60], aura: [50, 58], scale: 0.9 },
    teen:     { headTop: [50, 18], eyes: [50, 28, 20], neck: [50, 38], chest: [50, 56], back: [50, 50], handR: [76, 54, 18], wristR: [78, 58], aura: [50, 56], scale: 0.95 },
    adult:    { headTop: [50, 14], eyes: [50, 26, 18], neck: [50, 36], chest: [50, 54], back: [50, 48], handR: [78, 52, 15], wristR: [80, 56], aura: [50, 54], scale: 1 },
    middleage:{ headTop: [50, 16], eyes: [50, 28, 18], neck: [50, 38], chest: [50, 56], back: [50, 50], handR: [76, 54, 15], wristR: [78, 58], aura: [50, 56], scale: 1 },
    old:      { headTop: [50, 18], eyes: [50, 30, 16], neck: [50, 40], chest: [50, 58], back: [50, 52], handR: [74, 56, 12], wristR: [76, 60], aura: [50, 58], scale: 0.95 },
};

const ACCESSORY_SLOT_ANCHOR = {
    head: 'headTop', face: 'eyes', neck: 'neck', back: 'back',
    hand: 'handR', wrist: 'wristR', body: 'chest', aura: 'aura',
};

/** Back-slot items render on the front SVG layer (sprites are one opaque group — a true back layer is fully hidden). */
const ACCESSORY_PREPEND_FRONT = new Set(['jetpack', 'backpack', 'power_ring']);

/** Per-item fine tuning (offsets relative to anchor, in local space). */
const ACCESSORY_LAYOUT = {
    digital_headphones: { dy: 4, scale: 1.05 },
    pixel_sunglasses:   { dy: 0 },
    tech_goggles:       { dy: -1, scale: 1.05 },
    party_hat:          { dy: 10, scale: 0.88 },
    flower_crown:       { dy: 12, scale: 0.82 },
    star_crown:         { dy: 8, scale: 0.72 },
    halo:               { dy: -12, scale: 0.78 },
    rainbow_scarf:      { dy: 2, scale: 0.85 },
    backpack:           { dy: -2, scale: 0.82 },
    jetpack:            { dy: -2, scale: 0.85 },
    shield:             { rot: -8, scale: 0.8, dx: 4 },
    magic_wand:         { rot: 28, scale: 0.85, dx: 2, dy: -4 },
    bubble_wand:        { rot: -18, scale: 0.8, dx: 2 },
    book:               { rot: 14, scale: 0.75, dx: 4, dy: 2 },
    umbrella:           { rot: 22, scale: 0.7, dx: 2, dy: -8 },
    digital_watch:        { scale: 0.65, dx: 2 },
    legend_badge:       { dy: 2, scale: 0.7 },
    power_ring:         { dy: 18, scale: 1.05 },
};

/** Reference body height (viewBox units) for adult sprites — used to scale accessories. */
const MASCOT_REFERENCE_BODY_HEIGHT = 48;

function getMascotFlipper() {
    return document.querySelector('.tm-mascot-flipper');
}

/** Returns the currently visible evolution/egg sprite root inside the flipper. */
function getVisibleMascotSpriteRoot() {
    const flipper = getMascotFlipper();
    if (!flipper) return null;

    let fallback = null;
    for (const child of flipper.children) {
        if (!child.id?.startsWith('tm-mascot-')) continue;
        if (child.id === 'tm-mascot-acc-back' || child.id === 'tm-mascot-acc-front') continue;
        if (child.style.display === 'none' || child.style.opacity === '0') continue;
        const cs = window.getComputedStyle(child);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
        // Prefer non-egg sprites if both somehow visible
        if (child.id === 'tm-mascot-base') {
            fallback = child;
            continue;
        }
        return child;
    }
    return fallback || document.getElementById('tm-mascot-base');
}

function getSpriteEyeElement(sprite) {
    if (!sprite) return null;
    const open = sprite.querySelector('.tm-mascot-eye-open');
    if (open && window.getComputedStyle(open).display !== 'none') return open;
    const closed = sprite.querySelector('.tm-mascot-eye-closed');
    if (closed && window.getComputedStyle(closed).display !== 'none') return closed;
    return open || closed;
}

function svgLocalPointToFlipper(flipper, element, localX, localY) {
    const svg = flipper?.ownerSVGElement || flipper?.closest('svg');
    if (!svg || !element) return null;
    const pt = svg.createSVGPoint();
    pt.x = localX;
    pt.y = localY;
    const elCtm = element.getCTM?.();
    const flipperCtm = flipper.getCTM?.();
    if (!elCtm || !flipperCtm) return null;
    const inSvg = pt.matrixTransform(elCtm);
    const inFlipper = inSvg.matrixTransform(flipperCtm.inverse());
    return { x: inFlipper.x, y: inFlipper.y };
}

function getSvgElementAnchor(flipper, element, mode = 'center') {
    if (!element || !flipper) return null;
    let bbox;
    try {
        bbox = element.getBBox();
    } catch {
        return null;
    }
    if (!bbox.width && !bbox.height) return null;

    let lx = bbox.x + bbox.width / 2;
    let ly = bbox.y + bbox.height / 2;
    if (mode === 'top') ly = bbox.y;
    else if (mode === 'bottom') ly = bbox.y + bbox.height;
    else if (mode === 'top-left') { lx = bbox.x; ly = bbox.y; }

    const pt = svgLocalPointToFlipper(flipper, element, lx, ly);
    return pt ? [pt.x, pt.y] : null;
}

function getArmHandAnchor(flipper, armEl, bodyCenter) {
    if (!armEl) return null;
    let bbox;
    try {
        bbox = armEl.getBBox();
    } catch {
        return null;
    }
    const hand = svgLocalPointToFlipper(flipper, armEl, bbox.x + bbox.width * 0.55, bbox.y + bbox.height * 0.88);
    const shoulder = svgLocalPointToFlipper(flipper, armEl, bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.12);
    if (!hand) return null;

    let rot = 15;
    if (shoulder && bodyCenter) {
        rot = Math.atan2(hand.y - shoulder.y, hand.x - shoulder.x) * (180 / Math.PI) + 90;
    } else if (shoulder) {
        rot = Math.atan2(hand.y - shoulder.y, hand.x - shoulder.x) * (180 / Math.PI) + 90;
    }
    return [hand.x, hand.y, rot];
}

/**
 * Measure attachment points from the live visible sprite (eyes, arms, body).
 * Falls back to per-stage static anchors when a part is missing.
 */
function resolveMascotDynamicAnchors(stage = tamagotchiStage) {
    const fallback = MASCOT_STAGE_ANCHORS[stage] || MASCOT_STAGE_ANCHORS.adult;
    const flipper = getMascotFlipper();
    const sprite = getVisibleMascotSpriteRoot();

    if (!flipper || !sprite || stage === 'egg') return { ...fallback };

    const anchors = { ...fallback };

    const eyesEl = getSpriteEyeElement(sprite);
    if (eyesEl) {
        let eyeBox;
        try {
            eyeBox = eyesEl.getBBox();
        } catch {
            eyeBox = null;
        }
        const eyeCenter = getSvgElementAnchor(flipper, eyesEl, 'center');
        if (eyeCenter) {
            anchors.eyes = [eyeCenter[0], eyeCenter[1], Math.max(eyeBox?.width || 16, 12)];
            const headTop = svgLocalPointToFlipper(
                flipper,
                eyesEl,
                eyeBox.x + eyeBox.width / 2,
                eyeBox.y - Math.max(eyeBox.height * 0.75, 6),
            );
            if (headTop) anchors.headTop = [headTop.x, headTop.y];
        }
    }

    const bodyEl = sprite.querySelector('.tm-animate-body') || sprite.querySelector('.tm-mascot-main-body');
    const chest = bodyEl ? getSvgElementAnchor(flipper, bodyEl, 'center') : null;
    if (chest) {
        anchors.chest = chest;
        anchors.back = chest;
    } else if (eyesEl && anchors.eyes) {
        const bodyGuess = [anchors.eyes[0], anchors.eyes[1] + Math.max(22, (fallback.chest?.[1] || 54) - (fallback.eyes?.[1] || 26))];
        anchors.chest = bodyGuess;
        anchors.back = bodyGuess;
    }

    if (anchors.eyes && anchors.chest) {
        anchors.neck = [anchors.eyes[0], (anchors.eyes[1] + anchors.chest[1]) / 2 + 2];
    }

    const bodyCenter = chest ? { x: chest[0], y: chest[1] } : null;
    const rightArm = sprite.querySelector('.tm-animate-arm-right');
    const handR = getArmHandAnchor(flipper, rightArm, bodyCenter);
    if (handR) {
        anchors.handR = handR;
        anchors.wristR = [handR[0] - 1, handR[1] + 3, handR[2]];
    }

    const leftLeg = sprite.querySelector('.tm-animate-leg-left');
    const rightLeg = sprite.querySelector('.tm-animate-leg-right');
    const legBottoms = [leftLeg, rightLeg]
        .map((leg) => getSvgElementAnchor(flipper, leg, 'bottom'))
        .filter(Boolean);
    if (legBottoms.length) {
        const avgX = legBottoms.reduce((sum, p) => sum + p[0], 0) / legBottoms.length;
        const maxY = Math.max(...legBottoms.map((p) => p[1]));
        anchors.aura = [avgX, maxY + 4];
    } else if (anchors.chest) {
        anchors.aura = [anchors.chest[0], anchors.chest[1] + 18];
    }

    let bodyHeight = MASCOT_REFERENCE_BODY_HEIGHT;
    if (bodyEl) {
        try {
            bodyHeight = bodyEl.getBBox().height;
        } catch { /* keep default */ }
    } else if (eyesEl && legBottoms.length) {
        bodyHeight = legBottoms[0][1] - (anchors.eyes?.[1] || legBottoms[0][1]);
    }
    anchors.scale = Math.max(0.55, Math.min(1.15, bodyHeight / MASCOT_REFERENCE_BODY_HEIGHT));

    return anchors;
}

function getMascotStageAnchors(stage = getEffectiveMascotStage()) {
    return resolveMascotDynamicAnchors(stage);
}

function hasEquippedMascotAccessories() {
    return MASCOT_ACCESSORY_CATALOG.some(({ id }) => document.getElementById(id)?.classList.contains('tm-accessory-equipped'));
}

function hasActiveStateAccessories() {
    const container = document.getElementById('tm-mascot-container');
    if (!container) return false;
    return Object.entries(STATE_FORCED_ACCESSORIES).some(([state, ids]) =>
        container.classList.contains(`mascot-${state}`)
        && ids.some((id) => {
            const el = document.getElementById(id);
            return el && window.getComputedStyle(el).display !== 'none';
        }),
    );
}

/** Accessories shown temporarily by mascot behavior states (even when not equipped). */
const STATE_FORCED_ACCESSORIES = {
    reading: ['book'],
    rainy: ['umbrella'],
    juggling: ['bubble_wand'],
    sunny: ['pixel_sunglasses', 'tech_goggles'],
};

function layoutMascotAccessory(accessoryId, stage = getEffectiveMascotStage(), options = {}) {
    const el = getAccessoryElement(accessoryId);
    const catalogItem = getAccessoryCatalogItem(accessoryId);
    if (!el || !catalogItem) return;

    if (stage === 'egg') {
        setMascotAccessoryVisible(el, false);
        return;
    }

    const anchors = getMascotStageAnchors(stage);
    const anchorKey = ACCESSORY_SLOT_ANCHOR[catalogItem.slot] || 'chest';
    const anchor = anchors[anchorKey];
    if (!anchor) return;

    const layout = ACCESSORY_LAYOUT[accessoryId] || {};
    const stageScale = anchors.scale || 1;
    const scale = (layout.scale || 1) * stageScale;
    let rot = layout.rot ?? 0;
    if (catalogItem.slot === 'hand' && anchor.length > 2 && layout.rot == null) {
        rot = anchor[2];
    }
    const ax = anchor[0] + (layout.dx || 0);
    const ay = anchor[1] + (layout.dy || 0);

    el.setAttribute('transform', `translate(${ax}, ${ay}) rotate(${rot}) scale(${scale})`);
    if (options.force) return;
    setMascotAccessoryVisible(el, el.classList.contains('tm-accessory-equipped'));
}

function syncStateAccessoryLayout(state, previousState) {
    Object.entries(STATE_FORCED_ACCESSORIES).forEach(([behaviorState, ids]) => {
        ids.forEach((id) => {
            if (state === behaviorState) {
                layoutMascotAccessory(id, tamagotchiStage, { force: true });
            } else if (previousState === behaviorState && state !== behaviorState) {
                const el = getAccessoryElement(id);
                if (el && !el.classList.contains('tm-accessory-equipped')) {
                    setMascotAccessoryVisible(el, false);
                }
            }
        });
    });
}

function updateMascotAccessoryLayout(stage = getEffectiveMascotStage()) {
    MASCOT_ACCESSORY_CATALOG.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el?.classList.contains('tm-accessory-equipped')) {
            layoutMascotAccessory(id, stage);
        }
    });

    const container = document.getElementById('tm-mascot-container');
    if (!container) return;
    Object.entries(STATE_FORCED_ACCESSORIES).forEach(([state, ids]) => {
        if (!container.classList.contains(`mascot-${state}`)) return;
        ids.forEach((id) => layoutMascotAccessory(id, stage, { force: true }));
    });
}

function initMascotAccessoryLayers() {
    const flipper = document.querySelector('.tm-mascot-flipper');
    if (!flipper) return;

    const legacyBackLayer = document.getElementById('tm-mascot-acc-back');
    let frontLayer = document.getElementById('tm-mascot-acc-front');

    if (frontLayer && legacyBackLayer) {
        while (legacyBackLayer.firstChild) {
            frontLayer.insertBefore(legacyBackLayer.firstChild, frontLayer.firstChild);
        }
        legacyBackLayer.remove();
        return;
    }
    if (frontLayer) return;

    const frontLayerNew = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    frontLayerNew.id = 'tm-mascot-acc-front';
    flipper.appendChild(frontLayerNew);
    frontLayer = frontLayerNew;

    legacyBackLayer?.remove();

    const prependFront = [];
    MASCOT_ACCESSORY_CATALOG.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (ACCESSORY_PREPEND_FRONT.has(id)) {
            el.setAttribute('data-tm-back-slot', 'true');
            prependFront.push(el);
        } else {
            frontLayer.appendChild(el);
        }
    });
    prependFront.reverse().forEach((el) => frontLayer.insertBefore(el, frontLayer.firstChild));
}

let petStats = { happiness: 100, hunger: 100, lastUpdate: Date.now() };
// Tamagotchi state variables
let tamagotchiAge = 0;
let tamagotchiStage = 'egg'; // egg, baby, kid, teen, adult, middleage, old
let tamagotchiCharacterType = 'none'; // none (egg), dragon, robot, slime, plant, ghost, cat, phoenix, crystal
let tamagotchiHealth = 100;

// Epic Character Data with lore and traits
const MASCOT_CHARACTERS = {
    dragon: {
        name: 'Ember Sovereign', nameGr: 'Ember Sovereign',
        emoji: '🐉', color: '#1de9b6', rarity: 'Legendary', rarityGr: 'Θρύλος',
        element: 'Inferno & Scale', elementGr: 'Φωτιά & Λέπιδα',
        description: 'Primordial wyrm that rules the ash realms',
        descriptionGr: 'Αρχαίος φύλακας μυστικών κόσμων',
        lore: 'Forged in volcanic cataclysm, this sovereign of flame carries the wrath of ages and the wisdom of dying stars.',
        loreGr: 'Γεννήθηκε από ηφαιστειακή ενέργεια — κουβαλά τη σοφία των αιώνων και τη δύναμη της φλόγας.',
        traits: ['🔥 Cataclysm Breath', '🛡️ Obsidian Scales', '✨ Primordial Magic'],
        traitsGr: ['🔥 Φωτιά', '🛡️ Θωρακισμένα λέπια', '✨ Αρχαία μαγεία'],
        prefs: { likes: ['meal', 'play', 'praise'], dislikes: ['scold', 'lights_off'], favorite: 'meal' }
    },
    robot: {
        name: 'Neon Colossus', nameGr: 'Neon Colossus',
        emoji: '🤖', color: '#00b7ff', rarity: 'Epic', rarityGr: 'Επικό',
        element: 'Plasma & Code', elementGr: 'Τεχνολογία & Κώδικας',
        description: 'War-forged AI titan from the digital abyss',
        descriptionGr: 'Προηγμένη τεχνητή νοημοσύνη από τον ψηφιακό κόσμο',
        lore: 'Forged in silicon storms and lightning cores, this colossus rewrites reality through code and iron will.',
        loreGr: 'Φτιαγμένο από πυρίτιο και αστραπές — εξελίσσεται με κώδικα και φαντασία.',
        traits: ['⚡ Plasma Core', '🔧 Autoregen Protocols', '💾 Overmind'],
        traitsGr: ['⚡ Ηλεκτρική καρδιά', '🔧 Αυτοεπισκευή', '💾 Νους δεδομένων'],
        prefs: { likes: ['play', 'medicine', 'lights_on'], dislikes: ['snack', 'scold'], favorite: 'play' }
    },
    slime: {
        name: 'Abyssal Ooze', nameGr: 'Abyssal Ooze',
        emoji: '🟢', color: '#76ff03', rarity: 'Rare', rarityGr: 'Σπάνιο',
        element: 'Void & Venom', elementGr: 'Υγρό & Αναπήδημα',
        description: 'Toxic primordial mass from the deep dark',
        descriptionGr: 'Αξιολάτρευτη ζελατινώδης μορφή ζωής',
        lore: 'Spawned in the lightless depths, this living venom reshapes itself into fangs, tendrils, and hunger.',
        loreGr: 'Γεννημένο από χαρά και γέλιο — απορροφά την ευτυχία γύρω του.',
        traits: ['💧 Formless Hunger', '☠️ Acid Bloom', '👁 Predatory Gaze'],
        traitsGr: ['💧 Αλλάζει σχήμα', '🎈 Αναπηδάει', '😊 Αύρα χαράς'],
        prefs: { likes: ['snack', 'pet', 'meal'], dislikes: ['clean', 'lights_on'], favorite: 'snack' }
    },
    plant: {
        name: 'Worldroot Warden', nameGr: 'Worldroot Warden',
        emoji: '🌱', color: '#4caf50', rarity: 'Rare', rarityGr: 'Σπάνιο',
        element: 'Wildwood & Life', elementGr: 'Φύση & Ανάπτυξη',
        description: 'Ancient guardian of the living canopy',
        descriptionGr: 'Φύλακας δασών και ζωής',
        lore: 'Sprouted from the World Tree itself, this warden binds forests, beasts, and seasons with earthbound magic.',
        loreGr: 'Βλάστησε από το Παγκόσμιο Δέντρο — τρέφει τα πλάσματα με γη και μαγεία.',
        traits: ['🌿 Canopy Dominion', '🌸 Bloom Surge', '🌳 Rootbind'],
        traitsGr: ['🌿 Φωτοσύνθεση', '🌸 Άνθηση', '🌳 Δέσιμο με τη φύση'],
        prefs: { likes: ['lights_on', 'pet', 'clean'], dislikes: ['snack', 'lights_off'], favorite: 'lights_on' }
    },
    ghost: {
        name: 'Veil Wraith', nameGr: 'Veil Wraith',
        emoji: '👻', color: '#b39ddb', rarity: 'Epic', rarityGr: 'Επικό',
        element: 'Spirit & Void', elementGr: 'Πνεύμα & Σκιά',
        description: 'Spectral hunter between living worlds',
        descriptionGr: 'Αιθέριο πλάσμα από το πέρα',
        lore: 'Torn from the veil between life and death, this wraith slips through dimensions as a whisper of cold night.',
        loreGr: 'Ούτε ζωντανό ούτε νεκρό — παίζει ανάμεσα στις διαστάσεις ψάχνοντας παρέα.',
        traits: ['👁️ Vanish', '✨ Phase Strike', '🌙 Umbral Sight'],
        traitsGr: ['👁️ Αόρατο', '✨ Περνάει μέσα', '🌙 Νυχτερινή όραση'],
        prefs: { likes: ['lights_off', 'pet', 'play'], dislikes: ['meal', 'lights_on'], favorite: 'lights_off' }
    },
    cat: {
        name: 'Moonfang Oracle', nameGr: 'Moonfang Oracle',
        emoji: '🐱', color: '#7e57c2', rarity: 'Rare', rarityGr: 'Σπάνιο',
        element: 'Fate & Shadow', elementGr: 'Τύχη & Σκανταλιά',
        description: 'Astral feline that walks the omen paths',
        descriptionGr: 'Γάτα με εννέα ζωές και ατελείωτη περιέργεια',
        lore: 'Blessed by moon goddesses, this oracle pads between worlds, weaving fortune, ruin, and quiet prophecy.',
        loreGr: 'Ευλογημένη από τη Σελήνη — περπατά ανάμεσα στους κόσμους φέρνοντας τύχη.',
        traits: ['🍀 Fate Charm', '🌙 Night Stalker', '😼 Ninefold Life'],
        traitsGr: ['🍀 Ταλισμαν τύχης', '🌙 Νυχτερινός κυνηγός', '😼 Εννέα ζωές'],
        prefs: { likes: ['pet', 'play', 'snack'], dislikes: ['clean', 'scold'], favorite: 'pet' }
    },
    phoenix: {
        name: 'Ashborn Phoenix', nameGr: 'Ashborn Phoenix',
        emoji: '🔥', color: '#ff3d00', rarity: 'Legendary', rarityGr: 'Θρύλος',
        element: 'Solar Flame', elementGr: 'Φλόγα & Αναγέννηση',
        description: 'Mythic boss firebird of solar wrath',
        descriptionGr: 'Μυθικό πουλί-φωτιά της ηλιακής οργής',
        lore: 'Born of sacred pyres and boss-battle suns, this immortal rises in fury — a living corona of beauty, rage, and rebirth.',
        loreGr: 'Γεννημένος από ιερές φλόγες — αναγεννιέται αιώνια με οργή και μεγαλοπρέπεια.',
        traits: ['🔥 Eternal Pyre', '⚔️ Boss Wrath', '☀️ Solar Corona'],
        traitsGr: ['🔥 Αιώνια φλόγα', '⚔️ Οργή Boss', '☀️ Ηλιακή κορώνα'],
        prefs: { likes: ['play', 'praise', 'lights_on'], dislikes: ['lights_off', 'scold'], favorite: 'praise' }
    },
    crystal: {
        name: 'Prism Titan', nameGr: 'Prism Titan',
        emoji: '💎', color: '#4dd0e1', rarity: 'Epic', rarityGr: 'Επικό',
        element: 'Aether & Stone', elementGr: 'Πέτρα & Φως',
        description: 'Sentient gem colossus from the deep vaults',
        descriptionGr: 'Ζωντανό πετράδι από βαθιά σπήλαια',
        lore: 'Carved across millennia in crystal vaults, this titan refracts light into blades of pure mana.',
        loreGr: 'Διαμορφώθηκε σε σπηλιές για χιλιετίες — ανακλά φως και μαγεία.',
        traits: ['💎 Adamant Shell', '🌈 Prism Barrage', '✨ Mana Reservoir'],
        traitsGr: ['💎 Σκληρό σαν διαμάντι', '🌈 Πρίσμα φωτός', '✨ Αποθήκη μαγείας'],
        prefs: { likes: ['clean', 'medicine', 'toilet'], dislikes: ['snack', 'scold'], favorite: 'clean' }
    }
};

/** Coin cost when using care actions from the care panel (0 = free). */
const MASCOT_CARE_COIN_COSTS = {
    meal: 25,
    snack: 15,
    medicine: 35,
    clean: 20,
    pet: 0,
    toilet: 0,
    praise: 0,
    scold: 0,
    play: 0,
    lights: 0,
};

const MASCOT_MOOD_MESSAGES = {
    happy: ['Ναι!', 'Χαρά!', 'Τέλεια!', 'Μου αρέσει!'],
    curious: ['Τι έγινε;', 'Χμμ;', 'Λέγε…', 'Ενδιαφέρον!'],
    sleepy: ['Ζζζ…', 'Νύσταξα…', 'Ήσυχα…', 'Λίγο ακόμα…'],
    hungry: ['Πεινάω…', 'Φαΐ;', 'Το στομάχι μου!', 'Κάτι νόστιμο;'],
    playful: ['Πάμε!', 'Παίξε!', 'Έλα δω!', 'Γρήγορα!'],
    proud: ['Το ήξερα!', 'Άξιος!', 'Κοίτα με!', 'Επικό!'],
    grumpy: ['Όχι…', 'Μπα.', 'Άστο.', 'Χμμφ.'],
    calm: ['Ήρεμα…', 'Οκ.', 'Όλα καλά.', 'Σιγά-σιγά.'],
};

const MASCOT_WORK_REACTION_MESSAGES = {
    statusChange: ['Νέο status!', 'Άλλη μία!', 'Προχωράμε!', 'Ωραία αλλαγή!'],
    repairDone: ['Παράδοση!', 'Τέλος!', 'Μπράβο!', 'Άλλη μία έτοιμη!'],
    newOrder: ['Παραγγελία!', 'Ανταλλακτικό!', 'Νέα δουλειά!', 'Πάμε!'],
    idle: ['Πού πήγε το κατσαβίδι;', 'Τι θα χαλάσει σήμερα;', 'Έτοιμος!', 'Χμμ…'],
    eod: ['Τέλος ημέρας;', 'Checklist!', 'Φεύγουμε;', 'Καλό βράδυ!'],
};

let mascotMood = 'calm';
let mascotMoodTimeout = null;
let lastMascotWorkReactAt = 0;

/** Drag-to-park / focus quiet interaction state */
let mascotPositionLocked = false;
let mascotParkedX = null;
let mascotParkedY = null;
let mascotIsDragging = false;
let mascotDragMoved = false;
let mascotSuppressClickUntil = 0;
let mascotClickOpenTimer = null;
let mascotFocusQuietUntil = 0;
let mascotFocusQuietTimer = null;

/** Nickname + taught tricks (used by myman_mascot_play.js) */
let tamagotchiNickname = '';
let tamagotchiTaughtTricks = { unlocked: [], practice: {} };
let mascotTrickCycleIndex = 0;

const MASCOT_FOCUS_QUIET_MS = 25 * 60 * 1000;
const MASCOT_DRAG_THRESHOLD_PX = 6;
const MASCOT_TRICK_BY_CHARACTER = {
    dragon: 'energized',
    robot: 'eureka',
    slime: 'happy',
    plant: 'sunny',
    ghost: 'glitching',
    cat: 'happy',
    phoenix: 'energized',
    crystal: 'eureka',
};

function getMascotCareCoinCost(actionId) {
    return Number(MASCOT_CARE_COIN_COSTS[actionId] || 0);
}

function trySpendMascotCareCoins(STORAGE_KEYS, actionId, config) {
    const cost = getMascotCareCoinCost(actionId);
    if (cost <= 0) return { ok: true, cost: 0 };
    if (config?.debugEnabled) return { ok: true, cost: 0, free: true };
    const coins = Number(GM_getValue(STORAGE_KEYS.USER_COINS, 0) || 0);
    if (coins < cost) {
        showMascotBubble(`Θέλω ${cost} 🪙!`, 2000);
        if (typeof window.showNotification === 'function') {
            window.showNotification('error', `Χρειάζονται ${cost} Fixer-Coins`);
        }
        return { ok: false, cost };
    }
    const next = coins - cost;
    GM_setValue(STORAGE_KEYS.USER_COINS, next);
    if (typeof window.updateCoinBalanceUI === 'function') {
        window.updateCoinBalanceUI(STORAGE_KEYS, next, config || window.config);
    }
    return { ok: true, cost };
}

function getActiveMascotPrefs() {
    if (!tamagotchiCharacterType || tamagotchiCharacterType === 'none') return null;
    return MASCOT_CHARACTERS[tamagotchiCharacterType]?.prefs || null;
}

function setMascotMood(mood, durationMs = 8000) {
    const allowed = Object.keys(MASCOT_MOOD_MESSAGES);
    if (!allowed.includes(mood)) mood = 'calm';
    mascotMood = mood;
    const el = document.getElementById('tm-mascot-container');
    if (el) {
        [...el.classList].forEach((cls) => {
            if (cls.startsWith('mascot-mood-')) el.classList.remove(cls);
        });
        el.classList.add(`mascot-mood-${mood}`);
    }
    if (mascotMoodTimeout) {
        clearTimeout(mascotMoodTimeout);
        mascotMoodTimeout = null;
    }
    if (durationMs > 0) {
        mascotMoodTimeout = setTimeout(() => {
            mascotMoodTimeout = null;
            setMascotMood('calm', 0);
        }, durationMs);
    }
}

function pickMoodBubble(fallbackPool) {
    const moodPool = MASCOT_MOOD_MESSAGES[mascotMood];
    if (moodPool?.length && Math.random() < 0.55) {
        return moodPool[Math.floor(Math.random() * moodPool.length)];
    }
    if (Array.isArray(fallbackPool) && fallbackPool.length) {
        return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    }
    return null;
}

/**
 * Apply like/dislike/favorite bonus after a care action.
 * @returns {{reaction:'love'|'like'|'dislike'|null, bonus:number}}
 */
function applyMascotCarePreference(actionId, config, STORAGE_KEYS) {
    const prefs = getActiveMascotPrefs();
    if (!prefs || tamagotchiStage === 'egg' || tamagotchiIsDead) {
        return { reaction: null, bonus: 0 };
    }
    if (prefs.favorite === actionId) {
        updatePetStats(config, STORAGE_KEYS, 10, 0);
        setMascotMood('proud', 9000);
        showMascotBubble(pickMoodBubble(['Το λατρεύω!', 'Ναι ναι ναι!', 'Αγαπημένο!']) || 'Το λατρεύω!', 2000);
        return { reaction: 'love', bonus: 10 };
    }
    if (prefs.likes?.includes(actionId)) {
        updatePetStats(config, STORAGE_KEYS, 5, 0);
        setMascotMood('happy', 7000);
        return { reaction: 'like', bonus: 5 };
    }
    if (prefs.dislikes?.includes(actionId)) {
        updatePetStats(config, STORAGE_KEYS, -6, 0);
        setMascotMood('grumpy', 8000);
        showMascotBubble(pickMoodBubble(['Όχι αυτό…', 'Μπα.', 'Άστο καλύτερα.']) || 'Όχι αυτό…', 1800);
        return { reaction: 'dislike', bonus: -6 };
    }
    return { reaction: null, bonus: 0 };
}

/**
 * Work-linked mascot reactions (throttled).
 * @param {'statusChange'|'repairDone'|'newOrder'|'idle'|'eod'} type
 */
function notifyMascotWorkEvent(type, config) {
    if (config?.interactiveMascotEnabled === false) return;
    if (tamagotchiIsDead || tamagotchiStage === 'egg' || tamaCinematicLock) return;
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) return;
    if (isMascotFocusQuiet()) return;

    const now = Date.now();
    const minGap = type === 'idle' ? 45000 : 12000;
    if (now - lastMascotWorkReactAt < minGap) return;
    lastMascotWorkReactAt = now;

    const pool = MASCOT_WORK_REACTION_MESSAGES[type] || MASCOT_WORK_REACTION_MESSAGES.idle;
    const text = pickMoodBubble(pool) || pool[Math.floor(Math.random() * pool.length)];

    if (type === 'repairDone') {
        setMascotMood('proud', 10000);
        setMascotState(config || window.config || {}, 'happy', 4000);
    } else if (type === 'newOrder') {
        setMascotMood('curious', 8000);
        setMascotState(config || window.config || {}, 'eureka', 2500);
    } else if (type === 'statusChange') {
        setMascotMood('curious', 6000);
    } else if (type === 'eod') {
        setMascotMood('sleepy', 12000);
    } else if (type === 'idle') {
        if (petStats.hunger < 35) setMascotMood('hungry', 8000);
        else if (petStats.happiness > 70) setMascotMood('playful', 8000);
        else setMascotMood('calm', 6000);
    }

    showMascotBubble(text, type === 'eod' ? 3500 : 2200);
}

const MASCOT_CARE_ACTION_LABELS_GR = {
    meal: 'Γεύμα',
    snack: 'Σνακ',
    pet: 'Χάδι',
    clean: 'Καθάρισμα',
    medicine: 'Φάρμακο',
    toilet: 'Τουαλέτα',
    praise: 'Έπαινος',
    scold: 'Επίπληξη',
    play: 'Παιχνίδι',
    lights_on: 'Φώτα ανοιχτά',
    lights_off: 'Φώτα κλειστά',
};

function careCoinHint(baseHint, actionId) {
    const cost = getMascotCareCoinCost(actionId);
    if (cost <= 0) return baseHint;
    return `${baseHint} · ${cost}🪙`;
}

function getMascotInventoryCounts(STORAGE_KEYS) {
    const keys = STORAGE_KEYS || window.STORAGE_KEYS || {};
    return {
        food: Math.max(0, Number(GM_getValue(keys.MASCOT_FOOD_ITEMS, 0) || 0)),
        treats: Math.max(0, Number(GM_getValue(keys.MASCOT_TREAT_ITEMS, 0) || 0)),
    };
}

/** Prefer inventory for meal (food) / snack (treat); fall back to Fixer-Coins. */
function tryPayForMascotCare(STORAGE_KEYS, actionId, config) {
    const keys = STORAGE_KEYS || window.STORAGE_KEYS;
    if (!keys) return trySpendMascotCareCoins(STORAGE_KEYS, actionId, config);

    if (actionId === 'meal') {
        const food = Math.max(0, Number(GM_getValue(keys.MASCOT_FOOD_ITEMS, 0) || 0));
        if (food > 0) {
            GM_setValue(keys.MASCOT_FOOD_ITEMS, food - 1);
            return { ok: true, paidWith: 'food', remaining: food - 1, cost: 0 };
        }
    }
    if (actionId === 'snack') {
        const treats = Math.max(0, Number(GM_getValue(keys.MASCOT_TREAT_ITEMS, 0) || 0));
        if (treats > 0) {
            GM_setValue(keys.MASCOT_TREAT_ITEMS, treats - 1);
            return { ok: true, paidWith: 'treat', remaining: treats - 1, cost: 0 };
        }
    }
    const coin = trySpendMascotCareCoins(STORAGE_KEYS, actionId, config);
    return { ...coin, paidWith: coin.ok ? 'coins' : null };
}

function careFeedHint(baseHint, actionId, STORAGE_KEYS) {
    const inv = getMascotInventoryCounts(STORAGE_KEYS);
    if (actionId === 'meal' && inv.food > 0) return `${baseHint} · απόθεμα ${inv.food}`;
    if (actionId === 'snack' && inv.treats > 0) return `${baseHint} · λιχουδιές ${inv.treats}`;
    return careCoinHint(baseHint, actionId);
}

function isMascotFocusQuiet() {
    return mascotFocusQuietUntil > Date.now();
}

function syncMascotInteractionClasses(container = document.getElementById('tm-mascot-container')) {
    if (!container) return;
    container.classList.toggle('mascot-parked', !!mascotPositionLocked && !(typeof mascotHideSeekActive !== 'undefined' && mascotHideSeekActive));
    container.classList.toggle('mascot-dragging', !!mascotIsDragging);
    container.classList.toggle('mascot-focus-quiet', isMascotFocusQuiet());
    container.classList.toggle('mascot-chasing', typeof mascotChaseEnabled !== 'undefined' && !!mascotChaseEnabled);
    container.classList.toggle('mascot-hiding', typeof mascotHideSeekActive !== 'undefined' && !!mascotHideSeekActive);
}

function setMascotParked(locked, x = null, y = null, STORAGE_KEYS = window.STORAGE_KEYS) {
    mascotPositionLocked = !!locked;
    if (locked) {
        const pos = (Number.isFinite(x) && Number.isFinite(y))
            ? { x, y }
            : getMascotTranslate();
        const container = document.getElementById('tm-mascot-container');
        const clamped = applyMascotPosition(container, pos.x, pos.y);
        mascotParkedX = clamped.x;
        mascotParkedY = clamped.y;
        stopRoaming(window.config || {});
    } else {
        mascotParkedX = null;
        mascotParkedY = null;
    }
    syncMascotInteractionClasses();
    if (STORAGE_KEYS && typeof saveTamagotchiData === 'function') {
        saveTamagotchiData(STORAGE_KEYS);
    }
}

function restoreMascotParkedPosition() {
    if (!mascotPositionLocked || !Number.isFinite(mascotParkedX) || !Number.isFinite(mascotParkedY)) return;
    const container = document.getElementById('tm-mascot-container');
    if (!container) return;
    applyMascotPosition(container, mascotParkedX, mascotParkedY);
    syncMascotInteractionClasses();
}

function clearMascotFocusQuietTimer() {
    if (mascotFocusQuietTimer) {
        clearTimeout(mascotFocusQuietTimer);
        mascotFocusQuietTimer = null;
    }
}

function endMascotFocusQuiet(config, STORAGE_KEYS, { announce = true } = {}) {
    clearMascotFocusQuietTimer();
    const wasActive = mascotFocusQuietUntil > 0;
    mascotFocusQuietUntil = 0;
    // After focus, unlock so it can roam again from the current spot
    mascotPositionLocked = false;
    mascotParkedX = null;
    mascotParkedY = null;
    syncMascotInteractionClasses();
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    if (wasActive && announce) {
        showMascotBubble('Τέλος εστίασης!', 2000);
        setMascotMood('happy', 6000);
    }
    if (shouldMascotBeRoaming(config || window.config)) {
        startRoaming(config || window.config);
    }
}

function startMascotFocusQuiet(config, STORAGE_KEYS, durationMs = MASCOT_FOCUS_QUIET_MS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg') return false;
    clearMascotFocusQuietTimer();
    mascotFocusQuietUntil = Date.now() + durationMs;
    // Sit still where it is
    const pos = getMascotTranslate();
    setMascotParked(true, pos.x, pos.y, STORAGE_KEYS);
    setMascotState(config || window.config || {}, 'reading', 0);
    setMascotMood('calm', 0);
    syncMascotInteractionClasses();
    saveTamagotchiData(STORAGE_KEYS);
    mascotFocusQuietTimer = setTimeout(() => {
        endMascotFocusQuiet(config, STORAGE_KEYS, { announce: true });
    }, durationMs);
    return true;
}

function scheduleMascotFocusQuietResume(config, STORAGE_KEYS) {
    clearMascotFocusQuietTimer();
    if (!isMascotFocusQuiet()) {
        mascotFocusQuietUntil = 0;
        syncMascotInteractionClasses();
        return;
    }
    const remaining = Math.max(0, mascotFocusQuietUntil - Date.now());
    mascotFocusQuietTimer = setTimeout(() => {
        endMascotFocusQuiet(config, STORAGE_KEYS, { announce: true });
    }, remaining);
    syncMascotInteractionClasses();
}

function getMascotFocusQuietRemainingLabel() {
    if (!isMascotFocusQuiet()) return '';
    const mins = Math.ceil((mascotFocusQuietUntil - Date.now()) / 60000);
    return `🎯 Εστίαση ~${mins}′`;
}

function playMascotTrick(config, STORAGE_KEYS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg' || tamaCinematicLock) return false;
    if (isMascotFocusQuiet()) {
        // Soft ack without chatty bubbles
        setMascotState(config || window.config || {}, 'happy', 1200);
        return true;
    }
    const trick = MASCOT_TRICK_BY_CHARACTER[tamagotchiCharacterType] || 'happy';
    setMascotState(config || window.config || {}, trick, 2800);
    setMascotMood('playful', 5000);
    updatePetStats(config, STORAGE_KEYS, 3, 0);
    const lines = {
        dragon: ['Φλόγα!', 'Ρρρ!', 'Κοίτα αυτό!'],
        robot: ['Beep-boop!', 'Trick.exe!', 'Σύστημα OK!'],
        slime: ['Μπλουπ!', 'Γλίτσα-τρικ!', 'Γιούπι!'],
        plant: ['Φύλλο-φρου!', 'Ανθίζω!', 'Ηλιοτρόπιο!'],
        ghost: ['Μπου!', 'Φανταστικό!', 'Ουουου!'],
        cat: ['Νιάου!', 'Περπατώ κομψά!', 'Γουργούρ!'],
        phoenix: ['Φτερούγες!', 'Αναγέννηση!', 'Φωτιά!'],
        crystal: ['Λάμψη!', 'Prism!', 'Κρύσταλλο!'],
    };
    const pool = lines[tamagotchiCharacterType] || ['Τα-δα!', 'Κοίτα!', 'Τρικ!'];
    showMascotBubble(pool[Math.floor(Math.random() * pool.length)], 1800);
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    return true;
}

/** Shop consumable side-effects (health / clean / prefs). */
function applyMascotShopCareEffect(effect, config, STORAGE_KEYS) {
    if (!effect || tamagotchiIsDead || tamagotchiStage === 'egg') return;
    let changed = false;
    if (effect.health) {
        tamagotchiHealth = Math.min(100, tamagotchiHealth + Number(effect.health || 0));
        const container = document.getElementById('tm-mascot-container');
        if (container) updateTamagotchiStats(container);
        changed = true;
    }
    if (effect.clean) {
        tamagotchiPoopCount = 0;
        if (typeof updatePoopIndicator === 'function') updatePoopIndicator();
        changed = true;
    }
    if (effect.careAction) {
        applyMascotCarePreference(effect.careAction, config, STORAGE_KEYS);
        changed = true;
    }
    if (changed && STORAGE_KEYS && typeof saveTamagotchiData === 'function') {
        saveTamagotchiData(STORAGE_KEYS);
    }
}

function playEpicSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a dramatic reveal sound
        const playTone = (freq, startTime, duration, volume = 0.1) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        const now = audioContext.currentTime;
        // Epic dramatic reveal sound
        playTone(200, now, 0.15, 0.15);
        playTone(300, now + 0.15, 0.15, 0.15);
        playTone(400, now + 0.3, 0.15, 0.15);
        playTone(600, now + 0.45, 0.3, 0.2);
    } catch (e) {
        console.log('[Mascot] Audio not available:', e);
    }
}

function screenShake(duration = 500, intensityMax = 5) {
    const body = document.body;
    const originalTransform = body.style.transform;
    const startTime = Date.now();
    const peak = Math.max(0.5, intensityMax);

    const shake = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            const intensity = (1 - elapsed / duration) * peak;
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            body.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        } else {
            body.style.transform = originalTransform;
        }
    };
    shake();
}

let tamaCinematicLock = false;
let tamaCinematicGeneration = 0;
const tamaCinematicTimeouts = [];
/** Prevents duplicate egg→baby hatch cinematics for the same egg cycle. */
let tamagotchiEggHatchCinematicDone = false;

function scheduleTamagotchiCinematic(fn, delayMs) {
    const gen = tamaCinematicGeneration;
    const id = setTimeout(() => {
        if (gen !== tamaCinematicGeneration) return;
        fn();
    }, delayMs);
    tamaCinematicTimeouts.push(id);
    return id;
}

function cancelTamagotchiCinematics() {
    tamaCinematicGeneration += 1;
    tamaCinematicTimeouts.forEach((id) => clearTimeout(id));
    tamaCinematicTimeouts.length = 0;
    tamaCinematicLock = false;

    document.getElementById('tm-tama-hatch-panel')?.remove();
    document.getElementById('tm-tama-lucky-panel')?.remove();
    document.getElementById('tm-tama-death-cinematic')?.remove();
    document.getElementById('tm-tama-execution-panel')?.remove();
    document.getElementById('tm-tama-execution-inplace')?.remove();
    document.querySelectorAll('style[data-tm-lucky-spin]').forEach((el) => el.remove());

    const mascotContainer = document.getElementById('tm-mascot-container');
    mascotContainer?.classList.remove(
        'mascot-hatching', 'mascot-dying', 'mascot-executed',
        'mascot-exec-scared', 'mascot-exec-hit', 'mascot-exec-dying', 'mascot-exec-dissolve',
    );
}

function ensureTamaCinematicStyles() {
    const STYLE_VER = 'lucky-v5';
    const existing = document.getElementById('tm-tama-cinematic-styles');
    if (existing?.dataset.tmVer === STYLE_VER) return;
    existing?.remove();
    const style = document.createElement('style');
    style.id = 'tm-tama-cinematic-styles';
    style.dataset.tmVer = STYLE_VER;
    style.textContent = `
        .tm-tama-cinematic-overlay {
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(ellipse at center, rgba(10, 20, 30, 0.92) 0%, rgba(0, 0, 0, 0.97) 70%);
            animation: tm-tama-fade-in 0.45s ease-out;
            font-family: 'Segoe UI', Tahoma, sans-serif;
        }
        .tm-tama-cinematic-panel {
            width: min(92vw, 520px);
            background: linear-gradient(180deg, #1a2a1a 0%, #0d1a0d 100%);
            border: 3px solid #3d5c3d;
            border-radius: 18px;
            box-shadow: 0 0 0 2px #1a301a, 0 20px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(100, 200, 100, 0.08);
            padding: 28px 24px 24px;
            text-align: center;
            color: #c8f0c8;
            position: relative;
            overflow: hidden;
        }
        .tm-tama-cinematic-panel::before {
            content: '';
            position: absolute;
            inset: 8px;
            border: 1px dashed rgba(120, 200, 120, 0.25);
            border-radius: 12px;
            pointer-events: none;
        }
        .tm-tama-lcd-title {
            font-size: 11px;
            letter-spacing: 3px;
            color: #6fcf6f;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .tm-tama-cinematic-title {
            font-size: 22px;
            font-weight: 700;
            color: #e8ffe8;
            margin: 0 0 6px;
            text-shadow: 0 0 12px rgba(120, 255, 120, 0.4);
        }
        .tm-tama-cinematic-subtitle {
            font-size: 13px;
            color: #8fbc8f;
            margin: 0 0 20px;
        }
        .tm-tama-hatch-egg {
            width: 140px;
            height: 170px;
            margin: 0 auto 20px;
            position: relative;
            animation: tm-egg-hatch-wobble 0.55s ease-in-out infinite;
        }
        .tm-tama-hatch-egg-body {
            width: 100%;
            height: 100%;
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            background: radial-gradient(ellipse at 35% 30%, #fff8e8 0%, #f5e6c8 30%, #d4b896 70%, #a08060 100%);
            border: 3px solid #8b7355;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset -8px -12px 20px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }
        .tm-tama-hatch-egg-glow {
            position: absolute;
            inset: -20px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 230, 150, 0.5) 0%, transparent 70%);
            animation: tm-egg-glow-pulse 1.2s ease-in-out infinite;
            pointer-events: none;
        }
        .tm-tama-hatch-crack {
            position: absolute;
            background: #5a4a3a;
            transform-origin: center;
            opacity: 0;
        }
        .tm-tama-hatch-crack-1 {
            width: 3px; height: 45px; top: 25%; left: 48%;
            transform: rotate(-15deg);
            animation: tm-crack-appear 0.4s ease-out 0.8s forwards;
        }
        .tm-tama-hatch-crack-2 {
            width: 3px; height: 35px; top: 40%; left: 35%;
            transform: rotate(25deg);
            animation: tm-crack-appear 0.4s ease-out 1.2s forwards;
        }
        .tm-tama-hatch-crack-3 {
            width: 3px; height: 40px; top: 38%; left: 58%;
            transform: rotate(-30deg);
            animation: tm-crack-appear 0.4s ease-out 1.6s forwards;
        }
        .tm-tama-hatch-crack-4 {
            width: 50px; height: 3px; top: 52%; left: 30%;
            transform: rotate(10deg);
            animation: tm-crack-appear 0.4s ease-out 2s forwards;
        }
        .tm-tama-hatch-status {
            font-size: 14px;
            color: #9fdf9f;
            min-height: 20px;
            animation: tm-tama-blink 1.5s step-end infinite;
        }
        .tm-tama-hatch-burst {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle, rgba(255,255,220,0.95) 0%, rgba(255,200,100,0.6) 40%, transparent 70%);
            opacity: 0;
            pointer-events: none;
            border-radius: 18px;
        }
        .tm-tama-hatch-burst.active {
            animation: tm-hatch-burst 0.7s ease-out forwards;
        }
        .tm-tama-lucky-slot {
            --lucky-cell-w: 96px;
            --lucky-slot-h: 120px;
            position: relative;
            margin: 0 auto 22px;
            width: 100%;
            max-width: 420px;
            height: var(--lucky-slot-h);
            overflow: hidden;
            border-radius: 14px;
            border: 1px solid color-mix(in srgb, var(--lucky-color, #6fcf6f) 55%, #fff);
            background:
                linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 28%),
                rgba(0, 0, 0, 0.42);
            box-shadow:
                0 0 0 1px rgba(0,0,0,0.35),
                0 12px 36px rgba(0,0,0,0.35),
                inset 0 0 40px color-mix(in srgb, var(--lucky-color, #6fcf6f) 18%, transparent);
        }
        .tm-tama-lucky-slot::before,
        .tm-tama-lucky-slot::after {
            content: '';
            position: absolute;
            top: 0; bottom: 0;
            width: 72px;
            z-index: 3;
            pointer-events: none;
        }
        .tm-tama-lucky-slot::before {
            left: 0;
            background: linear-gradient(90deg, rgba(0,0,0,0.65), transparent);
        }
        .tm-tama-lucky-slot::after {
            right: 0;
            background: linear-gradient(270deg, rgba(0,0,0,0.65), transparent);
        }
        /* Frame sits dead-center; no transform pulse (that caused visual misalignment) */
        .tm-tama-lucky-indicator {
            position: absolute;
            left: 50%;
            top: 8px;
            bottom: 8px;
            width: var(--lucky-cell-w);
            margin-left: calc(var(--lucky-cell-w) / -2);
            border: 2px solid var(--lucky-color, #6fcf6f);
            border-radius: 12px;
            box-shadow:
                0 0 0 1px color-mix(in srgb, var(--lucky-color, #6fcf6f) 35%, transparent),
                0 0 24px color-mix(in srgb, var(--lucky-color, #6fcf6f) 45%, transparent),
                inset 0 0 18px color-mix(in srgb, var(--lucky-color, #6fcf6f) 18%, transparent);
            pointer-events: none;
            z-index: 4;
            box-sizing: border-box;
            animation: tm-lucky-pulse 1.4s ease-in-out infinite;
        }
        .tm-tama-lucky-indicator::before,
        .tm-tama-lucky-indicator::after {
            content: '';
            position: absolute;
            left: 50%;
            width: 0;
            height: 0;
            margin-left: -7px;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
        }
        .tm-tama-lucky-indicator::before {
            top: -10px;
            border-top: 8px solid var(--lucky-color, #6fcf6f);
        }
        .tm-tama-lucky-indicator::after {
            bottom: -10px;
            border-bottom: 8px solid var(--lucky-color, #6fcf6f);
        }
        .tm-tama-lucky-scroll {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: stretch;
            gap: 0;
            padding: 0;
            margin: 0;
            will-change: transform;
            transform: translate3d(0, 0, 0);
        }
        .tm-tama-lucky-scroll.is-spinning .tm-tama-lucky-char {
            filter: blur(0.45px);
            opacity: 0.48;
        }
        .tm-tama-lucky-char {
            flex: 0 0 var(--lucky-cell-w);
            width: var(--lucky-cell-w);
            min-width: var(--lucky-cell-w);
            max-width: var(--lucky-cell-w);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            opacity: 0.38;
            box-sizing: border-box;
            padding: 0 2px;
            margin: 0;
            border: 0;
        }
        .tm-tama-lucky-char.selected {
            opacity: 1;
            filter: none;
        }
        .tm-tama-lucky-char-emoji {
            font-size: 40px;
            line-height: 1;
            display: block;
            height: 40px;
            width: 100%;
            text-align: center;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
        }
        .tm-tama-lucky-char.selected .tm-tama-lucky-char-emoji {
            filter: drop-shadow(0 0 12px var(--lucky-color, #6fcf6f));
        }
        .tm-tama-lucky-char-name {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.02em;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;
            line-height: 1.1;
        }
        .tm-tama-lucky-reveal {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
            pointer-events: none;
        }
        .tm-tama-lucky-reveal.visible {
            pointer-events: auto;
            animation: tm-lucky-reveal-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .tm-tama-lucky-slot.is-dimmed {
            opacity: 0.28;
            filter: blur(1px);
            transition: opacity 0.45s ease, filter 0.45s ease;
        }
        .tm-tama-death-message {
            font-size: 16px;
            color: #b0b0c0;
            font-style: italic;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        .tm-tama-death-options {
            opacity: 0;
        }
        .tm-tama-death-options.visible {
            animation: tm-lucky-reveal-in 0.6s ease-out forwards;
        }
        .tm-tama-death-stat {
            font-size: 13px;
            color: #888;
            margin: 4px 0;
        }
        .tm-tama-btn {
            border: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin: 6px;
        }
        .tm-tama-btn:hover { transform: scale(1.04); }
        .tm-tama-btn-revive { background: linear-gradient(135deg, #28a745, #1e7e34); color: #fff; }
        .tm-tama-btn-restart { background: linear-gradient(135deg, #dc3545, #a71d2a); color: #fff; }
        .tm-tama-btn-primary {
            background: linear-gradient(135deg, var(--lucky-color, #6fcf6f), #3d8b3d);
            color: #fff;
            box-shadow: 0 4px 16px color-mix(in srgb, var(--lucky-color, #6fcf6f) 50%, transparent);
        }
        #tm-mascot-container.mascot-hatching .tm-mascot-robot {
            animation: tm-egg-hatch-wobble 0.5s ease-in-out infinite !important;
        }
        #tm-mascot-container.mascot-hatching .tm-egg-crack {
            animation: tm-egg-crack-grow 2s ease-out forwards;
        }
        #tm-mascot-container.mascot-hatching .tm-egg-core {
            animation: tm-egg-core-pulse 0.8s ease-in-out infinite;
        }
        #tm-mascot-container.mascot-dying {
            pointer-events: none;
        }
        #tm-mascot-container.mascot-dying .tm-mascot-robot {
            transform-origin: 50% 85%;
            animation: tm-death-collapse 2.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards !important;
            filter: grayscale(0.4);
        }
        #tm-mascot-container.mascot-dead .tm-mascot-robot {
            filter: grayscale(1);
            opacity: 0.35;
            animation: none !important;
        }
        #tm-mascot-container.mascot-dead {
            pointer-events: none;
        }
        @keyframes tm-tama-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tm-egg-hatch-wobble {
            0%, 100% { transform: rotate(-4deg) scale(1); }
            25% { transform: rotate(4deg) scale(1.03); }
            50% { transform: rotate(-3deg) scale(1.01); }
            75% { transform: rotate(3deg) scale(1.02); }
        }
        @keyframes tm-egg-glow-pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.1); }
        }
        @keyframes tm-crack-appear {
            from { opacity: 0; transform: scaleY(0); }
            to { opacity: 1; transform: scaleY(1); }
        }
        @keyframes tm-hatch-burst {
            0% { opacity: 0; transform: scale(0.5); }
            40% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(1.8); }
        }
        @keyframes tm-tama-blink { 50% { opacity: 0.5; } }
        @keyframes tm-lucky-pulse {
            0%, 100% { opacity: 0.92; box-shadow: 0 0 0 1px color-mix(in srgb, var(--lucky-color, #6fcf6f) 35%, transparent), 0 0 18px color-mix(in srgb, var(--lucky-color, #6fcf6f) 35%, transparent), inset 0 0 14px color-mix(in srgb, var(--lucky-color, #6fcf6f) 14%, transparent); }
            50% { opacity: 1; box-shadow: 0 0 0 1px color-mix(in srgb, var(--lucky-color, #6fcf6f) 45%, transparent), 0 0 28px color-mix(in srgb, var(--lucky-color, #6fcf6f) 55%, transparent), inset 0 0 20px color-mix(in srgb, var(--lucky-color, #6fcf6f) 22%, transparent); }
        }
        @keyframes tm-lucky-reveal-in {
            from { opacity: 0; transform: translateY(18px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tm-death-collapse {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); filter: grayscale(0.2) brightness(1); opacity: 1; }
            12% { transform: translate(-10px, -8px) rotate(-14deg) scale(1.06); filter: grayscale(0.35) brightness(1.1); }
            28% { transform: translate(12px, 2px) rotate(10deg) scale(0.98); }
            42% { transform: translate(-6px, 10px) rotate(-22deg) scale(0.94); filter: grayscale(0.7) brightness(0.75); }
            58% { transform: translate(4px, 22px) rotate(-48deg) scale(0.9); }
            74% { transform: translate(0, 36px) rotate(-78deg) scale(0.86); filter: grayscale(1) brightness(0.45); opacity: 0.75; }
            100% { transform: translate(0, 44px) rotate(-90deg) scale(0.82); filter: grayscale(1) brightness(0.3) blur(1.5px); opacity: 0.25; }
        }
        @keyframes tm-death-fade-mascot {
            0% { opacity: 0.85; transform: translateX(-50%) scale(1) rotate(0deg); filter: grayscale(0.3); }
            40% { opacity: 0.7; transform: translateX(-50%) translateY(8px) scale(0.96) rotate(-8deg); filter: grayscale(0.7); }
            100% { opacity: 0.15; transform: translateX(-50%) translateY(28px) scale(0.85) rotate(-25deg); filter: grayscale(1); }
        }
        @keyframes tm-death-ghost-rise {
            0% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.7); filter: blur(2px); }
            18% { opacity: 1; transform: translateX(-50%) translateY(-8px) scale(1.05); filter: blur(0); }
            55% { opacity: 0.85; }
            100% { opacity: 0; transform: translateX(-50%) translateY(-150px) scale(1.15); filter: blur(4px); }
        }
        @keyframes tm-death-star {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            40% { opacity: 1; transform: scale(1.2) rotate(20deg); }
            100% { opacity: 0; transform: scale(0.4) rotate(-10deg); }
        }
        @keyframes tm-death-ripple {
            0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.7; }
            100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
        @keyframes tm-death-title-in {
            0% { opacity: 0; letter-spacing: 0.6em; transform: scale(1.2); }
            30% { opacity: 1; letter-spacing: 0.22em; transform: scale(1); }
            80% { opacity: 1; }
            100% { opacity: 0.85; letter-spacing: 0.18em; }
        }
        .tm-tama-death-scene {
            position: relative;
            height: 240px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .tm-tama-death-ripple {
            position: absolute;
            left: 50%;
            top: 58%;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 2px solid rgba(180, 190, 220, 0.45);
            pointer-events: none;
            animation: tm-death-ripple 2.2s ease-out forwards;
        }
        .tm-tama-death-ripple:nth-child(2) { animation-delay: 0.35s; border-color: rgba(140, 160, 220, 0.3); }
        .tm-tama-death-title {
            font-size: clamp(22px, 5vw, 36px);
            font-weight: 800;
            color: #e8e8f0;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            margin: 0 0 8px;
            text-shadow: 0 0 28px rgba(120, 140, 200, 0.45);
            animation: tm-death-title-in 2.8s ease-out forwards;
        }
        .tm-tama-death-mascot {
            font-size: 72px;
            position: absolute;
            left: 50%;
            bottom: 28px;
            transform: translateX(-50%);
            filter: grayscale(1);
            opacity: 0.7;
            animation: tm-death-fade-mascot 2.6s ease-out forwards;
        }
        .tm-tama-death-ghost {
            font-size: 52px;
            position: absolute;
            left: 50%;
            bottom: 40px;
            transform: translateX(-50%);
            opacity: 0;
            animation: tm-death-ghost-rise 3.4s ease-out 0.45s forwards;
            filter: drop-shadow(0 0 16px rgba(180, 200, 255, 0.7));
        }
        .tm-tama-death-stars span {
            position: absolute;
            font-size: 14px;
            opacity: 0;
            color: #c8d0ff;
            animation: tm-death-star 2.4s ease-out infinite;
        }
        @keyframes tm-egg-crack-grow {
            from { stroke-dashoffset: 20; opacity: 0.3; }
            to { opacity: 1; }
        }
        @keyframes tm-egg-core-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
}

function ensureMascotExecutionStyles() {
    const STYLE_VER = 'inplace-v5';
    const existing = document.getElementById('tm-tama-execution-styles');
    if (existing?.dataset.tmVer === STYLE_VER) return;
    existing?.remove();
    const style = document.createElement('style');
    style.id = 'tm-tama-execution-styles';
    style.dataset.tmVer = STYLE_VER;
    style.textContent = `
        /* In-place kill: no popup — effects anchored to live mascot */
        .tm-exec-inplace {
            position: fixed;
            inset: 0;
            z-index: 10000;
            pointer-events: none;
            overflow: visible;
        }
        .tm-exec-inplace-vignette {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 45% 40% at var(--tm-exec-aim-x, 50%) var(--tm-exec-aim-y, 50%),
                rgba(40, 0, 8, 0.22) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .tm-exec-inplace.is-live .tm-exec-inplace-vignette { opacity: 1; }
        .tm-exec-inplace.is-firing .tm-exec-inplace-vignette {
            background: radial-gradient(ellipse 50% 45% at var(--tm-exec-aim-x, 50%) var(--tm-exec-aim-y, 50%),
                rgba(90, 0, 12, 0.35) 0%, transparent 72%);
        }
        .tm-exec-inplace.is-dying .tm-exec-inplace-vignette {
            opacity: 1;
            background:
                radial-gradient(ellipse 55% 50% at var(--tm-exec-aim-x, 50%) var(--tm-exec-aim-y, 50%),
                    rgba(20, 0, 8, 0.55) 0%, transparent 68%),
                rgba(0, 0, 0, 0.42);
            animation: tm-exec-vignette-die 2.4s ease-out forwards;
        }
        .tm-exec-inplace.is-dying {
            transition: filter 0.8s ease;
            filter: saturate(0.55) contrast(1.08);
        }
        .tm-exec-gun-wrap {
            position: fixed;
            width: 240px;
            height: 100px;
            z-index: 8;
            transform: translate3d(40px, 8px, 0) rotate(-4deg);
            opacity: 0;
            transform-origin: 88% 65%;
            will-change: transform, opacity;
            filter: drop-shadow(0 8px 14px rgba(0,0,0,0.45));
            left: var(--tm-exec-gun-left, 0px);
            top: var(--tm-exec-gun-top, 0px);
            margin: 0;
            right: auto;
            bottom: auto;
        }
        .tm-exec-gun-wrap.on-stage {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(-2deg);
        }
        .tm-exec-gun-wrap.on-stage.aimed {
            transform: translate3d(-18px, -2px, 0) rotate(-8deg);
        }
        .tm-exec-gun-wrap.enter {
            animation: tm-exec-gun-enter 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .tm-exec-gun-wrap.aim {
            animation: tm-exec-gun-aim 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .tm-exec-gun-wrap.recoil {
            animation: tm-exec-gun-recoil 0.12s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .tm-exec-gun { width: 100%; height: 100%; display: block; }
        .tm-exec-muzzle {
            position: absolute;
            left: -4px;
            top: 18px;
            width: 64px;
            height: 64px;
            pointer-events: none;
            opacity: 0;
        }
        .tm-exec-muzzle::before,
        .tm-exec-muzzle::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
        }
        .tm-exec-muzzle::before {
            background: radial-gradient(circle, rgba(255,250,220,0.95) 0%, rgba(255,180,60,0.7) 28%, rgba(255,80,30,0.35) 52%, transparent 68%);
        }
        .tm-exec-muzzle::after {
            background: conic-gradient(from 200deg, transparent 0%, rgba(255,220,140,0.7) 8%, transparent 16%, transparent 40%, rgba(255,200,100,0.5) 48%, transparent 56%);
            mix-blend-mode: screen;
        }
        .tm-exec-muzzle.flash {
            animation: tm-exec-muzzle-flash 0.18s ease-out forwards;
        }
        .tm-exec-tracer {
            position: fixed;
            width: 0;
            height: 2px;
            border-radius: 2px;
            background: linear-gradient(90deg, transparent, rgba(255,230,170,0.95), rgba(255,160,60,0.8));
            box-shadow: 0 0 8px rgba(255, 180, 80, 0.7);
            opacity: 0;
            z-index: 7;
            transform-origin: right center;
            pointer-events: none;
            left: var(--tm-exec-tracer-left, 0px);
            top: var(--tm-exec-tracer-top, 0px);
            margin: 0;
        }
        .tm-exec-tracer.fly {
            animation: tm-exec-tracer-fly 0.11s linear forwards;
        }
        .tm-exec-casings {
            position: fixed;
            left: var(--tm-exec-gun-left, 0px);
            top: var(--tm-exec-gun-top, 0px);
            width: 240px;
            height: 100px;
            pointer-events: none;
            z-index: 9;
            overflow: visible;
            margin: 0;
        }
        .tm-exec-casing {
            position: absolute;
            right: 22%;
            bottom: 58px;
            width: 10px;
            height: 4px;
            border-radius: 1px;
            background: linear-gradient(180deg, #d4a84b, #8a6a28);
            box-shadow: 0 1px 2px rgba(0,0,0,0.4);
            opacity: 0;
            animation: tm-exec-casing-eject 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
        }
        .tm-exec-hitmark {
            position: fixed;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 220, 180, 0.9);
            box-shadow: 0 0 16px 6px rgba(255, 100, 60, 0.45);
            opacity: 0;
            z-index: 4;
            pointer-events: none;
            left: var(--tm-exec-aim-x, 0px);
            top: var(--tm-exec-aim-y, 0px);
            margin: -4px 0 0 -4px;
        }
        .tm-exec-hitmark.show {
            animation: tm-exec-hitmark 0.5s ease-out forwards;
        }
        .tm-exec-rings {
            position: fixed;
            width: 80px;
            height: 80px;
            pointer-events: none;
            z-index: 3;
            opacity: 0;
            left: var(--tm-exec-aim-x, 0px);
            top: var(--tm-exec-aim-y, 0px);
            margin: -40px 0 0 -40px;
        }
        .tm-exec-rings.show { opacity: 1; }
        .tm-exec-rings span {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 1.5px solid rgba(255, 140, 120, 0.55);
            animation: tm-exec-ring 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .tm-exec-rings span:nth-child(2) {
            animation-delay: 0.06s;
            border-color: rgba(255, 200, 140, 0.35);
        }
        .tm-exec-smoke-puff {
            position: fixed;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(180,160,160,0.35) 0%, transparent 70%);
            filter: blur(6px);
            opacity: 0;
            z-index: 4;
            pointer-events: none;
            left: var(--tm-exec-aim-x, 0px);
            top: var(--tm-exec-aim-y, 0px);
            margin: -10px 0 0 -24px;
        }
        .tm-exec-smoke-puff.show {
            animation: tm-exec-smoke 1.2s ease-out forwards;
        }
        .tm-exec-blood-layer {
            position: fixed !important;
            inset: 0 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 6;
            pointer-events: none;
            overflow: visible !important;
            border-radius: 0 !important;
        }
        .tm-exec-blood-wash {
            position: absolute;
            inset: 0;
            background:
                radial-gradient(ellipse 70% 60% at var(--tm-exec-aim-x, 50%) var(--tm-exec-aim-y, 50%),
                    rgba(150, 0, 12, 0.28) 0%, rgba(80, 0, 6, 0.12) 45%, transparent 75%);
            opacity: 0;
            pointer-events: none;
        }
        .tm-exec-blood-wash.show {
            animation: tm-exec-blood-wash 0.45s ease-out forwards;
        }
        .tm-exec-blood-flash {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at var(--tm-exec-aim-x, 50%) var(--tm-exec-aim-y, 50%),
                rgba(210, 0, 18, 0.45) 0%, rgba(130, 0, 10, 0.18) 28%, transparent 58%);
            opacity: 0;
            pointer-events: none;
        }
        .tm-exec-blood-flash.show {
            animation: tm-exec-blood-flash 0.28s ease-out forwards;
        }
        .tm-exec-blood-splat {
            position: absolute;
            border-radius: 50% 40% 55% 45%;
            background: radial-gradient(circle at 35% 30%, #e01822 0%, #9a050c 55%, #3d0003 100%);
            opacity: 0;
            transform: scale(0.2) rotate(var(--rot, 0deg));
            animation: tm-exec-splat-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: 0ms;
            pointer-events: none;
        }
        /* Lite splats: no pseudo-elements / no will-change (keeps FPS up) */
        .tm-exec-blood-splat--lite::before,
        .tm-exec-blood-splat--lite::after {
            content: none !important;
            display: none !important;
        }
        @keyframes tm-exec-blood-wash {
            0% { opacity: 0; }
            35% { opacity: 0.55; }
            100% { opacity: 0.28; }
        }
        #tm-mascot-container.mascot-exec-scared .tm-mascot-robot {
            animation: tm-exec-tense 0.55s ease-in-out infinite !important;
        }
        #tm-mascot-container.mascot-exec-hit .tm-mascot-robot {
            animation: tm-exec-flinch 0.42s cubic-bezier(0.22, 0.61, 0.36, 1) forwards !important;
            filter: grayscale(0.75) brightness(0.5) contrast(1.15) drop-shadow(0 0 14px rgba(255,50,50,0.45)) !important;
        }
        #tm-mascot-container.mascot-exec-dying {
            pointer-events: none;
            z-index: 10001 !important;
        }
        #tm-mascot-container.mascot-exec-dying .tm-mascot-robot {
            transform-origin: 50% 88%;
            animation: tm-exec-die-collapse 1.9s cubic-bezier(0.4, 0.02, 0.35, 1) forwards !important;
        }
        #tm-mascot-container.mascot-exec-dissolve {
            animation: tm-exec-dissolve 1.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            pointer-events: none;
        }
        #tm-mascot-container.mascot-exec-scared #tm-mascot-speech-bubble,
        #tm-mascot-container.mascot-exec-hit #tm-mascot-speech-bubble,
        #tm-mascot-container.mascot-exec-dying #tm-mascot-speech-bubble,
        #tm-mascot-container.mascot-exec-dissolve #tm-mascot-speech-bubble {
            display: none !important;
        }
        .tm-exec-soul {
            position: fixed;
            left: var(--tm-exec-aim-x, 50%);
            top: var(--tm-exec-aim-y, 50%);
            margin: -28px 0 0 -28px;
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 44px;
            line-height: 1;
            opacity: 0;
            z-index: 14;
            pointer-events: none;
            filter: drop-shadow(0 0 18px rgba(190, 210, 255, 0.85));
        }
        .tm-exec-soul.show {
            animation: tm-exec-soul-rise 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .tm-exec-epitaph {
            position: fixed;
            left: 50%;
            top: 38%;
            transform: translate(-50%, -50%);
            z-index: 16;
            pointer-events: none;
            text-align: center;
            opacity: 0;
        }
        .tm-exec-epitaph.show {
            animation: tm-exec-epitaph-in 2.6s ease-out forwards;
        }
        .tm-exec-epitaph-title {
            font-size: clamp(28px, 7vw, 64px);
            font-weight: 900;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #f2ecec;
            text-shadow:
                0 0 40px rgba(180, 20, 40, 0.55),
                0 0 80px rgba(80, 0, 20, 0.4),
                0 6px 24px rgba(0, 0, 0, 0.85);
            margin: 0;
        }
        .tm-exec-epitaph-sub {
            margin: 14px 0 0;
            font-size: clamp(13px, 2.4vw, 18px);
            letter-spacing: 0.12em;
            color: rgba(220, 200, 200, 0.75);
            font-style: italic;
        }
        .tm-exec-soul-spark {
            position: fixed;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: radial-gradient(circle, #fff 0%, #a8c0ff 45%, transparent 70%);
            box-shadow: 0 0 10px rgba(180, 200, 255, 0.8);
            opacity: 0;
            z-index: 13;
            pointer-events: none;
            left: var(--tm-exec-aim-x, 50%);
            top: var(--tm-exec-aim-y, 50%);
            margin: -3px 0 0 -3px;
        }
        .tm-exec-soul-spark.show {
            animation: tm-exec-soul-spark 1.8s ease-out forwards;
        }
        @keyframes tm-exec-blood-flash {
            0% { opacity: 0; }
            30% { opacity: 0.85; }
            100% { opacity: 0; }
        }
        @keyframes tm-exec-splat-in {
            0% { opacity: 0; transform: scale(0.15) rotate(var(--rot, 0deg)); }
            50% { opacity: 0.9; transform: scale(1.05) rotate(var(--rot, 0deg)); }
            100% { opacity: 0.72; transform: scale(1) rotate(var(--rot, 0deg)); }
        }
        @keyframes tm-exec-drip {
            0% { height: var(--h, 24px); }
            100% { height: calc(var(--h, 24px) + var(--drip, 40px)); }
        }
        @keyframes tm-exec-streak {
            0% { opacity: 0; transform: scaleX(0.2) scaleY(0.4) rotate(var(--rot, 0deg)); }
            40% { opacity: 1; }
            100% { opacity: 0.88; transform: scaleX(1) scaleY(1) rotate(var(--rot, 0deg)); }
        }
        @keyframes tm-exec-blood-mist {
            0% { opacity: 0; transform: scale(0.92); }
            40% { opacity: 0.95; }
            100% { opacity: 0.75; transform: scale(1); }
        }
        @keyframes tm-exec-tense {
            0%, 100% { transform: translateX(0) scale(1); }
            25% { transform: translateX(-2.5px) scale(0.97); }
            75% { transform: translateX(2.5px) scale(1.02); }
        }
        @keyframes tm-exec-flinch {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); }
            18% { transform: translate(-18px, 6px) rotate(-16deg) scale(0.94); }
            40% { transform: translate(10px, -4px) rotate(8deg) scale(1.04); }
            70% { transform: translate(-8px, 10px) rotate(-6deg) scale(0.98); }
            100% { transform: translate(-4px, 12px) rotate(-3deg) scale(0.97); }
        }
        @keyframes tm-exec-die-collapse {
            0% { transform: translate(-4px, 12px) rotate(-3deg) scale(0.97); filter: grayscale(0.6) brightness(0.55); opacity: 1; }
            14% { transform: translate(-14px, -10px) rotate(-20deg) scale(1.08); filter: grayscale(0.4) brightness(0.9) drop-shadow(0 0 16px rgba(255,80,80,0.5)); }
            28% { transform: translate(14px, 4px) rotate(14deg) scale(0.96); }
            44% { transform: translate(-6px, 16px) rotate(-28deg) scale(0.92); filter: grayscale(0.85) brightness(0.45); }
            62% { transform: translate(2px, 34px) rotate(-62deg) scale(0.88); opacity: 0.85; }
            82% { transform: translate(0, 48px) rotate(-88deg) scale(0.82); filter: grayscale(1) brightness(0.3) blur(1px); opacity: 0.45; }
            100% { transform: translate(0, 54px) rotate(-92deg) scale(0.78); filter: grayscale(1) brightness(0.2) blur(3px); opacity: 0.08; }
        }
        @keyframes tm-exec-gun-enter {
            0% { transform: translate3d(80px, 8px, 0) rotate(-4deg); opacity: 0; }
            60% { opacity: 1; }
            100% { transform: translate3d(0, 0, 0) rotate(-2deg); opacity: 1; }
        }
        @keyframes tm-exec-gun-aim {
            0% { transform: translate3d(0, 0, 0) rotate(-2deg); }
            100% { transform: translate3d(-18px, -2px, 0) rotate(-8deg); }
        }
        @keyframes tm-exec-gun-recoil {
            0% { transform: translate3d(-18px, -2px, 0) rotate(-8deg); }
            35% { transform: translate3d(10px, 3px, 0) rotate(2deg); }
            100% { transform: translate3d(-18px, -2px, 0) rotate(-8deg); }
        }
        @keyframes tm-exec-muzzle-flash {
            0% { opacity: 0; transform: scale(0.4) rotate(0deg); }
            25% { opacity: 1; transform: scale(1.35) rotate(12deg); }
            100% { opacity: 0; transform: scale(0.75) rotate(28deg); }
        }
        @keyframes tm-exec-tracer-fly {
            0% { width: 0; opacity: 0; transform: translateX(var(--tm-exec-tracer-span, 130px)); }
            20% { opacity: 1; }
            100% { width: var(--tm-exec-tracer-span, 130px); opacity: 0; transform: translateX(0); }
        }
        @keyframes tm-exec-casing-eject {
            0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
            100% { opacity: 0; transform: translate(48px, -56px) rotate(420deg); }
        }
        @keyframes tm-exec-hitmark {
            0% { opacity: 1; transform: scale(0.4); }
            40% { opacity: 1; transform: scale(1.6); }
            100% { opacity: 0; transform: scale(0.2); }
        }
        @keyframes tm-exec-ring {
            0% { transform: scale(0.2); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes tm-exec-dissolve {
            0% { opacity: 1; filter: none; }
            40% { opacity: 0.7; filter: blur(2px) brightness(1.3); }
            100% { opacity: 0; filter: blur(10px) brightness(1.6); }
        }
        @keyframes tm-exec-smoke {
            0% { opacity: 0.55; transform: translateY(0) scale(0.6); }
            100% { opacity: 0; transform: translateY(-56px) scale(1.8); }
        }
        @keyframes tm-exec-soul-rise {
            0% { opacity: 0; transform: translateY(12px) scale(0.55); filter: blur(3px) drop-shadow(0 0 8px rgba(180,200,255,0.4)); }
            15% { opacity: 1; transform: translateY(-6px) scale(1.1); filter: blur(0) drop-shadow(0 0 22px rgba(190,210,255,0.9)); }
            55% { opacity: 0.9; }
            100% { opacity: 0; transform: translateY(-160px) scale(1.25); filter: blur(5px) drop-shadow(0 0 30px rgba(200,220,255,0.3)); }
        }
        @keyframes tm-exec-epitaph-in {
            0% { opacity: 0; transform: translate(-50%, -40%) scale(1.25); filter: blur(8px); }
            25% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
            75% { opacity: 1; }
            100% { opacity: 0; transform: translate(-50%, -58%) scale(0.96); filter: blur(2px); }
        }
        @keyframes tm-exec-soul-spark {
            0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
            20% { opacity: 1; }
            100% { opacity: 0; transform: translate(var(--sx, 40px), var(--sy, -90px)) scale(0.2); }
        }
        @keyframes tm-exec-vignette-die {
            0% { opacity: 0.35; }
            40% { opacity: 1; }
            100% { opacity: 0.85; }
        }
    `;
    document.head.appendChild(style);
}

let tmExecAudioCtx = null;
function getExecAudioContext() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!tmExecAudioCtx || tmExecAudioCtx.state === 'closed') {
            tmExecAudioCtx = new AC();
        }
        if (tmExecAudioCtx.state === 'suspended') {
            tmExecAudioCtx.resume().catch(() => {});
        }
        return tmExecAudioCtx;
    } catch {
        return null;
    }
}

function playGunshotSound() {
    try {
        const ctx = getExecAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const noiseLen = 0.18;
        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseLen), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.8);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(850, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(240, now + 0.14);
        noiseFilter.Q.value = 0.8;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + noiseLen);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + noiseLen + 0.02);

        const thump = ctx.createOscillator();
        const thumpGain = ctx.createGain();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(100, now);
        thump.frequency.exponentialRampToValueAtTime(42, now + 0.12);
        thumpGain.gain.setValueAtTime(0.2, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        thump.connect(thumpGain);
        thumpGain.connect(ctx.destination);
        thump.start(now);
        thump.stop(now + 0.15);
    } catch { /* ignore audio failures */ }
}

/** Slow, dramatic death knell — reused AudioContext so it stays in sync. */
function playDeathKnellSound() {
    try {
        const ctx = getExecAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const playTone = (freq, start, dur, vol, type = 'sine') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now + start);
            osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.55), now + start + dur);
            gain.gain.setValueAtTime(0.0001, now + start);
            gain.gain.exponentialRampToValueAtTime(vol, now + start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + start);
            osc.stop(now + start + dur + 0.05);
        };

        // Heartbeat thuds
        playTone(70, 0, 0.22, 0.22, 'sine');
        playTone(55, 0.32, 0.28, 0.18, 'sine');
        // Descending knell
        playTone(220, 0.55, 0.55, 0.12, 'triangle');
        playTone(165, 1.05, 0.7, 0.14, 'triangle');
        playTone(110, 1.7, 1.1, 0.16, 'sine');
        playTone(82, 2.5, 1.4, 0.12, 'sine');
    } catch { /* ignore */ }
}

function spawnExecSoulSparks(layer, count = 6) {
    if (!layer) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'tm-exec-soul-spark show';
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dist = 50 + Math.random() * 70;
        spark.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
        spark.style.setProperty('--sy', `${-40 - Math.sin(Math.abs(angle)) * dist - Math.random() * 40}px`);
        spark.style.animationDelay = `${i * 40}ms`;
        frag.appendChild(spark);
    }
    layer.appendChild(frag);
}

function getMascotExecutionEmoji() {
    if (tamagotchiStage === 'egg') return '🥚';
    if (tamagotchiCharacterType && MASCOT_CHARACTERS[tamagotchiCharacterType]) {
        return MASCOT_CHARACTERS[tamagotchiCharacterType].emoji;
    }
    const stageEmoji = {
        egg: '🥚', baby: '👶', kid: '🧒', teen: '🎮',
        adult: '💼', middleage: '👔', old: '👴',
    };
    return stageEmoji[tamagotchiStage] || '🤖';
}

/** Lightweight blood spray — kept small so sound/visuals stay in sync and the page stays smooth. */
function spawnExecutionBloodSplats(layer, originX = 32, originY = 48, options = {}) {
    if (!layer) return;
    const {
        count = 10,
        withFlash = true,
        withWash = false,
        edgeSmears = 2,
    } = options;

    const vw = Math.max(window.innerWidth, 320);

    // Apply overlays immediately (no rAF) so they land with the gunshot
    if (withWash) {
        const wash = document.createElement('div');
        wash.className = 'tm-exec-blood-wash show';
        layer.appendChild(wash);
    }

    if (withFlash) {
        const flash = document.createElement('div');
        flash.className = 'tm-exec-blood-flash show';
        layer.appendChild(flash);
    }

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'tm-exec-blood-splat tm-exec-blood-splat--lite show';

        // Mostly near impact, a few across the page
        const near = Math.random() < 0.7;
        let left = near ? originX + (Math.random() - 0.5) * 36 : Math.random() * 100;
        let top = near ? originY + (Math.random() - 0.5) * 30 : Math.random() * 100;
        left = Math.max(0, Math.min(100, left));
        top = Math.max(0, Math.min(100, top));

        const size = Math.max(18, Math.min(70, vw * (0.018 + Math.random() * 0.035)));
        el.style.left = `${left}%`;
        el.style.top = `${top}%`;
        el.style.width = `${size}px`;
        el.style.height = `${size * (0.55 + Math.random() * 0.5)}px`;
        el.style.setProperty('--rot', `${Math.floor(Math.random() * 360)}deg`);
        frag.appendChild(el);
    }

    for (let i = 0; i < edgeSmears; i++) {
        const smear = document.createElement('div');
        smear.className = 'tm-exec-blood-splat tm-exec-blood-splat--lite show';
        const size = Math.max(40, Math.min(110, vw * 0.06));
        smear.style.width = `${size}px`;
        smear.style.height = `${size * 0.55}px`;
        smear.style.setProperty('--rot', `${Math.floor(Math.random() * 360)}deg`);
        const edge = i % 4;
        if (edge === 0) { smear.style.left = `${10 + Math.random() * 80}%`; smear.style.top = `2%`; }
        if (edge === 1) { smear.style.left = `${10 + Math.random() * 80}%`; smear.style.top = `90%`; }
        if (edge === 2) { smear.style.left = `2%`; smear.style.top = `${15 + Math.random() * 70}%`; }
        if (edge === 3) { smear.style.left = `90%`; smear.style.top = `${15 + Math.random() * 70}%`; }
        frag.appendChild(smear);
    }
    layer.appendChild(frag);
}

function retriggerCssAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    // Force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add(className);
}

function ejectExecutionCasing(container) {
    if (!container) return;
    const casing = document.createElement('div');
    casing.className = 'tm-exec-casing';
    casing.style.right = `${18 + Math.random() * 8}%`;
    casing.style.bottom = `${52 + Math.random() * 10}px`;
    container.appendChild(casing);
    casing.addEventListener('animationend', () => casing.remove(), { once: true });
}

/**
 * In-place AK-47 execution: shoots the live mascot at its page position (no popup).
 * @returns {Promise<void>}
 */
function showMascotExecutionCinematic() {
    ensureTamaCinematicStyles();
    ensureMascotExecutionStyles();
    document.getElementById('tm-tama-execution-panel')?.remove();
    document.getElementById('tm-tama-execution-inplace')?.remove();

    const execGen = tamaCinematicGeneration;
    tamaCinematicLock = true;
    stopRoaming(window.config || {});
    getExecAudioContext(); // unlock / warm audio so first shot isn't delayed

    const mascot = document.getElementById('tm-mascot-container');
    if (!mascot) {
        tamaCinematicLock = false;
        return Promise.resolve();
    }

    // Freeze current painted position
    try { mascot.getAnimations().forEach((a) => a.cancel()); } catch { /* ignore */ }
    const rect = mascot.getBoundingClientRect();
    const aimX = rect.left + rect.width / 2;
    const aimY = rect.top + rect.height * 0.55;

    // Gun sits to the right of the mascot, barrel pointing left
    const gunW = 240;
    const gunH = 100;
    let gunLeft = rect.right + 12;
    let gunTop = aimY - gunH * 0.45;
    // Keep gun on-screen
    if (gunLeft + gunW > window.innerWidth - 8) {
        gunLeft = Math.max(8, window.innerWidth - gunW - 8);
    }
    if (gunTop < 8) gunTop = 8;
    if (gunTop + gunH > window.innerHeight - 8) gunTop = window.innerHeight - gunH - 8;

    const muzzleX = gunLeft + 4; // barrel tip near left of SVG
    const muzzleY = gunTop + 34;
    const tracerSpan = Math.max(40, muzzleX - aimX);
    const tracerLeft = aimX;
    const tracerTop = aimY;

    // Blood origin as % of viewport (splats spray from impact, then cover full screen)
    const bloodOriginX = Math.max(2, Math.min(98, (aimX / Math.max(1, window.innerWidth)) * 100));
    const bloodOriginY = Math.max(2, Math.min(98, (aimY / Math.max(1, window.innerHeight)) * 100));

    const layer = document.createElement('div');
    layer.id = 'tm-tama-execution-inplace';
    layer.className = 'tm-exec-inplace';
    layer.style.setProperty('--tm-exec-aim-x', `${aimX}px`);
    layer.style.setProperty('--tm-exec-aim-y', `${aimY}px`);
    layer.style.setProperty('--tm-exec-gun-left', `${gunLeft}px`);
    layer.style.setProperty('--tm-exec-gun-top', `${gunTop}px`);
    layer.style.setProperty('--tm-exec-tracer-left', `${tracerLeft}px`);
    layer.style.setProperty('--tm-exec-tracer-top', `${tracerTop}px`);
    layer.style.setProperty('--tm-exec-tracer-span', `${tracerSpan}px`);

    layer.innerHTML = `
        <div class="tm-exec-inplace-vignette" aria-hidden="true"></div>
        <div class="tm-exec-blood-layer" id="tm-exec-blood" aria-hidden="true"></div>
        <div class="tm-exec-gun-wrap" id="tm-exec-gun">
            <svg class="tm-exec-gun" viewBox="0 0 260 110" aria-hidden="true">
                <defs>
                    <linearGradient id="tm-ak-metal" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#6a727c"/>
                        <stop offset="50%" stop-color="#3a424c"/>
                        <stop offset="100%" stop-color="#1c2228"/>
                    </linearGradient>
                    <linearGradient id="tm-ak-wood" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#a0673a"/>
                        <stop offset="55%" stop-color="#6b3d22"/>
                        <stop offset="100%" stop-color="#3a1f12"/>
                    </linearGradient>
                    <linearGradient id="tm-ak-mag" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4a525c"/>
                        <stop offset="100%" stop-color="#1a1e24"/>
                    </linearGradient>
                </defs>
                <path d="M208 34 L248 28 L255 42 L248 70 L214 62 L208 48 Z" fill="url(#tm-ak-wood)" stroke="#2a160c" stroke-width="1.2"/>
                <path d="M214 38 L246 33" stroke="rgba(255,220,180,0.15)" stroke-width="2"/>
                <rect x="118" y="30" width="96" height="28" rx="2" fill="url(#tm-ak-metal)" stroke="#0e1216" stroke-width="1.2"/>
                <rect x="122" y="33" width="88" height="5" fill="rgba(255,255,255,0.1)"/>
                <rect x="130" y="26" width="70" height="6" rx="1" fill="#2e363e" stroke="#111" stroke-width="0.8"/>
                <path d="M168 56 L176 56 L184 92 L168 96 Z" fill="url(#tm-ak-wood)" stroke="#2a160c" stroke-width="1.1"/>
                <path d="M158 56 h22 v10 h-8 v-4 h-6 v4 h-8 Z" fill="none" stroke="#222" stroke-width="1.6"/>
                <rect x="168" y="58" width="3" height="8" rx="1" fill="#111"/>
                <path d="M148 56 C146 72 142 88 150 100 C158 102 166 90 168 72 L168 56 Z"
                      fill="url(#tm-ak-mag)" stroke="#0a0c10" stroke-width="1.3"/>
                <path d="M152 62 C151 76 149 88 154 96" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
                <rect x="58" y="32" width="62" height="22" rx="2" fill="url(#tm-ak-wood)" stroke="#2a160c" stroke-width="1.1"/>
                <path d="M64 38 H114 M64 44 H114 M64 50 H114" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
                <rect x="52" y="24" width="78" height="7" rx="2" fill="#3a444e" stroke="#111" stroke-width="0.9"/>
                <rect x="126" y="20" width="10" height="8" rx="1" fill="#2a3038"/>
                <rect x="28" y="18" width="5" height="12" rx="1" fill="#2a3038"/>
                <rect x="26" y="16" width="9" height="3" rx="1" fill="#3a424c"/>
                <rect x="8" y="34" width="52" height="8" rx="2" fill="url(#tm-ak-metal)" stroke="#0e1216" stroke-width="1"/>
                <rect x="8" y="36" width="52" height="2" fill="rgba(255,255,255,0.12)"/>
                <rect x="2" y="32" width="10" height="12" rx="1" fill="#2a3038" stroke="#111" stroke-width="1"/>
                <rect x="3" y="34" width="3" height="8" fill="#111"/>
                <rect x="7" y="34" width="3" height="8" fill="#111"/>
                <path d="M2 32 L0 38 L2 44" fill="#1a1e24"/>
            </svg>
            <div class="tm-exec-muzzle" id="tm-exec-muzzle"></div>
        </div>
        <div class="tm-exec-casings" id="tm-exec-casings"></div>
        <div class="tm-exec-tracer" id="tm-exec-tracer"></div>
        <div class="tm-exec-hitmark" id="tm-exec-hitmark"></div>
        <div class="tm-exec-rings" id="tm-exec-rings"><span></span><span></span></div>
        <div class="tm-exec-smoke-puff" id="tm-exec-smoke"></div>
        <div class="tm-exec-soul" id="tm-exec-soul" aria-hidden="true">👻</div>
        <div class="tm-exec-epitaph" id="tm-exec-epitaph" aria-hidden="true">
            <p class="tm-exec-epitaph-title">Αντίο</p>
            <p class="tm-exec-epitaph-sub">Η ιστορία τελείωσε...</p>
        </div>
    `;
    document.body.appendChild(layer);
    requestAnimationFrame(() => layer.classList.add('is-live'));

    mascot.classList.remove('mascot-exec-scared', 'mascot-exec-hit', 'mascot-exec-dying', 'mascot-exec-dissolve');

    const gun = layer.querySelector('#tm-exec-gun');
    const muzzle = layer.querySelector('#tm-exec-muzzle');
    const tracer = layer.querySelector('#tm-exec-tracer');
    const hitmark = layer.querySelector('#tm-exec-hitmark');
    const rings = layer.querySelector('#tm-exec-rings');
    const smoke = layer.querySelector('#tm-exec-smoke');
    const casings = layer.querySelector('#tm-exec-casings');
    const bloodLayer = layer.querySelector('#tm-exec-blood');
    const soul = layer.querySelector('#tm-exec-soul');
    const epitaph = layer.querySelector('#tm-exec-epitaph');

    const stillValid = () => execGen === tamaCinematicGeneration
        && document.getElementById('tm-tama-execution-inplace') === layer;

    const clearExecClasses = () => {
        mascot.classList.remove('mascot-exec-scared', 'mascot-exec-hit', 'mascot-exec-dying', 'mascot-exec-dissolve');
    };

    const fireAkShot = (shotIndex) => {
        if (!stillValid()) return;
        // Sound + muzzle + blood in the same sync call so they land together
        playGunshotSound();
        layer.classList.add('is-firing');
        gun?.classList.add('on-stage', 'aimed');
        retriggerCssAnimation(gun, 'recoil');
        retriggerCssAnimation(muzzle, 'flash');
        retriggerCssAnimation(tracer, 'fly');
        ejectExecutionCasing(casings);
        screenShake(shotIndex === 0 ? 140 : 80, shotIndex === 0 ? 2.8 : 1.4);

        if (shotIndex === 0) {
            hitmark?.classList.add('show');
            rings?.classList.add('show');
            mascot.classList.remove('mascot-exec-scared');
            mascot.classList.add('mascot-exec-hit');
            spawnExecutionBloodSplats(bloodLayer, bloodOriginX, bloodOriginY, {
                count: 8,
                withFlash: true,
                withWash: true,
                edgeSmears: 2,
            });
        } else if (shotIndex === 1) {
            // Retrigger flinch on second hit
            mascot.classList.remove('mascot-exec-hit');
            void mascot.offsetWidth;
            mascot.classList.add('mascot-exec-hit');
            spawnExecutionBloodSplats(
                bloodLayer,
                bloodOriginX + (Math.random() - 0.5) * 12,
                bloodOriginY + (Math.random() - 0.5) * 10,
                {
                    count: 4,
                    withFlash: false,
                    withWash: false,
                    edgeSmears: 0,
                },
            );
        }
    };

    return new Promise((resolve) => {
        const finish = () => {
            if (!stillValid()) {
                clearExecClasses();
                tamaCinematicLock = false;
                resolve();
                return;
            }
            layer.style.transition = 'opacity 0.55s ease';
            layer.style.opacity = '0';
            scheduleTamagotchiCinematic(() => {
                layer.remove();
                clearExecClasses();
                tamaCinematicLock = false;
                resolve();
            }, 560);
        };

        const BURST_COUNT = 4;
        const BURST_GAP = 150;
        const BURST_START = 2800;

        // Warm up shared AudioContext before the burst so shot 1 isn't late
        getExecAudioContext();

        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            gun?.classList.add('enter');
        }, 200);

        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            gun?.classList.add('on-stage');
            gun?.classList.remove('enter');
            mascot.classList.add('mascot-exec-scared');
            gun?.classList.add('aim');
        }, 950);

        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            gun?.classList.add('on-stage', 'aimed');
            gun?.classList.remove('aim');
        }, 1550);

        for (let i = 0; i < BURST_COUNT; i++) {
            scheduleTamagotchiCinematic(() => fireAkShot(i), BURST_START + i * BURST_GAP);
        }

        const afterBurst = BURST_START + BURST_COUNT * BURST_GAP;

        // Dramatic dying beat: collapse → soul → epitaph → dissolve
        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            gun?.classList.remove('recoil');
            gun?.classList.add('on-stage', 'aimed');
            layer.classList.remove('is-firing');
            layer.classList.add('is-dying');
            mascot.classList.remove('mascot-exec-scared', 'mascot-exec-hit');
            mascot.classList.add('mascot-exec-dying');
            smoke?.classList.add('show');
            playDeathKnellSound();
            screenShake(420, 1.6);
        }, afterBurst + 120);

        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            soul?.classList.add('show');
            spawnExecSoulSparks(layer, 6);
        }, afterBurst + 520);

        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            epitaph?.classList.add('show');
        }, afterBurst + 900);

        scheduleTamagotchiCinematic(() => {
            if (!stillValid()) return;
            mascot.classList.remove('mascot-exec-dying');
            mascot.classList.add('mascot-exec-dissolve');
        }, afterBurst + 2100);

        scheduleTamagotchiCinematic(finish, afterBurst + 3400);
    });
}

function showEggHatchAnimation(onComplete) {
    ensureTamaCinematicStyles();
    if (document.getElementById('tm-tama-hatch-panel')) return;
    if (tamagotchiIsDead) return;

    const hatchGen = tamaCinematicGeneration;
    const mascotContainer = document.getElementById('tm-mascot-container');
    mascotContainer?.classList.add('mascot-hatching');

    const overlay = document.createElement('div');
    overlay.id = 'tm-tama-hatch-panel';
    overlay.className = 'tm-tama-cinematic-overlay';
    overlay.innerHTML = `
        <div class="tm-tama-cinematic-panel">
            <div class="tm-tama-lcd-title">● Tamagotchi ●</div>
            <h2 class="tm-tama-cinematic-title">🥚 Εκκόλαψη!</h2>
            <p class="tm-tama-cinematic-subtitle">Κάτι κινείται μέσα στο ωό...</p>
            <div class="tm-tama-hatch-egg">
                <div class="tm-tama-hatch-egg-glow"></div>
                <div class="tm-tama-hatch-egg-body">
                    <div class="tm-tama-hatch-crack tm-tama-hatch-crack-1"></div>
                    <div class="tm-tama-hatch-crack tm-tama-hatch-crack-2"></div>
                    <div class="tm-tama-hatch-crack tm-tama-hatch-crack-3"></div>
                    <div class="tm-tama-hatch-crack tm-tama-hatch-crack-4"></div>
                </div>
            </div>
            <div class="tm-tama-hatch-status" id="tm-hatch-status">Αναμονή...</div>
            <div class="tm-tama-hatch-burst" id="tm-hatch-burst"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const statusEl = overlay.querySelector('#tm-hatch-status');
    const burstEl = overlay.querySelector('#tm-hatch-burst');
    const phases = [
        [600, 'Αναμονή...'],
        [1400, 'Κουνιέται!'],
        [2200, 'Ρωγμές...'],
        [3000, 'Σχεδόν έτοιμο!'],
        [3600, 'ΕΚΚΟΛΑΨΗ!']
    ];
    phases.forEach(([ms, text]) => {
        scheduleTamagotchiCinematic(() => {
            if (statusEl) statusEl.textContent = text;
        }, ms);
    });

    scheduleTamagotchiCinematic(() => screenShake(500), 3200);
    scheduleTamagotchiCinematic(() => {
        burstEl?.classList.add('active');
        playEpicSound();
    }, 3400);

    scheduleTamagotchiCinematic(() => {
        if (hatchGen !== tamaCinematicGeneration || tamagotchiIsDead) {
            overlay.remove();
            mascotContainer?.classList.remove('mascot-hatching');
            return;
        }
        mascotContainer?.classList.remove('mascot-hatching');
        overlay.style.animation = 'tm-tama-fade-in 0.4s ease-out reverse';
        scheduleTamagotchiCinematic(() => {
            overlay.remove();
            if (hatchGen !== tamaCinematicGeneration || tamagotchiIsDead) return;
            if (typeof onComplete === 'function') onComplete();
        }, 400);
    }, 4200);
}

function showTamagotchiDeathCinematic(onComplete) {
    ensureTamaCinematicStyles();
    if (document.getElementById('tm-tama-death-cinematic')) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    const mascotContainer = document.getElementById('tm-mascot-container');
    mascotContainer?.classList.add('mascot-dying');
    stopRoaming(window.config || {});
    getExecAudioContext();
    playDeathKnellSound();
    screenShake(600, 2.2);

    const stageEmoji = { egg: '🥚', baby: '👶', kid: '🧒', teen: '🎮', adult: '💼', middleage: '👔', old: '👴' };
    const emoji = tamagotchiCharacterType && MASCOT_CHARACTERS[tamagotchiCharacterType]
        ? MASCOT_CHARACTERS[tamagotchiCharacterType].emoji
        : (stageEmoji[tamagotchiStage] || '💀');

    const overlay = document.createElement('div');
    overlay.id = 'tm-tama-death-cinematic';
    overlay.className = 'tm-tama-cinematic-overlay';
    overlay.style.opacity = '0';
    overlay.innerHTML = `
        <div class="tm-tama-cinematic-panel" style="border-color:#4a4a5a; background: linear-gradient(180deg, #1a1a2a 0%, #0a0a14 100%);">
            <div class="tm-tama-lcd-title" style="color:#888;">● Tamagotchi ●</div>
            <h2 class="tm-tama-death-title">Τέλος</h2>
            <div class="tm-tama-death-scene">
                <div class="tm-tama-death-ripple" aria-hidden="true"></div>
                <div class="tm-tama-death-ripple" aria-hidden="true"></div>
                <div class="tm-tama-death-stars">
                    ${[8,22,38,52,68,82,15,75].map((l, i) => `<span style="left:${l}%;top:${10 + (i%4)*18}%;animation-delay:${i*0.22}s">✦</span>`).join('')}
                </div>
                <div class="tm-tama-death-mascot">${emoji}</div>
                <div class="tm-tama-death-ghost">👻</div>
            </div>
            <p class="tm-tama-death-message" id="tm-death-cine-msg">Η καρδιά σταμάτησε...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Let the live mascot collapse first, then fade the cinematic in
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.7s ease';
        overlay.style.opacity = '1';
    }, 900);

    const msgs = MASCOT_MESSAGES.deathCinematic;
    let mi = 0;
    const msgInterval = setInterval(() => {
        const el = overlay.querySelector('#tm-death-cine-msg');
        if (el && mi < msgs.length) el.textContent = msgs[mi++];
    }, 1000);

    setTimeout(() => {
        clearInterval(msgInterval);
        mascotContainer?.classList.remove('mascot-dying');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.remove();
            if (typeof onComplete === 'function') onComplete();
        }, 550);
    }, 5200);
}

function runTamagotchiHatchSequence(characterType, container) {
    if (tamaCinematicLock || tamagotchiIsDead || tamagotchiEggHatchCinematicDone) return;
    tamaCinematicLock = true;
    tamagotchiEggHatchCinematicDone = true;
    const hatchGen = tamaCinematicGeneration;
    const config = typeof window.config !== 'undefined' ? window.config : {};
    stopRoaming(config);

    showEggHatchAnimation(() => {
        if (hatchGen !== tamaCinematicGeneration || tamagotchiIsDead || tamagotchiStage !== 'baby') {
            tamaCinematicLock = false;
            return;
        }
        updateMascotAppearanceByStage('baby');
        showLuckyCharacterReveal(characterType, () => {
            if (hatchGen !== tamaCinematicGeneration || tamagotchiIsDead) {
                tamaCinematicLock = false;
                return;
            }
            tamaCinematicLock = false;
            showMascotBubble(mascotHatchMsg(characterType), 3000);
            if (typeof window.STORAGE_KEYS !== 'undefined') {
                updatePetStateByStats(config, window.STORAGE_KEYS);
            }
        });
    });
}

function runTamagotchiDeathSequence(STORAGE_KEYS) {
    if (document.getElementById('tm-tamagotchi-death-overlay')) return;
    cancelTamagotchiCinematics();
    showTamagotchiDeathCinematic(() => {
        showTamagotchiDeathScreen(STORAGE_KEYS, true);
    });
}

function showEpicCharacterReveal(characterType, onComplete) {
    return showLuckyCharacterReveal(characterType, onComplete);
}

/**
 * Professional slot-machine character reveal.
 * Uses locked cell widths + viewport-center formula so the winner always fills the frame.
 */
function showLuckyCharacterReveal(characterType, onComplete) {
    const character = MASCOT_CHARACTERS[characterType];
    if (!character) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    ensureTamaCinematicStyles();
    document.getElementById('tm-tama-lucky-panel')?.remove();
    document.querySelectorAll('style[data-tm-lucky-spin]').forEach((el) => el.remove());

    const revealGen = tamaCinematicGeneration;
    const stillValid = () => revealGen === tamaCinematicGeneration
        && document.getElementById('tm-tama-lucky-panel');

    playEpicSound();

    const characterEntries = Object.entries(MASCOT_CHARACTERS);
    const selectedIndex = Math.max(0, characterEntries.findIndex(([key]) => key === characterType));
    const CELL_W = 96;
    const totalRepeats = 6;
    const landRepeat = totalRepeats - 2;
    const targetIndex = landRepeat * characterEntries.length + selectedIndex;

    const overlay = document.createElement('div');
    overlay.id = 'tm-tama-lucky-panel';
    overlay.className = 'tm-tama-cinematic-overlay';
    overlay.style.setProperty('--lucky-color', character.color);

    const scrollItems = [];
    for (let i = 0; i < totalRepeats; i++) {
        characterEntries.forEach(([key, char]) => {
            scrollItems.push(`
                <div class="tm-tama-lucky-char" data-char-key="${key}" style="flex:0 0 ${CELL_W}px;width:${CELL_W}px;min-width:${CELL_W}px;max-width:${CELL_W}px;">
                    <div class="tm-tama-lucky-char-emoji">${char.emoji}</div>
                    <div class="tm-tama-lucky-char-name" style="color:${char.color}">${char.nameGr || char.name}</div>
                </div>
            `);
        });
    }

    const rarity = character.rarityGr || character.rarity || '';
    const element = character.elementGr || character.element || '';
    const traits = character.traitsGr || character.traits || [];

    overlay.innerHTML = `
        <div class="tm-tama-cinematic-panel" style="--lucky-color:${character.color}; max-width:500px;">
            <div class="tm-tama-lcd-title">● Τυχερή κλήρωση ●</div>
            <h2 class="tm-tama-cinematic-title">Επιλογή χαρακτήρα</h2>
            <p class="tm-tama-cinematic-subtitle">Ποιος θα βγει από το αυγό;</p>
            <div class="tm-tama-lucky-slot" id="tm-lucky-slot" style="--lucky-cell-w:${CELL_W}px;">
                <div class="tm-tama-lucky-indicator" aria-hidden="true"></div>
                <div class="tm-tama-lucky-scroll" id="tm-lucky-scroll">${scrollItems.join('')}</div>
            </div>
            <div class="tm-tama-lucky-reveal" id="tm-lucky-reveal">
                <div style="font-size:72px;margin-bottom:10px;line-height:1;filter:drop-shadow(0 0 22px ${character.color})">${character.emoji}</div>
                <div style="font-size:24px;font-weight:700;color:${character.color};margin-bottom:8px;letter-spacing:0.01em">${character.nameGr || character.name}</div>
                <div style="display:inline-block;background:color-mix(in srgb, ${character.color} 22%, transparent);color:${character.color};padding:5px 14px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid color-mix(in srgb, ${character.color} 55%, transparent);margin-bottom:14px;letter-spacing:0.06em;text-transform:uppercase">${rarity}${rarity && element ? ' · ' : ''}${element}</div>
                <div style="font-size:13px;color:#b0b8b0;margin-bottom:16px;font-style:italic;line-height:1.45;max-width:360px;margin-left:auto;margin-right:auto">"${character.descriptionGr || character.description || ''}"</div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px">
                    ${traits.map((t) => `<span style="background:rgba(255,255,255,0.07);padding:6px 11px;border-radius:8px;font-size:12px;color:#ddd;border:1px solid rgba(255,255,255,0.12)">${t}</span>`).join('')}
                </div>
                <button type="button" class="tm-tama-btn tm-tama-btn-primary" id="tm-reveal-close-btn">Ξεκινάμε</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const slotEl = overlay.querySelector('#tm-lucky-slot');
    const scrollEl = overlay.querySelector('#tm-lucky-scroll');
    const revealEl = overlay.querySelector('#tm-lucky-reveal');
    const chars = [...(scrollEl?.querySelectorAll('.tm-tama-lucky-char') || [])];
    const targetEl = chars[targetIndex] || null;

    /**
     * Classic slot math with locked cell width:
     * translate so cell[i] left edge sits at (slotWidth - cellW) / 2
     * → cell center == slot center.
     */
    const computeTranslate = () => {
        const slotWidth = slotEl?.clientWidth || 420;
        return Math.round(((slotWidth - CELL_W) / 2) - (targetIndex * CELL_W));
    };

    /** Snap using live getBoundingClientRect after transform is applied. */
    const snapWinnerUnderFrame = (currentTranslate) => {
        if (!slotEl || !scrollEl || !targetEl) return currentTranslate;
        void scrollEl.offsetWidth;
        const slotRect = slotEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const slotCenter = slotRect.left + slotRect.width / 2;
        const targetCenter = targetRect.left + targetRect.width / 2;
        const drift = slotCenter - targetCenter;
        if (Math.abs(drift) < 0.75) return currentTranslate;
        const corrected = Math.round(currentTranslate + drift);
        scrollEl.style.transform = `translate3d(${corrected}px,0,0)`;
        return corrected;
    };

    let finished = false;
    const finishReveal = () => {
        if (finished) return;
        finished = true;
        if (!stillValid()) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }
        overlay.style.animation = 'tm-tama-fade-in 0.35s ease-out reverse';
        scheduleTamagotchiCinematic(() => {
            overlay.remove();
            if (typeof window.triggerConfetti === 'function') window.triggerConfetti(80);
            if (typeof onComplete === 'function') onComplete();
        }, 350);
    };

    const highlightWinner = () => {
        chars.forEach((el, i) => el.classList.toggle('selected', i === targetIndex));
    };

    const showRevealCard = () => {
        if (!stillValid()) return;
        scrollEl?.classList.remove('is-spinning');
        highlightWinner();
        slotEl?.classList.add('is-dimmed');
        revealEl?.classList.add('visible');
        screenShake(280);
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
                osc.start(ctx.currentTime + i * 0.05);
                osc.stop(ctx.currentTime + 1.0);
            });
        } catch { /* ignore */ }
        if (typeof window.triggerConfetti === 'function') window.triggerConfetti(160);
        overlay.querySelector('#tm-reveal-close-btn')?.addEventListener('click', finishReveal, { once: true });
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (!stillValid() || !scrollEl || !slotEl) {
                if (typeof onComplete === 'function') onComplete();
                return;
            }

            // Lock strip width so flex can't reflow mid-spin
            scrollEl.style.width = `${chars.length * CELL_W}px`;
            scrollEl.style.transform = 'translate3d(0,0,0)';

            let finalTranslate = computeTranslate();
            // Verify with live rects while at 0, then recompute if needed
            {
                const slotRect = slotEl.getBoundingClientRect();
                const targetRect = targetEl?.getBoundingClientRect();
                if (targetRect) {
                    const desired = (slotRect.left + slotRect.width / 2) - (targetRect.left + targetRect.width / 2);
                    // At translate 0, desired is exactly the translate we need
                    finalTranslate = Math.round(desired);
                }
            }

            scrollEl.classList.add('is-spinning');
            const overshoot = finalTranslate - Math.min(140, CELL_W * 1.35);
            const spinDuration = 3200;

            const anim = scrollEl.animate(
                [
                    { transform: 'translate3d(0px,0,0)', offset: 0, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
                    { transform: `translate3d(${overshoot}px,0,0)`, offset: 0.78, easing: 'cubic-bezier(0.15, 0.85, 0.25, 1)' },
                    { transform: `translate3d(${finalTranslate + 12}px,0,0)`, offset: 0.9, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
                    { transform: `translate3d(${finalTranslate}px,0,0)`, offset: 1 },
                ],
                {
                    duration: spinDuration,
                    fill: 'forwards',
                    easing: 'linear',
                },
            );

            const settle = () => {
                if (!stillValid()) return;
                try { anim.cancel(); } catch { /* ignore */ }
                scrollEl.style.transform = `translate3d(${finalTranslate}px,0,0)`;
                // Double-snap after layout settles under the new transform
                requestAnimationFrame(() => {
                    if (!stillValid()) return;
                    snapWinnerUnderFrame(finalTranslate);
                    requestAnimationFrame(() => {
                        if (!stillValid()) return;
                        const matrix = new DOMMatrix(getComputedStyle(scrollEl).transform);
                        snapWinnerUnderFrame(matrix.m41 || finalTranslate);
                        highlightWinner();
                        scheduleTamagotchiCinematic(showRevealCard, 200);
                    });
                });
            };

            anim.finished.then(settle).catch(settle);
        });
    });
}

window.playEpicSound = playEpicSound;
window.screenShake = screenShake;
window.showEpicCharacterReveal = showEpicCharacterReveal;
window.showLuckyCharacterReveal = showLuckyCharacterReveal;
window.showEggHatchAnimation = showEggHatchAnimation;
window.showTamagotchiDeathCinematic = showTamagotchiDeathCinematic;
let tamagotchiDiscipline = 0;
let tamagotchiLightsOn = true;
let tamagotchiLastUpdate = Date.now();
// Enhanced Tamagotchi variables
let tamagotchiWeight = 30; // Base weight (affects health)
let tamagotchiPoopCount = 0; // Number of poops on screen
let tamagotchiIsSick = false;
let tamagotchiSickType = 'none'; // none, cold, fever, upset_stomach
let tamagotchiCareMistakes = 0; // Affects evolution and personality
let tamagotchiPersonality = 'normal'; // normal, lazy, active, spoiled, well_cared
let tamagotchiBirthday = Date.now();
let tamagotchiLastFed = Date.now();
let tamagotchiLastPlayed = Date.now();
let tamagotchiLastCleaned = Date.now();
let tamagotchiToiletTrained = false;
let tamagotchiMealCount = 0; // Meals eaten today
let tamagotchiSnackCount = 0; // Snacks eaten today
let tamagotchiIsDead = false;
let tamagotchiReviveCount = 0; // How many times revived (current life)
/** Lifetime: user-triggered kills (execution / «Σκότωσε & νέο αυγό» while alive). Survives egg reset. */
let tamagotchiKilledByUserCount = 0;
/** Lifetime: deaths from hunger / health / old age (incl. debug natural kill). Survives egg reset. */
let tamagotchiNaturalDeathCount = 0;
let tamagotchiLastPoopTime = 0; // When last poop was created
let tamagotchiSleepStartTime = 0; // When sleep period starts
let tamagotchiSleepEndTime = 0; // When sleep period ends
let tamagotchiIsSleeping = false;
let tamagotchiLightsManualOverride = false; // User manually toggled lights (prevents auto sleep/wake)
let tamagotchiLastPraise = 0; // Last time praised
let tamagotchiLastScold = 0; // Last time scolded
let tamagotchiNeedsPraise = false;
let tamagotchiNeedsScold = false;
let tamagotchiLifeMinutes = 0; // Real-time life clock (classic Tamagotchi pacing)
let tamagotchiEggGeneration = 0; // Bumps on intentional egg reset; blocks stale tabs from wiping progress
let tamagotchiTickIntervalId = null;
let tamagotchiDataLoaded = false; // Gate ticks until storage is loaded (prevents egg/none clobber)
let mascotStagePreviewLock = false;
let mascotStagePreviewStage = null;
let mascotStagePreviewTimeout = null;

// Life only advances during office hours (09:00–21:00). Outside that window the
// mascot is frozen so leaving the PC on overnight won't age or starve it.
const TAMA_OFFICE_HOUR_START = 9;  // inclusive
const TAMA_OFFICE_HOUR_END = 21;   // exclusive (stops at 21:00)

// Stage thresholds in office-minutes. ~15 office-days (12h/day) to reach old.
const TAMA_STAGE_MINUTES = {
    egg: 0,
    baby: 1,          // 1 office-min — hatch
    kid: 488,         // ~0.7 office-days
    teen: 1350,       // ~1.9 office-days
    adult: 2700,      // ~3.8 office-days
    middleage: 5400,  // ~7.5 office-days
    old: 10800,       // ~15 office-days
    death: 36000,     // ~50 office-days (~80 display-years)
};
// Display age pacing: old ≈ 24 years, death ≈ 80 years
const TAMA_MINUTES_PER_YEAR = 450;

/** Minutes between two timestamps that fall inside office hours (09:00–21:00 local). */
function getOfficeMinutesBetween(startMs, endMs) {
    const start = Number(startMs);
    const end = Number(endMs);
    if (!Number.isFinite(start) || !Number.isFinite(end) || !(end > start)) return 0;
    let totalMs = 0;
    const day = new Date(start);
    day.setHours(0, 0, 0, 0);
    while (day.getTime() < end) {
        const officeStart = new Date(day);
        officeStart.setHours(TAMA_OFFICE_HOUR_START, 0, 0, 0);
        const officeEnd = new Date(day);
        officeEnd.setHours(TAMA_OFFICE_HOUR_END, 0, 0, 0);
        const segStart = Math.max(start, officeStart.getTime());
        const segEnd = Math.min(end, officeEnd.getTime());
        if (segEnd > segStart) totalMs += segEnd - segStart;
        day.setDate(day.getDate() + 1);
    }
    return totalMs / 60000;
}

const TAMA_CHARACTER_TYPES = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal'];

const MASCOT_CHAR_NAMES_GR = {
    dragon: 'Ember Sovereign', robot: 'Neon Colossus', slime: 'Abyssal Ooze', plant: 'Worldroot Warden',
    ghost: 'Veil Wraith', cat: 'Moonfang Oracle', phoenix: 'Ashborn Phoenix', crystal: 'Prism Titan'
};

const MASCOT_MESSAGES = {
    dead: 'Έφυγα από δω...',
    defaultBubble: [
        'Ωπ!', 'Έλα!', 'Ναι;', 'Τι έγινε;', 'Λέγε!', 'Εδώ είμαι!',
        'Τι κάνουμε;', 'Πάμε!', 'Ωραία!', 'Όλα καλά!', 'Μια χαρά!',
        'Ας δούμε...', 'Έτοιμος!', 'Τέλεια!', 'Φύγαμε!'
    ],
    idleRepair: [
        'Πάμε για δουλειά!', 'Τι θα χαλάσει σήμερα;', 'Έτοιμος!',
        'Ας δούμε τι έχουμε...', 'Μπαταρία μια χαρά!', 'Χμμ...',
        'Πού πήγε το κατσαβίδι μου;', 'Μικροκολλήσεις;', 'Θέλει reflow;',
        'Καλή μέρα!', 'Περιμένουμε κάτι;', 'Έχει δουλειά;',
        'Θα το κάνω σαν καινούριο!', 'Καμένο IC...', 'Ας δω το σχηματικό...',
        'Άνοιξε!', 'Θέλει reballing;', 'Πλακέτα ε;',
        'Μετράω τάσεις!', 'Flux και θερμό!', 'Τι έρχεται τώρα;',
        'Καφέ θες;', 'Οθόνη γρήγορα!', 'Άλλαξε μπαταρία!',
        'Θύρα φόρτισης πάλι;', 'Κάμερα χάλασε;', 'Ήχος πάει;',
        'Τσέκαρε WiFi!', 'Baseband πάει καλά;', 'Λογική πλακέτα;',
        'Βρήκα βραχύ!', 'Μπέρδεψα καλώδια!', 'Ποια θύρα είναι;',
        'Flux παντού!', 'Θέλει κόλληση!'
    ],
    lowStats: [
        'Πεινάω...', 'Δεν είμαι καλά...', 'Θέλω φαγητό!',
        'Λίγη προσοχή παρακαλώ!', 'Τάισέ με!', 'Πότε θα φάω;',
        'Μου λείπεις...', 'Χάδι θέλω!', 'Δεν μου κάνετε καλό...',
        'Είμαι λυπημένος...', 'Πεινάω πολύ...'
    ],
    oldAgeDeath: [
        'Ήρθε η ώρα μου...', 'Καλό ταξίδι...', 'Αντίο...', 'Ευχαριστώ για όλα...',
        'Έζησα όμορφα...', 'Τέλος καλό...', 'Πάω στο φως...', 'Ήταν όλα υπέροχα...'
    ],
    evolution: [
        'Μεγάλωσα!', 'Άλλαξα μορφή!', 'Εξελίχθηκα!', 'Νέο στάδιο!',
        'Προχώρησα!', 'Μεγαλώνω!', 'Νέα εμφάνιση!', 'Ώρα για κάτι καινούριο!'
    ],
    becameOld: [
        'Γέρασα...', 'Νιώθω μεγάλος...', 'Τα χρόνια περνούν...', 'Έγινα γέρος...'
    ],
    oldAgeWarning: [
        'Κουράζομαι εύκολα...', 'Νιώθω αδύναμος...', 'Τα κόκαλα μου πονάνε...',
        'Πόσα χρόνια πέρασαν...', 'Γεράσαμε...', 'Ο χρόνος τελειώνει...'
    ],
    sick: {
        cold: ['Αχού...', 'Κρυώνω...', 'Μυρίζω...', 'Δεν είμαι καλά...'],
        fever: ['Καίω...', 'Πυρετός...', 'Ζεστάκια...', 'Δεν αισθάνομαι καλά...'],
        upset_stomach: ['Πονάει η κοιλιά μου...', 'Δεν μπορώ να φάω...', 'Άρρωστος...', 'Μου έφτασε...']
    },
    death: [
        '...', 'Αντίο...', 'Έφυγα...', 'Καλό ταξίδι...',
        'Επιστρέφω στον ψηφιακό κόσμο...', 'Ξεκουράζομαι...'
    ],
    deathCinematic: ['...', 'Αντίο...', 'Καλό ταξίδι...', 'Θα με θυμάσαι...'],
    revived: 'Ξαναζωσαίνω!',
    newEggStart: [
        'Νέο αυγό! Ας ξεκινήσουμε από την αρχή.',
        'Ξανά από την αρχή... 🥚',
        'Καθαρό ξεκίνημα!',
    ],
    bye: [
        'Τα λέμε!', 'Γεια!', 'Αντίο!', 'Τα ξαναλέμε!', 'Φιλάκια!',
        'Πάω!', 'Καλά να περνάς!', 'Τα λέμε σύντομα!'
    ],
    eggWarmLights: 'Άναψε πρώτα τα φώτα για ζεστασιά! 💡',
    eggWarm: [
        'Ζεστάκια μέσα!', 'Νιώθω ζεστασιά...', 'Κρατιέται καλά!', 'Θα βγει σύντομα!',
        'Ζεστό και άνετο!', 'Σσσ... αναπνέει!', 'Όλα καλά!'
    ],
    eggWatch: [
        'Νιώθω κούνηση...', 'Χτυπάει μέσα!', 'Ζωντανό είναι!', 'Περιμένουμε...',
        'Κάτι κινείται!', 'Έρχεται!', 'Λίγη υπομονή ακόμα!'
    ],
    feed: [
        'Μμμ, νόστιμο!', 'Πεινούσα!', 'Ωραίο φαγητό!', 'Τέλειο!',
        'Νάμ νάμ!', 'Ευχαριστώ!', 'Θέλω κι άλλο!', 'Πεντανόστιμο!',
        'Υπέροχο!', 'Λατρεύω φαγητό!', 'Τι γεύση!', 'Άψογο!'
    ],
    feedPanel: [
        'Νόστιμο!', 'Ωραίο!', 'Μμμ!', 'Τέλεια!',
        'Πεινούσα!', 'Νάμ νάμ!', 'Ευχαριστώ φίλε!', 'Άλλο λίγο;',
        'Σουβλάκι!', 'Γύρος;', 'Καφέδακι!', 'Τυρόπιτα;',
        'Burger!', 'Πίτσα!', 'Ενέργεια!', 'Φαγητό!',
        'Νόστιμο πολύ!', 'Κόλλησα!', 'Θα φάω!', 'Ωραία φάση!'
    ],
    full: ['Χόρτασα!', 'Γεμάτος!', 'Όχι άλλο!', 'Θα σκάσω!', 'Αρκετά!'],
    snack: ['Γλυκό!', 'Νόστιμο σνακ!', 'Ωραίο!', 'Μμμ!', 'Τέλεια!'],
    snackPanel: ['Σνακ!', 'Νόστιμο!', 'Γλυκό!', 'Ωραίο!', 'Ευχαριστώ!', 'Τέλεια!'],
    notHungrySnack: 'Δεν πεινάω για σνακ!',
    pet: ['Μ\' αρέσει!', '💕', 'Ωραία!', 'Ακόμα!', 'Τέλειο!', 'Ναι!', 'Πάλι!'],
    petPanel: [
        'Ω ναι!', 'Αγάπη!', 'Ωραία!', 'Τέλεια!',
        'Ακόμα!', 'Χαίρομαι!', 'Ευχαριστώ!', 'Έτσι είναι καλύτερα!',
        'Ωραία φάση!', 'Μου αρέσει!', 'Χαχα!', 'Γαργαλάει!',
        'Ωχού!', 'Πάλι πάλι!', 'Τέλεια!', 'Μου αρέσει πολύ!', 'Ωωω!', 'Γλυκιά μου!'
    ],
    maxHappy: ['Είμαι μια χαρά!', 'Τέλειος!', 'Όλα καλά!', 'Ήδη χαρούμενος!', 'Κομπλέ!'],
    clean: ['Καθαρά!', 'Ευχαριστώ!', 'Πολύ καλύτερα!', 'Τέλεια!', 'Φρεσκάδα!'],
    cleanPanel: ['Καθαρός!', 'Ωραία!', 'Φρέσκο!', 'Καθάρισα!', 'Ευχαριστώ!'],
    alreadyClean: ['Είμαι ήδη καθαρός!', 'Είναι καθαρά!', 'Όλα καλά εδώ!'],
    medicine: ['Καλύτερα!', 'Αισθάνομαι καλά!', 'Πέρασε!', 'Έγινα καλά!', 'Ευχαριστώ!'],
    medicinePanel: ['Καλύτερα!', 'Ευχαριστώ!', 'Γιατρός!', 'Θα γίνω καλά!', 'Έφτιαξα!'],
    healthy: ['Είμαι υγιής!', 'Μια χαρά είμαι!', 'Όλα καλά!'],
    feelingBetter: 'Αισθάνομαι καλύτερα!',
    toiletTrained: 'Έμαθα τουαλέτα! 🎉',
    toiletRelief: 'Ανακούφιση! 🚽',
    toiletOk: 'Εντάξει! 🚽',
    toiletGood: 'Ωραία! 🚽',
    toiletTraining: 'Εξάσκηση... 🚽',
    praise: ['Ευχαριστώ!', 'Μπράβο μου!', 'Ωραίος!', 'Τέλειος!', 'Είμαι καλός!', 'Σ\' αρέσω;', 'Χαίρομαι!', 'Ναι ναι!'],
    praiseThanks: 'Ευχαριστώ! 😊',
    scoldSorry: 'Συγγνώμη... 😢',
    scold: ['Εντάξει...', 'Συγγνώμη!', 'Δεν θα το ξανακάνω!', 'Λάθος μου!', 'Κατάλαβα!', 'Συγχώρεσέ με!'],
    scoldWhy: 'Γιατί; 😢',
    scoldPanelSorry: 'Συγγνώμη...',
    tired: 'Κουράστηκα!',
    lightsOn: 'Φώτα ανοιχτά!',
    goodNight: 'Καληνύχτα! 😴',
    greeting: [
        'Ναι;', 'Τι κάνουμε;', 'Έλα!', 'Λέγε!',
        'Με φώναξες;', 'Τι θες;', 'Εδώ είμαι!',
        'Φτιάχνουμε;', 'Βοήθεια θες;', 'Πάμε για δουλειά!', 'Λέγε!',
        'Γεια {nickname}!', 'Έλα {nickname}!', '{nickname} εδώ!'
    ],
    wake: ['Ξύπνησα!', 'Έγιρα!', 'Έτοιμος!', 'Καλημέρα!', 'Φύγαμε!'],
    sleep: ['Κοιμάμαι...', 'Ζζζ...', 'Καληνύχτα!', '💤', 'Νύχτα...'],
    playGame: ['Ωραίο παιχνίδι!', 'Διασκέδασα!', 'Πάλι!', 'Τέλεια!', 'Γουάου!'],
    juggling: ['Κοίτα!', 'Ορίστε!', 'Παρακολούθησε!', 'Το κόλπο!'],
    eureka: [
        'Το βρήκα!', 'Α! Αυτό ήταν!', 'Εδώ είναι το πρόβλημα!',
        'Φυσικά!', 'Μα ναι!', 'Το έπιασα!', 'Α! Κατάλαβα!',
        'Αυτό ψάχνω!', 'Το είχα!', 'Εννοείται!'
    ],
    sunny: [
        'Τι μέρα!', 'Έχει ήλιο!', 'Ωραίος καιρός!', 'Καλός καιρός!',
        'Λάμπει!', 'Τέλεια μέρα!', 'Ζέστη!', 'Καλοκαιράκι!', 'Υπέροχα!'
    ],
    rainy: [
        'Βροχή...', 'Στάλα στάλα...', 'Μούσκεμα!', 'Ουφ, βρέχει...',
        'Πού είναι η ομπρέλα μου;', 'Βροχερό!', 'Τι μαύρα!', 'Έχει νερά!', 'Άσχημα...'
    ],
    success: [
        'Ωραία!', 'Μπράβο!', 'Τέλεια!', 'Έγινε!', 'Άριστα!',
        'Άψογα!', 'Εξαιρετικά!', 'Επισκευή ΟΚ!', 'Κομπλέ!', 'Φοβερά!'
    ],
    error: [
        'Ουπς...', 'Τι έπαθε;', 'Ωχ...', 'Πρόβλημα!',
        'Δεν πάει καλά...', 'Μμμ...', 'Τι γίνεται;',
        'Σφάλμα!', 'Άσχημα...', 'Τι έγινε;'
    ],
    tooSoon: 'Περίμενε λίγο!',
    orderSave: [
        'Νέα παραγγελία!', 'Αποθηκεύτηκε!', 'Ωραία!', 'Καταχωρήθηκε!',
        'Πάμε!', 'Έτοιμο!', 'Μια ακόμα!', 'Γράψαμε!', 'Κομπλέ!'
    ],
    orderPart: [
        'Παραγγελία ανταλλακτικού!', 'Το παραγγέλνω!', 'Έρχεται το part!',
        'Έτοιμο!', 'Κομπλέ!', 'Έρχεται!', 'Ας έρθει!', 'Ωραία φάση!'
    ],
    testBubble: [
        'Έτοιμος να βοηθήσω!', 'Πάμε!', 'Τι κάνουμε σήμερα;',
        'Εδώ είμαι!', 'Ας δουλέψουμε!', 'Έτοιμος για δουλειά!'
    ],
    testDebug: [
        'Γεια σου! 👋', 'Δοκιμή 1, 2, 3!', 'Όλα καλά! 🎉',
        'Ωραία φάση!', 'Δουλεύω κανονικά!', 'Λειτουργώ! 🔧'
    ],
    startupGreeting: [
        'Έτοιμος να βοηθήσω!', 'Πάμε!', 'Τι κάνουμε σήμερα;',
        'Εδώ είμαι!', 'Ας δουλέψουμε!', 'Έτοιμος για δουλειά!'
    ],
    statusChange: [
        'Άλλαξε η κατάσταση!', 'Μπράβο!', 'Ωραία!',
        'Πάμε παρακάτω!', 'Προχωράμε!', 'Συνεχίζουμε!'
    ],
    repairSave: [
        'Αποθηκεύτηκε! ✓', 'Έγινε!', 'Τέλεια!',
        'Όλα καλά!', 'Κομπλέ!', 'Μια χαρά!'
    ],
    deviceDetect: [
        '{device}... Χμμ...',
        '{device}! Το ξέρω αυτό!',
        'Ωραία συσκευή!',
        'Ας δούμε τι έχει...'
    ],
    repair30one: [
        'Μόνο {n} στο 30 ({name}) — ήσυχα!',
        'Μία {name} — πιάστη την!',
        '{n} εισαγωγή — καλά πάμε!',
        'Ένα στο 30, {name}. Εύκολο!'
    ],
    repair30few: [
        '{n} στο 30 ({name}) — λίγες ακόμα.',
        '{n} εισαγωγές — manageable.',
        'Έχουμε {n} {name} — οκ.'
    ],
    repair30some: [
        '{n} στο 30 ({name}) — αρχίζει να γεμίζει.',
        '{n} εισαγωγές — κράτα ρυθμό!',
        'Προσοχή: {n} στο 30!'
    ],
    repair30many: [
        '{n} στο 30! Κούνησε λίγο!',
        'Έχουμε {n} στο 30! Πάμε να τις πάρουμε;',
        '{n} εισαγωγές! Ώρα για δουλειά!',
        '{n} στο 30... τι περιμένουμε;',
        '{n} νέες! Μπροστά!',
        '{n} στο 30 — δουλειά έχουμε!'
    ],
    repair40one: [
        'Μόνο {n} στο 40 — {name}. Ήσυχα!',
        'Μία {name}! Πιάστη την!',
        '{n} στο 40 ({name}) — καλά πάμε!',
        'Ένα μόνο στο 40, {name}. Άντε!',
        'Μόνη μία {name} — τελείωσέ την!'
    ],
    repair40few: [
        '{n} στο 40 ({name}) — λίγες, προχώρα!',
        '{n} προς έλεγχο — οκ ακόμα.',
        'Έχουμε {n} {name} — πάμε!'
    ],
    repair40some: [
        '{n} στο 40 ({name}) — αρχίζουν να μαζεύονται.',
        '{n} προς έλεγχο — μην αργείς!',
        'Προσοχή: {n} στο 40!'
    ],
    repair40many: [
        '{n} στο 40! Γιατί τόσες;',
        '{n} στο 40! Τελείωνέ τες!',
        '{n} {name} — πότε τελειώνουν;',
        'Ουφ, {n} στο 40! Τι γίνεται;',
        '{n} στο 40! Μην αργείς!'
    ],
    repair65one: [
        'Μόνο {n} στο 65 ({name}) — μία περιμένει part.',
        'Μία {name} χωρίς ανταλλακτικό — παράγγειλε!',
        '{n} στο 65 — ένα part λείπει.'
    ],
    repair65few: [
        '{n} στο 65 ({name}) — λίγες περιμένουν.',
        '{n} για ανταλλακτικά — εντάξει ακόμα.',
        'Έχουμε {n} {name} — τσέκαρε τα parts.'
    ],
    repair65some: [
        '{n} στο 65 ({name}) — αρχίζει να πιέζει.',
        '{n} περιμένουν parts — κούνησε τις παραγγελίες!',
        'Προσοχή: {n} στο 65!'
    ],
    repair65many: [
        '{n} στο 65! Περιμένουν ανταλλακτικά!',
        '{n} στο 65! Τα parts δεν έρχονται;',
        '{n} χωρίς ανταλλακτικά!',
        '{n} στο 65 — παράγγειλε!',
        '{n} στο 65! Parts ρε!'
    ],
    repair90one: [
        'Μία στο 90 ({name}) — πρόσεχε!',
        '1 στο 90! Τι έγινε;',
        'Μόνο {n} στο 90 — αλλά σοβαρό!',
        'Μία {name} στο 90 — κοίτα την!'
    ],
    repair90few: [
        '{n} στο 90 ({name}) — δεν μου αρέσει αυτό.',
        '{n} στο 90 — πρόσεχε!',
        'Έχουμε {n} {name} στο 90 — άμεσα!'
    ],
    repair90some: [
        '{n} στο 90! Τι τρέχει;',
        '{n} στο 90 ({name}) — κίνδυνος!',
        'Προσοχή: {n} στο 90!'
    ],
    repair90many: [
        '{n} στο 90! Φτιάξε τες!',
        '{n} στο 90 — κατάσταση!',
        '{n} στο 90! Μην το αφήνεις!',
        'Ουφ, {n} στο 90 ({name})!'
    ],
    repairEmpty: ['Καθαρά όλα!', 'Άδειο!', 'Ησυχία!', 'Τίποτα σήμερα!'],
    orderList: [
        '{n} παραγγελίες!', 'Πολλές παραγγελίες σήμερα!',
        'Έχουμε δουλειά!', '{n} παραγγελίες — ωραία!'
    ],
    partsStock: [
        'Πολλά ανταλλακτικά!', 'Καλό stock!', 'Έχουμε όλα!',
        'Γεμάτο απόθεμα!', 'Ωραία!'
    ],
    partsSearch: [
        'Ψάχνεις κάτι;', 'Τι χρειάζεσαι;',
        'Βοηθάω;', 'Πες μου!', 'Τι part θες;'
    ],
    customerContact: [
        'Καλή επικοινωνία!', 'Πάμε!', 'Τηλέφωνο!',
        'Επικοινωνία!', 'Μίλα τους!'
    ],
    tableBrowse: [
        'Τι ψάχνεις;', 'Χμμ...', 'Ας δούμε...',
        'Ενδιαφέρον!', 'Ωραίο!'
    ],
    printAction: [
        'Εκτύπωση! 🖨️', 'Τυπώνουμε!', 'Χαρτί!',
        'Στον εκτυπωτή!', 'Εκτύπωσε!'
    ],
    deleteWarn: [
        'Προσοχή!', 'Σίγουρα;', 'Διαγραφή;',
        'Πρόσεχε!', 'Θες σίγουρα;'
    ],
    formSubmit: [
        'Στέλνουμε!', 'Πάμε!', 'Έγινε!',
        'Στάλθηκε!', 'Οκ!'
    ],
    pageSuccess: [
        'Ναι ρε! 🎉', 'Μπράβο!', 'Εξαιρετικά!', 'Άψογα!',
        'Τέλειο!', 'Όλα καλά!', 'Ωραίος!', 'Πάμε!'
    ],
    pageError: [
        'Ωχ όχι...', 'Τι έγινε;', 'Πρόβλημα!', 'Χμμ...',
        'Δεν πάει καλά...', 'Άου!', 'Τι έπαθε;', 'Σφάλμα!'
    ],
    repairPriceZero: [
        'Χωρίς τιμή; Θα το κάνουμε δωρεάν;',
        '0€ — κάτι ξέχασες;',
        'Κενό πεδίο τιμής — βάλε κάτι!',
        'Καμία τιμή ακόμα...'
    ],
    repairPriceTiny: [
        'Μόνο {price} — σχεδόν δωρεάν!',
        '{price}; καφέ τιμή!',
        'Φτηνάκι: {price}!'
    ],
    repairPriceLow: [
        '{price} — λογική τιμή!',
        'Καλά τα {price}, οκ!',
        '{price} — μέσα στο budget.'
    ],
    repairPriceMid: [
        '{price} — νορμάλ φάση.',
        'Οκ τιμή: {price}.',
        '{price} — τίποτα τρελό.'
    ],
    repairPriceHigh: [
        '{price} — αρχίζει να πονάει!',
        'Ψηλά τα {price}...',
        '{price}; προσοχή στον πελάτη!'
    ],
    repairPricePremium: [
        '{price}! Πρινμοτο!',
        'Ακριβάκι: {price}!',
        '{price} — θέλει καλή εξήγηση!'
    ],
    repairPriceExtreme: [
        '{price}!!! Τι είναι, καινούριο;',
        'Ρε συ, {price};',
        '{price} — θα το πληρώσει;',
        'Κόσμος τα {price}!'
    ]
};

const MASCOT_PERSONALITY_GR = {
    normal: 'Κανονικός', lazy: 'Τεμπέλης', active: 'Ζωηρός', spoiled: 'Καμωμένος',
    well_cared: 'Καλοφροντισμένος', neglected: 'Αμελημένος'
};

const MASCOT_STAGE_GR = {
    egg: 'Αυγό', baby: 'Μωρό', kid: 'Παιδί', teen: 'Έφηβος',
    adult: 'Ενήλικας', middleage: 'Μέσης ηλικίας', old: 'Γέρος'
};

function mascotMsg(key) {
    const pool = MASCOT_MESSAGES[key];
    if (Array.isArray(pool)) return pool[Math.floor(Math.random() * pool.length)];
    return pool || '';
}

function mascotMsgFmt(key, vars = {}) {
    let text = mascotMsg(key);
    Object.keys(vars).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    });
    return text;
}

const REPAIR_STATUS_DEFAULT_NAMES = {
    '30': 'εισαγωγές',
    '40': 'προς έλεγχο',
    '65': 'ανταλλακτικά',
    '90': 'προβληματικές'
};

const REPAIR_TIER_LIMITS = {
    '30': { few: 2, some: 4 },
    '40': { few: 2, some: 4 },
    '65': { few: 3, some: 7 },
    '90': { few: 1, some: 2 }
};

function repairCountTier(statusId, count) {
    if (count === 1) return 'one';
    const limits = REPAIR_TIER_LIMITS[statusId] || { few: 2, some: 5 };
    if (count <= limits.few) return 'few';
    if (count <= limits.some) return 'some';
    return 'many';
}

function formatRepairOpinion(template, count, statusName) {
    return template
        .replace(/\{n\}/g, String(count))
        .replace(/\{name\}/g, statusName);
}

function mascotRepairOpinionForStatus(statusId, count, statusName) {
    const tier = repairCountTier(statusId, count);
    const poolKey = `repair${statusId}${tier}`;
    const pool = MASCOT_MESSAGES[poolKey];
    const name = statusName || REPAIR_STATUS_DEFAULT_NAMES[statusId] || `στάδιο ${statusId}`;
    if (!pool?.length) return `${count} στο ${statusId} (${name})`;
    const template = pool[Math.floor(Math.random() * pool.length)];
    return formatRepairOpinion(template, count, name);
}

function parseRepairStatusMenu(root = document) {
    const trackedStatusIds = ['30', '40', '65', '90'];
    const statusIdMap = {};
    let totalRepairs = 0;

    const menuLinks = root.querySelectorAll(
        '.rnr-b-vmenu a[href*="statusid"], .menuLeaf a[href*="statusid"], a[href*="statusid="]'
    );

    menuLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const statusIdMatch = href.match(/statusid=(\d+)/);
        if (!statusIdMatch || !trackedStatusIds.includes(statusIdMatch[1])) return;

        const countBadge = link.querySelector('span.badge, .badge');
        if (!countBadge) return;

        const count = parseInt(countBadge.textContent.trim(), 10);
        if (isNaN(count) || count <= 0) return;

        const nameClone = link.cloneNode(true);
        nameClone.querySelector('.statusbadge')?.remove();
        nameClone.querySelectorAll('.badge').forEach(b => b.remove());
        const statusName = nameClone.textContent.replace(/\s+/g, ' ').trim()
            || REPAIR_STATUS_DEFAULT_NAMES[statusIdMatch[1]];

        statusIdMap[statusIdMatch[1]] = { name: statusName, count };
        totalRepairs += count;
    });

    return { statusIdMap, totalRepairs };
}

function mascotRepairUrgencyScore(statusId, count) {
    const tier = repairCountTier(statusId, count);
    const tierWeight = { one: 1, few: 2, some: 4, many: 8 };
    const statusWeight = { '90': 100, '65': 60, '30': 40, '40': 30 };
    return (statusWeight[statusId] || 10) + (tierWeight[tier] || 1) * count;
}

function mascotRepairOpinion(statusIdMap, totalRepairs) {
    if (totalRepairs === 0) return mascotMsg('repairEmpty');

    const activeIds = ['30', '40', '65', '90'].filter(id => statusIdMap[id]?.count > 0);
    if (activeIds.length === 0) return mascotMsg('repairEmpty');

    const pickId = activeIds[Math.floor(Math.random() * activeIds.length)];
    const { count, name } = statusIdMap[pickId];
    return mascotRepairOpinionForStatus(pickId, count, name);
}

function mascotRepairIsUrgent(statusIdMap) {
    return Object.keys(statusIdMap).some(id => {
        const count = statusIdMap[id]?.count || 0;
        if (!count) return false;
        const tier = repairCountTier(id, count);
        return tier === 'many' || (id === '90' && tier !== 'one');
    });
}

function mascotRepairMsgs(statusIdMap, totalRepairs) {
    if (totalRepairs === 0) return [...MASCOT_MESSAGES.repairEmpty];

    const messages = [];
    ['30', '40', '65', '90'].forEach(statusId => {
        const entry = statusIdMap[statusId];
        if (entry?.count > 0) {
            messages.push(mascotRepairOpinionForStatus(statusId, entry.count, entry.name));
        }
    });
    return messages.length ? messages : [...MASCOT_MESSAGES.repairEmpty];
}

function getRepairTotalAmountElement() {
    const direct = document.getElementById('value_iTotalAmount_1');
    if (direct) {
        const innerInput = direct.querySelector('input, textarea');
        return innerInput || direct;
    }
    return document.querySelector('input[name="value_iTotalAmount_1"]')
        || document.querySelector('[data-fieldname="iTotalAmount"] input, [data-fieldname="iTotalAmount"]');
}

function getRepairTotalAmountValue(el = getRepairTotalAmountElement()) {
    if (!el) return '';
    if ('value' in el && el.value !== undefined && el.value !== '') return el.value;
    return (el.textContent || el.innerText || '').trim();
}

function parseRepairPriceAmount(raw) {
    if (raw === null || raw === undefined) return NaN;
    const s = String(raw).trim().replace(/[€\s]/g, '');
    if (!s || s === '-' || s === '—') return NaN;
    if (/\d,\d{1,2}$/.test(s)) {
        return parseFloat(s.replace(/\./g, '').replace(',', '.'));
    }
    const normalized = s.replace(/,/g, '');
    const amount = parseFloat(normalized);
    return isNaN(amount) ? NaN : amount;
}

function formatRepairPriceEuro(amount) {
    return amount.toLocaleString('el-GR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '€';
}

function repairPriceTier(amount) {
    if (isNaN(amount) || amount <= 0) return 'zero';
    if (amount < 20) return 'tiny';
    if (amount < 60) return 'low';
    if (amount < 120) return 'mid';
    if (amount < 200) return 'high';
    if (amount < 350) return 'premium';
    return 'extreme';
}

function mascotRepairPriceOpinion(amount) {
    const tier = repairPriceTier(amount);
    const price = !isNaN(amount) && amount > 0 ? formatRepairPriceEuro(amount) : '0€';
    const poolKey = {
        zero: 'repairPriceZero',
        tiny: 'repairPriceTiny',
        low: 'repairPriceLow',
        mid: 'repairPriceMid',
        high: 'repairPriceHigh',
        premium: 'repairPricePremium',
        extreme: 'repairPriceExtreme'
    }[tier];
    const pool = MASCOT_MESSAGES[poolKey];
    const template = pool?.[Math.floor(Math.random() * pool.length)] || '{price}';
    const text = template.replace(/\{price\}/g, price);

    const mood = {
        zero: 'thinking',
        tiny: 'happy',
        low: 'happy',
        mid: 'idle',
        high: 'surprised',
        premium: 'surprised',
        extreme: 'surprised'
    }[tier];

    return { text, mood, tier, amount };
}

function initMascotRepairPriceComments(config) {
    if (!config?.interactiveMascotEnabled) return;
    if (!window.location.pathname.includes('service_edit.php')) return;

    let lastCommentedAmount = null;
    let lastCommentTime = 0;
    let priceObserver = null;

    function showPriceOpinion(amount, options = {}) {
        const { force = false, throttleMs = 6000 } = options;
        const now = Date.now();
        const amountKey = isNaN(amount) ? 'empty' : amount;
        if (!force && amountKey === lastCommentedAmount) return;
        if (!force && now - lastCommentTime < throttleMs) return;

        const opinion = mascotRepairPriceOpinion(amount);
        if (!opinion?.text) return;

        showMascotBubble(opinion.text, 4500);
        if (opinion.mood) setMascotState(config, opinion.mood, 2500);
        lastCommentedAmount = amountKey;
        lastCommentTime = now;
    }

    function readCurrentPrice() {
        return parseRepairPriceAmount(getRepairTotalAmountValue());
    }

    function attachPriceListeners(el) {
        const handler = () => {
            const amount = readCurrentPrice();
            showPriceOpinion(amount);
        };
        let debounce;
        const debounced = () => {
            clearTimeout(debounce);
            debounce = setTimeout(handler, 700);
        };

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
            el.addEventListener('input', debounced);
            el.addEventListener('change', debounced);
        }

        if (priceObserver) priceObserver.disconnect();
        priceObserver = new MutationObserver(debounced);
        priceObserver.observe(el, { childList: true, subtree: true, characterData: true, attributes: true });
    }

    function trySetup(attempt = 0) {
        const el = getRepairTotalAmountElement();
        if (!el) {
            if (attempt < 10) setTimeout(() => trySetup(attempt + 1), 1000);
            return;
        }

        const amount = readCurrentPrice();
        setTimeout(() => showPriceOpinion(amount, { force: true }), 3500);

        attachPriceListeners(el);
        console.log('[MMS Mascot] Repair price commentary active on', el.id || el.name || el.tagName);
    }

    trySetup(0);
}

function formatTamagotchiStatsBubble() {
    const daysOld = Math.floor((Date.now() - tamagotchiBirthday) / (1000 * 60 * 60 * 24));
    const sickNames = { cold: 'Κρύωμα', fever: 'Πυρετός', upset_stomach: 'Αναστάτωση στομάχου' };
    const stageGr = MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage;
    const personalityGr = MASCOT_PERSONALITY_GR[tamagotchiPersonality] || tamagotchiPersonality;
    const sickLine = tamagotchiIsSick
        ? `🤒 Άρρωστος: ${sickNames[tamagotchiSickType] || 'Άρρωστος'}`
        : '✅ Υγιής';
    const toiletLine = tamagotchiToiletTrained ? '🚽 Έμαθε τουαλέτα' : '❌ Χωρίς εκπαίδευση';
    return `📊 Στατιστικά:
Ηλικία: ${Math.floor(tamagotchiAge)} χρ. (${daysOld} μέρες)
Βάρος: ${Math.round(tamagotchiWeight)} kg
Πείνα: ${Math.round(petStats.hunger)}%
Χαρά: ${Math.round(petStats.happiness)}%
Υγεία: ${Math.round(tamagotchiHealth)}%
Πειθαρχία: ${Math.round(tamagotchiDiscipline)}%
Στάδιο: ${stageGr}
Χαρακτήρας: ${personalityGr}
Λάθη φροντίδας: ${tamagotchiCareMistakes}
Θάνατοι (φυσικοί): ${tamagotchiNaturalDeathCount}
Θάνατοι (σκοτωμοί): ${tamagotchiKilledByUserCount}
Κακά: ${tamagotchiPoopCount}
${sickLine}
${toiletLine}`;
}

function mascotHatchMsg(characterType) {
    const char = MASCOT_CHARACTERS[characterType];
    const nameGr = MASCOT_CHAR_NAMES_GR[characterType] || char?.nameGr || char?.name || characterType;
    const emoji = char?.emoji || '🐣';
    return `🥚💫 Γεννήθηκα! Είμαι ${emoji} ${nameGr}!`;
}

function getTamagotchiStageFromLifeMinutes(minutes) {
    const m = Number(minutes);
    if (!Number.isFinite(m) || m < TAMA_STAGE_MINUTES.baby) return 'egg';
    if (m < TAMA_STAGE_MINUTES.kid) return 'baby';
    if (m < TAMA_STAGE_MINUTES.teen) return 'kid';
    if (m < TAMA_STAGE_MINUTES.adult) return 'teen';
    if (m < TAMA_STAGE_MINUTES.middleage) return 'adult';
    if (m < TAMA_STAGE_MINUTES.old) return 'middleage';
    return 'old';
}

function syncTamagotchiAgeFromLife() {
    const m = Number(tamagotchiLifeMinutes);
    tamagotchiLifeMinutes = Number.isFinite(m) ? Math.max(0, m) : 0;
    tamagotchiAge = Math.floor(tamagotchiLifeMinutes / TAMA_MINUTES_PER_YEAR);
}

/** Recover lifeMinutes when storage has a hatched pet but life clock was wiped to 0. */
function resolveLifeMinutesFromSave(savedData) {
    const stage = savedData.stage || 'egg';
    const char = savedData.characterType;
    const hatchedHint = (stage && stage !== 'egg') || (char && char !== 'none');
    let life = Number(savedData.lifeMinutes);

    if (!Number.isFinite(life)) {
        const stageFloor = TAMA_STAGE_MINUTES[stage] ?? 0;
        return stageFloor + Math.max(0, (savedData.age || 0) * TAMA_MINUTES_PER_YEAR);
    }

    if (life <= 0 && hatchedHint) {
        const floor = TAMA_STAGE_MINUTES[stage !== 'egg' ? stage : 'baby'] ?? TAMA_STAGE_MINUTES.baby;
        const recovered = Math.max(floor, Math.max(0, (savedData.age || 0) * TAMA_MINUTES_PER_YEAR));
        console.warn(`[Mascot] Recovered lifeMinutes=${recovered} from stage/character (was ${savedData.lifeMinutes})`);
        return recovered;
    }

    return Math.max(0, life);
}

function getEggHatchProgress() {
    return Math.min(100, (tamagotchiLifeMinutes / TAMA_STAGE_MINUTES.baby) * 100);
}

function getMinutesUntilHatch() {
    return Math.max(0, Math.ceil(TAMA_STAGE_MINUTES.baby - tamagotchiLifeMinutes));
}

function setSvgSpriteVisible(element, visible) {
    if (!element) return;
    if (visible) {
        // Explicit show — do not rely on removeProperty (fragile with mixed inline styles)
        element.style.display = 'block';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.removeAttribute('hidden');
    } else {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
    }
}

function ensureTamagotchiCharacterType(options = {}) {
    const { allowRandom = false, clearForEgg = false } = options;

    if (tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.baby || tamagotchiStage === 'egg') {
        if (clearForEgg || tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.baby) {
            tamagotchiCharacterType = 'none';
        }
        return;
    }

    if (tamagotchiCharacterType && tamagotchiCharacterType !== 'none'
        && TAMA_CHARACTER_TYPES.includes(tamagotchiCharacterType)) {
        return;
    }

    // Hatched pet missing a character: only roll once when explicitly hatching — never on load/validate
    if (allowRandom) {
        tamagotchiCharacterType = TAMA_CHARACTER_TYPES[Math.floor(Math.random() * TAMA_CHARACTER_TYPES.length)];
        console.log(`[Mascot] Assigned character type: ${tamagotchiCharacterType}`);
        return;
    }

    console.warn('[Mascot] Hatched pet missing characterType — leaving unset until hatch/recover (no random re-roll)');
}

function validateTamagotchiState() {
    syncTamagotchiAgeFromLife();
    tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
    // Never randomly re-roll character here — that caused a new mascot on every refresh
    ensureTamagotchiCharacterType({ clearForEgg: tamagotchiStage === 'egg' });

    if (tamagotchiStage === 'egg') {
        tamagotchiPoopCount = 0;
        tamagotchiLastPoopTime = 0;
        updateToiletNeedIndicator();
    } else if (!tamagotchiLastPoopTime) {
        tamagotchiLastPoopTime = Date.now();
    }
}

function parseTamagotchiStorageValue(raw) {
    if (raw == null || raw === '' || raw === 'null') return null;
    if (typeof raw === 'object') return raw;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn('[Mascot] Failed to parse tamagotchi storage:', err);
        return null;
    }
}

function getTamagotchiStorageKeys(STORAGE_KEYS) {
    if (STORAGE_KEYS?.TAMAGOTCHI_DATA) return STORAGE_KEYS;
    if (typeof window !== 'undefined' && window.STORAGE_KEYS?.TAMAGOTCHI_DATA) return window.STORAGE_KEYS;
    return { TAMAGOTCHI_DATA: 'tm_tamagotchi_data', PET_STATS: 'tm_pet_stats' };
}

/**
 * Helper function to get the correct accessory element from the DOM, handling special cases.
 * @param {string} itemId The ID of the accessory.
 * @returns {HTMLElement|null} The DOM element for the accessory.
 */
function getAccessoryElement(itemId) {
    const normalized = normalizeAccessoryId(itemId);
    if (!normalized) return null;
    return document.getElementById(normalized);
}

function stopRoaming(config) {
    clearRoamingMoveTimeout();
    if (playfulTimeout) clearTimeout(playfulTimeout);
    
    // Stop physics animation
    stopPhysicsAnimation();

    const mascotContainer = document.getElementById('tm-mascot-container');
    if (mascotContainer) {
        // Commit the current animated position before canceling
        const animations = mascotContainer.getAnimations();
        if (animations.length > 0) {
            // Get the current computed position during animation
        const computedStyle = window.getComputedStyle(mascotContainer);
            const matrix = new DOMMatrix(computedStyle.transform);
            const currentX = matrix.m41;
            const currentY = matrix.m42;
            
            // Cancel all animations
            animations.forEach(anim => anim.cancel());
            
            // Set the final position explicitly
            const clamped = clampMascotPosition(currentX, currentY, getMascotRoamingMetrics(mascotContainer));
            applyMascotPosition(mascotContainer, clamped.x, clamped.y);
        }
    }

    roamingTimeout = null;
    isRoaming = false;
}

// Physics-based limb animation variables
let lastMascotX = 0;
let lastMascotY = 0;
let mascotVelocityX = 0;
let mascotVelocityY = 0;
let physicsAnimationFrame = null;
let limbPhysicsFrameCount = 0;

function updateLimbPhysics() {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer) return;

    // Keep mascot on-screen (every few frames; CSS idle float / jetpack can extend painted bounds).
    limbPhysicsFrameCount += 1;
    if (limbPhysicsFrameCount % 6 === 0) {
        ensureMascotInBounds(mascotContainer);
    }

    // Get current position
    const transformMatrix = new DOMMatrix(window.getComputedStyle(mascotContainer).transform);
    const currentX = transformMatrix.m41;
    const currentY = transformMatrix.m42;

    // Calculate velocity (smoothed)
    const newVelocityX = (currentX - lastMascotX) * 0.3 + mascotVelocityX * 0.7;
    const newVelocityY = (currentY - lastMascotY) * 0.3 + mascotVelocityY * 0.7;
    
    mascotVelocityX = newVelocityX;
    mascotVelocityY = newVelocityY;
    
    lastMascotX = currentX;
    lastMascotY = currentY;

    // Apply physics to limbs based on velocity (visible sprite only)
    const sprite = getVisibleMascotSpriteRoot();
    const leftArm = sprite?.querySelector('.tm-animate-arm-left');
    const rightArm = sprite?.querySelector('.tm-animate-arm-right');
    const leftLeg = sprite?.querySelector('.tm-animate-leg-left');
    const rightLeg = sprite?.querySelector('.tm-animate-leg-right');
    const tail = sprite?.querySelector('.tm-animate-tail');
    const leftWing = sprite?.querySelector('.tm-animate-wing-left');
    const rightWing = sprite?.querySelector('.tm-animate-wing-right');

    // Calculate speed
    const speed = Math.sqrt(mascotVelocityX * mascotVelocityX + mascotVelocityY * mascotVelocityY);
    const isMoving = speed > 0.3;

    if (isMoving) {
        // Calculate rotation based on horizontal velocity (momentum effect)
        const armSwing = Math.max(-25, Math.min(25, mascotVelocityX * 0.5));
        const legKick = Math.abs(mascotVelocityX) > 0.5 ? Math.sin(Date.now() * 0.01) * 15 : 0;
        const tailSwing = Math.max(-30, Math.min(30, -mascotVelocityX * 0.8));
        const wingFlap = speed > 1 ? Math.sin(Date.now() * 0.008) * 20 : 0;

        // Apply physics transformations
        if (leftArm) {
            leftArm.style.transform = `rotate(${-armSwing}deg)`;
        }
        if (rightArm) {
            rightArm.style.transform = `rotate(${armSwing}deg)`;
        }
        if (leftLeg) {
            const legOffset = Math.sin(Date.now() * 0.012) * Math.abs(mascotVelocityX) * 3;
            leftLeg.style.transform = `translateY(${legKick + legOffset}px)`;
        }
        if (rightLeg) {
            const legOffset = Math.sin(Date.now() * 0.012 + Math.PI) * Math.abs(mascotVelocityX) * 3;
            rightLeg.style.transform = `translateY(${legKick - legOffset}px)`;
        }
        if (tail) {
            tail.style.transform = `rotate(${tailSwing}deg)`;
        }
        if (leftWing) {
            leftWing.style.transform = `rotate(${-wingFlap}deg)`;
        }
        if (rightWing) {
            rightWing.style.transform = `rotate(${wingFlap}deg)`;
        }

        if ((hasEquippedMascotAccessories() || hasActiveStateAccessories()) && limbPhysicsFrameCount % 6 === 0) {
            updateMascotAccessoryLayout();
        }
    } else {
        // Reset to neutral when not moving (let CSS animations take over)
        if (leftArm) leftArm.style.transform = '';
        if (rightArm) rightArm.style.transform = '';
        if (leftLeg) leftLeg.style.transform = '';
        if (rightLeg) rightLeg.style.transform = '';
        if (tail) tail.style.transform = '';
        if (leftWing) leftWing.style.transform = '';
        if (rightWing) rightWing.style.transform = '';
    }

    // Continue animation loop
    physicsAnimationFrame = requestAnimationFrame(updateLimbPhysics);
}

function startPhysicsAnimation() {
    if (!physicsAnimationFrame) {
        physicsAnimationFrame = requestAnimationFrame(updateLimbPhysics);
    }
}

function stopPhysicsAnimation() {
    if (physicsAnimationFrame) {
        cancelAnimationFrame(physicsAnimationFrame);
        physicsAnimationFrame = null;
    }
}

const MASCOT_EDGE_PAD = 6;
/** Minimum painted overflow beyond the 100×100 box (shadow, jetpack flames, bubble). */
const MASCOT_OVERFLOW_SLACK = { top: 42, right: 16, bottom: 24, left: 16 };

function cacheMascotScreenInfo() {
    const info = {
        screenWidth: window.screen?.width ?? window.innerWidth,
        screenHeight: window.screen?.height ?? window.innerHeight,
        availWidth: window.screen?.availWidth ?? window.innerWidth,
        availHeight: window.screen?.availHeight ?? window.innerHeight,
        devicePixelRatio: window.devicePixelRatio ?? 1,
    };
    window.__tmMascotScreen = info;
    return info;
}

/** Pixels to reserve at the bottom (footer bar, taskbar overlap, safe area). */
function getMascotBottomInset() {
    const vv = window.visualViewport;
    const vTop = vv?.offsetTop ?? 0;
    const vHeight = vv?.height ?? window.innerHeight;
    const vBottom = Math.min(vTop + vHeight, window.innerHeight);

    let inset = 12;

    const selectors = [
        '#tm-footer-controls-container',
        '#footer-outterwrap',
        '#footer-outter',
        '#tm-xp-bar-container',
    ];
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.height <= 0 || r.width <= 0) continue;
        if (r.bottom <= vTop || r.top >= vBottom) continue;
        const lowerBandTop = vBottom - Math.min(180, vHeight * 0.28);
        if (r.bottom > lowerBandTop) {
            inset = Math.max(inset, vBottom - r.top + MASCOT_EDGE_PAD);
        }
    }
    return Math.min(inset, Math.floor(vHeight * 0.4));
}

/** Visible browser viewport clipped to the monitor's available screen area. */
function getMascotViewportRect() {
    const screen = window.__tmMascotScreen || cacheMascotScreenInfo();
    const vv = window.visualViewport;
    const availW = screen.availWidth ?? window.innerWidth;
    const availH = screen.availHeight ?? window.innerHeight;

    let left = vv?.offsetLeft ?? 0;
    let top = vv?.offsetTop ?? 0;
    let width = vv?.width ?? document.documentElement.clientWidth ?? window.innerWidth;
    let height = vv?.height ?? document.documentElement.clientHeight ?? window.innerHeight;

    if (left < 0) { width += left; left = 0; }
    if (top < 0) { height += top; top = 0; }
    if (left + width > availW) width = Math.max(0, availW - left);
    if (top + height > availH) height = Math.max(0, availH - top);

    const bottomInset = getMascotBottomInset();
    const rawBottom = top + height;
    const visibleBottom = Math.min(rawBottom, window.innerHeight, top + availH) - bottomInset;
    const visibleHeight = Math.max(0, visibleBottom - top);

    return {
        left,
        top,
        width,
        height: visibleHeight,
        right: left + width,
        bottom: visibleBottom,
        bottomInset,
        screenWidth: screen.screenWidth,
        screenHeight: screen.screenHeight,
    };
}

/** How far painted content (bubble, hats, flames) extends beyond the 100×100 box. */
function getMascotPaintOverflow(container = document.getElementById('tm-mascot-container')) {
    if (!container) return { ...MASCOT_OVERFLOW_SLACK };

    const { x, y } = getMascotTranslate(container);
    const w = container.offsetWidth || 100;
    const h = container.offsetHeight || 100;
    let rect;
    try {
        rect = container.getBoundingClientRect();
    } catch {
        return { ...MASCOT_OVERFLOW_SLACK };
    }

    return {
        left: Math.max(MASCOT_OVERFLOW_SLACK.left, x - rect.left),
        top: Math.max(MASCOT_OVERFLOW_SLACK.top, y - rect.top),
        right: Math.max(MASCOT_OVERFLOW_SLACK.right, rect.right - (x + w)),
        bottom: Math.max(MASCOT_OVERFLOW_SLACK.bottom, rect.bottom - (y + h)),
    };
}

/** Painted bounds relative to the container translate origin (stable for path keyframes). */
function getMascotBoundsOffset(container = document.getElementById('tm-mascot-container')) {
    return getMascotPaintOverflow(container);
}

function getMascotRoamingMetrics(container = document.getElementById('tm-mascot-container')) {
    const vp = getMascotViewportRect();
    const width = Math.max(container?.offsetWidth || 0, 100);
    const height = Math.max(container?.offsetHeight || 0, 100);
    const overflow = getMascotBoundsOffset(container);
    const pad = MASCOT_EDGE_PAD;

    const minX = vp.left + pad + overflow.left;
    const minY = vp.top + pad + overflow.top;
    const maxX = vp.right - pad - width - overflow.right;
    const maxY = vp.bottom - pad - height - overflow.bottom;
    const centerX = vp.left + Math.max(0, (vp.width - width) / 2);
    const centerY = vp.top + Math.max(0, (vp.height - height) / 2);

    return {
        width,
        height,
        minX: Math.min(minX, maxX, centerX),
        minY: Math.min(minY, maxY, centerY),
        maxX: Math.max(minX, maxX, centerX),
        maxY: Math.max(minY, maxY, centerY),
        viewport: vp,
    };
}

function getMascotTranslate(container = document.getElementById('tm-mascot-container')) {
    if (!container) return { x: 0, y: 0 };
    const matrix = new DOMMatrix(window.getComputedStyle(container).transform);
    return { x: matrix.m41, y: matrix.m42 };
}

function clampMascotPosition(x, y, metrics = getMascotRoamingMetrics()) {
    return {
        x: Math.min(metrics.maxX, Math.max(metrics.minX, x)),
        y: Math.min(metrics.maxY, Math.max(metrics.minY, y)),
    };
}

/** Clamps using the full painted bounds (mascot + bubble + accessories) against the live viewport. */
function clampMascotPositionToViewport(x, y, container = document.getElementById('tm-mascot-container'), offsets = null) {
    if (!container) return { x, y };

    const vp = getMascotViewportRect();
    const pad = MASCOT_EDGE_PAD;
    const off = offsets || getMascotBoundsOffset(container);
    const width = container.offsetWidth || 100;
    const height = container.offsetHeight || 100;

    const minX = vp.left + pad + off.left;
    const minY = vp.top + pad + off.top;
    const maxX = vp.right - pad - off.right - width;
    const maxY = vp.bottom - pad - off.bottom - height;

    return {
        x: Math.min(Math.max(minX, x), maxX),
        y: Math.min(Math.max(minY, y), maxY),
    };
}

function applyMascotPosition(container, x, y) {
    if (!container) return { x, y };
    let clamped = clampMascotPositionToViewport(x, y, container);
    clamped = clampMascotPositionToViewport(clamped.x, clamped.y, container);
    container.style.transform = `translate(${clamped.x}px, ${clamped.y}px)`;
    return clamped;
}

function ensureMascotInBounds(container = document.getElementById('tm-mascot-container')) {
    if (!container) return;
    const { x, y } = getMascotTranslate(container);
    applyMascotPosition(container, x, y);
}

function randomMascotPosition(container = document.getElementById('tm-mascot-container'), metrics = getMascotRoamingMetrics(container)) {
    const spanX = Math.max(0, metrics.maxX - metrics.minX);
    const spanY = Math.max(0, metrics.maxY - metrics.minY);
    const rough = clampMascotPosition(
        metrics.minX + Math.random() * spanX,
        metrics.minY + Math.random() * spanY,
        metrics
    );
    return clampMascotPositionToViewport(rough.x, rough.y, container);
}

function sampleClampedBezierPath(from, control, to, container, steps = 8) {
    const offsets = getMascotBoundsOffset(container);
    const keyframes = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const inv = 1 - t;
        const x = inv * inv * from.x + 2 * inv * t * control.x + t * t * to.x;
        const y = inv * inv * from.y + 2 * inv * t * control.y + t * t * to.y;
        const point = clampMascotPositionToViewport(x, y, container, offsets);
        keyframes.push({ transform: `translate(${point.x}px, ${point.y}px)` });
    }
    return keyframes;
}

function resolveMascotConfig(config) {
    return config || roamingConfig || (typeof window !== 'undefined' ? window.config : null) || {};
}

function isMascotInteractiveEnabled(config) {
    return resolveMascotConfig(config).interactiveMascotEnabled !== false;
}

function getMascotBehaviorState(mascotContainer = document.getElementById('tm-mascot-container')) {
    if (!mascotContainer) return '';
    return [...mascotContainer.classList]
        .find((cls) => cls.startsWith('mascot-')
            && !MASCOT_MODIFIER_CLASSES.includes(cls)
            && !MASCOT_INTERACTION_CLASSES.includes(cls)
            && !cls.startsWith('mascot-mood-')
            && !cls.startsWith('mascot-char-'))
        ?.replace('mascot-', '') || '';
}

function canMascotRoamingMove(state = getMascotBehaviorState()) {
    return ROAMING_MOVE_STATES.includes(state);
}

function shouldMascotBeRoaming(config) {
    if (!isMascotInteractiveEnabled(config)) return false;
    if (tamagotchiIsDead || tamaCinematicLock) return false;
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) return false;
    if (mascotPositionLocked || mascotIsDragging) return false;
    if (isMascotFocusQuiet()) return false;
    if (typeof mascotChaseEnabled !== 'undefined' && mascotChaseEnabled) return false;
    if (typeof mascotHideSeekActive !== 'undefined' && mascotHideSeekActive) return false;
    const panel = document.getElementById('tm-mascot-interaction-panel');
    if (panel && panel.style.display === 'flex') return false;
    return ROAMING_ACTIVE_STATES.includes(getMascotBehaviorState());
}

function clearRoamingMoveTimeout() {
    if (roamingTimeout) {
        clearTimeout(roamingTimeout);
        roamingTimeout = null;
    }
}

function scheduleRoamingMove(delayMs = 1500) {
    if (!isRoaming || roamingTimeout) return;
    roamingTimeout = setTimeout(() => {
        roamingTimeout = null;
        moveToNewPosition();
    }, delayMs);
}

function schedulePlayfulAction() {
    if (!isRoaming) return;
    if (playfulTimeout) clearTimeout(playfulTimeout);
    const randomDelay = 30000 + Math.random() * 30000;
    playfulTimeout = setTimeout(() => {
        if (!isRoaming || !canMascotRoamingMove()) {
            schedulePlayfulAction();
            return;
        }
        const actions = ['reading', 'biking', 'juggling', 'happy', 'energized'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        setMascotState(resolveMascotConfig(roamingConfig), randomAction, 10000);
    }, randomDelay);
}

async function moveToNewPosition() {
    const config = roamingConfig || window.config || {};
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer || !isRoaming) return;

    if (!canMascotRoamingMove(getMascotBehaviorState(mascotContainer))) {
        scheduleRoamingMove(1000);
        return;
    }

    if (!tamagotchiLightsOn || tamagotchiIsSleeping) {
        stopRoaming(config);
        return;
    }

    const body = mascotContainer.querySelector('.tm-animate-body') || mascotContainer.querySelector('.tm-mascot-flipper');
    const flipper = mascotContainer.querySelector('.tm-mascot-flipper');

    const transformMatrix = new DOMMatrix(window.getComputedStyle(mascotContainer).transform);
    const [currentX, currentY] = [transformMatrix.m41, transformMatrix.m42];

    const metrics = getMascotRoamingMetrics(mascotContainer);
    const current = clampMascotPositionToViewport(currentX, currentY, mascotContainer);
    if (current.x !== currentX || current.y !== currentY) {
        mascotContainer.style.transform = `translate(${current.x}px, ${current.y}px)`;
    }
    const target = randomMascotPosition(mascotContainer, metrics);
    const newX = target.x;
    const newY = target.y;

    if (flipper) {
        flipper.style.transition = 'transform 0.3s ease-out';
        flipper.style.transform = (newX < current.x) ? 'scaleX(-1)' : 'scaleX(1)';
    }

    const tilt = Math.max(-10, Math.min(10, (newX - current.x) * 0.03));
    if (body) {
        body.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
        body.style.transform = `rotate(${tilt}deg)`;
    }

    const speed = (config && config.mascotRoamingSpeed) || 100;
    const distance = Math.sqrt(Math.pow(newX - current.x, 2) + Math.pow(newY - current.y, 2));
    const duration = Math.max(2, distance / speed);

    const midX = (current.x + newX) / 2;
    const midY = (current.y + newY) / 2;
    const dx = newX - current.x;
    const dy = newY - current.y;
    const bulge = (Math.random() - 0.5) * 0.15;
    const roughControl = clampMascotPosition(midX - dy * bulge, midY + dx * bulge, metrics);
    const control = clampMascotPositionToViewport(roughControl.x, roughControl.y, mascotContainer);
    const end = clampMascotPositionToViewport(newX, newY, mascotContainer);

    const keyframes = sampleClampedBezierPath(current, control, end, mascotContainer);

    const animation = mascotContainer.animate(keyframes, {
        duration: duration * 1000,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        fill: 'forwards',
        composite: 'replace'
    });

    try {
        await animation.finished;
        requestAnimationFrame(() => {
            applyMascotPosition(mascotContainer, end.x, end.y);
            ensureMascotInBounds(mascotContainer);
        });
    } catch (error) {
        scheduleRoamingMove(800);
        return;
    }

    if (!isRoaming) return;

    if (body) {
        await new Promise(resolve => setTimeout(resolve, 150));
        body.style.transform = 'rotate(0deg)';
    }

    if (!isRoaming) return;

    if (Math.random() < 0.25) {
        const statusMenu = document.querySelector('.rnr-b-vmenu.simple.main, .rnr-b-vmenu');
        const parsed = statusMenu ? parseRepairStatusMenu(statusMenu) : null;
        if (parsed?.totalRepairs > 0) {
            showMascotBubble(mascotRepairOpinion(parsed.statusIdMap, parsed.totalRepairs), 2500);
            setMascotMood(petStats.hunger < 35 ? 'hungry' : 'curious', 7000);
        } else {
            notifyMascotWorkEvent('idle', roamingConfig || window.config);
        }
    }

    schedulePlayfulAction();
    scheduleRoamingMove(2000 + Math.random() * 3000);
}

function ensureRoamingWatchdog(config) {
    if (roamingWatchdogInterval) return;
    roamingWatchdogInterval = setInterval(() => {
        if (!shouldMascotBeRoaming(config)) {
            if (isRoaming) stopRoaming(config);
            return;
        }
        if (!isRoaming) {
            startRoaming(config);
            return;
        }
        if (canMascotRoamingMove() && !roamingTimeout) {
            scheduleRoamingMove(300);
        }
        ensureMascotInBounds();
    }, 2000);
}

function startRoaming(config) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer) return;
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) return;

    roamingConfig = config;

    if (isRoaming) {
        if (canMascotRoamingMove() && !roamingTimeout) {
            scheduleRoamingMove(300);
        }
        return;
    }

    isRoaming = true;
    startPhysicsAnimation();

    if (!mascotContainer.style.transform) {
        const metrics = getMascotRoamingMetrics(mascotContainer);
        const start = randomMascotPosition(mascotContainer, metrics);
        mascotContainer.style.transform = `translate(${start.x}px, ${start.y}px)`;
    } else {
        ensureMascotInBounds(mascotContainer);
    }

    schedulePlayfulAction();
    ensureRoamingWatchdog(config);
    moveToNewPosition();
}

function showMascotBubble(text, duration = 2000) {
    if (isMascotFocusQuiet()) return;
    const bubble = document.getElementById('tm-mascot-speech-bubble');
    if (!bubble) return;

    const messages = MASCOT_MESSAGES.defaultBubble;
    // If no text is provided, pick a random one.
    let messageToShow = text || messages[Math.floor(Math.random() * messages.length)];
    if (typeof formatMascotBubbleText === 'function') {
        messageToShow = formatMascotBubbleText(messageToShow);
    }

    bubble.textContent = messageToShow;
    bubble.style.display = 'block';
    // Use a timeout to allow the display property to apply before adding the class for transition
    setTimeout(() => {
        bubble.classList.add('show');
    }, 10);

    // Hide it after the duration
    setTimeout(() => {
        bubble.classList.remove('show');
        // Set display to none after the transition ends
        setTimeout(() => { bubble.style.display = 'none'; }, 300);
    }, duration);
}

function triggerDodgeAnimation(config, moveX, moveY) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer || mascotContainer.classList.contains('mascot-dodging')) {
        return; // Don't dodge if already dodging
    }
    if (mascotIsDragging || mascotPositionLocked || isMascotFocusQuiet()) return;

    // Stop roaming and set the dodging state. `setMascotState` will call `stopRoaming(config)`.
    setMascotState(config, 'dodging', 1000); // State lasts for 1s
    showMascotBubble(null, 1000); // Show a random bubble for 1s

    // The dodge movement logic
    // The dodge direction should be opposite to the mouse movement
    const dodgeDistance = 75; // Make the dodge shorter
    const magnitude = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
    const dodgeX = -(moveX / magnitude) * dodgeDistance;
    const dodgeY = -(moveY / magnitude) * dodgeDistance;

    // Apply an immediate, short-lived transform
    const currentTransform = new DOMMatrix(window.getComputedStyle(mascotContainer).transform);
    const dodged = clampMascotPositionToViewport(
        currentTransform.m41 + dodgeX,
        currentTransform.m42 + dodgeY,
        mascotContainer,
    );

    mascotContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'; // Use CSS transition for this short, sharp movement
    mascotContainer.style.transform = `translate(${dodged.x}px, ${dodged.y}px)`;

    // The state will automatically revert via the timeout in setMascotState.
    // When it reverts, it will call updatePetStateByStats(), which can restart roaming if appropriate.
    setTimeout(() => {
        mascotContainer.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)'; // Restore default transition
    }, 400); // Match the dodge transition duration
}

function applyMascotBehaviorState(mascotContainer, state) {
    if (!mascotContainer || !state) return;
    const preserve = new Set(['tm-mascot-container', ...MASCOT_MODIFIER_CLASSES, ...MASCOT_INTERACTION_CLASSES]);
    [...mascotContainer.classList].forEach((cls) => {
        if (cls.startsWith('mascot-') && !preserve.has(cls) && !cls.startsWith('mascot-mood-')) {
            mascotContainer.classList.remove(cls);
        }
    });
    mascotContainer.classList.add(`mascot-${state}`);
    if (mascotMood && mascotMood !== 'calm') {
        mascotContainer.classList.add(`mascot-mood-${mascotMood}`);
    }
}

function setMascotState(config, state, duration = 0) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer) return;
    if (!config) config = {};

    if (tamagotchiIsDead && state !== 'dead' && state !== 'powersave') return;
    if (tamaCinematicLock && !['dead', 'powersave'].includes(state)) return;

    // CRITICAL: If lights are off (sleeping), only allow powersave state
    if ((!tamagotchiLightsOn || tamagotchiIsSleeping) && state !== 'powersave') {
        if (!mascotContainer.classList.contains('mascot-powersave')) {
            applyMascotBehaviorState(mascotContainer, 'powersave');
        }
        return;
    }

    // Clear any previous temporary state timeout
    if (mascotStateTimeout) {
        clearTimeout(mascotStateTimeout);
        mascotStateTimeout = null;
    }

    const previousState = [...mascotContainer.classList].find((cls) => cls.startsWith('mascot-') && !MASCOT_MODIFIER_CLASSES.includes(cls))?.replace('mascot-', '') || '';

    applyMascotBehaviorState(mascotContainer, state);
    syncStateAccessoryLayout(state, previousState);
    
    // Reset robot element transform when exiting juggling state to prevent shaking
    if (previousState === 'juggling' && state !== 'juggling') {
        const robot = mascotContainer.querySelector('.tm-mascot-robot');
        if (robot) {
            robot.style.animation = 'none';
            robot.style.transform = '';
            // Force reflow to apply the reset
            void robot.offsetWidth;
        }
    }

    // If a duration is set, revert to the correct base state after the time is up
    if (duration > 0) {
        mascotStateTimeout = setTimeout(() => {
            mascotStateTimeout = null;
            if (typeof window.STORAGE_KEYS !== 'undefined') {
                updatePetStateByStats(config, window.STORAGE_KEYS, true);
            }
        }, duration);
    }

    // Handle roaming based on the new state, AFTER the class has been set.
    if (shouldMascotBeRoaming(config)) {
        if (!isRoaming) {
            if (previousState === 'juggling' && state !== 'juggling') {
                setTimeout(() => startRoaming(config), 300);
            } else {
                startRoaming(config);
            }
        } else if (canMascotRoamingMove(state) && !roamingTimeout) {
            scheduleRoamingMove(state === 'idle' && previousState !== 'idle' ? 300 : 1500);
        }
    } else if (isRoaming) {
        stopRoaming(config);
    }
}

// Track last time a low-stat message was shown (cooldown mechanism)
let lastLowStatMessageTime = 0;

function updatePetStateByStats(config, STORAGE_KEYS, isExitingTempState = false) {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!config) config = {};

    if (tamagotchiIsDead || tamaCinematicLock) return;

    // Focus quiet: stay parked & quiet; keep a calm reading pose
    if (isMascotFocusQuiet()) {
        if (mascotContainer && !mascotContainer.classList.contains('mascot-reading')
            && !mascotContainer.classList.contains('mascot-powersave')) {
            applyMascotBehaviorState(mascotContainer, 'reading');
        }
        return;
    }

    // Don't override a timed preview/action state (e.g. happy, juggling, surprised).
    if (!isExitingTempState && mascotStateTimeout) {
        return;
    }
    
    // Don't change state if the interaction panel is open (user is interacting)
    const interactionPanel = document.getElementById('tm-mascot-interaction-panel');
    if (interactionPanel && interactionPanel.style.display === 'flex') {
        console.log('[MMS Mascot] Interaction panel open, not updating state.');
        return;
    }
    
    // CRITICAL: If lights are off (sleeping), keep mascot in powersave state
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) {
        if (mascotContainer && !mascotContainer.classList.contains('mascot-powersave')) {
            setMascotState(config, 'powersave');
        }
        return; // Don't update state further when sleeping
    }
    
    // Check if mascot has equipped accessories that should persist their animation states
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    
    // This function is called periodically AND at the end of temporary states (like 'dodging').
    // We only want to interrupt a temporary state if we are explicitly being told to do so by its timeout finishing. Also, don't interrupt the energized state.
    const temporaryStates = [
        'mascot-happy', 'mascot-sad', 'mascot-eating', 'mascot-dodging', 'mascot-thinking',
        'mascot-glitching', 'mascot-eureka', 'mascot-sunny', 'mascot-rainy', 'mascot-energized',
        'mascot-reading', 'mascot-biking', 'mascot-juggling', 'mascot-searching', 'mascot-surprised',
        'mascot-spin', 'mascot-bow', 'mascot-firebreath'
    ];
    const persistentAccessoryStates = [];
    
    if (!isExitingTempState && mascotContainer) {
        // Don't override temporary states
        if (temporaryStates.some(c => mascotContainer.classList.contains(c))) {
            return;
        }
        // Don't override persistent accessory states UNLESS stats are critically low
        if (persistentAccessoryStates.some(c => mascotContainer.classList.contains(c)) && petStats.hunger >= 30 && petStats.happiness >= 30) {
            return;
        }
        // Don't override powersave state (sleeping)
        if (mascotContainer.classList.contains('mascot-powersave')) {
            return;
        }
    }

    // Don't change state if sleeping (double-check before any state changes)
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) {
        return;
    }

    if (petStats.hunger < 30 || petStats.happiness < 30) {
        setMascotState(config, 'sad');
        // Show occasional reminder about low stats with cooldown
        const now = Date.now();
        const cooldownPeriod = 45000; // 45 seconds cooldown between messages
        
        if (now - lastLowStatMessageTime > cooldownPeriod && Math.random() < 0.3) {
            const lowStatMessages = MASCOT_MESSAGES.lowStats;
            showMascotBubble(lowStatMessages[Math.floor(Math.random() * lowStatMessages.length)], 2500);
            lastLowStatMessageTime = now; // Update the timestamp
        }
    } else {
        // When stats are good, default to idle
        setMascotState(config, 'idle');
    }
}

function loadPetStats(config, STORAGE_KEYS) {
    const savedStats = JSON.parse(GM_getValue(STORAGE_KEYS.PET_STATS, 'null'));
    if (savedStats) {
        petStats = savedStats;
    }
    // Apply decay only for office-hours while inactive (nights/weekends off-clock don't count)
    const officeHoursAway = getOfficeMinutesBetween(petStats.lastUpdate || Date.now(), Date.now()) / 60;
    const decayAmount = Math.floor(officeHoursAway * 5); // Decay 5 points per office hour
    if (decayAmount > 0) {
        console.log(`[MMS Pet] Applying ${decayAmount} decay for ${officeHoursAway.toFixed(1)} office-hours away.`);
        petStats.happiness = Math.max(0, petStats.happiness - decayAmount);
        petStats.hunger = Math.max(0, petStats.hunger - decayAmount);
    }
    updatePetStats(config, STORAGE_KEYS, 0, 0); // This will save the potentially decayed stats
}

function updatePetStats(config, STORAGE_KEYS, happinessChange, hungerChange) {
    petStats.happiness = Math.max(0, Math.min(100, petStats.happiness + happinessChange));
    petStats.hunger = Math.max(0, Math.min(100, petStats.hunger + hungerChange));
    petStats.lastUpdate = Date.now();

    GM_setValue(STORAGE_KEYS.PET_STATS, JSON.stringify(petStats));
    updatePetInteractionPanel();
    updateTamagotchiStats(document.getElementById('tm-mascot-container'));
    updatePetStateByStats(config, STORAGE_KEYS);
}

function updatePetInteractionPanel() {
    const happinessFill = document.getElementById('tm-pet-happiness-fill');
    const hungerFill = document.getElementById('tm-pet-hunger-fill');
    const healthFill = document.getElementById('tm-pet-health-fill');
    const disciplineFill = document.getElementById('tm-pet-discipline-fill');
    if (!happinessFill || !hungerFill) return;

    happinessFill.style.width = `${petStats.happiness}%`;
    hungerFill.style.width = `${petStats.hunger}%`;
    if (healthFill) healthFill.style.width = `${petStats.health || 100}%`;
    if (disciplineFill) disciplineFill.style.width = `${Math.min(100, petStats.discipline || 0)}%`;
}

// ===================================================================
// === TAMAGOTCHI SYSTEM ===
// ===================================================================

function loadTamagotchiData(STORAGE_KEYS) {
    const keys = getTamagotchiStorageKeys(STORAGE_KEYS);
    const savedData = parseTamagotchiStorageValue(GM_getValue(keys.TAMAGOTCHI_DATA, 'null'));
    if (savedData) {
        tamagotchiAge = savedData.age || 0;
        tamagotchiStage = savedData.stage || 'egg';
        const loadedChar = savedData.characterType;
        tamagotchiCharacterType = (loadedChar && loadedChar !== 'none' && TAMA_CHARACTER_TYPES.includes(loadedChar))
            ? loadedChar
            : 'none';
        if (loadedChar && loadedChar !== 'none' && !TAMA_CHARACTER_TYPES.includes(loadedChar)) {
            console.warn('[Mascot] Unknown characterType in storage:', loadedChar);
        }
        tamagotchiLifeMinutes = resolveLifeMinutesFromSave(savedData);
        tamagotchiEggGeneration = Number(savedData.eggGeneration) || 0;
        tamagotchiHealth = savedData.health || 100;
        tamagotchiDiscipline = savedData.discipline || 0;
        tamagotchiLightsOn = savedData.lightsOn !== false;
        const loadedUpdate = Number(savedData.lastUpdate);
        tamagotchiLastUpdate = Number.isFinite(loadedUpdate) ? loadedUpdate : Date.now();
        // Enhanced variables
        tamagotchiWeight = savedData.weight || 30;
        tamagotchiPoopCount = savedData.poopCount || 0;
        tamagotchiIsSick = savedData.isSick || false;
        tamagotchiSickType = savedData.sickType || 'none';
        tamagotchiCareMistakes = savedData.careMistakes || 0;
        tamagotchiPersonality = savedData.personality || 'normal';
        tamagotchiBirthday = savedData.birthday || Date.now();
        tamagotchiLastFed = savedData.lastFed || Date.now();
        tamagotchiLastPlayed = savedData.lastPlayed || Date.now();
        tamagotchiLastCleaned = savedData.lastCleaned || Date.now();
        tamagotchiToiletTrained = savedData.toiletTrained || false;
        tamagotchiMealCount = savedData.mealCount || 0;
        tamagotchiSnackCount = savedData.snackCount || 0;
        tamagotchiIsDead = savedData.isDead || false;
        tamagotchiReviveCount = savedData.reviveCount || 0;
        tamagotchiKilledByUserCount = Math.max(0, Number(savedData.killedByUserCount) || 0);
        tamagotchiNaturalDeathCount = Math.max(0, Number(savedData.naturalDeathCount) || 0);
        tamagotchiLastPoopTime = savedData.lastPoopTime || 0;
        tamagotchiSleepStartTime = savedData.sleepStartTime || 0;
        tamagotchiSleepEndTime = savedData.sleepEndTime || 0;
        tamagotchiIsSleeping = savedData.isSleeping || false;
        tamagotchiLightsManualOverride = savedData.lightsManualOverride || false;
        tamagotchiLastPraise = savedData.lastPraise || 0;
        tamagotchiLastScold = savedData.lastScold || 0;
        mascotPositionLocked = !!savedData.parked;
        mascotParkedX = Number.isFinite(Number(savedData.parkedX)) ? Number(savedData.parkedX) : null;
        mascotParkedY = Number.isFinite(Number(savedData.parkedY)) ? Number(savedData.parkedY) : null;
        mascotFocusQuietUntil = Number(savedData.focusQuietUntil) || 0;
        if (mascotFocusQuietUntil && mascotFocusQuietUntil <= Date.now()) {
            mascotFocusQuietUntil = 0;
        }
        tamagotchiNickname = typeof normalizeMascotNickname === 'function'
            ? normalizeMascotNickname(savedData.nickname || '')
            : String(savedData.nickname || '').trim().slice(0, 16);
        if (savedData.taughtTricks && typeof savedData.taughtTricks === 'object') {
            tamagotchiTaughtTricks = {
                unlocked: Array.isArray(savedData.taughtTricks.unlocked) ? savedData.taughtTricks.unlocked.slice() : [],
                practice: { ...(savedData.taughtTricks.practice || {}) },
            };
        } else {
            tamagotchiTaughtTricks = { unlocked: [], practice: {} };
        }
        validateTamagotchiState();
        // Recover sticky character after validate if storage had one and we're hatched
        if (tamagotchiStage !== 'egg' && loadedChar && loadedChar !== 'none'
            && TAMA_CHARACTER_TYPES.includes(loadedChar)) {
            tamagotchiCharacterType = loadedChar;
        }
        tamagotchiEggHatchCinematicDone = tamagotchiStage !== 'egg';
    }
    tamagotchiDataLoaded = true;
}

function saveTamagotchiData(STORAGE_KEYS) {
    const keys = getTamagotchiStorageKeys(STORAGE_KEYS);
    if (!keys?.TAMAGOTCHI_DATA) return;

    syncTamagotchiAgeFromLife();
    tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);

    // Multi-tab guard: never let a stale tab wipe a more progressed pet / character
    let stored = null;
    try {
        stored = parseTamagotchiStorageValue(GM_getValue(keys.TAMAGOTCHI_DATA, 'null'));
    } catch { /* ignore */ }

    if (stored) {
        const storedGen = Number(stored.eggGeneration) || 0;
        const ourGen = Number(tamagotchiEggGeneration) || 0;

        if (storedGen > ourGen) {
            // Another tab intentionally reset — adopt that state instead of overwriting
            loadTamagotchiData(keys);
            return;
        }

        if (storedGen === ourGen) {
            const storedLife = Number(stored.lifeMinutes);
            if (Number.isFinite(storedLife) && storedLife > tamagotchiLifeMinutes) {
                tamagotchiLifeMinutes = storedLife;
                tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
            }

            // Lifetime death tallies: keep the higher count across tabs
            tamagotchiKilledByUserCount = Math.max(
                tamagotchiKilledByUserCount,
                Math.max(0, Number(stored.killedByUserCount) || 0),
            );
            tamagotchiNaturalDeathCount = Math.max(
                tamagotchiNaturalDeathCount,
                Math.max(0, Number(stored.naturalDeathCount) || 0),
            );

            const storedChar = stored.characterType;
            const storedCharOk = storedChar && storedChar !== 'none' && TAMA_CHARACTER_TYPES.includes(storedChar);

            // Sticky character: never replace a real stored character with none while hatched
            if (tamagotchiLifeMinutes >= TAMA_STAGE_MINUTES.baby) {
                if (storedCharOk && (!tamagotchiCharacterType || tamagotchiCharacterType === 'none')) {
                    tamagotchiCharacterType = storedChar;
                }
                // Also refuse to clobber a different in-memory character with none — keep memory if valid
                if (!tamagotchiCharacterType || tamagotchiCharacterType === 'none') {
                    if (storedCharOk) tamagotchiCharacterType = storedChar;
                }
            }
        }
        // ourGen > storedGen → intentional reset in this tab; write egg state through
    }

    if (tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.baby) {
        tamagotchiStage = 'egg';
        tamagotchiCharacterType = 'none';
    } else {
        tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
        // Still missing after merge — assign once so refresh stays stable
        if (!tamagotchiCharacterType || tamagotchiCharacterType === 'none'
            || !TAMA_CHARACTER_TYPES.includes(tamagotchiCharacterType)) {
            ensureTamagotchiCharacterType({ allowRandom: true });
        }
    }

    const data = {
        age: tamagotchiAge,
        lifeMinutes: tamagotchiLifeMinutes,
        eggGeneration: tamagotchiEggGeneration,
        stage: tamagotchiStage,
        characterType: tamagotchiCharacterType,
        health: tamagotchiHealth,
        discipline: tamagotchiDiscipline,
        lightsOn: tamagotchiLightsOn,
        lastUpdate: tamagotchiLastUpdate,
        // Enhanced data
        weight: tamagotchiWeight,
        poopCount: tamagotchiPoopCount,
        isSick: tamagotchiIsSick,
        sickType: tamagotchiSickType,
        careMistakes: tamagotchiCareMistakes,
        personality: tamagotchiPersonality,
        birthday: tamagotchiBirthday,
        lastFed: tamagotchiLastFed,
        lastPlayed: tamagotchiLastPlayed,
        lastCleaned: tamagotchiLastCleaned,
        toiletTrained: tamagotchiToiletTrained,
        mealCount: tamagotchiMealCount,
        snackCount: tamagotchiSnackCount,
        isDead: tamagotchiIsDead,
        reviveCount: tamagotchiReviveCount,
        killedByUserCount: tamagotchiKilledByUserCount,
        naturalDeathCount: tamagotchiNaturalDeathCount,
        lastPoopTime: tamagotchiLastPoopTime,
        sleepStartTime: tamagotchiSleepStartTime,
        sleepEndTime: tamagotchiSleepEndTime,
        isSleeping: tamagotchiIsSleeping,
        lightsManualOverride: tamagotchiLightsManualOverride,
        lastPraise: tamagotchiLastPraise,
        lastScold: tamagotchiLastScold,
        parked: !!mascotPositionLocked,
        parkedX: mascotPositionLocked ? mascotParkedX : null,
        parkedY: mascotPositionLocked ? mascotParkedY : null,
        focusQuietUntil: isMascotFocusQuiet() ? mascotFocusQuietUntil : 0,
        nickname: tamagotchiNickname || '',
        taughtTricks: {
            unlocked: Array.isArray(tamagotchiTaughtTricks?.unlocked) ? tamagotchiTaughtTricks.unlocked.slice() : [],
            practice: { ...(tamagotchiTaughtTricks?.practice || {}) },
        },
    };
    GM_setValue(keys.TAMAGOTCHI_DATA, JSON.stringify(data));
}

function initTamagotchiSystem(config, STORAGE_KEYS, container) {
    validateTamagotchiState();
    updateMascotAppearanceByStage(tamagotchiStage);
    updateWeightDisplay();
    updatePoopIndicator();
    updateSickIndicator();
    updateToiletNeedIndicator();
    
    // Update death options button visibility
    updateDeathOptionsButton();
    
    // Check if mascot is already dead and show death screen
    if (tamagotchiIsDead) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            showTamagotchiDeathScreen(STORAGE_KEYS, true);
        }, 500);
    }
    
    // Update display initially
    updateTamagotchiStats(container);
    checkTamagotchiEvolution(container);
    
    // Periodic updates every minute (single interval — avoid duplicate timers on re-init)
    if (tamagotchiTickIntervalId) {
        clearInterval(tamagotchiTickIntervalId);
        tamagotchiTickIntervalId = null;
    }
    tamagotchiTickIntervalId = setInterval(() => {
        updateTamagotchiStats(container);
        checkTamagotchiEvolution(container);
        saveTamagotchiData(STORAGE_KEYS);
    }, 60000);

    if (!window.__tmTamagotchiFocusSyncBound) {
        window.__tmTamagotchiFocusSyncBound = true;
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            const keys = typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : STORAGE_KEYS;
            if (!keys?.TAMAGOTCHI_DATA) return;
            const prevStage = tamagotchiStage;
            const prevLife = tamagotchiLifeMinutes;
            loadTamagotchiData(keys);
            if (tamagotchiStage !== prevStage || Math.abs(tamagotchiLifeMinutes - prevLife) > 0.01) {
                const el = document.getElementById('tm-mascot-container');
                updateMascotAppearanceByStage(tamagotchiStage);
                if (el) updateTamagotchiStats(el);
            }
        });
    }
}

function updateTamagotchiStats(container) {
    // Container parameter kept for backward compatibility but not required
    if (!tamagotchiDataLoaded) return;
    
    const now = Date.now();
    // Only office-hour minutes count — overnight / after-hours leave-on is frozen
    const timeDiff = getOfficeMinutesBetween(tamagotchiLastUpdate || now, now);
    
    // Sleep schedule always follows wall clock (even when life is frozen)
    if (typeof window !== 'undefined' && typeof window.config !== 'undefined' && window.config) {
        updateTamagotchiSleepSchedule(window.config);
    }
    
    // Update stats based on office time only
    if (timeDiff > 0 && !tamagotchiIsDead) {
        // Hunger decreases over time (unless sleeping)
        if (!tamagotchiIsSleeping) {
            petStats.hunger = Math.max(0, petStats.hunger - (timeDiff * 0.5));
        }
        
        // Happiness decreases if hungry, unhealthy, or has poops
        if (petStats.hunger < 30 || tamagotchiHealth < 30 || tamagotchiPoopCount > 0) {
            petStats.happiness = Math.max(0, petStats.happiness - (timeDiff * 0.3));
        }
        
        // Health decreases if very hungry, sick, or overweight
        if (petStats.hunger < 10) {
            tamagotchiHealth = Math.max(0, tamagotchiHealth - (timeDiff * 0.2));
        }
        if (tamagotchiIsSick) {
            tamagotchiHealth = Math.max(0, tamagotchiHealth - (timeDiff * 0.3));
        }
        if (tamagotchiWeight > 80) {
            tamagotchiHealth = Math.max(0, tamagotchiHealth - (timeDiff * 0.1));
        }
        
        // Age/life increases only during office hours
        tamagotchiLifeMinutes += timeDiff;
        syncTamagotchiAgeFromLife();
        
        // Generate poops periodically (not for egg or baby stage)
        if (!tamagotchiIsSleeping && tamagotchiStage !== 'egg' && tamagotchiStage !== 'baby') {
            generateTamagotchiPoop();
        }
        
        // Update toilet need indicator
        updateToiletNeedIndicator();
        
        // Slowly decrease discipline if not maintained
        if (tamagotchiDiscipline > 0) {
            tamagotchiDiscipline = Math.max(0, tamagotchiDiscipline - (timeDiff * 0.05));
        }
    }
    
    // Always advance lastUpdate so off-hours gaps aren't re-counted later
    if (now !== tamagotchiLastUpdate) {
        tamagotchiLastUpdate = now;
    }
    
    // Update stat bars
    const healthFill = document.getElementById('tm-pet-health-fill');
    const disciplineFill = document.getElementById('tm-pet-discipline-fill');
    const ageDisplay = document.getElementById('tm-tamagotchi-age-display');
    const stageDisplay = document.getElementById('tm-tamagotchi-stage-display');
    
    if (healthFill) healthFill.style.width = `${tamagotchiHealth}%`;
    if (disciplineFill) disciplineFill.style.width = `${Math.min(100, tamagotchiDiscipline)}%`;
    if (ageDisplay) ageDisplay.textContent = `ΗΛΙΚΙΑ: ${Math.floor(tamagotchiAge)}`;
    
    // Update stage display
    const stageNames = {
        'egg': 'ΑΥΓΟ',
        'baby': 'ΜΩΡΟ',
        'kid': 'ΠΑΙΔΙ',
        'teen': 'ΕΦΗΒΟΣ',
        'adult': 'ΕΝΗΛΙΚΑΣ',
        'middleage': 'ΜΕΣΗ ΗΛΙΚΙΑ',
        'old': 'ΓΕΡΟΣ'
    };
    if (stageDisplay) stageDisplay.textContent = stageNames[tamagotchiStage] || 'ΑΥΓΟ';
    
    // Update health bar color based on health
    if (healthFill) {
        if (tamagotchiHealth < 30) {
            healthFill.style.backgroundColor = '#dc3545'; // Red
        } else if (tamagotchiHealth < 70) {
            healthFill.style.backgroundColor = '#ffc107'; // Yellow
        } else {
            healthFill.style.backgroundColor = '#28a745'; // Green
        }
    }
    
    // Update discipline bar color
    if (disciplineFill) {
        disciplineFill.style.backgroundColor = '#17a2b8'; // Cyan
    }
    
    // Update all indicators
    updatePoopIndicator();
    updateSickIndicator();
    updateWeightDisplay();
    
    // Check for death (need STORAGE_KEYS - check if available)
    if (typeof window.STORAGE_KEYS !== 'undefined') {
        checkTamagotchiDeath(window.STORAGE_KEYS);
    }
}

function checkTamagotchiEvolution(container) {
    if (!container || tamagotchiIsDead) return;
    
    const oldStage = tamagotchiStage;
    const oldCharacterType = tamagotchiCharacterType;
    
    // Check for death from old age first
    if (tamagotchiLifeMinutes >= TAMA_STAGE_MINUTES.death && !tamagotchiIsDead) {
        cancelTamagotchiCinematics();
        tamagotchiIsDead = true;
        tamagotchiHealth = 0;
        const keys = getTamagotchiStorageKeys(
            typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : null
        );
        recordTamagotchiNaturalDeath(keys);
        const oldAgeMessages = MASCOT_MESSAGES.oldAgeDeath;
        showMascotBubble(oldAgeMessages[Math.floor(Math.random() * oldAgeMessages.length)], 5000);
        setMascotState(null, 'dead', 10000);
        console.log('[Mascot] 💀 Died from old age at', tamagotchiAge, 'years');
        
        // Show death screen after a delay
        setTimeout(() => {
            runTamagotchiDeathSequence(keys || getTamagotchiStorageKeys(
                typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : null
            ));
        }, 1500);
        
        return; // Exit early, don't update stage
    }
    
    // Determine stage based on life minutes (classic Tamagotchi pacing)
    tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
    syncTamagotchiAgeFromLife();

    if (tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.baby) {
        tamagotchiCharacterType = 'none';
    } else if (!tamagotchiCharacterType || tamagotchiCharacterType === 'none'
        || !TAMA_CHARACTER_TYPES.includes(tamagotchiCharacterType)) {
        // Hatch / recover: assign once only when missing
        ensureTamagotchiCharacterType({ allowRandom: true });
        if (oldStage === 'egg') {
            console.log(`[Mascot] 🎉 EPIC HATCH: ${tamagotchiCharacterType}!`);
        }
    }
    
    // If evolved or hatched, show message, update personality, and update appearance
    if (oldStage !== tamagotchiStage || oldCharacterType !== tamagotchiCharacterType) {
        updateTamagotchiPersonality();
        const evolutionMessages = MASCOT_MESSAGES.evolution;
        if (oldStage === 'egg' && tamagotchiStage !== 'egg') {
            tamagotchiLastPoopTime = Date.now();
            if (tamagotchiStage === 'baby' && !tamagotchiEggHatchCinematicDone) {
                runTamagotchiHatchSequence(tamagotchiCharacterType, container);
            } else if (!tamaCinematicLock && !mascotStagePreviewLock) {
                updateMascotAppearanceByStage(tamagotchiStage);
            }
        } else if (tamagotchiStage === 'old' && oldStage !== 'old') {
            const oldMessages = MASCOT_MESSAGES.becameOld;
            showMascotBubble(oldMessages[Math.floor(Math.random() * oldMessages.length)], 3000);
        } else if (oldStage !== tamagotchiStage) {
            showMascotBubble(evolutionMessages[Math.floor(Math.random() * evolutionMessages.length)], 3000);
        }
        updateTamagotchiStats(container);
        saveTamagotchiData(getTamagotchiStorageKeys(
            typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : null
        ));
    }

    if (!tamaCinematicLock && !mascotStagePreviewLock) {
        updateMascotAppearanceByStage(tamagotchiStage);
    }
    
    // Show warning messages when approaching death from old age
    if (tamagotchiLifeMinutes >= TAMA_STAGE_MINUTES.old && tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.death && Math.random() < 0.1) {
        const oldAgeWarnings = MASCOT_MESSAGES.oldAgeWarning;
        showMascotBubble(oldAgeWarnings[Math.floor(Math.random() * oldAgeWarnings.length)], 3000);
    }
}

// ===================================================================
// === ENHANCED TAMAGOTCHI SYSTEMS ===
// ===================================================================

// Poop generation system
function generateTamagotchiPoop() {
    if (tamagotchiIsDead || tamagotchiIsSleeping || tamagotchiStage === 'egg') return;
    
    const now = Date.now();
    const timeSinceLastPoop = (now - tamagotchiLastPoopTime) / 1000 / 60; // minutes
    
    // Poop frequency based on stage and toilet training
    let poopInterval = 15; // Default: every 15 minutes
    if (tamagotchiToiletTrained && tamagotchiDiscipline > 70) {
        poopInterval = 60; // Well-trained pets poop less often (use toilet more)
    } else if (tamagotchiStage === 'baby') {
        poopInterval = 10; // Babies poop more often
    }
    
    // If toilet trained and high discipline, sometimes use toilet instead
    if (tamagotchiToiletTrained && tamagotchiDiscipline > 50 && Math.random() < 0.3) {
        // Uses toilet - no poop generated
        tamagotchiLastPoopTime = now;
        return;
    }
    
    if (timeSinceLastPoop >= poopInterval) {
        tamagotchiPoopCount++;
        tamagotchiLastPoopTime = now;
        updatePoopIndicator();
        
        // If too many poops, health decreases and care mistake
        if (tamagotchiPoopCount >= 3) {
            tamagotchiHealth = Math.max(0, tamagotchiHealth - 5);
            tamagotchiCareMistakes++;
            tamagotchiNeedsScold = true;
            if (tamagotchiPoopCount >= 5) {
                // High chance of getting sick from unsanitary conditions
                if (Math.random() < 0.4) {
                    makeTamagotchiSick('upset_stomach');
                }
            }
        }
    }
}

// Update poop indicator display and visual effects
function updatePoopIndicator() {
    const poopIndicator = document.getElementById('tm-poop-indicator');
    const poopCountSpan = document.getElementById('tm-poop-count');
    const mascotContainer = document.getElementById('tm-mascot-container');
    
    if (poopIndicator) {
        poopIndicator.style.display = tamagotchiPoopCount > 0 ? 'block' : 'none';
    }
    if (poopCountSpan) {
        poopCountSpan.textContent = tamagotchiPoopCount;
    }
    
    // Add visual effects to mascot when it needs cleaning
    if (mascotContainer) {
        if (tamagotchiPoopCount > 0) {
            mascotContainer.classList.add('mascot-needs-cleaning');
            // Add poop particles
            createPoopParticles(mascotContainer, tamagotchiPoopCount);
        } else {
            mascotContainer.classList.remove('mascot-needs-cleaning');
            // Remove poop particles
            removePoopParticles(mascotContainer);
        }
    }
}

// Check if mascot needs to use toilet (based on time since last poop)
function checkNeedsToilet() {
    if (tamagotchiIsDead || tamagotchiIsSleeping || tamagotchiStage === 'egg' || tamagotchiStage === 'baby') return false;
    if (tamagotchiPoopCount > 0) return false;
    if (!tamagotchiLastPoopTime) return false;
    
    const now = Date.now();
    const timeSinceLastPoop = (now - tamagotchiLastPoopTime) / 1000 / 60; // minutes
    const poopInterval = tamagotchiToiletTrained ? 60 : 15;
    
    // Needs toilet if it's been 80% of the interval since last poop
    return timeSinceLastPoop >= (poopInterval * 0.8);
}

// Update toilet need visual indicator
function updateToiletNeedIndicator() {
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (!mascotContainer) return;
    
    const needsToilet = checkNeedsToilet();
    
    if (needsToilet) {
        mascotContainer.classList.add('mascot-needs-toilet');
        // Add urgency animation
        if (!mascotContainer.querySelector('.tm-toilet-urgency-indicator')) {
            createToiletUrgencyIndicator(mascotContainer);
        }
    } else {
        mascotContainer.classList.remove('mascot-needs-toilet');
        // Remove urgency indicator
        const indicator = mascotContainer.querySelector('.tm-toilet-urgency-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Create poop particle effects around mascot
function createPoopParticles(container, count) {
    // Remove existing particles first
    removePoopParticles(container);
    
    // Limit particle count for performance
    const particleCount = Math.min(count, 5);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'tm-poop-particle';
        particle.textContent = '💩';
        particle.style.cssText = `
            position: absolute;
            font-size: ${12 + Math.random() * 8}px;
            pointer-events: none;
            z-index: 9998;
            animation: tm-poop-float ${3 + Math.random() * 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            opacity: 0.8;
        `;
        
        // Position particles around the mascot
        const angle = (360 / particleCount) * i;
        const radius = 30 + Math.random() * 20;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        
        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;
        particle.style.transform = `translate(-50%, -50%)`;
        
        container.appendChild(particle);
    }
}

// Remove poop particles
function removePoopParticles(container) {
    const particles = container.querySelectorAll('.tm-poop-particle');
    particles.forEach(particle => particle.remove());
}

// Create toilet urgency indicator (small badge style)
function createToiletUrgencyIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'tm-toilet-urgency-indicator';
    indicator.innerHTML = '<span style="font-size: 10px;">🚽</span>';
    indicator.style.cssText = `
        position: absolute;
        bottom: 2px;
        right: 2px;
        background: rgba(139, 69, 19, 0.85);
        border: 1px solid rgba(205, 133, 63, 0.6);
        border-radius: 8px;
        padding: 2px 6px;
        font-size: 10px;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        animation: tm-toilet-urgency-subtle 2s ease-in-out infinite;
    `;
    container.appendChild(indicator);
}

// Sickness system
function makeTamagotchiSick(sickType = 'cold') {
    if (tamagotchiIsDead) return;
    
    tamagotchiIsSick = true;
    tamagotchiSickType = sickType;
    updateSickIndicator();
    
    // Sickness affects stats
    if (sickType === 'cold' || sickType === 'fever') {
        tamagotchiHealth = Math.max(0, tamagotchiHealth - 10);
        petStats.happiness = Math.max(0, petStats.happiness - 15);
    } else if (sickType === 'upset_stomach') {
        tamagotchiHealth = Math.max(0, tamagotchiHealth - 15);
        petStats.hunger = Math.max(0, petStats.hunger - 20); // Loses appetite
    }
    
    const sickMessages = MASCOT_MESSAGES.sick;
    
    const messages = sickMessages[sickType] || sickMessages['cold'];
    showMascotBubble(messages[Math.floor(Math.random() * messages.length)], 3000);
}

// Update sick indicator
function updateSickIndicator() {
    const sickIndicator = document.getElementById('tm-sick-indicator');
    const sickTypeSpan = document.getElementById('tm-sick-type');
    
    if (sickIndicator) {
        sickIndicator.style.display = tamagotchiIsSick ? 'block' : 'none';
    }
    
    if (sickTypeSpan && tamagotchiIsSick) {
        const sickTypeNames = {
            'cold': 'Κρύωμα',
            'fever': 'Πυρετός',
            'upset_stomach': 'Αναστάτωση στομάχου'
        };
        sickTypeSpan.textContent = sickTypeNames[tamagotchiSickType] || 'Άρρωστος';
    }
}

// Personality system based on care quality
function updateTamagotchiPersonality() {
    // Calculate care quality based on mistakes and stats
    let careScore = 100 - (tamagotchiCareMistakes * 5);
    careScore += (tamagotchiDiscipline / 5);
    careScore += (petStats.happiness > 70 ? 10 : 0);
    careScore += (tamagotchiHealth > 70 ? 10 : 0);
    
    if (careScore >= 90) {
        tamagotchiPersonality = 'well_cared';
    } else if (careScore >= 70) {
        tamagotchiPersonality = 'normal';
    } else if (careScore >= 50) {
        tamagotchiPersonality = 'lazy';
    } else if (careScore >= 30) {
        tamagotchiPersonality = 'spoiled';
    } else {
        tamagotchiPersonality = 'neglected';
    }
}

// Weight management system
function updateTamagotchiWeight(foodType = 'meal') {
    if (foodType === 'meal') {
        // Meals: slight weight gain, but necessary
        tamagotchiWeight = Math.min(99, tamagotchiWeight + 1);
        tamagotchiMealCount++;
    } else if (foodType === 'snack') {
        // Snacks: more weight gain, but boosts happiness
        tamagotchiWeight = Math.min(99, tamagotchiWeight + 2);
        tamagotchiSnackCount++;
    }
    
    // Reset daily counts at midnight
    const now = new Date();
    const lastFedDate = new Date(tamagotchiLastFed);
    if (now.getDate() !== lastFedDate.getDate()) {
        tamagotchiMealCount = 0;
        tamagotchiSnackCount = 0;
    }
    
    // Weight affects health
    if (tamagotchiWeight > 80) {
        // Overweight: health decreases slowly
        tamagotchiHealth = Math.max(0, tamagotchiHealth - 0.5);
    } else if (tamagotchiWeight < 20) {
        // Underweight: also unhealthy
        tamagotchiHealth = Math.max(0, tamagotchiHealth - 0.3);
    }
    
    updateWeightDisplay();
}

// Update weight display
function updateWeightDisplay() {
    const weightValue = document.getElementById('tm-weight-value');
    if (weightValue) {
        weightValue.textContent = Math.round(tamagotchiWeight);
    }
}

// Death system
function applyTamagotchiEggResetState() {
    tamagotchiEggGeneration = (Number(tamagotchiEggGeneration) || 0) + 1;
    tamagotchiAge = 0;
    tamagotchiLifeMinutes = 0;
    tamagotchiStage = 'egg';
    tamagotchiCharacterType = 'none';
    tamagotchiHealth = 100;
    tamagotchiDiscipline = 0;
    tamagotchiWeight = 30;
    tamagotchiPoopCount = 0;
    tamagotchiIsSick = false;
    tamagotchiSickType = 'none';
    tamagotchiCareMistakes = 0;
    tamagotchiPersonality = 'normal';
    tamagotchiBirthday = Date.now();
    tamagotchiIsDead = false;
    tamagotchiReviveCount = 0;
    tamagotchiLastFed = Date.now();
    tamagotchiLastPlayed = Date.now();
    tamagotchiLastCleaned = Date.now();
    tamagotchiLastPoopTime = 0;
    tamagotchiSleepStartTime = 0;
    tamagotchiSleepEndTime = 0;
    tamagotchiIsSleeping = false;
    tamagotchiLastPraise = 0;
    tamagotchiLastScold = 0;
    tamagotchiToiletTrained = false;
    tamagotchiMealCount = 0;
    tamagotchiSnackCount = 0;
    tamagotchiLightsOn = true;
    tamagotchiLightsManualOverride = false;
    tamagotchiLastUpdate = Date.now();
    tamagotchiNeedsPraise = false;
    tamagotchiNeedsScold = false;
    tamagotchiEggHatchCinematicDone = false;

    petStats.hunger = 100;
    petStats.happiness = 100;
    petStats.health = 100;
    petStats.discipline = 0;
    petStats.lastUpdate = Date.now();
}

function refreshTamagotchiAfterEggReset(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    cancelTamagotchiCinematics();

    if (mascotStateTimeout) {
        clearTimeout(mascotStateTimeout);
        mascotStateTimeout = null;
    }

    document.getElementById('tm-tamagotchi-death-overlay')?.remove();
    document.getElementById('tm-mascot-stats-modal')?.remove();
    document.getElementById('tm-mascot-kill-confirm')?.remove();
    clearMascotStagePreview(false);

    if (container) {
        try {
            container.getAnimations().forEach((anim) => anim.cancel());
        } catch { /* ignore */ }
        container.classList.remove('mascot-dead', 'mascot-dying', 'mascot-hatching');
        const robot = container.querySelector('.tm-mascot-robot');
        if (robot) {
            robot.style.removeProperty('filter');
            robot.style.removeProperty('opacity');
        }
    }

    validateTamagotchiState();
    saveTamagotchiData(STORAGE_KEYS);
    GM_setValue(STORAGE_KEYS.PET_STATS, JSON.stringify(petStats));

    if (container) {
        updateMascotAppearanceByStage('egg');
        updateTamagotchiStats(container);
        updatePetInteractionPanel();
        updatePoopIndicator();
        updateSickIndicator();
        updateToiletNeedIndicator();
        updateWeightDisplay();
        updateDeathOptionsButton();
        ensureMascotInBounds(container);

        applyMascotBehaviorState(container, 'idle');

        if (config) {
            stopRoaming(config);
            setMascotState(config, 'idle');
            if (shouldMascotBeRoaming(config)) {
                startRoaming(config);
            }
        }
    }

    const newEggMessages = MASCOT_MESSAGES.newEggStart;
    showMascotBubble(newEggMessages[Math.floor(Math.random() * newEggMessages.length)], 2500);
}

/** Custom confirm — native confirm() is often blocked or broken on MyManager pages. */
function confirmMascotKillRestart() {
    return new Promise((resolve) => {
        document.getElementById('tm-mascot-kill-confirm')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tm-mascot-kill-confirm';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
            <div role="dialog" aria-modal="true" style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid rgba(220,53,69,0.55);border-radius:16px;padding:24px;max-width:380px;width:100%;color:#fff;font-family:system-ui,sans-serif;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.55);">
                <div style="font-size:40px;margin-bottom:10px">💀🥚</div>
                <h3 style="margin:0 0 10px;font-size:18px;font-weight:700">Σκότωσε &amp; νέο αυγό;</h3>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.55;opacity:0.88">Όλη η πρόοδος (ηλικία, χαρακτήρας, στατιστικά) θα χαθεί οριστικά.</p>
                <div style="display:flex;gap:10px">
                    <button type="button" id="tm-kill-confirm-cancel" style="flex:1;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;font-size:14px;">Άκυρο</button>
                    <button type="button" id="tm-kill-confirm-yes" style="flex:1;padding:11px 14px;border-radius:10px;border:none;background:#dc3545;color:#fff;cursor:pointer;font-size:14px;font-weight:700;">Ναι, νέο αυγό</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const finish = (result) => {
            overlay.remove();
            resolve(result);
        };
        overlay.querySelector('#tm-kill-confirm-cancel')?.addEventListener('click', () => finish(false));
        overlay.querySelector('#tm-kill-confirm-yes')?.addEventListener('click', () => finish(true));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) finish(false);
        });
    });
}

/**
 * Kill the current mascot and restart from a fresh egg.
 * Plays the gun execution cinematic only when the mascot is still alive.
 * @returns {Promise<boolean>} true if reset was performed
 */
async function restartTamagotchiAsEgg(config, STORAGE_KEYS, options = {}) {
    const keys = STORAGE_KEYS || window.STORAGE_KEYS;
    const cfg = config || window.config || {};
    const { skipConfirm = false, reloadPage = false, skipExecution = false } = options;

    if (!keys?.TAMAGOTCHI_DATA) {
        console.error('[MMS Mascot] restartTamagotchiAsEgg: STORAGE_KEYS missing');
        showMascotBubble('Δεν ήταν δυνατή η επαναφορά (αποθήκευση).', 3000);
        return false;
    }

    if (!skipConfirm) {
        const ok = confirm(
            'Θέλεις σίγουρα να σκοτώσεις το mascot και να ξεκινήσεις από νέο αυγό;\n\n'
            + 'Όλη η πρόοδος (ηλικία, χαρακτήρας, στατιστικά) θα χαθεί.',
        );
        if (!ok) return false;
    }

    try {
        if (cfg) stopRoaming(cfg);

        // Already dead (hunger / health / old age) → no execution cinematic
        const playExecution = !skipExecution && !tamagotchiIsDead;
        if (playExecution) {
            document.getElementById('tm-mascot-stats-modal')?.remove();
            document.getElementById('tm-mascot-kill-confirm')?.remove();
            document.getElementById('tm-tamagotchi-death-overlay')?.remove();
            await showMascotExecutionCinematic();
            recordTamagotchiUserKill(keys);
        } else {
            document.getElementById('tm-mascot-stats-modal')?.remove();
            document.getElementById('tm-mascot-kill-confirm')?.remove();
            document.getElementById('tm-tamagotchi-death-overlay')?.remove();
            document.getElementById('tm-tama-death-cinematic')?.remove();
        }

        cancelTamagotchiCinematics();

        applyTamagotchiEggResetState();
        saveTamagotchiData(keys);
        const setValue = typeof GM_setValue === 'function' ? GM_setValue : window.GM_setValue;
        if (typeof setValue !== 'function') {
            throw new Error('GM_setValue unavailable');
        }
        setValue(keys.PET_STATS, JSON.stringify(petStats));

        if (reloadPage) {
            setTimeout(() => location.reload(), 150);
            return true;
        }

        refreshTamagotchiAfterEggReset(cfg, keys);
        return true;
    } catch (err) {
        console.error('[MMS Mascot] restartTamagotchiAsEgg failed:', err);
        showMascotBubble('Σφάλμα επαναφοράς αυγού.', 3000);
        return false;
    }
}

function checkTamagotchiDeath(STORAGE_KEYS) {
    if (tamagotchiIsDead) return;
    
    // Die if health reaches 0, or hunger stays at 0 for >4 office-hours (nights don't count)
    const starvedOfficeMin = getOfficeMinutesBetween(tamagotchiLastFed || Date.now(), Date.now());
    if (tamagotchiHealth <= 0 || (petStats.hunger <= 0 && starvedOfficeMin > 4 * 60)) {
        cancelTamagotchiCinematics();
        tamagotchiIsDead = true;
        recordTamagotchiNaturalDeath(STORAGE_KEYS);
        
        const deathMessages = MASCOT_MESSAGES.death;
        showMascotBubble(deathMessages[Math.floor(Math.random() * deathMessages.length)], 5000);
        
        // Update death options button visibility
        updateDeathOptionsButton();
        
        // Show death cinematic + options panel
        runTamagotchiDeathSequence(STORAGE_KEYS);
    }
}

function formatMascotDeathCountersLine() {
    return `Φυσικοί θάνατοι: ${tamagotchiNaturalDeathCount} · Σκοτωμοί: ${tamagotchiKilledByUserCount}`;
}

/** Lifetime tally — natural / care / old-age death (not user execution). */
function recordTamagotchiNaturalDeath(STORAGE_KEYS) {
    tamagotchiNaturalDeathCount = Math.max(0, Number(tamagotchiNaturalDeathCount) || 0) + 1;
    const keys = getTamagotchiStorageKeys(STORAGE_KEYS);
    if (keys) saveTamagotchiData(keys);
    updateDeathOptionsButton();
    return tamagotchiNaturalDeathCount;
}

/** Lifetime tally — user kill while alive (execution cinematic). */
function recordTamagotchiUserKill(STORAGE_KEYS) {
    tamagotchiKilledByUserCount = Math.max(0, Number(tamagotchiKilledByUserCount) || 0) + 1;
    const keys = getTamagotchiStorageKeys(STORAGE_KEYS);
    if (keys) saveTamagotchiData(keys);
    updateDeathOptionsButton();
    return tamagotchiKilledByUserCount;
}

// Update death options button visibility
function updateDeathOptionsButton() {
    const reviveContainer = document.getElementById('tm-pet-revive-btn-container');
    if (reviveContainer) {
        reviveContainer.style.display = tamagotchiIsDead ? 'block' : 'none';
    }
    const line = formatMascotDeathCountersLine();
    const petCounters = document.getElementById('tm-pet-death-counters');
    if (petCounters) petCounters.textContent = line;
    const modalCounters = document.getElementById('tm-modal-death-counters');
    if (modalCounters) modalCounters.textContent = line;
}

// Show death screen with revival option (after cinematic)
function showTamagotchiDeathScreen(STORAGE_KEYS, skipCinematic = false) {
    const container = document.getElementById('tm-mascot-container');
    if (!container) {
        console.error('[MMS] Mascot container not found for death screen');
        return;
    }
    
    const config = typeof window.config !== 'undefined' ? window.config : null;
    
    const existingOverlay = document.getElementById('tm-tamagotchi-death-overlay');
    if (existingOverlay) return;

    if (!skipCinematic) {
        runTamagotchiDeathSequence(STORAGE_KEYS);
        return;
    }

    ensureTamaCinematicStyles();
    
    const charName = tamagotchiCharacterType && MASCOT_CHARACTERS[tamagotchiCharacterType]
        ? (MASCOT_CHARACTERS[tamagotchiCharacterType].nameGr || MASCOT_CHARACTERS[tamagotchiCharacterType].name)
        : 'Φίλε';
    
    const overlay = document.createElement('div');
    overlay.id = 'tm-tamagotchi-death-overlay';
    overlay.className = 'tm-tama-cinematic-overlay';
    overlay.innerHTML = `
        <div class="tm-tama-cinematic-panel" style="border-color:#4a4a5a; background:linear-gradient(180deg,#1a1a2a,#0a0a14); max-width:420px;">
            <div class="tm-tama-lcd-title" style="color:#888">● Μνημόσυνο ●</div>
            <h2 class="tm-tama-cinematic-title" style="color:#e8a0a0;text-shadow:none">Σε ανάμνηση του ${charName}</h2>
            <div class="tm-tama-death-options visible">
                <p class="tm-tama-death-stat">Ηλικία: ${Math.floor(tamagotchiAge)} χρόνια</p>
                <p class="tm-tama-death-stat">Χαρακτήρας: ${MASCOT_PERSONALITY_GR[tamagotchiPersonality] || tamagotchiPersonality}</p>
                <p class="tm-tama-death-stat">Λάθη φροντίδας: ${tamagotchiCareMistakes}</p>
                <p class="tm-tama-death-stat">${formatMascotDeathCountersLine()}</p>
                <div style="margin-top:20px">
                    <button class="tm-tama-btn tm-tama-btn-revive" id="tm-revive-btn">♻ Αναζωογόνηση (${tamagotchiReviveCount + 1}η φορά)</button>
                    <button class="tm-tama-btn tm-tama-btn-restart" id="tm-restart-btn">🥚 Νέο αυγό</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Revive button
    document.getElementById('tm-revive-btn')?.addEventListener('click', () => {
        tamagotchiIsDead = false;
        tamagotchiHealth = 50;
        petStats.hunger = 50;
        petStats.happiness = 50;
        tamagotchiReviveCount++;
        tamagotchiLifeMinutes = Math.max(TAMA_STAGE_MINUTES.baby, tamagotchiLifeMinutes - TAMA_MINUTES_PER_YEAR);
        validateTamagotchiState();
        
        // Save both tamagotchi data and pet stats
        saveTamagotchiData(STORAGE_KEYS);
        GM_setValue(STORAGE_KEYS.PET_STATS, JSON.stringify(petStats));
        
        document.body.removeChild(overlay);
        updateDeathOptionsButton();
        
        if (container) {
            updateMascotAppearanceByStage(tamagotchiStage);
            updateTamagotchiStats(container);
            updatePetInteractionPanel();
            updateToiletNeedIndicator();
            if (config) {
                setMascotState(config, 'idle');
            }
        }
        
        showMascotBubble(MASCOT_MESSAGES.revived, 2000);
    });
    
    // Restart button (already dead — skip shoot cinematic)
    document.getElementById('tm-restart-btn')?.addEventListener('click', async () => {
        if (await restartTamagotchiAsEgg(config, STORAGE_KEYS, { skipConfirm: true, skipExecution: true })) {
            overlay.remove();
        }
    });
}

// Sleep schedule system - respects manual lights override
function updateTamagotchiSleepSchedule(config) {
    if (!config) return;
    
    // Don't override if user manually set lights
    if (tamagotchiLightsManualOverride) {
        return;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Sleep outside office hours (21:00 – 09:00) so overnight leave-on stays dormant
    const shouldSleep = currentHour >= TAMA_OFFICE_HOUR_END || currentHour < TAMA_OFFICE_HOUR_START;
    
    if (shouldSleep && !tamagotchiIsSleeping) {
        tamagotchiIsSleeping = true;
        tamagotchiLightsOn = false; // Auto-turn off lights for sleep
        tamagotchiSleepStartTime = now.getTime();
        stopRoaming(config);
        setMascotState(config, 'powersave');
        
        // Update button appearance if available (use direct querySelector since getButton might not be in scope)
        const lightsBtn = document.querySelector('#tm-pet-lights-btn');
        if (lightsBtn) {
            lightsBtn.innerHTML = '🌙 Φώτα κλειστά';
            lightsBtn.style.opacity = '0.6';
            lightsBtn.style.filter = 'brightness(0.7)';
        }
    } else if (!shouldSleep && tamagotchiIsSleeping && !tamagotchiLightsManualOverride) {
        // Auto-wake if not manually overridden
        tamagotchiIsSleeping = false;
        tamagotchiLightsOn = true; // Auto-turn on lights
        tamagotchiSleepEndTime = now.getTime();
        setMascotState(config, 'idle');
        
        // Update button appearance if available (use direct querySelector since getButton might not be in scope)
        const lightsBtn = document.querySelector('#tm-pet-lights-btn');
        if (lightsBtn) {
            lightsBtn.innerHTML = '💡 Φώτα ανοιχτά';
            lightsBtn.style.opacity = '1';
            lightsBtn.style.filter = 'brightness(1.2)';
        }
        
        // Resume roaming after waking up
        setTimeout(() => {
            if (tamagotchiLightsOn && !isRoaming && !tamagotchiIsSleeping) {
                startRoaming(config);
            }
        }, 1000);
    }
}

function resetIdleTimer(config) {
    if (idleTimer) { clearTimeout(idleTimer); }
    const mascotContainer = document.getElementById('tm-mascot-container');
    
    // If lights are off, don't wake up - keep sleeping
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) {
        if (mascotContainer && !mascotContainer.classList.contains('mascot-powersave')) {
            setMascotState(config, 'powersave');
        }
        return; // Don't set idle timer when sleeping
    }
    
    // Wake from power-save on activity only — do not reset state on every mouse move.
    const wakingFromSleep = mascotContainer?.classList.contains('mascot-powersave');
    if (wakingFromSleep) {
        const robot = mascotContainer.querySelector('.tm-mascot-robot');
        if (robot) {
            robot.style.animation = 'tm-mascot-startled 0.4s ease-out';
            setTimeout(() => { robot.style.animation = ''; }, 400);
        }
        if (typeof window.STORAGE_KEYS !== 'undefined') {
            updatePetStateByStats(config, window.STORAGE_KEYS);
        }
    }

    // Set mascot to sleep after 3 minutes of inactivity (but only if lights are on)
    idleTimer = setTimeout(() => {
        if (tamagotchiLightsOn && !tamagotchiIsSleeping) {
            setMascotState(config, 'powersave');
        }
    }, 3 * 60 * 1000);
}

function initInteractiveMascot(config, STORAGE_KEYS) {
    if (!config || !config.interactiveMascotEnabled) return;

    // Add mascot animation styles to document
    if (!document.getElementById('tm-mascot-animations')) {
        const animStyle = document.createElement('style');
        animStyle.id = 'tm-mascot-animations';
        animStyle.textContent = `
            @keyframes tm-arm-sway-left {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-8deg); }
            }
            @keyframes tm-arm-sway-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(8deg); }
            }
            @keyframes tm-leg-walk-left {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-2px); }
            }
            @keyframes tm-leg-walk-right {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(2px); }
            }
            @keyframes tm-tail-wag {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-5deg); }
                75% { transform: rotate(5deg); }
            }
            @keyframes tm-wing-flap {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(-10deg); }
            }
            @keyframes tm-wing-flap-right {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(10deg); }
            }
            @keyframes tm-body-breathe {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .tm-animate-arm-left {
                transform-origin: center center;
                transform-box: fill-box;
                transition: transform 0.3s ease-out;
            }
            .tm-animate-arm-right {
                transform-origin: center center;
                transform-box: fill-box;
                transition: transform 0.3s ease-out;
            }
            .tm-animate-leg-left {
                transform-box: fill-box;
                transition: transform 0.2s ease-out;
            }
            .tm-animate-leg-right {
                transform-box: fill-box;
                transition: transform 0.2s ease-out;
            }
            .tm-animate-tail {
                transform-origin: left center;
                transform-box: fill-box;
                transition: transform 0.4s ease-out;
            }
            .tm-animate-wing-left {
                transform-origin: right center;
                transform-box: fill-box;
                transition: transform 0.3s ease-out;
            }
            .tm-animate-wing-right {
                transform-origin: left center;
                transform-box: fill-box;
                transition: transform 0.3s ease-out;
            }
            .tm-animate-body {
                animation: tm-body-breathe 3s ease-in-out infinite;
                transform-origin: center center;
                transform-box: fill-box;
            }
            
            /* Idle animations when not moving */
            .mascot-idle .tm-animate-arm-left {
                animation: tm-arm-sway-left 2s ease-in-out infinite;
            }
            .mascot-idle .tm-animate-arm-right {
                animation: tm-arm-sway-right 2s ease-in-out infinite 1s;
            }
            .mascot-idle .tm-animate-leg-left {
                animation: tm-leg-walk-left 1.5s ease-in-out infinite;
            }
            .mascot-idle .tm-animate-leg-right {
                animation: tm-leg-walk-right 1.5s ease-in-out infinite 0.75s;
            }
            .mascot-idle .tm-animate-tail {
                animation: tm-tail-wag 2.5s ease-in-out infinite;
            }
            .mascot-idle .tm-animate-wing-left {
                animation: tm-wing-flap 1.8s ease-in-out infinite;
            }
            .mascot-idle .tm-animate-wing-right {
                animation: tm-wing-flap-right 1.8s ease-in-out infinite;
            }

            /* Short-lived moods tweak idle motion */
            .mascot-mood-happy .tm-animate-body { animation-duration: 2.2s; }
            .mascot-mood-playful .tm-animate-tail { animation-duration: 1.2s; }
            .mascot-mood-playful .tm-animate-arm-left,
            .mascot-mood-playful .tm-animate-arm-right { animation-duration: 1.1s; }
            .mascot-mood-sleepy .tm-animate-body { animation-duration: 4.5s; }
            .mascot-mood-sleepy .tm-animate-arm-left,
            .mascot-mood-sleepy .tm-animate-arm-right { animation-duration: 3.5s; }
            .mascot-mood-grumpy .tm-animate-tail { animation-duration: 3.2s; }
            .mascot-mood-hungry .tm-animate-body { animation: tm-body-breathe 1.6s ease-in-out infinite; }
            .mascot-mood-proud .tm-animate-wing-left,
            .mascot-mood-proud .tm-animate-wing-right { animation-duration: 1.2s; }
            .mascot-mood-curious #tm-mascot-container,
            .mascot-mood-curious { filter: saturate(1.08); }
        `;
        document.head.appendChild(animStyle);
    }

    const container = document.createElement('div');
    container.id = 'tm-mascot-container';
    container.classList.add('tm-mascot-container');
    container.title = "Click me!";
    // Simple robot SVG
    container.innerHTML = `
        <div id="tm-mascot-speech-bubble" class="tm-mascot-speech-bubble" style="display: none;"></div>
        <div id="tm-mascot-interaction-panel" style="display: none !important;">
            <!-- Header Section -->
            <div class="tm-panel-header">
                <div class="tm-panel-title">
                    <span id="tm-tamagotchi-stage-display" class="tm-stage-badge">ΑΥΓΟ</span>
                    <div class="tm-panel-info">
                        <span id="tm-tamagotchi-age-display" class="tm-age-text">Age: 0</span>
                        <span id="tm-tamagotchi-weight-display" class="tm-weight-text">⚖️ <span id="tm-weight-value">30</span>kg</span>
                    </div>
                </div>
                <button class="tm-panel-close" id="tm-panel-close-btn" title="Close panel">✕</button>
            </div>

            <!-- Status Alerts -->
            <div id="tm-status-alerts">
                <div id="tm-poop-indicator" class="tm-alert tm-alert-poop" style="display: none;">
                    <span class="tm-alert-icon">💩</span>
                    <span class="tm-alert-text">Needs cleaning (<span id="tm-poop-count">0</span>)</span>
                </div>
                <div id="tm-sick-indicator" class="tm-alert tm-alert-sick" style="display: none;">
                    <span class="tm-alert-icon">🤒</span>
                    <span class="tm-alert-text" id="tm-sick-type">Sick</span>
                </div>
            </div>

            <!-- Stats Section -->
            <div class="tm-panel-section">
                <div class="tm-section-title">Stats</div>
                <div class="tm-stats-grid">
                    <div class="tm-stat-item" id="tm-pet-happiness-bar" title="Η ευτυχία μειώνεται με τον χρόνο και αυξάνεται όταν τον χαϊδεύετε ή κάνετε εργασίες.">
                        <div class="tm-stat-icon">😊</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-name">Happiness</div>
                            <div class="tm-pet-stat-bar tm-stat-bar-modern"><div id="tm-pet-happiness-fill" class="tm-pet-stat-bar-fill"></div></div>
                        </div>
                    </div>
                    <div class="tm-stat-item" id="tm-pet-hunger-bar" title="Η πείνα αυξάνεται με τον χρόνο. Τάισε το mascot για να την μειώσεις!">
                        <div class="tm-stat-icon">🍔</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-name">Hunger</div>
                            <div class="tm-pet-stat-bar tm-stat-bar-modern"><div id="tm-pet-hunger-fill" class="tm-pet-stat-bar-fill"></div></div>
                        </div>
                    </div>
                    <div class="tm-stat-item" id="tm-pet-health-bar" title="Η υγεία μειώνεται αν είναι πολύ πεινασμένο.">
                        <div class="tm-stat-icon">❤️</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-name">Health</div>
                            <div class="tm-pet-stat-bar tm-stat-bar-modern"><div id="tm-pet-health-fill" class="tm-pet-stat-bar-fill"></div></div>
                        </div>
                    </div>
                    <div class="tm-stat-item" id="tm-pet-discipline-bar" title="Η πειθαρχία αυξάνεται όταν παίζεις μαζί του.">
                        <div class="tm-stat-icon">⭐</div>
                        <div class="tm-stat-content">
                            <div class="tm-stat-name">Discipline</div>
                            <div class="tm-pet-stat-bar tm-stat-bar-modern"><div id="tm-pet-discipline-fill" class="tm-pet-stat-bar-fill"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions Section -->
            <div class="tm-panel-section">
                <div class="tm-section-title">Care</div>
                <div class="tm-actions-grid">
                    <button id="tm-pet-meal-btn" class="tm-action-btn tm-btn-primary" title="Give a proper meal">
                        <span class="tm-btn-icon">🍽️</span>
                        <span class="tm-btn-label">Meal</span>
                    </button>
                    <button id="tm-pet-snack-btn" class="tm-action-btn tm-btn-secondary" title="Give a snack">
                        <span class="tm-btn-icon">🍰</span>
                        <span class="tm-btn-label">Snack</span>
                    </button>
                    <button id="tm-pet-pet-btn" class="tm-action-btn tm-btn-love" title="Pet/Play">
                        <span class="tm-btn-icon">💕</span>
                        <span class="tm-btn-label">Pet</span>
                    </button>
                    <button id="tm-pet-clean-btn" class="tm-action-btn tm-btn-clean" title="Clean up poop">
                        <span class="tm-btn-icon">🧹</span>
                        <span class="tm-btn-label">Clean</span>
                    </button>
                    <button id="tm-pet-medicine-btn" class="tm-action-btn tm-btn-medicine" title="Give medicine">
                        <span class="tm-btn-icon">💊</span>
                        <span class="tm-btn-label">Medicine</span>
                    </button>
                    <button id="tm-pet-toilet-btn" class="tm-action-btn tm-btn-toilet" title="Train to use toilet">
                        <span class="tm-btn-icon">🚽</span>
                        <span class="tm-btn-label">Toilet</span>
                    </button>
                </div>
            </div>

            <!-- Training Section -->
            <div class="tm-panel-section">
                <div class="tm-section-title">Training</div>
                <div class="tm-actions-grid">
                    <button id="tm-pet-praise-btn" class="tm-action-btn tm-btn-praise" title="Praise">
                        <span class="tm-btn-icon">👍</span>
                        <span class="tm-btn-label">Praise</span>
                    </button>
                    <button id="tm-pet-scold-btn" class="tm-action-btn tm-btn-scold" title="Scold">
                        <span class="tm-btn-icon">👎</span>
                        <span class="tm-btn-label">Scold</span>
                    </button>
                </div>
            </div>

            <!-- Games & Settings Section -->
            <div class="tm-panel-section">
                <div class="tm-section-title">Activities</div>
                <div class="tm-actions-grid">
                    <button id="tm-play-bug-game-btn" class="tm-action-btn tm-btn-game" title="Play Bug Squish">
                        <span class="tm-btn-icon">🐞</span>
                        <span class="tm-btn-label">Bugs</span>
                    </button>
                    <button id="tm-play-memory-game-btn" class="tm-action-btn tm-btn-game" title="Play Memory">
                        <span class="tm-btn-icon">🧠</span>
                        <span class="tm-btn-label">Memory</span>
                    </button>
                    <button id="tm-pet-lights-btn" class="tm-action-btn tm-btn-lights" title="Toggle lights">
                        <span class="tm-btn-icon">💡</span>
                        <span class="tm-btn-label">Φώτα</span>
                    </button>
                    <button id="tm-pet-stats-btn" class="tm-action-btn tm-btn-info" title="View detailed stats">
                        <span class="tm-btn-icon">📊</span>
                        <span class="tm-btn-label">Stats</span>
                    </button>
                </div>
            </div>

            <!-- Death Options (Hidden by default) -->
            <div id="tm-pet-revive-btn-container" style="display: none;">
                <button id="tm-pet-revive-btn" class="tm-action-btn tm-btn-death" title="Revive or restart">
                    <span class="tm-btn-icon">💀</span>
                    <span class="tm-btn-label">Death Options</span>
                </button>
            </div>

            <!-- Kill & restart -->
            <div class="tm-panel-section tm-panel-section-danger">
                <div class="tm-section-title">Επαναφορά</div>
                <p class="tm-section-death-stats" id="tm-pet-death-counters" style="margin:0 0 8px;font-size:11px;opacity:0.8;line-height:1.4;">${formatMascotDeathCountersLine()}</p>
                <button id="tm-pet-kill-restart-btn" class="tm-action-btn tm-btn-kill-restart" title="Σκοτώνει το mascot και ξεκινά νέο αυγό">
                    <span class="tm-btn-icon">💀</span>
                    <span class="tm-btn-label">Νέο αυγό</span>
                </button>
            </div>
        </div>
        <svg class="tm-mascot-robot" viewBox="0 0 100 100" style="overflow: visible;">
            <!-- Global Defs -->
                    <defs>
                <!-- Jetpack Gradients -->
                        <linearGradient id="jetpack-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#d5d8dc;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#95a5a6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f8c8d;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f39c12;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#e67e22;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d35400;stop-opacity:0.5" />
                        </linearGradient>
                <!-- Glow filters for magical effects -->
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <filter id="strong-glow">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                    </defs>
            
            <!-- Flipper group for horizontal flipping -->
            <g class="tm-mascot-flipper" transform-origin="50 50">
                <!-- ═══════════════════════════════════════ -->
                <!-- EGG STAGE - Mysterious Cosmic Egg -->
                <!-- ═══════════════════════════════════════ -->
                <g id="tm-mascot-base" style="display: none; visibility: hidden; opacity: 0;">
                    <defs>
                        <radialGradient id="egg-glow">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="50%" style="stop-color:#a8e6cf;stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="egg-shell" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#80deea;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Cosmic glow aura -->
                    <ellipse cx="50" cy="52" rx="42" ry="48" fill="url(#egg-glow)" class="tm-cosmic-aura"/>
                    <!-- Main egg body -->
                    <ellipse cx="50" cy="52" rx="33" ry="38" fill="url(#egg-shell)" stroke="#4ecdc4" stroke-width="2.5" filter="url(#glow)"/>
                    <!-- Magical crack patterns (animated) -->
                    <path d="M 50 20 L 48 28 L 52 35 L 49 42" stroke="#26a69a" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round" class="tm-egg-crack"/>
                    <path d="M 30 40 L 35 45 L 32 52" stroke="#26a69a" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round" class="tm-egg-crack"/>
                    <path d="M 70 38 L 65 43 L 68 50" stroke="#26a69a" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round" class="tm-egg-crack"/>
                    <!-- Mystical symbols -->
                    <circle cx="50" cy="50" r="18" fill="none" stroke="#4dd0e1" stroke-width="1" opacity="0.3" stroke-dasharray="3,3"/>
                    <circle cx="50" cy="50" r="12" fill="none" stroke="#4dd0e1" stroke-width="0.8" opacity="0.4" stroke-dasharray="2,2"/>
                    <!-- Energy sparkles -->
                    <circle cx="38" cy="35" r="2" fill="#fff" opacity="0.9" class="tm-sparkle"/>
                    <circle cx="62" cy="40" r="1.5" fill="#fff" opacity="0.8" class="tm-sparkle"/>
                    <circle cx="55" cy="65" r="2.5" fill="#fff" opacity="0.9" class="tm-sparkle"/>
                    <circle cx="42" cy="62" r="1.8" fill="#fff" opacity="0.7" class="tm-sparkle"/>
                    <!-- Pulsing core -->
                    <ellipse cx="50" cy="52" rx="8" ry="10" fill="#fff" opacity="0.3" class="tm-egg-core"/>
                    <!-- Eyes (closed/sleeping) -->
                    <g class="tm-mascot-eye-open" style="display:none;">
                        <circle cx="44" cy="50" r="4" fill="#26a69a" opacity="0.6"/>
                        <circle cx="56" cy="50" r="4" fill="#26a69a" opacity="0.6"/>
                    </g>
                    <g class="tm-mascot-eye-closed">
                        <path d="M 40 48 Q 44 46 48 48" stroke="#26a69a" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
                        <path d="M 52 48 Q 56 46 60 48" stroke="#26a69a" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
                    </g>
                    <!-- No mouth -->
                    <path class="tm-mascot-mouth-happy" style="display:none;" d="M 40 56 Q 50 62 60 56" stroke="#26a69a" stroke-width="2" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 58 Q 50 52 60 58" stroke="#26a69a" stroke-width="2" fill="none"/>
                </g>
                
                <!-- ═══════════════════════════════════════ -->
                <!-- DRAGON CHARACTER - All Life Stages (dense cute vector v2) -->
                <!-- ═══════════════════════════════════════ -->

                <!-- DRAGON BABY -->
                <g id="tm-mascot-baby-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="baby-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#d4ff9a;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#8cff3a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#64dd17;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="baby-dragon-scales-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#558b2f;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="baby-dragon-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffe082;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="baby-dragon-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="baby-dragon-horn" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" style="stop-color:#ff6090;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffc1e3;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="baby-dragon-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#80deea;stop-opacity:0.55" />
                        </linearGradient>
                        <radialGradient id="baby-dragon-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#4e6b3a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="50" cy="90" rx="26" ry="5" fill="#1a1a1a" opacity="0.18"/>
                    <!-- Tail -->
                    <g class="tm-animate-tail">
                        <path d="M 66 70 Q 78 74 82 68 Q 85 62 80 58 Q 76 56 74 60"
                              fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.6"/>
                        <path d="M 74 59 Q 78 56 80 60" fill="none" stroke="#7cb342" stroke-width="0.8" opacity="0.7"/>
                        <circle cx="80" cy="59" r="3.2" fill="url(#baby-dragon-horn)" stroke="#e91e63" stroke-width="0.9"/>
                        <circle cx="79" cy="58" r="1.1" fill="#fff" opacity="0.45"/>
                    </g>
                    <!-- Wing nubs (behind body) -->
                    <g class="tm-animate-wing-left">
                        <ellipse cx="28" cy="58" rx="6" ry="9" fill="url(#baby-dragon-wing)" stroke="#558b2f" stroke-width="1.1" transform="rotate(-18 28 58)"/>
                        <path d="M 26 54 Q 24 58 26 62" stroke="#4db6c6" stroke-width="0.7" opacity="0.7" fill="none"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <ellipse cx="72" cy="58" rx="6" ry="9" fill="url(#baby-dragon-wing)" stroke="#558b2f" stroke-width="1.1" transform="rotate(18 72 58)"/>
                        <path d="M 74 54 Q 76 58 74 62" stroke="#4db6c6" stroke-width="0.7" opacity="0.7" fill="none"/>
                    </g>
                    <!-- Body -->
                    <g class="tm-animate-body">
                        <ellipse cx="50" cy="66" rx="25" ry="21" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="2"/>
                        <ellipse cx="42" cy="58" rx="8" ry="5" fill="#fff" opacity="0.22"/>
                        <!-- Soft scale dots -->
                        <circle cx="38" cy="62" r="1.4" fill="#558b2f" opacity="0.28"/>
                        <circle cx="44" cy="58" r="1.2" fill="#558b2f" opacity="0.22"/>
                        <circle cx="56" cy="58" r="1.2" fill="#558b2f" opacity="0.22"/>
                        <circle cx="62" cy="62" r="1.4" fill="#558b2f" opacity="0.28"/>
                        <circle cx="40" cy="70" r="1.1" fill="#558b2f" opacity="0.2"/>
                        <circle cx="60" cy="70" r="1.1" fill="#558b2f" opacity="0.2"/>
                        <!-- Belly -->
                        <ellipse cx="50" cy="70" rx="14" ry="12" fill="url(#baby-dragon-belly)"/>
                        <path d="M 42 66 Q 50 68 58 66" stroke="#ffe082" stroke-width="0.9" fill="none" opacity="0.7"/>
                        <path d="M 41 72 Q 50 74 59 72" stroke="#ffe082" stroke-width="0.9" fill="none" opacity="0.55"/>
                        <!-- Back nubs -->
                        <circle cx="46" cy="52" r="2.6" fill="#ff80ab" stroke="#e91e63" stroke-width="0.7"/>
                        <circle cx="54" cy="52" r="2.6" fill="#ff80ab" stroke="#e91e63" stroke-width="0.7"/>
                        <circle cx="44" cy="59" r="2" fill="#ff6090" stroke="#e91e63" stroke-width="0.6"/>
                        <circle cx="56" cy="59" r="2" fill="#ff6090" stroke="#e91e63" stroke-width="0.6"/>
                    </g>
                    <!-- Arms -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="27" cy="62" rx="6.5" ry="8.5" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.4"/>
                        <ellipse cx="25" cy="58" rx="2.5" ry="1.8" fill="#fff" opacity="0.25"/>
                        <path d="M 23 68 L 21 71 M 26 69 L 25 72 M 29 68 L 29 71" stroke="#558b2f" stroke-width="1.3" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="73" cy="62" rx="6.5" ry="8.5" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.4"/>
                        <ellipse cx="75" cy="58" rx="2.5" ry="1.8" fill="#fff" opacity="0.25"/>
                        <path d="M 71 68 L 71 71 M 74 69 L 75 72 M 77 68 L 79 71" stroke="#558b2f" stroke-width="1.3" stroke-linecap="round"/>
                    </g>
                    <!-- Head (oversized) -->
                    <ellipse cx="50" cy="37" rx="19" ry="17" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="2"/>
                    <ellipse cx="42" cy="30" rx="7" ry="4" fill="#fff" opacity="0.2"/>
                    <!-- Horn nubs -->
                    <ellipse cx="37" cy="26" rx="3.2" ry="5.5" fill="url(#baby-dragon-horn)" stroke="#e91e63" stroke-width="1" transform="rotate(-22 37 26)"/>
                    <ellipse cx="63" cy="26" rx="3.2" ry="5.5" fill="url(#baby-dragon-horn)" stroke="#e91e63" stroke-width="1" transform="rotate(22 63 26)"/>
                    <ellipse cx="36" cy="24" rx="1.2" ry="2" fill="#fff" opacity="0.4" transform="rotate(-22 36 24)"/>
                    <ellipse cx="64" cy="24" rx="1.2" ry="2" fill="#fff" opacity="0.4" transform="rotate(22 64 24)"/>
                    <!-- Snout -->
                    <ellipse cx="50" cy="44" rx="9" ry="5.5" fill="url(#baby-dragon-belly)" stroke="#c9a227" stroke-width="0.6" opacity="0.95"/>
                    <circle cx="47" cy="45" r="1.3" fill="#558b2f"/>
                    <circle cx="53" cy="45" r="1.3" fill="#558b2f"/>
                    <circle cx="46.6" cy="44.5" r="0.4" fill="#fff" opacity="0.5"/>
                    <circle cx="52.6" cy="44.5" r="0.4" fill="#fff" opacity="0.5"/>
                    <!-- Cheeks -->
                    <circle cx="34" cy="42" r="4" fill="url(#baby-dragon-cheek)"/>
                    <circle cx="66" cy="42" r="4" fill="url(#baby-dragon-cheek)"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="41" cy="35" rx="7.5" ry="9.2" fill="#fff" stroke="#558b2f" stroke-width="1.4"/>
                        <ellipse cx="59" cy="35" rx="7.5" ry="9.2" fill="#fff" stroke="#558b2f" stroke-width="1.4"/>
                        <ellipse cx="42" cy="36.5" rx="4.2" ry="5.4" fill="url(#baby-dragon-iris)"/>
                        <ellipse cx="60" cy="36.5" rx="4.2" ry="5.4" fill="url(#baby-dragon-iris)"/>
                        <ellipse cx="42" cy="36.8" rx="2.2" ry="3" fill="#0d1a08"/>
                        <ellipse cx="60" cy="36.8" rx="2.2" ry="3" fill="#0d1a08"/>
                        <circle cx="43.5" cy="33.5" r="2.4" fill="#fff" opacity="0.95"/>
                        <circle cx="61.5" cy="33.5" r="2.4" fill="#fff" opacity="0.95"/>
                        <circle cx="40.2" cy="38" r="1" fill="#fff" opacity="0.5"/>
                        <circle cx="58.2" cy="38" r="1" fill="#fff" opacity="0.5"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 34 36 Q 41 32 48 36" stroke="#558b2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        <path d="M 52 36 Q 59 32 66 36" stroke="#558b2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    </g>
                    <path class="tm-mascot-mouth-happy" d="M 44 49 Q 50 53.5 56 49" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 51 Q 50 47 56 51" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Feet -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="40" cy="85" rx="6.5" ry="4.2" fill="url(#baby-dragon-scales-dark)" stroke="#558b2f" stroke-width="1.4"/>
                        <path d="M 36 86 L 34 89 M 40 87 L 40 90 M 44 86 L 46 89" stroke="#33691e" stroke-width="1.3" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="60" cy="85" rx="6.5" ry="4.2" fill="url(#baby-dragon-scales-dark)" stroke="#558b2f" stroke-width="1.4"/>
                        <path d="M 54 86 L 52 89 M 60 87 L 60 90 M 64 86 L 66 89" stroke="#33691e" stroke-width="1.3" stroke-linecap="round"/>
                    </g>
                </g>

                <!-- DRAGON KID -->
                <g id="tm-mascot-evo1-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b2fff0;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#64ffda;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1de9b6;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="dragon-scales-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#1de9b6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00897b;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f1fbff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b3e5fc;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="dragon-wing-kid" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0.65" />
                        </linearGradient>
                        <linearGradient id="dragon-horn-kid" x1="0%" y1="100%" x2="40%" y2="0%">
                            <stop offset="0%" style="stop-color:#e91e63;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff80ab;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="dragon-iris-kid" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#00695c;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="dragon-cheek-kid" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="50" cy="92" rx="30" ry="6" fill="#1a1a1a" opacity="0.2"/>
                    <!-- Tail -->
                    <g class="tm-animate-tail">
                        <path d="M 70 70 Q 86 76 90 68 Q 93 60 86 56 Q 80 54 78 58"
                              fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="2"/>
                        <path d="M 78 62 Q 84 58 88 62" fill="none" stroke="#26a69a" stroke-width="1" opacity="0.55"/>
                        <path d="M 82 66 Q 87 64 89 68" fill="none" stroke="#26a69a" stroke-width="0.8" opacity="0.45"/>
                        <circle cx="87" cy="57" r="4.2" fill="url(#dragon-horn-kid)" stroke="#c2185b" stroke-width="1.1"/>
                        <circle cx="86" cy="55.5" r="1.4" fill="#fff" opacity="0.4"/>
                        <path d="M 87 53 L 89 49 L 85 51 Z" fill="#ff6090"/>
                    </g>
                    <!-- Budding wings with membrane -->
                    <g class="tm-animate-wing-left">
                        <path d="M 30 56 Q 18 48 16 40 Q 15 34 20 36 Q 26 48 32 54 Z"
                              fill="url(#dragon-wing-kid)" stroke="#00bfa5" stroke-width="1.4"/>
                        <path d="M 22 40 Q 24 46 28 52" stroke="#00897b" stroke-width="0.8" opacity="0.55" fill="none"/>
                        <path d="M 26 42 Q 28 48 31 53" stroke="#00897b" stroke-width="0.7" opacity="0.45" fill="none"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <path d="M 70 56 Q 82 48 84 40 Q 85 34 80 36 Q 74 48 68 54 Z"
                              fill="url(#dragon-wing-kid)" stroke="#00bfa5" stroke-width="1.4"/>
                        <path d="M 78 40 Q 76 46 72 52" stroke="#00897b" stroke-width="0.8" opacity="0.55" fill="none"/>
                        <path d="M 74 42 Q 72 48 69 53" stroke="#00897b" stroke-width="0.7" opacity="0.45" fill="none"/>
                    </g>
                    <!-- Body -->
                    <g class="tm-animate-body">
                        <ellipse cx="50" cy="66" rx="28" ry="24" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="2.4"/>
                        <ellipse cx="40" cy="56" rx="9" ry="5" fill="#fff" opacity="0.18"/>
                        <!-- Scale arcs -->
                        <path d="M 32 58 Q 36 56 40 58" stroke="#00897b" stroke-width="0.9" fill="none" opacity="0.4"/>
                        <path d="M 34 64 Q 38 62 42 64" stroke="#00897b" stroke-width="0.9" fill="none" opacity="0.35"/>
                        <path d="M 60 58 Q 64 56 68 58" stroke="#00897b" stroke-width="0.9" fill="none" opacity="0.4"/>
                        <path d="M 58 64 Q 62 62 66 64" stroke="#00897b" stroke-width="0.9" fill="none" opacity="0.35"/>
                        <circle cx="36" cy="70" r="1.3" fill="#00897b" opacity="0.3"/>
                        <circle cx="64" cy="70" r="1.3" fill="#00897b" opacity="0.3"/>
                        <!-- Belly plates -->
                        <ellipse cx="50" cy="69" rx="17" ry="15" fill="url(#dragon-belly)"/>
                        <path d="M 38 62 Q 50 64.5 62 62" stroke="#81d4fa" stroke-width="1.1" fill="none" opacity="0.75"/>
                        <path d="M 36 68 Q 50 71 64 68" stroke="#81d4fa" stroke-width="1.1" fill="none" opacity="0.7"/>
                        <path d="M 38 74 Q 50 77 62 74" stroke="#81d4fa" stroke-width="1.1" fill="none" opacity="0.65"/>
                        <!-- Spines -->
                        <path d="M 48 48 L 46 55 L 50 55 Z" fill="#ff6090" stroke="#c2185b" stroke-width="0.8"/>
                        <path d="M 52 48 L 50 55 L 54 55 Z" fill="#ff6090" stroke="#c2185b" stroke-width="0.8"/>
                        <path d="M 44 56 L 42 62 L 46 62 Z" fill="#ff80ab" stroke="#e91e63" stroke-width="0.7"/>
                        <path d="M 56 56 L 54 62 L 58 62 Z" fill="#ff80ab" stroke="#e91e63" stroke-width="0.7"/>
                    </g>
                    <!-- Arms -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="25" cy="62" rx="7.5" ry="10" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="1.7"/>
                        <ellipse cx="23" cy="57" rx="2.8" ry="2" fill="#fff" opacity="0.22"/>
                        <path d="M 21 70 L 18 74 M 24 71 L 23 75 M 28 70 L 28 74" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="75" cy="62" rx="7.5" ry="10" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="1.7"/>
                        <ellipse cx="77" cy="57" rx="2.8" ry="2" fill="#fff" opacity="0.22"/>
                        <path d="M 72 70 L 72 74 M 75 71 L 76 75 M 79 70 L 82 74" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <!-- Head -->
                    <ellipse cx="50" cy="34" rx="22" ry="20" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="2.4"/>
                    <ellipse cx="42" cy="26" rx="8" ry="4.5" fill="#fff" opacity="0.18"/>
                    <!-- Horns -->
                    <path d="M 34 26 Q 30 18 26 15 Q 24 13 28 16 L 34 24 Z" fill="url(#dragon-horn-kid)" stroke="#c2185b" stroke-width="1.3"/>
                    <path d="M 66 26 Q 70 18 74 15 Q 76 13 72 16 L 66 24 Z" fill="url(#dragon-horn-kid)" stroke="#c2185b" stroke-width="1.3"/>
                    <path d="M 29 17 L 31 20" stroke="#fff" stroke-width="1" opacity="0.45" stroke-linecap="round"/>
                    <path d="M 71 17 L 69 20" stroke="#fff" stroke-width="1" opacity="0.45" stroke-linecap="round"/>
                    <!-- Snout -->
                    <ellipse cx="50" cy="42" rx="12" ry="8" fill="url(#dragon-belly)" stroke="#4fc3f7" stroke-width="0.7"/>
                    <path d="M 42 40 Q 50 42 58 40" stroke="#81d4fa" stroke-width="0.8" fill="none" opacity="0.6"/>
                    <ellipse cx="46" cy="44" rx="2.2" ry="1.6" fill="#00897b"/>
                    <ellipse cx="54" cy="44" rx="2.2" ry="1.6" fill="#00897b"/>
                    <circle cx="45.5" cy="43.4" r="0.55" fill="#fff" opacity="0.45"/>
                    <circle cx="53.5" cy="43.4" r="0.55" fill="#fff" opacity="0.45"/>
                    <circle cx="33" cy="40" r="4.5" fill="url(#dragon-cheek-kid)"/>
                    <circle cx="67" cy="40" r="4.5" fill="url(#dragon-cheek-kid)"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="41" cy="31" rx="7.2" ry="8.2" fill="#fff" stroke="#00bfa5" stroke-width="1.4"/>
                        <ellipse cx="59" cy="31" rx="7.2" ry="8.2" fill="#fff" stroke="#00bfa5" stroke-width="1.4"/>
                        <ellipse cx="42" cy="32.2" rx="4" ry="5" fill="url(#dragon-iris-kid)"/>
                        <ellipse cx="60" cy="32.2" rx="4" ry="5" fill="url(#dragon-iris-kid)"/>
                        <ellipse cx="42" cy="32.5" rx="2" ry="2.8" fill="#001a16"/>
                        <ellipse cx="60" cy="32.5" rx="2" ry="2.8" fill="#001a16"/>
                        <circle cx="43.6" cy="29.5" r="2.1" fill="#fff"/>
                        <circle cx="61.6" cy="29.5" r="2.1" fill="#fff"/>
                        <circle cx="39.8" cy="34.5" r="0.9" fill="#4dd0e1" opacity="0.7"/>
                        <circle cx="57.8" cy="34.5" r="0.9" fill="#4dd0e1" opacity="0.7"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 34 32 Q 41 28 48 32" stroke="#00897b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        <path d="M 52 32 Q 59 28 66 32" stroke="#00897b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    </g>
                    <path class="tm-mascot-mouth-happy" d="M 42 49 Q 50 54 58 49" stroke="#00897b" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 51 Q 50 46 58 51" stroke="#00897b" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Feet -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="39" cy="87" rx="7.5" ry="5" fill="url(#dragon-scales-shade)" stroke="#00bfa5" stroke-width="1.6"/>
                        <path d="M 34 88 L 32 92 M 39 89 L 39 93 M 44 88 L 46 92" stroke="#00695c" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="61" cy="87" rx="7.5" ry="5" fill="url(#dragon-scales-shade)" stroke="#00bfa5" stroke-width="1.6"/>
                        <path d="M 54 88 L 52 92 M 61 89 L 61 93 M 66 88 L 68 92" stroke="#00695c" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                </g>

                <!-- DRAGON TEEN -->
                <g id="tm-mascot-evo2-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="teen-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#80deea;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#26c6da;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0097a7;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="teen-dragon-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#00acc1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="teen-dragon-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:0.92" />
                            <stop offset="55%" style="stop-color:#4dd0e1;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#26c6da;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="teen-dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f5fdff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b2ebf2;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="teen-dragon-horn" x1="0%" y1="100%" x2="30%" y2="0%">
                            <stop offset="0%" style="stop-color:#c2185b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff80ab;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="teen-dragon-iris" cx="38%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#00838f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00363a;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="teen-ember" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffab40;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff6d00;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="50" cy="93" rx="34" ry="6" fill="#1a1a1a" opacity="0.22"/>
                    <!-- Tail -->
                    <g class="tm-animate-tail">
                        <path d="M 72 74 Q 90 80 95 70 Q 98 62 92 56 Q 88 52 84 56"
                              fill="url(#teen-dragon-scales)" stroke="#00838f" stroke-width="2.1"/>
                        <path d="M 84 64 Q 90 58 94 64" fill="none" stroke="#00acc1" stroke-width="1" opacity="0.5"/>
                        <path d="M 86 70 Q 92 66 94 72" fill="none" stroke="#00acc1" stroke-width="0.85" opacity="0.4"/>
                        <path d="M 90 56 L 96 52 L 93 58 Z" fill="#ff6090" stroke="#c2185b" stroke-width="0.8"/>
                        <path d="M 86 62 L 91 59 L 88 65 Z" fill="#ff80ab" stroke="#e91e63" stroke-width="0.7"/>
                        <path d="M 82 68 L 87 66 L 84 71 Z" fill="#f48fb1" stroke="#e91e63" stroke-width="0.6"/>
                    </g>
                    <!-- Wings -->
                    <g class="tm-animate-wing-left">
                        <path d="M 28 54 Q 12 44 8 30 Q 6 20 14 22 Q 20 36 26 48 Q 28 52 30 56 Z"
                              fill="url(#teen-dragon-wing)" stroke="#00838f" stroke-width="1.7"/>
                        <path d="M 14 28 Q 18 36 24 46" stroke="#006064" stroke-width="1" opacity="0.55" fill="none"/>
                        <path d="M 18 30 Q 22 40 27 50" stroke="#006064" stroke-width="0.9" opacity="0.45" fill="none"/>
                        <path d="M 22 34 Q 25 42 29 52" stroke="#006064" stroke-width="0.75" opacity="0.35" fill="none"/>
                        <path d="M 12 26 L 10 24" stroke="#00838f" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <path d="M 72 54 Q 88 44 92 30 Q 94 20 86 22 Q 80 36 74 48 Q 72 52 70 56 Z"
                              fill="url(#teen-dragon-wing)" stroke="#00838f" stroke-width="1.7"/>
                        <path d="M 86 28 Q 82 36 76 46" stroke="#006064" stroke-width="1" opacity="0.55" fill="none"/>
                        <path d="M 82 30 Q 78 40 73 50" stroke="#006064" stroke-width="0.9" opacity="0.45" fill="none"/>
                        <path d="M 78 34 Q 75 42 71 52" stroke="#006064" stroke-width="0.75" opacity="0.35" fill="none"/>
                        <path d="M 88 26 L 90 24" stroke="#00838f" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <!-- Body -->
                    <g class="tm-animate-body">
                        <ellipse cx="50" cy="68" rx="27" ry="23" fill="url(#teen-dragon-scales)" stroke="#00838f" stroke-width="2.4"/>
                        <ellipse cx="40" cy="58" rx="8" ry="4.5" fill="#fff" opacity="0.16"/>
                        <path d="M 30 58 Q 34 55 38 58" stroke="#006064" stroke-width="1" fill="none" opacity="0.4"/>
                        <path d="M 32 64 Q 36 61 40 64" stroke="#006064" stroke-width="1" fill="none" opacity="0.35"/>
                        <path d="M 62 58 Q 66 55 70 58" stroke="#006064" stroke-width="1" fill="none" opacity="0.4"/>
                        <path d="M 60 64 Q 64 61 68 64" stroke="#006064" stroke-width="1" fill="none" opacity="0.35"/>
                        <circle cx="34" cy="72" r="1.4" fill="#006064" opacity="0.3"/>
                        <circle cx="66" cy="72" r="1.4" fill="#006064" opacity="0.3"/>
                        <ellipse cx="50" cy="71" rx="16" ry="14" fill="url(#teen-dragon-belly)"/>
                        <path d="M 38 64 Q 50 66.5 62 64" stroke="#4dd0e1" stroke-width="1.15" fill="none" opacity="0.7"/>
                        <path d="M 36 70 Q 50 73 64 70" stroke="#4dd0e1" stroke-width="1.15" fill="none" opacity="0.65"/>
                        <path d="M 38 76 Q 50 79 62 76" stroke="#4dd0e1" stroke-width="1.1" fill="none" opacity="0.6"/>
                        <!-- Ridge spines -->
                        <path d="M 46 50 L 44 58 L 48 58 Z" fill="#ff6090" stroke="#ad1457" stroke-width="0.9"/>
                        <path d="M 50 48 L 48 56 L 52 56 Z" fill="#e91e63" stroke="#ad1457" stroke-width="0.9"/>
                        <path d="M 54 50 L 52 58 L 56 58 Z" fill="#ff6090" stroke="#ad1457" stroke-width="0.9"/>
                        <path d="M 42 60 L 40 66 L 44 66 Z" fill="#ff80ab" stroke="#c2185b" stroke-width="0.7"/>
                        <path d="M 58 60 L 56 66 L 60 66 Z" fill="#ff80ab" stroke="#c2185b" stroke-width="0.7"/>
                    </g>
                    <!-- Arms -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="26" cy="64" rx="7.5" ry="11" fill="url(#teen-dragon-scales)" stroke="#00838f" stroke-width="1.7"/>
                        <path d="M 22 72 L 19 77 M 25 73 L 24 78 M 29 72 L 29 77" stroke="#006064" stroke-width="1.6" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="74" cy="64" rx="7.5" ry="11" fill="url(#teen-dragon-scales)" stroke="#00838f" stroke-width="1.7"/>
                        <path d="M 71 72 L 71 77 M 75 73 L 76 78 M 78 72 L 81 77" stroke="#006064" stroke-width="1.6" stroke-linecap="round"/>
                    </g>
                    <!-- Head -->
                    <ellipse cx="50" cy="31" rx="21" ry="18.5" fill="url(#teen-dragon-scales)" stroke="#00838f" stroke-width="2.4"/>
                    <ellipse cx="42" cy="24" rx="7" ry="4" fill="#fff" opacity="0.16"/>
                    <!-- Jaw / snout -->
                    <ellipse cx="50" cy="40" rx="12" ry="7.5" fill="url(#teen-dragon-belly)" stroke="#26c6da" stroke-width="0.8"/>
                    <path d="M 40 37 Q 50 39.5 60 37" stroke="#4dd0e1" stroke-width="0.85" fill="none" opacity="0.55"/>
                    <ellipse cx="46" cy="42" rx="2.3" ry="1.7" fill="#006064"/>
                    <ellipse cx="54" cy="42" rx="2.3" ry="1.7" fill="#006064"/>
                    <circle cx="50" cy="43" r="5" fill="url(#teen-ember)" opacity="0.7"/>
                    <!-- Horns -->
                    <path d="M 35 22 Q 28 14 22 10 Q 20 8 24 11 L 34 20 Z" fill="url(#teen-dragon-horn)" stroke="#ad1457" stroke-width="1.4"/>
                    <path d="M 65 22 Q 72 14 78 10 Q 80 8 76 11 L 66 20 Z" fill="url(#teen-dragon-horn)" stroke="#ad1457" stroke-width="1.4"/>
                    <path d="M 26 12 L 29 16" stroke="#fff" stroke-width="1.1" opacity="0.4" stroke-linecap="round"/>
                    <path d="M 74 12 L 71 16" stroke="#fff" stroke-width="1.1" opacity="0.4" stroke-linecap="round"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="41" cy="29" rx="6.5" ry="7.5" fill="#fff" stroke="#00838f" stroke-width="1.4"/>
                        <ellipse cx="59" cy="29" rx="6.5" ry="7.5" fill="#fff" stroke="#00838f" stroke-width="1.4"/>
                        <ellipse cx="41.8" cy="30" rx="3.6" ry="4.6" fill="url(#teen-dragon-iris)"/>
                        <ellipse cx="59.8" cy="30" rx="3.6" ry="4.6" fill="url(#teen-dragon-iris)"/>
                        <ellipse cx="42" cy="30.3" rx="1.8" ry="2.6" fill="#001416"/>
                        <ellipse cx="60" cy="30.3" rx="1.8" ry="2.6" fill="#001416"/>
                        <circle cx="43.4" cy="27.5" r="1.9" fill="#fff"/>
                        <circle cx="61.4" cy="27.5" r="1.9" fill="#fff"/>
                        <circle cx="39.6" cy="32.5" r="0.85" fill="#4dd0e1" opacity="0.75"/>
                        <circle cx="57.6" cy="32.5" r="0.85" fill="#4dd0e1" opacity="0.75"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 35 29 Q 41 25 47 29" stroke="#006064" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        <path d="M 53 29 Q 59 25 65 29" stroke="#006064" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    </g>
                    <path class="tm-mascot-mouth-happy" d="M 41 46 Q 50 51 59 46" stroke="#006064" stroke-width="2.1" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 41 48 Q 50 43 59 48" stroke="#006064" stroke-width="2.1" fill="none" stroke-linecap="round"/>
                    <path d="M 46 47 L 45 50" stroke="#e0f7fa" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M 54 47 L 55 50" stroke="#e0f7fa" stroke-width="1.6" stroke-linecap="round"/>
                    <!-- Feet -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="39" cy="88" rx="7.5" ry="5.2" fill="url(#teen-dragon-shade)" stroke="#00838f" stroke-width="1.6"/>
                        <path d="M 34 89 L 31 93 M 39 90 L 39 94 M 44 89 L 47 93" stroke="#004d40" stroke-width="1.6" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="61" cy="88" rx="7.5" ry="5.2" fill="url(#teen-dragon-shade)" stroke="#00838f" stroke-width="1.6"/>
                        <path d="M 54 89 L 51 93 M 61 90 L 61 94 M 66 89 L 69 93" stroke="#004d40" stroke-width="1.6" stroke-linecap="round"/>
                    </g>
                </g>

                <!-- DRAGON ADULT -->
                <g id="tm-mascot-evo3-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="adult-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#4db6ac;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#00897b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#004d40;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="adult-dragon-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#00796b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00251a;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="adult-dragon-wing" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#80cbc4;stop-opacity:0.95" />
                            <stop offset="50%" style="stop-color:#26a69a;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#00695c;stop-opacity:0.65" />
                        </linearGradient>
                        <linearGradient id="adult-dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f2f1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#80cbc4;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="adult-dragon-horn" x1="0%" y1="100%" x2="25%" y2="0%">
                            <stop offset="0%" style="stop-color:#880e4f;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e91e63;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f8bbd0;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="adult-dragon-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff8f00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="adult-ember" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffab40;stop-opacity:0.7" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="50" cy="95" rx="38" ry="5.5" fill="#1a1a1a" opacity="0.28"/>
                    <!-- Wings -->
                    <g class="tm-animate-wing-left">
                        <path d="M 22 52 Q 6 40 4 24 Q 3 12 14 14 Q 18 28 22 40 Q 24 48 28 56 Z"
                              fill="url(#adult-dragon-wing)" stroke="#004d40" stroke-width="2"/>
                        <path d="M 10 22 Q 14 32 20 44" stroke="#00332c" stroke-width="1.15" opacity="0.55" fill="none"/>
                        <path d="M 14 24 Q 18 36 24 48" stroke="#00332c" stroke-width="1" opacity="0.45" fill="none"/>
                        <path d="M 18 28 Q 21 38 26 50" stroke="#00332c" stroke-width="0.85" opacity="0.35" fill="none"/>
                        <path d="M 8 18 L 5 14" stroke="#004d40" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M 12 16 L 10 12" stroke="#004d40" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <path d="M 78 52 Q 94 40 96 24 Q 97 12 86 14 Q 82 28 78 40 Q 76 48 72 56 Z"
                              fill="url(#adult-dragon-wing)" stroke="#004d40" stroke-width="2"/>
                        <path d="M 90 22 Q 86 32 80 44" stroke="#00332c" stroke-width="1.15" opacity="0.55" fill="none"/>
                        <path d="M 86 24 Q 82 36 76 48" stroke="#00332c" stroke-width="1" opacity="0.45" fill="none"/>
                        <path d="M 82 28 Q 79 38 74 50" stroke="#00332c" stroke-width="0.85" opacity="0.35" fill="none"/>
                        <path d="M 92 18 L 95 14" stroke="#004d40" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M 88 16 L 90 12" stroke="#004d40" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <!-- Tail -->
                    <g class="tm-animate-tail">
                        <path d="M 74 72 Q 92 78 98 68 Q 102 58 96 50 Q 92 46 86 50"
                              fill="url(#adult-dragon-scales)" stroke="#00332c" stroke-width="2.3"/>
                        <path d="M 86 60 Q 93 54 97 60" fill="none" stroke="#26a69a" stroke-width="1.1" opacity="0.45"/>
                        <path d="M 88 66 Q 94 62 97 68" fill="none" stroke="#26a69a" stroke-width="0.9" opacity="0.35"/>
                        <path d="M 94 50 L 100 46 L 96 54 Z" fill="#d81b60" stroke="#880e4f" stroke-width="0.9"/>
                        <path d="M 90 56 L 96 54 L 92 60 Z" fill="#e91e63" stroke="#ad1457" stroke-width="0.8"/>
                        <path d="M 86 62 L 91 61 L 88 66 Z" fill="#ec407a" stroke="#c2185b" stroke-width="0.7"/>
                    </g>
                    <!-- Body -->
                    <g class="tm-animate-body">
                        <ellipse cx="50" cy="66" rx="29" ry="24" fill="url(#adult-dragon-scales)" stroke="#00332c" stroke-width="2.6"/>
                        <ellipse cx="40" cy="56" rx="9" ry="5" fill="#fff" opacity="0.12"/>
                        <path d="M 28 56 Q 33 52 38 56" stroke="#004d40" stroke-width="1.1" fill="none" opacity="0.4"/>
                        <path d="M 30 62 Q 35 58 40 62" stroke="#004d40" stroke-width="1.1" fill="none" opacity="0.35"/>
                        <path d="M 62 56 Q 67 52 72 56" stroke="#004d40" stroke-width="1.1" fill="none" opacity="0.4"/>
                        <path d="M 60 62 Q 65 58 70 62" stroke="#004d40" stroke-width="1.1" fill="none" opacity="0.35"/>
                        <circle cx="32" cy="70" r="1.5" fill="#004d40" opacity="0.3"/>
                        <circle cx="68" cy="70" r="1.5" fill="#004d40" opacity="0.3"/>
                        <!-- Armored belly -->
                        <ellipse cx="50" cy="69" rx="18" ry="16" fill="url(#adult-dragon-belly)"/>
                        <path d="M 36 60 Q 50 62.5 64 60" stroke="#4db6ac" stroke-width="1.4" fill="none" opacity="0.8"/>
                        <path d="M 34 66 Q 50 69 66 66" stroke="#4db6ac" stroke-width="1.4" fill="none" opacity="0.75"/>
                        <path d="M 36 72 Q 50 75 64 72" stroke="#4db6ac" stroke-width="1.35" fill="none" opacity="0.7"/>
                        <path d="M 38 78 Q 50 81 62 78" stroke="#4db6ac" stroke-width="1.3" fill="none" opacity="0.65"/>
                        <!-- Spines -->
                        <path d="M 44 48 L 42 56 L 46 56 Z" fill="#c2185b" stroke="#880e4f" stroke-width="1"/>
                        <path d="M 50 46 L 48 54 L 52 54 Z" fill="#d81b60" stroke="#880e4f" stroke-width="1"/>
                        <path d="M 56 48 L 54 56 L 58 56 Z" fill="#c2185b" stroke="#880e4f" stroke-width="1"/>
                        <path d="M 40 58 L 38 65 L 42 65 Z" fill="#ec407a" stroke="#ad1457" stroke-width="0.8"/>
                        <path d="M 60 58 L 58 65 L 62 65 Z" fill="#ec407a" stroke="#ad1457" stroke-width="0.8"/>
                    </g>
                    <!-- Arms -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="24" cy="62" rx="8.5" ry="12.5" fill="url(#adult-dragon-scales)" stroke="#00332c" stroke-width="2"/>
                        <ellipse cx="22" cy="56" rx="3" ry="2" fill="#fff" opacity="0.12"/>
                        <path d="M 19 72 L 16 78 M 23 73 L 22 79 M 27 73 L 27 79 M 30 72 L 32 78" stroke="#00251a" stroke-width="1.8" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="76" cy="62" rx="8.5" ry="12.5" fill="url(#adult-dragon-scales)" stroke="#00332c" stroke-width="2"/>
                        <ellipse cx="78" cy="56" rx="3" ry="2" fill="#fff" opacity="0.12"/>
                        <path d="M 70 72 L 68 78 M 73 73 L 74 79 M 77 73 L 77 79 M 81 72 L 84 78" stroke="#00251a" stroke-width="1.8" stroke-linecap="round"/>
                    </g>
                    <!-- Head -->
                    <ellipse cx="50" cy="28" rx="22" ry="20" fill="url(#adult-dragon-scales)" stroke="#00332c" stroke-width="2.5"/>
                    <ellipse cx="42" cy="20" rx="8" ry="4.5" fill="#fff" opacity="0.12"/>
                    <ellipse cx="50" cy="37" rx="14" ry="9.5" fill="url(#adult-dragon-belly)" stroke="#26a69a" stroke-width="0.9"/>
                    <path d="M 40 34 Q 50 36.5 60 34" stroke="#4db6ac" stroke-width="0.9" fill="none" opacity="0.55"/>
                    <ellipse cx="45" cy="39" rx="2.6" ry="2" fill="#00251a"/>
                    <ellipse cx="55" cy="39" rx="2.6" ry="2" fill="#00251a"/>
                    <circle cx="50" cy="40" r="6.5" fill="url(#adult-ember)"/>
                    <!-- Horns -->
                    <path d="M 33 18 Q 24 8 18 2 Q 16 0 20 3 L 32 16 Z" fill="url(#adult-dragon-horn)" stroke="#880e4f" stroke-width="1.6"/>
                    <path d="M 67 18 Q 76 8 82 2 Q 84 0 80 3 L 68 16 Z" fill="url(#adult-dragon-horn)" stroke="#880e4f" stroke-width="1.6"/>
                    <path d="M 22 5 L 26 10" stroke="#fff" stroke-width="1.2" opacity="0.4" stroke-linecap="round"/>
                    <path d="M 78 5 L 74 10" stroke="#fff" stroke-width="1.2" opacity="0.4" stroke-linecap="round"/>
                    <path d="M 36 14 L 34 10 L 38 12 Z" fill="#f48fb1" opacity="0.8"/>
                    <path d="M 64 14 L 66 10 L 62 12 Z" fill="#f48fb1" opacity="0.8"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="40" cy="26" rx="6.5" ry="7.5" fill="#fff8e1" stroke="#00332c" stroke-width="1.5"/>
                        <ellipse cx="60" cy="26" rx="6.5" ry="7.5" fill="#fff8e1" stroke="#00332c" stroke-width="1.5"/>
                        <ellipse cx="40.5" cy="26.5" rx="3.4" ry="4.5" fill="url(#adult-dragon-iris)"/>
                        <ellipse cx="60.5" cy="26.5" rx="3.4" ry="4.5" fill="url(#adult-dragon-iris)"/>
                        <ellipse cx="40.5" cy="27" rx="1.6" ry="2.6" fill="#1a0a00"/>
                        <ellipse cx="60.5" cy="27" rx="1.6" ry="2.6" fill="#1a0a00"/>
                        <circle cx="42" cy="24" r="1.7" fill="#fffde7"/>
                        <circle cx="62" cy="24" r="1.7" fill="#fffde7"/>
                        <circle cx="38.8" cy="29.2" r="0.7" fill="#ffecb3" opacity="0.8"/>
                        <circle cx="58.8" cy="29.2" r="0.7" fill="#ffecb3" opacity="0.8"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 34 26 Q 40 22 46 26" stroke="#00332c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 54 26 Q 60 22 66 26" stroke="#00332c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <path class="tm-mascot-mouth-happy" d="M 39 44 Q 50 49 61 44" stroke="#00332c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 39 46 Q 50 41 61 46" stroke="#00332c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                    <path d="M 46 45 L 45 49" stroke="#e0f2f1" stroke-width="2" stroke-linecap="round"/>
                    <path d="M 54 45 L 55 49" stroke="#e0f2f1" stroke-width="2" stroke-linecap="round"/>
                    <!-- Feet -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="38" cy="89" rx="8.5" ry="6" fill="url(#adult-dragon-shade)" stroke="#00332c" stroke-width="1.8"/>
                        <path d="M 32 90 L 29 95 M 37 91 L 37 96 M 42 91 L 42 96 M 47 90 L 50 95" stroke="#001a14" stroke-width="1.8" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="62" cy="89" rx="8.5" ry="6" fill="url(#adult-dragon-shade)" stroke="#00332c" stroke-width="1.8"/>
                        <path d="M 54 90 L 51 95 M 60 91 L 60 96 M 65 91 L 65 96 M 70 90 L 73 95" stroke="#001a14" stroke-width="1.8" stroke-linecap="round"/>
                    </g>
                </g>

                <!-- DRAGON MIDDLE AGE — wizard dragon -->
                <g id="tm-mascot-evo4-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="wizard-robe" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#9575cd;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4527a0;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="wizard-robe-fold" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#5e35b1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#5e35b1;stop-opacity:0" />
                        </linearGradient>
                        <linearGradient id="mid-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#80cbc4;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#26a69a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00695c;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="mid-dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f2f1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b2dfdb;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="magic-orb">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#ce93d8;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#7b1fa2;stop-opacity:0.35" />
                        </radialGradient>
                        <linearGradient id="mid-dragon-horn" x1="0%" y1="100%" x2="20%" y2="0%">
                            <stop offset="0%" style="stop-color:#6a1b9a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ea80fc;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="mid-dragon-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="mid-dragon-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#d1c4e9;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7e57c2;stop-opacity:0.55" />
                        </linearGradient>
                    </defs>
                    <ellipse cx="50" cy="98" rx="30" ry="4.5" fill="#1a1a1a" opacity="0.25"/>
                    <!-- Soft wing tips behind robe -->
                    <g class="tm-animate-wing-left">
                        <path d="M 28 58 Q 16 50 12 40 Q 10 34 16 36 Q 22 46 30 56 Z"
                              fill="url(#mid-dragon-wing)" stroke="#5e35b1" stroke-width="1.2"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <path d="M 72 58 Q 84 50 88 40 Q 90 34 84 36 Q 78 46 70 56 Z"
                              fill="url(#mid-dragon-wing)" stroke="#5e35b1" stroke-width="1.2"/>
                    </g>
                    <!-- Tail peeking from robe -->
                    <g class="tm-animate-tail">
                        <path d="M 68 78 Q 82 84 86 76 Q 88 70 82 68"
                              fill="url(#mid-dragon-scales)" stroke="#00695c" stroke-width="1.6"/>
                        <circle cx="84" cy="70" r="3" fill="#ea80fc" stroke="#6a1b9a" stroke-width="0.8"/>
                    </g>
                    <!-- Robe body -->
                    <g class="tm-animate-body">
                        <path d="M 34 54 L 28 94 Q 30 98 38 96 L 42 62 Z" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="1.4"/>
                        <path d="M 66 54 L 72 94 Q 70 98 62 96 L 58 62 Z" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="1.4"/>
                        <ellipse cx="50" cy="70" rx="23" ry="28" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="2"/>
                        <path d="M 38 58 Q 42 78 40 92" stroke="#4527a0" stroke-width="2" fill="none" opacity="0.35"/>
                        <path d="M 62 58 Q 58 78 60 92" stroke="#4527a0" stroke-width="2" fill="none" opacity="0.35"/>
                        <path d="M 45 62 Q 50 64 55 62" stroke="#b39ddb" stroke-width="1" fill="none" opacity="0.5"/>
                        <!-- Stars / moons -->
                        <circle cx="44" cy="66" r="2.2" fill="#ffd54f"/>
                        <circle cx="44" cy="66" r="0.8" fill="#fff8e1"/>
                        <path d="M 56 74 L 58 78 L 56 82 L 54 78 Z" fill="#fff" opacity="0.75"/>
                        <circle cx="52" cy="84" r="1.8" fill="#ffd54f" opacity="0.85"/>
                        <path d="M 40 80 Q 42 78 44 80" stroke="#fff" stroke-width="1" fill="none" opacity="0.55"/>
                        <!-- Belt -->
                        <rect x="34" y="64" width="32" height="3.5" rx="1" fill="#8d6e63" stroke="#5d4037" stroke-width="0.9"/>
                        <circle cx="42" cy="65.8" r="2.4" fill="#6d4c41" stroke="#3e2723" stroke-width="0.6"/>
                        <circle cx="50" cy="65.8" r="3" fill="#a1887f" stroke="#5d4037" stroke-width="0.7"/>
                        <circle cx="58" cy="65.8" r="2.4" fill="#6d4c41" stroke="#3e2723" stroke-width="0.6"/>
                        <circle cx="50" cy="65.5" r="1.1" fill="#ffd54f"/>
                    </g>
                    <!-- Staff -->
                    <line x1="20" y1="60" x2="16" y2="22" stroke="#6d4c41" stroke-width="3.2" stroke-linecap="round"/>
                    <line x1="20" y1="60" x2="16" y2="22" stroke="#a1887f" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
                    <circle cx="16" cy="19" r="5.5" fill="url(#magic-orb)"/>
                    <circle cx="16" cy="19" r="3.2" fill="#f3e5f5" opacity="0.85"/>
                    <circle cx="17.2" cy="17.5" r="1.4" fill="#fff"/>
                    <circle cx="13" cy="26" r="1.1" fill="#e1bee7" opacity="0.9" class="tm-sparkle"/>
                    <circle cx="19" cy="24" r="0.9" fill="#ce93d8" opacity="0.85" class="tm-sparkle"/>
                    <circle cx="15" cy="30" r="1.2" fill="#ba68c8" opacity="0.8" class="tm-sparkle"/>
                    <!-- Arms -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="24" cy="62" rx="6.5" ry="11" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="1.4"/>
                        <ellipse cx="22" cy="70" rx="4.2" ry="5" fill="url(#mid-dragon-scales)" stroke="#00695c" stroke-width="1.1"/>
                        <path d="M 19 73 L 17 76 M 22 74 L 21 77 M 25 73 L 25 76" stroke="#004d40" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="76" cy="62" rx="6.5" ry="11" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="1.4"/>
                        <ellipse cx="78" cy="70" rx="4.2" ry="5" fill="url(#mid-dragon-scales)" stroke="#00695c" stroke-width="1.1"/>
                        <path d="M 75 73 L 75 76 M 78 74 L 79 77 M 81 73 L 83 76" stroke="#004d40" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <!-- Dragon head under hat -->
                    <ellipse cx="50" cy="36" rx="17" ry="15" fill="url(#mid-dragon-scales)" stroke="#00695c" stroke-width="1.8"/>
                    <ellipse cx="43" cy="30" rx="6" ry="3.5" fill="#fff" opacity="0.14"/>
                    <ellipse cx="50" cy="42" rx="10" ry="6" fill="url(#mid-dragon-belly)" stroke="#4db6ac" stroke-width="0.7"/>
                    <ellipse cx="47" cy="43.5" rx="1.8" ry="1.3" fill="#004d40"/>
                    <ellipse cx="53" cy="43.5" rx="1.8" ry="1.3" fill="#004d40"/>
                    <!-- Aged horn ridges -->
                    <path d="M 36 28 Q 30 20 26 16 Q 24 14 28 17 L 36 26 Z" fill="url(#mid-dragon-horn)" stroke="#4a148c" stroke-width="1.2"/>
                    <path d="M 64 28 Q 70 20 74 16 Q 76 14 72 17 L 64 26 Z" fill="url(#mid-dragon-horn)" stroke="#4a148c" stroke-width="1.2"/>
                    <!-- Wizard hat -->
                    <path d="M 34 30 L 50 2 L 66 30 Z" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="1.8"/>
                    <path d="M 42 18 Q 50 10 58 18" stroke="#b39ddb" stroke-width="1.2" fill="none" opacity="0.5"/>
                    <ellipse cx="50" cy="30" rx="18" ry="5" fill="url(#wizard-robe)" stroke="#311b92" stroke-width="1.8"/>
                    <rect x="34" y="28.5" width="32" height="3.2" rx="1" fill="#ffd54f" stroke="#f9a825" stroke-width="0.8"/>
                    <circle cx="42" cy="30.1" r="1.1" fill="#6a1b9a"/>
                    <circle cx="50" cy="30.1" r="1.1" fill="#6a1b9a"/>
                    <circle cx="58" cy="30.1" r="1.1" fill="#6a1b9a"/>
                    <!-- Whiskers / mustache -->
                    <path d="M 44 44 Q 36 46 32 43" stroke="#5d4037" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                    <path d="M 56 44 Q 64 46 68 43" stroke="#5d4037" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                    <path d="M 46 47 Q 50 50 54 47 L 53 52 Q 50 54 47 52 Z" fill="#6d4c41" stroke="#4e342e" stroke-width="0.7"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="35" rx="5.2" ry="5.5" fill="#fff" stroke="#00695c" stroke-width="1.1"/>
                        <ellipse cx="57" cy="35" rx="5.2" ry="5.5" fill="#fff" stroke="#00695c" stroke-width="1.1"/>
                        <ellipse cx="43.5" cy="35.8" rx="2.8" ry="3.1" fill="url(#mid-dragon-iris)"/>
                        <ellipse cx="57.5" cy="35.8" rx="2.8" ry="3.1" fill="url(#mid-dragon-iris)"/>
                        <ellipse cx="43.5" cy="36" rx="1.3" ry="1.7" fill="#12052a"/>
                        <ellipse cx="57.5" cy="36" rx="1.3" ry="1.7" fill="#12052a"/>
                        <circle cx="44.6" cy="34" r="1.2" fill="#fff"/>
                        <circle cx="58.6" cy="34" r="1.2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 38 35 Q 43 32 48 35" stroke="#004d40" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 35 Q 57 32 62 35" stroke="#004d40" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <path class="tm-mascot-mouth-happy" d="M 44 48 Q 50 51 56 48" stroke="#004d40" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 50 Q 50 46 56 50" stroke="#004d40" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                    <!-- Feet under robe -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="40" cy="95" rx="6" ry="3.2" fill="url(#mid-dragon-scales)" stroke="#00695c" stroke-width="1.1"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="60" cy="95" rx="6" ry="3.2" fill="url(#mid-dragon-scales)" stroke="#00695c" stroke-width="1.1"/>
                    </g>
                </g>

                <!-- DRAGON OLD — sage dragon -->
                <g id="tm-mascot-evo5-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="sage-robe" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f5f7fa;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#cfd8dc;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#90a4ae;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="wisdom-aura">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.55" />
                            <stop offset="50%" style="stop-color:#80deea;stop-opacity:0.22" />
                            <stop offset="100%" style="stop-color:#26c6da;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="old-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b2dfdb;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#80cbc4;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4db6ac;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="old-dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e0f2f1;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="old-dragon-horn" x1="0%" y1="100%" x2="20%" y2="0%">
                            <stop offset="0%" style="stop-color:#546e7a;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#90a4ae;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#eceff1;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="old-dragon-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#01579b;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="old-dragon-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#eceff1;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#90a4ae;stop-opacity:0.5" />
                        </linearGradient>
                    </defs>
                    <ellipse cx="50" cy="55" rx="46" ry="52" fill="url(#wisdom-aura)" class="tm-wisdom-aura"/>
                    <ellipse cx="50" cy="99" rx="28" ry="3.8" fill="#1a1a1a" opacity="0.22"/>
                    <!-- Wings -->
                    <g class="tm-animate-wing-left">
                        <path d="M 30 60 Q 16 52 12 42 Q 10 36 16 38 Q 22 48 32 58 Z"
                              fill="url(#old-dragon-wing)" stroke="#78909c" stroke-width="1.2"/>
                        <path d="M 18 42 Q 22 48 28 54" stroke="#607d8b" stroke-width="0.7" opacity="0.45" fill="none"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <path d="M 70 60 Q 84 52 88 42 Q 90 36 84 38 Q 78 48 68 58 Z"
                              fill="url(#old-dragon-wing)" stroke="#78909c" stroke-width="1.2"/>
                        <path d="M 82 42 Q 78 48 72 54" stroke="#607d8b" stroke-width="0.7" opacity="0.45" fill="none"/>
                    </g>
                    <!-- Tail -->
                    <g class="tm-animate-tail">
                        <path d="M 66 80 Q 80 86 84 78 Q 86 72 80 70"
                              fill="url(#old-dragon-scales)" stroke="#546e7a" stroke-width="1.5"/>
                        <circle cx="82" cy="72" r="2.8" fill="#ffd54f" stroke="#f9a825" stroke-width="0.7"/>
                    </g>
                    <!-- Staff -->
                    <line x1="74" y1="70" x2="78" y2="96" stroke="#5d4037" stroke-width="3" stroke-linecap="round"/>
                    <line x1="74" y1="70" x2="78" y2="96" stroke="#a1887f" stroke-width="1.1" stroke-linecap="round" opacity="0.45"/>
                    <circle cx="73" cy="68" r="4.2" fill="#90a4ae" stroke="#546e7a" stroke-width="1"/>
                    <path d="M 71 66 Q 69 63 72 61 L 75 64 Z" fill="#cfd8dc"/>
                    <circle cx="73.5" cy="67" r="1.2" fill="#ffd54f" opacity="0.8"/>
                    <!-- Robe -->
                    <g class="tm-animate-body">
                        <path d="M 32 56 L 27 94 Q 29 98 36 96 L 40 64 Z" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.4"/>
                        <path d="M 68 56 L 73 94 Q 71 98 64 96 L 60 64 Z" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.4"/>
                        <ellipse cx="50" cy="72" rx="24" ry="27" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.8"/>
                        <path d="M 38 58 Q 42 80 40 92" stroke="#78909c" stroke-width="1.8" fill="none" opacity="0.35"/>
                        <path d="M 62 58 Q 58 80 60 92" stroke="#78909c" stroke-width="1.8" fill="none" opacity="0.35"/>
                        <path d="M 30 56 Q 50 59 70 56" stroke="#ffd54f" stroke-width="2" fill="none"/>
                        <path d="M 32 70 Q 50 73 68 70" stroke="#ffd54f" stroke-width="1.4" fill="none" opacity="0.7"/>
                        <circle cx="44" cy="66" r="1.6" fill="#90a4ae" opacity="0.55"/>
                        <circle cx="56" cy="78" r="1.4" fill="#90a4ae" opacity="0.45"/>
                        <path d="M 48 82 L 50 86 L 52 82" fill="none" stroke="#90a4ae" stroke-width="0.9" opacity="0.5"/>
                    </g>
                    <!-- Arms + scroll -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="30" cy="64" rx="6.2" ry="10" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.3"/>
                        <ellipse cx="28" cy="72" rx="4" ry="4.8" fill="url(#old-dragon-scales)" stroke="#546e7a" stroke-width="1"/>
                        <rect x="20" y="70" width="15" height="8.5" rx="1.5" fill="#f3e5d0" stroke="#bcaaa4" stroke-width="0.9"/>
                        <line x1="22.5" y1="72.5" x2="32.5" y2="72.5" stroke="#8d6e63" stroke-width="0.55"/>
                        <line x1="22.5" y1="74.5" x2="32.5" y2="74.5" stroke="#8d6e63" stroke-width="0.55"/>
                        <line x1="22.5" y1="76.5" x2="30.5" y2="76.5" stroke="#8d6e63" stroke-width="0.55"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="70" cy="64" rx="6.2" ry="10" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.3"/>
                        <ellipse cx="72" cy="72" rx="4" ry="4.8" fill="url(#old-dragon-scales)" stroke="#546e7a" stroke-width="1"/>
                    </g>
                    <!-- Weathered dragon head -->
                    <ellipse cx="50" cy="32" rx="17.5" ry="15.5" fill="url(#old-dragon-scales)" stroke="#546e7a" stroke-width="1.7"/>
                    <ellipse cx="43" cy="26" rx="6" ry="3.2" fill="#fff" opacity="0.16"/>
                    <!-- Wrinkles -->
                    <path d="M 38 34 Q 44 32 48 34" stroke="#607d8b" stroke-width="0.75" fill="none" opacity="0.55"/>
                    <path d="M 52 34 Q 56 32 62 34" stroke="#607d8b" stroke-width="0.75" fill="none" opacity="0.55"/>
                    <path d="M 37 38 Q 42 36 47 38" stroke="#607d8b" stroke-width="0.65" fill="none" opacity="0.4"/>
                    <path d="M 53 38 Q 58 36 63 38" stroke="#607d8b" stroke-width="0.65" fill="none" opacity="0.4"/>
                    <!-- Weathered scale marks -->
                    <path d="M 36 30 Q 38 28 40 30" stroke="#546e7a" stroke-width="0.7" fill="none" opacity="0.35"/>
                    <path d="M 60 30 Q 62 28 64 30" stroke="#546e7a" stroke-width="0.7" fill="none" opacity="0.35"/>
                    <ellipse cx="50" cy="40" rx="10" ry="5.5" fill="url(#old-dragon-belly)" stroke="#80cbc4" stroke-width="0.6"/>
                    <ellipse cx="47" cy="41" rx="1.6" ry="1.2" fill="#455a64"/>
                    <ellipse cx="53" cy="41" rx="1.6" ry="1.2" fill="#455a64"/>
                    <!-- Ornate horns -->
                    <path d="M 36 24 Q 28 14 22 8 Q 20 6 24 9 L 35 22 Z" fill="url(#old-dragon-horn)" stroke="#455a64" stroke-width="1.3"/>
                    <path d="M 64 24 Q 72 14 78 8 Q 80 6 76 9 L 65 22 Z" fill="url(#old-dragon-horn)" stroke="#455a64" stroke-width="1.3"/>
                    <path d="M 26 11 L 30 16" stroke="#fff" stroke-width="1" opacity="0.45" stroke-linecap="round"/>
                    <path d="M 74 11 L 70 16" stroke="#fff" stroke-width="1" opacity="0.45" stroke-linecap="round"/>
                    <circle cx="28" cy="12" r="1.3" fill="#ffd54f" opacity="0.75"/>
                    <circle cx="72" cy="12" r="1.3" fill="#ffd54f" opacity="0.75"/>
                    <!-- Sage hat -->
                    <path d="M 35 24 L 50 1 L 65 24 Z" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.7"/>
                    <path d="M 42 14 Q 50 6 58 14" stroke="#ffd54f" stroke-width="1.1" fill="none" opacity="0.55"/>
                    <ellipse cx="50" cy="24" rx="17" ry="4" fill="url(#sage-robe)" stroke="#607d8b" stroke-width="1.7"/>
                    <path d="M 35 24 Q 50 20 65 24" stroke="#ffd54f" stroke-width="1.4" fill="none"/>
                    <!-- Third-eye gem -->
                    <circle cx="50" cy="22" r="2.2" fill="#80deea" opacity="0.55"/>
                    <circle cx="50" cy="22" r="1.1" fill="#4dd0e1" opacity="0.75"/>
                    <!-- Long beard / whiskers -->
                    <path d="M 42 42 Q 34 52 38 60 L 42 56 Q 40 48 42 44 Z" fill="#eceff1" stroke="#b0bec5" stroke-width="0.9"/>
                    <path d="M 50 44 Q 46 56 48 64 L 52 62 Q 50 52 50 46 Z" fill="#f5f5f5" stroke="#b0bec5" stroke-width="0.9"/>
                    <path d="M 58 42 Q 66 52 62 60 L 58 56 Q 60 48 58 44 Z" fill="#eceff1" stroke="#b0bec5" stroke-width="0.9"/>
                    <line x1="40" y1="48" x2="38" y2="56" stroke="#cfd8dc" stroke-width="0.55" opacity="0.7"/>
                    <line x1="50" y1="50" x2="49" y2="60" stroke="#cfd8dc" stroke-width="0.55" opacity="0.7"/>
                    <line x1="60" y1="48" x2="62" y2="56" stroke="#cfd8dc" stroke-width="0.55" opacity="0.7"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="31" rx="4.4" ry="4.6" fill="#fff" stroke="#607d8b" stroke-width="1"/>
                        <ellipse cx="57" cy="31" rx="4.4" ry="4.6" fill="#fff" stroke="#607d8b" stroke-width="1"/>
                        <ellipse cx="43.3" cy="31.6" rx="2.2" ry="2.4" fill="url(#old-dragon-iris)"/>
                        <ellipse cx="57.3" cy="31.6" rx="2.2" ry="2.4" fill="url(#old-dragon-iris)"/>
                        <ellipse cx="43.3" cy="31.8" rx="1" ry="1.3" fill="#012a4a"/>
                        <ellipse cx="57.3" cy="31.8" rx="1" ry="1.3" fill="#012a4a"/>
                        <circle cx="44.2" cy="30.2" r="0.95" fill="#fff" opacity="0.9"/>
                        <circle cx="58.2" cy="30.2" r="0.95" fill="#fff" opacity="0.9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 39 31 Q 43 28 47 31" stroke="#546e7a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                        <path d="M 53 31 Q 57 28 61 31" stroke="#546e7a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                    </g>
                    <path class="tm-mascot-mouth-happy" d="M 44 40 Q 50 42.5 56 40" stroke="#546e7a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 42 Q 50 38.5 56 42" stroke="#546e7a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Feet -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="40" cy="96" rx="5.5" ry="2.8" fill="url(#old-dragon-scales)" stroke="#546e7a" stroke-width="1"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="60" cy="96" rx="5.5" ry="2.8" fill="url(#old-dragon-scales)" stroke="#546e7a" stroke-width="1"/>
                    </g>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- ROBOT CHARACTER - All Life Stages (dense cute epic v3) -->
                <!-- Plasma & Code • Epic Rarity • Neon Colossus -->
                <!-- ═══════════════════════════════════════ -->

                <!-- ROBOT BABY — chubby cube spawn -->
                <g id="tm-mascot-baby-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-baby-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#cfd8dc;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#78909c;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#37474f;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="robot-baby-panel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-baby-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#76ff03;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-baby-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#0288d1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#01579b;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="robot-baby-blush" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-baby-thruster" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00bcd4;stop-opacity:0.4" />
                        </radialGradient>
                        <radialGradient id="robot-baby-gloss" cx="35%" cy="25%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="92" rx="22" ry="4" fill="#1a1a1a" opacity="0.2"/>
                        <!-- Cable tail -->
                        <g class="tm-animate-tail">
                            <path d="M 64 72 Q 76 78 80 70 Q 82 64 78 62" fill="none" stroke="#546e7a" stroke-width="2.2" stroke-linecap="round"/>
                            <path d="M 76 66 Q 80 64 78 68" fill="none" stroke="#78909c" stroke-width="1.2" opacity="0.6"/>
                            <rect x="76" y="60" width="6" height="5" rx="1" fill="#37474f" stroke="#00e5ff" stroke-width="1"/>
                            <rect x="78" y="62" width="2" height="1.5" fill="#00e5ff" opacity="0.8"/>
                            <circle cx="79" cy="61" r="0.8" fill="#76ff03" opacity="0.7"/>
                        </g>
                        <!-- Thruster nub wings -->
                        <g class="tm-animate-wing-left">
                            <ellipse cx="26" cy="58" rx="5" ry="7" fill="url(#robot-baby-thruster)" stroke="#00acc1" stroke-width="1.2" transform="rotate(-20 26 58)"/>
                            <ellipse cx="24" cy="62" rx="2" ry="3" fill="#00e5ff" opacity="0.55"/>
                            <circle cx="23" cy="64" r="1.2" fill="#76ff03" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <ellipse cx="74" cy="58" rx="5" ry="7" fill="url(#robot-baby-thruster)" stroke="#00acc1" stroke-width="1.2" transform="rotate(20 74 58)"/>
                            <ellipse cx="76" cy="62" rx="2" ry="3" fill="#00e5ff" opacity="0.55"/>
                            <circle cx="77" cy="64" r="1.2" fill="#76ff03" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Chubby cube torso -->
                            <rect x="32" y="54" width="36" height="26" rx="7" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="2"/>
                            <rect x="36" y="58" width="28" height="14" rx="3" fill="url(#robot-baby-panel)" stroke="#4dd0e1" stroke-width="0.8" opacity="0.9"/>
                            <ellipse cx="42" cy="60" rx="8" ry="4" fill="url(#robot-baby-gloss)"/>
                            <circle cx="50" cy="66" r="6" fill="url(#robot-baby-core)"/>
                            <circle cx="50" cy="66" r="2.5" fill="#fffde7" opacity="0.8"/>
                            <!-- Cute bolts -->
                            <circle cx="34" cy="58" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
                            <circle cx="66" cy="58" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
                            <circle cx="34" cy="76" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
                            <circle cx="66" cy="76" r="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.8"/>
                            <line x1="33" y1="58" x2="35" y2="58" stroke="#eceff1" stroke-width="0.6"/>
                            <line x1="65" y1="58" x2="67" y2="58" stroke="#eceff1" stroke-width="0.6"/>
                            <!-- Blush LED panels -->
                            <circle cx="38" cy="72" r="3.5" fill="url(#robot-baby-blush)"/>
                            <circle cx="62" cy="72" r="3.5" fill="url(#robot-baby-blush)"/>
                            <rect x="44" y="74" width="12" height="2" rx="1" fill="#00e5ff" opacity="0.5"/>
                            <!-- Cube head -->
                            <rect x="34" y="28" width="32" height="24" rx="6" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="2"/>
                            <rect x="38" y="32" width="24" height="14" rx="3" fill="#263238" stroke="#37474f" stroke-width="0.8"/>
                            <ellipse cx="42" cy="34" rx="6" ry="3" fill="#fff" opacity="0.1"/>
                            <!-- Bobble antenna -->
                            <path d="M 50 28 Q 48 20 50 14 Q 52 20 50 28" fill="none" stroke="#78909c" stroke-width="1.8" stroke-linecap="round"/>
                            <circle cx="50" cy="12" r="3.5" fill="#76ff03" stroke="#00e5ff" stroke-width="1.2"/>
                            <circle cx="49" cy="11" r="1.2" fill="#fff" opacity="0.7"/>
                            <circle cx="36" cy="30" r="1.5" fill="#90a4ae" stroke="#546e7a" stroke-width="0.6"/>
                            <circle cx="64" cy="30" r="1.5" fill="#90a4ae" stroke="#546e7a" stroke-width="0.6"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="64" rx="5" ry="7" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
                            <ellipse cx="24" cy="60" rx="2" ry="1.5" fill="#fff" opacity="0.2"/>
                            <rect x="22" y="70" width="8" height="6" rx="2" fill="#455a64" stroke="#00e5ff" stroke-width="1"/>
                            <circle cx="24" cy="73" r="1" fill="#76ff03"/>
                            <circle cx="28" cy="73" r="1" fill="#00e5ff"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="64" rx="5" ry="7" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
                            <ellipse cx="76" cy="60" rx="2" ry="1.5" fill="#fff" opacity="0.2"/>
                            <rect x="70" y="70" width="8" height="6" rx="2" fill="#455a64" stroke="#00e5ff" stroke-width="1"/>
                            <circle cx="72" cy="73" r="1" fill="#76ff03"/>
                            <circle cx="76" cy="73" r="1" fill="#00e5ff"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="40" cy="84" rx="6" ry="5" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
                            <ellipse cx="40" cy="88" rx="7" ry="3" fill="#37474f" stroke="#546e7a" stroke-width="1.2"/>
                            <rect x="36" y="87" width="8" height="2" rx="1" fill="#00e5ff" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="60" cy="84" rx="6" ry="5" fill="url(#robot-baby-chassis)" stroke="#546e7a" stroke-width="1.4"/>
                            <ellipse cx="60" cy="88" rx="7" ry="3" fill="#37474f" stroke="#546e7a" stroke-width="1.2"/>
                            <rect x="56" y="87" width="8" height="2" rx="1" fill="#00e5ff" opacity="0.4"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="40" rx="6.5" ry="7.5" fill="#fff" stroke="#546e7a" stroke-width="1.6"/>
                            <ellipse cx="59" cy="40" rx="6.5" ry="7.5" fill="#fff" stroke="#546e7a" stroke-width="1.6"/>
                            <ellipse cx="42" cy="41" rx="3.6" ry="4.3" fill="url(#robot-baby-iris)"/>
                            <ellipse cx="60" cy="41" rx="3.6" ry="4.3" fill="url(#robot-baby-iris)"/>
                            <ellipse cx="42" cy="41.5" rx="1.9" ry="2.5" fill="#0a1628"/>
                            <ellipse cx="60" cy="41.5" rx="1.9" ry="2.5" fill="#0a1628"/>
                            <circle cx="43.5" cy="37.4" r="2.1" fill="#fff" opacity="0.95"/>
                            <circle cx="61.5" cy="37.4" r="2.1" fill="#fff" opacity="0.95"/>
                            <circle cx="40.2" cy="42.3" r="0.8" fill="#fff" opacity="0.5"/>
                            <circle cx="58.2" cy="42.3" r="0.8" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 34.5 40 Q 41 37 47.5 40" stroke="#546e7a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.5 40 Q 59 37 65.5 40" stroke="#546e7a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44 48 Q 50 53 56 48" stroke="#00e5ff" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 50 Q 50 44 56 50" stroke="#00e5ff" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- ROBOT KID — tread scout -->
                <g id="tm-mascot-evo1-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-kid-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b0bec5;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#607d8b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="robot-kid-panel" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e1f5fe;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#29b6f6;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-kid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff9c4;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffee58;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-kid-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#4fc3f7;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#0288d1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#01579b;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="robot-kid-blush" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.45" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-kid-dish" cx="50%" cy="30%" r="70%">
                            <stop offset="0%" style="stop-color:#eceff1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#78909c;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="robot-kid-star" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffc107;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="28" ry="5" fill="#1a1a1a" opacity="0.22"/>
                        <g class="tm-animate-tail">
                            <path d="M 66 70 Q 80 76 84 66 Q 86 58 78 60" fill="none" stroke="#607d8b" stroke-width="2.5" stroke-linecap="round"/>
                            <path d="M 78 62 Q 82 60 80 66" fill="none" stroke="#90a4ae" stroke-width="1" opacity="0.5"/>
                            <rect x="80" y="56" width="5" height="6" rx="1" fill="#455a64" stroke="#29b6f6" stroke-width="1"/>
                            <circle cx="82" cy="58" r="1" fill="#ffee58"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <ellipse cx="24" cy="54" rx="4" ry="6" fill="#455a64" stroke="#29b6f6" stroke-width="1" opacity="0.85"/>
                            <circle cx="22" cy="58" r="1.5" fill="#00e5ff" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <ellipse cx="76" cy="54" rx="4" ry="6" fill="#455a64" stroke="#29b6f6" stroke-width="1" opacity="0.85"/>
                            <circle cx="78" cy="58" r="1.5" fill="#00e5ff" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Backpack antenna dish -->
                            <ellipse cx="50" cy="42" rx="14" ry="10" fill="url(#robot-kid-dish)" stroke="#607d8b" stroke-width="1.2" opacity="0.9"/>
                            <ellipse cx="50" cy="40" rx="8" ry="5" fill="#37474f" stroke="#29b6f6" stroke-width="0.8"/>
                            <line x1="50" y1="35" x2="50" y2="28" stroke="#78909c" stroke-width="1.5"/>
                            <circle cx="50" cy="26" r="2.5" fill="#ffee58" stroke="#ffc107" stroke-width="0.8"/>
                            <!-- Taller chassis -->
                            <rect x="30" y="48" width="40" height="28" rx="5" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="2"/>
                            <rect x="34" y="52" width="32" height="14" rx="2.5" fill="url(#robot-kid-panel)" stroke="#29b6f6" stroke-width="0.8"/>
                            <ellipse cx="40" cy="54" rx="7" ry="3" fill="#fff" opacity="0.15"/>
                            <circle cx="50" cy="62" r="7" fill="url(#robot-kid-core)"/>
                            <circle cx="50" cy="62" r="3" fill="#fff9c4" opacity="0.75"/>
                            <!-- Sticker stars -->
                            <path d="M 36 56 L 37 58 L 39 58 L 37.5 59.5 L 38 62 L 36 60.5 L 34 62 L 34.5 59.5 L 33 58 L 35 58 Z" fill="url(#robot-kid-star)" stroke="#ffc107" stroke-width="0.5"/>
                            <path d="M 62 70 L 63 72 L 65 72 L 63.5 73.5 L 64 76 L 62 74.5 L 60 76 L 60.5 73.5 L 59 72 L 61 72 Z" fill="url(#robot-kid-star)" stroke="#ffc107" stroke-width="0.5"/>
                            <path d="M 64 54 L 64.8 56 L 67 56 L 65.2 57.2 L 65.8 59 L 64 58 L 62.2 59 L 62.8 57.2 L 61 56 L 63.2 56 Z" fill="url(#robot-kid-star)" opacity="0.8"/>
                            <circle cx="38" cy="72" r="3" fill="url(#robot-kid-blush)"/>
                            <circle cx="62" cy="72" r="3" fill="url(#robot-kid-blush)"/>
                            <!-- Head -->
                            <rect x="34" y="22" width="32" height="22" rx="4" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.8"/>
                            <rect x="38" y="26" width="24" height="12" rx="2" fill="#1a237e" opacity="0.85"/>
                            <rect x="42" y="42" width="16" height="4" rx="1" fill="#263238" stroke="#29b6f6" stroke-width="0.6"/>
                            <path d="M 44 44 L 48 44 L 46 46 Z" fill="#ffee58" opacity="0.8"/>
                            <path d="M 52 44 L 56 44 L 54 46 Z" fill="#ffee58" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <rect x="18" y="52" width="10" height="18" rx="2.5" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.3" transform="rotate(-14 23 61)"/>
                            <rect x="16" y="68" width="12" height="7" rx="2" fill="#37474f" stroke="#29b6f6" stroke-width="1"/>
                            <circle cx="20" cy="71" r="1.3" fill="#ffee58"/>
                            <circle cx="24" cy="71" r="1.3" fill="#00e5ff"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <rect x="72" y="52" width="10" height="18" rx="2.5" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.3" transform="rotate(14 77 61)"/>
                            <rect x="72" y="68" width="12" height="7" rx="2" fill="#37474f" stroke="#29b6f6" stroke-width="1"/>
                            <circle cx="76" cy="71" r="1.3" fill="#ffee58"/>
                            <circle cx="80" cy="71" r="1.3" fill="#00e5ff"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <rect x="34" y="76" width="12" height="8" rx="2" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.2"/>
                            <rect x="30" y="84" width="20" height="8" rx="3" fill="#263238" stroke="#455a64" stroke-width="1.5"/>
                            <circle cx="34" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
                            <circle cx="40" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
                            <circle cx="46" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
                            <rect x="32" y="86" width="16" height="2" rx="1" fill="#455a64"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <rect x="54" y="76" width="12" height="8" rx="2" fill="url(#robot-kid-chassis)" stroke="#607d8b" stroke-width="1.2"/>
                            <rect x="50" y="84" width="20" height="8" rx="3" fill="#263238" stroke="#455a64" stroke-width="1.5"/>
                            <circle cx="54" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
                            <circle cx="60" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
                            <circle cx="66" cy="88" r="2.5" fill="#37474f" stroke="#78909c" stroke-width="0.8"/>
                            <rect x="52" y="86" width="16" height="2" rx="1" fill="#455a64"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="32" rx="6" ry="7" fill="#fff" stroke="#607d8b" stroke-width="1.6"/>
                            <ellipse cx="59" cy="32" rx="6" ry="7" fill="#fff" stroke="#607d8b" stroke-width="1.6"/>
                            <ellipse cx="42" cy="33" rx="3.4" ry="4.1" fill="url(#robot-kid-iris)"/>
                            <ellipse cx="60" cy="33" rx="3.4" ry="4.1" fill="url(#robot-kid-iris)"/>
                            <ellipse cx="42" cy="33.5" rx="1.7" ry="2.3" fill="#0a1628"/>
                            <ellipse cx="60" cy="33.5" rx="1.7" ry="2.3" fill="#0a1628"/>
                            <circle cx="43.5" cy="29.6" r="1.9" fill="#fff" opacity="0.95"/>
                            <circle cx="61.5" cy="29.6" r="1.9" fill="#fff" opacity="0.95"/>
                            <circle cx="40.2" cy="34.1" r="0.8" fill="#fff" opacity="0.5"/>
                            <circle cx="58.2" cy="34.1" r="0.8" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 35 32 Q 41 29 47 32" stroke="#607d8b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 53 32 Q 59 29 65 32" stroke="#607d8b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 44 Q 50 49 57 44" stroke="#29b6f6" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 46 Q 50 40 57 46" stroke="#29b6f6" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- ROBOT TEEN — sleek visor mecha -->
                <g id="tm-mascot-evo2-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-teen-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#90a4ae;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#455a64;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="robot-teen-panel" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#00bcd4;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-teen-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#e040fb;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-teen-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#ea80fc;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#7b1fa2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="robot-teen-visor" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#00bcd4;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:0.3" />
                        </linearGradient>
                        <linearGradient id="robot-teen-fin" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00838f;stop-opacity:0.6" />
                        </linearGradient>
                        <radialGradient id="robot-teen-hover" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-teen-gloss" cx="30%" cy="20%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="30" ry="5" fill="#1a1a1a" opacity="0.25"/>
                        <g class="tm-animate-tail">
                            <path d="M 68 68 Q 84 74 88 62 Q 90 52 82 54" fill="none" stroke="#455a64" stroke-width="2.8" stroke-linecap="round"/>
                            <ellipse cx="86" cy="58" rx="3" ry="4" fill="#00e5ff" opacity="0.5"/>
                            <circle cx="86" cy="58" r="1.5" fill="#e040fb" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 50 Q 14 42 12 52 Q 14 62 26 58 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1.4"/>
                            <path d="M 18 48 Q 14 52 16 56" stroke="#00838f" stroke-width="0.8" fill="none" opacity="0.55"/>
                            <circle cx="14" cy="50" r="1.5" fill="#e040fb" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 50 Q 86 42 88 52 Q 86 62 74 58 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1.4"/>
                            <path d="M 82 48 Q 86 52 84 56" stroke="#00838f" stroke-width="0.8" fill="none" opacity="0.55"/>
                            <circle cx="86" cy="50" r="1.5" fill="#e040fb" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-body">
                            <rect x="28" y="46" width="44" height="30" rx="4" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="2.2"/>
                            <rect x="32" y="50" width="36" height="16" rx="2" fill="url(#robot-teen-panel)" stroke="#00bcd4" stroke-width="0.9"/>
                            <ellipse cx="38" cy="52" rx="8" ry="4" fill="url(#robot-teen-gloss)"/>
                            <circle cx="50" cy="60" r="8" fill="url(#robot-teen-core)"/>
                            <circle cx="50" cy="60" r="3.5" fill="#f8bbd0" opacity="0.7"/>
                            <!-- Magenta accent stripes -->
                            <path d="M 30 54 L 34 54" stroke="#e040fb" stroke-width="2" stroke-linecap="round"/>
                            <path d="M 66 54 L 70 54" stroke="#e040fb" stroke-width="2" stroke-linecap="round"/>
                            <path d="M 30 70 L 34 70" stroke="#00e5ff" stroke-width="2" stroke-linecap="round"/>
                            <path d="M 66 70 L 70 70" stroke="#00e5ff" stroke-width="2" stroke-linecap="round"/>
                            <!-- Shoulder fins -->
                            <path d="M 28 48 L 22 40 L 30 52 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1"/>
                            <path d="M 72 48 L 78 40 L 70 52 Z" fill="url(#robot-teen-fin)" stroke="#00acc1" stroke-width="1"/>
                            <!-- Sleek helmet head -->
                            <ellipse cx="50" cy="30" rx="18" ry="14" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="2"/>
                            <ellipse cx="50" cy="30" rx="14" ry="8" fill="url(#robot-teen-visor)" stroke="#00bcd4" stroke-width="1"/>
                            <ellipse cx="42" cy="28" rx="5" ry="2.5" fill="#fff" opacity="0.2"/>
                            <line x1="50" y1="16" x2="50" y2="10" stroke="#78909c" stroke-width="1.5"/>
                            <circle cx="50" cy="9" r="2" fill="#e040fb" stroke="#00e5ff" stroke-width="0.8"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <rect x="16" y="48" width="11" height="22" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.4" transform="rotate(-18 21.5 59)"/>
                            <ellipse cx="14" cy="52" rx="2.5" ry="2" fill="#fff" opacity="0.15"/>
                            <rect x="12" y="68" width="14" height="8" rx="2" fill="#263238" stroke="#00e5ff" stroke-width="1.1"/>
                            <rect x="14" y="70" width="3" height="4" fill="#e040fb" opacity="0.7"/>
                            <rect x="19" y="70" width="3" height="4" fill="#00e5ff" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <rect x="73" y="48" width="11" height="22" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.4" transform="rotate(18 78.5 59)"/>
                            <ellipse cx="86" cy="52" rx="2.5" ry="2" fill="#fff" opacity="0.15"/>
                            <rect x="74" y="68" width="14" height="8" rx="2" fill="#263238" stroke="#00e5ff" stroke-width="1.1"/>
                            <rect x="76" y="70" width="3" height="4" fill="#e040fb" opacity="0.7"/>
                            <rect x="81" y="70" width="3" height="4" fill="#00e5ff" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <rect x="34" y="76" width="10" height="14" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.3"/>
                            <ellipse cx="39" cy="94" rx="10" ry="3" fill="url(#robot-teen-hover)"/>
                            <ellipse cx="39" cy="92" rx="8" ry="2.5" fill="#263238" stroke="#00bcd4" stroke-width="1.2"/>
                            <circle cx="39" cy="94" r="2" fill="#00e5ff" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <rect x="56" y="76" width="10" height="14" rx="2" fill="url(#robot-teen-chassis)" stroke="#455a64" stroke-width="1.3"/>
                            <ellipse cx="61" cy="94" rx="10" ry="3" fill="url(#robot-teen-hover)"/>
                            <ellipse cx="61" cy="92" rx="8" ry="2.5" fill="#263238" stroke="#00bcd4" stroke-width="1.2"/>
                            <circle cx="61" cy="94" r="2" fill="#00e5ff" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="30" rx="5.5" ry="6.5" fill="#fff" stroke="#455a64" stroke-width="1.6"/>
                            <ellipse cx="58" cy="30" rx="5.5" ry="6.5" fill="#fff" stroke="#455a64" stroke-width="1.6"/>
                            <ellipse cx="43" cy="31" rx="3.1" ry="3.8" fill="url(#robot-teen-iris)"/>
                            <ellipse cx="59" cy="31" rx="3.1" ry="3.8" fill="url(#robot-teen-iris)"/>
                            <ellipse cx="43" cy="31.5" rx="1.6" ry="2.1" fill="#0a1628"/>
                            <ellipse cx="59" cy="31.5" rx="1.6" ry="2.1" fill="#0a1628"/>
                            <circle cx="44.5" cy="27.7" r="1.8" fill="#fff" opacity="0.95"/>
                            <circle cx="60.5" cy="27.7" r="1.8" fill="#fff" opacity="0.95"/>
                            <circle cx="41.2" cy="31.9" r="0.7" fill="#fff" opacity="0.5"/>
                            <circle cx="57.2" cy="31.9" r="0.7" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 36.5 30 Q 42 27 47.5 30" stroke="#455a64" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.5 30 Q 58 27 63.5 30" stroke="#455a64" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44 38 Q 50 43 56 38" stroke="#00bcd4" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 40 Q 50 34 56 40" stroke="#00bcd4" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- ROBOT ADULT — Neon Colossus -->
                <g id="tm-mascot-evo3-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-adult-armor" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#78909c;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#37474f;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#1a237e;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0d1b2a;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="robot-adult-plate" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#b0bec5;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#546e7a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-adult-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#76ff03;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#00e5ff;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-adult-iris" cx="35%" cy="28%" r="65%">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#00bcd4;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="robot-adult-jet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#90a4ae;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#455a64;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-adult-vent" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="robot-adult-cannon" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#607d8b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-adult-glow" cx="50%" cy="55%" r="45%">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#00e5ff;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="98" rx="38" ry="5.5" fill="#1a1a1a" opacity="0.28"/>
                        <ellipse cx="50" cy="58" rx="42" ry="38" fill="url(#robot-adult-glow)" opacity="0.5"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 20 48 Q 4 34 2 20 Q 1 10 10 12 Q 14 26 20 40 Q 22 46 26 54 Z" fill="url(#robot-adult-jet)" stroke="#263238" stroke-width="2"/>
                            <path d="M 8 18 Q 12 28 18 40" stroke="#37474f" stroke-width="1" fill="none" opacity="0.5"/>
                            <path d="M 12 22 Q 16 32 22 44" stroke="#37474f" stroke-width="0.8" fill="none" opacity="0.4"/>
                            <rect x="6" y="24" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
                            <rect x="8" y="30" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
                            <rect x="10" y="36" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
                            <circle cx="4" cy="16" r="2" fill="#76ff03" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 80 48 Q 96 34 98 20 Q 99 10 90 12 Q 86 26 80 40 Q 78 46 74 54 Z" fill="url(#robot-adult-jet)" stroke="#263238" stroke-width="2"/>
                            <path d="M 92 18 Q 88 28 82 40" stroke="#37474f" stroke-width="1" fill="none" opacity="0.5"/>
                            <path d="M 88 22 Q 84 32 78 44" stroke="#37474f" stroke-width="0.8" fill="none" opacity="0.4"/>
                            <rect x="90" y="24" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
                            <rect x="88" y="30" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
                            <rect x="86" y="36" width="4" height="2" rx="0.5" fill="url(#robot-adult-vent)"/>
                            <circle cx="96" cy="16" r="2" fill="#76ff03" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 72 70 Q 90 76 94 64 Q 96 54 86 56" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="2"/>
                            <rect x="90" y="58" width="6" height="5" rx="1" fill="#37474f" stroke="#00e5ff" stroke-width="1"/>
                            <circle cx="93" cy="60" r="1.5" fill="#76ff03"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Broad heroic torso -->
                            <path d="M 22 52 L 26 44 L 74 44 L 78 52 L 76 78 L 24 78 Z" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="2.4"/>
                            <rect x="28" y="48" width="44" height="22" rx="3" fill="url(#robot-adult-plate)" stroke="#546e7a" stroke-width="1.2"/>
                            <ellipse cx="38" cy="52" rx="8" ry="4" fill="#fff" opacity="0.1"/>
                            <!-- Layered armor plates -->
                            <path d="M 26 56 L 30 52 L 34 56 L 30 60 Z" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
                            <path d="M 66 56 L 70 52 L 74 56 L 70 60 Z" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
                            <path d="M 36 72 L 40 68 L 44 72 L 40 76 Z" fill="#546e7a" stroke="#37474f" stroke-width="0.7"/>
                            <path d="M 56 72 L 60 68 L 64 72 L 60 76 Z" fill="#546e7a" stroke="#37474f" stroke-width="0.7"/>
                            <!-- Big chest core -->
                            <circle cx="50" cy="62" r="12" fill="url(#robot-adult-core)"/>
                            <circle cx="50" cy="62" r="6" fill="#fffde7" opacity="0.8"/>
                            <circle cx="50" cy="62" r="3" fill="#76ff03" opacity="0.9"/>
                            <path d="M 38 58 L 62 58 M 38 66 L 62 66" stroke="#00e5ff" stroke-width="0.8" opacity="0.4"/>
                            <!-- Head -->
                            <rect x="36" y="20" width="28" height="20" rx="3" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="2"/>
                            <rect x="40" y="24" width="20" height="10" rx="2" fill="#0a1628" stroke="#00e5ff" stroke-width="0.8"/>
                            <line x1="50" y1="20" x2="50" y2="12" stroke="#78909c" stroke-width="2"/>
                            <circle cx="50" cy="10" r="3" fill="#76ff03" stroke="#00e5ff" stroke-width="1"/>
                            <circle cx="49" cy="9" r="1" fill="#fff" opacity="0.7"/>
                            <rect x="32" y="42" width="8" height="6" rx="1" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
                            <rect x="60" y="42" width="8" height="6" rx="1" fill="#607d8b" stroke="#37474f" stroke-width="0.8"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="20" cy="58" rx="7" ry="12" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.8"/>
                            <rect x="10" y="66" width="18" height="10" rx="2" fill="url(#robot-adult-cannon)" stroke="#00e5ff" stroke-width="1.4"/>
                            <rect x="6" y="68" width="8" height="6" rx="1.5" fill="#263238" stroke="#76ff03" stroke-width="1"/>
                            <circle cx="8" cy="71" r="2" fill="#0a1628"/>
                            <rect x="14" y="70" width="4" height="3" fill="#00e5ff" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="80" cy="58" rx="7" ry="12" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.8"/>
                            <rect x="72" y="66" width="18" height="10" rx="2" fill="url(#robot-adult-cannon)" stroke="#00e5ff" stroke-width="1.4"/>
                            <rect x="86" y="68" width="8" height="6" rx="1.5" fill="#263238" stroke="#76ff03" stroke-width="1"/>
                            <circle cx="92" cy="71" r="2" fill="#0a1628"/>
                            <rect x="82" y="70" width="4" height="3" fill="#00e5ff" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <rect x="32" y="78" width="14" height="14" rx="2" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.6"/>
                            <ellipse cx="39" cy="94" rx="10" ry="5" fill="#1a237e" stroke="#00e5ff" stroke-width="1.5"/>
                            <rect x="34" y="90" width="10" height="3" rx="1" fill="#00e5ff" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <rect x="54" y="78" width="14" height="14" rx="2" fill="url(#robot-adult-armor)" stroke="#263238" stroke-width="1.6"/>
                            <ellipse cx="61" cy="94" rx="10" ry="5" fill="#1a237e" stroke="#00e5ff" stroke-width="1.5"/>
                            <rect x="56" y="90" width="10" height="3" rx="1" fill="#00e5ff" opacity="0.4"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="30" rx="5.5" ry="6.5" fill="#fff" stroke="#263238" stroke-width="1.6"/>
                            <ellipse cx="58" cy="30" rx="5.5" ry="6.5" fill="#fff" stroke="#263238" stroke-width="1.6"/>
                            <ellipse cx="43" cy="31" rx="3.1" ry="3.8" fill="url(#robot-adult-iris)"/>
                            <ellipse cx="59" cy="31" rx="3.1" ry="3.8" fill="url(#robot-adult-iris)"/>
                            <ellipse cx="43" cy="31.5" rx="1.6" ry="2.1" fill="#0a1628"/>
                            <ellipse cx="59" cy="31.5" rx="1.6" ry="2.1" fill="#0a1628"/>
                            <circle cx="44.5" cy="27.7" r="1.8" fill="#fff" opacity="0.95"/>
                            <circle cx="60.5" cy="27.7" r="1.8" fill="#fff" opacity="0.95"/>
                            <circle cx="41.2" cy="31.9" r="0.7" fill="#fff" opacity="0.5"/>
                            <circle cx="57.2" cy="31.9" r="0.7" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 36.5 30 Q 42 27 47.5 30" stroke="#263238" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.5 30 Q 58 27 63.5 30" stroke="#263238" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 42 38 Q 50 43 58 38" stroke="#00e5ff" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 40 Q 50 34 58 40" stroke="#00e5ff" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- ROBOT MIDDLE AGE — battle-scarred engineer -->
                <g id="tm-mascot-evo4-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-mid-steel" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#9e9e9e;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#616161;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#424242;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="robot-mid-dent" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#757575;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#37474f;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-mid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffab40;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#ff6d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-mid-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#ffcc80;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff8f00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="robot-mid-goggle" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#37474f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#212121;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="robot-mid-belt" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-mid-warn" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffab40;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff6d00;stop-opacity:0.5" />
                        </radialGradient>
                        <radialGradient id="robot-mid-gloss" cx="35%" cy="25%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#fff;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="32" ry="5" fill="#1a1a1a" opacity="0.26"/>
                        <g class="tm-animate-tail">
                            <path d="M 66 72 Q 82 80 86 68 Q 88 60 80 62" fill="none" stroke="#616161" stroke-width="3" stroke-linecap="round"/>
                            <path d="M 78 66 Q 84 62 82 70" fill="none" stroke="#9e9e9e" stroke-width="1" opacity="0.4"/>
                            <rect x="82" y="60" width="5" height="5" rx="1" fill="#424242" stroke="#ffab40" stroke-width="0.8"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 26 52 L 14 44 L 16 58 L 10 62 L 24 58 Z" fill="url(#robot-mid-steel)" stroke="#616161" stroke-width="1.2" opacity="0.85"/>
                            <path d="M 18 50 L 12 46" stroke="#ffab40" stroke-width="0.8" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 74 52 L 86 44 L 84 58 L 90 62 L 76 58 Z" fill="url(#robot-mid-steel)" stroke="#616161" stroke-width="1.2" opacity="0.85"/>
                            <path d="M 82 50 L 88 46" stroke="#ffab40" stroke-width="0.8" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Dented torso -->
                            <path d="M 30 50 Q 28 54 30 58 L 32 76 Q 34 80 38 78 L 62 78 Q 66 80 68 76 L 70 58 Q 72 54 70 50 Q 66 46 50 46 Q 34 46 30 50 Z" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="2"/>
                            <path d="M 34 54 Q 36 52 38 56 Q 36 58 34 56 Z" fill="url(#robot-mid-dent)" opacity="0.7"/>
                            <path d="M 62 60 Q 64 58 66 62 Q 64 64 62 62 Z" fill="url(#robot-mid-dent)" opacity="0.65"/>
                            <ellipse cx="40" cy="56" rx="6" ry="3" fill="url(#robot-mid-gloss)"/>
                            <circle cx="50" cy="62" r="8" fill="url(#robot-mid-core)"/>
                            <circle cx="50" cy="62" r="3.5" fill="#fff8e1" opacity="0.7"/>
                            <!-- Amber warning lights -->
                            <circle cx="32" cy="52" r="2.5" fill="url(#robot-mid-warn)" stroke="#ff6d00" stroke-width="0.8"/>
                            <circle cx="68" cy="52" r="2.5" fill="url(#robot-mid-warn)" stroke="#ff6d00" stroke-width="0.8"/>
                            <path d="M 32 50 L 33 54 L 31 54 Z" fill="#ff6d00" opacity="0.8"/>
                            <path d="M 68 50 L 69 54 L 67 54 Z" fill="#ff6d00" opacity="0.8"/>
                            <!-- Toolbelt -->
                            <rect x="32" y="74" width="36" height="5" rx="1.5" fill="url(#robot-mid-belt)" stroke="#3e2723" stroke-width="1"/>
                            <rect x="36" y="78" width="3" height="6" rx="0.5" fill="#78909c" stroke="#546e7a" stroke-width="0.6"/>
                            <rect x="42" y="78" width="4" height="7" rx="0.5" fill="#ffab40" stroke="#ff6d00" stroke-width="0.6"/>
                            <rect x="48" y="78" width="3" height="5" rx="0.5" fill="#607d8b"/>
                            <rect x="54" y="78" width="4" height="6" rx="0.5" fill="#78909c" stroke="#546e7a" stroke-width="0.6"/>
                            <!-- Head with goggles -->
                            <rect x="34" y="24" width="32" height="20" rx="3" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.8"/>
                            <rect x="38" y="28" width="24" height="10" rx="2" fill="#263238"/>
                            <!-- Welding goggles on forehead -->
                            <ellipse cx="42" cy="22" rx="6" ry="4" fill="url(#robot-mid-goggle)" stroke="#212121" stroke-width="1.2"/>
                            <ellipse cx="58" cy="22" rx="6" ry="4" fill="url(#robot-mid-goggle)" stroke="#212121" stroke-width="1.2"/>
                            <rect x="40" y="20" width="20" height="3" rx="1" fill="#424242"/>
                            <ellipse cx="42" cy="22" rx="3" ry="2" fill="#ffab40" opacity="0.4"/>
                            <ellipse cx="58" cy="22" rx="3" ry="2" fill="#ffab40" opacity="0.4"/>
                            <!-- Scratch marks -->
                            <path d="M 36 30 L 40 34" stroke="#757575" stroke-width="0.8" opacity="0.5"/>
                            <path d="M 60 32 L 64 36" stroke="#757575" stroke-width="0.8" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <rect x="18" y="52" width="11" height="20" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3" transform="rotate(-14 23.5 62)"/>
                            <rect x="16" y="70" width="13" height="8" rx="2" fill="#37474f" stroke="#616161" stroke-width="1"/>
                            <circle cx="20" cy="73" r="1.2" fill="#ffab40"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <rect x="71" y="52" width="11" height="20" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3" transform="rotate(14 76.5 62)"/>
                            <!-- Wrench in hand -->
                            <path d="M 84 68 L 90 62 L 92 64 L 88 70 L 90 74 L 86 72 Z" fill="#78909c" stroke="#546e7a" stroke-width="1"/>
                            <circle cx="90" cy="66" r="2.5" fill="none" stroke="#9e9e9e" stroke-width="1.5"/>
                            <rect x="84" y="70" width="10" height="5" rx="1.5" fill="#37474f" stroke="#616161" stroke-width="1"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <rect x="34" y="80" width="12" height="12" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3"/>
                            <ellipse cx="40" cy="94" rx="9" ry="4" fill="#37474f" stroke="#616161" stroke-width="1.2"/>
                            <path d="M 36 92 Q 40 90 44 92" stroke="#757575" stroke-width="0.8" fill="none"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <rect x="54" y="80" width="12" height="12" rx="2" fill="url(#robot-mid-steel)" stroke="#424242" stroke-width="1.3"/>
                            <ellipse cx="60" cy="94" rx="9" ry="4" fill="#37474f" stroke="#616161" stroke-width="1.2"/>
                            <path d="M 56 92 Q 60 90 64 92" stroke="#757575" stroke-width="0.8" fill="none"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="33" rx="5" ry="6" fill="#fff" stroke="#424242" stroke-width="1.6"/>
                            <ellipse cx="58" cy="33" rx="5" ry="6" fill="#fff" stroke="#424242" stroke-width="1.6"/>
                            <ellipse cx="43" cy="34" rx="2.8" ry="3.5" fill="url(#robot-mid-iris)"/>
                            <ellipse cx="59" cy="34" rx="2.8" ry="3.5" fill="url(#robot-mid-iris)"/>
                            <ellipse cx="43" cy="34.5" rx="1.4" ry="2" fill="#0a1628"/>
                            <ellipse cx="59" cy="34.5" rx="1.4" ry="2" fill="#0a1628"/>
                            <circle cx="44.5" cy="30.9" r="1.6" fill="#fff" opacity="0.95"/>
                            <circle cx="60.5" cy="30.9" r="1.6" fill="#fff" opacity="0.95"/>
                            <circle cx="41.2" cy="34.8" r="0.7" fill="#fff" opacity="0.5"/>
                            <circle cx="57.2" cy="34.8" r="0.7" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 37 33 Q 42 30 47 33" stroke="#424242" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 53 33 Q 58 30 63 33" stroke="#424242" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 40 Q 50 45 57 40" stroke="#ffab40" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 42 Q 50 36 57 42" stroke="#ffab40" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- ROBOT OLD — ancient sage unit -->
                <g id="tm-mascot-evo5-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-old-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#bcaaa4;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#8d6e63;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#4db6ac;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00695c;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="robot-old-oxide" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#80cbc4;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#4db6ac;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-old-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ce93d8;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7b1fa2;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="robot-old-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4527a0;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="robot-old-monocle" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#7b1fa2;stop-opacity:0.2" />
                        </radialGradient>
                        <linearGradient id="robot-old-cable" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#78909c;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-old-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ce93d8;stop-opacity:0.25" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="robot-old-cane" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#a1887f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#5d4037;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="54" rx="40" ry="38" fill="url(#robot-old-aura)" opacity="0.6"/>
                        <ellipse cx="50" cy="98" rx="26" ry="4" fill="#1a1a1a" opacity="0.22"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 58 Q 16 50 14 42 Q 12 38 18 40 Q 24 48 30 56 Z" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="1" opacity="0.75"/>
                            <path d="M 20 44 Q 24 50 28 54" stroke="#80cbc4" stroke-width="0.6" fill="none" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 58 Q 84 50 86 42 Q 88 38 82 40 Q 76 48 70 56 Z" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="1" opacity="0.75"/>
                            <path d="M 80 44 Q 76 50 72 54" stroke="#80cbc4" stroke-width="0.6" fill="none" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 62 78 Q 74 86 78 76 Q 80 70 74 70" fill="none" stroke="url(#robot-old-cable)" stroke-width="2.5" stroke-linecap="round"/>
                            <circle cx="76" cy="72" r="2" fill="#4db6ac" stroke="#00695c" stroke-width="0.7"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Weathered sage chassis -->
                            <ellipse cx="50" cy="68" rx="22" ry="20" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.8"/>
                            <ellipse cx="44" cy="62" rx="7" ry="4" fill="#fff" opacity="0.08"/>
                            <circle cx="50" cy="68" r="9" fill="url(#robot-old-core)"/>
                            <circle cx="50" cy="68" r="4" fill="#f3e5f5" opacity="0.65"/>
                            <!-- Wisdom glyphs -->
                            <path d="M 42 64 L 44 66 L 42 68 L 40 66 Z" fill="#ce93d8" opacity="0.5"/>
                            <path d="M 58 64 L 60 66 L 58 68 L 56 66 Z" fill="#ce93d8" opacity="0.5"/>
                            <circle cx="50" cy="76" r="1.5" fill="#4db6ac" opacity="0.45"/>
                            <path d="M 48 78 L 50 80 L 52 78" stroke="#80cbc4" stroke-width="0.7" fill="none" opacity="0.5"/>
                            <!-- Aged head -->
                            <ellipse cx="50" cy="36" rx="16" ry="14" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.6"/>
                            <ellipse cx="44" cy="32" rx="5" ry="2.5" fill="#fff" opacity="0.1"/>
                            <!-- Bent antenna -->
                            <path d="M 50 22 Q 44 14 48 8 Q 52 12 50 22" fill="none" stroke="#8d6e63" stroke-width="1.8" stroke-linecap="round"/>
                            <circle cx="47" cy="9" r="2" fill="#ce93d8" stroke="#7b1fa2" stroke-width="0.8" opacity="0.8"/>
                            <!-- Patina marks -->
                            <path d="M 38 38 Q 40 36 42 38" stroke="#4db6ac" stroke-width="0.6" fill="none" opacity="0.4"/>
                            <path d="M 58 38 Q 60 36 62 38" stroke="#4db6ac" stroke-width="0.6" fill="none" opacity="0.4"/>
                            <!-- Cable beard -->
                            <path d="M 40 44 Q 32 54 36 62 L 40 58 Q 38 50 40 46 Z" fill="#90a4ae" stroke="#607d8b" stroke-width="0.8" opacity="0.85"/>
                            <path d="M 50 46 Q 46 58 48 66 L 52 64 Q 50 54 50 48 Z" fill="#b0bec5" stroke="#78909c" stroke-width="0.8" opacity="0.8"/>
                            <path d="M 60 44 Q 68 54 64 62 L 60 58 Q 62 50 60 46 Z" fill="#90a4ae" stroke="#607d8b" stroke-width="0.8" opacity="0.85"/>
                            <line x1="38" y1="50" x2="34" y2="58" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
                            <line x1="50" y1="52" x2="49" y2="62" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
                            <line x1="62" y1="50" x2="66" y2="58" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="30" cy="66" rx="5" ry="9" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.2"/>
                            <ellipse cx="28" cy="74" rx="4" ry="4.5" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="70" cy="66" rx="5" ry="9" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1.2"/>
                            <ellipse cx="72" cy="74" rx="4" ry="4.5" fill="url(#robot-old-oxide)" stroke="#4db6ac" stroke-width="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="42" cy="90" rx="6" ry="4" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1"/>
                            <ellipse cx="42" cy="94" rx="5" ry="2.5" fill="#4db6ac" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="58" cy="90" rx="6" ry="4" fill="url(#robot-old-bronze)" stroke="#5d4037" stroke-width="1"/>
                            <!-- Cane -->
                            <line x1="64" y1="72" x2="70" y2="96" stroke="url(#robot-old-cane)" stroke-width="3" stroke-linecap="round"/>
                            <line x1="64" y1="72" x2="70" y2="96" stroke="#bcaaa4" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
                            <circle cx="63" cy="70" r="3.5" fill="#4db6ac" stroke="#00695c" stroke-width="1"/>
                            <circle cx="63.5" cy="69.5" r="1.2" fill="#ce93d8" opacity="0.75"/>
                            <ellipse cx="58" cy="94" rx="5" ry="2.5" fill="#4db6ac" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="34" rx="4.5" ry="5" fill="#fff" stroke="#5d4037" stroke-width="1.2"/>
                            <ellipse cx="57" cy="34" rx="4.5" ry="5" fill="#fff" stroke="#5d4037" stroke-width="1.2"/>
                            <ellipse cx="43.5" cy="34.5" rx="2.5" ry="2.8" fill="url(#robot-old-iris)"/>
                            <ellipse cx="57.5" cy="34.5" rx="2.5" ry="2.8" fill="url(#robot-old-iris)"/>
                            <ellipse cx="43.5" cy="35" rx="1.2" ry="1.5" fill="#1a0a2e"/>
                            <ellipse cx="57.5" cy="35" rx="1.2" ry="1.5" fill="#1a0a2e"/>
                            <circle cx="44.5" cy="32.5" r="1" fill="#fff" opacity="0.9"/>
                            <circle cx="58.5" cy="32.5" r="1" fill="#fff" opacity="0.9"/>
                            <!-- Monocle LED on right eye -->
                            <circle cx="57" cy="34" r="6" fill="none" stroke="url(#robot-old-monocle)" stroke-width="1.2"/>
                            <line x1="63" cy="34" x2="68" cy="32" stroke="#8d6e63" stroke-width="1" stroke-linecap="round"/>
                            <circle cx="68" cy="32" r="1" fill="#ce93d8"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 39 34 Q 43 31 47 34" stroke="#5d4037" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                            <path d="M 53 34 Q 57 31 61 34" stroke="#5d4037" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44 42 Q 50 47 56 42" stroke="#7b1fa2" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 44 Q 50 38 56 44" stroke="#7b1fa2" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- SLIME CHARACTER - All Life Stages (dense cute epic goo v4) -->
                <!-- Liquid & Bounce • Rare Rarity • Abyssal Ooze -->
                <!-- ═══════════════════════════════════════ -->

                <!-- SLIME BABY — wet toxic droplet -->
                <g id="tm-mascot-baby-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-baby-body" cx="38%" cy="28%" r="72%">
                            <stop offset="0%" style="stop-color:#a5d6a7;stop-opacity:0.65" />
                            <stop offset="30%" style="stop-color:#43a047;stop-opacity:0.9" />
                            <stop offset="65%" style="stop-color:#1b5e20;stop-opacity:0.97" />
                            <stop offset="100%" style="stop-color:#02140c;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-baby-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#eeff41;stop-opacity:0.95" />
                            <stop offset="45%" style="stop-color:#76ff03;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-baby-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#c6ff00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-baby-gloss" cx="32%" cy="22%" r="48%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.58" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-baby-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-baby-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#b2ff59;stop-opacity:0.18" />
                            <stop offset="100%" style="stop-color:#b2ff59;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="90" rx="20" ry="4" fill="#1a1a1a" opacity="0.2"/>
                        <g class="tm-animate-tail">
                            <path d="M 56 76 Q 66 82 68 74 Q 70 68 64 70 Z" fill="#0d3b1e" stroke="#69f0ae" stroke-width="1"/>
                            <ellipse cx="66" cy="72" rx="2.5" ry="3" fill="#76ff03" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="30" cy="64" rx="5.5" ry="7" fill="#143d22" stroke="#69f0ae" stroke-width="1.2" transform="rotate(-28 30 64)"/>
                            <ellipse cx="26" cy="70" rx="3.5" ry="4" fill="#1b5e20" opacity="0.85"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="70" cy="64" rx="5.5" ry="7" fill="#143d22" stroke="#69f0ae" stroke-width="1.2" transform="rotate(28 70 64)"/>
                            <ellipse cx="74" cy="70" rx="3.5" ry="4" fill="#1b5e20" opacity="0.85"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="58" rx="24" ry="26" fill="url(#slime-baby-aura)" opacity="0.55"/>
                            <!-- Tiny round droplet -->
                            <path d="M 32 72 Q 28 54 38 40 Q 44 30 50 28 Q 58 30 64 42 Q 70 56 66 72 Q 62 84 50 86 Q 38 84 32 72 Z"
                                  fill="url(#slime-baby-body)" stroke="#1b5e20" stroke-width="2"/>
                            <ellipse cx="40" cy="42" rx="9" ry="6" fill="url(#slime-baby-gloss)"/>
                            <ellipse cx="43" cy="38" rx="3.2" ry="1.8" fill="#fff" opacity="0.42"/>
                            <circle cx="36" cy="52" r="2.2" fill="#fff" opacity="0.28"/>
                            <circle cx="58" cy="56" r="1.6" fill="#b2ff59" opacity="0.35"/>
                            <circle cx="52" cy="46" r="1.3" fill="#fff" opacity="0.3"/>
                            <ellipse cx="50" cy="60" rx="10" ry="12" fill="url(#slime-baby-core)" opacity="0.82"/>
                            <circle cx="50" cy="62" r="3.5" fill="#eeff41" opacity="0.55"/>
                            <!-- Bubble highlights -->
                            <circle cx="38" cy="68" r="2.4" fill="#b2ff59" opacity="0.38"/>
                            <circle cx="62" cy="70" r="1.8" fill="#69f0ae" opacity="0.32"/>
                            <ellipse cx="47" cy="82" rx="1.8" ry="3" fill="#1b5e20" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="42" cy="84" rx="4.5" ry="2.8" fill="#0d3b1e" stroke="#1b5e20" stroke-width="1.1"/>
                            <path d="M 42 86 Q 41 90 42 92" stroke="#143d22" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="58" cy="85" rx="4" ry="2.5" fill="#0d3b1e" stroke="#1b5e20" stroke-width="1.1"/>
                            <path d="M 58 87 Q 59 91 58 93" stroke="#143d22" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
                        </g>
                        <!-- Cheeks -->
                        <circle cx="34" cy="53" r="4.2" fill="url(#slime-baby-cheek)"/>
                        <circle cx="66" cy="53" r="4.2" fill="url(#slime-baby-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="46" rx="7.5" ry="8.5" fill="#fff" stroke="#1b5e20" stroke-width="1.5"/>
                            <ellipse cx="59" cy="46" rx="7.5" ry="8.5" fill="#fff" stroke="#1b5e20" stroke-width="1.5"/>
                            <ellipse cx="41.5" cy="46.5" rx="4.2" ry="4.93" fill="url(#slime-baby-iris)"/>
                            <ellipse cx="59.5" cy="46.5" rx="4.2" ry="4.93" fill="url(#slime-baby-iris)"/>
                            <ellipse cx="41.6" cy="46.8" rx="2.175" ry="2.805" fill="#0a1208"/>
                            <ellipse cx="59.6" cy="46.8" rx="2.175" ry="2.805" fill="#0a1208"/>
                            <circle cx="42.5" cy="42.77" r="2.4" fill="#fff" opacity="0.96"/>
                            <circle cx="60.5" cy="42.77" r="2.4" fill="#fff" opacity="0.96"/>
                            <circle cx="39.8" cy="48.975" r="1.05" fill="#fff" opacity="0.45"/>
                            <circle cx="57.8" cy="48.975" r="1.05" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.5 46 Q 41 42.5 48.5 46" stroke="#1b5e20" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 51.5 46 Q 59 42.5 66.5 46" stroke="#1b5e20" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 64 Q 50 69.5 57 64" stroke="#558b2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 66 Q 50 59 57 66" stroke="#558b2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="48" r="1"/></g>
                        <g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="48" r="1"/></g>
                </g>

                <!-- SLIME KID — stretchy jelly lump -->
                <g id="tm-mascot-evo1-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-kid-body" cx="38%" cy="28%" r="72%">
                            <stop offset="0%" style="stop-color:#c5e1a5;stop-opacity:0.55" />
                            <stop offset="28%" style="stop-color:#66bb6a;stop-opacity:0.88" />
                            <stop offset="62%" style="stop-color:#2e7d32;stop-opacity:0.96" />
                            <stop offset="100%" style="stop-color:#03140c;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-kid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffff00;stop-opacity:0.9" />
                            <stop offset="42%" style="stop-color:#76ff03;stop-opacity:0.58" />
                            <stop offset="100%" style="stop-color:#004d40;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-kid-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#eeff41;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-kid-gloss" cx="30%" cy="20%" r="50%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.52" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-kid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#aeea00;stop-opacity:0.48" />
                            <stop offset="100%" style="stop-color:#aeea00;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="92" rx="26" ry="4.5" fill="#1a1a1a" opacity="0.24"/>
                        <g class="tm-animate-tail">
                            <path d="M 58 78 Q 74 86 78 72 Q 80 64 72 66 Q 64 72 58 78 Z" fill="#0d3b1e" stroke="#76ff03" stroke-width="1.1"/>
                            <ellipse cx="74" cy="70" rx="3" ry="4" fill="#76ff03" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 32 58 Q 18 58 12 48 Q 8 40 16 42 Q 22 50 28 56 Z" fill="#143d22" stroke="#76ff03" stroke-width="1.2"/>
                            <ellipse cx="14" cy="44" rx="4.5" ry="5.5" fill="#1b5e20" opacity="0.85"/>
                            <circle cx="12" cy="42" r="1.4" fill="#76ff03" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 68 58 Q 82 58 88 48 Q 92 40 84 42 Q 78 50 72 56 Z" fill="#143d22" stroke="#76ff03" stroke-width="1.2"/>
                            <ellipse cx="86" cy="44" rx="4.5" ry="5.5" fill="#1b5e20" opacity="0.85"/>
                            <circle cx="88" cy="42" r="1.4" fill="#76ff03" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Stretchier playful blob -->
                            <path d="M 26 70 Q 22 48 34 32 Q 42 20 50 18 Q 60 20 68 34 Q 78 50 74 72 Q 70 88 56 92 Q 50 94 44 92 Q 28 88 26 70 Z"
                                  fill="url(#slime-kid-body)" stroke="#2e7d32" stroke-width="2.1"/>
                            <ellipse cx="38" cy="38" rx="12" ry="8" fill="url(#slime-kid-gloss)"/>
                            <ellipse cx="42" cy="34" rx="4.2" ry="2.2" fill="#fff" opacity="0.35"/>
                            <ellipse cx="50" cy="56" rx="13" ry="15" fill="url(#slime-kid-core)" opacity="0.78"/>
                            <circle cx="50" cy="58" r="5" fill="#eeff41" opacity="0.5"/>
                            <circle cx="36" cy="68" r="2.6" fill="#b2ff59" opacity="0.32"/>
                            <circle cx="64" cy="72" r="2" fill="#69f0ae" opacity="0.28"/>
                            <!-- More drips -->
                            <path d="M 44 88 Q 42 96 44 98" stroke="#1b5e20" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <path d="M 54 90 Q 56 98 54 100" stroke="#143d22" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <ellipse cx="44" cy="98" rx="2.2" ry="1.8" fill="#0d3b1e" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="40" cy="86" rx="7" ry="3.8" fill="#0a2416" stroke="#2e7d32" stroke-width="1.2"/>
                            <path d="M 38 88 Q 36 94 38 96" stroke="#143d22" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.72"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="60" cy="87" rx="6.5" ry="3.5" fill="#0a2416" stroke="#2e7d32" stroke-width="1.2"/>
                            <path d="M 62 89 Q 64 95 62 97" stroke="#143d22" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.68"/>
                        </g>
                        <!-- Cheeks -->
                        <circle cx="33" cy="51" r="4.2" fill="url(#slime-kid-cheek)"/>
                        <circle cx="67" cy="51" r="4.2" fill="url(#slime-kid-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="44" rx="7.2" ry="8.2" fill="#fff" stroke="#2e7d32" stroke-width="1.5"/>
                            <ellipse cx="60" cy="44" rx="7.2" ry="8.2" fill="#fff" stroke="#2e7d32" stroke-width="1.5"/>
                            <ellipse cx="40.5" cy="44.5" rx="4.032000000000001" ry="4.755999999999999" fill="url(#slime-kid-iris)"/>
                            <ellipse cx="60.5" cy="44.5" rx="4.032000000000001" ry="4.755999999999999" fill="url(#slime-kid-iris)"/>
                            <ellipse cx="40.6" cy="44.8" rx="2.088" ry="2.706" fill="#0a1208"/>
                            <ellipse cx="60.6" cy="44.8" rx="2.088" ry="2.706" fill="#0a1208"/>
                            <circle cx="41.5" cy="40.884" r="2.3040000000000003" fill="#fff" opacity="0.96"/>
                            <circle cx="61.5" cy="40.884" r="2.3040000000000003" fill="#fff" opacity="0.96"/>
                            <circle cx="38.8" cy="46.87" r="1.0080000000000002" fill="#fff" opacity="0.45"/>
                            <circle cx="58.8" cy="46.87" r="1.0080000000000002" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.8 44 Q 40 40.5 47.2 44" stroke="#2e7d32" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.8 44 Q 60 40.5 67.2 44" stroke="#2e7d32" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 41 62 Q 50 69 59 62" stroke="#558b2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 41 64 Q 50 57 59 64" stroke="#558b2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="46" r="1"/></g>
                        <g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="46" r="1"/></g>
                </g>

                <!-- SLIME TEEN — predatory goo blob -->
                <g id="tm-mascot-evo2-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-teen-body" cx="38%" cy="28%" r="72%">
                            <stop offset="0%" style="stop-color:#b2dfdb;stop-opacity:0.42" />
                            <stop offset="22%" style="stop-color:#4caf50;stop-opacity:0.82" />
                            <stop offset="58%" style="stop-color:#1b5e20;stop-opacity:0.96" />
                            <stop offset="100%" style="stop-color:#010a06;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-teen-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffff8d;stop-opacity:0.98" />
                            <stop offset="38%" style="stop-color:#76ff03;stop-opacity:0.65" />
                            <stop offset="100%" style="stop-color:#004d40;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-teen-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#eeff41;stop-opacity:1" />
                            <stop offset="65%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0a1f0a;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-teen-gloss" cx="28%" cy="18%" r="52%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-teen-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#c6ff00;stop-opacity:0.42" />
                            <stop offset="100%" style="stop-color:#c6ff00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-teen-acid" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#eeff41;stop-opacity:0.7" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#1a1a1a" opacity="0.28"/>
                        <g class="tm-animate-tail">
                            <path d="M 64 76 Q 84 84 90 68 Q 92 58 82 60 Q 70 68 64 76 Z" fill="#0a2416" stroke="#aeea00" stroke-width="1.2"/>
                            <ellipse cx="86" cy="64" rx="4" ry="5" fill="#76ff03" opacity="0.38"/>
                            <circle cx="88" cy="62" r="1.5" fill="#eeff41" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 28 54 Q 10 50 6 38 Q 2 28 12 30 Q 18 40 24 50 Z" fill="#0d3b1e" stroke="#aeea00" stroke-width="1.3"/>
                            <ellipse cx="8" cy="32" rx="5.5" ry="6.5" fill="#1b5e20" opacity="0.88"/>
                            <path d="M 6 28 Q 2 24 4 22" stroke="#76ff03" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.6"/>
                            <path d="M 4 26 Q 0 22 2 20" stroke="#76ff03" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 72 54 Q 90 50 94 38 Q 98 28 88 30 Q 82 40 76 50 Z" fill="#0d3b1e" stroke="#aeea00" stroke-width="1.3"/>
                            <ellipse cx="92" cy="32" rx="5.5" ry="6.5" fill="#1b5e20" opacity="0.88"/>
                            <path d="M 94 28 Q 98 24 96 22" stroke="#76ff03" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.6"/>
                            <path d="M 96 26 Q 100 22 98 20" stroke="#76ff03" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Taller predatory goo -->
                            <path d="M 22 68 Q 18 42 30 26 Q 40 12 50 10 Q 62 12 72 28 Q 82 44 78 68 Q 76 88 62 94 Q 50 98 38 94 Q 24 88 22 68 Z"
                                  fill="url(#slime-teen-body)" stroke="#1b5e20" stroke-width="2.3"/>
                            <ellipse cx="36" cy="34" rx="14" ry="10" fill="url(#slime-teen-gloss)"/>
                            <ellipse cx="40" cy="30" rx="5" ry="2.5" fill="#fff" opacity="0.3"/>
                            <ellipse cx="50" cy="54" rx="16" ry="18" fill="url(#slime-teen-core)" opacity="0.85"/>
                            <ellipse cx="50" cy="56" rx="10" ry="12" fill="url(#slime-teen-acid)" opacity="0.55"/>
                            <circle cx="50" cy="58" r="6" fill="#eeff41" opacity="0.58"/>
                            <circle cx="47" cy="54" r="1.8" fill="#fffde7" opacity="0.48"/>
                            <circle cx="38" cy="68" r="2.8" fill="#b2ff59" opacity="0.3"/>
                            <circle cx="62" cy="72" r="2.2" fill="#69f0ae" opacity="0.26"/>
                            <path d="M 42 90 Q 40 100 42 102" stroke="#1b5e20" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.76"/>
                            <path d="M 52 92 Q 54 102 52 104" stroke="#0d3b1e" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <ellipse cx="42" cy="102" rx="2.5" ry="2" fill="#143d22" opacity="0.72"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="36" cy="88" rx="9" ry="5" fill="#0a2416" stroke="#1b5e20" stroke-width="1.3"/>
                            <path d="M 34 90 Q 32 98 34 100" stroke="#143d22" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.74"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="64" cy="88" rx="9" ry="5" fill="#0a2416" stroke="#1b5e20" stroke-width="1.3"/>
                            <path d="M 66 90 Q 68 98 66 100" stroke="#143d22" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.7"/>
                        </g>
                        <!-- Cheeks -->
                        <circle cx="32" cy="47" r="4.2" fill="url(#slime-teen-cheek)"/>
                        <circle cx="68" cy="47" r="4.2" fill="url(#slime-teen-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="39" cy="40" rx="6.8" ry="7.8" fill="#fff" stroke="#1b5e20" stroke-width="1.5"/>
                            <ellipse cx="61" cy="40" rx="6.8" ry="7.8" fill="#fff" stroke="#1b5e20" stroke-width="1.5"/>
                            <ellipse cx="39.5" cy="40.5" rx="3.8080000000000003" ry="4.524" fill="url(#slime-teen-iris)"/>
                            <ellipse cx="61.5" cy="40.5" rx="3.8080000000000003" ry="4.524" fill="url(#slime-teen-iris)"/>
                            <ellipse cx="39.6" cy="40.8" rx="1.9719999999999998" ry="2.574" fill="#0a1208"/>
                            <ellipse cx="61.6" cy="40.8" rx="1.9719999999999998" ry="2.574" fill="#0a1208"/>
                            <circle cx="40.5" cy="37.036" r="2.176" fill="#fff" opacity="0.96"/>
                            <circle cx="62.5" cy="37.036" r="2.176" fill="#fff" opacity="0.96"/>
                            <circle cx="37.8" cy="42.73" r="0.9520000000000001" fill="#fff" opacity="0.45"/>
                            <circle cx="59.8" cy="42.73" r="0.9520000000000001" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.2 40 Q 39 36.5 45.8 40" stroke="#1b5e20" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 54.2 40 Q 61 36.5 67.8 40" stroke="#1b5e20" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 40 58 Q 50 66 60 58" stroke="#33691e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 60 Q 50 53 60 60" stroke="#33691e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path d="M 44 57 L 43 61 M 56 57 L 57 61" stroke="#eeff41" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
                        <g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="42" r="1"/></g>
                        <g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="42" r="1"/></g>
                </g>

                <!-- SLIME ADULT — majestic jelly mass -->
                <g id="tm-mascot-evo3-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-adult-body" cx="38%" cy="28%" r="72%">
                            <stop offset="0%" style="stop-color:#c8e6c9;stop-opacity:0.45" />
                            <stop offset="18%" style="stop-color:#66bb6a;stop-opacity:0.78" />
                            <stop offset="50%" style="stop-color:#2e7d32;stop-opacity:0.94" />
                            <stop offset="100%" style="stop-color:#010a06;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-adult-layer" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#a5d6a7;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-adult-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffff00;stop-opacity:0.96" />
                            <stop offset="32%" style="stop-color:#76ff03;stop-opacity:0.68" />
                            <stop offset="100%" style="stop-color:#004d40;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-adult-iris" cx="35%" cy="28%" r="65%">
                            <stop offset="0%" style="stop-color:#ffff8d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#aeea00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-adult-gloss" cx="26%" cy="16%" r="54%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-adult-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-adult-rim" cx="50%" cy="50%" r="50%">
                            <stop offset="60%" style="stop-color:#69f0ae;stop-opacity:0" />
                            <stop offset="100%" style="stop-color:#69f0ae;stop-opacity:0.28" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="34" ry="5" fill="#1a1a1a" opacity="0.3"/>
                        <g class="tm-animate-tail">
                            <path d="M 66 78 Q 88 88 94 70 Q 96 58 86 60 Q 72 68 66 78 Z" fill="#0a2416" stroke="#69f0ae" stroke-width="1.3"/>
                            <ellipse cx="90" cy="66" rx="5" ry="6" fill="#76ff03" opacity="0.32"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 26 56 Q 8 52 4 40 Q 0 28 10 30 Q 16 40 22 52 Z" fill="#0d3b1e" stroke="#69f0ae" stroke-width="1.4"/>
                            <ellipse cx="6" cy="32" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.86"/>
                            <ellipse cx="4" cy="28" rx="2.5" ry="3" fill="#76ff03" opacity="0.38"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 74 56 Q 92 52 96 40 Q 100 28 90 30 Q 84 40 78 52 Z" fill="#0d3b1e" stroke="#69f0ae" stroke-width="1.4"/>
                            <ellipse cx="94" cy="32" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.86"/>
                            <ellipse cx="96" cy="28" rx="2.5" ry="3" fill="#76ff03" opacity="0.38"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Majestic jelly mass — layered translucency, heroic stance -->
                            <path d="M 18 72 Q 14 46 28 28 Q 38 12 50 10 Q 64 12 76 32 Q 86 52 82 74 Q 80 90 64 96 Q 50 100 36 96 Q 20 90 18 72 Z"
                                  fill="url(#slime-adult-body)" stroke="#0d2818" stroke-width="2.5"/>
                            <ellipse cx="50" cy="58" rx="30" ry="34" fill="url(#slime-adult-rim)"/>
                            <ellipse cx="50" cy="62" rx="22" ry="26" fill="url(#slime-adult-layer)" opacity="0.65"/>
                            <ellipse cx="36" cy="32" rx="16" ry="12" fill="url(#slime-adult-gloss)"/>
                            <ellipse cx="40" cy="28" rx="6" ry="3" fill="#fff" opacity="0.3"/>
                            <ellipse cx="50" cy="58" rx="17" ry="21" fill="url(#slime-adult-core)" opacity="0.84"/>
                            <circle cx="50" cy="60" r="7.5" fill="#eeff41" opacity="0.52"/>
                            <circle cx="47" cy="56" r="2" fill="#fffde7" opacity="0.5"/>
                            <circle cx="36" cy="66" r="3.2" fill="#b2ff59" opacity="0.28"/>
                            <circle cx="64" cy="70" r="2.6" fill="#69f0ae" opacity="0.26"/>
                            <circle cx="56" cy="40" r="1.8" fill="#fff" opacity="0.18"/>
                            <!-- Dramatic drips -->
                            <path d="M 38 92 Q 36 104 38 108" stroke="#1b5e20" stroke-width="4.2" fill="none" stroke-linecap="round" opacity="0.78"/>
                            <path d="M 50 94 Q 52 106 50 110" stroke="#0d3b1e" stroke-width="3.8" fill="none" stroke-linecap="round" opacity="0.74"/>
                            <path d="M 60 92 Q 62 100 60 104" stroke="#143d22" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <ellipse cx="38" cy="108" rx="3.2" ry="2.5" fill="#0a2416" opacity="0.78"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="36" cy="90" rx="10" ry="5.5" fill="#0a2416" stroke="#0d2818" stroke-width="1.5"/>
                            <path d="M 34 92 Q 32 100 34 104" stroke="#143d22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity="0.76"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="64" cy="90" rx="10" ry="5.5" fill="#0a2416" stroke="#0d2818" stroke-width="1.5"/>
                            <path d="M 66 92 Q 68 100 66 104" stroke="#143d22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity="0.72"/>
                        </g>
                        <!-- Cheeks -->
                        <circle cx="31" cy="45" r="4.2" fill="url(#slime-adult-cheek)"/>
                        <circle cx="69" cy="45" r="4.2" fill="url(#slime-adult-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="38" cy="38" rx="6.8" ry="7.8" fill="#fff" stroke="#0d2818" stroke-width="1.5"/>
                            <ellipse cx="62" cy="38" rx="6.8" ry="7.8" fill="#fff" stroke="#0d2818" stroke-width="1.5"/>
                            <ellipse cx="38.5" cy="38.5" rx="3.8080000000000003" ry="4.524" fill="url(#slime-adult-iris)"/>
                            <ellipse cx="62.5" cy="38.5" rx="3.8080000000000003" ry="4.524" fill="url(#slime-adult-iris)"/>
                            <ellipse cx="38.6" cy="38.8" rx="1.9719999999999998" ry="2.574" fill="#0a1208"/>
                            <ellipse cx="62.6" cy="38.8" rx="1.9719999999999998" ry="2.574" fill="#0a1208"/>
                            <circle cx="39.5" cy="35.036" r="2.176" fill="#fff" opacity="0.96"/>
                            <circle cx="63.5" cy="35.036" r="2.176" fill="#fff" opacity="0.96"/>
                            <circle cx="36.8" cy="40.73" r="0.9520000000000001" fill="#fff" opacity="0.45"/>
                            <circle cx="60.8" cy="40.73" r="0.9520000000000001" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 31.2 38 Q 38 34.5 44.8 38" stroke="#0d2818" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 55.2 38 Q 62 34.5 68.8 38" stroke="#0d2818" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 39 56 Q 50 64 61 56" stroke="#1b5e20" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 39 58 Q 50 51 61 58" stroke="#1b5e20" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="44" r="1"/></g>
                        <g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="44" r="1"/></g>
                </g>

                <!-- SLIME MIDDLE AGE — heavy molten ooze -->
                <g id="tm-mascot-evo4-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-middle-body" cx="38%" cy="28%" r="72%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:0.44" />
                            <stop offset="24%" style="stop-color:#558b2f;stop-opacity:0.82" />
                            <stop offset="58%" style="stop-color:#33691e;stop-opacity:0.95" />
                            <stop offset="100%" style="stop-color:#020f0a;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-middle-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff6d00;stop-opacity:0.88" />
                            <stop offset="40%" style="stop-color:#eeff41;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-middle-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#ffab40;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-middle-gloss" cx="30%" cy="22%" r="50%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.42" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-middle-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a65;stop-opacity:0.45" />
                            <stop offset="100%" style="stop-color:#ff8a65;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-middle-crack" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff6d00;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="32" ry="4.5" fill="#1a1a1a" opacity="0.32"/>
                        <g class="tm-animate-tail">
                            <path d="M 62 80 Q 80 88 86 74 Q 88 66 78 68 Q 68 74 62 80 Z" fill="#0a2416" stroke="#ffab40" stroke-width="1.2"/>
                            <ellipse cx="82" cy="72" rx="3.5" ry="4" fill="#ff6d00" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 28 62 Q 12 64 8 52 Q 4 42 14 44 Q 20 52 26 60 Z" fill="#143d22" stroke="#ffab40" stroke-width="1.3"/>
                            <ellipse cx="10" cy="46" rx="5.5" ry="6.5" fill="#33691e" opacity="0.82"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 72 62 Q 88 64 92 52 Q 96 42 86 44 Q 80 52 74 60 Z" fill="#143d22" stroke="#ffab40" stroke-width="1.3"/>
                            <ellipse cx="90" cy="46" rx="5.5" ry="6.5" fill="#33691e" opacity="0.82"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Heavy molten ooze — orange core cracks, no crust plates -->
                            <path d="M 22 72 Q 18 50 30 34 Q 40 22 50 20 Q 62 22 72 36 Q 82 52 78 74 Q 76 90 62 96 Q 50 100 38 96 Q 24 90 22 72 Z"
                                  fill="url(#slime-middle-body)" stroke="#33691e" stroke-width="2.4"/>
                            <ellipse cx="36" cy="38" rx="13" ry="9" fill="url(#slime-middle-gloss)"/>
                            <ellipse cx="40" cy="34" rx="4.5" ry="2.2" fill="#fff" opacity="0.24"/>
                            <ellipse cx="50" cy="58" rx="15" ry="17" fill="url(#slime-middle-core)" opacity="0.78"/>
                            <path d="M 42 52 Q 50 48 58 54 Q 54 66 48 68 Q 42 64 42 52 Z" fill="url(#slime-middle-crack)" opacity="0.32"/>
                            <path d="M 46 56 L 52 62 M 48 50 L 54 56" stroke="#ff6d00" stroke-width="1.4" fill="none" opacity="0.55" stroke-linecap="round"/>
                            <path d="M 44 64 Q 50 60 56 66" stroke="#ffab40" stroke-width="1.2" fill="none" opacity="0.45"/>
                            <circle cx="50" cy="60" r="4.5" fill="#ffab40" opacity="0.58"/>
                            <circle cx="38" cy="68" r="2.4" fill="#eeff41" opacity="0.26"/>
                            <circle cx="62" cy="72" r="2" fill="#ff6d00" opacity="0.32"/>
                            <!-- Slow thick drips -->
                            <path d="M 42 90 Q 40 102 42 106" stroke="#33691e" stroke-width="4.8" fill="none" stroke-linecap="round" opacity="0.82"/>
                            <path d="M 54 92 Q 56 104 54 108" stroke="#1b5e20" stroke-width="4.4" fill="none" stroke-linecap="round" opacity="0.78"/>
                            <ellipse cx="42" cy="106" rx="3.5" ry="2.5" fill="#0a2416" opacity="0.82"/>
                            <ellipse cx="54" cy="108" rx="3" ry="2" fill="#0a2416" opacity="0.78"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="90" rx="10" ry="6" fill="#0a2416" stroke="#33691e" stroke-width="1.4"/>
                            <ellipse cx="36" cy="94" rx="4" ry="3" fill="#1b5e20" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="90" rx="10" ry="6" fill="#0a2416" stroke="#33691e" stroke-width="1.4"/>
                            <ellipse cx="64" cy="94" rx="4" ry="3" fill="#1b5e20" opacity="0.5"/>
                        </g>
                        <!-- Cheeks -->
                        <circle cx="34" cy="51" r="4.2" fill="url(#slime-middle-cheek)"/>
                        <circle cx="66" cy="51" r="4.2" fill="url(#slime-middle-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="44" rx="6.2" ry="6.8" fill="#fff8e1" stroke="#33691e" stroke-width="1.5"/>
                            <ellipse cx="59" cy="44" rx="6.2" ry="6.8" fill="#fff8e1" stroke="#33691e" stroke-width="1.5"/>
                            <ellipse cx="41.5" cy="44.5" rx="3.4720000000000004" ry="3.9439999999999995" fill="url(#slime-middle-iris)"/>
                            <ellipse cx="59.5" cy="44.5" rx="3.4720000000000004" ry="3.9439999999999995" fill="url(#slime-middle-iris)"/>
                            <ellipse cx="41.6" cy="44.8" rx="1.7979999999999998" ry="2.244" fill="#0a1208"/>
                            <ellipse cx="59.6" cy="44.8" rx="1.7979999999999998" ry="2.244" fill="#0a1208"/>
                            <circle cx="42.5" cy="41.416" r="1.9840000000000002" fill="#fff" opacity="0.96"/>
                            <circle cx="60.5" cy="41.416" r="1.9840000000000002" fill="#fff" opacity="0.96"/>
                            <circle cx="39.8" cy="46.38" r="0.8680000000000001" fill="#fff" opacity="0.45"/>
                            <circle cx="57.8" cy="46.38" r="0.8680000000000001" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 34.8 44 Q 41 40.5 47.2 44" stroke="#33691e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.8 44 Q 59 40.5 65.2 44" stroke="#33691e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 42 56 Q 50 61 58 56" stroke="#558b2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 58 Q 50 51 58 58" stroke="#558b2f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="48" r="1"/></g>
                        <g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="48" r="1"/></g>
                </g>

                <!-- SLIME OLD — sprawling primordial puddle -->
                <g id="tm-mascot-evo5-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-old-body" cx="38%" cy="28%" r="72%">
                            <stop offset="0%" style="stop-color:#4caf50;stop-opacity:0.48" />
                            <stop offset="28%" style="stop-color:#1b5e20;stop-opacity:0.9" />
                            <stop offset="68%" style="stop-color:#0d2818;stop-opacity:0.97" />
                            <stop offset="100%" style="stop-color:#010805;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-old-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.24" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-old-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#e040fb;stop-opacity:0.88" />
                            <stop offset="42%" style="stop-color:#76ff03;stop-opacity:0.48" />
                            <stop offset="100%" style="stop-color:#004d40;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-old-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#ea80fc;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="slime-old-gloss" cx="34%" cy="28%" r="48%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-old-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ce93d8;stop-opacity:0.42" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="slime-old-void" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#7c4dff;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="58" rx="48" ry="44" fill="url(#slime-old-aura)"/>
                        <ellipse cx="50" cy="96" rx="40" ry="5" fill="#1a1a1a" opacity="0.38"/>
                        <ellipse cx="50" cy="90" rx="38" ry="12" fill="#010805" opacity="0.78"/>
                        <ellipse cx="26" cy="88" rx="10" ry="5" fill="#0a2416" opacity="0.58"/>
                        <ellipse cx="76" cy="89" rx="9" ry="4.5" fill="#0a2416" opacity="0.52"/>
                        <g class="tm-animate-tail">
                            <path d="M 60 82 Q 82 92 90 74 Q 92 64 80 66 Q 68 74 60 82 Z" fill="#02140c" stroke="#ea80fc" stroke-width="1.3"/>
                            <ellipse cx="86" cy="70" rx="4" ry="5" fill="#e040fb" opacity="0.38"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 26 70 Q 8 74 2 58 Q -2 46 8 48 Q 14 58 22 68 Z" fill="#0d2818" stroke="#ea80fc" stroke-width="1.3"/>
                            <ellipse cx="4" cy="52" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.78"/>
                            <circle cx="4" cy="50" r="2" fill="#e040fb" opacity="0.48"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 74 70 Q 92 74 98 58 Q 102 46 92 48 Q 86 58 78 68 Z" fill="#0d2818" stroke="#ea80fc" stroke-width="1.3"/>
                            <ellipse cx="96" cy="52" rx="6.5" ry="7.5" fill="#1b5e20" opacity="0.78"/>
                            <circle cx="96" cy="50" r="2" fill="#e040fb" opacity="0.48"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Sprawling primordial puddle -->
                            <path d="M 14 76 Q 12 50 26 36 Q 38 24 50 22 Q 64 24 76 40 Q 88 56 86 76 Q 84 90 68 96 Q 50 100 32 96 Q 16 90 14 76 Z"
                                  fill="url(#slime-old-body)" stroke="#0d2818" stroke-width="2.5"/>
                            <ellipse cx="38" cy="42" rx="14" ry="10" fill="url(#slime-old-gloss)"/>
                            <ellipse cx="42" cy="38" rx="5" ry="2.5" fill="#fff" opacity="0.22"/>
                            <ellipse cx="50" cy="64" rx="18" ry="15" fill="url(#slime-old-core)" opacity="0.86"/>
                            <ellipse cx="50" cy="66" rx="10" ry="8" fill="url(#slime-old-void)" opacity="0.45"/>
                            <circle cx="50" cy="66" r="6.5" fill="#ea80fc" opacity="0.58"/>
                            <circle cx="47" cy="62" r="1.8" fill="#f3e5f5" opacity="0.52"/>
                            <circle cx="34" cy="60" r="3" fill="#76ff03" opacity="0.26"/>
                            <circle cx="66" cy="66" r="2.5" fill="#ea80fc" opacity="0.3"/>
                            <!-- Third eye floating in goo -->
                            <ellipse cx="50" cy="38" rx="5" ry="4" fill="#010a06" stroke="#ea80fc" stroke-width="1.2" opacity="0.92"/>
                            <ellipse cx="50" cy="38" rx="2.6" ry="2.2" fill="url(#slime-old-iris)"/>
                            <ellipse cx="50.2" cy="38.2" rx="1.1" ry="1.4" fill="#0a0618"/>
                            <circle cx="50.8" cy="37" r="0.85" fill="#f3e5f5"/>
                            <!-- Drip fringe -->
                            <path d="M 28 90 Q 26 100 28 102" stroke="#0d2818" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <path d="M 42 94 Q 40 106 42 108" stroke="#1b5e20" stroke-width="4.2" fill="none" stroke-linecap="round" opacity="0.8"/>
                            <path d="M 54 94 Q 56 106 54 108" stroke="#1b5e20" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.76"/>
                            <path d="M 68 90 Q 70 100 68 102" stroke="#0d2818" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <path d="M 36 88 Q 34 94 36 96" stroke="#33691e" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
                            <path d="M 62 88 Q 64 94 62 96" stroke="#33691e" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.58"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="92" rx="11" ry="5" fill="#02140c" stroke="#0d2818" stroke-width="1.4"/>
                            <path d="M 34 94 Q 30 102 32 104" stroke="#0d2818" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="92" rx="11" ry="5" fill="#02140c" stroke="#0d2818" stroke-width="1.4"/>
                            <path d="M 66 94 Q 70 102 68 104" stroke="#0d2818" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.68"/>
                        </g>
                        <!-- Cheeks -->
                        <circle cx="32" cy="59" r="4.2" fill="url(#slime-old-cheek)"/>
                        <circle cx="68" cy="59" r="4.2" fill="url(#slime-old-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="39" cy="52" rx="5.8" ry="6.5" fill="#fff" stroke="#0d2818" stroke-width="1.5"/>
                            <ellipse cx="61" cy="52" rx="5.8" ry="6.5" fill="#fff" stroke="#0d2818" stroke-width="1.5"/>
                            <ellipse cx="39.5" cy="52.5" rx="3.248" ry="3.7699999999999996" fill="url(#slime-old-iris)"/>
                            <ellipse cx="61.5" cy="52.5" rx="3.248" ry="3.7699999999999996" fill="url(#slime-old-iris)"/>
                            <ellipse cx="39.6" cy="52.8" rx="1.682" ry="2.145" fill="#0a1208"/>
                            <ellipse cx="61.6" cy="52.8" rx="1.682" ry="2.145" fill="#0a1208"/>
                            <circle cx="40.5" cy="49.53" r="1.8559999999999999" fill="#fff" opacity="0.96"/>
                            <circle cx="62.5" cy="49.53" r="1.8559999999999999" fill="#fff" opacity="0.96"/>
                            <circle cx="37.8" cy="54.275" r="0.812" fill="#fff" opacity="0.45"/>
                            <circle cx="59.8" cy="54.275" r="0.812" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.2 52 Q 39 48.5 44.8 52" stroke="#0d2818" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 55.2 52 Q 61 48.5 66.8 52" stroke="#0d2818" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 41 64 Q 50 69.5 59 64" stroke="#69f0ae" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 41 66 Q 50 59 59 66" stroke="#69f0ae" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <g class="tm-animate-wing-left" opacity="0"><circle cx="18" cy="54" r="1"/></g>
                        <g class="tm-animate-wing-right" opacity="0"><circle cx="82" cy="54" r="1"/></g>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- PLANT CHARACTER - All Life Stages (dense cute epic v3) -->
                <!-- Wildwood & Life • Rare Rarity • Worldroot Warden -->
                <!-- ═══════════════════════════════════════ -->

                <!-- PLANT BABY — sprout ward -->
                <g id="tm-mascot-baby-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-baby-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#d4ff9a;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#8bc34a;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-baby-leaf-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-baby-bark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#bcaaa4;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#795548;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4e342e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-baby-bark-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="plant-baby-bulb" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-baby-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-baby-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-baby-bloom" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e91e63;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-baby-amber" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb300;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-baby-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.22" />
                            <stop offset="55%" style="stop-color:#aed581;stop-opacity:0.12" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="plant-baby-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="plant-baby-sap" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="90" rx="26" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <!-- Vine nub tail -->
                        <g class="tm-animate-tail">
                            <path d="M 64 72 Q 74 76 78 70 Q 80 64 76 62 Q 72 60 70 64"
                                  fill="url(#plant-baby-leaf-dark)" stroke="#33691e" stroke-width="1.4"/>
                            <path d="M 72 66 Q 76 64 78 68" fill="none" stroke="#aed581" stroke-width="0.7" opacity="0.65"/>
                            <ellipse cx="77" cy="63" rx="2.5" ry="3.5" fill="url(#plant-baby-leaf)" stroke="#33691e" stroke-width="0.8" transform="rotate(20 77 63)"/>
                        </g>
                        <!-- Cotyledon wing nubs -->
                        <g class="tm-animate-wing-left">
                            <ellipse cx="28" cy="56" rx="5.5" ry="8" fill="url(#plant-baby-wing)" stroke="#558b2f" stroke-width="1.1" transform="rotate(-22 28 56)"/>
                            <path d="M 26 52 Q 24 56 26 60" stroke="#33691e" stroke-width="0.7" fill="none" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <ellipse cx="72" cy="56" rx="5.5" ry="8" fill="url(#plant-baby-wing)" stroke="#558b2f" stroke-width="1.1" transform="rotate(22 72 56)"/>
                            <path d="M 74 52 Q 76 56 74 60" stroke="#33691e" stroke-width="0.7" fill="none" opacity="0.55"/>
                        </g>
                        <!-- Cracked pot + stem -->
                        <g class="tm-animate-body">
                            <path d="M 32 78 L 36 92 L 64 92 L 68 78 Z" fill="url(#plant-baby-bark)" stroke="#3e2723" stroke-width="1.8"/>
                            <ellipse cx="50" cy="78" rx="18" ry="4.5" fill="#6d4c41" stroke="#4e342e" stroke-width="0.8"/>
                            <ellipse cx="50" cy="76" rx="15" ry="3" fill="#5d4037"/>
                            <!-- Cracks -->
                            <path d="M 38 80 L 42 88 M 44 79 L 46 90 M 56 79 L 54 91 M 62 81 L 58 89" stroke="#3e2723" stroke-width="1.1" stroke-linecap="round" opacity="0.65"/>
                            <path d="M 40 84 Q 44 86 48 84" stroke="#8d6e63" stroke-width="0.7" fill="none" opacity="0.4"/>
                            <!-- Soil -->
                            <ellipse cx="50" cy="77" rx="14" ry="2.5" fill="#4e342e"/>
                            <circle cx="44" cy="76" r="1.2" fill="#3e2723" opacity="0.45"/>
                            <circle cx="56" cy="76.5" r="1" fill="#3e2723" opacity="0.4"/>
                            <!-- Tiny stem -->
                            <rect x="47" y="62" width="6" ry="1" height="16" rx="2" fill="url(#plant-baby-bark-shade)" stroke="#4e342e" stroke-width="0.9"/>
                            <path d="M 48 68 Q 50 69 52 68" stroke="#5d4037" stroke-width="0.6" fill="none" opacity="0.45"/>
                        </g>
                        <!-- Tiny leaf arms -->
                        <g class="tm-animate-arm-left">
                            <path d="M 34 66 Q 22 64 18 58 Q 16 54 20 54" fill="none" stroke="#558b2f" stroke-width="2.8" stroke-linecap="round"/>
                            <ellipse cx="18" cy="55" rx="4.5" ry="6" fill="url(#plant-baby-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(-35 18 55)"/>
                            <path d="M 17 52 Q 18 56 17 59" stroke="#2e7d32" stroke-width="0.6" fill="none" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 66 66 Q 78 64 82 58 Q 84 54 80 54" fill="none" stroke="#558b2f" stroke-width="2.8" stroke-linecap="round"/>
                            <ellipse cx="82" cy="55" rx="4.5" ry="6" fill="url(#plant-baby-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(35 82 55)"/>
                            <path d="M 83 52 Q 82 56 83 59" stroke="#2e7d32" stroke-width="0.6" fill="none" opacity="0.55"/>
                        </g>
                        <!-- Root feet -->
                        <g class="tm-animate-leg-left">
                            <path d="M 40 90 Q 34 94 32 98 Q 30 100 34 99" stroke="url(#plant-baby-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
                            <path d="M 44 91 Q 40 96 42 99" stroke="url(#plant-baby-bark-shade)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                            <ellipse cx="33" cy="99" rx="3.5" ry="1.8" fill="#3e2723"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 60 90 Q 66 94 68 98 Q 70 100 66 99" stroke="url(#plant-baby-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
                            <path d="M 56 91 Q 60 96 58 99" stroke="url(#plant-baby-bark-shade)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                            <ellipse cx="67" cy="99" rx="3.5" ry="1.8" fill="#3e2723"/>
                        </g>
                        <!-- Bulb head (oversized) -->
                        <ellipse cx="50" cy="40" rx="20" ry="18" fill="url(#plant-baby-bulb)" stroke="#558b2f" stroke-width="2"/>
                        <ellipse cx="42" cy="33" rx="7" ry="4.5" fill="#fff" opacity="0.22"/>
                        <!-- Sprout tuft -->
                        <ellipse cx="50" cy="22" rx="4" ry="7" fill="url(#plant-baby-leaf)" stroke="#33691e" stroke-width="0.9"/>
                        <ellipse cx="42" cy="26" rx="3.5" ry="5.5" fill="url(#plant-baby-leaf)" stroke="#33691e" stroke-width="0.8" transform="rotate(-25 42 26)"/>
                        <ellipse cx="58" cy="26" rx="3.5" ry="5.5" fill="url(#plant-baby-leaf)" stroke="#33691e" stroke-width="0.8" transform="rotate(25 58 26)"/>
                        <circle cx="38" cy="44" r="1.3" fill="#33691e" opacity="0.25"/>
                        <circle cx="62" cy="46" r="1.3" fill="#33691e" opacity="0.25"/>
                        <circle cx="46" cy="52" r="1.1" fill="#33691e" opacity="0.2"/>
                        <circle cx="34" cy="46" r="4" fill="url(#plant-baby-cheek)"/>
                        <circle cx="66" cy="46" r="4" fill="url(#plant-baby-cheek)"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="38" rx="7.5" ry="9.2" fill="#fff" stroke="#558b2f" stroke-width="1.4"/>
                            <ellipse cx="60" cy="38" rx="7.5" ry="9.2" fill="#fff" stroke="#558b2f" stroke-width="1.4"/>
                            <ellipse cx="41" cy="39.5" rx="4.2" ry="5.427999999999999" fill="url(#plant-baby-iris)"/>
                            <ellipse cx="61" cy="39.5" rx="4.2" ry="5.427999999999999" fill="url(#plant-baby-iris)"/>
                            <ellipse cx="41" cy="39.8" rx="2.175" ry="3.036" fill="#0d1a08"/>
                            <ellipse cx="61" cy="39.8" rx="2.175" ry="3.036" fill="#0d1a08"/>
                            <circle cx="42.5" cy="35.976" r="2.4" fill="#fff" opacity="0.95"/>
                            <circle cx="62.5" cy="35.976" r="2.4" fill="#fff" opacity="0.95"/>
                            <circle cx="39.2" cy="41.036" r="0.9750000000000001" fill="#fff" opacity="0.5"/>
                            <circle cx="59.2" cy="41.036" r="0.9750000000000001" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.5 39 Q 40 34.78 47.5 39" stroke="#558b2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.5 39 Q 60 34.78 67.5 39" stroke="#558b2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 50 Q 50 55.5 57 50" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 52 Q 50 46 57 52" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT KID — sapling scout -->
                <g id="tm-mascot-evo1-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-kid-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#d4ff9a;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#8bc34a;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-kid-leaf-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-kid-bark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#bcaaa4;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#795548;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4e342e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-kid-bark-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="plant-kid-bulb" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-kid-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-kid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-kid-bloom" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e91e63;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-kid-amber" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb300;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-kid-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.22" />
                            <stop offset="55%" style="stop-color:#aed581;stop-opacity:0.12" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="plant-kid-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="plant-kid-sap" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="92" rx="28" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <g class="tm-animate-tail">
                            <path d="M 66 68 Q 82 74 86 64 Q 88 56 80 54 Q 74 52 72 58"
                                  fill="none" stroke="#558b2f" stroke-width="3" stroke-linecap="round"/>
                            <path d="M 72 60 Q 78 58 82 62" fill="none" stroke="#aed581" stroke-width="0.8" opacity="0.55"/>
                            <ellipse cx="84" cy="58" rx="3" ry="4.5" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(15 84 58)"/>
                            <ellipse cx="80" cy="64" rx="2.5" ry="3.5" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="0.7" transform="rotate(-10 80 64)"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 30 50 Q 16 42 14 32 Q 13 26 18 28 Q 24 38 30 48 Z"
                                  fill="url(#plant-kid-wing)" stroke="#558b2f" stroke-width="1.3"/>
                            <path d="M 20 32 Q 22 38 26 44" stroke="#33691e" stroke-width="0.75" fill="none" opacity="0.5"/>
                            <path d="M 24 34 Q 26 40 29 46" stroke="#33691e" stroke-width="0.65" fill="none" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 70 50 Q 84 42 86 32 Q 87 26 82 28 Q 76 38 70 48 Z"
                                  fill="url(#plant-kid-wing)" stroke="#558b2f" stroke-width="1.3"/>
                            <path d="M 80 32 Q 78 38 74 44" stroke="#33691e" stroke-width="0.75" fill="none" opacity="0.5"/>
                            <path d="M 76 34 Q 74 40 71 46" stroke="#33691e" stroke-width="0.65" fill="none" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Taller sapling trunk -->
                            <path d="M 44 88 L 42 52 Q 50 46 58 52 L 56 88 Z" fill="url(#plant-kid-bark)" stroke="#4e342e" stroke-width="1.6"/>
                            <path d="M 46 60 Q 50 62 54 60" stroke="#3e2723" stroke-width="0.8" fill="none" opacity="0.45"/>
                            <path d="M 45 72 Q 50 74 55 72" stroke="#3e2723" stroke-width="0.75" fill="none" opacity="0.4"/>
                            <path d="M 46 82 Q 50 84 54 82" stroke="#3e2723" stroke-width="0.7" fill="none" opacity="0.35"/>
                            <!-- Canopy puff -->
                            <ellipse cx="50" cy="38" rx="18" ry="16" fill="url(#plant-kid-leaf)" stroke="#558b2f" stroke-width="1.8"/>
                            <ellipse cx="42" cy="32" rx="7" ry="4" fill="#fff" opacity="0.18"/>
                            <ellipse cx="36" cy="36" rx="7" ry="10" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(-28 36 36)"/>
                            <ellipse cx="64" cy="36" rx="7" ry="10" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="0.9" transform="rotate(28 64 36)"/>
                            <ellipse cx="50" cy="26" rx="6" ry="9" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="0.9"/>
                            <!-- Freckle dots -->
                            <circle cx="40" cy="40" r="1.1" fill="#33691e" opacity="0.35"/>
                            <circle cx="48" cy="36" r="0.9" fill="#33691e" opacity="0.3"/>
                            <circle cx="56" cy="39" r="1" fill="#33691e" opacity="0.32"/>
                            <circle cx="44" cy="44" r="0.8" fill="#33691e" opacity="0.28"/>
                            <circle cx="58" cy="43" r="0.85" fill="#33691e" opacity="0.28"/>
                            <circle cx="52" cy="48" r="0.9" fill="#33691e" opacity="0.25"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 42 54 Q 28 52 20 46 Q 16 42 22 40" fill="none" stroke="url(#plant-kid-bark)" stroke-width="3.5" stroke-linecap="round"/>
                            <path d="M 24 44 Q 18 42 16 46" fill="none" stroke="url(#plant-kid-bark)" stroke-width="2.5" stroke-linecap="round"/>
                            <ellipse cx="14" cy="44" rx="5" ry="6.5" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(-20 14 44)"/>
                            <path d="M 13 41 Q 14 45 13 48" stroke="#2e7d32" stroke-width="0.65" fill="none" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 58 54 Q 72 52 80 46 Q 84 42 78 40" fill="none" stroke="url(#plant-kid-bark)" stroke-width="3.5" stroke-linecap="round"/>
                            <path d="M 76 44 Q 82 42 84 46" fill="none" stroke="url(#plant-kid-bark)" stroke-width="2.5" stroke-linecap="round"/>
                            <ellipse cx="86" cy="44" rx="5" ry="6.5" fill="url(#plant-kid-leaf)" stroke="#33691e" stroke-width="1.1" transform="rotate(20 86 44)"/>
                            <path d="M 87 41 Q 86 45 87 48" stroke="#2e7d32" stroke-width="0.65" fill="none" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 44 88 Q 38 94 36 98" stroke="url(#plant-kid-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                            <path d="M 46 89 Q 42 95 44 99" stroke="url(#plant-kid-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <ellipse cx="37" cy="99" rx="4.5" ry="2.2" fill="#3e2723"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 56 88 Q 62 94 64 98" stroke="url(#plant-kid-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                            <path d="M 54 89 Q 58 95 56 99" stroke="url(#plant-kid-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <ellipse cx="63" cy="99" rx="4.5" ry="2.2" fill="#3e2723"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="36" rx="7" ry="8.2" fill="#fff" stroke="#558b2f" stroke-width="1.4"/>
                            <ellipse cx="59" cy="36" rx="7" ry="8.2" fill="#fff" stroke="#558b2f" stroke-width="1.4"/>
                            <ellipse cx="42" cy="37.5" rx="3.9200000000000004" ry="4.837999999999999" fill="url(#plant-kid-iris)"/>
                            <ellipse cx="60" cy="37.5" rx="3.9200000000000004" ry="4.837999999999999" fill="url(#plant-kid-iris)"/>
                            <ellipse cx="42" cy="37.8" rx="2.03" ry="2.706" fill="#0d1a08"/>
                            <ellipse cx="60" cy="37.8" rx="2.03" ry="2.706" fill="#0d1a08"/>
                            <circle cx="43.5" cy="34.196" r="2.24" fill="#fff" opacity="0.95"/>
                            <circle cx="61.5" cy="34.196" r="2.24" fill="#fff" opacity="0.95"/>
                            <circle cx="40.2" cy="38.706" r="0.91" fill="#fff" opacity="0.5"/>
                            <circle cx="58.2" cy="38.706" r="0.91" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 34 37 Q 41 33.13 48 37" stroke="#558b2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52 37 Q 59 33.13 66 37" stroke="#558b2f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 48 Q 50 53.5 57 48" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 50 Q 50 44 57 50" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT TEEN — blooming youth -->
                <g id="tm-mascot-evo2-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-teen-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#81c784;stop-opacity:1" />
                            <stop offset="65%" style="stop-color:#43a047;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#2e7d32;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-teen-leaf-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-teen-bark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#bcaaa4;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#795548;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4e342e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-teen-bark-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="plant-teen-bulb" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-teen-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-teen-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-teen-bloom" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#f48fb1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e91e63;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-teen-amber" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb300;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-teen-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.22" />
                            <stop offset="55%" style="stop-color:#aed581;stop-opacity:0.12" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="plant-teen-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="plant-teen-sap" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="93" rx="30" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <g class="tm-animate-tail">
                            <path d="M 68 70 Q 84 78 88 66 Q 90 58 82 56 Q 76 54 74 60"
                                  fill="url(#plant-teen-leaf)" stroke="#2e7d32" stroke-width="1.6"/>
                            <path d="M 78 62 Q 84 58 86 64" fill="none" stroke="#81c784" stroke-width="0.85" opacity="0.55"/>
                            <circle cx="86" cy="58" r="3.5" fill="url(#plant-teen-bloom)" stroke="#e91e63" stroke-width="0.8"/>
                            <circle cx="85" cy="57" r="1.2" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 52 Q 12 42 10 30 Q 9 22 16 24 Q 22 36 28 48 Q 30 52 32 56 Z"
                                  fill="url(#plant-teen-wing)" stroke="#43a047" stroke-width="1.5"/>
                            <path d="M 16 28 Q 20 36 26 46" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.5"/>
                            <circle cx="14" cy="32" r="2.2" fill="url(#plant-teen-bloom)" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 52 Q 88 42 90 30 Q 91 22 84 24 Q 78 36 72 48 Q 70 52 68 56 Z"
                                  fill="url(#plant-teen-wing)" stroke="#43a047" stroke-width="1.5"/>
                            <path d="M 84 28 Q 80 36 74 46" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.5"/>
                            <circle cx="86" cy="32" r="2.2" fill="url(#plant-teen-bloom)" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 42 88 L 40 48 Q 50 40 60 48 L 58 88 Z" fill="url(#plant-teen-bark)" stroke="#4e342e" stroke-width="1.7"/>
                            <path d="M 44 58 Q 50 60 56 58" stroke="#3e2723" stroke-width="0.85" fill="none" opacity="0.4"/>
                            <path d="M 43 70 Q 50 72 57 70" stroke="#3e2723" stroke-width="0.8" fill="none" opacity="0.38"/>
                            <!-- Canopy -->
                            <ellipse cx="50" cy="34" rx="20" ry="17" fill="url(#plant-teen-leaf)" stroke="#43a047" stroke-width="2"/>
                            <ellipse cx="42" cy="28" rx="7" ry="4" fill="#fff" opacity="0.16"/>
                            <!-- Petal hair crown -->
                            <ellipse cx="36" cy="22" rx="5" ry="7" fill="#f48fb1" stroke="#e91e63" stroke-width="0.9" transform="rotate(-35 36 22)"/>
                            <ellipse cx="64" cy="22" rx="5" ry="7" fill="#f48fb1" stroke="#e91e63" stroke-width="0.9" transform="rotate(35 64 22)"/>
                            <ellipse cx="50" cy="16" rx="4.5" ry="6.5" fill="#fff59d" stroke="#fbc02d" stroke-width="0.8"/>
                            <ellipse cx="44" cy="18" rx="3.5" ry="5" fill="#f8bbd0" stroke="#ec407a" stroke-width="0.7" transform="rotate(-15 44 18)"/>
                            <ellipse cx="56" cy="18" rx="3.5" ry="5" fill="#f8bbd0" stroke="#ec407a" stroke-width="0.7" transform="rotate(15 56 18)"/>
                            <!-- Blossom clusters -->
                            <circle cx="34" cy="32" r="3.2" fill="url(#plant-teen-bloom)" stroke="#e91e63" stroke-width="0.7"/>
                            <circle cx="66" cy="33" r="3.2" fill="url(#plant-teen-bloom)" stroke="#e91e63" stroke-width="0.7"/>
                            <circle cx="50" cy="26" r="2.8" fill="#fff59d" stroke="#fbc02d" stroke-width="0.6"/>
                            <circle cx="38" cy="38" r="2.2" fill="#f48fb1" opacity="0.85"/>
                            <circle cx="62" cy="39" r="2.2" fill="#f48fb1" opacity="0.85"/>
                            <circle cx="33.5" cy="31.5" r="1" fill="#fff" opacity="0.55"/>
                            <circle cx="65.5" cy="32.5" r="1" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 40 52 Q 24 50 16 44 Q 12 40 18 38" fill="none" stroke="url(#plant-teen-bark)" stroke-width="3.8" stroke-linecap="round"/>
                            <!-- Thorn-soft gauntlet -->
                            <path d="M 12 40 L 8 36 M 14 42 L 6 42 M 16 44 L 10 48" stroke="#558b2f" stroke-width="1.3" stroke-linecap="round"/>
                            <ellipse cx="14" cy="40" rx="6" ry="7" fill="url(#plant-teen-leaf)" stroke="#33691e" stroke-width="1.2"/>
                            <path d="M 10 36 L 12 38 L 10 40 Z M 16 36 L 14 38 L 16 40 Z" fill="#aed581" stroke="#558b2f" stroke-width="0.5"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 60 52 Q 76 50 84 44 Q 88 40 82 38" fill="none" stroke="url(#plant-teen-bark)" stroke-width="3.8" stroke-linecap="round"/>
                            <path d="M 88 40 L 92 36 M 86 42 L 94 42 M 84 44 L 90 48" stroke="#558b2f" stroke-width="1.3" stroke-linecap="round"/>
                            <ellipse cx="86" cy="40" rx="6" ry="7" fill="url(#plant-teen-leaf)" stroke="#33691e" stroke-width="1.2"/>
                            <path d="M 90 36 L 88 38 L 90 40 Z M 84 36 L 86 38 L 84 40 Z" fill="#aed581" stroke="#558b2f" stroke-width="0.5"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 44 88 Q 38 94 36 98" stroke="url(#plant-teen-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                            <path d="M 46 89 Q 42 95 44 99" stroke="url(#plant-teen-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
                            <ellipse cx="37" cy="99" rx="5" ry="2.5" fill="#3e2723"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 56 88 Q 62 94 64 98" stroke="url(#plant-teen-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                            <path d="M 54 89 Q 58 95 56 99" stroke="url(#plant-teen-bark-shade)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
                            <ellipse cx="63" cy="99" rx="5" ry="2.5" fill="#3e2723"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="32" rx="6.8" ry="7.8" fill="#fff" stroke="#2e7d32" stroke-width="1.4"/>
                            <ellipse cx="59" cy="32" rx="6.8" ry="7.8" fill="#fff" stroke="#2e7d32" stroke-width="1.4"/>
                            <ellipse cx="42" cy="33.5" rx="3.8080000000000003" ry="4.601999999999999" fill="url(#plant-teen-iris)"/>
                            <ellipse cx="60" cy="33.5" rx="3.8080000000000003" ry="4.601999999999999" fill="url(#plant-teen-iris)"/>
                            <ellipse cx="42" cy="33.8" rx="1.9719999999999998" ry="2.574" fill="#0d1a08"/>
                            <ellipse cx="60" cy="33.8" rx="1.9719999999999998" ry="2.574" fill="#0d1a08"/>
                            <circle cx="43.5" cy="30.284" r="2.176" fill="#fff" opacity="0.95"/>
                            <circle cx="61.5" cy="30.284" r="2.176" fill="#fff" opacity="0.95"/>
                            <circle cx="40.2" cy="34.574" r="0.884" fill="#fff" opacity="0.5"/>
                            <circle cx="58.2" cy="34.574" r="0.884" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 34.2 33 Q 41 29.27 47.8 33" stroke="#2e7d32" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.2 33 Q 59 29.27 65.8 33" stroke="#2e7d32" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 42 44 Q 50 49.5 58 44" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 46 Q 50 40 58 46" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT ADULT — Worldroot Warden -->
                <g id="tm-mascot-evo3-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-adult-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#d4ff9a;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#8bc34a;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-adult-leaf-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-adult-bark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#bcaaa4;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#795548;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4e342e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-adult-bark-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="plant-adult-bulb" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-adult-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-adult-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-adult-bloom" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e91e63;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-adult-amber" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb300;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-adult-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.22" />
                            <stop offset="55%" style="stop-color:#aed581;stop-opacity:0.12" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="plant-adult-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="plant-adult-sap" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="95" rx="34" ry="5" fill="#1a1a1a" opacity="0.22"/>
                        <ellipse cx="50" cy="52" rx="40" ry="38" fill="url(#plant-adult-aura)" opacity="0.65"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 24 54 Q 6 42 4 26 Q 3 14 14 16 Q 20 30 24 42 Q 26 50 30 58 Z"
                                  fill="url(#plant-adult-wing)" stroke="#33691e" stroke-width="1.8"/>
                            <path d="M 12 24 Q 16 34 22 46" stroke="#2e7d32" stroke-width="1" fill="none" opacity="0.5"/>
                            <path d="M 16 28 Q 20 38 25 50" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.4"/>
                            <path d="M 20 32 Q 23 42 28 52" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.32"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 76 54 Q 94 42 96 26 Q 97 14 86 16 Q 80 30 76 42 Q 74 50 70 58 Z"
                                  fill="url(#plant-adult-wing)" stroke="#33691e" stroke-width="1.8"/>
                            <path d="M 88 24 Q 84 34 78 46" stroke="#2e7d32" stroke-width="1" fill="none" opacity="0.5"/>
                            <path d="M 84 28 Q 80 38 75 50" stroke="#2e7d32" stroke-width="0.85" fill="none" opacity="0.4"/>
                            <path d="M 80 32 Q 77 42 72 52" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.32"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 70 74 Q 88 80 92 70 Q 94 62 86 60 Q 80 58 78 64"
                                  fill="url(#plant-adult-leaf-dark)" stroke="#33691e" stroke-width="1.8"/>
                            <path d="M 82 66 Q 88 62 90 68" fill="none" stroke="#689f38" stroke-width="0.85" opacity="0.45"/>
                            <ellipse cx="90" cy="62" rx="3.5" ry="5" fill="url(#plant-adult-leaf)" stroke="#33691e" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Trunk body -->
                            <path d="M 38 90 Q 36 62 40 44 Q 50 36 60 44 Q 64 62 62 90 Q 58 92 50 93 Q 42 92 38 90 Z"
                                  fill="url(#plant-adult-bark)" stroke="#3e2723" stroke-width="2"/>
                            <!-- Bark texture lines -->
                            <path d="M 42 50 Q 46 58 44 68" stroke="#3e2723" stroke-width="1.1" fill="none" opacity="0.45"/>
                            <path d="M 56 52 Q 54 62 55 72" stroke="#3e2723" stroke-width="1.05" fill="none" opacity="0.42"/>
                            <path d="M 48 48 Q 50 56 49 64" stroke="#4e342e" stroke-width="0.9" fill="none" opacity="0.35"/>
                            <path d="M 40 76 Q 44 78 48 76" stroke="#3e2723" stroke-width="0.85" fill="none" opacity="0.38"/>
                            <path d="M 52 78 Q 56 80 60 78" stroke="#3e2723" stroke-width="0.85" fill="none" opacity="0.38"/>
                            <circle cx="46" cy="66" r="1.3" fill="#3e2723" opacity="0.3"/>
                            <circle cx="54" cy="70" r="1.2" fill="#3e2723" opacity="0.28"/>
                            <!-- Canopy head -->
                            <ellipse cx="50" cy="26" rx="22" ry="18" fill="url(#plant-adult-leaf)" stroke="#33691e" stroke-width="2.2"/>
                            <ellipse cx="42" cy="20" rx="8" ry="4.5" fill="#fff" opacity="0.14"/>
                            <ellipse cx="34" cy="24" rx="8" ry="11" fill="url(#plant-adult-leaf)" stroke="#33691e" stroke-width="1" transform="rotate(-25 34 24)"/>
                            <ellipse cx="66" cy="24" rx="8" ry="11" fill="url(#plant-adult-leaf)" stroke="#33691e" stroke-width="1" transform="rotate(25 66 24)"/>
                            <ellipse cx="50" cy="14" rx="7" ry="10" fill="url(#plant-adult-leaf-dark)" stroke="#33691e" stroke-width="0.9"/>
                            <!-- Wood face in canopy -->
                            <ellipse cx="50" cy="30" rx="12" ry="10" fill="url(#plant-adult-bark-shade)" stroke="#3e2723" stroke-width="1.2"/>
                            <path d="M 42 28 Q 50 26 58 28" stroke="#4e342e" stroke-width="0.8" fill="none" opacity="0.45"/>
                            <path d="M 43 34 Q 50 36 57 34" stroke="#4e342e" stroke-width="0.75" fill="none" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="58" rx="7.5" ry="11" fill="url(#plant-adult-bark)" stroke="#4e342e" stroke-width="1.6"/>
                            <ellipse cx="22" cy="52" rx="2.8" ry="2" fill="#fff" opacity="0.12"/>
                            <ellipse cx="18" cy="66" rx="6" ry="7.5" fill="url(#plant-adult-leaf)" stroke="#33691e" stroke-width="1.3"/>
                            <path d="M 16 62 Q 18 66 16 70" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="58" rx="7.5" ry="11" fill="url(#plant-adult-bark)" stroke="#4e342e" stroke-width="1.6"/>
                            <ellipse cx="78" cy="52" rx="2.8" ry="2" fill="#fff" opacity="0.12"/>
                            <ellipse cx="82" cy="66" rx="6" ry="7.5" fill="url(#plant-adult-leaf)" stroke="#33691e" stroke-width="1.3"/>
                            <path d="M 84 62 Q 82 66 84 70" stroke="#2e7d32" stroke-width="0.7" fill="none" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 42 90 Q 34 96 30 100 Q 28 102 32 101" stroke="url(#plant-adult-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                            <path d="M 46 91 Q 42 97 44 101" stroke="url(#plant-adult-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <path d="M 48 92 Q 50 98 48 102" stroke="url(#plant-adult-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <ellipse cx="31" cy="101" rx="5" ry="2.5" fill="#3e2723"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 58 90 Q 66 96 70 100 Q 72 102 68 101" stroke="url(#plant-adult-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                            <path d="M 54 91 Q 58 97 56 101" stroke="url(#plant-adult-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <path d="M 52 92 Q 50 98 52 102" stroke="url(#plant-adult-bark-shade)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <ellipse cx="69" cy="101" rx="5" ry="2.5" fill="#3e2723"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="30" rx="6.5" ry="7.5" fill="#fff" stroke="#33691e" stroke-width="1.4"/>
                            <ellipse cx="57" cy="30" rx="6.5" ry="7.5" fill="#fff" stroke="#33691e" stroke-width="1.4"/>
                            <ellipse cx="44" cy="31.5" rx="3.6400000000000006" ry="4.425" fill="url(#plant-adult-iris)"/>
                            <ellipse cx="58" cy="31.5" rx="3.6400000000000006" ry="4.425" fill="url(#plant-adult-iris)"/>
                            <ellipse cx="44" cy="31.8" rx="1.8849999999999998" ry="2.475" fill="#1a2e0f"/>
                            <ellipse cx="58" cy="31.8" rx="1.8849999999999998" ry="2.475" fill="#1a2e0f"/>
                            <circle cx="45.5" cy="28.35" r="2.08" fill="#fff" opacity="0.95"/>
                            <circle cx="59.5" cy="28.35" r="2.08" fill="#fff" opacity="0.95"/>
                            <circle cx="42.2" cy="32.475" r="0.845" fill="#fff" opacity="0.5"/>
                            <circle cx="56.2" cy="32.475" r="0.845" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 36.5 31 Q 43 27.375 49.5 31" stroke="#33691e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 50.5 31 Q 57 27.375 63.5 31" stroke="#33691e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 42 38 Q 50 43.5 58 38" stroke="#33691e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 40 Q 50 34 58 40" stroke="#33691e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT MIDDLE AGE — ancient oak -->
                <g id="tm-mascot-evo4-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-mid-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#d4ff9a;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#8bc34a;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-mid-leaf-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-mid-bark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#a1887f;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#6d4c41;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-mid-bark-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="plant-mid-bulb" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-mid-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-mid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-mid-bloom" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e91e63;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-mid-amber" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb300;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-mid-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.22" />
                            <stop offset="55%" style="stop-color:#aed581;stop-opacity:0.12" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="plant-mid-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="plant-mid-sap" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="97" rx="32" ry="5" fill="#1a1a1a" opacity="0.24"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 26 58 Q 14 50 12 40 Q 11 34 16 36 Q 22 46 28 56 Z"
                                  fill="url(#plant-mid-wing)" stroke="#558b2f" stroke-width="1.3" opacity="0.85"/>
                            <ellipse cx="14" cy="42" rx="4" ry="2.5" fill="#689f38" opacity="0.5" transform="rotate(-20 14 42)"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 74 58 Q 86 50 88 40 Q 89 34 84 36 Q 78 46 72 56 Z"
                                  fill="url(#plant-mid-wing)" stroke="#558b2f" stroke-width="1.3" opacity="0.85"/>
                            <ellipse cx="86" cy="42" rx="4" ry="2.5" fill="#689f38" opacity="0.5" transform="rotate(20 86 42)"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 66 78 Q 80 84 84 74 Q 86 68 80 66"
                                  fill="url(#plant-mid-bark-shade)" stroke="#3e2723" stroke-width="1.5"/>
                            <ellipse cx="82" cy="70" rx="3" ry="4" fill="#795548" stroke="#4e342e" stroke-width="0.8"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Stout ancient trunk — slower, wider pose -->
                            <path d="M 34 94 Q 32 64 38 42 Q 50 32 62 42 Q 68 64 66 94 Q 60 96 50 97 Q 40 96 34 94 Z"
                                  fill="url(#plant-mid-bark)" stroke="#3e2723" stroke-width="2.1"/>
                            <path d="M 40 50 Q 44 62 42 76" stroke="#3e2723" stroke-width="1.15" fill="none" opacity="0.42"/>
                            <path d="M 58 52 Q 56 64 57 78" stroke="#3e2723" stroke-width="1.1" fill="none" opacity="0.4"/>
                            <path d="M 46 46 Q 50 54 49 62" stroke="#4e342e" stroke-width="0.95" fill="none" opacity="0.35"/>
                            <!-- Knotholes -->
                            <ellipse cx="44" cy="58" rx="3.5" ry="4" fill="#2c1810" stroke="#3e2723" stroke-width="1"/>
                            <ellipse cx="56" cy="72" rx="3" ry="3.5" fill="#2c1810" stroke="#3e2723" stroke-width="0.9"/>
                            <circle cx="43.5" cy="57.5" r="1" fill="#4e342e" opacity="0.5"/>
                            <!-- Moss tufts -->
                            <ellipse cx="38" cy="68" rx="5" ry="3" fill="#689f38" opacity="0.65" transform="rotate(-15 38 68)"/>
                            <ellipse cx="62" cy="60" rx="4.5" ry="2.8" fill="#558b2f" opacity="0.6" transform="rotate(12 62 60)"/>
                            <ellipse cx="36" cy="82" rx="4" ry="2.5" fill="#7cb342" opacity="0.55" transform="rotate(-8 36 82)"/>
                            <!-- Hollow amber glow -->
                            <ellipse cx="50" cy="64" rx="8" ry="9" fill="url(#plant-mid-amber)" opacity="0.75"/>
                            <ellipse cx="50" cy="64" rx="4.5" ry="5" fill="#fff8e1" opacity="0.55"/>
                            <circle cx="50" cy="64" r="2" fill="#ffb300" opacity="0.7"/>
                            <!-- Canopy -->
                            <ellipse cx="50" cy="28" rx="24" ry="19" fill="url(#plant-mid-leaf)" stroke="#33691e" stroke-width="2"/>
                            <ellipse cx="42" cy="22" rx="8" ry="4.5" fill="#fff" opacity="0.12"/>
                            <ellipse cx="32" cy="28" rx="9" ry="12" fill="url(#plant-mid-leaf-dark)" stroke="#33691e" stroke-width="1" transform="rotate(-22 32 28)"/>
                            <ellipse cx="68" cy="28" rx="9" ry="12" fill="url(#plant-mid-leaf-dark)" stroke="#33691e" stroke-width="1" transform="rotate(22 68 28)"/>
                            <!-- Acorns -->
                            <ellipse cx="30" cy="36" rx="2.2" ry="3" fill="#795548" stroke="#4e342e" stroke-width="0.7"/>
                            <path d="M 30 33 Q 30 31 32 32 Q 30 31 28 32 Q 30 31 30 33" fill="#558b2f" stroke="#33691e" stroke-width="0.5"/>
                            <ellipse cx="68" cy="38" rx="2.2" ry="3" fill="#795548" stroke="#4e342e" stroke-width="0.7"/>
                            <path d="M 68 35 Q 68 33 70 34 Q 68 33 66 34 Q 68 33 68 35" fill="#558b2f" stroke="#33691e" stroke-width="0.5"/>
                            <ellipse cx="50" cy="18" rx="2" ry="2.8" fill="#6d4c41" stroke="#4e342e" stroke-width="0.6"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 36 56 Q 22 54 14 48 Q 10 44 16 42" fill="none" stroke="url(#plant-mid-bark)" stroke-width="4" stroke-linecap="round"/>
                            <ellipse cx="12" cy="44" rx="5.5" ry="7" fill="url(#plant-mid-leaf-dark)" stroke="#33691e" stroke-width="1.1"/>
                            <ellipse cx="10" cy="40" rx="3" ry="2" fill="#689f38" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 64 56 Q 78 54 86 48 Q 90 44 84 42" fill="none" stroke="url(#plant-mid-bark)" stroke-width="4" stroke-linecap="round"/>
                            <ellipse cx="88" cy="44" rx="5.5" ry="7" fill="url(#plant-mid-leaf-dark)" stroke="#33691e" stroke-width="1.1"/>
                            <ellipse cx="90" cy="40" rx="3" ry="2" fill="#689f38" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 40 94 Q 32 100 30 104" stroke="url(#plant-mid-bark-shade)" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 44 95 Q 38 102 40 106" stroke="url(#plant-mid-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                            <ellipse cx="31" cy="105" rx="5.5" ry="2.8" fill="#3e2723"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 60 94 Q 68 100 70 104" stroke="url(#plant-mid-bark-shade)" stroke-width="4" fill="none" stroke-linecap="round"/>
                            <path d="M 56 95 Q 62 102 60 106" stroke="url(#plant-mid-bark-shade)" stroke-width="3.2" fill="none" stroke-linecap="round"/>
                            <ellipse cx="69" cy="105" rx="5.5" ry="2.8" fill="#3e2723"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="32" rx="5.8" ry="6.5" fill="#fff" stroke="#33691e" stroke-width="1.3"/>
                            <ellipse cx="58" cy="32" rx="5.8" ry="6.5" fill="#fff" stroke="#33691e" stroke-width="1.3"/>
                            <ellipse cx="43" cy="33.5" rx="3.248" ry="3.835" fill="url(#plant-mid-iris)"/>
                            <ellipse cx="59" cy="33.5" rx="3.248" ry="3.835" fill="url(#plant-mid-iris)"/>
                            <ellipse cx="43" cy="33.8" rx="1.682" ry="2.145" fill="#1a2e0f"/>
                            <ellipse cx="59" cy="33.8" rx="1.682" ry="2.145" fill="#1a2e0f"/>
                            <circle cx="44.5" cy="30.57" r="1.8559999999999999" fill="#fff" opacity="0.95"/>
                            <circle cx="60.5" cy="30.57" r="1.8559999999999999" fill="#fff" opacity="0.95"/>
                            <circle cx="41.2" cy="34.145" r="0.754" fill="#fff" opacity="0.5"/>
                            <circle cx="57.2" cy="34.145" r="0.754" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 36.2 33 Q 42 29.725 47.8 33" stroke="#33691e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52.2 33 Q 58 29.725 63.8 33" stroke="#33691e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 40 Q 50 45.5 57 40" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 42 Q 50 36 57 42" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT OLD — World Tree -->
                <g id="tm-mascot-evo5-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-old-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#dce775;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#7cb342;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-old-leaf-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#689f38;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#33691e;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-old-bark" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#a1887f;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#6d4c41;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="plant-old-bark-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#5d4037;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#3e2723;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="plant-old-bulb" cx="45%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#c5e1a5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-old-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#558b2f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b2e12;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="plant-old-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a9b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a9b;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-old-bloom" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e91e63;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-old-amber" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff8e1;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb300;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="plant-old-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#76ff03;stop-opacity:0.22" />
                            <stop offset="55%" style="stop-color:#aed581;stop-opacity:0.12" />
                            <stop offset="100%" style="stop-color:#76ff03;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="plant-old-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:0.55" />
                        </linearGradient>
                        <linearGradient id="plant-old-sap" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="99" rx="36" ry="5" fill="#1a1a1a" opacity="0.26"/>
                        <ellipse cx="50" cy="50" rx="46" ry="48" fill="url(#plant-old-aura)" class="tm-wisdom-aura"/>
                        <!-- Floating spirit orbs -->
                        <circle cx="18" cy="36" r="3.5" fill="url(#plant-old-bloom)" opacity="0.75" class="tm-sparkle"/>
                        <circle cx="17" cy="35" r="1.4" fill="#fff" opacity="0.7"/>
                        <circle cx="82" cy="42" r="3" fill="url(#plant-old-bloom)" opacity="0.7" class="tm-sparkle"/>
                        <circle cx="81" cy="41" r="1.2" fill="#fff" opacity="0.65"/>
                        <circle cx="14" cy="58" r="2.5" fill="#aed581" opacity="0.6" class="tm-sparkle"/>
                        <circle cx="86" cy="64" r="2.8" fill="#ffd54f" opacity="0.65" class="tm-sparkle"/>
                        <circle cx="50" cy="8" r="2.5" fill="#fff" opacity="0.5" class="tm-sparkle"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 22 56 Q 4 44 2 28 Q 1 16 12 18 Q 18 32 22 44 Q 24 52 28 60 Z"
                                  fill="url(#plant-old-wing)" stroke="#33691e" stroke-width="1.6" opacity="0.9"/>
                            <path d="M 10 26 Q 14 36 20 48" stroke="#558b2f" stroke-width="0.9" fill="none" opacity="0.45"/>
                            <circle cx="8" cy="30" r="2" fill="#ffd54f" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 78 56 Q 96 44 98 28 Q 99 16 88 18 Q 82 32 78 44 Q 76 52 72 60 Z"
                                  fill="url(#plant-old-wing)" stroke="#33691e" stroke-width="1.6" opacity="0.9"/>
                            <path d="M 90 26 Q 86 36 80 48" stroke="#558b2f" stroke-width="0.9" fill="none" opacity="0.45"/>
                            <circle cx="92" cy="30" r="2" fill="#ffd54f" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 64 80 Q 78 88 82 78 Q 84 72 78 70"
                                  fill="url(#plant-old-bark-shade)" stroke="#3e2723" stroke-width="1.6"/>
                            <circle cx="80" cy="74" r="2.5" fill="url(#plant-old-sap)" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Massive trunk -->
                            <path d="M 32 96 Q 28 60 36 38 Q 50 26 64 38 Q 72 60 68 96 Q 62 98 50 99 Q 38 98 32 96 Z"
                                  fill="url(#plant-old-bark)" stroke="#3e2723" stroke-width="2.2"/>
                            <!-- Rune bark -->
                            <path d="M 42 48 L 44 52 L 42 56 L 40 52 Z" fill="none" stroke="#ffd54f" stroke-width="0.9" opacity="0.55"/>
                            <path d="M 58 52 L 60 56 L 58 60 L 56 56 Z" fill="none" stroke="#ffd54f" stroke-width="0.9" opacity="0.55"/>
                            <path d="M 48 68 L 50 72 L 52 68" fill="none" stroke="#ffd54f" stroke-width="0.85" opacity="0.5"/>
                            <path d="M 44 78 Q 50 80 56 78" stroke="#ffd54f" stroke-width="0.8" fill="none" opacity="0.45"/>
                            <circle cx="46" cy="58" r="1.5" fill="#ffd54f" opacity="0.4"/>
                            <circle cx="54" cy="74" r="1.3" fill="#ffd54f" opacity="0.38"/>
                            <!-- Golden sap drips -->
                            <path d="M 46 82 Q 46 88 45 92" stroke="url(#plant-old-sap)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.85"/>
                            <path d="M 54 78 Q 55 84 54 90" stroke="url(#plant-old-sap)" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.8"/>
                            <circle cx="45" cy="93" r="2" fill="#ffd54f" opacity="0.75"/>
                            <circle cx="54" cy="91" r="1.8" fill="#ffb300" opacity="0.7"/>
                            <!-- Huge canopy -->
                            <ellipse cx="50" cy="22" rx="28" ry="22" fill="url(#plant-old-leaf)" stroke="#33691e" stroke-width="2.2"/>
                            <ellipse cx="40" cy="16" rx="10" ry="5" fill="#fff" opacity="0.12"/>
                            <ellipse cx="28" cy="22" rx="11" ry="14" fill="url(#plant-old-leaf-dark)" stroke="#33691e" stroke-width="1.1" transform="rotate(-20 28 22)"/>
                            <ellipse cx="72" cy="22" rx="11" ry="14" fill="url(#plant-old-leaf-dark)" stroke="#33691e" stroke-width="1.1" transform="rotate(20 72 22)"/>
                            <ellipse cx="50" cy="8" rx="9" ry="12" fill="url(#plant-old-leaf-dark)" stroke="#33691e" stroke-width="1"/>
                            <circle cx="34" cy="18" r="2.5" fill="#ffd54f" opacity="0.65"/>
                            <circle cx="66" cy="20" r="2.5" fill="#ffd54f" opacity="0.6"/>
                            <circle cx="50" cy="6" r="2" fill="#fff" opacity="0.45"/>
                            <!-- Wise wood face -->
                            <ellipse cx="50" cy="30" rx="13" ry="11" fill="url(#plant-old-bark-shade)" stroke="#3e2723" stroke-width="1.3"/>
                            <path d="M 42 28 Q 50 26 58 28" stroke="#5d4037" stroke-width="0.85" fill="none" opacity="0.45"/>
                            <path d="M 40 34 Q 44 32 48 34" stroke="#5d4037" stroke-width="0.7" fill="none" opacity="0.35"/>
                            <path d="M 52 34 Q 56 32 60 34" stroke="#5d4037" stroke-width="0.7" fill="none" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 34 54 Q 18 50 10 42 Q 6 38 12 36" fill="none" stroke="url(#plant-old-bark)" stroke-width="4.5" stroke-linecap="round"/>
                            <ellipse cx="8" cy="38" rx="6" ry="7.5" fill="url(#plant-old-leaf)" stroke="#33691e" stroke-width="1.2"/>
                            <circle cx="6" cy="34" r="2" fill="#ffd54f" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 66 54 Q 82 50 90 42 Q 94 38 88 36" fill="none" stroke="url(#plant-old-bark)" stroke-width="4.5" stroke-linecap="round"/>
                            <ellipse cx="92" cy="38" rx="6" ry="7.5" fill="url(#plant-old-leaf)" stroke="#33691e" stroke-width="1.2"/>
                            <circle cx="94" cy="34" r="2" fill="#ffd54f" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 38 96 Q 28 102 24 106 Q 22 108 26 107" stroke="url(#plant-old-bark-shade)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
                            <path d="M 42 97 Q 36 104 38 108" stroke="url(#plant-old-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                            <path d="M 46 98 Q 48 105 46 110" stroke="url(#plant-old-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <ellipse cx="25" cy="107" rx="6" ry="3" fill="#3e2723"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 62 96 Q 72 102 76 106 Q 78 108 74 107" stroke="url(#plant-old-bark-shade)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
                            <path d="M 58 97 Q 64 104 62 108" stroke="url(#plant-old-bark-shade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                            <path d="M 54 98 Q 52 105 54 110" stroke="url(#plant-old-bark-shade)" stroke-width="3" fill="none" stroke-linecap="round"/>
                            <ellipse cx="75" cy="107" rx="6" ry="3" fill="#3e2723"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="30" rx="5.2" ry="6" fill="#fff" stroke="#33691e" stroke-width="1.2"/>
                            <ellipse cx="58" cy="30" rx="5.2" ry="6" fill="#fff" stroke="#33691e" stroke-width="1.2"/>
                            <ellipse cx="43" cy="31.5" rx="2.9120000000000004" ry="3.54" fill="url(#plant-old-iris)"/>
                            <ellipse cx="59" cy="31.5" rx="2.9120000000000004" ry="3.54" fill="url(#plant-old-iris)"/>
                            <ellipse cx="43" cy="31.8" rx="1.508" ry="1.98" fill="#1a2e0f"/>
                            <ellipse cx="59" cy="31.8" rx="1.508" ry="1.98" fill="#1a2e0f"/>
                            <circle cx="44.5" cy="28.68" r="1.6640000000000001" fill="#fff" opacity="0.95"/>
                            <circle cx="60.5" cy="28.68" r="1.6640000000000001" fill="#fff" opacity="0.95"/>
                            <circle cx="41.2" cy="31.98" r="0.676" fill="#fff" opacity="0.5"/>
                            <circle cx="57.2" cy="31.98" r="0.676" fill="#fff" opacity="0.5"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 36.8 31 Q 42 27.9 47.2 31" stroke="#33691e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                            <path d="M 52.8 31 Q 58 27.9 63.2 31" stroke="#33691e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 38 Q 50 43.5 57 38" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 40 Q 50 34 57 40" stroke="#33691e" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- GHOST CHARACTER - All Life Stages (dense cute epic v3) -->
                <!-- Spirit & Void • Epic Rarity • Veil Wraith -->
                <!-- ═══════════════════════════════════════ -->

                <!-- GHOST BABY — spectral droplet -->
                <g id="tm-mascot-baby-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-baby-body" cx="45%" cy="25%" r="78%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#b39ddb;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7e57c2;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ghost-baby-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#9575cd;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="ghost-baby-iris" cx="38%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#ea80fc;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#7c4dff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ghost-baby-blush" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff80ab;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#ff80ab;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="ghost-baby-wisp" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#ede7f6;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#9575cd;stop-opacity:0.25" />
                        </linearGradient>
                        <radialGradient id="ghost-baby-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ce93d8;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="90" rx="22" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <ellipse cx="50" cy="54" rx="36" ry="34" fill="url(#ghost-baby-aura)"/>
                        <g class="tm-animate-tail">
                            <path d="M 58 76 Q 68 84 72 74 Q 74 66 68 64 Q 62 68 58 76 Z" fill="url(#ghost-baby-wisp)" stroke="#ce93d8" stroke-width="0.9" opacity="0.75"/>
                            <circle cx="70" cy="68" r="1.8" fill="#ce93d8" opacity="0.5"/>
                            <circle cx="66" cy="72" r="1.2" fill="#fff" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <ellipse cx="26" cy="56" rx="5" ry="7" fill="url(#ghost-baby-wisp)" stroke="#7e57c2" stroke-width="1" transform="rotate(-22 26 56)" opacity="0.85"/>
                            <path d="M 24 52 Q 22 56 24 60" stroke="#fff" stroke-width="0.6" opacity="0.45" fill="none"/>
                            <circle cx="22" cy="58" r="1.1" fill="#ce93d8" opacity="0.3"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <ellipse cx="74" cy="56" rx="5" ry="7" fill="url(#ghost-baby-wisp)" stroke="#7e57c2" stroke-width="1" transform="rotate(22 74 56)" opacity="0.85"/>
                            <path d="M 76 52 Q 78 56 76 60" stroke="#fff" stroke-width="0.6" opacity="0.45" fill="none"/>
                            <circle cx="78" cy="58" r="1.1" fill="#ce93d8" opacity="0.3"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 50 24 Q 66 30 70 46 Q 72 62 64 76 Q 50 88 36 76 Q 28 62 30 46 Q 34 30 50 24 Z"
                                  fill="url(#ghost-baby-body)" stroke="#7e57c2" stroke-width="2"/>
                            <ellipse cx="42" cy="38" rx="9" ry="6" fill="#fff" opacity="0.18"/>
                            <ellipse cx="50" cy="58" rx="12" ry="10" fill="url(#ghost-baby-core)" opacity="0.7"/>
                            <circle cx="50" cy="58" r="5" fill="#fff" opacity="0.4"/>
                            <circle cx="34" cy="48" r="5" fill="url(#ghost-baby-blush)"/>
                            <circle cx="66" cy="48" r="5" fill="url(#ghost-baby-blush)"/>
                            <circle cx="38" cy="66" r="1.5" fill="#ce93d8" opacity="0.35"/>
                            <circle cx="62" cy="68" r="1.3" fill="#e1bee7" opacity="0.3"/>
                            <circle cx="44" cy="74" r="1.1" fill="#ce93d8" opacity="0.28"/>
                            <circle cx="56" cy="76" r="1" fill="#b39ddb" opacity="0.25"/>
                            <circle cx="48" cy="68" r="1.2" fill="#fff" opacity="0.22"/>
                            <circle cx="52" cy="70" r="1" fill="#e1bee7" opacity="0.2"/>
                            <path d="M 46 32 Q 50 30 54 32" stroke="#fff" stroke-width="0.7" fill="none" opacity="0.35"/>
                            <path d="M 38 52 Q 42 54 46 52" stroke="#7e57c2" stroke-width="0.6" fill="none" opacity="0.25"/>
                            <path d="M 54 52 Q 58 54 62 52" stroke="#7e57c2" stroke-width="0.6" fill="none" opacity="0.25"/>
                            <ellipse cx="50" cy="46" rx="6" ry="4" fill="#fff" opacity="0.08"/>
                            <circle cx="32" cy="58" r="1.4" fill="#ce93d8" opacity="0.22"/>
                            <circle cx="68" cy="60" r="1.2" fill="#b39ddb" opacity="0.2"/>
                            <path d="M 40 82 Q 38 88 42 90" stroke="url(#ghost-baby-wisp)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.65"/>
                            <path d="M 50 84 Q 50 92 52 94" stroke="url(#ghost-baby-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
                            <path d="M 60 82 Q 62 88 58 90" stroke="url(#ghost-baby-wisp)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.65"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="28" cy="58" rx="5.5" ry="7" fill="url(#ghost-baby-body)" stroke="#7e57c2" stroke-width="1.3"/>
                            <ellipse cx="26" cy="54" rx="2" ry="1.5" fill="#fff" opacity="0.22"/>
                            <path d="M 24 64 L 22 67 M 26 65 L 25 68 M 28 64 L 29 67" stroke="#7e57c2" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="72" cy="58" rx="5.5" ry="7" fill="url(#ghost-baby-body)" stroke="#7e57c2" stroke-width="1.3"/>
                            <ellipse cx="74" cy="54" rx="2" ry="1.5" fill="#fff" opacity="0.22"/>
                            <path d="M 70 64 L 70 67 M 73 65 L 74 68 M 76 64 L 78 67" stroke="#7e57c2" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="40" cy="86" rx="5.5" ry="3.5" fill="url(#ghost-baby-wisp)" stroke="#7e57c2" stroke-width="1" opacity="0.8"/>
                            <circle cx="38" cy="88" r="0.9" fill="#fff" opacity="0.25"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="60" cy="86" rx="5.5" ry="3.5" fill="url(#ghost-baby-wisp)" stroke="#7e57c2" stroke-width="1" opacity="0.8"/>
                            <circle cx="62" cy="88" r="0.9" fill="#fff" opacity="0.25"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="40" rx="7.5" ry="9" fill="#faf8ff" stroke="#7e57c2" stroke-width="1.5"/>
                            <ellipse cx="60" cy="40" rx="7.5" ry="9" fill="#faf8ff" stroke="#7e57c2" stroke-width="1.5"/>
                            <ellipse cx="40.6" cy="40.4" rx="3.9" ry="5" fill="url(#ghost-baby-iris)"/>
                            <ellipse cx="60.6" cy="40.4" rx="3.9" ry="5" fill="url(#ghost-baby-iris)"/>
                            <ellipse cx="40.6" cy="40.7" rx="2" ry="3.1" fill="#060612"/>
                            <ellipse cx="60.6" cy="40.7" rx="2" ry="3.1" fill="#060612"/>
                            <circle cx="42" cy="37.12" r="2.3" fill="#fff" opacity="0.96"/>
                            <circle cx="62" cy="37.12" r="2.3" fill="#fff" opacity="0.96"/>
                            <circle cx="39.2" cy="42.2" r="1.1" fill="#e1bee7" opacity="0.6"/>
                            <circle cx="59.2" cy="42.2" r="1.1" fill="#e1bee7" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.5 40 Q 40 36.5 47.5 40" stroke="#7e57c2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 52.5 40 Q 60 36.5 67.5 40" stroke="#7e57c2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44 52 Q 50 57.5 56 52" stroke="#7e57c2" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 54 Q 50 48 56 54" stroke="#7e57c2" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- GHOST KID — sheet wraith -->
                <g id="tm-mascot-evo1-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-kid-body" cx="42%" cy="22%" r="80%">
                            <stop offset="0%" style="stop-color:#ede7f6;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#d1c4e9;stop-opacity:1" />
                            <stop offset="65%" style="stop-color:#9575cd;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#512da8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ghost-kid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#ce93d8;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="ghost-kid-iris" cx="36%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#e040fb;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="ghost-kid-wisp" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#4527a0;stop-opacity:0.2" />
                        </linearGradient>
                        <radialGradient id="ghost-kid-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.32" />
                            <stop offset="100%" style="stop-color:#b39ddb;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="28" ry="5" fill="#1a1a1a" opacity="0.22"/>
                        <ellipse cx="50" cy="52" rx="42" ry="40" fill="url(#ghost-kid-aura)"/>
                        <g class="tm-animate-tail">
                            <path d="M 56 80 Q 70 96 82 78 Q 88 64 78 58 Q 66 62 56 80 Z" fill="url(#ghost-kid-wisp)" stroke="#b39ddb" stroke-width="1" opacity="0.8"/>
                            <path d="M 68 74 Q 78 82 80 70" stroke="#e1bee7" stroke-width="0.8" fill="none" opacity="0.5"/>
                            <path d="M 72 68 Q 82 72 84 62" stroke="#ce93d8" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <circle cx="80" cy="60" r="2.2" fill="#b39ddb" opacity="0.55"/>
                            <circle cx="76" cy="66" r="1.5" fill="#fff" opacity="0.35"/>
                            <circle cx="84" cy="72" r="1.3" fill="#e1bee7" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 26 52 Q 12 44 10 58 Q 12 70 22 62 Z" fill="url(#ghost-kid-wisp)" stroke="#b39ddb" stroke-width="0.95" opacity="0.82"/>
                            <path d="M 16 50 Q 12 54 14 60" stroke="#fff" stroke-width="0.65" fill="none" opacity="0.4"/>
                            <circle cx="14" cy="56" r="1.2" fill="#b39ddb" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 74 52 Q 88 44 90 58 Q 88 70 78 62 Z" fill="url(#ghost-kid-wisp)" stroke="#b39ddb" stroke-width="0.95" opacity="0.82"/>
                            <path d="M 84 50 Q 88 54 86 60" stroke="#fff" stroke-width="0.65" fill="none" opacity="0.4"/>
                            <circle cx="86" cy="56" r="1.2" fill="#b39ddb" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 26 56 Q 22 32 38 20 Q 50 12 62 20 Q 78 32 74 56 Q 72 76 62 88 Q 50 96 38 88 Q 28 76 26 56 Z"
                                  fill="url(#ghost-kid-body)" stroke="#6a1b9a" stroke-width="2.2" opacity="0.93"/>
                            <ellipse cx="42" cy="34" rx="10" ry="6" fill="#fff" opacity="0.15"/>
                            <circle cx="50" cy="56" r="10" fill="url(#ghost-kid-core)" opacity="0.8"/>
                            <circle cx="50" cy="56" r="4.5" fill="#fff" opacity="0.42"/>
                            <circle cx="36" cy="62" r="2" fill="#b39ddb" opacity="0.38"/>
                            <circle cx="64" cy="64" r="1.7" fill="#e1bee7" opacity="0.32"/>
                            <circle cx="42" cy="74" r="1.4" fill="#b39ddb" opacity="0.28"/>
                            <circle cx="58" cy="76" r="1.2" fill="#b39ddb" opacity="0.25"/>
                            <path d="M 34 88 Q 32 96 38 98" stroke="url(#ghost-kid-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <path d="M 44 90 Q 42 100 48 102" stroke="url(#ghost-kid-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.75"/>
                            <path d="M 50 92 Q 50 102 54 104" stroke="url(#ghost-kid-wisp)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.78"/>
                            <path d="M 56 90 Q 58 100 52 102" stroke="url(#ghost-kid-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.75"/>
                            <path d="M 66 88 Q 68 96 62 98" stroke="url(#ghost-kid-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <path d="M 36 52 Q 50 48 64 52" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.3"/>
                            <path d="M 32 64 Q 36 66 40 64" stroke="#6a1b9a" stroke-width="0.7" fill="none" opacity="0.28"/>
                            <path d="M 60 64 Q 64 66 68 64" stroke="#6a1b9a" stroke-width="0.7" fill="none" opacity="0.28"/>
                            <circle cx="46" cy="70" r="1.3" fill="#fff" opacity="0.2"/>
                            <circle cx="54" cy="72" r="1.1" fill="#e1bee7" opacity="0.18"/>
                            <circle cx="30" cy="70" r="1.5" fill="#b39ddb" opacity="0.25"/>
                            <circle cx="70" cy="72" r="1.3" fill="#b39ddb" opacity="0.22"/>
                            <ellipse cx="50" cy="44" rx="8" ry="5" fill="#fff" opacity="0.07"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 28 58 Q 12 62 8 50 Q 6 42 14 44" fill="none" stroke="url(#ghost-kid-body)" stroke-width="5.5" stroke-linecap="round" opacity="0.9"/>
                            <path d="M 10 44 L 4 38 M 10 46 L 2 46 M 12 48 L 6 52" stroke="#b39ddb" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 72 58 Q 88 62 92 50 Q 94 42 86 44" fill="none" stroke="url(#ghost-kid-body)" stroke-width="5.5" stroke-linecap="round" opacity="0.9"/>
                            <path d="M 90 44 L 96 38 M 90 46 L 98 46 M 88 48 L 94 52" stroke="#b39ddb" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="92" rx="6.5" ry="4" fill="url(#ghost-kid-wisp)" opacity="0.75"/>
                            <circle cx="36" cy="93" r="1" fill="#fff" opacity="0.22"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="92" rx="6.5" ry="4" fill="url(#ghost-kid-wisp)" opacity="0.75"/>
                            <circle cx="64" cy="93" r="1" fill="#fff" opacity="0.22"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="38" rx="6.8" ry="8" fill="#faf8ff" stroke="#6a1b9a" stroke-width="1.5"/>
                            <ellipse cx="60" cy="38" rx="6.8" ry="8" fill="#faf8ff" stroke="#6a1b9a" stroke-width="1.5"/>
                            <ellipse cx="40.6" cy="38.4" rx="3.5" ry="4.5" fill="url(#ghost-kid-iris)"/>
                            <ellipse cx="60.6" cy="38.4" rx="3.5" ry="4.5" fill="url(#ghost-kid-iris)"/>
                            <ellipse cx="40.6" cy="38.7" rx="1.8" ry="2.7" fill="#060612"/>
                            <ellipse cx="60.6" cy="38.7" rx="1.8" ry="2.7" fill="#060612"/>
                            <circle cx="42" cy="35.44" r="2.0" fill="#fff" opacity="0.96"/>
                            <circle cx="62" cy="35.44" r="2.0" fill="#fff" opacity="0.96"/>
                            <circle cx="39.2" cy="40.2" r="1.0" fill="#e1bee7" opacity="0.6"/>
                            <circle cx="59.2" cy="40.2" r="1.0" fill="#e1bee7" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.2 38 Q 40 34.5 46.8 38" stroke="#6a1b9a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53.2 38 Q 60 34.5 66.8 38" stroke="#6a1b9a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 50 Q 50 55.5 57 50" stroke="#6a1b9a" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 52 Q 50 46 57 52" stroke="#6a1b9a" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- GHOST TEEN — veiled stalker -->
                <g id="tm-mascot-evo2-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-teen-body" cx="40%" cy="20%" r="82%">
                            <stop offset="0%" style="stop-color:#d1c4e9;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#9575cd;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="ghost-teen-veil" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#1a237e;stop-opacity:0.7" />
                            <stop offset="100%" style="stop-color:#0d0221;stop-opacity:0.85" />
                        </linearGradient>
                        <radialGradient id="ghost-teen-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#b388ff;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#651fff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#120338;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="ghost-teen-wisp" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0.15" />
                        </linearGradient>
                        <radialGradient id="ghost-teen-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#7c4dff;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#120338;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="95" rx="30" ry="5" fill="#1a1a1a" opacity="0.24"/>
                        <ellipse cx="50" cy="50" rx="44" ry="42" fill="url(#ghost-teen-core)" opacity="0.35"/>
                        <g class="tm-animate-tail">
                            <path d="M 54 82 Q 66 98 80 84 Q 86 72 76 66 Q 64 70 54 82 Z" fill="url(#ghost-teen-wisp)" stroke="#9575cd" stroke-width="1" opacity="0.78"/>
                            <path d="M 64 78 Q 74 88 78 76" stroke="#ce93d8" stroke-width="0.75" fill="none" opacity="0.45"/>
                            <circle cx="78" cy="70" r="2" fill="#9575cd" opacity="0.5"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 24 50 Q 6 38 4 54 Q 6 72 20 64 Q 26 58 28 52 Z" fill="url(#ghost-teen-wisp)" stroke="#4527a0" stroke-width="1.1" opacity="0.85"/>
                            <path d="M 12 48 Q 8 56 14 62" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <path d="M 8 52 L 4 48" stroke="#9575cd" stroke-width="1.2" stroke-linecap="round"/>
                            <circle cx="10" cy="58" r="1.1" fill="#9575cd" opacity="0.32"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 76 50 Q 94 38 96 54 Q 94 72 80 64 Q 74 58 72 52 Z" fill="url(#ghost-teen-wisp)" stroke="#4527a0" stroke-width="1.1" opacity="0.85"/>
                            <path d="M 88 48 Q 92 56 86 62" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <path d="M 92 52 L 96 48" stroke="#9575cd" stroke-width="1.2" stroke-linecap="round"/>
                            <circle cx="90" cy="58" r="1.1" fill="#9575cd" opacity="0.32"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 24 58 Q 20 34 36 22 Q 50 14 64 22 Q 80 34 76 58 Q 74 78 62 90 Q 50 98 38 90 Q 26 78 24 58 Z"
                                  fill="url(#ghost-teen-body)" stroke="#4527a0" stroke-width="2.3" opacity="0.92"/>
                            <path d="M 30 38 Q 50 18 70 38 Q 68 32 50 26 Q 32 32 30 38 Z" fill="url(#ghost-teen-veil)" stroke="#4527a0" stroke-width="1.2"/>
                            <path d="M 36 34 Q 50 24 64 34" stroke="#b39ddb" stroke-width="0.8" fill="none" opacity="0.4"/>
                            <ellipse cx="42" cy="32" rx="7" ry="4" fill="#fff" opacity="0.1"/>
                            <circle cx="50" cy="58" r="8" fill="url(#ghost-teen-core)" opacity="0.75"/>
                            <circle cx="50" cy="58" r="3.5" fill="#651fff" opacity="0.45"/>
                            <circle cx="34" cy="64" r="1.8" fill="#9575cd" opacity="0.35"/>
                            <circle cx="66" cy="66" r="1.5" fill="#e1bee7" opacity="0.3"/>
                            <path d="M 32 88 Q 30 98 36 100" stroke="url(#ghost-teen-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
                            <path d="M 42 92 Q 40 102 46 104" stroke="url(#ghost-teen-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <path d="M 50 94 Q 50 104 54 106" stroke="url(#ghost-teen-wisp)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.75"/>
                            <path d="M 58 92 Q 60 102 54 104" stroke="url(#ghost-teen-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.72"/>
                            <path d="M 68 88 Q 70 98 64 100" stroke="url(#ghost-teen-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
                            <path d="M 34 46 Q 50 42 66 46" stroke="#b39ddb" stroke-width="0.75" fill="none" opacity="0.35"/>
                            <path d="M 38 52 Q 42 54 46 52" stroke="#4527a0" stroke-width="0.65" fill="none" opacity="0.3"/>
                            <path d="M 54 52 Q 58 54 62 52" stroke="#4527a0" stroke-width="0.65" fill="none" opacity="0.3"/>
                            <circle cx="48" cy="64" r="1.4" fill="#651fff" opacity="0.35"/>
                            <circle cx="52" cy="66" r="1.2" fill="#fff" opacity="0.2"/>
                            <circle cx="30" cy="62" r="1.3" fill="#9575cd" opacity="0.28"/>
                            <circle cx="70" cy="64" r="1.1" fill="#9575cd" opacity="0.25"/>
                            <path d="M 44 30 L 46 34 M 54 30 L 52 34" stroke="#9575cd" stroke-width="0.7" opacity="0.4"/>
                            <circle cx="50" cy="50" r="1.3" fill="#fff" opacity="0.18"/>
                            <path d="M 42 60 Q 46 62 50 60" stroke="#9575cd" stroke-width="0.6" fill="none" opacity="0.3"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 26 58 Q 10 64 6 50 Q 4 42 12 44" fill="none" stroke="url(#ghost-teen-body)" stroke-width="5" stroke-linecap="round" opacity="0.88"/>
                            <path d="M 8 44 L 2 38 M 8 46 L 0 46 M 10 48 L 4 52" stroke="#9575cd" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 74 58 Q 90 64 94 50 Q 96 42 88 44" fill="none" stroke="url(#ghost-teen-body)" stroke-width="5" stroke-linecap="round" opacity="0.88"/>
                            <path d="M 92 44 L 98 38 M 92 46 L 100 46 M 90 48 L 96 52" stroke="#9575cd" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="94" rx="6" ry="3.8" fill="url(#ghost-teen-wisp)" opacity="0.7"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="94" rx="6" ry="3.8" fill="url(#ghost-teen-wisp)" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <path d="M 35 38 Q 41 28 47 38 Q 41 40 35 38" fill="#faf8ff" stroke="#4527a0" stroke-width="1.4"/>
                            <path d="M 53 38 Q 59 28 65 38 Q 59 40 53 38" fill="#faf8ff" stroke="#4527a0" stroke-width="1.4"/>
                            <ellipse cx="41.5" cy="35.5" rx="3.2" ry="3.8" fill="url(#ghost-teen-iris)"/>
                            <ellipse cx="59.5" cy="35.5" rx="3.2" ry="3.8" fill="url(#ghost-teen-iris)"/>
                            <ellipse cx="41.5" cy="36" rx="1.6" ry="2.2" fill="#060612"/>
                            <ellipse cx="59.5" cy="36" rx="1.6" ry="2.2" fill="#060612"/>
                            <circle cx="42.8" cy="33.2" r="1.5" fill="#fff" opacity="0.95"/>
                            <circle cx="60.8" cy="33.2" r="1.5" fill="#fff" opacity="0.95"/>
                            <circle cx="39.8" cy="36.5" r="0.75" fill="#b39ddb" opacity="0.55"/>
                            <circle cx="57.8" cy="36.5" r="0.75" fill="#b39ddb" opacity="0.55"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 36 36 Q 41 34 46 36" stroke="#4527a0" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                            <path d="M 54 36 Q 59 34 64 36" stroke="#4527a0" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44 48 Q 50 53.5 56 48" stroke="#4527a0" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 50 Q 50 44 56 50" stroke="#4527a0" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- GHOST ADULT — Veil Wraith -->
                <g id="tm-mascot-evo3-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-adult-cloak" cx="45%" cy="25%" r="85%">
                            <stop offset="0%" style="stop-color:#4a148c;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#311b92;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#1a237e;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0d0221;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ghost-adult-void" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#1a0033;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#0a0018;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ghost-adult-void-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#b388ff;stop-opacity:0.85" />
                            <stop offset="45%" style="stop-color:#651fff;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color:#120338;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="ghost-adult-iris" cx="32%" cy="28%" r="70%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ea80fc;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#651fff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#120338;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="ghost-adult-wisp" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#9575cd;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:0.1" />
                        </linearGradient>
                        <linearGradient id="ghost-adult-claw" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#d1c4e9;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4527a0;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="34" ry="5" fill="#1a1a1a" opacity="0.28"/>
                        <g class="tm-animate-tail">
                            <path d="M 8 48 Q 2 58 6 68 Q 10 74 16 70 Q 14 60 8 48 Z" fill="url(#ghost-adult-wisp)" stroke="#7c4dff" stroke-width="0.9" opacity="0.65"/>
                            <path d="M 92 48 Q 98 58 94 68 Q 90 74 84 70 Q 86 60 92 48 Z" fill="url(#ghost-adult-wisp)" stroke="#7c4dff" stroke-width="0.9" opacity="0.65"/>
                            <path d="M 10 56 Q 6 62 10 68" stroke="#ce93d8" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <path d="M 90 56 Q 94 62 90 68" stroke="#ce93d8" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <circle cx="8" cy="62" r="1.8" fill="#7c4dff" opacity="0.5"/>
                            <circle cx="92" cy="62" r="1.8" fill="#7c4dff" opacity="0.5"/>
                            <circle cx="12" cy="66" r="1.2" fill="#e1bee7" opacity="0.4"/>
                            <circle cx="88" cy="66" r="1.2" fill="#e1bee7" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 22 48 Q 10 36 6 52 Q 8 68 18 62 Q 24 56 22 48 Z" fill="url(#ghost-adult-wisp)" stroke="#120338" stroke-width="1.2" opacity="0.8"/>
                            <path d="M 14 50 Q 10 56 12 62" stroke="#b39ddb" stroke-width="0.75" fill="none" opacity="0.45"/>
                            <path d="M 10 54 Q 6 60 10 66" stroke="#9575cd" stroke-width="0.65" fill="none" opacity="0.35"/>
                            <path d="M 8 54 L 4 50" stroke="#7c4dff" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 78 48 Q 90 36 94 52 Q 92 68 82 62 Q 76 56 78 48 Z" fill="url(#ghost-adult-wisp)" stroke="#120338" stroke-width="1.2" opacity="0.8"/>
                            <path d="M 86 50 Q 90 56 88 62" stroke="#b39ddb" stroke-width="0.75" fill="none" opacity="0.45"/>
                            <path d="M 90 54 Q 94 60 90 66" stroke="#9575cd" stroke-width="0.65" fill="none" opacity="0.35"/>
                            <path d="M 92 54 L 96 50" stroke="#7c4dff" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 20 54 L 14 94 Q 18 98 28 96 L 34 58 Z" fill="url(#ghost-adult-cloak)" stroke="#120338" stroke-width="1.6"/>
                            <path d="M 80 54 L 86 94 Q 82 98 72 96 L 66 58 Z" fill="url(#ghost-adult-cloak)" stroke="#120338" stroke-width="1.6"/>
                            <path d="M 28 52 Q 50 44 72 52 L 78 92 Q 74 98 50 100 Q 26 98 22 92 Z" fill="url(#ghost-adult-cloak)" stroke="#120338" stroke-width="2.4"/>
                            <path d="M 32 58 Q 36 78 34 90" stroke="#1a237e" stroke-width="1.8" fill="none" opacity="0.4"/>
                            <path d="M 68 58 Q 64 78 66 90" stroke="#1a237e" stroke-width="1.8" fill="none" opacity="0.4"/>
                            <path d="M 24 70 L 28 74 L 26 78 L 22 74 Z" fill="#311b92" stroke="#7c4dff" stroke-width="0.6" opacity="0.55"/>
                            <path d="M 76 70 L 72 74 L 74 78 L 78 74 Z" fill="#311b92" stroke="#7c4dff" stroke-width="0.6" opacity="0.55"/>
                            <path d="M 30 82 L 34 86 L 32 90 L 28 86 Z" fill="#4527a0" stroke="#7c4dff" stroke-width="0.55" opacity="0.5"/>
                            <path d="M 70 82 L 66 86 L 68 90 L 72 86 Z" fill="#4527a0" stroke="#7c4dff" stroke-width="0.55" opacity="0.5"/>
                            <ellipse cx="50" cy="68" rx="14" ry="12" fill="url(#ghost-adult-void-glow)" opacity="0.55"/>
                            <circle cx="50" cy="68" r="9" fill="url(#ghost-adult-void)"/>
                            <circle cx="50" cy="68" r="5" fill="url(#ghost-adult-void-glow)" opacity="0.85"/>
                            <circle cx="50" cy="68" r="2.2" fill="#e1bee7" opacity="0.7"/>
                            <path d="M 38 48 Q 50 38 62 48 Q 58 42 50 40 Q 42 42 38 48 Z" fill="#0d0221" opacity="0.75" stroke="#7c4dff" stroke-width="1"/>
                            <ellipse cx="42" cy="44" rx="6" ry="3.5" fill="#fff" opacity="0.08"/>
                            <path d="M 34 88 Q 32 96 38 98" stroke="url(#ghost-adult-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
                            <path d="M 44 92 Q 42 100 48 102" stroke="url(#ghost-adult-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <path d="M 50 94 Q 50 102 54 104" stroke="url(#ghost-adult-wisp)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.7"/>
                            <path d="M 56 92 Q 58 100 52 102" stroke="url(#ghost-adult-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <path d="M 66 88 Q 68 96 62 98" stroke="url(#ghost-adult-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.65"/>
                            <path d="M 26 64 L 30 68 L 28 72 L 24 68 Z" fill="#311b92" stroke="#7c4dff" stroke-width="0.5" opacity="0.45"/>
                            <path d="M 74 64 L 70 68 L 72 72 L 76 68 Z" fill="#311b92" stroke="#7c4dff" stroke-width="0.5" opacity="0.45"/>
                            <circle cx="36" cy="76" r="1.3" fill="#7c4dff" opacity="0.35"/>
                            <circle cx="64" cy="78" r="1.2" fill="#b39ddb" opacity="0.3"/>
                            <path d="M 40 52 Q 50 50 60 52" stroke="#651fff" stroke-width="0.7" fill="none" opacity="0.4"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 24 58 Q 8 62 4 48 Q 2 40 10 42" fill="none" stroke="url(#ghost-adult-claw)" stroke-width="5.5" stroke-linecap="round" opacity="0.92"/>
                            <path d="M 6 40 L 0 34 M 6 42 L -2 42 M 8 44 L 2 48" stroke="#7c4dff" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M 4 38 L -2 32 M 8 38 L 10 32 M 10 42 L 14 36" stroke="#d1c4e9" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 76 58 Q 92 62 96 48 Q 98 40 90 42" fill="none" stroke="url(#ghost-adult-claw)" stroke-width="5.5" stroke-linecap="round" opacity="0.92"/>
                            <path d="M 94 40 L 100 34 M 94 42 L 102 42 M 92 44 L 98 48" stroke="#7c4dff" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M 96 38 L 102 32 M 92 38 L 90 32 M 90 42 L 86 36" stroke="#d1c4e9" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="96" rx="7" ry="4.5" fill="url(#ghost-adult-wisp)" stroke="#120338" stroke-width="1" opacity="0.65"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="96" rx="7" ry="4.5" fill="url(#ghost-adult-wisp)" stroke="#120338" stroke-width="1" opacity="0.65"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="42" rx="6.5" ry="7.5" fill="#f3e8ff" stroke="#120338" stroke-width="1.5"/>
                            <ellipse cx="60" cy="42" rx="6.5" ry="7.5" fill="#f3e8ff" stroke="#120338" stroke-width="1.5"/>
                            <ellipse cx="40.6" cy="42.4" rx="3.4" ry="4.2" fill="url(#ghost-adult-iris)"/>
                            <ellipse cx="60.6" cy="42.4" rx="3.4" ry="4.2" fill="url(#ghost-adult-iris)"/>
                            <ellipse cx="40.6" cy="42.7" rx="1.7" ry="2.6" fill="#060612"/>
                            <ellipse cx="60.6" cy="42.7" rx="1.7" ry="2.6" fill="#060612"/>
                            <circle cx="42" cy="39.6" r="1.9" fill="#fff" opacity="0.96"/>
                            <circle cx="62" cy="39.6" r="1.9" fill="#fff" opacity="0.96"/>
                            <circle cx="39.2" cy="44.2" r="0.9" fill="#e1bee7" opacity="0.6"/>
                            <circle cx="59.2" cy="44.2" r="0.9" fill="#e1bee7" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.5 42 Q 40 38.5 46.5 42" stroke="#120338" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53.5 42 Q 60 38.5 66.5 42" stroke="#120338" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43 52 Q 50 57.5 57 52" stroke="#7c4dff" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 54 Q 50 48 57 54" stroke="#7c4dff" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- GHOST MIDDLE AGE — chain phantom -->
                <g id="tm-mascot-evo4-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-mid-body" cx="42%" cy="24%" r="80%">
                            <stop offset="0%" style="stop-color:#eceff1;stop-opacity:0.92" />
                            <stop offset="40%" style="stop-color:#b0bec5;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#546e7a;stop-opacity:0.9" />
                        </radialGradient>
                        <linearGradient id="ghost-mid-veil" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#607d8b;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#37474f;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="ghost-mid-iris" cx="38%" cy="32%" r="62%">
                            <stop offset="0%" style="stop-color:#80deea;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#4dd0e1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="ghost-mid-wisp" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#cfd8dc;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#546e7a;stop-opacity:0.2" />
                        </linearGradient>
                        <linearGradient id="ghost-mid-chain" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#eceff1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#78909c;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="97" rx="28" ry="5" fill="#1a1a1a" opacity="0.2"/>
                        <ellipse cx="50" cy="54" rx="38" ry="36" fill="url(#ghost-mid-wisp)" opacity="0.25"/>
                        <g class="tm-animate-tail">
                            <path d="M 58 80 Q 72 92 80 78 Q 84 68 74 64 Q 64 68 58 80 Z" fill="url(#ghost-mid-wisp)" stroke="#b0bec5" stroke-width="0.95" opacity="0.7"/>
                            <ellipse cx="72" cy="72" rx="3" ry="2" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.4"/>
                            <ellipse cx="78" cy="68" rx="2.5" ry="1.8" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.2"/>
                            <ellipse cx="82" cy="74" rx="2.2" ry="1.6" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.1"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 26 54 Q 14 46 12 58 Q 14 68 24 62 Z" fill="url(#ghost-mid-wisp)" stroke="#78909c" stroke-width="0.9" opacity="0.72"/>
                            <ellipse cx="16" cy="56" rx="2" ry="1.5" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1"/>
                            <ellipse cx="14" cy="62" rx="1.8" ry="1.3" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 74 54 Q 86 46 88 58 Q 86 68 76 62 Z" fill="url(#ghost-mid-wisp)" stroke="#78909c" stroke-width="0.9" opacity="0.72"/>
                            <ellipse cx="84" cy="56" rx="2" ry="1.5" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1"/>
                            <ellipse cx="86" cy="62" rx="1.8" ry="1.3" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 26 58 Q 22 36 38 24 Q 50 16 62 24 Q 78 36 74 58 Q 72 78 62 90 Q 50 98 38 90 Q 26 78 26 58 Z"
                                  fill="url(#ghost-mid-body)" stroke="#78909c" stroke-width="2" opacity="0.88"/>
                            <path d="M 32 40 Q 50 26 68 40 Q 66 34 50 30 Q 34 34 32 40 Z" fill="url(#ghost-mid-veil)" opacity="0.65"/>
                            <path d="M 36 36 L 40 42 M 44 34 L 46 42 M 52 34 L 54 42 M 58 36 L 62 42" stroke="#cfd8dc" stroke-width="0.9" opacity="0.55"/>
                            <path d="M 38 38 Q 42 40 46 38" stroke="#90a4ae" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <path d="M 54 38 Q 58 40 62 38" stroke="#90a4ae" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <ellipse cx="42" cy="34" rx="7" ry="4" fill="#fff" opacity="0.1"/>
                            <circle cx="50" cy="58" r="8" fill="#546e7a" opacity="0.35"/>
                            <circle cx="50" cy="58" r="4" fill="#b0bec5" opacity="0.45"/>
                            <ellipse cx="30" cy="70" rx="2.5" ry="1.8" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.2"/>
                            <ellipse cx="70" cy="72" rx="2.5" ry="1.8" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.2"/>
                            <ellipse cx="34" cy="78" rx="2.2" ry="1.6" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.1"/>
                            <path d="M 34 88 Q 32 96 38 98" stroke="url(#ghost-mid-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.6"/>
                            <path d="M 50 92 Q 50 100 54 102" stroke="url(#ghost-mid-wisp)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.62"/>
                            <path d="M 66 88 Q 68 96 62 98" stroke="url(#ghost-mid-wisp)" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.6"/>
                            <ellipse cx="50" cy="66" rx="2.5" ry="1.8" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="1.1"/>
                            <path d="M 40 52 Q 50 50 60 52" stroke="#cfd8dc" stroke-width="0.7" fill="none" opacity="0.35"/>
                            <circle cx="46" cy="70" r="1.2" fill="#fff" opacity="0.18"/>
                            <circle cx="54" cy="72" r="1" fill="#b0bec5" opacity="0.16"/>
                            <path d="M 48 34 L 50 38 L 52 34" stroke="#90a4ae" stroke-width="0.65" fill="none" opacity="0.4"/>
                            <ellipse cx="42" cy="60" rx="2" ry="1.5" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="0.95"/>
                            <ellipse cx="58" cy="62" rx="2" ry="1.5" fill="none" stroke="url(#ghost-mid-chain)" stroke-width="0.95"/>
                            <circle cx="50" cy="52" r="1.2" fill="#cfd8dc" opacity="0.25"/>
                            <path d="M 38 74 Q 40 78 42 74" stroke="#b0bec5" stroke-width="0.6" fill="none" opacity="0.3"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 28 58 Q 14 62 10 50 Q 8 44 14 46" fill="none" stroke="url(#ghost-mid-body)" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
                            <path d="M 10 46 L 4 40 M 10 48 L 2 48" stroke="#b0bec5" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 72 58 Q 86 62 90 50 Q 92 44 86 46" fill="none" stroke="url(#ghost-mid-body)" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
                            <path d="M 90 46 L 96 40 M 90 48 L 98 48" stroke="#b0bec5" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="40" cy="94" rx="6" ry="3.8" fill="url(#ghost-mid-wisp)" opacity="0.65"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="60" cy="94" rx="6" ry="3.8" fill="url(#ghost-mid-wisp)" opacity="0.65"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="41" cy="40" rx="5.5" ry="6.2" fill="#f5f5f5" stroke="#78909c" stroke-width="1.5"/>
                            <ellipse cx="59" cy="40" rx="5.5" ry="6.2" fill="#f5f5f5" stroke="#78909c" stroke-width="1.5"/>
                            <ellipse cx="41.6" cy="40.4" rx="2.9" ry="3.5" fill="url(#ghost-mid-iris)"/>
                            <ellipse cx="59.6" cy="40.4" rx="2.9" ry="3.5" fill="url(#ghost-mid-iris)"/>
                            <ellipse cx="41.6" cy="40.7" rx="1.4" ry="2.1" fill="#060612"/>
                            <ellipse cx="59.6" cy="40.7" rx="1.4" ry="2.1" fill="#060612"/>
                            <circle cx="43" cy="38.016" r="1.6" fill="#fff" opacity="0.96"/>
                            <circle cx="61" cy="38.016" r="1.6" fill="#fff" opacity="0.96"/>
                            <circle cx="40.2" cy="42.2" r="0.8" fill="#e1bee7" opacity="0.6"/>
                            <circle cx="58.2" cy="42.2" r="0.8" fill="#e1bee7" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 35.5 40 Q 41 36.5 46.5 40" stroke="#78909c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53.5 40 Q 59 36.5 64.5 40" stroke="#78909c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44 50 Q 50 55.5 56 50" stroke="#78909c" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 52 Q 50 46 56 52" stroke="#78909c" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- GHOST OLD — eternal phantom -->
                <g id="tm-mascot-evo5-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-old-body" cx="44%" cy="22%" r="82%">
                            <stop offset="0%" style="stop-color:#fafafa;stop-opacity:0.95" />
                            <stop offset="35%" style="stop-color:#e0f7fa;stop-opacity:0.88" />
                            <stop offset="70%" style="stop-color:#80cbc4;stop-opacity:0.82" />
                            <stop offset="100%" style="stop-color:#4db6ac;stop-opacity:0.85" />
                        </radialGradient>
                        <radialGradient id="ghost-old-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.5" />
                            <stop offset="45%" style="stop-color:#80deea;stop-opacity:0.22" />
                            <stop offset="100%" style="stop-color:#26c6da;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="ghost-old-iris" cx="40%" cy="35%" r="60%">
                            <stop offset="0%" style="stop-color:#80deea;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#4dd0e1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#01579b;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="ghost-old-ecto" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#4db6ac;stop-opacity:0.25" />
                        </linearGradient>
                        <radialGradient id="ghost-old-third" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00838f;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="54" rx="46" ry="52" fill="url(#ghost-old-aura)" class="tm-wisdom-aura"/>
                        <ellipse cx="50" cy="99" rx="26" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <g class="tm-animate-tail">
                            <path d="M 56 82 Q 68 98 84 86 Q 90 74 80 68 Q 68 72 56 82 Z" fill="url(#ghost-old-ecto)" stroke="#80deea" stroke-width="0.95" opacity="0.72"/>
                            <path d="M 66 78 Q 78 90 82 78" stroke="#b2ebf2" stroke-width="0.75" fill="none" opacity="0.45"/>
                            <path d="M 72 74 Q 84 80 86 70" stroke="#80deea" stroke-width="0.65" fill="none" opacity="0.4"/>
                            <circle cx="84" cy="72" r="2" fill="#80deea" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <path d="M 24 52 Q 8 40 6 56 Q 8 72 18 66 Q 26 60 28 54 Z" fill="url(#ghost-old-ecto)" stroke="#546e7a" stroke-width="1" opacity="0.78"/>
                            <path d="M 14 50 Q 10 56 12 62" stroke="#b2ebf2" stroke-width="0.65" fill="none" opacity="0.4"/>
                            <path d="M 10 58 Q 6 64 10 70" stroke="#80deea" stroke-width="0.6" fill="none" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 76 52 Q 92 40 94 56 Q 92 72 82 66 Q 74 60 72 54 Z" fill="url(#ghost-old-ecto)" stroke="#546e7a" stroke-width="1" opacity="0.78"/>
                            <path d="M 86 50 Q 90 56 88 62" stroke="#b2ebf2" stroke-width="0.65" fill="none" opacity="0.4"/>
                            <path d="M 90 58 Q 94 64 90 70" stroke="#80deea" stroke-width="0.6" fill="none" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 22 56 Q 18 34 36 22 Q 50 14 64 22 Q 82 34 78 56 Q 76 80 64 92 Q 50 100 36 92 Q 24 80 22 56 Z"
                                  fill="url(#ghost-old-body)" stroke="#546e7a" stroke-width="1.8" opacity="0.9"/>
                            <ellipse cx="42" cy="32" rx="8" ry="5" fill="#fff" opacity="0.14"/>
                            <path d="M 30 48 Q 34 72 32 88" stroke="#b0bec5" stroke-width="1.5" fill="none" opacity="0.35"/>
                            <path d="M 70 48 Q 66 72 68 88" stroke="#b0bec5" stroke-width="1.5" fill="none" opacity="0.35"/>
                            <circle cx="50" cy="60" r="9" fill="url(#ghost-old-aura)" opacity="0.55"/>
                            <circle cx="50" cy="60" r="4.5" fill="#fff" opacity="0.35"/>
                            <path d="M 14 62 L 18 62 L 20 58 L 16 58 Z" fill="none" stroke="#80deea" stroke-width="0.9" opacity="0.55"/>
                            <path d="M 86 58 L 82 58 L 80 62 L 84 62 Z" fill="none" stroke="#80deea" stroke-width="0.9" opacity="0.55"/>
                            <circle cx="18" cy="70" r="2.5" fill="none" stroke="#80deea" stroke-width="0.8" opacity="0.45"/>
                            <path d="M 82 72 L 86 76 L 82 80 L 78 76 Z" fill="none" stroke="#80deea" stroke-width="0.85" opacity="0.45"/>
                            <path d="M 12 78 Q 16 74 20 78 Q 16 82 12 78" fill="none" stroke="#4dd0e1" stroke-width="0.8" opacity="0.4"/>
                            <path d="M 88 84 Q 84 80 80 84 Q 84 88 88 84" fill="none" stroke="#4dd0e1" stroke-width="0.8" opacity="0.4"/>
                            <path d="M 36 88 Q 34 96 40 98" stroke="url(#ghost-old-ecto)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.65"/>
                            <path d="M 44 92 Q 42 102 48 104" stroke="url(#ghost-old-ecto)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <path d="M 50 94 Q 48 104 54 106" stroke="url(#ghost-old-ecto)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.7"/>
                            <path d="M 56 92 Q 58 102 52 104" stroke="url(#ghost-old-ecto)" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.68"/>
                            <path d="M 64 88 Q 66 96 60 98" stroke="url(#ghost-old-ecto)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.65"/>
                            <path d="M 8 52 Q 4 48 8 44 Q 12 48 8 52" fill="none" stroke="#80deea" stroke-width="0.75" opacity="0.4"/>
                            <path d="M 92 48 Q 96 44 92 40 Q 88 44 92 48" fill="none" stroke="#80deea" stroke-width="0.75" opacity="0.4"/>
                            <path d="M 16 64 L 20 64 L 22 60 L 18 60 Z" fill="none" stroke="#80deea" stroke-width="0.75" opacity="0.4"/>
                            <path d="M 84 68 L 88 68 L 90 64 L 86 64 Z" fill="none" stroke="#80deea" stroke-width="0.75" opacity="0.4"/>
                            <circle cx="24" cy="78" r="1.8" fill="#80deea" opacity="0.3"/>
                            <circle cx="76" cy="80" r="1.6" fill="#4dd0e1" opacity="0.28"/>
                            <path d="M 44 38 Q 50 36 56 38" stroke="#b0bec5" stroke-width="0.65" fill="none" opacity="0.35"/>
                            <line x1="46" y1="26" x2="54" y2="26" stroke="#80deea" stroke-width="0.6" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 26 58 Q 10 64 6 50 Q 4 44 12 46" fill="none" stroke="url(#ghost-old-body)" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>
                            <path d="M 8 44 L 2 38 M 8 46 L 0 46 M 10 48 L 4 52" stroke="#80deea" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 74 58 Q 90 64 94 50 Q 96 44 88 46" fill="none" stroke="url(#ghost-old-body)" stroke-width="4.5" stroke-linecap="round" opacity="0.85"/>
                            <path d="M 92 44 L 98 38 M 92 46 L 100 46 M 90 48 L 96 52" stroke="#80deea" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="96" rx="5.5" ry="3.5" fill="url(#ghost-old-ecto)" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="96" rx="5.5" ry="3.5" fill="url(#ghost-old-ecto)" opacity="0.6"/>
                        </g>
                        <circle cx="50" cy="28" r="2.8" fill="url(#ghost-old-third)" stroke="#546e7a" stroke-width="0.9" opacity="0.75"/>
                        <circle cx="50" cy="28" r="1.4" fill="#4dd0e1" opacity="0.85"/>
                        <circle cx="50.5" cy="27.2" r="0.55" fill="#fff"/>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="36" rx="4.8" ry="5.2" fill="#fafafa" stroke="#546e7a" stroke-width="1.5"/>
                            <ellipse cx="58" cy="36" rx="4.8" ry="5.2" fill="#fafafa" stroke="#546e7a" stroke-width="1.5"/>
                            <ellipse cx="42.6" cy="36.4" rx="2.5" ry="2.9" fill="url(#ghost-old-iris)"/>
                            <ellipse cx="58.6" cy="36.4" rx="2.5" ry="2.9" fill="url(#ghost-old-iris)"/>
                            <ellipse cx="42.6" cy="36.7" rx="1.2" ry="1.8" fill="#060612"/>
                            <ellipse cx="58.6" cy="36.7" rx="1.2" ry="1.8" fill="#060612"/>
                            <circle cx="44" cy="34.336" r="1.4" fill="#fff" opacity="0.96"/>
                            <circle cx="60" cy="34.336" r="1.4" fill="#fff" opacity="0.96"/>
                            <circle cx="41.2" cy="38.2" r="0.7" fill="#e1bee7" opacity="0.6"/>
                            <circle cx="57.2" cy="38.2" r="0.7" fill="#e1bee7" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 37.2 36 Q 42 32.5 46.8 36" stroke="#546e7a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53.2 36 Q 58 32.5 62.8 36" stroke="#546e7a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 46 Q 50 51.5 55 46" stroke="#546e7a" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 48 Q 50 42 55 48" stroke="#546e7a" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>
                <!-- CAT CHARACTER - All Life Stages (dense cute epic v4 · feline boss) -->
                <!-- Fate & Shadow • Rare Rarity • Moonfang Oracle -->
                <!-- ═══════════════════════════════════════ -->

                <!-- CAT BABY — moon kitten -->
                <g id="tm-mascot-baby-cat" style="display: none;">
                    <defs>
                        <radialGradient id="cat-baby-fur" cx="38%" cy="28%" r="75%">
                            <stop offset="0%" style="stop-color:#ce93d8;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ab47bc;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#7b1fa2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-baby-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-baby-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#ce93d8;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6a1b9a;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="cat-baby-ear" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ad1457;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="cat-baby-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f48fb1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-baby-aura" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.38" />
                            <stop offset="45%" style="stop-color:#7e57c2;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-baby-mane" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-baby-tail-tip" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#f48fb1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="24" ry="4.5" fill="#0a0614" opacity="0.28"/>

                        <g class="tm-animate-tail">
                            <path d="M 62 70 Q 78 62 84 48 Q 88 38 80 40 Q 70 52 64 68 Z" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.45"/>
                            <path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
                            <ellipse cx="80" cy="46" rx="3.5" ry="4.5" fill="url(#cat-baby-tail-tip)" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <!-- Left ear tuft -->
                            <path d="M 24 18 Q 14 8 16 22" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 22 16 L 12 6" stroke="#4a148c" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="13" cy="8" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <!-- Right ear tuft -->
                            <path d="M 76 18 Q 86 8 84 22" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 78 16 L 88 6" stroke="#4a148c" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="87" cy="8" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">

                            <ellipse cx="50" cy="68" rx="22" ry="20" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.55"/>
                            <ellipse cx="50" cy="71" rx="15.0" ry="14.0" fill="url(#cat-baby-belly)"/>

                            <!-- Round cat head -->
                            <ellipse cx="50" cy="34" rx="20" ry="18" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.55"/>
                            <ellipse cx="37.0" cy="29" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
                            <!-- Cat ears -->
                            <path d="M 33.4 32 L 25.1 8 L 42 27 Z" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.35"/>
                            <path d="M 34 31 L 28.4 14 L 38 28.5 Z" fill="url(#cat-baby-ear)" opacity="0.92"/>
                            <path d="M 66.6 32 L 74.9 8 L 58 27 Z" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.35"/>
                            <path d="M 66 31 L 71.6 14 L 62 28.5 Z" fill="url(#cat-baby-ear)" opacity="0.92"/>
                            <!-- Tiny moon mark -->
                            <path d="M 50 18 A 4 4 0 1 1 50 25.5 A 3.2 3.2 0 1 0 50 18" fill="#f48fb1" opacity="0.85"/>
                            <!-- Muzzle -->
                            <ellipse cx="50" cy="42" rx="8.5" ry="5.2" fill="url(#cat-baby-belly)"/>
                            <path d="M 50 40.74 L 47.48 43.68 L 52.52 43.68 Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
                            <ellipse cx="50" cy="42.21" rx="0.735" ry="0.47250000000000003" fill="#fff" opacity="0.45"/>
                            <circle cx="33" cy="39" r="5" fill="url(#cat-baby-cheek)"/>
                            <circle cx="67" cy="39" r="5" fill="url(#cat-baby-cheek)"/>
                            <!-- Whiskers -->
                            <path d="M 41 39 L 28 37 M 41 41 L 29 41 M 41 43 L 29 45" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 59 39 L 72 37 M 59 41 L 71 41 M 59 43 L 71 45" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="27" cy="62" rx="6.2" ry="9.2" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.2" transform="rotate(-24 27 62)"/>
                            <ellipse cx="23" cy="72" rx="5.4" ry="4.4" fill="url(#cat-baby-belly)" stroke="#4a148c" stroke-width="0.9"/>
                            <ellipse cx="23" cy="73.155" rx="4.41" ry="2.7300000000000004" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="20.795" cy="72.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="23" cy="72" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="25.205" cy="72.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="73" cy="62" rx="6.2" ry="9.2" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.2" transform="rotate(24 73 62)"/>
                            <ellipse cx="77" cy="72" rx="5.4" ry="4.4" fill="url(#cat-baby-belly)" stroke="#4a148c" stroke-width="0.9"/>
                            <ellipse cx="77" cy="73.155" rx="4.41" ry="2.7300000000000004" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="74.795" cy="72.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="77" cy="72" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="79.205" cy="72.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="39" cy="86" rx="7.2" ry="5.4" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.2"/>
                            <ellipse cx="39" cy="88" rx="5.2" ry="2.8" fill="url(#cat-baby-belly)"/>
                            <ellipse cx="39" cy="88.155" rx="4.41" ry="2.7300000000000004" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="36.795" cy="87.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="39" cy="87" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="41.205" cy="87.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="61" cy="86" rx="7.2" ry="5.4" fill="url(#cat-baby-fur)" stroke="#4a148c" stroke-width="1.2"/>
                            <ellipse cx="61" cy="88" rx="5.2" ry="2.8" fill="url(#cat-baby-belly)"/>
                            <ellipse cx="61" cy="88.155" rx="4.41" ry="2.7300000000000004" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="58.795" cy="87.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="61" cy="87" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                            <circle cx="63.205" cy="87.315" r="0.9974999999999999" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="32" rx="7.2" ry="8.8" fill="#f8fbff" stroke="#4a148c" stroke-width="1.45"/>
                            <ellipse cx="40.3" cy="32.4" rx="3.7" ry="6.3" fill="url(#cat-baby-iris)"/>
                            <ellipse cx="40.35" cy="32.5" rx="1.6" ry="3.7" fill="#0a0614"/>
                            <circle cx="41.4" cy="29.5" r="2.0" fill="#f3e5f5" opacity="0.95"/>
                            <circle cx="39.1" cy="34.6" r="0.9" fill="#f3e5f5" opacity="0.5"/>
                            <ellipse cx="60" cy="32" rx="7.2" ry="8.8" fill="#f8fbff" stroke="#4a148c" stroke-width="1.45"/>
                            <ellipse cx="60.3" cy="32.4" rx="3.7" ry="6.3" fill="url(#cat-baby-iris)"/>
                            <ellipse cx="60.35" cy="32.5" rx="1.6" ry="3.7" fill="#0a0614"/>
                            <circle cx="61.4" cy="29.5" r="2.0" fill="#f3e5f5" opacity="0.95"/>
                            <circle cx="59.1" cy="34.6" r="0.9" fill="#f3e5f5" opacity="0.5"/>

                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.8 32 Q 40 28.8 47.2 32" stroke="#4a148c" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                            <path d="M 52.8 32 Q 60 28.8 67.2 32" stroke="#4a148c" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 44.5 46 Q 47.25 50.5 50 47.5 Q 52.75 50.5 55.5 46" stroke="#4a148c" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44.5 49 Q 50 43.5 55.5 49" stroke="#4a148c" stroke-width="1.9" fill="none" stroke-linecap="round"/>
                </g>

                <!-- CAT KID — shadow cub -->
                <g id="tm-mascot-evo1-cat" style="display: none;">
                    <defs>
                        <radialGradient id="cat-kid-fur" cx="38%" cy="28%" r="75%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4527a0;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-kid-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-kid-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#ce93d8;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6a1b9a;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="cat-kid-ear" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ad1457;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="cat-kid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f48fb1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-kid-aura" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.38" />
                            <stop offset="45%" style="stop-color:#7e57c2;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-kid-mane" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-kid-tail-tip" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#f48fb1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="26" ry="4.5" fill="#0a0614" opacity="0.28"/>

                        <g class="tm-animate-tail">
                            <path d="M 66 68 Q 86 56 92 40 Q 96 28 86 30 Q 74 44 68 66 Z" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.45"/>
                            <path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
                            <ellipse cx="90" cy="34" rx="4" ry="5" fill="url(#cat-kid-tail-tip)" opacity="0.85"/>
                            <circle cx="86" cy="42" r="1.2" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <!-- Left ear tuft -->
                            <path d="M 24 14 Q 14 4 16 18" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 22 12 L 12 2" stroke="#4a148c" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="13" cy="4" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <!-- Right ear tuft -->
                            <path d="M 76 14 Q 86 4 84 18" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 78 12 L 88 2" stroke="#4a148c" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="87" cy="4" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">

                            <ellipse cx="50" cy="66" rx="21" ry="19" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.55"/>
                            <ellipse cx="50" cy="69" rx="14.0" ry="13.0" fill="url(#cat-kid-belly)"/>
                            <!-- Soft spots -->
                            <ellipse cx="40" cy="60" rx="3.5" ry="2.5" fill="#f48fb1" opacity="0.25"/>
                            <ellipse cx="58" cy="66" rx="2.8" ry="2" fill="#f48fb1" opacity="0.22"/>
                            <!-- Round cat head -->
                            <ellipse cx="50" cy="32" rx="18.5" ry="16.5" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.55"/>
                            <ellipse cx="38.5" cy="27" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
                            <!-- Cat ears -->
                            <path d="M 33.2 30 L 24.8 4 L 42 25 Z" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.35"/>
                            <path d="M 34 29 L 28.2 10 L 38 26.5 Z" fill="url(#cat-kid-ear)" opacity="0.92"/>
                            <path d="M 66.8 30 L 75.2 4 L 58 25 Z" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.35"/>
                            <path d="M 66 29 L 71.8 10 L 62 26.5 Z" fill="url(#cat-kid-ear)" opacity="0.92"/>

                            <!-- Muzzle -->
                            <ellipse cx="50" cy="40" rx="8.5" ry="5.2" fill="url(#cat-kid-belly)"/>
                            <path d="M 50 38.8 L 47.6 41.6 L 52.4 41.6 Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
                            <ellipse cx="50" cy="40.2" rx="0.7" ry="0.45" fill="#fff" opacity="0.45"/>
                            <circle cx="33" cy="37" r="4" fill="url(#cat-kid-cheek)"/>
                            <circle cx="67" cy="37" r="4" fill="url(#cat-kid-cheek)"/>
                            <!-- Whiskers -->
                            <path d="M 41 37 L 28 35 M 41 39 L 29 39 M 41 41 L 29 43" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 59 37 L 72 35 M 59 39 L 71 39 M 59 41 L 71 43" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="27" cy="60" rx="6.2" ry="9.2" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.2" transform="rotate(-24 27 60)"/>
                            <ellipse cx="23" cy="70" rx="5.4" ry="4.4" fill="url(#cat-kid-belly)" stroke="#4a148c" stroke-width="0.9"/>
                            <ellipse cx="23" cy="71.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="20.9" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="23" cy="70" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="25.1" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="73" cy="60" rx="6.2" ry="9.2" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.2" transform="rotate(24 73 60)"/>
                            <ellipse cx="77" cy="70" rx="5.4" ry="4.4" fill="url(#cat-kid-belly)" stroke="#4a148c" stroke-width="0.9"/>
                            <ellipse cx="77" cy="71.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="74.9" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="77" cy="70" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="79.1" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="39" cy="86" rx="7.2" ry="5.4" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.2"/>
                            <ellipse cx="39" cy="88" rx="5.2" ry="2.8" fill="url(#cat-kid-belly)"/>
                            <ellipse cx="39" cy="88.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="36.9" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="39" cy="87" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="41.1" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="61" cy="86" rx="7.2" ry="5.4" fill="url(#cat-kid-fur)" stroke="#4a148c" stroke-width="1.2"/>
                            <ellipse cx="61" cy="88" rx="5.2" ry="2.8" fill="url(#cat-kid-belly)"/>
                            <ellipse cx="61" cy="88.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="58.9" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="61" cy="87" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="63.1" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="30" rx="6.8" ry="8.2" fill="#f8fbff" stroke="#4a148c" stroke-width="1.45"/>
                            <ellipse cx="40.3" cy="30.4" rx="3.5" ry="5.9" fill="url(#cat-kid-iris)"/>
                            <ellipse cx="40.35" cy="30.5" rx="1.5" ry="3.4" fill="#0a0614"/>
                            <circle cx="41.4" cy="27.7" r="1.9" fill="#f3e5f5" opacity="0.95"/>
                            <circle cx="39.1" cy="32.5" r="0.8" fill="#f3e5f5" opacity="0.5"/>
                            <ellipse cx="60" cy="30" rx="6.8" ry="8.2" fill="#f8fbff" stroke="#4a148c" stroke-width="1.45"/>
                            <ellipse cx="60.3" cy="30.4" rx="3.5" ry="5.9" fill="url(#cat-kid-iris)"/>
                            <ellipse cx="60.35" cy="30.5" rx="1.5" ry="3.4" fill="#0a0614"/>
                            <circle cx="61.4" cy="27.7" r="1.9" fill="#f3e5f5" opacity="0.95"/>
                            <circle cx="59.1" cy="32.5" r="0.8" fill="#f3e5f5" opacity="0.5"/>

                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.2 30 Q 40 26.8 46.8 30" stroke="#4a148c" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                            <path d="M 53.2 30 Q 60 26.8 66.8 30" stroke="#4a148c" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43.8 44 Q 46.9 48.5 50 45.5 Q 53.1 48.5 56.2 44" stroke="#4a148c" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43.8 47 Q 50 41.5 56.2 47" stroke="#4a148c" stroke-width="1.9" fill="none" stroke-linecap="round"/>
                </g>

                <!-- CAT TEEN — omen stalker -->
                <g id="tm-mascot-evo2-cat" style="display: none;">
                    <defs>
                        <radialGradient id="cat-teen-fur" cx="38%" cy="28%" r="75%">
                            <stop offset="0%" style="stop-color:#9575cd;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#5e35b1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-teen-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-teen-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#ce93d8;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6a1b9a;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="cat-teen-ear" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ad1457;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="cat-teen-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f48fb1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-teen-aura" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.38" />
                            <stop offset="45%" style="stop-color:#7e57c2;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-teen-mane" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-teen-tail-tip" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#f48fb1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="25" ry="4.5" fill="#0a0614" opacity="0.28"/>

                        <g class="tm-animate-tail">
                            <path d="M 68 66 Q 90 50 96 32 Q 100 20 90 22 Q 78 36 70 64 Z" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.45"/>
                            <path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
                            <ellipse cx="94" cy="26" rx="5" ry="6.5" fill="url(#cat-teen-tail-tip)" opacity="0.9"/>
                            <path d="M 82 44 Q 90 36 94 28" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <!-- Left ear tuft -->
                            <path d="M 24 12 Q 14 2 16 16" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 22 10 L 12 0" stroke="#311b92" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="13" cy="2" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <!-- Right ear tuft -->
                            <path d="M 76 12 Q 86 2 84 16" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 78 10 L 88 0" stroke="#311b92" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="87" cy="2" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">

                            <ellipse cx="50" cy="64" rx="19" ry="17" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.55"/>
                            <ellipse cx="50" cy="67" rx="12.0" ry="11.0" fill="url(#cat-teen-belly)"/>
                            <!-- Tabby stripes -->
                            <path d="M 38 56 Q 50 58 62 56" stroke="#311b92" stroke-width="1.1" fill="none" opacity="0.28"/>
                            <path d="M 40 62 Q 50 64 60 62" stroke="#311b92" stroke-width="0.95" fill="none" opacity="0.22"/>
                            <path d="M 42 68 Q 50 69.5 58 68" stroke="#311b92" stroke-width="0.85" fill="none" opacity="0.18"/>
                            <!-- Round cat head -->
                            <ellipse cx="50" cy="30" rx="17" ry="15" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.55"/>
                            <ellipse cx="40.0" cy="25" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
                            <!-- Cat ears -->
                            <path d="M 33.2 28 L 24.8 2 L 42 23 Z" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.35"/>
                            <path d="M 34 27 L 28.2 8 L 38 24.5 Z" fill="url(#cat-teen-ear)" opacity="0.92"/>
                            <path d="M 66.8 28 L 75.2 2 L 58 23 Z" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.35"/>
                            <path d="M 66 27 L 71.8 8 L 62 24.5 Z" fill="url(#cat-teen-ear)" opacity="0.92"/>

                            <!-- Muzzle -->
                            <ellipse cx="50" cy="38" rx="8.5" ry="5.2" fill="url(#cat-teen-belly)"/>
                            <path d="M 50 36.8 L 47.6 39.6 L 52.4 39.6 Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
                            <ellipse cx="50" cy="38.2" rx="0.7" ry="0.45" fill="#fff" opacity="0.45"/>
                            <circle cx="33" cy="35" r="4" fill="url(#cat-teen-cheek)"/>
                            <circle cx="67" cy="35" r="4" fill="url(#cat-teen-cheek)"/>
                            <!-- Whiskers -->
                            <path d="M 41 35 L 28 33 M 41 37 L 29 37 M 41 39 L 29 41" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 59 35 L 72 33 M 59 37 L 71 37 M 59 39 L 71 41" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="27" cy="60" rx="6.2" ry="9.2" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.2" transform="rotate(-24 27 60)"/>
                            <ellipse cx="23" cy="70" rx="5.4" ry="4.4" fill="url(#cat-teen-belly)" stroke="#311b92" stroke-width="0.9"/>
                            <ellipse cx="23" cy="71.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="21.005" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="23" cy="70" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="24.995" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="73" cy="60" rx="6.2" ry="9.2" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.2" transform="rotate(24 73 60)"/>
                            <ellipse cx="77" cy="70" rx="5.4" ry="4.4" fill="url(#cat-teen-belly)" stroke="#311b92" stroke-width="0.9"/>
                            <ellipse cx="77" cy="71.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="75.005" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="77" cy="70" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="78.995" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="39" cy="86" rx="7.2" ry="5.4" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.2"/>
                            <ellipse cx="39" cy="88" rx="5.2" ry="2.8" fill="url(#cat-teen-belly)"/>
                            <ellipse cx="39" cy="88.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="37.005" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="39" cy="87" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="40.995" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="61" cy="86" rx="7.2" ry="5.4" fill="url(#cat-teen-fur)" stroke="#311b92" stroke-width="1.2"/>
                            <ellipse cx="61" cy="88" rx="5.2" ry="2.8" fill="url(#cat-teen-belly)"/>
                            <ellipse cx="61" cy="88.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="59.005" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="61" cy="87" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="62.995" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="28" rx="6.4" ry="7.6" fill="#f8fbff" stroke="#311b92" stroke-width="1.45"/>
                            <ellipse cx="40.3" cy="28.4" rx="3.3" ry="5.5" fill="url(#cat-teen-iris)"/>
                            <ellipse cx="40.35" cy="28.5" rx="0.9" ry="4.7" fill="#0a0614"/>
                            <circle cx="41.4" cy="25.9" r="1.8" fill="#f3e5f5" opacity="0.95"/>
                            <circle cx="39.1" cy="30.3" r="0.8" fill="#f3e5f5" opacity="0.5"/>
                            <ellipse cx="60" cy="28" rx="6.4" ry="7.6" fill="#f8fbff" stroke="#311b92" stroke-width="1.45"/>
                            <ellipse cx="60.3" cy="28.4" rx="3.3" ry="5.5" fill="url(#cat-teen-iris)"/>
                            <ellipse cx="60.35" cy="28.5" rx="0.9" ry="4.7" fill="#0a0614"/>
                            <circle cx="61.4" cy="25.9" r="1.8" fill="#f3e5f5" opacity="0.95"/>
                            <circle cx="59.1" cy="30.3" r="0.8" fill="#f3e5f5" opacity="0.5"/>

                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.6 28 Q 40 24.8 46.4 28" stroke="#311b92" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                            <path d="M 53.6 28 Q 60 24.8 66.4 28" stroke="#311b92" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43.8 42 Q 46.9 46.5 50 43.5 Q 53.1 46.5 56.2 42" stroke="#311b92" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43.8 45 Q 50 39.5 56.2 45" stroke="#311b92" stroke-width="1.9" fill="none" stroke-linecap="round"/>
                </g>

                <!-- CAT ADULT — Moonfang Oracle -->
                <g id="tm-mascot-evo3-cat" style="display: none;">
                    <defs>
                        <radialGradient id="cat-adult-fur" cx="38%" cy="28%" r="75%">
                            <stop offset="0%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#5e35b1;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#311b92;stop-opacity:1" />
                            <stop offset="85%" style="stop-color:#1a0a2e;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0d0221;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-adult-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-adult-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f57f17;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="cat-adult-ear" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ad1457;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="cat-adult-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f48fb1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-adult-aura" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.38" />
                            <stop offset="45%" style="stop-color:#7e57c2;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-adult-mane" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-adult-tail-tip" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#f48fb1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#0a0614" opacity="0.28"/>
                        <ellipse cx="50" cy="48" rx="44" ry="42" fill="url(#cat-adult-aura)"/>
                        <circle cx="22" cy="30" r="1.6" fill="#fff" opacity="0.4"/>
                        <circle cx="78" cy="26" r="1.3" fill="#fff" opacity="0.35"/>
                        <circle cx="18" cy="52" r="1.1" fill="#f48fb1" opacity="0.35"/>
                        <circle cx="82" cy="54" r="1.2" fill="#ffd54f" opacity="0.3"/>
                        <g class="tm-animate-tail">
                            <path d="M 70 64 Q 94 46 100 24 Q 104 10 92 12 Q 80 28 72 62 Z" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.45"/>
                            <path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
                            <!-- Fluffy boss tail tip -->
                            <ellipse cx="96" cy="18" rx="7" ry="9" fill="url(#cat-adult-tail-tip)" opacity="0.95"/>
                            <path d="M 90 28 Q 98 22 100 30" stroke="#fff" stroke-width="1" fill="none" opacity="0.45"/>
                            <circle cx="98" cy="14" r="1.5" fill="#fff" opacity="0.65"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <!-- Left ear tuft -->
                            <path d="M 24 12 Q 14 2 16 16" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 22 10 L 12 0" stroke="#12002b" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="13" cy="2" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <!-- Right ear tuft -->
                            <path d="M 76 12 Q 86 2 84 16" stroke="#f48fb1" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 78 10 L 88 0" stroke="#12002b" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="87" cy="2" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Boss lunar mane -->
                            <ellipse cx="50" cy="48" rx="26" ry="14" fill="url(#cat-adult-mane)" opacity="0.55"/>
                            <path d="M 28 44 Q 22 52 28 60" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="0.9" opacity="0.85"/>
                            <path d="M 72 44 Q 78 52 72 60" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="0.9" opacity="0.85"/>
                            <ellipse cx="50" cy="62" rx="21" ry="18" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="2"/>
                            <ellipse cx="50" cy="65" rx="14.0" ry="12.0" fill="url(#cat-adult-belly)"/>
                            <!-- Crescent collar amulet -->
                            <path d="M 34 50 Q 50 58 66 50" fill="none" stroke="#ffd54f" stroke-width="2" opacity="0.9"/>
                            <path d="M 50 54 A 5 5 0 1 1 50 62 A 3.8 3.8 0 1 0 50 54" fill="#fffde7" stroke="#f9a825" stroke-width="0.8"/>
                            <circle cx="50" cy="58" r="1.4" fill="#f48fb1" opacity="0.8"/>
                            <!-- Constellation chest marks -->
                            <circle cx="42" cy="58" r="1.1" fill="#fff" opacity="0.55"/>
                            <circle cx="50" cy="64" r="1.3" fill="#fff" opacity="0.5"/>
                            <circle cx="58" cy="58" r="1.1" fill="#fff" opacity="0.55"/>
                            <path d="M 42 58 L 50 64 L 58 58" stroke="#e1bee7" stroke-width="0.7" fill="none" opacity="0.45"/>
                            <!-- Round cat head -->
                            <ellipse cx="50" cy="26" rx="18" ry="16" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="2"/>
                            <ellipse cx="39.0" cy="21" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
                            <!-- Cat ears -->
                            <path d="M 33 24 L 24.5 0 L 42 19 Z" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.35"/>
                            <path d="M 34 23 L 28 6 L 38 20.5 Z" fill="url(#cat-adult-ear)" opacity="0.92"/>
                            <path d="M 67 24 L 75.5 0 L 58 19 Z" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.35"/>
                            <path d="M 66 23 L 72 6 L 62 20.5 Z" fill="url(#cat-adult-ear)" opacity="0.92"/>
                            <!-- Boss moon crown -->
                            <path d="M 36 14 Q 50 6 64 14" fill="none" stroke="#f48fb1" stroke-width="1.6" opacity="0.85"/>
                            <path d="M 50 7 A 5.5 5.5 0 1 1 50 17 A 4.2 4.2 0 1 0 50 7" fill="#fffde7" opacity="0.9"/>
                            <circle cx="38" cy="13" r="1.6" fill="#fff" opacity="0.7"/>
                            <circle cx="62" cy="13" r="1.6" fill="#fff" opacity="0.7"/>
                            <circle cx="50" cy="4" r="1.3" fill="#f48fb1" opacity="0.75"/>
                            <!-- Muzzle -->
                            <ellipse cx="50" cy="34" rx="8.5" ry="5.2" fill="url(#cat-adult-belly)"/>
                            <path d="M 50 34.8 L 47.6 37.6 L 52.4 37.6 Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
                            <ellipse cx="50" cy="36.2" rx="0.7" ry="0.45" fill="#fff" opacity="0.45"/>
                            <circle cx="33" cy="31" r="4" fill="url(#cat-adult-cheek)"/>
                            <circle cx="67" cy="31" r="4" fill="url(#cat-adult-cheek)"/>
                            <!-- Whiskers -->
                            <path d="M 41 31 L 24 29 M 41 33 L 26 33 M 41 35 L 25 37" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 59 31 L 76 29 M 59 33 L 74 33 M 59 35 L 75 37" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="27" cy="60" rx="6.2" ry="9.2" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.2" transform="rotate(-24 27 60)"/>
                            <ellipse cx="23" cy="70" rx="5.4" ry="4.4" fill="url(#cat-adult-belly)" stroke="#12002b" stroke-width="0.9"/>
                            <ellipse cx="23" cy="71.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="20.9" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="23" cy="70" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="25.1" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="73" cy="60" rx="6.2" ry="9.2" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.2" transform="rotate(24 73 60)"/>
                            <ellipse cx="77" cy="70" rx="5.4" ry="4.4" fill="url(#cat-adult-belly)" stroke="#12002b" stroke-width="0.9"/>
                            <ellipse cx="77" cy="71.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="74.9" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="77" cy="70" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="79.1" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="39" cy="84" rx="7.2" ry="5.4" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.2"/>
                            <ellipse cx="39" cy="86" rx="5.2" ry="2.8" fill="url(#cat-adult-belly)"/>
                            <ellipse cx="39" cy="86.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="36.9" cy="85.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="39" cy="85" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="41.1" cy="85.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="61" cy="84" rx="7.2" ry="5.4" fill="url(#cat-adult-fur)" stroke="#12002b" stroke-width="1.2"/>
                            <ellipse cx="61" cy="86" rx="5.2" ry="2.8" fill="url(#cat-adult-belly)"/>
                            <ellipse cx="61" cy="86.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="58.9" cy="85.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="61" cy="85" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="63.1" cy="85.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="24" rx="7" ry="8.4" fill="#f8fbff" stroke="#12002b" stroke-width="1.45"/>
                            <ellipse cx="40.3" cy="24.4" rx="3.6" ry="6.0" fill="url(#cat-adult-iris)"/>
                            <ellipse cx="40.35" cy="24.5" rx="1.0" ry="5.2" fill="#0a0614"/>
                            <circle cx="41.4" cy="21.6" r="2.0" fill="#fffde7" opacity="0.95"/>
                            <circle cx="39.1" cy="26.5" r="0.8" fill="#fffde7" opacity="0.5"/>
                            <ellipse cx="60" cy="24" rx="7" ry="8.4" fill="#f8fbff" stroke="#12002b" stroke-width="1.45"/>
                            <ellipse cx="60.3" cy="24.4" rx="3.6" ry="6.0" fill="url(#cat-adult-iris)"/>
                            <ellipse cx="60.35" cy="24.5" rx="1.0" ry="5.2" fill="#0a0614"/>
                            <circle cx="61.4" cy="21.6" r="2.0" fill="#fffde7" opacity="0.95"/>
                            <circle cx="59.1" cy="26.5" r="0.8" fill="#fffde7" opacity="0.5"/>

                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33 24 Q 40 20.8 47 24" stroke="#12002b" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                            <path d="M 53 24 Q 60 20.8 67 24" stroke="#12002b" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43.8 40 Q 46.9 44.5 50 41.5 Q 53.1 44.5 56.2 40" stroke="#12002b" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43.8 43 Q 50 37.5 56.2 43" stroke="#12002b" stroke-width="1.9" fill="none" stroke-linecap="round"/>
                </g>

                <!-- CAT MIDDLE AGE — scarred omen lord -->
                <g id="tm-mascot-evo4-cat" style="display: none;">
                    <defs>
                        <radialGradient id="cat-mid-fur" cx="38%" cy="28%" r="75%">
                            <stop offset="0%" style="stop-color:#5c6bc0;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#3949ab;stop-opacity:1" />
                            <stop offset="65%" style="stop-color:#283593;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a237e;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-mid-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-mid-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f57f17;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="cat-mid-ear" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ad1457;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="cat-mid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f48fb1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-mid-aura" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.38" />
                            <stop offset="45%" style="stop-color:#7e57c2;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-mid-mane" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-mid-tail-tip" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffd54f;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="27" ry="4.5" fill="#0a0614" opacity="0.28"/>
                        <ellipse cx="50" cy="50" rx="40" ry="38" fill="url(#cat-mid-aura)" opacity="0.7"/>
                        <g class="tm-animate-tail">
                            <path d="M 68 68 Q 88 54 94 36 Q 98 24 88 26 Q 76 42 70 66 Z" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.45"/>
                            <path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
                            <ellipse cx="92" cy="30" rx="5.5" ry="7" fill="url(#cat-mid-tail-tip)" opacity="0.85"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <!-- Left ear tuft -->
                            <path d="M 24 14 Q 14 4 16 18" stroke="#ffd54f" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 22 12 L 12 2" stroke="#1a237e" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="13" cy="4" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <!-- Right ear tuft -->
                            <path d="M 76 14 Q 86 4 84 18" stroke="#ffd54f" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 78 12 L 88 2" stroke="#1a237e" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="87" cy="4" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">

                            <ellipse cx="50" cy="64" rx="20" ry="17.5" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="2"/>
                            <ellipse cx="50" cy="67" rx="13.0" ry="11.5" fill="url(#cat-mid-belly)"/>
                            <!-- Battle scars + lucky bell -->
                            <path d="M 54 34 L 58 38 L 56 42" stroke="#90a4ae" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.75"/>
                            <path d="M 36 56 Q 50 62 64 56" fill="none" stroke="#ffd54f" stroke-width="1.5" opacity="0.8"/>
                            <path d="M 46 54 L 48 58 L 52 58 L 54 54 Q 50 52 46 54 Z" fill="#ffd54f" stroke="#f9a825" stroke-width="0.8"/>
                            <circle cx="50" cy="59" r="1.3" fill="#f57f17"/>
                            <!-- Round cat head -->
                            <ellipse cx="50" cy="30" rx="17" ry="15" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="2"/>
                            <ellipse cx="40.0" cy="25" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
                            <!-- Cat ears -->
                            <path d="M 33.2 28 L 24.8 4 L 42 23 Z" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.35"/>
                            <path d="M 34 27 L 28.2 10 L 38 24.5 Z" fill="url(#cat-mid-ear)" opacity="0.92"/>
                            <path d="M 66.8 28 L 75.2 4 L 58 23 Z" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.35"/>
                            <path d="M 66 27 L 71.8 10 L 62 24.5 Z" fill="url(#cat-mid-ear)" opacity="0.92"/>
                            <!-- Worn crescent -->
                            <path d="M 50 10 A 4.5 4.5 0 1 1 50 18 A 3.4 3.4 0 1 0 50 10" fill="#ffd54f" opacity="0.75"/>
                            <!-- Muzzle -->
                            <ellipse cx="50" cy="38" rx="8.5" ry="5.2" fill="url(#cat-mid-belly)"/>
                            <path d="M 50 36.8 L 47.6 39.6 L 52.4 39.6 Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
                            <ellipse cx="50" cy="38.2" rx="0.7" ry="0.45" fill="#fff" opacity="0.45"/>
                            <circle cx="33" cy="35" r="4" fill="url(#cat-mid-cheek)"/>
                            <circle cx="67" cy="35" r="4" fill="url(#cat-mid-cheek)"/>
                            <!-- Whiskers -->
                            <path d="M 41 35 L 28 33 M 41 37 L 29 37 M 41 39 L 29 41" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 59 35 L 72 33 M 59 37 L 71 37 M 59 39 L 71 41" stroke="#e8eaf6" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="27" cy="60" rx="6.2" ry="9.2" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.2" transform="rotate(-24 27 60)"/>
                            <ellipse cx="23" cy="70" rx="5.4" ry="4.4" fill="url(#cat-mid-belly)" stroke="#1a237e" stroke-width="0.9"/>
                            <ellipse cx="23" cy="71.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="20.9" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="23" cy="70" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="25.1" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="73" cy="60" rx="6.2" ry="9.2" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.2" transform="rotate(24 73 60)"/>
                            <ellipse cx="77" cy="70" rx="5.4" ry="4.4" fill="url(#cat-mid-belly)" stroke="#1a237e" stroke-width="0.9"/>
                            <ellipse cx="77" cy="71.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="74.9" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="77" cy="70" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="79.1" cy="70.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="39" cy="86" rx="7.2" ry="5.4" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.2"/>
                            <ellipse cx="39" cy="88" rx="5.2" ry="2.8" fill="url(#cat-mid-belly)"/>
                            <ellipse cx="39" cy="88.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="36.9" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="39" cy="87" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="41.1" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="61" cy="86" rx="7.2" ry="5.4" fill="url(#cat-mid-fur)" stroke="#1a237e" stroke-width="1.2"/>
                            <ellipse cx="61" cy="88" rx="5.2" ry="2.8" fill="url(#cat-mid-belly)"/>
                            <ellipse cx="61" cy="88.1" rx="4.2" ry="2.6" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="58.9" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="61" cy="87" r="0.95" fill="#ff6090" opacity="0.8"/>
                            <circle cx="63.1" cy="87.3" r="0.95" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="28" rx="6.6" ry="7.8" fill="#f8fbff" stroke="#1a237e" stroke-width="1.45"/>
                            <ellipse cx="40.3" cy="28.4" rx="3.4" ry="5.6" fill="url(#cat-mid-iris)"/>
                            <ellipse cx="40.35" cy="28.5" rx="0.9" ry="4.8" fill="#0a0614"/>
                            <circle cx="41.4" cy="25.8" r="1.8" fill="#fffde7" opacity="0.95"/>
                            <circle cx="39.1" cy="30.3" r="0.8" fill="#fffde7" opacity="0.5"/>
                            <ellipse cx="60" cy="28" rx="6.6" ry="7.8" fill="#f8fbff" stroke="#1a237e" stroke-width="1.45"/>
                            <ellipse cx="60.3" cy="28.4" rx="3.4" ry="5.6" fill="url(#cat-mid-iris)"/>
                            <ellipse cx="60.35" cy="28.5" rx="0.9" ry="4.8" fill="#0a0614"/>
                            <circle cx="61.4" cy="25.8" r="1.8" fill="#fffde7" opacity="0.95"/>
                            <circle cx="59.1" cy="30.3" r="0.8" fill="#fffde7" opacity="0.5"/>

                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.4 28 Q 40 24.8 46.6 28" stroke="#1a237e" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                            <path d="M 53.4 28 Q 60 24.8 66.6 28" stroke="#1a237e" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43.8 42 Q 46.9 46.5 50 43.5 Q 53.1 46.5 56.2 42" stroke="#1a237e" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43.8 45 Q 50 39.5 56.2 45" stroke="#1a237e" stroke-width="1.9" fill="none" stroke-linecap="round"/>
                </g>

                <!-- CAT OLD — silver moon sage -->
                <g id="tm-mascot-evo5-cat" style="display: none;">
                    <defs>
                        <radialGradient id="cat-old-fur" cx="38%" cy="28%" r="75%">
                            <stop offset="0%" style="stop-color:#eceff1;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#b0bec5;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#78909c;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-old-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="cat-old-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#4dd0e1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="cat-old-ear" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ad1457;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="cat-old-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#f48fb1;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#f48fb1;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-old-aura" cx="50%" cy="45%" r="55%">
                            <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:0.38" />
                            <stop offset="45%" style="stop-color:#7e57c2;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-old-mane" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:0.7" />
                            <stop offset="50%" style="stop-color:#7e57c2;stop-opacity:0.35" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="cat-old-tail-tip" cx="50%" cy="40%" r="55%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#b3e5fc;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b3e5fc;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="26" ry="4.5" fill="#0a0614" opacity="0.28"/>
                        <ellipse cx="50" cy="48" rx="40" ry="38" fill="url(#cat-old-aura)" opacity="0.5"/>
                        <g class="tm-animate-tail">
                            <path d="M 64 72 Q 80 80 88 68 Q 94 56 84 58 Q 72 66 66 72 Z" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.45"/>
                            <path d="M 72 56 Q 84 44 90 34" stroke="#e1bee7" stroke-width="0.9" fill="none" opacity="0.4"/>
                            <ellipse cx="84" cy="62" rx="5" ry="6" fill="#eceff1" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-wing-left">
                            <!-- Left ear tuft -->
                            <path d="M 24 12 Q 14 2 16 16" stroke="#b3e5fc" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 22 10 L 12 0" stroke="#546e7a" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="13" cy="2" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <!-- Right ear tuft -->
                            <path d="M 76 12 Q 86 2 84 16" stroke="#b3e5fc" stroke-width="1.5" fill="none" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 78 10 L 88 0" stroke="#546e7a" stroke-width="1.15" fill="none" opacity="0.5" stroke-linecap="round"/>
                            <circle cx="87" cy="2" r="1.35" fill="#fff" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">

                            <ellipse cx="50" cy="66" rx="19.5" ry="17" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="2"/>
                            <ellipse cx="50" cy="69" rx="12.5" ry="11.0" fill="url(#cat-old-belly)"/>
                            <!-- Silver collar -->
                            <path d="M 36 50 Q 50 56 64 50" fill="none" stroke="#cfd8dc" stroke-width="1.8" opacity="0.85"/>
                            <circle cx="50" cy="54" r="2.4" fill="#eceff1" stroke="#90a4ae" stroke-width="0.7"/>
                            <!-- Round cat head -->
                            <ellipse cx="50" cy="28" rx="17" ry="15.5" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="2"/>
                            <ellipse cx="40.0" cy="23" rx="6.5" ry="3.8" fill="#fff" opacity="0.16"/>
                            <!-- Cat ears -->
                            <path d="M 33.2 26 L 24.8 2 L 42 21 Z" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.35"/>
                            <path d="M 34 25 L 28.2 8 L 38 22.5 Z" fill="url(#cat-old-ear)" opacity="0.92"/>
                            <path d="M 66.8 26 L 75.2 2 L 58 21 Z" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.35"/>
                            <path d="M 66 25 L 71.8 8 L 62 22.5 Z" fill="url(#cat-old-ear)" opacity="0.92"/>
                            <!-- Silver moon halo -->
                            <ellipse cx="50" cy="12" rx="18" ry="3.8" fill="none" stroke="#eceff1" stroke-width="1.5" opacity="0.7"/>
                            <path d="M 50 6 A 5 5 0 1 1 50 15 A 3.8 3.8 0 1 0 50 6" fill="#fff" opacity="0.85"/>
                            <!-- Sage cheek ruff -->
                            <path d="M 32 36 Q 26 44 32 52 Q 36 46 34 40 Z" fill="#eceff1" stroke="#90a4ae" stroke-width="0.7" opacity="0.8"/>
                            <path d="M 68 36 Q 74 44 68 52 Q 64 46 66 40 Z" fill="#eceff1" stroke="#90a4ae" stroke-width="0.7" opacity="0.8"/>
                            <!-- Muzzle -->
                            <ellipse cx="50" cy="36" rx="8.5" ry="5.2" fill="url(#cat-old-belly)"/>
                            <path d="M 50 34.8 L 47.6 37.6 L 52.4 37.6 Z" fill="#ff8fab" stroke="#e91e63" stroke-width="0.7"/>
                            <ellipse cx="50" cy="36.2" rx="0.7" ry="0.45" fill="#fff" opacity="0.45"/>
                            <circle cx="33" cy="33" r="4" fill="url(#cat-old-cheek)"/>
                            <circle cx="67" cy="33" r="4" fill="url(#cat-old-cheek)"/>
                            <!-- Whiskers -->
                            <path d="M 41 33 L 24 31 M 41 35 L 26 35 M 41 37 L 25 39" stroke="#eceff1" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                            <path d="M 59 33 L 76 31 M 59 35 L 74 35 M 59 37 L 75 39" stroke="#eceff1" stroke-width="0.85" opacity="0.75" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="27" cy="60" rx="6.2" ry="9.2" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.2" transform="rotate(-24 27 60)"/>
                            <ellipse cx="23" cy="70" rx="5.4" ry="4.4" fill="url(#cat-old-belly)" stroke="#546e7a" stroke-width="0.9"/>
                            <ellipse cx="23" cy="71.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="21.005" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="23" cy="70" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="24.995" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="73" cy="60" rx="6.2" ry="9.2" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.2" transform="rotate(24 73 60)"/>
                            <ellipse cx="77" cy="70" rx="5.4" ry="4.4" fill="url(#cat-old-belly)" stroke="#546e7a" stroke-width="0.9"/>
                            <ellipse cx="77" cy="71.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="75.005" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="77" cy="70" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="78.995" cy="70.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="39" cy="86" rx="7.2" ry="5.4" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.2"/>
                            <ellipse cx="39" cy="88" rx="5.2" ry="2.8" fill="url(#cat-old-belly)"/>
                            <ellipse cx="39" cy="88.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="37.005" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="39" cy="87" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="40.995" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="61" cy="86" rx="7.2" ry="5.4" fill="url(#cat-old-fur)" stroke="#546e7a" stroke-width="1.2"/>
                            <ellipse cx="61" cy="88" rx="5.2" ry="2.8" fill="url(#cat-old-belly)"/>
                            <ellipse cx="61" cy="88.045" rx="3.9899999999999998" ry="2.4699999999999998" fill="#f8bbd0" opacity="0.9"/>
                            <circle cx="59.005" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="61" cy="87" r="0.9025" fill="#ff6090" opacity="0.8"/>
                            <circle cx="62.995" cy="87.285" r="0.9025" fill="#ff6090" opacity="0.8"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="40" cy="26" rx="7" ry="8.2" fill="#f8fbff" stroke="#546e7a" stroke-width="1.45"/>
                            <ellipse cx="40.3" cy="26.4" rx="3.6" ry="5.9" fill="url(#cat-old-iris)"/>
                            <ellipse cx="40.35" cy="26.5" rx="1.0" ry="5.1" fill="#0a0614"/>
                            <circle cx="41.4" cy="23.7" r="2.0" fill="#e0f7fa" opacity="0.95"/>
                            <circle cx="39.1" cy="28.5" r="0.8" fill="#e0f7fa" opacity="0.5"/>
                            <ellipse cx="60" cy="26" rx="7" ry="8.2" fill="#f8fbff" stroke="#546e7a" stroke-width="1.45"/>
                            <ellipse cx="60.3" cy="26.4" rx="3.6" ry="5.9" fill="url(#cat-old-iris)"/>
                            <ellipse cx="60.35" cy="26.5" rx="1.0" ry="5.1" fill="#0a0614"/>
                            <circle cx="61.4" cy="23.7" r="2.0" fill="#e0f7fa" opacity="0.95"/>
                            <circle cx="59.1" cy="28.5" r="0.8" fill="#e0f7fa" opacity="0.5"/>
                            <path d="M 32.6 25.5 Q 40 20.26 47.4 25.5" fill="#546e7a" opacity="0.78"/>
                            <path d="M 52.6 25.5 Q 60 20.26 67.4 25.5" fill="#546e7a" opacity="0.78"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33 26 Q 40 22.8 47 26" stroke="#546e7a" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                            <path d="M 53 26 Q 60 22.8 67 26" stroke="#546e7a" stroke-width="2.3" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 43.8 40 Q 46.9 44.5 50 41.5 Q 53.1 44.5 56.2 40" stroke="#546e7a" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43.8 43 Q 50 37.5 56.2 43" stroke="#546e7a" stroke-width="1.9" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PHOENIX CHARACTER - All Life Stages (dense cute epic v4 · BOSS MYTHICAL) -->
                <!-- Solar Flame • Legendary Rarity • Ashborn Phoenix -->
                <!-- ═══════════════════════════════════════ -->

                <!-- PHOENIX BABY — ember hatchling -->
                <g id="tm-mascot-baby-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-baby-body" cx="36%" cy="26%" r="80%">
                            <stop offset="0%" style="stop-color:#fff9c4;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffb74d;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff7043;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-baby-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="phoenix-baby-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.98" />
                            <stop offset="25%" style="stop-color:#ffea00;stop-opacity:0.95" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:0.92" />
                            <stop offset="85%" style="stop-color:#ff3d00;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0.8" />
                        </linearGradient>
                        <linearGradient id="phoenix-baby-wing2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffea00;stop-opacity:0.9" />
                            <stop offset="50%" style="stop-color:#ff3d00;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="phoenix-baby-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-baby-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ff9100;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#dd2c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a0000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-baby-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-baby-aura" cx="50%" cy="48%" r="55%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.35" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-baby-corona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.5" />
                            <stop offset="35%" style="stop-color:#ffea00;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="phoenix-baby-tail" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffea00;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="26" ry="5.5" fill="#1a0500" opacity="0.24"/>
                        <ellipse cx="50" cy="48" rx="38" ry="36" fill="url(#phoenix-baby-aura)"/>

                        <circle cx="18" cy="28" r="1.8" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="82" cy="24" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="12" cy="48" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="88" cy="50" r="1.8" fill="#fff59d" opacity="0.65"/>
                        <circle cx="22" cy="70" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <g class="tm-animate-wing-left">
                            <ellipse cx="24" cy="58" rx="8" ry="12" fill="url(#phoenix-baby-wing)" stroke="#bf360c" stroke-width="1.2" transform="rotate(-28 24 58)"/>
                            <path d="M 20 50 Q 14 54 18 62" stroke="#ffea00" stroke-width="0.8" fill="none" opacity="0.55"/>
                            <circle cx="18" cy="52" r="1.3" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <ellipse cx="76" cy="58" rx="8" ry="12" fill="url(#phoenix-baby-wing)" stroke="#bf360c" stroke-width="1.2" transform="rotate(28 76 58)"/>
                            <path d="M 80 50 Q 86 54 82 62" stroke="#ffea00" stroke-width="0.8" fill="none" opacity="0.55"/>
                            <circle cx="82" cy="52" r="1.3" fill="#fff" opacity="0.45"/>
                        </g>
                        <g class="tm-animate-tail">
                            <ellipse cx="68" cy="72" rx="9" ry="7" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.3"/>
                            <ellipse cx="76" cy="66" rx="6" ry="5" fill="url(#phoenix-baby-wing)" stroke="#bf360c" stroke-width="0.9"/>
                            <circle cx="80" cy="62" r="2.6" fill="#ffea00" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="66" rx="23" ry="19" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.8"/>
                            <ellipse cx="35.0" cy="58" rx="9" ry="5" fill="#fff" opacity="0.16"/>
                            <ellipse cx="50" cy="68" rx="15.0" ry="13.0" fill="url(#phoenix-baby-belly)"/>

                            <circle cx="50" cy="66" r="7.5" fill="url(#phoenix-baby-core)"/>
                            <circle cx="50" cy="66" r="3.2" fill="#fffde7" opacity="0.7"/>
                            <!-- Head -->
                            <ellipse cx="50" cy="36" rx="18" ry="16" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.7"/>
                            <ellipse cx="39.0" cy="31" rx="7" ry="4" fill="#fff" opacity="0.15"/>
                            <ellipse cx="36" cy="32" rx="4" ry="6" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="0.85" transform="rotate(-16 36 32)"/>
                            <ellipse cx="64" cy="32" rx="4" ry="6" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="0.85" transform="rotate(16 64 32)"/>
                            <ellipse cx="50" cy="26" rx="3.2" ry="5" fill="url(#phoenix-baby-wing)" stroke="#bf360c" stroke-width="0.7"/>
                            <circle cx="34" cy="42" r="3.8" fill="url(#phoenix-baby-cheek)"/>
                            <circle cx="66" cy="42" r="3.8" fill="url(#phoenix-baby-cheek)"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="64" rx="6" ry="9" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.4" transform="rotate(-20 26 64)"/>
                            <path d="M 22 74 L 16 82 M 24 76 L 22 84 M 26 74 L 30 82" stroke="#ff3d00" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="64" rx="6" ry="9" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.4" transform="rotate(20 74 64)"/>
                            <path d="M 74 74 L 70 82 M 76 76 L 78 84 M 78 74 L 84 82" stroke="#ff3d00" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="86" rx="6.5" ry="5" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 32 88 L 26 94 M 37 89 L 37 96 M 42 89 L 42 96 M 46 88 L 52 94" stroke="#bf360c" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="86" rx="6.5" ry="5" fill="url(#phoenix-baby-body)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 54 88 L 48 94 M 59 89 L 59 96 M 64 89 L 64 96 M 68 88 L 74 94" stroke="#bf360c" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-mascot-eye-open">

                            <ellipse cx="40" cy="34" rx="7" ry="8.5" fill="#fff8e1" stroke="#bf360c" stroke-width="1.6"/>
                            <ellipse cx="60" cy="34" rx="7" ry="8.5" fill="#fff8e1" stroke="#bf360c" stroke-width="1.6"/>
                            <ellipse cx="40.4" cy="34.3" rx="4.1" ry="5.3" fill="url(#phoenix-baby-iris)"/>
                            <ellipse cx="60.4" cy="34.3" rx="4.1" ry="5.3" fill="url(#phoenix-baby-iris)"/>
                            <ellipse cx="40.5" cy="34.6" rx="1.8" ry="3.4" fill="#1a0500"/>
                            <ellipse cx="60.5" cy="34.6" rx="1.8" ry="3.4" fill="#1a0500"/>
                            <circle cx="41.5" cy="31.3" r="2.1" fill="#fffde7" opacity="0.95"/>
                            <circle cx="61.5" cy="31.3" r="2.1" fill="#fffde7" opacity="0.95"/>
                            <circle cx="37.9" cy="36.4" r="1.0" fill="#ffab40" opacity="0.7"/>
                            <circle cx="57.9" cy="36.4" r="1.0" fill="#ffab40" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33 34 Q 40 30.8 47 34" stroke="#bf360c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53 34 Q 60 30.8 67 34" stroke="#bf360c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 46.9 47 L 50 51.1 L 53.1 47 Q 50 48.5 46.9 47" fill="#ff6d00" stroke="#bf360c" stroke-width="1.4" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 46.1 48 L 50 52.3 L 53.9 48 Q 50 46.2 46.1 48" fill="#ff6d00" stroke="#bf360c" stroke-width="1.4" stroke-linejoin="round"/>
                            <path d="M 50 47.8 L 50 50.3" stroke="#bf360c" stroke-width="0.6" opacity="0.4"/>
                </g>

                <!-- PHOENIX KID — wrath fledgling -->
                <g id="tm-mascot-evo1-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-kid-body" cx="36%" cy="26%" r="80%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ff9800;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ef6c00;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-kid-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="phoenix-kid-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.98" />
                            <stop offset="25%" style="stop-color:#ffea00;stop-opacity:0.95" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:0.92" />
                            <stop offset="85%" style="stop-color:#ff3d00;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0.8" />
                        </linearGradient>
                        <linearGradient id="phoenix-kid-wing2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffea00;stop-opacity:0.9" />
                            <stop offset="50%" style="stop-color:#ff3d00;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="phoenix-kid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-kid-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ff9100;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#dd2c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a0000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-kid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-kid-aura" cx="50%" cy="48%" r="55%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.35" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-kid-corona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.5" />
                            <stop offset="35%" style="stop-color:#ffea00;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="phoenix-kid-tail" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffea00;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="30" ry="5.5" fill="#1a0500" opacity="0.24"/>
                        <ellipse cx="50" cy="48" rx="42" ry="39" fill="url(#phoenix-kid-aura)"/>

                        <circle cx="18" cy="28" r="1.8" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="82" cy="24" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="12" cy="48" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="88" cy="50" r="1.8" fill="#fff59d" opacity="0.65"/>
                        <circle cx="22" cy="70" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="78" cy="72" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="8" cy="38" r="1.8" fill="#ff6d00" opacity="0.55"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 30 52 Q 10 36 8 52 Q 10 68 22 64 Q 28 58 32 54 Z" fill="url(#phoenix-kid-wing)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 18 44 Q 12 50 16 60" stroke="#ffea00" stroke-width="0.9" fill="none" opacity="0.55"/>
                            <path d="M 12 32 L 6 24" stroke="#bf360c" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 70 52 Q 90 36 92 52 Q 90 68 78 64 Q 72 58 68 54 Z" fill="url(#phoenix-kid-wing)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 82 44 Q 88 50 84 60" stroke="#ffea00" stroke-width="0.9" fill="none" opacity="0.55"/>
                            <path d="M 88 32 L 94 24" stroke="#bf360c" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 64 70 Q 80 88 90 60 Q 94 46 84 44 Q 72 52 64 70 Z" fill="url(#phoenix-kid-wing)" stroke="#bf360c" stroke-width="1.35"/>
                            <path d="M 70 72 Q 82 92 92 64" fill="none" stroke="#ffea00" stroke-width="1" opacity="0.55"/>
                            <circle cx="88" cy="54" r="2.4" fill="#ffea00" opacity="0.75"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="64" rx="22" ry="18" fill="url(#phoenix-kid-body)" stroke="#bf360c" stroke-width="1.8"/>
                            <ellipse cx="36.0" cy="56" rx="9" ry="5" fill="#fff" opacity="0.16"/>
                            <ellipse cx="50" cy="66" rx="14.0" ry="12.0" fill="url(#phoenix-kid-belly)"/>

                            <circle cx="50" cy="64" r="7.5" fill="url(#phoenix-kid-core)"/>
                            <circle cx="50" cy="64" r="3.2" fill="#fffde7" opacity="0.7"/>
                            <!-- Head -->
                            <ellipse cx="50" cy="34" rx="16.5" ry="14.5" fill="url(#phoenix-kid-body)" stroke="#bf360c" stroke-width="1.7"/>
                            <ellipse cx="40.5" cy="29" rx="7" ry="4" fill="#fff" opacity="0.15"/>
                            <path d="M 40 22 L 36 8 L 44 20 Z" fill="url(#phoenix-kid-wing)" stroke="#bf360c" stroke-width="0.85"/>
                            <path d="M 50 18 L 50 4 L 54 16 Z" fill="#ffea00" stroke="#bf360c" stroke-width="0.85"/>
                            <path d="M 60 22 L 64 8 L 56 20 Z" fill="url(#phoenix-kid-wing)" stroke="#bf360c" stroke-width="0.85"/>
                            <circle cx="34" cy="40" r="3.8" fill="url(#phoenix-kid-cheek)"/>
                            <circle cx="66" cy="40" r="3.8" fill="url(#phoenix-kid-cheek)"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="58" rx="6" ry="9" fill="url(#phoenix-kid-body)" stroke="#bf360c" stroke-width="1.4" transform="rotate(-20 26 58)"/>
                            <path d="M 22 68 L 16 76 M 24 70 L 22 78 M 26 68 L 30 76" stroke="#ff3d00" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="58" rx="6" ry="9" fill="url(#phoenix-kid-body)" stroke="#bf360c" stroke-width="1.4" transform="rotate(20 74 58)"/>
                            <path d="M 74 68 L 70 76 M 76 70 L 78 78 M 78 68 L 84 76" stroke="#ff3d00" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="86" rx="6.5" ry="5" fill="url(#phoenix-kid-body)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 32 88 L 26 94 M 37 89 L 37 96 M 42 89 L 42 96 M 46 88 L 52 94" stroke="#bf360c" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="86" rx="6.5" ry="5" fill="url(#phoenix-kid-body)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 54 88 L 48 94 M 59 89 L 59 96 M 64 89 L 64 96 M 68 88 L 74 94" stroke="#bf360c" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <path d="M 32.5 22.7 Q 40 19.7 47 24.7" stroke="#bf360c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 67.5 22.7 Q 60 19.7 53 24.7" stroke="#bf360c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 33.5 24 Q 40 22 46.5 25.2" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <path d="M 66.5 24 Q 60 22 53.5 25.2" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <ellipse cx="40" cy="32" rx="6.5" ry="7.8" fill="#fff8e1" stroke="#bf360c" stroke-width="1.6"/>
                            <ellipse cx="60" cy="32" rx="6.5" ry="7.8" fill="#fff8e1" stroke="#bf360c" stroke-width="1.6"/>
                            <ellipse cx="40.4" cy="32.3" rx="3.8" ry="4.8" fill="url(#phoenix-kid-iris)"/>
                            <ellipse cx="60.4" cy="32.3" rx="3.8" ry="4.8" fill="url(#phoenix-kid-iris)"/>
                            <ellipse cx="40.5" cy="32.6" rx="1.7" ry="3.1" fill="#1a0500"/>
                            <ellipse cx="60.5" cy="32.6" rx="1.7" ry="3.1" fill="#1a0500"/>
                            <circle cx="41.5" cy="29.5" r="1.9" fill="#fffde7" opacity="0.95"/>
                            <circle cx="61.5" cy="29.5" r="1.9" fill="#fffde7" opacity="0.95"/>
                            <circle cx="38.0" cy="34.2" r="0.9" fill="#ffab40" opacity="0.7"/>
                            <circle cx="58.0" cy="34.2" r="0.9" fill="#ffab40" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.5 32 Q 40 28.8 46.5 32" stroke="#bf360c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53.5 32 Q 60 28.8 66.5 32" stroke="#bf360c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 46.8 45 L 50 49.3 L 53.2 45 Q 50 46.6 46.8 45" fill="#ff6d00" stroke="#bf360c" stroke-width="1.4" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 46.0 46 L 50 50.5 L 54.0 46 Q 50 44.2 46.0 46" fill="#ff6d00" stroke="#bf360c" stroke-width="1.4" stroke-linejoin="round"/>
                            <path d="M 50 45.8 L 50 48.5" stroke="#bf360c" stroke-width="0.6" opacity="0.4"/>
                </g>

                <!-- PHOENIX TEEN — solar ravager -->
                <g id="tm-mascot-evo2-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-teen-body" cx="36%" cy="26%" r="80%">
                            <stop offset="0%" style="stop-color:#fff176;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ff9100;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#e64a19;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-teen-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="phoenix-teen-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.98" />
                            <stop offset="25%" style="stop-color:#ffea00;stop-opacity:0.95" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:0.92" />
                            <stop offset="85%" style="stop-color:#ff3d00;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0.8" />
                        </linearGradient>
                        <linearGradient id="phoenix-teen-wing2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffea00;stop-opacity:0.9" />
                            <stop offset="50%" style="stop-color:#ff3d00;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="phoenix-teen-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-teen-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ff9100;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#dd2c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a0000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-teen-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-teen-aura" cx="50%" cy="48%" r="55%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.35" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-teen-corona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.5" />
                            <stop offset="35%" style="stop-color:#ffea00;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="phoenix-teen-tail" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffea00;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="34" ry="5.5" fill="#1a0500" opacity="0.24"/>
                        <ellipse cx="50" cy="48" rx="46" ry="43" fill="url(#phoenix-teen-aura)"/>

                        <circle cx="18" cy="28" r="1.8" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="82" cy="24" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="12" cy="48" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="88" cy="50" r="1.8" fill="#fff59d" opacity="0.65"/>
                        <circle cx="22" cy="70" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="78" cy="72" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="8" cy="38" r="1.8" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="92" cy="40" r="1.2" fill="#fff59d" opacity="0.65"/>
                        <circle cx="30" cy="18" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 50 Q 0 22 -2 46 Q 0 68 16 64 Q 24 56 30 52 Z" fill="url(#phoenix-teen-wing)" stroke="#bf360c" stroke-width="1.9"/>
                            <path d="M 12 36 Q 4 44 8 58" stroke="#ffea00" stroke-width="1.1" fill="none" opacity="0.6"/>
                            <path d="M 8 44 Q 2 50 6 62" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.5"/>
                            <path d="M 4 28 L -2 20" stroke="#bf360c" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M 10 24 L 6 16" stroke="#ff3d00" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 50 Q 100 22 102 46 Q 100 68 84 64 Q 76 56 70 52 Z" fill="url(#phoenix-teen-wing)" stroke="#bf360c" stroke-width="1.9"/>
                            <path d="M 88 36 Q 96 44 92 58" stroke="#ffea00" stroke-width="1.1" fill="none" opacity="0.6"/>
                            <path d="M 92 44 Q 98 50 94 62" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.5"/>
                            <path d="M 96 28 L 102 20" stroke="#bf360c" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M 90 24 L 94 16" stroke="#ff3d00" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 60 70 Q 78 96 92 58 Q 96 40 86 38 Q 72 48 60 70 Z" fill="url(#phoenix-teen-tail)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 66 72 Q 80 100 94 64" fill="url(#phoenix-teen-wing)" opacity="0.65" stroke="#ff3d00" stroke-width="0.95"/>
                            <circle cx="90" cy="50" r="3" fill="#ffea00" opacity="0.8"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="62" rx="23" ry="19" fill="url(#phoenix-teen-body)" stroke="#bf360c" stroke-width="1.8"/>
                            <ellipse cx="35.0" cy="54" rx="9" ry="5" fill="#fff" opacity="0.16"/>
                            <ellipse cx="50" cy="64" rx="15.0" ry="13.0" fill="url(#phoenix-teen-belly)"/>
                            <path d="M 38 56 Q 50 58 62 56" stroke="#ffe082" stroke-width="0.95" fill="none" opacity="0.55"/>
                            <path d="M 40 62 Q 50 64 60 62" stroke="#ffe082" stroke-width="0.85" fill="none" opacity="0.45"/>
                            <circle cx="50" cy="62" r="7.5" fill="url(#phoenix-teen-core)"/>
                            <circle cx="50" cy="62" r="3.2" fill="#fffde7" opacity="0.7"/>
                            <!-- Head -->
                            <ellipse cx="50" cy="30" rx="17" ry="15" fill="url(#phoenix-teen-body)" stroke="#bf360c" stroke-width="1.7"/>
                            <ellipse cx="40.0" cy="25" rx="7" ry="4" fill="#fff" opacity="0.15"/>
                            <path d="M 36 18 L 28 2 L 40 16 Z" fill="url(#phoenix-teen-wing)" stroke="#bf360c" stroke-width="0.95"/>
                            <path d="M 44 14 L 40 -2 L 50 12 Z" fill="#ffea00" stroke="#bf360c" stroke-width="0.95"/>
                            <path d="M 56 14 L 60 -2 L 50 12 Z" fill="#ffea00" stroke="#bf360c" stroke-width="0.95"/>
                            <path d="M 64 18 L 72 2 L 60 16 Z" fill="url(#phoenix-teen-wing)" stroke="#bf360c" stroke-width="0.95"/>
                            <path d="M 32 12 L 24 0 L 34 10 Z" fill="#ff8a65" opacity="0.8"/>
                            <path d="M 68 12 L 76 0 L 66 10 Z" fill="#ff8a65" opacity="0.8"/>
                            <circle cx="50" cy="0" r="2" fill="#fffde7" opacity="0.75"/>
                            <circle cx="34" cy="36" r="3.8" fill="url(#phoenix-teen-cheek)"/>
                            <circle cx="66" cy="36" r="3.8" fill="url(#phoenix-teen-cheek)"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="58" rx="6" ry="9" fill="url(#phoenix-teen-body)" stroke="#bf360c" stroke-width="1.4" transform="rotate(-20 26 58)"/>
                            <path d="M 22 68 L 16 76 M 24 70 L 22 78 M 26 68 L 30 76" stroke="#ff3d00" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="58" rx="6" ry="9" fill="url(#phoenix-teen-body)" stroke="#bf360c" stroke-width="1.4" transform="rotate(20 74 58)"/>
                            <path d="M 74 68 L 70 76 M 76 70 L 78 78 M 78 68 L 84 76" stroke="#ff3d00" stroke-width="1.3" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="86" rx="6.5" ry="5" fill="url(#phoenix-teen-body)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 32 88 L 26 94 M 37 89 L 37 96 M 42 89 L 42 96 M 46 88 L 52 94" stroke="#bf360c" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="86" rx="6.5" ry="5" fill="url(#phoenix-teen-body)" stroke="#bf360c" stroke-width="1.5"/>
                            <path d="M 54 88 L 48 94 M 59 89 L 59 96 M 64 89 L 64 96 M 68 88 L 74 94" stroke="#bf360c" stroke-width="1.4" stroke-linecap="round"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <path d="M 32.2 18.5 Q 40 15.5 47.3 20.5" stroke="#bf360c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 67.8 18.5 Q 60 15.5 52.7 20.5" stroke="#bf360c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 33.2 19.8 Q 40 17.8 46.8 21" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <path d="M 66.8 19.8 Q 60 17.8 53.2 21" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <ellipse cx="40" cy="28" rx="6.8" ry="8" fill="#fff8e1" stroke="#bf360c" stroke-width="1.6"/>
                            <ellipse cx="60" cy="28" rx="6.8" ry="8" fill="#fff8e1" stroke="#bf360c" stroke-width="1.6"/>
                            <ellipse cx="40.4" cy="28.3" rx="3.9" ry="5.0" fill="url(#phoenix-teen-iris)"/>
                            <ellipse cx="60.4" cy="28.3" rx="3.9" ry="5.0" fill="url(#phoenix-teen-iris)"/>
                            <ellipse cx="40.5" cy="28.6" rx="1.8" ry="3.2" fill="#1a0500"/>
                            <ellipse cx="60.5" cy="28.6" rx="1.8" ry="3.2" fill="#1a0500"/>
                            <circle cx="41.5" cy="25.4" r="2.0" fill="#fffde7" opacity="0.95"/>
                            <circle cx="61.5" cy="25.4" r="2.0" fill="#fffde7" opacity="0.95"/>
                            <circle cx="38.0" cy="30.2" r="1.0" fill="#ffab40" opacity="0.7"/>
                            <circle cx="58.0" cy="30.2" r="1.0" fill="#ffab40" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33.2 28 Q 40 24.8 46.8 28" stroke="#bf360c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53.2 28 Q 60 24.8 66.8 28" stroke="#bf360c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 46.6 43 L 50 47.6 L 53.4 43 Q 50 44.7 46.6 43" fill="#ff6d00" stroke="#bf360c" stroke-width="1.4" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45.8 44 L 50 48.8 L 54.2 44 Q 50 42.2 45.8 44" fill="#ff6d00" stroke="#bf360c" stroke-width="1.4" stroke-linejoin="round"/>
                            <path d="M 50 43.8 L 50 46.8" stroke="#bf360c" stroke-width="0.6" opacity="0.4"/>
                </g>

                <!-- PHOENIX ADULT — Ashborn Phoenix — BOSS -->
                <g id="tm-mascot-evo3-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-adult-body" cx="36%" cy="26%" r="80%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="18%" style="stop-color:#ffea00;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="65%" style="stop-color:#dd2c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a0000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-adult-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="phoenix-adult-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.98" />
                            <stop offset="25%" style="stop-color:#ffea00;stop-opacity:0.95" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:0.92" />
                            <stop offset="85%" style="stop-color:#ff3d00;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0.8" />
                        </linearGradient>
                        <linearGradient id="phoenix-adult-wing2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffea00;stop-opacity:0.9" />
                            <stop offset="50%" style="stop-color:#ff3d00;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="phoenix-adult-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-adult-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ff9100;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#dd2c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a0000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-adult-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-adult-aura" cx="50%" cy="48%" r="55%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.55" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-adult-corona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.5" />
                            <stop offset="35%" style="stop-color:#ffea00;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="phoenix-adult-tail" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffea00;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="38" ry="5.5" fill="#1a0500" opacity="0.32"/>
                        <ellipse cx="50" cy="48" rx="50" ry="47" fill="url(#phoenix-adult-aura)"/>
                        <ellipse cx="50" cy="46" rx="42" ry="40" fill="url(#phoenix-adult-corona)" opacity="0.55"/>
                        <ellipse cx="50" cy="46" rx="34" ry="32" fill="none" stroke="#ffea00" stroke-width="1.2" opacity="0.35"/>
                        <ellipse cx="50" cy="46" rx="26" ry="24" fill="none" stroke="#ff3d00" stroke-width="0.8" opacity="0.25"/>
                        <circle cx="18" cy="28" r="1.8" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="82" cy="24" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="12" cy="48" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="88" cy="50" r="1.8" fill="#fff59d" opacity="0.65"/>
                        <circle cx="22" cy="70" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="78" cy="72" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="8" cy="38" r="1.8" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="92" cy="40" r="1.2" fill="#fff59d" opacity="0.65"/>
                        <circle cx="30" cy="18" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="70" cy="16" r="1.8" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="16" cy="62" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="84" cy="64" r="1.2" fill="#fff59d" opacity="0.65"/>
                        <g class="tm-animate-wing-left">
                            <!-- Outer flame wing -->
                            <path d="M 30 48 Q -6 8 -8 40 Q -4 72 16 68 Q 26 58 32 52 Z" fill="url(#phoenix-adult-wing)" stroke="#3d0000" stroke-width="2.2"/>
                            <path d="M 26 50 Q 2 22 0 46 Q 2 66 18 62 Q 24 56 28 52 Z" fill="url(#phoenix-adult-wing2)" opacity="0.85" stroke="#ff3d00" stroke-width="1.1"/>
                            <path d="M 8 28 Q 0 36 4 52" stroke="#ffea00" stroke-width="1.3" fill="none" opacity="0.7"/>
                            <path d="M 4 36 Q -2 42 2 56" stroke="#ff8a65" stroke-width="1.1" fill="none" opacity="0.55"/>
                            <path d="M 2 46 Q -4 50 0 62" stroke="#ff3d00" stroke-width="0.95" fill="none" opacity="0.5"/>
                            <path d="M 12 54 Q 18 60 24 64" stroke="#fff59d" stroke-width="0.85" fill="none" opacity="0.45"/>
                            <path d="M -2 22 L -8 12" stroke="#3d0000" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M 4 18 L 0 8" stroke="#ff3d00" stroke-width="1.4" stroke-linecap="round"/>
                            <path d="M 10 16 L 8 6" stroke="#ffea00" stroke-width="1.2" stroke-linecap="round"/>
                            <circle cx="-4" cy="30" r="2" fill="#fffde7" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 70 48 Q 106 8 108 40 Q 104 72 84 68 Q 74 58 68 52 Z" fill="url(#phoenix-adult-wing)" stroke="#3d0000" stroke-width="2.2"/>
                            <path d="M 74 50 Q 98 22 100 46 Q 98 66 82 62 Q 76 56 72 52 Z" fill="url(#phoenix-adult-wing2)" opacity="0.85" stroke="#ff3d00" stroke-width="1.1"/>
                            <path d="M 92 28 Q 100 36 96 52" stroke="#ffea00" stroke-width="1.3" fill="none" opacity="0.7"/>
                            <path d="M 96 36 Q 102 42 98 56" stroke="#ff8a65" stroke-width="1.1" fill="none" opacity="0.55"/>
                            <path d="M 98 46 Q 104 50 100 62" stroke="#ff3d00" stroke-width="0.95" fill="none" opacity="0.5"/>
                            <path d="M 88 54 Q 82 60 76 64" stroke="#fff59d" stroke-width="0.85" fill="none" opacity="0.45"/>
                            <path d="M 102 22 L 108 12" stroke="#3d0000" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M 96 18 L 100 8" stroke="#ff3d00" stroke-width="1.4" stroke-linecap="round"/>
                            <path d="M 90 16 L 92 6" stroke="#ffea00" stroke-width="1.2" stroke-linecap="round"/>
                            <circle cx="104" cy="30" r="2" fill="#fffde7" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 58 68 Q 78 102 98 52 Q 104 28 90 24 Q 74 36 58 68 Z" fill="url(#phoenix-adult-tail)" stroke="#3d0000" stroke-width="1.8"/>
                            <path d="M 62 70 Q 80 108 100 60" fill="url(#phoenix-adult-wing)" opacity="0.7" stroke="#ff3d00" stroke-width="1.1"/>
                            <path d="M 66 66 Q 84 98 102 56" fill="none" stroke="#ffea00" stroke-width="1.3" opacity="0.65"/>
                            <path d="M 70 62 Q 86 90 96 50" fill="none" stroke="#ff8a65" stroke-width="1" opacity="0.5"/>
                            <path d="M 74 58 Q 88 82 94 48" fill="none" stroke="#fff59d" stroke-width="0.85" opacity="0.45"/>
                            <ellipse cx="96" cy="40" rx="6" ry="8" fill="#ffea00" opacity="0.75"/>
                            <circle cx="95" cy="38" r="2.2" fill="#fff" opacity="0.7"/>
                            <circle cx="100" cy="48" r="1.6" fill="#ff3d00" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="60" rx="25" ry="21" fill="url(#phoenix-adult-body)" stroke="#3d0000" stroke-width="2.5"/>
                            <ellipse cx="33.0" cy="52" rx="9" ry="5" fill="#fff" opacity="0.16"/>
                            <ellipse cx="50" cy="62" rx="17.0" ry="15.0" fill="url(#phoenix-adult-belly)"/>
                            <!-- Armor-like flame plates -->
                            <path d="M 38 48 L 36 56 L 42 54 Z" fill="#ff8a65" stroke="#3d0000" stroke-width="0.75"/>
                            <path d="M 50 46 L 48 54 L 52 54 Z" fill="#ffea00" stroke="#3d0000" stroke-width="0.8"/>
                            <path d="M 62 48 L 58 54 L 64 56 Z" fill="#ff8a65" stroke="#3d0000" stroke-width="0.75"/>
                            <path d="M 34 58 Q 50 62 66 58" stroke="#ffe082" stroke-width="1.15" fill="none" opacity="0.65"/>
                            <path d="M 36 64 Q 50 68 64 64" stroke="#ffe082" stroke-width="1" fill="none" opacity="0.55"/>
                            <path d="M 38 70 Q 50 74 62 70" stroke="#ffab40" stroke-width="0.9" fill="none" opacity="0.45"/>
                            <circle cx="50" cy="60" r="10" fill="url(#phoenix-adult-core)"/>
                            <circle cx="50" cy="60" r="4.5" fill="#fffde7" opacity="0.85"/>
                            <!-- Head -->
                            <ellipse cx="50" cy="26" rx="19" ry="17" fill="url(#phoenix-adult-body)" stroke="#3d0000" stroke-width="2.3"/>
                            <ellipse cx="38.0" cy="21" rx="7" ry="4" fill="#fff" opacity="0.15"/>
                            <!-- Mythic solar crown -->
                            <ellipse cx="50" cy="6" rx="22" ry="5" fill="url(#phoenix-adult-corona)" opacity="0.85"/>
                            <path d="M 28 18 L 18 -2 L 34 14 Z" fill="url(#phoenix-adult-wing)" stroke="#3d0000" stroke-width="1.1"/>
                            <path d="M 36 14 L 30 -6 L 42 12 Z" fill="#ff3d00" stroke="#3d0000" stroke-width="1.05"/>
                            <path d="M 44 10 L 40 -10 L 50 8 Z" fill="#ffea00" stroke="#3d0000" stroke-width="1.1"/>
                            <path d="M 56 10 L 60 -10 L 50 8 Z" fill="#ffea00" stroke="#3d0000" stroke-width="1.1"/>
                            <path d="M 64 14 L 70 -6 L 58 12 Z" fill="#ff3d00" stroke="#3d0000" stroke-width="1.05"/>
                            <path d="M 72 18 L 82 -2 L 66 14 Z" fill="url(#phoenix-adult-wing)" stroke="#3d0000" stroke-width="1.1"/>
                            <path d="M 22 12 L 12 0 L 26 10 Z" fill="#ff8a65" opacity="0.85"/>
                            <path d="M 78 12 L 88 0 L 74 10 Z" fill="#ff8a65" opacity="0.85"/>
                            <circle cx="50" cy="-6" r="2.8" fill="#fffde7" opacity="0.9"/>
                            <circle cx="50" cy="2" r="1.6" fill="#ff3d00" opacity="0.55"/>
                            <circle cx="34" cy="32" r="4.5" fill="url(#phoenix-adult-cheek)"/>
                            <circle cx="66" cy="32" r="4.5" fill="url(#phoenix-adult-cheek)"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="58" rx="7.5" ry="12" fill="url(#phoenix-adult-body)" stroke="#3d0000" stroke-width="1.4" transform="rotate(-20 26 58)"/>
                            <path d="M 22 68 L 16 76 M 24 70 L 22 78 M 26 68 L 30 76" stroke="#ff3d00" stroke-width="1.6" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="58" rx="7.5" ry="12" fill="url(#phoenix-adult-body)" stroke="#3d0000" stroke-width="1.4" transform="rotate(20 74 58)"/>
                            <path d="M 74 68 L 70 76 M 76 70 L 78 78 M 78 68 L 84 76" stroke="#ff3d00" stroke-width="1.6" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="88" rx="8" ry="6" fill="url(#phoenix-adult-body)" stroke="#3d0000" stroke-width="1.5"/>
                            <path d="M 32 90 L 26 96 M 37 91 L 37 98 M 42 91 L 42 98 M 46 90 L 52 96" stroke="#3d0000" stroke-width="1.7" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="88" rx="8" ry="6" fill="url(#phoenix-adult-body)" stroke="#3d0000" stroke-width="1.5"/>
                            <path d="M 54 90 L 48 96 M 59 91 L 59 98 M 64 91 L 64 98 M 68 90 L 74 96" stroke="#3d0000" stroke-width="1.7" stroke-linecap="round"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <path d="M 31.5 13.7 Q 40 10.7 48 15.7" stroke="#3d0000" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 68.5 13.7 Q 60 10.7 52 15.7" stroke="#3d0000" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 32.5 15 Q 40 13 47.5 16.2" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <path d="M 67.5 15 Q 60 13 52.5 16.2" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <ellipse cx="40" cy="24" rx="7.5" ry="8.8" fill="#fff8e1" stroke="#3d0000" stroke-width="1.6"/>
                            <ellipse cx="60" cy="24" rx="7.5" ry="8.8" fill="#fff8e1" stroke="#3d0000" stroke-width="1.6"/>
                            <ellipse cx="40.4" cy="24.3" rx="4.3" ry="5.5" fill="url(#phoenix-adult-iris)"/>
                            <ellipse cx="60.4" cy="24.3" rx="4.3" ry="5.5" fill="url(#phoenix-adult-iris)"/>
                            <ellipse cx="40.5" cy="24.6" rx="2.0" ry="3.5" fill="#1a0500"/>
                            <ellipse cx="60.5" cy="24.6" rx="2.0" ry="3.5" fill="#1a0500"/>
                            <circle cx="41.5" cy="21.2" r="2.3" fill="#fffde7" opacity="0.95"/>
                            <circle cx="61.5" cy="21.2" r="2.3" fill="#fffde7" opacity="0.95"/>
                            <circle cx="37.8" cy="26.5" r="1.1" fill="#ffab40" opacity="0.7"/>
                            <circle cx="57.8" cy="26.5" r="1.1" fill="#ffab40" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.5 24 Q 40 20.8 47.5 24" stroke="#3d0000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 52.5 24 Q 60 20.8 67.5 24" stroke="#3d0000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 46.2 41 L 50 46.0 L 53.8 41 Q 50 42.9 46.2 41" fill="#ff6d00" stroke="#3d0000" stroke-width="1.4" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45.4 42 L 50 47.2 L 54.6 42 Q 50 40.2 45.4 42" fill="#ff6d00" stroke="#3d0000" stroke-width="1.4" stroke-linejoin="round"/>
                            <path d="M 50 41.8 L 50 45.2" stroke="#bf360c" stroke-width="0.6" opacity="0.4"/>
                </g>

                <!-- PHOENIX MIDDLE AGE — crimson ash tyrant -->
                <g id="tm-mascot-evo4-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-mid-body" cx="36%" cy="26%" r="80%">
                            <stop offset="0%" style="stop-color:#ff8a65;stop-opacity:1" />
                            <stop offset="20%" style="stop-color:#e64a19;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#bf360c;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#4e342e;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a0a00;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-mid-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="phoenix-mid-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.98" />
                            <stop offset="25%" style="stop-color:#ffab40;stop-opacity:0.95" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:0.92" />
                            <stop offset="85%" style="stop-color:#ff5722;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0.8" />
                        </linearGradient>
                        <linearGradient id="phoenix-mid-wing2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffea00;stop-opacity:0.9" />
                            <stop offset="50%" style="stop-color:#ff3d00;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="phoenix-mid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-mid-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ff9100;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#dd2c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a0000;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-mid-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-mid-aura" cx="50%" cy="48%" r="55%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.55" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-mid-corona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.5" />
                            <stop offset="35%" style="stop-color:#ffea00;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="phoenix-mid-tail" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#ffab40;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="phoenix-mid-ash" cx="50%" cy="50%" r="50%>
                            <stop offset="0%" style="stop-color:#90a4ae;stop-opacity:0.65" />
                            <stop offset="100%" style="stop-color:#37474f;stop-opacity:0.25" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="36" ry="5.5" fill="#1a0500" opacity="0.32"/>
                        <ellipse cx="50" cy="48" rx="46" ry="43" fill="url(#phoenix-mid-aura)"/>

                        <circle cx="18" cy="28" r="1.8" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="82" cy="24" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="12" cy="48" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="88" cy="50" r="1.8" fill="#fff59d" opacity="0.65"/>
                        <circle cx="22" cy="70" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="78" cy="72" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="8" cy="38" r="1.8" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="92" cy="40" r="1.2" fill="#fff59d" opacity="0.65"/>
                        <circle cx="30" cy="18" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="70" cy="16" r="1.8" fill="#fff59d" opacity="0.44999999999999996"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 50 Q 0 22 -2 46 Q 0 68 16 64 Q 24 56 30 52 Z" fill="url(#phoenix-mid-wing)" stroke="#3e2723" stroke-width="1.9"/>
                            <path d="M 12 36 Q 4 44 8 58" stroke="#ffab40" stroke-width="1.1" fill="none" opacity="0.6"/>
                            <path d="M 8 44 Q 2 50 6 62" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.5"/>
                            <path d="M 4 28 L -2 20" stroke="#3e2723" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M 10 24 L 6 16" stroke="#ff5722" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 50 Q 100 22 102 46 Q 100 68 84 64 Q 76 56 70 52 Z" fill="url(#phoenix-mid-wing)" stroke="#3e2723" stroke-width="1.9"/>
                            <path d="M 88 36 Q 96 44 92 58" stroke="#ffab40" stroke-width="1.1" fill="none" opacity="0.6"/>
                            <path d="M 92 44 Q 98 50 94 62" stroke="#ff8a65" stroke-width="0.9" fill="none" opacity="0.5"/>
                            <path d="M 96 28 L 102 20" stroke="#3e2723" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M 90 24 L 94 16" stroke="#ff5722" stroke-width="1.2" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 58 68 Q 78 102 98 52 Q 104 28 90 24 Q 74 36 58 68 Z" fill="url(#phoenix-mid-tail)" stroke="#3e2723" stroke-width="1.8"/>
                            <path d="M 62 70 Q 80 108 100 60" fill="url(#phoenix-mid-wing)" opacity="0.7" stroke="#ff5722" stroke-width="1.1"/>
                            <path d="M 66 66 Q 84 98 102 56" fill="none" stroke="#ffab40" stroke-width="1.3" opacity="0.65"/>
                            <path d="M 70 62 Q 86 90 96 50" fill="none" stroke="#ff8a65" stroke-width="1" opacity="0.5"/>
                            <path d="M 74 58 Q 88 82 94 48" fill="none" stroke="#fff59d" stroke-width="0.85" opacity="0.45"/>
                            <ellipse cx="96" cy="40" rx="6" ry="8" fill="#ffab40" opacity="0.75"/>
                            <circle cx="95" cy="38" r="2.2" fill="#fff" opacity="0.7"/>
                            <circle cx="100" cy="48" r="1.6" fill="#ff3d00" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="62" rx="24" ry="20" fill="url(#phoenix-mid-body)" stroke="#3e2723" stroke-width="2.5"/>
                            <ellipse cx="34.0" cy="54" rx="9" ry="5" fill="#fff" opacity="0.16"/>
                            <ellipse cx="50" cy="64" rx="16.0" ry="14.0" fill="url(#phoenix-mid-belly)"/>
                            <!-- Ash scars -->
                            <ellipse cx="36" cy="58" rx="6" ry="5" fill="url(#phoenix-mid-ash)" opacity="0.55"/>
                            <ellipse cx="64" cy="62" rx="5" ry="4" fill="url(#phoenix-mid-ash)" opacity="0.5"/>
                            <path d="M 54 32 L 58 38 L 56 42" stroke="#90a4ae" stroke-width="1.3" fill="none" opacity="0.7"/>
                            <path d="M 34 56 Q 50 60 66 56" stroke="#ffab40" stroke-width="1" fill="none" opacity="0.45"/>
                            <circle cx="50" cy="62" r="10" fill="url(#phoenix-mid-core)"/>
                            <circle cx="50" cy="62" r="4.5" fill="#fffde7" opacity="0.85"/>
                            <!-- Head -->
                            <ellipse cx="50" cy="28" rx="18" ry="16" fill="url(#phoenix-mid-body)" stroke="#3e2723" stroke-width="2.3"/>
                            <ellipse cx="39.0" cy="23" rx="7" ry="4" fill="#fff" opacity="0.15"/>
                            <path d="M 36 18 L 28 2 L 40 16 Z" fill="url(#phoenix-mid-wing)" stroke="#3e2723" stroke-width="0.95"/>
                            <path d="M 44 14 L 40 -2 L 50 12 Z" fill="#ffab40" stroke="#3e2723" stroke-width="0.95"/>
                            <path d="M 56 14 L 60 -2 L 50 12 Z" fill="#ffab40" stroke="#3e2723" stroke-width="0.95"/>
                            <path d="M 64 18 L 72 2 L 60 16 Z" fill="url(#phoenix-mid-wing)" stroke="#3e2723" stroke-width="0.95"/>
                            <path d="M 32 12 L 24 0 L 34 10 Z" fill="#ff8a65" opacity="0.8"/>
                            <path d="M 68 12 L 76 0 L 66 10 Z" fill="#ff8a65" opacity="0.8"/>
                            <circle cx="50" cy="0" r="2" fill="#fffde7" opacity="0.75"/>
                            <circle cx="34" cy="34" r="4.5" fill="url(#phoenix-mid-cheek)"/>
                            <circle cx="66" cy="34" r="4.5" fill="url(#phoenix-mid-cheek)"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="58" rx="7.5" ry="12" fill="url(#phoenix-mid-body)" stroke="#3e2723" stroke-width="1.4" transform="rotate(-20 26 58)"/>
                            <path d="M 22 68 L 16 76 M 24 70 L 22 78 M 26 68 L 30 76" stroke="#ff5722" stroke-width="1.6" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="58" rx="7.5" ry="12" fill="url(#phoenix-mid-body)" stroke="#3e2723" stroke-width="1.4" transform="rotate(20 74 58)"/>
                            <path d="M 74 68 L 70 76 M 76 70 L 78 78 M 78 68 L 84 76" stroke="#ff5722" stroke-width="1.6" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="88" rx="8" ry="6" fill="url(#phoenix-mid-body)" stroke="#3e2723" stroke-width="1.5"/>
                            <path d="M 32 90 L 26 96 M 37 91 L 37 98 M 42 91 L 42 98 M 46 90 L 52 96" stroke="#3e2723" stroke-width="1.7" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="88" rx="8" ry="6" fill="url(#phoenix-mid-body)" stroke="#3e2723" stroke-width="1.5"/>
                            <path d="M 54 90 L 48 96 M 59 91 L 59 98 M 64 91 L 64 98 M 68 90 L 74 96" stroke="#3e2723" stroke-width="1.7" stroke-linecap="round"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <path d="M 32 16.3 Q 40 13.3 47.5 18.3" stroke="#3e2723" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 68 16.3 Q 60 13.3 52.5 18.3" stroke="#3e2723" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 33 17.6 Q 40 15.600000000000001 47 18.8" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <path d="M 67 17.6 Q 60 15.600000000000001 53 18.8" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <ellipse cx="40" cy="26" rx="7" ry="8.2" fill="#fff8e1" stroke="#3e2723" stroke-width="1.6"/>
                            <ellipse cx="60" cy="26" rx="7" ry="8.2" fill="#fff8e1" stroke="#3e2723" stroke-width="1.6"/>
                            <ellipse cx="40.4" cy="26.3" rx="4.1" ry="5.1" fill="url(#phoenix-mid-iris)"/>
                            <ellipse cx="60.4" cy="26.3" rx="4.1" ry="5.1" fill="url(#phoenix-mid-iris)"/>
                            <ellipse cx="40.5" cy="26.6" rx="1.8" ry="3.3" fill="#1a0500"/>
                            <ellipse cx="60.5" cy="26.6" rx="1.8" ry="3.3" fill="#1a0500"/>
                            <circle cx="41.5" cy="23.4" r="2.1" fill="#fffde7" opacity="0.95"/>
                            <circle cx="61.5" cy="23.4" r="2.1" fill="#fffde7" opacity="0.95"/>
                            <circle cx="37.9" cy="28.3" r="1.0" fill="#ffab40" opacity="0.7"/>
                            <circle cx="57.9" cy="28.3" r="1.0" fill="#ffab40" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 33 26 Q 40 22.8 47 26" stroke="#3e2723" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 53 26 Q 60 22.8 67 26" stroke="#3e2723" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 46.4 43 L 50 47.8 L 53.6 43 Q 50 44.8 46.4 43" fill="#d84315" stroke="#3e2723" stroke-width="1.4" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45.6 44 L 50 49.0 L 54.4 44 Q 50 42.2 45.6 44" fill="#d84315" stroke="#3e2723" stroke-width="1.4" stroke-linejoin="round"/>
                            <path d="M 50 43.8 L 50 47.0" stroke="#bf360c" stroke-width="0.6" opacity="0.4"/>
                </g>

                <!-- PHOENIX OLD — immortal sun god -->
                <g id="tm-mascot-evo5-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-old-body" cx="36%" cy="26%" r="80%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="20%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#ff8a65;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff6d00;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-old-belly" cx="50%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="phoenix-old-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.98" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:0.95" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:0.92" />
                            <stop offset="85%" style="stop-color:#ffcc80;stop-opacity:0.88" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0.8" />
                        </linearGradient>
                        <linearGradient id="phoenix-old-wing2" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffea00;stop-opacity:0.9" />
                            <stop offset="50%" style="stop-color:#ff3d00;stop-opacity:0.85" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:0.75" />
                        </linearGradient>
                        <radialGradient id="phoenix-old-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="25%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="55%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-old-iris" cx="35%" cy="28%" r="68%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#ffd54f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="phoenix-old-cheek" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ff8a80;stop-opacity:0.55" />
                            <stop offset="100%" style="stop-color:#ff8a80;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-old-aura" cx="50%" cy="48%" r="55%">
                            <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.55" />
                            <stop offset="40%" style="stop-color:#ff6d00;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="phoenix-old-corona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:0.5" />
                            <stop offset="35%" style="stop-color:#ffea00;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="phoenix-old-tail" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fffde7;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#fff59d;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7f0000;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="40" ry="5.5" fill="#1a0500" opacity="0.32"/>
                        <ellipse cx="50" cy="48" rx="52" ry="49" fill="url(#phoenix-old-aura)"/>
                        <ellipse cx="50" cy="44" rx="44" ry="42" fill="url(#phoenix-old-corona)" opacity="0.65"/>
                        <ellipse cx="50" cy="44" rx="36" ry="34" fill="none" stroke="#fffde7" stroke-width="1.4" opacity="0.4"/>
                        <ellipse cx="50" cy="44" rx="28" ry="26" fill="none" stroke="#ffd54f" stroke-width="0.9" opacity="0.3"/>
                        <circle cx="18" cy="28" r="1.8" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="82" cy="24" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="12" cy="48" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="88" cy="50" r="1.8" fill="#fff59d" opacity="0.65"/>
                        <circle cx="22" cy="70" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="78" cy="72" r="1.2" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="8" cy="38" r="1.8" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="92" cy="40" r="1.2" fill="#fff59d" opacity="0.65"/>
                        <circle cx="30" cy="18" r="1.2" fill="#ff6d00" opacity="0.35"/>
                        <circle cx="70" cy="16" r="1.8" fill="#fff59d" opacity="0.44999999999999996"/>
                        <circle cx="16" cy="62" r="1.2" fill="#ff6d00" opacity="0.55"/>
                        <circle cx="84" cy="64" r="1.2" fill="#fff59d" opacity="0.65"/>
                        <g class="tm-animate-wing-left">
                            <!-- Outer flame wing -->
                            <path d="M 30 48 Q -6 8 -8 40 Q -4 72 16 68 Q 26 58 32 52 Z" fill="url(#phoenix-old-wing)" stroke="#ff6f00" stroke-width="2.2"/>
                            <path d="M 26 50 Q 2 22 0 46 Q 2 66 18 62 Q 24 56 28 52 Z" fill="url(#phoenix-old-wing2)" opacity="0.85" stroke="#ffcc80" stroke-width="1.1"/>
                            <path d="M 8 28 Q 0 36 4 52" stroke="#fff59d" stroke-width="1.3" fill="none" opacity="0.7"/>
                            <path d="M 4 36 Q -2 42 2 56" stroke="#ff8a65" stroke-width="1.1" fill="none" opacity="0.55"/>
                            <path d="M 2 46 Q -4 50 0 62" stroke="#ff3d00" stroke-width="0.95" fill="none" opacity="0.5"/>
                            <path d="M 12 54 Q 18 60 24 64" stroke="#fff59d" stroke-width="0.85" fill="none" opacity="0.45"/>
                            <path d="M -2 22 L -8 12" stroke="#ff6f00" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M 4 18 L 0 8" stroke="#ffcc80" stroke-width="1.4" stroke-linecap="round"/>
                            <path d="M 10 16 L 8 6" stroke="#fff59d" stroke-width="1.2" stroke-linecap="round"/>
                            <circle cx="-4" cy="30" r="2" fill="#fffde7" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 70 48 Q 106 8 108 40 Q 104 72 84 68 Q 74 58 68 52 Z" fill="url(#phoenix-old-wing)" stroke="#ff6f00" stroke-width="2.2"/>
                            <path d="M 74 50 Q 98 22 100 46 Q 98 66 82 62 Q 76 56 72 52 Z" fill="url(#phoenix-old-wing2)" opacity="0.85" stroke="#ffcc80" stroke-width="1.1"/>
                            <path d="M 92 28 Q 100 36 96 52" stroke="#fff59d" stroke-width="1.3" fill="none" opacity="0.7"/>
                            <path d="M 96 36 Q 102 42 98 56" stroke="#ff8a65" stroke-width="1.1" fill="none" opacity="0.55"/>
                            <path d="M 98 46 Q 104 50 100 62" stroke="#ff3d00" stroke-width="0.95" fill="none" opacity="0.5"/>
                            <path d="M 88 54 Q 82 60 76 64" stroke="#fff59d" stroke-width="0.85" fill="none" opacity="0.45"/>
                            <path d="M 102 22 L 108 12" stroke="#ff6f00" stroke-width="1.8" stroke-linecap="round"/>
                            <path d="M 96 18 L 100 8" stroke="#ffcc80" stroke-width="1.4" stroke-linecap="round"/>
                            <path d="M 90 16 L 92 6" stroke="#fff59d" stroke-width="1.2" stroke-linecap="round"/>
                            <circle cx="104" cy="30" r="2" fill="#fffde7" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 58 68 Q 78 102 98 52 Q 104 28 90 24 Q 74 36 58 68 Z" fill="url(#phoenix-old-tail)" stroke="#ff6f00" stroke-width="1.8"/>
                            <path d="M 62 70 Q 80 108 100 60" fill="url(#phoenix-old-wing)" opacity="0.7" stroke="#ffcc80" stroke-width="1.1"/>
                            <path d="M 66 66 Q 84 98 102 56" fill="none" stroke="#fff59d" stroke-width="1.3" opacity="0.65"/>
                            <path d="M 70 62 Q 86 90 96 50" fill="none" stroke="#ff8a65" stroke-width="1" opacity="0.5"/>
                            <path d="M 74 58 Q 88 82 94 48" fill="none" stroke="#fff59d" stroke-width="0.85" opacity="0.45"/>
                            <ellipse cx="96" cy="40" rx="6" ry="8" fill="#fff59d" opacity="0.75"/>
                            <circle cx="95" cy="38" r="2.2" fill="#fff" opacity="0.7"/>
                            <circle cx="100" cy="48" r="1.6" fill="#ff3d00" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">
                            <ellipse cx="50" cy="58" rx="24" ry="20" fill="url(#phoenix-old-body)" stroke="#ff6f00" stroke-width="2.5"/>
                            <ellipse cx="34.0" cy="50" rx="9" ry="5" fill="#fff" opacity="0.16"/>
                            <ellipse cx="50" cy="60" rx="16.0" ry="14.0" fill="url(#phoenix-old-belly)"/>
                            <path d="M 36 52 Q 50 54 64 52" stroke="#fffde7" stroke-width="1.1" fill="none" opacity="0.55"/>
                            <circle cx="28" cy="40" r="2.2" fill="#fff" opacity="0.55"/>
                            <circle cx="72" cy="38" r="2.2" fill="#fff" opacity="0.5"/>
                            <circle cx="50" cy="58" r="10" fill="url(#phoenix-old-core)"/>
                            <circle cx="50" cy="58" r="4.5" fill="#fffde7" opacity="0.85"/>
                            <!-- Head -->
                            <ellipse cx="50" cy="24" rx="18.5" ry="16.5" fill="url(#phoenix-old-body)" stroke="#ff6f00" stroke-width="2.3"/>
                            <ellipse cx="38.5" cy="19" rx="7" ry="4" fill="#fff" opacity="0.15"/>
                            <!-- Immortal sun halo -->
                            <ellipse cx="50" cy="4" rx="24" ry="5.5" fill="none" stroke="#fff59d" stroke-width="1.6" opacity="0.7"/>
                            <ellipse cx="50" cy="4" rx="18" ry="3.5" fill="url(#phoenix-old-corona)" opacity="0.8"/>
                            <path d="M 30 16 L 22 -4 L 36 14 Z" fill="url(#phoenix-old-wing)" stroke="#ff6f00" stroke-width="1"/>
                            <path d="M 40 12 L 36 -8 L 48 10 Z" fill="#fff59d" stroke="#ff6f00" stroke-width="1"/>
                            <path d="M 50 8 L 50 -12 L 56 8 Z" fill="#fffde7" stroke="#ff6f00" stroke-width="1.05"/>
                            <path d="M 60 12 L 64 -8 L 52 10 Z" fill="#fff59d" stroke="#ff6f00" stroke-width="1"/>
                            <path d="M 70 16 L 78 -4 L 64 14 Z" fill="url(#phoenix-old-wing)" stroke="#ff6f00" stroke-width="1"/>
                            <circle cx="50" cy="-8" r="3" fill="#fff" opacity="0.9"/>
                            <circle cx="24" cy="8" r="1.8" fill="#fff" opacity="0.55"/>
                            <circle cx="76" cy="8" r="1.8" fill="#fff" opacity="0.55"/>
                            <circle cx="34" cy="30" r="4.5" fill="url(#phoenix-old-cheek)"/>
                            <circle cx="66" cy="30" r="4.5" fill="url(#phoenix-old-cheek)"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <ellipse cx="26" cy="58" rx="7.5" ry="12" fill="url(#phoenix-old-body)" stroke="#ff6f00" stroke-width="1.4" transform="rotate(-20 26 58)"/>
                            <path d="M 22 68 L 16 76 M 24 70 L 22 78 M 26 68 L 30 76" stroke="#ffcc80" stroke-width="1.6" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <ellipse cx="74" cy="58" rx="7.5" ry="12" fill="url(#phoenix-old-body)" stroke="#ff6f00" stroke-width="1.4" transform="rotate(20 74 58)"/>
                            <path d="M 74 68 L 70 76 M 76 70 L 78 78 M 78 68 L 84 76" stroke="#ffcc80" stroke-width="1.6" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <ellipse cx="38" cy="88" rx="8" ry="6" fill="url(#phoenix-old-body)" stroke="#ff6f00" stroke-width="1.5"/>
                            <path d="M 32 90 L 26 96 M 37 91 L 37 98 M 42 91 L 42 98 M 46 90 L 52 96" stroke="#ff6f00" stroke-width="1.7" stroke-linecap="round"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <ellipse cx="62" cy="88" rx="8" ry="6" fill="url(#phoenix-old-body)" stroke="#ff6f00" stroke-width="1.5"/>
                            <path d="M 54 90 L 48 96 M 59 91 L 59 98 M 64 91 L 64 98 M 68 90 L 74 96" stroke="#ff6f00" stroke-width="1.7" stroke-linecap="round"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <path d="M 31.799999999999997 12 Q 40 9 47.7 14" stroke="#ff6f00" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 68.2 12 Q 60 9 52.3 14" stroke="#ff6f00" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 32.8 13.3 Q 40 11.3 47.2 14.5" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <path d="M 67.2 13.3 Q 60 11.3 52.8 14.5" stroke="#ff3d00" stroke-width="1.1" fill="none" opacity="0.65"/>
                            <ellipse cx="40" cy="22" rx="7.2" ry="8.5" fill="#fffde7" stroke="#ff6f00" stroke-width="1.6"/>
                            <ellipse cx="60" cy="22" rx="7.2" ry="8.5" fill="#fffde7" stroke="#ff6f00" stroke-width="1.6"/>
                            <ellipse cx="40.4" cy="22.3" rx="4.2" ry="5.3" fill="url(#phoenix-old-iris)"/>
                            <ellipse cx="60.4" cy="22.3" rx="4.2" ry="5.3" fill="url(#phoenix-old-iris)"/>
                            <ellipse cx="40.5" cy="22.6" rx="1.9" ry="3.4" fill="#1a0500"/>
                            <ellipse cx="60.5" cy="22.6" rx="1.9" ry="3.4" fill="#1a0500"/>
                            <circle cx="41.5" cy="19.3" r="2.2" fill="#fff" opacity="0.95"/>
                            <circle cx="61.5" cy="19.3" r="2.2" fill="#fff" opacity="0.95"/>
                            <circle cx="37.8" cy="24.4" r="1.0" fill="#ffab40" opacity="0.7"/>
                            <circle cx="57.8" cy="24.4" r="1.0" fill="#ffab40" opacity="0.7"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 32.8 22 Q 40 18.8 47.2 22" stroke="#ff6f00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                            <path d="M 52.8 22 Q 60 18.8 67.2 22" stroke="#ff6f00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 46.2 39 L 50 44.0 L 53.8 39 Q 50 40.9 46.2 39" fill="#ffcc80" stroke="#ff6f00" stroke-width="1.4" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45.4 40 L 50 45.2 L 54.6 40 Q 50 38.2 45.4 40" fill="#ffcc80" stroke="#ff6f00" stroke-width="1.4" stroke-linejoin="round"/>
                            <path d="M 50 39.8 L 50 43.2" stroke="#bf360c" stroke-width="0.6" opacity="0.4"/>
                </g>
                <!-- CRYSTAL CHARACTER - All Life Stages (dense cute epic v3) -->
                <!-- Aether & Stone • Epic Rarity • Prism Titan -->
                <!-- ═══════════════════════════════════════ -->

                <!-- CRYSTAL BABY — round gem spawn -->
                <g id="tm-mascot-baby-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-baby-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="45%" style="stop-color:#80deea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="crystal-baby-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#76ff03;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="crystal-baby-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="crystal-baby-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0.08" />
                        </linearGradient>
                        <radialGradient id="crystal-baby-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="90" rx="22" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <ellipse cx="50" cy="54" rx="34" ry="32" fill="url(#crystal-baby-aura)" opacity="0.6"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 48 L 10 30 L 16 50 L 8 58 L 30 56 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 16 44 L 6 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
                            <path d="M 14 50 L 10 54" stroke="#76ff03" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="7" cy="34" r="1.3" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 48 L 90 30 L 84 50 L 92 58 L 70 56 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 84 44 L 94 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
                            <path d="M 86 50 L 90 54" stroke="#76ff03" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="93" cy="34" r="1.3" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 62 68 L 74 78 L 70 66 L 64 64 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <path d="M 68 70 L 72 74" stroke="#fff" stroke-width="0.6" opacity="0.4"/>
                            <circle cx="74" cy="76" r="1.5" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Round gem body -->
                            <circle cx="50" cy="58" r="20" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1.8"/>
                            <path d="M 50 38 L 50 78" stroke="#fff" stroke-width="0.7" opacity="0.35"/>
                            <path d="M 34 50 L 66 66" stroke="#fff" stroke-width="0.55" opacity="0.25"/>
                            <path d="M 66 50 L 34 66" stroke="#006064" stroke-width="0.5" opacity="0.25"/>
                            <path d="M 42 46 L 50 52 L 44 58 Z" fill="url(#crystal-baby-facet)"/>
                            <path d="M 56 48 L 60 54 L 54 56 Z" fill="#fff" opacity="0.22"/>
                            <circle cx="50" cy="58" r="8" fill="url(#crystal-baby-core)"/>
                            <circle cx="50" cy="58" r="3.5" fill="#fff" opacity="0.65"/>
                            <!-- Facet face plate -->
                            <path d="M 50 32 L 62 42 L 50 48 L 38 42 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1.4"/>
                            <path d="M 44 40 L 50 34 L 50 44 Z" fill="url(#crystal-baby-facet)"/>
                            <circle cx="38" cy="56" r="1.3" fill="#76ff03" opacity="0.4"/>
                            <circle cx="62" cy="58" r="1.2" fill="#4dd0e1" opacity="0.35"/>
                            <circle cx="34" cy="52" r="1.1" fill="#fff" opacity="0.28"/>
                            <circle cx="66" cy="54" r="1.1" fill="#fff" opacity="0.26"/>
                            <path d="M 46 52 L 50 56 L 54 52" stroke="#4dd0e1" stroke-width="0.7" fill="none" opacity="0.35"/>
                            <ellipse cx="44" cy="62" rx="2" ry="1.5" fill="#fff" opacity="0.18"/>
                            <ellipse cx="56" cy="64" rx="2" ry="1.5" fill="#fff" opacity="0.16"/>
                            <circle cx="50" cy="40" r="1.2" fill="#76ff03" opacity="0.35"/>
                            <circle cx="40" cy="68" r="1.1" fill="#fff" opacity="0.2"/>
                            <circle cx="60" cy="70" r="1.1" fill="#fff" opacity="0.19"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 34 58 L 24 52 L 26 66 L 32 64 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <circle cx="24" cy="54" r="1.2" fill="#fff" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 66 58 L 76 52 L 74 66 L 68 64 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <circle cx="76" cy="54" r="1.2" fill="#fff" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 42 76 L 38 88 L 46 88 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <ellipse cx="42" cy="88" rx="5" ry="2" fill="#006064"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 58 76 L 54 88 L 62 88 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <ellipse cx="58" cy="88" rx="5" ry="2" fill="#006064"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="42" cy="38" rx="6.5" ry="7.5" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="58" cy="38" rx="6.5" ry="7.5" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="42.5" cy="38.5" rx="3.575" ry="4.35" fill="url(#crystal-baby-iris)"/>
                            <ellipse cx="58.5" cy="38.5" rx="3.575" ry="4.35" fill="url(#crystal-baby-iris)"/>
                            <ellipse cx="42.5" cy="38.8" rx="1.8200000000000003" ry="2.625" fill="#050508"/>
                            <ellipse cx="58.5" cy="38.8" rx="1.8200000000000003" ry="2.625" fill="#050508"/>
                            <circle cx="43.5" cy="35.375" r="1.8200000000000003" fill="#fff"/>
                            <circle cx="59.5" cy="35.375" r="1.8200000000000003" fill="#fff"/>
                            <circle cx="39.725" cy="40.625" r="0.78" fill="#b2ebf2" opacity="0.75"/>
                            <circle cx="55.725" cy="40.625" r="0.78" fill="#b2ebf2" opacity="0.75"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 35.5 38 Q 42 35 48.5 38" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 51.5 38 Q 58 35 64.5 38" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 46 L 50 51 L 55 46" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 50 L 50 45 L 55 50" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>

                <!-- CRYSTAL KID — prism cluster -->
                <g id="tm-mascot-evo1-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-kid-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="40%" style="stop-color:#80deea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0097a7;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="crystal-kid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#76ff03;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="crystal-kid-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="crystal-kid-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0.08" />
                        </linearGradient>
                        <radialGradient id="crystal-kid-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="92" rx="26" ry="5" fill="#1a1a1a" opacity="0.2"/>
                        <ellipse cx="50" cy="52" rx="38" ry="36" fill="url(#crystal-kid-aura)"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 48 L 10 30 L 16 50 L 8 58 L 30 56 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 16 44 L 6 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
                            <path d="M 14 50 L 10 54" stroke="#76ff03" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="7" cy="34" r="1.3" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 48 L 90 30 L 84 50 L 92 58 L 70 56 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 84 44 L 94 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
                            <path d="M 86 50 L 90 54" stroke="#76ff03" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="93" cy="34" r="1.3" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 64 72 L 82 84 L 76 68 L 68 66 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.1"/>
                            <path d="M 72 74 L 78 80" stroke="#fff" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="80" cy="82" r="1.8" fill="#76ff03" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-body">
                            <!-- Cluster nodes -->
                            <circle cx="42" cy="60" r="10" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <circle cx="58" cy="58" r="11" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <circle cx="50" cy="68" r="9" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 42 52 L 50 48 L 58 52" stroke="#fff" stroke-width="0.6" opacity="0.3" fill="none"/>
                            <path d="M 44 66 L 50 62 L 56 66" stroke="#fff" stroke-width="0.55" opacity="0.25" fill="none"/>
                            <circle cx="50" cy="62" r="7" fill="url(#crystal-kid-core)"/>
                            <circle cx="50" cy="62" r="3" fill="#fff" opacity="0.6"/>
                            <path d="M 50 30 L 60 40 L 50 46 L 40 40 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 44 38 L 50 32 L 50 42 Z" fill="url(#crystal-kid-facet)"/>
                            <circle cx="38" cy="56" r="1.5" fill="#76ff03" opacity="0.45"/>
                            <circle cx="62" cy="54" r="1.4" fill="#4dd0e1" opacity="0.4"/>
                            <circle cx="46" cy="72" r="1.2" fill="#fff" opacity="0.3"/>
                            <circle cx="36" cy="54" r="1.2" fill="#fff" opacity="0.25"/>
                            <circle cx="64" cy="56" r="1.1" fill="#fff" opacity="0.24"/>
                            <path d="M 46 52 L 50 56 L 54 52" stroke="#4dd0e1" stroke-width="0.7" fill="none" opacity="0.32"/>
                            <ellipse cx="44" cy="64" rx="2" ry="1.4" fill="#fff" opacity="0.16"/>
                            <ellipse cx="56" cy="66" rx="2" ry="1.4" fill="#fff" opacity="0.15"/>
                            <circle cx="50" cy="38" r="1.3" fill="#76ff03" opacity="0.38"/>
                            <circle cx="34" cy="60" r="1.1" fill="#fff" opacity="0.22"/>
                            <circle cx="66" cy="62" r="1.1" fill="#fff" opacity="0.21"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 32 58 L 18 50 L 20 68 L 28 66 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.1"/>
                            <path d="M 20 68 L 14 76 L 18 74 L 22 78 Z" fill="url(#crystal-kid-body)" stroke="#76ff03" stroke-width="0.85"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 68 58 L 82 50 L 80 68 L 72 66 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.1"/>
                            <path d="M 80 68 L 86 76 L 82 74 L 78 78 Z" fill="url(#crystal-kid-body)" stroke="#76ff03" stroke-width="0.85"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 40 78 L 36 90 L 44 90 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.1"/>
                            <ellipse cx="40" cy="90" rx="6" ry="2.5" fill="#006064"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 60 78 L 56 90 L 64 90 Z" fill="url(#crystal-kid-body)" stroke="#4dd0e1" stroke-width="1.1"/>
                            <ellipse cx="60" cy="90" rx="6" ry="2.5" fill="#006064"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="36" rx="6" ry="6.8" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="57" cy="36" rx="6" ry="6.8" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="43.5" cy="36.5" rx="3.3000000000000003" ry="3.9439999999999995" fill="url(#crystal-kid-iris)"/>
                            <ellipse cx="57.5" cy="36.5" rx="3.3000000000000003" ry="3.9439999999999995" fill="url(#crystal-kid-iris)"/>
                            <ellipse cx="43.5" cy="36.8" rx="1.6800000000000002" ry="2.38" fill="#050508"/>
                            <ellipse cx="57.5" cy="36.8" rx="1.6800000000000002" ry="2.38" fill="#050508"/>
                            <circle cx="44.5" cy="33.62" r="1.6800000000000002" fill="#fff"/>
                            <circle cx="58.5" cy="33.62" r="1.6800000000000002" fill="#fff"/>
                            <circle cx="40.9" cy="38.38" r="0.72" fill="#b2ebf2" opacity="0.75"/>
                            <circle cx="54.9" cy="38.38" r="0.72" fill="#b2ebf2" opacity="0.75"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 37 36 Q 43 33 49 36" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 51 36 Q 57 33 63 36" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 44 L 50 49 L 55 44" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 48 L 50 43 L 55 48" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>

                <!-- CRYSTAL TEEN — facet warrior -->
                <g id="tm-mascot-evo2-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-teen-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#26c6da;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00838f;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="crystal-teen-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#76ff03;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="crystal-teen-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="crystal-teen-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0.08" />
                        </linearGradient>
                        <radialGradient id="crystal-teen-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="94" rx="28" ry="5" fill="#1a1a1a" opacity="0.22"/>
                        <ellipse cx="50" cy="50" rx="40" ry="38" fill="url(#crystal-teen-aura)"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 46 L 8 28 L 14 50 L 6 58 L 26 56 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 20 42 L 12 34" stroke="#fff" stroke-width="0.8" opacity="0.45"/>
                            <path d="M 18 50 L 10 54" stroke="#76ff03" stroke-width="0.7" opacity="0.4"/>
                            <path d="M 16 38 L 10 30" stroke="#4dd0e1" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 46 L 92 28 L 86 50 L 94 58 L 74 56 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 80 42 L 88 34" stroke="#fff" stroke-width="0.8" opacity="0.45"/>
                            <path d="M 82 50 L 90 54" stroke="#76ff03" stroke-width="0.7" opacity="0.4"/>
                            <path d="M 84 38 L 90 30" stroke="#4dd0e1" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 64 74 L 84 88 L 78 70 L 70 68 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 72 72 L 80 80" stroke="#fff" stroke-width="0.7" opacity="0.4"/>
                            <path d="M 76 76 L 82 84" stroke="#76ff03" stroke-width="0.65" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 50 30 L 68 42 L 68 66 L 50 78 L 32 66 L 32 42 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.7"/>
                            <path d="M 50 30 L 50 78" stroke="#fff" stroke-width="0.65" opacity="0.28"/>
                            <path d="M 32 42 L 68 66" stroke="#fff" stroke-width="0.55" opacity="0.22"/>
                            <path d="M 68 42 L 32 66" stroke="#006064" stroke-width="0.5" opacity="0.25"/>
                            <!-- Spikes -->
                            <path d="M 32 42 L 22 32 L 34 46 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <path d="M 68 42 L 78 32 L 66 46 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <path d="M 50 78 L 44 90 L 56 90 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <path d="M 40 36 L 50 42 L 44 50 Z" fill="url(#crystal-teen-facet)"/>
                            <circle cx="50" cy="54" r="9" fill="url(#crystal-teen-core)"/>
                            <circle cx="50" cy="54" r="4" fill="#fff" opacity="0.55"/>
                            <path d="M 50 18 L 60 28 L 50 34 L 40 28 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 44 26 L 50 20 L 50 30 Z" fill="url(#crystal-teen-facet)"/>
                            <circle cx="38" cy="58" r="1.5" fill="#76ff03" opacity="0.45"/>
                            <circle cx="62" cy="60" r="1.3" fill="#4dd0e1" opacity="0.4"/>
                            <circle cx="36" cy="50" r="1.2" fill="#fff" opacity="0.22"/>
                            <circle cx="64" cy="52" r="1.1" fill="#fff" opacity="0.2"/>
                            <path d="M 46 50 L 50 54 L 54 50" stroke="#76ff03" stroke-width="0.75" fill="none" opacity="0.4"/>
                            <ellipse cx="42" cy="60" rx="2.2" ry="1.5" fill="#fff" opacity="0.17"/>
                            <ellipse cx="58" cy="62" rx="2.2" ry="1.5" fill="#fff" opacity="0.16"/>
                            <circle cx="32" cy="50" r="1.1" fill="#fff" opacity="0.2"/>
                            <circle cx="68" cy="52" r="1.1" fill="#fff" opacity="0.19"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 32 56 L 16 48 L 18 68 L 28 66 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 18 68 L 12 76 L 16 74 L 20 78 Z" fill="url(#crystal-teen-body)" stroke="#76ff03" stroke-width="0.95"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 68 56 L 84 48 L 82 68 L 72 66 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <path d="M 82 68 L 88 76 L 84 74 L 80 78 Z" fill="url(#crystal-teen-body)" stroke="#76ff03" stroke-width="0.95"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 40 78 L 34 92 L 46 92 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <ellipse cx="40" cy="92" rx="7" ry="2.5" fill="#006064"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 60 78 L 54 92 L 66 92 Z" fill="url(#crystal-teen-body)" stroke="#4dd0e1" stroke-width="1.2"/>
                            <ellipse cx="60" cy="92" rx="7" ry="2.5" fill="#006064"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="30" rx="6" ry="6.8" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="57" cy="30" rx="6" ry="6.8" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="43.5" cy="30.5" rx="3.3000000000000003" ry="3.9439999999999995" fill="url(#crystal-teen-iris)"/>
                            <ellipse cx="57.5" cy="30.5" rx="3.3000000000000003" ry="3.9439999999999995" fill="url(#crystal-teen-iris)"/>
                            <ellipse cx="43.5" cy="30.8" rx="1.6800000000000002" ry="2.38" fill="#050508"/>
                            <ellipse cx="57.5" cy="30.8" rx="1.6800000000000002" ry="2.38" fill="#050508"/>
                            <circle cx="44.5" cy="27.62" r="1.6800000000000002" fill="#fff"/>
                            <circle cx="58.5" cy="27.62" r="1.6800000000000002" fill="#fff"/>
                            <circle cx="40.9" cy="32.38" r="0.72" fill="#b2ebf2" opacity="0.75"/>
                            <circle cx="54.9" cy="32.38" r="0.72" fill="#b2ebf2" opacity="0.75"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 37 30 Q 43 27 49 30" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 51 30 Q 57 27 63 30" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 40 L 50 45 L 55 40" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 44 L 50 39 L 55 44" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>

                <!-- CRYSTAL ADULT — Prism Titan -->
                <g id="tm-mascot-evo3-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-adult-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#4dd0e1;stop-opacity:1" />
                            <stop offset="65%" style="stop-color:#00838f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="crystal-adult-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#76ff03;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="crystal-adult-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="crystal-adult-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0.08" />
                        </linearGradient>
                        <radialGradient id="crystal-adult-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="95" rx="32" ry="5" fill="#1a1a1a" opacity="0.26"/>
                        <ellipse cx="50" cy="48" rx="44" ry="42" fill="url(#crystal-adult-aura)"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 26 44 L 4 22 L 12 48 L 2 56 L 24 54 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.4"/>
                            <path d="M 16 38 L 8 30" stroke="#fff" stroke-width="0.85" opacity="0.45"/>
                            <path d="M 14 46 L 6 50" stroke="#76ff03" stroke-width="0.75" opacity="0.4"/>
                            <circle cx="6" cy="28" r="1.5" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 74 44 L 96 22 L 88 48 L 98 56 L 76 54 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.4"/>
                            <path d="M 84 38 L 92 30" stroke="#fff" stroke-width="0.85" opacity="0.45"/>
                            <path d="M 86 46 L 94 50" stroke="#76ff03" stroke-width="0.75" opacity="0.4"/>
                            <circle cx="94" cy="28" r="1.5" fill="#76ff03" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 66 74 L 88 90 L 80 68 L 72 66 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 74 72 L 82 80 L 78 76 L 84 82" stroke="#fff" stroke-width="0.65" opacity="0.35" fill="none"/>
                            <circle cx="86" cy="88" r="2" fill="#76ff03" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 50 24 L 72 38 L 72 68 L 50 84 L 28 68 L 28 38 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="2"/>
                            <path d="M 50 24 L 50 84" stroke="#fff" stroke-width="0.75" opacity="0.3"/>
                            <path d="M 28 38 L 72 68" stroke="#fff" stroke-width="0.6" opacity="0.22"/>
                            <path d="M 72 38 L 28 68" stroke="#006064" stroke-width="0.55" opacity="0.25"/>
                            <path d="M 38 34 L 50 42 L 42 52 Z" fill="url(#crystal-adult-facet)"/>
                            <path d="M 58 36 L 64 48 L 54 46 Z" fill="#fff" opacity="0.22"/>
                            <path d="M 44 58 L 50 64 L 46 72 Z" fill="url(#crystal-adult-facet)" opacity="0.8"/>
                            <circle cx="50" cy="54" r="11" fill="url(#crystal-adult-core)"/>
                            <circle cx="50" cy="54" r="5" fill="#fff" opacity="0.6"/>
                            <path d="M 50 14 L 64 26 L 50 32 L 36 26 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.5"/>
                            <path d="M 42 24 L 50 16 L 50 28 Z" fill="url(#crystal-adult-facet)"/>
                            <path d="M 32 40 L 20 28 L 34 44 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <path d="M 68 40 L 80 28 L 66 44 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1"/>
                            <path d="M 44 48 L 48 48 M 46 46 L 46 50" stroke="#76ff03" stroke-width="0.9" opacity="0.55"/>
                            <circle cx="38" cy="62" r="1.6" fill="#76ff03" opacity="0.45"/>
                            <circle cx="62" cy="64" r="1.4" fill="#4dd0e1" opacity="0.4"/>
                            <circle cx="34" cy="48" r="1.3" fill="#fff" opacity="0.2"/>
                            <circle cx="66" cy="50" r="1.2" fill="#fff" opacity="0.19"/>
                            <path d="M 44 48 L 50 52 L 56 48" stroke="#76ff03" stroke-width="0.8" fill="none" opacity="0.42"/>
                            <ellipse cx="40" cy="58" rx="2.5" ry="1.6" fill="#fff" opacity="0.18"/>
                            <ellipse cx="60" cy="60" rx="2.5" ry="1.6" fill="#fff" opacity="0.17"/>
                            <line x1="50" y1="38" x2="50" y2="44" stroke="#fff" stroke-width="0.6" opacity="0.25"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 28 54 L 10 44 L 12 68 L 24 66 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 12 68 L 6 78 L 10 76 L 14 80 Z" fill="url(#crystal-adult-body)" stroke="#76ff03" stroke-width="1"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 72 54 L 90 44 L 88 68 L 76 66 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <path d="M 88 68 L 94 78 L 90 76 L 86 80 Z" fill="url(#crystal-adult-body)" stroke="#76ff03" stroke-width="1"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 38 84 L 32 96 L 44 96 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <ellipse cx="38" cy="96" rx="8" ry="3" fill="#006064"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 62 84 L 56 96 L 68 96 Z" fill="url(#crystal-adult-body)" stroke="#4dd0e1" stroke-width="1.3"/>
                            <ellipse cx="62" cy="96" rx="8" ry="3" fill="#006064"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="28" rx="5.5" ry="6.2" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="57" cy="28" rx="5.5" ry="6.2" fill="#e0f7fa" stroke="#4dd0e1" stroke-width="1.5"/>
                            <ellipse cx="43.5" cy="28.5" rx="3.0250000000000004" ry="3.5959999999999996" fill="url(#crystal-adult-iris)"/>
                            <ellipse cx="57.5" cy="28.5" rx="3.0250000000000004" ry="3.5959999999999996" fill="url(#crystal-adult-iris)"/>
                            <ellipse cx="43.5" cy="28.8" rx="1.54" ry="2.17" fill="#050508"/>
                            <ellipse cx="57.5" cy="28.8" rx="1.54" ry="2.17" fill="#050508"/>
                            <circle cx="44.5" cy="25.83" r="1.54" fill="#fff"/>
                            <circle cx="58.5" cy="25.83" r="1.54" fill="#fff"/>
                            <circle cx="41.075" cy="30.17" r="0.6599999999999999" fill="#b2ebf2" opacity="0.75"/>
                            <circle cx="55.075" cy="30.17" r="0.6599999999999999" fill="#b2ebf2" opacity="0.75"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 37.5 28 Q 43 25 48.5 28" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 51.5 28 Q 57 25 62.5 28" stroke="#4dd0e1" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 38 L 50 43 L 55 38" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 42 L 50 37 L 55 42" stroke="#4dd0e1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>

                <!-- CRYSTAL MIDDLE AGE — veined colossus -->
                <g id="tm-mascot-evo4-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-mid-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#80cbc4;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#546e7a;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#455a64;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#263238;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="crystal-mid-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ff6d00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#37474f;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="crystal-mid-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#b2ebf2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#006064;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="crystal-mid-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:0.08" />
                        </linearGradient>
                        <radialGradient id="crystal-mid-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ffab40;stop-opacity:0.28" />
                            <stop offset="100%" style="stop-color:#ffab40;stop-opacity:0" />
                        </radialGradient>
                        <linearGradient id="crystal-mid-vein" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffab40;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#e65100;stop-opacity:0.4" />
                        </linearGradient>
                    </defs>
                        <ellipse cx="50" cy="96" rx="30" ry="5" fill="#1a1a1a" opacity="0.24"/>
                        <ellipse cx="50" cy="50" rx="42" ry="40" fill="url(#crystal-mid-aura)" opacity="0.85"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 28 48 L 10 30 L 16 50 L 8 58 L 30 56 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <path d="M 16 44 L 6 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
                            <path d="M 14 50 L 10 54" stroke="#ff6d00" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="7" cy="34" r="1.3" fill="#ff6d00" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 72 48 L 90 30 L 84 50 L 92 58 L 70 56 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <path d="M 84 44 L 94 36" stroke="#fff" stroke-width="0.75" opacity="0.45"/>
                            <path d="M 86 50 L 90 54" stroke="#ff6d00" stroke-width="0.65" opacity="0.4"/>
                            <circle cx="93" cy="34" r="1.3" fill="#ff6d00" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 66 74 L 86 88 L 78 70 L 70 68 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <path d="M 74 72 L 80 78" stroke="url(#crystal-mid-vein)" stroke-width="1.1" opacity="0.65"/>
                            <circle cx="84" cy="86" r="1.8" fill="#ff6d00" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 50 28 L 70 40 L 70 66 L 50 80 L 30 66 L 30 40 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.8"/>
                            <path d="M 50 28 L 50 80" stroke="#fff" stroke-width="0.6" opacity="0.2"/>
                            <path d="M 30 40 L 70 66" stroke="#37474f" stroke-width="0.5" opacity="0.22"/>
                            <!-- Chips & cracks -->
                            <path d="M 36 44 L 32 40 L 38 48 Z" fill="#37474f" stroke="#37474f" stroke-width="0.7"/>
                            <path d="M 62 50 L 66 46 L 60 54 Z" fill="#455a64" stroke="#37474f" stroke-width="0.7"/>
                            <path d="M 44 68 L 40 72 L 46 70 Z" fill="#546e7a" stroke="#37474f" stroke-width="0.65"/>
                            <!-- Amber veins -->
                            <path d="M 34 48 Q 42 52 38 60" stroke="url(#crystal-mid-vein)" stroke-width="1.4" fill="none" opacity="0.75"/>
                            <path d="M 58 44 Q 54 54 60 62" stroke="url(#crystal-mid-vein)" stroke-width="1.2" fill="none" opacity="0.65"/>
                            <path d="M 46 36 Q 50 46 48 56" stroke="url(#crystal-mid-vein)" stroke-width="1" fill="none" opacity="0.55"/>
                            <circle cx="50" cy="54" r="9" fill="url(#crystal-mid-core)" opacity="0.9"/>
                            <circle cx="50" cy="54" r="4" fill="#ffab40" opacity="0.55"/>
                            <path d="M 50 18 L 60 28 L 50 34 L 40 28 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.3"/>
                            <path d="M 44 26 L 50 20 L 50 30 Z" fill="url(#crystal-mid-facet)" opacity="0.7"/>
                            <circle cx="36" cy="58" r="1.5" fill="#ff6d00" opacity="0.4"/>
                            <circle cx="64" cy="60" r="1.3" fill="#78909c" opacity="0.4"/>
                            <circle cx="36" cy="52" r="1.2" fill="#fff" opacity="0.15"/>
                            <circle cx="64" cy="54" r="1.1" fill="#fff" opacity="0.14"/>
                            <path d="M 44 46 L 50 50 L 56 46" stroke="url(#crystal-mid-vein)" stroke-width="0.85" fill="none" opacity="0.5"/>
                            <ellipse cx="42" cy="62" rx="2" ry="1.4" fill="#fff" opacity="0.14"/>
                            <ellipse cx="58" cy="64" rx="2" ry="1.4" fill="#fff" opacity="0.13"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 30 56 L 16 48 L 18 68 L 28 66 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <path d="M 22 52 L 18 48" stroke="url(#crystal-mid-vein)" stroke-width="0.9" opacity="0.5"/>
                            <path d="M 18 68 L 12 76 L 16 74 L 20 78 Z" fill="url(#crystal-mid-body)" stroke="#ff6d00" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 70 56 L 84 48 L 82 68 L 72 66 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <path d="M 78 52 L 82 48" stroke="url(#crystal-mid-vein)" stroke-width="0.9" opacity="0.5"/>
                            <path d="M 82 68 L 88 76 L 84 74 L 80 78 Z" fill="url(#crystal-mid-body)" stroke="#ff6d00" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 40 80 L 34 94 L 46 94 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <ellipse cx="40" cy="94" rx="7" ry="2.5" fill="#37474f"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 60 80 L 54 94 L 66 94 Z" fill="url(#crystal-mid-body)" stroke="#ffab40" stroke-width="1.2"/>
                            <ellipse cx="60" cy="94" rx="7" ry="2.5" fill="#37474f"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="30" rx="5" ry="5.8" fill="#eceff1" stroke="#ffab40" stroke-width="1.5"/>
                            <ellipse cx="57" cy="30" rx="5" ry="5.8" fill="#eceff1" stroke="#ffab40" stroke-width="1.5"/>
                            <ellipse cx="43.5" cy="30.5" rx="2.75" ry="3.364" fill="url(#crystal-mid-iris)"/>
                            <ellipse cx="57.5" cy="30.5" rx="2.75" ry="3.364" fill="url(#crystal-mid-iris)"/>
                            <ellipse cx="43.5" cy="30.8" rx="1.4000000000000001" ry="2.03" fill="#050508"/>
                            <ellipse cx="57.5" cy="30.8" rx="1.4000000000000001" ry="2.03" fill="#050508"/>
                            <circle cx="44.5" cy="27.97" r="1.4000000000000001" fill="#fff"/>
                            <circle cx="58.5" cy="27.97" r="1.4000000000000001" fill="#fff"/>
                            <circle cx="41.25" cy="32.03" r="0.6" fill="#b2ebf2" opacity="0.75"/>
                            <circle cx="55.25" cy="32.03" r="0.6" fill="#b2ebf2" opacity="0.75"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 38 30 Q 43 27 48 30" stroke="#ffab40" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 52 30 Q 57 27 62 30" stroke="#ffab40" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 40 L 50 45 L 55 40" stroke="#ffab40" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 44 L 50 39 L 55 44" stroke="#ffab40" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>

                <!-- CRYSTAL OLD — eternal crystal -->
                <g id="tm-mascot-evo5-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-old-body" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:1" />
                            <stop offset="30%" style="stop-color:#b39ddb;stop-opacity:1" />
                            <stop offset="60%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#311b92;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="crystal-old-core" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
                            <stop offset="35%" style="stop-color:#ea80fc;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7b1fa2;stop-opacity:0" />
                        </radialGradient>
                        <radialGradient id="crystal-old-iris" cx="35%" cy="30%" r="65%">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#4a148c;stop-opacity:1" />
                        </radialGradient>
                        <linearGradient id="crystal-old-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.75" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:0.08" />
                        </linearGradient>
                        <radialGradient id="crystal-old-aura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#ea80fc;stop-opacity:0.38" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                        <ellipse cx="50" cy="98" rx="34" ry="5" fill="#1a1a1a" opacity="0.18"/>
                        <ellipse cx="50" cy="50" rx="46" ry="44" fill="url(#crystal-old-aura)"/>
                        <ellipse cx="50" cy="50" rx="38" ry="36" fill="none" stroke="#ce93d8" stroke-width="1" opacity="0.3"/>
                        <!-- Orbit gems -->
                        <circle cx="22" cy="32" r="4" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="0.9" opacity="0.75"/>
                        <circle cx="78" cy="30" r="3.5" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="0.85" opacity="0.7"/>
                        <circle cx="18" cy="58" r="3" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="0.8" opacity="0.65"/>
                        <circle cx="82" cy="56" r="3.2" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="0.85" opacity="0.68"/>
                        <circle cx="50" cy="14" r="2.8" fill="#ea80fc" opacity="0.6"/>
                        <ellipse cx="50" cy="50" rx="28" ry="26" fill="none" stroke="#b39ddb" stroke-width="0.6" opacity="0.25"/>
                        <g class="tm-animate-wing-left">
                            <path d="M 24 46 L 4 24 L 10 50 L 0 58 L 22 56 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.3" opacity="0.85"/>
                            <path d="M 12 40 L 6 32" stroke="#fff" stroke-width="0.75" opacity="0.4"/>
                            <circle cx="4" cy="28" r="1.4" fill="#ea80fc" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-wing-right">
                            <path d="M 76 46 L 96 24 L 90 50 L 100 58 L 78 56 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.3" opacity="0.85"/>
                            <path d="M 88 40 L 94 32" stroke="#fff" stroke-width="0.75" opacity="0.4"/>
                            <circle cx="96" cy="28" r="1.4" fill="#ea80fc" opacity="0.55"/>
                        </g>
                        <g class="tm-animate-tail">
                            <path d="M 62 70 L 84 86 L 76 66 L 68 64 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.1" opacity="0.8"/>
                            <circle cx="82" cy="84" r="2.2" fill="#ea80fc" opacity="0.65"/>
                        </g>
                        <g class="tm-animate-body">
                            <path d="M 50 26 L 68 38 L 68 64 L 50 76 L 32 64 L 32 38 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.8" opacity="0.92"/>
                            <path d="M 50 26 L 50 76" stroke="#fff" stroke-width="0.65" opacity="0.28"/>
                            <path d="M 32 38 L 68 64" stroke="#e1bee7" stroke-width="0.55" opacity="0.22"/>
                            <path d="M 68 38 L 32 64" stroke="#7b1fa2" stroke-width="0.5" opacity="0.22"/>
                            <path d="M 40 34 L 50 42 L 44 50 Z" fill="url(#crystal-old-facet)"/>
                            <circle cx="50" cy="52" r="12" fill="url(#crystal-old-core)"/>
                            <circle cx="50" cy="52" r="6" fill="#ea80fc" opacity="0.85"/>
                            <circle cx="50" cy="52" r="3" fill="#fff" opacity="0.7"/>
                            <path d="M 50 16 L 62 26 L 50 30 L 38 26 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.4"/>
                            <path d="M 44 24 L 50 18 L 50 28 Z" fill="url(#crystal-old-facet)"/>
                            <circle cx="36" cy="56" r="1.6" fill="#ea80fc" opacity="0.5"/>
                            <circle cx="64" cy="58" r="1.4" fill="#ce93d8" opacity="0.45"/>
                            <circle cx="34" cy="50" r="1.2" fill="#fff" opacity="0.22"/>
                            <circle cx="66" cy="52" r="1.1" fill="#fff" opacity="0.2"/>
                            <path d="M 44 44 L 50 48 L 56 44" stroke="#ea80fc" stroke-width="0.75" fill="none" opacity="0.45"/>
                            <ellipse cx="40" cy="56" rx="2.2" ry="1.5" fill="#fff" opacity="0.2"/>
                            <ellipse cx="60" cy="58" rx="2.2" ry="1.5" fill="#fff" opacity="0.19"/>
                            <line x1="50" y1="36" x2="50" y2="42" stroke="#e1bee7" stroke-width="0.65" opacity="0.35"/>
                        </g>
                        <g class="tm-animate-arm-left">
                            <path d="M 30 52 L 14 44 L 16 66 L 26 64 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.2" opacity="0.9"/>
                            <path d="M 16 66 L 10 74 L 14 72 L 18 76 Z" fill="url(#crystal-old-body)" stroke="#ea80fc" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-arm-right">
                            <path d="M 70 52 L 86 44 L 84 66 L 74 64 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.2" opacity="0.9"/>
                            <path d="M 84 66 L 90 74 L 86 72 L 82 76 Z" fill="url(#crystal-old-body)" stroke="#ea80fc" stroke-width="0.9"/>
                        </g>
                        <g class="tm-animate-leg-left">
                            <path d="M 40 76 L 36 88 L 44 86 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.1" opacity="0.75"/>
                            <ellipse cx="40" cy="88" rx="5" ry="2" fill="#7b1fa2" opacity="0.6"/>
                        </g>
                        <g class="tm-animate-leg-right">
                            <path d="M 60 76 L 56 88 L 64 86 Z" fill="url(#crystal-old-body)" stroke="#ce93d8" stroke-width="1.1" opacity="0.75"/>
                            <ellipse cx="60" cy="88" rx="5" ry="2" fill="#7b1fa2" opacity="0.6"/>
                        </g>
                        <g class="tm-mascot-eye-open">
                            <ellipse cx="43" cy="26" rx="5.5" ry="6.2" fill="#f3e5f5" stroke="#ce93d8" stroke-width="1.5"/>
                            <ellipse cx="57" cy="26" rx="5.5" ry="6.2" fill="#f3e5f5" stroke="#ce93d8" stroke-width="1.5"/>
                            <ellipse cx="43.5" cy="26.5" rx="3.0250000000000004" ry="3.5959999999999996" fill="url(#crystal-old-iris)"/>
                            <ellipse cx="57.5" cy="26.5" rx="3.0250000000000004" ry="3.5959999999999996" fill="url(#crystal-old-iris)"/>
                            <ellipse cx="43.5" cy="26.8" rx="1.54" ry="2.17" fill="#050508"/>
                            <ellipse cx="57.5" cy="26.8" rx="1.54" ry="2.17" fill="#050508"/>
                            <circle cx="44.5" cy="23.83" r="1.54" fill="#fff"/>
                            <circle cx="58.5" cy="23.83" r="1.54" fill="#fff"/>
                            <circle cx="41.075" cy="28.17" r="0.6599999999999999" fill="#b2ebf2" opacity="0.75"/>
                            <circle cx="55.075" cy="28.17" r="0.6599999999999999" fill="#b2ebf2" opacity="0.75"/>
                        </g>
                        <g class="tm-mascot-eye-closed" style="display:none;">
                            <path d="M 37.5 26 Q 43 23 48.5 26" stroke="#ce93d8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                            <path d="M 51.5 26 Q 57 23 62.5 26" stroke="#ce93d8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
                        </g>
                        <path class="tm-mascot-mouth-happy" d="M 45 36 L 50 41 L 55 36" stroke="#ce93d8" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 40 L 50 35 L 55 40" stroke="#ce93d8" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <!-- Integrated accessories (anchor-local art, positioned by layoutMascotAccessory) -->
                <g id="digital_headphones" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <path d="M -14 -6 Q 0 -14 14 -6" fill="none" stroke="#0099cc" stroke-width="3.5" stroke-linecap="round"/>
                        <circle cx="-12" cy="0" r="7" fill="#00b7ff" stroke="#006699" stroke-width="1.5"/>
                        <circle cx="-12" cy="0" r="4" fill="#1a1a1a"/>
                        <circle cx="12" cy="0" r="7" fill="#00b7ff" stroke="#006699" stroke-width="1.5"/>
                        <circle cx="12" cy="0" r="4" fill="#1a1a1a"/>
                    </g>
                </g>
                <g id="pixel_sunglasses" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-17" y="-4" width="14" height="8" rx="1.5" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
                        <rect x="-15" y="-2" width="10" height="4" fill="#00b7ff" opacity="0.55"/>
                        <rect x="3" y="-4" width="14" height="8" rx="1.5" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
                        <rect x="5" y="-2" width="10" height="4" fill="#00b7ff" opacity="0.55"/>
                        <line x1="-3" y1="0" x2="3" y2="0" stroke="#333" stroke-width="1.5"/>
                    </g>
                </g>
                <g id="tech_goggles" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-19" y="-5" width="16" height="10" rx="2.5" fill="#1a1a1a" stroke="#00ff88" stroke-width="1.5"/>
                        <rect x="-17" y="-3" width="12" height="6" fill="#00ff88" opacity="0.35"/>
                        <rect x="3" y="-5" width="16" height="10" rx="2.5" fill="#1a1a1a" stroke="#00ff88" stroke-width="1.5"/>
                        <rect x="5" y="-3" width="12" height="6" fill="#00ff88" opacity="0.35"/>
                        <rect x="-10" y="-8" width="20" height="3" rx="1" fill="#333"/>
                        <line x1="-3" y1="0" x2="3" y2="0" stroke="#00ff88" stroke-width="1.5"/>
                    </g>
                </g>
                <g id="star_crown" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <ellipse cx="0" cy="6" rx="18" ry="3" fill="#ffd700" opacity="0.35"/>
                        <path d="M -16 8 L -12 0 L -8 8 L -4 4 L 0 10 L 4 4 L 8 8 L 12 0 L 16 8 Z" fill="#ffd700" stroke="#ffc107" stroke-width="1"/>
                        <circle cx="0" cy="2" r="2.5" fill="#fff8dc"/>
                    </g>
                </g>
                <g id="party_hat" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <path d="M -12 8 L 0 -18 L 12 8 Z" fill="#ff4081" stroke="#e91e63" stroke-width="1.5"/>
                        <ellipse cx="0" cy="8" rx="14" ry="3" fill="#ff1493"/>
                        <circle cx="0" cy="-14" r="4" fill="#ffd700"/>
                    </g>
                </g>
                <g id="flower_crown" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <ellipse cx="0" cy="4" rx="17" ry="3.5" fill="#90ee90" stroke="#228b22" stroke-width="1"/>
                        <circle cx="-10" cy="2" r="3.5" fill="#ff69b4"/><circle cx="-10" cy="2" r="1.5" fill="#ff1493"/>
                        <circle cx="0" cy="0" r="4" fill="#ffb6c1"/><circle cx="0" cy="0" r="2" fill="#ff4081"/>
                        <circle cx="10" cy="2" r="3.5" fill="#ff1493"/><circle cx="10" cy="2" r="1.5" fill="#ff69b4"/>
                    </g>
                </g>
                <g id="halo" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <ellipse cx="0" cy="0" rx="14" ry="3.5" fill="none" stroke="#ffd700" stroke-width="2.5" opacity="0.95"/>
                        <ellipse cx="0" cy="0" rx="14" ry="3.5" fill="#fff8dc" opacity="0.2"/>
                    </g>
                </g>
                <g id="rainbow_scarf" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <path d="M -18 -2 Q 0 6 18 -2 L 16 4 Q 0 12 -16 4 Z" fill="#ff0000" opacity="0.85"/>
                        <path d="M -17 4 Q 0 12 17 4 L 15 10 Q 0 18 -15 10 Z" fill="#ff7f00" opacity="0.85"/>
                        <path d="M -14 10 Q 0 18 14 10 L 12 16 Q 0 24 -12 16 Z" fill="#0000ff" opacity="0.75"/>
                        <path d="M 10 8 Q 18 14 14 22 Q 8 18 10 8" fill="#4b0082" opacity="0.65"/>
                    </g>
                </g>
                <g id="backpack" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-16" y="-10" width="32" height="28" rx="4" fill="#2c3e50" stroke="#1a1a1a" stroke-width="1.5"/>
                        <rect x="-12" y="-6" width="24" height="20" rx="2" fill="#34495e"/>
                        <rect x="-8" y="-2" width="16" height="12" rx="1" fill="#00b7ff" opacity="0.35"/>
                        <path d="M -10 -10 Q -14 0 -10 10" fill="none" stroke="#555" stroke-width="2.5"/>
                        <path d="M 10 -10 Q 14 0 10 10" fill="none" stroke="#555" stroke-width="2.5"/>
                    </g>
                </g>
                <g id="jetpack" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-22" y="-12" width="14" height="26" rx="4" fill="url(#jetpack-gradient)" stroke="#5d6d7e" stroke-width="1.5"/>
                        <circle cx="-15" cy="-4" r="2.5" fill="#34495e"/>
                        <ellipse class="tm-mascot-thruster-left" cx="-15" cy="16" rx="5" ry="8" fill="url(#flame-gradient)"/>
                        <rect x="8" y="-12" width="14" height="26" rx="4" fill="url(#jetpack-gradient)" stroke="#5d6d7e" stroke-width="1.5"/>
                        <circle cx="15" cy="-4" r="2.5" fill="#34495e"/>
                        <ellipse class="tm-mascot-thruster-right" cx="15" cy="16" rx="5" ry="8" fill="url(#flame-gradient)"/>
                        <rect x="-10" y="-14" width="20" height="5" rx="2" fill="#7f8c8d" stroke="#5d6d7e" stroke-width="1"/>
                    </g>
                </g>
                <g id="shield" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <path d="M 0 -14 Q 12 -12 12 2 Q 12 16 0 20 Q -12 16 -12 2 Q -12 -12 0 -14" fill="#00b7ff" stroke="#006699" stroke-width="1.5"/>
                        <path d="M 0 -10 Q 8 -8 8 2 Q 8 12 0 15 Q -8 12 -8 2 Q -8 -8 0 -10" fill="#fff" opacity="0.25"/>
                        <circle cx="0" cy="2" r="3" fill="#ffd700"/>
                    </g>
                </g>
                <g id="magic_wand" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-1" y="-2" width="2" height="18" rx="1" fill="#ffd700"/>
                        <circle cx="0" cy="-6" r="4" fill="#fff" opacity="0.9"/>
                        <circle cx="-3" cy="-4" r="1" fill="#00b7ff" opacity="0.8"/>
                        <circle cx="3" cy="-8" r="1.2" fill="#ff4081" opacity="0.7"/>
                    </g>
                </g>
                <g id="bubble_wand" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-1" y="0" width="2" height="16" rx="1" fill="#8b4513"/>
                        <circle cx="0" cy="-6" r="5" fill="none" stroke="#00b7ff" stroke-width="1.2" opacity="0.7"/>
                        <circle cx="4" cy="-3" r="3.5" fill="none" stroke="#ff4081" stroke-width="1" opacity="0.6"/>
                    </g>
                </g>
                <g id="book" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-9" y="-6" width="18" height="12" rx="1.5" fill="#8b4513" stroke="#654321" stroke-width="0.8"/>
                        <rect x="-7" y="-4" width="14" height="8" fill="#fff8dc"/>
                        <line x1="-5" y1="-1" x2="5" y2="-1" stroke="#ccc" stroke-width="0.8"/>
                        <line x1="-5" y1="2" x2="4" y2="2" stroke="#ccc" stroke-width="0.8"/>
                    </g>
                </g>
                <g id="umbrella" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <path d="M 0 0 Q -12 -8 0 -14 Q 12 -8 0 0" fill="#3498db" stroke="#2980b9" stroke-width="1.2"/>
                        <line x1="0" y1="0" x2="0" y2="16" stroke="#654321" stroke-width="1.5"/>
                    </g>
                </g>
                <g id="digital_watch" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <rect x="-6" y="-5" width="12" height="10" rx="2" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
                        <rect x="-4.5" y="-3.5" width="9" height="7" fill="#00ff00"/>
                        <rect x="-3" y="-1" width="6" height="1.2" fill="#000"/>
                        <rect x="-4" y="2" width="8" height="1.2" fill="#000"/>
                    </g>
                </g>
                <g id="legend_badge" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <circle cx="0" cy="0" r="8" fill="#ffd700" stroke="#ff8f00" stroke-width="1.5"/>
                        <polygon points="0,-5 2,0 7,0 3,3 5,8 0,5 -5,8 -3,3 -7,0 -2,0" fill="#fff8dc"/>
                    </g>
                </g>
                <g id="power_ring" class="tm-mascot-accessory" style="display: none;">
                    <g class="tm-accessory-art">
                        <ellipse cx="0" cy="0" rx="26" ry="7" fill="none" stroke="#00b7ff" stroke-width="2" opacity="0.55"/>
                        <ellipse cx="0" cy="0" rx="20" ry="5" fill="#00b7ff" opacity="0.12"/>
                        <circle cx="-14" cy="0" r="2" fill="#00b7ff" opacity="0.7"/>
                        <circle cx="0" cy="-1" r="2" fill="#00b7ff" opacity="0.7"/>
                        <circle cx="14" cy="0" r="2" fill="#00b7ff" opacity="0.7"/>
                    </g>
                </g>
            </g>
        </svg>
    `;
    document.body.appendChild(container);

    if (!window.__tmMascotBoundsListener) {
        window.__tmMascotBoundsListener = true;
        cacheMascotScreenInfo();
        const onViewportChange = () => {
            cacheMascotScreenInfo();
            ensureMascotInBounds();
        };
        window.addEventListener('resize', onViewportChange);
        window.addEventListener('scroll', onViewportChange, { passive: true });
        window.visualViewport?.addEventListener('resize', onViewportChange);
        window.visualViewport?.addEventListener('scroll', onViewportChange);
    }

    const screen = cacheMascotScreenInfo();
    const vp = getMascotViewportRect();
    console.log(`[MMS Mascot] Screen ${screen.screenWidth}×${screen.screenHeight} (avail ${screen.availWidth}×${screen.availHeight}), viewport ${Math.round(vp.width)}×${Math.round(vp.height)}`);
    ensureMascotInBounds(container);
    initMascotAccessoryLayers();

    // Move interaction panel out of container to make it fixed
    const interactionPanel = container.querySelector('#tm-mascot-interaction-panel');
    if (!interactionPanel) {
        console.error('[MMS Mascot] Interaction panel not found!');
        return; // Exit early if panel doesn't exist
    }
    
    container.removeChild(interactionPanel);
    document.body.appendChild(interactionPanel);
    
    // Helper function to get buttons (now that panel is moved)
    const getButton = (id) => interactionPanel.querySelector(id) || document.querySelector(id);

    // --- Dodge on fast hover logic ---
    let lastMousePos = { x: 0, y: 0, time: 0 };
    container.addEventListener('mouseenter', () => {
        lastMousePos = { x: 0, y: 0, time: 0 }; // Reset on enter
    });
    container.addEventListener('mousemove', (e) => {
        if (mascotIsDragging || mascotPositionLocked || isMascotFocusQuiet()) return;
        if (lastMousePos.time === 0) {
            lastMousePos = { x: e.clientX, y: e.clientY, time: Date.now() };
            return;
        }

        const now = Date.now();
        const timeDiff = now - lastMousePos.time;

        if (timeDiff < 25) return; // Sample every 25ms

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const speed = distance / timeDiff; // pixels per millisecond

        lastMousePos = { x: e.clientX, y: e.clientY, time: now };

        const speedThreshold = 1.5; // 1500 pixels/second
        if (speed > speedThreshold) {
            triggerDodgeAnimation(config, deltaX, deltaY);
        }
    });


    // Function to show mascot stats in a modal window
    function showMascotStatsModal(config, STORAGE_KEYS) {
        const existingModal = document.getElementById('tm-mascot-stats-modal');
        if (existingModal) existingModal.remove();

        const isEgg = tamagotchiStage === 'egg';
        const hatchProgress = Math.round(getEggHatchProgress());
        const minutesToHatch = getMinutesUntilHatch();
        const stageGr = MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage;
        const charMeta = !isEgg && tamagotchiCharacterType ? MASCOT_CHARACTERS[tamagotchiCharacterType] : null;
        const characterName = typeof getMascotDisplayName === 'function'
            ? getMascotDisplayName()
            : (isEgg
                ? 'Μυστήριο αυγάκι'
                : (charMeta?.name || 'Mascot'));
        const avatarEmoji = isEgg ? '🥚' : (charMeta?.emoji || '🐾');
        const fullness = Math.round(petStats.hunger * 10) / 10;
        const happiness = Math.round(petStats.happiness * 10) / 10;
        const health = Math.round(tamagotchiHealth * 10) / 10;
        const discipline = Math.round(tamagotchiDiscipline * 10) / 10;

        function getCareTip() {
            if (isEgg) {
                return {
                    level: tamagotchiLightsOn ? 'ok' : 'warn',
                    icon: tamagotchiLightsOn ? '🥚' : '❄️',
                    text: tamagotchiLightsOn
                        ? `Όλα καλά — εκκόλαψη σε ~${getMinutesUntilHatch()} λεπτά. Μπορείς να το ζεστάνεις.`
                        : 'Κρύο αυγό! Άνοιξε τα φώτα για ζεστασιά.',
                };
            }
            if (tamagotchiIsDead) {
                return { level: 'danger', icon: '💀', text: 'Το mascot έχει φύγει. Ξεκίνα νέο αυγό από την επαναφορά.' };
            }
            if (tamagotchiHealth < 50) {
                return { level: 'danger', icon: '💊', text: 'Χαμηλή υγεία — πάτα Φάρμακο.' };
            }
            if (tamagotchiPoopCount > 0) {
                return { level: 'warn', icon: '🧹', text: `Χρειάζεται καθάρισμα (${tamagotchiPoopCount}). Πάτα Καθάρισμα ή Τουαλέτα.` };
            }
            if (petStats.hunger < 35) {
                return { level: 'warn', icon: '🍖', text: 'Πεινάει — δώσε Γεύμα ή Σνακ.' };
            }
            if (tamagotchiNeedsPraise) {
                return { level: 'info', icon: '👍', text: 'Θέλει έπαινο — πάτα Έπαινος για πειθαρχία.' };
            }
            if (tamagotchiNeedsScold) {
                return { level: 'info', icon: '👎', text: 'Χρειάζεται επίπληξη για πειθαρχία.' };
            }
            if (petStats.happiness < 40) {
                return { level: 'warn', icon: '💕', text: 'Λυπημένο — χάιδεψέ το ή παίξε μαζί του.' };
            }
            if (tamagotchiLifeMinutes >= TAMA_STAGE_MINUTES.old && tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.death) {
                return { level: 'warn', icon: '⏳', text: 'Μεγάλος σε ηλικία — φρόντισέ τον καλά.' };
            }
            const fav = getActiveMascotPrefs()?.favorite;
            const favLabel = fav ? MASCOT_CARE_ACTION_LABELS_GR[fav] : null;
            if (favLabel) {
                return { level: 'ok', icon: '✨', text: `Όλα καλά! Αγαπημένο: ${favLabel} (bonus χαρά).` };
            }
            return { level: 'ok', icon: '✨', text: 'Όλα καλά! Χάδι ή παιχνίδι για επιπλέον χαρά.' };
        }

        const tip = getCareTip();
        const cleanUrgent = !isEgg && tamagotchiPoopCount > 0;
        const medUrgent = !isEgg && tamagotchiHealth < 50;
        const feedUrgent = !isEgg && petStats.hunger < 35;
        const praiseUrgent = !isEgg && !!tamagotchiNeedsPraise;
        const scoldUrgent = !isEgg && !!tamagotchiNeedsScold;

        const modal = document.createElement('div');
        modal.id = 'tm-mascot-stats-modal';
        modal.innerHTML = `
            <div class="tm-mascot-modal-backdrop"></div>
            <div class="tm-mascot-modal-container" role="dialog" aria-modal="true" aria-labelledby="tm-mascot-care-title">
                <div class="tm-mascot-modal-header">
                    <div class="tm-mascot-header-left">
                        <div class="tm-mascot-avatar" aria-hidden="true">${avatarEmoji}</div>
                        <div class="tm-mascot-header-info">
                            <h2 class="tm-mascot-name" id="tm-mascot-care-title">${characterName}</h2>
                            <p class="tm-mascot-meta">
                                <span class="tm-mascot-stage-pill">${stageGr}</span>
                                <span>${isEgg ? `Εκκόλαψη ~${minutesToHatch} λεπτά` : `Ηλικία ${Math.floor(tamagotchiAge)}`}</span>
                                ${isEgg ? '' : `<span>·</span><span>${Math.round(tamagotchiWeight * 10) / 10}g</span>`}
                            </p>
                        </div>
                    </div>
                    <button type="button" class="tm-mascot-close-btn" id="tm-modal-close" aria-label="Κλείσιμο">✕</button>
                </div>

                <div class="tm-mascot-tip tm-tip-${tip.level}" id="tm-mascot-care-tip">
                    <span class="tm-tip-icon">${tip.icon}</span>
                    <span class="tm-tip-text">${tip.text}</span>
                </div>

                ${isEgg ? `
                <div class="tm-mascot-stats-block">
                    <div class="tm-stat-row" data-stat="hatch">
                        <div class="tm-stat-row-top">
                            <span class="tm-stat-label">🥚 Πρόοδος εκκόλαψης</span>
                            <span class="tm-stat-value" id="tm-egg-hatch-value">${hatchProgress}%</span>
                        </div>
                        <div class="tm-stat-bar">
                            <div class="tm-stat-fill tm-fill-hatch" id="tm-egg-hatch-fill" style="width: ${hatchProgress}%;"></div>
                        </div>
                    </div>
                </div>
                <div class="tm-mascot-actions-section">
                    <h3 class="tm-actions-title">Φροντίδα ωού</h3>
                    <div class="tm-mascot-actions tm-actions-primary">
                        <button type="button" class="tm-action-btn" id="tm-action-egg-warm" title="Ζέστανε το ωό">
                            <span class="tm-action-icon">🔥</span>
                            <span class="tm-action-label">Ζέστανε</span>
                        </button>
                        <button type="button" class="tm-action-btn" id="tm-action-egg-watch" title="Παρακολούθησε το ωό">
                            <span class="tm-action-icon">👀</span>
                            <span class="tm-action-label">Δες το</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-lights ${tamagotchiLightsOn ? '' : 'tm-action-urgent'}" id="tm-action-lights" title="Άνοιγμα/Κλείσιμο φώτων">
                            <span class="tm-action-icon">${tamagotchiLightsOn ? '💡' : '🌙'}</span>
                            <span class="tm-action-label">${tamagotchiLightsOn ? 'Φώτα' : 'Άνοιξε φώτα'}</span>
                        </button>
                    </div>
                </div>
                ` : `
                <div class="tm-mascot-stats-block">
                    <div class="tm-stat-row" data-stat="happiness">
                        <div class="tm-stat-row-top">
                            <span class="tm-stat-label">😊 Ευτυχία</span>
                            <span class="tm-stat-value" id="tm-modal-val-happiness">${happiness}%</span>
                        </div>
                        <div class="tm-stat-bar">
                            <div class="tm-stat-fill tm-fill-happy" id="tm-modal-fill-happiness" style="width: ${petStats.happiness}%;"></div>
                        </div>
                    </div>
                    <div class="tm-stat-row" data-stat="food">
                        <div class="tm-stat-row-top">
                            <span class="tm-stat-label">🍖 Φαγητό</span>
                            <span class="tm-stat-value" id="tm-modal-val-food">${fullness}%</span>
                        </div>
                        <div class="tm-stat-bar">
                            <div class="tm-stat-fill tm-fill-food" id="tm-modal-fill-food" style="width: ${petStats.hunger}%;"></div>
                        </div>
                    </div>
                    <div class="tm-stat-row" data-stat="health">
                        <div class="tm-stat-row-top">
                            <span class="tm-stat-label">❤️ Υγεία</span>
                            <span class="tm-stat-value" id="tm-modal-val-health">${health}%</span>
                        </div>
                        <div class="tm-stat-bar">
                            <div class="tm-stat-fill tm-fill-health" id="tm-modal-fill-health" style="width: ${tamagotchiHealth}%;"></div>
                        </div>
                    </div>
                    <div class="tm-stat-row" data-stat="discipline">
                        <div class="tm-stat-row-top">
                            <span class="tm-stat-label">🎓 Πειθαρχία</span>
                            <span class="tm-stat-value" id="tm-modal-val-discipline">${discipline}%</span>
                        </div>
                        <div class="tm-stat-bar">
                            <div class="tm-stat-fill tm-fill-disc" id="tm-modal-fill-discipline" style="width: ${tamagotchiDiscipline}%;"></div>
                        </div>
                    </div>
                    <div class="tm-mascot-status-chips" id="tm-mascot-status-chips">
                        <span class="tm-status-chip">${tamagotchiPoopCount > 0 ? '💩 ' + tamagotchiPoopCount : '✨ Καθαρό'}</span>
                        <span class="tm-status-chip">${tamagotchiLightsOn ? '💡 Ανοιχτά' : '🌙 Κλειστά'}</span>
                        ${(() => { const inv = getMascotInventoryCounts(STORAGE_KEYS); return `<span class="tm-status-chip" id="tm-mascot-inv-chip">🍖${inv.food} 🍪${inv.treats}</span>`; })()}
                    </div>
                </div>

                <div class="tm-mascot-actions-section">
                    <h3 class="tm-actions-title">Φροντίδα</h3>
                    <div class="tm-mascot-actions tm-actions-primary">
                        <button type="button" class="tm-action-btn tm-action-meal ${feedUrgent ? 'tm-action-urgent' : ''}" id="tm-action-meal" title="Γεύμα (+30 φαγητό)">
                            <span class="tm-action-icon">🍖</span>
                            <span class="tm-action-label">Γεύμα</span>
                            <span class="tm-action-hint">${careFeedHint('+30', 'meal', STORAGE_KEYS)}</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-snack" id="tm-action-snack" title="Σνακ (+φαγητό & χαρά)">
                            <span class="tm-action-icon">🍪</span>
                            <span class="tm-action-label">Σνακ</span>
                            <span class="tm-action-hint">${careFeedHint('+χαρά', 'snack', STORAGE_KEYS)}</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-pet" id="tm-action-pet" title="Χάδι (+15 ευτυχία)">
                            <span class="tm-action-icon">💕</span>
                            <span class="tm-action-label">Χάδι</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-clean ${cleanUrgent ? 'tm-action-urgent' : ''}" id="tm-action-clean" title="Καθάρισμα">
                            <span class="tm-action-icon">🧹</span>
                            <span class="tm-action-label">Καθάρισμα</span>
                            <span class="tm-action-hint">${careCoinHint('Καθαρό', 'clean')}</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-medicine ${medUrgent ? 'tm-action-urgent' : ''}" id="tm-action-medicine" title="Φάρμακο (+20 υγεία)">
                            <span class="tm-action-icon">💊</span>
                            <span class="tm-action-label">Φάρμακο</span>
                            <span class="tm-action-hint">${careCoinHint('+20', 'medicine')}</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-toilet ${cleanUrgent ? 'tm-action-urgent' : ''}" id="tm-action-toilet" title="Τουαλέτα">
                            <span class="tm-action-icon">🚽</span>
                            <span class="tm-action-label">Τουαλέτα</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-praise ${praiseUrgent ? 'tm-action-urgent' : ''}" id="tm-action-praise" title="Έπαινος (+πειθαρχία, +χαρά)">
                            <span class="tm-action-icon">👍</span>
                            <span class="tm-action-label">Έπαινος</span>
                            <span class="tm-action-hint">+πειθαρχία</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-scold ${scoldUrgent ? 'tm-action-urgent' : ''}" id="tm-action-scold" title="Επίπληξη">
                            <span class="tm-action-icon">👎</span>
                            <span class="tm-action-label">Επίπληξη</span>
                        </button>
                    </div>
                </div>

                <div class="tm-mascot-actions-section tm-mascot-settings-row">
                    <div class="tm-mascot-actions tm-actions-compact">
                        <button type="button" class="tm-action-btn tm-action-lights" id="tm-action-lights" title="Φώτα">
                            <span class="tm-action-icon">${tamagotchiLightsOn ? '💡' : '🌙'}</span>
                            <span class="tm-action-label">${tamagotchiLightsOn ? 'Φώτα' : 'Σκοτάδι'}</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-park" id="tm-action-park" title="Σταθμεύσε / απελευθέρωσε">
                            <span class="tm-action-icon">${mascotPositionLocked ? '🔓' : '📌'}</span>
                            <span class="tm-action-label">${mascotPositionLocked ? 'Ελεύθερο' : 'Σταθμεύσε'}</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-focus ${isMascotFocusQuiet() ? 'tm-action-urgent' : ''}" id="tm-action-focus" title="Ήσυχη εστίαση 25′">
                            <span class="tm-action-icon">🎯</span>
                            <span class="tm-action-label">${isMascotFocusQuiet() ? 'Τέλος' : 'Εστίαση'}</span>
                        </button>
                    </div>
                </div>

                <details class="tm-mascot-extra-details">
                    <summary>Παιχνίδια &amp; κόλπα</summary>
                    <div class="tm-mascot-actions tm-actions-secondary">
                        <button type="button" class="tm-action-btn tm-action-play" id="tm-action-play" title="Παίξε μαζί του">
                            <span class="tm-action-icon">🎮</span>
                            <span class="tm-action-label">Παιχνίδι</span>
                        </button>
                        <button type="button" class="tm-action-btn tm-action-bug-game" id="tm-action-bug-game" title="Bug Squish">
                            <span class="tm-action-icon">🐛</span>
                            <span class="tm-action-label">Bug Squish</span>
                        </button>
                    </div>
                    ${typeof getMascotPlayCareSectionHTML === 'function' ? getMascotPlayCareSectionHTML(STORAGE_KEYS) : ''}
                </details>
                `}

                <details class="tm-mascot-danger-details">
                    <summary>Επαναφορά / νέο αυγό</summary>
                    <p class="tm-danger-help">Σβήνει το τρέχον mascot και ξεκινά από την αρχή. Δεν αναιρείται.</p>
                    <p class="tm-danger-help" id="tm-modal-death-counters">${formatMascotDeathCountersLine()}</p>
                    <button type="button" class="tm-action-btn tm-action-kill-restart" id="tm-action-kill-restart" title="Σκοτώνει το τρέχον mascot και ξεκινά νέο αυγό">
                        <span class="tm-action-icon">💀</span>
                        <span class="tm-action-label">Σκότωσε &amp; νέο αυγό</span>
                    </button>
                </details>
            </div>
        `;

        document.body.appendChild(modal);

        // Always refresh styles (v2 care panel)
        document.getElementById('tm-mascot-modal-styles')?.remove();
        document.getElementById('tm-mascot-modal-styles-v2')?.remove();
        const style = document.createElement('style');
        style.id = 'tm-mascot-modal-styles-v2';
        style.textContent = `
            #tm-mascot-stats-modal .tm-mascot-modal-backdrop {
                position: fixed; inset: 0;
                background: rgba(15, 23, 42, 0.45);
                backdrop-filter: blur(6px);
                z-index: 100000;
                animation: tmCareFadeIn 0.2s ease-out;
            }
            #tm-mascot-stats-modal .tm-mascot-modal-container {
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                z-index: 100001;
                width: min(92vw, 440px);
                max-height: min(90vh, 720px);
                overflow-y: auto;
                background: var(--tm-modal-bg, #ffffff);
                color: var(--tm-shop-item-text, #1e293b);
                border-radius: 16px;
                border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
                animation: tmCareSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1);
                font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            }
            #tm-mascot-stats-modal .tm-mascot-modal-container::-webkit-scrollbar { width: 6px; }
            #tm-mascot-stats-modal .tm-mascot-modal-container::-webkit-scrollbar-thumb {
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 35%, #cbd5e1);
                border-radius: 4px;
            }
            #tm-mascot-stats-modal .tm-mascot-modal-header {
                display: flex; justify-content: space-between; align-items: flex-start;
                gap: 12px; padding: 18px 18px 12px;
            }
            #tm-mascot-stats-modal .tm-mascot-header-left {
                display: flex; align-items: center; gap: 12px; min-width: 0;
            }
            #tm-mascot-stats-modal .tm-mascot-avatar {
                width: 52px; height: 52px; flex-shrink: 0;
                border-radius: 14px;
                display: flex; align-items: center; justify-content: center;
                font-size: 28px;
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 14%, var(--tm-shop-item-bg, #f8f9fa));
                border: 1px solid color-mix(in srgb, var(--tm-primary-color, #007bff) 22%, transparent);
            }
            #tm-mascot-stats-modal .tm-mascot-name {
                margin: 0 0 4px; font-size: 1.15rem; font-weight: 700;
                color: var(--tm-shop-item-text, #0f172a); line-height: 1.25;
            }
            #tm-mascot-stats-modal .tm-mascot-meta {
                margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
                font-size: 12px; color: color-mix(in srgb, var(--tm-shop-item-text, #64748b) 80%, #64748b);
            }
            #tm-mascot-stats-modal .tm-mascot-stage-pill {
                display: inline-flex; padding: 2px 8px; border-radius: 999px;
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 12%, transparent);
                color: var(--tm-primary-color, #007bff); font-weight: 600; font-size: 11px;
            }
            #tm-mascot-stats-modal .tm-mascot-close-btn {
                width: 34px; height: 34px; border: none; border-radius: 10px; cursor: pointer;
                background: var(--tm-shop-item-bg, #f1f5f9);
                color: var(--tm-shop-item-text, #334155); font-size: 16px;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s, color 0.15s;
            }
            #tm-mascot-stats-modal .tm-mascot-close-btn:hover {
                background: #fee2e2; color: #b91c1c;
            }
            #tm-mascot-stats-modal .tm-mascot-tip {
                margin: 0 18px 10px; padding: 12px 14px; border-radius: 12px;
                display: flex; align-items: flex-start; gap: 10px;
                font-size: 13px; line-height: 1.4; font-weight: 500;
            }
            #tm-mascot-stats-modal .tm-tip-icon { font-size: 18px; line-height: 1.2; }
            #tm-mascot-stats-modal .tm-tip-ok {
                background: color-mix(in srgb, #22c55e 12%, var(--tm-shop-item-bg, #f8fafc));
                border: 1px solid color-mix(in srgb, #22c55e 28%, transparent); color: #166534;
            }
            #tm-mascot-stats-modal .tm-tip-info {
                background: color-mix(in srgb, var(--tm-primary-color, #3b82f6) 10%, var(--tm-shop-item-bg, #f8fafc));
                border: 1px solid color-mix(in srgb, var(--tm-primary-color, #3b82f6) 25%, transparent);
                color: var(--tm-primary-color, #1d4ed8);
            }
            #tm-mascot-stats-modal .tm-tip-warn {
                background: color-mix(in srgb, #f59e0b 12%, var(--tm-shop-item-bg, #fffbeb));
                border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent); color: #92400e;
            }
            #tm-mascot-stats-modal .tm-tip-danger {
                background: color-mix(in srgb, #ef4444 12%, var(--tm-shop-item-bg, #fef2f2));
                border: 1px solid color-mix(in srgb, #ef4444 30%, transparent); color: #991b1b;
            }
            #tm-mascot-stats-modal .tm-mascot-alerts {
                padding: 0 18px; display: flex; flex-direction: column; gap: 8px;
                margin-bottom: 4px;
            }
            #tm-mascot-stats-modal .tm-mascot-alerts:empty { display: none; margin: 0; }
            #tm-mascot-stats-modal .tm-mascot-alert {
                display: flex; align-items: center; gap: 8px;
                padding: 10px 12px; border-radius: 10px; font-size: 12.5px; font-weight: 500;
            }
            #tm-mascot-stats-modal .tm-alert-warning {
                background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
            }
            #tm-mascot-stats-modal .tm-alert-danger {
                background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
            }
            #tm-mascot-stats-modal .tm-alert-info {
                background: #ecfeff; border: 1px solid #a5f3fc; color: #0e7490;
            }
            #tm-mascot-stats-modal .tm-mascot-stats-block {
                padding: 8px 18px 14px; display: flex; flex-direction: column; gap: 12px;
            }
            #tm-mascot-stats-modal .tm-stat-row-top {
                display: flex; justify-content: space-between; align-items: baseline;
                margin-bottom: 5px; gap: 8px;
            }
            #tm-mascot-stats-modal .tm-stat-label {
                font-size: 12.5px; font-weight: 600;
                color: var(--tm-shop-item-text, #334155);
            }
            #tm-mascot-stats-modal .tm-stat-value {
                font-size: 12px; font-weight: 700;
                color: var(--tm-primary-color, #007bff); font-variant-numeric: tabular-nums;
            }
            #tm-mascot-stats-modal .tm-stat-bar {
                height: 10px; border-radius: 999px; overflow: hidden;
                background: var(--tm-shop-item-bg, #e2e8f0);
            }
            #tm-mascot-stats-modal .tm-stat-fill {
                height: 100%; border-radius: 999px;
                transition: width 0.45s ease;
            }
            #tm-mascot-stats-modal .tm-fill-happy { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
            #tm-mascot-stats-modal .tm-fill-food { background: linear-gradient(90deg, #4ade80, #16a34a); }
            #tm-mascot-stats-modal .tm-fill-health { background: linear-gradient(90deg, #f87171, #dc2626); }
            #tm-mascot-stats-modal .tm-fill-disc { background: linear-gradient(90deg, #a78bfa, #7c3aed); }
            #tm-mascot-stats-modal .tm-fill-hatch { background: linear-gradient(90deg, #2dd4bf, #0d9488); }
            #tm-mascot-stats-modal .tm-mascot-status-chips {
                display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px;
            }
            #tm-mascot-stats-modal .tm-status-chip {
                font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 999px;
                background: var(--tm-shop-item-bg, #f1f5f9);
                color: var(--tm-shop-item-text, #475569);
                border: 1px solid var(--tm-shop-item-border, #e2e8f0);
            }
            #tm-mascot-stats-modal .tm-mascot-actions-section {
                padding: 4px 18px 14px;
            }
            #tm-mascot-stats-modal .tm-actions-title {
                margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.02em;
                text-transform: uppercase; color: color-mix(in srgb, var(--tm-shop-item-text, #64748b) 90%, #64748b);
            }
            #tm-mascot-stats-modal .tm-mascot-actions {
                display: grid; gap: 8px;
            }
            #tm-mascot-stats-modal .tm-actions-primary {
                grid-template-columns: repeat(4, 1fr);
            }
            #tm-mascot-stats-modal .tm-actions-secondary {
                grid-template-columns: repeat(2, 1fr);
            }
            #tm-mascot-stats-modal .tm-actions-compact {
                grid-template-columns: repeat(3, 1fr);
            }
            #tm-mascot-stats-modal .tm-mascot-settings-row {
                padding-top: 0;
            }
            #tm-mascot-stats-modal .tm-actions-compact .tm-action-btn {
                padding: 8px 4px 6px;
            }
            #tm-mascot-stats-modal .tm-actions-compact .tm-action-icon { font-size: 18px; }
            #tm-mascot-stats-modal .tm-actions-compact .tm-action-label { font-size: 11px; }
            #tm-mascot-stats-modal .tm-mascot-extra-details {
                margin: 0 18px 10px; padding: 10px 12px;
                border-radius: 12px; border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: var(--tm-shop-item-bg, #f8fafc);
            }
            #tm-mascot-stats-modal .tm-mascot-extra-details summary {
                cursor: pointer; font-size: 12px; font-weight: 700; color: var(--tm-shop-item-text, #475569);
                list-style: none; display: flex; align-items: center; gap: 6px;
            }
            #tm-mascot-stats-modal .tm-mascot-extra-details summary::-webkit-details-marker { display: none; }
            #tm-mascot-stats-modal .tm-mascot-extra-details summary::before { content: '▸'; font-size: 10px; opacity: 0.7; }
            #tm-mascot-stats-modal .tm-mascot-extra-details[open] summary::before { content: '▾'; }
            #tm-mascot-stats-modal .tm-mascot-extra-details[open] summary { margin-bottom: 10px; }
            #tm-mascot-stats-modal .tm-mascot-extra-details .tm-mascot-actions-section {
                padding: 0 0 8px;
            }
            #tm-mascot-stats-modal .tm-mascot-extra-details .tm-actions-title {
                margin-top: 8px;
            }
            #tm-mascot-stats-modal .tm-action-btn {
                appearance: none; border: 1px solid var(--tm-shop-item-border, #e2e8f0);
                background: var(--tm-shop-item-bg, #f8fafc);
                border-radius: 12px; padding: 10px 6px 8px;
                display: flex; flex-direction: column; align-items: center; gap: 2px;
                cursor: pointer; color: var(--tm-shop-item-text, #1e293b);
                transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
            }
            #tm-mascot-stats-modal .tm-action-btn:hover {
                border-color: color-mix(in srgb, var(--tm-primary-color, #007bff) 45%, #cbd5e1);
                background: color-mix(in srgb, var(--tm-primary-color, #007bff) 8%, #ffffff);
                box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
            }
            #tm-mascot-stats-modal .tm-action-btn:active { transform: scale(0.98); }
            #tm-mascot-stats-modal .tm-action-urgent {
                border-color: color-mix(in srgb, #f59e0b 55%, #e2e8f0);
                background: color-mix(in srgb, #f59e0b 12%, #ffffff);
                box-shadow: 0 0 0 2px color-mix(in srgb, #f59e0b 18%, transparent);
            }
            #tm-mascot-stats-modal .tm-action-icon { font-size: 22px; line-height: 1.2; }
            #tm-mascot-stats-modal .tm-action-label {
                font-size: 12px; font-weight: 700; text-align: center;
            }
            #tm-mascot-stats-modal .tm-action-hint {
                font-size: 10px; font-weight: 500; text-align: center;
                color: color-mix(in srgb, var(--tm-shop-item-text, #94a3b8) 85%, #94a3b8);
            }
            #tm-mascot-stats-modal .tm-mascot-danger-details {
                margin: 4px 18px 18px; padding: 10px 12px;
                border-radius: 12px; border: 1px dashed #fca5a5;
                background: #fffafa;
            }
            #tm-mascot-stats-modal .tm-mascot-danger-details summary {
                cursor: pointer; font-size: 12px; font-weight: 600; color: #b91c1c;
                list-style: none; display: flex; align-items: center; gap: 6px;
            }
            #tm-mascot-stats-modal .tm-mascot-danger-details summary::-webkit-details-marker { display: none; }
            #tm-mascot-stats-modal .tm-mascot-danger-details summary::before {
                content: '▸'; font-size: 10px;
            }
            #tm-mascot-stats-modal .tm-mascot-danger-details[open] summary::before { content: '▾'; }
            #tm-mascot-stats-modal .tm-danger-help {
                margin: 8px 0 10px; font-size: 11px; color: #7f1d1d; line-height: 1.4;
            }
            #tm-mascot-stats-modal .tm-action-kill-restart {
                width: 100%; flex-direction: row; gap: 8px; justify-content: center;
                background: #fef2f2; border-color: #fca5a5; color: #991b1b;
            }
            #tm-mascot-stats-modal .tm-action-kill-restart:hover {
                background: #fee2e2; border-color: #f87171;
            }
            @keyframes tmCareFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes tmCareSlideIn {
                from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @media (max-width: 420px) {
                #tm-mascot-stats-modal .tm-actions-primary {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);

        function refreshCareTip() {
            const tipEl = modal.querySelector('#tm-mascot-care-tip');
            if (!tipEl) return;
            const next = getCareTip();
            tipEl.className = 'tm-mascot-tip tm-tip-' + next.level;
            tipEl.innerHTML = '<span class="tm-tip-icon">' + next.icon + '</span><span class="tm-tip-text">' + next.text + '</span>';
        }

        function updateModalStats() {
            if (tamagotchiStage === 'egg') {
                const progress = Math.round(getEggHatchProgress());
                const fill = modal.querySelector('#tm-egg-hatch-fill');
                const value = modal.querySelector('#tm-egg-hatch-value');
                if (fill) fill.style.width = progress + '%';
                if (value) value.textContent = progress + '%';
                refreshCareTip();
                const lightsBtn = modal.querySelector('#tm-action-lights');
                if (lightsBtn) {
                    lightsBtn.classList.toggle('tm-action-urgent', !tamagotchiLightsOn);
                    const icon = lightsBtn.querySelector('.tm-action-icon');
                    const label = lightsBtn.querySelector('.tm-action-label');
                    if (icon) icon.textContent = tamagotchiLightsOn ? '💡' : '🌙';
                    if (label) label.textContent = tamagotchiLightsOn ? 'Φώτα' : 'Άνοιξε φώτα';
                }
                return;
            }

            const setStat = (fillId, valId, pct) => {
                const fill = modal.querySelector(fillId);
                const val = modal.querySelector(valId);
                const n = Math.round(pct * 10) / 10;
                if (fill) fill.style.width = pct + '%';
                if (val) val.textContent = n + '%';
            };
            setStat('#tm-modal-fill-happiness', '#tm-modal-val-happiness', petStats.happiness);
            setStat('#tm-modal-fill-food', '#tm-modal-val-food', petStats.hunger);
            setStat('#tm-modal-fill-health', '#tm-modal-val-health', tamagotchiHealth);
            setStat('#tm-modal-fill-discipline', '#tm-modal-val-discipline', tamagotchiDiscipline);

            const chips = modal.querySelector('#tm-mascot-status-chips');
            if (chips) {
                const inv = getMascotInventoryCounts(STORAGE_KEYS);
                chips.innerHTML =
                    '<span class="tm-status-chip">' + (tamagotchiPoopCount > 0 ? '💩 ' + tamagotchiPoopCount : '✨ Καθαρό') + '</span>' +
                    '<span class="tm-status-chip">' + (tamagotchiLightsOn ? '💡 Ανοιχτά' : '🌙 Κλειστά') + '</span>' +
                    '<span class="tm-status-chip" id="tm-mascot-inv-chip">🍖' + inv.food + ' 🍪' + inv.treats + '</span>';
            }

            const mealHint = modal.querySelector('#tm-action-meal .tm-action-hint');
            if (mealHint) mealHint.textContent = careFeedHint('+30', 'meal', STORAGE_KEYS);
            const snackHint = modal.querySelector('#tm-action-snack .tm-action-hint');
            if (snackHint) snackHint.textContent = careFeedHint('+χαρά', 'snack', STORAGE_KEYS);
            const parkBtn = modal.querySelector('#tm-action-park');
            if (parkBtn) {
                const icon = parkBtn.querySelector('.tm-action-icon');
                const label = parkBtn.querySelector('.tm-action-label');
                if (icon) icon.textContent = mascotPositionLocked ? '🔓' : '📌';
                if (label) label.textContent = mascotPositionLocked ? 'Ελεύθερο' : 'Σταθμεύσε';
            }
            const focusBtn = modal.querySelector('#tm-action-focus');
            if (focusBtn) {
                focusBtn.classList.toggle('tm-action-urgent', isMascotFocusQuiet());
                const label = focusBtn.querySelector('.tm-action-label');
                if (label) label.textContent = isMascotFocusQuiet() ? 'Τέλος' : 'Εστίαση';
            }
            const lightsBtn = modal.querySelector('#tm-action-lights');
            if (lightsBtn) {
                const icon = lightsBtn.querySelector('.tm-action-icon');
                const label = lightsBtn.querySelector('.tm-action-label');
                if (icon) icon.textContent = tamagotchiLightsOn ? '💡' : '🌙';
                if (label) label.textContent = tamagotchiLightsOn ? 'Φώτα' : 'Σκοτάδι';
            }

            modal.querySelector('#tm-action-meal')?.classList.toggle('tm-action-urgent', petStats.hunger < 35);
            modal.querySelector('#tm-action-clean')?.classList.toggle('tm-action-urgent', tamagotchiPoopCount > 0);
            modal.querySelector('#tm-action-toilet')?.classList.toggle('tm-action-urgent', tamagotchiPoopCount > 0);
            modal.querySelector('#tm-action-medicine')?.classList.toggle('tm-action-urgent', tamagotchiHealth < 50);
            modal.querySelector('#tm-action-praise')?.classList.toggle('tm-action-urgent', !!tamagotchiNeedsPraise);
            modal.querySelector('#tm-action-scold')?.classList.toggle('tm-action-urgent', !!tamagotchiNeedsScold);

            refreshCareTip();
        }

        // Event listeners
        let eggModalInterval = null;
        const closeBtn = modal.querySelector('#tm-modal-close');
        const closeModal = () => {
            if (eggModalInterval) {
                clearInterval(eggModalInterval);
                eggModalInterval = null;
            }
            modal.querySelector('.tm-mascot-modal-backdrop').style.animation = 'tmCareFadeIn 0.2s ease-out reverse';
            modal.querySelector('.tm-mascot-modal-container').style.animation = 'tmCareSlideIn 0.2s ease-out reverse';
            setTimeout(() => modal.remove(), 200);
        };
        closeBtn?.addEventListener('click', () => {
            closeModal();
            
            const byeMessages = MASCOT_MESSAGES.bye;
            if (Math.random() < 0.5) {
                showMascotBubble(byeMessages[Math.floor(Math.random() * byeMessages.length)], 1500);
            }
        });

        if (isEgg) {
            eggModalInterval = setInterval(() => {
                updateModalStats();
                if (tamagotchiStage !== 'egg') {
                    closeModal();
                    showMascotStatsModal(config, STORAGE_KEYS);
                }
            }, 5000);
        }

        modal.querySelector('#tm-action-egg-warm')?.addEventListener('click', () => {
            if (!tamagotchiLightsOn) {
                showMascotBubble(MASCOT_MESSAGES.eggWarmLights, 2000);
                return;
            }
            const warmMessages = MASCOT_MESSAGES.eggWarm;
            showMascotBubble(warmMessages[Math.floor(Math.random() * warmMessages.length)], 2000);
        });

        modal.querySelector('#tm-action-egg-watch')?.addEventListener('click', () => {
            const watchMessages = MASCOT_MESSAGES.eggWatch;
            showMascotBubble(watchMessages[Math.floor(Math.random() * watchMessages.length)], 2000);
        });

        modal.querySelector('#tm-action-kill-restart')?.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const ok = await confirmMascotKillRestart();
            if (!ok) return;
            closeModal();
            await restartTamagotchiAsEgg(config, STORAGE_KEYS, { skipConfirm: true });
        });

        // Click backdrop to close
        modal.querySelector('.tm-mascot-modal-backdrop')?.addEventListener('click', () => {
            closeBtn?.click();
        });

        // Meal button
        modal.querySelector('#tm-action-meal')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (petStats.hunger < 100) {
                const pay = tryPayForMascotCare(STORAGE_KEYS, 'meal', config);
                if (!pay.ok) return;
                const feedMessages = MASCOT_MESSAGES.feed;
                updatePetStats(config, STORAGE_KEYS, 0, 30);
                updateTamagotchiWeight('meal');
                tamagotchiLastFed = Date.now();
                trackDailyStat(config, STORAGE_KEYS, 'feedMascot');
                setMascotState(config, 'eating', 2000);
                if (pay.paidWith === 'food') {
                    showMascotBubble(`Από το απόθεμα! (απομένουν ${pay.remaining})`, 1800);
                } else {
                    showMascotBubble(feedMessages[Math.floor(Math.random() * feedMessages.length)], 2000);
                }
                applyMascotCarePreference('meal', config, STORAGE_KEYS);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                showMascotBubble(mascotMsg('full'), 1500);
            }
        });

        // Snack button
        modal.querySelector('#tm-action-snack')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (petStats.hunger < 95 && petStats.happiness < 95) {
                const pay = tryPayForMascotCare(STORAGE_KEYS, 'snack', config);
                if (!pay.ok) return;
                updatePetStats(config, STORAGE_KEYS, 20, 10);
                updateTamagotchiWeight('snack');
                tamagotchiLastFed = Date.now();
                setMascotState(config, 'eating', 2000);
                if (pay.paidWith === 'treat') {
                    showMascotBubble(`Λιχουδιά από απόθεμα! (${pay.remaining} ακόμα)`, 1800);
                } else {
                    showMascotBubble(mascotMsg('snack'), 2000);
                }
                applyMascotCarePreference('snack', config, STORAGE_KEYS);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                showMascotBubble(mascotMsg('full'), 1500);
            }
        });

        // Pet button
        modal.querySelector('#tm-action-pet')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            updatePetStats(config, STORAGE_KEYS, 15, 0);
            setMascotState(config, 'happy', 2000);
            const petMessages = MASCOT_MESSAGES.pet;
            showMascotBubble(petMessages[Math.floor(Math.random() * petMessages.length)], 1500);
            applyMascotCarePreference('pet', config, STORAGE_KEYS);
            saveTamagotchiData(STORAGE_KEYS);
            updateModalStats();
        });

        // Clean button
        modal.querySelector('#tm-action-clean')?.addEventListener('click', () => {
            if (tamagotchiPoopCount > 0) {
                if (!trySpendMascotCareCoins(STORAGE_KEYS, 'clean', config).ok) return;
                tamagotchiPoopCount = 0;
                tamagotchiNeedsPraise = true;
                updatePetStats(config, STORAGE_KEYS, 10, 0);
                const cleanMessages = MASCOT_MESSAGES.clean;
                showMascotBubble(cleanMessages[Math.floor(Math.random() * cleanMessages.length)], 1500);
                applyMascotCarePreference('clean', config, STORAGE_KEYS);
                updatePoopIndicator();
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                showMascotBubble(mascotMsg('alreadyClean'), 1500);
            }
        });

        // Medicine button
        modal.querySelector('#tm-action-medicine')?.addEventListener('click', () => {
            if (tamagotchiHealth < 100) {
                if (!trySpendMascotCareCoins(STORAGE_KEYS, 'medicine', config).ok) return;
                tamagotchiHealth = Math.min(100, tamagotchiHealth + 20);
                const medicineMessages = MASCOT_MESSAGES.medicine;
                showMascotBubble(medicineMessages[Math.floor(Math.random() * medicineMessages.length)], 2000);
                applyMascotCarePreference('medicine', config, STORAGE_KEYS);
                updateTamagotchiStats(container);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                showMascotBubble(mascotMsg('healthy'), 1500);
            }
        });

        // Toilet button
        modal.querySelector('#tm-action-toilet')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (tamagotchiPoopCount > 0) {
                tamagotchiPoopCount = 0;
                tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 3);
                tamagotchiNeedsPraise = true;
                if (tamagotchiDiscipline > 40 && !tamagotchiToiletTrained) {
                    tamagotchiToiletTrained = true;
                    showMascotBubble(MASCOT_MESSAGES.toiletTrained, 2500);
                } else {
                    showMascotBubble(MASCOT_MESSAGES.toiletRelief, 2000);
                }
                applyMascotCarePreference('toilet', config, STORAGE_KEYS);
                updatePoopIndicator();
                updateToiletNeedIndicator();
                updateTamagotchiStats(container);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                tamagotchiLastPoopTime = Date.now();
                showMascotBubble(MASCOT_MESSAGES.toiletOk, 2000);
                applyMascotCarePreference('toilet', config, STORAGE_KEYS);
                updateToiletNeedIndicator();
                saveTamagotchiData(STORAGE_KEYS);
            }
        });

        // Praise button — always grants discipline (+bonus when needsPraise), with cooldown
        modal.querySelector('#tm-action-praise')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            const now = Date.now();
            if (now - (tamagotchiLastPraise || 0) < 5000) {
                showMascotBubble('Περίμενε λίγο…', 1200);
                return;
            }
            tamagotchiLastPraise = now;
            const bonus = tamagotchiNeedsPraise ? 5 : 0;
            tamagotchiNeedsPraise = false;
            tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 5 + bonus);
            updatePetStats(config, STORAGE_KEYS, 3 + (bonus ? 2 : 0), 0);
            const thanks = MASCOT_MESSAGES.praiseThanks;
            const pool = MASCOT_MESSAGES.praise;
            const msg = bonus && thanks
                ? (Array.isArray(thanks) ? thanks[Math.floor(Math.random() * thanks.length)] : thanks)
                : pool[Math.floor(Math.random() * pool.length)];
            showMascotBubble(msg, 2000);
            setMascotState(config, 'happy', 2000);
            applyMascotCarePreference('praise', config, STORAGE_KEYS);
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
            updateModalStats();
        });

        // Scold button — always applies effect (+bonus when needsScold), with cooldown
        modal.querySelector('#tm-action-scold')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            const now = Date.now();
            if (now - (tamagotchiLastScold || 0) < 5000) {
                showMascotBubble('Περίμενε λίγο…', 1200);
                return;
            }
            tamagotchiLastScold = now;
            const needed = tamagotchiNeedsScold;
            tamagotchiNeedsScold = false;
            if (needed) {
                tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 10);
                updatePetStats(config, STORAGE_KEYS, -8, 0);
                const sorry = MASCOT_MESSAGES.scoldSorry;
                showMascotBubble(
                    Array.isArray(sorry) ? sorry[Math.floor(Math.random() * sorry.length)] : (sorry || '…'),
                    2500,
                );
            } else {
                tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 3);
                updatePetStats(config, STORAGE_KEYS, -5, 0);
                const scoldMessages = MASCOT_MESSAGES.scold;
                showMascotBubble(scoldMessages[Math.floor(Math.random() * scoldMessages.length)], 2000);
            }
            setMascotState(config, 'sad', 2000);
            applyMascotCarePreference('scold', config, STORAGE_KEYS);
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
            updateModalStats();
        });

        // Play button - Launch mini-game
        modal.querySelector('#tm-action-play')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (petStats.happiness < 100) {
                applyMascotCarePreference('play', config, STORAGE_KEYS);
                // Close stats modal and launch game
                modal.remove();
                showMascotMiniGame(config, STORAGE_KEYS);
            } else {
                showMascotBubble(MASCOT_MESSAGES.tired, 1500);
            }
        });

        // Bug Squish mini-game
        modal.querySelector('#tm-action-bug-game')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            closeModal();
            if (typeof window.startBugSquishGame === 'function') {
                window.startBugSquishGame();
            } else if (typeof startBugSquishGame === 'function') {
                startBugSquishGame();
            } else {
                showMascotBubble('Το Bug Squish δεν είναι διαθέσιμο…', 2000);
            }
        });

        // Park / unpark
        modal.querySelector('#tm-action-park')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (mascotPositionLocked && !isMascotFocusQuiet()) {
                setMascotParked(false, null, null, STORAGE_KEYS);
                showMascotBubble('Ξαναπερπατάω!', 1600);
                if (shouldMascotBeRoaming(config)) startRoaming(config);
            } else if (!mascotPositionLocked) {
                const pos = getMascotTranslate();
                setMascotParked(true, pos.x, pos.y, STORAGE_KEYS);
                showMascotBubble('Μένω εδώ!', 1600);
            } else {
                showMascotBubble('Η εστίαση με κρατά εδώ — πάτα Τέλος εστίασης.', 2200);
            }
            updateModalStats();
        });

        // Focus quiet 25'
        modal.querySelector('#tm-action-focus')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (isMascotFocusQuiet()) {
                endMascotFocusQuiet(config, STORAGE_KEYS, { announce: true });
                setMascotState(config, 'idle');
            } else {
                // Brief bubble before silence starts
                showMascotBubble('Ησυχία 25′ — καλή δουλειά!', 1600);
                startMascotFocusQuiet(config, STORAGE_KEYS);
            }
            updateModalStats();
        });

        if (typeof wireMascotPlayCareHandlers === 'function') {
            wireMascotPlayCareHandlers(modal, config, STORAGE_KEYS, { closeModal });
        }

        // Lights button
        modal.querySelector('#tm-action-lights')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            
            tamagotchiLightsOn = !tamagotchiLightsOn;
            tamagotchiLightsManualOverride = true;
            saveTamagotchiData(STORAGE_KEYS);
            applyMascotCarePreference(tamagotchiLightsOn ? 'lights_on' : 'lights_off', config, STORAGE_KEYS);
            
            const lightsBtn = modal.querySelector('#tm-action-lights');
            if (lightsBtn) {
                if (tamagotchiLightsOn) {
                    tamagotchiIsSleeping = false;
                    lightsBtn.querySelector('.tm-action-icon').textContent = '💡';
                    lightsBtn.querySelector('.tm-action-label').textContent = 'Φώτα';
                    showMascotBubble(MASCOT_MESSAGES.lightsOn, 1500);
                    setMascotState(config, 'idle');
                } else {
                    tamagotchiIsSleeping = true;
                    lightsBtn.querySelector('.tm-action-icon').textContent = '🌙';
                    lightsBtn.querySelector('.tm-action-label').textContent = 'Σκοτάδι';
                    showMascotBubble(MASCOT_MESSAGES.goodNight, 1500);
                    stopRoaming(config);
                    setMascotState(config, 'powersave');
                }
            }
            
            updateModalStats();
        });
    }
    
    // Mascot Mini-Game Function
    function showMascotMiniGame(config, STORAGE_KEYS) {
        const gameOverlay = document.createElement('div');
        gameOverlay.id = 'tm-mascot-game-overlay';
        gameOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(5px);
            z-index: 100000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        let score = 0;
        let missed = 0;
        let gameActive = true;
        const maxMissed = 5;
        const gameDuration = 30000; // 30 seconds
        const startTime = Date.now();

        gameOverlay.innerHTML = `
            <div style="text-align: center; color: white; margin-bottom: 20px;">
                <h2 style="font-size: 32px; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">🎮 Πιάσε τα!</h2>
                <div style="display: flex; gap: 30px; justify-content: center; font-size: 20px;">
                    <div>Πόντοι: <span id="tm-game-score" style="color: #4caf50; font-weight: bold;">0</span></div>
                    <div>Χαμένα: <span id="tm-game-missed" style="color: #f44336; font-weight: bold;">0</span>/${maxMissed}</div>
                    <div>Χρόνος: <span id="tm-game-time" style="color: #2196f3; font-weight: bold;">30</span>s</div>
                </div>
            </div>
            <div id="tm-game-area" style="
                position: relative;
                width: 600px;
                height: 400px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                border: 3px solid #fff;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            "></div>
            <button id="tm-game-close" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(244,67,54,0.4);
            ">❌ Κλείσιμο</button>
        `;

        document.body.appendChild(gameOverlay);

        const gameArea = document.getElementById('tm-game-area');
        const scoreDisplay = document.getElementById('tm-game-score');
        const missedDisplay = document.getElementById('tm-game-missed');
        const timeDisplay = document.getElementById('tm-game-time');

        // Falling items
        const items = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍'];

        function spawnItem() {
            if (!gameActive) return;

            const item = document.createElement('div');
            const emoji = items[Math.floor(Math.random() * items.length)];
            item.textContent = emoji;
            item.style.cssText = `
                position: absolute;
                font-size: 40px;
                cursor: pointer;
                top: -50px;
                left: ${Math.random() * 560}px;
                transition: top 3s linear;
                user-select: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            `;

            let caught = false;

            item.addEventListener('click', () => {
                if (!caught && gameActive) {
                    caught = true;
                    score++;
                    scoreDisplay.textContent = score;
                    
                    // Explosion effect
                    item.style.transform = 'scale(2) rotate(360deg)';
                    item.style.opacity = '0';
                    item.style.transition = 'all 0.3s ease-out';
                    
                    setTimeout(() => item.remove(), 300);
                    
                    // Sound effect (simple)
                    playClickSound();
                }
            });

            gameArea.appendChild(item);

            // Animate falling
            setTimeout(() => {
                item.style.top = '450px';
            }, 10);

            // Check if missed
            setTimeout(() => {
                if (!caught && gameActive) {
                    missed++;
                    missedDisplay.textContent = missed;
                    item.remove();
                    
                    if (missed >= maxMissed) {
                        endGame(false);
                    }
                }
            }, 3000);
        }

        function playClickSound() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
                // Silent fail
            }
        }

        function updateTimer() {
            if (!gameActive) return;
            
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, Math.ceil((gameDuration - elapsed) / 1000));
            timeDisplay.textContent = remaining;
            
            if (remaining <= 0) {
                endGame(true);
            } else {
                setTimeout(updateTimer, 100);
            }
        }

        function endGame(timeUp) {
            gameActive = false;
            
            // Calculate rewards
            const happinessGain = Math.min(30, score * 2);
            updatePetStats(config, STORAGE_KEYS, happinessGain, 0);
            
            gameArea.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: white;
                    text-align: center;
                ">
                    <div style="font-size: 80px; margin-bottom: 20px;">${timeUp ? '🎉' : '😅'}</div>
                    <h2 style="font-size: 36px; margin: 0 0 20px 0;">${timeUp ? 'Τέλος Παιχνιδιού!' : 'Τέλειωσαν οι ευκαιρίες!'}</h2>
                    <div style="font-size: 24px; margin-bottom: 10px;">Πόντοι: <span style="color: #4caf50; font-weight: bold;">${score}</span></div>
                    <div style="font-size: 20px; color: #ffeb3b;">Ευτυχία: +${happinessGain}!</div>
                </div>
            `;
            
            const playMessages = MASCOT_MESSAGES.playGame;
            showMascotBubble(playMessages[Math.floor(Math.random() * playMessages.length)], 2000);
            setMascotState(config, 'happy', 3000);
            saveTamagotchiData(STORAGE_KEYS);
            
            // Confetti
            if (typeof window.showConfetti === 'function' && score >= 10) {
                setTimeout(() => window.showConfetti(), 500);
            }
        }

        // Close button
        document.getElementById('tm-game-close').addEventListener('click', () => {
            gameActive = false;
            gameOverlay.remove();
        });

        // Start game
        updateTimer();
        setInterval(() => {
            if (gameActive) spawnItem();
        }, 800);
    }

    // Make modal function globally accessible
    window.showMascotStatsModal = showMascotStatsModal;
    window.showMascotMiniGame = showMascotMiniGame;

    // --- Click / double-click / drag-to-park ---
    const openCareFromClick = (e) => {
        if (e?.target?.closest?.('button')) return;
        if (Date.now() < mascotSuppressClickUntil) return;
        if (typeof handleMascotPlayPrimaryClick === 'function' && handleMascotPlayPrimaryClick(config, STORAGE_KEYS, e)) {
            return;
        }
        showMascotStatsModal(config, STORAGE_KEYS);
        if (!tamagotchiIsDead && tamagotchiStage !== 'egg' && !isMascotFocusQuiet()) {
            const greetingMessages = MASCOT_MESSAGES.greeting;
            const raw = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];
            showMascotBubble(raw, 2000);
        }
    };

    container.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (Date.now() < mascotSuppressClickUntil) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        // Delay single-click open so double-click can cancel it for tricks
        if (mascotClickOpenTimer) {
            clearTimeout(mascotClickOpenTimer);
            mascotClickOpenTimer = null;
            return;
        }
        mascotClickOpenTimer = setTimeout(() => {
            mascotClickOpenTimer = null;
            openCareFromClick(e);
        }, 280);
    });

    container.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        e.preventDefault();
        e.stopPropagation();
        if (mascotClickOpenTimer) {
            clearTimeout(mascotClickOpenTimer);
            mascotClickOpenTimer = null;
        }
        mascotSuppressClickUntil = Date.now() + 400;
        if (typeof playMascotTrickEnhanced === 'function') {
            playMascotTrickEnhanced(config, STORAGE_KEYS);
        } else {
            playMascotTrick(config, STORAGE_KEYS);
        }
    });

    // Drag to park
    container.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('button')) return;
        if (tamagotchiIsDead || tamaCinematicLock) return;
        if (isMascotFocusQuiet()) return; // stay put during focus

        const startX = e.clientX;
        const startY = e.clientY;
        const origin = getMascotTranslate(container);
        let dragging = false;

        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            if (!dragging) {
                if (Math.hypot(dx, dy) < MASCOT_DRAG_THRESHOLD_PX) return;
                dragging = true;
                mascotIsDragging = true;
                mascotDragMoved = true;
                if (mascotClickOpenTimer) {
                    clearTimeout(mascotClickOpenTimer);
                    mascotClickOpenTimer = null;
                }
                stopRoaming(config);
                syncMascotInteractionClasses(container);
                try { container.setPointerCapture(ev.pointerId); } catch (_) {}
            }
            applyMascotPosition(container, origin.x + dx, origin.y + dy);
        };

        const onUp = (ev) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            try { container.releasePointerCapture(ev.pointerId); } catch (_) {}

            if (!dragging) {
                mascotIsDragging = false;
                syncMascotInteractionClasses(container);
                return;
            }

            const pos = getMascotTranslate(container);
            mascotIsDragging = false;
            mascotSuppressClickUntil = Date.now() + 450;
            setMascotParked(true, pos.x, pos.y, STORAGE_KEYS);
            if (!isMascotFocusQuiet()) {
                showMascotBubble('Σταθμεύτηκα!', 1400);
            }
            syncMascotInteractionClasses(container);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    });

    // Meal button (proper meal)
    getButton('#tm-pet-meal-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        if (petStats.hunger < 100) {
            const feedMessages = MASCOT_MESSAGES.feedPanel;
            updatePetStats(config, STORAGE_KEYS, 0, 30);
            updateTamagotchiWeight('meal');
            tamagotchiLastFed = Date.now();
            trackDailyStat(config, STORAGE_KEYS, 'feedMascot');
            setMascotState(config, 'eating', 2000);
            showMascotBubble(feedMessages[Math.floor(Math.random() * feedMessages.length)], 2000);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            const fullMessages = MASCOT_MESSAGES.full;
            showMascotBubble(fullMessages[Math.floor(Math.random() * fullMessages.length)], 1500);
        }
    });

    // Snack button (snacks boost happiness but increase weight)
    getButton('#tm-pet-snack-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        if (petStats.hunger < 95 && petStats.happiness < 95) {
            const snackMessages = MASCOT_MESSAGES.snackPanel;
            updatePetStats(config, STORAGE_KEYS, 20, 10); // Happiness +20, Hunger +10
            updateTamagotchiWeight('snack');
            tamagotchiLastFed = Date.now();
            setMascotState(config, 'eating', 2000);
            showMascotBubble(snackMessages[Math.floor(Math.random() * snackMessages.length)], 2000);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            showMascotBubble(MASCOT_MESSAGES.notHungrySnack, 1500);
        }
    });

    getButton('#tm-pet-pet-btn')?.addEventListener('click', () => {
        if (petStats.happiness < 100) {
            const petMessages = MASCOT_MESSAGES.petPanel;
            trackDailyStat(config, STORAGE_KEYS, 'petMascot'); // Grant XP
            updatePetStats(config, STORAGE_KEYS, 15, 0);
            // Increase discipline when playing
            tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 5);
            const container = document.getElementById('tm-mascot-container');
            if (container) {
                updateTamagotchiStats(container);
                saveTamagotchiData(STORAGE_KEYS);
            }
            setMascotState(config, 'happy', 2000);
            showMascotBubble(petMessages[Math.floor(Math.random() * petMessages.length)], 2000);
        } else {
            const maxHappyMessages = MASCOT_MESSAGES.maxHappy;
            showMascotBubble(maxHappyMessages[Math.floor(Math.random() * maxHappyMessages.length)], 1500);
        }
    });

    getButton('#tm-play-bug-game-btn')?.addEventListener('click', () => {
        startBugSquishGame();
        interactionPanel.style.display = 'none';
    });

    getButton('#tm-play-memory-game-btn')?.addEventListener('click', () => {
        startMemoryGame();
        interactionPanel.style.display = 'none'; // Close panel after starting game
    });
    
    // Tamagotchi actions
    getButton('#tm-pet-clean-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        if (tamagotchiPoopCount > 0) {
            // Clean up poops
            tamagotchiPoopCount = 0;
            tamagotchiLastCleaned = Date.now();
            petStats.happiness = Math.min(100, petStats.happiness + 5); // Happy when cleaned
            const cleanMessages = MASCOT_MESSAGES.cleanPanel;
            showMascotBubble(cleanMessages[Math.floor(Math.random() * cleanMessages.length)], 2000);
            updatePoopIndicator();
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else if (tamagotchiHealth < 100) {
            // General cleaning still helps health
            tamagotchiHealth = Math.min(100, tamagotchiHealth + 5);
            showMascotBubble(mascotMsg('cleanPanel'), 1500);
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            showMascotBubble(mascotMsg('alreadyClean'), 1500);
        }
    });
    
    getButton('#tm-pet-medicine-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        if (tamagotchiIsSick) {
            // Medicine cures sickness
            tamagotchiIsSick = false;
            tamagotchiSickType = 'none';
            tamagotchiHealth = Math.min(100, tamagotchiHealth + 30);
            const medMessages = MASCOT_MESSAGES.medicinePanel;
            showMascotBubble(medMessages[Math.floor(Math.random() * medMessages.length)], 2000);
            updateSickIndicator();
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else if (tamagotchiHealth < 70) {
            // Can still use medicine for general health
            tamagotchiHealth = Math.min(100, tamagotchiHealth + 20);
            showMascotBubble(MASCOT_MESSAGES.feelingBetter, 2000);
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            showMascotBubble(mascotMsg('healthy'), 1500);
        }
    });
    
    // Toilet training button
    getButton('#tm-pet-toilet-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        if (tamagotchiPoopCount > 0) {
            // If there are poops, clean them and train
            tamagotchiPoopCount = 0;
            tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 3);
            if (tamagotchiDiscipline > 40 && !tamagotchiToiletTrained) {
                tamagotchiToiletTrained = true;
                showMascotBubble(MASCOT_MESSAGES.toiletTrained, 2500);
            } else {
                showMascotBubble(MASCOT_MESSAGES.toiletGood, 2000);
            }
            updatePoopIndicator();
            updateToiletNeedIndicator();
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else if (!tamagotchiToiletTrained) {
            // Training even without poops increases discipline
            tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 2);
            if (tamagotchiDiscipline > 40) {
                tamagotchiToiletTrained = true;
                showMascotBubble(MASCOT_MESSAGES.toiletTrained, 2500);
            } else {
                showMascotBubble(MASCOT_MESSAGES.toiletTraining, 2000);
            }
            updateToiletNeedIndicator();
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            // Already toilet trained - using toilet prevents poops
            tamagotchiLastPoopTime = Date.now(); // Reset timer since using toilet
            showMascotBubble(MASCOT_MESSAGES.toiletGood, 2000);
            updateToiletNeedIndicator();
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        }
    });
    
    // Praise button
    getButton('#tm-pet-praise-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        const now = Date.now();
        if (now - tamagotchiLastPraise > 5000) { // Cooldown
            tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 5);
            petStats.happiness = Math.min(100, petStats.happiness + 3);
            tamagotchiLastPraise = now;
            const praiseMessages = MASCOT_MESSAGES.praise;
            showMascotBubble(praiseMessages[Math.floor(Math.random() * praiseMessages.length)], 2000);
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            showMascotBubble(MASCOT_MESSAGES.tooSoon, 1500);
        }
    });
    
    // Scold button
    getButton('#tm-pet-scold-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        const now = Date.now();
        if (now - tamagotchiLastScold > 5000) { // Cooldown
            // Scolding decreases happiness but increases discipline if done right
            petStats.happiness = Math.max(0, petStats.happiness - 5);
            if (tamagotchiPoopCount > 0 || tamagotchiIsSick) {
                // Scolding when there's a problem = good training
                tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 4);
                showMascotBubble(MASCOT_MESSAGES.scoldPanelSorry, 2000);
            } else {
                // Scolding without reason = bad
                tamagotchiDiscipline = Math.max(0, tamagotchiDiscipline - 2);
                tamagotchiCareMistakes++;
                showMascotBubble(MASCOT_MESSAGES.scoldWhy, 2000);
            }
            tamagotchiLastScold = now;
            updateTamagotchiStats(container);
            saveTamagotchiData(STORAGE_KEYS);
        } else {
            showMascotBubble(MASCOT_MESSAGES.tooSoon, 1500);
        }
    });
    
    // Helper function to update lights button appearance
    function updateLightsButtonAppearance() {
        const lightsBtn = getButton('#tm-pet-lights-btn');
        if (!lightsBtn) return;
        
        const iconSpan = lightsBtn.querySelector('.tm-btn-icon');
        const labelSpan = lightsBtn.querySelector('.tm-btn-label');
        
        if (tamagotchiLightsOn) {
            if (iconSpan) iconSpan.textContent = '💡';
            if (labelSpan) labelSpan.textContent = 'Φώτα';
            lightsBtn.style.opacity = '1';
            lightsBtn.style.filter = 'brightness(1.1)';
            lightsBtn.title = 'Κλείσε τα φώτα (θα κοιμηθεί)';
        } else {
            if (iconSpan) iconSpan.textContent = '🌙';
            if (labelSpan) labelSpan.textContent = 'Φώτα';
            lightsBtn.style.opacity = '0.7';
            lightsBtn.style.filter = 'brightness(0.8)';
            lightsBtn.title = 'Άνοιξε τα φώτα (θα ξυπνήσει)';
        }
    }

    getButton('#tm-pet-lights-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        
        // Toggle lights state
        tamagotchiLightsOn = !tamagotchiLightsOn;
        tamagotchiLightsManualOverride = true; // Mark as manual override
        
        if (tamagotchiLightsOn) {
            // Lights ON: Wake up mascot
            tamagotchiIsSleeping = false;
            stopRoaming(config);
            setMascotState(config, 'idle');
            
            // Start roaming after a brief delay
            setTimeout(() => {
                if (tamagotchiLightsOn && !tamagotchiIsSleeping && !isRoaming) {
                    startRoaming(config);
                }
            }, 800);
            
            const wakeMessages = MASCOT_MESSAGES.wake;
            showMascotBubble(wakeMessages[Math.floor(Math.random() * wakeMessages.length)], 2000);
        } else {
            // Lights OFF: Put mascot to sleep
            tamagotchiIsSleeping = true;
            stopRoaming(config);
            setMascotState(config, 'powersave');
            
            const sleepMessages = MASCOT_MESSAGES.sleep;
            showMascotBubble(sleepMessages[Math.floor(Math.random() * sleepMessages.length)], 2000);
        }
        
        // Update button appearance
        updateLightsButtonAppearance();
        
        // Save state
        saveTamagotchiData(STORAGE_KEYS);
        updateTamagotchiStats(container);
    });
    
    // Initialize button appearance on load
    updateLightsButtonAppearance();
    
    getButton('#tm-pet-stats-btn')?.addEventListener('click', () => {
        if (tamagotchiIsDead) {
            showMascotBubble(MASCOT_MESSAGES.dead, 2000);
            return;
        }
        const statsMsg = formatTamagotchiStatsBubble();
        
        // Show in a modal or longer bubble
        showMascotBubble(statsMsg, 8000);
    });
    
    // Death options button - show death screen
    // Close panel button
    getButton('#tm-panel-close-btn')?.addEventListener('click', () => {
        interactionPanel.style.display = 'none';
    });

    getButton('#tm-pet-revive-btn')?.addEventListener('click', () => {
        if (typeof window.STORAGE_KEYS !== 'undefined') {
            showTamagotchiDeathScreen(window.STORAGE_KEYS, true);
        }
    });

    getButton('#tm-pet-kill-restart-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await confirmMascotKillRestart();
        if (ok) {
            await restartTamagotchiAsEgg(config, STORAGE_KEYS, { skipConfirm: true });
        }
    });
    
    // --- Initialization ---
    // Load tamagotchi BEFORE pet stats so early ticks cannot clobber character/life with defaults
    loadTamagotchiData(STORAGE_KEYS);
    loadPetStats(config, STORAGE_KEYS);
    
    // Restore lights state based on loaded data
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) {
        setMascotState(config, 'powersave');
        stopRoaming(config);
    } else {
        // Ensure state is correct if lights are on
        if (tamagotchiLightsOn && !tamagotchiIsSleeping) {
            setMascotState(config, isMascotFocusQuiet() ? 'reading' : 'idle');
        }
    }

    // Restore parked position + focus quiet after load
    restoreMascotParkedPosition();
    scheduleMascotFocusQuietResume(config, STORAGE_KEYS);
    if (mascotPositionLocked || isMascotFocusQuiet()) {
        stopRoaming(config);
    }
    syncMascotInteractionClasses(container);
    if (typeof initMascotPlaySystems === 'function') {
        initMascotPlaySystems(config, STORAGE_KEYS);
    }
    
    // Update lights button appearance on initialization (delayed to ensure DOM is ready)
    setTimeout(() => {
        const lightsBtn = getButton('#tm-pet-lights-btn');
        if (lightsBtn) {
            if (tamagotchiLightsOn) {
                lightsBtn.innerHTML = '💡 Φώτα ανοιχτά';
                lightsBtn.style.opacity = '1';
                lightsBtn.style.filter = 'brightness(1.2)';
                lightsBtn.title = 'Κλείσε τα φώτα (θα κοιμηθεί)';
            } else {
                lightsBtn.innerHTML = '🌙 Φώτα κλειστά';
                lightsBtn.style.opacity = '0.6';
                lightsBtn.style.filter = 'brightness(0.7)';
                lightsBtn.title = 'Άνοιξε τα φώτα (θα ξυπνήσει)';
            }
        }
    }, 200);
    
    initTamagotchiSystem(config, STORAGE_KEYS, container);
    resetIdleTimer(config);

    migrateAccessoryStorage(STORAGE_KEYS);
    
    // --- Load equipped items (deferred to avoid blocking initialization) ---
    setTimeout(() => {
        try {
            applyEquippedMascotAccessories(STORAGE_KEYS);
            const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
            if (equippedItems.length > 0) {
                console.log(`[MMS Mascot] Equipped accessories:`, equippedItems);
            }
        } catch (err) {
            console.error('[MMS Mascot] Error loading equipped items:', err);
        }
    }, 500);
    
    // Check and restore active buffs on page load
    const energizedExpires = GM_getValue(STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES, 0);
    const energizedDuration = GM_getValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`, 0);
    const energizedTimeLeft = energizedExpires - Date.now();
    
    if (energizedTimeLeft > 0 && energizedDuration > 0) {
        console.log(`[MMS] ⚡ Restoring energized buff: ${Math.ceil(energizedTimeLeft/1000)}s remaining`);
        
        // Restore energized state with remaining time (no popup on page load)
        setMascotState(config, 'energized', energizedTimeLeft);
        
        // Recreate particle effects
        const mascotContainer = document.getElementById('tm-mascot-container');
        if (mascotContainer) {
            // Remove any existing particles
            const oldParticles = mascotContainer.querySelector('.tm-electric-particles');
            if (oldParticles) oldParticles.remove();
            
            // Create particle container
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'tm-electric-particles';
            particlesContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 140px;
                height: 140px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 100;
            `;
            
            // Create 8 electric particles
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                const angle = (360 / 8) * i;
                const color = i % 2 === 0 ? '#00bfff' : '#ffd700';
                
                particle.style.cssText = `
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: ${color};
                    border-radius: 50%;
                    box-shadow: 0 0 8px ${color}, 0 0 12px ${color};
                    top: 50%;
                    left: 50%;
                    transform-origin: 0 0;
                    animation: tm-particle-orbit-${i} 2s ease-in-out infinite;
                    opacity: 0.9;
                `;
                
                // Create unique animation for each particle
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes tm-particle-orbit-${i} {
                        0% { 
                            transform: 
                                rotate(${angle}deg) 
                                translateX(50px) 
                                translateY(-3px)
                                scale(1);
                        }
                        50% { 
                            transform: 
                                rotate(${angle + 180}deg) 
                                translateX(60px) 
                                translateY(-3px)
                                scale(1.3);
                        }
                        100% { 
                            transform: 
                                rotate(${angle + 360}deg) 
                                translateX(50px) 
                                translateY(-3px)
                                scale(1);
                        }
                    }
                `;
                document.head.appendChild(style);
                particlesContainer.appendChild(particle);
            }
            
            mascotContainer.appendChild(particlesContainer);
            console.log('[MMS] ⚡ Restored electric particles on page load');
            
            // Remove particles when buff expires
            setTimeout(() => {
                if (particlesContainer && particlesContainer.parentNode) {
                    console.log('[MMS] ⚡ Removing electric particles (buff expired)');
                    particlesContainer.remove();
                }
            }, energizedTimeLeft);
        }
    } else {
        // No active energized buff, proceed with normal state
        updatePetStateByStats(config, STORAGE_KEYS); // Initial state check to start roaming
    }
    
    // Check for double coins buff and add visual effects
    const doubleCoinsExpires = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, 0);
    const doubleCoinsTimeLeft = doubleCoinsExpires - Date.now();
    if (doubleCoinsTimeLeft > 0) {
        const minutesLeft = Math.ceil(doubleCoinsTimeLeft / 60000);
        console.log(`[MMS] 💰 Double coins buff active: ${minutesLeft} min remaining (restored on page load)`);
        
        // Create golden coin particles (no popup on page load)
        const mascotContainer = document.getElementById('tm-mascot-container');
        if (mascotContainer) {
            // Remove any existing coin particles
            const oldCoins = mascotContainer.querySelector('.tm-coin-particles');
            if (oldCoins) oldCoins.remove();
            
            // Create coin particle container
            const coinsContainer = document.createElement('div');
            coinsContainer.className = 'tm-coin-particles';
            coinsContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 150px;
                height: 150px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 99;
            `;
            
            // Create 6 golden coin particles
            for (let i = 0; i < 6; i++) {
                const coin = document.createElement('div');
                const delay = i * 0.3;
                
                coin.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%);
                    border-radius: 50%;
                    box-shadow: 0 0 8px #ffc107, 0 0 15px rgba(255, 215, 0, 0.6);
                    top: 50%;
                    left: 50%;
                    animation: tm-coin-float-${i} 3s ease-in-out infinite;
                    animation-delay: ${delay}s;
                    opacity: 0.85;
                `;
                
                // Create unique floating animation for each coin
                const style = document.createElement('style');
                const startX = -30 + (i * 12);
                const endY = -60 - (Math.random() * 40);
                
                style.textContent = `
                    @keyframes tm-coin-float-${i} {
                        0% { 
                            transform: translate(${startX}px, 0px) scale(0.5);
                            opacity: 0;
                        }
                        20% { 
                            transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                            opacity: 0.85;
                        }
                        50% { 
                            transform: translate(${startX}px, ${endY}px) scale(1.2);
                            opacity: 1;
                        }
                        70% { 
                            transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                            opacity: 0.85;
                        }
                        100% { 
                            transform: translate(${startX}px, 0px) scale(0.5);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
                coinsContainer.appendChild(coin);
            }
            
            mascotContainer.appendChild(coinsContainer);
            console.log('[MMS] 💰 Restored coin particles on page load');
            
            // Remove coins when buff expires
            setTimeout(() => {
                if (coinsContainer && coinsContainer.parentNode) {
                    console.log('[MMS] 💰 Removing coin particles (buff expired)');
                    coinsContainer.remove();
                }
            }, doubleCoinsTimeLeft);
        }
    }

    // Listen for user activity to reset idle timer
    ['mousemove', 'keydown', 'click'].forEach(eventType => { // Pass config to resetIdleTimer
        document.addEventListener(eventType, () => resetIdleTimer(config));
    });

    // Periodic stat decay
    setInterval(() => {
        if (document.getElementById('tm-mascot-container')?.className.includes('sleeping')) return;
        updatePetStats(config, STORAGE_KEYS, -1, -2);
    }, 60 * 1000);

    // Update mascot appearance based on current level on page load
    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    // Update appearance based on Tamagotchi stage (not level)
    updateMascotAppearanceByStage(tamagotchiStage);
    console.log(`[MMS Fun] Interactive Mascot initialized at stage: ${tamagotchiStage}, age: ${Math.floor(tamagotchiAge)} years.`);
    
    // Set initial state and start roaming
    // Note: This must come AFTER buff restoration and accessory loading
    // If no state was set by buffs/accessories, set idle/sad based on stats
    const finalMascotContainer = document.getElementById('tm-mascot-container');
    const currentState = finalMascotContainer?.className || '';
    console.log(`[MMS Mascot] Final state check: "${currentState}"`);
    console.log(`[MMS Mascot] Lights on: ${tamagotchiLightsOn}, Sleeping: ${tamagotchiIsSleeping}`);
    
    // Ensure mascot can move if lights are on and not sleeping
    if (tamagotchiLightsOn && !tamagotchiIsSleeping) {
        // If still no mascot- class (no energized, no biking, no reading), set based on stats
        if (!currentState.includes('mascot-energized') && 
            !currentState.includes('mascot-biking') && 
            !currentState.includes('mascot-reading')) {
            console.log('[MMS Mascot] Setting initial state based on stats...');
            updatePetStateByStats(config, STORAGE_KEYS); // This will set idle/sad and start roaming
        } else {
            console.log('[MMS Mascot] Special state already active, ensuring roaming starts...');
            // Even with special state, ensure roaming starts if lights are on
            setTimeout(() => {
                if (tamagotchiLightsOn && !tamagotchiIsSleeping) {
                    startRoaming(config);
                }
            }, 500);
        }
    } else {
        console.log('[MMS Mascot] Lights are off or sleeping, mascot will not move.');
        setMascotState(config, 'powersave');
    }
}

/** Triggers the "Eureka!" animation for the mascot. */
function triggerEurekaAnimation(config) {
    setMascotState(config, 'eureka', 1500); // Animation lasts 1.5 seconds
    const eurekaMessages = MASCOT_MESSAGES.eureka;
    const msg = eurekaMessages[Math.floor(Math.random() * eurekaMessages.length)];
    showMascotBubble(msg, 1500);
}

/** Triggers the "Double Coins" visual effect for the mascot. */
function triggerDoubleCoinsEffect(config, STORAGE_KEYS, duration) {
    console.log(`[MMS] 💰 Triggering Double Coins Effect for ${duration/1000}s`);
    
    const expires = Date.now() + duration;
    GM_setValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, expires);
    GM_setValue(`${STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES}_duration`, duration);
    
    console.log(`[MMS] Double coins buff stored: expires at ${new Date(expires).toLocaleTimeString()}`);
    
    // Create golden coin particles
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (mascotContainer) {
        console.log('[MMS] 💰 Creating coin particles...');
        
        // Remove any existing coin particles
        const oldCoins = mascotContainer.querySelector('.tm-coin-particles');
        if (oldCoins) oldCoins.remove();
        
        // Create coin particle container
        const coinsContainer = document.createElement('div');
        coinsContainer.className = 'tm-coin-particles';
        coinsContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 150px;
            height: 150px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 99;
        `;
        
        // Create 6 golden coin particles
        for (let i = 0; i < 6; i++) {
            const coin = document.createElement('div');
            const delay = i * 0.3;
            
            coin.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%);
                border-radius: 50%;
                box-shadow: 0 0 8px #ffc107, 0 0 15px rgba(255, 215, 0, 0.6);
                top: 50%;
                left: 50%;
                animation: tm-coin-float-${i} 3s ease-in-out infinite;
                animation-delay: ${delay}s;
                opacity: 0.85;
            `;
            
            // Create unique floating animation for each coin
            const style = document.createElement('style');
            const startX = -30 + (i * 12);
            const endY = -60 - (Math.random() * 40);
            
            style.textContent = `
                @keyframes tm-coin-float-${i} {
                    0% { 
                        transform: translate(${startX}px, 0px) scale(0.5);
                        opacity: 0;
                    }
                    20% { 
                        transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                        opacity: 0.85;
                    }
                    50% { 
                        transform: translate(${startX}px, ${endY}px) scale(1.2);
                        opacity: 1;
                    }
                    70% { 
                        transform: translate(${startX}px, ${endY * 0.4}px) scale(1);
                        opacity: 0.85;
                    }
                    100% { 
                        transform: translate(${startX}px, 0px) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            coinsContainer.appendChild(coin);
        }
        
        mascotContainer.appendChild(coinsContainer);
        console.log(`[MMS] 💰 Created ${coinsContainer.children.length} coin particles`);
        
        // Remove coins when buff expires
        setTimeout(() => {
            if (coinsContainer && coinsContainer.parentNode) {
                console.log('[MMS] 💰 Removing coin particles (buff expired)');
                coinsContainer.remove();
            }
        }, duration);
    }
    
    if (typeof window.showPositiveMessage === 'function') {
        window.showPositiveMessage('💰 Double Coins active for 10 minutes!');
    }
    if (typeof window.createNotification === 'function') {
        window.createNotification('💰 Double Coins active for 10 minutes!', '💰');
    }
    
    // Update buff timers UI - try now and retry if container not ready
    updateBuffTimersUI(config, STORAGE_KEYS);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 500);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 1000);
    
    console.log('[MMS] 💰 Double Coins effect activated successfully!');
}

/** Triggers the "Energized" state for the mascot, providing a temporary XP boost. */
function triggerEnergizedState(config, STORAGE_KEYS, duration) {
    console.log(`[MMS] 🔋 Triggering Energized State for ${duration/1000}s`);
    
    const expires = Date.now() + duration;
    GM_setValue(STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES, expires);
    GM_setValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`, duration); // Store total duration
    
    console.log(`[MMS] Energized buff stored: expires at ${new Date(expires).toLocaleTimeString()}`);

    setMascotState(config, 'energized', duration);
    
    // Create electric particle effects
    const mascotContainer = document.getElementById('tm-mascot-container');
    if (mascotContainer) {
        console.log('[MMS] ⚡ Creating electric particles...');
        
        // Remove any existing particles
        const oldParticles = mascotContainer.querySelector('.tm-electric-particles');
        if (oldParticles) {
            console.log('[MMS] Removing old particles');
            oldParticles.remove();
        }
        
        // Create particle container
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'tm-electric-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 140px;
            height: 140px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 100;
        `;
        
        // Create 8 electric particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const angle = (360 / 8) * i;
            const color = i % 2 === 0 ? '#00bfff' : '#ffd700';
            
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 8px ${color}, 0 0 12px ${color};
                top: 50%;
                left: 50%;
                transform-origin: 0 0;
                animation: tm-particle-orbit-${i} 2s ease-in-out infinite;
                opacity: 0.9;
            `;
            
            // Create unique animation for each particle
            const style = document.createElement('style');
            style.textContent = `
                @keyframes tm-particle-orbit-${i} {
                    0% { 
                        transform: 
                            rotate(${angle}deg) 
                            translateX(50px) 
                            translateY(-3px)
                            scale(1);
                    }
                    50% { 
                        transform: 
                            rotate(${angle + 180}deg) 
                            translateX(60px) 
                            translateY(-3px)
                            scale(1.3);
                    }
                    100% { 
                        transform: 
                            rotate(${angle + 360}deg) 
                            translateX(50px) 
                            translateY(-3px)
                            scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
            particlesContainer.appendChild(particle);
        }
        
        mascotContainer.appendChild(particlesContainer);
        console.log(`[MMS] ⚡ Created ${particlesContainer.children.length} electric particles`);
        
        // Remove particles when buff expires
        setTimeout(() => {
            if (particlesContainer && particlesContainer.parentNode) {
                console.log('[MMS] ⚡ Removing electric particles (buff expired)');
                particlesContainer.remove();
            }
        }, duration);
    } else {
        console.warn('[MMS] Mascot container not found, cannot create particles');
    }
    
    if (typeof window.showPositiveMessage === 'function') {
        window.showPositiveMessage('Mascot is ENERGIZED! +10% XP Boost!');
    }
    if (typeof window.createNotification === 'function') {
        window.createNotification('Mascot is ENERGIZED! +10% XP Boost for 15 minutes!', '⚡');
    }

    // Update buff timers UI - try now and retry if container not ready
    updateBuffTimersUI(config, STORAGE_KEYS);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 500);
    setTimeout(() => updateBuffTimersUI(config, STORAGE_KEYS), 1000);
    
    console.log('[MMS] ⚡ Energized state activated successfully!');
}

/** Updates the UI element for the energized buff timer. */
function updateBuffTimersUI(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-buff-timers-container');
    if (!container) {
        console.warn('[MMS Buff] Buff timers container not found in DOM.');
        return;
    }

    const buffs = [
        {
            id: 'energized',
            key: STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES,
            icon: '⚡',
            title: 'Energized! +10% XP Boost active.',
            color: '#00bfff' // DeepSkyBlue
        },
        {
            id: 'double_coins',
            key: STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES,
            icon: '💰',
            title: 'Double Coins active!',
            color: '#ffc107' // Gold
        }
    ];

    buffs.forEach(buff => {
        const expires = GM_getValue(buff.key, 0);
        const totalDuration = GM_getValue(`${buff.key}_duration`, 0);
        const timeLeft = expires - Date.now();
        let timerEl = document.getElementById(`tm-buff-timer-${buff.id}`);

        if (timeLeft > 0 && totalDuration > 0) {
            // Use smart time formatting if available
            const formattedTime = (typeof window.formatTimeRemaining === 'function') 
                ? window.formatTimeRemaining(timeLeft)
                : `${Math.ceil(timeLeft/1000)}s`;
            
            console.log(`[MMS Buff] ${buff.id} active: ${formattedTime} remaining`);
            
            if (!timerEl) {
                console.log(`[MMS Buff] Creating timer element for ${buff.id}`);
                timerEl = document.createElement('div');
                timerEl.id = `tm-buff-timer-${buff.id}`;
                timerEl.className = 'tm-buff-timer';
                timerEl.innerHTML = `
                    <svg viewBox="0 0 36 36">
                        <path class="tm-buff-timer-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="tm-buff-timer-circle" stroke="${buff.color}" stroke-dasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span class="tm-buff-timer-icon">${buff.icon}</span>
                `;
                container.appendChild(timerEl);
            }

            // Update tooltip with smart formatting
            timerEl.title = `${buff.title} (${formattedTime} remaining)`;

            const progress = (timeLeft / totalDuration) * 100;
            const circle = timerEl.querySelector('.tm-buff-timer-circle');
            if (circle) {
            circle.style.strokeDasharray = `${progress}, 100`;
            }

        } else {
            if (timerEl) {
                timerEl.remove();
            }
            // If the buff just expired, check if the mascot state needs updating
            if (buff.id === 'energized') {
                const mascotContainer = document.getElementById('tm-mascot-container');
                if (mascotContainer && mascotContainer.classList.contains('mascot-energized')) {
                    // Need STORAGE_KEYS from window scope
                    if (typeof window.STORAGE_KEYS !== 'undefined') {
                        updatePetStateByStats(config, window.STORAGE_KEYS, true); // Force revert from temp state
                    }
                }
            }
        }
    });
}


/** Fetches weather and updates the mascot's appearance. Runs once per session. */
function fetchWeatherAndReact(config) {
    if (!config || !config.interactiveMascotEnabled) return;

    // Use a session flag to prevent multiple fetches
    if (sessionStorage.getItem('tm_weather_fetched')) return;

    // Athens coordinates (hardcoded)
    const lat = 37.9838;
    const lon = 23.7278;
    
    console.log(`[MMS Weather] Fetching weather for Athens (${lat}, ${lon})...`);

    // Fetch weather using Athens coordinates
                GM_xmlhttpRequest({
                    method: 'GET',
        url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code&timezone=auto`,
                    onload: function(weatherResponse) {
            console.log('[MMS Weather] Mascot weather response received');
                        try {
                            const weatherData = JSON.parse(weatherResponse.responseText);
                            const weatherCode = weatherData.current.weather_code;
                console.log(`[MMS Weather] Mascot weather code: ${weatherCode}`);
                            sessionStorage.setItem('tm_weather_fetched', 'true');

                            // Weather codes: 0-3 are generally clear/sunny. 51-99 are rainy/snowy.
                            if (weatherCode >= 0 && weatherCode <= 3) {
                    const sunnyMessages = MASCOT_MESSAGES.sunny;
                                setMascotState(config, 'sunny', 120000); // Show for 2 minutes
                    showMascotBubble(sunnyMessages[Math.floor(Math.random() * sunnyMessages.length)], 3000);
                            } else if (weatherCode >= 51 && weatherCode <= 99) {
                    const rainyMessages = MASCOT_MESSAGES.rainy;
                                setMascotState(config, 'rainy', 120000); // Show for 2 minutes
                    showMascotBubble(rainyMessages[Math.floor(Math.random() * rainyMessages.length)], 3000);
                            }
                        } catch (e) {
                console.error('[MMS Weather] Failed to parse mascot weather data:', e);
                        }
                    },
                    onerror: function(error) {
            console.error('[MMS Weather] Failed to fetch mascot weather:', error);
        }
    });
}

function initMascotPageReactions(config) {
    if (!config || !config.interactiveMascotEnabled) return;

    // Check for a success message
    const successMessage = document.querySelector('.rnr-message');
    if (successMessage && successMessage.offsetParent !== null) { // Check if it's visible
        const successMessages = MASCOT_MESSAGES.success;
        setMascotState(config, 'happy', 3000);
        showMascotBubble(successMessages[Math.floor(Math.random() * successMessages.length)], 2000);
    }

    // Check for an error message
    const errorMessage = document.querySelector('.rnr-error');
    if (errorMessage && errorMessage.offsetParent !== null) {
        const errorMessages = MASCOT_MESSAGES.error;
        setMascotState(config, 'sad', 3000);
        showMascotBubble(errorMessages[Math.floor(Math.random() * errorMessages.length)], 2000);
    }
}

// Update mascot appearance based on Tamagotchi stage (replaces level-based evolution)
function updateMascotAppearanceByStage(stage) {
    console.log(`[MMS Mascot] 🔄 Updating mascot appearance for stage: ${stage}, character: ${tamagotchiCharacterType}...`);

    const eggSprite = document.getElementById('tm-mascot-base');
    const allCharacterTypes = TAMA_CHARACTER_TYPES;
    const allStages = ['base', 'baby', 'evo1', 'evo2', 'evo3', 'evo4', 'evo5'];

    allStages.forEach((stageId) => {
        allCharacterTypes.forEach((charType) => {
            setSvgSpriteVisible(document.getElementById(`tm-mascot-${stageId}-${charType}`), false);
        });
        setSvgSpriteVisible(document.getElementById(`tm-mascot-${stageId}`), false);
    });
    setSvgSpriteVisible(eggSprite, false);

    if (stage === 'egg') {
        setSvgSpriteVisible(eggSprite, true);
        const robot = document.querySelector('.tm-mascot-robot');
        if (robot) {
            TAMA_CHARACTER_TYPES.forEach((charType) => robot.classList.remove(`mascot-char-${charType}`));
            robot.classList.remove('mascot-baby', 'mascot-kid', 'mascot-teen', 'mascot-adult', 'mascot-middleage', 'mascot-old', 'mascot-child');
            robot.classList.add('mascot-egg');
        }
        console.log('[MMS Mascot] ✅ Updated to EGG stage');
        if (typeof window.STORAGE_KEYS !== 'undefined') {
            applyEquippedMascotAccessories(window.STORAGE_KEYS, 'egg');
        } else {
            updateMascotAccessoryLayout('egg');
        }
        return;
    }

    const previewCharacter = tamagotchiCharacterType && tamagotchiCharacterType !== 'none'
        ? tamagotchiCharacterType
        : 'dragon';
    let stageId = '';

    switch (stage) {
        case 'baby': stageId = 'baby'; break;
        case 'kid': stageId = 'evo1'; break;
        case 'teen': stageId = 'evo2'; break;
        case 'adult': stageId = 'evo3'; break;
        case 'middleage': stageId = 'evo4'; break;
        case 'old': stageId = 'evo5'; break;
        default: stageId = 'baby';
    }

    const element = document.getElementById(`tm-mascot-${stageId}-${previewCharacter}`);
    if (element) {
        setSvgSpriteVisible(element, true);
        console.log(`[MMS Mascot] ✅ Updated to ${stage.toUpperCase()} stage as ${previewCharacter.toUpperCase()}`);
    } else {
        console.warn(`[MMS Mascot] ⚠️ Character element not found: tm-mascot-${stageId}-${previewCharacter}. Using fallback.`);
        setSvgSpriteVisible(document.getElementById(`tm-mascot-${stageId}`), true);
    }

    if (typeof window.STORAGE_KEYS !== 'undefined') {
        applyEquippedMascotAccessories(window.STORAGE_KEYS, stage);
    } else {
        updateMascotAccessoryLayout(stage);
    }
    requestAnimationFrame(() => updateMascotAccessoryLayout(stage));

    const robot = document.querySelector('.tm-mascot-robot');
    if (robot) {
        robot.classList.remove('mascot-baby', 'mascot-child', 'mascot-adult', 'mascot-egg', 'mascot-teen', 'mascot-middleage', 'mascot-old');
        allCharacterTypes.forEach((charType) => {
            robot.classList.remove(`mascot-char-${charType}`);
        });
        robot.classList.add(`mascot-${stage}`);
        robot.classList.add(`mascot-char-${previewCharacter}`);
    }
}

// Legacy function - now does nothing (level-based evolution disabled)
function updateMascotAppearanceByLevel(level) {
    // Level-based evolution is disabled - mascot now evolves by age/stage only
    console.log(`[MMS Mascot] ⚠️ Level-based evolution disabled. Mascot evolves by age/stage only.`);
}

// Make functions globally accessible for external scripts
window.getAccessoryElement = getAccessoryElement;
window.getShopAccessoryCatalog = getShopAccessoryCatalog;
window.normalizeAccessoryId = normalizeAccessoryId;
window.equipMascotAccessory = equipMascotAccessory;
window.unequipMascotAccessory = unequipMascotAccessory;
window.toggleMascotAccessory = toggleMascotAccessory;
window.applyEquippedMascotAccessories = applyEquippedMascotAccessories;
window.migrateAccessoryStorage = migrateAccessoryStorage;
window.updateMascotAccessoryLayout = updateMascotAccessoryLayout;
window.getMascotStageAnchors = getMascotStageAnchors;
window.resolveMascotDynamicAnchors = resolveMascotDynamicAnchors;
window.MASCOT_ACCESSORY_CATALOG = MASCOT_ACCESSORY_CATALOG;
window.updateMascotAppearanceByLevel = updateMascotAppearanceByLevel; // Legacy - disabled
window.restartTamagotchiAsEgg = restartTamagotchiAsEgg;
window.cancelTamagotchiCinematics = cancelTamagotchiCinematics;
window.showMascotExecutionCinematic = showMascotExecutionCinematic;
window.confirmMascotKillRestart = confirmMascotKillRestart;
window.previewMascotStage = previewMascotStage;
window.clearMascotStagePreview = clearMascotStagePreview;
window.debugSetMascotCharacter = debugSetMascotCharacter;
window.debugKillTamagotchiNatural = debugKillTamagotchiNatural;
window.getMascotCharacterType = getMascotCharacterType;
window.MASCOT_CHARACTERS = MASCOT_CHARACTERS;
window.TAMA_CHARACTER_TYPES = TAMA_CHARACTER_TYPES;
window.updateMascotAppearanceByStage = updateMascotAppearanceByStage;
window.setMascotState = setMascotState;
window.setMascotMood = setMascotMood;
window.notifyMascotWorkEvent = notifyMascotWorkEvent;
window.getMascotCareCoinCost = getMascotCareCoinCost;
window.trySpendMascotCareCoins = trySpendMascotCareCoins;
window.applyMascotCarePreference = applyMascotCarePreference;
window.applyMascotShopCareEffect = applyMascotShopCareEffect;
window.getMascotInventoryCounts = getMascotInventoryCounts;
window.tryPayForMascotCare = tryPayForMascotCare;
window.setMascotParked = setMascotParked;
window.startMascotFocusQuiet = startMascotFocusQuiet;
window.endMascotFocusQuiet = endMascotFocusQuiet;
window.playMascotTrick = playMascotTrick;
window.showMascotBubble = showMascotBubble;
window.MASCOT_MESSAGES = MASCOT_MESSAGES;
window.mascotMsg = mascotMsg;
window.mascotMsgFmt = mascotMsgFmt;
window.mascotRepairMsgs = mascotRepairMsgs;
window.mascotRepairOpinion = mascotRepairOpinion;
window.mascotRepairIsUrgent = mascotRepairIsUrgent;
window.parseRepairStatusMenu = parseRepairStatusMenu;
window.getRepairTotalAmountElement = getRepairTotalAmountElement;
window.getRepairTotalAmountValue = getRepairTotalAmountValue;
window.parseRepairPriceAmount = parseRepairPriceAmount;
window.mascotRepairPriceOpinion = mascotRepairPriceOpinion;
window.initMascotRepairPriceComments = initMascotRepairPriceComments;
window.updatePetStats = updatePetStats;
window.triggerEurekaAnimation = triggerEurekaAnimation;
window.triggerEnergizedState = triggerEnergizedState;
window.triggerDoubleCoinsEffect = triggerDoubleCoinsEffect;
window.updateBuffTimersUI = updateBuffTimersUI;
// Note: showMascotStatsModal is exported inside initInteractiveMascot function