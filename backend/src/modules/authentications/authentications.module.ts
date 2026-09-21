import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { SharedModule } from '../../shared/shared.module';
import { SessionsService } from './application/sessions.service';
import { UsersService } from './application/users.service';
import { PasswordHasher } from './domain/ports/password-hasher';
import { TokenGenerator } from './domain/ports/token-generator';
import { SessionsRepository } from './domain/repositories/sessions.repository';
import { UsersRepository } from './domain/repositories/users.repository';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { JwtTokenGenerator } from './infrastructure/security/jwt-token-generator';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { UserSessionEntity } from './infrastructure/persistence/entities/user-session.entity';
import { AuthController } from './infrastructure/http/auth.controller';
import { UsersController } from './infrastructure/http/users.controller';
import { JwtAuthGuard } from './infrastructure/http/guards/jwt-auth.guard';
import { TypeOrmSessionsRepository } from './infrastructure/persistence/typeorm-sessions.repository';
import { TypeOrmUsersRepository } from './infrastructure/persistence/typeorm-users.repository';

// Captured so the same registered instance can be re-exported below —
// other modules that reuse JwtAuthGuard via @UseGuards() need JwtService
// resolvable in their own injector context.
const jwtModule = JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: config.get<StringValue>('JWT_EXPIRES_IN', '1s'),
    },
  }),
});

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([UserEntity, UserSessionEntity]),
    jwtModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    SessionsService,
    { provide: UsersRepository, useClass: TypeOrmUsersRepository },
    { provide: SessionsRepository, useClass: TypeOrmSessionsRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: TokenGenerator, useClass: JwtTokenGenerator },
    JwtAuthGuard,
  ],
  exports: [UsersService, SessionsService, JwtAuthGuard, jwtModule],
})
export class AuthenticationsModule {}
