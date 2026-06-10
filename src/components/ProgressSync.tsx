"use client";

import { useEffect, useRef } from "react";
import { useProgress } from "@/lib/store";

const SYNC_DEBOUNCE_MS = 3000;

function buildPayload(s: ReturnType<typeof useProgress.getState>) {
  return {
    id: s.studentId,
    name: s.studentName,
    points: s.points,
    stars: s.stars,
    missions: Object.keys(s.completedDays).length,
    exercises: s.exercisesSolved,
    correct: s.correctAnswers,
    streak: s.streak,
  };
}

/**
 * Invisible component that keeps the ranking DB up to date:
 * - one sync on load (registers "the student entered today")
 * - debounced sync whenever progress changes
 * Fire-and-forget: failures never affect the student experience.
 */
export function ProgressSync() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedOnLoad = useRef(false);

  useEffect(() => {
    function send() {
      const s = useProgress.getState();
      if (!s.studentId || !s.studentName) return;
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(s)),
      }).catch(() => {});
    }

    // Initial sync once the persisted state is hydrated
    const tryInitial = () => {
      const s = useProgress.getState();
      if (s.hasHydrated && !syncedOnLoad.current) {
        syncedOnLoad.current = true;
        send();
      }
    };
    tryInitial();

    const unsubscribe = useProgress.subscribe((state, prev) => {
      tryInitial();
      // Only sync when progress-relevant fields change
      if (
        state.points === prev.points &&
        state.stars === prev.stars &&
        state.exercisesSolved === prev.exercisesSolved &&
        state.completedDays === prev.completedDays &&
        state.studentName === prev.studentName
      ) {
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(send, SYNC_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
