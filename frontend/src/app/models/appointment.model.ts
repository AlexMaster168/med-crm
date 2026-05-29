import { User } from './user.model';

export enum AppointmentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Ожидает подтверждения',
  [AppointmentStatus.SCHEDULED]: 'Подтверждено',
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

export interface CompleteAppointmentPayload {
  symptoms: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
}
