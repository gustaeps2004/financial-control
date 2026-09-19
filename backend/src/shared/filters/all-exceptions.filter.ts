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
        ? this.extractMessage(exception)
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

  // ValidationPipe's BadRequestException carries the real per-field errors in
  // getResponse().message (string[]); exception.message is just the generic
  // "Bad Request Exception" fallback because Nest's own HttpException only
  // promotes response.message to .message when it is a plain string.
  private extractMessage(exception: HttpException): string | string[] {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const { message } = body;
      if (typeof message === 'string' || Array.isArray(message)) {
        return message;
      }
    }

    return exception.message;
  }
}
