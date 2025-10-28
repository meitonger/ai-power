// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from '../users/users.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PublicModule } from './public/public.module';
import { ChatModule } from './chat/chat.module';
import { RootController } from './root.controller';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    UsersModule,
    VehiclesModule,
    AppointmentsModule,
    PublicModule,
    ChatModule,
  ],
  controllers: [RootController],
})
export class AppModule {}rt class AppModule {}
