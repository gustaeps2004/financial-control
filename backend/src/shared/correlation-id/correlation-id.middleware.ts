import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';
import { CorrelationIdStore } from './correlation-id.store';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const correlationId = this.resolveCorrelationId(request);

    response.setHeader(CORRELATION_ID_HEADER, correlationId);

    CorrelationIdStore.run(correlationId, next);
  }

  private resolveCorrelationId(request: Request): string {
    const headerValue = request.headers[CORRELATION_ID_HEADER];
    const incomingId = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    return incomingId && incomingId.length > 0 ? incomingId : randomUUID();
  }
}
