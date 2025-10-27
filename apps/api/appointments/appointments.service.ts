import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly log = new Logger(AppointmentsService.name);
  constructor(private readonly prisma: PrismaService) {}

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

  create(dto: CreateAppointmentDto) {
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

    return this.prisma.appointment.create({
      data: {
        userId,
        vehicleId,
        address,
        notes: notes ?? null,
        slotStart: new Date(slotStart),
        slotEnd: new Date(slotEnd),
        schedulingMode: schedulingMode ?? 'WINDOW',
        arrivalWindowStart: arrivalWindowStart ? new Date(arrivalWindowStart) : null,
        arrivalWindowEnd: arrivalWindowEnd ? new Date(arrivalWindowEnd) : null,
      },
    });
  }

  update(id: string, dto: UpdateAppointmentDto) {
    const data: any = { ...dto };
    if (data.slotStart) data.slotStart = new Date(data.slotStart);
    if (data.slotEnd) data.slotEnd = new Date(data.slotEnd);
    if (data.arrivalWindowStart) data.arrivalWindowStart = new Date(data.arrivalWindowStart);
    if (data.arrivalWindowEnd) data.arrivalWindowEnd = new Date(data.arrivalWindowEnd);

    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }
}
