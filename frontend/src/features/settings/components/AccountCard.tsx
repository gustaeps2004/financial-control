import { useState } from "react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ApiError } from "@/lib/http/api-error";

export function AccountCard() {
  const { session, displayName, updateName } = useAuth();
  const [name, setName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUnchanged = !name.trim() || name.trim() === displayName;

  async function handleSave() {
    if (!session || isUnchanged) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateName(name);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update your name.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="gap-3 p-4">
      <CardKicker>Account</CardKicker>
      <Field label="Full name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input value={session?.email ?? ""} disabled />
      </Field>
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={handleSave} disabled={isUnchanged || isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-[12px] text-accent">Saved</span>}
        {error && <span className="text-[12px] text-accent-300">{error}</span>}
      </div>
    </Card>
  );
}
