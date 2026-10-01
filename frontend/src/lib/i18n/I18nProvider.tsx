import { useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nContext, type I18n } from "./i18n-context";
import { loadLocale, saveLocale } from "./locale-storage";
import { preferredLocale, type Locale } from "./locales";
import { en, type Messages } from "./messages/en";
import { ptBR } from "./messages/pt-BR";

const MESSAGES: Record<Locale, Messages> = { en, "pt-BR": ptBR };

export function I18nProvider({ children }: { children: ReactNode }) {
  // A language picked on this device wins; otherwise the browser's.
  const [locale, setLocale] = useState<Locale>(
    () => loadLocale() ?? preferredLocale(navigator.languages),
  );

  // Screen readers, hyphenation and the browser's offer to translate all
  // go by the page's lang.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18n>(
    () => ({
      locale,
      t: MESSAGES[locale],
      setLocale: (next) => {
        saveLocale(next);
        setLocale(next);
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
