import { describe, it, expect, vi } from "vitest";
import { prepareBirthStep } from "../shared/profileOnboarding";
const draft = {
  name: "kp",
  date: "1986-11-20",
  time: "10:06",
  birthTimeUnknown: false,
  location: "",
  latitude: 0,
  longitude: 0,
  timezone: "",
};
describe("Next: Cosmic Focus birth step", () => {
  it("advances the screenshot's typed Dallas input without a separate Resolve click or network", async () => {
    const lookup = vi.fn();
    const result = await prepareBirthStep(draft, "dallas, texas", lookup);
    expect(result).toMatchObject({
      location: "Dallas, Texas, USA",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      name: "kp",
      time: "10:06",
    });
    expect(lookup).not.toHaveBeenCalled();
  });
  it("awaits geocoding a new city and retains the supplied identity", async () => {
    const lookup = vi
      .fn()
      .mockResolvedValue({
        label: "Chicago, Illinois",
        latitude: 41.8781,
        longitude: -87.6298,
        timezone: "America/Chicago",
      });
    expect(await prepareBirthStep(draft, "Chicago", lookup)).toMatchObject({
      location: "Chicago, Illinois",
      name: "kp",
      date: draft.date,
    });
    expect(lookup).toHaveBeenCalledWith("Chicago");
  });
  it("propagates lookup failures instead of silently advancing", async () => {
    await expect(
      prepareBirthStep(draft, "unknown city", async () => {
        throw new Error("City service unavailable");
      })
    ).rejects.toThrow("City service unavailable");
  });
  it("rejects invalid birth details before calling the geocoder", async () => {
    const lookup = vi.fn();
    for (const change of [
      { name: "" },
      { date: "1986-02-30" },
      { time: "25:00" },
    ])
      await expect(
        prepareBirthStep({ ...draft, ...change }, "Chicago", lookup)
      ).rejects.toThrow();
    expect(lookup).not.toHaveBeenCalled();
  });
  it("supports unknown birth time and a real equatorial location", async () => {
    const located = {
      ...draft,
      birthTimeUnknown: true,
      time: "",
      location: "Equator",
      latitude: 0,
      longitude: 12,
      timezone: "UTC",
    };
    expect(await prepareBirthStep(located, "Equator", vi.fn())).toEqual(
      located
    );
  });
  it("never reuses Dallas coordinates after editing the city to Las Vegas", async () => {
    const old = {
      ...draft,
      location: "Dallas, Texas, USA",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
    };
    expect(await prepareBirthStep(old, "Las Vegas", vi.fn())).toMatchObject({
      latitude: 36.1699,
      longitude: -115.1398,
      timezone: "America/Los_Angeles",
    });
  });
  it("rejects a geocoder response without valid coordinates", async () => {
    await expect(
      prepareBirthStep(draft, "bad city", async () => ({
        label: "Bad",
        latitude: NaN,
        longitude: 0,
        timezone: "UTC",
      }))
    ).rejects.toThrow("Could not verify");
  });
});
