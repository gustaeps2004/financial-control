import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Checkbox } from "@/shared/ui/Checkbox";
import { ApiError } from "@/lib/http/api-error";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "../context/AuthContext";
import { getDisplayName } from "../lib/session-storage";
import { GOOGLE_CLIENT_ID, credentialEmail } from "../lib/google-identity";
import { AuthLayout } from "../components/AuthLayout";
import { GoogleButton } from "../components/GoogleButton";
import { OrDivider } from "../components/OrDivider";

// A Google sign-in waiting for the password of the account with its email,
// which links the two.
interface PendingLink {
  credential: string;
  email: string;
}

function pendingLinkFor(credential: string): PendingLink | null {
  const email = credentialEmail(credential);
  return email ? { credential, email } : null;
}

// Sign-up sends people here when their Google email already has an account.
function pendingLinkFrom(state: unknown): PendingLink | null {
  const credential = (state as { googleCredential?: unknown } | null)?.googleCredential;
  return typeof credential === "string" ? pendingLinkFor(credential) : null;
}

export function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingLink, setPendingLink] = useState(() => pendingLinkFrom(location.state));
  const [email, setEmail] = useState(pendingLink?.email ?? "");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const knownName = getDisplayName(email.trim().toLowerCase());

  // Read once: reloading the page shouldn't bring the link back.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  function cancelLink() {
    setPendingLink(null);
    setPassword("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (pendingLink) {
        await signInWithGoogle(pendingLink.credential, { keepSignedIn, password });
      } else {
        await login(email.trim().toLowerCase(), password, keepSignedIn);
      }
      navigate("/app/dashboard");
    } catch (err) {
      // Expired while the password was being typed: back to the Google button.
      if (pendingLink && err instanceof ApiError && err.code === "INVALID_GOOGLE_CREDENTIAL") {
        cancelLink();
        setGoogleError(errorMessage(err, t, t.auth.login.failed));
      } else {
        setError(errorMessage(err, t, t.auth.login.failed));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setError(null);
    setGoogleError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle(credential, { keepSignedIn });
      navigate("/app/dashboard");
    } catch (err) {
      const link =
        err instanceof ApiError && err.code === "GOOGLE_LINK_REQUIRES_PASSWORD"
          ? pendingLinkFor(credential)
          : null;
      if (link) {
        setPendingLink(link);
        setEmail(link.email);
        setPassword("");
      } else {
        setGoogleError(errorMessage(err, t, t.auth.login.failed));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      hero={
        <>
          <div className="max-w-[420px]">
            <h1 className="mb-4 text-[46px] leading-[1.05] tracking-[-0.03em] whitespace-pre-line">
              {t.auth.login.heroTitle}
            </h1>
            <p className="m-0 max-w-[330px] text-[15px] text-neutral-400 text-pretty">
              {t.auth.login.heroText}
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-[12px] text-neutral-600">
            <span>{t.auth.login.privateByDefault}</span>
            <span>{t.auth.login.noBankLinking}</span>
          </div>
        </>
      }
    >
      <h3 className="mb-1">{t.auth.login.title}</h3>
      <p className="mb-5.5 text-[13px] text-ink/55">{t.auth.login.welcomeBack(knownName)}</p>

      {pendingLink && (
        <p
          id="login-link-notice"
          className="mt-0 mb-4 rounded-md border border-accent/40 bg-accent/10 px-3 py-2.5 text-[13px] text-pretty"
        >
          {t.auth.login.linkGoogle(pendingLink.email)}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label={t.fields.email} htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            // The account to link is the one with the Google email.
            readOnly={pendingLink !== null}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t.fields.password} htmlFor="login-password">
          <PasswordInput
            // A new field when linking starts, so it takes the focus.
            key={pendingLink ? "link" : "login"}
            id="login-password"
            autoComplete="current-password"
            autoFocus={pendingLink !== null}
            aria-describedby={pendingLink ? "login-link-notice" : undefined}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="mb-1.5 flex items-center justify-between gap-3">
          <Checkbox
            label={t.auth.login.keepSignedIn}
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
          />
          <a
            href="#"
            className="text-[12px] text-accent no-underline"
            onClick={(e) => e.preventDefault()}
          >
            {t.auth.login.forgot}
          </a>
        </div>

        {error && <p className="m-0 text-[13px] text-accent-300">{error}</p>}

        {pendingLink ? (
          <>
            <Button type="submit" variant="primary" block disabled={isSubmitting}>
              {isSubmitting ? t.auth.login.linking : t.auth.login.link}
            </Button>
            <Button block onClick={cancelLink}>
              {t.common.cancel}
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" variant="primary" block disabled={isSubmitting}>
              {isSubmitting ? t.auth.login.submitting : t.auth.login.submit}
            </Button>
            <Link to="/signup" className={buttonVariants({ variant: "secondary", block: true })}>
              {t.auth.login.createAccount}
            </Link>
          </>
        )}
      </form>

      {GOOGLE_CLIENT_ID && !pendingLink && (
        <div className="mt-5 flex flex-col gap-3">
          <OrDivider />
          <GoogleButton
            text="signin_with"
            onCredential={handleGoogleCredential}
            disabled={isSubmitting}
          />
          {googleError && <p className="m-0 text-[13px] text-accent-300">{googleError}</p>}
        </div>
      )}
    </AuthLayout>
  );
}
