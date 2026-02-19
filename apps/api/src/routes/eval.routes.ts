import { Router } from "express";
import { evalController } from "../controllers/eval.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { CreateEvalSchema } from "../validators/eval.schema.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(CreateEvalSchema), evalController.create);
router.post("/:id/run", evalController.run);
router.get("/:id/results", evalController.getResults);

export default router;
