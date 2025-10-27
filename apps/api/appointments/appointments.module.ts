import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { AdminAppointmentsService } from './admin-appointments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../src/notifications/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [AppointmentsService, AdminAppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
