import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CategoriesProvider } from "@/features/categories/context/CategoriesContext";
import { FinanceDataProvider } from "@/features/finance-data/context/FinanceDataContext";

export function AuthenticatedArea() {
  const { session } = useAuth();

  return (
    <RequireAuth>
      <CategoriesProvider key={session?.email}>
        <FinanceDataProvider key={session?.email}>
          <Outlet />
        </FinanceDataProvider>
      </CategoriesProvider>
    </RequireAuth>
  );
}
