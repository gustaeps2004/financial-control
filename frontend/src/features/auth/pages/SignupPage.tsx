import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Checkbox } from "@/shared/ui/Checkbox";
import { cn } from "@/shared/lib/cn";
import { ApiError } from "@/lib/http/api-error";
import { useAuth } from "../context/AuthContext";
import { evaluatePasswordStrength } from "../lib/password-strength";
import { AuthBrand, AuthLayout } from "../components/AuthLayout";

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(email.trim().toLowerCase(), password, name);
      navigate("/setup/categories");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      hero={
        <>
          <AuthBrand />
          <div className="max-w-[420px]">
            <h1 className="mb-4 text-[42px] leading-[1.05] tracking-[-0.03em]">
              Three fields,
              <br />
              then you're tracking.
            </h1>
            <p className="m-0 max-w-[330px] text-[15px] text-neutral-400 text-pretty">
              Setup takes two minutes: name your categories, add your cards, set what
              repeats every month.
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[12px] text-neutral-600">
            <span className="h-0.5 w-[26px] bg-accent" />
            Step 0 of 3
          </div>
        </>
      }
    >
      <h3 className="mb-1">Create your account</h3>
      <p className="mb-5.5 text-[13px] text-ink/55">Free, and no card required.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Full name" htmlFor="signup-name">
          <Input
            id="signup-name"
            placeholder="Ana Ferreira"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email" htmlFor="signup-email">
          <Input
            id="signup-email"
            type="email"
            placeholder="voce@exemplo.com.br"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="signup-password" className="mb-0">
          <Input
            id="signup-password"
            type="password"
            placeholder="At least 8 characters"
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
          {password ? strength.hint : "At least 8 characters required."}
        </p>

        <Checkbox
          label="I agree to the Terms of Use and Privacy Policy"
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
        <p className="mt-4 text-[12px] text-ink/55">
          Already have one?{" "}
          <Link to="/login" className="text-accent no-underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
