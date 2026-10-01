import { useEffect, useRef, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/cn";

type DialogSize = "md" | "lg";

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: DialogSize;
}

const sizeClasses: Record<DialogSize, string> = {
  md: "w-[min(560px,calc(100vw-32px))]",
  lg: "w-[min(700px,calc(100vw-32px))]",
};

/** A modal on top of the native <dialog>: focus trap and Esc come for free. */
export function Dialog({ open, title, onClose, children, size = "md" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto rounded-lg border-0 bg-surface p-0 text-ink",
        "shadow-[var(--shadow-elev-lg)] backdrop:bg-black/60",
        sizeClasses[size],
      )}
    >
      {open && (
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="m-0 text-[16px] font-semibold">{title}</h4>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-neutral-500 hover:bg-ink/7 hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
