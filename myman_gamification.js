// This script is intended to be used as a library via the @require directive
// in the main "MyManager All-in-One Suite" script. It does not do anything on its own.

// ===================================================================
// === FUN FEATURE: LEVEL UP SYSTEM
// ===================================================================

const SHOP_ITEMS = {
    BOUNTY_COMPLETE_TOKEN: 'bounty_complete_token',
    // Add other item IDs here for easy reference
};

const MASCOT_CONSUMABLE_DESC_PATTERN = /\b(hunger|happiness)\b|both stats|max stats|max hunger|max happiness/i;

function isMascotShopConsumable(item) {
    if (item.mascotOnly) return true;
    const desc = item.desc || '';
    return MASCOT_CONSUMABLE_DESC_PATTERN.test(desc);
}

function isInteractiveMascotShopEnabled(config) {
    return config?.interactiveMascotEnabled !== false;
}

function getShopAccessoryItems() {
    return [
        { id: 'top_hat', name: 'Top Hat', icon: '🎩', cost: 250, type: 'accessory' },
        { id: 'cowboy_hat', name: 'Cowboy Hat', icon: '🤠', cost: 300, type: 'accessory' },
        { id: 'party_hat', name: 'Party Hat', icon: '🎊', cost: 200, type: 'accessory' },
        { id: 'wizard_hat', name: 'Wizard Hat', icon: '🧙', cost: 500, type: 'accessory' },
        { id: 'chef_hat', name: 'Chef Hat', icon: '👨‍🍳', cost: 350, type: 'accessory' },
        { id: 'halo', name: 'Angel Halo', icon: '😇', cost: 800, type: 'accessory' },
        { id: 'cool_shades', name: 'Cool Shades', icon: '😎', cost: 350, type: 'accessory' },
        { id: 'nerd_glasses', name: 'Nerd Glasses', icon: '🤓', cost: 300, type: 'accessory' },
        { id: 'monocle', name: 'Fancy Monocle', icon: '🧐', cost: 400, type: 'accessory' },
        { id: 'rainy_day_umbrella', name: 'Rainy Day Umbrella', icon: '☂️', cost: 350, type: 'accessory' },
        { id: 'beach_umbrella', name: 'Beach Umbrella', icon: '🏖️', cost: 400, type: 'accessory' },
        { id: 'bookworm_kit', name: 'Bookworm Kit', icon: '📚', cost: 300, type: 'accessory' },
        { id: 'stunt_bike', name: 'Stunt Bike', icon: '🚲', cost: 750, type: 'accessory' },
        { id: 'juggling_balls', name: 'Juggling Balls', icon: '🤹', cost: 400, type: 'accessory' },
        { id: 'jetpack', name: 'Jetpack', icon: '🚀', cost: 1200, type: 'accessory' },
        { id: 'skateboard', name: 'Skateboard', icon: '🛹', cost: 600, type: 'accessory' },
        { id: 'magic_wand', name: 'Magic Wand', icon: '🪄', cost: 550, type: 'accessory' },
        { id: 'camera', name: 'Camera', icon: '📸', cost: 450, type: 'accessory' },
        { id: 'microphone', name: 'Microphone', icon: '🎤', cost: 500, type: 'accessory' },
        { id: 'guitar', name: 'Guitar', icon: '🎸', cost: 700, type: 'accessory' },
        { id: 'santa_hat', name: 'Santa Hat', icon: '🎅', cost: 600, type: 'accessory' },
        { id: 'flower_crown', name: 'Flower Crown', icon: '🌸', cost: 400, type: 'accessory' },
        { id: 'laurel_wreath', name: 'Laurel Wreath', icon: '🏆', cost: 900, type: 'accessory' },
        { id: 'devil_horns', name: 'Devil Horns', icon: '😈', cost: 666, type: 'accessory' },
        { id: 'ninja_mask', name: 'Ninja Mask', icon: '🥷', cost: 750, type: 'accessory' },
        { id: 'master_crown', name: 'Master\'s Crown', icon: '👑', cost: 10000, type: 'accessory' },
        { id: 'diamond_ring', name: 'Diamond Ring', icon: '💎', cost: 5000, type: 'accessory' },
        { id: 'golden_trophy', name: 'Golden Trophy', icon: '🥇', cost: 3000, type: 'accessory' },
        { id: 'rainbow_wings', name: 'Rainbow Wings', icon: '🌈', cost: 2500, type: 'accessory' },
        { id: 'power_glove', name: 'Power Glove', icon: '🔥', cost: 1500, type: 'accessory' },
        { id: 'vip_pass', name: 'VIP Pass', icon: '🎫', cost: 2000, type: 'accessory' },
    ];
}

function getShopConsumableItems(config) {
    const items = [
        { id: 'eod_checklist', name: 'End of Day Checklist', icon: '🌙', cost: 800, type: 'feature',
          desc: 'Adds a 📋 button to the footer. Shows all repairs you visited today so you can review and check them off before leaving.' },
        { id: 'reroll_token', name: 'Bounty Reroll Token', icon: '🔄', cost: 100, type: 'consumable', desc: 'Reroll daily bounty' },
        { id: SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, name: 'Bounty Completion Token', icon: '🎯', cost: 300, type: 'consumable', desc: 'Instantly complete bounty' },
        { id: 'confetti_bomb', name: 'Confetti Bomb', icon: '🎉', cost: 25, type: 'consumable', desc: 'Party celebration!' },
        { id: 'happiness_snack', name: 'Happiness Snack', icon: '💖', cost: 50, type: 'consumable', desc: 'Max happiness' },
        { id: 'hunger_meal', name: 'Hunger Meal', icon: '🍱', cost: 50, type: 'consumable', desc: 'Max hunger' },
        { id: 'super_meal', name: 'Super Meal', icon: '🍜', cost: 100, type: 'consumable', desc: 'Max hunger + happiness' },
        { id: 'pizza_slice', name: 'Pizza Slice', icon: '🍕', cost: 60, type: 'consumable', desc: '+40 hunger, +20 happiness' },
        { id: 'burger_combo', name: 'Burger Combo', icon: '🍔', cost: 70, type: 'consumable', desc: '+40 hunger, +20 happiness' },
        { id: 'ice_cream', name: 'Ice Cream', icon: '🍦', cost: 40, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'donut', name: 'Donut', icon: '🍩', cost: 35, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'cookie', name: 'Cookie', icon: '🍪', cost: 30, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'chocolate_bar', name: 'Chocolate Bar', icon: '🍫', cost: 45, type: 'consumable', desc: '+15 hunger, +30 happiness' },
        { id: 'sushi_platter', name: 'Sushi Platter', icon: '🍣', cost: 120, type: 'consumable', desc: '+60 hunger, +40 happiness' },
        { id: 'energized_drink', name: 'Energized Drink', icon: '⚡️', cost: 150, type: 'consumable', desc: '15 min energized buff' },
        { id: 'coffee', name: 'Coffee', icon: '☕', cost: 50, type: 'consumable', desc: '5 min energized buff' },
        { id: 'smoothie', name: 'Smoothie', icon: '🥤', cost: 75, type: 'consumable', desc: '+20 hunger, +30 happiness' },
        { id: 'health_potion', name: 'Health Potion', icon: '🧪', cost: 100, type: 'consumable', desc: '+50 to both stats' },
        { id: 'mana_potion', name: 'Mana Potion', icon: '🔮', cost: 120, type: 'consumable', desc: '+50 to both stats' },
        { id: 'speed_potion', name: 'Speed Potion', icon: '💨', cost: 130, type: 'consumable', desc: '8 min energized buff' },
        { id: 'lucky_potion', name: 'Lucky Potion', icon: '🍀', cost: 180, type: 'consumable', desc: '5 min double coins' },
        { id: 'rainbow_juice', name: 'Rainbow Juice', icon: '🌈', cost: 200, type: 'consumable', desc: 'Max stats + confetti' },
        { id: 'golden_elixir', name: 'Golden Elixir', icon: '✨', cost: 250, type: 'consumable', desc: 'Max stats + 20 min buff' },
        { id: 'double_coins_voucher', name: 'Double Coins Voucher', icon: '💰', cost: 200, type: 'consumable', desc: '10 min double coins' },
        { id: 'xp_boost_small', name: 'Small XP Boost', icon: '📈', cost: 150, type: 'consumable', desc: 'Instant +100 XP' },
        { id: 'xp_boost_medium', name: 'Medium XP Boost', icon: '📊', cost: 250, type: 'consumable', desc: 'Instant +250 XP' },
        { id: 'xp_boost_large', name: 'Large XP Boost', icon: '💹', cost: 400, type: 'consumable', desc: 'Instant +500 XP' },
        { id: 'coin_magnet', name: 'Coin Magnet', icon: '🧲', cost: 180, type: 'consumable', desc: '7 min double coins' },
        { id: 'lucky_coin', name: 'Lucky Coin', icon: '🪙', cost: 170, type: 'consumable', desc: '7 min double coins' },
        { id: 'fireworks', name: 'Fireworks', icon: '🎆', cost: 100, type: 'consumable', desc: 'Huge celebration!', mascotOnly: true },
        { id: 'sparkles', name: 'Sparkles', icon: '✨', cost: 80, type: 'consumable', desc: 'Sparkly effect' },
        { id: 'rainbow_trail', name: 'Rainbow Trail', icon: '🌈', cost: 150, type: 'consumable', desc: 'Rainbow + 50 happiness' },
        { id: 'snow_globe', name: 'Snow Globe', icon: '❄️', cost: 120, type: 'consumable', desc: 'Snow celebration' },
        { id: 'bubble_blast', name: 'Bubble Blast', icon: '🫧', cost: 90, type: 'consumable', desc: 'Bubble party' },
        { id: 'star_shower', name: 'Star Shower', icon: '🌟', cost: 130, type: 'consumable', desc: 'Starry effect' },
        { id: 'heart_explosion', name: 'Heart Explosion', icon: '💕', cost: 110, type: 'consumable', desc: 'Hearts + 80 happiness' },
        { id: 'disco_ball', name: 'Disco Ball', icon: '🪩', cost: 200, type: 'consumable', desc: 'Ultimate party!', mascotOnly: true },
        { id: 'time_warp', name: 'Time Warp', icon: '⏰', cost: 300, type: 'consumable', desc: '30 min buff + 200 XP' },
        { id: 'shield_buff', name: 'Shield Buff', icon: '🛡️', cost: 250, type: 'consumable', desc: 'Max both stats' },
        { id: 'magnet_buff', name: 'Magnet Buff', icon: '🧲', cost: 220, type: 'consumable', desc: '15 min double coins' },
        { id: 'focus_boost', name: 'Focus Boost', icon: '🎯', cost: 280, type: 'consumable', desc: '25 min buff + 150 XP' },
        { id: 'productivity_pill', name: 'Productivity Pill', icon: '💊', cost: 350, type: 'consumable', desc: '25 min buff + 150 XP' },
        { id: 'inspiration_spark', name: 'Inspiration Spark', icon: '💡', cost: 320, type: 'consumable', desc: '300 XP + confetti' },
        { id: 'turbo_mode', name: 'Turbo Mode', icon: '🚀', cost: 400, type: 'consumable', desc: '20 min double buff' },
        { id: 'mega_boost', name: 'Mega Boost', icon: '⚡', cost: 500, type: 'consumable', desc: '30 min full buff + 500 XP' },
    ];
    if (isInteractiveMascotShopEnabled(config)) return items;
    return items.filter(item => !isMascotShopConsumable(item));
}

const XP_CONFIG = {
    searches: 5,
    repairsCompleted: 50,
    ordersCreated: 20,
    achievement: 100, // Bonus for unlocking any achievement
    statusChange: 15, // For any repair status change
    printOrder: 25, // For printing an order/repair ticket
    viewTechStats: 10, // For opening the technician stats modal
    viewCustomerHistory: 10, // For opening the customer history modal
    setScratchpadReminder: 20, // For setting a reminder in the scratchpad
    feedMascot: 5, // For feeding the interactive mascot
    petMascot: 5, // For petting the interactive mascot
    memoryGame: 15, // Base XP for playing the memory mini-game
    bugSquishGame: 30, // Base XP for playing the bug squish mini-game
};

const QUEST_POOL = [
    { id: 'complete_3_repairs', description: 'Complete 3 repairs', targetStat: 'repairsCompleted', targetCount: 3, rewardXp: 150, rewardCoins: 50 },
    { id: 'create_5_orders', description: 'Create 5 new orders', targetStat: 'ordersCreated', targetCount: 5, rewardXp: 100, rewardCoins: 30 },
    { id: 'search_10_times', description: 'Use Advanced Search 10 times', targetStat: 'searches', targetCount: 10, rewardXp: 75, rewardCoins: 15 },
    { id: 'pet_mascot_5_times', description: 'Pet the mascot 5 times', targetStat: 'petMascot', targetCount: 5, rewardXp: 50, rewardCoins: 10 },
    { id: 'feed_mascot_3_times', description: 'Feed the mascot 3 times', targetStat: 'feedMascot', targetCount: 3, rewardXp: 40, rewardCoins: 10 },
    { id: 'change_5_statuses', description: 'Change the status of 5 repairs', targetStat: 'statusChanges', targetCount: 5, rewardXp: 80, rewardCoins: 20 },
    { id: 'print_2_orders', description: 'Print 2 order tickets', targetStat: 'printOrder', targetCount: 2, rewardXp: 50, rewardCoins: 15 },
    { id: 'view_5_histories', description: 'View customer history 5 times', targetStat: 'viewCustomerHistory', targetCount: 5, rewardXp: 60, rewardCoins: 15 },
    { id: 'play_2_games', description: 'Play any mini-game 2 times', targetStat: 'anyGamePlayed', targetCount: 2, rewardXp: 70, rewardCoins: 25 },
    { id: 'earn_100_xp', description: 'Earn 100 XP from any source', targetStat: 'xpEarned', targetCount: 100, rewardXp: 100, rewardCoins: 30 },
    { id: 'earn_20_coins', description: 'Earn 20 Fixer-Coins', targetStat: 'coinsEarned', targetCount: 20, rewardXp: 50, rewardCoins: 50 },
];

// Unified constant for all ranks and titles.
const RANKS = [
    { level: 1,   title: 'Novice Tech',             color: '#d1d1d1' },
    { level: 5,   title: 'Component Handler',       color: '#d1d1d1' },
    { level: 10,  title: 'Adept Troubleshooter',    color: '#1eff00' },
    { level: 15,  title: 'Screen Specialist',       color: '#1eff00' },
    { level: 20,  title: 'Microsoldering Master',   color: '#0070dd' },
    { level: 25,  title: 'Data Recovery Agent',     color: '#0070dd' },
    { level: 30,  title: 'Firmware Wizard',         color: '#0070dd' },
    { level: 40,  title: 'Board-Level Expert',      color: '#a335ee' },
    { level: 50,  title: 'Silicon Prophet',         color: '#a335ee' },
    { level: 75,  title: 'Kernel Commander',        color: '#a335ee' },
    { level: 100, title: 'Master of the Mainboard', color: '#ff8000', glow: true },
    { level: 250, title: 'Digital Archon',          color: '#e5cc80', glow: true }
];

// Comprehensive Level Rewards System
const LEVEL_REWARDS = {
    // EVERY level gets base rewards
    base: {
        coins: 100,
        talentPoints: 1
    },
    
    // Special rewards at specific levels
    special: {
        2: { coins: 50, message: '💰 Bonus Coins!' },
        3: { xpBoost: 0.02, message: '✨ +2% Permanent XP Boost!' },
        4: { mascotFood: 5, message: '🍖 +5 Mascot Food!' },
        5: { rerollToken: 1, xpBoost: 0.01, message: '🔄 +1 Reroll Token | ✨ +1% XP Boost!' },
        6: { coins: 150, message: '💰 Bonus Coins!' },
        7: { mascotTreat: 3, message: '🍰 +3 Special Treats!' },
        8: { shopDiscount: 0.05, message: '🏪 Unlocked: 5% Shop Discount!' },
        9: { coins: 200, message: '💰 Bonus Coins!' },
        10: { rerollToken: 1, searchHistory: 1, xpBoost: 0.01, message: '🔄 +1 Reroll | 📜 +1 Search Slot | ✨ +1% XP!' },
        
        11: { mascotFood: 10, message: '🍖 +10 Mascot Food!' },
        12: { coinMultiplier: 0.05, message: '💎 +5% Coin Earnings!' },
        13: { coins: 250, message: '💰 Bonus Coins!' },
        14: { energizedBuff: 1, message: '⚡ +1 Energized Buff (10% XP for 1 hour)!' },
        15: { rerollToken: 1, xpBoost: 0.01, freeTheme: 'oceanic', message: '🌊 Free Theme: Oceanic | 🔄 +1 Reroll | ✨ +1% XP!' },
        16: { mascotTreat: 5, message: '🍰 +5 Special Treats!' },
        17: { coins: 300, message: '💰 Bonus Coins!' },
        18: { shopDiscount: 0.05, message: '🏪 Shop Discount Increased to 10%!' },
        19: { doubleCoins: 1, message: '💰 +1 Double Coins Buff (2x coins for 1 hour)!' },
        20: { rerollToken: 2, xpBoost: 0.01, mascotFood: 15, message: '🔄 +2 Rerolls | ✨ +1% XP | 🍖 +15 Food!' },
        
        22: { coins: 400, message: '💰 Bonus Coins!' },
        24: { coinMultiplier: 0.05, message: '💎 +10% Coin Earnings Total!' },
        25: { rerollToken: 2, xpBoost: 0.02, searchHistory: 1, message: '🔄 +2 Rerolls | ✨ +2% XP | 📜 +1 Search Slot!' },
        27: { energizedBuff: 2, message: '⚡ +2 Energized Buffs!' },
        28: { coins: 500, message: '💰 Bonus Coins!' },
        30: { rerollToken: 3, xpBoost: 0.02, mascotFood: 20, freeAccessory: 'tech_goggles', message: '🥽 Free Accessory: Tech Goggles | 🔄 +3 Rerolls | ✨ +2% XP!' },
        
        32: { shopDiscount: 0.05, message: '🏪 Shop Discount: 15%!' },
        35: { rerollToken: 2, searchHistory: 1, coins: 600, message: '🔄 +2 Rerolls | 📜 +1 Search Slot | 💰 Bonus!' },
        37: { doubleCoins: 2, message: '💰 +2 Double Coins Buffs!' },
        40: { rerollToken: 3, xpBoost: 0.03, mascotTreat: 10, coinMultiplier: 0.05, message: '🔄 +3 Rerolls | ✨ +3% XP | 🍰 +10 Treats | 💎 +15% Coins!' },
        
        42: { coins: 700, message: '💰 Bonus Coins!' },
        45: { rerollToken: 2, searchHistory: 1, energizedBuff: 3, message: '🔄 +2 Rerolls | 📜 +1 Search Slot | ⚡ +3 Buffs!' },
        48: { shopDiscount: 0.05, message: '🏪 Shop Discount: 20%!' },
        50: { rerollToken: 4, xpBoost: 0.05, coins: 1000, freeTheme: 'midnight', mascotFood: 30, message: '🎉 MILESTONE! 🌙 Theme: Midnight | 🔄 +4 Rerolls | ✨ +5% XP | 💰 1000 Coins!' },
        
        55: { coinMultiplier: 0.10, message: '💎 +25% Coin Earnings Total!' },
        60: { rerollToken: 3, searchHistory: 2, energizedBuff: 4, message: '🔄 +3 Rerolls | 📜 +2 Search Slots | ⚡ +4 Buffs!' },
        65: { doubleCoins: 3, coins: 1200, message: '💰 +3 Double Coins | 1200 Bonus Coins!' },
        70: { rerollToken: 4, xpBoost: 0.05, shopDiscount: 0.05, message: '🔄 +4 Rerolls | ✨ +5% XP | 🏪 Discount: 25%!' },
        75: { rerollToken: 5, xpBoost: 0.05, coins: 1500, mascotTreat: 20, freeAccessory: 'legend_badge', message: '⚡ EPIC! 🏅 Legend Badge | 🔄 +5 Rerolls | ✨ +5% XP | 💰 1500 Coins!' },
        
        80: { coinMultiplier: 0.10, searchHistory: 2, message: '💎 +35% Coin Earnings | 📜 +2 Search Slots!' },
        85: { rerollToken: 4, energizedBuff: 5, doubleCoins: 4, message: '🔄 +4 Rerolls | ⚡ +5 Buffs | 💰 +4 Double Coins!' },
        90: { xpBoost: 0.10, coins: 2000, mascotFood: 50, message: '✨ +10% XP Boost | 💰 2000 Coins | 🍖 +50 Food!' },
        95: { rerollToken: 5, shopDiscount: 0.10, coinMultiplier: 0.15, message: '🔄 +5 Rerolls | 🏪 Discount: 35% | 💎 +50% Coins!' },
        100: { 
            rerollToken: 10, 
            xpBoost: 0.20, 
            coins: 5000, 
            masterCrown: true, 
            mascotTreat: 50, 
            coinMultiplier: 0.25,
            searchHistory: 5,
            shopDiscount: 0.15,
            message: '👑 LEGENDARY! Master\'s Crown | 🔄 +10 Rerolls | ✨ +20% XP | 💰 5000 Coins | 💎 +75% Coin Earnings | 🏪 50% Shop Discount | 📜 +5 Search Slots!'
        },
        
        // Post-100 rewards for dedicated players
        110: { rerollToken: 6, xpBoost: 0.10, coins: 3000, message: '🔄 +6 Rerolls | ✨ +10% XP | 💰 3000 Coins!' },
        120: { coinMultiplier: 0.20, searchHistory: 3, message: '💎 +95% Coin Earnings | 📜 +3 Search Slots!' },
        130: { rerollToken: 7, energizedBuff: 10, doubleCoins: 10, message: '🔄 +7 Rerolls | ⚡ +10 Buffs | 💰 +10 Double Coins!' },
        140: { xpBoost: 0.15, coins: 4000, message: '✨ +15% XP | 💰 4000 Coins!' },
        150: { 
            rerollToken: 15, 
            xpBoost: 0.25, 
            coins: 10000, 
            coinMultiplier: 0.50, 
            shopDiscount: 0.25, 
            freeTheme: 'transcendent',
            message: '✨ TRANSCENDENT! 🌌 Ultimate Theme | 🔄 +15 Rerolls | ✨ +25% XP | 💰 10000 Coins | 💎 +145% Coin Earnings | 🏪 75% Shop Discount!'
        },
        
        175: { rerollToken: 10, xpBoost: 0.20, coins: 6000, message: '🔄 +10 Rerolls | ✨ +20% XP | 💰 6000 Coins!' },
        200: { 
            rerollToken: 20, 
            xpBoost: 0.30, 
            coins: 15000, 
            coinMultiplier: 1.00, 
            searchHistory: 10,
            ascendedStatus: true,
            message: '🌟 ASCENDED! Divine Status Unlocked | 🔄 +20 Rerolls | ✨ +30% XP | 💰 15000 Coins | 💎 +245% Coin Earnings | 📜 +10 Search Slots!'
        },
        
        250: { 
            rerollToken: 50, 
            xpBoost: 0.50, 
            coins: 25000, 
            coinMultiplier: 2.00, 
            shopDiscount: 0.50, 
            digitalArchon: true,
            message: '⚡ DIGITAL ARCHON! The Ultimate Power | 🔄 +50 Rerolls | ✨ +50% XP | 💰 25000 Coins | 💎 +445% Coin Earnings | 🏪 125% Shop Discount (FREE + Refunds)!'
        }
    }
};

