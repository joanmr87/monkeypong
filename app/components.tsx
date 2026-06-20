import Link from "next/link";
import Image from "next/image";
import type { Match, RankingRow } from "@/db/monkey";

export const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/ranking", label: "Ranking" },
  { href: "/matches/new", label: "Cargar partido" },
  { href: "/matches", label: "Historial" },
  { href: "/players", label: "Jugadores" },
  { href: "/tv", label: "TV" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f3e8] text-black">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b-4 border-black pb-4 lg:flex-row lg:items-end lg:justify-between">
          <Link href="/" className="group flex items-end gap-3">
            <span className="grid size-14 place-items-center overflow-hidden rounded-sm bg-black p-2 shadow-[4px_4px_0_#e11d2e]">
              <Image
                alt=""
                className="h-full w-full object-contain invert"
                height={1000}
                priority
                src="/brand/monkey-mark.png"
                width={978}
              />
            </span>
            <span className="grid gap-1">
              <Image
                alt="Monkey"
                className="h-12 w-auto max-w-[210px] object-contain object-left"
                height={741}
                priority
                src="/brand/monkey-wordmark.png"
                width={1200}
              />
              <span className="block text-xs font-black uppercase text-black">
                Ping Pong Ranking
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                className="rounded-sm border-2 border-black bg-white px-3 py-2 text-sm font-black uppercase text-black shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:bg-[#e11d2e] hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

export function StatBlock({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "green" | "ink";
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#e11d2e] text-white"
      : tone === "ink"
        ? "bg-black text-white"
        : "bg-white text-black";

  return (
    <div className={`rounded-sm border-2 border-black p-4 shadow-[4px_4px_0_#000] ${toneClass}`}>
      <p className="text-xs font-bold uppercase text-current opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black leading-none">{value}</p>
    </div>
  );
}

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  return (
    <div className="max-w-full overflow-hidden rounded-sm border-2 border-black bg-white shadow-[5px_5px_0_#000]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black text-white">
            <tr>
              {["#", "Jugador", "PJ", "PG", "PP", "Win Rate", "Puntos"].map(
                (heading) => (
                  <th className="whitespace-nowrap px-4 py-3 font-bold" key={heading}>
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rows.map((row) => (
              <tr
                className={
                  row.rankPosition === 1 ? "bg-[#ffe9ec]" : "bg-white"
                }
                key={row.id}
              >
                <td className="px-4 py-4 text-lg font-black">
                  {row.rankPosition}
                </td>
                <td className="px-4 py-4">
                  <div className="font-black">{row.name}</div>
                  {row.nickname ? (
                    <div className="text-xs font-semibold text-neutral-500">
                      {row.nickname}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-4 font-semibold">{row.matchesPlayed}</td>
                <td className="px-4 py-4 font-semibold">{row.matchesWon}</td>
                <td className="px-4 py-4 font-semibold">{row.matchesLost}</td>
                <td className="px-4 py-4 font-semibold">{row.winRate}%</td>
                <td className="px-4 py-4 text-lg font-black">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MatchList({ matches }: { matches: Match[] }) {
  if (!matches.length) {
    return (
      <div className="rounded-sm border-2 border-dashed border-black bg-white p-6 text-sm font-black uppercase text-neutral-600">
        Todavia no hay partidos cargados.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {matches.map((match) => (
        <article
          className="grid gap-3 rounded-sm border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] md:grid-cols-[1fr_auto]"
          key={match.id}
        >
          <div>
            <p className="text-xs font-bold uppercase text-neutral-500">
              {new Intl.DateTimeFormat("es-AR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(match.playedAt))}
            </p>
            <h3 className="mt-1 text-lg font-black">
              {match.playerAName} vs {match.playerBName}
            </h3>
            <p className="text-sm font-semibold text-neutral-600">
              Gano {match.winnerName}; perdio {match.loserName}
            </p>
          </div>
          <div className="flex items-center justify-start md:justify-end">
            {match.playerAScore !== null && match.playerBScore !== null ? (
              <span className="rounded-sm bg-black px-3 py-2 text-lg font-black text-white">
                {match.playerAScore} - {match.playerBScore}
              </span>
            ) : (
              <span className="rounded-sm bg-neutral-200 px-3 py-2 text-sm font-bold text-neutral-700">
                Sin score
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function PageHeading({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 py-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase text-[#e11d2e]">{kicker}</p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-normal sm:text-5xl">
          {title}
        </h1>
      </div>
      {action}
    </section>
  );
}
