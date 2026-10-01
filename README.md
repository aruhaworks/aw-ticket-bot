# AW Ticket Bot

Professional Discord ticket infrastructure by ARUHAWORKS.

## Features
- Button-based ticket creation
- Modal for subject and issue details
- Private ticket channels
- Staff role permissions
- Close and delete workflow
- JSON ticket persistence
- Input normalization
- Permission validation
- TypeScript + discord.js v14
- ARUHAWORKS branding

## Setup

Requirements: Node.js 20+ and a Discord bot application.

```bash
npm install
copy .env.example .env
npm run deploy
npm run build
npm start
```

Linux/macOS:
```bash
cp .env.example .env
```

Configure `.env`:

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
STAFF_ROLE_ID=
TICKET_CATEGORY_ID=
PANEL_CHANNEL_ID=
```

Then use:

```text
/setup-ticket
```

## Architecture

```text
Discord Interaction
       |
       v
Interaction Handler
       |
  +----+----+
  |         |
Modal     Buttons
  |         |
  v         v
Ticket Service
       |
       v
Ticket Store
       |
       v
data/tickets.json
```

## Security

The bot validates registered tickets, staff permissions and ticket state.
User-provided channel names are normalized before use.

## License

MIT — Copyright (c) 2026 ARUHAWORKS
