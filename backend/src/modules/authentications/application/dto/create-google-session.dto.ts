import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGoogleSessionDto {
  // The ID token "Sign in with Google" hands the page.
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  credential!: string;

  // Links Google to the password account that already has the Google
  // account's email: the password proves the account is the caller's.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  // As at sign-up, both must be accepted for the credential to create an
  // account; without them, an unknown Google account is turned away.
  @IsOptional()
  @IsBoolean()
  acceptedPrivacyPolicy?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptedTermsOfUse?: boolean;
}
