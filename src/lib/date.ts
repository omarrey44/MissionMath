/** All date logic uses the school's timezone so days roll over at local midnight. */
export const TIMEZONE = "America/Chihuahua";

/** First Monday of the vacation period. Week 1 = June 15 – June 19 2026. */
export const VACATION_START = "2026-06-15";

/**
 * Returns which vacation week we are in (1-based).
 * Before VACATION_START → 1 (preview). After last week → TOTAL_WEEKS.
 */
export function currentWeekFromDate(totalWeeks = 4): number {
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

export function yesterdayKey(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
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
