"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Check, ArrowRight, RotateCcw } from "lucide-react";
import type { Exercise } from "@/lib/types";
import { checkAnswer } from "@/lib/generators";
import { CORRECT_MESSAGES, INCORRECT_MESSAGES } from "@/lib/data";

interface ExerciseCardProps {
  exercise: Exercise;
  onResult: (correct: boolean) => void;
  onContinue: () => void;
  continueLabel?: string;
}

type Status = "answering" | "correct" | "incorrect" | "revealed";

function pickMsg(arr: readonly string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function ExerciseCard({
  exercise,
  onResult,
  onContinue,
  continueLabel = "Continuar",
}: ExerciseCardProps) {
  const [inputs, setInputs] = useState<string[]>(() => exercise.parts.map(() => ""));
  const [status, setStatus] = useState<Status>("answering");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const reported = useRef(false);

  // Reset everything when a new exercise arrives
  useEffect(() => {
    setInputs(exercise.parts.map(() => ""));
    setStatus("answering");
    setAttempts(0);
    setShowHint(false);
    setFeedback("");
    reported.current = false;
    firstInputRef.current?.focus();
  }, [exercise.id, exercise.parts]);

  const canCheck = inputs.every((v) => v.trim() !== "");

  function handleCheck() {
    if (!canCheck || status === "correct" || status === "revealed") return;
    const allCorrect = exercise.parts.every((part, i) => checkAnswer(part, inputs[i]));
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (allCorrect) {
      setStatus("correct");
      setFeedback(pickMsg(CORRECT_MESSAGES));
      if (!reported.current) {
        reported.current = true;
        onResult(true);
      }
    } else if (nextAttempts >= 2) {
      // After 2 failed attempts, reveal the explanation
      setStatus("revealed");
      setFeedback("No pasa nada. Mira la explicación y aprende para la próxima.");
      if (!reported.current) {
        reported.current = true;
        onResult(false);
      }
    } else {
      setStatus("incorrect");
      setFeedback(pickMsg(INCORRECT_MESSAGES));
    }
  }

  function handleRetry() {
    setStatus("answering");
    setFeedback("");
    firstInputRef.current?.focus();
  }

  const done = status === "correct" || status === "revealed";

  return (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24 }}
      className={`card border-4 p-6 transition-colors md:p-8 ${
        status === "correct"
          ? "border-exito"
          : status === "incorrect"
            ? "border-error"
            : "border-transparent"
      }`}
    >
      <p className="font-display text-2xl font-bold leading-snug text-tinta md:text-3xl">
        {exercise.question}
      </p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleCheck();
        }}
      >
        <div className="flex flex-wrap gap-4">
          {exercise.parts.map((part, i) => (
            <label key={i} className="flex flex-col gap-1.5">
              {part.label && (
                <span className="font-display text-sm font-bold text-tinta/70">
                  {part.label}
                </span>
              )}
              <input
                ref={i === 0 ? firstInputRef : undefined}
                type="text"
                inputMode={part.kind === "fraction" ? "text" : "decimal"}
                value={inputs[i]}
                disabled={done}
                onChange={(e) => {
                  const next = [...inputs];
                  next[i] = e.target.value;
                  setInputs(next);
                  if (status === "incorrect") setStatus("answering");
                }}
                aria-label={part.label ?? "Tu respuesta"}
                placeholder={part.kind === "fraction" ? "a/b" : "?"}
                className="w-36 rounded-2xl border-2 border-azul/30 bg-cielo/50 px-4 py-3 text-center font-display text-2xl font-bold text-tinta outline-none transition-colors focus:border-azul disabled:opacity-70"
              />
            </label>
          ))}
        </div>

        <AnimatePresence>
          {showHint && status === "answering" && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-amarillo-light/60 px-4 py-3 text-base font-semibold text-tinta"
            >
              💡 {exercise.hint}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              role="status"
              className={`rounded-2xl px-4 py-3 font-display text-lg font-bold ${
                status === "correct"
                  ? "bg-exito/15 text-exito"
                  : status === "revealed"
                    ? "bg-cielo text-azul-dark"
                    : "bg-error/15 text-error"
              }`}
            >
              {status === "correct" ? "🎉 " : status === "revealed" ? "🤗 " : "💪 "}
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-dashed border-azul/30 bg-white px-4 py-3 text-base text-tinta/90"
          >
            <span className="font-bold text-azul">Explicación: </span>
            {exercise.explanation}
          </motion.p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {!done && status !== "incorrect" && (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!canCheck}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Check className="h-5 w-5" aria-hidden="true" />
                Revisar respuesta
              </motion.button>
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="btn-ghost"
              >
                <Lightbulb className="h-5 w-5" aria-hidden="true" />
                {showHint ? "Ocultar pista" : "Pista"}
              </button>
            </>
          )}

          {status === "incorrect" && (
            <button type="button" onClick={handleRetry} className="btn-secondary">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Intentar de nuevo
            </button>
          )}

          {done && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onContinue}
              className="btn-primary"
            >
              {continueLabel}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
