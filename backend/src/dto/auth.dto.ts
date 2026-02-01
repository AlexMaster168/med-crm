import {IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional} from 'class-validator';
import {UserRole, DoctorSpecialization} from '../schemas/user.schema';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsEnum(DoctorSpecialization)
    @IsOptional()
    specialization?: DoctorSpecialization;

    @IsString()
    @IsOptional()
    phone?: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}