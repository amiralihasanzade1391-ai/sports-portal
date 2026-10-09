import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * In development, Next.js hot-reloads cause new PrismaClient instances
 * on every reload, which quickly exhausts database connections.
 * This pattern caches the client on `globalThis` to prevent that.
 *
 * In production, a single instance is created normally.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
