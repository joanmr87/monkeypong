import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Sql } from "postgres";

export type Player = {
  id: string;
  name: string;
  nickname: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Match = {
  id: string;
  playerAId: string;
  playerBId: string;
  winnerId: string;
  loserId: string;
  playerAScore: number | null;
  playerBScore: number | null;
  playedAt: string;
  createdAt: string;
  updatedAt: string;
  playerAName: string;
  playerBName: string;
  winnerName: string;
  loserName: string;
};

export type RankingRow = Player & {
  rankPosition: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  points: number;
};

type LocalStore = {
  players: Player[];
  matches: Array<Omit<Match, "playerAName" | "playerBName" | "winnerName" | "loserName">>;
};

type SqlClient = Sql<Record<string, unknown>>;

const databaseUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
const initialPlayers = ["Joan", "Franco", "Eric", "Choco", "Lautaro"];

declare global {
  var monkeySql: SqlClient | undefined;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function toNullableScore(value: unknown) {
  return value === null || value === undefined ? null : Number(value);
}

function localStorePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "monkeypong.json");
  }

  return path.join(process.cwd(), ".data", "monkeypong.json");
}

async function getSql() {
  if (!databaseUrl) {
    return null;
  }

  if (!globalThis.monkeySql) {
    const postgres = (await import("postgres")).default;
    globalThis.monkeySql = postgres(databaseUrl, {
      max: 1,
      prepare: false,
    });
  }

  return globalThis.monkeySql;
}

