import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Post(':id/set-draft')
  setDraft(@Param('id') id: string) {
    return this.svc.setDraft(id);
  }

  @Post(':id/customer-confirm')
  customerConfirm(@Param('id') id: string) {
    return this.svc.customerConfirm(id);
  }

  @Post(':id/lock-window-now')
  lockWindowNow(@Param('id') id: string) {
    return this.svc.lockWindowNow(id);
  }

  @Patch(':id/schedule-state')
  updateScheduleState(@Param('id') id: string, @Body() body: { state: string }) {
    return this.svc.updateScheduleState(id, body.state);
  }

  @Patch(':id/dispatch-status')
  updateDispatchStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.svc.updateDispatchStatus(id, body.status);
  }
}
