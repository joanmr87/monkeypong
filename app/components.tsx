import Link from "next/link";
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
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-md bg-emerald-700 text-lg font-black text-white shadow-sm">
              MP
            </span>
            <span>
              <span className="block text-xl font-black leading-tight">
                Monkey Ping Pong
              </span>
              <span className="block text-sm font-medium text-stone-600">
                Ranking del Bar Monkey
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800"
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
      ? "bg-emerald-700 text-white"
      : tone === "ink"
        ? "bg-stone-950 text-white"
        : "bg-white text-stone-950";

  return (
    <div className={`rounded-md border border-stone-300 p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-bold uppercase text-current opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black leading-none">{value}</p>
    </div>
  );
}

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  return (
    <div className="max-w-full overflow-hidden rounded-md border border-stone-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-950 text-white">
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
                  row.rankPosition === 1 ? "bg-emerald-50" : "bg-white"
                }
                key={row.id}
              >
                <td className="px-4 py-4 text-lg font-black">
                  {row.rankPosition}
                </td>
                <td className="px-4 py-4">
                  <div className="font-black">{row.name}</div>
                  {row.nickname ? (
                    <div className="text-xs font-semibold text-stone-500">
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
      <div className="rounded-md border border-dashed border-stone-300 bg-white p-6 text-sm font-semibold text-stone-600">
        Todavia no hay partidos cargados.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {matches.map((match) => (
        <article
          className="grid gap-3 rounded-md border border-stone-300 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"
          key={match.id}
        >
          <div>
            <p className="text-xs font-bold uppercase text-stone-500">
              {new Intl.DateTimeFormat("es-AR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(match.playedAt))}
            </p>
            <h3 className="mt-1 text-lg font-black">
              {match.playerAName} vs {match.playerBName}
            </h3>
            <p className="text-sm font-semibold text-stone-600">
              Gano {match.winnerName}; perdio {match.loserName}
            </p>
          </div>
          <div className="flex items-center justify-start md:justify-end">
            {match.playerAScore !== null && match.playerBScore !== null ? (
              <span className="rounded-md bg-stone-950 px-3 py-2 text-lg font-black text-white">
                {match.playerAScore} - {match.playerBScore}
              </span>
            ) : (
              <span className="rounded-md bg-stone-200 px-3 py-2 text-sm font-bold text-stone-700">
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
        <p className="text-xs font-black uppercase text-emerald-800">{kicker}</p>
        <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-4xl">
          {title}
        </h1>
      </div>
      {action}
    </section>
  );
}
