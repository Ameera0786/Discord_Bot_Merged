const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, savePlayer } = require("../utils/db");
const { GACHA_POOLS, MOBS, FIGHT_COOLDOWN_MS } = require("../data/gachaPools");
const { fmtMultiplier } = require("../utils/gacha");

// Calculate a player's total power from all equipped items
function getTotalPower(player) {
  let power = 1.0;
  for (const [poolKey, pool] of Object.entries(GACHA_POOLS)) {
    const equippedId = player.equipped[poolKey];
    const items = player.inventory[poolKey] || [];
    const equipped = items.find(i => i.id === equippedId);
    if (equipped) power *= equipped.multiplier;
  }
  return power;
}

// Convert total power into a win chance bonus
// Power of 1.0 (no items) = no bonus
// Power scales up to a max +40% bonus at high power levels
function powerToBonus(power) {
  // Uses a logarithmic curve so early items matter a lot, later ones taper off
  // e.g. power 2.0 → ~+14%, power 5.0 → ~+28%, power 20.0 → ~+40%
  const MAX_BONUS = 0.20;
  const bonus = MAX_BONUS * (Math.log(power) / Math.log(300));
  return Math.min(MAX_BONUS, Math.max(0, bonus));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fight")
    .setDescription("Battle a random mob and earn tokens!"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const player = getPlayer(userId);

    // --- Cooldown check ---
    const now = Date.now();
    if (player.lastFight) {
      const elapsed = now - player.lastFight;
      if (elapsed < FIGHT_COOLDOWN_MS) {
        const remaining = Math.ceil((FIGHT_COOLDOWN_MS - elapsed) / 1000);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xe74c3c)
              .setTitle("⏳ Still Recovering...")
              .setDescription(`You're still tired from your last fight!\nCome back in **${remaining}s**.`)
          ],
          ephemeral: true
        });
      }
    }

    // --- Pick a random mob ---
    const mob = MOBS[Math.floor(Math.random() * MOBS.length)];

    // --- Calculate win chance: base difficulty + power bonus ---
    const baseWinChance = { easy: 0.90, medium: 0.65, hard: 0.40 }[mob.difficulty] ?? 0.70;
    const totalPower = getTotalPower(player);
    const bonus = powerToBonus(totalPower);
    const finalWinChance = Math.min(0.98, baseWinChance + bonus); // cap at 98%
    const playerWon = Math.random() < finalWinChance;

    // --- Cooldown always applies ---
    player.lastFight = now;

    const diffColor = { easy: 0x2ecc71, medium: 0xf39c12, hard: 0xe74c3c }[mob.difficulty] ?? 0x95a5a6;
    const diffLabel = mob.difficulty.charAt(0).toUpperCase() + mob.difficulty.slice(1);
    const powerLabel = `${fmtMultiplier(totalPower)} power → **+${Math.round(bonus * 100)}%** bonus`;

    let embed;

    if (playerWon) {
      const tokensEarned = Math.floor(
        Math.random() * (mob.maxTokens - mob.minTokens + 1) + mob.minTokens
      );
      player.tokens += tokensEarned;
      savePlayer(userId, player);

      const winNarratives = [
        `You charged at the ${mob.name} with fierce determination and emerged victorious!`,
        `The ${mob.name} put up a fight, but you overpowered it in the end!`,
        `With a swift strike, you defeated the ${mob.name} and claimed your reward!`,
        `The ${mob.name} trembled before your power — a clean victory!`,
      ];

      embed = new EmbedBuilder()
        .setColor(diffColor)
        .setTitle(`${mob.emoji} Victory! — ${mob.name}`)
        .setDescription(winNarratives[Math.floor(Math.random() * winNarratives.length)])
        .addFields(
          { name: "💰 Tokens Earned", value: `**+${tokensEarned}** tokens`,                        inline: true },
          { name: "👛 Your Balance",  value: `**${player.tokens}** tokens`,                        inline: true },
          { name: "⚔️ Difficulty",    value: diffLabel,                                            inline: true },
          { name: "💥 Power Bonus",   value: powerLabel,                                           inline: false },
          { name: "📊 Win Chance",    value: `${Math.round(finalWinChance * 100)}% (base ${Math.round(baseWinChance * 100)}% + bonus)`, inline: false },
        )
        .setFooter({ text: `Cooldown: ${FIGHT_COOLDOWN_MS / 1000}s • Use /spin to increase your power!` });

    } else {
      // Loss — optionally subtract tokens (uncomment to enable)
      // const tokensLost = Math.floor(Math.random() * 10 + 5);
      // player.tokens = Math.max(0, player.tokens - tokensLost);
      savePlayer(userId, player);

      const lossNarratives = [
        `The ${mob.name} was too powerful — you were forced to retreat!`,
        `You fought bravely, but the ${mob.name} overwhelmed you!`,
        `The ${mob.name} landed a crushing blow and sent you running!`,
        `You couldn't keep up with the ${mob.name}'s speed — a bitter defeat.`,
      ];

      embed = new EmbedBuilder()
        .setColor(0x7f8c8d)
        .setTitle(`${mob.emoji} Defeated! — ${mob.name}`)
        .setDescription(lossNarratives[Math.floor(Math.random() * lossNarratives.length)])
        .addFields(
          { name: "💰 Tokens Earned", value: `**+0** tokens`,                                       inline: true },
          { name: "👛 Your Balance",  value: `**${player.tokens}** tokens`,                         inline: true },
          { name: "⚔️ Difficulty",    value: diffLabel,                                             inline: true },
          { name: "💥 Power Bonus",   value: powerLabel,                                            inline: false },
          { name: "📊 Win Chance",    value: `${Math.round(finalWinChance * 100)}% (base ${Math.round(baseWinChance * 100)}% + bonus)`, inline: false },
        )
        .setFooter({ text: `Cooldown: ${FIGHT_COOLDOWN_MS / 1000}s • Use /spin to boost your power and win more fights!` });
    }

    return interaction.reply({ embeds: [embed] });
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fight")
    .setDescription("Battle a random mob and earn tokens!"),

  async execute(interaction) {
    const userId = interaction.user.id;
    const player = getPlayer(userId);

    // --- Cooldown check ---
    const now = Date.now();
    if (player.lastFight) {
      const elapsed = now - player.lastFight;
      if (elapsed < FIGHT_COOLDOWN_MS) {
        const remaining = Math.ceil((FIGHT_COOLDOWN_MS - elapsed) / 1000);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xe74c3c)
              .setTitle("⏳ Still Recovering...")
              .setDescription(`You're still tired from your last fight!\nCome back in **${remaining}s**.`)
          ],
          ephemeral: true
        });
      }
    }

    // --- Pick a random mob ---
    const mob = MOBS[Math.floor(Math.random() * MOBS.length)];

    // --- Win chance based on difficulty ---
    const winChance = { easy: 0.90, medium: 0.65, hard: 0.40 }[mob.difficulty] ?? 0.70;
    const playerWon = Math.random() < winChance;

    // --- Cooldown always applies whether win or loss ---
    player.lastFight = now;

    // --- Difficulty label color ---
    const diffColor = { easy: 0x2ecc71, medium: 0xf39c12, hard: 0xe74c3c }[mob.difficulty] ?? 0x95a5a6;
    const diffLabel = mob.difficulty.charAt(0).toUpperCase() + mob.difficulty.slice(1);

    let embed;

    if (playerWon) {
      const tokensEarned = Math.floor(
        Math.random() * (mob.maxTokens - mob.minTokens + 1) + mob.minTokens
      );
      player.tokens += tokensEarned;
      savePlayer(userId, player);

      const winNarratives = [
        `You charged at the ${mob.name} with fierce determination and emerged victorious!`,
        `The ${mob.name} put up a fight, but you overpowered it in the end!`,
        `With a swift strike, you defeated the ${mob.name} and claimed your reward!`,
        `The ${mob.name} trembled before your power — a clean victory!`,
      ];

      embed = new EmbedBuilder()
        .setColor(diffColor)
        .setTitle(`${mob.emoji} Victory! — ${mob.name}`)
        .setDescription(winNarratives[Math.floor(Math.random() * winNarratives.length)])
        .addFields(
          { name: "💰 Tokens Earned", value: `**+${tokensEarned}** tokens`,  inline: true },
          { name: "👛 Your Balance",  value: `**${player.tokens}** tokens`,  inline: true },
          { name: "⚔️ Difficulty",    value: diffLabel,                      inline: true },
        )
        .setFooter({ text: `Cooldown: ${FIGHT_COOLDOWN_MS / 1000}s • Use /spin to spend tokens!` });

    } else {
      // Loss — optionally subtract tokens (uncomment the lines below to enable token loss)
      // const tokensLost = Math.floor(Math.random() * 10 + 5);
      // player.tokens = Math.max(0, player.tokens - tokensLost);
      savePlayer(userId, player);

      const lossNarratives = [
        `The ${mob.name} was too powerful — you were forced to retreat!`,
        `You fought bravely, but the ${mob.name} overwhelmed you!`,
        `The ${mob.name} landed a crushing blow and sent you running!`,
        `You couldn't keep up with the ${mob.name}'s speed — a bitter defeat.`,
      ];

      embed = new EmbedBuilder()
        .setColor(0x7f8c8d)
        .setTitle(`${mob.emoji} Defeated! — ${mob.name}`)
        .setDescription(lossNarratives[Math.floor(Math.random() * lossNarratives.length)])
        .addFields(
          { name: "💰 Tokens Earned", value: `**+0** tokens`,               inline: true },
          { name: "👛 Your Balance",  value: `**${player.tokens}** tokens`, inline: true },
          { name: "⚔️ Difficulty",    value: diffLabel,                     inline: true },
          { name: "📊 Win Chance",    value: `${Math.round(winChance * 100)}% for this mob`, inline: true },
        )
        .setFooter({ text: `Cooldown: ${FIGHT_COOLDOWN_MS / 1000}s • Try again or fight an easier mob!` });
    }

    return interaction.reply({ embeds: [embed] });
  }
};
