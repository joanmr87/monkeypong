import { NextResponse } from "next/server";
import { getRanking } from "@/db/monkey";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRanking());
}
