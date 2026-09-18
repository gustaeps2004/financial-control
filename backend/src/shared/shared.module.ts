import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { BusinessExceptionFilter } from './filters/business-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: BusinessExceptionFilter,
    },
  ],
})
export class SharedModule {}
