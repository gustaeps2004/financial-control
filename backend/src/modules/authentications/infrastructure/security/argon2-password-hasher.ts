import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasher } from '../../domain/ports/password-hasher';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  hash(plainTextPassword: string): Promise<string> {
    return argon2.hash(plainTextPassword, { type: argon2.argon2id });
  }

  verify(hashedPassword: string, plainTextPassword: string): Promise<boolean> {
    return argon2.verify(hashedPassword, plainTextPassword);
  }
}
