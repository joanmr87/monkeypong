import { AppShell, PageHeading } from "../../components";
import { StorageBanner } from "../../storage-banner";
import { getStorageWarning, isPersistentStorageConfigured } from "@/db/monkey";

export const dynamic = "force-dynamic";

export default async function NewPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const storageWarning = getStorageWarning();
  const canWrite = !process.env.VERCEL || isPersistentStorageConfigured();

  return (
    <AppShell>
      <PageHeading kicker="Jugadores" title="Crear jugador" />
      <StorageBanner message={storageWarning} />
      {params.error ? <p className="alert">{params.error}</p> : null}
      {params.created ? <p className="success">Jugador creado.</p> : null}
      <form
        action="/api/players"
        className="grid max-w-xl gap-5 rounded-md border border-stone-300 bg-white p-5 shadow-sm"
        method="post"
      >
        <label className="field">
          <span>Nombre</span>
          <input name="name" required type="text" />
        </label>
        <label className="field">
          <span>Apodo</span>
          <input name="nickname" placeholder="Opcional" type="text" />
        </label>
        <button className="btn-primary w-fit" disabled={!canWrite} type="submit">
          Crear jugador
        </button>
      </form>
    </AppShell>
  );
}
