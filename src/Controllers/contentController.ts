import { Response } from "express";
import ContentService from "../Services/ContentService";
import { AuthRequest } from "../Middleware/auth";
import prisma from "../lib/prisma";

async function getTeacherIdByPersonId(personId: number): Promise<number> {
  const teacher = await prisma.teacher.findFirst({
    where: { fk_person_id: personId },
  });
  if (!teacher) {
    throw new Error("Professor não encontrado.");
  }
  return teacher.id;
}

const getAllByType = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    const { class_id } = req.query;

    if (req.userRole === "student" && req.userId) {
      const student = await prisma.student.findFirst({
        where: { fk_person_id: req.userId },
      });

      if (!student) {
        res.status(401).json({ message: "Aluno não encontrado." });
        return;
      }

      const studies = await prisma.study.findMany({
        where: { fk_student_id: student.id },
        select: { fk_class_id: true },
      });

      const classIds = studies.map((s) => s.fk_class_id);

      const contents = await prisma.content.findMany({
        where: {
          type,
          fk_class_id: { in: classIds },
        },
        include: {
          teacher: { include: { person: true } },
          class: true,
          Test: {
            include: { Question: { orderBy: { order: "asc" } } },
          },
          Comment: {
            include: { student: { include: { person: true } } },
            orderBy: { created_at: "desc" },
          },
        },
        orderBy: { created_at: "desc" },
      });

      res.status(200).json(contents);
      return;
    }

    const contentService = new ContentService();
    const contents = await contentService.getAllByType(type, class_id ? Number(class_id) : undefined);

    res.status(200).json(contents);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar conteúdos." });
  }
};

const getById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const contentService = new ContentService();
    const content = await contentService.getById(id);

    if (!content) {
      res.status(404).json({ message: "Conteúdo não encontrado." });
      return;
    }

    if (req.userRole === "student" && req.userId) {
      const student = await prisma.student.findFirst({
        where: { fk_person_id: req.userId },
      });

      if (!student) {
        res.status(401).json({ message: "Aluno não encontrado." });
        return;
      }

      const study = await prisma.study.findFirst({
        where: {
          fk_student_id: student.id,
          fk_class_id: content.fk_class_id,
        },
      });

      if (!study) {
        res.status(403).json({ message: "Acesso negado. Você não está matriculado nesta turma." });
        return;
      }
    }

    res.status(200).json(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar conteúdo." });
  }
};

const create = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subTitle, message, url, observation, type, fk_class_id } = req.body;

    if (!title || !message || !type || !fk_class_id) {
      res.status(400).json({ message: "Título, mensagem, tipo e turma são obrigatórios." });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const teacherId = await getTeacherIdByPersonId(req.userId);

    const contentService = new ContentService();
    const content = await contentService.create({
      title,
      subTitle,
      message,
      url,
      observation,
      type,
      fk_class_id,
      fk_teacher_id: teacherId,
    });

    res.status(201).json(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao criar conteúdo." });
  }
};

const update = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const contentService = new ContentService();
    const content = await contentService.update(id, req.body);

    res.status(200).json(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao atualizar conteúdo." });
  }
};

const remove = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const contentService = new ContentService();
    await contentService.delete(id);

    res.status(200).json({ message: "Conteúdo removido." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao remover conteúdo." });
  }
};

const createFullTest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subTitle, message, observation, fk_class_id, timer_minutes, questions } = req.body;

    if (!title || !message || !fk_class_id) {
      res.status(400).json({ message: "Título, descrição e turma são obrigatórios." });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const teacherId = await getTeacherIdByPersonId(req.userId);

    const contentService = new ContentService();
    const content = await contentService.createFullTest({
      title,
      subTitle,
      message,
      observation,
      fk_class_id,
      fk_teacher_id: teacherId,
      timer_minutes,
      questions: questions || [],
    });

    res.status(201).json(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao criar prova." });
  }
};

const updateFullTest = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, subTitle, message, observation, fk_class_id, timer_minutes, questions } = req.body;

    if (!title || !message || !fk_class_id) {
      res.status(400).json({ message: "Título, descrição e turma são obrigatórios." });
      return;
    }

    const contentService = new ContentService();
    const content = await contentService.updateFullTest(id, {
      title,
      subTitle,
      message,
      observation,
      fk_class_id,
      fk_teacher_id: 0,
      timer_minutes,
      questions: questions || [],
    });

    res.status(200).json(content);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao atualizar prova." });
  }
};

const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, observation, timer_minutes, fk_content_id } = req.body;

    if (!title || !fk_content_id) {
      res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
      return;
    }

    const contentService = new ContentService();
    const test = await contentService.createTest({
      title,
      observation,
      timer_minutes,
      fk_content_id,
    });

    res.status(201).json(test);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao criar prova." });
  }
};

const getTests = async (req: AuthRequest, res: Response) => {
  try {
    const contentId = Number(req.params.contentId);
    const contentService = new ContentService();
    const tests = await contentService.getTestsByContentId(contentId);

    res.status(200).json(tests);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar provas." });
  }
};

const deleteTest = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const contentService = new ContentService();
    await contentService.deleteTest(id);

    res.status(200).json({ message: "Prova removida." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao remover prova." });
  }
};

const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const { title, type, options, correct_answer, order } = req.body;

    if (!title) {
      res.status(400).json({ message: "Título da questão é obrigatório." });
      return;
    }

    const contentService = new ContentService();
    const question = await contentService.createQuestion({
      title,
      type,
      options,
      correct_answer,
      order,
      fk_test_id: Number(testId),
    });

    res.status(201).json(question);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao criar questão." });
  }
};

const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const contentService = new ContentService();
    const question = await contentService.updateQuestion(id, req.body);

    res.status(200).json(question);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao atualizar questão." });
  }
};

const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const contentService = new ContentService();
    await contentService.deleteQuestion(id);

    res.status(200).json({ message: "Questão removida." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao remover questão." });
  }
};

const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const testId = Number(req.params.testId);
    const contentService = new ContentService();
    const questions = await contentService.getQuestionsByTestId(testId);

    res.status(200).json(questions);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar questões." });
  }
};

const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const contentId = Number(req.params.contentId);

    if (!message) {
      res.status(400).json({ message: "Mensagem é obrigatória." });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const contentService = new ContentService();
    const comment = await contentService.addComment(req.userId, contentId, message);

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao adicionar comentário." });
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.commentId);
    const contentService = new ContentService();
    await contentService.deleteComment(id);

    res.status(200).json({ message: "Comentário removido." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao remover comentário." });
  }
};

const submitTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      res.status(400).json({ message: "Respostas são obrigatórias." });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const contentService = new ContentService();
    const perform = await contentService.submitTest(
      req.userId,
      Number(testId),
      JSON.stringify(answers)
    );

    res.status(201).json(perform);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao enviar prova." });
  }
};

const getMyPerforms = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const contentService = new ContentService();
    const performs = await contentService.getPerformsByStudent(req.userId);

    res.status(200).json(performs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar provas realizadas." });
  }
};

const getTestPerforms = async (req: AuthRequest, res: Response) => {
  try {
    const testId = Number(req.params.testId);
    const contentService = new ContentService();
    const performs = await contentService.getPerformsByTestId(testId);

    res.status(200).json(performs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Erro ao buscar respostas." });
  }
};

const contentController = {
  getAllByType,
  getById,
  create,
  update,
  remove,
  createFullTest,
  updateFullTest,
  createTest,
  getTests,
  deleteTest,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,
  addComment,
  deleteComment,
  submitTest,
  getMyPerforms,
  getTestPerforms,
};

export default contentController;
