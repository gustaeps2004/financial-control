import { apiClient, withAuth } from "@/lib/http/api-client";
import type {
  CardAccount,
  CardResponse,
  CardUpdateInput,
  CreateCardRequest,
  NewCardInput,
  UpdateCardRequest,
} from "../types";

function toCardAccount(response: CardResponse): CardAccount {
  return {
    id: response.id,
    brand: response.brand,
    mark: response.mark,
    swatch: response.swatch,
    nick: response.nickname,
    limit: response.creditLimit,
    closeDay: String(response.closingDay),
    dueDay: response.dueDay === null ? "" : String(response.dueDay),
    opening: response.openingBalance,
  };
}

function toUpdateRequest(patch: CardUpdateInput): UpdateCardRequest {
  const request: UpdateCardRequest = {};
  if (patch.nick !== undefined) request.nickname = patch.nick;
  if (patch.limit !== undefined) request.creditLimit = patch.limit;
  if (patch.closeDay !== undefined) {
    const closingDay = parseInt(patch.closeDay, 10);
    if (!Number.isNaN(closingDay)) request.closingDay = closingDay;
  }
  if (patch.dueDay !== undefined) {
    const dueDay = parseInt(patch.dueDay, 10);
    if (patch.dueDay.trim() === "") request.dueDay = null;
    else if (!Number.isNaN(dueDay)) request.dueDay = dueDay;
  }
  if (patch.opening !== undefined) request.openingBalance = patch.opening;
  return request;
}

export const cardsApi = {
  list: async (token: string): Promise<CardAccount[]> => {
    const cards = await apiClient.get<CardResponse[]>("/cards", withAuth(token));
    return cards.map(toCardAccount);
  },
  create: async (input: NewCardInput, token: string): Promise<CardAccount> => {
    const payload: CreateCardRequest = {
      brand: input.brand,
      mark: input.mark,
      swatch: input.swatch,
      nickname: input.nick,
    };
    const card = await apiClient.post<CardResponse, CreateCardRequest>(
      "/cards",
      payload,
      withAuth(token),
    );
    return toCardAccount(card);
  },
  update: async (id: string, patch: CardUpdateInput, token: string): Promise<CardAccount> => {
    const card = await apiClient.patch<CardResponse, UpdateCardRequest>(
      `/cards/${id}`,
      toUpdateRequest(patch),
      withAuth(token),
    );
    return toCardAccount(card);
  },
  remove: (id: string, token: string) => apiClient.delete(`/cards/${id}`, withAuth(token)),
};
