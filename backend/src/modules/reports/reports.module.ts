import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CardStatementsModule } from '../card-statements/card-statements.module';
import { CardsModule } from '../cards/cards.module';
import { CategoriesModule } from '../categories/categories.module';
import { RecurringTransactionsModule } from '../recurring-transactions/recurring-transactions.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReportsService } from './application/reports.service';
import { ReportsController } from './infrastructure/http/reports.controller';

// Read-only views over the other modules; owns no data of its own.
@Module({
  imports: [
    SharedModule,
    AuthenticationsModule,
    CategoriesModule,
    CardsModule,
    RecurringTransactionsModule,
    TransactionsModule,
    CardStatementsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
