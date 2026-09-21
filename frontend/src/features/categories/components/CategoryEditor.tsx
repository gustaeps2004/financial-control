import { useState, type KeyboardEvent } from "react";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { ApiError } from "@/lib/http/api-error";
import { useCategories } from "../context/CategoriesContext";

type ChipTone = "surface" | "track";

interface CategoryEditorProps {
  tone?: ChipTone;
  placeholder?: string;
}

const toneClasses: Record<ChipTone, string> = {
  surface: "bg-surface text-[13px]",
  track: "bg-track text-[12.5px]",
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function CategoryEditor({ tone = "track", placeholder = "New category" }: CategoryEditorProps) {
  const { categories, addCategory, removeCategory } = useCategories();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function commit() {
    if (!draft.trim()) return;
    try {
      setError(null);
      await addCategory(draft);
      setDraft("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't add category. Please try again."));
    }
  }

  async function handleRemove(id: string) {
    try {
      setError(null);
      await removeCategory(id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't remove category. Please try again."));
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <span
            key={category.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md py-1 pr-1 pl-2.5",
              toneClasses[tone],
            )}
          >
            {category.name}
            <button
              type="button"
              onClick={() => void handleRemove(category.id)}
              className="cursor-pointer rounded border-0 bg-transparent px-[3px] text-[14px] leading-none text-neutral-600 hover:text-accent-300"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Input
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="secondary" className="flex-none" onClick={() => void commit()}>
          Add
        </Button>
      </div>
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </div>
  );
}
