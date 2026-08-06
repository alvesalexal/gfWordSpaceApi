import DefaultService from "./ServiceDefault";

export default class StudentService extends DefaultService {
  async getAllStudents() {
    return await super.getPersonPrisma().student.findMany({
      include: { person: true },
    });
  }
}
