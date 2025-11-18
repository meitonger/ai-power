// apps/api/appointments/admin-appointments.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
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
  private readonly log = new Logger(AdminAppointmentsService.name);

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

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        scheduleState: 'INTERNAL_CONFIRMED',
        windowLockedAt,
      },
      include: { user: true, vehicle: true, services: true, tech: true },
    });

    await this.notifyCustomerOfConfirmation(updated);
    return updated;
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

  async setDraft(id: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new BadRequestException('Appointment not found');

    return this.prisma.appointment.update({
      where: { id },
      data: {
        scheduleState: 'DRAFT',
        customerConfirmToken: null,
        customerConfirmExpires: null,
        customerConfirmedAt: null,
      },
      include: { user: true, vehicle: true, services: true, tech: true },
    });
  }

  async customerConfirm(id: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new BadRequestException('Appointment not found');

    return this.prisma.appointment.update({
      where: { id },
      data: {
        scheduleState: 'CUSTOMER_CONFIRMED',
        customerConfirmedAt: new Date(),
      },
      include: { user: true, vehicle: true, services: true, tech: true },
    });
  }

  async updateScheduleState(id: string, state: string) {
    const validStates = ['DRAFT', 'INTERNAL_CONFIRMED', 'SENT_TO_CUSTOMER', 'CUSTOMER_CONFIRMED', 'CUSTOMER_DECLINED', 'CANCELLED'];
    if (!validStates.includes(state)) {
      throw new BadRequestException(`Invalid state: ${state}. Must be one of: ${validStates.join(', ')}`);
    }

    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new BadRequestException('Appointment not found');

    return this.prisma.appointment.update({
      where: { id },
      data: { scheduleState: state },
      include: { user: true, vehicle: true, services: true, tech: true },
    });
  }

  async updateDispatchStatus(id: string, status: string) {
    const validStatuses = ['UNASSIGNED', 'ASSIGNED', 'IN_ROUTE', 'COMPLETE'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new BadRequestException('Appointment not found');

    return this.prisma.appointment.update({
      where: { id },
      data: { dispatchStatus: status },
      include: { user: true, vehicle: true, services: true, tech: true },
    });
  }

  private async notifyCustomerOfConfirmation(appointment: any) {
    if (!appointment.user?.email && !process.env.MAIL_TO_OVERRIDE) {
      this.log.warn(`Appointment ${appointment.id} confirmed but user email is missing`);
      return;
    }

    try {
      await this.notifier.sendCustomerAppointmentConfirmed(appointment);
    } catch (err: any) {
      this.log.error(
        `Failed to send customer confirmation email for appointment ${appointment.id}`,
        err?.stack || err,
      );
    }
  }
}
