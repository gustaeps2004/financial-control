import { useEffect, useEffectEvent, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  GOOGLE_CLIENT_ID,
  loadGoogleIdentity,
  onGoogleCredential,
  type GoogleButtonOptions,
} from "../lib/google-identity";

interface GoogleButtonProps {
  // What it says: "Sign in with Google", "Sign up with Google"…
  text: GoogleButtonOptions["text"];
  onCredential: (credential: string) => void;
  disabled?: boolean;
}

/**
 * Google's own "Sign in with Google" button. Google's script draws it in an
 * iframe, so its look and wording are Google's; the language follows ours.
 */
export function GoogleButton({ text, onCredential, disabled = false }: GoogleButtonProps) {
  const { locale, t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const handleCredential = useEffectEvent((credential: string) => onCredential(credential));

  useEffect(() => onGoogleCredential((credential) => handleCredential(credential)), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !GOOGLE_CLIENT_ID) return;

    let isCurrent = true;
    loadGoogleIdentity(GOOGLE_CLIENT_ID).then(
      (google) => {
        if (!isCurrent) return;
        // Drawn again when the language changes, over the previous one.
        container.replaceChildren();
        google.renderButton(container, {
          type: "standard",
          theme: "filled_black",
          // As tall as the other buttons.
          size: "medium",
          text,
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(container.clientWidth, 400),
          locale,
        });
      },
      () => {
        if (isCurrent) setFailed(true);
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [locale, text]);

  if (!GOOGLE_CLIENT_ID || failed) {
    return <p className="m-0 text-[12px] text-neutral-500">{t.auth.google.unavailable}</p>;
  }

  return (
    <div className={cn(disabled && "cursor-not-allowed")}>
      <div
        ref={containerRef}
        // The iframe can't be disabled; inert keeps clicks and focus out.
        inert={disabled}
        className={cn("flex min-h-8 justify-center", disabled && "opacity-45")}
      />
    </div>
  );
}
