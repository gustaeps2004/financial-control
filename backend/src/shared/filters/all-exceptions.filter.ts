import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CorrelationIdStore } from '../correlation-id/correlation-id.store';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const correlationId = CorrelationIdStore.getCorrelationId();

    this.logger.error(
      `${request.method} ${request.url} ${statusCode} correlationId=${correlationId}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
