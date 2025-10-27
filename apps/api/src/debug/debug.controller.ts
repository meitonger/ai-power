import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Controller('_debug')
export class DebugController {
  @Get('env')
  env() {
    return {
      databaseUrl: process.env.DATABASE_URL,
      cwd: process.cwd(),
      schemaPath: process.env.PRISMA_SCHEMA_PATH ?? 'prisma/schema.prisma',
    };
  }

  @Get('columns')
  async columns() {
    const apptCols = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info('Appointment');`);
    const userCols = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info('User');`);
    return {
      appointment_columns: apptCols.map((r: any) => r.name),
      user_columns: userCols.map((r: any) => r.name),
    };
  }
}
