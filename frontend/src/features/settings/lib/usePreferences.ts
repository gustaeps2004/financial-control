import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";

export interface Preferences {
  currency: "BRL" | "USD" | "EUR";
  monthStart: "calendar" | "closing";
  autoPostRecurring: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  currency: "BRL",
  monthStart: "calendar",
  autoPostRecurring: true,
};

function storageKey(email: string): string {
  return `tally.preferences.${email}`;
}

export function usePreferences(): [Preferences, (patch: Partial<Preferences>) => void] {
  const { session } = useAuth();
  const email = session?.email ?? "";

  const [preferences, setPreferences] = useState<Preferences>(() => {
    if (!email) return DEFAULT_PREFERENCES;
    try {
      const raw = localStorage.getItem(storageKey(email));
      return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    if (!email) return;
    localStorage.setItem(storageKey(email), JSON.stringify(preferences));
  }, [email, preferences]);

  function update(patch: Partial<Preferences>) {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }

  return [preferences, update];
}
