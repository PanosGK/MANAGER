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

    for (const child of flipper.children) {
        if (!child.id?.startsWith('tm-mascot-')) continue;
        if (child.id === 'tm-mascot-acc-back' || child.id === 'tm-mascot-acc-front') continue;
        if (child.style.display === 'none') continue;
        const cs = window.getComputedStyle(child);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        return child;
    }
    return document.getElementById('tm-mascot-base');
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
        name: 'Dragon', nameGr: 'Δράκος',
        emoji: '🐉', color: '#1de9b6', rarity: 'Legendary', rarityGr: 'Θρύλος',
        element: 'Fire & Scale', elementGr: 'Φωτιά & Λέπιδα',
        description: 'Ancient guardian of mystical realms',
        descriptionGr: 'Αρχαίος φύλακας μυστικών κόσμων',
        lore: 'Born from volcanic energy, this dragon carries the wisdom of ages and the power of flame.',
        loreGr: 'Γεννήθηκε από ηφαιστειακή ενέργεια — κουβαλά τη σοφία των αιώνων και τη δύναμη της φλόγας.',
        traits: ['🔥 Fire Breath', '🛡️ Armored Scales', '✨ Ancient Magic'],
        traitsGr: ['🔥 Φωτιά', '🛡️ Θωρακισμένα λέπια', '✨ Αρχαία μαγεία']
    },
    robot: {
        name: 'Robot', nameGr: 'Ρομπότ',
        emoji: '🤖', color: '#00b7ff', rarity: 'Epic', rarityGr: 'Επικό',
        element: 'Tech & Code', elementGr: 'Τεχνολογία & Κώδικας',
        description: 'Advanced AI from the digital frontier',
        descriptionGr: 'Προηγμένη τεχνητή νοημοσύνη από τον ψηφιακό κόσμο',
        lore: 'Forged in silicon and lightning, this mechanical marvel evolves through code and creativity.',
        loreGr: 'Φτιαγμένο από πυρίτιο και αστραπές — εξελίσσεται με κώδικα και φαντασία.',
        traits: ['⚡ Electric Core', '🔧 Self-Repair', '💾 Data Mind'],
        traitsGr: ['⚡ Ηλεκτρική καρδιά', '🔧 Αυτοεπισκευή', '💾 Νους δεδομένων']
    },
    slime: {
        name: 'Slime', nameGr: 'Σλίμ',
        emoji: '🟢', color: '#76ff03', rarity: 'Rare', rarityGr: 'Σπάνιο',
        element: 'Liquid & Bounce', elementGr: 'Υγρό & Αναπήδημα',
        description: 'Adorable gelatinous life form',
        descriptionGr: 'Αξιολάτρευτη ζελατινώδης μορφή ζωής',
        lore: 'Created from pure joy and laughter, this bouncy friend absorbs happiness from its surroundings.',
        loreGr: 'Γεννημένο από χαρά και γέλιο — απορροφά την ευτυχία γύρω του.',
        traits: ['💧 Shape-Shift', '🎈 Bounce Back', '😊 Joy Aura'],
        traitsGr: ['💧 Αλλάζει σχήμα', '🎈 Αναπηδάει', '😊 Αύρα χαράς']
    },
    plant: {
        name: 'Plant Spirit', nameGr: 'Πνεύμα φυτού',
        emoji: '🌱', color: '#4caf50', rarity: 'Rare', rarityGr: 'Σπάνιο',
        element: 'Nature & Growth', elementGr: 'Φύση & Ανάπτυξη',
        description: 'Guardian of forests and life',
        descriptionGr: 'Φύλακας δασών και ζωής',
        lore: 'Sprouted from the World Tree, this spirit nurtures all living things with ancient earth magic.',
        loreGr: 'Βλάστησε από το Παγκόσμιο Δέντρο — τρέφει τα πλάσματα με γη και μαγεία.',
        traits: ['🌿 Photosynthesis', '🌸 Bloom Power', '🌳 Nature Bond'],
        traitsGr: ['🌿 Φωτοσύνθεση', '🌸 Άνθηση', '🌳 Δέσιμο με τη φύση']
    },
    ghost: {
        name: 'Ghost', nameGr: 'Φάντασμα',
        emoji: '👻', color: '#b39ddb', rarity: 'Epic', rarityGr: 'Επικό',
        element: 'Spirit & Shadow', elementGr: 'Πνεύμα & Σκιά',
        description: 'Ethereal being from beyond',
        descriptionGr: 'Αιθέριο πλάσμα από το πέρα',
        lore: 'Neither living nor dead, this playful spirit phases between dimensions, seeking friendship.',
        loreGr: 'Ούτε ζωντανό ούτε νεκρό — παίζει ανάμεσα στις διαστάσεις ψάχνοντας παρέα.',
        traits: ['👁️ Invisibility', '✨ Phase Through', '🌙 Night Vision'],
        traitsGr: ['👁️ Αόρατο', '✨ Περνάει μέσα', '🌙 Νυχτερινή όραση']
    },
    cat: {
        name: 'Mystic Cat', nameGr: 'Μυστική γάτα',
        emoji: '🐱', color: '#ff6090', rarity: 'Rare', rarityGr: 'Σπάνιο',
        element: 'Luck & Mischief', elementGr: 'Τύχη & Σκανταλιά',
        description: 'Feline of nine lives and infinite curiosity',
        descriptionGr: 'Γάτα με εννέα ζωές και ατελείωτη περιέργεια',
        lore: 'Blessed by moon goddesses, this cat walks between worlds, bringing fortune and mystery.',
        loreGr: 'Ευλογημένη από τη Σελήνη — περπατά ανάμεσα στους κόσμους φέρνοντας τύχη.',
        traits: ['🍀 Lucky Charm', '🌙 Night Hunter', '😼 Nine Lives'],
        traitsGr: ['🍀 Ταλισμαν τύχης', '🌙 Νυχτερινός κυνηγός', '😼 Εννέα ζωές']
    },
    phoenix: {
        name: 'Phoenix', nameGr: 'Φοίνικας',
        emoji: '🔥', color: '#ff6d00', rarity: 'Legendary', rarityGr: 'Θρύλος',
        element: 'Flame & Rebirth', elementGr: 'Φλόγα & Αναγέννηση',
        description: 'Immortal firebird of legends',
        descriptionGr: 'Αθάνατο πουλί της φωτιάς από τους μύθους',
        lore: 'Born from sacred flames, this majestic bird rises eternal, symbolizing hope and renewal.',
        loreGr: 'Γεννημένος από ιερές φλόγες — αναγεννιέται αιώνια, σύμβολο ελπίδας.',
        traits: ['🔥 Eternal Flame', '✨ Rebirth', '☀️ Solar Power'],
        traitsGr: ['🔥 Αιώνια φλόγα', '✨ Αναγέννηση', '☀️ Ηλιακή δύναμη']
    },
    crystal: {
        name: 'Crystal Golem', nameGr: 'Κρυστάλλινο γκόλεμ',
        emoji: '💎', color: '#4dd0e1', rarity: 'Epic', rarityGr: 'Επικό',
        element: 'Gem & Light', elementGr: 'Πέτρα & Φως',
        description: 'Living gemstone from deep caverns',
        descriptionGr: 'Ζωντανό πετράδι από βαθιά σπήλαια',
        lore: 'Formed over millennia in crystal caves, this sentient gem refracts light and magic.',
        loreGr: 'Διαμορφώθηκε σε σπηλιές για χιλιετίες — ανακλά φως και μαγεία.',
        traits: ['💎 Diamond Hard', '🌈 Light Prism', '✨ Mana Storage'],
        traitsGr: ['💎 Σκληρό σαν διαμάντι', '🌈 Πρίσμα φωτός', '✨ Αποθήκη μαγείας']
    }
};

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

