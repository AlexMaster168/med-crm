import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    PORT: Joi.number().port().default(3000),
    API_PREFIX: Joi.string().allow('').default(''),
    CORS_ORIGIN: Joi.string().default('http://localhost:4200'),

    MONGODB_URI: Joi.string()
        .uri({ scheme: ['mongodb', 'mongodb+srv'] })
        .default('mongodb://localhost:27017/medical-crm'),

    JWT_ACCESS_SECRET: Joi.string().min(16).when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.string().min(16).default('dev-only-access-secret-change-me-please'),
    }),
    JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().min(16).when('NODE_ENV', {
        is: 'production',
        then: Joi.required(),
        otherwise: Joi.string().min(16).default('dev-only-refresh-secret-change-me-please'),
    }),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

    BCRYPT_SALT_ROUNDS: Joi.number().min(10).max(15).default(12),

    THROTTLE_TTL_MS: Joi.number().default(60_000),
    THROTTLE_LIMIT: Joi.number().default(100),

    SMTP_HOST: Joi.string().allow('').optional(),
    SMTP_PORT: Joi.number().port().default(587),
    SMTP_SECURE: Joi.boolean().default(false),
    SMTP_USER: Joi.string().allow('').optional(),
    SMTP_PASSWORD: Joi.string().allow('').optional(),
    SMTP_FROM: Joi.string().allow('').optional(),

    FRONTEND_URL: Joi.string().uri().default('http://localhost:4200'),
});
