import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asCount(value: unknown, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), max);
}

/** Upserts a student's progress snapshot. Called from the client app. */
export async function POST(request: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Base de datos no configurada" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const id = String(body.id ?? "");
  const name = String(body.name ?? "").trim().slice(0, 30);
  if (!UUID_RE.test(id) || name.length === 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const row = {
    id,
    name,
    points: asCount(body.points, 1_000_000),
    stars: asCount(body.stars, 100_000),
    missions: asCount(body.missions, 10_000),
    exercises: asCount(body.exercises, 1_000_000),
    correct: asCount(body.correct, 1_000_000),
    streak: asCount(body.streak, 10_000),
    last_active: new Date().toISOString(),
  };

  const { error } = await db.from("students").upsert(row);
  if (error) {
    console.error("sync upsert failed:", error.message);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
