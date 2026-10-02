import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

// Re-checked before deleting: a token alone is not enough to erase
// everything an account holds. One of the two is required.
export class DeleteAccountDto {
  @ValidateIf((dto: DeleteAccountDto) => dto.googleCredential === undefined)
  @IsString()
  @IsNotEmpty()
  password?: string;

  // For accounts linked to Google: a fresh credential from that Google
  // account, in place of the password they may not have.
  @ValidateIf((dto: DeleteAccountDto) => dto.password === undefined)
  @IsString()
  @IsNotEmpty()
  googleCredential?: string;
}
