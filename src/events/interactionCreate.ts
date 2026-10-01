import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type Client
} from 'discord.js';
import { config } from '../config.js';
import {
    createUserTicket,
    closeUserTicket,
    deleteUserTicket
} from '../services/ticketService.js';

export function registerInteractionHandler(client: Client): void {
    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (interaction.isChatInputCommand()) {
                if (interaction.commandName === 'setup-ticket') {
                    const command = await import('../commands/setupTicket.js');
                    await command.execute(interaction);
                }
                return;
            }

            if (interaction.isButton() && interaction.customId === 'ticket_create') {
                const modal = new ModalBuilder()
                    .setCustomId('ticket_modal')
                    .setTitle('ARUHAWORKS Support');

                const subject = new TextInputBuilder()
                    .setCustomId('ticket_subject')
                    .setLabel('What do you need help with?')
                    .setPlaceholder('e.g. FiveM resource issue')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(80)
                    .setRequired(true);

                const description = new TextInputBuilder()
                    .setCustomId('ticket_description')
                    .setLabel('Describe the issue')
                    .setPlaceholder('Give the support team enough information...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(1500)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(subject),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(description)
                );

                await interaction.showModal(modal);
                return;
            }

            if (interaction.isButton() &&
                (interaction.customId === 'ticket_close' || interaction.customId === 'ticket_delete')) {

                if (!interaction.memberPermissions?.has('ManageChannels')) {
                    await interaction.reply({
                        content: '❌ Only staff members can manage tickets.',
                        ephemeral: true
                    });
                    return;
                }

                if (!interaction.channel?.isTextBased()) return;

                await interaction.deferReply({ ephemeral: true });

                if (interaction.customId === 'ticket_close') {
                    await closeUserTicket(interaction.channel as any);
                    await interaction.editReply('🔒 Ticket closed.');
                } else {
                    await deleteUserTicket(interaction.channel as any);
                    await interaction.editReply('🗑️ Deleting ticket...');
                }

                return;
            }

            if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {
                if (!interaction.guild || !interaction.member) {
                    await interaction.reply({
                        content: '❌ This can only be used inside a server.',
                        ephemeral: true
                    });
                    return;
                }

                const subject = interaction.fields.getTextInputValue('ticket_subject');
                const description = interaction.fields.getTextInputValue('ticket_description');

                await interaction.deferReply({ ephemeral: true });

                const channel = await createUserTicket(
                    interaction.guild,
                    interaction.member as any,
                    subject,
                    description
                );

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.branding.color)
                            .setTitle('Ticket Created')
                            .setDescription(`Your private ticket has been created: ${channel}`)
                            .setFooter({ text: config.branding.footer })
                    ]
                });
            }
        } catch (error) {
            console.error('[ARUHAWORKS] Interaction error:', error);

            const message = error instanceof Error
                ? error.message
                : 'An unexpected error occurred.';

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    content: `❌ ${message}`,
                    ephemeral: true
                }).catch(() => undefined);
            } else {
                await interaction.reply({
                    content: `❌ ${message}`,
                    ephemeral: true
                }).catch(() => undefined);
            }
        }
    });
}
