import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import { CategoryEditor } from "@/features/categories/components/CategoryEditor";

export function CategoriesStepPage() {
  const { categories } = useCategories();
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="mb-2">What do you spend on?</h2>
      <p className="mb-6 max-w-[470px] text-[14px] text-ink/55 text-pretty">
        Name your own categories — anything you'd want to see as a line on your month.
        Add more any time.
      </p>

      <div className="mb-4 max-w-[430px]">
        <CategoryEditor tone="surface" placeholder="e.g. Café, Cachorro, Projeto" />
      </div>

      <p className="mb-7.5 text-[12px] text-ink/55">
        {categories.length} categories. Most people land between six and twelve.
      </p>

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => navigate("/setup/cards")}>
          Continue
        </Button>
        <Button variant="ghost" onClick={() => navigate("/setup/cards")}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
