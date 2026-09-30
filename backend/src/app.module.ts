import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from './modules/authentications/authentications.module';
import { CardStatementsModule } from './modules/card-statements/card-statements.module';
import { CardsModule } from './modules/cards/cards.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FinancialControlApiModule } from './modules/financial-control-api/financial-control-api.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { buildDatabaseConnectionOptions } from './shared/database/database-connection.config';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...buildDatabaseConnectionOptions({
          DB_HOST: configService.get<string>('DB_HOST'),
          DB_PORT: configService.get<string>('DB_PORT'),
          DB_USERNAME: configService.get<string>('DB_USERNAME'),
          DB_PASSWORD: configService.get<string>('DB_PASSWORD'),
          DB_NAME: configService.get<string>('DB_NAME'),
        }),
        autoLoadEntities: true,
      }),
    }),
    SharedModule,
    AuthenticationsModule,
    CardsModule,
    CategoriesModule,
    RecurringTransactionsModule,
    TransactionsModule,
    CardStatementsModule,
    FinancialControlApiModule,
  ],
})
export class AppModule {}
