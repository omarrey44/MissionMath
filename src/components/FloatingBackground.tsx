"use client";

import { motion } from "framer-motion";

const ITEMS = [
  { emoji: "✏️", x: "6%", y: "18%", duration: 7, delay: 0 },
  { emoji: "📐", x: "88%", y: "12%", duration: 9, delay: 1 },
  { emoji: "📚", x: "12%", y: "72%", duration: 8, delay: 2 },
  { emoji: "⭐", x: "92%", y: "62%", duration: 6, delay: 0.5 },
  { emoji: "🧮", x: "78%", y: "85%", duration: 10, delay: 1.5 },
  { emoji: "🎒", x: "4%", y: "45%", duration: 9, delay: 2.5 },
  { emoji: "✨", x: "55%", y: "8%", duration: 7, delay: 3 },
  { emoji: "📏", x: "35%", y: "90%", duration: 8, delay: 0.8 },
];

/** Soft floating school objects behind the whole app. Decorative only. */
export function FloatingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ITEMS.map((item, i) => (
        <motion.span
          key={i}
          className="absolute select-none text-3xl opacity-15 md:text-5xl"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  );
}
