import { Router } from "express";
import { skillController } from "../controllers/skill.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { CreateSkillSchema, UpdateSkillSchema, IterateSkillSchema } from "../validators/skill.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", skillController.list);
router.post("/", validate(CreateSkillSchema), skillController.create);
router.post("/import", upload.single("archive"), skillController.importSkill);
router.get("/:id", skillController.getById);
router.put("/:id", validate(UpdateSkillSchema), skillController.update);
router.delete("/:id", skillController.delete);
router.get("/:id/versions", skillController.getVersions);
router.post("/:id/publish", skillController.publish);
router.post("/:id/iterate", validate(IterateSkillSchema), skillController.iterate);
router.post("/:id/export", skillController.exportSkill);

// File management routes
router.post("/:id/files", upload.array("files", 20), skillController.uploadFiles);
router.get("/:id/files", skillController.listFiles);
router.get("/:id/files/*", skillController.getFile);
router.get("/:id/download", skillController.downloadSkill);

export default router;
