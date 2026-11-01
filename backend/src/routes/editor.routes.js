import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createFileSchema,
  updateFileSchema,
  fileParamsSchema,
  listFilesSchema
} from "../validators/editor.validator.js";
import {
  listFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile
} from "../controllers/editor.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/files", validate(listFilesSchema), listFiles);
router.post("/files", validate(createFileSchema), createFile);
router.get("/files/:fileId", validate(fileParamsSchema), getFile);
router.patch("/files/:fileId", validate(updateFileSchema), updateFile);
router.delete("/files/:fileId", validate(fileParamsSchema), deleteFile);

export default router;
