/**
 * Mascot play features: hide-and-seek, chase cursor, teach tricks,
 * nickname helpers, rhythm/shadow/scramble mini-games, accessory toys.
 * Loaded after myman_mascot.js (shared bundle scope).
 */

// ── Teachable tricks ──────────────────────────────────────────────
const MASCOT_TEACHABLE_TRICKS = {
    spin: {
        id: 'spin',
        name: 'Στροφή',
        nameEn: 'Spin',
        state: 'spin',
        practiceNeeded: 5,
        chars: null, // all
    },
    bow: {
        id: 'bow',
        name: 'Υπόκλιση',
        nameEn: 'Bow',
        state: 'bow',
        practiceNeeded: 4,
        chars: null,
    },
    fire_breath: {
        id: 'fire_breath',
        name: 'Φωτιά',
        nameEn: 'Fire breath',
        state: 'firebreath',
        practiceNeeded: 6,
        chars: ['phoenix', 'dragon'],
    },
    firebolt: {
        id: 'firebolt',
        name: 'Βολίδα',
        nameEn: 'Firebolt',
        state: 'firebreath',
        practiceNeeded: 5,
        chars: ['phoenix'],
        desc: 'Ρίχνει φωτιά στο status του μενού όταν μιλάει για επισκευές.',
    },
    tempest: {
        id: 'tempest',
        name: 'Θύελλα',
        nameEn: 'Tempest',
        state: 'energized',
        practiceNeeded: 5,
        chars: ['leviathan'],
        desc: 'Ρίχνει κεραυνό στο status του μενού όταν μιλάει για επισκευές.',
    },
};

const MASCOT_TEACH_PRACTICE_KEY = 'practice'; // nested in taughtTricks.practice[trickId]

