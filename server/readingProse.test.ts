import { describe, it, expect } from "vitest";
import { readingProse } from "../shared/readingProse";
describe("Readable narrative prose", () => {
  it("removes provenance labels and wrapping quotes while retaining the actual meaning", () => {
    expect(
      readingProse(
        "“[TRADITION] Your Sun in Scorpio seeks emotional truth. [MODERN_SYNTHESIS · Human Reality Layer] Psychological dynamic: Your purpose develops through alliances.”"
      )
    ).toBe(
      "Your Sun in Scorpio seeks emotional truth. Your purpose develops through alliances."
    );
  });
  it("does not strip unrelated bracketed reading content", () => {
    expect(
      readingProse("The window [09:00–09:30] activates House 11.")
    ).toContain("[09:00–09:30]");
  });
});
