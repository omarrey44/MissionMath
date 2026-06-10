"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { generateExercise } from "@/lib/generators";
import { PRACTICE_TOPICS, TOPIC_EMOJIS, TOPIC_LABELS } from "@/lib/data";
import { useProgress } from "@/lib/store";
import type { Difficulty, Exercise, Topic } from "@/lib/types";

const POINTS = { easy: 5, medium: 10, hard: 15 } as const;

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export default function PracticePage() {
  const { recordAnswer } = useProgress();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);

  function start(t: Topic) {
    setTopic(t);
    setExercise(generateExercise(t, difficulty));
    setSolvedCount(0);
  }

  function next() {
    if (topic) setExercise(generateExercise(topic, difficulty));
  }

  if (!topic || !exercise) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-3xl font-bold text-tinta">
            🏋️ Practicar más
          </h1>
          <p className="mt-1 text-tinta/70">
            Elige un tema y resuelve todos los ejercicios que quieras.
          </p>
        </header>

        <div className="card flex flex-wrap items-center gap-3 p-4">
          <span className="font-display text-sm font-bold text-tinta/70">
            Dificultad:
          </span>
          <div className="flex gap-2" role="radiogroup" aria-label="Dificultad">
            {(Object.keys(DIFF_LABELS) as Difficulty[]).map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={`rounded-xl px-4 py-2 font-display text-sm font-bold transition-colors ${
                  difficulty === d
                    ? "bg-azul text-white shadow-boton"
                    : "bg-cielo text-tinta/60 hover:bg-azul/10"
                }`}
              >
                {DIFF_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {PRACTICE_TOPICS.map((t, i) => (
            <motion.button
              key={t}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => start(t)}
              className="card flex flex-col items-center gap-2 p-6 transition-shadow hover:shadow-card-hover focus-visible:outline focus-visible:outline-4 focus-visible:outline-amarillo"
            >
              <span className="text-4xl" aria-hidden="true">
                {TOPIC_EMOJIS[t]}
              </span>
              <span className="font-display text-base font-bold text-tinta">
                {TOPIC_LABELS[t]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setTopic(null);
            setExercise(null);
          }}
          className="flex items-center gap-1.5 font-display text-sm font-bold text-tinta/60 transition-colors hover:text-azul"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Elegir otro tema
        </button>
        <span className="rounded-full bg-white px-4 py-1.5 font-display text-sm font-bold text-azul shadow-card">
          {TOPIC_EMOJIS[topic]} {TOPIC_LABELS[topic]} · {DIFF_LABELS[difficulty]}
        </span>
      </div>

      {solvedCount > 0 && (
        <p className="text-center font-display text-sm font-bold text-exito">
          ✅ Has resuelto {solvedCount} {solvedCount === 1 ? "ejercicio" : "ejercicios"} en
          esta sesión
        </p>
      )}

      <AnimatePresence mode="wait">
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onResult={(correct) => {
            recordAnswer(exercise.topic, correct, POINTS[difficulty]);
            if (correct) setSolvedCount((c) => c + 1);
          }}
          onContinue={next}
          continueLabel="Siguiente ejercicio"
        />
      </AnimatePresence>
    </div>
  );
}