function normalizeMascotNickname(raw) {
    if (raw == null) return '';
    let s = String(raw).trim().replace(/\s+/g, ' ');
    if (!s) return '';
    // Keep short Greek/Latin pet names only
    s = s.replace(/[^\p{L}\p{N}\s\-'_]/gu, '');
    if (s.length > 16) s = s.slice(0, 16).trim();
    return s;
}

function getMascotDisplayName() {
    const nick = normalizeMascotNickname(typeof tamagotchiNickname !== 'undefined' ? tamagotchiNickname : '');
    if (nick) return nick;
    if (tamagotchiStage === 'egg') return 'Μυστήριο αυγάκι';
    return MASCOT_CHARACTERS[tamagotchiCharacterType]?.name
        || MASCOT_CHAR_NAMES_GR?.[tamagotchiCharacterType]
        || 'Mascot';
}

function formatMascotBubbleText(text) {
    if (text == null || text === '') return text;
    const name = getMascotDisplayName();
    return String(text)
        .replace(/\{nickname\}/g, name)
        .replace(/\{name\}/g, name);
}

function setMascotNickname(name, STORAGE_KEYS) {
    tamagotchiNickname = normalizeMascotNickname(name);
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    return tamagotchiNickname;
}

function getTaughtTricksState() {
    if (!tamagotchiTaughtTricks || typeof tamagotchiTaughtTricks !== 'object') {
        tamagotchiTaughtTricks = { unlocked: [], practice: {} };
    }
    if (!Array.isArray(tamagotchiTaughtTricks.unlocked)) tamagotchiTaughtTricks.unlocked = [];
    if (!tamagotchiTaughtTricks.practice || typeof tamagotchiTaughtTricks.practice !== 'object') {
        tamagotchiTaughtTricks.practice = {};
    }
    return tamagotchiTaughtTricks;
}

function isTrickUnlocked(trickId) {
    return getTaughtTricksState().unlocked.includes(trickId);
}

function getAvailableTeachTricks() {
    return Object.values(MASCOT_TEACHABLE_TRICKS).filter((t) => {
        if (!t.chars) return true;
        return t.chars.includes(tamagotchiCharacterType);
    });
}

function practiceMascotTrick(trickId, config, STORAGE_KEYS) {
    const meta = MASCOT_TEACHABLE_TRICKS[trickId];
    if (!meta) return { ok: false, reason: 'unknown' };
    if (tamagotchiIsDead || tamagotchiStage === 'egg') return { ok: false, reason: 'egg' };
    if (meta.chars && !meta.chars.includes(tamagotchiCharacterType)) {
        return { ok: false, reason: 'char' };
    }

    const state = getTaughtTricksState();
    if (state.unlocked.includes(trickId)) {
        performTaughtTrick(trickId, config, STORAGE_KEYS);
        return { ok: true, unlocked: true, already: true };
    }

    const next = (Number(state.practice[trickId]) || 0) + 1;
    state.practice[trickId] = next;
    const needed = meta.practiceNeeded;

    // Show practice animation (weaker / shorter)
    setMascotState(config || window.config || {}, meta.state, 900);
    updatePetStats(config, STORAGE_KEYS, 1, 0);

    if (next >= needed) {
        state.unlocked.push(trickId);
        state.practice[trickId] = needed;
        showMascotBubble(`Έμαθα «${meta.name}»!`, 2500);
        setMascotMood('proud', 10000);
        if (typeof window.grantXp === 'function') {
            window.grantXp(config, STORAGE_KEYS, 15, 'mascotTeachTrick');
        }
        if (typeof window.grantCoins === 'function') {
            window.grantCoins(config, STORAGE_KEYS, 8, 'mascotTeachTrick');
        }
        saveTamagotchiData(STORAGE_KEYS);
        return { ok: true, unlocked: true, practice: next, needed };
    }

    showMascotBubble(`Εξάσκηση ${meta.name}: ${next}/${needed}`, 1800);
    saveTamagotchiData(STORAGE_KEYS);
    return { ok: true, unlocked: false, practice: next, needed };
}

function performTaughtTrick(trickId, config, STORAGE_KEYS) {
    const meta = MASCOT_TEACHABLE_TRICKS[trickId];
    if (!meta || !isTrickUnlocked(trickId)) return false;
    setMascotState(config || window.config || {}, meta.state, 2800);
    setMascotMood('playful', 6000);
    updatePetStats(config, STORAGE_KEYS, 4, 0);
    const lines = {
        spin: ['Γύρω γύρω!', 'Στροβιλισμός!', 'Whee!'],
        bow: ['Υπόκλιση!', 'Με τιμή!', 'Χαχα…'],
        fire_breath: ['Φωτιά!', 'Καίγομαι!', 'Φλογερό!'],
        firebolt: ['Βολίδα!', 'Κάψε το!', 'Φωτιά στο status!'],
        tempest: ['Θύελλα!', 'Κεραυνός!', 'Σφραγίδα της θύελλας!'],
    };
    const pool = lines[trickId] || ['Τα-δα!'];
    showMascotBubble(pool[Math.floor(Math.random() * pool.length)], 2000);

    if (trickId === 'firebolt' && typeof playPhoenixStatusBurn === 'function') {
        const parsed = typeof parseRepairStatusMenu === 'function'
            ? parseRepairStatusMenu()
            : null;
        const activeIds = parsed?.statusIdMap
            ? Object.keys(parsed.statusIdMap).filter((id) => (parsed.statusIdMap[id]?.count || 0) > 0)
            : [];
        const targetId = activeIds.length
            ? activeIds[Math.floor(Math.random() * activeIds.length)]
            : '30';
        setTimeout(() => playPhoenixStatusBurn(targetId, { requireUnlock: false }), 220);
    }

    if (trickId === 'tempest' && typeof playLeviathanStatusStorm === 'function') {
        const parsed = typeof parseRepairStatusMenu === 'function'
            ? parseRepairStatusMenu()
            : null;
        const activeIds = parsed?.statusIdMap
            ? Object.keys(parsed.statusIdMap).filter((id) => (parsed.statusIdMap[id]?.count || 0) > 0)
            : [];
        const targetId = activeIds.length
            ? activeIds[Math.floor(Math.random() * activeIds.length)]
            : '30';
        setTimeout(() => playLeviathanStatusStorm(targetId, { requireUnlock: false }), 220);
    }

    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    return true;
}

/** Enhanced double-click: cycle unlocked tricks, else default character trick. */
function playMascotTrickEnhanced(config, STORAGE_KEYS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg' || tamaCinematicLock) return false;
    if (isMascotFocusQuiet()) {
        setMascotState(config || window.config || {}, 'happy', 1200);
        return true;
    }

    // Accessory toys take priority on single-click path; dblclick uses tricks
    const unlocked = getTaughtTricksState().unlocked.filter((id) => {
        const meta = MASCOT_TEACHABLE_TRICKS[id];
        if (!meta) return false;
        if (meta.chars && !meta.chars.includes(tamagotchiCharacterType)) return false;
        return true;
    });

    if (unlocked.length) {
        if (typeof mascotTrickCycleIndex !== 'number') mascotTrickCycleIndex = 0;
        const id = unlocked[mascotTrickCycleIndex % unlocked.length];
        mascotTrickCycleIndex = (mascotTrickCycleIndex + 1) % unlocked.length;
        return performTaughtTrick(id, config, STORAGE_KEYS);
    }

    return playMascotTrick(config, STORAGE_KEYS);
}

// ── Chase the cursor ──────────────────────────────────────────────
let mascotChaseEnabled = false;
let mascotChaseRaf = null;
let mascotChaseMouse = { x: 0, y: 0 };
let mascotChaseStamina = 100;
let mascotChaseLastTick = 0;
let mascotChaseMoveHandler = null;

const MASCOT_CHASE_STAMINA_DRAIN = 0.085; // per frame ~5s at 60fps → ~30s play
const MASCOT_CHASE_STAMINA_TIRED = 18;

function isMascotChaseActive() {
    return !!mascotChaseEnabled && !tamagotchiIsDead && tamagotchiStage !== 'egg'
        && !isMascotFocusQuiet() && tamagotchiLightsOn && !tamagotchiIsSleeping;
}

function setMascotChaseEnabled(on, config, STORAGE_KEYS) {
    mascotChaseEnabled = !!on;
    const container = document.getElementById('tm-mascot-container');
    if (container) container.classList.toggle('mascot-chasing', mascotChaseEnabled);

    if (mascotChaseEnabled) {
        // Chase only when playful — nudge mood
        setMascotMood('playful', 0);
        mascotChaseStamina = 100;
        mascotPositionLocked = false;
        stopRoaming(config || window.config || {});
        startMascotChaseLoop(config, STORAGE_KEYS);
        showMascotBubble('Κυνήγι! Πιάσε με… ή εγώ εσένα!', 2200);
    } else {
        stopMascotChaseLoop();
        if (container) container.classList.remove('mascot-chasing', 'mascot-chase-tired');
        if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    }
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    return mascotChaseEnabled;
}

function toggleMascotChase(config, STORAGE_KEYS) {
    return setMascotChaseEnabled(!mascotChaseEnabled, config, STORAGE_KEYS);
}

function startMascotChaseLoop(config, STORAGE_KEYS) {
    stopMascotChaseLoop();
    mascotChaseLastTick = performance.now();
    mascotChaseMoveHandler = (e) => {
        mascotChaseMouse.x = e.clientX;
        mascotChaseMouse.y = e.clientY;
    };
    window.addEventListener('pointermove', mascotChaseMoveHandler, { passive: true });

    const tick = (now) => {
        if (!isMascotChaseActive()) {
            stopMascotChaseLoop();
            return;
        }
        // Require playful mood — if user/mood system changed it, gently restore or tire out
        if (mascotMood !== 'playful' && mascotChaseStamina > MASCOT_CHASE_STAMINA_TIRED) {
            setMascotMood('playful', 0);
        }

        const dt = Math.min(40, now - mascotChaseLastTick) || 16;
        mascotChaseLastTick = now;
        mascotChaseStamina = Math.max(0, mascotChaseStamina - MASCOT_CHASE_STAMINA_DRAIN * (dt / 16));

        const container = document.getElementById('tm-mascot-container');
        if (!container) {
            mascotChaseRaf = requestAnimationFrame(tick);
            return;
        }

        if (mascotChaseStamina <= 0) {
            container.classList.add('mascot-chase-tired');
            setMascotChaseEnabled(false, config, STORAGE_KEYS);
            setMascotMood('sleepy', 14000);
            setMascotState(config || window.config || {}, 'powersave', 0);
            // Soft sleep without flipping lights permanently
            showMascotBubble('Κουράστηκα… ζζζ', 2500);
            setTimeout(() => {
                if (!mascotChaseEnabled && tamagotchiLightsOn) {
                    setMascotState(config || window.config || {}, 'idle');
                    setMascotMood('calm', 8000);
                }
            }, 5000);
            return;
        }

        if (mascotChaseStamina <= MASCOT_CHASE_STAMINA_TIRED) {
            container.classList.add('mascot-chase-tired');
            setMascotMood('sleepy', 0);
        } else {
            container.classList.remove('mascot-chase-tired');
        }

        const pos = getMascotTranslate(container);
        const targetX = mascotChaseMouse.x - (container.offsetWidth || 100) / 2;
        const targetY = mascotChaseMouse.y - (container.offsetHeight || 100) / 2;
        const speed = mascotChaseStamina > MASCOT_CHASE_STAMINA_TIRED ? 0.14 : 0.05;
        const nextX = pos.x + (targetX - pos.x) * speed;
        const nextY = pos.y + (targetY - pos.y) * speed;
        applyMascotPosition(container, nextX, nextY);

        // Flip toward cursor
        const flipper = container.querySelector('.tm-mascot-flipper');
        if (flipper) {
            flipper.style.transform = targetX < pos.x ? 'scaleX(-1)' : 'scaleX(1)';
        }

        mascotChaseRaf = requestAnimationFrame(tick);
    };
    mascotChaseRaf = requestAnimationFrame(tick);
}

function stopMascotChaseLoop() {
    if (mascotChaseRaf) {
        cancelAnimationFrame(mascotChaseRaf);
        mascotChaseRaf = null;
    }
    if (mascotChaseMoveHandler) {
        window.removeEventListener('pointermove', mascotChaseMoveHandler);
        mascotChaseMoveHandler = null;
    }
}

// ── Hide and seek ─────────────────────────────────────────────────
let mascotHideSeekActive = false;
let mascotHideSeekSpot = null;
let mascotHideSeekTimeout = null;
let mascotHideSeekHintShown = false;

const MASCOT_HIDE_SELECTORS = [
    '#tm-footer-controls-container',
    '#footer-outterwrap',
    '#footer-outter',
    '#tm-xp-bar-container',
    '#head-outter',
    '#head-outterwrap',
    '.rnr-s-menu',
    '.rnr-b-vmenu',
    '.tm-search-sidebar',
    '.rnr-left',
    '#menu_block',
];

function getMascotHideSpots() {
    const spots = [];
    const seen = new Set();
    for (const sel of MASCOT_HIDE_SELECTORS) {
        document.querySelectorAll(sel).forEach((el) => {
            if (!(el instanceof HTMLElement)) return;
            const r = el.getBoundingClientRect();
            if (r.width < 40 || r.height < 24) return;
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            if (r.right < 0 || r.left > window.innerWidth) return;
            const key = `${Math.round(r.left)}:${Math.round(r.top)}:${Math.round(r.width)}`;
            if (seen.has(key)) return;
            seen.add(key);
            // Tuck mostly behind the element's edge
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const x = side === 'left'
                ? r.left - 28
                : r.right - 72;
            const y = Math.min(window.innerHeight - 110, Math.max(8, r.top + r.height * 0.35 - 40));
            spots.push({
                el,
                x,
                y,
                label: sel,
                side,
            });
        });
    }
    // Fallback corners near footer/sidebar
    if (!spots.length) {
        spots.push(
            { el: null, x: 8, y: window.innerHeight - 120, label: 'corner-bl', side: 'left' },
            { el: null, x: window.innerWidth - 110, y: window.innerHeight - 120, label: 'corner-br', side: 'right' },
            { el: null, x: 8, y: 80, label: 'corner-tl', side: 'left' },
        );
    }
    return spots;
}

function startMascotHideAndSeek(config, STORAGE_KEYS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg') return false;
    if (isMascotFocusQuiet()) {
        showMascotBubble('Εστίαση — όχι κρυφτό τώρα.', 1800);
        return false;
    }
    endMascotHideAndSeek(config, STORAGE_KEYS, { silent: true, found: false });

    const spots = getMascotHideSpots();
    mascotHideSeekSpot = spots[Math.floor(Math.random() * spots.length)];
    mascotHideSeekActive = true;
    mascotHideSeekHintShown = false;

    const container = document.getElementById('tm-mascot-container');
    if (!container) return false;

    stopRoaming(config || window.config || {});
    setMascotChaseEnabled(false, config, STORAGE_KEYS);
    mascotPositionLocked = true;

    applyMascotPosition(container, mascotHideSeekSpot.x, mascotHideSeekSpot.y);
    container.classList.add('mascot-hiding');
    container.classList.remove('mascot-hide-found');
    setMascotState(config || window.config || {}, 'idle');
    setMascotMood('playful', 20000);

    showMascotBubble('Κρυφτήκα! Βρες με…', 2200);

    // Optional hint after 12s
    mascotHideSeekTimeout = setTimeout(() => {
        if (!mascotHideSeekActive || mascotHideSeekHintShown) return;
        mascotHideSeekHintShown = true;
        const hint = mascotHideSeekSpot?.label?.includes('footer') || mascotHideSeekSpot?.y > window.innerHeight * 0.65
            ? 'Ψιτ… κάτω κάπου!'
            : mascotHideSeekSpot?.x < 120
                ? 'Ψιτ… αριστερά!'
                : 'Ψιτ… κοιτά κάπου στην άκρη!';
        showMascotBubble(hint, 2200);
        container.classList.add('mascot-hide-hint');
    }, 12000);

    // Auto-reveal after 90s
    setTimeout(() => {
        if (mascotHideSeekActive) {
            endMascotHideAndSeek(config, STORAGE_KEYS, { found: false, timedOut: true });
        }
    }, 90000);

    syncMascotInteractionClasses(container);
    return true;
}

function tryRevealMascotHideAndSeek(config, STORAGE_KEYS) {
    if (!mascotHideSeekActive) return false;
    endMascotHideAndSeek(config, STORAGE_KEYS, { found: true });
    return true;
}

function endMascotHideAndSeek(config, STORAGE_KEYS, { found = false, timedOut = false, silent = false } = {}) {
    if (!mascotHideSeekActive && !silent) return;
    mascotHideSeekActive = false;
    mascotHideSeekSpot = null;
    if (mascotHideSeekTimeout) {
        clearTimeout(mascotHideSeekTimeout);
        mascotHideSeekTimeout = null;
    }

    const container = document.getElementById('tm-mascot-container');
    if (container) {
        container.classList.remove('mascot-hiding', 'mascot-hide-hint', 'mascot-hide-found');
        if (found) container.classList.add('mascot-hide-found');
    }

    mascotPositionLocked = false;
    mascotParkedX = null;
    mascotParkedY = null;

    if (silent) {
        syncMascotInteractionClasses(container);
        return;
    }

    if (found) {
        updatePetStats(config, STORAGE_KEYS, 12, 0);
        setMascotState(config || window.config || {}, 'happy', 3000);
        setMascotMood('proud', 8000);
        showMascotBubble('Με βρήκες! Μπράβο {nickname}!', 2500);
        if (typeof burnTamagotchiWeightFromActivity === 'function') {
            burnTamagotchiWeightFromActivity(1.6, STORAGE_KEYS, { announce: false });
        }
        if (typeof window.grantCoins === 'function') {
            window.grantCoins(config, STORAGE_KEYS, 5, 'mascotHideSeek');
        }
        if (typeof window.grantXp === 'function') {
            window.grantXp(config, STORAGE_KEYS, 10, 'mascotHideSeek');
        }
    } else if (timedOut) {
        showMascotBubble('Βγήκα μόνος… την επόμενη!', 2200);
        setMascotMood('grumpy', 6000);
    }

    syncMascotInteractionClasses(container);
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    if (shouldMascotBeRoaming(config || window.config)) {
        startRoaming(config || window.config);
    }
}

// ── Accessory toys ────────────────────────────────────────────────
let mascotJetpackBoostUntil = 0;
let mascotBubblePopCooldown = 0;

function isAccessoryEquipped(itemId, STORAGE_KEYS) {
    try {
        const keys = STORAGE_KEYS || window.STORAGE_KEYS;
        const equipped = JSON.parse(GM_getValue(keys.EQUIPPED_ITEMS, '[]') || '[]');
        const normalized = equipped.map((id) => (typeof normalizeAccessoryId === 'function' ? normalizeAccessoryId(id) : id)).filter(Boolean);
        if (normalized.includes(itemId)) return true;
    } catch (_) { /* ignore */ }
    const el = document.getElementById(itemId);
    return !!(el && el.classList.contains('tm-accessory-equipped'));
}

function tryMascotAccessoryToyClick(config, STORAGE_KEYS, event) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg' || tamaCinematicLock) return false;
    if (isMascotFocusQuiet() || mascotHideSeekActive) return false;
    const target = event?.target;
    if (!target || typeof target.closest !== 'function') return false;

    // Jetpack boost — click the jetpack accessory
    if (isAccessoryEquipped('jetpack', STORAGE_KEYS) && target.closest('#jetpack')) {
        const now = Date.now();
        if (now < mascotJetpackBoostUntil) return true; // consume click, still boosting
        mascotJetpackBoostUntil = now + 3200;
        const container = document.getElementById('tm-mascot-container');
        if (!container) return false;
        stopRoaming(config || window.config || {});
        container.classList.add('mascot-jetpack-boost');
        setMascotState(config || window.config || {}, 'energized', 2800);
        const pos = getMascotTranslate(container);
        const lift = applyMascotPosition(container, pos.x, pos.y - 90);
        showMascotBubble('Νιιώωω! 🚀', 1600);
        updatePetStats(config, STORAGE_KEYS, 2, 0);
        setTimeout(() => {
            container.classList.remove('mascot-jetpack-boost');
            applyMascotPosition(container, lift.x, lift.y + 70);
            if (!mascotPositionLocked && shouldMascotBeRoaming(config)) startRoaming(config);
        }, 2800);
        mascotSuppressClickUntil = Date.now() + 500;
        return true;
    }

    // Bubble wand — click the wand to spawn poppable bubbles
    if (isAccessoryEquipped('bubble_wand', STORAGE_KEYS) && target.closest('#bubble_wand')) {
        const now = Date.now();
        if (now < mascotBubblePopCooldown) return true;
        mascotBubblePopCooldown = now + 1800;
        spawnMascotToyBubbles(config, STORAGE_KEYS);
        setMascotState(config || window.config || {}, 'juggling', 2000);
        showMascotBubble('Φούσκες!', 1200);
        mascotSuppressClickUntil = Date.now() + 400;
        return true;
    }

    return false;
}

function spawnMascotToyBubbles(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    if (!container) return;
    const origin = container.getBoundingClientRect();
    const layer = document.createElement('div');
    layer.className = 'tm-mascot-bubble-toy-layer';
    layer.setAttribute('aria-hidden', 'false');
    document.body.appendChild(layer);

    let popped = 0;
    const total = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < total; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tm-mascot-toy-bubble';
        b.style.left = `${origin.left + origin.width / 2 + (Math.random() * 80 - 40)}px`;
        b.style.top = `${origin.top + 10 + Math.random() * 30}px`;
        b.style.setProperty('--tm-bubble-dx', `${(Math.random() * 120 - 60).toFixed(1)}px`);
        b.style.setProperty('--tm-bubble-dur', `${(2.2 + Math.random() * 1.4).toFixed(2)}s`);
        b.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (b.classList.contains('popped')) return;
            b.classList.add('popped');
            popped += 1;
            if (typeof window.grantCoins === 'function' && Math.random() < 0.55) {
                window.grantCoins(config, STORAGE_KEYS, 1, 'mascotBubbleToy');
            }
            setTimeout(() => b.remove(), 280);
        });
        layer.appendChild(b);
    }

    setTimeout(() => {
        layer.remove();
        if (popped >= 3) {
            updatePetStats(config, STORAGE_KEYS, 5, 0);
            showMascotBubble(`Ποπ ×${popped}!`, 1600);
        }
    }, 4500);
}

