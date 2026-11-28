import { Router } from "express";
import { submitContactMessage } from "../controllers/contact.controller.js";
import { validate } from "../middlewares/validate.js";
import { submitContactSchema } from "../validators/contact.validator.js";

const router = Router();

router.post("/", validate(submitContactSchema), submitContactMessage);

export default router;
