import Link from "next/link";
import Image from "next/image";
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
        <div className="relative min-h-72 overflow-hidden rounded-sm border-2 border-black bg-black shadow-[6px_6px_0_#000]">
          <div
            aria-label="Mesa de ping pong en un bar con paletas y pelota"
            className="absolute inset-0 h-full w-full bg-cover bg-center opacity-65 grayscale"
            role="img"
            style={{ backgroundImage: "url('/ping-pong-bar.png')" }}
          />
          <Image
            alt=""
            className="absolute right-4 top-4 h-24 w-24 object-contain opacity-90 invert"
            height={1000}
            src="/brand/monkey-mark.png"
            width={978}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-5 text-white">
            <p className="text-sm font-black uppercase text-[#e11d2e]">
              Mesa activa
            </p>
            <p className="mt-1 text-4xl font-black uppercase">
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
