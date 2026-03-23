const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { getUser, adjustStat } = require('../utils/managers/userManager');
const { addFood, getAllFoods } = require('../utils/managers/foodManager');

const quantities = [1, 5, 20, 100];
const userStates = new Map();

function getState(userId) {
    if (!userStates.has(userId)) { userStates.set(userId, { item: null, quantityIndex: 0 }); }
    return userStates.get(userId);
}

function buildShopMenu() {
    const foods = getAllFoods();
    const options = Object.entries(foods)
        .slice(0, 25)
        .map(([key, food]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: key,
            emoji: food?.emoji,
            description: `Costs ${food?.price ?? 0} coins`
        }));

    const menu = new StringSelectMenuBuilder()
        .setCustomId('foodShop_select')
        .setPlaceholder('Choose something to buy...')
        .addOptions(options);

    return new ActionRowBuilder().addComponents(menu);
}

async function handleShopInteraction(interaction) {
    const foods = getAllFoods();
    const userId = interaction.user.id;
    const state = getState(userId);

    if (interaction.isStringSelectMenu()) {
        state.item = interaction.values[0];
        state.quantityIndex = 0;
        return updateUI(interaction, state, foods);
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'foodShop_back') {
            state.item = null;
            state.quantityIndex = 0;
            return interaction.update({
                content: '🛒 Welcome to the food shop!',
                embeds: [],
                components: [buildShopMenu(foods)]
            });
        }

        if (!state.item) { return interaction.reply({ content: "Pick an item first.", ephemeral: true }); }
        if (interaction.customId === 'foodShop_qty_toggle') { state.quantityIndex = (state.quantityIndex + 1) % quantities.length; return updateUI(interaction, state, foods); }
        if (interaction.customId === 'foodShop_buy_item') { return handlePurchase(interaction, state, foods); }
    }
}

async function updateUI(interaction, state, foods) {
    const item = foods[state.item];
    const quantity = quantities[state.quantityIndex];
    const total = item.price * quantity;

    const embed = new EmbedBuilder()
        .setTitle(`${item.emoji} ${state.item}`)
        .setDescription(
            `Price: ${item.price} coins\n` +
            `Quantity: x${quantity}\n\n` +
            `Total: **${total} coins**`
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('foodShop_back')
            .setLabel('← Back')
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId('foodShop_qty_toggle')
            .setLabel(`x${quantity}`)
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('foodShop_buy_item')
            .setLabel('Buy')
            .setStyle(ButtonStyle.Success)
    );

    await interaction.update({ embeds: [embed], components: [row] });
}

async function handlePurchase(interaction, state, foods) {
    await interaction.deferUpdate();
    const user = getUser(interaction.user.id);
    const item = foods[state.item];
    const quantity = quantities[state.quantityIndex];
    const total = item.price * quantity;

    if (user.money < total) { return interaction.followUp({ content: `❌ You need ${total} coins.`, ephemeral: true }); }

    adjustStat(user, 'money', -total, 0, Infinity);
    addFood(user, state.item, quantity);

    return interaction.followUp({ content: `✅ Bought x${quantity} ${item.emoji} ${state.item}!`, ephemeral: true });
}

module.exports = { handleShopInteraction, buildShopMenu };