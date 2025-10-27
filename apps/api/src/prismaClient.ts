
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import fs from 'node:fs';

// Provide a sensible default for local development so the API can boot
// without requiring a .env. Prisma reads DATABASE_URL at runtime.
if (!process.env.DATABASE_URL) {
  const candidates = [
    path.resolve(process.cwd(), 'prisma', 'dev.db'),
    path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
    path.resolve(__dirname, '..', 'prisma', 'dev.db'),
  ];
  const dbFile = candidates.find((p) => fs.existsSync(p));
  const url = dbFile ? `file:${dbFile}` : 'file:./prisma/dev.db';
  process.env.DATABASE_URL = url;
}

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], 
});


process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
