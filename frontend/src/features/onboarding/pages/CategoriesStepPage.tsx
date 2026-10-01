import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import { CategoryEditor } from "@/features/categories/components/CategoryEditor";
import { useI18n } from "@/lib/i18n/i18n-context";

export function CategoriesStepPage() {
  const { categories } = useCategories();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div>
      <h2 className="mb-2">{t.onboarding.categories.title}</h2>
      <p className="mb-6 max-w-[500px] text-[14px] text-ink/55 text-pretty">
        {t.onboarding.categories.intro}
      </p>

      <div className="mb-4 max-w-[480px]">
        <CategoryEditor tone="surface" placeholder={t.onboarding.categories.placeholder} />
      </div>

      <p className="mb-7.5 text-[12px] text-ink/55">
        {t.onboarding.categories.count(categories.length)}
      </p>

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => navigate("/setup/cards")}>
          {t.common.continue}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/setup/cards")}>
          {t.onboarding.categories.skip}
        </Button>
      </div>
    </div>
  );
}
