export const LOCALES = ["en", "pt-BR"] as const;

export type Locale = (typeof LOCALES)[number];

/** Each language in its own name — the way a language picker lists them. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "pt-BR": "Português",
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** The first of the browser's languages the app speaks, else English. */
export function preferredLocale(languages: readonly string[]): Locale {
  for (const tag of languages) {
    const language = tag.toLowerCase().split("-")[0];
    if (language === "pt") return "pt-BR";
    if (language === "en") return "en";
  }
  return "en";
}