const TALENT_TREE = [
    // === TIER 1: Novice Talents (Level 1+) ===
    {
        id: 'repair_xp_boost_1', name: 'Repair Specialist I', cost: 1, levelRequired: 1,
        description: 'Gain +10% bonus XP from completing repairs.',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.10 }
    },
    {
        id: 'search_xp_boost_1', name: 'Data Miner I', cost: 1, levelRequired: 1,
        description: 'Gain +15% bonus XP from using Advanced Search.',
        bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.15 }
    },
    {
        id: 'coin_finder_1', name: 'Coin Scavenger', cost: 1, levelRequired: 1,
        description: 'Gain +10% more Fixer-Coins from all sources.',
        bonus: { type: 'coin_modifier', multiplier: 0.10 }
    },
    
    // === TIER 2: Apprentice Talents (Level 5+) ===
    {
        id: 'order_xp_boost_1', name: 'Logistics Expert I', cost: 1, levelRequired: 5,
        description: 'Gain +10% bonus XP from creating new orders.',
        bonus: { type: 'xp_modifier', stat: 'ordersCreated', multiplier: 0.10 }
    },
    {
        id: 'status_xp_boost_1', name: 'Workflow Master I', cost: 1, levelRequired: 5,
        description: 'Gain +10% bonus XP from status changes.',
        bonus: { type: 'xp_modifier', stat: 'statusChanges', multiplier: 0.10 }
    },
    {
        id: 'mascot_lover', name: 'Pet Whisperer', cost: 2, levelRequired: 5,
        description: 'Mascot happiness and hunger decay 25% slower.',
        bonus: { type: 'mascot_decay', multiplier: 0.75 }
    },
    
    // === TIER 3: Skilled Talents (Level 10+) ===
    {
        id: 'repair_xp_boost_2', name: 'Repair Specialist II', cost: 2, levelRequired: 10,
        description: 'Gain an additional +15% bonus XP from repairs (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.15 }
    },
    {
        id: 'search_xp_boost_2', name: 'Data Miner II', cost: 2, levelRequired: 10,
        description: 'Gain an additional +20% bonus XP from searches (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.20 }
    },
    {
        id: 'coin_finder_2', name: 'Treasure Hunter', cost: 2, levelRequired: 10,
        description: 'Gain an additional +15% more coins (stacks!).',
        bonus: { type: 'coin_modifier', multiplier: 0.15 }
    },
    {
        id: 'game_master_1', name: 'Game Enthusiast', cost: 2, levelRequired: 10,
        description: 'Gain +25% bonus XP from playing mini-games.',
        bonus: { type: 'xp_modifier', stat: 'anyGamePlayed', multiplier: 0.25 }
    },
    
    // === TIER 4: Expert Talents (Level 15+) ===
    {
        id: 'efficiency_expert', name: 'Efficiency Expert', cost: 3, levelRequired: 15,
        description: 'All XP gains increased by +5%.',
        bonus: { type: 'global_xp_modifier', multiplier: 0.05 }
    },
    {
        id: 'wealthy_technician', name: 'Wealthy Technician', cost: 3, levelRequired: 15,
        description: 'Start each day with 50 bonus coins.',
        bonus: { type: 'daily_bonus', coins: 50 }
    },
    {
        id: 'quick_learner', name: 'Quick Learner', cost: 3, levelRequired: 15,
        description: 'Reduce XP needed for next level by 5%.',
        bonus: { type: 'xp_reduction', multiplier: 0.05 }
    },
    
    // === TIER 5: Advanced Talents (Level 20+) ===
    {
        id: 'order_xp_boost_2', name: 'Logistics Expert II', cost: 3, levelRequired: 20,
        description: 'Additional +15% bonus XP from orders (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'ordersCreated', multiplier: 0.15 }
    },
    {
        id: 'status_xp_boost_2', name: 'Workflow Master II', cost: 3, levelRequired: 20,
        description: 'Additional +15% bonus XP from status changes (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'statusChanges', multiplier: 0.15 }
    },
    {
        id: 'lucky_finder', name: 'Lucky Finder', cost: 4, levelRequired: 20,
        description: '10% chance to find 50-150 bonus coins on any action.',
        bonus: { type: 'lucky_coins', chance: 0.10 }
    },
    {
        id: 'bounty_master', name: 'Bounty Hunter', cost: 3, levelRequired: 20,
        description: 'Daily bounties give +25% more rewards.',
        bonus: { type: 'bounty_modifier', multiplier: 0.25 }
    },
    
    // === TIER 6: Master Talents (Level 30+) ===
    {
        id: 'repair_xp_boost_3', name: 'Repair Specialist III', cost: 4, levelRequired: 30,
        description: 'Additional +20% bonus XP from repairs (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.20 }
    },
    {
        id: 'coin_finder_3', name: 'Gold Digger', cost: 4, levelRequired: 30,
        description: 'Additional +20% more coins (stacks!).',
        bonus: { type: 'coin_modifier', multiplier: 0.20 }
    },
    {
        id: 'efficiency_master', name: 'Efficiency Master', cost: 5, levelRequired: 30,
        description: 'All XP gains increased by additional +10% (stacks!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.10 }
    },
    {
        id: 'shop_discount_1', name: 'Savvy Shopper', cost: 4, levelRequired: 30,
        description: 'All shop items cost 15% less.',
        bonus: { type: 'shop_discount', multiplier: 0.15 }
    },
    
    // === TIER 7: Legendary Talents (Level 40+) ===
    {
        id: 'search_xp_boost_3', name: 'Data Miner III', cost: 5, levelRequired: 40,
        description: 'Additional +25% bonus XP from searches (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'searches', multiplier: 0.25 }
    },
    {
        id: 'double_talent_chance', name: 'Fortune Favored', cost: 5, levelRequired: 40,
        description: 'Small chance to earn 2 talent points on level up.',
        bonus: { type: 'talent_point_bonus', chance: 0.15 }
    },
    {
        id: 'achievement_hunter', name: 'Achievement Hunter', cost: 4, levelRequired: 40,
        description: 'Achievements grant +50% more XP.',
        bonus: { type: 'achievement_modifier', multiplier: 0.50 }
    },
    {
        id: 'event_magnet', name: 'Event Magnet', cost: 5, levelRequired: 40,
        description: 'Random events spawn 30% more often.',
        bonus: { type: 'event_spawn', multiplier: 1.30 }
    },
    
    // === TIER 8: Elite Talents (Level 50+) ===
    {
        id: 'repair_xp_boost_4', name: 'Repair Specialist IV', cost: 6, levelRequired: 50,
        description: 'Additional +25% bonus XP from repairs (stacks!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.25 }
    },
    {
        id: 'coin_finder_4', name: 'Midas Touch', cost: 6, levelRequired: 50,
        description: 'Additional +25% more coins (stacks!).',
        bonus: { type: 'coin_modifier', multiplier: 0.25 }
    },
    {
        id: 'buff_duration', name: 'Buff Extender', cost: 5, levelRequired: 50,
        description: 'All consumable buffs last 50% longer.',
        bonus: { type: 'buff_duration', multiplier: 1.50 }
    },
    {
        id: 'shop_discount_2', name: 'Master Negotiator', cost: 5, levelRequired: 50,
        description: 'Additional 15% shop discount (stacks to 30% total!).',
        bonus: { type: 'shop_discount', multiplier: 0.15 }
    },
    
    // === TIER 9: Grandmaster Talents (Level 75+) ===
    {
        id: 'global_xp_master', name: 'XP Grandmaster', cost: 7, levelRequired: 75,
        description: 'All XP gains increased by additional +15% (stacks!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.15 }
    },
    {
        id: 'quick_learner_2', name: 'Genius Mind', cost: 7, levelRequired: 75,
        description: 'Reduce XP needed for levels by additional 10% (stacks!).',
        bonus: { type: 'xp_reduction', multiplier: 0.10 }
    },
    // === TIER 10: Legendary Talents (Level 100+) ===
    {
        id: 'repair_xp_boost_5', name: 'Repair Specialist V', cost: 8, levelRequired: 100,
        description: 'Additional +30% bonus XP from repairs (LEGENDARY!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.30 }
    },
    {
        id: 'coin_finder_5', name: 'Coin Emperor', cost: 8, levelRequired: 100,
        description: 'Additional +30% more coins (LEGENDARY!).',
        bonus: { type: 'coin_modifier', multiplier: 0.30 }
    },
    {
        id: 'daily_powerup', name: 'Daily Powerup', cost: 8, levelRequired: 100,
        description: 'Start each day with a random free buff active.',
        bonus: { type: 'daily_buff', enabled: true }
    },
    
    // === TIER 11: Ultimate Talents (Level 150+) ===
    {
        id: 'ultimate_efficiency', name: 'Ultimate Efficiency', cost: 10, levelRequired: 150,
        description: 'All XP gains increased by additional +20% (ULTIMATE!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.20 }
    },
    {
        id: 'coin_rain', name: 'Coin Rain', cost: 10, levelRequired: 150,
        description: 'Additional +35% more coins (ULTIMATE!).',
        bonus: { type: 'coin_modifier', multiplier: 0.35 }
    },
    {
        id: 'talent_regeneration', name: 'Talent Regeneration', cost: 12, levelRequired: 150,
        description: '25% chance to refund talent point on unlock.',
        bonus: { type: 'talent_refund', chance: 0.25 }
    },
    {
        id: 'event_controller', name: 'Event Controller', cost: 10, levelRequired: 150,
        description: 'Events last 50% longer.',
        bonus: { type: 'event_duration', multiplier: 1.50 }
    },
    
    // === TIER 12: Godlike Talents (Level 200+) ===
    {
        id: 'ascended_repairer', name: 'Ascended Repairer', cost: 15, levelRequired: 200,
        description: 'Repairs grant +50% XP and +50% coins (GODLIKE!).',
        bonus: { type: 'xp_modifier', stat: 'repairsCompleted', multiplier: 0.50 }
    },
    {
        id: 'infinite_wealth', name: 'Infinite Wealth', cost: 15, levelRequired: 200,
        description: 'All coin gains increased by +50% (GODLIKE!).',
        bonus: { type: 'coin_modifier', multiplier: 0.50 }
    },
    {
        id: 'perfect_bounties', name: 'Perfect Bounties', cost: 12, levelRequired: 200,
        description: 'Bounty rewards doubled.',
        bonus: { type: 'bounty_modifier', multiplier: 1.0 }
    },
    
    // === TIER 13: Divine Talents (Level 250+) ===
    {
        id: 'digital_archon_power', name: 'Digital Archon Power', cost: 20, levelRequired: 250,
        description: 'ALL XP sources increased by +30% (DIVINE!).',
        bonus: { type: 'global_xp_modifier', multiplier: 0.30 }
    },
    {
        id: 'coin_deity', name: 'Coin Deity', cost: 20, levelRequired: 250,
        description: 'ALL coin sources increased by +75% (DIVINE!).',
        bonus: { type: 'coin_modifier', multiplier: 0.75 }
    },
    {
        id: 'talent_fountain', name: 'Talent Fountain', cost: 25, levelRequired: 250,
        description: 'Earn 2 talent points per level instead of 1.',
        bonus: { type: 'talent_points', multiplier: 2.0 }
    },
    {
        id: 'ultimate_mastery', name: 'Ultimate Mastery', cost: 30, levelRequired: 250,
        description: 'All bonuses increased by +10%. The pinnacle of power.',
        bonus: { type: 'universal_amplifier', multiplier: 0.10 }
    },
];

// ===================================================================
// === NOTIFICATION QUEUE SYSTEM (Prevents Overlapping Popups)
// ===================================================================
let notificationQueue = [];
let isDialogOpen = false;
let isShowingNotification = false;

// Override native confirm/alert to track dialog state
const originalConfirm = window.confirm;
const originalAlert = window.alert;

window.confirm = function(...args) {
    isDialogOpen = true;
    const result = originalConfirm.apply(this, args);
    isDialogOpen = false;
    // Process queue after dialog closes
    setTimeout(() => processNotificationQueue(), 100);
    return result;
};

window.alert = function(...args) {
    isDialogOpen = true;
    originalAlert.apply(this, args);
    isDialogOpen = false;
    // Process queue after dialog closes
    setTimeout(() => processNotificationQueue(), 100);
};

function queueNotification(type, data) {
    notificationQueue.push({ type, data });
    if (!isDialogOpen && !isShowingNotification) {
        processNotificationQueue();
    }
}

function processNotificationQueue() {
    if (isDialogOpen || isShowingNotification || notificationQueue.length === 0) return;
    
    isShowingNotification = true;
    const notification = notificationQueue.shift();
    
    switch (notification.type) {
        case 'levelup':
            triggerLevelUpAnimationImmediate(notification.data.newLevel, notification.data.oldLevel, notification.data.STORAGE_KEYS, notification.data.rewards, notification.data.isLegendary);
            (function waitForLevelUpOverlay() {
                if (document.getElementById('tm-level-up-overlay')) {
                    setTimeout(waitForLevelUpOverlay, 250);
                    return;
                }
                isShowingNotification = false;
                processNotificationQueue();
            })();
            break;

        case 'achievement':
            showAchievementNotificationImmediate(notification.data.title, notification.data.xp);
            (function waitForAchievementToast() {
                const el = document.getElementById('tm-achievement-notification');
                if (el && el.classList.contains('show')) {
                    setTimeout(waitForAchievementToast, 250);
                    return;
                }
                isShowingNotification = false;
                processNotificationQueue();
            })();
            break;

        case 'bounty':
            showPositiveMessage(notification.data.message);
            (function waitForBountyToast() {
                const positive = document.getElementById('tm-positive-message');
                const visible = positive && positive.textContent
                    && parseFloat(window.getComputedStyle(positive).opacity || '0') > 0.05;
                if (visible) {
                    setTimeout(waitForBountyToast, 250);
                    return;
                }
                isShowingNotification = false;
                processNotificationQueue();
            })();
            break;
            
        default:
            isShowingNotification = false;
            processNotificationQueue();
    }
}

function isMmsNotificationActive() {
    if (isDialogOpen) return true;
    if (isShowingNotification || notificationQueue.length > 0) return true;
    if (document.getElementById('tm-level-up-overlay')) return true;

    const achievement = document.getElementById('tm-achievement-notification');
    if (achievement && achievement.classList.contains('show')) return true;

    const positive = document.getElementById('tm-positive-message');
    if (positive && positive.textContent) {
        const opacity = parseFloat(window.getComputedStyle(positive).opacity || '0');
        if (opacity > 0.05) return true;
    }

    if (document.getElementById('tm-repair-reminder-banner-root')) return true;

    return false;
}

// ===================================================================

function getXpForLevel(level) {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Wrapper function that queues level-up animations
function triggerLevelUpAnimation(newLevel, oldLevel, STORAGE_KEYS, rewards = [], isLegendary = false) {
    if (typeof queueNotification === 'function') {
        queueNotification('levelup', { newLevel, oldLevel, STORAGE_KEYS, rewards, isLegendary });
    } else {
        // Fallback to immediate if queue not available
        triggerLevelUpAnimationImmediate(newLevel, oldLevel, STORAGE_KEYS, rewards, isLegendary);
    }
}

function triggerLevelUpAnimationImmediate(newLevel, oldLevel, STORAGE_KEYS, rewards = [], isLegendary = false) {
    const overlay = document.createElement('div');
    overlay.id = 'tm-level-up-overlay';

    let evolutionMessage = '';
    const evolutionMilestones = [10, 25, 50, 100, 250];
    if (evolutionMilestones.some(milestone => oldLevel < milestone && newLevel >= milestone)) {
        const evoNames = {
            10: 'Evo-1: Advanced Troubleshooter',
            25: 'Evo-2: Data Recovery Agent',
            50: 'Evo-3: Silicon Prophet',
            100: 'Evo-4: Master of the Mainboard',
            250: 'Evo-5: DIGITAL ARCHON'
        };
        const evoReached = evolutionMilestones.find(m => newLevel >= m && oldLevel < m);
        const evoName = evoNames[evoReached] || 'New Evolution';
        evolutionMessage = `<div class="tm-level-up-evolution">🌟 Your Mascot has Evolved! 🌟<br><span style="font-size: 0.8em; color: var(--tm-info-color);">${evoName}</span></div>`;
        // Update the mascot's appearance in real-time
        if (typeof window.updateMascotAppearanceByLevel === 'function') {
            window.updateMascotAppearanceByLevel(newLevel);
        }
    }

    if (isLegendary) {
        overlay.classList.add('legendary');
    }

    const rewardsHTML = rewards.map(reward => `<div class="tm-level-up-reward">${reward}</div>`).join('');

    overlay.innerHTML = `
        <div class="tm-level-up-content">
            <div class="tm-level-up-title">LEVEL UP!</div>
            ${evolutionMessage}
            <div class="tm-level-up-new-level">Level ${newLevel}</div>
            <div class="tm-level-up-rewards-container">${rewardsHTML}</div>
            <div class="tm-level-up-stat-increase">Your stats have improved!</div>
        </div>
    `;
    document.body.appendChild(overlay);

    triggerFireworks(isLegendary, 2200);

    // Fade out after duration
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 1000);
    }, 5000); // Show for 5 seconds
}

/**
 * Emits soft glowing orbs and expanding rings from the center of the screen.
 * @param {boolean} isLegendary Use gold palette if true
 * @param {number} duration Total emission window in milliseconds
 */
function triggerFireworks(isLegendary = false, duration = 2200) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;

    const palette = isLegendary
        ? ['rgba(255,215,0,0.85)', 'rgba(255,165,0,0.75)', 'rgba(255,255,200,0.70)', 'rgba(255,193,7,0.80)']
        : ['rgba(120,180,255,0.80)', 'rgba(160,220,255,0.70)', 'rgba(200,240,255,0.65)', 'rgba(255,255,255,0.60)'];

    const orbCount   = isLegendary ? 28 : 20;
    const ringCount  = isLegendary ? 5  : 3;
    const spread     = Math.min(window.innerWidth, window.innerHeight) * 0.38;

    // Expanding rings from card center
    for (let i = 0; i < ringCount; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'tm-level-up-ring';
            const size = 140 + i * 80;
            ring.style.cssText = `
                left: ${cx}px; top: ${cy}px;
                width: ${size}px; height: ${size}px;
                --ring-color: ${palette[i % palette.length]};
                --ring-dur: ${0.7 + i * 0.15}s;
            `;
            document.body.appendChild(ring);
            setTimeout(() => ring.remove(), 900);
        }, i * 160);
    }

    // Floating orbs drifting outward and upward
    for (let i = 0; i < orbCount; i++) {
        setTimeout(() => {
            const orb = document.createElement('div');
            orb.className = 'tm-level-up-orb';

            const angle  = Math.random() * Math.PI * 2;
            const dist   = spread * (0.4 + Math.random() * 0.6);
            const ox     = Math.cos(angle) * dist;
            const oy     = Math.sin(angle) * dist - spread * 0.3; // bias upward
            const size   = 5 + Math.random() * 10;
            const dur    = 1.4 + Math.random() * 0.8;
            const color  = palette[Math.floor(Math.random() * palette.length)];

            orb.style.cssText = `
                left: ${cx}px; top: ${cy}px;
                width: ${size}px; height: ${size}px;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color};
                --ox: ${ox}px; --oy: ${oy}px;
                --orb-dur: ${dur}s;
            `;
            document.body.appendChild(orb);
            setTimeout(() => orb.remove(), dur * 1000 + 100);
        }, Math.random() * (duration * 0.6));
    }
}

// Get all current bonuses from leveling
function getCurrentLevelBonuses(STORAGE_KEYS) {
    const bonuses = {
        permanentXpBoost: GM_getValue(STORAGE_KEYS.PERMANENT_XP_BOOST, 0),
        coinMultiplier: GM_getValue(STORAGE_KEYS.COIN_MULTIPLIER, 0),
        shopDiscount: GM_getValue(STORAGE_KEYS.SHOP_DISCOUNT, 0),
        mascotFood: GM_getValue(STORAGE_KEYS.MASCOT_FOOD_ITEMS, 0),
        mascotTreats: GM_getValue(STORAGE_KEYS.MASCOT_TREAT_ITEMS, 0),
        energizedBuffs: GM_getValue(STORAGE_KEYS.ENERGIZED_BUFF_COUNT, 0),
        doubleCoinsBuffs: GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_COUNT, 0),
        searchHistorySlots: 0, // Will be calculated
        isAscended: GM_getValue(STORAGE_KEYS.ASCENDED_STATUS, false),
        isDigitalArchon: GM_getValue(STORAGE_KEYS.DIGITAL_ARCHON_STATUS, false)
    };
    
    return bonuses;
}

// Format bonuses for display
function formatLevelBonusesHTML(STORAGE_KEYS) {
    const bonuses = getCurrentLevelBonuses(STORAGE_KEYS);
    let html = '<div style="margin-top: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">';
    html += '<h3 style="margin: 0 0 10px 0; color: #ffd700;">🎯 Επιπλέον Μπόνους από Επίπεδα</h3>';
    
    if (bonuses.permanentXpBoost > 0) {
        html += `<div style="margin: 5px 0;">✨ <b>+${(bonuses.permanentXpBoost * 100).toFixed(1)}%</b> Μόνιμο XP</div>`;
    }
    
    if (bonuses.coinMultiplier > 0) {
        html += `<div style="margin: 5px 0;">💎 <b>+${(bonuses.coinMultiplier * 100).toFixed(1)}%</b> Νομίσματα</div>`;
    }
    
    if (bonuses.shopDiscount > 0) {
        html += `<div style="margin: 5px 0;">🏪 <b>${(bonuses.shopDiscount * 100).toFixed(1)}%</b> Έκπτωση Καταστήματος</div>`;
    }
    
    if (bonuses.mascotFood > 0) {
        html += `<div style="margin: 5px 0;">🍖 <b>${bonuses.mascotFood}</b> Φαγητό Mascot</div>`;
    }
    
    if (bonuses.mascotTreats > 0) {
        html += `<div style="margin: 5px 0;">🍰 <b>${bonuses.mascotTreats}</b> Ειδικά Λιχουδιά</div>`;
    }
    
    if (bonuses.energizedBuffs > 0) {
        html += `<div style="margin: 5px 0;">⚡ <b>${bonuses.energizedBuffs}</b> Energized Buffs (10% XP για 1 ώρα)</div>`;
    }
    
    if (bonuses.doubleCoinsBuffs > 0) {
        html += `<div style="margin: 5px 0;">💰 <b>${bonuses.doubleCoinsBuffs}</b> Double Coins Buffs (2x νομίσματα για 1 ώρα)</div>`;
    }
    
    if (bonuses.isAscended) {
        html += `<div style="margin: 5px 0; color: #ffd700;">🌟 <b>Ascended Status</b> - Ξεκλειδώθηκε!</div>`;
    }
    
    if (bonuses.isDigitalArchon) {
        html += `<div style="margin: 5px 0; color: #ff8000;">⚡ <b>Digital Archon</b> - Η Απόλυτη Δύναμη!</div>`;
    }
    
    html += '</div>';
    return html;
}

// Process level rewards and return reward messages
function processLevelRewards(config, STORAGE_KEYS, level) {
    const rewards = [];
    const levelReward = LEVEL_REWARDS.special[level];
    
    if (!levelReward) return rewards;
    
    // Bonus Coins
    if (levelReward.coins) {
        grantCoins(config, STORAGE_KEYS, levelReward.coins, 'level_up_bonus');
    }
    
    // XP Boost (cumulative permanent boost)
    if (levelReward.xpBoost) {
        const currentBoost = GM_getValue(STORAGE_KEYS.PERMANENT_XP_BOOST, 0);
        GM_setValue(STORAGE_KEYS.PERMANENT_XP_BOOST, currentBoost + levelReward.xpBoost);
    }
    
    // Reroll Tokens
    if (levelReward.rerollToken) {
        const currentTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);
        GM_setValue(STORAGE_KEYS.USER_REROLL_TOKENS, currentTokens + levelReward.rerollToken);
    }
    
    // Search History Slots
    if (levelReward.searchHistory) {
        config.searchMaxHistory += levelReward.searchHistory;
        GM_setValue('searchMaxHistory', config.searchMaxHistory);
    }
    
    // Coin Multiplier (cumulative)
    if (levelReward.coinMultiplier) {
        const currentMultiplier = GM_getValue(STORAGE_KEYS.COIN_MULTIPLIER, 0);
        GM_setValue(STORAGE_KEYS.COIN_MULTIPLIER, currentMultiplier + levelReward.coinMultiplier);
    }
    
    // Shop Discount (cumulative)
    if (levelReward.shopDiscount) {
        const currentDiscount = GM_getValue(STORAGE_KEYS.SHOP_DISCOUNT, 0);
        GM_setValue(STORAGE_KEYS.SHOP_DISCOUNT, currentDiscount + levelReward.shopDiscount);
    }
    
    // Mascot Food — skip entirely if the mascot is disabled
    if (levelReward.mascotFood && config?.interactiveMascotEnabled !== false) {
        const currentFood = GM_getValue(STORAGE_KEYS.MASCOT_FOOD_ITEMS, 0);
        GM_setValue(STORAGE_KEYS.MASCOT_FOOD_ITEMS, currentFood + levelReward.mascotFood);
    }
    
    // Mascot Treats — skip entirely if the mascot is disabled
    if (levelReward.mascotTreat && config?.interactiveMascotEnabled !== false) {
        const currentTreats = GM_getValue(STORAGE_KEYS.MASCOT_TREAT_ITEMS, 0);
        GM_setValue(STORAGE_KEYS.MASCOT_TREAT_ITEMS, currentTreats + levelReward.mascotTreat);
    }
    
    // Energized Buff (10% XP for 1 hour)
    if (levelReward.energizedBuff) {
        const currentBuffs = GM_getValue(STORAGE_KEYS.ENERGIZED_BUFF_COUNT, 0);
        GM_setValue(STORAGE_KEYS.ENERGIZED_BUFF_COUNT, currentBuffs + levelReward.energizedBuff);
    }
    
    // Double Coins Buff (2x coins for 1 hour)
    if (levelReward.doubleCoins) {
        const currentBuffs = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_COUNT, 0);
        GM_setValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_COUNT, currentBuffs + levelReward.doubleCoins);
    }
    
    // Free Theme
    if (levelReward.freeTheme) {
        let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
        if (!purchased.includes(levelReward.freeTheme)) {
            purchased.push(levelReward.freeTheme);
            GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
        }
    }
    
    // Free Accessory
    if (levelReward.freeAccessory) {
        let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
        if (!purchased.includes(levelReward.freeAccessory)) {
            purchased.push(levelReward.freeAccessory);
            GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
        }
    }
    
    // Master Crown (Level 100)
    if (levelReward.masterCrown) {
        let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
        if (!purchased.includes('master_crown')) {
            purchased.push('master_crown');
            GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
            
            // Auto-equip the crown
            if (typeof window.getAccessoryElement === 'function') {
                let equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                if (!equippedItems.includes('master_crown')) {
                    equippedItems.push('master_crown');
                    GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));
                    const crownAccessory = window.getAccessoryElement('master_crown');
                    if (crownAccessory) crownAccessory.style.display = 'block';
                }
            }
        }
    }
    
    // Special Status Unlocks
    if (levelReward.ascendedStatus) {
        GM_setValue(STORAGE_KEYS.ASCENDED_STATUS, true);
    }
    
    if (levelReward.digitalArchon) {
        GM_setValue(STORAGE_KEYS.DIGITAL_ARCHON_STATUS, true);
    }
    
    // Add the main reward message
    if (levelReward.message) {
        rewards.push(levelReward.message);
    }
    
    return rewards;
}

