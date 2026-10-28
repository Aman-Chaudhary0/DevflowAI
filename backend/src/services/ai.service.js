import { randomUUID } from "node:crypto";
import { getAIConfig } from "../config/ai.js";
import { aiGenerationSchema } from "../validators/ai.validator.js";
import { AIProviderError, createOpenAIProvider } from "./ai-provider.service.js";

export class AIServiceError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function safeConfig() {
  try {
    return getAIConfig();
  } catch (error) {
    throw new AIServiceError("AI_NOT_CONFIGURED", error.message, 503);
  }
}

export function createAIService({ configProvider = safeConfig, providerFactory = createOpenAIProvider, now = Date.now } = {}) {
  return Object.freeze({
    async generate(request) {
      const actorId = request?.userId === undefined || request?.userId === null ? "" : String(request.userId);
      if (!actorId.trim()) {
        throw new AIServiceError("AI_INVALID_REQUEST", "An authenticated user context is required", 401);
      }

      const parsed = aiGenerationSchema.safeParse({
        ...(request.prompt !== undefined ? { prompt: request.prompt } : {}),
        ...(request.messages !== undefined ? { messages: request.messages } : {}),
        ...(request.maxOutputTokens !== undefined ? { maxOutputTokens: request.maxOutputTokens } : {})
      });
      if (!parsed.success) {
        throw new AIServiceError("AI_INVALID_REQUEST", "Invalid AI request", 400);
      }

      const config = configProvider();
      const messages = parsed.data.messages || [{ role: "user", content: parsed.data.prompt }];
      const inputLength = messages.reduce((total, message) => total + message.content.length, 0);
      if (inputLength > config.maxInputLength) {
        throw new AIServiceError("AI_INPUT_TOO_LARGE", "AI input exceeds the configured limit", 413);
      }

      const maxOutputTokens = parsed.data.maxOutputTokens ?? config.maxOutputTokens;
      if (maxOutputTokens > config.maxOutputTokens) {
        throw new AIServiceError("AI_OUTPUT_LIMIT_EXCEEDED", "Requested output exceeds the configured limit", 400);
      }

      const startedAt = now();
      const controller = new AbortController();
      const onAbort = () => controller.abort(request.signal?.reason);
      if (request.signal?.aborted) onAbort();
      else request.signal?.addEventListener("abort", onAbort, { once: true });
      const timeout = setTimeout(() => controller.abort(new Error("timeout")), config.requestTimeoutMs);

      try {
        const provider = providerFactory({ config });
        if (!provider || typeof provider.generate !== "function") {
          throw new AIServiceError("AI_CAPABILITY_UNSUPPORTED", "Configured AI provider does not support text generation", 501);
        }

        const result = await provider.generate({ messages, maxOutputTokens, signal: controller.signal });
        if (typeof result?.content !== "string" || !result.content.trim()) {
          throw new AIServiceError("AI_INVALID_RESPONSE", "AI provider returned an invalid response", 502);
        }
        if (result.content.length > config.maxOutputLength) {
          throw new AIServiceError("AI_OUTPUT_TOO_LARGE", "AI response exceeded the configured limit", 502);
        }

        return {
          id: randomUUID(),
          status: "completed",
          content: result.content,
          provider: result.provider,
          model: result.model,
          finishReason: result.finishReason ?? null,
          usage: {
            actorId,
            ...(result.usage || { inputTokens: null, outputTokens: null, totalTokens: null, source: "unavailable" })
          },
          requestDurationMs: Math.max(0, now() - startedAt)
        };
      } catch (error) {
        if (request.signal?.aborted) {
          throw new AIServiceError("AI_REQUEST_CANCELLED", "AI request was cancelled", 499);
        }
        if (controller.signal.aborted) {
          throw new AIServiceError("AI_REQUEST_TIMEOUT", "AI request timed out", 504);
        }
        if (error instanceof AIServiceError) throw error;
        if (error instanceof AIProviderError) {
          throw new AIServiceError(error.code, error.message, error.statusCode);
        }
        throw new AIServiceError("AI_PROVIDER_UNAVAILABLE", "AI provider is temporarily unavailable", 503);
      } finally {
        clearTimeout(timeout);
        request.signal?.removeEventListener("abort", onAbort);
      }
    }
  });
}

const aiService = createAIService();
export default aiService;
