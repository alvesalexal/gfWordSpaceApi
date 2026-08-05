import { Router } from "express";
import authRoutes from "./auth.routes";
import personRoutes from "./person.routes";
import contentRoutes from "./content.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth/", authRoutes);
router.use("/person/", personRoutes);
router.use("/content/", contentRoutes);
router.use("/dashboard/", dashboardRoutes);

export default router;
