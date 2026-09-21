import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { categoriesApi } from "../api/categories.api";
import type { Category } from "../types";

interface CategoriesContextValue {
  categories: Category[];
  isLoading: boolean;
  addCategory: (name: string) => Promise<void>;
  renameCategory: (id: string, name: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

function byName(a: Category, b: Category): number {
  return a.name.localeCompare(b.name);
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const token = session?.token ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(token));

  async function refresh(): Promise<void> {
    if (!token) return;
    const result = await categoriesApi.list(token);
    setCategories([...result].sort(byName));
  }

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    categoriesApi
      .list(token)
      .then((result) => {
        if (!cancelled) setCategories([...result].sort(byName));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Always re-sync with the server after a mutation, even when it fails —
  // e.g. a "name already exists" rejection means the local list was already
  // out of sync, and refreshing is what makes that visible instead of just
  // reporting an error about a category the user can't see anywhere.
  async function addCategory(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed || !token) return;

    try {
      await categoriesApi.create({ name: trimmed }, token);
    } finally {
      await refresh();
    }
  }

  async function renameCategory(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed || !token) return;

    try {
      await categoriesApi.rename(id, { name: trimmed }, token);
    } finally {
      await refresh();
    }
  }

  async function removeCategory(id: string): Promise<void> {
    if (!token) return;

    try {
      await categoriesApi.remove(id, token);
    } finally {
      await refresh();
    }
  }

  const value: CategoriesContextValue = {
    categories,
    isLoading,
    addCategory,
    renameCategory,
    removeCategory,
  };

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
