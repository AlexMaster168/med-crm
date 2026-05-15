import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isHttp = exception instanceof HttpException;
        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const rawResponse = isHttp ? exception.getResponse() : null;
        const message =
            typeof rawResponse === 'string'
                ? rawResponse
                : (rawResponse as any)?.message ??
                  (exception instanceof Error ? exception.message : 'Internal server error');
        const errorName =
            (rawResponse as any)?.error ??
            (exception instanceof Error ? exception.name : 'InternalServerError');

        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} -> ${status}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        response.status(status).json({
            statusCode: status,
            error: errorName,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