function grantXp(config, STORAGE_KEYS, points, sourceStat = null) {
    let indicator = null; // Declare indicator at the function scope
    let currentXp = config.levelUpSystemEnabled ? GM_getValue(STORAGE_KEYS.USER_XP, 0) : 0;
    let currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);

    // --- Apply Talent Bonuses ---
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    let talentMultiplier = 1.0; // Start with a base multiplier of 1
    // Find if any talent modifies the XP for the current action
    const relevantTalent = TALENT_TREE.find(t => unlockedTalents.includes(t.id) && t.bonus.type === 'xp_modifier' && t.bonus.stat === sourceStat);
    if (sourceStat && relevantTalent) {
        talentMultiplier += relevantTalent.bonus.multiplier; // Add the bonus from the talent
    }

    // Apply permanent XP Boost from level rewards
    const permanentXpBoost = GM_getValue(STORAGE_KEYS.PERMANENT_XP_BOOST, 0);
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress(STORAGE_KEYS, 'xpEarned', points);
    }


    // Apply "Energized" buff if active
    const energizedExpires = GM_getValue(STORAGE_KEYS.ENERGIZED_BUFF_EXPIRES, 0);
    if (Date.now() < energizedExpires) {
        talentMultiplier += 0.10; // Add 10% boost
    }

    // Calculate final XP (talents + buffs)
    const finalPoints = Math.ceil(points * (1 + permanentXpBoost) * talentMultiplier);
    currentXp += finalPoints;

    let xpForNextLevel = getXpForLevel(currentLevel);
    while (currentXp >= xpForNextLevel) {
        currentXp -= xpForNextLevel;
        const oldLevel = currentLevel;
        currentLevel++;

        // --- Grant Level-Up Rewards ---
        const rewards = [];
        let isLegendaryLevelUp = false;
        
        // 1. Base rewards - ALWAYS given
        const doubleCoinsExpires = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, 0);
        const hasDoubleCoinsBuff = Date.now() < doubleCoinsExpires;
        
        grantCoins(config, STORAGE_KEYS, LEVEL_REWARDS.base.coins, 'level_up');
        
        const currentTalentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
        GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, currentTalentPoints + LEVEL_REWARDS.base.talentPoints);
        
        rewards.push('🌟 +1 Talent Point!');
        if (hasDoubleCoinsBuff) {
            rewards.push(`🪙 +${LEVEL_REWARDS.base.coins} Fixer-Coins! 💰 (+${LEVEL_REWARDS.base.coins} DOUBLE COINS BONUS!)`);
        } else {
            rewards.push(`🪙 +${LEVEL_REWARDS.base.coins} Fixer-Coins!`);
        }
        
        // 2. Special level rewards
        const specialRewards = processLevelRewards(config, STORAGE_KEYS, currentLevel);
        rewards.push(...specialRewards);
        
        // 3. Title unlock
        const newRank = RANKS.find(r => r.level === currentLevel);
        if (newRank) {
            GM_setValue(STORAGE_KEYS.USER_TITLE, newRank.title);
            if (newRank.glow) {
                isLegendaryLevelUp = true;
            }
            const glowStyle = newRank.glow ? 'text-shadow: 0 0 5px #fff;' : '';
            rewards.push(`🏆 New Title: <span style="color:${newRank.color}; font-weight:bold; ${glowStyle}">${newRank.title}</span>!`);
        }
        
        // 4. Check for legendary level-ups (special milestones)
        if ([10, 25, 50, 75, 100, 150, 200, 250].includes(currentLevel)) {
            isLegendaryLevelUp = true;
        }

        triggerLevelUpAnimation(currentLevel, oldLevel, STORAGE_KEYS, rewards, isLegendaryLevelUp);
        xpForNextLevel = getXpForLevel(currentLevel);
    }

    // --- New: Show XP Gain Indicator ---
    const xpBarContainer = document.getElementById('tm-xp-bar-container');
    if (xpBarContainer && points > 0) {
        indicator = document.createElement('div');
        indicator.className = 'tm-xp-gain-indicator';
        xpBarContainer.appendChild(indicator);

        // Update XP indicator to show boosted points if they are different
        if (finalPoints > points) {
            indicator.textContent = `+${points} XP (+${finalPoints - points} Bonus)`;
            indicator.style.color = '#28a745'; // Green for bonus
            indicator.style.fontSize = '15px';
        } else {
            indicator.textContent = `+${finalPoints} XP`;
        }


        // Remove the indicator after the animation finishes
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.parentElement.removeChild(indicator);
            }
        }, 1500); // Must match the animation duration in CSS
    }
    GM_setValue(STORAGE_KEYS.USER_XP, currentXp);
    GM_setValue(STORAGE_KEYS.USER_LEVEL, currentLevel);

    // Update mascot appearance for current level (if mascot is enabled)
    if (typeof window.updateMascotAppearanceByLevel === 'function') {
        window.updateMascotAppearanceByLevel(currentLevel);
    }

    // Update the UI
    const xpBarFill = document.getElementById('tm-xp-bar-fill');
    const xpText = document.getElementById('tm-xp-text');
    const levelText = document.getElementById('tm-level-text');
    const titleText = document.getElementById('tm-user-title-text');
    if (xpBarFill && xpText && levelText && titleText) {
        // --- New: Add temporary visual effects for XP gain ---
        if (finalPoints > 0) {
            const xpBar = xpBarContainer.querySelector('.tm-xp-bar');
            if (xpBar) {
                xpBar.classList.add('tm-xp-gain-flash');
                setTimeout(() => xpBar.classList.remove('tm-xp-gain-flash'), 500);
            }
            if (levelText) {
                levelText.classList.add('tm-level-pop');
                setTimeout(() => levelText.classList.remove('tm-level-pop'), 500);
            }
        }


        updateXpBarUI(STORAGE_KEYS, currentLevel, currentXp, xpForNextLevel);
    }
}

function grantCoins(config, STORAGE_KEYS, amount, source = 'unknown') {
    if (!config.levelUpSystemEnabled) return;
    let currentCoins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);

    // Apply coin talent bonus
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    let coinMultiplier = 1.0;
    const coinTalent = TALENT_TREE.find(t => unlockedTalents.includes(t.id) && t.bonus.type === 'coin_modifier');
    if (coinTalent) {
        coinMultiplier += coinTalent.bonus.multiplier;
    }
    
    // Apply permanent coin multiplier from level rewards
    const permanentCoinMultiplier = GM_getValue(STORAGE_KEYS.COIN_MULTIPLIER, 0);
    coinMultiplier += permanentCoinMultiplier;

    // Apply "Double Coins" buff if active
    const doubleCoinsExpires = GM_getValue(STORAGE_KEYS.DOUBLE_COINS_BUFF_EXPIRES, 0);
    const hasDoubleCoinsBuff = Date.now() < doubleCoinsExpires;
    if (hasDoubleCoinsBuff) {
        coinMultiplier += 1.0; // Add 100% bonus
    }

    const finalAmount = Math.ceil(amount * coinMultiplier);
    currentCoins += finalAmount;
    GM_setValue(STORAGE_KEYS.USER_COINS, currentCoins);
    
    // Track coin history
    const coinHistory = JSON.parse(GM_getValue(STORAGE_KEYS.COIN_HISTORY, '[]'));
    coinHistory.unshift({
        amount: finalAmount,
        baseAmount: amount,
        timestamp: Date.now(),
        source: source
    });
    // Keep only last 50 entries
    if (coinHistory.length > 50) {
        coinHistory.length = 50;
    }
    GM_setValue(STORAGE_KEYS.COIN_HISTORY, JSON.stringify(coinHistory));
    
    // Show visual feedback for double coins bonus
    if (hasDoubleCoinsBuff && coinMultiplier >= 2.0 && amount >= 50) {
        console.log(`[MMS] 💰💰 DOUBLE COINS! ${amount} → ${finalAmount} coins`);
        // Create a floating coin indicator
        const coinIndicator = document.createElement('div');
        coinIndicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffd700;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 0 10px #ffc107, 0 2px 4px rgba(0,0,0,0.8);
            z-index: 15000;
            pointer-events: none;
            animation: tm-coin-bonus-popup 1.5s ease-out forwards;
        `;
        coinIndicator.textContent = `💰 +${finalAmount - amount} BONUS!`;
        document.body.appendChild(coinIndicator);
        
        // Create CSS animation if it doesn't exist
        if (!document.getElementById('tm-coin-bonus-animation')) {
            const style = document.createElement('style');
            style.id = 'tm-coin-bonus-animation';
            style.textContent = `
                @keyframes tm-coin-bonus-popup {
                    0% { 
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    20% { 
                        transform: translate(-50%, -70%) scale(1.2);
                        opacity: 1;
                    }
                    80% { 
                        transform: translate(-50%, -100%) scale(1);
                        opacity: 1;
                    }
                    100% { 
                        transform: translate(-50%, -120%) scale(0.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => coinIndicator.remove(), 1500);
    }
    
    // Update quest progress for earning coins
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress(STORAGE_KEYS, 'coinsEarned', amount);
    }
    updateCoinBalanceUI(STORAGE_KEYS, currentCoins, config);
}

function updateCoinBalanceUI(STORAGE_KEYS, balance, config) {
    const coinDisplay = document.getElementById('tm-coin-balance');
    if (!coinDisplay) return;
    
    // Only update if shop is enabled (the element should only exist if shop is enabled)
    const shopEnabled = config?.shopEnabled !== false; // Default to true if config not provided
    if (!shopEnabled) {
        coinDisplay.style.display = 'none';
        return;
    }
    
    coinDisplay.innerHTML = `🪙 ${balance}`;
    coinDisplay.style.display = '';
}

/**
 * Tracks a daily statistic. Resets if the day has changed.
 * @param {string} statName The name of the stat to increment (e.g., 'searches').
 */
function trackDailyStat(config, STORAGE_KEYS, statName, value = 1) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let stats = {
        date: today,
        searches: 0,
        repairsCompleted: 0,
        ordersCreated: 0,
        statusChanges: 0,
        printOrder: 0,
        viewTechStats: 0,
        viewCustomerHistory: 0,
        setScratchpadReminder: 0,
        feedMascot: 0,
        petMascot: 0,
        memoryGame: 0,
        bugSquishGame: 0,
        xpEarned: 0,
        coinsEarned: 0
    };

    try {
        const savedStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
        // If the saved date is today, use it. Otherwise, the fresh object will be used.
        if (savedStats.date === today) {
            stats = savedStats;
        } else {
            // New day, so generate new quests
            generateDailyQuests(STORAGE_KEYS, config);
        }
    } catch (e) {
        console.error('[MMS] Could not parse daily stats, resetting.', e);
    }

    stats[statName] = (stats[statName] || 0) + value;
    GM_setValue(STORAGE_KEYS.DAILY_STATS, JSON.stringify(stats)); // Save before checking achievements
    
    // Also maintain a history object for charts (last 7 days)
    try {
        const history = JSON.parse(GM_getValue('tm_daily_stats_history', '{}'));
        if (!history[today]) {
            history[today] = { searches: 0, repairsCompleted: 0, ordersCreated: 0, statusChanges: 0 };
        }
        history[today][statName] = stats[statName];
        
        // Keep only last 7 days
        const daysToKeep = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            daysToKeep.push(date.toISOString().slice(0, 10));
        }
        const cleanedHistory = {};
        daysToKeep.forEach(day => {
            if (history[day]) cleanedHistory[day] = history[day];
        });
        GM_setValue('tm_daily_stats_history', JSON.stringify(cleanedHistory));
    } catch (e) {
        console.error('[MMS] Error updating stats history:', e);
    }
    
    console.log(`[MMS Stats] ${statName}: ${stats[statName]} (added ${value})`);

    // Don't check for achievements on every single action to avoid spam
    const achievementTrackedStats = ['searches', 'repairsCompleted', 'ordersCreated'];
    if (achievementTrackedStats.includes(statName))
    checkAchievements(config, STORAGE_KEYS, statName, stats[statName]);

    // Update quest progress for all stats
    if (typeof updateQuestProgress === 'function') {
        updateQuestProgress(STORAGE_KEYS, statName, value);
    }
    
    // Handle combined stats like 'anyGamePlayed'
    if (statName === 'memoryGame' || statName === 'bugSquishGame') {
        stats['anyGamePlayed'] = (stats['anyGamePlayed'] || 0) + value;
        updateQuestProgress(STORAGE_KEYS, 'anyGamePlayed', value);
    }

    // Grant XP for the action
    if (config.levelUpSystemEnabled && XP_CONFIG[statName]) {
        grantXp(config, STORAGE_KEYS, XP_CONFIG[statName], statName); // Pass the source stat for talent calculation
    }
    if (config.interactiveMascotEnabled) {
        // Make the pet happy for user activity
        const happinessGain = (statName === 'repairsCompleted' || statName === 'ordersCreated') ? 20 : 5;
        updatePetStats(config, STORAGE_KEYS, happinessGain, 0);
    }
}

/**
 * Displays a temporary achievement notification.
 * @param {string} message The message to display.
 */
// Wrapper function that queues achievement notifications
function showAchievementNotification(message, xp = 0) {
    if (typeof queueNotification === 'function') {
        queueNotification('achievement', { title: message, xp: xp });
    } else {
        // Fallback to immediate if queue not available
        showAchievementNotificationImmediate(message, xp);
    }
}

function showAchievementNotificationImmediate(message, xp = 0) {
    // New: Log this to the notification center
    if (typeof createNotification === 'function') {
        createNotification(message, '✨');
    }

    let notification = document.getElementById('tm-achievement-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'tm-achievement-notification';
        document.body.appendChild(notification);
    }
    notification.innerHTML = `✨ ${message}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        // Remove after transition
        setTimeout(() => {
            if (notification.parentElement) notification.parentElement.removeChild(notification);
        }, 500);
    }, 4000);
}

/**
 * Checks for and triggers achievement notifications based on daily stats.
 * @param {string} statName The name of the stat that was just incremented.
 * @param {number} currentCount The new count for the stat.
 */
function checkAchievements(config, STORAGE_KEYS, statName, currentCount) {
    // Early exit if achievements are disabled
    if (!config.achievementsEnabled || !config.levelUpSystemEnabled) {
        return;
    }
    
    let unlockedAchievements = JSON.parse(GM_getValue(STORAGE_KEYS.ACHIEVEMENTS, '{}'));

    const achievements = {
        'searches': [
            { count: 1, message: 'Πρώτη Αναζήτηση! 🔍' },
            { count: 10, message: '10 Αναζητήσεις! Είσαι Master του Search! 🕵️' },
            { count: 50, message: '50 Αναζητήσεις! Δεν σου ξεφεύγει τίποτα! 🚀' },
            { count: 100, message: '100 Αναζητήσεις! Είσαι ο Βασιλιάς του Search! 👑' },
            { count: 250, message: '250 Αναζητήσεις! Το Matrix σε ζηλεύει! 💻' },
            { count: 500, message: '500 Αναζητήσεις! Είσαι μια μηχανή αναζήτησης! 🧠' },
            { count: 1000, message: '1000 Αναζητήσεις! All your base are belong to us! 👾' },
        ],
        'repairsCompleted': [
            { count: 1, message: 'Πρώτη Επισκευή Ολοκληρώθηκε! Συγχαρητήρια! 🎉' },
            { count: 10, message: '10 Επισκευές Ολοκληρώθηκαν! Είσαι ο Fixer! 🛠️' },
            { count: 50, message: '50 Επισκευές Ολοκληρώθηκαν! Ασταμάτητος! 🏆' },
            { count: 100, message: '100 Επισκευές! Είσαι Θρύλος! 🦾' },
            { count: 250, message: '250 Επισκευές! Μπορείς να φτιάξεις τα πάντα! ✨' },
            { count: 500, message: '500 Επισκευές! Ούτε ο MacGyver τέτοια στέλνεις! 📎' },
            { count: 1000, message: '1000 Επισκευές! Έχεις γίνει ένα με το κατσαβίδι! 🌀' },
        ],
        'ordersCreated': [
            { count: 1, message: 'Πρώτη Παραγγελία Καταχωρήθηκε! Ωραία δουλειά! 📝' },
            { count: 10, message: '10 Παραγγελίες Καταχωρήθηκαν! Είσαι ο Οργανωτής! 💼' },
            { count: 50, message: '50 Παραγγελίες Καταχωρήθηκαν! Απίστευτος! 🌟' },
            { count: 100, message: '100 Παραγγελίες! Είσαι ο Αυτοκράτορας της Οργάνωσης! 🏯' },
            { count: 250, message: '250 Παραγγελίες! Η τάξη είναι το δεύτερό σου όνομα! 📚' },
            { count: 500, message: '500 Παραγγελίες! Το χάος τρέμει στο πέρασμά σου! 🌌' },
            { count: 1000, message: '1000 Παραγγελίες! Έχεις φτάσει στο επίπεδο του Βιβλιοθηκονόμου! 📜' },
        ]
    };

    if (achievements[statName]) {
        achievements[statName].forEach(achievement => {
            if (currentCount === achievement.count && !unlockedAchievements[`${statName}-${achievement.count}`]) {
                showAchievementNotification(achievement.message);
                unlockedAchievements[`${statName}-${achievement.count}`] = true;
                if (config.levelUpSystemEnabled) {
                    // Grant bonus XP for achievements
                    if (XP_CONFIG.achievement) {
                        grantXp(config, STORAGE_KEYS, XP_CONFIG.achievement);
                    }
                    // New: Trigger Eureka animation on achievement unlock // Pass config
                    if (config.interactiveMascotEnabled && typeof triggerEurekaAnimation === 'function') { // Pass config
                        triggerEurekaAnimation(config);
                    }
                    if (config.interactiveMascotEnabled) setMascotState(config, 'happy', 5000);
                }
                GM_setValue(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlockedAchievements));
            }
        });
    }
}

// ===================================================================
// === DAILY BOUNTIES / QUESTS SYSTEM
// ===================================================================
function generateDailyQuests(STORAGE_KEYS, config) {
    const mascotEnabled = config?.interactiveMascotEnabled !== false;
    const pool = mascotEnabled
        ? QUEST_POOL
        : QUEST_POOL.filter(q => q.targetStat !== 'petMascot' && q.targetStat !== 'feedMascot');
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const dailyQuests = shuffled.slice(0, 3).map(quest => ({
        ...quest,
        progress: 0,
        claimed: false
    }));
    GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(dailyQuests));
    console.log('[MMS] New daily quests generated!');
}

function updateQuestProgress(STORAGE_KEYS, statName, value = 1) {
    let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
    if (quests.length === 0) return;

    let questsUpdated = false;
    quests.forEach(quest => {
        if (quest.targetStat === statName && !quest.claimed && quest.progress < quest.targetCount) {
            quest.progress += value;
            if (quest.progress >= quest.targetCount) {
                quest.progress = quest.targetCount; // Cap progress at target
                const completeMessage = `Bounty Complete: ${quest.description}`;
                
                // Queue the bounty completion notification
                if (typeof queueNotification === 'function') {
                    queueNotification('bounty', { message: completeMessage });
                } else {
                showPositiveMessage(completeMessage);
                }
                
                // Log bounty completion to notification center
                if (typeof createNotification === 'function') {
                createNotification(completeMessage, '📜');
                }
            }
            questsUpdated = true;
        }
    });

    if (questsUpdated) {
        GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
    }
}

function showQuestsModal(config, STORAGE_KEYS) {
    if (document.querySelector('.tm-modal-overlay')) return; // Prevent multiple modals

    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 600px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h2 class="tm-modal-title">📜 Daily Bounties</h2>
                <span id="tm-reroll-token-display" title="Bounty Reroll Tokens"></span>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div id="tm-quests-container" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;"></div>
        </div>
    `;
    // Add a class if there are completable bounties with a token
    const quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
    const hasCompletableBounty = quests.some(q => !q.claimed && q.progress < q.targetCount);
    const hasToken = (GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0) > 0;
    if (hasCompletableBounty && hasToken) overlay.classList.add('has-bounty-token');
    document.body.appendChild(overlay);

    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    populateQuestsModal(config, STORAGE_KEYS);
}

