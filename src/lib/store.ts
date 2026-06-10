"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BADGES, WRONG_PENALTY } from "./data";
import { todayKey, yesterdayKey } from "./date";
import type { Difficulty, Exercise, Topic } from "./types";

/** Snapshot of an unfinished daily mission so students can resume it. */
export interface MissionSave {
  difficulty: Difficulty;
  exercises: Exercise[];
  step: number;
  pointsEarned: number;
}

interface ProgressState {
  hasHydrated: boolean;
  /** Stable anonymous id used to identify this student in the ranking DB. */
  studentId: string;
  studentName: string;
  /** Teacher username entered in Modo Maestra; grants access while it matches. */
  teacherUser: string;
  points: number;
  stars: number;
  badges: string[];
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  /** Keys like "w1-lunes" → true when the mission is completed. */
  completedDays: Record<string, boolean>;
  exercisesSolved: number;
  correctAnswers: number;
  /** Correct answers per topic, used to unlock badges. */
  topicCorrect: Partial<Record<Topic, number>>;
  currentWeek: number;
  /** In-progress missions keyed "w{week}-{daySlug}", cleared on completion. */
  missionSaves: Record<string, MissionSave>;

  setName: (name: string) => void;
  setTeacherUser: (user: string) => void;
  setWeek: (week: number) => void;
  /** Records an answered exercise. Returns the ids of badges unlocked right now. */
  recordAnswer: (topic: Topic, correct: boolean, points: number) => string[];
  /** Marks a mission complete and awards stars. Returns newly unlocked badge ids. */
  completeMission: (week: number, daySlug: string, stars: number) => string[];
  saveMission: (key: string, save: MissionSave) => void;
  clearMission: (key: string) => void;
  /**
   * Clears the local session so another student can use this device.
   * The previous student's progress stays in the ranking DB.
   */
  switchStudent: () => void;
  /** Restores a returning student from their DB row (same name = same account). */
  restoreStudent: (row: {
    id: string;
    name: string;
    points: number;
    stars: number;
    exercises: number;
    correct: number;
    streak: number;
    extra?: {
      completedDays?: Record<string, boolean>;
      badges?: string[];
      topicCorrect?: Record<string, number>;
      currentWeek?: number;
    } | null;
  }) => void;
  resetProgress: () => void;
  setHydrated: () => void;
}


function checkBadges(state: {
  badges: string[];
  topicCorrect: Partial<Record<Topic, number>>;
  completedDays: Record<string, boolean>;
  streak: number;
}): string[] {
  const missions = Object.keys(state.completedDays).length;
  const unlocked: string[] = [];
  for (const badge of BADGES) {
    if (state.badges.includes(badge.id)) continue;
    const r = badge.rule;
    const ok =
      r.type === "topicCorrect"
        ? (state.topicCorrect[r.topic] ?? 0) >= r.count
        : r.type === "missions"
          ? missions >= r.count
          : state.streak >= r.count;
    if (ok) unlocked.push(badge.id);
  }
  return unlocked;
}

const initialState = {
  hasHydrated: false,
  studentId: "",
  studentName: "",
  teacherUser: "",
  points: 0,
  stars: 0,
  badges: [] as string[],
  streak: 0,
  lastActiveDate: "",
  completedDays: {} as Record<string, boolean>,
  exercisesSolved: 0,
  correctAnswers: 0,
  topicCorrect: {} as Partial<Record<Topic, number>>,
  currentWeek: 1,
  missionSaves: {} as Record<string, MissionSave>,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setName: (name) =>
        set((s) => ({
          studentName: name.trim(),
          // Keep the same id if the student just renames themselves
          studentId: s.studentId || crypto.randomUUID(),
        })),
      setTeacherUser: (user) => set({ teacherUser: user.trim() }),
      setWeek: (week) => set({ currentWeek: week }),

      recordAnswer: (topic, correct, points) => {
        const s = get();
        const today = todayKey();
        let streak = s.streak;
        if (s.lastActiveDate !== today) {
          streak = s.lastActiveDate === yesterdayKey() ? streak + 1 : 1;
        }
        const topicCorrect = { ...s.topicCorrect };
        if (correct) {
          topicCorrect[topic] = (topicCorrect[topic] ?? 0) + 1;
        }
        const next = {
          exercisesSolved: s.exercisesSolved + 1,
          correctAnswers: s.correctAnswers + (correct ? 1 : 0),
          // Wrong answers cost points, but the total never goes below zero
          points: Math.max(0, s.points + (correct ? points : -WRONG_PENALTY)),
          topicCorrect,
          streak,
          lastActiveDate: today,
        };
        const newBadges = checkBadges({ ...s, ...next });
        set({ ...next, badges: [...s.badges, ...newBadges] });
        return newBadges;
      },

      completeMission: (week, daySlug, stars) => {
        const s = get();
        const key = `w${week}-${daySlug}`;
        if (s.completedDays[key]) return [];
        const completedDays = { ...s.completedDays, [key]: true };
        const next = { completedDays, stars: s.stars + stars };
        const newBadges = checkBadges({ ...s, ...next });
        set({ ...next, badges: [...s.badges, ...newBadges] });
        return newBadges;
      },

      saveMission: (key, save) =>
        set((s) => ({ missionSaves: { ...s.missionSaves, [key]: save } })),

      clearMission: (key) =>
        set((s) => {
          const rest = { ...s.missionSaves };
          delete rest[key];
          return { missionSaves: rest };
        }),

      restoreStudent: (row) =>
        set((s) => ({
          ...initialState,
          hasHydrated: true,
          teacherUser: s.teacherUser,
          studentId: row.id,
          studentName: row.name,
          points: row.points,
          stars: row.stars,
          exercisesSolved: row.exercises,
          correctAnswers: row.correct,
          streak: row.streak,
          completedDays: row.extra?.completedDays ?? {},
          badges: row.extra?.badges ?? [],
          topicCorrect: (row.extra?.topicCorrect ?? {}) as Partial<
            Record<Topic, number>
          >,
          currentWeek: row.extra?.currentWeek ?? 1,
        })),

      switchStudent: () =>
        set((s) => ({
          ...initialState,
          hasHydrated: true,
          // Teacher session belongs to the device, not the student
          teacherUser: s.teacherUser,
        })),

      resetProgress: () => set({ ...initialState, hasHydrated: true }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "mision-matematica",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        Object.fromEntries(
          Object.entries(s).filter(([key]) => key !== "hasHydrated")
        ),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

/** Accuracy as 0-100, safe for zero exercises. */
export function accuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
