import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyDoctorsService } from './family-doctors.service';
import { FamilyDoctorsController } from './family-doctors.controller';
import { FamilyDoctor, FamilyDoctorSchema } from '../schemas/family-doctor.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FamilyDoctor.name, schema: FamilyDoctorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FamilyDoctorsController],
  providers: [FamilyDoctorsService],
})
export class FamilyDoctorsModule {}