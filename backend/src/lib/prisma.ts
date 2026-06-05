import { PrismaClient } from '@prisma/client';
import { isProd } from '../config/env';

/**
 * Singleton PrismaClient. In dev we attach it to globalThis so hot-reload
 * (tsx watch) doesn't exhaust the connection pool by creating a new client
 * on every reload.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
