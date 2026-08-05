import DefaultService from "./ServiceDefault";

interface UpdatePersonParams {
  name?: string;
  email?: string;
  phone?: string;
}

export default class PersonService extends DefaultService {
  async getPersonById(id: number) {
    const person = await super.getPersonPrisma().person.findUnique({
      where: { id },
    });

    return person;
  }

  async getAllPerson() {
    return await super.getPersonPrisma().person.findMany();
  }

  async updatePerson(id: number, data: UpdatePersonParams) {
    const person = await super.getPersonPrisma().person.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
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

  async updateAvatar(id: number, urlAvatar: string) {
    const person = await super.getPersonPrisma().person.update({
      where: { id },
      data: { url_avatar: urlAvatar },
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
