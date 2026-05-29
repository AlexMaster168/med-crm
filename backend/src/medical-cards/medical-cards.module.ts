import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalCardsService } from './medical-cards.service';
import { MedicalCardsController } from './medical-cards.controller';
import { MedicalCard, MedicalCardSchema } from '../schemas/medical-card.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { FamilyDoctor, FamilyDoctorSchema } from '../schemas/family-doctor.schema';
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalCard.name, schema: MedicalCardSchema },
      { name: User.name, schema: UserSchema },
      { name: FamilyDoctor.name, schema: FamilyDoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [MedicalCardsController],
  providers: [MedicalCardsService],
  exports: [MedicalCardsService],
})
export class MedicalCardsModule {}