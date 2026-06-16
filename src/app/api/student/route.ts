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

/** Teacher-only: update a student's points/stars and stamp an overrideAt. */
export async function PATCH(request: Request) {
  const teacherUser = process.env.TEACHER_USER ?? "YukiCM";
  if (request.headers.get("x-teacher-user") !== teacherUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id, points, stars } = body;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const { data: current, error: fetchErr } = await db
    .from("students").select("extra").eq("id", id).single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const overrideAt = new Date().toISOString();
  const newExtra = { ...(current?.extra ?? {}), overrideAt };
  const updates: Record<string, unknown> = { extra: newExtra };
  if (typeof points === "number" && points >= 0) updates.points = Math.floor(points);
  if (typeof stars === "number" && stars >= 0) updates.stars = Math.floor(stars);

  const { error } = await db.from("students").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, overrideAt });
}
