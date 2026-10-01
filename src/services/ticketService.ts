import {
    ChannelType,
    PermissionFlagsBits,
    type Guild,
    type GuildMember,
    type TextChannel
} from 'discord.js';
import { config } from '../config.js';
import {
    createTicket,
    getOpenTicketsForUser,
    getTicket,
    closeTicket,
    removeTicket
} from '../storage/ticketStore.js';

function normalizeChannelPart(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 24) || 'support';
}

export async function createUserTicket(
    guild: Guild,
    member: GuildMember,
    subject: string,
    description: string
): Promise<TextChannel> {
    const existing = await getOpenTicketsForUser(guild.id, member.id);

    if (existing.length >= config.tickets.maxOpenPerUser) {
        throw new Error('You already have an open ticket.');
    }

    const channel = await guild.channels.create({
        name: `${config.tickets.channelPrefix}-${normalizeChannelPart(subject)}`,
        type: ChannelType.GuildText,
        parent: config.ticketCategoryId,
        topic: `ARUHAWORKS ticket • ${member.id}`,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: member.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles
                ]
            },
            {
                id: config.staffRoleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageMessages
                ]
            }
        ]
    });

    await createTicket({
        channelId: channel.id,
        guildId: guild.id,
        userId: member.id,
        subject,
        createdAt: new Date().toISOString(),
        status: 'open'
    });

    await channel.send({
        content: `<@${member.id}> <@&${config.staffRoleId}>`,
        embeds: [{
            title: 'ARUHAWORKS • Support Ticket',
            description:
                `Welcome <@${member.id}>. A member of the support team will be with you shortly.\n\n` +
                `**Subject**\n${subject}\n\n**Details**\n${description}`,
            color: config.branding.color,
            footer: { text: config.branding.footer },
            timestamp: new Date().toISOString()
        }],
        components: [{
            type: 1,
            components: [{
                type: 2,
                style: 4,
                custom_id: 'ticket_close',
                label: 'Close Ticket',
                emoji: { name: '🔒' }
            }]
        }]
    });

    return channel;
}

export async function closeUserTicket(channel: TextChannel): Promise<void> {
    const ticket = await getTicket(channel.id);
    if (!ticket) throw new Error('This channel is not a registered ticket.');

    await closeTicket(channel.id);

    await channel.permissionOverwrites.edit(ticket.userId, {
        ViewChannel: true,
        SendMessages: false,
        ReadMessageHistory: true
    });

    await channel.send({
        embeds: [{
            title: 'Ticket Closed',
            description: 'This ticket has been closed. Staff can delete it when the conversation is complete.',
            color: 0x2b2d31,
            footer: { text: config.branding.footer }
        }],
        components: [{
            type: 1,
            components: [{
                type: 2,
                style: 4,
                custom_id: 'ticket_delete',
                label: 'Delete Ticket',
                emoji: { name: '🗑️' }
            }]
        }]
    });
}

export async function deleteUserTicket(channel: TextChannel): Promise<void> {
    const ticket = await getTicket(channel.id);
    if (!ticket) throw new Error('This channel is not a registered ticket.');

    await removeTicket(channel.id);
    await channel.send({ content: '🗑️ Ticket will be deleted in 3 seconds.' });

    setTimeout(() => {
        void channel.delete('ARUHAWORKS ticket deleted');
    }, config.tickets.deleteDelayMs);
}
