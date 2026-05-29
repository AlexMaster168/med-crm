import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Рабочий день недели. Индексы в массиве workingDays:
 * 0 = Понедельник ... 6 = Воскресенье.
 */
@Schema({ _id: false })
export class WorkingDay {
    @Prop({ default: false }) enabled: boolean;
    @Prop({ default: '09:00' }) start: string; // "HH:mm"
    @Prop({ default: '17:00' }) end: string; // "HH:mm"
}

export const WorkingDaySchema = SchemaFactory.createForClass(WorkingDay);

@Schema({
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
})
export class DoctorSchedule extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    doctorId: Types.ObjectId;

    // Всегда 7 элементов: Пн..Вс
    @Prop({ type: [WorkingDaySchema], default: [] })
    workingDays: WorkingDay[];

    // Длительность одного приёма, минут
    @Prop({ default: 30, min: 5, max: 240 })
    slotDurationMin: number;

    // Обеденный/технический перерыв (пусто = нет перерыва)
    @Prop() breakStart?: string; // "HH:mm"
    @Prop() breakEnd?: string; // "HH:mm"

    // Конкретные выходные/отпуск, формат "YYYY-MM-DD"
    @Prop({ type: [String], default: [] })
    daysOff: string[];

    // ── Правила записи ──────────────────────────────────────
    // На сколько дней вперёд пациент может записаться
    @Prop({ default: 30, min: 1, max: 365 })
    bookingHorizonDays: number;

    // Минимум за сколько часов до приёма можно записаться
    @Prop({ default: 2, min: 0, max: 168 })
    minLeadTimeHours: number;

    // Макс. число активных (pending+scheduled) записей одного пациента к этому врачу
    @Prop({ default: 1, min: 1, max: 20 })
    maxActivePerPatient: number;

    // Требуется ли подтверждение врача (pending -> scheduled)
    @Prop({ default: true })
    requiresConfirmation: boolean;
}

export const DoctorScheduleSchema = SchemaFactory.createForClass(DoctorSchedule);
export type DoctorScheduleDocument = DoctorSchedule & Document;

/** Дефолтный график: Пн–Пт 09:00–17:00, перерыв 13:00–14:00, Сб/Вс выходные. */
export function defaultWorkingDays(): WorkingDay[] {
    return [
        { enabled: true, start: '09:00', end: '17:00' }, // Пн
        { enabled: true, start: '09:00', end: '17:00' }, // Вт
        { enabled: true, start: '09:00', end: '17:00' }, // Ср
        { enabled: true, start: '09:00', end: '17:00' }, // Чт
        { enabled: true, start: '09:00', end: '17:00' }, // Пт
        { enabled: false, start: '09:00', end: '14:00' }, // Сб
        { enabled: false, start: '09:00', end: '14:00' }, // Вс
    ];
}
