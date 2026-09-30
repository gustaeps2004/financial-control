import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { YEAR_MONTH_PATTERN } from '../../../../shared/domain/calendar/year-month';

export class MonthQueryDto {
  @Matches(YEAR_MONTH_PATTERN, {
    message: 'month must be formatted as YYYY-MM',
  })
  month!: string;
}

export class YearQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2999)
  year!: number;
}

/**
 * `month` reports a single month (projections included when it's in the
 * future), `year` a whole year and neither everything; both only add up
 * what has already happened. `month` wins when both are given.
 */
export class SummaryQueryDto {
  @IsOptional()
  @Matches(YEAR_MONTH_PATTERN, {
    message: 'month must be formatted as YYYY-MM',
  })
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2999)
  year?: number;
}
