"use client";

import { motion } from "framer-motion";
import { Star, Zap, Flame, Target } from "lucide-react";
import { useProgress, accuracy } from "@/lib/store";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export function StudentStats() {
  const { points, stars, streak, exercisesSolved, correctAnswers, hasHydrated } =
    useProgress();

  const stats = [
    {
      icon: Zap,
      label: "Puntos",
      value: hasHydrated ? points : 0,
      color: "text-azul",
      bg: "bg-cielo",
    },
    {
      icon: Star,
      label: "Estrellas",
      value: hasHydrated ? stars : 0,
      color: "text-amarillo-dark",
      bg: "bg-amarillo-light/50",
    },
    {
      icon: Flame,
      label: "Racha",
      value: hasHydrated ? streak : 0,
      color: "text-coral-dark",
      bg: "bg-coral/10",
    },
    {
      icon: Target,
      label: "Precisión",
      value: hasHydrated ? `${accuracy(correctAnswers, exercisesSolved)}%` : "0%",
      color: "text-exito",
      bg: "bg-exito/10",
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
            className={`card flex items-center gap-3 p-4 ${s.bg}`}
          >
            <Icon className={`h-7 w-7 ${s.color}`} aria-hidden="true" />
            <div>
              <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-semibold text-tinta/60">{s.label}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
