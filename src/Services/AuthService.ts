import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DefaultService from "./ServiceDefault";
import { getBrazilDate } from "../utils/timezone";

const JWT_SECRET = process.env.JWT_SECRET || "wordspace-secret-key";

interface RegisterParams {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

interface LoginParams {
  login: string;
  password: string;
}

export default class AuthService extends DefaultService {
  async register(data: RegisterParams) {
    const prisma = super.getPersonPrisma();

    if (!data.username || data.username.length < 3 || data.username.length > 20) {
      throw new Error("Username deve ter entre 3 e 20 caracteres.");
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(data.username)) {
      throw new Error("Username deve conter apenas letras, números, _ e .");
    }

    const existingUsername = await prisma.person.findFirst({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error("Username já cadastrado.");
    }

    const existingPerson = await prisma.person.findFirst({
      where: { email: data.email },
    });

    if (existingPerson) {
      throw new Error("Email já cadastrado.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const person = await prisma.person.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone || null,
        created_at: getBrazilDate(),
      },
    });

    if (data.role === "student") {
      await prisma.student.create({
        data: {
          fk_person_id: person.id,
          active: true,
          bio: "",
        },
      });
    } else if (data.role === "teacher") {
      await prisma.teacher.create({
        data: {
          fk_person_id: person.id,
          active: true,
          bio: "",
        },
      });
    }

    const token = jwt.sign({ userId: person.id, role: person.role }, JWT_SECRET, { expiresIn: "7d" });

    return {
      token,
      user: {
        id: person.id,
        name: person.name,
        username: person.username,
        email: person.email,
        role: person.role,
        avatar: person.url_avatar,
      },
    };
  }

  async login(data: LoginParams) {
    const prisma = super.getPersonPrisma();

    const whereClause = data.login.includes("@")
      ? { email: data.login }
      : { username: data.login };

    const person = await prisma.person.findFirst({
      where: whereClause,
    });

    if (!person) {
      throw new Error("Credenciais inválidas.");
    }

    const validPassword = await bcrypt.compare(data.password, person.password);

    if (!validPassword) {
      throw new Error("Credenciais inválidas.");
    }

    const token = jwt.sign({ userId: person.id, role: person.role }, JWT_SECRET, { expiresIn: "7d" });

    return {
      token,
      user: {
        id: person.id,
        name: person.name,
        username: person.username,
        email: person.email,
        role: person.role,
        avatar: person.url_avatar,
      },
    };
  }

  async forgotPassword(email: string) {
    const prisma = super.getPersonPrisma();

    const person = await prisma.person.findFirst({
      where: { email },
    });

    if (!person) {
      throw new Error("Email não encontrado.");
    }

    const resetToken = jwt.sign({ userId: person.id, type: "reset" }, JWT_SECRET, { expiresIn: "15m" });

    return { resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const prisma = super.getPersonPrisma();

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number; type: string };
    } catch {
      throw new Error("Token inválido ou expirado.");
    }

    if (decoded.type !== "reset") {
      throw new Error("Token inválido.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.person.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    return { message: "Senha atualizada com sucesso." };
  }

  async getUserById(userId: number) {
    const prisma = super.getPersonPrisma();

    const person = await prisma.person.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        url_avatar: true,
        phone: true,
        created_at: true,
      },
    });

    return person;
  }
}
