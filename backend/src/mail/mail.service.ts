import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASSWORD'),
            },
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const url = `${this.configService.get('FRONTEND_URL')}/forgot-password?token=${token}`;

        await this.transporter.sendMail({
            from: this.configService.get('SMTP_FROM'),
            to: email,
            subject: 'Восстановление пароля',
            html: `<p>Для сброса пароля перейдите по ссылке: <a href="${url}">${url}</a></p>`,
        });
    }
}