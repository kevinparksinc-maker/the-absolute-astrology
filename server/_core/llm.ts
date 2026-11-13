import { GoogleGenAI } from "@google/genai";
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string;
  signal?: AbortSignal;
  /** Per-request timeout for provider response headers. */
  timeoutMs?: number;
  thinking?: Record<string, unknown>;
  reasoning?: Record<string, unknown>;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

type ProviderResponse = InvokeResult & {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

const assertApiKey = () => {
  if (!ENV.groqApiKey && !ENV.geminiApiKey && !ENV.anthropicApiKey && !ENV.forgeApiKey && !ENV.openaiApiKey) {
    throw new Error("GROQ_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, or BUILT_IN_FORGE_API_KEY is not configured");
  }
};

const contentToText = (content: Message["content"]): string =>
  ensureArray(content).map(part => typeof part === "string" ? part : part.type === "text" ? part.text : "").join("\n");

const responseContentToText = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map(part => {
    if (typeof part === "string") return part;
    return part && typeof part === "object" && "text" in part && typeof part.text === "string" ? part.text : "";
  }).filter(Boolean).join("\n");
};

const readableAssistantText = (result: ProviderResponse): string => {
  const choiceText = responseContentToText(result.choices?.[0]?.message?.content);
  if (choiceText.trim()) return choiceText;
  if (typeof result.output_text === "string" && result.output_text.trim()) return result.output_text;
  return result.output?.flatMap(item => item.content ?? []).map(item => item.text ?? "").filter(Boolean).join("\n") ?? "";
};

// All interpretation callers use this adapter, including legacy Claude model hints.
// A Groq failure stays a Groq failure: never fall through to paid providers.
async function invokeGroq(params: InvokeParams): Promise<InvokeResult> {
  const messages = params.messages.map(message => {
    const { name: _name, ...normalized } = normalizeMessage(message);
    if (ensureArray(message.content).some(part => typeof part !== "string" && part.type !== "text")) {
      throw new Error("GROQ_UNSUPPORTED_CONTENT: The configured interpreter accepts text only.");
    }
    return normalized;
  });
  const payload: Record<string, unknown> = {
    model: ENV.groqModel,
    messages,
    max_completion_tokens: params.max_tokens ?? params.maxTokens ?? 4096,
  };
  if (ENV.groqModel.startsWith("openai/gpt-oss-")) {
    payload.reasoning_effort = "low";
    payload.include_reasoning = false;
  }
  if (params.tools?.length) payload.tools = params.tools;
  const toolChoice = normalizeToolChoice(params.toolChoice ?? params.tool_choice, params.tools);
  if (toolChoice) payload.tool_choice = toolChoice;
  const format = normalizeResponseFormat(params);
  if (format) payload.response_format = format;
  let response = await fetchWithBackoff("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${ENV.groqApiKey}` },
    body: JSON.stringify(payload),
    signal: params.signal,
    timeoutMs: params.timeoutMs,
  });
  let safeCode="";
  if(response.status===400){
    try { const body=await response.clone().json() as {error?:{code?:unknown}};
      const code=body.error?.code;
      if(typeof code==="string" && ["json_validate_failed","invalid_request_error","model_not_found","model_decommissioned","unsupported_parameter"].includes(code)) safeCode=code;
    } catch { /* Never expose a provider body that might echo the chart. */ }
    if(safeCode==="json_validate_failed" && format && !params.tools?.length){
      // Retry only a provider JSON-generation failure, once. The caller's JSON
      // parser and evidence validation still apply to the returned text.
      delete payload.response_format;
      response=await fetchWithBackoff("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${ENV.groqApiKey}`},body:JSON.stringify(payload),signal:params.signal,timeoutMs:params.timeoutMs,
      });
    }
  }
  if (!response.ok) {
    // Provider response bodies can echo private chart prompts; expose only status.
    const retryAfter = response.headers.get("retry-after");
    throw new Error(`GROQ_REQUEST_FAILED: HTTP ${response.status}${safeCode ? ` (${safeCode})` : ""}. ${response.status === 429
      ? `Groq usage limit reached.${retryAfter ? ` Retry after ${retryAfter} seconds.` : " Try again later."}`
      : response.status === 401 ? "Check GROQ_API_KEY in the server environment."
      : response.status === 413 ? "This reading exceeds the Groq account request limit."
      : "Groq could not complete this reading; check account limits and model access."}`);
  }
  const result = await response.json() as InvokeResult;
  const choice = result.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error("GROQ_INCOMPLETE_READING: The response reached its token limit. Request a shorter section.");
  }
  if (!responseContentToText(choice?.message?.content).trim() && !choice?.message?.tool_calls?.length) {
    throw new Error("GROQ_EMPTY_READING: Groq returned no interpretation.");
  }
  return result;
}

