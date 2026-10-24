import { Router } from "express";
import {
  deleteProjectDocument,
  deleteProjectFile,
  downloadProjectFile,
  getProjectDocument,
  getProjectFile,
  listProjectDocuments,
  listProjectFiles,
  listWorkspaceFiles,
  renameProjectFile,
  uploadProjectFile,
  createProjectDocument,
  updateProjectDocument
} from "../controllers/projectFiles.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import {
  createDocumentSchema,
  documentParamsSchema,
  listDocumentsSchema,
  listFilesSchema,
  projectFileParamsSchema,
  projectParamsSchema,
  renameFileSchema,
  updateDocumentSchema,
  uploadFileSchema
} from "../validators/project.validator.js";

const router = Router();

router.get("/workspace", requireAuth, validate(listFilesSchema), listWorkspaceFiles);
router.get("/projects/:projectId/files", requireAuth, validate(projectParamsSchema), validate(listFilesSchema), listProjectFiles);
router.get("/projects/:projectId/files/:fileId", requireAuth, validate(projectFileParamsSchema), getProjectFile);
router.post("/projects/:projectId/files/upload", requireAuth, validate(projectParamsSchema), validate(uploadFileSchema), upload.single("file"), uploadProjectFile);
router.get("/projects/:projectId/files/:fileId/download", requireAuth, validate(projectFileParamsSchema), downloadProjectFile);
router.patch("/projects/:projectId/files/:fileId", requireAuth, validate(projectFileParamsSchema), validate(renameFileSchema), renameProjectFile);
router.delete("/projects/:projectId/files/:fileId", requireAuth, validate(projectFileParamsSchema), deleteProjectFile);

router.get("/projects/:projectId/docs", requireAuth, validate(projectParamsSchema), validate(listDocumentsSchema), listProjectDocuments);
router.get("/projects/:projectId/docs/:documentId", requireAuth, validate(documentParamsSchema), getProjectDocument);
router.post("/projects/:projectId/docs", requireAuth, validate(projectParamsSchema), validate(createDocumentSchema), createProjectDocument);
router.patch("/projects/:projectId/docs/:documentId", requireAuth, validate(documentParamsSchema), validate(updateDocumentSchema), updateProjectDocument);
router.delete("/projects/:projectId/docs/:documentId", requireAuth, validate(documentParamsSchema), deleteProjectDocument);

export default router;
