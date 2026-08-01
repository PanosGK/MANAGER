/**
 * Unit tests for signed coin change formatting (credits + / debits -).
 * Mirrors the contract of window.formatSignedCoinDelta / formatCoinChangeMessage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function formatSignedCoinDelta(amount) {
    const n = Math.trunc(Number(amount));
    if (!Number.isFinite(n) || n === 0) return '0';
    return n > 0 ? `+${n}` : String(n);
}

function formatCoinChangeMessage(amount, noun = 'coins') {
    return `${formatSignedCoinDelta(amount)} ${noun}`;
}

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

const cases = [
    [50, '+50'],
    [-50, '-50'],
    [0, '0'],
    [12.9, '+12'],
    [-7.2, '-7'],
    ['25', '+25'],
    ['-25', '-25'],
    [NaN, '0'],
    [null, '0'],
    [undefined, '0'],
];

let passed = 0;
for (const [input, expected] of cases) {
    assertEqual(formatSignedCoinDelta(input), expected, `formatSignedCoinDelta(${JSON.stringify(input)})`);
    passed += 1;
}

assertEqual(formatCoinChangeMessage(50), '+50 coins', 'credit message');
assertEqual(formatCoinChangeMessage(-50), '-50 coins', 'debit message');
assertEqual(formatCoinChangeMessage(50, 'Fixer-Coins'), '+50 Fixer-Coins', 'custom noun');
passed += 3;

// Source guards — history tooltip must not hardcode a leading "+"
const settingsSrc = fs.readFileSync(path.join(root, 'myman_settings.js'), 'utf8');
if (settingsSrc.includes('+${entry.amount}')) {
    throw new Error('myman_settings.js still hardcodes +${entry.amount} in coin history');
}
if (!settingsSrc.includes('formatSignedCoinDelta')) {
    throw new Error('myman_settings.js should use formatSignedCoinDelta for coin history');
}

const utilsSrc = fs.readFileSync(path.join(root, 'myman_utils.js'), 'utf8');
if (!utilsSrc.includes('function formatSignedCoinDelta')) {
    throw new Error('myman_utils.js missing formatSignedCoinDelta');
}
if (!utilsSrc.includes('window.formatSignedCoinDelta')) {
    throw new Error('myman_utils.js must export formatSignedCoinDelta on window');
}

const gamificationSrc = fs.readFileSync(path.join(root, 'myman_gamification.js'), 'utf8');
if (!gamificationSrc.includes('function spendCoins')) {
    throw new Error('myman_gamification.js missing spendCoins');
}
if (!/recordCoinHistory\(STORAGE_KEYS,\s*-cost/.test(gamificationSrc)
    && !gamificationSrc.includes('recordCoinHistory(STORAGE_KEYS, -cost')) {
    throw new Error('spendCoins should record negative coin history');
}

console.log(`[test-coin-sign] ${passed} assertions passed`);