async function invokeAnthropic(params: InvokeParams): Promise<InvokeResult> {
  const system = params.messages.filter(message => message.role === "system").map(message => contentToText(message.content)).join("\n\n");
  const messages = params.messages.filter(message => message.role !== "system" && (message.role === "user" || message.role === "assistant")).map(message => ({
    role: message.role,
    content: contentToText(message.content),
  }));
  const maxTokens = params.max_tokens ?? params.maxTokens ?? 4096;
  const body: Record<string, unknown> = { model: params.model ?? "claude-sonnet-4-6", max_tokens: maxTokens, messages };
  const thinking = params.thinking as { type?: string; budget_tokens?: number } | undefined;
  if (thinking?.type === "enabled") {
    const budget = Math.max(1024, Math.floor(thinking.budget_tokens ?? 1024));
    body.thinking = { type: "enabled", budget_tokens: budget };
    body.max_tokens = maxTokens + budget; // thinking tokens must not eat the visible answer
  }
  if (system) body.system = system;
  const response = await fetchWithBackoff("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": ENV.anthropicApiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify(body),
    signal: params.signal,
    timeoutMs: params.timeoutMs,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }
  const result = await response.json() as { id: string; model: string; content?: Array<{ type: string; text?: string }>; stop_reason?: string };
  const text = (result.content ?? []).filter(part => part.type === "text").map(part => part.text ?? "").join("\n");
  return { id: result.id, created: Math.floor(Date.now() / 1000), model: result.model, choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: result.stop_reason ?? null }] };
}

async function invokeOpenAI(params: InvokeParams): Promise<InvokeResult> {
  const url = `${ENV.openaiApiBase.replace(/\/$/, "")}/chat/completions`;
  const headers = { "content-type": "application/json", authorization: `Bearer ${ENV.openaiApiKey}` };
  const messages = params.messages.map(normalizeMessage);
  const max_tokens = params.max_tokens ?? params.maxTokens ?? 4096;
  const requestedModel = params.model && !params.model.startsWith("claude") ? params.model : undefined;
  const models = requestedModel ? [requestedModel] : ["gpt-5-mini", "gpt-5-nano"];
  let lastFailure = "no readable message";

  for (const model of models) {
    // Some compatible gateways return an empty message when reasoning consumes
    // the completion budget. Retry the same model with a plain request before
    // switching models, rather than repeating the same request shape.
    const requestVariants = [
      { max_tokens, ...(params.reasoning || params.thinking ? { reasoning: { effort: "minimal" } } : {}) },
      { max_completion_tokens: max_tokens },
    ];
    for (const requestOptions of requestVariants) {
      const response = await fetchWithBackoff(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ model, messages, ...requestOptions }),
        signal: params.signal,
        timeoutMs: params.timeoutMs,
      });
      if (!response.ok) {
        const errorText = await response.text();
        lastFailure = `provider error ${response.status}: ${errorText.slice(0, 300)}`;
        continue;
      }
      const result = await response.json() as ProviderResponse;
      const choice = result.choices?.[0];
      const text = readableAssistantText(result);
      if (text.trim()) {
        if (!choice?.message?.content) {
          result.choices = [{ index: 0, message: { role: "assistant", content: text }, finish_reason: choice?.finish_reason ?? "stop" }];
        }
        return result;
      }
      lastFailure = `model ${model} returned no visible text (finish_reason=${choice?.finish_reason ?? "unknown"})`;
      console.warn(`OpenAI-compatible ${lastFailure}; trying a compatible fallback request`);
    }
  }
  throw new Error(`OpenAI-compatible provider returned no readable message after fallback retries (${lastFailure})`);
}

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

