import { IsNumber, Max, Min } from 'class-validator';
import { MAX_MONEY_AMOUNT } from '../../../../shared/domain/money';
import { IsIsoDateOnly } from '../../../../shared/validation/is-iso-date-only.decorator';

export class RegisterStatementPaymentDto {
  @IsIsoDateOnly()
  paidOn!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(MAX_MONEY_AMOUNT)
  amount!: number;
}
