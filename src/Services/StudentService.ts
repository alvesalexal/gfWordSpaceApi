import DefaultService from "./ServiceDefault";

export default class StudentService extends DefaultService {
  async getStudentById(id: number) {
    const student = await super.getPersonPrisma().student.findUnique({
      where: { id },
      include: { person: true },
    });

    return student;
  }

  async getAllStudents() {
    return await super.getPersonPrisma().student.findMany({
      include: { person: true },
    });
  }
}
