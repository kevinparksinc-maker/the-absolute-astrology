import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileSessionProvider, profileStorageKeys, readDeviceProfilesForImport, useProfileSession } from "../client/src/contexts/ProfileSessionContext";

afterEach(() => vi.unstubAllGlobals());

describe("account-scoped device profiles", () => {
  it("opens each account's own active profile and offers the old guest profiles only as an explicit import", () => {
    const records = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => records.set(key, value) } });
    const profile = (name: string) => ({ id: name, name, location: "Fixture city", date: "1990-01-01", time: "12:00", birthTimeUnknown: false, latitude: 0, longitude: 0, timezone: "UTC" });
    for (const id of ["guest", "account:a", "account:b"]) {
      const keys = profileStorageKeys(id);
      records.set(keys.active, JSON.stringify(profile(id)));
      records.set(keys.saved, JSON.stringify([profile(id)]));
    }
    function Probe() { return createElement("span", null, useProfileSession().profile?.name); }
    for (const id of ["account:a", "account:b", "guest"]) {
      expect(renderToStaticMarkup(createElement(ProfileSessionProvider, { accountId: id, children: createElement(Probe) }))).toBe(`<span>${id}</span>`);
    }
    expect(readDeviceProfilesForImport("account:a").map(row => row.name)).toEqual(["guest"]);
    expect(records.get(profileStorageKeys("guest").active)).toContain('"name":"guest"');
  });
});
