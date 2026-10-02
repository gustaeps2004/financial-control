import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../domain/entities/user.entity';
import { AuthProvider } from '../domain/enums/auth-provider.enum';
import { EmailAlreadyRegisteredException } from '../domain/exceptions/email-already-registered.exception';
import { GoogleAccountNotRegisteredException } from '../domain/exceptions/google-account-not-registered.exception';
import { GoogleEmailNotVerifiedException } from '../domain/exceptions/google-email-not-verified.exception';
import { GoogleLinkRequiresPasswordException } from '../domain/exceptions/google-link-requires-password.exception';
import { IncorrectPasswordException } from '../domain/exceptions/incorrect-password.exception';
import { UserNotFoundException } from '../domain/exceptions/user-not-found.exception';
import { UsernameAlreadyRegisteredException } from '../domain/exceptions/username-already-registered.exception';
import { GoogleIdentity } from '../domain/ports/google-identity-verifier';
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
            findByProviderId: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
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

  describe('resolveGoogleAccount', () => {
    const identity: GoogleIdentity = {
      subject: '109876543210',
      email: dto.email,
      emailVerified: true,
      name: 'Jane Doe',
    };
    const acceptedTerms = {
      acceptedPrivacyPolicy: true,
      acceptedTermsOfUse: true,
    };
    const passwordAccount = () =>
      Object.assign(new User(), {
        id: 'user-1',
        username: dto.email,
        email: dto.email,
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
      });

    beforeEach(() => {
      repository.findByProviderId.mockResolvedValue(null);
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      repository.save.mockImplementation((user) => Promise.resolve(user));
    });

    it('signs in to the account already linked to the Google account', async () => {
      const linked = Object.assign(new User(), {
        id: 'user-1',
        provider: AuthProvider.GOOGLE,
        providerId: identity.subject,
      });
      repository.findByProviderId.mockResolvedValue(linked);

      // Matched by Google's id, so even an email Google no longer vouches
      // for doesn't matter.
      const result = await service.resolveGoogleAccount(
        { ...identity, emailVerified: false },
        {},
      );

      expect(result).toEqual({ user: linked, isNewUser: false });
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.findByProviderId).toHaveBeenCalledWith(
        AuthProvider.GOOGLE,
        identity.subject,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('creates an account that signs in with Google once the terms are accepted', async () => {
      const result = await service.resolveGoogleAccount(
        identity,
        acceptedTerms,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dto.email,
          email: dto.email,
          name: 'Jane Doe',
          emailConfirmed: true,
          password: null,
          provider: AuthProvider.GOOGLE,
          providerId: identity.subject,
          privacyPolicyAccepted: true,
          termsOfUseAccepted: true,
        }),
      );
      expect(result.isNewUser).toBe(true);
    });

    it("keeps a long Google name within the column's 100 characters", async () => {
      const result = await service.resolveGoogleAccount(
        { ...identity, name: 'J'.repeat(150) },
        acceptedTerms,
      );

      expect(result.user.name).toHaveLength(100);
    });

    it('turns an unknown Google account away when the terms were not accepted', async () => {
      await expect(service.resolveGoogleAccount(identity, {})).rejects.toThrow(
        GoogleAccountNotRegisteredException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('refuses an email Google has not verified', async () => {
      await expect(
        service.resolveGoogleAccount(
          { ...identity, emailVerified: false },
          acceptedTerms,
        ),
      ).rejects.toThrow(GoogleEmailNotVerifiedException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('asks for the password before linking Google to the account with that email', async () => {
      repository.findByEmail.mockResolvedValue(passwordAccount());

      await expect(
        service.resolveGoogleAccount(identity, acceptedTerms),
      ).rejects.toThrow(GoogleLinkRequiresPasswordException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('links Google to the account with that email once its password is confirmed', async () => {
      repository.findByEmail.mockResolvedValue(passwordAccount());
      passwordHasher.verify.mockResolvedValue(true);

      const result = await service.resolveGoogleAccount(identity, {
        password: 'super-secret',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(passwordHasher.verify).toHaveBeenCalledWith(
        hashedPassword,
        'super-secret',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          // The password keeps working alongside Google.
          password: hashedPassword,
          provider: AuthProvider.GOOGLE,
          providerId: identity.subject,
          emailConfirmed: true,
        }),
      );
      expect(result.isNewUser).toBe(false);
    });

    it('keeps Google unlinked when the password is wrong', async () => {
      repository.findByEmail.mockResolvedValue(passwordAccount());
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        service.resolveGoogleAccount(identity, { password: 'wrong' }),
      ).rejects.toThrow(IncorrectPasswordException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('refuses an email already tied to another Google account', async () => {
      repository.findByEmail.mockResolvedValue(
        Object.assign(passwordAccount(), {
          provider: AuthProvider.GOOGLE,
          providerId: 'another-google-account',
        }),
      );

      await expect(
        service.resolveGoogleAccount(identity, { password: 'super-secret' }),
      ).rejects.toThrow(EmailAlreadyRegisteredException);
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
  describe('deleteAccount', () => {
    const user = Object.assign(new User(), {
      id: 'user-1',
      email: 'jdoe@example.com',
      password: hashedPassword,
    });

    it('deletes the account once the password is confirmed', async () => {
      repository.findById.mockResolvedValue(user);
      passwordHasher.verify.mockResolvedValue(true);

      await service.deleteAccount('user-1', { password: 'super-secret' });

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(passwordHasher.verify).toHaveBeenCalledWith(
        hashedPassword,
        'super-secret',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.delete).toHaveBeenCalledWith(user);
    });

    it('keeps the account when the password is wrong', async () => {
      repository.findById.mockResolvedValue(user);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        service.deleteAccount('user-1', { password: 'wrong' }),
      ).rejects.toThrow(IncorrectPasswordException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('throws when the account no longer exists', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.deleteAccount('user-1', { password: 'super-secret' }),
      ).rejects.toThrow(UserNotFoundException);
    });
  });
});
