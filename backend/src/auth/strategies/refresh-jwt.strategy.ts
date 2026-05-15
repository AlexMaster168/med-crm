import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: { sub: string; email: string; role: string }) {
        const header = req.get('Authorization');
        if (!header) {
            throw new UnauthorizedException('Missing refresh token');
        }
        const refreshToken = header.replace(/^Bearer\s+/i, '').trim();
        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return { ...payload, refreshToken };
    }
}
