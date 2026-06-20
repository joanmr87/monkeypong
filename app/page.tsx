import Link from "next/link";
import { AppShell, MatchList, PageHeading, RankingTable, StatBlock } from "./components";
import { StorageBanner } from "./storage-banner";
import { getDashboardStats, getStorageWarning } from "@/db/monkey";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await getDashboardStats();
  const leader = stats.topPlayer;

  return (
    <AppShell>
      <StorageBanner message={getStorageWarning()} />
      <PageHeading
        kicker="Bar Monkey"
        title="Ranking ATP de la mesa"
        action={
          <Link className="btn-primary" href="/matches/new">
            Cargar partido
          </Link>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-64 overflow-hidden rounded-md border border-stone-300 bg-stone-900 shadow-sm">
          <div
            aria-label="Mesa de ping pong en un bar con paletas y pelota"
            className="h-full w-full bg-cover bg-center"
            role="img"
            style={{ backgroundImage: "url('/ping-pong-bar.png')" }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/90 to-transparent p-5 text-white">
            <p className="text-sm font-black uppercase text-emerald-300">
              Mesa activa
            </p>
            <p className="mt-1 text-3xl font-black">
              {leader ? `${leader.name} defiende el #1` : "Ranking inicial"}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <StatBlock label="Jugadores" value={stats.totalPlayers} />
          <StatBlock label="Partidos" value={stats.totalMatches} />
          <StatBlock
            label="Numero 1"
            tone="green"
            value={leader ? leader.name : "-"}
          />
          <StatBlock
            label="Ultimo ganador"
            tone="ink"
            value={stats.lastMatch ? stats.lastMatch.winnerName : "-"}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Ranking actual</h2>
            <Link className="link-action" href="/ranking">
              Ver completo
            </Link>
          </div>
          <RankingTable rows={stats.ranking.slice(0, 5)} />
        </div>
        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Ultimos partidos</h2>
            <Link className="link-action" href="/matches">
              Historial
            </Link>
          </div>
          <MatchList matches={stats.matches.slice(0, 4)} />
        </div>
      </section>
    </AppShell>
  );
}
