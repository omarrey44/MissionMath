"use client";

import { motion } from "framer-motion";
import type { BadgeDef } from "@/lib/types";

interface BadgeCardProps {
  badge: BadgeDef;
  unlocked: boolean;
  index?: number;
}

export function BadgeCard({ badge, unlocked, index = 0 }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`card flex items-center gap-3 p-4 ${
        unlocked ? "ring-2 ring-amarillo" : "opacity-50 grayscale"
      }`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amarillo-light/60 text-2xl" aria-hidden="true">
        {unlocked ? badge.emoji : "🔒"}
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold text-tinta">{badge.name}</p>
        <p className="text-xs text-tinta/60">{badge.description}</p>
      </div>
    </motion.div>
  );
}
