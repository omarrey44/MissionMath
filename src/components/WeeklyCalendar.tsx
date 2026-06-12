"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, Star } from "lucide-react";
import { DAYS, TOTAL_WEEKS, WEEK_DESCRIPTIONS } from "@/lib/data";
import { todayWeekdayIndex, currentWeekFromDate } from "@/lib/date";
import { useProgress } from "@/lib/store";

type DayStatus = "locked" | "available" | "completed";

export function WeeklyCalendar() {
  const { completedDays, missionSaves, currentWeek, setWeek, hasHydrated } =
    useProgress();

  // Auto-select the real calendar week on first render
  useEffect(() => {
    setWeek(currentWeekFromDate(TOTAL_WEEKS));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only today's mission (real calendar date) is available; past and
  // future days stay locked. On weekends there is no daily mission.
  const todayIdx = todayWeekdayIndex();

  function statusFor(week: number, index: number): DayStatus {
    const key = `w${week}-${DAYS[index].slug}`;
    if (completedDays[key]) return "completed";
    return index === todayIdx ? "available" : "locked";
  }

  return (
    <section aria-labelledby="calendar-title" className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="calendar-title" className="font-display text-2xl font-bold text-tinta">
          📅 Misiones de la semana
        </h2>
        <div className="flex gap-1.5" role="tablist" aria-label="Elegir semana">
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              role="tab"
              aria-selected={currentWeek === w}
              onClick={() => setWeek(w)}
              className={`rounded-xl px-3.5 py-2 font-display text-sm font-bold transition-colors ${
                currentWeek === w
                  ? "bg-azul text-white shadow-boton"
                  : "bg-white text-tinta/60 hover:bg-cielo"
              }`}
            >
              Sem {w}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-tinta/60">{WEEK_DESCRIPTIONS[currentWeek]}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {DAYS.map((day, i) => {
          const status: DayStatus = hasHydrated ? statusFor(currentWeek, i) : "locked";
          const starsEarned = status === "completed" ? 3 : 0;
          const isToday = i === todayIdx;
          const inProgress =
            hasHydrated &&
            status === "available" &&
            Boolean(missionSaves[`w${currentWeek}-${day.slug}`]);
          return (
            <motion.div
              key={day.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative flex flex-col rounded-3xl border-2 bg-white p-5 shadow-card transition-shadow ${
                status === "locked" ? "opacity-55" : "hover:shadow-card-hover"
              } ${
                status === "completed"
                  ? "border-exito/40 bg-exito/5"
                  : isToday
                    ? "border-azul"
                    : "border-tinta/5"
              }`}
            >
              {isToday && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-azul px-3 py-0.5 font-display text-xs font-bold text-white shadow-boton">
                  Hoy
                </span>
              )}
              <motion.span
                className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${
                  status === "completed"
                    ? "bg-exito/15"
                    : isToday
                      ? "bg-azul/10"
                      : "bg-cielo"
                }`}
                aria-hidden="true"
                animate={status === "available" ? { rotate: [0, -8, 8, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
              >
                {day.emoji}
              </motion.span>
              <h3 className="mt-2 font-display text-lg font-bold text-tinta">{day.name}</h3>
              <p className="text-sm text-tinta/60">{day.title}</p>
              <p className="mt-1 text-xs font-semibold text-tinta/50">
                7 ejercicios · elige tu dificultad
              </p>

              <div className="mt-2 flex gap-0.5" aria-label={`${starsEarned} de 3 estrellas`}>
                {[0, 1, 2].map((s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${
                      s < starsEarned
                        ? "fill-amarillo text-amarillo-dark"
                        : "fill-tinta/10 text-tinta/20"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <div className="mt-4 flex-1" />
              {status === "locked" && (
                <span className="flex items-center justify-center gap-2 rounded-2xl bg-tinta/5 px-4 py-2.5 font-display text-sm font-bold text-tinta/40">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Bloqueado
                </span>
              )}
              {status === "available" && (
                <Link
                  href={`/mision/${day.slug}`}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-display text-sm font-bold text-white shadow-boton transition-colors ${
                    inProgress
                      ? "bg-coral hover:bg-coral-dark"
                      : "bg-azul hover:bg-azul-dark"
                  }`}
                >
                  <Play className="h-4 w-4 fill-white" aria-hidden="true" />
                  {inProgress ? "Continuar" : "¡Empezar!"}
                </Link>
              )}
              {status === "completed" && (
                <Link
                  href={`/mision/${day.slug}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-exito/15 px-4 py-2.5 font-display text-sm font-bold text-exito transition-colors hover:bg-exito/25"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ¡Completado!
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
