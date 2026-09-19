import type { SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-9 w-full rounded-md border border-divider bg-surface px-2.5 py-1.5 text-[14px] text-ink",
        "hover:border-ink/45 focus-visible:border-accent focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
