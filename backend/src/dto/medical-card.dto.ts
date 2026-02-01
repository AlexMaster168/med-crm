import { IsNotEmpty, IsString, IsMongoId, IsOptional, IsArray } from 'class-validator';

export class CreateMedicalRecordDto {
    @IsMongoId()
    patientId: string;

    @IsString()
    @IsNotEmpty()
    symptoms: string;

    @IsString()
    @IsNotEmpty()
    diagnosis: string;

    @IsString()
    @IsOptional()
    treatment?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateMedicalCardDto {
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    allergies?: string[];

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    chronicDiseases?: string[];
}