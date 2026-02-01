import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalCardsService } from './medical-cards.service';
import { MedicalCardsController } from './medical-cards.controller';
import { MedicalCard, MedicalCardSchema } from '../schemas/medical-card.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalCard.name, schema: MedicalCardSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MedicalCardsController],
  providers: [MedicalCardsService],
})
export class MedicalCardsModule {}