export interface CardAccount {
  id: string;
  brand: string;
  mark: string;
  swatch: string;
  nick: string;
  limit: number;
  closeDay: string;
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
  openingBalance?: number;
}
