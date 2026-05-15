import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const config = app.get(ConfigService);

    const port = config.get<number>('PORT');
    const apiPrefix = (config.get<string>('API_PREFIX') ?? '').trim();
    const corsOrigin = config.get<string>('CORS_ORIGIN');
    const nodeEnv = config.get<string>('NODE_ENV');

    if (apiPrefix) {
        app.setGlobalPrefix(apiPrefix);
    }
    app.enableShutdownHooks();

    app.use(helmet());
    app.use(compression());
    app.use(cookieParser());

    app.enableCors({
        origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()),
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    const docsPath = apiPrefix ? `${apiPrefix}/docs` : 'docs';
    if (nodeEnv !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Medical CRM API')
            .setDescription('REST API for the Medical CRM backend')
            .setVersion('2.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup(docsPath, app, document);
        logger.log(`Swagger docs at http://localhost:${port}/${docsPath}`);
    }

    await app.listen(port);
    const base = apiPrefix ? `http://localhost:${port}/${apiPrefix}` : `http://localhost:${port}`;
    logger.log(`Server running on ${base} (${nodeEnv})`);
}

bootstrap().catch((err) => {
    new Logger('Bootstrap').error('Failed to start', err);
    process.exit(1);
});
