import { Card } from '../../../domain/entities/card.entity';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(entity: CardEntity): Card {
    return Object.assign(new Card(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      brand: entity.brand,
      mark: entity.mark,
      swatch: entity.swatch,
      nickname: entity.nickname,
      creditLimit: entity.creditLimit,
      closingDay: entity.closingDay,
      openingBalance: entity.openingBalance,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: Card): CardEntity {
    return Object.assign(new CardEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      brand: domain.brand,
      mark: domain.mark,
      swatch: domain.swatch,
      nickname: domain.nickname,
      creditLimit: domain.creditLimit,
      closingDay: domain.closingDay,
      openingBalance: domain.openingBalance,
    });
  }
}
