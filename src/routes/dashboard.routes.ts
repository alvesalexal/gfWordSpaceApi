import express from "express";
import dashboardController from "../Controllers/dashboardController";
import { authMiddleware, teacherMiddleware, studentMiddleware } from "../Middleware/auth";

const router = express.Router();

router.get("/teacher", authMiddleware, teacherMiddleware, dashboardController.getTeacherDashboard);
router.get("/student", authMiddleware, studentMiddleware, dashboardController.getStudentDashboard);
router.get("/classes", authMiddleware, dashboardController.getClasses);
router.post("/classes", authMiddleware, teacherMiddleware, dashboardController.createClass);
router.put("/classes/:id", authMiddleware, teacherMiddleware, dashboardController.updateClass);
router.delete("/classes/:id", authMiddleware, teacherMiddleware, dashboardController.deleteClass);
router.post("/enroll", authMiddleware, studentMiddleware, dashboardController.enrollStudent);
router.get("/teacher-classes", authMiddleware, teacherMiddleware, dashboardController.getTeacherClasses);
router.get("/student-classes", authMiddleware, studentMiddleware, dashboardController.getStudentClasses);
router.get("/students", authMiddleware, teacherMiddleware, dashboardController.getStudents);

export default router;
