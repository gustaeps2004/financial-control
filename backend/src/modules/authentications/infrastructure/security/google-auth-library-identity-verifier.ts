import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { GoogleSignInDisabledException } from '../../domain/exceptions/google-sign-in-disabled.exception';
import { InvalidGoogleCredentialException } from '../../domain/exceptions/invalid-google-credential.exception';
import {
  GoogleIdentity,
  GoogleIdentityVerifier,
} from '../../domain/ports/google-identity-verifier';

@Injectable()
export class GoogleAuthLibraryIdentityVerifier implements GoogleIdentityVerifier {
  private readonly logger = new Logger(GoogleAuthLibraryIdentityVerifier.name);

  // One client for the app's lifetime, so Google's signing certificates stay
  // cached between sign-ins.
  private readonly client = new OAuth2Client({
    issuers: ['accounts.google.com', 'https://accounts.google.com'],
  });

  constructor(private readonly config: ConfigService) {}

  async verify(credential: string): Promise<GoogleIdentity> {
    // The web app's OAuth client ID; without one, Google sign-in is off.
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new GoogleSignInDisabledException();
    }

    let payload: TokenPayload | undefined;
    try {
      // Checks the signature against Google's certificates, the issuer, that
      // the token was issued to this app (the audience) and its expiry.
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.warn(`Google credential rejected: ${reasonOf(error)}`);
      throw new InvalidGoogleCredentialException();
    }

    // Sign in with Google always asks for the email, so a token without one
    // wasn't made for signing in.
    if (!payload?.email) {
      throw new InvalidGoogleCredentialException();
    }

    return {
      subject: payload.sub,
      email: payload.email.trim().toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: payload.name?.trim() || null,
    };
  }
}

// The library ends its messages with the token, or its claims (email, name),
// after a ": " — neither belongs in the logs.
function reasonOf(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.split(': ')[0];
}
