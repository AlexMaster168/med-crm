import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { UpdateScheduleDto } from '../dto/doctor-schedule.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('doctor-schedules')
@ApiBearerAuth()
@Controller('doctor-schedules')
export class DoctorSchedulesController {
    constructor(private readonly schedulesService: DoctorSchedulesService) {}

    @Get('me')
    @Roles(UserRole.DOCTOR)
    getMine(@CurrentUser() user: any) {
        return this.schedulesService.getOrCreate(user.userId);
    }

    @Put('me')
    @Roles(UserRole.DOCTOR)
    updateMine(@CurrentUser() user: any, @Body() dto: UpdateScheduleDto) {
        return this.schedulesService.update(user.userId, dto);
    }
}
