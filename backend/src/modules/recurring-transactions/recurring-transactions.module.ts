import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CardsModule } from '../cards/cards.module';
import { CategoriesModule } from '../categories/categories.module';
import { RecurringTransactionsService } from './application/recurring-transactions.service';
import { RecurringTransactionsRepository } from './domain/repositories/recurring-transactions.repository';
import { RecurringTransactionsController } from './infrastructure/http/recurring-transactions.controller';
import { RecurringTransactionEntity } from './infrastructure/persistence/entities/recurring-transaction.entity';
import { TypeOrmRecurringTransactionsRepository } from './infrastructure/persistence/typeorm-recurring-transactions.repository';

@Module({
  imports: [
    AuthenticationsModule,
    CategoriesModule,
    CardsModule,
    TypeOrmModule.forFeature([RecurringTransactionEntity]),
  ],
  controllers: [RecurringTransactionsController],
  providers: [
    RecurringTransactionsService,
    {
      provide: RecurringTransactionsRepository,
      useClass: TypeOrmRecurringTransactionsRepository,
    },
  ],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
