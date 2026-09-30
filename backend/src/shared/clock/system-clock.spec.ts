import { ConfigService } from '@nestjs/config';
import { SystemClock } from './system-clock';

function clockIn(timeZone: string | undefined): SystemClock {
  return new SystemClock({
    get: (_key: string, fallback: string) => timeZone ?? fallback,
  } as unknown as ConfigService);
}

describe('SystemClock', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('reads today in the configured time zone', () => {
    // 01:30 UTC on Oct 1st is still Sep 30th in São Paulo (UTC-3).
    jest.useFakeTimers().setSystemTime(new Date('2026-10-01T01:30:00Z'));

    expect(clockIn('America/Sao_Paulo').today()).toBe('2026-09-30');
    expect(clockIn('UTC').today()).toBe('2026-10-01');
  });

  it('defaults to São Paulo', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-01T01:30:00Z'));

    expect(clockIn(undefined).today()).toBe('2026-09-30');
  });

  it('refuses an unknown time zone', () => {
    expect(() => clockIn('Mars/Olympus_Mons')).toThrow(RangeError);
  });
});
