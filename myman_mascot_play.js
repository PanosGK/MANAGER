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
    };
    const pool = lines[trickId] || ['Τα-δα!'];
    showMascotBubble(pool[Math.floor(Math.random() * pool.length)], 2000);
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

function rewardMascotMiniGame(config, STORAGE_KEYS, { happiness = 8, xp = 12, coins = 6, source = 'mascotMiniGame' } = {}) {
    updatePetStats(config, STORAGE_KEYS, happiness, 0);
    if (typeof window.grantXp === 'function' && xp > 0) window.grantXp(config, STORAGE_KEYS, xp, source);
    if (typeof window.grantCoins === 'function' && coins > 0) window.grantCoins(config, STORAGE_KEYS, coins, source);
    setMascotState(config || window.config || {}, 'happy', 3000);
    setMascotMood('proud', 8000);
    if (STORAGE_KEYS) saveTamagotchiData(STORAGE_KEYS);
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
                rewardMascotMiniGame(config, STORAGE_KEYS, {
                    happiness: Math.min(20, 6 + Math.floor(score / 5)),
                    xp,
                    coins,
                    source: 'mascotRhythm',
                });
                showMascotBubble(`Rhythm: ${score} πόντοι!`, 2200);
                if (foot) {
                    foot.innerHTML = `<p class="tm-mascot-play-result">Σκορ ${score} · +${coins}🪙 · +${xp} XP</p>
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
    const map = {
        egg: 'base',
        baby: 'baby',
        kid: 'evo1',
        teen: 'evo2',
        adult: 'evo3',
        middleage: 'evo4',
        old: 'evo5',
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
                        rewardMascotMiniGame(config, STORAGE_KEYS, {
                            happiness: 10,
                            xp: 18,
                            coins: 10,
                            source: 'mascotShadow',
                        });
                        showMascotBubble('Σωστή σκιά!', 2000);
                        if (foot) {
                            foot.innerHTML = `<p class="tm-mascot-play-result">Μπράβο! +10🪙 · +18 XP</p>
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
                    rewardMascotMiniGame(config, STORAGE_KEYS, {
                        happiness: 12,
                        xp: 20,
                        coins: 15,
                        source: 'mascotScramble',
                    });
                    showMascotBubble('Tickets εντάξει!', 2000);
                    if (foot) {
                        foot.innerHTML = `<p class="tm-mascot-play-result">Σωστή σειρά! +15🪙 · +20 XP</p>
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

// ── Care modal helpers ────────────────────────────────────────────
function getMascotPlayCareSectionHTML(STORAGE_KEYS) {
    const nick = normalizeMascotNickname(tamagotchiNickname) || '';
    const tricks = getAvailableTeachTricks();
    const taught = getTaughtTricksState();
    const trickChips = tricks.map((t) => {
        const unlocked = taught.unlocked.includes(t.id);
        const prac = Number(taught.practice[t.id]) || 0;
        const label = unlocked ? `✓ ${t.name}` : `${t.name} ${prac}/${t.practiceNeeded}`;
        return `<button type="button" class="tm-action-btn tm-teach-trick-btn ${unlocked ? 'tm-trick-unlocked' : ''}" data-trick="${t.id}" title="${t.nameEn}">
            <span class="tm-action-icon">${t.id === 'fire_breath' ? '🔥' : t.id === 'bow' ? '🙇' : '🌀'}</span>
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

/** Intercept care-open click: hide-seek reveal / accessory toys. Returns true if consumed. */
function handleMascotPlayPrimaryClick(config, STORAGE_KEYS, event) {
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
window.showMascotShadowMatchGame = showMascotShadowMatchGame;
window.showMascotOrderScrambleGame = showMascotOrderScrambleGame;
window.getMascotPlayCareSectionHTML = getMascotPlayCareSectionHTML;
window.wireMascotPlayCareHandlers = wireMascotPlayCareHandlers;
window.handleMascotPlayPrimaryClick = handleMascotPlayPrimaryClick;
window.initMascotPlaySystems = initMascotPlaySystems;
window.MASCOT_TEACHABLE_TRICKS = MASCOT_TEACHABLE_TRICKS;
