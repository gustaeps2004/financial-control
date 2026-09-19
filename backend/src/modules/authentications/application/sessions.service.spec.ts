import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../domain/entities/user.entity';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { TokenGenerator } from '../domain/ports/token-generator';
import { SessionsRepository } from '../domain/repositories/sessions.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
import { UsersService } from './users.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionsRepository: jest.Mocked<SessionsRepository>;
  let usersService: jest.Mocked<UsersService>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenGenerator: jest.Mocked<TokenGenerator>;

  const dto: CreateSessionDto = {
    email: 'jdoe@example.com',
    password: 'super-secret',
  };
  const hashedPassword = 'argon2id$hashed-password';
  const generatedToken = {
    accessToken: 'signed-jwt',
    expiresAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: SessionsRepository,
          useValue: {
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
        {
          provide: TokenGenerator,
          useValue: {
            generate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SessionsService);
    sessionsRepository = module.get(SessionsRepository);
    usersService = module.get(UsersService);
    passwordHasher = module.get(PasswordHasher);
    tokenGenerator = module.get(TokenGenerator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns a signed JWT and records an audit-only session when credentials match', async () => {
      const user = {
        id: '1',
        email: dto.email,
        password: hashedPassword,
      } as User;
      usersService.findByEmail.mockResolvedValue(user);
      passwordHasher.verify.mockResolvedValue(true);
      tokenGenerator.generate.mockResolvedValue(generatedToken);
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
      expect(tokenGenerator.generate).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(sessionsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          expiresAt: generatedToken.expiresAt,
        }),
      );
      const savedSession = sessionsRepository.save.mock.calls[0][0];
      expect(savedSession).not.toHaveProperty('token');
      expect(result).toEqual(generatedToken);
    });

    it('throws when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
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
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });
  });
});
