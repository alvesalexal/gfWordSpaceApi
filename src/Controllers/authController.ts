import { Request, Response } from "express";
import AuthService from "../Services/AuthService";
import { AuthRequest } from "../Middleware/auth";

const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, role, phone } = req.body;

    if (!name || !username || !email || !password || !role) {
      res.status(400).json({ message: "Nome, username, email, senha e perfil são obrigatórios." });
      return;
    }

    if (role !== "teacher" && role !== "student") {
      res.status(400).json({ message: "Perfil deve ser 'teacher' ou 'student'." });
      return;
    }

    const authService = new AuthService();
    const result = await authService.register({ name, username, email, password, role, phone });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Erro ao cadastrar." });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email e senha são obrigatórios." });
      return;
    }

    const authService = new AuthService();
    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Erro ao fazer login." });
  }
};

const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const authService = new AuthService();
    const user = await authService.getUserById(req.userId);

    if (!user) {
      res.status(404).json({ message: "Usuário não encontrado." });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar usuário." });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email é obrigatório." });
      return;
    }

    const authService = new AuthService();
    const result = await authService.forgotPassword(email);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Erro ao solicitar recuperação de senha." });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: "Token e nova senha são obrigatórios." });
      return;
    }

    const authService = new AuthService();
    const result = await authService.resetPassword(token, password);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Erro ao redefinir senha." });
  }
};

const authController = { register, login, getMe, forgotPassword, resetPassword };

export default authController;
