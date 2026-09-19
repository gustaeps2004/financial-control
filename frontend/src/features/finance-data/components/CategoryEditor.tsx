import { useState, type KeyboardEvent } from "react";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { useFinanceData } from "../context/FinanceDataContext";

type ChipTone = "surface" | "track";

interface CategoryEditorProps {
  tone?: ChipTone;
  placeholder?: string;
}

const toneClasses: Record<ChipTone, string> = {
  surface: "bg-surface text-[13px]",
  track: "bg-track text-[12.5px]",
};

export function CategoryEditor({ tone = "track", placeholder = "New category" }: CategoryEditorProps) {
  const { categories, addCategory, removeCategory } = useFinanceData();
  const [draft, setDraft] = useState("");

  function commit() {
    if (!draft.trim()) return;
    addCategory(draft);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {categories.map((name) => (
          <span
            key={name}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md py-1 pr-1 pl-2.5",
              toneClasses[tone],
            )}
          >
            {name}
            <button
              type="button"
              onClick={() => removeCategory(name)}
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
        <Button variant="secondary" className="flex-none" onClick={commit}>
          Add
        </Button>
      </div>
    </div>
  );
}
