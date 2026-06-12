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
    // Full snapshot so a returning student can restore everything
    extra: {
      completedDays: s.completedDays,
      badges: s.badges,
      topicCorrect: s.topicCorrect,
      currentWeek: s.currentWeek,
      missionSaves: s.missionSaves,
      missionTimes: s.missionTimes,
    },
  };
}

/**
 * Invisible component that keeps the ranking DB up to date.
 * On mount it checks the season sentinel; if a reset happened after this
 * device last acknowledged it, local progress is wiped before syncing.
 */
export function ProgressSync() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedOnLoad = useRef(false);
  const seasonChecked = useRef(false);

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

    async function checkSeasonThenSync() {
      if (seasonChecked.current) return;
      seasonChecked.current = true;
      try {
        const res = await fetch("/api/season", { cache: "no-store" });
        if (res.ok) {
          const { resetAt } = await res.json() as { resetAt: string | null };
          if (resetAt) {
            const s = useProgress.getState();
            const lastReset = s.lastSeasonReset;
            if (!lastReset || new Date(resetAt) > new Date(lastReset)) {
              // A reset happened after this device last acknowledged it
              useProgress.getState().resetProgress();
              useProgress.getState().setLastSeasonReset(resetAt);
              return; // Don't sync — local was just wiped
            }
          }
        }
      } catch {
        // Season check failing is non-fatal — proceed normally
      }
      send();
    }

    const tryInitial = () => {
      const s = useProgress.getState();
      if (s.hasHydrated && !syncedOnLoad.current) {
        syncedOnLoad.current = true;
        checkSeasonThenSync();
      }
    };
    tryInitial();

    const unsubscribe = useProgress.subscribe((state, prev) => {
      tryInitial();
      if (
        state.points === prev.points &&
        state.stars === prev.stars &&
        state.exercisesSolved === prev.exercisesSolved &&
        state.completedDays === prev.completedDays &&
        state.missionSaves === prev.missionSaves &&
        state.missionTimes === prev.missionTimes &&
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
