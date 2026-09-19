import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

// Deliberately a gradient, not a border — the rule fades at both ends.
const headRuleStyle = {
  background:
    "linear-gradient(to right, transparent, var(--color-divider) 48px, var(--color-divider) calc(100% - 48px), transparent) no-repeat bottom / 100% 1px",
};
const bodyRuleStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-ink) 8%, transparent) 48px, color-mix(in srgb, var(--color-ink) 8%, transparent) calc(100% - 48px), transparent) no-repeat bottom / 100% 1px",
};

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="w-full border-collapse text-[14px]">{children}</table>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr style={headRuleStyle}>{children}</tr>
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr style={bodyRuleStyle} className="hover:bg-ink/4">
      {children}
    </tr>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "p-1.5 text-left text-[11px] tracking-[0.08em] text-ink/60 uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-1.5", className)} {...props}>
      {children}
    </td>
  );
}
