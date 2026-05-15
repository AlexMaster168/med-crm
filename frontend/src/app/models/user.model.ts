export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export enum DoctorSpecialization {
  THERAPIST = 'therapist',
  SURGEON = 'surgeon',
  CARDIOLOGIST = 'cardiologist',
  NEUROLOGIST = 'neurologist',
  DERMATOLOGIST = 'dermatologist',
  PEDIATRICIAN = 'pediatrician',
  OPHTHALMOLOGIST = 'ophthalmologist',
  PSYCHIATRIST = 'psychiatrist',
}

export const SPECIALIZATION_LABELS: Record<string, string> = {
  therapist: 'Терапевт',
  surgeon: 'Хирург',
  cardiologist: 'Кардиолог',
  neurologist: 'Невролог',
  dermatologist: 'Дерматолог',
  pediatrician: 'Педиатр',
  ophthalmologist: 'Офтальмолог',
  psychiatrist: 'Психиатр',
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  specialization?: DoctorSpecialization;
  phone?: string;
  familyDoctor?: User | null;
}
