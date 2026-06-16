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
      lastOverrideAt: s.lastOverrideAt,
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
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.override) {
            useProgress.getState().restoreStudent(data.override);
            const at = (data.override.extra as Record<string, unknown>)?.overrideAt as string ?? "";
            if (at) useProgress.getState().setLastOverrideAt(at);
          }
        })
        .catch(() => {});
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
            const needsReset =
              !!s.studentName && (!lastReset || new Date(resetAt) > new Date(lastReset));
            if (needsReset) {
              useProgress.getState().resetProgress();
            }
            if (!lastReset || needsReset) {
              useProgress.getState().setLastSeasonReset(resetAt);
            }
            if (needsReset) return;
          }
        }
      } catch (e) {
        console.warn("[ProgressSync] season check failed:", e);
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
