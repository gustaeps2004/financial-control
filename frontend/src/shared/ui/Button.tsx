import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonVariantsOptions {
  variant?: ButtonVariant;
  block?: boolean;
  icon?: boolean;
  className?: string;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantsOptions {}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "text-accent border-accent hover:bg-accent/12 active:bg-accent/22",
  secondary: "border-divider hover:bg-ink/7 active:bg-ink/14",
  ghost: "text-accent border-transparent px-[3px] hover:bg-accent/10 active:bg-accent/18",
};

export function buttonVariants({
  variant = "secondary",
  block,
  icon,
  className,
}: ButtonVariantsOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium text-[14px] leading-tight text-ink",
    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-45",
    icon ? "size-9 p-0" : "px-3 py-1.5",
    block && "mt-1.5 w-full",
    variantClasses[variant],
    className,
  );
}

export function Button({
  variant = "secondary",
  block,
  icon,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, block, icon, className })}
      {...props}
    />
  );
}
