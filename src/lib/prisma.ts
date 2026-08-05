import { PrismaClient } from "@prisma/client";
import { toBrazilTimezone } from "../utils/timezone";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

prisma.$use(async (params, next) => {
  const result = await next(params);

  if (result && typeof result === "object") {
    convertDatesToBrazilTimezone(result);
  }

  return result;
});

function convertDatesToBrazilTimezone(obj: any): void {
  if (obj === null || obj === undefined) return;

  if (obj instanceof Date) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach(convertDatesToBrazilTimezone);
    return;
  }

  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (obj[key] instanceof Date) {
        obj[key] = toBrazilTimezone(obj[key]);
      } else if (typeof obj[key] === "object") {
        convertDatesToBrazilTimezone(obj[key]);
      }
    }
  }
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
