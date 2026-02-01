import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Schema({timestamps: true})
export class Appointment extends Document {
    @Prop({type: Types.ObjectId, ref: 'User', required: true}) patientId: Types.ObjectId;
    @Prop({type: Types.ObjectId, ref: 'User', required: true}) doctorId: Types.ObjectId;
    @Prop({required: true}) dateTime: Date;
    @Prop({required: true}) reason: string;
    @Prop({enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED}) status: AppointmentStatus;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
export type AppointmentDocument = Appointment & Document;