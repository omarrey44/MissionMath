import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Returns all students ordered by points, for the teacher's ranking. */
export async function GET(request: Request) {
  // Light access control: only the teacher's client sends this header.
  const teacherUser = process.env.TEACHER_USER ?? "YukiCM";
  if (request.headers.get("x-teacher-user") !== teacherUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Base de datos no configurada", configured: false },
      { status: 503 }
    );
  }

  const { data, error } = await db
    .from("students")
    .select("id,name,points,stars,missions,exercises,correct,streak,last_active,extra")
    .order("points", { ascending: false })
    .limit(200);

  if (error) {
    console.error("ranking query failed:", error.message);
    return NextResponse.json({ error: "Error al consultar" }, { status: 500 });
  }
  return NextResponse.json({ students: data ?? [] });
}
