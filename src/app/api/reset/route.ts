import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Deletes ALL student records so everyone starts fresh for a new season.
 * Protected by the same teacher header as the ranking endpoint.
 */
export async function DELETE(request: Request) {
  const teacherUser = process.env.TEACHER_USER ?? "YukiCM";
  if (request.headers.get("x-teacher-user") !== teacherUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  // Delete every row — neq on id matches all UUIDs
  const { error } = await db.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("reset failed:", error.message);
    return NextResponse.json({ error: "Error al limpiar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
