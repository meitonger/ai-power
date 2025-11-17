
import { PrismaClient } from '@prisma/client';
import { ensureDatabaseUrl } from './utils/ensureDatabaseUrl';

ensureDatabaseUrl();

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], 
});


process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
