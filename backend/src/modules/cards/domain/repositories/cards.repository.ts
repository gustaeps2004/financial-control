import { Card } from '../entities/card.entity';

export abstract class CardsRepository {
  abstract findAllByUser(userId: string): Promise<Card[]>;
  abstract findById(id: string): Promise<Card | null>;
  abstract save(card: Card): Promise<Card>;
  abstract remove(card: Card): Promise<void>;
}
