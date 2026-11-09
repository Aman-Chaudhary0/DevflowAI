import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  getCatalog,
  listIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  disconnectIntegration
} from "../controllers/integration.controller.js";
import { createIntegrationValidator, updateIntegrationValidator } from "../validators/integration.validator.js";

const router = express.Router();

router.get("/catalog", getCatalog);

router.use(requireAuth);

router.get("/", listIntegrations);
router.get("/:provider", getIntegration);
router.post("/:provider/connect", validate(createIntegrationValidator), createIntegration);
router.patch("/:provider/settings", validate(updateIntegrationValidator), updateIntegration);
router.delete("/:provider", disconnectIntegration);

export default router;
