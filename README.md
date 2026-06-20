# Monkey Ping Pong Ranking

Ranking ATP para la mesa de ping pong de Bar Monkey.

## Stack

- vinext / Next.js
- React
- TypeScript
- Tailwind CSS
- Cloudflare D1
- Drizzle schema and migrations

## Quick Start

```bash
npm install
npm run dev
npm run build
```

Local development runs at `http://localhost:3000`.

## Routes

- `/`: dashboard with totals, current number one, latest match, ranking preview,
  and recent matches
- `/ranking`: full ranking table
- `/matches/new`: match registration form
- `/matches`: match history
- `/players`: player list with stats
- `/players/new`: player creation form
- `/tv`: dark TV scoreboard view for a horizontal bar screen

## API

- `GET /api/players`
- `POST /api/players`
- `GET /api/matches`
- `POST /api/matches`
- `GET /api/ranking`

## Ranking Rules

Points are calculated dynamically from saved matches:

```text
points = matchesWon * 3 + matchesLost * 1
```

Sorting:

1. More points
2. Higher win rate
3. More wins
4. Fewer losses
5. Alphabetical name

## Seed Data

On first database use, the app creates the schema and seeds:

- Joan
- Franco
- Eric
- Choco
- Lautaro

## Persistence

The site declares a D1 binding in `.openai/hosting.json`:

```json
{
  "d1": "DB",
  "r2": null
}
```

The runtime initializes the local D1 tables when the app first reads or writes
players and matches. Drizzle schema definitions live in `db/schema.ts`, and the
generated migration lives under `drizzle/`.

## Useful Commands

- `npm run dev`: start local development
- `npm run lint`: run ESLint
- `npm run build`: verify Sites-compatible production output
- `npm run db:generate`: generate Drizzle migrations after schema changes
