export type PasswordHint = "tooShort" | "weak" | "good" | "strong";

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  hint: PasswordHint;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) {
    return { score: 0, hint: "tooShort" };
  }

  let classes = 0;
  if (/[0-9]/.test(password)) classes += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) classes += 1;
  if (/[^A-Za-z0-9]/.test(password)) classes += 1;

  if (password.length >= 12 && classes >= 2) {
    return { score: 3, hint: "strong" };
  }
  if (classes >= 1) {
    return { score: 2, hint: "good" };
  }
  return { score: 1, hint: "weak" };
}
