import prisma from "../lib/prisma";

export default class DefaultService {
  getPersonPrisma() {
    return prisma;
  }
}
