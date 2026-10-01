/** Who a "Sign in with Google" credential says signed in. */
export interface GoogleIdentity {
  // Google's id for the account. Unlike the email, it never changes.
  subject: string;
  email: string;
  // Whether Google has confirmed the account owns the email.
  emailVerified: boolean;
  name: string | null;
}

export abstract class GoogleIdentityVerifier {
  /**
   * Checks that a credential (the ID token Google hands the sign-in page)
   * was issued by Google, to this app, and hasn't expired, and reads who it
   * identifies.
   *
   * @throws GoogleSignInDisabledException when no Google client is configured.
   * @throws InvalidGoogleCredentialException when the credential doesn't check out.
   */
  abstract verify(credential: string): Promise<GoogleIdentity>;
}
