import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { meridianoDay, meridianoDayString } from "./meridiano-day";

// 22:00 on 2026-10-25 in Sao Paulo, already 2026-10-26 in UTC and in Lisbon.
// Any instant inside the last three hours of a Brazilian day splits the two
// calendars, and that is the only window where reading the browser's zone or
// `toISOString` can get away with it.
const LATE_ON_OCT_25_IN_SAO_PAULO = new Date("2026-10-26T01:00:00Z");

describe("meridiano-day", () => {
  const hostZone = process.env.TZ;

  // The spec pins its own zone so it fails on a Brazilian machine too.
  beforeAll(() => {
    process.env.TZ = "Europe/Lisbon";
  });

  afterAll(() => {
    process.env.TZ = hostZone;
  });

  it("reads the Sao Paulo calendar day, not the UTC one", () => {
    expect(meridianoDayString(LATE_ON_OCT_25_IN_SAO_PAULO)).toBe("2026-10-25");
    expect(LATE_ON_OCT_25_IN_SAO_PAULO.toISOString().slice(0, 10)).toBe("2026-10-26");
  });

  it("returns that day as a local Date at noon, clear of any DST jump", () => {
    const day = meridianoDay(LATE_ON_OCT_25_IN_SAO_PAULO);

    expect([day.getFullYear(), day.getMonth() + 1, day.getDate()]).toEqual([2026, 10, 25]);
    expect(day.getHours()).toBe(12);
  });
});
