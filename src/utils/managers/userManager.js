const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../../data/users.json');

let users = {};

if (!fs.existsSync(path.dirname(usersFile))) {
    fs.mkdirSync(path.dirname(usersFile), { recursive: true });
}
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers() {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function getUser(id) {
    if (!users[id]) {
        users[id] = {
            // Work/food stats
            money: 100,
            energy: 100,
            hunger: 100,
            luck: 1,
            lastWork: 0,
            maxEnergy: 100,
            maxHunger: 100,
            foodInventory: {},
            // Gacha stats
            tokens: 0,
            lastFight: null,
            inventory: {},
            equipped: {}
        };
        saveUsers();
    }
    // Ensure old accounts have gacha fields
    const u = users[id];
    if (u.tokens === undefined) { u.tokens = 0; u.lastFight = null; u.inventory = {}; u.equipped = {}; saveUsers(); }
    // Ensure old accounts have work fields
    if (u.money === undefined) { u.money = 100; u.energy = 100; u.hunger = 100; u.luck = 1; u.lastWork = 0; u.maxEnergy = 100; u.maxHunger = 100; u.foodInventory = {}; saveUsers(); }
    return users[id];
}

function adjustStat(user, stat, delta, min = 0, max = 100) {
    if (!(stat in user)) return;
    user[stat] = Math.min(Math.max(user[stat] + delta, min), max);
    saveUsers();
}

function addEnergy(amount) {
    for (const id in users) {
        adjustStat(users[id], 'energy', amount, 0, users[id].maxEnergy);
    }
}

module.exports = { getUser, adjustStat, addEnergy, saveUsers };
