import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FamilyDoctor, FamilyDoctorDocument } from '../schemas/family-doctor.schema';
import { User, UserDocument, UserRole, DoctorSpecialization } from '../schemas/user.schema';

@Injectable()
export class FamilyDoctorsService {
  constructor(
    @InjectModel(FamilyDoctor.name) private familyDoctorModel: Model<FamilyDoctorDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createContract(patientId: string, doctorId: string) {
    const doctor = await this.userModel.findById(doctorId);
    if (!doctor || doctor.role !== UserRole.DOCTOR || doctor.specialization !== DoctorSpecialization.THERAPIST) {
      throw new BadRequestException('Только терапевт может быть семейным врачом');
    }

    const existing = await this.familyDoctorModel.findOne({
      patientId: new Types.ObjectId(patientId),
      isActive: true,
    });

    if (existing) {
      throw new BadRequestException('У вас уже есть активный договор с семейным врачом');
    }

    const contract = new this.familyDoctorModel({
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
      contractDate: new Date(),
      isActive: true,
    });

    return contract.save();
  }

  async findMyDoctor(patientId: string) {
    const contract = await this.familyDoctorModel
      .findOne({ patientId: new Types.ObjectId(patientId), isActive: true })
      .populate('doctorId', 'firstName lastName specialization phone')
      .exec();

    if (!contract) {
      throw new NotFoundException('У вас нет семейного врача');
    }

    return contract;
  }

  async findMyPatients(doctorId: string) {
    return this.familyDoctorModel
      .find({ doctorId: new Types.ObjectId(doctorId), isActive: true })
      .populate('patientId', 'firstName lastName phone email')
      .exec();
  }

  async terminateContract(patientId: string) {
    const contract = await this.familyDoctorModel.findOne({
      patientId: new Types.ObjectId(patientId),
      isActive: true,
    });

    if (!contract) {
      throw new NotFoundException('Активный договор не найден');
    }

    contract.isActive = false;
    return contract.save();
  }
}