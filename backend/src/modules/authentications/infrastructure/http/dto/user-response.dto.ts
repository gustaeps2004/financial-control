import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt?: Date;

  constructor(user: User) {
    this.id = user.id!;
    this.name = user.name;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}