// ── Shared mini-game shell ────────────────────────────────────────
function closeMascotPlayOverlay() {
    document.getElementById('tm-mascot-play-overlay')?.remove();
}

function openMascotPlayOverlay({ title, subtitle, bodyHtml, onReady }) {
    closeMascotPlayOverlay();
    const overlay = document.createElement('div');
    overlay.id = 'tm-mascot-play-overlay';
    overlay.innerHTML = `
        <div class="tm-mascot-play-backdrop"></div>
        <div class="tm-mascot-play-card" role="dialog" aria-modal="true">
            <div class="tm-mascot-play-head">
                <div>
                    <h3 class="tm-mascot-play-title">${title}</h3>
                    ${subtitle ? `<p class="tm-mascot-play-sub">${subtitle}</p>` : ''}
                </div>
                <button type="button" class="tm-mascot-play-close" aria-label="Κλείσιμο">&times;</button>
            </div>
            <div class="tm-mascot-play-body">${bodyHtml}</div>
            <div class="tm-mascot-play-foot" id="tm-mascot-play-foot"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.tm-mascot-play-close')?.addEventListener('click', () => closeMascotPlayOverlay());
    overlay.querySelector('.tm-mascot-play-backdrop')?.addEventListener('click', () => closeMascotPlayOverlay());
    if (typeof onReady === 'function') onReady(overlay);
    return overlay;
}

function rewardMascotMiniGame(config, STORAGE_KEYS, { happiness = 8, xp = 12, coins = 6, source = 'mascotMiniGame', weightBurn = 1.2 } = {}) {
    updatePetStats(config, STORAGE_KEYS, happiness, 0);
    if (typeof window.grantXp === 'function' && xp > 0) window.grantXp(config, STORAGE_KEYS, xp, source);
    if (typeof window.grantCoins === 'function' && coins > 0) window.grantCoins(config, STORAGE_KEYS, coins, source);
    let weightResult = null;
    if (typeof burnTamagotchiWeightFromActivity === 'function' && weightBurn > 0) {
        weightResult = burnTamagotchiWeightFromActivity(weightBurn, STORAGE_KEYS, { announce: false });
    } else if (typeof window.burnTamagotchiWeightFromActivity === 'function' && weightBurn > 0) {
        weightResult = window.burnTamagotchiWeightFromActivity(weightBurn, STORAGE_KEYS, { announce: false });
    }
    setMascotState(config || window.config || {}, 'happy', 3000);
    setMascotMood('proud', 8000);
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
    return { weightResult };
}

// ── Rhythm tap ────────────────────────────────────────────────────
function showMascotRhythmGame(config, STORAGE_KEYS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg') return;
    const beatMs = 650;
    let score = 0;
    let combo = 0;
    let beat = 0;
    let lastBeatAt = 0;
    let running = true;
    let timerId = null;

    const overlay = openMascotPlayOverlay({
        title: 'Rhythm Tap',
        subtitle: 'Πάτα στον ρυθμό των φτερών / παλμών',
        bodyHtml: `
            <div class="tm-rhythm-stage">
                <div class="tm-rhythm-mascot" id="tm-rhythm-pulse" aria-hidden="true">🪽</div>
                <div class="tm-rhythm-hit" id="tm-rhythm-hit">Πάτα!</div>
                <div class="tm-rhythm-stats">
                    <span>Σκορ: <strong id="tm-rhythm-score">0</strong></span>
                    <span>Combo: <strong id="tm-rhythm-combo">0</strong></span>
                    <span>Χρόνος: <strong id="tm-rhythm-time">20</strong>s</span>
                </div>
                <button type="button" class="tm-rhythm-pad" id="tm-rhythm-pad">TAP</button>
            </div>
        `,
        onReady(root) {
            const pulse = root.querySelector('#tm-rhythm-pulse');
            const hitEl = root.querySelector('#tm-rhythm-hit');
            const scoreEl = root.querySelector('#tm-rhythm-score');
            const comboEl = root.querySelector('#tm-rhythm-combo');
            const timeEl = root.querySelector('#tm-rhythm-time');
            const pad = root.querySelector('#tm-rhythm-pad');
            let timeLeft = 20;

            const pulseBeat = () => {
                if (!running) return;
                lastBeatAt = performance.now();
                beat += 1;
                pulse?.classList.remove('beat');
                void pulse?.offsetWidth;
                pulse?.classList.add('beat');
                hitEl.textContent = beat % 2 === 0 ? 'Τώρα!' : 'Πάτα!';
            };

            timerId = setInterval(() => {
                if (!running) return;
                timeLeft -= 1;
                if (timeEl) timeEl.textContent = String(timeLeft);
                if (timeLeft <= 0) {
                    running = false;
                    clearInterval(timerId);
                    clearInterval(beatTimer);
                    finish();
                }
            }, 1000);

            const beatTimer = setInterval(pulseBeat, beatMs);
            pulseBeat();

            const onTap = () => {
                if (!running) return;
                const delta = Math.abs(performance.now() - lastBeatAt);
                const windowOk = Math.min(delta, beatMs - (delta % beatMs));
                if (windowOk < 140) {
                    score += 2 + Math.min(5, combo);
                    combo += 1;
                    hitEl.textContent = 'Τέλειο!';
                    hitEl.className = 'tm-rhythm-hit good';
                    pad.classList.add('good');
                } else if (windowOk < 220) {
                    score += 1;
                    combo = Math.max(0, combo - 1);
                    hitEl.textContent = 'Οκ!';
                    hitEl.className = 'tm-rhythm-hit ok';
                } else {
                    combo = 0;
                    hitEl.textContent = 'Άστο…';
                    hitEl.className = 'tm-rhythm-hit miss';
                    pad.classList.add('miss');
                }
                if (scoreEl) scoreEl.textContent = String(score);
                if (comboEl) comboEl.textContent = String(combo);
                setTimeout(() => pad.classList.remove('good', 'miss'), 150);
            };

            pad?.addEventListener('click', onTap);
            root.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.key === ' ') {
                    e.preventDefault();
                    onTap();
                }
            });

            function finish() {
                const foot = root.querySelector('#tm-mascot-play-foot');
                const coins = Math.min(20, 3 + Math.floor(score / 4));
                const xp = Math.min(30, 8 + Math.floor(score / 3));
                const burn = Math.max(0.8, Math.min(4.5, 0.7 + score * 0.08));
                const reward = rewardMascotMiniGame(config, STORAGE_KEYS, {
                    happiness: Math.min(20, 6 + Math.floor(score / 5)),
                    xp,
                    coins,
                    source: 'mascotRhythm',
                    weightBurn: burn,
                });
                const lost = Math.abs(Math.round((reward?.weightResult?.delta || 0) * 10) / 10);
                showMascotBubble(`Rhythm: ${score} πόντοι!${lost ? ` −${lost} kg` : ''}`, 2200);
                if (foot) {
                    foot.innerHTML = `<p class="tm-mascot-play-result">Σκορ ${score} · +${coins}🪙 · +${xp} XP${lost ? ` · −${lost} kg` : ''}</p>
                        <button type="button" class="tm-mascot-play-done">Κλείσιμο</button>`;
                    foot.querySelector('.tm-mascot-play-done')?.addEventListener('click', () => closeMascotPlayOverlay());
                }
            }
        },
    });
    return overlay;
}

// ── Shadow match ──────────────────────────────────────────────────
function getMascotStageSpriteKey() {
    const map = (typeof window.TAMA_STAGE_TO_SPRITE_KEY === 'object' && window.TAMA_STAGE_TO_SPRITE_KEY)
        ? window.TAMA_STAGE_TO_SPRITE_KEY
        : {
            egg: 'base',
            evo1: 'evo1',
            evo2: 'evo2',
            evo3: 'evo3',
        };
    return map[tamagotchiStage] || 'evo3';
}

function showMascotShadowMatchGame(config, STORAGE_KEYS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg') {
        showMascotBubble('Πρώτα να εκκολαφθώ!', 1800);
        return;
    }

    const correctChar = tamagotchiCharacterType;
    const correctStage = getMascotStageSpriteKey();
    const distractors = TAMA_CHARACTER_TYPES.filter((c) => c !== correctChar)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    const options = [correctChar, ...distractors].sort(() => Math.random() - 0.5);

    const stageLabel = MASCOT_STAGE_GR[tamagotchiStage] || tamagotchiStage;

    openMascotPlayOverlay({
        title: 'Shadow Match',
        subtitle: `Ποια σκιά είναι το σημερινό ${stageLabel};`,
        bodyHtml: `
            <div class="tm-shadow-stage">
                <div class="tm-shadow-prompt">
                    <div class="tm-shadow-silhouette" data-char="${correctChar}" data-stage="${correctStage}" title="Σκιά-μυστήριο"></div>
                    <p>Διάλεξε τον σωστό χαρακτήρα</p>
                </div>
                <div class="tm-shadow-options" id="tm-shadow-options">
                    ${options.map((c) => {
                        const meta = MASCOT_CHARACTERS[c] || {};
                        return `<button type="button" class="tm-shadow-opt" data-char="${c}">
                            <span class="tm-shadow-emoji">${meta.emoji || '🐾'}</span>
                            <span>${meta.name || c}</span>
                        </button>`;
                    }).join('')}
                </div>
            </div>
        `,
        onReady(root) {
            root.querySelectorAll('.tm-shadow-opt').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const pick = btn.getAttribute('data-char');
                    const ok = pick === correctChar;
                    root.querySelectorAll('.tm-shadow-opt').forEach((b) => { b.disabled = true; });
                    btn.classList.add(ok ? 'correct' : 'wrong');
                    const foot = root.querySelector('#tm-mascot-play-foot');
                    if (ok) {
                        const reward = rewardMascotMiniGame(config, STORAGE_KEYS, {
                            happiness: 10,
                            xp: 18,
                            coins: 10,
                            source: 'mascotShadow',
                            weightBurn: 1.4,
                        });
                        const lost = Math.abs(Math.round((reward?.weightResult?.delta || 0) * 10) / 10);
                        showMascotBubble(`Σωστή σκιά!${lost ? ` −${lost} kg` : ''}`, 2000);
                        if (foot) {
                            foot.innerHTML = `<p class="tm-mascot-play-result">Μπράβο! +10🪙 · +18 XP${lost ? ` · −${lost} kg` : ''}</p>
                                <button type="button" class="tm-mascot-play-done">Κλείσιμο</button>`;
                        }
                    } else {
                        updatePetStats(config, STORAGE_KEYS, 2, 0);
                        showMascotBubble('Όχι αυτή η σκιά…', 1800);
                        setMascotMood('grumpy', 5000);
                        if (foot) {
                            foot.innerHTML = `<p class="tm-mascot-play-result">Ήταν ${MASCOT_CHARACTERS[correctChar]?.name || correctChar}</p>
                                <button type="button" class="tm-mascot-play-done">Κλείσιμο</button>`;
                        }
                    }
                    foot?.querySelector('.tm-mascot-play-done')?.addEventListener('click', () => closeMascotPlayOverlay());
                });
            });
        },
    });
}

// ── Order scramble ────────────────────────────────────────────────
function showMascotOrderScrambleGame(config, STORAGE_KEYS) {
    const statuses = [
        { id: '40', label: 'Προς έλεγχο', color: '#3b82f6' },
        { id: '65', label: 'Ανταλλακτικά', color: '#f59e0b' },
        { id: '90', label: 'Προβληματικές', color: '#ef4444' },
        { id: '30', label: 'Εισαγωγές', color: '#10b981' },
        { id: '100', label: 'Έτοιμο', color: '#8b5cf6' },
    ];
    const tickets = [];
    for (let i = 0; i < 3; i++) {
        const st = statuses[Math.floor(Math.random() * statuses.length)];
        const n = 1000 + Math.floor(Math.random() * 8000);
        tickets.push({
            id: `T-${n}`,
            statusId: st.id,
            statusLabel: st.label,
            color: st.color,
            sortKey: st.id + String(n),
        });
    }
    const correctOrder = [...tickets].sort((a, b) => a.statusId.localeCompare(b.statusId) || a.id.localeCompare(b.id));
    let current = [...tickets].sort(() => Math.random() - 0.5);
    // Ensure not already sorted
    if (current.every((t, i) => t.id === correctOrder[i].id)) {
        current = [current[2], current[0], current[1]].filter(Boolean);
    }

    openMascotPlayOverlay({
        title: 'Order Scramble',
        subtitle: 'Ταξινόμησε τα 3 tickets κατά status (αύξουσα), μετά αριθμό',
        bodyHtml: `
            <div class="tm-scramble-stage">
                <ul class="tm-scramble-list" id="tm-scramble-list">
                    ${current.map((t, idx) => `
                        <li class="tm-scramble-ticket" data-id="${t.id}" draggable="true">
                            <span class="tm-scramble-handle">⠿</span>
                            <span class="tm-scramble-id">${t.id}</span>
                            <span class="tm-scramble-status" style="background:${t.color}">${t.statusId} · ${t.statusLabel}</span>
                            <span class="tm-scramble-moves">
                                <button type="button" data-move="up" data-idx="${idx}" aria-label="Πάνω">↑</button>
                                <button type="button" data-move="down" data-idx="${idx}" aria-label="Κάτω">↓</button>
                            </span>
                        </li>
                    `).join('')}
                </ul>
                <button type="button" class="tm-scramble-check" id="tm-scramble-check">Έλεγχος</button>
            </div>
        `,
        onReady(root) {
            const list = root.querySelector('#tm-scramble-list');

            const render = () => {
                list.innerHTML = current.map((t, idx) => `
                    <li class="tm-scramble-ticket" data-id="${t.id}">
                        <span class="tm-scramble-handle">⠿</span>
                        <span class="tm-scramble-id">${t.id}</span>
                        <span class="tm-scramble-status" style="background:${t.color}">${t.statusId} · ${t.statusLabel}</span>
                        <span class="tm-scramble-moves">
                            <button type="button" data-move="up" data-idx="${idx}" aria-label="Πάνω">↑</button>
                            <button type="button" data-move="down" data-idx="${idx}" aria-label="Κάτω">↓</button>
                        </span>
                    </li>
                `).join('');
                bindMoves();
            };

            const bindMoves = () => {
                list.querySelectorAll('[data-move]').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        const idx = Number(btn.getAttribute('data-idx'));
                        const dir = btn.getAttribute('data-move');
                        const swap = dir === 'up' ? idx - 1 : idx + 1;
                        if (swap < 0 || swap >= current.length) return;
                        const tmp = current[idx];
                        current[idx] = current[swap];
                        current[swap] = tmp;
                        render();
                    });
                });
            };
            bindMoves();

            root.querySelector('#tm-scramble-check')?.addEventListener('click', () => {
                const ok = current.every((t, i) => t.id === correctOrder[i].id);
                const foot = root.querySelector('#tm-mascot-play-foot');
                root.querySelector('#tm-scramble-check').disabled = true;
                if (ok) {
                    const reward = rewardMascotMiniGame(config, STORAGE_KEYS, {
                        happiness: 12,
                        xp: 20,
                        coins: 15,
                        source: 'mascotScramble',
                        weightBurn: 1.5,
                    });
                    const lost = Math.abs(Math.round((reward?.weightResult?.delta || 0) * 10) / 10);
                    showMascotBubble(`Tickets εντάξει!${lost ? ` −${lost} kg` : ''}`, 2000);
                    if (foot) {
                        foot.innerHTML = `<p class="tm-mascot-play-result">Σωστή σειρά! +15🪙 · +20 XP${lost ? ` · −${lost} kg` : ''}</p>
                            <button type="button" class="tm-mascot-play-done">Κλείσιμο</button>`;
                    }
                } else {
                    updatePetStats(config, STORAGE_KEYS, 3, 0);
                    showMascotBubble('Ξανακοίτα τα status…', 1800);
                    if (foot) {
                        foot.innerHTML = `<p class="tm-mascot-play-result">Όχι ακόμα — σωστό: ${correctOrder.map((t) => t.id).join(' → ')}</p>
                            <button type="button" class="tm-mascot-play-done">Κλείσιμο</button>`;
                    }
                }
                foot?.querySelector('.tm-mascot-play-done')?.addEventListener('click', () => closeMascotPlayOverlay());
            });
        },
    });
}

// ── Gym workout (burn kg) ─────────────────────────────────────────
function showMascotGymGame(config, STORAGE_KEYS) {
    if (tamagotchiIsDead || tamagotchiStage === 'egg') return;
    let taps = 0;
    let running = true;
    let timerId = null;
    const startWeight = typeof formatTamagotchiWeightKg === 'function'
        ? formatTamagotchiWeightKg()
        : `${Math.round(tamagotchiWeight)} kg`;

    const overlay = openMascotPlayOverlay({
        title: 'Gym',
        subtitle: 'Πάτα γρήγορα για να κάψει κιλά!',
        bodyHtml: `
            <div class="tm-gym-stage">
                <div class="tm-gym-mascot" id="tm-gym-pulse" aria-hidden="true">🏋️</div>
                <div class="tm-gym-hit" id="tm-gym-hit">Πάτα!</div>
                <div class="tm-gym-stats">
                    <span>Reps: <strong id="tm-gym-reps">0</strong></span>
                    <span>Χρόνος: <strong id="tm-gym-time">15</strong>s</span>
                    <span>Τώρα: <strong id="tm-gym-weight">${startWeight}</strong></span>
                </div>
                <div class="tm-gym-bar"><div class="tm-gym-bar-fill" id="tm-gym-bar-fill" style="width:0%"></div></div>
                <button type="button" class="tm-rhythm-pad tm-gym-pad" id="tm-gym-pad">REP!</button>
            </div>
        `,
        onReady(root) {
            const pulse = root.querySelector('#tm-gym-pulse');
            const hitEl = root.querySelector('#tm-gym-hit');
            const repsEl = root.querySelector('#tm-gym-reps');
            const timeEl = root.querySelector('#tm-gym-time');
            const barFill = root.querySelector('#tm-gym-bar-fill');
            const pad = root.querySelector('#tm-gym-pad');
            let timeLeft = 15;

            timerId = setInterval(() => {
                if (!running) return;
                timeLeft -= 1;
                if (timeEl) timeEl.textContent = String(timeLeft);
                if (timeLeft <= 0) {
                    running = false;
                    clearInterval(timerId);
                    finish();
                }
            }, 1000);

            const onTap = () => {
                if (!running) return;
                taps += 1;
                if (repsEl) repsEl.textContent = String(taps);
                if (barFill) barFill.style.width = `${Math.min(100, taps * 2.2)}%`;
                pulse?.classList.remove('pump');
                void pulse?.offsetWidth;
                pulse?.classList.add('pump');
                hitEl.textContent = taps % 5 === 0 ? 'Δυνατά!' : 'Άλλο ένα!';
                hitEl.className = 'tm-gym-hit good';
                pad.classList.add('good');
                setTimeout(() => pad.classList.remove('good'), 90);
            };

            pad?.addEventListener('click', onTap);
            root.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.key === ' ') {
                    e.preventDefault();
                    onTap();
                }
            });

            function finish() {
                const foot = root.querySelector('#tm-mascot-play-foot');
                const burn = Math.max(1.5, Math.min(8, 1.2 + taps * 0.12));
                const coins = Math.min(18, 2 + Math.floor(taps / 6));
                const xp = Math.min(28, 6 + Math.floor(taps / 4));
                const reward = rewardMascotMiniGame(config, STORAGE_KEYS, {
                    happiness: Math.min(22, 8 + Math.floor(taps / 5)),
                    xp,
                    coins,
                    source: 'mascotGym',
                    weightBurn: burn,
                });
                // Light hunger from workout
                updatePetStats(config, STORAGE_KEYS, 0, -Math.min(12, 3 + Math.floor(taps / 8)));
                const lost = Math.abs(Math.round((reward?.weightResult?.delta || 0) * 10) / 10);
                const weightNow = typeof formatTamagotchiWeightKg === 'function'
                    ? formatTamagotchiWeightKg()
                    : `${Math.round(tamagotchiWeight)} kg`;
                showMascotBubble(`Gym: ${taps} reps · −${lost} kg!`, 2400);
                setMascotState(config, 'happy', 3500);
                if (foot) {
                    foot.innerHTML = `<p class="tm-mascot-play-result">${taps} reps · −${lost} kg · τώρα ${weightNow} · +${coins}🪙 · +${xp} XP</p>
                        <button type="button" class="tm-mascot-play-done">Κλείσιμο</button>`;
                    foot.querySelector('.tm-mascot-play-done')?.addEventListener('click', () => closeMascotPlayOverlay());
                }
            }
        },
    });
    return overlay;
}

// ── Care modal helpers ────────────────────────────────────────────
function getMascotPlayCareSectionHTML(STORAGE_KEYS) {
    const nick = normalizeMascotNickname(tamagotchiNickname) || '';
    const tricks = getAvailableTeachTricks();
    const taught = getTaughtTricksState();
    const trickChips = tricks.map((t) => {
        const unlocked = taught.unlocked.includes(t.id);
        const prac = Number(taught.practice[t.id]) || 0;
        const label = unlocked ? `✓ ${t.name}` : `${t.name} ${prac}/${t.practiceNeeded}`;
        return `<button type="button" class="tm-action-btn tm-teach-trick-btn ${unlocked ? 'tm-trick-unlocked' : ''}" data-trick="${t.id}" title="${t.nameEn}${t.desc ? ` — ${t.desc}` : ''}">
            <span class="tm-action-icon">${t.id === 'tempest' ? '⛈️' : t.id === 'firebolt' ? '☄️' : t.id === 'fire_breath' ? '🔥' : t.id === 'bow' ? '🙇' : '🌀'}</span>
            <span class="tm-action-label">${t.name}</span>
            <span class="tm-action-hint">${label}</span>
        </button>`;
    }).join('');

    return `
        <div class="tm-mascot-play-extra-inner">
            <div class="tm-mascot-nickname-row">
                <label for="tm-mascot-nickname-input">Παρατσούκλι</label>
                <input type="text" id="tm-mascot-nickname-input" class="tm-mascot-nickname-input" maxlength="16" placeholder="π.χ. Φλόγα" value="${nick.replace(/"/g, '&quot;')}">
                <button type="button" class="tm-settings-ghost-btn" id="tm-mascot-nickname-save">Αποθήκευση</button>
            </div>
            <div class="tm-mascot-actions tm-actions-secondary">
                <button type="button" class="tm-action-btn" id="tm-action-hide-seek" title="Κρυφτό">
                    <span class="tm-action-icon">🙈</span>
                    <span class="tm-action-label">Κρυφτό</span>
                </button>
                <button type="button" class="tm-action-btn ${mascotChaseEnabled ? 'tm-action-urgent' : ''}" id="tm-action-chase" title="Κυνήγι κέρσορα">
                    <span class="tm-action-icon">🏃</span>
                    <span class="tm-action-label">${mascotChaseEnabled ? 'Στοπ κυνήγι' : 'Κυνήγι'}</span>
                </button>
                <button type="button" class="tm-action-btn" id="tm-action-rhythm" title="Rhythm tap">
                    <span class="tm-action-icon">🥁</span>
                    <span class="tm-action-label">Rhythm</span>
                </button>
                <button type="button" class="tm-action-btn" id="tm-action-gym-extra" title="Gym — κάψε κιλά">
                    <span class="tm-action-icon">🏋️</span>
                    <span class="tm-action-label">Gym</span>
                    <span class="tm-action-hint">−kg</span>
                </button>
                <button type="button" class="tm-action-btn" id="tm-action-shadow" title="Shadow match">
                    <span class="tm-action-icon">🌑</span>
                    <span class="tm-action-label">Σκιά</span>
                </button>
                <button type="button" class="tm-action-btn" id="tm-action-scramble" title="Order scramble">
                    <span class="tm-action-icon">🎫</span>
                    <span class="tm-action-label">Tickets</span>
                </button>
            </div>
            <h4 class="tm-actions-subtitle">Δίδαξε κόλπα</h4>
            <div class="tm-mascot-actions tm-actions-secondary tm-teach-tricks-grid">
                ${trickChips || '<p class="tm-setting-description">Κανένα κόλπο για αυτόν τον χαρακτήρα.</p>'}
            </div>
        </div>
    `;
}

function wireMascotPlayCareHandlers(modal, config, STORAGE_KEYS, { closeModal }) {
    modal.querySelector('#tm-mascot-nickname-save')?.addEventListener('click', () => {
        const input = modal.querySelector('#tm-mascot-nickname-input');
        const next = setMascotNickname(input?.value || '', STORAGE_KEYS);
        const title = modal.querySelector('#tm-mascot-care-title');
        if (title) title.textContent = getMascotDisplayName();
        showMascotBubble(next ? `Με λένε ${next}!` : 'Χωρίς παρατσούκλι…', 1800);
        if (input) input.value = next;
    });

    modal.querySelector('#tm-action-hide-seek')?.addEventListener('click', () => {
        closeModal?.();
        startMascotHideAndSeek(config, STORAGE_KEYS);
    });

    modal.querySelector('#tm-action-chase')?.addEventListener('click', () => {
        toggleMascotChase(config, STORAGE_KEYS);
        closeModal?.();
    });

    modal.querySelector('#tm-action-rhythm')?.addEventListener('click', () => {
        closeModal?.();
        showMascotRhythmGame(config, STORAGE_KEYS);
    });

    modal.querySelector('#tm-action-gym-extra')?.addEventListener('click', () => {
        closeModal?.();
        showMascotGymGame(config, STORAGE_KEYS);
    });

    modal.querySelector('#tm-action-shadow')?.addEventListener('click', () => {
        closeModal?.();
        showMascotShadowMatchGame(config, STORAGE_KEYS);
    });

    modal.querySelector('#tm-action-scramble')?.addEventListener('click', () => {
        closeModal?.();
        showMascotOrderScrambleGame(config, STORAGE_KEYS);
    });

    modal.querySelectorAll('.tm-teach-trick-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-trick');
            const result = practiceMascotTrick(id, config, STORAGE_KEYS);
            if (!result.ok && result.reason === 'char') {
                showMascotBubble('Αυτό το κόλπο δεν είναι για μένα.', 1800);
                return;
            }
            // Refresh hints
            const meta = MASCOT_TEACHABLE_TRICKS[id];
            const taught = getTaughtTricksState();
            const hint = btn.querySelector('.tm-action-hint');
            if (hint && meta) {
                const unlocked = taught.unlocked.includes(id);
                const prac = Number(taught.practice[id]) || 0;
                hint.textContent = unlocked ? `✓ ${meta.name}` : `${meta.name} ${prac}/${meta.practiceNeeded}`;
                btn.classList.toggle('tm-trick-unlocked', unlocked);
            }
        });
    });
}

/** Intercept care-open click: fly-by catch / hide-seek reveal / accessory toys. Returns true if consumed. */
function handleMascotPlayPrimaryClick(config, STORAGE_KEYS, event) {
    if (phoenixFlybyState) {
        finishPhoenixFlyby(true);
        mascotSuppressClickUntil = Date.now() + 500;
        return true;
    }
    if (mascotHideSeekActive) {
        tryRevealMascotHideAndSeek(config, STORAGE_KEYS);
        return true;
    }
    if (tryMascotAccessoryToyClick(config, STORAGE_KEYS, event)) {
        return true;
    }
    return false;
}

function initMascotPlaySystems(config, STORAGE_KEYS) {
    // Restore chase flag (don't auto-start chase on load — too surprising)
    if (mascotChaseEnabled) {
        mascotChaseEnabled = false;
    }
    const container = document.getElementById('tm-mascot-container');
    syncMascotInteractionClasses(container);
    startPhoenixRandomEvents(config, STORAGE_KEYS);
}

// ══════════════════════════════════════════════════════════════════
// Phoenix random events: ember drop, molted feather, rebirth, fly-by
// ══════════════════════════════════════════════════════════════════
const PHOENIX_FEATHER_COLORS = [
    { id: 'red', name: 'Κόκκινο', color: '#ef4444' },
    { id: 'orange', name: 'Πορτοκαλί', color: '#f97316' },
    { id: 'gold', name: 'Χρυσό', color: '#facc15' },
    { id: 'azure', name: 'Γαλάζιο', color: '#38bdf8' },
    { id: 'white', name: 'Λευκό', color: '#f8fafc' },
];
const PHOENIX_FEATHER_SET_REWARD = 150;
/** Per-event cooldowns; the scheduler also enforces a global 3-min gap. */
const PHOENIX_EVENT_COOLDOWN_MS = {
    ember: 7 * 60000,
    feather: 16 * 60000,
    flyby: 12 * 60000,
    rebirth: 6 * 3600000,
};
/** Chance per 45s scheduler tick (after cooldown gates pass). */
const PHOENIX_EVENT_CHANCE = { ember: .08, feather: .05, flyby: .04, rebirth: .02 };

let phoenixEventTimer = null;
let phoenixEventActive = null;
let phoenixEventLastAt = { ember: 0, feather: 0, flyby: 0 };
let phoenixLastAnyEventAt = 0;
let phoenixFlybyState = null;

function getPhoenixStorageKeys(STORAGE_KEYS) {
    return STORAGE_KEYS || window.STORAGE_KEYS || {};
}

function getPhoenixFeatherCounts(STORAGE_KEYS) {
    const key = getPhoenixStorageKeys(STORAGE_KEYS).MASCOT_FEATHERS || 'tm_mascot_feather_set';
    let raw = {};
    try { raw = JSON.parse(GM_getValue(key, '{}') || '{}'); } catch (_) { raw = {}; }
    const counts = {};
    PHOENIX_FEATHER_COLORS.forEach(({ id }) => { counts[id] = Math.max(0, Number(raw[id]) || 0); });
    return counts;
}

function savePhoenixFeatherCounts(STORAGE_KEYS, counts) {
    const key = getPhoenixStorageKeys(STORAGE_KEYS).MASCOT_FEATHERS || 'tm_mascot_feather_set';
    GM_setValue(key, JSON.stringify(counts));
}

function getPhoenixFeatherUniqueCount(STORAGE_KEYS) {
    const counts = getPhoenixFeatherCounts(STORAGE_KEYS);
    return PHOENIX_FEATHER_COLORS.filter(({ id }) => counts[id] > 0).length;
}

function canTriggerPhoenixEvent(config) {
    if (typeof tamagotchiCharacterType === 'undefined' || tamagotchiCharacterType !== 'phoenix') return false;
    if (tamagotchiIsDead || tamagotchiStage === 'egg') return false;
    if (!tamagotchiLightsOn || tamagotchiIsSleeping) return false;
    if (typeof tamaCinematicLock !== 'undefined' && tamaCinematicLock) return false;
    if (document.hidden) return false;
    if (isMascotFocusQuiet()) return false;
    if (mascotHideSeekActive || mascotIsDragging || mascotChaseEnabled) return false;
    if (phoenixEventActive || phoenixFlybyState) return false;
    if (!document.getElementById('tm-mascot-container')) return false;
    const cfg = config || window.config || {};
    if (typeof isMascotInteractiveEnabled === 'function' && !isMascotInteractiveEnabled(cfg)) return false;
    return true;
}

function tickPhoenixRandomEvents(config, STORAGE_KEYS) {
    if (!canTriggerPhoenixEvent(config)) return;
    const now = Date.now();
    if (now - phoenixLastAnyEventAt < 3 * 60000) return;
    const rebirthKey = getPhoenixStorageKeys(STORAGE_KEYS).PHOENIX_LAST_REBIRTH || 'tm_phoenix_last_rebirth';
    // Rarest first so common events don't starve them.
    for (const type of ['rebirth', 'flyby', 'feather', 'ember']) {
        const last = type === 'rebirth'
            ? Number(GM_getValue(rebirthKey, 0) || 0)
            : phoenixEventLastAt[type];
        if (now - last < PHOENIX_EVENT_COOLDOWN_MS[type]) continue;
        if (Math.random() >= PHOENIX_EVENT_CHANCE[type]) continue;
        if (type !== 'rebirth') phoenixEventLastAt[type] = now;
        phoenixLastAnyEventAt = now;
        triggerPhoenixRandomEvent(type, config, STORAGE_KEYS);
        return;
    }
}

function triggerPhoenixRandomEvent(type, config, STORAGE_KEYS) {
    const cfg = config || window.config || {};
    const keys = STORAGE_KEYS || window.STORAGE_KEYS;
    switch (type) {
        case 'ember': return spawnPhoenixEmberDrop(cfg, keys);
        case 'feather': return dropPhoenixFeather(cfg, keys);
        case 'flyby': return startPhoenixFlyby(cfg, keys);
        case 'rebirth': return startPhoenixRebirth(cfg, keys);
        default: return false;
    }
}

function startPhoenixRandomEvents(config, STORAGE_KEYS) {
    if (phoenixEventTimer) clearInterval(phoenixEventTimer);
    phoenixEventTimer = setInterval(() => tickPhoenixRandomEvents(config, STORAGE_KEYS), 45000);
}

function spawnPhoenixFloatLabel(x, y, text, golden = false) {
    const label = document.createElement('div');
    label.className = `tm-phoenix-float-label${golden ? ' golden' : ''}`;
    label.textContent = text;
    label.style.left = `${Math.round(x)}px`;
    label.style.top = `${Math.round(y)}px`;
    document.body.appendChild(label);
    setTimeout(() => label.remove(), 1500);
}

// ── Ember drop ────────────────────────────────────────────────────
function spawnPhoenixEmberDrop(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    if (!container) return false;
    phoenixEventActive = 'ember';
    const golden = Math.random() < 0.1;
    container.classList.add('mascot-ember-shake');
    setTimeout(() => container.classList.remove('mascot-ember-shake'), 1100);
    showMascotBubble(golden ? 'Ωχ! Χρυσή κάφτρα!!' : 'Ωπ… μου έπεσε μια κάφτρα!', 1800);

    setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const x = Math.max(10, Math.min(window.innerWidth - 34, rect.left + rect.width / 2 + (Math.random() * 44 - 22)));
        const y = Math.max(10, Math.min(window.innerHeight - 34, rect.top + rect.height - 4));
        const ember = document.createElement('button');
        ember.type = 'button';
        ember.className = `tm-phoenix-ember${golden ? ' tm-phoenix-ember-golden' : ''}`;
        ember.title = golden ? 'Χρυσή κάφτρα!' : 'Κάφτρα — μάζεψέ τη!';
        ember.style.left = `${Math.round(x)}px`;
        ember.style.top = `${Math.round(y)}px`;
        document.body.appendChild(ember);

        let resolved = false;
        const expire = setTimeout(() => {
            if (resolved) return;
            resolved = true;
            ember.classList.add('fizzled');
            setTimeout(() => ember.remove(), 700);
            phoenixEventActive = null;
        }, 8000);

        ember.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (resolved) return;
            resolved = true;
            clearTimeout(expire);
            const base = 5 + Math.floor(Math.random() * 11); // 5–15
            const amount = golden ? base * 10 : base;
            let granted = amount;
            if (typeof window.grantCoins === 'function') {
                granted = window.grantCoins(config, STORAGE_KEYS, amount, golden ? 'phoenixGoldenEmber' : 'phoenixEmber') || amount;
            }
            spawnPhoenixFloatLabel(x, y - 8, `+${granted} 🪙`, golden);
            ember.classList.add('collected');
            setTimeout(() => ember.remove(), 500);
            updatePetStats(config, STORAGE_KEYS, 2, 0);
            if (golden) setMascotMood('proud', 6000);
            phoenixEventActive = null;
        });
    }, 700);
    return true;
}

// ── Molted feather ────────────────────────────────────────────────
function phoenixFeatherSvg(color) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3 C12 3.5 6 10 5 17.5 L4 21 L7.4 19.8 C15 18.5 20.2 11.5 20 3 Z" fill="${color}" stroke="rgba(60,20,0,.35)" stroke-width=".8"/><path d="M6.2 18.6 L18 5.5" stroke="rgba(60,20,0,.3)" stroke-width=".9" fill="none"/></svg>`;
}

