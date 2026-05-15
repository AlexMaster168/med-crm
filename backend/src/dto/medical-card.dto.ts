import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateMedicalRecordDto {
    @ApiProperty() @IsMongoId() patientId: string;
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(2000) symptoms: string;
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(2000) diagnosis: string;
    @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000) treatment?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(2000) notes?: string;
}

export class UpdateMedicalCardDto {
    @ApiPropertyOptional() @IsString() @IsOptional() @MaxLength(10) bloodType?: string;

    @ApiPropertyOptional() @IsInt() @Min(50) @Max(250) @IsOptional() height?: number;
    @ApiPropertyOptional() @IsInt() @Min(1) @Max(500) @IsOptional() weight?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    allergies?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    chronicDiseases?: string[];
}
