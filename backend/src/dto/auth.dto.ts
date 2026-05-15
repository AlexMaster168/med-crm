import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsJWT,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { DoctorSpecialization, UserRole } from '../schemas/user.schema';

export class RegisterDto {
    @ApiProperty() @IsEmail() @MaxLength(255) email: string;

    @ApiProperty({ minLength: 6 })
    @IsString()
    @MinLength(6)
    @MaxLength(128)
    password: string;

    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(80) firstName: string;
    @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(80) lastName: string;
    @ApiProperty({ enum: UserRole }) @IsEnum(UserRole) role: UserRole;

    @ApiPropertyOptional({ enum: DoctorSpecialization })
    @IsEnum(DoctorSpecialization)
    @IsOptional()
    specialization?: DoctorSpecialization;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @MaxLength(32)
    phone?: string;
}

export class LoginDto {
    @ApiProperty() @IsEmail() email: string;
    @ApiProperty() @IsString() @IsNotEmpty() password: string;
}

export class ForgotPasswordDto {
    @ApiProperty() @IsEmail() email: string;
}

export class ResetPasswordDto {
    @ApiProperty() @IsJWT() token: string;

    @ApiProperty({ minLength: 6 })
    @IsString()
    @MinLength(6)
    @MaxLength(128)
    newPassword: string;
}
