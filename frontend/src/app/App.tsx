import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { RedirectIfAuthenticated } from "@/features/auth/components/RedirectIfAuthenticated";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { SetupLayout } from "@/features/onboarding/components/SetupLayout";
import { CategoriesStepPage } from "@/features/onboarding/pages/CategoriesStepPage";
import { CardsStepPage } from "@/features/onboarding/pages/CardsStepPage";
import { RecurringStepPage } from "@/features/onboarding/pages/RecurringStepPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { TransactionsPage } from "@/features/transactions/pages/TransactionsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { AppShell } from "./AppShell";
import { AuthenticatedArea } from "./AuthenticatedArea";
import { RootRedirect } from "./RootRedirect";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<RootRedirect />} />

          <Route
            path="login"
            element={
              <RedirectIfAuthenticated>
                <LoginPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="signup"
            element={
              <RedirectIfAuthenticated>
                <SignupPage />
              </RedirectIfAuthenticated>
            }
          />

          <Route path="setup" element={<AuthenticatedArea />}>
            <Route element={<SetupLayout />}>
              <Route index element={<Navigate to="categories" replace />} />
              <Route path="categories" element={<CategoriesStepPage />} />
              <Route path="cards" element={<CardsStepPage />} />
              <Route path="recurring" element={<RecurringStepPage />} />
            </Route>
          </Route>

          <Route path="app" element={<AuthenticatedArea />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
