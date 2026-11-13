const configuredValue = (...values: (string | undefined)[]) => values.find(value => Boolean(value?.trim()))?.trim();

export function sessionConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const appId = configuredValue(env.MANUS_PROJECT_ID, env.VITE_APP_ID) ?? "firmament-guardian";
  const suppliedSecret = configuredValue(env.MANUS_JWT_SECRET, env.JWT_SECRET);
  const secret = suppliedSecret ?? "firmament-guardian-default-jwt-secret-key";
  if (env.NODE_ENV === "production" && (!suppliedSecret || secret === "firmament-guardian-default-jwt-secret-key" || secret.length < 32)) {
    throw new Error("Production requires a unique MANUS_JWT_SECRET or JWT_SECRET of at least 32 characters.");
  }
  return { appId, secret };
}

export const ENV = {
  appId: configuredValue(process.env.MANUS_PROJECT_ID, process.env.VITE_APP_ID) ?? "firmament-guardian",
  cookieSecret: configuredValue(process.env.MANUS_JWT_SECRET, process.env.JWT_SECRET) ?? "firmament-guardian-default-jwt-secret-key",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: configuredValue(process.env.MANUS_OAUTH_API_URL, process.env.OAUTH_SERVER_URL) ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  manusApiUrl: process.env.MANUS_API_URL ?? "",
  manusApiKey: process.env.MANUS_API_KEY ?? "",
  manusApiBrowserKey: process.env.MANUS_API_BROWSER_KEY ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY?.trim() ?? "",
  groqModel: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  openaiApiBase: process.env.OPENAI_API_BASE ?? process.env.OPENAI_BASE_URL ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};
