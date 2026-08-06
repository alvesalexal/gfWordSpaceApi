import express from "express";
import authController from "../Controllers/authController";
import { authMiddleware } from "../Middleware/auth";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/check-username/:username", authController.checkUsername);
router.put("/set-username", authMiddleware, authController.setUsername);

export default router;
