import 'dotenv/config';

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
}

export const config = {
    token: required('DISCORD_TOKEN'),
    clientId: required('CLIENT_ID'),
    guildId: required('GUILD_ID'),
    staffRoleId: required('STAFF_ROLE_ID'),
    ticketCategoryId: required('TICKET_CATEGORY_ID'),
    panelChannelId: required('PANEL_CHANNEL_ID'),
    branding: {
        name: 'ARUHAWORKS',
        color: 0x111111,
        footer: 'ARUHAWORKS • Support Infrastructure'
    },
    tickets: {
        maxOpenPerUser: 1,
        channelPrefix: 'ticket',
        deleteDelayMs: 3000
    }
} as const;
