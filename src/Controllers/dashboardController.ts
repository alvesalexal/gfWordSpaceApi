import { Response } from "express";
import DashboardService from "../Services/DashboardService";
import StudentService from "../Services/StudentService";
import { AuthRequest } from "../Middleware/auth";

const getTeacherDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado" });
      return;
    }

    const dashboardService = new DashboardService();
    const data = await dashboardService.getTeacherDashboard(req.userId);

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar dashboard" });
  }
};

const getStudentDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado" });
      return;
    }

    const dashboardService = new DashboardService();
    const data = await dashboardService.getStudentDashboard(req.userId);

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar dashboard" });
  }
};

const getClasses = async (req: AuthRequest, res: Response) => {
  try {
    const dashboardService = new DashboardService();
    const classes = await dashboardService.getClasses();

    res.status(200).json(classes);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar turmas" });
  }
};

const createClass = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, studentIds } = req.body;

    if (!name) {
      res.status(400).json({ message: "Nome da turma é obrigatório" });
      return;
    }

    const dashboardService = new DashboardService();
    const newClass = await dashboardService.createClass(name, bio, studentIds, req.userId);

    res.status(201).json(newClass);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao criar turma" });
  }
};

const updateClass = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, bio, studentIds } = req.body;

    if (!name) {
      res.status(400).json({ message: "Nome da turma é obrigatório" });
      return;
    }

    const dashboardService = new DashboardService();
    const updatedClass = await dashboardService.updateClass(Number(id), name, bio, studentIds);

    res.status(200).json(updatedClass);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao atualizar turma" });
  }
};

const deleteClass = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dashboardService = new DashboardService();
    await dashboardService.deleteClass(Number(id));

    res.status(200).json({ message: "Turma excluída com sucesso" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao excluir turma" });
  }
};

const enrollStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;

    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado" });
      return;
    }

    if (!classId) {
      res.status(400).json({ message: "Turma é obrigatória" });
      return;
    }

    const dashboardService = new DashboardService();
    const enrollment = await dashboardService.enrollStudent(req.userId, Number(classId));

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao matricular aluno" });
  }
};

const getTeacherClasses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado" });
      return;
    }

    const dashboardService = new DashboardService();
    const classes = await dashboardService.getTeacherClasses(req.userId);

    res.status(200).json(classes);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar turmas" });
  }
};

const getStudentClasses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado" });
      return;
    }

    const dashboardService = new DashboardService();
    const classes = await dashboardService.getStudentClasses(req.userId);

    res.status(200).json(classes);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar turmas" });
  }
};

const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const studentService = new StudentService();
    const students = await studentService.getAllStudents();

    res.status(200).json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar alunos" });
  }
};

const dashboardController = {
  getTeacherDashboard,
  getStudentDashboard,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  enrollStudent,
  getTeacherClasses,
  getStudentClasses,
  getStudents,
};

export default dashboardController;