function dropPhoenixFeather(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    if (!container) return false;
    phoenixEventActive = 'feather';
    setMascotState(config, 'happy', 1800);
    showMascotBubble('Φτου… ώρα για καθάρισμα φτερών.', 1800);

    setTimeout(() => {
        const counts = getPhoenixFeatherCounts(STORAGE_KEYS);
        const missing = PHOENIX_FEATHER_COLORS.filter(({ id }) => counts[id] <= 0);
        // Bias toward colors the player still needs.
        const pool = (missing.length && Math.random() < 0.7) ? missing : PHOENIX_FEATHER_COLORS;
        const pick = pool[Math.floor(Math.random() * pool.length)];

        const rect = container.getBoundingClientRect();
        const feather = document.createElement('div');
        feather.className = 'tm-phoenix-feather';
        feather.innerHTML = phoenixFeatherSvg(pick.color);
        feather.style.left = `${Math.round(rect.left + rect.width / 2)}px`;
        feather.style.top = `${Math.round(rect.top + rect.height * 0.4)}px`;
        document.body.appendChild(feather);

        setTimeout(() => {
            feather.remove();
            counts[pick.id] += 1;
            const complete = PHOENIX_FEATHER_COLORS.every(({ id }) => counts[id] > 0);
            if (complete) {
                PHOENIX_FEATHER_COLORS.forEach(({ id }) => { counts[id] -= 1; });
                savePhoenixFeatherCounts(STORAGE_KEYS, counts);
                let granted = PHOENIX_FEATHER_SET_REWARD;
                if (typeof window.grantCoins === 'function') {
                    granted = window.grantCoins(config, STORAGE_KEYS, PHOENIX_FEATHER_SET_REWARD, 'phoenixFeatherSet') || PHOENIX_FEATHER_SET_REWARD;
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 25, 'phoenixFeatherSet');
                }
                setMascotMood('proud', 10000);
                showMascotBubble(`Πλήρες σετ φτερών! +${granted} 🪙`, 3200);
            } else {
                savePhoenixFeatherCounts(STORAGE_KEYS, counts);
                const unique = PHOENIX_FEATHER_COLORS.filter(({ id }) => counts[id] > 0).length;
                showMascotBubble(`Φτερό ${pick.name.toLowerCase()}! 🪶 (${unique}/5)`, 2400);
            }
            phoenixEventActive = null;
        }, 2100);
    }, 900);
    return true;
}

