import { Router } from "express";
import { wizardController } from "../controllers/wizard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { StartWizardSchema, WizardMessageSchema } from "../validators/wizard.schema.js";

const router = Router();

router.use(authMiddleware);

router.post("/start", validate(StartWizardSchema), wizardController.start);
router.post("/:sessionId/message", validate(WizardMessageSchema), wizardController.sendMessage);
router.get("/:sessionId", wizardController.getSession);

export default router;
