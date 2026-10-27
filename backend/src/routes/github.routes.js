import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { callback, connect, disconnect, repositories, repositoryById, repositoryResource, status, sync } from "../controllers/github.controller.js";
import { validate } from "../middlewares/validate.js";
import { githubRepositoriesSchema, githubResourceSchema } from "../validators/github.validator.js";

const router = Router();
router.use(requireAuth);
router.get("/connect", connect);
router.get("/callback", callback);
router.get("/status", status);
router.delete("/connection", disconnect);
router.get("/repositories", validate(githubRepositoriesSchema), repositories);
router.get("/repositories/by-id/:repositoryId", repositoryById);
router.post("/sync", sync);
router.get("/repositories/:owner/:repo/:resource(detail|branches|commits|pulls|issues|releases|contributors|languages)", validate(githubResourceSchema), repositoryResource);
export default router;
