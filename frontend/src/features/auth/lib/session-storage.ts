import type { Session } from "../types";

const SESSION_KEY = "tally.session";
const DISPLAY_NAMES_KEY = "tally.displayNames";

export function saveSession(session: Session, keepSignedIn: boolean): void {
  const store = keepSignedIn ? localStorage : sessionStorage;
  const other = keepSignedIn ? sessionStorage : localStorage;
  store.setItem(SESSION_KEY, JSON.stringify(session));
  other.removeItem(SESSION_KEY);
}

export function loadSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function readDisplayNames(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(DISPLAY_NAMES_KEY) ?? "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

export function saveDisplayName(email: string, name: string): void {
  const names = readDisplayNames();
  names[email] = name;
  localStorage.setItem(DISPLAY_NAMES_KEY, JSON.stringify(names));
}

export function getDisplayName(email: string): string | null {
  return readDisplayNames()[email] ?? null;
}