function populateQuestsModal(config, STORAGE_KEYS) {
    const container = document.getElementById('tm-quests-container');
    if (!container) return;

    const rerollTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);
    const tokenDisplay = document.getElementById('tm-reroll-token-display');
    if (tokenDisplay) {
        tokenDisplay.innerHTML = `🔄 ${rerollTokens}`;
    }

    const bountyTokens = GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0;
    const bountyTokenDisplay = document.createElement('span');
    if (bountyTokenDisplay) {
        bountyTokenDisplay.innerHTML = ` | 🎯 ${bountyTokens}`;
        tokenDisplay.insertAdjacentElement('afterend', bountyTokenDisplay);
    }

    const quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
    if (quests.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">Bounties refresh daily. Check back tomorrow!</p>';
        return;
    }

    container.innerHTML = quests.map(quest => {
        const isComplete = quest.progress >= quest.targetCount;
        const progressPercent = (quest.progress / quest.targetCount) * 100;
        const canReroll = !quest.claimed && !isComplete && rerollTokens > 0;
        const canUseToken = !quest.claimed && !isComplete && bountyTokens > 0;
        return `
            <div class="tm-quest-item ${quest.claimed ? 'completed' : ''}">
                <div class="tm-quest-status-icon">${isComplete ? '✅' : '⏳'}</div>
                <div class="tm-quest-details">
                    <div class="tm-quest-description">${quest.description}</div>
                    <div class="tm-quest-progress-bar" title="${quest.progress} / ${quest.targetCount}">
                        <div style="width: ${progressPercent}%;"></div>
                    </div>
                    <div class="tm-quest-progress-text">${quest.progress} / ${quest.targetCount}</div>
                </div>
                <div class="tm-quest-reward">
                    XP: ${quest.rewardXp}<br>Coins: ${quest.rewardCoins}
                </div>
                <div class="tm-quest-actions">
                    <button class="tm-quest-claim-btn" data-quest-id="${quest.id}" ${(!isComplete || quest.claimed) ? 'disabled' : ''}>
                        ${quest.claimed ? 'Claimed' : 'Claim'}
                    </button>
                    <button class="tm-quest-reroll-btn" data-quest-id="${quest.id}" title="Reroll this bounty" ${!canReroll ? 'disabled' : ''}>🔄</button>
                    <button class="tm-quest-complete-btn" data-quest-id="${quest.id}" title="Use a Bounty Completion Token" ${!canUseToken ? 'disabled' : ''}>🎯</button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.tm-quest-claim-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questId = e.target.dataset.questId;
            let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
            const quest = quests.find(q => q.id === questId);
            if (quest && !quest.claimed && quest.progress >= quest.targetCount) {
                grantXp(config, STORAGE_KEYS, quest.rewardXp);
                grantCoins(config, STORAGE_KEYS, quest.rewardCoins, 'quest');
                quest.claimed = true;
                // New: Chance to trigger Energized state on bounty completion
                if (Math.random() < 0.33) { // 33% chance
                    triggerEnergizedState(config, STORAGE_KEYS, 5 * 60 * 1000); // 5 minutes
                }
                GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
                populateQuestsModal(config, STORAGE_KEYS); // Re-render the modal to update state
                
                // Refresh the page after claiming quest rewards
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
    });

    container.querySelectorAll('.tm-quest-reroll-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questIdToReroll = e.target.dataset.questId;
            let currentTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);

            if (currentTokens <= 0) {
                showPositiveMessage("No reroll tokens left!");
                return;
            }

            if (!confirm("Use 1 Reroll Token to get a new bounty?")) return;

            // Decrement token and save
            currentTokens--;
            GM_setValue(STORAGE_KEYS.USER_REROLL_TOKENS, currentTokens);

            // Find a new quest
            let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
            const currentQuestIds = quests.map(q => q.id);
            const mascotEnabled = config?.interactiveMascotEnabled !== false;
            const availableNewQuests = QUEST_POOL.filter(p =>
                !currentQuestIds.includes(p.id) &&
                (mascotEnabled || (p.targetStat !== 'petMascot' && p.targetStat !== 'feedMascot'))
            );

            if (availableNewQuests.length > 0) {
                const newQuestTemplate = availableNewQuests[Math.floor(Math.random() * availableNewQuests.length)];
                const newQuest = { ...newQuestTemplate, progress: 0, claimed: false };

                // Replace the old quest
                const questIndex = quests.findIndex(q => q.id === questIdToReroll);
                if (questIndex !== -1) {
                    quests[questIndex] = newQuest;
                    GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
                    populateQuestsModal(config, STORAGE_KEYS); // Re-render
                }
            } else {
                showPositiveMessage("No more unique bounties available today!");
            }
        });
    });

    container.querySelectorAll('.tm-quest-complete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questIdToComplete = e.target.dataset.questId;
            let currentTokens = GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0;

            if (currentTokens <= 0) {
                showPositiveMessage("No Bounty Completion Tokens left!");
                return;
            }

            if (!confirm("Use 1 Bounty Completion Token to instantly complete this bounty?")) return;

            // Decrement token and save
            GM_setValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, currentTokens - 1);

            let quests = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_QUESTS, '[]'));
            const quest = quests.find(q => q.id === questIdToComplete);
            if (quest) {
                quest.progress = quest.targetCount; // Instantly complete
                GM_setValue(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
                populateQuestsModal(config, STORAGE_KEYS); // Re-render
                
                // Refresh the page after using completion token
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
    });
}

/**
 * Creates and displays a modal showing all available titles and ranks.
 */
function showTitlesModal(STORAGE_KEYS) {
    if (document.querySelector('#tm-titles-modal')) return; // Prevent multiple modals

    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const currentXp = GM_getValue(STORAGE_KEYS.USER_XP, 0);
    const xpForNextLevel = getXpForLevel(currentLevel);
    const xpProgress = (currentXp / xpForNextLevel * 100).toFixed(1);

    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.id = 'tm-titles-modal';
    
    // Get current bonuses
    const bonuses = getCurrentLevelBonuses(STORAGE_KEYS);
    
    // Get current and next rank
    const currentRank = RANKS.slice().reverse().find(r => currentLevel >= r.level) || RANKS[0];
    const nextRank = RANKS.find(r => r.level > currentLevel);
    
    // Current Bonuses Section
    let currentBonusesHTML = '';
    if (bonuses) {
        currentBonusesHTML = `
            <div style="margin-bottom: 25px; padding: 20px; background: #ffffff; border-radius: 8px; border: 1px solid #dee2e6;">
                <h3 style="margin: 0 0 15px 0; color: #212529; font-size: 20px; text-align: center; font-weight: 600;">🎯 Τα Τρέχοντα Μπόνους Σου</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                    ${bonuses.permanentXpBoost > 0 ? `
                        <div style="padding: 12px; background: #e7f3ff; border: 1px solid #007bff; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">✨</div>
                            <div style="font-size: 16px; font-weight: bold; color: #0056b3;">+${(bonuses.permanentXpBoost * 100).toFixed(1)}%</div>
                            <div style="font-size: 11px; color: #495057;">Μόνιμο XP</div>
                        </div>
                    ` : ''}
                    ${bonuses.coinMultiplier > 0 ? `
                        <div style="padding: 12px; background: #d4edda; border: 1px solid #28a745; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">💎</div>
                            <div style="font-size: 16px; font-weight: bold; color: #155724;">+${(bonuses.coinMultiplier * 100).toFixed(1)}%</div>
                            <div style="font-size: 11px; color: #495057;">Νομίσματα</div>
                        </div>
                    ` : ''}
                    ${bonuses.shopDiscount > 0 ? `
                        <div style="padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">🏪</div>
                            <div style="font-size: 16px; font-weight: bold; color: #856404;">${(bonuses.shopDiscount * 100).toFixed(1)}%</div>
                            <div style="font-size: 11px; color: #495057;">Έκπτωση</div>
                        </div>
                    ` : ''}
                    ${bonuses.mascotFood > 0 ? `
                        <div style="padding: 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">🍖</div>
                            <div style="font-size: 16px; font-weight: bold; color: #212529;">${bonuses.mascotFood}</div>
                            <div style="font-size: 11px; color: #495057;">Φαγητό</div>
                        </div>
                    ` : ''}
                    ${bonuses.mascotTreats > 0 ? `
                        <div style="padding: 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">🍰</div>
                            <div style="font-size: 16px; font-weight: bold; color: #212529;">${bonuses.mascotTreats}</div>
                            <div style="font-size: 11px; color: #495057;">Λιχουδιά</div>
                        </div>
                    ` : ''}
                    ${bonuses.energizedBuffs > 0 ? `
                        <div style="padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">⚡</div>
                            <div style="font-size: 16px; font-weight: bold; color: #856404;">${bonuses.energizedBuffs}</div>
                            <div style="font-size: 11px; color: #495057;">XP Buffs</div>
                        </div>
                    ` : ''}
                    ${bonuses.doubleCoinsBuffs > 0 ? `
                        <div style="padding: 12px; background: #d4edda; border: 1px solid #28a745; border-radius: 6px; text-align: center;">
                            <div style="font-size: 20px; margin-bottom: 5px;">💰</div>
                            <div style="font-size: 16px; font-weight: bold; color: #155724;">${bonuses.doubleCoinsBuffs}</div>
                            <div style="font-size: 11px; color: #495057;">Coin Buffs</div>
                        </div>
                    ` : ''}
                </div>
                ${bonuses.isAscended || bonuses.isDigitalArchon ? `
                    <div style="margin-top: 15px; text-align: center; padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;">
                        ${bonuses.isDigitalArchon ? `
                            <div style="font-size: 16px; font-weight: bold; color: #856404;">⚡ DIGITAL ARCHON - Η Απόλυτη Δύναμη!</div>
                        ` : bonuses.isAscended ? `
                            <div style="font-size: 16px; font-weight: bold; color: #856404;">🌟 ASCENDED - Divine Status!</div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Titles Section - Grouped by rarity
    const titlesHTML = RANKS.map((rank, index) => {
        const isUnlocked = currentLevel >= rank.level;
        const isCurrent = rank.level === currentRank.level;
        const isNext = nextRank && rank.level === nextRank.level;
        
        let borderColor = '#dee2e6';
        let bgColor = isUnlocked ? '#ffffff' : '#f8f9fa';
        let badge = '';
        
        if (isCurrent) {
            borderColor = '#007bff';
            bgColor = '#e7f3ff';
            badge = '<span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-left: 8px;">ΤΡΕΧΩΝ</span>';
        } else if (isNext) {
            borderColor = '#28a745';
            bgColor = '#d4edda';
            badge = '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; margin-left: 8px;">ΕΠΟΜΕΝΟΣ</span>';
        }
        
        const lockIcon = isUnlocked ? '✅' : '🔒';
        const opacity = isUnlocked ? '1' : '0.5';

        return `
            <div class="tm-title-item" style="display: flex; align-items: center; gap: 15px; padding: 15px; background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 8px; margin-bottom: 10px; opacity: ${opacity}; transition: all 0.2s;">
                <div style="flex-shrink: 0; font-size: 36px; line-height: 1;">${lockIcon}</div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6c757d; font-weight: 600; background: #f8f9fa; padding: 2px 8px; border-radius: 12px;">ΕΠΙΠΕΔΟ ${rank.level}</span>
                        ${badge}
                    </div>
                    <div style="color: ${rank.color}; font-size: 18px; font-weight: 700; ${rank.glow ? 'text-shadow: 0 0 10px ' + rank.color + ';' : ''}">${rank.title}</div>
                    ${!isUnlocked ? `<div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Ξεκλειδώνει σε ${rank.level - currentLevel} επίπεδα</div>` : ''}
                </div>
                <div style="flex-shrink: 0; font-size: 48px; opacity: 0.3;">🏆</div>
            </div>
        `;
    }).join('');
    
    // Level Rewards Section - More organized
    const levelRewardsHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="margin: 0 0 8px 0; color: #212529; font-size: 15px; font-weight: 600;">📖 Σχετικά με τις Επιβραβεύσεις</h4>
            <p style="margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6;">
                Κάθε επίπεδο φέρνει νέες επιβραβεύσεις! Βασικές επιβραβεύσεις σε κάθε επίπεδο, και ειδικά μπόνους σε συγκεκριμένα ορόσημα.
            </p>
        </div>
        
        <div style="padding: 20px; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-radius: 8px; border: 2px solid #28a745; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #155724; font-size: 18px; font-weight: 700;">📦 Βασικές Επιβραβεύσεις</h4>
                <div style="font-size: 12px; color: #155724; margin-top: 5px; opacity: 0.8;">Σε κάθε επίπεδο παίρνεις:</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 1px solid #c3e6cb;">
                    <div style="font-size: 36px; margin-bottom: 8px;">💰</div>
                    <div style="font-weight: 700; color: #155724; font-size: 18px;">+100</div>
                    <div style="font-size: 12px; color: #6c757d;">Fixer-Coins</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 1px solid #c3e6cb;">
                    <div style="font-size: 36px; margin-bottom: 8px;">🌟</div>
                    <div style="font-weight: 700; color: #0056b3; font-size: 18px;">+1</div>
                    <div style="font-size: 12px; color: #6c757d;">Talent Point</div>
                </div>
            </div>
        </div>
        
        <h4 style="margin: 0 0 15px 0; color: #212529; font-size: 16px; font-weight: 600; text-align: center;">🎯 Ειδικές Επιβραβεύσεις ανά Ορόσημο</h4>
            
            <details style="margin-bottom: 12px; padding: 0; background: #ffffff; border: 2px solid #e3f2fd; border-radius: 8px; cursor: pointer; overflow: hidden;">
                <summary style="padding: 15px; font-weight: 600; color: #0d47a1; font-size: 15px; cursor: pointer; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%); list-style: none; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🌟</span>
                    <span style="flex: 1;">Πρώιμα Επίπεδα (1-10)</span>
                    <span style="font-size: 20px; opacity: 0.5;">▼</span>
                </summary>
                <div style="padding: 15px; font-size: 13px; line-height: 2; color: #495057; background: #f8f9fa;">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.2</span> 💰 +50 bonus coins</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.3</span> ✨ +2% μόνιμο XP boost</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.4</span> 🍖 +5 φαγητό mascot</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.5</span> 🔄 +1 reroll, ✨ +1% XP</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.6</span> 💰 +150 bonus coins</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.7</span> 🍰 +3 ειδικά λιχουδιά</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.8</span> 🏪 5% έκπτωση καταστήματος</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.9</span> 💰 +200 bonus coins</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px;"><span style="font-weight: 700; color: #007bff; min-width: 50px;">Lv.10</span> 🔄 +1 reroll, 📜 +1 search slot, ✨ +1% XP</div>
                </div>
            </details>
            
            <details style="margin-bottom: 12px; padding: 0; background: #ffffff; border: 2px solid #c3e6cb; border-radius: 8px; cursor: pointer; overflow: hidden;">
                <summary style="padding: 15px; font-weight: 600; color: #155724; font-size: 15px; cursor: pointer; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 50%); list-style: none; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">⚡</span>
                    <span style="flex: 1;">Μεσαία Επίπεδα (11-30)</span>
                    <span style="font-size: 20px; opacity: 0.5;">▼</span>
                </summary>
                <div style="padding: 15px; font-size: 13px; line-height: 2; color: #495057; background: #f8f9fa;">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #28a745; min-width: 50px;">Lv.15</span> 🌊 Δωρεάν Oceanic Theme + bonuses</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #28a745; min-width: 50px;">Lv.18</span> 🏪 10% έκπτωση καταστήματος</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #28a745; min-width: 50px;">Lv.20</span> 🔄 +2 rerolls, ✨ +1% XP, 🍖 +15 food</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #28a745; min-width: 50px;">Lv.25</span> 🔄 +2 rerolls, ✨ +2% XP, 📜 +1 search slot</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px;"><span style="font-weight: 700; color: #28a745; min-width: 50px;">Lv.30</span> 🥽 Δωρεάν Tech Goggles + major bonuses</div>
                </div>
            </details>
            
            <details style="margin-bottom: 12px; padding: 0; background: #ffffff; border: 2px solid #b3d7ff; border-radius: 8px; cursor: pointer; overflow: hidden;">
                <summary style="padding: 15px; font-weight: 600; color: #004085; font-size: 15px; cursor: pointer; background: linear-gradient(135deg, #cce5ff 0%, #b3d7ff 50%); list-style: none; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">💎</span>
                    <span style="flex: 1;">Υψηλά Επίπεδα (31-75)</span>
                    <span style="font-size: 20px; opacity: 0.5;">▼</span>
                </summary>
                <div style="padding: 15px; font-size: 13px; line-height: 2; color: #495057; background: #f8f9fa;">
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #0056b3; min-width: 50px;">Lv.40</span> 🔄 +3 rerolls, ✨ +3% XP, 🍰 +10 treats, 💎 +15% coin earnings</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;"><span style="font-weight: 700; color: #0056b3; min-width: 50px;">Lv.50</span> 🎉 MILESTONE! 🌙 Midnight Theme, 🔄 +4 rerolls, ✨ +5% XP, 💰 +1000 coins</div>
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px;"><span style="font-weight: 700; color: #0056b3; min-width: 50px;">Lv.75</span> ⚡ EPIC! 🏅 Legend Badge, 🔄 +5 rerolls, ✨ +5% XP, 💰 +1500 coins</div>
                </div>
            </details>
            
            <details style="margin-bottom: 12px; padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; cursor: pointer;">
                <summary style="font-weight: 600; color: #856404; font-size: 14px; cursor: pointer;">👑 Elite Επίπεδα (76-100)</summary>
                <div style="margin-top: 10px; padding: 10px; font-size: 12px; line-height: 1.8; color: #856404;">
                    <div><b>Lv.80:</b> +35% coin earnings, +2 search slots</div>
                    <div><b>Lv.90:</b> +10% XP boost, +2000 coins, +50 food</div>
                    <div style="margin-top: 10px; padding: 10px; background: #ffffff; border: 1px solid #ffc107; border-radius: 6px;">
                        <b style="color: #856404;">Lv.100: 👑 LEGENDARY!</b><br>
                        • Master's Crown (auto-equipped)<br>
                        • +10 rerolls<br>
                        • +20% XP boost<br>
                        • +5000 coins<br>
                        • +75% coin earnings<br>
                        • 50% shop discount<br>
                        • +5 search slots
                    </div>
                </div>
            </details>
            
            <details style="margin-bottom: 12px; padding: 12px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; cursor: pointer;">
                <summary style="font-weight: 600; color: #721c24; font-size: 14px; cursor: pointer;">🌟 Post-100 (Αφοσιωμένοι Παίκτες)</summary>
                <div style="margin-top: 10px; padding: 10px; font-size: 12px; line-height: 1.8; color: #721c24;">
                    <div style="margin-bottom: 10px; padding: 10px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px;">
                        <b style="color: #0c5460;">Lv.150: ✨ TRANSCENDENT!</b><br>
                        🌌 Ultimate Theme, +15 rerolls, +25% XP, +10000 coins, +145% coins, 75% shop discount
                    </div>
                    <div style="margin-bottom: 10px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;">
                        <b style="color: #856404;">Lv.200: 🌟 ASCENDED!</b><br>
                        Divine Status, +20 rerolls, +30% XP, +15000 coins, +245% coins, +10 search slots
                    </div>
                    <div style="padding: 10px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px;">
                        <b style="color: #721c24;">Lv.250: ⚡ DIGITAL ARCHON!</b><br>
                        Ultimate Power, +50 rerolls, +50% XP, +25000 coins, +445% coins, 125% shop discount (FREE + REFUNDS!)
                    </div>
                </div>
            </details>
            
            <div style="margin-top: 15px; padding: 12px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; text-align: center; font-size: 12px; color: #155724;">
                💡 <i>Όλα τα μπόνους είναι μόνιμα και αθροιστικά!</i>
            </div>
        </div>
    `;

    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 1000px; height: auto; max-height: 90vh; display: flex; flex-direction: column; background: #f8f9fa !important;">
            <!-- Header with Progress -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px 8px 0 0;">
                <button class="tm-modal-close" style="color: white !important; position: absolute; top: 15px; right: 20px; font-size: 28px; opacity: 0.9;">&times;</button>
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                    <div style="font-size: 64px;">🏆</div>
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 5px 0; font-size: 28px; font-weight: 700;">Επίπεδο ${currentLevel}</h2>
                        <div style="font-size: 18px; opacity: 0.9; margin-bottom: 10px;">${currentRank.title}</div>
                        ${nextRank ? `
                            <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">Επόμενος τίτλος σε ${nextRank.level - currentLevel} επίπεδα: ${nextRank.title}</div>
                        ` : '<div style="font-size: 13px; opacity: 0.8;">Έφτασες το μέγιστο επίπεδο τίτλου!</div>'}
                        <div style="background: rgba(255,255,255,0.2); border-radius: 20px; height: 24px; overflow: hidden; position: relative;">
                            <div style="background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%); height: 100%; width: ${xpProgress}%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; border-radius: 20px;">
                                <span style="font-size: 11px; font-weight: 600; position: absolute; left: 50%; transform: translateX(-50%); text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${currentXp.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP (${xpProgress}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div style="display: flex; background: #ffffff; border-bottom: 2px solid #dee2e6;">
                <button class="tm-rank-tab active" data-tab="overview" style="flex: 1; padding: 15px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #6c757d; border-bottom: 3px solid transparent; transition: all 0.2s;">
                    📊 Επισκόπηση
                </button>
                <button class="tm-rank-tab" data-tab="titles" style="flex: 1; padding: 15px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #6c757d; border-bottom: 3px solid transparent; transition: all 0.2s;">
                    🏅 Τίτλοι
                </button>
                <button class="tm-rank-tab" data-tab="rewards" style="flex: 1; padding: 15px; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 14px; color: #6c757d; border-bottom: 3px solid transparent; transition: all 0.2s;">
                    🎁 Επιβραβεύσεις
                </button>
            </div>

            <!-- Tab Content -->
            <div style="flex: 1; overflow-y: auto; padding: 20px; background: #f8f9fa !important;">
                <!-- Overview Tab -->
                <div class="tm-rank-tab-content" data-tab="overview" style="display: block;">
                    ${currentBonusesHTML}
                    
                    <!-- Quick Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                        <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
                            <div style="font-size: 24px; font-weight: bold; color: #007bff;">${currentLevel}</div>
                            <div style="font-size: 12px; color: #6c757d;">Τρέχον Επίπεδο</div>
                        </div>
                        <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
                            <div style="font-size: 24px; font-weight: bold; color: #28a745;">${RANKS.filter(r => currentLevel >= r.level).length}</div>
                            <div style="font-size: 12px; color: #6c757d;">Ξεκλειδωμένοι Τίτλοι</div>
                        </div>
                        <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">🔓</div>
                            <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${RANKS.filter(r => currentLevel < r.level).length}</div>
                            <div style="font-size: 12px; color: #6c757d;">Κλειδωμένοι Τίτλοι</div>
                        </div>
                    </div>

                    ${nextRank ? `
                        <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 8px; border: 1px solid #2196f3;">
                            <h4 style="margin: 0 0 10px 0; color: #0d47a1; font-size: 16px; font-weight: 600;">🎯 Επόμενος Στόχος</h4>
                            <div style="font-size: 14px; color: #1565c0; margin-bottom: 8px;">
                                <b>Επίπεδο ${nextRank.level}:</b> <span style="color: ${nextRank.color};">${nextRank.title}</span>
                            </div>
                            <div style="font-size: 13px; color: #1976d2;">
                                Απομένουν <b>${nextRank.level - currentLevel}</b> επίπεδα
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Titles Tab -->
                <div class="tm-rank-tab-content" data-tab="titles" style="display: none;">
                    <div style="margin-bottom: 15px; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #dee2e6;">
                        <h4 style="margin: 0 0 8px 0; color: #212529; font-size: 15px; font-weight: 600;">📖 Σχετικά με τους Τίτλους</h4>
                        <p style="margin: 0; font-size: 13px; color: #6c757d; line-height: 1.6;">
                            Οι τίτλοι ξεκλειδώνονται καθώς ανεβαίνεις επίπεδο. Κάθε τίτλος αντιπροσωπεύει την πρόοδό σου και την εμπειρία σου!
                        </p>
                    </div>
                    ${titlesHTML}
                </div>

                <!-- Rewards Tab -->
                <div class="tm-rank-tab-content" data-tab="rewards" style="display: none;">
                    ${levelRewardsHTML}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Tab switching logic
    const tabs = overlay.querySelectorAll('.tm-rank-tab');
    const tabContents = overlay.querySelectorAll('.tm-rank-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => {
                t.style.color = '#6c757d';
                t.style.borderBottomColor = 'transparent';
                t.classList.remove('active');
            });
            tab.style.color = '#007bff';
            tab.style.borderBottomColor = '#007bff';
            tab.classList.add('active');
            
            // Show target content
            tabContents.forEach(content => {
                content.style.display = content.dataset.tab === targetTab ? 'block' : 'none';
            });
        });
    });
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// Talent modal - moved out of settings
function showTalentsModal(config, STORAGE_KEYS) {
    const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const visibleTalentTree = config?.interactiveMascotEnabled !== false
        ? TALENT_TREE
        : TALENT_TREE.filter(t => t.id !== 'mascot_lover');
    
    // Count available talents
    const availableTalents = visibleTalentTree.filter(t => currentLevel >= t.levelRequired).length;
    const totalTalents = visibleTalentTree.length;
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 900px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h3>🌟 Talent Tree (${unlockedTalents.length}/${availableTalents} Unlocked)</h3>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div class="tm-modal-body" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;">
                <!-- Talent Points Display -->
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-bottom: 16px;">
                    <div style="
                        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                    ">
                        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Available Points</div>
                        <div style="font-size: 38px; font-weight: bold;">⭐ ${talentPoints}</div>
                        <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Earn 1 per level</div>
                    </div>
                    
                    <div style="
                        background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border);
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        min-width: 180px;
                    ">
                        <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-bottom: 4px;">Progress</div>
                        <div style="font-size: 24px; font-weight: bold; color: #4facfe;">${unlockedTalents.length}/${availableTalents}</div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${totalTalents - availableTalents} locked by level</div>
                    </div>
                </div>
                
                <!-- Talents Grid -->
                <div id="tm-talents-modal-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    populateTalentsModal(STORAGE_KEYS, config);
}

function populateTalentsModal(STORAGE_KEYS, config) {
    const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const grid = document.getElementById('tm-talents-modal-grid');
    
    if (!grid) return;
    
    const visibleTalentTree = config?.interactiveMascotEnabled !== false
        ? TALENT_TREE
        : TALENT_TREE.filter(t => t.id !== 'mascot_lover');

    grid.innerHTML = visibleTalentTree.map(talent => {
        const isUnlocked = unlockedTalents.includes(talent.id);
        const canAfford = talentPoints >= talent.cost;
        const levelMet = currentLevel >= talent.levelRequired;
        const canUnlock = canAfford && levelMet && !isUnlocked;
        
        // Determine tier color based on level requirement
        let tierColor = '#94a3b8';
        let tierLabel = 'Novice';
        if (talent.levelRequired >= 250) { tierColor = '#e5cc80'; tierLabel = 'DIVINE'; }
        else if (talent.levelRequired >= 200) { tierColor = '#ff1493'; tierLabel = 'GODLIKE'; }
        else if (talent.levelRequired >= 150) { tierColor = '#ff00ff'; tierLabel = 'ULTIMATE'; }
        else if (talent.levelRequired >= 100) { tierColor = '#ff8000'; tierLabel = 'LEGENDARY'; }
        else if (talent.levelRequired >= 75) { tierColor = '#ffd700'; tierLabel = 'Grandmaster'; }
        else if (talent.levelRequired >= 50) { tierColor = '#a335ee'; tierLabel = 'Elite'; }
        else if (talent.levelRequired >= 40) { tierColor = '#9c27b0'; tierLabel = 'Epic'; }
        else if (talent.levelRequired >= 30) { tierColor = '#673ab7'; tierLabel = 'Master'; }
        else if (talent.levelRequired >= 20) { tierColor = '#3f51b5'; tierLabel = 'Advanced'; }
        else if (talent.levelRequired >= 15) { tierColor = '#2196f3'; tierLabel = 'Expert'; }
        else if (talent.levelRequired >= 10) { tierColor = '#03a9f4'; tierLabel = 'Skilled'; }
        else if (talent.levelRequired >= 5) { tierColor = '#00bcd4'; tierLabel = 'Apprentice'; }

        return `
            <div style="
                background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border);
                border-radius: 10px;
                padding: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ${isUnlocked ? `border-left: 4px solid ${tierColor};` : ''}
                ${!levelMet ? 'opacity: 0.5; filter: grayscale(80%);' : ''}
                transition: all 0.3s;
                position: relative;
            " class="tm-talent-card">
                <!-- Tier Badge -->
                <div style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: ${tierColor};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">${tierLabel}</div>
                
                <div style="font-weight: 700; font-size: 14px; color: ${isUnlocked ? tierColor : '#2c3e50'}; margin-bottom: 6px; padding-right: 60px;">
                    ${isUnlocked ? '✓ ' : '🔒 '}${talent.name}
            </div>
                
                <!-- Level Requirement -->
                <div style="font-size: 10px; color: ${levelMet ? '#4caf50' : '#ef5350'}; margin-bottom: 6px; font-weight: 600;">
                    ${levelMet ? '✓' : '🔒'} Requires Level ${talent.levelRequired}
                </div>
                
                <div style="font-size: 12px; color: var(--tm-secondary-hover); min-height: 36px; margin-bottom: 12px; line-height: 1.4;">
                    ${talent.description}
                </div>
                ${isUnlocked ? `
                    <button style="
                        width: 100%;
                        padding: 8px;
                        background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 11px;
                        cursor: not-allowed;
                    " disabled>✓ Unlocked</button>
                ` : !levelMet ? `
                    <button style="
                        width: 100%;
                        padding: 8px;
                        background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 11px;
                        cursor: not-allowed;
                    " disabled>🔒 Level ${talent.levelRequired} Required</button>
                ` : `
                    <button class="tm-talent-unlock-btn" data-talent-id="${talent.id}" style="
                        width: 100%;
                        padding: 8px;
                        background: linear-gradient(135deg, ${canUnlock ? '#4facfe 0%, #00f2fe 100%' : '#cbd5e1 0%, #94a3b8 100%'});
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 11px;
                        cursor: ${canUnlock ? 'pointer' : 'not-allowed'};
                        transition: all 0.2s;
                    " ${!canUnlock ? 'disabled' : ''}>
                        ${canAfford ? `Unlock (⭐ ${talent.cost})` : `Need ${talent.cost - talentPoints} more points`}
                    </button>
                `}
        </div>
    `;
    }).join('');
    
    // Add event listeners
    grid.querySelectorAll('.tm-talent-unlock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const talentId = btn.dataset.talentId;
    const talent = TALENT_TREE.find(t => t.id === talentId);

    if (talent) {
                const level = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
                let points = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                
                // Check level requirement
                if (level < talent.levelRequired) {
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage(`🔒 Requires Level ${talent.levelRequired}!`);
                    }
                    return;
                }
                
                if (points >= talent.cost) {
                    points -= talent.cost;
                    GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, points);
                    
                    let unlocked = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                    unlocked.push(talentId);
                    GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlocked));
                    
                    // Determine tier for message
                    let tierMsg = '';
                    if (talent.levelRequired >= 250) tierMsg = ' (DIVINE!)';
                    else if (talent.levelRequired >= 200) tierMsg = ' (GODLIKE!)';
                    else if (talent.levelRequired >= 150) tierMsg = ' (ULTIMATE!)';
                    else if (talent.levelRequired >= 100) tierMsg = ' (LEGENDARY!)';
                    
                    if (window.showPositiveMessage) {
                        window.showPositiveMessage(`🌟 ${talent.name} unlocked${tierMsg}`);
                    }
                    
                    // Refresh the modal
                    document.querySelector('.tm-modal-overlay').remove();
                    showTalentsModal(window.config, STORAGE_KEYS);
                }
            }
        });
    });
}

