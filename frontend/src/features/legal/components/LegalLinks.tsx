import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";

/** Both legal documents, for the foot of a page. */
export function LegalLinks({ className }: { className?: string }) {
  const { t } = useI18n();
  const linkClass = "text-neutral-500 no-underline hover:text-ink";

  return (
    <nav
      aria-label={t.legal.documents}
      className={cn("flex flex-wrap gap-x-4 gap-y-1 text-[12px]", className)}
    >
      <Link to="/terms" className={linkClass}>
        {t.legal.terms}
      </Link>
      <Link to="/privacy" className={linkClass}>
        {t.legal.privacy}
      </Link>
    </nav>
  );
}
