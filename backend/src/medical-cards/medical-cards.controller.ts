import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { MedicalCardsService } from './medical-cards.service';
import { CreateMedicalRecordDto, UpdateMedicalCardDto } from '../dto/medical-card.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@Controller('medical-cards')
@UseGuards(RolesGuard)
export class MedicalCardsController {
  constructor(private readonly medicalCardsService: MedicalCardsService) {}

  @Get('my')
  @Roles(UserRole.PATIENT)
  findMy(@CurrentUser() user: any) {
    return this.medicalCardsService.findMyCard(user.userId);
  }

  @Get('patient/:id')
  @Roles(UserRole.DOCTOR)
  findPatient(@Param('id') patientId: string, @CurrentUser() user: any) {
    return this.medicalCardsService.findPatientCard(patientId, user.userId);
  }

  @Post('record')
  @Roles(UserRole.DOCTOR)
  addRecord(@CurrentUser() user: any, @Body() createRecordDto: CreateMedicalRecordDto) {
    return this.medicalCardsService.addRecord(user.userId, createRecordDto);
  }

  @Patch()
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  update(@CurrentUser() user: any, @Body() updateDto: UpdateMedicalCardDto) {
    return this.medicalCardsService.update(user.userId, updateDto);
  }
}