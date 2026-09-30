import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CardsModule } from '../cards/cards.module';
import { CategoriesModule } from '../categories/categories.module';
import { RecurringTransactionsModule } from '../recurring-transactions/recurring-transactions.module';
import { TransactionsService } from './application/transactions.service';
import { TransactionsRepository } from './domain/repositories/transactions.repository';
import { TransactionsController } from './infrastructure/http/transactions.controller';
import { TransactionEntity } from './infrastructure/persistence/entities/transaction.entity';
import { TypeOrmTransactionsRepository } from './infrastructure/persistence/typeorm-transactions.repository';

@Module({
  imports: [
    AuthenticationsModule,
    CategoriesModule,
    CardsModule,
    RecurringTransactionsModule,
    TypeOrmModule.forFeature([TransactionEntity]),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    {
      provide: TransactionsRepository,
      useClass: TypeOrmTransactionsRepository,
    },
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
