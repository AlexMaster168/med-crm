import { IsNotEmpty, IsString, IsDateString, IsMongoId } from 'class-validator';

export class CreateAppointmentDto {
    @IsMongoId() doctorId: string;
    @IsDateString() dateTime: string;
    @IsString() @IsNotEmpty() reason: string;
}

export class UpdateAppointmentDto {
    @IsString() status?: string;
    @IsString() reason?: string;
}