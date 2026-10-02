import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { WarningCircle } from "@phosphor-icons/react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "@/features/auth/context/AuthContext";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { credentialEmail } from "@/features/auth/lib/google-identity";

export function DangerZoneCard() {
  const { session, deleteAccount } = useAuth();
  const { t } = useI18n();
  const labels = t.settings.dangerZone;
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Whoever signed in with Google confirms with Google: the account may have
  // no password at all.
  const confirmsWithGoogle = session?.signInMethod === "google";

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    if (confirmsWithGoogle && !googleCredential) return;
    setError(null);
    setIsDeleting(true);
    try {
      await deleteAccount(googleCredential ? { googleCredential } : { password });
      navigate("/login");
    } catch (err) {
      // Turned down (another Google account, or expired): pick it again.
      setGoogleCredential(null);
      setError(errorMessage(err, t, labels.failed));
      setIsDeleting(false);
    }
  }

  function confirmWithGoogle(credential: string) {
    setGoogleCredential(credential);
    setError(null);
  }

  function cancel() {
    setIsConfirming(false);
    setPassword("");
    setGoogleCredential(null);
    setError(null);
  }

  const cancelButton = (
    <Button variant="secondary" onClick={cancel}>
      {t.common.cancel}
    </Button>
  );

  return (
    <Card className="flex-row items-start gap-3.5 border border-danger/35 bg-danger/[0.07] p-4">
      <WarningCircle size={20} weight="fill" className="mt-0.5 flex-none text-danger" />
      <div className="flex flex-col gap-2.5">
        <CardKicker className="text-danger">{labels.title}</CardKicker>
        <p className="m-0 text-[13px] opacity-80">
          {labels.warning} <strong className="text-ink">{labels.cannotUndo}</strong>
        </p>
        {!isConfirming ? (
          <Button variant="danger" className="self-start" onClick={() => setIsConfirming(true)}>
            {labels.deleteAccount}
          </Button>
        ) : confirmsWithGoogle ? (
          <form onSubmit={handleDelete} className="flex flex-col items-start gap-2.5">
            {googleCredential ? (
              <p className="m-0 text-[13px]">{labels.confirmedAs(credentialEmail(googleCredential))}</p>
            ) : (
              <>
                <p className="m-0 text-[13px]">{labels.confirmWithGoogle}</p>
                <div className="w-[260px] max-w-full">
                  <GoogleButton text="continue_with" onCredential={confirmWithGoogle} />
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="danger" disabled={isDeleting || !googleCredential}>
                {isDeleting ? labels.deleting : labels.deleteEverything}
              </Button>
              {cancelButton}
            </div>
          </form>
        ) : (
          <form onSubmit={handleDelete} className="flex flex-wrap items-end gap-2">
            <Field label={labels.confirmLabel} htmlFor="delete-password" className="flex-[0_1_240px]">
              <PasswordInput
                id="delete-password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="danger" disabled={isDeleting || !password}>
              {isDeleting ? labels.deleting : labels.deleteEverything}
            </Button>
            {cancelButton}
          </form>
        )}
        {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
      </div>
    </Card>
  );
}
