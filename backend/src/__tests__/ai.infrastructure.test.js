import { jest } from "@jest/globals";
import { getAIConfig } from "../config/ai.js";
import { createOpenAIProvider } from "../services/ai-provider.service.js";
import { AIServiceError, createAIService } from "../services/ai.service.js";

const baseConfig = {
  provider: "openai",
  model: "gpt-test",
  apiKey: "secret-test-key",
  endpoint: "https://api.openai.com/v1/chat/completions",
  requestTimeoutMs: 100,
  maxInputLength: 100,
  maxOutputLength: 100,
  maxOutputTokens: 50
};

describe("AI infrastructure", () => {
  it("accepts valid provider configuration and rejects unsafe or malformed values without exposing secrets", () => {
    expect(getAIConfig({ AI_API_KEY: "secret-value", AI_MODEL: "gpt-test" })).toMatchObject({
      provider: "openai", model: "gpt-test", endpoint: "https://api.openai.com/v1/chat/completions"
    });
    expect(() => getAIConfig({ AI_API_KEY: "sensitive-key", AI_REQUEST_TIMEOUT_MS: "0" })).toThrow("AI_REQUEST_TIMEOUT_MS");
    expect(() => getAIConfig({ AI_API_KEY: "sensitive-key", AI_PROVIDER: "other" })).toThrow("AI_PROVIDER");
    try {
      getAIConfig({ AI_API_KEY: "sensitive-key\nforged" });
    } catch (error) {
      expect(error.message).not.toContain("sensitive-key");
    }
  });

  it("normalizes successful provider output and provider-reported usage", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "gpt-test-2026",
        choices: [{ message: { content: "Generated safely" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 4, completion_tokens: 3, total_tokens: 7 }
      })
    });
    const provider = createOpenAIProvider({ config: baseConfig, fetchImpl });
    const result = await provider.generate({ messages: [{ role: "user", content: "hello" }], maxOutputTokens: 10 });
    expect(result).toMatchObject({
      content: "Generated safely", provider: "openai", model: "gpt-test-2026", finishReason: "stop",
      usage: { inputTokens: 4, outputTokens: 3, totalTokens: 7, source: "provider" }
    });
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe("Bearer secret-test-key");
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).messages[0].content).toBe("hello");
  });

  it("reports missing usage honestly and maps upstream errors without exposing response bodies", async () => {
    const missingUsage = createOpenAIProvider({
      config: baseConfig,
      fetchImpl: async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: "ok" } }] }) })
    });
    expect((await missingUsage.generate({ messages: [], maxOutputTokens: 1 })).usage).toEqual({
      inputTokens: null, outputTokens: null, totalTokens: null, source: "unavailable"
    });
    const unauthorized = createOpenAIProvider({
      config: baseConfig,
      fetchImpl: async () => ({ ok: false, status: 401, text: async () => "secret provider payload" })
    });
    await expect(unauthorized.generate({ messages: [], maxOutputTokens: 1 })).rejects.toMatchObject({
      code: "AI_PROVIDER_AUTH_FAILED", statusCode: 502
    });
    await expect(unauthorized.generate({ messages: [], maxOutputTokens: 1 })).rejects.not.toThrow("secret provider payload");
  });

  it("enforces authenticated request context and configured input/output limits", async () => {
    const generate = jest.fn().mockResolvedValue({ content: "response", provider: "openai", model: "gpt-test" });
    const service = createAIService({ configProvider: () => baseConfig, providerFactory: () => ({ generate }) });
    await expect(service.generate({ prompt: "hello" })).rejects.toMatchObject({ code: "AI_INVALID_REQUEST", statusCode: 401 });
    await expect(service.generate({ userId: "user-1", prompt: "x".repeat(101) })).rejects.toMatchObject({ code: "AI_INPUT_TOO_LARGE", statusCode: 413 });
    await expect(service.generate({ userId: "user-1", prompt: "hello", maxOutputTokens: 51 })).rejects.toMatchObject({ code: "AI_OUTPUT_LIMIT_EXCEEDED" });
    const result = await service.generate({ userId: "user-1", prompt: "hello" });
    expect(result).toMatchObject({ status: "completed", content: "response", usage: { source: "unavailable" } });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("maps cancellation, timeout, malformed output, and provider failures to safe errors", async () => {
    const configProvider = () => ({ ...baseConfig, requestTimeoutMs: 10 });
    const delayed = createAIService({
      configProvider,
      providerFactory: () => ({ generate: ({ signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("raw upstream detail")), { once: true })) })
    });
    await expect(delayed.generate({ userId: "user-1", prompt: "hello" })).rejects.toMatchObject({ code: "AI_REQUEST_TIMEOUT", statusCode: 504 });

    const controller = new AbortController();
    const cancelled = createAIService({
      configProvider,
      providerFactory: () => ({ generate: ({ signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })) })
    });
    const promise = cancelled.generate({ userId: "user-1", prompt: "hello", signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ code: "AI_REQUEST_CANCELLED", statusCode: 499 });

    const failed = createAIService({ configProvider, providerFactory: () => ({ generate: async () => { throw new Error("secret upstream response"); } }) });
    await expect(failed.generate({ userId: "user-1", prompt: "hello" })).rejects.toMatchObject({ code: "AI_PROVIDER_UNAVAILABLE" });
    const invalidResponse = createAIService({ configProvider, providerFactory: () => ({ generate: async () => ({ content: "x".repeat(101) }) }) });
    await expect(invalidResponse.generate({ userId: "user-1", prompt: "hello" })).rejects.toMatchObject({ code: "AI_OUTPUT_TOO_LARGE" });
    expect(AIServiceError).toBeDefined();
  });
});
