/** All date logic uses the school's timezone so days roll over at local midnight. */
export const TIMEZONE = "America/Chihuahua";

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
