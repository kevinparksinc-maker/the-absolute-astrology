import { describe, expect, it } from "vitest";
import { getLLMProviderStatus } from "./_core/llm";

describe("LLM provider status", () => {
  it("reports a safe status shape without exposing credentials", () => {
    const status = getLLMProviderStatus();
    expect(typeof status.configured).toBe("boolean");
    expect(["anthropic", "openai-compatible", "gemini", "built-in-forge", "unconfigured"]).toContain(status.provider);
    expect(status.requestTimeoutMs).toBeGreaterThan(0);
    expect(status.maxRetries).toBeGreaterThanOrEqual(0);
    expect(JSON.stringify(status)).not.toMatch(/sk-ant|sk-[a-zA-Z0-9]{10,}/);
  });
});
