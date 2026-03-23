const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const { getUser } = require('../utils/managers/userManager');
const { getInventory, resolveFood, eatFood } = require('../utils/managers/foodManager');

function buildInventoryEmbed(user) {
    const inventory = getInventory(user);

    const foodList = Object.keys(inventory)
        .map(name => {
            const food = resolveFood(user, name);
            if (!food) return null;
            return `${food.emoji} **${name}** x${food.qty}${food.temporary ? ' *(temporary)*' : ''}`;
        })
        .filter(Boolean)
        .join('\n') || 'Nothing in inventory';

    return new EmbedBuilder()
        .setTitle('🍴 What do you want to eat?')
        .setDescription(foodList);
}

function buildFoodButtons(user) {
    const inventory = getInventory(user);
    const rows = [];
    let currentRow = new ActionRowBuilder();
    let count = 0;

    for (const name of Object.keys(inventory)) {
        const food = resolveFood(user, name);
        if (!food) continue;

        if (count > 0 && count % 5 === 0) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
        }
        if (rows.length >= 5) break;

        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`eat_${name}`)
                .setLabel(`${food.emoji} ${name}`)
                .setStyle(ButtonStyle.Secondary)
        );
        count++;
    }

    if (currentRow.components.length > 0) rows.push(currentRow);
    return rows;
}

async function eatCommand(interaction) {
    if (interaction.deferred || interaction.replied) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const user = getUser(interaction.user.id);

    await interaction.editReply({
        embeds: [buildInventoryEmbed(user)],
        components: buildFoodButtons(user)
    });

    const reply = await interaction.fetchReply();
    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60 * 1000
    });

    collector.on('collect', async buttonInteraction => {
        if (buttonInteraction.user.id !== interaction.user.id) { return buttonInteraction.reply({ content: "This isn't your inventory!", flags: MessageFlags.Ephemeral }); }

        try {
            await buttonInteraction.deferUpdate();

            const foodName = buttonInteraction.customId.replace('eat_', '');
            const result = eatFood(user, foodName);

            await interaction.editReply({
                content: result.message,
                embeds: [buildInventoryEmbed(user)],
                components: buildFoodButtons(user)
            });
        } catch (err) {
            console.error('Button interaction failed (likely stale):', err.code);
        }
    });

    collector.on('end', async () => {
        try {
            await interaction.editReply({ components: [] });
        } catch {}
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eat')
        .setDescription('Eat a food from your inventory'),
    execute: eatCommand,
};