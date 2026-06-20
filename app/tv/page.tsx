import { MatchList } from "../components";
import { getDashboardStats } from "@/db/monkey";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function TvPage() {
  const stats = await getDashboardStats();
  const leader = stats.topPlayer;

  return (
    <main className="min-h-screen bg-neutral-950 px-8 py-6 text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-end justify-between gap-8 border-b border-white/20 pb-5">
          <div>
            <p className="text-sm font-black uppercase text-emerald-300">
              Bar Monkey
            </p>
            <h1 className="mt-1 text-6xl font-black leading-none tracking-normal">
              Monkey Ping Pong Ranking
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold uppercase text-white/60">
              Rey actual
            </p>
            <p className="text-5xl font-black text-emerald-300">
              {leader ? leader.name : "-"}
            </p>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-md border border-white/15 bg-white/5 p-5">
            <h2 className="mb-4 text-3xl font-black">Top 5</h2>
            <div className="grid gap-3">
              {stats.ranking.slice(0, 5).map((row) => (
                <div
                  className="grid grid-cols-[80px_1fr_140px] items-center gap-4 rounded-md bg-white px-4 py-4 text-neutral-950"
                  key={row.id}
                >
                  <span className="text-4xl font-black">#{row.rankPosition}</span>
                  <span className="text-4xl font-black">{row.name}</span>
                  <span className="text-right text-4xl font-black">
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-emerald-500 p-5 text-neutral-950">
                <p className="text-sm font-black uppercase">Partidos</p>
                <p className="mt-2 text-6xl font-black">{stats.totalMatches}</p>
              </div>
              <div className="rounded-md bg-white p-5 text-neutral-950">
                <p className="text-sm font-black uppercase">Ultimo ganador</p>
                <p className="mt-2 text-4xl font-black">
                  {stats.lastMatch ? stats.lastMatch.winnerName : "-"}
                </p>
              </div>
            </div>
            <div className="tv-matches">
              <h2 className="mb-3 text-3xl font-black">Ultimos 5 partidos</h2>
              <MatchList matches={stats.matches.slice(0, 5)} />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
