import { Router } from "express";
import { teamController } from "../controllers/team.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { CreateTeamSchema, AddMemberSchema } from "../validators/team.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", teamController.list);
router.post("/", validate(CreateTeamSchema), teamController.create);
router.get("/:id/skills", teamController.getSkills);
router.post("/:id/members", validate(AddMemberSchema), teamController.addMember);

export default router;