// Keep old function for backward compatibility with settings page (but make it simpler)
function getTalentsHTML(STORAGE_KEYS) {
    return `
        <div class="tm-settings-section">
            <h3>🌟 Talents</h3>
            <p class="tm-setting-description">Το Talent Tree βρίσκεται στο <strong>Personal Dashboard</strong> → καρτέλα <strong>🌟 Talents</strong> (κλικ στο ημερήσιο widget στατιστικών ή ανοίξτε το dashboard από το μενού).</p>
            <div style="text-align: center; padding: 20px;">
                <button onclick="(function(){ try { window.showDashboardModal?.(window.config, window.STORAGE_KEYS); setTimeout(function(){ document.querySelector('.tm-dashboard-tab[data-tab=talents]')?.click(); }, 120); } catch(e) {} })()" style="
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">🌟 Άνοιγμα Talents (Dashboard)</button>
            </div>
        </div>
    `;
}

function showShopModal(config, STORAGE_KEYS) {
    // Check if shop is enabled
    if (!config.shopEnabled) {
        if (window.showPositiveMessage) {
            window.showPositiveMessage('Shop is disabled in settings');
        }
        return;
    }
    
    if (document.querySelector('#tm-shop-modal')) return; // Prevent multiple modals

    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.id = 'tm-shop-modal';
    const accessoriesTabHtml = config.interactiveMascotEnabled
        ? `<button class="tm-shop-tab" data-category="accessories">🎩 Accessories</button>`
        : '';

    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 700px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h2 class="tm-modal-title">🪙 Shop</h2>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div id="tm-shop-content-container" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px; padding-right: 10px;">
                <div class="tm-shop-tabs">
                    <button class="tm-shop-tab active" data-category="themes">🎨 Themes</button>
                    ${accessoriesTabHtml}
                    <button class="tm-shop-tab" data-category="consumables">⚡ Consumables</button>
                </div>
                <div id="tm-shop-items-wrapper">
                    <!-- Shop items will be populated here -->
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    populateShop(config, STORAGE_KEYS); // Populate the content

    // Add tab switching logic
    const tabsContainer = overlay.querySelector('.tm-shop-tabs');
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.tm-shop-tab') && !e.target.classList.contains('active')) {
            const category = e.target.dataset.category;
            // Update tab active state
            tabsContainer.querySelectorAll('.tm-shop-tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            // Update content active state
            overlay.querySelectorAll('.tm-shop-category-content').forEach(content => content.classList.remove('active'));
            overlay.querySelector(`#tm-shop-category-${category}`).classList.add('active');
        }
    });

    // --- Shop Logic ---
    overlay.querySelector('#tm-shop-items-wrapper').addEventListener('click', (e) => {
        if (e.target.matches('.tm-shop-item-btn')) {
            if (e.target.classList.contains('buy')) {
                handleShopPurchase(e.target, config, STORAGE_KEYS); // This function is already defined and handles purchases
            } else if (e.target.classList.contains('equip') || e.target.classList.contains('equipped')) {
                const button = e.target;
                const itemId = button.dataset.itemId;
                const itemType = button.dataset.itemType;

                // Equip/Unequip logic
                if (itemType === 'accessory') {
                    let equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                    const accessoryElement = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                    
                    if (!accessoryElement) {
                        console.error(`[MMS Shop] Failed to get accessory element for ${itemId}`);
                        return;
                    }

                    if (equippedItems.includes(itemId)) {
                        // Unequip: Remove from array and hide element
                        equippedItems = equippedItems.filter(id => id !== itemId);
                        if (accessoryElement) accessoryElement.style.display = 'none';
                        console.log(`[MMS Shop] Unequipped ${itemId}`);
                        
                        // Reset mascot state to idle when unequipping animation accessories
                        if (itemId === 'stunt_bike' || itemId === 'juggling_balls' || itemId === 'bookworm_kit') {
                            if (typeof window.setMascotState === 'function') {
                                window.setMascotState({}, 'idle');
                            }
                        }
                    } else {
                        // Equip: Add to array and show element
                        equippedItems.push(itemId);
                        if (accessoryElement) accessoryElement.style.display = 'block';
                        console.log(`[MMS Shop] Equipped ${itemId}`);
                        
                        // Trigger animation state when equipping special accessories
                        // Note: Juggling balls don't force permanent state - they trigger periodic animations
                        if (itemId === 'stunt_bike') {
                            if (typeof window.setMascotState === 'function') {
                                window.setMascotState({}, 'biking', 0); // 0 = infinite duration
                            }
                        } else if (itemId === 'bookworm_kit') {
                            if (typeof window.setMascotState === 'function') {
                                window.setMascotState({}, 'reading', 0); // 0 = infinite duration
                            }
                        }
                    }

                    GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));

                } else if (itemType === 'theme') {
                    if (typeof window.applyTheme === 'function') {
                        window.applyTheme(itemId);
                    }
                } else if (itemType === 'feature') {
                    // Debug mode "Equip" click — add to purchased and activate immediately
                    let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
                    if (!purchased.includes(itemId)) purchased.push(itemId);
                    GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));
                    activateFeature(itemId, config, STORAGE_KEYS);
                }
                populateShop(config, STORAGE_KEYS); // Re-render shop to update buttons
            }
        }
    });
}

function populateShop(config, STORAGE_KEYS) {
    const itemsWrapper = document.getElementById('tm-shop-items-wrapper');
    if (!itemsWrapper) return;

    // Define categories
    const shopModal = document.getElementById('tm-shop-modal');
    let activeCategory = 'themes'; // Default to themes
    if (shopModal) {
        const activeTab = shopModal.querySelector('.tm-shop-tab.active');
        if (activeTab) {
            activeCategory = activeTab.dataset.category;
        }
    }

    // If mascot is disabled, force away from accessories category
    if (!config.interactiveMascotEnabled && activeCategory === 'accessories') {
        activeCategory = 'themes';
    }

    const categories = {
        themes: [],
        accessories: [],
        consumables: []
    };

    // Sort all items into categories
    Object.keys(UI_THEMES).forEach(id => categories.themes.push({ id, ...UI_THEMES[id], type: 'theme' }));

    // Only expose accessories when mascot is enabled
    if (config.interactiveMascotEnabled) {
        categories.accessories.push(...getShopAccessoryItems());
    }
    categories.consumables.push(...getShopConsumableItems(config));

    // Evolutions are automatically unlocked by leveling up, not purchasable
    // They are removed from the shop to prevent buying/equipping

    const purchasedItems = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    let currentCoins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);

    itemsWrapper.innerHTML = ''; // Clear previous items

    // Create content for each category
    for (const category in categories) {
        if (category === 'accessories' && !config.interactiveMascotEnabled) continue;
        const categoryContent = document.createElement('div');
        categoryContent.id = `tm-shop-category-${category}`;
        categoryContent.className = 'tm-shop-category-content';
        if (category === activeCategory) categoryContent.classList.add('active'); // Make the correct tab active

        const shopGrid = document.createElement('div');
        shopGrid.className = 'tm-shop-grid'; // Use a class instead of a duplicate ID

        categories[category].forEach(item => {
            const isOwned = purchasedItems.includes(item.id);
            const isEquipped = (item.type === 'accessory' && equippedItems.includes(item.id))
                || (item.type === 'theme' && config && config.equippedTheme === item.id)
                || (item.type === 'feature' && isOwned);

            const itemDiv = document.createElement('div');
            itemDiv.className = `tm-shop-item ${isOwned || (config && config.debugEnabled && item.type !== 'consumable') ? 'owned' : ''}`;
            itemDiv.innerHTML = `
                <div class="tm-shop-item-icon">${item.icon}</div>
                <div class="tm-shop-item-name">${item.name}</div>
                ${item.desc ? `<div class="tm-shop-item-desc">${item.desc}</div>` : ''}
                <div class="tm-shop-item-cost">${(isOwned && item.type !== 'consumable') ? 'Owned' : (config && config.debugEnabled ? '🪙 0 (Free)' : `🪙 ${item.cost}`)}</div>
                <button class="tm-shop-item-btn" data-item-id="${item.id}" data-item-cost="${item.cost}" data-item-type="${item.type}"></button>
            `;

            const button = itemDiv.querySelector('.tm-shop-item-btn');
            if (isOwned || (config && config.debugEnabled && item.type !== 'consumable')) {
                button.textContent = isEquipped
                    ? (item.type === 'accessory' ? 'Unequip' : item.type === 'feature' ? '✓ Ενεργό' : 'Equipped')
                    : 'Equip';
                button.className += isEquipped ? ' equipped' : ' equip';
                // For accessories, the button is never disabled if owned, as it toggles equip/unequip.
                if (isEquipped && item.type !== 'accessory') {
                    button.disabled = true;
                }
            } else {
                button.textContent = (config && config.debugEnabled) ? 'Get (Free)' : 'Buy';
                button.className += ' buy';
                if (!(config && config.debugEnabled) && currentCoins < item.cost) button.disabled = true;
            }
            shopGrid.appendChild(itemDiv);
        });
        categoryContent.appendChild(shopGrid);
        itemsWrapper.appendChild(categoryContent);
    }
}

function handleShopPurchase(button, config, STORAGE_KEYS) {
    const itemId = button.dataset.itemId;
    const itemCost = parseInt(button.dataset.itemCost, 10);
    const itemType = button.dataset.itemType;

    // The bug was here. The coin check was happening even in debug mode.
    // I've fixed it so if debug mode is on, the cost is considered 0.
    const finalCost = (config && config.debugEnabled) ? 0 : itemCost;
    let currentCoins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);

    if (currentCoins < finalCost) {
        alert('Δεν έχετε αρκετά Fixer-Coins!');
        return;
    }

    currentCoins -= finalCost;
    GM_setValue(STORAGE_KEYS.USER_COINS, currentCoins);
    updateCoinBalanceUI(STORAGE_KEYS, currentCoins, config);

    if (itemType === 'consumable' && itemId === 'reroll_token') {
        const currentTokens = GM_getValue(STORAGE_KEYS.USER_REROLL_TOKENS, 0);
        GM_setValue(STORAGE_KEYS.USER_REROLL_TOKENS, currentTokens + 1);
    } else if (itemType === 'consumable' && itemId === SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN) {
        const currentTokens = GM_getValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, 0) || 0;
        GM_setValue(SHOP_ITEMS.BOUNTY_COMPLETE_TOKEN, currentTokens + 1);
    } else if (itemType === 'consumable') {
        // Handle immediate use of other consumables
        switch (itemId) {
            // === DRINKS & ENERGY ===
            case 'energized_drink':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 15 * 60 * 1000); // 15 minutes
                }
                break;
            case 'coffee':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 5 * 60 * 1000); // 5 minutes
                }
                break;
            case 'smoothie':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 30, 20);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 2000);
                }
                break;
            case 'health_potion':
            case 'mana_potion':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 50, 50);
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(50);
                }
                break;
            case 'speed_potion':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 8 * 60 * 1000); // 8 minutes
                }
                break;
            case 'lucky_potion':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 5 * 60 * 1000); // 5 minutes
                }
                break;
            case 'rainbow_juice':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 100); // Max both stats
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(150);
                }
                break;
            case 'golden_elixir':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 100);
                }
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 20 * 60 * 1000); // 20 minutes
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(300);
                }
                break;
                
            // === FOOD & SNACKS ===
            case 'happiness_snack':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 0); // Max out happiness
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 3000);
                }
                break;
            case 'hunger_meal':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 0, 100); // Max out hunger
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 2000);
                }
                break;
            case 'super_meal':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 50, 100);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 3000);
                }
                break;
            case 'pizza_slice':
            case 'burger_combo':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 20, 40);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 2000);
                }
                break;
            case 'ice_cream':
            case 'donut':
            case 'cookie':
            case 'chocolate_bar':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 30, 15);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 2000);
                }
                break;
            case 'sushi_platter':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 40, 60);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'eating', 3000);
                }
                break;
                
            // === XP & COINS ===
            case 'double_coins_voucher':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 10 * 60 * 1000); // 10 minutes
                }
                break;
            case 'xp_boost_small':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 100, 'XP Boost Small');
                }
                break;
            case 'xp_boost_medium':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 250, 'XP Boost Medium');
                }
                break;
            case 'xp_boost_large':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 500, 'XP Boost Large');
                }
                break;
            case 'coin_magnet':
            case 'lucky_coin':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 7 * 60 * 1000); // 7 minutes
                }
                break;
                
            // === SPECIAL EFFECTS ===
            case 'confetti_bomb':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(200);
                }
                break;
            case 'fireworks':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(300);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 3000);
                }
                break;
            case 'sparkles':
            case 'star_shower':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(100);
                }
                break;
            case 'rainbow_trail':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(250);
                }
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 50, 0);
                }
                break;
            case 'snow_globe':
            case 'bubble_blast':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(150);
                }
                break;
            case 'heart_explosion':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(180);
                }
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 80, 0);
                }
                break;
            case 'disco_ball':
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(400);
                }
                if (typeof window.setMascotState === 'function') {
                    window.setMascotState(config, 'happy', 5000);
                }
                break;
                
            // === POWER-UPS ===
            case 'time_warp':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 30 * 60 * 1000); // 30 minutes
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 200, 'Time Warp');
                }
                break;
            case 'shield_buff':
                if (typeof window.updatePetStats === 'function') {
                    window.updatePetStats(config, STORAGE_KEYS, 100, 100);
                }
                break;
            case 'magnet_buff':
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 15 * 60 * 1000); // 15 minutes
                }
                break;
            case 'focus_boost':
            case 'productivity_pill':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 25 * 60 * 1000); // 25 minutes
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 150, itemId === 'productivity_pill' ? 'Productivity Pill' : 'Focus Boost');
                }
                break;
            case 'inspiration_spark':
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 300, 'Inspiration Spark');
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(200);
                }
                break;
            case 'turbo_mode':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 20 * 60 * 1000); // 20 minutes
                }
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 10 * 60 * 1000); // 10 minutes
                }
                break;
            case 'mega_boost':
                if (typeof window.triggerEnergizedState === 'function') {
                    window.triggerEnergizedState(config, STORAGE_KEYS, 30 * 60 * 1000); // 30 minutes
                }
                if (typeof window.triggerDoubleCoinsEffect === 'function') {
                    window.triggerDoubleCoinsEffect(config, STORAGE_KEYS, 15 * 60 * 1000); // 15 minutes
                }
                if (typeof window.grantXp === 'function') {
                    window.grantXp(config, STORAGE_KEYS, 500, 'Mega Boost');
                }
                if (typeof window.triggerConfetti === 'function') {
                    window.triggerConfetti(500);
                }
                break;
        }
    } else {
        let purchased = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
        if (!purchased.includes(itemId)) purchased.push(itemId);
        GM_setValue(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify(purchased));

        // Immediately activate the feature without requiring a page reload
        activateFeature(itemId, config, STORAGE_KEYS);
    }

    if (typeof window.showPositiveMessage === 'function') {
        window.showPositiveMessage('Αγορά επιτυχής!');
    }
    populateShop(config, STORAGE_KEYS); // Re-render the shop
    if (document.getElementById('tm-shop-dashboard-wrapper')) {
        populateShopDashboard(config, STORAGE_KEYS);
    }
}

// Called whenever a 'feature' type item is purchased or equipped in debug mode.
function activateFeature(itemId, config, STORAGE_KEYS) {
    // Generic hook: each feature module can expose window.activate_<id>
    const hookFn = window[`activate_${itemId}`];
    if (typeof hookFn === 'function') {
        hookFn(config, STORAGE_KEYS);
    }
}

/**
 * Initializes a small widget in the footer to display today's tracked statistics.
 * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
 */
function initDailyDashboardWidget(config, parentContainer, STORAGE_KEYS) {
    if (!config || !config.dashboardWidgetEnabled) return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Load stats from GM storage
    let stats = { date: today, searches: 0, repairsCompleted: 0, ordersCreated: 0 };
    try {
        const savedStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
        // If the saved date is today, use the saved stats. Otherwise, the fresh object (all zeros) will be used.
        if (savedStats.date === today) {
            stats = savedStats;
        }
    } catch (e) {
        console.error('[MMS] Could not parse daily stats for dashboard, showing zeros.', e);
    }

    // Get status transfer counts
    const status40Count = GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
    const status100Count = GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);

    // Create the widget's HTML
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'tm-daily-dashboard-widget';
    widgetContainer.style.color = '#fff';
    widgetContainer.style.fontSize = '12px';
    widgetContainer.style.display = 'flex';
    widgetContainer.style.alignItems = 'center';
    widgetContainer.style.gap = '8px';
    widgetContainer.title = `Σημερινά Στατιστικά:\n- ${stats.ordersCreated || 0} Νέες Παραγγελίες\n- ${stats.repairsCompleted || 0} Ολοκληρωμένες Επισκευές\n- ${stats.searches || 0} Αναζητήσεις\n- ${status40Count} Μεταφορές σε 40\n- ${status100Count} Μεταφορές σε 100`;

    widgetContainer.innerHTML = `
        <span style="font-weight: bold;">Σήμερα:</span>
        <span>📝 ${stats.ordersCreated || 0}</span>
        <span style="opacity: 0.5;">|</span>
        <span>🛠️ ${stats.repairsCompleted || 0}</span>
        <span style="opacity: 0.5;">|</span>
        <span>🔍 ${stats.searches || 0}</span>
        <span style="opacity: 0.5;">|</span>
        <span title="Μεταφορές σε Status 40">📞 ${status40Count}</span>
        <span style="opacity: 0.5;">|</span>
        <span title="Μεταφορές σε Status 100">✅ ${status100Count}</span>
    `;

    // Add the widget to the parent container in the footer
    parentContainer.appendChild(widgetContainer);
    console.log('[MMS] Daily Dashboard widget initialized in footer.');
}

/**
 * Creates a small widget in the footer to display the user's XP bar.
 * @param {HTMLElement} parentContainer The container element to which the widget will be appended.
 */
function initXpBarWidget(parentContainer, STORAGE_KEYS) {
    if (!config.levelUpSystemEnabled) return;

    const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const currentTitle = GM_getValue(STORAGE_KEYS.USER_TITLE, RANKS[0].title);
    const currentXp = GM_getValue(STORAGE_KEYS.USER_XP, 0);

    const xpBarContainer = document.createElement('div');
    xpBarContainer.id = 'tm-xp-bar-container';
    const xpForNextLevel = getXpForLevel(currentLevel);
    xpBarContainer.title = `${currentTitle}\nExperience Points`;
    xpBarContainer.innerHTML = `
        <div id="tm-buff-timers-container">
            <!-- Buff timers will be injected here -->
        </div>
        <span id="tm-user-title-text"></span> 
        <span id="tm-energized-buff-indicator" style="display: none;"></span>
        <span id="tm-level-text">Lv. ${currentLevel}</span>
        <div class="tm-xp-bar" title="${currentXp} / ${xpForNextLevel} XP">
            <div id="tm-xp-bar-fill" style="width: ${(currentXp / xpForNextLevel) * 100}%;"></div>
            <div id="tm-xp-text">${xpForNextLevel - currentXp} XP to next level</div>
        </div>
    `;
    const rankInfo = RANKS.slice().reverse().find(r => currentLevel >= r.level) || RANKS[0];
    const titleColor = rankInfo.color;
    const glowStyle = rankInfo.glow ? `text-shadow: 0 0 5px ${titleColor};` : '';

    parentContainer.appendChild(xpBarContainer);
    // Now that the elements are in the DOM, update them with the correct title and style
    const titleText = document.getElementById('tm-user-title-text');
    titleText.textContent = currentTitle;
    titleText.style.color = titleColor;
    titleText.style.textShadow = glowStyle;

    // Make the entire bar clickable to show the titles modal
    xpBarContainer.style.cursor = 'pointer';
    xpBarContainer.addEventListener('click', () => showTitlesModal(STORAGE_KEYS));

    console.log('[MMS] XP Bar widget initialized in footer.');
}

function updateXpBarUI(STORAGE_KEYS, level, xp, xpForNext) {
    const xpBarFill = document.getElementById('tm-xp-bar-fill');
    const xpText = document.getElementById('tm-xp-text');
    const levelText = document.getElementById('tm-level-text');
    const titleText = document.getElementById('tm-user-title-text');
    const xpBar = document.querySelector('.tm-xp-bar');

    const percentage = (xp / xpForNext) * 100;
    if (xpBarFill) xpBarFill.style.width = `${percentage}%`;
    if (xpText) xpText.textContent = `${xpForNext - xp} XP to next level`;
    if (xpBar) xpBar.title = `${xp} / ${xpForNext} XP`;

    const rankInfo = RANKS.slice().reverse().find(r => level >= r.level) || RANKS[0];

    if (titleText) {
        titleText.textContent = rankInfo.title;
        titleText.style.color = rankInfo.color;
        titleText.style.textShadow = rankInfo.glow ? `0 0 5px ${rankInfo.color}` : 'none';
    }
    levelText.textContent = `Lv. ${level}`;
}

/**
 * Tracks new orders by monitoring clicks on the "Save" button on the add order page.
 */
function initOrderTracking(config, STORAGE_KEYS) {
    if (!config.levelUpSystemEnabled) return;

    const pathname = window.location.pathname;
    
    // Check if we're on an order add page
    const isOrderAddPage = pathname.includes('srvorders_add') || pathname.includes('sparepartstoorder_add');
    
    if (!isOrderAddPage) {
        console.log('[MMS] Not on order add page, skipping order tracking setup.');
        return;
    }

    console.log('[MMS] On order add page. Looking for save button...');

    // Function to attach listener to save button
    function attachSaveListener() {
        // Try multiple selectors to find the save button
        const saveButton = document.querySelector('#saveButton1') || 
                          document.querySelector('a.rnr-button.main[href="#"]') ||
                          Array.from(document.querySelectorAll('a.rnr-button')).find(btn => 
                              btn.textContent.trim().includes('Αποθήκευση') || 
                              btn.textContent.trim().includes('Save')
                          );
        
        if (!saveButton) {
            console.log('[MMS] Save button not found yet, will retry...');
            return false;
        }

        console.log('[MMS] ✓ Found save button:', saveButton.textContent.trim());

        // Prevent duplicate listeners
        if (saveButton.hasAttribute('data-tm-tracked')) {
            console.log('[MMS] Save button already has listener.');
            return true;
        }
        
        saveButton.setAttribute('data-tm-tracked', 'true');

        saveButton.addEventListener('click', (e) => {
            console.log('[MMS] 🎯 Save button clicked! Tracking order creation...');
            
            // Use a small delay to ensure the form validates first
            setTimeout(() => {
            trackDailyStat(config, STORAGE_KEYS, 'ordersCreated');
                
                // Show feedback
                if (config.interactiveMascotEnabled) {
                    setMascotState(config, 'happy', 3000);
                    const orderMessages = [
                        'Νέα παραγγελία ρε!', 'Saved!', 'Ωραία!', 
                        'Κατάχωρήθηκε!', 'Πάμε!', 'Order done!',
                        'Μια ακόμα!', 'Γράψαμε!', 'Κομπλέ!'
                    ];
                    showMascotBubble(orderMessages[Math.floor(Math.random() * orderMessages.length)], 2000);
                }
            }, 100);
        }, { once: false });
        
        return true;
    }

    // Try to attach immediately
    if (!attachSaveListener()) {
        // If not found, retry after DOM is fully loaded
        let attempts = 0;
        const retryInterval = setInterval(() => {
            attempts++;
            console.log(`[MMS] Retry #${attempts} to find save button...`);
            
            if (attachSaveListener() || attempts >= 10) {
                clearInterval(retryInterval);
                if (attempts >= 10) {
                    console.log('[MMS] ⚠️ Could not find save button after 10 attempts.');
                }
            }
        }, 500); // Retry every 500ms
    }
}

/**
 * Initializes fun, non-essential features like confetti.
 */
function initFunFeatures(config, STORAGE_KEYS) {
    if (!config.confettiEnabled) return;

    // --- Track Status Changes & Confetti on Completion ---
    if (window.location.pathname.includes('/mymanagerservice/service_edit.php')) {
        const buttons = document.querySelectorAll('.rnr-b-editbuttons a.rnr-button');
        buttons.forEach(button => {
            // Assume any button in this container that isn't "Back to List" or "Print" is a status change.
            const buttonText = button.innerText.toUpperCase();
            const isStatusButton = !buttonText.includes('BACK TO LIST') && !buttonText.includes('ΕΚΤΥΠΩΣΗ');

            if (isStatusButton) {
                button.addEventListener('click', () => {
                    const buttonHref = button.getAttribute('href') || '';
                    
                    // Check if this is a status 90 button (part order)
                    const isStatus90 = buttonHref.includes('statusid=90');
                    
                    if (isStatus90) {
                        // Intercept confirm dialogs for status 90 → 65 transition
                        const originalConfirm = window.confirm;
                        window.confirm = function(message) {
                            const result = originalConfirm(message);
                            if (result) {
                                // User confirmed the order placement
                                console.log('[MMS] Status 90→65 order confirmed. Tracking order creation.');
                                trackDailyStat(config, STORAGE_KEYS, 'ordersCreated');
                                
                                if (config.interactiveMascotEnabled) {
                                    const orderMessages = [
                                        'Παραγγελία part!', 'Το παραγγέλνω!', 
                                        'Έρχεται το ανταλλακτικό!', 'Order placed!', 'Κομπλέ!',
                                        'Part incoming!', 'Ας έρθει!', 'Ωραία φάση!'
                                    ];
                                    showMascotBubble(orderMessages[Math.floor(Math.random() * orderMessages.length)], 2500);
                                }
                            }
                            // Restore original confirm
                            window.confirm = originalConfirm;
                            return result;
                        };
                    }
                    
                    // A small delay to let the page's own logic run before we track.
                    setTimeout(() => {
                        console.log(`[MMS] Status change button clicked: "${button.innerText}".`);
                        trackDailyStat(config, STORAGE_KEYS, 'statusChanges'); // Grant XP for any status change.

                        // Special rewards for completing a repair
                        if (button.innerHTML.includes('ΠΡΟΣ ΠΑΡΑΔΟΣΗ')) {
                            trackDailyStat(config, STORAGE_KEYS, 'repairsCompleted');
                            if (config.interactiveMascotEnabled) {
                                setMascotState(config, 'happy', 5000);
                            }
                            if (config.confettiEnabled) triggerConfetti(100);
                        }
                    }, 500);
                });
            }
        });
    }
}

