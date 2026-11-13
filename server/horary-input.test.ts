import { describe, expect, it } from "vitest";
import { horaryFollowUpHistorySchema } from "./horary-input";

describe("Horary follow-up history validation", () => {
  it("accepts a full initial AI judgment as assistant context", () => {
    const result = horaryFollowUpHistorySchema.safeParse([
      { role: "user", content: "A synthetic Horary question." },
      { role: "assistant", content: "x".repeat(8_384) },
      { role: "user", content: "What evidence supports the conclusion?" },
    ]);

    expect(result.success).toBe(true);
  });

  it("keeps individual user and assistant history turns bounded", () => {
    expect(horaryFollowUpHistorySchema.safeParse([
      { role: "assistant", content: "x".repeat(16_001) },
    ]).success).toBe(false);
    expect(horaryFollowUpHistorySchema.safeParse([
      { role: "user", content: "x".repeat(2_001) },
    ]).success).toBe(false);
  });

  it("keeps the total number of history turns bounded", () => {
    expect(horaryFollowUpHistorySchema.safeParse(
      Array.from({ length: 21 }, (_, index) => ({ role: index % 2 ? "assistant" as const : "user" as const, content: "x" })),
    ).success).toBe(false);
  });
});
