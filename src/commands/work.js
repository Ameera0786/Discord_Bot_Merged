const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const { getUser} = require('../utils/managers/userManager');
const { getWorkEvent } = require('../utils/events/workEvents');

const ONE_SECOND = 1000;
const WORK_COOLDOWN =  10 * ONE_SECOND;

const ENERGY_REQUIRED = 10;
const HUNGER_REQUIRED = 10;

// Helper function
function timeLeft(user) {
    return Math.max(0, Math.ceil((WORK_COOLDOWN - (Date.now() - user.lastWork)) / 1000));
}

function isOnCooldown(user) {
    return Date.now() - user.lastWork < WORK_COOLDOWN;
}

function buildWorkButton(disabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('work_again')
            .setLabel('Work Again')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('💼')
            .setDisabled(disabled)
    );
}

function buildWorkContent(user, message) {
    return (message ? `\n${message}` : '') +
        `\n💰 Money: ${user.money}` +
        `\n⚡ Energy: ${user.energy} | 🍔 Hunger: ${user.hunger}`;
}

async function performWork(interaction) {
    const user = getUser(interaction.user.id);

    // if (isOnCooldown(user)) { return interaction.editReply(`⏳ You are too tired to work right now.\nPlease wait ${timeLeft(user)} more seconds.`);}

    if (user.energy < ENERGY_REQUIRED && user.hunger < HUNGER_REQUIRED) { return interaction.editReply({ content: '😴 Woah - Go eat and wait for energy! Overworking!!', components: [buildWorkButton(true)] }); }
    else if (user.energy < ENERGY_REQUIRED) { return interaction.editReply({ content: '😴 You are too exhausted. Wait for more energy.', components: [buildWorkButton(true)] }); }
    else if (user.hunger < HUNGER_REQUIRED) { return interaction.editReply({ content: '😴 You are hungry. Go eat.', components: [buildWorkButton(true)] }); }

    const {message } = getWorkEvent(user);
    user.lastWork = Date.now();

    await interaction.editReply({
        content: buildWorkContent(user, message),
        components: [buildWorkButton()]
    });
}

async function execute(interaction) {
    await interaction.deferReply();
    await performWork(interaction);

    const reply = await interaction.fetchReply();

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000
    });

    collector.on('collect', async buttonInteraction => {
        if (buttonInteraction.user.id !== interaction.user.id) {
            return buttonInteraction.followUp({ content: "This isn't your work session!", flags: MessageFlags.Ephemeral });
        }

        await buttonInteraction.deferUpdate();
        await performWork(interaction);
    });

    collector.on('end', async () => {
        try {
            await interaction.editReply({ components: [buildWorkButton(true)] });
        } catch {}
    });
}

// Export
module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Earn money (costs energy)'),
    execute
};