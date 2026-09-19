import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  readonly id: string;
  readonly createdAt?: Date;

  constructor(user: User) {
    this.id = user.id!;
    this.createdAt = user.createdAt;
  }
}
