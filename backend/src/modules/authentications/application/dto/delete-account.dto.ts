import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  // Re-checked before deleting: a token alone is not enough to erase
  // everything an account holds.
  @IsString()
  @IsNotEmpty()
  password!: string;
}
