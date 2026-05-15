import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_doc, ret: Record<string, unknown>) => {
            delete ret.password;
            delete ret.hashedRefreshToken;
            return ret;
        },
    },
})
export class User extends Document {
    @Prop({ required: true, trim: true }) firstName: string;
    @Prop({ required: true, trim: true }) lastName: string;
    @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
    email: string;
    @Prop({ required: true, select: false }) password: string;
    @Prop({ required: true, enum: UserRole, index: true }) role: UserRole;
    @Prop({ enum: DoctorSpecialization }) specialization?: DoctorSpecialization;
    @Prop() phone?: string;
    @Prop({ select: false }) hashedRefreshToken?: string;
    @Prop() lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
