require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, MessageFlags } = require('discord.js');
const { addEnergy } = require('./utils/managers/userManager');
const { handleShopInteraction } = require('./handlers/foodShopHandler');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load all commands dynamically
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

// Handle interactions
client.on('interactionCreate', async interaction => {
    try {
        // Slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        }

        // Select menus & buttons
        if (interaction.isStringSelectMenu() || interaction.isButton()) {
            // Food shop
            if (interaction.customId.startsWith('foodShop_')) {
                return handleShopInteraction(interaction);
            }
            // Eat command buttons
            if (interaction.isButton() && interaction.customId.startsWith('eat_')) {
                // handled by collector inside the eat command
                return;
            }
            // Work command buttons
            if (interaction.isButton() && interaction.customId === 'work_again') {
                // handled by collector inside the work command
                return;
            }
            // Gacha spin dropdown
            if (interaction.isStringSelectMenu() && interaction.customId === 'spin_select') {
                const spinCommand = client.commands.get('spin');
                if (spinCommand) await spinCommand.handleSelect(interaction);
            }
        }
    } catch (err) {
        console.error('Interaction error:', err);
        const msg = { content: 'There was an error executing that command.', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(msg).catch(() => {});
        } else {
            await interaction.reply(msg).catch(() => {});
        }
    }
});

client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    // Energy regen every 60s
    setInterval(() => addEnergy(5), 60 * 1000);
});

client.login(process.env.BOT_TOKEN);
