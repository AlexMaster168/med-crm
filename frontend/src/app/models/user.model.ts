export enum UserRole {
    PATIENT = 'patient',
    DOCTOR = 'doctor'
}

export enum DoctorSpecialization {
    THERAPIST = 'therapist',
    SURGEON = 'surgeon',
    CARDIOLOGIST = 'cardiologist',
    NEUROLOGIST = 'neurologist',
    PEDIATRICIAN = 'pediatrician'
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    specialization?: DoctorSpecialization;
    phone: string;
    familyDoctor?: User | null;
}