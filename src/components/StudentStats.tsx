"use client";

import { motion } from "framer-motion";
import { Star, Zap, Flame, Target } from "lucide-react";
import { useProgress, accuracy } from "@/lib/store";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

/** Decorative mini line chart, like a tiny progress trend. */
function Sparkline({ color, points }: { color: string; points: string }) {
  return (
    <svg
      viewBox="0 0 64 24"
      className="h-6 w-16"
      aria-hidden="true"
      fill="none"
    >
      <motion.polyline
        points={points}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export function StudentStats() {
  const { points, stars, streak, exercisesSolved, correctAnswers, hasHydrated } =
    useProgress();

  const stats = [
    {
      icon: Zap,
      label: "Puntos",
      value: hasHydrated ? points : 0,
      color: "text-azul",
      hex: "#2B6FE3",
      spark: "2,20 12,14 22,17 32,9 42,12 52,5 62,8",
    },
    {
      icon: Star,
      label: "Estrellas",
      value: hasHydrated ? stars : 0,
      color: "text-amarillo-dark",
      hex: "#E8AE1B",
      spark: "2,18 12,16 22,10 32,13 42,7 52,10 62,4",
    },
    {
      icon: Flame,
      label: "Racha",
      value: hasHydrated ? streak : 0,
      color: "text-coral-dark",
      hex: "#FF7B54",
      spark: "2,20 12,18 22,14 32,15 42,10 52,8 62,6",
    },
    {
      icon: Target,
      label: "Precisión",
      value: hasHydrated ? `${accuracy(correctAnswers, exercisesSolved)}%` : "0%",
      color: "text-exito",
      hex: "#3BB273",
      spark: "2,16 12,12 22,15 32,8 42,11 52,6 62,9",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.07 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            variants={cardVariants}
            className="card flex items-center justify-between gap-2 p-4"
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`h-6 w-6 shrink-0 ${s.color}`} aria-hidden="true" />
              <div>
                <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs font-semibold text-tinta/60">{s.label}</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <Sparkline color={s.hex} points={s.spark} />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
