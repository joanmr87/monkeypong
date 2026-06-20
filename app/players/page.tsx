import Link from "next/link";
import { AppShell, PageHeading } from "../components";
import { getRanking } from "@/db/monkey";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const rows = await getRanking();

  return (
    <AppShell>
      <PageHeading
        kicker="Jugadores"
        title="Plantel del bar"
        action={
          <Link className="btn-primary" href="/players/new">
            Crear jugador
          </Link>
        }
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((player) => (
          <article
            className="rounded-md border border-stone-300 bg-white p-4 shadow-sm"
            key={player.id}
          >
            <p className="text-xs font-black uppercase text-emerald-800">
              Ranking #{player.rankPosition}
            </p>
            <h2 className="mt-1 text-2xl font-black">{player.name}</h2>
            {player.nickname ? (
              <p className="text-sm font-semibold text-stone-500">
                {player.nickname}
              </p>
            ) : null}
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div className="metric">
                <dt>PJ</dt>
                <dd>{player.matchesPlayed}</dd>
              </div>
              <div className="metric">
                <dt>PG</dt>
                <dd>{player.matchesWon}</dd>
              </div>
              <div className="metric">
                <dt>PP</dt>
                <dd>{player.matchesLost}</dd>
              </div>
              <div className="metric">
                <dt>PTS</dt>
                <dd>{player.points}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
