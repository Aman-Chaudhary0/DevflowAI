const DEFAULTS = {
  requestTimeoutMs: 30_000,
  maxInputLength: 20_000,
  maxOutputLength: 40_000,
  maxOutputTokens: 2_048
};

function positiveInteger(value, name, fallback, { max } = {}) {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || (max && parsed > max)) {
    throw new Error(`${name} must be a positive integer${max ? ` no greater than ${max}` : ""}`);
  }
  return parsed;
}

/** Resolve optional AI configuration on demand so unrelated backend startup is unaffected. */
export function getAIConfig(env = process.env) {
  const provider = env.AI_PROVIDER || "openai";
  const model = env.AI_MODEL || "gpt-4o-mini";
  const apiKey = env.AI_API_KEY;

  if (provider !== "openai") {
    throw new Error("AI_PROVIDER must be openai; no other provider adapter is configured");
  }
  if (!/^[A-Za-z0-9._:-]{1,100}$/.test(model)) {
    throw new Error("AI_MODEL must be a valid model identifier");
  }

  const requestTimeoutMs = positiveInteger(env.AI_REQUEST_TIMEOUT_MS, "AI_REQUEST_TIMEOUT_MS", DEFAULTS.requestTimeoutMs, { max: 120_000 });
  const maxInputLength = positiveInteger(env.AI_MAX_INPUT_LENGTH, "AI_MAX_INPUT_LENGTH", DEFAULTS.maxInputLength, { max: 200_000 });
  const maxOutputLength = positiveInteger(env.AI_MAX_OUTPUT_LENGTH, "AI_MAX_OUTPUT_LENGTH", DEFAULTS.maxOutputLength, { max: 200_000 });
  const maxOutputTokens = positiveInteger(env.AI_MAX_OUTPUT_TOKENS, "AI_MAX_OUTPUT_TOKENS", DEFAULTS.maxOutputTokens, { max: 16_384 });

  if (!apiKey || !apiKey.trim()) {
    throw new Error("AI_API_KEY is required to use the configured AI provider");
  }
  if (apiKey.length > 500 || /[\r\n]/.test(apiKey)) {
    throw new Error("AI_API_KEY is malformed");
  }

  return Object.freeze({
    provider,
    model,
    apiKey,
    endpoint: "https://api.openai.com/v1/chat/completions",
    requestTimeoutMs,
    maxInputLength,
    maxOutputLength,
    maxOutputTokens
  });
}
