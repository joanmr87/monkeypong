import Link from "next/link";
import { AppShell, PageHeading, RankingTable } from "../components";
import { getRanking } from "@/db/monkey";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const ranking = await getRanking();

  return (
    <AppShell>
      <PageHeading
        kicker="Ranking"
        title="Tabla general"
        action={
          <Link className="btn-primary" href="/matches/new">
            Cargar partido
          </Link>
        }
      />
      <div className="min-w-0">
        <RankingTable rows={ranking} />
      </div>
    </AppShell>
  );
}
