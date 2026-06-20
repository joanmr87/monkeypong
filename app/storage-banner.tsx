export function StorageBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
      {message}
    </div>
  );
}
