const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/managers/userManager');

function progressBar(value, max = 100, length = 10, type = 'green') {
    const filled = Math.round((value / max) * length);
    let fillEmoji;
    let emptyEmoji = '⬜'; // empty block

    if (type === 'green') fillEmoji = '🟩';
    else if (type === 'orange') fillEmoji = '🟧';
    else if (type === 'red') fillEmoji = '🟥';
    else fillEmoji = '⬛';

    return fillEmoji.repeat(filled) + emptyEmoji.repeat(length - filled);
}

async function displayStats(interaction) {
    if (interaction.deferred || interaction.replied) return;
    await interaction.deferReply();

    const user = getUser(interaction.user.id);

    const energyBar = progressBar(user.energy, user.maxEnergy, 10, 'green');
    const hungerBar = progressBar(user.hunger, user.maxHunger, 10, 'orange');

    const embed = new EmbedBuilder()
        .setTitle('📊 Your Stats')
        .addFields(
            { name: '💰 Money:', value: `$${user.money}`, inline: true },
            { name: '🍀 Luck:', value: `${user.luck}`, inline: true },
            { name: '⚡ Energy:', value: `${user.energy}/${user.maxEnergy}\n${energyBar}`, inline: false },
            { name: '🍔 Hunger:', value: `${user.hunger}/${user.maxHunger}\n${hungerBar}`, inline: false },
        );

    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check your current stats'),
    execute: displayStats,
};