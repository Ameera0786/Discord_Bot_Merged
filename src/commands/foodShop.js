const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildShopMenu } = require('../handlers/foodShopHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('food_shop')
        .setDescription('Open the food shop'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const row = buildShopMenu();

            await interaction.editReply({
                content: '🛒 Welcome to the food shop!',
                components: [row]
            });

        } catch (error) {
            console.error('Error in /foodShop command:', error);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply('❌ Something went wrong loading the shop.');
                } else {
                    await interaction.reply({ content: '❌ Something went wrong loading the shop.', flags: MessageFlags.Ephemeral });
                }
            } catch (followUpError) {
                console.error('Failed to send error response:', followUpError);
            }
        }
    }
};