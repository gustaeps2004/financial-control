import { Card, CardKicker } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Select } from "@/shared/ui/Select";
import { Checkbox } from "@/shared/ui/Checkbox";
import { usePreferences } from "../lib/usePreferences";

export function PreferencesCard() {
  const [preferences, updatePreferences] = usePreferences();

  return (
    <Card className="gap-3 p-4">
      <CardKicker>Preferences</CardKicker>
      <Field label="Currency">
        <Select
          value={preferences.currency}
          onChange={(e) =>
            updatePreferences({ currency: e.target.value as typeof preferences.currency })
          }
        >
          <option value="BRL">BRL — R$</option>
          <option value="USD">USD — $</option>
          <option value="EUR">EUR — €</option>
        </Select>
      </Field>
      <Field label="Month starts on">
        <Select
          value={preferences.monthStart}
          onChange={(e) =>
            updatePreferences({ monthStart: e.target.value as typeof preferences.monthStart })
          }
        >
          <option value="calendar">Day 1 (calendar month)</option>
          <option value="closing">Card closing day</option>
        </Select>
      </Field>
      <Checkbox
        label="Post recurring expenses automatically"
        checked={preferences.autoPostRecurring}
        onChange={(e) => updatePreferences({ autoPostRecurring: e.target.checked })}
      />
    </Card>
  );
}
