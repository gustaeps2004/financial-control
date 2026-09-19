import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthenticationsModule, TerminusModule],
  controllers: [HealthController],
})
export class FinancialControlApiModule {}
