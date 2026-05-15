import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { FamilyDoctorsService } from './family-doctors.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

class CreateContractDto {
  @ApiProperty() @IsMongoId() doctorId: string;
}

@ApiTags('family-doctors')
@ApiBearerAuth()
@Controller('family-doctors')
export class FamilyDoctorsController {
  constructor(private readonly familyDoctorsService: FamilyDoctorsService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  create(@CurrentUser() user: any, @Body() dto: CreateContractDto) {
    return this.familyDoctorsService.createContract(user.userId, dto.doctorId);
  }

  @Get('my')
  @Roles(UserRole.PATIENT)
  findMy(@CurrentUser() user: any) {
    return this.familyDoctorsService.findMyDoctor(user.userId);
  }

  @Get('patients')
  @Roles(UserRole.DOCTOR)
  findPatients(@CurrentUser() user: any) {
    return this.familyDoctorsService.findMyPatients(user.userId);
  }

  @Delete()
  @Roles(UserRole.PATIENT)
  terminate(@CurrentUser() user: any) {
    return this.familyDoctorsService.terminateContract(user.userId);
  }
}