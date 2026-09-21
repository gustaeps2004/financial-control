import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../../domain/entities/card.entity';
import { CardsRepository } from '../../domain/repositories/cards.repository';
import { CardEntity } from './entities/card.entity';
import { CardMapper } from './mappers/card.mapper';

@Injectable()
export class TypeOrmCardsRepository extends CardsRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly repository: Repository<CardEntity>,
  ) {
    super();
  }

  async findAllByUser(userId: string): Promise<Card[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findById(id: string): Promise<Card | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CardMapper.toDomain(entity) : null;
  }

  async save(card: Card): Promise<Card> {
    const saved = await this.repository.save(CardMapper.toPersistence(card));
    return CardMapper.toDomain(saved);
  }

  async remove(card: Card): Promise<void> {
    await this.repository.softDelete(card.id!);
  }
}
