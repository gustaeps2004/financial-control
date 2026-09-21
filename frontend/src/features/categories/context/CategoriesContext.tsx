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

  async function addCategory(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed || !token) return;

    const category = await categoriesApi.create({ name: trimmed }, token);
    setCategories((prev) => [...prev, category].sort(byName));
  }

  async function renameCategory(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed || !token) return;

    const updated = await categoriesApi.rename(id, { name: trimmed }, token);
    setCategories((prev) =>
      [...prev.map((c) => (c.id === id ? { ...c, name: updated.name } : c))].sort(byName),
    );
  }

  async function removeCategory(id: string): Promise<void> {
    if (!token) return;

    await categoriesApi.remove(id, token);
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
