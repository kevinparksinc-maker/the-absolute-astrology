import { describe, expect, it } from "vitest";
import {
  APP_DIRECTORY,
  searchDirectory,
} from "../client/src/config/appDirectory";
import { readFileSync } from "node:fs";

describe("page index", () => {
  it("has unique routes with searchable descriptions", () => {
    expect(new Set(APP_DIRECTORY.map(item => item.href)).size).toBe(
      APP_DIRECTORY.length
    );
    expect(
      searchDirectory("30-minute").some(item => item.href === "/forecast")
    ).toBe(true);
    expect(
      searchDirectory("saved profiles").some(item => item.href === "/profiles")
    ).toBe(true);
    expect(searchDirectory("nonexistentxyz")).toEqual([]);
  });
  it("points every indexed page at an existing router destination", () => {
    const router = readFileSync(
      new URL("../client/src/App.tsx", import.meta.url),
      "utf8"
    );
    const primary = ["/", "/chart", "/energy", "/reading", "/explore"];
    for (const item of APP_DIRECTORY) {
      const route = item.href.split("?")[0];
      if (primary.includes(route)) continue;
      expect(router.includes(`"${route}"`), route).toBe(true);
    }
  });
});
