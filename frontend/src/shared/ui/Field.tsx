import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={htmlFor} className="mb-[5px] text-[12px] text-ink/70">
        {label}
      </label>
      {children}
    </div>
  );
}
