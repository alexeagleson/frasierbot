import { PrismaClient } from "@prisma/client";

export const prismaConnection = new PrismaClient({
  datasources: {
    db: {
      url: `sqlserver://${process.env.DB_DOMAIN}:1433;database=${process.env.DB_NAME};user=${process.env.DB_USERNAME};password=${process.env.DB_PASSWORD};trustServerCertificate=true`,
    },
  },
});