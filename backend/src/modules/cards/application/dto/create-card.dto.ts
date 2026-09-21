import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  brand!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  mark!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  swatch!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  nickname!: string;
}
