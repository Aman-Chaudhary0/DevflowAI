import { getAIConfig } from "../config/ai.js";

export class AIProviderError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function providerFailure(response) {
  if (response.status === 401 || response.status === 403) {
    return new AIProviderError("AI_PROVIDER_AUTH_FAILED", "AI provider authentication failed; check server configuration", 502);
  }
  if (response.status === 429) {
    return new AIProviderError("AI_PROVIDER_RATE_LIMITED", "AI provider rate limit reached", 429);
  }
  if (response.status === 408 || response.status === 504) {
    return new AIProviderError("AI_PROVIDER_TIMEOUT", "AI provider request timed out", 504);
  }
  return new AIProviderError("AI_PROVIDER_UNAVAILABLE", "AI provider is temporarily unavailable", 503);
}

export function createOpenAIProvider({ config = getAIConfig(), fetchImpl = globalThis.fetch } = {}) {
  return Object.freeze({
    id: "openai",
    supportsStreaming: false,
    async generate({ messages, maxOutputTokens, signal }) {
      let response;
      try {
        response = await fetchImpl(config.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            max_tokens: maxOutputTokens
          }),
          signal
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "AI provider is temporarily unavailable", 503);
      }

      if (!response.ok) throw providerFailure(response);

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new AIProviderError("AI_INVALID_RESPONSE", "AI provider returned an invalid response", 502);
      }

      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new AIProviderError("AI_INVALID_RESPONSE", "AI provider returned an invalid response", 502);
      }

      const usage = payload.usage;
      return {
        content,
        provider: "openai",
        model: typeof payload.model === "string" ? payload.model : config.model,
        finishReason: typeof payload.choices?.[0]?.finish_reason === "string" ? payload.choices[0].finish_reason : null,
        usage: {
          inputTokens: Number.isSafeInteger(usage?.prompt_tokens) ? usage.prompt_tokens : null,
          outputTokens: Number.isSafeInteger(usage?.completion_tokens) ? usage.completion_tokens : null,
          totalTokens: Number.isSafeInteger(usage?.total_tokens) ? usage.total_tokens : null,
          source: usage && Number.isSafeInteger(usage.total_tokens) ? "provider" : "unavailable"
        }
      };
    }
  });
}

export function createOllamaProvider({ config = getAIConfig(), fetchImpl = globalThis.fetch } = {}) {
  return Object.freeze({
    id: "ollama",
    supportsStreaming: false,
    async generate({ messages, maxOutputTokens, signal }) {
      let response;
      try {
        response = await fetchImpl(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: config.model,
            messages,
            stream: false,
            think: false,
            options: { num_predict: maxOutputTokens }
          }),
          signal
        });
      } catch (error) {
        if (signal?.aborted) throw error;
        throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "Cannot reach local Ollama. Start Ollama and ensure it is listening on port 11434.", 503);
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new AIProviderError("AI_MODEL_UNAVAILABLE", `Local model ${config.model} is not installed. Run ollama pull ${config.model}.`, 503);
        }
        if (response.status === 429) {
          throw new AIProviderError("AI_PROVIDER_RATE_LIMITED", "Local Ollama is busy; try again shortly", 429);
        }
        throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "Local Ollama could not complete the request", 503);
      }

      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new AIProviderError("AI_INVALID_RESPONSE", "Local Ollama returned an invalid response", 502);
      }

      const content = payload?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new AIProviderError("AI_INVALID_RESPONSE", "Local Ollama returned an invalid response", 502);
      }

      const inputTokens = Number.isSafeInteger(payload.prompt_eval_count) ? payload.prompt_eval_count : null;
      const outputTokens = Number.isSafeInteger(payload.eval_count) ? payload.eval_count : null;
      const totalTokens = inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null;
      return {
        content,
        provider: "ollama",
        model: typeof payload.model === "string" ? payload.model : config.model,
        finishReason: typeof payload.done_reason === "string" ? payload.done_reason : null,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          source: totalTokens !== null ? "provider" : "unavailable"
        }
      };
    }
  });
}

export function createAIProvider(options = {}) {
  const config = options.config || getAIConfig();
  if (config.provider === "ollama") return createOllamaProvider({ ...options, config });
  if (config.provider === "openai") return createOpenAIProvider({ ...options, config });
  throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "The configured AI provider is unavailable", 503);
}

export async function listConfiguredAIModels({ config = getAIConfig(), fetchImpl = globalThis.fetch } = {}) {
  if (config.provider === "openai") {
    return [{ id: config.model, name: config.model, provider: "openai" }];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(config.requestTimeoutMs, 5_000));
  try {
    const response = await fetchImpl(config.modelsEndpoint, { signal: controller.signal });
    if (!response.ok) throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "Local Ollama is unavailable", 503);
    const payload = await response.json();
    const installedModels = Array.isArray(payload?.models) ? payload.models : [];
    const installed = installedModels.some((model) => model?.name === config.model || model?.model === config.model);
    return installed ? [{ id: config.model, name: config.model, provider: "ollama" }] : [];
  } catch (error) {
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "Cannot reach local Ollama. Start Ollama and ensure it is listening on port 11434.", 503);
  } finally {
    clearTimeout(timeout);
  }
}
