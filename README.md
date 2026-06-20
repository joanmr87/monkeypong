# Monkey Pong

Ranking ATP para la mesa de ping pong de Bar Monkey.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Postgres en produccion via `DATABASE_URL` o `POSTGRES_URL`
- JSON local en `.data/monkeypong.json` para desarrollo sin configurar base

## Local

```bash
npm install
npm run dev
```

La app corre en `http://localhost:3000`.

## Deploy en Vercel

El proyecto esta listo para importarse desde GitHub en Vercel.

Build command:

```bash
npm run build
```

Output: el default de Next.js.

Para que los jugadores y partidos persistan en produccion, configura una base
Postgres y agrega una de estas variables en Vercel:

```bash
DATABASE_URL=postgres://...
```

o:

```bash
POSTGRES_URL=postgres://...
```

Puede ser Vercel Postgres, Neon, Supabase o cualquier Postgres compatible. La
app crea las tablas automaticamente en el primer uso y carga estos jugadores
iniciales si la tabla esta vacia:

- Joan
- Franco
- Eric
- Choco
- Lautaro

Si no configuras Postgres en Vercel, la app puede renderizar, pero los datos no
van a persistir de forma confiable entre ejecuciones serverless.

## Rutas

- `/`: dashboard
- `/ranking`: tabla completa del ranking
- `/matches/new`: registrar partido
- `/matches`: historial de partidos
- `/players`: jugadores y estadisticas
- `/players/new`: crear jugador
- `/tv`: vista oscura para pantalla horizontal del bar

## API

- `GET /api/players`
- `POST /api/players`
- `GET /api/matches`
- `POST /api/matches`
- `GET /api/ranking`

## Reglas de Ranking

```text
points = matchesWon * 3 + matchesLost * 1
```

Orden:

1. Mas puntos
2. Mayor win rate
3. Mas ganados
4. Menos perdidos
5. Nombre alfabetico

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run start
```
