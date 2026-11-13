import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./_core/env", () => ({ ENV: { anthropicApiKey: "test-key" } }));
import { invokeLLM } from "./_core/llm";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("AI request error handling", () => {
  it("returns the provider explanation without retrying a rejected 400", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { message: "Your credit balance is too low" },
          }),
          { status: 400, statusText: "Bad Request" }
        )
      );
    vi.stubGlobal("fetch", fetch);
    await expect(
      invokeLLM({ messages: [{ role: "user", content: "Summary" }] })
    ).rejects.toThrow("Your credit balance is too low");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("reports the requested timeout and avoids resending the same timed-out generation", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(
      (_url, init) =>
        new Promise((_resolve, reject) =>
          init.signal.addEventListener("abort", () =>
            reject(new Error("aborted"))
          )
        )
    );
    vi.stubGlobal("fetch", fetch);
    const pending = invokeLLM({
      messages: [{ role: "user", content: "Summary" }],
      timeoutMs: 180000,
    });
    const assertion = expect(pending).rejects.toThrow(
      "AI_REQUEST_TIMEOUT: The AI service did not respond within 180 seconds"
    );
    await vi.advanceTimersByTimeAsync(180000);
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
