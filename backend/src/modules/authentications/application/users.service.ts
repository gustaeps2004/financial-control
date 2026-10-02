import { Injectable } from '@nestjs/common';
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
import { CreateGoogleSessionDto } from './dto/create-google-session.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateUserNameDto } from './dto/update-user-name.dto';

// The size of the users.name column.
const NAME_MAX_LENGTH = 100;

export interface GoogleAccount {
  user: User;
  // True when signing in created the account.
  isNewUser: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(dto: CreateUserDto): Promise<User> {
    const [existingByEmail, existingByUsername] = await Promise.all([
      this.usersRepository.findByEmail(dto.email),
      this.usersRepository.findByUsername(dto.email),
    ]);

    if (existingByEmail) {
      throw new EmailAlreadyRegisteredException(dto.email);
    }
    if (existingByUsername) {
      throw new UsernameAlreadyRegisteredException(dto.email);
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const user: User = Object.assign(new User(), {
      username: dto.email,
      email: dto.email,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
      privacyPolicyAccepted: dto.acceptedPrivacyPolicy,
      termsOfUseAccepted: dto.acceptedTermsOfUse,
    });

    return this.usersRepository.save(user);
  }

  /**
   * The account a Google identity signs in to: the one already linked to
   * it; else the password account with its email, linked once that
   * password is confirmed; else, with the terms accepted, a new account.
   */
  async resolveGoogleAccount(
    identity: GoogleIdentity,
    dto: Omit<CreateGoogleSessionDto, 'credential'>,
  ): Promise<GoogleAccount> {
    const linked = await this.usersRepository.findByProviderId(
      AuthProvider.GOOGLE,
      identity.subject,
    );
    if (linked) {
      return { user: linked, isNewUser: false };
    }

    // From here on the email is what ties the Google account to one here,
    // so Google must have confirmed it.
    if (!identity.emailVerified) {
      throw new GoogleEmailNotVerifiedException();
    }

    const existing = await this.usersRepository.findByEmail(identity.email);
    if (existing) {
      const user = await this.linkGoogle(existing, identity, dto.password);
      return { user, isNewUser: false };
    }

    if (!dto.acceptedPrivacyPolicy || !dto.acceptedTermsOfUse) {
      throw new GoogleAccountNotRegisteredException();
    }
    if (await this.usersRepository.findByUsername(identity.email)) {
      throw new UsernameAlreadyRegisteredException(identity.email);
    }

    const user: User = Object.assign(new User(), {
      username: identity.email,
      email: identity.email,
      name: identity.name?.slice(0, NAME_MAX_LENGTH) ?? '',
      emailConfirmed: true,
      password: null,
      provider: AuthProvider.GOOGLE,
      providerId: identity.subject,
      privacyPolicyAccepted: true,
      termsOfUseAccepted: true,
    });

    return { user: await this.usersRepository.save(user), isNewUser: true };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async updateName(userId: string, dto: UpdateUserNameDto): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    user.name = dto.name;

    return this.usersRepository.save(user);
  }

  /** Erases the account and everything recorded under it, for good. */
  async deleteAccount(userId: string, dto: DeleteAccountDto): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    if (
      !user.password ||
      !(await this.passwordHasher.verify(user.password, dto.password))
    ) {
      throw new IncorrectPasswordException();
    }

    await this.usersRepository.delete(user);
  }

  private async linkGoogle(
    user: User,
    identity: GoogleIdentity,
    password: string | undefined,
  ): Promise<User> {
    // Its email is already tied to another Google account.
    if (user.providerId) {
      throw new EmailAlreadyRegisteredException(user.email);
    }
    // Sign-up doesn't verify emails, so whoever registered this one may not
    // own it: holding the Google account isn't proof enough, the password is.
    if (password === undefined) {
      throw new GoogleLinkRequiresPasswordException();
    }
    if (!(await this.passwordMatches(user, password))) {
      throw new IncorrectPasswordException();
    }

    user.provider = AuthProvider.GOOGLE;
    user.providerId = identity.subject;
    // Google has just vouched for it.
    user.emailConfirmed = true;

    return this.usersRepository.save(user);
  }

  private async passwordMatches(
    user: User,
    password: string,
  ): Promise<boolean> {
    // Accounts that only sign in with Google have no password to match.
    if (!user.password) {
      return false;
    }
    return this.passwordHasher.verify(user.password, password);
  }
}
