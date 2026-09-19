import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserSession } from '../domain/entities/user-session.entity';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';
import { SessionNotFoundException } from '../domain/exceptions/session-not-found.exception';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { SessionsRepository } from '../domain/repositories/sessions.repository';
import { SESSION_TTL_MS } from './constants/session.constants';
import { CreateSessionDto } from './dto/create-session.dto';
import { UsersService } from './users.service';

export interface LoginContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async login(
    dto: CreateSessionDto,
    context: LoginContext = {},
  ): Promise<UserSession> {
    const user = await this.usersService.findByEmail(dto.email);

    if (
      !user ||
      !user.password ||
      !(await this.passwordHasher.verify(user.password, dto.password))
    ) {
      throw new InvalidCredentialsException();
    }

    const session: UserSession = Object.assign(new UserSession(), {
      userId: user.id!,
      token: randomUUID(),
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    return this.sessionsRepository.save(session);
  }

  async revoke(token: string): Promise<void> {
    const session = await this.sessionsRepository.findActiveByToken(token);
    if (!session) {
      throw new SessionNotFoundException();
    }

    session.revokedAt = new Date();
    await this.sessionsRepository.save(session);
  }
}
