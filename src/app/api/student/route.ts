import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Looks up a student by name (case-insensitive) so a returning student
 * can recover their id and progress instead of creating a duplicate.
 */
export async function GET(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") ?? "").trim().slice(0, 30);
  if (!name) {
    return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
  }

  // Escape ilike wildcards so the lookup is an exact (case-insensitive) match
  const pattern = name.replace(/([%_\\])/g, "\\$1");
  const { data, error } = await db
    .from("students")
    .select("*")
    .ilike("name", pattern)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("student lookup failed:", error.message);
    return NextResponse.json({ error: "Error al consultar" }, { status: 500 });
  }
  return NextResponse.json({ student: data ?? null });
}
