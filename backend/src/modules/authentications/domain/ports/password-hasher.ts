export abstract class PasswordHasher {
  abstract hash(plainTextPassword: string): Promise<string>;
  abstract verify(
    hashedPassword: string,
    plainTextPassword: string,
  ): Promise<boolean>;
}