function getLevelUpSettingsHTML() {
    return `
        <div class="tm-settings-section">
            <h3>🎮 Παιχνιδοποίηση (Gamification)</h3>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-levelup-enabled">⭐ Σύστημα Επιπέδων</label>
                    <p class="tm-setting-description">Κερδίστε XP και ανεβείτε επίπεδο ολοκληρώνοντας επισκευές και εργασίες.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-levelup-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-confetti-enabled">🎉 Εφέ Κομφετί</label>
                    <p class="tm-setting-description">Οπτικά εφέ κομφετί σε επιτυχίες και milestone events.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-confetti-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-achievements-enabled">🏆 Επιτεύγματα</label>
                    <p class="tm-setting-description">Ξεκλειδώστε επιτεύγματα για ειδικές ενέργειες και στόχους.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-achievements-enabled"></div>
            </div>
        </div>
        
        <div class="tm-settings-section">
            <h3>🚀 Προχωρημένα Χαρακτηριστικά</h3>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-random-events-enabled">⚡ Τυχαία Γεγονότα</label>
                    <p class="tm-setting-description">Τυχαία events που εμφανίζονται και παρέχουν μπόνους (2x νομίσματα, 2x XP, κ.λπ.).</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-random-events-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-personal-dashboard-enabled">📊 Προσωπικός Πίνακας</label>
                    <p class="tm-setting-description">Προβολή αναλυτικών στοιχείων, γραφημάτων και στατιστικών απόδοσης.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-personal-dashboard-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-shop-enabled">🪙 Κατάστημα</label>
                    <p class="tm-setting-description">Αγοράστε θέματα, αξεσουάρ και αναλώσιμα με τα νομίσματά σας.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-shop-enabled"></div>
            </div>
            <div class="tm-setting-row">
                <div class="tm-setting-label">
                    <label for="tm-setting-eod-checklist-enabled">🌙 Checklist Τέλους Ημέρας</label>
                    <p class="tm-setting-description">Εμφανίζει το κουμπί 📋 στο footer για γρήγορο έλεγχο των επισκευών της ημέρας. Απαιτεί αγορά από το κατάστημα.</p>
                </div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-eod-checklist-enabled"></div>
            </div>
        </div>`;
}

function getMascotSettingsHTML() {
    return `
        <div class="tm-settings-section">
            <h3>🤖 Mascot</h3>
            <div class="tm-setting-row">
                <div class="tm-setting-label"><label for="tm-setting-mascot-enabled">Ενεργοποίηση Mascot</label><p class="tm-setting-description">Εμφανίζει έναν διαδραστικό βοηθό στην οθόνη.</p></div>
                <div class="tm-setting-control"><input type="checkbox" id="tm-setting-mascot-enabled"></div>
        </div>
        <div class="tm-setting-row">
            <div class="tm-setting-label">
                <label for="tm-setting-mascot-speed">Ταχύτητα Περιπλάνησης</label>
                <p class="tm-setting-description">Ορίστε την ταχύτητα κίνησης του mascot (pixels ανά δευτερόλεπτο).</p>
            </div>
            <div class="tm-setting-control">
                <input type="number" id="tm-setting-mascot-speed" min="25" max="500" step="25">
            </div>
        </div>
        </div>`;
}

function getGamificationSettingsHTML(STORAGE_KEYS) {
    return getLevelUpSettingsHTML() + getMascotSettingsHTML();
}

function initGamificationSettings(config, STORAGE_KEYS) {
    // Populate Checkboxes
    const populateCheckbox = (id, key) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = config[key];
    };
    populateCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
    populateCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
    populateCheckbox('tm-setting-achievements-enabled', 'achievementsEnabled');
    populateCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');

    // Populate new feature checkboxes
    populateCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
    populateCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
    populateCheckbox('tm-setting-shop-enabled', 'shopEnabled');
    populateCheckbox('tm-setting-eod-checklist-enabled', 'eodChecklistEnabled');

    document.getElementById('tm-setting-mascot-speed').value = config.mascotRoamingSpeed;

    // Add event listener to shop checkbox to update UI immediately
    const shopCheckbox = document.getElementById('tm-setting-shop-enabled');
    if (shopCheckbox) {
        shopCheckbox.addEventListener('change', () => {
            // Save immediately
            const value = shopCheckbox.checked;
            GM_setValue('shopEnabled', value);
            config.shopEnabled = value;
            
            // Update shop button visibility
            updateShopButtonVisibility(config);
        });
    }

    // Talent unlock now handled in dedicated modal (showTalentsModal)
}

// Function to update shop button visibility based on config
function updateShopButtonVisibility(config) {
    // Shop visibility depends ONLY on shopEnabled, not mascot
    const shopOn = !!config.shopEnabled;

    // Update shop tab in dashboard if it exists
    const shopTab = document.querySelector('.tm-dashboard-tab[data-tab="shop"]');
    if (shopTab) {
        shopTab.style.display = shopOn ? '' : 'none';
    }
    
    // Update coin balance clickability in dashboard
    const coinBalance = document.getElementById('tm-dashboard-coin-balance');
    if (coinBalance) {
        if (shopOn) {
            coinBalance.style.cursor = 'pointer';
            coinBalance.title = 'Click to open Shop';
        } else {
            coinBalance.style.cursor = 'default';
            coinBalance.title = '';
        }
    }
    
    // Update coin balance in XP bar widget
    const coinBalanceWidget = document.getElementById('tm-coin-balance');
    if (coinBalanceWidget) {
        if (shopOn) {
            coinBalanceWidget.style.display = '';
            coinBalanceWidget.style.cursor = 'pointer';
            coinBalanceWidget.title = 'Click to open Shop';
        } else {
            coinBalanceWidget.style.display = 'none';
        }
    }
}

function saveGamificationSettings() {
    const saveCheckbox = (id, key) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            const value = checkbox.checked;
            GM_setValue(key, value);
            config[key] = value;
        }
    };

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

    // --- Save Gamification/Fun Settings ---
    saveCheckbox('tm-setting-levelup-enabled', 'levelUpSystemEnabled');
    saveCheckbox('tm-setting-mascot-enabled', 'interactiveMascotEnabled');
    saveCheckbox('tm-setting-confetti-enabled', 'confettiEnabled');
    saveCheckbox('tm-setting-random-events-enabled', 'randomEventsEnabled');
    saveCheckbox('tm-setting-personal-dashboard-enabled', 'personalDashboardEnabled');
    saveCheckbox('tm-setting-shop-enabled', 'shopEnabled');
    saveCheckbox('tm-setting-eod-checklist-enabled', 'eodChecklistEnabled');
    saveNumber('tm-setting-mascot-speed', 'mascotRoamingSpeed');

    // Update shop button visibility after saving
    if (typeof updateShopButtonVisibility === 'function') {
        updateShopButtonVisibility(config);
    }

    // Apply EOD checklist visibility immediately
    const eodBtn = document.getElementById('tm-eod-btn');
    if (config.eodChecklistEnabled === false) {
        eodBtn?.remove();
    } else if (!eodBtn && typeof window.initEODChecklist === 'function') {
        window.initEODChecklist(config, STORAGE_KEYS);
    }

    // Weather location is now hardcoded to Athens
}

// Make functions globally accessible for external scripts
// ===================================================================
// === FEATURE: RANDOM EVENTS
// ===================================================================

const RANDOM_EVENTS = {
    RUSH_HOUR: {
        id: 'rush_hour',
        name: 'Rush Hour!',
        description: 'Earn 2x coins for the next hour!',
        icon: '⚡',
        duration: 60 * 60 * 1000, // 1 hour
        effect: { coinMultiplier: 2 },
        weight: 20 // Spawn chance weight
    },
    PERFECT_DAY: {
        id: 'perfect_day',
        name: 'Perfect Day Challenge',
        description: 'Complete 5 repairs flawlessly for 500 bonus coins!',
        icon: '🎯',
        duration: 4 * 60 * 60 * 1000, // 4 hours
        effect: { perfectRepairsNeeded: 5, reward: 500 },
        weight: 15
    },
    MYSTERY_CUSTOMER: {
        id: 'mystery_customer',
        name: 'Mystery Customer',
        description: 'Next repair is worth 5x rewards!',
        icon: '🎭',
        duration: 2 * 60 * 60 * 1000, // 2 hours
        effect: { nextRepairMultiplier: 5 },
        weight: 10
    },
    TREASURE_HUNT: {
        id: 'treasure_hunt',
        name: 'Mascot Found Treasure!',
        description: 'Your mascot found hidden coins!',
        icon: '💎',
        duration: 0, // Instant
        effect: { instantCoins: () => Math.floor(Math.random() * 300) + 100 },
        weight: 25
    },
    DOUBLE_XP: {
        id: 'double_xp',
        name: 'Knowledge Surge',
        description: 'Earn 2x XP for 30 minutes!',
        icon: '📚',
        duration: 30 * 60 * 1000, // 30 minutes
        effect: { xpMultiplier: 2 },
        weight: 20
    },
    LUCKY_REPAIR: {
        id: 'lucky_repair',
        name: 'Lucky Repair',
        description: 'Next repair grants a random rare item!',
        icon: '🍀',
        duration: 1 * 60 * 60 * 1000, // 1 hour
        effect: { nextRepairItem: true },
        weight: 10
    },
    SUPPLY_SHORTAGE: {
        id: 'supply_shortage',
        name: 'Supply Shortage',
        description: 'Limited parts available - earn 1.5x coins for efficiency!',
        icon: '📦',
        duration: 2 * 60 * 60 * 1000, // 2 hours
        effect: { coinMultiplier: 1.5, efficiencyBonus: true },
        weight: 15
    },
    EXPERT_MODE: {
        id: 'expert_mode',
        name: 'Expert Mode Activated',
        description: 'Advanced repairs grant 3x XP for 45 minutes!',
        icon: '🔧',
        duration: 45 * 60 * 1000, // 45 minutes
        effect: { xpMultiplier: 3 },
        weight: 12
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        name: 'Speed Demon Challenge',
        description: 'Complete repairs in record time for bonus rewards!',
        icon: '🏃',
        duration: 1.5 * 60 * 60 * 1000, // 1.5 hours
        effect: { speedBonus: true, timeLimit: 30 },
        weight: 18
    },
    QUALITY_CONTROL: {
        id: 'quality_control',
        name: 'Quality Control Inspection',
        description: 'Perfect repairs grant extra coins for the next hour!',
        icon: '✅',
        duration: 60 * 60 * 1000, // 1 hour
        effect: { perfectRepairBonus: 200 },
        weight: 14
    },
    NIGHT_SHIFT: {
        id: 'night_shift',
        name: 'Night Shift Bonus',
        description: 'Working after hours grants 2.5x coins!',
        icon: '🌙',
        duration: 3 * 60 * 60 * 1000, // 3 hours
        effect: { coinMultiplier: 2.5 },
        weight: 8
    },
    REPAIR_MARATHON: {
        id: 'repair_marathon',
        name: 'Repair Marathon',
        description: 'Complete 8 repairs in 2 hours for massive rewards!',
        icon: '🏁',
        duration: 2 * 60 * 60 * 1000, // 2 hours
        effect: { marathonRepairs: 8, marathonReward: 1000 },
        weight: 6
    },
    GOLDEN_HOUR: {
        id: 'golden_hour',
        name: 'Golden Hour',
        description: 'Everything you do grants 50% more rewards!',
        icon: '⭐',
        duration: 60 * 60 * 1000, // 1 hour
        effect: { universalMultiplier: 1.5 },
        weight: 5
    },
    TECHNICAL_DIFFICULTIES: {
        id: 'technical_difficulties',
        name: 'Technical Difficulties',
        description: 'System issues - earn 3x XP for troubleshooting!',
        icon: '⚠️',
        duration: 90 * 60 * 1000, // 1.5 hours
        effect: { xpMultiplier: 3, troubleshootingBonus: true },
        weight: 10
    },
    CUSTOMER_SATISFACTION: {
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction Survey',
        description: 'Happy customers grant bonus coins for perfect service!',
        icon: '😊',
        duration: 2.5 * 60 * 60 * 1000, // 2.5 hours
        effect: { customerSatisfactionBonus: 150 },
        weight: 16
    },
    // NEW DIVERSE RANDOM EVENTS
    COMPONENT_CACHE: {
        id: 'component_cache',
        name: 'Component Cache Discovery',
        description: 'Found a stash of rare components! Instant bonus coins!',
        icon: '💎',
        duration: 0, // Instant
        effect: { instantCoins: () => Math.floor(Math.random() * 500) + 200 },
        weight: 12
    },
    TIME_WARP: {
        id: 'time_warp',
        name: 'Time Warp',
        description: 'Time moves faster - all timers reduced by 30%!',
        icon: '⏰',
        duration: 45 * 60 * 1000, // 45 minutes
        effect: { timeSpeedBonus: 0.3 },
        weight: 8
    },
    SKILL_BOOST: {
        id: 'skill_boost',
        name: 'Skill Boost',
        description: 'Your expertise shines - earn 2.5x XP for expert-level work!',
        icon: '🌟',
        duration: 60 * 60 * 1000, // 1 hour
        effect: { expertXpMultiplier: 2.5 },
        weight: 10
    },
    LUCKY_STREAK: {
        id: 'lucky_streak',
        name: 'Lucky Streak',
        description: 'Every action has a 25% chance to grant bonus rewards!',
        icon: '🍀',
        duration: 90 * 60 * 1000, // 1.5 hours
        effect: { luckyChance: 0.25, luckyBonus: 1.5 },
        weight: 14
    },
    EFFICIENCY_EXPERT: {
        id: 'efficiency_expert',
        name: 'Efficiency Expert Mode',
        description: 'Complete tasks 20% faster and earn efficiency bonuses!',
        icon: '⚡',
        duration: 2 * 60 * 60 * 1000, // 2 hours
        effect: { speedBoost: 0.2, efficiencyBonus: 300 },
        weight: 15
    },
    INSPIRATION_WAVE: {
        id: 'inspiration_wave',
        name: 'Inspiration Wave',
        description: 'Creative problem-solving grants 3x XP on complex repairs!',
        icon: '💡',
        duration: 75 * 60 * 1000, // 1.25 hours
        effect: { complexRepairXpMultiplier: 3 },
        weight: 11
    },
    TEAM_SYNERGY: {
        id: 'team_synergy',
        name: 'Team Synergy',
        description: 'Collaborative energy - orders and repairs grant team bonuses!',
        icon: '🤝',
        duration: 3 * 60 * 60 * 1000, // 3 hours
        effect: { teamBonusMultiplier: 1.5 },
        weight: 9
    },
    PRECISION_MODE: {
        id: 'precision_mode',
        name: 'Precision Mode',
        description: 'Perfect repairs grant triple rewards!',
        icon: '🎯',
        duration: 50 * 60 * 1000, // 50 minutes
        effect: { perfectRepairReward: 3 },
        weight: 13
    },
    QUANTUM_LEAP: {
        id: 'quantum_leap',
        name: 'Quantum Leap',
        description: 'Breakthrough moment - next 3 repairs are worth 4x rewards!',
        icon: '🚀',
        duration: 2.5 * 60 * 60 * 1000, // 2.5 hours
        effect: { nextRepairsMultiplier: 4, nextRepairsCount: 3 },
        weight: 6
    },
    MENTOR_MOMENT: {
        id: 'mentor_moment',
        name: 'Mentor Moment',
        description: 'Teaching others boosts your own XP by 150%!',
        icon: '👨‍🏫',
        duration: 1.5 * 60 * 60 * 1000, // 1.5 hours
        effect: { mentorXpBonus: 1.5 },
        weight: 10
    },
    ENERGY_SURGE: {
        id: 'energy_surge',
        name: 'Energy Surge',
        description: 'Unlimited energy - no fatigue penalties for 1 hour!',
        icon: '⚡',
        duration: 60 * 60 * 1000, // 1 hour
        effect: { noFatigue: true },
        weight: 12
    },
    FORTUNE_WHEEL: {
        id: 'fortune_wheel',
        name: 'Fortune Wheel',
        description: 'Spin the wheel - random bonus rewards on every action!',
        icon: '🎰',
        duration: 80 * 60 * 1000, // 80 minutes
        effect: { randomRewardChance: 0.3 },
        weight: 11
    },
    FOCUS_MODE: {
        id: 'focus_mode',
        name: 'Focus Mode',
        description: 'Deep concentration - searches reveal more information!',
        icon: '🔍',
        duration: 65 * 60 * 1000, // 65 minutes
        effect: { searchBonus: 2, searchXpMultiplier: 2 },
        weight: 14
    },
    INNOVATION_SPARK: {
        id: 'innovation_spark',
        name: 'Innovation Spark',
        description: 'Creative solutions unlock - new repair methods grant extra XP!',
        icon: '✨',
        duration: 55 * 60 * 1000, // 55 minutes
        effect: { innovationXpBonus: 400 },
        weight: 10
    },
    RESOURCE_RUSH: {
        id: 'resource_rush',
        name: 'Resource Rush',
        description: 'Temporary resource surplus - orders cost less!',
        icon: '📦',
        duration: 70 * 60 * 1000, // 70 minutes
        effect: { orderCostReduction: 0.25 },
        weight: 13
    },
    MASTERY_MOMENT: {
        id: 'mastery_moment',
        name: 'Mastery Moment',
        description: 'Demonstrate your mastery - level 25+ tasks grant 4x rewards!',
        icon: '👑',
        duration: 40 * 60 * 1000, // 40 minutes
        effect: { masteryRewardMultiplier: 4 },
        weight: 7
    }
};

function checkRandomEvent(config, STORAGE_KEYS) {
    const now = Date.now();
    const lastCheck = GM_getValue(STORAGE_KEYS.LAST_EVENT_CHECK, 0);
    const activeEvent = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_EVENT, 'null'));
    
    // Check if active event expired
    if (activeEvent && now > activeEvent.expiresAt) {
        GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, 'null');
        GM_setValue(STORAGE_KEYS.LAST_EVENT_END_TIME, now); // Track when event ended for cooldown
        if (window.showPositiveMessage) {
            window.showPositiveMessage(`Event "${activeEvent.name}" has ended!`);
        }
        updateEventNotification(null);
    }
    
    // Check for new event every 2.5 hours (150 minutes) - REDUCED FREQUENCY
    if (now - lastCheck < 2.5 * 60 * 60 * 1000) return;
    
    GM_setValue(STORAGE_KEYS.LAST_EVENT_CHECK, now);
    
    // Don't spawn if event already active
    if (activeEvent && now < activeEvent.expiresAt) return;
    
    // Cooldown check - prevent spawning too soon after last event ended
    const lastEventEnd = GM_getValue(STORAGE_KEYS.LAST_EVENT_END_TIME, 0);
    const cooldownPeriod = 3 * 60 * 60 * 1000; // 3 hour cooldown after event ends
    if (lastEventEnd > 0 && (now - lastEventEnd) < cooldownPeriod) return;
    
    // Only spawn during working hours (9 AM to 8 PM)
    const currentHour = new Date().getHours();
    if (currentHour < 9 || currentHour >= 20) return;
    
    // 4% chance to spawn event (REDUCED from 8%) - less frequent
    if (Math.random() > 0.04) return;
    
    // Select random event weighted by spawn chance
    const events = Object.values(RANDOM_EVENTS);
    const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEvent = null;
    for (const event of events) {
        random -= event.weight;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }
    
    if (!selectedEvent) return;
    
    // Activate event
    const eventData = {
        ...selectedEvent,
        startedAt: now,
        expiresAt: now + selectedEvent.duration,
        progress: 0
    };
    
    // Handle instant events
    if (selectedEvent.duration === 0) {
        if (selectedEvent.effect.instantCoins) {
            const coins = selectedEvent.effect.instantCoins();
            grantCoins(config, STORAGE_KEYS, coins, 'random_event');
            if (window.showPositiveMessage) {
                window.showPositiveMessage(`${selectedEvent.icon} ${selectedEvent.name}! +${coins} coins!`);
            }
        }
        
        // Log to history and track end time for cooldown
        const history = JSON.parse(GM_getValue(STORAGE_KEYS.EVENT_HISTORY, '[]'));
        history.push({ ...eventData, completedAt: now });
        GM_setValue(STORAGE_KEYS.EVENT_HISTORY, JSON.stringify(history.slice(-50)));
        GM_setValue(STORAGE_KEYS.LAST_EVENT_END_TIME, now); // Track when event ended for cooldown
        return;
    }
    
    GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, JSON.stringify(eventData));
    
    // Show notification
    if (window.showPositiveMessage) {
        const duration = Math.floor(selectedEvent.duration / 60000);
        window.showPositiveMessage(`${selectedEvent.icon} ${selectedEvent.name}! ${selectedEvent.description} (${duration}m)`);
    }
    
    updateEventNotification(eventData);
}

function updateEventNotification(eventData) {
    let container = document.getElementById('tm-event-notification');
    
    if (!eventData) {
        if (container) container.remove();
        return;
    }
    
    // Store minimized state before updating, or check storage if first load
    let wasMinimized = false;
    if (container) {
        wasMinimized = container.getAttribute('data-minimized') === 'true';
    } else {
        // Check if it was minimized in a previous session
        wasMinimized = GM_getValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
    }
    
    const isNewContainer = !container;
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'tm-event-notification';
        container.style.cssText = `
            background: transparent;
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 20px;
            color: #cbd5e1;
            padding: 3px 10px;
            width: fit-content;
            max-width: 380px;
            min-height: 26px;
            transition: all 0.15s ease;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            margin: auto;
            font-size: 12px;
            cursor: pointer;
        `;
        container.setAttribute('data-minimized', wasMinimized ? 'true' : 'false');
        // Insert into rnr-hfiller element if it exists, otherwise fallback to body
        const hfiller = document.querySelector('.rnr-hfiller');
        if (hfiller) {
            hfiller.appendChild(container);
        } else {
            // Fallback: insert at the beginning of body
            if (document.body.firstChild) {
                document.body.insertBefore(container, document.body.firstChild);
            } else {
        document.body.appendChild(container);
    }
        }
    }
    
    // Notifications are integrated in page flow, no special positioning needed
    
    const timeLeft = Math.max(0, eventData.expiresAt - Date.now());
    const formattedTime = formatTimeRemaining(timeLeft);
    
    container.innerHTML = `
        <span style="font-size: 14px; line-height: 1; margin-right: 6px; flex-shrink: 0; opacity: 0.8;">${eventData.icon}</span>
        <span style="flex: 1; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px;">${eventData.name}</span>
        <span style="font-size: 10px; color: #64748b; margin-left: 8px; white-space: nowrap; flex-shrink: 0;">${formattedTime}</span>
        <button id="tm-hide-event-btn" style="
            background: transparent;
            color: #64748b;
            border: none;
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
            padding: 2px 6px;
            margin-left: 8px;
            transition: color 0.15s;
            flex-shrink: 0;
        " title="Dismiss" onmouseover="this.style.color='#cbd5e1'" onmouseout="this.style.color='#64748b'">×</button>
    `;
    
    // Restore minimized state if it was minimized before update
    if (wasMinimized) {
        container.style.maxHeight = '24px';
        container.style.overflow = 'hidden';
        container.style.cursor = 'pointer';
        container.style.padding = '2px 10px';
        container.style.minHeight = '24px';
        container.setAttribute('data-minimized', 'true');
    }
    
    // Hide/Minimize button
    const hideBtn = container.querySelector('#tm-hide-event-btn');
    
    const minimizeNotification = () => {
        container.style.maxHeight = '24px';
        container.style.overflow = 'hidden';
        container.style.cursor = 'pointer';
        container.style.padding = '2px 10px';
        container.style.minHeight = '24px';
        container.setAttribute('data-minimized', 'true');
        // Save minimized state to storage
        GM_setValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, true);
    };
    
    const expandNotification = () => {
        container.style.maxHeight = 'none';
        container.style.overflow = 'visible';
        container.style.cursor = 'default';
        container.style.padding = '3px 10px';
        container.style.minHeight = '26px';
        container.setAttribute('data-minimized', 'false');
        // Save expanded state to storage
        GM_setValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
    };
    
    // Only add event listeners if container is new or listeners haven't been added yet
    if (isNewContainer || !container.hasAttribute('data-listeners-added')) {
        container.setAttribute('data-listeners-added', 'true');
        
        if (hideBtn && !hideBtn.hasAttribute('data-listener-added')) {
            hideBtn.setAttribute('data-listener-added', 'true');
        hideBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeNotification();
        });
    }
    
        // Main click handler for showing event details
        container.addEventListener('click', (e) => {
            // Don't trigger if clicking on dismiss button
            if (e.target.closest('#tm-hide-event-btn')) {
                return;
            }
            
            // If minimized, expand it
        if (container.getAttribute('data-minimized') === 'true') {
            expandNotification();
                return;
            }
            
            // Otherwise, show event details - prevent multiple opens
            if (document.querySelector('.tm-modal-overlay')) {
                return; // Modal already open
            }
            
            const freshEventData = JSON.parse(GM_getValue(window.STORAGE_KEYS.ACTIVE_EVENT, 'null'));
            if (freshEventData) {
                showEventDetailsModal(freshEventData);
            }
        });
        
        // Hover effects
        container.addEventListener('mouseenter', () => {
            if (container.getAttribute('data-minimized') !== 'true') {
                container.style.background = 'rgba(102, 126, 234, 0.1)';
                container.style.borderBottomColor = 'rgba(102, 126, 234, 0.5)';
            }
        });
        container.addEventListener('mouseleave', () => {
            container.style.background = 'transparent';
            container.style.borderBottomColor = 'rgba(102, 126, 234, 0.3)';
        });
        
        // Make container look clickable
        container.style.cursor = 'pointer';
    }
    
    // Update every second
    setTimeout(() => {
        if (timeLeft > 0) {
            // Only show notification if it's not manually hidden
            if (container && container.style.display !== 'none') {
                updateEventNotification(eventData);
            }
        } else {
            // Event expired - clear everything
            container.remove();
            GM_setValue(window.STORAGE_KEYS.ACTIVE_EVENT, 'null');
            GM_setValue(window.STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
            GM_setValue(window.STORAGE_KEYS.LAST_EVENT_END_TIME, Date.now());
            
            if (window.showPositiveMessage) {
                window.showPositiveMessage('⏰ Random event expired!');
            }
        }
    }, 1000);
}

