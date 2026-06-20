import { env } from "cloudflare:workers";

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

const initialPlayers = ["Joan", "Franco", "Eric", "Choco", "Lautaro"];

function getD1() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  return env.DB;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function mapPlayer(row: Record<string, unknown>): Player {
  return {
    id: String(row.id),
    name: String(row.name),
    nickname: row.nickname ? String(row.nickname) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMatch(row: Record<string, unknown>): Match {
  return {
    id: String(row.id),
    playerAId: String(row.player_a_id),
    playerBId: String(row.player_b_id),
    winnerId: String(row.winner_id),
    loserId: String(row.loser_id),
    playerAScore:
      row.player_a_score === null || row.player_a_score === undefined
        ? null
        : Number(row.player_a_score),
    playerBScore:
      row.player_b_score === null || row.player_b_score === undefined
        ? null
        : Number(row.player_b_score),
    playedAt: String(row.played_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    playerAName: String(row.player_a_name),
    playerBName: String(row.player_b_name),
    winnerName: String(row.winner_name),
    loserName: String(row.loser_name),
  };
}

export async function initializeMonkeyDb() {
  const db = getD1();
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nickname TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    ),
    db.prepare(
      `CREATE UNIQUE INDEX IF NOT EXISTS players_name_unique
        ON players (LOWER(name))`
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        player_a_id TEXT NOT NULL,
        player_b_id TEXT NOT NULL,
        winner_id TEXT NOT NULL,
        loser_id TEXT NOT NULL,
        player_a_score INTEGER,
        player_b_score INTEGER,
        played_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (player_a_id) REFERENCES players(id),
        FOREIGN KEY (player_b_id) REFERENCES players(id),
        FOREIGN KEY (winner_id) REFERENCES players(id),
        FOREIGN KEY (loser_id) REFERENCES players(id)
      )`
    ),
    db.prepare(
      `CREATE INDEX IF NOT EXISTS matches_played_at_idx
        ON matches (played_at DESC)`
    ),
  ]);

  const existing = await db
    .prepare("SELECT COUNT(*) as count FROM players")
    .first<{ count: number }>();

  if (!existing?.count) {
    const timestamp = nowIso();
    await db.batch(
      initialPlayers.map((name) =>
        db
          .prepare(
            `INSERT INTO players (id, name, nickname, created_at, updated_at)
              VALUES (?, ?, NULL, ?, ?)`
          )
          .bind(crypto.randomUUID(), name, timestamp, timestamp)
      )
    );
  }
}

export async function listPlayers() {
  await initializeMonkeyDb();
  const db = getD1();
  const { results } = await db
    .prepare("SELECT * FROM players ORDER BY name COLLATE NOCASE ASC")
    .all<Record<string, unknown>>();

  return results.map(mapPlayer);
}

export async function createPlayer(input: { name: string; nickname?: string }) {
  await initializeMonkeyDb();
  const db = getD1();
  const name = normalizeName(input.name);
  const nickname = normalizeName(input.nickname ?? "");

  if (!name) {
    throw new Error("El nombre es obligatorio.");
  }

  const duplicate = await db
    .prepare("SELECT id FROM players WHERE LOWER(name) = LOWER(?)")
    .bind(name)
    .first<{ id: string }>();

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

  await db
    .prepare(
      `INSERT INTO players (id, name, nickname, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)`
    )
    .bind(player.id, player.name, player.nickname, timestamp, timestamp)
    .run();

  return player;
}

export async function listMatches(limit = 100) {
  await initializeMonkeyDb();
  const db = getD1();
  const { results } = await db
    .prepare(
      `SELECT
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
      LIMIT ?`
    )
    .bind(limit)
    .all<Record<string, unknown>>();

  return results.map(mapMatch);
}

export async function createMatch(input: {
  playerAId: string;
  playerBId: string;
  winnerId: string;
  playerAScore?: number | null;
  playerBScore?: number | null;
  playedAt?: string | null;
}) {
  await initializeMonkeyDb();
  const db = getD1();

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
    if (score !== null && score !== undefined && (!Number.isInteger(score) || score < 0)) {
      throw new Error("Los scores deben ser enteros positivos.");
    }
  }

  const ids = await db
    .prepare(`SELECT id FROM players WHERE id IN (?, ?)`)
    .bind(input.playerAId, input.playerBId)
    .all<{ id: string }>();

  if (ids.results.length !== 2) {
    throw new Error("Alguno de los jugadores no existe.");
  }

  const loserId =
    input.winnerId === input.playerAId ? input.playerBId : input.playerAId;
  const timestamp = nowIso();
  const playedAt = input.playedAt
    ? new Date(input.playedAt).toISOString()
    : timestamp;

  await db
    .prepare(
      `INSERT INTO matches (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      crypto.randomUUID(),
      input.playerAId,
      input.playerBId,
      input.winnerId,
      loserId,
      input.playerAScore ?? null,
      input.playerBScore ?? null,
      playedAt,
      timestamp,
      timestamp
    )
    .run();
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