function seedStore(): LocalStore {
  const timestamp = nowIso();

  return {
    players: initialPlayers.map((name) => ({
      id: crypto.randomUUID(),
      name,
      nickname: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
    matches: [],
  };
}

async function readLocalStore(): Promise<LocalStore> {
  const filePath = localStorePath();

  try {
    const contents = await readFile(filePath, "utf8");
    return JSON.parse(contents) as LocalStore;
  } catch {
    const seeded = seedStore();
    await writeLocalStore(seeded);
    return seeded;
  }
}

async function writeLocalStore(store: LocalStore) {
  const filePath = localStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function initializePostgres() {
  const sql = await getSql();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nickname TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS players_name_unique
      ON players (LOWER(name))
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      player_a_id TEXT NOT NULL REFERENCES players(id),
      player_b_id TEXT NOT NULL REFERENCES players(id),
      winner_id TEXT NOT NULL REFERENCES players(id),
      loser_id TEXT NOT NULL REFERENCES players(id),
      player_a_score INTEGER,
      player_b_score INTEGER,
      played_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS matches_played_at_idx
      ON matches (played_at DESC)
  `;

  const [existing] = await sql<{ count: string }[]>`
    SELECT COUNT(*) AS count FROM players
  `;

  if (Number(existing?.count ?? 0) === 0) {
    const timestamp = nowIso();
    for (const name of initialPlayers) {
      await sql`
        INSERT INTO players (id, name, nickname, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${name}, NULL, ${timestamp}, ${timestamp})
      `;
    }
  }
}

function mapDbPlayer(row: Record<string, unknown>): Player {
  return {
    id: String(row.id),
    name: String(row.name),
    nickname: row.nickname ? String(row.nickname) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapDbMatch(row: Record<string, unknown>): Match {
  return {
    id: String(row.id),
    playerAId: String(row.player_a_id),
    playerBId: String(row.player_b_id),
    winnerId: String(row.winner_id),
    loserId: String(row.loser_id),
    playerAScore: toNullableScore(row.player_a_score),
    playerBScore: toNullableScore(row.player_b_score),
    playedAt: String(row.played_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    playerAName: String(row.player_a_name),
    playerBName: String(row.player_b_name),
    winnerName: String(row.winner_name),
    loserName: String(row.loser_name),
  };
}

function hydrateLocalMatch(store: LocalStore, match: LocalStore["matches"][number]): Match {
  const playerName = (id: string) =>
    store.players.find((player) => player.id === id)?.name ?? "Jugador eliminado";

  return {
    ...match,
    playerAName: playerName(match.playerAId),
    playerBName: playerName(match.playerBId),
    winnerName: playerName(match.winnerId),
    loserName: playerName(match.loserId),
  };
}

export async function listPlayers() {
  const sql = await getSql();

  if (sql) {
    await initializePostgres();
    const rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM players ORDER BY LOWER(name) ASC
    `;
    return rows.map(mapDbPlayer);
  }

  const store = await readLocalStore();
  return [...store.players].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function createPlayer(input: { name: string; nickname?: string }) {
  const name = normalizeName(input.name);
  const nickname = normalizeName(input.nickname ?? "");

  if (!name) {
    throw new Error("El nombre es obligatorio.");
  }

  const sql = await getSql();

  if (sql) {
    await initializePostgres();
    const [duplicate] = await sql<{ id: string }[]>`
      SELECT id FROM players WHERE LOWER(name) = LOWER(${name})
    `;

    if (duplicate) {
      throw new Error("Ya existe un jugador con ese nombre.");
    }

    const timestamp = nowIso();
    const player: Player = {
      id: crypto.randomUUID(),
      name,
      nickname: nickname || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await sql`
      INSERT INTO players (id, name, nickname, created_at, updated_at)
      VALUES (${player.id}, ${player.name}, ${player.nickname}, ${timestamp}, ${timestamp})
    `;

    return player;
  }

  const store = await readLocalStore();
  const duplicate = store.players.some(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    throw new Error("Ya existe un jugador con ese nombre.");
  }

  const timestamp = nowIso();
  const player: Player = {
    id: crypto.randomUUID(),
    name,
    nickname: nickname || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  store.players.push(player);
  await writeLocalStore(store);
  return player;
}

export async function listMatches(limit = 100) {
  const sql = await getSql();

  if (sql) {
    await initializePostgres();
    const rows = await sql<Record<string, unknown>[]>`
      SELECT
        m.*,
        pa.name AS player_a_name,
        pb.name AS player_b_name,
        w.name AS winner_name,
        l.name AS loser_name
      FROM matches m
      JOIN players pa ON pa.id = m.player_a_id
      JOIN players pb ON pb.id = m.player_b_id
      JOIN players w ON w.id = m.winner_id
      JOIN players l ON l.id = m.loser_id
      ORDER BY m.played_at DESC
      LIMIT ${limit}
    `;

    return rows.map(mapDbMatch);
  }

  const store = await readLocalStore();
  return store.matches
    .map((match) => hydrateLocalMatch(store, match))
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .slice(0, limit);
}

export async function createMatch(input: {
  playerAId: string;
  playerBId: string;
  winnerId: string;
  playerAScore?: number | null;
  playerBScore?: number | null;
  playedAt?: string | null;
}) {
  if (!input.playerAId || !input.playerBId) {
    throw new Error("Selecciona dos jugadores.");
  }

  if (input.playerAId === input.playerBId) {
    throw new Error("Un jugador no puede jugar contra si mismo.");
  }

  if (![input.playerAId, input.playerBId].includes(input.winnerId)) {
    throw new Error("El ganador debe ser uno de los dos jugadores.");
  }

  for (const score of [input.playerAScore, input.playerBScore]) {
    if (
      score !== null &&
      score !== undefined &&
      (!Number.isInteger(score) || score < 0)
    ) {
      throw new Error("Los scores deben ser enteros positivos.");
    }
  }

  const loserId =
    input.winnerId === input.playerAId ? input.playerBId : input.playerAId;
  const timestamp = nowIso();
  const playedAt = input.playedAt
    ? new Date(input.playedAt).toISOString()
    : timestamp;

  const sql = await getSql();

  if (sql) {
    await initializePostgres();
    const players = await sql<{ id: string }[]>`
      SELECT id FROM players WHERE id IN (${input.playerAId}, ${input.playerBId})
    `;

    if (players.length !== 2) {
      throw new Error("Alguno de los jugadores no existe.");
    }

    await sql`
      INSERT INTO matches (
        id,
        player_a_id,
        player_b_id,
        winner_id,
        loser_id,
        player_a_score,
        player_b_score,
        played_at,
        created_at,
        updated_at
      ) VALUES (
        ${crypto.randomUUID()},
        ${input.playerAId},
        ${input.playerBId},
        ${input.winnerId},
        ${loserId},
        ${input.playerAScore ?? null},
        ${input.playerBScore ?? null},
        ${playedAt},
        ${timestamp},
        ${timestamp}
      )
    `;
    return;
  }

  const store = await readLocalStore();
  const selectedPlayers = store.players.filter((player) =>
    [input.playerAId, input.playerBId].includes(player.id)
  );

  if (selectedPlayers.length !== 2) {
    throw new Error("Alguno de los jugadores no existe.");
  }

  store.matches.push({
    id: crypto.randomUUID(),
    playerAId: input.playerAId,
    playerBId: input.playerBId,
    winnerId: input.winnerId,
    loserId,
    playerAScore: input.playerAScore ?? null,
    playerBScore: input.playerBScore ?? null,
    playedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  await writeLocalStore(store);
}

export async function getRanking() {
  const [players, matches] = await Promise.all([listPlayers(), listMatches()]);
  const rows = players.map<RankingRow>((player) => {
    const played = matches.filter(
      (match) =>
        match.playerAId === player.id || match.playerBId === player.id
    );
    const won = matches.filter((match) => match.winnerId === player.id);
    const lost = matches.filter((match) => match.loserId === player.id);
    const matchesPlayed = played.length;
    const matchesWon = won.length;
    const matchesLost = lost.length;
    const winRate =
      matchesPlayed === 0 ? 0 : Math.round((matchesWon / matchesPlayed) * 100);
    const points = matchesWon * 3 + matchesLost;

    return {
      ...player,
      rankPosition: 0,
      matchesPlayed,
      matchesWon,
      matchesLost,
      winRate,
      points,
    };
  });

  return rows
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
      if (a.matchesLost !== b.matchesLost) return a.matchesLost - b.matchesLost;
      return a.name.localeCompare(b.name, "es");
    })
    .map((row, index) => ({ ...row, rankPosition: index + 1 }));
}

export async function getDashboardStats() {
  const [ranking, matches] = await Promise.all([getRanking(), listMatches(6)]);

  return {
    ranking,
    matches,
    totalPlayers: ranking.length,
    totalMatches: matches.length,
    topPlayer: ranking[0] ?? null,
    lastMatch: matches[0] ?? null,
  };
}
