import { NextResponse } from "next/server";
import { getStorageWarning, isPersistentStorageConfigured } from "@/db/monkey";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    persistent: isPersistentStorageConfigured(),
    warning: getStorageWarning(),
  });
}
