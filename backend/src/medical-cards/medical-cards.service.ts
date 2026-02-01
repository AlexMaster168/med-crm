import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MedicalCard, MedicalCardDocument } from '../schemas/medical-card.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { CreateMedicalRecordDto, UpdateMedicalCardDto } from '../dto/medical-card.dto';

@Injectable()
export class MedicalCardsService {
  constructor(
    @InjectModel(MedicalCard.name) private medicalCardModel: Model<MedicalCardDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

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