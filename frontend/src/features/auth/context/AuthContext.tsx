import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi } from "../api/auth.api";
import {
  clearSession,
  forgetAccount,
  getDisplayName,
  loadSession,
  saveDisplayName,
  saveSession,
} from "../lib/session-storage";
import type { AccountConfirmation, Session } from "../types";

interface GoogleSignInOptions {
  keepSignedIn: boolean;
  // Links Google to the password account that has the Google account's email.
  password?: string;
  // Lets the sign-in create the account, as signing up does.
  acceptedTerms?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  displayName: string;
  login: (email: string, password: string, keepSignedIn: boolean) => Promise<void>;
  // Resolves to whether the sign-in created the account.
  signInWithGoogle: (
    credential: string,
    options: GoogleSignInOptions,
  ) => Promise<{ isNewUser: boolean }>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  deleteAccount: (confirmation: AccountConfirmation) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function resolveDisplayName(session: Session | null): string {
  if (!session) return "";
  return getDisplayName(session.email) ?? session.email.split("@")[0]!;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [displayName, setDisplayName] = useState<string>(() => resolveDisplayName(session));

  const startSession = (next: Session, keepSignedIn: boolean) => {
    saveSession(next, keepSignedIn);
    setSession(next);
    setDisplayName(resolveDisplayName(next));
  };

  const login = async (email: string, password: string, keepSignedIn: boolean) => {
    const response = await authApi.login({ email, password });
    startSession(
      {
        token: response.accessToken,
        expiresAt: response.expiresAt,
        email,
        signInMethod: "password",
      },
      keepSignedIn,
    );
  };

  const signInWithGoogle = async (
    credential: string,
    { keepSignedIn, password, acceptedTerms = false }: GoogleSignInOptions,
  ) => {
    const response = await authApi.loginWithGoogle({
      credential,
      password,
      acceptedPrivacyPolicy: acceptedTerms,
      acceptedTermsOfUse: acceptedTerms,
    });
    const { email, name } = response.user;
    // Google brings the name along. An account linked without one keeps the
    // name this device already knows.
    if (name) {
      saveDisplayName(email, name);
    }
    startSession(
      {
        token: response.accessToken,
        expiresAt: response.expiresAt,
        email,
        signInMethod: "google",
      },
      keepSignedIn,
    );
    return { isNewUser: response.isNewUser };
  };

  const register = async (email: string, password: string, name: string) => {
    await authApi.register({
      email,
      password,
      acceptedPrivacyPolicy: true,
      acceptedTermsOfUse: true,
    });
    if (name.trim()) {
      saveDisplayName(email, name.trim());
    }
    await login(email, password, true);
  };

  const updateName = async (name: string) => {
    const trimmed = name.trim();
    if (!session || !trimmed) return;

    await authApi.updateName(trimmed, session.token);
    saveDisplayName(session.email, trimmed);
    setDisplayName(trimmed);
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const deleteAccount = async (confirmation: AccountConfirmation) => {
    if (!session) return;
    await authApi.deleteAccount(confirmation, session.token);
    forgetAccount(session.email);
    logout();
  };

  const value: AuthContextValue = {
    session,
    isAuthenticated: session !== null,
    displayName,
    login,
    signInWithGoogle,
    register,
    updateName,
    deleteAccount,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useInitials(): string {
  const { displayName } = useAuth();
  return initialsFrom(displayName || "?");
}
