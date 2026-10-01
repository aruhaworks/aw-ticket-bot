import { REST, Routes } from 'discord.js';
import { config } from './config.js';

const commands = [{
    name: 'setup-ticket',
    description: 'Create the ARUHAWORKS ticket panel.'
}];

const rest = new REST({ version: '10' }).setToken(config.token);

await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
);

console.log('[ARUHAWORKS] Slash commands deployed.');
