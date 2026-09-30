import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Clock } from './clock';

const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';

/**
 * "Today" is a calendar date, so it depends on where the user is: a server
 * running in UTC would flip to next month three hours early for someone in
 * Brazil, turning the month's projections into actuals too soon.
 */
@Injectable()
export class SystemClock extends Clock {
  private readonly formatter: Intl.DateTimeFormat;

  constructor(config: ConfigService) {
    super();
    // An unknown zone throws here, failing fast at startup.
    this.formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: config.get<string>('APP_TIMEZONE', DEFAULT_TIME_ZONE),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  today(): string {
    const parts = Object.fromEntries(
      this.formatter
        .formatToParts(new Date())
        .map((part) => [part.type, part.value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
}
