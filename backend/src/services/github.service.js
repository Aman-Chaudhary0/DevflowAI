import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import GitHubIntegration from "../models/GitHubIntegration.js";
import GitHubOAuthState from "../models/GitHubOAuthState.js";
import { ApiError } from "../utils/ApiError.js";

const apiBase = "https://api.github.com";
const stateHash = (value) => createHash("sha256").update(value).digest("hex");

function callbackUrl() {
  const value = process.env.GITHUB_INTEGRATION_CALLBACK_URL || "http://localhost:5000/api/github/callback";
  let url;
  try { url = new URL(value); } catch { throw new ApiError(503, "GitHub callback URL is invalid"); }
  if (!['http:', 'https:'].includes(url.protocol) || (process.env.NODE_ENV === "production" && url.protocol !== "https:") || url.search || url.hash) throw new ApiError(503, "GitHub callback URL must be a valid secure callback URL");
  return url.toString();
}

function encryptionKey() {
  const value = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) throw new ApiError(503, "GitHub integration is not configured securely");
  return Buffer.from(value, "hex");
}

function encryptToken(token, prefix = "token") {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return { [`${prefix}Ciphertext`]: ciphertext.toString("base64"), [`${prefix}Iv`]: iv.toString("base64"), [`${prefix}Tag`]: cipher.getAuthTag().toString("base64") };
}

function decryptToken(record, prefix = "token") {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(record[`${prefix}Iv`], "base64"));
  decipher.setAuthTag(Buffer.from(record[`${prefix}Tag`], "base64"));
  return Buffer.concat([decipher.update(Buffer.from(record[`${prefix}Ciphertext`], "base64")), decipher.final()]).toString("utf8");
}

export async function startGitHubOAuth(userId) {
  const clientId = process.env.GITHUB_INTEGRATION_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_INTEGRATION_CLIENT_SECRET) throw new ApiError(503, "GitHub integration OAuth is not configured");
  encryptionKey();
  const redirectUri = callbackUrl();
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  await GitHubOAuthState.create({ stateHash: stateHash(state), user: userId, verifier, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope: "repo", state, code_challenge: challenge, code_challenge_method: "S256" });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function completeGitHubOAuth({ code, state, userId }) {
  const stateRecord = await consumeGitHubOAuthState(state);
  if (!stateRecord || stateRecord.user.toString() !== userId.toString()) throw new ApiError(400, "GitHub authorization state is invalid, expired, or belongs to another session");
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: process.env.GITHUB_INTEGRATION_CLIENT_ID, client_secret: process.env.GITHUB_INTEGRATION_CLIENT_SECRET, code, redirect_uri: callbackUrl(), code_verifier: stateRecord.verifier })
  });
  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) throw new ApiError(502, "GitHub authorization could not be completed");
  const userResponse = await fetch(`${apiBase}/user`, { headers: githubHeaders(tokenData.access_token) });
  if (!userResponse.ok) throw new ApiError(502, "GitHub account could not be verified");
  const profile = await userResponse.json();
  const encrypted = encryptToken(tokenData.access_token);
  await GitHubIntegration.findOneAndUpdate({ user: stateRecord.user }, {
    $set: { githubUserId: String(profile.id), login: profile.login, avatarUrl: profile.avatar_url || "", ...encrypted, ...encryptToken(tokenData.refresh_token || "", "refresh"), tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + Number(tokenData.expires_in) * 1000) : null, scopes: String(tokenData.scope || "").split(",").filter(Boolean), connectedAt: new Date() }
  }, { upsert: true, new: true, runValidators: true });
  return stateRecord.user;
}

export async function consumeGitHubOAuthState(state) {
  if (typeof state !== "string" || state.length < 20 || state.length > 200) return null;
  return GitHubOAuthState.findOneAndDelete({ stateHash: stateHash(state), expiresAt: { $gt: new Date() } });
}

function githubHeaders(token) { return { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "DevFlowAI" }; }

async function integrationFor(userId) {
  const integration = await GitHubIntegration.findOne({ user: userId }).select("+tokenCiphertext +tokenIv +tokenTag");
  if (!integration) throw new ApiError(409, "Connect a GitHub account first");
  if (integration.tokenExpiresAt && integration.tokenExpiresAt <= new Date()) {
    if (!integration.refreshCiphertext || !process.env.GITHUB_INTEGRATION_CLIENT_ID || !process.env.GITHUB_INTEGRATION_CLIENT_SECRET) {
      await GitHubIntegration.deleteOne({ _id: integration._id });
      throw new ApiError(409, "GitHub authorization expired. Reconnect your account.");
    }
    const refreshRecord = await GitHubIntegration.findById(integration._id).select("+refreshCiphertext +refreshIv +refreshTag");
    const response = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: process.env.GITHUB_INTEGRATION_CLIENT_ID, client_secret: process.env.GITHUB_INTEGRATION_CLIENT_SECRET, grant_type: "refresh_token", refresh_token: decryptToken(refreshRecord, "refresh") }) });
    const refreshed = await response.json().catch(() => ({}));
    if (!response.ok || !refreshed.access_token) { await GitHubIntegration.deleteOne({ _id: integration._id }); throw new ApiError(409, "GitHub authorization expired or was revoked. Reconnect your account."); }
    Object.assign(integration, encryptToken(refreshed.access_token), encryptToken(refreshed.refresh_token || decryptToken(refreshRecord, "refresh"), "refresh"), { tokenExpiresAt: new Date(Date.now() + Number(refreshed.expires_in || 28800) * 1000) });
    await integration.save();
  }
  return { integration, headers: githubHeaders(decryptToken(integration)) };
}

