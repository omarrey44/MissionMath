"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Trophy, Users, CalendarCheck,
  ChevronDown, ChevronUp, Clock,
} from "lucide-react";
import type { StudentRow } from "@/lib/db";
import { useProgress } from "@/lib/store";
import { DAYS, TOTAL_WEEKS } from "@/lib/data";

type Status = "loading" | "ready" | "unconfigured" | "error";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatLastActive(iso: string): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  if (sameDay) return `Hoy ${date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function formatTime(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function accuracy(s: StudentRow) {
  return s.exercises > 0 ? Math.round((s.correct / s.exercises) * 100) : 0;
}

// ── Shared detail panel (used in both table row and card) ─────────────────────
function StudentDetail({ student }: { student: StudentRow }) {
  const completedDays = student.extra?.completedDays ?? {};
  const missionTimes = (student.extra as { missionTimes?: Record<string, number> })?.missionTimes ?? {};
  const badges = student.extra?.badges ?? [];

  return (
    <div className="flex flex-wrap gap-5 rounded-2xl bg-cielo/50 p-4">
      {/* Missions grid */}
      <div className="min-w-[200px] flex-1">
        <p className="mb-2 font-display text-sm font-bold text-tinta/70">📅 Misiones completadas</p>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: TOTAL_WEEKS }, (_, wi) => wi + 1).map((week) => (
            <div key={week} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-semibold text-tinta/50">Semana {week}</span>
              <div className="flex gap-1">
                {DAYS.map((day) => {
                  const key = `w${week}-${day.slug}`;
                  const done = completedDays[key];
                  const time = missionTimes[key];
                  return (
                    <span
                      key={key}
                      title={`${day.name}${time ? ` — ${formatTime(time)}` : ""}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        done ? "bg-exito/20 text-exito" : "bg-tinta/5 text-tinta/30"
                      }`}
                    >
                      {done ? "✓" : day.name[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Times */}
      {Object.keys(missionTimes).length > 0 && (
        <div className="min-w-[160px] flex-1">
          <p className="mb-2 font-display text-sm font-bold text-tinta/70">
            <Clock className="mr-1 inline h-4 w-4" />
            Tiempos
          </p>
          <div className="flex flex-col gap-1">
            {Object.entries(missionTimes)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, secs]) => (
                <div key={key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-tinta/60">{key}</span>
                  <span className="font-display font-bold text-azul">{formatTime(secs)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="min-w-[140px]">
          <p className="mb-2 font-display text-sm font-bold text-tinta/70">🏅 Insignias ({badges.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span key={b} className="rounded-full bg-amarillo-light/60 px-2.5 py-1 font-display text-xs font-bold text-amarillo-dark">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function StudentCard({ student, rank, expanded, onToggle }: {
  student: StudentRow;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(rank * 0.05, 0.5) }}
      className={`rounded-2xl border-2 p-4 transition-colors ${
        isToday(student.last_active) ? "border-exito/30 bg-exito/5" : "border-tinta/5 bg-white"
      }`}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{MEDALS[rank] ?? rank + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-tinta">{student.name}</p>
          <p className="text-xs text-tinta/50">{formatLastActive(student.last_active)}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold text-azul">{student.points} pts</p>
          <p className="text-xs text-tinta/60">{student.missions} misiones</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-2 flex gap-3 text-sm text-tinta/70">
        <span>{student.exercises} ejercicios</span>
        <span>·</span>
        <span>{accuracy(student)}% precisión</span>
        <span>·</span>
        <span>🔥 {student.streak}</span>
      </div>

      {/* Expand button */}
      <button
        onClick={onToggle}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-cielo py-2 font-display text-sm font-bold text-azul transition-colors hover:bg-azul/10"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? "Ocultar detalle" : "Ver historial"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <StudentDetail student={student} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TeacherRanking() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/ranking", {
        cache: "no-store",
        headers: { "x-teacher-user": useProgress.getState().teacherUser },
      });
      if (res.status === 503) { setStatus("unconfigured"); return; }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setStudents(data.students);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeToday = students.filter((s) => isToday(s.last_active)).length;

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="card p-6" aria-labelledby="ranking-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ranking-title" className="font-display text-xl font-bold text-tinta">
          🏆 Ranking de alumnos
        </h2>
        <button onClick={load} className="btn-ghost no-print text-sm" disabled={status === "loading"}>
          <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {status === "unconfigured" && (
        <p className="mt-4 rounded-2xl bg-amarillo-light/40 p-4 text-sm text-tinta/80">
          Agrega <code className="font-bold">SUPABASE_URL</code> y{" "}
          <code className="font-bold">SUPABASE_SERVICE_ROLE_KEY</code> en Vercel para activar el ranking.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-2xl bg-error/10 p-4 text-sm font-semibold text-error">
          No se pudo cargar el ranking. Intenta de nuevo.
        </p>
      )}

      {status === "ready" && (
        <>
          {/* Summary chips */}
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
              Aún no hay alumnos registrados.
            </p>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="mt-4 flex flex-col gap-3 md:hidden">
                {students.map((s, i) => (
                  <StudentCard
                    key={s.id}
                    student={s}
                    rank={i}
                    expanded={expandedId === s.id}
                    onToggle={() => toggle(s.id)}
                  />
                ))}
              </div>

              {/* Desktop: table */}
              <div className="mt-4 hidden overflow-x-auto md:block">
                <p className="mb-2 text-xs text-tinta/50">
                  Toca un nombre para ver el historial detallado.
                </p>
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
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const expanded = expandedId === s.id;
                      return (
                        <>
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.6) }}
                            className={`cursor-pointer border-b border-tinta/10 transition-colors hover:bg-cielo/40 ${
                              isToday(s.last_active) ? "bg-exito/5" : ""
                            } ${expanded ? "bg-cielo/20" : ""}`}
                            onClick={() => toggle(s.id)}
                          >
                            <td className="px-3 py-2.5 font-display font-bold text-tinta">{MEDALS[i] ?? i + 1}</td>
                            <td className="px-3 py-2.5 font-semibold text-tinta">{s.name}</td>
                            <td className="px-3 py-2.5 text-right font-display font-bold text-azul">{s.points}</td>
                            <td className="px-3 py-2.5 text-right text-tinta/80">{s.missions}</td>
                            <td className="px-3 py-2.5 text-right text-tinta/80">{s.exercises}</td>
                            <td className="px-3 py-2.5 text-right text-tinta/80">{accuracy(s)}%</td>
                            <td className="px-3 py-2.5 text-right text-sm text-tinta/60">{formatLastActive(s.last_active)}</td>
                            <td className="px-3 py-2.5 text-tinta/40">
                              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </td>
                          </motion.tr>
                          <AnimatePresence>
                            {expanded && (
                              <motion.tr
                                key={`${s.id}-detail`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <td colSpan={8} className="px-3 pb-4 pt-1">
                                  <StudentDetail student={s} />
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
