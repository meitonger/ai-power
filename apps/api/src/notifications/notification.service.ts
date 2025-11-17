// apps/api/src/notifications/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface AppointmentNotificationPayload {
  id: string;
  slotStart: Date;
  slotEnd: Date;
  address?: string | null;
  notes?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  vehicle?: {
    make?: string | null;
    model?: string | null;
    trim?: string | null;
    year?: number | null;
  } | null;
}

@Injectable()
export class NotificationService {
  private readonly log = new Logger(NotificationService.name);

  private getConfirmUrl(token: string) {
    const base = process.env.APP_PUBLIC_BASE_URL || 'http://localhost:3001';
    return `${base}/api/public/appointments/confirm?token=${encodeURIComponent(token)}`;
  }

  private createTransport() {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  private getFromAddress() {
    return process.env.MAIL_FROM || 'ServiceOps <no-reply@example.com>';
  }

  private resolveRecipient(preferred?: string | null, fallback?: string) {
    return process.env.MAIL_TO_OVERRIDE || preferred || fallback || 'demo@example.com';
  }

  private formatWindow(slotStart: Date | string, slotEnd: Date | string) {
    const start = slotStart instanceof Date ? slotStart : new Date(slotStart);
    const end = slotEnd instanceof Date ? slotEnd : new Date(slotEnd);
    const timeZone = process.env.TZ || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    });

    return `${formatter.format(start)} - ${formatter.format(end)} (${timeZone})`;
  }

  async sendAppointmentConfirmation(appointmentId: string, token: string) {
    const url = this.getConfirmUrl(token);

    const transport = this.createTransport();
    const to = this.resolveRecipient(undefined);
    const from = this.getFromAddress();

    const info = await transport.sendMail({
      from,
      to,
      subject: `Confirm your appointment (${appointmentId})`,
      text: `Please confirm your appointment: ${url}`,
      html: `<p>Please confirm your appointment:</p><p><a href="${url}">${url}</a></p>`,
    });

    this.log.debug(`Appointment confirmation email queued (${appointmentId})`);
    this.log.verbose(`Mail payload: ${info.message}`);
    return { ok: true };
  }

  async notifyAdminAppointmentBooked(appointment: AppointmentNotificationPayload) {
    const to = this.resolveRecipient(process.env.ADMIN_NOTIFICATION_EMAIL, 'ops@example.com');
    const from = this.getFromAddress();
    const customer =
      appointment.user
        ? `${appointment.user.name || 'Customer'} (${appointment.user.email || 'no email'})${
            appointment.user.phone ? `, ${appointment.user.phone}` : ''
          }`
        : 'Unknown customer';
    const vehicle = appointment.vehicle
      ? [appointment.vehicle.year, appointment.vehicle.make, appointment.vehicle.model, appointment.vehicle.trim]
          .filter(Boolean)
          .join(' ')
      : 'n/a';
    const lines = [
      `Appointment ID: ${appointment.id}`,
      `Window: ${this.formatWindow(appointment.slotStart, appointment.slotEnd)}`,
      `Customer: ${customer}`,
      `Vehicle: ${vehicle}`,
      `Address: ${appointment.address || 'n/a'}`,
    ];

    if (appointment.notes) {
      lines.push(`Notes: ${appointment.notes}`);
    }

    const transport = this.createTransport();
    await transport.sendMail({
      from,
      to,
      subject: `New appointment booked (${appointment.id})`,
      text: lines.join('\n'),
      html: `<p>${lines.join('</p><p>')}</p>`,
    });

    this.log.debug(`Admin notified about appointment ${appointment.id}`);
  }

  async sendCustomerAppointmentConfirmed(appointment: AppointmentNotificationPayload) {
    const preferredEmail = appointment.user?.email || undefined;
    if (!preferredEmail && !process.env.MAIL_TO_OVERRIDE) {
      throw new Error('Unable to resolve customer email for confirmation notice');
    }
    const to = this.resolveRecipient(preferredEmail);

    const from = this.getFromAddress();
    const greeting = appointment.user?.name ? `Hi ${appointment.user.name},` : 'Hello,';
    const window = this.formatWindow(appointment.slotStart, appointment.slotEnd);
    const addressLine = appointment.address ? `Address: ${appointment.address}` : 'We will meet you at the address on file.';

    const text = `${greeting}

Your appointment (${appointment.id}) scheduled for ${window} has been confirmed by our team.
${addressLine}

If you need to make a change, just reply to this email.

- ServiceOps Team`;

    const html = `<p>${greeting}</p>
<p>Your appointment (${appointment.id}) scheduled for <strong>${window}</strong> has been confirmed by our team.</p>
<p>${addressLine}</p>
<p>If you need to make a change, just reply to this email.</p>
<p>- ServiceOps Team</p>`;

    const transport = this.createTransport();
    await transport.sendMail({
      from,
      to,
      subject: `Appointment confirmed (${appointment.id})`,
      text,
      html,
    });

    this.log.debug(`Customer confirmation email sent for appointment ${appointment.id}`);
  }
}
