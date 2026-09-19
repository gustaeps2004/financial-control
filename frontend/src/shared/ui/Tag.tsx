import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type TagVariant = "neutral" | "accent" | "accent-2" | "outline";

interface TagProps {
  variant?: TagVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  neutral: "bg-neutral-800 text-neutral-100",
  accent: "bg-accent-800 text-accent-100",
  "accent-2": "bg-accent-2-800 text-accent-2-100",
  outline: "border border-accent text-accent",
};

export function Tag({ variant = "neutral", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2.5 py-[3px] text-[11px] tracking-[0.02em]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
