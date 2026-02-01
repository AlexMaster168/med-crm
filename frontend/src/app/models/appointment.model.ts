import {User} from './user.model';

export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface Appointment {
    _id: string;
    patientId: User;
    doctorId: User;
    dateTime: Date;
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
    reason: string;
}