function showEventDetailsModal(eventData) {
    const timeLeft = Math.max(0, eventData.expiresAt - Date.now());
    const formattedTime = formatTimeRemaining(timeLeft);
    
    // Find the event definition to get full details
    const eventDef = Object.values(RANDOM_EVENTS).find(e => e.id === eventData.id);
    if (!eventDef) return;
    
    // Build effect description
    let effectDescription = '';
    const effect = eventDef.effect;
    if (effect.coinMultiplier) {
        effectDescription = `💰 Earn ${effect.coinMultiplier}x coins`;
    } else if (effect.xpMultiplier) {
        effectDescription = `📚 Earn ${effect.xpMultiplier}x XP`;
    } else if (effect.instantCoins) {
        effectDescription = `💰 Instant coin bonus`;
    } else if (effect.timeSpeedBonus) {
        effectDescription = `⏰ ${(effect.timeSpeedBonus * 100).toFixed(0)}% faster timers`;
    } else if (effect.expertXpMultiplier) {
        effectDescription = `🌟 ${effect.expertXpMultiplier}x XP for expert work`;
    } else if (effect.luckyChance) {
        effectDescription = `🍀 ${(effect.luckyChance * 100).toFixed(0)}% chance for bonus rewards`;
    } else if (effect.speedBoost) {
        effectDescription = `⚡ ${(effect.speedBoost * 100).toFixed(0)}% faster tasks`;
    } else if (effect.complexRepairXpMultiplier) {
        effectDescription = `💡 ${effect.complexRepairXpMultiplier}x XP on complex repairs`;
    } else if (effect.teamBonusMultiplier) {
        effectDescription = `🤝 ${effect.teamBonusMultiplier}x team bonuses`;
    } else if (effect.perfectRepairReward) {
        effectDescription = `🎯 ${effect.perfectRepairReward}x rewards for perfect repairs`;
    } else if (effect.nextRepairsMultiplier) {
        effectDescription = `🚀 Next ${effect.nextRepairsCount} repairs: ${effect.nextRepairsMultiplier}x rewards`;
    } else if (effect.mentorXpBonus) {
        effectDescription = `👨‍🏫 ${((effect.mentorXpBonus - 1) * 100).toFixed(0)}% bonus XP`;
    } else if (effect.noFatigue) {
        effectDescription = `⚡ No fatigue penalties`;
    } else if (effect.randomRewardChance) {
        effectDescription = `🎰 ${(effect.randomRewardChance * 100).toFixed(0)}% random bonus chance`;
    } else if (effect.searchBonus) {
        effectDescription = `🔍 ${effect.searchBonus}x search bonuses`;
    } else if (effect.innovationXpBonus) {
        effectDescription = `✨ +${effect.innovationXpBonus} XP for innovations`;
    } else if (effect.orderCostReduction) {
        effectDescription = `📦 ${(effect.orderCostReduction * 100).toFixed(0)}% cheaper orders`;
    } else if (effect.masteryRewardMultiplier) {
        effectDescription = `👑 ${effect.masteryRewardMultiplier}x rewards for mastery tasks`;
    } else if (effect.customerSatisfactionBonus) {
        effectDescription = `😊 +${effect.customerSatisfactionBonus} bonus coins for perfect service`;
    } else {
        effectDescription = '✨ Special bonus active';
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    overlay.innerHTML = `
        <div class="tm-modal-content" style="
            max-width: 450px;
            max-height: 85vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 2px solid #9c89ff;
            box-shadow: 0 0 30px rgba(156, 137, 255, 0.6);
            color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
        ">
            <div class="tm-modal-header" style="
                background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                padding: 20px;
                border-bottom: 2px solid #9c89ff;
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 10px;">${eventData.icon}</div>
                <h3 style="margin: 0; font-size: 22px; font-weight: bold;">${eventData.name}</h3>
            </div>
            <div class="tm-modal-body" style="padding: 24px; overflow-y: auto; max-height: calc(85vh - 150px);">
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px; line-height: 1.6;">
                        ${eventDef.description}
                    </div>
                    <div style="
                        background: rgba(255, 255, 255, 0.15);
                        padding: 12px;
                        border-radius: 8px;
                        margin-top: 16px;
                        border-left: 3px solid #9c89ff;
                    ">
                        <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">Active Effect:</div>
                        <div style="font-size: 14px;">${effectDescription}</div>
                    </div>
                </div>
                <div style="
                    background: rgba(0, 0, 0, 0.2);
                    padding: 12px;
                    border-radius: 8px;
                    text-align: center;
                    margin-top: 16px;
                ">
                    <div style="font-size: 12px; opacity: 0.8; margin-bottom: 6px;">Time Remaining</div>
                    <div style="font-size: 20px; font-weight: bold;">⏱️ ${formattedTime}</div>
                </div>
            </div>
            <div class="tm-modal-footer" style="
                padding: 16px 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
            ">
                <button onclick="this.closest('.tm-modal-overlay').remove()" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 10px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                   onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">Close</button>
            </div>
        </div>
    `;
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    document.body.appendChild(overlay);
}

// ===================================================================
// === (REMOVED: SMART TEMPLATES)
// ===================================================================

// ===================================================================
// === (REMOVED: FACTIONS/HOUSES SYSTEM)
// ===================================================================

// ===================================================================
// === FEATURE: PERSONAL DASHBOARD WITH ANALYTICS
// ===================================================================

function showDashboardModal(config, STORAGE_KEYS) {
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    const tabBaseStyle = `
                        padding: 10px 20px;
                        background: none;
                        border: none;
                        border-bottom: 3px solid transparent;
                        cursor: pointer;
                        font-weight: 600;
                        color: var(--tm-secondary-hover);
                        transition: all 0.2s;`;
    const talentTabButton = config.levelUpSystemEnabled ? `
                    <button class="tm-dashboard-tab" data-tab="talents" style="${tabBaseStyle}">🌟 Talents</button>` : '';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: min(920px, 96vw); height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h3>📊 Personal Dashboard</h3>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div class="tm-modal-body" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 10px;">
                <!-- Dashboard Tabs -->
                <div class="tm-dashboard-tabs" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                    <button class="tm-dashboard-tab active" data-tab="overview" style="${tabBaseStyle}">📈 Overview</button>
                    <button class="tm-dashboard-tab" data-tab="performance" style="${tabBaseStyle}">📊 Performance</button>${talentTabButton}
                </div>
                
                <!-- Tab Content -->
                <div id="tm-dashboard-content"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    // Tab switching
    overlay.querySelectorAll('.tm-dashboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            overlay.querySelectorAll('.tm-dashboard-tab').forEach(t => {
                t.classList.remove('active');
                t.style.color = '#64748b';
                t.style.borderBottomColor = 'transparent';
            });
            tab.classList.add('active');
            tab.style.color = '#4facfe';
            tab.style.borderBottomColor = '#4facfe';
            
            populateDashboard(config, STORAGE_KEYS, tab.dataset.tab);
        });
    });
    
    populateDashboard(config, STORAGE_KEYS, 'overview');
    
    // Update shop button visibility when dashboard opens
    if (typeof updateShopButtonVisibility === 'function') {
        updateShopButtonVisibility(config);
    }
}

