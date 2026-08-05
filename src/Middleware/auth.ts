import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "wordspace-secret-key";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido." });
  }
};

export const teacherMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== "teacher") {
    res.status(403).json({ message: "Acesso negado. Apenas professores." });
    return;
  }
  next();
};

export const studentMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== "student") {
    res.status(403).json({ message: "Acesso negado. Apenas alunos." });
    return;
  }
  next();
};
