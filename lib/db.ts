import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function buildDatasourceUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return undefined;
  }

  const url = new URL(raw);

  // Keep Prisma's pool deliberately small for Neon pooler and Next dev workers.
  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "3");
  }
  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "30");
  }

  return url.toString();
}

const datasourceUrl = buildDatasourceUrl();

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
