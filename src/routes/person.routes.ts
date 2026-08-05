import express from "express";
import personController from "../Controllers/personController";
import { authMiddleware } from "../Middleware/auth";

const router = express.Router();

router.get("/:id", personController.getUnique);
router.get("/", personController.getAll);
router.put("/:id", authMiddleware, personController.update);
router.put("/:id/avatar", authMiddleware, personController.updateAvatar);

export default router;
