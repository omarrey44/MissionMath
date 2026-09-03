/** All date logic uses the school's timezone so days roll over at local midnight. */
export const TIMEZONE = "America/Chihuahua";

/** First Monday of the season. Week 1 = September 7 – September 11 2026. */
export const VACATION_START = "2026-09-07";

/**
 * Returns which vacation week we are in (1-based).
 * Before VACATION_START → 1 (preview). After last week → TOTAL_WEEKS.
 */
export function currentWeekFromDate(totalWeeks = 8): number {
  const startMs = new Date(VACATION_START + "T00:00:00").getTime();
  const todayMs = new Date(todayKey() + "T00:00:00").getTime();
  const diffDays = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(week, totalWeeks);
}

/** Local date as YYYY-MM-DD (en-CA locale gives ISO format). */
export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/**
 * Last school day before `key` (Monday–Friday only), as YYYY-MM-DD.
 * Monday looks back to Friday, so a weekend never breaks a streak.
 */
export function previousSchoolDayKey(key: string = todayKey()): string {
  const d = new Date(key + "T00:00:00");
  do {
    d.setDate(d.getDate() - 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return d.toLocaleDateString("en-CA");
}

/** 0 = lunes … 4 = viernes, -1 = fin de semana. */
export function todayWeekdayIndex(): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(new Date());
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
  return map[weekday] ?? -1;
}
