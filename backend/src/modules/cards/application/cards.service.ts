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

  async update(userId: string, id: string, dto: UpdateCardDto): Promise<Card> {
    const card = await this.findOwnedOrFail(userId, id);

    if (dto.nickname !== undefined) card.nickname = dto.nickname;
    if (dto.creditLimit !== undefined) card.creditLimit = dto.creditLimit;
    if (dto.closingDay !== undefined) card.closingDay = dto.closingDay;
    if (dto.openingBalance !== undefined)
      card.openingBalance = dto.openingBalance;

    return this.cardsRepository.save(card);
  }

  async remove(userId: string, id: string): Promise<void> {
    const card = await this.findOwnedOrFail(userId, id);
    await this.cardsRepository.remove(card);
  }

  private async findOwnedOrFail(userId: string, id: string): Promise<Card> {
    const card = await this.cardsRepository.findById(id);
    if (!card || card.userId !== userId) {
      throw new CardNotFoundException();
    }
    return card;
  }
}
