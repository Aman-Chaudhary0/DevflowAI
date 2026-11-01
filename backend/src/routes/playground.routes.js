import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createPlaygroundSchema,
  updatePlaygroundSchema,
  playgroundParamsSchema,
  listPlaygroundsSchema
} from "../validators/playground.validator.js";
import {
  listPlaygrounds,
  getPlayground,
  createPlayground,
  updatePlayground,
  deletePlayground
} from "../controllers/playground.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", validate(listPlaygroundsSchema), listPlaygrounds);
router.post("/", validate(createPlaygroundSchema), createPlayground);
router.get("/:id", validate(playgroundParamsSchema), getPlayground);
router.patch("/:id", validate(updatePlaygroundSchema), updatePlayground);
router.delete("/:id", validate(playgroundParamsSchema), deletePlayground);

export default router;
