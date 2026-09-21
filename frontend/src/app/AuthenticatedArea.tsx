import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CardsProvider } from "@/features/cards/context/CardsContext";
import { CategoriesProvider } from "@/features/categories/context/CategoriesContext";
import { FinanceDataProvider } from "@/features/finance-data/context/FinanceDataContext";

export function AuthenticatedArea() {
  const { session } = useAuth();

  return (
    <RequireAuth>
      <CategoriesProvider key={session?.email}>
        <CardsProvider key={session?.email}>
          <FinanceDataProvider key={session?.email}>
            <Outlet />
          </FinanceDataProvider>
        </CardsProvider>
      </CategoriesProvider>
    </RequireAuth>
  );
}
