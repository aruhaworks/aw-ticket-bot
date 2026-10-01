export interface TicketRecord {
    channelId: string;
    guildId: string;
    userId: string;
    subject: string;
    createdAt: string;
    closedAt?: string;
    status: 'open' | 'closed';
}
