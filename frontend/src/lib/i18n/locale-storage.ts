import { isLocale, type Locale } from "./locales";

// The language belongs to the device, not to an account: it applies before
// anyone signs in.
const LOCALE_KEY = "tally.locale";

// Storage throws in some private modes or with site data blocked; the choice
// then lasts only for this visit.
export function loadLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Applied anyway, just not remembered.
  }
}
