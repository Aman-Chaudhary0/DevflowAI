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
