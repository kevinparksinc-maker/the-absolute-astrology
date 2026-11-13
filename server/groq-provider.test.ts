import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { env } = vi.hoisted(() => ({ env: {
  groqApiKey: "private-test-key", groqModel: "openai/gpt-oss-120b",
  anthropicApiKey: "old-claude-key", geminiApiKey: "old-gemini-key",
} }));
vi.mock("./_core/env", () => ({ ENV: env }));
import { getLLMProviderStatus, invokeLLM, listLLMModels } from "./_core/llm";
const answer = { id: "groq-test", model: env.groqModel, choices: [{ index: 0, message: { role: "assistant", content: "Reading" }, finish_reason: "stop" }] };
const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => vi.unstubAllGlobals());
describe("Groq interpreter", () => {
  it("routes legacy model hints to Groq and preserves full evidence and history", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(answer)));
    const messages = [{ role: "system" as const, content: "Canon evidence" }, { role: "user" as const, name: "Kevin", content: "XYZ chart" }];
    await expect(invokeLLM({ model: "claude-sonnet-4-6", messages, maxTokens: 2000 })).resolves.toEqual(answer);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.headers.authorization).toBe("Bearer private-test-key");
    expect(JSON.parse(init.body)).toMatchObject({ model: env.groqModel, messages: [{ role: "system", content: "Canon evidence" }, { role: "user", content: "XYZ chart" }], max_completion_tokens: 2000, include_reasoning: false });
    expect(getLLMProviderStatus().provider).toBe("groq");
  });
  it("forwards structured output schemas and tool requests", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(answer)));
    const schema = { name: "reading", schema: { type: "object" } };
    const tools = [{ type: "function" as const, function: { name: "chart", parameters: { type: "object" } } }];
    await invokeLLM({ messages: [], outputSchema: schema, tools, toolChoice: "required" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ response_format: { type: "json_schema", json_schema: schema }, tools, tool_choice: { type: "function", function: { name: "chart" } } });
  });
  it("retries a provider JSON-generation failure once while keeping the same provider and evidence", async()=>{
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({error:{code:"json_validate_failed",message:"private chart"}}),{status:400})).mockResolvedValueOnce(new Response(JSON.stringify(answer)));
    await expect(invokeLLM({messages:[{role:"user",content:"Return JSON for exact evidence"}],response_format:{type:"json_object"}})).resolves.toEqual(answer);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).response_format).toBeUndefined();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages).toEqual(JSON.parse(fetchMock.mock.calls[0][1].body).messages);
  });
  it("reports only allowlisted provider codes and never the private error body",async()=>{
    fetchMock.mockResolvedValue(new Response(JSON.stringify({error:{code:"invalid_request_error",message:"private chart"}}),{status:400}));
    const error=await invokeLLM({messages:[]}).catch(e=>e as Error);
    expect(error.message).toContain("invalid_request_error");expect(error.message).not.toContain("private chart");expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("uses Groq for the model list", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: [] })));
    await listLLMModels();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.groq.com/openai/v1/models");
  });
  it("reports auth failures without paid fallback or leaking prompts", async () => {
    fetchMock.mockResolvedValue(new Response("private chart echoed", { status: 401 }));
    await expect(invokeLLM({ messages: [] })).rejects.toThrow("Check GROQ_API_KEY");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it.each(["length", "stop"])("rejects incomplete or empty readings (%s)", async finish_reason => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ...answer, choices: [{ message: { content: "" }, finish_reason }] })));
    await expect(invokeLLM({ messages: [] })).rejects.toThrow(finish_reason === "length" ? "GROQ_INCOMPLETE_READING" : "GROQ_EMPTY_READING");
  });
  it("does not silently discard image inputs", async () => {
    await expect(invokeLLM({ messages: [{ role: "user", content: { type: "image_url", image_url: { url: "https://example.com/chart.png" } } }] })).rejects.toThrow("GROQ_UNSUPPORTED_CONTENT");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