const RETRY_MAX_RETRIES = 4;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 30_000;
const LLM_REQUEST_TIMEOUT_MS = 150_000;

export function getLLMProviderStatus() {
  const provider = ENV.groqApiKey
    ? "groq"
    : ENV.anthropicApiKey
    ? "anthropic"
    : ENV.openaiApiKey && ENV.openaiApiBase
      ? "openai-compatible"
      : ENV.geminiApiKey
        ? "gemini"
        : ENV.forgeApiKey
          ? "built-in-forge"
          : "unconfigured";
  return {
    configured: provider !== "unconfigured",
    provider,
    requestTimeoutMs: LLM_REQUEST_TIMEOUT_MS,
    maxRetries: RETRY_MAX_RETRIES,
  } as const;
}

type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

const sleep = (ms: number, signal?: AbortSignal | null) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new Error("LLM request aborted."));
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(signal?.reason ?? new Error("LLM request aborted."));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, at - Date.now());
};

// Equal-jitter exponential backoff. The cap/2 floor guarantees a minimum
// delay so a misbehaving caller loop slows down instead of hammering the
// upstream while it keeps returning errors.
const computeBackoffDelay = (
  attempt: number,
  retryAfterMs?: number
): number => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};

// Retries non-2xx responses and network errors with exponential backoff, then
// returns the final Response so callers keep their existing error handling.
const fetchWithBackoff = async (
  url: string,
  init: FetchInit & { timeoutMs?: number }
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      if (init.signal?.aborted) throw init.signal.reason ?? new Error("LLM request aborted.");
      const controller = new AbortController();
      const onAbort = () => controller.abort(init.signal?.reason);
      init.signal?.addEventListener("abort", onAbort, { once: true });
      const timeoutMs = init.timeoutMs ?? LLM_REQUEST_TIMEOUT_MS;
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        const { timeoutMs: _timeoutMs, ...requestInit } = init;
        try {
          response = await fetch(url, { ...requestInit, signal: controller.signal });
        } catch (error) {
          if (controller.signal.aborted && !init.signal?.aborted) {
            throw new Error(`AI_REQUEST_TIMEOUT: The AI service did not respond within ${Math.round(timeoutMs / 1000)} seconds. Retry this summary.`, { cause: error });
          }
          throw error;
        }
      } finally {
        clearTimeout(timeout);
        init.signal?.removeEventListener("abort", onAbort);
      }
      // Preserve the original body for billing, invalid-input and auth errors.
      // Repeating a rejected 400 request hides the useful provider explanation.
      if (response.ok || ![408, 409, 429, 500, 502, 503, 504, 529].includes(response.status) || attempt === RETRY_MAX_RETRIES) {
        return response;
      }

      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
        // Body already settled; nothing to clean up.
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs), init.signal);
    } catch (error) {
      lastError = error;
      if (init.signal?.aborted || attempt === RETRY_MAX_RETRIES ||
          (error instanceof Error && error.message.startsWith("AI_REQUEST_TIMEOUT:"))) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt), init.signal);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("LLM request failed after exhausting retries");
};

