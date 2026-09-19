import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { SessionsService } from './application/sessions.service';
import { UsersService } from './application/users.service';
import { SessionsRepository } from './domain/repositories/sessions.repository';
import { UsersRepository } from './domain/repositories/users.repository';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { UserSessionEntity } from './infrastructure/persistence/entities/user-session.entity';
import { SessionsController } from './infrastructure/http/sessions.controller';
import { UsersController } from './infrastructure/http/users.controller';
import { TypeOrmSessionsRepository } from './infrastructure/persistence/typeorm-sessions.repository';
import { TypeOrmUsersRepository } from './infrastructure/persistence/typeorm-users.repository';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([UserEntity, UserSessionEntity]),
  ],
  controllers: [UsersController, SessionsController],
  providers: [
    UsersService,
    SessionsService,
    { provide: UsersRepository, useClass: TypeOrmUsersRepository },
    { provide: SessionsRepository, useClass: TypeOrmSessionsRepository },
  ],
  exports: [UsersService, SessionsService],
})
export class AuthenticationsModule {}
