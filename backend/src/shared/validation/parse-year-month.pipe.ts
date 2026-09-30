import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { YearMonth } from '../domain/calendar/year-month';

/** Route/query param "YYYY-MM" → YearMonth. */
@Injectable()
export class ParseYearMonthPipe implements PipeTransform<string, YearMonth> {
  transform(value: string): YearMonth {
    if (!YearMonth.isValid(value)) {
      throw new BadRequestException(
        `Validation failed ("${value}" is not a YYYY-MM month)`,
      );
    }
    return YearMonth.parse(value);
  }
}
