// ==UserScript==
// @name         MyManager Settings
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Settings panel module for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    // This function will be attached to the window object to be called from the main script.
    function initSettingsPanel(parentContainer, config, STORAGE_KEYS) {

        function resetSettings() {
            if (!confirm('Είστε σίγουροι; Όλες οι ρυθμίσεις θα επανέλθουν στις αρχικές τους τιμές και η σελίδα θα ανανεωθεί.')) {
                 return;
            }

            // Reset mascot to egg state with default values
            const defaultTamagotchiData = {
                age: 0,
                stage: 'egg',
                health: 100,
                hunger: 50,
                happiness: 50,
                discipline: 0,
                weight: 0, // Eggs have no weight
                lastFed: Date.now(),
                lastPlayed: Date.now(),
                isSleeping: false,
                lightsOn: true,
                birthdate: Date.now(),
                evolutionHistory: [],
                poopCount: 0,
                lastPoopTime: Date.now(),
                characterType: null, // Will be randomly selected on first hatch
                deathCount: 0,
                careHistory: {
                    fedCount: 0,
                    playedCount: 0,
                    cleanedCount: 0,
                    disciplinedCount: 0
                }
            };
            GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(defaultTamagotchiData));
            
            // Reset mascot appearance to egg
            const mascotContainer = document.getElementById('tm-mascot-container');
            if (mascotContainer) {
                // Hide all equipped accessories
                const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                equippedItems.forEach(itemId => {
                    const accessory = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                    if (accessory) accessory.style.display = 'none';
                });
                
                // Reset mascot to egg appearance
                if (typeof window.updateMascotAppearanceByStage === 'function') {
                    window.updateMascotAppearanceByStage('egg');
                }
            }
            
            // Clear any active buff UI elements
            const buffTimersContainer = document.getElementById('tm-buff-timers-container');
            if (buffTimersContainer) {
                buffTimersContainer.innerHTML = '';
            }

            // Comprehensive list of ALL storage keys to reset
            const ALL_STORAGE_KEYS = [
                // Core gamification
                STORAGE_KEYS.USER_XP,
                STORAGE_KEYS.USER_LEVEL,
                STORAGE_KEYS.ACHIEVEMENTS,
                STORAGE_KEYS.USER_COINS,
                STORAGE_KEYS.USER_TITLE,
                STORAGE_KEYS.PURCHASED_ITEMS,
                STORAGE_KEYS.EQUIPPED_ITEMS,
                STORAGE_KEYS.EQUIPPED_THEME,
                STORAGE_KEYS.PET_STATS,
                STORAGE_KEYS.TAMAGOTCHI_DATA,
                STORAGE_KEYS.DAILY_STATS,
                STORAGE_KEYS.DAILY_QUESTS,
                STORAGE_KEYS.USER_REROLL_TOKENS,
                
                // Scratchpad
                STORAGE_KEYS.SCRATCHPAD_NOTES,
                STORAGE_KEYS.SCRATCHPAD_ACTIVE_NOTE_ID,
                STORAGE_KEYS.SCRATCHPAD_TEMPLATES,
                'tm_user_scratchpad_text', 'tm_user_scratchpad_geometry', 'tm_user_scratchpad_is_open', 
                'tm_user_scratchpad_font_size', 'tm_user_scratchpad_last_edited', 'tm_user_scratchpad_is_maximized',
                
                // Talent System
                STORAGE_KEYS.USER_TALENT_POINTS,
                STORAGE_KEYS.UNLOCKED_TALENTS,
                
                // Notifications
                STORAGE_KEYS.USER_NOTIFICATIONS,
                
                // Buffs/Consumables
                STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES,
                STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES,
                STORAGE_KEYS.ENERGIZED_BUFF_COUNT,
                STORAGE_KEYS.DOUBLE_COINS_BUFF_COUNT,
                
                // Search
                STORAGE_KEYS.SEARCH_HISTORY_KEY,
                STORAGE_KEYS.FAVORITE_SEARCHES_KEY,
                'tm_search_history', 'tm_favorite_searches',
                
                // Printing
                STORAGE_KEYS.PRINT_TEMPLATE,
                
                // Random Events
                STORAGE_KEYS.ACTIVE_EVENT,
                STORAGE_KEYS.LAST_EVENT_CHECK,
                STORAGE_KEYS.LAST_EVENT_END_TIME,
                STORAGE_KEYS.EVENT_HISTORY,
                STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED,
                
                // Smart Templates
                STORAGE_KEYS.REPAIR_TEMPLATES,
                
                // Legacy faction data (cleanup on reset)
                'tm_user_faction',
                'tm_faction_contribution',
                'tm_faction_challenges',
                'tm_faction_quests_data', // Faction quests
                'tm_faction_wars_data', // Faction wars (legacy)
                'tm_current_faction_war', // Current active faction war
                'tm_faction_war_history', // Faction war history
                'tm_last_war_end', // Last war end timestamp
                'tm_territories_data', // Territory control (legacy)
                'tm_faction_territories', // Territory control (current)
                'tm_faction_research', // Faction research
                'tm_stats_history_7days', // 7-day stats history for performance tracking
                
                // Dashboard
                STORAGE_KEYS.DASHBOARD_STATS_HISTORY,
                STORAGE_KEYS.REPAIR_TIME_HISTORY,
                
                // Boss Battles
                STORAGE_KEYS.ACTIVE_BOSS,
                STORAGE_KEYS.LAST_BOSS_END_TIME,
                STORAGE_KEYS.BOSS_HISTORY,
                STORAGE_KEYS.BOSS_DEFEATS,
                STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED,
                STORAGE_KEYS.BOSS_NOTIFICATION_DISMISSED,
                
                // Menu
                STORAGE_KEYS.HIDDEN_MENU_ITEMS,
                
                // Status Transfer Tracking (all tracked statuses)
                STORAGE_KEYS.STATUS_40_TRANSFERS,
                STORAGE_KEYS.STATUS_65_TRANSFERS,
                STORAGE_KEYS.STATUS_100_TRANSFERS,
                STORAGE_KEYS.STATUS_TRANSFER_HISTORY,
                'tm_status_30_transfers',
                'tm_status_55_transfers',
                'tm_status_70_transfers',
                'tm_status_75_transfers',
                'tm_status_90_transfers',
                'tm_status_105_transfers',
                'tm_daily_stats_history', // Historical daily stats for performance tracking
                
                // Recent Repairs
                STORAGE_KEYS.RECENT_REPAIRS,
                
                // Coin History
                STORAGE_KEYS.COIN_HISTORY,
                
                // Level Rewards
                STORAGE_KEYS.PERMANENT_XP_BOOST,
                STORAGE_KEYS.COIN_MULTIPLIER,
                STORAGE_KEYS.SHOP_DISCOUNT,
                STORAGE_KEYS.MASCOT_FOOD_ITEMS,
                STORAGE_KEYS.MASCOT_TREAT_ITEMS,
                STORAGE_KEYS.ASCENDED_STATUS,
                STORAGE_KEYS.DIGITAL_ARCHON_STATUS,
                
                // Settings (DEFAULTS keys)
                ...Object.keys(window.DEFAULTS || {}),
            ];
            
            // Clear all buff duration keys
            GM_deleteValue(`${STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES}_duration`);
            GM_deleteValue(`${STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES}_duration`);
            
            // Delete all storage keys
            ALL_STORAGE_KEYS.forEach(key => {
                try {
                    GM_deleteValue(key);
                } catch (e) {
                    console.warn(`[MMS Reset] Could not delete key: ${key}`, e);
                }
            });
            
            // Also clear any shop item tokens
            if (window.SHOP_ITEMS) {
                Object.values(window.SHOP_ITEMS).forEach(itemKey => {
                    try {
                        GM_deleteValue(itemKey);
                    } catch (e) {
                        console.warn(`[MMS Reset] Could not delete shop item: ${itemKey}`, e);
                    }
                });
            }
            
            console.log('[MMS] All data reset complete');
            alert('Όλα τα δεδομένα επαναφέρθηκαν πλήρως! Το mascot είναι τώρα αυγό και όλα τα στατιστικά έχουν μηδενιστεί. Η σελίδα θα ανανεωθεί τώρα.');
            window.location.reload();
        }

        function saveSettings() {
            const feedback = document.getElementById('tm-settings-feedback');
            feedback.textContent = ''; // Clear previous feedback

            // --- Helper to save a checkbox setting ---
            const saveCheckbox = (id, key) => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    const value = checkbox.checked;
                    GM_setValue(key, value);
                    config[key] = value;
                }
            };

            // --- Helper to save a number setting ---
            const saveNumber = (id, key) => {
                const input = document.getElementById(id);
                if (input) {
                    const value = parseInt(input.value, 10);
                    if (!isNaN(value) && value >= (input.min || 0)) {
                        GM_setValue(key, value);
                        config[key] = value;
                    }
                }
            };

            // --- Save General UI Settings ---
            // Save script enabled (master toggle)
            const scriptEnabledCheckbox = document.getElementById('tm-setting-script-enabled');
            if (scriptEnabledCheckbox) {
                GM_setValue(STORAGE_KEYS.SCRIPT_ENABLED, scriptEnabledCheckbox.checked);
                config.scriptEnabled = scriptEnabledCheckbox.checked;
            }
            
            // Debug mode is handled separately with passcode protection
            saveCheckbox('tm-setting-login-page-enabled', 'customLoginPageEnabled');
            saveCheckbox('tm-setting-dashboard-enabled', 'dashboardWidgetEnabled');
            saveCheckbox('tm-setting-scroll-top-enabled', 'scrollToTopEnabled');
            saveCheckbox('tm-setting-tech-stats-enabled', 'technicianStatsEnabled');
            saveCheckbox('tm-setting-customer-history-enabled', 'customerHistoryEnabled');
            saveCheckbox('tm-setting-automated-parts-search-enabled', 'automatedPartsSearchEnabled');
            saveCheckbox('tm-setting-recent-repairs-enabled', 'recentRepairsEnabled');
            saveNumber('tm-setting-recent-repairs-max', 'recentRepairsMaxItems');
            saveCheckbox('tm-setting-weather-widget-enabled', 'weatherWidgetEnabled');
            saveCheckbox('tm-setting-footer-quick-search-enabled', 'footerQuickSearchEnabled');
            saveCheckbox('tm-setting-phone-catalog-enabled', 'phoneCatalogEnabled');
            saveCheckbox('tm-setting-order-history-enabled', 'orderHistoryEnabled');
            saveCheckbox('tm-setting-order-link-enabled', 'orderLinkEnabled');
            saveCheckbox('tm-setting-return-to-40-enabled', 'returnTo40ButtonEnabled');
            saveCheckbox('tm-setting-auto-update-check-enabled', 'autoUpdateCheckEnabled');

            // --- Save Auto-Refresh settings ---
            saveCheckbox('tm-setting-autorefresh-enabled', 'autoRefreshEnabled');
            const startHourInput = document.getElementById('tm-setting-wh-start');
            const endHourInput = document.getElementById('tm-setting-wh-end');

            const newStartHour = parseInt(startHourInput.value, 10);
            const newEndHour = parseInt(endHourInput.value, 10);
            if (!isNaN(newStartHour) && newStartHour >= 0 && newStartHour < 24) {
                GM_setValue('workingHoursStart', newStartHour);
                config.workingHoursStart = newStartHour;
            }
            if (!isNaN(newEndHour) && newEndHour > 0 && newEndHour <= 24) {
                GM_setValue('workingHoursEnd', newEndHour);
                config.workingHoursEnd = newEndHour;
            }

            // Save Working Days
            const newWorkingDays = [];
            document.querySelectorAll('.tm-working-day-checkbox:checked').forEach(cb => {
                newWorkingDays.push(parseInt(cb.value, 10));
            });
            GM_setValue('workingDays', JSON.stringify(newWorkingDays));
            config.workingDays = newWorkingDays;

            // Save Refresh Interval
            saveNumber('tm-setting-refresh-interval', 'refreshIntervalMinutes');

            // --- Save Search Settings ---
            saveCheckbox('tm-setting-search-enabled', 'searchFeatureEnabled');
            saveNumber('tm-setting-search-history-max', 'searchMaxHistory');
            saveCheckbox('tm-setting-quick-search-enabled', 'quickSearchEnabled');

            // --- Save Scratchpad Settings ---
            saveCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');

            // --- Save Gamification/Fun Settings ---
            saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            saveCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');

            saveNumber('tm-setting-mascot-speed', 'mascotRoamingSpeed');

            // --- Save New Feature Settings ---
            saveCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
            saveCheckbox('tm-setting-smart-templates-enabled', 'smartTemplatesEnabled');
            saveCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
            saveCheckbox('tm-setting-boss-battles-enabled', 'bossBattlesEnabled');
            saveCheckbox('tm-setting-eod-checklist-enabled', 'eodChecklistEnabled');

            // Apply EOD checklist visibility immediately (no reload needed)
            const eodBtn = document.getElementById('tm-eod-btn');
            if (config.eodChecklistEnabled === false) {
                eodBtn?.remove();
            } else if (!eodBtn && typeof window.initEODChecklist === 'function') {
                window.initEODChecklist(config, STORAGE_KEYS);
            }

            // Weather location is now hardcoded to Athens (removed from settings)

            // --- Save Quick Search Buttons ---
            const newButtons = [];
            document.querySelectorAll('#tm-quick-search-editor .tm-quick-search-row').forEach(row => {
                const labelInput = row.querySelector('input[data-type="label"]');
                const termInput = row.querySelector('input[data-type="term"]');
                if (labelInput.value.trim() && termInput.value.trim()) {
                    newButtons.push({
                        label: labelInput.value.trim(),
                        term: termInput.value.trim()
                    });
                }
            });
            GM_setValue('quickSearchButtons', JSON.stringify(newButtons));
            config.quickSearchButtons = newButtons;

            // --- Save Price Options ---
            const newPriceOptions = [];
            document.querySelectorAll('#tm-price-options-editor .tm-price-option-row').forEach(row => {
                const labelInput = row.querySelector('input[data-type="label"]');
                const valueInput = row.querySelector('input[data-type="value"]');
                const actionSelect = row.querySelector('select[data-type="action"]');
                const conditionSelect = row.querySelector('select[data-type="condition"]');
                if (labelInput.value.trim() && valueInput.value.trim()) {
                    newPriceOptions.push({
                        label: labelInput.value.trim(),
                        value: parseFloat(valueInput.value),
                        action: actionSelect.value,
                        condition: conditionSelect.value
                    });
                }
            });
            GM_setValue('priceOptions', JSON.stringify(newPriceOptions));
            config.priceOptions = newPriceOptions;

            // --- Save Scratchpad Templates ---
            const newTemplates = [];
            document.querySelectorAll('#tm-scratchpad-templates-editor .tm-template-row').forEach(row => {
                const titleInput = row.querySelector('input[data-type="title"]');
                const contentInput = row.querySelector('textarea[data-type="content"]');
                if (titleInput.value.trim() && contentInput.value.trim()) {
                    newTemplates.push({
                        id: row.dataset.id || `template_${Date.now()}`,
                        title: titleInput.value.trim(),
                        content: contentInput.value.trim()
                    });
                }
            });
            GM_setValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, JSON.stringify(newTemplates));

            // --- Save Scratchpad Settings ---
            saveCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');

            // --- Save Gamification/Fun Settings ---
            saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            saveCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');

            // --- Save Status 40 admin account (global) ---
            const status40UserEl = document.getElementById('tm-setting-status40-admin-username');
            const status40PassEl = document.getElementById('tm-setting-status40-admin-password');
            if (status40UserEl) {
                GM_setValue(STORAGE_KEYS.STATUS40_ADMIN_USERNAME, status40UserEl.value.trim());
            }
            if (status40PassEl) {
                GM_setValue(STORAGE_KEYS.STATUS40_ADMIN_PASSWORD, status40PassEl.value);
            }

            console.log('[MMS] Settings saved:', config);
            // Reload the page so settings apply immediately
            showPositiveMessage('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!');
            if (typeof window.initScriptUpdateChecker === 'function') {
                window.initScriptUpdateChecker();
            }
            try { window.location.reload(); } catch (_) {}
        }

        // --- Settings Modal HTML Generators (for better readability) ---
        function getGeneralUISettingsHTML() {
            // Merged General and Login settings
            return `
                <div class="tm-settings-section">
                    <h3>⚙️ Γενικές Ρυθμίσεις</h3>
                    <div class="tm-setting-row" style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%); padding: 12px; border: 2px solid #ff4757; border-radius: 8px; margin-bottom: 15px;">
                        <div class="tm-setting-label">
                            <label for="tm-setting-script-enabled" style="color: white; font-weight: 700; font-size: 14px;">⚡ Ενεργοποίηση Script (Κύριος Διακόπτης)</label>
                            <p class="tm-setting-description" style="color: white; opacity: 0.95; font-weight: 500;">Απενεργοποιεί όλες τις λειτουργίες του script. Αποεπιλέξτε για να κλείσει τα πάντα. Χρησιμοποιήστε Ctrl+Shift+E για γρήγορη εναλλαγή.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-script-enabled" style="transform: scale(1.3);">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-login-page-enabled">🎨 Προσαρμοσμένη Σελίδα Σύνδεσης</label>
                            <p class="tm-setting-description">Αντικαθιστά την προεπιλεγμένη σελίδα σύνδεσης με μια μινιμαλιστική, σύγχρονη έκδοση.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-login-page-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-dashboard-enabled">📊 Εμφάνιση Widget "Σήμερα"</label>
                            <p class="tm-setting-description">Εμφανίζει ένα widget με στατιστικά και πληροφορίες για την τρέχουσα ημέρα.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-dashboard-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-scroll-top-enabled">⬆️ Κουμπί Επιστροφής στην Κορυφή</label>
                            <p class="tm-setting-description">Προσθέτει ένα κουμπί για γρήγορη επιστροφή στην κορυφή της σελίδας.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-scroll-top-enabled"></div>
                    </div>
                    <div class="tm-setting-row" style="background: #fffbe6; padding-top: 10px; padding-bottom: 10px; border: 1px solid #ffe58f; border-radius: 5px;">
                        <div class="tm-setting-label">
                            <label for="tm-setting-debug-enabled">🔐 Λειτουργία Ανάπτυξης (Προστατευμένη)</label>
                            <p class="tm-setting-description">Ενεργοποιεί επιλογές για δοκιμές και δωρεάν αντικείμενα στο κατάστημα. <strong>Απαιτείται κωδικός πρόσβασης.</strong></p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-debug-enabled"></div>
                    </div>
                </div>
            `;
        }

        function getDebugSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>🔧 Εργαλεία Debug</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-level-input">Ορισμός Level</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-level-input" min="1" value="${GM_getValue(STORAGE_KEYS.USER_LEVEL, 1)}"><button id="tm-debug-set-level-btn">Set</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-xp-input">Προσθήκη XP</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-xp-input" value="100"><button id="tm-debug-add-xp-btn">Add</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-debug-coins-input">Προσθήκη Coins</label></div>
                        <div class="tm-setting-control"><input type="number" id="tm-debug-coins-input" value="1000"><button id="tm-debug-add-coins-btn">Add</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Trigger Random Event</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-trigger-event-btn" style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🎲 Trigger Event</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Stop Random Event</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-stop-event-btn" style="background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🛑 Stop Event</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Spawn Boss Battle</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-spawn-boss-btn" style="background: linear-gradient(135deg, #ff5252 0%, #b71c1c 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">⚔️ Spawn Boss</button></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Stop Boss Battle</label></div>
                        <div class="tm-setting-control"><button id="tm-debug-stop-boss-btn" style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🛑 Stop Boss</button></div>
                    </div>
                    <div class="tm-setting-row" style="border-top: 2px solid #26c6da; margin-top: 20px; padding-top: 20px;">
                        <div class="tm-setting-label">
                            <label>Mascot Evolution Control</label>
                            <p class="tm-setting-description">Force hatch the egg or reset back to egg state. Current character will be random on next hatch.</p>
                        </div>
                        <div class="tm-setting-control" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button id="tm-debug-hatch-egg-btn" style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🐣 Force Hatch</button>
                            <button id="tm-debug-reset-egg-btn" style="background: linear-gradient(135deg, #ff9800 0%, #e65100 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🥚 Reset to Egg</button>
                            <button id="tm-debug-age-up-btn" style="background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">⏭️ Age +10 Years</button>
                        </div>
                    </div>
                </div>
                
                <div class="tm-settings-section" style="margin-top: 20px; border-top: 2px solid #4facfe; padding-top: 20px;">
                    <h3>🤖 Mascot Appearance Tester</h3>
                    <p class="tm-setting-description" style="margin-bottom: 15px;">Preview all mascot states and stages. The mascot will return to normal after 5 seconds.</p>
                    
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label>Mascot States</label></div>
                        <div class="tm-setting-control" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;">
                            <button class="tm-mascot-state-btn" data-state="idle">🧍 Idle</button>
                            <button class="tm-mascot-state-btn" data-state="happy">😊 Happy</button>
                            <button class="tm-mascot-state-btn" data-state="sad">😢 Sad</button>
                            <button class="tm-mascot-state-btn" data-state="eating">🍔 Eating</button>
                            <button class="tm-mascot-state-btn" data-state="thinking">🤔 Thinking</button>
                            <button class="tm-mascot-state-btn" data-state="dodging">💨 Dodging</button>
                            <button class="tm-mascot-state-btn" data-state="searching">🔍 Searching</button>
                            <button class="tm-mascot-state-btn" data-state="reading">📖 Reading</button>
                            <button class="tm-mascot-state-btn" data-state="biking">🚴 Biking</button>
                            <button class="tm-mascot-state-btn" data-state="juggling">🤹 Juggling</button>
                            <button class="tm-mascot-state-btn" data-state="energized">⚡ Energized</button>
                            <button class="tm-mascot-state-btn" data-state="glitching">⚠️ Glitching</button>
                            <button class="tm-mascot-state-btn" data-state="eureka">💡 Eureka</button>
                            <button class="tm-mascot-state-btn" data-state="sunny">☀️ Sunny</button>
                            <button class="tm-mascot-state-btn" data-state="rainy">🌧️ Rainy</button>
                            <button class="tm-mascot-state-btn" data-state="powersave">😴 Sleep</button>
                        </div>
                    </div>
                    
                    <div class="tm-setting-row" style="margin-top: 15px;">
                        <div class="tm-setting-label"><label>Mascot Stages (Evolution)</label></div>
                        <div class="tm-setting-control" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;">
                            <button class="tm-mascot-stage-btn" data-stage="egg">🥚 Egg</button>
                            <button class="tm-mascot-stage-btn" data-stage="baby">👶 Baby</button>
                            <button class="tm-mascot-stage-btn" data-stage="kid">🧒 Kid</button>
                            <button class="tm-mascot-stage-btn" data-stage="teen">🧑 Teen</button>
                            <button class="tm-mascot-stage-btn" data-stage="adult">👨 Adult</button>
                            <button class="tm-mascot-stage-btn" data-stage="middleage">🧔 Middle Age</button>
                            <button class="tm-mascot-stage-btn" data-stage="old">👴 Old</button>
                        </div>
                    </div>
                    
                    <div class="tm-setting-row" style="margin-top: 15px;">
                        <div class="tm-setting-label"><label>Quick Tests</label></div>
                        <div class="tm-setting-control" style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button id="tm-mascot-test-bubble" style="background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">💬 Show Bubble</button>
                            <button id="tm-mascot-test-dodge" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">💨 Trigger Dodge</button>
                            <button id="tm-mascot-test-confetti" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🎉 Confetti</button>
                            <button id="tm-mascot-reset" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Reset to Normal</button>
                        </div>
                    </div>
                </div>
                
                <div class="tm-settings-section" style="margin-top: 20px;">
                    <div class="tm-setting-row" style="border-top: 2px solid #ff5252; padding-top: 20px;">
                        <div class="tm-setting-label">
                            <label>Clear Dashboard Stats</label>
                            <p class="tm-setting-description" style="color: #ff5252; font-weight: 600;">⚠️ DANGER: This will clear ALL status transfer history, counters, and dashboard statistics. This cannot be undone!</p>
                        </div>
                        <div class="tm-setting-control"><button id="tm-debug-clear-dashboard-btn" style="background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🗑️ Clear Dashboard Stats</button></div>
                    </div>
                </div>
            `;
        }

        function getSearchSettingsHTML() {
            const status40AdminUser = GM_getValue(STORAGE_KEYS.STATUS40_ADMIN_USERNAME, '');
            const status40AdminPass = GM_getValue(STORAGE_KEYS.STATUS40_ADMIN_PASSWORD, '');
            return `
                <div class="tm-settings-section">
                    <h3>🔍 Αναζήτηση & Εργαλεία</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-search-enabled">🔎 Προηγμένη Αναζήτηση</label>
                            <p class="tm-setting-description">Προσθέτει προηγμένη αναζήτηση με φίλτρα και ταχεία αποτελέσματα για επισκευές, πελάτες και προϊόντα.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-search-history-max">📜 Μέγεθος Ιστορικού Αναζητήσεων</label>
                            <p class="tm-setting-description">Αριθμός πρόσφατων αναζητήσεων που θα αποθηκεύονται (0-50).</p>
                        </div>
                        <div class="tm-setting-control"><input type="number" id="tm-setting-search-history-max" min="0" max="50"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-quick-search-enabled">⚡ Κουμπιά Γρήγορης Αναζήτησης</label>
                            <p class="tm-setting-description">Εμφανίζει κουμπιά για γρήγορη αναζήτηση ανταλλακτικών (π.χ. "Οθόνη", "Μπαταρία") στις σελίδες επισκευών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-quick-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-tech-stats-enabled">📊 Στατιστικά Τεχνικών</label>
                            <p class="tm-setting-description">Εμφανίζει στατιστικά απόδοσης για κάθε τεχνικό (επισκευές, μέσος χρόνος, κλπ.).</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-tech-stats-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-recent-repairs-enabled">📋 Πρόσφατες Επισκευές</label>
                            <p class="tm-setting-description">Προσθέτει κουμπί για γρήγορη πρόσβαση στις πρόσφατες επισκευές.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-recent-repairs-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-recent-repairs-max">🔢 Αριθμός Πρόσφατων Επισκευών</label>
                            <p class="tm-setting-description">Πόσες πρόσφατες επισκευές να εμφανίζονται στη λίστα (1-20).</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="number" id="tm-setting-recent-repairs-max" min="1" max="20" style="width: 80px; padding: 5px;">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-weather-widget-enabled">🌤️ Widget Καιρού</label>
                            <p class="tm-setting-description">Εμφανίζει την τοπική πρόγνωση καιρού στο κέντρο του footer. Απενεργοποιήστε το αν προτιμάτε μόνο την γρήγορη αναζήτηση.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-weather-widget-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-footer-quick-search-enabled">🔍 Γρήγορη Αναζήτηση Header</label>
                            <p class="tm-setting-description">Γρήγορη αναζήτηση: στο header (rnr-hfiller) σε όλες τις σελίδες, ή δίπλα στον τίτλο επισκευής στο service_edit. Κουμπί ✕ για απόκρυψη native .rnr-b-search.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-footer-quick-search-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-phone-catalog-enabled">📱 Κατάλογος Συσκευών</label>
                            <p class="tm-setting-description">Εμφανίζει κατάλογο μεταχειρισμένων συσκευών του καταστήματος με μοντέλο, βαθμίδα, IMEI, αποθηκευτικό χώρο και χρώμα. Υποστηρίζει αναζήτηση, φίλτρα και εξαγωγή CSV.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-phone-catalog-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-order-history-enabled">📦 Ιστορικό Παραγγελιών</label>
                            <p class="tm-setting-description">Εμφανίζει το ιστορικό παραγγελιών ανταλλακτικών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-order-history-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-order-link-enabled">🔗 Σύνδεση Status 65 → Παραγγελίες</label>
                            <p class="tm-setting-description">Στις επισκευές status 65, κάνει το badge κλικ για αναζήτηση παραγγελιών ανταλλακτικών. Στη σελίδα παραγγελίας εμφανίζει σύνδεσμο προς την επισκευή.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-order-link-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-customer-history-enabled">📜 Ιστορικό Πελάτη</label>
                            <p class="tm-setting-description">Εμφάνιση γρήγορης προβολής του ιστορικού πελάτη στη λίστα επισκευών.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-customer-history-enabled"></div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-return-to-40-enabled">🔴 Κουμπί «40» (65/100)</label>
                            <p class="tm-setting-description">Εμφανίζει κόκκινο αναβοσβήνον κουμπί «40» στις επισκευές με status 65 ή 100. Κάνει logout → login ως admin (όπως το logo) και μετά εφαρμόζει αυτόματα status 40.</p>
                        </div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-return-to-40-enabled"></div>
                    </div>
                </div>
                <div class="tm-settings-section" style="margin-top: 20px; border-top: 1px solid #dee2e6; padding-top: 16px;">
                    <h3>🔑 Λογαριασμός Admin (Status 40)</h3>
                    <p class="tm-setting-description">
                        Διαπιστευτήρια για το κλικ στο logo στο <code>service_edit</code> (logout → login ως admin → επιστροφή στην ίδια επισκευή).
                        Αποθηκεύονται τοπικά στο Tampermonkey (όχι ανά προφίλ χρήστη).
                    </p>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-status40-admin-username">Username</label>
                        </div>
                        <div class="tm-setting-control">
                            <input type="text" id="tm-setting-status40-admin-username" value="${String(status40AdminUser).replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false" style="min-width: 200px; padding: 8px;">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-status40-admin-password">Κωδικός</label>
                        </div>
                        <div class="tm-setting-control">
                            <input type="password" id="tm-setting-status40-admin-password" value="${String(status40AdminPass).replace(/"/g, '&quot;')}" autocomplete="new-password" style="min-width: 200px; padding: 8px;">
                        </div>
                    </div>
                </div>`;
        }

        function getAutoRefreshSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Αυτόματη Ανανέωση</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-autorefresh-enabled">Ενεργοποίηση Αυτόματης Ανανέωσης</label>
                            <p class="tm-setting-description">Ανανεώνει αυτόματα τις σελίδες λίστας.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-autorefresh-enabled" ${config.autoRefreshEnabled ? 'checked' : ''}>
                        </div>
                    </div>
                    <div id="tm-autorefresh-options">
                        <div class="tm-setting-row">
                            <div class="tm-setting-label">
                                <label for="tm-setting-refresh-interval">Διάστημα Ανανέωσης</label>
                                <p class="tm-setting-description">Ορίστε το διάστημα σε λεπτά.</p>
                            </div>
                            <div class="tm-setting-control">
                                <input type="number" id="tm-setting-refresh-interval" value="${config.refreshIntervalMinutes}" min="1" max="120">
                                <span>λεπτά</span>
                            </div>
                        </div>
                        <div id="tm-working-hours-editor">
                            <p class="tm-setting-description" style="text-align:center; margin-bottom:10px;">Ενεργό μόνο τις παρακάτω ώρες και ημέρες:</p>
                            <div id="tm-working-hours-time-inputs">
                                <label for="tm-setting-wh-start">Από:</label>
                                <input type="number" id="tm-setting-wh-start" value="${config.workingHoursStart}" min="0" max="23">
                                <label for="tm-setting-wh-end">Έως:</label>
                                <input type="number" id="tm-setting-wh-end" value="${config.workingHoursEnd}" min="1" max="24">
                            </div>
                            <div id="tm-working-days-editor"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        function getQuickSearchEditorHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Επεξεργαστής Γρήγορης Αναζήτησης</h3>
                    <p class="tm-setting-description">Προσαρμόστε τα κουμπιά που εμφανίζονται στις σελίδες επεξεργασίας παραγγελιών για γρήγορες αναζητήσεις ανταλλακτικών. Η 'Ετικέτα' είναι αυτό που εμφανίζει το κουμπί, και ο 'Όρος Αναζήτησης' είναι η λέξη-κλειδί που αναζητά.</p>
                    <div id="tm-quick-search-editor" style="padding: 0 10px;"></div>
                    <button id="tm-quick-search-add-btn" style="margin-top: 15px;">Προσθήκη Νέου Κουμπιού</button>
                </div>
            `;
        }

        function getPriceOptionsEditorHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>💰 Επιλογές Τιμών Επισκευής</h3>
                    <p class="tm-setting-description">Προσαρμόστε τις επιλογές που εμφανίζονται στο dropdown τιμών στη σελίδα επισκευής. Μπορείτε να προσθέσετε επιπλέον χρεώσεις (π.χ. καθαρισμός, μεταφορά) ή να ορίσετε ειδικές τιμές.</p>
                    <div id="tm-price-options-editor" style="padding: 0 10px;"></div>
                    <button id="tm-price-options-add-btn" style="margin-top: 15px;">➕ Προσθήκη Επιλογής</button>
                </div>
            `;
        }

        function getScratchpadTemplatesEditorHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Πρότυπα Σημειωματαρίου</h3>
                    <p class="tm-setting-description">Δημιουργήστε πρότυπα για γρήγορη εισαγωγή στο σημειωματάριο. Χρήσιμο για checklists ή επαναλαμβανόμενες σημειώσεις.</p>
                    <div id="tm-scratchpad-templates-editor" style="padding: 0 10px;"></div>
                    <button id="tm-scratchpad-template-add-btn" style="margin-top: 15px;">Προσθήκη Νέου Προτύπου</button>
                </div>
            `;
        }

        function getScratchpadSettingsHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>Σημειωματάριο</h3>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label"><label for="tm-setting-scratchpad-enabled">Ενεργοποίηση Σημειωματαρίου</label></div>
                        <div class="tm-setting-control"><input type="checkbox" id="tm-setting-scratchpad-enabled"></div>
                    </div>
                </div>
                ${getScratchpadTemplatesEditorHTML()}
            `;
        }

        function getDataManagementHTML() {
            return `
                <div class="tm-settings-section">
                    <h3>💾 Διαχείριση Δεδομένων</h3>
                    <p class="tm-setting-description">Δημιουργήστε αντίγραφα ασφαλείας των ρυθμίσεων και της προόδου σας, ή μεταφέρετέ τα σε άλλη συσκευή.</p>
                    <p class="tm-setting-description" style="margin-bottom: 12px;">Ενεργό προφίλ: <strong id="tm-settings-active-profile">—</strong> <span style="opacity:0.8;">(ξεχωριστά δεδομένα ανά χρήστη σύνδεσης στο ίδιο PC)</span></p>
                    <div class="tm-data-actions">
                        <button id="tm-export-data-btn" class="tm-data-btn export">💾 Εξαγωγή Δεδομένων</button>
                        <button id="tm-import-data-btn" class="tm-data-btn import">📂 Εισαγωγή Δεδομένων</button>
                    </div>
                    <p class="tm-setting-description" style="text-align: center; margin-top: 20px;">Επαναφέρετε όλες τις ρυθμίσεις και την πρόοδο στις αρχικές τους τιμές. <strong>Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</strong></p>
                    <div class="tm-data-actions"><button id="tm-settings-reset" class="tm-data-btn reset">⚠️ Επαναφορά Όλων</button></div>
                </div>`;
        }

        function getUpdatesSettingsHTML() {
            const loaderUrl = window.SCRIPT_META?.loaderUrl || 'myman_loader.user.js';
            return `
                <div class="tm-settings-section">
                    <h3>🔄 Ενημερώσεις Script</h3>
                    <p class="tm-setting-description">Έλεγχος για νέες εκδόσεις από το GitHub. Το Tampermonkey εγκαθιστά την ενημέρωση — αυτό το script σας ειδοποιεί όταν υπάρχει νέα έκδοση.</p>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label for="tm-setting-auto-update-check-enabled">Αυτόματος έλεγχος κάθε 5 λεπτά</label>
                            <p class="tm-setting-description">Ελέγχει στο παρασκήνιο και εμφανίζει ειδοποίηση αν υπάρχει νέα έκδοση.</p>
                        </div>
                        <div class="tm-setting-control">
                            <input type="checkbox" id="tm-setting-auto-update-check-enabled">
                        </div>
                    </div>
                    <div class="tm-setting-row">
                        <div class="tm-setting-label">
                            <label>Τρέχουσα έκδοση</label>
                            <p class="tm-setting-description"><strong id="tm-settings-current-version">—</strong></p>
                            <p class="tm-setting-description" id="tm-settings-update-status">—</p>
                            <p class="tm-setting-description" id="tm-settings-skipped-version" style="display: none;"></p>
                        </div>
                        <div class="tm-setting-control" style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                            <button id="tm-settings-check-update-btn" class="tm-data-btn export" type="button">Έλεγχος τώρα</button>
                            <button id="tm-settings-clear-skip-update-btn" class="tm-data-btn import" type="button" style="display: none;">Ξεχάστε παράλειψη έκδοσης</button>
                        </div>
                    </div>
                    <div class="tm-setting-row" style="border-top: 1px solid #e0e0e0; padding-top: 15px;">
                        <div class="tm-setting-label">
                            <label>Εγκατάσταση / Ενημέρωση</label>
                            <p class="tm-setting-description">Εγκαταστήστε μία φορά το loader από το GitHub. Μετά, οι ενημερώσεις γίνονται από το Tampermonkey Dashboard.</p>
                            <p class="tm-setting-description" style="word-break: break-all; font-size: 11px; opacity: 0.85;"><code>${loaderUrl}</code></p>
                        </div>
                    </div>
                </div>`;
        }

        function refreshUpdatesSettingsUI(result) {
            const versionEl = document.getElementById('tm-settings-current-version');
            const statusEl = document.getElementById('tm-settings-update-status');
            const skippedEl = document.getElementById('tm-settings-skipped-version');
            const clearSkipBtn = document.getElementById('tm-settings-clear-skip-update-btn');

            if (versionEl) {
                versionEl.textContent = window.SCRIPT_META?.version || '—';
            }
            if (statusEl && result) {
                statusEl.innerHTML = typeof window.formatUpdateStatusMessage === 'function'
                    ? window.formatUpdateStatusMessage(result)
                    : '—';
            }
            const skipped = typeof window.getSkippedUpdateVersion === 'function'
                ? window.getSkippedUpdateVersion()
                : '';
            if (skippedEl && clearSkipBtn) {
                if (skipped) {
                    skippedEl.style.display = 'block';
                    skippedEl.textContent = `Παραλείφθηκε η ειδοποίηση για την έκδοση v${skipped}.`;
                    clearSkipBtn.style.display = 'inline-block';
                } else {
                    skippedEl.style.display = 'none';
                    skippedEl.textContent = '';
                    clearSkipBtn.style.display = 'none';
                }
            }
        }

        function initUpdatesSettingsPage() {
            const checkBtn = document.getElementById('tm-settings-check-update-btn');
            const clearSkipBtn = document.getElementById('tm-settings-clear-skip-update-btn');
            const autoCheck = document.getElementById('tm-setting-auto-update-check-enabled');
            const statusEl = document.getElementById('tm-settings-update-status');

            if (autoCheck) {
                autoCheck.checked = GM_getValue('autoUpdateCheckEnabled', true) !== false;
            }

            refreshUpdatesSettingsUI(window.getLastScriptUpdateResult?.() || null);
            if (statusEl && !window.getLastScriptUpdateResult?.()) {
                statusEl.textContent = 'Πατήστε «Έλεγχος τώρα» ή περιμένετε τον αυτόματο έλεγχο (κάθε 5 λεπτά).';
            }

            checkBtn?.addEventListener('click', () => {
                if (typeof window.runScriptUpdateCheck !== 'function') {
                    if (statusEl) statusEl.textContent = '❌ Η λειτουργία ελέγχου ενημερώσεων δεν είναι διαθέσιμη.';
                    return;
                }
                checkBtn.disabled = true;
                if (statusEl) statusEl.textContent = '⏳ Έλεγχος για νέα έκδοση...';

                window.runScriptUpdateCheck({ silent: false, showBanner: true }).then((result) => {
                    checkBtn.disabled = false;
                    refreshUpdatesSettingsUI(result);
                });
            });

            clearSkipBtn?.addEventListener('click', () => {
                if (typeof window.clearSkippedUpdateVersion === 'function') {
                    window.clearSkippedUpdateVersion();
                }
                refreshUpdatesSettingsUI(window.getLastScriptUpdateResult?.() || null);
                if (typeof showPositiveMessage === 'function') {
                    showPositiveMessage('Η παράλειψη έκδοσης ακυρώθηκε.');
                }
            });

            window.addEventListener('mms-update-check', (e) => {
                if (document.getElementById('sec-updates')?.classList.contains('active')) {
                    refreshUpdatesSettingsUI(e.detail);
                }
            });
        }

        function initDataManagementControls() {
            const profileEl = document.getElementById('tm-settings-active-profile');
            if (profileEl) {
                const label = window.MMS_PROFILES?.getActiveProfileLabel?.()
                    || window.tmCurrentUser
                    || '—';
                profileEl.textContent = label;
            }
        }

        function handleExportData() {
            try {
                let backupData = window.MMS_PROFILES?.exportCurrentProfileData
                    ? window.MMS_PROFILES.exportCurrentProfileData()
                    : null;

                if (!backupData) {
                    backupData = {};
                    const keysToBackup = [
                        ...Object.keys(window.DEFAULTS || {}).filter((k) => k !== 'defaultThemeColors'),
                        ...Object.values(STORAGE_KEYS)
                    ];
                    keysToBackup.forEach((key) => {
                        const value = GM_getValue(key, undefined);
                        if (value !== undefined) {
                            backupData[key] = window.MMS_PROFILES?.exportStorageValue
                                ? window.MMS_PROFILES.exportStorageValue(value)
                                : value;
                        }
                    });
                    backupData._mms_export = {
                        version: 1,
                        profileId: window.MMS_PROFILES?.getActiveProfileId?.() || null,
                        profileLabel: window.MMS_PROFILES?.getActiveProfileLabel?.() || null,
                        exportedAt: new Date().toISOString()
                    };
                }

                const jsonString = window.MMS_PROFILES?.safeBackupStringify
                    ? window.MMS_PROFILES.safeBackupStringify(backupData)
                    : JSON.stringify(backupData, null, 2);

                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                const today = new Date().toISOString().slice(0, 10);
                const profileSlug = window.MMS_PROFILES?.getActiveProfileId?.() || 'user';
                a.download = `MyManagerSuite_${profileSlug}_${today}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (typeof window.showPositiveMessage === 'function') {
                    window.showPositiveMessage('Τα δεδομένα εξήχθησαν με επιτυχία!');
                }
            } catch (error) {
                console.error('[MMS] Export failed:', error);
                alert(`Σφάλμα κατά την εξαγωγή δεδομένων: ${error.message}`);
            }
        }

        function handleImportData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = readerEvent => {
                    try {
                        let raw = readerEvent.target.result;
                        if (typeof raw !== 'string') {
                            throw new Error('Το αρχείο δεν είναι έγκυρο κείμενο JSON.');
                        }
                        raw = raw.replace(/^\uFEFF/, '').trim();
                        const importedData = JSON.parse(raw);

                        if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
                            throw new Error('Μη έγκυρη μορφή αρχείου backup.');
                        }

                        if (!window.MMS_PROFILES?.importProfileData) {
                            throw new Error('Το σύστημα προφίλ δεν είναι διαθέσιμο. Κάντε επαναφόρτωση της σελίδας.');
                        }

                        if (!confirm('Είστε σίγουροι ότι θέλετε να εισάγετε αυτά τα δεδομένα; Όλη η τρέχουσα πρόοδος και οι ρυθμίσεις του ενεργού προφίλ θα αντικατασταθούν.')) {
                            return;
                        }

                        window.MMS_PROFILES.importProfileData(importedData);

                        alert('Τα δεδομένα εισήχθησαν με επιτυχία! Η σελίδα θα ανανεωθεί για να εφαρμοστούν οι αλλαγές.');
                        window.location.reload();

                    } catch (error) {
                        alert(`Σφάλμα κατά την εισαγωγή δεδομένων: ${error.message}`);
                        console.error('[MMS] Import failed:', error);
                    }
                };

                reader.readAsText(file);
            };

            input.click();
        }

        function createSettingsModal() {
            const overlay = document.createElement('div');
            overlay.className = 'tm-modal-overlay';
            overlay.innerHTML = `
                <div class="tm-modal-content">
                    <div class="tm-modal-header">
                        <h2 class="tm-modal-title">Ρυθμίσεις MyManager Suite</h2>
                        <button class="tm-modal-close">&times;</button>
                    </div>
                    <div class="tm-settings-layout">
                        <aside class="tm-settings-sidebar">
                            <ul class="tm-nav">
                                <li><a href="#sec-general">⚙️ Γενικές</a></li>
                                <li><a href="#sec-search">🔍 Αναζήτηση & Εργαλεία</a></li>
                                <li><a href="#sec-autorefresh">🔄 Αυτόματη Ανανέωση</a></li>
                                <li><a href="#sec-scratchpad">📝 Σημειωματάριο</a></li>                            
                                <li><a href="#sec-gamification">🎮 Παιχνιδοποίηση & Mascot</a></li>
                                <li><a href="#sec-updates">🔄 Ενημερώσεις</a></li>
                                <li><a href="#sec-data">💾 Δεδομένα & Backup</a></li>
                                <li style="display: none;" data-debug-only="true"><a href="#sec-debug">🔧 Ανάπτυξη</a></li>
                            </ul>
                        </aside>
                        <main class="tm-settings-main" id="tm-settings-content">
                            <section id="sec-general">${getGeneralUISettingsHTML()}</section>
                            <section id="sec-search">${getSearchSettingsHTML()}${getQuickSearchEditorHTML()}${getPriceOptionsEditorHTML()}</section>
                            <section id="sec-autorefresh">${getAutoRefreshSettingsHTML()}</section>
                            <section id="sec-scratchpad">${getScratchpadSettingsHTML()}</section>
                            <section id="sec-gamification">${window.getGamificationSettingsHTML(STORAGE_KEYS)}</section>
                            <section id="sec-debug">${getDebugSettingsHTML()}</section>
                            <section id="sec-updates">${getUpdatesSettingsHTML()}</section>
                            <section id="sec-data">${getDataManagementHTML()}</section>
                        </main>
                    </div>
                    <div class="tm-modal-footer">
                        <span id="tm-settings-feedback"></span>
                        <button id="tm-settings-save">Αποθήκευση & Επαναφόρτωση</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Event Listeners
            overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
            overlay.querySelector('#tm-settings-save').addEventListener('click', saveSettings);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
            try {
                const links = overlay.querySelectorAll('.tm-settings-sidebar .tm-nav a');
                const sections = overlay.querySelectorAll('.tm-settings-main section');
                const debugTab = overlay.querySelector('[data-debug-only="true"]');

                function activate(id) {
                    sections.forEach(sec => sec.classList.toggle('active', '#' + sec.id === id));
                    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
                }
                links.forEach(a => {
                    a.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        const id = a.getAttribute('href');
                        activate(id);
                    });
                });
                // Special handling for debug tab
                if (debugTab) {
                    debugTab.style.display = config.debugEnabled ? 'block' : 'none';
                }
                // default active first
                if (links.length) activate(links[0].getAttribute('href'));
            } catch(_) {}

            // Talent unlock logic - Attach listener to the main content area for delegation
            const settingsContent = overlay.querySelector('#tm-settings-content');
            if (settingsContent) {
                settingsContent.addEventListener('click', (e) => handleTalentUnlock(e, STORAGE_KEYS));
                initDebugControls(config); // Initialize debug button listeners
            }

            // Attach listeners for Data Management buttons now that they exist in the DOM
            overlay.querySelector('#tm-settings-reset')?.addEventListener('click', resetSettings);
            overlay.querySelector('#tm-export-data-btn')?.addEventListener('click', handleExportData);
            overlay.querySelector('#tm-import-data-btn')?.addEventListener('click', handleImportData);
            initUpdatesSettingsPage();
            initDataManagementControls();

            // --- Populate Checkboxes ---
            const populateCheckbox = (id, key) => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = config[key];
            };
            populateCheckbox('tm-setting-script-enabled', 'scriptEnabled');
            populateCheckbox('tm-setting-debug-enabled', 'debugEnabled');
            
            // Add passcode protection for debug mode
            const debugCheckbox = document.getElementById('tm-setting-debug-enabled');
            if (debugCheckbox) {
                debugCheckbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Trying to enable debug mode - require passcode
                        const passcode = prompt('🔐 Enter Debug Mode Passcode:');
                        const correctPasscode = '1337'; // You can change this
                        
                        if (passcode !== correctPasscode) {
                            e.target.checked = false;
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage('❌ Incorrect passcode!');
                            } else {
                                alert('❌ Incorrect passcode!');
                            }
                            return;
                        } else {
                            if (window.showPositiveMessage) {
                                window.showPositiveMessage('✓ Debug mode unlocked!');
                            }
                        }
                    }
                    // Save the value
                    GM_setValue('debugEnabled', e.target.checked);
                    config.debugEnabled = e.target.checked;
                });
            }
            
            populateCheckbox('tm-setting-login-page-enabled', 'customLoginPageEnabled');
            populateCheckbox('tm-setting-dashboard-enabled', 'dashboardWidgetEnabled');
            populateCheckbox('tm-setting-scroll-top-enabled', 'scrollToTopEnabled');
            populateCheckbox('tm-setting-tech-stats-enabled', 'technicianStatsEnabled');
            populateCheckbox('tm-setting-search-enabled', 'searchFeatureEnabled');
            populateCheckbox('tm-setting-automated-parts-search-enabled', 'automatedPartsSearchEnabled');
            populateCheckbox('tm-setting-quick-search-enabled', 'quickSearchEnabled');
            populateCheckbox('tm-setting-scratchpad-enabled', 'scratchpadEnabled');
            populateCheckbox('tm-setting-recent-repairs-enabled', 'recentRepairsEnabled');
            populateCheckbox('tm-setting-weather-widget-enabled', 'weatherWidgetEnabled');
            populateCheckbox('tm-setting-footer-quick-search-enabled', 'footerQuickSearchEnabled');
            populateCheckbox('tm-setting-phone-catalog-enabled', 'phoneCatalogEnabled');
            populateCheckbox('tm-setting-order-history-enabled', 'orderHistoryEnabled');
            populateCheckbox('tm-setting-order-link-enabled', 'orderLinkEnabled');
            populateCheckbox('tm-setting-return-to-40-enabled', 'returnTo40ButtonEnabled');
            populateCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
            populateCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
            populateCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
            populateCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');
            populateCheckbox('tm-setting-customer-history-enabled', 'customerHistoryEnabled');
            
            // Populate new feature checkboxes
            populateCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
            populateCheckbox('tm-setting-smart-templates-enabled', 'smartTemplatesEnabled');
            populateCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
            populateCheckbox('tm-setting-boss-battles-enabled', 'bossBattlesEnabled');
            
            document.getElementById('tm-setting-search-history-max').value = config.searchMaxHistory;
            document.getElementById('tm-setting-recent-repairs-max').value = config.recentRepairsMaxItems || 5;
            window.initGamificationSettings(config, STORAGE_KEYS);
            
            // Add event listener to recent repairs checkbox to update UI immediately
            const recentRepairsCheckbox = document.getElementById('tm-setting-recent-repairs-enabled');
            if (recentRepairsCheckbox) {
                recentRepairsCheckbox.addEventListener('change', () => {
                    // Save immediately
                    const value = recentRepairsCheckbox.checked;
                    GM_setValue('recentRepairsEnabled', value);
                    config.recentRepairsEnabled = value;
                    
                    // Update recent repairs button visibility
                    if (typeof window.updateRecentRepairsButtonVisibility === 'function') {
                        window.updateRecentRepairsButtonVisibility(config);
                    }
                });
            }
            
            // Add event listener to weather widget checkbox to update UI immediately
            const weatherWidgetCheckbox = document.getElementById('tm-setting-weather-widget-enabled');
            if (weatherWidgetCheckbox) {
                weatherWidgetCheckbox.addEventListener('change', () => {
                    const value = weatherWidgetCheckbox.checked;
                    GM_setValue('weatherWidgetEnabled', value);
                    config.weatherWidgetEnabled = value;

                    if (typeof window.updateWeatherWidgetVisibility === 'function') {
                        window.updateWeatherWidgetVisibility(config);
                    }
                });
            }

            const footerQuickSearchCheckbox = document.getElementById('tm-setting-footer-quick-search-enabled');
            if (footerQuickSearchCheckbox) {
                footerQuickSearchCheckbox.addEventListener('change', () => {
                    const value = footerQuickSearchCheckbox.checked;
                    GM_setValue('footerQuickSearchEnabled', value);
                    config.footerQuickSearchEnabled = value;

                    const mountTarget = document.getElementById('tm-repair-edit-quick-search-host')
                        || document.getElementById('tm-header-quick-search-host')
                        || document.querySelector('.rnr-hfiller');
                    if (value && !document.getElementById('tm-footer-quick-search')
                        && typeof window.initFooterQuickSearch === 'function') {
                        window.initFooterQuickSearch(config);
                    } else if (typeof window.updateFooterQuickSearchVisibility === 'function') {
                        window.updateFooterQuickSearchVisibility(config);
                    }
                });
            }
            
            const phoneCatalogCheckbox = document.getElementById('tm-setting-phone-catalog-enabled');
            if (phoneCatalogCheckbox) {
                phoneCatalogCheckbox.addEventListener('change', () => {
                    // Save immediately
                    const value = phoneCatalogCheckbox.checked;
                    GM_setValue('phoneCatalogEnabled', value);
                    config.phoneCatalogEnabled = value;
                    
                    // Update phone catalog button visibility
                    if (typeof window.updatePhoneCatalogButtonVisibility === 'function') {
                        window.updatePhoneCatalogButtonVisibility(config);
                    }
                });
            }
            
            const orderHistoryCheckbox = document.getElementById('tm-setting-order-history-enabled');
            if (orderHistoryCheckbox) {
                orderHistoryCheckbox.addEventListener('change', () => {
                    // Save immediately
                    const value = orderHistoryCheckbox.checked;
                    GM_setValue('orderHistoryEnabled', value);
                    config.orderHistoryEnabled = value;
                    
                    // Update order history button visibility
                    if (typeof window.updateOrderHistoryButtonVisibility === 'function') {
                        window.updateOrderHistoryButtonVisibility(config);
                    }
                });
            }

            // Logic for the new checkbox
            const checkbox = overlay.querySelector('#tm-setting-autorefresh-enabled');
            const optionsDiv = overlay.querySelector('#tm-autorefresh-options');

            checkbox.checked = config.autoRefreshEnabled;
            optionsDiv.style.display = config.autoRefreshEnabled ? 'block' : 'none';

            checkbox.addEventListener('change', () => {
                optionsDiv.style.display = checkbox.checked ? 'block' : 'none';
            });

            // --- Populate Working Hours Editor ---
            const whDaysEditor = overlay.querySelector('#tm-working-days-editor');
            const daysOfWeek = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
            daysOfWeek.forEach((day, index) => {
                const isChecked = config.workingDays.includes(index);
                whDaysEditor.innerHTML += `
                    <span>
                        <input type="checkbox" class="tm-working-day-checkbox" id="day-${index}" value="${index}" ${isChecked ? 'checked' : ''}>
                        <label for="day-${index}" style="display: inline; font-weight: normal;">${day}</label>
                    </span>
                `;
            });

            // --- Populate and manage Quick Search Editor ---
            const editorContainer = overlay.querySelector('#tm-quick-search-editor');

            function renderQuickSearchRows() {
                editorContainer.innerHTML = ''; // Clear existing rows
                config.quickSearchButtons.forEach((button) => {
                    addNewQuickSearchRow(button.label, button.term);
                });
            }

            function addNewQuickSearchRow(label = '', term = '') {
                const row = document.createElement('div');
                row.className = 'tm-quick-search-row';
                row.innerHTML = `
                    <input type="text" placeholder="Ετικέτα (π.χ., Οθόνη)" data-type="label" value="${label}">
                    <input type="text" placeholder="Όρος Αναζήτησης (π.χ., LCD)" data-type="term" value="${term}">
                    <button class="tm-quick-search-remove-btn" title="Αφαίρεση Κουμπιού">&times;</button>
                `;
                editorContainer.appendChild(row);
                row.querySelector('.tm-quick-search-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-quick-search-row').remove();
                });
            }

            // --- Populate and manage Scratchpad Templates Editor ---
            const templatesEditorContainer = overlay.querySelector('#tm-scratchpad-templates-editor');
            const savedTemplates = JSON.parse(GM_getValue(STORAGE_KEYS.SCRATCHPAD_TEMPLATES, '[]'));

            function renderScratchpadTemplateRows() {
                templatesEditorContainer.innerHTML = ''; // Clear existing rows
                savedTemplates.forEach(template => {
                    addNewScratchpadTemplateRow(template);
                });
            }

            function addNewScratchpadTemplateRow(template = { id: '', title: '', content: '' }) {
                const row = document.createElement('div');
                row.className = 'tm-template-row';
                row.dataset.id = template.id;
                row.style.marginBottom = '15px';
                row.innerHTML = `
                    <input type="text" placeholder="Τίτλος Προτύπου" data-type="title" value="${template.title}" style="width: 100%; padding: 8px; box-sizing: border-box; margin-bottom: 5px;">
                    <textarea placeholder="Περιεχόμενο Προτύπου..." data-type="content" style="width: 100%; min-height: 80px; padding: 8px; box-sizing: border-box; font-family: monospace;">${template.content}</textarea>
                    <button class="tm-template-remove-btn" title="Αφαίρεση Προτύπου" style="background: var(--tm-danger-color); color: white; border: none; border-radius: 4px; cursor: pointer; float: right; margin-top: 5px;">&times;</button>
                `;
                templatesEditorContainer.appendChild(row);
                row.querySelector('.tm-template-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-template-row').remove();
                });
            }

            overlay.querySelector('#tm-scratchpad-template-add-btn').addEventListener('click', (e) => {
                e.preventDefault();
                addNewScratchpadTemplateRow();
            });

            // Attach listener for the Quick Search "Add" button now that it's in the DOM
            overlay.querySelector('#tm-quick-search-add-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                addNewQuickSearchRow();
            });

            // --- Populate and manage Price Options Editor ---
            const priceOptionsContainer = overlay.querySelector('#tm-price-options-editor');

            function renderPriceOptionsRows() {
                priceOptionsContainer.innerHTML = ''; // Clear existing rows
                const priceOptions = config.priceOptions || [];
                priceOptions.forEach((option) => {
                    addNewPriceOptionRow(option.label, option.value, option.action, option.condition);
                });
            }

            function addNewPriceOptionRow(label = '', value = '', action = 'add', condition = 'default') {
                const row = document.createElement('div');
                row.className = 'tm-price-option-row';
                row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
                row.innerHTML = `
                    <input type="text" placeholder="Ετικέτα (π.χ., Καθαρισμός)" data-type="label" value="${label}" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <input type="number" placeholder="Τιμή" data-type="value" value="${value}" step="0.01" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <select data-type="action" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="add" ${action === 'add' ? 'selected' : ''}>Πρόσθεση</option>
                        <option value="replace" ${action === 'replace' ? 'selected' : ''}>Αντικατάσταση</option>
                    </select>
                    <select data-type="condition" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="default" ${condition === 'default' ? 'selected' : ''}>Πάντα</option>
                        <option value="ps5" ${condition === 'ps5' ? 'selected' : ''}>Μόνο PS5</option>
                    </select>
                    <button class="tm-price-option-remove-btn" title="Αφαίρεση" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">&times;</button>
                `;
                priceOptionsContainer.appendChild(row);
                row.querySelector('.tm-price-option-remove-btn').addEventListener('click', (e) => {
                    e.target.closest('.tm-price-option-row').remove();
                });
            }

            // Attach listener for the Price Options "Add" button
            overlay.querySelector('#tm-price-options-add-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                addNewPriceOptionRow();
            });

            renderScratchpadTemplateRows();
            renderQuickSearchRows(); // Initial render
            renderPriceOptionsRows(); // Initial render for price options

        }

        function initDebugControls(config) {
            if (!config.debugEnabled) return;

            document.getElementById('tm-debug-set-level-btn')?.addEventListener('click', () => {
                const newLevel = parseInt(document.getElementById('tm-debug-level-input').value, 10);
                if (newLevel > 0) {
                    GM_setValue(STORAGE_KEYS.USER_LEVEL, newLevel);
                    GM_setValue(STORAGE_KEYS.USER_XP, 0);
                    
                    // Update the title based on the new level
                    const newRank = window.RANKS.slice().reverse().find(r => newLevel >= r.level) || window.RANKS[0];
                    GM_setValue(STORAGE_KEYS.USER_TITLE, newRank.title);
                    
                    // Update mascot appearance
                    if (typeof updateMascotAppearanceByLevel === 'function') {
                        updateMascotAppearanceByLevel(newLevel);
                    }
                    
                    // Update UI
                    window.updateXpBarUI(STORAGE_KEYS, newLevel, 0, window.getXpForLevel(newLevel));
                    showPositiveMessage(`Level set to ${newLevel}. Title: ${newRank.title}`);
                }
            });
            document.getElementById('tm-debug-add-xp-btn')?.addEventListener('click', () => {
                const xpToAdd = parseInt(document.getElementById('tm-debug-xp-input').value, 10); if (xpToAdd) window.grantXp(config, STORAGE_KEYS, xpToAdd);
            });
            document.getElementById('tm-debug-add-coins-btn')?.addEventListener('click', () => {
                const coinsToAdd = parseInt(document.getElementById('tm-debug-coins-input').value, 10); if (coinsToAdd) window.grantCoins(config, STORAGE_KEYS, coinsToAdd);
            });
            
            // Trigger Random Event button
            document.getElementById('tm-debug-trigger-event-btn')?.addEventListener('click', () => {
                if (typeof window.forceRandomEvent === 'function') {
                    window.forceRandomEvent(config, STORAGE_KEYS);
                    showPositiveMessage('🎲 Random event triggered!');
                } else {
                    showPositiveMessage('❌ Random events not available');
                }
            });
            
            // Stop Random Event button
            document.getElementById('tm-debug-stop-event-btn')?.addEventListener('click', () => {
                if (typeof window.stopRandomEvent === 'function') {
                    window.stopRandomEvent(STORAGE_KEYS);
                    showPositiveMessage('🛑 Random event stopped!');
                } else {
                    showPositiveMessage('❌ Random events not available');
                }
            });
            
            // Spawn Boss Battle button
            document.getElementById('tm-debug-spawn-boss-btn')?.addEventListener('click', () => {
                if (typeof window.forceBossSpawn === 'function') {
                    window.forceBossSpawn(config, STORAGE_KEYS);
                    showPositiveMessage('⚔️ Boss battle spawned!');
                } else {
                    showPositiveMessage('❌ Boss battles not available');
                }
            });
            
            // Stop Boss Battle button
            document.getElementById('tm-debug-stop-boss-btn')?.addEventListener('click', () => {
                if (typeof window.stopBossBattle === 'function') {
                    window.stopBossBattle(STORAGE_KEYS);
                    showPositiveMessage('🛑 Boss battle stopped!');
                } else {
                    showPositiveMessage('❌ Boss battles not available');
                }
            });
            
            // Mascot Evolution Controls
            document.getElementById('tm-debug-hatch-egg-btn')?.addEventListener('click', () => {
                const tamaData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
                if (tamaData) {
                    // Randomly select a character
                    const characterTypes = ['dragon', 'robot', 'slime', 'plant', 'ghost', 'cat', 'phoenix', 'crystal'];
                    const selectedCharacter = characterTypes[Math.floor(Math.random() * characterTypes.length)];
                    
                    tamaData.age = 1.5; // Force hatch (baby stage)
                    tamaData.stage = 'baby';
                    tamaData.characterType = selectedCharacter;
                    tamaData.lastUpdate = Date.now();
                    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(tamaData));
                    
                    // Show EPIC reveal!
                    if (typeof window.showEpicCharacterReveal === 'function') {
                        window.showEpicCharacterReveal(selectedCharacter);
                    }
                    
                    // Update appearance
                    setTimeout(() => {
                        if (typeof window.updateMascotAppearanceByStage === 'function') {
                            window.updateMascotAppearanceByStage('baby');
                        }
                    }, 4000); // After reveal animation
                    
                    showPositiveMessage('🎉 Hatching with EPIC reveal!');
                } else {
                    showPositiveMessage('❌ Mascot data not found. Enable mascot first.');
                }
            });
            
            document.getElementById('tm-debug-reset-egg-btn')?.addEventListener('click', () => {
                const tamaData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
                if (tamaData) {
                    tamaData.age = 0;
                    tamaData.stage = 'egg';
                    tamaData.characterType = 'none';
                    tamaData.lastUpdate = Date.now();
                    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(tamaData));
                    
                    if (typeof window.updateMascotAppearanceByStage === 'function') {
                        window.updateMascotAppearanceByStage('egg');
                    }
                    
                    showPositiveMessage('🥚 Reset to egg! Hatch again to get random character.');
                } else {
                    showPositiveMessage('❌ Mascot data not found. Enable mascot first.');
                }
            });
            
            document.getElementById('tm-debug-age-up-btn')?.addEventListener('click', () => {
                const tamaData = JSON.parse(GM_getValue(STORAGE_KEYS.TAMAGOTCHI_DATA, 'null'));
                if (tamaData) {
                    const oldAge = tamaData.age || 0;
                    tamaData.age = oldAge + 10;
                    tamaData.lastUpdate = Date.now();
                    GM_setValue(STORAGE_KEYS.TAMAGOTCHI_DATA, JSON.stringify(tamaData));
                    
                    showPositiveMessage(`⏭️ Aged up! Now ${Math.floor(tamaData.age)} years old. Refresh to see changes.`);
                } else {
                    showPositiveMessage('❌ Mascot data not found. Enable mascot first.');
                }
            });
            
            // Mascot State Test Buttons
            document.querySelectorAll('.tm-mascot-state-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const state = btn.dataset.state;
                    if (typeof window.setMascotState === 'function') {
                        window.setMascotState(config, state, 5000); // 5 second preview
                        showPositiveMessage(`🤖 Mascot state: ${state}`);
                    } else {
                        showPositiveMessage('❌ Mascot functions not available');
                    }
                });
            });
            
            // Mascot Stage Test Buttons
            document.querySelectorAll('.tm-mascot-stage-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const stage = btn.dataset.stage;
                    if (typeof window.updateMascotAppearanceByStage === 'function') {
                        window.updateMascotAppearanceByStage(stage);
                        showPositiveMessage(`🤖 Mascot stage: ${stage}`);
                    } else {
                        showPositiveMessage('❌ Mascot stage functions not available');
                    }
                });
            });
            
            // Mascot Test Bubble
            document.getElementById('tm-mascot-test-bubble')?.addEventListener('click', () => {
                if (typeof window.showMascotBubble === 'function') {
                    const testMessages = [
                        'Hello there! 👋',
                        'Testing 1, 2, 3!',
                        'Γεια σου! 🎉',
                        'Ωραία φάση!',
                        'I am working!',
                        'Debug mode active! 🔧'
                    ];
                    const randomMsg = testMessages[Math.floor(Math.random() * testMessages.length)];
                    window.showMascotBubble(randomMsg, 3000);
                    showPositiveMessage('💬 Speech bubble displayed!');
                } else {
                    showPositiveMessage('❌ Mascot bubble function not available');
                }
            });
            
            // Mascot Test Dodge
            document.getElementById('tm-mascot-test-dodge')?.addEventListener('click', () => {
                if (typeof window.triggerDodgeAnimation === 'function' && typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'dodging', 1000);
                    showPositiveMessage('💨 Dodge animation triggered!');
                } else {
                    showPositiveMessage('❌ Mascot dodge function not available');
                }
            });
            
            // Mascot Test Confetti
            document.getElementById('tm-mascot-test-confetti')?.addEventListener('click', () => {
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(100);
                    showPositiveMessage('🎉 Confetti triggered!');
                } else {
                    showPositiveMessage('❌ Confetti function not available');
                }
            });
            
            // Mascot Reset to Normal
            document.getElementById('tm-mascot-reset')?.addEventListener('click', () => {
                if (typeof window.setMascotState === 'function' && typeof window.updatePetStateByStats === 'function') {
                    window.updatePetStateByStats(config, STORAGE_KEYS, true);
                    showPositiveMessage('🔄 Mascot reset to normal state!');
                } else {
                    showPositiveMessage('❌ Mascot functions not available');
                }
            });
            
            // Clear Dashboard Stats button
            document.getElementById('tm-debug-clear-dashboard-btn')?.addEventListener('click', () => {
                const confirmation = confirm(
                    '⚠️ WARNING: This will permanently delete:\n\n' +
                    '• All status transfer history\n' +
                    '• All status counters (30, 40, 55, 65, 70, 75, 90, 100, 105)\n' +
                    '• All dashboard statistics\n\n' +
                    'This action CANNOT be undone!\n\n' +
                    'Are you absolutely sure you want to continue?'
                );
                
                if (!confirmation) return;
                
                const doubleConfirmation = confirm(
                    '⚠️ FINAL WARNING!\n\n' +
                    'This will erase ALL your status transfer data and counters.\n\n' +
                    'Click OK to proceed with deletion.'
                );
                
                if (!doubleConfirmation) return;
                
                try {
                    // Clear status transfer history
                    GM_deleteValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY);
                    console.log('[MMS Debug] Cleared status transfer history');
                    
                    // Clear all status counters
                    const trackedStatuses = ['30', '40', '55', '65', '70', '75', '90', '100', '105'];
                    trackedStatuses.forEach(status => {
                        const statusKey = `tm_status_${status}_transfers`;
                        GM_deleteValue(statusKey);
                        console.log(`[MMS Debug] Cleared status ${status} counter`);
                    });
                    
                    // Clear old counter keys for backward compatibility
                    GM_deleteValue(STORAGE_KEYS.STATUS_40_TRANSFERS);
                    GM_deleteValue(STORAGE_KEYS.STATUS_100_TRANSFERS);
                    console.log('[MMS Debug] Cleared legacy status counters');
                    
                    // Clear daily stats
                    GM_deleteValue(STORAGE_KEYS.DAILY_STATS);
                    console.log('[MMS Debug] Cleared daily stats');
                    
                    showPositiveMessage('✅ All dashboard stats have been cleared!');
                    
                    // Refresh the page after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (e) {
                    console.error('[MMS Debug] Error clearing dashboard stats:', e);
                    showPositiveMessage('❌ Error clearing dashboard stats. Check console.');
                }
            });

        }
        function handleTalentUnlock(e, STORAGE_KEYS) {
            if (!e.target.matches('.tm-talent-btn.unlockable')) return;

            const button = e.target;
            const talentId = button.dataset.talentId;
            const talent = window.TALENT_TREE.find(t => t.id === talentId);

            if (talent) {
                let talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                if (talentPoints >= talent.cost) {
                    talentPoints -= talent.cost;
                    GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, talentPoints);

                    let unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                    unlockedTalents.push(talentId);
                    GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlockedTalents));

                    // Re-render the talents section
                    document.getElementById('tm-talents-grid').parentElement.innerHTML = window.getTalentsHTML(STORAGE_KEYS);
                }
            }
        }
        function addSettingsButton() {
            // --- Notification Bell (always: repair reminders, scratchpad, achievements, etc.) ---
            const bellWrapper = document.createElement('div');
            bellWrapper.id = 'tm-notification-bell-wrapper';
            bellWrapper.innerHTML = `
                <button id="tm-notification-bell-btn" title="Κέντρο ειδοποιήσεων">🔔</button>
                <span id="tm-notification-unread-count">0</span>
            `;
            parentContainer.appendChild(bellWrapper);
            bellWrapper.querySelector('#tm-notification-bell-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.toggleNotificationPanel();
            });
            window.updateNotificationBadge();

            const button = document.createElement('button');
            button.id = 'tm-settings-btn';
            button.innerHTML = '⚙️'; // Settings gear icon
            button.title = 'Ρυθμίσεις MyManager Suite';
            button.addEventListener('click', createSettingsModal);
            parentContainer.appendChild(button);

            const coinBalance = document.createElement('div');
            coinBalance.id = 'tm-coin-balance';
            coinBalance.title = 'Fixer-Coins (Click to open Shop)';
            coinBalance.style.cursor = 'pointer';
            coinBalance.style.position = 'relative';
            coinBalance.addEventListener('click', () => {
                if (typeof window.showShopModal === 'function') {
                    window.showShopModal(config, STORAGE_KEYS);
                }
            });
            
            // Create coin history tooltip
            let tooltip = null;
            
            coinBalance.addEventListener('mouseenter', () => {
                if (tooltip) {
                    tooltip.remove();
                }
                
                try {
                    const coinHistory = JSON.parse(GM_getValue(STORAGE_KEYS.COIN_HISTORY, '[]'));
                    
                    tooltip = document.createElement('div');
                    tooltip.id = 'tm-coin-history-tooltip';
                    
                    // Get position of coin balance element
                    const rect = coinBalance.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const viewportWidth = window.innerWidth;
                    
                    // Calculate position - show above the coin balance
                    const tooltipTop = rect.top - 10;
                    const tooltipRight = viewportWidth - rect.right;
                    
                    tooltip.style.cssText = `
                        position: fixed;
                        top: ${tooltipTop}px;
                        right: ${tooltipRight}px;
                        transform: translateY(-100%);
                        background: rgba(20, 20, 20, 0.98);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        border: 1px solid rgba(0, 255, 255, 0.3);
                        border-radius: 8px;
                        padding: 12px;
                        min-width: 250px;
                        max-width: 350px;
                        max-height: 400px;
                        overflow-y: auto;
                        z-index: 99999;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                        color: #00ffff;
                        font-size: 12px;
                        line-height: 1.6;
                        pointer-events: auto;
                    `;
                    
                    const formatTime = (timestamp) => {
                        const date = new Date(timestamp);
                        const now = new Date();
                        const diff = now - date;
                        const minutes = Math.floor(diff / 60000);
                        const hours = Math.floor(diff / 3600000);
                        const days = Math.floor(diff / 86400000);
                        
                        if (minutes < 1) return 'Just now';
                        if (minutes < 60) return `${minutes}m ago`;
                        if (hours < 24) return `${hours}h ago`;
                        if (days < 7) return `${days}d ago`;
                        return date.toLocaleDateString();
                    };
                    
                    if (coinHistory.length === 0) {
                        tooltip.innerHTML = `
                            <div style="
                                font-weight: bold;
                                margin-bottom: 8px;
                                padding-bottom: 8px;
                                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                                color: #00ffff;
                            ">Coin History</div>
                            <div style="color: #888; text-align: center; padding: 20px;">No coin history yet</div>
                        `;
                    } else {
                        const historyHTML = coinHistory.slice(0, 20).map(entry => {
                            const bonus = entry.amount > entry.baseAmount ? ` (+${entry.amount - entry.baseAmount} bonus)` : '';
                            return `
                                <div style="
                                    padding: 6px 0;
                                    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <span style="color: #00ffff;">🪙 +${entry.amount}${bonus}</span>
                                    <span style="color: #888; font-size: 11px;">${formatTime(entry.timestamp)}</span>
                                </div>
                            `;
                        }).join('');
                        
                        tooltip.innerHTML = `
                            <div style="
                                font-weight: bold;
                                margin-bottom: 8px;
                                padding-bottom: 8px;
                                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                                color: #00ffff;
                            ">Coin History</div>
                            <div>${historyHTML}</div>
                        `;
                    }
                    
                    document.body.appendChild(tooltip);
                    
                    // Keep tooltip visible when hovering over it
                    tooltip.addEventListener('mouseenter', () => {
                        // Keep visible
                    });
                    tooltip.addEventListener('mouseleave', () => {
                        if (tooltip) {
                            tooltip.remove();
                            tooltip = null;
                        }
                    });
                } catch (error) {
                    console.error('[MMS] Error showing coin history tooltip:', error);
                }
            });
            
            coinBalance.addEventListener('mouseleave', (e) => {
                // Only hide if not moving to tooltip
                if (tooltip && (!e.relatedTarget || !tooltip.contains(e.relatedTarget))) {
                    setTimeout(() => {
                        if (tooltip && document.body.contains(tooltip)) {
                            const isHoveringTooltip = tooltip.matches(':hover') || tooltip.contains(document.elementFromPoint(e.clientX, e.clientY));
                            const isHoveringCoin = coinBalance.matches(':hover') || coinBalance.contains(document.elementFromPoint(e.clientX, e.clientY));
                            if (!isHoveringTooltip && !isHoveringCoin) {
                                tooltip.remove();
                                tooltip = null;
                            }
                        }
                    }, 100);
                }
            });
            
            parentContainer.appendChild(coinBalance);
            window.updateCoinBalanceUI(STORAGE_KEYS, GM_getValue(STORAGE_KEYS.USER_COINS, 0));
        }

        // Initializer for settings
        addSettingsButton();
    }

    // Make the main initializer function globally accessible
    window.initSettingsPanel = initSettingsPanel;

})();