function populateDashboard(config, STORAGE_KEYS, activeTab = 'overview', overlay = null) {
    const container = document.getElementById('tm-dashboard-content');
    if (!container) return;
    
    // Get stats
    const level = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
    const xp = GM_getValue(STORAGE_KEYS.USER_XP, 0);
    const coins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);
    const dailyStats = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_STATS, '{}'));
    
    // Get achievements with fallback handling
    let achievements = {};
    try {
        const achievementsData = GM_getValue(STORAGE_KEYS.ACHIEVEMENTS, '{}');
        achievements = JSON.parse(achievementsData);
        console.log('[MMS Dashboard] Achievements loaded:', achievements);
        console.log('[MMS Dashboard] Achievements count:', Object.keys(achievements).length);
    } catch (e) {
        console.error('[MMS Dashboard] Error parsing achievements:', e);
        achievements = {};
    }
    
    const today = new Date().toISOString().slice(0, 10);
    // Fix: dailyStats is stored flat with a 'date' property, not nested by date
    const stats = (dailyStats.date === today) ? dailyStats : {};
    
    // Calculate insights (fixed property names)
    const totalRepairs = stats.repairsCompleted || 0;
    const totalSearches = stats.searches || 0;
    const totalOrders = stats.ordersCreated || 0;
    
    // Get lifetime status transfer counts for all tracked statuses
    const trackedStatuses = ['30', '40', '55', '65', '70', '75', '90', '100', '105'];
    const statusCounts = {};
    trackedStatuses.forEach(status => {
        statusCounts[status] = GM_getValue(`tm_status_${status}_transfers`, 0);
    });
    
    // Keep old keys for backward compatibility
    const status40Count = statusCounts['40'] || GM_getValue(STORAGE_KEYS.STATUS_40_TRANSFERS, 0);
    const status100Count = statusCounts['100'] || GM_getValue(STORAGE_KEYS.STATUS_100_TRANSFERS, 0);
    
    if (activeTab === 'overview') {
        container.innerHTML = `
            <!-- Quick Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Level</div>
                    <div style="font-size: 42px; font-weight: bold;">${level}</div>
                    <div style="font-size: 13px; margin-top: 6px; opacity: 0.9;">${xp} XP</div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center; ${config.shopEnabled ? 'cursor: pointer;' : ''}" ${config.shopEnabled ? 'id="tm-dashboard-coin-balance"' : ''} ${config.shopEnabled ? 'title="Click to open Shop"' : ''}>
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Balance</div>
                    <div style="font-size: 42px; font-weight: bold;">🪙</div>
                    <div style="font-size: 20px; margin-top: 6px; font-weight: 600;">${coins}</div>
                </div>
            </div>
            
            <!-- Today's Summary -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">📅 Today's Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="text-align: center; padding: 12px; background: rgba(79, 172, 254, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #4facfe;">${totalRepairs}</div>
                        <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-top: 4px;">Repairs</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(102, 187, 106, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #66bb6a;">${totalSearches}</div>
                        <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-top: 4px;">Searches</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255, 152, 0, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #ff9800;">${totalOrders}</div>
                        <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-top: 4px;">Orders</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(233, 30, 99, 0.1); border-radius: 8px;">
                        <div style="font-size: 32px; font-weight: bold; color: #e91e63;">${Object.keys(achievements).length}</div>
                        <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-top: 4px;">Achievements</div>
                    </div>
                </div>
            </div>
            
            <!-- Lifetime Status Transfers -->
            <div id="tm-status-transfers-section" style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 16px; border: 1px solid var(--tm-shop-item-border); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--tm-shop-item-hover-bg)'" onmouseout="this.style.background='var(--tm-shop-item-bg)'">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">📊 Lifetime Status Transfers <span style="font-size: 12px; opacity: 0.7;">(Click to view history)</span></h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    ${(function() {
                        const statusMap = {
                            '30': { icon: '📋', bgColor: '#9E9E9E' },
                            '40': { icon: '↗️', bgColor: '#4CAF50' },
                            '55': { icon: '⏸️', bgColor: '#FF9800' },
                            '65': { icon: '⏳', bgColor: '#ffc107' },
                            '70': { icon: '🔧', bgColor: '#9C27B0' },
                            '75': { icon: '📦', bgColor: '#795548' },
                            '90': { icon: '📝', bgColor: '#607D8B' },
                            '100': { icon: '✅', bgColor: '#2196F3' },
                            '105': { icon: '🎉', bgColor: '#E91E63' }
                        };
                        let html = '';
                        trackedStatuses.forEach(status => {
                            const count = statusCounts[status] || 0;
                            const statusInfo = statusMap[status] || { icon: '📋', bgColor: '#888' };
                            html += '<div style="text-align: center; padding: 12px; background: linear-gradient(135deg, ' + statusInfo.bgColor + '20 0%, ' + statusInfo.bgColor + '10 100%); border-radius: 8px; border-left: 3px solid ' + statusInfo.bgColor + ';">';
                            html += '<div style="font-size: 12px; color: ' + statusInfo.bgColor + '; font-weight: 600; margin-bottom: 6px;">' + statusInfo.icon + ' Status ' + status + '</div>';
                            html += '<div style="font-size: 28px; font-weight: bold; color: ' + statusInfo.bgColor + ';">' + count + '</div>';
                            html += '</div>';
                        });
                        return html;
                    })()}
                </div>
            </div>
            
            <!-- Unlocked Achievements List -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 16px; border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">🏆 Unlocked Achievements (${Object.keys(achievements).length})</h4>
                ${Object.keys(achievements).length > 0 ? `
                    <div style="display: grid; gap: 8px; max-height: 300px; overflow-y: auto;">
                        ${Object.keys(achievements).map(key => {
                            const [stat, count] = key.split('-');
                            const icons = { searches: '🔍', repairsCompleted: '🛠️', ordersCreated: '📝' };
                            const labels = { searches: 'Searches', repairsCompleted: 'Repairs', ordersCreated: 'Orders' };
                            return `
                                <div style="padding: 10px 12px; background: rgba(233, 30, 99, 0.05); border-left: 3px solid #e91e63; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 20px;">${icons[stat] || '✨'}</span>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: var(--tm-primary-color); font-size: 13px;">${labels[stat] || stat}: ${count}</div>
                                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">${key}</div>
                                    </div>
                                    <span style="color: #e91e63; font-weight: bold;">✓</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 40px 20px; color: var(--tm-secondary-hover);">
                        <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
                        <div>No achievements unlocked yet!</div>
                        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">Start completing searches, repairs, and orders to unlock achievements!</div>
                    </div>
                `}
            </div>
        `;
        
        // Add click handler for status transfers section
        setTimeout(() => {
            const statusSection = document.getElementById('tm-status-transfers-section');
            if (statusSection) {
                statusSection.addEventListener('click', () => {
                    showStatusTransferHistory(STORAGE_KEYS);
                });
            }
            
            // Add click handler for coin balance to open shop (if enabled)
            if (config.shopEnabled) {
                const coinBalance = document.getElementById('tm-dashboard-coin-balance');
                if (coinBalance) {
                    coinBalance.addEventListener('click', () => {
                        // Switch to shop tab
                        const shopTab = overlay.querySelector('.tm-dashboard-tab[data-tab="shop"]');
                        if (shopTab) {
                            shopTab.click();
                        } else {
                            // If shop tab doesn't exist, open shop modal directly
                            if (typeof window.showShopModal === 'function') {
                                window.showShopModal(config, STORAGE_KEYS);
                            }
                        }
                    });
                }
            }
        }, 100);
    } else if (activeTab === 'performance') {
        // Get additional performance data
        const status65Count = GM_getValue(STORAGE_KEYS.STATUS_65_TRANSFERS, 0);
        const eventHistory = JSON.parse(GM_getValue(STORAGE_KEYS.EVENT_HISTORY, '[]'));
        const dailyStatsHistory = JSON.parse(GM_getValue('tm_daily_stats_history', '{}'));
        
        // Calculate weekly averages
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);
            last7Days.push(dailyStatsHistory[dateStr] || {});
        }
        
        const weeklyRepairs = last7Days.reduce((sum, day) => sum + (day.repairsCompleted || 0), 0);
        const weeklySearches = last7Days.reduce((sum, day) => sum + (day.searches || 0), 0);
        const weeklyOrders = last7Days.reduce((sum, day) => sum + (day.ordersCreated || 0), 0);
        const weeklyStatus40 = last7Days.reduce((sum, day) => sum + (day.status40Transfers || 0), 0);
        const weeklyStatus65 = last7Days.reduce((sum, day) => sum + (day.status65Transfers || 0), 0);
        const weeklyStatus100 = last7Days.reduce((sum, day) => sum + (day.status100Transfers || 0), 0);
        
        const avgDailyRepairs = Math.round(weeklyRepairs / 7 * 10) / 10;
        const avgDailySearches = Math.round(weeklySearches / 7 * 10) / 10;
        
        // Calculate efficiency metrics
        const efficiencyScore = totalRepairs > 0 ? Math.round((totalRepairs / Math.max(totalSearches, 1)) * 100) : 0;
        const statusCompletionRate = (status40Count + status65Count + status100Count) > 0 ? 
            Math.round((status100Count / (status40Count + status65Count + status100Count)) * 100) : 0;
        
        container.innerHTML = `
            <!-- Performance Overview Cards -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Daily Average</div>
                    <div style="font-size: 24px; font-weight: bold;">${avgDailyRepairs}</div>
                    <div style="font-size: 11px; opacity: 0.8;">Repairs/Day</div>
                </div>
                <div style="background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%); color: white; padding: 16px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Efficiency Score</div>
                    <div style="font-size: 24px; font-weight: bold;">${efficiencyScore}%</div>
                    <div style="font-size: 11px; opacity: 0.8;">Repair/Search Ratio</div>
                </div>
            </div>
            
            <!-- Performance Chart -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">📈 7-Day Repair Trend</h4>
                <div id="tm-performance-chart" style="height: 180px;"></div>
            </div>
            
            <!-- Weekly Statistics -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">📊 Weekly Statistics</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div style="text-align: center; padding: 12px; background: rgba(79, 172, 254, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #4facfe;">${weeklyRepairs}</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">Total Repairs</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(102, 187, 106, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #66bb6a;">${weeklySearches}</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">Total Searches</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255, 152, 0, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #ff9800;">${weeklyOrders}</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">Orders Created</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(233, 30, 99, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #e91e63;">${statusCompletionRate}%</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">Completion Rate</div>
                    </div>
                </div>
            </div>
            
            <!-- Status Transfer Breakdown -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">🔄 Status Transfer Analysis</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    <div style="text-align: center; padding: 12px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: bold; color: #2196f3;">${status40Count}</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">📞 Status 40</div>
                        <div style="font-size: 10px; color: var(--tm-secondary-hover); opacity: 0.8;">Notifications</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(255, 193, 7, 0.1); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: bold; color: #ffc107;">${status65Count}</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">⏳ Status 65</div>
                        <div style="font-size: 10px; color: var(--tm-secondary-hover); opacity: 0.8;">Waiting for Parts</div>
                    </div>
                    <div style="text-align: center; padding: 12px; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: bold; color: #4caf50;">${status100Count}</div>
                        <div style="font-size: 11px; color: var(--tm-secondary-hover);">✅ Status 100</div>
                        <div style="font-size: 10px; color: var(--tm-secondary-hover); opacity: 0.8;">Delivered</div>
                    </div>
                </div>
            </div>
            
            <!-- Event History -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px; border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color); text-align: center;">🎲 Random Events</h4>
                <div style="text-align: center; padding: 16px; background: rgba(156, 39, 176, 0.1); border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #9c27b0;">${eventHistory.length}</div>
                    <div style="font-size: 12px; color: var(--tm-secondary-hover);">Events Completed</div>
                    <div style="font-size: 10px; color: var(--tm-secondary-hover); opacity: 0.8;">All Time</div>
                </div>
            </div>
            
            <!-- Performance Insights -->
            <div style="background: var(--tm-shop-item-bg); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid var(--tm-shop-item-border);">
                <h4 style="margin: 0 0 12px 0; color: var(--tm-primary-color);">💡 Performance Insights</h4>
                <div style="font-size: 14px; color: var(--tm-secondary-hover); line-height: 1.8;">
                    ${totalRepairs > 0 ? `✅ Great job today! You've completed <strong style="color: #4facfe;">${totalRepairs}</strong> repairs.` : '📊 Start completing repairs to see insights!'}
                    <br>
                    ${avgDailyRepairs > 5 ? `🚀 You're above average with <strong style="color: #66bb6a;">${avgDailyRepairs}</strong> repairs per day!` : ''}
                    <br>
                    ${efficiencyScore > 50 ? `🎯 Excellent efficiency! <strong style="color: #ffc107;">${efficiencyScore}%</strong> repair-to-search ratio!` : ''}
                    <br>
                    ${statusCompletionRate > 80 ? `🏆 Outstanding! <strong style="color: #e91e63;">${statusCompletionRate}%</strong> completion rate!` : ''}
                    <br>
                    ${Object.keys(achievements).length > 10 ? `🏆 Amazing! <strong style="color: #ffc107;">${Object.keys(achievements).length}</strong> achievements unlocked!` : ''}
                </div>
            </div>
        `;
        drawPerformanceChart();
    } else if (activeTab === 'talents') {
        if (!config.levelUpSystemEnabled) {
            container.innerHTML = `
                <div style="text-align: center; padding: 48px 20px; color: var(--tm-secondary-hover);">
                    <div style="font-size: 48px; margin-bottom: 12px;">🌟</div>
                    <p style="margin: 0;">Το Talent Tree είναι απενεργοποιημένο στις ρυθμίσεις.</p>
                </div>`;
            return;
        }
        // Talents Tab Content
        const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
        const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
        const visibleTalentTree = config?.interactiveMascotEnabled !== false
            ? TALENT_TREE
            : TALENT_TREE.filter(t => t.id !== 'mascot_lover');
        const availableTalents = visibleTalentTree.filter(t => level >= t.levelRequired).length;
        const totalTalents = visibleTalentTree.length;
        
        container.innerHTML = `
            <!-- Talent Points Display -->
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-bottom: 16px;">
                <div style="
                    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                ">
                    <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Available Points</div>
                    <div style="font-size: 38px; font-weight: bold;">⭐ ${talentPoints}</div>
                    <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Earn 1 per level</div>
                </div>
                
                <div style="
                    background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border);
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    min-width: 180px;
                ">
                    <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-bottom: 4px;">Progress</div>
                    <div style="font-size: 24px; font-weight: bold; color: #4facfe;">${unlockedTalents.length}/${availableTalents}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${totalTalents - availableTalents} locked by level</div>
                </div>
            </div>
            
            <!-- Talents Grid -->
            <div id="tm-talents-dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;"></div>
        `;
        
        populateTalentsDashboard(STORAGE_KEYS, level, config);
    } else if (activeTab === 'shop') {
        // Check if shop is enabled
        if (!config.shopEnabled) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--tm-secondary-hover);">
                    <div style="font-size: 64px; margin-bottom: 16px;">🪙</div>
                    <h3 style="color: var(--tm-primary-color); margin-bottom: 12px;">Shop is Disabled</h3>
                    <p style="color: var(--tm-secondary-hover);">Enable the shop in Settings to access the shop.</p>
                </div>
            `;
            return;
        }
        
        // Shop Tab Content
        const dashboardAccessoriesTabHtml = config.interactiveMascotEnabled
            ? `<button class="tm-shop-tab" data-category="accessories" style="
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--tm-secondary-hover);
                    transition: all 0.2s;
                ">🎩 Accessories</button>`
            : '';
        container.innerHTML = `
            <div class="tm-shop-tabs" style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0;">
                <button class="tm-shop-tab active" data-category="themes" style="
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid #4facfe;
                    cursor: pointer;
                    font-weight: 600;
                    color: #4facfe;
                    transition: all 0.2s;
                ">🎨 Themes</button>
                ${dashboardAccessoriesTabHtml}
                <button class="tm-shop-tab" data-category="consumables" style="
                    padding: 10px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--tm-secondary-hover);
                    transition: all 0.2s;
                ">⚡ Consumables</button>
            </div>
            <div id="tm-shop-dashboard-wrapper">
                <!-- Shop items will be populated here -->
            </div>
        `;
        
        populateShopDashboard(config, STORAGE_KEYS);
        
        // Add tab switching logic
        container.querySelectorAll('.tm-shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.tm-shop-tab').forEach(t => {
                    t.style.color = '#64748b';
                    t.style.borderBottomColor = 'transparent';
                    t.classList.remove('active');
                });
                tab.style.color = '#4facfe';
                tab.style.borderBottomColor = '#4facfe';
                tab.classList.add('active');
                
                const category = tab.dataset.category;
                container.querySelectorAll('.tm-shop-category-content').forEach(content => content.classList.remove('active'));
                container.querySelector(`#tm-shop-category-${category}`)?.classList.add('active');
            });
        });
    } else if (activeTab === 'quests') {
        // Quests Tab Content
        const activeEvent = JSON.parse(GM_getValue(STORAGE_KEYS.ACTIVE_EVENT, 'null'));
        const dailyBounties = JSON.parse(GM_getValue(STORAGE_KEYS.DAILY_BOUNTIES, '[]'));
        
        container.innerHTML = `
            <!-- Active Quests -->
            <div style="background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 16px;">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color);">⚔️ Active Quests</h4>
                ${activeEvent ? `
                    <div style="padding: 16px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 8px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-size: 18px; font-weight: bold;">${activeEvent.event.icon} ${activeEvent.event.title}</div>
                            <div style="font-size: 12px; opacity: 0.9;">Random Event</div>
                        </div>
                        <div style="font-size: 13px; opacity: 0.95;">${activeEvent.event.message}</div>
                    </div>
                ` : ''}
                ${!activeEvent ? `
                    <div style="text-align: center; padding: 40px 20px; color: var(--tm-secondary-hover);">
                        <div style="font-size: 48px; margin-bottom: 12px;">📜</div>
                        <div>No active quests at the moment.</div>
                        <div style="font-size: 13px; margin-top: 8px; opacity: 0.8;">Keep working to trigger new quests!</div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Daily Bounties -->
            <div style="background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h4 style="margin: 0 0 16px 0; color: var(--tm-primary-color);">🎯 Daily Bounties</h4>
                ${dailyBounties.length > 0 ? dailyBounties.map(bounty => `
                    <div style="padding: 12px; background: ${bounty.completed ? 'rgba(102, 187, 106, 0.1)' : 'rgba(79, 172, 254, 0.1)'}; border-left: 3px solid ${bounty.completed ? '#66bb6a' : '#4facfe'}; border-radius: 6px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; color: var(--tm-primary-color); margin-bottom: 4px;">${bounty.task}</div>
                                <div style="font-size: 12px; color: var(--tm-secondary-hover);">Reward: ${bounty.xpReward} XP, ${bounty.coinReward} 🪙</div>
                            </div>
                            <div style="font-size: 24px;">${bounty.completed ? '✅' : '⏳'}</div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 40px 20px; color: var(--tm-secondary-hover);">
                        <div style="font-size: 48px; margin-bottom: 12px;">🎯</div>
                        <div>No daily bounties available.</div>
                    </div>
                `}
            </div>
        `;
    }
}

function drawPerformanceChart() {
    const chartContainer = document.getElementById('tm-performance-chart');
    if (!chartContainer) return;
    
    // Get last 7 days of data
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().slice(0, 10));
    }
    
    // Load history from storage
    const dailyStatsHistory = JSON.parse(GM_getValue('tm_daily_stats_history', '{}'));
    const data = days.map(day => dailyStatsHistory[day]?.repairsCompleted || 0);
    const maxValue = Math.max(...data, 1);
    
    // Simple bar chart using CSS
    chartContainer.innerHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 100%; gap: 4px;">
            ${data.map((value, index) => {
                const height = (value / maxValue) * 100;
                const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(days[index]).getDay()];
                return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                        <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #4facfe;">${value}</div>
                        <div style="
                            width: 100%;
                            height: ${height}%;
                            background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
                            border-radius: 4px 4px 0 0;
                            min-height: ${value > 0 ? '10px' : '2px'};
                            transition: height 0.3s ease;
                        "></div>
                        <div style="font-size: 10px; color: var(--tm-secondary-hover); margin-top: 4px;">${dayLabel}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Helper function to populate talents in dashboard
function populateTalentsDashboard(STORAGE_KEYS, currentLevel, config) {
    const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
    const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
    const grid = document.getElementById('tm-talents-dashboard-grid');
    
    if (!grid) return;

    const visibleTalentTree = config?.interactiveMascotEnabled !== false
        ? TALENT_TREE
        : TALENT_TREE.filter(t => t.id !== 'mascot_lover');

    grid.innerHTML = visibleTalentTree.map(talent => {
        const isUnlocked = unlockedTalents.includes(talent.id);
        const canAfford = talentPoints >= talent.cost;
        const levelMet = currentLevel >= talent.levelRequired;
        const canUnlock = canAfford && levelMet && !isUnlocked;
        
        // Determine tier color based on level requirement
        let tierColor = '#94a3b8';
        let tierLabel = 'Novice';
        if (talent.levelRequired >= 250) { tierColor = '#e5cc80'; tierLabel = 'DIVINE'; }
        else if (talent.levelRequired >= 200) { tierColor = '#ff1493'; tierLabel = 'GODLIKE'; }
        else if (talent.levelRequired >= 150) { tierColor = '#ff00ff'; tierLabel = 'ULTIMATE'; }
        else if (talent.levelRequired >= 100) { tierColor = '#ff8000'; tierLabel = 'LEGENDARY'; }
        else if (talent.levelRequired >= 75) { tierColor = '#9c27b0'; tierLabel = 'EPIC'; }
        else if (talent.levelRequired >= 50) { tierColor = '#2196f3'; tierLabel = 'RARE'; }
        else if (talent.levelRequired >= 25) { tierColor = '#4caf50'; tierLabel = 'UNCOMMON'; }
        
        return `
            <div class="tm-talent-card ${isUnlocked ? 'unlocked' : ''} ${!levelMet ? 'locked' : ''}" 
                 style="
                     padding: 16px;
                     background: ${isUnlocked ? 'linear-gradient(145deg, #e7f1ff 0%, #d0e8ff 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)'};
                     border: 2px solid ${isUnlocked ? tierColor : '#e2e8f0'};
                     border-radius: 12px;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                     opacity: ${levelMet ? '1' : '0.6'};
                     transition: all 0.3s;
                 ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div style="font-size: 32px;">${talent.icon || '⭐'}</div>
                    <div style="
                        background: ${tierColor};
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                    ">${tierLabel}</div>
                </div>
                
                <div style="font-weight: 700; font-size: 15px; color: var(--tm-primary-color); margin-bottom: 4px;">${talent.name}</div>
                <div style="font-size: 12px; color: var(--tm-secondary-hover); min-height: 40px; margin-bottom: 12px; line-height: 1.4;">${talent.description}</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-size: 11px; color: #94a3b8;">
                        Cost: <strong style="color: #ffd700;">${talent.cost} ⭐</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">
                        Req: <strong>Lv.${talent.levelRequired}</strong>
                    </div>
                </div>
                
                <button class="tm-talent-unlock-btn-dashboard" data-talent-id="${talent.id}" 
                        style="
                            width: 100%;
                            padding: 10px;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: ${canUnlock ? 'pointer' : 'not-allowed'};
                            background: ${isUnlocked ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)' : canUnlock ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : '#e2e8f0'};
                            color: ${isUnlocked || canUnlock ? 'white' : '#94a3b8'};
                            transition: all 0.2s;
                        "
                        ${!canUnlock && !isUnlocked ? 'disabled' : ''}>
                    ${isUnlocked ? '✓ Unlocked' : !levelMet ? `🔒 Level ${talent.levelRequired}` : !canAfford ? `Need ${talent.cost - talentPoints} more ⭐` : `Unlock (${talent.cost} ⭐)`}
                </button>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    grid.querySelectorAll('.tm-talent-unlock-btn-dashboard').forEach(btn => {
        btn.addEventListener('click', () => {
            const talentId = btn.dataset.talentId;
            const talent = TALENT_TREE.find(t => t.id === talentId);
            const unlockedTalents = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
            const talentPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
            const currentLevel = GM_getValue(STORAGE_KEYS.USER_LEVEL, 1);
            
            if (!talent || unlockedTalents.includes(talentId)) return;
            if (talentPoints < talent.cost || currentLevel < talent.levelRequired) return;
            
            // Deduct points and unlock
            GM_setValue(STORAGE_KEYS.USER_TALENT_POINTS, talentPoints - talent.cost);
            unlockedTalents.push(talentId);
            GM_setValue(STORAGE_KEYS.UNLOCKED_TALENTS, JSON.stringify(unlockedTalents));
            
            // Refresh the talents display
            populateTalentsDashboard(STORAGE_KEYS, currentLevel, config);
            
            // Update the points display (row above the talent grid)
            const talentsGridEl = document.getElementById('tm-talents-dashboard-grid');
            const pointsDisplay = talentsGridEl ? talentsGridEl.previousElementSibling : null;
            if (pointsDisplay) {
                const newPoints = GM_getValue(STORAGE_KEYS.USER_TALENT_POINTS, 0);
                const newUnlocked = JSON.parse(GM_getValue(STORAGE_KEYS.UNLOCKED_TALENTS, '[]'));
                const availableTalents = visibleTalentTree.filter(t => currentLevel >= t.levelRequired).length;
                pointsDisplay.innerHTML = `
                    <div style="
                        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
                        color: white;
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                    ">
                        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Available Points</div>
                        <div style="font-size: 38px; font-weight: bold;">⭐ ${newPoints}</div>
                        <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Earn 1 per level</div>
                    </div>
                    
                    <div style="
                        background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border);
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        min-width: 180px;
                    ">
                        <div style="font-size: 13px; color: var(--tm-secondary-hover); margin-bottom: 4px;">Progress</div>
                        <div style="font-size: 24px; font-weight: bold; color: #4facfe;">${newUnlocked.length}/${availableTalents}</div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${visibleTalentTree.length - availableTalents} locked by level</div>
                    </div>
                `;
            }
            
            // Show success notification
            if (typeof window.showNotification === 'function') {
                const icon = talent.icon || '⭐';
                window.showNotification(`${icon} Talent unlocked`, talent.name || 'Talent');
            }
        });
    });
}

// Helper function to populate shop in dashboard
function populateShopDashboard(config, STORAGE_KEYS) {
    const wrapper = document.getElementById('tm-shop-dashboard-wrapper');
    if (!wrapper) return;
    
    const coins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);
    const purchasedItems = JSON.parse(GM_getValue(STORAGE_KEYS.PURCHASED_ITEMS, '[]'));
    const equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
    
    // Create category containers
    const accessoriesCategoryHtml = config.interactiveMascotEnabled
        ? '<div id="tm-shop-category-accessories" class="tm-shop-category-content" style="display: none; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;"></div>'
        : '';
    wrapper.innerHTML = `
        <div id="tm-shop-category-themes" class="tm-shop-category-content active" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;"></div>
        ${accessoriesCategoryHtml}
        <div id="tm-shop-category-consumables" class="tm-shop-category-content" style="display: none; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;"></div>
    `;
    
    // Populate themes
    const themesContainer = wrapper.querySelector('#tm-shop-category-themes');
    themesContainer.innerHTML = Object.keys(UI_THEMES).map(id => {
        const theme = { id, ...UI_THEMES[id] };
        const isPurchased = purchasedItems.includes(theme.id) || theme.cost === 0;
        return `
            <div style="padding: 16px; background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">${theme.icon}</div>
                <div style="font-weight: 600; color: var(--tm-primary-color); margin-bottom: 6px;">${theme.name}</div>
                <button class="tm-shop-item-btn ${isPurchased ? 'purchased' : 'buy'}" 
                        data-item-id="${theme.id}" 
                        data-item-type="theme"
                        data-item-cost="${theme.cost}"
                        style="
                            width: 100%;
                            padding: 10px;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: ${isPurchased ? 'not-allowed' : 'pointer'};
                            background: ${isPurchased ? '#e2e8f0' : 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)'};
                            color: ${isPurchased ? '#94a3b8' : 'white'};
                        "
                        ${isPurchased ? 'disabled' : ''}>
                    ${isPurchased ? '✓ Owned' : `Buy ${theme.cost} 🪙`}
                </button>
            </div>
        `;
    }).join('');
    
    // Populate accessories (only when mascot is enabled)
    if (config.interactiveMascotEnabled) {
        const accessoriesContainer = wrapper.querySelector('#tm-shop-category-accessories');
        accessoriesContainer.innerHTML = getShopAccessoryItems().map(accessory => {
            const isPurchased = purchasedItems.includes(accessory.id);
            const isEquipped = equippedItems.includes(accessory.id);
            return `
                <div style="padding: 16px; background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">${accessory.icon}</div>
                    <div style="font-weight: 600; color: var(--tm-primary-color); margin-bottom: 6px;">${accessory.name}</div>
                    <button class="tm-shop-item-btn ${!isPurchased ? 'buy' : isEquipped ? 'equipped' : 'equip'}" 
                            data-item-id="${accessory.id}" 
                            data-item-type="accessory"
                            data-item-cost="${accessory.cost}"
                            style="
                                width: 100%;
                                padding: 10px;
                                border: none;
                                border-radius: 8px;
                                font-weight: 600;
                                cursor: pointer;
                                background: ${!isPurchased ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : isEquipped ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'};
                                color: white;
                            ">
                        ${!isPurchased ? `Buy ${accessory.cost} 🪙` : isEquipped ? '✓ Equipped' : 'Equip'}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Populate consumables (mascot-only items hidden when mascot is disabled)
    const consumablesContainer = wrapper.querySelector('#tm-shop-category-consumables');
    consumablesContainer.innerHTML = getShopConsumableItems(config).map(consumable => {
        const isFeature = consumable.type === 'feature';
        const isOwned = isFeature && purchasedItems.includes(consumable.id);
        return `
            <div style="padding: 16px; background: var(--tm-shop-item-bg); border: 1px solid var(--tm-shop-item-border); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">${consumable.icon}</div>
                <div style="font-weight: 600; color: var(--tm-primary-color); margin-bottom: 6px;">${consumable.name}</div>
                ${consumable.desc ? `<div style="font-size: 12px; color: var(--tm-secondary-hover); min-height: 36px; margin-bottom: 12px;">${consumable.desc}</div>` : ''}
                <button class="tm-shop-item-btn ${isOwned ? 'equipped' : 'buy'}" 
                        data-item-id="${consumable.id}" 
                        data-item-type="${consumable.type}"
                        data-item-cost="${consumable.cost}"
                        style="
                            width: 100%;
                            padding: 10px;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: ${isOwned ? 'not-allowed' : 'pointer'};
                            background: ${isOwned ? '#e2e8f0' : 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'};
                            color: ${isOwned ? '#94a3b8' : 'white'};
                        "
                        ${isOwned ? 'disabled' : ''}>
                    ${isOwned ? '✓ Owned' : `Buy ${consumable.cost} 🪙`}
                </button>
            </div>
        `;
    }).join('');
    
    // Add event listeners for shop buttons
    wrapper.addEventListener('click', (e) => {
        if (e.target.matches('.tm-shop-item-btn')) {
            if (e.target.classList.contains('buy')) {
                handleShopPurchase(e.target, config, STORAGE_KEYS, () => {
                    populateShopDashboard(config, STORAGE_KEYS);
                });
            } else if (e.target.classList.contains('equip') || e.target.classList.contains('equipped')) {
                const button = e.target;
                const itemId = button.dataset.itemId;
                const itemType = button.dataset.itemType;

                if (itemType === 'accessory') {
                    let equippedItems = JSON.parse(GM_getValue(STORAGE_KEYS.EQUIPPED_ITEMS, '[]'));
                    const accessoryElement = typeof window.getAccessoryElement === 'function' ? window.getAccessoryElement(itemId) : null;
                    
                    if (!accessoryElement) {
                        console.error(`[MMS Shop] Failed to get accessory element for ${itemId}`);
                        return;
                    }

                    if (equippedItems.includes(itemId)) {
                        // Unequip
                        equippedItems = equippedItems.filter(id => id !== itemId);
                        GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));
                        
                        // Remove from mascot
                        if (typeof window.removeAccessoryFromMascot === 'function') {
                            window.removeAccessoryFromMascot(itemId);
                        }
                    } else {
                        // Equip
                        equippedItems.push(itemId);
                        GM_setValue(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItems));
                        
                        // Add to mascot
                        if (typeof window.addAccessoryToMascot === 'function') {
                            window.addAccessoryToMascot(itemId, accessoryElement);
                        }
                    }
                    
                    populateShopDashboard(config, STORAGE_KEYS);
                }
            } else if (e.target.classList.contains('use')) {
                const button = e.target;
                const itemId = button.dataset.itemId;
                const price = parseInt(button.dataset.itemPrice, 10);
                const coins = GM_getValue(STORAGE_KEYS.USER_COINS, 0);
                
                if (coins < price) {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('error', 'Not enough coins!');
                    }
                    return;
                }
                
                GM_setValue(STORAGE_KEYS.USER_COINS, coins - price);
                
                if (typeof window.applyConsumableEffect === 'function') {
                    window.applyConsumableEffect(itemId, config, STORAGE_KEYS);
                }
                
                populateShopDashboard(config, STORAGE_KEYS);
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification('success', `Consumable used!`);
                }
            }
        }
    });
}

// Boss battles removed — tear down legacy UI and stored state
function teardownBossBattlesUI(STORAGE_KEYS) {
    if (STORAGE_KEYS) {
        GM_setValue(STORAGE_KEYS.ACTIVE_BOSS, 'null');
        GM_setValue(STORAGE_KEYS.BOSS_NOTIFICATION_MINIMIZED, false);
        GM_setValue(STORAGE_KEYS.BOSS_NOTIFICATION_DISMISSED, false);
    }
    document.getElementById('tm-boss-notification')?.remove();
    document.getElementById('tm-boss-minimal-btn')?.remove();
    document.getElementById('tm-boss-modal')?.remove();
}


// Helper function to check if it's currently working hours
function isWorkingHours() {
    const currentHour = new Date().getHours();
    return currentHour >= 9 && currentHour < 20;
}

// Debug function to show working hours status
function checkWorkingHours() {
    const currentHour = new Date().getHours();
    const isWorking = isWorkingHours();
    
    const message = isWorking
        ? `🟢 WORKING HOURS (${currentHour}:00)\nRandom events can spawn during 9 AM - 8 PM`
        : `🔴 NON-WORKING HOURS (${currentHour}:00)\nRandom events only spawn during 9 AM - 8 PM`;
    
    if (window.showPositiveMessage) {
        window.showPositiveMessage(message);
    }
    console.log(`[MMS] Working Hours Status: ${message}`);
}

// Debug function to stop/clear any active random event
function stopRandomEvent(STORAGE_KEYS) {
    // Clear active event
    GM_setValue(STORAGE_KEYS.ACTIVE_EVENT, 'null');
    GM_setValue(STORAGE_KEYS.EVENT_NOTIFICATION_MINIMIZED, false);
    
    // Remove notification
    updateEventNotification(null);
}

// Helper function to format time intelligently
function formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return '0s';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${seconds}s`;
    }
}

// ===================================================================

// Export feature functions
window.checkRandomEvent = checkRandomEvent;
window.updateEventNotification = updateEventNotification;
window.getCurrentLevelBonuses = getCurrentLevelBonuses;
window.formatLevelBonusesHTML = formatLevelBonusesHTML;
window.LEVEL_REWARDS = LEVEL_REWARDS;
window.showTitlesModal = showTitlesModal;

function showStatusTransferHistory(STORAGE_KEYS) {
    const history = JSON.parse(GM_getValue(STORAGE_KEYS.STATUS_TRANSFER_HISTORY, '[]'));
    
    const overlay = document.createElement('div');
    overlay.className = 'tm-modal-overlay';
    overlay.innerHTML = `
        <div class="tm-modal-content" style="max-width: 800px; height: 85vh; display: flex; flex-direction: column;">
            <div class="tm-modal-header">
                <h3>📊 Status Transfer History</h3>
                <button class="tm-modal-close">&times;</button>
            </div>
            <div class="tm-modal-body" style="flex: 1; overflow-y: auto; padding: 15px;">
                ${history.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; color: var(--tm-secondary-hover);">
                        <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
                        <div style="font-size: 18px; margin-bottom: 10px;">No status transfer history yet</div>
                        <div style="font-size: 14px; opacity: 0.8;">Start moving repairs to different statuses to see them here!</div>
                    </div>
                ` : `
                    <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                        <button class="tm-status-filter-btn active" data-filter="all" style="
                            padding: 8px 16px;
                            background: var(--tm-primary-color);
                            color: #000;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: 600;
                        ">All (${history.length})</button>
                        ${['30', '40', '55', '65', '70', '75', '90', '100', '105'].map(status => {
                            const count = history.filter(h => h.status === status).length;
                            if (count === 0) return '';
                            return `
                                <button class="tm-status-filter-btn" data-filter="${status}" style="
                                    padding: 8px 16px;
                                    background: var(--tm-dark-color);
                                    color: var(--tm-primary-color);
                                    border: 1px solid var(--tm-shop-item-border);
                                    border-radius: 6px;
                                    cursor: pointer;
                                    font-size: 12px;
                                    font-weight: 600;
                                ">Status ${status} (${count})</button>
                            `;
                        }).join('')}
                        ${history.filter(h => h.status && !['30', '40', '55', '65', '70', '75', '90', '100', '105'].includes(h.status)).length > 0 ? `
                        <button class="tm-status-filter-btn" data-filter="other" style="
                            padding: 8px 16px;
                            background: var(--tm-dark-color);
                            color: var(--tm-primary-color);
                            border: 1px solid var(--tm-shop-item-border);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: 600;
                        ">Other (${history.filter(h => h.status && !['30', '40', '55', '65', '70', '75', '90', '100', '105'].includes(h.status)).length})</button>
                        ` : ''}
                    </div>
                    <div id="tm-status-history-list" style="display: flex; flex-direction: column; gap: 8px;">
                        ${renderStatusHistory(history, 'all')}
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.tm-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    // Filter buttons
    overlay.querySelectorAll('.tm-status-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('.tm-status-filter-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'var(--tm-dark-color)';
                b.style.color = 'var(--tm-primary-color)';
                b.style.border = '1px solid var(--tm-shop-item-border)';
            });
            btn.classList.add('active');
            btn.style.background = 'var(--tm-primary-color)';
            btn.style.color = '#000';
            btn.style.border = 'none';
            
            const filter = btn.dataset.filter;
            const listContainer = document.getElementById('tm-status-history-list');
            if (listContainer) {
                listContainer.innerHTML = renderStatusHistory(history, filter);
            }
        });
    });
}

function renderStatusHistory(history, filter = 'all') {
    let filtered;
    const trackedStatuses = ['30', '40', '55', '65', '70', '75', '90', '100', '105'];
    if (filter === 'all') {
        filtered = history;
    } else if (filter === 'other') {
        filtered = history.filter(h => h.status && !trackedStatuses.includes(h.status));
    } else {
        filtered = history.filter(h => h.status === filter);
    }
    
    if (filtered.length === 0) {
        return `<div style="text-align: center; padding: 40px; color: var(--tm-secondary-hover);">No repairs found for this filter.</div>`;
    }
    
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
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };
    
    const getStatusInfo = (status) => {
        const statusMap = {
            '30': { icon: '📋', color: '#9E9E9E', label: 'Status 30' },
            '40': { icon: '↗️', color: '#4CAF50', label: 'Status 40' },
            '55': { icon: '⏸️', color: '#FF9800', label: 'Status 55' },
            '65': { icon: '⏳', color: '#ffc107', label: 'Status 65' },
            '70': { icon: '🔧', color: '#9C27B0', label: 'Status 70' },
            '75': { icon: '📦', color: '#795548', label: 'Status 75' },
            '90': { icon: '📝', color: '#607D8B', label: 'Status 90' },
            '100': { icon: '✅', color: '#2196F3', label: 'Status 100' },
            '105': { icon: '🎉', color: '#E91E63', label: 'Status 105' },
            'unknown': { icon: '❓', color: '#888', label: 'Unknown Status' }
        };
        return statusMap[status] || { icon: '📋', color: '#888', label: `Status ${status}` };
    };
    
    return filtered.map(entry => {
        const statusInfo = getStatusInfo(entry.status);
        const repairId = entry.repairId ? `#${entry.repairId}` : (entry.url ? 'From URL' : 'Unknown ID');
        const customerName = entry.customerName || (entry.buttonText ? `Button: ${entry.buttonText.substring(0, 30)}` : 'Unknown Customer');
        const deviceInfo = entry.deviceInfo || 'Unknown Device';
        
        return `
            <div style="
                background: var(--tm-shop-item-bg);
                border: 1px solid var(--tm-shop-item-border);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s;
            " onmouseover="this.style.background='var(--tm-shop-item-hover-bg)'" onmouseout="this.style.background='var(--tm-shop-item-bg)'">
                <div style="
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${statusInfo.color}20;
                    border-radius: 8px;
                ">${statusInfo.icon}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="
                        font-weight: 600;
                        color: var(--tm-primary-color);
                        font-size: 14px;
                        margin-bottom: 4px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <span style="color: ${statusInfo.color};">${statusInfo.label}</span>
                        <span style="opacity: 0.6; font-size: 12px;">${repairId}</span>
                    </div>
                    <div style="
                        font-size: 12px;
                        color: var(--tm-secondary-hover);
                        margin-bottom: 2px;
                    ">${customerName}</div>
                    <div style="
                        font-size: 11px;
                        color: var(--tm-secondary-hover);
                        opacity: 0.8;
                    ">${deviceInfo}</div>
                </div>
                <div style="
                    font-size: 11px;
                    color: var(--tm-secondary-hover);
                    text-align: right;
                    white-space: nowrap;
                ">
                    ${formatTime(entry.timestamp)}
                </div>
            </div>
        `;
    }).join('');
}

window.showDashboardModal = showDashboardModal;
window.showStatusTransferHistory = showStatusTransferHistory;
window.showTalentsModal = showTalentsModal;
window.teardownBossBattlesUI = teardownBossBattlesUI;
window.showEventDetailsModal = showEventDetailsModal;
window.forceRandomEvent = forceRandomEvent; // Debug function
window.stopRandomEvent = stopRandomEvent; // Debug function
window.formatTimeRemaining = formatTimeRemaining; // Helper function

window.getGamificationSettingsHTML = getGamificationSettingsHTML;
window.initGamificationSettings = initGamificationSettings;
window.saveGamificationSettings = saveGamificationSettings;
window.updateShopButtonVisibility = updateShopButtonVisibility;
window.populateShop = populateShop;
window.showShopModal = showShopModal;
window.handleShopPurchase = handleShopPurchase;
window.getTalentsHTML = getTalentsHTML;
window.getMascotSettingsHTML = getMascotSettingsHTML;
window.getLevelUpSettingsHTML = getLevelUpSettingsHTML;
window.showQuestsModal = showQuestsModal;
window.populateQuestsModal = populateQuestsModal;
window.trackDailyStat = trackDailyStat;
window.grantXp = grantXp;
window.grantCoins = grantCoins;
window.checkAchievements = checkAchievements;
window.updateQuestProgress = updateQuestProgress;
window.generateDailyQuests = generateDailyQuests;
window.getXpForLevel = getXpForLevel;
window.triggerLevelUpAnimation = triggerLevelUpAnimation;
window.updateCoinBalanceUI = updateCoinBalanceUI;
window.showAchievementNotification = showAchievementNotification;
window.queueNotification = queueNotification;
window.processNotificationQueue = processNotificationQueue;
window.isMmsNotificationActive = isMmsNotificationActive;
window.initOrderTracking = initOrderTracking;
window.initFunFeatures = initFunFeatures;
window.initFunFeatures = initFunFeatures;
window.initFunFeatures = initFunFeatures;
window.initOrderTracking = initOrderTracking;