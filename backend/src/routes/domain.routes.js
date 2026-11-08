import { Router } from "express";
import {
  createDomain,
  deleteDomain,
  getDomain,
  listDomains,
  verifyDomain
} from "../controllers/domain.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createDomainSchema, domainListSchema, domainParamsSchema } from "../validators/domain.validator.js";

const router = Router();

router.post("/", requireAuth, validate(createDomainSchema), createDomain);
router.get("/", requireAuth, validate(domainListSchema), listDomains);
router.get("/:domainId", requireAuth, validate(domainParamsSchema), getDomain);
router.post("/:domainId/verify", requireAuth, validate(domainParamsSchema), verifyDomain);
router.delete("/:domainId", requireAuth, validate(domainParamsSchema), deleteDomain);

export default router;
