const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/managers/userManager');
const { getInventory, resolveFood } = require('../utils/managers/foodManager');

async function displayInventory(interaction) {
    if (interaction.deferred || interaction.replied) return;
    await interaction.deferReply();

    const user = getUser(interaction.user.id);
    const inventory = getInventory(user);

    const embed = new EmbedBuilder()
        .setTitle('🧺 Your Food Inventory');

    const foodList = Object.keys(inventory)
        .map(name => {
            const food = resolveFood(user, name);
            if (!food) return null;
            return `${food.emoji} **${name}** x${food.qty}${food.temporary ? ' *(temporary)*' : ''}`;
        })
        .filter(Boolean)
        .join('\n') || 'Nothing in inventory';

    embed.setDescription(foodList);

    await interaction.editReply({ embeds: [embed] });}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bag')
        .setDescription('See your food bag'),
    execute: displayInventory,
};