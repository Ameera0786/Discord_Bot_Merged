const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../utils/db");
const { GACHA_POOLS } = require("../data/gachaPools");
const { rarityStars, getBestItem, fmtMultiplier } = require("../utils/gacha");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your profile, equipped items, and total power"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const player = getPlayer(userId);

    // Calculate total power multiplier from all equipped items
    let totalMultiplier = 1.0;
    const equippedLines = [];

    for (const [poolKey, pool] of Object.entries(GACHA_POOLS)) {
      const items = player.inventory[poolKey] || [];
      const equippedId = player.equipped[poolKey];
      const equippedItem = items.find(i => i.id === equippedId);

      if (equippedItem) {
        totalMultiplier *= equippedItem.multiplier;
        equippedLines.push(
          `${equippedItem.emoji} **${equippedItem.name}** — ${fmtMultiplier(equippedItem.multiplier)}\n` +
          `  ${rarityStars(equippedItem.rarity)} ${equippedItem.rarity} · ${pool.displayName}`
        );
      } else {
        equippedLines.push(`${pool.emoji} **${pool.displayName}** — _Nothing equipped_`);
      }
    }

    // Total items collected
    const totalItems = Object.values(player.inventory).reduce((sum, arr) => sum + arr.length, 0);

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle(`⚔️ ${interaction.user.username}'s Profile`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "💰 Tokens", value: `**${player.tokens}**`, inline: true },
        { name: "📦 Items Owned", value: `**${totalItems}**`, inline: true },
        { name: "💥 Total Power", value: `**${fmtMultiplier(totalMultiplier)}**`, inline: true },
        { name: "🎯 Equipped Items", value: equippedLines.join("\n\n") || "_Nothing equipped yet_", inline: false }
      )
      .setFooter({ text: "Use /fight to earn tokens • /spin to get items • /inventory to see all" });

    return interaction.reply({ embeds: [embed] });
  }
};
