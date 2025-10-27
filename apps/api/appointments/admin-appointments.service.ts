// apps/api/appointments/admin-appointments.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../src/notifications/notification.service';
import { randomBytes } from 'crypto';

function computeWindowLockTime(slotStart: Date): Date {
  const d = new Date(slotStart);
  d.setDate(d.getDate() - 3);
  d.setHours(20, 0, 0, 0); // lock at ~8pm three days prior
  return d;
}

@Injectable()
export class AdminAppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifier: NotificationService,
  ) {}

  list() {
    return this.prisma.appointment.findMany({
      orderBy: { slotStart: 'asc' },
      include: { user: true, vehicle: true, services: true, tech: true },
    });
  }

  async markInternalConfirmed(id: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new BadRequestException('Appointment not found');

    const windowLockedAt = computeWindowLockTime(appt.slotStart);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        scheduleState: 'INTERNAL_CONFIRMED',
        windowLockedAt,
      },
      include: { user: true, vehicle: true, services: true, tech: true },
    });
  }

  async sendConfirmation(id: string, expiresHours = 72) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!appt) throw new BadRequestException('Appointment not found');
    if (!appt.user?.email) throw new BadRequestException('User has no email');

    const token = randomBytes(16).toString('hex');
    const expires = new Date(Date.now() + expiresHours * 3600 * 1000);

    await this.prisma.appointment.update({
      where: { id },
      data: {
        scheduleState: 'SENT_TO_CUSTOMER',
        customerConfirmToken: token,
        customerConfirmExpires: expires,
      },
    });

    await this.notifier.sendAppointmentConfirmation(appt.id, token);
    return { ok: true, token, expires };
  }

  async resendConfirmation(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!appt) throw new BadRequestException('Appointment not found');

    if (!appt.customerConfirmToken) {
      return this.sendConfirmation(id);
    }

    await this.notifier.sendAppointmentConfirmation(
      appt.id,
      appt.customerConfirmToken,
    );
    return { ok: true };
  }

  async lockWindowNow(id: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new BadRequestException('Appointment not found');

    const lockTime = computeWindowLockTime(appt.slotStart);
    if (new Date() < lockTime) {
      throw new BadRequestException('Too early to lock window');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { windowLockedAt: new Date() },
    });
  }
}
