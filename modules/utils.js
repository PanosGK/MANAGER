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
        const regex = new RegExp(`\b${keyword}\b`, 'gi');
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
    // Try to find the model from common field names on the page.
    const modelInput = document.querySelector('div[data-fieldname="strProductName"] input, div[data-fieldname="strDeviceDescription"] input');
    if (modelInput && modelInput.value) {
        rawModel = modelInput.value.trim();
    }

    // Fallback: try to get it from the page title if the input field wasn't found or was empty.
    if (!rawModel) {
        const titleElement = document.querySelector('.pagetitle, h1.page-header, h1, h2');
        if (titleElement) {
            const match = titleElement.innerText.match(/.*\[(.*?)\].*/);
            if (match && match[1]) {
                rawModel = match[1].trim();
            }
        }
    }

    return cleanModelName(rawModel);
}

/**
 * Requests permission for and shows a desktop notification.
 * @param {string} title The title of the notification.
 * @param {string} body The body text of the notification.
 */
function showNotification(title, body) {
    if (!("Notification" in window)) {
        alert(`Reminder: ${body}`); // Fallback for browsers without Notification API
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

// Make functions globally accessible for external scripts
window.showPositiveMessage = showPositiveMessage;
window.triggerConfetti = triggerConfetti;
