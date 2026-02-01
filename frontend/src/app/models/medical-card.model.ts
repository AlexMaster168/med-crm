import { User } from './user.model';

export interface MedicalRecord {
    date: Date;
    symptoms: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
    doctorId: User;
}

export interface MedicalCard {
    _id: string;
    patientId: User | string;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    records: MedicalRecord[];
    height?: number;
    weight?: number;
}

export interface CreateMedicalRecordDto {
    patientId: string;
    symptoms: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
}