function paginationFromLink(link, currentPage, perPage) {
  const links = {};
  String(link || "").replace(/<([^>]+)>;\s*rel="([^"]+)"/g, (_match, href, rel) => { links[rel] = href; return ""; });
  const getPage = (href) => href ? Number(new URL(href).searchParams.get("page") || 1) : null;
  return { page: currentPage, perPage, nextPage: getPage(links.next), previousPage: getPage(links.prev), firstPage: getPage(links.first), lastPage: getPage(links.last), hasNext: !!links.next, hasPrevious: !!links.prev };
}

async function githubRequest(userId, path, pagination) {
  const { headers } = await integrationFor(userId);
  const response = await fetch(`${apiBase}${path}`, { headers });
  if (response.status === 401 || response.status === 403) {
    if (response.status === 401) await GitHubIntegration.deleteOne({ user: userId });
    const limited = response.status === 403 && (response.headers?.get("x-ratelimit-remaining") === "0" || response.headers?.has("retry-after"));
    throw new ApiError(response.status === 401 ? 409 : limited ? 429 : 502, response.status === 401 ? "GitHub authorization expired or was revoked. Reconnect your account." : limited ? "GitHub rate limit reached. Try again later." : "GitHub rejected the request because the integration lacks permission");
  }
  if (!response.ok) throw new ApiError(response.status === 404 ? 404 : 502, response.status === 404 ? "GitHub resource not found" : "GitHub API request failed");
  const data = await response.json();
  return pagination ? { data, pagination: paginationFromLink(response.headers?.get("link"), pagination.page, pagination.perPage) } : data;
}

export async function getGitHubStatus(userId) {
  const record = await GitHubIntegration.findOne({ user: userId }).select("-tokenCiphertext -tokenIv -tokenTag").lean();
  return record ? { connected: true, account: { id: record.githubUserId, login: record.login, avatarUrl: record.avatarUrl }, connectedAt: record.connectedAt, lastSyncedAt: record.lastSyncedAt } : { connected: false, account: null };
}

export async function disconnectGitHub(userId) { await Promise.all([GitHubIntegration.deleteOne({ user: userId }), GitHubOAuthState.deleteMany({ user: userId })]); }

export async function listGitHubRepositories(userId, page = 1, perPage = 30) {
  page = Math.max(1, Math.min(1000, Number(page) || 1));
  perPage = Math.max(1, Math.min(100, Number(perPage) || 30));
  const result = await githubRequest(userId, `/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=updated&per_page=${perPage}&page=${page}`, { page, perPage });
  return { repositories: result.data.map((repo) => ({ id: repo.id, name: repo.name, fullName: repo.full_name, owner: repo.owner.login, description: repo.description || "", url: repo.html_url, private: repo.private, visibility: repo.visibility || (repo.private ? "private" : "public"), language: repo.language, stars: repo.stargazers_count, forks: repo.forks_count, defaultBranch: repo.default_branch, updatedAt: repo.updated_at, openIssuesCount: repo.open_issues_count, size: repo.size, permissions: repo.permissions })), pagination: result.pagination };
}

export async function getGitHubRepositoryData(userId, owner, repo, resource = "detail", page = 1, perPage = 30) {
  const safeOwner = encodeURIComponent(owner); const safeRepo = encodeURIComponent(repo);
  if (resource === "detail") return githubRequest(userId, `/repos/${safeOwner}/${safeRepo}`);
  const endpoints = { branches: "/branches", commits: "/commits", pulls: "/pulls?state=all&sort=updated", issues: "/issues?state=all", releases: "/releases", contributors: "/contributors", languages: "/languages" };
  const basePath = endpoints[resource];
  if (!basePath) throw new ApiError(400, "Unsupported GitHub resource");
  const separator = basePath.includes("?") ? "&" : "?";
  const url = resource === "languages" ? `/repos/${safeOwner}/${safeRepo}${basePath}` : `/repos/${safeOwner}/${safeRepo}${basePath}${separator}per_page=${perPage}&page=${page}`;
  return resource === "languages" ? githubRequest(userId, url) : githubRequest(userId, url, { page, perPage });
}

export async function getGitHubRepositoryById(userId, repositoryId) {
  if (!/^\d{1,20}$/.test(String(repositoryId))) throw new ApiError(400, "Invalid GitHub repository id");
  return githubRequest(userId, `/repositories/${repositoryId}`);
}

export async function syncGitHub(userId) {
  const repositories = [];
  let hasMore = false;
  for (let page = 1; page <= 10; page += 1) {
    const current = await listGitHubRepositories(userId, page, 100);
    repositories.push(...current.repositories);
    hasMore = current.pagination.hasNext;
    if (!hasMore) break;
  }
  const syncedAt = new Date();
  await GitHubIntegration.updateOne({ user: userId }, { $set: { repositories, lastSyncedAt: syncedAt } });
  return { syncedAt, repositoryCount: repositories.length, complete: !hasMore };
}
