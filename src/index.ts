import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { registerInteractionHandler } from './events/interactionCreate.js';

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', readyClient => {
    console.log(`[${config.branding.name}] Online as ${readyClient.user.tag}`);
    console.log(`[${config.branding.name}] Ticket infrastructure ready.`);
});

registerInteractionHandler(client);

client.login(config.token);
