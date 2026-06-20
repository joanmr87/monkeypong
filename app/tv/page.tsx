import Image from "next/image";
import { MatchList } from "../components";
import { getDashboardStats } from "@/db/monkey";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function TvPage() {
  const stats = await getDashboardStats();
  const leader = stats.topPlayer;

  return (
    <main className="min-h-screen bg-black px-8 py-6 text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-end justify-between gap-8 border-b-4 border-white pb-5">
          <div className="flex items-end gap-6">
            <Image
              alt=""
              className="h-28 w-28 object-contain invert"
              height={1000}
              priority
              src="/brand/monkey-mark.png"
              width={978}
            />
            <div>
              <Image
                alt="Monkey"
                className="h-28 w-auto max-w-[460px] object-contain object-left invert"
                height={741}
                priority
                src="/brand/monkey-wordmark.png"
                width={1200}
              />
              <p className="text-2xl font-black uppercase text-[#00d26a]">
                Ping Pong Ranking
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold uppercase text-white/60">
              Rey actual
            </p>
            <p className="text-5xl font-black uppercase text-[#00d26a]">
              {leader ? leader.name : "-"}
            </p>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm border-4 border-white bg-white p-5 text-black">
            <h2 className="mb-4 text-3xl font-black uppercase">Top 5</h2>
            <div className="grid gap-3">
              {stats.ranking.slice(0, 5).map((row) => (
                <div
                  className="grid grid-cols-[80px_1fr_140px] items-center gap-4 rounded-sm border-4 border-black bg-[#f7f3e8] px-4 py-4 text-black"
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
              <div className="rounded-sm border-4 border-white bg-[#00d26a] p-5 text-black">
                <p className="text-sm font-black uppercase">Partidos</p>
                <p className="mt-2 text-6xl font-black">{stats.totalMatches}</p>
              </div>
              <div className="rounded-sm border-4 border-white bg-white p-5 text-black">
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
