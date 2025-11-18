import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { NotificationService } from '../src/notifications/notification.service';

@Injectable()
export class AppointmentsService {
  private readonly log = new Logger(AppointmentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifier: NotificationService,
  ) {}

  private readonly slotReleaseStates = ['CANCELLED', 'CUSTOMER_DECLINED'];

  private parseSlotRange(slotStart: string | Date, slotEnd: string | Date) {
    const start = new Date(slotStart);
    const end = new Date(slotEnd);
    if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid slotStart/slotEnd');
    }
    if (end <= start) {
      throw new BadRequestException('slotEnd must be after slotStart');
    }
    return { start, end };
  }

  private buildOverlapWhere(
    start: Date,
    end: Date,
    opts: { userId?: string; ignoreAppointmentId?: string } = {},
  ): Prisma.AppointmentWhereInput {
    const where: Prisma.AppointmentWhereInput = {
      scheduleState: { notIn: this.slotReleaseStates },
      slotStart: { lt: end },
      slotEnd: { gt: start },
    };
    if (opts.userId) {
      where.userId = { not: opts.userId };
    }
    if (opts.ignoreAppointmentId) {
      where.id = { not: opts.ignoreAppointmentId };
    }
    return where;
  }

  private findBlockingAppointment(
    start: Date,
    end: Date,
    opts: { userId?: string; ignoreAppointmentId?: string } = {},
  ) {
    return this.prisma.appointment.findFirst({
      where: this.buildOverlapWhere(start, end, opts),
      orderBy: { slotStart: 'asc' },
      select: {
        id: true,
        slotStart: true,
        slotEnd: true,
        userId: true,
      },
    });
  }

  private async ensureSlotAvailable(start: Date, end: Date, userId: string, ignoreAppointmentId?: string) {
    const conflict = await this.findBlockingAppointment(start, end, { userId, ignoreAppointmentId });
    if (conflict) {
      throw new ConflictException('This time slot is already booked by another customer.');
    }
  }

  async checkSlotAvailability(params: { slotStart: string; slotEnd: string; userId?: string; ignoreAppointmentId?: string }) {
    const { slotStart, slotEnd, userId, ignoreAppointmentId } = params;
    const { start, end } = this.parseSlotRange(slotStart, slotEnd);
    const conflict = await this.findBlockingAppointment(start, end, { userId, ignoreAppointmentId });
    return {
      available: !conflict,
      conflict: conflict
        ? {
            slotStart: conflict.slotStart instanceof Date ? conflict.slotStart.toISOString() : conflict.slotStart,
            slotEnd: conflict.slotEnd instanceof Date ? conflict.slotEnd.toISOString() : conflict.slotEnd,
          }
        : null,
    };
  }

  async findAll() {
    try {
      return await this.prisma.appointment.findMany({
        orderBy: { slotStart: 'asc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          vehicle: { select: { make: true, model: true, year: true, trim: true } },
        },
      });
    } catch (err: any) {
      this.log.error('findAll failed', err?.stack || err);
      throw new InternalServerErrorException(
        'Database schema mismatch. Run: npx prisma db push (or migrate dev) and restart the API.'
      );
    }
  }

  findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: { select: { make: true, model: true, year: true, trim: true } },
      },
    });
  }

  async create(dto: CreateAppointmentDto) {
    // Map DTO to DB shape – keep it simple; your DTO likely already matches these fields
    const {
      userId,
      vehicleId,
      address,
      notes,
      slotStart,
      slotEnd,
      schedulingMode,
      arrivalWindowStart,
      arrivalWindowEnd,
    } = dto as any;

      const { start, end } = this.parseSlotRange(slotStart, slotEnd);

    // Prevent overlapping appointments for the *same vehicle* (allow stacking other vehicles)
    const overlappingForVehicle = await this.prisma.appointment.findFirst({
      where: {
        scheduleState: { not: 'CANCELLED' },
        vehicleId,
        slotStart: { lt: end },
        slotEnd: { gt: start },
      },
      select: { id: true, slotStart: true, slotEnd: true },
    });

      if (overlappingForVehicle) {
        throw new ConflictException('This vehicle already has an appointment in that time range');
      }

      await this.ensureSlotAvailable(start, end, userId);

    const appointment = await this.prisma.appointment.create({
      data: {
        userId,
        vehicleId,
        address,
        notes: notes ?? null,
        slotStart: start,
        slotEnd: end,
        schedulingMode: schedulingMode ?? 'WINDOW',
        arrivalWindowStart: arrivalWindowStart ? new Date(arrivalWindowStart) : null,
        arrivalWindowEnd: arrivalWindowEnd ? new Date(arrivalWindowEnd) : null,
      },
    });

      await this.notifyAdminAppointmentBooked(appointment.id);
      return appointment;
    }

    async update(id: string, dto: UpdateAppointmentDto) {
    const data: any = { ...dto };
    if (data.slotStart) data.slotStart = new Date(data.slotStart);
    if (data.slotEnd) data.slotEnd = new Date(data.slotEnd);
    if (data.arrivalWindowStart) data.arrivalWindowStart = new Date(data.arrivalWindowStart);
    if (data.arrivalWindowEnd) data.arrivalWindowEnd = new Date(data.arrivalWindowEnd);

    if (data.slotStart || data.slotEnd) {
      const current = await this.prisma.appointment.findUnique({
        where: { id },
        select: { slotStart: true, slotEnd: true, userId: true },
      });
      if (!current) {
        throw new NotFoundException('Appointment not found');
      }
      const { start, end } = this.parseSlotRange(data.slotStart ?? current.slotStart, data.slotEnd ?? current.slotEnd);
      data.slotStart = start;
      data.slotEnd = end;
      await this.ensureSlotAvailable(start, end, current.userId, id);
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }

  private async notifyAdminAppointmentBooked(appointmentId: string) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          vehicle: { select: { make: true, model: true, year: true, trim: true } },
        },
      });

      if (!appointment) {
        return;
      }

      await this.notifier.notifyAdminAppointmentBooked(appointment);
    } catch (err: any) {
      this.log.error(`Failed to notify admin for appointment ${appointmentId}`, err?.stack || err);
    }
  }
}
