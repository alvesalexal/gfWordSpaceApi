import DefaultService from "./ServiceDefault";

interface CreateContentParams {
  title: string;
  subTitle?: string;
  message: string;
  url?: string;
  observation?: string;
  type: string;
  fk_class_id: number;
  fk_teacher_id: number;
}

interface CreateTestParams {
  title: string;
  observation?: string;
  timer_minutes?: number;
  fk_content_id: number;
}

interface CreateQuestionParams {
  title: string;
  type?: string;
  options?: string;
  correct_answer?: string;
  order?: number;
  fk_test_id?: number;
}

interface CreateFullTestParams {
  title: string;
  subTitle?: string;
  message: string;
  observation?: string;
  type?: string;
  fk_class_id: number;
  fk_teacher_id: number;
  timer_minutes?: number;
  questions: CreateQuestionParams[];
}

export default class ContentService extends DefaultService {
  async getAllByType(type: string, classId?: number) {
    const prisma = super.getPersonPrisma();
    const where: any = { type };
    if (classId) {
      where.fk_class_id = classId;
    }

    return await prisma.content.findMany({
      where,
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
  }

  async getById(id: number) {
    const prisma = super.getPersonPrisma();

    return await prisma.content.findUnique({
      where: { id },
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
    });
  }

  async create(data: CreateContentParams) {
    const prisma = super.getPersonPrisma();

    return await prisma.content.create({
      data: {
        title: data.title,
        subTitle: data.subTitle || "",
        message: data.message,
        url: data.url || "",
        observation: data.observation || "",
        type: data.type,
        fk_class_id: data.fk_class_id,
        fk_teacher_id: data.fk_teacher_id,
      },
      include: {
        teacher: { include: { person: true } },
        class: true,
      },
    });
  }

  async update(id: number, data: Partial<CreateContentParams>) {
    const prisma = super.getPersonPrisma();

    return await prisma.content.update({
      where: { id },
      data,
      include: {
        teacher: { include: { person: true } },
        class: true,
      },
    });
  }

  async delete(id: number) {
    const prisma = super.getPersonPrisma();

    const tests = await prisma.test.findMany({ where: { fk_content_id: id } });
    for (const test of tests) {
      await prisma.question.deleteMany({ where: { fk_test_id: test.id } });
      await prisma.performs.deleteMany({ where: { fk_test_id: test.id } });
    }
    await prisma.test.deleteMany({ where: { fk_content_id: id } });
    await prisma.comment.deleteMany({ where: { fk_content_id: id } });
    await prisma.content.delete({ where: { id } });
  }

  async createFullTest(data: CreateFullTestParams) {
    const prisma = super.getPersonPrisma();

    const content = await prisma.content.create({
      data: {
        title: data.title,
        subTitle: data.subTitle || "",
        message: data.message,
        observation: data.observation || "",
        type: data.type || "prova",
        fk_class_id: data.fk_class_id,
        fk_teacher_id: data.fk_teacher_id,
      },
    });

    const test = await prisma.test.create({
      data: {
        title: data.title,
        timer_minutes: data.timer_minutes || 60,
        observation: data.observation || "",
        fk_content_id: content.id,
      },
    });

    if (data.questions && data.questions.length > 0) {
      await prisma.question.createMany({
        data: data.questions.map((q, i) => ({
          title: q.title,
          type: q.type || "multiple_choice",
          options: q.options || null,
          correct_answer: q.correct_answer || null,
          order: q.order ?? i,
          fk_test_id: test.id,
        })),
      });
    }

    return await prisma.content.findUnique({
      where: { id: content.id },
      include: {
        teacher: { include: { person: true } },
        class: true,
        Test: {
          include: { Question: { orderBy: { order: "asc" } } },
        },
      },
    });
  }

  async updateFullTest(contentId: number, data: CreateFullTestParams) {
    const prisma = super.getPersonPrisma();

    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        title: data.title,
        subTitle: data.subTitle || "",
        message: data.message,
        observation: data.observation || "",
        fk_class_id: data.fk_class_id,
      },
    });

    let existingTest = await prisma.test.findFirst({
      where: { fk_content_id: contentId },
    });

    if (!existingTest) {
      existingTest = await prisma.test.create({
        data: {
          title: data.title,
          timer_minutes: data.timer_minutes || 60,
          observation: data.observation || "",
          fk_content_id: contentId,
        },
      });
    } else {
      await prisma.question.deleteMany({ where: { fk_test_id: existingTest.id } });

      await prisma.test.update({
        where: { id: existingTest.id },
        data: {
          title: data.title,
          timer_minutes: data.timer_minutes || 60,
          observation: data.observation || "",
        },
      });
    }

    if (data.questions && data.questions.length > 0) {
      await prisma.question.createMany({
        data: data.questions.map((q, i) => ({
          title: q.title,
          type: q.type || "multiple_choice",
          options: q.options || null,
          correct_answer: q.correct_answer || null,
          order: q.order ?? i,
          fk_test_id: existingTest.id,
        })),
      });
    }

