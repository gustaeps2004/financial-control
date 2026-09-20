import { useNavigate } from "react-router-dom";
import { WarningCircle } from "@phosphor-icons/react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/features/auth/context/AuthContext";

export function DangerZoneCard() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  function handleDelete() {
    if (!session) return;
    const confirmed = window.confirm(
      "Delete your account? Every transaction, card and category stored on this device will be removed. This cannot be undone.",
    );
    if (!confirmed) return;

    localStorage.removeItem(`tally.finance.${session.email}`);
    localStorage.removeItem(`tally.preferences.${session.email}`);
    logout();
    navigate("/login");
  }

  return (
    <Card className="flex-row items-start gap-3.5 border border-danger/35 bg-danger/[0.07] p-4">
      <WarningCircle size={20} weight="fill" className="mt-0.5 flex-none text-danger" />
      <div className="flex flex-col gap-2.5">
        <CardKicker className="text-danger">Danger zone</CardKicker>
        <p className="m-0 text-[13px] opacity-80">
          Deleting your account removes every transaction, card and category stored on
          this device. <strong className="text-ink">This cannot be undone.</strong>
        </p>
        <Button variant="danger" className="self-start" onClick={handleDelete}>
          Delete account
        </Button>
      </div>
    </Card>
  );
}
