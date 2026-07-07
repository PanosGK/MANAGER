// ==UserScript==
// @name         MyManager Utils
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Utility functions for MyManager All-in-One Suite.
// @author       Gkorogias
// @match        *://thefixers.mymanager.gr/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // ===================================================================
    // === UTILITY FUNCTIONS
    // ===================================================================

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Displays a temporary positive message in the center of the screen.
     * @param {string} message The message to display.
     */
    function showPositiveMessage(message) {
        let msgEl = document.getElementById('tm-positive-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.id = 'tm-positive-message';
            document.body.appendChild(msgEl);
        }
        msgEl.textContent = message;
        msgEl.style.opacity = '1';
        setTimeout(() => {
            msgEl.style.opacity = '0';
            setTimeout(() => {
                if (msgEl.parentElement) msgEl.parentElement.removeChild(msgEl);
            }, 500); // Wait for fade out
        }, 2000); // Display for 2 seconds
    }

    /**
     * Creates a confetti explosion animation.
     * @param {number} [count=50] The number of confetti particles.
     */
    function triggerConfetti(count = 50) {
        const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'tm-confetti-particle';
            const x = Math.random() * 100; // vw
            const delay = Math.random() * 0.5; // seconds
            const duration = 2 + Math.random() * 2; // seconds

            particle.style.left = `${x}vw`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.transform = `scale(${0.5 + Math.random()})`;

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), duration * 1000 + delay * 1000);
        }
    }

    /**
     * Checks if the current time is within the configured working hours and days.
     * @returns {boolean} True if it's currently working time, false otherwise.
     */
    function isWorkingHours() {
        const now = new Date();
        const day = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        const hour = now.getHours();

        const isWorkingDay = config.workingDays.includes(day);
        // End hour 24 means up to 23:59:59
        const endHourCheck = config.workingHoursEnd === 24 ? 24 : config.workingHoursEnd;
        const isWorkingTime = hour >= config.workingHoursStart && hour < endHourCheck;

        return isWorkingDay && isWorkingTime;
    }

    /**
     * Cleans a raw device model name by removing prefixes, colors, and other noise.
     * @param {string} rawName The raw model name string.
     * @returns {string|null} The cleaned model name or null.
     */
    function cleanModelName(rawName) {
        if (!rawName) return null;

        let cleanedName = rawName.toUpperCase(); // Work with uppercase for consistency


        // --- Step 1: Remove known prefixes ---
        const prefixesToRemove = [
            'KINHTO ANDROID SMARTPHONE',
            'NOTEBOOK-NETBOOK ΕΜΠΟΡΙΟΥ',
            'ΣΥΣΚΕΥΗ DIGITAL ΕΜΠΟΡΙΟΥ',
            'NOTEBOOK-NETBOOK',
            'ΚΙΝΗΤΟ', // Greek K
            'KINHTO', // Latin K
            'CONSOLE',
            'SAMSUNG',
        ];

        for (const prefix of prefixesToRemove) {
            if (cleanedName.startsWith(prefix)) {
                cleanedName = cleanedName.substring(prefix.length).trim();
                break; // Stop after finding the first matching prefix
            }
        }

        // --- Step 2: Remove color and material keywords from anywhere ---
        const keywordsToRemove = [
            // Multi-word first to ensure they are matched before single words (e.g., 'NATURAL TITANIUM' before 'NATURAL')
            'NATURAL TITANIUM', 'BLUE TITANIUM', 'WHITE TITANIUM', 'BLACK TITANIUM',
            'ROSE GOLD', 'SPACE GRAY', 'MIDNIGHT GREEN', 'DEEP PURPLE', 'SIERRA BLUE', 'ALPINE GREEN',
            // Single-word
            'NATURAL', 'TITANIUM', 'BLACK', 'WHITE', 'BLUE', 'RED', 'GREEN', 'GOLD', 'SILVER',
            'PURPLE', 'YELLOW', 'ORANGE', 'PINK', 'BRONZE', 'GRAPHITE',
            // Greek Colors and other keywords
            'ΜΑΥΡΟ', 'ΑΣΠΡΟ', 'ΜΠΛΕ', 'ΚΟΚΚΙΝΟ', 'ΠΡΑΣΙΝΟ', 'ΧΡΥΣΟ', 'ΑΣΗΜΙ',
            'ΜΩΒ', 'ΚΙΤΡΙΝΟ', 'ΠΟΡΤΟΚΑΛΙ', 'ΡΟΖ', 'samsung'
        ];

        for (const keyword of keywordsToRemove) {
            // Use a regex to remove the keyword as a whole word, case-insensitive.
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            cleanedName = cleanedName.replace(regex, '');
        }

        // --- Step 3: Transliterate Greek to Latin (AFTER removing prefixes/keywords) ---
        const greekToLatinMap = {
            'Α': 'A', 'Β': 'V', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'TH',
            'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
            'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'X', 'Ψ': 'PS', 'Ω': 'O'
        };

        // Use a single regex for efficiency
        const greekCharsRegex = new RegExp(Object.keys(greekToLatinMap).join('|'), 'g');
        cleanedName = cleanedName.replace(greekCharsRegex, (matched) => greekToLatinMap[matched]);
        // Fallback for final sigma
        cleanedName = cleanedName.replace(/Σ/g, 'S');


        // --- Step 3: Clean up extra spaces and remove trailing codes ---
        cleanedName = cleanedName.replace(/\s+/g, ' ').trim(); // Collapse multiple spaces to one
        cleanedName = cleanedName.replace(/\s*-\s*\d+\s*$/, '').trim();

        // --- Step 4: Handle adjacent duplicated words ---
        const words = cleanedName.split(' ');
        const uniqueWords = [];
        for (let i = 0; i < words.length; i++) {
            if (i === 0 || words[i] !== words[i - 1]) {
                uniqueWords.push(words[i]);
            }
        }
        cleanedName = uniqueWords.join(' ');

        return cleanedName.trim();
    }

    /**
     * Attempts to find and clean the phone model name from the current page.
     * @returns {string|null} The cleaned model name or null if not found.
     */
    function getPhoneModelFromPage() {
        let rawModel = null;

        // Try multiple selectors to find the phone model
        const selectors = [
            'div[data-fieldname="strProductName"] input',
            'div[data-fieldname="strDeviceDescription"] input',
            'input[name="strProductName"]',
            'input[name="strDeviceDescription"]',
            'input[id*="ProductName"]',
            'input[id*="DeviceDescription"]',
            '.device-model input',
            '.product-name input'
        ];

        for (const selector of selectors) {
            const modelInput = document.querySelector(selector);
            if (modelInput && modelInput.value && modelInput.value.trim()) {
                rawModel = modelInput.value.trim();
                console.log('[MMS] Found phone model via selector:', selector, '->', rawModel);
                break;
            }
        }

        // Fallback: try to get it from the page title if the input field wasn't found or was empty.
        if (!rawModel) {
            const titleElement = document.querySelector('.pagetitle, h1.page-header, h1, h2');
            if (titleElement) {
                const match = titleElement.innerText.match(/\[(.*?)\]/);
                if (match && match[1]) {
                    rawModel = match[1].trim();
                    console.log('[MMS] Found phone model from page title:', rawModel);
                }
            }
        }

        // Additional fallback: look for device model in any text content
        if (!rawModel) {
            const pageText = document.body.innerText;
            const modelMatch = pageText.match(/(iPhone|Samsung|Huawei|Xiaomi|OnePlus|Google Pixel|Sony|LG|Motorola|Nokia)[\s\w\d\-]+/i);
            if (modelMatch) {
                rawModel = modelMatch[0].trim();
                console.log('[MMS] Found phone model from page content:', rawModel);
            }
        }

        const cleanedModel = cleanModelName(rawModel);
        console.log('[MMS] Phone model detection result:', rawModel, '->', cleanedModel);
        return cleanedModel;
    }

    /**
     * Escape text for safe HTML insertion.
     */
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    let fullScreenNotifEscapeHandler = null;

    /**
     * Removes the full-screen notification overlay (if any).
     */
    function closeFullScreenNotificationOverlay() {
        const el = document.getElementById('tm-notification-fullscreen-overlay');
        if (el) el.remove();
        if (fullScreenNotifEscapeHandler) {
            document.removeEventListener('keydown', fullScreenNotifEscapeHandler);
            fullScreenNotifEscapeHandler = null;
        }
    }

    /**
     * Full-screen dimmed overlay with title/body until the user dismisses it.
     * @param {string} title
     * @param {string} body
     */
    function showFullScreenNotificationOverlay(title, body) {
        closeFullScreenNotificationOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'tm-notification-fullscreen-overlay';
        overlay.setAttribute('role', 'alertdialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'tm-fullscreen-notif-title');
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:2147483640',
            'background:rgba(0,0,0,0.72)',
            'backdrop-filter:blur(5px)',
            '-webkit-backdrop-filter:blur(5px)',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:max(16px, env(safe-area-inset-top))',
            'box-sizing:border-box',
        ].join(';');

        const safeTitle = escapeHtml(title);
        const safeBody = escapeHtml(body).replace(/\n/g, '<br>');

        overlay.innerHTML = `
            <div class="tm-fullscreen-notif-card" style="background:var(--tm-bg-color,#1a1a2e);color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:24px 28px;max-width:min(520px,calc(100vw - 32px));max-height:min(75vh,calc(100vh - 32px));overflow:auto;box-shadow:0 12px 48px rgba(0,0,0,0.55);box-sizing:border-box;">
                <h2 id="tm-fullscreen-notif-title" style="margin:0 0 12px;font-size:18px;line-height:1.35;font-weight:700;">${safeTitle}</h2>
                <div style="font-size:15px;line-height:1.55;color:rgba(255,255,255,0.9);margin-bottom:20px;">${safeBody}</div>
                <button type="button" id="tm-fullscreen-notif-dismiss" style="width:100%;padding:12px 16px;border-radius:10px;border:none;background:linear-gradient(135deg,#4facfe,#00f2fe);color:#0a0a12;font-weight:700;cursor:pointer;font-size:15px;">
                    Κατάλαβα / Κλείσιμο
                </button>
            </div>
        `;

        const dismiss = () => closeFullScreenNotificationOverlay();

        overlay.querySelector('#tm-fullscreen-notif-dismiss').addEventListener('click', (e) => {
            e.stopPropagation();
            dismiss();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) dismiss();
        });

        overlay.querySelector('.tm-fullscreen-notif-card').addEventListener('click', (e) => e.stopPropagation());

        fullScreenNotifEscapeHandler = (e) => {
            if (e.key === 'Escape') dismiss();
        };
        document.addEventListener('keydown', fullScreenNotifEscapeHandler);

        document.body.appendChild(overlay);

        const btn = overlay.querySelector('#tm-fullscreen-notif-dismiss');
        if (btn && typeof btn.focus === 'function') {
            setTimeout(() => btn.focus(), 0);
        }
    }

    /**
     * Requests permission for and shows a desktop notification, plus a blocking full-screen in-page alert until dismissed.
     * @param {string} title The title of the notification.
     * @param {string} body The body text of the notification.
     */
    function showNotification(title, body) {
        showFullScreenNotificationOverlay(title, body);

        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(title, { body: body, icon: 'https://www.google.com/s2/favicons?domain=thefixers.mymanager.gr' });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body: body, icon: 'https://www.google.com/s2/favicons?domain=thefixers.mymanager.gr' });
                }
            });
        }
    }

    // Make functions globally accessible for other scripts
    window.debounce = debounce;
    window.showPositiveMessage = showPositiveMessage;
    window.triggerConfetti = triggerConfetti;
    window.isWorkingHours = isWorkingHours;
    window.cleanModelName = cleanModelName;
    window.getPhoneModelFromPage = getPhoneModelFromPage;
    window.showNotification = showNotification;
    window.closeFullScreenNotificationOverlay = closeFullScreenNotificationOverlay;

    /**
     * Helper function to format time ago
     */
    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'μόλις τώρα';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} λεπτά πριν`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ώρες πριν`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} μέρες πριν`;

        return new Date(timestamp).toLocaleDateString('el-GR');
    }
    window.getTimeAgo = getTimeAgo;

    /**
     * Calculate repair age from date string
     */
    function calculateRepairAge(dateText) {
        if (!dateText) return null;

        try {
            // Parse Greek date format (dd/mm/yyyy)
            const dateParts = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (!dateParts) return null;

            const day = parseInt(dateParts[1]);
            const month = parseInt(dateParts[2]) - 1; // JS months are 0-indexed
            const year = parseInt(dateParts[3]);

            const repairDate = new Date(year, month, day);
            const now =  new Date();

            // Calculate days difference
            const diffTime = now - repairDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Determine color and label based on age
            let color, label, rowBg;

            if (diffDays <= 2) { color = '#28a745'; label = '🟢 Νέα'; rowBg = 'rgba(40, 167, 69, 0.05)';
            } else if (diffDays <= 5) { color = '#ffc107'; label = '🟡 Πρόσφατη'; rowBg = 'rgba(255, 193, 7, 0.08)';
            } else if (diffDays <= 10) { color = '#fd7e14'; label = '🟠 Παλιά'; rowBg = 'rgba(253, 126, 20, 0.1)';
            } else { color = '#dc3545'; label = `🔴 ${diffDays}μ`; rowBg = 'rgba(220, 53, 69, 0.12)'; }

            return { days: diffDays, color: color, label: label, rowBg: rowBg };
        } catch (e) {
            console.error('[MMS] Error parsing date:', dateText, e);
            return null;
        }
    }
    window.calculateRepairAge = calculateRepairAge;

    function parseScriptVersion(version) {
        const n = parseInt(String(version).replace(/\D/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    }

    function resolveManifestUrls() {
        const meta = window.SCRIPT_META || {};
        const fromBase = meta.updateBase
            ? `${String(meta.updateBase).replace(/\/$/, '')}/myman_manifest.json`
            : null;
        return [...new Set([
            meta.manifestUrl,
            fromBase,
            'https://raw.githubusercontent.com/PanosGK/MANAGER/refs/heads/main/myman_manifest.json'
        ].filter(Boolean))];
    }

    function getScriptXhr() {
        if (typeof GM_xmlhttpRequest === 'function') return GM_xmlhttpRequest;
        if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') {
            return GM.xmlHttpRequest.bind(GM);
        }
        return null;
    }

    /**
     * Compare installed script version with myman_manifest.json on GitHub.
     * @param {Function} callback ({ current, remote, updateAvailable, releaseNotes, error, status, url })
     */
    function checkForScriptUpdate(callback) {
        const meta = window.SCRIPT_META || {};
        const urls = resolveManifestUrls();
        const xhr = getScriptXhr();

        if (!urls.length) {
            callback({ error: 'no_manifest' });
            return;
        }
        if (!xhr) {
            callback({ error: 'no_xhr' });
            return;
        }

        const current = meta.version || '?';

        const tryUrl = (index) => {
            if (index >= urls.length) {
                callback({ error: 'network', url: urls[0], current });
                return;
            }

            const baseUrl = urls[index];
            const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;

            xhr({
                method: 'GET',
                url,
                onload(response) {
                    if (response.status !== 200) {
                        tryUrl(index + 1);
                        return;
                    }
                    try {
                        const remoteManifest = JSON.parse(response.responseText);
                        const remote = remoteManifest.version;
                        callback({
                            current,
                            remote,
                            updateAvailable: parseScriptVersion(remote) > parseScriptVersion(current),
                            releaseNotes: remoteManifest.releaseNotes || '',
                            manifestUrl: baseUrl
                        });
                    } catch (e) {
                        callback({ error: 'parse', status: response.status, url: baseUrl, current });
                    }
                },
                onerror() {
                    tryUrl(index + 1);
                }
            });
        };

        tryUrl(0);
    }

    window.checkForScriptUpdate = checkForScriptUpdate;

    const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
    let updateCheckTimer = null;
    let lastUpdateResult = null;

    function getSkippedUpdateKey() {
        return window.STORAGE_KEYS?.SKIPPED_UPDATE_VERSION || 'tm_skipped_update_version';
    }

    function getUpdateBannerDismissedKey() {
        return 'tm_update_banner_dismissed_version';
    }

    function getScriptUpdateNotificationId(remoteVersion) {
        return `script_update_v${String(remoteVersion)}`;
    }

    function isAutoUpdateCheckEnabled() {
        return GM_getValue('autoUpdateCheckEnabled', true) !== false;
    }

    function getSkippedUpdateVersion() {
        return String(GM_getValue(getSkippedUpdateKey(), '') || '');
    }

    function skipUpdateVersion(version) {
        if (version == null || version === '') return;
        GM_setValue(getSkippedUpdateKey(), String(version));
        hideScriptUpdateNotification();
    }

    function clearSkippedUpdateVersion() {
        GM_deleteValue(getSkippedUpdateKey());
    }

    function isUpdateVersionSkipped(remoteVersion) {
        const skipped = getSkippedUpdateVersion();
        if (!skipped || remoteVersion == null) return false;
        return parseScriptVersion(remoteVersion) <= parseScriptVersion(skipped);
    }

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatUpdateStatusMessage(result) {
        if (!result) return '—';
        if (result.error === 'network') {
            return `❌ Αποτυχία σύνδεσης με το GitHub (${result.url || 'manifest'}).`;
        }
        if (result.error === 'no_xhr') {
            return '❌ Το Tampermonkey δεν επιτρέπει αίτημα προς GitHub. Ελέγξτε ότι το script έχει @grant GM_xmlhttpRequest.';
        }
        if (result.error) {
            return `❌ Δεν ήταν δυνατός ο έλεγχος ενημέρωσης (HTTP ${result.status || '?'}).`;
        }
        if (result.updateAvailable) {
            let msg = `✨ Διαθέσιμη νέα έκδοση <strong>v${escapeHtml(result.remote)}</strong> (έχετε v${escapeHtml(result.current)}).<br>Πηγαίνετε στο Tampermonkey → Dashboard → Έλεγχος για ενημερώσεων.`;
            if (result.releaseNotes) {
                msg += `<br><span style="opacity:0.85;">${escapeHtml(result.releaseNotes)}</span>`;
            }
            return msg;
        }
        return `✅ Έχετε την τελευταία έκδοση (v${escapeHtml(result.current)}).`;
    }

    function hideScriptUpdateNotification() {
        document.getElementById('tm-script-update-notification')?.remove();
    }

    function isUpdateBannerDismissed(remoteVersion) {
        const dismissed = String(GM_getValue(getUpdateBannerDismissedKey(), '') || '');
        if (!dismissed || remoteVersion == null) return false;
        return parseScriptVersion(remoteVersion) <= parseScriptVersion(dismissed);
    }

    function dismissScriptUpdateBanner(remoteVersion) {
        if (remoteVersion != null && remoteVersion !== '') {
            GM_setValue(getUpdateBannerDismissedKey(), String(remoteVersion));
        }
        hideScriptUpdateNotification();
    }

    function ensureScriptUpdateCenterNotification(result) {
        if (!result?.remote || typeof window.createNotification !== 'function') return;
        window.createNotification(
            `Νέα έκδοση script v${result.remote} διαθέσιμη`,
            '🔄',
            { id: getScriptUpdateNotificationId(result.remote) }
        );
    }

    function showScriptUpdateNotification(result) {
        if (!result?.updateAvailable || isUpdateVersionSkipped(result.remote)) {
            hideScriptUpdateNotification();
            return;
        }

        ensureScriptUpdateCenterNotification(result);

        if (isUpdateBannerDismissed(result.remote)) return;

        const existingBanner = document.getElementById('tm-script-update-notification');
        if (existingBanner?.dataset.remoteVersion === String(result.remote)) return;

        hideScriptUpdateNotification();

        const container = document.createElement('div');
        container.id = 'tm-script-update-notification';
        container.dataset.remoteVersion = String(result.remote);
        container.setAttribute('role', 'alert');
        container.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 2147483646;
            max-width: 380px;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%);
            color: #f1f5f9;
            border: 1px solid rgba(96, 165, 250, 0.45);
            border-radius: 12px;
            padding: 14px 16px;
            box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35);
            font-size: 13px;
            line-height: 1.45;
        `;

        const notes = result.releaseNotes
            ? `<div style="margin-top: 6px; font-size: 12px; opacity: 0.88;">${escapeHtml(result.releaseNotes)}</div>`
            : '';

        container.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 22px; line-height: 1;">🔄</span>
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 4px;">Νέα έκδοση script διαθέσιμη</strong>
                    <span>v${escapeHtml(result.current)} → <strong>v${escapeHtml(result.remote)}</strong></span>
                    ${notes}
                    <div style="margin-top: 6px; font-size: 12px; opacity: 0.8;">Tampermonkey → Dashboard → Έλεγχος για ενημερώσεων</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                <button type="button" id="tm-update-hide-btn" style="flex: 1; min-width: 100px; padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.08); color: #e2e8f0; cursor: pointer;">Απόκρυψη</button>
                <button type="button" id="tm-update-skip-btn" style="flex: 1; min-width: 100px; padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(248, 113, 113, 0.5); background: rgba(248, 113, 113, 0.15); color: #fecaca; cursor: pointer;">Παράλειψη v${escapeHtml(result.remote)}</button>
            </div>
        `;

        container.querySelector('#tm-update-hide-btn')?.addEventListener('click', () => {
            dismissScriptUpdateBanner(result.remote);
        });
        container.querySelector('#tm-update-skip-btn')?.addEventListener('click', () => {
            skipUpdateVersion(result.remote);
        });

        document.body.appendChild(container);
    }

    function handleUpdateCheckResult(result, options = {}) {
        const { silent = false, showBanner = true } = options;
        lastUpdateResult = result;

        try {
            window.dispatchEvent(new CustomEvent('mms-update-check', { detail: result }));
        } catch (_) { /* ignore */ }

        if (result?.error) return result;

        if (result.updateAvailable && !isUpdateVersionSkipped(result.remote)) {
            if (showBanner) showScriptUpdateNotification(result);
            if (!silent && typeof showPositiveMessage === 'function') {
                showPositiveMessage(`Νέα έκδοση v${result.remote} διαθέσιμη!`);
            }
        } else if (!result.updateAvailable) {
            hideScriptUpdateNotification();
            GM_deleteValue(getUpdateBannerDismissedKey());
        }

        return result;
    }

    function runScriptUpdateCheck(options = {}) {
        return new Promise((resolve) => {
            if (typeof checkForScriptUpdate !== 'function') {
                const err = { error: 'no_checker' };
                resolve(handleUpdateCheckResult(err, options));
                return;
            }
            checkForScriptUpdate((result) => {
                resolve(handleUpdateCheckResult(result, options));
            });
        });
    }

    function stopScriptUpdateChecker() {
        if (updateCheckTimer) {
            clearInterval(updateCheckTimer);
            updateCheckTimer = null;
        }
    }

    function initScriptUpdateChecker() {
        stopScriptUpdateChecker();
        if (!isAutoUpdateCheckEnabled()) return;

        setTimeout(() => {
            runScriptUpdateCheck({ silent: true, showBanner: true });
        }, 30000);

        updateCheckTimer = setInterval(() => {
            runScriptUpdateCheck({ silent: true, showBanner: true });
        }, UPDATE_CHECK_INTERVAL_MS);
    }

    window.runScriptUpdateCheck = runScriptUpdateCheck;
    window.initScriptUpdateChecker = initScriptUpdateChecker;
    window.stopScriptUpdateChecker = stopScriptUpdateChecker;
    window.showScriptUpdateNotification = showScriptUpdateNotification;
    window.hideScriptUpdateNotification = hideScriptUpdateNotification;
    window.skipUpdateVersion = skipUpdateVersion;
    window.clearSkippedUpdateVersion = clearSkippedUpdateVersion;
    window.getSkippedUpdateVersion = getSkippedUpdateVersion;
    window.formatUpdateStatusMessage = formatUpdateStatusMessage;
    window.getLastScriptUpdateResult = () => lastUpdateResult;

})();