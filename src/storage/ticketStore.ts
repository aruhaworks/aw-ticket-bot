import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { TicketRecord } from '../types.js';

interface Database {
    tickets: TicketRecord[];
}

const databasePath = path.resolve('data/tickets.json');

async function readDatabase(): Promise<Database> {
    try {
        return JSON.parse(await fs.readFile(databasePath, 'utf8')) as Database;
    } catch {
        return { tickets: [] };
    }
}

async function writeDatabase(database: Database): Promise<void> {
    await fs.mkdir(path.dirname(databasePath), { recursive: true });
    await fs.writeFile(databasePath, JSON.stringify(database, null, 2), 'utf8');
}

export async function createTicket(record: TicketRecord): Promise<void> {
    const database = await readDatabase();
    database.tickets.push(record);
    await writeDatabase(database);
}

export async function getTicket(channelId: string): Promise<TicketRecord | undefined> {
    const database = await readDatabase();
    return database.tickets.find(ticket => ticket.channelId === channelId);
}

export async function getOpenTicketsForUser(guildId: string, userId: string): Promise<TicketRecord[]> {
    const database = await readDatabase();
    return database.tickets.filter(ticket =>
        ticket.guildId === guildId &&
        ticket.userId === userId &&
        ticket.status === 'open'
    );
}

export async function closeTicket(channelId: string): Promise<void> {
    const database = await readDatabase();
    const ticket = database.tickets.find(item => item.channelId === channelId);
    if (!ticket) return;
    ticket.status = 'closed';
    ticket.closedAt = new Date().toISOString();
    await writeDatabase(database);
}

export async function removeTicket(channelId: string): Promise<void> {
    const database = await readDatabase();
    database.tickets = database.tickets.filter(ticket => ticket.channelId !== channelId);
    await writeDatabase(database);
}
