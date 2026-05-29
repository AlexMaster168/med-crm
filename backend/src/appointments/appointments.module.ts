import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { DoctorSchedulesModule } from '../doctor-schedules/doctor-schedules.module';
import { MedicalCardsModule } from '../medical-cards/medical-cards.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    DoctorSchedulesModule,
    MedicalCardsModule,
    NotificationsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}