// ── Fire fly-by ───────────────────────────────────────────────────
function startPhoenixFlyby(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    if (!container) return false;
    phoenixEventActive = 'flyby';
    stopRoaming(config);
    mascotPositionLocked = true;
    syncMascotInteractionClasses(container);

    const metrics = (typeof getMascotRoamingMetrics === 'function')
        ? getMascotRoamingMetrics(container)
        : { minX: 8, maxX: Math.max(60, window.innerWidth - 130), minY: 60, maxY: Math.max(120, window.innerHeight - 150) };
    const leftToRight = Math.random() < 0.5;
    const y = metrics.minY + (metrics.maxY - metrics.minY) * (0.25 + Math.random() * 0.3);
    const startX = leftToRight ? metrics.minX : metrics.maxX;
    const endX = leftToRight ? metrics.maxX : metrics.minX;

    applyMascotPosition(container, startX, y);
    container.classList.add('mascot-flyby');
    setMascotState(config, 'energized', 5200);
    showMascotBubble('Πιάσε με αν μπορείς!', 1600);

    const anim = container.animate([
        { transform: `translate(${startX}px, ${y}px)` },
        { transform: `translate(${(startX + endX) / 2}px, ${y - 48}px)`, offset: .5 },
        { transform: `translate(${endX}px, ${y}px)` },
    ], { duration: 4600, easing: 'ease-in-out' });

    const trail = setInterval(() => {
        const r = container.getBoundingClientRect();
        const dot = document.createElement('div');
        dot.className = 'tm-phoenix-trail-dot';
        dot.style.left = `${Math.round(r.left + r.width / 2 + (Math.random() * 18 - 9))}px`;
        dot.style.top = `${Math.round(r.top + r.height * 0.55 + (Math.random() * 12 - 6))}px`;
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 950);
    }, 130);

    phoenixFlybyState = { anim, trail, config, STORAGE_KEYS };
    anim.onfinish = () => finishPhoenixFlyby(false);
    return true;
}

