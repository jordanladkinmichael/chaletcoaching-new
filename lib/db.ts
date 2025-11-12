import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Ленивая инициализация Prisma с настройками для предотвращения блокировки
export const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  // Не подключаемся к БД при инициализации - подключение произойдет при первом запросе
});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
