import { Injectable } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { UserSession } from '../domain/entities/user-session.entity';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';
import { GoogleIdentityVerifier } from '../domain/ports/google-identity-verifier';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { TokenGenerator } from '../domain/ports/token-generator';
import { SessionsRepository } from '../domain/repositories/sessions.repository';
import { CreateGoogleSessionDto } from './dto/create-google-session.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { GoogleAccount, UsersService } from './users.service';

export interface LoginResult {
  accessToken: string;
  expiresAt: Date;
}

export type GoogleLoginResult = LoginResult & GoogleAccount;

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
    private readonly googleIdentityVerifier: GoogleIdentityVerifier,
  ) {}

  async login(dto: CreateSessionDto): Promise<LoginResult> {
    const user = await this.usersService.findByEmail(dto.email);

    // user.password is null for OAuth-created accounts, which have no
    // local password to verify against.
    if (
      !user ||
      !user.password ||
      !(await this.passwordHasher.verify(user.password, dto.password))
    ) {
      throw new InvalidCredentialsException();
    }

    return this.startSession(user);
  }

  /**
   * Signs in with a "Sign in with Google" credential, linking or creating
   * the account when needed (see UsersService.resolveGoogleAccount).
   */
  async loginWithGoogle(
    dto: CreateGoogleSessionDto,
  ): Promise<GoogleLoginResult> {
    const identity = await this.googleIdentityVerifier.verify(dto.credential);
    const account = await this.usersService.resolveGoogleAccount(identity, dto);

    return { ...(await this.startSession(account.user)), ...account };
  }

  private async startSession(user: User): Promise<LoginResult> {
    const { accessToken, expiresAt } = await this.tokenGenerator.generate({
      // A persisted user is always assigned an id.
      sub: user.id!,
      email: user.email,
    });

    const session: UserSession = Object.assign(new UserSession(), {
      userId: user.id!,
      expiresAt,
    });

    await this.sessionsRepository.save(session);

    return { accessToken, expiresAt };
  }
}
