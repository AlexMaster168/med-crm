import {Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus} from '@nestjs/common';
import {AuthService} from './auth.service';
import {RegisterDto, LoginDto} from '../dto/auth.dto';
import {Public} from './decorators/public.decorator';
import {AuthGuard} from '@nestjs/passport';
import {CurrentUser} from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Public()
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    refresh(@CurrentUser() user: any) {
        return this.authService.refreshTokens(user.sub, user.refreshToken);
    }

    @Public()
    @Post('forgot-password')
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Public()
    @Post('reset-password')
    resetPassword(@Body('token') token: string, @Body('password') password: string) {
        return this.authService.resetPassword(token, password);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout() {
        return {message: 'Logged out'};
    }
}