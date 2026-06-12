import { NextResponse } from "next/server";
import { getDb, RESET_SENTINEL_ID } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Returns the timestamp of the last season reset, or null if never reset. */
export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ resetAt: null });

  const { data } = await db
    .from("students")
    .select("last_active")
    .eq("id", RESET_SENTINEL_ID)
    .single();

  return NextResponse.json({ resetAt: data?.last_active ?? null });
}
