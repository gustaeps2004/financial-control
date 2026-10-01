import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LoginTicket,
  OAuth2Client,
  type TokenPayload,
  type VerifyIdTokenOptions,
} from 'google-auth-library';
import { GoogleSignInDisabledException } from '../../domain/exceptions/google-sign-in-disabled.exception';
import { InvalidGoogleCredentialException } from '../../domain/exceptions/invalid-google-credential.exception';
import { GoogleAuthLibraryIdentityVerifier } from './google-auth-library-identity-verifier';

describe('GoogleAuthLibraryIdentityVerifier', () => {
  const clientId = 'tally-web.apps.googleusercontent.com';
  const credential = 'header.payload.signature';
  const payload: TokenPayload = {
    iss: 'https://accounts.google.com',
    aud: clientId,
    sub: '109876543210',
    email: 'Ana.Ferreira@Gmail.com',
    email_verified: true,
    name: 'Ana Ferreira',
    iat: 1_790_000_000,
    exp: 1_790_003_600,
  };

  let config: { get: jest.Mock };
  let verifyIdToken: jest.SpyInstance<
    Promise<LoginTicket>,
    [VerifyIdTokenOptions]
  >;
  let warn: jest.SpyInstance;
  let verifier: GoogleAuthLibraryIdentityVerifier;

  beforeEach(() => {
    config = { get: jest.fn().mockReturnValue(clientId) };
    // Never reaches Google: the library's own checks are its business.
    verifyIdToken = jest.spyOn(
      OAuth2Client.prototype,
      'verifyIdToken',
    ) as unknown as typeof verifyIdToken;
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    verifier = new GoogleAuthLibraryIdentityVerifier(
      config as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads who signed in from a token Google issued to this app', async () => {
    verifyIdToken.mockResolvedValue(new LoginTicket('envelope', payload));

    await expect(verifier.verify(credential)).resolves.toEqual({
      subject: '109876543210',
      email: 'ana.ferreira@gmail.com',
      emailVerified: true,
      name: 'Ana Ferreira',
    });
    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: credential,
      audience: clientId,
    });
  });

  it('reads a missing verification flag as unverified, and a missing name as none', async () => {
    verifyIdToken.mockResolvedValue(
      new LoginTicket('envelope', {
        ...payload,
        email_verified: undefined,
        name: undefined,
      }),
    );

    await expect(verifier.verify(credential)).resolves.toMatchObject({
      emailVerified: false,
      name: null,
    });
  });

  it('is off without a client ID, before asking Google anything', async () => {
    config.get.mockReturnValue('');

    await expect(verifier.verify(credential)).rejects.toThrow(
      GoogleSignInDisabledException,
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects a token Google does not vouch for, logging why but not the token', async () => {
    verifyIdToken.mockRejectedValue(
      new Error(`Invalid token signature: ${credential}`),
    );

    await expect(verifier.verify(credential)).rejects.toThrow(
      InvalidGoogleCredentialException,
    );
    expect(warn).toHaveBeenCalledWith(
      'Google credential rejected: Invalid token signature',
    );
  });

  it('rejects a token that carries no email', async () => {
    verifyIdToken.mockResolvedValue(
      new LoginTicket('envelope', { ...payload, email: undefined }),
    );

    await expect(verifier.verify(credential)).rejects.toThrow(
      InvalidGoogleCredentialException,
    );
  });
});
