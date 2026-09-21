import { Card, CardKicker } from "@/shared/ui/Card";
import { CategoryEditor } from "@/features/categories/components/CategoryEditor";
import { AccountCard } from "../components/AccountCard";
import { PreferencesCard } from "../components/PreferencesCard";
import { CardsSummaryCard } from "../components/CardsSummaryCard";
import { RecurringSummaryCard } from "../components/RecurringSummaryCard";
import { DangerZoneCard } from "../components/DangerZoneCard";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-275">
      <h3 className="mb-4.5">Settings</h3>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-3.5">
        <AccountCard />
        <PreferencesCard />
        <Card className="gap-3 p-4">
          <CardKicker>Categories</CardKicker>
          <CategoryEditor />
        </Card>
        <CardsSummaryCard />
        <RecurringSummaryCard />
      </div>

      <div className="mt-6">
        <DangerZoneCard />
      </div>
    </div>
  );
}
