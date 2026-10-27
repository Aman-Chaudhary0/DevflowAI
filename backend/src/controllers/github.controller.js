import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { completeGitHubOAuth, consumeGitHubOAuthState, disconnectGitHub, getGitHubRepositoryById, getGitHubRepositoryData, getGitHubStatus, listGitHubRepositories, startGitHubOAuth, syncGitHub } from "../services/github.service.js";

const frontend = () => process.env.FRONTEND_URL || "http://localhost:3000";

export const connect = asyncHandler(async (req, res) => res.redirect(await startGitHubOAuth(req.user._id)));
export const callback = asyncHandler(async (req, res) => {
  if (req.query.error) {
    const state = await consumeGitHubOAuthState(String(req.query.state || ""));
    return res.redirect(`${frontend()}/dashboard/github?github=${state && state.user.toString() === req.user._id.toString() ? "denied" : "invalid"}`);
  }
  if (!req.query.code || !req.query.state) {
    if (req.query.state) await consumeGitHubOAuthState(String(req.query.state));
    return res.redirect(`${frontend()}/dashboard/github?github=invalid`);
  }
  try {
    await completeGitHubOAuth({ code: String(req.query.code), state: String(req.query.state), userId: req.user._id });
    res.redirect(`${frontend()}/dashboard/github?github=connected`);
  } catch (error) {
    console.warn("GitHub OAuth callback failed", error.name || "Error");
    res.redirect(`${frontend()}/dashboard/github?github=error`);
  }
});
export const status = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await getGitHubStatus(req.user._id), "GitHub status fetched")));
export const disconnect = asyncHandler(async (req, res) => { await disconnectGitHub(req.user._id); res.json(new ApiResponse(200, null, "GitHub disconnected")); });
export const repositories = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await listGitHubRepositories(req.user._id, Number(req.query.page || 1), Number(req.query.perPage || 30)), "Repositories fetched")));
export const repositoryById = asyncHandler(async (req, res) => res.json(new ApiResponse(200, { repository: await getGitHubRepositoryById(req.user._id, req.params.repositoryId) }, "Repository fetched")));
export const repositoryResource = asyncHandler(async (req, res) => {
  const { owner, repo, resource } = req.params;
  const result = await getGitHubRepositoryData(req.user._id, owner, repo, resource, Number(req.query.page || 1), Number(req.query.perPage || 30));
  res.json(new ApiResponse(200, Array.isArray(result?.data) ? { [resource]: result.data, pagination: result.pagination } : { [resource]: result }, "GitHub data fetched"));
});
export const sync = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await syncGitHub(req.user._id), "GitHub synchronization completed")));
