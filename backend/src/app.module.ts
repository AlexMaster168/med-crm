import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { DoctorSchedulesModule } from './doctor-schedules/doctor-schedules.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MedicalCardsModule } from './medical-cards/medical-cards.module';
import { FamilyDoctorsModule } from './family-doctors/family-doctors.module';
import { MailModule } from './mail/mail.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { envValidationSchema } from './config/env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath: ['.env.local', '.env'],
            validationSchema: envValidationSchema,
            validationOptions: { abortEarly: false, allowUnknown: true },
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI'),
                autoIndex: config.get<string>('NODE_ENV') !== 'production',
            }),
        }),
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: config.get<number>('THROTTLE_TTL_MS'),
                    limit: config.get<number>('THROTTLE_LIMIT'),
                },
            ],
        }),
        AuthModule,
        AppointmentsModule,
        DoctorSchedulesModule,
        MedicalCardsModule,
        FamilyDoctorsModule,
        MailModule,
        HealthModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    ],
})
export class AppModule {}
