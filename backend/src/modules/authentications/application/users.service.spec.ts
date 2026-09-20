import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../domain/entities/user.entity';
import { AuthProvider } from '../domain/enums/auth-provider.enum';
import { EmailAlreadyRegisteredException } from '../domain/exceptions/email-already-registered.exception';
import { UserNotFoundException } from '../domain/exceptions/user-not-found.exception';
import { UsernameAlreadyRegisteredException } from '../domain/exceptions/username-already-registered.exception';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { UsersRepository } from '../domain/repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserNameDto } from './dto/update-user-name.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  const dto: CreateUserDto = {
    email: 'jdoe@example.com',
    password: 'super-secret',
    acceptedPrivacyPolicy: true,
    acceptedTermsOfUse: true,
  };
  const hashedPassword = 'argon2id$hashed-password';

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
        {
          provide: PasswordHasher,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository);
    passwordHasher = module.get(PasswordHasher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates and persists a local user with the hashed password', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(hashedPassword);
      repository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.register(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(passwordHasher.hash).toHaveBeenCalledWith(dto.password);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dto.email,
          email: dto.email,
          password: hashedPassword,
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

  describe('updateName', () => {
    const updateDto: UpdateUserNameDto = { name: 'Jane Doe' };

    it('updates and persists the name of an existing user', async () => {
      const existingUser = Object.assign(new User(), {
        id: 'user-1',
        username: dto.email,
        email: dto.email,
        name: 'Old Name',
      });
      repository.findById.mockResolvedValue(existingUser);
      repository.save.mockImplementation((user) => Promise.resolve(user));

      const result = await service.updateName('user-1', updateDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.findById).toHaveBeenCalledWith('user-1');
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe' }),
      );
      expect(result.name).toBe('Jane Doe');
    });

    it('throws when the user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateName('missing-id', updateDto)).rejects.toThrow(
        UserNotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
