import { IsOptional } from 'class-validator';
import { IsIsoDateOnly } from '../../../../shared/validation/is-iso-date-only.decorator';

export class ListTransactionsQueryDto {
  @IsOptional()
  @IsIsoDateOnly()
  from?: string;

  @IsOptional()
  @IsIsoDateOnly()
  to?: string;
}
