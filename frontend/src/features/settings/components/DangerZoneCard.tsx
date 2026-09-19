import { useNavigate } from "react-router-dom";
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
    <Card className="gap-2.5 p-4">
      <CardKicker>Danger zone</CardKicker>
      <p className="m-0 text-[13px] opacity-80">
        Deleting your account removes every transaction, card and category stored on
        this device. This cannot be undone.
      </p>
      <Button variant="secondary" className="self-start" onClick={handleDelete}>
        Delete account
      </Button>
    </Card>
  );
}
