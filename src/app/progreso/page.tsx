"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { StudentStats } from "@/components/StudentStats";
import { BadgeCard } from "@/components/BadgeCard";
import { ProgressBar } from "@/components/ProgressBar";
import { BADGES, DAYS, TOTAL_WEEKS } from "@/lib/data";
import { useProgress } from "@/lib/store";

export default function ProgressPage() {
  const {
    studentName,
    badges,
    completedDays,
    exercisesSolved,
    correctAnswers,
    resetProgress,
    hasHydrated,
  } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  const totalMissions = TOTAL_WEEKS * DAYS.length;
  const missionsDone = Object.keys(completedDays).length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-tinta">
          📈 {hasHydrated && studentName ? `Progreso de ${studentName}` : "Mi progreso"}
        </h1>
        <p className="mt-1 text-tinta/70">
          Aquí puedes ver todo lo que has logrado. ¡Sigue así!
        </p>
      </header>

      <StudentStats />

      <section className="card p-6" aria-labelledby="missions-title">
        <h2 id="missions-title" className="font-display text-xl font-bold text-tinta">
          🚀 Misiones completadas
        </h2>
        <div className="mt-4">
          <ProgressBar
            value={hasHydrated ? missionsDone : 0}
            max={totalMissions}
            label="Misiones de las 4 semanas"
          />
        </div>
        <p className="mt-3 text-sm text-tinta/60">
          {hasHydrated ? exercisesSolved : 0} ejercicios resueltos en total ·{" "}
          {hasHydrated ? correctAnswers : 0} respuestas correctas
        </p>
      </section>

      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className="font-display text-xl font-bold text-tinta">
          🏅 Insignias
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((badge, i) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={hasHydrated && badges.includes(badge.id)}
              index={i}
            />
          ))}
        </div>
      </section>

      <section className="card border-2 border-error/20 p-6" aria-labelledby="reset-title">
        <h2 id="reset-title" className="font-display text-lg font-bold text-tinta">
          Reiniciar progreso
        </h2>
        <p className="mt-1 text-sm text-tinta/60">
          Esto borrará todos tus puntos, estrellas e insignias. No se puede deshacer.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-error/40 px-5 py-2.5 font-display text-sm font-bold text-error transition-colors hover:bg-error/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Reiniciar todo
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <span className="font-display text-sm font-bold text-error">
              ¿Estás seguro?
            </span>
            <button
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
              className="rounded-2xl bg-error px-5 py-2.5 font-display text-sm font-bold text-white hover:opacity-90"
            >
              Sí, borrar todo
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-ghost text-sm">
              Cancelar
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
