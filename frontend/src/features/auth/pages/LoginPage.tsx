import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Checkbox } from "@/shared/ui/Checkbox";
import { ApiError } from "@/lib/http/api-error";
import { useAuth } from "../context/AuthContext";
import { getDisplayName } from "../lib/session-storage";
import { AuthBrand, AuthLayout } from "../components/AuthLayout";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knownName = getDisplayName(email.trim().toLowerCase());

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password, keepSignedIn);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Please try again.");
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
            <h1 className="mb-4 text-[46px] leading-[1.05] tracking-[-0.03em]">
              Every real,
              <br />
              accounted for.
            </h1>
            <p className="m-0 max-w-[330px] text-[15px] text-neutral-400 text-pretty">
              Categories you name yourself, the cards you actually carry, and a month
              that finally adds up.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-[12px] text-neutral-600">
            <span>Private by default</span>
            <span>No bank linking</span>
          </div>
        </>
      }
    >
      <h3 className="mb-1">Sign in</h3>
      <p className="mb-5.5 text-[13px] text-ink/55">
        {knownName ? `Welcome back, ${knownName}.` : "Welcome back."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Email" htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="mb-1.5 flex items-center justify-between gap-3">
          <Checkbox
            label="Keep me signed in"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
          />
          <a
            href="#"
            className="text-[12px] text-accent no-underline"
            onClick={(e) => e.preventDefault()}
          >
            Forgot?
          </a>
        </div>

        {error && <p className="m-0 text-[13px] text-accent-300">{error}</p>}

        <Button type="submit" variant="primary" block disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        <Link to="/signup" className={buttonVariants({ variant: "secondary", block: true })}>
          Create an account
        </Link>
      </form>
    </AuthLayout>
  );
}
