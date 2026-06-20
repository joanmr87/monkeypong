import Link from "next/link";
import { AppShell, MatchList, PageHeading } from "../components";
import { listMatches } from "@/db/monkey";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matches = await listMatches(100);

  return (
    <AppShell>
      <PageHeading
        kicker="Historial"
        title="Partidos jugados"
        action={
          <Link className="btn-primary" href="/matches/new">
            Cargar partido
          </Link>
        }
      />
      <MatchList matches={matches} />
    </AppShell>
  );
}
