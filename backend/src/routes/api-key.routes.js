import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createApiKey,
  listApiKeys,
  getApiKey,
  updateApiKey,
  revokeApiKey,
  getApiKeyUsage
} from "../controllers/api-key.controller.js";
import { createApiKeyValidator, updateApiKeyValidator } from "../validators/api-key.validator.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", validate(createApiKeyValidator), createApiKey);
router.get("/", listApiKeys);
router.get("/:id", getApiKey);
router.patch("/:id", validate(updateApiKeyValidator), updateApiKey);
router.delete("/:id", revokeApiKey);
router.get("/:id/usage", getApiKeyUsage);

export default router;
