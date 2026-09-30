import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CardsModule } from '../cards/cards.module';
import { CardStatementsService } from './application/card-statements.service';
import { StatementAdjustmentsRepository } from './domain/repositories/statement-adjustments.repository';
import { StatementPaymentsRepository } from './domain/repositories/statement-payments.repository';
import { CardStatementsController } from './infrastructure/http/card-statements.controller';
import { StatementAdjustmentEntity } from './infrastructure/persistence/entities/statement-adjustment.entity';
import { StatementPaymentEntity } from './infrastructure/persistence/entities/statement-payment.entity';
import { TypeOrmStatementAdjustmentsRepository } from './infrastructure/persistence/typeorm-statement-adjustments.repository';
import { TypeOrmStatementPaymentsRepository } from './infrastructure/persistence/typeorm-statement-payments.repository';

@Module({
  imports: [
    AuthenticationsModule,
    CardsModule,
    TypeOrmModule.forFeature([
      StatementAdjustmentEntity,
      StatementPaymentEntity,
    ]),
  ],
  controllers: [CardStatementsController],
  providers: [
    CardStatementsService,
    {
      provide: StatementAdjustmentsRepository,
      useClass: TypeOrmStatementAdjustmentsRepository,
    },
    {
      provide: StatementPaymentsRepository,
      useClass: TypeOrmStatementPaymentsRepository,
    },
  ],
  exports: [CardStatementsService],
})
export class CardStatementsModule {}
