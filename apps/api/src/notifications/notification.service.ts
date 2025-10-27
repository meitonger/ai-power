// apps/api/src/notifications/notification.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private getConfirmUrl(token: string) {
    const base = process.env.APP_PUBLIC_BASE_URL || 'http://localhost:3001';
    return `${base}/api/public/appointments/confirm?token=${encodeURIComponent(token)}`;
  }

  async sendAppointmentConfirmation(appointmentId: string, token: string) {
    const url = this.getConfirmUrl(token);

    // Dev-friendly transport: log to console; no SMTP required
    const transport = nodemailer.createTransport({ jsonTransport: true });
    const to = process.env.MAIL_TO_OVERRIDE || 'demo@example.com';
    const from = process.env.MAIL_FROM || 'ServiceOps <no-reply@example.com>';

    const info = await transport.sendMail({
      from,
      to,
      subject: `Confirm your appointment (${appointmentId})`,
      text: `Please confirm your appointment: ${url}`,
      html: `<p>Please confirm your appointment:</p><p><a href="${url}">${url}</a></p>`,
    });

    // Visible in server logs during dev
    console.log('Mail payload:', info.message);
    return { ok: true };
  }
}
