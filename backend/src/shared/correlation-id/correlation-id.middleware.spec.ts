import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { CorrelationIdStore } from './correlation-id.store';

describe('CorrelationIdMiddleware', () => {
  const middleware = new CorrelationIdMiddleware();

  const createResponse = () => {
    const headers: Record<string, string> = {};
    return {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
      getHeader: (name: string) => headers[name],
    } as unknown as Response;
  };

  it('generates a new correlation id when the header is not provided', () => {
    const request = { headers: {} } as Request;
    const response = createResponse();
    const next = jest.fn();

    middleware.use(request, response, next);

    const correlationId = response.getHeader(CORRELATION_ID_HEADER) as string;
    expect(correlationId).toEqual(expect.any(String));
    expect(correlationId.length).toBeGreaterThan(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('reuses the incoming correlation id header when present', () => {
    const request = {
      headers: { [CORRELATION_ID_HEADER]: 'incoming-correlation-id' },
    } as unknown as Request;
    const response = createResponse();
    const next = jest.fn();

    middleware.use(request, response, next);

    expect(response.getHeader(CORRELATION_ID_HEADER)).toBe(
      'incoming-correlation-id',
    );
  });

  it('exposes the correlation id through the store while next() runs', () => {
    const request = {
      headers: { [CORRELATION_ID_HEADER]: 'scoped-correlation-id' },
    } as unknown as Request;
    const response = createResponse();

    middleware.use(request, response, () => {
      expect(CorrelationIdStore.getCorrelationId()).toBe(
        'scoped-correlation-id',
      );
    });
  });
});
