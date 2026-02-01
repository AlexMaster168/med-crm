import {Injectable, UnauthorizedException, BadRequestException, NotFoundException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {ConfigService} from '@nestjs/config';
import {User, UserDocument} from '../schemas/user.schema';
import {RegisterDto, LoginDto} from '../dto/auth.dto';
import {MailService} from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailService,
    ) {
    }

    async register(dto: RegisterDto) {
        const existingUser = await this.userModel.findOne({email: dto.email});
        if (existingUser) {
            throw new BadRequestException('Пользователь с таким email уже существует');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const newUser = new this.userModel({
            ...dto,
            password: hashedPassword,
        });

        const user = await newUser.save();
        return this.generateTokens(user._id.toString(), user.email, user.role);
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({email: dto.email});
        if (!user) {
            throw new UnauthorizedException('Неверные учетные данные');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Неверные учетные данные');
        }

        return this.generateTokens(user._id.toString(), user.email, user.role);
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new UnauthorizedException();

        return this.generateTokens(user._id.toString(), user.email, user.role);
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({email});
        if (!user) throw new NotFoundException('Пользователь не найден');

        const resetToken = await this.jwtService.signAsync(
            {sub: user._id, email: user.email},
            {secret: this.configService.get('JWT_ACCESS_SECRET'), expiresIn: '15m'}
        );

        await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        return {message: 'Ссылка для сброси пароля отправлена'};
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userModel.findByIdAndUpdate(payload.sub, {password: hashedPassword});

            return {message: 'Пароль успешно изменен'};
        } catch (e) {
            throw new BadRequestException('Невалидный или просроченный токен');
        }
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = {sub: userId, email, role};
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
            }),
        ]);

        return {accessToken: at, refreshToken: rt, role};
    }
}