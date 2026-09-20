import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type CardElevation = "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  children: ReactNode;
}

const elevationShadow: Record<CardElevation, string> = {
  sm: "shadow-[var(--shadow-elev-sm)]",
  md: "shadow-[var(--shadow-elev-md)]",
  lg: "shadow-[var(--shadow-elev-lg)]",
};

export function Card({ elevation = "sm", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md bg-surface p-3",
        elevationShadow[elevation],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardKicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-[10px] tracking-[0.1em] text-accent uppercase", className)}>
      {children}
    </span>
  );
}
