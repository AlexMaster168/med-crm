import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { DoctorSchedulesController } from './doctor-schedules.controller';
import { DoctorSchedule, DoctorScheduleSchema } from '../schemas/doctor-schedule.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DoctorSchedule.name, schema: DoctorScheduleSchema },
        ]),
    ],
    controllers: [DoctorSchedulesController],
    providers: [DoctorSchedulesService],
    exports: [DoctorSchedulesService],
})
export class DoctorSchedulesModule {}
