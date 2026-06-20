import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nickname: text("nickname"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  playerAId: text("player_a_id")
    .notNull()
    .references(() => players.id),
  playerBId: text("player_b_id")
    .notNull()
    .references(() => players.id),
  winnerId: text("winner_id")
    .notNull()
    .references(() => players.id),
  loserId: text("loser_id")
    .notNull()
    .references(() => players.id),
  playerAScore: integer("player_a_score"),
  playerBScore: integer("player_b_score"),
  playedAt: text("played_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
