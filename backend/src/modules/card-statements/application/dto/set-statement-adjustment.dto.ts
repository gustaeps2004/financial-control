import { IsNumber, Max, Min, NotEquals } from 'class-validator';
import { MAX_MONEY_AMOUNT } from '../../../../shared/domain/money';

export class SetStatementAdjustmentDto {
  // Negative for credits on the statement. Remove it instead of zeroing it.
  @IsNumber({ maxDecimalPlaces: 2 })
  @NotEquals(0)
  @Min(-MAX_MONEY_AMOUNT)
  @Max(MAX_MONEY_AMOUNT)
  amount!: number;
}
