import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    DoctorSchedule,
    DoctorScheduleDocument,
    defaultWorkingDays,
} from '../schemas/doctor-schedule.schema';
import { UpdateScheduleDto } from '../dto/doctor-schedule.dto';
import { toMinutes } from './schedule.util';

@Injectable()
export class DoctorSchedulesService {
    constructor(
        @InjectModel(DoctorSchedule.name)
        private readonly scheduleModel: Model<DoctorScheduleDocument>,
    ) {}

    /** Вернуть график врача, создав дефолтный при отсутствии. */
    async getOrCreate(doctorId: string): Promise<DoctorScheduleDocument> {
        const id = new Types.ObjectId(doctorId);
        const existing = await this.scheduleModel.findOne({ doctorId: id }).exec();
        if (existing) return existing;
        return this.scheduleModel.create({
            doctorId: id,
            workingDays: defaultWorkingDays(),
            breakStart: '13:00',
            breakEnd: '14:00',
        });
    }

    async update(doctorId: string, dto: UpdateScheduleDto): Promise<DoctorScheduleDocument> {
        this.validate(dto);
        const schedule = await this.getOrCreate(doctorId);
        Object.assign(schedule, dto);
        return schedule.save();
    }

    private validate(dto: UpdateScheduleDto): void {
        for (let i = 0; i < dto.workingDays.length; i++) {
            const d = dto.workingDays[i];
            if (d.enabled && toMinutes(d.end) <= toMinutes(d.start)) {
                throw new BadRequestException(
                    `День ${i + 1}: время окончания должно быть позже начала`,
                );
            }
        }

        const hasBreakStart = !!dto.breakStart;
        const hasBreakEnd = !!dto.breakEnd;
        if (hasBreakStart !== hasBreakEnd) {
            throw new BadRequestException('Перерыв должен иметь и начало, и конец');
        }
        if (hasBreakStart && hasBreakEnd && toMinutes(dto.breakEnd!) <= toMinutes(dto.breakStart!)) {
            throw new BadRequestException('Конец перерыва должен быть позже начала');
        }
    }
}