async function invokeGemini(params: InvokeParams): Promise<InvokeResult> {
  const ai = new GoogleGenAI({
    apiKey: ENV.geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  const systemInstruction = params.messages
    .filter(message => message.role === "system")
    .map(message => contentToText(message.content))
    .join("\n\n");
  const contents = params.messages
    .filter(message => message.role !== "system" && (message.role === "user" || message.role === "assistant"))
    .map(message => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: contentToText(message.content) }],
    }));

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat: params.responseFormat,
    response_format: params.response_format,
    outputSchema: params.outputSchema,
    output_schema: params.output_schema,
  });

  let response: any;
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents.length > 0 ? contents : "Hello",
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          ...(normalizedResponseFormat?.type === "json_object" || normalizedResponseFormat?.type === "json_schema"
            ? { responseMimeType: "application/json" }
            : {}),
        },
      });
      break;
    } catch (err: any) {
      const errStr = typeof err?.message === "string" ? err.message : JSON.stringify(err);
      const isRateLimit =
        err?.status === "RESOURCE_EXHAUSTED" ||
        err?.status === 429 ||
        err?.code === 429 ||
        errStr.includes("429") ||
        errStr.includes("RESOURCE_EXHAUSTED") ||
        errStr.includes("Quota exceeded") ||
        errStr.includes("rate-limits");

      let retryAfterSec: number | undefined;
      const match =
        errStr.match(/retry in ([0-9.]+)s/i) ||
        errStr.match(/"retryDelay":\s*"([0-9.]+)s"/i);
      if (match && match[1]) {
        const parsed = parseFloat(match[1]);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfterSec = Math.ceil(parsed);
        }
      }

      // Only auto-retry short bursts (<= 8s) once or twice; longer cooldowns should return fast to the user.
      if (isRateLimit && attempt < maxRetries - 1 && (!retryAfterSec || retryAfterSec <= 8)) {
        const delayMs = retryAfterSec ? retryAfterSec * 1000 + 500 : 2500 * Math.pow(2, attempt);
        console.warn(
          `[invokeGemini] Rate limit (429), pausing ${delayMs}ms before retry ${attempt + 1}/${maxRetries - 1}...`
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      if (isRateLimit) {
        const waitHint = retryAfterSec
          ? ` Please wait ~${retryAfterSec} seconds and try again.`
          : " Please wait ~20 seconds and try again.";
        throw new Error(
          `AI_RATE_LIMIT: Free-tier token limit (250k input tokens/min) was temporarily reached.${waitHint} No new API key is needed.`
        );
      }

      // Extract readable message from any Google GenAI JSON error payload so UI never shows raw JSON dumps.
      let readable = errStr;
      try {
        const jsonStart = errStr.indexOf("{");
        if (jsonStart >= 0) {
          const parsedErr = JSON.parse(errStr.slice(jsonStart)) as {
            error?: { message?: string; status?: string };
          };
          if (parsedErr?.error?.message) {
            readable = parsedErr.error.message.split("\n")[0];
          }
        }
      } catch {
        // Keep trimmed fallback below.
      }
      throw new Error(`AI_REQUEST_FAILED: ${readable.slice(0, 260)}`);
    }
  }

  const text = response?.text ?? "";
  return {
    id: `gemini-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model: "gemini-3.8-flash",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop",
      },
    ],
  };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();
  if (ENV.groqApiKey) return invokeGroq(params);
  if (ENV.anthropicApiKey) return invokeAnthropic(params);
  if (ENV.openaiApiKey && ENV.openaiApiBase) return invokeOpenAI(params);
  if (ENV.geminiApiKey && !ENV.forgeApiKey) return invokeGemini(params);

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens,
  } = params;

  const payload: Record<string, unknown> = {
    messages: messages.map(normalizeMessage),
  };

  if (model) {
    payload.model = model;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }

  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetchWithBackoff(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
    signal: params.signal,
    timeoutMs: params.timeoutMs,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

export type ModelInfo = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

export type ModelsResponse = {
  object: string;
  data: ModelInfo[];
};

export async function listLLMModels(): Promise<ModelsResponse> {
  assertApiKey();

  const url = ENV.groqApiKey ? "https://api.groq.com/openai/v1/models" : ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/models`
    : "https://forge.manus.im/v1/models";

  const response = await fetchWithBackoff(url, {
    headers: { authorization: `Bearer ${ENV.groqApiKey || ENV.forgeApiKey}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `List LLM models failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as ModelsResponse;
}
