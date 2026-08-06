import express from "express";
import contentController from "../Controllers/contentController";
import { authMiddleware, teacherMiddleware, studentMiddleware } from "../Middleware/auth";

const router = express.Router();

router.get("/type/:type", authMiddleware, contentController.getAllByType);
router.get("/my-performs", authMiddleware, studentMiddleware, contentController.getMyPerforms);

router.post("/full-test", authMiddleware, teacherMiddleware, contentController.createFullTest);
router.put("/full-test/:id", authMiddleware, teacherMiddleware, contentController.updateFullTest);

router.post("/test", authMiddleware, teacherMiddleware, contentController.createTest);
router.get("/test/:contentId", authMiddleware, contentController.getTests);
router.delete("/test/:id", authMiddleware, teacherMiddleware, contentController.deleteTest);

router.post("/test/:testId/questions", authMiddleware, teacherMiddleware, contentController.createQuestion);
router.get("/test/:testId/questions", authMiddleware, contentController.getQuestions);
router.put("/question/:id", authMiddleware, teacherMiddleware, contentController.updateQuestion);
router.delete("/question/:id", authMiddleware, teacherMiddleware, contentController.deleteQuestion);

router.post("/test/:testId/submit", authMiddleware, studentMiddleware, contentController.submitTest);
router.get("/test/:testId/performs", authMiddleware, contentController.getTestPerforms);

router.post("/:contentId/comment", authMiddleware, contentController.addComment);
router.put("/comment/:commentId", authMiddleware, contentController.updateComment);
router.delete("/comment/:commentId", authMiddleware, contentController.deleteComment);

router.post("/", authMiddleware, teacherMiddleware, contentController.create);
router.get("/:id", authMiddleware, contentController.getById);
router.put("/:id", authMiddleware, teacherMiddleware, contentController.update);
router.delete("/:id", authMiddleware, teacherMiddleware, contentController.remove);

export default router;
