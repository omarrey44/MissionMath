"use client";

import confetti from "canvas-confetti";

/** Celebration burst used when a mission is completed or a badge unlocks. */
export function fireConfetti() {
  const defaults = { spread: 70, ticks: 120, zIndex: 60 };
  confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.6 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 50, angle: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...defaults, particleCount: 50, angle: 120, origin: { x: 1, y: 0.7 } });
  }, 250);
}
