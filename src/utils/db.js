// Compatibility shim — gacha commands import from here
// All data is actually stored in userManager
const { getUser, saveUsers } = require('./managers/userManager');

function savePlayer(userId, playerData) {
    const users = require('./managers/userManager');
    // playerData IS the user object (passed by reference), saveUsers persists it
    saveUsers();
}

module.exports = { getPlayer: getUser, savePlayer };
