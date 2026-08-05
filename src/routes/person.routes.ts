import express from "express";
import multer from "multer";
import path from "path";
import personController from "../Controllers/personController";
import { authMiddleware } from "../Middleware/auth";

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads", "avatars"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP."));
    }
  },
});

const router = express.Router();

router.get("/:id", personController.getUnique);
router.get("/", personController.getAll);
router.put("/:id", authMiddleware, personController.update);
router.put("/:id/avatar", authMiddleware, upload.single("avatar"), personController.updateAvatar);

export default router;
