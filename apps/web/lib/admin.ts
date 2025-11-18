import { apiGet, apiPatch, apiPost } from './api';

export const adminApi = {
  listAppointments: () => apiGet('/admin/appointments'),
  internalConfirm: (id: string) =>
    apiPatch(`/admin/appointments/${id}/internal-confirm`),
  sendConfirmation: (id: string, expiresHours?: number) =>
    apiPost(`/admin/appointments/${id}/send-confirmation`, { expiresHours }),
  resendConfirmation: (id: string) =>
    apiPost(`/admin/appointments/${id}/resend-confirmation`),
  setDraft: (id: string) =>
    apiPost(`/admin/appointments/${id}/set-draft`),
  customerConfirm: (id: string) =>
    apiPost(`/admin/appointments/${id}/customer-confirm`),
  lockWindowNow: (id: string) =>
    apiPost(`/admin/appointments/${id}/lock-window-now`),
  updateScheduleState: (id: string, state: string) =>
    apiPatch(`/admin/appointments/${id}/schedule-state`, { state }),
  updateDispatchStatus: (id: string, status: string) =>
    apiPatch(`/admin/appointments/${id}/dispatch-status`, { status }),
};
