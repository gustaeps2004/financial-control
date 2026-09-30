export interface CardAccount {
  id: string;
  brand: string;
  mark: string;
  swatch: string;
  nick: string;
  limit: number;
  closeDay: string;
  // Empty when the bill is due in the same month the statement closes.
  dueDay: string;
  opening: number;
}

export interface NewCardInput {
  brand: string;
  mark: string;
  swatch: string;
  nick: string;
}

export interface CardUpdateInput {
  nick?: string;
  limit?: number;
  closeDay?: string;
  dueDay?: string;
  opening?: number;
}

export interface CardResponse {
  id: string;
  brand: string;
  mark: string;
  swatch: string;
  nickname: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number | null;
  openingBalance: number;
  createdAt?: string;
}

export interface CreateCardRequest {
  brand: string;
  mark: string;
  swatch: string;
  nickname: string;
}

export interface UpdateCardRequest {
  nickname?: string;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number | null;
  openingBalance?: number;
}
