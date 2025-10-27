// apps/api/src/public/public.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: with app.setGlobalPrefix('api'), this route becomes /api/public/...
@Controller('public')
export class PublicController {
  @Get('appointments/confirm')
  async confirm(
    @Query('token') token: string,
    @Query('action') action?: string,
  ) {
    if (!token) throw new BadRequestException('token required');

    const appt = await prisma.appointment.findFirst({
      where: { customerConfirmToken: token },
    });
    if (!appt) throw new BadRequestException('invalid token');

    if (appt.customerConfirmExpires && appt.customerConfirmExpires < new Date()) {
      throw new BadRequestException('token expired');
    }

    if (action === 'decline') {
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { scheduleState: 'CUSTOMER_DECLINED' },
      });
      return { ok: true, status: 'DECLINED' };
    } else {
      await prisma.appointment.update({
        where: { id: appt.id },
        data: {
          scheduleState: 'CUSTOMER_CONFIRMED',
          customerConfirmedAt: new Date(),
        },
      });
      return { ok: true, status: 'CONFIRMED' };
    }
  }
}
