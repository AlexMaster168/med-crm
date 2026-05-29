import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export enum AppointmentStatus {
    PENDING = 'pending',
    SCHEDULED = 'scheduled',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

/** Статусы, при которых слот считается занятым. */
export const ACTIVE_STATUSES = [
    AppointmentStatus.PENDING,
    AppointmentStatus.SCHEDULED,
];

@Schema({timestamps: true})
export class Appointment extends Document {
    @Prop({type: Types.ObjectId, ref: 'User', required: true}) patientId: Types.ObjectId;
    @Prop({type: Types.ObjectId, ref: 'User', required: true}) doctorId: Types.ObjectId;
    @Prop({required: true}) dateTime: Date;
    @Prop() reason?: string;
    @Prop({enum: AppointmentStatus, default: AppointmentStatus.PENDING}) status: AppointmentStatus;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
export type AppointmentDocument = Appointment & Document;