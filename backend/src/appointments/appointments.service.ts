import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../schemas/appointment.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(patientId: string, createAppointmentDto: CreateAppointmentDto) {
    const doctor = await this.userModel.findById(createAppointmentDto.doctorId);
    if (!doctor || doctor.role !== UserRole.DOCTOR) {
      throw new NotFoundException('Врач не найден');
    }

    const appointment = new this.appointmentModel({
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(createAppointmentDto.doctorId),
      dateTime: new Date(createAppointmentDto.dateTime),
      reason: createAppointmentDto.reason,
      status: AppointmentStatus.SCHEDULED,
    });

    return appointment.save();
  }

  async findAllByPatient(patientId: string) {
    return this.appointmentModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ dateTime: -1 })
      .exec();
  }

  async findAllByDoctor(doctorId: string) {
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

    if (userRole === UserRole.PATIENT && appointment.patientId._id.toString() !== userId) {
      throw new BadRequestException('Доступ запрещен');
    }

    if (userRole === UserRole.DOCTOR && appointment.doctorId._id.toString() !== userId) {
      throw new BadRequestException('Доступ запрещен');
    }

    return appointment;
  }

  async update(id: string, userId: string, userRole: UserRole, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentModel.findById(id);

    if (!appointment) {
      throw new NotFoundException('Запись не найдена');
    }

    if (userRole === UserRole.PATIENT && appointment.patientId.toString() !== userId) {
      throw new BadRequestException('Доступ запрещен');
    }

    if (userRole === UserRole.DOCTOR && appointment.doctorId.toString() !== userId) {
      throw new BadRequestException('Доступ запрещен');
    }

    Object.assign(appointment, updateAppointmentDto);
    return appointment.save();
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const appointment = await this.appointmentModel.findById(id);

    if (!appointment) {
      throw new NotFoundException('Запись не найдена');
    }

    if (userRole === UserRole.PATIENT && appointment.patientId.toString() !== userId) {
      throw new BadRequestException('Доступ запрещен');
    }

    if (userRole === UserRole.DOCTOR && appointment.doctorId.toString() !== userId) {
      throw new BadRequestException('Доступ запрещен');
    }

    await this.appointmentModel.findByIdAndDelete(id);
    return { message: 'Запись успешно удалена' };
  }

  async findAvailableDoctors(specialization?: string) {
    const query: any = { role: UserRole.DOCTOR };
    if (specialization) {
      query.specialization = specialization;
    }

    return this.userModel.find(query).select('firstName lastName specialization').exec();
  }
}
