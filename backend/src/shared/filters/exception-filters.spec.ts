import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { BusinessException } from '../exceptions/business.exception';
import { SharedModule } from '../shared.module';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  correlationId?: string;
}

@Controller('test')
class TestController {
  @Get('business-error')
  throwBusiness(): never {
    throw new BusinessException('Something went wrong', 422);
  }

  @Get('unexpected-error')
  throwUnexpected(): never {
    throw new Error('Boom');
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
    expect(body.message).toBe('Something went wrong');
    expect(body).toHaveProperty('correlationId');
  });

  it('falls back to AllExceptionsFilter for unmapped errors', async () => {
    const response = await request(app.getHttpServer()).get(
      '/test/unexpected-error',
    );
    const body = response.body as ErrorResponseBody;

    expect(response.status).toBe(500);
    expect(body.message).toBe('Internal server error');
    expect(body).toHaveProperty('correlationId');
  });
});
