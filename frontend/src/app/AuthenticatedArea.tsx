import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CardsProvider } from "@/features/cards/context/CardsContext";
import { CategoriesProvider } from "@/features/categories/context/CategoriesContext";
import { DataRevisionProvider } from "@/lib/data/DataRevisionProvider";

export function AuthenticatedArea() {
  const { session } = useAuth();

  return (
    <RequireAuth>
      <DataRevisionProvider key={session?.email}>
        <CategoriesProvider key={session?.email}>
          <CardsProvider key={session?.email}>
            <Outlet />
          </CardsProvider>
        </CategoriesProvider>
      </DataRevisionProvider>
    </RequireAuth>
  );
}
