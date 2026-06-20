import { NextResponse } from "next/server";
import { createPlayer, listPlayers } from "@/db/monkey";

export const dynamic = "force-dynamic";

function wantsHtml(request: Request) {
  return request.headers.get("accept")?.includes("text/html");
}

export async function GET() {
  return NextResponse.json(await listPlayers());
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const url = new URL(request.url);

  try {
    const player = await createPlayer({
      name: String(formData.get("name") ?? ""),
      nickname: String(formData.get("nickname") ?? ""),
    });

    if (wantsHtml(request)) {
      return NextResponse.redirect(new URL("/players?created=1", url), 303);
    }

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";

    if (wantsHtml(request)) {
      return NextResponse.redirect(
        new URL(`/players/new?error=${encodeURIComponent(message)}`, url),
        303
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
