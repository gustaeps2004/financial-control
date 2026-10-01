import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // A control inside the end of the field, like the show-password toggle;
  // the text stops short of it.
  trailing?: ReactNode;
}

export function Input({ className, trailing, ...props }: InputProps) {
  const input = (
    <input
      className={cn(
        "min-h-9 w-full rounded-md border border-divider bg-surface py-1.5 text-[14px] text-ink",
        trailing ? "pr-9 pl-2.5" : "px-2.5",
        "placeholder:text-ink/40 caret-accent",
        "hover:border-ink/45 focus-visible:border-accent focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-divider",
        className,
      )}
      {...props}
    />
  );

  if (!trailing) return input;

  return (
    <div className="relative">
      {input}
      <div className="absolute inset-y-0 right-0 flex">{trailing}</div>
    </div>
  );
}
