import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/app/dashboard" : "/login"} replace />;
}
