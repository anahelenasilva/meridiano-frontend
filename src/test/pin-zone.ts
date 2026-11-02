import { afterAll, beforeAll } from "vitest";

/**
 * Pins the process zone for the enclosing `describe` so a zone-dependent spec
 * fails on a Brazilian machine too. Call it from the describe body, next to the
 * comment saying why the block needs its own zone.
 *
 * The restore deletes `TZ` when the host had none, because assigning the
 * captured `undefined` back writes the string `"undefined"`: the process then
 * resolves to no zone at all and every later local `Date` getter reads UTC.
 */
export function pinZone(zone: string) {
  let hostZone: string | undefined;

  beforeAll(() => {
    hostZone = process.env.TZ;
    process.env.TZ = zone;
  });

  afterAll(() => {
    if (hostZone === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = hostZone;
    }
  });
}
