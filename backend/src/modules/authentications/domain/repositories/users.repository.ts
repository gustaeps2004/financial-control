import { User } from '../entities/user.entity';
import { AuthProvider } from '../enums/auth-provider.enum';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findByProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract delete(user: User): Promise<void>;
}
