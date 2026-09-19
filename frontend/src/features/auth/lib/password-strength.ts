export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  hint: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) {
    return { score: 0, hint: "At least 8 characters required." };
  }

  let classes = 0;
  if (/[0-9]/.test(password)) classes += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) classes += 1;
  if (/[^A-Za-z0-9]/.test(password)) classes += 1;

  if (password.length >= 12 && classes >= 2) {
    return { score: 3, hint: "Strong password." };
  }
  if (classes >= 1) {
    return { score: 2, hint: "Good — a few more characters makes it stronger." };
  }
  return { score: 1, hint: "Weak — try adding a number or symbol." };
}
