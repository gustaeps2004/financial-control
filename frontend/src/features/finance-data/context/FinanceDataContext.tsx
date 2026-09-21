import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { loadFinanceData, saveFinanceData } from "../lib/storage";
import type { FinanceData, PaymentMethod, RecurringItem, Transaction } from "../types";

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
