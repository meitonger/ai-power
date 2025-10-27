import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';


@Controller('admin/appointments')
export class AdminAppointmentsController {
  constructor(private readonly svc: AdminAppointmentsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Patch(':id/internal-confirm')
  internalConfirm(@Param('id') id: string) {
    return this.svc.markInternalConfirmed(id);
  }

  @Post(':id/send-confirmation')
  sendConfirmation(@Param('id') id: string, @Body() body: { expiresHours?: number }) {
    return this.svc.sendConfirmation(id, body?.expiresHours ?? 72);
  }

  @Post(':id/resend-confirmation')
  resend(@Param('id') id: string) {
    return this.svc.resendConfirmation(id);
  }
}
