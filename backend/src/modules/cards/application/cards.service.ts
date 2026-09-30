import { Injectable } from '@nestjs/common';
import { Card } from '../domain/entities/card.entity';
import { CardNotFoundException } from '../domain/exceptions/card-not-found.exception';
import { CardsRepository } from '../domain/repositories/cards.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

const DEFAULT_CREDIT_LIMIT = 3000;
const DEFAULT_CLOSING_DAY = 10;
const DEFAULT_OPENING_BALANCE = 0;

@Injectable()
export class CardsService {
  constructor(private readonly cardsRepository: CardsRepository) {}

  create(userId: string, dto: CreateCardDto): Promise<Card> {
    const card: Card = Object.assign(new Card(), {
      userId,
      brand: dto.brand,
      mark: dto.mark,
      swatch: dto.swatch,
      nickname: dto.nickname,
      creditLimit: DEFAULT_CREDIT_LIMIT,
      closingDay: DEFAULT_CLOSING_DAY,
      openingBalance: DEFAULT_OPENING_BALANCE,
    });

    return this.cardsRepository.save(card);
  }

  findAll(userId: string): Promise<Card[]> {
    return this.cardsRepository.findAllByUser(userId);
  }

  // Past purchases keep pointing at cards removed since, so readers that
  // resolve history need them too.
  findAllIncludingDeleted(userId: string): Promise<Card[]> {
    return this.cardsRepository.findAllByUserIncludingDeleted(userId);
  }

  /**
   * Public lookup for other modules. Only active cards can be picked for new
   * records; `includeDeleted` is for re-validating an existing reference.
   */
  async getOwned(
    userId: string,
    id: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<Card> {
    const card = await this.cardsRepository.findById(id, {
      withDeleted: options.includeDeleted ?? false,
    });
    if (!card || card.userId !== userId) {
      throw new CardNotFoundException();
    }
    return card;
  }

  async update(userId: string, id: string, dto: UpdateCardDto): Promise<Card> {
    const card = await this.findOwnedOrFail(userId, id);

    if (dto.nickname !== undefined) card.nickname = dto.nickname;
    if (dto.creditLimit !== undefined) card.creditLimit = dto.creditLimit;
    if (dto.closingDay !== undefined) card.closingDay = dto.closingDay;
    if (dto.dueDay !== undefined) card.dueDay = dto.dueDay;
    if (dto.openingBalance !== undefined)
      card.openingBalance = dto.openingBalance;

    return this.cardsRepository.save(card);
  }

  async remove(userId: string, id: string): Promise<void> {
    const card = await this.findOwnedOrFail(userId, id);
    await this.cardsRepository.remove(card);
  }

  private findOwnedOrFail(userId: string, id: string): Promise<Card> {
    return this.getOwned(userId, id);
  }
}
