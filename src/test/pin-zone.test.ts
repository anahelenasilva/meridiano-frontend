import { describe, expect, it } from "vitest";
import { pinZone } from "@/test/pin-zone";

// Read while the file is collected, before any hook runs, so it is the zone the
// pinned block owes back. A stock macOS box has no `TZ` set, so this is the only
// record of the host zone once the pin overwrites the variable.
const HOST_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

describe("pinZone", () => {
  describe("inside the pinned block", () => {
    pinZone("Europe/Lisbon");

    it("resolves the pinned zone", () => {
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Europe/Lisbon");
    });
  });

  // Declared after the pinned block, so it runs once that block's afterAll has:
  // the slot the next zone-dependent spec added to one of these files lands in.
  it("hands the host zone back to whatever runs next", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(HOST_ZONE);
  });
});
