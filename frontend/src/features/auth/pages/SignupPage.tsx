import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Checkbox } from "@/shared/ui/Checkbox";
import { cn } from "@/shared/lib/cn";
import { ApiError } from "@/lib/http/api-error";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth } from "../context/AuthContext";
import { evaluatePasswordStrength } from "../lib/password-strength";
import { GOOGLE_CLIENT_ID } from "../lib/google-identity";
import { AuthLayout } from "../components/AuthLayout";
import { GoogleButton } from "../components/GoogleButton";
import { OrDivider } from "../components/OrDivider";

export function SignupPage() {
  const { register, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(email.trim().toLowerCase(), password, name);
      navigate("/setup/categories");
    } catch (err) {
      setError(errorMessage(err, t, t.auth.signup.failed));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setError(null);
    setGoogleError(null);
    setIsSubmitting(true);
    try {
      const { isNewUser } = await signInWithGoogle(credential, {
        keepSignedIn: true,
        acceptedTerms: true,
      });
      // Already signed up with this Google account: straight in.
      navigate(isNewUser ? "/setup/categories" : "/app/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.code === "GOOGLE_LINK_REQUIRES_PASSWORD") {
        // The email has a password account; signing in links the two.
        navigate("/login", { state: { googleCredential: credential } });
      } else {
        setGoogleError(errorMessage(err, t, t.auth.signup.failed));
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
            <h1 className="mb-4 text-[42px] leading-[1.05] tracking-[-0.03em] whitespace-pre-line">
              {t.auth.signup.heroTitle}
            </h1>
            <p className="m-0 max-w-[330px] text-[15px] text-neutral-400 text-pretty">
              {t.auth.signup.heroText}
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[12px] text-neutral-600">
            <span className="h-0.5 w-[26px] bg-accent" />
            {t.auth.signup.step(0, 3)}
          </div>
        </>
      }
    >
      <h3 className="mb-1">{t.auth.signup.title}</h3>
      <p className="mb-5.5 text-[13px] text-ink/55">{t.auth.signup.subtitle}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label={t.fields.fullName} htmlFor="signup-name">
          <Input
            id="signup-name"
            placeholder={t.auth.signup.namePlaceholder}
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t.fields.email} htmlFor="signup-email">
          <Input
            id="signup-email"
            type="email"
            placeholder={t.auth.signup.emailPlaceholder}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t.fields.password} htmlFor="signup-password" className="mb-0">
          <PasswordInput
            id="signup-password"
            placeholder={t.auth.signup.passwordPlaceholder}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="mb-0.5 flex gap-1">
          {[1, 2, 3].map((bar) => (
            <span
              key={bar}
              className={cn(
                "h-[3px] flex-1 rounded-sm",
                strength.score >= bar ? "bg-accent" : "bg-neutral-800",
              )}
            />
          ))}
        </div>
        <p className="mt-0 mb-1 text-[11px] text-ink/55">
          {t.auth.passwordStrength[password ? strength.hint : "tooShort"]}
        </p>

        <Checkbox
          label={t.auth.signup.acceptTerms}
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          required
        />

        {error && <p className="m-0 text-[13px] text-accent-300">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          block
          disabled={isSubmitting || !acceptedTerms}
        >
          {isSubmitting ? t.auth.signup.submitting : t.auth.signup.submit}
        </Button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <div className="mt-5 flex flex-col gap-3">
          <OrDivider />
          <GoogleButton
            text="signup_with"
            onCredential={handleGoogleCredential}
            // The same terms apply to accounts created with Google.
            disabled={isSubmitting || !acceptedTerms}
          />
          {googleError && <p className="m-0 text-[13px] text-accent-300">{googleError}</p>}
        </div>
      )}

      <p className="mt-4 text-[12px] text-ink/55">
        {t.auth.signup.haveAccount}{" "}
        <Link to="/login" className="text-accent no-underline">
          {t.auth.signup.signIn}
        </Link>
      </p>
    </AuthLayout>
  );
}
