import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CardsModule } from '../cards/cards.module';
import { CategoriesModule } from '../categories/categories.module';
import { RecurringTransactionsService } from './application/recurring-transactions.service';
import { OccurrencePaymentsRepository } from './domain/repositories/occurrence-payments.repository';
import { RecurringTransactionsRepository } from './domain/repositories/recurring-transactions.repository';
import { RecurringTransactionsController } from './infrastructure/http/recurring-transactions.controller';
import { OccurrencePaymentEntity } from './infrastructure/persistence/entities/occurrence-payment.entity';
import { RecurringTransactionEntity } from './infrastructure/persistence/entities/recurring-transaction.entity';
import { TypeOrmOccurrencePaymentsRepository } from './infrastructure/persistence/typeorm-occurrence-payments.repository';
import { TypeOrmRecurringTransactionsRepository } from './infrastructure/persistence/typeorm-recurring-transactions.repository';

@Module({
  imports: [
    AuthenticationsModule,
    CategoriesModule,
    CardsModule,
    TypeOrmModule.forFeature([
      RecurringTransactionEntity,
      OccurrencePaymentEntity,
    ]),
  ],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsService,
    {
      provide: RecurringTransactionsRepository,
      useClass: TypeOrmRecurringTransactionsRepository,
    },
    {
      provide: OccurrencePaymentsRepository,
      useClass: TypeOrmOccurrencePaymentsRepository,
    },
  ],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
