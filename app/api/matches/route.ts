import { NextResponse } from "next/server";
import { createMatch, listMatches } from "@/db/monkey";

export const dynamic = "force-dynamic";

function parseOptionalScore(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === "") return null;
  return Number(value);
}

function wantsHtml(request: Request) {
  return request.headers.get("accept")?.includes("text/html");
}

export async function GET() {
  return NextResponse.json(await listMatches());
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const url = new URL(request.url);

  try {
    await createMatch({
      playerAId: String(formData.get("playerAId") ?? ""),
      playerBId: String(formData.get("playerBId") ?? ""),
      winnerId: String(formData.get("winnerId") ?? ""),
      playerAScore: parseOptionalScore(formData.get("playerAScore")),
      playerBScore: parseOptionalScore(formData.get("playerBScore")),
      playedAt: String(formData.get("playedAt") ?? "") || null,
    });

    if (wantsHtml(request)) {
      return NextResponse.redirect(new URL("/ranking?created=match", url), 303);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";

    if (wantsHtml(request)) {
      return NextResponse.redirect(
        new URL(`/matches/new?error=${encodeURIComponent(message)}`, url),
        303
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
