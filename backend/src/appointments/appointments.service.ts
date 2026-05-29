import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    ACTIVE_STATUSES,
    Appointment,
    AppointmentDocument,
    AppointmentStatus,
} from '../schemas/appointment.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import {
    CompleteAppointmentDto,
    CreateAppointmentDto,
    UpdateAppointmentDto,
} from '../dto/appointment.dto';
import { DoctorSchedulesService } from '../doctor-schedules/doctor-schedules.service';
import { generateDaySlotTimes, toDateKey, toHHMM } from '../doctor-schedules/schedule.util';
import { MedicalCardsService } from '../medical-cards/medical-cards.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../schemas/notification.schema';

export interface TimeSlot {
    time: string;
    available: boolean;
}

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel: Model<AppointmentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly schedulesService: DoctorSchedulesService,
        private readonly medicalCardsService: MedicalCardsService,
        private readonly notificationsService: NotificationsService,
    ) {}

    /** Краткий формат даты приёма для текста уведомлений. */
    private fmt(dt: Date): string {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dt);
    }

    /** Свободные/занятые слоты врача на конкретную дату ("YYYY-MM-DD"). */
    async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
        if (!Types.ObjectId.isValid(doctorId) || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
            return [];
        }

        const schedule = await this.schedulesService.getOrCreate(doctorId);

        // Горизонт записи: дальше bookingHorizonDays слотов не отдаём
        const todayKey = toDateKey(new Date());
        const horizon = new Date();
        horizon.setHours(0, 0, 0, 0);
        horizon.setDate(horizon.getDate() + schedule.bookingHorizonDays);
        if (date < todayKey || date > toDateKey(horizon)) return [];

        const times = generateDaySlotTimes(schedule, date);
        if (!times.length) return [];

        // Занятые слоты этого врача в этот день
        const dayStart = new Date(`${date}T00:00:00`);
        const dayEnd = new Date(`${date}T23:59:59.999`);
        const taken = await this.appointmentModel
            .find({
                doctorId: new Types.ObjectId(doctorId),
                status: { $in: ACTIVE_STATUSES },
                dateTime: { $gte: dayStart, $lte: dayEnd },
            })
            .select('dateTime')
            .exec();
        const takenTimes = new Set(
            taken.map((a) => toHHMM(a.dateTime.getHours() * 60 + a.dateTime.getMinutes())),
        );

        // Минимальное время до приёма (lead time)
        const earliest = Date.now() + schedule.minLeadTimeHours * 60 * 60 * 1000;

        return times.map((time) => {
            const slotDate = new Date(`${date}T${time}:00`);
            const available = !takenTimes.has(time) && slotDate.getTime() >= earliest;
            return { time, available };
        });
    }

    async create(patientId: string, dto: CreateAppointmentDto) {
        const doctor = await this.userModel.findById(dto.doctorId);
        if (!doctor || doctor.role !== UserRole.DOCTOR) {
            throw new NotFoundException('Врач не найден');
        }

        const dateTime = new Date(dto.dateTime);
        if (Number.isNaN(dateTime.getTime())) {
            throw new BadRequestException('Некорректная дата приёма');
        }

        const schedule = await this.schedulesService.getOrCreate(dto.doctorId);

        // Правило: минимальное время до приёма
        const earliest = Date.now() + schedule.minLeadTimeHours * 60 * 60 * 1000;
        if (dateTime.getTime() < earliest) {
            throw new ForbiddenException(
                `Записаться можно не позднее чем за ${schedule.minLeadTimeHours} ч до приёма`,
            );
        }

        // Правило: горизонт записи
        const horizon = new Date();
        horizon.setHours(23, 59, 59, 999);
        horizon.setDate(horizon.getDate() + schedule.bookingHorizonDays);
        if (dateTime.getTime() > horizon.getTime()) {
            throw new ForbiddenException(
                `Запись доступна максимум на ${schedule.bookingHorizonDays} дней вперёд`,
            );
        }

        // Слот должен существовать в графике врача
        const dateKey = toDateKey(dateTime);
        const time = toHHMM(dateTime.getHours() * 60 + dateTime.getMinutes());
        const validTimes = generateDaySlotTimes(schedule, dateKey);
        if (!validTimes.includes(time)) {
            throw new BadRequestException('Выбранное время недоступно для записи');
        }

        // Слот не должен быть занят (защита от гонки/обхода фронта)
        const clash = await this.appointmentModel.exists({
            doctorId: new Types.ObjectId(dto.doctorId),
            status: { $in: ACTIVE_STATUSES },
            dateTime,
        });
        if (clash) {
            throw new ConflictException('Это время уже занято');
        }

        // Правило: лимит активных записей пациента к этому врачу
        const activeCount = await this.appointmentModel.countDocuments({
            patientId: new Types.ObjectId(patientId),
            doctorId: new Types.ObjectId(dto.doctorId),
            status: { $in: ACTIVE_STATUSES },
        });
        if (activeCount >= schedule.maxActivePerPatient) {
            throw new ForbiddenException(
                `У вас уже есть активная запись к этому врачу (лимит: ${schedule.maxActivePerPatient})`,
            );
        }

        const created = await this.appointmentModel.create({
            patientId: new Types.ObjectId(patientId),
            doctorId: new Types.ObjectId(dto.doctorId),
            dateTime,
            reason: dto.reason,
            status: schedule.requiresConfirmation
                ? AppointmentStatus.PENDING
                : AppointmentStatus.SCHEDULED,
        });

        const patient = await this.userModel.findById(patientId).select('firstName lastName');
        const pname = patient ? `${patient.firstName} ${patient.lastName}` : 'Пациент';
        await this.notificationsService.create({
            userId: dto.doctorId,
            type: NotificationType.APPOINTMENT_REQUESTED,
            title: schedule.requiresConfirmation ? 'Новая заявка на приём' : 'Новая запись на приём',
            message: `${pname} — ${this.fmt(created.dateTime)}`,
            relatedId: created._id as Types.ObjectId,
        });

        return created;
    }

    /** Врач подтверждает запись: pending -> scheduled. */
    async confirm(id: string, doctorId: string) {
        const appointment = await this.appointmentModel.findById(id);
        if (!appointment) throw new NotFoundException('Запись не найдена');
        if (appointment.doctorId.toString() !== doctorId) {
            throw new ForbiddenException('Доступ запрещён');
        }
        if (appointment.status !== AppointmentStatus.PENDING) {
            throw new BadRequestException('Подтвердить можно только заявку в ожидании');
        }
        appointment.status = AppointmentStatus.SCHEDULED;
        const saved = await appointment.save();

        await this.notificationsService.create({
            userId: appointment.patientId,
            type: NotificationType.APPOINTMENT_CONFIRMED,
            title: 'Запись подтверждена',
            message: `Ваш приём ${this.fmt(appointment.dateTime)} подтверждён`,
            relatedId: appointment._id as Types.ObjectId,
        });

        return saved;
    }

    /** Врач отклоняет заявку: pending -> cancelled. */
    async reject(id: string, doctorId: string) {
        const appointment = await this.appointmentModel.findById(id);
        if (!appointment) throw new NotFoundException('Запись не найдена');
        if (appointment.doctorId.toString() !== doctorId) {
            throw new ForbiddenException('Доступ запрещён');
        }
        if (appointment.status !== AppointmentStatus.PENDING) {
            throw new BadRequestException('Отклонить можно только заявку в ожидании');
        }
        appointment.status = AppointmentStatus.CANCELLED;
        const saved = await appointment.save();

        await this.notificationsService.create({
            userId: appointment.patientId,
            type: NotificationType.APPOINTMENT_REJECTED,
            title: 'Запись отклонена',
            message: `Заявка на приём ${this.fmt(appointment.dateTime)} отклонена врачом`,
            relatedId: appointment._id as Types.ObjectId,
        });

        return saved;
    }

    /**
     * Врач завершает приём: пишет запись в медкарту пациента и
     * переводит приём в статус completed.
     */
    async complete(id: string, doctorId: string, dto: CompleteAppointmentDto) {
        const appointment = await this.appointmentModel.findById(id);
        if (!appointment) throw new NotFoundException('Запись не найдена');
        if (appointment.doctorId.toString() !== doctorId) {
            throw new ForbiddenException('Доступ запрещён');
        }
        if (appointment.status !== AppointmentStatus.SCHEDULED) {
            throw new BadRequestException(
                'Завершить можно только подтверждённый приём',
            );
        }

        await this.medicalCardsService.addRecord(doctorId, {
            patientId: appointment.patientId.toString(),
            symptoms: dto.symptoms,
            diagnosis: dto.diagnosis,
            treatment: dto.treatment,
            notes: dto.notes,
        });

        appointment.status = AppointmentStatus.COMPLETED;
        const saved = await appointment.save();

        await this.notificationsService.create({
            userId: appointment.patientId,
            type: NotificationType.APPOINTMENT_COMPLETED,
            title: 'Приём завершён',
            message: 'Врач завершил приём и добавил запись в вашу медкарту',
            relatedId: appointment._id as Types.ObjectId,
        });

        return saved;
    }

    findAllByPatient(patientId: string) {
        return this.appointmentModel
            .find({ patientId: new Types.ObjectId(patientId) })
            .populate('doctorId', 'firstName lastName specialization')
            .sort({ dateTime: -1 })
            .exec();
    }

    findAllByDoctor(doctorId: string) {
        return this.appointmentModel
            .find({ doctorId: new Types.ObjectId(doctorId) })
            .populate('patientId', 'firstName lastName phone')
            .sort({ dateTime: 1 })
            .exec();
    }

    async findOne(id: string, userId: string, userRole: UserRole) {
        const appointment = await this.appointmentModel
            .findById(id)
            .populate('patientId', 'firstName lastName phone')
            .populate('doctorId', 'firstName lastName specialization')
            .exec();

        if (!appointment) {
            throw new NotFoundException('Запись не найдена');
        }

        this.assertOwnership(appointment, userId, userRole);
        return appointment;
    }

    async update(
        id: string,
        userId: string,
        userRole: UserRole,
        dto: UpdateAppointmentDto,
    ) {
        const appointment = await this.appointmentModel.findById(id);
        if (!appointment) {
            throw new NotFoundException('Запись не найдена');
        }

        this.assertOwnership(appointment, userId, userRole);

        Object.assign(appointment, dto);
        return appointment.save();
    }

    async remove(id: string, userId: string, userRole: UserRole) {
        const appointment = await this.appointmentModel.findById(id);
        if (!appointment) {
            throw new NotFoundException('Запись не найдена');
        }

        this.assertOwnership(appointment, userId, userRole);

        // Уведомляем вторую сторону об отмене
        const notifyUserId =
            userRole === UserRole.PATIENT ? appointment.doctorId : appointment.patientId;
        await this.notificationsService.create({
            userId: notifyUserId,
            type: NotificationType.APPOINTMENT_CANCELLED,
            title: 'Приём отменён',
            message: `Приём ${this.fmt(appointment.dateTime)} отменён`,
            relatedId: appointment._id as Types.ObjectId,
        });

        await this.appointmentModel.findByIdAndDelete(id);
        return { message: 'Запись успешно удалена' };
    }

    findAvailableDoctors(specialization?: string) {
        const query: Record<string, unknown> = { role: UserRole.DOCTOR };
        if (specialization) {
            query.specialization = specialization;
        }
        return this.userModel.find(query).select('firstName lastName specialization').exec();
    }

    async findUniquePatientsForDoctor(doctorId: string) {
        const appointments = await this.appointmentModel
            .find({ doctorId: new Types.ObjectId(doctorId) })
            .populate('patientId', '-password')
            .exec();

        const patients = appointments
            .map((a) => a.patientId)
            .filter((p): p is NonNullable<typeof p> => !!p);

        return Array.from(
            new Map(patients.map((p: any) => [p._id.toString(), p])).values(),
        );
    }

    private assertOwnership(
        appointment: AppointmentDocument,
        userId: string,
        userRole: UserRole,
    ): void {
        const patientId = (appointment.patientId as any)?._id ?? appointment.patientId;
        const doctorId = (appointment.doctorId as any)?._id ?? appointment.doctorId;

        if (userRole === UserRole.PATIENT && patientId.toString() !== userId) {
            throw new ForbiddenException('Доступ запрещен');
        }
        if (userRole === UserRole.DOCTOR && doctorId.toString() !== userId) {
            throw new ForbiddenException('Доступ запрещен');
        }
    }
}
