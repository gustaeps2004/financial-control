import { Card, CardKicker } from "@/shared/ui/Card";
import { CategoryEditor } from "@/features/finance-data/components/CategoryEditor";
import { AccountCard } from "../components/AccountCard";
import { PreferencesCard } from "../components/PreferencesCard";
import { CardsSummaryCard } from "../components/CardsSummaryCard";
import { RecurringSummaryCard } from "../components/RecurringSummaryCard";
import { DangerZoneCard } from "../components/DangerZoneCard";

export function SettingsPage() {
  return (
    <div>
      <h3 className="mb-4.5">Settings</h3>
      <div className="grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-3.5">
        <AccountCard />
        <PreferencesCard />
        <Card className="gap-3 p-4">
          <CardKicker>Categories</CardKicker>
          <CategoryEditor />
        </Card>
        <CardsSummaryCard />
        <RecurringSummaryCard />
        <DangerZoneCard />
      </div>
    </div>
  );
}
