// apps/api/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  // Called when Nest shuts down (SIGINT/SIGTERM once enableShutdownHooks is on)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
