export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export interface GeneratedToken {
  accessToken: string;
  expiresAt: Date;
}

export abstract class TokenGenerator {
  abstract generate(payload: AuthTokenPayload): Promise<GeneratedToken>;
}
