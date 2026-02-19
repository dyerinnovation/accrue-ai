import { Router } from "express";
import authRoutes from "./auth.routes.js";
import skillRoutes from "./skill.routes.js";
import teamRoutes from "./team.routes.js";
import evalRoutes from "./eval.routes.js";
import wizardRoutes from "./wizard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/skills", skillRoutes);
router.use("/teams", teamRoutes);
router.use("/evals", evalRoutes);
router.use("/wizard", wizardRoutes);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
