import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createSnippetSchema,
  updateSnippetSchema,
  snippetParamsSchema,
  favoriteSnippetSchema,
  listSnippetsSchema
} from "../validators/snippet.validator.js";
import {
  listSnippets,
  getStats,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  setFavorite
} from "../controllers/snippet.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", validate(listSnippetsSchema), listSnippets);
router.get("/stats", getStats);
router.post("/", validate(createSnippetSchema), createSnippet);
router.get("/:id", validate(snippetParamsSchema), getSnippet);
router.patch("/:id", validate(updateSnippetSchema), updateSnippet);
router.delete("/:id", validate(snippetParamsSchema), deleteSnippet);
router.patch("/:id/favorite", validate(favoriteSnippetSchema), setFavorite);

export default router;
