import { Injectable } from '@nestjs/common';
import { UserSession } from '../domain/entities/user-session.entity';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { TokenGenerator } from '../domain/ports/token-generator';
import { SessionsRepository } from '../domain/repositories/sessions.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { UsersService } from './users.service';

export interface LoginResult {
  accessToken: string;
  expiresAt: Date;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
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

    const { accessToken, expiresAt } = await this.tokenGenerator.generate({
      // A persisted user (found by email) is always assigned an id.
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
