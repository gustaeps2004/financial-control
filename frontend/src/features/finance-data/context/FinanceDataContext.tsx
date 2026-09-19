import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { loadFinanceData, saveFinanceData } from "../lib/storage";
import type { CardAccount, FinanceData, PaymentMethod, RecurringItem, Transaction } from "../types";

interface NewCardInput {
  brand: string;
  mark: string;
  swatch: string;
  nick: string;
}

interface NewTransactionInput {
  year: number;
  month: number;
  day: number;
  desc: string;
  cat: string;
  amount: number;
  kind: "in" | "out";
  method: PaymentMethod;
  cardId: string | null;
}

interface FinanceDataContextValue extends FinanceData {
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  addCard: (input: NewCardInput) => void;
  updateCard: (id: string, patch: Partial<CardAccount>) => void;
  removeCard: (id: string) => void;
  removeCardsByBrand: (brand: string) => void;
  addRecurring: (input: Omit<RecurringItem, "id">) => void;
  removeRecurring: (id: string) => void;
  addTransaction: (input: NewTransactionInput) => void;
  removeTransaction: (id: string) => void;
}

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function FinanceDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const email = session?.email ?? "";

  const [data, setData] = useState<FinanceData>(() => loadFinanceData(email));

  useEffect(() => {
    if (!email) return;
    saveFinanceData(email, data);
  }, [email, data]);

  const value: FinanceDataContextValue = {
    ...data,

    addCategory: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setData((prev) =>
        prev.categories.includes(trimmed)
          ? prev
          : { ...prev, categories: [...prev.categories, trimmed] },
      );
    },

    removeCategory: (name) => {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== name),
      }));
    },

    addCard: (input) => {
      const card: CardAccount = {
        id: makeId("card"),
        brand: input.brand,
        mark: input.mark,
        swatch: input.swatch,
        nick: input.nick,
        last4: "0000",
        limit: 3000,
        closeDay: "10",
        opening: 0,
      };
      setData((prev) => ({ ...prev, cards: [...prev.cards, card] }));
    },

    updateCard: (id, patch) => {
      setData((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },

    removeCard: (id) => {
      setData((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.id !== id) }));
    },

    removeCardsByBrand: (brand) => {
      setData((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.brand !== brand) }));
    },

    addRecurring: (input) => {
      const item: RecurringItem = { id: makeId("rec"), ...input };
      setData((prev) => ({ ...prev, recurring: [...prev.recurring, item] }));
    },

    removeRecurring: (id) => {
      setData((prev) => ({
        ...prev,
        recurring: prev.recurring.filter((r) => r.id !== id),
      }));
    },

    addTransaction: (input) => {
      const txn: Transaction = { id: makeId("txn"), ...input };
      setData((prev) => ({ ...prev, transactions: [...prev.transactions, txn] }));
    },

    removeTransaction: (id) => {
      setData((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
    },
  };

  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}

export function useFinanceData(): FinanceDataContextValue {
  const context = useContext(FinanceDataContext);
  if (!context) {
    throw new Error("useFinanceData must be used within a FinanceDataProvider");
  }
  return context;
}

export type { Transaction as FinanceTransaction };
