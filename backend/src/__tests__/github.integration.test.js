import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import GitHubIntegration from "../models/GitHubIntegration.js";
import GitHubOAuthState from "../models/GitHubOAuthState.js";
import { completeGitHubOAuth, disconnectGitHub, getGitHubRepositoryData, getGitHubStatus, listGitHubRepositories, startGitHubOAuth } from "../services/github.service.js";
import { githubRepositoriesSchema, githubResourceSchema } from "../validators/github.validator.js";

jest.setTimeout(30000);

describe("GitHub integration service", () => {
  let mongo;
  let user;
  let originalFetch;
  const originalEnv = {};

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "github-integration-test" });
    for (const key of ["GITHUB_INTEGRATION_CLIENT_ID", "GITHUB_INTEGRATION_CLIENT_SECRET", "GITHUB_INTEGRATION_CALLBACK_URL", "GITHUB_TOKEN_ENCRYPTION_KEY"]) originalEnv[key] = process.env[key];
    process.env.GITHUB_INTEGRATION_CLIENT_ID = "test-client";
    process.env.GITHUB_INTEGRATION_CLIENT_SECRET = "test-secret";
    process.env.GITHUB_INTEGRATION_CALLBACK_URL = "http://localhost:5000/api/github/callback";
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY = "a".repeat(64);
    await GitHubIntegration.syncIndexes();
    await GitHubOAuthState.syncIndexes();
  });
  afterAll(async () => {
    await mongoose.disconnect(); await mongo.stop();
    for (const [key, value] of Object.entries(originalEnv)) value === undefined ? delete process.env[key] : process.env[key] = value;
  });
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), GitHubIntegration.deleteMany({}), GitHubOAuthState.deleteMany({})]);
    user = await User.create({ name: "GitHub User", email: "github@example.com", password: "StrongPass123!", isVerified: true });
    originalFetch = global.fetch;
  });
  afterEach(() => { global.fetch = originalFetch; });

  it("uses expiring PKCE state, encrypts credentials, and fetches actual GitHub repositories", async () => {
    const authorizationUrl = new URL(await startGitHubOAuth(user._id));
    expect(authorizationUrl.searchParams.get("code_challenge_method")).toBe("S256");
    const state = authorizationUrl.searchParams.get("state");
    const stateRecord = await GitHubOAuthState.findOne({ user: user._id });
    const expectedChallenge = Buffer.from(await import("node:crypto").then(({ createHash }) => createHash("sha256").update(stateRecord.verifier).digest())).toString("base64url");
    expect(authorizationUrl.searchParams.get("code_challenge")).toBe(expectedChallenge);
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "real-test-token", scope: "read:user,repo" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123, login: "octocat", avatar_url: "https://github.com/avatar.png" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 42, name: "hello", full_name: "octocat/hello", owner: { login: "octocat" }, private: true, visibility: "private", default_branch: "main", stargazers_count: 3, forks_count: 1 }] });
    await completeGitHubOAuth({ code: "one-use-code", state, userId: user._id });
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).code_verifier).toBe(stateRecord.verifier);
    const stored = await GitHubIntegration.findOne({ user: user._id }).select("+tokenCiphertext +tokenIv +tokenTag");
    expect(stored.tokenCiphertext).not.toContain("real-test-token");
    expect(JSON.stringify(await getGitHubStatus(user._id))).not.toContain("real-test-token");
    const repos = await listGitHubRepositories(user._id);
    expect(global.fetch.mock.calls[2][1].headers.Authorization).toBe("Bearer real-test-token");
    expect(repos.repositories[0]).toMatchObject({ id: 42, fullName: "octocat/hello", visibility: "private" });
    expect(repos.pagination).toMatchObject({ page: 1, perPage: 30, hasNext: false });
    const otherUser = await User.create({ name: "Isolated User", email: "isolated@example.com", password: "StrongPass123!", isVerified: true });
    await expect(listGitHubRepositories(otherUser._id)).rejects.toThrow("Connect a GitHub account first");
    await expect(completeGitHubOAuth({ code: "again", state, userId: user._id })).rejects.toThrow("invalid, expired");
    await disconnectGitHub(user._id);
    expect(await getGitHubStatus(user._id)).toEqual({ connected: false, account: null });
  });

  it("rejects invalid OAuth configuration and bounds repository page sizes", async () => {
    const oldKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY = "bad";
    await expect(startGitHubOAuth(user._id)).rejects.toThrow("not configured securely");
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY = oldKey;
    const url = new URL(await startGitHubOAuth(user._id));
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, headers: { get: () => '<https://api.github.com/user/repos?page=3&per_page=30>; rel="next", <https://api.github.com/user/repos?page=8&per_page=30>; rel="last"' }, json: async () => [] });
    await expect(listGitHubRepositories(user._id, -1, 10000)).rejects.toThrow("Connect a GitHub account first");
    expect(url.searchParams.get("state")).toBeTruthy();
  });

  it("binds a single-use state to its starting user and respects GitHub Link pagination", async () => {
    const otherUser = await User.create({ name: "Other User", email: "other@example.com", password: "StrongPass123!", isVerified: true });
    const url = new URL(await startGitHubOAuth(user._id));
    await expect(completeGitHubOAuth({ code: "bad-session", state: url.searchParams.get("state"), userId: otherUser._id })).rejects.toThrow("belongs to another session");
    const nextUrl = new URL(await startGitHubOAuth(user._id));
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "page-token", scope: "repo" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123, login: "octocat" }) })
      .mockResolvedValueOnce({ ok: true, headers: { get: () => '<https://api.github.com/user/repos?page=3&per_page=30>; rel="next", <https://api.github.com/user/repos?page=8&per_page=30>; rel="last"' }, json: async () => [] });
    await completeGitHubOAuth({ code: "good-session", state: nextUrl.searchParams.get("state"), userId: user._id });
    const result = await listGitHubRepositories(user._id, 2, 30);
    expect(result.repositories).toEqual([]);
    expect(result.pagination).toMatchObject({ page: 2, perPage: 30, nextPage: 3, lastPage: 8, hasNext: true, hasPrevious: false });
    global.fetch.mockResolvedValueOnce({ ok: true, headers: { get: () => '<https://api.github.com/repos/octocat/hello/branches?page=3&per_page=50>; rel="next", <https://api.github.com/repos/octocat/hello/branches?page=8&per_page=50>; rel="last"' }, json: async () => [{ name: "main", protected: true }] });
    const branches = await getGitHubRepositoryData(user._id, "octocat", "hello", "branches", 2, 50);
    expect(new URL(global.fetch.mock.calls.at(-1)[0]).searchParams.get("per_page")).toBe("50");
    expect(branches.pagination).toMatchObject({ page: 2, perPage: 50, nextPage: 3, lastPage: 8, hasNext: true });
    expect(nextUrl.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("validates page limits and reports upstream permission and rate-limit failures", async () => {
    expect(githubRepositoriesSchema.safeParse({ query: { page: "0", perPage: "101" }, params: {}, body: {} }).success).toBe(false);
    expect(githubResourceSchema.safeParse({ query: { page: "1", perPage: "30" }, params: { owner: "octocat", repo: "hello", resource: "branches" }, body: {} }).success).toBe(true);
    expect(githubResourceSchema.safeParse({ query: { page: "10001" }, params: { owner: "octocat", repo: "hello", resource: "branches" }, body: {} }).success).toBe(false);
    const url = new URL(await startGitHubOAuth(user._id));
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "failure-token", scope: "repo" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123, login: "octocat" }) });
    await completeGitHubOAuth({ code: "failure-case", state: url.searchParams.get("state"), userId: user._id });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 403, headers: { get: (name) => name === "x-ratelimit-remaining" ? "0" : null, has: () => false }, json: async () => ({}) });
    await expect(listGitHubRepositories(user._id)).rejects.toThrow("rate limit reached");
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 403, headers: { get: () => null, has: () => false }, json: async () => ({}) });
    await expect(listGitHubRepositories(user._id)).rejects.toThrow("lacks permission");
  });
});
