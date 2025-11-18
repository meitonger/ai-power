import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointments') // do NOT prefix with "api/"
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('availability')
  checkAvailability(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('userId') userId?: string,
    @Query('ignoreId') ignoreId?: string,
  ) {
    return this.svc.checkSlotAvailability({
      slotStart: start,
      slotEnd: end,
      userId,
      ignoreAppointmentId: ignoreId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.svc.update(id, dto);
  }
}
