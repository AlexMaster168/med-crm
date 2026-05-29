import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

export class WorkingDayDto {
    @ApiProperty() @IsBoolean() enabled: boolean;
    @ApiProperty() @Matches(TIME_RE, { message: 'start: ожидается формат HH:mm' }) start: string;
    @ApiProperty() @Matches(TIME_RE, { message: 'end: ожидается формат HH:mm' }) end: string;
}

export class UpdateScheduleDto {
    @ApiProperty({ type: [WorkingDayDto] })
    @IsArray()
    @ArrayMinSize(7)
    @ArrayMaxSize(7)
    @ValidateNested({ each: true })
    @Type(() => WorkingDayDto)
    workingDays: WorkingDayDto[];

    @ApiProperty()
    @IsInt()
    @Min(5)
    @Max(240)
    slotDurationMin: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(TIME_RE, { message: 'breakStart: ожидается формат HH:mm' })
    breakStart?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(TIME_RE, { message: 'breakEnd: ожидается формат HH:mm' })
    breakEnd?: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @Matches(DATE_RE, { each: true, message: 'daysOff: ожидается формат YYYY-MM-DD' })
    daysOff: string[];

    @ApiProperty() @IsInt() @Min(1) @Max(365) bookingHorizonDays: number;
    @ApiProperty() @IsInt() @Min(0) @Max(168) minLeadTimeHours: number;
    @ApiProperty() @IsInt() @Min(1) @Max(20) maxActivePerPatient: number;
    @ApiProperty() @IsBoolean() requiresConfirmation: boolean;
}
