import { useState } from "react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { saveDisplayName } from "@/features/auth/lib/session-storage";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import { downloadCsv, transactionsToCsv } from "@/features/finance-data/lib/csv-export";

export function AccountCard() {
  const { session, displayName } = useAuth();
  const { cards, transactions } = useFinanceData();
  const [name, setName] = useState(displayName);
  const [saved, setSaved] = useState(false);

  function handleNameBlur() {
    if (!session || !name.trim() || name === displayName) return;
    saveDisplayName(session.email, name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleExport() {
    const csv = transactionsToCsv(transactions, cards);
    downloadCsv("tally-transactions.csv", csv);
  }

  return (
    <Card className="gap-3 p-4">
      <CardKicker>Account</CardKicker>
      <Field label="Full name">
        <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} />
      </Field>
      <Field label="Email">
        <Input value={session?.email ?? ""} disabled />
      </Field>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled>
          Change password
        </Button>
        <Button variant="ghost" onClick={handleExport} disabled={transactions.length === 0}>
          Export CSV
        </Button>
        {saved && <span className="text-[12px] text-accent">Saved</span>}
      </div>
    </Card>
  );
}