function screenShake(duration = 500) {
    const body = document.body;
    const originalTransform = body.style.transform;
    const startTime = Date.now();
    
    const shake = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            const intensity = (1 - elapsed / duration) * 5;
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

function ensureTamaCinematicStyles() {
    if (document.getElementById('tm-tama-cinematic-styles')) return;
    const style = document.createElement('style');
    style.id = 'tm-tama-cinematic-styles';
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
            display: flex;
            gap: 16px;
            margin: 0 auto 24px;
            overflow: hidden;
            width: 100%;
            max-width: 400px;
            height: 110px;
            position: relative;
            border: 3px solid var(--lucky-color, #6fcf6f);
            border-radius: 12px;
            box-shadow: 0 0 24px color-mix(in srgb, var(--lucky-color, #6fcf6f) 40%, transparent);
            background: rgba(0,0,0,0.35);
        }
        .tm-tama-lucky-indicator {
            position: absolute;
            left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            width: 90px; height: 90px;
            border: 3px solid var(--lucky-color, #6fcf6f);
            border-radius: 10px;
            box-shadow: 0 0 30px var(--lucky-color, #6fcf6f);
            pointer-events: none;
            animation: tm-lucky-pulse 0.8s ease-in-out infinite;
        }
        .tm-tama-lucky-scroll {
            display: flex;
            gap: 32px;
            padding: 16px;
            will-change: transform;
        }
        .tm-tama-lucky-char {
            min-width: 72px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            opacity: 0.35;
            transition: opacity 0.3s, transform 0.3s;
        }
        .tm-tama-lucky-char.selected {
            opacity: 1;
            transform: scale(1.15);
        }
        .tm-tama-lucky-char-emoji { font-size: 44px; }
        .tm-tama-lucky-char-name { font-size: 11px; font-weight: 700; }
        .tm-tama-lucky-reveal {
            opacity: 0;
            transform: translateY(16px);
        }
        .tm-tama-lucky-reveal.visible {
            animation: tm-lucky-reveal-in 0.8s ease-out forwards;
        }
        .tm-tama-death-scene {
            position: relative;
            height: 200px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .tm-tama-death-mascot {
            font-size: 64px;
            position: absolute;
            left: 50%;
            bottom: 20px;
            transform: translateX(-50%);
            filter: grayscale(1);
            opacity: 0.7;
            animation: tm-death-fade-mascot 2s ease-out forwards;
        }
        .tm-tama-death-ghost {
            font-size: 48px;
            position: absolute;
            left: 50%;
            bottom: 30px;
            transform: translateX(-50%);
            opacity: 0;
            animation: tm-death-ghost-rise 3s ease-out 0.5s forwards;
        }
        .tm-tama-death-stars span {
            position: absolute;
            font-size: 12px;
            opacity: 0;
            animation: tm-death-star 2s ease-out infinite;
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
            filter: grayscale(1);
            opacity: 0.6;
            transition: filter 2s, opacity 2s;
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
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes tm-lucky-reveal-in {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tm-death-fade-mascot {
            to { opacity: 0.2; transform: translateX(-50%) scale(0.9); }
        }
        @keyframes tm-death-ghost-rise {
            0% { opacity: 0; transform: translateX(-50%) translateY(0); }
            20% { opacity: 1; }
            100% { opacity: 0; transform: translateX(-50%) translateY(-120px); }
        }
        @keyframes tm-death-star {
            0% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.5); }
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

function showEggHatchAnimation(onComplete) {
    ensureTamaCinematicStyles();
    if (document.getElementById('tm-tama-hatch-panel')) return;

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
        setTimeout(() => { if (statusEl) statusEl.textContent = text; }, ms);
    });

    setTimeout(() => screenShake(500), 3200);
    setTimeout(() => {
        burstEl?.classList.add('active');
        playEpicSound();
    }, 3400);

    setTimeout(() => {
        mascotContainer?.classList.remove('mascot-hatching');
        overlay.style.animation = 'tm-tama-fade-in 0.4s ease-out reverse';
        setTimeout(() => {
            overlay.remove();
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

    const stageEmoji = { egg: '🥚', baby: '👶', kid: '🧒', teen: '🎮', adult: '💼', middleage: '👔', old: '👴' };
    const emoji = tamagotchiCharacterType && MASCOT_CHARACTERS[tamagotchiCharacterType]
        ? MASCOT_CHARACTERS[tamagotchiCharacterType].emoji
        : (stageEmoji[tamagotchiStage] || '💀');

    const overlay = document.createElement('div');
    overlay.id = 'tm-tama-death-cinematic';
    overlay.className = 'tm-tama-cinematic-overlay';
    overlay.innerHTML = `
        <div class="tm-tama-cinematic-panel" style="border-color:#4a4a5a; background: linear-gradient(180deg, #1a1a2a 0%, #0a0a14 100%);">
            <div class="tm-tama-lcd-title" style="color:#888;">● Tamagotchi ●</div>
            <h2 class="tm-tama-cinematic-title" style="color:#ccc; text-shadow:none;">💀 Αντίο...</h2>
            <div class="tm-tama-death-scene">
                <div class="tm-tama-death-stars">
                    ${[10,25,40,55,70,85].map((l, i) => `<span style="left:${l}%;top:${15 + (i%3)*20}%;animation-delay:${i*0.3}s">✦</span>`).join('')}
                </div>
                <div class="tm-tama-death-mascot">${emoji}</div>
                <div class="tm-tama-death-ghost">👻</div>
            </div>
            <p class="tm-tama-death-message" id="tm-death-cine-msg">Επέστρεψε στον ψηφιακό κόσμο...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    const msgs = MASCOT_MESSAGES.deathCinematic;
    let mi = 0;
    const msgInterval = setInterval(() => {
        const el = overlay.querySelector('#tm-death-cine-msg');
        if (el && mi < msgs.length) el.textContent = msgs[mi++];
    }, 900);

    setTimeout(() => {
        clearInterval(msgInterval);
        mascotContainer?.classList.remove('mascot-dying');
        overlay.style.animation = 'tm-tama-fade-in 0.5s ease-out reverse';
        setTimeout(() => {
            overlay.remove();
            if (typeof onComplete === 'function') onComplete();
        }, 500);
    }, 3800);
}

function runTamagotchiHatchSequence(characterType, container) {
    if (tamaCinematicLock) return;
    tamaCinematicLock = true;
    const config = typeof window.config !== 'undefined' ? window.config : {};
    stopRoaming(config);

    showEggHatchAnimation(() => {
        updateMascotAppearanceByStage('baby');
        showLuckyCharacterReveal(characterType, () => {
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
    showTamagotchiDeathCinematic(() => {
        showTamagotchiDeathScreen(STORAGE_KEYS, true);
    });
}

function showEpicCharacterReveal(characterType, onComplete) {
    return showLuckyCharacterReveal(characterType, onComplete);
}

function showLuckyCharacterReveal(characterType, onComplete) {
    const character = MASCOT_CHARACTERS[characterType];
    if (!character) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    ensureTamaCinematicStyles();
    playEpicSound();

    const characterKeys = Object.keys(MASCOT_CHARACTERS);
    const allChars = Object.values(MASCOT_CHARACTERS);
    const selectedIndex = characterKeys.indexOf(characterType);
    const charWidth = 104;
    const totalRepeats = 5;
    const targetIndex = (totalRepeats - 2) * allChars.length + selectedIndex;
    const finalTranslate = -(targetIndex * charWidth - 164);

    const overlay = document.createElement('div');
    overlay.id = 'tm-tama-lucky-panel';
    overlay.className = 'tm-tama-cinematic-overlay';
    overlay.style.setProperty('--lucky-color', character.color);

    const scrollItems = [];
    for (let i = 0; i < totalRepeats; i++) {
        allChars.forEach((char, idx) => {
            const isWinner = (i === totalRepeats - 2) && (characterKeys[idx] === characterType);
            scrollItems.push(`
                <div class="tm-tama-lucky-char${isWinner ? ' selected' : ''}" data-char-idx="${i * allChars.length + idx}">
                    <div class="tm-tama-lucky-char-emoji">${char.emoji}</div>
                    <div class="tm-tama-lucky-char-name" style="color:${char.color}">${char.nameGr || char.name}</div>
                </div>
            `);
        });
    }

    overlay.innerHTML = `
        <div class="tm-tama-cinematic-panel" style="--lucky-color:${character.color}; max-width:480px;">
            <div class="tm-tama-lcd-title">● Τυχερή κλήρωση ●</div>
            <h2 class="tm-tama-cinematic-title">🎰 Τυχερή επιλογή!</h2>
            <p class="tm-tama-cinematic-subtitle">Ποιος θα βγει από το αυγό;</p>
            <div class="tm-tama-lucky-slot">
                <div class="tm-tama-lucky-indicator"></div>
                <div class="tm-tama-lucky-scroll" id="tm-lucky-scroll">${scrollItems.join('')}</div>
            </div>
            <div class="tm-tama-lucky-reveal" id="tm-lucky-reveal">
                <div style="font-size:72px;margin-bottom:12px;text-shadow:0 0 24px ${character.color}">${character.emoji}</div>
                <div style="font-size:26px;font-weight:700;color:${character.color};margin-bottom:8px">${character.nameGr || character.name}</div>
                <div style="display:inline-block;background:${character.color}33;color:${character.color};padding:5px 14px;border-radius:16px;font-size:12px;font-weight:700;border:2px solid ${character.color};margin-bottom:14px">${character.rarityGr || character.rarity} • ${character.elementGr || character.element}</div>
                <div style="font-size:14px;color:#aaa;margin-bottom:16px;font-style:italic">"${character.descriptionGr || character.description}"</div>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px">
                    ${(character.traitsGr || character.traits).map(t => `<span style="background:rgba(255,255,255,0.08);padding:6px 12px;border-radius:6px;font-size:12px;color:#ddd;border:1px solid rgba(255,255,255,0.15)">${t}</span>`).join('')}
                </div>
                <button class="tm-tama-btn tm-tama-btn-primary" id="tm-reveal-close-btn">✨ Ξεκινάμε!</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const scrollEl = overlay.querySelector('#tm-lucky-scroll');
    const revealEl = overlay.querySelector('#tm-lucky-reveal');
    const animName = `tmLuckySpin_${characterType}_${Date.now()}`;
    const spinStyle = document.createElement('style');
    spinStyle.textContent = `
        @keyframes ${animName} {
            0% { transform: translateX(0); }
            70% { transform: translateX(${finalTranslate - 180}px); }
            85% { transform: translateX(${finalTranslate + 40}px); }
            100% { transform: translateX(${finalTranslate}px); }
        }
    `;
    document.head.appendChild(spinStyle);
    if (scrollEl) scrollEl.style.animation = `${animName} 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards`;

    const closePanel = () => {
        overlay.style.animation = 'tm-tama-fade-in 0.35s ease-out reverse';
        setTimeout(() => {
            overlay.remove();
            spinStyle.remove();
            if (typeof window.triggerConfetti === 'function') window.triggerConfetti(80);
            if (typeof onComplete === 'function') onComplete();
        }, 350);
    };

    setTimeout(() => {
        scrollEl?.querySelectorAll('.tm-tama-lucky-char').forEach((el, i) => {
            el.classList.toggle('selected', i === targetIndex);
        });
    }, 2800);

    setTimeout(() => {
        screenShake(500);
        revealEl?.classList.add('visible');
        if (scrollEl?.parentElement) scrollEl.parentElement.style.opacity = '0.35';
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
                osc.start(ctx.currentTime + i * 0.05);
                osc.stop(ctx.currentTime + 1.2);
            });
        } catch (e) { /* audio unavailable */ }
        if (typeof window.triggerConfetti === 'function') window.triggerConfetti(180);
        overlay.querySelector('#tm-reveal-close-btn')?.addEventListener('click', closePanel);
    }, 3200);
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
let tamagotchiReviveCount = 0; // How many times revived
let tamagotchiLastPoopTime = 0; // When last poop was created
let tamagotchiSleepStartTime = 0; // When sleep period starts
let tamagotchiSleepEndTime = 0; // When sleep period ends
let tamagotchiIsSleeping = false;
let tamagotchiLightsManualOverride = false; // User manually toggled lights (prevents auto sleep/wake)
let tamagotchiLastPraise = 0; // Last time praised
let tamagotchiLastScold = 0; // Last time scolded
let tamagotchiLifeMinutes = 0; // Real-time life clock (classic Tamagotchi pacing)
let mascotStagePreviewLock = false;
let mascotStagePreviewStage = null;
let mascotStagePreviewTimeout = null;

// Classic Tamagotchi-inspired stage thresholds (real minutes)
const TAMA_STAGE_MINUTES = {
    egg: 0,
    baby: 5,
    kid: 65,
    teen: 180,
    adult: 360,
    middleage: 720,
    old: 1440,
    death: 4800 // ~80 display-years at 60 min/year
};
const TAMA_MINUTES_PER_YEAR = 60;
const TAMA_CHARACTER_TYPES = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal'];

const MASCOT_CHAR_NAMES_GR = {
    dragon: 'Δράκος', robot: 'Ρομπότ', slime: 'Σλίμ', plant: 'Φυτό',
    ghost: 'Φάντασμα', cat: 'Γάτα', phoenix: 'Φοίνικας', crystal: 'Κρύσταλλος'
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
        'Φτιάχνουμε;', 'Βοήθεια θες;', 'Πάμε για δουλειά!', 'Λέγε!'
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
    if (minutes < TAMA_STAGE_MINUTES.baby) return 'egg';
    if (minutes < TAMA_STAGE_MINUTES.kid) return 'baby';
    if (minutes < TAMA_STAGE_MINUTES.teen) return 'kid';
    if (minutes < TAMA_STAGE_MINUTES.adult) return 'teen';
    if (minutes < TAMA_STAGE_MINUTES.middleage) return 'adult';
    if (minutes < TAMA_STAGE_MINUTES.old) return 'middleage';
    return 'old';
}

function syncTamagotchiAgeFromLife() {
    tamagotchiAge = Math.floor(tamagotchiLifeMinutes / TAMA_MINUTES_PER_YEAR);
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
        element.style.removeProperty('display');
        element.style.visibility = 'visible';
        element.style.opacity = '1';
    } else {
        element.style.display = 'none';
    }
}

function ensureTamagotchiCharacterType() {
    if (tamagotchiStage === 'egg') {
        tamagotchiCharacterType = 'none';
        return;
    }
    if (!tamagotchiCharacterType || tamagotchiCharacterType === 'none') {
        tamagotchiCharacterType = TAMA_CHARACTER_TYPES[Math.floor(Math.random() * TAMA_CHARACTER_TYPES.length)];
        console.log(`[Mascot] Assigned missing character type: ${tamagotchiCharacterType}`);
    }
}

function validateTamagotchiState() {
    tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
    ensureTamagotchiCharacterType();
    syncTamagotchiAgeFromLife();

    if (tamagotchiStage === 'egg') {
        tamagotchiPoopCount = 0;
        tamagotchiLastPoopTime = 0;
        updateToiletNeedIndicator();
    } else if (!tamagotchiLastPoopTime) {
        tamagotchiLastPoopTime = Date.now();
    }
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
        .find((cls) => cls.startsWith('mascot-') && !MASCOT_MODIFIER_CLASSES.includes(cls))
        ?.replace('mascot-', '') || '';
}

function canMascotRoamingMove(state = getMascotBehaviorState()) {
    return ROAMING_MOVE_STATES.includes(state);
}

function shouldMascotBeRoaming(config) {
    if (!isMascotInteractiveEnabled(config)) return false;
    if (tamagotchiIsDead || tamaCinematicLock) return false;
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) return false;
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
        } else {
            const idleRepairMessages = MASCOT_MESSAGES.idleRepair;
            showMascotBubble(idleRepairMessages[Math.floor(Math.random() * idleRepairMessages.length)], 2500);
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
    const bubble = document.getElementById('tm-mascot-speech-bubble');
    if (!bubble) return;

    const messages = MASCOT_MESSAGES.defaultBubble;
    // If no text is provided, pick a random one.
    const messageToShow = text || messages[Math.floor(Math.random() * messages.length)];

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
    const preserve = new Set(['tm-mascot-container', ...MASCOT_MODIFIER_CLASSES]);
    [...mascotContainer.classList].forEach((cls) => {
        if (cls.startsWith('mascot-') && !preserve.has(cls)) {
            mascotContainer.classList.remove(cls);
        }
    });
    mascotContainer.classList.add(`mascot-${state}`);
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
        'mascot-reading', 'mascot-biking', 'mascot-juggling', 'mascot-searching', 'mascot-surprised'
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
    // Apply decay for the time the script was inactive
    const timeDiffHours = (Date.now() - petStats.lastUpdate) / (1000 * 60 * 60);
    const decayAmount = Math.floor(timeDiffHours * 5); // Decay 5 points per hour
    if (decayAmount > 0) {
        console.log(`[MMS Pet] Applying ${decayAmount} decay for offline time.`);
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
    const savedData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
    if (savedData) {
        tamagotchiAge = savedData.age || 0;
        tamagotchiStage = savedData.stage || 'egg';
        tamagotchiCharacterType = savedData.characterType || 'none';
        if (savedData.lifeMinutes != null) {
            tamagotchiLifeMinutes = savedData.lifeMinutes;
        } else {
            const stageFloor = TAMA_STAGE_MINUTES[savedData.stage] ?? 0;
            tamagotchiLifeMinutes = stageFloor + Math.max(0, (savedData.age || 0) * TAMA_MINUTES_PER_YEAR);
        }
        tamagotchiHealth = savedData.health || 100;
        tamagotchiDiscipline = savedData.discipline || 0;
        tamagotchiLightsOn = savedData.lightsOn !== false;
        tamagotchiLastUpdate = savedData.lastUpdate || Date.now();
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
        tamagotchiLastPoopTime = savedData.lastPoopTime || 0;
        tamagotchiSleepStartTime = savedData.sleepStartTime || 0;
        tamagotchiSleepEndTime = savedData.sleepEndTime || 0;
        tamagotchiIsSleeping = savedData.isSleeping || false;
        tamagotchiLightsManualOverride = savedData.lightsManualOverride || false;
        tamagotchiLastPraise = savedData.lastPraise || 0;
        tamagotchiLastScold = savedData.lastScold || 0;
        validateTamagotchiState();
    }
}

function saveTamagotchiData(STORAGE_KEYS) {
    const data = {
        age: tamagotchiAge,
        lifeMinutes: tamagotchiLifeMinutes,
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
        lastPoopTime: tamagotchiLastPoopTime,
        sleepStartTime: tamagotchiSleepStartTime,
        sleepEndTime: tamagotchiSleepEndTime,
        isSleeping: tamagotchiIsSleeping,
        lightsManualOverride: tamagotchiLightsManualOverride,
        lastPraise: tamagotchiLastPraise,
        lastScold: tamagotchiLastScold
    };
    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(data));
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
    
    // Periodic updates every minute
    setInterval(() => {
        updateTamagotchiStats(container);
        checkTamagotchiEvolution(container);
        saveTamagotchiData(STORAGE_KEYS);
    }, 60000);
}

function updateTamagotchiStats(container) {
    // Container parameter kept for backward compatibility but not required
    
    const now = Date.now();
    const timeDiff = (now - tamagotchiLastUpdate) / 1000 / 60; // minutes
    
    // Update stats based on time
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
        
        // Age/life increases on classic Tamagotchi clock (60 real minutes = 1 display year)
        tamagotchiLifeMinutes += timeDiff;
        syncTamagotchiAgeFromLife();
        
        // Generate poops periodically (not for egg or baby stage)
        if (!tamagotchiIsSleeping && tamagotchiStage !== 'egg' && tamagotchiStage !== 'baby') {
            generateTamagotchiPoop();
        }
        
        // Update toilet need indicator
        updateToiletNeedIndicator();
        
        // Update sleep schedule (need config - check if available)
        if (typeof window !== 'undefined' && typeof window.config !== 'undefined' && window.config) {
            updateTamagotchiSleepSchedule(window.config);
        }
        
        // Slowly decrease discipline if not maintained
        if (tamagotchiDiscipline > 0) {
            tamagotchiDiscipline = Math.max(0, tamagotchiDiscipline - (timeDiff * 0.05));
        }
        
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
        tamagotchiIsDead = true;
        tamagotchiHealth = 0;
        saveTamagotchiData(typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : {});
        const oldAgeMessages = MASCOT_MESSAGES.oldAgeDeath;
        showMascotBubble(oldAgeMessages[Math.floor(Math.random() * oldAgeMessages.length)], 5000);
        setMascotState(null, 'dead', 10000);
        console.log('[Mascot] 💀 Died from old age at', tamagotchiAge, 'years');
        
        // Show death screen after a delay
        setTimeout(() => {
            runTamagotchiDeathSequence(typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : {});
        }, 1500);
        
        return; // Exit early, don't update stage
    }
    
    // Determine stage based on life minutes (classic Tamagotchi pacing)
    tamagotchiStage = getTamagotchiStageFromLifeMinutes(tamagotchiLifeMinutes);
    syncTamagotchiAgeFromLife();

    if (tamagotchiStage === 'egg') {
        tamagotchiCharacterType = 'none';
    } else if (tamagotchiStage === 'baby' && (!tamagotchiCharacterType || tamagotchiCharacterType === 'none')) {
        tamagotchiCharacterType = TAMA_CHARACTER_TYPES[Math.floor(Math.random() * TAMA_CHARACTER_TYPES.length)];
        console.log(`[Mascot] 🎉 EPIC HATCH: ${tamagotchiCharacterType}!`);
    } else {
        ensureTamagotchiCharacterType();
    }
    
    // If evolved or hatched, show message, update personality, and update appearance
    if (oldStage !== tamagotchiStage || oldCharacterType !== tamagotchiCharacterType) {
        updateTamagotchiPersonality();
        const evolutionMessages = MASCOT_MESSAGES.evolution;
        if (oldStage === 'egg' && tamagotchiStage === 'baby') {
            tamagotchiLastPoopTime = Date.now();
            runTamagotchiHatchSequence(tamagotchiCharacterType, container);
        } else if (tamagotchiStage === 'old' && oldStage !== 'old') {
            const oldMessages = MASCOT_MESSAGES.becameOld;
            showMascotBubble(oldMessages[Math.floor(Math.random() * oldMessages.length)], 3000);
        } else if (oldStage !== tamagotchiStage) {
            showMascotBubble(evolutionMessages[Math.floor(Math.random() * evolutionMessages.length)], 3000);
        }
        updateTamagotchiStats(container);
        saveTamagotchiData(typeof window.STORAGE_KEYS !== 'undefined' ? window.STORAGE_KEYS : {});
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

    petStats.hunger = 100;
    petStats.happiness = 100;
    petStats.health = 100;
    petStats.discipline = 0;
    petStats.lastUpdate = Date.now();
}

function refreshTamagotchiAfterEggReset(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    tamaCinematicLock = false;

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
        checkTamagotchiEvolution(container);
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
 * @returns {boolean} true if reset was performed
 */
function restartTamagotchiAsEgg(config, STORAGE_KEYS, options = {}) {
    const keys = STORAGE_KEYS || window.STORAGE_KEYS;
    const cfg = config || window.config || {};
    const { skipConfirm = false, reloadPage = false } = options;

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
    
    // Die if health reaches 0 or hunger stays at 0 for too long
    if (tamagotchiHealth <= 0 || (petStats.hunger <= 0 && (Date.now() - tamagotchiLastFed) > 4 * 60 * 60 * 1000)) {
        tamagotchiIsDead = true;
        saveTamagotchiData(STORAGE_KEYS);
        
        const deathMessages = MASCOT_MESSAGES.death;
        showMascotBubble(deathMessages[Math.floor(Math.random() * deathMessages.length)], 5000);
        
        // Update death options button visibility
        updateDeathOptionsButton();
        
        // Show death cinematic + options panel
        runTamagotchiDeathSequence(STORAGE_KEYS);
    }
}

// Update death options button visibility
function updateDeathOptionsButton() {
    const reviveContainer = document.getElementById('tm-pet-revive-btn-container');
    if (reviveContainer) {
        reviveContainer.style.display = tamagotchiIsDead ? 'block' : 'none';
    }
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
    
    // Restart button
    document.getElementById('tm-restart-btn')?.addEventListener('click', () => {
        if (restartTamagotchiAsEgg(config, STORAGE_KEYS, { skipConfirm: true })) {
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
    
    // Sleep between 9 PM and 7 AM (21:00 - 07:00)
    const shouldSleep = currentHour >= 21 || currentHour < 7;
    
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
                <g id="tm-mascot-base" style="display: block; opacity: 1;">
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
                <!-- DRAGON CHARACTER - All Life Stages -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- DRAGON BABY -->
                <g id="tm-mascot-baby-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="baby-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#b2fab4;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#76ff03;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#64dd17;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="baby-dragon-belly">
                            <stop offset="0%" style="stop-color:#fff9c4;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#fff59d;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="88" rx="28" ry="6" fill="#333" opacity="0.2"/>
                    <!-- Tiny tail (curved) -->
                    <path class="tm-animate-tail" d="M 68 72 Q 78 75 80 70 Q 82 65 78 63" 
                          fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.8"/>
                    <!-- Body (round and chubby) -->
                    <ellipse class="tm-animate-body" cx="50" cy="65" rx="24" ry="20" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="2"/>
                    <!-- Belly patch -->
                    <ellipse cx="50" cy="70" rx="14" ry="12" fill="url(#baby-dragon-belly)" opacity="0.8"/>
                    <!-- Head (large compared to body) -->
                    <ellipse cx="50" cy="38" rx="18" ry="16" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="2"/>
                    <!-- Tiny snout -->
                    <ellipse cx="50" cy="44" rx="8" ry="5" fill="url(#baby-dragon-belly)"/>
                    <!-- Nostrils (tiny dots) -->
                    <circle cx="47" cy="45" r="1.2" fill="#558b2f"/>
                    <circle cx="53" cy="45" r="1.2" fill="#558b2f"/>
                    <!-- Tiny horns (nubs) -->
                    <ellipse cx="38" cy="28" rx="3" ry="5" fill="#ff6090" stroke="#e91e63" stroke-width="1" transform="rotate(-20 38 28)"/>
                    <ellipse cx="62" cy="28" rx="3" ry="5" fill="#ff6090" stroke="#e91e63" stroke-width="1" transform="rotate(20 62 28)"/>
                    <!-- Baby spikes on back (tiny) -->
                    <circle cx="48" cy="52" r="2.5" fill="#ff80ab"/>
                    <circle cx="52" cy="52" r="2.5" fill="#ff80ab"/>
                    <circle cx="46" cy="60" r="2" fill="#ff6090"/>
                    <circle cx="54" cy="60" r="2" fill="#ff6090"/>
                    <!-- Huge cute eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="36" rx="7" ry="9" fill="#fff" stroke="#558b2f" stroke-width="1.5"/>
                        <ellipse cx="58" cy="36" rx="7" ry="9" fill="#fff" stroke="#558b2f" stroke-width="1.5"/>
                        <ellipse cx="43" cy="37" rx="4" ry="5" fill="#2c3e50"/>
                        <ellipse cx="59" cy="37" rx="4" ry="5" fill="#2c3e50"/>
                        <circle cx="44" cy="35" r="2.5" fill="#fff" opacity="0.9"/>
                        <circle cx="60" cy="35" r="2.5" fill="#fff" opacity="0.9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 35 36 Q 42 33 49 36" stroke="#558b2f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 51 36 Q 58 33 65 36" stroke="#558b2f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Cute mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 44 48 Q 50 52 56 48" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 50 Q 50 46 56 50" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Tiny stubby arms -->
                    <ellipse class="tm-animate-arm-left" cx="28" cy="60" rx="6" ry="8" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.5"/>
                    <ellipse class="tm-animate-arm-right" cx="72" cy="60" rx="6" ry="8" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.5"/>
                    <!-- Tiny feet -->
                    <ellipse class="tm-animate-leg-left" cx="40" cy="84" rx="6" ry="4" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.5"/>
                    <ellipse class="tm-animate-leg-right" cx="60" cy="84" rx="6" ry="4" fill="url(#baby-dragon-scales)" stroke="#558b2f" stroke-width="1.5"/>
                    <!-- Tiny wing nubs -->
                    <ellipse class="tm-animate-wing-left" cx="30" cy="58" rx="5" ry="8" fill="#80deea" opacity="0.5" stroke="#558b2f" stroke-width="1" transform="rotate(-15 30 58)"/>
                    <ellipse class="tm-animate-wing-right" cx="70" cy="58" rx="5" ry="8" fill="#80deea" opacity="0.5" stroke="#558b2f" stroke-width="1" transform="rotate(15 70 58)"/>
                </g>

                <!-- DRAGON KID -->
                <g id="tm-mascot-evo1-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#a7ffeb;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#64ffda;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1de9b6;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="dragon-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e1f5fe;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b3e5fc;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="90" rx="32" ry="8" fill="#333" opacity="0.2"/>
                    <!-- Tail (curled) -->
                    <g class="tm-animate-tail">
                        <path d="M 70 70 Q 85 75 88 68 Q 90 62 85 58 Q 82 56 78 58" 
                              fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="86" cy="59" r="4" fill="#ff6090" opacity="0.8"/>
                        <circle cx="84" cy="60" r="2" fill="#ff6090" opacity="0.6"/>
                    </g>
                    <!-- Body (chubby) -->
                    <ellipse class="tm-animate-body" cx="50" cy="65" rx="28" ry="24" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="2.5"/>
                    <!-- Belly scales pattern -->
                    <ellipse cx="50" cy="68" rx="18" ry="16" fill="url(#dragon-belly)" opacity="0.8"/>
                    <path d="M 40 62 Q 50 64 60 62" stroke="#80deea" stroke-width="1" opacity="0.6" fill="none"/>
                    <path d="M 38 68 Q 50 70 62 68" stroke="#80deea" stroke-width="1" opacity="0.6" fill="none"/>
                    <path d="M 40 74 Q 50 76 60 74" stroke="#80deea" stroke-width="1" opacity="0.6" fill="none"/>
                    <!-- Head (cute dragon face) -->
                    <ellipse cx="50" cy="35" rx="22" ry="20" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="2.5"/>
                    <!-- Snout -->
                    <ellipse cx="50" cy="42" rx="12" ry="8" fill="url(#dragon-belly)"/>
                    <!-- Nostrils -->
                    <ellipse cx="46" cy="44" rx="2" ry="1.5" fill="#00897b"/>
                    <ellipse cx="54" cy="44" rx="2" ry="1.5" fill="#00897b"/>
                    <!-- Horns (small and cute) -->
                    <path d="M 35 28 Q 32 22 30 20 Q 28 18 32 20 L 35 26" fill="#ff6090" stroke="#e91e63" stroke-width="1.5"/>
                    <path d="M 65 28 Q 68 22 70 20 Q 72 18 68 20 L 65 26" fill="#ff6090" stroke="#e91e63" stroke-width="1.5"/>
                    <!-- Spikes on back -->
                    <path d="M 50 48 L 48 53 L 52 53 Z" fill="#ff6090"/>
                    <path d="M 45 58 L 43 62 L 47 62 Z" fill="#ff80ab"/>
                    <path d="M 55 58 L 53 62 L 57 62 Z" fill="#ff80ab"/>
                    <!-- Eyes (big and curious) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="32" rx="7" ry="8" fill="#fff" stroke="#00bfa5" stroke-width="1.5"/>
                        <ellipse cx="58" cy="32" rx="7" ry="8" fill="#fff" stroke="#00bfa5" stroke-width="1.5"/>
                        <ellipse cx="43" cy="33" rx="4" ry="5" fill="#2c3e50"/>
                        <ellipse cx="59" cy="33" rx="4" ry="5" fill="#2c3e50"/>
                        <circle cx="44" cy="31" r="2" fill="#fff"/>
                        <circle cx="60" cy="31" r="2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 35 32 Q 42 29 49 32" stroke="#00897b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 51 32 Q 58 29 65 32" stroke="#00897b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 43 48 Q 50 52 57 48" stroke="#00897b" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 50 Q 50 46 57 50" stroke="#00897b" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Arms (claws) -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="26" cy="62" rx="7" ry="9" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="1.8"/>
                        <path d="M 22 68 L 20 72 M 25 69 L 24 73 M 28 68 L 28 72" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="74" cy="62" rx="7" ry="9" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="1.8"/>
                        <path d="M 72 68 L 72 72 M 75 69 L 76 73 M 78 68 L 80 72" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <!-- Feet (dino claws) -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="40" cy="86" rx="7" ry="5" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="1.8"/>
                        <path d="M 36 88 L 34 91 M 40 89 L 40 92 M 44 88 L 46 91" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="60" cy="86" rx="7" ry="5" fill="url(#dragon-scales)" stroke="#00bfa5" stroke-width="1.8"/>
                        <path d="M 54 88 L 52 91 M 60 89 L 60 92 M 64 88 L 66 91" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <!-- Wings (tiny baby wings) -->
                    <ellipse class="tm-animate-wing-left" cx="28" cy="58" rx="8" ry="12" fill="#80deea" opacity="0.6" stroke="#00bfa5" stroke-width="1.5" transform="rotate(-20 28 58)"/>
                    <ellipse class="tm-animate-wing-right" cx="72" cy="58" rx="8" ry="12" fill="#80deea" opacity="0.6" stroke="#00bfa5" stroke-width="1.5" transform="rotate(20 72 58)"/>
                </g>

                <!-- DRAGON TEEN -->
                <g id="tm-mascot-evo2-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="teen-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#26c6da;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00bcd4;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="teen-dragon-wing" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#80deea;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#4dd0e1;stop-opacity:0.6" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="92" rx="36" ry="7" fill="#333" opacity="0.3"/>
                    <!-- Tail (longer, spiky) -->
                    <g class="tm-animate-tail">
                        <path d="M 72 75 Q 88 78 92 72 Q 94 66 90 62 Q 87 60 83 62" 
                              fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="2"/>
                        <path d="M 88 62 L 92 60 L 90 65 Z" fill="#ff6090"/>
                        <path d="M 84 67 L 88 66 L 86 70 Z" fill="#ff6090"/>
                    </g>
                    <!-- Larger wings (can flap now) -->
                    <g class="tm-animate-wing-left">
                        <ellipse cx="25" cy="55" rx="12" ry="20" fill="url(#teen-dragon-wing)" stroke="#0097a7" stroke-width="2" transform="rotate(-25 25 55)"/>
                        <path d="M 20 50 Q 18 55 20 60" stroke="#0097a7" stroke-width="1" opacity="0.6"/>
                        <path d="M 25 48 Q 23 55 25 62" stroke="#0097a7" stroke-width="1" opacity="0.6"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <ellipse cx="75" cy="55" rx="12" ry="20" fill="url(#teen-dragon-wing)" stroke="#0097a7" stroke-width="2" transform="rotate(25 75 55)"/>
                        <path d="M 80 50 Q 82 55 80 60" stroke="#0097a7" stroke-width="1" opacity="0.6"/>
                        <path d="M 75 48 Q 77 55 75 62" stroke="#0097a7" stroke-width="1" opacity="0.6"/>
                    </g>
                    <!-- Body (getting longer) -->
                    <ellipse class="tm-animate-body" cx="50" cy="68" rx="26" ry="22" fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="2.5"/>
                    <!-- Belly pattern -->
                    <ellipse cx="50" cy="70" rx="16" ry="14" fill="#e0f7fa" opacity="0.7"/>
                    <!-- Spikes on back (developing) -->
                    <path d="M 48 50 L 46 58 L 50 58 Z" fill="#ff6090" stroke="#e91e63" stroke-width="1"/>
                    <path d="M 52 50 L 50 58 L 54 58 Z" fill="#ff6090" stroke="#e91e63" stroke-width="1"/>
                    <path d="M 44 60 L 42 66 L 46 66 Z" fill="#ff80ab" stroke="#e91e63" stroke-width="1"/>
                    <path d="M 56 60 L 54 66 L 58 66 Z" fill="#ff80ab" stroke="#e91e63" stroke-width="1"/>
                    <!-- Head (more defined snout) -->
                    <ellipse cx="50" cy="32" rx="20" ry="18" fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="2.5"/>
                    <!-- Snout (more pronounced) -->
                    <ellipse cx="50" cy="40" rx="11" ry="7" fill="#e0f7fa"/>
                    <!-- Nostrils -->
                    <ellipse cx="46" cy="42" rx="2" ry="1.5" fill="#00838f"/>
                    <ellipse cx="54" cy="42" rx="2" ry="1.5" fill="#00838f"/>
                    <!-- Horns (longer) -->
                    <path d="M 36 24 Q 32 18 28 16 Q 26 14 30 16 L 35 22" fill="#ff6090" stroke="#e91e63" stroke-width="1.5"/>
                    <path d="M 64 24 Q 68 18 72 16 Q 74 14 70 16 L 65 22" fill="#ff6090" stroke="#e91e63" stroke-width="1.5"/>
                    <!-- Eyes (more focused) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="30" rx="6" ry="7" fill="#fff" stroke="#0097a7" stroke-width="1.5"/>
                        <ellipse cx="58" cy="30" rx="6" ry="7" fill="#fff" stroke="#0097a7" stroke-width="1.5"/>
                        <ellipse cx="43" cy="31" rx="3.5" ry="4.5" fill="#2c3e50"/>
                        <ellipse cx="59" cy="31" rx="3.5" ry="4.5" fill="#2c3e50"/>
                        <circle cx="44" cy="29" r="1.8" fill="#4dd0e1"/>
                        <circle cx="60" cy="29" r="1.8" fill="#4dd0e1"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 30 Q 42 27 48 30" stroke="#00838f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 52 30 Q 58 27 64 30" stroke="#00838f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 46 Q 50 50 58 46" stroke="#00838f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 48 Q 50 44 58 48" stroke="#00838f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Arms (clawed) -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="28" cy="64" rx="7" ry="10" fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="1.8"/>
                        <path d="M 24 70 L 22 74 M 27 71 L 26 75 M 30 70 L 30 74" stroke="#00838f" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="72" cy="64" rx="7" ry="10" fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="1.8"/>
                        <path d="M 70 70 L 70 74 M 73 71 L 74 75 M 76 70 L 78 74" stroke="#00838f" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <!-- Feet -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="40" cy="88" rx="7" ry="5" fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="1.8"/>
                        <path d="M 36 90 L 34 93 M 40 91 L 40 94 M 44 90 L 46 93" stroke="#00838f" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="60" cy="88" rx="7" ry="5" fill="url(#teen-dragon-scales)" stroke="#0097a7" stroke-width="1.8"/>
                        <path d="M 54 90 L 52 93 M 60 91 L 60 94 M 64 90 L 66 93" stroke="#00838f" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                </g>

                <!-- ADULT Stage - Full Grown Tamagotchi -->
                <!-- DRAGON ADULT -->
                <g id="tm-mascot-evo3-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="adult-dragon-scales" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#26a69a;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#00897b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00695c;stop-opacity:1" />
                        </linearGradient>
                        <linearGradient id="adult-dragon-wing" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#4db6ac;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#26a69a;stop-opacity:0.7" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="40" ry="6" fill="#333" opacity="0.35"/>
                    <!-- Majestic wings (large and detailed) -->
                    <g class="tm-animate-wing-left">
                        <path d="M 15 50 Q 8 40 10 30 Q 12 20 18 18 Q 22 50 25 55 Z" 
                              fill="url(#adult-dragon-wing)" stroke="#00695c" stroke-width="2.5" filter="url(#glow)"/>
                        <path d="M 12 35 Q 15 35 18 40" stroke="#00695c" stroke-width="1.2" opacity="0.6"/>
                        <path d="M 14 42 Q 17 42 20 47" stroke="#00695c" stroke-width="1.2" opacity="0.6"/>
                        <path d="M 16 48 Q 19 48 22 53" stroke="#00695c" stroke-width="1.2" opacity="0.6"/>
                    </g>
                    <g class="tm-animate-wing-right">
                        <path d="M 85 50 Q 92 40 90 30 Q 88 20 82 18 Q 78 50 75 55 Z" 
                              fill="url(#adult-dragon-wing)" stroke="#00695c" stroke-width="2.5" filter="url(#glow)"/>
                        <path d="M 88 35 Q 85 35 82 40" stroke="#00695c" stroke-width="1.2" opacity="0.6"/>
                        <path d="M 86 42 Q 83 42 80 47" stroke="#00695c" stroke-width="1.2" opacity="0.6"/>
                        <path d="M 84 48 Q 81 48 78 53" stroke="#00695c" stroke-width="1.2" opacity="0.6"/>
                    </g>
                    <!-- Long powerful tail -->
                    <g class="tm-animate-tail">
                        <path d="M 75 72 Q 90 75 96 68 Q 100 60 96 54 Q 94 50 88 52" 
                              fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="2.5"/>
                        <!-- Tail spikes -->
                        <path d="M 92 52 L 96 50 L 94 55 Z" fill="#e91e63"/>
                        <path d="M 88 58 L 92 57 L 90 61 Z" fill="#ec407a"/>
                        <path d="M 84 64 L 88 63 L 86 67 Z" fill="#f06292"/>
                    </g>
                    <!-- Muscular body -->
                    <ellipse class="tm-animate-body" cx="50" cy="65" rx="28" ry="24" fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="3"/>
                    <!-- Armored belly scales -->
                    <ellipse cx="50" cy="68" rx="18" ry="16" fill="#80cbc4" opacity="0.7"/>
                    <path d="M 38 60 Q 50 62 62 60" stroke="#4db6ac" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 36 66 Q 50 68 64 66" stroke="#4db6ac" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 38 72 Q 50 74 62 72" stroke="#4db6ac" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 40 78 Q 50 80 60 78" stroke="#4db6ac" stroke-width="1.5" opacity="0.7"/>
                    <!-- Prominent back spikes -->
                    <path d="M 46 48 L 44 56 L 48 56 Z" fill="#d81b60" stroke="#ad1457" stroke-width="1.5"/>
                    <path d="M 50 46 L 48 54 L 52 54 Z" fill="#d81b60" stroke="#ad1457" stroke-width="1.5"/>
                    <path d="M 54 48 L 52 56 L 56 56 Z" fill="#d81b60" stroke="#ad1457" stroke-width="1.5"/>
                    <path d="M 42 60 L 40 66 L 44 66 Z" fill="#ec407a" stroke="#c2185b" stroke-width="1.5"/>
                    <path d="M 58 60 L 56 66 L 60 66 Z" fill="#ec407a" stroke="#c2185b" stroke-width="1.5"/>
                    <!-- Majestic head (elongated) -->
                    <ellipse cx="50" cy="28" rx="22" ry="20" fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="2.5"/>
                    <!-- Pronounced snout -->
                    <ellipse cx="50" cy="36" rx="13" ry="9" fill="#80cbc4"/>
                    <path d="M 42 34 Q 50 36 58 34" stroke="#4db6ac" stroke-width="1" opacity="0.6"/>
                    <!-- Flared nostrils -->
                    <ellipse cx="45" cy="38" rx="2.5" ry="2" fill="#004d40"/>
                    <ellipse cx="55" cy="38" rx="2.5" ry="2" fill="#004d40"/>
                    <!-- Large swept-back horns -->
                    <path d="M 34 20 Q 28 12 24 8 Q 22 6 26 8 L 32 16 L 36 22" fill="#e91e63" stroke="#ad1457" stroke-width="2"/>
                    <path d="M 66 20 Q 72 12 76 8 Q 78 6 74 8 L 68 16 L 64 22" fill="#e91e63" stroke="#ad1457" stroke-width="2"/>
                    <!-- Piercing eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="41" cy="26" rx="6" ry="7" fill="#ffd700" stroke="#004d40" stroke-width="1.5"/>
                        <ellipse cx="59" cy="26" rx="6" ry="7" fill="#ffd700" stroke="#004d40" stroke-width="1.5"/>
                        <ellipse cx="41" cy="26" rx="2.5" ry="4" fill="#000"/>
                        <ellipse cx="59" cy="26" rx="2.5" ry="4" fill="#000"/>
                        <circle cx="42" cy="24" r="1.5" fill="#ffeb3b"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 35 26 Q 41 23 47 26" stroke="#004d40" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 26 Q 59 23 65 26" stroke="#004d40" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Fierce mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 40 42 Q 50 46 60 42" stroke="#004d40" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 44 Q 50 40 60 44" stroke="#004d40" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <!-- Fangs -->
                    <path d="M 47 43 L 46 46" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                    <path d="M 53 43 L 54 46" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                    <!-- Powerful arms/claws -->
                    <g class="tm-animate-arm-left">
                        <ellipse cx="26" cy="62" rx="8" ry="12" fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="2"/>
                        <path d="M 22 70 L 20 75 M 25 71 L 24 76 M 28 71 L 28 76 M 31 70 L 32 75" stroke="#004d40" stroke-width="2" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-arm-right">
                        <ellipse cx="74" cy="62" rx="8" ry="12" fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="2"/>
                        <path d="M 72 70 L 72 75 M 75 71 L 76 76 M 78 71 L 78 76 M 81 70 L 82 75" stroke="#004d40" stroke-width="2" stroke-linecap="round"/>
                    </g>
                    <!-- Strong legs/claws -->
                    <g class="tm-animate-leg-left">
                        <ellipse cx="39" cy="88" rx="8" ry="6" fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="2"/>
                        <path d="M 34 90 L 32 94 M 38 91 L 38 95 M 42 91 L 42 95 M 46 90 L 48 94" stroke="#004d40" stroke-width="2" stroke-linecap="round"/>
                    </g>
                    <g class="tm-animate-leg-right">
                        <ellipse cx="61" cy="88" rx="8" ry="6" fill="url(#adult-dragon-scales)" stroke="#004d40" stroke-width="2"/>
                        <path d="M 54 90 L 52 94 M 60 91 L 60 95 M 64 91 L 64 95 M 68 90 L 70 94" stroke="#004d40" stroke-width="2" stroke-linecap="round"/>
                    </g>
                </g>

                <!-- DRAGON MIDDLE AGE -->
                <g id="tm-mascot-evo4-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="wizard-robe" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#7e57c2;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#5e35b1;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="magic-orb">
                            <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                            <stop offset="50%" style="stop-color:#ba68c8;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#9c27b0;stop-opacity:0.4" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="98" rx="30" ry="5" fill="#333" opacity="0.3"/>
                    <!-- Robe (long flowing) -->
                    <path d="M 35 55 L 30 92 Q 32 96 38 95 L 42 60 Z" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="1.5"/>
                    <path d="M 65 55 L 70 92 Q 68 96 62 95 L 58 60 Z" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="1.5"/>
                    <ellipse cx="50" cy="68" rx="22" ry="28" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="2"/>
                    <!-- Robe details (stars and moons) -->
                    <circle cx="45" cy="65" r="2" fill="#ffd54f" opacity="0.8"/>
                    <circle cx="55" cy="72" r="1.5" fill="#ffd54f" opacity="0.7"/>
                    <circle cx="52" cy="80" r="2" fill="#ffd54f" opacity="0.8"/>
                    <path d="M 41 75 L 43 77 L 41 79 L 39 77 Z" fill="#fff" opacity="0.6"/>
                    <path d="M 59 68 L 61 70 L 59 72 L 57 70 Z" fill="#fff" opacity="0.6"/>
                    <!-- Belt with pouches -->
                    <rect x="35" y="62" width="30" height="3" fill="#8d6e63" stroke="#5d4037" stroke-width="1"/>
                    <circle cx="42" cy="65" r="2.5" fill="#6d4c41"/>
                    <circle cx="50" cy="65" r="3" fill="#8d6e63"/>
                    <circle cx="58" cy="65" r="2.5" fill="#6d4c41"/>
                    <!-- Magic staff (left hand) -->
                    <line x1="22" y1="58" x2="18" y2="25" stroke="#8d6e63" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="18" cy="22" r="5" fill="url(#magic-orb)" filter="url(#strong-glow)"/>
                    <circle cx="18" cy="22" r="3" fill="#e1bee7" opacity="0.8"/>
                    <circle cx="19" cy="21" r="1.5" fill="#fff"/>
                    <!-- Magic sparkles around staff -->
                    <circle cx="15" cy="28" r="1" fill="#e1bee7" opacity="0.9" class="tm-sparkle"/>
                    <circle cx="21" cy="26" r="0.8" fill="#ce93d8" opacity="0.8" class="tm-sparkle"/>
                    <circle cx="17" cy="31" r="1.2" fill="#ba68c8" opacity="0.9" class="tm-sparkle"/>
                    <!-- Arms -->
                    <ellipse cx="24" cy="60" rx="6" ry="11" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="1.5"/>
                    <ellipse cx="76" cy="60" rx="6" ry="11" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="1.5"/>
                    <!-- Hands -->
                    <ellipse cx="22" cy="68" rx="4" ry="5" fill="#ffccbc" stroke="#ff8a65" stroke-width="1"/>
                    <ellipse cx="78" cy="68" rx="4" ry="5" fill="#ffccbc" stroke="#ff8a65" stroke-width="1"/>
                    <!-- Head -->
                    <circle cx="50" cy="35" r="17" fill="#ffccbc" stroke="#ff8a65" stroke-width="1.5"/>
                    <!-- Wizard hat (tall and pointed) -->
                    <path d="M 35 30 L 50 5 L 65 30 Z" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="2"/>
                    <ellipse cx="50" cy="30" rx="18" ry="5" fill="url(#wizard-robe)" stroke="#4a148c" stroke-width="2"/>
                    <!-- Hat band with stars -->
                    <rect x="35" y="29" width="30" height="3" fill="#ffd54f" stroke="#f9a825" stroke-width="1"/>
                    <circle cx="42" cy="30.5" r="1" fill="#9c27b0"/>
                    <circle cx="50" cy="30.5" r="1" fill="#9c27b0"/>
                    <circle cx="58" cy="30.5" r="1" fill="#9c27b0"/>
                    <!-- Wise eyes (glasses optional) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="44" cy="35" rx="5" ry="5" fill="#fff" stroke="#ff8a65" stroke-width="1"/>
                        <ellipse cx="44" cy="36" rx="3" ry="3" fill="#5d4037"/>
                        <circle cx="45" cy="34.5" r="1" fill="#fff"/>
                        <ellipse cx="56" cy="35" rx="5" ry="5" fill="#fff" stroke="#ff8a65" stroke-width="1"/>
                        <ellipse cx="56" cy="36" rx="3" ry="3" fill="#5d4037"/>
                        <circle cx="57" cy="34.5" r="1" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 39 35 Q 44 33 49 35" stroke="#d84315" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 51 35 Q 56 33 61 35" stroke="#d84315" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Wise smile/mustache -->
                    <path class="tm-mascot-mouth-happy" d="M 44 42 Q 50 45 56 42" stroke="#d84315" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 44 Q 50 40 56 44" stroke="#d84315" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Mustache -->
                    <path d="M 44 42 Q 38 44 35 42" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path d="M 56 42 Q 62 44 65 42" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Beard (small, neat) -->
                    <path d="M 46 46 Q 50 48 54 46 L 53 50 Q 50 52 47 50 Z" fill="#8d6e63" stroke="#6d4c41" stroke-width="1"/>
                </g>

                <!-- OLD Stage - Elderly Tamagotchi -->
                <!-- DRAGON OLD -->
                <g id="tm-mascot-evo5-dragon" style="display: none;">
                    <defs>
                        <linearGradient id="sage-robe" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#eceff1;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#b0bec5;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="wisdom-aura">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.6" />
                            <stop offset="50%" style="stop-color:#80deea;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#26c6da;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Wisdom aura -->
                    <ellipse cx="50" cy="55" rx="48" ry="55" fill="url(#wisdom-aura)" class="tm-wisdom-aura"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="100" rx="28" ry="4" fill="#333" opacity="0.25"/>
                    <!-- Ancient staff (walking stick) -->
                    <line x1="72" y1="72" x2="75" y2="96" stroke="#795548" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="72" cy="70" r="4" fill="#9e9e9e" stroke="#616161" stroke-width="1"/>
                    <path d="M 70 68 Q 68 66 70 64 L 74 66 Z" fill="#90a4ae"/>
                    <!-- Robe (flowing,ancient) -->
                    <ellipse cx="50" cy="72" rx="24" ry="28" fill="url(#sage-robe)" stroke="#78909c" stroke-width="2"/>
                    <path d="M 32 55 L 28 94 Q 30 98 35 96 L 38 62 Z" fill="url(#sage-robe)" stroke="#78909c" stroke-width="1.5"/>
                    <path d="M 68 55 L 72 94 Q 70 98 65 96 L 62 62 Z" fill="url(#sage-robe)" stroke="#78909c" stroke-width="1.5"/>
                    <!-- Robe trim (gold, ancient) -->
                    <path d="M 30 56 Q 50 58 70 56" stroke="#ffd54f" stroke-width="2" fill="none"/>
                    <path d="M 32 70 Q 50 72 68 70" stroke="#ffd54f" stroke-width="1.5" fill="none" opacity="0.7"/>
                    <!-- Ancient symbols on robe -->
                    <text x="44" y="68" font-family="serif" font-size="8" fill="#90a4ae" opacity="0.6">☯</text>
                    <text x="50" y="80" font-family="serif" font-size="7" fill="#90a4ae" opacity="0.5">✦</text>
                    <!-- Arms (holding scroll) -->
                    <ellipse cx="30" cy="64" rx="6" ry="10" fill="url(#sage-robe)" stroke="#78909c" stroke-width="1.5"/>
                    <ellipse cx="70" cy="64" rx="6" ry="10" fill="url(#sage-robe)" stroke="#78909c" stroke-width="1.5"/>
                    <!-- Hands (aged) -->
                    <ellipse cx="28" cy="72" rx="4" ry="5" fill="#d7ccc8" stroke="#a1887f" stroke-width="1"/>
                    <ellipse cx="72" cy="72" rx="4" ry="5" fill="#d7ccc8" stroke="#a1887f" stroke-width="1"/>
                    <!-- Ancient scroll -->
                    <rect x="22" y="70" width="14" height="8" fill="#f3e5d0" rx="1" stroke="#bcaaa4" stroke-width="1"/>
                    <line x1="24" y1="72" x2="34" y2="72" stroke="#8d6e63" stroke-width="0.5"/>
                    <line x1="24" y1="74" x2="34" y2="74" stroke="#8d6e63" stroke-width="0.5"/>
                    <line x1="24" y1="76" x2="32" y2="76" stroke="#8d6e63" stroke-width="0.5"/>
                    <!-- Head (wise and aged) -->
                    <circle cx="50" cy="30" r="18" fill="#d7ccc8" stroke="#a1887f" stroke-width="1.5"/>
                    <!-- Wise wrinkles -->
                    <path d="M 38 32 Q 45 30 52 32" stroke="#8d6e63" stroke-width="0.8" fill="none" opacity="0.5"/>
                    <path d="M 48 32 Q 55 30 62 32" stroke="#8d6e63" stroke-width="0.8" fill="none" opacity="0.5"/>
                    <path d="M 36 36 Q 42 34 48 36" stroke="#8d6e63" stroke-width="0.7" fill="none" opacity="0.4"/>
                    <path d="M 52 36 Q 58 34 64 36" stroke="#8d6e63" stroke-width="0.7" fill="none" opacity="0.4"/>
                    <!-- Ancient wizard hat (conical, weathered) -->
                    <path d="M 36 24 L 50 2 L 64 24 Z" fill="url(#sage-robe)" stroke="#78909c" stroke-width="2"/>
                    <ellipse cx="50" cy="24" rx="17" ry="4" fill="url(#sage-robe)" stroke="#78909c" stroke-width="2"/>
                    <path d="M 36 24 Q 50 20 64 24" stroke="#ffd54f" stroke-width="1.5" fill="none"/>
                    <!-- Wise eyes (small, knowing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="30" rx="4" ry="4" fill="#fff" stroke="#a1887f" stroke-width="1"/>
                        <ellipse cx="43" cy="31" rx="2" ry="2" fill="#5d4037"/>
                        <circle cx="44" cy="30" r="0.8" fill="#fff" opacity="0.8"/>
                        <ellipse cx="57" cy="30" rx="4" ry="4" fill="#fff" stroke="#a1887f" stroke-width="1"/>
                        <ellipse cx="57" cy="31" rx="2" ry="2" fill="#5d4037"/>
                        <circle cx="58" cy="30" r="0.8" fill="#fff" opacity="0.8"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 39 30 Q 43 28 47 30" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 30 Q 57 28 61 30" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Serene smile -->
                    <path class="tm-mascot-mouth-happy" d="M 44 38 Q 50 40 56 38" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 40 Q 50 36 56 40" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Epic long beard (flowing) -->
                    <path d="M 42 40 Q 35 48 38 55 L 42 52 Q 40 46 42 42 Z" fill="#e0e0e0" stroke="#bdbdbd" stroke-width="1"/>
                    <path d="M 50 42 Q 46 52 48 60 L 52 58 Q 50 50 50 44 Z" fill="#e0e0e0" stroke="#bdbdbd" stroke-width="1"/>
                    <path d="M 58 40 Q 65 48 62 55 L 58 52 Q 60 46 58 42 Z" fill="#e0e0e0" stroke="#bdbdbd" stroke-width="1"/>
                    <!-- Beard details (strands) -->
                    <line x1="40" y1="45" x2="38" y2="52" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
                    <line x1="50" y1="47" x2="49" y2="56" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
                    <line x1="60" y1="45" x2="62" y2="52" stroke="#cfd8dc" stroke-width="0.5" opacity="0.6"/>
                    <!-- Mystical third eye (optional, subtle) -->
                    <circle cx="50" cy="25" r="2" fill="#80deea" opacity="0.4" filter="url(#glow)"/>
                    <circle cx="50" cy="25" r="1" fill="#4dd0e1" opacity="0.6"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- ROBOT CHARACTER - All Life Stages -->
                <!-- Tech & Code • Epic Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- ROBOT BABY - Simple bot baby -->
                <g id="tm-mascot-baby-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-baby-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#90caf9;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="85" rx="22" ry="6" fill="#333" opacity="0.15"/>
                    <!-- Simple cube body -->
                    <rect x="35" y="48" width="30" height="30" rx="4" fill="url(#robot-baby-body)" stroke="#1e88e5" stroke-width="2"/>
                    <!-- Panel lights -->
                    <circle cx="44" cy="62" r="2" fill="#4fc3f7" opacity="0.8"/>
                    <circle cx="50" cy="62" r="2" fill="#4fc3f7" opacity="0.8"/>
                    <circle cx="56" cy="62" r="2" fill="#4fc3f7" opacity="0.8"/>
                    <!-- Head (rounded cube) -->
                    <rect x="40" y="25" width="20" height="20" rx="3" fill="url(#robot-baby-body)" stroke="#1e88e5" stroke-width="2"/>
                    <!-- Antenna -->
                    <line x1="50" y1="25" x2="50" y2="20" stroke="#1e88e5" stroke-width="1.5"/>
                    <circle cx="50" cy="18" r="2" fill="#ff5722" opacity="0.8"/>
                    <!-- Eyes (LED screens) -->
                    <g class="tm-mascot-eye-open">
                        <rect x="43" y="32" width="3" height="4" fill="#4fc3f7"/>
                        <rect x="54" y="32" width="3" height="4" fill="#4fc3f7"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="43" y1="34" x2="46" y2="34" stroke="#1e88e5" stroke-width="1.5"/>
                        <line x1="54" y1="34" x2="57" y2="34" stroke="#1e88e5" stroke-width="1.5"/>
                    </g>
                    <!-- Mouth (LED line) -->
                    <path class="tm-mascot-mouth-happy" d="M 45 40 L 55 40" stroke="#4fc3f7" stroke-width="1.5"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 40 L 55 40" stroke="#ff5722" stroke-width="1.5"/>
                    <!-- Little arms -->
                    <rect x="30" y="54" width="5" height="12" rx="1" fill="url(#robot-baby-body)" stroke="#1e88e5" stroke-width="1.5"/>
                    <rect x="65" y="54" width="5" height="12" rx="1" fill="url(#robot-baby-body)" stroke="#1e88e5" stroke-width="1.5"/>
                    <!-- Little legs -->
                    <rect x="40" y="78" width="6" height="8" rx="1" fill="url(#robot-baby-body)" stroke="#1e88e5" stroke-width="1.5"/>
                    <rect x="54" y="78" width="6" height="8" rx="1" fill="url(#robot-baby-body)" stroke="#1e88e5" stroke-width="1.5"/>
                </g>

                <!-- ROBOT KID - Playful bot with wheels -->
                <g id="tm-mascot-evo1-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-kid-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#bbdefb;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#42a5f5;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="92" rx="25" ry="5" fill="#333" opacity="0.2"/>
                    <!-- Wheels -->
                    <circle cx="42" cy="88" r="6" fill="#37474f" stroke="#263238" stroke-width="2"/>
                    <circle cx="42" cy="88" r="3" fill="#546e7a"/>
                    <circle cx="58" cy="88" r="6" fill="#37474f" stroke="#263238" stroke-width="2"/>
                    <circle cx="58" cy="88" r="3" fill="#546e7a"/>
                    <!-- Body (rectangular) -->
                    <rect x="32" y="52" width="36" height="32" rx="4" fill="url(#robot-kid-body)" stroke="#1976d2" stroke-width="2.5"/>
                    <!-- Control panel -->
                    <rect x="40" y="60" width="20" height="15" rx="2" fill="#263238" opacity="0.3"/>
                    <circle cx="46" cy="68" r="2" fill="#76ff03"/>
                    <circle cx="54" cy="68" r="2" fill="#ffeb3b"/>
                    <!-- Head (monitor style) -->
                    <rect x="38" y="24" width="24" height="24" rx="3" fill="url(#robot-kid-body)" stroke="#1976d2" stroke-width="2.5"/>
                    <!-- Antenna with spring -->
                    <path d="M 50 24 L 50 22 Q 48 20 50 18 Q 52 20 50 16" stroke="#1976d2" stroke-width="1.5" fill="none"/>
                    <circle cx="50" cy="14" r="2.5" fill="#ff9800"/>
                    <!-- Eyes (digital displays) -->
                    <g class="tm-mascot-eye-open">
                        <rect x="42" y="32" width="5" height="6" rx="1" fill="#4fc3f7"/>
                        <rect x="53" y="32" width="5" height="6" rx="1" fill="#4fc3f7"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="42" y1="35" x2="47" y2="35" stroke="#1976d2" stroke-width="2"/>
                        <line x1="53" y1="35" x2="58" y2="35" stroke="#1976d2" stroke-width="2"/>
                    </g>
                    <!-- Mouth (LED smile) -->
                    <path class="tm-mascot-mouth-happy" d="M 43 42 L 47 44 L 53 44 L 57 42" stroke="#4fc3f7" stroke-width="2" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 43 44 L 47 42 L 53 42 L 57 44" stroke="#ff5722" stroke-width="2" fill="none"/>
                    <!-- Arms (articulated) -->
                    <rect x="26" y="56" width="6" height="16" rx="2" fill="url(#robot-kid-body)" stroke="#1976d2" stroke-width="2"/>
                    <circle cx="29" cy="72" r="3" fill="#546e7a"/>
                    <rect x="68" y="56" width="6" height="16" rx="2" fill="url(#robot-kid-body)" stroke="#1976d2" stroke-width="2"/>
                    <circle cx="71" cy="72" r="3" fill="#546e7a"/>
                </g>

                <!-- ROBOT TEEN - Sleek teen bot with gadgets -->
                <g id="tm-mascot-evo2-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-teen-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#64b5f6;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="26" ry="4" fill="#333" opacity="0.25"/>
                    <!-- Legs (streamlined) -->
                    <rect x="39" y="76" width="8" height="18" rx="2" fill="url(#robot-teen-body)" stroke="#0d47a1" stroke-width="2"/>
                    <rect x="53" y="76" width="8" height="18" rx="2" fill="url(#robot-teen-body)" stroke="#0d47a1" stroke-width="2"/>
                    <rect x="40" y="90" width="6" height="4" rx="1" fill="#37474f"/>
                    <rect x="54" y="90" width="6" height="4" rx="1" fill="#37474f"/>
                    <!-- Torso (armored) -->
                    <rect x="34" y="48" width="32" height="28" rx="4" fill="url(#robot-teen-body)" stroke="#0d47a1" stroke-width="2.5"/>
                    <!-- Chest core (glowing) -->
                    <circle cx="50" cy="62" r="6" fill="#4fc3f7" opacity="0.6" filter="url(#glow)"/>
                    <circle cx="50" cy="62" r="3" fill="#00e5ff"/>
                    <!-- Tech patterns -->
                    <path d="M 40 54 L 44 58 L 40 62" stroke="#00e5ff" stroke-width="1" fill="none" opacity="0.5"/>
                    <path d="M 60 54 L 56 58 L 60 62" stroke="#00e5ff" stroke-width="1" fill="none" opacity="0.5"/>
                    <!-- Head (visor style) -->
                    <rect x="37" y="22" width="26" height="22" rx="4" fill="url(#robot-teen-body)" stroke="#0d47a1" stroke-width="2.5"/>
                    <!-- Visor (one piece) -->
                    <rect x="40" y="28" width="20" height="10" rx="2" fill="#00e5ff" opacity="0.8"/>
                    <!-- Eyes visible through visor -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="45" cy="33" rx="3" ry="2" fill="#fff"/>
                        <ellipse cx="55" cy="33" rx="3" ry="2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="42" y1="33" x2="48" y2="33" stroke="#1976d2" stroke-width="2"/>
                        <line x1="52" y1="33" x2="58" y2="33" stroke="#1976d2" stroke-width="2"/>
                    </g>
                    <!-- Communication speaker -->
                    <rect x="42" y="38" width="16" height="3" rx="1" fill="#263238" opacity="0.4"/>
                    <!-- Arms (robotic joints) -->
                    <rect x="28" y="50" width="6" height="18" rx="2" fill="url(#robot-teen-body)" stroke="#0d47a1" stroke-width="2"/>
                    <circle cx="31" cy="60" r="2" fill="#37474f"/>
                    <circle cx="31" cy="68" r="3" fill="#546e7a"/>
                    <rect x="66" y="50" width="6" height="18" rx="2" fill="url(#robot-teen-body)" stroke="#0d47a1" stroke-width="2"/>
                    <circle cx="69" cy="60" r="2" fill="#37474f"/>
                    <circle cx="69" cy="68" r="3" fill="#546e7a"/>
                </g>

                <!-- ROBOT ADULT - Advanced humanoid robot -->
                <g id="tm-mascot-evo3-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-adult-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#2196f3;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0d47a1;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="robot-core-glow">
                            <stop offset="0%" style="stop-color:#00e5ff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00b0ff;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="96" rx="28" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Legs (powerful) -->
                    <rect x="38" y="72" width="9" height="24" rx="3" fill="url(#robot-adult-body)" stroke="#01579b" stroke-width="2.5"/>
                    <rect x="53" y="72" width="9" height="24" rx="3" fill="url(#robot-adult-body)" stroke="#01579b" stroke-width="2.5"/>
                    <!-- Knee joints -->
                    <circle cx="42.5" cy="84" r="3" fill="#37474f" stroke="#263238" stroke-width="1"/>
                    <circle cx="57.5" cy="84" r="3" fill="#37474f" stroke="#263238" stroke-width="1"/>
                    <!-- Boots (heavy) -->
                    <rect x="36" y="92" width="13" height="4" rx="1" fill="#263238"/>
                    <rect x="51" y="92" width="13" height="4" rx="1" fill="#263238"/>
                    <!-- Torso (armored hero) -->
                    <rect x="32" y="44" width="36" height="28" rx="4" fill="url(#robot-adult-body)" stroke="#01579b" stroke-width="3"/>
                    <!-- Power core (glowing center) -->
                    <circle cx="50" cy="58" r="10" fill="url(#robot-core-glow)" opacity="0.6"/>
                    <circle cx="50" cy="58" r="6" fill="#00e5ff" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="58" r="3" fill="#fff" opacity="0.8"/>
                    <!-- Armor plates -->
                    <path d="M 36 48 L 40 52 L 36 56" stroke="#00e5ff" stroke-width="1.5" fill="none" opacity="0.6"/>
                    <path d="M 64 48 L 60 52 L 64 56" stroke="#00e5ff" stroke-width="1.5" fill="none" opacity="0.6"/>
                    <rect x="40" y="64" width="20" height="2" fill="#37474f" opacity="0.3"/>
                    <rect x="40" y="68" width="20" height="2" fill="#37474f" opacity="0.3"/>
                    <!-- Head (heroic helmet) -->
                    <rect x="38" y="18" width="24" height="24" rx="4" fill="url(#robot-adult-body)" stroke="#01579b" stroke-width="3"/>
                    <!-- Helmet crest -->
                    <path d="M 44 18 L 50 14 L 56 18" stroke="#00e5ff" stroke-width="2" fill="none"/>
                    <!-- Visor (advanced) -->
                    <path d="M 40 26 L 60 26 L 58 34 L 42 34 Z" fill="#00e5ff" opacity="0.9"/>
                    <!-- Eyes through visor -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="45" cy="30" rx="3" ry="2.5" fill="#fff" opacity="0.9"/>
                        <ellipse cx="45" cy="31" rx="1.5" ry="1.5" fill="#01579b"/>
                        <ellipse cx="55" cy="30" rx="3" ry="2.5" fill="#fff" opacity="0.9"/>
                        <ellipse cx="55" cy="31" rx="1.5" ry="1.5" fill="#01579b"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="42" y1="30" x2="48" y2="30" stroke="#01579b" stroke-width="2.5"/>
                        <line x1="52" y1="30" x2="58" y2="30" stroke="#01579b" stroke-width="2.5"/>
                    </g>
                    <!-- Mouth grille -->
                    <rect x="44" y="36" width="12" height="4" rx="1" fill="#263238" opacity="0.5"/>
                    <line x1="45" y1="36" x2="45" y2="40" stroke="#00e5ff" stroke-width="0.5" opacity="0.3"/>
                    <line x1="48" y1="36" x2="48" y2="40" stroke="#00e5ff" stroke-width="0.5" opacity="0.3"/>
                    <line x1="52" y1="36" x2="52" y2="40" stroke="#00e5ff" stroke-width="0.5" opacity="0.3"/>
                    <line x1="55" y1="36" x2="55" y2="40" stroke="#00e5ff" stroke-width="0.5" opacity="0.3"/>
                    <!-- Arms (powerful joints) -->
                    <rect x="24" y="46" width="8" height="20" rx="3" fill="url(#robot-adult-body)" stroke="#01579b" stroke-width="2.5"/>
                    <circle cx="28" cy="56" r="3" fill="#37474f" stroke="#263238" stroke-width="1"/>
                    <circle cx="28" cy="66" r="4" fill="#546e7a"/>
                    <rect x="68" y="46" width="8" height="20" rx="3" fill="url(#robot-adult-body)" stroke="#01579b" stroke-width="2.5"/>
                    <circle cx="72" cy="56" r="3" fill="#37474f" stroke="#263238" stroke-width="1"/>
                    <circle cx="72" cy="66" r="4" fill="#546e7a"/>
                </g>

                <!-- ROBOT MIDDLE AGE - Experienced engineer bot -->
                <g id="tm-mascot-evo4-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-middle-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#1e88e5;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0d47a1;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="96" rx="28" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Legs (sturdy) -->
                    <rect x="38" y="72" width="9" height="24" rx="3" fill="url(#robot-middle-body)" stroke="#01579b" stroke-width="2.5"/>
                    <rect x="53" y="72" width="9" height="24" rx="3" fill="url(#robot-middle-body)" stroke="#01579b" stroke-width="2.5"/>
                    <circle cx="42.5" cy="84" r="3" fill="#37474f"/>
                    <circle cx="57.5" cy="84" r="3" fill="#37474f"/>
                    <rect x="36" y="92" width="13" height="4" rx="1" fill="#263238"/>
                    <rect x="51" y="92" width="13" height="4" rx="1" fill="#263238"/>
                    <!-- Torso (tool belt) -->
                    <rect x="32" y="44" width="36" height="28" rx="4" fill="url(#robot-middle-body)" stroke="#01579b" stroke-width="3"/>
                    <!-- Power core (dimmer, stable) -->
                    <circle cx="50" cy="58" r="6" fill="#42a5f5" opacity="0.8"/>
                    <circle cx="50" cy="58" r="3" fill="#90caf9"/>
                    <!-- Tool belt -->
                    <rect x="34" y="68" width="32" height="4" fill="#795548"/>
                    <rect x="40" y="69" width="3" height="2" fill="#ff9800"/>
                    <rect x="48" y="69" width="4" height="2" fill="#37474f"/>
                    <rect x="57" y="69" width="3" height="2" fill="#4caf50"/>
                    <!-- Maintenance panel -->
                    <rect x="38" y="50" width="24" height="14" rx="2" fill="#263238" opacity="0.3"/>
                    <circle cx="44" cy="57" r="1.5" fill="#76ff03"/>
                    <circle cx="50" cy="57" r="1.5" fill="#ffeb3b"/>
                    <circle cx="56" cy="57" r="1.5" fill="#ff5722"/>
                    <!-- Head (engineer helmet) -->
                    <rect x="38" y="18" width="24" height="24" rx="4" fill="url(#robot-middle-body)" stroke="#01579b" stroke-width="3"/>
                    <!-- Headlamp -->
                    <circle cx="50" cy="18" r="3" fill="#ffeb3b" opacity="0.8"/>
                    <circle cx="50" cy="18" r="1.5" fill="#fff"/>
                    <!-- Visor (engineer goggles style) -->
                    <ellipse cx="45" cy="28" rx="5" ry="4" fill="#263238" opacity="0.6" stroke="#01579b" stroke-width="1.5"/>
                    <ellipse cx="55" cy="28" rx="5" ry="4" fill="#263238" opacity="0.6" stroke="#01579b" stroke-width="1.5"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="45" cy="28" r="2.5" fill="#4fc3f7"/>
                        <circle cx="55" cy="28" r="2.5" fill="#4fc3f7"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="42" y1="28" x2="48" y2="28" stroke="#01579b" stroke-width="2"/>
                        <line x1="52" y1="28" x2="58" y2="28" stroke="#01579b" stroke-width="2"/>
                    </g>
                    <!-- Mouth (speaker grille) -->
                    <rect x="44" y="34" width="12" height="4" rx="1" fill="#263238" opacity="0.5"/>
                    <!-- Arms (tool arms) -->
                    <rect x="24" y="46" width="8" height="20" rx="3" fill="url(#robot-middle-body)" stroke="#01579b" stroke-width="2.5"/>
                    <circle cx="28" cy="56" r="3" fill="#37474f"/>
                    <circle cx="28" cy="66" r="4" fill="#546e7a"/>
                    <rect x="68" y="46" width="8" height="20" rx="3" fill="url(#robot-middle-body)" stroke="#01579b" stroke-width="2.5"/>
                    <circle cx="72" cy="56" r="3" fill="#37474f"/>
                    <circle cx="72" cy="66" r="4" fill="#546e7a"/>
                    <!-- Wrench in hand -->
                    <rect x="22" y="64" width="3" height="8" fill="#9e9e9e"/>
                    <path d="M 20 64 L 24 60 L 26 62 L 22 66 Z" fill="#9e9e9e"/>
                </g>

                <!-- ROBOT OLD - Ancient wise bot -->
                <g id="tm-mascot-evo5-robot" style="display: none;">
                    <defs>
                        <linearGradient id="robot-old-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#78909c;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#455a64;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="96" rx="28" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Walking staff/cane (robotic) -->
                    <line x1="70" y1="72" x2="72" y2="94" stroke="#78909c" stroke-width="3"/>
                    <circle cx="70" cy="70" r="3" fill="#90a4ae"/>
                    <!-- Legs (worn, slower) -->
                    <rect x="38" y="72" width="9" height="24" rx="3" fill="url(#robot-old-body)" stroke="#37474f" stroke-width="2.5"/>
                    <rect x="53" y="72" width="9" height="24" rx="3" fill="url(#robot-old-body)" stroke="#37474f" stroke-width="2.5"/>
                    <!-- Rust/wear marks -->
                    <circle cx="42" cy="78" r="1.5" fill="#8d6e63" opacity="0.4"/>
                    <circle cx="56" cy="80" r="1.2" fill="#8d6e63" opacity="0.4"/>
                    <circle cx="42.5" cy="84" r="3" fill="#37474f"/>
                    <circle cx="57.5" cy="84" r="3" fill="#37474f"/>
                    <rect x="36" y="92" width="13" height="4" rx="1" fill="#263238"/>
                    <rect x="51" y="92" width="13" height="4" rx="1" fill="#263238"/>
                    <!-- Torso (aged, patched) -->
                    <rect x="32" y="44" width="36" height="28" rx="4" fill="url(#robot-old-body)" stroke="#37474f" stroke-width="3"/>
                    <!-- Power core (flickering) -->
                    <circle cx="50" cy="58" r="6" fill="#607d8b" opacity="0.6"/>
                    <circle cx="50" cy="58" r="3" fill="#90a4ae" opacity="0.5"/>
                    <!-- Wear patches -->
                    <rect x="38" y="48" width="6" height="4" fill="#8d6e63" opacity="0.3" rx="1"/>
                    <rect x="56" y="52" width="5" height="3" fill="#8d6e63" opacity="0.3" rx="1"/>
                    <circle cx="44" cy="65" r="2" fill="#8d6e63" opacity="0.3"/>
                    <!-- Serial number plate (old) -->
                    <rect x="40" y="64" width="20" height="4" rx="1" fill="#263238" opacity="0.4"/>
                    <text x="44" y="67" font-family="monospace" font-size="3" fill="#90a4ae" opacity="0.6">UNIT-001</text>
                    <!-- Head (ancient design) -->
                    <rect x="38" y="18" width="24" height="24" rx="4" fill="url(#robot-old-body)" stroke="#37474f" stroke-width="3"/>
                    <!-- Antenna (bent) -->
                    <path d="M 50 18 Q 54 12 52 8" stroke="#607d8b" stroke-width="1.5" fill="none"/>
                    <circle cx="52" cy="6" r="1.5" fill="#8d6e63"/>
                    <!-- Visor (cracked/old) -->
                    <rect x="40" y="24" width="20" height="12" rx="2" fill="#263238" opacity="0.6"/>
                    <path d="M 42 26 L 58 34" stroke="#78909c" stroke-width="0.5" opacity="0.3"/>
                    <!-- Eyes (dimmer) -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="45" cy="30" r="2.5" fill="#607d8b" opacity="0.7"/>
                        <circle cx="55" cy="30" r="2.5" fill="#607d8b" opacity="0.7"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="42" y1="30" x2="48" y2="30" stroke="#37474f" stroke-width="2"/>
                        <line x1="52" y1="30" x2="58" y2="30" stroke="#37474f" stroke-width="2"/>
                    </g>
                    <!-- Mouth (static) -->
                    <rect x="44" y="36" width="12" height="3" rx="1" fill="#263238" opacity="0.4"/>
                    <!-- Arms (slower joints) -->
                    <rect x="24" y="46" width="8" height="20" rx="3" fill="url(#robot-old-body)" stroke="#37474f" stroke-width="2.5"/>
                    <circle cx="28" cy="56" r="3" fill="#37474f"/>
                    <circle cx="28" cy="66" r="4" fill="#546e7a"/>
                    <rect x="68" y="46" width="8" height="20" rx="3" fill="url(#robot-old-body)" stroke="#37474f" stroke-width="2.5"/>
                    <circle cx="72" cy="56" r="3" fill="#37474f"/>
                    <circle cx="72" cy="66" r="4" fill="#546e7a"/>
                    <!-- Data port (unused) -->
                    <rect x="58" y="48" width="4" height="2" fill="#455a64" opacity="0.5"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- SLIME CHARACTER - All Life Stages -->
                <!-- Liquid & Bounce • Rare Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- SLIME BABY - Tiny bouncy blob -->
                <g id="tm-mascot-baby-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-baby-body">
                            <stop offset="0%" style="stop-color:#e0f8e0;stop-opacity:0.9" />
                            <stop offset="70%" style="stop-color:#a5d6a7;stop-opacity:0.95" />
                            <stop offset="100%" style="stop-color:#81c784;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="84" rx="24" ry="6" fill="#333" opacity="0.15"/>
                    <!-- Main slime blob (wobbly) -->
                    <ellipse cx="50" cy="58" rx="22" ry="24" fill="url(#slime-baby-body)" opacity="0.9"/>
                    <!-- Glossy highlight -->
                    <ellipse cx="42" cy="48" rx="10" ry="12" fill="#fff" opacity="0.5"/>
                    <ellipse cx="54" cy="52" rx="6" ry="8" fill="#fff" opacity="0.3"/>
                    <!-- Inner goo -->
                    <ellipse cx="50" cy="60" rx="14" ry="16" fill="#81c784" opacity="0.4"/>
                    <!-- Cute big eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="54" rx="5" ry="6" fill="#fff" stroke="#66bb6a" stroke-width="1.5"/>
                        <ellipse cx="43" cy="56" rx="3" ry="4" fill="#2e7d32"/>
                        <circle cx="44" cy="54" r="1.5" fill="#fff" opacity="0.9"/>
                        <ellipse cx="57" cy="54" rx="5" ry="6" fill="#fff" stroke="#66bb6a" stroke-width="1.5"/>
                        <ellipse cx="57" cy="56" rx="3" ry="4" fill="#2e7d32"/>
                        <circle cx="58" cy="54" r="1.5" fill="#fff" opacity="0.9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 38 54 Q 43 52 48 54" stroke="#66bb6a" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 54 Q 57 52 62 54" stroke="#66bb6a" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth (simple) -->
                    <path class="tm-mascot-mouth-happy" d="M 42 64 Q 50 68 58 64" stroke="#66bb6a" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 66 Q 50 62 58 66" stroke="#66bb6a" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <!-- Bouncy bottom -->
                    <ellipse cx="50" cy="78" rx="20" ry="8" fill="url(#slime-baby-body)" opacity="0.7"/>
                </g>

                <!-- SLIME KID - Growing slime blob -->
                <g id="tm-mascot-evo1-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-kid-body">
                            <stop offset="0%" style="stop-color:#d4f1d4;stop-opacity:0.9" />
                            <stop offset="70%" style="stop-color:#81c784;stop-opacity:0.95" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="88" rx="26" ry="6" fill="#333" opacity="0.2"/>
                    <!-- Main blob -->
                    <path d="M 28 62 Q 28 38 38 32 Q 50 26 62 32 Q 72 38 72 62 Q 68 78 58 84 Q 50 88 42 84 Q 32 78 28 62 Z" 
                          fill="url(#slime-kid-body)" opacity="0.95"/>
                    <!-- Glossy highlights -->
                    <ellipse cx="40" cy="44" rx="12" ry="14" fill="#fff" opacity="0.5"/>
                    <ellipse cx="58" cy="48" rx="8" ry="10" fill="#fff" opacity="0.3"/>
                    <!-- Gooey interior -->
                    <ellipse cx="50" cy="58" rx="16" ry="18" fill="#66bb6a" opacity="0.4"/>
                    <circle cx="45" cy="54" r="2" fill="#81c784" opacity="0.6"/>
                    <circle cx="54" cy="60" r="1.5" fill="#81c784" opacity="0.6"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="52" rx="5.5" ry="7" fill="#fff" stroke="#4caf50" stroke-width="1.5"/>
                        <ellipse cx="42" cy="54" rx="3.5" ry="4.5" fill="#1b5e20"/>
                        <circle cx="43.5" cy="52" r="1.5" fill="#fff" opacity="0.9"/>
                        <ellipse cx="58" cy="52" rx="5.5" ry="7" fill="#fff" stroke="#4caf50" stroke-width="1.5"/>
                        <ellipse cx="58" cy="54" rx="3.5" ry="4.5" fill="#1b5e20"/>
                        <circle cx="59.5" cy="52" r="1.5" fill="#fff" opacity="0.9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 52 Q 42 50 48 52" stroke="#4caf50" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 52 Q 58 50 64 52" stroke="#4caf50" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 40 64 Q 50 70 60 64" stroke="#4caf50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 66 Q 50 60 60 66" stroke="#4caf50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <!-- Drip effects -->
                    <ellipse cx="36" cy="76" rx="4" ry="6" fill="url(#slime-kid-body)" opacity="0.8"/>
                    <ellipse cx="64" cy="78" rx="3.5" ry="5" fill="url(#slime-kid-body)" opacity="0.8"/>
                </g>

                <!-- SLIME TEEN - Shapeshifting slime -->
                <g id="tm-mascot-evo2-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-teen-body">
                            <stop offset="0%" style="stop-color:#c8e6c9;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#66bb6a;stop-opacity:0.98" />
                            <stop offset="100%" style="stop-color:#4caf50;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="92" rx="28" ry="5" fill="#333" opacity="0.25"/>
                    <!-- Main blob (more defined shape) -->
                    <path d="M 26 64 Q 26 42 34 34 Q 44 28 50 26 Q 56 28 66 34 Q 74 42 74 64 Q 72 80 64 86 Q 50 94 36 86 Q 28 80 26 64 Z" 
                          fill="url(#slime-teen-body)"/>
                    <!-- Glossy highlights -->
                    <ellipse cx="38" cy="46" rx="14" ry="16" fill="#fff" opacity="0.5"/>
                    <ellipse cx="58" cy="50" rx="10" ry="12" fill="#fff" opacity="0.35"/>
                    <!-- Shape-shift tendrils (emerging) -->
                    <path d="M 30 56 Q 24 58 20 54" stroke="#66bb6a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
                    <circle cx="18" cy="52" r="3" fill="#66bb6a" opacity="0.8"/>
                    <path d="M 70 58 Q 76 60 80 56" stroke="#66bb6a" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
                    <circle cx="82" cy="54" r="3" fill="#66bb6a" opacity="0.8"/>
                    <!-- Interior goo (more complex) -->
                    <ellipse cx="50" cy="60" rx="18" ry="20" fill="#4caf50" opacity="0.4"/>
                    <circle cx="44" cy="56" r="2.5" fill="#66bb6a" opacity="0.7"/>
                    <circle cx="54" cy="62" r="2" fill="#66bb6a" opacity="0.7"/>
                    <circle cx="50" cy="72" r="1.8" fill="#66bb6a" opacity="0.6"/>
                    <!-- Eyes (more expressive) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="52" rx="6" ry="8" fill="#fff" stroke="#388e3c" stroke-width="2"/>
                        <ellipse cx="42" cy="54" rx="4" ry="5" fill="#1b5e20"/>
                        <circle cx="44" cy="52" r="1.8" fill="#fff" opacity="0.9"/>
                        <ellipse cx="58" cy="52" rx="6" ry="8" fill="#fff" stroke="#388e3c" stroke-width="2"/>
                        <ellipse cx="58" cy="54" rx="4" ry="5" fill="#1b5e20"/>
                        <circle cx="60" cy="52" r="1.8" fill="#fff" opacity="0.9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 52 Q 42 50 48 52" stroke="#388e3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 52 52 Q 58 50 64 52" stroke="#388e3c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 38 66 Q 50 72 62 66" stroke="#388e3c" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 38 68 Q 50 62 62 68" stroke="#388e3c" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <!-- Drips -->
                    <ellipse cx="34" cy="82" rx="4" ry="8" fill="url(#slime-teen-body)" opacity="0.9"/>
                    <ellipse cx="50" cy="88" rx="5" ry="6" fill="url(#slime-teen-body)" opacity="0.9"/>
                    <ellipse cx="66" cy="84" rx="3.5" ry="7" fill="url(#slime-teen-body)" opacity="0.9"/>
                </g>

                <!-- SLIME ADULT - Mastered shapeshifter -->
                <g id="tm-mascot-evo3-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-adult-body">
                            <stop offset="0%" style="stop-color:#aed581;stop-opacity:0.98" />
                            <stop offset="70%" style="stop-color:#4caf50;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#388e3c;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="30" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Main humanoid-ish blob form -->
                    <ellipse cx="50" cy="66" rx="22" ry="28" fill="url(#slime-adult-body)"/>
                    <!-- Arms (formed tendrils) -->
                    <ellipse cx="30" cy="58" rx="6" ry="16" fill="url(#slime-adult-body)" transform="rotate(-15 30 58)"/>
                    <ellipse cx="28" cy="72" rx="4" ry="6" fill="url(#slime-adult-body)"/>
                    <ellipse cx="70" cy="58" rx="6" ry="16" fill="url(#slime-adult-body)" transform="rotate(15 70 58)"/>
                    <ellipse cx="72" cy="72" rx="4" ry="6" fill="url(#slime-adult-body)"/>
                    <!-- Legs (blob columns) -->
                    <ellipse cx="42" cy="86" rx="6" ry="10" fill="url(#slime-adult-body)"/>
                    <ellipse cx="58" cy="86" rx="6" ry="10" fill="url(#slime-adult-body)"/>
                    <!-- Glossy highlights -->
                    <ellipse cx="40" cy="52" rx="12" ry="16" fill="#fff" opacity="0.5"/>
                    <ellipse cx="58" cy="56" rx="9" ry="12" fill="#fff" opacity="0.35"/>
                    <!-- Core (visible) -->
                    <circle cx="50" cy="66" r="8" fill="#66bb6a" opacity="0.6" filter="url(#glow)"/>
                    <circle cx="50" cy="66" r="4" fill="#81c784"/>
                    <!-- Head area -->
                    <ellipse cx="50" cy="46" rx="16" ry="18" fill="url(#slime-adult-body)" opacity="0.95"/>
                    <!-- Eyes (confident) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="46" rx="5" ry="7" fill="#fff" stroke="#2e7d32" stroke-width="2"/>
                        <ellipse cx="43" cy="48" rx="3.5" ry="4.5" fill="#1b5e20"/>
                        <circle cx="44.5" cy="46" r="1.5" fill="#fff"/>
                        <ellipse cx="57" cy="46" rx="5" ry="7" fill="#fff" stroke="#2e7d32" stroke-width="2"/>
                        <ellipse cx="57" cy="48" rx="3.5" ry="4.5" fill="#1b5e20"/>
                        <circle cx="58.5" cy="46" r="1.5" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 38 46 Q 43 44 48 46" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 52 46 Q 57 44 62 46" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 40 54 Q 50 60 60 54" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 56 Q 50 50 60 56" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                </g>

                <!-- SLIME MIDDLE AGE - Stable slime form -->
                <g id="tm-mascot-evo4-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-middle-body">
                            <stop offset="0%" style="stop-color:#9ccc65;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#43a047;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#2e7d32;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="28" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Main body (more solid, less wobbly) -->
                    <ellipse cx="50" cy="68" rx="20" ry="26" fill="url(#slime-middle-body)"/>
                    <!-- Arms -->
                    <ellipse cx="32" cy="60" rx="5" ry="14" fill="url(#slime-middle-body)" transform="rotate(-10 32 60)"/>
                    <ellipse cx="30" cy="72" rx="4" ry="5" fill="url(#slime-middle-body)"/>
                    <ellipse cx="68" cy="60" rx="5" ry="14" fill="url(#slime-middle-body)" transform="rotate(10 68 60)"/>
                    <ellipse cx="70" cy="72" rx="4" ry="5" fill="url(#slime-middle-body)"/>
                    <!-- Legs -->
                    <ellipse cx="42" cy="88" rx="6" ry="10" fill="url(#slime-middle-body)"/>
                    <ellipse cx="58" cy="88" rx="6" ry="10" fill="url(#slime-middle-body)"/>
                    <!-- Glossy highlights (less bright) -->
                    <ellipse cx="42" cy="56" rx="10" ry="14" fill="#fff" opacity="0.4"/>
                    <ellipse cx="56" cy="60" rx="7" ry="10" fill="#fff" opacity="0.3"/>
                    <!-- Core (darker) -->
                    <circle cx="50" cy="68" r="6" fill="#558b2f" opacity="0.6"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="48" rx="15" ry="17" fill="url(#slime-middle-body)"/>
                    <!-- Eyes (wise) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="48" rx="4.5" ry="6" fill="#fff" stroke="#1b5e20" stroke-width="1.5"/>
                        <ellipse cx="43" cy="50" rx="3" ry="4" fill="#1b5e20"/>
                        <circle cx="44" cy="48" r="1.2" fill="#fff"/>
                        <ellipse cx="57" cy="48" rx="4.5" ry="6" fill="#fff" stroke="#1b5e20" stroke-width="1.5"/>
                        <ellipse cx="57" cy="50" rx="3" ry="4" fill="#1b5e20"/>
                        <circle cx="58" cy="48" r="1.2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 38 48 Q 43 46 48 48" stroke="#1b5e20" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 48 Q 57 46 62 48" stroke="#1b5e20" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth (content) -->
                    <path class="tm-mascot-mouth-happy" d="M 42 56 Q 50 60 58 56" stroke="#1b5e20" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 58 Q 50 54 58 58" stroke="#1b5e20" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- SLIME OLD - Ancient primordial ooze -->
                <g id="tm-mascot-evo5-slime" style="display: none;">
                    <defs>
                        <radialGradient id="slime-old-body">
                            <stop offset="0%" style="stop-color:#7cb342;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#33691e;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1b5e20;stop-opacity:1" />
                        </radialGradient>
                    </defs>
                    <!-- Shadow (larger) -->
                    <ellipse cx="50" cy="92" rx="32" ry="5" fill="#333" opacity="0.35"/>
                    <!-- Main body (spreading, ancient) -->
                    <ellipse cx="50" cy="70" rx="28" ry="24" fill="url(#slime-old-body)" opacity="0.95"/>
                    <!-- Ancient tendrils -->
                    <path d="M 24 64 Q 18 66 14 62 Q 12 58 14 54" stroke="#33691e" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
                    <circle cx="12" cy="52" r="4" fill="#33691e" opacity="0.8"/>
                    <path d="M 76 66 Q 82 68 86 64 Q 88 60 86 56" stroke="#33691e" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
                    <circle cx="88" cy="54" r="4" fill="#33691e" opacity="0.8"/>
                    <!-- Legs (thick, old) -->
                    <ellipse cx="42" cy="88" rx="7" ry="8" fill="url(#slime-old-body)"/>
                    <ellipse cx="58" cy="88" rx="7" ry="8" fill="url(#slime-old-body)"/>
                    <!-- Ancient sediment layers -->
                    <ellipse cx="50" cy="74" rx="22" ry="4" fill="#1b5e20" opacity="0.4"/>
                    <ellipse cx="50" cy="78" rx="20" ry="3" fill="#1b5e20" opacity="0.3"/>
                    <!-- Glossy (dimmer) -->
                    <ellipse cx="42" cy="60" rx="10" ry="12" fill="#fff" opacity="0.25"/>
                    <!-- Ancient core -->
                    <circle cx="50" cy="70" r="8" fill="#1b5e20" opacity="0.7"/>
                    <circle cx="50" cy="70" r="4" fill="#33691e" opacity="0.6"/>
                    <!-- Head/face area -->
                    <ellipse cx="50" cy="52" rx="18" ry="16" fill="url(#slime-old-body)" opacity="0.9"/>
                    <!-- Eyes (ancient, knowing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="52" rx="5" ry="6" fill="#558b2f" opacity="0.8"/>
                        <ellipse cx="42" cy="53" rx="3" ry="3.5" fill="#1b5e20"/>
                        <circle cx="43" cy="51" r="1" fill="#7cb342" opacity="0.6"/>
                        <ellipse cx="58" cy="52" rx="5" ry="6" fill="#558b2f" opacity="0.8"/>
                        <ellipse cx="58" cy="53" rx="3" ry="3.5" fill="#1b5e20"/>
                        <circle cx="59" cy="51" r="1" fill="#7cb342" opacity="0.6"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 52 Q 42 50 47 52" stroke="#1b5e20" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 52 Q 58 50 63 52" stroke="#1b5e20" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth (wise, serene) -->
                    <path class="tm-mascot-mouth-happy" d="M 40 60 Q 50 64 60 60" stroke="#1b5e20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 62 Q 50 58 60 62" stroke="#1b5e20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <!-- Primordial bubbles -->
                    <circle cx="36" cy="66" r="2" fill="#558b2f" opacity="0.4"/>
                    <circle cx="64" cy="68" r="1.5" fill="#558b2f" opacity="0.4"/>
                    <circle cx="50" cy="80" r="2.5" fill="#558b2f" opacity="0.3"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- PLANT CHARACTER - All Life Stages -->
                <!-- Nature & Growth • Rare Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- PLANT BABY - Tiny sprout -->
                <g id="tm-mascot-baby-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-baby-stem" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#a5d6a7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="86" rx="20" ry="4" fill="#333" opacity="0.15"/>
                    <!-- Soil/pot -->
                    <ellipse cx="50" cy="82" rx="18" ry="6" fill="#8d6e63"/>
                    <ellipse cx="50" cy="78" rx="16" ry="4" fill="#6d4c41"/>
                    <!-- Simple stem -->
                    <rect x="48" y="58" width="4" height="22" rx="2" fill="url(#plant-baby-stem)"/>
                    <!-- Two leaves -->
                    <ellipse cx="42" cy="66" rx="8" ry="6" fill="#81c784" transform="rotate(-30 42 66)"/>
                    <path d="M 42 66 L 48 68" stroke="#66bb6a" stroke-width="1"/>
                    <ellipse cx="58" cy="66" rx="8" ry="6" fill="#81c784" transform="rotate(30 58 66)"/>
                    <path d="M 58 66 L 52 68" stroke="#66bb6a" stroke-width="1"/>
                    <!-- Cute bulb head -->
                    <circle cx="50" cy="52" r="14" fill="#c5e1a5"/>
                    <circle cx="50" cy="52" r="11" fill="#aed581"/>
                    <!-- Cute face -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="44" cy="50" r="3" fill="#fff"/>
                        <circle cx="44" cy="51" r="2" fill="#33691e"/>
                        <circle cx="45" cy="50" r="0.8" fill="#fff"/>
                        <circle cx="56" cy="50" r="3" fill="#fff"/>
                        <circle cx="56" cy="51" r="2" fill="#33691e"/>
                        <circle cx="57" cy="50" r="0.8" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 41 50 Q 44 48 47 50" stroke="#66bb6a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 50 Q 56 48 59 50" stroke="#66bb6a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 44 56 Q 50 60 56 56" stroke="#66bb6a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 58 Q 50 54 56 58" stroke="#66bb6a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Little petal on top -->
                    <ellipse cx="50" cy="42" rx="4" ry="6" fill="#aed581"/>
                </g>

                <!-- PLANT KID - Growing sapling -->
                <g id="tm-mascot-evo1-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-kid-stem" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#9ccc65;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#7cb342;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="90" rx="22" ry="5" fill="#333" opacity="0.2"/>
                    <!-- Roots visible -->
                    <path d="M 48 88 Q 42 92 38 90" stroke="#8d6e63" stroke-width="2" fill="none"/>
                    <path d="M 52 88 Q 58 92 62 90" stroke="#8d6e63" stroke-width="2" fill="none"/>
                    <!-- Main stem (thicker) -->
                    <rect x="46" y="50" width="8" height="40" rx="3" fill="url(#plant-kid-stem)"/>
                    <!-- Multiple leaves -->
                    <ellipse cx="38" cy="70" rx="10" ry="7" fill="#8bc34a" transform="rotate(-35 38 70)"/>
                    <path d="M 38 70 L 46 72" stroke="#7cb342" stroke-width="1.5"/>
                    <ellipse cx="62" cy="70" rx="10" ry="7" fill="#8bc34a" transform="rotate(35 62 70)"/>
                    <path d="M 62 70 L 54 72" stroke="#7cb342" stroke-width="1.5"/>
                    <ellipse cx="36" cy="58" rx="9" ry="6" fill="#8bc34a" transform="rotate(-40 36 58)"/>
                    <path d="M 36 58 L 46 60" stroke="#7cb342" stroke-width="1.5"/>
                    <ellipse cx="64" cy="58" rx="9" ry="6" fill="#8bc34a" transform="rotate(40 64 58)"/>
                    <path d="M 64 58 L 54 60" stroke="#7cb342" stroke-width="1.5"/>
                    <!-- Head (bulb blooming) -->
                    <circle cx="50" cy="38" r="16" fill="#c5e1a5"/>
                    <circle cx="50" cy="38" r="13" fill="#aed581"/>
                    <!-- Starting to bloom -->
                    <ellipse cx="38" cy="32" rx="6" ry="8" fill="#ffcc80" transform="rotate(-25 38 32)" opacity="0.8"/>
                    <ellipse cx="62" cy="32" rx="6" ry="8" fill="#ffcc80" transform="rotate(25 62 32)" opacity="0.8"/>
                    <!-- Face -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="44" cy="36" r="3.5" fill="#fff"/>
                        <circle cx="44" cy="37" r="2.2" fill="#2e7d32"/>
                        <circle cx="45" cy="36" r="1" fill="#fff"/>
                        <circle cx="56" cy="36" r="3.5" fill="#fff"/>
                        <circle cx="56" cy="37" r="2.2" fill="#2e7d32"/>
                        <circle cx="57" cy="36" r="1" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 40 36 Q 44 34 48 36" stroke="#7cb342" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 36 Q 56 34 60 36" stroke="#7cb342" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 44 Q 50 48 58 44" stroke="#7cb342" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 46 Q 50 42 58 46" stroke="#7cb342" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT TEEN - Flowering youth -->
                <g id="tm-mascot-evo2-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-teen-stem" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#8bc34a;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#689f38;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="24" ry="5" fill="#333" opacity="0.25"/>
                    <!-- Root system -->
                    <path d="M 46 92 Q 38 96 32 92" stroke="#8d6e63" stroke-width="2.5" fill="none"/>
                    <path d="M 54 92 Q 62 96 68 92" stroke="#8d6e63" stroke-width="2.5" fill="none"/>
                    <path d="M 50 92 Q 50 96 48 98" stroke="#8d6e63" stroke-width="2" fill="none"/>
                    <!-- Main trunk -->
                    <rect x="44" y="42" width="12" height="52" rx="4" fill="url(#plant-teen-stem)"/>
                    <path d="M 48 50 L 48 88" stroke="#7cb342" stroke-width="1" opacity="0.4"/>
                    <path d="M 52 50 L 52 88" stroke="#7cb342" stroke-width="1" opacity="0.4"/>
                    <!-- Branch arms -->
                    <path d="M 44 56 Q 36 58 32 56" stroke="#7cb342" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <ellipse cx="28" cy="56" rx="6" ry="8" fill="#9ccc65"/>
                    <path d="M 56 56 Q 64 58 68 56" stroke="#7cb342" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <ellipse cx="72" cy="56" rx="6" ry="8" fill="#9ccc65"/>
                    <!-- Leaves on branches -->
                    <ellipse cx="36" cy="52" rx="8" ry="6" fill="#8bc34a" transform="rotate(-30 36 52)"/>
                    <ellipse cx="64" cy="52" rx="8" ry="6" fill="#8bc34a" transform="rotate(30 64 52)"/>
                    <ellipse cx="34" cy="62" rx="7" ry="5" fill="#8bc34a" transform="rotate(-40 34 62)"/>
                    <ellipse cx="66" cy="62" rx="7" ry="5" fill="#8bc34a" transform="rotate(40 66 62)"/>
                    <!-- Head (blooming flower) -->
                    <circle cx="50" cy="32" r="16" fill="#aed581"/>
                    <!-- Flower petals -->
                    <ellipse cx="50" cy="20" rx="6" ry="10" fill="#ffb74d" opacity="0.9"/>
                    <ellipse cx="38" cy="26" rx="8" ry="10" fill="#ffb74d" transform="rotate(-45 38 26)" opacity="0.9"/>
                    <ellipse cx="62" cy="26" rx="8" ry="10" fill="#ffb74d" transform="rotate(45 62 26)" opacity="0.9"/>
                    <ellipse cx="36" cy="38" rx="7" ry="9" fill="#ffb74d" transform="rotate(-65 36 38)" opacity="0.9"/>
                    <ellipse cx="64" cy="38" rx="7" ry="9" fill="#ffb74d" transform="rotate(65 64 38)" opacity="0.9"/>
                    <!-- Center face -->
                    <circle cx="50" cy="32" r="10" fill="#ffeb3b"/>
                    <!-- Face -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="45" cy="30" r="2.5" fill="#f57c00"/>
                        <circle cx="55" cy="30" r="2.5" fill="#f57c00"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="43" y1="30" x2="47" y2="30" stroke="#f57c00" stroke-width="2"/>
                        <line x1="53" y1="30" x2="57" y2="30" stroke="#f57c00" stroke-width="2"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 45 36 Q 50 38 55 36" stroke="#f57c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 45 36 Q 50 34 55 36" stroke="#f57c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT ADULT - Mature tree guardian -->
                <g id="tm-mascot-evo3-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-adult-trunk" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#7cb342;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#558b2f;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="nature-aura">
                            <stop offset="0%" style="stop-color:#c5e1a5;stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:#8bc34a;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Nature aura -->
                    <ellipse cx="50" cy="60" rx="40" ry="45" fill="url(#nature-aura)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="96" rx="26" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Root system (strong) -->
                    <path d="M 44 94 Q 34 98 28 94" stroke="#6d4c41" stroke-width="3" fill="none"/>
                    <path d="M 56 94 Q 66 98 72 94" stroke="#6d4c41" stroke-width="3" fill="none"/>
                    <path d="M 50 94 Q 48 98 46 100" stroke="#6d4c41" stroke-width="2.5" fill="none"/>
                    <path d="M 50 94 Q 52 98 54 100" stroke="#6d4c41" stroke-width="2.5" fill="none"/>
                    <!-- Main trunk (legs) -->
                    <rect x="41" y="68" width="9" height="28" rx="3" fill="url(#plant-adult-trunk)"/>
                    <rect x="50" y="68" width="9" height="28" rx="3" fill="url(#plant-adult-trunk)"/>
                    <path d="M 44 70 L 44 92" stroke="#689f38" stroke-width="1" opacity="0.3"/>
                    <path d="M 56 70 L 56 92" stroke="#689f38" stroke-width="1" opacity="0.3"/>
                    <!-- Torso (trunk) -->
                    <rect x="38" y="42" width="24" height="28" rx="5" fill="url(#plant-adult-trunk)"/>
                    <!-- Bark texture -->
                    <path d="M 42 48 L 44 52 L 42 56" stroke="#558b2f" stroke-width="1" fill="none" opacity="0.4"/>
                    <path d="M 58 50 L 56 54 L 58 58" stroke="#558b2f" stroke-width="1" fill="none" opacity="0.4"/>
                    <!-- Branch arms (strong) -->
                    <path d="M 38 50 Q 30 52 26 50" stroke="#7cb342" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <ellipse cx="22" cy="50" rx="7" ry="10" fill="#8bc34a"/>
                    <path d="M 62 50 Q 70 52 74 50" stroke="#7cb342" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <ellipse cx="78" cy="50" rx="7" ry="10" fill="#8bc34a"/>
                    <!-- Foliage on arms -->
                    <ellipse cx="28" cy="46" rx="9" ry="7" fill="#9ccc65" transform="rotate(-25 28 46)"/>
                    <ellipse cx="72" cy="46" rx="9" ry="7" fill="#9ccc65" transform="rotate(25 72 46)"/>
                    <ellipse cx="24" cy="56" rx="8" ry="6" fill="#9ccc65" transform="rotate(-35 24 56)"/>
                    <ellipse cx="76" cy="56" rx="8" ry="6" fill="#9ccc65" transform="rotate(35 76 56)"/>
                    <!-- Head (crown of leaves) -->
                    <circle cx="50" cy="28" r="16" fill="#8bc34a"/>
                    <ellipse cx="50" cy="18" rx="10" ry="12" fill="#9ccc65" opacity="0.9"/>
                    <ellipse cx="36" cy="22" rx="10" ry="12" fill="#9ccc65" transform="rotate(-30 36 22)" opacity="0.9"/>
                    <ellipse cx="64" cy="22" rx="10" ry="12" fill="#9ccc65" transform="rotate(30 64 22)" opacity="0.9"/>
                    <ellipse cx="34" cy="32" rx="9" ry="10" fill="#9ccc65" transform="rotate(-50 34 32)" opacity="0.9"/>
                    <ellipse cx="66" cy="32" rx="9" ry="10" fill="#9ccc65" transform="rotate(50 66 32)" opacity="0.9"/>
                    <!-- Face -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="44" cy="26" rx="3" ry="4" fill="#fff"/>
                        <ellipse cx="44" cy="27" rx="2" ry="2.5" fill="#33691e"/>
                        <circle cx="45" cy="26" r="0.8" fill="#fff"/>
                        <ellipse cx="56" cy="26" rx="3" ry="4" fill="#fff"/>
                        <ellipse cx="56" cy="27" rx="2" ry="2.5" fill="#33691e"/>
                        <circle cx="57" cy="26" r="0.8" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 41 26 Q 44 24 47 26" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 26 Q 56 24 59 26" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 32 Q 50 36 58 32" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 34 Q 50 30 58 34" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT MIDDLE AGE - Ancient oak -->
                <g id="tm-mascot-evo4-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-middle-trunk" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#8d6e63;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6d4c41;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="96" rx="28" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Deep roots -->
                    <path d="M 42 94 Q 32 98 26 94 Q 22 90 24 86" stroke="#5d4037" stroke-width="3" fill="none"/>
                    <path d="M 58 94 Q 68 98 74 94 Q 78 90 76 86" stroke="#5d4037" stroke-width="3" fill="none"/>
                    <!-- Thick trunk (legs) -->
                    <rect x="40" y="64" width="10" height="32" rx="4" fill="url(#plant-middle-trunk)"/>
                    <rect x="50" y="64" width="10" height="32" rx="4" fill="url(#plant-middle-trunk)"/>
                    <!-- Knots in wood -->
                    <ellipse cx="44" cy="76" rx="2" ry="3" fill="#4e342e" opacity="0.5"/>
                    <ellipse cx="55" cy="82" rx="2.5" ry="3.5" fill="#4e342e" opacity="0.5"/>
                    <!-- Torso -->
                    <rect x="36" y="40" width="28" height="26" rx="6" fill="url(#plant-middle-trunk)"/>
                    <!-- Bark texture (rough) -->
                    <path d="M 40 44 L 42 48 L 40 52" stroke="#5d4037" stroke-width="1.5" fill="none" opacity="0.5"/>
                    <path d="M 60 46 L 58 50 L 60 54" stroke="#5d4037" stroke-width="1.5" fill="none" opacity="0.5"/>
                    <ellipse cx="50" cy="52" rx="2" ry="3" fill="#4e342e" opacity="0.4"/>
                    <!-- Branch arms -->
                    <path d="M 36 48 Q 28 50 24 48" stroke="#7cb342" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <ellipse cx="20" cy="48" rx="7" ry="9" fill="#8bc34a"/>
                    <path d="M 64 48 Q 72 50 76 48" stroke="#7cb342" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <ellipse cx="80" cy="48" rx="7" ry="9" fill="#8bc34a"/>
                    <!-- Leaves (autumn colors) -->
                    <ellipse cx="26" cy="44" rx="8" ry="6" fill="#ffa726" transform="rotate(-25 26 44)" opacity="0.8"/>
                    <ellipse cx="74" cy="44" rx="8" ry="6" fill="#ffa726" transform="rotate(25 74 44)" opacity="0.8"/>
                    <ellipse cx="22" cy="54" rx="7" ry="5" fill="#ffb74d" transform="rotate(-35 22 54)" opacity="0.8"/>
                    <ellipse cx="78" cy="54" rx="7" ry="5" fill="#ffb74d" transform="rotate(35 78 54)" opacity="0.8"/>
                    <!-- Head (dense canopy) -->
                    <circle cx="50" cy="26" r="17" fill="#7cb342"/>
                    <ellipse cx="50" cy="16" rx="11" ry="12" fill="#8bc34a" opacity="0.9"/>
                    <ellipse cx="36" cy="20" rx="10" ry="11" fill="#8bc34a" transform="rotate(-30 36 20)" opacity="0.9"/>
                    <ellipse cx="64" cy="20" rx="10" ry="11" fill="#8bc34a" transform="rotate(30 64 20)" opacity="0.9"/>
                    <ellipse cx="33" cy="30" rx="9" ry="10" fill="#aed581" transform="rotate(-50 33 30)" opacity="0.8"/>
                    <ellipse cx="67" cy="30" rx="9" ry="10" fill="#aed581" transform="rotate(50 67 30)" opacity="0.8"/>
                    <!-- Autumn leaves on head -->
                    <circle cx="42" cy="18" r="3" fill="#ff9800" opacity="0.7"/>
                    <circle cx="58" cy="22" r="2.5" fill="#ffb74d" opacity="0.7"/>
                    <!-- Face (wise) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="44" cy="24" rx="3" ry="3.5" fill="#e8f5e9"/>
                        <ellipse cx="44" cy="25" rx="2" ry="2" fill="#1b5e20"/>
                        <circle cx="45" cy="24" r="0.7" fill="#e8f5e9"/>
                        <ellipse cx="56" cy="24" rx="3" ry="3.5" fill="#e8f5e9"/>
                        <ellipse cx="56" cy="25" rx="2" ry="2" fill="#1b5e20"/>
                        <circle cx="57" cy="24" r="0.7" fill="#e8f5e9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 41 24 Q 44 22 47 24" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 24 Q 56 22 59 24" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 32 Q 50 34 58 32" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 32 Q 50 30 58 32" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- PLANT OLD - Ancient World Tree -->
                <g id="tm-mascot-evo5-plant" style="display: none;">
                    <defs>
                        <linearGradient id="plant-old-trunk" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#a1887f;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6d4c41;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="ancient-aura">
                            <stop offset="0%" style="stop-color:#dcedc8;stop-opacity:0.5" />
                            <stop offset="70%" style="stop-color:#aed581;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#8bc34a;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Ancient aura -->
                    <ellipse cx="50" cy="60" rx="45" ry="50" fill="url(#ancient-aura)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="96" rx="32" ry="4" fill="#333" opacity="0.35"/>
                    <!-- Massive root system -->
                    <path d="M 40 94 Q 28 98 22 94 Q 18 88 20 82 L 24 84" stroke="#3e2723" stroke-width="4" fill="none"/>
                    <path d="M 60 94 Q 72 98 78 94 Q 82 88 80 82 L 76 84" stroke="#3e2723" stroke-width="4" fill="none"/>
                    <path d="M 50 94 Q 46 98 42 100" stroke="#3e2723" stroke-width="3" fill="none"/>
                    <path d="M 50 94 Q 54 98 58 100" stroke="#3e2723" stroke-width="3" fill="none"/>
                    <!-- Gnarled trunk (legs) -->
                    <path d="M 40 64 Q 38 78 40 94 L 50 94 L 48 64 Z" fill="url(#plant-old-trunk)"/>
                    <path d="M 60 64 Q 62 78 60 94 L 50 94 L 52 64 Z" fill="url(#plant-old-trunk)"/>
                    <!-- Old knots and burls -->
                    <ellipse cx="42" cy="74" rx="3" ry="4" fill="#5d4037" opacity="0.6"/>
                    <ellipse cx="57" cy="80" rx="3.5" ry="4.5" fill="#5d4037" opacity="0.6"/>
                    <ellipse cx="45" cy="88" rx="2.5" ry="3.5" fill="#5d4037" opacity="0.5"/>
                    <!-- Torso (massive trunk) -->
                    <rect x="34" y="38" width="32" height="28" rx="8" fill="url(#plant-old-trunk)"/>
                    <!-- Ancient bark texture -->
                    <path d="M 38 42 L 40 48 L 38 54 L 40 60" stroke="#5d4037" stroke-width="2" fill="none" opacity="0.6"/>
                    <path d="M 62 44 L 60 50 L 62 56 L 60 62" stroke="#5d4037" stroke-width="2" fill="none" opacity="0.6"/>
                    <ellipse cx="50" cy="48" rx="3" ry="4" fill="#4e342e" opacity="0.5"/>
                    <ellipse cx="46" cy="58" rx="2.5" ry="3" fill="#4e342e" opacity="0.4"/>
                    <!-- Ancient branch arms -->
                    <path d="M 34 46 Q 26 48 22 46 Q 18 44 18 40" stroke="#7cb342" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <ellipse cx="18" cy="38" rx="8" ry="10" fill="#8bc34a"/>
                    <path d="M 66 46 Q 74 48 78 46 Q 82 44 82 40" stroke="#7cb342" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <ellipse cx="82" cy="38" rx="8" ry="10" fill="#8bc34a"/>
                    <!-- Mystical leaves -->
                    <ellipse cx="24" cy="42" rx="9" ry="7" fill="#9ccc65" transform="rotate(-25 24 42)" opacity="0.7"/>
                    <ellipse cx="76" cy="42" rx="9" ry="7" fill="#9ccc65" transform="rotate(25 76 42)" opacity="0.7"/>
                    <ellipse cx="18" cy="48" rx="7" ry="5" fill="#aed581" transform="rotate(-35 18 48)" opacity="0.6"/>
                    <ellipse cx="82" cy="48" rx="7" ry="5" fill="#aed581" transform="rotate(35 82 48)" opacity="0.6"/>
                    <!-- Head (ancient canopy) -->
                    <circle cx="50" cy="24" r="18" fill="#689f38"/>
                    <ellipse cx="50" cy="14" rx="12" ry="14" fill="#7cb342" opacity="0.9"/>
                    <ellipse cx="34" cy="18" rx="11" ry="13" fill="#7cb342" transform="rotate(-30 34 18)" opacity="0.9"/>
                    <ellipse cx="66" cy="18" rx="11" ry="13" fill="#7cb342" transform="rotate(30 66 18)" opacity="0.9"/>
                    <ellipse cx="30" cy="28" rx="10" ry="11" fill="#8bc34a" transform="rotate(-50 30 28)" opacity="0.8"/>
                    <ellipse cx="70" cy="28" rx="10" ry="11" fill="#8bc34a" transform="rotate(50 70 28)" opacity="0.8"/>
                    <!-- Mystical glow spots -->
                    <circle cx="38" cy="16" r="2" fill="#ffeb3b" opacity="0.6" filter="url(#glow)"/>
                    <circle cx="62" cy="20" r="1.5" fill="#ffeb3b" opacity="0.6" filter="url(#glow)"/>
                    <circle cx="50" cy="12" r="2.5" fill="#ffeb3b" opacity="0.6" filter="url(#glow)"/>
                    <!-- Ancient wise face -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="22" rx="3.5" ry="4" fill="#f1f8e9"/>
                        <ellipse cx="43" cy="23" rx="2" ry="2.5" fill="#1b5e20"/>
                        <circle cx="44" cy="22" r="0.6" fill="#f1f8e9"/>
                        <ellipse cx="57" cy="22" rx="3.5" ry="4" fill="#f1f8e9"/>
                        <ellipse cx="57" cy="23" rx="2" ry="2.5" fill="#1b5e20"/>
                        <circle cx="58" cy="22" r="0.6" fill="#f1f8e9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 39 22 Q 43 20 47 22" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 22 Q 57 20 61 22" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth (serene) -->
                    <path class="tm-mascot-mouth-happy" d="M 42 30 Q 50 32 58 30" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 30 Q 50 28 58 30" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- GHOST CHARACTER - All Life Stages -->
                <!-- Spirit & Shadow • Epic Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- GHOST BABY - Tiny wisp -->
                <g id="tm-mascot-baby-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-baby-body">
                            <stop offset="0%" style="stop-color:#f3e5f5;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#e1bee7;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#ce93d8;stop-opacity:0.85" />
                        </radialGradient>
                    </defs>
                    <!-- Ethereal glow -->
                    <ellipse cx="50" cy="58" rx="26" ry="30" fill="#e1bee7" opacity="0.2" filter="url(#glow)"/>
                    <!-- Main blob body (floating) -->
                    <path d="M 32 58 Q 32 44 40 38 Q 50 34 60 38 Q 68 44 68 58 L 64 68 Q 62 74 58 72 L 56 68 Q 54 70 50 70 Q 46 70 44 68 L 42 72 Q 38 74 36 68 Z" 
                          fill="url(#ghost-baby-body)" opacity="0.9"/>
                    <!-- Cute big eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="52" rx="6" ry="8" fill="#fff" opacity="0.9"/>
                        <ellipse cx="42" cy="54" rx="4" ry="5" fill="#512da8"/>
                        <circle cx="43" cy="52" r="2" fill="#fff" opacity="0.8"/>
                        <ellipse cx="58" cy="52" rx="6" ry="8" fill="#fff" opacity="0.9"/>
                        <ellipse cx="58" cy="54" rx="4" ry="5" fill="#512da8"/>
                        <circle cx="59" cy="52" r="2" fill="#fff" opacity="0.8"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 52 Q 42 50 48 52" stroke="#9575cd" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 52 Q 58 50 64 52" stroke="#9575cd" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <ellipse class="tm-mascot-mouth-happy" cx="50" cy="62" rx="4" ry="6" fill="#512da8" opacity="0.5"/>
                    <ellipse class="tm-mascot-mouth-sad" style="display:none;" cx="50" cy="62" rx="3" ry="4" fill="#512da8" opacity="0.5"/>
                    <!-- Floating sparkles -->
                    <circle cx="36" cy="46" r="1.5" fill="#fff" opacity="0.7"/>
                    <circle cx="64" cy="48" r="1.2" fill="#fff" opacity="0.6"/>
                    <circle cx="50" cy="40" r="1" fill="#fff" opacity="0.8"/>
                </g>

                <!-- GHOST KID - Growing specter -->
                <g id="tm-mascot-evo1-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-kid-body">
                            <stop offset="0%" style="stop-color:#ede7f6;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#d1c4e9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#b39ddb;stop-opacity:0.85" />
                        </radialGradient>
                    </defs>
                    <!-- Ethereal aura -->
                    <ellipse cx="50" cy="62" rx="30" ry="34" fill="#d1c4e9" opacity="0.25" filter="url(#glow)"/>
                    <!-- Main body (more defined) -->
                    <path d="M 28 62 Q 28 46 36 38 Q 44 32 50 30 Q 56 32 64 38 Q 72 46 72 62 L 70 74 Q 68 80 64 78 L 62 72 Q 60 76 56 76 L 54 72 Q 52 74 50 74 Q 48 74 46 72 L 44 76 Q 40 76 38 72 L 36 78 Q 32 80 30 74 Z" 
                          fill="url(#ghost-kid-body)" opacity="0.9"/>
                    <!-- Phase trail (ghostly) -->
                    <path d="M 30 62 Q 24 64 20 60" stroke="#b39ddb" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
                    <circle cx="18" cy="58" r="2.5" fill="#b39ddb" opacity="0.3"/>
                    <path d="M 70 62 Q 76 64 80 60" stroke="#b39ddb" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
                    <circle cx="82" cy="58" r="2.5" fill="#b39ddb" opacity="0.3"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="50" rx="6" ry="9" fill="#fff" opacity="0.9"/>
                        <ellipse cx="42" cy="52" rx="4" ry="6" fill="#5e35b1"/>
                        <circle cx="43.5" cy="50" r="2" fill="#fff" opacity="0.8"/>
                        <ellipse cx="58" cy="50" rx="6" ry="9" fill="#fff" opacity="0.9"/>
                        <ellipse cx="58" cy="52" rx="4" ry="6" fill="#5e35b1"/>
                        <circle cx="59.5" cy="50" r="2" fill="#fff" opacity="0.8"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 50 Q 42 48 48 50" stroke="#9575cd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 52 50 Q 58 48 64 50" stroke="#9575cd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <ellipse class="tm-mascot-mouth-happy" cx="50" cy="62" rx="5" ry="7" fill="#5e35b1" opacity="0.5"/>
                    <ellipse class="tm-mascot-mouth-sad" style="display:none;" cx="50" cy="62" rx="4" ry="5" fill="#5e35b1" opacity="0.5"/>
                    <!-- Sparkles -->
                    <circle cx="34" cy="42" r="1.8" fill="#fff" opacity="0.7"/>
                    <circle cx="66" cy="44" r="1.5" fill="#fff" opacity="0.6"/>
                    <circle cx="50" cy="36" r="1.3" fill="#fff" opacity="0.8"/>
                    <circle cx="40" cy="68" r="1.2" fill="#fff" opacity="0.5"/>
                    <circle cx="60" cy="70" r="1.4" fill="#fff" opacity="0.5"/>
                </g>

                <!-- GHOST TEEN - Phasing phantom -->
                <g id="tm-mascot-evo2-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-teen-body">
                            <stop offset="0%" style="stop-color:#e8eaf6;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#c5cae9;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#9fa8da;stop-opacity:0.85" />
                        </radialGradient>
                    </defs>
                    <!-- Phasing aura -->
                    <ellipse cx="50" cy="64" rx="34" ry="38" fill="#c5cae9" opacity="0.3" filter="url(#strong-glow)"/>
                    <!-- Main body (humanoid shape) -->
                    <path d="M 26 66 Q 26 48 32 40 Q 40 32 50 28 Q 60 32 68 40 Q 74 48 74 66 L 72 80 Q 70 86 66 84 L 64 78 Q 62 82 58 82 L 56 76 Q 54 80 50 80 Q 46 80 44 76 L 42 82 Q 38 82 36 78 L 34 84 Q 30 86 28 80 Z" 
                          fill="url(#ghost-teen-body)" opacity="0.9"/>
                    <!-- Shadowy arms -->
                    <ellipse cx="28" cy="58" rx="6" ry="16" fill="url(#ghost-teen-body)" transform="rotate(-15 28 58)" opacity="0.8"/>
                    <ellipse cx="26" cy="72" rx="4" ry="6" fill="url(#ghost-teen-body)" opacity="0.7"/>
                    <ellipse cx="72" cy="58" rx="6" ry="16" fill="url(#ghost-teen-body)" transform="rotate(15 72 58)" opacity="0.8"/>
                    <ellipse cx="74" cy="72" rx="4" ry="6" fill="url(#ghost-teen-body)" opacity="0.7"/>
                    <!-- Phase trail (stronger) -->
                    <path d="M 26 64 Q 18 66 12 62" stroke="#9fa8da" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5"/>
                    <ellipse cx="10" cy="60" rx="3" ry="4" fill="#9fa8da" opacity="0.4"/>
                    <path d="M 74 64 Q 82 66 88 62" stroke="#9fa8da" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5"/>
                    <ellipse cx="90" cy="60" rx="3" ry="4" fill="#9fa8da" opacity="0.4"/>
                    <!-- Hood/head shape -->
                    <ellipse cx="50" cy="42" rx="18" ry="20" fill="url(#ghost-teen-body)" opacity="0.95"/>
                    <!-- Eyes (glowing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="42" rx="6" ry="8" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                        <ellipse cx="42" cy="44" rx="4" ry="5" fill="#673ab7"/>
                        <circle cx="43.5" cy="42" r="1.8" fill="#fff"/>
                        <ellipse cx="58" cy="42" rx="6" ry="8" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                        <ellipse cx="58" cy="44" rx="4" ry="5" fill="#673ab7"/>
                        <circle cx="59.5" cy="42" r="1.8" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 42 Q 42 40 48 42" stroke="#7e57c2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 52 42 Q 58 40 64 42" stroke="#7e57c2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <ellipse class="tm-mascot-mouth-happy" cx="50" cy="52" rx="6" ry="8" fill="#673ab7" opacity="0.5"/>
                    <ellipse class="tm-mascot-mouth-sad" style="display:none;" cx="50" cy="52" rx="5" ry="6" fill="#673ab7" opacity="0.5"/>
                    <!-- Sparkles -->
                    <circle cx="32" cy="36" r="2" fill="#fff" opacity="0.8" filter="url(#glow)"/>
                    <circle cx="68" cy="38" r="1.8" fill="#fff" opacity="0.7" filter="url(#glow)"/>
                    <circle cx="50" cy="28" r="1.5" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                </g>

                <!-- GHOST ADULT - Dimensional specter -->
                <g id="tm-mascot-evo3-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-adult-body">
                            <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#bbdefb;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#90caf9;stop-opacity:0.85" />
                        </radialGradient>
                    </defs>
                    <!-- Dimensional aura -->
                    <ellipse cx="50" cy="66" rx="38" ry="42" fill="#bbdefb" opacity="0.35" filter="url(#strong-glow)"/>
                    <!-- Main body (cloaked figure) -->
                    <path d="M 24 68 Q 24 48 30 38 Q 38 30 50 26 Q 62 30 70 38 Q 76 48 76 68 L 74 84 Q 72 92 68 90 L 66 82 Q 64 88 60 88 L 58 80 Q 56 84 50 84 Q 44 84 42 80 L 40 88 Q 36 88 34 82 L 32 90 Q 28 92 26 84 Z" 
                          fill="url(#ghost-adult-body)" opacity="0.9"/>
                    <!-- Floating arms (spectral) -->
                    <ellipse cx="26" cy="58" rx="7" ry="18" fill="url(#ghost-adult-body)" transform="rotate(-12 26 58)" opacity="0.85"/>
                    <ellipse cx="24" cy="74" rx="5" ry="7" fill="url(#ghost-adult-body)" opacity="0.8"/>
                    <ellipse cx="74" cy="58" rx="7" ry="18" fill="url(#ghost-adult-body)" transform="rotate(12 74 58)" opacity="0.85"/>
                    <ellipse cx="76" cy="74" rx="5" ry="7" fill="url(#ghost-adult-body)" opacity="0.8"/>
                    <!-- Phase dimensions -->
                    <path d="M 24 66 Q 16 68 10 64 Q 6 60 8 54" stroke="#90caf9" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>
                    <ellipse cx="6" cy="52" rx="4" ry="5" fill="#90caf9" opacity="0.5"/>
                    <path d="M 76 66 Q 84 68 90 64 Q 94 60 92 54" stroke="#90caf9" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>
                    <ellipse cx="94" cy="52" rx="4" ry="5" fill="#90caf9" opacity="0.5"/>
                    <!-- Head/hood -->
                    <ellipse cx="50" cy="40" rx="20" ry="22" fill="url(#ghost-adult-body)" opacity="0.95"/>
                    <!-- Spectral energy lines -->
                    <path d="M 36 32 Q 50 28 64 32" stroke="#64b5f6" stroke-width="1" opacity="0.5" fill="none"/>
                    <path d="M 38 38 Q 50 36 62 38" stroke="#64b5f6" stroke-width="1" opacity="0.4" fill="none"/>
                    <!-- Eyes (piercing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="38" rx="5" ry="8" fill="#fff" opacity="0.95" filter="url(#strong-glow)"/>
                        <ellipse cx="42" cy="40" rx="3.5" ry="5" fill="#1e88e5"/>
                        <circle cx="43.5" cy="38" r="1.5" fill="#fff"/>
                        <ellipse cx="58" cy="38" rx="5" ry="8" fill="#fff" opacity="0.95" filter="url(#strong-glow)"/>
                        <ellipse cx="58" cy="40" rx="3.5" ry="5" fill="#1e88e5"/>
                        <circle cx="59.5" cy="38" r="1.5" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 38 Q 42 36 47 38" stroke="#42a5f5" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 38 Q 58 36 63 38" stroke="#42a5f5" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 48 Q 50 52 58 48" stroke="#1e88e5" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 50 Q 50 46 58 50" stroke="#1e88e5" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
                    <!-- Energy particles -->
                    <circle cx="32" cy="32" r="2.5" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                    <circle cx="68" cy="34" r="2.2" fill="#fff" opacity="0.8" filter="url(#glow)"/>
                    <circle cx="50" cy="24" r="2" fill="#fff" opacity="0.95" filter="url(#glow)"/>
                    <circle cx="40" cy="50" r="1.5" fill="#64b5f6" opacity="0.6"/>
                    <circle cx="60" cy="52" r="1.3" fill="#64b5f6" opacity="0.6"/>
                </g>

                <!-- GHOST MIDDLE AGE - Ancient spirit -->
                <g id="tm-mascot-evo4-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-middle-body">
                            <stop offset="0%" style="stop-color:#e1f5fe;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#b3e5fc;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#81d4fa;stop-opacity:0.85" />
                        </radialGradient>
                    </defs>
                    <!-- Ancient aura -->
                    <ellipse cx="50" cy="66" rx="40" ry="42" fill="#b3e5fc" opacity="0.4" filter="url(#strong-glow)"/>
                    <!-- Main body -->
                    <path d="M 24 68 Q 24 48 30 38 Q 38 30 50 26 Q 62 30 70 38 Q 76 48 76 68 L 74 84 Q 72 92 68 90 L 66 82 Q 64 88 60 88 L 58 80 Q 56 84 50 84 Q 44 84 42 80 L 40 88 Q 36 88 34 82 L 32 90 Q 28 92 26 84 Z" 
                          fill="url(#ghost-middle-body)" opacity="0.9"/>
                    <!-- Wispy arms -->
                    <path d="M 24 58 Q 18 60 14 58 Q 10 54 12 48" stroke="#81d4fa" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
                    <ellipse cx="10" cy="46" rx="4" ry="6" fill="#81d4fa" opacity="0.6"/>
                    <path d="M 76 58 Q 82 60 86 58 Q 90 54 88 48" stroke="#81d4fa" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
                    <ellipse cx="90" cy="46" rx="4" ry="6" fill="#81d4fa" opacity="0.6"/>
                    <!-- Phase trails (multiple) -->
                    <ellipse cx="18" cy="64" rx="3" ry="4" fill="#81d4fa" opacity="0.4"/>
                    <ellipse cx="12" cy="58" rx="2.5" ry="3.5" fill="#81d4fa" opacity="0.3"/>
                    <ellipse cx="82" cy="64" rx="3" ry="4" fill="#81d4fa" opacity="0.4"/>
                    <ellipse cx="88" cy="58" rx="2.5" ry="3.5" fill="#81d4fa" opacity="0.3"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="40" rx="20" ry="22" fill="url(#ghost-middle-body)" opacity="0.95"/>
                    <!-- Spectral bands -->
                    <path d="M 34 32 Q 50 28 66 32" stroke="#4fc3f7" stroke-width="1.5" opacity="0.5" fill="none"/>
                    <path d="M 36 38 Q 50 36 64 38" stroke="#4fc3f7" stroke-width="1.5" opacity="0.4" fill="none"/>
                    <path d="M 38 44" stroke="#4fc3f7" stroke-width="1.5" opacity="0.3" fill="none"/>
                    <!-- Eyes (knowing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="38" rx="5" ry="7" fill="#e0f7fa" opacity="0.95" filter="url(#glow)"/>
                        <ellipse cx="42" cy="40" rx="3.5" ry="4.5" fill="#0277bd"/>
                        <circle cx="43.5" cy="38" r="1.3" fill="#e0f7fa"/>
                        <ellipse cx="58" cy="38" rx="5" ry="7" fill="#e0f7fa" opacity="0.95" filter="url(#glow)"/>
                        <ellipse cx="58" cy="40" rx="3.5" ry="4.5" fill="#0277bd"/>
                        <circle cx="59.5" cy="38" r="1.3" fill="#e0f7fa"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 38 Q 42 36 47 38" stroke="#29b6f6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 38 Q 58 36 63 38" stroke="#29b6f6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 48 Q 50 50 58 48" stroke="#0277bd" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 48 Q 50 46 58 48" stroke="#0277bd" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
                    <!-- Ancient runes (faint) -->
                    <text x="32" y="56" font-family="serif" font-size="5" fill="#4fc3f7" opacity="0.4">⌘</text>
                    <text x="62" y="58" font-family="serif" font-size="5" fill="#4fc3f7" opacity="0.4">◎</text>
                </g>

                <!-- GHOST OLD - Eternal phantom -->
                <g id="tm-mascot-evo5-ghost" style="display: none;">
                    <defs>
                        <radialGradient id="ghost-old-body">
                            <stop offset="0%" style="stop-color:#f1f8e9;stop-opacity:0.95" />
                            <stop offset="70%" style="stop-color:#dcedc8;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#c5e1a5;stop-opacity:0.85" />
                        </radialGradient>
                        <radialGradient id="eternal-aura">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.6" />
                            <stop offset="50%" style="stop-color:#e0f2f1;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#b2dfdb;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Eternal aura (massive) -->
                    <ellipse cx="50" cy="66" rx="48" ry="48" fill="url(#eternal-aura)"/>
                    <!-- Main body (ancient, fading) -->
                    <path d="M 22 68 Q 22 46 28 36 Q 36 28 50 24 Q 64 28 72 36 Q 78 46 78 68 L 76 86 Q 74 94 70 92 L 68 82 Q 66 90 62 90 L 60 80 Q 58 86 50 86 Q 42 86 40 80 L 38 90 Q 34 90 32 82 L 30 92 Q 26 94 24 86 Z" 
                          fill="url(#ghost-old-body)" opacity="0.85"/>
                    <!-- Ethereal arms (barely visible) -->
                    <path d="M 22 58 Q 14 60 8 58 Q 4 54 6 46 Q 8 40 10 38" stroke="#c5e1a5" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.6"/>
                    <ellipse cx="8" cy="36" rx="5" ry="7" fill="#c5e1a5" opacity="0.5"/>
                    <path d="M 78 58 Q 86 60 92 58 Q 96 54 94 46 Q 92 40 90 38" stroke="#c5e1a5" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.6"/>
                    <ellipse cx="92" cy="36" rx="5" ry="7" fill="#c5e1a5" opacity="0.5"/>
                    <!-- Phase echoes (multiple dimensions) -->
                    <ellipse cx="14" cy="64" rx="4" ry="5" fill="#c5e1a5" opacity="0.35"/>
                    <ellipse cx="8" cy="56" rx="3" ry="4" fill="#c5e1a5" opacity="0.25"/>
                    <ellipse cx="4" cy="48" rx="2.5" ry="3.5" fill="#c5e1a5" opacity="0.2"/>
                    <ellipse cx="86" cy="64" rx="4" ry="5" fill="#c5e1a5" opacity="0.35"/>
                    <ellipse cx="92" cy="56" rx="3" ry="4" fill="#c5e1a5" opacity="0.25"/>
                    <ellipse cx="96" cy="48" rx="2.5" ry="3.5" fill="#c5e1a5" opacity="0.2"/>
                    <!-- Head (wise, ancient) -->
                    <ellipse cx="50" cy="38" rx="22" ry="24" fill="url(#ghost-old-body)" opacity="0.95"/>
                    <!-- Ancient spectral lines -->
                    <path d="M 32 30 Q 50 26 68 30" stroke="#aed581" stroke-width="2" opacity="0.4" fill="none"/>
                    <path d="M 34 36 Q 50 34 66 36" stroke="#aed581" stroke-width="2" opacity="0.35" fill="none"/>
                    <path d="M 36 42 Q 50 40 64 42" stroke="#aed581" stroke-width="2" opacity="0.3" fill="none"/>
                    <!-- Eyes (timeless) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="36" rx="6" ry="8" fill="#fff" opacity="0.9" filter="url(#strong-glow)"/>
                        <ellipse cx="42" cy="38" rx="4" ry="5" fill="#558b2f"/>
                        <circle cx="43.5" cy="36" r="1.5" fill="#fff" opacity="0.8"/>
                        <ellipse cx="58" cy="36" rx="6" ry="8" fill="#fff" opacity="0.9" filter="url(#strong-glow)"/>
                        <ellipse cx="58" cy="38" rx="4" ry="5" fill="#558b2f"/>
                        <circle cx="59.5" cy="36" r="1.5" fill="#fff" opacity="0.8"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 36 36 Q 42 34 48 36" stroke="#7cb342" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 52 36 Q 58 34 64 36" stroke="#7cb342" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Mouth (serene, knowing) -->
                    <path class="tm-mascot-mouth-happy" d="M 40 46 Q 50 48 60 46" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 46 Q 50 44 60 46" stroke="#558b2f" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
                    <!-- Ancient symbols -->
                    <text x="30" y="52" font-family="serif" font-size="6" fill="#7cb342" opacity="0.3">⚛</text>
                    <text x="64" y="54" font-family="serif" font-size="6" fill="#7cb342" opacity="0.3">☯</text>
                    <text x="46" y="24" font-family="serif" font-size="7" fill="#7cb342" opacity="0.4">✧</text>
                    <!-- Eternal light particles -->
                    <circle cx="32" cy="28" r="2" fill="#fff" opacity="0.7" filter="url(#glow)"/>
                    <circle cx="68" cy="30" r="1.8" fill="#fff" opacity="0.6" filter="url(#glow)"/>
                    <circle cx="50" cy="20" r="2.5" fill="#fff" opacity="0.8" filter="url(#glow)"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- CAT CHARACTER - All Life Stages -->
                <!-- Luck & Mischief • Rare Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- CAT BABY - Tiny kitten -->
                <g id="tm-mascot-baby-cat" style="display: none;">
                    <defs>
                        <linearGradient id="cat-baby-fur" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffccbc;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffab91;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="84" rx="20" ry="5" fill="#333" opacity="0.15"/>
                    <!-- Tiny tail -->
                    <path d="M 62 74 Q 68 70 70 66 Q 72 62 70 58" stroke="#ff8a65" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <circle cx="70" cy="56" r="2.5" fill="#ff8a65"/>
                    <!-- Hind legs (sitting) -->
                    <ellipse cx="42" cy="78" rx="6" ry="8" fill="url(#cat-baby-fur)"/>
                    <ellipse cx="58" cy="78" rx="6" ry="8" fill="url(#cat-baby-fur)"/>
                    <!-- Body (round kitten) -->
                    <ellipse cx="50" cy="64" rx="16" ry="18" fill="url(#cat-baby-fur)"/>
                    <!-- Paws (front) -->
                    <ellipse cx="44" cy="76" rx="3.5" ry="5" fill="url(#cat-baby-fur)"/>
                    <ellipse cx="56" cy="76" rx="3.5" ry="5" fill="url(#cat-baby-fur)"/>
                    <!-- Toe beans -->
                    <circle cx="44" cy="78" r="1" fill="#f48fb1" opacity="0.8"/>
                    <circle cx="56" cy="78" r="1" fill="#f48fb1" opacity="0.8"/>
                    <!-- Head (big for kitten) -->
                    <circle cx="50" cy="48" r="14" fill="url(#cat-baby-fur)"/>
                    <!-- Ears (triangular) -->
                    <path d="M 38 42 L 40 32 L 46 38 Z" fill="url(#cat-baby-fur)"/>
                    <path d="M 41 36 L 42 34 L 44 36 Z" fill="#f48fb1" opacity="0.6"/>
                    <path d="M 62 42 L 60 32 L 54 38 Z" fill="url(#cat-baby-fur)"/>
                    <path d="M 59 36 L 58 34 L 56 36 Z" fill="#f48fb1" opacity="0.6"/>
                    <!-- Eyes (big, cute) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="46" rx="4" ry="5" fill="#fff"/>
                        <ellipse cx="43" cy="48" rx="2.5" ry="3.5" fill="#4e342e"/>
                        <circle cx="44" cy="46" r="1.2" fill="#fff" opacity="0.9"/>
                        <ellipse cx="57" cy="46" rx="4" ry="5" fill="#fff"/>
                        <ellipse cx="57" cy="48" rx="2.5" ry="3.5" fill="#4e342e"/>
                        <circle cx="58" cy="46" r="1.2" fill="#fff" opacity="0.9"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 39 46 Q 43 44 47 46" stroke="#ff8a65" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 46 Q 57 44 61 46" stroke="#ff8a65" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Nose -->
                    <circle cx="50" cy="52" r="1.5" fill="#f48fb1"/>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 50 53 L 50 54 M 46 54 Q 50 56 54 54" stroke="#ff8a65" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 50 53 L 50 54 M 46 56 Q 50 54 54 56" stroke="#ff8a65" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                    <!-- Whiskers (tiny) -->
                    <line x1="40" y1="50" x2="32" y2="49" stroke="#8d6e63" stroke-width="0.8" opacity="0.5"/>
                    <line x1="40" y1="52" x2="32" y2="53" stroke="#8d6e63" stroke-width="0.8" opacity="0.5"/>
                    <line x1="60" y1="50" x2="68" y2="49" stroke="#8d6e63" stroke-width="0.8" opacity="0.5"/>
                    <line x1="60" y1="52" x2="68" y2="53" stroke="#8d6e63" stroke-width="0.8" opacity="0.5"/>
                </g>

                <!-- CAT KID - Playful young cat -->
                <g id="tm-mascot-evo1-cat" style="display: none;">
                    <defs>
                        <linearGradient id="cat-kid-fur" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffb74d;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="88" rx="22" ry="5" fill="#333" opacity="0.2"/>
                    <!-- Playful tail (curved up) -->
                    <path d="M 64 78 Q 72 72 76 64 Q 78 56 76 48" stroke="#fb8c00" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <circle cx="76" cy="46" r="3" fill="#fb8c00"/>
                    <!-- Hind legs -->
                    <ellipse cx="42" cy="82" rx="6" ry="10" fill="url(#cat-kid-fur)"/>
                    <ellipse cx="58" cy="82" rx="6" ry="10" fill="url(#cat-kid-fur)"/>
                    <!-- Body -->
                    <ellipse cx="50" cy="68" rx="18" ry="20" fill="url(#cat-kid-fur)"/>
                    <!-- Stripes (tabby pattern) -->
                    <path d="M 38 62 Q 50 60 62 62" stroke="#e65100" stroke-width="1.5" fill="none" opacity="0.4"/>
                    <path d="M 40 70 Q 50 68 60 70" stroke="#e65100" stroke-width="1.5" fill="none" opacity="0.4"/>
                    <!-- Front paws -->
                    <ellipse cx="44" cy="82" rx="4" ry="6" fill="url(#cat-kid-fur)"/>
                    <ellipse cx="56" cy="82" rx="4" ry="6" fill="url(#cat-kid-fur)"/>
                    <!-- Toe beans -->
                    <circle cx="44" cy="85" r="1.2" fill="#f48fb1" opacity="0.8"/>
                    <circle cx="56" cy="85" r="1.2" fill="#f48fb1" opacity="0.8"/>
                    <!-- Head -->
                    <circle cx="50" cy="50" r="15" fill="url(#cat-kid-fur)"/>
                    <!-- Ears -->
                    <path d="M 36 46 L 38 34 L 46 42 Z" fill="url(#cat-kid-fur)"/>
                    <path d="M 40 40 L 41 36 L 44 40 Z" fill="#f48fb1" opacity="0.6"/>
                    <path d="M 64 46 L 62 34 L 54 42 Z" fill="url(#cat-kid-fur)"/>
                    <path d="M 60 40 L 59 36 L 56 40 Z" fill="#f48fb1" opacity="0.6"/>
                    <!-- Eyes (playful) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="48" rx="4.5" ry="6" fill="#fff"/>
                        <ellipse cx="43" cy="50" rx="2.8" ry="4" fill="#6d4c41"/>
                        <circle cx="44" cy="48" r="1.3" fill="#fff"/>
                        <ellipse cx="57" cy="48" rx="4.5" ry="6" fill="#fff"/>
                        <ellipse cx="57" cy="50" rx="2.8" ry="4" fill="#6d4c41"/>
                        <circle cx="58" cy="48" r="1.3" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 38 48 Q 43 46 48 48" stroke="#fb8c00" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 48 Q 57 46 62 48" stroke="#fb8c00" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Nose -->
                    <path d="M 48 54 L 50 56 L 52 54" fill="#f48fb1"/>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 50 56 L 50 58 M 46 58 Q 50 60 54 58" stroke="#fb8c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 50 56 L 50 58 M 46 60 Q 50 58 54 60" stroke="#fb8c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Whiskers -->
                    <line x1="38" y1="52" x2="28" y2="50" stroke="#6d4c41" stroke-width="1" opacity="0.6"/>
                    <line x1="38" y1="54" x2="28" y2="55" stroke="#6d4c41" stroke-width="1" opacity="0.6"/>
                    <line x1="62" y1="52" x2="72" y2="50" stroke="#6d4c41" stroke-width="1" opacity="0.6"/>
                    <line x1="62" y1="54" x2="72" y2="55" stroke="#6d4c41" stroke-width="1" opacity="0.6"/>
                </g>

                <!-- CAT TEEN - Agile adolescent -->
                <g id="tm-mascot-evo2-cat" style="display: none;">
                    <defs>
                        <linearGradient id="cat-teen-fur" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ff9800;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f57c00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="92" rx="24" ry="4" fill="#333" opacity="0.25"/>
                    <!-- Tail (stylish) -->
                    <path d="M 66 82 Q 76 76 82 68 Q 86 58 84 48 Q 82 42 80 40" stroke="#f57c00" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 82 46 L 80 42 L 78 46" fill="#f57c00"/>
                    <!-- Hind legs (standing) -->
                    <ellipse cx="42" cy="86" rx="6" ry="12" fill="url(#cat-teen-fur)"/>
                    <ellipse cx="58" cy="86" rx="6" ry="12" fill="url(#cat-teen-fur)"/>
                    <ellipse cx="42" cy="92" rx="4" ry="3" fill="url(#cat-teen-fur)"/>
                    <ellipse cx="58" cy="92" rx="4" ry="3" fill="url(#cat-teen-fur)"/>
                    <!-- Body (sleek) -->
                    <ellipse cx="50" cy="70" rx="18" ry="22" fill="url(#cat-teen-fur)"/>
                    <!-- Tabby stripes (more defined) -->
                    <path d="M 38 64 Q 50 62 62 64" stroke="#e65100" stroke-width="2" fill="none" opacity="0.5"/>
                    <path d="M 40 72 Q 50 70 60 72" stroke="#e65100" stroke-width="2" fill="none" opacity="0.5"/>
                    <path d="M 42 80 Q 50 78 58 80" stroke="#e65100" stroke-width="2" fill="none" opacity="0.5"/>
                    <!-- Front legs -->
                    <ellipse cx="44" cy="86" rx="4.5" ry="10" fill="url(#cat-teen-fur)"/>
                    <ellipse cx="56" cy="86" rx="4.5" ry="10" fill="url(#cat-teen-fur)"/>
                    <ellipse cx="44" cy="92" rx="3.5" ry="2.5" fill="url(#cat-teen-fur)"/>
                    <ellipse cx="56" cy="92" rx="3.5" ry="2.5" fill="url(#cat-teen-fur)"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="48" rx="16" ry="18" fill="url(#cat-teen-fur)"/>
                    <!-- Ears (alert) -->
                    <path d="M 34 44 L 36 30 L 46 40 Z" fill="url(#cat-teen-fur)"/>
                    <path d="M 38 36 L 40 32 L 43 38 Z" fill="#f48fb1" opacity="0.6"/>
                    <path d="M 66 44 L 64 30 L 54 40 Z" fill="url(#cat-teen-fur)"/>
                    <path d="M 62 36 L 60 32 L 57 38 Z" fill="#f48fb1" opacity="0.6"/>
                    <!-- Eyes (mischievous) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="46" rx="5" ry="7" fill="#fff"/>
                        <ellipse cx="42" cy="48" rx="2" ry="5" fill="#6d4c41"/>
                        <circle cx="43.5" cy="46" r="1.2" fill="#fff"/>
                        <ellipse cx="58" cy="46" rx="5" ry="7" fill="#fff"/>
                        <ellipse cx="58" cy="48" rx="2" ry="5" fill="#6d4c41"/>
                        <circle cx="59.5" cy="46" r="1.2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 46 Q 42 44 47 46" stroke="#f57c00" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 46 Q 58 44 63 46" stroke="#f57c00" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Nose -->
                    <path d="M 48 54 L 50 56 L 52 54 Z" fill="#f48fb1"/>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 50 56 L 50 58 M 45 58 Q 50 62 55 58" stroke="#f57c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 50 56 L 50 58 M 45 60 Q 50 58 55 60" stroke="#f57c00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Whiskers (longer) -->
                    <line x1="36" y1="50" x2="24" y2="48" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="36" y1="53" x2="24" y2="53" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="36" y1="56" x2="24" y2="58" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="64" y1="50" x2="76" y2="48" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="64" y1="53" x2="76" y2="53" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="64" y1="56" x2="76" y2="58" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                </g>

                <!-- CAT ADULT - Graceful mystic cat -->
                <g id="tm-mascot-evo3-cat" style="display: none;">
                    <defs>
                        <linearGradient id="cat-adult-fur" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#f57c00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e64a19;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="luck-aura">
                            <stop offset="0%" style="stop-color:#ffd54f;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ffb300;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Lucky aura -->
                    <ellipse cx="50" cy="68" rx="32" ry="36" fill="url(#luck-aura)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="26" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Elegant tail (curved) -->
                    <path d="M 68 84 Q 80 78 88 68 Q 92 56 90 44 Q 88 36 84 32" stroke="#e64a19" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <path d="M 88 46 L 86 40 L 83 44" fill="#e64a19"/>
                    <!-- Hind legs -->
                    <ellipse cx="42" cy="88" rx="6" ry="14" fill="url(#cat-adult-fur)"/>
                    <ellipse cx="58" cy="88" rx="6" ry="14" fill="url(#cat-adult-fur)"/>
                    <ellipse cx="42" cy="94" rx="4.5" ry="3" fill="url(#cat-adult-fur)"/>
                    <ellipse cx="58" cy="94" rx="4.5" ry="3" fill="url(#cat-adult-fur)"/>
                    <!-- Body (elegant) -->
                    <ellipse cx="50" cy="72" rx="20" ry="24" fill="url(#cat-adult-fur)"/>
                    <!-- Mystical markings -->
                    <path d="M 36 66 Q 50 64 64 66" stroke="#bf360c" stroke-width="2" fill="none" opacity="0.5"/>
                    <path d="M 38 74 Q 50 72 62 74" stroke="#bf360c" stroke-width="2" fill="none" opacity="0.5"/>
                    <path d="M 40 82 Q 50 80 60 82" stroke="#bf360c" stroke-width="2" fill="none" opacity="0.5"/>
                    <circle cx="50" cy="72" r="3" fill="#ffd54f" opacity="0.4"/>
                    <!-- Front legs -->
                    <ellipse cx="44" cy="88" rx="5" ry="12" fill="url(#cat-adult-fur)"/>
                    <ellipse cx="56" cy="88" rx="5" ry="12" fill="url(#cat-adult-fur)"/>
                    <ellipse cx="44" cy="94" rx="4" ry="2.5" fill="url(#cat-adult-fur)"/>
                    <ellipse cx="56" cy="94" rx="4" ry="2.5" fill="url(#cat-adult-fur)"/>
                    <!-- Head (regal) -->
                    <ellipse cx="50" cy="46" rx="18" ry="20" fill="url(#cat-adult-fur)"/>
                    <!-- Ears (pointed, mystical) -->
                    <path d="M 32 42 L 34 26 L 46 38 Z" fill="url(#cat-adult-fur)"/>
                    <path d="M 36 34 L 38 28 L 43 36 Z" fill="#f48fb1" opacity="0.6"/>
                    <path d="M 68 42 L 66 26 L 54 38 Z" fill="url(#cat-adult-fur)"/>
                    <path d="M 64 34 L 62 28 L 57 36 Z" fill="#f48fb1" opacity="0.6"/>
                    <!-- Mystical eye marking -->
                    <path d="M 48 38 Q 50 36 52 38" stroke="#ffd54f" stroke-width="1" fill="none" opacity="0.6"/>
                    <!-- Eyes (mystical, glowing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="44" rx="5" ry="7" fill="#fff" filter="url(#glow)"/>
                        <ellipse cx="42" cy="46" rx="1.8" ry="5" fill="#6d4c41"/>
                        <circle cx="43.5" cy="43" r="1.5" fill="#ffd54f" opacity="0.8"/>
                        <ellipse cx="58" cy="44" rx="5" ry="7" fill="#fff" filter="url(#glow)"/>
                        <ellipse cx="58" cy="46" rx="1.8" ry="5" fill="#6d4c41"/>
                        <circle cx="59.5" cy="43" r="1.5" fill="#ffd54f" opacity="0.8"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 44 Q 42 42 47 44" stroke="#e64a19" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 44 Q 58 42 63 44" stroke="#e64a19" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Nose -->
                    <path d="M 48 52 L 50 54 L 52 52 Z" fill="#f48fb1"/>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 50 54 L 50 56 M 44 56 Q 50 60 56 56" stroke="#e64a19" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 50 54 L 50 56 M 44 58 Q 50 56 56 58" stroke="#e64a19" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                    <!-- Whiskers (magical shimmer) -->
                    <line x1="34" y1="48" x2="20" y2="46" stroke="#ffd54f" stroke-width="1.2" opacity="0.6"/>
                    <line x1="34" y1="51" x2="20" y2="51" stroke="#ffd54f" stroke-width="1.2" opacity="0.6"/>
                    <line x1="34" y1="54" x2="20" y2="56" stroke="#ffd54f" stroke-width="1.2" opacity="0.6"/>
                    <line x1="66" y1="48" x2="80" y2="46" stroke="#ffd54f" stroke-width="1.2" opacity="0.6"/>
                    <line x1="66" y1="51" x2="80" y2="51" stroke="#ffd54f" stroke-width="1.2" opacity="0.6"/>
                    <line x1="66" y1="54" x2="80" y2="56" stroke="#ffd54f" stroke-width="1.2" opacity="0.6"/>
                </g>

                <!-- CAT MIDDLE AGE - Wise mouser -->
                <g id="tm-mascot-evo4-cat" style="display: none;">
                    <defs>
                        <linearGradient id="cat-middle-fur" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e65100;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#bf360c;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="26" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Tail (thicker) -->
                    <path d="M 68 84 Q 80 78 86 68 Q 90 58 88 48 Q 86 40 82 36" stroke="#bf360c" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <!-- Hind legs (stockier) -->
                    <ellipse cx="42" cy="88" rx="7" ry="14" fill="url(#cat-middle-fur)"/>
                    <ellipse cx="58" cy="88" rx="7" ry="14" fill="url(#cat-middle-fur)"/>
                    <ellipse cx="42" cy="94" rx="5" ry="3" fill="url(#cat-middle-fur)"/>
                    <ellipse cx="58" cy="94" rx="5" ry="3" fill="url(#cat-middle-fur)"/>
                    <!-- Body (slightly rounder) -->
                    <ellipse cx="50" cy="72" rx="21" ry="24" fill="url(#cat-middle-fur)"/>
                    <!-- Stripes/markings (faded) -->
                    <path d="M 36 66 Q 50 64 64 66" stroke="#8d6e63" stroke-width="2" fill="none" opacity="0.4"/>
                    <path d="M 38 74 Q 50 72 62 74" stroke="#8d6e63" stroke-width="2" fill="none" opacity="0.4"/>
                    <path d="M 40 82 Q 50 80 60 82" stroke="#8d6e63" stroke-width="2" fill="none" opacity="0.4"/>
                    <!-- Front legs -->
                    <ellipse cx="44" cy="88" rx="5.5" ry="12" fill="url(#cat-middle-fur)"/>
                    <ellipse cx="56" cy="88" rx="5.5" ry="12" fill="url(#cat-middle-fur)"/>
                    <ellipse cx="44" cy="94" rx="4.5" ry="2.5" fill="url(#cat-middle-fur)"/>
                    <ellipse cx="56" cy="94" rx="4.5" ry="2.5" fill="url(#cat-middle-fur)"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="46" rx="18" ry="20" fill="url(#cat-middle-fur)"/>
                    <!-- Ears -->
                    <path d="M 32 42 L 34 26 L 46 38 Z" fill="url(#cat-middle-fur)"/>
                    <path d="M 36 34 L 38 28 L 43 36 Z" fill="#d7ccc8" opacity="0.5"/>
                    <path d="M 68 42 L 66 26 L 54 38 Z" fill="url(#cat-middle-fur)"/>
                    <path d="M 64 34 L 62 28 L 57 36 Z" fill="#d7ccc8" opacity="0.5"/>
                    <!-- Eyes (experienced) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="44" rx="4.5" ry="6.5" fill="#fff"/>
                        <ellipse cx="42" cy="46" rx="1.8" ry="4.5" fill="#6d4c41"/>
                        <circle cx="43" cy="44" r="1.2" fill="#fff"/>
                        <ellipse cx="58" cy="44" rx="4.5" ry="6.5" fill="#fff"/>
                        <ellipse cx="58" cy="46" rx="1.8" ry="4.5" fill="#6d4c41"/>
                        <circle cx="59" cy="44" r="1.2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 44 Q 42 42 47 44" stroke="#bf360c" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 44 Q 58 42 63 44" stroke="#bf360c" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Nose -->
                    <path d="M 48 52 L 50 54 L 52 52 Z" fill="#f48fb1"/>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 50 54 L 50 56 M 44 56 Q 50 58 56 56" stroke="#bf360c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 50 54 L 50 56 M 44 56 Q 50 54 56 56" stroke="#bf360c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                    <!-- Whiskers -->
                    <line x1="34" y1="48" x2="22" y2="46" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="34" y1="51" x2="22" y2="51" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="34" y1="54" x2="22" y2="56" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="66" y1="48" x2="78" y2="46" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="66" y1="51" x2="78" y2="51" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                    <line x1="66" y1="54" x2="78" y2="56" stroke="#5d4037" stroke-width="1.2" opacity="0.7"/>
                </g>

                <!-- CAT OLD - Ancient guardian cat -->
                <g id="tm-mascot-evo5-cat" style="display: none;">
                    <defs>
                        <linearGradient id="cat-old-fur" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#bcaaa4;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#8d6e63;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="28" ry="4" fill="#333" opacity="0.35"/>
                    <!-- Tail (resting) -->
                    <path d="M 68 86 Q 76 82 80 76 Q 82 70 80 64" stroke="#8d6e63" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <circle cx="80" cy="62" r="3.5" fill="#8d6e63"/>
                    <!-- Hind legs (resting) -->
                    <ellipse cx="42" cy="88" rx="8" ry="14" fill="url(#cat-old-fur)"/>
                    <ellipse cx="58" cy="88" rx="8" ry="14" fill="url(#cat-old-fur)"/>
                    <ellipse cx="42" cy="94" rx="6" ry="3" fill="url(#cat-old-fur)"/>
                    <ellipse cx="58" cy="94" rx="6" ry="3" fill="url(#cat-old-fur)"/>
                    <!-- Body (elderly, resting) -->
                    <ellipse cx="50" cy="74" rx="22" ry="22" fill="url(#cat-old-fur)"/>
                    <!-- Old fur markings (faded) -->
                    <path d="M 36 68 Q 50 66 64 68" stroke="#5d4037" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M 38 76 Q 50 74 62 76" stroke="#5d4037" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M 40 84 Q 50 82 60 84" stroke="#5d4037" stroke-width="2" fill="none" opacity="0.3"/>
                    <!-- Front legs (tucked) -->
                    <ellipse cx="44" cy="88" rx="6" ry="10" fill="url(#cat-old-fur)"/>
                    <ellipse cx="56" cy="88" rx="6" ry="10" fill="url(#cat-old-fur)"/>
                    <ellipse cx="44" cy="94" rx="5" ry="2.5" fill="url(#cat-old-fur)"/>
                    <ellipse cx="56" cy="94" rx="5" ry="2.5" fill="url(#cat-old-fur)"/>
                    <!-- Head (wise) -->
                    <ellipse cx="50" cy="48" rx="19" ry="20" fill="url(#cat-old-fur)"/>
                    <!-- Grey patches -->
                    <ellipse cx="40" cy="44" rx="4" ry="5" fill="#d7ccc8" opacity="0.6"/>
                    <ellipse cx="60" cy="44" rx="4" ry="5" fill="#d7ccc8" opacity="0.6"/>
                    <!-- Ears (drooping slightly) -->
                    <path d="M 32 44 L 34 30 L 46 40 Z" fill="url(#cat-old-fur)"/>
                    <path d="M 36 36 L 38 32 L 43 38 Z" fill="#d7ccc8" opacity="0.4"/>
                    <path d="M 68 44 L 66 30 L 54 40 Z" fill="url(#cat-old-fur)"/>
                    <path d="M 64 36 L 62 32 L 57 38 Z" fill="#d7ccc8" opacity="0.4"/>
                    <!-- Eyes (wise, knowing) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="46" rx="4" ry="6" fill="#e0e0e0"/>
                        <ellipse cx="42" cy="48" rx="1.5" ry="4" fill="#5d4037"/>
                        <circle cx="43" cy="46" r="0.8" fill="#e0e0e0"/>
                        <ellipse cx="58" cy="46" rx="4" ry="6" fill="#e0e0e0"/>
                        <ellipse cx="58" cy="48" rx="1.5" ry="4" fill="#5d4037"/>
                        <circle cx="59" cy="46" r="0.8" fill="#e0e0e0"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 38 46 Q 42 44 46 46" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 54 46 Q 58 44 62 46" stroke="#8d6e63" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Nose -->
                    <path d="M 48 54 L 50 56 L 52 54 Z" fill="#d7ccc8"/>
                    <!-- Mouth (content) -->
                    <path class="tm-mascot-mouth-happy" d="M 50 56 L 50 58 M 44 58 Q 50 60 56 58" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 50 56 L 50 58 M 44 58 Q 50 56 56 58" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    <!-- Whiskers (grey, wise) -->
                    <line x1="34" y1="50" x2="22" y2="48" stroke="#9e9e9e" stroke-width="1.2" opacity="0.6"/>
                    <line x1="34" y1="53" x2="22" y2="53" stroke="#9e9e9e" stroke-width="1.2" opacity="0.6"/>
                    <line x1="34" y1="56" x2="22" y2="58" stroke="#9e9e9e" stroke-width="1.2" opacity="0.6"/>
                    <line x1="66" y1="50" x2="78" y2="48" stroke="#9e9e9e" stroke-width="1.2" opacity="0.6"/>
                    <line x1="66" y1="53" x2="78" y2="53" stroke="#9e9e9e" stroke-width="1.2" opacity="0.6"/>
                    <line x1="66" y1="56" x2="78" y2="58" stroke="#9e9e9e" stroke-width="1.2" opacity="0.6"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- PHOENIX CHARACTER - All Life Stages -->
                <!-- Flame & Rebirth • Legendary Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- PHOENIX BABY - Tiny ember chick -->
                <g id="tm-mascot-baby-phoenix" style="display: none;">
                    <defs>
                        <radialGradient id="phoenix-baby-body">
                            <stop offset="0%" style="stop-color:#fff9c4;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#ffe082;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffca28;stop-opacity:1" />
                        </radialGradient>
                        <radialGradient id="ember-glow">
                            <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#ff9800;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Ember glow -->
                    <ellipse cx="50" cy="62" rx="26" ry="28" fill="url(#ember-glow)" filter="url(#glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="82" rx="18" ry="4" fill="#333" opacity="0.15"/>
                    <!-- Body (fluffy chick) -->
                    <ellipse cx="50" cy="60" rx="18" ry="22" fill="url(#phoenix-baby-body)"/>
                    <!-- Fluffy down feathers -->
                    <circle cx="42" cy="56" r="5" fill="#ffe082" opacity="0.8"/>
                    <circle cx="58" cy="56" r="5" fill="#ffe082" opacity="0.8"/>
                    <circle cx="46" cy="72" r="6" fill="#ffe082" opacity="0.8"/>
                    <circle cx="54" cy="72" r="6" fill="#ffe082" opacity="0.8"/>
                    <!-- Tiny wings (nubs) -->
                    <ellipse cx="36" cy="60" rx="6" ry="8" fill="#ffc107" opacity="0.9" transform="rotate(-20 36 60)"/>
                    <ellipse cx="64" cy="60" rx="6" ry="8" fill="#ffc107" opacity="0.9" transform="rotate(20 64 60)"/>
                    <!-- Feet -->
                    <line x1="46" y1="78" x2="44" y2="82" stroke="#ff9800" stroke-width="2"/>
                    <line x1="46" y1="78" x2="48" y2="82" stroke="#ff9800" stroke-width="2"/>
                    <line x1="54" y1="78" x2="52" y2="82" stroke="#ff9800" stroke-width="2"/>
                    <line x1="54" y1="78" x2="56" y2="82" stroke="#ff9800" stroke-width="2"/>
                    <!-- Head -->
                    <circle cx="50" cy="46" r="12" fill="url(#phoenix-baby-body)"/>
                    <!-- Tiny crest -->
                    <path d="M 46 38 L 50 32 L 54 38" fill="#ff9800" opacity="0.8"/>
                    <!-- Eyes (bright) -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="45" cy="46" r="3.5" fill="#fff"/>
                        <circle cx="45" cy="47" r="2" fill="#f57c00"/>
                        <circle cx="46" cy="45" r="1" fill="#fff"/>
                        <circle cx="55" cy="46" r="3.5" fill="#fff"/>
                        <circle cx="55" cy="47" r="2" fill="#f57c00"/>
                        <circle cx="56" cy="45" r="1" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 41 46 Q 45 44 49 46" stroke="#ffa726" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                        <path d="M 51 46 Q 55 44 59 46" stroke="#ffa726" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Beak -->
                    <path d="M 48 50 L 50 52 L 52 50" fill="#ff9800"/>
                    <!-- Ember sparkles -->
                    <circle cx="38" cy="50" r="1.5" fill="#ffeb3b" opacity="0.8"/>
                    <circle cx="62" cy="52" r="1.2" fill="#ffeb3b" opacity="0.7"/>
                    <circle cx="50" cy="36" r="1" fill="#ffeb3b" opacity="0.9"/>
                </g>

                <!-- PHOENIX KID - Young firebird -->
                <g id="tm-mascot-evo1-phoenix" style="display: none;">
                    <defs>
                        <linearGradient id="phoenix-kid-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffa726;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Flame aura -->
                    <ellipse cx="50" cy="64" rx="28" ry="32" fill="#ffeb3b" opacity="0.25" filter="url(#glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="86" rx="20" ry="5" fill="#333" opacity="0.2"/>
                    <!-- Tail feathers (short, fiery) -->
                    <path d="M 54 78 Q 58 82 60 86" stroke="#ff6f00" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M 50 78 Q 52 84 54 88" stroke="#ff8f00" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <path d="M 46 78 Q 44 82 42 86" stroke="#ff6f00" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <!-- Legs -->
                    <line x1="46" y1="78" x2="44" y2="86" stroke="#f57c00" stroke-width="2.5"/>
                    <line x1="46" y1="78" x2="42" y2="87" stroke="#f57c00" stroke-width="1.5"/>
                    <line x1="46" y1="78" x2="48" y2="87" stroke="#f57c00" stroke-width="1.5"/>
                    <line x1="54" y1="78" x2="56" y2="86" stroke="#f57c00" stroke-width="2.5"/>
                    <line x1="54" y1="78" x2="52" y2="87" stroke="#f57c00" stroke-width="1.5"/>
                    <line x1="54" y1="78" x2="58" y2="87" stroke="#f57c00" stroke-width="1.5"/>
                    <!-- Body -->
                    <ellipse cx="50" cy="62" rx="16" ry="20" fill="url(#phoenix-kid-body)"/>
                    <!-- Wing feathers (developing) -->
                    <ellipse cx="34" cy="60" rx="8" ry="14" fill="#ff9800" opacity="0.9" transform="rotate(-25 34 60)"/>
                    <path d="M 32 56 L 28 54 M 32 62 L 28 64 M 32 68 L 28 72" stroke="#ff6f00" stroke-width="1.5" opacity="0.7"/>
                    <ellipse cx="66" cy="60" rx="8" ry="14" fill="#ff9800" opacity="0.9" transform="rotate(25 66 60)"/>
                    <path d="M 68 56 L 72 54 M 68 62 L 72 64 M 68 68 L 72 72" stroke="#ff6f00" stroke-width="1.5" opacity="0.7"/>
                    <!-- Head -->
                    <circle cx="50" cy="44" r="13" fill="url(#phoenix-kid-body)"/>
                    <!-- Crest (growing) -->
                    <path d="M 44 36 L 48 28 L 50 30 L 52 28 L 56 36" fill="#ff6f00" opacity="0.9"/>
                    <!-- Eyes (fiery) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="44" cy="44" rx="3.5" ry="4.5" fill="#fff"/>
                        <ellipse cx="44" cy="45" rx="2" ry="3" fill="#e65100"/>
                        <circle cx="45" cy="43" r="1" fill="#fff"/>
                        <ellipse cx="56" cy="44" rx="3.5" ry="4.5" fill="#fff"/>
                        <ellipse cx="56" cy="45" rx="2" ry="3" fill="#e65100"/>
                        <circle cx="57" cy="43" r="1" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 40 44 Q 44 42 48 44" stroke="#ffa726" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 52 44 Q 56 42 60 44" stroke="#ffa726" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Beak -->
                    <path d="M 48 50 L 50 52 L 52 50 Z" fill="#ff9800"/>
                    <!-- Fire sparks -->
                    <circle cx="36" cy="48" r="1.8" fill="#ffeb3b" opacity="0.8" filter="url(#glow)"/>
                    <circle cx="64" cy="50" r="1.5" fill="#ffeb3b" opacity="0.7" filter="url(#glow)"/>
                    <circle cx="50" cy="28" r="1.3" fill="#ffeb3b" opacity="0.9" filter="url(#glow)"/>
                </g>

                <!-- PHOENIX TEEN - Blazing adolescent -->
                <g id="tm-mascot-evo2-phoenix" style="display: none;">
                    <defs>
                        <linearGradient id="phoenix-teen-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffa726;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Fire aura -->
                    <ellipse cx="50" cy="66" rx="34" ry="36" fill="#ff9800" opacity="0.3" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="90" rx="22" ry="5" fill="#333" opacity="0.25"/>
                    <!-- Tail feathers (longer, flame-like) -->
                    <path d="M 56 80 Q 62 86 66 92" stroke="#ff3d00" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <path d="M 50 80 Q 54 88 56 94" stroke="#ff6f00" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <path d="M 44 80 Q 40 86 36 92" stroke="#ff3d00" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <circle cx="66" cy="93" r="2.5" fill="#ff6f00" opacity="0.8"/>
                    <circle cx="56" cy="95" r="2" fill="#ff6f00" opacity="0.8"/>
                    <circle cx="36" cy="93" r="2.5" fill="#ff6f00" opacity="0.8"/>
                    <!-- Legs -->
                    <line x1="46" y1="80" x2="44" y2="90" stroke="#f57c00" stroke-width="3"/>
                    <path d="M 44 90 L 40 92 M 44 90 L 44 93 M 44 90 L 48 92" stroke="#f57c00" stroke-width="2"/>
                    <line x1="54" y1="80" x2="56" y2="90" stroke="#f57c00" stroke-width="3"/>
                    <path d="M 56 90 L 52 92 M 56 90 L 56 93 M 56 90 L 60 92" stroke="#f57c00" stroke-width="2"/>
                    <!-- Body -->
                    <ellipse cx="50" cy="64" rx="18" ry="22" fill="url(#phoenix-teen-body)"/>
                    <!-- Wings (spread slightly) -->
                    <ellipse cx="30" cy="62" rx="10" ry="18" fill="#ff6f00" transform="rotate(-30 30 62)"/>
                    <path d="M 28 54 L 22 50 M 28 60 L 22 60 M 28 66 L 22 68 M 28 72 L 22 76" stroke="#ff3d00" stroke-width="2" opacity="0.8"/>
                    <ellipse cx="70" cy="62" rx="10" ry="18" fill="#ff6f00" transform="rotate(30 70 62)"/>
                    <path d="M 72 54 L 78 50 M 72 60 L 78 60 M 72 66 L 78 68 M 72 72 L 78 76" stroke="#ff3d00" stroke-width="2" opacity="0.8"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="42" rx="14" ry="16" fill="url(#phoenix-teen-body)"/>
                    <!-- Crest (fiery) -->
                    <path d="M 42 34 L 46 24 L 48 28 L 50 22 L 52 28 L 54 24 L 58 34" fill="#ff3d00"/>
                    <path d="M 46 26 L 50 20 L 54 26" fill="#ffeb3b" opacity="0.6"/>
                    <!-- Eyes (intense) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="42" rx="4" ry="5" fill="#fff" filter="url(#glow)"/>
                        <ellipse cx="43" cy="44" rx="2" ry="3" fill="#bf360c"/>
                        <circle cx="44" cy="41" r="1.2" fill="#fff"/>
                        <ellipse cx="57" cy="42" rx="4" ry="5" fill="#fff" filter="url(#glow)"/>
                        <ellipse cx="57" cy="44" rx="2" ry="3" fill="#bf360c"/>
                        <circle cx="58" cy="41" r="1.2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 39 42 Q 43 40 47 42" stroke="#ff6f00" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M 53 42 Q 57 40 61 42" stroke="#ff6f00" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Beak -->
                    <path d="M 48 48 L 50 52 L 52 48 Z" fill="#ff6f00"/>
                    <!-- Fire particles -->
                    <circle cx="32" cy="44" r="2" fill="#ffeb3b" opacity="0.9" filter="url(#glow)"/>
                    <circle cx="68" cy="46" r="1.8" fill="#ffeb3b" opacity="0.8" filter="url(#glow)"/>
                    <circle cx="50" cy="20" r="1.5" fill="#ffeb3b" opacity="1" filter="url(#strong-glow)"/>
                </g>

                <!-- PHOENIX ADULT - Majestic firebird -->
                <g id="tm-mascot-evo3-phoenix" style="display: none;">
                    <defs>
                        <linearGradient id="phoenix-adult-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ff6f00;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#e65100;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="solar-aura">
                            <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:0.6" />
                            <stop offset="70%" style="stop-color:#ff9800;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Solar aura -->
                    <ellipse cx="50" cy="66" rx="42" ry="44" fill="url(#solar-aura)" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="26" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Tail feathers (magnificent) -->
                    <path d="M 58 82 Q 68 88 76 94" stroke="#ff3d00" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 54 82 Q 62 90 68 96" stroke="#ff6f00" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 50 82 Q 54 92 56 98" stroke="#ffa726" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 46 82 Q 40 90 34 96" stroke="#ff6f00" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 42 82 Q 32 88 24 94" stroke="#ff3d00" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <circle cx="76" cy="95" r="3" fill="#ffeb3b" filter="url(#glow)"/>
                    <circle cx="56" cy="99" r="2.5" fill="#ffeb3b" filter="url(#glow)"/>
                    <circle cx="24" cy="95" r="3" fill="#ffeb3b" filter="url(#glow)"/>
                    <!-- Legs -->
                    <line x1="46" y1="82" x2="44" y2="92" stroke="#bf360c" stroke-width="3.5"/>
                    <path d="M 44 92 L 38 94 M 44 92 L 44 96 M 44 92 L 50 94" stroke="#bf360c" stroke-width="2.5"/>
                    <line x1="54" y1="82" x2="56" y2="92" stroke="#bf360c" stroke-width="3.5"/>
                    <path d="M 56 92 L 50 94 M 56 92 L 56 96 M 56 92 L 62 94" stroke="#bf360c" stroke-width="2.5"/>
                    <!-- Body -->
                    <ellipse cx="50" cy="66" rx="20" ry="24" fill="url(#phoenix-adult-body)"/>
                    <!-- Wings (majestic, spread) -->
                    <ellipse cx="24" cy="62" rx="14" ry="24" fill="#e65100" transform="rotate(-35 24 62)"/>
                    <path d="M 22 48 L 14 42 M 22 54 L 14 52 M 22 60 L 14 62 M 22 66 L 14 72 M 22 72 L 14 80" stroke="#ff3d00" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 16 44 L 12 42 M 16 54 L 12 54 M 16 64 L 12 66 M 16 74 L 12 78" stroke="#ffeb3b" stroke-width="2" opacity="0.6"/>
                    <ellipse cx="76" cy="62" rx="14" ry="24" fill="#e65100" transform="rotate(35 76 62)"/>
                    <path d="M 78 48 L 86 42 M 78 54 L 86 52 M 78 60 L 86 62 M 78 66 L 86 72 M 78 72 L 86 80" stroke="#ff3d00" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 84 44 L 88 42 M 84 54 L 88 54 M 84 64 L 88 66 M 84 74 L 88 78" stroke="#ffeb3b" stroke-width="2" opacity="0.6"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="38" rx="16" ry="18" fill="url(#phoenix-adult-body)"/>
                    <!-- Crown crest (solar) -->
                    <path d="M 38 30 L 42 18 L 46 26 L 50 16 L 54 26 L 58 18 L 62 30" fill="#ff3d00"/>
                    <path d="M 42 20 L 46 22 L 50 14 L 54 22 L 58 20" fill="#ffeb3b" opacity="0.7" filter="url(#glow)"/>
                    <!-- Eyes (burning) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="38" rx="4.5" ry="6" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="42" cy="40" rx="2.5" ry="4" fill="#bf360c"/>
                        <circle cx="43.5" cy="37" r="1.5" fill="#fff"/>
                        <ellipse cx="58" cy="38" rx="4.5" ry="6" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="58" cy="40" rx="2.5" ry="4" fill="#bf360c"/>
                        <circle cx="59.5" cy="37" r="1.5" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 38 Q 42 36 47 38" stroke="#e65100" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 38 Q 58 36 63 38" stroke="#e65100" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Beak (sharp) -->
                    <path d="M 48 46 L 50 50 L 52 46 Z" fill="#bf360c"/>
                    <!-- Solar flares -->
                    <circle cx="28" cy="38" r="2.5" fill="#ffeb3b" filter="url(#strong-glow)"/>
                    <circle cx="72" cy="40" r="2.3" fill="#ffeb3b" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="14" r="2.8" fill="#fff" filter="url(#strong-glow)"/>
                </g>

                <!-- PHOENIX MIDDLE AGE - Eternal flame keeper -->
                <g id="tm-mascot-evo4-phoenix" style="display: none;">
                    <defs>
                        <linearGradient id="phoenix-middle-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ff5722;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#d84315;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Fire aura (intense) -->
                    <ellipse cx="50" cy="66" rx="40" ry="42" fill="#ff6f00" opacity="0.35" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="26" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Tail feathers (long, burning) -->
                    <path d="M 58 82 Q 70 88 80 94" stroke="#d32f2f" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 54 82 Q 64 90 72 96" stroke="#f4511e" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 50 82 Q 56 92 60 98" stroke="#ff6f00" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 46 82 Q 38 90 30 96" stroke="#f4511e" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <path d="M 42 82 Q 30 88 20 94" stroke="#d32f2f" stroke-width="6" fill="none" stroke-linecap="round"/>
                    <circle cx="80" cy="95" r="3" fill="#ff9800" filter="url(#glow)"/>
                    <circle cx="60" cy="99" r="2.5" fill="#ff9800" filter="url(#glow)"/>
                    <circle cx="20" cy="95" r="3" fill="#ff9800" filter="url(#glow)"/>
                    <!-- Legs -->
                    <line x1="46" y1="82" x2="44" y2="92" stroke="#bf360c" stroke-width="3.5"/>
                    <path d="M 44 92 L 38 94 M 44 92 L 44 96 M 44 92 L 50 94" stroke="#bf360c" stroke-width="2.5"/>
                    <line x1="54" y1="82" x2="56" y2="92" stroke="#bf360c" stroke-width="3.5"/>
                    <path d="M 56 92 L 50 94 M 56 92 L 56 96 M 56 92 L 62 94" stroke="#bf360c" stroke-width="2.5"/>
                    <!-- Body -->
                    <ellipse cx="50" cy="66" rx="20" ry="24" fill="url(#phoenix-middle-body)"/>
                    <!-- Battle-scarred markings -->
                    <path d="M 38 60 Q 50 58 62 60" stroke="#8d6e63" stroke-width="1.5" opacity="0.3"/>
                    <path d="M 40 68 Q 50 66 60 68" stroke="#8d6e63" stroke-width="1.5" opacity="0.3"/>
                    <!-- Wings (powerful) -->
                    <ellipse cx="24" cy="62" rx="14" ry="24" fill="#d84315" transform="rotate(-35 24 62)"/>
                    <path d="M 22 48 L 14 42 M 22 54 L 14 52 M 22 60 L 14 62 M 22 66 L 14 72 M 22 72 L 14 80" stroke="#d32f2f" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 16 44 L 12 42 M 16 54 L 12 54 M 16 64 L 12 66" stroke="#ff9800" stroke-width="2" opacity="0.5"/>
                    <ellipse cx="76" cy="62" rx="14" ry="24" fill="#d84315" transform="rotate(35 76 62)"/>
                    <path d="M 78 48 L 86 42 M 78 54 L 86 52 M 78 60 L 86 62 M 78 66 L 86 72 M 78 72 L 86 80" stroke="#d32f2f" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 84 44 L 88 42 M 84 54 L 88 54 M 84 64 L 88 66" stroke="#ff9800" stroke-width="2" opacity="0.5"/>
                    <!-- Head -->
                    <ellipse cx="50" cy="38" rx="16" ry="18" fill="url(#phoenix-middle-body)"/>
                    <!-- Crown (burning steady) -->
                    <path d="M 38 30 L 42 18 L 46 26 L 50 16 L 54 26 L 58 18 L 62 30" fill="#d32f2f"/>
                    <path d="M 44 22 L 48 20 L 50 16 L 52 20 L 56 22" fill="#ff9800" opacity="0.6"/>
                    <!-- Eyes (eternal) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="38" rx="4.5" ry="6" fill="#ffccbc" filter="url(#glow)"/>
                        <ellipse cx="42" cy="40" rx="2.5" ry="4" fill="#bf360c"/>
                        <circle cx="43.5" cy="37" r="1.3" fill="#ffccbc"/>
                        <ellipse cx="58" cy="38" rx="4.5" ry="6" fill="#ffccbc" filter="url(#glow)"/>
                        <ellipse cx="58" cy="40" rx="2.5" ry="4" fill="#bf360c"/>
                        <circle cx="59.5" cy="37" r="1.3" fill="#ffccbc"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 38 Q 42 36 47 38" stroke="#d84315" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 38 Q 58 36 63 38" stroke="#d84315" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Beak -->
                    <path d="M 48 46 L 50 50 L 52 46 Z" fill="#bf360c"/>
                </g>

                <!-- PHOENIX OLD - Immortal ancient phoenix -->
                <g id="tm-mascot-evo5-phoenix" style="display: none;">
                    <defs>
                        <linearGradient id="phoenix-old-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#ffa726;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ff6f00;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="immortal-aura">
                            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.8" />
                            <stop offset="40%" style="stop-color:#ffeb3b;stop-opacity:0.5" />
                            <stop offset="80%" style="stop-color:#ff9800;stop-opacity:0.2" />
                            <stop offset="100%" style="stop-color:#ff3d00;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Immortal divine aura -->
                    <ellipse cx="50" cy="66" rx="48" ry="48" fill="url(#immortal-aura)" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="28" ry="4" fill="#333" opacity="0.35"/>
                    <!-- Tail feathers (divine, endless) -->
                    <path d="M 60 82 Q 74 88 86 94 Q 92 96 94 92" stroke="#ff3d00" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <path d="M 56 82 Q 68 90 78 96 Q 82 98 84 94" stroke="#ff6f00" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <path d="M 52 82 Q 60 92 66 98 Q 68 100 70 98" stroke="#ffa726" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <path d="M 48 82 Q 42 92 36 98 Q 34 100 32 98" stroke="#ffa726" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <path d="M 44 82 Q 32 90 22 96 Q 18 98 16 94" stroke="#ff6f00" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <path d="M 40 82 Q 26 88 14 94 Q 8 96 6 92" stroke="#ff3d00" stroke-width="7" fill="none" stroke-linecap="round"/>
                    <circle cx="94" cy="91" r="3.5" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="70" cy="99" r="3" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="32" cy="99" r="3" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="6" cy="91" r="3.5" fill="#fff" filter="url(#strong-glow)"/>
                    <!-- Legs (ancient, golden) -->
                    <line x1="46" y1="82" x2="44" y2="92" stroke="#f57c00" stroke-width="3.5"/>
                    <path d="M 44 92 L 38 94 M 44 92 L 44 96 M 44 92 L 50 94" stroke="#f57c00" stroke-width="2.5"/>
                    <line x1="54" y1="82" x2="56" y2="92" stroke="#f57c00" stroke-width="3.5"/>
                    <path d="M 56 92 L 50 94 M 56 92 L 56 96 M 56 92 L 62 94" stroke="#f57c00" stroke-width="2.5"/>
                    <!-- Body (radiant) -->
                    <ellipse cx="50" cy="66" rx="22" ry="24" fill="url(#phoenix-old-body)" filter="url(#glow)"/>
                    <!-- Ancient divine markings -->
                    <path d="M 36 60 Q 50 58 64 60" stroke="#fff" stroke-width="1.5" opacity="0.5" filter="url(#glow)"/>
                    <path d="M 38 68 Q 50 66 62 68" stroke="#fff" stroke-width="1.5" opacity="0.5" filter="url(#glow)"/>
                    <circle cx="50" cy="66" r="4" fill="#fff" opacity="0.4" filter="url(#glow)"/>
                    <!-- Wings (eternal, magnificent) -->
                    <ellipse cx="22" cy="62" rx="16" ry="26" fill="#ff9800" transform="rotate(-38 22 62)" filter="url(#glow)"/>
                    <path d="M 20 46 L 10 38 M 20 52 L 10 48 M 20 58 L 10 58 M 20 64 L 10 68 M 20 70 L 10 78 M 20 76 L 10 86" stroke="#ff3d00" stroke-width="3" opacity="0.9"/>
                    <path d="M 12 40 L 6 36 M 12 50 L 6 50 M 12 60 L 6 62 M 12 70 L 6 74 M 12 80 L 6 84" stroke="#ffeb3b" stroke-width="2.5" opacity="0.7" filter="url(#glow)"/>
                    <ellipse cx="78" cy="62" rx="16" ry="26" fill="#ff9800" transform="rotate(38 78 62)" filter="url(#glow)"/>
                    <path d="M 80 46 L 90 38 M 80 52 L 90 48 M 80 58 L 90 58 M 80 64 L 90 68 M 80 70 L 90 78 M 80 76 L 90 86" stroke="#ff3d00" stroke-width="3" opacity="0.9"/>
                    <path d="M 88 40 L 94 36 M 88 50 L 94 50 M 88 60 L 94 62 M 88 70 L 94 74 M 88 80 L 94 84" stroke="#ffeb3b" stroke-width="2.5" opacity="0.7" filter="url(#glow)"/>
                    <!-- Head (divine wisdom) -->
                    <ellipse cx="50" cy="36" rx="18" ry="20" fill="url(#phoenix-old-body)" filter="url(#glow)"/>
                    <!-- Divine crown (blazing halo) -->
                    <path d="M 36 28 L 40 14 L 44 24 L 48 12 L 50 10 L 52 12 L 56 24 L 60 14 L 64 28" fill="#ff6f00" filter="url(#strong-glow)"/>
                    <path d="M 40 16 L 44 18 L 48 10 L 50 8 L 52 10 L 56 18 L 60 16" fill="#ffeb3b" opacity="0.8" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="8" r="3" fill="#fff" filter="url(#strong-glow)"/>
                    <!-- Eyes (immortal knowledge) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="36" rx="5" ry="7" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="42" cy="38" rx="2.5" ry="4.5" fill="#e65100"/>
                        <circle cx="43.5" cy="35" r="1.8" fill="#fff"/>
                        <ellipse cx="58" cy="36" rx="5" ry="7" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="58" cy="38" rx="2.5" ry="4.5" fill="#e65100"/>
                        <circle cx="59.5" cy="35" r="1.8" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <path d="M 37 36 Q 42 34 47 36" stroke="#ff9800" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M 53 36 Q 58 34 63 36" stroke="#ff9800" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    </g>
                    <!-- Beak (golden) -->
                    <path d="M 48 44 L 50 48 L 52 44 Z" fill="#ffa726"/>
                    <!-- Eternal light -->
                    <circle cx="26" cy="36" r="3" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="74" cy="38" r="2.8" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="26" r="2" fill="#fff" opacity="0.8" filter="url(#glow)"/>
                </g>

                <!-- ═══════════════════════════════════════ -->
                <!-- CRYSTAL CHARACTER - All Life Stages -->
                <!-- Gem & Light • Epic Rarity -->
                <!-- ═══════════════════════════════════════ -->
                
                <!-- CRYSTAL BABY - Tiny gemstone -->
                <g id="tm-mascot-baby-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-baby-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#e1f5fe;stop-opacity:0.9" />
                            <stop offset="100%" style="stop-color:#81d4fa;stop-opacity:0.95" />
                        </linearGradient>
                        <radialGradient id="crystal-glow">
                            <stop offset="0%" style="stop-color:#80deea;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#00bcd4;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Crystal glow -->
                    <ellipse cx="50" cy="58" rx="24" ry="26" fill="url(#crystal-glow)" filter="url(#glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="80" rx="18" ry="4" fill="#333" opacity="0.15"/>
                    <!-- Main crystal body (geometric) -->
                    <path d="M 50 40 L 64 54 L 62 72 L 50 78 L 38 72 L 36 54 Z" fill="url(#crystal-baby-body)" stroke="#4dd0e1" stroke-width="2" opacity="0.9"/>
                    <!-- Facets -->
                    <path d="M 50 40 L 50 78" stroke="#e0f7fa" stroke-width="1" opacity="0.6"/>
                    <path d="M 36 54 L 64 54" stroke="#e0f7fa" stroke-width="1" opacity="0.6"/>
                    <path d="M 38 72 L 62 72" stroke="#e0f7fa" stroke-width="1" opacity="0.6"/>
                    <path d="M 50 40 L 38 72" stroke="#80deea" stroke-width="0.8" opacity="0.4"/>
                    <path d="M 50 40 L 62 72" stroke="#80deea" stroke-width="0.8" opacity="0.4"/>
                    <!-- Light reflection -->
                    <ellipse cx="46" cy="50" rx="6" ry="8" fill="#fff" opacity="0.6"/>
                    <ellipse cx="54" cy="54" rx="4" ry="6" fill="#fff" opacity="0.4"/>
                    <!-- Eyes (glowing) -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="45" cy="58" r="3" fill="#fff" opacity="0.9"/>
                        <circle cx="45" cy="59" r="1.8" fill="#00acc1"/>
                        <circle cx="46" cy="57" r="0.8" fill="#fff"/>
                        <circle cx="55" cy="58" r="3" fill="#fff" opacity="0.9"/>
                        <circle cx="55" cy="59" r="1.8" fill="#00acc1"/>
                        <circle cx="56" cy="57" r="0.8" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="42" y1="58" x2="48" y2="58" stroke="#4dd0e1" stroke-width="1.5"/>
                        <line x1="52" y1="58" x2="58" y2="58" stroke="#4dd0e1" stroke-width="1.5"/>
                    </g>
                    <!-- Mouth (crystal seam) -->
                    <path class="tm-mascot-mouth-happy" d="M 44 64 L 50 66 L 56 64" stroke="#4dd0e1" stroke-width="1.5" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 44 66 L 50 64 L 56 66" stroke="#4dd0e1" stroke-width="1.5" fill="none"/>
                    <!-- Sparkles -->
                    <circle cx="40" cy="52" r="1.5" fill="#fff" opacity="0.9"/>
                    <circle cx="60" cy="56" r="1.2" fill="#fff" opacity="0.8"/>
                    <circle cx="50" cy="42" r="1" fill="#fff" opacity="1"/>
                </g>

                <!-- CRYSTAL KID - Growing prism -->
                <g id="tm-mascot-evo1-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-kid-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#b3e5fc;stop-opacity:0.95" />
                            <stop offset="100%" style="stop-color:#4fc3f7;stop-opacity:0.98" />
                        </linearGradient>
                    </defs>
                    <!-- Prism glow -->
                    <ellipse cx="50" cy="62" rx="28" ry="32" fill="#80deea" opacity="0.25" filter="url(#glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="86" rx="22" ry="5" fill="#333" opacity="0.2"/>
                    <!-- Main body (larger crystal) -->
                    <path d="M 50 36 L 68 56 L 66 76 L 50 84 L 34 76 L 32 56 Z" fill="url(#crystal-kid-body)" stroke="#29b6f6" stroke-width="2.5" opacity="0.95"/>
                    <!-- Facets -->
                    <path d="M 50 36 L 50 84" stroke="#e1f5fe" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 32 56 L 68 56" stroke="#e1f5fe" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 34 76 L 66 76" stroke="#e1f5fe" stroke-width="1.5" opacity="0.7"/>
                    <path d="M 50 36 L 34 76" stroke="#80deea" stroke-width="1" opacity="0.5"/>
                    <path d="M 50 36 L 66 76" stroke="#80deea" stroke-width="1" opacity="0.5"/>
                    <path d="M 32 56 L 50 84" stroke="#80deea" stroke-width="1" opacity="0.5"/>
                    <path d="M 68 56 L 50 84" stroke="#80deea" stroke-width="1" opacity="0.5"/>
                    <!-- Light reflections -->
                    <ellipse cx="44" cy="48" rx="8" ry="12" fill="#fff" opacity="0.6"/>
                    <ellipse cx="56" cy="52" rx="6" ry="9" fill="#fff" opacity="0.4"/>
                    <!-- Crystal arms (forming) -->
                    <path d="M 32 56 L 24 58" stroke="#29b6f6" stroke-width="4" opacity="0.8"/>
                    <path d="M 22 58 L 26 54 L 26 62 Z" fill="url(#crystal-kid-body)" opacity="0.8"/>
                    <path d="M 68 56 L 76 58" stroke="#29b6f6" stroke-width="4" opacity="0.8"/>
                    <path d="M 78 58 L 74 54 L 74 62 Z" fill="url(#crystal-kid-body)" opacity="0.8"/>
                    <!-- Eyes -->
                    <g class="tm-mascot-eye-open">
                        <circle cx="44" cy="60" r="3.5" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                        <circle cx="44" cy="61" r="2" fill="#0097a7"/>
                        <circle cx="45" cy="59" r="1" fill="#fff"/>
                        <circle cx="56" cy="60" r="3.5" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                        <circle cx="56" cy="61" r="2" fill="#0097a7"/>
                        <circle cx="57" cy="59" r="1" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="40" y1="60" x2="48" y2="60" stroke="#29b6f6" stroke-width="2"/>
                        <line x1="52" y1="60" x2="60" y2="60" stroke="#29b6f6" stroke-width="2"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 42 68 L 50 70 L 58 68" stroke="#29b6f6" stroke-width="2" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 42 70 L 50 68 L 58 70" stroke="#29b6f6" stroke-width="2" fill="none"/>
                    <!-- Sparkles -->
                    <circle cx="36" cy="46" r="1.8" fill="#fff" opacity="0.9"/>
                    <circle cx="64" cy="50" r="1.5" fill="#fff" opacity="0.8"/>
                    <circle cx="50" cy="38" r="1.3" fill="#fff" opacity="1"/>
                </g>

                <!-- CRYSTAL TEEN - Prismatic form -->
                <g id="tm-mascot-evo2-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-teen-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#80deea;stop-opacity:0.95" />
                            <stop offset="100%" style="stop-color:#26c6da;stop-opacity:0.98" />
                        </linearGradient>
                    </defs>
                    <!-- Rainbow prism glow -->
                    <ellipse cx="50" cy="66" rx="32" ry="36" fill="#4dd0e1" opacity="0.3" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="92" rx="24" ry="5" fill="#333" opacity="0.25"/>
                    <!-- Main body -->
                    <path d="M 50 32 L 72 58 L 70 80 L 50 90 L 30 80 L 28 58 Z" fill="url(#crystal-teen-body)" stroke="#00bcd4" stroke-width="3" opacity="0.95"/>
                    <!-- Facets (more complex) -->
                    <path d="M 50 32 L 50 90" stroke="#e0f7fa" stroke-width="2" opacity="0.8"/>
                    <path d="M 28 58 L 72 58" stroke="#e0f7fa" stroke-width="2" opacity="0.8"/>
                    <path d="M 30 80 L 70 80" stroke="#e0f7fa" stroke-width="2" opacity="0.8"/>
                    <path d="M 50 32 L 30 80" stroke="#80deea" stroke-width="1.5" opacity="0.6"/>
                    <path d="M 50 32 L 70 80" stroke="#80deea" stroke-width="1.5" opacity="0.6"/>
                    <path d="M 28 58 L 50 90" stroke="#80deea" stroke-width="1.5" opacity="0.6"/>
                    <path d="M 72 58 L 50 90" stroke="#80deea" stroke-width="1.5" opacity="0.6"/>
                    <path d="M 40 45 L 60 75" stroke="#b2ebf2" stroke-width="1" opacity="0.4"/>
                    <path d="M 60 45 L 40 75" stroke="#b2ebf2" stroke-width="1" opacity="0.4"/>
                    <!-- Reflections (rainbow) -->
                    <ellipse cx="42" cy="48" rx="10" ry="14" fill="#fff" opacity="0.5"/>
                    <ellipse cx="58" cy="52" rx="7" ry="11" fill="#fff" opacity="0.35"/>
                    <!-- Arms (crystal spikes) -->
                    <path d="M 28 58 L 18 60 L 16 56 L 22 54 Z" fill="url(#crystal-teen-body)" stroke="#00bcd4" stroke-width="2" opacity="0.9"/>
                    <path d="M 72 58 L 82 60 L 84 56 L 78 54 Z" fill="url(#crystal-teen-body)" stroke="#00bcd4" stroke-width="2" opacity="0.9"/>
                    <!-- Legs (crystal base) -->
                    <path d="M 40 86 L 38 92 L 42 92 Z" fill="url(#crystal-teen-body)" opacity="0.9"/>
                    <path d="M 60 86 L 58 92 L 62 92 Z" fill="url(#crystal-teen-body)" opacity="0.9"/>
                    <!-- Eyes (glowing bright) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="43" cy="60" rx="4" ry="5.5" fill="#fff" filter="url(#glow)"/>
                        <ellipse cx="43" cy="62" rx="2" ry="3.5" fill="#00838f"/>
                        <circle cx="44" cy="59" r="1.2" fill="#fff"/>
                        <ellipse cx="57" cy="60" rx="4" ry="5.5" fill="#fff" filter="url(#glow)"/>
                        <ellipse cx="57" cy="62" rx="2" ry="3.5" fill="#00838f"/>
                        <circle cx="58" cy="59" r="1.2" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="39" y1="60" x2="47" y2="60" stroke="#00bcd4" stroke-width="2"/>
                        <line x1="53" y1="60" x2="61" y2="60" stroke="#00bcd4" stroke-width="2"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 40 70 L 50 72 L 60 70" stroke="#00bcd4" stroke-width="2" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 40 72 L 50 70 L 60 72" stroke="#00bcd4" stroke-width="2" fill="none"/>
                    <!-- Rainbow sparkles -->
                    <circle cx="32" cy="44" r="2" fill="#e91e63" opacity="0.6"/>
                    <circle cx="68" cy="48" r="1.8" fill="#9c27b0" opacity="0.6"/>
                    <circle cx="50" cy="34" r="1.5" fill="#fff" opacity="0.9" filter="url(#glow)"/>
                </g>

                <!-- CRYSTAL ADULT - Radiant crystal guardian -->
                <g id="tm-mascot-evo3-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-adult-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#4dd0e1;stop-opacity:0.98" />
                            <stop offset="100%" style="stop-color:#00acc1;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Radiant aura -->
                    <ellipse cx="50" cy="68" rx="38" ry="42" fill="#26c6da" opacity="0.35" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="26" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Main body (complex crystal) -->
                    <path d="M 50 28 L 76 60 L 74 84 L 50 94 L 26 84 L 24 60 Z" fill="url(#crystal-adult-body)" stroke="#0097a7" stroke-width="3.5" filter="url(#glow)"/>
                    <!-- Facets (detailed) -->
                    <path d="M 50 28 L 50 94" stroke="#e0f7fa" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 24 60 L 76 60" stroke="#e0f7fa" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 26 84 L 74 84" stroke="#e0f7fa" stroke-width="2.5" opacity="0.9"/>
                    <path d="M 50 28 L 26 84" stroke="#80deea" stroke-width="2" opacity="0.7"/>
                    <path d="M 50 28 L 74 84" stroke="#80deea" stroke-width="2" opacity="0.7"/>
                    <path d="M 24 60 L 50 94" stroke="#80deea" stroke-width="2" opacity="0.7"/>
                    <path d="M 76 60 L 50 94" stroke="#80deea" stroke-width="2" opacity="0.7"/>
                    <path d="M 38 44 L 62 76" stroke="#b2ebf2" stroke-width="1.5" opacity="0.5"/>
                    <path d="M 62 44 L 38 76" stroke="#b2ebf2" stroke-width="1.5" opacity="0.5"/>
                    <path d="M 32 72 L 68 72" stroke="#b2ebf2" stroke-width="1.5" opacity="0.5"/>
                    <!-- Reflections -->
                    <ellipse cx="40" cy="46" rx="12" ry="16" fill="#fff" opacity="0.5"/>
                    <ellipse cx="58" cy="50" rx="9" ry="13" fill="#fff" opacity="0.35"/>
                    <!-- Crystal arms (powerful) -->
                    <path d="M 24 60 L 12 62 L 10 56 L 18 52 Z" fill="url(#crystal-adult-body)" stroke="#0097a7" stroke-width="2.5" opacity="0.95"/>
                    <path d="M 12 62 L 8 64 L 10 60 Z" fill="#26c6da" opacity="0.8"/>
                    <path d="M 76 60 L 88 62 L 90 56 L 82 52 Z" fill="url(#crystal-adult-body)" stroke="#0097a7" stroke-width="2.5" opacity="0.95"/>
                    <path d="M 88 62 L 92 64 L 90 60 Z" fill="#26c6da" opacity="0.8"/>
                    <!-- Legs (crystal pillars) -->
                    <path d="M 38 88 L 36 94 L 42 94 L 40 88 Z" fill="url(#crystal-adult-body)" stroke="#0097a7" stroke-width="2"/>
                    <path d="M 62 88 L 60 94 L 66 94 L 64 88 Z" fill="url(#crystal-adult-body)" stroke="#0097a7" stroke-width="2"/>
                    <!-- Core (mana) -->
                    <circle cx="50" cy="68" r="8" fill="#4dd0e1" opacity="0.6" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="68" r="4" fill="#fff" opacity="0.8" filter="url(#glow)"/>
                    <!-- Eyes (radiant) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="58" rx="5" ry="7" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="42" cy="60" rx="2.5" ry="4.5" fill="#006064"/>
                        <circle cx="43.5" cy="57" r="1.5" fill="#fff"/>
                        <ellipse cx="58" cy="58" rx="5" ry="7" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="58" cy="60" rx="2.5" ry="4.5" fill="#006064"/>
                        <circle cx="59.5" cy="57" r="1.5" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="37" y1="58" x2="47" y2="58" stroke="#0097a7" stroke-width="2.5"/>
                        <line x1="53" y1="58" x2="63" y2="58" stroke="#0097a7" stroke-width="2.5"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 38 76 L 50 78 L 62 76" stroke="#0097a7" stroke-width="2.5" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 38 78 L 50 76 L 62 78" stroke="#0097a7" stroke-width="2.5" fill="none"/>
                    <!-- Light prisms -->
                    <circle cx="30" cy="40" r="2.5" fill="#e91e63" opacity="0.7" filter="url(#glow)"/>
                    <circle cx="70" cy="44" r="2.2" fill="#9c27b0" opacity="0.7" filter="url(#glow)"/>
                    <circle cx="50" cy="30" r="2" fill="#fff" filter="url(#strong-glow)"/>
                </g>

                <!-- CRYSTAL MIDDLE AGE - Ancient gem -->
                <g id="tm-mascot-evo4-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-middle-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#26c6da;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#0097a7;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Ancient aura -->
                    <ellipse cx="50" cy="68" rx="40" ry="42" fill="#00acc1" opacity="0.4" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="28" ry="4" fill="#333" opacity="0.3"/>
                    <!-- Main body (larger, weathered) -->
                    <path d="M 50 28 L 76 60 L 74 84 L 50 94 L 26 84 L 24 60 Z" fill="url(#crystal-middle-body)" stroke="#00838f" stroke-width="3.5" filter="url(#glow)"/>
                    <!-- Weathering cracks -->
                    <path d="M 36 48 L 34 56" stroke="#006064" stroke-width="1" opacity="0.3"/>
                    <path d="M 64 50 L 66 58" stroke="#006064" stroke-width="1" opacity="0.3"/>
                    <path d="M 42 78 L 44 86" stroke="#006064" stroke-width="1" opacity="0.3"/>
                    <!-- Facets -->
                    <path d="M 50 28 L 50 94" stroke="#e0f7fa" stroke-width="2.5" opacity="0.8"/>
                    <path d="M 24 60 L 76 60" stroke="#e0f7fa" stroke-width="2.5" opacity="0.8"/>
                    <path d="M 26 84 L 74 84" stroke="#e0f7fa" stroke-width="2.5" opacity="0.8"/>
                    <path d="M 50 28 L 26 84" stroke="#80deea" stroke-width="2" opacity="0.6"/>
                    <path d="M 50 28 L 74 84" stroke="#80deea" stroke-width="2" opacity="0.6"/>
                    <path d="M 24 60 L 50 94" stroke="#80deea" stroke-width="2" opacity="0.6"/>
                    <path d="M 76 60 L 50 94" stroke="#80deea" stroke-width="2" opacity="0.6"/>
                    <!-- Reflections (dimmer) -->
                    <ellipse cx="40" cy="46" rx="10" ry="14" fill="#fff" opacity="0.35"/>
                    <ellipse cx="58" cy="50" rx="7" ry="11" fill="#fff" opacity="0.25"/>
                    <!-- Arms -->
                    <path d="M 24 60 L 14 62 L 12 56 L 20 52 Z" fill="url(#crystal-middle-body)" stroke="#00838f" stroke-width="2.5"/>
                    <path d="M 14 62 L 10 64 L 12 60 Z" fill="#00acc1" opacity="0.7"/>
                    <path d="M 76 60 L 86 62 L 88 56 L 80 52 Z" fill="url(#crystal-middle-body)" stroke="#00838f" stroke-width="2.5"/>
                    <path d="M 86 62 L 90 64 L 88 60 Z" fill="#00acc1" opacity="0.7"/>
                    <!-- Legs -->
                    <path d="M 38 88 L 36 94 L 42 94 L 40 88 Z" fill="url(#crystal-middle-body)" stroke="#00838f" stroke-width="2"/>
                    <path d="M 62 88 L 60 94 L 66 94 L 64 88 Z" fill="url(#crystal-middle-body)" stroke="#00838f" stroke-width="2"/>
                    <!-- Core (stable) -->
                    <circle cx="50" cy="68" r="7" fill="#26c6da" opacity="0.7" filter="url(#glow)"/>
                    <circle cx="50" cy="68" r="3.5" fill="#b2ebf2" opacity="0.8"/>
                    <!-- Eyes (ancient) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="58" rx="4.5" ry="6.5" fill="#e0f7fa" filter="url(#glow)"/>
                        <ellipse cx="42" cy="60" rx="2.2" ry="4" fill="#004d40"/>
                        <circle cx="43.5" cy="57" r="1.2" fill="#e0f7fa"/>
                        <ellipse cx="58" cy="58" rx="4.5" ry="6.5" fill="#e0f7fa" filter="url(#glow)"/>
                        <ellipse cx="58" cy="60" rx="2.2" ry="4" fill="#004d40"/>
                        <circle cx="59.5" cy="57" r="1.2" fill="#e0f7fa"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="37" y1="58" x2="47" y2="58" stroke="#00838f" stroke-width="2.5"/>
                        <line x1="53" y1="58" x2="63" y2="58" stroke="#00838f" stroke-width="2.5"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 38 76 L 50 78 L 62 76" stroke="#00838f" stroke-width="2.5" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 38 78 L 50 76 L 62 78" stroke="#00838f" stroke-width="2.5" fill="none"/>
                    <!-- Ancient runes (faint) -->
                    <text x="44" y="72" font-family="serif" font-size="6" fill="#80deea" opacity="0.4">◊</text>
                    <text x="54" y="72" font-family="serif" font-size="6" fill="#80deea" opacity="0.4">◊</text>
                </g>

                <!-- CRYSTAL OLD - Eternal crystal sage -->
                <g id="tm-mascot-evo5-crystal" style="display: none;">
                    <defs>
                        <linearGradient id="crystal-old-body" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#b3e5fc;stop-opacity:1" />
                            <stop offset="70%" style="stop-color:#4fc3f7;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#00acc1;stop-opacity:1" />
                        </linearGradient>
                        <radialGradient id="eternal-crystal-aura">
                            <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:0.8" />
                            <stop offset="50%" style="stop-color:#80deea;stop-opacity:0.5" />
                            <stop offset="100%" style="stop-color="#26c6da;stop-opacity:0" />
                        </radialGradient>
                    </defs>
                    <!-- Eternal aura -->
                    <ellipse cx="50" cy="68" rx="48" ry="48" fill="url(#eternal-crystal-aura)" filter="url(#strong-glow)"/>
                    <!-- Shadow -->
                    <ellipse cx="50" cy="94" rx="30" ry="4" fill="#333" opacity="0.35"/>
                    <!-- Main body (massive, ancient) -->
                    <path d="M 50 26 L 78 60 L 76 84 L 50 96 L 24 84 L 22 60 Z" fill="url(#crystal-old-body)" stroke="#00bcd4" stroke-width="4" filter="url(#strong-glow)"/>
                    <!-- Ancient cracks (wisdom lines) -->
                    <path d="M 34 46 L 32 56 L 30 66" stroke="#006064" stroke-width="1.5" opacity="0.4"/>
                    <path d="M 66 48 L 68 58 L 70 68" stroke="#006064" stroke-width="1.5" opacity="0.4"/>
                    <path d="M 38 76 L 40 86" stroke="#006064" stroke-width="1.5" opacity="0.4"/>
                    <path d="M 62 78 L 60 88" stroke="#006064" stroke-width="1.5" opacity="0.4"/>
                    <!-- Facets (complex, ancient) -->
                    <path d="M 50 26 L 50 96" stroke="#fff" stroke-width="3" opacity="0.9" filter="url(#glow)"/>
                    <path d="M 22 60 L 78 60" stroke="#fff" stroke-width="3" opacity="0.9" filter="url(#glow)"/>
                    <path d="M 24 84 L 76 84" stroke="#fff" stroke-width="3" opacity="0.9" filter="url(#glow)"/>
                    <path d="M 50 26 L 24 84" stroke="#b2ebf2" stroke-width="2" opacity="0.7"/>
                    <path d="M 50 26 L 76 84" stroke="#b2ebf2" stroke-width="2" opacity="0.7"/>
                    <path d="M 22 60 L 50 96" stroke="#b2ebf2" stroke-width="2" opacity="0.7"/>
                    <path d="M 78 60 L 50 96" stroke="#b2ebf2" stroke-width="2" opacity="0.7"/>
                    <path d="M 36 43 L 64 77" stroke="#e1f5fe" stroke-width="1.5" opacity="0.6"/>
                    <path d="M 64 43 L 36 77" stroke="#e1f5fe" stroke-width="1.5" opacity="0.6"/>
                    <path d="M 28 72 L 72 72" stroke="#e1f5fe" stroke-width="1.5" opacity="0.6"/>
                    <!-- Eternal light reflections -->
                    <ellipse cx="38" cy="44" rx="14" ry="18" fill="#fff" opacity="0.6" filter="url(#glow)"/>
                    <ellipse cx="60" cy="48" rx="11" ry="15" fill="#fff" opacity="0.5" filter="url(#glow)"/>
                    <!-- Arms (ancient crystal spikes) -->
                    <path d="M 22 60 L 10 62 L 8 56 L 16 50 Z" fill="url(#crystal-old-body)" stroke="#00bcd4" stroke-width="3" filter="url(#glow)"/>
                    <path d="M 10 62 L 4 64 L 8 60 Z" fill="#4fc3f7" opacity="0.8"/>
                    <path d="M 78 60 L 90 62 L 92 56 L 84 50 Z" fill="url(#crystal-old-body)" stroke="#00bcd4" stroke-width="3" filter="url(#glow)"/>
                    <path d="M 90 62 L 96 64 L 92 60 Z" fill="#4fc3f7" opacity="0.8"/>
                    <!-- Legs (massive pillars) -->
                    <path d="M 36 88 L 34 96 L 42 96 L 40 88 Z" fill="url(#crystal-old-body)" stroke="#00bcd4" stroke-width="2.5"/>
                    <path d="M 64 88 L 62 96 L 70 96 L 68 88 Z" fill="url(#crystal-old-body)" stroke="#00bcd4" stroke-width="2.5"/>
                    <!-- Core (infinite mana) -->
                    <circle cx="50" cy="68" r="10" fill="#fff" opacity="0.7" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="68" r="6" fill="#4fc3f7" opacity="0.9" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="68" r="3" fill="#fff" filter="url(#glow)"/>
                    <!-- Eyes (eternal wisdom) -->
                    <g class="tm-mascot-eye-open">
                        <ellipse cx="42" cy="56" rx="5.5" ry="8" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="42" cy="58" rx="2.5" ry="5" fill="#00838f"/>
                        <circle cx="43.5" cy="55" r="1.8" fill="#fff"/>
                        <ellipse cx="58" cy="56" rx="5.5" ry="8" fill="#fff" filter="url(#strong-glow)"/>
                        <ellipse cx="58" cy="58" rx="2.5" ry="5" fill="#00838f"/>
                        <circle cx="59.5" cy="55" r="1.8" fill="#fff"/>
                    </g>
                    <g class="tm-mascot-eye-closed" style="display:none;">
                        <line x1="36" y1="56" x2="48" y2="56" stroke="#00bcd4" stroke-width="3"/>
                        <line x1="52" y1="56" x2="64" y2="56" stroke="#00bcd4" stroke-width="3"/>
                    </g>
                    <!-- Mouth -->
                    <path class="tm-mascot-mouth-happy" d="M 36 78 L 50 80 L 64 78" stroke="#00bcd4" stroke-width="3" fill="none"/>
                    <path class="tm-mascot-mouth-sad" style="display:none;" d="M 36 80 L 50 78 L 64 80" stroke="#00bcd4" stroke-width="3" fill="none"/>
                    <!-- Ancient runes (glowing) -->
                    <text x="40" y="72" font-family="serif" font-size="7" fill="#4fc3f7" opacity="0.7" filter="url(#glow)">◊</text>
                    <text x="54" y="72" font-family="serif" font-size="7" fill="#4fc3f7" opacity="0.7" filter="url(#glow)">◊</text>
                    <text x="46" y="34" font-family="serif" font-size="8" fill="#fff" opacity="0.8" filter="url(#strong-glow)">✧</text>
                    <!-- Eternal light particles -->
                    <circle cx="28" cy="36" r="2.5" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="72" cy="40" r="2.3" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="50" cy="24" r="3" fill="#fff" filter="url(#strong-glow)"/>
                    <circle cx="36" cy="86" r="1.8" fill="#4fc3f7" opacity="0.8" filter="url(#glow)"/>
                    <circle cx="64" cy="88" r="1.8" fill="#4fc3f7" opacity="0.8" filter="url(#glow)"/>
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
        const eggWarmth = tamagotchiLightsOn ? 'Ζεστό' : 'Κρύο';

        const characterName = isEgg
            ? 'Μυστικό Ωό'
            : (MASCOT_CHARACTERS[tamagotchiCharacterType]?.name || 'Mascot');
        
        const stageEmoji = {
            'egg': '🥚',
            'baby': '👶',
            'kid': '🧒',
            'teen': '🎮',
            'adult': '💼',
            'middleage': '👔',
            'old': '👴'
        };

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'tm-mascot-stats-modal';
        modal.innerHTML = `
            <div class="tm-mascot-modal-backdrop"></div>
            <div class="tm-mascot-modal-container">
                <!-- Header -->
                <div class="tm-mascot-modal-header">
                    <div class="tm-mascot-header-left">
                        <div class="tm-mascot-avatar">${stageEmoji[tamagotchiStage] || '🥚'}</div>
                        <div class="tm-mascot-header-info">
                            <h2 class="tm-mascot-name">${characterName}</h2>
                            <p class="tm-mascot-meta">
                                <span>Στάδιο: ${tamagotchiStage}</span>
                                <span>•</span>
                                <span>${isEgg ? `Εκκόλαψη σε ~${minutesToHatch} λεπτά` : `Ηλικία: ${Math.floor(tamagotchiAge)} έτη`}</span>
                                ${isEgg ? '' : `<span>•</span><span>Βάρος: ${Math.round(tamagotchiWeight * 10) / 10}g</span>`}
                            </p>
                            <div class="tm-mascot-quick-stats">
                                ${isEgg ? `
                                    <span class="tm-quick-stat" title="Πρόοδος">🥚 ${hatchProgress}%</span>
                                    <span class="tm-quick-stat" title="Θερμοκρασία">${tamagotchiLightsOn ? '🔥' : '❄️'} ${eggWarmth}</span>
                                    <span class="tm-quick-stat" title="Φώτα">${tamagotchiLightsOn ? '💡 Ανοιχτά' : '🌙 Κλειστά'}</span>
                                ` : `
                                    <span class="tm-quick-stat" title="Πειθαρχία">🎓 ${Math.round(tamagotchiDiscipline * 10) / 10}%</span>
                                    <span class="tm-quick-stat" title="Καθαρότητα">${tamagotchiPoopCount > 0 ? '💩 ' + tamagotchiPoopCount : '✨ Καθαρό'}</span>
                                    <span class="tm-quick-stat" title="Φώτα">${tamagotchiLightsOn ? '💡 Ανοιχτά' : '🌙 Κλειστά'}</span>
                                `}
                            </div>
                        </div>
                    </div>
                    <button class="tm-mascot-close-btn" id="tm-modal-close">✕</button>
                </div>

                <!-- Alerts Section -->
                <div class="tm-mascot-alerts" id="tm-mascot-alerts">
                    ${isEgg ? `
                        <div class="tm-mascot-alert tm-alert-info">
                            <span class="tm-alert-icon">🥚</span>
                            <span>Κράτα τα φώτα ανοιχτά για ζεστασιά. Η εκκόλαψη έρχεται σύντομα!</span>
                        </div>
                    ` : ''}
                    ${!isEgg && tamagotchiLifeMinutes >= TAMA_STAGE_MINUTES.old && tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.death ? `
                        <div class="tm-mascot-alert tm-alert-warning">
                            <span class="tm-alert-icon">⏳</span>
                            <span>Πολύ μεγάλος σε ηλικία!</span>
                        </div>
                    ` : ''}
                    ${!isEgg && tamagotchiPoopCount > 0 ? `
                        <div class="tm-mascot-alert tm-alert-warning">
                            <span class="tm-alert-icon">💩</span>
                            <span>Χρειάζεται καθάρισμα! (${tamagotchiPoopCount})</span>
                        </div>
                    ` : ''}
                    ${!isEgg && tamagotchiHealth < 50 ? `
                        <div class="tm-mascot-alert tm-alert-danger">
                            <span class="tm-alert-icon">🤒</span>
                            <span>Άρρωστος! Χρειάζεται φάρμακο!</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Stats / Hatch Progress -->
                ${isEgg ? `
                <div class="tm-mascot-stats-grid" style="grid-template-columns: 1fr;">
                    <div class="tm-stat-card">
                        <div class="tm-stat-icon" style="background: linear-gradient(135deg, #4ecdc4, #26a69a);">🥚</div>
                        <div class="tm-stat-info">
                            <div class="tm-stat-label">Πρόοδος Εκκόλαψης</div>
                            <div class="tm-stat-bar">
                                <div class="tm-stat-fill" id="tm-egg-hatch-fill" style="width: ${hatchProgress}%; background: linear-gradient(90deg, #4ecdc4, #1de9b6);"></div>
                            </div>
                            <div class="tm-stat-value" id="tm-egg-hatch-value">${hatchProgress}%</div>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="tm-mascot-stats-grid">
                    <div class="tm-stat-card">
                        <div class="tm-stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">😊</div>
                        <div class="tm-stat-info">
                            <div class="tm-stat-label">Ευτυχία</div>
                            <div class="tm-stat-bar">
                                <div class="tm-stat-fill" style="width: ${petStats.happiness}%; background: linear-gradient(90deg, #FFD700, #FFA500);"></div>
                            </div>
                            <div class="tm-stat-value">${Math.round(petStats.happiness * 10) / 10}%</div>
                        </div>
                    </div>

                    <div class="tm-stat-card">
                        <div class="tm-stat-icon" style="background: linear-gradient(135deg, #32CD32, #228B22);">🍔</div>
                        <div class="tm-stat-info">
                            <div class="tm-stat-label">Πείνα</div>
                            <div class="tm-stat-bar">
                                <div class="tm-stat-fill" style="width: ${100 - petStats.hunger}%; background: linear-gradient(90deg, #32CD32, #228B22);"></div>
                            </div>
                            <div class="tm-stat-value">${Math.round((100 - petStats.hunger) * 10) / 10}%</div>
                        </div>
                    </div>

                    <div class="tm-stat-card">
                        <div class="tm-stat-icon" style="background: linear-gradient(135deg, #00CED1, #008B8B);">❤️</div>
                        <div class="tm-stat-info">
                            <div class="tm-stat-label">Υγεία</div>
                            <div class="tm-stat-bar">
                                <div class="tm-stat-fill" style="width: ${tamagotchiHealth}%; background: linear-gradient(90deg, #00CED1, #008B8B);"></div>
                            </div>
                            <div class="tm-stat-value">${Math.round(tamagotchiHealth * 10) / 10}%</div>
                        </div>
                    </div>

                    <div class="tm-stat-card">
                        <div class="tm-stat-icon" style="background: linear-gradient(135deg, #9370DB, #6A5ACD);">🎓</div>
                        <div class="tm-stat-info">
                            <div class="tm-stat-label">Πειθαρχία</div>
                            <div class="tm-stat-bar">
                                <div class="tm-stat-fill" style="width: ${tamagotchiDiscipline}%; background: linear-gradient(90deg, #9370DB, #6A5ACD);"></div>
                            </div>
                            <div class="tm-stat-value">${Math.round(tamagotchiDiscipline * 10) / 10}%</div>
                        </div>
                    </div>
                </div>
                `}

                <!-- Actions Section -->
                ${isEgg ? `
                <div class="tm-mascot-actions-section">
                    <h3 class="tm-actions-title">🥚 Φροντίδα Ωού</h3>
                    <div class="tm-mascot-actions">
                        <button class="tm-action-btn" id="tm-action-egg-warm" title="Ζέστανε το ωό">
                            <span class="tm-action-icon">🔥</span>
                            <span class="tm-action-label">Ζέστανε</span>
                        </button>
                        <button class="tm-action-btn" id="tm-action-egg-watch" title="Παρακολούθησε το ωό">
                            <span class="tm-action-icon">👀</span>
                            <span class="tm-action-label">Παρακολούθησε</span>
                        </button>
                        <button class="tm-action-btn tm-action-lights" id="tm-action-lights" title="Άνοιγμα/Κλείσιμο φώτων">
                            <span class="tm-action-icon">${tamagotchiLightsOn ? '💡' : '🌙'}</span>
                            <span class="tm-action-label">${tamagotchiLightsOn ? 'Φώτα' : 'Σκοτάδι'}</span>
                        </button>
                    </div>
                </div>
                ` : `
                <div class="tm-mascot-actions-section">
                    <h3 class="tm-actions-title">Φροντίδα</h3>
                    <div class="tm-mascot-actions">
                        <button class="tm-action-btn tm-action-meal" id="tm-action-meal" title="Γεύμα (+30 πείνα)">
                            <span class="tm-action-icon">🍖</span>
                            <span class="tm-action-label">Γεύμα</span>
                        </button>
                        <button class="tm-action-btn tm-action-snack" id="tm-action-snack" title="Σνακ (+10 πείνα, +20 ευτυχία)">
                            <span class="tm-action-icon">🍪</span>
                            <span class="tm-action-label">Σνακ</span>
                        </button>
                        <button class="tm-action-btn tm-action-pet" id="tm-action-pet" title="Χάδι (+15 ευτυχία)">
                            <span class="tm-action-icon">💕</span>
                            <span class="tm-action-label">Χάδι</span>
                        </button>
                        <button class="tm-action-btn tm-action-clean" id="tm-action-clean" title="Καθάρισμα">
                            <span class="tm-action-icon">🧹</span>
                            <span class="tm-action-label">Καθάρισμα</span>
                        </button>
                        <button class="tm-action-btn tm-action-medicine" id="tm-action-medicine" title="Φάρμακο (+20 υγεία)">
                            <span class="tm-action-icon">💊</span>
                            <span class="tm-action-label">Φάρμακο</span>
                        </button>
                        <button class="tm-action-btn tm-action-toilet" id="tm-action-toilet" title="Τουαλέτα (+3 πειθαρχία)">
                            <span class="tm-action-icon">🚽</span>
                            <span class="tm-action-label">Τουαλέτα</span>
                        </button>
                    </div>
                </div>

                <!-- Training Section -->
                <div class="tm-mascot-actions-section">
                    <h3 class="tm-actions-title">Εκπαίδευση</h3>
                    <div class="tm-mascot-actions tm-actions-training">
                        <button class="tm-action-btn tm-action-praise" id="tm-action-praise" title="Επαίνεσε (+5 πειθαρχία, +5 ευτυχία)">
                            <span class="tm-action-icon">👍</span>
                            <span class="tm-action-label">Έπαινος</span>
                        </button>
                        <button class="tm-action-btn tm-action-scold" id="tm-action-scold" title="Επίπληξη (+10 πειθαρχία, -10 ευτυχία)">
                            <span class="tm-action-icon">👎</span>
                            <span class="tm-action-label">Επίπληξη</span>
                        </button>
                    </div>
                </div>

                <!-- Fun & Activities Section -->
                <div class="tm-mascot-actions-section">
                    <h3 class="tm-actions-title">Διασκέδαση</h3>
                    <div class="tm-mascot-actions tm-actions-fun">
                        <button class="tm-action-btn tm-action-play" id="tm-action-play" title="Παίξε μαζί του (+20 ευτυχία)">
                            <span class="tm-action-icon">🎮</span>
                            <span class="tm-action-label">Παιχνίδι</span>
                        </button>
                        <button class="tm-action-btn tm-action-lights" id="tm-action-lights" title="Άνοιγμα/Κλείσιμο φώτων">
                            <span class="tm-action-icon">💡</span>
                            <span class="tm-action-label">Φώτα</span>
                        </button>
                    </div>
                </div>
                `}

                <!-- Kill & restart (always available) -->
                <div class="tm-mascot-actions-section tm-mascot-danger-section">
                    <h3 class="tm-actions-title">⚠️ Επαναφορά</h3>
                    <button type="button" class="tm-action-btn tm-action-kill-restart" id="tm-action-kill-restart" title="Σκοτώνει το τρέχον mascot και ξεκινά νέο αυγό">
                        <span class="tm-action-icon">💀</span>
                        <span class="tm-action-label">Σκότωσε &amp; νέο αυγό</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles
        if (!document.getElementById('tm-mascot-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'tm-mascot-modal-styles';
            style.textContent = `
                .tm-mascot-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    z-index: 100000;
                    animation: tmFadeIn 0.3s ease-out;
                }

                .tm-mascot-modal-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 100001;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 24px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: tmSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .tm-mascot-modal-container::-webkit-scrollbar {
                    width: 8px;
                }

                .tm-mascot-modal-container::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .tm-mascot-modal-container::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 255, 0.3);
                    border-radius: 4px;
                }

                .tm-mascot-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 28px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.2);
                }

                .tm-mascot-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .tm-mascot-avatar {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #00CED1, #1E90FF);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    box-shadow: 0 8px 16px rgba(0, 206, 209, 0.3);
                }

                .tm-mascot-header-info {
                    flex: 1;
                }

                .tm-mascot-name {
                    margin: 0 0 6px 0;
                    font-size: 24px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .tm-mascot-meta {
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .tm-mascot-quick-stats {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .tm-quick-stat {
                    font-size: 12px;
                    padding: 4px 10px;
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid rgba(0, 255, 255, 0.2);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.9);
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 500;
                }

                .tm-mascot-close-btn {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tm-mascot-close-btn:hover {
                    background: rgba(255, 70, 70, 0.8);
                    transform: rotate(90deg);
                }

                .tm-mascot-alerts {
                    padding: 0 28px;
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tm-mascot-alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 18px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    animation: tmPulse 2s infinite;
                }

                .tm-alert-warning {
                    background: rgba(255, 193, 7, 0.2);
                    border: 1px solid rgba(255, 193, 7, 0.4);
                    color: #FFD700;
                }

                .tm-alert-danger {
                    background: rgba(255, 87, 87, 0.2);
                    border: 1px solid rgba(255, 87, 87, 0.4);
                    color: #FF6B6B;
                }

                .tm-alert-info {
                    background: rgba(78, 205, 196, 0.2);
                    border: 1px solid rgba(78, 205, 196, 0.4);
                    color: #4ecdc4;
                }

                .tm-alert-icon {
                    font-size: 20px;
                }

                .tm-mascot-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    padding: 28px;
                }

                .tm-stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 18px;
                    display: flex;
                    gap: 14px;
                    align-items: center;
                    transition: all 0.3s;
                }

                .tm-stat-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }

                .tm-stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .tm-stat-info {
                    flex: 1;
                    min-width: 0;
                }

                .tm-stat-label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 6px;
                    font-weight: 500;
                }

                .tm-stat-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 4px;
                }

                .tm-stat-fill {
                    height: 100%;
                    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border-radius: 4px;
                }

                .tm-stat-value {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    text-align: right;
                    font-weight: 600;
                }

                .tm-mascot-actions-section {
                    padding: 0 28px 28px 28px;
                }

                .tm-actions-title {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                    text-align: center;
                }

                .tm-mascot-actions {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }

                .tm-actions-training,
                .tm-actions-fun {
                    grid-template-columns: repeat(2, 1fr);
                }

                .tm-action-btn {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 14px;
                    padding: 16px 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: #fff;
                    font-weight: 500;
                }

                .tm-action-btn:hover {
                    background: rgba(0, 255, 255, 0.15);
                    border-color: rgba(0, 255, 255, 0.4);
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 12px 24px rgba(0, 255, 255, 0.2);
                }

                .tm-action-btn:active {
                    transform: translateY(-2px) scale(1.02);
                }

                .tm-mascot-danger-section {
                    padding-top: 0;
                }

                .tm-action-kill-restart {
                    width: 100%;
                    background: rgba(220, 53, 69, 0.12);
                    border-color: rgba(220, 53, 69, 0.45);
                }

                .tm-action-kill-restart:hover {
                    background: rgba(220, 53, 69, 0.28);
                    border-color: rgba(220, 53, 69, 0.75);
                    box-shadow: 0 12px 24px rgba(220, 53, 69, 0.22);
                }

                .tm-action-icon {
                    font-size: 32px;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
                }

                .tm-action-label {
                    font-size: 13px;
                }

                @keyframes tmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes tmSlideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -45%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                @keyframes tmPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @media (max-width: 640px) {
                    .tm-mascot-stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .tm-mascot-actions {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Helper function to update stats in modal
        function updateModalStats() {
            if (tamagotchiStage === 'egg') {
                const progress = Math.round(getEggHatchProgress());
                const fill = modal.querySelector('#tm-egg-hatch-fill');
                const value = modal.querySelector('#tm-egg-hatch-value');
                if (fill) fill.style.width = progress + '%';
                if (value) value.textContent = progress + '%';
                const quickStatsContainer = modal.querySelector('.tm-mascot-quick-stats');
                if (quickStatsContainer) {
                    quickStatsContainer.innerHTML = `
                        <span class="tm-quick-stat" title="Πρόοδος">🥚 ${progress}%</span>
                        <span class="tm-quick-stat" title="Θερμοκρασία">${tamagotchiLightsOn ? '🔥' : '❄️'} ${tamagotchiLightsOn ? 'Ζεστό' : 'Κρύο'}</span>
                        <span class="tm-quick-stat" title="Φώτα">${tamagotchiLightsOn ? '💡 Ανοιχτά' : '🌙 Κλειστά'}</span>
                    `;
                }
                return;
            }

            const statCards = modal.querySelectorAll('.tm-stat-card');
            if (statCards[0]) {
                const fill = statCards[0].querySelector('.tm-stat-fill');
                const value = statCards[0].querySelector('.tm-stat-value');
                if (fill) fill.style.width = petStats.happiness + '%';
                if (value) value.textContent = (Math.round(petStats.happiness * 10) / 10) + '%';
            }
            if (statCards[1]) {
                const fill = statCards[1].querySelector('.tm-stat-fill');
                const value = statCards[1].querySelector('.tm-stat-value');
                const hungerDisplay = 100 - petStats.hunger;
                if (fill) fill.style.width = hungerDisplay + '%';
                if (value) value.textContent = (Math.round(hungerDisplay * 10) / 10) + '%';
            }
            if (statCards[2]) {
                const fill = statCards[2].querySelector('.tm-stat-fill');
                const value = statCards[2].querySelector('.tm-stat-value');
                if (fill) fill.style.width = tamagotchiHealth + '%';
                if (value) value.textContent = (Math.round(tamagotchiHealth * 10) / 10) + '%';
            }
            if (statCards[3]) {
                const fill = statCards[3].querySelector('.tm-stat-fill');
                const value = statCards[3].querySelector('.tm-stat-value');
                if (fill) fill.style.width = tamagotchiDiscipline + '%';
                if (value) value.textContent = (Math.round(tamagotchiDiscipline * 10) / 10) + '%';
            }

            // Update alerts
            const alertsContainer = modal.querySelector('#tm-mascot-alerts');
            if (alertsContainer) {
                alertsContainer.innerHTML = '';
                if (tamagotchiLifeMinutes >= TAMA_STAGE_MINUTES.old && tamagotchiLifeMinutes < TAMA_STAGE_MINUTES.death) {
                    alertsContainer.innerHTML += `
                        <div class="tm-mascot-alert tm-alert-warning">
                            <span class="tm-alert-icon">⏳</span>
                            <span>Πολύ μεγάλος σε ηλικία!</span>
                        </div>
                    `;
                }
                if (tamagotchiPoopCount > 0) {
                    alertsContainer.innerHTML += `
                        <div class="tm-mascot-alert tm-alert-warning">
                            <span class="tm-alert-icon">💩</span>
                            <span>Χρειάζεται καθάρισμα! (${tamagotchiPoopCount})</span>
                        </div>
                    `;
                }
                if (tamagotchiHealth < 50) {
                    alertsContainer.innerHTML += `
                        <div class="tm-mascot-alert tm-alert-danger">
                            <span class="tm-alert-icon">🤒</span>
                            <span>Άρρωστος! Χρειάζεται φάρμακο!</span>
                        </div>
                    `;
                }
            }

            // Update quick stats in header
            const quickStatsContainer = modal.querySelector('.tm-mascot-quick-stats');
            if (quickStatsContainer) {
                quickStatsContainer.innerHTML = `
                    <span class="tm-quick-stat" title="Πειθαρχία">🎓 ${Math.round(tamagotchiDiscipline * 10) / 10}%</span>
                    <span class="tm-quick-stat" title="Καθαρότητα">${tamagotchiPoopCount > 0 ? '💩 ' + tamagotchiPoopCount : '✨ Καθαρό'}</span>
                    <span class="tm-quick-stat" title="Φώτα">${tamagotchiLightsOn ? '💡 Ανοιχτά' : '🌙 Κλειστά'}</span>
                `;
            }
        }

        // Event listeners
        let eggModalInterval = null;
        const closeBtn = modal.querySelector('#tm-modal-close');
        const closeModal = () => {
            if (eggModalInterval) {
                clearInterval(eggModalInterval);
                eggModalInterval = null;
            }
            modal.querySelector('.tm-mascot-modal-backdrop').style.animation = 'tmFadeIn 0.2s ease-out reverse';
            modal.querySelector('.tm-mascot-modal-container').style.animation = 'tmSlideUp 0.2s ease-out reverse';
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
            if (ok && restartTamagotchiAsEgg(config, STORAGE_KEYS, { skipConfirm: true })) {
                closeModal();
            }
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
                const feedMessages = MASCOT_MESSAGES.feed;
                updatePetStats(config, STORAGE_KEYS, 0, 30);
                updateTamagotchiWeight('meal');
                tamagotchiLastFed = Date.now();
                trackDailyStat(config, STORAGE_KEYS, 'feedMascot');
                setMascotState(config, 'eating', 2000);
                showMascotBubble(feedMessages[Math.floor(Math.random() * feedMessages.length)], 2000);
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
                updatePetStats(config, STORAGE_KEYS, 20, 10);
                updateTamagotchiWeight('snack');
                tamagotchiLastFed = Date.now();
                setMascotState(config, 'eating', 2000);
                showMascotBubble(mascotMsg('snack'), 2000);
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
            saveTamagotchiData(STORAGE_KEYS);
            updateModalStats();
        });

        // Clean button
        modal.querySelector('#tm-action-clean')?.addEventListener('click', () => {
            if (tamagotchiPoopCount > 0) {
                tamagotchiPoopCount = 0;
                updatePetStats(config, STORAGE_KEYS, 10, 0);
                const cleanMessages = MASCOT_MESSAGES.clean;
                showMascotBubble(cleanMessages[Math.floor(Math.random() * cleanMessages.length)], 1500);
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
                tamagotchiHealth = Math.min(100, tamagotchiHealth + 20);
                const medicineMessages = MASCOT_MESSAGES.medicine;
                showMascotBubble(medicineMessages[Math.floor(Math.random() * medicineMessages.length)], 2000);
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
                if (tamagotchiDiscipline > 40 && !tamagotchiToiletTrained) {
                    tamagotchiToiletTrained = true;
                    showMascotBubble(MASCOT_MESSAGES.toiletTrained, 2500);
                } else {
                    showMascotBubble(MASCOT_MESSAGES.toiletRelief, 2000);
                }
                updatePoopIndicator();
                updateToiletNeedIndicator();
                updateTamagotchiStats(container);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                tamagotchiLastPoopTime = Date.now();
                showMascotBubble(MASCOT_MESSAGES.toiletOk, 2000);
                updateToiletNeedIndicator();
                saveTamagotchiData(STORAGE_KEYS);
            }
        });

        // Praise button
        modal.querySelector('#tm-action-praise')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (tamagotchiNeedsPraise) {
                tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 5);
                updatePetStats(config, STORAGE_KEYS, 5, 0);
                tamagotchiNeedsPraise = false;
                showMascotBubble(MASCOT_MESSAGES.praiseThanks, 2000);
                setMascotState(config, 'happy', 2000);
                updateTamagotchiStats(container);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                const randomPraise = MASCOT_MESSAGES.praise;
                showMascotBubble(randomPraise[Math.floor(Math.random() * randomPraise.length)], 1500);
            }
        });

        // Scold button
        modal.querySelector('#tm-action-scold')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (tamagotchiNeedsScold) {
                tamagotchiDiscipline = Math.min(100, tamagotchiDiscipline + 10);
                updatePetStats(config, STORAGE_KEYS, -10, 0);
                tamagotchiNeedsScold = false;
                showMascotBubble(MASCOT_MESSAGES.scoldSorry, 2500);
                setMascotState(config, 'sad', 2500);
                updateTamagotchiStats(container);
                saveTamagotchiData(STORAGE_KEYS);
                updateModalStats();
            } else {
                const scoldMessages = MASCOT_MESSAGES.scold;
                updatePetStats(config, STORAGE_KEYS, -5, 0);
                showMascotBubble(scoldMessages[Math.floor(Math.random() * scoldMessages.length)], 2000);
                setMascotState(config, 'sad', 2000);
                updateModalStats();
            }
        });

        // Play button - Launch mini-game
        modal.querySelector('#tm-action-play')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            if (petStats.happiness < 100) {
                // Close stats modal and launch game
                modal.remove();
                showMascotMiniGame(config, STORAGE_KEYS);
            } else {
                showMascotBubble(MASCOT_MESSAGES.tired, 1500);
            }
        });

        // Lights button
        modal.querySelector('#tm-action-lights')?.addEventListener('click', () => {
            if (tamagotchiIsDead) {
                showMascotBubble(MASCOT_MESSAGES.dead, 2000);
                return;
            }
            
            tamagotchiLightsOn = !tamagotchiLightsOn;
            tamagotchiLightsManualOverride = true;
            saveTamagotchiData(STORAGE_KEYS);
            
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

    // --- Pet Interaction Logic ---
    container.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;

        showMascotStatsModal(config, STORAGE_KEYS);
        
        if (!tamagotchiIsDead && tamagotchiStage !== 'egg') {
            const greetingMessages = MASCOT_MESSAGES.greeting;
            showMascotBubble(greetingMessages[Math.floor(Math.random() * greetingMessages.length)], 2000);
        }
        
        e.stopPropagation();
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
            restartTamagotchiAsEgg(config, STORAGE_KEYS, { skipConfirm: true });
        }
    });
    
    // --- Initialization ---
    loadPetStats(config, STORAGE_KEYS);
    loadTamagotchiData(STORAGE_KEYS);
    
    // Restore lights state based on loaded data
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) {
        setMascotState(config, 'powersave');
        stopRoaming(config);
    } else {
        // Ensure state is correct if lights are on
        if (tamagotchiLightsOn && !tamagotchiIsSleeping) {
            setMascotState(config, 'idle');
        }
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
window.confirmMascotKillRestart = confirmMascotKillRestart;
window.previewMascotStage = previewMascotStage;
window.clearMascotStagePreview = clearMascotStagePreview;
window.updateMascotAppearanceByStage = updateMascotAppearanceByStage;
window.setMascotState = setMascotState;
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