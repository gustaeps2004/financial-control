import { Card, CardKicker } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Select } from "@/shared/ui/Select";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LOCALES, LOCALE_NAMES, isLocale } from "@/lib/i18n/locales";
import { usePreferences } from "../lib/usePreferences";

export function PreferencesCard() {
  const [preferences, updatePreferences] = usePreferences();
  const { t, locale, setLocale } = useI18n();

  return (
    <Card className="gap-3 p-4">
      <CardKicker>{t.settings.preferences.title}</CardKicker>
      <Field label={t.language.label} htmlFor="preferences-language">
        <Select
          id="preferences-language"
          value={locale}
          onChange={(e) => {
            if (isLocale(e.target.value)) setLocale(e.target.value);
          }}
        >
          {LOCALES.map((option) => (
            <option key={option} value={option} lang={option}>
              {LOCALE_NAMES[option]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.settings.preferences.currency}>
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
      <Field label={t.settings.preferences.monthStartsOn}>
        <Select
          value={preferences.monthStart}
          onChange={(e) =>
            updatePreferences({ monthStart: e.target.value as typeof preferences.monthStart })
          }
        >
          <option value="calendar">{t.settings.preferences.calendarMonth}</option>
          <option value="closing">{t.settings.preferences.cardClosingDay}</option>
        </Select>
      </Field>
    </Card>
  );
}
