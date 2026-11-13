import { describe, expect, it } from "vitest";
import { parseLocalToUtc } from "./astronomy";
import { formatInZone } from "../shared/time";

describe("transit time handling", () => {
  it("interprets a Dallas transit wall time in America/Chicago", () => {
    expect(parseLocalToUtc("2026-09-30", "23:51", "America/Chicago").toISOString()).toBe("2026-10-01T04:51:00.000Z");
  });

  it("keeps the historical Dallas birth-time conversion stable", () => {
    expect(parseLocalToUtc("1986-11-20", "10:06", "America/Chicago").toISOString()).toBe("1986-11-20T16:06:00.000Z");
  });

  it("formats the same instant in the transit location timezone", () => {
    const label = formatInZone("2026-10-01T04:51:00.000Z", "America/Chicago");
    expect(label).toContain("Sep 30, 2026");
    expect(label).toContain("11:51 PM");
    expect(label).toContain("CDT");
  });
});
