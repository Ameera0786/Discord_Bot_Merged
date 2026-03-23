const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { GACHA_POOLS } = require("../data/gachaPools");
const { rarityColor, rarityStars, fmtMultiplier } = require("../utils/gacha");

async function execute(interaction) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId("rates_select")
        .setPlaceholder("Choose a gacha pool to view drop rates...")
        .addOptions(
            Object.entries(GACHA_POOLS).map(([key, pool]) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(pool.displayName)
                    .setDescription(pool.description)
                    .setValue(key)
                    .setEmoji(pool.emoji)
            )
        );

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("🎰 Gacha Pools")
        .setDescription("Select a pool below to view its drop rates!");

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

// Called when a pool is selected from dropdown
async function handleSelect(interaction) {
    await interaction.deferUpdate();
    const poolKey = interaction.values[0];
    const pool = GACHA_POOLS[poolKey];

    if (!pool) return interaction.editReply({ content: "❌ Unknown pool!", ephemeral: true });

    const totalWeight = pool.items.reduce((sum, i) => sum + i.weight, 0);

    const byRarity = {};
    for (const item of pool.items) {
        if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
        byRarity[item.rarity].push(item);
    }

    const rarityOrder = ["Common", "Rare", "Epic", "Legendary"];

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle(`${pool.emoji} ${pool.displayName} — Drop Rates`)
        .setDescription(`${pool.description}\n💰 **Spin cost: ${pool.spinCost} tokens**`);

    for (const rarity of rarityOrder) {
        const items = byRarity[rarity];
        if (!items) continue;

        const lines = items.map(item => {
            const chance = ((item.weight / totalWeight) * 100).toFixed(1);
            return `${item.emoji} **${item.name}** — ${fmtMultiplier(item.multiplier)} · **${chance}%**`;
        });

        embed.addFields({
            name: `${rarityStars(rarity)} ${rarity}`,
            value: lines.join("\n"),
            inline: false
        });
    }

    embed.setFooter({ text: "Use /spin to try your luck!" });

    return interaction.editReply({ embeds: [embed], components: [] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rates")
        .setDescription("View drop rates for any gacha pool via dropdown"),

    execute,
    handleSelect
};