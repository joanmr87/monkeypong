import { AppShell, PageHeading } from "../../components";
import { StorageBanner } from "../../storage-banner";
import { getStorageWarning, isPersistentStorageConfigured, listPlayers } from "@/db/monkey";

export const dynamic = "force-dynamic";

export default async function NewMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const [players, params] = await Promise.all([listPlayers(), searchParams]);
  const hasEnoughPlayers = players.length >= 2;
  const storageWarning = getStorageWarning();
  const canWrite = !process.env.VERCEL || isPersistentStorageConfigured();

  return (
    <AppShell>
      <PageHeading kicker="Partidos" title="Registrar partido" />
      <StorageBanner message={storageWarning} />
      {params.error ? <p className="alert">{params.error}</p> : null}
      {params.created ? <p className="success">Partido guardado.</p> : null}

      <form
        action="/api/matches"
        className="grid max-w-3xl gap-5 rounded-md border border-stone-300 bg-white p-5 shadow-sm"
        method="post"
      >
        {!hasEnoughPlayers ? (
          <p className="alert">Necesitas al menos dos jugadores cargados.</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="field">
            <span>Jugador A</span>
            <select name="playerAId" required>
              <option value="">Seleccionar</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Jugador B</span>
            <select name="playerBId" required>
              <option value="">Seleccionar</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Ganador</span>
          <select name="winnerId" required>
            <option value="">Seleccionar</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="field">
            <span>Score jugador A</span>
            <input min="0" name="playerAScore" placeholder="Opcional" type="number" />
          </label>
          <label className="field">
            <span>Score jugador B</span>
            <input min="0" name="playerBScore" placeholder="Opcional" type="number" />
          </label>
        </div>

        <label className="field">
          <span>Fecha</span>
          <input name="playedAt" type="datetime-local" />
        </label>

        <button className="btn-primary w-fit" disabled={!hasEnoughPlayers || !canWrite} type="submit">
          Guardar partido
        </button>
      </form>
    </AppShell>
  );
}
