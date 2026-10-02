import { useI18n } from "@/lib/i18n/i18n-context";

/** Splits the email-and-password form from signing in with Google. */
export function OrDivider() {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-3 text-[12px] text-neutral-500">
      <span aria-hidden className="h-px flex-1 bg-divider" />
      {t.auth.google.or}
      <span aria-hidden className="h-px flex-1 bg-divider" />
    </div>
  );
}
