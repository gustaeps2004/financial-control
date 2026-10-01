import {
  BadRequestException,
  Controller,
  Get,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { BusinessException } from '../exceptions/business.exception';
import { SharedModule } from '../shared.module';

interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string | string[];
  correlationId?: string;
}

class TestBusinessException extends BusinessException {
  constructor(message: string, statusCode: number) {
    super(message, statusCode, 'TEST_RULE_BROKEN');
  }
}

@Controller('test')
class TestController {
  @Get('business-error')
  throwBusiness(): never {
    throw new TestBusinessException('Something went wrong', 422);
  }

  @Get('unexpected-error')
  throwUnexpected(): never {
    throw new Error('Boom');
  }

  @Get('validation-error')
  throwValidation(): never {
    // Mirrors ValidationPipe's default exceptionFactory: BadRequestException
    // constructed with a string[] of per-field errors.
    throw new BadRequestException([
      'username must be longer than or equal to 3 characters',
      'email must be an email',
    ]);
  }

  @Get('unauthorized-error')
  throwUnauthorized(): never {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

describe('Global exception filters', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets BusinessExceptionFilter handle domain exceptions with their own status code', async () => {
    const response = await request(app.getHttpServer()).get(
      '/test/business-error',
    );
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(422);
    expect(body.code).toBe('TEST_RULE_BROKEN');
    expect(body.message).toBe('Something went wrong');
    expect(body).toHaveProperty('correlationId');
  });

  it('falls back to AllExceptionsFilter for unmapped errors', async () => {
    const response = await request(app.getHttpServer()).get(
      '/test/unexpected-error',
    );
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(500);
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.message).toBe('Internal server error');
    expect(body).toHaveProperty('correlationId');
  });

  it('surfaces per-field validation errors instead of the generic "Bad Request Exception" message', async () => {
    const response = await request(app.getHttpServer()).get(
      '/test/validation-error',
    );
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(400);
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.message).toEqual([
      'username must be longer than or equal to 3 characters',
      'email must be an email',
    ]);
    expect(body).toHaveProperty('correlationId');
  });

  it('names framework errors after their HTTP status, so clients can translate them', async () => {
    const response = await request(app.getHttpServer()).get(
      '/test/unauthorized-error',
    );
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(401);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.message).toBe('Invalid or expired token');
  });
});
