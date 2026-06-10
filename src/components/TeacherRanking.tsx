"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trophy, Users, CalendarCheck } from "lucide-react";
import type { StudentRow } from "@/lib/db";
import { useProgress } from "@/lib/store";

type Status = "loading" | "ready" | "unconfigured" | "error";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatLastActive(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  if (sameDay) {
    return `Hoy ${date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function TeacherRanking() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/ranking", {
        cache: "no-store",
        headers: { "x-teacher-user": useProgress.getState().teacherUser },
      });
      if (res.status === 503) {
        setStatus("unconfigured");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setStudents(data.students);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeToday = students.filter((s) => isToday(s.last_active)).length;

  return (
    <section className="card p-6" aria-labelledby="ranking-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ranking-title" className="font-display text-xl font-bold text-tinta">
          🏆 Ranking de alumnos
        </h2>
        <button onClick={load} className="btn-ghost no-print text-sm" disabled={status === "loading"}>
          <RefreshCw
            className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Actualizar
        </button>
      </div>

      {status === "unconfigured" && (
        <p className="mt-4 rounded-2xl bg-amarillo-light/40 p-4 text-sm text-tinta/80">
          La base de datos aún no está configurada. Agrega las variables{" "}
          <code className="font-bold">SUPABASE_URL</code> y{" "}
          <code className="font-bold">SUPABASE_SERVICE_ROLE_KEY</code> en Vercel para
          activar el ranking.
        </p>
      )}

      {status === "error" && (
        <p className="mt-4 rounded-2xl bg-error/10 p-4 text-sm font-semibold text-error">
          No se pudo cargar el ranking. Intenta de nuevo.
        </p>
      )}

      {status === "ready" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl bg-cielo p-3">
              <Users className="h-6 w-6 text-azul" aria-hidden="true" />
              <div>
                <p className="font-display text-lg font-bold text-azul">{students.length}</p>
                <p className="text-xs font-semibold text-tinta/60">Alumnos registrados</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-exito/10 p-3">
              <CalendarCheck className="h-6 w-6 text-exito" aria-hidden="true" />
              <div>
                <p className="font-display text-lg font-bold text-exito">{activeToday}</p>
                <p className="text-xs font-semibold text-tinta/60">Ingresaron hoy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amarillo-light/50 p-3">
              <Trophy className="h-6 w-6 text-amarillo-dark" aria-hidden="true" />
              <div>
                <p className="font-display text-lg font-bold text-amarillo-dark">
                  {students.reduce((sum, s) => sum + s.missions, 0)}
                </p>
                <p className="text-xs font-semibold text-tinta/60">Misiones completadas</p>
              </div>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="mt-4 text-sm text-tinta/60">
              Aún no hay alumnos registrados. En cuanto entren a la app aparecerán aquí.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-azul/20 font-display text-sm text-azul">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Alumno</th>
                    <th className="px-3 py-2 text-right">Puntos</th>
                    <th className="px-3 py-2 text-right">Misiones</th>
                    <th className="px-3 py-2 text-right">Ejercicios</th>
                    <th className="px-3 py-2 text-right">Precisión</th>
                    <th className="px-3 py-2 text-right">Último ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.6) }}
                      className={`border-b border-tinta/10 ${
                        isToday(s.last_active) ? "bg-exito/5" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 font-display font-bold text-tinta">
                        {MEDALS[i] ?? i + 1}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-tinta">{s.name}</td>
                      <td className="px-3 py-2.5 text-right font-display font-bold text-azul">
                        {s.points}
                      </td>
                      <td className="px-3 py-2.5 text-right text-tinta/80">{s.missions}</td>
                      <td className="px-3 py-2.5 text-right text-tinta/80">{s.exercises}</td>
                      <td className="px-3 py-2.5 text-right text-tinta/80">
                        {s.exercises > 0 ? Math.round((s.correct / s.exercises) * 100) : 0}%
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-tinta/60">
                        {formatLastActive(s.last_active)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
