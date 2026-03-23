const { adjustStat, saveUsers} = require('./userManager');

// Food definitions
const allFoods = {
    apple: { hunger: 1, emoji: '🍎', price: 5 },
    sandwich: { hunger: 5, emoji: '🥪', price: 50 },
    steak: { hunger: 10, energy: 5, emoji: '🥩', price: 500 },
    coffee: { hunger: 0, energy: 15, emoji: '☕', price: 75 },
    orange: { hunger: 3, luck: 0.5, emoji: '🍊', temporary: true, duration: 60_000, price: 10000 }
};

const defaultFoodNames = ['apple', 'sandwich', 'steak'];

// Initialize inventory if missing
function getFoodInventory(user) {
    if (!user.foodInventory) {
        user.foodInventory = {};
        for (const name of defaultFoodNames) {
            user.foodInventory[name] = { qty: 1 };
        }
    }

    return user.foodInventory;
}

function resolveFood(user, foodName) {
    const inventory = getFoodInventory(user);
    const saved = inventory[foodName];
    const definition = allFoods[foodName];

    if (!saved || !definition || saved.qty <= 0) return null;

    return { ...definition, qty: saved.qty };
}

// Eat a food
function eatFood(user, foodName) {
    const inventory = getFoodInventory(user);
    const food = resolveFood(user, foodName);

    if (!food || food.qty <= 0) { return { success: false, message: `You don't have any ${foodName}!` }; }

    // Apply permanent stats
    if (food.hunger) adjustStat(user, 'hunger', food.hunger, 0, user.maxHunger);
    if (food.energy) adjustStat(user, 'energy', food.energy, 0, user.maxEnergy);

    // Apply temporary stats
    if (food.luck) {
        adjustStat(user, 'luck', food.luck, 0, Infinity);
        if (food.temporary && food.duration) {
            setTimeout(() => {
                adjustStat(user, 'luck', -food.luck, 0, Infinity);
                saveUsers();
            }, food.duration);
        }
    }

    inventory[foodName].qty -= 1;

    saveUsers();
    return {
        success: true,
        message: `🍴 You ate a ${foodName} and restored ${food.hunger || 0} hunger, ${food.energy || 0} energy${food.luck ? `, and got +${food.luck} luck temporarily!` : ''}`,
    };
}

// Add or give more of a food
function addFood(user, foodName, quantity = 1) {
    if (!allFoods[foodName]) { return; }
    const inventory = getFoodInventory(user);
    if (!inventory[foodName]) { inventory[foodName] = { qty: 0 }; }
    inventory[foodName].qty += quantity;
    saveUsers();
}

function getAllFoods() { return allFoods; }

module.exports = { getInventory: getFoodInventory, eatFood, addFood, resolveFood, getAllFoods };