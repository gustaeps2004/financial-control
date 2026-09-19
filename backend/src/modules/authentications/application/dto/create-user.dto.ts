import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsBoolean()
  @Equals(true, { message: 'privacy policy must be accepted' })
  acceptedPrivacyPolicy!: boolean;

  @IsBoolean()
  @Equals(true, { message: 'terms of use must be accepted' })
  acceptedTermsOfUse!: boolean;
}
