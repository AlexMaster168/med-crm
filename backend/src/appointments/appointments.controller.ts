import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query} from '@nestjs/common';
import {AppointmentsService} from './appointments.service';
import {CreateAppointmentDto, UpdateAppointmentDto} from '../dto/appointment.dto';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {Roles} from '../auth/decorators/roles.decorator';
import {RolesGuard} from '../auth/guards/roles.guard';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {UserRole} from '../schemas/user.schema';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {
    }

    @Post()
    @Roles(UserRole.PATIENT)
    create(@CurrentUser() user: any, @Body() createAppointmentDto: CreateAppointmentDto) {
        return this.appointmentsService.create(user.userId, createAppointmentDto);
    }

    @Get('my')
    @Roles(UserRole.PATIENT)
    findMy(@CurrentUser() user: any) {
        return this.appointmentsService.findAllByPatient(user.userId);
    }

    @Get('doctor')
    @Roles(UserRole.DOCTOR)
    findDoctor(@CurrentUser() user: any) {
        return this.appointmentsService.findAllByDoctor(user.userId);
    }

    @Get('patients')
    @Roles(UserRole.DOCTOR)
    findMyPatients(@CurrentUser() user: any) {
        return this.appointmentsService.findUniquePatientsForDoctor(user.userId);
    }

    @Get('doctors')
    findDoctors(@Query('specialization') specialization?: string) {
        return this.appointmentsService.findAvailableDoctors(specialization);
    }

    @Get('slots')
    getAvailableSlots(@Query('doctorId') doctorId: string, @Query('date') date: string) {
        return [];
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.appointmentsService.findOne(id, user.userId, user.role);
    }

    @Patch(':id')
    update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateAppointmentDto: UpdateAppointmentDto) {
        return this.appointmentsService.update(id, user.userId, user.role, updateAppointmentDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.appointmentsService.remove(id, user.userId, user.role);
    }
}