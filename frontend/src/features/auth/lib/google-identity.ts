// Google Identity Services, the script behind "Sign in with Google": loaded
// only when a Google button shows up, and set up once for the whole page.

const SCRIPT_URL = "https://accounts.google.com/gsi/client";

/** The web app's OAuth client ID; without one, no Google button is shown. */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

export interface GoogleButtonOptions {
  type: "standard";
  theme: "outline" | "filled_blue" | "filled_black";
  size: "large" | "medium" | "small";
  text: "signin_with" | "signup_with" | "continue_with";
  shape: "rectangular" | "pill";
  logo_alignment: "left" | "center";
  // In pixels, up to 400.
  width: number;
  locale: string;
}

interface GoogleIdentityServices {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityServices } };
  }
}

let services: Promise<GoogleIdentityServices> | null = null;
let credentialListener: ((credential: string) => void) | null = null;

/** The script's API, loading it the first time. */
export function loadGoogleIdentity(clientId: string): Promise<GoogleIdentityServices> {
  services ??= new Promise<GoogleIdentityServices>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const id = window.google?.accounts.id;
      if (!id) {
        reject(new Error("Google Identity Services loaded without its API."));
        return;
      }
      // Google allows a single setup per page, so every button shares this
      // callback, which hands the credential to the button on screen.
      id.initialize({
        client_id: clientId,
        callback: ({ credential }) => credentialListener?.(credential),
      });
      resolve(id);
    };
    script.onerror = () => {
      script.remove();
      // The next button tries again, e.g. once the connection is back.
      services = null;
      reject(new Error("Google Identity Services didn't load."));
    };
    document.head.append(script);
  });
  return services;
}

/** Sends the credential of each Google sign-in to `listener`, until the returned function is called. */
export function onGoogleCredential(listener: (credential: string) => void): () => void {
  credentialListener = listener;
  return () => {
    if (credentialListener === listener) credentialListener = null;
  };
}

/**
 * The email a credential was issued for, to show who is signing in. Only the
 * API can tell whether the credential is genuine.
 */
export function credentialEmail(credential: string): string | null {
  try {
    const payload = credential.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
    const { email } = JSON.parse(new TextDecoder().decode(bytes)) as { email?: unknown };
    return typeof email === "string" ? email : null;
  } catch {
    return null;
  }
}
