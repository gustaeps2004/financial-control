import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { WarningCircle } from "@phosphor-icons/react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { ApiError } from "@/lib/http/api-error";
import { useAuth } from "@/features/auth/context/AuthContext";

export function DangerZoneCard() {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsDeleting(true);
    try {
      await deleteAccount(password);
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete your account.");
      setIsDeleting(false);
    }
  }

  return (
    <Card className="flex-row items-start gap-3.5 border border-danger/35 bg-danger/[0.07] p-4">
      <WarningCircle size={20} weight="fill" className="mt-0.5 flex-none text-danger" />
      <div className="flex flex-col gap-2.5">
        <CardKicker className="text-danger">Danger zone</CardKicker>
        <p className="m-0 text-[13px] opacity-80">
          Deleting your account erases every transaction, card, category, recurring item
          and statement you recorded. <strong className="text-ink">This cannot be undone.</strong>
        </p>
        {isConfirming ? (
          <form onSubmit={handleDelete} className="flex flex-wrap items-end gap-2">
            <Field label="Type your password to confirm" htmlFor="delete-password" className="flex-[0_1_240px]">
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="danger" disabled={isDeleting || !password}>
              {isDeleting ? "Deleting…" : "Delete everything"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsConfirming(false);
                setPassword("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button variant="danger" className="self-start" onClick={() => setIsConfirming(true)}>
            Delete account
          </Button>
        )}
        {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
      </div>
    </Card>
  );
}
