import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  NotEquals,
} from 'class-validator';
import { MAX_MONEY_AMOUNT } from '../../../../shared/domain/money';
import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';
import { IsIsoDateOnly } from '../../../../shared/validation/is-iso-date-only.decorator';
import { MAX_INSTALLMENTS } from '../../domain/entities/transaction.entity';

// Omitted fields are left untouched; nullable fields accept null to clear.
export class UpdateTransactionDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsIsoDateOnly()
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @NotEquals(0)
  @Min(-MAX_MONEY_AMOUNT)
  @Max(MAX_MONEY_AMOUNT)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod | null;

  @IsOptional()
  @IsUUID()
  cardId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_INSTALLMENTS)
  installments?: number;

  @IsOptional()
  @IsUUID()
  recurringTransactionId?: string | null;
}
