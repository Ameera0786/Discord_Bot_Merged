const {adjustStat} = require("../managers/userManager");

function calculateEarnings() {
    return Math.floor(Math.random() * 50) + 20;
}

function lucky(user) {
    const doubled = user.money;
    adjustStat(user, "money", doubled, 0, Infinity);

    return {
        earnings: doubled,
        energyLoss: 0,
        hungerLoss: 0,
        message: `🍀 Lucky day! Your total money doubled!`,
    };
}

function bad(user) {
    const loss = Math.floor(user.money / 2);
    adjustStat(user, "money", -loss, 0, Infinity);

    return {
        earnings: -loss,
        energyLoss: 0,
        hungerLoss: 0,
        message: `💀 Bad day... you got robbed. Lost $${loss}`,
    };
}

function bonus(user) {
    const bonusAmount = 1000;
    adjustStat(user, "money", bonusAmount, 0, Infinity);

    return {
        earnings: bonusAmount,
        energyLoss: 0,
        hungerLoss: 0,
        message: `💰 You got a surprise bonus, +$${bonusAmount}!`,
    };
}

function loseMoney(user) {
    const loss = Math.floor(Math.random() * user.money / 4);
    adjustStat(user, "money", -loss, 0, Infinity);

    return {
        earnings: -loss,
        energyLoss: 0,
        hungerLoss: 0,
        message: `🕳️ You lost $${loss} somehow...`,
    };
}

function hunger(user) {
    const hungerLoss = 20;
    adjustStat(user, "hunger", -hungerLoss, 0, user.maxHunger);

    return {
        earnings: 0,
        energyLoss: 0,
        hungerLoss: hungerLoss,
        message: `🍔 You forgot to eat and got hungrier. Lost ${hungerLoss} hunger`,
    };
}

function suspended() {
    return {
        earnings: 0,
        energyLoss: 0,
        hungerLoss: 0,
        message: '🚫 You got told to leave early. No pay.',
    };
}

function sick(user) {
    const energyLoss = 20;
    adjustStat(user, "energy", -energyLoss, 0, user.maxEnergy);

    return {
        earnings: 0,
        energyLoss: energyLoss,
        hungerLoss: 0,
        message: `🤒 You got sick and lost extra energy. Lost ${energyLoss} energy`,
    };
}

function normal(user) {
    const profit = calculateEarnings();
    adjustStat(user, "money", profit, 0, Infinity);
    return {
        earnings: profit,
        energyLoss: 0,
        hungerLoss: 0,
        message: `💼 Normal work day! Earned ${profit}`,
    }
}

module.exports = {
    lucky,
    bad,
    bonus,
    loseMoney,
    hunger,
    suspended,
    sick,
    normal,
};