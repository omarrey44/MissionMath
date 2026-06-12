import { NextResponse } from "next/server";
import { getDb, RESET_SENTINEL_ID } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const teacherUser = process.env.TEACHER_USER ?? "YukiCM";
  if (request.headers.get("x-teacher-user") !== teacherUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const resetAt = new Date().toISOString();

  // 1. Delete all real student rows (sentinel excluded via its fixed ID, then re-upserted)
  const { error: delError } = await db
    .from("students")
    .delete()
    .neq("id", RESET_SENTINEL_ID);
  if (delError) {
    console.error("reset delete failed:", delError.message);
    return NextResponse.json({ error: "Error al limpiar" }, { status: 500 });
  }

  // 2. Upsert sentinel with current timestamp stored in last_active
  const { error: sentinelError } = await db.from("students").upsert({
    id: RESET_SENTINEL_ID,
    name: "__reset__",
    points: 0,
    stars: 0,
    missions: 0,
    exercises: 0,
    correct: 0,
    streak: 0,
    last_active: resetAt,
  });
  if (sentinelError) {
    // Non-fatal: reset still happened, just won't propagate to other devices
    console.warn("sentinel upsert failed:", sentinelError.message);
  }

  return NextResponse.json({ ok: true, resetAt });
}
