import { Router } from "express";
import { skillController } from "../controllers/skill.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { CreateSkillSchema, UpdateSkillSchema, IterateSkillSchema, ImportSkillSchema } from "../validators/skill.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", skillController.list);
router.post("/", validate(CreateSkillSchema), skillController.create);
router.post("/import", validate(ImportSkillSchema), skillController.importSkill);
router.get("/:id", skillController.getById);
router.put("/:id", validate(UpdateSkillSchema), skillController.update);
router.delete("/:id", skillController.delete);
router.get("/:id/versions", skillController.getVersions);
router.post("/:id/publish", skillController.publish);
router.post("/:id/iterate", validate(IterateSkillSchema), skillController.iterate);
router.post("/:id/export", skillController.exportSkill);

export default router;
