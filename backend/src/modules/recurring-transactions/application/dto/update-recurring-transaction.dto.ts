import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { YEAR_MONTH_PATTERN } from '../../../../shared/domain/calendar/year-month';
import { MAX_MONEY_AMOUNT } from '../../../../shared/domain/money';
import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';

// Omitted fields are left untouched; endMonth, paymentMethod and cardId
// accept null to clear them.
export class UpdateRecurringTransactionDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MAX_MONEY_AMOUNT)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @Matches(YEAR_MONTH_PATTERN, {
    message: 'startMonth must be formatted as YYYY-MM',
  })
  startMonth?: string;

  @IsOptional()
  @Matches(YEAR_MONTH_PATTERN, {
    message: 'endMonth must be formatted as YYYY-MM',
  })
  endMonth?: string | null;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod | null;

  @IsOptional()
  @IsUUID()
  cardId?: string | null;
}
