import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n/locales";

/** Every language side by side, each written in itself. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={cn("flex rounded-md border border-divider p-0.5", className)}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={locale === option}
          onClick={() => setLocale(option)}
          className={cn(
            "cursor-pointer rounded-[6px] border-0 px-2.5 py-1 text-[12px] font-medium",
            locale === option
              ? "bg-accent/16 text-ink"
              : "bg-transparent text-neutral-500 hover:text-ink",
          )}
        >
          {LOCALE_NAMES[option]}
        </button>
      ))}
    </div>
  );
}
