import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cardsApi } from "../api/cards.api";
import type { CardAccount, CardUpdateInput, NewCardInput } from "../types";

interface CardsContextValue {
  cards: CardAccount[];
  isLoading: boolean;
  addCard: (input: NewCardInput) => Promise<void>;
  updateCard: (id: string, patch: CardUpdateInput) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  removeCardsByBrand: (brand: string) => Promise<void>;
}

const CardsContext = createContext<CardsContextValue | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const token = session?.token ?? "";

  const [cards, setCards] = useState<CardAccount[]>([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(token));

  async function refresh(): Promise<void> {
    if (!token) return;
    const result = await cardsApi.list(token);
    setCards(result);
  }

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    cardsApi
      .list(token)
      .then((result) => {
        if (!cancelled) setCards(result);
      })
      .catch(() => {
        if (!cancelled) setCards([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Always re-sync with the server after a mutation, even when it fails, so
  // local state can never drift from what the server actually holds.
  async function addCard(input: NewCardInput): Promise<void> {
    if (!token) return;
    try {
      await cardsApi.create(input, token);
    } finally {
      await refresh();
    }
  }

  async function updateCard(id: string, patch: CardUpdateInput): Promise<void> {
    if (!token) return;
    try {
      await cardsApi.update(id, patch, token);
    } finally {
      await refresh();
    }
  }

  async function removeCard(id: string): Promise<void> {
    if (!token) return;
    try {
      await cardsApi.remove(id, token);
    } finally {
      await refresh();
    }
  }

  async function removeCardsByBrand(brand: string): Promise<void> {
    if (!token) return;
    const toRemove = cards.filter((c) => c.brand === brand);
    try {
      await Promise.all(toRemove.map((c) => cardsApi.remove(c.id, token)));
    } finally {
      await refresh();
    }
  }

  const value: CardsContextValue = {
    cards,
    isLoading,
    addCard,
    updateCard,
    removeCard,
    removeCardsByBrand,
  };

  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>;
}

export function useCards(): CardsContextValue {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error("useCards must be used within a CardsProvider");
  }
  return context;
}
