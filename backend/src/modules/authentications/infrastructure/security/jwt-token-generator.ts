import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthTokenPayload,
  GeneratedToken,
  TokenGenerator,
} from '../../domain/ports/token-generator';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: AuthTokenPayload): Promise<GeneratedToken> {
    const accessToken = await this.jwtService.signAsync(payload);
    // Read the expiry back from the token we just signed, so the audit
    // record always matches the JWT's real `exp` claim exactly.
    const { exp } = this.jwtService.decode<{ exp: number }>(accessToken);

    return { accessToken, expiresAt: new Date(exp * 1000) };
  }
}
