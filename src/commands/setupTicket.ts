import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
    .setName('setup-ticket')
    .setDescription('Create the ARUHAWORKS ticket panel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor(config.branding.color)
        .setTitle('ARUHAWORKS • Support')
        .setDescription(
            '**Need assistance?**\n\n' +
            'Open a private support ticket using the button below.\n\n' +
            'A ticket creates a private channel visible to you and the support team.\n\n' +
            'Please provide enough information for the team to understand your request.'
        )
        .setFooter({ text: config.branding.footer })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_create')
            .setLabel('Create Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
}
