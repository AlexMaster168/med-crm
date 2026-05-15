import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { AppointmentStatus } from '../schemas/appointment.schema';

export class CreateAppointmentDto {
    @ApiProperty() @IsMongoId() doctorId: string;
    @ApiProperty() @IsDateString() dateTime: string;
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(500) reason: string;
}

export class UpdateAppointmentDto {
    @ApiPropertyOptional({ enum: AppointmentStatus })
    @IsEnum(AppointmentStatus)
    @IsOptional()
    status?: AppointmentStatus;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(500)
    reason?: string;
}
