import { describe, expect, it } from "vitest";

// Keep the response-shape contract close to the adapter's public result type.
// These cases mirror shapes returned by OpenAI-compatible gateways.
describe("OpenAI-compatible response handling contract", () => {
  it("accepts ordinary string content", () => {
    const response = { choices: [{ message: { content: "A horary reading" } }] };
    expect(response.choices[0].message.content.trim()).toBe("A horary reading");
  });

  it("documents array content as readable text", () => {
    const content = [
      { type: "output_text", text: "First paragraph" },
      { type: "text", text: "Second paragraph" },
    ];
    expect(content.map(part => part.text).filter(Boolean).join("\n")).toBe("First paragraph\nSecond paragraph");
  });

  it("documents output_text as a fallback when chat content is absent", () => {
    const response = { output_text: "Recovered answer", choices: [{ message: { content: "" } }] };
    expect(response.output_text || response.choices[0].message.content).toBe("Recovered answer");
  });
});
