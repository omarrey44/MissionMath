"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ProgressBar } from "@/components/ProgressBar";
import { CompletionModal } from "@/components/CompletionModal";
import { generateMission, generateExercise, difficultyForWeek } from "@/lib/generators";
import { BADGES, DAYS, TOPIC_LABELS, TOPIC_EMOJIS } from "@/lib/data";
import { useProgress } from "@/lib/store";
import type { Difficulty, Exercise } from "@/lib/types";

const STARS_PER_MISSION = 3;

const POINTS: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 15 };

const DIFF_OPTIONS: {
  value: Difficulty;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { value: "easy", label: "Fácil", emoji: "🌱", description: "Números pequeños, ideal para calentar" },
  { value: "medium", label: "Medio", emoji: "🌟", description: "Números más grandes, un buen reto" },
  { value: "hard", label: "Difícil", emoji: "🔥", description: "Para campeones: residuos, paréntesis y más" },
];

export default function MissionPage({ params }: { params: { day: string } }) {
  const day = DAYS.find((d) => d.slug === params.day);
  if (!day) notFound();

  const {
    currentWeek,
    recordAnswer,
    completeMission,
    missionSaves,
    saveMission,
    clearMission,
    hasHydrated,
  } = useProgress();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [required, setRequired] = useState(0);
  const [step, setStep] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [extraMode, setExtraMode] = useState(false);

  const saveKey = `w${currentWeek}-${day.slug}`;
  const restored = useRef(false);

  // Resume an unfinished mission (e.g. the student went back to the menu)
  useEffect(() => {
    if (!hasHydrated || restored.current) return;
    restored.current = true;
    const save = missionSaves[saveKey];
    if (save && save.exercises.length > 0) {
      setDifficulty(save.difficulty);
      setExercises(save.exercises);
      setRequired(save.exercises.length);
      setStep(Math.min(save.step, save.exercises.length - 1));
      setPointsEarned(save.pointsEarned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  const current = exercises[step] as Exercise | undefined;

  const newBadges = useMemo(
    () =>
      BADGES.filter((b) => newBadgeIds.includes(b.id)).map((b) => ({
        name: b.name,
        emoji: b.emoji,
      })),
    [newBadgeIds]
  );

  // Random exercises are generated on the client only (after the student
  // picks a difficulty), so there is no SSR hydration mismatch.
  function startMission(diff: Difficulty) {
    const mission = generateMission(day!.topic, diff);
    setDifficulty(diff);
    setExercises(mission);
    setRequired(mission.length);
    setStep(0);
    saveMission(saveKey, {
      difficulty: diff,
      exercises: mission,
      step: 0,
      pointsEarned: 0,
    });
  }

  function handleResult(correct: boolean) {
    if (!current || !difficulty) return;
    const badges = recordAnswer(current.topic, correct, POINTS[difficulty]);
    const newPoints = pointsEarned + (correct ? POINTS[difficulty] : 0);
    if (correct) setPointsEarned(newPoints);
    if (badges.length) setNewBadgeIds((prev) => [...prev, ...badges]);
    // Persist with step advanced so an answered exercise never repeats
    if (!extraMode) {
      saveMission(saveKey, {
        difficulty,
        exercises,
        step: Math.min(step + 1, required - 1),
        pointsEarned: newPoints,
      });
    }
  }

  function handleContinue() {
    if (!extraMode && step === required - 1) {
      clearMission(saveKey);
      const badges = completeMission(currentWeek, day!.slug, STARS_PER_MISSION);
      if (badges.length) setNewBadgeIds((prev) => [...prev, ...badges]);
      setShowCompletion(true);
      return;
    }
    nextExercise();
  }

  function nextExercise() {
    setExercises((prev) => [
      ...prev,
      generateExercise(day!.topic, difficulty ?? difficultyForWeek(currentWeek)),
    ]);
    setStep((s) => s + 1);
  }

  function keepPracticing() {
    setShowCompletion(false);
    setExtraMode(true);
    nextExercise();
  }

  // Wait for localStorage before deciding between resume and selector
  if (!hasHydrated) {
    return (
      <div
        className="card mx-auto h-64 max-w-2xl animate-pulse"
        aria-busy="true"
        aria-label="Cargando misión"
      />
    );
  }

  // ---------- difficulty selection screen ----------
  if (!difficulty) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-display text-sm font-bold text-tinta/60 transition-colors hover:text-azul"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Calendario
          </Link>
          <span className="rounded-full bg-white px-4 py-1.5 font-display text-sm font-bold text-azul shadow-card">
            {day.emoji} {day.name}: {day.title} · Semana {currentWeek}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 text-center md:p-8"
        >
          <span className="text-5xl" aria-hidden="true">
            {day.emoji}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-tinta">
            Misión del {day.name}
          </h1>
          <p className="mt-2 text-tinta/70">
            11 ejercicios: sumas, restas, multiplicaciones, divisiones,{" "}
            {TOPIC_LABELS[
              ["sumas", "restas", "multiplicaciones", "divisiones"].includes(day.topic)
                ? "mixtas"
                : day.topic
            ].toLowerCase()}{" "}
            y un problema razonado.
          </p>
          <p className="mt-4 font-display text-lg font-bold text-tinta">
            Elige tu dificultad:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {DIFF_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => startMission(opt.value)}
                className="card flex flex-col items-center gap-1.5 border-2 border-transparent p-5 transition-colors hover:border-azul focus-visible:outline focus-visible:outline-4 focus-visible:outline-amarillo"
              >
                <span className="text-3xl" aria-hidden="true">
                  {opt.emoji}
                </span>
                <span className="font-display text-lg font-bold text-tinta">
                  {opt.label}
                </span>
                <span className="text-xs text-tinta/60">{opt.description}</span>
                <span className="mt-1 rounded-full bg-cielo px-3 py-1 font-display text-xs font-bold text-azul">
                  +{POINTS[opt.value]} pts por ejercicio
                </span>
              </motion.button>
            ))}
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-sm text-tinta/50">
            <Rocket className="h-4 w-4" aria-hidden="true" />
            Sugerencia para la semana {currentWeek}:{" "}
            {DIFF_OPTIONS.find((o) => o.value === difficultyForWeek(currentWeek))?.label}
          </p>
        </motion.div>
      </div>
    );
  }

  // ---------- exercise flow ----------
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-display text-sm font-bold text-tinta/60 transition-colors hover:text-azul"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Calendario
        </Link>
        <span className="rounded-full bg-white px-4 py-1.5 font-display text-sm font-bold text-azul shadow-card">
          {day.emoji} {day.name} · {DIFF_OPTIONS.find((o) => o.value === difficulty)?.label}
        </span>
      </div>

      {!extraMode ? (
        <div className="card p-5">
          <ProgressBar
            value={Math.min(step + (showCompletion ? 1 : 0), required)}
            max={required}
            label={
              current
                ? `Misión de hoy — ${TOPIC_EMOJIS[current.topic]} ${TOPIC_LABELS[current.topic]}`
                : "Misión de hoy"
            }
          />
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-exito/10 p-4 text-center font-display font-bold text-exito"
        >
          ✅ Misión cumplida — ¡sigue practicando para ganar más puntos!
        </motion.p>
      )}

      {current ? (
        <AnimatePresence mode="wait">
          <ExerciseCard
            key={current.id}
            exercise={current}
            onResult={handleResult}
            onContinue={handleContinue}
            continueLabel={
              !extraMode && step === required - 1 ? "¡Terminar misión!" : "Continuar"
            }
          />
        </AnimatePresence>
      ) : (
        <div
          className="card h-64 animate-pulse"
          aria-busy="true"
          aria-label="Cargando ejercicio"
        />
      )}

      <CompletionModal
        open={showCompletion}
        pointsEarned={pointsEarned}
        starsEarned={STARS_PER_MISSION}
        newBadges={newBadges}
        onKeepPracticing={keepPracticing}
      />
    </div>
  );
}
