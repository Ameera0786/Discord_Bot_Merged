const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const { getPlayer, savePlayer } = require("../utils/db");
const { GACHA_POOLS } = require("../data/gachaPools");
const { rollGacha, rarityColor, rarityStars, getBestItem, fmtMultiplier } = require("../utils/gacha");

async function doSpin(interaction, poolKey, player) {
  const pool = GACHA_POOLS[poolKey];

  if (player.tokens < pool.spinCost) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("💸 Not Enough Tokens!")
      .setDescription(
        `You need **${pool.spinCost}** tokens to spin **${pool.displayName}**.\n` +
        `You currently have **${player.tokens}** tokens.\n\n` +
        `Use **/fight** to earn more tokens!`
      );
    return interaction.update({ embeds: [embed], components: [] });
  }

  // --- Roll ---
  const rolledItem = rollGacha(pool);
  player.tokens -= pool.spinCost;

  if (!player.inventory[poolKey]) player.inventory[poolKey] = [];
  player.inventory[poolKey].push({ ...rolledItem, obtainedAt: Date.now() });

  // --- Auto-equip if better ---
  const currentEquippedId = player.equipped[poolKey];
  const currentEquipped = player.inventory[poolKey].find(i => i.id === currentEquippedId);
  let upgradedEquip = false;

  if (!currentEquipped || rolledItem.multiplier > currentEquipped.multiplier) {
    player.equipped[poolKey] = rolledItem.id;
    upgradedEquip = currentEquipped !== undefined;
  }

  savePlayer(interaction.user.id, player);

  const isDuplicate = player.inventory[poolKey].filter(i => i.id === rolledItem.id).length > 1;
  const isEquipped = player.equipped[poolKey] === rolledItem.id;
  const bestItem = getBestItem(player.inventory[poolKey]);

  const embed = new EmbedBuilder()
    .setColor(rarityColor(rolledItem.rarity))
    .setTitle(`${pool.emoji} ${pool.displayName} — Spin Result!`)
    .setDescription(
      `${rolledItem.emoji} **${rolledItem.name}**\n` +
      `${rarityStars(rolledItem.rarity)} ${rolledItem.rarity}\n` +
      `Multiplier: **${fmtMultiplier(rolledItem.multiplier)}**`
    )
    .addFields(
      { name: "🔋 Status",        value: isEquipped ? "✅ **Equipped** (Best in slot!)" : isDuplicate ? "📦 Stored (duplicate)" : "📦 Stored in inventory", inline: false },
      { name: "💰 Tokens Left",   value: `**${player.tokens}** tokens`, inline: true },
      { name: "🏆 Best Equipped", value: bestItem ? `${bestItem.emoji} ${bestItem.name} (${fmtMultiplier(bestItem.multiplier)})` : "None", inline: true },
    );

  if (upgradedEquip) embed.addFields({ name: "⬆️ Upgrade!", value: "This replaces your previous best as the active item.", inline: false });
  if (isDuplicate) embed.addFields({ name: "📋 Note", value: `You already have a **${rolledItem.name}**. The better one is auto-equipped.\nCheck your full inventory with **/inventory**.`, inline: false });

  embed.setFooter({ text: `Spin cost: ${pool.spinCost} tokens • /inventory to see all your items` });

  // --- Rebuild the dropdown so they can spin again ---
  const updatedPlayer = getPlayer(interaction.user.id);
  const menu = buildMenu(updatedPlayer);
  const row = new ActionRowBuilder().addComponents(menu);

  return interaction.update({ embeds: [embed], components: [row] });
}

function buildMenu(player) {
  return new StringSelectMenuBuilder()
    .setCustomId("spin_select")
    .setPlaceholder("Choose a gacha pool to spin...")
    .addOptions(
      Object.entries(GACHA_POOLS).map(([key, pool]) => {
        const canAfford = player.tokens >= pool.spinCost;
        return new StringSelectMenuOptionBuilder()
          .setLabel(`${pool.displayName}`)
          .setDescription(`${pool.spinCost} tokens • ${pool.description}${canAfford ? "" : " (not enough tokens)"}`)
          .setEmoji(pool.emoji)
          .setValue(key);
      })
    );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spin")
    .setDescription("Spin a gacha pool to get a new item!"),

  async execute(interaction) {
    const player = getPlayer(interaction.user.id);
    const menu = buildMenu(player);
    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle("🎰 Gacha Spin")
      .setDescription(`You have **${player.tokens} tokens**.\nPick a pool below to spin!`);

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  // Called from index.js when the select menu is used
  async handleSelect(interaction) {
    if (interaction.user.id !== interaction.user.id) {
      return interaction.reply({ content: "❌ This isn't your spin menu!", ephemeral: true });
    }
    const poolKey = interaction.values[0];
    const player = getPlayer(interaction.user.id);
    await doSpin(interaction, poolKey, player);
  }
};
