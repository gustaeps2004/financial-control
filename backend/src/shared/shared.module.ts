import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CorrelationIdMiddleware } from './correlation-id/correlation-id.middleware';
import { BusinessExceptionFilter } from './filters/business-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: BusinessExceptionFilter,
    },
  ],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
