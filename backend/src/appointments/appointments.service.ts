import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Appointment,
    AppointmentDocument,
    AppointmentStatus,
} from '../schemas/appointment.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/appointment.dto';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel: Model<AppointmentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async create(patientId: string, dto: CreateAppointmentDto) {
        const doctor = await this.userModel.findById(dto.doctorId);
        if (!doctor || doctor.role !== UserRole.DOCTOR) {
            throw new NotFoundException('Врач не найден');
        }

        const dateTime = new Date(dto.dateTime);
        if (dateTime.getTime() <= Date.now()) {
            throw new ForbiddenException('Время приема должно быть в будущем');
        }

        return this.appointmentModel.create({
            patientId: new Types.ObjectId(patientId),
            doctorId: new Types.ObjectId(dto.doctorId),
            dateTime,
            reason: dto.reason,
            status: AppointmentStatus.SCHEDULED,
        });
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
