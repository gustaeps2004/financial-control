import { fromCents } from '../../../../shared/domain/money';
import { Card } from '../../../cards/domain/entities/card.entity';
import { Category } from '../../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../../categories/domain/enums/category-kind.enum';
import { CashFlow } from '../../domain/cash-flow';
import { Cents } from '../../domain/ledger';

// Reports keep resolving categories and cards removed since — past records
// still point at them — so every reference carries its own display data.

export interface CategoryRef {
  id: string;
  name: string;
  kind: CategoryKind;
  deleted: boolean;
}

export interface CardRef {
  id: string;
  nickname: string;
  brand: string;
  mark: string;
  swatch: string;
  deleted: boolean;
}

export interface CashFlowView {
  income: number;
  fixedBills: number;
  cardBills: number;
  cashExpenses: number;
  totalOut: number;
  savings: number;
  leftover: number;
  creditPurchases: number;
}

export const money = (cents: Cents): number => fromCents(cents);

export function categoryRef(category: Category): CategoryRef {
  return {
    id: category.id!,
    name: category.name,
    kind: category.kind,
    deleted: category.deletedAt !== null,
  };
}

export function cardRef(card: Card): CardRef {
  return {
    id: card.id!,
    nickname: card.nickname,
    brand: card.brand,
    mark: card.mark,
    swatch: card.swatch,
    deleted: card.deletedAt !== null,
  };
}

export function cashFlowView(cashFlow: CashFlow): CashFlowView {
  return {
    income: money(cashFlow.income),
    fixedBills: money(cashFlow.fixedBills),
    cardBills: money(cashFlow.cardBills),
    cashExpenses: money(cashFlow.cashExpenses),
    totalOut: money(cashFlow.totalOut),
    savings: money(cashFlow.savings),
    leftover: money(cashFlow.leftover),
    creditPurchases: money(cashFlow.creditPurchases),
  };
}

/** Lookups over everything a user ever had, deleted rows included. */
export class ReferenceIndex {
  private readonly categories: Map<string, Category>;
  private readonly cards: Map<string, Card>;

  constructor(categories: readonly Category[], cards: readonly Card[]) {
    this.categories = new Map(categories.map((c) => [c.id!, c]));
    this.cards = new Map(cards.map((c) => [c.id!, c]));
  }

  categoryMap(): ReadonlyMap<string, Category> {
    return this.categories;
  }

  cardList(): Card[] {
    return [...this.cards.values()];
  }

  card(id: string): Card | undefined {
    return this.cards.get(id);
  }

  categoryRef(id: string): CategoryRef | null {
    const category = this.categories.get(id);
    return category ? categoryRef(category) : null;
  }

  cardRef(id: string | null): CardRef | null {
    const card = id ? this.cards.get(id) : undefined;
    return card ? cardRef(card) : null;
  }
}
