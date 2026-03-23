const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { GACHA_POOLS } = require("../data/gachaPools");
const { rarityColor, rarityStars, fmtMultiplier } = require("../utils/gacha");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rates")
    .setDescription("View drop rates and items for a gacha pool")
    .addStringOption(option =>
      option
        .setName("pool")
        .setDescription("Which pool to view rates for")
        .setRequired(true)
        .addChoices(
          ...Object.entries(GACHA_POOLS).map(([key, pool]) => ({
            name: `${pool.emoji} ${pool.displayName}`,
            value: key
          }))
        )
    ),

  async execute(interaction) {
    const poolKey = interaction.options.getString("pool");
    const pool = GACHA_POOLS[poolKey];

    if (!pool) {
      return interaction.reply({ content: "❌ Unknown pool.", ephemeral: true });
    }

    const totalWeight = pool.items.reduce((sum, i) => sum + i.weight, 0);

    // Group by rarity
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

    return interaction.reply({ embeds: [embed] });
  }
};
