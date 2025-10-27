import { apiFetch } from './api';

export const adminApi = {
  internalConfirm: (id: string) =>
    apiFetch(`/admin/appointments/${id}/internal-confirm`, { method: 'PATCH' }),
  sendConfirmation: (id: string, expiresHours?: number) =>
    apiFetch(`/admin/appointments/${id}/send-confirmation`, { method: 'POST', body: { expiresHours } }),
  resendConfirmation: (id: string) =>
    apiFetch(`/admin/appointments/${id}/resend-confirmation`, { method: 'POST' }),
  lockWindowNow: (id: string) =>
    apiFetch(`/admin/appointments/${id}/lock-window-now`, { method: 'POST' }),
};
