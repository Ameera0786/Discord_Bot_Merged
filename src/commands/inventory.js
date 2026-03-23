const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../utils/db");
const { GACHA_POOLS } = require("../data/gachaPools");
const { rarityStars, getBestItem, fmtMultiplier } = require("../utils/gacha");

async function execute(interaction) {
    const userId = interaction.user.id;
    const player = getPlayer(userId);
    const filterPool = interaction.options.getString("pool");

    const poolsToShow = filterPool
        ? [[filterPool, GACHA_POOLS[filterPool]]]
        : Object.entries(GACHA_POOLS);

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📦 ${interaction.user.username}'s Inventory`)
        .setDescription(`💰 **${player.tokens} tokens** available`)
        .setThumbnail(interaction.user.displayAvatarURL());

    let hasAnything = false;

    for (const [poolKey, pool] of poolsToShow) {
        const items = player.inventory[poolKey] || [];
        const equippedId = player.equipped[poolKey];

        if (items.length === 0) {
            embed.addFields({
                name: `${pool.emoji} ${pool.displayName}`,
                value: "_Nothing collected yet — use /spin to get items!_",
                inline: false
            });
            continue;
        }

        hasAnything = true;

        // Group items by id and count duplicates
        const grouped = {};
        for (const item of items) {
            if (!grouped[item.id]) grouped[item.id] = { ...item, count: 0 };
            grouped[item.id].count++;
        }

        // Sort by multiplier descending
        const sorted = Object.values(grouped).sort((a, b) => b.multiplier - a.multiplier);

        const lines = sorted.map(item => {
            const isEquipped = item.id === equippedId;
            const countLabel = item.count > 1 ? ` (x${item.count})` : "";
            const equippedLabel = isEquipped ? " ✅" : "";
            return (
                `${item.emoji} **${item.name}**${equippedLabel}${countLabel}\n` +
                `  ${rarityStars(item.rarity)} ${item.rarity} • ${fmtMultiplier(item.multiplier)}`
            );
        });

        embed.addFields({
            name: `${pool.emoji} ${pool.displayName} (${items.length} total)`,
            value: lines.join("\n") || "_Empty_",
            inline: false
        });
    }

    if (!hasAnything && !filterPool) {
        embed.setDescription(
            `💰 **${player.tokens} tokens** available\n\n` +
            `Your inventory is empty! Use **/fight** to earn tokens, then **/spin** to get items.`
        );
    }

    embed.setFooter({ text: "✅ = Equipped (best in slot) • Duplicates are kept, only best is used" });

    return interaction.reply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("View all your collected gacha items")
        .addStringOption(option =>
            option
                .setName("pool")
                .setDescription("Filter by a specific pool (optional)")
                .setRequired(false)
                .addChoices(
                    ...Object.entries(GACHA_POOLS).map(([key, pool]) => ({
                        name: `${pool.emoji} ${pool.displayName}`,
                        value: key
                    }))
                )
        ),

    execute
};