import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../domain/entities/user.entity';
import { AuthProvider } from '../domain/enums/auth-provider.enum';
import { EmailAlreadyRegisteredException } from '../domain/exceptions/email-already-registered.exception';
import { UsernameAlreadyRegisteredException } from '../domain/exceptions/username-already-registered.exception';
import { UsersRepository } from '../domain/repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const dto: CreateUserDto = {
    email: 'jdoe@example.com',
    password: 'super-secret',
    acceptedPrivacyPolicy: true,
    acceptedTermsOfUse: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates and persists a local user', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      repository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.register(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dto.email,
          email: dto.email,
          password: dto.password,
          provider: AuthProvider.LOCAL,
          privacyPolicyAccepted: true,
          termsOfUseAccepted: true,
        }),
      );
      expect(result.username).toBe(dto.email);
    });

    it('throws when the email is already registered', async () => {
      repository.findByEmail.mockResolvedValue({ id: '1' } as User);
      repository.findByUsername.mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(
        EmailAlreadyRegisteredException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws when the username is already registered', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue({ id: '1' } as User);

      await expect(service.register(dto)).rejects.toThrow(
        UsernameAlreadyRegisteredException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
