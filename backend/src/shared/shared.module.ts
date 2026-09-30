import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { Clock } from './clock/clock';
import { SystemClock } from './clock/system-clock';
import { CorrelationIdMiddleware } from './correlation-id/correlation-id.middleware';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { BusinessExceptionFilter } from './filters/business-exception.filter';

@Module({
  // Declared here too (not only via the app's global ConfigModule.forRoot)
  // so the module also works on its own, e.g. in tests.
  imports: [ConfigModule],
  providers: [
    // Order matters: Nest resolves global APP_FILTER providers in reverse
    // registration order, so the catch-all filter must be registered
    // before the specific one for BusinessException to win the match.
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BusinessExceptionFilter,
    },
    { provide: Clock, useClass: SystemClock },
  ],
  exports: [Clock],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // path-to-regexp v7 (used by Nest 11) requires a named wildcard.
    consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
