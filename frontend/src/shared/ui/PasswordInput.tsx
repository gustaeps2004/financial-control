import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Input } from "./Input";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** A password field whose content can be shown, to catch typos before submitting. */
export function PasswordInput(props: PasswordInputProps) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Hidden again when the form is sent: the browser then sees a password
  // field it can offer to save, and the password doesn't stay on screen.
  useEffect(() => {
    const form = toggleRef.current?.closest("form");
    if (!form) return;
    const hide = () => setIsVisible(false);
    form.addEventListener("submit", hide);
    return () => form.removeEventListener("submit", hide);
  }, []);

  return (
    <Input
      {...props}
      type={isVisible ? "text" : "password"}
      // Shown as plain text, it must not go to a spellchecking service or
      // get "corrected" by the keyboard.
      spellCheck={false}
      autoCapitalize="none"
      autoCorrect="off"
      trailing={
        <button
          ref={toggleRef}
          type="button"
          aria-label={isVisible ? t.controls.hidePassword : t.controls.showPassword}
          aria-controls={props.id}
          onClick={() => setIsVisible((visible) => !visible)}
          // A click keeps the caret in the field, so typing can go on.
          onMouseDown={(event) => event.preventDefault()}
          className="grid w-9 cursor-pointer place-items-center rounded-r-md border-0 bg-transparent text-neutral-500 hover:text-ink focus-visible:-outline-offset-2"
        >
          {isVisible ? <EyeSlash size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}
