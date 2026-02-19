import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validation.middleware.js";
import { RegisterSchema, LoginSchema, RefreshSchema } from "../validators/auth.schema.js";
import { authRateLimit } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/register", authRateLimit, validate(RegisterSchema), authController.register);
router.post("/login", authRateLimit, validate(LoginSchema), authController.login);
router.post("/refresh", validate(RefreshSchema), authController.refresh);
router.post("/logout", authController.logout);

export default router;