function finishPhoenixFlyby(caught) {
    const s = phoenixFlybyState;
    if (!s) return;
    phoenixFlybyState = null;
    clearInterval(s.trail);

    const container = document.getElementById('tm-mascot-container');
    if (container) {
        // Commit the animated position before cancelling so the bird doesn't snap back.
        const pos = getMascotTranslate(container);
        try { s.anim.cancel(); } catch (_) { /* already done */ }
        applyMascotPosition(container, pos.x, pos.y);
        container.classList.remove('mascot-flyby');
    }
    mascotPositionLocked = false;
    syncMascotInteractionClasses(container);

    if (caught && container) {
        const amount = 10 + Math.floor(Math.random() * 11); // 10–20
        let granted = amount;
        if (typeof window.grantCoins === 'function') {
            granted = window.grantCoins(s.config, s.STORAGE_KEYS, amount, 'phoenixFlyby') || amount;
        }
        const r = container.getBoundingClientRect();
        spawnPhoenixFloatLabel(r.left + r.width / 2, r.top - 6, `+${granted} 🪙`);
        showMascotBubble(`Με έπιασες στον αέρα! +${granted} 🪙`, 2400);
        updatePetStats(s.config, s.STORAGE_KEYS, 6, 0);
        setMascotState(s.config, 'happy', 2500);
        setMascotMood('playful', 6000);
    }
    const cfg = s.config || window.config;
    if (shouldMascotBeRoaming(cfg)) startRoaming(cfg);
    phoenixEventActive = null;
}

