// apps/api/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { ensureDatabaseUrl } from '../src/utils/ensureDatabaseUrl';

ensureDatabaseUrl();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    const url = process.env.DATABASE_URL || '';
    const p = url.startsWith('file:') ? url.slice(5) : url;
    // Basic runtime diagnostics to help local setup
    // eslint-disable-next-line no-console
    console.log(`[Prisma] DATABASE_URL=${url} exists=${p ? fs.existsSync(p) : 'n/a'}`);
    await this.$connect();
  }

  // Called when Nest shuts down (SIGINT/SIGTERM once enableShutdownHooks is on)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
