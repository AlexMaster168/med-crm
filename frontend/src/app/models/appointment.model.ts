import { User } from './user.model';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Запланировано',
  [AppointmentStatus.COMPLETED]: 'Завершено',
  [AppointmentStatus.CANCELLED]: 'Отменено',
};

export interface Appointment {
  _id: string;
  patientId: User;
  doctorId: User;
  dateTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  dateTime: string;
  reason?: string;
}
