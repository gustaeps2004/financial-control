import { Card } from '../../../domain/entities/card.entity';

export class CardResponseDto {
  readonly id: string;
  readonly brand: string;
  readonly mark: string;
  readonly swatch: string;
  readonly nickname: string;
  readonly creditLimit: number;
  readonly closingDay: number;
  readonly openingBalance: number;
  readonly createdAt?: Date;

  constructor(card: Card) {
    this.id = card.id!;
    this.brand = card.brand;
    this.mark = card.mark;
    this.swatch = card.swatch;
    this.nickname = card.nickname;
    this.creditLimit = card.creditLimit;
    this.closingDay = card.closingDay;
    this.openingBalance = card.openingBalance;
    this.createdAt = card.createdAt;
  }
}