// ── Rebirth ───────────────────────────────────────────────────────
function startPhoenixRebirth(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-mascot-container');
    if (!container) return false;
    phoenixEventActive = 'rebirth';
    const rebirthKey = getPhoenixStorageKeys(STORAGE_KEYS).PHOENIX_LAST_REBIRTH || 'tm_phoenix_last_rebirth';
    GM_setValue(rebirthKey, Date.now());

    stopRoaming(config);
    mascotPositionLocked = true;
    syncMascotInteractionClasses(container);
    showMascotBubble('Νιώθω… τη φωτιά να με καλεί!', 1800);
    container.classList.add('mascot-rebirth-burn');

    // Rising embers around the burning bird.
    const rect = container.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'tm-phoenix-burst-ember';
        p.style.left = `${Math.round(rect.left + rect.width * (0.2 + Math.random() * 0.6))}px`;
        p.style.top = `${Math.round(rect.top + rect.height * (0.3 + Math.random() * 0.5))}px`;
        p.style.setProperty('--tm-burst-dx', `${(Math.random() * 60 - 30).toFixed(0)}px`);
        p.style.setProperty('--tm-burst-dy', `${(-50 - Math.random() * 60).toFixed(0)}px`);
        p.style.animationDelay = `${(Math.random() * 1.1).toFixed(2)}s`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 2600);
    }

    setTimeout(() => {
        // Screen-wide golden flash centered on the bird.
        const r = container.getBoundingClientRect();
        const glow = document.createElement('div');
        glow.className = 'tm-phoenix-rebirth-glow';
        glow.style.setProperty('--tm-rebirth-x', `${Math.round(((r.left + r.width / 2) / window.innerWidth) * 100)}%`);
        glow.style.setProperty('--tm-rebirth-y', `${Math.round(((r.top + r.height / 2) / window.innerHeight) * 100)}%`);
        document.body.appendChild(glow);
        setTimeout(() => glow.remove(), 1700);

        container.classList.remove('mascot-rebirth-burn');
        container.classList.add('mascot-rebirth-rise');
        updatePetStats(config, STORAGE_KEYS, 100, 100); // full self-care refill
        if (typeof window.grantXp === 'function') {
            window.grantXp(config, STORAGE_KEYS, 20, 'phoenixRebirth');
        }
        setMascotMood('proud', 12000);
        showMascotBubble('ΑΝΑΓΕΝΝΗΣΗ! Σαν καινούργιος! 🔥', 3000);

        setTimeout(() => {
            container.classList.remove('mascot-rebirth-rise');
            mascotPositionLocked = false;
            syncMascotInteractionClasses(container);
            setMascotState(config, 'energized', 3000);
            if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
            if (shouldMascotBeRoaming(config)) startRoaming(config);
            phoenixEventActive = null;
        }, 1500);
    }, 2000);
    return true;
}

