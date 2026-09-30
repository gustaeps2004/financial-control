import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches } from 'class-validator';

/**
 * A calendar date with no time part ("2026-09-30") that actually exists
 * (rejects 2026-02-30).
 */
export function IsIsoDateOnly(): PropertyDecorator {
  return applyDecorators(
    Matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: ({ property }) => `${property} must be formatted as YYYY-MM-DD`,
    }),
    IsISO8601(
      { strict: true },
      { message: ({ property }) => `${property} must be a valid date` },
    ),
  );
}
