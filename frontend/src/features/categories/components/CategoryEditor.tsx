import { useState, type KeyboardEvent } from "react";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { ApiError } from "@/lib/http/api-error";
import { useCategories } from "../context/CategoriesContext";
import {
  CATEGORY_KINDS,
  CATEGORY_KIND_HINTS,
  CATEGORY_KIND_LABELS,
  type Category,
  type CategoryKind,
} from "../types";

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

interface CategoryChipProps {
  category: Category;
  tone: ChipTone;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onChangeKind: (kind: CategoryKind) => void;
  onRemove: () => void;
}

function CategoryChip({
  category,
  tone,
  isEditing,
  onEdit,
  onDone,
  onChangeKind,
  onRemove,
}: CategoryChipProps) {
  if (isEditing) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md py-0.5 pr-1 pl-2.5 outline outline-1 outline-accent/60",
          toneClasses[tone],
        )}
      >
        {category.name}
        <select
          aria-label={`Kind of ${category.name}`}
          value={category.kind}
          onChange={(e) => onChangeKind(e.target.value as CategoryKind)}
          className="cursor-pointer rounded border border-divider bg-canvas px-1 py-0.5 text-[12px] text-ink"
        >
          {CATEGORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {CATEGORY_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded border-0 bg-transparent px-1 text-[12px] text-accent"
        >
          Done
        </button>
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md py-1 pr-1 pl-2.5", toneClasses[tone])}
    >
      <button
        type="button"
        onClick={onEdit}
        title="Change kind"
        className="cursor-pointer border-0 bg-transparent p-0 text-inherit hover:text-accent-300"
      >
        {category.name}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${category.name}`}
        className="cursor-pointer rounded border-0 bg-transparent px-[3px] text-[14px] leading-none text-neutral-600 hover:text-accent-300"
      >
        ×
      </button>
    </span>
  );
}

export function CategoryEditor({ tone = "track", placeholder = "New category" }: CategoryEditorProps) {
  const { categories, addCategory, updateCategory, removeCategory } = useCategories();
  const [draft, setDraft] = useState("");
  const [draftKind, setDraftKind] = useState<CategoryKind>("EXPENSE");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function commit() {
    if (!draft.trim()) return;
    try {
      setError(null);
      await addCategory(draft, draftKind);
      setDraft("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't add category. Please try again."));
    }
  }

  async function handleChangeKind(id: string, kind: CategoryKind) {
    try {
      setError(null);
      await updateCategory(id, { kind });
    } catch (err) {
      setError(errorMessage(err, "Couldn't change that category. Please try again."));
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
    <div className="flex flex-col gap-3.5">
      {CATEGORY_KINDS.map((kind) => {
        const ofKind = categories.filter((category) => category.kind === kind);
        return (
          <section key={kind} aria-label={CATEGORY_KIND_LABELS[kind]} className="flex flex-col gap-1.5">
            <h6 className="m-0 text-[12px] font-medium text-ink/75">{CATEGORY_KIND_LABELS[kind]}</h6>
            <div className="flex flex-wrap gap-1.5">
              {ofKind.length === 0 && (
                <span className="text-[12px] text-ink/40">{CATEGORY_KIND_HINTS[kind]}</span>
              )}
              {ofKind.map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  tone={tone}
                  isEditing={editingId === category.id}
                  onEdit={() => setEditingId(category.id)}
                  onDone={() => setEditingId(null)}
                  onChangeKind={(next) => void handleChangeKind(category.id, next)}
                  onRemove={() => void handleRemove(category.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="flex flex-wrap gap-1.5">
        <Input
          aria-label="Category name"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-[2_1_140px]"
        />
        <Select
          aria-label="Category kind"
          value={draftKind}
          onChange={(e) => setDraftKind(e.target.value as CategoryKind)}
          className="w-auto flex-[1_1_120px]"
        >
          {CATEGORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {CATEGORY_KIND_LABELS[kind]}
            </option>
          ))}
        </Select>
        <Button variant="secondary" className="flex-none" onClick={() => void commit()}>
          Add
        </Button>
      </div>
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </div>
  );
}
