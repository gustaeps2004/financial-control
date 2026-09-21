import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CardsService } from './application/cards.service';
import { CardsRepository } from './domain/repositories/cards.repository';
import { CardEntity } from './infrastructure/persistence/entities/card.entity';
import { CardsController } from './infrastructure/http/cards.controller';
import { TypeOrmCardsRepository } from './infrastructure/persistence/typeorm-cards.repository';

@Module({
  imports: [AuthenticationsModule, TypeOrmModule.forFeature([CardEntity])],
  controllers: [CardsController],
  providers: [
    CardsService,
    { provide: CardsRepository, useClass: TypeOrmCardsRepository },
  ],
  exports: [CardsService],
})
export class CardsModule {}
