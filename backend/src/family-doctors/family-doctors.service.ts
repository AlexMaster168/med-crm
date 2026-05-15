import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FamilyDoctor, FamilyDoctorDocument } from '../schemas/family-doctor.schema';
import {
    DoctorSpecialization,
    User,
    UserDocument,
    UserRole,
} from '../schemas/user.schema';

@Injectable()
export class FamilyDoctorsService {
    constructor(
        @InjectModel(FamilyDoctor.name)
        private readonly familyDoctorModel: Model<FamilyDoctorDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async createContract(patientId: string, doctorId: string) {
        const doctor = await this.userModel.findById(doctorId);
        if (
            !doctor ||
            doctor.role !== UserRole.DOCTOR ||
            doctor.specialization !== DoctorSpecialization.THERAPIST
        ) {
            throw new BadRequestException('Только терапевт может быть семейным врачом');
        }

        const existing = await this.familyDoctorModel.findOne({
            patientId: new Types.ObjectId(patientId),
            isActive: true,
        });
        if (existing) {
            throw new BadRequestException('У вас уже есть активный договор с семейным врачом');
        }

        return this.familyDoctorModel.create({
            patientId: new Types.ObjectId(patientId),
            doctorId: new Types.ObjectId(doctorId),
            contractDate: new Date(),
            isActive: true,
        });
    }

    async findMyDoctor(patientId: string): Promise<UserDocument | null> {
        const contract = await this.familyDoctorModel
            .findOne({ patientId: new Types.ObjectId(patientId), isActive: true })
            .populate<{ doctorId: UserDocument }>(
                'doctorId',
                'firstName lastName email specialization phone role',
            )
            .exec();

        return contract?.doctorId ?? null;
    }

    async findMyPatients(doctorId: string): Promise<UserDocument[]> {
        const contracts = await this.familyDoctorModel
            .find({ doctorId: new Types.ObjectId(doctorId), isActive: true })
            .populate<{ patientId: UserDocument }>(
                'patientId',
                'firstName lastName email phone role',
            )
            .exec();

        return contracts.map((c) => c.patientId).filter((p): p is UserDocument => !!p);
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
