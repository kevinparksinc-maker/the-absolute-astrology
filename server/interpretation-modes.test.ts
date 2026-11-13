import { describe, expect, it } from "vitest";
import { READING_MODES } from "./interpretation";

describe("interpretation reading modes", () => {
  it("keeps natal, transit, and combined layers available", () => {
    expect(READING_MODES).toEqual(["natal", "transit", "combined"]);
  });
});
