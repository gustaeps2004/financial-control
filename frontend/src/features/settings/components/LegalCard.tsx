import { Link } from "react-router-dom";
import { Card, CardKicker } from "@/shared/ui/Card";
import { buttonVariants } from "@/shared/ui/Button";
import { useI18n } from "@/lib/i18n/i18n-context";

export function LegalCard() {
  const { t } = useI18n();

  return (
    <Card className="gap-3 p-4">
      <CardKicker>{t.settings.legal.title}</CardKicker>
      <p className="m-0 text-[13px] text-neutral-400">{t.settings.legal.text}</p>
      <div className="flex flex-wrap gap-2">
        <Link to="/terms" className={buttonVariants({ variant: "secondary" })}>
          {t.legal.terms}
        </Link>
        <Link to="/privacy" className={buttonVariants({ variant: "secondary" })}>
          {t.legal.privacy}
        </Link>
      </div>
    </Card>
  );
}
