import { useState } from "react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";

export function AccountCard() {
  const { session, displayName, updateName } = useAuth();
  const { t } = useI18n();
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
      setError(errorMessage(err, t, t.settings.account.updateFailed));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="gap-3 p-4">
      <CardKicker>{t.settings.account.title}</CardKicker>
      <Field label={t.fields.fullName}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label={t.fields.email}>
        <Input value={session?.email ?? ""} disabled />
      </Field>
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={handleSave} disabled={isUnchanged || isSaving}>
          {isSaving ? t.common.saving : t.common.save}
        </Button>
        {saved && <span className="text-[12px] text-accent">{t.common.saved}</span>}
        {error && <span className="text-[12px] text-accent-300">{error}</span>}
      </div>
    </Card>
  );
}
