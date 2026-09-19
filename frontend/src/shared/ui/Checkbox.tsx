import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("group inline-flex cursor-pointer items-center gap-2 text-[14px]", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        className={cn(
          "size-4 flex-none rounded-full border-[1.5px] border-divider group-hover:border-accent",
          "peer-checked:border-accent peer-checked:bg-accent peer-checked:shadow-[inset_0_0_0_4px_var(--color-canvas)]",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
        )}
      />
      <span className="text-neutral-400">{label}</span>
    </label>
  );
}
