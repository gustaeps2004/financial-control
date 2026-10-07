import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { LedgerEntry } from "@/features/reports/types";
import { yearMonthOf } from "@/shared/lib/dates";
import { recurringApi } from "../api/recurring.api";

// What a toggle was switched to, and what the loaded entry said back then.
interface Toggled {
  from: boolean;
  to: boolean;
}

// A recurring transaction in a month: what a paid mark belongs to, whether
// the entry is the automatic one or the value logged by hand.
function occurrenceOf(entry: LedgerEntry): string {
  return `${entry.recurringTransactionId}|${yearMonthOf(entry.date)}`;
}

/**
 * Ticks recurring bills off as paid, month by month. A mark changes no
 * total, so nothing reloads: a toggle shows its new state at once and keeps
 * it until data loaded later says otherwise.
 */
export function usePaidMarks() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const [toggled, setToggled] = useState<ReadonlyMap<string, Toggled>>(new Map());
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());

  function isPaid(entry: LedgerEntry): boolean | null {
    if (entry.paid === null) return null;
    const toggle = toggled.get(occurrenceOf(entry));
    // Once reloaded data differs from what the toggle started from, it is
    // newer than the toggle: trust it.
    return toggle && toggle.from === entry.paid ? toggle.to : entry.paid;
  }

  async function setPaid(entry: LedgerEntry, paid: boolean): Promise<void> {
    const occurrence = occurrenceOf(entry);
    const before = toggled.get(occurrence);
    const id = entry.recurringTransactionId!;
    const month = yearMonthOf(entry.date);

    setToggled((current) => new Map(current).set(occurrence, { from: entry.paid!, to: paid }));
    setSaving((current) => new Set(current).add(occurrence));
    try {
      await (paid
        ? recurringApi.markPaid(id, month, token)
        : recurringApi.markUnpaid(id, month, token));
    } catch (err) {
      setToggled((current) => {
        const next = new Map(current);
        if (before) next.set(occurrence, before);
        else next.delete(occurrence);
        return next;
      });
      throw err;
    } finally {
      setSaving((current) => {
        const next = new Set(current);
        next.delete(occurrence);
        return next;
      });
    }
  }

  return {
    isPaid,
    setPaid,
    // A toggle waits for its request before taking another click, so the
    // requests of one bill never race each other.
    isSaving: (entry: LedgerEntry) => saving.has(occurrenceOf(entry)),
  };
}
