import DefaultService from "./ServiceDefault";

export default class DashboardService extends DefaultService {
  async getTeacherDashboard(teacherUserId: number) {
    const prisma = super.getPersonPrisma();

    const teacher = await prisma.teacher.findFirst({
      where: { fk_person_id: teacherUserId },
    });

    if (!teacher) {
      throw new Error("Professor não encontrado.");
    }

    const contents = await prisma.content.findMany({
      where: { fk_teacher_id: teacher.id },
      include: { class: true, Test: true, Comment: true },
      orderBy: { created_at: "desc" },
    });

    const tarefas = contents.filter((c) => c.type === "tarefa");
    const leituras = contents.filter((c) => c.type === "leitura");
    const provas = contents.filter((c) => c.type === "prova");

    const totalAlunos = await prisma.student.count({
      where: { active: true },
    });

    const totalTurmas = await prisma.lecture.count({
      where: { fk_teacher_id: teacher.id },
    });

    return {
      tarefas: tarefas.length,
      leituras: leituras.length,
      provas: provas.length,
      totalAlunos,
      totalTurmas,
      recentContents: contents.slice(0, 5),
    };
  }

  async getStudentDashboard(studentUserId: number) {
    const prisma = super.getPersonPrisma();

    const student = await prisma.student.findFirst({
      where: { fk_person_id: studentUserId },
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const studies = await prisma.study.findMany({
      where: { fk_student_id: student.id },
      include: { class: true },
    });

    const classIds = studies.map((s) => s.fk_class_id);

    const contents = await prisma.content.findMany({
      where: { fk_class_id: { in: classIds } },
      include: { class: true, teacher: { include: { person: true } }, Test: true, Comment: true },
      orderBy: { created_at: "desc" },
    });

    const tarefas = contents.filter((c) => c.type === "tarefa");
    const leituras = contents.filter((c) => c.type === "leitura");
    const provas = contents.filter((c) => c.type === "prova");

    const performs = await prisma.performs.findMany({
      where: { fk_student_id: student.id },
      include: { test: true },
    });

    return {
      tarefas: tarefas.length,
      leituras: leituras.length,
      provas: provas.length,
      provasRealizadas: performs.length,
      totalTurmas: studies.length,
      recentContents: contents.slice(0, 5),
    };
  }

  async getClasses() {
    const prisma = super.getPersonPrisma();

    return await prisma.class.findMany({
      include: {
        _count: { select: { Study: true, Content: true } },
        Study: {
          include: {
            studtent: {
              include: { person: true },
            },
          },
        },
      },
    });
  }

  async createClass(name: string, bio?: string, studentIds?: number[], teacherUserId?: number) {
    const prisma = super.getPersonPrisma();

    const newClass = await prisma.class.create({
      data: {
        name,
        Bio: bio || "",
      },
    });

    if (teacherUserId) {
      const teacher = await prisma.teacher.findFirst({
        where: { fk_person_id: teacherUserId },
      });

      if (teacher) {
        await prisma.lecture.create({
          data: {
            fk_teacher_id: teacher.id,
            fk_class_id: newClass.id,
          },
        });
      }
    }

    if (studentIds && studentIds.length > 0) {
      await prisma.study.createMany({
        data: studentIds.map((studentId) => ({
          fk_student_id: studentId,
          fk_class_id: newClass.id,
        })),
      });
    }

    return newClass;
  }

  async updateClass(id: number, name: string, bio?: string, studentIds?: number[]) {
    const prisma = super.getPersonPrisma();

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        Bio: bio || "",
      },
    });

    if (studentIds !== undefined) {
      await prisma.study.deleteMany({
        where: { fk_class_id: id },
      });

      if (studentIds.length > 0) {
        await prisma.study.createMany({
          data: studentIds.map((studentId) => ({
            fk_student_id: studentId,
            fk_class_id: id,
          })),
        });
      }
    }

    return updatedClass;
  }

  async deleteClass(id: number) {
    const prisma = super.getPersonPrisma();

    return await prisma.class.delete({
      where: { id },
    });
  }

  async enrollStudent(studentUserId: number, classId: number) {
    const prisma = super.getPersonPrisma();

    const student = await prisma.student.findFirst({
      where: { fk_person_id: studentUserId },
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const existing = await prisma.study.findFirst({
      where: {
        fk_student_id: student.id,
        fk_class_id: classId,
      },
    });

    if (existing) {
      throw new Error("Aluno já está matriculado nesta turma.");
    }

    return await prisma.study.create({
      data: {
        fk_student_id: student.id,
        fk_class_id: classId,
      },
      include: { class: true },
    });
  }

  async getTeacherClasses(teacherUserId: number) {
    const prisma = super.getPersonPrisma();

    const teacher = await prisma.teacher.findFirst({
      where: { fk_person_id: teacherUserId },
    });

    if (!teacher) {
      throw new Error("Professor não encontrado.");
    }

    const lectures = await prisma.lecture.findMany({
      where: { fk_teacher_id: teacher.id },
      include: { class: true },
    });

    return lectures.map((l) => l.class);
  }

  async getStudentClasses(studentUserId: number) {
    const prisma = super.getPersonPrisma();

    const student = await prisma.student.findFirst({
      where: { fk_person_id: studentUserId },
    });

    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const studies = await prisma.study.findMany({
      where: { fk_student_id: student.id },
      include: { class: true },
    });

    return studies.map((s) => s.class);
  }
}
