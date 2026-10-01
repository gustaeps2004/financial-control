import { useState, type KeyboardEvent } from "react";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCategories } from "../context/CategoriesContext";
import { CATEGORY_KINDS, type Category, type CategoryKind } from "../types";

type ChipTone = "surface" | "track";

interface CategoryEditorProps {
  tone?: ChipTone;
  placeholder?: string;
}

const toneClasses: Record<ChipTone, string> = {
  surface: "bg-surface text-[13px]",
  track: "bg-track text-[12.5px]",
};

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
  const { t } = useI18n();

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
          aria-label={t.categories.kindOf(category.name)}
          value={category.kind}
          onChange={(e) => onChangeKind(e.target.value as CategoryKind)}
          className="cursor-pointer rounded border border-divider bg-canvas px-1 py-0.5 text-[12px] text-ink"
        >
          {CATEGORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {t.categories.kinds[kind]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded border-0 bg-transparent px-1 text-[12px] text-accent"
        >
          {t.categories.done}
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
        title={t.categories.changeKind}
        className="cursor-pointer border-0 bg-transparent p-0 text-inherit hover:text-accent-300"
      >
        {category.name}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t.common.remove(category.name)}
        className="cursor-pointer rounded border-0 bg-transparent px-[3px] text-[14px] leading-none text-neutral-600 hover:text-accent-300"
      >
        ×
      </button>
    </span>
  );
}

export function CategoryEditor({ tone = "track", placeholder }: CategoryEditorProps) {
  const { categories, addCategory, updateCategory, removeCategory } = useCategories();
  const { t } = useI18n();
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
      setError(errorMessage(err, t, t.categories.addFailed));
    }
  }

  async function handleChangeKind(id: string, kind: CategoryKind) {
    try {
      setError(null);
      await updateCategory(id, { kind });
    } catch (err) {
      setError(errorMessage(err, t, t.categories.changeFailed));
    }
  }

  async function handleRemove(id: string) {
    try {
      setError(null);
      await removeCategory(id);
    } catch (err) {
      setError(errorMessage(err, t, t.categories.removeFailed));
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
          <section key={kind} aria-label={t.categories.kinds[kind]} className="flex flex-col gap-1.5">
            <h6 className="m-0 text-[12px] font-medium text-ink/75">{t.categories.kinds[kind]}</h6>
            <div className="flex flex-wrap gap-1.5">
              {ofKind.length === 0 && (
                <span className="text-[12px] text-ink/40">{t.categories.kindHints[kind]}</span>
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
          aria-label={t.categories.nameLabel}
          placeholder={placeholder ?? t.categories.newPlaceholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-[2_1_140px]"
        />
        <Select
          aria-label={t.categories.kindLabel}
          value={draftKind}
          onChange={(e) => setDraftKind(e.target.value as CategoryKind)}
          className="w-auto flex-[1_1_120px]"
        >
          {CATEGORY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {t.categories.kinds[kind]}
            </option>
          ))}
        </Select>
        <Button variant="secondary" className="flex-none" onClick={() => void commit()}>
          {t.common.add}
        </Button>
      </div>
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </div>
  );
}
