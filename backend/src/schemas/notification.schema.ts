import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
    APPOINTMENT_REQUESTED = 'appointment_requested',
    APPOINTMENT_CONFIRMED = 'appointment_confirmed',
    APPOINTMENT_REJECTED = 'appointment_rejected',
    APPOINTMENT_COMPLETED = 'appointment_completed',
    APPOINTMENT_CANCELLED = 'appointment_cancelled',
}

@Schema({
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
})
export class Notification extends Document {
    // Получатель уведомления
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, enum: NotificationType })
    type: NotificationType;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ default: false, index: true })
    read: boolean;

    // Связанная сущность (например, id приёма)
    @Prop({ type: Types.ObjectId })
    relatedId?: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export type NotificationDocument = Notification & Document;
