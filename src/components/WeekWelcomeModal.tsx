"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";
import { useProgress } from "@/lib/store";
import { currentWeekFromDate } from "@/lib/date";
import { TOTAL_WEEKS, WEEK_DESCRIPTIONS } from "@/lib/data";
import { fireConfetti } from "./confetti";

const WEEK_EMOJIS: Record<number, string> = {
  1: "🚀",
  2: "⭐",
  3: "🔥",
  4: "🏆",
};

export function WeekWelcomeModal() {
  const { studentName, lastWelcomedWeek, setWelcomedWeek, hasHydrated } = useProgress();
  const [open, setOpen] = useState(false);

  const week = currentWeekFromDate(TOTAL_WEEKS);

  useEffect(() => {
    if (!hasHydrated || !studentName) return;
    if (week > lastWelcomedWeek) {
      // Small delay so it doesn't clash with NamePrompt animation
      const t = setTimeout(() => {
        setOpen(true);
        fireConfetti();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [hasHydrated, studentName, week, lastWelcomedWeek]);

  function dismiss() {
    setWelcomedWeek(week);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-tinta/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="week-welcome-title"
        >
          <motion.div
            initial={{ scale: 0.7, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
            className="card w-full max-w-sm p-8 text-center"
          >
            <motion.span
              className="inline-block text-6xl"
              animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.9, repeat: 2 }}
              aria-hidden="true"
            >
              {WEEK_EMOJIS[week] ?? "🎉"}
            </motion.span>

            <h2
              id="week-welcome-title"
              className="mt-3 font-display text-3xl font-extrabold text-tinta"
            >
              ¡Semana {week}!
            </h2>

            <p className="mt-2 text-base text-tinta/70">
              Esta semana practicarás:
            </p>
            <p className="mt-1 font-display text-base font-bold text-azul">
              {WEEK_DESCRIPTIONS[week]}
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={dismiss}
              className="btn-primary mt-6 w-full"
            >
              <Rocket className="h-5 w-5" aria-hidden="true" />
              ¡A practicar!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
