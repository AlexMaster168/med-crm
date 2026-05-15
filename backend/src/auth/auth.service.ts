import {
    BadRequestException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { MailService } from '../mail/mail.service';

export interface PublicUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    specialization?: string;
    phone?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    role: UserRole;
    user: PublicUser;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) {}

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const email = dto.email.toLowerCase();
        const exists = await this.userModel.exists({ email });
        if (exists) {
            throw new BadRequestException('Пользователь с таким email уже существует');
        }

        if (dto.role === UserRole.DOCTOR && !dto.specialization) {
            throw new BadRequestException('Для врача обязательна специализация');
        }

        const hashedPassword = await this.hashSecret(dto.password);
        const user = await this.userModel.create({ ...dto, email, password: hashedPassword });

        return this.issueTokens(user);
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .select('+password');
        if (!user) {
            throw new UnauthorizedException('Неверные учетные данные');
        }

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            throw new UnauthorizedException('Неверные учетные данные');
        }

        user.lastLoginAt = new Date();
        await user.save();

        return this.issueTokens(user);
    }

    async refreshTokens(userId: string, refreshToken: string): Promise<AuthResponse> {
        const user = await this.userModel.findById(userId).select('+hashedRefreshToken');
        if (!user || !user.hashedRefreshToken) {
            throw new UnauthorizedException('Доступ запрещен');
        }

        const matches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!matches) {
            throw new UnauthorizedException('Доступ запрещен');
        }

        return this.issueTokens(user);
    }

    async logout(userId: string): Promise<{ message: string }> {
        await this.userModel.findByIdAndUpdate(userId, { $unset: { hashedRefreshToken: 1 } });
        return { message: 'Logged out' };
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        const uniformResponse = { message: 'Если email зарегистрирован, ссылка отправлена' };
        if (!user) {
            return uniformResponse;
        }

        const resetToken = await this.jwtService.signAsync(
            { sub: user.id, purpose: 'password-reset' },
            {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            },
        );

        try {
            await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (err) {
            this.logger.error('Failed to send password reset email', err as Error);
        }
        return uniformResponse;
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        let payload: { sub: string; purpose?: string };
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });
        } catch {
            throw new BadRequestException('Невалидный или просроченный токен');
        }

        if (payload.purpose !== 'password-reset') {
            throw new BadRequestException('Невалидный токен');
        }

        const hashedPassword = await this.hashSecret(newPassword);
        await this.userModel.findByIdAndUpdate(payload.sub, {
            password: hashedPassword,
            $unset: { hashedRefreshToken: 1 },
        });

        return { message: 'Пароль успешно изменен' };
    }

    private async issueTokens(user: UserDocument): Promise<AuthResponse> {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION') as any;
        const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any;
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: refreshExpiresIn,
            }),
        ]);

        const hashedRefreshToken = await this.hashSecret(refreshToken);
        await this.userModel.findByIdAndUpdate(user.id, { hashedRefreshToken });

        return {
            accessToken,
            refreshToken,
            role: user.role,
            user: this.toPublic(user),
        };
    }

    private toPublic(user: UserDocument): PublicUser {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            specialization: user.specialization,
            phone: user.phone,
        };
    }

    private hashSecret(secret: string): Promise<string> {
        const rounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS')) || 12;
        return bcrypt.hash(secret, rounds);
    }
}
