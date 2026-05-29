import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MedicalCard, MedicalCardDocument } from '../schemas/medical-card.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { FamilyDoctor, FamilyDoctorDocument } from '../schemas/family-doctor.schema';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';
import { CreateMedicalRecordDto, UpdateMedicalCardDto } from '../dto/medical-card.dto';

@Injectable()
export class MedicalCardsService {
  constructor(
    @InjectModel(MedicalCard.name) private medicalCardModel: Model<MedicalCardDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FamilyDoctor.name) private familyDoctorModel: Model<FamilyDoctorDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) {}

  /**
   * Врач имеет доступ к карте пациента, если он семейный врач этого
   * пациента ИЛИ между ними есть хотя бы один приём (любого статуса).
   */
  private async assertDoctorAccess(patientId: string, doctorId: string): Promise<void> {
    const pid = new Types.ObjectId(patientId);
    const did = new Types.ObjectId(doctorId);

    const isFamilyDoctor = await this.familyDoctorModel.exists({
      patientId: pid,
      doctorId: did,
      isActive: true,
    });
    if (isFamilyDoctor) return;

    const hasAppointment = await this.appointmentModel.exists({
      patientId: pid,
      doctorId: did,
    });
    if (hasAppointment) return;

    throw new ForbiddenException(
      'Доступ к карте есть только у семейного врача или врача, к которому пациент записан',
    );
  }

  async findMyCard(patientId: string) {
    let card = await this.medicalCardModel
      .findOne({ patientId: new Types.ObjectId(patientId) })
      .populate('records.doctorId', 'firstName lastName specialization')
      .exec();

    if (!card) {
      card = await this.medicalCardModel.create({
        patientId: new Types.ObjectId(patientId),
        allergies: [],
        chronicDiseases: [],
        records: [],
      });
    }

    return card;
  }

  async findPatientCard(patientId: string, doctorId: string) {
    const patient = await this.userModel.findById(patientId);
    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Пациент не найден');
    }

    await this.assertDoctorAccess(patientId, doctorId);

    let card = await this.medicalCardModel
      .findOne({ patientId: new Types.ObjectId(patientId) })
      .populate('records.doctorId', 'firstName lastName specialization')
      .exec();

    if (!card) {
      card = await this.medicalCardModel.create({
        patientId: new Types.ObjectId(patientId),
        allergies: [],
        chronicDiseases: [],
        records: [],
      });
    }

    return card;
  }

  async addRecord(doctorId: string, createRecordDto: CreateMedicalRecordDto) {
    await this.assertDoctorAccess(createRecordDto.patientId, doctorId);

    let card = await this.medicalCardModel.findOne({
      patientId: new Types.ObjectId(createRecordDto.patientId),
    });

    if (!card) {
      card = await this.medicalCardModel.create({
        patientId: new Types.ObjectId(createRecordDto.patientId),
        allergies: [],
        chronicDiseases: [],
        records: [],
      });
    }

    card.records.push({
      date: new Date(),
      symptoms: createRecordDto.symptoms,
      diagnosis: createRecordDto.diagnosis,
      treatment: createRecordDto.treatment || '',
      notes: createRecordDto.notes || '',
      doctorId: new Types.ObjectId(doctorId),
    } as any);

    return card.save();
  }

  async update(patientId: string, updateDto: UpdateMedicalCardDto) {
    let card = await this.medicalCardModel.findOne({
      patientId: new Types.ObjectId(patientId),
    });

    if (!card) {
      card = await this.medicalCardModel.create({
        patientId: new Types.ObjectId(patientId),
        ...updateDto,
      });
    } else {
      Object.assign(card, updateDto);
      await card.save();
    }

    return card;
  }
}