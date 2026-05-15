import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
    private readonly logger = new Logger(MailService.name);
    private transporter: Transporter | null = null;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit(): void {
        const host = this.configService.get<string>('SMTP_HOST');
        if (!host) {
            this.logger.warn('SMTP_HOST not set — mail delivery disabled');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<boolean>('SMTP_SECURE'),
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        if (!this.transporter) {
            this.logger.warn(`Skipping password-reset email to ${email} (SMTP disabled)`);
            return;
        }

        const url = `${this.configService.get<string>('FRONTEND_URL')}/forgot-password?token=${encodeURIComponent(token)}`;

        await this.transporter.sendMail({
            from: this.configService.get<string>('SMTP_FROM'),
            to: email,
            subject: 'Восстановление пароля',
            html: `<p>Для сброса пароля перейдите по ссылке: <a href="${url}">${url}</a></p><p>Ссылка действительна 15 минут.</p>`,
        });
    }
}
