"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { fireConfetti } from "./confetti";

interface CompletionModalProps {
  open: boolean;
  pointsEarned: number;
  starsEarned: number;
  newBadges: { name: string; emoji: string }[];
  onKeepPracticing: () => void;
}

export function CompletionModal({
  open,
  pointsEarned,
  starsEarned,
  newBadges,
  onKeepPracticing,
}: CompletionModalProps) {
  useEffect(() => {
    if (open) fireConfetti();
  }, [open]);

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
          aria-labelledby="completion-title"
        >
          <motion.div
            initial={{ scale: 0.7, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
            className="card w-full max-w-md p-8 text-center"
          >
            <motion.span
              className="inline-block text-6xl"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: 2 }}
              aria-hidden="true"
            >
              🏆
            </motion.span>
            <h2 id="completion-title" className="mt-3 font-display text-3xl font-bold text-tinta">
              ¡Misión completada!
            </h2>
            <p className="mt-2 text-lg text-tinta/70">
              ¡Eres una estrella de las matemáticas! 🌟
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <div className="rounded-2xl bg-cielo px-5 py-3">
                <p className="font-display text-2xl font-bold text-azul">+{pointsEarned}</p>
                <p className="text-xs font-semibold text-tinta/60">puntos</p>
              </div>
              <div className="rounded-2xl bg-amarillo-light/60 px-5 py-3">
                <p className="flex items-center justify-center gap-1 font-display text-2xl font-bold text-amarillo-dark">
                  +{starsEarned}
                  <Star className="h-5 w-5 fill-amarillo-dark" aria-hidden="true" />
                </p>
                <p className="text-xs font-semibold text-tinta/60">estrellas</p>
              </div>
            </div>

            {newBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 rounded-2xl border-2 border-dashed border-amarillo bg-amarillo-light/30 p-4"
              >
                <p className="flex items-center justify-center gap-1 font-display text-sm font-bold text-tinta">
                  <Sparkles className="h-4 w-4 text-amarillo-dark" aria-hidden="true" />
                  ¡Nueva insignia!
                </p>
                {newBadges.map((b) => (
                  <p key={b.name} className="mt-1 font-display text-lg font-bold text-tinta">
                    {b.emoji} {b.name}
                  </p>
                ))}
              </motion.div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={onKeepPracticing} className="btn-primary">
                Seguir practicando 💪
              </button>
              <Link href="/" className="btn-ghost">
                Volver al calendario
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
