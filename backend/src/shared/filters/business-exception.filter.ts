import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { CorrelationIdStore } from '../correlation-id/correlation-id.store';
import { BusinessException } from '../exceptions/business.exception';

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  catch(exception: BusinessException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      path: request.url,
      correlationId: CorrelationIdStore.getCorrelationId(),
      timestamp: new Date().toISOString(),
    });
  }
}
