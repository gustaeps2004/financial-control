import { Card } from '../entities/card.entity';

export abstract class CardsRepository {
  abstract findAllByUser(userId: string): Promise<Card[]>;
  abstract findAllByUserIncludingDeleted(userId: string): Promise<Card[]>;
  abstract findById(
    id: string,
    options?: { withDeleted?: boolean },
  ): Promise<Card | null>;
  abstract save(card: Card): Promise<Card>;
  abstract remove(card: Card): Promise<void>;
}
