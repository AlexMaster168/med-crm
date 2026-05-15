import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from '../dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { ttl: 60_000, limit: 10 } })
    @Post('login')
    @ApiOperation({ summary: 'Авторизация' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Обновление токенов' })
    refresh(@CurrentUser() user: { sub: string; refreshToken: string }) {
        return this.authService.refreshTokens(user.sub, user.refreshToken);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { ttl: 60_000, limit: 5 } })
    @Post('forgot-password')
    @ApiOperation({ summary: 'Запрос восстановления пароля' })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    @ApiOperation({ summary: 'Сброс пароля по токену' })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Выход (инвалидация refresh token)' })
    logout(@CurrentUser('userId') userId: string) {
        return this.authService.logout(userId);
    }
}
