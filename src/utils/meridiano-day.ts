/**
 * A Meridiano Day is the calendar day in Sao Paulo, which is the day the API
 * resolves a date string to. The zone is named, never an offset, so a Brazilian
 * DST decision changes nothing here. Anything that needs "today" as the user
 * and the API both mean it reads it from this module, never from the browser
 * zone or from `toISOString`.
 */
const MERIDIANO_ZONE = "America/Sao_Paulo";

const dayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: MERIDIANO_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The year, month and day `instant` falls on in Sao Paulo, each already zero padded. */
function dayParts(instant: Date) {
  const parts = dayFormat.formatToParts(instant);
  const part = (type: "year" | "month" | "day") =>
    parts.find((p) => p.type === type)?.value ?? "";
  return { year: part("year"), month: part("month"), day: part("day") };
}

/**
 * The Meridiano Day `instant` falls on, as a local `Date` at noon. Callers do
 * their calendar arithmetic and their formatting on that day with the browser's
 * own getters, and noon keeps them clear of any local DST jump.
 */
export function meridianoDay(instant: Date): Date {
  const { year, month, day } = dayParts(instant);
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

/**
 * The Meridiano Day `instant` falls on, as the `yyyy-MM-dd` a date input and
 * the API both take.
 */
export function meridianoDayString(instant: Date): string {
  const { year, month, day } = dayParts(instant);
  return `${year}-${month}-${day}`;
}
