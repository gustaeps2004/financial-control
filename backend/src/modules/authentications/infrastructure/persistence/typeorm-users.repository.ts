import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { AuthProvider } from '../../domain/enums/auth-provider.enum';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { UserEntity } from './entities/user.entity';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class TypeOrmUsersRepository extends UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { provider, providerId },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const saved = await this.repository.save(UserMapper.toPersistence(user));
    return UserMapper.toDomain(saved);
  }

  // A real DELETE, not a soft one: every table owned by the user references
  // it with ON DELETE CASCADE, so the account's data goes with it.
  async delete(user: User): Promise<void> {
    await this.repository.delete(user.id!);
  }
}
