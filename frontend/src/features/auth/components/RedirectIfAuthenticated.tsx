import { useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Snapshot on mount only — a live read would race the page's own post-auth navigate().
  const [wasAuthenticatedOnEntry] = useState(isAuthenticated);

  if (wasAuthenticatedOnEntry) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
