import { Injectable } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { AuthProvider } from '../domain/enums/auth-provider.enum';
import { EmailAlreadyRegisteredException } from '../domain/exceptions/email-already-registered.exception';
import { UserNotFoundException } from '../domain/exceptions/user-not-found.exception';
import { UsernameAlreadyRegisteredException } from '../domain/exceptions/username-already-registered.exception';
import { PasswordHasher } from '../domain/ports/password-hasher';
import { UsersRepository } from '../domain/repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserNameDto } from './dto/update-user-name.dto';

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
}
