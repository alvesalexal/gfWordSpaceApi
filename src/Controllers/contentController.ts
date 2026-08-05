import { Response } from "express";
import ContentService from "../Services/ContentService";
import { AuthRequest } from "../Middleware/auth";

const getAllByType = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    const { class_id } = req.query;

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

    const contentService = new ContentService();
    const content = await contentService.create({
      title,
      subTitle,
      message,
      url,
      observation,
      type,
      fk_class_id,
      fk_teacher_id: req.userId,
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

    const contentService = new ContentService();
    const content = await contentService.createFullTest({
      title,
      subTitle,
      message,
      observation,
      fk_class_id,
      fk_teacher_id: req.userId,
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
