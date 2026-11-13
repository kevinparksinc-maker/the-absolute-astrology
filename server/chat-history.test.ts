import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateChart } from "./astronomy";

const mocked = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM: mocked.invokeLLM }));

import { askHost } from "./host";
import { followUp } from "./interpretation";
import { withCurrentQuestion } from "./_core/conversation";

const answer = {
  choices: [{ message: { role: "assistant", content: "A grounded answer." } }],
};

beforeEach(() => {
  mocked.invokeLLM.mockReset();
  mocked.invokeLLM.mockResolvedValue(answer);
});

describe("AI conversation history", () => {
  it("appends a just-submitted user turn once when it is already in history", () => {
    const history = [
      { role: "user" as const, content: "Earlier question" },
      { role: "assistant" as const, content: "Earlier answer" },
      { role: "user" as const, content: "Current question" },
    ];

    expect(withCurrentQuestion(history, "Current question")).toEqual([
      ...history.slice(0, 2),
      { role: "user", content: "Current question" },
    ]);
  });

  it("keeps only the configured number of prior turns", () => {
    const history = Array.from({ length: 8 }, (_, index) => ({
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: `Turn ${index}`,
    }));

    expect(withCurrentQuestion(history, "New question", 3)).toEqual([
      ...history.slice(-3),
      { role: "user", content: "New question" },
    ]);
  });

  it("does not duplicate the latest question in the general astrology host prompt", async () => {
    const question = "Can you explain how this placement might shape my choices?";
    await askHost([
      { role: "user", content: "Earlier question" },
      { role: "assistant", content: "Earlier answer" },
      { role: "user", content: question },
    ], question);

    const submitted = mocked.invokeLLM.mock.calls[0][0].messages as Array<{ role: string; content: string }>;
    expect(submitted.filter(message => message.role === "user" && message.content === question)).toHaveLength(1);
    expect(submitted.some(message => message.content === "Earlier answer")).toBe(true);
  });

  it("does not duplicate the latest question in chart-grounded interpretation follow-up", async () => {
    const question = "How could this transit feel in daily life?";
    const chart = await calculateChart({
      location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797,
      timezone: "America/Chicago", date: "1986-11-20", time: "10:06",
      readingScope: "combined", transitLocation: "Las Vegas", transitLatitude: 36.1699,
      transitLongitude: -115.1398, transitTimezone: "America/Los_Angeles",
      transitDate: "2026-11-06", transitTime: "11:06",
    });

    await followUp(
      chart,
      { intelligence: "Chart map evidence", reading: "Generated reading context" },
      [
        { role: "user", content: "Earlier question" },
        { role: "assistant", content: "Earlier answer" },
        { role: "user", content: question },
      ],
      question,
      "combined",
    );

    const submitted = mocked.invokeLLM.mock.calls[0][0].messages as Array<{ role: string; content: string }>;
    expect(submitted.filter(message => message.role === "user" && message.content === question)).toHaveLength(1);
    expect(submitted.some(message => message.content.includes("Generated reading context"))).toBe(true);
  });
});
