import type { ReactNode } from "react";
import { Card } from "@/shared/ui/Card";

interface StatTileProps {
  label: string;
  value: string;
  detail?: ReactNode;
}

/** One headline number: label, value, one line of context. */
export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <Card className="gap-1 p-3.5 sm:p-4">
      <span className="text-[12px] text-ink/60">{label}</span>
      {/* Proportional figures: tabular digits look loose at this size. */}
      <span className="text-[20px] leading-tight font-semibold tracking-[-0.015em] sm:text-[24px]">
        {value}
      </span>
      {detail && <span className="text-[11.5px] text-ink/55">{detail}</span>}
    </Card>
  );
}
