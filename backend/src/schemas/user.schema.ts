import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

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

@Schema({timestamps: true})
export class User extends Document {
    @Prop({required: true}) firstName: string;
    @Prop({required: true}) lastName: string;
    @Prop({required: true, unique: true}) email: string;
    @Prop({required: true}) password: string;
    @Prop({required: true, enum: UserRole}) role: UserRole;
    @Prop({enum: DoctorSpecialization}) specialization?: DoctorSpecialization;
    @Prop() phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;