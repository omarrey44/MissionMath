"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between font-display text-sm text-tinta/70">
          <span>{label}</span>
          <span className="font-bold text-azul">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progreso"}
        className="h-4 overflow-hidden rounded-full bg-azul/10"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-azul to-azul-light"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
      </div>
    </div>
  );
}
