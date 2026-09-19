import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "min-h-9 w-full rounded-md border border-divider bg-surface px-2.5 py-1.5 text-[14px] text-ink",
        "placeholder:text-ink/40 caret-accent",
        "hover:border-ink/45 focus-visible:border-accent focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-divider",
        className,
      )}
      {...props}
    />
  );
}