// Window exports
window.getMascotDisplayName = getMascotDisplayName;
window.setMascotNickname = setMascotNickname;
window.formatMascotBubbleText = formatMascotBubbleText;
window.practiceMascotTrick = practiceMascotTrick;
window.playMascotTrickEnhanced = playMascotTrickEnhanced;
window.toggleMascotChase = toggleMascotChase;
window.setMascotChaseEnabled = setMascotChaseEnabled;
window.startMascotHideAndSeek = startMascotHideAndSeek;
window.tryRevealMascotHideAndSeek = tryRevealMascotHideAndSeek;
window.showMascotRhythmGame = showMascotRhythmGame;
window.showMascotGymGame = showMascotGymGame;
window.showMascotShadowMatchGame = showMascotShadowMatchGame;
window.showMascotOrderScrambleGame = showMascotOrderScrambleGame;
window.getMascotPlayCareSectionHTML = getMascotPlayCareSectionHTML;
window.wireMascotPlayCareHandlers = wireMascotPlayCareHandlers;
window.handleMascotPlayPrimaryClick = handleMascotPlayPrimaryClick;
window.initMascotPlaySystems = initMascotPlaySystems;
window.MASCOT_TEACHABLE_TRICKS = MASCOT_TEACHABLE_TRICKS;
window.getPhoenixFeatherCounts = getPhoenixFeatherCounts;
window.getPhoenixFeatherUniqueCount = getPhoenixFeatherUniqueCount;
window.triggerPhoenixRandomEvent = triggerPhoenixRandomEvent;