    return await prisma.content.findUnique({
      where: { id: content.id },
      include: {
        teacher: { include: { person: true } },
        class: true,
        Test: {
          include: { Question: { orderBy: { order: "asc" } } },
        },
      },
    });
  }

  async createTest(data: CreateTestParams) {
    const prisma = super.getPersonPrisma();

    return await prisma.test.create({
      data: {
        title: data.title,
        observation: data.observation || "",
        timer_minutes: data.timer_minutes || 60,
        fk_content_id: data.fk_content_id,
      },
    });
  }

  async getTestsByContentId(contentId: number) {
    const prisma = super.getPersonPrisma();

    return await prisma.test.findMany({
      where: { fk_content_id: contentId },
      include: { Question: { orderBy: { order: "asc" } } },
    });
  }

  async deleteTest(id: number) {
    const prisma = super.getPersonPrisma();

    await prisma.question.deleteMany({ where: { fk_test_id: id } });
    await prisma.performs.deleteMany({ where: { fk_test_id: id } });
    await prisma.test.delete({ where: { id } });
  }

  async createQuestion(data: CreateQuestionParams) {
    const prisma = super.getPersonPrisma();

    return await prisma.question.create({
      data: {
        title: data.title,
        type: data.type || "multiple_choice",
        options: data.options || null,
        correct_answer: data.correct_answer || null,
        order: data.order ?? 0,
        fk_test_id: data.fk_test_id,
      },
    });
  }

  async updateQuestion(id: number, data: Partial<CreateQuestionParams>) {
    const prisma = super.getPersonPrisma();

    return await prisma.question.update({
      where: { id },
      data,
    });
  }

  async deleteQuestion(id: number) {
    const prisma = super.getPersonPrisma();

    await prisma.question.delete({ where: { id } });
  }

  async getQuestionsByTestId(testId: number) {
    const prisma = super.getPersonPrisma();

    return await prisma.question.findMany({
      where: { fk_test_id: testId },
      orderBy: { order: "asc" },
    });
  }

  async getStudentByPersonId(personId: number) {
    const prisma = super.getPersonPrisma();
    return await prisma.student.findFirst({
      where: { fk_person_id: personId },
    });
  }

  async addComment(studentId: number, contentId: number, message: string) {
    const prisma = super.getPersonPrisma();

    const student = await prisma.student.findFirst({
      where: { fk_person_id: studentId },
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    return await prisma.comment.create({
      data: {
        message,
        fk_student_id: student.id,
        fk_content_id: contentId,
      },
      include: {
        student: { include: { person: true } },
      },
    });
  }

  async getCommentById(id: number) {
    const prisma = super.getPersonPrisma();
    return await prisma.comment.findUnique({ where: { id } });
  }

  async updateComment(id: number, message: string) {
    const prisma = super.getPersonPrisma();

    return await prisma.comment.update({
      where: { id },
      data: { message, updated_at: new Date() },
      include: {
        student: { include: { person: true } },
      },
    });
  }

  async deleteComment(id: number) {
    const prisma = super.getPersonPrisma();

    await prisma.comment.delete({ where: { id } });
  }

  async submitTest(studentUserId: number, testId: number, answersJson: string) {
    const prisma = super.getPersonPrisma();

    const student = await prisma.student.findFirst({
      where: { fk_person_id: studentUserId },
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const questions = await prisma.question.findMany({
      where: { fk_test_id: testId },
    });

    const answers: Record<string, string> = JSON.parse(answersJson);
    let totalMc = 0;
    let correctMc = 0;

    for (const question of questions) {
      if (question.type === "multiple_choice" && question.correct_answer) {
        totalMc++;
        const studentAnswer = answers[String(question.id)];
        if (studentAnswer && studentAnswer === question.correct_answer) {
          correctMc++;
        }
      }
    }

    const score = totalMc > 0 ? Math.round((correctMc / totalMc) * 10 * 10) / 10 : null;

    const existingPerform = await prisma.performs.findFirst({
      where: {
        fk_student_id: student.id,
        fk_test_id: testId,
      },
    });

    if (existingPerform) {
      return await prisma.performs.update({
        where: { id: existingPerform.id },
        data: { answer: answersJson, score },
        include: { test: true, student: { include: { person: true } } },
      });
    }

    return await prisma.performs.create({
      data: {
        answer: answersJson,
        score,
        fk_student_id: student.id,
        fk_test_id: testId,
      },
      include: { test: true, student: { include: { person: true } } },
    });
  }

  async getPerformsByStudent(studentUserId: number) {
    const prisma = super.getPersonPrisma();

    const student = await prisma.student.findFirst({
      where: { fk_person_id: studentUserId },
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    return await prisma.performs.findMany({
      where: { fk_student_id: student.id },
      include: {
        test: { include: { content: true, Question: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async getPerformsByTestId(testId: number) {
    const prisma = super.getPersonPrisma();

    return await prisma.performs.findMany({
      where: { fk_test_id: testId },
      include: {
        student: { include: { person: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }
}
