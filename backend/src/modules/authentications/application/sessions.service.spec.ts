import { Test, TestingModule } from '@nestjs/testing';
import { UserSession } from '../domain/entities/user-session.entity';
import { User } from '../domain/entities/user.entity';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';
import { SessionNotFoundException } from '../domain/exceptions/session-not-found.exception';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { SessionsRepository } from '../domain/repositories/sessions.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
import { UsersService } from './users.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionsRepository: jest.Mocked<SessionsRepository>;
  let usersService: jest.Mocked<UsersService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  const dto: CreateSessionDto = {
    email: 'jdoe@example.com',
    password: 'super-secret',
  };
  const hashedPassword = 'argon2id$hashed-password';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SessionsRepository,
          useValue: {
            findActiveByToken: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: PasswordHasher,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SessionsService);
    sessionsRepository = module.get(SessionsRepository);
    usersService = module.get(UsersService);
    passwordHasher = module.get(PasswordHasher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('creates a session when credentials match', async () => {
      const user = { id: '1', password: hashedPassword } as User;
      usersService.findByEmail.mockResolvedValue(user);
      passwordHasher.verify.mockResolvedValue(true);
      sessionsRepository.save.mockImplementation((session) =>
        Promise.resolve(session),
      );

      const result = await service.login(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(passwordHasher.verify).toHaveBeenCalledWith(
        hashedPassword,
        dto.password,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(sessionsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ userId: user.id }),
      );
      expect(result.userId).toBe(user.id);
    });

    it('throws when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('throws when the user has no local password (OAuth account)', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        password: null,
      } as User);

      await expect(service.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(passwordHasher.verify).not.toHaveBeenCalled();
    });

    it('throws when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        password: hashedPassword,
      } as User);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('revoke', () => {
    it('marks the active session as revoked', async () => {
      const session = { revokedAt: null } as UserSession;
      sessionsRepository.findActiveByToken.mockResolvedValue(session);
      sessionsRepository.save.mockResolvedValue(session);

      await service.revoke('a-token');

      expect(session.revokedAt).toBeInstanceOf(Date);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(sessionsRepository.save).toHaveBeenCalledWith(session);
    });

    it('throws when there is no active session for the token', async () => {
      sessionsRepository.findActiveByToken.mockResolvedValue(null);

      await expect(service.revoke('missing-token')).rejects.toThrow(
        SessionNotFoundException,
      );
    });
  });
});
